import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { YOYO_SOURCE_BUCKET } from '@/lib/ai/source-files'

type LooseClient = {
  from: (table: string) => {
    select: (columns: string) => { eq: (column: string, value: string) => { maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }> } }
    update: (values: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }> }
  }
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as { sourceId?: string }
  const sourceId = typeof body.sourceId === 'string' ? body.sourceId : ''
  if (!sourceId) return NextResponse.json({ error: 'Falta sourceId.' }, { status: 400 })

  const db = supabase as unknown as LooseClient
  const source = await db.from('ai_source_files').select('id,user_id,object_path,expected_bytes,status').eq('id', sourceId).maybeSingle()
  if (source.error || !source.data || source.data.user_id !== userId) return NextResponse.json({ error: 'Fuente no encontrada.' }, { status: 404 })

  const objectPath = String(source.data.object_path || '')
  const parts = objectPath.split('/')
  const fileName = parts.pop() || ''
  const folder = parts.join('/')
  if (!fileName || !folder || !objectPath.startsWith(`${userId}/`)) return NextResponse.json({ error: 'Ruta de Storage inválida.' }, { status: 400 })

  const listing = await supabase.storage.from(YOYO_SOURCE_BUCKET).list(folder, { search: fileName, limit: 10 })
  if (listing.error) return NextResponse.json({ error: 'No fue posible verificar el archivo en Storage.' }, { status: 503 })
  const stored = (listing.data || []).find(item => item.name === fileName)
  const metadata = stored?.metadata as Record<string, unknown> | undefined
  const actualBytes = Number(metadata?.size || 0)
  const expectedBytes = Number(source.data.expected_bytes || 0)

  if (!stored || actualBytes < 1) return NextResponse.json({ error: 'El objeto todavía no está disponible en Storage.' }, { status: 409 })
  if (actualBytes !== expectedBytes) {
    await db.from('ai_source_files').update({ status: 'failed', actual_bytes: actualBytes, error_message: 'SIZE_MISMATCH' }).eq('id', sourceId)
    return NextResponse.json({ error: 'El tamaño real del archivo no coincide con la carga preparada.' }, { status: 409 })
  }

  await db.from('ai_source_files').update({ status: 'ready', actual_bytes: actualBytes, uploaded_at: new Date().toISOString(), error_message: null }).eq('id', sourceId)
  return NextResponse.json({ sourceId, status: 'ready', actualBytes, objectPath })
}
