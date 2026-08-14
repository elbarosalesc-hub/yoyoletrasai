import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { authorizeAIRequest, completeAIRequest, publicAccess, routeForAccess } from '../_ai-access.js';
import { buildOwnerAIProtocol, normalizeOwnerAISettings } from '../../shared/owner-ai-config.js';
import { YOYO_AI_ENGINE, buildYoyoSystemPrompt } from '../../shared/yoyo-ai-engine.js';
import { generateWithYoyoRuntime, yoyoRuntimeStatus } from '../_yoyo-native-runtime.js';

const GENERATION_MODES = new Set([
  'activity', 'writing', 'assessment', 'guide', 'analysis', 'image', 'report',
  'presentation', 'video', 'summary', 'reading_plan', 'research', 'sources',
]);

function normalizeMode(value) {
  const mode = String(value || '').trim();
  if (mode === 'creation') return 'activity';
  return GENERATION_MODES.has(mode) ? mode : 'activity';
}

function routeForMode(route, mode) {
  if (mode === 'research') return route.research;
  if (mode === 'sources' || mode === 'analysis') return route.sources;
  return route.creation;
}

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const input = {
    mode: normalizeMode(body.mode),
    prompt: String(body.prompt || '').trim().slice(0, 24000),
    objective: String(body.objective || '').trim().slice(0, 4000),
    subject: String(body.subject || '').trim().slice(0, 200),
    level: String(body.level || '').trim().slice(0, 200),
    support: String(body.support || '').trim().slice(0, 4000),
    source: String(body.source || '').trim().slice(0, 12000),
    files: Array.isArray(body.files) ? body.files.slice(0, 100) : [],
    ownerAI: body.ownerAI && typeof body.ownerAI === 'object' ? body.ownerAI : { enabled: false },
  };
  if (!input.prompt) return res.status(400).json({ error: 'Escribe una solicitud para YOYO IA.', code: 'PROMPT_REQUIRED' });

  const access = await authorizeAIRequest(req, input);
  if (!access.ok) return res.status(access.status).json(access.body);
  const route = routeForAccess(access.access);
  const fallbackModelRoute = routeForMode(route, input.mode);

  try {
    const ownerSettings = normalizeOwnerAISettings(input.ownerAI);
    const ownerProtocol = access.ownerFull && ownerSettings.enabled
      ? buildOwnerAIProtocol(ownerSettings.roleIds, ownerSettings.directive)
      : '';
    const system = buildYoyoSystemPrompt({ ownerProtocol, mode: input.mode });
    const prompt = [
      `Motor: ${YOYO_AI_ENGINE.id} v${YOYO_AI_ENGINE.version}`,
      `Modo: ${input.mode}`,
      `Nivel: ${input.level || 'no indicado'}`,
      `Asignatura: ${input.subject || 'no indicada'}`,
      `Objetivo: ${input.objective || 'no indicado'}`,
      `Apoyos: ${input.support || 'no indicados'}`,
      input.source ? `Fuente de trabajo: ${input.source}` : '',
      `Solicitud: ${input.prompt}`,
    ].filter(Boolean).join('\n');

    const planMax = Number(access.access?.limits?.maxOutputTokens || 8000);
    const maxOutputTokens = Math.max(1000, Math.min(planMax, access.ownerFull ? 64000 : 24000));
    const runtimeResult = await generateWithYoyoRuntime({
      system,
      prompt,
      maxOutputTokens,
      temperature: 0.2,
      gatewayGenerate: async (credential) => {
        const gateway = createGateway(credential.apiKey ? { apiKey: credential.apiKey } : {});
        const result = await generateText({
          model: gateway(fallbackModelRoute),
          system,
          prompt,
          maxOutputTokens,
          abortSignal: AbortSignal.timeout(110_000),
          providerOptions: {
            gateway: {
              disallowPromptTraining: true,
              tags: ['yoyo-ia', `mode:${input.mode}`, access.ownerFull ? 'owner-full' : `tier:${access.access?.modelTier || 'essential'}`],
            },
          },
        });
        return { text: result.text, usage: result.usage || null, response: result.response || null, modelRoute: fallbackModelRoute };
      },
    });

    const modelRoute = runtimeResult.modelRoute || fallbackModelRoute;
    await completeAIRequest(access, { status: 'complete', modelRoute, usage: runtimeResult.usage || {} });
    return res.status(200).json({
      engine: YOYO_AI_ENGINE,
      runtime: runtimeResult.runtime,
      runtimeStatus: yoyoRuntimeStatus(),
      mode: input.mode,
      text: runtimeResult.text,
      modelRoute,
      entitlement: publicAccess(access.access, access.ownerFull),
      usage: runtimeResult.usage || null,
    });
  } catch (error) {
    console.error('YOYO IA generation failed', { name: error?.name, message: error?.message });
    const code = error?.message === 'YOYO_NATIVE_RUNTIME_REQUIRED' ? 'NATIVE_RUNTIME_REQUIRED' : 'GENERATION_FAILED';
    await completeAIRequest(access, { status: 'error', modelRoute: fallbackModelRoute, usage: {}, errorCode: code });
    return res.status(502).json({ error: code === 'NATIVE_RUNTIME_REQUIRED' ? 'YOYO Native Runtime está configurado como obligatorio y todavía no está disponible.' : 'YOYO IA no pudo completar la generación en este momento.', code });
  }
}
