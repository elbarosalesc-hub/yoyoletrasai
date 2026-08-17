'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import {
  Accessibility,
  ArrowLeft,
  BarChart3,
  BookOpen,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ClipboardList,
  Cloud,
  FileText,
  FlaskConical,
  Gamepad2,
  Grid3X3,
  Home,
  Images,
  Library,
  PenTool,
  Radar,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  UsersRound,
  WandSparkles,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

type ModuleItem = {
  label: string
  href: string
  description: string
  icon: LucideIcon
  badge?: string
}

type ModuleGroup = {
  id: 'control' | 'recursos' | 'experiencias' | 'ia'
  eyebrow: string
  title: string
  description: string
  items: ModuleItem[]
}

const groups: ModuleGroup[] = [
  {
    id: 'control',
    eyebrow: 'CENTRO DE CONTROL',
    title: 'Gestión, seguimiento y comunidad',
    description: 'Accesos institucionales para organizar cursos, estudiantes, evaluación, evidencias y progreso curricular.',
    items: [
      { label: 'Cursos y estudiantes', href: '/cursos', description: 'Organización de cursos, grupos y perfiles.', icon: BookOpen },
      { label: 'Seguimiento', href: '/seguimiento', description: 'Continuidad del aprendizaje, apoyos y trayectoria.', icon: Users },
      { label: 'Evidencias', href: '/seguimiento/evidencias', description: 'Registro y revisión de evidencias pedagógicas.', icon: ClipboardList },
      { label: 'Evaluaciones', href: '/evaluaciones', description: 'Instrumentos, rúbricas, aplicación y resultados.', icon: CheckCircle2 },
      { label: 'Progreso por OA', href: '/progreso', description: 'Progreso curricular por objetivo de aprendizaje y curso.', icon: BarChart3 },
      { label: 'Familias', href: '/familias', description: 'Comunicación, orientaciones y acompañamiento familiar.', icon: UsersRound },
      { label: 'Informes', href: '/informes', description: 'Informes pedagógicos, síntesis y exportaciones.', icon: FileText },
      { label: 'Estado del sistema', href: '/estado', description: 'Estado operativo y verificaciones de la plataforma.', icon: ShieldCheck },
      { label: 'QA y publicación', href: '/qa', description: 'Control de calidad previo a publicación.', icon: ShieldCheck },
      { label: 'Evolución YOYO', href: '/evolucion', description: 'Auditoría, calidad, benchmark y mejoras para propietaria.', icon: Radar, badge: 'Propietaria' },
      { label: 'Configuración', href: '/configuracion', description: 'Perfil, apariencia, permisos y configuración general.', icon: Settings, badge: 'Propietaria' },
    ],
  },
  {
    id: 'recursos',
    eyebrow: 'RECURSOS',
    title: 'Biblioteca y materiales pedagógicos',
    description: 'Recursos curriculares, lectura, caligrafía, apoyos visuales y materiales multimodales.',
    items: [
      { label: 'Biblioteca Premium', href: '/biblioteca', description: 'Recursos guardados, premium, adaptables e imprimibles.', icon: Library, badge: '15 recursos premium' },
      { label: 'Centros Premium', href: '/centros', description: 'Centros pedagógicos integrados y recursos especializados.', icon: Sparkles },
      { label: 'Plan Lector', href: '/plan-lector', description: 'Lecturas, comprensión, seguimiento y rutas lectoras.', icon: BookOpenCheck },
      { label: 'Caligrafía', href: '/caligrafia', description: 'Imprenta, manuscrita, direccionalidad y progresión.', icon: PenTool },
      { label: 'PIE, DUA y apoyos visuales', href: '/inclusion', description: 'Adaptaciones, pictogramas, accesibilidad y diferenciación.', icon: Accessibility },
      { label: 'Multimedia', href: '/multimedia', description: 'Imágenes, audio, video y materiales multimodales.', icon: Images },
    ],
  },
  {
    id: 'experiencias',
    eyebrow: 'EXPERIENCIAS',
    title: 'Aprender haciendo, jugando y explorando',
    description: 'Experiencias interactivas que mantienen objetivos pedagógicos, progresión y alternativas accesibles.',
    items: [
      { label: 'Juegos 3D', href: '/juegos', description: 'Bosque de las inferencias, Feria matemática y catálogo de mundos.', icon: Gamepad2, badge: '2 jugables · 10 en desarrollo' },
      { label: 'Simuladores', href: '/simuladores', description: 'Aprendizaje interactivo y práctica contextualizada.', icon: FlaskConical },
      { label: 'Centros Premium', href: '/centros', description: 'Experiencias pedagógicas organizadas por propósito.', icon: Sparkles },
      { label: 'Plan Lector', href: '/plan-lector', description: 'Experiencias lectoras con comprensión y seguimiento.', icon: BookOpenCheck },
    ],
  },
  {
    id: 'ia',
    eyebrow: 'IA Y HERRAMIENTAS',
    title: 'YOYO IA y utilidades docentes',
    description: 'Creación, adaptación, acompañamiento y herramientas para trabajar sin salir de la plataforma.',
    items: [
      { label: 'Crear con YOYO IA', href: '/crear', description: 'Genera, adapta y regenera recursos pedagógicos por secciones.', icon: WandSparkles, badge: 'Generador real' },
      { label: 'Profesor Virtual', href: '/profesor-virtual', description: 'Asistencia pedagógica contextual y acompañamiento docente.', icon: Bot },
      { label: 'Herramientas', href: '/herramientas', description: 'Utilidades para planificar, adaptar, evaluar y enseñar.', icon: Wrench },
      { label: 'Apoyos PIE y DUA', href: '/inclusion', description: 'Accesibilidad, apoyos y adaptaciones dentro del flujo docente.', icon: Accessibility },
      { label: 'Integraciones', href: '/integraciones', description: 'Conexiones con servicios educativos y almacenamiento.', icon: Cloud },
      { label: 'Multimedia', href: '/multimedia', description: 'Recursos visuales y multimodales para clases y materiales.', icon: Images },
    ],
  },
]

const allItems = groups.flatMap((group) => group.items.map((item) => ({ ...item, group: group.title })))

export default function ReferenceBasePage() {
  const [query, setQuery] = useState('')
  const normalized = query.trim().toLowerCase()
  const results = useMemo(() => {
    if (!normalized) return []
    return allItems
      .filter((item) => `${item.label} ${item.description} ${item.group}`.toLowerCase().includes(normalized))
      .filter((item, index, list) => list.findIndex((candidate) => candidate.href === item.href && candidate.label === item.label) === index)
      .slice(0, 10)
  }, [normalized])

  const goBack = () => {
    if (window.history.length > 1) window.history.back()
    else window.location.href = '/app'
  }

  return (
    <main className="reference-base-page">
      <div className="reference-base-shell">
        <section className="reference-base-top">
          <div className="reference-title-row">
            <button type="button" onClick={goBack} className="reference-back" aria-label="Volver"><ArrowLeft size={30}/></button>
            <h1>YoYoLetrasAI</h1>
            <span aria-hidden="true" />
          </div>

          <div className="reference-account-row">
            <span className="reference-logo">Y</span>
            <strong>YoYoLetrasAI</strong>
            <Link href="/configuracion" className="reference-owner-pill">Propietaria</Link>
          </div>

          <div className="reference-search-wrap">
            <label className="reference-search" aria-label="Buscar en toda la plataforma">
              <Search size={29}/>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar en toda la plataforma..."
                autoComplete="off"
              />
            </label>
            {normalized && (
              <div className="reference-search-results" role="listbox" aria-label="Resultados de búsqueda">
                {results.length ? results.map((item) => {
                  const Icon = item.icon
                  return <Link key={`${item.label}-${item.href}`} href={item.href} className="reference-search-result">
                    <span><Icon size={18}/></span>
                    <div><strong>{item.label}</strong><small>{item.description}</small></div>
                  </Link>
                }) : <div className="reference-search-empty">No encontramos módulos con “{query}”.</div>}
              </div>
            )}
          </div>
        </section>

        <section className="reference-hero">
          <div className="reference-hero-frame">
            <img src="/yoyo-hero-preserved.webp" alt="Tres estudiantes alrededor de un libro mágico con letras flotantes" />
          </div>
        </section>

        <section className="reference-control" id="inicio">
          <span className="reference-kicker">CENTRO DE CONTROL</span>
          <h2>Lo importante, antes que lo urgente</h2>
          <p>La misma base visual, ahora conectada con los módulos, recursos, experiencias y herramientas reales de YoYoLetrasAI.</p>
          <div className="reference-summary-row">
            <span><b>24+</b> accesos reales</span>
            <span><b>15</b> recursos premium</span>
            <span><b>2</b> juegos 3D jugables</span>
            <span><b>YOYO IA</b> integrada</span>
          </div>
        </section>

        <div className="reference-module-area">
          {groups.map((group) => (
            <section key={group.id} className="reference-module-section" id={group.id}>
              <div className="reference-module-heading">
                <span className="reference-kicker">{group.eyebrow}</span>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
              </div>
              <div className="reference-module-grid">
                {group.items.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link href={item.href} className="reference-module-card" key={`${group.id}-${item.label}-${item.href}`}>
                      <div className="reference-module-top">
                        <span className="reference-module-icon"><Icon size={22}/></span>
                        {item.badge && <small className="reference-module-badge">{item.badge}</small>}
                      </div>
                      <div>
                        <strong>{item.label}</strong>
                        <p>{item.description}</p>
                      </div>
                      <span className="reference-open-label">Abrir módulo →</span>
                    </Link>
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      </div>

      <nav className="reference-bottom-nav" aria-label="Navegación principal">
        <a href="#control"><Home/><span>Centro de control</span></a>
        <a href="#recursos"><Grid3X3/><span>Recursos</span></a>
        <a href="#experiencias"><Gamepad2/><span>Experiencias</span></a>
        <a href="#ia"><Sparkles/><span>IA y herramientas</span></a>
      </nav>
    </main>
  )
}
