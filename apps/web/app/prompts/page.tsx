'use client'

import {FormEvent,useMemo,useState} from 'react'
import {useRouter} from 'next/navigation'
import {AppShell} from '@/components/AppShell'
import {premiumResourceTypes,supportProfiles} from '@/lib/product/catalog'
import {BookOpen,Brain,Copy,ExternalLink,Filter,Gamepad2,GraduationCap,Search,Sparkles,Target,WandSparkles} from 'lucide-react'

type PromptItem={id:string;title:string;description:string;content:string;type:string;author:string;category:string;tags:string[];votes:number}
type SearchResponse={query?:string;count?:number;prompts?:PromptItem[];error?:string}
type DeliveryMode='Imprimible'|'Digital interactivo'|'Juego pedagógico'

type PedagogicalPreset={label:string;description:string;apply:()=>void}

const promptTypes=['','TEXT','STRUCTURED','IMAGE','VIDEO','AUDIO']
const typeLabels:Record<string,string>={TEXT:'Texto',STRUCTURED:'Estructurado',IMAGE:'Imagen',VIDEO:'Video',AUDIO:'Audio'}
const levels=['Educación parvularia','1° básico','2° básico','3° básico','4° básico','5° básico','6° básico','7° básico','8° básico','1° medio','2° medio','3° medio','4° medio']
const subjects=['Lenguaje y Comunicación','Matemática','Ciencias Naturales','Historia, Geografía y Ciencias Sociales','Inglés','Artes Visuales','Música','Educación Física y Salud','Tecnología','Orientación','Educación Ciudadana','Filosofía','Física','Química','Biología']
const bloomLevels=['Recordar','Comprender','Aplicar','Analizar','Evaluar','Crear']
const complexityLevels=['Inicial / muy guiado','Básico','Intermedio','Avanzado','Desafío / profundización']
const deliveryModes:DeliveryMode[]=['Imprimible','Digital interactivo','Juego pedagógico']

function clip(value:string,max:number){return value.length>max?`${value.slice(0,max-1)}…`:value}

export default function PromptsPage(){
 const router=useRouter()
 const[query,setQuery]=useState('comprensión lectora')
 const[type,setType]=useState('TEXT')
 const[level,setLevel]=useState('3° básico')
 const[subject,setSubject]=useState('Lenguaje y Comunicación')
 const[oa,setOa]=useState('Comprender información explícita e inferencial y justificar respuestas con evidencia del texto.')
 const[bloom,setBloom]=useState('Comprender')
 const[adaptation,setAdaptation]=useState('Acceso universal DUA')
 const[complexity,setComplexity]=useState('Intermedio')
 const[resourceType,setResourceType]=useState('Guía de aprendizaje')
 const[deliveryMode,setDeliveryMode]=useState<DeliveryMode>('Imprimible')
 const[items,setItems]=useState<PromptItem[]>([])
 const[status,setStatus]=useState('Configura el contexto pedagógico, busca una idea y conviértela en un recurso con YOYO IA.')
 const[loading,setLoading]=useState(false)
 const selectedCount=useMemo(()=>items.length,[items])
 const resourceLabels=useMemo(()=>premiumResourceTypes.map(item=>item.label),[])
 const pedagogicalSummary=useMemo(()=>`${level} · ${subject} · ${bloom} · ${complexity} · ${adaptation} · ${resourceType} · ${deliveryMode}`,[level,subject,bloom,complexity,adaptation,resourceType,deliveryMode])

 const presets:PedagogicalPreset[]=[
  {label:'DUA / PIE',description:'Acceso universal y apoyos inclusivos',apply:()=>{setAdaptation('Acceso universal DUA');setComplexity('Básico');setResourceType('Secuencia DUA');setDeliveryMode('Imprimible')}},
  {label:'Evaluación',description:'Ítems claros, pauta y niveles cognitivos',apply:()=>{setBloom('Aplicar');setResourceType('Evaluación');setDeliveryMode('Imprimible')}},
  {label:'Juego',description:'Misión, desafío, feedback y progresión',apply:()=>{setBloom('Aplicar');setResourceType('Escape room pedagógico');setDeliveryMode('Juego pedagógico')}},
  {label:'Digital',description:'Actividad para interacción en pantalla',apply:()=>{setBloom('Comprender');setResourceType('Quiz interactivo');setDeliveryMode('Digital interactivo')}},
 ]

 async function search(event?:FormEvent){
  event?.preventDefault()
  const clean=query.trim()
  if(!clean){setStatus('Escribe un tema o necesidad pedagógica para buscar.');return}
  setLoading(true);setStatus('Buscando ideas y filtrando para tu contexto pedagógico...')
  try{
   const educationalQuery=clip(`${clean} ${subject} ${level} educación ${bloom}`,180)
   const params=new URLSearchParams({q:educationalQuery,limit:'18'})
   if(type)params.set('type',type)
   const response=await fetch(`/api/prompts-chat/search?${params.toString()}`,{cache:'no-store'})
   const data=(await response.json()) as SearchResponse
   if(!response.ok)throw new Error(data.error||'No fue posible completar la búsqueda.')
   setItems(data.prompts||[])
   setStatus(`${data.count||0} idea(s) encontradas. Selecciona una para contextualizarla con YOYO IA.`)
  }catch(error){setItems([]);setStatus(error instanceof Error?error.message:'No fue posible completar la búsqueda.')}
  finally{setLoading(false)}
 }

 function buildObjective(prompt:PromptItem){
  const sourceIdea=clip(prompt.content.replace(/\s+/g,' ').trim(),900)
  const oaText=oa.trim()||`Desarrollar la habilidad de ${bloom.toLowerCase()} en ${subject}, sin inventar un código OA oficial.`
  return clip([
   `OA / habilidad priorizada: ${oaText}`,
   `Nivel cognitivo: ${bloom}. Complejidad: ${complexity}.`,
   `Modalidad de salida: ${deliveryMode}. Recurso: ${resourceType}.`,
   `Aplicar ${adaptation} manteniendo el objetivo común, con apoyos DUA/PIE y alternativas de participación y respuesta.`,
   `Usar esta idea externa sólo como inspiración y transformarla pedagógicamente, sin copiarla de forma mecánica: ${sourceIdea}`,
   `Contextualizar al currículum chileno; si no existe un código OA verificado, describir el objetivo sin inventar numeración oficial.`,
  ].join(' '),1950)
 }

 function usePrompt(prompt:PromptItem){
  try{
   const now=new Date().toISOString()
   const objective=buildObjective(prompt)
   const modeInstruction=deliveryMode==='Juego pedagógico'
    ?'Diseña una experiencia de juego con misión, reglas, niveles, feedback inmediato, condición de avance, accesibilidad y evidencias de aprendizaje. Si el motor no renderiza 3D, entrega una especificación jugable lista para el módulo de Juegos.'
    :deliveryMode==='Digital interactivo'
      ?'Diseña interacción digital con instrucciones breves, feedback inmediato, progresión y versión accesible.'
      :'Prioriza maquetación imprimible, uso eficiente del espacio, instrucciones claras, versión estudiante y pauta docente.'
   const draft={
    title:`${prompt.title} · ${level}`,
    level,
    resourceType,
    subject,
    objective,
    adaptation,
    visualStyle:adaptation==='Acceso universal DUA'?'Alta accesibilidad':'Infantil académico premium',
    packageMode:'Paquete completo',
    questions:[
     {id:Date.now(),text:`Idea base seleccionada: ${prompt.content}`},
     {id:Date.now()+1,text:`Criterio pedagógico: ${modeInstruction}`},
     {id:Date.now()+2,text:`Nivel cognitivo esperado: ${bloom}. Complejidad: ${complexity}. OA/habilidad: ${oa.trim()||'describir sin inventar código oficial'}.`},
    ],
    aiOutput:null,
    updatedAt:now,
   }
   window.localStorage.setItem('yoyo-prompts-chat-selection',JSON.stringify({
    title:prompt.title,content:prompt.content,type:prompt.type,source:'prompts.chat',selectedAt:now,
    pedagogy:{level,subject,oa,bloom,adaptation,complexity,resourceType,deliveryMode},
   }))
   window.localStorage.setItem('yoyo-resource-draft',JSON.stringify(draft))
   router.push('/crear?from=prompts-chat&context=pedagogical-engine')
  }catch{setStatus('No fue posible transferir este prompt al creador.')}
 }

 async function copyPrompt(content:string){
  try{await navigator.clipboard.writeText(content);setStatus('Prompt copiado al portapapeles.')}
  catch{setStatus('No fue posible copiar el prompt desde este navegador.')}
 }

 return <AppShell active="Prompts IA">
  <section className="premium-hero"><span className="eyebrow">Motor pedagógico inteligente</span><h1>Prompts IA + contexto educativo YOYO</h1><p>Busca ideas externas y conviértelas en recursos contextualizados por nivel, asignatura, OA/habilidad, Bloom, DUA/PIE, complejidad y formato. Prompts.chat aporta inspiración; YOYO IA conserva el control pedagógico.</p></section>

  <section className="premium-card" style={{marginBottom:20}}>
   <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'start',flexWrap:'wrap',marginBottom:16}}><div><span className="eyebrow">1 · Configuración pedagógica</span><h2 style={{margin:'4px 0'}}>Define cómo debe transformarse la idea</h2><p style={{margin:0}}>No necesitas conocer un código OA exacto: puedes escribir la habilidad u objetivo y YOYO IA evitará inventar numeración oficial.</p></div><Brain size={28}/></div>
   <div style={{display:'flex',gap:8,flexWrap:'wrap',marginBottom:16}}>{presets.map(preset=><button key={preset.label} type="button" className="btn btn-soft" onClick={preset.apply} title={preset.description}><Sparkles size={15}/>{preset.label}</button>)}</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:12}}>
    <label><span><GraduationCap size={15}/> Nivel</span><select value={level} onChange={event=>setLevel(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{levels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Asignatura</span><select value={subject} onChange={event=>setSubject(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{subjects.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span><Brain size={15}/> Bloom</span><select value={bloom} onChange={event=>setBloom(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{bloomLevels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Complejidad</span><select value={complexity} onChange={event=>setComplexity(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{complexityLevels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Apoyo DUA / PIE</span><select value={adaptation} onChange={event=>setAdaptation(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{supportProfiles.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Tipo de recurso</span><select value={resourceType} onChange={event=>setResourceType(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{resourceLabels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span><Gamepad2 size={15}/> Formato</span><select value={deliveryMode} onChange={event=>setDeliveryMode(event.target.value as DeliveryMode)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{deliveryModes.map(item=><option key={item}>{item}</option>)}</select></label>
   </div>
   <label style={{display:'block',marginTop:14}}><span><Target size={15}/> OA, habilidad o aprendizaje esperado</span><textarea value={oa} onChange={event=>setOa(event.target.value)} rows={3} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12,resize:'vertical'}} placeholder="Ej.: Resolver problemas de multiplicación usando estrategias y explicar el procedimiento. También puedes pegar un OA oficial verificado."/></label>
   <div style={{marginTop:14,padding:12,borderRadius:12,background:'rgba(255,255,255,.04)'}}><small>Contexto que acompañará al prompt</small><div style={{fontWeight:700,marginTop:4}}>{pedagogicalSummary}</div></div>
  </section>

  <section className="premium-card" style={{marginBottom:20}}>
   <form onSubmit={search} className="prompt-search-form" style={{display:'grid',gridTemplateColumns:'minmax(260px,1fr) 220px auto',gap:12,alignItems:'end'}}>
    <label><span>2 · Tema o necesidad pedagógica</span><div className="approved-search" style={{width:'100%',marginTop:6}}><Search size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} style={{border:0,outline:'none',background:'transparent',width:'100%',color:'inherit'}} placeholder="Ej.: fracciones, comprensión inferencial, convivencia escolar..."/></div></label>
    <label><span><Filter size={15}/> Tipo de prompt</span><select value={type} onChange={event=>setType(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{promptTypes.map(item=><option key={item||'all'} value={item}>{item?typeLabels[item]:'Todos'}</option>)}</select></label>
    <button className="btn btn-primary" type="submit" disabled={loading}><Sparkles size={17}/>{loading?'Buscando...':'Buscar ideas'}</button>
   </form>
   <p className="save-status" role="status" aria-live="polite">{status}</p>
  </section>

  <section className="premium-card">
   <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',marginBottom:16,flexWrap:'wrap'}}><div><span className="eyebrow">3 · Selección y transformación</span><h2 style={{margin:'4px 0'}}>Biblioteca externa, criterio pedagógico interno</h2><p style={{margin:0}}>Al pulsar “Transformar con YOYO IA”, la idea se convierte en un borrador con tu configuración y queda lista para generar.</p></div><span>{selectedCount} visibles</span></div>
   {items.length===0?<div className="command-empty"><BookOpen/><strong>Aún no hay resultados</strong><span>Realiza una búsqueda y selecciona una idea para transformarla según tu curso y objetivo.</span></div>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:16}}>{items.map(prompt=><article key={prompt.id} className="premium-card" style={{margin:0}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}><div><small>{typeLabels[prompt.type]||prompt.type} · {prompt.category}</small><h3 style={{margin:'6px 0'}}>{prompt.title}</h3></div><span>▲ {prompt.votes}</span></div>
    {prompt.description&&<p>{prompt.description}</p>}
    <div style={{maxHeight:180,overflow:'auto',whiteSpace:'pre-wrap',fontSize:14,lineHeight:1.45,padding:12,borderRadius:12,background:'rgba(255,255,255,.04)'}}>{prompt.content}</div>
    {prompt.tags.length>0&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{prompt.tags.map(tag=><small key={tag}>#{tag}</small>)}</div>}
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button className="btn btn-primary" onClick={()=>usePrompt(prompt)}><WandSparkles size={16}/>Transformar con YOYO IA</button><button className="btn btn-soft" onClick={()=>copyPrompt(prompt.content)}><Copy size={16}/>Copiar</button><a className="btn btn-soft" href="https://prompts.chat" target="_blank" rel="noreferrer"><ExternalLink size={16}/>Fuente</a></div>
    <small style={{display:'block',marginTop:10}}>Autor: {prompt.author}</small>
   </article>)}</div>}
  </section>
 </AppShell>
}
