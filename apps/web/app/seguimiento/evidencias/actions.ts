'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type EvidenceActionState = { status: 'idle' | 'success' | 'error'; message: string }
export const initialEvidenceActionState: EvidenceActionState = { status: 'idle', message: '' }

const staffRoles = new Set(['teacher', 'pie', 'utp', 'principal', 'institution_admin', 'platform_admin'])

function text(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createObjective(
  _previous: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const context = await requireOrganizationContext('/seguimiento/evidencias')
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

  if (courseId) {
    const { data: course } = await context.supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .maybeSingle()
    if (!course) return { status: 'error', message: 'El curso seleccionado no está disponible.' }
  }

  const { error } = await context.supabase.from('learning_objectives').insert({
    organization_id: context.organization.id,
    course_id: courseId || null,
    subject,
    code,
    title,
    description: description || null,
    academic_year: academicYear,
    created_by: context.userId,
  })

  if (error) {
    return { status: 'error', message: error.code === '23505' ? 'Ese objetivo ya existe para el curso y año seleccionados.' : 'No fue posible guardar el objetivo.' }
  }

  revalidatePath('/seguimiento/evidencias')
  return { status: 'success', message: 'Objetivo de aprendizaje creado correctamente.' }
}

export async function createEvidence(
  _previous: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const context = await requireOrganizationContext('/seguimiento/evidencias')
  if (!staffRoles.has(context.role)) return { status: 'error', message: 'Tu rol no puede registrar evidencias.' }

  const studentId = text(formData, 'studentId')
  const objectiveId = text(formData, 'objectiveId')
  const courseId = text(formData, 'courseId')
  const evidenceType = text(formData, 'evidenceType')
  const description = text(formData, 'description')
  const achievementLevel = text(formData, 'achievementLevel')
  const supportUsed = text(formData, 'supportUsed')
  const autonomyLevel = text(formData, 'autonomyLevel')
  const observedAt = text(formData, 'observedAt')

  if (!studentId || !objectiveId || description.length < 2) {
    return { status: 'error', message: 'Selecciona estudiante, objetivo y describe la evidencia.' }
  }

  const [studentResult, objectiveResult] = await Promise.all([
    context.supabase.from('students').select('id').eq('id', studentId).eq('organization_id', context.organization.id).maybeSingle(),
    context.supabase.from('learning_objectives').select('id').eq('id', objectiveId).eq('organization_id', context.organization.id).maybeSingle(),
  ])
  if (!studentResult.data || !objectiveResult.data) {
    return { status: 'error', message: 'El estudiante o el objetivo no pertenece a la institución activa.' }
  }

  const { error } = await context.supabase.from('learning_evidence').insert({
    organization_id: context.organization.id,
    student_id: studentId,
    course_id: courseId || null,
    objective_id: objectiveId,
    evidence_type: evidenceType,
    description,
    achievement_level: achievementLevel,
    support_used: supportUsed || null,
    autonomy_level: autonomyLevel || null,
    observed_at: observedAt || undefined,
    created_by: context.userId,
  })

  if (error) return { status: 'error', message: 'No fue posible guardar la evidencia.' }

  revalidatePath('/seguimiento/evidencias')
  revalidatePath(`/seguimiento/${studentId}`)
  return { status: 'success', message: 'Evidencia registrada correctamente.' }
}
