export const YOYO_AI_ENGINE = Object.freeze({
  id: 'YOYO-IA-EDU-CL-001',
  name: 'YOYO IA',
  version: '3.6.0',
  independence: 'provider-agnostic',
  domain: 'educacion-chilena',
  ownerExclusiveTier: 'owner',
  capabilities: Object.freeze([
    'activity_generation',
    'assessment_generation',
    'reading_plan_generation',
    'report_generation',
    'presentation_generation',
    'research',
    'source_analysis',
    'pie_dua_adaptation',
    'quality_audit',
    'innovation_radar',
  ]),
  qualityDimensions: Object.freeze([
    'curricular_alignment',
    'pedagogical_depth',
    'dua_accessibility',
    'pie_relevance',
    'assessment_observability',
    'editorial_quality',
    'originality',
    'safety',
    'traceability',
  ]),
});

export const YOYO_ACTIVITY_SCHEMA_VERSION = '2026.08';

export function buildYoyoSystemPrompt({ ownerProtocol = '', mode = 'activity' } = {}) {
  const base = `Eres ${YOYO_AI_ENGINE.name}, un motor pedagógico propio de YoYoLetrasAI para educación chilena. Tu arquitectura es independiente del proveedor de modelos: el modelo externo es sólo un motor intercambiable. No copies recursos de terceros ni inventes fuentes. Prioriza decisiones pedagógicas justificables, DUA, PIE, accesibilidad, género, evidencia observable y utilidad real de aula.`;
  const modeRules = mode === 'activity'
    ? 'Para actividades: integra objetivo observable con habilidad, contenido y actitud; modelamiento; práctica progresiva; apoyos DUA; evidencia; criterios de éxito; cierre metacognitivo y adaptación sin reducir el desafío.'
    : mode === 'research'
      ? 'Para investigación: diferencia hechos, inferencias y recomendaciones; usa únicamente fuentes entregadas o verificadas y no inventes citas.'
      : 'Entrega una respuesta profesional, estructurada, verificable y reutilizable.';
  return [base, modeRules, ownerProtocol].filter(Boolean).join('\n\n');
}

export function auditYoyoActivity(activity = {}) {
  const text = (value) => String(value || '').trim();
  const checks = {
    title: text(activity.title).length >= 12,
    objective: text(activity.objective).length >= 40,
    instruction: text(activity.instruction).length >= 80,
    practice: Array.isArray(activity.exercises) && activity.exercises.length >= 4,
    supports: Array.isArray(activity.supports) && activity.supports.length >= 3,
    evidence: Array.isArray(activity.evidence) && activity.evidence.length >= 2,
    successCriteria: Array.isArray(activity.successCriteria) && activity.successCriteria.length >= 2,
    metacognition: text(activity.metacognition).length >= 30,
    familyBridge: text(activity.familyBridge).length >= 20,
    editorialReview: Array.isArray(activity.teacherReview) && activity.teacherReview.length >= 2,
  };
  const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
  return { score, passed: score >= 90, checks, schemaVersion: YOYO_ACTIVITY_SCHEMA_VERSION };
}
