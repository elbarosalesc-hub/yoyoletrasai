import fs from 'node:fs'

const checks = [
  {
    path: 'apps/web/app/api/evolution/ai-eval/route.ts',
    forbidden: [/ai-gateway\.vercel\.sh/i, /VERCEL_OIDC_TOKEN/i],
    reason: 'Evolution AI evaluation must use the governed Cloudflare gateway.',
  },
  {
    path: 'apps/web/app/api/profesor-virtual/chat/route.ts',
    forbidden: [/teacher-fallback/i, /fallback\s*:\s*true/i],
    reason: 'Virtual Teacher must not present fixed templates as real AI output.',
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
    forbidden: [/resolveProductAccess\(email,\s*role\)/],
    reason: 'Billing checkout must bind owner access to the authenticated user id.',
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

let failed = false

for (const deprecatedFile of deprecatedFiles) {
  if (fs.existsSync(deprecatedFile)) {
    console.error(`::error::Deprecated unsafe implementation must remain removed: ${deprecatedFile}`)
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
for (const requiredPrefix of ['/inclusion', '/profesor-virtual', '/seguimiento', '/informes', '/misiones', '/configuracion']) {
  if (!proxy.includes(`'${requiredPrefix}'`)) {
    console.error(`::error::Protected route prefix missing from proxy: ${requiredPrefix}`)
    failed = true
  }
}

for (const migration of [
  'supabase/migrations/20261002141000_add_inclusion_boards.sql',
  'supabase/migrations/20261002142500_harden_user_platform_preferences_rls.sql',
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
