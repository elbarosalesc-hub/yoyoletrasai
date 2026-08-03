import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from './database.types'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config'

const protectedPrefixes = ['/app', '/cursos', '/seleccionar-institucion']
const authenticatedPublicPaths = ['/restablecer-contrasena']

function createLoginRedirect(request: NextRequest) {
  const loginUrl = request.nextUrl.clone()
  loginUrl.pathname = '/acceso'
  loginUrl.search = ''
  loginUrl.searchParams.set('next', `${request.nextUrl.pathname}${request.nextUrl.search}`)
  return NextResponse.redirect(loginUrl)
}

function copyResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie)
  })
  return target
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
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
  const pathname = request.nextUrl.pathname
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix))
  const isAuthenticatedPublic = authenticatedPublicPaths.includes(pathname)

  if (isProtected && !isAuthenticated) {
    return copyResponseCookies(response, createLoginRedirect(request))
  }

  if (pathname === '/acceso' && isAuthenticated) {
    const destination = request.nextUrl.clone()
    destination.pathname = '/seleccionar-institucion'
    destination.search = ''
    return copyResponseCookies(response, NextResponse.redirect(destination))
  }

  if (isAuthenticatedPublic && !isAuthenticated) {
    return copyResponseCookies(response, createLoginRedirect(request))
  }

  response.headers.set('Cache-Control', 'private, no-store')
  return response
}
