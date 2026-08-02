import Link from 'next/link'
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  BrainCircuit,
  ClipboardCheck,
  FileText,
  Gamepad2,
  Grid3X3,
  HeartHandshake,
  Image,
  PenTool,
  Shapes,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { AppShell } from '@/components/AppShell'

const tools = [
  { title: 'Profesor Virtual', description: 'Planifica, adapta, evalúa, analiza y comunica con contexto institucional.', icon: BrainCircuit, href: '/profesor-virtual', status: 'Nuevo', featured: true },
  { title: 'Estudio de creación', description: 'Genera guías, evaluaciones y rúbricas editables con apoyos DUA y PIE.', icon: WandSparkles, href: '/crear', status: 'Operativo', featured: true },
  { title: 'Constructor de evaluaciones', description: 'Diseña instrumentos, variantes diversificadas, puntajes y rúbricas.', icon: ClipboardCheck, href: '/evaluaciones', status: 'Conectado' },
  { title: 'Biblioteca pedagógica', description: 'Busca, previsualiza, adapta y asigna recursos a cursos.', icon: BookOpenCheck, href: '/biblioteca', status: 'Interactivo' },
  { title: 'Seguimiento por evidencias', description: 'Registra desempeño, apoyos utilizados, autonomía y nivel de logro.', icon: BarChart3, href: '/seguimiento/evidencias', status: 'Conectado' },
  { title: 'Inclusión y perfiles de apoyo', description: 'Organiza fortalezas, barreras, adecuaciones y responsables.', icon: HeartHandshake, href: '/inclusion', status: 'Operativo' },
  { title: 'Caligrafía y grafomotricidad', description: 'Crea trazos, palabras, pautas y actividades listas para imprimir.', icon: PenTool, href: '/caligrafia', status: 'Operativo' },
  { title: 'Manipulativos matemáticos', description: 'Base diez, fracciones, dinero, geometría y representaciones visuales.', icon: Shapes, href: '/manipulativos', status: 'Operativo' },
  { title: 'Pictogramas y apoyos visuales', description: 'Rutinas, secuencias, tableros y comunicación visual.', icon: Image, href: '/inclusion', status: 'Operativo' },
  { title: 'Generador de fichas', description: 'Transforma una idea en actividades digitales, imprimibles y editables.', icon: Grid3X3, href: '/crear', status: 'Operativo' },
  { title: 'Juegos educativos', description: 'Actividades motivadoras con objetivos y retroalimentación inmediata.', icon: Gamepad2, href: '/juegos', status: 'Interactivo' },
  { title: 'Informes pedagógicos', description: 'Plantillas para avances, familia, PIE y seguimiento institucional.', icon: FileText, href: '/informes', status: 'Operativo' },
]

export default function HerramientasPage() {
  return (
    <AppShell active="Herramientas docentes">
      <div className="tools-command-page">
        <section className="premium-hero tools-command-hero">
          <div>
            <span className="eyebrow"><Sparkles size={15} /> Laboratorio docente conectado</span>
            <h1>De una necesidad pedagógica a una acción lista para aplicar.</h1>
            <p>Crea una vez y transforma el contenido en planificación, recurso, evaluación, adaptación, juego y evidencia de aprendizaje.</p>
          </div>
          <Link href="/profesor-virtual" className="btn btn-primary"><BrainCircuit size={18} /> Consultar al Profesor Virtual</Link>
        </section>

        <section className="tools-flow-strip" aria-label="Flujo de trabajo docente">
          <span><b>1</b> Detectar necesidad</span><ArrowRight /><span><b>2</b> Diseñar apoyo</span><ArrowRight /><span><b>3</b> Aplicar recurso</span><ArrowRight /><span><b>4</b> Registrar evidencia</span>
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
