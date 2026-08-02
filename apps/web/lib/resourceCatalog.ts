import { premiumActivities as coreActivities, type PremiumActivity } from './premiumActivities'
import { extraActivities } from './extraActivities'

export type { PremiumActivity }

export const premiumActivities: PremiumActivity[] = [...coreActivities, ...extraActivities]
export const getPremiumActivity = (slug: string) => premiumActivities.find((activity) => activity.slug === slug)

export const resourceCatalog = premiumActivities
export const getResource = getPremiumActivity
