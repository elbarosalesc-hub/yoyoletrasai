'use client'

import {useState} from 'react'
import {ArrowUpRight,Backpack,BookOpen,Bot,CheckCircle2,ChevronRight,Compass,Heart,Map,Play,Search,Sparkles,Volume2,VolumeX} from 'lucide-react'
import {ImmersivePreview3D} from './ImmersivePreview3D'

const answers=['Que probablemente hay alguien dentro','Que el bosque está vacío','Que ya amaneció']
const tools=[{label:'Explorar',icon:Compass},{label:'Pistas',icon:Search},{label:'Diario',icon:BookOpen},{label:'Mapa',icon:Map},{label:'Mochila',icon:Backpack}]

export function DashboardImmersiveHero(){
 const[selected,setSelected]=useState<number|null>(null)
 const[audio,setAudio]=useState(true)
 const[tool,setTool]=useState(0)
 const correct=0
 return <article className="ylr-world">
  <div className="ylr-world-scene"><ImmersivePreview3D/></div>
  <div className="ylr-world-vignette"/>
  <div className="ylr-world-glow"/>

  <header className="ylr-world-topbar">
   <div className="ylr-brand-pill"><span><Sparkles/></span><div><small>MUNDO ACTIVO</small><strong>Bosque de las inferencias</strong></div></div>
   <div className="ylr-status-strip"><span><Heart fill="currentColor"/>5</span><span>⭐ 640 XP</span><span>🪙 280</span><span>Nivel 3</span></div>
   <div className="ylr-world-actions"><button onClick={()=>setAudio(v=>!v)}>{audio?<Volume2/>:<VolumeX/>}</button><a href="/juegos"><ArrowUpRight/>Entrar al mundo</a></div>
  </header>

  <section className="ylr-luma-panel">
   <div className="ylr-luma-avatar">👧</div>
   <div><small>EXPLORADORA</small><h2>Luma</h2><p>Observa la cabaña y encuentra una pista visual.</p><div className="ylr-mini-progress"><i style={{width:'66%'}}/></div></div>
  </section>

  <section className="ylr-mission-hud">
   <div className="ylr-mission-label"><span>MISIÓN PRINCIPAL</span><strong>2 / 3</strong></div>
   <h2>La ventana iluminada</h2>
   <p>¿Qué permite inferir la ventana encendida?</p>
   <div className="ylr-hud-answers">{answers.map((text,index)=><button key={text} className={selected===index?(index===correct?'correct':'incorrect'):selected!==null&&index===correct?'correct':''} onClick={()=>setSelected(index)} disabled={selected!==null}><b>{String.fromCharCode(65+index)}</b><span>{text}</span>{selected!==null&&index===correct&&<CheckCircle2/>}</button>)}</div>
   {selected!==null&&<div className="ylr-hud-feedback"><Sparkles/><span>{selected===correct?'¡Muy bien! La luz indica actividad dentro de la cabaña.':'Observa nuevamente la luz de la ventana.'}</span></div>}
   <div className="ylr-hud-footer"><button onClick={()=>setSelected(null)}>Intentar de nuevo</button><button className="primary"><Play/>Comenzar misión</button></div>
  </section>

  <button className="ylr-yoyo-float"><span><Bot/></span><div><small>YOYO</small><strong>¿Necesitas una pista?</strong></div><ChevronRight/></button>

  <nav className="ylr-game-dock">{tools.map(({label,icon:Icon},index)=><button key={label} className={tool===index?'active':''} onClick={()=>setTool(index)}><Icon/><span>{label}</span></button>)}</nav>
 </article>
}