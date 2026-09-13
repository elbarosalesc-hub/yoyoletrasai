'use client'

import {useMemo,useRef,useState} from 'react'
import {ArrowRight,CheckCircle2,Eraser,Gamepad2,Hand,RotateCcw,Route,Speaker} from 'lucide-react'
import {ThreeTraceGarden} from './ThreeTraceGarden'

type Point={x:number;y:number}
type Stage={title:string;instruction:string;points:Point[]}
type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}

const line=(a:Point,b:Point,count=14)=>Array.from({length:count},(_,i)=>({x:a.x+(b.x-a.x)*(i/(count-1)),y:a.y+(b.y-a.y)*(i/(count-1))}))
const wave=Array.from({length:28},(_,i)=>({x:8+i*(84/27),y:50+Math.sin(i*.72)*24}))
const zigzag=Array.from({length:25},(_,i)=>({x:8+i*(84/24),y:i%4<2?26:74}))
const spiral=Array.from({length:34},(_,i)=>{const t=i/33*Math.PI*4.1;const r=34*(1-i/40);return{x:50+Math.cos(t)*r,y:50+Math.sin(t)*r}})

const stages:Stage[]=[
 {title:'Camino vertical',instruction:'Comienza arriba y baja siguiendo el sendero recto.',points:line({x:50,y:10},{x:50,y:90})},
 {title:'Camino horizontal',instruction:'Comienza a la izquierda y avanza hacia la derecha.',points:line({x:8,y:50},{x:92,y:50})},
 {title:'Río de ondas',instruction:'Sigue las curvas suaves sin salir del cauce.',points:wave},
 {title:'Montañas en zigzag',instruction:'Sube y baja por los vértices manteniendo el recorrido.',points:zigzag},
 {title:'Jardín en espiral',instruction:'Entra por el borde y avanza por la espiral hacia el centro.',points:spiral},
]

export default function SenderosTrazos3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[index,setIndex]=useState(0)
 const[reached,setReached]=useState(0)
 const[attempts,setAttempts]=useState(0)
 const[drawing,setDrawing]=useState(false)
 const[stroke,setStroke]=useState<Point[]>([])
 const[completed,setCompleted]=useState<number[]>([])
 const[ready,setReady]=useState(false)
 const svgRef=useRef<SVGSVGElement>(null)
 const stage=stages[index]
 const progress=Math.round(reached/stage.points.length*100)
 const solved=progress>=92
 const guide=useMemo(()=>stage.points.map(p=>`${p.x},${p.y}`).join(' '),[stage])

 function speak(text:string){if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CL';u.rate=.88;window.speechSynthesis.speak(u)}
 function pointerPoint(e:React.PointerEvent<SVGSVGElement>){const r=e.currentTarget.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*100,y:(e.clientY-r.top)/r.height*100}}
 function advance(p:Point){const next=stage.points[Math.min(reached,stage.points.length-1)];if(!next)return;const distance=Math.hypot(p.x-next.x,p.y-next.y);if(distance<10)setReached(value=>Math.min(stage.points.length,value+1))}
 function start(e:React.PointerEvent<SVGSVGElement>){setDrawing(true);setAttempts(v=>v+1);e.currentTarget.setPointerCapture(e.pointerId);const p=pointerPoint(e);setStroke([p]);advance(p)}
 function move(e:React.PointerEvent<SVGSVGElement>){if(!drawing)return;const p=pointerPoint(e);setStroke(current=>[...current.slice(-180),p]);advance(p)}
 function end(){setDrawing(false);if(solved&&!completed.includes(index)){setCompleted(current=>[...current,index]);speak('Sendero completado. Tu recorrido siguió la secuencia de puntos.') }}
 function clear(){setReached(0);setStroke([]);setDrawing(false)}
 function next(){if(!solved)return;if(!completed.includes(index))setCompleted(current=>[...current,index]);if(index<stages.length-1){setIndex(v=>v+1);setReached(0);setStroke([]);setDrawing(false)}else speak('Completaste todos los senderos de trazos.')}
 function reset(){setIndex(0);setReached(0);setAttempts(0);setStroke([]);setCompleted([]);setDrawing(false)}
 function keyboardStep(){const nextPoint=stage.points[Math.min(reached,stage.points.length-1)];if(!nextPoint)return;setReached(v=>Math.min(stage.points.length,v+1));setStroke(current=>[...current,nextPoint])}
 function sendToMission(){localStorage.setItem('yoyo-mission-draft',JSON.stringify({title:'Senderos de trazos',description:'Experiencia progresiva de grafomotricidad con trazado táctil de líneas, ondas, zigzag y espiral.',experienceType:'game',sourceHref:'/juegos/senderos-trazos',supportProfile:'Trazo grueso; uso con dedo, lápiz digital o mouse; mano izquierda; alternativa por teclado; alto contraste; movimiento reducido; sin límite de tiempo.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-senderos-trazos'}));window.location.href='/misiones?from=juego-senderos-trazos'}

 return <section className="fair-game-wrap" id="senderos-trazos">
  <div className="game-premium-head"><div><span className="eyebrow">Táctil + 3D · Grafomotricidad · Prekínder–1.º básico</span><h1>Senderos de trazos</h1><p>Recorre caminos progresivos con dedo, lápiz digital o mouse. El jardín 3D florece a medida que avanzas.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(stage.instruction)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar</button><button className="btn btn-primary" onClick={sendToMission}><Gamepad2 size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{stages.map((item,i)=><div key={item.title} className={'level-step '+(i===index?'active ':'')+(completed.includes(i)?'done ':'')+(i>index?'locked':'')}><span>{completed.includes(i)?<CheckCircle2 size={17}/>:i+1}</span><div><b>{item.title}</b><small>{completed.includes(i)?'Completado':i===index?'Sendero activo':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{stage.title}</span><div className="hud-progress"><i style={{width:`${progress}%`}}/></div><b>{progress}%</b></div>
    <div className="trace-path-board" style={{background:highContrast?'#071018':'#fff'}}>
     <svg ref={svgRef} viewBox="0 0 100 100" role="application" aria-label={`${stage.title}. ${stage.instruction}`} tabIndex={0} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end}>
      <polyline points={guide} fill="none" stroke={highContrast?'#f5f7ff':'#cdd5df'} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points={guide} fill="none" stroke={highContrast?'#ffd166':'#6d3df2'} strokeWidth="2" strokeDasharray="2 4" strokeLinecap="round" strokeLinejoin="round"/>
      {stage.points.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={i===reached?2.5:1.2} fill={i<reached?'#31a86b':i===reached?'#ff9f1c':'#bcc6d0'}/>)}
      {stroke.length>1&&<polyline points={stroke.map(p=>`${p.x},${p.y}`).join(' ')} fill="none" stroke={highContrast?'#00e5ff':'#6d3df2'} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>}
     </svg>
     <div className="trace-path-actions"><button className="btn btn-soft" onClick={clear}><Eraser size={16}/>Borrar intento</button><button className="btn btn-soft" onClick={keyboardStep}><Hand size={16}/>Avanzar punto por teclado</button></div>
    </div>
    <div className="feedback-box" role="status" aria-live="polite">{solved?'¡Sendero recorrido! Puedes avanzar al siguiente.':stage.instruction}</div>
    <div className="accessibility-summary"><Hand size={18}/><span>No hay tiempo límite. Puedes usar mano derecha o izquierda, dedo, lápiz digital, mouse o la alternativa secuencial por teclado.</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><Route size={14}/> Jardín de progreso</span><div className="three-stage premium-webgl-scene" style={{minHeight:300}}><ThreeTraceGarden progress={progress} stage={index} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>{ready?'Jardín conectado':'Cargando jardín…'}</strong><span>{progress}% del sendero ilumina el camino</span></div></div>
    <div className="metric-grid"><div><strong>{completed.length}/5</strong><span>senderos</span></div><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{reached}</strong><span>puntos</span></div><div><strong>{solved?'Sí':'No'}</strong><span>listo</span></div></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{index===stages.length-1?'Finalizar jardín':'Siguiente sendero'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
