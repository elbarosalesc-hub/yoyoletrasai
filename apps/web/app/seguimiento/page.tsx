'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {BarChart3,BookOpen,Mic,Gamepad2,Plus,Save,Filter,CheckCircle2} from 'lucide-react'

type Evidence={id:number;student:string;oa:string;type:string;result:string;support:string;autonomy:string}

export default function Seguimiento(){
 const[evidences,setEvidences]=useState<Evidence[]>([
  {id:1,student:'Valentina',oa:'OA 4',type:'Respuesta oral',result:'Inferencia justificada',support:'Lectura mediada',autonomy:'Media'},
  {id:2,student:'Renato',oa:'OA 4',type:'Juego inmersivo',result:'2 pistas pertinentes',support:'Narración',autonomy:'Alta'},
  {id:3,student:'Nataly',oa:'OA 5',type:'Manipulativo',result:'Representa 347',support:'Bloques base diez',autonomy:'Con apoyo'}
 ])
 const[form,setForm]=useState({student:'',oa:'OA 4',type:'Trabajo escrito',result:'',support:'Sin apoyo',autonomy:'Media'})
 const[message,setMessage]=useState('')
 const stats=useMemo(()=>({total:evidences.length,high:evidences.filter(e=>e.autonomy==='Alta').length,oral:evidences.filter(e=>e.type==='Respuesta oral').length}),[evidences])
 const add=()=>{if(!form.student||!form.result){setMessage('Completa estudiante y resultado antes de guardar.');return}setEvidences(v=>[{id:Date.now(),...form},...v]);setForm({...form,student:'',result:''});setMessage('Evidencia guardada y vinculada al OA.')}
 return <AppShell active="Seguimiento">
  <section className="premium-hero tracking-hero"><span className="eyebrow">Seguimiento pedagógico</span><h1>Evidencias, apoyos y decisiones en un solo lugar</h1><p>Registra qué logró cada estudiante, qué apoyo utilizó y cuál debe ser el siguiente paso.</p><div className="hero-cta"><button className="btn btn-coral" onClick={()=>document.getElementById('registro')?.scrollIntoView({behavior:'smooth'})}><Plus size={17}/>Registrar evidencia</button><button className="btn btn-soft"><Filter size={17}/>Filtrar por curso u OA</button></div></section>
  <div className="tracking-stats"><article><BarChart3/><strong>{evidences.length*9}%</strong><span>participación estimada</span></article><article><BookOpen/><strong>78%</strong><span>logro OA 4</span></article><article><CheckCircle2/><strong>{stats.total}</strong><span>evidencias registradas</span></article><article><Mic/><strong>{stats.oral}</strong><span>respuestas orales</span></article></div>
  <div className="tracking-layout">
   <section className="evidence-center premium-card"><div className="section-title"><div><h2>Centro de evidencias</h2><p>Resultados vinculados a estudiante, OA y apoyo.</p></div><span>{stats.high} con autonomía alta</span></div><div className="evidence-table"><div className="evidence-head"><span>Estudiante</span><span>OA</span><span>Evidencia</span><span>Resultado</span><span>Apoyo</span><span>Autonomía</span></div>{evidences.map(e=><div className="evidence-row" key={e.id}><b>{e.student}</b><span>{e.oa}</span><span>{e.type}</span><span>{e.result}</span><span>{e.support}</span><em className={`autonomy-${e.autonomy.toLowerCase().replace(' ','-')}`}>{e.autonomy}</em></div>)}</div></section>
   <aside className="tracking-side"><section id="registro" className="premium-card evidence-form"><h2>Nueva evidencia</h2><label>Estudiante<input value={form.student} onChange={e=>setForm({...form,student:e.target.value})} placeholder="Nombre del estudiante"/></label><div className="form-two"><label>OA<select value={form.oa} onChange={e=>setForm({...form,oa:e.target.value})}><option>OA 4</option><option>OA 5</option><option>OA 7</option><option>Acceso / DUA</option></select></label><label>Tipo<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option>Trabajo escrito</option><option>Respuesta oral</option><option>Juego inmersivo</option><option>Manipulativo</option><option>Simulación</option></select></label></div><label>Resultado<textarea rows={3} value={form.result} onChange={e=>setForm({...form,result:e.target.value})} placeholder="Describe el logro observado"/></label><div className="form-two"><label>Apoyo<select value={form.support} onChange={e=>setForm({...form,support:e.target.value})}><option>Sin apoyo</option><option>Lectura mediada</option><option>Narración</option><option>Pictogramas</option><option>Bloques base diez</option></select></label><label>Autonomía<select value={form.autonomy} onChange={e=>setForm({...form,autonomy:e.target.value})}><option>Alta</option><option>Media</option><option>Con apoyo</option></select></label></div><button className="btn btn-primary" onClick={add}><Save size={17}/>Guardar evidencia</button><p className="save-status">{message}</p></section><section className="premium-card yoyo-analysis"><Gamepad2/><h2>Análisis YOYO</h2><div className="insight"><b>Fortaleza</b><p>El grupo identifica pistas visuales con alta precisión.</p></div><div className="insight"><b>Próximo paso</b><p>Reforzar justificación con dos pistas del texto y una explicación oral.</p></div></section></aside>
  </div>
 </AppShell>
}
