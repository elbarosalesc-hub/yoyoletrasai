'use client'

import {useMemo,useState} from 'react'
import {Accessibility,BarChart3,BookOpen,CheckCircle2,Filter,Gamepad2,Headphones,Medal,Play,Search,Sparkles,Target,TrendingUp,Users,Volume2} from 'lucide-react'
import {ModuleShell,ModuleStat} from '@/components/v2/ModuleShell'
import {ForestMission3D} from '@/components/v2/ForestMission3D'

const games=[
 {title:'Bosque de las inferencias',subject:'Lenguaje',level:'3.º básico',skill:'Inferencias sencillas',progress:60,players:18,difficulty:3,cover:'/illustrations/bosque-inferencias-premium.svg',featured:true},
 {title:'Ruta de lectura',subject:'Lenguaje',level:'3.º básico',skill:'Fluidez y secuencia',progress:42,players:14,difficulty:2,cover:'/illustrations/bosque-inferencias-premium.svg'},
 {title:'Ciudad de las centenas',subject:'Matemática',level:'3.º básico',skill:'Valor posicional',progress:71,players:21,difficulty:3,cover:'/illustrations/ciudad-numerica-premium.svg'},
 {title:'Mercado matemático',subject:'Matemática',level:'5.º básico',skill:'Resolución de problemas',progress:34,players:11,difficulty:4,cover:'/illustrations/ciudad-numerica-premium.svg'},
 {title:'Laboratorio fraccional',subject:'Matemática',level:'5.º básico',skill:'Fracciones',progress:27,players:9,difficulty:4,cover:'/illustrations/ciudad-numerica-premium.svg'},
 {title:'Exploradores del cuerpo',subject:'Ciencias',level:'5.º básico',skill:'Sistemas del cuerpo',progress:54,players:16,difficulty:3,cover:'/illustrations/laboratorio-vital-premium.svg'}
]

export default function JuegosV3(){
 const[query,setQuery]=useState('')
 const[subject,setSubject]=useState('Todas')
 const[activeGame,setActiveGame]=useState('Bosque de las inferencias')
 const filtered=useMemo(()=>games.filter(game=>`${game.title} ${game.subject} ${game.level} ${game.skill}`.toLowerCase().includes(query.toLowerCase())&&(subject==='Todas'||game.subject===subject)),[query,subject])

 return <ModuleShell active="Juegos 3D">
  <section className="games3d-head">
   <div><span className="module-eyebrow"><Sparkles size={15}/> Laboratorio de experiencias inmersivas</span><h1>Juegos 3D con contenido, voz y seguimiento</h1><p>Cada experiencia combina objetivos curriculares, misiones progresivas, narración, retroalimentación y evidencias de aprendizaje.</p></div>
   <div className="games3d-badges"><span><Gamepad2/>WebGL 3D</span><span><Headphones/>Narración</span><span><Accessibility/>Accesible</span></div>
  </section>

  <ForestMission3D/>

  <section className="module-stats-grid games-stats-v2">
   <ModuleStat icon={Gamepad2} value="6" label="experiencias publicadas" tone="violet"/>
   <ModuleStat icon={Users} value="28" label="estudiantes activos" tone="mint"/>
   <ModuleStat icon={TrendingUp} value="64%" label="progreso promedio" tone="blue"/>
   <ModuleStat icon={Medal} value="17" label="misiones completadas" tone="amber"/>
  </section>

  <section className="games-toolbar-v2" id="catalogo"><div><span className="section-kicker-v2">CATÁLOGO</span><h2>Mundos curriculares ilustrados</h2><p>Selecciona por nivel, asignatura o habilidad.</p></div><div className="games-filters-v2"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar juego..."/></label><label><Filter/><select value={subject} onChange={event=>setSubject(event.target.value)}><option>Todas</option><option>Lenguaje</option><option>Matemática</option><option>Ciencias</option></select></label></div></section>

  <section className="games-grid-v3 illustrated-games-grid">{filtered.map(game=><article className={activeGame===game.title?'active':''} key={game.title}><div className="game-cover-v3 illustrated-cover"><img src={game.cover} alt={`Ilustración de ${game.title}`}/><div className="game-cover-overlay"/><em>{game.subject}</em><i>{game.level}</i><strong>{game.title}</strong></div><div className="game-body-v3"><h3>{game.title}</h3><p>{game.skill}</p><div className="game-info-v3"><span><Users/>{game.players}</span><span><Target/>Nivel {game.difficulty}/5</span><span><Volume2/>Audio</span></div><div className="game-progress-v3"><span><i style={{width:`${game.progress}%`}}/></span><strong>{game.progress}%</strong></div><div className="game-actions-v3"><button onClick={()=>{setActiveGame(game.title);document.querySelector('.immersive-engine-shell')?.scrollIntoView({behavior:'smooth'})}}><Play/>Jugar</button><a href="/analitica"><BarChart3/>Analítica</a></div></div></article>)}</section>

  <section className="games-bottom-grid-v3"><article><span><Sparkles/></span><div><small>RECOMENDACIÓN DE YOYO</small><h3>Refuerza inferencias antes de avanzar</h3><p>El grupo responde mejor cuando las pistas aparecen de forma visual y gradual.</p><button>Asignar misión 1</button></div></article><article><div><span><Accessibility/></span><h3>Diseño inclusivo</h3><p>Navegación por teclado, movimiento reducido, contraste, subtítulos y narración opcional.</p></div><ul><li><CheckCircle2/>Instrucciones breves</li><li><CheckCircle2/>Lectura en voz alta</li><li><CheckCircle2/>Dificultad progresiva</li></ul></article><article><span><BookOpen/></span><div><small>CONTENIDO PEDAGÓGICO</small><h3>3 mundos · 15 misiones</h3><p>Lenguaje, Matemática y Ciencias con retroalimentación y registro de XP.</p></div></article></section>
 </ModuleShell>
}
