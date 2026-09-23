import type { Metadata } from 'next'
import PublicPresentationPage from './presentacion/page'

export const metadata: Metadata = {
  title: 'YOYOLETRASAI | Plataforma educativa inclusiva con IA para Chile',
  description: 'Plataforma educativa para docentes, equipos PIE e instituciones: planificación, DUA, evaluación, recursos, seguimiento y herramientas pedagógicas.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'YOYOLETRASAI | Plataforma educativa inclusiva',
    description: 'Planificación, PIE, DUA, evaluación, recursos y seguimiento pedagógico en un ecosistema educativo conectado.',
    url: '/',
    siteName: 'YOYOLETRASAI',
    locale: 'es_CL',
    type: 'website',
  },
}

export default PublicPresentationPage
