'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight,
  BookOpen,
  Bot,
  BrainCircuit,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  Download,
  FileText,
  HeartHandshake,
  History,
  Lightbulb,
  MessageSquareText,
  Plus,
  Save,
  Send,
  Sparkles,
  Target,
  Trash2,
  WandSparkles,
} from 'lucide-react'

type Mode = 'Planificar clase' | 'Adaptar para PIE' | 'Crear evaluación' | 'Analizar dificultad' | 'Comunicar a familia'
type Message = { id: string; role: 'assistant' | 'user'; text: string; createdAt: string; mode?: Mode }
type Session = { id: string; title: string; messages: Message[]; updatedAt: string }

type Props = {
  displayName: string
  organizationName: string
}

const modes: Array<{ label: Mode; icon: typeof Bot; hint: string }> = [
  { label: 'Planificar clase', icon: BookOpen, hint: 'Inicio, desarrollo, cierre y evaluación formativa.' },
  { label: 'Adaptar para PIE', icon: HeartHandshake, hint: 'DUA, apoyos de acceso y opciones de respuesta.' },
  { label: 'Crear evaluación', icon: ClipboardCheck, hint: 'Ítems, pauta, rúbrica y versiones diversificadas.' },
  { label: 'Analizar dificultad', icon: BrainCircuit, hint: 'Hipótesis pedagógicas y estrategias observables.' },
  { label: 'Comunicar a familia', icon: MessageSquareText, hint: 'Mensajes claros, positivos y orientados al apoyo.' },
]

const prompts: Record<Mode, string[]> = {
  'Planificar clase': ['Planifica una clase de 45 minutos', 'Crea un inicio motivador', 'Diseña un ticket de salida'],
  'Adaptar para PIE': ['Adapta una guía para DIL', 'Propón apoyos para TDAH', 'Aplica DUA a esta actividad'],
  'Crear evaluación': ['Crea una evaluación diversificada', 'Genera una rúbrica de 4 niveles', 'Crea preguntas tipo PAES'],
  'Analizar dificultad': ['Analiza baja comprensión lectora', 'Sugiere apoyos para escritura lenta', 'Propón indicadores de progreso'],
  'Comunicar a familia': ['Redacta un mensaje de avance', 'Explica apoyos sugeridos en casa', 'Prepara una citación respetuosa'],
}

function buildResponse(mode: Mode, query: string, level: string, subject: string) {
  const context = `${subject} · ${level}`
  const topic = query.trim() || 'la necesidad pedagógica indicada'

  if (mode === 'Planificar clase') return `PROPUESTA DE CLASE · ${context}\n\nObjetivo sugerido\nComprender y aplicar el aprendizaje central relacionado con ${topic}.\n\nInicio · 8 minutos\n• Activación visual de conocimientos previos.\n• Pregunta breve con opción oral, escrita o señalada.\n\nDesarrollo · 27 minutos\n• Modelado explícito con un ejemplo resuelto.\n• Práctica guiada en parejas.\n• Actividad principal en tres niveles de apoyo.\n\nCierre · 10 minutos\n• Síntesis colectiva con palabras clave.\n• Ticket de salida de dos preguntas.\n\nEvidencia esperada\nRespuesta del estudiante, explicación breve y nivel de autonomía observado.`
  if (mode === 'Adaptar para PIE') return `ADAPTACIÓN DUA Y PIE · ${context}\n\nNecesidad abordada\n${topic}.\n\nAcceso a la información\n• Instrucciones breves, una por vez.\n• Palabras clave destacadas y ejemplo visual.\n• Lectura mediada o audio cuando corresponda.\n\nFormas de respuesta\n• Alternativa oral, selección, escritura breve o apoyo manipulativo.\n• Reducción de copia sin reducir el objetivo.\n\nParticipación\n• Anticipación de la secuencia.\n• Pausas breves y refuerzo positivo descriptivo.\n\nCriterio de logro\nDemuestra el aprendizaje con el apoyo necesario y comunica el procedimiento utilizado.`
  if (mode === 'Crear evaluación') return `EVALUACIÓN PROPUESTA · ${context}\n\nPropósito\nEvaluar ${topic} mediante tareas equivalentes y accesibles.\n\nEstructura\n1. Cuatro ítems de selección múltiple.\n2. Dos preguntas de respuesta breve.\n3. Una tarea de aplicación.\n4. Una opción de respuesta oral o apoyada.\n\nPuntaje sugerido\n20 puntos totales, con 60% de exigencia.\n\nRúbrica\n• 4: Responde y justifica con evidencia.\n• 3: Responde correctamente con apoyo menor.\n• 2: Responde parcialmente con apoyo frecuente.\n• 1: Inicia la tarea y requiere modelado directo.\n\nDiversificación\nMantener el mismo objetivo, reducir carga visual y permitir más tiempo.`
  if (mode === 'Analizar dificultad') return `ANÁLISIS PEDAGÓGICO · ${context}\n\nSituación observada\n${topic}.\n\nHipótesis a comprobar\n• Comprensión insuficiente de la instrucción.\n• Vocabulario o conocimientos previos limitados.\n• Sobrecarga de memoria de trabajo.\n• Barrera de acceso, atención o expresión.\n\nAcciones inmediatas\n• Modelar el procedimiento en voz alta.\n• Dividir la tarea en pasos visibles.\n• Comparar desempeño con y sin apoyo.\n• Registrar tipo de ayuda y autonomía.\n\nIndicadores de avance\nPrecisión, tiempo de respuesta, cantidad de apoyos y capacidad para explicar lo realizado.`
  return `COMUNICACIÓN A LA FAMILIA · ${context}\n\nEstimada familia:\n\nJunto con saludar, queremos compartir avances y orientaciones relacionadas con ${topic}. El estudiante ha mostrado disposición para participar y responde favorablemente cuando las actividades se presentan de manera estructurada y con apoyos claros.\n\nDurante el próximo periodo continuaremos fortaleciendo esta habilidad mediante práctica guiada, instrucciones breves y oportunidades para demostrar lo aprendido de distintas formas. En el hogar puede apoyar con momentos cortos de práctica, lectura compartida y reconocimiento de sus esfuerzos.\n\nAgradecemos su acompañamiento y compromiso con este proceso.`
}

function downloadText(text: string, title: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi, '-')}.txt`
  anchor.click()
  URL.revokeObjectURL(url)
}

export function ProfesorVirtualClient({ displayName, organizationName }: Props) {
  const [mode, setMode] = useState<Mode>('Planificar clase')
  const [level, setLevel] = useState('3.º básico')
  const [subject, setSubject] = useState('Lenguaje y Comunicación')
  const [input, setInput] = useState('')
  const [sessions, setSessions] = useState<Session[]>([])
  const [activeId, setActiveId] = useState('current')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hola, ${displayName}. Estoy preparado para ayudarte a planificar, adaptar, evaluar y analizar con contexto pedagógico. Selecciona un modo y describe lo que necesitas.`,
      createdAt: new Date().toISOString(),
    },
  ])

  useEffect(() => {
    try {
      setSessions(JSON.parse(localStorage.getItem('yoyo-virtual-professor-sessions') || '[]'))
    } catch {
      setSessions([])
    }
  }, [])

  const lastAssistant = useMemo(() => [...messages].reverse().find((message) => message.role === 'assistant' && message.id !== 'welcome'), [messages])

  function persist(next: Session[]) {
    setSessions(next)
    localStorage.setItem('yoyo-virtual-professor-sessions', JSON.stringify(next))
  }

  function send(custom?: string) {
    const query = (custom ?? input).trim()
    if (!query) return
    const now = new Date().toISOString()
    const response = buildResponse(mode, query, level, subject)
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: 'user', text: query, createdAt: now, mode },
      { id: `a-${Date.now() + 1}`, role: 'assistant', text: response, createdAt: now, mode },
    ])
    setInput('')
  }

  function saveSession() {
    const id = activeId === 'current' ? crypto.randomUUID() : activeId
    const userMessage = [...messages].reverse().find((message) => message.role === 'user')
    const session: Session = {
      id,
      title: userMessage?.text.slice(0, 54) || `${mode} · ${level}`,
      messages,
      updatedAt: new Date().toISOString(),
    }
    persist([session, ...sessions.filter((item) => item.id !== id)].slice(0, 12))
    setActiveId(id)
  }

  function openSession(session: Session) {
    setMessages(session.messages)
    setActiveId(session.id)
  }

  function newSession() {
    setActiveId('current')
    setMessages([{ id: `welcome-${Date.now()}`, role: 'assistant', text: `Nueva conversación iniciada para ${subject} en ${level}.`, createdAt: new Date().toISOString() }])
  }

  async function copyMessage(message: Message) {
    await navigator.clipboard.writeText(message.text)
    setCopiedId(message.id)
    window.setTimeout(() => setCopiedId(null), 1600)
  }

  return (
    <div className="virtual-professor-workspace">
      <section className="virtual-command-center">
        <div>
          <span className="eyebrow"><Sparkles size={15} /> Profesor Virtual YOYO</span>
          <h1>Un copiloto pedagógico que transforma ideas en acciones.</h1>
          <p>Planifica, diversifica, evalúa y comunica desde un mismo espacio, manteniendo siempre el control docente.</p>
        </div>
        <div className="virtual-context-card">
          <span><CheckCircle2 size={16} /> Contexto activo</span>
          <strong>{organizationName}</strong>
          <small>{subject} · {level}</small>
        </div>
      </section>

      <section className="virtual-context-controls premium-card">
        <label>Curso<select value={level} onChange={(event) => setLevel(event.target.value)}><option>1.º básico</option><option>2.º básico</option><option>3.º básico</option><option>4.º básico</option><option>5.º básico</option><option>6.º básico</option><option>7.º básico</option><option>8.º básico</option><option>Enseñanza media</option></select></label>
        <label>Asignatura<select value={subject} onChange={(event) => setSubject(event.target.value)}><option>Lenguaje y Comunicación</option><option>Matemática</option><option>Ciencias Naturales</option><option>Historia y Geografía</option><option>Educación Parvularia</option><option>Trabajo PIE</option></select></label>
        <button className="btn btn-soft" onClick={newSession}><Plus size={17} /> Nueva conversación</button>
        <button className="btn btn-primary" onClick={saveSession}><Save size={17} /> Guardar sesión</button>
      </section>

      <div className="virtual-professor-grid">
        <aside className="virtual-mode-rail premium-card">
          <div className="virtual-section-title"><span><WandSparkles size={18} /></span><div><strong>Modo de trabajo</strong><small>Elige el resultado esperado</small></div></div>
          <div className="virtual-mode-list">{modes.map(({ label, icon: Icon, hint }) => <button key={label} className={mode === label ? 'active' : ''} onClick={() => setMode(label)}><span><Icon size={18} /></span><div><b>{label}</b><small>{hint}</small></div></button>)}</div>
          <div className="virtual-history-title"><History size={16} /><strong>Historial reciente</strong></div>
          <div className="virtual-history-list">{sessions.length ? sessions.map((session) => <button key={session.id} onClick={() => openSession(session)} className={activeId === session.id ? 'active' : ''}><FileText size={15} /><span>{session.title}</span><small>{new Date(session.updatedAt).toLocaleDateString('es-CL')}</small></button>) : <p>Aún no hay sesiones guardadas.</p>}</div>
        </aside>

        <main className="virtual-conversation premium-card">
          <div className="virtual-conversation-head"><div><span><Bot size={19} /></span><div><strong>{mode}</strong><small>{subject} · {level}</small></div></div><em>Revisión docente activa</em></div>
          <div className="virtual-prompt-row">{prompts[mode].map((prompt) => <button key={prompt} onClick={() => send(prompt)}><Lightbulb size={14} />{prompt}</button>)}</div>
          <div className="virtual-message-stream">{messages.map((message) => <article key={message.id} className={message.role === 'user' ? 'user' : 'assistant'}>
            <div className="virtual-message-avatar">{message.role === 'assistant' ? <Sparkles size={17} /> : displayName.slice(0, 1).toUpperCase()}</div>
            <div className="virtual-message-body"><span>{message.role === 'assistant' ? 'Profesor Virtual' : displayName}</span><p>{message.text}</p>{message.role === 'assistant' && message.id !== 'welcome' && !message.id.startsWith('welcome-') ? <div className="virtual-message-actions"><button onClick={() => copyMessage(message)}><Copy size={14} />{copiedId === message.id ? 'Copiado' : 'Copiar'}</button><button onClick={() => downloadText(message.text, mode)}><Download size={14} />Descargar</button></div> : null}</div>
          </article>)}</div>
          <div className="virtual-composer"><textarea value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); send() } }} placeholder={`Describe qué necesitas para ${level}...`} rows={3} /><button onClick={() => send()} aria-label="Enviar consulta"><Send size={20} /></button></div>
          <small className="virtual-composer-note">Enter para enviar · Shift + Enter para nueva línea</small>
        </main>

        <aside className="virtual-output-panel premium-card">
          <div className="virtual-section-title"><span><Target size={18} /></span><div><strong>Convertir resultado</strong><small>Continúa el flujo en la plataforma</small></div></div>
          {lastAssistant ? <>
            <div className="virtual-result-status"><CheckCircle2 size={18} /><div><b>Propuesta lista</b><small>Revisa antes de utilizarla con estudiantes.</small></div></div>
            <div className="virtual-output-actions">
              <Link href={`/crear?tema=${encodeURIComponent(lastAssistant.text.slice(0, 100))}`}><WandSparkles /><div><b>Crear recurso</b><small>Transformar en guía editable</small></div><ArrowRight /></Link>
              <Link href="/evaluaciones"><ClipboardCheck /><div><b>Crear evaluación</b><small>Usar en el constructor</small></div><ArrowRight /></Link>
              <Link href="/biblioteca"><BookOpen /><div><b>Buscar recursos</b><small>Complementar la propuesta</small></div><ArrowRight /></Link>
              <Link href="/seguimiento/evidencias"><Target /><div><b>Registrar evidencia</b><small>Vincular al progreso</small></div><ArrowRight /></Link>
            </div>
          </> : <div className="virtual-empty-output"><BrainCircuit size={34} /><strong>Aún no hay resultado</strong><p>Envía una consulta para habilitar acciones conectadas.</p></div>}
          <div className="virtual-safety-note"><CheckCircle2 size={17} /><p><b>Control profesional</b><br />Las propuestas requieren revisión pedagógica antes de aplicarse.</p></div>
        </aside>
      </div>
    </div>
  )
}
