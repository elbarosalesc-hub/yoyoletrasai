import { premiumActivities as coreActivities, type PremiumActivity } from './premiumActivities'
import { resourceExpansion } from './resourceExpansion'
import { premiumExpansion2026 } from './premiumExpansion2026'

export type { PremiumActivity }

export const premiumActivities: PremiumActivity[] = [
  ...coreActivities,
  ...resourceExpansion,
  ...premiumExpansion2026,
]

export const getPremiumActivity = (slug: string) => premiumActivities.find((activity) => activity.slug === slug)
export const resourceCatalog = premiumActivities
export const getResource = getPremiumActivity
