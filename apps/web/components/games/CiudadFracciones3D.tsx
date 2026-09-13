'use client'

import {useMemo,useState} from 'react'
import {ArrowRight,Building2,CheckCircle2,Gamepad2,RotateCcw,Speaker,Target} from 'lucide-react'
import ThreeFractionCity from './ThreeFractionCity'

type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Level={
 title:string
 brief:string
 concept:string
 kind:'equivalence'|'compare'|'build'
 target:{n:number;d:number}
 options?:Array<{n:number;d:number}>
 compare?:[{n:number;d:number},{n:number;d:number}]
 build?:{denominator:number;start:number;goal:number}
}

const levels:Level[]=[
 {title:'Distrito de equivalencias',brief:'Activa una zona de la ciudad que represente exactamente la misma cantidad que 1/2.',concept:'Dos fracciones son equivalentes cuando representan la misma parte del entero, aunque usen números distintos.',kind:'equivalence',target:{n:1,d:2},options:[{n:1,d:3},{n:2,d:4},{n:3,d:8},{n:4,d:6}]},
 {title:'Puente de comparación',brief:'Compara 3/4 y 2/3. Elige qué fracción ocupa una parte mayor del entero.',concept:'Para comparar fracciones puedes usar una representación visual o llevarlas a denominadores equivalentes.',kind:'compare',target:{n:3,d:4},compare:[{n:3,d:4},{n:2,d:3}]},
 {title:'Torre modular',brief:'Construye exactamente 5/8 de la torre activando módulos. Puedes agregar o quitar una parte cada vez.',concept:'El numerador indica cuántas partes iguales están consideradas; el denominador indica en cuántas partes iguales se divide el entero.',kind:'build',target:{n:5,d:8},build:{denominator:8,start:2,goal:5}},
]

function sameFraction(a:{n:number;d:number},b:{n:number;d:number}){return a.n*b.d===b.n*a.d}
function fractionLabel(value:{n:number;d:number}){return `${value.n}/${value.d}`}

export default function CiudadFracciones3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[levelIndex,setLevelIndex]=useState(0)
 const[selected,setSelected]=useState<{n:number;d:number}>({n:0,d:1})
 const[buildNumerator,setBuildNumerator]=useState(levels[2].build?.start||0)
 const[message,setMessage]=useState('Observa la meta y representa la fracción antes de validar tu decisión.')
 const[attempts,setAttempts]=useState(0)
 const[completed,setCompleted]=useState<boolean[]>(levels.map(()=>false))
 const[ready,setReady]=useState(false)
 const level=levels[levelIndex]

 const displayFraction=useMemo(()=>level.kind==='build'?{n:buildNumerator,d:level.build?.denominator||1}:selected.n?selected:{n:0,d:4},[level,selected,buildNumerator])
 const solved=completed[levelIndex]

 function speak(text:string){
  if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.92;window.speechSynthesis.speak(utterance)
 }

 function choose(value:{n:number;d:number}){setSelected(value);setMessage(`Elegiste ${fractionLabel(value)}. Revisa la representación 3D y valida tu respuesta.`);if(audioEnabled)speak(`Elegiste ${value.n} de ${value.d}.`)}

 function validate(){
  setAttempts(value=>value+1)
  let ok=false
  if(level.kind==='equivalence')ok=sameFraction(selected,level.target)
  if(level.kind==='compare'&&level.compare){const [a,b]=level.compare;const greater=a.n/a.d>b.n/b.d?a:b;ok=sameFraction(selected,greater)}
  if(level.kind==='build')ok=buildNumerator===level.target.n
  if(ok){setCompleted(current=>current.map((value,index)=>index===levelIndex?true:value));const text=`Correcto. ${level.concept}`;setMessage(text);speak(text)}else{const text=level.kind==='build'?'Aún no coincide. Cuenta cuántos módulos están activos y compáralos con el numerador objetivo.':'Todavía no coincide. Compara cuánto del entero representa cada opción, no sólo sus números.';setMessage(text);speak(text)}
 }

 function next(){
  if(!solved)return
  if(levelIndex===levels.length-1){setMessage('Ciudad completada. Usaste equivalencia, comparación y construcción de fracciones en tres contextos distintos.');speak('Ciudad completada. Excelente trabajo con fracciones.');return}
  const nextIndex=levelIndex+1;setLevelIndex(nextIndex);setSelected({n:0,d:1});if(levels[nextIndex].kind==='build')setBuildNumerator(levels[nextIndex].build?.start||0);setMessage('Nuevo distrito desbloqueado. Observa la meta antes de actuar.')
 }

 function reset(){setSelected({n:0,d:1});if(level.kind==='build')setBuildNumerator(level.build?.start||0);setCompleted(current=>current.map((value,index)=>index===levelIndex?false:value));setMessage('Desafío reiniciado. Representa la fracción nuevamente.')}

 function sendToMission(){
  const draft={title:'Ciudad de las fracciones',description:'Experiencia 3D para representar, comparar y construir fracciones mediante equivalencias, comparación visual y composición de partes iguales.',experienceType:'game',sourceHref:'/juegos/ciudad-fracciones',supportProfile:'Representación visual 3D; alternativa textual; sin límite de tiempo; movimiento reducido; alto contraste; retroalimentación inmediata.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-ciudad-fracciones'}
  localStorage.setItem('yoyo-mission-draft',JSON.stringify(draft));window.location.href='/misiones?from=juego-ciudad-fracciones'
 }

 const target=level.target
 return <section className="fair-game-wrap" id="ciudad-fracciones">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Matemática · 4.º–7.º básico</span><h1>Ciudad de las fracciones</h1><p>Construye una ciudad por partes: representa fracciones equivalentes, compara cantidades y completa estructuras modulares usando razonamiento visual.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(`${level.brief} ${level.concept}`)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar desafío</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar</button><button className="btn btn-primary" onClick={sendToMission}><Gamepad2 size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{levels.map((item,index)=><div key={item.title} className={'level-step '+(index===levelIndex?'active ':'')+(completed[index]?'done ':'')+(index>levelIndex?'locked':'')}><span>{completed[index]?<CheckCircle2 size={17}/>:index+1}</span><div><b>{item.title}</b><small>{index===levelIndex?'Desafío activo':completed[index]?'Completado':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{level.title}</span><div className="hud-progress"><i style={{width:`${Math.round(((levelIndex+(solved?1:0))/levels.length)*100)}%`}}/></div><b>Meta {fractionLabel(target)}</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Ciudad tridimensional para representar fracciones"><ThreeFractionCity numerator={displayFraction.n} denominator={displayFraction.d} targetNumerator={target.n} targetDenominator={target.d} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Modelo fraccionario</strong><span>{ready?`${displayFraction.n}/${displayFraction.d} representado en edificios · objetivo ${target.n}/${target.d}`:'Cargando ciudad 3D…'}</span></div></div>
    <div className="feedback-box" role="status" aria-live="polite">{message}</div>
    <div className="accessibility-summary"><Building2 size={18}/><span>{level.concept}</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><Target size={14}/> Desafío matemático</span><h2>{level.brief}</h2>
    {level.kind==='equivalence'&&<div className="tool-row" aria-label="Opciones de fracciones equivalentes">{level.options?.map(option=><button key={fractionLabel(option)} className={`btn ${sameFraction(selected,option)?'btn-primary':'btn-soft'}`} onClick={()=>choose(option)}>{fractionLabel(option)}</button>)}</div>}
    {level.kind==='compare'&&<div className="tool-row" aria-label="Fracciones para comparar">{level.compare?.map(option=><button key={fractionLabel(option)} className={`btn ${sameFraction(selected,option)?'btn-primary':'btn-soft'}`} onClick={()=>choose(option)}>{fractionLabel(option)}</button>)}</div>}
    {level.kind==='build'&&<div className="insight"><b>Constructor modular</b><p>Activos: {buildNumerator} de {level.build?.denominator} módulos.</p><div className="tool-row"><button className="btn btn-soft" onClick={()=>setBuildNumerator(value=>Math.max(0,value-1))} disabled={buildNumerator<=0}>− 1 parte</button><button className="btn btn-soft" onClick={()=>setBuildNumerator(value=>Math.min(level.build?.denominator||8,value+1))} disabled={buildNumerator>=(level.build?.denominator||8)}>+ 1 parte</button></div></div>}
    <button className="btn btn-primary" onClick={validate} disabled={level.kind!=='build'&&!selected.n}><CheckCircle2 size={16}/>Validar representación</button>
    <div className="metric-grid"><div><strong>{displayFraction.n}/{displayFraction.d}</strong><span>representación</span></div><div><strong>{target.n}/{target.d}</strong><span>objetivo</span></div><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{completed.filter(Boolean).length}/3</strong><span>distritos</span></div></div>
    <div className="insight"><b>Apoyo visual</b><p>Los edificios activos representan el numerador. El total de edificios del distrito representa el denominador. La franja verde muestra la meta.</p></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{levelIndex===levels.length-1?'Finalizar ciudad':'Siguiente distrito'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
