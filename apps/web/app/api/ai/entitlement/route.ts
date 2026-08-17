import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type Row = Record<string, unknown>
type LooseQuery = {
  select: (columns: string) => LooseQuery
  eq: (column: string, value: string | boolean) => LooseQuery
  maybeSingle: () => Promise<{ data: Row | null; error: { message?: string } | null }>
}
type LooseClient = { from: (table: string) => LooseQuery }

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
    const userId = typeof claimsData?.claims?.sub === 'string' ? claimsData.claims.sub : null
    if (claimsError || !userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

    const organizationId = (await cookies()).get('yoyo-organization-id')?.value
    if (!organizationId) return NextResponse.json({ error: 'Institución no seleccionada' }, { status: 409 })

    const db = supabase as unknown as LooseClient
    const entitlementResult = await db
      .from('ai_entitlements')
      .select('plan_id,status,credential_id')
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .eq('status', 'active')
      .maybeSingle()

    if (entitlementResult.error || !entitlementResult.data) {
      return NextResponse.json({ error: 'No existe un plan de YOYO IA activo' }, { status: 404 })
    }

    const planId = String(entitlementResult.data.plan_id ?? '')
    const planResult = await db
      .from('ai_plans')
      .select('id,name,description,max_files_per_request,max_file_bytes,max_total_file_bytes,max_output_tokens,unlimited_file_analysis,model_tier,allowed_modes,monthly_ai_requests,monthly_research_requests,monthly_token_limit')
      .eq('id', planId)
      .eq('active', true)
      .maybeSingle()

    if (planResult.error || !planResult.data) {
      return NextResponse.json({ error: 'El plan de YOYO IA no está disponible' }, { status: 404 })
    }

    return NextResponse.json({
      credentialId: entitlementResult.data.credential_id,
      plan: planResult.data,
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch {
    return NextResponse.json({ error: 'YOYO IA no pudo verificar el plan activo' }, { status: 503 })
  }
}
