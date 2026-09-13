'use client'

import {useEffect,useMemo,useState} from 'react'
import {CalendarDays,CheckCircle2,RefreshCw,Users,X} from 'lucide-react'
import type {PremiumActivity} from '@/lib/premiumActivities'

export type ResourceAssignment={
 id:string
 activitySlug:string
 title:string
 course:string
 courseId:string
 group:string
 dueDate:string
 supports:string[]
 createdAt:string
}

type Course={id:string;name:string;level:string;academic_year:number}
type Props={
 activity:PremiumActivity|null
 open:boolean
 onClose:()=>void
 onSaved?:(assignment:ResourceAssignment)=>void
}

const groups=['Curso completo','Avance autónomo','Avance con apoyo','Apoyo intensivo']

export function ResourceAssignmentModal({activity,open,onClose,onSaved}:Props){
 const[courses,setCourses]=useState<Course[]>([])
 const[courseId,setCourseId]=useState('')
 const[group,setGroup]=useState(groups[0])
 const[dueDate,setDueDate]=useState('')
 const[selectedSupports,setSelectedSupports]=useState<string[]>([])
 const[saved,setSaved]=useState(false)
 const[loading,setLoading]=useState(false)
 const[saving,setSaving]=useState(false)
 const[error,setError]=useState('')

 useEffect(()=>{
  if(!open||!activity)return
  setGroup(groups[0]);setDueDate('');setSelectedSupports([]);setSaved(false);setError('');setLoading(true)
  fetch('/api/misiones',{cache:'no-store'}).then(async response=>{
   const data=await response.json()
   if(!response.ok)throw new Error(data.error||'No fue posible cargar los cursos.')
   const next=(data.courses||[]) as Course[]
   setCourses(next)
   setCourseId(next[0]?.id||'')
  }).catch(errorValue=>setError(errorValue instanceof Error?errorValue.message:'No fue posible cargar los cursos.')).finally(()=>setLoading(false))
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()}
  document.body.style.overflow='hidden'
  window.addEventListener('keydown',onKey)
  return()=>{document.body.style.overflow='';window.removeEventListener('keydown',onKey)}
 },[open,activity,onClose])

 if(!open||!activity)return null

 const selectedCourse=useMemo(()=>courses.find(item=>item.id===courseId),[courses,courseId])
 const toggleSupport=(support:string)=>setSelectedSupports(current=>current.includes(support)?current.filter(item=>item!==support):[...current,support])

 const save=async()=>{
  if(!courseId||saving)return
  setSaving(true);setError('')
  const supportList=selectedSupports.length?selectedSupports:activity.supports
  const supportProfile=[`Grupo: ${group}`,...supportList].join(' · ')
  try{
   const response=await fetch('/api/misiones',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
    courseId,
    title:activity.title,
    description:`${activity.summary} Objetivo: ${activity.oa}. Criterios de logro: ${activity.success.join('; ')}.`,
    experienceType:activity.format.toLowerCase().includes('juego')?'game':activity.subject==='Evaluación'?'assessment':'resource',
    sourceHref:`/biblioteca/${activity.slug}`,
    supportProfile,
    dueAt:dueDate?new Date(`${dueDate}T23:59:00`).toISOString():null,
    status:'assigned',
    differentiation:{group,supports:supportList,dua:true,pie:true,source:'library'},
   })})
   const data=await response.json()
   if(!response.ok||!data.mission)throw new Error(data.error||'No fue posible asignar el recurso.')
   const assignment:ResourceAssignment={id:String(data.mission.id),activitySlug:activity.slug,title:activity.title,course:selectedCourse?.name||'Curso',courseId,group,dueDate,supports:supportList,createdAt:new Date().toISOString()}
   setSaved(true)
   onSaved?.(assignment)
   window.setTimeout(onClose,850)
  }catch(errorValue){setError(errorValue instanceof Error?errorValue.message:'No fue posible asignar el recurso.')}
  finally{setSaving(false)}
 }

 return <div className="assignment-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
  <section className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-title">
   <header className="assignment-modal-head"><div><span>Asignar como Misión YOYO</span><h2 id="assignment-title">{activity.title}</h2><p>{activity.level} · {activity.oa} · {activity.duration}</p></div><button onClick={onClose} aria-label="Cerrar"><X/></button></header>
   {saved?<div className="assignment-success"><CheckCircle2/><h3>Misión asignada</h3><p>El recurso quedó asociado al curso, con seguimiento individual para la matrícula activa.</p></div>:<>
    <div className="assignment-form-grid">
     <label><span><Users size={16}/> Curso</span><select value={courseId} onChange={event=>setCourseId(event.target.value)} disabled={loading}>{loading?<option>Cargando cursos...</option>:<><option value="">Selecciona un curso</option>{courses.map(item=><option key={item.id} value={item.id}>{item.name} · {item.level}</option>)}</>}</select></label>
     <label><span><Users size={16}/> Modalidad de apoyo</span><select value={group} onChange={event=>setGroup(event.target.value)}>{groups.map(item=><option key={item}>{item}</option>)}</select></label>
     <label><span><CalendarDays size={16}/> Fecha de entrega</span><input type="date" value={dueDate} onChange={event=>setDueDate(event.target.value)}/></label>
    </div>
    <div className="assignment-supports"><h3>Apoyos que acompañarán la misión</h3><p>Si no seleccionas ninguno, se conservarán todos los apoyos pedagógicos del recurso.</p><div>{activity.supports.map(support=><label key={support} className={selectedSupports.includes(support)?'selected':''}><input type="checkbox" checked={selectedSupports.includes(support)} onChange={()=>toggleSupport(support)}/><span>{support}</span></label>)}</div></div>
    {error?<p className="setting-note" role="alert">{error}</p>:null}
    <footer className="assignment-modal-actions"><button className="btn btn-soft" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save} disabled={!courseId||loading||saving}>{saving?<RefreshCw size={16}/>:<Users size={16}/>} {saving?'Asignando...':'Asignar y activar seguimiento'}</button></footer>
   </>}
  </section>
 </div>
}
