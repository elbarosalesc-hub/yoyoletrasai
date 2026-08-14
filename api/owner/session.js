import { authorizeOwnerRequest } from '../_owner-auth.js';

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Método no permitido.' });

  const context = await authorizeOwnerRequest(req);
  if (!context.ok) return res.status(context.status).json({ error: context.error, owner: false });

  try {
    const { data: entitlement, error } = await context.admin
      .from('ai_entitlements')
      .select('plan_id, status, credential_id, ai_plans(name, model_tier, allowed_modes, max_output_tokens, unlimited_file_analysis)')
      .eq('user_id', context.user.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle();
    if (error) throw error;

    const ownerPlan = entitlement?.plan_id === 'propietaria' && entitlement?.ai_plans?.model_tier === 'owner';
    if (!ownerPlan) {
      return res.status(403).json({
        owner: false,
        error: 'La cuenta propietaria existe, pero su plan propietario no está activo.',
      });
    }

    return res.status(200).json({
      owner: true,
      user: {
        id: context.user.id,
        email: context.user.email,
      },
      organizationId: context.organizationId,
      entitlement: {
        planId: entitlement.plan_id,
        status: entitlement.status,
        credentialId: entitlement.credential_id,
        plan: entitlement.ai_plans,
      },
    });
  } catch (error) {
    console.error('Owner session verification failed', { message: error.message });
    return res.status(500).json({ owner: false, error: 'No fue posible verificar el acceso propietario.' });
  }
}
