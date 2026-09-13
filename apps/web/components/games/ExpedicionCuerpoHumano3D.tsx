'use client'

import {useState} from 'react'
import {Activity,ArrowRight,CheckCircle2,Gamepad2,HeartPulse,Lightbulb,RotateCcw,Speaker,Stethoscope} from 'lucide-react'
import ThreeHumanBodyExpedition from './ThreeHumanBodyExpedition'

type SystemId='respiratorio'|'circulatorio'|'digestivo'|'integracion'
type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Stage={id:SystemId;title:string;incident:string;question:string;options:Array<{id:string;label:string}>;answer:string;evidence:string;explanation:string}

const stages:Stage[]=[
 {id:'respiratorio',title:'Estación respiratoria',incident:'Después de correr, una estudiante respira más rápido y profundo.',question:'¿Qué explicación relaciona mejor estructura y función?',options:[{id:'a',label:'Los pulmones permiten el intercambio de gases y una respiración más intensa ayuda a incorporar más oxígeno.'},{id:'b',label:'Los pulmones empujan directamente la sangre por todo el cuerpo.'},{id:'c',label:'El estómago controla la entrada de aire a los pulmones.'}],answer:'a',evidence:'La ventilación lleva aire a los pulmones, donde ocurre intercambio de oxígeno y dióxido de carbono.',explanation:'El sistema respiratorio incorpora oxígeno y elimina dióxido de carbono. La frecuencia respiratoria puede aumentar cuando el cuerpo demanda más oxígeno.'},
 {id:'circulatorio',title:'Estación circulatoria',incident:'El oxígeno ya entró al cuerpo y debe llegar a músculos y otros tejidos.',question:'¿Qué recorrido explica mejor ese transporte?',options:[{id:'a',label:'El corazón impulsa sangre por vasos; la sangre transporta oxígeno hacia los tejidos.'},{id:'b',label:'Los pulmones envían el oxígeno por los huesos hasta cada músculo.'},{id:'c',label:'El intestino bombea sangre porque absorbe nutrientes.'}],answer:'a',evidence:'Corazón, vasos y sangre trabajan juntos para distribuir sustancias por el organismo.',explanation:'El corazón actúa como bomba y los vasos forman una red de transporte. La sangre distribuye oxígeno y nutrientes y recoge sustancias de desecho.'},
 {id:'digestivo',title:'Estación digestiva',incident:'Antes de la actividad física, la persona comió alimentos que aportan nutrientes.',question:'¿Qué función cumple el sistema digestivo en esta situación?',options:[{id:'a',label:'Transforma los alimentos y permite absorber nutrientes que luego pueden ser transportados por la sangre.'},{id:'b',label:'Convierte directamente el alimento en oxígeno dentro de los pulmones.'},{id:'c',label:'Controla los movimientos voluntarios desde el estómago.'}],answer:'a',evidence:'La digestión descompone alimentos y el intestino participa en la absorción de nutrientes.',explanation:'El sistema digestivo procesa los alimentos para obtener moléculas que el organismo puede absorber y utilizar.'},
 {id:'integracion',title:'Centro de integración',incident:'Para correr, respirar, transportar oxígeno y usar nutrientes, varios sistemas deben coordinarse.',question:'¿Cuál afirmación muestra mejor esa integración?',options:[{id:'a',label:'Los sistemas trabajan de forma aislada; cada uno funciona sin depender de los demás.'},{id:'b',label:'Respiratorio, circulatorio, digestivo y sistema nervioso coordinan funciones para responder a las necesidades del cuerpo.'},{id:'c',label:'Sólo el sistema circulatorio explica todas las respuestas del organismo.'}],answer:'b',evidence:'El organismo funciona como un sistema: intercambio gaseoso, transporte, obtención de nutrientes y coordinación se relacionan.',explanation:'Comprender el cuerpo requiere conectar sistemas. Una actividad cotidiana activa relaciones entre órganos y funciones, no procesos completamente separados.'},
]

const labels:Record<SystemId,string>={respiratorio:'Respiratorio',circulatorio:'Circulatorio',digestivo:'Digestivo',integracion:'Integración'}

export default function ExpedicionCuerpoHumano3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[index,setIndex]=useState(0)
 const[selected,setSelected]=useState('')
 const[completed,setCompleted]=useState<SystemId[]>([])
 const[attempts,setAttempts]=useState(0)
 const[message,setMessage]=useState('Analiza el incidente y conecta cada estructura con su función antes de decidir.')
 const[ready,setReady]=useState(false)
 const stage=stages[index]
 const solved=completed.includes(stage.id)

 function speak(text:string){if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.9;window.speechSynthesis.speak(utterance)}
 function validate(){if(!selected)return;setAttempts(value=>value+1);if(selected===stage.answer){setCompleted(current=>current.includes(stage.id)?current:[...current,stage.id]);const text=`Sistema estabilizado. ${stage.evidence} ${stage.explanation}`;setMessage(text);speak(text)}else{const text='La respuesta no conecta correctamente estructura y función. Revisa qué órgano participa y qué proceso realiza.';setMessage(text);speak(text)}}
 function next(){if(!solved)return;if(index===stages.length-1){const text='Expedición completa. Relacionaste respiración, circulación, digestión y coordinación para explicar cómo coopera el organismo.';setMessage(text);speak(text);return}setIndex(value=>value+1);setSelected('');setMessage('Nueva estación abierta. Observa el sistema y analiza el incidente antes de responder.')}
 function reset(){setIndex(0);setSelected('');setCompleted([]);setAttempts(0);setMessage('Expedición reiniciada. Comienza por el sistema respiratorio.')}
 function sendToMission(){const draft={title:'Expedición cuerpo humano',description:'Experiencia 3D para relacionar estructuras y funciones de sistemas corporales mediante incidentes cotidianos y explicaciones causales.',experienceType:'game',sourceHref:'/juegos/cuerpo-humano',supportProfile:'Capas visuales; narración opcional; alternativa textual completa; alto contraste; movimiento reducido; sin límite de tiempo; retroalimentación causal.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-cuerpo-humano'};localStorage.setItem('yoyo-mission-draft',JSON.stringify(draft));window.location.href='/misiones?from=juego-cuerpo-humano'}

 return <section className="fair-game-wrap" id="cuerpo-humano">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Ciencias · 5.º–8.º básico</span><h1>Expedición cuerpo humano</h1><p>Explora sistemas corporales, resuelve incidentes y construye explicaciones que relacionan órganos, funciones y cooperación entre sistemas.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(`${stage.incident} ${stage.question}`)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar desafío</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar</button><button className="btn btn-primary" onClick={sendToMission}><Gamepad2 size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{stages.map((item,stageIndex)=><div key={item.id} className={'level-step '+(stageIndex===index?'active ':'')+(completed.includes(item.id)?'done ':'')+(stageIndex>index?'locked':'')}><span>{completed.includes(item.id)?<CheckCircle2 size={17}/>:stageIndex+1}</span><div><b>{labels[item.id]}</b><small>{completed.includes(item.id)?'Sistema explicado':stageIndex===index?'Estación activa':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{stage.title}</span><div className="hud-progress"><i style={{width:`${Math.round((completed.length/stages.length)*100)}%`}}/></div><b>{completed.length}/4 sistemas</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Exploración anatómica tridimensional"><ThreeHumanBodyExpedition activeSystem={stage.id} completed={completed} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Escáner corporal</strong><span>{ready?`Sistema activo: ${labels[stage.id]} · ${completed.length} etapas completadas`:'Cargando exploración 3D…'}</span></div></div>
    <div className="feedback-box" role="status" aria-live="polite">{message}</div>
    <div className="accessibility-summary"><Stethoscope size={18}/><span>El modelo 3D es un apoyo visual educativo y simplificado. Toda la información necesaria para resolver el desafío aparece también por escrito.</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><HeartPulse size={14}/> Incidente del sistema</span><div className="insight"><b>Situación</b><p>{stage.incident}</p></div><h2>{stage.question}</h2>
    <div className="answer-stack">{stage.options.map(option=><button key={option.id} onClick={()=>setSelected(option.id)} className={'answer-card '+(selected===option.id?'selected':'')}>{option.label}</button>)}</div>
    <button className="btn btn-primary" onClick={validate} disabled={!selected}><Activity size={16}/>Comprobar relación</button>
    <div className="metric-grid"><div><strong>{completed.length}/4</strong><span>sistemas</span></div><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{selected?selected.toUpperCase():'—'}</strong><span>hipótesis</span></div><div><strong>{solved?'Sí':'No'}</strong><span>relación</span></div></div>
    <div className="insight"><b><Lightbulb size={14}/> Evidencia funcional</b><p>{solved?stage.evidence:'Busca siempre dos partes: qué estructura participa y qué función realiza en la situación.'}</p></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{index===stages.length-1?'Cerrar expedición':'Ir al siguiente sistema'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
