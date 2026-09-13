'use client'

import {useState} from 'react'
import {ArrowRight,BookOpen,CheckCircle2,Gamepad2,Lightbulb,RotateCcw,Search,Speaker,Target} from 'lucide-react'
import ThreeStoryMuseum from './ThreeStoryMuseum'

type RoomId='narrador'|'conflicto'|'personajes'|'simbolos'
type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Room={
 id:RoomId
 title:string
 excerpt:string
 question:string
 options:Array<{id:string;label:string}>
 answer:string
 evidence:string
 explanation:string
}

const rooms:Room[]=[
 {id:'narrador',title:'Sala del narrador',excerpt:'“Vi cómo Emilia guardó la carta en su bolsillo. Quise preguntarle qué decía, pero seguí caminando a su lado sin decir nada.”',question:'¿Qué evidencia permite reconocer el tipo de narrador?',options:[{id:'a',label:'Cuenta lo que observa y participa usando primera persona.'},{id:'b',label:'Conoce todos los pensamientos de todos los personajes.'},{id:'c',label:'Sólo entrega datos científicos y objetivos.'}],answer:'a',evidence:'“Vi…”, “quise…” y “seguí…” muestran que quien narra participa en los hechos.',explanation:'La voz narrativa se identifica por las pistas del lenguaje y por cuánto sabe sobre los personajes, no sólo por memorizar una definición.'},
 {id:'conflicto',title:'Sala del conflicto',excerpt:'“El puente estaba cerrado por la crecida del río. Tomás debía entregar el medicamento antes del anochecer, pero el único camino alternativo demoraba tres horas.”',question:'¿Cuál es el conflicto central que mueve la acción?',options:[{id:'a',label:'Tomás no recuerda el nombre del medicamento.'},{id:'b',label:'Debe llegar a tiempo, pero un obstáculo bloquea la ruta directa.'},{id:'c',label:'El río es un personaje que quiere ganar una carrera.'}],answer:'b',evidence:'La meta de entregar el medicamento choca con el puente cerrado y el límite de tiempo.',explanation:'El conflicto aparece cuando una meta, necesidad o deseo encuentra un obstáculo que obliga a decidir o actuar.'},
 {id:'personajes',title:'Sala de personajes',excerpt:'“Amalia devolvió la billetera aun cuando nadie la había visto encontrarla. Después dijo: ‘No podría quedarme con algo que no es mío’.”',question:'¿Qué rasgo del personaje está mejor respaldado por la evidencia?',options:[{id:'a',label:'Es honesta, porque actúa correctamente incluso sin vigilancia.'},{id:'b',label:'Es impaciente, porque habla rápidamente.'},{id:'c',label:'Es temerosa, porque evita salir de su casa.'}],answer:'a',evidence:'Devuelve la billetera sin que nadie la obligue y explica que no tomaría algo ajeno.',explanation:'Un rasgo se justifica con acciones, decisiones, palabras o reacciones observables del personaje.'},
 {id:'simbolos',title:'Sala de símbolos',excerpt:'“Cada vez que Leo pensaba rendirse, miraba la pequeña brújula de su abuelo. No siempre señalaba el camino correcto, pero le recordaba por qué había comenzado el viaje.”',question:'¿Qué interpretación está mejor apoyada por el texto?',options:[{id:'a',label:'La brújula puede simbolizar orientación, propósito o recuerdo del abuelo.'},{id:'b',label:'La brújula demuestra que Leo puede predecir el futuro.'},{id:'c',label:'La brújula confirma que el viaje ocurre en otro planeta.'}],answer:'a',evidence:'Leo la mira cuando piensa rendirse y le recuerda el motivo de su viaje.',explanation:'Una interpretación simbólica debe conectarse con repeticiones, acciones y efectos dentro del texto; no basta con imaginar un significado.'},
]

const roomLabels:Record<RoomId,string>={narrador:'Narrador',conflicto:'Conflicto',personajes:'Personajes',simbolos:'Símbolos'}

export default function MuseoHistorias3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[index,setIndex]=useState(0)
 const[selected,setSelected]=useState('')
 const[collected,setCollected]=useState<RoomId[]>([])
 const[attempts,setAttempts]=useState(0)
 const[message,setMessage]=useState('Lee el fragmento, busca evidencia y elige la interpretación mejor respaldada.')
 const[ready,setReady]=useState(false)
 const room=rooms[index]
 const solved=collected.includes(room.id)

 function speak(text:string){if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CL';u.rate=.9;window.speechSynthesis.speak(u)}
 function validate(){if(!selected)return;setAttempts(value=>value+1);if(selected===room.answer){setCollected(current=>current.includes(room.id)?current:[...current,room.id]);const text=`Evidencia reunida. ${room.evidence} ${room.explanation}`;setMessage(text);speak(text)}else{const text='La interpretación elegida no está suficientemente respaldada por el fragmento. Vuelve al texto y busca una acción, palabra o detalle concreto.';setMessage(text);speak(text)}}
 function next(){if(!solved)return;if(index===rooms.length-1){setMessage('Investigación completa. Reuniste evidencias sobre narrador, conflicto, personajes y símbolos para construir interpretaciones respaldadas por el texto.');speak('Museo completado. Has construido interpretaciones usando evidencia textual.');return}setIndex(value=>value+1);setSelected('');setMessage('Nueva sala abierta. Examina primero el fragmento antes de decidir.')}
 function reset(){setIndex(0);setSelected('');setCollected([]);setAttempts(0);setMessage('Museo reiniciado. Comienza la investigación en la Sala del narrador.')}
 function sendToMission(){const draft={title:'Museo de las historias',description:'Investigación narrativa 3D para analizar narrador, conflicto, rasgos de personajes y símbolos mediante fragmentos y evidencia textual.',experienceType:'game',sourceHref:'/juegos/museo-historias',supportProfile:'Fragmentos breves; lectura en voz alta opcional; evidencia explícita; alto contraste; movimiento reducido; sin límite de tiempo; alternativa textual completa.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-museo-historias'};localStorage.setItem('yoyo-mission-draft',JSON.stringify(draft));window.location.href='/misiones?from=juego-museo-historias'}

 return <section className="fair-game-wrap" id="museo-historias">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Lenguaje · 5.º básico–2.º medio</span><h1>Museo de las historias</h1><p>Recorre cuatro salas narrativas. Cada pieza del museo exige encontrar una pista concreta del texto y usarla para justificar una interpretación.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(`${room.excerpt} ${room.question}`)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar fragmento</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar museo</button><button className="btn btn-primary" onClick={sendToMission}><Gamepad2 size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{rooms.map((item,roomIndex)=><div key={item.id} className={'level-step '+(roomIndex===index?'active ':'')+(collected.includes(item.id)?'done ':'')+(roomIndex>index?'locked':'')}><span>{collected.includes(item.id)?<CheckCircle2 size={17}/>:roomIndex+1}</span><div><b>{roomLabels[item.id]}</b><small>{collected.includes(item.id)?'Evidencia reunida':roomIndex===index?'Sala activa':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{room.title}</span><div className="hud-progress"><i style={{width:`${Math.round((collected.length/rooms.length)*100)}%`}}/></div><b>{collected.length}/4 evidencias</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Museo tridimensional de análisis narrativo"><ThreeStoryMuseum activeRoom={room.id} collected={collected} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Investigación narrativa</strong><span>{ready?`Sala: ${roomLabels[room.id]} · ${collected.length} evidencias reunidas`:'Cargando museo 3D…'}</span></div></div>
    <div className="feedback-box" role="status" aria-live="polite">{message}</div>
    <div className="accessibility-summary"><BookOpen size={18}/><span>La escena 3D es complementaria: todo fragmento, pregunta y evidencia también aparece por escrito y puede escucharse.</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><Search size={14}/> Examina la pieza</span><div className="insight"><b>Fragmento</b><p>“{room.excerpt.replace(/^“|”$/g,'')}”</p></div><h2>{room.question}</h2>
    <div className="answer-stack">{room.options.map(option=><button key={option.id} onClick={()=>setSelected(option.id)} className={'answer-card '+(selected===option.id?'selected':'')}>{option.label}</button>)}</div>
    <button className="btn btn-primary" onClick={validate} disabled={!selected}><Target size={16}/>Comprobar con evidencia</button>
    <div className="metric-grid"><div><strong>{collected.length}/4</strong><span>salas</span></div><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{selected?selected.toUpperCase():'—'}</strong><span>hipótesis</span></div><div><strong>{solved?'Sí':'No'}</strong><span>evidencia</span></div></div>
    <div className="insight"><b><Lightbulb size={14}/> Criterio de interpretación</b><p>{solved?room.evidence:'Una respuesta sólida debe poder señalar una pista concreta del fragmento que la sostenga.'}</p></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{index===rooms.length-1?'Cerrar investigación':'Entrar a la siguiente sala'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
