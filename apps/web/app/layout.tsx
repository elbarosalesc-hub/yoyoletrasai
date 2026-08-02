import type {Metadata,Viewport} from 'next'
import type {ReactNode} from 'react'
import './globals.css'
import './premium.css'
import './game3d.css'
import './dashboard-premium.css'
import './dashboard-canonical.css'
import './dashboard-interactive.css'
import './modules-premium.css'
import './premium-v2.css'
import './scene-v2.css'
import './tools-functional.css'
import './creator-functional.css'
import './course-functional.css'
import './library-functional.css'
import './interface-interactive.css'
import './approved-experience.css'
import './deploy-ready.css'
import './integrations-3d.css'
import './platform-complete.css'
import './mobile-reference.css'
import './approved-platform.css'
import './approved-shell.css'

export const metadata:Metadata={
 title:'YoYo Letras AI | Plataforma educativa inteligente',
 description:'Plataforma educativa institucional con IA, inclusión, recursos, evaluación, seguimiento y gestión pedagógica.',
 applicationName:'YoYo Letras AI',
 keywords:['educación','Chile','PIE','DUA','recursos educativos','inteligencia artificial','gestión escolar'],
 authors:[{name:'Elba Rosales'}]
}

export const viewport:Viewport={width:'device-width',initialScale:1,maximumScale:5,viewportFit:'cover',themeColor:'#0d1530'}

export default function RootLayout({children}:{children:ReactNode}){
 return <html lang="es"><body>{children}</body></html>
}