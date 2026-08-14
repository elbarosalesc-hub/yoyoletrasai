import { Storage } from '@google-cloud/storage';

let storageClient;

function googleConfig() {
  const privateKey = String(process.env.GOOGLE_CLOUD_PRIVATE_KEY || '').replace(/\\n/g, '\n');
  return {
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || '',
    bucketName: process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '',
    clientEmail: process.env.GOOGLE_CLOUD_CLIENT_EMAIL || '',
    privateKey,
  };
}

export function googleStorageStatus() {
  const config = googleConfig();
  return {
    configured: Boolean(config.projectId && config.bucketName && config.clientEmail && config.privateKey),
    projectId: config.projectId || null,
    bucket: config.bucketName || null,
    location: process.env.GOOGLE_CLOUD_STORAGE_LOCATION || 'southamerica-west1',
  };
}

export function yoyoBucket() {
  const config = googleConfig();
  if (!googleStorageStatus().configured) {
    throw new Error('El almacenamiento privado de Google Cloud aún no tiene credenciales activas.');
  }
  if (!storageClient) {
    storageClient = new Storage({
      projectId: config.projectId,
      credentials: { client_email: config.clientEmail, private_key: config.privateKey },
    });
  }
  return storageClient.bucket(config.bucketName);
}

export async function createUploadSession({ objectPath, contentType, metadata, origin }) {
  const [uploadUrl] = await yoyoBucket().file(objectPath).createResumableUpload({
    origin,
    metadata: { contentType, cacheControl: 'private, no-store', metadata },
    preconditionOpts: { ifGenerationMatch: 0 },
  });
  return uploadUrl;
}

export async function verifyStoredObject(objectPath) {
  const file = yoyoBucket().file(objectPath);
  const [metadata] = await file.getMetadata();
  return {
    size: Number(metadata.size || 0),
    mediaType: metadata.contentType || 'application/octet-stream',
    generation: metadata.generation || null,
    crc32c: metadata.crc32c || null,
  };
}

export async function signedReadUrl(objectPath) {
  const [url] = await yoyoBucket().file(objectPath).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 15 * 60 * 1000,
  });
  return url;
}

export async function removeStoredObject(objectPath) {
  await yoyoBucket().file(objectPath).delete({ ignoreNotFound: true });
}
