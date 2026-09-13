import { AppShell } from '@/components/AppShell'
import { canManageCourses, requireOrganizationContext } from '@/lib/auth/organization-context'
import { CoursesManager } from './CoursesManager'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

export default async function CursosPage() {
  const context = await requireOrganizationContext('/cursos')
  const db = context.supabase as any
  const { data: courses, error } = await db
    .from('courses')
    .select('id, name, level, academic_year, teacher_id, is_active')
    .eq('organization_id', context.organization.id)
    .eq('is_active', true)
    .order('academic_year', { ascending: false })
    .order('name')

  if (error) throw new Error(`No fue posible cargar los cursos: ${error.message}`)

  const courseRows = (courses ?? []) as Row[]
  const courseIds = courseRows.map((course) => String(course.id))
  let enrollments: Row[] = []
  let objectives: Row[] = []
  let evidence: Row[] = []
  let missions: Row[] = []
  let missionProgress: Row[] = []

  if (courseIds.length) {
    const [enrollmentResult, objectiveResult, evidenceResult, missionResult] = await Promise.all([
      db.from('course_enrollments').select('course_id,student_id,enrollment_status').eq('organization_id', context.organization.id).in('course_id', courseIds).eq('enrollment_status', 'active'),
      db.from('learning_objectives').select('id,course_id').eq('organization_id', context.organization.id).in('course_id', courseIds).eq('is_active', true),
      db.from('learning_evidence').select('course_id,objective_id,achievement_level').eq('organization_id', context.organization.id).in('course_id', courseIds),
      db.from('learning_missions').select('id,course_id,status').eq('organization_id', context.organization.id).in('course_id', courseIds).in('status', ['draft','assigned']),
    ])
    enrollments = enrollmentResult.error ? [] : (enrollmentResult.data ?? [])
    objectives = objectiveResult.error ? [] : (objectiveResult.data ?? [])
    evidence = evidenceResult.error ? [] : (evidenceResult.data ?? [])
    missions = missionResult.error ? [] : (missionResult.data ?? [])

    const missionIds = missions.map((mission) => String(mission.id))
    if (missionIds.length) {
      const progressResult = await db.from('learning_mission_progress').select('mission_id,status,progress').eq('organization_id', context.organization.id).in('mission_id', missionIds)
      missionProgress = progressResult.error ? [] : (progressResult.data ?? [])
    }
  }

  const enriched = courseRows.map((course) => {
    const id = String(course.id)
    const courseEnrollments = enrollments.filter((row) => String(row.course_id) === id)
    const courseObjectives = objectives.filter((row) => String(row.course_id) === id)
    const courseEvidence = evidence.filter((row) => String(row.course_id) === id)
    const courseMissions = missions.filter((row) => String(row.course_id) === id)
    const missionIds = new Set(courseMissions.map((row) => String(row.id)))
    const progressRows = missionProgress.filter((row) => missionIds.has(String(row.mission_id)))
    const studentCount = new Set(courseEnrollments.map((row) => String(row.student_id))).size
    const evidenceObjectiveCount = new Set(courseEvidence.map((row) => String(row.objective_id)).filter(Boolean)).size
    const needsSupport = progressRows.filter((row) => String(row.status) === 'needs_support').length
    const averageProgress = progressRows.length
      ? Math.round(progressRows.reduce((sum, row) => sum + Number(row.progress || 0), 0) / progressRows.length)
      : 0

    return {
      ...course,
      metrics: {
        studentCount,
        objectiveCount: courseObjectives.length,
        evidenceObjectiveCount,
        activeMissionCount: courseMissions.length,
        needsSupport,
        averageProgress,
      },
    }
  })

  return (
    <AppShell active="Cursos y grupos">
      <CoursesManager
        courses={enriched}
        canManage={canManageCourses(context.role)}
        organizationName={context.organization.name}
      />
    </AppShell>
  )
}
