import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

function json(body: Record<string, unknown>, status: number) {
  return NextResponse.json(body, {
    status,
    headers: {
      'Cache-Control': 'no-store, max-age=0',
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
    },
  })
}

function payload(status: 'ok'|'degraded'|'misconfigured', checkedAt: string, databaseGateway: string, aiGateway: string) {
  return {
    status,
    checkedAt,
    timestamp: checkedAt,
    runtime: 'cloudflare-workers',
    services: {
      application: 'operational',
      databaseGateway,
      aiGateway,
      runtime: 'cloudflare-workers',
    },
  }
}

export async function GET() {
  const checkedAt = new Date().toISOString()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const aiConfigured = Boolean(
    process.env.YOYO_AI_GATEWAY_URL ||
    (process.env.CLOUDFLARE_ACCOUNT_ID && process.env.CLOUDFLARE_API_TOKEN)
  )
  const aiGateway = aiConfigured ? 'configured' : 'not_configured'

  if (!supabaseUrl || !publishableKey) {
    return json(payload('misconfigured', checkedAt, 'not_configured', aiGateway), 503)
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4_000)

  try {
    const endpoint = new URL('/rest/v1/', supabaseUrl)
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        apikey: publishableKey,
        Authorization: `Bearer ${publishableKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    })

    if (response.status >= 500) {
      return json(payload('degraded', checkedAt, 'unreachable', aiGateway), 503)
    }

    return json(payload(aiConfigured ? 'ok' : 'degraded', checkedAt, 'reachable', aiGateway), 200)
  } catch (error) {
    console.error('[health-check] Supabase connectivity failed', {
      error: error instanceof Error ? error.message : String(error),
    })
    return json(payload('degraded', checkedAt, 'unreachable', aiGateway), 503)
  } finally {
    clearTimeout(timeout)
  }
}
