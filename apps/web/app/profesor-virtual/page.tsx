import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { ProfesorVirtualClient } from './ProfesorVirtualClient'

export const dynamic = 'force-dynamic'

export default async function ProfesorVirtualPage() {
  const context = await requireOrganizationContext('/profesor-virtual')

  return (
    <AppShell active="Profesor Virtual">
      <ProfesorVirtualClient
        displayName={context.displayName}
        organizationName={context.organization.name}
      />
    </AppShell>
  )
}
