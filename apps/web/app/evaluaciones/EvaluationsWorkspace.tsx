'use client'

import { useMemo, useState, useTransition } from 'react'
import { CheckCircle2, ClipboardCheck, Eye, Plus, Save, Send, Sparkles, Trash2 } from 'lucide-react'
import { saveAssessment, type AssessmentQuestion, type AssessmentRubric } from './actions'

type AssessmentSummary = {
  id: string
  title: string
  assessment_type: string
  status: string
  total_points: number
  updated_at: string
  description: string | null
}

type Props = { initialAssessments: AssessmentSummary[] }

const defaultQuestions: AssessmentQuestion[] = [
  { id: 'q1', prompt: '¿Qué emoción siente Sofía antes de entrar a la cabaña?', type: 'Selección múltiple', points: 2, options: ['Está preocupada', 'Está enojada', 'Está aburrida', 'Está sorprendida'] },
  { id: 'q2', prompt: 'Escribe dos pistas del texto que apoyen tu respuesta.', type: 'Desarrollo', points: 4 },
  { id: 'q3', prompt: 'Explica oralmente por qué Sofía espera a la profesora.', type: 'Respuesta oral', points: 4 },
]

const defaultRubric: AssessmentRubric[] = [
  { id: 'r1', title: 'Uso de pistas', description: 'Identifica información pertinente del texto.', points: 4 },
  { id: 'r2', title: 'Inferencia', description: 'Formula una conclusión coherente.', points: 4 },
  { id: 'r3', title: 'Justificación', description: 'Relaciona las pistas con su respuesta.', points: 4 },
]

function parseDraft(item: AssessmentSummary) {
  try {
    const parsed = JSON.parse(item.description || '{}')
    return {
      level: parsed.level || '3.º básico',
      variant: parsed.variant || item.assessment_type || 'Estándar',
      questions: Array.isArray(parsed.questions) ? parsed.questions : defaultQuestions,
      rubric: Array.isArray(parsed.rubric) ? parsed.rubric : defaultRubric,
    }
  } catch {
    return { level: '3.º básico', variant: item.assessment_type || 'Estándar', questions: defaultQuestions, rubric: defaultRubric }
  }
}

export function EvaluationsWorkspace({ initialAssessments }: Props) {
  const [items, setItems] = useState(initialAssessments)
  const [selectedId, setSelectedId] = useState<string | undefined>(initialAssessments[0]?.id)
  const selected = items.find((item) => item.id === selectedId)
  const parsed = selected ? parseDraft(selected) : null
  const [title, setTitle] = useState(selected?.title || 'Comprensión inferencial: El bosque nativo')
  const [level, setLevel] = useState(parsed?.level || '3.º básico')
  const [variant, setVariant] = useState(parsed?.variant || 'Estándar')
  const [questions, setQuestions] = useState<AssessmentQuestion[]>(parsed?.questions || defaultQuestions)
  const [rubric, setRubric] = useState<AssessmentRubric[]>(parsed?.rubric || defaultRubric)
  const [feedback, setFeedback] = useState('Borrador listo para editar')
  const [preview, setPreview] = useState(false)
  const [isPending, startTransition] = useTransition()
  const total = useMemo(() => questions.reduce((sum, question) => sum + Number(question.points || 0), 0), [questions])

  function openAssessment(item: AssessmentSummary) {
    const draft = parseDraft(item)
    setSelectedId(item.id)
    setTitle(item.title)
    setLevel(draft.level)
    setVariant(draft.variant)
    setQuestions(draft.questions)
    setRubric(draft.rubric)
    setFeedback('Evaluación cargada')
  }

  function newAssessment() {
    setSelectedId(undefined)
    setTitle('Nueva evaluación')
    setLevel('3.º básico')
    setVariant('Estándar')
    setQuestions(defaultQuestions)
    setRubric(defaultRubric)
    setFeedback('Nuevo borrador')
  }

  function persist(status: 'draft' | 'published') {
    startTransition(async () => {
      setFeedback(status === 'published' ? 'Publicando…' : 'Guardando…')
      const result = await saveAssessment({ id: selectedId, title, level, variant, status, questions, rubric })
      if (!result.ok) {
        setFeedback(result.error || 'No fue posible guardar')
        return
      }
      const next: AssessmentSummary = {
        id: result.id!, title, assessment_type: variant, status, total_points: total,
        updated_at: result.updatedAt!, description: JSON.stringify({ level, variant, questions, rubric }),
      }
      setItems((current) => [next, ...current.filter((item) => item.id !== next.id)])
      setSelectedId(next.id)
      setFeedback(status === 'published' ? 'Evaluación publicada' : 'Borrador guardado en Supabase')
    })
  }

  function updateQuestion(id: string, key: keyof AssessmentQuestion, value: string | number | string[]) {
    setQuestions((current) => current.map((question) => question.id === id ? { ...question, [key]: value } : question))
  }

  function diversify() {
    const next = variant === 'Estándar' ? 'TDA/TDAH' : variant === 'TDA/TDAH' ? 'DIL' : 'Estándar'
    setVariant(next)
    setFeedback(`Versión ${next} generada para revisión docente`)
  }

  return <div className="evaluation-workspace">
    <aside className="evaluation-library">
      <div className="evaluation-library-head"><div><span>Instrumentos</span><strong>{items.length} guardados</strong></div><button onClick={newAssessment}><Plus size={17}/>Nuevo</button></div>
      <div className="evaluation-list">{items.length ? items.map((item) => <button key={item.id} className={item.id === selectedId ? 'active' : ''} onClick={() => openAssessment(item)}><span><ClipboardCheck size={17}/></span><div><strong>{item.title}</strong><small>{item.assessment_type} · {item.total_points} pts</small></div><em>{item.status === 'published' ? 'Publicada' : 'Borrador'}</em></button>) : <div className="evaluation-empty"><ClipboardCheck/><strong>Aún no hay evaluaciones</strong><span>Crea y guarda el primer instrumento institucional.</span></div>}</div>
    </aside>

    <section className="evaluation-editor">
      <header className="evaluation-editor-header"><div><span>Constructor institucional</span><h1>{title || 'Evaluación sin título'}</h1><p>{feedback}</p></div><div className="evaluation-actions"><button className="btn btn-soft" onClick={() => setPreview((value) => !value)}><Eye size={17}/>{preview ? 'Editar' : 'Vista previa'}</button><button className="btn btn-soft" onClick={() => persist('draft')} disabled={isPending}><Save size={17}/>Guardar</button><button className="btn btn-primary" onClick={() => persist('published')} disabled={isPending}><Send size={17}/>Publicar</button></div></header>

      {preview ? <article className="evaluation-paper"><div className="evaluation-paper-meta"><span>{level}</span><span>{variant}</span><span>{total} puntos</span></div><h2>{title}</h2><p>Nombre: ____________________________ Fecha: ______________</p>{questions.map((question, index) => <section key={question.id}><h3>{index + 1}. {question.prompt} <small>({question.points} pts)</small></h3>{question.options?.length ? question.options.map((option, optionIndex) => <label key={option}><input type="radio" name={question.id}/> {String.fromCharCode(65 + optionIndex)}. {option}</label>) : <div className="answer-lines"><i/><i/><i/></div>}</section>)}</article> : <div className="evaluation-builder-grid">
        <aside className="evaluation-settings panel"><h2>Configuración</h2><label>Título<input value={title} onChange={(event) => setTitle(event.target.value)}/></label><label>Nivel<select value={level} onChange={(event) => setLevel(event.target.value)}><option>1.º básico</option><option>3.º básico</option><option>5.º básico</option><option>Multinivel</option></select></label><label>Versión<select value={variant} onChange={(event) => setVariant(event.target.value)}><option>Estándar</option><option>TDA/TDAH</option><option>DIL</option><option>Lectura mediada</option></select></label><button className="btn btn-coral" onClick={diversify}><Sparkles size={17}/>Diversificar</button><div className="evaluation-totals"><span><b>{questions.length}</b> preguntas</span><span><b>{total}</b> puntos</span><span><b>{rubric.length}</b> criterios</span></div></aside>

        <main className="evaluation-question-column"><div className="evaluation-column-head"><div><span>Preguntas</span><strong>Edita contenido, formato y puntaje</strong></div><button onClick={() => setQuestions((current) => [...current, { id: crypto.randomUUID(), prompt: 'Nueva pregunta', type: 'Desarrollo', points: 2 }])}><Plus size={17}/>Agregar</button></div>{questions.map((question, index) => <article className="evaluation-question-card" key={question.id}><span className="evaluation-question-number">{index + 1}</span><div><textarea value={question.prompt} onChange={(event) => updateQuestion(question.id, 'prompt', event.target.value)} rows={2}/><div className="evaluation-question-controls"><select value={question.type} onChange={(event) => updateQuestion(question.id, 'type', event.target.value)}><option>Selección múltiple</option><option>Desarrollo</option><option>Respuesta oral</option></select><label>Puntos<input type="number" min="1" value={question.points} onChange={(event) => updateQuestion(question.id, 'points', Number(event.target.value))}/></label></div>{question.type === 'Selección múltiple' && <div className="evaluation-options">{(question.options || ['', '', '', '']).map((option, optionIndex, options) => <input key={optionIndex} value={option} placeholder={`Alternativa ${String.fromCharCode(65 + optionIndex)}`} onChange={(event) => { const next = [...options]; next[optionIndex] = event.target.value; updateQuestion(question.id, 'options', next) }}/>)}</div>}</div><button className="evaluation-delete" onClick={() => setQuestions((current) => current.filter((item) => item.id !== question.id))} aria-label="Eliminar pregunta"><Trash2 size={17}/></button></article>)}</main>

        <aside className="evaluation-rubric panel"><div><ClipboardCheck/><span><strong>Rúbrica</strong><small>Editable y vinculada al instrumento</small></span></div>{rubric.map((criterion) => <article key={criterion.id}><input value={criterion.title} onChange={(event) => setRubric((current) => current.map((item) => item.id === criterion.id ? { ...item, title: event.target.value } : item))}/><textarea value={criterion.description} onChange={(event) => setRubric((current) => current.map((item) => item.id === criterion.id ? { ...item, description: event.target.value } : item))}/><label>Puntaje máximo<input type="number" value={criterion.points} onChange={(event) => setRubric((current) => current.map((item) => item.id === criterion.id ? { ...item, points: Number(event.target.value) } : item))}/></label></article>)}<button className="evaluation-add-rubric" onClick={() => setRubric((current) => [...current, { id: crypto.randomUUID(), title: 'Nuevo criterio', description: 'Describe el desempeño esperado.', points: 4 }])}><Plus size={16}/>Agregar criterio</button><div className="evaluation-quality"><CheckCircle2/><span><b>Control pedagógico</b><small>La versión conserva objetivo, puntaje y alternativas de respuesta.</small></span></div></aside>
      </div>}
    </section>
  </div>
}
