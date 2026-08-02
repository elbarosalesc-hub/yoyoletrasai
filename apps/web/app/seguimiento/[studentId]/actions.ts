'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type SupportActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export const initialSupportActionState: SupportActionState = {
  status: 'idle',
  message: '',
}

const supportRoles = new Set(['pie', 'utp', 'principal', 'institution_admin', 'platform_admin'])

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function saveSupportProfile(
  studentId: string,
  _previousState: SupportActionState,
  formData: FormData,
): Promise<SupportActionState> {
  const context = await requireOrganizationContext(`/seguimiento/${studentId}`)

  if (!supportRoles.has(context.role)) {
    return { status: 'error', message: 'Tu rol no tiene permisos para editar antecedentes PIE y DUA.' }
  }

  const { data: student } = await context.supabase
    .from('students')
    .select('id')
    .eq('id', studentId)
    .eq('organization_id', context.organization.id)
    .maybeSingle()

  if (!student) {
    return { status: 'error', message: 'El estudiante no pertenece a la institución activa.' }
  }

  const payload = {
    organization_id: context.organization.id,
    student_id: studentId,
    support_status: readText(formData, 'supportStatus') || 'monitoring',
    strengths: readText(formData, 'strengths') || null,
    barriers: readText(formData, 'barriers') || null,
    interests: readText(formData, 'interests') || null,
    access_accommodations: readText(formData, 'accessAccommodations') || null,
    objective_accommodations: readText(formData, 'objectiveAccommodations') || null,
    assistive_technology: readText(formData, 'assistiveTechnology') || null,
    responsible_team: readText(formData, 'responsibleTeam') || null,
    evidence_notes: readText(formData, 'evidenceNotes') || null,
    sensitive_notes: readText(formData, 'sensitiveNotes') || null,
    updated_by: context.userId,
  }

  const { data: existing } = await context.supabase
    .from('student_support_profiles')
    .select('id')
    .eq('student_id', studentId)
    .eq('organization_id', context.organization.id)
    .maybeSingle()

  const result = existing
    ? await context.supabase
        .from('student_support_profiles')
        .update(payload)
        .eq('id', existing.id)
        .eq('organization_id', context.organization.id)
    : await context.supabase
        .from('student_support_profiles')
        .insert({ ...payload, created_by: context.userId })

  if (result.error) {
    return { status: 'error', message: 'No fue posible guardar el perfil pedagógico.' }
  }

  revalidatePath(`/seguimiento/${studentId}`)
  revalidatePath('/seguimiento')
  return { status: 'success', message: 'Perfil pedagógico actualizado correctamente.' }
}
