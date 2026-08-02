import { getPremiumActivity, premiumActivities } from './activityCatalog'

export type { PremiumActivity } from './activityCatalog'

export const resourceCatalog = premiumActivities
export const getResource = getPremiumActivity
