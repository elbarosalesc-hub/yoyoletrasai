'use client'

import { useActionState, useMemo, useState } from 'react'
import { BarChart3, BookOpenCheck, ClipboardPlus, Filter, Plus, Search, Target, Users } from 'lucide-react'
import { createEvidence, createObjective, initialProgressState } from './actions'

type Course = { id: string; name: string; level: string; academic_year: number }
type Student = { id: string; first_name: string; last_name: string; preferred_name: string | null }
type Objective = { id: string; subject: string; code: string; title: string; academic_year: number; course_id: string | null }
type Evidence = {
  id: string
  description: string
  evidence_type: string
  achievement_level: string
  autonomy_level: string | null
  support_used: string | null
  observed_at: string
  students: { first_name: string; last_name: string; preferred_name: string | null } | null
  learning_objectives: { subject: string; code: string; title: string } | null
}

const levelLabels: Record<string, string> = {
  achieved: 'Logrado',
  developing: 'En desarrollo',
  initial: 'Inicial',
  not_observed: 'No observado',
}

const typeLabels: Record<string, string> = {
  written: 'Trabajo escrito',
  oral: 'Respuesta oral',
  performance: 'Desempeño',
  project: 'Proyecto',
  observation: 'Observación',
  assessment: 'Evaluación',
  other: 'Otra evidencia',
}

export function ProgressManager({
  courses,
  students,
  objectives,
  evidence,
}: {
  courses: Course[]
  students: Student[]
  objectives: Objective[]
  evidence: Evidence[]
}) {
  const [objectiveState, objectiveAction, objectivePending] = useActionState(createObjective, initialProgressState)
  const [evidenceState, evidenceAction, evidencePending] = useActionState(createEvidence, initialProgressState)
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState('all')

  const filteredEvidence = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return evidence.filter((item) => {
      const student = item.students
        ? `${item.students.first_name} ${item.students.last_name} ${item.students.preferred_name ?? ''}`.toLowerCase()
        : ''
      const objective = item.learning_objectives
        ? `${item.learning_objectives.subject} ${item.learning_objectives.code} ${item.learning_objectives.title}`.toLowerCase()
        : ''
      const matchesQuery = !normalized || student.includes(normalized) || objective.includes(normalized) || item.description.toLowerCase().includes(normalized)
      const matchesLevel = levelFilter === 'all' || item.achievement_level === levelFilter
      return matchesQuery && matchesLevel
    })
  }, [evidence, levelFilter, query])

  const achieved = evidence.filter((item) => item.achievement_level === 'achieved').length
  const developing = evidence.filter((item) => item.achievement_level === 'developing').length
  const supported = evidence.filter((item) => item.autonomy_level === 'partial_support' || item.autonomy_level === 'full_support').length

  return (
    <div className="progress-module">
      <section className="tracking-stats progress-stats">
        <article><Target /><strong>{objectives.length}</strong><span>objetivos activos</span></article>
        <article><BookOpenCheck /><strong>{evidence.length}</strong><span>evidencias registradas</span></article>
        <article><BarChart3 /><strong>{achieved}</strong><span>evidencias logradas</span></article>
        <article><Users /><strong>{supported}</strong><span>con apoyo registrado</span></article>
      </section>

      <div className="progress-grid">
        <section className="premium-card progress-evidence-panel">
          <div className="section-title">
            <div>
              <span className="eyebrow">Seguimiento curricular</span>
              <h2>Evidencias por estudiante y OA</h2>
              <p>Registros reales, ordenados por fecha y nivel de logro.</p>
            </div>
            <span>{developing} en desarrollo</span>
          </div>

          <div className="progress-toolbar">
            <label><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar estudiante, OA o evidencia" /></label>
            <label><Filter size={17} /><select value={levelFilter} onChange={(event) => setLevelFilter(event.target.value)}><option value="all">Todos los niveles</option><option value="achieved">Logrado</option><option value="developing">En desarrollo</option><option value="initial">Inicial</option><option value="not_observed">No observado</option></select></label>
          </div>

          <div className="progress-list">
            {filteredEvidence.length ? filteredEvidence.map((item) => {
              const name = item.students?.preferred_name || (item.students ? `${item.students.first_name} ${item.students.last_name}` : 'Estudiante')
              return (
                <article className="progress-record" key={item.id}>
                  <div className="progress-record-top">
                    <div><strong>{name}</strong><span>{item.learning_objectives ? `${item.learning_objectives.subject} · ${item.learning_objectives.code}` : 'Objetivo'}</span></div>
                    <em className={`achievement-${item.achievement_level}`}>{levelLabels[item.achievement_level] ?? item.achievement_level}</em>
                  </div>
                  <h3>{item.learning_objectives?.title ?? 'Objetivo de aprendizaje'}</h3>
                  <p>{item.description}</p>
                  <div className="progress-record-meta">
                    <span>{typeLabels[item.evidence_type] ?? item.evidence_type}</span>
                    <span>{new Date(`${item.observed_at}T00:00:00`).toLocaleDateString('es-CL')}</span>
                    {item.support_used && <span>Apoyo: {item.support_used}</span>}
                  </div>
                </article>
              )
            }) : (
              <div className="command-empty"><BookOpenCheck /><strong>No hay evidencias para este filtro</strong><span>Registra la primera evidencia o ajusta la búsqueda.</span></div>
            )}
          </div>
        </section>

        <aside className="progress-side">
          <form action={objectiveAction} className="premium-card progress-form">
            <div><span className="eyebrow"><Plus size={15} /> Nuevo OA</span><h2>Crear objetivo</h2><p>Asocia el objetivo a un curso o déjalo como referencia institucional.</p></div>
            <div className="form-two"><label>Asignatura<input name="subject" required maxLength={80} placeholder="Lenguaje" /></label><label>Código<input name="code" required maxLength={40} placeholder="OA 4" /></label></div>
            <label>Descripción breve<input name="title" required maxLength={200} placeholder="Profundizar la comprensión de narraciones" /></label>
            <label>Detalle<textarea name="description" rows={3} placeholder="Indicadores o foco del objetivo" /></label>
            <div className="form-two"><label>Curso<select name="courseId" defaultValue=""><option value="">Institucional</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.name} · {course.level}</option>)}</select></label><label>Año<input name="academicYear" type="number" min="2000" max="2200" defaultValue={new Date().getFullYear()} /></label></div>
            <button className="btn btn-primary" disabled={objectivePending}><Target size={17} />{objectivePending ? 'Guardando…' : 'Crear objetivo'}</button>
            {objectiveState.message && <p className={`save-status ${objectiveState.status}`}>{objectiveState.message}</p>}
          </form>

          <form action={evidenceAction} className="premium-card progress-form">
            <div><span className="eyebrow"><ClipboardPlus size={15} /> Nueva evidencia</span><h2>Registrar avance</h2><p>Describe el desempeño observado y el apoyo que fue necesario.</p></div>
            <label>Estudiante<select name="studentId" required defaultValue=""><option value="" disabled>Selecciona estudiante</option>{students.map((student) => <option value={student.id} key={student.id}>{student.preferred_name || `${student.first_name} ${student.last_name}`}</option>)}</select></label>
            <label>Objetivo<select name="objectiveId" required defaultValue=""><option value="" disabled>Selecciona OA</option>{objectives.map((objective) => <option value={objective.id} key={objective.id}>{objective.subject} · {objective.code} · {objective.title}</option>)}</select></label>
            <label>Curso<select name="courseId" defaultValue=""><option value="">Sin curso específico</option>{courses.map((course) => <option value={course.id} key={course.id}>{course.name} · {course.level}</option>)}</select></label>
            <div className="form-two"><label>Tipo<select name="evidenceType" defaultValue="observation"><option value="written">Trabajo escrito</option><option value="oral">Respuesta oral</option><option value="performance">Desempeño</option><option value="project">Proyecto</option><option value="observation">Observación</option><option value="assessment">Evaluación</option><option value="other">Otra</option></select></label><label>Fecha<input name="observedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label></div>
            <label>Evidencia observada<textarea name="description" rows={4} required placeholder="Describe el logro, la respuesta o el desempeño observable" /></label>
            <div className="form-two"><label>Nivel de logro<select name="achievementLevel" defaultValue="developing"><option value="achieved">Logrado</option><option value="developing">En desarrollo</option><option value="initial">Inicial</option><option value="not_observed">No observado</option></select></label><label>Autonomía<select name="autonomyLevel" defaultValue="partial_support"><option value="independent">Independiente</option><option value="partial_support">Apoyo parcial</option><option value="full_support">Apoyo permanente</option><option value="not_observed">No observado</option></select></label></div>
            <label>Apoyo utilizado<input name="supportUsed" maxLength={500} placeholder="Lectura mediada, pictogramas, material concreto…" /></label>
            <button className="btn btn-primary" disabled={evidencePending}><ClipboardPlus size={17} />{evidencePending ? 'Guardando…' : 'Guardar evidencia'}</button>
            {evidenceState.message && <p className={`save-status ${evidenceState.status}`}>{evidenceState.message}</p>}
          </form>
        </aside>
      </div>
    </div>
  )
}
