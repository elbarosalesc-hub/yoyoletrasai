import {
  Accessibility,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Images,
  Medal,
  MoreHorizontal,
  Presentation,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Volume2,
  Zap
} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'
import {DashboardImmersiveHero} from '@/components/v2/DashboardImmersiveHero'
import {getDashboardSnapshot} from '@/lib/dashboard-data'

const activities=[
  {title:'Comprensión lectora: cuentos',meta:'3.º básico · Lenguaje',date:'Hoy, 10:30',progress:72,emoji:'📚'},
  {title:'Secuencia de eventos',meta:'3.º básico · Lectura',date:'Mañana, 09:15',progress:48,emoji:'🧩'},
  {title:'Desafío de multiplicación',meta:'5.º básico · Matemática',date:'Viernes, 11:45',progress:26,emoji:'✖️'}
]

const quickActions=[
  {label:'Nueva actividad',description:'Diseña desde cero',icon:Sparkles,tone:'violet',href:'/crear'},
  {label:'Biblioteca',description:'Recursos curriculares',icon:BookOpen,tone:'mint',href:'/biblioteca'},
  {label:'YOYO asistente',description:'Planifica con IA',icon:Bot,tone:'blue',href:'/yoyo'},
  {label:'Generar informe',description:'Progreso y evidencias',icon:BarChart3,tone:'amber',href:'/informes'}
]

const immersiveTools=[
  {label:'Juegos y mundos 3D',description:'15 misiones interactivas',icon:Boxes,href:'/juegos'},
  {label:'Profesor virtual',description:'Voz, modelado y preguntas',icon:Presentation,href:'/profesor-virtual'},
  {label:'Audio y narración',description:'Ambientes y voces en español',icon:Volume2,href:'/audio'},
  {label:'Recursos PIE',description:'Apoyos y adecuaciones',icon:Accessibility,href:'/recursos-pie'},
  {label:'Banco multimedia',description:'Imágenes, audio y escenas',icon:Images,href:'/multimedia'},
  {label:'Estudio inmersivo',description:'Crea nuevas experiencias',icon:Sparkles,href:'/estudio-inmersivo'}
]

export default async function TeacherDashboard(){
  const snapshot=await getDashboardSnapshot()
  const hours=Math.floor(snapshot.learningMinutes/60)
  const minutes=snapshot.learningMinutes%60
  const metrics=[
    {value:String(snapshot.activeStudents),detail:`de ${snapshot.totalStudents} activos`,label:'Estudiantes',trend:'+4 esta semana',tone:'violet',icon:Users},
    {value:String(snapshot.completedActivities),detail:'actividades realizadas',label:'Este mes',trend:`+${snapshot.weeklyGrowth}% de avance`,tone:'mint',icon:Target},
    {value:`${hours}h ${minutes}m`,detail:'tiempo de aprendizaje',label:'Esta semana',trend:'+32 min',tone:'blue',icon:Clock3},
    {value:String(snapshot.achievements),detail:'logros obtenidos',label:'¡Sigue así!',trend:'3 nuevos',tone:'amber',icon:Medal}
  ]

  return <ModuleShell active="Inicio">
    <div className="dashboard-content canonical-dashboard immersive-dashboard-page">
      <section className="welcome-banner immersive-welcome-banner">
        <div className="welcome-copy">
          <span className="eyebrow"><Sparkles size={15}/> Panel docente inteligente</span>
          <h1>¡Bienvenida, {snapshot.teacherName}! <span>👋</span></h1>
          <p>Hoy puedes iniciar una experiencia 3D, presentar una lección con YOYO y revisar el progreso del grupo desde un mismo lugar.</p>
          <div className="welcome-actions"><a className="welcome-primary" href="/estudio-inmersivo"><Sparkles size={18}/>Crear mundo 3D</a><a className="welcome-secondary" href="/profesor-virtual"><Presentation size={18}/>Abrir profesor virtual</a></div>
        </div>
        <div className="welcome-visual" aria-hidden="true">
          <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
          <div className="teacher-orb"><span>👩‍🏫</span></div>
          <div className="floating-card card-one"><CheckCircle2 size={18}/><span><strong>{snapshot.participation}%</strong><small>participación</small></span></div>
          <div className="floating-card card-two"><Zap size={18}/><span><strong>+{snapshot.weeklyGrowth}%</strong><small>progreso semanal</small></span></div>
          <div className="floating-card card-three"><Users size={18}/><span><strong>{snapshot.activeGroups}</strong><small>grupos activos</small></span></div>
        </div>
      </section>

      <section className="metrics-grid" aria-label="Resumen pedagógico">
        {metrics.map(metric=>{const Icon=metric.icon;return <article className={`metric-card tone-${metric.tone}`} key={metric.label}><div className="metric-row"><span className="metric-icon"><Icon size={25}/></span><span className="metric-trend"><TrendingUp size={13}/>{metric.trend}</span></div><div className="metric-value"><strong>{metric.value}</strong><span>{metric.detail}</span></div><span className="metric-label">{metric.label}</span></article>})}
      </section>

      <section className="immersive-dashboard-main-grid">
        <DashboardImmersiveHero/>

        <aside className="immersive-dashboard-side">
          <article className="panel-card agenda-card"><div className="section-heading"><div><span className="section-kicker">AGENDA</span><h2>Tu día de hoy</h2></div><button aria-label="Más opciones"><MoreHorizontal/></button></div><div className="agenda-list"><div className="agenda-item"><time>09:15</time><span className="agenda-dot violet"/><div><strong>Lectura guiada</strong><small>3.º básico · Sala 5</small></div></div><div className="agenda-item active"><time>10:30</time><span className="agenda-dot mint"/><div><strong>Comprensión lectora</strong><small>Grupo de apoyo PIE</small></div><em>Ahora</em></div><div className="agenda-item"><time>12:00</time><span className="agenda-dot amber"/><div><strong>Revisión de avances</strong><small>Equipo multidisciplinario</small></div></div></div><a className="panel-link" href="/calendario"><CalendarDays size={16}/>Ver calendario completo<ChevronRight size={16}/></a></article>
          <article className="immersive-virtual-teacher-card"><div className="immersive-teacher-card-head"><span><Bot/></span><div><small>PROFESOR VIRTUAL YOYO</small><strong>Lección preparada</strong></div></div><div className="immersive-teacher-avatar-mini"><span>🤖</span><i/><i/><i/><i/></div><p>YOYO presenta la misión, narra instrucciones, modela una inferencia y comprueba la comprensión.</p><div className="immersive-teacher-features"><span>Voz</span><span>Subtítulos</span><span>Preguntas</span><span>Control docente</span></div><a href="/profesor-virtual">Iniciar presentación<ArrowUpRight/></a></article>
          <article className="immersive-streak-card"><span>🔥</span><div><small>RACHA DOCENTE</small><strong>4 días creando</strong><p>Te falta una experiencia para desbloquear la insignia “Diseñadora inmersiva”.</p><i><b style={{width:'80%'}}/></i></div></article>
        </aside>
      </section>

      <section className="dashboard-tool-launcher immersive-tool-launcher" aria-label="Módulos y herramientas destacadas">
        {immersiveTools.map(({label,description,icon:Icon,href})=><a href={href} key={label}><span><Icon/></span><div><strong>{label}</strong><small>{description}</small></div></a>)}
      </section>

      <section className="lower-grid">
        <article className="panel-card activities-panel"><div className="section-heading"><div><span className="section-kicker">PLANIFICACIÓN</span><h2>Próximas actividades</h2></div><a href="/planificacion">Ver todas<ChevronRight size={16}/></a></div><div className="activity-list">{activities.map(activity=><article className="activity-card" key={activity.title}><span className="activity-art lavender">{activity.emoji}</span><div className="activity-copy"><strong>{activity.title}</strong><small>{activity.meta}</small><div className="activity-progress"><span><i style={{width:`${activity.progress}%`}}/></span><em>{activity.progress}%</em></div></div><div className="activity-date"><CalendarDays size={15}/><span>{activity.date}</span><a href="/planificacion" aria-label="Abrir actividad"><ChevronRight size={17}/></a></div></article>)}</div></article>
        <article className="panel-card quick-panel"><div className="section-heading"><div><span className="section-kicker">ACCIONES RÁPIDAS</span><h2>Herramientas docentes</h2></div></div><div className="quick-grid">{quickActions.map(({label,description,icon:Icon,tone,href})=><a className="quick-action" href={href} key={label}><span className={`quick-icon tone-${tone}`}><Icon/></span><span><strong>{label}</strong><small>{description}</small></span><ChevronRight size={17}/></a>)}</div></article>
      </section>
    </div>
  </ModuleShell>
}
