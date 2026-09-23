'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRight, BarChart3, BookOpen, Bot, BrainCircuit, CheckCircle2, ClipboardCheck, Copy,
  FileText, GraduationCap, HeartHandshake, History, MessageSquareText, Save, Send, Sparkles, Square, UserRound, Volume2, WandSparkles, WifiOff,
} from 'lucide-react'

type TeacherMode='planificar'|'adaptar'|'evaluar'|'analizar'|'comunicar'
type VirtualTeacherResult={title:string;summary:string;sections:Array<{title:string;items:string[]}>;pedagogicalChecks?:string[];nextSteps?:string[]}
type HistoryItem=VirtualTeacherResult&{id:string;mode:TeacherMode;generatedAt:string;prompt:string;level:string;subject:string}
type HistoryPersistence='loading'|'institutional'|'local-fallback'
type Preferences={defaultLevel?:string;defaultSubject?:string;defaultSupportProfile?:string;preferredDuration?:string;virtualTeacherTone?:string;virtualTeacherDepth?:string}
type Course={id:string;name:string;level:string;academicYear:number}
type Student={id:string;displayName:string}
type Objective={id:string;subject:string;code:string;title:string;description:string}
type ContextResponse={courses?:Course[];selectedCourse?:Course;students?:Student[];objectives?:Objective[];metrics?:{studentCount:number;evidenceCount:number;achievement:{achieved:number;developing:number;initial:number;not_observed:number}};studentContext?:{studentId:string;support?:Record<string,string>|null;recentEvidence?:Array<Record<string,string>>};error?:string}
type InclusionTransfer={source?:string;mode?:TeacherMode;prompt?:string;supportProfile?:string;updatedAt?:string}

const INCLUSION_TRANSFER_KEY='yoyo-profesor-virtual-transfer'
const SAVED_BRIEF_KEY='yoyo-virtual-teacher-brief'

const modes:Array<{id:TeacherMode;label:string;description:string;icon:typeof Bot}>=[
 {id:'planificar',label:'Planificar',description:'Clases y secuencias',icon:BookOpen},
 {id:'adaptar',label:'Adaptar',description:'DUA y apoyos PIE',icon:HeartHandshake},
 {id:'evaluar',label:'Evaluar',description:'Instrumentos diversos',icon:ClipboardCheck},
 {id:'analizar',label:'Analizar',description:'Evidencias y decisiones',icon:BarChart3},
 {id:'comunicar',label:'Comunicar',description:'Familias e informes',icon:MessageSquareText},
]

const suggestions:Record<TeacherMode,string[]>={
 planificar:['Planifica una clase con inicio, modelado, práctica guiada, aplicación y cierre.','Crea una secuencia de tres clases con progresión cognitiva y evidencia por sesión.'],
 adaptar:['Adapta esta actividad manteniendo el objetivo y aplicando DUA, apoyos PIE y retiro progresivo de ayudas.','Propón apoyos diferenciados sin bajar la exigencia central.'],
 evaluar:['Diseña una evaluación diversificada con puntajes, criterios, pauta y versión con apoyos.','Crea evaluación formativa breve con retroalimentación inmediata y criterio de siguiente paso.'],
 analizar:['Analiza resultados por nivel de logro, tipo de error y apoyo requerido; propone decisiones.','Diseña un plan de refuerzo con agrupamientos flexibles y nueva evidencia de seguimiento.'],
 comunicar:['Redacta una comunicación positiva, concreta y profesional para la familia.','Organiza antecedentes, acuerdos, responsables y seguimiento de una entrevista.'],
}

const levels=['Educación parvularia','1.º básico','2.º básico','3.º básico','4.º básico','5.º básico','6.º básico','7.º básico','8.º básico','1.º medio','2.º medio','3.º medio','4.º medio','Multinivel']
const subjects=['Lenguaje y Comunicación','Matemática','Ciencias Naturales','Historia, Geografía y Ciencias Sociales','Inglés','Orientación','Educación Parvularia','Interdisciplinario']

function readLocalHistory(){
 try{const stored=localStorage.getItem('yoyo-virtual-teacher-history');return stored?JSON.parse(stored) as HistoryItem[]:[]}catch{return[]}
}
function saveLocalHistory(items:HistoryItem[]){try{localStorage.setItem('yoyo-virtual-teacher-history',JSON.stringify(items.slice(0,12)))}catch{}}

function localTeacherResult(mode:TeacherMode,level:string,subject:string,prompt:string,supportProfile:string,objective:string,duration:string):VirtualTeacherResult{
 const focus=prompt.trim()||'la necesidad pedagógica descrita'
 const objectiveText=objective.trim()||'el aprendizaje priorizado por el docente'
 const supports=supportProfile.trim()||'acceso universal DUA'
 const baseChecks=['Objetivo pedagógico conservado','Apoyos DUA/PIE sin estigmatizar','Instrucciones claras y observables','Evidencia de aprendizaje incluida']
 if(mode==='planificar')return{
  title:`Planificación local · ${subject} · ${level}`,
  summary:`Propuesta de ${duration} para abordar ${focus}. Objetivo de referencia: ${objectiveText}.`,
  sections:[
   {title:'Inicio',items:['Comunica el propósito con lenguaje breve y una referencia visual.','Activa conocimientos previos con una pregunta, objeto, imagen o ejemplo cercano.']},
   {title:'Modelado y práctica guiada',items:['Resuelve o demuestra un ejemplo paso a paso verbalizando la estrategia.','Comprueba comprensión antes del trabajo autónomo mediante una respuesta breve o señalada.']},
   {title:'Aplicación',items:['Propón una tarea central con la misma meta y distintas formas de acceso o respuesta.','Entrega apoyos graduados y retíralos cuando el estudiante muestra mayor autonomía.']},
   {title:'Cierre',items:['Recoge una evidencia breve del aprendizaje.','Registra qué apoyo funcionó y define el siguiente paso.']},
  ],pedagogicalChecks:baseChecks,nextSteps:['Ajustar ejemplos al contexto real del curso','Preparar material visual o concreto','Registrar evidencia después de aplicar']
 }
 if(mode==='adaptar')return{
  title:`Adaptación local DUA/PIE · ${level}`,
  summary:`Adaptación para ${focus}. Se mantiene ${objectiveText}. Perfil de apoyo considerado: ${supports}.`,
  sections:[
   {title:'Acceso',items:['Divide la instrucción en pasos breves y visibles.','Destaca palabras clave y agrega ejemplo modelado, apoyo visual o material concreto.']},
   {title:'Participación',items:['Permite elegir entre respuesta oral, señalada, manipulativa o escrita cuando el formato no sea parte del objetivo.','Anticipa la secuencia y ofrece pausas breves si la tarea exige atención sostenida.']},
   {title:'Producción y autonomía',items:['Reduce copia mecánica sin reducir el aprendizaje central.','Registra el nivel de ayuda y retira apoyos de forma progresiva.']},
  ],pedagogicalChecks:baseChecks,nextSteps:['Probar la adaptación con una actividad breve','Comparar desempeño con y sin apoyo','Conservar solo los apoyos que mejoran el acceso']
 }
 if(mode==='evaluar')return{
  title:`Evaluación local diversificada · ${subject} · ${level}`,
  summary:`Instrumento base para evaluar ${focus} manteniendo como referencia ${objectiveText}.`,
  sections:[
   {title:'Estructura sugerida',items:['4 ítems de selección o asociación para verificar conocimientos clave.','2 respuestas breves para explicar procedimiento o justificar una elección.','1 tarea de aplicación contextualizada.']},
   {title:'Diversificación',items:['Usa tipografía legible, instrucciones breves y espacio suficiente.','Permite apoyos de acceso que no entreguen la respuesta ni cambien el objetivo.']},
   {title:'Pauta rápida',items:['Respuesta correcta y autónoma: logro esperado.','Respuesta correcta con apoyo menor: logro con apoyo.','Respuesta parcial o procedimiento incompleto: en desarrollo.','Requiere modelado directo para iniciar: nivel inicial.']},
  ],pedagogicalChecks:baseChecks,nextSteps:['Asignar puntajes antes de aplicar','Preparar pauta de corrección','Registrar errores frecuentes para la reenseñanza']
 }
 if(mode==='analizar')return{
  title:`Análisis pedagógico local · ${level}`,
  summary:`Marco de análisis para ${focus}, considerando ${supports}.`,
  sections:[
   {title:'Qué observar',items:['Precisión de la respuesta y tipo de error.','Tiempo necesario para iniciar y completar.','Cantidad y tipo de apoyos requeridos.','Capacidad para explicar lo realizado.']},
   {title:'Hipótesis pedagógicas a comprobar',items:['La instrucción puede no estar siendo comprendida completamente.','Puede existir una barrera de vocabulario, conocimientos previos, atención, memoria de trabajo o acceso al formato.','La dificultad puede aparecer en un paso específico del procedimiento y no en todo el objetivo.']},
   {title:'Próxima intervención',items:['Modela el paso con mayor frecuencia de error.','Reduce variables simultáneas y aumenta gradualmente la complejidad.','Recoge una nueva evidencia comparable después del apoyo.']},
  ],pedagogicalChecks:baseChecks,nextSteps:['Registrar una línea base breve','Aplicar un apoyo a la vez','Comparar nueva evidencia antes de modificar el objetivo']
 }
 return{
  title:`Comunicación local a familia · ${level}`,
  summary:`Borrador respetuoso para comunicar avances y apoyos relacionados con ${focus}.`,
  sections:[
   {title:'Mensaje sugerido',items:['Comenzar destacando un avance observable o una fortaleza.','Describir la habilidad que se está fortaleciendo con ejemplos concretos, evitando etiquetas o juicios absolutos.','Explicar brevemente qué apoyo se utilizará en la escuela.']},
   {title:'Acuerdos posibles',items:['Proponer una acción breve y realista para el hogar.','Indicar cómo y cuándo se revisará el avance.','Mantener un canal de comunicación claro para resolver dudas.']},
  ],pedagogicalChecks:baseChecks,nextSteps:['Personalizar el borrador con hechos observados','Revisar tono y privacidad antes de enviar','Registrar acuerdos y fecha de seguimiento']
 }
}

function resultPlainText(result:VirtualTeacherResult){
 return [result.title,result.summary,...result.sections.flatMap(section=>[`\n${section.title}`,...section.items.map(item=>`• ${item}`)]),...(result.nextSteps?.length?['\nSiguientes pasos',...result.nextSteps.map(item=>`• ${item}`)]:[])].join('\n')
}

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
 const[historyPersistence,setHistoryPersistence]=useState<HistoryPersistence>('loading')
 const[status,setStatus]=useState('Listo para trabajar contigo')
 const[loading,setLoading]=useState(false)
 const[courses,setCourses]=useState<Course[]>([])
 const[students,setStudents]=useState<Student[]>([])
 const[objectives,setObjectives]=useState<Objective[]>([])
 const[courseId,setCourseId]=useState('')
 const[studentId,setStudentId]=useState('')
 const[objectiveId,setObjectiveId]=useState('')
 const[contextMetrics,setContextMetrics]=useState<ContextResponse['metrics']|null>(null)
 const[contextLoading,setContextLoading]=useState(false)
 const[speaking,setSpeaking]=useState(false)
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
  fetch('/api/profesor-virtual/context',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((data:ContextResponse|null)=>{if(data?.courses)setCourses(data.courses)}).catch(()=>null)

  try{
   const savedBriefRaw=localStorage.getItem(SAVED_BRIEF_KEY)
   if(savedBriefRaw){
    const saved=JSON.parse(savedBriefRaw) as Partial<{mode:TeacherMode;prompt:string;level:string;subject:string;objective:string;supportProfile:string;duration:string;tone:string;depth:string}>
    if(saved.mode&&modes.some(item=>item.id===saved.mode))setMode(saved.mode)
    if(typeof saved.prompt==='string'&&saved.prompt.trim())setPrompt(saved.prompt)
    if(typeof saved.level==='string'&&saved.level.trim())setLevel(saved.level)
    if(typeof saved.subject==='string'&&saved.subject.trim())setSubject(saved.subject)
    if(typeof saved.objective==='string')setObjective(saved.objective)
    if(typeof saved.supportProfile==='string'&&saved.supportProfile.trim())setSupportProfile(saved.supportProfile)
    if(typeof saved.duration==='string'&&saved.duration.trim())setDuration(saved.duration)
    if(typeof saved.tone==='string'&&saved.tone.trim())setTone(saved.tone)
    if(typeof saved.depth==='string'&&saved.depth.trim())setDepth(saved.depth)
   }
   const transferRaw=localStorage.getItem(INCLUSION_TRANSFER_KEY)
   if(transferRaw){
    const transfer=JSON.parse(transferRaw) as InclusionTransfer
    if(transfer.source==='inclusion'){
     if(transfer.mode&&modes.some(item=>item.id===transfer.mode))setMode(transfer.mode)
     else setMode('adaptar')
     if(typeof transfer.prompt==='string'&&transfer.prompt.trim())setPrompt(transfer.prompt)
     if(typeof transfer.supportProfile==='string'&&transfer.supportProfile.trim())setSupportProfile(transfer.supportProfile)
     setStatus('Contexto PIE recibido desde Inclusión')
     localStorage.removeItem(INCLUSION_TRANSFER_KEY)
    }
   }
  }catch{}

  const local=readLocalHistory();if(local.length)setHistory(local)
  fetch('/api/profesor-virtual/history',{cache:'no-store'}).then(async response=>{
   const data=await response.json() as {history?:HistoryItem[];persistence?:HistoryPersistence;schemaReady?:boolean}
   if(!response.ok)throw new Error('history unavailable')
   if(data.persistence==='institutional'){
    const institutional=data.history||[];setHistory(institutional);saveLocalHistory(institutional);setHistoryPersistence('institutional')
   }else setHistoryPersistence('local-fallback')
  }).catch(()=>setHistoryPersistence('local-fallback'))
 },[])

 useEffect(()=>{
  if(!courseId){setStudents([]);setObjectives([]);setStudentId('');setObjectiveId('');setContextMetrics(null);return}
  setContextLoading(true)
  fetch(`/api/profesor-virtual/context?courseId=${encodeURIComponent(courseId)}`,{cache:'no-store'}).then(async response=>response.json()).then((data:ContextResponse)=>{
   if(data.error)throw new Error(data.error)
   setStudents(data.students||[]);setObjectives(data.objectives||[]);setContextMetrics(data.metrics||null);setStudentId('');setObjectiveId('')
   if(data.selectedCourse?.level)setLevel(data.selectedCourse.level)
   setStatus('Contexto del curso cargado')
  }).catch(()=>setStatus('No fue posible cargar el contexto del curso.')).finally(()=>setContextLoading(false))
 },[courseId])

 useEffect(()=>{
  if(!courseId||!studentId)return
  setContextLoading(true)
  fetch(`/api/profesor-virtual/context?courseId=${encodeURIComponent(courseId)}&studentId=${encodeURIComponent(studentId)}`,{cache:'no-store'}).then(async response=>response.json()).then((data:ContextResponse)=>{
   if(data.error)throw new Error(data.error)
   const support=data.studentContext?.support
   if(support){
    const pieces=[support.strengths&&`Fortalezas: ${support.strengths}`,support.barriers&&`Barreras: ${support.barriers}`,support.accessAccommodations&&`Apoyos de acceso: ${support.accessAccommodations}`,support.objectiveAccommodations&&`Ajustes de objetivo: ${support.objectiveAccommodations}`].filter(Boolean)
    if(pieces.length)setSupportProfile(pieces.join(' · '))
   }
   setStatus('Contexto individual cargado de forma protegida')
  }).catch(()=>setStatus('No fue posible cargar el contexto individual.')).finally(()=>setContextLoading(false))
 },[courseId,studentId])

 function selectObjective(id:string){
  setObjectiveId(id)
  const selected=objectives.find(item=>item.id===id)
  if(selected){setSubject(selected.subject);setObjective(`${selected.code} · ${selected.title}${selected.description?` — ${selected.description}`:''}`)}
 }

 async function persistHistory(item:HistoryItem){
  const response=await fetch('/api/profesor-virtual/history',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(item)})
  if(!response.ok){setHistoryPersistence('local-fallback');return}
  const data=await response.json() as {saved?:boolean;id?:string;generatedAt?:string;persistence?:string}
  if(data.saved&&data.id){
   setHistoryPersistence('institutional')
   setHistory(current=>{const next=current.map(entry=>entry.id===item.id?{...entry,id:data.id||entry.id,generatedAt:data.generatedAt||entry.generatedAt}:entry);saveLocalHistory(next);return next})
  }
 }

 function generateLocal(){
  if(!prompt.trim())return
  const localResult=localTeacherResult(mode,level,subject,prompt,supportProfile,objective,duration)
  setResult(localResult)
  const item:HistoryItem={...localResult,id:crypto.randomUUID(),mode,generatedAt:new Date().toISOString(),prompt,level,subject}
  setHistory(current=>{const next=[item,...current].slice(0,12);saveLocalHistory(next);return next})
  setStatus('Propuesta lista · modo local gratuito · sin consumo de IA ni tokens')
 }

 function speakResult(){
  if(!result)return
  if(!('speechSynthesis' in window)){setStatus('La lectura en voz alta no está disponible en este navegador.');return}
  window.speechSynthesis.cancel()
  if(speaking){setSpeaking(false);setStatus('Lectura detenida');return}
  const utterance=new SpeechSynthesisUtterance(resultPlainText(result))
  utterance.lang='es-CL'
  utterance.rate=0.95
  utterance.onend=()=>setSpeaking(false)
  utterance.onerror=()=>{setSpeaking(false);setStatus('No fue posible reproducir la voz del navegador.')}
  setSpeaking(true)
  setStatus('Leyendo con la voz disponible en el navegador · sin API de voz')
  window.speechSynthesis.speak(utterance)
 }

 async function generate(){
  if(!prompt.trim()||loading)return
  setLoading(true);setStatus(courseId?'Profesor Virtual YOYO está razonando con contexto institucional protegido...':'Profesor Virtual YOYO está razonando con tu contexto pedagógico...')
  try{
   const response=await fetch('/api/profesor-virtual/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({prompt,mode,level,subject,objective,supportProfile,duration,tone,depth,courseId,studentId,objectiveId})})
   const data=await response.json() as {result?:VirtualTeacherResult;error?:string;fallback?:boolean;model?:string;contextUsed?:boolean}
   if(!response.ok||!data.result)throw new Error(data.error||'No fue posible generar la propuesta.')
   setResult(data.result)
   const item:HistoryItem={...data.result,id:crypto.randomUUID(),mode,generatedAt:new Date().toISOString(),prompt,level,subject}
   setHistory(current=>{const next=[item,...current].slice(0,12);saveLocalHistory(next);return next})
   void persistHistory(item)
   setStatus(data.fallback?'Propuesta lista · modo de respaldo seguro activo':data.contextUsed?'Propuesta lista · YOYO IA + contexto institucional':'Propuesta lista · YOYO IA activa')
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible generar la propuesta.')}
  finally{setLoading(false)}
 }

 async function copyResult(){
  if(!result)return
  const text=resultPlainText(result)
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

 function sendToMission(){
  if(!result)return
  const detail=[result.summary,...result.sections.flatMap(section=>[section.title,...section.items.map(item=>`• ${item}`)])].join('\n').slice(0,6000)
  const experienceType=mode==='evaluar'?'assessment':mode==='planificar'?'lesson':mode==='adaptar'?'practice':mode==='analizar'?'practice':'lesson'
  const draft={title:result.title,description:detail,experienceType,sourceHref:'',supportProfile:supportProfile||'Acceso universal DUA',courseId,objectiveId,dueAt:'',updatedAt:new Date().toISOString(),source:'profesor-virtual'}
  localStorage.setItem('yoyo-mission-draft',JSON.stringify(draft))
  setStatus(courseId?'Borrador de Misión preparado para revisión docente':'Borrador de Misión preparado; selecciona el curso antes de asignar')
  window.location.href='/misiones?from=profesor-virtual'
 }

 function saveBrief(){
  localStorage.setItem(SAVED_BRIEF_KEY,JSON.stringify({mode,prompt,level,subject,objective,supportProfile,duration,tone,depth,courseId,studentId,objectiveId,updatedAt:new Date().toISOString()}))
  setStatus('Contexto pedagógico guardado en este dispositivo')
 }

 return <div className="virtual-teacher-workspace">
  <section className="virtual-command-center"><div><span className="virtual-kicker"><Sparkles size={15}/> Profesor Virtual YOYO</span><h1>Copiloto pedagógico con IA y modo local gratuito.</h1><p>Planifica, adapta, evalúa, analiza y comunica. Puedes usar YOYO IA con contexto institucional o generar una propuesta local sin consumir modelos, tokens ni APIs pagadas.</p></div><div className="virtual-context-card"><span><BrainCircuit size={20}/> Contexto activo</span><strong>{organization}</strong><small>{displayName} · Sesión institucional protegida</small></div></section>

  <section className="virtual-mode-grid" aria-label="Modos del profesor virtual">{modes.map(({id,label,description,icon:Icon})=><button key={id} className={mode===id?'active':''} onClick={()=>setMode(id)}><span><Icon size={19}/></span><div><strong>{label}</strong><small>{description}</small></div></button>)}</section>

  <div className="virtual-main-grid">
   <aside className="virtual-brief-panel premium-card"><div className="virtual-panel-heading"><WandSparkles/><div><h2>Contexto pedagógico</h2><p>Combina tus preferencias con datos institucionales autorizados.</p></div></div>
    <label><GraduationCap size={15}/> Curso<select value={courseId} onChange={e=>setCourseId(e.target.value)} disabled={contextLoading}><option value="">Sin curso específico</option>{courses.map(course=><option key={course.id} value={course.id}>{course.name} · {course.level} · {course.academicYear}</option>)}</select></label>
    {courseId&&<label><UserRound size={15}/> Estudiante opcional<select value={studentId} onChange={e=>setStudentId(e.target.value)} disabled={contextLoading}><option value="">Trabajar con el curso completo</option>{students.map(student=><option key={student.id} value={student.id}>{student.displayName}</option>)}</select></label>}
    {courseId&&objectives.length>0&&<label>OA / habilidad registrada<select value={objectiveId} onChange={e=>selectObjective(e.target.value)}><option value="">Elegir manualmente</option>{objectives.map(item=><option key={item.id} value={item.id}>{item.code} · {item.subject} · {item.title}</option>)}</select></label>}
    {contextMetrics&&<div className="insight"><b>Contexto del curso</b><p>{contextMetrics.studentCount} estudiante(s) · {contextMetrics.evidenceCount} evidencias recientes</p><p>Logrado {contextMetrics.achievement.achieved} · En desarrollo {contextMetrics.achievement.developing} · Inicial {contextMetrics.achievement.initial}</p></div>}
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
    <div className="virtual-prompt-box"><textarea rows={6} value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe el objetivo, dificultad, curso o recurso que necesitas..."/><div><small>{status}</small><span className="virtual-generation-actions"><button className="btn btn-primary" onClick={generateLocal} disabled={!prompt.trim()}><WifiOff size={17}/>Generar gratis local</button><button className="btn btn-soft" onClick={generate} disabled={loading||!prompt.trim()}>{loading?<Sparkles size={17}/>:<Send size={17}/>} {loading?'Generando...':'YOYO IA · opcional'}</button></span></div></div>
    {!result?<div className="virtual-empty-state"><Bot size={40}/><h3>Describe tu necesidad pedagógica</h3><p>Selecciona un curso para que YOYO incorpore contexto académico real. Puedes trabajar con el curso completo o, cuando tengas permisos PIE, con un estudiante seleccionado.</p></div>:<article className="virtual-result-card"><header><div><span>{subject} · {level}</span><h2>{result.title}</h2><p>{result.summary}</p></div><div className="virtual-result-header-actions"><button onClick={speakResult} aria-label={speaking?'Detener lectura':'Leer propuesta en voz alta'}>{speaking?<Square size={17}/>:<Volume2 size={18}/>}</button><button onClick={copyResult} aria-label="Copiar propuesta"><Copy size={18}/></button></div></header><div className="virtual-result-sections">{result.sections.map(section=><section key={section.title}><h3>{section.title}</h3>{section.items.map(item=><div key={item}><CheckCircle2 size={16}/><span>{item}</span></div>)}</section>)}</div>{result.pedagogicalChecks?.length?<section className="insight"><b>Control pedagógico</b>{result.pedagogicalChecks.map(item=><p key={item}>✓ {item}</p>)}</section>:null}<div className="virtual-result-actions"><button onClick={sendToMission}>Convertir en Misión YOYO <ArrowRight size={16}/></button><button onClick={sendToCreator}>Convertir en recurso editable <ArrowRight size={16}/></button><Link href={`/evaluaciones?tema=${encodeURIComponent(prompt)}`}>Crear evaluación <ArrowRight size={16}/></Link><Link href={`/biblioteca?q=${encodeURIComponent(prompt)}`}>Buscar recursos <ArrowRight size={16}/></Link><Link href="/seguimiento/evidencias">Registrar evidencia <ArrowRight size={16}/></Link></div></article>}
   </main>

   <aside className="virtual-history-panel premium-card"><div className="virtual-panel-heading"><History/><div><h2>{historyPersistence==='institutional'?'Historial institucional':'Historial'}</h2><p>{historyPersistence==='institutional'?'Hasta 12 propuestas recientes disponibles en tu institución.':historyPersistence==='loading'?'Comprobando almacenamiento institucional…':'Hasta 12 propuestas recientes guardadas sólo en este dispositivo.'}</p></div></div>{history.length?<div className="virtual-history-list">{history.map(item=><button key={item.id} onClick={()=>{setResult(item);setMode(item.mode);setPrompt(item.prompt);setLevel(item.level);setSubject(item.subject)}}><span><FileText size={17}/></span><div><strong>{item.title}</strong><small>{new Date(item.generatedAt).toLocaleString('es-CL',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div></button>)}</div>:<div className="virtual-history-empty">Tus propuestas recientes aparecerán aquí.</div>}{historyPersistence==='local-fallback'?<div className="insight"><b>Persistencia local temporal</b><p>La tabla institucional aún no está disponible o no es accesible. Tus propuestas permanecen en este dispositivo y se identifica claramente este estado.</p></div>:null}<div className="virtual-control-note"><CheckCircle2/><div><strong>Privacidad y control docente</strong><p>El historial institucional conserva sólo la propuesta pedagógica, modo, nivel y asignatura. No guarda nombres de estudiantes, perfiles de apoyo individuales ni notas sensibles.</p></div></div></aside>
  </div>
 </div>
}