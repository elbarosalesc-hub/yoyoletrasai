import { AppShell } from '@/components/AppShell'
import { requireOrganizationContext } from '@/lib/auth/organization-context'
import { AulaInteractivaClient } from './AulaInteractivaClient'

export const dynamic = 'force-dynamic'

export default async function AulaInteractivaPage() {
  const context = await requireOrganizationContext('/herramientas/aula')

  return (
    <AppShell active="Aula interactiva">
      <AulaInteractivaClient displayName={context.displayName} organizationName={context.organization.name} />
    </AppShell>
  )
}
