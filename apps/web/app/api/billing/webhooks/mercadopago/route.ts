import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getMercadoPagoConfig, getMercadoPagoSubscription, normalizeMercadoPagoStatus, verifyMercadoPagoWebhookSignature } from '@/lib/billing/mercadopago'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getDataId(request: NextRequest, body: Record<string, unknown>) {
  const queryId = request.nextUrl.searchParams.get('data.id') || request.nextUrl.searchParams.get('data_id')
  if (queryId) return queryId
  const data = body.data
  if (data && typeof data === 'object' && typeof (data as Record<string, unknown>).id !== 'undefined') return String((data as Record<string, unknown>).id)
  return ''
}

export async function POST(request: NextRequest) {
  const config = getMercadoPagoConfig()
  if (!config.webhookConfigured || !config.accessToken) return NextResponse.json({ error: 'Webhook no configurado.' }, { status: 503 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
  if (!supabaseUrl || !serviceRole) return NextResponse.json({ error: 'Backend no configurado.' }, { status: 503 })

  const body = await request.json().catch(() => ({})) as Record<string, unknown>
  const xSignature = request.headers.get('x-signature') || ''
  const xRequestId = request.headers.get('x-request-id') || ''
  const dataId = getDataId(request, body)
  const topic = String(body.type || request.nextUrl.searchParams.get('type') || body.action || 'unknown').slice(0, 120)

  const signatureValid = await verifyMercadoPagoWebhookSignature({ xSignature, xRequestId, dataId }).catch(() => false)
  if (!signatureValid) return NextResponse.json({ error: 'Firma de webhook inválida.' }, { status: 401 })

  const admin = createClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })
  const notificationId = body.id === undefined || body.id === null ? '' : String(body.id).slice(0, 180)
  const eventKey = notificationId
    ? `mercadopago:${notificationId}`
    : `${xRequestId}:${topic}:${dataId}`
  const inserted = await admin.from('billing_events').insert({
    provider: 'mercadopago',
    provider_event_key: eventKey,
    topic,
    external_resource_id: dataId || null,
    signature_valid: true,
    payload: body,
  }).select('id').single()

  let eventId = ''
  if (inserted.error) {
    if (inserted.error.code !== '23505') {
      return NextResponse.json({ error: 'No fue posible registrar el evento.' }, { status: 503 })
    }

    const existing = await admin.from('billing_events')
      .select('id,processed_at,processing_error')
      .eq('provider', 'mercadopago')
      .eq('provider_event_key', eventKey)
      .maybeSingle()

    if (existing.error || !existing.data) {
      return NextResponse.json({ error: 'No fue posible recuperar el evento para reintento.' }, { status: 503 })
    }

    if (existing.data.processed_at && !existing.data.processing_error) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    eventId = String(existing.data.id)
    const reset = await admin.from('billing_events').update({
      topic,
      external_resource_id: dataId || null,
      signature_valid: true,
      payload: body,
      processed_at: null,
      processing_error: null,
    }).eq('id', eventId)

    if (reset.error) {
      return NextResponse.json({ error: 'No fue posible preparar el evento para reintento.' }, { status: 503 })
    }
  } else {
    eventId = String(inserted.data.id)
  }

  try {
    if (topic === 'subscription_preapproval' || String(body.action || '').includes('preapproval')) {
      const remote = await getMercadoPagoSubscription(dataId)
      const externalReference = typeof remote.external_reference === 'string' || typeof remote.external_reference === 'number' ? String(remote.external_reference) : ''
      const update = {
        external_subscription_id: remote.id || dataId,
        provider_plan_id: remote.preapproval_plan_id || null,
        status: normalizeMercadoPagoStatus(remote.status),
        payer_email: remote.payer_email || null,
        next_payment_at: remote.next_payment_date || null,
        provider_updated_at: remote.last_modified || new Date().toISOString(),
        metadata: { reconciledBy: 'mercadopago-webhook', providerStatus: remote.status || null },
      }
      const lookup = externalReference
        ? await admin.from('billing_subscriptions')
            .select('id,organization_id,user_id,plan_key')
            .eq('provider', 'mercadopago')
            .eq('external_reference', externalReference)
            .maybeSingle()
        : await admin.from('billing_subscriptions')
            .select('id,organization_id,user_id,plan_key')
            .eq('provider', 'mercadopago')
            .eq('external_subscription_id', dataId)
            .maybeSingle()

      if (lookup.error || !lookup.data) throw new Error(lookup.error?.message || 'BILLING_SUBSCRIPTION_NOT_FOUND')

      const reconciled = await admin.from('billing_subscriptions')
        .update(update)
        .eq('id', lookup.data.id)
      if (reconciled.error) throw new Error(reconciled.error.message)

      const normalizedStatus = normalizeMercadoPagoStatus(remote.status)
      if (lookup.data.plan_key === 'premium') {
        const entitlementStatus = normalizedStatus === 'authorized'
          ? 'active'
          : normalizedStatus === 'paused'
            ? 'suspended'
            : 'cancelled'
        const periodEnd = remote.next_payment_date || new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
        const entitlement = await admin.rpc('set_ai_entitlement_for_org', {
          p_user_id: lookup.data.user_id,
          p_organization_id: lookup.data.organization_id,
          p_plan_id: 'premium',
          p_status: entitlementStatus,
          p_period_end: periodEnd,
          p_assigned_by: null,
        })
        if (entitlement.error) throw new Error(entitlement.error.message)
      }
    }

    await admin.from('billing_events').update({ processed_at: new Date().toISOString(), processing_error: null }).eq('id', eventId)
    return NextResponse.json({ received: true })
  } catch (error) {
    await admin.from('billing_events').update({
      processed_at: null,
      processing_error: error instanceof Error ? error.message.slice(0, 500) : 'BILLING_EVENT_PROCESSING_FAILED',
    }).eq('id', eventId)
    return NextResponse.json({ received: false, retry: true }, { status: 503 })
  }
}
