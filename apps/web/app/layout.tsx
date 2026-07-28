import type {Metadata,Viewport} from 'next'
import type {ReactNode} from 'react'
import './globals.css'
import './premium.css'
import './game3d.css'
import './dashboard-premium.css'
import './dashboard-canonical.css'
import './modules-premium.css'
import './premium-v2.css'
import './scene-v2.css'
import './tools-functional.css'
import './creator-functional.css'
import './course-functional.css'
import './library-functional.css'
import './deploy-ready.css'
import './integrations-3d.css'
import './platform-complete.css'
import './mobile-reference.css'

export const metadata:Metadata={
 title:'YOYOLETRASAI | Plataforma educativa premium con IA',
 description:'Recursos curriculares, Profesor Virtual, juegos inmersivos, herramientas DUA y PIE, evaluación y seguimiento para Chile y Latinoamérica',
 applicationName:'YOYOLETRASAI',
 keywords:['educación','Chile','PIE','DUA','recursos educativos','inteligencia artificial','juegos educativos'],
 authors:[{name:'Elba Rosales'}]
}

export const viewport:Viewport={width:'device-width',initialScale:1,maximumScale:5,viewportFit:'cover',themeColor:'#123d4b'}

export default function RootLayout({children}:{children:ReactNode}){
 return <html lang="es"><body>{children}</body></html>
}
