import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const provider = process.env.YOYO_BILLING_PROVIDER?.trim() || ''
  const checkoutUrl = process.env.YOYO_BILLING_CHECKOUT_URL?.trim() || ''
  const configured = Boolean(provider && checkoutUrl)

  return NextResponse.json({
    configured,
    provider: configured ? provider : null,
    checkoutAvailable: configured,
    checkoutUrl: configured ? checkoutUrl : null,
    recurringBillingVerified: false,
    webhookVerified: false,
    status: configured ? 'checkout_configured_unverified' : 'not_configured',
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
