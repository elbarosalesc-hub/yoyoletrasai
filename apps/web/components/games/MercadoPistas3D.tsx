'use client'

import {useState} from 'react'
import {ArrowRight,CheckCircle2,Gamepad2,Lightbulb,MapPinned,RotateCcw,Search,Speaker,Store} from 'lucide-react'
import {ThreeClueMarket} from './ThreeClueMarket'

type Props={reducedMotion?:boolean;highContrast?:boolean;audioEnabled?:boolean}
type Mission={title:string;person:string;goal:string;clues:Array<{id:string;source:string;text:string}>;question:string;options:Array<{id:string;label:string}>;answer:string;explanation:string}

const missions:Mission[]=[
 {title:'El encargo de Martina',person:'Martina',goal:'Encontrar qué necesita para preparar una colación para su curso.',clues:[{id:'a',source:'Lista de Martina',text:'“Necesito algo que podamos repartir en partes iguales y que no requiera cubiertos.”'},{id:'b',source:'Cartel de la frutería',text:'“Manzanas y mandarinas: se venden por unidad.”'},{id:'c',source:'Diálogo del panadero',text:'“Estos pancitos vienen en bandejas de 12 y se pueden rellenar.”'}],question:'¿A qué puesto conviene ir primero?',options:[{id:'a',label:'A la panadería, porque una bandeja de 12 facilita repartir una unidad a cada estudiante.'},{id:'b',label:'A cualquier puesto; las pistas no permiten decidir.'},{id:'c',label:'A la ferretería, porque allí venden objetos resistentes.'}],answer:'a',explanation:'La pista decisiva es la bandeja de 12 panes y el objetivo de repartir sin cubiertos. La inferencia conecta necesidad + cantidad + formato.'},
 {title:'La compra de don Luis',person:'Don Luis',goal:'Deducir qué producto busca sin que lo nombre directamente.',clues:[{id:'a',source:'Don Luis',text:'“Quiero algo para una ensalada. Es rojo, redondo y se puede cortar en rodajas.”'},{id:'b',source:'Puesto de verduras',text:'“Hoy hay tomates, lechugas, zanahorias y cebollas.”'},{id:'c',source:'Puesto de flores',text:'“Rosas rojas y claveles para decorar.”'}],question:'¿Qué producto busca don Luis?',options:[{id:'a',label:'Tomates.'},{id:'b',label:'Rosas.'},{id:'c',label:'Zanahorias.'}],answer:'a',explanation:'“Rojo, redondo, para ensalada y en rodajas” coincide con tomate. El color solo no basta: hay que usar todas las pistas.'},
 {title:'El puesto correcto',person:'Sofía',goal:'Elegir dónde comprar un regalo útil para una persona que disfruta leer.',clues:[{id:'a',source:'Mensaje de Sofía',text:'“Mi abuela lee todas las noches y siempre pierde la página donde quedó.”'},{id:'b',source:'Puesto de papel',text:'“Cuadernos, tarjetas, marcapáginas y lápices.”'},{id:'c',source:'Puesto de cocina',text:'“Tazas, cucharas y paños.”'}],question:'¿Qué elección está mejor justificada?',options:[{id:'a',label:'Un marcapáginas del puesto de papel.'},{id:'b',label:'Una cuchara del puesto de cocina.'},{id:'c',label:'Un lápiz sólo porque es más barato.'}],answer:'a',explanation:'La necesidad explícita es no perder la página al leer. Un marcapáginas resuelve directamente ese problema.'},
 {title:'La pista contradictoria',person:'Equipo investigador',goal:'Detectar qué pista no sirve para resolver un encargo.',clues:[{id:'a',source:'Encargo',text:'“Busca un alimento para preparar jugo natural de naranja.”'},{id:'b',source:'Frutería',text:'“Hay naranjas frescas disponibles.”'},{id:'c',source:'Cartel de ropa',text:'“Poleras con 20% de descuento.”'}],question:'¿Qué pista debes descartar y por qué?',options:[{id:'a',label:'El cartel de ropa, porque no aporta información sobre el alimento del encargo.'},{id:'b',label:'La frutería, porque sí tiene naranjas.'},{id:'c',label:'El encargo, porque contiene la pregunta principal.'}],answer:'a',explanation:'Una buena inferencia también exige distinguir evidencia relevante de información distractora. El descuento de ropa no ayuda a resolver el encargo.'},
]

export default function MercadoPistas3D({reducedMotion=false,highContrast=false,audioEnabled=true}:Props){
 const[index,setIndex]=useState(0)
 const[selectedClues,setSelectedClues]=useState<string[]>([])
 const[answer,setAnswer]=useState('')
 const[completed,setCompleted]=useState<number[]>([])
 const[attempts,setAttempts]=useState(0)
 const[message,setMessage]=useState('Reúne al menos dos pistas relevantes antes de formular una inferencia.')
 const[ready,setReady]=useState(false)
 const mission=missions[index]
 const solved=completed.includes(index)
 const enoughClues=selectedClues.length>=2

 function speak(text:string){if(!audioEnabled||typeof window==='undefined'||!('speechSynthesis'in window))return;window.speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='es-CL';u.rate=.9;window.speechSynthesis.speak(u)}
 function toggleClue(id:string){setSelectedClues(current=>current.includes(id)?current.filter(item=>item!==id):[...current,id]);setAnswer('')}
 function validate(){if(!enoughClues||!answer)return;setAttempts(v=>v+1);if(answer===mission.answer){setCompleted(current=>current.includes(index)?current:[...current,index]);const text=`Inferencia justificada. ${mission.explanation}`;setMessage(text);speak(text)}else{const text='Esa conclusión no usa correctamente las pistas reunidas. Revisa cuál evidencia responde de forma directa al encargo.';setMessage(text);speak(text)}}
 function next(){if(!solved)return;if(index<missions.length-1){setIndex(v=>v+1);setSelectedClues([]);setAnswer('');setMessage('Nueva misión: explora las pistas antes de decidir.')}else{speak('Mercado completado. Reuniste evidencia y justificaste inferencias en cuatro encargos.')}}
 function reset(){setIndex(0);setSelectedClues([]);setAnswer('');setCompleted([]);setAttempts(0);setMessage('Mercado reiniciado. Reúne al menos dos pistas antes de inferir.')}
 function sendToMission(){localStorage.setItem('yoyo-mission-draft',JSON.stringify({title:'Mercado de pistas',description:'Experiencia 3D de comprensión literal e inferencial mediante recolección, comparación y descarte de evidencia.',experienceType:'game',sourceHref:'/juegos/mercado-pistas',supportProfile:'Lectura en voz alta; textos breves; evidencia visible; alto contraste; movimiento reducido; sin límite de tiempo; retroalimentación de justificación.',courseId:'',objectiveId:'',dueAt:'',updatedAt:new Date().toISOString(),source:'juego-mercado-pistas'}));window.location.href='/misiones?from=juego-mercado-pistas'}

 return <section className="fair-game-wrap" id="mercado-pistas">
  <div className="game-premium-head"><div><span className="eyebrow">Exploración 3D · Lenguaje · 2.º–5.º básico</span><h1>Mercado de pistas</h1><p>Visita puestos, reúne evidencia y justifica inferencias. No basta con acertar: debes distinguir pistas útiles de distractores.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={()=>speak(`${mission.goal} ${mission.question}`)} disabled={!audioEnabled}><Speaker size={17}/>Escuchar misión</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar</button><button className="btn btn-primary" onClick={sendToMission}><Gamepad2 size={17}/>Crear Misión</button></div></div>

  <div className="level-rail">{missions.map((item,i)=><div key={item.title} className={'level-step '+(i===index?'active ':'')+(completed.includes(i)?'done ':'')+(i>index?'locked':'')}><span>{completed.includes(i)?<CheckCircle2 size={17}/>:i+1}</span><div><b>{item.person}</b><small>{completed.includes(i)?'Encargo resuelto':i===index?'Investigando':'Por desbloquear'}</small></div></div>)}</div>

  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card">
    <div className="game-hud"><span>{mission.title}</span><div className="hud-progress"><i style={{width:`${Math.round(completed.length/missions.length*100)}%`}}/></div><b>{completed.length}/4 encargos</b></div>
    <div className="three-stage premium-webgl-scene"><ThreeClueMarket mission={index} evidenceCount={selectedClues.length} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>{ready?'Mercado abierto':'Cargando mercado…'}</strong><span>{selectedClues.length} pistas en tu libreta</span></div></div>
    <div className="feedback-box" role="status" aria-live="polite">{message}</div>
    <div className="accessibility-summary"><Store size={18}/><span>La escena 3D es complementaria: todas las pistas, fuentes y decisiones aparecen en texto y pueden escucharse.</span></div>
   </section>

   <aside className="panel challenge-panel"><span className="eyebrow"><MapPinned size={14}/> Encargo de {mission.person}</span><div className="insight"><b>Objetivo</b><p>{mission.goal}</p></div><h2>1. Reúne evidencia</h2>
    <div className="answer-stack">{mission.clues.map(clue=><button key={clue.id} className={'answer-card '+(selectedClues.includes(clue.id)?'selected':'')} onClick={()=>toggleClue(clue.id)}><strong>{clue.source}</strong><span>{clue.text}</span></button>)}</div>
    <div className="insight"><b><Search size={14}/> Libreta</b><p>{selectedClues.length<2?'Selecciona al menos dos pistas para habilitar tu inferencia.':`Tienes ${selectedClues.length} pistas. Ahora compara qué información responde al encargo.`}</p></div>
    <h2>2. Formula una inferencia</h2><p>{mission.question}</p>
    <div className="answer-stack">{mission.options.map(option=><button key={option.id} disabled={!enoughClues} onClick={()=>setAnswer(option.id)} className={'answer-card '+(answer===option.id?'selected':'')}>{option.label}</button>)}</div>
    <button className="btn btn-primary" onClick={validate} disabled={!enoughClues||!answer}><Lightbulb size={16}/>Justificar con pistas</button>
    <div className="metric-grid"><div><strong>{selectedClues.length}</strong><span>pistas</span></div><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{completed.length}/4</strong><span>misiones</span></div><div><strong>{solved?'Sí':'No'}</strong><span>justificada</span></div></div>
    <button className="btn btn-primary next-level" disabled={!solved} onClick={next}>{index===missions.length-1?'Cerrar mercado':'Siguiente encargo'} <ArrowRight size={16}/></button>
   </aside>
  </div>
 </section>
}
