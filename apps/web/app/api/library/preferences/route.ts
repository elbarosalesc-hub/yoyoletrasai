import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const slugPattern = /^[a-z0-9][a-z0-9-]{0,159}$/

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
    .from('user_platform_preferences')
    .select('library_favorites,library_view')
    .eq('user_id', userId)
    .eq('organization_id', organizationId)
    .maybeSingle()

  if (result.error) return NextResponse.json({ error: 'No fue posible cargar las preferencias de Biblioteca.' }, { status: 503 })

  return NextResponse.json({
    favorites: Array.isArray(result.data?.library_favorites) ? result.data.library_favorites.slice(0, 200) : [],
    view: result.data?.library_view === 'list' ? 'list' : 'grid',
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PUT(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const values: Record<string, unknown> = {
    user_id: userId,
    organization_id: organizationId,
    updated_at: new Date().toISOString(),
  }

  if ('favorites' in body) {
    if (!Array.isArray(body.favorites) || body.favorites.length > 200) {
      return NextResponse.json({ error: 'Favoritos inválidos.' }, { status: 400 })
    }
    const favorites = [...new Set(body.favorites.filter((item): item is string =>
      typeof item === 'string' && slugPattern.test(item)
    ))]
    if (favorites.length !== body.favorites.length) {
      return NextResponse.json({ error: 'Uno o más favoritos son inválidos.' }, { status: 400 })
    }
    values.library_favorites = favorites
  }

  if ('view' in body) {
    if (body.view !== 'grid' && body.view !== 'list') {
      return NextResponse.json({ error: 'Modo de vista inválido.' }, { status: 400 })
    }
    values.library_view = body.view
  }

  if (!('library_favorites' in values) && !('library_view' in values)) {
    return NextResponse.json({ error: 'No hay preferencias para guardar.' }, { status: 400 })
  }

  const result = await (supabase as any)
    .from('user_platform_preferences')
    .upsert(values, { onConflict: 'user_id,organization_id' })

  if (result.error) return NextResponse.json({ error: 'No fue posible guardar las preferencias de Biblioteca.' }, { status: 503 })
  return NextResponse.json({ ok: true })
}
