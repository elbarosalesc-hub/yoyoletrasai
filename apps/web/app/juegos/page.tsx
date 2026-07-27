'use client'
import dynamic from 'next/dynamic'
import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Volume2,VolumeX,Sparkles,Accessibility,Play,Pause,CheckCircle2,Star,Lock,RotateCcw} from 'lucide-react'
const Bosque3D=dynamic(()=>import('@/components/games/Bosque3D'),{ssr:false})

const clues:Record<string,string>={
 mochila:'La mochila sigue cerrada. Sofía todavía no se ha preparado para entrar.',
 nota:'La nota dice: “Espera a la profesora antes de pasar”.',
 ave:'El ave permanece tranquila. No hay una amenaza visible en el entorno.',
 cabana:'La puerta está entreabierta y la cabaña se encuentra sin luz.'
}
const levels=[
 {id:1,name:'Explorar',goal:2,question:'¿Por qué Sofía espera antes de entrar?',answers:['Porque está perdida.','Porque debe esperar a la profesora.','Porque el ave la asustó.'],correct:1},
 {id:2,name:'Relacionar',goal:3,question:'¿Qué dos pistas apoyan mejor la inferencia?',answers:['Nota y mochila','Ave y árbol','Cabaña y cielo'],correct:0},
 {id:3,name:'Justificar',goal:4,question:'Completa: Sofía espera porque…',answers:['la nota se lo indica y aún no está preparada.','quiere perseguir al ave.','el bosque está vacío.'],correct:0}
]

function tone(ok=true){
 const Ctx=window.AudioContext||(window as any).webkitAudioContext
 if(!Ctx)return
 const ctx=new Ctx();const osc=ctx.createOscillator();const gain=ctx.createGain()
 osc.type=ok?'sine':'triangle';osc.frequency.value=ok?660:220;gain.gain.value=.08
 osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.18)
}
function speak(text:string){if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}

export default function Juegos(){
 const[running,setRunning]=useState(false)
 const[sound,setSound]=useState(true)
 const[reduced,setReduced]=useState(false)
 const[level,setLevel]=useState(0)
 const[found,setFound]=useState<string[]>([])
 const[answer,setAnswer]=useState<number|null>(null)
 const[feedback,setFeedback]=useState('Inicia la misión y explora los objetos del bosque.')
 const current=levels[level]
 const unlocked=found.length>=current.goal
 const progress=Math.min(100,Math.round(found.length/current.goal*100))
 const stars=useMemo(()=>level+(answer===current.correct?1:0),[level,answer,current.correct])
 const select=(id:string)=>{
  if(!running){setFeedback('Primero inicia la misión.');return}
  if(!found.includes(id))setFound(v=>[...v,id])
  setFeedback(clues[id]);if(sound){tone(true);speak(clues[id])}
 }
 const choose=(i:number)=>{
  if(!unlocked)return
  setAnswer(i)
  const ok=i===current.correct
  const msg=ok?'Respuesta correcta. Explicaste la inferencia usando evidencia del ambiente.':'Aún no. Revisa la nota y la preparación de Sofía.'
  setFeedback(msg);if(sound){tone(ok);speak(msg)}
 }
 const next=()=>{if(answer!==current.correct)return;if(level<levels.length-1){setLevel(v=>v+1);setAnswer(null);setFeedback('Nuevo nivel desbloqueado. Busca más evidencias.')}else setFeedback('Misión completa. Lograste explorar, relacionar y justificar.')}
 const reset=()=>{setFound([]);setAnswer(null);setLevel(0);setFeedback('Misión reiniciada.')}
 return <AppShell active="Juegos">
  <section className="game-premium-head">
   <div><span className="eyebrow">Juego 3D real · Lenguaje · 3.º básico</span><h1>Bosque de las inferencias</h1><p>Explora un entorno tridimensional, escucha pistas, supera tres niveles y justifica una inferencia con evidencia.</p></div>
   <div className="game-actions"><button className="btn btn-coral" onClick={()=>setRunning(v=>!v)}>{running?<Pause size={18}/>:<Play size={18}/>} {running?'Pausar':'Comenzar misión'}</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/> Reiniciar</button></div>
  </section>
  <div className="level-rail">{levels.map((l,i)=><div key={l.id} className={'level-step '+(i===level?'active ':'')+(i<level?'done ':'')+(i>level?'locked':'')}><span>{i<level?<CheckCircle2 size={18}/>:i>level?<Lock size={16}/>:l.id}</span><div><b>{l.name}</b><small>Nivel {l.id}</small></div></div>)}</div>
  <div className="tool-row"><button className="control-chip" onClick={()=>setSound(v=>!v)}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>} {sound?'Audio y voz activos':'Audio desactivado'}</button><button className="control-chip" onClick={()=>setReduced(v=>!v)}><Sparkles size={16}/>{reduced?'Movimiento reducido':'Animaciones activas'}</button><span className="control-chip"><Accessibility size={16}/>Modo accesible</span><span className="control-chip"><Star size={16}/>{stars}/3 logros</span></div>
  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card"><div className="game-hud"><span>Nivel {current.id}: {current.name}</span><div className="hud-progress"><i style={{width:progress+'%'}}/></div><b>{found.length}/{current.goal} pistas</b></div><Bosque3D onSelect={select} active={found} reducedMotion={reduced}/><div className="mission"><b>Misión:</b> selecciona objetos, escucha sus pistas y responde la pregunta del nivel.<div className="feedback-box">{feedback}</div></div></section>
   <aside className="panel challenge-panel"><span className="eyebrow">Desafío del nivel</span><h2>{current.question}</h2><div className="answer-stack">{current.answers.map((a,i)=><button key={a} disabled={!unlocked} onClick={()=>choose(i)} className={'answer-card '+(answer===i?(i===current.correct?'correct':'wrong'):'')}>{String.fromCharCode(65+i)}. {a}</button>)}</div>{!unlocked&&<div className="locked-note"><Lock size={16}/> Encuentra {current.goal-found.length} pista(s) más para responder.</div>}<button className="btn btn-primary next-level" disabled={answer!==current.correct} onClick={next}>{level===levels.length-1?'Finalizar misión':'Ir al siguiente nivel'}</button><div className="teacher-live"><h3>Analítica docente en vivo</h3><div className="metric-grid"><div><strong>{found.length}</strong><span>pistas exploradas</span></div><div><strong>{answer===current.correct?'Logrado':'En proceso'}</strong><span>estado</span></div><div><strong>{sound?'Sí':'No'}</strong><span>usa narración</span></div><div><strong>{current.id}</strong><span>nivel actual</span></div></div></div></aside>
  </div>
 </AppShell>
}
