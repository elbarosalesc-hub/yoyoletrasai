import { premiumActivities } from './premiumActivities'
import { extraActivities } from './extraActivities'

export type { PremiumActivity } from './premiumActivities'

export const resourceCatalog = [...premiumActivities, ...extraActivities]
export const getResource = (slug: string) => resourceCatalog.find((activity) => activity.slug === slug)
