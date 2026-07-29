'use client'

import {useState} from 'react'
import {
  Backpack,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Heart,
  Map,
  Mic2,
  Play,
  Search,
  Sparkles,
  Volume2
} from 'lucide-react'
import {ImmersivePreview3D} from './ImmersivePreview3D'

const tools=[
  {label:'Pista',icon:Search},
  {label:'Diario',icon:BookOpen},
  {label:'Mapa',icon:Map},
  {label:'Mochila',icon:Backpack}
]

export function DashboardImmersiveHero(){
  const[activeTool,setActiveTool]=useState('Pista')
  const[narrating,setNarrating]=useState(false)
  const[message,setMessage]=useState('Encuentra dos pistas visuales y explica qué puedes inferir.')

  function narrate(){
    if(typeof window==='undefined'||!('speechSynthesis' in window))return
    window.speechSynthesis.cancel()
    const utterance=new SpeechSynthesisUtterance('Hola, profesora Elba. Soy YOYO. En esta misión Luma debe encontrar dos pistas visuales y explicar qué puede inferir. Observa el bosque, la luz de la cabaña y los objetos del camino.')
    utterance.lang='es-CL'
    utterance.rate=.92
    utterance.pitch=1.04
    utterance.onstart=()=>setNarrating(true)
    utterance.onend=()=>setNarrating(false)
    utterance.onerror=()=>setNarrating(false)
    window.speechSynthesis.speak(utterance)
  }

  function selectTool(label:string){
    setActiveTool(label)
    const messages:Record<string,string>={
      Pista:'Pista activa: observa la luz encendida de la cabaña y las huellas del sendero.',
      Diario:'Diario abierto: registra la evidencia antes de responder.',
      Mapa:'Mapa activo: la siguiente pista está cerca del puente y la cabaña.',
      Mochila:'Mochila abierta: linterna, lupa, tarjeta visual y audio de apoyo.'
    }
    setMessage(messages[label])
  }

  return <article className="immersive-dashboard-pro">
    <div className="immersive-dashboard-stage">
      <ImmersivePreview3D/>
      <div className="immersive-dashboard-vignette"/>

      <div className="immersive-dashboard-copy">
        <span className="immersive-dashboard-live"><i/> EXPERIENCIA 3D EN VIVO</span>
        <h2>Bosque de las inferencias</h2>
        <p>Explora, escucha, descubre pistas y justifica una inferencia con apoyo de YOYO.</p>
        <div className="immersive-dashboard-tags"><span>Lenguaje</span><span>3.º básico</span><span>5 misiones</span></div>
      </div>

      <button className={`immersive-narration-button ${narrating?'active':''}`} onClick={narrate}>
        {narrating?<Volume2/>:<Mic2/>}<span>{narrating?'Narrando...':'Narración'}</span>
      </button>

      <div className="immersive-yoyo-bubble">
        <span className="immersive-yoyo-avatar"><Bot/></span>
        <div><strong>YOYO, profesor virtual</strong><p>{message}</p><button onClick={narrate}><Volume2/>Escuchar explicación</button></div>
      </div>

      <div className="immersive-player-hud">
        <span className="immersive-player-avatar">👧🏽</span>
        <div><strong>Luma</strong><span className="immersive-hearts"><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart/></span><small>Nivel 3 · 640 / 1000 XP</small><i><b style={{width:'64%'}}/></i></div>
      </div>

      <div className="immersive-tool-dock">
        {tools.map(({label,icon:Icon})=><button key={label} className={activeTool===label?'active':''} onClick={()=>selectTool(label)}><span><Icon/></span><small>{label}</small></button>)}
      </div>

      <div className="immersive-current-mission">
        <div><span>MISIÓN ACTUAL</span><strong>Encuentra 2 pistas visuales</strong><small>1 / 2 pistas encontradas</small></div>
        <span className="mission-orb"><Sparkles/></span>
        <i><b style={{width:'50%'}}/></i>
      </div>
    </div>

    <footer className="immersive-dashboard-footer">
      <div className="immersive-world-progress"><span><CheckCircle2/></span><div><small>PROGRESO DEL MUNDO</small><strong>3 de 5 misiones completadas</strong><i><b style={{width:'60%'}}/></i></div><em>60%</em></div>
      <div className="immersive-dashboard-actions"><a href="/juegos"><Play fill="currentColor"/>Entrar al mundo 3D</a><a href="/estudio-inmersivo">Editar experiencia<ChevronRight/></a></div>
    </footer>
  </article>
}
