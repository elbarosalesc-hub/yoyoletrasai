import Link from 'next/link'
import { AppShell } from '@/components/AppShell'
import { ForestHeroArt, ActivityArtwork } from '@/components/dashboard/DashboardIllustrations'
import {
  Sparkles,
  BookOpen,
  ClipboardCheck,
  Gamepad2,
  CalendarDays,
  Trophy,
  Users,
  Target,
  ChevronRight,
  Building2,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react'
import { premiumActivities } from '@/lib/premiumActivities'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export const dynamic = 'force-dynamic'

const recommended = premiumActivities.slice(0, 5)
const artKinds = ['reading', 'math', 'science', 'writing', 'forest']

function WelcomeTeacher() {
  return (
    <svg className="welcome-teacher" viewBox="0 0 360 190" role="img" aria-label="Profesora saludando con libros">
      <defs>
        <linearGradient id="shirt" x1="0" x2="1"><stop stopColor="#6f35de"/><stop offset="1" stopColor="#a05cf2"/></linearGradient>
        <filter id="soft"><feDropShadow dx="0" dy="8" stdDeviation="8" floodOpacity=".16"/></filter>
      </defs>
      <circle cx="260" cy="48" r="10" fill="#ffd84d"/><circle cx="315" cy="82" r="7" fill="#e3c7ff"/>
      <path d="M296 32l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffc83d"/>
      <g transform="translate(185 18)" filter="url(#soft)">
        <circle cx="66" cy="54" r="39" fill="#f2b47c"/><path d="M25 56Q24 10 66 7q39 1 40 47-17-22-42-22-22 0-39 24z" fill="#5a352d"/>
        <circle cx="52" cy="58" r="4" fill="#1f2430"/><circle cx="79" cy="58" r="4" fill="#1f2430"/>
        <path d="M52 75q14 11 28 0" fill="none" stroke="#b95f5d" strokeWidth="4" strokeLinecap="round"/>
        <path d="M24 108q42-29 84 0l11 67H12z" fill="url(#shirt)"/><rect x="48" y="112" width="38" height="52" rx="5" fill="#6b3bc6"/>
        <path d="M98 112q33-42 44-35" fill="none" stroke="#f2b47c" strokeWidth="15" strokeLinecap="round"/>
      </g>
      <g transform="translate(25 126)"><rect width="78" height="18" rx="6" fill="#6d3de2"/><rect x="12" y="-17" width="82" height="18" rx="6" fill="#f1a63e"/><rect x="28" y="-34" width="76" height="18" rx="6" fill="#3caf68"/></g>
    </svg>
  )
}

function SummaryCard({ courseCount, activeCourses, roleLabel }: { courseCount: number; activeCourses: number; roleLabel: string }) {
  return (
    <aside className="summary-card premium-card summary-desktop">
      <div className="summary-head"><h2>Resumen institucional</h2><span><CalendarDays size={14}/> En vivo</span></div>
      <div className="summary-grid">
        <div className="summary-stat violet"><GraduationCap/><strong>{courseCount}</strong><span>cursos visibles</span></div>
        <div className="summary-stat mint"><Target/><strong>{activeCourses}</strong><span>cursos activos</span></div>
        <div className="summary-stat cyan"><ShieldCheck/><strong>RLS</strong><span>acceso protegido</span></div>
        <div className="summary-stat yellow"><Trophy/><strong>{roleLabel}</strong><span>rol principal</span></div>
      </div>
    </aside>
  )
}

export default async function Dashboard() {
  const context = await requireOrganizationContext('/app')
  const { data: courses, error: courseError } = await context.supabase
    .from('courses')
    .select('id, name, level, academic_year, is_active')
    .eq('organization_id', context.organization.id)
    .order('academic_year', { ascending: false })
    .order('name')

  const visibleCourses = courses ?? []
  const activeCourses = visibleCourses.filter((course) => course.is_active)

  return (
    <AppShell active="Inicio">
      <div className="premium-dashboard canonical-dashboard approved-mobile-dashboard">
        <section className="welcome-grid">
          <div className="welcome-card premium-card">
            <div className="welcome-copy">
              <span className="eyebrow"><Building2 size={14}/> {context.organization.name}</span>
              <h1>¡Bienvenida de vuelta, {context.displayName}! 👋</h1>
              <p>{context.roleLabel} · Datos protegidos y filtrados por tu institución activa.</p>
            </div>
            <WelcomeTeacher/>
            <div className="welcome-actions">
              <Link href="/crear" className="welcome-action purple"><span className="action-icon"><Sparkles/></span><span><b>Crear actividad</b><small>Diseña experiencias de aprendizaje.</small></span><ChevronRight className="action-chevron"/></Link>
              <Link href="/biblioteca" className="welcome-action green"><span className="action-icon"><BookOpen/></span><span><b>Buscar recursos</b><small>Explora materiales listos para usar.</small></span><ChevronRight className="action-chevron"/></Link>
              <Link href="/cursos" className="welcome-action blue"><span className="action-icon"><Users/></span><span><b>Mis cursos</b><small>Consulta los cursos accesibles en Supabase.</small></span><ChevronRight className="action-chevron"/></Link>
              <Link href="/evaluaciones" className="welcome-action orange"><span className="action-icon"><ClipboardCheck/></span><span><b>Evaluaciones</b><small>Crea y revisa instrumentos.</small></span><ChevronRight className="action-chevron"/></Link>
            </div>
          </div>
          <SummaryCard courseCount={visibleCourses.length} activeCourses={activeCourses.length} roleLabel={context.roleLabel}/>
        </section>

        <section className="dashboard-middle">
          <div className="featured-game premium-card canonical-featured">
            <ForestHeroArt/><div className="featured-overlay"></div>
            <div className="featured-copy"><span>Juego inmersivo destacado</span><h2>La Aventura del Bosque Mágico</h2><p>Ayuda a Luma a encontrar objetos, escuchar pistas y resolver misiones de comprensión lectora.</p><div className="game-cta"><Link href="/juegos" className="featured-play">Iniciar juego <span>▶</span></Link></div></div>
          </div>

          <aside className="upcoming premium-card">
            <div className="section-title"><div><h2>Cursos conectados</h2><p>{context.organization.name}</p></div><Link href="/cursos">Abrir cursos</Link></div>
            {courseError ? (
              <div className="insight"><strong>No fue posible cargar los cursos.</strong><p>La sesión sigue protegida. Reintenta desde el módulo de cursos.</p></div>
            ) : activeCourses.length > 0 ? (
              activeCourses.slice(0, 4).map((course, index) => (
                <Link href="/cursos" className="upcoming-item" key={course.id}>
                  <div className={`upcoming-thumb theme-${index % 3}`}><ActivityArtwork kind={artKinds[index % artKinds.length]}/></div>
                  <div><small>{course.academic_year}</small><b>{course.name}</b><span>{course.level} · Activo</span></div>
                  <em><GraduationCap size={15}/> Ver</em>
                </Link>
              ))
            ) : (
              <div className="insight"><strong>Aún no hay cursos activos.</strong><p>Los cursos creados para esta institución aparecerán aquí automáticamente.</p></div>
            )}
          </aside>
        </section>

        <section className="dashboard-bottom">
          <div className="recommendations premium-card">
            <div className="section-title"><div><h2>Recursos recomendados</h2><p>Propuestas pedagógicas disponibles mientras se incorporan evidencias reales.</p></div><Link href="/biblioteca">Ver todas <ChevronRight size={15}/></Link></div>
            <div className="recommendation-row">{recommended.map((activity, index) => <article className={`recommend-card recommendation-${index}`} key={activity.slug}><span>{activity.subject}</span><ActivityArtwork kind={artKinds[index]}/><h3>{activity.title}</h3><small>{activity.oa} · {activity.level}</small><Link href={`/biblioteca/${activity.slug}`}>Abrir actividad</Link></article>)}</div>
          </div>
        </section>
      </div>
    </AppShell>
  )
}
