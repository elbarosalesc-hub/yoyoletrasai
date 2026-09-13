'use client'

import {useEffect,useMemo,useState} from 'react'
import {CheckCircle2,RotateCcw,Volume2,VolumeX} from 'lucide-react'
import ThreeWordFarm from './ThreeWordFarm'

type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Level={name:string;phoneme:string;instruction:string;target:string;choices:Array<{id:string;word:string}>;syllables:string[];distractors:string[]}

const levels:Level[]=[
 {name:'Sonido M',phoneme:'m',instruction:'Escucha el sonido /m/ y encuentra la palabra que comienza con ese sonido.',target:'manzana',choices:[{id:'manzana',word:'manzana'},{id:'pato',word:'pato'},{id:'sol',word:'sol'}],syllables:['MAN','ZA','NA'],distractors:['PA','SO']},
 {name:'Sonido P',phoneme:'p',instruction:'Escucha el sonido /p/ y encuentra la palabra que comienza con ese sonido.',target:'pato',choices:[{id:'vaca',word:'vaca'},{id:'pato',word:'pato'},{id:'gato',word:'gato'}],syllables:['PA','TO'],distractors:['GA','VA']},
 {name:'Sonido G',phoneme:'g',instruction:'Escucha el sonido /g/ y encuentra la palabra que comienza con ese sonido.',target:'gato',choices:[{id:'gato',word:'gato'},{id:'vaca',word:'vaca'},{id:'sol',word:'sol'}],syllables:['GA','TO'],distractors:['SO','PA']},
]

function speak(text:string){
 if(typeof window==='undefined'||!('speechSynthesis'in window))return
 window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.78;window.speechSynthesis.speak(utterance)
}

export default function GranjaPalabras3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[level,setLevel]=useState(0),[selected,setSelected]=useState(''),[built,setBuilt]=useState<string[]>([]),[attempts,setAttempts]=useState(0),[message,setMessage]=useState('Escucha, observa y encuentra la palabra que corresponde al sonido.'),[ready,setReady]=useState(false),[sound,setSound]=useState(audioEnabled)
 const current=levels[level]
 useEffect(()=>setSound(audioEnabled),[audioEnabled])
 const targetWord=current.target.toUpperCase()
 const builtWord=built.join('')
 const objectCorrect=selected===current.target
 const wordCorrect=objectCorrect&&builtWord===targetWord
 const available=useMemo(()=>[...current.syllables,...current.distractors].sort((a,b)=>a.localeCompare(b)),[current])
 const selectWord=(id:string,word:string)=>{setAttempts(value=>value+1);setSelected(id);setBuilt([]);const ok=id===current.target;const feedback=ok?`${word} comienza con el sonido ${current.phoneme}. Ahora construye la palabra.`:`${word} no comienza con ${current.phoneme}. Escucha otra vez y compara el primer sonido.`;setMessage(feedback);if(sound)speak(`${word}. ${feedback}`)}
 const addSyllable=(syllable:string)=>{if(!objectCorrect)return;const next=[...built,syllable];setBuilt(next);const partial=next.join('');if(!targetWord.startsWith(partial)){setMessage('Esa sílaba no continúa la palabra. Puedes retirarla y probar otra.');if(sound)speak('Prueba otra sílaba.')}else if(partial===targetWord){setMessage(`¡${current.target}! Uniste los sonidos y construiste la palabra completa.`);if(sound)speak(`${current.target}. Palabra completa.`)}else setMessage(`Bien. Has construido ${partial.toLowerCase()}. Busca la sílaba que sigue.`)}
 const removeLast=()=>setBuilt(value=>value.slice(0,-1))
 const next=()=>{if(!wordCorrect)return;if(level<levels.length-1){setLevel(value=>value+1);setSelected('');setBuilt([]);setMessage('Nuevo corral: escucha un sonido inicial diferente.')}else setMessage('Misión completa. Reconociste sonidos iniciales y construiste tres palabras por sílabas.')}
 const reset=()=>{setLevel(0);setSelected('');setBuilt([]);setAttempts(0);setMessage('Misión reiniciada. Escucha el primer sonido.')}
 const listen=()=>{if(sound)speak(`${current.instruction} Sonido ${current.phoneme}. ${current.phoneme}.`);else setMessage('Activa el audio para escuchar el modelo. La instrucción escrita sigue disponible.')}
 return <section className="fair-game-wrap" id="granja-palabras">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Lenguaje · Kínder–2.º básico</span><h1>Granja de palabras</h1><p>Escucha sonidos iniciales, encuentra el objeto correcto y construye palabras con sílabas. La misión combina conciencia fonológica, lectura inicial y apoyo auditivo.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>setSound(value=>!value)}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}{sound?'Audio activo':'Audio desactivado'}</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar</button></div></div>
  <div className="level-rail">{levels.map((item,index)=><div key={item.name} className={'level-step '+(index===level?'active ':'')+(index<level?'done ':'')+(index>level?'locked':'')}><span>{index<level?<CheckCircle2 size={17}/>:index+1}</span><div><b>{item.name}</b><small>{index<level?'Completado':index===level?'En curso':'Por desbloquear'}</small></div></div>)}</div>
  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card"><div className="game-hud"><span>Nivel {level+1}: {current.name}</span><div className="hud-progress"><i style={{width:`${wordCorrect?100:objectCorrect?55:15}%`}}/></div><b>{builtWord||'—'}</b></div><div className="three-stage premium-webgl-scene" role="application" aria-label="Granja de palabras tridimensional con alternativa textual"><ThreeWordFarm reducedMotion={reducedMotion} highContrast={highContrast} focusId={selected} onReady={setReady}/><div className="scene-guide-label"><strong>Granja fonológica</strong><span>{ready?'Escena 3D activa. Usa también las tarjetas textuales para responder.':'Cargando escena…'}</span></div></div>
    <div className="accessible-object-list" aria-label="Palabras disponibles">{current.choices.map((choice,index)=><button key={choice.id} onClick={()=>selectWord(choice.id,choice.word)} aria-pressed={selected===choice.id}><span>{index+1}</span>{choice.word}{selected===choice.id?' · seleccionada':''}</button>)}</div>
   </section>
   <aside className="panel challenge-panel"><span className="eyebrow">Conciencia fonológica</span><h2>{current.instruction}</h2><button className="btn btn-soft" onClick={listen}><Volume2 size={17}/>Escuchar modelo</button><div className="feedback-box" role="status" aria-live="polite">{message}</div>{objectCorrect?<><h3>Construye: {current.target}</h3><div className="answer-stack" aria-label="Sílabas disponibles">{available.map((syllable,index)=><button key={`${syllable}-${index}`} className="answer-card" onClick={()=>addSyllable(syllable)}>{syllable}</button>)}</div><div className="insight"><b>Tu palabra</b><p style={{fontSize:26,letterSpacing:3,margin:'6px 0'}}>{builtWord||'…'}</p><button className="btn btn-soft" disabled={!built.length} onClick={removeLast}>Quitar última sílaba</button></div></>:null}<button className="btn btn-primary next-level" disabled={!wordCorrect} onClick={next}>{level===levels.length-1?'Finalizar misión':'Siguiente sonido'}</button><div className="metric-grid"><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{level+1}/3</strong><span>progresión</span></div><div><strong>{sound?'Sí':'No'}</strong><span>audio</span></div><div><strong>Sin tiempo</strong><span>ritmo</span></div></div><div className="accessibility-summary"><span>DUA:</span><span>audio opcional, palabra escrita, escena 3D, botones textuales, sin límite de tiempo, movimiento reducido y alto contraste.</span></div></aside>
  </div>
 </section>
}
