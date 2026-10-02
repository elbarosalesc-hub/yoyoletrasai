import { NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getMercadoPagoConfig } from '@/lib/billing/mercadopago'

export const dynamic = 'force-dynamic'

function validHttpsUrl(value: string) {
  try { return new URL(value).protocol === 'https:' } catch { return false }
}

export async function GET() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const requestedProvider = process.env.YOYO_BILLING_PROVIDER?.trim().toLowerCase() || ''
  const mercadoPago = getMercadoPagoConfig()
  const useMercadoPago = requestedProvider === 'mercadopago' || mercadoPago.apiConfigured || mercadoPago.webhookConfigured

  if (useMercadoPago) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
    const backendReady = Boolean(supabaseUrl && serviceRole)

    const activePlanIds = new Set<string>()
    if (backendReady) {
      const admin = createServiceClient(supabaseUrl, serviceRole, {
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const plansResult = await admin
        .from('ai_plans')
        .select('id')
        .in('id', ['premium', 'institucion'])
        .eq('active', true)

      for (const row of plansResult.data || []) activePlanIds.add(String(row.id))
    }

    const planConfigured = {
      premium: Boolean(mercadoPago.plans.premium) && activePlanIds.has('premium'),
      institution: Boolean(mercadoPago.plans.institution) && activePlanIds.has('institucion'),
    }
    const checkoutAvailable = Boolean(
      backendReady &&
      mercadoPago.apiConfigured &&
      mercadoPago.productionUrl &&
      (planConfigured.premium || planConfigured.institution)
    )

    return NextResponse.json({
      configured: mercadoPago.apiConfigured,
      provider: 'mercadopago',
      checkoutAvailable,
      checkoutUrl: null,
      checkoutMode: 'dynamic',
      planConfigured,
      recurringBillingConfigured: checkoutAvailable,
      recurringBillingVerified: false,
      webhookConfigured: mercadoPago.webhookConfigured,
      webhookVerified: false,
      productionUrlConfigured: Boolean(mercadoPago.productionUrl),
      status: checkoutAvailable && mercadoPago.webhookConfigured
        ? 'mercadopago_configured_pending_live_verification'
        : 'mercadopago_partial_configuration',
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  }

  const provider = requestedProvider
  const checkoutUrl = process.env.YOYO_BILLING_CHECKOUT_URL?.trim() || ''
  const checkoutUrlValid = validHttpsUrl(checkoutUrl)
  const configured = Boolean(provider && checkoutUrlValid)
  return NextResponse.json({
    configured,
    provider: configured ? provider : null,
    checkoutAvailable: configured,
    checkoutUrl: configured ? checkoutUrl : null,
    checkoutMode: 'external-url',
    checkoutUrlValid,
    recurringBillingConfigured: false,
    recurringBillingVerified: false,
    webhookConfigured: false,
    webhookVerified: false,
    status: configured ? 'checkout_configured_unverified' : checkoutUrl && !checkoutUrlValid ? 'invalid_checkout_url' : 'not_configured',
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
