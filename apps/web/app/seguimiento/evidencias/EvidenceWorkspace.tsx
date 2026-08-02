'use client'

import { useActionState, useMemo, useState } from 'react'
import { BarChart3, BookOpenCheck, ClipboardPlus, Search, Target } from 'lucide-react'
import { createEvidence, createObjective, initialEvidenceActionState } from './actions'

type Course = { id: string; name: string; level: string; academic_year: number }
type Student = { id: string; first_name: string; last_name: string; preferred_name: string | null }
type Objective = { id: string; course_id: string | null; subject: string; code: string; title: string; academic_year: number }
type Evidence = {
  id: string
  description: string
  achievement_level: string
  evidence_type: string
  observed_at: string
  support_used: string | null
  autonomy_level: string | null
  students: { first_name: string; last_name: string; preferred_name: string | null } | null
  learning_objectives: { code: string; title: string; subject: string } | null
}

const achievementLabels: Record<string, string> = {
  achieved: 'Logrado',
  developing: 'En desarrollo',
  initial: 'Inicial',
  not_observed: 'Sin evidencia',
}

export function EvidenceWorkspace({
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
  const [query, setQuery] = useState('')
  const [objectiveState, objectiveAction, objectivePending] = useActionState(createObjective, initialEvidenceActionState)
  const [evidenceState, evidenceAction, evidencePending] = useActionState(createEvidence, initialEvidenceActionState)

  const filteredEvidence = useMemo(() => {
    const value = query.trim().toLowerCase()
    if (!value) return evidence
    return evidence.filter((item) => {
      const student = item.students ? `${item.students.first_name} ${item.students.last_name} ${item.students.preferred_name ?? ''}` : ''
      const objective = item.learning_objectives ? `${item.learning_objectives.code} ${item.learning_objectives.title} ${item.learning_objectives.subject}` : ''
      return `${student} ${objective} ${item.description}`.toLowerCase().includes(value)
    })
  }, [evidence, query])

  const achieved = evidence.filter((item) => item.achievement_level === 'achieved').length
  const developing = evidence.filter((item) => item.achievement_level === 'developing').length

  return (
    <div className="evidence-workspace">
      <section className="tracking-stats evidence-stats">
        <article><Target /><strong>{objectives.length}</strong><span>objetivos activos</span></article>
        <article><ClipboardPlus /><strong>{evidence.length}</strong><span>evidencias registradas</span></article>
        <article><BookOpenCheck /><strong>{achieved}</strong><span>logros observados</span></article>
        <article><BarChart3 /><strong>{developing}</strong><span>en desarrollo</span></article>
      </section>

      <div className="evidence-grid">
        <section className="premium-card evidence-list-card">
          <div className="section-title">
            <div><span className="eyebrow">Seguimiento real</span><h2>Historial de evidencias</h2><p>Registros vinculados a estudiante, OA, nivel de logro y apoyo utilizado.</p></div>
          </div>
          <label className="student-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar estudiante, OA o evidencia" /></label>
          <div className="learning-evidence-list">
            {filteredEvidence.length ? filteredEvidence.map((item) => {
              const studentName = item.students?.preferred_name || (item.students ? `${item.students.first_name} ${item.students.last_name}` : 'Estudiante')
              return (
                <article key={item.id} className="learning-evidence-item">
                  <div className="learning-evidence-top">
                    <div><strong>{studentName}</strong><span>{item.learning_objectives ? `${item.learning_objectives.subject} · ${item.learning_objectives.code}` : 'Objetivo'}</span></div>
                    <em className={`achievement-${item.achievement_level}`}>{achievementLabels[item.achievement_level] ?? item.achievement_level}</em>
                  </div>
                  <p>{item.description}</p>
                  <div className="learning-evidence-meta">
                    <span>{new Date(`${item.observed_at}T00:00:00`).toLocaleDateString('es-CL')}</span>
                    <span>{item.support_used || 'Sin apoyo registrado'}</span>
                    <span>{item.autonomy_level === 'independent' ? 'Independiente' : item.autonomy_level === 'partial_support' ? 'Apoyo parcial' : item.autonomy_level === 'full_support' ? 'Apoyo completo' : 'Autonomía no observada'}</span>
                  </div>
                </article>
              )
            }) : <div className="command-empty"><ClipboardPlus /><strong>Sin evidencias registradas</strong><span>Usa el formulario para registrar la primera evidencia.</span></div>}
          </div>
        </section>

        <aside className="evidence-side">
          <form action={evidenceAction} className="premium-card evidence-form">
            <div><span className="eyebrow">Nuevo registro</span><h2>Registrar evidencia</h2></div>
            <label>Estudiante<select name="studentId" required defaultValue=""><option value="" disabled>Seleccionar estudiante</option>{students.map((student) => <option key={student.id} value={student.id}>{student.preferred_name || `${student.first_name} ${student.last_name}`}</option>)}</select></label>
            <label>Objetivo de aprendizaje<select name="objectiveId" required defaultValue=""><option value="" disabled>Seleccionar objetivo</option>{objectives.map((objective) => <option key={objective.id} value={objective.id}>{objective.subject} · {objective.code} · {objective.title}</option>)}</select></label>
            <label>Curso<select name="courseId" defaultValue=""><option value="">Sin curso específico</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name} · {course.level}</option>)}</select></label>
            <div className="form-two"><label>Tipo<select name="evidenceType" defaultValue="observation"><option value="observation">Observación</option><option value="written">Trabajo escrito</option><option value="oral">Respuesta oral</option><option value="performance">Desempeño</option><option value="project">Proyecto</option><option value="assessment">Evaluación</option><option value="other">Otro</option></select></label><label>Nivel<select name="achievementLevel" defaultValue="developing"><option value="achieved">Logrado</option><option value="developing">En desarrollo</option><option value="initial">Inicial</option><option value="not_observed">Sin evidencia suficiente</option></select></label></div>
            <label>Descripción<textarea name="description" required minLength={2} maxLength={2000} rows={4} placeholder="Describe el desempeño observado y la evidencia concreta." /></label>
            <label>Apoyo utilizado<input name="supportUsed" maxLength={500} placeholder="Lectura mediada, pictogramas, material concreto..." /></label>
            <div className="form-two"><label>Autonomía<select name="autonomyLevel" defaultValue="partial_support"><option value="independent">Independiente</option><option value="partial_support">Apoyo parcial</option><option value="full_support">Apoyo completo</option><option value="not_observed">No observado</option></select></label><label>Fecha<input name="observedAt" type="date" /></label></div>
            <button className="btn btn-primary" disabled={evidencePending}><ClipboardPlus size={17} />{evidencePending ? 'Guardando…' : 'Guardar evidencia'}</button>
            {evidenceState.message && <p className={`save-status ${evidenceState.status}`}>{evidenceState.message}</p>}
          </form>

          <form action={objectiveAction} className="premium-card evidence-form">
            <div><span className="eyebrow">Planificación</span><h2>Crear objetivo de aprendizaje</h2></div>
            <div className="form-two"><label>Asignatura<input name="subject" required maxLength={80} /></label><label>Código<input name="code" required maxLength={40} placeholder="OA 4" /></label></div>
            <label>Descripción breve<input name="title" required maxLength={200} /></label>
            <label>Detalle<textarea name="description" rows={3} maxLength={1000} /></label>
            <div className="form-two"><label>Curso<select name="courseId" defaultValue=""><option value="">Objetivo institucional</option>{courses.map((course) => <option key={course.id} value={course.id}>{course.name} · {course.level}</option>)}</select></label><label>Año<input name="academicYear" type="number" min="2000" max="2200" defaultValue={new Date().getFullYear()} required /></label></div>
            <button className="btn btn-soft" disabled={objectivePending}><Target size={17} />{objectivePending ? 'Guardando…' : 'Crear objetivo'}</button>
            {objectiveState.message && <p className={`save-status ${objectiveState.status}`}>{objectiveState.message}</p>}
          </form>
        </aside>
      </div>
    </div>
  )
}
