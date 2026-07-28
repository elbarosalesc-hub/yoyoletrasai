'use client'

import {useMemo,useState} from 'react'
import {useParams} from 'next/navigation'
import {AppShell} from '@/components/AppShell'
import {getPremiumActivity,premiumActivities} from '@/lib/premiumActivities'
import {BookOpen,Eye,Headphones,ImageIcon,Lightbulb,Mic,PenLine,Save,Send,ShieldCheck,Sparkles,Star,Users} from 'lucide-react'

const choiceArt=['🔑','🗺️','🧰','🎵']
const choiceTone=['violet','green','orange','blue']

export default function Recurso(){
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
  <section className="approved-activity-hero"><div className="approved-hero-copy"><span>Misión lectora</span><h1>{activity.content.title||'El Bosque Mágico'}</h1><p>Lee con atención, descubre pistas y elige la mejor respuesta.</p><div><Star size={16}/> Tu racha de hoy <b>🔥 3 días</b></div></div><div className="approved-hero-scene" aria-hidden="true"><span className="approved-glow-book">📖</span><span className="approved-hero-girl">👧🏻</span><span className="approved-hero-owl">🦉</span></div></section>
  <section className="approved-stepper"><div><Headphones/><b>1</b><span><strong>Escucha</strong><small>El texto</small></span></div><div className="active"><Eye/><b>2</b><span><strong>Observa</strong><small>Con atención</small></span></div><div><PenLine/><b>3</b><span><strong>Responde</strong><small>Y demuestra</small></span></div></section>
  <section className="approved-question-card"><div className="approved-question-head"><div><BookOpen/><span><small>Lee con atención</small><h2>¿Qué encontró Luma escondido entre las raíces del árbol antiguo?</h2></span></div><b>Pregunta 2/4</b></div>
   <div className="approved-options">{options.map((option,index)=><button key={`${option}-${index}`} className={`${choiceTone[index]} ${selected===index?'selected':''}`} onClick={()=>setSelected(index)}><span>{String.fromCharCode(65+index)}</span><strong>{option}</strong><em>{choiceArt[index]}</em></button>)}</div>
   <p className="approved-motivation"><Star/> Piensa bien, la respuesta está en el texto. <Sparkles/></p>
   {hint&&<div className="approved-hint">Pista: busca en el texto una palabra relacionada con caminos, rutas o direcciones.</div>}
   <div className="approved-support-tools"><h3><Star/> Herramientas de apoyo</h3><div><button className={listening?'active':''} onClick={()=>setListening(!listening)}><Headphones/><span><b>Escuchar</b><small>{listening?'Reproduciendo…':'Texto'}</small></span></button><button onClick={()=>setHint(!hint)}><Lightbulb/><span><b>Pista</b><small>Dame una pista</small></span></button><button><ImageIcon/><span><b>Pictogramas</b><small>Ver apoyo visual</small></span></button><button className={recording?'active':''} onClick={()=>setRecording(!recording)}><Mic/><span><b>Respuesta oral</b><small>{recording?'Grabando…':'Grabar respuesta'}</small></span></button></div></div>
   <label className="approved-answer"><span><Users/> Tu respuesta</span><div><textarea value={answer} onChange={event=>setAnswer(event.target.value)} placeholder="Escribe tu respuesta aquí… o utiliza el micrófono para responder"/><button type="button" onClick={()=>setRecording(!recording)} aria-label="Grabar respuesta"><Mic/></button></div></label>
  </section>
  <section className="approved-inclusive"><div className="approved-inclusive-head"><h2><ShieldCheck/> Apoyos para todos los estudiantes</h2><button>Ver más ›</button></div><div><article><Sparkles/><h3>DUA</h3><p>Múltiples formas de representación y expresión.</p></article><article><Users/><h3>TEA</h3><p>Estructura clara, apoyos visuales y anticipación.</p></article><article><BookOpen/><h3>Lectura guiada</h3><p>Apoyo en vocabulario, comprensión y secuencias.</p></article><article><ShieldCheck/><h3>Acompañamiento</h3><p>Sugerencias para familias y docentes.</p></article></div></section>
  <footer className="approved-actions"><button className={saved?'done':''} onClick={save}><Save/><span><b>{saved?'Guardado':'Guardar'}</b><small>Guardar progreso</small></span></button><button className={assigned?'done primary':''} onClick={()=>setAssigned(true)}><Send/><span><b>{assigned?'Asignado':'Asignar al curso'}</b><small>Enviar a mis estudiantes</small></span></button></footer>
 </div></AppShell>
}