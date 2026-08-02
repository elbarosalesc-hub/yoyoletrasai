import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { StudentManager } from './StudentManager'

export const dynamic = 'force-dynamic'

const managementRoles = new Set(['teacher', 'pie', 'utp', 'principal', 'institution_admin', 'platform_admin'])

export default async function SeguimientoPage() {
  const context = await requireOrganizationContext('/seguimiento')
  const canManage = managementRoles.has(context.role)

  const [studentsResult, coursesResult] = await Promise.all([
    context.supabase
      .from('students')
      .select('id, first_name, last_name, preferred_name, external_reference, status, course_enrollments(course_id, enrollment_status, courses(name, level))')
      .eq('organization_id', context.organization.id)
      .order('last_name')
      .order('first_name'),
    context.supabase
      .from('courses')
      .select('id, name, level, academic_year')
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .order('academic_year', { ascending: false })
      .order('name'),
  ])

  return (
    <AppShell active="Estudiantes">
      <section className="premium-hero tracking-hero">
        <span className="eyebrow">Gestión institucional</span>
        <h1>Estudiantes, matrículas y apoyos en un solo lugar</h1>
        <p>
          Administra fichas y cursos con acceso protegido por institución. Los antecedentes PIE y DUA
          permanecen separados y visibles únicamente para roles autorizados.
        </p>
      </section>

      {studentsResult.error || coursesResult.error ? (
        <section className="premium-card command-empty">
          <strong>No fue posible cargar el directorio.</strong>
          <span>Tu rol no tiene acceso o la conexión institucional necesita revisión.</span>
        </section>
      ) : (
        <StudentManager students={studentsResult.data ?? []} courses={coursesResult.data ?? []} canManage={canManage} />
      )}
    </AppShell>
  )
}
