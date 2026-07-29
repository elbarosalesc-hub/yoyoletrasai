import type {Metadata} from 'next'
import TeacherDashboard from '../app/page'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'YOYOLETRASAI V2 | Vista previa oficial',
  description: 'Dashboard docente V2 aprobado para revisión visual.'
}

export default function V2PreviewPage() {
  return <TeacherDashboard />
}
