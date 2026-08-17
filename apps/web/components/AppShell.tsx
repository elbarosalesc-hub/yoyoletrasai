'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  Accessibility, BarChart3, Bell, BookOpen, BookOpenCheck, Bot, CalendarDays, Check,
  ChevronDown, ChevronRight, ClipboardList, Cloud, Command, FileText, FlaskConical,
  Gamepad2, Home, Images, Mail, Menu, PenTool, Radar, Search, Settings, ShieldCheck,
  Sparkles, Users, UsersRound, Wrench, X,
} from 'lucide-react'
import { SessionMenu } from '@/components/SessionMenu'

type NavItem = [label: string, href: string, icon: LucideIcon]
type NavGroup = { label: string; items: NavItem[] }

const groups: NavGroup[] = [
  { label: 'Principal', items: [
    ['Inicio', '/app', Home], ['Cursos', '/cursos', BookOpen], ['Estudiantes', '/seguimiento', Users], ['Evaluaciones', '/evaluaciones', ClipboardList],
  ]},
  { label: 'Enseñanza', items: [
    ['Centros Premium', '/centros', Sparkles], ['Biblioteca', '/biblioteca', BookOpen], ['Plan Lector', '/plan-lector', BookOpenCheck],
    ['Crear con YOYO IA', '/crear', Sparkles], ['Profesor Virtual', '/profesor-virtual', Bot], ['Herramientas', '/herramientas', Wrench],
    ['Caligrafía', '/caligrafia', PenTool], ['Apoyos PIE y DUA', '/inclusion', Accessibility], ['Simuladores', '/simuladores', FlaskConical], ['Juegos', '/juegos', Gamepad2],
  ]},
  { label: 'Gestión', items: [
    ['Progreso por OA', '/progreso', BarChart3], ['Evidencias', '/seguimiento/evidencias', ClipboardList], ['Familias', '/familias', UsersRound],
    ['Informes', '/informes', FileText], ['Multimedia', '/multimedia', Images], ['Integraciones', '/integraciones', Cloud], ['Calendario', '/herramientas', CalendarDays],
  ]},
  { label: 'Sistema', items: [
    ['Estado del sistema', '/estado', ShieldCheck], ['QA y publicación', '/qa', ShieldCheck], ['Evolución YOYO', '/evolucion', Radar], ['Configuración', '/configuracion', Settings],
  ]},
]

const allItems: NavItem[] = groups.flatMap((group) => group.items)
const mobile: NavItem[] = [
  ['Inicio', '/app', Home], ['Cursos', '/cursos', BookOpen], ['Crear', '/crear', Sparkles], ['Centros', '/centros', Images], ['Perfil', '/configuracion', UsersRound],
]
const notifications = [
  { title: 'Centros Premium activos', detail: 'Matemática, Ciencias, Caligrafía, Grafomotricidad, Pictogramas y Plan Lector están integrados.', time: 'Ahora' },
  { title: 'Cursos conectados', detail: 'Los cursos se filtran por institución y rol mediante Supabase.', time: 'Hoy' },
  { title: 'Recursos accesibles', detail: 'Los materiales incorporan apoyos PIE, DUA y opciones de adaptación.', time: 'Hoy' },
]

export function AppShell({ children, active }: { children: React.ReactNode; active: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [sidebarProfileOpen, setSidebarProfileOpen] = useState(false)
  const [topProfileOpen, setTopProfileOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [readCount, setReadCount] = useState(0)
  const searchInput = useRef<HTMLInputElement>(null)
  const results = useMemo(() => allItems.filter(([label]) => label.toLowerCase().includes(query.toLowerCase())).slice(0, 8), [query])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true) }
      if (event.key === 'Escape') { setSearchOpen(false); setNotificationsOpen(false); setSidebarProfileOpen(false); setTopProfileOpen(false); setOpen(false) }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  useEffect(() => { if (searchOpen) window.setTimeout(() => searchInput.current?.focus(), 50) }, [searchOpen])
  const navigate = (href: string) => { setSearchOpen(false); setQuery(''); router.push(href) }

  return <div className={`approved-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <a className="skip-link" href="#contenido-principal">Ir al contenido</a>
    {open && <button className="mobile-backdrop" aria-label="Cerrar menú" onClick={() => setOpen(false)} />}
    <aside className={`approved-sidebar ${open ? 'sidebar-open' : ''}`}>
      <div className="approved-brand-row">
        <Link className="approved-brand" href="/app" onClick={() => setOpen(false)}><span className="approved-logo">YO</span><span className="approved-brand-copy"><strong>YoYo Letras AI</strong><small>Plataforma educativa inteligente</small></span></Link>
        <button className="sidebar-collapse" aria-label="Contraer menú" onClick={() => setCollapsed((value) => !value)}><ChevronDown size={17} /></button>
        <button className="sidebar-close" aria-label="Cerrar menú" onClick={() => setOpen(false)}><X size={19} /></button>
      </div>
      <nav className="approved-nav" aria-label="Navegación principal">{groups.map((group) => <section key={group.label}><span className="approved-nav-label">{group.label}</span>{group.items.map(([label, href, Icon]) => <Link key={`${label}-${href}`} href={href} onClick={() => setOpen(false)} className={label === active ? 'active' : ''} title={label}><Icon size={18} /><span>{label}</span>{label === active && <ChevronRight className="active-arrow" size={15} />}</Link>)}</section>)}</nav>
      <div className="approved-sidebar-foot"><div className="institution-mini"><ShieldCheck size={17} /><span><small>Institución activa</small><strong>Contexto protegido</strong></span></div><SessionMenu open={sidebarProfileOpen} onToggle={() => { setSidebarProfileOpen((value) => !value); setTopProfileOpen(false); setNotificationsOpen(false) }} onClose={() => setSidebarProfileOpen(false)} /></div>
    </aside>
    <main className="approved-main" id="contenido-principal">
      <header className="approved-topbar">
        <button className="mobile-menu-button" aria-label="Abrir menú" onClick={() => setOpen(true)}><Menu size={21} /></button>
        <button className="desktop-menu-button" aria-label="Contraer menú" onClick={() => setCollapsed((value) => !value)}><Menu size={21} /></button>
        <button className="approved-search" type="button" onClick={() => setSearchOpen(true)} aria-label="Abrir buscador"><Search size={18} /><span>Buscar en la plataforma...</span><kbd>⌘ K</kbd></button>
        <div className="approved-top-actions">
          <Link href="/crear" className="approved-create-button"><Sparkles size={16} /> Crear</Link>
          <button aria-label="Mensajes" onClick={() => router.push('/familias')}><Mail size={18} /></button>
          <div className="top-action-wrap">
            <button aria-label="Notificaciones" aria-expanded={notificationsOpen} onClick={() => { setNotificationsOpen((value) => !value); setSidebarProfileOpen(false); setTopProfileOpen(false) }}><Bell size={18} />{readCount < notifications.length && <i>{notifications.length - readCount}</i>}</button>
            {notificationsOpen && <div className="top-popover notification-popover"><div className="popover-head"><div><strong>Notificaciones</strong><span>{notifications.length-readCount} pendientes</span></div><button onClick={() => setReadCount(notifications.length)}><Check size={15}/> Marcar leídas</button></div><div className="notification-list">{notifications.map((item,index)=><article className={index < readCount ? 'read' : ''} key={item.title}><span></span><div><b>{item.title}</b><p>{item.detail}</p><small>{item.time}</small></div></article>)}</div></div>}
          </div>
          <SessionMenu open={topProfileOpen} onToggle={() => { setTopProfileOpen((value) => !value); setSidebarProfileOpen(false); setNotificationsOpen(false) }} onClose={() => setTopProfileOpen(false)} />
        </div>
      </header>
      <div className="approved-content">{children}</div>
    </main>
    <nav className="approved-mobile-nav" aria-label="Navegación móvil">{mobile.map(([label,href,Icon])=><Link key={label} href={href} className={label===active?'active':''}><Icon size={20}/><span>{label}</span></Link>)}</nav>
    {searchOpen && <div className="command-backdrop" role="presentation" onMouseDown={(event)=>{if(event.target===event.currentTarget)setSearchOpen(false)}}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Buscador global"><div className="command-input"><Search size={20}/><input ref={searchInput} value={query} onChange={(event)=>setQuery(event.target.value)} placeholder="Buscar en toda la plataforma..."/><button onClick={()=>setSearchOpen(false)}><X size={18}/></button></div><div className="command-meta"><span><Command size={14}/> Navegación rápida</span><small>Esc para cerrar</small></div><div className="command-results">{results.length?results.map(([label,href,Icon],index)=><button key={`${label}-${href}`} onClick={()=>navigate(href)}><Icon size={18}/><span><b>{label}</b><small>{href}</small></span><kbd>{index+1}</kbd></button>):<div className="command-empty"><Search/><strong>Sin resultados</strong><span>Prueba con centros, biblioteca, evaluación o informes.</span></div>}</div></section></div>}
  </div>
}
