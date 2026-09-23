import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/proxy'

const publicSeoPaths = new Set([
  '/',
  '/presentacion',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
])

export async function proxy(request: NextRequest) {
  if (publicSeoPaths.has(request.nextUrl.pathname)) {
    const response = NextResponse.next({ request })
    response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400')
    response.headers.set('X-Robots-Tag', 'index, follow')
    return response
  }
  return updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
