import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runEvolutionAudit, type EvolutionDb } from '@/lib/evolution/run-audit'
import { generateResourceDraftBatch, type ResourceFactoryDb } from '@/lib/evolution/resource-factory'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CADENCE_MS = 72 * 60 * 60 * 1000

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

type CycleResult = {
  organizationId: string
  status: 'audited' | 'skipped' | 'failed'
  auditId?: string
  proposed?: number
  draftsGenerated?: number
  draftFactory?: 'generated' | 'skipped' | 'failed'
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) return NextResponse.json({ error: 'Supabase de servicio no configurado.' }, { status: 503 })

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
  const db = supabase as unknown as EvolutionDb
  const resourceDb = supabase as unknown as ResourceFactoryDb
  const organizations = await supabase.from('organizations').select('id').limit(100)
  if (organizations.error) return NextResponse.json({ error: 'No fue posible cargar instituciones.' }, { status: 503 })

  const results: CycleResult[] = []

  for (const organization of organizations.data || []) {
    const organizationId = String(organization.id)
    const latest = await supabase
      .from('evolution_audit_runs')
      .select('created_at,status')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastAt = latest.data?.created_at ? new Date(latest.data.created_at).getTime() : 0
    if (lastAt && Date.now() - lastAt < CADENCE_MS) {
      results.push({ organizationId, status: 'skipped' })
      continue
    }

    try {
      const audit = await runEvolutionAudit(db, organizationId, 'system')
      const cycle: CycleResult = { organizationId, status: 'audited', auditId: audit.auditId, proposed: audit.proposed }
      try {
        const factory = await generateResourceDraftBatch(resourceDb, organizationId)
        cycle.draftFactory = factory.status
        cycle.draftsGenerated = factory.status === 'generated' ? factory.generated : 0
      } catch {
        cycle.draftFactory = 'failed'
        cycle.draftsGenerated = 0
      }
      results.push(cycle)
    } catch {
      results.push({ organizationId, status: 'failed' })
    }
  }

  const audited = results.filter(item => item.status === 'audited').length
  const skipped = results.filter(item => item.status === 'skipped').length
  const failed = results.filter(item => item.status === 'failed').length
  const factoryFailed = results.filter(item => item.status === 'audited' && item.draftFactory === 'failed').length
  const factorySkipped = results.filter(item => item.status === 'audited' && item.draftFactory === 'skipped').length
  const draftsGenerated = results.reduce((sum, item) => sum + (item.draftsGenerated || 0), 0)
  const operational = failed === 0 && factoryFailed === 0

  return NextResponse.json({
    cadenceHours: 72,
    scheduler: 'provider-neutral',
    governance: 'audit-propose-and-draft-only',
    automaticPublishing: false,
    humanReviewRequired: true,
    productionChangesApplied: false,
    operational,
    audited,
    skipped,
    failed,
    factoryFailed,
    factorySkipped,
    draftsGenerated,
    results,
  }, { status: operational ? 200 : 503 })
}
