'use client'

import {useMemo,useState} from 'react'
import {
  ArrowUpRight,
  Backpack,
  BookOpen,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Gamepad2,
  Headphones,
  Heart,
  Lightbulb,
  Map,
  Mic2,
  Play,
  RotateCcw,
  Search,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react'
import {ImmersivePreview3D} from './ImmersivePreview3D'

type DashboardMission={
  title:string
  instruction:string
  question:string
  answers:string[]
  correct:number
  explanation:string
  xp:number
}

type DashboardTool={
  label:string
  icon:typeof Search
  message:string
}

const missions:DashboardMission[]=[
  {
    title:'La ventana iluminada',
    instruction:'Observa la cabaña y usa una pista visual para inferir qué ocurre.',
    question:'¿Qué permite inferir la ventana encendida?',
    answers:['Que probablemente hay alguien dentro','Que el bosque está vacío','Que ya amaneció'],
    correct:0,
    explanation:'Una luz encendida es evidencia de actividad dentro de la cabaña.',
    xp:120
  },
  {
    title:'El sendero nocturno',
    instruction:'Relaciona la linterna de Luma con las condiciones del ambiente.',
    question:'¿Por qué Luma necesita una linterna?',
    answers:['Para iluminar el camino oscuro','Para decorar su mochila','Para llamar a los árboles'],
    correct:0,
    explanation:'Es de noche y la visibilidad es baja; la linterna permite avanzar con seguridad.',
    xp:140
  },
  {
    title:'YOYO encuentra una ruta',
    instruction:'Une dos pistas: la flecha del mapa y las huellas del sendero.',
    question:'¿Qué indican juntas ambas pistas?',
    answers:['La dirección que alguien siguió','La altura de los árboles','La temperatura del bosque'],
    correct:0,
    explanation:'La flecha marca una dirección y las huellas confirman que alguien avanzó por allí.',
    xp:160
  }
]

const tools:DashboardTool[]=[
  {label:'Pista',icon:Search,message:'Observa la ventana, la linterna y el sendero. Las pistas visuales ayudan a inferir.'},
  {label:'Diario',icon:BookOpen,message:'Registra la pista y explica con tus palabras qué información entrega.'},
  {label:'Mapa',icon:Map,message:'Localiza la cabaña, el puente y el siguiente punto de la misión.'},
  {label:'Mochila',icon:Backpack,message:'Tienes linterna, lupa, tarjeta visual y audio de apoyo.'}
]

export function DashboardImmersiveHero(){
  const[activeTool,setActiveTool]=useState(0)
  const[mission,setMission]=useState(0)
  const[selected,setSelected]=useState<number|null>(null)
  const[score,setScore]=useState(640)
  const[narrating,setNarrating]=useState(false)
  const[audioEnabled,setAudioEnabled]=useState(true)
  const current:DashboardMission=missions[mission]??missions[0]
  const progress=Math.round(((mission+(selected!==null?1:0))/missions.length)*100)
  const isCorrect=selected===current.correct
  const supportMessage=useMemo(()=>tools[activeTool]?.message??tools[0].message,[activeTool])

  function speak(text:string){
    if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis' in window))return
    window.speechSynthesis.cancel()
    const utterance=new SpeechSynthesisUtterance(text)
    utterance.lang='es-CL'
    utterance.rate=.88
    utterance.pitch=1.02
    utterance.onstart=()=>setNarrating(true)
    utterance.onend=()=>setNarrating(false)
    utterance.onerror=()=>setNarrating(false)
    window.speechSynthesis.speak(utterance)
  }

  function answer(index:number){
    if(selected!==null)return
    setSelected(index)
    if(index===current.correct)setScore(value=>value+current.xp)
    speak(index===current.correct?`Muy bien. ${current.explanation}`:`Aún no. Escucha la pista. ${current.explanation}`)
  }

  function nextMission(){
    if(mission<missions.length-1){setMission(value=>value+1);setSelected(null)}
  }

  function reset(){
    setMission(0)
    setSelected(null)
    setScore(640)
    if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel()
  }

  return <article className="immersive-dashboard-pro realtime-world dashboard-runtime-v2">
    <div className="immersive-dashboard-stage dashboard-runtime-stage">
      <ImmersivePreview3D/>
      <div className="immersive-dashboard-vignette"/>

      <div className="immersive-dashboard-copy runtime-copy-v2">
        <div className="runtime-badges-v2"><span className="immersive-dashboard-live"><i/> WEBGL 3D EN VIVO</span><span><Headphones/>Audio interactivo</span><span><Bot/>Profesor virtual</span></div>
        <h2>Bosque de las inferencias</h2>
        <p>Explora una escena tridimensional real, activa objetos y resuelve desafíos curriculares con retroalimentación inmediata.</p>
        <div className="runtime-proof-row"><span><Gamepad2/>WASD y clic</span><span><Compass/>Objetos activos</span><span><Volume2/>Narración es-CL</span></div>
      </div>

      <div className="runtime-top-actions-v2">
        <button className={audioEnabled?'active':''} onClick={()=>{setAudioEnabled(value=>!value);if(typeof window!=='undefined'&&'speechSynthesis' in window)window.speechSynthesis.cancel()}} aria-label={audioEnabled?'Silenciar narración':'Activar narración'}>{audioEnabled?<Volume2/>:<VolumeX/>}</button>
        <button className={narrating?'active':''} onClick={()=>speak(`${current.title}. ${current.instruction} ${current.question}`)}><Mic2/><span>{narrating?'Narrando...':'Escuchar misión'}</span></button>
        <a href="/juegos"><ArrowUpRight/><span>Abrir mundo completo</span></a>
      </div>

      <div className="immersive-player-hud illustrated-player-hud runtime-player-v2">
        <span className="immersive-player-avatar illustrated-luma-avatar" aria-label="Luma"/>
        <div><strong>Luma</strong><span className="immersive-hearts"><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart fill="currentColor"/><Heart/></span><small>Nivel 3 · {score} XP</small><i><b style={{width:`${Math.min(100,score/10)}%`}}/></i></div>
      </div>

      <aside className="runtime-mission-panel-v2">
        <header><div><span>MISIÓN {mission+1} DE {missions.length}</span><h3>{current.title}</h3></div><strong>{progress}%</strong></header>
        <p>{current.instruction}</p>
        <div className="runtime-question-v2"><span><Sparkles/></span><strong>{current.question}</strong></div>
        <div className="runtime-answers-v2">{current.answers.map((answerText:string,index:number)=><button key={answerText} disabled={selected!==null} className={selected===index?(index===current.correct?'correct':'incorrect'):selected!==null&&index===current.correct?'correct':''} onClick={()=>answer(index)}><i>{String.fromCharCode(65+index)}</i><span>{answerText}</span>{selected!==null&&index===current.correct&&<CheckCircle2/>}</button>)}</div>
        {selected!==null&&<div className={isCorrect?'runtime-feedback-v2 success':'runtime-feedback-v2 retry'}><Lightbulb/><div><strong>{isCorrect?'¡Respuesta correcta!':'Revisa la evidencia'}</strong><p>{current.explanation}</p></div></div>}
        <footer><button onClick={reset}><RotateCcw/>Reiniciar</button>{selected!==null&&mission<missions.length-1?<button className="primary" onClick={nextMission}>Siguiente misión<ChevronRight/></button>:selected!==null?<a href="/juegos">Continuar mundo<ChevronRight/></a>:<button className="primary" onClick={()=>speak(`${current.instruction} ${current.question}`)}><Play/>Comenzar</button>}</footer>
      </aside>

      <div className="immersive-yoyo-bubble compact-yoyo-bubble runtime-yoyo-v2">
        <span className="immersive-yoyo-avatar"><Bot/></span>
        <div><strong>YOYO está dentro del mundo</strong><p>{supportMessage}</p><button onClick={()=>speak(supportMessage)}><Volume2/>Escuchar apoyo</button></div>
      </div>

      <div className="immersive-tool-dock runtime-tool-dock-v2">
        {tools.map(({label,icon:Icon}:DashboardTool,index:number)=><button key={label} className={activeTool===index?'active':''} onClick={()=>setActiveTool(index)}><span><Icon/></span><small>{label}</small></button>)}
      </div>
    </div>

    <footer className="immersive-dashboard-footer runtime-footer-v2">
      <div className="immersive-world-progress"><span><CheckCircle2/></span><div><small>PROGRESO DE LA EXPERIENCIA</small><strong>{mission} misiones completadas · {score} XP</strong><i><b style={{width:`${progress}%`}}/></i></div><em>{progress}%</em></div>
      <div className="immersive-dashboard-actions"><a href="/juegos"><Play fill="currentColor"/>Entrar al mundo completo</a><a href="/estudio-inmersivo">Editar experiencia<ChevronRight/></a></div>
    </footer>
  </article>
}
