'use client'

import { useActionState, useMemo, useState } from 'react'
import { BarChart3, BookOpenCheck, CalendarDays, Plus, Save, Target } from 'lucide-react'
import {
  createLearningEvidence,
  createLearningObjective,
  initialEvidenceActionState,
} from './evidence-actions'

type Objective = {
  id: string
  subject: string
  code: string
  title: string
  academic_year: number
  course_id: string | null
}

type Evidence = {
  id: string
  description: string
  evidence_type: string
  achievement_level: string
  support_used: string | null
  autonomy_level: string | null
  observed_at: string
  learning_objectives: { subject: string; code: string; title: string } | null
}

type Course = {
  id: string
  name: string
  level: string
  academic_year: number
} | null

const achievementLabels: Record<string, string> = {
  achieved: 'Logrado',
  developing: 'En desarrollo',
  initial: 'Inicial',
  not_observed: 'No observado',
}

const evidenceTypeLabels: Record<string, string> = {
  written: 'Trabajo escrito',
  oral: 'Respuesta oral',
  performance: 'Desempeño práctico',
  project: 'Proyecto',
  observation: 'Observación',
  assessment: 'Evaluación',
  other: 'Otra evidencia',
}

export function LearningEvidencePanel({
  studentId,
  course,
  objectives,
  evidence,
}: {
  studentId: string
  course: Course
  objectives: Objective[]
  evidence: Evidence[]
}) {
  const [showObjectiveForm, setShowObjectiveForm] = useState(false)
  const objectiveAction = createLearningObjective.bind(null, studentId)
  const evidenceAction = createLearningEvidence.bind(null, studentId)
  const [objectiveState, objectiveFormAction, objectivePending] = useActionState(objectiveAction, initialEvidenceActionState)
  const [evidenceState, evidenceFormAction, evidencePending] = useActionState(evidenceAction, initialEvidenceActionState)

  const stats = useMemo(() => {
    const total = evidence.length
    const achieved = evidence.filter((item) => item.achievement_level === 'achieved').length
    const developing = evidence.filter((item) => item.achievement_level === 'developing').length
    const withSupport = evidence.filter((item) => item.autonomy_level === 'partial_support' || item.autonomy_level === 'full_support').length
    return { total, achieved, developing, withSupport }
  }, [evidence])

  return (
    <section className="learning-evidence-section">
      <div className="learning-evidence-heading">
        <div>
          <span className="eyebrow"><Target size={15} /> Seguimiento por OA</span>
          <h2>Evidencias y progreso de aprendizaje</h2>
          <p>Registra resultados observables y apoyos utilizados, vinculados a objetivos reales.</p>
        </div>
        <button className="btn btn-soft" type="button" onClick={() => setShowObjectiveForm((value) => !value)}>
          <Plus size={17} /> {showObjectiveForm ? 'Cerrar objetivo' : 'Crear objetivo'}
        </button>
      </div>

      <div className="learning-stats">
        <article><BookOpenCheck /><strong>{stats.total}</strong><span>evidencias</span></article>
        <article><Target /><strong>{stats.achieved}</strong><span>logros consolidados</span></article>
        <article><BarChart3 /><strong>{stats.developing}</strong><span>en desarrollo</span></article>
        <article><CalendarDays /><strong>{stats.withSupport}</strong><span>con apoyo</span></article>
      </div>

      {showObjectiveForm && (
        <form action={objectiveFormAction} className="premium-card objective-form">
          <div><h3>Nuevo objetivo de aprendizaje</h3><p>Puede asociarse al curso activo o quedar como objetivo institucional.</p></div>
          <input type="hidden" name="courseId" value={course?.id ?? ''} />
          <div className="form-two">
            <label>Asignatura<input name="subject" required maxLength={80} placeholder="Lenguaje y Comunicación" /></label>
            <label>Código OA<input name="code" required maxLength={40} placeholder="OA 4" /></label>
          </div>
          <label>Objetivo<input name="title" required maxLength={200} placeholder="Inferir información a partir de pistas del texto." /></label>
          <label>Descripción complementaria<textarea name="objectiveDescription" rows={3} maxLength={2000} /></label>
          <label>Año escolar<input name="academicYear" type="number" min={2000} max={2200} defaultValue={course?.academic_year ?? new Date().getFullYear()} required /></label>
          <div className="support-form-actions">
            <button className="btn btn-primary" disabled={objectivePending}><Save size={17} />{objectivePending ? 'Guardando…' : 'Guardar objetivo'}</button>
            {objectiveState.message && <p className={`save-status ${objectiveState.status}`}>{objectiveState.message}</p>}
          </div>
        </form>
      )}

      <div className="learning-evidence-layout">
        <form action={evidenceFormAction} className="premium-card evidence-register-form">
          <div><h3>Registrar nueva evidencia</h3><p>Describe lo observado, el apoyo utilizado y el grado de autonomía.</p></div>
          <input type="hidden" name="courseId" value={course?.id ?? ''} />
          <label>Objetivo de aprendizaje
            <select name="objectiveId" required defaultValue="">
              <option value="" disabled>Selecciona un objetivo</option>
              {objectives.map((objective) => (
                <option value={objective.id} key={objective.id}>{objective.subject} · {objective.code} · {objective.title}</option>
              ))}
            </select>
          </label>
          <div className="form-two">
            <label>Tipo de evidencia
              <select name="evidenceType" defaultValue="observation">
                <option value="written">Trabajo escrito</option>
                <option value="oral">Respuesta oral</option>
                <option value="performance">Desempeño práctico</option>
                <option value="project">Proyecto</option>
                <option value="observation">Observación</option>
                <option value="assessment">Evaluación</option>
                <option value="other">Otra</option>
              </select>
            </label>
            <label>Fecha observada<input name="observedAt" type="date" defaultValue={new Date().toISOString().slice(0, 10)} /></label>
          </div>
          <label>Resultado observado<textarea name="description" rows={4} required maxLength={2000} placeholder="Describe el desempeño de forma concreta y observable." /></label>
          <div className="form-two">
            <label>Nivel de logro
              <select name="achievementLevel" defaultValue="developing">
                <option value="achieved">Logrado</option>
                <option value="developing">En desarrollo</option>
                <option value="initial">Inicial</option>
                <option value="not_observed">No observado</option>
              </select>
            </label>
            <label>Autonomía
              <select name="autonomyLevel" defaultValue="partial_support">
                <option value="independent">Independiente</option>
                <option value="partial_support">Apoyo parcial</option>
                <option value="full_support">Apoyo permanente</option>
                <option value="not_observed">No observado</option>
              </select>
            </label>
          </div>
          <label>Apoyo utilizado<textarea name="supportUsed" rows={3} maxLength={1000} placeholder="Lectura mediada, pictogramas, material concreto, tiempo adicional…" /></label>
          <div className="support-form-actions">
            <button className="btn btn-primary" disabled={evidencePending || objectives.length === 0}><Save size={17} />{evidencePending ? 'Guardando…' : 'Guardar evidencia'}</button>
            {objectives.length === 0 && <p className="save-status warning">Crea primero un objetivo de aprendizaje.</p>}
            {evidenceState.message && <p className={`save-status ${evidenceState.status}`}>{evidenceState.message}</p>}
          </div>
        </form>

        <div className="premium-card evidence-timeline-card">
          <div><h3>Historial de evidencias</h3><p>Registros ordenados desde el más reciente.</p></div>
          <div className="evidence-timeline">
            {evidence.length ? evidence.map((item) => (
              <article key={item.id}>
                <div className="evidence-timeline-top">
                  <span className={`achievement-badge achievement-${item.achievement_level}`}>{achievementLabels[item.achievement_level] ?? item.achievement_level}</span>
                  <time>{new Intl.DateTimeFormat('es-CL').format(new Date(`${item.observed_at}T12:00:00`))}</time>
                </div>
                <strong>{item.learning_objectives ? `${item.learning_objectives.subject} · ${item.learning_objectives.code}` : 'Objetivo'}</strong>
                <small>{item.learning_objectives?.title}</small>
                <p>{item.description}</p>
                <div className="evidence-meta-line">
                  <span>{evidenceTypeLabels[item.evidence_type] ?? item.evidence_type}</span>
                  {item.support_used && <span>Apoyo: {item.support_used}</span>}
                </div>
              </article>
            )) : (
              <div className="command-empty"><BookOpenCheck /><strong>Sin evidencias registradas</strong><span>El historial se construirá con registros reales.</span></div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
