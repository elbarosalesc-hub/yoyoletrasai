import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const allowedStatuses = new Set(['draft','approved','archived'])

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

export async function GET() {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const result = await (supabase as any)
    .from('family_communications')
    .select('id,course_id,student_id,objective_id,report_id,title,body,status,channel,reviewed_by,reviewed_at,sent_at,created_at,updated_at')
    .eq('organization_id', organizationId)
    .order('updated_at', { ascending: false })
    .limit(50)

  if (result.error) return NextResponse.json({ error: 'No fue posible cargar las comunicaciones.' }, { status: 503 })

  return NextResponse.json({ communications: result.data || [] }, {
    headers: { 'Cache-Control': 'private, no-store' },
  })
}

export async function POST(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const id = uuid(body.id)
  const title = text(body.title, 240)
  const content = text(body.body, 30000)
  const status = text(body.status, 40) || 'draft'

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: 'Este endpoint no envía comunicaciones; usa draft, approved o archived.' }, { status: 400 })
  }
  if (!title || !content) return NextResponse.json({ error: 'La comunicación requiere título y contenido.' }, { status: 400 })

  const values: Record<string, unknown> = {
    organization_id: organizationId,
    course_id: uuid(body.courseId),
    student_id: uuid(body.studentId),
    objective_id: uuid(body.objectiveId),
    report_id: uuid(body.reportId),
    title,
    body: content,
    status,
    channel: 'manual',
    reviewed_by: status === 'approved' ? userId : null,
    reviewed_at: status === 'approved' ? new Date().toISOString() : null,
    archived_at: status === 'archived' ? new Date().toISOString() : null,
  }

  if (!id) {
    values.created_by = userId
    const inserted = await (supabase as any)
      .from('family_communications')
      .insert(values)
      .select('id,status,updated_at')
      .single()

    if (inserted.error) return NextResponse.json({ error: 'No fue posible guardar la comunicación.' }, { status: 503 })
    return NextResponse.json({ communication: inserted.data })
  }

  const current = await (supabase as any)
    .from('family_communications')
    .select('id,status')
    .eq('organization_id', organizationId)
    .eq('id', id)
    .maybeSingle()

  if (current.error) return NextResponse.json({ error: 'No fue posible verificar la comunicación.' }, { status: 503 })
  if (!current.data) return NextResponse.json({ error: 'Comunicación no encontrada.' }, { status: 404 })
  if (current.data.status === 'archived') {
    return NextResponse.json({ error: 'Una comunicación archivada no puede modificarse.' }, { status: 409 })
  }

  const updated = await (supabase as any)
    .from('family_communications')
    .update(values)
    .eq('organization_id', organizationId)
    .eq('id', id)
    .select('id,status,updated_at')
    .single()

  if (updated.error) return NextResponse.json({ error: 'No fue posible actualizar la comunicación.' }, { status: 503 })

  return NextResponse.json({ communication: updated.data })
}
