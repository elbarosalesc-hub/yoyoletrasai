import type {Metadata,Viewport} from 'next'
import './globals.css'
import './premium.css'
import './game3d.css'
import './dashboard-premium.css'
import './dashboard-canonical.css'
import './modules-premium.css'
import './premium-v2.css'
import './scene-v2.css'
import './tools-functional.css'
import './deploy-ready.css'

export const metadata:Metadata={title:'YOYOLETRASAI',description:'Plataforma educativa inteligente, inclusiva e interactiva para Chile y Latinoamérica'}
export const viewport:Viewport={width:'device-width',initialScale:1,maximumScale:1,viewportFit:'cover',themeColor:'#6d3df2'}

export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="es"><body>{children}</body></html>
}
