'use client'

import {useState} from 'react'
import {ArrowRight,Calculator,CheckCircle2,Gamepad2,Gauge,Lightbulb,RotateCcw,Rocket,Speaker} from 'lucide-react'
import ThreeSpaceBase from './ThreeSpaceBase'

type Sector='oxigeno'|'energia'|'suministros'|'equilibrio'
type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Challenge={id:Sector;title:string;scenario:string;question:string;options:Array<{id:string;label:string}>;answer:string;explanation:string;table:string[]}

const challenges:Challenge[]=[
 {id:'oxigeno',title:'Módulo de oxígeno',scenario:'4 astronautas consumen 12 unidades de oxígeno por hora en total. La tripulación aumenta a 6 astronautas manteniendo el mismo consumo por persona.',question:'¿Cuántas unidades por hora necesitará la nueva tripulación?',options:[{id:'a',label:'14 unidades'},{id:'b',label:'18 unidades'},{id:'c',label:'24 unidades'}],answer:'b',explanation:'12 ÷ 4 = 3 unidades por astronauta. Para 6 astronautas: 6 × 3 = 18 unidades.',table:['4 astronautas → 12 unidades','1 astronauta → 3 unidades','6 astronautas → 18 unidades']},
 {id:'energia',title:'Matriz de energía',scenario:'3 paneles solares producen 900 unidades de energía en una jornada con condiciones equivalentes.',question:'¿Cuánto producirían 5 paneles al mismo rendimiento?',options:[{id:'a',label:'1.200 unidades'},{id:'b',label:'1.500 unidades'},{id:'c',label:'2.700 unidades'}],answer:'b',explanation:'900 ÷ 3 = 300 por panel. Con 5 paneles: 5 × 300 = 1.500 unidades.',table:['3 paneles → 900','1 panel → 300','5 paneles → 1.500']},
 {id:'suministros',title:'Bodega de suministros',scenario:'Para 8 días, una tripulación necesita 24 paquetes de alimento. La relación entre días y paquetes se mantiene constante.',question:'¿Cuántos paquetes se requieren para 12 días?',options:[{id:'a',label:'30 paquetes'},{id:'b',label:'32 paquetes'},{id:'c',label:'36 paquetes'}],answer:'c',explanation:'24 ÷ 8 = 3 paquetes por día. Para 12 días: 12 × 3 = 36 paquetes.',table:['8 días → 24 paquetes','1 día → 3 paquetes','12 días → 36 paquetes']},
 {id:'equilibrio',title:'Centro de equilibrio',scenario:'La base dispone de 60 unidades de reserva. El plan indica usar oxígeno y energía en razón 2:3.',question:'¿Cómo se distribuyen correctamente las 60 unidades?',options:[{id:'a',label:'24 para oxígeno y 36 para energía'},{id:'b',label:'20 para oxígeno y 40 para energía'},{id:'c',label:'30 para cada sistema'}],answer:'a',explanation:'2 + 3 = 5 partes. 60 ÷ 5 = 12 por parte. Oxígeno: 2 × 12 = 24. Energía: 3 × 12 = 36.',table:['Razón 2:3 → 5 partes','60 ÷ 5 = 12 por parte','Oxígeno 24 · Energía 36']},
]

const labels:Record<Sector,string>={oxigeno:'Oxígeno',energia:'Energía',suministros:'Suministros',equilibrio:'Equilibrio'}

export default function BaseEspacial3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[index,setIndex]=useState(0)
 const[selected,setSelected]=useState('')
 const[completed,setCompleted]=useState<Sector[]>([])
 const[attempts,setAttempts]=useState(0)
 const[message,setMessage]=useState('Usa la relación entre cantidades para calcular cuánto necesita cada módulo.')
 const[ready,setReady]=useState(false)
 const challenge=challenges[index]
 const solved=completed.includes(challenge.id)

 function speak(text:string){if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.9;window.speechSynthesis.speak(utterance)}
 function validate(){if(!selected)return;setAttempts(value=>value+1);if(selected===challenge.answer){setCompleted(current=>current.includes(challenge.id)?current:[...current,challenge.id]);const text=`Sector estabilizado. ${challenge.explanation}`;setMessage(text);speak(text)}else{const text='La proporción no se mantiene. Busca primero el valor correspondiente a una unidad y vuelve a escalar.';setMessage(text);speak(text)}}
 function next(){if(!solved)return;if(index===challenges.length-1){const text='Base estabilizada. Administraste oxígeno, energía y suministros usando razones y proporcionalidad.';setMessage(text);speak(text);return}setIndex(value=>value+1);setSelected('');setMessage('Nuevo sector abierto. Identifica la relación constante antes de calcular.')}
 function reset(){setIndex(0);setSelected('');setCompleted([]);setAttempts(0);setMessage('Base reiniciada. Comienza estabilizando el módulo de oxígeno.')}
 function sendToMission(){const draft={title:'Base espacial',description:'Experiencia 3D para resolver problemas de razón y proporcionalidad administrando recursos de una estación orbital.',experienceType:'game',sourceHref:'/juegos/base-espacial',supportProfile:'Tablas visuales; pasos unitarios; audio opcional; alternativa textual; alto contraste; movimiento reducido; sin límite de tiempo.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-base-espacial'};localStorage.setItem('yoyo-mission-draft',JSON.stringify(draft));window.location.href='/misiones?from=juego-base-espacial'}

 return <section className="fair-game-wrap" id="base-espacial">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Matemática · 6.º básico–1.º medio</span><h1>Base espacial</h1><p>Administra recursos de una estación orbital usando razones, proporcionalidad y cálculo por unidad.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(`${challenge.scenario} ${challenge.question}`)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar desafío</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar base</button><button className="btn btn-primary" onClick={sendToMission}><Gamepad2 size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{challenges.map((item,stageIndex)=><div key={item.id} className={'level-step '+(stageIndex===index?'active ':'')+(completed.includes(item.id)?'done ':'')+(stageIndex>index?'locked':'')}><span>{completed.includes(item.id)?<CheckCircle2 size={17}/>:stageIndex+1}</span><div><b>{labels[item.id]}</b><small>{completed.includes(item.id)?'Sector estable':stageIndex===index?'Sector activo':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{challenge.title}</span><div className="hud-progress"><i style={{width:`${Math.round((completed.length/challenges.length)*100)}%`}}/></div><b>{completed.length}/4 sectores</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Estación orbital tridimensional"><ThreeSpaceBase activeSector={challenge.id} completed={completed} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Control orbital</strong><span>{ready?`Sector: ${labels[challenge.id]} · ${completed.length} estabilizados`:'Cargando estación 3D…'}</span></div></div>
    <div className="feedback-box" role="status" aria-live="polite">{message}</div>
    <div className="accessibility-summary"><Rocket size={18}/><span>La escena 3D es complementaria. Todas las cantidades, relaciones y pasos aparecen también por escrito.</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><Gauge size={14}/> Recurso crítico</span><div className="insight"><b>Situación</b><p>{challenge.scenario}</p></div><h2>{challenge.question}</h2>
    <div className="insight"><b><Calculator size={14}/> Tabla de relación</b>{challenge.table.map(row=><p key={row}>{row}</p>)}</div>
    <div className="answer-stack">{challenge.options.map(option=><button key={option.id} onClick={()=>setSelected(option.id)} className={'answer-card '+(selected===option.id?'selected':'')}>{option.label}</button>)}</div>
    <button className="btn btn-primary" onClick={validate} disabled={!selected}><Gauge size={16}/>Comprobar proporción</button>
    <div className="metric-grid"><div><strong>{completed.length}/4</strong><span>sectores</span></div><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{selected?selected.toUpperCase():'—'}</strong><span>cálculo</span></div><div><strong>{solved?'Sí':'No'}</strong><span>estable</span></div></div>
    <div className="insight"><b><Lightbulb size={14}/> Estrategia</b><p>{solved?challenge.explanation:'Encuentra cuánto corresponde a 1 unidad y después multiplica por la nueva cantidad.'}</p></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{index===challenges.length-1?'Cerrar misión':'Ir al siguiente sector'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
