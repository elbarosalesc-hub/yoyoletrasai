import { YOYO_SOURCE_BUCKET, sourceExtension } from '@/lib/ai/source-files'
import { extractOfficeText, isExtractableOfficeFile } from '@/lib/ai/office-extract'

const TEXT_EXTENSIONS = new Set(['txt','md','csv','tsv','html','htm','json','xml','sql','js','ts','py','yaml','yml'])
const IMAGE_EXTENSIONS = new Set(['png','jpg','jpeg','webp','gif'])
const LEGACY_OFFICE_EXTENSIONS = new Set(['doc','rtf','ppt','xls'])
const MAX_TEXT_FILE_BYTES = 1024 * 1024
const MAX_OFFICE_FILE_BYTES = 20 * 1024 * 1024
const MAX_TOTAL_CONTEXT_CHARS = 1_500_000
const MAX_DIRECT_BINARY_BYTES = 20 * 1024 * 1024
const MAX_TOTAL_DIRECT_BINARY_BYTES = 24 * 1024 * 1024

type SourceRow = {
  id: string
  file_name: string
  media_type: string
  object_path: string
  actual_bytes: number | null
  status: string
}

type SourceClient = {
  from: (table: string) => {
    select: (columns: string) => {
      in: (column: string, values: string[]) => {
        eq: (column: string, value: string) => Promise<{ data: SourceRow[] | null; error: { message?: string } | null }>
      }
    }
  }
  storage: {
    from: (bucket: string) => {
      download: (path: string) => Promise<{ data: Blob | null; error: { message?: string } | null }>
    }
  }
}

export type GatewayAttachment = {
  id: string
  fileName: string
  mediaType: string
  kind: 'pdf' | 'image'
  base64: string
}

export type PendingSource = {
  id: string
  fileName: string
  reason: 'legacy-office-pending' | 'office-extraction-failed' | 'binary-context-limit' | 'unsupported-binary'
}

export type LoadedSourceContext = {
  verified: SourceRow[]
  textContext: string
  analyzedSourceIds: string[]
  gatewayAttachments: GatewayAttachment[]
  pendingSources: PendingSource[]
}

async function downloadBlob(client: SourceClient, source: SourceRow) {
  const downloaded = await client.storage.from(YOYO_SOURCE_BUCKET).download(source.object_path)
  if (downloaded.error || !downloaded.data) throw new Error('SOURCE_DOWNLOAD_FAILED')
  return downloaded.data
}

function pushTextBlock(blocks: string[], sourceName: string, text: string, currentChars: number) {
  const remaining = MAX_TOTAL_CONTEXT_CHARS - currentChars
  if (remaining <= 0) return { added: 0, ok: false }
  const excerpt = text.slice(0, remaining).trim()
  if (!excerpt) return { added: 0, ok: false }
  blocks.push(`FUENTE VERIFICADA: ${sourceName}\n${excerpt}`)
  return { added: excerpt.length, ok: true }
}

export async function loadVerifiedSourceContext(client: unknown, userId: string, sourceIds: string[]): Promise<LoadedSourceContext> {
  const uniqueIds = [...new Set(sourceIds.filter(Boolean))].slice(0, 200)
  if (!uniqueIds.length) return { verified: [], textContext: '', analyzedSourceIds: [], gatewayAttachments: [], pendingSources: [] }

  const supabase = client as SourceClient
  const result = await supabase.from('ai_source_files')
    .select('id,file_name,media_type,object_path,actual_bytes,status')
    .in('id', uniqueIds)
    .eq('user_id', userId)

  if (result.error) throw new Error('SOURCE_LOOKUP_FAILED')
  const verified = (result.data || []).filter(source => source.status === 'ready' && source.object_path.startsWith(`${userId}/`))
  if (verified.length !== uniqueIds.length) throw new Error('SOURCE_NOT_READY')

  let chars = 0
  let binaryBytes = 0
  const blocks: string[] = []
  const analyzedSourceIds: string[] = []
  const gatewayAttachments: GatewayAttachment[] = []
  const pendingSources: PendingSource[] = []

  for (const source of verified) {
    const extension = sourceExtension(source.file_name)
    const bytes = Number(source.actual_bytes || 0)

    if (TEXT_EXTENSIONS.has(extension) && bytes <= MAX_TEXT_FILE_BYTES) {
      const blob = await downloadBlob(supabase, source)
      const resultText = pushTextBlock(blocks, source.file_name, await blob.text(), chars)
      if (resultText.ok) {
        chars += resultText.added
        analyzedSourceIds.push(source.id)
      } else {
        pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'binary-context-limit' })
      }
      continue
    }

    if (isExtractableOfficeFile(source.file_name)) {
      if (bytes < 1 || bytes > MAX_OFFICE_FILE_BYTES) {
        pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'binary-context-limit' })
        continue
      }
      try {
        const blob = await downloadBlob(supabase, source)
        const officeText = extractOfficeText(source.file_name, await blob.arrayBuffer())
        const resultText = pushTextBlock(blocks, source.file_name, officeText, chars)
        if (!resultText.ok) {
          pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'binary-context-limit' })
          continue
        }
        chars += resultText.added
        analyzedSourceIds.push(source.id)
      } catch {
        pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'office-extraction-failed' })
      }
      continue
    }

    const isPdf = extension === 'pdf'
    const isImage = IMAGE_EXTENSIONS.has(extension)
    if (isPdf || isImage) {
      if (bytes < 1 || bytes > MAX_DIRECT_BINARY_BYTES || binaryBytes + bytes > MAX_TOTAL_DIRECT_BINARY_BYTES) {
        pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'binary-context-limit' })
        continue
      }
      const blob = await downloadBlob(supabase, source)
      const base64 = Buffer.from(await blob.arrayBuffer()).toString('base64')
      gatewayAttachments.push({
        id: source.id,
        fileName: source.file_name,
        mediaType: source.media_type || (isPdf ? 'application/pdf' : `image/${extension === 'jpg' ? 'jpeg' : extension}`),
        kind: isPdf ? 'pdf' : 'image',
        base64,
      })
      binaryBytes += bytes
      analyzedSourceIds.push(source.id)
      continue
    }

    if (LEGACY_OFFICE_EXTENSIONS.has(extension)) {
      pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'legacy-office-pending' })
      continue
    }

    pendingSources.push({ id: source.id, fileName: source.file_name, reason: 'unsupported-binary' })
  }

  return { verified, textContext: blocks.join('\n\n---\n\n'), analyzedSourceIds, gatewayAttachments, pendingSources }
}
