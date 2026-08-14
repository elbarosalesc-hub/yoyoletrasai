import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLIC_CONFIG } from '../shared/supabase-public-config';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || SUPABASE_PUBLIC_CONFIG.url;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLIC_CONFIG.publishableKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseKey);
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export async function getOwnerContext(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, locale, organization_memberships!inner(role, is_active, organizations(id, name, slug))')
    .eq('id', userId)
    .eq('organization_memberships.is_active', true)
    .single();
  if (error) throw error;
  const membership = data.organization_memberships?.find((item) => item.role === 'platform_admin') || data.organization_memberships?.[0];
  return {
    userId: data.id,
    displayName: data.display_name,
    locale: data.locale,
    role: membership?.role,
    organization: membership?.organizations,
  };
}

export async function getAIEntitlement(userId) {
  if (!supabase || !userId) return null;
  const { data, error } = await supabase
    .from('ai_entitlements')
    .select('credential_id, plan_id, status, period_start, period_end, ai_plans(name, description, model_tier, monthly_ai_requests, monthly_research_requests, monthly_token_limit, max_output_tokens, max_files_per_request, max_file_bytes, max_total_file_bytes, unlimited_file_analysis, allowed_modes)')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing'])
    .single();
  if (error) throw error;
  return {
    credentialId: data.credential_id,
    planId: data.plan_id,
    status: data.status,
    periodStart: data.period_start,
    periodEnd: data.period_end,
    plan: data.ai_plans,
  };
}

export async function getWorkspaceResources(organizationId) {
  if (!supabase || !organizationId) return [];
  const { data, error } = await supabase
    .from('platform_resources')
    .select('resource_key, payload, updated_at')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .limit(1000);
  if (error) throw error;
  return (data || []).map((row) => ({ ...row.payload, id: row.payload?.id || row.resource_key })).filter((resource) => resource.id && resource.title);
}

export async function syncWorkspace({ organizationId, userId, resources, assignments, settings }) {
  if (!supabase) throw new Error('Supabase no está configurado.');
  const resourceRows = resources.map((resource) => ({
    organization_id: organizationId,
    created_by: userId,
    resource_key: resource.id,
    title: resource.title,
    payload: resource,
  }));
  if (resourceRows.length) {
    const { error } = await supabase.from('platform_resources').upsert(resourceRows, { onConflict: 'organization_id,resource_key' });
    if (error) throw error;
  }
  if (assignments.length) {
    const assignmentRows = assignments.map((item) => ({
      organization_id: organizationId,
      created_by: userId,
      local_key: String(item.id),
      resource_payload: item.resource,
      course_label: item.course,
      due_date: item.date,
    }));
    const { error } = await supabase.from('resource_assignments').upsert(assignmentRows, { onConflict: 'organization_id,local_key' });
    if (error) throw error;
  }
  const { error } = await supabase.from('platform_settings').upsert({
    organization_id: organizationId,
    updated_by: userId,
    settings,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'organization_id' });
  if (error) throw error;
}
