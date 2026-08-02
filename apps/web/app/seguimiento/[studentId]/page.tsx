import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, BookOpen, CalendarDays, GraduationCap, ShieldCheck, UserRound } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { SupportProfileForm } from './SupportProfileForm'

export const dynamic = 'force-dynamic'

const supportRoles = new Set(['pie', 'utp', 'principal', 'institution_admin', 'platform_admin'])

export default async function StudentDetailPage({ params }: { params: Promise<{ studentId: string }> }) {
  const { studentId } = await params
  const context = await requireOrganizationContext(`/seguimiento/${studentId}`)
  const canViewSupport = supportRoles.has(context.role)

  const [studentResult, supportResult] = await Promise.all([
    context.supabase
      .from('students')
      .select('id, first_name, last_name, preferred_name, external_reference, birth_date, status, course_enrollments(enrollment_status, enrolled_at, courses(name, level, academic_year))')
      .eq('id', studentId)
      .eq('organization_id', context.organization.id)
      .maybeSingle(),
    canViewSupport
      ? context.supabase
          .from('student_support_profiles')
          .select('support_status, strengths, barriers, interests, access_accommodations, objective_accommodations, assistive_technology, responsible_team, evidence_notes, sensitive_notes')
          .eq('student_id', studentId)
          .eq('organization_id', context.organization.id)
          .maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (studentResult.error || !studentResult.data) notFound()

  const student = studentResult.data
  const activeEnrollment = student.course_enrollments?.find((item) => item.enrollment_status === 'active')
  const displayName = student.preferred_name || `${student.first_name} ${student.last_name}`

  return (
    <AppShell active="Estudiantes">
      <div className="student-detail-page">
        <Link href="/seguimiento" className="student-back-link"><ArrowLeft size={17} /> Volver al directorio</Link>

        <section className="premium-card student-detail-hero">
          <div className="student-detail-avatar">{student.first_name[0]}{student.last_name[0]}</div>
          <div className="student-detail-copy">
            <span className="eyebrow"><UserRound size={15} /> Ficha institucional</span>
            <h1>{displayName}</h1>
            {student.preferred_name && <p>{student.first_name} {student.last_name}</p>}
            <div className="student-detail-meta">
              <span><ShieldCheck size={15} /> {student.status === 'active' ? 'Ficha activa' : 'Ficha inactiva'}</span>
              <span><GraduationCap size={15} /> {activeEnrollment?.courses ? `${activeEnrollment.courses.name} · ${activeEnrollment.courses.level}` : 'Sin matrícula activa'}</span>
              <span><BookOpen size={15} /> {student.external_reference || 'Sin identificador interno'}</span>
              {student.birth_date && <span><CalendarDays size={15} /> Fecha de nacimiento registrada</span>}
            </div>
          </div>
        </section>

        {canViewSupport ? (
          supportResult.error ? (
            <section className="premium-card command-empty"><strong>No fue posible cargar el perfil pedagógico.</strong><span>Revisa la conexión e inténtalo nuevamente.</span></section>
          ) : (
            <SupportProfileForm studentId={student.id} profile={supportResult.data} />
          )
        ) : (
          <section className="premium-card support-locked-card">
            <ShieldCheck size={30} />
            <div><span className="eyebrow">Información protegida</span><h2>Perfil pedagógico restringido</h2><p>La ficha general y la matrícula son visibles para tu rol. Los antecedentes PIE y DUA requieren autorización específica.</p></div>
          </section>
        )}
      </div>
    </AppShell>
  )
}
