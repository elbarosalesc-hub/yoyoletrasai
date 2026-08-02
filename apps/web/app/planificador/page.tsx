'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { AppShell } from '@/components/AppShell'
import { BookOpen, CalendarDays, CheckCircle2, ClipboardCheck, Copy, Plus, Save, Sparkles, Target, Trash2, WandSparkles } from 'lucide-react'

type Block = { id: string; day: string; period: string; subject: string; objective: string; activity: string; support: string; done: boolean }

const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
const periods = ['08:00', '09:45', '11:30', '14:00']

const initial: Block[] = [
  { id: '1', day: 'Lunes', period: '08:00', subject: 'Lenguaje', objective: 'Comprender información explícita', activity: 'Lectura guiada y preguntas breves', support: 'Lectura mediada y palabras clave', done: false },
  { id: '2', day: 'Martes', period: '09:45', subject: 'Matemática', objective: 'Aplicar multiplicación', activity: 'Estaciones con material concreto', support: 'Tabla visual y trabajo en parejas', done: false },
  { id: '3', day: 'Miércoles', period: '11:30', subject: 'Trabajo PIE', objective: 'Fortalecer autonomía', activity: 'Rutina visual de inicio y cierre', support: 'Secuencia de pasos y temporizador', done: true },
]

export default function Planificador() {
  const [blocks, setBlocks] = useState<Block[]>(initial)
  const [selectedDay, setSelectedDay] = useState('Todos')
  const [status, setStatus] = useState('Plan semanal activo')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('yoyo-weekly-planner')
      if (stored) setBlocks(JSON.parse(stored))
    } catch {}
  }, [])

  const visible = useMemo(() => selectedDay === 'Todos' ? blocks : blocks.filter((block) => block.day === selectedDay), [blocks, selectedDay])
  const completed = blocks.filter((block) => block.done).length

  function save(next = blocks) {
    localStorage.setItem('yoyo-weekly-planner', JSON.stringify(next))
    setStatus(`Guardado · ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`)
  }

  function addBlock() {
    const next = [...blocks, { id: crypto.randomUUID(), day: 'Lunes', period: '08:00', subject: 'Nueva asignatura', objective: 'Objetivo de aprendizaje', activity: 'Actividad principal', support: 'Apoyo DUA o PIE', done: false }]
    setBlocks(next)
  }

  function update(id: string, key: keyof Block, value: string | boolean) {
    setBlocks((current) => current.map((block) => block.id === id ? { ...block, [key]: value } : block))
  }

  function remove(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  function duplicate(block: Block) {
    setBlocks((current) => [...current, { ...block, id: crypto.randomUUID(), done: false }])
  }

  return <AppShell active="Planificador">
    <div className="planner-workspace">
      <section className="planner-hero">
        <div><span className="eyebrow"><CalendarDays size={15}/> Organización pedagógica</span><h1>Planificador semanal conectado con tus herramientas.</h1><p>Organiza objetivos, actividades, apoyos y evaluaciones desde una sola vista editable.</p></div>
        <div className="planner-progress"><strong>{completed}/{blocks.length}</strong><span>bloques completados</span><div><i style={{ width: `${blocks.length ? completed / blocks.length * 100 : 0}%` }} /></div></div>
      </section>

      <section className="planner-toolbar premium-card">
        <div className="planner-day-tabs"><button className={selectedDay === 'Todos' ? 'active' : ''} onClick={() => setSelectedDay('Todos')}>Todos</button>{days.map((day) => <button key={day} className={selectedDay === day ? 'active' : ''} onClick={() => setSelectedDay(day)}>{day}</button>)}</div>
        <div><span>{status}</span><button className="btn btn-soft" onClick={addBlock}><Plus size={16}/>Agregar bloque</button><button className="btn btn-primary" onClick={() => save()}><Save size={16}/>Guardar semana</button></div>
      </section>

      <section className="planner-grid">
        {visible.map((block) => <article className={`planner-card premium-card ${block.done ? 'done' : ''}`} key={block.id}>
          <div className="planner-card-top"><label><input type="checkbox" checked={block.done} onChange={(event) => update(block.id, 'done', event.target.checked)}/><span><CheckCircle2 size={18}/></span></label><select value={block.day} onChange={(event) => update(block.id, 'day', event.target.value)}>{days.map((day) => <option key={day}>{day}</option>)}</select><select value={block.period} onChange={(event) => update(block.id, 'period', event.target.value)}>{periods.map((period) => <option key={period}>{period}</option>)}</select></div>
          <label>Asignatura<input value={block.subject} onChange={(event) => update(block.id, 'subject', event.target.value)}/></label>
          <label><Target size={15}/> Objetivo<textarea rows={2} value={block.objective} onChange={(event) => update(block.id, 'objective', event.target.value)}/></label>
          <label><BookOpen size={15}/> Actividad<textarea rows={3} value={block.activity} onChange={(event) => update(block.id, 'activity', event.target.value)}/></label>
          <label><Sparkles size={15}/> Apoyo DUA/PIE<textarea rows={2} value={block.support} onChange={(event) => update(block.id, 'support', event.target.value)}/></label>
          <div className="planner-card-actions"><button onClick={() => duplicate(block)}><Copy size={15}/>Duplicar</button><Link href={`/profesor-virtual?tema=${encodeURIComponent(block.objective)}`}><WandSparkles size={15}/>Mejorar con Profesor Virtual</Link><Link href="/evaluaciones"><ClipboardCheck size={15}/>Evaluar</Link><button className="danger" onClick={() => remove(block.id)} aria-label="Eliminar bloque"><Trash2 size={15}/></button></div>
        </article>)}
      </section>
    </div>
  </AppShell>
}
