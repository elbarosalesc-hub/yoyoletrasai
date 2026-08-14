import { z } from 'zod';
import { authorizeOwnerRequest } from '../_owner-auth.js';
import { gatewayCredentialStatus, saveGatewayCredential } from '../_runtime-credentials.js';

const strongPassword = z.string().min(12).max(128)
  .regex(/[a-z]/, 'La contraseña necesita una minúscula.')
  .regex(/[A-Z]/, 'La contraseña necesita una mayúscula.')
  .regex(/[0-9]/, 'La contraseña necesita un número.')
  .regex(/[^A-Za-z0-9]/, 'La contraseña necesita un símbolo.');

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('save_engine_key'), gatewayKey: z.string().trim().min(20).max(500) }),
  z.object({
    action: z.literal('create_account'),
    email: z.string().trim().email().max(180),
    displayName: z.string().trim().min(2).max(120),
    password: strongPassword,
    planId: z.enum(['basico', 'premium']),
    monthlyTokenLimit: z.number().int().min(10000).max(100000000).nullable().default(null),
  }),
  z.object({ action: z.literal('reset_password'), userId: z.string().uuid(), password: strongPassword }),
  z.object({
    action: z.literal('update_account'),
    userId: z.string().uuid(),
    planId: z.enum(['basico', 'premium']),
    monthlyTokenLimit: z.number().int().min(10000).max(100000000).nullable().default(null),
    status: z.enum(['active', 'suspended']).default('active'),
  }),
]);

async function listAccounts(context) {
  const { data: memberships, error: membershipError } = await context.admin
    .from('organization_memberships')
    .select('user_id, role, is_active')
    .eq('organization_id', context.organizationId);
  if (membershipError) throw membershipError;
  const userIds = (memberships || []).map((item) => item.user_id);
  if (!userIds.length) return [];

  const monthStart = new Date();
  monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const [{ data: profileRows, error: profileError }, { data: entitlementRows, error: entitlementError }, { data: usageRows, error: usageError }, authResult] = await Promise.all([
    context.admin.from('profiles').select('id, display_name').in('id', userIds),
    context.admin.from('ai_entitlements').select('user_id, plan_id, status, quota_overrides, ai_plans(name, monthly_token_limit, unlimited_file_analysis)').in('user_id', userIds),
    context.admin.from('ai_usage_events').select('user_id, status, reserved_tokens, total_tokens').in('user_id', userIds).gte('created_at', monthStart.toISOString()),
    context.admin.auth.admin.listUsers({ page: 1, perPage: 200 }),
  ]);
  if (profileError) throw profileError;
  if (entitlementError) throw entitlementError;
  if (usageError) throw usageError;
  if (authResult.error) throw authResult.error;

  const profileById = new Map((profileRows || []).map((item) => [item.id, item]));
  const entitlementById = new Map((entitlementRows || []).map((item) => [item.user_id, item]));
  const userById = new Map((authResult.data.users || []).map((item) => [item.id, item]));
  const usageById = new Map();
  (usageRows || []).forEach((item) => usageById.set(item.user_id, (usageById.get(item.user_id) || 0) + Number(item.status === 'reserved' ? item.reserved_tokens : item.total_tokens)));
  return (memberships || []).map((membership) => {
    const user = userById.get(membership.user_id);
    const entitlement = entitlementById.get(membership.user_id);
    if (!user) return null;
    return {
      userId: user.id,
      email: user.email,
      displayName: profileById.get(user.id)?.display_name || user.email,
      role: membership.role,
      active: membership.is_active,
      lastSignInAt: user.last_sign_in_at,
      planId: entitlement?.plan_id || null,
      planName: entitlement?.ai_plans?.name || null,
      entitlementStatus: entitlement?.status || null,
      monthlyTokenLimit: entitlement?.quota_overrides?.monthlyTokenLimit ?? entitlement?.ai_plans?.monthly_token_limit ?? null,
      monthlyTokenUsed: usageById.get(user.id) || 0,
      unlimitedFiles: Boolean(entitlement?.ai_plans?.unlimited_file_analysis),
    };
  }).filter(Boolean).sort((a, b) => a.email.localeCompare(b.email, 'es'));
}

async function ensureManagedAccount(context, userId) {
  const { data, error } = await context.admin
    .from('organization_memberships')
    .select('user_id')
    .eq('organization_id', context.organizationId)
    .eq('user_id', userId)
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('La cuenta no pertenece a la organización propietaria.');
}

function entitlementRow(context, userId, input) {
  return {
    user_id: userId,
    organization_id: context.organizationId,
    plan_id: input.planId,
    status: input.status || 'active',
    period_start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
    period_end: '2099-01-01T00:00:00.000Z',
    quota_overrides: input.monthlyTokenLimit ? { monthlyTokenLimit: input.monthlyTokenLimit } : {},
    assigned_by: context.user.id,
    updated_at: new Date().toISOString(),
  };
}

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Método no permitido.' });
  const context = await authorizeOwnerRequest(req);
  if (!context.ok) return res.status(context.status).json({ error: context.error });

  try {
    if (req.method === 'GET') {
      const [engine, accounts] = await Promise.all([
        gatewayCredentialStatus(context.admin),
        listAccounts(context),
      ]);
      return res.status(200).json({ engine, accounts });
    }

    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Los datos ingresados no son válidos.' });
    }
    const input = parsed.data;

    if (input.action === 'save_engine_key') {
      const engine = await saveGatewayCredential(context.admin, input.gatewayKey, context.user.id);
      return res.status(200).json({ message: 'Clave privada del motor guardada y cifrada.', engine });
    }

    if (input.action === 'create_account') {
      const { data: created, error: createError } = await context.admin.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { display_name: input.displayName },
        app_metadata: { yoyo_account: true },
      });
      if (createError || !created.user) throw createError || new Error('No fue posible crear la cuenta.');
      try {
        const { error: membershipError } = await context.admin.from('organization_memberships').upsert({
          organization_id: context.organizationId,
          user_id: created.user.id,
          role: 'teacher',
          is_active: true,
        }, { onConflict: 'organization_id,user_id,role' });
        if (membershipError) throw membershipError;
        const { error: entitlementError } = await context.admin.from('ai_entitlements').upsert(
          entitlementRow(context, created.user.id, input),
          { onConflict: 'user_id' },
        );
        if (entitlementError) throw entitlementError;
      } catch (setupError) {
        await context.admin.auth.admin.deleteUser(created.user.id);
        throw setupError;
      }
      return res.status(201).json({ message: `Cuenta ${input.email} creada con plan ${input.planId === 'basico' ? 'Básico' : 'Premium'}.` });
    }

    await ensureManagedAccount(context, input.userId);
    if (input.action === 'reset_password') {
      const { error } = await context.admin.auth.admin.updateUserById(input.userId, { password: input.password });
      if (error) throw error;
      return res.status(200).json({ message: 'Contraseña actualizada.' });
    }

    const { error } = await context.admin.from('ai_entitlements').upsert(
      entitlementRow(context, input.userId, input),
      { onConflict: 'user_id' },
    );
    if (error) throw error;
    return res.status(200).json({ message: 'Plan y límite de tokens actualizados.' });
  } catch (error) {
    console.error('Owner control failed', { message: error.message, code: error.code });
    return res.status(500).json({ error: error.message || 'No fue posible completar la administración.' });
  }
}
