const supabaseUrl=(process.env.NEXT_PUBLIC_SUPABASE_URL||'').replace(/\/$/,'')
const serviceRole=(process.env.SUPABASE_SERVICE_ROLE_KEY||process.env.RUNTIME_SUPABASE_SERVICE_ROLE_KEY||'').trim()

if(!supabaseUrl||!serviceRole){
  console.error('::error::Supabase URL/service role missing for live schema verification.')
  process.exit(1)
}

const requiredTables=[
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
]

const headers={
  apikey:serviceRole,
  Authorization:`Bearer ${serviceRole}`,
  Accept:'application/json',
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

if(failed) process.exit(1)
console.log('Live Supabase schema contract: OK')
