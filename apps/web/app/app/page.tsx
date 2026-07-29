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
  Eye,
  FileText,
  Gamepad2,
  GraduationCap,
  Home,
  Library,
  Medal,
  MessageSquare,
  MoreHorizontal,
  Music2,
  Play,
  Plus,
  Search,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Volume2,
  Zap
} from 'lucide-react'

const navigation = [
  {label: 'Inicio', icon: Home, href: '/app', active: true},
  {label: 'Biblioteca', icon: Library, href: '/biblioteca'},
  {label: 'Crear', icon: Sparkles, href: '/crear'},
  {label: 'YOYO', icon: Bot, href: '/yoyo'},
  {label: 'Juegos', icon: Gamepad2, href: '/juegos'},
  {label: 'Estudiantes', icon: Users, href: '/estudiantes'},
  {label: 'Informes', icon: FileText, href: '/informes'},
  {label: 'Configuración', icon: Settings, href: '/configuracion'}
]

const metrics = [
  {value: '28', detail: 'de 32 activos', label: 'Estudiantes', trend: '+4 esta semana', tone: 'violet', icon: Users},
  {value: '15', detail: 'actividades realizadas', label: 'Este mes', trend: '+18% de avance', tone: 'mint', icon: Target},
  {value: '2h 35m', detail: 'tiempo de aprendizaje', label: 'Esta semana', trend: '+32 min', tone: 'blue', icon: Clock3},
  {value: '12', detail: 'logros obtenidos', label: '¡Sigue así!', trend: '3 nuevos', tone: 'amber', icon: Medal}
]

const quickActions = [
  {label: 'Nueva actividad', description: 'Diseña desde cero', icon: Sparkles, tone: 'violet'},
  {label: 'Biblioteca', description: 'Recursos curriculares', icon: BookOpen, tone: 'mint'},
  {label: 'YOYO asistente', description: 'Planifica con IA', icon: Bot, tone: 'blue'},
  {label: 'Generar informe', description: 'Progreso y evidencias', icon: BarChart3, tone: 'amber'}
]

const activities = [
  {title: 'Comprensión lectora: cuentos', meta: '3.º básico · Lenguaje', date: 'Hoy, 10:30', progress: 72, emoji: '📚', tone: 'lavender'},
  {title: 'Secuencia de eventos', meta: '3.º básico · Lectura', date: 'Mañana, 09:15', progress: 48, emoji: '🧩', tone: 'mint'},
  {title: 'Desafío de multiplicación', meta: '5.º básico · Matemática', date: 'Viernes, 11:45', progress: 26, emoji: '✖️', tone: 'blue'}
]

function ForestArtwork() {
  return (
    <svg className="forest-art" viewBox="0 0 960 540" role="img" aria-label="Niña explorando un bosque mágico con una linterna">
      <defs>
        <linearGradient id="sky" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#172866"/><stop offset=".55" stopColor="#164d66"/><stop offset="1" stopColor="#0c2d49"/></linearGradient>
        <linearGradient id="hillBack" x1="0" x2="1"><stop stopColor="#255f66"/><stop offset="1" stopColor="#183e58"/></linearGradient>
        <linearGradient id="hillFront" x1="0" x2="1"><stop stopColor="#174c45"/><stop offset="1" stopColor="#0a293b"/></linearGradient>
        <linearGradient id="path" x1="0" x2="1"><stop stopColor="#ad8452"/><stop offset="1" stopColor="#e1be77"/></linearGradient>
        <radialGradient id="moonGlow"><stop stopColor="#fff3a6" stopOpacity=".95"/><stop offset="1" stopColor="#fff3a6" stopOpacity="0"/></radialGradient>
        <radialGradient id="torchGlow"><stop stopColor="#fffbd0" stopOpacity=".95"/><stop offset=".4" stopColor="#ffe76f" stopOpacity=".52"/><stop offset="1" stopColor="#ffe76f" stopOpacity="0"/></radialGradient>
        <linearGradient id="shirt" x1="0" x2="1"><stop stopColor="#8b55ee"/><stop offset="1" stopColor="#6435d1"/></linearGradient>
        <filter id="softGlow"><feGaussianBlur stdDeviation="9"/></filter>
        <filter id="shadow"><feDropShadow dx="0" dy="12" stdDeviation="10" floodColor="#020918" floodOpacity=".35"/></filter>
      </defs>
      <rect width="960" height="540" fill="url(#sky)"/>
      <circle cx="740" cy="104" r="96" fill="url(#moonGlow)"/>
      <circle cx="740" cy="104" r="46" fill="#fff0a8" opacity=".92"/>
      <g fill="#d8e7ff" opacity=".65"><circle cx="250" cy="70" r="2"/><circle cx="352" cy="102" r="2.5"/><circle cx="507" cy="58" r="2"/><circle cx="840" cy="56" r="2.5"/><circle cx="626" cy="146" r="2"/></g>
      <path d="M0 280C126 210 222 219 327 276c89 48 154 40 241-24 120-88 258-83 392-2v290H0Z" fill="url(#hillBack)"/>
      <path d="M0 350c102-82 213-91 322-24 84 51 151 45 232-11 124-86 267-67 406 35v190H0Z" fill="url(#hillFront)"/>
      <path d="M429 540c55-84 111-138 198-182 74-37 145-49 249-33-117 44-179 95-238 215Z" fill="url(#path)" opacity=".86"/>
      <g opacity=".9">
        <g transform="translate(70 126)"><rect x="34" y="104" width="24" height="218" rx="12" fill="#12343c"/><path d="M46 0 0 125h92Z" fill="#0e4a48"/><path d="M46 45 5 161h82Z" fill="#0b3e42"/></g>
        <g transform="translate(178 171) scale(.82)"><rect x="34" y="104" width="24" height="218" rx="12" fill="#12343c"/><path d="M46 0 0 125h92Z" fill="#17605a"/><path d="M46 45 5 161h82Z" fill="#114b4d"/></g>
        <g transform="translate(822 118)"><rect x="34" y="104" width="24" height="218" rx="12" fill="#12343c"/><path d="M46 0 0 125h92Z" fill="#0e4a48"/><path d="M46 45 5 161h82Z" fill="#0b3e42"/></g>
      </g>
      <g transform="translate(682 224)" filter="url(#shadow)">
        <rect x="15" y="80" width="160" height="112" rx="8" fill="#7b443d"/>
        <path d="M0 88 94 15l98 73-20 23-78-58-77 58Z" fill="#b35f4c"/>
        <rect x="116" y="117" width="34" height="43" rx="4" fill="#ffe678"/>
        <path d="M116 138h34M133 117v43" stroke="#ba7a2f" strokeWidth="4"/>
        <rect x="47" y="130" width="38" height="62" rx="19" fill="#4f3135"/>
        <rect x="29" y="62" width="24" height="38" rx="4" fill="#644140"/><rect x="34" y="70" width="14" height="17" rx="2" fill="#ffd967"/>
      </g>
      <ellipse cx="663" cy="372" rx="155" ry="120" fill="url(#torchGlow)" filter="url(#softGlow)" opacity=".72"/>
      <g transform="translate(515 210)" filter="url(#shadow)">
        <path d="M56 103c-24 16-38 43-40 77l3 95h117l5-95c-2-36-18-61-43-77Z" fill="url(#shirt)"/>
        <path d="M45 119c-19 10-29 32-31 61l10 57 19-7-4-52 22-40Z" fill="#e5a746"/>
        <circle cx="82" cy="62" r="45" fill="#f3b27d"/>
        <path d="M37 67c-3-42 23-69 63-63 27 4 44 22 48 49-18-15-36-21-55-18-20 3-34 15-56 32Z" fill="#33263e"/>
        <path d="M43 42c10-28 33-43 61-38 14 2 25 8 34 17-17-2-29 5-38 20-18-7-36-6-57 1Z" fill="#221b2e"/>
        <circle cx="104" cy="62" r="4.5" fill="#292331"/><path d="M103 80c10 7 21 6 29-3" stroke="#b85c52" strokeWidth="4" fill="none" strokeLinecap="round"/>
        <path d="M122 125c25 22 48 36 80 42" stroke="#f3b27d" strokeWidth="15" fill="none" strokeLinecap="round"/>
        <path d="M198 166 244 181" stroke="#9a7144" strokeWidth="8" strokeLinecap="round"/>
        <circle cx="250" cy="183" r="15" fill="#ffe76f"/><circle cx="250" cy="183" r="28" fill="url(#torchGlow)"/>
        <path d="M55 276 46 340M111 276l17 64" stroke="#352c73" strokeWidth="20" strokeLinecap="round"/>
        <path d="m26 341 48 1m32 0h51" stroke="#20253e" strokeWidth="18" strokeLinecap="round"/>
        <path d="M38 115c-22 7-35 29-32 60l13 64 25-7-5-59 24-40Z" fill="#e6a641"/>
        <path d="M42 115c-14 17-18 34-15 54" stroke="#b98837" strokeWidth="5" fill="none"/>
      </g>
      <g fill="#ffe766"><circle cx="452" cy="315" r="4"/><circle cx="620" cy="176" r="3"/><circle cx="842" cy="338" r="4"/><circle cx="377" cy="232" r="3"/><circle cx="721" cy="413" r="3.5"/></g>
      <g opacity=".7"><path d="M0 472c84-35 156-30 230 6 68 34 139 34 212 3v59H0Z" fill="#0a2434"/><path d="M720 480c78-40 160-42 240-4v64H702Z" fill="#081d2c"/></g>
    </svg>
  )
}

function MetricCard({metric}: {metric: (typeof metrics)[number]}) {
  const Icon = metric.icon
  return (
    <article className={`metric-card tone-${metric.tone}`}>
      <div className="metric-row">
        <span className="metric-icon"><Icon size={25} aria-hidden="true" /></span>
        <span className="metric-trend"><TrendingUp size={13}/>{metric.trend}</span>
      </div>
      <div className="metric-value"><strong>{metric.value}</strong><span>{metric.detail}</span></div>
      <span className="metric-label">{metric.label}</span>
    </article>
  )
}

export default function TeacherDashboard() {
  return (
    <main className="product-shell">
      <aside className="app-sidebar" aria-label="Navegación principal">
        <div className="brand"><span className="brand-mark">Y</span><div><strong>YOYOLETRASAI</strong><small>Panel docente</small></div></div>
        <div className="workspace-switch"><span className="workspace-logo">C</span><span><small>Institución</small><strong>Colegio Coyam</strong></span><ChevronRight size={17}/></div>
        <nav className="side-nav">
          {navigation.map(({label, icon: Icon, href, active}) => <a className={active ? 'nav-link active' : 'nav-link'} href={href} key={label} aria-current={active ? 'page' : undefined}><Icon size={20} aria-hidden="true" /><span>{label}</span>{active && <i/>}</a>)}
        </nav>
        <div className="sidebar-help"><span><MessageSquare size={20}/></span><div><strong>¿Necesitas ayuda?</strong><small>Habla con el equipo YOYO</small></div><ArrowUpRight size={17}/></div>
        <button className="profile-card" type="button"><span className="profile-avatar">ER</span><span><strong>Elba Rosales</strong><small>Docente · PIE</small></span><MoreHorizontal size={18}/></button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><span className="brand-mark">Y</span><strong>YOYOLETRASAI</strong></div>
          <label className="global-search"><Search size={19}/><input aria-label="Buscar" placeholder="Buscar recursos, estudiantes o actividades..."/><kbd>⌘ K</kbd></label>
          <div className="topbar-actions"><button className="icon-button" aria-label="Notificaciones"><Bell size={20}/><span>3</span></button><button className="primary-button"><Plus size={20}/><span>Crear actividad</span></button></div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-banner">
            <div className="welcome-copy">
              <span className="eyebrow"><Sparkles size={15}/> Panel docente inteligente</span>
              <h1>¡Bienvenida, Elba! <span>👋</span></h1>
              <p>Tu curso avanza muy bien. Hoy tienes 3 actividades programadas y una nueva recomendación personalizada de YOYO.</p>
              <div className="welcome-actions"><a className="welcome-primary" href="/crear"><Sparkles size={18}/>Crear experiencia</a><a className="welcome-secondary" href="/biblioteca"><BookOpen size={18}/>Explorar biblioteca</a></div>
            </div>
            <div className="welcome-visual" aria-hidden="true">
              <div className="orbit orbit-one"/><div className="orbit orbit-two"/>
              <div className="teacher-orb"><span>👩‍🏫</span></div>
              <div className="floating-card card-one"><CheckCircle2 size={18}/><span><strong>85%</strong><small>participación</small></span></div>
              <div className="floating-card card-two"><Zap size={18}/><span><strong>+18%</strong><small>progreso semanal</small></span></div>
              <div className="floating-card card-three"><GraduationCap size={18}/><span><strong>3</strong><small>grupos activos</small></span></div>
            </div>
          </section>

          <section className="metrics-grid" aria-label="Resumen pedagógico">{metrics.map(metric => <MetricCard metric={metric} key={metric.label}/>)}</section>

          <section className="main-grid">
            <article className="featured-game">
              <ForestArtwork />
              <div className="featured-shade" />
              <div className="featured-copy">
                <div className="featured-kicker"><span>JUEGO INMERSIVO DESTACADO</span><em>Nuevo</em></div>
                <h2>La aventura del<br/>Bosque Mágico</h2>
                <p>Ayuda a Luma a encontrar los objetos, escuchar pistas y resolver misiones de comprensión lectora.</p>
                <div className="chips"><span>Lenguaje</span><span>3.º básico</span><span>Comprensión</span><span>⭐ 5 niveles</span></div>
                <div className="featured-actions"><button className="play-button"><Play size={19} fill="currentColor"/>Iniciar juego</button><button className="preview-button"><Eye size={19}/>Vista previa</button></div>
              </div>
              <div className="media-actions"><button aria-label="Música"><Music2/></button><button aria-label="Sonido"><Volume2/></button></div>
              <div className="progress-panel">
                <div className="progress-item"><div><span>Progreso del juego</span><strong>60%</strong></div><div className="progress-track"><i style={{width: '60%'}} /></div></div>
                <div className="progress-divider"/>
                <div className="progress-item"><div><span>Pistas encontradas</span><strong>2 / 4</strong></div><div className="progress-track purple"><i style={{width: '50%'}} /></div></div>
              </div>
            </article>

            <aside className="right-rail">
              <article className="panel-card agenda-card">
                <div className="section-heading"><div><span className="section-kicker">AGENDA</span><h2>Tu día de hoy</h2></div><button aria-label="Más opciones"><MoreHorizontal/></button></div>
                <div className="agenda-list">
                  <div className="agenda-item"><time>09:15</time><span className="agenda-dot violet"/><div><strong>Lectura guiada</strong><small>3.º básico · Sala 5</small></div></div>
                  <div className="agenda-item active"><time>10:30</time><span className="agenda-dot mint"/><div><strong>Comprensión lectora</strong><small>Grupo de apoyo PIE</small></div><em>Ahora</em></div>
                  <div className="agenda-item"><time>12:00</time><span className="agenda-dot amber"/><div><strong>Revisión de avances</strong><small>Equipo multidisciplinario</small></div></div>
                </div>
                <a className="panel-link" href="/calendario"><CalendarDays size={16}/>Ver calendario completo<ChevronRight size={16}/></a>
              </article>

              <article className="ai-card">
                <div className="ai-head"><span><Bot size={21}/></span><div><small>RECOMENDACIÓN DE YOYO</small><strong>Atención pedagógica</strong></div></div>
                <p>El grupo de lectura está listo para avanzar a inferencias sencillas. Preparé una actividad de 15 minutos con apoyos visuales.</p>
                <div className="ai-tags"><span>DUA</span><span>Comprensión</span><span>15 min</span></div>
                <button>Revisar propuesta<ArrowUpRight size={17}/></button>
              </article>
            </aside>
          </section>

          <section className="lower-grid">
            <article className="panel-card activities-panel">
              <div className="section-heading"><div><span className="section-kicker">PLANIFICACIÓN</span><h2>Próximas actividades</h2></div><a href="/biblioteca">Ver todas<ChevronRight size={16}/></a></div>
              <div className="activity-list">
                {activities.map(activity => <article className="activity-card" key={activity.title}><span className={`activity-art ${activity.tone}`}>{activity.emoji}</span><div className="activity-copy"><strong>{activity.title}</strong><small>{activity.meta}</small><div className="activity-progress"><span><i style={{width: `${activity.progress}%`}}/></span><em>{activity.progress}%</em></div></div><div className="activity-date"><CalendarDays size={15}/><span>{activity.date}</span><button aria-label="Abrir actividad"><ChevronRight size={17}/></button></div></article>)}
              </div>
            </article>

            <article className="panel-card quick-panel">
              <div className="section-heading"><div><span className="section-kicker">HERRAMIENTAS</span><h2>Acciones rápidas</h2></div></div>
              <div className="quick-grid">{quickActions.map(({label, description, icon: Icon, tone}) => <button className="quick-action" key={label}><span className={`quick-icon tone-${tone}`}><Icon/></span><span><strong>{label}</strong><small>{description}</small></span><ChevronRight size={17}/></button>)}</div>
            </article>
          </section>
        </div>
      </section>

      <nav className="mobile-bottom-nav" aria-label="Navegación móvil">{navigation.slice(0,5).map(({label, icon: Icon, href, active}) => <a href={href} key={label} className={active ? 'active' : ''}><Icon/><span>{label}</span></a>)}</nav>
    </main>
  )
}
