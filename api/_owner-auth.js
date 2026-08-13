import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLIC_CONFIG } from '../shared/supabase-public-config.js';
import { isOwnerAccountEmail } from '../shared/owner-ai-config.js';

function serverConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || SUPABASE_PUBLIC_CONFIG.url,
    publishableKey: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLIC_CONFIG.publishableKey,
    secretKey: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  };
}

function bearerToken(req) {
  const header = req.headers?.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

export function createAdminClient() {
  const config = serverConfig();
  if (!config.url || !config.secretKey) throw new Error('La administración segura de Supabase no está configurada.');
  return createClient(config.url, config.secretKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
}

export async function authorizeOwnerRequest(req) {
  const config = serverConfig();
  const token = bearerToken(req);
  if (!token || !config.url || !config.publishableKey) return { ok: false, status: 401, error: 'Inicia sesión como propietaria para continuar.' };
  const userClient = createClient(config.url, config.publishableKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await userClient.auth.getUser(token);
  if (userError || !userData.user || !isOwnerAccountEmail(userData.user.email)) return { ok: false, status: 403, error: 'Esta operación está reservada a la propietaria verificada.' };
  const { data: membership, error: membershipError } = await userClient.from('organization_memberships').select('organization_id, role, is_active').eq('user_id', userData.user.id).eq('role', 'platform_admin').eq('is_active', true).limit(1).maybeSingle();
  if (membershipError || !membership) return { ok: false, status: 403, error: 'El rol de superadministradora no está activo.' };
  try { return { ok: true, user: userData.user, organizationId: membership.organization_id, admin: createAdminClient() }; }
  catch (error) { return { ok: false, status: 503, error: error.message }; }
}
