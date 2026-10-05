import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runEvolutionAudit, type EvolutionDb } from '@/lib/evolution/run-audit'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const db = supabase as unknown as EvolutionDb
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 400 })

  const membership = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('is_active', true)
    .eq('role', 'platform_admin')
    .maybeSingle()

  if (membership.error || !membership.data) {
    return NextResponse.json({ error: 'Sólo el perfil propietario puede ejecutar esta auditoría.' }, { status: 403 })
  }

  try {
    const result = await runEvolutionAudit(db, organizationId, 'owner_manual')
    return NextResponse.json(result)
  } catch {
    return NextResponse.json({ error: 'La auditoría no pudo completarse.' }, { status: 500 })
  }
}
