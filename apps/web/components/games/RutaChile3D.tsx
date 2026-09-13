'use client'

import {useState} from 'react'
import {ArrowRight,CheckCircle2,Compass,MapPinned,RotateCcw,Speaker,Stamp,Target} from 'lucide-react'
import ThreeChileRoute from './ThreeChileRoute'

type ZoneId='norte'|'centro'|'sur'|'austral'
type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Stop={zone:ZoneId;title:string;clue:string;explanation:string;options:Array<{id:ZoneId;label:string}>}

const zoneLabels:Record<ZoneId,string>={norte:'Norte',centro:'Centro',sur:'Sur',austral:'Austral'}
const stops:Stop[]=[
 {zone:'norte',title:'Escala 1 · Territorio árido',clue:'Tu expedición necesita observar uno de los paisajes más áridos del planeta y grandes extensiones desérticas. ¿Qué macrozona debes visitar?',explanation:'La zona norte de Chile reúne paisajes desérticos y condiciones de gran aridez. La ubicación explica diferencias de clima, vegetación y formas de ocupación del territorio.',options:[{id:'norte',label:'Norte'},{id:'centro',label:'Centro'},{id:'sur',label:'Sur'}]},
 {zone:'centro',title:'Escala 2 · Valles y clima mediterráneo',clue:'Debes investigar valles centrales y un clima mediterráneo con estaciones marcadas. ¿Qué destino corresponde mejor?',explanation:'La zona central presenta amplios valles y, en gran parte de su territorio, condiciones de clima mediterráneo. Es una zona muy urbanizada y agrícola.',options:[{id:'austral',label:'Austral'},{id:'centro',label:'Centro'},{id:'norte',label:'Norte'}]},
 {zone:'sur',title:'Escala 3 · Bosques y lluvias',clue:'La misión busca bosques templados, numerosos lagos y mayor presencia de precipitaciones. ¿Hacia dónde viajas?',explanation:'El sur se caracteriza por abundante vegetación, bosques, lagos y mayor pluviosidad que las zonas norte y central.',options:[{id:'centro',label:'Centro'},{id:'sur',label:'Sur'},{id:'norte',label:'Norte'}]},
 {zone:'austral',title:'Escala 4 · Canales y hielos',clue:'Tu última expedición debe observar fiordos, canales, archipiélagos y grandes masas de hielo. ¿Qué macrozona eliges?',explanation:'La zona austral destaca por su relieve fragmentado, canales, fiordos, archipiélagos y extensas áreas de hielo y montaña.',options:[{id:'sur',label:'Sur'},{id:'norte',label:'Norte'},{id:'austral',label:'Austral'}]},
]

export default function RutaChile3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[index,setIndex]=useState(0)
 const[selected,setSelected]=useState<ZoneId|null>(null)
 const[completed,setCompleted]=useState<ZoneId[]>([])
 const[attempts,setAttempts]=useState(0)
 const[message,setMessage]=useState('Lee la pista territorial y elige el destino antes de sellar tu pasaporte.')
 const[ready,setReady]=useState(false)
 const stop=stops[index]
 const solved=completed.includes(stop.zone)

 function speak(text:string){if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CL';u.rate=.92;window.speechSynthesis.speak(u)}
 function choose(zone:ZoneId){setSelected(zone);setMessage(`Destino seleccionado: ${zoneLabels[zone]}. Ahora justifica tu decisión revisando la pista y confirma.`);speak(`Destino seleccionado: ${zoneLabels[zone]}.`)}
 function validate(){
  if(!selected)return
  setAttempts(value=>value+1)
  if(selected===stop.zone){setCompleted(current=>current.includes(stop.zone)?current:[...current,stop.zone]);setMessage(`Sello obtenido. ${stop.explanation}`);speak(`Correcto. ${stop.explanation}`)}
  else{const text='Ese destino no coincide con todas las pistas. Compara clima, relieve y paisaje antes de volver a decidir.';setMessage(text);speak(text)}
 }
 function next(){if(!solved)return;if(index===stops.length-1){setMessage('Pasaporte completo. Recorriste cuatro macrozonas relacionando ubicación, clima y paisaje.');speak('Pasaporte completo. Ruta por Chile finalizada.');return}setIndex(value=>value+1);setSelected(null);setMessage('Nueva escala desbloqueada. Usa las pistas territoriales para orientar el viaje.')}
 function reset(){setIndex(0);setSelected(null);setCompleted([]);setAttempts(0);setMessage('Ruta reiniciada. Comienza por la primera escala territorial.')}
 function sendToMission(){const draft={title:'Ruta por Chile',description:'Experiencia 3D para recorrer macrozonas de Chile y relacionar ubicación, clima, relieve y paisaje mediante decisiones de viaje y un pasaporte geográfico.',experienceType:'game',sourceHref:'/juegos/ruta-chile',supportProfile:'Mapa 3D estilizado; descripción textual; audio opcional; alto contraste; movimiento reducido; sin límite de tiempo; retroalimentación geográfica.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-ruta-chile'};localStorage.setItem('yoyo-mission-draft',JSON.stringify(draft));window.location.href='/misiones?from=juego-ruta-chile'}

 return <section className="fair-game-wrap" id="ruta-chile">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Historia y Geografía · 2.º–6.º básico</span><h1>Ruta por Chile</h1><p>Viaja por macrozonas, interpreta pistas de clima y paisaje, decide destinos y completa un pasaporte geográfico. La mecánica central es orientación territorial, no preguntas aisladas.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(`${stop.clue} ${stop.explanation}`)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar pista</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar ruta</button><button className="btn btn-primary" onClick={sendToMission}><MapPinned size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{stops.map((item,stopIndex)=><div key={item.zone} className={'level-step '+(stopIndex===index?'active ':'')+(completed.includes(item.zone)?'done ':'')+(stopIndex>index?'locked':'')}><span>{completed.includes(item.zone)?<CheckCircle2 size={17}/>:stopIndex+1}</span><div><b>{zoneLabels[item.zone]}</b><small>{completed.includes(item.zone)?'Pasaporte sellado':stopIndex===index?'Escala activa':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{stop.title}</span><div className="hud-progress"><i style={{width:`${Math.round((completed.length/stops.length)*100)}%`}}/></div><b>{completed.length}/4 sellos</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Mapa tridimensional estilizado de las macrozonas de Chile"><ThreeChileRoute activeZone={selected||stop.zone} completed={completed} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Pasaporte geográfico</strong><span>{ready?`Destino en mapa: ${zoneLabels[selected||stop.zone]} · ${completed.length} zonas completadas`:'Cargando mapa 3D…'}</span></div></div>
    <div className="feedback-box" role="status" aria-live="polite">{message}</div>
    <div className="accessibility-summary"><Compass size={18}/><span>El mapa 3D se acompaña siempre de nombres de macrozonas y explicaciones textuales; no necesitas interpretar sólo color o forma.</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><Target size={14}/> Orientación territorial</span><h2>{stop.clue}</h2>
    <div className="answer-stack">{stop.options.map(option=><button key={option.id} onClick={()=>choose(option.id)} className={'answer-card '+(selected===option.id?'selected':'')}>{option.label}</button>)}</div>
    <button className="btn btn-primary" onClick={validate} disabled={!selected}><Stamp size={16}/>Sellar destino</button>
    <div className="metric-grid"><div><strong>{completed.length}/4</strong><span>macrozonas</span></div><div><strong>{attempts}</strong><span>decisiones</span></div><div><strong>{selected?zoneLabels[selected]:'—'}</strong><span>destino</span></div><div><strong>{solved?'Sí':'No'}</strong><span>sello actual</span></div></div>
    <div className="insight"><b>Explica tu ruta</b><p>{solved?stop.explanation:'Relaciona la pista con clima, relieve y paisaje. El nombre de la zona por sí solo no basta: usa sus características.'}</p></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{index===stops.length-1?'Finalizar pasaporte':'Viajar a la siguiente escala'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
