'use client'

import {ChangeEvent,useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Download,FileUp,Plus,Printer,RefreshCw,Save,Sparkles,Trash2} from 'lucide-react'
import {premiumResourceTypes,supportProfiles,visualStyles} from '@/lib/product/catalog'

type Question={id:number;text:string}
type Entitlement={credentialId?:string;plan?:{id?:string;name?:string;max_files_per_request?:number;max_file_bytes?:number;max_total_file_bytes?:number;max_output_tokens?:number;unlimited_file_analysis?:boolean;model_tier?:string}}
type SourceFile={name:string;size:number;type:string}

type Draft={
 title:string
 level:string
 resourceType:string
 subject:string
 objective:string
 adaptation:string
 visualStyle:string
 packageMode:string
 questions:Question[]
 updatedAt:string
}

const defaultQuestions=[
 'Activa conocimientos previos con una pregunta breve y contextualizada.',
 'Modela el aprendizaje con un ejemplo claro y accesible.',
 'Propone práctica guiada y luego aplicación autónoma.',
 'Cierra con metacognición: qué aprendí, cómo lo aprendí y para qué me sirve.',
]

function mb(value:number){return `${Math.round(value/1024/1024)} MB`}
function gb(value:number){return `${(value/1024/1024/1024).toFixed(value>=1024*1024*1024?0:1)} GB`}

export default function Crear(){
 const[title,setTitle]=useState('Comprensión lectora: El bosque nativo')
 const[level,setLevel]=useState('3° básico')
 const[resourceType,setResourceType]=useState('Guía de aprendizaje')
 const[subject,setSubject]=useState('Lenguaje y Comunicación')
 const[objective,setObjective]=useState('Comprender un texto breve y justificar una respuesta con evidencia.')
 const[adaptation,setAdaptation]=useState('Acceso universal DUA')
 const[visualStyle,setVisualStyle]=useState('Infantil académico premium')
 const[packageMode,setPackageMode]=useState('Paquete completo')
 const[questions,setQuestions]=useState<Question[]>(defaultQuestions.map((text,index)=>({id:index+1,text})))
 const[status,setStatus]=useState('Listo para crear')
 const[entitlement,setEntitlement]=useState<Entitlement|null>(null)
 const[sourceFiles,setSourceFiles]=useState<SourceFile[]>([])

 useEffect(()=>{
  fetch('/api/ai/entitlement',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then(data=>setEntitlement(data)).catch(()=>setEntitlement(null))
  const stored=window.localStorage.getItem('yoyo-resource-draft')
  if(!stored)return
  try{
   const draft=JSON.parse(stored) as Draft
   setTitle(draft.title);setLevel(draft.level);setResourceType(draft.resourceType);setSubject(draft.subject)
   setObjective(draft.objective);setAdaptation(draft.adaptation);setVisualStyle(draft.visualStyle||'Infantil académico premium');setPackageMode(draft.packageMode||'Paquete completo');setQuestions(draft.questions)
   setStatus(`Borrador recuperado · ${new Date(draft.updatedAt).toLocaleString('es-CL')}`)
  }catch{setStatus('No fue posible recuperar el borrador anterior')}
 },[])

 const plan=entitlement?.plan
 const maxFiles=typeof plan?.max_files_per_request==='number'&&plan.max_files_per_request>=0?plan.max_files_per_request:null
 const maxFileBytes=typeof plan?.max_file_bytes==='number'?plan.max_file_bytes:20*1024*1024
 const maxTotalBytes=typeof plan?.max_total_file_bytes==='number'?plan.max_total_file_bytes:100*1024*1024
 const totalBytes=sourceFiles.reduce((sum,file)=>sum+file.size,0)

 const supportText=useMemo(()=>{
  const supports:Record<string,string>={
   'Acceso universal DUA':'Múltiples formas de representación, participación y respuesta; instrucciones claras y opciones de apoyo.',
   'Apoyo visual moderado':'Instrucciones breves, palabras clave destacadas y ejemplos visuales.',
   'Lectura silábica':'Texto segmentado, lectura acompañada y vocabulario anticipado.',
   'Respuesta oral':'Permite responder oralmente, con registro del adulto o audio.',
   'Discapacidad intelectual':'Una instrucción por vez, modelado explícito, práctica gradual y apoyos concretos.',
   'TDA/TDAH':'Bloques breves, pausas, señalización de pasos y reducción de distractores.',
   'TEA':'Anticipación de secuencia, lenguaje literal, apoyos visuales y opción de pausa.',
   'Dificultades específicas del aprendizaje':'Andamiaje, menor carga simultánea, modelado y oportunidades de relectura o práctica.',
   'Lenguaje claro y baja carga cognitiva':'Frases directas, segmentación visual, ejemplos y un foco por bloque.',
  }
  return supports[adaptation]||supports['Acceso universal DUA']
 },[adaptation])

 function generate(){
  const label=resourceType
  const base=[
   `Inicio: conecta ${title.toLowerCase()} con una situación cotidiana y activa conocimientos previos.`,
   `Modelamiento: explica el objetivo “${objective}” con un ejemplo paso a paso.`,
   `Práctica guiada: desarrolla una tarea breve con apoyo ${adaptation.toLowerCase()}.`,
   `Aplicación: propone una actividad auténtica de ${subject} para ${level}.`,
   `Cierre: incorpora autoevaluación y metacognición con evidencia observable.`,
  ]
  setQuestions(base.map((text,index)=>({id:Date.now()+index,text})))
  setStatus(`${label} premium generado como ${packageMode.toLowerCase()} · listo para editar`)
 }

 function save(){
  const draft:Draft={title,level,resourceType,subject,objective,adaptation,visualStyle,packageMode,questions,updatedAt:new Date().toISOString()}
  window.localStorage.setItem('yoyo-resource-draft',JSON.stringify(draft))
  setStatus(`Guardado en este dispositivo · ${new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}`)
 }

 function addQuestion(){setQuestions(current=>[...current,{id:Date.now(),text:'Escribe aquí una nueva actividad, criterio o instrucción.'}])}
 function updateQuestion(id:number,text:string){setQuestions(current=>current.map(question=>question.id===id?{...question,text}:question))}
 function removeQuestion(id:number){setQuestions(current=>current.filter(question=>question.id!==id))}

 function onFiles(event:ChangeEvent<HTMLInputElement>){
  const incoming=Array.from(event.target.files??[])
  const remaining=maxFiles===null?incoming:maxFiles-sourceFiles.length
  const accepted=incoming.slice(0,Math.max(0,remaining)).filter(file=>file.size<=maxFileBytes)
  const next=[...sourceFiles,...accepted]
  const withinTotal:SourceFile[]=[];let bytes=0
  for(const file of next){if(bytes+file.size<=maxTotalBytes){withinTotal.push({name:file.name,size:file.size,type:file.type});bytes+=file.size}}
  setSourceFiles(withinTotal)
  if(accepted.length<incoming.length)setStatus('Algunos archivos no se agregaron porque exceden los límites del plan o del almacenamiento actual.')
  else setStatus(`${accepted.length} archivo(s) agregado(s) como fuentes de trabajo.`)
  event.target.value=''
 }

 function download(){
  const text=[`YOYO IA · ${resourceType}`,title,`${subject} · ${level}`,`Objetivo: ${objective}`,`Estilo: ${visualStyle}`,`Salida: ${packageMode}`,'',...questions.map((q,i)=>`${i+1}. ${q.text}`),'',`Apoyo DUA/PIE: ${supportText}`,'',`Fuentes: ${sourceFiles.map(file=>file.name).join(', ')||'Sin archivos adjuntos'}`].join('\n')
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}))
  const anchor=document.createElement('a');anchor.href=url;anchor.download=`${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-')||'recurso'}.txt`;anchor.click();URL.revokeObjectURL(url)
 }

 return <AppShell active="Crear con IA">
  <div className="yoyo-ai-studio">
   <section className="yoyo-ai-hero">
    <div><span className="eyebrow">YOYO IA · motor exclusivo</span><h1>Crear recursos premium con contexto pedagógico real</h1><p>Combina currículo, DUA, PIE/NEE, archivos fuente y diseño para producir materiales listos para editar, imprimir y reutilizar.</p></div>
    <div className="yoyo-plan-card"><Sparkles/><div><small>Plan activo</small><strong>{plan?.name||'Verificando...'}</strong><span>{plan?.model_tier==='owner'?'Modo propietaria · capacidad ampliada':plan?.model_tier||'YOYO IA'}</span></div></div>
   </section>

   <section className="yoyo-capacity-strip" aria-label="Capacidad de YOYO IA">
    <div><strong>{maxFiles===null?'Ilimitados':maxFiles}</strong><span>archivos por solicitud</span></div>
    <div><strong>{mb(maxFileBytes)}</strong><span>máximo por archivo actual</span></div>
    <div><strong>{maxTotalBytes>=1024*1024*1024?gb(maxTotalBytes):mb(maxTotalBytes)}</strong><span>carga total por solicitud</span></div>
    <div><strong>{plan?.max_output_tokens?plan.max_output_tokens.toLocaleString('es-CL'):'—'}</strong><span>tokens de salida</span></div>
   </section>

   <div className="page-head"><div><span className="eyebrow">Estudio de creación</span><h2>Diseña tu paquete educativo</h2><p>Selecciona qué crear y YOYO IA prepara la estructura para docente y estudiante.</p><small aria-live="polite">{status}</small></div><div className="tool-row"><button className="btn btn-soft" onClick={()=>window.print()}><Printer size={17}/>Imprimir</button><button className="btn btn-soft" onClick={download}><Download size={17}/>Descargar</button><button className="btn btn-primary" onClick={save}><Save size={17}/>Guardar borrador</button></div></div>

   <div className="creator-layout yoyo-creator-layout">
    <section className="panel form-panel yoyo-config-panel">
     <h2>Configuración pedagógica</h2>
     <label htmlFor="resourceType">Tipo de recurso</label><select id="resourceType" value={resourceType} onChange={event=>setResourceType(event.target.value)}>{premiumResourceTypes.map(item=><option key={item.id}>{item.label}</option>)}</select>
     <label htmlFor="title">Título o tema</label><input id="title" value={title} onChange={event=>setTitle(event.target.value)}/>
     <label htmlFor="subject">Asignatura</label><input id="subject" value={subject} onChange={event=>setSubject(event.target.value)}/>
     <label htmlFor="level">Nivel</label><select id="level" value={level} onChange={event=>setLevel(event.target.value)}><option>Educación parvularia</option><option>1° básico</option><option>2° básico</option><option>3° básico</option><option>4° básico</option><option>5° básico</option><option>6° básico</option><option>7° básico</option><option>8° básico</option><option>1° medio</option><option>2° medio</option><option>3° medio</option><option>4° medio</option></select>
     <label htmlFor="objective">Objetivo de aprendizaje / OA</label><textarea id="objective" rows={4} value={objective} onChange={event=>setObjective(event.target.value)}/>
     <label htmlFor="adaptation">Perfil de apoyo</label><select id="adaptation" value={adaptation} onChange={event=>setAdaptation(event.target.value)}>{supportProfiles.map(item=><option key={item}>{item}</option>)}</select>
     <label htmlFor="visualStyle">Estilo visual</label><select id="visualStyle" value={visualStyle} onChange={event=>setVisualStyle(event.target.value)}>{visualStyles.map(item=><option key={item}>{item}</option>)}</select>
     <label htmlFor="packageMode">Salida</label><select id="packageMode" value={packageMode} onChange={event=>setPackageMode(event.target.value)}><option>Paquete completo</option><option>Versión estudiante</option><option>Versión docente</option><option>Adaptación accesible</option></select>

     <div className="yoyo-upload-zone">
      <FileUp size={24}/><div><strong>Agregar archivos fuente</strong><span>PDF, documentos, presentaciones, planillas e imágenes.</span></div>
      <label className="btn btn-soft">Seleccionar<input type="file" hidden multiple onChange={onFiles}/></label>
     </div>
     {sourceFiles.length>0&&<div className="yoyo-source-list">{sourceFiles.map((file,index)=><div key={`${file.name}-${index}`}><span><b>{file.name}</b><small>{mb(file.size)}</small></span><button aria-label={`Quitar ${file.name}`} onClick={()=>setSourceFiles(files=>files.filter((_,i)=>i!==index))}><Trash2 size={15}/></button></div>)}</div>}
     <small className="yoyo-upload-note">{sourceFiles.length}{maxFiles===null?'':` / ${maxFiles}`} archivos · {mb(totalBytes)} usados de {maxTotalBytes>=1024*1024*1024?gb(maxTotalBytes):mb(maxTotalBytes)}</small>
     <button className="btn btn-coral yoyo-generate-button" onClick={generate}><Sparkles size={17}/>Generar paquete premium</button>
    </section>

    <section className="preview-paper yoyo-premium-preview" aria-label="Vista previa editable">
     <div className="tool-row"><span className="tag">{level}</span><span className="tag">{subject}</span><span className="tag">{resourceType}</span><span className="tag">{visualStyle}</span></div>
     <div className="yoyo-preview-head"><div><small>YOYO IA · {packageMode}</small><h2>{title||'Recurso sin título'}</h2><p><b>Objetivo:</b> {objective}</p></div><span className="yoyo-quality-badge">Meta premium ≥92/100</span></div>
     <div className="yoyo-package-grid"><div><strong>Docente</strong><span>Objetivo, mediación, respuestas y evaluación.</span></div><div><strong>Estudiante</strong><span>Actividad clara, accesible y lista para usar.</span></div><div><strong>Adaptación</strong><span>{adaptation}</span></div><div><strong>Fuentes</strong><span>{sourceFiles.length?`${sourceFiles.length} archivo(s) vinculados`:'Creación desde contexto pedagógico'}</span></div></div>
     <div className="section-title"><h3>Secuencia editable</h3><button className="btn btn-soft" onClick={addQuestion}><Plus size={16}/>Agregar</button></div>
     <div className="editable-question-list">{questions.map((question,index)=><div className="question editable-question" key={question.id}><b>{index+1}.</b><textarea aria-label={`Actividad ${index+1}`} value={question.text} onChange={event=>updateQuestion(question.id,event.target.value)} rows={2}/><button aria-label={`Eliminar actividad ${index+1}`} onClick={()=>removeQuestion(question.id)}><Trash2 size={17}/></button></div>)}</div>
     <div className="insight"><b>Apoyo DUA y PIE incluido</b><p>{supportText}</p></div>
     <div className="yoyo-preview-actions"><button className="btn btn-soft" onClick={generate}><RefreshCw size={16}/>Regenerar estructura</button><button className="btn btn-primary" onClick={save}><Save size={16}/>Guardar versión</button></div>
    </section>
   </div>
  </div>
 </AppShell>
}
