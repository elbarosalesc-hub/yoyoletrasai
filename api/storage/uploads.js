import crypto from 'node:crypto';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_PUBLIC_CONFIG } from '../../shared/supabase-public-config.js';
import { createAdminClient } from '../_owner-auth.js';
import { createUploadSession, googleStorageStatus, removeStoredObject, verifyStoredObject } from '../_google-storage.js';

const ALLOWED_MEDIA_TYPES = new Set([
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/rtf', 'application/vnd.oasis.opendocument.text', 'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation', 'application/vnd.oasis.opendocument.presentation',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet', 'application/json', 'application/xml',
  'text/plain', 'text/markdown', 'text/csv', 'text/tab-separated-values', 'text/html', 'text/xml',
  'text/javascript', 'application/javascript', 'application/typescript', 'text/typescript', 'text/x-python',
  'application/sql', 'text/x-sql', 'application/yaml', 'text/yaml', 'text/x-yaml',
  'image/png', 'image/jpeg', 'image/webp', 'image/gif',
]);

const requestSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('initiate'), name: z.string().trim().min(1).max(160), mediaType: z.string().refine((value) => ALLOWED_MEDIA_TYPES.has(value)), size: z.number().int().min(1).max(2_362_232_832) }),
  z.object({ action: z.literal('complete'), fileId: z.string().uuid() }),
  z.object({ action: z.literal('delete'), fileId: z.string().uuid() }),
]);

function bearerToken(req) {
  const header = req.headers?.authorization;
  return typeof header === 'string' && header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

function publicConfig() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || SUPABASE_PUBLIC_CONFIG.url,
    key: process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || SUPABASE_PUBLIC_CONFIG.publishableKey,
  };
}

async function authorize(req) {
  const token = bearerToken(req);
  const config = publicConfig();
  if (!token || !config.url || !config.key) throw Object.assign(new Error('Inicia sesión para gestionar archivos.'), { status: 401 });
  const client = createClient(config.url, config.key, { auth: { persistSession: false, autoRefreshToken: false }, global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) throw Object.assign(new Error('La sesión no es válida.'), { status: 401 });
  const admin = createAdminClient();
  const { data: entitlement, error: entitlementError } = await admin
    .from('ai_entitlements')
    .select('organization_id, plan_id, status, period_start, period_end, ai_plans(max_files_per_request, max_file_bytes, max_total_file_bytes, unlimited_file_analysis)')
    .eq('user_id', data.user.id)
    .in('status', ['active', 'trialing'])
    .lte('period_start', new Date().toISOString())
    .gt('period_end', new Date().toISOString())
    .limit(1)
    .maybeSingle();
  if (entitlementError || !entitlement?.ai_plans) throw Object.assign(new Error('Tu cuenta no tiene un plan activo.'), { status: 403 });
  return { user: data.user, admin, entitlement };
}

function safeName(value) {
  return value.normalize('NFKD').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '').slice(-120) || 'archivo';
}

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido.' });
  const parsed = requestSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message || 'Solicitud de archivo inválida.' });

  try {
    const context = await authorize(req);
    const input = parsed.data;
    const plan = context.entitlement.ai_plans;

    if (input.action === 'initiate') {
      if (!googleStorageStatus().configured) return res.status(503).json({ error: 'Google Cloud Storage está preparado en el código, pero falta activar las credenciales privadas del proyecto.' });
      if (input.size > Number(plan.max_file_bytes || 0)) return res.status(413).json({ error: 'El archivo supera el tamaño permitido por tu plan.' });
      const fileId = crypto.randomUUID();
      const objectPath = `${context.entitlement.organization_id}/${context.user.id}/${fileId}-${safeName(input.name)}`;
      const { error: insertError } = await context.admin.from('ai_source_files').insert({
        id: fileId,
        organization_id: context.entitlement.organization_id,
        user_id: context.user.id,
        plan_id: context.entitlement.plan_id,
        storage_provider: 'google_cloud_storage',
        object_path: objectPath,
        file_name: input.name,
        media_type: input.mediaType,
        expected_bytes: input.size,
        status: 'uploading',
      });
      if (insertError) throw insertError;
      try {
        const uploadUrl = await createUploadSession({
          objectPath,
          contentType: input.mediaType,
          origin: req.headers?.origin || undefined,
          metadata: { yoyoFileId: fileId, yoyoUserId: context.user.id, yoyoOrganizationId: context.entitlement.organization_id },
        });
        return res.status(201).json({ fileId, uploadUrl, chunkBytes: 8 * 1024 * 1024 });
      } catch (error) {
        await context.admin.from('ai_source_files').delete().eq('id', fileId);
        throw error;
      }
    }

    const { data: stored, error: storedError } = await context.admin.from('ai_source_files')
      .select('id, object_path, file_name, media_type, expected_bytes, status')
      .eq('id', input.fileId).eq('user_id', context.user.id).limit(1).maybeSingle();
    if (storedError || !stored) return res.status(404).json({ error: 'No se encontró el archivo en tu espacio privado.' });

    if (input.action === 'delete') {
      await removeStoredObject(stored.object_path);
      await context.admin.from('ai_source_files').delete().eq('id', stored.id).eq('user_id', context.user.id);
      return res.status(200).json({ removed: true });
    }

    const verified = await verifyStoredObject(stored.object_path);
    if (verified.size !== Number(stored.expected_bytes) || verified.mediaType !== stored.media_type) {
      await removeStoredObject(stored.object_path);
      await context.admin.from('ai_source_files').update({ status: 'failed', error_message: 'La verificación de tamaño o formato no coincidió.' }).eq('id', stored.id);
      return res.status(422).json({ error: 'La carga no superó la verificación de integridad.' });
    }
    const { error: updateError } = await context.admin.from('ai_source_files').update({
      actual_bytes: verified.size,
      generation: verified.generation,
      checksum_crc32c: verified.crc32c,
      status: 'ready',
      uploaded_at: new Date().toISOString(),
      error_message: null,
    }).eq('id', stored.id);
    if (updateError) throw updateError;
    return res.status(200).json({
      file: { fileId: stored.id, name: stored.file_name, mediaType: stored.media_type, size: verified.size, storageProvider: 'gcs', storagePath: stored.object_path },
    });
  } catch (error) {
    console.error('Google file operation failed', { code: error.code, message: error.message });
    return res.status(error.status || 500).json({ error: error.message || 'No fue posible completar la operación de archivo.' });
  }
}
