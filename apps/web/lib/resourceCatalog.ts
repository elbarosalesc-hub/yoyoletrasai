import { premiumActivities as coreActivities, type PremiumActivity } from './premiumActivities'
import { resourceExpansion } from './resourceExpansion'

export type { PremiumActivity }

export const premiumActivities: PremiumActivity[] = [...coreActivities, ...resourceExpansion]
export const getPremiumActivity = (slug: string) => premiumActivities.find((activity) => activity.slug === slug)
export const resourceCatalog = premiumActivities
export const getResource = getPremiumActivity
