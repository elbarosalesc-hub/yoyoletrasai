type Message = { role: 'system' | 'user' | 'assistant'; content: unknown }

type ChatRequest = {
  model: string
  messages: Message[]
  maxTokens: number
  temperature?: number
  timeoutMs?: number
}

type CloudflareChatResponse = {
  choices?: Array<{ message?: { content?: unknown } }>
  usage?: Record<string, unknown>
  error?: { message?: string } | string
}

function cleanBaseUrl(value: string) {
  return value.replace(/\/+$/, '')
}

export function getCloudflareAIConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim() || ''
  const token = process.env.CLOUDFLARE_API_TOKEN?.trim() || ''
  const explicitUrl = process.env.YOYO_AI_GATEWAY_URL?.trim() || ''
  const url = explicitUrl
    ? cleanBaseUrl(explicitUrl)
    : accountId
      ? `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/v1/chat/completions`
      : ''

  return { accountId, token, url, configured: Boolean(token && url) }
}

function unwrap(body: unknown): CloudflareChatResponse {
  if (!body || typeof body !== 'object') return {}
  const record = body as Record<string, unknown>
  if (record.result && typeof record.result === 'object') return record.result as CloudflareChatResponse
  return record as CloudflareChatResponse
}

export async function cloudflareChatCompletion(request: ChatRequest) {
  const config = getCloudflareAIConfig()
  if (!config.configured) throw new Error('CLOUDFLARE_AI_NOT_CONFIGURED')

  const response = await fetch(config.url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: request.model,
      messages: request.messages,
      max_tokens: request.maxTokens,
      temperature: request.temperature ?? 0.3,
    }),
    signal: AbortSignal.timeout(request.timeoutMs ?? 90000),
  })

  const body = await response.json().catch(() => ({}))
  const raw = unwrap(body)
  if (!response.ok) {
    const message = typeof raw.error === 'string' ? raw.error : raw.error?.message
    throw new Error(message || `CLOUDFLARE_AI_${response.status}`)
  }

  const content = raw.choices?.[0]?.message?.content
  if (typeof content !== 'string' || !content.trim()) throw new Error('CLOUDFLARE_AI_EMPTY_RESPONSE')

  return {
    text: content,
    usage: raw.usage || {},
    provider: 'cloudflare-ai-rest',
  }
}
