'use client'

import Link from 'next/link'
import { useMemo, useState, useTransition } from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  FileText,
  HeartHandshake,
  History,
  MessageSquareText,
  Send,
  Sparkles,
  WandSparkles,
} from 'lucide-react'
import { generateVirtualTeacherResponse, type TeacherMode, type VirtualTeacherResult } from './actions'

type HistoryItem = VirtualTeacherResult & { id: string; mode: TeacherMode }

const modes: Array<{ id: TeacherMode; label: string; description: string; icon: typeof Bot }> = [
  { id: 'planificar', label: 'Planificar', description: 'Clases y secuencias', icon: BookOpen },
  { id: 'adaptar', label: 'Adaptar', description: 'DUA y apoyos PIE', icon: HeartHandshake },
  { id: 'evaluar', label: 'Evaluar', description: 'Instrumentos diversos', icon: ClipboardCheck },
  { id: 'analizar', label: 'Analizar', description: 'Evidencias y decisiones', icon: BarChart3 },
  { id: 'comunicar', label: 'Comunicar', description: 'Familias e informes', icon: MessageSquareText },
]

const suggestions: Record<TeacherMode, string[]> = {
  planificar: ['Planifica una clase sobre inferencias usando un cuento breve.', 'Crea una secuencia de tres clases para valor posicional.'],
  adaptar: ['Adapta una guía para un estudiante con lectura silábica.', 'Diversifica una actividad para TDAH y TEA.'],
  evaluar: ['Prepara una evaluación breve con rúbrica y versión DIL.', 'Crea un ticket de salida para verificar comprensión.'],
  analizar: ['Propón decisiones a partir de resultados con tres niveles de logro.', 'Diseña un plan de refuerzo para baja comprensión lectora.'],
  comunicar: ['Redacta una comunicación positiva para la familia.', 'Organiza acuerdos de una entrevista de seguimiento.'],
}

export function VirtualTeacherClient({ organization, displayName }: { organization: string; displayName: string }) {
  const [mode, setMode] = useState<TeacherMode>('planificar')
  const [prompt, setPrompt] = useState('Planifica una clase para fortalecer la justificación de inferencias a partir de pistas del texto.')
  const [level, setLevel] = useState('3.º básico')
  const [subject, setSubject] = useState('Lenguaje y Comunicación')
  const [supportProfile, setSupportProfile] = useState('Grupo diverso con baja comprensión lectora y necesidad de apoyos visuales')
  const [duration, setDuration] = useState('45 minutos')
  const [result, setResult] = useState<VirtualTeacherResult | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [status, setStatus] = useState('Listo para trabajar contigo')
  const [isPending, startTransition] = useTransition()

  const selectedMode = useMemo(() => modes.find((item) => item.id === mode) ?? modes[0], [mode])

  function generate() {
    if (!prompt.trim()) return
    setStatus('Preparando propuesta pedagógica...')
    startTransition(async () => {
      const response = await generateVirtualTeacherResponse({ prompt, mode, level, subject, supportProfile, duration })
      if (!response.ok) {
        setStatus(response.error)
        return
      }
      setResult(response.result)
      setHistory((current) => [{ ...response.result, id: crypto.randomUUID(), mode }, ...current].slice(0, 8))
      setStatus('Propuesta lista para revisión docente')
    })
  }

  async function copyResult() {
    if (!result) return
    const text = [result.title, result.summary, ...result.sections.flatMap((section) => [`\n${section.title}`, ...section.items.map((item) => `• ${item}`)])].join('\n')
    await navigator.clipboard.writeText(text)
    setStatus('Contenido copiado')
  }

  return (
    <div className="virtual-teacher-workspace">
      <section className="virtual-command-center">
        <div>
          <span className="virtual-kicker"><Sparkles size={15} /> Profesor Virtual YOYO</span>
          <h1>Un copiloto pedagógico que convierte necesidades reales en acciones concretas.</h1>
          <p>Trabaja con contexto institucional, mantiene el control docente y conecta cada propuesta con recursos, evaluación y seguimiento.</p>
        </div>
        <div className="virtual-context-card">
          <span><BrainCircuit size={20} /> Contexto activo</span>
          <strong>{organization}</strong>
          <small>{displayName} · Sesión institucional protegida</small>
        </div>
      </section>

      <section className="virtual-mode-grid" aria-label="Modos del profesor virtual">
        {modes.map(({ id, label, description, icon: Icon }) => (
          <button key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}>
            <span><Icon size={19} /></span><div><strong>{label}</strong><small>{description}</small></div>
          </button>
        ))}
      </section>

      <div className="virtual-main-grid">
        <aside className="virtual-brief-panel premium-card">
          <div className="virtual-panel-heading"><WandSparkles /><div><h2>Contexto pedagógico</h2><p>Define lo esencial antes de generar.</p></div></div>
          <label>Nivel<select value={level} onChange={(event) => setLevel(event.target.value)}><option>1.º básico</option><option>2.º básico</option><option>3.º básico</option><option>4.º básico</option><option>5.º básico</option><option>6.º básico</option><option>Enseñanza media</option><option>Multinivel</option></select></label>
          <label>Asignatura<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Lenguaje y Comunicación</option><option>Matemática</option><option>Ciencias Naturales</option><option>Historia y Geografía</option><option>Orientación</option><option>Educación Parvularia</option></select></label>
          <label>Duración<select value={duration} onChange={(event) => setDuration(event.target.value)}><option>30 minutos</option><option>45 minutos</option><option>60 minutos</option><option>90 minutos</option><option>Secuencia de 3 clases</option></select></label>
          <label>Necesidades y apoyos<textarea rows={5} value={supportProfile} onChange={(event) => setSupportProfile(event.target.value)} /></label>
          <div className="virtual-suggestions"><span>Ideas rápidas</span>{suggestions[mode].map((suggestion) => <button key={suggestion} onClick={() => setPrompt(suggestion)}>{suggestion}</button>)}</div>
        </aside>

        <main className="virtual-conversation-panel premium-card">
          <div className="virtual-panel-heading"><Bot /><div><h2>{selectedMode.label} con YOYO</h2><p>{selectedMode.description}</p></div></div>
          <div className="virtual-prompt-box">
            <textarea rows={5} value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Describe el objetivo, dificultad o recurso que necesitas..." />
            <div><small>{status}</small><button className="btn btn-primary" onClick={generate} disabled={isPending || !prompt.trim()}>{isPending ? <Sparkles size={17} /> : <Send size={17} />}{isPending ? 'Generando...' : 'Generar propuesta'}</button></div>
          </div>

          {!result ? (
            <div className="virtual-empty-state"><Bot size={40} /><h3>Describe tu necesidad pedagógica</h3><p>YOYO organizará una propuesta revisable y te permitirá convertirla en acciones dentro de la plataforma.</p></div>
          ) : (
            <article className="virtual-result-card">
              <header><div><span>{result.organization}</span><h2>{result.title}</h2><p>{result.summary}</p></div><button onClick={copyResult} aria-label="Copiar propuesta"><Copy size={18} /></button></header>
              <div className="virtual-result-sections">{result.sections.map((section) => <section key={section.title}><h3>{section.title}</h3>{section.items.map((item) => <div key={item}><CheckCircle2 size={16} /><span>{item}</span></div>)}</section>)}</div>
              <div className="virtual-result-actions">{result.actions.map((action) => <Link href={action.href} key={action.label}>{action.label}<ArrowRight size={16} /></Link>)}</div>
            </article>
          )}
        </main>

        <aside className="virtual-history-panel premium-card">
          <div className="virtual-panel-heading"><History /><div><h2>Historial de sesión</h2><p>Recupera propuestas recientes.</p></div></div>
          {history.length ? <div className="virtual-history-list">{history.map((item) => <button key={item.id} onClick={() => setResult(item)}><span><FileText size={17} /></span><div><strong>{item.title}</strong><small>{new Date(item.generatedAt).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</small></div></button>)}</div> : <div className="virtual-history-empty">Las propuestas de esta sesión aparecerán aquí.</div>}
          <div className="virtual-control-note"><CheckCircle2 /><div><strong>Control docente permanente</strong><p>Ninguna propuesta modifica registros ni publica contenido automáticamente.</p></div></div>
        </aside>
      </div>
    </div>
  )
}
