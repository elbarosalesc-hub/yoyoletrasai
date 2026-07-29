import {
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Gamepad2,
  Home,
  Library,
  Medal,
  MessageSquare,
  MoreHorizontal,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react'
import {ForestScene} from '@/components/v2/ForestScene'
import {getDashboardSnapshot} from '@/lib/dashboard-data'

const navigation=[
 {label:'Inicio',icon:Home,href:'/app',active:true},
 {label:'Biblioteca',icon:Library,href:'/biblioteca'},
 {label:'Crear',icon:Sparkles,href:'/crear'},
 {label:'YOYO',icon:Bot,href:'/yoyo'},
 {label:'Juegos',icon:Gamepad2,href:'/juegos'},
 {label:'Estudiantes',icon:Users,href:'/estudiantes'},
 {label:'Informes',icon:FileText,href:'/informes'},
 {label:'Configuración',icon:Settings,href:'/configuracion'}
]

const quickActions=[
 {label:'Crear recurso',description:'Guías, evaluaciones y rúbricas',icon:Sparkles,tone:'violet',href:'/crear'},
 {label:'Explorar biblioteca',description:'Recursos curriculares listos',icon:BookOpen,tone:'mint',href:'/biblioteca'},
 {label:'Conversar con YOYO',description:'Planifica y adapta con IA',icon:Bot,tone:'blue',href:'/yoyo'},
 {label:'Revisar informes',description:'Avances y evidencias del curso',icon:BarChart3,tone:'amber',href:'/informes'}
]

const upcoming=[
 {time:'09:15',title:'Lectura guiada',detail:'3.º básico · Sala 5',tone:'violet'},
 {time:'10:30',title:'Comprensión lectora',detail:'Grupo de apoyo PIE',tone:'mint',active:true},
 {time:'12:00',title:'Revisión de avances',detail:'Equipo multidisciplinario',tone:'amber'}
]

const groups=[
 {name:'Lectura inicial',students:8,progress:78,tone:'violet'},
 {name:'Comprensión guiada',students:11,progress:64,tone:'mint'},
 {name:'Autonomía lectora',students:9,progress:86,tone:'blue'}
]

const recentActivities=[
 {title:'Comprensión lectora: cuentos',meta:'3.º básico · Lenguaje',progress:72,emoji:'📚'},
 {title:'Secuencia de eventos',meta:'3.º básico · Lectura',progress:48,emoji:'🧩'},
 {title:'Desafío de multiplicación',meta:'5.º básico · Matemática',progress:26,emoji:'✖️'}
]

const priorities=[
 {title:'Inferencias sencillas',detail:'11 estudiantes · propuesta lista',status:'Prioridad alta',tone:'violet',icon:Target,href:'/yoyo'},
 {title:'Seguimiento de asistencia',detail:'2 estudiantes bajo 80%',status:'Revisar hoy',tone:'amber',icon:Clock3,href:'/estudiantes'},
 {title:'Evidencias pendientes',detail:'4 registros por completar',status:'Esta semana',tone:'blue',icon:FileText,href:'/informes'}
]

type Metric={value:string;detail:string;label:string;trend:string;tone:string;icon:typeof Users}

function MetricCard({metric}:{metric:Metric}){
 const Icon=metric.icon
 return <article className={`metric-card-v4 tone-${metric.tone}`}>
  <span className="metric-icon-v4"><Icon size={21}/></span>
  <div className="metric-copy-v4"><strong>{metric.value}</strong><span>{metric.label}</span><small>{metric.detail}</small></div>
  <em><TrendingUp size={12}/>{metric.trend}</em>
 </article>
}

export default async function TeacherDashboard(){
 const snapshot=await getDashboardSnapshot()
 const hours=Math.floor(snapshot.learningMinutes/60)
 const minutes=snapshot.learningMinutes%60
 const metrics:Metric[]=[
  {value:String(snapshot.activeStudents),detail:`de ${snapshot.totalStudents} estudiantes`,label:'Estudiantes activos',trend:'+4',tone:'violet',icon:Users},
  {value:String(snapshot.completedActivities),detail:'completadas este mes',label:'Actividades',trend:`+${snapshot.weeklyGrowth}%`,tone:'mint',icon:Target},
  {value:`${hours}h ${minutes}m`,detail:'acumulado semanal',label:'Tiempo de aprendizaje',trend:'+32m',tone:'blue',icon:Clock3},
  {value:String(snapshot.achievements),detail:'reconocimientos obtenidos',label:'Logros del curso',trend:'+3',tone:'amber',icon:Medal}
 ]

 return <main className="product-shell dashboard-v4-shell dashboard-v5-shell">
  <aside className="app-sidebar" aria-label="Navegación principal">
   <div className="brand"><span className="brand-mark">Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></div>
   <div className="workspace-switch"><span className="workspace-logo">C</span><span><small>Institución</small><strong>Colegio Coyam</strong></span><ChevronRight size={17}/></div>
   <nav className="side-nav">{navigation.map(({label,icon:Icon,href,active})=><a className={active?'nav-link active':'nav-link'} href={href} key={label}><Icon size={20}/><span>{label}</span>{active&&<i/>}</a>)}</nav>
   <div className="sidebar-help"><span><MessageSquare size={20}/></span><div><strong>¿Necesitas ayuda?</strong><small>Habla con el equipo YOYO</small></div><ArrowUpRight size={17}/></div>
   <button className="profile-card"><span className="profile-avatar">ER</span><span><strong>Elba Rosales</strong><small>Docente · PIE</small></span><MoreHorizontal size={18}/></button>
  </aside>

  <section className="workspace">
   <header className="topbar topbar-v4 topbar-v5">
    <div className="mobile-brand"><span className="brand-mark">Y</span><strong>YOYOLETRASAI</strong></div>
    <label className="global-search"><Search size={19}/><input aria-label="Buscar" placeholder="Buscar recursos, estudiantes o actividades..."/><kbd>⌘ K</kbd></label>
    <div className="topbar-actions">
     <span className={`data-source-v4 data-source-v5 ${snapshot.source}`}><i/>{snapshot.source==='supabase'?'Datos sincronizados':'Datos de ejemplo'}</span>
     <button className="icon-button" aria-label="Notificaciones"><Bell size={20}/><span>3</span></button>
     <a className="primary-button" href="/crear"><Plus size={20}/><span>Crear actividad</span></a>
    </div>
   </header>

   <div className="dashboard-v4-content dashboard-v5-content" id="dashboard-top">
    <section className="dashboard-title-v4 dashboard-title-v5">
     <div><span>Miércoles, 29 de julio</span><h1>Buenos días, {snapshot.teacherName} 👋</h1><p>Revisa avances, prioridades y actividades desde un solo lugar.</p></div>
     <div className="title-actions-v4"><a href="/crear"><Sparkles/>Crear experiencia</a><a href="/yoyo"><Bot/>Pedir ayuda a YOYO</a></div>
    </section>

    <section className="overview-bento-v4 overview-bento-v5">
     <article className="class-summary-v4 class-summary-v5">
      <div className="summary-copy-v4">
       <span className="summary-kicker-v4"><CheckCircle2/> CURSO EN BUEN RITMO</span>
       <h2>Tu grupo mantiene un <strong>{snapshot.participation}%</strong> de participación</h2>
       <p>La asistencia y el compromiso se mantienen estables. El siguiente foco recomendado es fortalecer inferencias sencillas.</p>
       <div className="summary-actions-v4"><a href="/estudiantes">Ver estudiantes<ChevronRight/></a><a href="/informes">Abrir informe<BarChart3/></a></div>
      </div>
      <div className="summary-visual-v4" aria-label={`${snapshot.participation}% de participación`}>
       <div className="progress-ring-v4" style={{'--value':`${snapshot.participation*3.6}deg`} as React.CSSProperties}><span><strong>{snapshot.participation}%</strong><small>participación</small></span></div>
       <div className="summary-mini-v4"><span><Zap/></span><div><strong>+{snapshot.weeklyGrowth}%</strong><small>avance semanal</small></div></div>
       <div className="summary-mini-v4"><span><Users/></span><div><strong>{snapshot.activeGroups}</strong><small>grupos activos</small></div></div>
      </div>
     </article>

     <article className="today-card-v4 today-card-v5">
      <header><div><span>AGENDA DE HOY</span><h2>Próximas actividades</h2></div><a href="/calendario"><CalendarDays/></a></header>
      <div className="today-list-v4">{upcoming.map(item=><div className={item.active?'active':''} key={item.time}><time>{item.time}</time><i className={item.tone}/><span><strong>{item.title}</strong><small>{item.detail}</small></span>{item.active&&<em>Ahora</em>}</div>)}</div>
     </article>

     <article className="yoyo-focus-v4 yoyo-focus-v5">
      <div className="yoyo-focus-icon-v4"><Bot/></div>
      <div><span>RECOMENDACIÓN DE YOYO</span><h2>Trabajar inferencias sencillas</h2><p>Actividad breve con pistas visuales, preguntas graduadas y apoyo DUA.</p><div className="focus-tags-v4"><i>15 min</i><i>Lenguaje</i><i>Lista para usar</i></div><a href="/yoyo">Revisar propuesta<ArrowUpRight/></a></div>
     </article>
    </section>

    <section className="metrics-grid-v4 metrics-grid-v5" aria-label="Resumen pedagógico">{metrics.map(metric=><MetricCard metric={metric} key={metric.label}/>)}</section>

    <section className="quick-launch-v4 quick-launch-v5">
     {quickActions.map(({label,description,icon:Icon,tone,href})=><a href={href} key={label} className={`quick-launch-item-v4 tone-${tone}`}><span><Icon/></span><div><strong>{label}</strong><small>{description}</small></div><ChevronRight/></a>)}
    </section>

    <section className="secondary-workspace-v5">
     <article className="panel-card learning-overview-v5">
      <header className="section-heading-v5"><div><span>SEGUIMIENTO PEDAGÓGICO</span><h2>Progreso y recursos activos</h2><p>Información prioritaria de tus grupos y actividades.</p></div><a href="/informes">Abrir analítica<ArrowUpRight/></a></header>
      <div className="learning-split-v5">
       <section className="groups-panel-v5">
        <div className="subheading-v5"><span>Progreso por grupo</span><a href="/estudiantes">Ver estudiantes<ChevronRight/></a></div>
        <div className="group-list-v4 group-list-v5">{groups.map(group=><div key={group.name}><span className={`group-dot-v4 ${group.tone}`}/><div className="group-info-v4"><strong>{group.name}</strong><small>{group.students} estudiantes</small></div><div className="group-bar-v4"><span><i className={group.tone} style={{width:`${group.progress}%`}}/></span><em>{group.progress}%</em></div></div>)}</div>
       </section>

       <section className="resources-panel-v5">
        <div className="subheading-v5"><span>Recursos en curso</span><a href="/biblioteca">Ver biblioteca<ChevronRight/></a></div>
        <div className="recent-list-v4 recent-list-v5">{recentActivities.map(activity=><div key={activity.title}><span>{activity.emoji}</span><div><strong>{activity.title}</strong><small>{activity.meta}</small></div><div className="recent-progress-v4"><span><i style={{width:`${activity.progress}%`}}/></span><em>{activity.progress}%</em></div></div>)}</div>
       </section>
      </div>
     </article>

     <aside className="secondary-rail-v5">
      <article className="priorities-card-v5">
       <header><div><span>PRIORIDADES</span><h2>Necesita tu atención</h2></div><em>3 pendientes</em></header>
       <div className="priority-list-v5">{priorities.map(({title,detail,status,tone,icon:Icon,href})=><a href={href} key={title}><span className={`priority-icon-v5 ${tone}`}><Icon/></span><div><strong>{title}</strong><small>{detail}</small></div><em>{status}</em><ChevronRight/></a>)}</div>
      </article>

      <article className="game-card-v5">
       <ForestScene/>
       <div className="game-overlay-v5"/>
       <div className="game-copy-v5"><span>JUEGO DESTACADO</span><h2>Bosque Mágico</h2><p>Comprensión lectora con pistas visuales y cinco niveles.</p><div><button><Play fill="currentColor"/>Iniciar</button><a href="/juegos">Detalles<ChevronRight/></a></div></div>
       <div className="game-status-v5"><span><strong>60%</strong><small>progreso</small></span><span><strong>2 / 4</strong><small>pistas</small></span></div>
      </article>
     </aside>
    </section>
   </div>
  </section>

  <nav className="mobile-bottom-nav" aria-label="Navegación móvil">{navigation.slice(0,5).map(({label,icon:Icon,href,active})=><a href={href} key={label} className={active?'active':''}><Icon/><span>{label}</span></a>)}</nav>
 </main>
}
