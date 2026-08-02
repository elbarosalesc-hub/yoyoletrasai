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

export async function GET() {
  const timestamp = new Date().toISOString()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publishableKey) {
    return json(
      {
        status: 'degraded',
        application: 'operational',
        configuration: 'missing',
        database: 'not_configured',
        timestamp,
      },
      503,
    )
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
      return json(
        {
          status: 'degraded',
          application: 'operational',
          configuration: 'valid',
          database: 'unreachable',
          timestamp,
        },
        503,
      )
    }

    return json(
      {
        status: 'ok',
        application: 'operational',
        configuration: 'valid',
        database: 'reachable',
        timestamp,
      },
      200,
    )
  } catch (error) {
    console.error('[health-check] Supabase connectivity failed', {
      error: error instanceof Error ? error.message : String(error),
    })

    return json(
      {
        status: 'degraded',
        application: 'operational',
        configuration: 'valid',
        database: 'unreachable',
        timestamp,
      },
      503,
    )
  } finally {
    clearTimeout(timeout)
  }
}
