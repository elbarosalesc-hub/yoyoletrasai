export const YOYO_PLAN_QUALITY_TARGET = Object.freeze({
  benchmarkMultiplier: 1.2,
  competitorFeatureCoverageRequired: 1,
  appliesTo: Object.freeze(['basico', 'premium']),
  claimOnlyAfterMeasuredBenchmark: true,
  qualityFloorMustNotDropByPlan: true,
  differentiateByCapacityNotPedagogicalQuality: true,
});

export const TRUSTED_SOURCE_POLICY = Object.freeze({
  requireTraceableSources: true,
  prohibitFabricatedCitations: true,
  distinguishFactInferenceRecommendation: true,
  discloseUncertainty: true,
  preferPrimarySources: true,
  crossCheckMaterialClaims: true,
  highStakesRequiresMultipleIndependentSources: true,
  freshnessRequiredWhenTopicCanChange: true,
  preferredTiers: Object.freeze([
    'official_government_and_public_agency',
    'official_curriculum_and_education_authority',
    'peer_reviewed_academic_research',
    'university_and_research_institution',
    'primary_source_or_original_dataset',
    'recognized_professional_or_standards_body',
    'reputable_editorial_source_with_transparent_authorship',
  ]),
  rejectOrDowngrade: Object.freeze([
    'anonymous_unsourced_content',
    'content_farms',
    'seo_pages_without_primary_evidence',
    'fabricated_or_unverifiable_references',
    'stale_sources_for_time_sensitive_claims',
  ]),
});

export const YOYO_USER_PLAN_REQUIRED_CAPABILITIES = Object.freeze([
  'multiturn_chat',
  'writing_assistance',
  'summarization',
  'file_uploads',
  'document_analysis',
  'image_understanding',
  'web_search',
  'deep_research',
  'citations',
  'trusted_source_restriction',
  'source_verification',
  'document_generation',
  'pdf_generation',
  'presentation_generation',
  'image_generation',
  'video_generation',
  'assessment_generation',
  'study_guides',
  'educational_guide_generation',
  'quizzes',
  'reading_plan_generation',
  'report_generation',
  'sharing_export',
  'chilean_curriculum_alignment',
  'pie_dua_native_design',
  'nee_adaptation_without_goal_reduction',
]);

export const YOYO_USER_PLANS = Object.freeze({
  basico: Object.freeze({
    id: 'basico',
    label: 'Básico',
    qualityMultiplierTarget: 1.2,
    requiredCapabilities: YOYO_USER_PLAN_REQUIRED_CAPABILITIES,
    principle: 'Acceso completo al núcleo educativo de alta calidad; los límites comerciales afectan capacidad de uso, no rigor pedagógico ni confiabilidad.',
    research: Object.freeze({ trustedSourcesOnly: true, citationsRequiredWhenResearching: true, sourceVerificationRequired: true }),
    media: Object.freeze({ imageCreatorRequired: true, videoCreatorRequired: true, presentationCreatorRequired: true }),
    education: Object.freeze({ summaries: true, assessments: true, guides: true, readingPlans: true, reports: true }),
  }),
  premium: Object.freeze({
    id: 'premium',
    label: 'Premium',
    qualityMultiplierTarget: 1.2,
    requiredCapabilities: YOYO_USER_PLAN_REQUIRED_CAPABILITIES,
    principle: 'Mismo piso de excelencia y confiabilidad, con mayor capacidad, contexto, archivos, investigación y generación multimedia.',
    research: Object.freeze({ trustedSourcesOnly: true, citationsRequiredWhenResearching: true, sourceVerificationRequired: true, extendedResearch: true }),
    media: Object.freeze({ imageCreatorRequired: true, videoCreatorRequired: true, presentationCreatorRequired: true, extendedMediaCapacity: true }),
    education: Object.freeze({ summaries: true, assessments: true, guides: true, readingPlans: true, reports: true, advancedAdaptation: true }),
  }),
});

export function planCapabilityReadiness(planId, implemented = []) {
  const plan = YOYO_USER_PLANS[planId];
  if (!plan) return { planId, supported: false, ready: false, missing: [] };
  const implementedSet = new Set(implemented);
  const missing = plan.requiredCapabilities.filter((capability) => !implementedSet.has(capability));
  return {
    planId,
    supported: true,
    ready: missing.length === 0,
    covered: plan.requiredCapabilities.length - missing.length,
    total: plan.requiredCapabilities.length,
    missing,
    qualityMultiplierTarget: plan.qualityMultiplierTarget,
  };
}

export function trustedSourcePrompt() {
  return `POLÍTICA DE FUENTES YOYO:\n- No inventes citas, autores, DOI, enlaces, estadísticas ni referencias.\n- Cuando investigues, prioriza fuentes oficiales, curriculares, académicas revisadas por pares, universidades, datos primarios y organismos profesionales reconocidos.\n- Distingue claramente hechos verificados, inferencias y recomendaciones.\n- Para afirmaciones materiales, contrasta fuentes independientes cuando sea posible.\n- Si una fuente no puede verificarse o la evidencia es insuficiente, dilo explícitamente en vez de completar el vacío con una suposición.\n- Para información que pueda cambiar con el tiempo, exige evidencia actualizada.\n- Evita usar como fundamento principal contenido anónimo, granjas de contenido o páginas SEO sin evidencia primaria.`;
}
