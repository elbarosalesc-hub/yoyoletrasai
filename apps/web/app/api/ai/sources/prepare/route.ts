import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isAllowedSourceFile, sanitizeSourceFileName, YOYO_SOURCE_BUCKET } from '@/lib/ai/source-files'

type LooseQuery = {
  select: (columns: string) => LooseQuery
  eq: (column: string, value: string) => LooseQuery
  in: (column: string, values: string[]) => LooseQuery
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }>
  insert: (values: Record<string, unknown> | Record<string, unknown>[]) => { select: (columns: string) => Promise<{ data: Record<string, unknown>[] | null; error: { message?: string } | null }> }
}
type LooseClient = { from: (table: string) => LooseQuery }

type InputFile = { name?: string; size?: number; type?: string }

export async function POST(request: Request) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const body = await request.json().catch(() => ({})) as { files?: InputFile[] }
  const files = Array.isArray(body.files) ? body.files.slice(0, 200) : []
  if (!files.length) return NextResponse.json({ error: 'No se recibieron archivos.' }, { status: 400 })

  const db = supabase as unknown as LooseClient
  const entitlement = await db.from('ai_entitlements').select('organization_id,plan_id,status').eq('user_id', userId).in('status', ['active','trialing']).maybeSingle()
  if (entitlement.error || !entitlement.data) return NextResponse.json({ error: 'No existe un plan activo.' }, { status: 403 })

  const planId = String(entitlement.data.plan_id || '')
  const organizationId = String(entitlement.data.organization_id || '')
  const plan = await db.from('ai_plans').select('max_files_per_request,max_file_bytes,max_total_file_bytes').eq('id', planId).maybeSingle()
  if (plan.error || !plan.data) return NextResponse.json({ error: 'No fue posible verificar los límites del plan.' }, { status: 503 })

  const maxFiles = Number(plan.data.max_files_per_request ?? 0)
  const maxFileBytes = Number(plan.data.max_file_bytes ?? 0)
  const maxTotalBytes = Number(plan.data.max_total_file_bytes ?? 0)
  const normalized = files.map(file => ({ name: String(file.name || '').slice(0,160), size: Math.max(0, Number(file.size) || 0), type: String(file.type || 'application/octet-stream').slice(0,160) }))
  const totalBytes = normalized.reduce((sum,file)=>sum+file.size,0)

  if (maxFiles !== -1 && normalized.length > maxFiles) return NextResponse.json({ error: 'La cantidad de archivos supera el plan.' }, { status: 413 })
  if (normalized.some(file => !file.name || !isAllowedSourceFile(file.name))) return NextResponse.json({ error: 'Uno o más formatos no están permitidos.' }, { status: 415 })
  if (normalized.some(file => file.size < 1 || file.size > maxFileBytes) || totalBytes > maxTotalBytes) return NextResponse.json({ error: 'Los archivos superan los límites de tamaño del plan.' }, { status: 413 })

  const batchId = crypto.randomUUID()
  const rows = normalized.map((file,index) => {
    const objectPath = `${userId}/${batchId}/${String(index+1).padStart(3,'0')}-${sanitizeSourceFileName(file.name)}`
    return { organization_id: organizationId, user_id: userId, plan_id: planId, storage_provider: 'google_cloud_storage', object_path: objectPath, file_name: file.name, media_type: file.type, expected_bytes: file.size, status: 'uploading' }
  })

  const inserted = await db.from('ai_source_files').insert(rows).select('id,object_path,file_name,media_type,expected_bytes,status')
  if (inserted.error || !inserted.data) return NextResponse.json({ error: 'No fue posible preparar la carga.' }, { status: 500 })

  return NextResponse.json({ bucket: YOYO_SOURCE_BUCKET, batchId, sources: inserted.data })
}
