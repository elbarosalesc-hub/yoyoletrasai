'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, BookOpenCheck, CalendarDays, CheckCircle2, ClipboardList, Gamepad2, Gauge, PencilLine, Plus, RefreshCw, Save, Sparkles, Target, UsersRound, X } from 'lucide-react'

type Course={id:string;name:string;level:string;academic_year:number}
type Mission={
 id:string;course_id:string;objective_id:string|null;title:string;description:string|null;experience_type:string;source_href:string|null;support_profile:string|null;due_at:string|null;status:string;created_at:string;
 progressSummary:{assigned:number;completed:number;needsSupport:number;averageProgress:number}
}
type StudentProgress={studentId:string;status:string;progress:number;supportUsed:string;evidenceNote:string;lastActivityAt:string|null;student:{firstName:string;lastName:string;preferredName:string|null}|null}
type Draft={title?:string;description?:string;experienceType?:string;sourceHref?:string;supportProfile?:string;courseId?:string;objectiveId?:string;dueAt?:string}

const experienceOptions=[
 ['lesson','Clase / secuencia'],['resource','Recurso'],['assessment','Evaluación'],['game','Juego'],['practice','Práctica'],['project','Proyecto'],
]

function statusLabel(value:string){return value==='assigned'?'Asignada':value==='draft'?'Borrador':value==='closed'?'Cerrada':'Archivada'}
function studentStatusLabel(value:string){return value==='completed'?'Completada':value==='needs_support'?'Requiere apoyo':value==='in_progress'?'En progreso':'Asignada'}

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
 const[selectedMission,setSelectedMission]=useState<Mission|null>(null)
 const[studentProgress,setStudentProgress]=useState<StudentProgress[]>([])
 const[detailLoading,setDetailLoading]=useState(false)
 const[updatingStudent,setUpdatingStudent]=useState('')

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

 async function openMissionDetail(mission:Mission){
  setSelectedMission(mission);setDetailLoading(true);setStudentProgress([])
  try{
   const response=await fetch(`/api/misiones?missionId=${encodeURIComponent(mission.id)}`,{cache:'no-store'})
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'No fue posible cargar el seguimiento.')
   setStudentProgress(data.students||[])
  }catch(error){setMessage(error instanceof Error?error.message:'No fue posible cargar el seguimiento.')}
  finally{setDetailLoading(false)}
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

 function patchStudent(studentId:string,patch:Partial<StudentProgress>){
  setStudentProgress(current=>current.map(item=>item.studentId===studentId?{...item,...patch}:item))
 }

 async function saveStudentProgress(item:StudentProgress){
  if(!selectedMission||updatingStudent)return
  setUpdatingStudent(item.studentId)
  try{
   const response=await fetch('/api/misiones',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({missionId:selectedMission.id,studentId:item.studentId,status:item.status,progress:item.progress,supportUsed:item.supportUsed,evidenceNote:item.evidenceNote})})
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'No fue posible actualizar el seguimiento.')
   setMessage('Seguimiento del estudiante actualizado.')
   await Promise.all([openMissionDetail(selectedMission),load()])
  }catch(error){setMessage(error instanceof Error?error.message:'No fue posible actualizar el seguimiento.')}
  finally{setUpdatingStudent('')}
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
    {message&&<p className="setting-note" role="status">{message}</p>}
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
       <div className="tool-row">{mission.source_href?<Link className="btn btn-soft" href={mission.source_href}>Abrir experiencia <ArrowRight size={15}/></Link>:null}<button className="btn btn-primary" onClick={()=>openMissionDetail(mission)}><PencilLine size={15}/> Gestionar seguimiento</button><Link className="btn btn-soft" href="/seguimiento/evidencias"><ClipboardList size={15}/> Evidencias</Link></div>
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

  {selectedMission?<section className="premium-card" style={{marginTop:20}}>
   <div className="virtual-panel-heading" style={{justifyContent:'space-between'}}><div style={{display:'flex',gap:12,alignItems:'center'}}><UsersRound/><div><h2>Seguimiento individual · {selectedMission.title}</h2><p>Actualiza avance, necesidad de apoyo y evidencia breve por estudiante.</p></div></div><button className="icon-button" onClick={()=>{setSelectedMission(null);setStudentProgress([])}} aria-label="Cerrar seguimiento"><X/></button></div>
   {detailLoading?<div className="virtual-empty-state"><RefreshCw size={30}/><h3>Cargando matrícula...</h3></div>:studentProgress.length===0?<div className="virtual-empty-state"><UsersRound size={34}/><h3>Sin estudiantes asignados</h3><p>Asigna la misión a un curso con matrícula activa para habilitar seguimiento individual.</p></div>:<div style={{display:'grid',gap:12}}>{studentProgress.map(item=>{
    const name=item.student?.preferredName||[item.student?.firstName,item.student?.lastName].filter(Boolean).join(' ')||'Estudiante'
    return <article key={item.studentId} className="insight" style={{display:'grid',gap:10}}>
     <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'center',flexWrap:'wrap'}}><div><b>{name}</b><p style={{margin:'4px 0 0'}}>{studentStatusLabel(item.status)} · {item.progress}%</p></div><button className="btn btn-primary" disabled={updatingStudent===item.studentId} onClick={()=>saveStudentProgress(item)}><Save size={15}/>{updatingStudent===item.studentId?'Guardando...':'Guardar'}</button></div>
     <div className="form-two"><label>Estado<select value={item.status} onChange={event=>patchStudent(item.studentId,{status:event.target.value})}><option value="assigned">Asignada</option><option value="in_progress">En progreso</option><option value="completed">Completada</option><option value="needs_support">Requiere apoyo</option></select></label><label>Progreso<input type="number" min="0" max="100" value={item.progress} onChange={event=>patchStudent(item.studentId,{progress:Math.max(0,Math.min(100,Number(event.target.value)||0))})}/></label></div>
     <label>Apoyo utilizado<input value={item.supportUsed} onChange={event=>patchStudent(item.studentId,{supportUsed:event.target.value})} maxLength={800} placeholder="Ej.: lectura mediada, apoyo visual, material concreto"/></label>
     <label>Evidencia breve<textarea rows={3} value={item.evidenceNote} onChange={event=>patchStudent(item.studentId,{evidenceNote:event.target.value})} maxLength={1200} placeholder="Describe un desempeño observable o próximo paso."/></label>
    </article>
   })}</div>}
  </section>:null}
 </div>
}
