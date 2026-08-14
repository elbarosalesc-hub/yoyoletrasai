export const YOYO_CORE = Object.freeze({
  name: 'YOYO Core',
  version: '3.0',
  kind: 'Motor pedagógico y de orquestación propio',
  refreshIntervalMonths: 6,
  qualityThreshold: 86,
});

export const YOYO_MODULE_BLUEPRINTS = Object.freeze([
  { id: 'library', label: 'Biblioteca', resourceType: 'recurso pedagógico editable', outcome: 'material listo para aula' },
  { id: 'creator', label: 'YOYO IA', resourceType: 'plantilla de creación guiada', outcome: 'encargo completo y reutilizable' },
  { id: 'research', label: 'Investigación', resourceType: 'ruta de investigación con fuentes', outcome: 'síntesis verificable' },
  { id: 'reader', label: 'Plan lector', resourceType: 'ruta lectora', outcome: 'lectura, vocabulario y evidencia' },
  { id: 'teacher', label: 'Profesor virtual', resourceType: 'guion de tutoría', outcome: 'modelado y práctica guiada' },
  { id: 'math', label: 'Laboratorio matemático', resourceType: 'desafío manipulativo', outcome: 'estrategia, práctica y retroalimentación' },
  { id: 'games', label: 'YOYO Play', resourceType: 'misión educativa', outcome: 'reglas, niveles y evidencia de aprendizaje' },
  { id: 'notebook', label: 'Fuentes IA', resourceType: 'laboratorio de corpus', outcome: 'análisis trazable desde archivos' },
  { id: 'planning', label: 'Planificaciones', resourceType: 'planificación de clase', outcome: 'inicio, desarrollo, cierre y evaluación' },
  { id: 'assessments', label: 'Evaluaciones', resourceType: 'evaluación diversificada', outcome: 'ítems, pauta y rúbrica' },
  { id: 'multimedia', label: 'Multimedia', resourceType: 'guion multimedia accesible', outcome: 'escenas, narración y subtítulos' },
  { id: 'pictograms', label: 'Pictogramas', resourceType: 'secuencia visual', outcome: 'anticipación y autonomía' },
  { id: 'classes', label: 'Mis cursos', resourceType: 'secuencia asignable', outcome: 'actividad, plazo y criterio de revisión' },
  { id: 'student', label: 'Espacio estudiante', resourceType: 'ruta autónoma', outcome: 'pasos breves y autoevaluación' },
  { id: 'pie', label: 'PIE y DUA', resourceType: 'barrera y ajuste DUA', outcome: 'acceso sin reducir el objetivo' },
  { id: 'families', label: 'Familias', resourceType: 'puente hogar-escuela', outcome: 'orientación clara y actividad breve' },
  { id: 'institution', label: 'Institución', resourceType: 'protocolo operativo', outcome: 'responsables, evidencia y seguimiento' },
  { id: 'progress', label: 'Progreso', resourceType: 'instrumento de seguimiento', outcome: 'indicadores observables y próximos pasos' },
  { id: 'reports', label: 'Informes', resourceType: 'plantilla de informe trazable', outcome: 'hechos, interpretación y recomendación separados' },
]);

export const FILE_LIMIT_BENCHMARK = Object.freeze({
  checkedAt: '2026-08-13',
  basic: {
    maxFilesPerAnalysis: 22,
    maxFileBytes: 591_396_864, // 564 MiB; supera 512 MiB en 10,15625 %.
    maxTotalFileBytes: 2_362_232_832, // 2,2 GiB por corpus.
  },
  premium: {
    maxFilesPerAnalysis: -1,
    maxFileBytes: 2_362_232_832, // 2,2 GiB por archivo.
    maxTotalFileBytes: 23_622_328_320, // 22 GiB por corpus; procesamiento por lotes.
  },
});

export function moduleForSequence(sequence = 0) {
  const index = Math.abs(Number(sequence) || 0) % YOYO_MODULE_BLUEPRINTS.length;
  return YOYO_MODULE_BLUEPRINTS[index];
}

export function auditGeneratedResource(resource, blueprint) {
  const checks = {
    module: resource?.moduleId === blueprint.id,
    title: String(resource?.title || '').trim().length >= 12,
    objective: String(resource?.objective || '').trim().length >= 30,
    instructions: String(resource?.instruction || '').trim().length >= 60,
    practice: Array.isArray(resource?.exercises) && resource.exercises.length >= 3,
    evidence: Array.isArray(resource?.evidence) && resource.evidence.length >= 2,
    dua: Array.isArray(resource?.supports) && resource.supports.length >= 3,
    metadata: Array.isArray(resource?.tags) && resource.tags.length >= 3,
  };
  const score = Math.round((Object.values(checks).filter(Boolean).length / Object.keys(checks).length) * 100);
  return { score, checks, passed: score >= YOYO_CORE.qualityThreshold };
}
