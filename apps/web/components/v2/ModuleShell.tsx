'use client'

import type {ReactNode} from 'react'
import {
  BarChart3,
  Bell,
  Bot,
  ChevronRight,
  FileText,
  Gamepad2,
  Home,
  Library,
  Menu,
  MessageSquare,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Sparkles,
  Users,
  X
} from 'lucide-react'
import {useState} from 'react'

const navigation = [
  {label: 'Inicio', icon: Home, href: '/app'},
  {label: 'Biblioteca', icon: Library, href: '/biblioteca'},
  {label: 'Crear', icon: Sparkles, href: '/crear'},
  {label: 'YOYO', icon: Bot, href: '/yoyo'},
  {label: 'Juegos', icon: Gamepad2, href: '/juegos'},
  {label: 'Estudiantes', icon: Users, href: '/estudiantes'},
  {label: 'Informes', icon: FileText, href: '/informes'},
  {label: 'Configuración', icon: Settings, href: '/configuracion'}
]

export function ModuleShell({active, children, createHref='/crear'}: {active: string; children: ReactNode; createHref?: string}) {
  const [mobileOpen, setMobileOpen] = useState(false)
  return (
    <main className="product-shell module-product-shell">
      <aside className={`app-sidebar module-sidebar ${mobileOpen ? 'mobile-open' : ''}`} aria-label="Navegación principal">
        <button className="mobile-sidebar-close" onClick={()=>setMobileOpen(false)} aria-label="Cerrar menú"><X/></button>
        <div className="brand"><span className="brand-mark">Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></div>
        <div className="workspace-switch"><span className="workspace-logo">C</span><span><small>Institución</small><strong>Colegio Coyam</strong></span><ChevronRight size={17}/></div>
        <nav className="side-nav">
          {navigation.map(({label, icon: Icon, href}) => <a className={active===label?'nav-link active':'nav-link'} href={href} key={label} aria-current={active===label?'page':undefined}><Icon size={20}/><span>{label}</span>{active===label&&<i/>}</a>)}
        </nav>
        <div className="sidebar-help"><span><MessageSquare size={20}/></span><div><strong>¿Necesitas ayuda?</strong><small>Habla con el equipo YOYO</small></div><ChevronRight size={17}/></div>
        <button className="profile-card" type="button"><span className="profile-avatar">ER</span><span><strong>Elba Rosales</strong><small>Docente · PIE</small></span><MoreHorizontal size={18}/></button>
      </aside>

      <section className="workspace module-workspace">
        <header className="topbar module-topbar">
          <button className="mobile-menu-trigger" onClick={()=>setMobileOpen(true)} aria-label="Abrir menú"><Menu/></button>
          <div className="mobile-brand"><span className="brand-mark">Y</span><strong>YOYOLETRASAI</strong></div>
          <label className="global-search"><Search size={19}/><input aria-label="Buscar" placeholder="Buscar recursos, estudiantes o actividades..."/><kbd>⌘ K</kbd></label>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notificaciones"><Bell size={20}/><span>3</span></button><a className="primary-button" href={createHref}><Plus size={20}/><span>Crear actividad</span></a></div>
        </header>
        <div className="module-content">{children}</div>
      </section>

      {mobileOpen&&<button className="sidebar-backdrop" onClick={()=>setMobileOpen(false)} aria-label="Cerrar menú"/>}
      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">{navigation.slice(0,5).map(({label,icon:Icon,href})=><a href={href} key={label} className={active===label?'active':''}><Icon/><span>{label}</span></a>)}</nav>
    </main>
  )
}

export function ModuleStat({icon: Icon, value, label, tone}: {icon: typeof BarChart3; value: string; label: string; tone: string}) {
  return <article className={`module-stat tone-${tone}`}><span><Icon/></span><div><strong>{value}</strong><small>{label}</small></div></article>
}
