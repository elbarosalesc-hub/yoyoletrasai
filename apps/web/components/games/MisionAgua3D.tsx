'use client'

import { useMemo, useState } from 'react'
import ThreeWaterCity from './ThreeWaterCity'

type Props={reducedMotion?:boolean;highContrast?:boolean}
type Action={id:string;label:string;water:number;impact:number;note:string}

const actions:Action[]=[
 {id:'ducha',label:'Reducir duchas largas',water:22,impact:3,note:'Reduce consumo doméstico sin afectar una necesidad esencial.'},
 {id:'fuga',label:'Reparar fuga de la red',water:34,impact:4,note:'Evita pérdida constante de agua potable en la distribución.'},
 {id:'riego',label:'Regar áreas verdes al mediodía',water:-18,impact:-2,note:'Aumenta evaporación y desperdicia agua.'},
 {id:'lluvia',label:'Recolectar agua lluvia',water:18,impact:3,note:'Permite usar agua no potable en tareas apropiadas.'},
 {id:'rio',label:'Verter residuos al río',water:-30,impact:-5,note:'Contamina la fuente y aumenta la dificultad de tratamiento.'},
 {id:'educacion',label:'Campaña de consumo responsable',water:12,impact:2,note:'Mejora decisiones de la comunidad y reduce consumo innecesario.'},
]

const levels=[
 {name:'Detectar pérdidas',target:45,minImpact:5,goal:'Elige decisiones que permitan recuperar al menos 45 puntos de agua sin dañar el ecosistema.'},
 {name:'Equilibrar la ciudad',target:70,minImpact:8,goal:'Combina medidas para lograr 70 puntos de agua y un impacto ambiental positivo de al menos 8.'},
 {name:'Plan de resiliencia',target:85,minImpact:10,goal:'Construye un plan integral que alcance 85 puntos de agua y 10 de impacto positivo.'},
]

export default function MisionAgua3D({reducedMotion=false,highContrast=false}:Props){
 const[level,setLevel]=useState(0),[selected,setSelected]=useState<string[]>([]),[attempts,setAttempts]=useState(0),[message,setMessage]=useState('Explora las decisiones posibles y protege el suministro de la ciudad.'),[ready,setReady]=useState(false)
 const current=levels[level]
 const totals=useMemo(()=>selected.reduce((acc,id)=>{const action=actions.find(item=>item.id===id);return {water:acc.water+(action?.water||0),impact:acc.impact+(action?.impact||0)}},{water:0,impact:0}),[selected])
 const solved=totals.water>=current.target&&totals.impact>=current.minImpact
 const toggle=(id:string)=>{setSelected(prev=>prev.includes(id)?prev.filter(item=>item!==id):[...prev,id]);const action=actions.find(item=>item.id===id);if(action)setMessage(action.note)}
 const check=()=>{setAttempts(value=>value+1);if(solved)setMessage('Plan viable: recuperaste agua y mantuviste un impacto ambiental positivo.');else if(totals.impact<current.minImpact)setMessage('El suministro mejora, pero algunas decisiones dañan el ecosistema. Cambia las acciones de impacto negativo.');else setMessage(`Aún faltan ${Math.max(0,current.target-totals.water)} puntos de recuperación de agua.`)}
 const next=()=>{if(!solved)return;if(level<levels.length-1){setLevel(value=>value+1);setSelected([]);setMessage('Nuevo nivel: ahora debes equilibrar más variables al mismo tiempo.')}else setMessage('Misión completa: diseñaste un plan de uso responsable y resiliencia hídrica.')}
 const reset=()=>{setLevel(0);setSelected([]);setAttempts(0);setMessage('Misión reiniciada.')}
 return <section className="fair-game-wrap" id="mision-agua">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Ciencias · 5°–7° básico</span><h2>Misión Agua</h2><p>Gestiona una ciudad sostenible: identifica pérdidas, protege fuentes y equilibra consumo, tratamiento y ambiente.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={reset}>Reiniciar</button></div></div>
  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card"><div className="game-hud"><span>{current.name}</span><div className="hud-progress"><i style={{width:`${Math.min(100,Math.round(totals.water/current.target*100))}%`}}/></div><b>{totals.water} agua</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Ciudad sostenible tridimensional con alternativa accesible"><ThreeWaterCity reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Ciudad sostenible</strong><span>{ready?'Escena 3D activa. Decide cómo recuperar el suministro.':'Cargando escena accesible…'}</span></div></div>
    <div className="accessible-object-list" aria-label="Decisiones disponibles">{actions.map((action,index)=><button key={action.id} onClick={()=>toggle(action.id)} aria-pressed={selected.includes(action.id)}><span>{index+1}</span>{action.label} · agua {action.water>0?'+':''}{action.water} · ambiente {action.impact>0?'+':''}{action.impact}{selected.includes(action.id)?' seleccionado':''}</button>)}</div>
   </section>
   <aside className="panel challenge-panel"><span className="eyebrow">Nivel {level+1} de {levels.length}</span><h2>{current.goal}</h2><div className="metric-grid"><div><strong>{totals.water}</strong><span>agua recuperada</span></div><div><strong>{totals.impact}</strong><span>impacto ambiental</span></div><div><strong>{selected.length}</strong><span>decisiones</span></div><div><strong>{attempts}</strong><span>intentos</span></div></div><button className="btn btn-primary next-level" onClick={check}>Evaluar plan</button><button className="btn btn-coral next-level" disabled={!solved} onClick={next}>{level===levels.length-1?'Finalizar misión':'Siguiente desafío'}</button><div className="feedback-box" role="status" aria-live="polite">{message}</div><div className="accessibility-summary"><span>DUA:</span><span>escena 3D + decisiones textuales, sin límite de tiempo, alto contraste y movimiento reducido.</span></div><div className="difficulty-note"><span>Ciencia aplicada:</span><span>la progresión exige pasar de una medida aislada a un sistema de decisiones con consecuencias.</span></div></aside>
  </div>
 </section>
}
