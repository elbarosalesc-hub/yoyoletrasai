import type { Metadata } from 'next'
import { headers } from 'next/headers'
import PublicPresentationPage from './presentacion/page'

async function getPublicOrigin() {
  const values = await headers()
  const host = values.get('x-forwarded-host') || values.get('host')
  const proto = (values.get('x-forwarded-proto') || 'https').split(',')[0].trim()
  return host ? `${proto}://${host}` : undefined
}

export async function generateMetadata(): Promise<Metadata> {
  const origin = await getPublicOrigin()
  return {
    title: 'YOYOLETRASAI | Plataforma educativa inclusiva con IA para Chile',
    description: 'Plataforma educativa para docentes, equipos PIE e instituciones: planificación, DUA, evaluación, recursos, seguimiento y herramientas pedagógicas.',
    alternates: origin ? { canonical: origin } : undefined,
    openGraph: {
      title: 'YOYOLETRASAI | Plataforma educativa inclusiva',
      description: 'Planificación, PIE, DUA, evaluación, recursos y seguimiento pedagógico en un ecosistema educativo conectado.',
      url: origin,
      siteName: 'YOYOLETRASAI',
      locale: 'es_CL',
      type: 'website',
    },
  }
}

export default PublicPresentationPage
