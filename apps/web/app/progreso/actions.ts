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

  if (subject.length < 2 || code.length < 1 || title.length < 2) {
    return { status: 'error', message: 'Completa asignatura, código y descripción del objetivo.' }
  }
  if (!Number.isInteger(academicYear) || academicYear < 2000 || academicYear > 2200) {
    return { status: 'error', message: 'El año escolar no es válido.' }
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

  if (error) return { status: 'error', message: error.code === '23505' ? 'Ese objetivo ya existe para el curso.' : 'No fue posible crear el objetivo.' }
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

  if (!studentId || !objectiveId || description.length < 2) return { status: 'error', message: 'Selecciona estudiante, objetivo y describe la evidencia.' }
  if (!evidenceTypes.has(evidenceType) || !achievementLevels.has(achievementLevel) || !autonomyLevels.has(autonomyLevel)) {
    return { status: 'error', message: 'La clasificación de la evidencia no es válida.' }
  }

  const supabase = context.supabase as any
  const { error } = await supabase.from('learning_evidence').insert({
    organization_id: context.organization.id,
    student_id: studentId,
    objective_id: objectiveId,
    course_id: courseId || null,
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
  return { status: 'success', message: 'Evidencia registrada correctamente.' }
}
