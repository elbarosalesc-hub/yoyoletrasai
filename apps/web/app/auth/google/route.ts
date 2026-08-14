import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const next = url.searchParams.get('next')?.startsWith('/') ? url.searchParams.get('next')! : '/app'
  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${url.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })
  if (error || !data.url) return NextResponse.redirect(`${url.origin}/acceso?error=google_oauth_failed`)
  return NextResponse.redirect(data.url)
}