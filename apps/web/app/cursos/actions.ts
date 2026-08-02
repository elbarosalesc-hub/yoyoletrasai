'use server'

import { revalidatePath } from 'next/cache'
import { canManageCourses, requireOrganizationContext } from '@/lib/auth/organization-context'

export type CourseActionState = {
  status: 'idle' | 'success' | 'error'
  message: string
}

export const initialCourseActionState: CourseActionState = {
  status: 'idle',
  message: '',
}

function readText(formData: FormData, key: string) {
  const value = formData.get(key)
  return typeof value === 'string' ? value.trim() : ''
}

export async function createCourse(
  _previousState: CourseActionState,
  formData: FormData,
): Promise<CourseActionState> {
  const context = await requireOrganizationContext('/cursos')

  if (!canManageCourses(context.role)) {
    return {
      status: 'error',
      message: 'Tu rol no tiene permisos para crear cursos.',
    }
  }

  const name = readText(formData, 'name')
  const level = readText(formData, 'level')
  const academicYear = Number(readText(formData, 'academicYear'))

  if (name.length < 2 || name.length > 120) {
    return {
      status: 'error',
      message: 'El nombre debe tener entre 2 y 120 caracteres.',
    }
  }

  if (level.length < 2 || level.length > 80) {
    return {
      status: 'error',
      message: 'Indica un nivel válido para el curso.',
    }
  }

  if (!Number.isInteger(academicYear) || academicYear < 2000 || academicYear > 2200) {
    return {
      status: 'error',
      message: 'El año escolar no es válido.',
    }
  }

  const teacherId = context.role === 'teacher' || context.role === 'pie'
    ? context.userId
    : null

  const { error } = await context.supabase.from('courses').insert({
    organization_id: context.organization.id,
    name,
    level,
    academic_year: academicYear,
    teacher_id: teacherId,
    is_active: true,
  })

  if (error) {
    return {
      status: 'error',
      message: 'No fue posible guardar el curso. Revisa tus permisos e inténtalo nuevamente.',
    }
  }

  revalidatePath('/app')
  revalidatePath('/cursos')

  return {
    status: 'success',
    message: 'Curso creado correctamente.',
  }
}

export async function archiveCourse(courseId: string) {
  if (!courseId) throw new Error('Curso requerido')

  const context = await requireOrganizationContext('/cursos')

  if (!canManageCourses(context.role)) {
    throw new Error('No tienes permisos para archivar cursos.')
  }

  const { error } = await context.supabase
    .from('courses')
    .update({ is_active: false })
    .eq('id', courseId)
    .eq('organization_id', context.organization.id)

  if (error) throw new Error('No fue posible archivar el curso.')

  revalidatePath('/app')
  revalidatePath('/cursos')
}
