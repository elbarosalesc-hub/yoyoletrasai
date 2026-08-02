'use client'

import {useMemo,useState} from 'react'
import Link from 'next/link'
import {AppShell} from '@/components/AppShell'
import {BookOpen,Brain,Calculator,ChevronRight,FlaskConical,Grid3X3,Image as ImageIcon,PenLine,Play,RotateCcw,Sparkles,Volume2} from 'lucide-react'

type ModuleKey='matematica'|'ciencias'|'caligrafia'|'grafomotricidad'|'pictogramas'|'planlector'

const modules:{key:ModuleKey;title:string;subtitle:string;image:string;icon:typeof Calculator;stats:string[]}[]=[
 {key:'matematica',title:'MathLab',subtitle:'Material concreto, cálculo, geometría, datos y resolución paso a paso.',image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=85',icon:Calculator,stats:['32 herramientas','OA 1.º a 8.º','Modo manipulativo']},
 {key:'ciencias',title:'ScienceLab',subtitle:'Exploraciones, modelos, simulaciones y cuadernos de laboratorio.',image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=85',icon:FlaskConical,stats:['24 experiencias','Seguridad integrada','Registro de hipótesis']},
 {key:'caligrafia',title:'Caligrafía',subtitle:'Trazos, letras, enlaces, palabras y escritura funcional graduada.',image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=85',icon:PenLine,stats:['Imprenta y ligada','Zurdo y diestro','Pauta ajustable']},
 {key:'grafomotricidad',title:'Grafomotricidad',subtitle:'Coordinación visomotora, direccionalidad, presión y precisión.',image:'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=1400&q=85',icon:Brain,stats:['6 niveles','Trazos progresivos','Apoyo sensorial']},
 {key:'pictogramas',title:'Pictogramas',subtitle:'Comunicación visual, rutinas, anticipación y autorregulación.',image:'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=1400&q=85',icon:Grid3X3,stats:['Tableros editables','Voz integrada','Rutinas visuales']},
 {key:'planlector',title:'Plan Lector',subtitle:'Fluidez, comprensión, vocabulario y seguimiento lector individual.',image:'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=1400&q=85',icon:BookOpen,stats:['Rutas por nivel','Cronómetro lector','Informes de avance']},
]

const mathTools=[['Ábaco posicional','Representa unidades, decenas, centenas y millares.'],['Fracciones visuales','Construye, compara y suma fracciones con modelos.'],['Geoplano digital','Explora perímetro, área, simetría y coordenadas.'],['Recta numérica','Opera con enteros, decimales y saltos graduados.'],['Tablas interactivas','Practica multiplicación con apoyo visual y ritmo adaptable.'],['Datos y gráficos','Crea pictogramas, barras y tablas de frecuencia.']]
const scienceTools=[['Microscopio virtual','Observa muestras y registra detalles.'],['Sistema solar 3D','Compara órbitas, tamaños y movimientos.'],['Circuitos eléctricos','Conecta componentes y predice resultados.'],['Ciclo del agua','Ordena procesos y explica cambios de estado.'],['Cuerpo humano','Explora sistemas y funciones principales.'],['Ecosistemas','Relaciona seres vivos, hábitat y alimentación.']]
const pictograms=[['Necesito ayuda','🙋'],['Descanso','🧘'],['Baño','🚻'],['Agua','💧'],['Estoy feliz','😊'],['Estoy triste','😢'],['Me molesta el ruido','🔇'],['Terminé','✅']]
const readings=[
 {title:'La plaza después de la lluvia',level:'3.º básico',words:132,skill:'Información explícita'},
 {title:'El secreto del copihue',level:'4.º básico',words:186,skill:'Inferencias sencillas'},
 {title:'Viaje al sistema solar',level:'5.º básico',words:241,skill:'Idea principal'},
 {title:'Una decisión valiente',level:'6.º básico',words:318,skill:'Propósito y opinión'},
]

export default function CentrosAprendizaje(){
 const[active,setActive]=useState<ModuleKey>('matematica')
 const[count,setCount]=useState(0)
 const[target,setTarget]=useState(10)
 const[sequence,setSequence]=useState<string[]>([])
 const[selectedReading,setSelectedReading]=useState(readings[0])
 const module=modules.find(item=>item.key===active)!
 const activities=active==='matematica'?mathTools:active==='ciencias'?scienceTools:[]
 const progress=Math.min(100,Math.round(count/Math.max(1,target)*100))
 const phrase=useMemo(()=>sequence.join(' · '),[sequence])

 return <AppShell active="Centros premium">
  <section className="learning-hero" style={{backgroundImage:`linear-gradient(90deg,rgba(8,18,44,.93),rgba(8,18,44,.48)),url(${module.image})`}}>
   <div><span className="eyebrow">Ecosistema premium de aprendizaje</span><h1>{module.title}</h1><p>{module.subtitle}</p><div className="learning-hero-stats">{module.stats.map(stat=><span key={stat}>{stat}</span>)}</div></div>
   <Link href="/biblioteca" className="btn btn-primary"><Sparkles size={17}/>Explorar recursos relacionados</Link>
  </section>

  <nav className="learning-tabs" aria-label="Centros de aprendizaje">{modules.map(item=>{const Icon=item.icon;return <button key={item.key} className={active===item.key?'active':''} onClick={()=>setActive(item.key)}><Icon size={19}/><span>{item.title}</span></button>})}</nav>

  {(active==='matematica'||active==='ciencias')&&<section className="learning-layout">
   <div className="premium-card lab-stage">
    <div className="section-heading"><div><span className="eyebrow">Laboratorio interactivo</span><h2>{active==='matematica'?'Contador y representación numérica':'Registro de observaciones'}</h2></div><button className="icon-action" onClick={()=>setCount(0)} aria-label="Reiniciar"><RotateCcw/></button></div>
    {active==='matematica'?<>
     <div className="counter-stage"><button onClick={()=>setCount(Math.max(0,count-1))}>−</button><strong>{count}</strong><button onClick={()=>setCount(count+1)}>+</button></div>
     <div className="target-row"><label>Meta<input type="number" min="1" max="100" value={target} onChange={event=>setTarget(Number(event.target.value)||1)}/></label><div className="progress-track"><i style={{width:`${progress}%`}}/></div><b>{progress}%</b></div>
     <div className="concrete-grid">{Array.from({length:Math.min(count,40)}).map((_,index)=><span key={index}/>)}</div>
    </>:<div className="science-notebook"><label>Pregunta investigable<textarea defaultValue="¿Qué ocurrirá si cambia una sola variable?"/></label><label>Hipótesis<textarea placeholder="Creo que... porque..."/></label><label>Observación<textarea placeholder="Observo que..."/></label><button className="btn btn-primary">Guardar experiencia</button></div>}
   </div>
   <div className="tool-catalog">{activities.map(([title,description],index)=><article className="premium-card lab-tool" key={title}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{title}</h3><p>{description}</p></div><button aria-label={`Abrir ${title}`}><ChevronRight/></button></article>)}</div>
  </section>}

  {active==='caligrafia'&&<section className="learning-layout handwriting-suite"><div className="premium-card handwriting-sheet"><span className="eyebrow">Pauta dinámica</span><h2>Práctica de letra ligada</h2><div className="writing-line"><b>A a</b><span>avión · árbol · abeja</span></div><div className="writing-line faded"><b>A a</b><span>avión · árbol · abeja</span></div><div className="writing-line empty"></div><div className="writing-line empty"></div><div className="handwriting-actions"><button className="btn btn-primary">Imprimir ficha</button><button className="btn btn-soft">Cambiar pauta</button><button className="btn btn-soft">Versión alto contraste</button></div></div><aside className="premium-card settings-panel"><h3>Personalización</h3><label>Tipo de letra<select><option>Ligada escolar</option><option>Imprenta mayúscula</option><option>Imprenta minúscula</option></select></label><label>Tamaño<select><option>Grande · 20 pt</option><option>Mediano · 16 pt</option><option>Estándar · 13 pt</option></select></label><label>Apoyo visual<select><option>Punto de inicio y flechas</option><option>Solo punto de inicio</option><option>Sin guía</option></select></label><label><input type="checkbox" defaultChecked/> Adaptación para zurdos</label></aside></section>}

  {active==='grafomotricidad'&&<section className="motor-grid">{['Líneas verticales','Líneas horizontales','Ondas','Espirales','Bucles','Caminos combinados'].map((title,index)=><article className="premium-card motor-card" key={title}><div className={`trace trace-${index+1}`}><i/><i/><i/></div><h3>{title}</h3><p>Trazo progresivo con inicio marcado, dirección visible y reducción gradual del apoyo.</p><div><span>Nivel {index+1}</span><button className="btn btn-soft">Abrir ficha</button></div></article>)}</section>}

  {active==='pictogramas'&&<section className="learning-layout"><div className="premium-card pictogram-board"><div className="section-heading"><div><span className="eyebrow">Comunicador visual</span><h2>Construye una frase</h2></div><button className="icon-action" onClick={()=>setSequence([])}><RotateCcw/></button></div><div className="phrase-strip">{phrase||'Selecciona pictogramas para comunicar una necesidad'}</div><div className="pictogram-grid">{pictograms.map(([label,emoji])=><button key={label} onClick={()=>setSequence(items=>[...items,label])}><span>{emoji}</span><b>{label}</b></button>)}</div><button className="btn btn-primary speak-button" onClick={()=>window.speechSynthesis?.speak(new SpeechSynthesisUtterance(sequence.join('. ')))}><Volume2/>Leer en voz alta</button></div><aside className="premium-card settings-panel"><ImageIcon/><h3>Banco visual original</h3><p>Cada pictograma tendrá versión fotográfica real, ilustración limpia, alto contraste y etiqueta editable.</p><label>Estilo<select><option>Fotografía real</option><option>Ilustración realista</option><option>Alto contraste</option></select></label><label>Tamaño<select><option>Grande</option><option>Mediano</option><option>Compacto</option></select></label></aside></section>}

  {active==='planlector'&&<section className="learning-layout reader-suite"><div className="premium-card reader-list"><span className="eyebrow">Ruta lectora</span><h2>Lecturas graduadas</h2>{readings.map(reading=><button key={reading.title} className={selectedReading.title===reading.title?'active':''} onClick={()=>setSelectedReading(reading)}><div><b>{reading.title}</b><span>{reading.level} · {reading.words} palabras</span></div><small>{reading.skill}</small></button>)}</div><div className="premium-card reading-player"><div className="reading-cover" style={{backgroundImage:'url(https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1200&q=85)'}}><span>{selectedReading.level}</span></div><span className="eyebrow">{selectedReading.skill}</span><h2>{selectedReading.title}</h2><p>Una lectura original graduada con vocabulario contextualizado, preguntas de comprensión y apoyos para lectura acompañada.</p><div className="reader-metrics"><div><b>{selectedReading.words}</b><small>palabras</small></div><div><b>4</b><small>preguntas</small></div><div><b>3</b><small>niveles de apoyo</small></div></div><div className="reader-actions"><button className="btn btn-primary"><Play/>Iniciar lectura</button><button className="btn btn-soft">Vista docente</button><button className="btn btn-soft">Imprimir</button></div></div></section>}
 </AppShell>
}
