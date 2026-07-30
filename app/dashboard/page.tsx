import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { DashboardExperience } from './DashboardExperience'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  let displayName = 'Elba'
  let authenticated = false

  if (isSupabaseConfigured()) {
    const supabase = await createClient()
    const { data } = await supabase.auth.getUser()
    if (!data.user) redirect('/login')
    authenticated = true
    displayName = data.user.user_metadata?.display_name ?? data.user.email?.split('@')[0] ?? 'Estudiante'
  }

  return <DashboardExperience displayName={displayName} authenticated={authenticated} />
}
