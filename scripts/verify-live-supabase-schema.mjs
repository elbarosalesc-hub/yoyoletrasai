const supabaseUrl=(process.env.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'')
const serviceRole=(process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.RUNTIME_SUPABASE_SERVICE_ROLE_KEY||'').trim()

if(!supabaseUrl||!serviceRole){
  console.error('::error::Supabase URL/service role missing for live schema verification.')
  process.exit(1)
}

const requiredTables=[
  'organizations',
  'organization_memberships',
  'profiles',
  'courses',
  'students',
  'course_enrollments',
  'student_support_profiles',
  'learning_objectives',
  'learning_evidence',
  'platform_resources',
  'ai_plans',
  'ai_entitlements',
  'ai_usage_events',
  'ai_generations',
  'ai_source_files',
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
  'resource_progress',
  'weekly_planners',
  'evolution_audit_runs',
  'evolution_benchmarks',
  'evolution_actions',
  'ai_eval_cases',
  'ai_eval_runs',
]

const headers={
  apikey:serviceRole,
  Authorization:`Bearer ${serviceRole}`,
  Accept:'application/json',
}

const requiredColumns={
  user_platform_preferences:['library_favorites','library_view'],
  ai_entitlements:['user_id','organization_id','plan_id','status','period_start','period_end'],
  billing_subscriptions:['organization_id','user_id','plan_key','status'],
  resource_progress:['organization_id','user_id','resource_key','payload'],
  reports:['organization_id','report_type','status','version'],
  family_communications:['organization_id','status','reviewed_at','sent_at'],
}

let failed=false

for(const table of requiredTables){
  try{
    const response=await fetch(`${supabaseUrl}/rest/v1/${table}?select=*&limit=0`,{
      method:'GET',
      headers,
      signal:AbortSignal.timeout(10000),
    })
    if(!response.ok){
      const body=await response.text().catch(()=> '')
      console.error(`::error::Required live table unavailable: ${table} (HTTP ${response.status}) ${body.slice(0,180)}`)
      failed=true
    }else{
      console.log(`OK live table: ${table}`)
    }
  }catch(error){
    console.error(`::error::Unable to verify live table ${table}: ${error instanceof Error?error.message:String(error)}`)
    failed=true
  }
}

for(const [table,columns] of Object.entries(requiredColumns)){
  try{
    const response=await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns.join(',')}&limit=0`,{
      method:'GET',
      headers,
      signal:AbortSignal.timeout(10000),
    })
    if(!response.ok){
      const body=await response.text().catch(()=> '')
      console.error(`::error::Required live columns unavailable: ${table}(${columns.join(',')}) HTTP ${response.status} ${body.slice(0,180)}`)
      failed=true
    }else{
      console.log(`OK live columns: ${table}(${columns.join(',')})`)
    }
  }catch(error){
    console.error(`::error::Unable to verify live columns for ${table}: ${error instanceof Error?error.message:String(error)}`)
    failed=true
  }
}

if(failed) process.exit(1)
console.log('Live Supabase schema contract: OK')
