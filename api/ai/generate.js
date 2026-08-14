import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { authorizeAIRequest, completeAIRequest, publicAccess, routeForAccess } from '../_ai-access.js';
import { loadGatewayCredential } from '../_runtime-credentials.js';
import { buildOwnerAIProtocol, normalizeOwnerAISettings } from '../../shared/owner-ai-config.js';
import { YOYO_AI_ENGINE, buildYoyoSystemPrompt } from '../../shared/yoyo-ai-engine.js';

const GENERATION_MODES = new Set(['activity', 'image', 'report', 'presentation', 'video', 'summary', 'reading_plan', 'research', 'sources']);

function normalizeMode(value) {
  const mode = String(value || '').trim();
  if (mode === 'creation') return 'activity';
  return GENERATION_MODES.has(mode) ? mode : 'activity';
}

function routeForMode(route, mode) {
  if (mode === 'research') return route.research;
  if (mode === 'sources') return route.sources;
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
  const modelRoute = routeForMode(route, input.mode);

  try {
    const credential = await loadGatewayCredential();
    if (!credential.apiKey && credential.source !== 'vercel_oidc') {
      await completeAIRequest(access, { status: 'error', modelRoute, usage: {}, errorCode: 'AI_NOT_CONFIGURED' });
      return res.status(503).json({ error: 'YOYO IA está esperando una credencial privada del motor.', code: 'AI_NOT_CONFIGURED' });
    }

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

    const gateway = createGateway(credential.apiKey ? { apiKey: credential.apiKey } : {});
    const planMax = Number(access.access?.limits?.maxOutputTokens || 8000);
    const maxOutputTokens = Math.max(1000, Math.min(planMax, access.ownerFull ? 64000 : 24000));
    const result = await generateText({
      model: gateway(modelRoute),
      system,
      prompt,
      maxOutputTokens,
      abortSignal: AbortSignal.timeout(110_000),
      providerOptions: { gateway: { disallowPromptTraining: true, tags: ['yoyo-ia', `mode:${input.mode}`, access.ownerFull ? 'owner-full' : `tier:${access.access?.modelTier || 'essential'}`] } },
    });

    await completeAIRequest(access, { status: 'complete', modelRoute, usage: result.usage || {} });
    return res.status(200).json({
      engine: YOYO_AI_ENGINE,
      mode: input.mode,
      text: result.text,
      modelRoute,
      entitlement: publicAccess(access.access, access.ownerFull),
      usage: result.usage || null,
    });
  } catch (error) {
    console.error('YOYO IA generation failed', { name: error?.name, message: error?.message });
    await completeAIRequest(access, { status: 'error', modelRoute, usage: {}, errorCode: 'GENERATION_FAILED' });
    return res.status(502).json({ error: 'YOYO IA no pudo completar la generación en este momento.', code: 'GENERATION_FAILED' });
  }
}
