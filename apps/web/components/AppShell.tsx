'use client'

import Link from 'next/link'
import {useEffect,useMemo,useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {BookOpen,Home,Sparkles,Users,Gamepad2,Accessibility,BarChart3,Settings,Search,PenTool,Images,ShieldCheck,ClipboardList,FlaskConical,FileText,UsersRound,Menu,Wrench,Bell,Mail,Bot,Cloud,X,ChevronRight,Command,Check} from 'lucide-react'
import {SessionMenu} from '@/components/SessionMenu'

const items=[
 ['Inicio','/app',Home],['Biblioteca','/biblioteca',BookOpen],['Crear con IA','/crear',Sparkles],['Profesor Virtual','/profesor-virtual',Bot],['Cursos y grupos','/cursos',Users],['Juegos inmersivos','/juegos',Gamepad2],['Caligrafía y trazos','/caligrafia',PenTool],['Pictogramas y apoyos','/inclusion',Accessibility],['Evaluaciones','/evaluaciones',ClipboardList],['Simuladores y ciencias','/simuladores',FlaskConical],['Herramientas docentes','/herramientas',Wrench],['Seguimiento','/seguimiento',BarChart3],['Familias','/familias',UsersRound],['Informes','/informes',FileText],['Integraciones','/integraciones',Cloud],['Centro multimedia','/multimedia',Images],['QA y publicación','/qa',ShieldCheck],['Configuración','/configuracion',Settings]
] as const

const mobile=[
 ['Inicio','/app',Home],
 ['Biblioteca','/biblioteca',BookOpen],
 ['Crear','/crear',Sparkles],
 ['Grupos','/cursos',Users],
 ['Perfil','/configuracion',UsersRound]
] as const

const notifications=[
 {title:'Actividad lista para revisar',detail:'Revisa el avance y las evidencias registradas en tus cursos.',time:'Hoy'},
 {title:'Planificación pendiente',detail:'Completa los objetivos y apoyos del siguiente periodo.',time:'Esta semana'},
 {title:'Seguimiento institucional',detail:'Consulta los indicadores de participación y progreso.',time:'Reciente'}
]

export function AppShell({children,active}:{children:React.ReactNode;active:string}){
 const router=useRouter()
 const[open,setOpen]=useState(false)
 const[searchOpen,setSearchOpen]=useState(false)
 const[notificationsOpen,setNotificationsOpen]=useState(false)
 const[profileOpen,setProfileOpen]=useState(false)
 const[query,setQuery]=useState('')
 const[readCount,setReadCount]=useState(0)
 const searchInput=useRef<HTMLInputElement>(null)
 const results=useMemo(()=>items.filter(([label])=>label.toLowerCase().includes(query.toLowerCase())).slice(0,7),[query])

 useEffect(()=>{
  const onKey=(event:KeyboardEvent)=>{
   if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
    event.preventDefault();setSearchOpen(true)
   }
   if(event.key==='Escape'){
    setSearchOpen(false);setNotificationsOpen(false);setProfileOpen(false);setOpen(false)
   }
  }
  window.addEventListener('keydown',onKey)
  return()=>window.removeEventListener('keydown',onKey)
 },[])

 useEffect(()=>{if(searchOpen)window.setTimeout(()=>searchInput.current?.focus(),50)},[searchOpen])

 const navigate=(href:string)=>{
  setSearchOpen(false);setQuery('');router.push(href)
 }

 return <div className="app-shell premium-shell complete-shell">
  <a className="skip-link" href="#contenido-principal">Ir al contenido</a>
  {open&&<button className="mobile-backdrop" aria-label="Cerrar menú" onClick={()=>setOpen(false)}/>} 
  <aside className={`sidebar premium-sidebar ${open?'sidebar-open':''}`}>
   <div className="sidebar-brand-row"><Link className="brand brand-premium" href="/app" onClick={()=>setOpen(false)}><span className="logo logo-premium">Y</span><span><strong>YOYOLETRASAI</strong><small>Aprender jugando, crear sin límites</small></span></Link><button className="sidebar-close" aria-label="Cerrar menú" onClick={()=>setOpen(false)}><X size={19}/></button></div>
   <div className="sidebar-section-label">Plataforma educativa</div>
   <nav className="menu premium-menu" aria-label="Navegación principal">{items.map(([label,href,Icon])=><Link key={label} href={href} onClick={()=>setOpen(false)} className={label===active?'active':''}><Icon size={17}/><span>{label}</span>{label==='Juegos inmersivos'&&<em>LIVE</em>}{label===active&&<ChevronRight className="active-arrow" size={15}/>}</Link>)}</nav>
   <div className="sidebar-foot premium-plan"><div><ShieldCheck size={18}/><strong>Plataforma educativa integral</strong></div><span>Gestión pedagógica, inclusión, recursos y seguimiento institucional.</span><div className="plan-progress"><i style={{width:'92%'}}/></div><small>Configuración técnica en etapa final</small><Link href="/qa">Ver estado del sistema</Link></div>
  </aside>
  <main className="app-main premium-main" id="contenido-principal">
   <div className="app-top premium-topbar">
    <button className="mobile-menu-button" aria-label="Abrir menú" onClick={()=>setOpen(true)}><Menu size={21}/></button>
    <Link href="/app" className="mobile-brand" aria-label="Ir al inicio"><span className="mobile-brand-logo">Y</span><span><strong>YOYOLETRASAI</strong><small>Panel institucional</small></span></Link>
    <button className="search premium-search" type="button" onClick={()=>setSearchOpen(true)} aria-label="Abrir buscador"><Search size={18}/><span>Buscar actividades, temas, OA, habilidades...</span><kbd>⌘ K</kbd></button>
    <div className="top-actions">
     <Link href="/profesor-virtual" className="ai-pill"><Sparkles size={16}/> Profesor Virtual</Link>
     <div className="top-action-wrap"><button aria-label="Notificaciones" aria-expanded={notificationsOpen} onClick={()=>{setNotificationsOpen(value=>!value);setProfileOpen(false)}}><Bell size={18}/>{readCount<notifications.length&&<i>{notifications.length-readCount}</i>}</button>{notificationsOpen&&<div className="top-popover notification-popover"><div className="popover-head"><div><strong>Notificaciones</strong><span>{notifications.length-readCount} pendientes</span></div><button onClick={()=>setReadCount(notifications.length)}><Check size={15}/> Marcar leídas</button></div><div className="notification-list">{notifications.map((item,index)=><article className={index<readCount?'read':''} key={item.title}><span></span><div><b>{item.title}</b><p>{item.detail}</p><small>{item.time}</small></div></article>)}</div><Link href="/seguimiento" onClick={()=>setNotificationsOpen(false)} className="popover-footer">Ver seguimiento completo <ChevronRight size={15}/></Link></div>}</div>
     <button aria-label="Mensajes" onClick={()=>router.push('/familias')}><Mail size={18}/></button>
     <SessionMenu open={profileOpen} onToggle={()=>{setProfileOpen(value=>!value);setNotificationsOpen(false)}} onClose={()=>setProfileOpen(false)}/>
    </div>
   </div>
   {children}
  </main>
  <nav className="mobile-nav premium-mobile-nav" aria-label="Navegación móvil">{mobile.map(([label,href,Icon])=><Link key={label} href={href} className={label===active?'active':''}><Icon size={21}/><span>{label}</span></Link>)}</nav>
  {searchOpen&&<div className="command-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)setSearchOpen(false)}}><section className="command-palette" role="dialog" aria-modal="true" aria-label="Buscador global"><div className="command-input"><Search size={20}/><input ref={searchInput} value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar en toda la plataforma..."/><button onClick={()=>setSearchOpen(false)}><X size={18}/></button></div><div className="command-meta"><span><Command size={14}/> Navegación rápida</span><small>Presiona Esc para cerrar</small></div><div className="command-results">{results.length?results.map(([label,href,Icon],index)=><button key={href} onClick={()=>navigate(href)}><Icon size={18}/><span><b>{label}</b><small>{href}</small></span><kbd>{index+1}</kbd></button>):<div className="command-empty"><Search/><strong>Sin resultados</strong><span>Prueba con biblioteca, evaluación, curso o juego.</span></div>}</div><div className="command-shortcuts"><button onClick={()=>navigate('/crear')}><Sparkles/> Crear recurso</button><button onClick={()=>navigate('/biblioteca')}><BookOpen/> Abrir biblioteca</button><button onClick={()=>navigate('/profesor-virtual')}><Bot/> Profesor Virtual</button></div></section></div>}
 </div>
}
