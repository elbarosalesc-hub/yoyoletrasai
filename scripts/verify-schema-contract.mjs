import fs from 'node:fs'
import path from 'node:path'

const migrationDir = path.resolve('supabase/migrations')
if (!fs.existsSync(migrationDir)) {
  console.error('::error::Missing supabase/migrations directory.')
  process.exit(1)
}

const sql = fs.readdirSync(migrationDir)
  .filter((name) => name.endsWith('.sql'))
  .sort()
  .map((name) => fs.readFileSync(path.join(migrationDir, name), 'utf8'))
  .join('\n')

const requiredTables = [
  'user_platform_preferences',
  'learning_missions',
  'learning_mission_progress',
  'virtual_teacher_history',
  'billing_subscriptions',
  'billing_events',
  'inclusion_boards',
  'student_guardians',
  'reports',
  'report_versions',
  'family_communications',
  'resource_drafts',
  'weekly_planners',
]

const requiredFunctions = [
  'authorize_ai_request_for_org',
  'set_ai_entitlement_for_org',
  'save_report',
]

let failed = false

for (const table of requiredTables) {
  const createPattern = new RegExp(
    `create\\s+table\\s+(?:if\\s+not\\s+exists\\s+)?(?:public\\.)?${table}\\b`,
    'i',
  )
  const rlsPattern = new RegExp(
    `alter\\s+table\\s+(?:public\\.)?${table}\\s+enable\\s+row\\s+level\\s+security`,
    'i',
  )
  const authenticatedGrantPattern = new RegExp(
    `grant[\\s\\S]{0,300}on\\s+(?:table\\s+)?(?:public\\.)?${table}\\s+to\\s+authenticated`,
    'i',
  )
  if (!createPattern.test(sql)) {
    console.error(`::error::Missing migration definition for required table: ${table}`)
    failed = true
  }
  if (!rlsPattern.test(sql)) {
    console.error(`::error::Missing RLS enablement for required table: ${table}`)
    failed = true
  }
  if (!authenticatedGrantPattern.test(sql) && table !== 'billing_events') {
    console.error(`::error::Missing explicit authenticated grant contract for required table: ${table}`)
    failed = true
  }
}

for (const fn of requiredFunctions) {
  const pattern = new RegExp(
    `create\\s+or\\s+replace\\s+function\\s+(?:public\\.)?${fn}\\s*\\(`,
    'i',
  )
  if (!pattern.test(sql)) {
    console.error(`::error::Missing migration definition for required function: ${fn}`)
    failed = true
  }
}

const requiredHardening = [
  ['organization membership role hierarchy', /Prevent role escalation through organization membership management/i],
  ['AI source tenant isolation', /Strengthen AI source isolation by active organization membership/i],
  ['legacy Vercel cron retirement', /Retire legacy Supabase Cron jobs/i],
  ['institution billing read policy', /members read authorized institution subscriptions/i],
]

for (const [label, pattern] of requiredHardening) {
  if (!pattern.test(sql)) {
    console.error(`::error::Missing schema hardening contract: ${label}`)
    failed = true
  }
}

if (failed) process.exit(1)
console.log('Schema contract verification: OK')
