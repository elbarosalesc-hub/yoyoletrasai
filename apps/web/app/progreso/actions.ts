'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

type ActionState = { status: 'idle' | 'success' | 'error'; message: string }
export const initialProgressState: ActionState = { status: 'idle', message: '' }

const staffRoles = new Set(['teacher','pie','utp','principal','institution_admin','platform_admin'])
const evidenceTypes = new Set(['written','oral','performance','project','observation','assessment','other'])
const achievementLevels = new Set(['achieved','developing','initial','not_observed'])
const autonomyLevels = new Set(['independent','partial_support','full_support','not_observed'])

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createObjective(_state: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireOrganizationContext('/progreso')
  if (!staffRoles.has(context.role)) return { status: 'error', message: 'Tu rol no puede crear objetivos.' }

  const subject = text(formData, 'subject')
  const code = text(formData, 'code')
  const title = text(formData, 'title')
  const description = text(formData, 'description')
  const courseId = text(formData, 'courseId')
  const academicYear = Number(text(formData, 'academicYear'))

  if (subject.length < 2 || subject.length > 80 || code.length < 1 || code.length > 40 || title.length < 2 || title.length > 200) {
    return { status: 'error', message: 'Revisa la asignatura, el código y la descripción del objetivo.' }
  }
  if (description.length > 3000) return { status: 'error', message: 'El detalle del objetivo es demasiado extenso.' }
  if (!Number.isInteger(academicYear) || academicYear < 2000 || academicYear > 2200) {
    return { status: 'error', message: 'El año escolar no es válido.' }
  }

  if (courseId) {
    const { data: course, error: courseError } = await context.supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .maybeSingle()

    if (courseError || !course) return { status: 'error', message: 'El curso seleccionado no pertenece a la institución activa.' }
  }

  const supabase = context.supabase as any
  const { error } = await supabase.from('learning_objectives').insert({
    organization_id: context.organization.id,
    course_id: courseId || null,
    subject,
    code,
    title,
    description: description || null,
    academic_year: academicYear,
    created_by: context.userId,
  })

  if (error) return { status: 'error', message: error.code === '23505' ? 'Ese objetivo ya existe para el curso y año.' : 'No fue posible crear el objetivo.' }
  revalidatePath('/progreso')
  return { status: 'success', message: 'Objetivo creado correctamente.' }
}

export async function createEvidence(_state: ActionState, formData: FormData): Promise<ActionState> {
  const context = await requireOrganizationContext('/progreso')
  if (!staffRoles.has(context.role)) return { status: 'error', message: 'Tu rol no puede registrar evidencias.' }

  const studentId = text(formData, 'studentId')
  const objectiveId = text(formData, 'objectiveId')
  const courseId = text(formData, 'courseId')
  const evidenceType = text(formData, 'evidenceType')
  const achievementLevel = text(formData, 'achievementLevel')
  const autonomyLevel = text(formData, 'autonomyLevel')
  const description = text(formData, 'description')
  const supportUsed = text(formData, 'supportUsed')
  const observedAt = text(formData, 'observedAt')

  if (!studentId || !objectiveId || description.length < 2 || description.length > 2000) {
    return { status: 'error', message: 'Selecciona estudiante, objetivo y describe una evidencia válida.' }
  }
  if (supportUsed.length > 500) return { status: 'error', message: 'El apoyo utilizado es demasiado extenso.' }
  if (!evidenceTypes.has(evidenceType) || !achievementLevels.has(achievementLevel) || !autonomyLevels.has(autonomyLevel)) {
    return { status: 'error', message: 'La clasificación de la evidencia no es válida.' }
  }
  if (observedAt && Number.isNaN(Date.parse(`${observedAt}T00:00:00`))) {
    return { status: 'error', message: 'La fecha de observación no es válida.' }
  }

  const supabase = context.supabase as any
  const [studentResult, objectiveResult, courseResult] = await Promise.all([
    supabase.from('students').select('id').eq('id', studentId).eq('organization_id', context.organization.id).eq('status', 'active').maybeSingle(),
    supabase.from('learning_objectives').select('id, course_id').eq('id', objectiveId).eq('organization_id', context.organization.id).eq('is_active', true).maybeSingle(),
    courseId
      ? supabase.from('courses').select('id').eq('id', courseId).eq('organization_id', context.organization.id).eq('is_active', true).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (studentResult.error || !studentResult.data) return { status: 'error', message: 'El estudiante no pertenece a la institución activa.' }
  if (objectiveResult.error || !objectiveResult.data) return { status: 'error', message: 'El objetivo no pertenece a la institución activa.' }
  if (courseId && (courseResult.error || !courseResult.data)) return { status: 'error', message: 'El curso seleccionado no pertenece a la institución activa.' }
  if (objectiveResult.data.course_id && courseId && objectiveResult.data.course_id !== courseId) {
    return { status: 'error', message: 'El objetivo seleccionado está asociado a otro curso.' }
  }

  const { error } = await supabase.from('learning_evidence').insert({
    organization_id: context.organization.id,
    student_id: studentId,
    objective_id: objectiveId,
    course_id: courseId || objectiveResult.data.course_id || null,
    evidence_type: evidenceType,
    achievement_level: achievementLevel,
    autonomy_level: autonomyLevel,
    description,
    support_used: supportUsed || null,
    observed_at: observedAt || new Date().toISOString().slice(0, 10),
    created_by: context.userId,
  })

  if (error) return { status: 'error', message: 'No fue posible guardar la evidencia.' }
  revalidatePath('/progreso')
  revalidatePath(`/seguimiento/${studentId}`)
  return { status: 'success', message: 'Evidencia registrada correctamente.' }
}
