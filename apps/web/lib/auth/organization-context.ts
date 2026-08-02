import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type AppRole = Database['public']['Enums']['app_role']

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

const courseManagerRoles = new Set<AppRole>([
  'teacher',
  'pie',
  'utp',
  'principal',
  'institution_admin',
  'platform_admin',
])

export function getRoleLabel(role: AppRole) {
  return roleLabels[role]
}

export function canManageCourses(role: AppRole) {
  return courseManagerRoles.has(role)
}

function selectPrimaryRole(roles: AppRole[]) {
  return [...roles].sort((a, b) => rolePriority[b] - rolePriority[a])[0]
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  return initials || 'YO'
}

export async function requireOrganizationContext(nextPath = '/app') {
  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const claims = claimsData?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null

  if (claimsError || !userId) {
    redirect(`/acceso?next=${encodeURIComponent(nextPath)}`)
  }

  const cookieStore = await cookies()
  const organizationId = cookieStore.get('yoyo-organization-id')?.value

  if (!organizationId) {
    redirect('/seleccionar-institucion')
  }

  const { data: memberships, error: membershipError } = await supabase
    .from('organization_memberships')
    .select('role')
    .eq('organization_id', organizationId)
    .eq('user_id', userId)
    .eq('is_active', true)

  const roles = (memberships ?? []).map((membership) => membership.role)
  const role = selectPrimaryRole(roles)

  if (membershipError || !role) {
    redirect('/seleccionar-institucion')
  }

  const [organizationResult, profileResult] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name, slug, organization_type')
      .eq('id', organizationId)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('first_name, last_name, display_name, avatar_url')
      .eq('id', userId)
      .maybeSingle(),
  ])

  if (organizationResult.error || !organizationResult.data) {
    redirect('/seleccionar-institucion')
  }

  const profile = profileResult.data
  const email = typeof claims?.email === 'string' ? claims.email : ''
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
  const displayName = profile?.display_name?.trim() || fullName || email.split('@')[0] || 'Usuario'

  return {
    supabase,
    userId,
    email,
    role,
    roleLabel: getRoleLabel(role),
    organization: organizationResult.data,
    profile,
    displayName,
    initials: getInitials(displayName),
  }
}
