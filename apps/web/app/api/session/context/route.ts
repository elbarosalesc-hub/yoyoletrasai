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

    const [membershipsResult, organizationResult, profileResult] = await Promise.all([
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
    const access = resolveProductAccess(email, role)

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
        managePayments: access.canManagePayments,
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
