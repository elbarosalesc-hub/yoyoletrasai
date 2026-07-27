import Link from 'next/link'
import {BookOpen,Home,Sparkles,Users,Gamepad2,Accessibility,BarChart3,Settings,Search,PenTool,Images,ShieldCheck,ClipboardList,FlaskConical,FileText,UsersRound,Menu,Wrench,Bell,Mail} from 'lucide-react'

const items=[
 ['Inicio','/app',Home],['Biblioteca','/biblioteca',BookOpen],['Crear con IA','/crear',Sparkles],['Cursos y grupos','/cursos',Users],['Juegos inmersivos','/juegos',Gamepad2],['Caligrafía y trazos','/caligrafia',PenTool],['Pictogramas y apoyos','/inclusion',Accessibility],['Evaluaciones','/evaluaciones',ClipboardList],['Simuladores y ciencias','/simuladores',FlaskConical],['Herramientas docentes','/herramientas',Wrench],['Seguimiento','/seguimiento',BarChart3],['Familias','/familias',UsersRound],['Informes','/informes',FileText],['Centro multimedia','/multimedia',Images],['QA y publicación','/qa',ShieldCheck],['Configuración','/qa',Settings]
] as const
const mobile=items.slice(0,7)

export function AppShell({children,active}:{children:React.ReactNode;active:string}){
 return <div className="app-shell premium-shell">
  <aside className="sidebar premium-sidebar">
   <Link className="brand brand-premium" href="/"><span className="logo logo-premium">Y</span><span><strong>YOYOLETRASAI</strong><small>Aprender jugando, crear sin límites</small></span></Link>
   <nav className="menu premium-menu">{items.map(([label,href,Icon])=><Link key={label} href={href} className={label===active?'active':''}><Icon size={17}/><span>{label}</span>{label==='Juegos inmersivos'&&<em>Nuevo</em>}</Link>)}</nav>
   <div className="sidebar-foot premium-plan"><strong>👑 Plan Premium</strong><span>Activa todas las herramientas</span><Link href="/qa">Ver planes</Link></div>
  </aside>
  <main className="app-main premium-main">
   <div className="app-top premium-topbar">
    <button className="mobile-menu-button" aria-label="Abrir menú"><Menu size={20}/></button>
    <div className="search premium-search"><Search size={18}/><span>Buscar actividades, temas, OA, habilidades...</span></div>
    <div className="top-actions"><Link href="/profesor-virtual" className="ai-pill"><Sparkles size={16}/> Asistente IA</Link><button aria-label="Notificaciones"><Bell size={18}/><i>5</i></button><button aria-label="Mensajes"><Mail size={18}/><i>2</i></button><div className="user"><div><strong>Profesora</strong><br/><small>Elba Rosales</small></div><div className="avatar avatar-photo">ER</div></div></div>
   </div>
   {children}
  </main>
  <nav className="mobile-nav premium-mobile-nav">{mobile.map(([label,href,Icon])=><Link key={label} href={href} className={label===active?'active':''}><Icon size={20}/><span>{label==='Crear con IA'?'Crear':label==='Juegos inmersivos'?'Juegos':label==='Caligrafía y trazos'?'Caligrafía':label}</span></Link>)}</nav>
 </div>
}