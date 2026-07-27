'use client'

import {useEffect,useRef,useState} from 'react'
import {Eraser,RotateCcw,Volume2} from 'lucide-react'

type Point={x:number;y:number}

export default function TraceCanvas({letter='m',word='mono'}:{letter?:string;word?:string}){
 const canvasRef=useRef<HTMLCanvasElement>(null)
 const drawing=useRef(false)
 const last=useRef<Point|null>(null)
 const [attempts,setAttempts]=useState(0)
 const [progress,setProgress]=useState(0)

 const setup=()=>{
  const canvas=canvasRef.current
  if(!canvas)return
  const ratio=window.devicePixelRatio||1
  const rect=canvas.getBoundingClientRect()
  canvas.width=Math.max(1,Math.floor(rect.width*ratio))
  canvas.height=Math.max(1,Math.floor(rect.height*ratio))
  const ctx=canvas.getContext('2d')
  if(!ctx)return
  ctx.scale(ratio,ratio)
  ctx.lineCap='round';ctx.lineJoin='round'
  ctx.clearRect(0,0,rect.width,rect.height)
  ctx.strokeStyle='#d7dde1';ctx.lineWidth=2
  ;[.28,.62,.82].forEach(p=>{ctx.beginPath();ctx.moveTo(24,rect.height*p);ctx.lineTo(rect.width-24,rect.height*p);ctx.stroke()})
  ctx.fillStyle='#edf1f2';ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.font=`700 ${Math.min(rect.width*.55,250)}px Arial`
  ctx.fillText(letter,rect.width/2,rect.height*.52)
 }
 useEffect(()=>{setup();const onResize=()=>setup();window.addEventListener('resize',onResize);return()=>window.removeEventListener('resize',onResize)},[letter])
 const pos=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{drawing.current=true;last.current=pos(e);e.currentTarget.setPointerCapture(e.pointerId)}
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{if(!drawing.current||!last.current)return;const p=pos(e);const ctx=e.currentTarget.getContext('2d');if(!ctx)return;ctx.strokeStyle='#6d3df2';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(p.x,p.y);ctx.stroke();last.current=p;setProgress(v=>Math.min(100,v+1))}
 const end=()=>{if(drawing.current)setAttempts(v=>v+1);drawing.current=false;last.current=null}
 const clear=()=>{setProgress(0);setup()}
 const speak=()=>{if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(`${letter}, de ${word}`))}}
 return <section className="trace-tool" aria-label="Trazado táctil de letra">
  <div className="trace-toolbar"><div><strong>Trazado táctil</strong><span>Sigue la forma con el dedo, lápiz digital o mouse.</span></div><div><button onClick={speak}><Volume2 size={17}/>Escuchar</button><button onClick={clear}><Eraser size={17}/>Borrar</button><button onClick={()=>{setAttempts(0);clear()}}><RotateCcw size={17}/>Reiniciar</button></div></div>
  <div className="trace-canvas-wrap"><span className="trace-start">1</span><canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/></div>
  <div className="trace-results"><div><b>{attempts}</b><span>intentos</span></div><div><b>{progress}%</b><span>recorrido</span></div><div className="trace-progress"><i style={{width:`${progress}%`}}/></div><p>{progress<25?'Comienza en el punto 1 y sigue la forma.':progress<75?'Buen avance. Mantén el trazo continuo.':'¡Muy bien! Ahora intenta escribir sin la guía.'}</p></div>
 </section>
}
