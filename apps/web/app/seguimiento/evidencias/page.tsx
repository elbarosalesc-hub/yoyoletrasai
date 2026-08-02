import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { EvidenceWorkspace } from './EvidenceWorkspace'

export const dynamic = 'force-dynamic'

export default async function EvidencePage() {
  const context = await requireOrganizationContext('/seguimiento/evidencias')

  const [coursesResult, studentsResult, objectivesResult, evidenceResult] = await Promise.all([
    context.supabase
      .from('courses')
      .select('id, name, level, academic_year')
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .order('academic_year', { ascending: false })
      .order('name'),
    context.supabase
      .from('students')
      .select('id, first_name, last_name, preferred_name')
      .eq('organization_id', context.organization.id)
      .eq('status', 'active')
      .order('last_name')
      .order('first_name'),
    context.supabase
      .from('learning_objectives')
      .select('id, course_id, subject, code, title, academic_year')
      .eq('organization_id', context.organization.id)
      .eq('is_active', true)
      .order('academic_year', { ascending: false })
      .order('subject')
      .order('code'),
    context.supabase
      .from('learning_evidence')
      .select('id, description, achievement_level, evidence_type, observed_at, support_used, autonomy_level, students(first_name, last_name, preferred_name), learning_objectives(code, title, subject)')
      .eq('organization_id', context.organization.id)
      .order('observed_at', { ascending: false })
      .limit(100),
  ])

  const hasError = coursesResult.error || studentsResult.error || objectivesResult.error || evidenceResult.error

  return (
    <AppShell active="Seguimiento">
      <div className="student-detail-page">
        <Link href="/seguimiento" className="student-back-link"><ArrowLeft size={17} /> Volver a estudiantes</Link>
        <section className="premium-hero tracking-hero">
          <span className="eyebrow">Progreso pedagógico</span>
          <h1>Evidencias y objetivos de aprendizaje</h1>
          <p>Registra resultados observables, apoyos utilizados y autonomía sin porcentajes inventados. Cada avance queda vinculado al estudiante y al OA correspondiente.</p>
        </section>

        {hasError ? (
          <section className="premium-card command-empty">
            <strong>No fue posible cargar el seguimiento.</strong>
            <span>Revisa tu acceso institucional o vuelve a intentarlo.</span>
          </section>
        ) : (
          <EvidenceWorkspace
            courses={coursesResult.data ?? []}
            students={studentsResult.data ?? []}
            objectives={objectivesResult.data ?? []}
            evidence={(evidenceResult.data ?? []) as never[]}
          />
        )}
      </div>
    </AppShell>
  )
}
