'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  CalendarDays,
  Compass,
  Home,
  LogOut,
  Trophy,
  UserRound,
} from 'lucide-react'

const navigation = [
  { href: '/dashboard', label: 'Inicio', icon: Home },
  { href: '/misiones', label: 'Misiones', icon: Compass },
  { href: '/agenda', label: 'Agenda', icon: CalendarDays },
  { href: '/logros', label: 'Logros', icon: Trophy },
  { href: '/perfil', label: 'Perfil', icon: UserRound },
]

export function PlatformShell({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <main className="module-shell">
      <header className="module-topbar">
        <Link href="/dashboard" className="dashboard-logo">
          <span>YO</span>
          <strong>YoYo Letras AI</strong>
        </Link>
        <div className="module-top-actions">
          <button type="button" aria-label="Notificaciones">
            <Bell />
          </button>
          <Link href="/perfil" className="module-avatar" aria-label="Abrir perfil">
            ER
          </Link>
        </div>
      </header>

      <section className="module-heading">
        <div>
          <span className="eyebrow">CENTRO DE APRENDIZAJE</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
        <Link href="/dashboard" className="module-back-link">
          Volver a la aventura
        </Link>
      </section>

      <section className="module-content">{children}</section>

      <nav className="module-navigation" aria-label="Navegación principal">
        {navigation.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className={pathname === href ? 'active' : ''}>
            <Icon />
            <span>{label}</span>
          </Link>
        ))}
      </nav>

      <form action="/auth/signout" method="post" className="floating-signout">
        <button type="submit" aria-label="Cerrar sesión">
          <LogOut />
        </button>
      </form>
    </main>
  )
}
