import type { MetadataRoute } from 'next'

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://yoyoletrasai.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/presentacion', '/acceso', '/estado'],
        disallow: [
          '/app',
          '/dashboard',
          '/api',
          '/admin',
          '/configuracion',
          '/estudiantes',
          '/seguimiento',
          '/informes',
          '/misiones',
          '/perfil',
          '/seleccionar-institucion',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
