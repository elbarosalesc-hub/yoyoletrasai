'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Calculator,
  CheckCircle2,
  Clock3,
  Gauge,
  Pause,
  Play,
  RefreshCw,
  RotateCcw,
  Shuffle,
  Sparkles,
  Users,
} from 'lucide-react'

type Props = { displayName: string; organizationName: string }
type Tool = 'temporizador' | 'selector' | 'grupos' | 'calificaciones' | 'lectura'

const defaultNames = ['Agustín', 'Valentina', 'Génesis', 'Cataleya', 'Renato', 'León', 'Mateo', 'Julián']

export function AulaInteractivaClient({ displayName, organizationName }: Props) {
  const [tool, setTool] = useState<Tool>('temporizador')
  const [seconds, setSeconds] = useState(10 * 60)
  const [running, setRunning] = useState(false)
  const [phase, setPhase] = useState('Desarrollo')
  const [namesText, setNamesText] = useState(defaultNames.join('\n'))
  const [selected, setSelected] = useState<string[]>([])
  const [groupCount, setGroupCount] = useState(3)
  const [groups, setGroups] = useState<string[][]>([])
  const [score, setScore] = useState(28)
  const [total, setTotal] = useState(40)
  const [requirement, setRequirement] = useState(60)
  const [words, setWords] = useState(120)
  const [readingSeconds, setReadingSeconds] = useState(60)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yoyo-aula-nombres')
      if (saved) setNamesText(saved)
    } catch {}
  }, [])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      setSeconds((value) => {
        if (value <= 1) {
          setRunning(false)
          return 0
        }
        return value - 1
      })
    }, 1000)
    return () => window.clearInterval(timer)
  }, [running])

  const names = useMemo(() => namesText.split(/\n|,/).map((name) => name.trim()).filter(Boolean), [namesText])
  const minutes = String(Math.floor(seconds / 60)).padStart(2, '0')
  const remainingSeconds = String(seconds % 60).padStart(2, '0')
  const percentage = total > 0 ? Math.min(100, Math.max(0, (score / total) * 100)) : 0
  const grade = total > 0 ? Math.max(1, Math.min(7, 1 + (percentage / 100) * 6)).toFixed(1) : '1.0'
  const ppm = readingSeconds > 0 ? Math.round((words / readingSeconds) * 60) : 0

  function saveNames(value: string) {
    setNamesText(value)
    localStorage.setItem('yoyo-aula-nombres', value)
    setSelected([])
  }

  function pickStudent() {
    const available = names.filter((name) => !selected.includes(name))
    const pool = available.length ? available : names
    if (!pool.length) return
    if (!available.length) setSelected([])
    const name = pool[Math.floor(Math.random() * pool.length)]
    setSelected((current) => [...current.filter((item) => item !== name), name])
  }

  function createGroups() {
    const shuffled = [...names].sort(() => Math.random() - 0.5)
    const next = Array.from({ length: Math.max(2, groupCount) }, () => [] as string[])
    shuffled.forEach((name, index) => next[index % next.length].push(name))
    setGroups(next)
  }

  return (
    <div className="classroom-suite">
      <section className="classroom-hero">
        <div><span className="eyebrow"><Sparkles size={15}/> Centro de Aula Interactivo</span><h1>Herramientas inmediatas para dirigir, evaluar y organizar la clase.</h1><p>{organizationName} · Sesión de {displayName}</p></div>
        <div className="classroom-status"><CheckCircle2/><span><b>5 herramientas activas</b><small>Funcionan sin instalar aplicaciones externas</small></span></div>
      </section>

      <nav className="classroom-tabs" aria-label="Herramientas de aula">
        <button className={tool === 'temporizador' ? 'active' : ''} onClick={() => setTool('temporizador')}><Clock3/>Temporizador</button>
        <button className={tool === 'selector' ? 'active' : ''} onClick={() => setTool('selector')}><Shuffle/>Selector</button>
        <button className={tool === 'grupos' ? 'active' : ''} onClick={() => setTool('grupos')}><Users/>Grupos</button>
        <button className={tool === 'calificaciones' ? 'active' : ''} onClick={() => setTool('calificaciones')}><Calculator/>Calificaciones</button>
        <button className={tool === 'lectura' ? 'active' : ''} onClick={() => setTool('lectura')}><Gauge/>Velocidad lectora</button>
      </nav>

      {tool === 'temporizador' && <section className="classroom-tool-grid">
        <article className="classroom-main-card"><span className="tool-kicker">Fase actual</span><input className="phase-input" value={phase} onChange={(e) => setPhase(e.target.value)}/><div className={`big-timer ${seconds === 0 ? 'finished' : ''}`}>{minutes}:{remainingSeconds}</div><div className="timer-actions"><button onClick={() => setRunning((v) => !v)}>{running ? <Pause/> : <Play/>}{running ? 'Pausar' : 'Iniciar'}</button><button onClick={() => { setRunning(false); setSeconds(10 * 60) }}><RotateCcw/>Reiniciar</button></div></article>
        <aside className="classroom-side-card"><h2>Duración rápida</h2>{[5,10,15,20,30,45].map((value) => <button key={value} onClick={() => { setSeconds(value * 60); setRunning(false) }}>{value} minutos</button>)}</aside>
      </section>}

      {(tool === 'selector' || tool === 'grupos') && <section className="classroom-tool-grid">
        <article className="classroom-main-card"><label className="classroom-label">Lista de estudiantes<textarea value={namesText} onChange={(e) => saveNames(e.target.value)} rows={12}/></label><small>{names.length} estudiantes disponibles</small></article>
        <aside className="classroom-side-card">
          {tool === 'selector' ? <><h2>Participación equitativa</h2><button className="primary-tool-action" onClick={pickStudent}><Shuffle/>Elegir estudiante</button><div className="selected-student">{selected.at(-1) || 'Aún no se ha seleccionado'}</div><p>{selected.length} participaciones registradas sin repetir.</p><button onClick={() => setSelected([])}><RefreshCw/>Reiniciar ronda</button></> : <><h2>Creador de grupos</h2><label className="classroom-label">Cantidad de grupos<input type="number" min="2" max="10" value={groupCount} onChange={(e) => setGroupCount(Number(e.target.value))}/></label><button className="primary-tool-action" onClick={createGroups}><Users/>Crear grupos</button></>}
        </aside>
        {tool === 'grupos' && groups.length > 0 && <div className="generated-groups">{groups.map((group, index) => <article key={index}><h3>Grupo {index + 1}</h3>{group.map((name) => <span key={name}>{name}</span>)}</article>)}</div>}
      </section>}

      {tool === 'calificaciones' && <section className="classroom-calculator">
        <article className="classroom-input-card"><h2>Calculadora de logro</h2><label>Puntaje obtenido<input type="number" min="0" value={score} onChange={(e) => setScore(Number(e.target.value))}/></label><label>Puntaje total<input type="number" min="1" value={total} onChange={(e) => setTotal(Number(e.target.value))}/></label><label>Exigencia<input type="range" min="50" max="80" value={requirement} onChange={(e) => setRequirement(Number(e.target.value))}/><span>{requirement}%</span></label></article>
        <article className="classroom-result-card"><span>Porcentaje de logro</span><strong>{percentage.toFixed(1)}%</strong><div className="achievement-bar"><i style={{ width: `${percentage}%` }}/></div><span>Nota referencial</span><strong>{grade}</strong><em className={percentage >= requirement ? 'approved' : 'pending'}>{percentage >= requirement ? 'Objetivo alcanzado' : 'En proceso de logro'}</em></article>
      </section>}

      {tool === 'lectura' && <section className="classroom-calculator">
        <article className="classroom-input-card"><h2>Medidor de velocidad lectora</h2><label>Palabras leídas<input type="number" min="0" value={words} onChange={(e) => setWords(Number(e.target.value))}/></label><label>Tiempo utilizado (segundos)<input type="number" min="1" value={readingSeconds} onChange={(e) => setReadingSeconds(Number(e.target.value))}/></label><p>Registra únicamente las palabras leídas correctamente para obtener una medida útil.</p></article>
        <article className="classroom-result-card"><span>Palabras por minuto</span><strong>{ppm}</strong><em className="approved">Registro listo para seguimiento</em><p>Complementa este dato con precisión, entonación, comprensión y nivel de apoyo.</p></article>
      </section>}
    </div>
  )
}
