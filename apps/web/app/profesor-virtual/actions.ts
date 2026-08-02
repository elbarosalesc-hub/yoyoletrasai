'use server'

import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type TeacherMode = 'planificar' | 'adaptar' | 'evaluar' | 'analizar' | 'comunicar'

export type VirtualTeacherRequest = {
  prompt: string
  mode: TeacherMode
  level: string
  subject: string
  supportProfile: string
  duration: string
}

export type VirtualTeacherResult = {
  title: string
  summary: string
  sections: Array<{ title: string; items: string[] }>
  actions: Array<{ label: string; href: string }>
  generatedAt: string
  organization: string
}

const modeLabels: Record<TeacherMode, string> = {
  planificar: 'Planificación pedagógica',
  adaptar: 'Adaptación DUA y PIE',
  evaluar: 'Evaluación diversificada',
  analizar: 'Análisis pedagógico',
  comunicar: 'Comunicación educativa',
}

function clean(value: string, fallback: string) {
  const normalized = value.replace(/\s+/g, ' ').trim().slice(0, 600)
  return normalized || fallback
}

export async function generateVirtualTeacherResponse(input: VirtualTeacherRequest): Promise<{ ok: true; result: VirtualTeacherResult } | { ok: false; error: string }> {
  const context = await requireOrganizationContext('/profesor-virtual')
  const prompt = clean(input.prompt, 'Preparar una experiencia de aprendizaje significativa')
  const level = clean(input.level, '3.º básico')
  const subject = clean(input.subject, 'Lenguaje y Comunicación')
  const support = clean(input.supportProfile, 'Diseño universal para el aprendizaje')
  const duration = clean(input.duration, '45 minutos')

  const common = [
    `Nivel: ${level}. Asignatura: ${subject}. Duración sugerida: ${duration}.`,
    `Propósito solicitado: ${prompt}.`,
    `Perfil de apoyo considerado: ${support}.`,
  ]

  const sectionsByMode: Record<TeacherMode, VirtualTeacherResult['sections']> = {
    planificar: [
      { title: 'Inicio', items: ['Activar conocimientos previos con una pregunta breve y un apoyo visual.', 'Comunicar el propósito en lenguaje claro y anticipar la secuencia de trabajo.'] },
      { title: 'Desarrollo', items: ['Modelar un ejemplo completo antes del trabajo autónomo.', 'Proponer una actividad guiada y otra de aplicación con opciones de respuesta oral, escrita o visual.', 'Monitorear comprensión con preguntas de verificación y retroalimentación inmediata.'] },
      { title: 'Cierre y evidencia', items: ['Aplicar un ticket de salida de un ítem.', 'Registrar nivel de logro, apoyo utilizado y autonomía observada.'] },
    ],
    adaptar: [
      { title: 'Acceso', items: ['Reducir carga visual y presentar una instrucción por vez.', 'Destacar palabras clave y ofrecer lectura mediada cuando corresponda.'] },
      { title: 'Participación', items: ['Permitir elección entre respuesta oral, manipulativa, gráfica o escrita.', 'Incorporar pausas breves y anticipación de cambios.'] },
      { title: 'Progresión', items: ['Mantener el mismo objetivo y graduar cantidad de ítems, complejidad lingüística y nivel de apoyo.', 'Usar modelado, práctica guiada y retiro progresivo de ayudas.'] },
    ],
    evaluar: [
      { title: 'Estructura', items: ['Combinar selección múltiple, aplicación y una respuesta explicada.', 'Asignar puntajes visibles y criterios comprensibles.'] },
      { title: 'Diversificación', items: ['Crear una versión estándar y otra con menor extensión, apoyos visuales y respuesta oral opcional.', 'Conservar el objetivo y la exigencia cognitiva central.'] },
      { title: 'Retroalimentación', items: ['Separar logro del objetivo, apoyo requerido y autonomía.', 'Entregar una sugerencia concreta para el siguiente intento.'] },
    ],
    analizar: [
      { title: 'Lectura de evidencias', items: ['Agrupar resultados por logrado, en desarrollo y requiere apoyo intensivo.', 'Distinguir errores de comprensión, procedimiento, atención o acceso.'] },
      { title: 'Decisiones', items: ['Reenseñar el paso con mayor frecuencia de error.', 'Formar grupos flexibles según necesidad y no según diagnóstico.'] },
      { title: 'Seguimiento', items: ['Registrar una evidencia breve después del refuerzo.', 'Comparar avance con la evidencia anterior y ajustar apoyos.'] },
    ],
    comunicar: [
      { title: 'Mensaje central', items: ['Comenzar destacando avances observables y fortalezas.', 'Explicar la necesidad de apoyo con lenguaje respetuoso y específico.'] },
      { title: 'Acuerdos', items: ['Proponer una acción breve para el hogar y otra para el establecimiento.', 'Definir responsable y fecha de seguimiento.'] },
      { title: 'Cierre', items: ['Invitar a realizar preguntas y confirmar comprensión de los acuerdos.', 'Evitar etiquetas y afirmaciones absolutas.'] },
    ],
  }

  return {
    ok: true,
    result: {
      title: `${modeLabels[input.mode]} · ${level}`,
      summary: common.join(' '),
      sections: sectionsByMode[input.mode],
      actions: [
        { label: 'Convertir en recurso editable', href: `/crear?tema=${encodeURIComponent(prompt)}&nivel=${encodeURIComponent(level)}&asignatura=${encodeURIComponent(subject)}` },
        { label: 'Crear evaluación relacionada', href: `/evaluaciones?tema=${encodeURIComponent(prompt)}` },
        { label: 'Buscar recursos en biblioteca', href: `/biblioteca?q=${encodeURIComponent(prompt)}` },
        { label: 'Registrar evidencia', href: '/seguimiento/evidencias' },
      ],
      generatedAt: new Date().toISOString(),
      organization: context.organization.name,
    },
  }
}
