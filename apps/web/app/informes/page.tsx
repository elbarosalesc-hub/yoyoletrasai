'use client'

import {useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Accessibility,BarChart3,BookOpen,CheckCircle2,ClipboardCopy,FileText,Printer,Save,ShieldCheck,Sparkles,Users} from 'lucide-react'

type Course={id:string;name:string;level:string;academicYear:number}
type Student={id:string;displayName:string}
type Objective={id:string;subject:string;code:string;title:string;description:string}
type Metrics={studentCount:number;evidenceCount:number;achievement:{achieved:number;developing:number;initial:number;not_observed:number}}
type ContextResponse={courses?:Course[];selectedCourse?:Course;students?:Student[];objectives?:Objective[];metrics?:Metrics;error?:string}
type TeacherResult={title:string;summary:string;sections:Array<{title:string;items:string[]}>;pedagogicalChecks?:string[];nextSteps?:string[]}
type SessionContext={displayName?:string}

const templates=[
 {id:'familia',title:'Informe para la familia',icon:Users,mode:'comunicar'},
 {id:'avance',title:'Estado de avance',icon:BarChart3,mode:'analizar'},
 {id:'pie',title:'Seguimiento PIE / DUA',icon:Accessibility,mode:'analizar'},
 {id:'curso',title:'Informe de curso',icon:FileText,mode:'analizar'}
] as const

type TemplateId=(typeof templates)[number]['id']

function teacherResultToText(result:TeacherResult){
 return [result.summary,...result.sections.flatMap(section=>[`\n${section.title}`,...section.items.map(item=>`• ${item}`)]),...(result.nextSteps?.length?['\nPróximos pasos',...result.nextSteps.map(item=>`• ${item}`)]:[])].join('\n').trim()
}

export default function Informes(){
 const[type,setType]=useState<TemplateId>('avance')
 const[courses,setCourses]=useState<Course[]>([])
 const[courseId,setCourseId]=useState('')
 const[students,setStudents]=useState<Student[]>([])
 const[studentId,setStudentId]=useState('')
 const[objectives,setObjectives]=useState<Objective[]>([])
 const[objectiveId,setObjectiveId]=useState('')
 const[metrics,setMetrics]=useState<Metrics|null>(null)
 const[responsible,setResponsible]=useState('Profesional responsable')
 const[period,setPeriod]=useState('Periodo actual')
 const[body,setBody]=useState('')
 const[status,setStatus]=useState('Selecciona un curso para construir un informe desde evidencia autorizada.')
 const[approved,setApproved]=useState(false)
 const[loading,setLoading]=useState(false)
 const current=useMemo(()=>templates.find(item=>item.id===type)||templates[0],[type])
 const course=useMemo(()=>courses.find(item=>item.id===courseId)||null,[courses,courseId])
 const student=useMemo(()=>students.find(item=>item.id===studentId)||null,[students,studentId])
 const objective=useMemo(()=>objectives.find(item=>item.id===objectiveId)||null,[objectives,objectiveId])
 const subject=objective?.subject||'Interdisciplinario'
 const isCourseReport=type==='curso'

 useEffect(()=>{
  fetch('/api/session/context',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((data:SessionContext|null)=>{if(data?.displayName)setResponsible(data.displayName)}).catch(()=>null)
  fetch('/api/profesor-virtual/context',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((data:ContextResponse|null)=>{if(data?.courses)setCourses(data.courses)}).catch(()=>setStatus('No fue posible cargar cursos autorizados.'))
 },[])

 useEffect(()=>{
  if(!courseId){setStudents([]);setObjectives([]);setMetrics(null);setStudentId('');setObjectiveId('');setBody('');return}
  setStatus('Cargando evidencia y OA del curso...')
  fetch(`/api/profesor-virtual/context?courseId=${encodeURIComponent(courseId)}`,{cache:'no-store'}).then(async response=>response.json()).then((data:ContextResponse)=>{
   if(data.error)throw new Error(data.error)
   setStudents(data.students||[]);setObjectives(data.objectives||[]);setMetrics(data.metrics||null)
   setStudentId('');setObjectiveId('');setBody('');setApproved(false)
   setStatus('Contexto institucional disponible. Genera un borrador y revísalo profesionalmente.')
  }).catch(error=>setStatus(error instanceof Error?error.message:'No fue posible cargar el contexto institucional.'))
 },[courseId])

 useEffect(()=>{if(isCourseReport&&studentId)setStudentId('')},[isCourseReport,studentId])

 function buildPrompt(){
  const target=isCourseReport?'el curso completo':student?'el estudiante seleccionado':'el contexto seleccionado'
  const instructions:Record<TemplateId,string>={
   familia:`Redacta un informe para la familia sobre ${target}. Usa lenguaje positivo, claro y observable. Prioriza avances, apoyos efectivos y próximos pasos. No incluyas diagnósticos ni tecnicismos innecesarios.`,
   avance:`Construye un estado de avance pedagógico de ${target}. Separa fortalezas, logros observados, aspectos en desarrollo, apoyos utilizados, autonomía y próximos pasos medibles. No inventes datos ausentes.`,
   pie:`Construye un informe de seguimiento PIE/DUA de ${target}. Mantén el objetivo común, describe barreras observables, apoyos de acceso y participación, respuesta a los apoyos y grado de autonomía. No infieras diagnósticos ni agregues información sensible no entregada.`,
   curso:`Construye un informe pedagógico del curso completo. Resume niveles de logro a partir de evidencia disponible, patrones de dificultad, fortalezas, agrupamientos flexibles sugeridos y próximos pasos. No identifiques estudiantes ni inventes porcentajes.`
  }
  return `${instructions[type]} Periodo: ${period}. Si faltan evidencias para alguna afirmación, indícalo explícitamente.`
 }

 async function generate(){
  if(!courseId||loading)return
  if(!isCourseReport&&!studentId){setStatus('Selecciona un estudiante para este tipo de informe o cambia a Informe de curso.');return}
  setLoading(true);setApproved(false);setStatus('YOYO está organizando evidencia institucional protegida...')
  try{
   const response=await fetch('/api/profesor-virtual/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    mode:current.mode,
    prompt:buildPrompt(),
    level:course?.level||'Multinivel',
    subject,
    objective:objective?`${objective.code} · ${objective.title}${objective.description?` — ${objective.description}`:''}`:'Analizar evidencia registrada sin inventar códigos OA.',
    supportProfile:'Informe inclusivo y profesional: lenguaje observable, DUA/PIE cuando corresponda y privacidad por diseño.',
    duration:'Informe profesional',
    tone:'tecnico',
    depth:'profundo',
    courseId,
    studentId:isCourseReport?'':studentId,
    objectiveId,
   })})
   const data=await response.json() as {result?:TeacherResult;error?:string;fallback?:boolean;contextUsed?:boolean}
   if(!response.ok||!data.result)throw new Error(data.error||'No fue posible generar el informe.')
   setBody(teacherResultToText(data.result))
   setStatus(data.contextUsed?'Borrador generado desde contexto institucional protegido. Revisa y edita antes de aprobar.':'Borrador generado. Revisa y edita antes de aprobar.')
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible generar el informe.')}
  finally{setLoading(false)}
 }

 function saveLocal(){
  if(!body.trim()){setStatus('Primero genera o redacta contenido para guardar.');return}
  const draft={type,courseId,studentId,objectiveId,period,responsible,body,updatedAt:new Date().toISOString()}
  try{localStorage.setItem('yoyo-report-draft',JSON.stringify(draft));setStatus('Borrador guardado únicamente en este dispositivo. No se registró como informe institucional.')}
  catch{setStatus('No fue posible guardar el borrador en este dispositivo.')}
 }

 async function copy(){
  if(!approved){setStatus('Aprueba el informe después de revisarlo antes de copiar una versión final.');return}
  try{await navigator.clipboard.writeText(body);setStatus('Informe aprobado copiado al portapapeles.')}
  catch{setStatus('No fue posible copiar desde este navegador.')}
 }

 function printReport(){
  if(!approved){setStatus('Aprueba el informe después de revisarlo antes de imprimir o guardar PDF.');return}
  window.print()
 }

 return <AppShell active="Informes">
  <section className="premium-hero report-hero"><span className="eyebrow">Editor profesional · evidencia institucional</span><h1>Informes construidos desde datos autorizados</h1><p>YOYO prepara el borrador utilizando contexto disponible; la profesional revisa, modifica y aprueba antes de copiar, imprimir o guardar como PDF.</p><div className="hero-cta"><button className="btn btn-coral" onClick={generate} disabled={!courseId||loading}><Sparkles size={18}/>{loading?'Analizando...':'Generar desde evidencia'}</button><button className="btn btn-soft" onClick={saveLocal}><Save size={17}/>Guardar borrador local</button></div></section>

  <div className="report-workspace">
   <aside className="report-library premium-card"><h2>Tipo de informe</h2>{templates.map(({id,title,icon:Icon})=><button key={id} className={type===id?'active':''} onClick={()=>{setType(id);setApproved(false);setBody('')}}><Icon size={20}/><span>{title}</span></button>)}
    <label>Curso<select value={courseId} onChange={event=>setCourseId(event.target.value)}><option value="">Seleccionar curso real</option>{courses.map(item=><option key={item.id} value={item.id}>{item.name} · {item.level}</option>)}</select></label>
    {!isCourseReport&&<label>Estudiante<select value={studentId} onChange={event=>{setStudentId(event.target.value);setApproved(false);setBody('')}} disabled={!courseId}><option value="">Seleccionar estudiante</option>{students.map(item=><option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label>}
    <label>OA / habilidad opcional<select value={objectiveId} onChange={event=>{setObjectiveId(event.target.value);setApproved(false)}} disabled={!courseId}><option value="">Panorama general</option>{objectives.map(item=><option key={item.id} value={item.id}>{item.code} · {item.subject} · {item.title}</option>)}</select></label>
    <div className="report-sources"><b>Fuentes verificadas disponibles</b><span>✓ {metrics?.evidenceCount??0} evidencias recientes</span><span>✓ {objectives.length} OA/habilidades registradas</span><span>✓ {metrics?.studentCount??0} matrícula activa</span><span>✓ apoyos individuales sólo si están autorizados</span></div>
   </aside>

   <section className="report-editor premium-card"><div className="report-editor-head"><div><span>{current.title}</span><h2>{isCourseReport?course?.name||'Curso no seleccionado':student?.displayName||'Estudiante no seleccionado'}</h2></div><div className={approved?'report-state approved':'report-state'}>{approved?'Revisado y aprobado':'Borrador en revisión'}</div></div>
    <div className="report-metadata"><label>Periodo<input value={period} onChange={event=>{setPeriod(event.target.value);setApproved(false)}}/></label><label>Responsable<input value={responsible} onChange={event=>setResponsible(event.target.value)}/></label><label>Fecha<input type="date" value={new Date().toISOString().slice(0,10)} readOnly/></label></div>
    <textarea className="report-body" rows={20} value={body} onChange={event=>{setBody(event.target.value);setApproved(false)}} placeholder="Genera un borrador desde evidencia o escribe aquí. YOYO no inventará datos que no estén disponibles."/>
    <div className="report-editor-actions"><button className="btn btn-primary" disabled={!body.trim()} onClick={()=>{setApproved(true);setStatus('Informe marcado como revisado y aprobado por la profesional en esta sesión.')}}><CheckCircle2 size={18}/>Revisar y aprobar</button><button className="btn btn-soft" onClick={copy} disabled={!approved}><ClipboardCopy size={18}/>Copiar</button><button className="btn btn-soft" onClick={printReport} disabled={!approved}><Printer size={18}/>Imprimir / Guardar PDF</button></div><p className="save-status" role="status" aria-live="polite">{status}</p>
   </section>

   <aside className="report-assistant premium-card"><h2>Control de calidad</h2>{['Afirmaciones ligadas a evidencia disponible','Lenguaje profesional y no estigmatizante','Fortalezas y necesidades observables','Apoyos específicos y autonomía','Próximos pasos medibles','Sin diagnósticos inferidos'].map(item=><div className="quality-check-row" key={item}><CheckCircle2 size={17}/><span>{item}</span></div>)}<div className="insight"><ShieldCheck size={19}/><div><b>Privacidad</b><p>Los datos individuales se procesan con el mismo contexto protegido del Profesor Virtual. No se envían notas sensibles.</p></div></div>{objective&&<div className="insight"><BookOpen size={19}/><div><b>{objective.code} · {objective.title}</b><p>{objective.description||'Habilidad registrada.'}</p></div></div>}</aside>
  </div>
 </AppShell>
}