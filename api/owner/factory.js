import { z } from 'zod';
import { authorizeOwnerRequest } from '../_owner-auth.js';
import { googleStorageStatus } from '../_google-storage.js';
import { yoyoStorageStatus } from '../_yoyo-storage.js';
import { yoyoRuntimeStatus } from '../_yoyo-native-runtime.js';
import { runResourceFactoryForOrganization } from '../_resource-factory.js';
import { YOYO_CORE, YOYO_MODULE_BLUEPRINTS } from '../../shared/yoyo-core.js';
import { benchmarkCoverage } from '../../shared/yoyo-capability-benchmark.js';
import { OWNER_PLATFORM_PROFILE, ownerProfileChecklist } from '../../shared/owner-platform-config.js';

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('run_now') }),
  z.object({ action: z.literal('update_profile'), enabled: z.boolean(), resourceFactoryEnabled: z.boolean(), autoPublish: z.boolean(), batchSize: z.number().int().min(1).max(5), qualityThreshold: z.number().int().min(90).max(98) }),
  z.object({ action: z.literal('review_candidate'), candidateId: z.string().uuid(), decision: z.enum(['publish', 'dismiss']) }),
]);

async function dashboard(context) {
  const [profileResult, runsResult, candidatesResult, findingsResult] = await Promise.all([
    context.admin.from('automation_profiles').select('*').eq('organization_id', context.organizationId).single(),
    context.admin.from('resource_factory_runs').select('*').eq('organization_id', context.organizationId).order('created_at', { ascending: false }).limit(12),
    context.admin.from('resource_candidates').select('*').eq('organization_id', context.organizationId).order('created_at', { ascending: false }).limit(40),
    context.admin.from('innovation_findings').select('*').eq('organization_id', context.organizationId).order('created_at', { ascending: false }).limit(20),
  ]);
  if (profileResult.error) throw profileResult.error;
  if (runsResult.error) throw runsResult.error;
  if (candidatesResult.error) throw candidatesResult.error;
  if (findingsResult.error) throw findingsResult.error;

  const runtime = yoyoRuntimeStatus();
  const storage = yoyoStorageStatus();
  const coverage = benchmarkCoverage();
  const checklist = ownerProfileChecklist({ runtime, storage, coverage });
  return {
    engine: YOYO_CORE,
    modules: YOYO_MODULE_BLUEPRINTS,
    storage,
    legacyStorage: googleStorageStatus(),
    runtime,
    coverage,
    ownerProfile: OWNER_PLATFORM_PROFILE,
    checklist,
    profile: profileResult.data,
    runs: runsResult.data || [],
    candidates: candidatesResult.data || [],
    findings: findingsResult.data || [],
  };
}

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Método no permitido.' });
  const context = await authorizeOwnerRequest(req);
  if (!context.ok) return res.status(context.status).json({ error: context.error });
  try {
    if (req.method === 'GET') return res.status(200).json(await dashboard(context));
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Configuración inválida.' });
    const input = parsed.data;
    if (input.action === 'update_profile') {
      const { error } = await context.admin.from('automation_profiles').update({
        enabled: input.enabled,
        resource_factory_enabled: input.resourceFactoryEnabled,
        auto_publish_resources: input.autoPublish,
        factory_batch_size: input.batchSize,
        quality_threshold: input.qualityThreshold,
        updated_by: context.user.id,
        updated_at: new Date().toISOString(),
      }).eq('organization_id', context.organizationId);
      if (error) throw error;
      return res.status(200).json({ message: 'Configuración de YOYO Core actualizada.', ...(await dashboard(context)) });
    }
    if (input.action === 'run_now') {
      const { data: profile, error } = await context.admin.from('automation_profiles').select('*').eq('organization_id', context.organizationId).single();
      if (error) throw error;
      const result = await runResourceFactoryForOrganization({ admin: context.admin, profile, triggeredBy: 'owner_manual' });
      return res.status(200).json({ message: 'Ciclo manual completado.', result, ...(await dashboard(context)) });
    }
    const { data: candidate, error: candidateError } = await context.admin.from('resource_candidates').select('*')
      .eq('id', input.candidateId).eq('organization_id', context.organizationId).single();
    if (candidateError) throw candidateError;
    if (input.decision === 'dismiss') {
      const { error } = await context.admin.from('resource_candidates').update({ status: 'dismissed', reviewed_at: new Date().toISOString() }).eq('id', candidate.id);
      if (error) throw error;
    } else {
      const { data: published, error } = await context.admin.from('platform_resources').upsert({ organization_id: context.organizationId, created_by: context.user.id, resource_key: candidate.resource_key, title: candidate.title, payload: candidate.payload }, { onConflict: 'organization_id,resource_key' }).select('id').single();
      if (error) throw error;
      await context.admin.from('resource_candidates').update({ status: 'published', published_resource_id: published.id, reviewed_at: new Date().toISOString() }).eq('id', candidate.id);
    }
    return res.status(200).json({ message: input.decision === 'publish' ? 'Recurso publicado.' : 'Borrador descartado.', ...(await dashboard(context)) });
  } catch (error) {
    console.error('Owner factory failed', { code: error.code, message: error.message });
    return res.status(500).json({ error: error.message || 'No fue posible completar la operación de YOYO Core.' });
  }
}
