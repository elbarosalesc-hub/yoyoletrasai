'use client'

import {useMemo,useState} from 'react'
import {useParams} from 'next/navigation'
import {AppShell} from '@/components/AppShell'
import {getPremiumActivity,premiumActivities} from '@/lib/resourceCatalog'
import {grafomotricidadPremium,type PremiumResourceTab} from '@/lib/premiumResourceProfiles'
import {BookOpen,CheckCircle2,ClipboardCheck,Download,Eye,Headphones,HeartHandshake,ImageIcon,Leaf,Lightbulb,Mic,PenLine,Printer,Save,Send,ShieldCheck,Sparkles,Star,Target,Users} from 'lucide-react'

const choiceArt=['🔑','🗺️','🧰','🎵']
const choiceTone=['violet','green','orange','blue']

function GrafomotricidadPremium(){
 const[tab,setTab]=useState<PremiumResourceTab>('actividad')
 const[selectedLevel,setSelectedLevel]=useState(1)
 const[saved,setSaved]=useState(false)
 const[assigned,setAssigned]=useState(false)
 const[spoken,setSpoken]=useState(false)
 const speak=()=>{
  if(typeof window==='undefined'||!('speechSynthesis'in window))return
  window.speechSynthesis.cancel()
  const message=new SpeechSynthesisUtterance('Ayuda al pudú a llegar al bosque. Comienza en el punto verde y sigue el camino lentamente, sin salir de los bordes.')
  message.lang='es-CL';message.rate=.82
  window.speechSynthesis.speak(message);setSpoken(true)
 }
 const save=()=>{
  setSaved(true)
  localStorage.setItem('yoyo-evidence-trazos-animales',JSON.stringify({level:selectedLevel,tab,updatedAt:new Date().toISOString()}))
 }
 return <AppShell active="Biblioteca"><div className="approved-activity-page">
  <header className="approved-activity-status"><div><span>🦌</span><b>Aventuras de grafomotricidad</b></div><div><Star size={16}/><b>Recurso premium</b><span className="approved-mini-progress"><i style={{width:'100%'}}/></span><strong>8 láminas</strong></div></header>

  <section className="approved-activity-hero"><div className="approved-hero-copy"><span>Currículum chileno · experiencia contextualizada</span><h1>{grafomotricidadPremium.title}</h1><p>{grafomotricidadPremium.subtitle}</p><div><Leaf size={16}/> Bosque nativo <b>Kínder–1.º básico</b></div></div><div className="approved-hero-scene contextual" aria-hidden="true"><span className="approved-glow-book">🌺</span><span className="approved-hero-girl">🧒🏻</span><span className="approved-hero-owl">🦌</span></div></section>

  <section className="premium-context-panel">
   <header><div><span className="eyebrow">Diseño pedagógico integral</span><h2>Una actividad conectada con la vida real del estudiante</h2><p>{grafomotricidadPremium.question}</p></div><span className="premium-quality-badge"><Sparkles size={15}/> Premium contextual</span></header>
   <div className="premium-context-grid">{grafomotricidadPremium.contexts.map(item=><article className="premium-context-card" key={item.label}><span>{item.label}</span><strong>{item.title}</strong><p>{item.detail}</p></article>)}</div>
   <div className="premium-family-note"><span>🎯</span><div><strong>Vinculación curricular</strong><p>{grafomotricidadPremium.curricularLink}. {grafomotricidadPremium.objective}</p></div></div>
  </section>

  <section className="approved-stepper"><div><Headphones/><b>1</b><span><strong>Prepara</strong><small>Cuerpo y atención</small></span></div><div className="active"><Eye/><b>2</b><span><strong>Recorre</strong><small>Con apoyo gradual</small></span></div><div><PenLine/><b>3</b><span><strong>Reflexiona</strong><small>Sobre tu estrategia</small></span></div></section>

  <nav className="premium-resource-tabs" aria-label="Secciones del recurso">
   <button className={tab==='actividad'?'active':''} onClick={()=>setTab('actividad')}>Actividad y láminas</button>
   <button className={tab==='guia'?'active':''} onClick={()=>setTab('guia')}>Guía docente</button>
   <button className={tab==='diversificacion'?'active':''} onClick={()=>setTab('diversificacion')}>Diversificación DUA</button>
   <button className={tab==='evaluacion'?'active':''} onClick={()=>setTab('evaluacion')}>Evaluación formativa</button>
  </nav>

  {tab==='actividad'&&<section className="premium-tab-panel"><div className="approved-question-head"><div><Target/><span><small>Paquete del estudiante</small><h2>Ocho experiencias progresivas, imprimibles y aplicables en pantalla</h2></span></div><b>20–25 min</b></div><div className="premium-pages-grid">{grafomotricidadPremium.pages.map(page=><article className="premium-page-card" key={page.title}><span>{page.icon}</span><small>{page.stage}</small><h4>{page.title}</h4><p>{page.detail}</p><em>{page.evidence}</em></article>)}</div><div className="premium-low-cost">{grafomotricidadPremium.materials.map(item=><span key={item}>{item}</span>)}</div><div className="cp-actions"><button className="btn btn-primary" onClick={()=>window.print()}><Printer size={16}/>Imprimir recurso</button><button className={`btn btn-soft ${spoken?'active':''}`} onClick={speak}><Headphones size={16}/>{spoken?'Instrucción reproducida':'Escuchar instrucción'}</button><button className="btn btn-soft" onClick={()=>window.print()}><Download size={16}/>Preparar PDF</button></div></section>}

  {tab==='guia'&&<section className="premium-tab-panel"><div className="approved-question-head"><div><BookOpen/><span><small>Mediación pedagógica</small><h2>Secuencia breve, explícita y emocionalmente segura</h2></span></div><b>Inicio · desarrollo · cierre</b></div><div className="premium-guide-columns">{grafomotricidadPremium.guide.map(section=><article key={section.title}><h4>{section.title}</h4><ul>{section.items.map(item=><li key={item}>{item}</li>)}</ul></article>)}</div><div className="premium-family-note"><span>🏠</span><div><strong>Extensión para la familia</strong><p>{grafomotricidadPremium.family}</p></div></div></section>}

  {tab==='diversificacion'&&<section className="premium-tab-panel"><div className="approved-question-head"><div><ShieldCheck/><span><small>Enseñanza diversificada</small><h2>El objetivo se mantiene; cambian los caminos para alcanzarlo</h2></span></div><b>DUA + PIE</b></div><div className="premium-version-grid">{grafomotricidadPremium.versions.map((version,index)=><article className="premium-version-card" key={version.title}><h4>{version.title}</h4><p>{version.description}</p><ul>{version.items.map(item=><li key={item}>{item}</li>)}</ul><button className={`btn btn-soft ${selectedLevel===index?'active':''}`} onClick={()=>setSelectedLevel(index)}>{selectedLevel===index?'Versión seleccionada':'Seleccionar versión'}</button></article>)}</div><div className="premium-dua-grid">{grafomotricidadPremium.dua.map(item=><article className="premium-dua-card" key={item.title}><strong>{item.title}</strong><ul>{item.items.map(detail=><li key={detail}>{detail}</li>)}</ul></article>)}</div></section>}

  {tab==='evaluacion'&&<section className="premium-tab-panel"><div className="approved-question-head"><div><ClipboardCheck/><span><small>Evaluación para aprender</small><h2>Observación positiva del proceso, autonomía y apoyos efectivos</h2></span></div><b>Sin comparación entre estudiantes</b></div><div className="premium-assessment-grid"><article className="premium-assessment-card"><h3>Indicadores observables</h3><ul>{grafomotricidadPremium.assessment.indicators.map(item=><li key={item}><CheckCircle2 size={15}/> {item}</li>)}</ul><h3>Niveles de avance</h3><div className="premium-low-cost">{grafomotricidadPremium.assessment.levels.map(item=><span key={item}>{item}</span>)}</div></article><article className="premium-assessment-card"><h3>Retroalimentación sugerida</h3><ul>{grafomotricidadPremium.assessment.feedback.map(item=><li key={item}>{item}</li>)}</ul><div className="premium-family-note"><span>💛</span><div><strong>Criterio emocional</strong><p>Se reconoce el esfuerzo, la estrategia utilizada y la capacidad de pedir apoyo.</p></div></div></article></div></section>}

  <section className="approved-inclusive"><div className="approved-inclusive-head"><h2><HeartHandshake/> Apoyos disponibles sin etiquetar al estudiante</h2><button onClick={()=>setTab('diversificacion')}>Ver diversificación ›</button></div><div><article><Sparkles/><h3>Participación</h3><p>Elección de recorrido, herramienta y nivel de desafío.</p></article><article><Users/><h3>Acompañamiento</h3><p>Trabajo individual, en pareja o con mediación del adulto.</p></article><article><Eye/><h3>Acceso visual</h3><p>Contraste, tamaño ampliado y menor cantidad de estímulos.</p></article><article><ShieldCheck/><h3>Bienestar</h3><p>Pausas, ritmo flexible y autoevaluación emocional.</p></article></div></section>

  <footer className="approved-actions"><button className={saved?'done':''} onClick={save}><Save/><span><b>{saved?'Guardado':'Guardar recurso'}</b><small>Conservar versión y progreso</small></span></button><button className={assigned?'done primary':''} onClick={()=>setAssigned(true)}><Send/><span><b>{assigned?'Asignado':'Asignar al curso'}</b><small>Enviar con nivel seleccionado</small></span></button></footer>
 </div></AppShell>
}

function GenericResource(){
 const params=useParams();const slug=String(params.slug)
 const activity=getPremiumActivity(slug)||premiumActivities[0]
 const options=useMemo(()=>{const source=activity.content.items||[];return source.length>=4?source.slice(0,4):['Una llave brillante','Un mapa secreto','Un cofre cerrado','Una piedra que canta']},[activity])
 const[selected,setSelected]=useState<number|null>(null)
 const[hint,setHint]=useState(false)
 const[listening,setListening]=useState(false)
 const[recording,setRecording]=useState(false)
 const[answer,setAnswer]=useState('')
 const[saved,setSaved]=useState(false)
 const[assigned,setAssigned]=useState(false)
 const save=()=>{setSaved(true);localStorage.setItem(`yoyo-evidence-${activity.slug}`,JSON.stringify({selected,answer,updatedAt:new Date().toISOString()}))}
 return <AppShell active="Biblioteca"><div className="approved-activity-page">
  <header className="approved-activity-status"><div><span>🌳</span><b>{activity.title}</b></div><div><Star size={16}/><b>120 pts</b><span className="approved-mini-progress"><i/></span><strong>2 / 4</strong></div></header>
  <section className="approved-activity-hero"><div className="approved-hero-copy"><span>{activity.subject}</span><h1>{activity.content.title||activity.title}</h1><p>{activity.goal}</p><div><Star size={16}/> Recurso adaptable <b>{activity.level}</b></div></div><div className="approved-hero-scene" aria-hidden="true"><span className="approved-glow-book">📖</span><span className="approved-hero-girl">👧🏻</span><span className="approved-hero-owl">🦉</span></div></section>
  <section className="approved-stepper"><div><Headphones/><b>1</b><span><strong>Comprende</strong><small>La instrucción</small></span></div><div className="active"><Eye/><b>2</b><span><strong>Explora</strong><small>El contenido</small></span></div><div><PenLine/><b>3</b><span><strong>Responde</strong><small>Y demuestra</small></span></div></section>
  <section className="approved-question-card"><div className="approved-question-head"><div><BookOpen/><span><small>{activity.oa} · {activity.duration}</small><h2>{activity.content.body}</h2></span></div><b>{activity.format}</b></div>
   <div className="approved-options">{options.map((option,index)=><button key={`${option}-${index}`} className={`${choiceTone[index]} ${selected===index?'selected':''}`} onClick={()=>setSelected(index)}><span>{String.fromCharCode(65+index)}</span><strong>{option}</strong><em>{choiceArt[index]}</em></button>)}</div>
   <p className="approved-motivation"><Star/> Piensa, prueba una estrategia y explica tu respuesta. <Sparkles/></p>
   {hint&&<div className="approved-hint">Pista: revisa el ejemplo, identifica las palabras clave y resuelve un paso a la vez.</div>}
   <div className="approved-support-tools"><h3><Star/> Herramientas de apoyo</h3><div><button className={listening?'active':''} onClick={()=>setListening(!listening)}><Headphones/><span><b>Escuchar</b><small>{listening?'Reproduciendo…':'Contenido'}</small></span></button><button onClick={()=>setHint(!hint)}><Lightbulb/><span><b>Pista</b><small>Dame una pista</small></span></button><button><ImageIcon/><span><b>Apoyo visual</b><small>Ver apoyos</small></span></button><button className={recording?'active':''} onClick={()=>setRecording(!recording)}><Mic/><span><b>Respuesta oral</b><small>{recording?'Grabando…':'Grabar respuesta'}</small></span></button></div></div>
   <label className="approved-answer"><span><Users/> Tu respuesta</span><div><textarea value={answer} onChange={event=>setAnswer(event.target.value)} placeholder="Escribe tu respuesta aquí… o utiliza el micrófono para responder"/><button type="button" onClick={()=>setRecording(!recording)} aria-label="Grabar respuesta"><Mic/></button></div></label>
  </section>
  <section className="approved-inclusive"><div className="approved-inclusive-head"><h2><ShieldCheck/> Apoyos incluidos en este recurso</h2><button>Ver más ›</button></div><div>{activity.supports.slice(0,4).map((support,index)=><article key={support}>{index===0?<Sparkles/>:index===1?<Users/>:index===2?<BookOpen/>:<ShieldCheck/>}<h3>{support}</h3><p>Disponible para ajustar acceso, participación o forma de respuesta.</p></article>)}</div></section>
  <footer className="approved-actions"><button className={saved?'done':''} onClick={save}><Save/><span><b>{saved?'Guardado':'Guardar'}</b><small>Guardar progreso</small></span></button><button className={assigned?'done primary':''} onClick={()=>setAssigned(true)}><Send/><span><b>{assigned?'Asignado':'Asignar al curso'}</b><small>Enviar a mis estudiantes</small></span></button></footer>
 </div></AppShell>
}

export default function Recurso(){
 const params=useParams();const slug=String(params.slug)
 return slug==='trazos-animales'?<GrafomotricidadPremium/>:<GenericResource/>
}
