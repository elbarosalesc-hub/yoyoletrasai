export type YoyoAiPlan = 'basico' | 'premium' | 'propietaria'

export const YOYO_AI_IDENTITY = {
  productName: 'YOYO IA',
  scope: 'resource-generation',
  independent: true,
  description:
    'Motor de inteligencia artificial propio de YoYoLetrasAI para crear, adaptar, analizar y transformar recursos educativos. Funciona de forma separada del Profesor Virtual y de otras experiencias de IA de la plataforma.',
} as const

export const YOYO_AI_MODES = [
  'activity',
  'writing',
  'assessment',
  'guide',
  'analysis',
  'image',
  'report',
  'presentation',
  'video',
  'summary',
  'reading_plan',
  'research',
  'sources',
] as const

export type YoyoAiMode = (typeof YOYO_AI_MODES)[number]

export type YoyoAiPlanLimits = {
  monthlyRequests: number | null
  monthlyResearchRequests: number | null
  monthlyTokenLimit: number | null
  maxOutputTokens: number
  maxFilesPerRequest: number | null
  maxFileBytes: number
  maxTotalFileBytes: number
  unlimitedFileAnalysis: boolean
  modelTier: 'essential' | 'advanced' | 'owner'
}

// UI fallbacks only. Production authorization must read ai_plans/ai_entitlements
// from Supabase so limits can be changed without redeploying the application.
export const yoyoAiPlanFallbacks: Record<YoyoAiPlan, YoyoAiPlanLimits> = {
  basico: {
    monthlyRequests: 1000,
    monthlyResearchRequests: 100,
    monthlyTokenLimit: 500000,
    maxOutputTokens: 8000,
    maxFilesPerRequest: 22,
    maxFileBytes: 20 * 1024 * 1024,
    maxTotalFileBytes: 200 * 1024 * 1024,
    unlimitedFileAnalysis: false,
    modelTier: 'essential',
  },
  premium: {
    monthlyRequests: 10000,
    monthlyResearchRequests: 500,
    monthlyTokenLimit: 8000000,
    maxOutputTokens: 24000,
    maxFilesPerRequest: null,
    maxFileBytes: 20 * 1024 * 1024,
    maxTotalFileBytes: 1024 * 1024 * 1024,
    unlimitedFileAnalysis: true,
    modelTier: 'advanced',
  },
  propietaria: {
    monthlyRequests: null,
    monthlyResearchRequests: null,
    monthlyTokenLimit: null,
    maxOutputTokens: 64000,
    maxFilesPerRequest: null,
    maxFileBytes: 20 * 1024 * 1024,
    maxTotalFileBytes: 2 * 1024 * 1024 * 1024,
    unlimitedFileAnalysis: true,
    modelTier: 'owner',
  },
}

export const YOYO_AI_FILE_POLICY = {
  bucket: 'yoyo-ai-sources',
  private: true,
  acceptedGroups: [
    'PDF and office documents',
    'plain text, markdown, CSV and structured text',
    'presentations and spreadsheets',
    'PNG, JPEG, WEBP and GIF images',
  ],
  rules: [
    'Validate plan entitlements before issuing an upload.',
    'Validate file count, individual size and total request size server-side.',
    'Never trust browser-provided MIME type or size as the only validation.',
    'Store source files separately from generated resource outputs.',
    'Keep uploads private and organization-scoped.',
    'Record file usage in ai_source_files and ai_usage_events.',
  ],
} as const

export function isUnlimited(value: number | null) {
  return value === null
}
