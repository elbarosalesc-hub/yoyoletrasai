'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2, ClipboardList, Gamepad2, Gauge, Plus, RefreshCw, Sparkles, Target, UsersRound } from 'lucide-react'

type Course={id:string;name:string;level:string;academic_year:number}
type Mission={
 id:string;course_id:string;objective_id:string|null;title:string;description:string|null;experience_type:string;source_href:string|null;support_profile:string|null;due_at:string|null;status:string;created_at:string;
 progressSummary:{assigned:number;completed:number;needsSupport:number;averageProgress:number}
}

type Draft={title?:string;description?:string;experienceType?:string;sourceHref?:string;supportProfile?:string;courseId?:string;objectiveId?:string;dueAt?:string}

const experienceOptions=[
 ['lesson','Clase / secuencia'],['resource','Recurso'],['assessment','Evaluación'],['game','Juego'],['practice','Práctica'],['project','Proyecto'],
]

function statusLabel(value:string){return value==='assigned'?'Asignada':value==='draft'?'Borrador':value==='closed'?'Cerrada':'Archivada'}

export function LearningMissionsClient({organizationName}:{organizationName:string}){
 const[courses,setCourses]=useState<Course[]>([])
 const[missions,setMissions]=useState<Mission[]>([])
 const[loading,setLoading]=useState(true)
 const[saving,setSaving]=useState(false)
 const[message,setMessage]=useState('')
 const[title,setTitle]=useState('')
 const[description,setDescription]=useState('')
 const[courseId,setCourseId]=useState('')
 const[experienceType,setExperienceType]=useState('lesson')
 const[sourceHref,setSourceHref]=useState('')
 const[supportProfile,setSupportProfile]=useState('Acceso universal DUA; instrucciones claras; opciones de respuesta y apoyos graduados.')
 const[dueAt,setDueAt]=useState('')
 const[assignNow,setAssignNow]=useState(true)

 async function load(){
  setLoading(true)
  try{
   const response=await fetch('/api/misiones',{cache:'no-store'})
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'No fue posible cargar las misiones.')
   setCourses(data.courses||[]);setMissions(data.missions||[])
   if(!courseId&&data.courses?.length)setCourseId(data.courses[0].id)
  }catch(error){setMessage(error instanceof Error?error.message:'No fue posible cargar las misiones.')}
  finally{setLoading(false)}
 }

 useEffect(()=>{
  try{
   const raw=localStorage.getItem('yoyo-mission-draft')
   if(raw){
    const draft=JSON.parse(raw) as Draft
    if(draft.title)setTitle(draft.title)
    if(draft.description)setDescription(draft.description)
    if(draft.experienceType)setExperienceType(draft.experienceType)
    if(draft.sourceHref)setSourceHref(draft.sourceHref)
    if(draft.supportProfile)setSupportProfile(draft.supportProfile)
    if(draft.courseId)setCourseId(draft.courseId)
    if(draft.dueAt)setDueAt(draft.dueAt)
   }
  }catch{}
  load()
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[])

 const stats=useMemo(()=>{
  const active=missions.filter(item=>item.status==='assigned')
  const assigned=active.reduce((sum,item)=>sum+item.progressSummary.assigned,0)
  const completed=active.reduce((sum,item)=>sum+item.progressSummary.completed,0)
  const needsSupport=active.reduce((sum,item)=>sum+item.progressSummary.needsSupport,0)
  return {active:active.length,assigned,completed,needsSupport}
 },[missions])

 async function createMission(){
  if(!courseId||!title.trim()||saving)return
  setSaving(true);setMessage('Creando misión y preparando seguimiento...')
  try{
   const response=await fetch('/api/misiones',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({courseId,title,description,experienceType,sourceHref,supportProfile,dueAt:dueAt?new Date(`${dueAt}T23:59:00`).toISOString():null,status:assignNow?'assigned':'draft',differentiation:{dua:true,pie:true,allowMultipleResponseModes:true,teacherReview:true}})})
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'No fue posible crear la misión.')
   localStorage.removeItem('yoyo-mission-draft')
   setTitle('');setDescription('');setSourceHref('');setDueAt('')
   setMessage(assignNow?'Misión asignada al curso y seguimiento creado.':'Misión guardada como borrador.')
   await load()
  }catch(error){setMessage(error instanceof Error?error.message:'No fue posible crear la misión.')}
  finally{setSaving(false)}
 }

 return <div className="learning-missions-workspace">
  <section className="premium-hero">
   <span className="eyebrow"><Sparkles size={15}/> Orquestador pedagógico YOYO</span>
   <h1>Misiones de Aprendizaje</h1>
   <p>Convierte recursos, juegos, evaluaciones y propuestas de YOYO IA en experiencias asignables, diferenciadas y medibles para tus cursos.</p>
  </section>

  <section className="metric-grid" style={{marginBottom:20}}>
   <div><strong>{stats.active}</strong><span>misiones activas</span></div>
   <div><strong>{stats.assigned}</strong><span>asignaciones estudiantiles</span></div>
   <div><strong>{stats.completed}</strong><span>completadas</span></div>
   <div><strong>{stats.needsSupport}</strong><span>requieren apoyo</span></div>
  </section>

  <div className="virtual-main-grid">
   <aside className="premium-card virtual-brief-panel">
    <div className="virtual-panel-heading"><Plus/><div><h2>Nueva misión</h2><p>{organizationName}</p></div></div>
    <label>Curso<select value={courseId} onChange={e=>setCourseId(e.target.value)}><option value="">Selecciona un curso</option>{courses.map(course=><option value={course.id} key={course.id}>{course.name} · {course.level}</option>)}</select></label>
    <label>Título<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ej.: Misión inferencias: pistas del texto"/></label>
    <label>Tipo de experiencia<select value={experienceType} onChange={e=>setExperienceType(e.target.value)}>{experienceOptions.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></label>
    <label>Descripción / propósito<textarea rows={4} value={description} onChange={e=>setDescription(e.target.value)} placeholder="Qué deben aprender, hacer o demostrar..."/></label>
    <label>Apoyos y diferenciación<textarea rows={4} value={supportProfile} onChange={e=>setSupportProfile(e.target.value)}/></label>
    <label>Enlace interno o recurso<input value={sourceHref} onChange={e=>setSourceHref(e.target.value)} placeholder="/juegos/... o /biblioteca/..."/></label>
    <label>Fecha límite<input type="date" value={dueAt} onChange={e=>setDueAt(e.target.value)}/></label>
    <button className={`setting-toggle ${assignNow?'on':''}`} onClick={()=>setAssignNow(value=>!value)}><span>{assignNow?'Asignar ahora al curso':'Guardar como borrador'}</span><i/></button>
    <button className="btn btn-primary" onClick={createMission} disabled={saving||!courseId||!title.trim()}>{saving?<RefreshCw size={16}/>:<Plus size={16}/>} {saving?'Creando...':'Crear misión'}</button>
    {message&&<p className="setting-note">{message}</p>}
   </aside>

   <main className="premium-card virtual-conversation-panel">
    <div className="virtual-panel-heading"><BookOpenCheck/><div><h2>Panel de misiones</h2><p>Asignación, progreso y apoyos en un mismo flujo.</p></div></div>
    {loading?<div className="virtual-empty-state"><RefreshCw size={34}/><h3>Cargando misiones...</h3></div>:missions.length===0?<div className="virtual-empty-state"><Target size={40}/><h3>Aún no hay misiones</h3><p>Crea una desde este panel o envía una propuesta desde Profesor Virtual.</p></div>:<div className="game-experience-catalog">{missions.map(mission=>{
      const course=courses.find(item=>item.id===mission.course_id)
      return <article className="game-experience-card" key={mission.id}>
       <small>{statusLabel(mission.status)} · {mission.experience_type}</small>
       <h3>{mission.title}</h3>
       <p>{mission.description||'Sin descripción adicional.'}</p>
       <div className="insight"><p><UsersRound size={14}/> {course?.name||'Curso'} · {mission.progressSummary.assigned} estudiantes</p><p><Gauge size={14}/> Progreso promedio {mission.progressSummary.averageProgress}%</p><p><CheckCircle2 size={14}/> {mission.progressSummary.completed} completadas · {mission.progressSummary.needsSupport} requieren apoyo</p>{mission.due_at?<p><CalendarDays size={14}/> {new Date(mission.due_at).toLocaleDateString('es-CL')}</p>:null}</div>
       <div className="tool-row">{mission.source_href?<Link className="btn btn-soft" href={mission.source_href}>Abrir experiencia <ArrowRight size={15}/></Link>:null}<Link className="btn btn-soft" href="/seguimiento/evidencias"><ClipboardList size={15}/> Evidencias</Link></div>
      </article>
     })}</div>}
   </main>

   <aside className="premium-card virtual-history-panel">
    <div className="virtual-panel-heading"><Target/><div><h2>Ciclo YOYO</h2><p>De la planificación a la evidencia.</p></div></div>
    <div className="insight"><b>1. Diseña</b><p>Profesor Virtual, YOYO IA, biblioteca, evaluación o juego.</p></div>
    <div className="insight"><b>2. Asigna</b><p>Curso, propósito, fecha y apoyos DUA/PIE.</p></div>
    <div className="insight"><b>3. Observa</b><p>Progreso, autonomía y necesidad de apoyo.</p></div>
    <div className="insight"><b>4. Evidencia</b><p>Registra el aprendizaje y toma decisiones por OA.</p></div>
    <Link href="/profesor-virtual" className="btn btn-primary"><Gamepad2 size={16}/> Diseñar con Profesor Virtual</Link>
   </aside>
  </div>
 </div>
}
