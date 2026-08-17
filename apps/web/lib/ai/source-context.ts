import { YOYO_SOURCE_BUCKET, sourceExtension } from '@/lib/ai/source-files'

const TEXT_EXTENSIONS = new Set(['txt','md','csv','tsv','html','htm','json','xml','sql','js','ts','py','yaml','yml'])
const MAX_TEXT_FILE_BYTES = 1024 * 1024
const MAX_TOTAL_CONTEXT_CHARS = 1_500_000

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

export type LoadedSourceContext = {
  verified: SourceRow[]
  textContext: string
  analyzedSourceIds: string[]
  pendingBinarySourceIds: string[]
}

export async function loadVerifiedSourceContext(client: unknown, userId: string, sourceIds: string[]): Promise<LoadedSourceContext> {
  const uniqueIds = [...new Set(sourceIds.filter(Boolean))].slice(0, 200)
  if (!uniqueIds.length) return { verified: [], textContext: '', analyzedSourceIds: [], pendingBinarySourceIds: [] }

  const supabase = client as SourceClient
  const result = await supabase.from('ai_source_files')
    .select('id,file_name,media_type,object_path,actual_bytes,status')
    .in('id', uniqueIds)
    .eq('user_id', userId)

  if (result.error) throw new Error('SOURCE_LOOKUP_FAILED')
  const verified = (result.data || []).filter(source => source.status === 'ready' && source.object_path.startsWith(`${userId}/`))
  if (verified.length !== uniqueIds.length) throw new Error('SOURCE_NOT_READY')

  let chars = 0
  const blocks: string[] = []
  const analyzedSourceIds: string[] = []
  const pendingBinarySourceIds: string[] = []

  for (const source of verified) {
    const extension = sourceExtension(source.file_name)
    const bytes = Number(source.actual_bytes || 0)
    if (!TEXT_EXTENSIONS.has(extension) || bytes > MAX_TEXT_FILE_BYTES) {
      pendingBinarySourceIds.push(source.id)
      continue
    }

    const downloaded = await supabase.storage.from(YOYO_SOURCE_BUCKET).download(source.object_path)
    if (downloaded.error || !downloaded.data) throw new Error('SOURCE_DOWNLOAD_FAILED')
    const text = (await downloaded.data.text()).trim()
    if (!text) continue

    const remaining = MAX_TOTAL_CONTEXT_CHARS - chars
    if (remaining <= 0) break
    const excerpt = text.slice(0, remaining)
    blocks.push(`FUENTE: ${source.file_name}\n${excerpt}`)
    chars += excerpt.length
    analyzedSourceIds.push(source.id)
  }

  return { verified, textContext: blocks.join('\n\n---\n\n'), analyzedSourceIds, pendingBinarySourceIds }
}
