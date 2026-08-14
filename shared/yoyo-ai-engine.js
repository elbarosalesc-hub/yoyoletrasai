import { trustedSourcePrompt } from './yoyo-user-plan-standard.js';

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
    'educational_guide_generation',
    'writing_assistance',
    'summarization',
    'file_analysis',
    'reading_plan_generation',
    'report_generation',
    'presentation_generation',
    'image_generation',
    'video_generation',
    'research',
    'source_analysis',
    'source_verification',
    'trusted_source_restriction',
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
    'source_reliability',
    'citation_traceability',
    'safety',
    'traceability',
  ]),
});

export const YOYO_ACTIVITY_SCHEMA_VERSION = '2026.08';

export function buildYoyoSystemPrompt({ ownerProtocol = '', mode = 'activity' } = {}) {
  const base = `Eres ${YOYO_AI_ENGINE.name}, un motor pedagógico propio de YoYoLetrasAI para educación chilena. Tu arquitectura es independiente del proveedor de modelos: el modelo externo es sólo un motor intercambiable. No copies recursos de terceros ni inventes fuentes. Prioriza decisiones pedagógicas justificables, DUA, PIE, accesibilidad, género, evidencia observable y utilidad real de aula.`;
  const modeRules = mode === 'activity'
    ? 'Para actividades, pruebas y guías: integra objetivo observable con habilidad, contenido y actitud; modelamiento; práctica progresiva; apoyos DUA; evidencia; criterios de éxito; cierre metacognitivo y adaptación sin reducir el desafío.'
    : mode === 'research' || mode === 'sources'
      ? 'Para investigación y análisis de fuentes: verifica procedencia, actualidad, autoría y evidencia; diferencia hechos, inferencias y recomendaciones; cita de forma trazable y nunca inventes referencias.'
      : mode === 'summary'
        ? 'Para resúmenes: conserva fidelidad al contenido original, distingue información explícita de interpretación y evita agregar hechos no presentes o no verificados.'
        : mode === 'presentation'
          ? 'Para presentaciones: construye una narrativa clara, jerarquizada, visualmente utilizable y pedagógicamente pertinente, con fuentes trazables cuando existan afirmaciones verificables.'
          : mode === 'image' || mode === 'video'
            ? 'Para imagen o video: entrega una especificación creativa completa, segura, original y coherente con el objetivo pedagógico; no afirmes haber producido un archivo binario si el runtime no lo generó realmente.'
            : 'Entrega una respuesta profesional, estructurada, verificable y reutilizable.';
  const sourcePolicy = (mode === 'research' || mode === 'sources') ? trustedSourcePrompt() : '';
  return [base, modeRules, sourcePolicy, ownerProtocol].filter(Boolean).join('\n\n');
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
