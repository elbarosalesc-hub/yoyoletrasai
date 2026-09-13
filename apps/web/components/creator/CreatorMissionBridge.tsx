'use client'

import {useState} from 'react'
import {ArrowRight,ClipboardList} from 'lucide-react'

type CreatorDraft={
 title?:string
 level?:string
 resourceType?:string
 subject?:string
 objective?:string
 adaptation?:string
 packageMode?:string
 aiOutput?:unknown
 questions?:Array<{text?:string}>
}

function summarizeOutput(value:unknown){
 if(!value||typeof value!=='object')return''
 const record=value as Record<string,unknown>
 const pieces:string[]=[]
 for(const key of['summary','studentVersion','teacherVersion','instructions']){
  const item=record[key]
  if(typeof item==='string'&&item.trim())pieces.push(item.trim())
  if(Array.isArray(item))pieces.push(item.filter(entry=>typeof entry==='string').slice(0,8).join(' · '))
 }
 return pieces.filter(Boolean).join('\n\n').slice(0,4500)
}

export function CreatorMissionBridge(){
 const[status,setStatus]=useState('')

 function prepareMission(){
  try{
   const raw=localStorage.getItem('yoyo-resource-draft')
   if(!raw){setStatus('Guarda o genera primero el recurso en YOYO IA.');return}
   const draft=JSON.parse(raw) as CreatorDraft
   const title=draft.title?.trim()
   if(!title){setStatus('El recurso necesita un título antes de convertirse en misión.');return}
   const generated=summarizeOutput(draft.aiOutput)
   const activityText=(draft.questions||[]).map(item=>item.text).filter(Boolean).slice(0,10).map(item=>`• ${item}`).join('\n')
   const description=[draft.subject&&`Asignatura: ${draft.subject}`,draft.level&&`Nivel: ${draft.level}`,draft.objective&&`Objetivo: ${draft.objective}`,generated,activityText].filter(Boolean).join('\n\n').slice(0,6000)
   const resourceType=(draft.resourceType||'').toLowerCase()
   const experienceType=resourceType.includes('evalu')?'assessment':resourceType.includes('juego')||resourceType.includes('escape')||resourceType.includes('quiz')?'game':'resource'
   const missionDraft={
    title,
    description,
    experienceType,
    sourceHref:'/crear',
    supportProfile:draft.adaptation||'Acceso universal DUA',
    courseId:'',
    objectiveId:'',
    dueAt:'',
    updatedAt:new Date().toISOString(),
    source:'crear-yoyo-ia',
   }
   localStorage.setItem('yoyo-mission-draft',JSON.stringify(missionDraft))
   window.location.href='/misiones?from=crear-yoyo-ia'
  }catch{setStatus('No fue posible preparar la misión. Guarda nuevamente el recurso e inténtalo otra vez.')}
 }

 return <aside aria-label="Acciones de asignación del creador" style={{position:'fixed',right:18,bottom:18,zIndex:80,maxWidth:330,display:'grid',gap:7}}>
  {status?<div role="status" className="setting-note" style={{background:'var(--surface, white)',padding:'8px 12px',borderRadius:12,boxShadow:'0 8px 24px rgba(0,0,0,.12)'}}>{status}</div>:null}
  <button className="btn btn-primary" onClick={prepareMission} style={{boxShadow:'0 10px 28px rgba(0,0,0,.18)'}}><ClipboardList size={17}/>Convertir en Misión YOYO <ArrowRight size={16}/></button>
 </aside>
}
