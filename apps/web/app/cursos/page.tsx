import { AppShell } from '@/components/AppShell'
import { canManageCourses, requireOrganizationContext } from '@/lib/auth/organization-context'
import { CoursesManager } from './CoursesManager'

export const dynamic = 'force-dynamic'

export default async function CursosPage() {
  const context = await requireOrganizationContext('/cursos')
  const { data: courses, error } = await context.supabase
    .from('courses')
    .select('id, name, level, academic_year, teacher_id, is_active')
    .eq('organization_id', context.organization.id)
    .eq('is_active', true)
    .order('academic_year', { ascending: false })
    .order('name')

  if (error) throw new Error(`No fue posible cargar los cursos: ${error.message}`)

  return (
    <AppShell active="Cursos y grupos">
      <CoursesManager
        courses={courses ?? []}
        canManage={canManageCourses(context.role)}
        organizationName={context.organization.name}
      />
    </AppShell>
  )
}
