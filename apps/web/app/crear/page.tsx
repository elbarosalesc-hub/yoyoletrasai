'use client'

import {ChangeEvent,useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Download,FileCheck2,FileText,FileUp,History,Plus,Printer,RefreshCw,Save,Sparkles,Trash2} from 'lucide-react'
import {premiumResourceTypes,supportProfiles,visualStyles} from '@/lib/product/catalog'
import {uploadYoyoSources,type UploadedSource} from '@/lib/ai/upload-sources'

type Question={id:number;text:string}
type Entitlement={credentialId?:string;plan?:{id?:string;name?:string;max_files_per_request?:number;max_file_bytes?:number;max_total_file_bytes?:number;max_output_tokens?:number;unlimited_file_analysis?:boolean;model_tier?:string}}
type TeacherVersion={purpose?:string;instructions?:string[];activities?:string[];assessment?:string}
type StudentVersion={instructions?:string[];activities?:string[]}
type AiOutput={title?:string;summary?:string;teacherVersion?:TeacherVersion;studentVersion?:StudentVersion;answerKey?:string[];duaSupports?:string[];accessibility?:string[];qualityChecklist?:Record<string,boolean>}
type PendingSource={id:string;fileName:string;reason:string}
type GenerateResponse={output?:AiOutput;planName?:string;modelTier?:string;generationId?:string;sources?:{verified?:number;analyzedSourceIds?:string[];pending?:PendingSource[]};error?:string}
type Draft={title:string;level:string;resourceType:string;subject:string;objective:string;adaptation:string;visualStyle:string;packageMode:string;questions:Question[];aiOutput?:AiOutput|null;updatedAt:string}
type SavedVersion=Draft&{id:string}
type RegenerableSection='teacherVersion'|'studentVersion'|'answerKey'|'duaSupports'

const defaultQuestions=['Activa conocimientos previos con una pregunta breve y contextualizada.','Modela el aprendizaje con un ejemplo claro y accesible.','Propone práctica guiada y luego aplicación autónoma.','Cierra con metacognición: qué aprendí, cómo lo aprendí y para qué me sirve.']
const levels=['Educación parvularia','1° básico','2° básico','3° básico','4° básico','5° básico','6° básico','7° básico','8° básico','1° medio','2° medio','3° medio','4° medio']
function mb(value:number){return `${Math.round(value/1024/1024)} MB`}
function gb(value:number){return `${(value/1024/1024/1024).toFixed(value>=1024*1024*1024?0:1)} GB`}
function pendingLabel(reason:string){if(reason==='office-extraction-pending')return 'Subido · extracción Office pendiente';if(reason==='binary-context-limit')return 'Subido · fuera del contexto directo';return 'Subido · formato sin análisis directo'}
function slugify(value:string){return value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'recurso-yoyo'}
function escapeHtml(value:string){return value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]||char))}
function downloadBlob(content:string,type:string,fileName:string){const url=URL.createObjectURL(new Blob([content],{type}));const anchor=document.createElement('a');anchor.href=url;anchor.download=fileName;anchor.click();URL.revokeObjectURL(url)}

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
 const[sourceFiles,setSourceFiles]=useState<UploadedSource[]>([])
 const[pendingSources,setPendingSources]=useState<PendingSource[]>([])
 const[analyzedSourceIds,setAnalyzedSourceIds]=useState<string[]>([])
 const[aiOutput,setAiOutput]=useState<AiOutput|null>(null)
 const[history,setHistory]=useState<SavedVersion[]>([])
 const[generating,setGenerating]=useState(false)
 const[uploading,setUploading]=useState(false)

 useEffect(()=>{
  fetch('/api/ai/entitlement',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then(data=>setEntitlement(data)).catch(()=>setEntitlement(null))
  try{
   const historyStored=window.localStorage.getItem('yoyo-resource-history')
   if(historyStored)setHistory(JSON.parse(historyStored) as SavedVersion[])
   const stored=window.localStorage.getItem('yoyo-resource-draft')
   if(!stored)return
   const draft=JSON.parse(stored) as Draft
   restoreDraft(draft)
   setStatus(`Borrador recuperado · ${new Date(draft.updatedAt).toLocaleString('es-CL')}`)
  }catch{setStatus('No fue posible recuperar el borrador anterior')}
 },[])

 const plan=entitlement?.plan
 const maxFiles=typeof plan?.max_files_per_request==='number'&&plan.max_files_per_request>=0?plan.max_files_per_request:null
 const maxFileBytes=typeof plan?.max_file_bytes==='number'?plan.max_file_bytes:20*1024*1024
 const maxTotalBytes=typeof plan?.max_total_file_bytes==='number'?plan.max_total_file_bytes:100*1024*1024
 const totalBytes=sourceFiles.reduce((sum,file)=>sum+file.size,0)
 const qualityPassed=Object.values(aiOutput?.qualityChecklist||{}).filter(Boolean).length
 const qualityTotal=Object.keys(aiOutput?.qualityChecklist||{}).length
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

 function restoreDraft(draft:Draft){
  setTitle(draft.title);setLevel(draft.level);setResourceType(draft.resourceType);setSubject(draft.subject);setObjective(draft.objective);setAdaptation(draft.adaptation);setVisualStyle(draft.visualStyle||'Infantil académico premium');setPackageMode(draft.packageMode||'Paquete completo');setQuestions(draft.questions||[]);setAiOutput(draft.aiOutput||null)
 }

 function currentDraft():Draft{return{title,level,resourceType,subject,objective,adaptation,visualStyle,packageMode,questions,aiOutput,updatedAt:new Date().toISOString()}}

 async function requestGeneration(progressMessage:string){
  if(generating||uploading)return null
  setGenerating(true);setStatus(progressMessage)
  try{
   const response=await fetch('/api/ai/generate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({resourceType,title,subject,level,objective,supportProfile:adaptation,visualStyle,packageMode,sourceIds:sourceFiles.map(file=>file.id)})})
   const data=(await response.json()) as GenerateResponse
   if(!response.ok)throw new Error(data?.error||'No fue posible generar el recurso.')
   const analyzed=data.sources?.analyzedSourceIds||[];const pending=data.sources?.pending||[]
   setAnalyzedSourceIds(analyzed);setPendingSources(pending)
   return data
  }finally{setGenerating(false)}
 }

 async function generate(){
  try{
   const data=await requestGeneration('YOYO IA está creando el paquete premium con tus fuentes verificadas...')
   if(!data)return
   const output=data.output||{};setAiOutput(output)
   const sequence=[...(output.studentVersion?.instructions||[]),...(output.studentVersion?.activities||[])].filter(Boolean)
   if(sequence.length)setQuestions(sequence.map((text,index)=>({id:Date.now()+index,text})))
   if(output.title)setTitle(output.title)
   const sourceMessage=sourceFiles.length?` · ${(data.sources?.analyzedSourceIds||[]).length}/${sourceFiles.length} fuentes analizadas${(data.sources?.pending||[]).length?` · ${(data.sources?.pending||[]).length} pendiente(s)`:''}`:''
   setStatus(`Paquete premium completado · ${data.planName||'YOYO IA'} · nivel ${data.modelTier||'activo'}${sourceMessage}`)
  }catch(error){setStatus(error instanceof Error?error.message:'YOYO IA no pudo completar la generación.')}
 }

 async function regenerateSection(section:RegenerableSection){
  try{
   const labels:Record<RegenerableSection,string>={teacherVersion:'versión docente',studentVersion:'versión estudiante',answerKey:'pauta de respuestas',duaSupports:'apoyos DUA/PIE'}
   const data=await requestGeneration(`YOYO IA está regenerando sólo ${labels[section]} y conservará el resto...`)
   if(!data?.output)return
   const replacement=data.output[section]
   if(!replacement)throw new Error(`YOYO IA no devolvió ${labels[section]}.`)
   setAiOutput(current=>({...current,[section]:replacement}))
   if(section==='studentVersion'){
    const student=replacement as StudentVersion
    const sequence=[...(student.instructions||[]),...(student.activities||[])].filter(Boolean)
    if(sequence.length)setQuestions(sequence.map((text,index)=>({id:Date.now()+index,text})))
   }
   setStatus(`${labels[section][0].toUpperCase()+labels[section].slice(1)} actualizada sin reemplazar las demás secciones.`)
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible regenerar esta sección.')}
 }

 function save(){
  const draft=currentDraft();window.localStorage.setItem('yoyo-resource-draft',JSON.stringify(draft))
  setHistory(current=>{const next=[{...draft,id:String(Date.now())},...current].slice(0,10);window.localStorage.setItem('yoyo-resource-history',JSON.stringify(next));return next})
  setStatus(`Versión guardada · ${new Date(draft.updatedAt).toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}`)
 }
 function restoreVersion(version:SavedVersion){restoreDraft(version);window.localStorage.setItem('yoyo-resource-draft',JSON.stringify(version));setStatus(`Versión restaurada · ${new Date(version.updatedAt).toLocaleString('es-CL')}`)}
 function addQuestion(){setQuestions(current=>[...current,{id:Date.now(),text:'Escribe aquí una nueva actividad, criterio o instrucción.'}])}
 function updateQuestion(id:number,text:string){setQuestions(current=>current.map(question=>question.id===id?{...question,text}:question))}
 function removeQuestion(id:number){setQuestions(current=>current.filter(question=>question.id!==id))}
 function removeSource(id:string){setSourceFiles(files=>files.filter(file=>file.id!==id));setAnalyzedSourceIds(ids=>ids.filter(item=>item!==id));setPendingSources(items=>items.filter(item=>item.id!==id));setStatus('Fuente retirada de esta generación. El archivo privado permanece guardado hasta implementar limpieza automática.')}

 async function onFiles(event:ChangeEvent<HTMLInputElement>){
  const incoming=Array.from(event.target.files??[]);event.target.value=''
  if(!incoming.length||uploading)return
  const remaining=maxFiles===null?incoming.length:Math.max(0,maxFiles-sourceFiles.length)
  const accepted=incoming.slice(0,remaining).filter(file=>file.size>0&&file.size<=maxFileBytes)
  let bytes=totalBytes;const withinTotal:File[]=[]
  for(const file of accepted){if(bytes+file.size<=maxTotalBytes){withinTotal.push(file);bytes+=file.size}}
  if(!withinTotal.length){setStatus('No se agregaron archivos: revisa cantidad, tamaño individual y carga total del plan.');return}
  setUploading(true);setStatus(`Subiendo y verificando ${withinTotal.length} archivo(s) en Storage privado...`)
  try{
   const uploaded=await uploadYoyoSources(withinTotal)
   setSourceFiles(current=>[...current,...uploaded]);setPendingSources([]);setAnalyzedSourceIds([])
   const rejected=incoming.length-withinTotal.length
   setStatus(`${uploaded.length} archivo(s) verificado(s) y listos para YOYO IA${rejected>0?` · ${rejected} no agregado(s) por límites`:''}.`)
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible completar la carga segura.')}
  finally{setUploading(false)}
 }

 function downloadText(){
  const teacher=[aiOutput?.teacherVersion?.purpose,...(aiOutput?.teacherVersion?.instructions||[]),...(aiOutput?.teacherVersion?.activities||[]),aiOutput?.teacherVersion?.assessment].filter(Boolean) as string[]
  const text=[`YOYO IA · ${resourceType}`,title,`${subject} · ${level}`,`Objetivo: ${objective}`,`Estilo: ${visualStyle}`,`Salida: ${packageMode}`,'','VERSIÓN DOCENTE',...teacher,'','VERSIÓN ESTUDIANTE',...questions.map((q,i)=>`${i+1}. ${q.text}`),'','APOYOS DUA / PIE',...(aiOutput?.duaSupports||[supportText]),'','PAUTA / RESPUESTAS',...(aiOutput?.answerKey||['Pendiente de generación'])].join('\n')
  downloadBlob(text,'text/plain;charset=utf-8',`${slugify(title)}.txt`)
 }

 function downloadWord(){
  const list=(items:string[]|undefined)=>items?.length?`<ol>${items.map(item=>`<li>${escapeHtml(item)}</li>`).join('')}</ol>`:'<p>Sin contenido generado todavía.</p>'
  const html=`<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>body{font-family:Arial,sans-serif;line-height:1.5;color:#1f2937;max-width:850px;margin:40px auto}h1{color:#5f43cf}h2{margin-top:28px;border-bottom:1px solid #ddd;padding-bottom:6px}.meta{background:#f5f3ff;padding:14px;border-radius:12px}.support{background:#f0fdf4;padding:14px;border-radius:12px}</style></head><body><p><b>YOYO IA · ${escapeHtml(resourceType)}</b></p><h1>${escapeHtml(title)}</h1><div class="meta"><b>${escapeHtml(subject)} · ${escapeHtml(level)}</b><br>Objetivo: ${escapeHtml(objective)}<br>Perfil de apoyo: ${escapeHtml(adaptation)}</div><h2>Versión docente</h2><p>${escapeHtml(aiOutput?.teacherVersion?.purpose||'Propósito pedagógico pendiente de generación.')}</p>${list(aiOutput?.teacherVersion?.instructions)}${list(aiOutput?.teacherVersion?.activities)}${aiOutput?.teacherVersion?.assessment?`<p><b>Evaluación:</b> ${escapeHtml(aiOutput.teacherVersion.assessment)}</p>`:''}<h2>Versión estudiante</h2>${list(questions.map(item=>item.text))}<h2>Apoyos DUA / PIE</h2><div class="support">${list(aiOutput?.duaSupports||[supportText])}</div><h2>Pauta / respuestas</h2>${list(aiOutput?.answerKey)}</body></html>`
  downloadBlob(html,'application/msword;charset=utf-8',`${slugify(title)}.doc`)
 }

 return <AppShell active="Crear con IA"><div className="yoyo-ai-studio">
  <section className="yoyo-ai-hero"><div><span className="eyebrow">YOYO IA · motor exclusivo</span><h1>Crear recursos premium con contexto pedagógico real</h1><p>Combina currículo, DUA, PIE/NEE, fuentes verificadas y diseño para producir materiales editables, imprimibles, versionables y reutilizables.</p></div><div className="yoyo-plan-card"><Sparkles/><div><small>Plan activo</small><strong>{plan?.name||'Verificando...'}</strong><span>{plan?.model_tier==='owner'?'Modo propietaria · capacidad ampliada':plan?.model_tier||'YOYO IA'}</span></div></div></section>
  <section className="yoyo-capacity-strip"><div><strong>{maxFiles===null?'Ilimitados':maxFiles}</strong><span>archivos por solicitud</span></div><div><strong>{mb(maxFileBytes)}</strong><span>máximo por archivo actual</span></div><div><strong>{maxTotalBytes>=1024*1024*1024?gb(maxTotalBytes):mb(maxTotalBytes)}</strong><span>carga total por solicitud</span></div><div><strong>{plan?.max_output_tokens?plan.max_output_tokens.toLocaleString('es-CL'):'—'}</strong><span>tokens de salida</span></div></section>
  <div className="page-head"><div><span className="eyebrow">Estudio de creación</span><h2>Diseña tu paquete educativo</h2><p>Configura el recurso, carga fuentes reales y deja que YOYO IA construya el paquete pedagógico.</p><small aria-live="polite">{status}</small></div><div className="tool-row"><button className="btn btn-soft" onClick={()=>window.print()}><Printer size={17}/>Imprimir / PDF</button><button className="btn btn-soft" onClick={downloadText}><Download size={17}/>TXT</button><button className="btn btn-soft" onClick={downloadWord}><FileText size={17}/>Word editable</button><button className="btn btn-primary" onClick={save}><Save size={17}/>Guardar versión</button></div></div>
  <div className="creator-layout yoyo-creator-layout"><section className="panel form-panel yoyo-config-panel"><h2>Configuración pedagógica</h2>
   <label htmlFor="resourceType">Tipo de recurso</label><select id="resourceType" value={resourceType} onChange={e=>setResourceType(e.target.value)}>{premiumResourceTypes.map(item=><option key={item.id}>{item.label}</option>)}</select>
   <label htmlFor="title">Título o tema</label><input id="title" value={title} onChange={e=>setTitle(e.target.value)}/><label htmlFor="subject">Asignatura</label><input id="subject" value={subject} onChange={e=>setSubject(e.target.value)}/>
   <label htmlFor="level">Nivel</label><select id="level" value={level} onChange={e=>setLevel(e.target.value)}>{levels.map(item=><option key={item}>{item}</option>)}</select>
   <label htmlFor="objective">Objetivo de aprendizaje / OA</label><textarea id="objective" rows={4} value={objective} onChange={e=>setObjective(e.target.value)}/><label htmlFor="adaptation">Perfil de apoyo</label><select id="adaptation" value={adaptation} onChange={e=>setAdaptation(e.target.value)}>{supportProfiles.map(item=><option key={item}>{item}</option>)}</select><label htmlFor="visualStyle">Estilo visual</label><select id="visualStyle" value={visualStyle} onChange={e=>setVisualStyle(e.target.value)}>{visualStyles.map(item=><option key={item}>{item}</option>)}</select><label htmlFor="packageMode">Salida</label><select id="packageMode" value={packageMode} onChange={e=>setPackageMode(e.target.value)}>{['Paquete completo','Versión estudiante','Versión docente','Adaptación accesible'].map(item=><option key={item}>{item}</option>)}</select>
   <div className="yoyo-upload-zone"><FileUp size={24}/><div><strong>Fuentes para YOYO IA</strong><span>Se suben a Storage privado y se verifican antes de usarse.</span></div><label className={`btn btn-soft ${uploading?'is-disabled':''}`}>{uploading?'Subiendo...':'Seleccionar'}<input type="file" hidden multiple disabled={uploading} onChange={onFiles}/></label></div>
   {sourceFiles.length>0&&<div className="yoyo-source-list">{sourceFiles.map(file=>{const pending=pendingSources.find(item=>item.id===file.id);const analyzed=analyzedSourceIds.includes(file.id);return <div key={file.id}><span><b>{file.name}</b><small>{mb(file.size)} · {analyzed?'Analizado en esta generación':pending?pendingLabel(pending.reason):'Verificado · listo para analizar'}</small></span><span className={`yoyo-source-state ${analyzed?'is-analyzed':pending?'is-pending':'is-ready'}`}><FileCheck2 size={14}/>{analyzed?'Analizado':pending?'Pendiente':'Listo'}</span><button aria-label={`Quitar ${file.name}`} onClick={()=>removeSource(file.id)}><Trash2 size={15}/></button></div>})}</div>}
   <small className="yoyo-upload-note">{sourceFiles.length}{maxFiles===null?'':` / ${maxFiles}`} archivos verificados · {mb(totalBytes)} usados</small><button className="btn btn-coral yoyo-generate-button" disabled={generating||uploading} onClick={generate}>{generating?<RefreshCw size={17}/>:<Sparkles size={17}/>} {generating?'Trabajando con YOYO IA...':'Generar paquete premium'}</button>
   {history.length>0&&<div className="insight"><b><History size={15}/> Historial local</b>{history.slice(0,4).map(version=><p key={version.id}><button className="btn btn-soft" onClick={()=>restoreVersion(version)}>Restaurar</button> {new Date(version.updatedAt).toLocaleString('es-CL')} · {version.resourceType}</p>)}</div>}
  </section>
  <section className="preview-paper yoyo-premium-preview" aria-label="Vista previa editable"><div className="tool-row"><span className="tag">{level}</span><span className="tag">{subject}</span><span className="tag">{resourceType}</span><span className="tag">{visualStyle}</span></div><div className="yoyo-preview-head"><div><small>YOYO IA · {packageMode}</small><h2>{title||'Recurso sin título'}</h2><p><b>Objetivo:</b> {objective}</p>{aiOutput?.summary&&<p>{aiOutput.summary}</p>}</div><span className="yoyo-quality-badge">{qualityTotal?`Checklist ${qualityPassed}/${qualityTotal}`:'Meta premium ≥92/100'}</span></div>
   <div className="yoyo-package-grid"><div><strong>Docente</strong><span>{aiOutput?.teacherVersion?.purpose||'Objetivo, mediación, respuestas y evaluación.'}</span></div><div><strong>Estudiante</strong><span>{questions.length} elementos editables listos para usar.</span></div><div><strong>Adaptación</strong><span>{adaptation}</span></div><div><strong>Fuentes</strong><span>{sourceFiles.length?`${analyzedSourceIds.length}/${sourceFiles.length} analizadas en la última generación`:'Creación desde contexto pedagógico'}</span></div></div>

   <div className="section-title"><h3>Versión docente</h3><button className="btn btn-soft" disabled={generating||uploading} onClick={()=>regenerateSection('teacherVersion')}><RefreshCw size={16}/>Regenerar sección</button></div>
   <div className="insight"><b>{aiOutput?.teacherVersion?.purpose||'Propósito pedagógico'}</b>{(aiOutput?.teacherVersion?.instructions||[]).map((item,index)=><p key={`ti-${index}`}>• {item}</p>)}{(aiOutput?.teacherVersion?.activities||[]).map((item,index)=><p key={`ta-${index}`}>✓ {item}</p>)}{aiOutput?.teacherVersion?.assessment&&<p><b>Evaluación:</b> {aiOutput.teacherVersion.assessment}</p>}</div>

   <div className="section-title"><h3>Versión estudiante · secuencia editable</h3><div className="tool-row"><button className="btn btn-soft" disabled={generating||uploading} onClick={()=>regenerateSection('studentVersion')}><RefreshCw size={16}/>Regenerar sección</button><button className="btn btn-soft" onClick={addQuestion}><Plus size={16}/>Agregar</button></div></div>
   <div className="editable-question-list">{questions.map((question,index)=><div className="question editable-question" key={question.id}><b>{index+1}.</b><textarea aria-label={`Actividad ${index+1}`} value={question.text} onChange={e=>updateQuestion(question.id,e.target.value)} rows={2}/><button aria-label={`Eliminar actividad ${index+1}`} onClick={()=>removeQuestion(question.id)}><Trash2 size={17}/></button></div>)}</div>

   <div className="section-title"><h3>Apoyos DUA y PIE</h3><button className="btn btn-soft" disabled={generating||uploading} onClick={()=>regenerateSection('duaSupports')}><RefreshCw size={16}/>Regenerar sección</button></div><div className="insight"><b>Acceso al mismo objetivo de aprendizaje</b><p>{aiOutput?.duaSupports?.join(' · ')||supportText}</p>{aiOutput?.accessibility?.length?<p><b>Accesibilidad:</b> {aiOutput.accessibility.join(' · ')}</p>:null}</div>

   <div className="section-title"><h3>Pauta / respuestas</h3><button className="btn btn-soft" disabled={generating||uploading} onClick={()=>regenerateSection('answerKey')}><RefreshCw size={16}/>Regenerar sección</button></div><div className="insight">{aiOutput?.answerKey?.length?aiOutput.answerKey.map((item,index)=><p key={`answer-${index}`}>{index+1}. {item}</p>):<p>La pauta aparecerá aquí después de generar el paquete.</p>}</div>

   <div className="yoyo-preview-actions"><button className="btn btn-soft" disabled={generating||uploading} onClick={generate}><RefreshCw size={16}/>Regenerar paquete completo</button><button className="btn btn-primary" onClick={save}><Save size={16}/>Guardar versión</button></div>
  </section></div></div></AppShell>
}
