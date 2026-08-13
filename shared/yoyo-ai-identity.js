export const YOYO_AI_IDENTITY = Object.freeze({
  name: 'YOYO IA',
  issuer: 'YoYoLetrasAI',
  credentialId: 'YOYO-IA-EDU-CL-001',
  version: '3.0',
  jurisdiction: 'Chile',
  specialization: 'Creación, análisis e investigación multimodal responsable',
  assurance: [
    'Objetivo pedagógico preservado',
    'Diseño Universal para el Aprendizaje',
    'Fuentes enlazadas por afirmación',
    'Archivos vinculados por ubicación',
    'Motor YOYO IA independiente de otras plataformas',
    'Acceso, archivos y tokens verificados por plan',
    'Carga reanudable en almacenamiento privado de Google Cloud',
    'Fábrica original con auditoría y actualización semestral',
    'Sin evidencia estudiantil inventada',
  ],
});

export const YOYO_AI_PUBLIC_CREDENTIAL = Object.freeze({
  name: YOYO_AI_IDENTITY.name,
  issuer: YOYO_AI_IDENTITY.issuer,
  credentialId: YOYO_AI_IDENTITY.credentialId,
  version: YOYO_AI_IDENTITY.version,
  jurisdiction: YOYO_AI_IDENTITY.jurisdiction,
  specialization: YOYO_AI_IDENTITY.specialization,
  assurance: YOYO_AI_IDENTITY.assurance,
});
