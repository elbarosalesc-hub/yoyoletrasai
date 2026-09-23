import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'YOYOLETRASAI',
    short_name: 'YOYO',
    description: 'Plataforma educativa para docentes, equipos PIE e instituciones.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0d1530',
    theme_color: '#0d1530',
    lang: 'es-CL',
  }
}
