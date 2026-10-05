import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const reportTypes = new Set(['familia','avance','pie','curso'])
const reportStatuses = new Set(['draft','approved','archived'])

function text(value: unknown, max = 4000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function uuid(value: unknown) {
  const candidate = text(value, 80)
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(candidate)
    ? candidate
    : null
}

async function context() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value || null
  return { supabase, userId, organizationId }
}

export async function GET(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const url = new URL(request.url)
  const reportId = uuid(url.searchParams.get('id'))

  if (reportId) {
    const report = await (supabase as any)
      .from('reports')
      .select('id,course_id,student_id,objective_id,report_type,title,period,body,status,version,created_by,approved_by,approved_at,archived_at,created_at,updated_at')
      .eq('organization_id', organizationId)
      .eq('id', reportId)
      .maybeSingle()

    if (report.error) return NextResponse.json({ error: 'No fue posible cargar el informe.' }, { status: 503 })
    if (!report.data) return NextResponse.json({ error: 'Informe no encontrado.' }, { status: 404 })

    const versions = await (supabase as any)
      .from('report_versions')
      .select('id,version,status_snapshot,created_by,created_at')
      .eq('organization_id', organizationId)
      .eq('report_id', reportId)
      .order('version', { ascending: false })

    if (versions.error) return NextResponse.json({ error: 'No fue posible cargar el historial del informe.' }, { status: 503 })

    return NextResponse.json({ report: report.data, versions: versions.data || [] }, {
      headers: { 'Cache-Control': 'private, no-store' },
    })
  }

  const reports = await (supabase as any)
    .from('reports')
    .select('id,course_id,student_id,objective_id,report_type,title,period,status,version,approved_at,updated_at')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (reports.error) return NextResponse.json({ error: 'No fue posible cargar los informes.' }, { status: 503 })

  return NextResponse.json({ reports: reports.data || [] }, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function POST(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const reportId = uuid(body.id)
  const reportType = text(body.reportType, 40)
  const status = text(body.status, 40) || 'draft'
  const title = text(body.title, 240)
  const reportBody = text(body.body, 40000)
  const period = text(body.period, 240)

  if (!reportTypes.has(reportType)) return NextResponse.json({ error: 'Tipo de informe inválido.' }, { status: 400 })
  if (!reportStatuses.has(status)) return NextResponse.json({ error: 'Estado de informe inválido.' }, { status: 400 })
  if (!title || !reportBody) return NextResponse.json({ error: 'El informe requiere título y contenido.' }, { status: 400 })

  const saved = await (supabase as any).rpc('save_report', {
    p_organization_id: organizationId,
    p_report_id: reportId,
    p_report_type: reportType,
    p_title: title,
    p_period: period || null,
    p_body: reportBody,
    p_status: status,
    p_course_id: uuid(body.courseId),
    p_student_id: uuid(body.studentId),
    p_objective_id: uuid(body.objectiveId),
  })

  if (saved.error) {
    const message = String(saved.error.message || '')
    const statusCode = /FORBIDDEN|AUTH|permission/i.test(message) ? 403 : /NOT_FOUND/i.test(message) ? 404 : 503
    return NextResponse.json({ error: 'No fue posible guardar el informe.', code: message.slice(0, 120) }, { status: statusCode })
  }

  return NextResponse.json({ report: saved.data })
}
