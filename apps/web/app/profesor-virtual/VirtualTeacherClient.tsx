'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BarChart3, BookOpen, Bot, BrainCircuit, CheckCircle2, ClipboardCheck, Copy,
  FileText, HeartHandshake, History, MessageSquareText, Save, Send, Sparkles, WandSparkles,
} from 'lucide-react'

type TeacherMode='planificar'|'adaptar'|'evaluar'|'analizar'|'comunicar'
type VirtualTeacherResult={title:string;summary:string;sections:Array<{title:string;items:string[]}>;pedagogicalChecks?:string[];nextSteps?:string[]}
type HistoryItem=VirtualTeacherResult&{id:string;mode:TeacherMode;generatedAt:string;prompt:string;level:string;subject:string}
type Preferences={defaultLevel?:string;defaultSubject?:string;defaultSupportProfile?:string;preferredDuration?:string;virtualTeacherTone?:string;virtualTeacherDepth?:string}

const modes:Array<{id:TeacherMode;label:string;description:string;icon:typeof Bot}>=[
 {id:'planificar',label:'Planificar',description:'Clases y secuencias',icon:BookOpen},
 {id:'adaptar',label:'Adaptar',description:'DUA y apoyos PIE',icon:HeartHandshake},
 {id:'evaluar',label:'Evaluar',description:'Instrumentos diversos',icon:ClipboardCheck},
 {id:'analizar',label:'Analizar',description:'Evidencias y decisiones',icon:BarChart3},
 {id:'comunicar',label:'Comunicar',description:'Familias e informes',icon:MessageSquareText},
]

const suggestions:Record<TeacherMode,string[]>={
 planificar:['Planifica una clase con inicio, modelado, práctica guiada, aplicación y cierre.','Crea una secuencia de tres clases con progresión cognitiva y evidencia por sesión.'],
 adaptar:['Adapta esta actividad manteniendo el objetivo y aplicando DUA, apoyos PIE y retiro progresivo de ayudas.','Propón apoyos diferenciados para TDAH, TEA, DIL y DEA sin bajar la exigencia central.'],
 evaluar:['Diseña una evaluación diversificada con puntajes, criterios, pauta y versión con apoyos.','Crea evaluación formativa breve con retroalimentación inmediata y criterio de siguiente paso.'],
 analizar:['Analiza resultados por nivel de logro, tipo de error y apoyo requerido; propone decisiones.','Diseña un plan de refuerzo con agrupamientos flexibles y nueva evidencia de seguimiento.'],
 comunicar:['Redacta una comunicación positiva, concreta y profesional para la familia.','Organiza antecedentes, acuerdos, responsables y seguimiento de una entrevista.'],
}

const levels=['Educación parvularia','1.º básico','2.º básico','3.º básico','4.º básico','5.º básico','6.º básico','7.º básico','8.º básico','1.º medio','2.º medio','3.º medio','4.º medio','Multinivel']
const subjects=['Lenguaje y Comunicación','Matemática','Ciencias Naturales','Historia, Geografía y Ciencias Sociales','Inglés','Orientación','Educación Parvularia','Interdisciplinario']

export function VirtualTeacherClient({organization,displayName}:{organization:string;displayName:string}){
 const[mode,setMode]=useState<TeacherMode>('planificar')
 const[prompt,setPrompt]=useState('Planifica una clase para fortalecer la justificación de inferencias a partir de pistas del texto.')
 const[level,setLevel]=useState('3.º básico')
 const[subject,setSubject]=useState('Lenguaje y Comunicación')
 const[objective,setObjective]=useState('Comprender información explícita e inferencial y justificar respuestas con evidencia del texto.')
 const[supportProfile,setSupportProfile]=useState('Grupo diverso con baja comprensión lectora y necesidad de apoyos visuales')
 const[duration,setDuration]=useState('45 minutos')
 const[tone,setTone]=useState('profesional_claro')
 const[depth,setDepth]=useState('completo')
 const[result,setResult]=useState<VirtualTeacherResult|null>(null)
 const[history,setHistory]=useState<HistoryItem[]>([])
 const[status,setStatus]=useState('Listo para trabajar contigo')
 const[loading,setLoading]=useState(false)
 const selectedMode=useMemo(()=>modes.find(item=>item.id===mode)??modes[0],[mode])

 useEffect(()=>{
  fetch('/api/profile/preferences',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((prefs:Preferences|null)=>{
   if(!prefs)return
   if(prefs.defaultLevel)setLevel(prefs.defaultLevel)
   if(prefs.defaultSubject)setSubject(prefs.defaultSubject)
   if(prefs.defaultSupportProfile)setSupportProfile(prefs.defaultSupportProfile)
   if(prefs.preferredDuration)setDuration(prefs.preferredDuration)
   if(prefs.virtualTeacherTone)setTone(prefs.virtualTeacherTone)
   if(prefs.virtualTeacherDepth)setDepth(prefs.virtualTeacherDepth)
  }).catch(()=>null)
  try{const stored=localStorage.getItem('yoyo-virtual-teacher-history');if(stored)setHistory(JSON.parse(stored) as HistoryItem[])}catch{}
 },[])

 async function generate(){
  if(!prompt.trim()||loading)return
  setLoading(true);setStatus('Profesor Virtual YOYO está razonando con tu contexto pedagógico...')
  try{
   const response=await fetch('/api/profesor-virtual/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,mode,level,subject,objective,supportProfile,duration,tone,depth})})
   const data=await response.json() as {result?:VirtualTeacherResult;error?:string;fallback?:boolean;model?:string}
   if(!response.ok||!data.result)throw new Error(data.error||'No fue posible generar la propuesta.')
   setResult(data.result)
   const item:HistoryItem={...data.result,id:crypto.randomUUID(),mode,generatedAt:new Date().toISOString(),prompt,level,subject}
   setHistory(current=>{const next=[item,...current].slice(0,12);localStorage.setItem('yoyo-virtual-teacher-history',JSON.stringify(next));return next})
   setStatus(data.fallback?'Propuesta lista · modo de respaldo seguro activo':'Propuesta lista · YOYO IA activa')
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible generar la propuesta.')}
  finally{setLoading(false)}
 }

 async function copyResult(){
  if(!result)return
  const text=[result.title,result.summary,...result.sections.flatMap(section=>[`\n${section.title}`,...section.items.map(item=>`• ${item}`)]),...(result.nextSteps?.length?['\nSiguientes pasos',...result.nextSteps.map(item=>`• ${item}`)]:[])].join('\n')
  try{await navigator.clipboard.writeText(text);setStatus('Contenido copiado')}catch{setStatus('No fue posible copiar desde este navegador.')}
 }

 function sendToCreator(){
  if(!result)return
  const now=new Date().toISOString()
  const activities=result.sections.flatMap(section=>section.items).slice(0,12).map((text,index)=>({id:Date.now()+index,text}))
  const draft={title:result.title,level,resourceType:mode==='evaluar'?'Evaluación':'Guía de aprendizaje',subject,objective:objective||prompt,adaptation:supportProfile||'Acceso universal DUA',visualStyle:'Infantil académico premium',packageMode:'Paquete completo',questions:activities,aiOutput:null,updatedAt:now}
  localStorage.setItem('yoyo-resource-draft',JSON.stringify(draft))
  window.location.href='/crear?from=profesor-virtual'
 }

 function saveBrief(){
  localStorage.setItem('yoyo-virtual-teacher-brief',JSON.stringify({mode,prompt,level,subject,objective,supportProfile,duration,tone,depth,updatedAt:new Date().toISOString()}))
  setStatus('Contexto pedagógico guardado en este dispositivo')
 }

 return <div className="virtual-teacher-workspace">
  <section className="virtual-command-center"><div><span className="virtual-kicker"><Sparkles size={15}/> Profesor Virtual YOYO</span><h1>Copiloto pedagógico con IA real, contexto docente y control profesional.</h1><p>Planifica, adapta, evalúa, analiza y comunica con currículum chileno, DUA, PIE y decisiones pedagógicas accionables.</p></div><div className="virtual-context-card"><span><BrainCircuit size={20}/> Contexto activo</span><strong>{organization}</strong><small>{displayName} · Sesión institucional protegida</small></div></section>

  <section className="virtual-mode-grid" aria-label="Modos del profesor virtual">{modes.map(({id,label,description,icon:Icon})=><button key={id} className={mode===id?'active':''} onClick={()=>setMode(id)}><span><Icon size={19}/></span><div><strong>{label}</strong><small>{description}</small></div></button>)}</section>

  <div className="virtual-main-grid">
   <aside className="virtual-brief-panel premium-card"><div className="virtual-panel-heading"><WandSparkles/><div><h2>Contexto pedagógico</h2><p>Se reutilizan tus preferencias del perfil.</p></div></div>
    <label>Nivel<select value={level} onChange={e=>setLevel(e.target.value)}>{levels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label>Asignatura<select value={subject} onChange={e=>setSubject(e.target.value)}>{subjects.map(item=><option key={item}>{item}</option>)}</select></label>
    <label>Objetivo / OA / habilidad<textarea rows={3} value={objective} onChange={e=>setObjective(e.target.value)} placeholder="Escribe el objetivo. Si no conoces el código OA, deja sólo la habilidad."/></label>
    <label>Duración<select value={duration} onChange={e=>setDuration(e.target.value)}><option>30 minutos</option><option>45 minutos</option><option>60 minutos</option><option>90 minutos</option><option>Secuencia de 3 clases</option><option>Unidad completa</option></select></label>
    <label>Necesidades y apoyos<textarea rows={4} value={supportProfile} onChange={e=>setSupportProfile(e.target.value)}/></label>
    <label>Estilo de respuesta<select value={tone} onChange={e=>setTone(e.target.value)}><option value="profesional_claro">Profesional y claro</option><option value="cercano">Cercano y práctico</option><option value="tecnico">Técnico especialista</option></select></label>
    <label>Profundidad<select value={depth} onChange={e=>setDepth(e.target.value)}><option value="breve">Breve</option><option value="completo">Completo</option><option value="profundo">Profundo</option></select></label>
    <button className="btn btn-soft" onClick={saveBrief}><Save size={16}/>Guardar contexto</button>
    <div className="virtual-suggestions"><span>Ideas rápidas</span>{suggestions[mode].map(suggestion=><button key={suggestion} onClick={()=>setPrompt(suggestion)}>{suggestion}</button>)}</div>
   </aside>

   <main className="virtual-conversation-panel premium-card"><div className="virtual-panel-heading"><Bot/><div><h2>{selectedMode.label} con YOYO</h2><p>{selectedMode.description}</p></div></div>
    <div className="virtual-prompt-box"><textarea rows={6} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe el objetivo, dificultad, estudiante, curso o recurso que necesitas..."/><div><small>{status}</small><button className="btn btn-primary" onClick={generate} disabled={loading||!prompt.trim()}>{loading?<Sparkles size={17}/>:<Send size={17}/>} {loading?'Generando...':'Generar con YOYO IA'}</button></div></div>
    {!result?<div className="virtual-empty-state"><Bot size={40}/><h3>Describe tu necesidad pedagógica</h3><p>Profesor Virtual usará IA real cuando el gateway esté disponible y un modo de respaldo seguro si el proveedor falla.</p></div>:<article className="virtual-result-card"><header><div><span>{subject} · {level}</span><h2>{result.title}</h2><p>{result.summary}</p></div><button onClick={copyResult} aria-label="Copiar propuesta"><Copy size={18}/></button></header><div className="virtual-result-sections">{result.sections.map(section=><section key={section.title}><h3>{section.title}</h3>{section.items.map(item=><div key={item}><CheckCircle2 size={16}/><span>{item}</span></div>)}</section>)}</div>{result.pedagogicalChecks?.length?<section className="insight"><b>Control pedagógico</b>{result.pedagogicalChecks.map(item=><p key={item}>✓ {item}</p>)}</section>:null}<div className="virtual-result-actions"><button onClick={sendToCreator}>Convertir en recurso editable <ArrowRight size={16}/></button><Link href={`/evaluaciones?tema=${encodeURIComponent(prompt)}`}>Crear evaluación <ArrowRight size={16}/></Link><Link href={`/biblioteca?q=${encodeURIComponent(prompt)}`}>Buscar recursos <ArrowRight size={16}/></Link><Link href="/seguimiento/evidencias">Registrar evidencia <ArrowRight size={16}/></Link></div></article>}
   </main>

   <aside className="virtual-history-panel premium-card"><div className="virtual-panel-heading"><History/><div><h2>Historial</h2><p>Hasta 12 propuestas recientes en este dispositivo.</p></div></div>{history.length?<div className="virtual-history-list">{history.map(item=><button key={item.id} onClick={()=>{setResult(item);setMode(item.mode);setPrompt(item.prompt);setLevel(item.level);setSubject(item.subject)}}><span><FileText size={17}/></span><div><strong>{item.title}</strong><small>{new Date(item.generatedAt).toLocaleString('es-CL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div></button>)}</div>:<div className="virtual-history-empty">Tus propuestas recientes aparecerán aquí.</div>}<div className="virtual-control-note"><CheckCircle2/><div><strong>Control docente permanente</strong><p>Ninguna propuesta modifica estudiantes, evidencias ni publicaciones automáticamente.</p></div></div></aside>
  </div>
 </div>
}
