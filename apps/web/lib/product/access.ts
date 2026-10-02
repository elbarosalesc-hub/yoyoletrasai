import type { AppRole } from '@/lib/auth/organization-context'

export type ProductPlan = 'basic' | 'premium' | 'owner'

export type ProductAccess = {
  plan: ProductPlan
  isOwner: boolean
  aiUnlimited: boolean
  monthlyGenerations: number | null
  canUsePremiumResources: boolean
  canUseAdvancedAdaptations: boolean
  canUseAnalytics: boolean
  canUseImmersiveGames: boolean
  canManagePlatform: boolean
  canManagePlans: boolean
  canManageModules: boolean
  canManageThemes: boolean
  canManagePayments: boolean
  exportFormats: readonly string[]
}

export function getOwnerUserId() {
  return (process.env.YOYO_OWNER_USER_ID || '').trim()
}

export function getOwnerEmail() {
  return (process.env.YOYO_OWNER_EMAIL || '').trim().toLowerCase()
}

export function isOwnerAccount(input: {
  userId?: string | null
  email?: string | null
  role?: AppRole | null
}) {
  const configuredUserId = getOwnerUserId()
  const userId = input.userId?.trim() || ''

  if (input.role !== 'platform_admin' || !configuredUserId || !userId || userId !== configuredUserId) {
    return false
  }

  const configuredEmail = getOwnerEmail()
  if (!configuredEmail) return true

  return Boolean(input.email && input.email.trim().toLowerCase() === configuredEmail)
}

export const planEntitlements: Record<ProductPlan, Omit<ProductAccess, 'plan' | 'isOwner'>> = {
  basic: {
    aiUnlimited: false,
    monthlyGenerations: 40,
    canUsePremiumResources: false,
    canUseAdvancedAdaptations: false,
    canUseAnalytics: false,
    canUseImmersiveGames: true,
    canManagePlatform: false,
    canManagePlans: false,
    canManageModules: false,
    canManageThemes: false,
    canManagePayments: false,
    exportFormats: ['print', 'txt'],
  },
  premium: {
    aiUnlimited: false,
    monthlyGenerations: 500,
    canUsePremiumResources: true,
    canUseAdvancedAdaptations: true,
    canUseAnalytics: true,
    canUseImmersiveGames: true,
    canManagePlatform: false,
    canManagePlans: false,
    canManageModules: false,
    canManageThemes: false,
    canManagePayments: false,
    exportFormats: ['print', 'txt', 'pdf', 'docx', 'slides'],
  },
  owner: {
    aiUnlimited: true,
    monthlyGenerations: null,
    canUsePremiumResources: true,
    canUseAdvancedAdaptations: true,
    canUseAnalytics: true,
    canUseImmersiveGames: true,
    canManagePlatform: true,
    canManagePlans: true,
    canManageModules: true,
    canManageThemes: true,
    canManagePayments: true,
    exportFormats: ['print', 'txt', 'pdf', 'docx', 'slides'],
  },
}

export function getEntitlements(plan: ProductPlan) {
  return planEntitlements[plan]
}

export function resolvePlan(input: {
  userId?: string | null
  email?: string | null
  role?: AppRole | null
  subscriptionPlan?: string | null
}): ProductPlan {
  if (isOwnerAccount(input)) return 'owner'
  if (input.subscriptionPlan === 'premium') return 'premium'
  if (input.subscriptionPlan === 'basic') return 'basic'

  const premiumRole = input.role && ['pie', 'utp', 'principal', 'institution_admin', 'platform_admin'].includes(input.role)
  return premiumRole ? 'premium' : 'basic'
}

export function resolveProductAccess(
  email: string,
  role: AppRole,
  subscriptionPlan?: string | null,
  userId?: string | null,
): ProductAccess {
  const plan = resolvePlan({ userId, email, role, subscriptionPlan })
  return {
    plan,
    isOwner: plan === 'owner',
    ...getEntitlements(plan),
  }
}
