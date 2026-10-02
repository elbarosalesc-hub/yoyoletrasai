import 'server-only'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export function createAIUsageServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || ''
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() || ''
  if (!url || !serviceRole) return null

  return createServiceClient(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}
