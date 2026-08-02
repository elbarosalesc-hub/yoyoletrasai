'use client'

import {useMemo,useState} from 'react'
import Link from 'next/link'
import {
 Activity,BookOpenCheck,Calculator,CheckCircle2,FlaskConical,Images,
 Pause,PenTool,Play,Printer,RefreshCw,SlidersHorizontal,Sparkles,Volume2
} from 'lucide-react'
import {AppShell} from '@/components/AppShell'

type CenterId='matematica'|'ciencias'|'caligrafia'|'grafomotricidad'|'pictogramas'|'plan-lector'

type Center={
 id:CenterId
 title:string
 subtitle:string
 icon:typeof Calculator
 tone:string
 features:string[]
}

const centers:Center[]=[
 {id:'matematica',title:'MathLab',subtitle:'Manipulativos, cálculo y resolución visual',icon:Calculator,tone:'blue',features:['Recta numérica','Bloques base diez','Fracciones visuales','Geometría y medición']},
 {id:'ciencias',title:'Ciencia Viva',subtitle:'Exploración guiada con evidencia real',icon:FlaskConical,tone:'green',features:['Laboratorios seguros','Modelos del cuerpo','Ecosistemas','Método científico']},
 {id:'caligrafia',title:'Caligrafía',subtitle:'Trazos, letras y palabras personalizables',icon:PenTool,tone:'violet',features:['Letra ligada e imprenta','Pauta ampliada','Modelo y copia','Exportación imprimible']},
 {id:'grafomotricidad',title:'Grafomotricidad',subtitle:'Control fino y progresión del movimiento',icon:Activity,tone:'orange',features:['Rectas y curvas','Bucles y ondas','Recorridos temáticos','Niveles de dificultad']},
 {id:'pictogramas',title:'Comunicación visual',subtitle:'Pictogramas y fotografías para anticipar y comunicar',icon:Images,tone:'pink',features:['Modo pictograma','Modo fotografía real','Rutinas visuales','Tableros de comunicación']},
 {id:'plan-lector',title:'Plan Lector',subtitle:'Lectura graduada, fluidez y comprensión',icon:BookOpenCheck,tone:'gold',features:['Textos por nivel','Cronómetro lector','Preguntas graduadas','Registro de progreso']},
]

const realPhotos={
 ciencias:[
  {src:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=900&q=85',alt:'Estudiante realizando una experiencia científica en laboratorio',label:'Investigación científica'},
  {src:'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=900&q=85',alt:'Material de laboratorio científico real',label:'Laboratorio y observación'},
  {src:'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=900&q=85',alt:'Bosque real para estudiar ecosistemas',label:'Ecosistemas reales'},
 ],
 pictogramas:[
  {src:'https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=900&q=85',alt:'Niños aprendiendo juntos en una sala de clases',label:'Trabajar en clases'},
  {src:'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=85',alt:'Estudiante leyendo un libro',label:'Momento de leer'},
  {src:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=85',alt:'Niño expresando una emoción positiva',label:'Me siento bien'},
 ],
 lector:[
  {src:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=900&q=85',alt:'Biblioteca real con libros',label:'Explorar nuevos libros'},
  {src:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=900&q=85',alt:'Estantería de libros reales',label:'Biblioteca de aula'},
  {src:'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=900&q=85',alt:'Biblioteca escolar luminosa',label:'Lectura autónoma'},
 ],
}

const readingText='Luna encontró una pequeña semilla junto al camino. La llevó a casa, la puso en una maceta y cada mañana le dio un poco de agua. Después de varios días apareció un tallo verde. Luna comprendió que la paciencia y el cuidado ayudan a que la vida crezca.'

export default function CentrosPremium(){
 const[active,setActive]=useState<CenterId>('matematica')
 const[number,setNumber]=useState(34)
 const[denominator,setDenominator]=useState(4)
 const[numerator,setNumerator]=useState(1)
 const[calligraphy,setCalligraphy]=useState('Yo aprendo con alegría')
 const[fontMode,setFontMode]=useState<'imprenta'|'ligada'>('imprenta')
 const[difficulty,setDifficulty]=useState(1)
 const[seconds,setSeconds]=useState(60)
 const[running,setRunning]=useState(false)
 const[answers,setAnswers]=useState<string[]>([])

 const center=centers.find(item=>item.id===active)!
 const fractionPieces=useMemo(()=>Array.from({length:denominator},(_,index)=>index<numerator),[denominator,numerator])

 const speak=(text:string)=>{
  if(typeof window==='undefined'||!('speechSynthesis'in window))return
  window.speechSynthesis.cancel()
  const utterance=new SpeechSynthesisUtterance(text)
  utterance.lang='es-CL'
  utterance.rate=.85
  window.speechSynthesis.speak(utterance)
 }

 const toggleTimer=()=>{
  if(running){setRunning(false);return}
  setRunning(true)
  let value=seconds
  const timer=window.setInterval(()=>{
   value-=1
   setSeconds(value)
   if(value<=0){window.clearInterval(timer);setRunning(false)}
  },1000)
 }

 return <AppShell active="Centros Premium">
  <section className="premium-centers-hero">
   <div><span className="eyebrow"><Sparkles size={15}/> Ecosistema pedagógico premium</span><h1>Herramientas reales para enseñar, practicar y adaptar</h1><p>Seis centros especializados conectan experiencias interactivas, material imprimible, apoyos PIE/DUA y recursos visuales de alta calidad.</p></div>
   <div className="premium-centers-badge"><strong>6</strong><span>centros integrados</span><small>Currículo · inclusión · evaluación</small></div>
  </section>

  <nav className="center-tabs" aria-label="Centros pedagógicos">
   {centers.map(item=>{const Icon=item.icon;return <button key={item.id} className={`${active===item.id?'active':''} tone-${item.tone}`} onClick={()=>setActive(item.id)}><Icon/><span><strong>{item.title}</strong><small>{item.subtitle}</small></span></button>})}
  </nav>

  <section className={`center-workspace tone-${center.tone}`}>
   <header className="center-workspace-head"><div><span className="eyebrow">Centro activo</span><h2>{center.title}</h2><p>{center.subtitle}</p></div><div className="center-feature-pills">{center.features.map(feature=><span key={feature}><CheckCircle2/>{feature}</span>)}</div></header>

   {active==='matematica'&&<div className="tool-grid">
    <article className="tool-panel"><div className="tool-title"><Calculator/><div><h3>Constructor de valor posicional</h3><p>Representa números con centenas, decenas y unidades.</p></div></div><label className="range-label">Número a representar <strong>{number}</strong><input type="range" min="0" max="999" value={number} onChange={event=>setNumber(Number(event.target.value))}/></label><div className="place-value"><div><strong>{Math.floor(number/100)}</strong><span>Centenas</span></div><div><strong>{Math.floor(number%100/10)}</strong><span>Decenas</span></div><div><strong>{number%10}</strong><span>Unidades</span></div></div><div className="number-blocks"><span>{'▦'.repeat(Math.min(9,Math.floor(number/100)))}</span><span>{'▥'.repeat(Math.min(9,Math.floor(number%100/10)))}</span><span>{'●'.repeat(Math.min(9,number%10))}</span></div></article>
    <article className="tool-panel"><div className="tool-title"><SlidersHorizontal/><div><h3>Fracciones visuales</h3><p>Compara la parte coloreada con el total.</p></div></div><div className="fraction-controls"><label>Numerador<select value={numerator} onChange={event=>setNumerator(Math.min(Number(event.target.value),denominator))}>{Array.from({length:denominator},(_,i)=><option key={i+1}>{i+1}</option>)}</select></label><label>Denominador<select value={denominator} onChange={event=>{const next=Number(event.target.value);setDenominator(next);setNumerator(Math.min(numerator,next))}}>{[2,3,4,5,6,8,10].map(value=><option key={value}>{value}</option>)}</select></label></div><div className="fraction-strip">{fractionPieces.map((filled,index)=><span className={filled?'filled':''} key={index}/>)}</div><strong className="fraction-result">{numerator}/{denominator}</strong><button className="btn btn-soft" onClick={()=>window.print()}><Printer/>Imprimir actividad</button></article>
   </div>}

   {active==='ciencias'&&<div className="tool-grid science-grid"><article className="tool-panel science-method"><div className="tool-title"><FlaskConical/><div><h3>Laboratorio guiado</h3><p>Explora, formula una hipótesis y registra evidencia.</p></div></div>{['Observar una situación real','Formular una pregunta','Proponer una hipótesis','Experimentar de forma segura','Registrar y comunicar resultados'].map((step,index)=><button key={step} onClick={()=>setAnswers(current=>current.includes(step)?current.filter(item=>item!==step):[...current,step])} className={answers.includes(step)?'done':''}><span>{index+1}</span>{step}<CheckCircle2/></button>)}</article><article className="tool-panel"><h3>Galería científica real</h3><p>Fotografías de referencia para observar, describir y formular preguntas.</p><div className="real-photo-grid">{realPhotos.ciencias.map(photo=><figure key={photo.src}><img src={photo.src} alt={photo.alt}/><figcaption>{photo.label}</figcaption></figure>)}</div></article></div>}

   {active==='caligrafia'&&<div className="tool-grid"><article className="tool-panel"><div className="tool-title"><PenTool/><div><h3>Generador de caligrafía</h3><p>Escribe una palabra o frase y crea una pauta inmediata.</p></div></div><textarea value={calligraphy} maxLength={90} onChange={event=>setCalligraphy(event.target.value)} aria-label="Texto para practicar caligrafía"/><div className="segmented"><button className={fontMode==='imprenta'?'active':''} onClick={()=>setFontMode('imprenta')}>Imprenta</button><button className={fontMode==='ligada'?'active':''} onClick={()=>setFontMode('ligada')}>Ligada</button></div><button className="btn btn-primary" onClick={()=>window.print()}><Printer/>Imprimir pauta</button></article><article className={`tool-panel handwriting-sheet ${fontMode}`}><span>Modelo</span><strong>{calligraphy||'Escribe aquí'}</strong>{[1,2,3,4].map(line=><div className="handwriting-line" key={line}><em>{calligraphy||'Escribe aquí'}</em></div>)}</article></div>}

   {active==='grafomotricidad'&&<div className="tool-grid"><article className="tool-panel"><div className="tool-title"><Activity/><div><h3>Progresión grafomotriz</h3><p>Selecciona dificultad y practica movimientos continuos.</p></div></div><label className="range-label">Nivel <strong>{difficulty}</strong><input type="range" min="1" max="3" value={difficulty} onChange={event=>setDifficulty(Number(event.target.value))}/></label><div className="motor-preview">{Array.from({length:4+difficulty},(_,index)=><div key={index} className={`motor-line level-${difficulty}`}><span>●</span><i></i><b>★</b></div>)}</div></article><article className="tool-panel"><h3>Orientaciones de uso</h3><ul className="premium-check-list"><li>Comenzar con movimientos amplios antes de reducir el tamaño.</li><li>Modelar el recorrido de izquierda a derecha.</li><li>Permitir lápiz grueso, adaptador o apoyo de muñeca.</li><li>Evitar sobrecarga: series breves con pausas activas.</li></ul><button className="btn btn-primary" onClick={()=>window.print()}><Printer/>Imprimir recorrido</button></article></div>}

   {active==='pictogramas'&&<div className="tool-grid"><article className="tool-panel wide"><div className="tool-title"><Images/><div><h3>Tablero con fotografías reales</h3><p>Apoyo visual concreto para anticipar, elegir y comunicar.</p></div></div><div className="real-photo-grid communication-grid">{realPhotos.pictogramas.map(photo=><button key={photo.src} onClick={()=>speak(photo.label)}><img src={photo.src} alt={photo.alt}/><strong>{photo.label}</strong><Volume2/></button>)}</div><div className="accessibility-note"><CheckCircle2/><span>Las fotografías incluyen texto visible, descripción alternativa y lectura en voz alta.</span></div></article></div>}

   {active==='plan-lector'&&<div className="tool-grid"><article className="tool-panel reading-panel"><div className="tool-title"><BookOpenCheck/><div><h3>Lectura graduada</h3><p>Texto breve para fluidez, comprensión e inferencia sencilla.</p></div></div><div className="reading-toolbar"><button onClick={()=>speak(readingText)}><Volume2/>Escuchar</button><button onClick={toggleTimer}>{running?<Pause/>:<Play/>}{running?'Pausar':'Cronómetro'}</button><button onClick={()=>{setSeconds(60);setRunning(false)}}><RefreshCw/>Reiniciar</button><strong>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</strong></div><p className="reading-copy">{readingText}</p><div className="reading-questions"><label>1. ¿Qué encontró Luna?<input placeholder="Escribe o responde oralmente"/></label><label>2. ¿Qué hizo cada mañana?<input placeholder="Busca información explícita"/></label><label>3. ¿Qué enseñanza deja el texto?<input placeholder="Realiza una inferencia"/></label></div></article><article className="tool-panel"><h3>Ambientes lectores reales</h3><div className="real-photo-grid reader-gallery">{realPhotos.lector.map(photo=><figure key={photo.src}><img src={photo.src} alt={photo.alt}/><figcaption>{photo.label}</figcaption></figure>)}</div><Link className="btn btn-primary" href="/biblioteca?subject=Lenguaje">Explorar biblioteca lectora</Link></article></div>}
  </section>

  <section className="premium-quality-strip"><div><strong>Diseño pedagógico propio</strong><span>Sin copiar materiales de terceros</span></div><div><strong>Fotografía real</strong><span>Imágenes claras, contextualizadas y con texto alternativo</span></div><div><strong>PIE y DUA</strong><span>Respuesta oral, visual, escrita y manipulativa</span></div><div><strong>Uso flexible</strong><span>Proyectar, escuchar, adaptar o imprimir</span></div></section>
 </AppShell>
}
