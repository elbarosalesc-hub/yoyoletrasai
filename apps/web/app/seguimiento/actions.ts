'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type StudentActionState = { status: 'idle' | 'success' | 'error'; message: string }
export const initialStudentActionState: StudentActionState = { status: 'idle', message: '' }

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createStudent(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const context = await requireOrganizationContext('/seguimiento')
  const firstName = readText(formData, 'firstName')
  const lastName = readText(formData, 'lastName')
  const preferredName = readText(formData, 'preferredName')
  const externalReference = readText(formData, 'externalReference')
  const birthDate = readText(formData, 'birthDate')
  const courseId = readText(formData, 'courseId')

  if (firstName.length < 1 || firstName.length > 80 || lastName.length < 1 || lastName.length > 120) {
    return { status: 'error', message: 'Revisa el nombre y los apellidos del estudiante.' }
  }

  const { data: student, error: studentError } = await context.supabase
    .from('students')
    .insert({
      organization_id: context.organization.id,
      first_name: firstName,
      last_name: lastName,
      preferred_name: preferredName || null,
      external_reference: externalReference || null,
      birth_date: birthDate || null,
      created_by: context.userId,
    })
    .select('id')
    .single()

  if (studentError || !student) {
    return { status: 'error', message: 'No fue posible crear la ficha. Verifica que el identificador no esté repetido.' }
  }

  if (courseId) {
    const { error: enrollmentError } = await context.supabase.from('course_enrollments').insert({
      organization_id: context.organization.id,
      course_id: courseId,
      student_id: student.id,
      created_by: context.userId,
    })

    if (enrollmentError) {
      return { status: 'error', message: 'La ficha fue creada, pero no fue posible matricularla en el curso.' }
    }
  }

  revalidatePath('/seguimiento')
  revalidatePath('/app')
  return { status: 'success', message: 'Estudiante creado correctamente.' }
}

export async function updateStudentStatus(studentId: string, status: 'active' | 'inactive' | 'graduated' | 'transferred') {
  const context = await requireOrganizationContext('/seguimiento')
  const { error } = await context.supabase
    .from('students')
    .update({ status })
    .eq('id', studentId)
    .eq('organization_id', context.organization.id)

  if (error) throw new Error('No fue posible actualizar el estado del estudiante.')
  revalidatePath('/seguimiento')
}
