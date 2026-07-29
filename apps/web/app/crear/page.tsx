'use client'

import {useEffect,useMemo,useState} from 'react'
import {
  Accessibility,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  LayoutTemplate,
  ListChecks,
  Palette,
  Plus,
  Printer,
  RefreshCw,
  Save,
  Settings2,
  Sparkles,
  Trash2,
  WandSparkles
} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

type ResourceType='Guía de aprendizaje'|'Evaluación'|'Rúbrica'
type Adaptation='Apoyo visual moderado'|'Lectura silábica'|'Respuesta oral'|'Discapacidad intelectual'|'TDA/TDAH'|'TEA'
type Question={id:number;text:string}
type Draft={title:string;level:string;resourceType:ResourceType;subject:string;objective:string;adaptation:Adaptation;questions:Question[];updatedAt:string}

const questionBank:Record<ResourceType,string[]>={
 'Guía de aprendizaje':['Observa el ejemplo y comenta qué aprendiste.','Subraya las palabras clave del texto.','Resuelve la actividad paso a paso.','Explica tu respuesta utilizando una evidencia.'],
 'Evaluación':['Selecciona la alternativa correcta.','Responde con una oración completa.','Justifica tu respuesta con información del texto.','Aplica lo aprendido en una situación nueva.'],
 'Rúbrica':['Comprende y comunica la idea principal.','Utiliza vocabulario relacionado con el tema.','Desarrolla la actividad con autonomía.','Revisa y mejora su respuesta antes de entregar.']
}

const supportMap:Record<Adaptation,{title:string;text:string;items:string[]}>= {
 'Apoyo visual moderado':{title:'Apoyo visual moderado',text:'Instrucciones breves, palabras clave destacadas y ejemplos visuales.',items:['Íconos de apoyo','Palabras clave','Ejemplo modelado']},
 'Lectura silábica':{title:'Lectura silábica',text:'Texto segmentado, lectura acompañada y vocabulario anticipado.',items:['Segmentación','Tipografía ampliada','Lectura guiada']},
 'Respuesta oral':{title:'Respuesta oral',text:'Permite responder oralmente, con registro del adulto o audio.',items:['Respuesta oral','Menor carga escrita','Registro docente']},
 'Discapacidad intelectual':{title:'Discapacidad intelectual',text:'Una instrucción por vez, modelado, menor cantidad de ítems y material concreto.',items:['Paso a paso','Menos ítems','Apoyo concreto']},
 'TDA/TDAH':{title:'TDA/TDAH',text:'Bloques breves, temporizador visual, pausas y reducción de distractores.',items:['Bloques breves','Pausa activa','Foco visual']},
 'TEA':{title:'TEA',text:'Anticipación de la secuencia, lenguaje literal, apoyos visuales y opción de pausa.',items:['Secuencia visual','Lenguaje literal','Opción de pausa']}
}

const steps=[
 {label:'Tipo de recurso',icon:LayoutTemplate},
 {label:'Datos pedagógicos',icon:BookOpen},
 {label:'Diversificación',icon:Accessibility},
 {label:'Contenido editable',icon:ListChecks},
 {label:'Revisar y exportar',icon:ClipboardCheck}
]

function buildQuestions(type:ResourceType,topic:string){
 return questionBank[type].map((text,index)=>({id:Date.now()+index,text:topic.trim()?`${text} Tema: ${topic.trim()}.`:text}))
}

export default function CrearV2(){
 const[title,setTitle]=useState('Comprensión lectora: El bosque nativo')
 const[level,setLevel]=useState('3° básico')
 const[resourceType,setResourceType]=useState<ResourceType>('Guía de aprendizaje')
 const[subject,setSubject]=useState('Lenguaje y Comunicación')
 const[objective,setObjective]=useState('Comprender un texto breve y justificar una respuesta con evidencia.')
 const[adaptation,setAdaptation]=useState<Adaptation>('Apoyo visual moderado')
 const[questions,setQuestions]=useState<Question[]>(questionBank['Guía de aprendizaje'].slice(0,3).map((text,index)=>({id:index+1,text})))
 const[status,setStatus]=useState('Borrador sin guardar')
 const[activeStep,setActiveStep]=useState(1)
 const[previewMode,setPreviewMode]=useState<'documento'|'estudiante'>('documento')
 const[generating,setGenerating]=useState(false)

 useEffect(()=>{
  const stored=window.localStorage.getItem('yoyo-resource-draft-v2')||window.localStorage.getItem('yoyo-resource-draft')
  if(!stored)return
  try{
   const draft=JSON.parse(stored) as Draft
   setTitle(draft.title);setLevel(draft.level);setResourceType(draft.resourceType);setSubject(draft.subject)
   setObjective(draft.objective);setAdaptation(draft.adaptation);setQuestions(draft.questions)
   setStatus(`Borrador recuperado · ${new Date(draft.updatedAt).toLocaleString('es-CL')}`)
  }catch{setStatus('No fue posible recuperar el borrador anterior')}
 },[])

 const support=useMemo(()=>supportMap[adaptation],[adaptation])
 const completeness=useMemo(()=>[title,subject,level,objective,questions.length>0?'ok':''].filter(Boolean).length*20,[title,subject,level,objective,questions.length])

 function generate(){
  setGenerating(true)
  window.setTimeout(()=>{
   setQuestions(buildQuestions(resourceType,title))
   setStatus('Nueva versión generada y lista para editar')
   setActiveStep(3)
   setGenerating(false)
  },650)
 }

 function save(){
  const draft:Draft={title,level,resourceType,subject,objective,adaptation,questions,updatedAt:new Date().toISOString()}
  window.localStorage.setItem('yoyo-resource-draft-v2',JSON.stringify(draft))
  setStatus(`Guardado · ${new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}`)
 }

 function addQuestion(){setQuestions(current=>[...current,{id:Date.now(),text:'Escribe aquí una nueva actividad o pregunta.'}])}
 function updateQuestion(id:number,text:string){setQuestions(current=>current.map(question=>question.id===id?{...question,text}:question))}
 function removeQuestion(id:number){setQuestions(current=>current.filter(question=>question.id!==id))}

 function download(){
  const text=[resourceType,title,`${subject} · ${level}`,`Objetivo: ${objective}`,'',...questions.map((q,i)=>`${i+1}. ${q.text}`),'',`Apoyo DUA/PIE: ${support.text}`].join('\n')
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}))
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-')||'recurso'}.txt`;anchor.click();URL.revokeObjectURL(url)
 }

 return <ModuleShell active="Crear">
  <section className="creator-head">
   <div className="creator-head-copy">
    <a href="/app" className="creator-back"><ArrowLeft/>Volver al inicio</a>
    <span className="module-eyebrow"><Sparkles size={15}/> Estudio de creación inteligente</span>
    <h1>Crear con <span>YOYO IA</span></h1>
    <p>Diseña recursos pedagógicos editables, diversificados y listos para usar en pocos pasos.</p>
    <div className="creator-status"><CheckCircle2/><span>{status}</span></div>
   </div>
   <div className="creator-head-actions">
    <button className="creator-action soft" onClick={()=>window.print()}><Printer/>Imprimir</button>
    <button className="creator-action soft" onClick={download}><Download/>Descargar</button>
    <button className="creator-action primary" onClick={save}><Save/>Guardar borrador</button>
   </div>
  </section>

  <section className="creator-progress-card">
   <div className="creator-progress-info"><span>PROGRESO DEL RECURSO</span><strong>{completeness}% completo</strong></div>
   <div className="creator-progress-track"><i style={{width:`${completeness}%`}}/></div>
   <div className="creator-steps">{steps.map(({label,icon:Icon},index)=><button key={label} className={index<=activeStep?'active':''} onClick={()=>setActiveStep(index)}><span>{index<activeStep?<Check/>:<Icon/>}</span><small>{label}</small></button>)}</div>
  </section>

  <section className="creator-v2-layout">
   <aside className="creator-config-card">
    <header><span><Settings2/></span><div><small>CONFIGURACIÓN</small><h2>Datos pedagógicos</h2></div></header>

    <div className="creator-field"><label>Tipo de recurso</label><div className="resource-type-grid">{(['Guía de aprendizaje','Evaluación','Rúbrica'] as ResourceType[]).map((type,index)=>{const icons=[BookOpen,FileText,ClipboardCheck];const Icon=icons[index];return <button key={type} className={resourceType===type?'active':''} onClick={()=>setResourceType(type)}><Icon/><span>{type}</span>{resourceType===type&&<CheckCircle2/>}</button>})}</div></div>
    <div className="creator-field"><label htmlFor="creator-title">Título o tema</label><input id="creator-title" value={title} onChange={event=>setTitle(event.target.value)} /></div>
    <div className="creator-two-fields"><div className="creator-field"><label htmlFor="creator-subject">Asignatura</label><select id="creator-subject" value={subject} onChange={event=>setSubject(event.target.value)}><option>Lenguaje y Comunicación</option><option>Matemática</option><option>Ciencias Naturales</option><option>Historia y Geografía</option></select></div><div className="creator-field"><label htmlFor="creator-level">Nivel</label><select id="creator-level" value={level} onChange={event=>setLevel(event.target.value)}>{['1° básico','2° básico','3° básico','4° básico','5° básico','6° básico','7° básico','8° básico'].map(item=><option key={item}>{item}</option>)}</select></div></div>
    <div className="creator-field"><label htmlFor="creator-objective">Objetivo de aprendizaje</label><textarea id="creator-objective" rows={4} value={objective} onChange={event=>setObjective(event.target.value)}/><small>{objective.length}/280 caracteres</small></div>
    <div className="creator-field"><label htmlFor="creator-adaptation">Perfil de apoyo</label><select id="creator-adaptation" value={adaptation} onChange={event=>setAdaptation(event.target.value as Adaptation)}>{Object.keys(supportMap).map(item=><option key={item}>{item}</option>)}</select></div>

    <div className="support-summary"><span><Accessibility/></span><div><strong>{support.title}</strong><p>{support.text}</p><div>{support.items.map(item=><em key={item}><Check/>{item}</em>)}</div></div></div>
    <button className="generate-resource" onClick={generate} disabled={generating}>{generating?<><RefreshCw className="spin"/>Generando recurso...</>:<><WandSparkles/>Generar con YOYO IA</>}</button>
   </aside>

   <main className="creator-preview-area">
    <header className="preview-toolbar"><div><span className="preview-dot red"/><span className="preview-dot yellow"/><span className="preview-dot green"/><strong>Vista previa editable</strong></div><div className="preview-switch"><button className={previewMode==='documento'?'active':''} onClick={()=>setPreviewMode('documento')}><FileText/>Documento</button><button className={previewMode==='estudiante'?'active':''} onClick={()=>setPreviewMode('estudiante')}><Eye/>Estudiante</button></div></header>

    <section className={`resource-paper ${previewMode==='estudiante'?'student-mode':''}`}>
     <div className="paper-topline"><span>YOYOLETRASAI</span><em>{resourceType}</em></div>
     <div className="paper-header"><div><small>{subject}</small><h2>{title||'Recurso sin título'}</h2><p>{level}</p></div><div className="paper-illustration"><span>🌿</span><ImageIcon/></div></div>
     <div className="paper-objective"><Target/><div><small>OBJETIVO DE APRENDIZAJE</small><p>{objective}</p></div></div>
     <div className="paper-student-data"><span>Nombre: <i/></span><span>Curso: <i/></span><span>Fecha: <i/></span></div>
     <div className="paper-section-head"><div><span>{questions.length}</span><div><small>{resourceType==='Rúbrica'?'CRITERIOS':'ACTIVIDADES'}</small><h3>{resourceType==='Rúbrica'?'Criterios de evaluación':'Practiquemos paso a paso'}</h3></div></div><button onClick={addQuestion}><Plus/>Agregar</button></div>
     <div className="paper-question-list">{questions.map((question,index)=><article className="paper-question" key={question.id}><span>{index+1}</span><textarea aria-label={`Actividad ${index+1}`} value={question.text} onChange={event=>updateQuestion(question.id,event.target.value)} rows={2}/><button onClick={()=>removeQuestion(question.id)} aria-label={`Eliminar actividad ${index+1}`}><Trash2/></button></article>)}</div>
     <div className="paper-support-box"><span><Accessibility/></span><div><small>APOYO DUA Y PIE INCLUIDO</small><strong>{support.title}</strong><p>{support.text}</p></div></div>
     <footer className="paper-footer"><span>Revisa tus respuestas antes de entregar.</span><em>Página 1 de 1</em></footer>
    </section>
   </main>

   <aside className="creator-tools-column">
    <article className="creator-tool-card ai-card-small"><div className="tool-card-head"><span><Sparkles/></span><div><small>ASISTENCIA DE YOYO</small><h3>Mejoras sugeridas</h3></div></div><p>El recurso tiene una secuencia clara. Puedes fortalecerlo agregando una actividad de cierre y una evidencia visual.</p><button onClick={()=>{addQuestion();setStatus('Sugerencia de YOYO agregada')}}>Aplicar sugerencia<ArrowRight/></button></article>
    <article className="creator-tool-card"><div className="tool-card-head"><span className="mint"><Palette/></span><div><small>DISEÑO</small><h3>Formato visual</h3></div></div><div className="design-options"><button className="active"><i className="theme-purple"/>Pastel violeta</button><button><i className="theme-mint"/>Pastel verde</button><button><i className="theme-mono"/>Blanco y negro</button></div></article>
    <article className="creator-tool-card quality-card"><div className="quality-score"><span>92</span><div><small>CALIDAD DEL RECURSO</small><strong>Excelente base</strong></div></div><ul><li><Check/>Objetivo claro</li><li><Check/>Actividades graduadas</li><li><Check/>Apoyo inclusivo</li><li><Check/>Editable y exportable</li></ul></article>
   </aside>
  </section>
 </ModuleShell>
}
