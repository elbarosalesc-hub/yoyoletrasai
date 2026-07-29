'use client'

import {useMemo,useState} from 'react'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Bot,
  Check,
  CheckCircle2,
  ClipboardList,
  FileText,
  GraduationCap,
  Lightbulb,
  MessageSquareText,
  Paperclip,
  RefreshCw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Undo2,
  Users,
  WandSparkles
} from 'lucide-react'
import {ModuleShell,ModuleStat} from '@/components/v2/ModuleShell'

type Message={role:'assistant'|'user';text:string;time:string}

const starterMessages:Message[]=[
 {role:'assistant',time:'13:18',text:'Hola, Elba. Revisé el progreso de 3.º básico y detecté que el grupo necesita reforzar la justificación de inferencias. Puedo preparar una secuencia completa con actividad principal, apoyo visual, versión adaptada y ticket de salida.'}
]

const quickPrompts=[
 {label:'Crear recurso',description:'Guía, evaluación o rúbrica',icon:BookOpen,prompt:'Crea una guía breve de comprensión lectora para 3.º básico con apoyos visuales.'},
 {label:'Adaptar para PIE',description:'DUA y necesidades específicas',icon:Users,prompt:'Adapta la actividad para estudiantes con discapacidad intelectual y TDAH.'},
 {label:'Analizar resultados',description:'Detecta avances y barreras',icon:BarChart3,prompt:'Analiza el progreso del curso y sugiere el siguiente foco pedagógico.'},
 {label:'Preparar evaluación',description:'Diversificada y editable',icon:ClipboardList,prompt:'Prepara una evaluación diversificada con rúbrica de corrección.'}
]

const workflow=[
 'Analizar objetivo de aprendizaje y evidencia disponible',
 'Seleccionar recursos pertinentes de la biblioteca',
 'Crear actividad principal y secuencia de apoyo',
 'Generar versiones adaptadas según perfiles PIE',
 'Preparar pauta, criterios y ticket de salida',
 'Vincular la propuesta al curso y seguimiento'
]

export default function YoyoAssistant(){
 const[text,setText]=useState('')
 const[messages,setMessages]=useState<Message[]>(starterMessages)
 const[approved,setApproved]=useState(false)
 const[thinking,setThinking]=useState(false)
 const[context,setContext]=useState('3.º básico · Lenguaje')

 const completed=useMemo(()=>approved?workflow.length:2,[approved])

 function send(){
  const prompt=text.trim()
  if(!prompt||thinking)return
  setMessages(current=>[...current,{role:'user',text:prompt,time:new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}])
  setText('')
  setThinking(true)
  window.setTimeout(()=>{
   setMessages(current=>[...current,{role:'assistant',time:new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'}),text:'Preparé una propuesta contextualizada para el curso: sesión de 35 minutos, modelado inicial, actividad por niveles, dos versiones accesibles, pauta de observación y evidencia de cierre. El flujo aparece a la derecha para que puedas revisarlo antes de aprobar.'}])
   setThinking(false)
  },650)
 }

 function reset(){setMessages(starterMessages);setApproved(false);setText('')}

 return <ModuleShell active="YOYO">
  <section className="yoyo-hero">
   <div className="yoyo-hero-copy">
    <span className="module-eyebrow"><Sparkles size={15}/> Copiloto pedagógico con IA</span>
    <h1>Planifica, adapta y analiza con <span>YOYO</span></h1>
    <p>Un asistente con contexto del curso, control docente y herramientas diseñadas para educación inclusiva.</p>
    <div className="yoyo-context-selector"><span><GraduationCap size={18}/></span><label>Contexto activo<select value={context} onChange={event=>setContext(event.target.value)}><option>3.º básico · Lenguaje</option><option>3.º básico · Matemática</option><option>5.º básico · Lenguaje</option><option>5.º básico · Ciencias</option></select></label><CheckCircle2 size={19}/></div>
   </div>
   <div className="yoyo-hero-orb" aria-hidden="true"><div className="yoyo-ring ring-one"/><div className="yoyo-ring ring-two"/><span className="yoyo-bot-core"><Bot/></span><div className="yoyo-float float-a"><Lightbulb/><strong>Ideas</strong></div><div className="yoyo-float float-b"><ShieldCheck/><strong>Control</strong></div><div className="yoyo-float float-c"><WandSparkles/><strong>Creación</strong></div></div>
  </section>

  <section className="module-stats-grid">
   <ModuleStat icon={MessageSquareText} value="12" label="conversaciones este mes" tone="violet"/>
   <ModuleStat icon={FileText} value="8" label="recursos generados" tone="mint"/>
   <ModuleStat icon={Users} value="5" label="adaptaciones PIE" tone="blue"/>
   <ModuleStat icon={Target} value="92%" label="acciones revisadas" tone="amber"/>
  </section>

  <section className="yoyo-workspace">
   <div className="yoyo-chat-card">
    <header className="yoyo-chat-header"><div><span className="yoyo-mini-avatar"><Bot/></span><div><strong>YOYO Asistente</strong><small><i/> En línea · contexto seguro</small></div></div><button onClick={reset}><RefreshCw size={17}/>Nueva conversación</button></header>
    <div className="yoyo-quick-grid">{quickPrompts.map(({label,description,icon:Icon,prompt})=><button key={label} onClick={()=>setText(prompt)}><span><Icon/></span><div><strong>{label}</strong><small>{description}</small></div><ArrowRight/></button>)}</div>
    <div className="yoyo-messages" aria-live="polite">
     {messages.map((message,index)=><article className={`yoyo-message ${message.role}`} key={`${message.time}-${index}`}>{message.role==='assistant'&&<span className="message-avatar"><Bot/></span>}<div><p>{message.text}</p><time>{message.time}</time></div></article>)}
     {thinking&&<article className="yoyo-message assistant"><span className="message-avatar"><Bot/></span><div className="typing"><i/><i/><i/></div></article>}
    </div>
    <div className="yoyo-composer"><button aria-label="Adjuntar archivo"><Paperclip/></button><textarea value={text} onChange={event=>setText(event.target.value)} onKeyDown={event=>{if(event.key==='Enter'&&!event.shiftKey){event.preventDefault();send()}}} placeholder="Pide una planificación, adaptación, análisis o recurso..." rows={2}/><button className="send-button" onClick={send} disabled={!text.trim()||thinking}><Send/></button></div>
    <div className="composer-note"><ShieldCheck size={14}/>YOYO no ejecutará cambios sin tu aprobación.</div>
   </div>

   <aside className="yoyo-side-column">
    <article className="workflow-card">
     <div className="workflow-heading"><div><span>FLUJO PREPARADO</span><h2>Paquete de refuerzo OA 4</h2></div><span className="workflow-score">{completed}/{workflow.length}</span></div>
     <div className="workflow-progress"><i style={{width:`${completed/workflow.length*100}%`}}/></div>
     <div className="workflow-list">{workflow.map((item,index)=><div className={index<completed?'done':''} key={item}><span>{index<completed?<Check/>:index+1}</span><div><strong>{item}</strong><small>{index<completed?'Completado':'Pendiente de aprobación'}</small></div></div>)}</div>
     <button className={`approve-workflow ${approved?'approved':''}`} onClick={()=>setApproved(true)}>{approved?<><CheckCircle2/>Acciones aprobadas</>:<><ShieldCheck/>Revisar y aprobar</>}</button>
     {approved&&<button className="undo-workflow" onClick={()=>setApproved(false)}><Undo2/>Deshacer aprobación</button>}
    </article>

    <article className="yoyo-insight-card"><span><Sparkles/></span><div><small>INSIGHT PEDAGÓGICO</small><h3>Próximo paso recomendado</h3><p>Trabajar inferencias sencillas mediante pistas visuales y preguntas graduadas antes de avanzar a textos extensos.</p><button>Crear actividad sugerida<ArrowRight/></button></div></article>
   </aside>
  </section>
 </ModuleShell>
}
