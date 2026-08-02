import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gamepad2,
  GraduationCap,
  Library,
  Plus,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { ActivityArtwork } from '@/components/dashboard/DashboardIllustrations'
import { premiumActivities } from '@/lib/premiumActivities'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export const dynamic = 'force-dynamic'

const moduleGroups = [
  { label: 'Biblioteca', href: '/biblioteca', icon: Library, tone: 'violet' },
  { label: 'Crear con IA', href: '/crear', icon: Sparkles, tone: 'amber' },
  { label: 'Profesor Virtual', href: '/profesor-virtual', icon: Bot, tone: 'blue' },
  { label: 'Evaluaciones', href: '/evaluaciones', icon: ClipboardCheck, tone: 'mint' },
  { label: 'Informes', href: '/informes', icon: FileText, tone: 'rose' },
]

const auditedModules = [
  'Biblioteca', 'Crear con IA', 'Profesor Virtual', 'Cursos', 'Juegos',
  'Caligrafía', 'Inclusión', 'Evaluaciones', 'Simuladores', 'Herramientas',
  'Seguimiento', 'Familias', 'Informes', 'Integraciones', 'Multimedia',
  'QA', 'Configuración',
]

export default async function Dashboard() {
  const context = await requireOrganizationContext('/app')
  const { data: courses, error } = await context.supabase
    .from('courses')
    .select('id, name, level, academic_year, is_active')
    .eq('organization_id', context.organization.id)
    .order('academic_year', { ascending: false })
    .order('name')

  const visibleCourses = courses ?? []
  const activeCourses = visibleCourses.filter((course) => course.is_active)
  const resources = premiumActivities.slice(0, 6)

  return (
    <AppShell active="Inicio">
      <div className="approved-platform-dashboard">
        <section className="approved-hero-row">
          <div>
            <span className="approved-kicker">{context.organization.name}</span>
            <h1>¡Hola, {context.displayName}! <span aria-hidden="true">👋</span></h1>
            <p>Explora, enseña y transforma el aprendizaje con una plataforma segura, inclusiva y conectada.</p>
          </div>
          <Link href="/crear" className="approved-primary-action"><Plus size={19}/> Crear recurso</Link>
        </section>

        <section className="approved-metric-grid" aria-label="Resumen institucional">
          <Link href="/cursos" className="approved-metric metric-violet">
            <span><GraduationCap/></span><div><strong>{activeCourses.length}</strong><small>Cursos activos</small></div><ArrowRight/>
          </Link>
          <Link href="/biblioteca" className="approved-metric metric-mint">
            <span><BookOpen/></span><div><strong>{premiumActivities.length}</strong><small>Recursos disponibles</small></div><ArrowRight/>
          </Link>
          <Link href="/qa" className="approved-metric metric-amber">
            <span><CheckCircle2/></span><div><strong>{auditedModules.length}</strong><small>Módulos auditados</small></div><ArrowRight/>
          </Link>
          <div className="approved-metric metric-rose">
            <span><ShieldCheck/></span><div><strong>RLS</strong><small>Seguridad activa</small></div><CheckCircle2/>
          </div>
        </section>

        <section className="approved-main-grid">
          <article className="approved-panel approved-analytics-card">
            <div className="approved-panel-heading">
              <div><h2>Actividad institucional</h2><p>El gráfico se activará al registrar evidencias y progreso real.</p></div>
              <span><BarChart3 size={16}/> Datos reales</span>
            </div>
            <div className="approved-empty-chart" role="img" aria-label="Gráfico sin datos todavía">
              <svg viewBox="0 0 720 250" aria-hidden="true">
                <defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6f52ed" stopOpacity=".25"/><stop offset="1" stopColor="#6f52ed" stopOpacity="0"/></linearGradient></defs>
                <g stroke="#e9e7f2" strokeWidth="1"><path d="M40 40H690"/><path d="M40 90H690"/><path d="M40 140H690"/><path d="M40 190H690"/><path d="M40 235H690"/></g>
                <path d="M40 205 C150 205 185 185 260 185 S390 165 470 165 S600 145 690 145 L690 235 L40 235Z" fill="url(#chartFill)"/>
                <path d="M40 205 C150 205 185 185 260 185 S390 165 470 165 S600 145 690 145" fill="none" stroke="#7657ef" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <div><strong>Sin evidencias registradas todavía</strong><span>Los datos aparecerán automáticamente cuando los módulos de seguimiento estén conectados.</span></div>
            </div>
          </article>

          <aside className="approved-panel approved-courses-card">
            <div className="approved-panel-heading"><div><h2>Mis cursos activos</h2><p>{context.organization.name}</p></div><Link href="/cursos">Ver todos</Link></div>
            {error ? <div className="approved-state error">No fue posible cargar los cursos.</div> : activeCourses.length ? (
              <div className="approved-course-list">{activeCourses.slice(0, 5).map((course, index) => (
                <Link href="/cursos" key={course.id}>
                  <span className={`course-symbol course-${index % 4}`}><GraduationCap/></span>
                  <div><strong>{course.name}</strong><small>{course.level} · {course.academic_year}</small></div>
                  <ArrowRight/>
                </Link>
              ))}</div>
            ) : <div className="approved-state"><GraduationCap/><strong>Aún no hay cursos activos</strong><span>Crea el primer curso desde el módulo institucional.</span><Link href="/cursos">Crear curso</Link></div>}
          </aside>
        </section>

        <section className="approved-panel approved-ai-tools">
          <div className="approved-panel-heading"><div><h2>Herramientas educativas</h2><p>Accesos directos a los módulos centrales de la plataforma.</p></div><Link href="/qa">Ver auditoría</Link></div>
          <div className="approved-tools-row">{moduleGroups.map(({ label, href, icon: Icon, tone }) => (
            <Link href={href} key={label} className={`tool-${tone}`}><span><Icon/></span><strong>{label}</strong><ArrowRight/></Link>
          ))}</div>
        </section>

        <section className="approved-content-grid">
          <article className="approved-panel">
            <div className="approved-panel-heading"><div><h2>Recursos pedagógicos</h2><p>Materiales disponibles para abrir, adaptar y asignar.</p></div><Link href="/biblioteca">Ver biblioteca</Link></div>
            <div className="approved-resource-list">{resources.map((resource, index) => (
              <Link href={`/biblioteca/${resource.slug}`} key={resource.slug}>
                <span className={`resource-thumb resource-${index}`}><ActivityArtwork kind={['reading','math','science','writing','forest','reading'][index]}/></span>
                <div><strong>{resource.title}</strong><small>{resource.subject} · {resource.level}</small></div><ArrowRight/>
              </Link>
            ))}</div>
          </article>

          <aside className="approved-panel approved-readiness-card">
            <div className="approved-panel-heading"><div><h2>Estado de preparación</h2><p>Transparencia antes de producción.</p></div></div>
            <div className="approved-readiness">
              <div><span><ShieldCheck/></span><div><strong>Seguridad multitenant</strong><small>RLS y contexto institucional activos</small></div><CheckCircle2/></div>
              <div><span><Users/></span><div><strong>Identidad y roles</strong><small>Sesión, institución y permisos reales</small></div><CheckCircle2/></div>
              <div><span><Target/></span><div><strong>Módulos pedagógicos</strong><small>Rutas verificadas; persistencia progresiva</small></div><CheckCircle2/></div>
              <div><span><Gamepad2/></span><div><strong>Experiencia responsive</strong><small>Diseño adaptado para escritorio y móvil</small></div><CheckCircle2/></div>
            </div>
          </aside>
        </section>

        <footer className="approved-system-footer">
          <span><ShieldCheck/> Seguridad RLS activa</span>
          <span><GraduationCap/> Supabase conectado</span>
          <span><CalendarDays/> Plataforma 2026</span>
          <span><CheckCircle2/> Diseño aprobado</span>
        </footer>
      </div>
    </AppShell>
  )
}
