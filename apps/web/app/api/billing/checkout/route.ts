import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { resolveProductAccess } from '@/lib/product/access'
import type { AppRole } from '@/lib/auth/organization-context'
import { createMercadoPagoSubscription, getMercadoPagoConfig, type BillingPlanKey } from '@/lib/billing/mercadopago'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const rolePriority: Record<AppRole, number> = {
  student: 10,
  guardian: 20,
  teacher: 30,
  pie: 40,
  utp: 50,
  principal: 60,
  institution_admin: 70,
  platform_admin: 80,
}

function isPlanKey(value: unknown): value is BillingPlanKey {
  return value === 'premium' || value === 'institution'
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const claims = (await supabase.auth.getClaims()).data?.claims
    const userId = typeof claims?.sub === 'string' ? claims.sub : ''
    const email = typeof claims?.email === 'string' ? claims.email.trim().toLowerCase() : ''
    if (!userId || !email) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

    const organizationId = (await cookies()).get('yoyo-organization-id')?.value || ''
    if (!organizationId) return NextResponse.json({ error: 'Selecciona una institución antes de administrar una suscripción.' }, { status: 409 })

    const memberships = await supabase
      .from('organization_memberships')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', userId)
      .eq('is_active', true)
    if (memberships.error || !memberships.data?.length) return NextResponse.json({ error: 'Contexto institucional no autorizado.' }, { status: 403 })

    const role = memberships.data.map((item) => item.role as AppRole).sort((a, b) => rolePriority[b] - rolePriority[a])[0]
    const access = resolveProductAccess(email, role)
    if (!access.canManagePayments && !['institution_admin', 'platform_admin'].includes(role)) {
      return NextResponse.json({ error: 'Tu rol no puede iniciar suscripciones institucionales.' }, { status: 403 })
    }

    const payload = await request.json().catch(() => ({})) as { planKey?: unknown }
    if (!isPlanKey(payload.planKey)) return NextResponse.json({ error: 'Plan de suscripción inválido.' }, { status: 400 })

    const config = getMercadoPagoConfig()
    if (!config.checkoutConfigured || !config.plans[payload.planKey]) {
      return NextResponse.json({ error: 'Mercado Pago todavía no está configurado con un plan real para esta suscripción.' }, { status: 503 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
    if (!supabaseUrl || !serviceRole) return NextResponse.json({ error: 'Backend de facturación no configurado.' }, { status: 503 })
    const admin = createServiceClient(supabaseUrl, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })

    const externalReference = `yoyo:${organizationId}:${userId}:${payload.planKey}:${crypto.randomUUID()}`
    const checkout = await createMercadoPagoSubscription({
      planKey: payload.planKey,
      payerEmail: email,
      externalReference,
    })

    const inserted = await admin.from('billing_subscriptions').insert({
      organization_id: organizationId,
      user_id: userId,
      provider: 'mercadopago',
      plan_key: payload.planKey,
      provider_plan_id: checkout.providerPlanId,
      external_subscription_id: checkout.id,
      external_reference: externalReference,
      status: checkout.status === 'authorized' ? 'authorized' : 'pending',
      payer_email: email,
      checkout_url: checkout.checkoutUrl,
      next_payment_at: checkout.nextPaymentAt,
      provider_updated_at: new Date().toISOString(),
      metadata: { source: 'yoyo-checkout', createdByRole: role },
    })
    if (inserted.error) {
      return NextResponse.json({ error: 'La suscripción fue creada en el proveedor, pero YOYO no pudo registrar su estado. Requiere conciliación administrativa.' }, { status: 502 })
    }

    return NextResponse.json({
      provider: 'mercadopago',
      planKey: payload.planKey,
      checkoutUrl: checkout.checkoutUrl,
      subscriptionId: checkout.id,
      status: checkout.status,
    }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'BILLING_CHECKOUT_FAILED'
    return NextResponse.json({ error: message.startsWith('MERCADOPAGO_') ? 'No fue posible iniciar el checkout de Mercado Pago.' : 'No fue posible iniciar la suscripción.' }, { status: 502 })
  }
}
