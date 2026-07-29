'use client'

import {useMemo,useState} from 'react'
import {Bot,CheckCircle2,ChevronRight,Headphones,Pause,Play,RotateCcw,ShieldCheck,Sparkles,Volume2} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const lesson=[
 {title:'Activamos conocimientos',text:'Antes de leer, observa el título y la imagen. Pregúntate de qué podría tratar el texto.'},
 {title:'Buscamos pistas',text:'Mientras lees, identifica palabras, acciones y detalles que entregan información importante.'},
 {title:'Hacemos una inferencia',text:'Une las pistas del texto con lo que ya sabes para construir una idea que no aparece escrita de forma directa.'},
 {title:'Justificamos',text:'Explica tu respuesta indicando qué pista del texto te ayudó a pensarla.'}
]

export default function ProfesorVirtual(){
 const[step,setStep]=useState(0)
 const[playing,setPlaying]=useState(false)
 const[answer,setAnswer]=useState<number|null>(null)
 const current=lesson[step]
 const progress=useMemo(()=>Math.round((step+1)/lesson.length*100),[step])

 function speak(){
  if(typeof window==='undefined'||!('speechSynthesis'in window))return
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${current.title}. ${current.text}`);utterance.lang='es-CL';utterance.rate=.88;utterance.pitch=1.05
  utterance.onstart=()=>setPlaying(true);utterance.onend=()=>setPlaying(false);window.speechSynthesis.speak(utterance)
 }
 function stop(){if(typeof window!=='undefined')window.speechSynthesis.cancel();setPlaying(false)}
 function next(){setStep(value=>(value+1)%lesson.length);setAnswer(null);stop()}

 return <ModuleShell active="Profesor virtual">
  <section className="virtual-teacher-head"><div><span className="module-eyebrow"><Sparkles size={15}/> Enseñanza guiada multimodal</span><h1>Profesor virtual YOYO</h1><p>Explica, modela, pregunta y retroalimenta con control docente, voz en español y ritmo ajustable.</p></div><div className="teacher-security"><ShieldCheck/><span><strong>Control docente</strong><small>Ninguna lección se publica sin revisión</small></span></div></section>

  <section className="virtual-teacher-layout">
   <article className="teacher-stage">
    <div className="teacher-room"><div className="teacher-board"><span>OBJETIVO</span><h2>Realizar inferencias sencillas</h2><p>Usar pistas del texto para comprender información implícita.</p><div className="board-progress"><i style={{width:`${progress}%`}}/></div></div><div className={`teacher-avatar ${playing?'speaking':''}`}><div className="teacher-halo"/><div className="teacher-head"><i/><i/><span/></div><div className="teacher-body"><Bot/></div><div className="speech-wave"><i/><i/><i/><i/></div></div><div className="teacher-desk"><span>📘</span><span>✏️</span></div></div>
    <div className="teacher-controls"><button onClick={playing?stop:speak}>{playing?<><Pause/>Pausar explicación</>:<><Play/>Escuchar explicación</>}</button><button onClick={()=>{setStep(0);setAnswer(null);stop()}}><RotateCcw/>Reiniciar</button><button onClick={next}>Siguiente paso<ChevronRight/></button></div>
   </article>

   <aside className="teacher-lesson-panel"><span className="lesson-step">PASO {step+1} DE {lesson.length}</span><h2>{current.title}</h2><p>{current.text}</p><button className="listen-mini" onClick={speak}><Headphones/>Escuchar este paso</button><div className="teacher-check"><small>COMPROBEMOS</small><strong>¿Qué debemos hacer antes de responder una inferencia?</strong>{['Buscar una pista en el texto','Adivinar sin leer','Copiar una oración completa'].map((item,index)=><button key={item} className={`${answer===index?'selected':''} ${answer!==null&&index===0?'correct':''}`} onClick={()=>setAnswer(index)} disabled={answer!==null}><span>{String.fromCharCode(65+index)}</span>{item}{answer!==null&&index===0&&<CheckCircle2/>}</button>)}{answer!==null&&<div className={answer===0?'feedback good':'feedback retry'}>{answer===0?'¡Muy bien! Primero buscamos evidencias en el texto.':'Revisa el paso anterior: una inferencia necesita pistas.'}</div>}</div></aside>
  </section>

  <section className="teacher-tools-grid"><article><span><Volume2/></span><div><h3>Voz y ritmo</h3><p>Narración en español de Chile con velocidad pausada.</p></div></article><article><span><Sparkles/></span><div><h3>Modelado explícito</h3><p>Explicación breve, ejemplo y práctica guiada.</p></div></article><article><span><ShieldCheck/></span><div><h3>Aprobación profesional</h3><p>El docente revisa cada lección antes de asignarla.</p></div></article></section>
 </ModuleShell>
}
