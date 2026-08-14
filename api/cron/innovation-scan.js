import crypto from 'node:crypto';
import { createAdminClient } from '../_owner-auth.js';

const SOURCES = [
  { id: 'mineduc-curriculum', name: 'Currículum Nacional de Chile', category: 'Currículum chileno', url: 'https://www.curriculumnacional.cl/' },
  { id: 'unesco-education', name: 'UNESCO Educación', category: 'Educación', url: 'https://www.unesco.org/es/education' },
  { id: 'w3c-accessibility', name: 'W3C WAI', category: 'Accesibilidad', url: 'https://www.w3.org/WAI/' },
  { id: 'openai-files', name: 'OpenAI File Uploads FAQ', category: 'IA y archivos', url: 'https://help.openai.com/en/articles/8555545-file-uploads-faq' },
  { id: 'gemini-files', name: 'Gemini file uploads', category: 'IA y archivos', url: 'https://support.google.com/gemini/answer/14903178' },
  { id: 'claude-files', name: 'Claude file uploads', category: 'IA y archivos', url: 'https://support.claude.com/en/articles/8241126-upload-files-to-claude' },
  { id: 'perplexity-files', name: 'Perplexity file uploads', category: 'IA y archivos', url: 'https://www.perplexity.ai/help-center/en/articles/10354807-file-uploads' },
  { id: 'google-cloud-storage', name: 'Google Cloud Storage', category: 'Infraestructura', url: 'https://cloud.google.com/storage/docs/resumable-uploads' },
];

function validCron(req) {
  const expected = process.env.YOYO_AUTOMATION_CRON_TOKEN || process.env.CRON_SECRET || '';
  const header = typeof req.headers?.authorization === 'string' ? req.headers.authorization : '';
  const received = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!expected || !received) return false;
  const left = Buffer.from(expected); const right = Buffer.from(received);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cleanText(html) {
  return String(html || '').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim().slice(0, 1800);
}

async function snapshotSource(admin, profile, scanId, source) {
  try {
    const response = await fetch(source.url, { headers: { 'User-Agent': 'YoYoLetrasAI-Innovation-Radar/3.6 (+https://yoyoletrasai.vercel.app)' }, signal: AbortSignal.timeout(15_000), redirect: 'follow' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const excerpt = cleanText(await response.text());
    const lastModified = response.headers.get('last-modified') || response.headers.get('etag') || null;
    const fingerprint = crypto.createHash('sha256').update(`${lastModified || ''}\n${excerpt}`).digest('hex');
    const { data: previous } = await admin.from('innovation_source_snapshots').select('fingerprint')
      .eq('organization_id', profile.organization_id).eq('source_id', source.id)
      .order('fetched_at', { ascending: false }).limit(1).maybeSingle();
    const changed = Boolean(previous && previous.fingerprint !== fingerprint);
    await admin.from('innovation_source_snapshots').insert({
      organization_id: profile.organization_id,
      scan_id: scanId,
      source_id: source.id,
      source_name: source.name,
      category: source.category,
      source_url: source.url,
      status: 'ok',
      fingerprint,
      excerpt,
      last_modified: lastModified,
      fetched_at: new Date().toISOString(),
    });
    if (changed) {
      await admin.from('innovation_findings').insert({
        organization_id: profile.organization_id,
        scan_id: scanId,
        category: source.category,
        title: `Cambio detectado en ${source.name}`,
        source_name: source.name,
        source_url: source.url,
        evidence: 'La huella verificable de la fuente oficial cambió desde el control semestral anterior.',
        comparison: 'YOYO Core marcó la diferencia sin asumir su significado pedagógico.',
        recommendation: 'Revisar la fuente, contrastar el cambio y actualizar criterios o recursos sólo si la evidencia lo justifica.',
        expected_impact: 'Mantener la plataforma alineada con información vigente y verificable.',
        novelty_score: 70,
        pedagogical_score: 80,
        accessibility_score: 75,
        risk_score: 20,
        score: 76,
        can_generate_resource: false,
        status: 'detected',
      });
    }
    return { available: true, changed };
  } catch (error) {
    await admin.from('innovation_source_snapshots').insert({
      organization_id: profile.organization_id,
      scan_id: scanId,
      source_id: source.id,
      source_name: source.name,
      category: source.category,
      source_url: source.url,
      status: 'unavailable',
      fingerprint: crypto.createHash('sha256').update(`unavailable:${source.id}:${new Date().toISOString().slice(0, 10)}`).digest('hex'),
      excerpt: '',
      error_message: String(error.message || error).slice(0, 500),
      fetched_at: new Date().toISOString(),
    });
    return { available: false, changed: false };
  }
}

async function scanProfile(admin, profile) {
  const { data: lock } = await admin.from('automation_profiles').update({ scan_running: true, updated_at: new Date().toISOString() })
    .eq('organization_id', profile.organization_id).eq('scan_running', false).select('*').maybeSingle();
  if (!lock) return { skipped: true };
  const { data: scan, error } = await admin.from('innovation_scans').insert({ organization_id: lock.organization_id, triggered_by: 'vercel_cron', status: 'running', sources_checked: SOURCES.length }).select('id').single();
  if (error) throw error;
  try {
    const results = [];
    for (const source of SOURCES) results.push(await snapshotSource(admin, lock, scan.id, source));
    const available = results.filter((item) => item.available).length;
    const findings = results.filter((item) => item.changed).length;
    const completedAt = new Date();
    const nextScanAt = new Date(completedAt); nextScanAt.setUTCMonth(nextScanAt.getUTCMonth() + 6);
    await Promise.all([
      admin.from('innovation_scans').update({ status: 'completed', executive_summary: `${available} de ${SOURCES.length} fuentes disponibles; ${findings} cambios requieren revisión.`, sources_available: available, findings_count: findings, completed_at: completedAt.toISOString() }).eq('id', scan.id),
      admin.from('automation_profiles').update({ scan_running: false, last_scan_at: completedAt.toISOString(), next_scan_at: nextScanAt.toISOString(), updated_at: completedAt.toISOString() }).eq('organization_id', lock.organization_id),
    ]);
    return { scanId: scan.id, available, findings, nextScanAt: nextScanAt.toISOString() };
  } catch (scanError) {
    await Promise.all([
      admin.from('innovation_scans').update({ status: 'failed', error_message: String(scanError.message || scanError).slice(0, 1000), completed_at: new Date().toISOString() }).eq('id', scan.id),
      admin.from('automation_profiles').update({ scan_running: false, updated_at: new Date().toISOString() }).eq('organization_id', lock.organization_id),
    ]);
    throw scanError;
  }
}

export default async function handler(req, res) {
  res.setHeader?.('Cache-Control', 'no-store');
  if (!['GET', 'POST'].includes(req.method)) return res.status(405).json({ error: 'Método no permitido.' });
  if (!validCron(req)) return res.status(401).json({ error: 'Token de automatización inválido.' });
  const admin = createAdminClient();
  const { data: profiles, error } = await admin.from('automation_profiles').select('*')
    .eq('enabled', true).eq('scan_running', false).lte('next_scan_at', new Date().toISOString()).limit(5);
  if (error) return res.status(500).json({ error: 'No fue posible leer el radar semestral.' });
  const results = [];
  for (const profile of profiles || []) {
    try { results.push(await scanProfile(admin, profile)); }
    catch (scanError) { results.push({ organizationId: profile.organization_id, error: scanError.message }); }
  }
  return res.status(200).json({ cadenceMonths: 6, sources: SOURCES.length, results });
}
