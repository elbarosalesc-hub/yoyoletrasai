import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  LayoutDashboard,
  Library,
  LockKeyhole,
  MessagesSquare,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WandSparkles,
} from 'lucide-react'
import styles from './presentacion.module.css'

export const metadata: Metadata = {
  title: 'Presentación | YOYOLETRASAI',
  description: 'Vista pública de la plataforma educativa institucional YOYOLETRASAI.',
}

const modules = [
  {
    title: 'Cursos y grupos',
    description: 'Cursos institucionales, niveles, años escolares y gestión de matrículas.',
    icon: GraduationCap,
    state: 'Conectado',
    tone: 'violet',
  },
  {
    title: 'Estudiantes',
    description: 'Directorio real, fichas individuales y seguimiento por institución.',
    icon: Users,
    state: 'Conectado',
    tone: 'blue',
  },
  {
    title: 'PIE y DUA',
    description: 'Fortalezas, barreras, adecuaciones, apoyos y equipo responsable.',
    icon: HeartHandshake,
    state: 'Conectado',
    tone: 'mint',
  },
  {
    title: 'Progreso por OA',
    description: 'Objetivos, evidencias observables, autonomía y nivel de logro.',
    icon: Target,
    state: 'Conectado',
    tone: 'amber',
  },
  {
    title: 'Evaluaciones',
    description: 'Instrumentos diversificados, rúbricas y retroalimentación pedagógica.',
    icon: ClipboardCheck,
    state: 'En expansión',
    tone: 'rose',
  },
  {
    title: 'Biblioteca',
    description: 'Recursos organizados por nivel, asignatura, habilidad y necesidad de apoyo.',
    icon: Library,
    state: 'En expansión',
    tone: 'cyan',
  },
  {
    title: 'Crear con IA',
    description: 'Generación guiada de materiales, actividades y apoyos accesibles.',
    icon: WandSparkles,
    state: 'En expansión',
    tone: 'violet',
  },
  {
    title: 'Profesor virtual',
    description: 'Asistente pedagógico contextual para docentes y equipos educativos.',
    icon: Bot,
    state: 'En expansión',
    tone: 'blue',
  },
  {
    title: 'Familias e informes',
    description: 'Comunicación clara, reportes de avance y participación familiar.',
    icon: MessagesSquare,
    state: 'En expansión',
    tone: 'mint',
  },
]

const assurances = [
  'Datos aislados por institución mediante RLS multitenant.',
  'Roles diferenciados para docentes, PIE, UTP, dirección y administración.',
  'Información sensible separada de los directorios generales.',
  'Seguimiento basado en evidencias reales, sin porcentajes inventados.',
]

export default function PublicPresentationPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/presentacion" className={styles.brand} aria-label="YOYOLETRASAI, inicio de presentación">
          <span className={styles.brandMark}><School size={24} /></span>
          <span>
            <strong>YOYOLETRASAI</strong>
            <small>Plataforma educativa institucional</small>
          </span>
        </Link>

        <nav className={styles.nav} aria-label="Navegación de presentación">
          <a href="#ecosistema">Ecosistema</a>
          <a href="#seguridad">Seguridad</a>
          <a href="#experiencia">Experiencia</a>
        </nav>

        <Link href="/acceso" className={styles.accessButton}>
          Ingresar <ArrowRight size={17} />
        </Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGlowOne} />
        <div className={styles.heroGlowTwo} />
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Sparkles size={16} /> Ecosistema educativo integral</span>
          <h1>Una plataforma clara, inclusiva y conectada para acompañar cada trayectoria educativa.</h1>
          <p>
            YOYOLETRASAI reúne gestión pedagógica, seguimiento por objetivos, apoyos PIE y DUA,
            recursos, evaluación e inteligencia artificial en una experiencia institucional única.
          </p>
          <div className={styles.heroActions}>
            <Link href="/acceso" className={styles.primaryButton}>
              Acceder a la plataforma <ArrowRight size={18} />
            </Link>
            <a href="#ecosistema" className={styles.secondaryButton}>
              Explorar módulos
            </a>
          </div>
          <div className={styles.trustRow}>
            <span><ShieldCheck size={17} /> Acceso por roles</span>
            <span><LockKeyhole size={17} /> Datos protegidos</span>
            <span><CheckCircle2 size={17} /> Evidencias reales</span>
          </div>
        </div>

        <div className={styles.dashboardPreview} aria-label="Vista conceptual del dashboard">
          <div className={styles.previewSidebar}>
            <span className={styles.previewLogo}>Y</span>
            {[LayoutDashboard, GraduationCap, Users, Target, BookOpen].map((Icon, index) => (
              <span key={index} className={index === 0 ? styles.previewActive : ''}><Icon size={17} /></span>
            ))}
          </div>
          <div className={styles.previewMain}>
            <div className={styles.previewHeader}>
              <div><small>Panel institucional</small><strong>Buenas tardes, equipo educativo</strong></div>
              <span className={styles.avatar}>ER</span>
            </div>
            <div className={styles.previewMetrics}>
              <article><GraduationCap /><strong>Cursos</strong><small>Gestión centralizada</small></article>
              <article><Users /><strong>Estudiantes</strong><small>Fichas protegidas</small></article>
              <article><Target /><strong>Progreso</strong><small>Evidencias por OA</small></article>
            </div>
            <div className={styles.previewContent}>
              <article className={styles.previewChart}>
                <div className={styles.previewTitle}><span>Seguimiento pedagógico</span><BarChart3 size={18} /></div>
                <div className={styles.bars}>
                  <i style={{ height: '42%' }} />
                  <i style={{ height: '70%' }} />
                  <i style={{ height: '54%' }} />
                  <i style={{ height: '82%' }} />
                  <i style={{ height: '64%' }} />
                  <i style={{ height: '91%' }} />
                </div>
              </article>
              <article className={styles.previewList}>
                <span>Acciones prioritarias</span>
                <div><CheckCircle2 size={16} /><p><strong>Registrar evidencia</strong><small>Objetivos de aprendizaje</small></p></div>
                <div><FileText size={16} /><p><strong>Preparar informe</strong><small>Seguimiento institucional</small></p></div>
                <div><BrainCircuit size={16} /><p><strong>Crear apoyo</strong><small>PIE y DUA</small></p></div>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.summaryStrip} aria-label="Resumen de capacidades">
        <article><strong>Multirrol</strong><span>Experiencias adaptadas a cada perfil</span></article>
        <article><strong>Multitenant</strong><span>Separación segura entre instituciones</span></article>
        <article><strong>Responsive</strong><span>Escritorio, tablet y celular</span></article>
        <article><strong>Inclusiva</strong><span>PIE, DUA y accesibilidad integrados</span></article>
      </section>

      <section className={styles.section} id="ecosistema">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}><LayoutDashboard size={16} /> Ecosistema modular</span>
          <h2>Todo el trabajo pedagógico organizado en un mismo lugar</h2>
          <p>Los módulos conectados utilizan información institucional real; los módulos en expansión se habilitan progresivamente sin simular datos.</p>
        </div>
        <div className={styles.moduleGrid}>
          {modules.map(({ title, description, icon: Icon, state, tone }) => (
            <article className={`${styles.moduleCard} ${styles[tone]}`} key={title}>
              <div className={styles.moduleTop}>
                <span className={styles.moduleIcon}><Icon size={22} /></span>
                <em className={state === 'Conectado' ? styles.connected : styles.expanding}>{state}</em>
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.securitySection}`} id="seguridad">
        <div className={styles.securityVisual}>
          <span className={styles.securityBadge}><ShieldCheck size={32} /></span>
          <div className={styles.securityOrbit}><LockKeyhole size={21} /></div>
          <div className={styles.securityOrbitTwo}><Users size={21} /></div>
          <div className={styles.securityOrbitThree}><School size={21} /></div>
        </div>
        <div className={styles.securityCopy}>
          <span className={styles.eyebrow}><LockKeyhole size={16} /> Seguridad desde la arquitectura</span>
          <h2>Información pedagógica protegida y acceso según responsabilidades</h2>
          <p>
            La plataforma separa la información general de los antecedentes sensibles y aplica permisos
            institucionales antes de consultar o modificar cualquier registro.
          </p>
          <div className={styles.assuranceList}>
            {assurances.map((assurance) => (
              <div key={assurance}><CheckCircle2 size={18} /><span>{assurance}</span></div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="experiencia">
        <div className={styles.sectionHeading}>
          <span className={styles.eyebrow}><Gamepad2 size={16} /> Experiencia motivadora</span>
          <h2>Profesional para los equipos, cercana para la comunidad</h2>
        </div>
        <div className={styles.experienceGrid}>
          <article>
            <span><BookOpen size={24} /></span>
            <h3>Claridad pedagógica</h3>
            <p>Jerarquía visual limpia, instrucciones comprensibles y estados vacíos útiles.</p>
          </article>
          <article>
            <span><BrainCircuit size={24} /></span>
            <h3>IA con propósito</h3>
            <p>Herramientas orientadas a planificar, adaptar y acompañar, siempre bajo revisión docente.</p>
          </article>
          <article>
            <span><HeartHandshake size={24} /></span>
            <h3>Inclusión transversal</h3>
            <p>Los apoyos PIE y DUA forman parte del flujo pedagógico, no un módulo aislado.</p>
          </article>
        </div>
      </section>

      <section className={styles.cta}>
        <div>
          <span className={styles.eyebrow}><Sparkles size={16} /> YOYOLETRASAI</span>
          <h2>Una base sólida para crecer desde el aula hasta la gestión institucional.</h2>
          <p>La presentación pública no contiene datos reales. El acceso institucional requiere autenticación y permisos.</p>
        </div>
        <Link href="/acceso" className={styles.primaryButton}>
          Ir al acceso seguro <ArrowRight size={18} />
        </Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><School size={22} /></span>
          <span><strong>YOYOLETRASAI</strong><small>Educación, inclusión e innovación</small></span>
        </div>
        <p>Vista pública de presentación. Sin información institucional ni datos personales.</p>
      </footer>
    </main>
  )
}
