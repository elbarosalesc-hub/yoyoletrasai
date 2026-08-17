export type ProductPlan = 'basic' | 'premium' | 'owner'

export const OWNER_EMAIL = 'elba.rosalesc@gmail.com'

export const planEntitlements = {
  basic: {
    aiUnlimited: false,
    monthlyGenerations: 40,
    premiumTemplates: false,
    advancedAdaptations: false,
    analytics: false,
    immersiveGames: true,
    exportFormats: ['print', 'txt'],
  },
  premium: {
    aiUnlimited: false,
    monthlyGenerations: 500,
    premiumTemplates: true,
    advancedAdaptations: true,
    analytics: true,
    immersiveGames: true,
    exportFormats: ['print', 'txt', 'pdf', 'docx', 'slides'],
  },
  owner: {
    aiUnlimited: true,
    monthlyGenerations: Number.POSITIVE_INFINITY,
    premiumTemplates: true,
    advancedAdaptations: true,
    analytics: true,
    immersiveGames: true,
    exportFormats: ['print', 'txt', 'pdf', 'docx', 'slides'],
  },
} as const

export function resolvePlan(input: { email?: string | null; role?: string | null; subscriptionPlan?: string | null }): ProductPlan {
  const email = input.email?.trim().toLowerCase()
  if (email === OWNER_EMAIL || input.role === 'platform_admin') return 'owner'
  if (input.subscriptionPlan === 'premium') return 'premium'
  return 'basic'
}

export function getEntitlements(plan: ProductPlan) {
  return planEntitlements[plan]
}
