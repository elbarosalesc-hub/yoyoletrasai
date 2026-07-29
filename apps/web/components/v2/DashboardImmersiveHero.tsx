'use client'

import {useState} from 'react'
import {
  Backpack,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Gamepad2,
  Headphones,
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
  const[message,setMessage]=useState('Haz clic en la cabaña, Luma o YOYO para descubrir pistas dentro de la escena.')

  function narrate(){
    if(typeof window==='undefined'||!('speechSynthesis' in window))return
    window.speechSynthesis.cancel()
    const utterance=new SpeechSynthesisUtterance('Hola, profesora Elba. Soy YOYO. Esta es una vista tridimensional activa. Puedes explorar la cabaña, la linterna, Luma y el profesor virtual. Activa el sonido ambiental y utiliza las pistas para trabajar inferencias sencillas.')
    utterance.lang='es-CL'
    utterance.rate=.9
    utterance.pitch=1.03
    utterance.onstart=()=>setNarrating(true)
    utterance.onend=()=>setNarrating(false)
    utterance.onerror=()=>setNarrating(false)
    window.speechSynthesis.speak(utterance)
  }

  function selectTool(label:string){
    setActiveTool(label)
    const messages:Record<string,string>={
      Pista:'Pista activa: observa la ventana iluminada, la linterna y el recorrido del sendero.',
      Diario:'Diario abierto: registra la pista observada y explica qué información permite inferir.',
      Mapa:'Mapa activo: explora la escena y localiza la cabaña, el puente y la siguiente misión.',
      Mochila:'Mochila abierta: tienes linterna, lupa, audio de apoyo y tarjeta visual.'
    }
    setMessage(messages[label])
  }

  return <article className="immersive-dashboard-pro realtime-world">
    <div className="immersive-dashboard-stage">
      <ImmersivePreview3D/>
      <div className="immersive-dashboard-vignette"/>

      <div className="immersive-dashboard-copy">
        <span className="immersive-dashboard-live"><i/> MUNDO WEBGL ACTIVO</span>
        <h2>Bosque de las inferencias</h2>
        <p>Camina por una escena 3D, activa objetos, escucha el ambiente y resuelve misiones curriculares con YOYO.</p>
        <div className="immersive-dashboard-tags"><span>Lenguaje</span><span>3.º básico</span><span>5 misiones</span></div>
        <div className="runtime-proof-row"><span><Gamepad2/>Objetos interactivos</span><span><Headphones/>Ambiente sonoro</span><span><Compass/>Exploración 3D</span></div>
      </div>

      <button className={`immersive-narration-button ${narrating?'active':''}`} onClick={narrate}>
        {narrating?<Volume2/>:<Mic2/>}<span>{narrating?'Narrando...':'Escuchar introducción'}</span>
      </button>

      <div className="immersive-yoyo-bubble compact-yoyo-bubble">
        <span className="immersive-yoyo-avatar"><Bot/></span>
        <div><strong>YOYO dentro del mundo</strong><p>{message}</p><button onClick={narrate}><Volume2/>Escuchar apoyo</button></div>
      </div>

      <div className="immersive-player-hud illustrated-player-hud">
        <span className="immersive-player-avatar illustrated-luma-avatar" aria-label="Luma"/>
        <div><strong>Luma</strong><span className="immersive-hearts"><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart/></span><small>Nivel 3 · 640 / 1000 XP</small><i><b style={{width:'64%'}}/></i></div>
      </div>

      <div className="immersive-tool-dock">
        {tools.map(({label,icon:Icon})=><button key={label} className={activeTool===label?'active':''} onClick={()=>selectTool(label)}><span><Icon/></span><small>{label}</small></button>)}
      </div>

      <div className="immersive-current-mission">
        <div><span>MISIÓN ACTUAL</span><strong>Encuentra dos pistas visuales</strong><small>Haz clic en los objetos de la escena</small></div>
        <span className="mission-orb"><Sparkles/></span>
        <i><b style={{width:'50%'}}/></i>
      </div>
    </div>

    <footer className="immersive-dashboard-footer">
      <div className="immersive-world-progress"><span><CheckCircle2/></span><div><small>PROGRESO DEL MUNDO</small><strong>3 de 5 misiones completadas</strong><i><b style={{width:'60%'}}/></i></div><em>60%</em></div>
      <div className="immersive-dashboard-actions"><a href="/juegos"><Play fill="currentColor"/>Entrar al mundo completo</a><a href="/estudio-inmersivo">Editar experiencia<ChevronRight/></a></div>
    </footer>
  </article>
}
