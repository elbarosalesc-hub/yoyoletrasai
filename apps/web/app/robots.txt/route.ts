import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export function GET(request: Request) {
  const origin = new URL(request.url).origin
  const body = [
    'User-agent: *',
    'Allow: /',
    'Allow: /presentacion',
    'Allow: /acceso',
    'Disallow: /app',
    'Disallow: /dashboard',
    'Disallow: /api',
    'Disallow: /admin',
    'Disallow: /configuracion',
    'Disallow: /estudiantes',
    'Disallow: /seguimiento',
    'Disallow: /informes',
    'Disallow: /misiones',
    'Disallow: /perfil',
    'Disallow: /seleccionar-institucion',
    `Sitemap: ${origin}/sitemap.xml`,
  ].join('\n')
  return new NextResponse(body + '\n', {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
