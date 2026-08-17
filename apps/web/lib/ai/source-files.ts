export const YOYO_SOURCE_BUCKET = 'yoyo-ai-sources'

export const YOYO_ALLOWED_SOURCE_EXTENSIONS = new Set([
  'pdf','doc','docx','rtf','odt','ppt','pptx','odp','xls','xlsx','ods',
  'txt','md','csv','tsv','html','htm','json','xml','sql','js','ts','py','yaml','yml',
  'png','jpg','jpeg','webp','gif',
])

export function sourceExtension(fileName: string) {
  const match = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)
  return match?.[1] ?? ''
}

export function isAllowedSourceFile(fileName: string) {
  return YOYO_ALLOWED_SOURCE_EXTENSIONS.has(sourceExtension(fileName))
}

export function sanitizeSourceFileName(fileName: string) {
  const extension = sourceExtension(fileName)
  const base = fileName
    .replace(/\.[^.]+$/, '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100) || 'archivo'

  return extension ? `${base}.${extension}` : base
}
