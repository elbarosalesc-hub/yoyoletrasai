import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'YoYo Letras AI',
  description: 'Plataforma educativa inmersiva, inclusiva y potenciada por inteligencia artificial.',
  applicationName: 'YoYo Letras AI',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070b18',
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
