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
type Tool = 'temporizador' | 'selector' | 'grupos' | 'calificaciones' | 'lectura' | 'semaforo'
type TrafficState = 'green' | 'yellow' | 'red'
type TrafficGroup = { name: string; state: TrafficState }

const defaultNames = ['Agustín', 'Valentina', 'Génesis', 'Cataleya', 'Renato', 'León', 'Mateo', 'Julián']
const defaultTrafficGroups: TrafficGroup[] = [
  { name: 'Grupo 1', state: 'green' },
  { name: 'Grupo 2', state: 'green' },
  { name: 'Grupo 3', state: 'green' },
  { name: 'Grupo 4', state: 'green' },
]

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function calculateChileanGrade(percentage: number, requirement: number) {
  const pct = clamp(percentage, 0, 100)
  const req = clamp(requirement, 1, 99)
  const result = pct <= req
    ? 1 + 3 * (pct / req)
    : 4 + 3 * ((pct - req) / (100 - req))
  return clamp(result, 1, 7).toFixed(1)
}

function shuffleNames(values: string[]) {
  const shuffled = [...values]
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]]
  }
  return shuffled
}

const trafficLabels: Record<TrafficState, string> = {
  green: 'Trabajo adecuado',
  yellow: 'Necesita atención',
  red: 'Pausa y reorganización',
}

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
  const [readingErrors, setReadingErrors] = useState(0)
  const [readingSeconds, setReadingSeconds] = useState(60)
  const [readingGoal, setReadingGoal] = useState(120)
  const [trafficGroups, setTrafficGroups] = useState<TrafficGroup[]>(defaultTrafficGroups)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('yoyo-aula-nombres')
      if (saved) setNamesText(saved)

      const savedTraffic = localStorage.getItem('yoyo-aula-semaforo')
      if (savedTraffic) {
        const parsed = JSON.parse(savedTraffic) as unknown
        if (
          Array.isArray(parsed)
          && parsed.length > 0
          && parsed.every((item) => (
            typeof item === 'object'
            && item !== null
            && typeof (item as TrafficGroup).name === 'string'
            && ['green', 'yellow', 'red'].includes((item as TrafficGroup).state)
          ))
        ) {
          setTrafficGroups(parsed as TrafficGroup[])
        }
      }
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
  const percentage = total > 0 ? clamp((score / total) * 100, 0, 100) : 0
  const grade = calculateChileanGrade(percentage, requirement)
  const correctWords = Math.max(0, words - readingErrors)
  const ppm = readingSeconds > 0 ? Math.round((correctWords / readingSeconds) * 60) : 0
  const readingProgress = readingGoal > 0 ? clamp((ppm / readingGoal) * 100, 0, 100) : 0

  function saveNames(value: string) {
    setNamesText(value)
    try {
      localStorage.setItem('yoyo-aula-nombres', value)
    } catch {}
    setSelected([])
  }

  function pickStudent() {
    if (!names.length) return

    const available = names.filter((name) => !selected.includes(name))
    const startsNewRound = available.length === 0
    const pool = startsNewRound ? names : available
    const name = pool[Math.floor(Math.random() * pool.length)]

    setSelected((current) => {
      const base = startsNewRound ? [] : current
      return [...base.filter((item) => item !== name), name]
    })
  }

  function createGroups() {
    if (!names.length) {
      setGroups([])
      return
    }

    const shuffled = shuffleNames(names)
    const amount = clamp(Math.round(groupCount || 2), 2, Math.min(10, Math.max(2, names.length)))
    const next = Array.from({ length: amount }, () => [] as string[])
    shuffled.forEach((name, index) => next[index % next.length].push(name))
    setGroups(next)
  }

  function saveTrafficGroups(next: TrafficGroup[]) {
    setTrafficGroups(next)
    try {
      localStorage.setItem('yoyo-aula-semaforo', JSON.stringify(next))
    } catch {}
  }

  function setTrafficState(index: number, state: TrafficState) {
    saveTrafficGroups(
      trafficGroups.map((group, groupIndex) => (
        groupIndex === index ? { ...group, state } : group
      )),
    )
  }

  function renameTrafficGroup(index: number, name: string) {
    saveTrafficGroups(
      trafficGroups.map((group, groupIndex) => (
        groupIndex === index ? { ...group, name } : group
      )),
    )
  }

  function addTrafficGroup() {
    if (trafficGroups.length >= 8) return
    saveTrafficGroups([
      ...trafficGroups,
      { name: `Grupo ${trafficGroups.length + 1}`, state: 'green' },
    ])
  }

  function resetTrafficGroups() {
    saveTrafficGroups(trafficGroups.map((group) => ({ ...group, state: 'green' })))
  }

  return (
    <div className="classroom-suite">
      <section className="classroom-hero">
        <div>
          <span className="eyebrow"><Sparkles size={15}/> Centro de Aula Interactivo</span>
          <h1>Herramientas inmediatas para dirigir, evaluar y organizar la clase.</h1>
          <p>{organizationName} · Sesión de {displayName}</p>
        </div>
        <div className="classroom-status">
          <CheckCircle2/>
          <span>
            <b>6 herramientas activas</b>
            <small>Funcionan en el navegador, sin servicios externos de pago</small>
          </span>
        </div>
      </section>

      <nav className="classroom-tabs" aria-label="Herramientas de aula">
        <button className={tool === 'temporizador' ? 'active' : ''} onClick={() => setTool('temporizador')}><Clock3/>Temporizador</button>
        <button className={tool === 'selector' ? 'active' : ''} onClick={() => setTool('selector')}><Shuffle/>Selector</button>
        <button className={tool === 'grupos' ? 'active' : ''} onClick={() => setTool('grupos')}><Users/>Grupos</button>
        <button className={tool === 'semaforo' ? 'active' : ''} onClick={() => setTool('semaforo')}><CheckCircle2/>Semáforo</button>
        <button className={tool === 'calificaciones' ? 'active' : ''} onClick={() => setTool('calificaciones')}><Calculator/>Calificaciones</button>
        <button className={tool === 'lectura' ? 'active' : ''} onClick={() => setTool('lectura')}><Gauge/>Velocidad lectora</button>
      </nav>

      {tool === 'temporizador' && (
        <section className="classroom-tool-grid">
          <article className="classroom-main-card">
            <span className="tool-kicker">Fase actual</span>
            <input className="phase-input" value={phase} onChange={(e) => setPhase(e.target.value)} aria-label="Nombre de la fase de clase"/>
            <div className={`big-timer ${seconds === 0 ? 'finished' : ''}`} aria-live="polite">{minutes}:{remainingSeconds}</div>
            <div className="timer-actions">
              <button onClick={() => setRunning((value) => !value)}>{running ? <Pause/> : <Play/>}{running ? 'Pausar' : 'Iniciar'}</button>
              <button onClick={() => { setRunning(false); setSeconds(10 * 60) }}><RotateCcw/>Reiniciar</button>
            </div>
          </article>
          <aside className="classroom-side-card">
            <h2>Duración rápida</h2>
            {[5, 10, 15, 20, 30, 45].map((value) => (
              <button key={value} onClick={() => { setSeconds(value * 60); setRunning(false) }}>{value} minutos</button>
            ))}
          </aside>
        </section>
      )}

      {(tool === 'selector' || tool === 'grupos') && (
        <section className="classroom-tool-grid">
          <article className="classroom-main-card">
            <label className="classroom-label">
              Lista de estudiantes
              <textarea value={namesText} onChange={(e) => saveNames(e.target.value)} rows={12}/>
            </label>
            <small>{names.length} estudiantes disponibles</small>
          </article>
          <aside className="classroom-side-card">
            {tool === 'selector' ? (
              <>
                <h2>Participación equitativa</h2>
                <button className="primary-tool-action" onClick={pickStudent}><Shuffle/>Elegir estudiante</button>
                <div className="selected-student" aria-live="polite">{selected.at(-1) || 'Aún no se ha seleccionado'}</div>
                <p>{selected.length} participaciones registradas en la ronda actual.</p>
                <button onClick={() => setSelected([])}><RefreshCw/>Reiniciar ronda</button>
              </>
            ) : (
              <>
                <h2>Creador de grupos</h2>
                <label className="classroom-label">
                  Cantidad de grupos
                  <input type="number" min="2" max="10" value={groupCount} onChange={(e) => setGroupCount(Number(e.target.value))}/>
                </label>
                <button className="primary-tool-action" onClick={createGroups}><Users/>Crear grupos</button>
                <p>La distribución utiliza mezcla Fisher–Yates para evitar sesgos del orden original.</p>
              </>
            )}
          </aside>
          {tool === 'grupos' && groups.length > 0 && (
            <div className="generated-groups">
              {groups.map((group, index) => (
                <article key={index}>
                  <h3>Grupo {index + 1}</h3>
                  {group.map((name) => <span key={name}>{name}</span>)}
                </article>
              ))}
            </div>
          )}
        </section>
      )}

      {tool === 'semaforo' && (
        <section className="classroom-tool-grid">
          <article className="classroom-main-card traffic-board-card">
            <div className="traffic-board-heading">
              <div>
                <span className="tool-kicker">Gestión visual por grupos</span>
                <h2>Semáforo de aula</h2>
                <p>Cambia el estado de cada grupo sin registrar datos personales ni enviar información fuera del navegador.</p>
              </div>
            </div>
            <div className="traffic-group-grid">
              {trafficGroups.map((group, index) => (
                <article className={`traffic-group-card traffic-${group.state}`} key={index}>
                  <input
                    value={group.name}
                    onChange={(e) => renameTrafficGroup(index, e.target.value)}
                    aria-label={`Nombre del grupo ${index + 1}`}
                  />
                  <div className="traffic-light" aria-label={`Estado de ${group.name}`}>
                    <button
                      className={group.state === 'green' ? 'active' : ''}
                      onClick={() => setTrafficState(index, 'green')}
                      aria-label={`Marcar ${group.name} en verde`}
                      title="Trabajo adecuado"
                    />
                    <button
                      className={group.state === 'yellow' ? 'active' : ''}
                      onClick={() => setTrafficState(index, 'yellow')}
                      aria-label={`Marcar ${group.name} en amarillo`}
                      title="Necesita atención"
                    />
                    <button
                      className={group.state === 'red' ? 'active' : ''}
                      onClick={() => setTrafficState(index, 'red')}
                      aria-label={`Marcar ${group.name} en rojo`}
                      title="Pausa y reorganización"
                    />
                  </div>
                  <strong>{trafficLabels[group.state]}</strong>
                </article>
              ))}
            </div>
          </article>
          <aside className="classroom-side-card traffic-guide">
            <h2>Uso sugerido</h2>
            <div><span className="traffic-dot green"/><p><b>Verde:</b> continúan trabajando con autonomía.</p></div>
            <div><span className="traffic-dot yellow"/><p><b>Amarillo:</b> requieren recordatorio, apoyo o ajuste.</p></div>
            <div><span className="traffic-dot red"/><p><b>Rojo:</b> detener, reorganizar o modelar nuevamente.</p></div>
            <button className="primary-tool-action" onClick={addTrafficGroup} disabled={trafficGroups.length >= 8}><Users/>Agregar grupo</button>
            <button onClick={resetTrafficGroups}><RefreshCw/>Todos a verde</button>
          </aside>
        </section>
      )}

      {tool === 'calificaciones' && (
        <section className="classroom-calculator">
          <article className="classroom-input-card">
            <h2>Calculadora de calificación chilena</h2>
            <label>Puntaje obtenido<input type="number" min="0" max={Math.max(total, 0)} value={score} onChange={(e) => setScore(Number(e.target.value))}/></label>
            <label>Puntaje total<input type="number" min="1" value={total} onChange={(e) => setTotal(Number(e.target.value))}/></label>
            <label>
              Exigencia
              <input type="range" min="50" max="80" value={requirement} onChange={(e) => setRequirement(Number(e.target.value))}/>
              <span>{requirement}% · nota 4,0</span>
            </label>
            <p>La escala ubica el 4,0 en el porcentaje de exigencia seleccionado y distribuye el tramo superior hasta 7,0.</p>
          </article>
          <article className="classroom-result-card">
            <span>Porcentaje de logro</span>
            <strong>{percentage.toFixed(1)}%</strong>
            <div className="achievement-bar" aria-label={`Porcentaje de logro ${percentage.toFixed(1)}%`}><i style={{ width: `${percentage}%` }}/></div>
            <span>Nota referencial</span>
            <strong>{grade}</strong>
            <em className={percentage >= requirement ? 'approved' : 'pending'}>{percentage >= requirement ? 'Objetivo alcanzado' : 'En proceso de logro'}</em>
          </article>
        </section>
      )}

      {tool === 'lectura' && (
        <section className="classroom-calculator">
          <article className="classroom-input-card">
            <h2>Medidor de velocidad lectora</h2>
            <label>Palabras intentadas<input type="number" min="0" value={words} onChange={(e) => setWords(Number(e.target.value))}/></label>
            <label>Errores u omisiones<input type="number" min="0" max={Math.max(words, 0)} value={readingErrors} onChange={(e) => setReadingErrors(Number(e.target.value))}/></label>
            <label>Tiempo utilizado (segundos)<input type="number" min="1" value={readingSeconds} onChange={(e) => setReadingSeconds(Number(e.target.value))}/></label>
            <label>Meta de referencia (ppm)<input type="number" min="1" value={readingGoal} onChange={(e) => setReadingGoal(Number(e.target.value))}/></label>
            <p>El cálculo utiliza palabras correctas por minuto. La meta es editable para adaptarla al curso, instrumento o criterio institucional.</p>
          </article>
          <article className="classroom-result-card">
            <span>Palabras correctas</span>
            <strong className="reading-correct">{correctWords}</strong>
            <span>Palabras por minuto</span>
            <strong>{ppm}</strong>
            <div className="achievement-bar" aria-label={`Avance hacia la meta ${readingProgress.toFixed(0)}%`}><i style={{ width: `${readingProgress}%` }}/></div>
            <em className={ppm >= readingGoal ? 'approved' : 'pending'}>{ppm >= readingGoal ? 'Meta alcanzada' : `${readingProgress.toFixed(0)}% de la meta`}</em>
            <p>Complementa este dato con precisión, entonación, comprensión y nivel de apoyo.</p>
          </article>
        </section>
      )}
    </div>
  )
}
