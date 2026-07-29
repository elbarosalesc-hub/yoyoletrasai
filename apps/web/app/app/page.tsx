import {
  Bell, BookOpen, Bot, ChevronRight, Clock3, FileText, Gamepad2, Home,
  Library, Medal, Music2, Play, Plus, Settings, Sparkles, Target, Users,
  Volume2, Eye, CalendarDays
} from 'lucide-react'

const navigation = [
  {label: 'Inicio', icon: Home, active: true},
  {label: 'Biblioteca', icon: Library},
  {label: 'Crear', icon: Sparkles},
  {label: 'YOYO', icon: Bot},
  {label: 'Juegos', icon: Gamepad2},
  {label: 'Estudiantes', icon: Users},
  {label: 'Informes', icon: FileText},
  {label: 'Configuración', icon: Settings}
]

const metrics = [
  {value: '28', detail: 'de 32 activos', label: 'Estudiantes', tone: 'violet', icon: Users},
  {value: '15', detail: 'actividades realizadas', label: 'Este mes', tone: 'mint', icon: Target},
  {value: '2h 35m', detail: 'tiempo de aprendizaje', label: 'Esta semana', tone: 'blue', icon: Clock3},
  {value: '12', detail: 'logros obtenidos', label: '¡Sigue así!', tone: 'yellow', icon: Medal}
]

const quickActions = [
  {label: 'Nueva actividad', icon: BookOpen, tone: 'violet'},
  {label: 'Mis recursos', icon: Target, tone: 'mint'},
  {label: 'YOYO asistente', icon: Bot, tone: 'blue'},
  {label: 'Generar informe', icon: FileText, tone: 'yellow'}
]

function ForestArtwork() {
  return (
    <svg className="forest-art" viewBox="0 0 760 420" role="img" aria-label="Niña explorando un bosque mágico con una linterna">
      <defs>
        <linearGradient id="night" x1="0" y1="0" x2="1" y2="1">
          <stop stopColor="#13204f" />
          <stop offset="0.55" stopColor="#113b50" />
          <stop offset="1" stopColor="#071b38" />
        </linearGradient>
        <radialGradient id="light" cx="0.66" cy="0.67" r="0.35">
          <stop stopColor="#fff59d" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff59d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="760" height="420" fill="url(#night)" />
      <circle cx="560" cy="285" r="170" fill="url(#light)" />
      <path d="M0 130C100 70 180 100 250 170S390 240 470 150 650 60 760 110V0H0Z" fill="#152a5b" />
      <g fill="#0a2d42">
        <path d="M35 0h70l-5 420H22Z" /><path d="M670 0h70l15 420h-95Z" />
        <path d="M85 120l-70 80h150Z" /><path d="M705 105l-90 115h170Z" />
        <path d="M155 135l-70 100h150Z" /><path d="M615 145l-75 100h155Z" />
      </g>
      <path d="M400 420c35-86 90-139 178-167 46-15 88-12 182-2v169Z" fill="#8b744b" opacity="0.44" />
      <g transform="translate(575 160)">
        <path d="M0 95V28l70-50 72 50v67Z" fill="#7d4238" />
        <path d="M-8 30 70-32l82 62-15 15-67-50L8 45Z" fill="#a75843" />
        <rect x="82" y="37" width="31" height="39" rx="3" fill="#ffd553" />
        <rect x="20" y="55" width="33" height="40" rx="16" fill="#4e2e2c" />
      </g>
      <g transform="translate(405 135)">
        <circle cx="80" cy="55" r="43" fill="#f1ad77" />
        <path d="M36 58c-4-43 25-69 63-59 21 6 34 22 38 43-15-12-31-17-47-16-19 2-31 14-54 32Z" fill="#30253c" />
        <circle cx="104" cy="54" r="4" fill="#241f2a" />
        <path d="M103 69c10 8 20 8 28 0" stroke="#ae554b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M66 91c38-18 73 3 84 50l-5 80H66l-17-75c-5-27 1-45 17-55Z" fill="#7947d9" />
        <path d="M67 113c-15 32-13 67 1 104" stroke="#f1ad77" strokeWidth="14" strokeLinecap="round" />
        <path d="M140 113c19 22 38 33 61 36" stroke="#f1ad77" strokeWidth="14" strokeLinecap="round" />
        <path d="M196 148l43 13" stroke="#a07645" strokeWidth="7" strokeLinecap="round" />
        <circle cx="243" cy="163" r="12" fill="#ffe45f" />
        <path d="M80 221 71 291M127 221l18 70" stroke="#3e3372" strokeWidth="19" strokeLinecap="round" />
        <path d="m55 292 42 1M128 292h42" stroke="#232643" strokeWidth="17" strokeLinecap="round" />
        <path d="M55 100c-18 5-27 25-24 51l12 39 21-5-4-46 18-26Z" fill="#e2a545" />
      </g>
      <g fill="#ffdf4f">
        <circle cx="356" cy="128" r="4" /><circle cx="617" cy="128" r="4" /><circle cx="680" cy="310" r="5" />
        <circle cx="720" cy="275" r="3" /><circle cx="320" cy="220" r="3" /><circle cx="545" cy="88" r="3" />
      </g>
    </svg>
  )
}

function MetricCard({metric}: {metric: (typeof metrics)[number]}) {
  const Icon = metric.icon
  return (
    <article className={`metric-card tone-${metric.tone}`}>
      <div className="metric-top"><span className="metric-icon"><Icon size={28} aria-hidden="true" /></span><div><strong>{metric.value}</strong><p>{metric.detail}</p></div></div>
      <span className="metric-label">{metric.label}</span>
    </article>
  )
}

export default function TeacherDashboard() {
  return (
    <main className="app-frame">
      <aside className="sidebar" aria-label="Navegación principal">
        <div className="brand"><span className="brand-mark">Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></div>
        <nav className="side-nav">
          {navigation.map(({label, icon: Icon, active}) => <a className={active ? 'nav-link active' : 'nav-link'} href="#" key={label} aria-current={active ? 'page' : undefined}><Icon size={20} aria-hidden="true" /><span>{label}</span></a>)}
        </nav>
        <button className="profile-card" type="button"><span className="profile-avatar">Y</span><span><strong>YoYo Profe</strong><small>Docente</small></span><ChevronRight size={18} /></button>
      </aside>

      <section className="dashboard-shell">
        <header className="mobile-header"><button className="mobile-menu" aria-label="Abrir menú">☰</button><div className="brand compact"><span className="brand-mark">Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></div><button className="notification-button" aria-label="3 notificaciones"><Bell size={21}/><span>3</span></button></header>
        <header className="dashboard-header"><div><h1>¡Bienvenida, YoYo Profe! 👋</h1><p>Hoy es un gran día para crear experiencias de aprendizaje.</p></div><div className="header-actions"><button className="notification-button" aria-label="3 notificaciones"><Bell size={21}/><span>3</span></button><button className="primary-button"><span>Crear actividad</span><Plus size={22}/></button></div></header>
        <section className="metrics-grid" aria-label="Resumen pedagógico">{metrics.map(metric => <MetricCard metric={metric} key={metric.label}/>)}</section>
        <section className="featured-game">
          <ForestArtwork /><div className="featured-shade" />
          <div className="featured-copy"><span className="featured-badge">JUEGO INMERSIVO DESTACADO</span><h2>La aventura del<br/>Bosque Mágico</h2><p>Ayuda a Luma a encontrar los objetos, escuchar pistas y resolver misiones de comprensión lectora.</p><div className="chips"><span>Lenguaje</span><span>3.º básico</span><span>Comprensión</span><span>⭐ Niveles: 5</span></div><div className="featured-actions"><button className="play-button"><Play size={20} fill="currentColor"/>Iniciar juego</button><button className="preview-button"><Eye size={20}/>Vista previa</button></div></div>
          <div className="media-actions"><button aria-label="Música"><Music2/></button><button aria-label="Sonido"><Volume2/></button></div>
          <div className="progress-panel"><div className="progress-item"><div><span>Progreso del juego</span><strong>60%</strong></div><div className="progress-track"><i style={{width: '60%'}} /></div></div><div className="progress-divider"/><div className="progress-item"><div><span>Pistas encontradas</span><strong>2 / 4</strong></div><div className="progress-track purple"><i style={{width: '50%'}} /></div></div></div>
        </section>
        <section className="secondary-grid">
          <article className="panel-card upcoming-panel"><div className="section-heading"><h2>Próximas actividades</h2><a href="#">Ver todas</a></div><div className="activity-list"><article className="activity-card"><span className="activity-art story">📚</span><div><strong>Comprensión lectora:<br/>Cuentos</strong><small>3.º básico · Lenguaje</small><span><CalendarDays size={14}/>20 de mayo</span></div></article><article className="activity-card"><span className="activity-art puzzle">🧩</span><div><strong>Secuencia de eventos</strong><small>3.º básico · Lectura</small><span><CalendarDays size={14}/>21 de mayo</span></div></article></div></article>
          <article className="panel-card quick-panel"><div className="section-heading"><h2>Acciones rápidas</h2></div><div className="quick-grid">{quickActions.map(({label, icon: Icon, tone}) => <button className="quick-action" key={label}><span className={`quick-icon tone-${tone}`}><Icon/></span><span>{label}</span></button>)}</div></article>
        </section>
      </section>
      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">{navigation.slice(0,5).map(({label, icon: Icon, active}) => <a href="#" key={label} className={active ? 'active' : ''}><Icon/><span>{label}</span></a>)}</nav>
    </main>
  )
}
