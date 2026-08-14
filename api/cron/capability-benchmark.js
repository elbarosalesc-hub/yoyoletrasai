import crypto from 'node:crypto';
import { createAdminClient } from '../_owner-auth.js';
import { COMPETITOR_BASELINES, YOYO_IMPLEMENTED_CAPABILITIES, benchmarkCoverage, competitorGap, YOYO_SUPERIORITY_TARGET } from '../../shared/yoyo-capability-benchmark.js';

function validCron(req) {
  const expected = process.env.YOYO_AUTOMATION_CRON_TOKEN || process.env.CRON_SECRET || '';
  const header = typeof req.headers?.authorization === 'string' ? req.headers.authorization : '';
  const received = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!expected || !received) return false;
  const left = Buffer.from(expected); const right = Buffer.from(received);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function cleanText(html) {
  return String(html || '').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().slice(0,6000);
}

async function fetchSnapshot(sourceUrl) {
  const response = await fetch(sourceUrl, { headers:{'User-Agent':'YOYO-IA-Capability-Lab/3.6'}, redirect:'follow', signal:AbortSignal.timeout(20_000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = cleanText(await response.text());
  const fingerprint = crypto.createHash('sha256').update(text).digest('hex');
  return { sourceUrl, fingerprint, excerpt:text.slice(0,1800), fetchedAt:new Date().toISOString() };
}

async function saveFinding(admin, organizationId, finding) {
  const { error } = await admin.from('innovation_findings').insert({
    organization_id: organizationId,
    category: 'Benchmark de IA',
    title: finding.title,
    source_name: finding.sourceName,
    source_url: finding.sourceUrl,
    evidence: finding.evidence,
    comparison: finding.comparison,
    recommendation: finding.recommendation,
    expected_impact: finding.expectedImpact,
    novelty_score: finding.noveltyScore,
    pedagogical_score: finding.pedagogicalScore,
    accessibility_score: finding.accessibilityScore,
    risk_score: finding.riskScore,
    score: finding.score,
    can_generate_resource: false,
    status: 'detected',
  });
  if (error) throw error;
}

async function benchmarkProfile(admin, profile) {
  const coverage = benchmarkCoverage(YOYO_IMPLEMENTED_CAPABILITIES);
  const gaps = COMPETITOR_BASELINES.map(competitorGap);
  const snapshots = [];
  for (const competitor of COMPETITOR_BASELINES) {
    for (const sourceUrl of competitor.officialSources) {
      try {
        const snapshot = await fetchSnapshot(sourceUrl);
        snapshots.push({ competitor:competitor.id, ...snapshot });
        const sourceId = `benchmark-${competitor.id}-${crypto.createHash('sha1').update(sourceUrl).digest('hex').slice(0,10)}`;
        const { data: previous } = await admin.from('innovation_source_snapshots').select('fingerprint').eq('organization_id',profile.organization_id).eq('source_id',sourceId).order('fetched_at',{ascending:false}).limit(1).maybeSingle();
        await admin.from('innovation_source_snapshots').insert({ organization_id:profile.organization_id, source_id:sourceId, source_name:competitor.label, category:'Benchmark de IA', source_url:sourceUrl, status:'ok', fingerprint:snapshot.fingerprint, excerpt:snapshot.excerpt, fetched_at:snapshot.fetchedAt });
        if (previous && previous.fingerprint !== snapshot.fingerprint) {
          await saveFinding(admin, profile.organization_id, {
            title:`Cambio detectado en capacidades de ${competitor.label}`,
            sourceName:competitor.label, sourceUrl,
            evidence:'La fuente oficial cambió desde el benchmark anterior.',
            comparison:`YOYO IA debe revisar la variación y mantener paridad funcional antes de aplicar la meta de +20%.`,
            recommendation:'Analizar el cambio, convertir nuevas capacidades relevantes en requisitos verificables y generar una propuesta de implementación aislada. No promover automáticamente a producción.',
            expectedImpact:'Mantener la hoja de ruta de YOYO IA actualizada sin desconfigurar la plataforma.',
            noveltyScore:85,pedagogicalScore:90,accessibilityScore:85,riskScore:15,score:88,
          });
        }
      } catch (error) {
        console.error('YOYO capability source unavailable', { competitor:competitor.id, sourceUrl, message:error.message });
      }
    }
  }
  for (const gap of gaps.filter((item)=>!item.parity)) {
    const competitor = COMPETITOR_BASELINES.find((item)=>item.id===gap.competitorId);
    await saveFinding(admin, profile.organization_id, {
      title:`Brecha de paridad frente a ${competitor.label}`,
      sourceName:competitor.label,
      sourceUrl:competitor.officialSources[0],
      evidence:`Capacidades aún no verificadas en YOYO IA: ${gap.missingParity.join(', ')}.`,
      comparison:`Paridad incompleta. La meta de superioridad de ${Math.round((YOYO_SUPERIORITY_TARGET.qualityMultiplierTarget-1)*100)}% sólo se considera alcanzable después de cerrar estas brechas y medir calidad.`,
      recommendation:'Priorizar estas capacidades en ramas aisladas, añadir pruebas medibles y someterlas a revisión propietaria antes de cualquier despliegue.',
      expectedImpact:'Cerrar brechas de funciones generales mientras se conservan las ventajas educativas propias de YOYO IA.',
      noveltyScore:75,pedagogicalScore:92,accessibilityScore:88,riskScore:20,score:86,
    });
  }
  return { organizationId:profile.organization_id, coverage, gaps, snapshots:snapshots.length, targetMultiplier:YOYO_SUPERIORITY_TARGET.qualityMultiplierTarget };
}

export default async function handler(req,res) {
  res.setHeader?.('Cache-Control','no-store');
  if (!['GET','POST'].includes(req.method)) return res.status(405).json({error:'Método no permitido.'});
  if (!validCron(req)) return res.status(401).json({error:'Token de automatización inválido.'});
  const admin = createAdminClient();
  const { data:profiles, error } = await admin.from('automation_profiles').select('*').eq('enabled',true).limit(5);
  if (error) return res.status(500).json({error:'No fue posible leer perfiles de automatización.'});
  const results=[];
  for (const profile of profiles||[]) {
    try { results.push(await benchmarkProfile(admin,profile)); }
    catch (benchmarkError) { results.push({organizationId:profile.organization_id,error:benchmarkError.message}); }
  }
  return res.status(200).json({ engine:'YOYO Capability Lab', cadenceMonths:6, results });
}
