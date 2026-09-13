'use client'

import {useState} from 'react'
import {BookOpenCheck} from 'lucide-react'

type Props={
 missionId:string
 objectiveId:string|null
 studentId:string
 status:string
 evidenceNote:string
 onMessage:(message:string)=>void
}

export function MissionEvidenceControls({missionId,objectiveId,studentId,status,evidenceNote,onMessage}:Props){
 const[achievementLevel,setAchievementLevel]=useState('')
 const[autonomyLevel,setAutonomyLevel]=useState('')
 const[saving,setSaving]=useState(false)
 const ready=Boolean(objectiveId&&status==='completed'&&evidenceNote.trim().length>=2&&achievementLevel&&autonomyLevel)

 async function registerEvidence(){
  if(!ready||saving)return
  setSaving(true)
  try{
   const response=await fetch('/api/misiones/evidencia',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({missionId,studentId,achievementLevel,autonomyLevel})})
   const data=await response.json() as {evidenceId?:string;duplicate?:boolean;error?:string}
   if(!response.ok||!data.evidenceId)throw new Error(data.error||'No fue posible registrar la evidencia de OA.')
   onMessage(data.duplicate?'Esta evidencia ya estaba registrada para el OA.':'Evidencia de OA registrada desde la Misión YOYO.')
  }catch(error){onMessage(error instanceof Error?error.message:'No fue posible registrar la evidencia de OA.')}
  finally{setSaving(false)}
 }

 return <div className="insight" style={{display:'grid',gap:9}}>
  <b><BookOpenCheck size={15}/> Convertir en evidencia de OA</b>
  {!objectiveId?<p>Vincula esta misión a un OA antes de registrar evidencia curricular.</p>:status!=='completed'?<p>Marca la misión como completada y guarda el seguimiento antes de convertirla en evidencia.</p>:evidenceNote.trim().length<2?<p>Escribe y guarda una evidencia breve observable antes de continuar.</p>:<>
   <div className="form-two">
    <label>Nivel de logro<select value={achievementLevel} onChange={event=>setAchievementLevel(event.target.value)}><option value="">Seleccionar</option><option value="achieved">Logrado</option><option value="developing">En desarrollo</option><option value="initial">Inicial</option><option value="not_observed">No observado</option></select></label>
    <label>Autonomía<select value={autonomyLevel} onChange={event=>setAutonomyLevel(event.target.value)}><option value="">Seleccionar</option><option value="independent">Independiente</option><option value="partial_support">Apoyo parcial</option><option value="full_support">Apoyo permanente</option><option value="not_observed">No observado</option></select></label>
   </div>
   <button className="btn btn-soft" disabled={!ready||saving} onClick={registerEvidence}><BookOpenCheck size={15}/>{saving?'Registrando…':'Registrar evidencia de OA'}</button>
   <small>La decisión es docente: YOYO no infiere automáticamente logro ni autonomía.</small>
  </>}
 </div>
}
