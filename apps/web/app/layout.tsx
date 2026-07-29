import type {Metadata,Viewport} from 'next'
import type {ReactNode} from 'react'
import './globals.css'
import './modules-v2.css'
import './yoyo-v2.css'
import './creator-v2.css'
import './students-reports-v2.css'
import './games-settings-v2.css'
import './canonical-v2.css'
import './immersive-v2.css'
import './auth-roles-v2.css'
import './users-admin-v2.css'
import './account-flows-v2.css'
import './admin-governance-v2.css'

export const metadata:Metadata={
  title:'YOYOLETRASAI | Plataforma educativa',
  description:'Plataforma educativa inclusiva con creación, juegos 3D, profesor virtual y seguimiento pedagógico.'
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
