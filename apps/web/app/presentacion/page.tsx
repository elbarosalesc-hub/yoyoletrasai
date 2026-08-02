import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Activity,
  ArrowRight,
  BarChart3,
  BellRing,
  BookOpen,
  Bot,
  BrainCircuit,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  Gamepad2,
  GraduationCap,
  HeartHandshake,
  Layers3,
  Library,
  LineChart,
  LockKeyhole,
  MessagesSquare,
  Network,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  WandSparkles,
} from 'lucide-react'
import styles from './presentacion.module.css'

export const metadata: Metadata = {
  title: 'YOYOLETRASAI | Ecosistema educativo inteligente',
  description: 'Plataforma educativa integral para gestión pedagógica, inclusión, evaluación y acompañamiento institucional.',
}

const modules = [
  { title: 'Cursos y grupos', description: 'Matrículas, niveles y organización institucional.', icon: GraduationCap, state: 'Operativo', tone: 'violet' },
  { title: 'Estudiantes', description: 'Directorio, fichas y trayectoria educativa.', icon: Users, state: 'Operativo', tone: 'blue' },
  { title: 'PIE y DUA', description: 'Fortalezas, barreras, apoyos y adecuaciones.', icon: HeartHandshake, state: 'Operativo', tone: 'mint' },
  { title: 'Progreso por OA', description: 'Evidencias, autonomía y niveles de logro.', icon: Target, state: 'Operativo', tone: 'amber' },
  { title: 'Evaluaciones', description: 'Instrumentos, rúbricas y versiones diversificadas.', icon: ClipboardCheck, state: 'Conectando', tone: 'rose' },
  { title: 'Biblioteca', description: 'Recursos por nivel, habilidad y necesidad de apoyo.', icon: Library, state: 'Conectando', tone: 'cyan' },
  { title: 'Crear con IA', description: 'Materiales pedagógicos editables y accesibles.', icon: WandSparkles, state: 'Conectando', tone: 'violet' },
  { title: 'Profesor virtual', description: 'Asistencia pedagógica contextual para docentes.', icon: Bot, state: 'Conectando', tone: 'blue' },
  { title: 'Familias e informes', description: 'Comunicación y reportes de avance claros.', icon: MessagesSquare, state: 'Conectando', tone: 'mint' },
]

const assurances = [
  'Aislamiento de información por institución.',
  'Roles diferenciados y permisos verificables.',
  'Datos sensibles separados del directorio general.',
  'Seguimiento basado en evidencias pedagógicas reales.',
]

export default function PublicPresentationPage() {
  return (
    <main className={styles.page}>
      <header className={styles.topbar}>
        <Link href="/" className={styles.brand} aria-label="YOYOLETRASAI, inicio">
          <span className={styles.brandMark}><School size={22} /></span>
          <span><strong>YOYOLETRASAI</strong><small>Ecosistema educativo inteligente</small></span>
        </Link>
        <nav className={styles.nav} aria-label="Navegación principal">
          <a href="#ecosistema">Ecosistema</a>
          <a href="#experiencia">Experiencia</a>
          <a href="#seguridad">Seguridad</a>
        </nav>
        <Link href="/acceso" className={styles.accessButton}>Ingresar <ArrowRight size={17} /></Link>
      </header>

      <section className={styles.hero}>
        <div className={styles.heroGrid} />
        <div className={styles.heroAuraOne} />
        <div className={styles.heroAuraTwo} />
        <div className={styles.heroCopy}>
          <span className={styles.eyebrow}><Sparkles size={15} /> Plataforma educativa nacional</span>
          <h1>El centro de operaciones para una educación más <em>humana, inclusiva e inteligente.</em></h1>
          <p>Una experiencia única para planificar, acompañar, evaluar y tomar decisiones con información pedagógica conectada.</p>
          <div className={styles.heroActions}>
            <Link href="/acceso" className={styles.primaryButton}>Entrar a la plataforma <ArrowRight size={18} /></Link>
            <a href="#ecosistema" className={styles.secondaryButton}>Explorar el ecosistema</a>
          </div>
          <div className={styles.trustRow}>
            <span><ShieldCheck size={16} /> Seguridad multitenant</span>
            <span><HeartHandshake size={16} /> Inclusión integrada</span>
            <span><BrainCircuit size={16} /> IA bajo criterio docente</span>
          </div>
        </div>

        <div className={styles.productStage} aria-label="Vista conceptual del panel institucional">
          <div className={styles.stageGlow} />
          <div className={styles.productWindow}>
            <div className={styles.windowBar}><span /><span /><span /><small>Panel institucional · Colegio Coyam</small></div>
            <div className={styles.productBody}>
              <aside className={styles.productSidebar}>
                <span className={styles.productLogo}>YO</span>
                {[Layers3, GraduationCap, Users, Target, BookOpen, BarChart3].map((Icon, index) => (
                  <i key={index} className={index === 0 ? styles.productActive : ''}><Icon size={17} /></i>
                ))}
              </aside>
              <div className={styles.productMain}>
                <div className={styles.productHeader}>
                  <div><small>Resumen del día</small><strong>Buenas tardes, equipo PIE</strong></div>
                  <div className={styles.headerTools}><BellRing size={17} /><span>ER</span></div>
                </div>
                <div className={styles.productMetrics}>
                  <article><span><GraduationCap size={19} /></span><div><b>12</b><small>Cursos activos</small></div><em>+2</em></article>
                  <article><span><Users size={19} /></span><div><b>384</b><small>Estudiantes</small></div><em>100%</em></article>
                  <article><span><Target size={19} /></span><div><b>76%</b><small>OA con evidencia</small></div><em>+8%</em></article>
                </div>
                <div className={styles.productGrid}>
                  <article className={styles.analyticsCard}>
                    <div className={styles.cardTitle}><span><LineChart size={17} /> Progreso institucional</span><small>Últimos 6 meses</small></div>
                    <div className={styles.chartArea}>
                      <svg viewBox="0 0 520 210" aria-hidden="true">
                        <defs><linearGradient id="areaPremium" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#8d7cff" stopOpacity=".42"/><stop offset="1" stopColor="#8d7cff" stopOpacity="0"/></linearGradient></defs>
                        <g stroke="rgba(255,255,255,.08)"><path d="M20 35H500"/><path d="M20 85H500"/><path d="M20 135H500"/><path d="M20 185H500"/></g>
                        <path d="M20 165 C90 155 110 125 175 137 S270 96 330 112 S420 58 500 62 L500 190 L20 190Z" fill="url(#areaPremium)"/>
                        <path d="M20 165 C90 155 110 125 175 137 S270 96 330 112 S420 58 500 62" fill="none" stroke="#9b8cff" strokeWidth="4" strokeLinecap="round"/>
                      </svg>
                    </div>
                    <div className={styles.chartLegend}><span><i /> Lenguaje</span><span><i /> Matemática</span><span><i /> Ciencias</span></div>
                  </article>
                  <article className={styles.priorityCard}>
                    <div className={styles.cardTitle}><span><Activity size={17} /> Prioridades</span><small>Hoy</small></div>
                    <div className={styles.priorityList}>
                      <div><span className={styles.priorityViolet}><ClipboardCheck size={16} /></span><p><b>Registrar evidencias</b><small>8 estudiantes pendientes</small></p><ChevronRight size={15} /></div>
                      <div><span className={styles.priorityMint}><HeartHandshake size={16} /></span><p><b>Revisar apoyos PIE</b><small>3 fichas actualizadas</small></p><ChevronRight size={15} /></div>
                      <div><span className={styles.priorityAmber}><FileText size={16} /></span><p><b>Preparar informes</b><small>Cierre mensual</small></p><ChevronRight size={15} /></div>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles.floatingCard} ${styles.floatingOne}`}><CheckCircle2 size={18} /><span><b>Seguimiento actualizado</b><small>Datos sincronizados</small></span></div>
          <div className={`${styles.floatingCard} ${styles.floatingTwo}`}><BrainCircuit size={18} /><span><b>Apoyo sugerido</b><small>IA con revisión docente</small></span></div>
        </div>
      </section>

      <section className={styles.signalStrip} aria-label="Capacidades principales">
        <article><Network /><div><strong>Multitenant</strong><span>Una plataforma, múltiples instituciones</span></div></article>
        <article><ShieldCheck /><div><strong>Segura</strong><span>Acceso por rol y contexto</span></div></article>
        <article><HeartHandshake /><div><strong>Inclusiva</strong><span>PIE y DUA en el flujo real</span></div></article>
        <article><Sparkles /><div><strong>Inteligente</strong><span>IA al servicio de la pedagogía</span></div></article>
      </section>

      <section className={styles.ecosystemSection} id="ecosistema">
        <div className={styles.sectionIntro}>
          <span className={styles.eyebrowDark}><Layers3 size={15} /> Ecosistema conectado</span>
          <h2>De la planificación a la evidencia, todo ocurre en un mismo sistema.</h2>
          <p>Cada módulo comparte contexto institucional y evita duplicar información, pasos o esfuerzos.</p>
        </div>
        <div className={styles.bentoGrid}>
          <article className={styles.bentoFeature}>
            <div><span className={styles.bentoIcon}><BrainCircuit /></span><small>Inteligencia pedagógica</small><h3>Decisiones más claras, sin perder el criterio profesional.</h3><p>La plataforma organiza información, propone apoyos y facilita la preparación de materiales bajo revisión docente.</p></div>
            <div className={styles.insightPanel}><span>Análisis de trayectoria</span><strong>Fortalezas detectadas</strong><div><i style={{width:'88%'}}/><i style={{width:'72%'}}/><i style={{width:'56%'}}/></div><small>Basado en evidencias registradas</small></div>
          </article>
          {modules.map(({ title, description, icon: Icon, state, tone }) => (
            <article className={`${styles.moduleCard} ${styles[tone]}`} key={title}>
              <div className={styles.moduleTop}><span><Icon size={21} /></span><em>{state}</em></div>
              <h3>{title}</h3><p>{description}</p><Link href="/acceso" aria-label={`Ingresar a ${title}`}><ArrowRight size={17} /></Link>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.experienceSection} id="experiencia">
        <div className={styles.experienceCopy}>
          <span className={styles.eyebrowDark}><Gamepad2 size={15} /> Una experiencia que acompaña</span>
          <h2>Menos complejidad administrativa. Más tiempo para enseñar.</h2>
          <p>Diseñada para que cada acción importante sea visible, comprensible y recuperable.</p>
          <div className={styles.experienceList}>
            <div><span>01</span><p><b>Flujos guiados</b><small>La interfaz anticipa el siguiente paso y reduce errores.</small></p></div>
            <div><span>02</span><p><b>Información significativa</b><small>Indicadores vinculados a decisiones pedagógicas reales.</small></p></div>
            <div><span>03</span><p><b>Accesibilidad transversal</b><small>Diseño responsive, teclado, foco visible y lenguaje claro.</small></p></div>
          </div>
        </div>
        <div className={styles.mobileStage}>
          <div className={styles.phoneOne}><div className={styles.phoneNotch}/><small>Mi jornada</small><h3>Hola, Elba 👋</h3><div className={styles.phoneMetric}><Target/><span><b>8 evidencias</b><small>registradas esta semana</small></span></div><div className={styles.phoneTasks}><i/><i/><i/></div></div>
          <div className={styles.phoneTwo}><div className={styles.phoneNotch}/><small>Estudiante</small><h3>Valentina D.</h3><div className={styles.studentAvatar}>VD</div><div className={styles.studentBars}><i/><i/><i/></div><button>Ver trayectoria</button></div>
        </div>
      </section>

      <section className={styles.securitySection} id="seguridad">
        <div className={styles.securityVisual}>
          <div className={styles.securityCore}><ShieldCheck size={38}/><span>Acceso protegido</span></div>
          <span className={styles.orbitOne}><LockKeyhole/></span><span className={styles.orbitTwo}><Users/></span><span className={styles.orbitThree}><School/></span><span className={styles.orbitFour}><Network/></span>
        </div>
        <div className={styles.securityCopy}>
          <span className={styles.eyebrow}><LockKeyhole size={15} /> Seguridad desde la arquitectura</span>
          <h2>La información correcta, para la persona correcta, en la institución correcta.</h2>
          <p>La seguridad no se añade al final. Forma parte de cada consulta, formulario y módulo.</p>
          <div className={styles.assuranceList}>{assurances.map((item)=><div key={item}><CheckCircle2 size={18}/><span>{item}</span></div>)}</div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <div><span className={styles.eyebrowDark}><Sparkles size={15}/> YOYOLETRASAI 2026</span><h2>Una plataforma preparada para crecer junto a cada comunidad educativa.</h2><p>La vista pública no contiene información personal. El acceso institucional requiere autenticación y permisos.</p></div>
        <Link href="/acceso" className={styles.primaryButton}>Ingresar de forma segura <ArrowRight size={18}/></Link>
      </section>

      <footer className={styles.footer}>
        <div className={styles.brand}><span className={styles.brandMark}><School size={21}/></span><span><strong>YOYOLETRASAI</strong><small>Educación, inclusión e innovación</small></span></div>
        <div className={styles.footerLinks}><a href="#ecosistema">Ecosistema</a><a href="#seguridad">Seguridad</a><Link href="/estado">Estado</Link></div>
        <p>Vista pública · Sin datos personales</p>
      </footer>
    </main>
  )
}
