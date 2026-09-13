import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const experienceTypes = new Set(['resource','assessment','game','lesson','project','practice'])
const missionStatuses = new Set(['draft','assigned','closed','archived'])

function clean(value: unknown, max = 1000) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const missionId = clean(request.nextUrl.searchParams.get('missionId'), 80)
  if (missionId) {
    const missionResult = await (supabase as any)
      .from('learning_missions')
      .select('id,course_id,title,status')
      .eq('id', missionId)
      .eq('organization_id', organizationId)
      .maybeSingle()

    if (missionResult.error) return NextResponse.json({ error: 'No fue posible cargar la misión.' }, { status: 503 })
    if (!missionResult.data) return NextResponse.json({ error: 'Misión no encontrada.' }, { status: 404 })

    const progressResult = await (supabase as any)
      .from('learning_mission_progress')
      .select('student_id,status,progress,support_used,evidence_note,last_activity_at,students(first_name,last_name,preferred_name)')
      .eq('organization_id', organizationId)
      .eq('mission_id', missionId)
      .order('last_activity_at', { ascending: false, nullsFirst: false })

    if (progressResult.error) return NextResponse.json({ error: 'No fue posible cargar el seguimiento de estudiantes.' }, { status: 503 })

    const students = (progressResult.data || []).map((row: any) => ({
      studentId: row.student_id,
      status: row.status,
      progress: Number(row.progress || 0),
      supportUsed: row.support_used || '',
      evidenceNote: row.evidence_note || '',
      lastActivityAt: row.last_activity_at,
      student: row.students ? {
        firstName: row.students.first_name,
        lastName: row.students.last_name,
        preferredName: row.students.preferred_name,
      } : null,
    }))

    return NextResponse.json({ mission: missionResult.data, students }, { headers: { 'Cache-Control': 'private, no-store' } })
  }

  const [missionsResult, coursesResult] = await Promise.all([
    (supabase as any).from('learning_missions').select('id,course_id,objective_id,title,description,experience_type,source_href,support_profile,differentiation,due_at,status,created_at').eq('organization_id', organizationId).order('created_at', { ascending: false }).limit(60),
    (supabase as any).from('courses').select('id,name,level,academic_year').eq('organization_id', organizationId).eq('is_active', true).order('name'),
  ])

  if (missionsResult.error || coursesResult.error) return NextResponse.json({ error: 'No fue posible cargar las misiones.' }, { status: 503 })
  const missions = missionsResult.data || []
  const ids = missions.map((item: any) => item.id)
  let progress: any[] = []
  if (ids.length) {
    const progressResult = await (supabase as any).from('learning_mission_progress').select('mission_id,status,progress').eq('organization_id', organizationId).in('mission_id', ids)
    if (!progressResult.error) progress = progressResult.data || []
  }

  const enriched = missions.map((mission: any) => {
    const rows = progress.filter((item: any) => item.mission_id === mission.id)
    const completed = rows.filter((item: any) => item.status === 'completed').length
    const needsSupport = rows.filter((item: any) => item.status === 'needs_support').length
    const averageProgress = rows.length ? Math.round(rows.reduce((sum: number, item: any) => sum + Number(item.progress || 0), 0) / rows.length) : 0
    return { ...mission, progressSummary: { assigned: rows.length, completed, needsSupport, averageProgress } }
  })

  return NextResponse.json({ missions: enriched, courses: coursesResult.data || [] }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const courseId = clean(body.courseId, 80)
  const objectiveId = clean(body.objectiveId, 80) || null
  const title = clean(body.title, 180)
  const description = clean(body.description, 2000)
  const experienceType = experienceTypes.has(String(body.experienceType)) ? String(body.experienceType) : 'lesson'
  const sourceHref = clean(body.sourceHref, 500) || null
  const supportProfile = clean(body.supportProfile, 1200) || null
  const dueAt = clean(body.dueAt, 80) || null
  const status = missionStatuses.has(String(body.status)) ? String(body.status) : 'assigned'
  const differentiation = typeof body.differentiation === 'object' && body.differentiation ? body.differentiation : {}

  if (!courseId || !title) return NextResponse.json({ error: 'Selecciona un curso y escribe un título.' }, { status: 400 })

  const courseResult = await (supabase as any).from('courses').select('id').eq('id', courseId).eq('organization_id', organizationId).eq('is_active', true).maybeSingle()
  if (courseResult.error || !courseResult.data) return NextResponse.json({ error: 'Curso no autorizado.' }, { status: 403 })

  const insertResult = await (supabase as any).from('learning_missions').insert({
    organization_id: organizationId,
    course_id: courseId,
    objective_id: objectiveId,
    title,
    description,
    experience_type: experienceType,
    source_href: sourceHref,
    support_profile: supportProfile,
    differentiation,
    due_at: dueAt,
    status,
    created_by: userId,
  }).select('id,course_id,title,status').single()

  if (insertResult.error || !insertResult.data) return NextResponse.json({ error: 'No fue posible crear la misión.' }, { status: 500 })

  if (status === 'assigned') {
    const enrollments = await (supabase as any).from('course_enrollments').select('student_id').eq('organization_id', organizationId).eq('course_id', courseId).eq('enrollment_status', 'active')
    const rows = (enrollments.data || []).map((item: any) => ({ organization_id: organizationId, mission_id: insertResult.data.id, student_id: item.student_id, status: 'assigned', progress: 0, updated_by: userId }))
    if (rows.length) await (supabase as any).from('learning_mission_progress').insert(rows)
  }

  return NextResponse.json({ mission: insertResult.data }, { status: 201 })
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const missionId = clean(body.missionId, 80)
  const studentId = clean(body.studentId, 80)
  const status = ['assigned','in_progress','completed','needs_support'].includes(String(body.status)) ? String(body.status) : 'in_progress'
  const progress = Math.max(0, Math.min(100, Number(body.progress || 0)))
  const evidenceNote = clean(body.evidenceNote, 1200) || null
  const supportUsed = clean(body.supportUsed, 800) || null
  if (!missionId || !studentId) return NextResponse.json({ error: 'Faltan identificadores de seguimiento.' }, { status: 400 })

  const missionResult = await (supabase as any).from('learning_missions').select('id').eq('id', missionId).eq('organization_id', organizationId).maybeSingle()
  if (missionResult.error || !missionResult.data) return NextResponse.json({ error: 'Misión no autorizada.' }, { status: 403 })

  const studentResult = await (supabase as any).from('students').select('id').eq('id', studentId).eq('organization_id', organizationId).maybeSingle()
  if (studentResult.error || !studentResult.data) return NextResponse.json({ error: 'Estudiante no autorizado.' }, { status: 403 })

  const updateResult = await (supabase as any).from('learning_mission_progress').update({ status, progress, evidence_note: evidenceNote, support_used: supportUsed, last_activity_at: new Date().toISOString(), updated_by: userId }).eq('organization_id', organizationId).eq('mission_id', missionId).eq('student_id', studentId)
  if (updateResult.error) return NextResponse.json({ error: 'No fue posible actualizar el progreso.' }, { status: 500 })
  return NextResponse.json({ ok: true })
}
