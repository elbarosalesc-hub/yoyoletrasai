import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function resourceKey(value: unknown) {
  const key = typeof value === 'string' ? value.trim().toLowerCase().slice(0, 160) : ''
  return /^[a-z0-9][a-z0-9-]*$/.test(key) ? key : null
}

async function context() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value || null
  return { supabase, userId, organizationId }
}

export async function GET(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const key = resourceKey(new URL(request.url).searchParams.get('key'))
  if (!key) return NextResponse.json({ error: 'Recurso inválido.' }, { status: 400 })

  const result = await (supabase as any)
    .from('resource_progress')
    .select('payload,updated_at')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('resource_key', key)
    .maybeSingle()

  if (result.error) return NextResponse.json({ error: 'No fue posible cargar el progreso.' }, { status: 503 })

  return NextResponse.json({
    progress: result.data?.payload || null,
    updatedAt: result.data?.updated_at || null,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PUT(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const key = resourceKey(body.key)
  const payload = body.payload
  if (!key || !payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return NextResponse.json({ error: 'Progreso inválido.' }, { status: 400 })
  }
  if (JSON.stringify(payload).length > 100000) {
    return NextResponse.json({ error: 'El progreso supera el tamaño permitido.' }, { status: 413 })
  }

  const result = await (supabase as any)
    .from('resource_progress')
    .upsert({
      organization_id: organizationId,
      user_id: userId,
      resource_key: key,
      payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,user_id,resource_key' })
    .select('updated_at')
    .single()

  if (result.error) return NextResponse.json({ error: 'No fue posible guardar el progreso.' }, { status: 503 })
  return NextResponse.json({ ok: true, updatedAt: result.data?.updated_at || null })
}
