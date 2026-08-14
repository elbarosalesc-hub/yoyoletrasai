import { YOYO_MODULE_BLUEPRINTS } from './yoyo-core.js';
import { OWNER_AI_ROLES } from './owner-ai-config.js';

export const OWNER_PLATFORM_PROFILE = Object.freeze({
  version: '3.6.0-owner-control',
  protection: Object.freeze({
    ownerOnly: true,
    requirePlatformAdmin: true,
    requireOwnerPlan: true,
    productionWritesByDefault: false,
    domainChangesByDefault: false,
    aliasChangesByDefault: false,
  }),
  modules: Object.freeze(YOYO_MODULE_BLUEPRINTS.map((module) => Object.freeze({
    id: module.id,
    label: module.label,
    configurable: true,
    renameAllowed: true,
    visibilityControl: true,
    iconControl: true,
    resourceFactory: true,
  }))),
  visualDesign: Object.freeze({
    themeControl: true,
    paletteControl: true,
    iconControl: true,
    densityControl: true,
    typographyControl: true,
    ownerPreviewRequired: true,
    safeDefaultTheme: 'premium-academic',
  }),
  automation: Object.freeze({
    curriculumRefreshMonths: 6,
    capabilityBenchmarkMonths: 6,
    resourceFactory: true,
    allModules: true,
    qualityGate: 90,
    ownerReviewBeforeBreakingChanges: true,
    productionAutoPromotion: false,
  }),
  cache: Object.freeze({
    configurable: true,
    defaultStrategy: 'versioned-safe-cache',
    invalidateOnResourceVersionChange: true,
    neverCacheOwnerSecrets: true,
    neverCacheAuthTokens: true,
  }),
  plans: Object.freeze({
    ownerCanManageCatalog: true,
    ownerCanManageQuotas: true,
    ownerCanSuspendAccess: true,
    protectedOwnerPlan: 'propietaria',
  }),
  legal: Object.freeze({
    termsVersioning: true,
    privacyVersioning: true,
    ownerApprovalRequired: true,
    currentTermsStatus: 'draft-controlled',
  }),
  payments: Object.freeze({
    architectureReady: true,
    enabled: false,
    providerAgnostic: true,
    ownerActivationRequired: true,
    productionActivationRequiresExplicitConfirmation: true,
  }),
  ai: Object.freeze({
    ownerRoles: OWNER_AI_ROLES.map(({ id, label, mandate }) => ({ id, label, mandate })),
    nativeRuntimeRequiredForFullIndependence: true,
    platformStorageRequiredForFullIndependence: true,
    externalFallbackMustBeVisible: true,
    benchmarkTargetMultiplier: 1.2,
  }),
});

export function ownerProfileChecklist({ runtime, storage, coverage } = {}) {
  const checks = [
    { id: 'owner_access', label: 'Acceso propietario exclusivo', ok: OWNER_PLATFORM_PROFILE.protection.ownerOnly },
    { id: 'modules', label: '19 módulos administrables', ok: OWNER_PLATFORM_PROFILE.modules.length === 19 },
    { id: 'factory', label: 'Generador para todos los módulos', ok: OWNER_PLATFORM_PROFILE.automation.resourceFactory && OWNER_PLATFORM_PROFILE.automation.allModules },
    { id: 'refresh', label: 'Actualización y benchmark semestral', ok: OWNER_PLATFORM_PROFILE.automation.curriculumRefreshMonths === 6 && OWNER_PLATFORM_PROFILE.automation.capabilityBenchmarkMonths === 6 },
    { id: 'native_runtime', label: 'Motor nativo YOYO conectado', ok: Boolean(runtime?.nativeConfigured) },
    { id: 'storage', label: 'Almacenamiento YOYO conectado', ok: Boolean(storage?.configured) },
    { id: 'capability_parity', label: 'Paridad funcional verificada', ok: Boolean(coverage && coverage.missing?.length === 0) },
    { id: 'safe_production', label: 'Producción protegida contra promoción automática', ok: !OWNER_PLATFORM_PROFILE.automation.productionAutoPromotion },
  ];
  return {
    checks,
    blocking: checks.filter((check) => !check.ok).map((check) => check.id),
    readyForFullIndependence: checks.filter((check) => ['native_runtime', 'storage', 'capability_parity'].includes(check.id)).every((check) => check.ok),
  };
}
