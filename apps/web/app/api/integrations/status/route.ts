import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const providerRequirements = {
  canvas: ['CANVAS_BASE_URL','CANVAS_CLIENT_ID','CANVAS_CLIENT_SECRET','CANVAS_REDIRECT_URI'],
  classroom: ['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REDIRECT_URI'],
} as const

export async function GET() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const providers = Object.fromEntries(Object.entries(providerRequirements).map(([key, required]) => {
    const missing = required.filter(name => !process.env[name])
    return [key, {
      configured: missing.length === 0,
      missing,
      required: [...required],
    }]
  }))

  return NextResponse.json({
    runtime: 'cloudflare-workers',
    oauthSecrets: 'server-only',
    providers,
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
