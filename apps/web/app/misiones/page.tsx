import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { LearningMissionsClient } from './LearningMissionsClient'

export const dynamic = 'force-dynamic'

export default async function LearningMissionsPage() {
  const context = await requireOrganizationContext('/misiones')
  return (
    <AppShell active="Misiones">
      <LearningMissionsClient organizationName={context.organization.name} />
    </AppShell>
  )
}
