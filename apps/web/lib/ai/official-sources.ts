export const OFFICIAL_SOURCE_DOMAINS = Object.freeze([
  'mineduc.cl',
  'curriculumnacional.cl',
  'agenciaeducacion.cl',
  'supereduc.cl',
  'cned.cl',
  'bcn.cl',
  'gob.cl',
  'ine.gob.cl',
  'minsal.cl',
  'dipres.gob.cl',
  'unesco.org',
  'oecd.org',
  'who.int',
  'un.org',
  'worldbank.org',
  'cepal.org',
  '.gov',
  '.gov.uk',
  '.europa.eu',
  'data.europa.eu',
] as const)

export type OfficialSource = {
  title: string
  url: string
  domain: string
}

function hostnameFor(value: string) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, '')
  } catch {
    return ''
  }
}

export function isOfficialSourceUrl(value: string) {
  const hostname = hostnameFor(value)
  if (!hostname) return false
  return OFFICIAL_SOURCE_DOMAINS.some((entry) => {
    if (entry.startsWith('.')) return hostname.endsWith(entry)
    return hostname === entry || hostname.endsWith(`.${entry}`)
  })
}

export function sourceDomain(value: string) {
  return hostnameFor(value)
}

export function shouldSearchOfficialSources(mode: string, prompt: string) {
  const normalizedMode = String(mode || '').toLowerCase()
  if (['research', 'sources', 'analysis', 'assessment', 'guide'].includes(normalizedMode)) return true
  return /(investig|fuente|evidencia|actual|vigente|normativa|ley|decreto|estad[ií]stic|dato oficial|curr[ií]cul|objetivo de aprendizaje|oa\b|mineduc|pie\b|dua\b)/i.test(prompt)
}

export function uniqueOfficialSources(input: unknown): OfficialSource[] {
  const found = new Map<string, OfficialSource>()
  const visit = (value: unknown) => {
    if (!value) return
    if (typeof value === 'string') {
      const matches = value.match(/https?:\/\/[^\s)\]}>"']+/g) || []
      for (const raw of matches) {
        const url = raw.replace(/[.,;:!?]+$/, '')
        if (!isOfficialSourceUrl(url)) continue
        found.set(url, { title: sourceDomain(url), url, domain: sourceDomain(url) })
      }
      return
    }
    if (Array.isArray(value)) {
      value.forEach(visit)
      return
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      const url = typeof record.url === 'string'
        ? record.url
        : typeof record.sourceUrl === 'string'
          ? record.sourceUrl
          : typeof record.link === 'string'
            ? record.link
            : ''
      if (url && isOfficialSourceUrl(url)) {
        const title = typeof record.title === 'string' && record.title.trim() ? record.title.trim() : sourceDomain(url)
        found.set(url, { title, url, domain: sourceDomain(url) })
      }
      Object.values(record).forEach(visit)
    }
  }
  visit(input)
  return [...found.values()].slice(0, 20)
}

export const OFFICIAL_RESEARCH_POLICY = `
POLÍTICA OBLIGATORIA DE INVESTIGACIÓN YOYO:
- Para hechos, normativa, estadísticas, currículo, salud, políticas públicas o información que pueda cambiar, usa evidencia recuperada desde fuentes oficiales verificables.
- No inventes citas, autores, enlaces, fechas, leyes, decretos, estadísticas ni referencias.
- Distingue hechos comprobados, inferencias y recomendaciones.
- Si la búsqueda oficial no aporta evidencia suficiente, indícalo expresamente y no completes el vacío con una suposición.
- En educación chilena prioriza MINEDUC, Currículum Nacional, Agencia de Calidad, Superintendencia de Educación, CNED y Biblioteca del Congreso Nacional.
- Para evidencia internacional prioriza organismos oficiales multilaterales y gubernamentales.
- Incluye trazabilidad: cada afirmación material debe poder relacionarse con una fuente recuperada.
`.trim()
