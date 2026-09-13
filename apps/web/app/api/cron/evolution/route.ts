import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { runEvolutionAudit, type EvolutionDb } from '@/lib/evolution/run-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CADENCE_MS = 72 * 60 * 60 * 1000

function authorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  return request.headers.get('authorization') === `Bearer ${secret}`
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: 'No autorizado.' }, { status: 401 })

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceRole) return NextResponse.json({ error: 'Supabase de servicio no configurado.' }, { status: 503 })

  const supabase = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
  const db = supabase as unknown as EvolutionDb
  const organizations = await supabase.from('organizations').select('id').limit(100)
  if (organizations.error) return NextResponse.json({ error: 'No fue posible cargar instituciones.' }, { status: 503 })

  const results: Array<{ organizationId: string; status: 'audited' | 'skipped' | 'failed'; auditId?: string; proposed?: number }> = []

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
      const result = await runEvolutionAudit(db, organizationId, 'system')
      results.push({ organizationId, status: 'audited', auditId: result.auditId, proposed: result.proposed })
    } catch {
      results.push({ organizationId, status: 'failed' })
    }
  }

  return NextResponse.json({
    cadenceHours: 72,
    scheduler: 'provider-neutral',
    governance: 'audit-and-propose-only',
    productionChangesApplied: false,
    audited: results.filter(item => item.status === 'audited').length,
    skipped: results.filter(item => item.status === 'skipped').length,
    failed: results.filter(item => item.status === 'failed').length,
    results,
  })
}
