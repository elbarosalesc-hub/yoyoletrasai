'use client'

import { startTransition, useMemo, useState } from 'react'
import { CheckCircle2, ClipboardCheck, Copy, Eye, Plus, Save, Search, Send, Sparkles, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { saveAssessment, type AssessmentDraftInput, type AssessmentQuestion, type AssessmentRubric } from './actions'

type StoredAssessment = {
  id: string
  title: string
  assessment_type: string
  status: string
  total_points: number
  updated_at: string
  description: string | null
}

type Props = { assessments: StoredAssessment[] }

const initialQuestions: AssessmentQuestion[] = [
  { id: 'q-1', prompt: '¿Qué emoción siente el personaje principal al inicio del texto?', type: 'Selección múltiple', points: 2, options: ['Preocupación', 'Alegría', 'Enojo', 'Sorpresa'] },
  { id: 'q-2', prompt: 'Escribe dos pistas del texto que apoyen tu respuesta.', type: 'Desarrollo', points: 4 },
  { id: 'q-3', prompt: 'Explica oralmente la idea principal del texto.', type: 'Respuesta oral', points: 4 },
]

const initialRubric: AssessmentRubric[] = [
  { id: 'r-1', title: 'Comprensión', description: 'Reconoce información relevante del texto.', points: 4 },
  { id: 'r-2', title: 'Inferencia', description: 'Relaciona pistas y formula una conclusión coherente.', points: 4 },
  { id: 'r-3', title: 'Comunicación', description: 'Explica su respuesta con claridad.', points: 2 },
]

function parseAssessment(item: StoredAssessment): AssessmentDraftInput {
  try {
    const parsed = JSON.parse(item.description ?? '{}') as Partial<AssessmentDraftInput>
    return {
      id: item.id,
      title: item.title,
      level: parsed.level ?? '3.º básico',
      variant: parsed.variant ?? item.assessment_type,
      status: item.status === 'published' ? 'published' : 'draft',
      questions: parsed.questions?.length ? parsed.questions : initialQuestions,
      rubric: parsed.rubric?.length ? parsed.rubric : initialRubric,
    }
  } catch {
    return { id: item.id, title: item.title, level: '3.º básico', variant: item.assessment_type, status: 'draft', questions: initialQuestions, rubric: initialRubric }
  }
}

const freshDraft = (): AssessmentDraftInput => ({
  title: 'Nueva evaluación', level: '3.º básico', variant: 'Estándar', status: 'draft', questions: initialQuestions, rubric: initialRubric,
})

export function EvaluacionesClient({ assessments }: Props) {
  const [items, setItems] = useState(assessments)
  const [draft, setDraft] = useState<AssessmentDraftInput>(freshDraft)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'editor' | 'preview'>('editor')
  const [feedback, setFeedback] = useState('Borrador listo para editar')
  const [pending, setPending] = useState(false)

  const total = useMemo(() => draft.questions.reduce((sum, q) => sum + q.points, 0), [draft.questions])
  const visibleItems = useMemo(() => items.filter(item => `${item.title} ${item.assessment_type}`.toLowerCase().includes(query.toLowerCase())), [items, query])

  function updateQuestion(id: string, patch: Partial<AssessmentQuestion>) {
    setDraft(current => ({ ...current, questions: current.questions.map(question => question.id === id ? { ...question, ...patch } : question) }))
  }

  function addQuestion() {
    setDraft(current => ({ ...current, questions: [...current.questions, { id: crypto.randomUUID(), prompt: 'Nueva pregunta', type: 'Selección múltiple', points: 2, options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'] }] }))
  }

  function createVariant() {
    const nextVariant = draft.variant === 'Estándar' ? 'TDA/TDAH' : draft.variant === 'TDA/TDAH' ? 'DIL' : 'Estándar'
    setDraft(current => ({ ...current, id: undefined, title: `${current.title} · ${nextVariant}`, variant: nextVariant, status: 'draft' }))
    setFeedback(`Versión ${nextVariant} creada. Revisa y guarda antes de publicar.`)
  }

  function persist(status: 'draft' | 'published') {
    setPending(true)
    setFeedback(status === 'published' ? 'Publicando evaluación…' : 'Guardando evaluación…')
    startTransition(async () => {
      const result = await saveAssessment({ ...draft, status })
      if (!result.ok) {
        setFeedback(result.error)
        setPending(false)
        return
      }
      const updated = { ...draft, id: result.id, status }
      setDraft(updated)
      setItems(current => {
        const stored: StoredAssessment = { id: result.id, title: updated.title, assessment_type: updated.variant, status, total_points: total, updated_at: result.updatedAt, description: JSON.stringify(updated) }
        return [stored, ...current.filter(item => item.id !== result.id)]
      })
      setFeedback(status === 'published' ? 'Evaluación publicada y disponible para asignar.' : 'Evaluación guardada correctamente en la institución.')
      setPending(false)
    })
  }

  return <AppShell active="Evaluaciones">
    <div className="assessment-workspace">
      <section className="assessment-command">
        <div><span className="eyebrow">Centro de evaluación</span><h1>Diseña, diversifica y publica instrumentos</h1><p>Construye evaluaciones con preguntas multimodales, rúbricas y versiones equivalentes vinculadas a tu institución.</p></div>
        <div className="assessment-command-actions"><button className="btn btn-soft" onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}><Eye size={17}/>{view === 'editor' ? 'Vista estudiante' : 'Volver al editor'}</button><button className="btn btn-coral" onClick={createVariant}><Sparkles size={17}/>Crear variante</button></div>
      </section>

      <div className="assessment-shell-grid">
        <aside className="assessment-library premium-card">
          <div className="assessment-library-head"><div><h2>Mis evaluaciones</h2><span>{items.length} guardadas</span></div><button className="icon-button" onClick={() => { setDraft(freshDraft()); setView('editor') }} aria-label="Nueva evaluación"><Plus/></button></div>
          <label className="assessment-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar evaluación"/></label>
          <div className="assessment-list">{visibleItems.length ? visibleItems.map(item => <button key={item.id} className={draft.id === item.id ? 'active' : ''} onClick={() => { setDraft(parseAssessment(item)); setView('editor'); setFeedback('Evaluación cargada para editar') }}><span><ClipboardCheck/></span><div><b>{item.title}</b><small>{item.assessment_type} · {item.total_points} puntos</small></div><em className={item.status === 'published' ? 'published' : ''}>{item.status === 'published' ? 'Publicada' : 'Borrador'}</em></button>) : <div className="assessment-empty"><ClipboardCheck/><b>No hay resultados</b><span>Prueba otra búsqueda o crea una evaluación.</span></div>}</div>
        </aside>

        <main className="assessment-canvas premium-card">
          {view === 'editor' ? <>
            <div className="assessment-meta-grid">
              <label>Título<input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))}/></label>
              <label>Nivel<select value={draft.level} onChange={event => setDraft(current => ({ ...current, level: event.target.value }))}><option>1.º básico</option><option>2.º básico</option><option>3.º básico</option><option>4.º básico</option><option>5.º básico</option><option>6.º básico</option><option>Multinivel</option></select></label>
              <label>Versión<select value={draft.variant} onChange={event => setDraft(current => ({ ...current, variant: event.target.value }))}><option>Estándar</option><option>TDA/TDAH</option><option>DIL</option><option>TEA</option><option>Lectura mediada</option></select></label>
            </div>
            <div className="assessment-summary"><span><b>{draft.questions.length}</b> preguntas</span><span><b>{total}</b> puntos</span><span><b>{draft.rubric.length}</b> criterios</span><span><b>{draft.status === 'published' ? 'Publicada' : 'Borrador'}</b> estado</span></div>
            <div className="question-editor-list">{draft.questions.map((question, index) => <article key={question.id} className="question-editor-card"><div className="question-index">{index + 1}</div><div className="question-editor-fields"><textarea value={question.prompt} onChange={event => updateQuestion(question.id, { prompt: event.target.value })} rows={2}/><div className="question-controls"><select value={question.type} onChange={event => updateQuestion(question.id, { type: event.target.value as AssessmentQuestion['type'] })}><option>Selección múltiple</option><option>Desarrollo</option><option>Respuesta oral</option></select><label>Puntos<input type="number" min="1" max="50" value={question.points} onChange={event => updateQuestion(question.id, { points: Number(event.target.value) })}/></label></div>{question.type === 'Selección múltiple' ? <div className="option-grid">{(question.options ?? []).map((option, optionIndex) => <input key={optionIndex} value={option} onChange={event => updateQuestion(question.id, { options: (question.options ?? []).map((value, indexValue) => indexValue === optionIndex ? event.target.value : value) })}/>)}</div> : null}</div><button className="delete-question" onClick={() => setDraft(current => ({ ...current, questions: current.questions.filter(item => item.id !== question.id) }))} aria-label="Eliminar pregunta"><Trash2/></button></article>)}</div>
            <button className="assessment-add-question" onClick={addQuestion}><Plus/>Agregar pregunta</button>
          </> : <section className="student-preview"><div className="student-preview-head"><span>{draft.level} · {draft.variant}</span><h2>{draft.title}</h2><p>Lee atentamente y responde cada pregunta. Puedes solicitar los apoyos autorizados.</p></div>{draft.questions.map((question, index) => <article key={question.id}><b>{index + 1}. {question.prompt}</b><small>{question.points} puntos · {question.type}</small>{question.type === 'Selección múltiple' ? <div>{question.options?.map(option => <label key={option}><input type="radio" name={question.id}/>{option}</label>)}</div> : <textarea rows={question.type === 'Respuesta oral' ? 2 : 5} placeholder={question.type === 'Respuesta oral' ? 'Registro de respuesta oral' : 'Escribe tu respuesta'}/>}</article>)}</section>}
        </main>

        <aside className="assessment-inspector premium-card">
          <div className="inspector-heading"><ClipboardCheck/><div><h2>Rúbrica</h2><p>Criterios editables</p></div></div>
          <div className="rubric-editor">{draft.rubric.map((criterion, index) => <article key={criterion.id}><span>{index + 1}</span><div><input value={criterion.title} onChange={event => setDraft(current => ({ ...current, rubric: current.rubric.map(item => item.id === criterion.id ? { ...item, title: event.target.value } : item) }))}/><textarea rows={2} value={criterion.description} onChange={event => setDraft(current => ({ ...current, rubric: current.rubric.map(item => item.id === criterion.id ? { ...item, description: event.target.value } : item) }))}/></div><input type="number" value={criterion.points} min="1" onChange={event => setDraft(current => ({ ...current, rubric: current.rubric.map(item => item.id === criterion.id ? { ...item, points: Number(event.target.value) } : item) }))}/></article>)}</div>
          <button className="rubric-add" onClick={() => setDraft(current => ({ ...current, rubric: [...current.rubric, { id: crypto.randomUUID(), title: 'Nuevo criterio', description: 'Describe el desempeño esperado.', points: 2 }] }))}><Plus/>Agregar criterio</button>
          <div className="quality-panel"><CheckCircle2/><div><b>Control pedagógico</b><p>La versión mantiene el objetivo, permite respuestas multimodales y requiere revisión docente antes de publicar.</p></div></div>
          <div className="assessment-save-box"><p aria-live="polite">{feedback}</p><button disabled={pending} className="btn btn-soft" onClick={() => persist('draft')}><Save/>Guardar borrador</button><button disabled={pending} className="btn btn-primary" onClick={() => persist('published')}><Send/>Publicar</button></div>
          <button className="duplicate-action" onClick={() => { setDraft(current => ({ ...current, id: undefined, title: `${current.title} · copia`, status: 'draft' })); setFeedback('Copia creada como nuevo borrador.') }}><Copy/>Duplicar instrumento</button>
        </aside>
      </div>
    </div>
  </AppShell>
}
