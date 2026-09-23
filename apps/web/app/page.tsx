import { redirect } from 'next/navigation'

export const metadata = {
  title: 'YOYOLETRASAI | Plataforma educativa institucional',
  description: 'Acceso directo a la nueva plataforma educativa institucional.',
}

export default function HomePage() {
  redirect('/app')
}
