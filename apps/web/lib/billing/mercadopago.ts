export type BillingPlanKey = 'premium' | 'institution'

type MercadoPagoPreapproval = {
  id?: string
  preapproval_plan_id?: string
  external_reference?: string | number
  init_point?: string
  status?: string
  payer_email?: string
  next_payment_date?: string
  last_modified?: string
  error?: string
  message?: string
}

const API_BASE = 'https://api.mercadopago.com'

function cleanBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '')
}

export function getMercadoPagoConfig() {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim() || ''
  const webhookSecret = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim() || ''
  const productionUrl = cleanBaseUrl(process.env.YOYO_PRODUCTION_URL || '')
  const plans: Record<BillingPlanKey, string> = {
    premium: process.env.MERCADOPAGO_PREMIUM_PLAN_ID?.trim() || '',
    institution: process.env.MERCADOPAGO_INSTITUTION_PLAN_ID?.trim() || '',
  }
  return {
    accessToken,
    webhookSecret,
    productionUrl,
    plans,
    apiConfigured: Boolean(accessToken),
    webhookConfigured: Boolean(webhookSecret),
    checkoutConfigured: Boolean(accessToken && productionUrl && (plans.premium || plans.institution)),
  }
}

async function mercadoPagoFetch<T>(path: string, init: RequestInit = {}) {
  const { accessToken } = getMercadoPagoConfig()
  if (!accessToken) throw new Error('MERCADOPAGO_NOT_CONFIGURED')
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
    signal: AbortSignal.timeout(20_000),
  })
  const body = await response.json().catch(() => ({})) as T & { message?: string; error?: string }
  if (!response.ok) throw new Error(body.message || body.error || `MERCADOPAGO_${response.status}`)
  return body
}

export async function createMercadoPagoSubscription(input: {
  planKey: BillingPlanKey
  payerEmail: string
  externalReference: string
}) {
  const config = getMercadoPagoConfig()
  const planId = config.plans[input.planKey]
  if (!config.accessToken || !planId || !config.productionUrl) throw new Error('MERCADOPAGO_CHECKOUT_NOT_CONFIGURED')

  const body = await mercadoPagoFetch<MercadoPagoPreapproval>('/preapproval', {
    method: 'POST',
    body: JSON.stringify({
      preapproval_plan_id: planId,
      payer_email: input.payerEmail,
      external_reference: input.externalReference,
      back_url: `${config.productionUrl}/planes?billing=return`,
      status: 'pending',
    }),
  })

  if (!body.id || !body.init_point) throw new Error('MERCADOPAGO_INVALID_CHECKOUT_RESPONSE')
  return {
    id: body.id,
    checkoutUrl: body.init_point,
    status: body.status || 'pending',
    providerPlanId: body.preapproval_plan_id || planId,
    nextPaymentAt: body.next_payment_date || null,
  }
}

export async function getMercadoPagoSubscription(id: string) {
  const safeId = id.trim()
  if (!safeId || safeId.length > 180) throw new Error('MERCADOPAGO_INVALID_SUBSCRIPTION_ID')
  return mercadoPagoFetch<MercadoPagoPreapproval>(`/preapproval/${encodeURIComponent(safeId)}`)
}

function hexToBytes(hex: string) {
  if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) return null
  const bytes = new Uint8Array(hex.length / 2)
  for (let index = 0; index < bytes.length; index += 1) bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  return bytes
}

export async function verifyMercadoPagoWebhookSignature(input: {
  xSignature: string
  xRequestId: string
  dataId: string
}) {
  const secret = getMercadoPagoConfig().webhookSecret
  if (!secret) return false
  const parts = Object.fromEntries(input.xSignature.split(',').map((part) => part.trim().split('=', 2)))
  const ts = parts.ts || ''
  const signature = parts.v1 || ''
  const signatureBytes = hexToBytes(signature)
  if (!ts || !signatureBytes || !input.xRequestId || !input.dataId) return false

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify'],
  )
  const template = `id:${input.dataId};request-id:${input.xRequestId};ts:${ts};`
  return crypto.subtle.verify('HMAC', key, signatureBytes, new TextEncoder().encode(template))
}

export function normalizeMercadoPagoStatus(value: unknown) {
  const status = String(value || '').toLowerCase()
  if (status === 'authorized') return 'authorized'
  if (status === 'paused') return 'paused'
  if (status === 'cancelled' || status === 'canceled') return 'cancelled'
  if (status === 'pending') return 'pending'
  if (status === 'rejected') return 'rejected'
  return 'unknown'
}
