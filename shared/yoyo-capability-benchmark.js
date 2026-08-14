export const YOYO_SUPERIORITY_TARGET = Object.freeze({
  baselineDate: '2026-08-14',
  featureParityRequired: 1,
  qualityMultiplierTarget: 1.2,
  refreshIntervalMonths: 6,
  nativeInferenceRequiredForFullIndependence: true,
  productionAutoPromotion: false,
});

export const GENERAL_AI_CAPABILITIES = Object.freeze([
  'multiturn_chat',
  'long_context',
  'persistent_memory',
  'projects_workspaces',
  'file_uploads',
  'document_analysis',
  'image_understanding',
  'web_search',
  'deep_research',
  'citations',
  'trusted_source_restriction',
  'code_execution',
  'data_analysis',
  'browser_agent',
  'multi_step_agents',
  'connectors',
  'mcp_or_tool_protocol',
  'scheduled_tasks',
  'document_generation',
  'pdf_generation',
  'spreadsheet_generation',
  'presentation_generation',
  'web_app_generation',
  'interactive_artifacts',
  'version_history',
  'image_generation',
  'image_editing',
  'voice_conversation',
  'audio_generation',
  'video_generation',
  'study_guides',
  'quizzes',
  'flashcards',
  'performance_feedback',
  'knowledge_bases',
  'rag_retrieval',
  'collaboration',
  'sharing_export',
]);

export const YOYO_EXCLUSIVE_CAPABILITIES = Object.freeze([
  'chilean_curriculum_alignment',
  'oa_skill_content_attitude_alignment',
  'pie_dua_native_design',
  'nee_adaptation_without_goal_reduction',
  'nineteen_module_resource_factory',
  'owner_multi_role_ai',
  'teacher_student_family_workflows',
  'observable_evidence_generation',
  'rubric_and_assessment_alignment',
  'semiannual_capability_benchmark',
  'semiannual_curriculum_refresh',
  'resource_quality_gate_90',
  'resource_originality_audit',
  'platform_owned_memory_and_benchmark_store',
  'native_model_runtime_adapter',
]);

export const COMPETITOR_BASELINES = Object.freeze([
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    officialSources: [
      'https://openai.com/index/chatgpt-for-your-most-ambitious-work/',
      'https://openai.com/index/introducing-deep-research/',
      'https://openai.com/index/introducing-chatgpt-agent/',
    ],
    capabilityHints: ['deep_research','browser_agent','multi_step_agents','connectors','code_execution','document_generation','spreadsheet_generation','presentation_generation','web_app_generation'],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    officialSources: [
      'https://support.google.com/gemini/',
      'https://support.google.com/gemini/answer/15719111',
      'https://support.google.com/gemini/answer/15274899',
      'https://support.google.com/gemini/answer/16275879',
    ],
    capabilityHints: ['deep_research','connectors','voice_conversation','image_generation','image_editing','video_generation','audio_generation','web_app_generation','quizzes','flashcards','study_guides','performance_feedback'],
  },
  {
    id: 'claude',
    label: 'Claude',
    officialSources: [
      'https://www.anthropic.com/news/integrations',
      'https://support.anthropic.com/en/articles/9487310-what-are-artifacts-and-how-do-i-use-them',
      'https://support.anthropic.com/en/articles/9517075-what-are-projects',
      'https://support.anthropic.com/en/articles/11473015-retrieval-augmented-generation-rag-for-projects',
    ],
    capabilityHints: ['deep_research','citations','connectors','mcp_or_tool_protocol','interactive_artifacts','projects_workspaces','knowledge_bases','rag_retrieval','collaboration'],
  },
  {
    id: 'perplexity',
    label: 'Perplexity',
    officialSources: [
      'https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work',
      'https://www.perplexity.ai/help-center/en/articles/10738684-what-is-research-mode',
      'https://www.perplexity.ai/help-center/en/articles/12528830-creating-assets-with-perplexity-overview',
      'https://www.perplexity.ai/help-center/en/collections/18799290-features',
    ],
    capabilityHints: ['web_search','deep_research','citations','document_generation','pdf_generation','spreadsheet_generation','presentation_generation','web_app_generation','scheduled_tasks','persistent_memory','projects_workspaces','image_generation','video_generation'],
  },
]);

export const YOYO_REQUIRED_CAPABILITIES = Object.freeze([
  ...new Set([...GENERAL_AI_CAPABILITIES, ...YOYO_EXCLUSIVE_CAPABILITIES]),
]);

export function benchmarkCoverage(implemented = []) {
  const set = new Set(implemented);
  const missing = YOYO_REQUIRED_CAPABILITIES.filter((capability) => !set.has(capability));
  const covered = YOYO_REQUIRED_CAPABILITIES.length - missing.length;
  return {
    covered,
    total: YOYO_REQUIRED_CAPABILITIES.length,
    ratio: YOYO_REQUIRED_CAPABILITIES.length ? covered / YOYO_REQUIRED_CAPABILITIES.length : 0,
    missing,
  };
}

export function superiorityTarget(bestCompetitorScore) {
  const baseline = Math.max(0, Number(bestCompetitorScore) || 0);
  return Math.min(100, Math.round(baseline * YOYO_SUPERIORITY_TARGET.qualityMultiplierTarget * 100) / 100);
}
