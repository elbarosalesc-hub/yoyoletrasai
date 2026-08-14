import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  CalendarDays,
  ClipboardCheck,
  FileText,
  Gamepad2,
  Gauge,
  Grid3X3,
  HeartHandshake,
  Image,
  PenTool,
  Shapes,
  Sparkles,
  WandSparkles,
  FileSearch,
  Languages,
  MessageSquareText,
  ListChecks,
  ScanText,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'

const tools = [
  { title: 'Centros Premium', description: 'MathLab, Ciencia Viva, caligrafía, grafomotricidad, pictogramas con fotografía real y Plan Lector.', icon: Shapes, href: '/centros-premium', status: 'Premium', featured: true },
  { title: 'Profesor Virtual', description: 'Planifica, adapta, evalúa, analiza y comunica con contexto institucional.', icon: BrainCircuit, href: '/profesor-virtual', status: 'Interactivo', featured: true },
  { title: 'Centro de Aula', description: 'Temporizador, selector equitativo, grupos, calificaciones y velocidad lectora.', icon: Gauge, href: '/herramientas/aula', status: 'Nuevo', featured: true },
  { title: 'Planificador semanal', description: 'Organiza OA, actividades, apoyos y evaluaciones en una semana editable.', icon: CalendarDays, href: '/planificador', status: 'Nuevo', featured: true },
  { title: 'Estudio de creación', description: 'Genera guías, evaluaciones y rúbricas editables con apoyos DUA y PIE.', icon: WandSparkles, href: '/crear', status: 'Operativo', featured: true },
  { title: 'Caligrafía completa', description: 'Imprenta y manuscrita, mayúscula y minúscula, pauta, direccionalidad, lateralidad y progresión desde trazos hasta frases.', icon: PenTool, href: '/caligrafia', status: 'Ampliado', featured: true },
  { title: 'Investigador de fuentes oficiales', description: 'Busca y contrasta evidencia oficial y académica verificable antes de usarla en recursos o informes.', icon: FileSearch, href: '/investigacion', status: 'YOYO IA' },
  { title: 'Analizador de documentos', description: 'Resume, extrae ideas, identifica evidencias y organiza información de archivos cargados.', icon: ScanText, href: '/fuentes-ia', status: 'YOYO IA' },
  { title: 'Asistente de redacción', description: 'Redacta, corrige, simplifica o adapta textos sin perder propósito pedagógico.', icon: MessageSquareText, href: '/yoyo-ia', status: 'YOYO IA' },
  { title: 'Constructor de evaluaciones', description: 'Diseña instrumentos, variantes diversificadas, puntajes y rúbricas.', icon: ClipboardCheck, href: '/evaluaciones', status: 'Conectado' },
  { title: 'Generador de listas de cotejo', description: 'Crea indicadores observables, criterios claros y registros rápidos alineados al objetivo.', icon: ListChecks, href: '/evaluaciones', status: 'Integrado' },
  { title: 'Biblioteca pedagógica', description: 'Busca, previsualiza, adapta y asigna recursos a cursos.', icon: BookOpenCheck, href: '/biblioteca', status: 'Interactivo' },
  { title: 'Seguimiento por evidencias', description: 'Registra desempeño, apoyos utilizados, autonomía y nivel de logro.', icon: BarChart3, href: '/seguimiento/evidencias', status: 'Conectado' },
  { title: 'Inclusión y perfiles de apoyo', description: 'Organiza fortalezas, barreras, adecuaciones y responsables.', icon: HeartHandshake, href: '/inclusion', status: 'Operativo' },
  { title: 'Manipulativos matemáticos', description: 'Base diez, fracciones, valor posicional y representaciones visuales.', icon: Shapes, href: '/centros-premium', status: 'Integrado' },
  { title: 'Pictogramas y apoyos visuales', description: 'Fotografías reales, rutinas, secuencias y comunicación visual.', icon: Image, href: '/pictogramas', status: 'Integrado' },
  { title: 'Generador de fichas', description: 'Transforma una idea en actividades digitales, imprimibles y editables.', icon: Grid3X3, href: '/crear', status: 'Operativo' },
  { title: 'Juegos educativos', description: 'Actividades motivadoras con objetivos y retroalimentación inmediata.', icon: Gamepad2, href: '/juegos', status: 'Interactivo' },
  { title: 'Informes pedagógicos', description: 'Plantillas para avances, familia, PIE y seguimiento institucional.', icon: FileText, href: '/informes', status: 'Operativo' },
  { title: 'Adaptador de lenguaje', description: 'Transforma textos a lenguaje claro, lectura accesible y apoyos visuales manteniendo el objetivo.', icon: Languages, href: '/inclusion', status: 'DUA' },
]

export default function HerramientasPage() {
  return (
    <AppShell active="Herramientas">
      <div className="tools-command-page">
        <section className="premium-hero tools-command-hero">
          <div>
            <span className="eyebrow"><Sparkles size={15} /> Laboratorio docente conectado</span>
            <h1>De una necesidad pedagógica a una acción lista para aplicar.</h1>
            <p>Crea una vez y transforma el contenido en planificación, recurso, evaluación, adaptación, investigación, juego, evidencia y material de escritura.</p>
          </div>
          <Link href="/centros-premium" className="btn btn-primary"><Shapes size={18} /> Abrir Centros Premium</Link>
        </section>

        <section className="tools-flow-strip" aria-label="Flujo de trabajo docente">
          <span><b>1</b> Detectar necesidad</span><ArrowRight /><span><b>2</b> Investigar y planificar</span><ArrowRight /><span><b>3</b> Crear y adaptar</span><ArrowRight /><span><b>4</b> Evaluar y registrar</span>
        </section>

        <section className="tools-featured-grid">
          {tools.filter((tool) => tool.featured).map(({ title, description, icon: Icon, href, status }) => (
            <Link href={href} className="tools-featured-card" key={title}>
              <span className="tools-featured-icon"><Icon /></span>
              <em>{status}</em>
              <h2>{title}</h2>
              <p>{description}</p>
              <strong>Abrir herramienta <ArrowRight size={17} /></strong>
            </Link>
          ))}
        </section>

        <div className="module-grid tools-grid tools-expanded-grid">
          {tools.filter((tool) => !tool.featured).map(({ title, description, icon: Icon, href, status }) => (
            <article className="module-card" key={title}>
              <div className="tool-card-top"><span><Icon size={27} /></span><em>{status}</em></div>
              <h3>{title}</h3>
              <p>{description}</p>
              <Link className="btn btn-soft" href={href}>Abrir <ArrowRight size={15} /></Link>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
