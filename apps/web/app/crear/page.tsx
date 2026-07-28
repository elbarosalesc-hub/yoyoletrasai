'use client'

import {useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Download,Plus,Printer,RefreshCw,Save,Trash2} from 'lucide-react'

type ResourceType='Guía de aprendizaje'|'Evaluación'|'Rúbrica'
type Adaptation='Apoyo visual moderado'|'Lectura silábica'|'Respuesta oral'|'Discapacidad intelectual'|'TDA/TDAH'|'TEA'

type Question={id:number;text:string}

type Draft={
 title:string
 level:string
 resourceType:ResourceType
 subject:string
 objective:string
 adaptation:Adaptation
 questions:Question[]
 updatedAt:string
}

const defaultQuestions=[
 'Localiza información explícita en el texto.',
 'Explica la idea principal con tus propias palabras.',
 'Realiza una inferencia sencilla a partir de una pista.',
]

const questionBank:Record<ResourceType,string[]>={
 'Guía de aprendizaje':[
  'Observa el ejemplo y explica qué aprendiste.',
  'Subraya las palabras clave de la información.',
  'Resuelve la actividad paso a paso.',
  'Explica tu respuesta utilizando una evidencia.',
 ],
 'Evaluación':[
  'Selecciona la alternativa correcta.',
  'Responde con una oración completa.',
  'Justifica tu respuesta con información del texto.',
  'Aplica lo aprendido en una situación nueva.',
 ],
 'Rúbrica':[
  'Comprende y comunica la idea principal.',
  'Utiliza vocabulario relacionado con el tema.',
  'Desarrolla la actividad con autonomía.',
  'Revisa y mejora su respuesta antes de entregar.',
 ],
}

function buildQuestions(type:ResourceType,topic:string){
 const base=questionBank[type]
 return base.map((text,index)=>({id:Date.now()+index,text:topic.trim()?`${text} Tema: ${topic.trim()}.`:text}))
}

export default function Crear(){
 const[title,setTitle]=useState('Comprensión lectora: El bosque nativo')
 const[level,setLevel]=useState('3° básico')
 const[resourceType,setResourceType]=useState<ResourceType>('Guía de aprendizaje')
 const[subject,setSubject]=useState('Lenguaje y Comunicación')
 const[objective,setObjective]=useState('Comprender un texto breve y justificar una respuesta con evidencia.')
 const[adaptation,setAdaptation]=useState<Adaptation>('Apoyo visual moderado')
 const[questions,setQuestions]=useState<Question[]>(defaultQuestions.map((text,index)=>({id:index+1,text})))
 const[status,setStatus]=useState('Borrador sin guardar')

 useEffect(()=>{
  const stored=window.localStorage.getItem('yoyo-resource-draft')
  if(!stored)return
  try{
   const draft=JSON.parse(stored) as Draft
   setTitle(draft.title);setLevel(draft.level);setResourceType(draft.resourceType);setSubject(draft.subject)
   setObjective(draft.objective);setAdaptation(draft.adaptation);setQuestions(draft.questions)
   setStatus(`Borrador recuperado · ${new Date(draft.updatedAt).toLocaleString('es-CL')}`)
  }catch{setStatus('No fue posible recuperar el borrador anterior')}
 },[])

 const supportText=useMemo(()=>{
  const supports:Record<Adaptation,string>={
   'Apoyo visual moderado':'Instrucciones breves, palabras clave destacadas y ejemplos visuales.',
   'Lectura silábica':'Texto segmentado, lectura acompañada y vocabulario anticipado.',
   'Respuesta oral':'Permite responder oralmente, con registro del adulto o audio.',
   'Discapacidad intelectual':'Una instrucción por vez, modelado, menor cantidad de ítems y material concreto.',
   'TDA/TDAH':'Bloques breves, temporizador visual, pausas y reducción de distractores.',
   'TEA':'Anticipación de la secuencia, lenguaje literal, apoyos visuales y opción de pausa.',
  }
  return supports[adaptation]
 },[adaptation])

 function generate(){
  setQuestions(buildQuestions(resourceType,title))
  setStatus('Nueva versión generada y lista para editar')
 }

 function save(){
  const draft:Draft={title,level,resourceType,subject,objective,adaptation,questions,updatedAt:new Date().toISOString()}
  window.localStorage.setItem('yoyo-resource-draft',JSON.stringify(draft))
  setStatus(`Guardado en este dispositivo · ${new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}`)
 }

 function addQuestion(){setQuestions(current=>[...current,{id:Date.now(),text:'Escribe aquí una nueva actividad o pregunta.'}])}
 function updateQuestion(id:number,text:string){setQuestions(current=>current.map(question=>question.id===id?{...question,text}:question))}
 function removeQuestion(id:number){setQuestions(current=>current.filter(question=>question.id!==id))}

 function download(){
  const text=[resourceType,title,`${subject} · ${level}`,`Objetivo: ${objective}`,'',...questions.map((q,i)=>`${i+1}. ${q.text}`),'',`Apoyo DUA/PIE: ${supportText}`].join('\n')
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}))
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-')||'recurso'}.txt`;anchor.click();URL.revokeObjectURL(url)
 }

 return <AppShell active="Crear con IA">
  <div className="page-head"><div><span className="eyebrow">Estudio de creación</span><h1>Crear con YOYO IA</h1><p>Diseña un recurso pedagógico editable, diversificado y listo para usar.</p><small aria-live="polite">{status}</small></div><div className="tool-row"><button className="btn btn-soft" onClick={()=>window.print()}><Printer size={17}/>Imprimir</button><button className="btn btn-soft" onClick={download}><Download size={17}/>Descargar</button><button className="btn btn-primary" onClick={save}><Save size={17}/>Guardar borrador</button></div></div>
  <div className="creator-layout">
   <section className="panel form-panel">
    <h2>Configuración pedagógica</h2>
    <label htmlFor="resourceType">Tipo de recurso</label><select id="resourceType" value={resourceType} onChange={event=>setResourceType(event.target.value as ResourceType)}><option>Guía de aprendizaje</option><option>Evaluación</option><option>Rúbrica</option></select>
    <label htmlFor="title">Título o tema</label><input id="title" value={title} onChange={event=>setTitle(event.target.value)}/>
    <label htmlFor="subject">Asignatura</label><input id="subject" value={subject} onChange={event=>setSubject(event.target.value)}/>
    <label htmlFor="level">Nivel</label><select id="level" value={level} onChange={event=>setLevel(event.target.value)}><option>1° básico</option><option>2° básico</option><option>3° básico</option><option>4° básico</option><option>5° básico</option><option>6° básico</option><option>7° básico</option><option>8° básico</option></select>
    <label htmlFor="objective">Objetivo de aprendizaje</label><textarea id="objective" rows={4} value={objective} onChange={event=>setObjective(event.target.value)}/>
    <label htmlFor="adaptation">Perfil de apoyo</label><select id="adaptation" value={adaptation} onChange={event=>setAdaptation(event.target.value as Adaptation)}><option>Apoyo visual moderado</option><option>Lectura silábica</option><option>Respuesta oral</option><option>Discapacidad intelectual</option><option>TDA/TDAH</option><option>TEA</option></select>
    <button className="btn btn-coral" style={{width:'100%',marginTop:18}} onClick={generate}><RefreshCw size={17}/>Generar versión</button>
   </section>
   <section className="preview-paper" aria-label="Vista previa editable">
    <div className="tool-row"><span className="tag">{level}</span><span className="tag">{subject}</span><span className="tag">{resourceType}</span></div>
    <h2>{title||'Recurso sin título'}</h2><p><b>Objetivo:</b> {objective}</p>
    <div className="section-title"><h3>{resourceType==='Rúbrica'?'Criterios':'Actividades'}</h3><button className="btn btn-soft" onClick={addQuestion}><Plus size={16}/>Agregar</button></div>
    <div className="editable-question-list">{questions.map((question,index)=><div className="question editable-question" key={question.id}><b>{index+1}.</b><textarea aria-label={`Actividad ${index+1}`} value={question.text} onChange={event=>updateQuestion(question.id,event.target.value)} rows={2}/><button aria-label={`Eliminar actividad ${index+1}`} onClick={()=>removeQuestion(question.id)}><Trash2 size={17}/></button></div>)}</div>
    <div className="insight"><b>Apoyo DUA y PIE incluido</b><p>{supportText}</p></div>
   </section>
  </div>
 </AppShell>
}
