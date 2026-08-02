'use client'

import {useMemo,useState} from 'react'
import Link from 'next/link'
import {AppShell} from '@/components/AppShell'
import {BookOpen,Calculator,ChevronRight,Download,FlaskConical,Grid3X3,HeartHandshake,PenTool,Play,Printer,RotateCcw,Sparkles,Timer,Volume2} from 'lucide-react'

type CenterKey='matematica'|'ciencias'|'caligrafia'|'grafomotricidad'|'pictogramas'|'plan-lector'

const centers:{key:CenterKey;title:string;kicker:string;description:string;image:string;icon:typeof Calculator;features:string[]}[]=[
 {key:'matematica',title:'MathLab Interactivo',kicker:'Matemática visual y manipulativa',description:'Herramientas para numeración, cálculo, geometría, fracciones, medición y resolución de problemas con apoyos graduados.',image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=85',icon:Calculator,features:['Material base diez','Recta numérica','Fracciones visuales','Geometría dinámica']},
 {key:'ciencias',title:'ExploraLab Ciencias',kicker:'Investigación y descubrimiento',description:'Experiencias guiadas, observación científica, simulaciones y registro de hipótesis para aprender haciendo.',image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85',icon:FlaskConical,features:['Método científico','Seres vivos','Materia y energía','Tierra y universo']},
 {key:'caligrafia',title:'Taller de Caligrafía',kicker:'Escritura legible y progresiva',description:'Modelos configurables de letras, palabras y oraciones con pauta, tamaño, contraste y nivel de apoyo adaptables.',image:'https://images.unsplash.com/photo-1456324504439-367cee3b3c32?auto=format&fit=crop&w=1200&q=85',icon:PenTool,features:['Imprenta y manuscrita','Pauta configurable','Mayúsculas y minúsculas','Exportación imprimible']},
 {key:'grafomotricidad',title:'Laboratorio Grafomotor',kicker:'Trazos, coordinación y precisión',description:'Recorridos progresivos con líneas, curvas, bucles, figuras y patrones para fortalecer motricidad fina.',image:'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1200&q=85',icon:Sparkles,features:['Trazos básicos','Coordinación visomotora','Patrones y laberintos','Progresión por dificultad']},
 {key:'pictogramas',title:'ComuniCA',kicker:'Pictogramas y comunicación aumentativa',description:'Tableros visuales para anticipar, elegir, expresar necesidades, emociones y construir secuencias comunicativas.',image:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1200&q=85',icon:Grid3X3,features:['Rutinas visuales','Emociones y necesidades','Secuencias paso a paso','Tableros personalizados']},
 {key:'plan-lector',title:'Plan Lector 360°',kicker:'Fluidez, comprensión y motivación',description:'Rutas lectoras por nivel, cronómetro, cálculo de palabras por minuto, preguntas graduadas y seguimiento del progreso.',image:'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?auto=format&fit=crop&w=1200&q=85',icon:BookOpen,features:['Biblioteca por nivel','Fluidez lectora','Comprensión progresiva','Registro de avance']},
]

const pictograms=[['🙋','Necesito ayuda'],['💧','Quiero agua'],['🚻','Necesito ir al baño'],['⏸️','Necesito una pausa'],['😊','Estoy bien'],['😟','Estoy preocupado'],['🔇','Necesito silencio'],['✅','Terminé']]

export default function CentrosPremium(){
 const[active,setActive]=useState<CenterKey>('matematica')
 const[ones,setOnes]=useState(4)
 const[tens,setTens]=useState(3)
 const[letter,setLetter]=useState('M')
 const[stroke,setStroke]=useState(2)
 const[selectedPics,setSelectedPics]=useState<string[]>([])
 const[words,setWords]=useState(120)
 const[seconds,setSeconds]=useState(60)
 const[scienceStep,setScienceStep]=useState(0)
 const current=centers.find(item=>item.key===active)!
 const ppm=useMemo(()=>seconds>0?Math.round(words/(seconds/60)):0,[words,seconds])
 const togglePic=(label:string)=>setSelectedPics(value=>value.includes(label)?value.filter(item=>item!==label):[...value,label])

 return <AppShell active="Centros Premium">
  <section className="centers-hero">
   <div><span className="eyebrow">Ecosistema pedagógico premium</span><h1>Seis centros especializados para enseñar, adaptar y acompañar</h1><p>Herramientas originales integradas con Biblioteca, PIE/DUA y evaluación. Cada experiencia permite modelar, practicar, imprimir y registrar evidencia.</p><div className="centers-hero-actions"><Link className="btn btn-primary" href="/biblioteca">Explorar biblioteca</Link><Link className="btn btn-soft" href="/crear">Crear adaptación con IA</Link></div></div>
   <aside><strong>Diseño pedagógico integral</strong><span>Currículo chileno</span><span>Accesibilidad configurable</span><span>Experiencias interactivas</span><span>Material imprimible</span></aside>
  </section>

  <nav className="center-tabs" aria-label="Centros pedagógicos">{centers.map(item=>{const Icon=item.icon;return <button key={item.key} className={active===item.key?'active':''} onClick={()=>setActive(item.key)}><Icon/><span>{item.title}</span></button>})}</nav>

  <section className="center-showcase">
   <article className="center-photo" style={{backgroundImage:`linear-gradient(180deg,rgba(8,15,38,.05),rgba(8,15,38,.78)),url(${current.image})`}}><span>{current.kicker}</span><h2>{current.title}</h2><p>{current.description}</p><div>{current.features.map(feature=><em key={feature}>{feature}</em>)}</div></article>

   <div className="center-workspace">
    {active==='matematica'&&<section className="tool-panel"><header><div><span className="tool-badge">Herramienta activa</span><h3>Constructor de valor posicional</h3></div><Calculator/></header><p>Representa cantidades con decenas y unidades. El valor cambia en tiempo real.</p><div className="place-value"><div><strong>{tens}</strong><span>Decenas</span><input type="range" min="0" max="9" value={tens} onChange={event=>setTens(Number(event.target.value))}/></div><div><strong>{ones}</strong><span>Unidades</span><input type="range" min="0" max="9" value={ones} onChange={event=>setOnes(Number(event.target.value))}/></div><b>{tens*10+ones}</b></div><div className="blocks"><div>{Array.from({length:tens},(_,i)=><i className="ten" key={i}/>)}</div><div>{Array.from({length:ones},(_,i)=><i className="one" key={i}/>)}</div></div><footer><button className="btn btn-soft" onClick={()=>{setTens(0);setOnes(0)}}><RotateCcw/>Reiniciar</button><Link className="btn btn-primary" href="/biblioteca/decimales-posicional">Abrir recurso relacionado<ChevronRight/></Link></footer></section>}

    {active==='ciencias'&&<section className="tool-panel science-panel"><header><div><span className="tool-badge">Laboratorio guiado</span><h3>¿Qué necesita una planta para crecer?</h3></div><FlaskConical/></header><div className="science-steps">{['Observar','Formular hipótesis','Experimentar','Registrar','Concluir'].map((step,index)=><button key={step} className={scienceStep===index?'active':''} onClick={()=>setScienceStep(index)}><b>{index+1}</b><span>{step}</span></button>)}</div><div className="science-observation"><span>{['🌱','💭','🧪','📋','✅'][scienceStep]}</span><div><strong>{['Observa las plantas disponibles','Escribe qué crees que ocurrirá','Compara luz, agua y suelo','Registra cambios cada día','Explica qué evidencia apoya tu respuesta'][scienceStep]}</strong><p>{['Describe color, tamaño, hojas y condiciones del entorno.','Usa la estructura: “Pienso que… porque…”.','Modifica solo una variable para comparar de forma justa.','Puedes dibujar, escribir o tomar una fotografía.','Compara tu hipótesis inicial con los resultados observados.'][scienceStep]}</p></div></div><footer><Link className="btn btn-soft" href="/biblioteca/ciclo-agua">Ver experiencias de Ciencias</Link><button className="btn btn-primary" onClick={()=>setScienceStep(value=>(value+1)%5)}>Siguiente etapa<ChevronRight/></button></footer></section>}

    {active==='caligrafia'&&<section className="tool-panel"><header><div><span className="tool-badge">Generador configurable</span><h3>Modelo de letra y pauta</h3></div><PenTool/></header><div className="writing-controls"><label>Letra o palabra<input value={letter} maxLength={18} onChange={event=>setLetter(event.target.value)}/></label><label>Grosor del modelo<input type="range" min="1" max="5" value={stroke} onChange={event=>setStroke(Number(event.target.value))}/></label></div><div className="writing-sheet" style={{'--stroke':stroke} as React.CSSProperties}><span>{letter||'M'}</span><i>{letter||'M'} {letter||'M'} {letter||'M'}</i><i>{letter||'M'} {letter||'M'} {letter||'M'}</i></div><footer><button className="btn btn-soft" onClick={()=>window.print()}><Printer/>Imprimir práctica</button><Link className="btn btn-primary" href="/caligrafia">Abrir taller completo<ChevronRight/></Link></footer></section>}

    {active==='grafomotricidad'&&<section className="tool-panel"><header><div><span className="tool-badge">Secuencia progresiva</span><h3>Camino de curvas y precisión</h3></div><Sparkles/></header><div className="trace-board"><svg viewBox="0 0 800 260" role="img" aria-label="Camino grafomotor de curvas"><path className="trace-guide" d="M30 130 C90 20 150 240 210 130 S330 20 390 130 S510 240 570 130 S690 20 770 130"/><path className="trace-dots" d="M30 130 C90 20 150 240 210 130 S330 20 390 130 S510 240 570 130 S690 20 770 130"/></svg><div><span>Inicio</span><span>Meta</span></div></div><div className="trace-levels"><button className="active">Curvas amplias</button><button>Bucles</button><button>Zigzag</button><button>Laberinto</button></div><footer><button className="btn btn-soft" onClick={()=>window.print()}><Download/>Ficha imprimible</button><Link className="btn btn-primary" href="/biblioteca">Más grafomotricidad<ChevronRight/></Link></footer></section>}

    {active==='pictogramas'&&<section className="tool-panel"><header><div><span className="tool-badge">Comunicación accesible</span><h3>Tablero de necesidades y emociones</h3></div><HeartHandshake/></header><div className="communication-strip">{selectedPics.length?selectedPics.join(' · '):'Selecciona pictogramas para construir un mensaje'}</div><div className="pictogram-grid">{pictograms.map(([symbol,label])=><button key={label} className={selectedPics.includes(label)?'active':''} onClick={()=>togglePic(label)}><span>{symbol}</span><b>{label}</b></button>)}</div><footer><button className="btn btn-soft" onClick={()=>setSelectedPics([])}><RotateCcw/>Limpiar</button><button className="btn btn-primary" onClick={()=>window.speechSynthesis?.speak(new SpeechSynthesisUtterance(selectedPics.join('. ')))} disabled={!selectedPics.length}><Volume2/>Leer mensaje</button></footer></section>}

    {active==='plan-lector'&&<section className="tool-panel"><header><div><span className="tool-badge">Seguimiento lector</span><h3>Calculadora de fluidez y ruta de comprensión</h3></div><BookOpen/></header><div className="reader-calculator"><label>Palabras leídas<input type="number" min="1" value={words} onChange={event=>setWords(Number(event.target.value))}/></label><label>Tiempo en segundos<input type="number" min="1" value={seconds} onChange={event=>setSeconds(Number(event.target.value))}/></label><div><Timer/><strong>{ppm}</strong><span>palabras por minuto</span></div></div><div className="reader-route"><span><b>1</b>Antes de leer<small>Anticipar y activar conocimientos.</small></span><span><b>2</b>Durante la lectura<small>Localizar, inferir y aclarar.</small></span><span><b>3</b>Después de leer<small>Explicar, opinar y crear.</small></span></div><footer><button className="btn btn-soft"><Play/>Iniciar lectura guiada</button><Link className="btn btn-primary" href="/biblioteca">Explorar Plan Lector<ChevronRight/></Link></footer></section>}
   </div>
  </section>

  <section className="premium-principles"><article><strong>100% original</strong><p>Recursos creados para YoYoLetrasAI, sin copiar materiales de otras plataformas.</p></article><article><strong>Visuales auténticos</strong><p>Fotografía educativa real y componentes pedagógicos diseñados para cada propósito.</p></article><article><strong>PIE y DUA</strong><p>Múltiples formas de presentar, responder, participar y demostrar aprendizaje.</p></article><article><strong>Con evidencia</strong><p>Cada herramienta está preparada para vincularse con curso, OA y seguimiento.</p></article></section>
 </AppShell>
}
