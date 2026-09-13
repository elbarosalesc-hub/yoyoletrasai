import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function safeId(value: string | null) {
  return value && /^[0-9a-f-]{36}$/i.test(value) ? value : null
}

function achievementSummary(rows: Array<Record<string, unknown>>) {
  const base = { achieved: 0, developing: 0, initial: 0, not_observed: 0 }
  for (const row of rows) {
    const level = String(row.achievement_level || '') as keyof typeof base
    if (level in base) base[level] += 1
  }
  return base
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const courseId = safeId(request.nextUrl.searchParams.get('courseId'))
  const studentId = safeId(request.nextUrl.searchParams.get('studentId'))

  const { data: courses, error: coursesError } = await (supabase as any)
    .from('courses')
    .select('id,name,level,academic_year')
    .eq('organization_id', organizationId)
    .eq('is_active', true)
    .order('academic_year', { ascending: false })
    .order('name')

  if (coursesError) return NextResponse.json({ error: 'No fue posible cargar los cursos.' }, { status: 503 })

  const courseList = (courses || []).map((course: any) => ({
    id: String(course.id),
    name: String(course.name),
    level: String(course.level),
    academicYear: Number(course.academic_year),
  }))

  if (!courseId) {
    return NextResponse.json({ courses: courseList }, { headers: { 'Cache-Control': 'private, no-store' } })
  }

  const selectedCourse = courseList.find((course: any) => course.id === courseId)
  if (!selectedCourse) return NextResponse.json({ error: 'Curso no disponible en la institución activa.' }, { status: 404 })

  const [enrollmentsResult, objectivesResult, evidenceResult] = await Promise.all([
    (supabase as any)
      .from('course_enrollments')
      .select('student_id')
      .eq('organization_id', organizationId)
      .eq('course_id', courseId)
      .eq('enrollment_status', 'active'),
    (supabase as any)
      .from('learning_objectives')
      .select('id,subject,code,title,description')
      .eq('organization_id', organizationId)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('subject')
      .order('code'),
    (supabase as any)
      .from('learning_evidence')
      .select('student_id,objective_id,achievement_level,autonomy_level,observed_at')
      .eq('organization_id', organizationId)
      .eq('course_id', courseId)
      .order('observed_at', { ascending: false })
      .limit(100),
  ])

  if (enrollmentsResult.error || objectivesResult.error || evidenceResult.error) {
    return NextResponse.json({ error: 'No fue posible cargar el contexto académico del curso.' }, { status: 503 })
  }

  const studentIds = [...new Set((enrollmentsResult.data || []).map((row: any) => String(row.student_id)).filter(Boolean))]
  let students: any[] = []
  if (studentIds.length) {
    const studentsResult = await (supabase as any)
      .from('students')
      .select('id,first_name,last_name,preferred_name,status')
      .eq('organization_id', organizationId)
      .in('id', studentIds)
      .eq('status', 'active')
      .order('last_name')
      .order('first_name')
    if (!studentsResult.error) students = studentsResult.data || []
  }

  const studentList = students.map((student: any) => ({
    id: String(student.id),
    displayName: String(student.preferred_name || `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'Estudiante'),
  }))

  const objectives = (objectivesResult.data || []).map((objective: any) => ({
    id: String(objective.id),
    subject: String(objective.subject),
    code: String(objective.code),
    title: String(objective.title),
    description: typeof objective.description === 'string' ? objective.description : '',
  }))

  const courseEvidence = (evidenceResult.data || []) as Array<Record<string, unknown>>
  const response: Record<string, unknown> = {
    courses: courseList,
    selectedCourse,
    students: studentList,
    objectives,
    metrics: {
      studentCount: studentList.length,
      evidenceCount: courseEvidence.length,
      achievement: achievementSummary(courseEvidence),
    },
  }

  if (studentId) {
    if (!studentIds.includes(studentId)) return NextResponse.json({ error: 'El estudiante no pertenece al curso seleccionado.' }, { status: 404 })

    const [supportResult, studentEvidenceResult] = await Promise.all([
      (supabase as any)
        .from('student_support_profiles')
        .select('support_status,strengths,barriers,interests,access_accommodations,objective_accommodations,assistive_technology,evidence_notes')
        .eq('organization_id', organizationId)
        .eq('student_id', studentId)
        .maybeSingle(),
      (supabase as any)
        .from('learning_evidence')
        .select('objective_id,evidence_type,description,achievement_level,support_used,autonomy_level,observed_at')
        .eq('organization_id', organizationId)
        .eq('student_id', studentId)
        .eq('course_id', courseId)
        .order('observed_at', { ascending: false })
        .limit(8),
    ])

    const support = !supportResult.error && supportResult.data ? supportResult.data : null
    const recentEvidence = !studentEvidenceResult.error ? (studentEvidenceResult.data || []) : []
    response.studentContext = {
      studentId,
      support: support ? {
        status: support.support_status || null,
        strengths: support.strengths || '',
        barriers: support.barriers || '',
        interests: support.interests || '',
        accessAccommodations: support.access_accommodations || '',
        objectiveAccommodations: support.objective_accommodations || '',
        assistiveTechnology: support.assistive_technology || '',
        evidenceNotes: support.evidence_notes || '',
      } : null,
      recentEvidence: recentEvidence.map((item: any) => ({
        objectiveId: String(item.objective_id || ''),
        type: String(item.evidence_type || ''),
        description: String(item.description || '').slice(0, 700),
        achievementLevel: String(item.achievement_level || ''),
        supportUsed: String(item.support_used || '').slice(0, 500),
        autonomyLevel: String(item.autonomy_level || ''),
        observedAt: String(item.observed_at || ''),
      })),
    }
  }

  return NextResponse.json(response, { headers: { 'Cache-Control': 'private, no-store' } })
}
