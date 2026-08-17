import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
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
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export const dynamic = 'force-dynamic'

const moduleGroups = [
  { label: 'Biblioteca Premium', href: '/biblioteca', icon: Library, tone: 'violet' },
  { label: 'Crear con YOYO IA', href: '/crear', icon: Sparkles, tone: 'amber' },
  { label: 'Profesor Virtual', href: '/profesor-virtual', icon: Bot, tone: 'blue' },
  { label: 'Evaluaciones', href: '/evaluaciones', icon: ClipboardCheck, tone: 'mint' },
  { label: 'Juegos 3D', href: '/juegos', icon: Gamepad2, tone: 'rose' },
]

const auditedModules = [
  'Biblioteca', 'Crear con YOYO IA', 'Profesor Virtual', 'Cursos', 'Juegos',
  'Caligrafía', 'Inclusión', 'Evaluaciones', 'Simuladores', 'Herramientas',
  'Seguimiento', 'Familias', 'Informes', 'Integraciones', 'Multimedia',
  'QA', 'Configuración',
]

const fallbackResources = [
  { resourceKey: 'premium-reading-3b-bosque-nativo', title: 'Comprensión lectora · El bosque nativo', subject: 'Lenguaje', level: '3° básico', score: 96, kind: 'reading' },
  { resourceKey: 'premium-math-4b-feria-escolar', title: 'Problemas matemáticos · La feria escolar', subject: 'Matemática', level: '4° básico', score: 94, kind: 'math' },
  { resourceKey: 'premium-assessment-5b-ecosistemas', title: 'Evaluación adaptada · Ecosistemas', subject: 'Ciencias', level: '5° básico', score: 95, kind: 'assessment' },
  { resourceKey: 'premium-graphomotor-kinder-trazos', title: 'Grafomotricidad · Ruta de trazos', subject: 'Lenguaje', level: 'Kínder', score: 97, kind: 'writing' },
  { resourceKey: 'premium-escape-6b-agua', title: 'Escape Room · Misión agua', subject: 'Ciencias', level: '6° básico', score: 96, kind: 'forest' },
]

type PremiumResource = typeof fallbackResources[number]
type Payload = { subject?: unknown; level?: unknown; type?: unknown }

function artworkKind(payload: Payload) {
  const type = String(payload.type || '').toLowerCase()
  const subject = String(payload.subject || '').toLowerCase()
  if (type.includes('assessment')) return 'assessment'
  if (type.includes('reading-plan')) return 'plan'
  if (type.includes('reading')) return 'reading'
  if (type.includes('calligraphy')) return 'calligraphy'
  if (type.includes('graphomotor')) return 'writing'
  if (type.includes('inclusive') || subject.includes('apoyo transversal')) return 'inclusion'
  if (type.includes('history') || subject.includes('historia')) return 'history'
  if (type.includes('writing')) return 'writing'
  if (type.includes('escape')) return 'forest'
  if (subject.includes('matem')) return 'math'
  if (subject.includes('ciencia')) return 'science'
  return 'reading'
}

function formatFileCount(maxFiles: number | null | undefined) {
  if (maxFiles === -1) return '∞'
  if (typeof maxFiles === 'number') return String(maxFiles)
  return '—'
}

export default async function Dashboard() {
  const context = await requireOrganizationContext('/app')
  const db = context.supabase as any

  const [coursesResult, entitlementResult, resourcesResult, resourceCountResult] = await Promise.all([
    context.supabase
      .from('courses')
      .select('id, name, level, academic_year, is_active')
      .eq('organization_id', context.organization.id)
      .order('academic_year', { ascending: false })
      .order('name'),
    db
      .from('ai_entitlements')
      .select('plan_id,status')
      .eq('user_id', context.userId)
      .eq('organization_id', context.organization.id)
      .in('status', ['active', 'trialing'])
      .maybeSingle(),
    db
      .from('resource_candidates')
      .select('resource_key,title,payload,quality_score,status')
      .eq('organization_id', context.organization.id)
      .eq('status', 'published')
      .order('quality_score', { ascending: false })
      .limit(12),
    db
      .from('resource_candidates')
      .select('id', { count: 'exact', head: true })
      .eq('organization_id', context.organization.id)
      .eq('status', 'published'),
  ])

  const visibleCourses = coursesResult.data ?? []
  const activeCourses = visibleCourses.filter((course) => course.is_active)

  let aiPlan: Record<string, unknown> | null = null
  const planId = entitlementResult.data?.plan_id
  if (planId) {
    const planResult = await db
      .from('ai_plans')
      .select('id,name,model_tier,max_files_per_request,max_file_bytes,max_total_file_bytes,max_output_tokens,unlimited_file_analysis')
      .eq('id', planId)
      .maybeSingle()
    aiPlan = planResult.data ?? null
  }

  const resourceRows = Array.isArray(resourcesResult.data) ? resourcesResult.data : []
  const publishedResourceCount = typeof resourceCountResult.count === 'number' ? resourceCountResult.count : resourceRows.length
  const validatedResources: PremiumResource[] = resourceRows.length
    ? resourceRows.map((row: Record<string, unknown>) => {
        const payload = (row.payload && typeof row.payload === 'object' ? row.payload : {}) as Payload
        return {
          resourceKey: String(row.resource_key || ''),
          title: String(row.title || 'Recurso premium'),
          subject: String(payload.subject || 'Recurso interdisciplinario'),
          level: String(payload.level || 'Nivel adaptable'),
          score: Number(row.quality_score || 0),
          kind: artworkKind(payload),
        }
      })
    : fallbackResources

  const planName = String(aiPlan?.name || 'YOYO IA')
  const modelTier = String(aiPlan?.model_tier || '')
  const ownerMode = modelTier === 'owner' || String(aiPlan?.id || '') === 'propietaria'
  const maxFiles = typeof aiPlan?.max_files_per_request === 'number' ? aiPlan.max_files_per_request : null
  const planBadge = ownerMode ? 'Perfil Propietaria · uso ilimitado' : `Plan ${planName}`
  const aiMetric = ownerMode ? '∞' : formatFileCount(maxFiles)
  const aiMetricLabel = ownerMode ? 'YOYO IA · Propietaria' : `archivos/solicitud · ${planName}`

  return (
    <AppShell active="Inicio">
      <div className="approved-platform-dashboard">
        <section className="premium-home-hero" aria-labelledby="premium-home-title">
          <div className="premium-home-copy">
            <div className="premium-home-badges">
              <span><Sparkles size={14}/> YOYO IA exclusiva</span>
              <span><ShieldCheck size={14}/> {planBadge}</span>
            </div>
            <span className="approved-kicker">{context.organization.name}</span>
            <h1 id="premium-home-title">Aprender se vuelve <em>extraordinario.</em></h1>
            <p>Una experiencia educativa inteligente que conecta creación, inclusión, recursos premium, evaluación y juego para transformar una idea en aprendizaje real.</p>
            <div className="premium-home-actions">
              <Link href="/crear" className="approved-primary-action"><Sparkles size={19}/> Crear con YOYO IA</Link>
              <Link href="/biblioteca" className="premium-secondary-action"><BookOpen size={18}/> Explorar recursos premium</Link>
            </div>
            <div className="premium-home-proof" aria-label="Estado premium">
              <div><strong>{publishedResourceCount}</strong><span>recursos premium publicados</span></div>
              <div><strong>≥92</strong><span>quality gate para publicar</span></div>
              <div><strong>PIE + DUA</strong><span>integrados al recurso</span></div>
            </div>
          </div>
          <div className="premium-home-art">
            <div className="premium-art-glow" aria-hidden="true" />
            <img src="/yoyo-hero-preserved.webp" alt="Estudiantes aprendiendo alrededor de un libro mágico, imagen de portada de YoYoLetrasAI" />
            <div className="premium-floating-card premium-floating-ai"><span><Sparkles size={17}/></span><div><strong>YOYO IA</strong><small>Crear · adaptar · analizar</small></div></div>
            <div className="premium-floating-card premium-floating-quality"><CheckCircle2 size={18}/><div><strong>Premium verificado</strong><small>Currículum + PIE + DUA</small></div></div>
          </div>
        </section>

        <section className="premium-owner-strip">
          <div><span className="premium-owner-avatar">{context.initials}</span><p><small>Continuar trabajando</small><strong>Hola, {context.displayName}. Tu centro de control está listo.</strong></p></div>
          <div className="premium-owner-actions"><Link href="/crear"><Plus size={16}/> Nuevo recurso</Link><Link href="/juegos"><Gamepad2 size={16}/> Crear experiencia</Link></div>
        </section>

        <section className="approved-metric-grid" aria-label="Resumen institucional">
          <Link href="/cursos" className="approved-metric metric-violet"><span><GraduationCap/></span><div><strong>{activeCourses.length}</strong><small>Cursos activos</small></div><ArrowRight/></Link>
          <Link href="/biblioteca" className="approved-metric metric-mint"><span><BookOpen/></span><div><strong>{publishedResourceCount}</strong><small>Premium publicados</small></div><ArrowRight/></Link>
          <Link href="/qa" className="approved-metric metric-amber"><span><CheckCircle2/></span><div><strong>{auditedModules.length}</strong><small>Módulos en control QA</small></div><ArrowRight/></Link>
          <Link href="/crear" className="approved-metric metric-rose"><span><Sparkles/></span><div><strong>{aiMetric}</strong><small>{aiMetricLabel}</small></div><ArrowRight/></Link>
        </section>

        <section className="approved-panel approved-ai-tools premium-command-center">
          <div className="approved-panel-heading"><div><span className="approved-kicker">Acciones rápidas</span><h2>¿Qué quieres hacer ahora?</h2><p>Los flujos centrales quedan a un toque para reducir pasos y mantener continuidad entre módulos.</p></div><Link href="/herramientas">Ver todas</Link></div>
          <div className="approved-tools-row">{moduleGroups.map(({ label, href, icon: Icon, tone }) => <Link href={href} key={label} className={`tool-${tone}`}><span><Icon/></span><strong>{label}</strong><ArrowRight/></Link>)}</div>
        </section>

        <section className="approved-main-grid">
          <article className="approved-panel premium-resource-showcase">
            <div className="approved-panel-heading"><div><span className="approved-kicker">Biblioteca viva</span><h2>Recursos premium validados</h2><p>{resourceRows.length ? `${publishedResourceCount} recursos publicados; se muestran los destacados con mayor calidad.` : 'Contenido canónico de respaldo mientras se sincroniza la biblioteca.'}</p></div><Link href="/biblioteca">Abrir biblioteca</Link></div>
            <div className="approved-resource-list premium-validated-list">{validatedResources.slice(0, 5).map((resource, index) => (
              <Link href="/biblioteca" key={resource.resourceKey || resource.title}>
                <span className={`resource-thumb resource-${index}`}><ActivityArtwork kind={resource.kind}/></span>
                <div><strong>{resource.title}</strong><small>{resource.subject} · {resource.level}</small></div>
                <span className="premium-quality-score"><CheckCircle2 size={13}/>{resource.score}/100</span><ArrowRight/>
              </Link>
            ))}</div>
          </article>

          <aside className="approved-panel premium-ai-status-card">
            <div className="premium-ai-orb"><Sparkles/></div><span className="approved-kicker">YOYO IA</span><h2>Una IA educativa propia</h2>
            <p>Creación y transformación de recursos con contexto curricular, adaptación PIE/NEE, DUA y análisis de múltiples fuentes.</p>
            <div className="premium-ai-capabilities">
              <span><CheckCircle2/> Plan activo: {planName}</span>
              <span><CheckCircle2/> {ownerMode ? 'Cantidad de archivos sin tope de plan' : `${formatFileCount(maxFiles)} archivos por solicitud`}</span>
              <span><CheckCircle2/> Versiones docente + estudiante</span>
              <span><CheckCircle2/> Fuentes verificadas y análisis multimodal</span>
            </div>
            <Link href="/crear" className="approved-primary-action"><Sparkles size={17}/> Entrar a YOYO IA</Link>
          </aside>
        </section>

        <section className="approved-content-grid">
          <article className="approved-panel approved-analytics-card">
            <div className="approved-panel-heading"><div><h2>Actividad institucional</h2><p>El gráfico se activará con evidencias y progreso real de los módulos.</p></div><span><BarChart3 size={16}/> Datos reales</span></div>
            <div className="approved-empty-chart" role="img" aria-label="Gráfico sin datos todavía">
              <svg viewBox="0 0 720 250" aria-hidden="true"><defs><linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#6f52ed" stopOpacity=".25"/><stop offset="1" stopColor="#6f52ed" stopOpacity="0"/></linearGradient></defs><g stroke="#e9e7f2" strokeWidth="1"><path d="M40 40H690"/><path d="M40 90H690"/><path d="M40 140H690"/><path d="M40 190H690"/><path d="M40 235H690"/></g><path d="M40 205 C150 205 185 185 260 185 S390 165 470 165 S600 145 690 145 L690 235 L40 235Z" fill="url(#chartFill)"/><path d="M40 205 C150 205 185 185 260 185 S390 165 470 165 S600 145 690 145" fill="none" stroke="#7657ef" strokeWidth="4" strokeLinecap="round"/></svg>
              <div><strong>Sin evidencias registradas todavía</strong><span>Los datos aparecerán automáticamente cuando seguimiento y progreso comiencen a registrar actividad.</span></div>
            </div>
          </article>
          <aside className="approved-panel approved-courses-card"><div className="approved-panel-heading"><div><h2>Mis cursos activos</h2><p>{context.organization.name}</p></div><Link href="/cursos">Ver todos</Link></div>
            {coursesResult.error ? <div className="approved-state error">No fue posible cargar los cursos.</div> : activeCourses.length ? <div className="approved-course-list">{activeCourses.slice(0, 5).map((course, index) => <Link href="/cursos" key={course.id}><span className={`course-symbol course-${index % 4}`}><GraduationCap/></span><div><strong>{course.name}</strong><small>{course.level} · {course.academic_year}</small></div><ArrowRight/></Link>)}</div> : <div className="approved-state"><GraduationCap/><strong>Aún no hay cursos activos</strong><span>Crea el primer curso desde el módulo institucional.</span><Link href="/cursos">Crear curso</Link></div>}
          </aside>
        </section>

        <section className="approved-panel approved-readiness-card premium-readiness-wide">
          <div className="approved-panel-heading"><div><h2>Estado de preparación</h2><p>Transparencia técnica y pedagógica antes de llevar cambios a producción.</p></div></div>
          <div className="approved-readiness">
            <div><span><ShieldCheck/></span><div><strong>Seguridad multitenant</strong><small>RLS y contexto institucional activos</small></div><CheckCircle2/></div>
            <div><span><Users/></span><div><strong>Identidad y roles</strong><small>Sesión, institución y permisos reales</small></div><CheckCircle2/></div>
            <div><span><Target/></span><div><strong>Quality gate premium</strong><small>Publicación bloqueada bajo 92/100</small></div><CheckCircle2/></div>
            <div><span><Gamepad2/></span><div><strong>Experiencia responsive</strong><small>Mejora progresiva de escritorio y móvil</small></div><CheckCircle2/></div>
          </div>
        </section>

        <footer className="approved-system-footer"><span><ShieldCheck/> Seguridad RLS activa</span><span><GraduationCap/> Supabase conectado</span><span><CalendarDays/> Plataforma 2026</span><span><CheckCircle2/> Rama premium protegida</span></footer>
      </div>
    </AppShell>
  )
}
