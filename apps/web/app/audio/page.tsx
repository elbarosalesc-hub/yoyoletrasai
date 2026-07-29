'use client'

import {useState} from 'react'
import {Headphones,Mic2,Pause,Play,Save,SlidersHorizontal,Sparkles,Volume2} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const samples=[
 {title:'Instrucción de bienvenida',text:'Hola. Hoy aprenderemos a encontrar pistas importantes dentro de un texto.'},
 {title:'Modelado de inferencia',text:'Primero leo la pista. Luego la relaciono con lo que ya sé. Finalmente explico mi respuesta.'},
 {title:'Retroalimentación positiva',text:'Muy bien. Tu respuesta utiliza una pista del texto y explica claramente la idea.'}
]

export default function AudioNarracion(){
 const[text,setText]=useState(samples[0].text)
 const[rate,setRate]=useState(.9)
 const[playing,setPlaying]=useState(false)

 function speak(){
  if(typeof window==='undefined'||!('speechSynthesis'in window))return
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=rate;utterance.pitch=1
  utterance.onstart=()=>setPlaying(true);utterance.onend=()=>setPlaying(false);window.speechSynthesis.speak(utterance)
 }
 function stop(){if(typeof window!=='undefined')window.speechSynthesis.cancel();setPlaying(false)}

 return <ModuleShell active="Audio y narración">
  <section className="audio-head"><div><span className="module-eyebrow"><Sparkles size={15}/> Estudio de voz accesible</span><h1>Audio, narración y lectura en voz alta</h1><p>Crea instrucciones, cuentos, retroalimentaciones y apoyos auditivos para recursos y juegos.</p></div><div><Volume2/><span><strong>Español de Chile</strong><small>Voz del navegador disponible</small></span></div></section>
  <section className="audio-studio"><aside><small>GUIONES RÁPIDOS</small>{samples.map(sample=><button key={sample.title} onClick={()=>setText(sample.text)}><Headphones/><span><strong>{sample.title}</strong><small>{sample.text}</small></span></button>)}</aside><main><div className="audio-editor-head"><div><Mic2/><span><small>EDITOR DE NARRACIÓN</small><h2>Guion de audio</h2></span></div><button><Save/>Guardar audio</button></div><textarea value={text} onChange={event=>setText(event.target.value)} rows={9}/><div className="audio-controls"><button onClick={playing?stop:speak}>{playing?<><Pause/>Pausar</>:<><Play/>Reproducir</>}</button><label><SlidersHorizontal/>Velocidad<input type="range" min="0.6" max="1.3" step="0.1" value={rate} onChange={event=>setRate(Number(event.target.value))}/><strong>{rate.toFixed(1)}x</strong></label></div><div className="audio-wave" aria-hidden="true">{Array.from({length:38},(_,index)=><i key={index} style={{height:`${18+(index*17)%48}px`}}/>)}</div></main></section>
 </ModuleShell>
}
