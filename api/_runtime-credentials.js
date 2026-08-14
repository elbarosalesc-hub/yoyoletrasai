export async function saveGatewayCredential() {
  throw new Error('La rotación cifrada desde el panel está temporalmente deshabilitada. Configura AI_GATEWAY_API_KEY como secreto de servidor en Vercel.');
}

export async function gatewayCredentialStatus() {
  if (process.env.AI_GATEWAY_API_KEY) {
    return { configured: true, source: 'server_environment', lastFour: process.env.AI_GATEWAY_API_KEY.slice(-4) };
  }
  if (process.env.VERCEL_OIDC_TOKEN) return { configured: true, source: 'vercel_oidc', lastFour: null };
  return { configured: false, source: 'not_configured', lastFour: null };
}

export async function loadGatewayCredential() {
  if (process.env.AI_GATEWAY_API_KEY) return { apiKey: process.env.AI_GATEWAY_API_KEY, source: 'server_environment' };
  if (process.env.VERCEL_OIDC_TOKEN) return { apiKey: null, source: 'vercel_oidc' };
  return { apiKey: null, source: 'not_configured' };
}
