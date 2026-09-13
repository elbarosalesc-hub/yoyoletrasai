import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { resolveProductAccess } from '@/lib/product/access'
import type { AppRole } from '@/lib/auth/organization-context'
import { normalizeMercadoPagoStatus, updateMercadoPagoSubscription, type BillingSubscriptionAction } from '@/lib/billing/mercadopago'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const rolePriority: Record<AppRole, number> = { student:10, guardian:20, teacher:30, pie:40, utp:50, principal:60, institution_admin:70, platform_admin:80 }

async function context() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : ''
  const email = typeof claims?.email === 'string' ? claims.email.trim().toLowerCase() : ''
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value || ''
  if (!userId || !email || !organizationId) return null
  const memberships = await supabase.from('organization_memberships').select('role').eq('organization_id', organizationId).eq('user_id', userId).eq('is_active', true)
  if (memberships.error || !memberships.data?.length) return null
  const role = memberships.data.map((item) => item.role as AppRole).sort((a,b)=>rolePriority[b]-rolePriority[a])[0]
  return { userId, email, organizationId, role, access: resolveProductAccess(email, role) }
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
  if (!url || !key) return null
  return createServiceClient(url, key, { auth: { persistSession:false, autoRefreshToken:false } })
}

export async function GET() {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error:'No autenticado o sin institución activa.' }, { status:401 })
  const admin = adminClient()
  if (!admin) return NextResponse.json({ error:'Backend de facturación no configurado.' }, { status:503 })

  const result = await admin.from('billing_subscriptions')
    .select('id,provider,plan_key,status,external_subscription_id,next_payment_at,created_at,updated_at')
    .eq('organization_id', ctx.organizationId)
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending:false })
    .limit(1)
    .maybeSingle()
  if (result.error) return NextResponse.json({ error:'No fue posible consultar la suscripción.' }, { status:503 })
  return NextResponse.json({ subscription: result.data || null }, { headers:{'Cache-Control':'private, no-store'} })
}

function isAction(value: unknown): value is BillingSubscriptionAction {
  return value === 'pause' || value === 'reactivate' || value === 'cancel'
}

export async function PATCH(request: NextRequest) {
  const ctx = await context()
  if (!ctx) return NextResponse.json({ error:'No autenticado o sin institución activa.' }, { status:401 })
  if (!ctx.access.canManagePayments && !['institution_admin','platform_admin'].includes(ctx.role)) return NextResponse.json({ error:'Tu rol no puede administrar pagos.' }, { status:403 })
  const body = await request.json().catch(() => ({})) as { action?: unknown }
  if (!isAction(body.action)) return NextResponse.json({ error:'Acción inválida.' }, { status:400 })

  const admin = adminClient()
  if (!admin) return NextResponse.json({ error:'Backend de facturación no configurado.' }, { status:503 })
  const current = await admin.from('billing_subscriptions')
    .select('id,status,external_subscription_id')
    .eq('organization_id', ctx.organizationId)
    .eq('user_id', ctx.userId)
    .order('created_at', { ascending:false })
    .limit(1)
    .maybeSingle()
  if (current.error || !current.data?.external_subscription_id) return NextResponse.json({ error:'No existe una suscripción administrable.' }, { status:404 })
  if (body.action === 'reactivate' && current.data.status !== 'paused') return NextResponse.json({ error:'Sólo una suscripción pausada puede reactivarse.' }, { status:409 })
  if (body.action === 'cancel' && current.data.status === 'cancelled') return NextResponse.json({ error:'La suscripción ya está cancelada.' }, { status:409 })

  try {
    const remote = await updateMercadoPagoSubscription(String(current.data.external_subscription_id), body.action)
    const status = normalizeMercadoPagoStatus(remote.status)
    const updated = await admin.from('billing_subscriptions').update({
      status,
      next_payment_at: remote.next_payment_date || null,
      provider_updated_at: remote.last_modified || new Date().toISOString(),
      metadata: { reconciledBy:'yoyo-subscription-action', action:body.action, providerStatus:remote.status || null },
    }).eq('id', current.data.id)
    if (updated.error) return NextResponse.json({ error:'El proveedor aceptó el cambio, pero YOYO necesita conciliar el estado.' }, { status:502 })
    return NextResponse.json({ status, action:body.action })
  } catch {
    return NextResponse.json({ error:'Mercado Pago no pudo actualizar la suscripción.' }, { status:502 })
  }
}
