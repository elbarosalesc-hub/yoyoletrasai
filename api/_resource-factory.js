import crypto from 'node:crypto';
import { generateText, Output } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { z } from 'zod';
import { loadGatewayCredential } from './_runtime-credentials.js';
import { YOYO_CORE, YOYO_MODULE_BLUEPRINTS, auditGeneratedResource } from '../shared/yoyo-core.js';

const generatedResourceSchema = z.object({
  moduleId: z.enum(YOYO_MODULE_BLUEPRINTS.map((item) => item.id)),
  title: z.string().min(12).max(140),
  level: z.string().min(2).max(80),
  subject: z.string().min(2).max(80),
  skill: z.string().min(3).max(120),
  duration: z.string().min(2).max(60),
  difficulty: z.string().min(2).max(60),
  objective: z.string().min(30).max(500),
  instruction: z.string().min(60).max(1800),
  exercises: z.array(z.string().min(12).max(500)).min(3).max(8),
  supports: z.array(z.string().min(12).max(400)).min(3).max(7),
  evidence: z.array(z.string().min(12).max(400)).min(2).max(6),
  tags: z.array(z.string().min(2).max(40)).min(3).max(8),
  familyBridge: z.string().max(700),
  teacherReview: z.array(z.string().min(8).max(300)).min(2).max(6),
});

function usageJson(value) {
  try { return JSON.parse(JSON.stringify(value || {})); } catch { return {}; }
}

function pickModules(existingPayloads, count) {
  const counts = new Map(YOYO_MODULE_BLUEPRINTS.map((module) => [module.id, 0]));
  existingPayloads.forEach((payload) => {
    if (counts.has(payload?.moduleId)) counts.set(payload.moduleId, counts.get(payload.moduleId) + 1);
  });
  return [...YOYO_MODULE_BLUEPRINTS]
    .sort((a, b) => counts.get(a.id) - counts.get(b.id) || a.id.localeCompare(b.id))
    .slice(0, count);
}

function payloadFor(resource, blueprint, resourceKey, audit) {
  const colors = ['violet', 'blue', 'green', 'rose', 'amber', 'sky', 'mint'];
  return {
    id: resourceKey,
    moduleId: blueprint.id,
    moduleLabel: blueprint.label,
    icon: '✦',
    color: colors[YOYO_MODULE_BLUEPRINTS.findIndex((item) => item.id === blueprint.id) % colors.length],
    kind: 'generated',
    title: resource.title,
    type: blueprint.resourceType,
    level: resource.level,
    subject: resource.subject,
    skill: resource.skill,
    duration: resource.duration,
    difficulty: resource.difficulty,
    objective: resource.objective,
    instruction: resource.instruction,
    exercises: resource.exercises,
    supports: resource.supports,
    evidence: resource.evidence,
    tags: [...new Set([...resource.tags, 'YOYO Original', 'DUA'])],
    familyBridge: resource.familyBridge,
    teacherReview: resource.teacherReview,
    origin: { engine: YOYO_CORE.name, engineVersion: YOYO_CORE.version, generatedAt: new Date().toISOString(), qualityScore: audit.score },
  };
}

export async function runResourceFactoryForOrganization({ admin, profile, triggeredBy = 'system' }) {
  const { data: lock, error: lockError } = await admin.from('automation_profiles')
    .update({ factory_running: true, updated_at: new Date().toISOString() })
    .eq('organization_id', profile.organization_id)
    .eq('factory_running', false)
    .select('*')
    .maybeSingle();
  if (lockError) throw lockError;
  if (!lock) return { skipped: true, reason: 'factory_running' };

  const requestedCount = Math.max(1, Math.min(5, Number(lock.factory_batch_size || 2)));
  const { data: run, error: runError } = await admin.from('resource_factory_runs').insert({
    organization_id: lock.organization_id,
    triggered_by: triggeredBy,
    status: 'running',
    requested_count: requestedCount,
  }).select('*').single();
  if (runError) {
    await admin.from('automation_profiles').update({ factory_running: false }).eq('organization_id', lock.organization_id);
    throw runError;
  }

  try {
    const runtimeCredential = await loadGatewayCredential();
    if (!runtimeCredential.apiKey && runtimeCredential.source !== 'vercel_oidc') throw new Error('YOYO Core no tiene una credencial de motor activa.');
    const gateway = createGateway(runtimeCredential.apiKey ? { apiKey: runtimeCredential.apiKey } : {});
    const { data: existing, error: existingError } = await admin.from('resource_candidates')
      .select('payload').eq('organization_id', lock.organization_id).order('created_at', { ascending: false }).limit(250);
    if (existingError) throw existingError;
    const modules = pickModules((existing || []).map((item) => item.payload), requestedCount);
    let generatedCount = 0;
    let publishedCount = 0;

    const generatedResources = await Promise.all(modules.map(async (blueprint) => {
      const result = await generateText({
        model: gateway(process.env.YOYO_FACTORY_MODEL || 'openai/gpt-5.6-sol'),
        system: `Eres ${YOYO_CORE.name}, motor pedagógico propio de YoYoLetrasAI. Creas recursos originales para educación chilena. Protege a estudiantes, no inventes evidencia, conserva el desafío, aplica DUA y entrega materiales editables que siempre serán revisados profesionalmente.`,
        prompt: `Crea un ${blueprint.resourceType} original para el módulo ${blueprint.label}. Resultado esperado: ${blueprint.outcome}.
Debe poder usarse en educación parvularia o básica de Chile, declarar un objetivo observable, incluir práctica suficiente, evidencia de aprendizaje, tres apoyos DUA que no reduzcan el objetivo, puente familiar cuando corresponda y una lista de revisión docente. moduleId debe ser exactamente "${blueprint.id}". No copies marcas, personajes ni textos de terceros.`,
        output: Output.object({ schema: generatedResourceSchema }),
        maxOutputTokens: 8_000,
        abortSignal: AbortSignal.timeout(90_000),
        providerOptions: { gateway: { models: ['openai/gpt-5.6-terra'], disallowPromptTraining: true, tags: ['yoyo-core', 'resource-factory', `module:${blueprint.id}`] } },
      });
      return { blueprint, result };
    }));

    for (const { blueprint, result } of generatedResources) {
      const resource = result.output;
      const audit = auditGeneratedResource(resource, blueprint);
      const qualityThreshold = Math.max(YOYO_CORE.qualityThreshold, Number(lock.quality_threshold || 0));
      const passed = audit.score >= qualityThreshold;
      const resourceKey = `yoyo-${blueprint.id}-${new Date().toISOString().slice(0, 10)}-${crypto.randomUUID().slice(0, 8)}`;
      const payload = payloadFor(resource, blueprint, resourceKey, audit);
      let publishedResourceId = null;
      const shouldPublish = passed && Boolean(lock.auto_publish_resources);
      if (shouldPublish) {
        const { data: published, error: publishError } = await admin.from('platform_resources').upsert({
          organization_id: lock.organization_id,
          created_by: lock.owner_id,
          resource_key: resourceKey,
          title: resource.title,
          payload,
        }, { onConflict: 'organization_id,resource_key' }).select('id').single();
        if (publishError) throw publishError;
        publishedResourceId = published.id;
        publishedCount += 1;
      }
      const { error: candidateError } = await admin.from('resource_candidates').insert({
        organization_id: lock.organization_id,
        factory_run_id: run.id,
        created_by: lock.owner_id,
        resource_key: resourceKey,
        title: resource.title,
        payload,
        quality_score: audit.score,
        quality_report: { ...audit, threshold: qualityThreshold, engine: YOYO_CORE },
        status: shouldPublish ? 'published' : 'review',
        published_resource_id: publishedResourceId,
        model: process.env.YOYO_FACTORY_MODEL || 'openai/gpt-5.6-sol',
        provider_response_id: result.response?.id || null,
        usage: usageJson(result.usage),
        reviewed_at: shouldPublish ? new Date().toISOString() : null,
      });
      if (candidateError) throw candidateError;
      generatedCount += 1;
    }

    const completedAt = new Date();
    const nextFactoryAt = new Date(completedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    await Promise.all([
      admin.from('resource_factory_runs').update({ status: 'completed', generated_count: generatedCount, published_count: publishedCount, completed_at: completedAt.toISOString() }).eq('id', run.id),
      admin.from('automation_profiles').update({ factory_running: false, last_factory_at: completedAt.toISOString(), next_factory_at: nextFactoryAt.toISOString(), updated_at: completedAt.toISOString() }).eq('organization_id', lock.organization_id),
    ]);
    return { runId: run.id, generatedCount, publishedCount, modules: modules.map((module) => module.label) };
  } catch (error) {
    await Promise.all([
      admin.from('resource_factory_runs').update({ status: 'failed', error_message: String(error.message || error).slice(0, 1000), completed_at: new Date().toISOString() }).eq('id', run.id),
      admin.from('automation_profiles').update({ factory_running: false, updated_at: new Date().toISOString() }).eq('organization_id', lock.organization_id),
    ]);
    throw error;
  }
}
