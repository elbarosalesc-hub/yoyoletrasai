import { AppShell } from '@/components/AppShell'
import { canManageCourses, requireOrganizationContext } from '@/lib/auth/organization-context'
import { CoursesManager } from './CoursesManager'

export const dynamic = 'force-dynamic'

type CourseRow = {
  id: string
  name: string
  level: string
  academic_year: number
  teacher_id: string | null
  is_active: boolean
}

type EnrollmentRow = { course_id: string; student_id: string; enrollment_status: string }
type ObjectiveRow = { id: string; course_id: string | null }
type EvidenceRow = { course_id: string | null; objective_id: string | null; achievement_level: string }
type MissionRow = { id: string; course_id: string; status: string }
type MissionProgressRow = { mission_id: string; status: string; progress: number | null }

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

  const courseRows = (courses ?? []) as CourseRow[]
  const courseIds = courseRows.map((course) => course.id)
  let enrollments: EnrollmentRow[] = []
  let objectives: ObjectiveRow[] = []
  let evidence: EvidenceRow[] = []
  let missions: MissionRow[] = []
  let missionProgress: MissionProgressRow[] = []

  if (courseIds.length) {
    const [enrollmentResult, objectiveResult, evidenceResult, missionResult] = await Promise.all([
      db.from('course_enrollments').select('course_id,student_id,enrollment_status').eq('organization_id', context.organization.id).in('course_id', courseIds).eq('enrollment_status', 'active'),
      db.from('learning_objectives').select('id,course_id').eq('organization_id', context.organization.id).in('course_id', courseIds).eq('is_active', true),
      db.from('learning_evidence').select('course_id,objective_id,achievement_level').eq('organization_id', context.organization.id).in('course_id', courseIds),
      db.from('learning_missions').select('id,course_id,status').eq('organization_id', context.organization.id).in('course_id', courseIds).in('status', ['draft','assigned']),
    ])
    enrollments = enrollmentResult.error ? [] : (enrollmentResult.data ?? []) as EnrollmentRow[]
    objectives = objectiveResult.error ? [] : (objectiveResult.data ?? []) as ObjectiveRow[]
    evidence = evidenceResult.error ? [] : (evidenceResult.data ?? []) as EvidenceRow[]
    missions = missionResult.error ? [] : (missionResult.data ?? []) as MissionRow[]

    const missionIds = missions.map((mission) => mission.id)
    if (missionIds.length) {
      const progressResult = await db.from('learning_mission_progress').select('mission_id,status,progress').eq('organization_id', context.organization.id).in('mission_id', missionIds)
      missionProgress = progressResult.error ? [] : (progressResult.data ?? []) as MissionProgressRow[]
    }
  }

  const enriched = courseRows.map((course) => {
    const courseEnrollments = enrollments.filter((row) => row.course_id === course.id)
    const courseObjectives = objectives.filter((row) => row.course_id === course.id)
    const courseEvidence = evidence.filter((row) => row.course_id === course.id)
    const courseMissions = missions.filter((row) => row.course_id === course.id)
    const missionIds = new Set(courseMissions.map((row) => row.id))
    const progressRows = missionProgress.filter((row) => missionIds.has(row.mission_id))
    const studentCount = new Set(courseEnrollments.map((row) => row.student_id)).size
    const evidenceObjectiveCount = new Set(courseEvidence.map((row) => row.objective_id).filter((value): value is string => Boolean(value))).size
    const needsSupport = progressRows.filter((row) => row.status === 'needs_support').length
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
