import { loadGatewayCredential } from './_runtime-credentials.js';

function nativeConfig() {
  return {
    endpoint: String(process.env.YOYO_NATIVE_INFERENCE_URL || '').replace(/\/$/, ''),
    token: String(process.env.YOYO_NATIVE_INFERENCE_TOKEN || ''),
    model: String(process.env.YOYO_NATIVE_MODEL || 'yoyo-edu-cl'),
  };
}

export function yoyoRuntimeStatus() {
  const native = nativeConfig();
  return {
    architecture: 'YOYO Native Runtime',
    nativeConfigured: Boolean(native.endpoint),
    nativeModel: native.model,
    externalFallbackAllowed: process.env.YOYO_ALLOW_EXTERNAL_FALLBACK !== 'false',
  };
}

async function nativeGenerate({ system, prompt, maxOutputTokens = 8000, temperature = 0.2 }) {
  const config = nativeConfig();
  if (!config.endpoint) throw new Error('YOYO_NATIVE_RUNTIME_NOT_CONFIGURED');
  const response = await fetch(`${config.endpoint}/v1/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(config.token ? { Authorization: `Bearer ${config.token}` } : {}),
    },
    body: JSON.stringify({
      engine: 'YOYO-IA-EDU-CL-001',
      model: config.model,
      system,
      prompt,
      maxOutputTokens,
      temperature,
      dataPolicy: { training: false, retention: 'ephemeral' },
    }),
    signal: AbortSignal.timeout(120_000),
  });
  if (!response.ok) throw new Error(`YOYO_NATIVE_RUNTIME_HTTP_${response.status}`);
  const payload = await response.json();
  if (!payload || typeof payload.text !== 'string') throw new Error('YOYO_NATIVE_RUNTIME_INVALID_RESPONSE');
  return {
    text: payload.text,
    usage: payload.usage || null,
    response: { id: payload.id || null },
    modelRoute: `yoyo-native/${config.model}`,
    runtime: 'native',
  };
}

export async function generateWithYoyoRuntime({ gatewayGenerate, system, prompt, maxOutputTokens, temperature }) {
  const status = yoyoRuntimeStatus();
  if (status.nativeConfigured) {
    try {
      return await nativeGenerate({ system, prompt, maxOutputTokens, temperature });
    } catch (error) {
      if (!status.externalFallbackAllowed) throw error;
      console.error('YOYO Native Runtime failed; using controlled fallback', { message: error.message });
    }
  }
  if (!status.externalFallbackAllowed) throw new Error('YOYO_NATIVE_RUNTIME_REQUIRED');
  const credential = await loadGatewayCredential();
  if (!credential.apiKey && credential.source !== 'vercel_oidc') throw new Error('YOYO_EXTERNAL_FALLBACK_NOT_CONFIGURED');
  const result = await gatewayGenerate(credential);
  return { ...result, runtime: 'external-fallback' };
}
