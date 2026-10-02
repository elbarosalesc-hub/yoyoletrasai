import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveProductAccess } from '@/lib/product/access'
import type { Database } from '@/lib/supabase/database.types'

type AppRole = Database['public']['Enums']['app_role']

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

const roleLabels: Record<AppRole, string> = {
  student: 'Estudiante',
  guardian: 'Familia / apoderado',
  teacher: 'Docente',
  pie: 'Profesional PIE',
  utp: 'Coordinación UTP',
  principal: 'Dirección',
  institution_admin: 'Administración institucional',
  platform_admin: 'Administración de plataforma',
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'YO'
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
    const claims = claimsData?.claims
    const userId = typeof claims?.sub === 'string' ? claims.sub : null

    if (claimsError || !userId) {
      return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
    }

    const cookieStore = await cookies()
    const organizationId = cookieStore.get('yoyo-organization-id')?.value

    if (!organizationId) {
      return NextResponse.json({ error: 'Institución no seleccionada' }, { status: 409 })
    }

    const [membershipsResult, organizationResult, profileResult, subscriptionResult, entitlementResult, institutionPlanResult] = await Promise.all([
      supabase
        .from('organization_memberships')
        .select('role')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .eq('is_active', true),
      supabase
        .from('organizations')
        .select('id, name, slug')
        .eq('id', organizationId)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('first_name, last_name, display_name, avatar_url')
        .eq('id', userId)
        .maybeSingle(),
      (supabase as any)
        .from('billing_subscriptions')
        .select('plan_key,status,user_id,next_payment_at')
        .eq('organization_id', organizationId)
        .eq('status', 'authorized')
        .or(`user_id.eq.${userId},plan_key.eq.institution`)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
      (supabase as any)
        .from('ai_entitlements')
        .select('plan_id,status,period_start,period_end')
        .eq('organization_id', organizationId)
        .eq('user_id', userId)
        .maybeSingle(),
      (supabase as any)
        .from('ai_plans')
        .select('id')
        .eq('id', 'institucion')
        .eq('active', true)
        .maybeSingle(),
    ])

    const roles = (membershipsResult.data ?? []).map((membership) => membership.role)
    const role = [...roles].sort((a, b) => rolePriority[b] - rolePriority[a])[0]
    const organization = organizationResult.data

    if (membershipsResult.error || organizationResult.error || !role || !organization) {
      return NextResponse.json({ error: 'Contexto institucional no autorizado' }, { status: 403 })
    }

    const profile = profileResult.data
    const email = typeof claims?.email === 'string' ? claims.email : ''
    const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
    const displayName = profile?.display_name?.trim() || fullName || email.split('@')[0] || 'Usuario'
    const now = Date.now()
    const entitlementStatus = String(entitlementResult.data?.status ?? '')
    const entitlementStart = Date.parse(String(entitlementResult.data?.period_start ?? ''))
    const entitlementEnd = Date.parse(String(entitlementResult.data?.period_end ?? ''))
    const entitlementCurrent =
      ['active','trialing'].includes(entitlementStatus) &&
      Number.isFinite(entitlementStart) &&
      Number.isFinite(entitlementEnd) &&
      now >= entitlementStart &&
      now < entitlementEnd

    const billingPlanKey = String(subscriptionResult.data?.plan_key ?? '')
    const nextPaymentAt = Date.parse(String(subscriptionResult.data?.next_payment_at ?? ''))
    const billingCurrent =
      Boolean(subscriptionResult.data) &&
      (!Number.isFinite(nextPaymentAt) || nextPaymentAt > now)

    const premiumTrial =
      entitlementCurrent &&
      entitlementStatus === 'trialing' &&
      String(entitlementResult.data?.plan_id ?? '') === 'premium'

    const premiumPaid =
      entitlementCurrent &&
      String(entitlementResult.data?.plan_id ?? '') === 'premium' &&
      billingCurrent &&
      billingPlanKey === 'premium'

    const institutionPaid =
      billingCurrent &&
      billingPlanKey === 'institution' &&
      Boolean(institutionPlanResult.data)

    const subscriptionPlan = premiumTrial || premiumPaid || institutionPaid ? 'premium' : 'basic'
    const access = resolveProductAccess(email, role, subscriptionPlan, userId)

    return NextResponse.json({
      displayName,
      initials: getInitials(displayName),
      role,
      roleLabel: access.isOwner ? 'Propietaria' : roleLabels[role],
      organizationId: organization.id,
      organizationName: organization.name,
      organizationSlug: organization.slug,
      avatarUrl: profile?.avatar_url ?? null,
      plan: access.plan,
      isOwner: access.isOwner,
      aiUnlimited: access.aiUnlimited,
      permissions: {
        premiumResources: access.canUsePremiumResources,
        managePlatform: access.canManagePlatform,
        managePlans: access.canManagePlans,
        manageModules: access.canManageModules,
        manageThemes: access.canManageThemes,
        managePayments: access.canManagePayments || ['institution_admin','platform_admin'].includes(role),
      },
    }, {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    })
  } catch {
    return NextResponse.json(
      { error: 'La conexión de sesión no está configurada.' },
      { status: 503 },
    )
  }
}
