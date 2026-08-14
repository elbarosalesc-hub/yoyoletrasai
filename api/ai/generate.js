import { generateText } from 'ai';
import { createGateway } from '@ai-sdk/gateway';
import { authorizeAIRequest, completeAIRequest, publicAccess, routeForAccess } from '../_ai-access.js';
import { loadGatewayCredential } from '../_runtime-credentials.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const input = {
    mode: ['research', 'sources'].includes(body.mode) ? body.mode : 'creation',
    prompt: String(body.prompt || '').trim().slice(0, 24000),
    objective: String(body.objective || '').trim().slice(0, 4000),
    subject: String(body.subject || '').trim().slice(0, 200),
    level: String(body.level || '').trim().slice(0, 200),
    support: String(body.support || '').trim().slice(0, 4000),
    source: String(body.source || '').trim().slice(0, 12000),
    files: Array.isArray(body.files) ? body.files.slice(0, 20) : [],
    ownerAI: body.ownerAI && typeof body.ownerAI === 'object' ? body.ownerAI : { enabled: false },
  };
  if (!input.prompt) return res.status(400).json({ error: 'Escribe una solicitud para YOYO IA.', code: 'PROMPT_REQUIRED' });

  const access = await authorizeAIRequest(req, input);
  if (!access.ok) return res.status(access.status).json(access.body);
  const route = routeForAccess(access.access);
  const modelRoute = input.mode === 'research' ? route.research : input.mode === 'sources' ? route.sources : route.creation;
  try {
    const credential = await loadGatewayCredential();
    if (!credential.apiKey && credential.source !== 'vercel_oidc') {
      await completeAIRequest(access, { status: 'failed', modelRoute, usage: {}, errorCode: 'AI_NOT_CONFIGURED' });
      return res.status(503).json({ error: 'YOYO IA está esperando una credencial privada del motor.', code: 'AI_NOT_CONFIGURED' });
    }
    const gateway = createGateway(credential.apiKey ? { apiKey: credential.apiKey } : {});
    const system = `Eres YOYO IA, asistente pedagógico para educación chilena. Responde en español claro, útil y aplicable. Prioriza aprendizaje significativo, DUA y apoyos PIE sin reducir el objetivo curricular. Si creas una actividad, incluye objetivo, instrucciones, desarrollo, cierre y evidencia observable. No inventes citas ni fuentes.`;
    const prompt = [`Modo: ${input.mode}`, `Nivel: ${input.level || 'no indicado'}`, `Asignatura: ${input.subject || 'no indicada'}`, `Objetivo: ${input.objective || 'no indicado'}`, `Apoyos: ${input.support || 'no indicados'}`, input.source ? `Fuente de trabajo: ${input.source}` : '', `Solicitud: ${input.prompt}`].filter(Boolean).join('\n');
    const result = await generateText({ model: gateway(modelRoute), system, prompt, maxOutputTokens: Math.min(Number(access.access?.maxOutputTokens || 6000), 12000) });
    await completeAIRequest(access, { status: 'completed', modelRoute, usage: result.usage || {} });
    return res.status(200).json({ mode: input.mode, text: result.text, modelRoute, entitlement: publicAccess(access.access, access.ownerFull), usage: result.usage || null });
  } catch (error) {
    console.error('YOYO IA generation failed', { name: error?.name, message: error?.message });
    await completeAIRequest(access, { status: 'failed', modelRoute, usage: {}, errorCode: 'GENERATION_FAILED' });
    return res.status(502).json({ error: 'YOYO IA no pudo completar la generación en este momento.', code: 'GENERATION_FAILED' });
  }
}
