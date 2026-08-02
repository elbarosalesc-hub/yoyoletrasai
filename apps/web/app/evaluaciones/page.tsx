import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { EvaluacionesClient } from './EvaluacionesClient'

export const dynamic = 'force-dynamic'

export default async function EvaluacionesPage() {
  const context = await requireOrganizationContext('/evaluaciones')
  const supabase = context.supabase as any
  const { data } = await supabase
    .from('assessments')
    .select('id, title, assessment_type, status, total_points, updated_at, description')
    .eq('organization_id', context.organization.id)
    .order('updated_at', { ascending: false })
    .limit(40)

  return <EvaluacionesClient assessments={data ?? []} />
}
