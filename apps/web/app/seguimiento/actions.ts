'use server'

import { revalidatePath } from 'next/cache'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export type StudentActionState = {
  status: 'idle' | 'success' | 'warning' | 'error'
  message: string
}

export const initialStudentActionState: StudentActionState = { status: 'idle', message: '' }

const staffRoles = new Set([
  'teacher',
  'pie',
  'utp',
  'principal',
  'institution_admin',
  'platform_admin',
])

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createStudent(
  _previousState: StudentActionState,
  formData: FormData,
): Promise<StudentActionState> {
  const context = await requireOrganizationContext('/seguimiento')

  if (!staffRoles.has(context.role)) {
    return { status: 'error', message: 'Tu rol no puede registrar estudiantes.' }
  }

  const firstName = readText(formData, 'firstName')
  const lastName = readText(formData, 'lastName')
  const preferredName = readText(formData, 'preferredName')
  const externalReference = readText(formData, 'externalReference')
  const birthDate = readText(formData, 'birthDate')
  const courseId = readText(formData, 'courseId')

  if (firstName.length < 1 || firstName.length > 80) {
    return { status: 'error', message: 'Ingresa un nombre válido.' }
  }

  if (lastName.length < 1 || lastName.length > 120) {
    return { status: 'error', message: 'Ingresa apellidos válidos.' }
  }

  if (preferredName.length > 80 || externalReference.length > 80) {
    return { status: 'error', message: 'Revisa el nombre preferido o identificador interno.' }
  }

  if (birthDate && Number.isNaN(Date.parse(`${birthDate}T00:00:00`))) {
    return { status: 'error', message: 'La fecha de nacimiento no es válida.' }
  }

  if (courseId) {
    const { data: course, error: courseError } = await context.supabase
      .from('courses')
      .select('id')
      .eq('id', courseId)
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .maybeSingle()

    if (courseError || !course) {
      return { status: 'error', message: 'El curso seleccionado no está disponible.' }
    }
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
      status: 'active',
      created_by: context.userId,
    })
    .select('id')
    .single()

  if (studentError || !student) {
    return {
      status: 'error',
      message: studentError?.code === '23505'
        ? 'Ya existe un estudiante con ese identificador interno.'
        : 'No fue posible registrar al estudiante.',
    }
  }

  if (courseId) {
    const { error: enrollmentError } = await context.supabase
      .from('course_enrollments')
      .insert({
        organization_id: context.organization.id,
        course_id: courseId,
        student_id: student.id,
        enrollment_status: 'active',
        created_by: context.userId,
      })

    if (enrollmentError) {
      revalidatePath('/seguimiento')
      revalidatePath('/app')
      return {
        status: 'warning',
        message: 'El estudiante fue creado, pero la matrícula deberá completarse desde su ficha.',
      }
    }
  }

  revalidatePath('/seguimiento')
  revalidatePath('/app')

  return {
    status: 'success',
    message: courseId
      ? 'Estudiante registrado y matriculado correctamente.'
      : 'Estudiante registrado correctamente.',
  }
}

export async function updateStudentStatus(
  studentId: string,
  status: 'active' | 'inactive' | 'graduated' | 'transferred',
) {
  if (!studentId) throw new Error('Estudiante requerido')

  const context = await requireOrganizationContext('/seguimiento')

  if (!staffRoles.has(context.role)) {
    throw new Error('Tu rol no puede modificar estudiantes.')
  }

  const { error } = await context.supabase
    .from('students')
    .update({ status })
    .eq('id', studentId)
    .eq('organization_id', context.organization.id)

  if (error) throw new Error('No fue posible actualizar el estado del estudiante.')

  revalidatePath('/seguimiento')
  revalidatePath('/app')
}
