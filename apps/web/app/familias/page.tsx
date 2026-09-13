'use client'

import Link from 'next/link'
import {useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {BookOpen,CheckCircle2,ClipboardCopy,HeartHandshake,MessageCircle,PlugZap,ShieldCheck,Sparkles,Users} from 'lucide-react'

type Course={id:string;name:string;level:string;academicYear:number}
type Student={id:string;displayName:string}
type Objective={id:string;subject:string;code:string;title:string;description:string}
type Metrics={studentCount:number;evidenceCount:number;achievement:{achieved:number;developing:number;initial:number;not_observed:number}}
type ContextResponse={courses?:Course[];selectedCourse?:Course;students?:Student[];objectives?:Objective[];metrics?:Metrics;error?:string}
type TeacherResult={title:string;summary:string;sections:Array<{title:string;items:string[]}>;pedagogicalChecks?:string[];nextSteps?:string[]}

function resultAsText(result:TeacherResult){
 return [result.title,result.summary,...result.sections.flatMap(section=>[`\n${section.title}`,...section.items.map(item=>`• ${item}`)])].join('\n')
}

export default function Familias(){
 const[courses,setCourses]=useState<Course[]>([])
 const[courseId,setCourseId]=useState('')
 const[students,setStudents]=useState<Student[]>([])
 const[studentId,setStudentId]=useState('')
 const[objectives,setObjectives]=useState<Objective[]>([])
 const[objectiveId,setObjectiveId]=useState('')
 const[metrics,setMetrics]=useState<Metrics|null>(null)
 const[purpose,setPurpose]=useState('Preparar una comunicación breve, positiva y concreta para la familia sobre avances, apoyos y siguiente paso pedagógico. Evita tecnicismos y no incluyas diagnósticos ni información sensible.')
 const[result,setResult]=useState<TeacherResult|null>(null)
 const[reviewed,setReviewed]=useState(false)
 const[loading,setLoading]=useState(false)
 const[status,setStatus]=useState('Selecciona un curso para preparar una comunicación basada en contexto institucional real.')

 useEffect(()=>{
  fetch('/api/profesor-virtual/context',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((data:ContextResponse|null)=>{
   if(data?.courses)setCourses(data.courses)
  }).catch(()=>setStatus('No fue posible cargar los cursos autorizados.'))
 },[])

 useEffect(()=>{
  if(!courseId){setStudents([]);setObjectives([]);setMetrics(null);setStudentId('');setObjectiveId('');return}
  setStatus('Cargando contexto pedagógico del curso...')
  fetch(`/api/profesor-virtual/context?courseId=${encodeURIComponent(courseId)}`,{cache:'no-store'}).then(async response=>response.json()).then((data:ContextResponse)=>{
   if(data.error)throw new Error(data.error)
   setStudents(data.students||[])
   setObjectives(data.objectives||[])
   setMetrics(data.metrics||null)
   setStudentId('');setObjectiveId('');setResult(null);setReviewed(false)
   setStatus('Contexto del curso disponible. Puedes trabajar con el curso completo o seleccionar un estudiante.')
  }).catch(error=>setStatus(error instanceof Error?error.message:'No fue posible cargar el contexto del curso.'))
 },[courseId])

 const course=useMemo(()=>courses.find(item=>item.id===courseId)||null,[courses,courseId])
 const objective=useMemo(()=>objectives.find(item=>item.id===objectiveId)||null,[objectives,objectiveId])
 const student=useMemo(()=>students.find(item=>item.id===studentId)||null,[students,studentId])

 async function generate(){
  if(!courseId||!purpose.trim()||loading)return
  setLoading(true);setReviewed(false);setResult(null)
  setStatus('Profesor Virtual YOYO está preparando un borrador protegido...')
  try{
   const response=await fetch('/api/profesor-virtual/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    mode:'comunicar',
    prompt:purpose,
    level:course?.level||'Multinivel',
    subject:objective?.subject||'Interdisciplinario',
    objective:objective?`${objective.code} · ${objective.title}${objective.description?` — ${objective.description}`:''}`:'Comunicar avances y siguiente paso sin inventar OA ni diagnósticos.',
    supportProfile:'Comunicación familiar inclusiva: lenguaje claro, positivo, observable y sin etiquetas innecesarias.',
    duration:'Comunicación breve',
    tone:'profesional_claro',
    depth:'completo',
    courseId,
    studentId,
    objectiveId,
   })})
   const data=await response.json() as {result?:TeacherResult;error?:string;fallback?:boolean;contextUsed?:boolean}
   if(!response.ok||!data.result)throw new Error(data.error||'No fue posible generar el borrador.')
   setResult(data.result)
   setStatus(data.contextUsed?'Borrador listo con contexto institucional protegido. Revísalo antes de copiarlo.':'Borrador listo. Revísalo antes de copiarlo.')
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible preparar el borrador.')}
  finally{setLoading(false)}
 }

 async function copyDraft(){
  if(!result)return
  if(!reviewed){setStatus('Marca la revisión docente antes de copiar una comunicación destinada a la familia.');return}
  try{await navigator.clipboard.writeText(resultAsText(result));setStatus('Borrador revisado copiado. YOYO no lo envió automáticamente.')}
  catch{setStatus('No fue posible copiar desde este navegador.')}
 }

 return <AppShell active="Familias">
  <section className="premium-hero family-hero"><span className="eyebrow">Acompañamiento familiar · contexto protegido</span><h1>Comunicación basada en evidencia, sin envíos simulados</h1><p>Prepara borradores profesionales utilizando cursos, OA y evidencias autorizadas. YOYO anonimiza el contexto frente al modelo y nunca envía un mensaje sin un canal real y una acción explícita.</p></section>

  <div className="family-toolbar premium-card">
   <label>Curso<select value={courseId} onChange={event=>setCourseId(event.target.value)}><option value="">Seleccionar curso real</option>{courses.map(item=><option key={item.id} value={item.id}>{item.name} · {item.level} · {item.academicYear}</option>)}</select></label>
   <label>Estudiante opcional<select value={studentId} onChange={event=>{setStudentId(event.target.value);setResult(null);setReviewed(false)}} disabled={!courseId}><option value="">Comunicación general del curso</option>{students.map(item=><option key={item.id} value={item.id}>{item.displayName}</option>)}</select></label>
   <label>OA / habilidad opcional<select value={objectiveId} onChange={event=>{setObjectiveId(event.target.value);setResult(null);setReviewed(false)}} disabled={!courseId}><option value="">Sin OA específico</option>{objectives.map(item=><option key={item.id} value={item.id}>{item.code} · {item.subject} · {item.title}</option>)}</select></label>
  </div>

  <div className="family-workspace">
   <section className="family-progress premium-card"><div className="section-title"><div><h2>Contexto autorizado</h2><p>Datos reales disponibles para orientar el borrador; no son una libreta de notas familiar.</p></div><span className="tag">{student?student.displayName:course?.name||'Sin curso'}</span></div>
    {metrics?<div className="metric-grid"><div><strong>{metrics.studentCount}</strong><span>matrícula activa</span></div><div><strong>{metrics.evidenceCount}</strong><span>evidencias recientes</span></div><div><strong>{metrics.achievement.achieved}</strong><span>logros registrados</span></div><div><strong>{metrics.achievement.developing}</strong><span>en desarrollo</span></div></div>:<div className="insight"><Users size={20}/><div><b>Selecciona un curso</b><p>YOYO cargará únicamente información disponible para tu institución y permisos.</p></div></div>}
    {objective&&<div className="family-achievement"><BookOpen size={24}/><div><b>{objective.code} · {objective.title}</b><p>{objective.description||'Habilidad registrada en el curso.'}</p></div></div>}
    <div className="insight"><ShieldCheck size={20}/><div><b>Privacidad por diseño</b><p>Profesor Virtual trata cualquier selección individual como “estudiante seleccionado”; no se envían `sensitive_notes` ni se infieren diagnósticos.</p></div></div>
   </section>

   <section className="family-message premium-card"><h2>Preparar borrador</h2><label>Propósito y énfasis<textarea rows={7} value={purpose} onChange={event=>setPurpose(event.target.value)}/></label><button className="btn btn-primary" onClick={generate} disabled={!courseId||loading}><Sparkles size={18}/>{loading?'Preparando...':'Crear borrador con YOYO'}</button><p className="save-status" role="status" aria-live="polite">{status}</p>
    {result&&<div className="family-draft"><span className="eyebrow">Borrador · no enviado</span><h3>{result.title}</h3><p>{result.summary}</p>{result.sections.map(section=><section key={section.title}><b>{section.title}</b><ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul></section>)}<label className="authorization-check"><input type="checkbox" checked={reviewed} onChange={event=>setReviewed(event.target.checked)}/><span>Revisé este contenido y confirmo que es apropiado para compartir con la familia.</span></label><button className="btn btn-primary" onClick={copyDraft}><ClipboardCopy size={18}/>Copiar borrador revisado</button></div>}
   </section>

   <aside className="family-history premium-card"><HeartHandshake size={28}/><h2>Entrega controlada</h2><p>Este módulo no simula correos, mensajes ni historiales. La comunicación permanece como borrador hasta que exista un canal institucional realmente conectado.</p><div className="insight"><MessageCircle size={18}/><div><b>Canal de envío</b><p>Configura una integración autorizada antes de automatizar cualquier entrega.</p></div></div><Link href="/integraciones" className="btn btn-soft"><PlugZap size={17}/>Revisar integraciones</Link><Link href="/profesor-virtual" className="btn btn-soft"><Sparkles size={17}/>Abrir Profesor Virtual</Link><div className="insight"><CheckCircle2 size={18}/><div><b>Regla de seguridad</b><p>Copiar un borrador requiere revisión docente; YOYO no publica ni envía de forma autónoma.</p></div></div></aside>
  </div>
 </AppShell>
}
