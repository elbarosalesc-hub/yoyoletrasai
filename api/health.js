import { YOYO_AI_PUBLIC_CREDENTIAL } from '../shared/yoyo-ai-identity.js';
import { SUPABASE_PUBLIC_CONFIG } from '../shared/supabase-public-config.js';

export default function handler(_request, response) {
  const authentication = process.env.AI_GATEWAY_API_KEY ? 'gateway_key' : process.env.YOYO_CREDENTIAL_ENCRYPTION_KEY ? 'owner_managed_or_pending' : process.env.VERCEL_OIDC_TOKEN ? 'vercel_oidc' : 'not_configured';
  response.status(200).json({
    status: 'ok',
    service: 'YoYoLetrasAI',
    version: '3.6.0',
    environment: 'production',
    aiCredential: { id: YOYO_AI_PUBLIC_CREDENTIAL.credentialId, issuer: YOYO_AI_PUBLIC_CREDENTIAL.issuer, authentication },
    checks: {
      application: 'operational',
      resourcesApi: 'operational',
      yoyoAI: authentication === 'not_configured' ? 'awaiting_server_credential' : 'configured',
      sourceLab: authentication === 'not_configured' ? 'awaiting_server_credential' : 'configured',
      planAuthorization: SUPABASE_PUBLIC_CONFIG.url && SUPABASE_PUBLIC_CONFIG.publishableKey ? 'configured' : 'awaiting_identity_configuration',
    },
    timestamp: new Date().toISOString(),
  });
}
