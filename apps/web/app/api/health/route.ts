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
  const checkedAt = new Date().toISOString()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!supabaseUrl || !publishableKey) {
    return json(
      {
        status: 'misconfigured',
        checkedAt,
        services: {
          application: 'ok',
          databaseGateway: 'unavailable',
        },
      },
      503,
    )
  }

  try {
    const endpoint = new URL('/rest/v1/', supabaseUrl)
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 4_000)

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

    clearTimeout(timeout)

    if (response.status >= 500) {
      return json(
        {
          status: 'degraded',
          checkedAt,
          services: {
            application: 'ok',
            databaseGateway: 'error',
          },
        },
        503,
      )
    }

    return json(
      {
        status: 'ok',
        checkedAt,
        services: {
          application: 'ok',
          databaseGateway: 'reachable',
        },
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
        checkedAt,
        services: {
          application: 'ok',
          databaseGateway: 'unreachable',
        },
      },
      503,
    )
  }
}
