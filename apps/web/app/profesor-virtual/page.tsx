import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { VirtualTeacherClient } from './VirtualTeacherClient'

export const dynamic = 'force-dynamic'

export default async function ProfesorVirtualPage() {
  const context = await requireOrganizationContext('/profesor-virtual')

  return (
    <AppShell active="Profesor Virtual">
      <VirtualTeacherClient
        displayName={context.displayName}
        organization={context.organization.name}
      />
    </AppShell>
  )
}
