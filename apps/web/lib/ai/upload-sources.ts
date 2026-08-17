'use client'

import { createClient } from '@/lib/supabase/client'

type PreparedSource = {
  id: string
  object_path: string
  file_name: string
  media_type: string
  expected_bytes: number
  status: string
}

export type UploadedSource = {
  id: string
  name: string
  size: number
  type: string
  objectPath: string
  status: 'ready'
}

export async function uploadYoyoSources(files: File[]): Promise<UploadedSource[]> {
  if (!files.length) return []

  const prepareResponse = await fetch('/api/ai/sources/prepare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ files: files.map(file => ({ name: file.name, size: file.size, type: file.type })) }),
  })
  const prepared = await prepareResponse.json()
  if (!prepareResponse.ok) throw new Error(prepared?.error || 'No fue posible preparar la carga de archivos.')

  const sources = (prepared?.sources || []) as PreparedSource[]
  if (sources.length !== files.length) throw new Error('La preparación de archivos quedó incompleta.')

  const supabase = createClient()
  const uploaded: UploadedSource[] = []

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index]
    const source = sources[index]
    if (!source?.id || !source.object_path) throw new Error('La ruta segura del archivo no está disponible.')

    const storageResult = await supabase.storage
      .from(String(prepared.bucket || 'yoyo-ai-sources'))
      .upload(source.object_path, file, {
        cacheControl: '3600',
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (storageResult.error) throw new Error(`No fue posible subir ${file.name}.`)

    const finalizeResponse = await fetch('/api/ai/sources/finalize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId: source.id }),
    })
    const finalized = await finalizeResponse.json()
    if (!finalizeResponse.ok || finalized?.status !== 'ready') {
      throw new Error(finalized?.error || `No fue posible verificar ${file.name}.`)
    }

    uploaded.push({
      id: source.id,
      name: file.name,
      size: Number(finalized.actualBytes || file.size),
      type: file.type || source.media_type || 'application/octet-stream',
      objectPath: source.object_path,
      status: 'ready',
    })
  }

  return uploaded
}
