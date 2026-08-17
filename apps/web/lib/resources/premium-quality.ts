export const PREMIUM_RESOURCE_THRESHOLD = 92

export const premiumResourceCriteria = {
  curricularAlignment: 15,
  pedagogicalDepth: 15,
  duaPie: 15,
  accessibility: 10,
  teacherVersion: 10,
  studentVersion: 10,
  answerKeyOrRubric: 10,
  editableReusable: 5,
  visualQuality: 5,
  contextualRelevance: 5,
} as const

export type PremiumCriterion = keyof typeof premiumResourceCriteria
export type PremiumQualityInput = Partial<Record<PremiumCriterion, boolean | number>>

export function evaluatePremiumResource(input: PremiumQualityInput) {
  let score = 0
  const failed: PremiumCriterion[] = []
  for (const [criterion, weight] of Object.entries(premiumResourceCriteria) as [PremiumCriterion, number][]) {
    const value = input[criterion]
    const normalized = typeof value === 'number' ? Math.max(0, Math.min(1, value)) : value === true ? 1 : 0
    score += weight * normalized
    if (normalized < 1) failed.push(criterion)
  }
  const rounded = Math.round(score)
  const mandatory: PremiumCriterion[] = ['curricularAlignment','duaPie','accessibility','teacherVersion','studentVersion','answerKeyOrRubric','editableReusable','visualQuality']
  return { score: rounded, publishable: rounded >= PREMIUM_RESOURCE_THRESHOLD && mandatory.every(criterion => input[criterion] === true || input[criterion] === 1), failed }
}

export const premiumGameCriteria = {
  pedagogicalMission: 15,
  realInteraction: 15,
  progression: 10,
  feedback: 10,
  accessibility: 10,
  analytics: 10,
  narrativeContext: 10,
  replayability: 5,
  visualQuality: 10,
  curricularAlignment: 5,
} as const

export type PremiumGameCriterion = keyof typeof premiumGameCriteria

export function evaluatePremiumGame(input: Partial<Record<PremiumGameCriterion, boolean | number>>) {
  let score = 0
  const failed: PremiumGameCriterion[] = []
  for (const [criterion, weight] of Object.entries(premiumGameCriteria) as [PremiumGameCriterion, number][]) {
    const value = input[criterion]
    const normalized = typeof value === 'number' ? Math.max(0, Math.min(1, value)) : value === true ? 1 : 0
    score += weight * normalized
    if (normalized < 1) failed.push(criterion)
  }
  const rounded = Math.round(score)
  const mandatory: PremiumGameCriterion[] = ['pedagogicalMission','realInteraction','progression','feedback','accessibility','analytics','curricularAlignment']
  return { score: rounded, publishable: rounded >= 92 && mandatory.every(criterion => input[criterion] === true || input[criterion] === 1), failed }
}
