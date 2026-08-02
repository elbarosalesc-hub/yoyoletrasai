import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { ProgressManager } from './ProgressManager'

export const dynamic = 'force-dynamic'

export default async function ProgressPage() {
  const context = await requireOrganizationContext('/progreso')
  const supabase = context.supabase as any

  const [coursesResult, studentsResult, objectivesResult, evidenceResult] = await Promise.all([
    supabase
      .from('courses')
      .select('id, name, level, academic_year')
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .order('academic_year', { ascending: false })
      .order('name'),
    supabase
      .from('students')
      .select('id, first_name, last_name, preferred_name')
      .eq('organization_id', context.organization.id)
      .eq('status', 'active')
      .order('last_name')
      .order('first_name'),
    supabase
      .from('learning_objectives')
      .select('id, subject, code, title, academic_year, course_id')
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .order('academic_year', { ascending: false })
      .order('subject')
      .order('code'),
    supabase
      .from('learning_evidence')
      .select('id, description, evidence_type, achievement_level, autonomy_level, support_used, observed_at, students(first_name, last_name, preferred_name), learning_objectives(subject, code, title)')
      .eq('organization_id', context.organization.id)
      .order('observed_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(100),
  ])

  const hasError = coursesResult.error || studentsResult.error || objectivesResult.error || evidenceResult.error

  return (
    <AppShell active="Seguimiento">
      <section className="premium-hero progress-hero">
        <span className="eyebrow">Progreso curricular</span>
        <h1>Objetivos, evidencias y apoyos con trazabilidad real</h1>
        <p>
          Registra avances observables por estudiante y objetivo de aprendizaje. Cada evidencia conserva
          nivel de logro, autonomía, apoyo utilizado y fecha de observación.
        </p>
      </section>

      {hasError ? (
        <section className="premium-card command-empty">
          <strong>No fue posible cargar el seguimiento curricular.</strong>
          <span>Revisa la conexión institucional o vuelve a intentarlo.</span>
        </section>
      ) : (
        <ProgressManager
          courses={coursesResult.data ?? []}
          students={studentsResult.data ?? []}
          objectives={objectivesResult.data ?? []}
          evidence={evidenceResult.data ?? []}
        />
      )}
    </AppShell>
  )
}
