import fs from 'node:fs'
import path from 'node:path'

const checks = [
  {
    path: 'apps/web/app/api/evolution/ai-eval/route.ts',
    forbidden: [/ai-gateway\.vercel\.sh/i, /VERCEL_OIDC_TOKEN/i],
    reason: 'Evolution AI evaluation must use the governed Cloudflare gateway.',
  },
  {
    path: 'apps/web/app/api/profesor-virtual/chat/route.ts',
    forbidden: [/teacher-fallback/i, /fallback\s*:\s*true/i, /sensitive_notes/i],
    reason: 'Virtual Teacher must not present fixed templates as real AI output or transmit sensitive PIE notes.',
  },
  {
    path: 'apps/web/app/api/profesor-virtual/context/route.ts',
    forbidden: [/sensitive_notes/i],
    reason: 'Virtual Teacher context must not expose sensitive PIE notes.',
  },
  {
    path: 'apps/web/app/api/ai/generate/route.ts',
    forbidden: [/sensitive_notes/i],
    reason: 'Generic YOYO AI generation must not expose sensitive PIE notes.',
  },
  {
    path: 'apps/web/app/inclusion/page.tsx',
    forbidden: [/localStorage/i, /yoyo-inclusion-board/i],
    reason: 'PIE/inclusion institutional content must not persist in localStorage.',
  },
  {
    path: 'apps/web/app/profesor-virtual/VirtualTeacherClient.tsx',
    forbidden: [/localStorage/i, /yoyo-virtual-teacher-history/i, /yoyo-profesor-virtual-transfer/i],
    reason: 'Virtual Teacher institutional content must not persist in localStorage.',
  },
  {
    path: 'apps/web/lib/product/access.ts',
    forbidden: [/FALLBACK_OWNER_EMAIL/i, /@gmail\.com/i, /premiumRole/],
    reason: 'Product access must come from a real plan/entitlement, not a hardcoded email or staff role.',
  },
  {
    path: 'apps/web/app/api/session/context/route.ts',
    forbidden: [/resolveProductAccess\(email,\s*role,\s*undefined/],
    reason: 'Session premium access must be derived from verified subscription state.',
  },
  {
    path: 'apps/web/app/api/billing/checkout/route.ts',
    forbidden: [
      /resolveProductAccess\(email,\s*role\)/,
      /subscriptionId\s*:\s*checkout\.id/,
    ],
    reason: 'Billing checkout must bind owner access to the authenticated user id and keep provider identifiers server-side.',
  },
  {
    path: 'apps/web/app/api/evolution/audit/route.ts',
    forbidden: [/rpc\(['"]is_platform_admin['"]\)/],
    reason: 'Evolution authorization must use active organization membership instead of the exposed admin RPC.',
  },
  {
    path: 'apps/web/app/api/ai/generate/route.ts',
    forbidden: [/rpc\(['"]authorize_ai_request['"]/],
    reason: 'YOYO AI authorization must be scoped to the active organization.',
  },
  {
    path: 'apps/web/app/api/profesor-virtual/chat/route.ts',
    forbidden: [/rpc\(['"]authorize_ai_request['"]/],
    reason: 'Virtual Teacher AI authorization must be scoped to the active organization.',
  },
  {
    path: 'apps/web/app/api/evaluaciones/adapt/route.ts',
    forbidden: [/rpc\(['"]authorize_ai_request['"]/],
    reason: 'Assessment AI authorization must be scoped to the active organization.',
  },
  {
    path: 'apps/web/app/api/ai/generate/route.ts',
    forbidden: [/\bdb\.rpc\(['"]complete_ai_request['"]/],
    reason: 'AI usage completion must use the server-only service-role client.',
  },
  {
    path: 'apps/web/app/api/profesor-virtual/chat/route.ts',
    forbidden: [/\bdb\.rpc\(['"]complete_ai_request['"]/],
    reason: 'Virtual Teacher usage completion must use the server-only service-role client.',
  },
  {
    path: 'apps/web/app/api/evaluaciones/adapt/route.ts',
    forbidden: [/\bdb\.rpc\(['"]complete_ai_request['"]/],
    reason: 'Assessment usage completion must use the server-only service-role client.',
  },
  {
    path: 'supabase/config.toml',
    forbidden: [/vercel\.app/i],
    reason: 'Supabase auth config must not contain legacy Vercel redirects.',
  },
  {
    path: 'apps/web/app/api/ai/sources/prepare/route.ts',
    forbidden: [
      /\.eq\('user_id',\s*userId\)\.in\('status'/,
      /const objectPath = \`\$\{userId\}\/\$\{batchId\}/,
    ],
    reason: 'AI source uploads must be scoped to the active organization.',
  },
  {
    path: 'apps/web/app/api/ai/sources/finalize/route.ts',
    forbidden: [/\.eq\('id',\s*sourceId\)\.maybeSingle\(\)/],
    reason: 'AI source finalization must filter by active organization.',
  },
]

const deprecatedFiles = [
  'apps/web/app/profesor-virtual/ProfesorVirtualClient.tsx',
  'apps/web/app/profesor-virtual/actions.ts',
]

const guardedRoutes = [
  ['apps/web/app/api/ai/entitlement/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/ai/generate/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/ai/sources/prepare/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/ai/sources/finalize/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/billing/status/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/billing/checkout/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/billing/subscription/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/evaluaciones/adapt/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/evolution/audit/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/evolution/ai-eval/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/reports/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/family-communications/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/health/supabase/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/inclusion/board/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/integrations/status/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/misiones/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/misiones/evidencia/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/profile/preferences/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/profesor-virtual/chat/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/profesor-virtual/context/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/profesor-virtual/history/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/prompts-chat/search/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/session/context/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/session/organization/route.ts', /auth\.getClaims\(/],
  ['apps/web/app/api/billing/webhooks/mercadopago/route.ts', /verifyMercadoPagoWebhookSignature/],
  ['apps/web/app/api/cron/evolution/route.ts', /CRON_SECRET/],
]

const organizationScopedRoutes = [
  'apps/web/app/api/ai/entitlement/route.ts',
  'apps/web/app/api/ai/generate/route.ts',
  'apps/web/app/api/ai/sources/prepare/route.ts',
  'apps/web/app/api/ai/sources/finalize/route.ts',
  'apps/web/app/api/billing/checkout/route.ts',
  'apps/web/app/api/billing/subscription/route.ts',
  'apps/web/app/api/evaluaciones/adapt/route.ts',
  'apps/web/app/api/evolution/audit/route.ts',
  'apps/web/app/api/evolution/ai-eval/route.ts',
  'apps/web/app/api/reports/route.ts',
  'apps/web/app/api/family-communications/route.ts',
  'apps/web/app/api/inclusion/board/route.ts',
  'apps/web/app/api/misiones/route.ts',
  'apps/web/app/api/misiones/evidencia/route.ts',
  'apps/web/app/api/profile/preferences/route.ts',
  'apps/web/app/api/profesor-virtual/chat/route.ts',
  'apps/web/app/api/profesor-virtual/context/route.ts',
  'apps/web/app/api/profesor-virtual/history/route.ts',
  'apps/web/app/api/session/context/route.ts',
  'apps/web/app/api/session/organization/route.ts',
]

let failed = false

for (const deprecatedFile of deprecatedFiles) {
  if (fs.existsSync(deprecatedFile)) {
    console.error(`::error::Deprecated unsafe implementation must remain removed: ${deprecatedFile}`)
    failed = true
  }
}

for (const [routePath, guardPattern] of guardedRoutes) {
  if (!fs.existsSync(routePath)) {
    console.error(`::error::Missing guarded route: ${routePath}`)
    failed = true
    continue
  }
  const source = fs.readFileSync(routePath, 'utf8')
  if (!guardPattern.test(source)) {
    console.error(`::error::Sensitive route lost its required guard: ${routePath}`)
    failed = true
  }
}

for (const routePath of organizationScopedRoutes) {
  const source = fs.readFileSync(routePath, 'utf8')
  if (!source.includes('yoyo-organization-id')) {
    console.error(`::error::Organization-scoped route lost its tenant selector: ${routePath}`)
    failed = true
  }
}

function collectApiRoutes(dir) {
  const routes = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) routes.push(...collectApiRoutes(full))
    else if (entry.isFile() && entry.name === 'route.ts') routes.push(full.replaceAll('\\', '/'))
  }
  return routes
}

const publicApiRoutes = new Set([
  'apps/web/app/api/health/route.ts',
])

for (const routePath of collectApiRoutes('apps/web/app/api')) {
  if (publicApiRoutes.has(routePath)) continue
  const source = fs.readFileSync(routePath, 'utf8')
  const guarded =
    /auth\.getClaims\(/.test(source) ||
    /auth\.getUser\(/.test(source) ||
    /verifyMercadoPagoWebhookSignature/.test(source) ||
    /CRON_SECRET/.test(source)
  if (!guarded) {
    console.error(`::error::API route has no recognized authentication/signature/secret guard: ${routePath}`)
    failed = true
  }
}

for (const routePath of [
  'apps/web/app/api/ai/generate/route.ts',
  'apps/web/app/api/profesor-virtual/chat/route.ts',
  'apps/web/app/api/evaluaciones/adapt/route.ts',
]) {
  const source = fs.readFileSync(routePath, 'utf8')
  const configIndex = source.indexOf('getCloudflareAIConfig().configured')
  const serviceClientIndex = source.indexOf('createAIUsageServiceClient')
  const authorizationIndex = source.indexOf('authorize_ai_request_for_org')
  if (
    configIndex === -1 ||
    serviceClientIndex === -1 ||
    authorizationIndex === -1 ||
    configIndex > authorizationIndex ||
    serviceClientIndex > authorizationIndex
  ) {
    console.error(`::error::AI runtime and secure usage backend must be checked before quota reservation: ${routePath}`)
    failed = true
  }
}

for (const check of checks) {
  if (!fs.existsSync(check.path)) {
    console.error(`::error::Missing security-critical file: ${check.path}`)
    failed = true
    continue
  }

  const source = fs.readFileSync(check.path, 'utf8')
  for (const pattern of check.forbidden) {
    if (pattern.test(source)) {
      console.error(`::error::Forbidden pattern ${pattern} found in ${check.path}. ${check.reason}`)
      failed = true
    }
  }
}

const proxy = fs.readFileSync('apps/web/lib/supabase/proxy.ts', 'utf8')
for (const requiredPrefix of ['/inclusion', '/profesor-virtual', '/seguimiento', '/informes', '/familias', '/misiones', '/configuracion']) {
  if (!proxy.includes(`'${requiredPrefix}'`)) {
    console.error(`::error::Protected route prefix missing from proxy: ${requiredPrefix}`)
    failed = true
  }
}

for (const migration of [
  'supabase/migrations/20261002141000_add_inclusion_boards.sql',
  'supabase/migrations/20261002142500_harden_user_platform_preferences_rls.sql',
  'supabase/migrations/20261002144000_harden_security_and_fk_indexes.sql',
]) {
  if (!fs.existsSync(migration)) {
    console.error(`::error::Required security migration missing: ${migration}`)
    failed = true
  }
}

if (failed) {
  console.error('Security boundary verification failed.')
  process.exit(1)
}

console.log('Security boundary verification: OK')
