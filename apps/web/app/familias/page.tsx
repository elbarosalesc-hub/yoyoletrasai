'use client'

import {useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {BookOpen,TrendingUp,Heart,MessageCircle,Send,CheckCircle2,FileText,CalendarDays} from 'lucide-react'

export default function Familias(){
 const[student,setStudent]=useState('Valentina D.')
 const[message,setMessage]=useState('Esta semana reforzaremos la justificación de respuestas usando dos pistas del texto. En casa pueden leer 10 minutos y pedir que explique por qué eligió una respuesta.')
 const[authorized,setAuthorized]=useState(true)
 const[status,setStatus]=useState('Borrador privado')
 const[history,setHistory]=useState([
  {date:'24 jul',title:'Informe aprobado compartido',state:'Leído'},
  {date:'18 jul',title:'Actividad de lectura sugerida',state:'Completada'},
  {date:'10 jul',title:'Mensaje de reconocimiento',state:'Leído'}
 ])
 const send=()=>{if(!authorized){setStatus('Debes autorizar el envío antes de compartir.');return}setHistory(h=>[{date:'Hoy',title:'Nuevo mensaje de acompañamiento',state:'Enviado'},...h]);setStatus('Mensaje enviado y registrado con autorización.')}
 return <AppShell active="Familias">
  <section className="premium-hero family-hero"><span className="eyebrow">Acompañamiento familiar</span><h1>Comunicación clara, positiva y autorizada</h1><p>Comparte avances, recomendaciones e informes aprobados sin exponer información innecesaria.</p></section>
  <div className="family-toolbar premium-card"><label>Estudiante<select value={student} onChange={e=>setStudent(e.target.value)}><option>Valentina D.</option><option>Javier M.</option><option>Renato A.</option></select></label><div className="family-summary-inline"><span><TrendingUp size={18}/><b>4</b> avances</span><span><BookOpen size={18}/><b>2</b> actividades</span><span><Heart size={18}/><b>1</b> logro</span><span><MessageCircle size={18}/><b>0</b> alertas críticas</span></div></div>
  <div className="family-workspace">
   <section className="family-progress premium-card"><div className="section-title"><div><h2>Resumen autorizado de progreso</h2><p>Periodo: julio 2026</p></div><span className="tag">{student}</span></div>{[['Comprensión lectora',82,'Avance sostenido'],['Matemática',76,'Con apoyo visual'],['Ciencias',88,'Alta participación'],['Autonomía',71,'En desarrollo']].map(([n,v,s])=><div className="family-progress-row" key={String(n)}><div><b>{n}</b><span>{s}</span></div><strong>{v}%</strong><div className="bar"><span style={{width:`${v}%`}}/></div></div>)}<div className="family-achievement"><CheckCircle2 size={24}/><div><b>Logro destacado</b><p>Justificó una inferencia usando dos pistas del texto con menor apoyo docente.</p></div></div></section>
   <section className="family-message premium-card"><h2>Preparar comunicación</h2><label>Asunto<input defaultValue="Sugerencia de acompañamiento para esta semana"/></label><label>Mensaje<textarea rows={8} value={message} onChange={e=>setMessage(e.target.value)}/></label><div className="family-attachments"><button><FileText size={17}/>Adjuntar informe aprobado</button><button><BookOpen size={17}/>Adjuntar actividad</button><button><CalendarDays size={17}/>Proponer entrevista</button></div><label className="authorization-check"><input type="checkbox" checked={authorized} onChange={e=>setAuthorized(e.target.checked)}/><span>Confirmo que la información fue revisada y está autorizada para compartir.</span></label><button className="btn btn-primary" onClick={send}><Send size={18}/>Enviar a la familia</button><p className="save-status">{status}</p></section>
   <aside className="family-history premium-card"><h2>Historial seguro</h2>{history.map((x,i)=><div className="family-history-row" key={`${x.date}-${i}`}><span>{x.date}</span><div><b>{x.title}</b><small>{x.state}</small></div></div>)}<div className="insight"><b>Profesor Virtual</b><p>Reescribió el mensaje con lenguaje positivo, breve y libre de tecnicismos innecesarios.</p></div></aside>
  </div>
 </AppShell>
}
