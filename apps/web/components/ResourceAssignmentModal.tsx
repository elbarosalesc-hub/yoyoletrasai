'use client'

import {useEffect,useState} from 'react'
import {CalendarDays,CheckCircle2,Users,X} from 'lucide-react'
import type {PremiumActivity} from '@/lib/premiumActivities'

export type ResourceAssignment={
 id:string
 activitySlug:string
 title:string
 course:string
 group:string
 dueDate:string
 supports:string[]
 createdAt:string
}

type Props={
 activity:PremiumActivity|null
 open:boolean
 onClose:()=>void
 onSaved?:(assignment:ResourceAssignment)=>void
}

const courses=['3.º Básico A','5.º Básico','Grupo PIE']
const groups=['Curso completo','Avance autónomo','Avance con apoyo','Apoyo intensivo']

export function ResourceAssignmentModal({activity,open,onClose,onSaved}:Props){
 const[course,setCourse]=useState(courses[0])
 const[group,setGroup]=useState(groups[0])
 const[dueDate,setDueDate]=useState('')
 const[selectedSupports,setSelectedSupports]=useState<string[]>([])
 const[saved,setSaved]=useState(false)

 useEffect(()=>{
  if(!open||!activity)return
  setCourse(courses[0]);setGroup(groups[0]);setDueDate('');setSelectedSupports([]);setSaved(false)
  const onKey=(event:KeyboardEvent)=>{if(event.key==='Escape')onClose()}
  document.body.style.overflow='hidden'
  window.addEventListener('keydown',onKey)
  return()=>{document.body.style.overflow='';window.removeEventListener('keydown',onKey)}
 },[open,activity,onClose])

 if(!open||!activity)return null

 const toggleSupport=(support:string)=>setSelectedSupports(current=>current.includes(support)?current.filter(item=>item!==support):[...current,support])
 const save=()=>{
  const assignment:ResourceAssignment={
   id:`${Date.now()}-${Math.random().toString(16).slice(2)}`,
   activitySlug:activity.slug,
   title:activity.title,
   course,
   group,
   dueDate,
   supports:selectedSupports,
   createdAt:new Date().toISOString()
  }
  try{
   const current=JSON.parse(localStorage.getItem('yoyo-assignments')||'[]') as ResourceAssignment[]
   localStorage.setItem('yoyo-assignments',JSON.stringify([assignment,...current]))
  }catch{localStorage.setItem('yoyo-assignments',JSON.stringify([assignment]))}
  setSaved(true)
  onSaved?.(assignment)
  window.setTimeout(onClose,650)
 }

 return <div className="assignment-backdrop" role="presentation" onMouseDown={event=>{if(event.target===event.currentTarget)onClose()}}>
  <section className="assignment-modal" role="dialog" aria-modal="true" aria-labelledby="assignment-title">
   <header className="assignment-modal-head"><div><span>Asignar recurso</span><h2 id="assignment-title">{activity.title}</h2><p>{activity.level} · {activity.oa} · {activity.duration}</p></div><button onClick={onClose} aria-label="Cerrar"><X/></button></header>
   {saved?<div className="assignment-success"><CheckCircle2/><h3>Actividad asignada</h3><p>Quedó guardada en el plan del curso y disponible para seguimiento.</p></div>:<>
    <div className="assignment-form-grid">
     <label><span><Users size={16}/> Curso</span><select value={course} onChange={event=>setCourse(event.target.value)}>{courses.map(item=><option key={item}>{item}</option>)}</select></label>
     <label><span><Users size={16}/> Grupo</span><select value={group} onChange={event=>setGroup(event.target.value)}>{groups.map(item=><option key={item}>{item}</option>)}</select></label>
     <label><span><CalendarDays size={16}/> Fecha de entrega</span><input type="date" value={dueDate} onChange={event=>setDueDate(event.target.value)}/></label>
    </div>
    <div className="assignment-supports"><h3>Apoyos que se activarán</h3><p>Selecciona solo los apoyos necesarios para este grupo.</p><div>{activity.supports.map(support=><label key={support} className={selectedSupports.includes(support)?'selected':''}><input type="checkbox" checked={selectedSupports.includes(support)} onChange={()=>toggleSupport(support)}/><span>{support}</span></label>)}</div></div>
    <footer className="assignment-modal-actions"><button className="btn btn-soft" onClick={onClose}>Cancelar</button><button className="btn btn-primary" onClick={save}>Guardar asignación</button></footer>
   </>}
  </section>
 </div>
}
