export const premiumResourceTypes = [
  { id: 'learning-guide', label: 'Guía de aprendizaje', group: 'Planificación y aula', description: 'Secuencia lista para imprimir o trabajar digitalmente, con modelado, práctica y cierre.' },
  { id: 'lesson-plan', label: 'Planificación de clase', group: 'Planificación y aula', description: 'Inicio, desarrollo y cierre con objetivo, evaluación y apoyos DUA.' },
  { id: 'learning-sequence', label: 'Secuencia DUA', group: 'Planificación y aula', description: 'Experiencia multimodal con múltiples formas de representación, acción y participación.' },
  { id: 'stations', label: 'Estaciones de aprendizaje', group: 'Planificación y aula', description: 'Rotación por estaciones con roles, tiempos, materiales y evidencias.' },
  { id: 'reading-comprehension', label: 'Comprensión lectora', group: 'Lenguaje', description: 'Texto, vocabulario, preguntas literales, inferenciales y críticas, con respuestas.' },
  { id: 'adapted-text', label: 'Texto adaptado', group: 'Lenguaje', description: 'Versión graduada por complejidad, apoyos visuales, vocabulario y andamiajes.' },
  { id: 'writing-workshop', label: 'Taller de escritura', group: 'Lenguaje', description: 'Planificación, modelado, escritura guiada, revisión y pauta de autoevaluación.' },
  { id: 'handwriting', label: 'Caligrafía', group: 'Lenguaje', description: 'Modelos de letra, direccionalidad, copia gradual y producción autónoma.' },
  { id: 'graphomotor', label: 'Grafomotricidad', group: 'Lenguaje', description: 'Trazos progresivos, coordinación visomotora y actividades contextualizadas.' },
  { id: 'assessment', label: 'Evaluación', group: 'Evaluación', description: 'Ítems variados, niveles cognitivos, puntaje, criterios y clave de respuestas.' },
  { id: 'rubric', label: 'Rúbrica', group: 'Evaluación', description: 'Criterios observables, niveles de desempeño e indicadores claros.' },
  { id: 'exit-ticket', label: 'Ticket de salida', group: 'Evaluación', description: 'Chequeo breve de comprensión, metacognición y siguiente paso.' },
  { id: 'quiz', label: 'Quiz interactivo', group: 'Evaluación', description: 'Preguntas con alternativas, feedback inmediato y dificultad progresiva.' },
  { id: 'math-practice', label: 'Práctica matemática', group: 'Matemática', description: 'Modelado, ejercicios graduados, problemas contextualizados y desafío.' },
  { id: 'word-problems', label: 'Problemas contextualizados', group: 'Matemática', description: 'Problemas cercanos a la vida cotidiana con representación y estrategias.' },
  { id: 'flashcards', label: 'Tarjetas didácticas', group: 'Material visual', description: 'Concepto, imagen sugerida, ejemplo, pregunta y reverso pedagógico.' },
  { id: 'pictograms', label: 'Pictogramas y apoyos visuales', group: 'Material visual', description: 'Secuencias visuales, anticipadores, tableros y apoyos de comunicación.' },
  { id: 'matching', label: 'Actividad de asociación', group: 'Juegos y práctica', description: 'Pares, categorías o relaciones con retroalimentación y nivel graduado.' },
  { id: 'word-search', label: 'Sopa de letras', group: 'Juegos y práctica', description: 'Vocabulario curricular con pistas, extensión y versión accesible.' },
  { id: 'crossword', label: 'Crucigrama', group: 'Juegos y práctica', description: 'Conceptos y definiciones graduadas, con solución y pistas opcionales.' },
  { id: 'escape-room', label: 'Escape room pedagógico', group: 'Juegos y práctica', description: 'Misión narrativa con retos encadenados, pistas, feedback y cierre.' },
  { id: 'presentation', label: 'Presentación de clase', group: 'Multimedia', description: 'Guion de diapositivas, recursos visuales, preguntas y notas docentes.' },
  { id: 'family-resource', label: 'Recurso para familias', group: 'Comunidad', description: 'Orientaciones claras, actividad en casa y seguimiento sin tecnicismos.' },
  { id: 'report', label: 'Informe pedagógico', group: 'Gestión', description: 'Síntesis profesional editable, fortalezas, necesidades, apoyos y acuerdos.' },
] as const

export type PremiumResourceType = (typeof premiumResourceTypes)[number]['label']

export const supportProfiles = [
  'Acceso universal DUA',
  'Apoyo visual moderado',
  'Lectura silábica',
  'Respuesta oral',
  'Discapacidad intelectual',
  'TDA/TDAH',
  'TEA',
  'Dificultades específicas del aprendizaje',
  'Lenguaje claro y baja carga cognitiva',
] as const

export type SupportProfile = (typeof supportProfiles)[number]

export const visualStyles = [
  'Infantil académico premium',
  'Minimalista escolar',
  'Ilustrado profesional',
  'Alta accesibilidad',
  'Secundaria moderna',
] as const

export type VisualStyle = (typeof visualStyles)[number]

export const ownerApplications = [
  { label: 'Centro de control', href: '/app', category: 'Gestión', description: 'Vista institucional, accesos y actividad reciente.' },
  { label: 'Biblioteca', href: '/biblioteca', category: 'Recursos', description: 'Recursos guardados, premium y adaptables.' },
  { label: 'Centros Premium', href: '/centros', category: 'Experiencias', description: 'Centros pedagógicos integrados y experiencias inmersivas.' },
  { label: 'Plan Lector', href: '/plan-lector', category: 'Lenguaje', description: 'Lecturas, seguimiento, comprensión y rutas lectoras.' },
  { label: 'Crear con YOYO IA', href: '/crear', category: 'IA', description: 'Generador automático multimodal de recursos pedagógicos.' },
  { label: 'Profesor Virtual', href: '/profesor-virtual', category: 'IA', description: 'Asistencia pedagógica contextual y acompañamiento docente.' },
  { label: 'Herramientas', href: '/herramientas', category: 'Docencia', description: 'Utilidades para planificar, adaptar, evaluar y enseñar.' },
  { label: 'Caligrafía', href: '/caligrafia', category: 'Lenguaje', description: 'Imprenta, manuscrita, direccionalidad y progresión.' },
  { label: 'Apoyos PIE y DUA', href: '/inclusion', category: 'Inclusión', description: 'Adaptaciones, apoyos, accesibilidad y diferenciación.' },
  { label: 'Simuladores', href: '/simuladores', category: 'Experiencias', description: 'Aprendizaje interactivo y práctica contextualizada.' },
  { label: 'Juegos 3D', href: '/juegos', category: 'Experiencias', description: 'Misiones pedagógicas 3D, animación, niveles y analítica.' },
  { label: 'Evaluaciones', href: '/evaluaciones', category: 'Evaluación', description: 'Instrumentos, rúbricas, aplicación y resultados.' },
  { label: 'Cursos y estudiantes', href: '/cursos', category: 'Gestión', description: 'Organización de cursos, grupos y perfiles.' },
  { label: 'Seguimiento y evidencias', href: '/seguimiento', category: 'Gestión', description: 'Evidencias, apoyos y continuidad del aprendizaje.' },
  { label: 'Progreso por OA', href: '/progreso', category: 'Analítica', description: 'Progreso curricular por objetivo y curso.' },
  { label: 'Familias', href: '/familias', category: 'Comunidad', description: 'Comunicación, orientaciones y acompañamiento familiar.' },
  { label: 'Informes', href: '/informes', category: 'Gestión', description: 'Informes pedagógicos y exportaciones.' },
  { label: 'Multimedia', href: '/multimedia', category: 'Recursos', description: 'Imágenes, audio, video y materiales multimodales.' },
  { label: 'Integraciones', href: '/integraciones', category: 'Sistema', description: 'Conexiones con servicios educativos y almacenamiento.' },
  { label: 'Configuración', href: '/configuracion', category: 'Sistema', description: 'Perfil, apariencia, accesibilidad, permisos y plataforma.' },
] as const

export const premiumGeneratorCapabilities = [
  'Generar desde tema, objetivo, texto fuente o material existente',
  'Alinear por nivel, asignatura, OA/habilidad y propósito de aprendizaje',
  'Crear versiones diferenciadas sin separar al estudiante del objetivo central',
  'Incluir DUA, PIE/NEE, vocabulario, andamiajes y alternativas de respuesta',
  'Producir recurso docente, versión estudiante y clave/pauta en un mismo flujo',
  'Regenerar sólo una sección sin perder el resto del trabajo',
  'Guardar historial y duplicar para otro curso',
  'Preparar salida imprimible y editable',
] as const
