import { premiumActivities as coreActivities } from './premiumActivities'
import { extraActivities } from './extraActivities'

export type { PremiumActivity } from './premiumActivities'

export const premiumActivities = [...coreActivities, ...extraActivities]
export const getPremiumActivity = (slug: string) =>
  premiumActivities.find((activity) => activity.slug === slug)

export const resourceCatalog = premiumActivities
export const getResource = getPremiumActivity
