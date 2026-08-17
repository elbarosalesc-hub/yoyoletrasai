'use client'

import {ChangeEvent,useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Download,FileUp,Plus,Printer,RefreshCw,Save,Sparkles,Trash2} from 'lucide-react'
import {premiumResourceTypes,supportProfiles,visualStyles} from '@/lib/product/catalog'

type Question={id:number;text:string}
type Entitlement={credentialId?:string;plan?:{id?:string;name?:string;max_files_per_request?:number;max_file_bytes?:number;max_total_file_bytes?:number;max_output_tokens?:number;unlimited_file_analysis?:boolean;model_tier?:string}}
type SourceFile={name:string;size:number;type:string}
type AiOutput={title?:string;summary?:string;teacherVersion?:{purpose?:string;instructions?:string[];activities?:string[];assessment?:string};studentVersion?:{instructions?:string[];activities?:string[]};answerKey?:string[];duaSupports?:string[];accessibility?:string[]}
type Draft={title:string;level:string;resourceType:string;subject:string;objective:string;adaptation:string;visualStyle:string;packageMode:string;questions:Question[];updatedAt:string}

const defaultQuestions=['Activa conocimientos previos con una pregunta breve y contextualizada.','Modela el aprendizaje con un ejemplo claro y accesible.','Propone práctica guiada y luego aplicación autónoma.','Cierra con metacognición: qué aprendí, cómo lo aprendí y para qué me sirve.']
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
 const[aiOutput,setAiOutput]=useState<AiOutput|null>(null)
 const[generating,setGenerating]=useState(false)

 useEffect(()=>{
  fetch('/api/ai/entitlement',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then(data=>setEntitlement(data)).catch(()=>setEntitlement(null))
  const stored=window.localStorage.getItem('yoyo-resource-draft');if(!stored)return
  try{const draft=JSON.parse(stored) as Draft;setTitle(draft.title);setLevel(draft.level);setResourceType(draft.resourceType);setSubject(draft.subject);setObjective(draft.objective);setAdaptation(draft.adaptation);setVisualStyle(draft.visualStyle||'Infantil académico premium');setPackageMode(draft.packageMode||'Paquete completo');setQuestions(draft.questions);setStatus(`Borrador recuperado · ${new Date(draft.updatedAt).toLocaleString('es-CL')}`)}catch{setStatus('No fue posible recuperar el borrador anterior')}
 },[])

 const plan=entitlement?.plan
 const maxFiles=typeof plan?.max_files_per_request==='number'&&plan.max_files_per_request>=0?plan.max_files_per_request:null
 const maxFileBytes=typeof plan?.max_file_bytes==='number'?plan.max_file_bytes:20*1024*1024
 const maxTotalBytes=typeof plan?.max_total_file_bytes==='number'?plan.max_total_file_bytes:100*1024*1024
 const totalBytes=sourceFiles.reduce((sum,file)=>sum+file.size,0)
 const supportText=useMemo(()=>({
  'Acceso universal DUA':'Múltiples formas de representación, participación y respuesta; instrucciones claras y opciones de apoyo.',
  'Apoyo visual moderado':'Instrucciones breves, palabras clave destacadas y ejemplos visuales.',
  'Lectura silábica':'Texto segmentado, lectura acompañada y vocabulario anticipado.',
  'Respuesta oral':'Permite responder oralmente, con registro del adulto o audio.',
  'Discapacidad intelectual':'Una instrucción por vez, modelado explícito, práctica gradual y apoyos concretos.',
  'TDA/TDAH':'Bloques breves, pausas, señalización de pasos y reducción de distractores.',
  'TEA':'Anticipación de secuencia, lenguaje literal, apoyos visuales y opción de pausa.',
  'Dificultades específicas del aprendizaje':'Andamiaje, menor carga simultánea, modelado y oportunidades de relectura o práctica.',
  'Lenguaje claro y baja carga cognitiva':'Frases directas, segmentación visual, ejemplos y un foco por bloque.',
 } as Record<string,string>)[adaptation]||'Acceso universal DUA',[adaptation])

 async function generate(){
  if(generating)return
  setGenerating(true);setStatus('YOYO IA está creando el paquete premium...')
  try{
   const response=await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resourceType,title,subject,level,objective,supportProfile:adaptation,visualStyle,sourceFiles})})
   const data=await response.json()
   if(!response.ok)throw new Error(data?.error||'No fue posible generar el recurso.')
   const output=(data.output||{}) as AiOutput;setAiOutput(output)
   const sequence=[...(output.studentVersion?.instructions||[]),...(output.studentVersion?.activities||[])].filter(Boolean)
   if(sequence.length)setQuestions(sequence.map((text,index)=>({id:Date.now()+index,text})))
   if(output.title)setTitle(output.title)
   setStatus(`Generación real completada · ${data.planName||'YOYO IA'} · nivel ${data.modelTier||'activo'}`)
  }catch(error){setStatus(error instanceof Error?error.message:'YOYO IA no pudo completar la generación.')}
  finally{setGenerating(false)}
 }

 function save(){const draft:Draft={title,level,resourceType,subject,objective,adaptation,visualStyle,packageMode,questions,updatedAt:new Date().toISOString()};window.localStorage.setItem('yoyo-resource-draft',JSON.stringify(draft));setStatus(`Guardado en este dispositivo · ${new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}`)}
 function addQuestion(){setQuestions(current=>[...current,{id:Date.now(),text:'Escribe aquí una nueva actividad, criterio o instrucción.'}])}
 function updateQuestion(id:number,text:string){setQuestions(current=>current.map(question=>question.id===id?{...question,text}:question))}
 function removeQuestion(id:number){setQuestions(current=>current.filter(question=>question.id!==id))}
 function onFiles(event:ChangeEvent<HTMLInputElement>){const incoming=Array.from(event.target.files??[]);const remaining=maxFiles===null?incoming.length:maxFiles-sourceFiles.length;const accepted=incoming.slice(0,Math.max(0,remaining)).filter(file=>file.size<=maxFileBytes);const next=[...sourceFiles,...accepted.map(file=>({name:file.name,size:file.size,type:file.type}))];const withinTotal:SourceFile[]=[];let bytes=0;for(const file of next){if(bytes+file.size<=maxTotalBytes){withinTotal.push(file);bytes+=file.size}}setSourceFiles(withinTotal);setStatus(accepted.length<incoming.length?'Algunos archivos no se agregaron porque exceden los límites actuales.':'Archivos seleccionados. La carga segura y análisis de contenido se habilitan en la siguiente conexión.');event.target.value=''}
 function download(){const text=[`YOYO IA · ${resourceType}`,title,`${subject} · ${level}`,`Objetivo: ${objective}`,`Estilo: ${visualStyle}`,`Salida: ${packageMode}`,'',...questions.map((q,i)=>`${i+1}. ${q.text}`),'',`Apoyo DUA/PIE: ${supportText}`,aiOutput?.answerKey?.length?'\nPauta:\n'+aiOutput.answerKey.join('\n'):''].join('\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const anchor=document.createElement('a');anchor.href=url;anchor.download=`${title.toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-')||'recurso'}.txt`;anchor.click();URL.revokeObjectURL(url)}

 return <AppShell active="Crear con IA"><div className="yoyo-ai-studio">
  <section className="yoyo-ai-hero"><div><span className="eyebrow">YOYO IA · motor exclusivo</span><h1>Crear recursos premium con contexto pedagógico real</h1><p>Combina currículo, DUA, PIE/NEE y diseño para producir materiales editables, imprimibles y reutilizables.</p></div><div className="yoyo-plan-card"><Sparkles/><div><small>Plan activo</small><strong>{plan?.name||'Verificando...'}</strong><span>{plan?.model_tier==='owner'?'Modo propietaria · capacidad ampliada':plan?.model_tier||'YOYO IA'}</span></div></div></section>
  <section className="yoyo-capacity-strip"><div><strong>{maxFiles===null?'Ilimitados':maxFiles}</strong><span>archivos por solicitud</span></div><div><strong>{mb(maxFileBytes)}</strong><span>máximo por archivo actual</span></div><div><strong>{maxTotalBytes>=1024*1024*1024?gb(maxTotalBytes):mb(maxTotalBytes)}</strong><span>carga total por solicitud</span></div><div><strong>{plan?.max_output_tokens?plan.max_output_tokens.toLocaleString('es-CL'):'—'}</strong><span>tokens de salida</span></div></section>
  <div className="page-head"><div><span className="eyebrow">Estudio de creación</span><h2>Diseña tu paquete educativo</h2><p>Configura el recurso; la generación usa el backend independiente de YOYO IA.</p><small aria-live="polite">{status}</small></div><div className="tool-row"><button className="btn btn-soft" onClick={()=>window.print()}><Printer size={17}/>Imprimir</button><button className="btn btn-soft" onClick={download}><Download size={17}/>Descargar</button><button className="btn btn-primary" onClick={save}><Save size={17}/>Guardar borrador</button></div></div>
  <div className="creator-layout yoyo-creator-layout"><section className="panel form-panel yoyo-config-panel"><h2>Configuración pedagógica</h2>
   <label htmlFor="resourceType">Tipo de recurso</label><select id="resourceType" value={resourceType} onChange={e=>setResourceType(e.target.value)}>{premiumResourceTypes.map(item=><option key={item.id}>{item.label}</option>)}</select>
   <label htmlFor="title">Título o tema</label><input id="title" value={title} onChange={e=>setTitle(e.target.value)}/><label htmlFor="subject">Asignatura</label><input id="subject" value={subject} onChange={e=>setSubject(e.target.value)}/>
   <label htmlFor="level">Nivel</label><select id="level" value={level} onChange={e=>setLevel(e.target.value)}>{['Educación parvularia','1° básico','2° básico','3° básico','4° básico','5° básico','6° básico','7° básico','8° básico','1° medio','2° medio','3° medio','4° medio'].map(item=><option key={item}>{item}</option>)}</select>
   <label htmlFor="objective">Objetivo de aprendizaje / OA</label><textarea id="objective" rows={4} value={objective} onChange={e=>setObjective(e.target.value)}/><label htmlFor="adaptation">Perfil de apoyo</label><select id="adaptation" value={adaptation} onChange={e=>setAdaptation(e.target.value)}>{supportProfiles.map(item=><option key={item}>{item}</option>)}</select><label htmlFor="visualStyle">Estilo visual</label><select id="visualStyle" value={visualStyle} onChange={e=>setVisualStyle(e.target.value)}>{visualStyles.map(item=><option key={item}>{item}</option>)}</select><label htmlFor="packageMode">Salida</label><select id="packageMode" value={packageMode} onChange={e=>setPackageMode(e.target.value)}>{['Paquete completo','Versión estudiante','Versión docente','Adaptación accesible'].map(item=><option key={item}>{item}</option>)}</select>
   <div className="yoyo-upload-zone"><FileUp size={24}/><div><strong>Agregar archivos fuente</strong><span>Selección validada por límites del plan; conexión de contenido en curso.</span></div><label className="btn btn-soft">Seleccionar<input type="file" hidden multiple onChange={onFiles}/></label></div>
   {sourceFiles.length>0&&<div className="yoyo-source-list">{sourceFiles.map((file,index)=><div key={`${file.name}-${index}`}><span><b>{file.name}</b><small>{mb(file.size)}</small></span><button aria-label={`Quitar ${file.name}`} onClick={()=>setSourceFiles(files=>files.filter((_,i)=>i!==index))}><Trash2 size={15}/></button></div>)}</div>}
   <small className="yoyo-upload-note">{sourceFiles.length}{maxFiles===null?'':` / ${maxFiles}`} archivos · {mb(totalBytes)} usados</small><button className="btn btn-coral yoyo-generate-button" disabled={generating} onClick={generate}>{generating?<RefreshCw size={17}/>:<Sparkles size={17}/>} {generating?'Generando con YOYO IA...':'Generar paquete premium'}</button>
  </section>
  <section className="preview-paper yoyo-premium-preview" aria-label="Vista previa editable"><div className="tool-row"><span className="tag">{level}</span><span className="tag">{subject}</span><span className="tag">{resourceType}</span><span className="tag">{visualStyle}</span></div><div className="yoyo-preview-head"><div><small>YOYO IA · {packageMode}</small><h2>{title||'Recurso sin título'}</h2><p><b>Objetivo:</b> {objective}</p>{aiOutput?.summary&&<p>{aiOutput.summary}</p>}</div><span className="yoyo-quality-badge">Meta premium ≥92/100</span></div>
   <div className="yoyo-package-grid"><div><strong>Docente</strong><span>{aiOutput?.teacherVersion?.purpose||'Objetivo, mediación, respuestas y evaluación.'}</span></div><div><strong>Estudiante</strong><span>Actividad clara, accesible y lista para usar.</span></div><div><strong>Adaptación</strong><span>{adaptation}</span></div><div><strong>Pauta</strong><span>{aiOutput?.answerKey?.length?`${aiOutput.answerKey.length} respuestas/criterios generados`:'Se generará junto al recurso'}</span></div></div>
   <div className="section-title"><h3>Secuencia editable</h3><button className="btn btn-soft" onClick={addQuestion}><Plus size={16}/>Agregar</button></div><div className="editable-question-list">{questions.map((question,index)=><div className="question editable-question" key={question.id}><b>{index+1}.</b><textarea aria-label={`Actividad ${index+1}`} value={question.text} onChange={e=>updateQuestion(question.id,e.target.value)} rows={2}/><button aria-label={`Eliminar actividad ${index+1}`} onClick={()=>removeQuestion(question.id)}><Trash2 size={17}/></button></div>)}</div><div className="insight"><b>Apoyo DUA y PIE incluido</b><p>{aiOutput?.duaSupports?.join(' · ')||supportText}</p></div><div className="yoyo-preview-actions"><button className="btn btn-soft" disabled={generating} onClick={generate}><RefreshCw size={16}/>Regenerar con IA</button><button className="btn btn-primary" onClick={save}><Save size={16}/>Guardar versión</button></div>
  </section></div></div></AppShell>
}
