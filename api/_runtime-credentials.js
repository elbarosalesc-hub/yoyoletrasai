import crypto from 'node:crypto';
import { createAdminClient } from './_owner-auth.js';

const SECRET_ID = 'yoyo_ai_gateway';

function encryptionMaterial() {
  const raw = process.env.YOYO_CREDENTIAL_ENCRYPTION_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!raw) throw new Error('No existe una clave de cifrado de servidor para proteger la credencial de YOYO IA.');
  return crypto.createHash('sha256').update(`yoyo-credential-v1:${raw}`).digest();
}

function encryptSecret(value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionMaterial(), iv);
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: authTag.toString('base64'),
    fingerprint: crypto.createHash('sha256').update(value).digest('hex').slice(0, 12),
    lastFour: value.slice(-4),
  };
}

function decryptSecret(row) {
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionMaterial(), Buffer.from(row.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(row.auth_tag, 'base64'));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(row.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return plaintext.toString('utf8');
}

async function loadStoredRow(admin = createAdminClient()) {
  const { data, error } = await admin
    .from('platform_secret_store')
    .select('id, ciphertext, iv, auth_tag, fingerprint, last_four, updated_at')
    .eq('id', SECRET_ID)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function saveGatewayCredential(admin, gatewayKey, configuredBy) {
  const value = String(gatewayKey || '').trim();
  if (value.length < 20) throw new Error('La clave privada del motor no es válida.');
  const encrypted = encryptSecret(value);
  const { error } = await admin.from('platform_secret_store').upsert({
    id: SECRET_ID,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.iv,
    auth_tag: encrypted.authTag,
    fingerprint: encrypted.fingerprint,
    last_four: encrypted.lastFour,
    configured_by: configuredBy || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'id' });
  if (error) throw error;
  return {
    configured: true,
    source: 'encrypted_owner_store',
    fingerprint: encrypted.fingerprint,
    lastFour: encrypted.lastFour,
  };
}

export async function gatewayCredentialStatus(admin = null) {
  if (process.env.AI_GATEWAY_API_KEY) {
    return { configured: true, source: 'server_environment', lastFour: process.env.AI_GATEWAY_API_KEY.slice(-4) };
  }
  try {
    const row = await loadStoredRow(admin || createAdminClient());
    if (row) return { configured: true, source: 'encrypted_owner_store', fingerprint: row.fingerprint, lastFour: row.last_four, updatedAt: row.updated_at };
  } catch (error) {
    console.error('Unable to read YOYO encrypted credential status', { message: error.message });
  }
  if (process.env.VERCEL_OIDC_TOKEN) return { configured: true, source: 'vercel_oidc', lastFour: null };
  return { configured: false, source: 'not_configured', lastFour: null };
}

export async function loadGatewayCredential() {
  if (process.env.AI_GATEWAY_API_KEY) return { apiKey: process.env.AI_GATEWAY_API_KEY, source: 'server_environment' };
  try {
    const row = await loadStoredRow();
    if (row) return { apiKey: decryptSecret(row), source: 'encrypted_owner_store', fingerprint: row.fingerprint };
  } catch (error) {
    console.error('Unable to load YOYO encrypted credential', { message: error.message });
  }
  if (process.env.VERCEL_OIDC_TOKEN) return { apiKey: null, source: 'vercel_oidc' };
  return { apiKey: null, source: 'not_configured' };
}
