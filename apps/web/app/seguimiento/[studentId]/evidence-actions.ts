'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type EvidenceActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export const initialEvidenceActionState: EvidenceActionState = { status: 'idle', message: '' }

const staffRoles = new Set(['teacher', 'pie', 'utp', 'principal', 'institution_admin', 'platform_admin'])
const evidenceTypes = new Set(['written', 'oral', 'performance', 'project', 'observation', 'assessment', 'other'])
const achievementLevels = new Set(['achieved', 'developing', 'initial', 'not_observed'])
const autonomyLevels = new Set(['independent', 'partial_support', 'full_support', 'not_observed'])

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createLearningObjective(
  studentId: string,
  _previousState: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const context = await requireOrganizationContext(`/seguimiento/${studentId}`)
  if (!staffRoles.has(context.role)) return { status: 'error', message: 'Tu rol no puede crear objetivos.' }

  const subject = readText(formData, 'subject')
  const code = readText(formData, 'code')
  const title = readText(formData, 'title')
  const description = readText(formData, 'objectiveDescription')
  const courseId = readText(formData, 'courseId')
  const academicYear = Number(readText(formData, 'academicYear'))

  if (subject.length < 2 || subject.length > 80 || code.length < 1 || code.length > 40 || title.length < 2 || title.length > 200) {
    return { status: 'error', message: 'Revisa la asignatura, código y descripción del objetivo.' }
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
      .maybeSingle()
    if (!course) return { status: 'error', message: 'El curso seleccionado no pertenece a la institución.' }
  }

  const db = context.supabase as any
  const { error } = await db.from('learning_objectives').insert({
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
    return {
      status: 'error',
      message: error.code === '23505' ? 'Ese objetivo ya está registrado para el curso y año.' : 'No fue posible guardar el objetivo.',
    }
  }

  revalidatePath(`/seguimiento/${studentId}`)
  return { status: 'success', message: 'Objetivo de aprendizaje creado correctamente.' }
}

export async function createLearningEvidence(
  studentId: string,
  _previousState: EvidenceActionState,
  formData: FormData,
): Promise<EvidenceActionState> {
  const context = await requireOrganizationContext(`/seguimiento/${studentId}`)
  if (!staffRoles.has(context.role)) return { status: 'error', message: 'Tu rol no puede registrar evidencias.' }

  const objectiveId = readText(formData, 'objectiveId')
  const courseId = readText(formData, 'courseId')
  const evidenceType = readText(formData, 'evidenceType')
  const description = readText(formData, 'description')
  const achievementLevel = readText(formData, 'achievementLevel')
  const supportUsed = readText(formData, 'supportUsed')
  const autonomyLevel = readText(formData, 'autonomyLevel')
  const observedAt = readText(formData, 'observedAt')

  if (!objectiveId || description.length < 2 || description.length > 2000) {
    return { status: 'error', message: 'Selecciona un objetivo y describe la evidencia observada.' }
  }
  if (!evidenceTypes.has(evidenceType) || !achievementLevels.has(achievementLevel) || !autonomyLevels.has(autonomyLevel)) {
    return { status: 'error', message: 'El tipo, logro o nivel de autonomía no es válido.' }
  }

  const db = context.supabase as any
  const [{ data: student }, { data: objective }] = await Promise.all([
    context.supabase.from('students').select('id').eq('id', studentId).eq('organization_id', context.organization.id).maybeSingle(),
    db.from('learning_objectives').select('id, course_id').eq('id', objectiveId).eq('organization_id', context.organization.id).eq('is_active', true).maybeSingle(),
  ])

  if (!student || !objective) return { status: 'error', message: 'El estudiante u objetivo no pertenece a la institución activa.' }
  if (courseId && objective.course_id && objective.course_id !== courseId) {
    return { status: 'error', message: 'El objetivo seleccionado no corresponde al curso activo.' }
  }

  const { error } = await db.from('learning_evidence').insert({
    organization_id: context.organization.id,
    student_id: studentId,
    course_id: courseId || objective.course_id || null,
    objective_id: objectiveId,
    evidence_type: evidenceType,
    description,
    achievement_level: achievementLevel,
    support_used: supportUsed || null,
    autonomy_level: autonomyLevel,
    observed_at: observedAt || new Date().toISOString().slice(0, 10),
    created_by: context.userId,
  })

  if (error) return { status: 'error', message: 'No fue posible registrar la evidencia.' }

  revalidatePath(`/seguimiento/${studentId}`)
  revalidatePath('/seguimiento')
  return { status: 'success', message: 'Evidencia registrada y vinculada al objetivo.' }
}
