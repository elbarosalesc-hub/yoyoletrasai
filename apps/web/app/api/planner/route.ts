import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const MAX_BLOCKS = 80
const MAX_SERIALIZED_CHARS = 500_000

async function context() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value || null
  return { supabase, userId, organizationId }
}

export async function GET() {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const result = await (supabase as any)
    .from('weekly_planners')
    .select('blocks,updated_at')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle()

  if (result.error) return NextResponse.json({ error: 'No fue posible cargar el planificador institucional.' }, { status: 503 })

  return NextResponse.json({
    blocks: Array.isArray(result.data?.blocks) ? result.data.blocks.slice(0, MAX_BLOCKS) : null,
    updatedAt: result.data?.updated_at || null,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PUT(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const blocks = Array.isArray(body.blocks) ? body.blocks.slice(0, MAX_BLOCKS) : null
  if (!blocks) return NextResponse.json({ error: 'Planificador inválido.' }, { status: 400 })

  if (JSON.stringify(blocks).length > MAX_SERIALIZED_CHARS) {
    return NextResponse.json({ error: 'El planificador supera el tamaño permitido.' }, { status: 413 })
  }

  const saved = await (supabase as any)
    .from('weekly_planners')
    .upsert({
      organization_id: organizationId,
      user_id: userId,
      blocks,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,user_id' })
    .select('updated_at')
    .single()

  if (saved.error) return NextResponse.json({ error: 'No fue posible guardar el planificador institucional.' }, { status: 503 })
  return NextResponse.json({ ok: true, updatedAt: saved.data?.updated_at || null })
}
