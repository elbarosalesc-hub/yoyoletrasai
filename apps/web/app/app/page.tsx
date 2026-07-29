import {
 ArrowUpRight,BarChart3,Bell,BookOpen,Bot,CalendarDays,CheckCircle2,ChevronRight,Clock3,
 FileText,Gamepad2,Home,Library,Medal,MessageSquare,MoreHorizontal,Play,Plus,Search,Settings,
 Sparkles,Target,TrendingUp,Users,Zap
} from 'lucide-react'
import {ForestScene} from '@/components/v2/ForestScene'
import {getDashboardSnapshot} from '@/lib/dashboard-data'

const navigation=[
 {label:'Inicio',icon:Home,href:'/app',active:true},{label:'Biblioteca',icon:Library,href:'/biblioteca'},
 {label:'Crear',icon:Sparkles,href:'/crear'},{label:'YOYO',icon:Bot,href:'/yoyo'},
 {label:'Juegos',icon:Gamepad2,href:'/juegos'},{label:'Estudiantes',icon:Users,href:'/estudiantes'},
 {label:'Informes',icon:FileText,href:'/informes'},{label:'Configuración',icon:Settings,href:'/configuracion'}
]

const quickActions=[
 {label:'Nueva actividad',description:'Diseña desde cero',icon:Sparkles,tone:'violet',href:'/crear'},
 {label:'Biblioteca',description:'Recursos curriculares',icon:BookOpen,tone:'mint',href:'/biblioteca'},
 {label:'YOYO asistente',description:'Planifica con IA',icon:Bot,tone:'blue',href:'/yoyo'},
 {label:'Generar informe',description:'Progreso y evidencias',icon:BarChart3,tone:'amber',href:'/informes'}
]

const activities=[
 {title:'Comprensión lectora: cuentos',meta:'3.º básico · Lenguaje',date:'Hoy, 10:30',progress:72,emoji:'📚',tone:'lavender'},
 {title:'Secuencia de eventos',meta:'3.º básico · Lectura',date:'Mañana, 09:15',progress:48,emoji:'🧩',tone:'mint'},
 {title:'Desafío de multiplicación',meta:'5.º básico · Matemática',date:'Viernes, 11:45',progress:26,emoji:'✖️',tone:'blue'}
]

type Metric={value:string;detail:string;label:string;trend:string;tone:string;icon:typeof Users}
function MetricCard({metric}:{metric:Metric}){const Icon=metric.icon;return <article className={`metric-card tone-${metric.tone}`}><div className="metric-row"><span className="metric-icon"><Icon size={23}/></span><span className="metric-trend"><TrendingUp size={12}/>{metric.trend}</span></div><div className="metric-value"><strong>{metric.value}</strong><span>{metric.detail}</span></div><span className="metric-label">{metric.label}</span></article>}

export default async function TeacherDashboard(){
 const snapshot=await getDashboardSnapshot()
 const hours=Math.floor(snapshot.learningMinutes/60)
 const minutes=snapshot.learningMinutes%60
 const metrics:Metric[]=[
  {value:String(snapshot.activeStudents),detail:`de ${snapshot.totalStudents} activos`,label:'Estudiantes',trend:'+4 esta semana',tone:'violet',icon:Users},
  {value:String(snapshot.completedActivities),detail:'actividades realizadas',label:'Este mes',trend:`+${snapshot.weeklyGrowth}% de avance`,tone:'mint',icon:Target},
  {value:`${hours}h ${minutes}m`,detail:'tiempo de aprendizaje',label:'Esta semana',trend:'+32 min',tone:'blue',icon:Clock3},
  {value:String(snapshot.achievements),detail:'logros obtenidos',label:'¡Sigue así!',trend:'3 nuevos',tone:'amber',icon:Medal}
 ]
 return <main className="product-shell dashboard-v3-shell">
  <aside className="app-sidebar" aria-label="Navegación principal">
   <div className="brand"><span className="brand-mark">Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></div>
   <div className="workspace-switch"><span className="workspace-logo">C</span><span><small>Institución</small><strong>Colegio Coyam</strong></span><ChevronRight size={17}/></div>
   <nav className="side-nav">{navigation.map(({label,icon:Icon,href,active})=><a className={active?'nav-link active':'nav-link'} href={href} key={label}><Icon size={20}/><span>{label}</span>{active&&<i/>}</a>)}</nav>
   <div className="sidebar-help"><span><MessageSquare size={20}/></span><div><strong>¿Necesitas ayuda?</strong><small>Habla con el equipo YOYO</small></div><ArrowUpRight size={17}/></div>
   <button className="profile-card"><span className="profile-avatar">ER</span><span><strong>Elba Rosales</strong><small>Docente · PIE</small></span><MoreHorizontal size={18}/></button>
  </aside>

  <section className="workspace">
   <header className="topbar"><div className="mobile-brand"><span className="brand-mark">Y</span><strong>YOYOLETRASAI</strong></div><label className="global-search"><Search size={19}/><input aria-label="Buscar" placeholder="Buscar recursos, estudiantes o actividades..."/><kbd>⌘ K</kbd></label><div className="topbar-actions"><span className={`data-source ${snapshot.source}`}><i/>{snapshot.source==='supabase'?'Supabase conectado':'Modo demostración'}</span><button className="icon-button" aria-label="Notificaciones"><Bell size={20}/><span>3</span></button><a className="primary-button" href="/crear"><Plus size={20}/><span>Crear actividad</span></a></div></header>

   <div className="dashboard-content dashboard-v3-content">
    <section className="welcome-banner welcome-v3">
     <div className="welcome-copy"><span className="eyebrow"><Sparkles size={15}/> Panel docente inteligente</span><h1>¡Bienvenida, {snapshot.teacherName}! <span>👋</span></h1><p>Hoy tienes 3 actividades programadas. YOYO detectó una oportunidad de refuerzo para tu grupo de lectura.</p><div className="welcome-actions"><a className="welcome-primary" href="/crear"><Sparkles size={18}/>Crear experiencia</a><a className="welcome-secondary" href="/yoyo"><Bot size={18}/>Revisar recomendación</a></div></div>
     <div className="welcome-insights"><article><span><CheckCircle2/></span><div><strong>{snapshot.participation}%</strong><small>participación semanal</small></div></article><article><span><Zap/></span><div><strong>+{snapshot.weeklyGrowth}%</strong><small>progreso del curso</small></div></article><article><span><Users/></span><div><strong>{snapshot.activeGroups}</strong><small>grupos activos</small></div></article></div>
    </section>

    <section className="metrics-grid" aria-label="Resumen pedagógico">{metrics.map(metric=><MetricCard metric={metric} key={metric.label}/>)}</section>

    <section className="main-grid main-grid-v3">
     <article className="featured-game compact-game"><ForestScene/><div className="featured-shade"/><div className="featured-copy"><div className="featured-kicker"><span>JUEGO DESTACADO</span><em>Nuevo</em></div><h2>La aventura del Bosque Mágico</h2><p>Comprensión lectora con pistas visuales, audio y niveles progresivos.</p><div className="chips"><span>Lenguaje</span><span>3.º básico</span><span>5 niveles</span></div><div className="featured-actions"><button className="play-button"><Play size={18} fill="currentColor"/>Iniciar juego</button><a className="preview-button" href="/juegos">Ver detalles</a></div></div><div className="compact-progress"><span><strong>60%</strong> progreso</span><span><strong>2/4</strong> pistas</span></div></article>

     <aside className="right-rail right-rail-v3">
      <article className="panel-card agenda-card"><div className="section-heading"><div><span className="section-kicker">AGENDA</span><h2>Tu día de hoy</h2></div><button aria-label="Más opciones"><MoreHorizontal/></button></div><div className="agenda-list"><div className="agenda-item"><time>09:15</time><span className="agenda-dot violet"/><div><strong>Lectura guiada</strong><small>3.º básico · Sala 5</small></div></div><div className="agenda-item active"><time>10:30</time><span className="agenda-dot mint"/><div><strong>Comprensión lectora</strong><small>Grupo de apoyo PIE</small></div><em>Ahora</em></div><div className="agenda-item"><time>12:00</time><span className="agenda-dot amber"/><div><strong>Revisión de avances</strong><small>Equipo multidisciplinario</small></div></div></div><a className="panel-link" href="/calendario"><CalendarDays size={16}/>Ver calendario completo<ChevronRight size={16}/></a></article>
      <article className="ai-card ai-card-v3"><div className="ai-head"><span><Bot size={21}/></span><div><small>RECOMENDACIÓN DE YOYO</small><strong>Inferencias sencillas</strong></div></div><p>El grupo está listo para avanzar con pistas visuales y preguntas graduadas.</p><div className="ai-tags"><span>DUA</span><span>15 min</span><span>Lista para usar</span></div><a href="/yoyo">Revisar propuesta<ArrowUpRight size={17}/></a></article>
     </aside>
    </section>

    <section className="lower-grid lower-grid-v3">
     <article className="panel-card activities-panel"><div className="section-heading"><div><span className="section-kicker">PLANIFICACIÓN</span><h2>Próximas actividades</h2></div><a href="/biblioteca">Ver todas<ChevronRight size={16}/></a></div><div className="activity-list">{activities.map(activity=><article className="activity-card" key={activity.title}><span className={`activity-art ${activity.tone}`}>{activity.emoji}</span><div className="activity-copy"><strong>{activity.title}</strong><small>{activity.meta}</small><div className="activity-progress"><span><i style={{width:`${activity.progress}%`}}/></span><em>{activity.progress}%</em></div></div><div className="activity-date"><CalendarDays size={15}/><span>{activity.date}</span><button aria-label="Abrir actividad"><ChevronRight size={17}/></button></div></article>)}</div></article>
     <article className="panel-card quick-panel"><div className="section-heading"><div><span className="section-kicker">HERRAMIENTAS</span><h2>Acciones rápidas</h2></div></div><div className="quick-grid">{quickActions.map(({label,description,icon:Icon,tone,href})=><a className="quick-action" key={label} href={href}><span className={`quick-icon tone-${tone}`}><Icon/></span><span><strong>{label}</strong><small>{description}</small></span><ChevronRight size={17}/></a>)}</div></article>
    </section>
   </div>
  </section>
  <nav className="mobile-bottom-nav" aria-label="Navegación móvil">{navigation.slice(0,5).map(({label,icon:Icon,href,active})=><a href={href} key={label} className={active?'active':''}><Icon/><span>{label}</span></a>)}</nav>
 </main>
}
