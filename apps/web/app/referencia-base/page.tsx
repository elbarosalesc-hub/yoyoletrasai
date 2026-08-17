import Link from 'next/link'
import { ArrowLeft, Home, Grid3X3, Diamond, Shapes, Sparkles, Library, Gamepad2, WandSparkles, Search } from 'lucide-react'

export default function ReferenceBasePage() {
  return (
    <main className="reference-base-page">
      <div className="reference-base-shell">
        <section className="reference-base-top">
          <div className="reference-title-row">
            <Link href="/app" className="reference-back" aria-label="Volver"><ArrowLeft size={30}/></Link>
            <h1>YoYoLetrasAI</h1>
            <span aria-hidden="true" />
          </div>

          <div className="reference-account-row">
            <span className="reference-logo">Y</span>
            <strong>YoYoLetrasAI</strong>
            <span className="reference-owner-pill">Propietaria</span>
          </div>

          <div className="reference-search" role="search" aria-label="Buscar en toda la plataforma">
            <Search size={30}/>
            <span>Buscar en toda la plataforma...</span>
          </div>
        </section>

        <section className="reference-hero">
          <div className="reference-hero-frame">
            <img src="/yoyo-hero-preserved.webp" alt="Tres estudiantes alrededor de un libro mágico con letras flotantes" />
          </div>
        </section>

        <section className="reference-control">
          <span className="reference-kicker">CENTRO DE CONTROL</span>
          <h2>Lo importante, antes que lo urgente</h2>
          <p>Una vista clara para entrar rápido a recursos, experiencias y herramientas sin perder el foco pedagógico ni la identidad visual de YoYoLetrasAI.</p>
        </section>

        <section className="reference-priorities">
          <h3>Acciones principales</h3>
          <div className="reference-action-grid">
            <Link href="/biblioteca" className="reference-action"><span><Library size={22}/></span><div><strong>Recursos</strong><small>Biblioteca, actividades y materiales curriculares.</small></div></Link>
            <Link href="/juegos" className="reference-action"><span><Gamepad2 size={22}/></span><div><strong>Experiencias</strong><small>Juegos, simuladores y aprendizaje interactivo.</small></div></Link>
            <Link href="/crear" className="reference-action"><span><WandSparkles size={22}/></span><div><strong>Crear con YOYO IA</strong><small>Diseña, adapta y mejora recursos sin salir del flujo.</small></div></Link>
            <Link href="/inclusion" className="reference-action"><span><Sparkles size={22}/></span><div><strong>PIE y DUA</strong><small>Apoyos y adaptaciones integrados al trabajo docente.</small></div></Link>
          </div>
        </section>
      </div>

      <nav className="reference-bottom-nav" aria-label="Navegación principal de referencia">
        <Link href="/referencia-base"><Home/><span>Centro de control</span></Link>
        <Link href="/biblioteca"><Grid3X3/><span>Recursos</span></Link>
        <Link href="/juegos"><Diamond/><span>Experiencias</span></Link>
        <Link href="/crear"><Shapes/><span>IA y herramientas</span></Link>
      </nav>
    </main>
  )
}
