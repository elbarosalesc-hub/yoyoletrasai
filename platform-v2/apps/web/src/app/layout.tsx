import type {Metadata} from 'next'
import '@yoyo/design-tokens/tokens.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'YOYOLETRASAI | Panel docente',
  description: 'Plataforma educativa premium para docentes, estudiantes y familias.'
}

export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  )
}
