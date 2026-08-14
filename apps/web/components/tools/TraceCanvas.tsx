'use client'

import {useEffect,useRef,useState} from 'react'
import {Eraser,RotateCcw,Volume2} from 'lucide-react'

type Point={x:number;y:number}
type WritingStyle='print'|'manuscript'
type Handedness='right'|'left'

type Props={
 letter?:string
 word?:string
 writingStyle?:WritingStyle
 handedness?:Handedness
 showGuides?:boolean
 showStart?:boolean
 showDirection?:boolean
}

export default function TraceCanvas({
 letter='m',
 word='mono',
 writingStyle='print',
 handedness='right',
 showGuides=true,
 showStart=true,
 showDirection=true,
}:Props){
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
  ctx.setTransform(ratio,0,0,ratio,0,0)
  ctx.lineCap='round';ctx.lineJoin='round'
  ctx.clearRect(0,0,rect.width,rect.height)

  if(showGuides){
   const guideYs=[.2,.42,.66,.82]
   guideYs.forEach((p,index)=>{
    ctx.beginPath()
    ctx.strokeStyle=index===2?'#b9c3cc':'#d7dde1'
    ctx.lineWidth=index===2?2.5:1.5
    if(index===1)ctx.setLineDash([7,7]);else ctx.setLineDash([])
    ctx.moveTo(24,rect.height*p)
    ctx.lineTo(rect.width-24,rect.height*p)
    ctx.stroke()
   })
   ctx.setLineDash([])
   ctx.beginPath()
   ctx.strokeStyle='#efc3c3'
   ctx.lineWidth=1.5
   const marginX=handedness==='left'?rect.width-54:54
   ctx.moveTo(marginX,24)
   ctx.lineTo(marginX,rect.height-24)
   ctx.stroke()
  }

  const fontSize=Math.min(rect.width*.48,230)
  ctx.fillStyle='#edf1f2'
  ctx.textAlign='center';ctx.textBaseline='middle'
  ctx.font=writingStyle==='manuscript'
   ? `700 ${fontSize}px "Segoe Print","Bradley Hand","Comic Sans MS",cursive`
   : `700 ${fontSize}px Arial,Helvetica,sans-serif`
  ctx.fillText(letter,rect.width/2,rect.height*.52)

  if(showStart){
   const startX=handedness==='left'?rect.width*.64:rect.width*.36
   const startY=rect.height*.34
   ctx.beginPath();ctx.fillStyle='#6d3df2';ctx.arc(startX,startY,13,0,Math.PI*2);ctx.fill()
   ctx.fillStyle='#fff';ctx.font='700 13px Arial';ctx.fillText('1',startX,startY+1)
  }
  if(showDirection){
   const y=rect.height*.76
   const fromX=handedness==='left'?rect.width*.68:rect.width*.32
   const toX=handedness==='left'?rect.width*.48:rect.width*.52
   ctx.beginPath();ctx.strokeStyle='#6d3df2';ctx.lineWidth=3;ctx.moveTo(fromX,y);ctx.lineTo(toX,y);ctx.stroke()
   const direction=handedness==='left'?-1:1
   ctx.beginPath();ctx.fillStyle='#6d3df2';ctx.moveTo(toX,y);ctx.lineTo(toX-10*direction,y-7);ctx.lineTo(toX-10*direction,y+7);ctx.closePath();ctx.fill()
  }
 }

 useEffect(()=>{
  setup()
  const onResize=()=>setup()
  window.addEventListener('resize',onResize)
  return()=>window.removeEventListener('resize',onResize)
 },[letter,writingStyle,handedness,showGuides,showStart,showDirection])

 const pos=(e:React.PointerEvent<HTMLCanvasElement>)=>{const r=e.currentTarget.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
 const start=(e:React.PointerEvent<HTMLCanvasElement>)=>{drawing.current=true;last.current=pos(e);e.currentTarget.setPointerCapture(e.pointerId)}
 const move=(e:React.PointerEvent<HTMLCanvasElement>)=>{
  if(!drawing.current||!last.current)return
  const p=pos(e)
  const ctx=e.currentTarget.getContext('2d')
  if(!ctx)return
  ctx.strokeStyle='#6d3df2';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(last.current.x,last.current.y);ctx.lineTo(p.x,p.y);ctx.stroke()
  last.current=p
  setProgress(v=>Math.min(100,v+1))
 }
 const end=()=>{if(drawing.current)setAttempts(v=>v+1);drawing.current=false;last.current=null}
 const clear=()=>{setProgress(0);setup()}
 const speak=()=>{if('speechSynthesis'in window){speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${letter}, de ${word}`);utterance.lang='es-CL';speechSynthesis.speak(utterance)}}

 return <section className="trace-tool" aria-label={`Trazado táctil de letra ${writingStyle==='manuscript'?'manuscrita':'imprenta'}`}>
  <div className="trace-toolbar"><div><strong>Trazado táctil · {writingStyle==='manuscript'?'Manuscrita':'Imprenta'}</strong><span>Sigue la forma con el dedo, lápiz digital o mouse.</span></div><div><button onClick={speak}><Volume2 size={17}/>Escuchar</button><button onClick={clear}><Eraser size={17}/>Borrar</button><button onClick={()=>{setAttempts(0);clear()}}><RotateCcw size={17}/>Reiniciar</button></div></div>
  <div className="trace-canvas-wrap"><canvas ref={canvasRef} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}/></div>
  <div className="trace-results"><div><b>{attempts}</b><span>intentos</span></div><div><b>{progress}%</b><span>recorrido</span></div><div className="trace-progress"><i style={{width:`${progress}%`}}/></div><p>{progress<25?'Comienza en el punto 1 y sigue la dirección.':progress<75?'Buen avance. Mantén el trazo continuo y controla el tamaño.':'¡Muy bien! Ahora intenta escribir sin la guía.'}</p></div>
 </section>
}
