import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLIC_CONFIG } from '../shared/supabase-public-config.js';
import { isOwnerAccountEmail } from '../shared/owner-ai-config.js';

const ACCESS_MESSAGES = {
  AUTH_REQUIRED: ['Inicia sesión para usar YOYO IA.', 401],
  PLAN_REQUIRED: ['Tu cuenta no tiene un plan de YOYO IA activo.', 403],
  FEATURE_NOT_INCLUDED: ['Esta función no está incluida en tu plan actual.', 403],
  FILE_LIMIT_EXCEEDED: ['Los archivos superan el límite de tu plan.', 413],
  TOKEN_QUOTA_EXCEEDED: ['Alcanzaste la cuota mensual de tokens de tu plan.', 429],
  MONTHLY_QUOTA_EXCEEDED: ['Alcanzaste la cuota mensual de generaciones de tu plan.', 429],
  RESEARCH_QUOTA_EXCEEDED: ['Alcanzaste la cuota mensual de investigaciones de tu plan.', 429],
  OWNER_FULL_REQUIRED: ['IA Full está reservada exclusivamente para la cuenta propietaria verificada.', 403],
};

const ROUTES = {
  essential: {
    creation: 'openai/gpt-5.6-luna',
    research: 'openai/gpt-5.6-terra',
    sources: 'openai/gpt-5.6-terra',
    creationFallbacks: ['openai/gpt-5.6-terra'],
    researchFallbacks: ['openai/gpt-5.6-sol'],
    sourceFallbacks: ['openai/gpt-5.6-sol'],
  },
  advanced: {
    creation: 'openai/gpt-5.6-terra',
    research: 'openai/gpt-5.6-sol',
    sources: 'openai/gpt-5.6-sol',
    creationFallbacks: ['openai/gpt-5.6-sol'],
    researchFallbacks: ['openai/gpt-5.6-terra'],
    sourceFallbacks: ['openai/gpt-5.6-terra'],
  },
  institution: {
    creation: 'openai/gpt-5.6-sol',
    research: 'openai/gpt-5.6-sol',
    sources: 'openai/gpt-5.6-sol',
    creationFallbacks: ['openai/gpt-5.6-terra'],
    researchFallbacks: ['openai/gpt-5.6-terra'],
    sourceFallbacks: ['openai/gpt-5.6-terra'],
  },
  owner: {
    creation: 'openai/gpt-5.6-sol',
    research: 'openai/gpt-5.6-sol',
    sources: 'openai/gpt-5.6-sol',
    creationFallbacks: ['openai/gpt-5.6-terra'],
    researchFallbacks: ['openai/gpt-5.6-terra'],
    sourceFallbacks: ['openai/gpt-5.6-terra'],
  },
};

function serverConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || SUPABASE_PUBLIC_CONFIG.url,
    key: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLIC_CONFIG.publishableKey,
  };
}

function bearerToken(req) {
  const header = req.headers?.authorization;
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return '';
  return header.slice(7).trim();
}

function accessError(code, details = {}) {
  const [message, status] = ACCESS_MESSAGES[code] || ['No fue posible validar el acceso a YOYO IA.', 403];
  return { ok: false, status, body: { error: message, code, plan: details } };
}

export async function authorizeAIRequest(req, input) {
  const config = serverConfig();
  if (!config.url || !config.key) {
    return {
      ok: false,
      status: 503,
      body: { error: 'El servicio de identidad de YOYO IA no está configurado.', code: 'IDENTITY_NOT_CONFIGURED' },
    };
  }

  const token = bearerToken(req);
  if (!token) return accessError('AUTH_REQUIRED');

  const client = createClient(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) return accessError('AUTH_REQUIRED');

  const fileCount = input.mode === 'sources' ? input.files.length : 0;
  const totalFileBytes = input.mode === 'sources' ? input.files.reduce((sum, file) => sum + file.size, 0) : 0;
  const largestFileBytes = input.mode === 'sources' ? input.files.reduce((largest, file) => Math.max(largest, file.size), 0) : 0;
  const textCharacters = [input.prompt, input.objective, input.source, input.support]
    .reduce((sum, value) => sum + String(value || '').length, 0);
  // YOYO Core reserves the retrieval window used by the analysis, not every raw
  // byte kept in the private corpus. Actual provider usage replaces this reserve.
  const corpusRetrievalTokens = input.mode === 'sources' ? Math.min(180_000, Math.ceil(totalFileBytes / 1024)) : 0;
  const estimatedInputTokens = Math.ceil(textCharacters / 4) + corpusRetrievalTokens;
  const estimatedOutputTokens = input.mode === 'research' ? 20_000 : input.mode === 'sources' ? 12_000 : input.mode === 'image' ? 2_000 : 8_000;
  const estimatedTokens = Math.max(1_000, estimatedInputTokens + estimatedOutputTokens);
  const { data: access, error } = await client.rpc('authorize_ai_request', {
    p_mode: input.mode,
    p_file_count: fileCount,
    p_largest_file_bytes: largestFileBytes,
    p_total_file_bytes: totalFileBytes,
    p_estimated_tokens: estimatedTokens,
  });
  if (error) {
    console.error('YOYO IA access authorization failed', { code: error.code });
    return { ok: false, status: 503, body: { error: 'No fue posible verificar tu plan. Intenta nuevamente.', code: 'PLAN_CHECK_FAILED' } };
  }
  if (!access?.allowed) return accessError(access?.code || 'PLAN_REQUIRED', access || {});

  let hasPlatformAdminRole = false;
  if (isOwnerAccountEmail(userData.user.email) && access.planId === 'propietaria' && access.modelTier === 'owner') {
    const { data: membership, error: membershipError } = await client
      .from('organization_memberships')
      .select('id')
      .eq('user_id', userData.user.id)
      .eq('role', 'platform_admin')
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();
    if (membershipError) console.error('YOYO IA owner role verification failed', { code: membershipError.code });
    hasPlatformAdminRole = Boolean(membership);
  }
  const ownerFull = isOwnerAccountEmail(userData.user.email)
    && hasPlatformAdminRole
    && access.planId === 'propietaria'
    && access.modelTier === 'owner';
  if (input.ownerAI?.enabled && !ownerFull) return accessError('OWNER_FULL_REQUIRED');

  return { ok: true, client, user: userData.user, access, ownerFull };
}

export function routeForAccess(access) {
  return ROUTES[access?.modelTier] || ROUTES.essential;
}

export function publicAccess(access, ownerFull = false) {
  return {
    credentialId: access.credentialId,
    planId: access.planId,
    planName: access.planName,
    modelTier: access.modelTier,
    usage: access.usage,
    limits: access.limits,
    ownerFull: Boolean(ownerFull),
  };
}

function safeJson(value) {
  if (!value) return {};
  try { return JSON.parse(JSON.stringify(value)); } catch { return {}; }
}

function summarizeTokenUsage(value) {
  const totals = { inputTokens: 0, outputTokens: 0, totalTokens: 0 };
  const visit = (item) => {
    if (!item || typeof item !== 'object') return;
    const inputTokens = Number(item.inputTokens);
    const outputTokens = Number(item.outputTokens);
    const totalTokens = Number(item.totalTokens);
    if ([inputTokens, outputTokens, totalTokens].some(Number.isFinite)) {
      totals.inputTokens += Number.isFinite(inputTokens) ? Math.max(0, Math.trunc(inputTokens)) : 0;
      totals.outputTokens += Number.isFinite(outputTokens) ? Math.max(0, Math.trunc(outputTokens)) : 0;
      totals.totalTokens += Number.isFinite(totalTokens)
        ? Math.max(0, Math.trunc(totalTokens))
        : Math.max(0, Math.trunc((Number.isFinite(inputTokens) ? inputTokens : 0) + (Number.isFinite(outputTokens) ? outputTokens : 0)));
      return;
    }
    Object.values(item).forEach(visit);
  };
  visit(value);
  return totals;
}

export async function completeAIRequest(context, { status, modelRoute, usage, errorCode = null }) {
  if (!context?.ok || !context.access?.eventId) return false;
  const tokens = summarizeTokenUsage(usage);
  const { data, error } = await context.client.rpc('complete_ai_request', {
    p_event_id: context.access.eventId,
    p_status: status,
    p_model_route: modelRoute || 'unknown',
    p_token_usage: safeJson(usage),
    p_error_code: errorCode,
    p_input_tokens: tokens.inputTokens,
    p_output_tokens: tokens.outputTokens,
    p_total_tokens: tokens.totalTokens,
  });
  if (error) console.error('YOYO IA usage completion failed', { code: error.code });
  return Boolean(data);
}
