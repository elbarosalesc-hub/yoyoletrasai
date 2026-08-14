import crypto from 'node:crypto';

function config() {
  return {
    endpoint: String(process.env.YOYO_STORAGE_ENDPOINT || '').replace(/\/$/, ''),
    bucket: String(process.env.YOYO_STORAGE_BUCKET || 'yoyo-private'),
    accessKey: String(process.env.YOYO_STORAGE_ACCESS_KEY || ''),
    secretKey: String(process.env.YOYO_STORAGE_SECRET_KEY || ''),
    region: String(process.env.YOYO_STORAGE_REGION || 'yoyo-local'),
  };
}

export function yoyoStorageStatus() {
  const value = config();
  return {
    architecture: 'YOYO Storage',
    mode: value.endpoint ? 'self-hosted-object-storage' : 'not-configured',
    configured: Boolean(value.endpoint && value.bucket && value.accessKey && value.secretKey),
    bucket: value.bucket,
    region: value.region,
    ownership: 'platform-controlled',
  };
}

export function storageObjectKey({ organizationId, category = 'resources', filename = 'asset.bin' }) {
  const cleanName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_').slice(-140) || 'asset.bin';
  const digest = crypto.createHash('sha256').update(`${organizationId}:${Date.now()}:${cleanName}:${crypto.randomUUID()}`).digest('hex').slice(0, 24);
  return `${organizationId}/${category}/${new Date().toISOString().slice(0, 10)}/${digest}-${cleanName}`;
}

export function assertPrivateStorageConfigured() {
  const status = yoyoStorageStatus();
  if (!status.configured) throw new Error('YOYO_STORAGE_NOT_CONFIGURED');
  return status;
}

// The transport is intentionally isolated behind this module so the platform can
// run its own S3-compatible object store (for example MinIO/Ceph) without coupling
// pedagogy, AI, user data, or resource metadata to a hyperscaler SDK.
export async function signedStorageRequest({ method = 'GET', objectKey, body, contentType = 'application/octet-stream' }) {
  const value = config();
  assertPrivateStorageConfigured();
  const timestamp = new Date().toISOString();
  const canonical = [method, value.bucket, objectKey, timestamp].join('\n');
  const signature = crypto.createHmac('sha256', value.secretKey).update(canonical).digest('hex');
  const url = `${value.endpoint}/${encodeURIComponent(value.bucket)}/${objectKey.split('/').map(encodeURIComponent).join('/')}`;
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': contentType,
      'X-YOYO-Access-Key': value.accessKey,
      'X-YOYO-Timestamp': timestamp,
      'X-YOYO-Signature': signature,
    },
    body,
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) throw new Error(`YOYO_STORAGE_HTTP_${response.status}`);
  return response;
}
