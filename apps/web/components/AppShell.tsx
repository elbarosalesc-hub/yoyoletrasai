'use client'

import Link from 'next/link'
import {useState} from 'react'
import {BookOpen,Home,Sparkles,Users,Gamepad2,Accessibility,BarChart3,Settings,Search,PenTool,Images,ShieldCheck,ClipboardList,FlaskConical,FileText,UsersRound,Menu,Wrench,Bell,Mail,Bot,Cloud,X,ChevronRight} from 'lucide-react'

const items=[
 ['Inicio','/app',Home],['Biblioteca','/biblioteca',BookOpen],['Crear con IA','/crear',Sparkles],['Profesor Virtual','/profesor-virtual',Bot],['Cursos y grupos','/cursos',Users],['Juegos inmersivos','/juegos',Gamepad2],['Caligrafía y trazos','/caligrafia',PenTool],['Pictogramas y apoyos','/inclusion',Accessibility],['Evaluaciones','/evaluaciones',ClipboardList],['Simuladores y ciencias','/simuladores',FlaskConical],['Herramientas docentes','/herramientas',Wrench],['Seguimiento','/seguimiento',BarChart3],['Familias','/familias',UsersRound],['Informes','/informes',FileText],['Integraciones','/integraciones',Cloud],['Centro multimedia','/multimedia',Images],['QA y publicación','/qa',ShieldCheck],['Configuración','/configuracion',Settings]
] as const
const mobile=[items[0],items[1],items[2],items[3],items[5],items[6],items[17]] as const

export function AppShell({children,active}:{children:React.ReactNode;active:string}){
 const[open,setOpen]=useState(false)
 return <div className="app-shell premium-shell complete-shell">
  <a className="skip-link" href="#contenido-principal">Ir al contenido</a>
  {open&&<button className="mobile-backdrop" aria-label="Cerrar menú" onClick={()=>setOpen(false)}/>} 
  <aside className={`sidebar premium-sidebar ${open?'sidebar-open':''}`}>
   <div className="sidebar-brand-row"><Link className="brand brand-premium" href="/app" onClick={()=>setOpen(false)}><span className="logo logo-premium">Y</span><span><strong>YOYOLETRASAI</strong><small>Aprender jugando, crear sin límites</small></span></Link><button className="sidebar-close" aria-label="Cerrar menú" onClick={()=>setOpen(false)}><X size={19}/></button></div>
   <div className="sidebar-section-label">Plataforma educativa</div>
   <nav className="menu premium-menu" aria-label="Navegación principal">{items.map(([label,href,Icon])=><Link key={label} href={href} onClick={()=>setOpen(false)} className={label===active?'active':''}><Icon size={17}/><span>{label}</span>{label==='Juegos inmersivos'&&<em>LIVE</em>}{label===active&&<ChevronRight className="active-arrow" size={15}/>}</Link>)}</nav>
   <div className="sidebar-foot premium-plan"><div><ShieldCheck size={18}/><strong>Plan Docente Pro + PIE</strong></div><span>Profesor Virtual, juegos, adaptaciones y seguimiento incluidos.</span><div className="plan-progress"><i style={{width:'82%'}}/></div><small>82% de configuración completada</small><Link href="/qa">Ver estado del sistema</Link></div>
  </aside>
  <main className="app-main premium-main" id="contenido-principal">
   <div className="app-top premium-topbar">
    <button className="mobile-menu-button" aria-label="Abrir menú" onClick={()=>setOpen(true)}><Menu size={21}/></button>
    <Link href="/app" className="mobile-brand" aria-label="Ir al inicio"><span>Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></Link>
    <div className="search premium-search" role="search"><Search size={18}/><span>Buscar actividades, temas, OA, habilidades...</span><kbd>⌘ K</kbd></div>
    <div className="top-actions"><Link href="/profesor-virtual" className="ai-pill"><Sparkles size={16}/> Profesor Virtual</Link><button aria-label="Notificaciones"><Bell size={18}/><i>5</i></button><button aria-label="Mensajes"><Mail size={18}/><i>2</i></button><div className="user"><div><strong>Profesora</strong><br/><small>Elba Rosales</small></div><div className="avatar avatar-photo" aria-hidden="true">ER</div></div></div>
   </div>
   {children}
  </main>
  <nav className="mobile-nav premium-mobile-nav" aria-label="Navegación móvil">{mobile.map(([label,href,Icon])=><Link key={label} href={href} className={label===active?'active':''}><Icon size={20}/><span>{label==='Crear con IA'?'Crear':label==='Juegos inmersivos'?'Juegos':label==='Caligrafía y trazos'?'Trazos':label==='Profesor Virtual'?'YOYO':label}</span></Link>)}</nav>
 </div>
}
