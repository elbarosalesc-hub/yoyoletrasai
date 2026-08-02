import { additionalPremiumActivities } from './additionalPremiumActivities'
import { premiumActivities as basePremiumActivities, type PremiumActivity } from './premiumActivities'

export type { PremiumActivity }

export const premiumActivities: PremiumActivity[] = [
  ...basePremiumActivities,
  ...additionalPremiumActivities,
]

export const getPremiumActivity = (slug: string) => premiumActivities.find((activity) => activity.slug === slug)
