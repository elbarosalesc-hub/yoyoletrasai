import type {Metadata,Viewport} from 'next'
import type {ReactNode} from 'react'
import './globals.css'
import './modules-v2.css'
import './yoyo-v2.css'
import './creator-v2.css'
import './students-reports-v2.css'
import './games-settings-v2.css'
import './canonical-v2.css'

export const metadata:Metadata={
  title:'YOYOLETRASAI | Panel docente V2',
  description:'Plataforma educativa inclusiva para planificación, creación y seguimiento pedagógico.'
}

export const viewport:Viewport={
  width:'device-width',
  initialScale:1,
  maximumScale:5,
  viewportFit:'cover',
  themeColor:'#7c3aed'
}

export default function RootLayout({children}:{children:ReactNode}){
  return <html lang="es"><body>{children}</body></html>
}
