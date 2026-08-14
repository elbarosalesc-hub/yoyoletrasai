import crypto from 'node:crypto';
import { createAdminClient } from '../_owner-auth.js';
import { runResourceFactoryForOrganization } from '../_resource-factory.js';
import { YOYO_CORE } from '../../shared/yoyo-core.js';

function validCron(req) {
  const expected = process.env.YOYO_AUTOMATION_CRON_TOKEN || process.env.CRON_SECRET || '';
  const header = typeof req.headers?.authorization === 'string' ? req.headers.authorization : '';
  const received = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!expected || !received) return false;
  const left = Buffer.from(expected); const right = Buffer.from(received);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Método no permitido.' });
  if (!validCron(req)) return res.status(401).json({ error: 'Token de automatización inválido.' });
  const admin = createAdminClient();
  const { data: profiles, error } = await admin.from('automation_profiles').select('*')
    .eq('enabled', true).eq('resource_factory_enabled', true).eq('factory_running', false)
    .lte('next_factory_at', new Date().toISOString()).limit(5);
  if (error) return res.status(500).json({ error: 'No fue posible leer la programación de YOYO Core.' });
  const results = [];
  for (const profile of profiles || []) {
    try { results.push(await runResourceFactoryForOrganization({ admin, profile, triggeredBy: 'vercel_cron' })); }
    catch (factoryError) { results.push({ organizationId: profile.organization_id, error: factoryError.message }); }
  }
  return res.status(200).json({ engine: YOYO_CORE.name, due: profiles?.length || 0, results });
}
