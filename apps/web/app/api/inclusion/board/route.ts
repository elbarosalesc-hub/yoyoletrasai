import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function text(value: unknown, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function normalizePicto(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const row = value as Record<string, unknown>
  const id = Number(row.id)
  const icon = text(row.icon, 24)
  const label = text(row.label, 80)
  const color = text(row.color, 20)
  if (!Number.isSafeInteger(id) || id <= 0 || !icon || !label || !/^#[0-9a-f]{6}$/i.test(color)) return null
  return { id, icon, label, color }
}

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

  const { data, error } = await (supabase as any)
    .from('inclusion_boards')
    .select('title,payload,updated_at')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: 'No fue posible cargar el tablero institucional.', code: error.code || 'BOARD_LOAD_FAILED' }, { status: 503 })

  return NextResponse.json({
    board: data ? { title: data.title, ...(data.payload || {}), updatedAt: data.updated_at } : null,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PUT(request: Request) {
  const { supabase, userId, organizationId } = await context()
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const title = text(body.title, 160) || 'Mi rutina de trabajo autónomo'
  if (!Array.isArray(body.board) || body.board.length > 40) {
    return NextResponse.json({ error: 'Tablero inválido.' }, { status: 400 })
  }
  const board = body.board.map(normalizePicto)
  if (board.some((item) => item === null)) {
    return NextResponse.json({ error: 'Uno o más pictogramas son inválidos.' }, { status: 400 })
  }

  const size = text(body.size, 40)
  const visualMode = text(body.visualMode, 60)
  const textMode = text(body.textMode, 60)
  if (!['Pequeño','Mediano','Grande'].includes(size) ||
      !['Estándar','Alto contraste','Blanco y negro'].includes(visualMode) ||
      !['Lectura fácil','Texto completo','Solo imagen'].includes(textMode)) {
    return NextResponse.json({ error: 'Configuración de tablero inválida.' }, { status: 400 })
  }

  const payload = {
    board,
    showNumbers: body.showNumbers !== false,
    includeAudio: body.includeAudio !== false,
    markCompleted: body.markCompleted === true,
    size,
    visualMode,
    textMode,
  }

  const { error } = await (supabase as any)
    .from('inclusion_boards')
    .upsert({
      organization_id: organizationId,
      user_id: userId,
      title,
      payload,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'organization_id,user_id' })

  if (error) return NextResponse.json({ error: 'No fue posible guardar el tablero institucional.', code: error.code || 'BOARD_SAVE_FAILED' }, { status: 503 })

  return NextResponse.json({ ok: true })
}
