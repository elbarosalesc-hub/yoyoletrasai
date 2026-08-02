import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'

const protectedPrefixes = ['/app', '/cursos', '/seleccionar-institucion']

function createLoginRedirect(request: NextRequest) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/acceso'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  return NextResponse.redirect(loginUrl)
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))
    return isProtected ? createLoginRedirect(request) : response
  }

  const supabase = createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet, cacheHeaders) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        response = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        )
        Object.entries(cacheHeaders).forEach(([header, value]) =>
          response.headers.set(header, value),
        )
      },
    },
  })

  const { data: claimsData, error } = await supabase.auth.getClaims()
  const isAuthenticated = !error && typeof claimsData?.claims?.sub === 'string'
  const isProtected = protectedPrefixes.some((prefix) => request.nextUrl.pathname.startsWith(prefix))

  if (isProtected && !isAuthenticated) {
    return createLoginRedirect(request)
  }

  if (request.nextUrl.pathname === '/acceso' && isAuthenticated) {
    const destination = request.nextUrl.clone()
    destination.pathname = '/seleccionar-institucion'
    destination.search = ''
    return NextResponse.redirect(destination)
  }

  return response
}
