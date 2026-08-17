import type { AppRole } from '@/lib/auth/organization-context'

export type ProductPlan = 'basic' | 'premium' | 'owner'

export type ProductAccess = {
  plan: ProductPlan
  isOwner: boolean
  aiUnlimited: boolean
  canUsePremiumResources: boolean
  canManagePlatform: boolean
  canManagePlans: boolean
  canManageModules: boolean
  canManageThemes: boolean
  canManagePayments: boolean
}

const DEFAULT_OWNER_EMAIL = 'elba.rosalesc@gmail.com'

export function getOwnerEmail() {
  return (process.env.YOYO_OWNER_EMAIL || DEFAULT_OWNER_EMAIL).trim().toLowerCase()
}

export function resolveProductAccess(email: string, role: AppRole): ProductAccess {
  const normalizedEmail = email.trim().toLowerCase()
  const isOwner = normalizedEmail === getOwnerEmail()
  const isPlatformAdmin = role === 'platform_admin'
  const isPremiumRole = ['pie', 'utp', 'principal', 'institution_admin', 'platform_admin'].includes(role)

  if (isOwner) {
    return {
      plan: 'owner',
      isOwner: true,
      aiUnlimited: true,
      canUsePremiumResources: true,
      canManagePlatform: true,
      canManagePlans: true,
      canManageModules: true,
      canManageThemes: true,
      canManagePayments: true,
    }
  }

  return {
    plan: isPremiumRole ? 'premium' : 'basic',
    isOwner: false,
    aiUnlimited: isPlatformAdmin,
    canUsePremiumResources: isPremiumRole,
    canManagePlatform: isPlatformAdmin,
    canManagePlans: isPlatformAdmin,
    canManageModules: isPlatformAdmin,
    canManageThemes: isPlatformAdmin,
    canManagePayments: isPlatformAdmin,
  }
}
