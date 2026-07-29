'use client'

import {useMemo,useState} from 'react'
import {
  Accessibility,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Gamepad2,
  Headphones,
  Lock,
  Medal,
  Play,
  Search,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
  Volume2
} from 'lucide-react'
import {ModuleShell,ModuleStat} from '@/components/v2/ModuleShell'
import {ForestScene} from '@/components/v2/ForestScene'

const games=[
 {title:'Bosque de las inferencias',subject:'Lenguaje',level:'3.º básico',skill:'Inferencias sencillas',progress:60,players:18,difficulty:3,tone:'forest',featured:true},
 {title:'Ruta de lectura',subject:'Lenguaje',level:'3.º básico',skill:'Fluidez y secuencia',progress:42,players:14,difficulty:2,tone:'violet'},
 {title:'Ciudad de las centenas',subject:'Matemática',level:'3.º básico',skill:'Valor posicional',progress:71,players:21,difficulty:3,tone:'blue'},
 {title:'Mercado matemático',subject:'Matemática',level:'5.º básico',skill:'Resolución de problemas',progress:34,players:11,difficulty:4,tone:'amber'},
 {title:'Laboratorio fraccional',subject:'Matemática',level:'5.º básico',skill:'Fracciones',progress:27,players:9,difficulty:4,tone:'mint'},
 {title:'Exploradores del cuerpo',subject:'Ciencias',level:'5.º básico',skill:'Sistemas del cuerpo',progress:54,players:16,difficulty:3,tone:'coral'}
]

export default function JuegosV2(){
 const[query,setQuery]=useState('')
 const[subject,setSubject]=useState('Todas')
 const[preview,setPreview]=useState<string|null>(null)
 const filtered=useMemo(()=>games.filter(game=>{
  const text=`${game.title} ${game.subject} ${game.level} ${game.skill}`.toLowerCase()
  return text.includes(query.toLowerCase())&&(subject==='Todas'||game.subject===subject)
 }),[query,subject])
 const featured=games[0]

 return <ModuleShell active="Juegos">
  <section className="games-hero-v2">
   <div className="games-hero-copy-v2">
    <span className="module-eyebrow"><Sparkles size={15}/> Experiencias inmersivas y accesibles</span>
    <h1>Aprender jugando, con <span>propósito pedagógico</span></h1>
    <p>Explora juegos alineados al currículum, con niveles progresivos, apoyos accesibles y seguimiento docente.</p>
    <div className="games-hero-actions-v2"><button onClick={()=>setPreview(featured.title)}><Play/>Iniciar juego destacado</button><a href="#catalogo"><BookOpen/>Ver catálogo</a></div>
    <div className="games-access-v2"><span><Headphones/>Narración</span><span><Accessibility/>Accesibilidad</span><span><BarChart3/>Analítica</span></div>
   </div>
   <div className="games-featured-visual-v2"><ForestScene/><div className="games-visual-overlay-v2"/><div className="games-featured-copy-v2"><span>DESTACADO</span><h2>{featured.title}</h2><p>{featured.skill} · {featured.level}</p><div><strong>{featured.progress}%</strong><small>progreso promedio</small></div></div></div>
  </section>

  <section className="module-stats-grid games-stats-v2">
   <ModuleStat icon={Gamepad2} value="6" label="juegos publicados" tone="violet"/>
   <ModuleStat icon={Users} value="28" label="estudiantes activos" tone="mint"/>
   <ModuleStat icon={TrendingUp} value="64%" label="progreso promedio" tone="blue"/>
   <ModuleStat icon={Medal} value="17" label="misiones completadas" tone="amber"/>
  </section>

  <section className="games-toolbar-v2" id="catalogo">
   <div><span className="section-kicker-v2">CATÁLOGO</span><h2>Juegos disponibles</h2><p>Selecciona una experiencia según nivel, asignatura o habilidad.</p></div>
   <div className="games-filters-v2"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar juego..."/></label><label><Filter/><select value={subject} onChange={event=>setSubject(event.target.value)}><option>Todas</option><option>Lenguaje</option><option>Matemática</option><option>Ciencias</option></select></label></div>
  </section>

  <section className="games-grid-v2">
   {filtered.map(game=><article className={`game-library-card-v2 tone-${game.tone}`} key={game.title}>
    <div className="game-cover-v2">{game.featured?<ForestScene/>:<span className="game-emoji-v2">{game.subject==='Lenguaje'?'📚':game.subject==='Matemática'?'🧠':'🔬'}</span>}<div className="cover-shade-v2"/><span className="game-subject-v2">{game.subject}</span><button aria-label={`Vista previa de ${game.title}`} onClick={()=>setPreview(game.title)}><Eye/></button></div>
    <div className="game-card-body-v2"><div className="game-card-title-v2"><div><h3>{game.title}</h3><p>{game.skill}</p></div><span>{game.level}</span></div><div className="game-meta-v2"><span><Users/>{game.players} jugadores</span><span><Target/>Nivel {game.difficulty}/5</span><span><Volume2/>Audio</span></div><div className="game-progress-row-v2"><span><i style={{width:`${game.progress}%`}}/></span><strong>{game.progress}%</strong></div><div className="game-card-actions-v2"><button onClick={()=>setPreview(game.title)}><Play/>Iniciar</button><a href="/informes"><BarChart3/>Analítica</a></div></div>
   </article>)}
  </section>

  <section className="games-bottom-grid-v2">
   <article className="games-insight-v2"><span><Sparkles/></span><div><small>RECOMENDACIÓN DE YOYO</small><h3>Refuerza inferencias antes de avanzar</h3><p>El grupo de comprensión guiada presenta mejor respuesta cuando las pistas se entregan de forma visual y gradual.</p><button>Asignar Bosque de las inferencias</button></div></article>
   <article className="games-accessibility-card-v2"><div><span><Accessibility/></span><h3>Diseño inclusivo</h3><p>Todos los juegos incluyen navegación por teclado, reducción de movimiento, contraste alto y narración opcional.</p></div><ul><li><CheckCircle2/>Instrucciones breves</li><li><CheckCircle2/>Lectura en voz alta</li><li><CheckCircle2/>Dificultad progresiva</li></ul></article>
   <article className="games-progress-card-v2"><div><span><Clock3/></span><div><small>TIEMPO DE JUEGO</small><strong>2h 35m</strong><p>Esta semana</p></div></div><div><span><Star/></span><div><small>LOGROS</small><strong>12</strong><p>Obtenidos este mes</p></div></div></article>
  </section>

  {preview&&<div className="game-preview-modal-v2" role="dialog" aria-modal="true" aria-label={`Vista previa de ${preview}`}><button className="modal-backdrop-v2" onClick={()=>setPreview(null)} aria-label="Cerrar vista previa"/><article><div className="modal-game-visual-v2"><ForestScene/><div/></div><div className="modal-game-content-v2"><span>VISTA PREVIA</span><h2>{preview}</h2><p>Explora una experiencia progresiva con pistas, narración, retroalimentación inmediata y registro de avance.</p><div className="modal-feature-list-v2"><span><CheckCircle2/>5 niveles</span><span><CheckCircle2/>Narración</span><span><CheckCircle2/>Analítica docente</span></div><div className="modal-actions-v2"><button onClick={()=>setPreview(null)}><Play/>Comenzar misión</button><button onClick={()=>setPreview(null)}>Cerrar</button></div></div></article></div>}
 </ModuleShell>
}
