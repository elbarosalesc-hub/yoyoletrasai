import { OFFICIAL_SOURCE_DOMAINS, uniqueOfficialSources } from './official-sources'

export type OfficialSearchResult = {
  query: string
  text: string
  sources: { title: string; url: string; domain: string }[]
  searched: boolean
  provider: string
}

function configuredEndpoint() {
  return String(process.env.YOYO_OFFICIAL_SEARCH_URL || '').replace(/\/$/, '')
}

function configuredToken() {
  return String(process.env.YOYO_OFFICIAL_SEARCH_TOKEN || '')
}

export function officialSearchStatus() {
  const endpoint = configuredEndpoint()
  return {
    configured: Boolean(endpoint),
    provider: endpoint ? 'yoyo-official-search' : 'not-configured',
    domainCount: OFFICIAL_SOURCE_DOMAINS.length,
    officialOnly: true,
  }
}

export async function searchOfficialSources(query: string): Promise<OfficialSearchResult> {
  const endpoint = configuredEndpoint()
  if (!endpoint) {
    return { query, text: '', sources: [], searched: false, provider: 'not-configured' }
  }

  const response = await fetch(`${endpoint}/v1/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(configuredToken() ? { Authorization: `Bearer ${configuredToken()}` } : {}),
    },
    body: JSON.stringify({
      query,
      officialOnly: true,
      allowedDomains: OFFICIAL_SOURCE_DOMAINS,
      maxResults: 12,
      freshness: 'auto',
    }),
    signal: AbortSignal.timeout(45000),
  })

  if (!response.ok) throw new Error(`YOYO_OFFICIAL_SEARCH_HTTP_${response.status}`)
  const payload = await response.json().catch(() => ({}))
  const sources = uniqueOfficialSources(payload)
  const text = typeof payload?.text === 'string'
    ? payload.text
    : typeof payload?.answer === 'string'
      ? payload.answer
      : typeof payload?.summary === 'string'
        ? payload.summary
        : ''

  return { query, text, sources, searched: true, provider: 'yoyo-official-search' }
}
