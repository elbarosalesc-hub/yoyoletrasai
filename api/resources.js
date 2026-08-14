import crypto from 'node:crypto';
import { resources } from '../src/data.js';

const publicFields = [
  'id',
  'title',
  'type',
  'level',
  'subject',
  'skill',
  'duration',
  'difficulty',
  'objective',
  'tags',
];

function publicPayload() {
  const publicResources = resources.map((resource) =>
    Object.fromEntries(publicFields.map((field) => [field, resource[field]])),
  );
  const version = crypto
    .createHash('sha256')
    .update(JSON.stringify(publicResources))
    .digest('hex')
    .slice(0, 16);
  return { status: 'ok', version, count: publicResources.length, resources: publicResources };
}

export default function handler(request, response) {
  const payload = publicPayload();
  const etag = `\"yoyo-resources-${payload.version}\"`;
  response.setHeader?.('ETag', etag);
  response.setHeader?.('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400');
  response.setHeader?.('Vary', 'Accept-Encoding');
  if (request.headers?.['if-none-match'] === etag) return response.status(304).end();
  return response.status(200).json(payload);
}
