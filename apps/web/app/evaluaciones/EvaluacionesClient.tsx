'use client'

import { startTransition, useEffect, useMemo, useState } from 'react'
import { CalendarDays, CheckCircle2, ClipboardCheck, Copy, Eye, Plus, Save, Search, Send, Sparkles, Trash2, Users, WandSparkles } from 'lucide-react'
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

type Course={id:string;name:string;level:string;academic_year?:number}
type Props = { assessments: StoredAssessment[] }
type AiOutput={title:string;subject:string;objective:string;variant:string;questions:Array<Omit<AssessmentQuestion,'id'>>;rubric:Array<Omit<AssessmentRubric,'id'>>;supports:string[];equivalenceChecks:string[]}

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

function withIds(output:AiOutput):Pick<AssessmentDraftInput,'questions'|'rubric'> {
 return {
  questions:output.questions.map(question=>({...question,id:crypto.randomUUID()})),
  rubric:output.rubric.map(criterion=>({...criterion,id:crypto.randomUUID()})),
 }
}

function parseAssessment(item: StoredAssessment): AssessmentDraftInput {
  try {
    const parsed = JSON.parse(item.description ?? '{}') as Partial<AssessmentDraftInput>
    return {
      id: item.id,
      title: item.title,
      level: parsed.level ?? '3.º básico',
      subject: parsed.subject ?? 'Lenguaje y Comunicación',
      objective: parsed.objective ?? 'Comprender información explícita e inferencial y justificar respuestas con evidencia.',
      variant: parsed.variant ?? item.assessment_type,
      status: item.status === 'published' ? 'published' : 'draft',
      questions: parsed.questions?.length ? parsed.questions : initialQuestions,
      rubric: parsed.rubric?.length ? parsed.rubric : initialRubric,
      supports: parsed.supports ?? [],
      equivalenceChecks: parsed.equivalenceChecks ?? [],
    }
  } catch {
    return { id: item.id, title: item.title, level: '3.º básico', subject:'Lenguaje y Comunicación', objective:'Comprender información explícita e inferencial y justificar respuestas con evidencia.', variant: item.assessment_type, status: 'draft', questions: initialQuestions, rubric: initialRubric, supports:[], equivalenceChecks:[] }
  }
}

const freshDraft = (): AssessmentDraftInput => ({
  title: 'Nueva evaluación', level: '3.º básico', subject:'Lenguaje y Comunicación', objective:'Comprender información explícita e inferencial y justificar respuestas con evidencia.', variant: 'Estándar', status: 'draft', questions: initialQuestions, rubric: initialRubric, supports:[], equivalenceChecks:[],
})

const levels=['1.º básico','2.º básico','3.º básico','4.º básico','5.º básico','6.º básico','7.º básico','8.º básico','1.º medio','2.º medio','3.º medio','4.º medio','Multinivel']
const subjects=['Lenguaje y Comunicación','Matemática','Ciencias Naturales','Historia, Geografía y Ciencias Sociales','Inglés','Interdisciplinario']
const variants=['Estándar','TDA/TDAH','DIL','TEA','Lectura mediada']

export function EvaluacionesClient({ assessments }: Props) {
  const [items, setItems] = useState(assessments)
  const [draft, setDraft] = useState<AssessmentDraftInput>(freshDraft)
  const [query, setQuery] = useState('')
  const [view, setView] = useState<'editor' | 'preview'>('editor')
  const [feedback, setFeedback] = useState('Borrador listo para editar')
  const [pending, setPending] = useState(false)
  const [targetVariant,setTargetVariant]=useState('TDA/TDAH')
  const[courses,setCourses]=useState<Course[]>([])
  const[courseId,setCourseId]=useState('')
  const[dueDate,setDueDate]=useState('')
  const[missionPending,setMissionPending]=useState(false)

  useEffect(()=>{
    fetch('/api/misiones',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((data:{courses?:Course[]}|null)=>{if(data?.courses)setCourses(data.courses)}).catch(()=>null)
  },[])

  const total = useMemo(() => draft.questions.reduce((sum, q) => sum + q.points, 0), [draft.questions])
  const visibleItems = useMemo(() => items.filter(item => `${item.title} ${item.assessment_type}`.toLowerCase().includes(query.toLowerCase())), [items, query])

  function updateQuestion(id: string, patch: Partial<AssessmentQuestion>) {
    setDraft(current => ({ ...current, questions: current.questions.map(question => question.id === id ? { ...question, ...patch } : question) }))
  }

  function addQuestion() {
    setDraft(current => ({ ...current, questions: [...current.questions, { id: crypto.randomUUID(), prompt: 'Nueva pregunta', type: 'Selección múltiple', points: 2, options: ['Alternativa A', 'Alternativa B', 'Alternativa C'] }] }))
  }

  async function runYoyo(operation:'generate'|'adapt'){
    if(pending)return
    setPending(true)
    setFeedback(operation==='adapt'?`YOYO IA está creando una versión ${targetVariant} equivalente…`:'YOYO IA está construyendo el instrumento…')
    try{
      const response=await fetch('/api/evaluaciones/adapt',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({operation,title:draft.title,level:draft.level,subject:draft.subject,objective:draft.objective,variant:draft.variant,targetVariant:operation==='adapt'?targetVariant:draft.variant,questions:draft.questions,rubric:draft.rubric})})
      const data=await response.json() as {output?:AiOutput;error?:string}
      if(!response.ok||!data.output)throw new Error(data.error||'No fue posible generar una versión válida.')
      const converted=withIds(data.output)
      setDraft(current=>({...current,id:operation==='adapt'?undefined:current.id,title:data.output!.title,subject:data.output!.subject,objective:data.output!.objective,variant:data.output!.variant,status:'draft',questions:converted.questions,rubric:converted.rubric,supports:data.output!.supports,equivalenceChecks:data.output!.equivalenceChecks}))
      setView('editor')
      setFeedback(operation==='adapt'?`Versión ${data.output.variant} creada por YOYO IA. Revisa y guarda antes de publicar.`:'Instrumento generado por YOYO IA. Revisa y guarda antes de publicar.')
    }catch(error){setFeedback(error instanceof Error?error.message:'No fue posible completar la generación.')}
    finally{setPending(false)}
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
      setFeedback(status === 'published' ? 'Evaluación publicada. Ya puedes asignarla como Misión YOYO.' : 'Evaluación guardada correctamente en la institución.')
      setPending(false)
    })
  }

  async function assignMission(){
    if(!draft.id||draft.status!=='published'){setFeedback('Publica la evaluación antes de asignarla.');return}
    if(!courseId){setFeedback('Selecciona un curso para crear la misión.');return}
    setMissionPending(true);setFeedback('Creando Misión YOYO y seguimiento de matrícula…')
    try{
      const supportProfile=[draft.variant!=='Estándar'?`Versión ${draft.variant}`:'',...(draft.supports??[])].filter(Boolean).join(' · ')
      const response=await fetch('/api/misiones',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId,title:draft.title,description:`${draft.subject} · ${draft.level} · ${draft.objective}`,experienceType:'assessment',sourceHref:`/evaluaciones?assessment=${encodeURIComponent(draft.id)}`,supportProfile:supportProfile||null,differentiation:{variant:draft.variant,supports:draft.supports??[],equivalenceChecks:draft.equivalenceChecks??[]},dueAt:dueDate?new Date(`${dueDate}T23:59:59`).toISOString():null,status:'assigned'})})
      const data=await response.json() as {mission?:{id:string};error?:string}
      if(!response.ok||!data.mission)throw new Error(data.error||'No fue posible asignar la evaluación.')
      setFeedback('Misión creada. La evaluación quedó asignada a la matrícula activa del curso.')
      setCourseId('');setDueDate('')
    }catch(error){setFeedback(error instanceof Error?error.message:'No fue posible crear la misión.')}
    finally{setMissionPending(false)}
  }

  return <AppShell active="Evaluaciones">
    <div className="assessment-workspace">
      <section className="assessment-command">
        <div><span className="eyebrow">Centro de evaluación · YOYO IA</span><h1>Diseña, diversifica y publica instrumentos reales</h1><p>Construye evaluaciones, genera preguntas con IA y crea versiones equivalentes DUA/PIE sin bajar el objetivo común.</p></div>
        <div className="assessment-command-actions"><button className="btn btn-soft" onClick={() => setView(view === 'editor' ? 'preview' : 'editor')}><Eye size={17}/>{view === 'editor' ? 'Vista estudiante' : 'Volver al editor'}</button><button className="btn btn-primary" disabled={pending} onClick={()=>runYoyo('generate')}><WandSparkles size={17}/>Generar con YOYO IA</button></div>
      </section>

      <div className="assessment-shell-grid">
        <aside className="assessment-library premium-card">
          <div className="assessment-library-head"><div><h2>Mis evaluaciones</h2><span>{items.length} guardadas</span></div><button className="icon-button" onClick={() => { setDraft(freshDraft()); setView('editor');setCourseId('');setDueDate('') }} aria-label="Nueva evaluación"><Plus/></button></div>
          <label className="assessment-search"><Search size={17}/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Buscar evaluación"/></label>
          <div className="assessment-list">{visibleItems.length ? visibleItems.map(item => <button key={item.id} className={draft.id === item.id ? 'active' : ''} onClick={() => { setDraft(parseAssessment(item)); setView('editor'); setFeedback('Evaluación cargada para editar');setCourseId('');setDueDate('') }}><span><ClipboardCheck/></span><div><b>{item.title}</b><small>{item.assessment_type} · {item.total_points} puntos</small></div><em className={item.status === 'published' ? 'published' : ''}>{item.status === 'published' ? 'Publicada' : 'Borrador'}</em></button>) : <div className="assessment-empty"><ClipboardCheck/><b>No hay resultados</b><span>Prueba otra búsqueda o crea una evaluación.</span></div>}</div>
        </aside>

        <main className="assessment-canvas premium-card">
          {view === 'editor' ? <>
            <div className="assessment-meta-grid">
              <label>Título<input value={draft.title} onChange={event => setDraft(current => ({ ...current, title: event.target.value }))}/></label>
              <label>Nivel<select value={draft.level} onChange={event => setDraft(current => ({ ...current, level: event.target.value }))}>{levels.map(item=><option key={item}>{item}</option>)}</select></label>
              <label>Asignatura<select value={draft.subject} onChange={event=>setDraft(current=>({...current,subject:event.target.value}))}>{subjects.map(item=><option key={item}>{item}</option>)}</select></label>
              <label>Versión<select value={draft.variant} onChange={event => setDraft(current => ({ ...current, variant: event.target.value }))}>{variants.map(item=><option key={item}>{item}</option>)}</select></label>
            </div>
            <label style={{display:'grid',gap:7,margin:'14px 0',fontWeight:700}}>Objetivo / habilidad evaluada<textarea rows={3} value={draft.objective} onChange={event=>setDraft(current=>({...current,objective:event.target.value}))} placeholder="Escribe el OA verificado o la habilidad. YOYO IA no inventará códigos OA."/></label>
            <div className="assessment-summary"><span><b>{draft.questions.length}</b> preguntas</span><span><b>{total}</b> puntos</span><span><b>{draft.rubric.length}</b> criterios</span><span><b>{draft.status === 'published' ? 'Publicada' : 'Borrador'}</b> estado</span></div>
            <div className="question-editor-list">{draft.questions.map((question, index) => <article key={question.id} className="question-editor-card"><div className="question-index">{index + 1}</div><div className="question-editor-fields"><textarea value={question.prompt} onChange={event => updateQuestion(question.id, { prompt: event.target.value })} rows={2}/><div className="question-controls"><select value={question.type} onChange={event => updateQuestion(question.id, { type: event.target.value as AssessmentQuestion['type'] })}><option>Selección múltiple</option><option>Desarrollo</option><option>Respuesta oral</option></select><label>Puntos<input type="number" min="1" max="50" value={question.points} onChange={event => updateQuestion(question.id, { points: Number(event.target.value) })}/></label></div>{question.type === 'Selección múltiple' ? <div className="option-grid">{(question.options ?? []).map((option, optionIndex) => <input key={optionIndex} value={option} onChange={event => updateQuestion(question.id, { options: (question.options ?? []).map((value, indexValue) => indexValue === optionIndex ? event.target.value : value) })}/>)}</div> : null}</div><button className="delete-question" onClick={() => setDraft(current => ({ ...current, questions: current.questions.filter(item => item.id !== question.id) }))} aria-label="Eliminar pregunta"><Trash2/></button></article>)}</div>
            <button className="assessment-add-question" onClick={addQuestion}><Plus/>Agregar pregunta</button>
          </> : <section className="student-preview"><div className="student-preview-head"><span>{draft.level} · {draft.subject} · {draft.variant}</span><h2>{draft.title}</h2><p>{draft.objective}</p><p>Lee atentamente y responde cada pregunta. Puedes solicitar los apoyos autorizados.</p></div>{draft.questions.map((question, index) => <article key={question.id}><b>{index + 1}. {question.prompt}</b><small>{question.points} puntos · {question.type}</small>{question.type === 'Selección múltiple' ? <div>{question.options?.map(option => <label key={option}><input type="radio" name={question.id}/>{option}</label>)}</div> : <textarea rows={question.type === 'Respuesta oral' ? 2 : 5} placeholder={question.type === 'Respuesta oral' ? 'Registro de respuesta oral' : 'Escribe tu respuesta'}/>}</article>)}</section>}
        </main>

        <aside className="assessment-inspector premium-card">
          <div className="inspector-heading"><ClipboardCheck/><div><h2>Rúbrica y diversificación</h2><p>Criterios editables y equivalencia</p></div></div>
          <div className="rubric-editor">{draft.rubric.map((criterion, index) => <article key={criterion.id}><span>{index + 1}</span><div><input value={criterion.title} onChange={event => setDraft(current => ({ ...current, rubric: current.rubric.map(item => item.id === criterion.id ? { ...item, title: event.target.value } : item) }))}/><textarea rows={2} value={criterion.description} onChange={event => setDraft(current => ({ ...current, rubric: current.rubric.map(item => item.id === criterion.id ? { ...item, description: event.target.value } : item) }))}/></div><input type="number" value={criterion.points} min="1" onChange={event => setDraft(current => ({ ...current, rubric: current.rubric.map(item => item.id === criterion.id ? { ...item, points: Number(event.target.value) } : item) }))}/></article>)}</div>
          <button className="rubric-add" onClick={() => setDraft(current => ({ ...current, rubric: [...current.rubric, { id: crypto.randomUUID(), title: 'Nuevo criterio', description: 'Describe el desempeño esperado.', points: 2 }] }))}><Plus/>Agregar criterio</button>
          <div className="quality-panel"><CheckCircle2/><div><b>Control pedagógico</b><p>La variante debe conservar objetivo y criterio de logro; YOYO IA diversifica acceso y respuesta, no reduce la exigencia central.</p></div></div>
          <div style={{display:'grid',gap:8,margin:'12px 0'}}><label style={{fontWeight:700}}>Crear variante real<select value={targetVariant} onChange={event=>setTargetVariant(event.target.value)}>{variants.filter(item=>item!==draft.variant).map(item=><option key={item}>{item}</option>)}</select></label><button className="btn btn-coral" disabled={pending} onClick={()=>runYoyo('adapt')}><Sparkles size={17}/>Adaptar con YOYO IA</button></div>
          {draft.supports?.length?<div className="insight"><b>Apoyos aplicados</b>{draft.supports.map(item=><p key={item}>✓ {item}</p>)}</div>:null}
          {draft.equivalenceChecks?.length?<div className="insight"><b>Equivalencia pedagógica</b>{draft.equivalenceChecks.map(item=><p key={item}>✓ {item}</p>)}</div>:null}
          <div className="assessment-save-box"><p aria-live="polite">{feedback}</p><button disabled={pending} className="btn btn-soft" onClick={() => persist('draft')}><Save/>Guardar borrador</button><button disabled={pending} className="btn btn-primary" onClick={() => persist('published')}><Send/>Publicar</button></div>
          {draft.id&&draft.status==='published'?<section className="insight" style={{display:'grid',gap:9,marginTop:12}}><b><Users size={15}/> Asignar como Misión YOYO</b><label>Curso<select value={courseId} onChange={event=>setCourseId(event.target.value)}><option value="">Selecciona un curso</option>{courses.map(course=><option key={course.id} value={course.id}>{course.name} · {course.level}</option>)}</select></label><label>Fecha de entrega opcional<div style={{display:'flex',alignItems:'center',gap:7}}><CalendarDays size={16}/><input type="date" value={dueDate} onChange={event=>setDueDate(event.target.value)}/></div></label><button className="btn btn-primary" disabled={missionPending||!courseId} onClick={assignMission}><Users size={16}/>{missionPending?'Asignando…':'Asignar al curso'}</button><small>La misión crea seguimiento para la matrícula activa y conserva los apoyos de esta variante.</small></section>:null}
          <button className="duplicate-action" onClick={() => { setDraft(current => ({ ...current, id: undefined, title: `${current.title} · copia`, status: 'draft' })); setFeedback('Copia creada como nuevo borrador.');setCourseId('');setDueDate('') }}><Copy/>Duplicar instrumento</button>
        </aside>
      </div>
    </div>
  </AppShell>
}
