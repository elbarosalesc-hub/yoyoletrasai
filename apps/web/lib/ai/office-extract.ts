import { inflateRawSync } from 'node:zlib'
import { sourceExtension } from '@/lib/ai/source-files'

type ZipEntry = { name: string; data: Buffer }

const EOCD_SIGNATURE = 0x06054b50
const CENTRAL_SIGNATURE = 0x02014b50
const LOCAL_SIGNATURE = 0x04034b50
const MAX_EXTRACTED_CHARS = 900_000

function decodeXml(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
}

function xmlText(xml: string) {
  return decodeXml(
    xml
      .replace(/<w:tab\s*\/?\s*>/gi, '\t')
      .replace(/<a:br\s*\/?\s*>/gi, '\n')
      .replace(/<text:line-break\s*\/?\s*>/gi, '\n')
      .replace(/<\/w:p>/gi, '\n')
      .replace(/<\/a:p>/gi, '\n')
      .replace(/<\/text:p>/gi, '\n')
      .replace(/<\/text:h>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

function findEocd(buffer: Buffer) {
  const start = Math.max(0, buffer.length - 65_557)
  for (let offset = buffer.length - 22; offset >= start; offset -= 1) {
    if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) return offset
  }
  return -1
}

function unzip(buffer: Buffer): ZipEntry[] {
  const eocd = findEocd(buffer)
  if (eocd < 0) throw new Error('ZIP_EOCD_NOT_FOUND')
  const totalEntries = buffer.readUInt16LE(eocd + 10)
  const centralOffset = buffer.readUInt32LE(eocd + 16)
  const entries: ZipEntry[] = []
  let cursor = centralOffset

  for (let index = 0; index < totalEntries; index += 1) {
    if (buffer.readUInt32LE(cursor) !== CENTRAL_SIGNATURE) throw new Error('ZIP_CENTRAL_INVALID')
    const method = buffer.readUInt16LE(cursor + 10)
    const compressedSize = buffer.readUInt32LE(cursor + 20)
    const fileNameLength = buffer.readUInt16LE(cursor + 28)
    const extraLength = buffer.readUInt16LE(cursor + 30)
    const commentLength = buffer.readUInt16LE(cursor + 32)
    const localOffset = buffer.readUInt32LE(cursor + 42)
    const name = buffer.subarray(cursor + 46, cursor + 46 + fileNameLength).toString('utf8')

    if (buffer.readUInt32LE(localOffset) !== LOCAL_SIGNATURE) throw new Error('ZIP_LOCAL_INVALID')
    const localNameLength = buffer.readUInt16LE(localOffset + 26)
    const localExtraLength = buffer.readUInt16LE(localOffset + 28)
    const dataStart = localOffset + 30 + localNameLength + localExtraLength
    const compressed = buffer.subarray(dataStart, dataStart + compressedSize)
    let data: Buffer
    if (method === 0) data = compressed
    else if (method === 8) data = inflateRawSync(compressed)
    else {
      cursor += 46 + fileNameLength + extraLength + commentLength
      continue
    }
    entries.push({ name, data })
    cursor += 46 + fileNameLength + extraLength + commentLength
  }

  return entries
}

function naturalSort(a: string, b: string) {
  return a.localeCompare(b, 'es', { numeric: true, sensitivity: 'base' })
}

function extractDocx(entries: ZipEntry[]) {
  const parts = entries
    .filter(entry => /^word\/(document|header\d+|footer\d+)\.xml$/.test(entry.name))
    .sort((a, b) => naturalSort(a.name, b.name))
    .map(entry => xmlText(entry.data.toString('utf8')))
    .filter(Boolean)
  return parts.join('\n\n')
}

function extractPptx(entries: ZipEntry[]) {
  const slides = entries
    .filter(entry => /^ppt\/slides\/slide\d+\.xml$/.test(entry.name))
    .sort((a, b) => naturalSort(a.name, b.name))
    .map((entry, index) => `DIAPOSITIVA ${index + 1}\n${xmlText(entry.data.toString('utf8'))}`)
  return slides.join('\n\n')
}

function sharedStrings(entries: ZipEntry[]) {
  const shared = entries.find(entry => entry.name === 'xl/sharedStrings.xml')
  if (!shared) return []
  const xml = shared.data.toString('utf8')
  return [...xml.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/gi)].map(match => xmlText(match[1]))
}

function extractXlsx(entries: ZipEntry[]) {
  const shared = sharedStrings(entries)
  const sheets = entries
    .filter(entry => /^xl\/worksheets\/sheet\d+\.xml$/.test(entry.name))
    .sort((a, b) => naturalSort(a.name, b.name))

  return sheets.map((entry, index) => {
    const xml = entry.data.toString('utf8')
    const cells: string[] = []
    for (const match of xml.matchAll(/<c\b([^>]*)>([\s\S]*?)<\/c>/gi)) {
      const attrs = match[1]
      const body = match[2]
      const ref = /\br="([^"]+)"/i.exec(attrs)?.[1] || '?'
      const type = /\bt="([^"]+)"/i.exec(attrs)?.[1] || ''
      const value = /<v\b[^>]*>([\s\S]*?)<\/v>/i.exec(body)?.[1]
      const inline = /<is\b[^>]*>([\s\S]*?)<\/is>/i.exec(body)?.[1]
      const formula = /<f\b[^>]*>([\s\S]*?)<\/f>/i.exec(body)?.[1]
      let rendered = ''
      if (type === 's' && value !== undefined) rendered = shared[Number(value)] ?? value
      else if (type === 'inlineStr' && inline) rendered = xmlText(inline)
      else if (value !== undefined) rendered = decodeXml(value)
      if (formula) rendered = `${rendered}${rendered ? ' · ' : ''}fórmula=${decodeXml(formula)}`
      if (rendered.trim()) cells.push(`${ref}: ${rendered.trim()}`)
    }
    return `HOJA ${index + 1}\n${cells.join('\n')}`
  }).join('\n\n')
}

function extractOpenDocument(entries: ZipEntry[]) {
  const content = entries.find(entry => entry.name === 'content.xml')
  return content ? xmlText(content.data.toString('utf8')) : ''
}

export function isExtractableOfficeFile(fileName: string) {
  return ['docx','pptx','xlsx','odt','odp','ods'].includes(sourceExtension(fileName))
}

export function extractOfficeText(fileName: string, bytes: ArrayBuffer) {
  const extension = sourceExtension(fileName)
  const entries = unzip(Buffer.from(bytes))
  let text = ''
  if (extension === 'docx') text = extractDocx(entries)
  else if (extension === 'pptx') text = extractPptx(entries)
  else if (extension === 'xlsx') text = extractXlsx(entries)
  else if (['odt','odp','ods'].includes(extension)) text = extractOpenDocument(entries)
  if (!text.trim()) throw new Error('OFFICE_TEXT_EMPTY')
  return text.slice(0, MAX_EXTRACTED_CHARS)
}
