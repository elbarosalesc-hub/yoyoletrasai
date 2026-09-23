import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

function escapeXml(value: string) {
  return value.replace(/[<>&'"]/g, (char) => ({
    '<':'&lt;','>':'&gt;','&':'&amp;',"'":'&apos;','"':'&quot;'
  }[char] || char))
}

export function GET(request: Request) {
  const origin = new URL(request.url).origin
  const today = new Date().toISOString()
  const urls = [
    { loc: origin, changefreq: 'weekly', priority: '1.0' },
    { loc: `${origin}/presentacion`, changefreq: 'weekly', priority: '0.8' },
    { loc: `${origin}/acceso`, changefreq: 'monthly', priority: '0.5' },
  ]
  const entries = urls.map((item) => `
  <url>
    <loc>${escapeXml(item.loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${item.changefreq}</changefreq>
    <priority>${item.priority}</priority>
  </url>`).join('')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}
</urlset>`
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
