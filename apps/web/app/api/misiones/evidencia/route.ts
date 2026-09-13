import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const staffRoles = new Set(['teacher','pie','utp','principal','institution_admin','platform_admin'])
const achievementLevels = new Set(['achieved','developing','initial','not_observed'])
const autonomyLevels = new Set(['independent','partial_support','full_support','not_observed'])

function clean(value: unknown, max = 1200) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : ''
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const membershipResult = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('is_active', true)

  if (membershipResult.error || !(membershipResult.data || []).some((row) => staffRoles.has(row.role))) {
    return NextResponse.json({ error: 'Tu rol no puede registrar evidencias de aprendizaje.' }, { status: 403 })
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const missionId = clean(body.missionId, 80)
  const studentId = clean(body.studentId, 80)
  const achievementLevel = clean(body.achievementLevel, 40)
  const autonomyLevel = clean(body.autonomyLevel, 40)

  if (!missionId || !studentId) return NextResponse.json({ error: 'Faltan identificadores de misión o estudiante.' }, { status: 400 })
  if (!achievementLevels.has(achievementLevel) || !autonomyLevels.has(autonomyLevel)) {
    return NextResponse.json({ error: 'Selecciona nivel de logro y autonomía antes de registrar la evidencia.' }, { status: 400 })
  }

  const db = supabase as any
  const [missionResult, progressResult, studentResult] = await Promise.all([
    db.from('learning_missions').select('id,course_id,objective_id,title,experience_type').eq('id', missionId).eq('organization_id', organizationId).maybeSingle(),
    db.from('learning_mission_progress').select('status,progress,evidence_note,support_used,last_activity_at').eq('organization_id', organizationId).eq('mission_id', missionId).eq('student_id', studentId).maybeSingle(),
    db.from('students').select('id').eq('id', studentId).eq('organization_id', organizationId).maybeSingle(),
  ])

  if (missionResult.error || !missionResult.data) return NextResponse.json({ error: 'Misión no autorizada.' }, { status: 403 })
  if (studentResult.error || !studentResult.data) return NextResponse.json({ error: 'Estudiante no autorizado.' }, { status: 403 })
  if (progressResult.error || !progressResult.data) return NextResponse.json({ error: 'No existe seguimiento para este estudiante en la misión.' }, { status: 404 })

  const mission = missionResult.data
  const progress = progressResult.data
  if (!mission.objective_id) return NextResponse.json({ error: 'La misión debe estar vinculada a un OA antes de transformarse en evidencia.' }, { status: 409 })
  if (progress.status !== 'completed') return NextResponse.json({ error: 'Marca la misión como completada antes de registrar la evidencia.' }, { status: 409 })

  const evidenceNote = clean(progress.evidence_note, 1200)
  if (evidenceNote.length < 2) return NextResponse.json({ error: 'Registra primero una evidencia breve y observable en la misión.' }, { status: 409 })

  const objectiveResult = await db
    .from('learning_objectives')
    .select('id,course_id')
    .eq('id', mission.objective_id)
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .maybeSingle()

  if (objectiveResult.error || !objectiveResult.data) return NextResponse.json({ error: 'El OA vinculado no está disponible en la institución.' }, { status: 409 })
  if (objectiveResult.data.course_id && objectiveResult.data.course_id !== mission.course_id) {
    return NextResponse.json({ error: 'El OA vinculado pertenece a otro curso.' }, { status: 409 })
  }

  const observedAt = progress.last_activity_at
    ? new Date(progress.last_activity_at).toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  const description = `${evidenceNote} [Misión YOYO: ${clean(mission.title, 180)}]`

  const duplicateResult = await db
    .from('learning_evidence')
    .select('id')
    .eq('organization_id', organizationId)
    .eq('student_id', studentId)
    .eq('objective_id', mission.objective_id)
    .eq('course_id', mission.course_id)
    .eq('observed_at', observedAt)
    .eq('description', description)
    .maybeSingle()

  if (duplicateResult.error) return NextResponse.json({ error: 'No fue posible verificar evidencias previas.' }, { status: 503 })
  if (duplicateResult.data) return NextResponse.json({ evidenceId: duplicateResult.data.id, duplicate: true })

  const evidenceType = mission.experience_type === 'assessment' ? 'assessment' : mission.experience_type === 'project' ? 'project' : mission.experience_type === 'game' ? 'performance' : 'observation'
  const insertResult = await db.from('learning_evidence').insert({
    organization_id: organizationId,
    student_id: studentId,
    course_id: mission.course_id,
    objective_id: mission.objective_id,
    evidence_type: evidenceType,
    description,
    achievement_level: achievementLevel,
    support_used: clean(progress.support_used, 800) || null,
    autonomy_level: autonomyLevel,
    observed_at: observedAt,
    created_by: userId,
  }).select('id').single()

  if (insertResult.error || !insertResult.data) return NextResponse.json({ error: 'No fue posible registrar la evidencia de aprendizaje.' }, { status: 500 })
  return NextResponse.json({ evidenceId: insertResult.data.id, duplicate: false }, { status: 201 })
}
