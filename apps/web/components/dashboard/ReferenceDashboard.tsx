'use client'

import Link from 'next/link'
import {useMemo,useState} from 'react'
import {BookOpen,CalendarDays,ChevronLeft,ChevronRight,ClipboardCheck,Clock3,Gamepad2,Maximize2,Music2,Pause,Play,Sparkles,Target,Trophy,Users,Volume2,VolumeX} from 'lucide-react'
import {ForestHeroArtwork,PremiumCardArtwork} from './PremiumArtwork'

type Activity={title:string;subject:string;oa:string;level:string;format:string;kind:'nature'|'reading'|'writing'|'math'|'science'|'teacher'|'sequence';date:string}

const activities:Activity[]=[
 {title:'Comprensión lectora: El pingüino viajero',subject:'Lenguaje',oa:'OA 4',level:'3.º básico',format:'Juego + guía',kind:'reading',date:'Hoy'},
 {title:'Multiplicaciones divertidas',subject:'Matemática',oa:'OA 3',level:'4.º básico',format:'Mini desafío',kind:'math',date:'Mañana'},
 {title:'Trazo de la letra M manuscrita',subject:'Caligrafía',oa:'Nivel 1',level:'1.º básico',format:'Digital + PDF',kind:'writing',date:'Miércoles'},
 {title:'Rutina de la mañana',subject:'Pictogramas',oa:'Apoyo visual',level:'Multinivel',format:'Secuencia',kind:'teacher',date:'Jueves'},
 {title:'Estados del agua',subject:'Ciencias',oa:'OA 9',level:'4.º básico',format:'Simulación',kind:'science',date:'Viernes'}
]

const achievements=[
 ['Lector ágil','15','reading'],['Genio de los números','25','math'],['Científico curioso','10','science'],['Escritor creativo','18','writing'],['Ayudante estrella','30','teacher']
] as const

export default function ReferenceDashboard(){
 const[sound,setSound]=useState(true)
 const[playing,setPlaying]=useState(false)
 const[index,setIndex]=useState(0)
 const visible=useMemo(()=>[0,1,2,3,4].map(i=>activities[(i+index)%activities.length]),[index])
 return <div className="ref-dashboard">
  <section className="ref-top-grid">
   <article className="ref-welcome-card ref-card">
    <div className="ref-welcome-copy"><span className="ref-kicker">Panel pedagógico inteligente</span><h1>¡Bienvenida de vuelta, Elba! <span aria-hidden="true">👋</span></h1><p>Hoy es un gran día para inspirar y transformar aprendizajes.</p></div>
    <div className="ref-quick-actions">
     <Link href="/crear" className="ref-action action-violet"><span><Sparkles/></span><div><b>Crear actividad</b><small>Con IA en segundos</small></div></Link>
     <Link href="/biblioteca" className="ref-action action-green"><span><BookOpen/></span><div><b>Buscar recursos</b><small>Por OA o habilidad</small></div></Link>
     <Link href="/juegos" className="ref-action action-blue"><span><Gamepad2/></span><div><b>Juego aleatorio</b><small>¡A jugar y aprender!</small></div></Link>
     <Link href="/evaluaciones" className="ref-action action-orange"><span><ClipboardCheck/></span><div><b>Rúbricas</b><small>Crear o editar</small></div></Link>
    </div>
   </article>
   <aside className="ref-summary-card ref-card">
    <div className="ref-section-head"><div><h2>Resumen del día</h2><p>Actividad actual de tus cursos</p></div><span>Hoy</span></div>
    <div className="ref-summary-grid">
     <div className="ref-stat stat-violet"><span><Users/></span><div><strong>28</strong><small>de 32 activos</small></div></div>
     <div className="ref-stat stat-green"><span><Target/></span><div><strong>15</strong><small>actividades realizadas</small></div></div>
     <div className="ref-stat stat-blue"><span><Clock3/></span><div><strong>2h 35m</strong><small>tiempo de aprendizaje</small></div></div>
     <div className="ref-stat stat-gold"><span><Trophy/></span><div><strong>12</strong><small>logros obtenidos</small></div></div>
    </div>
   </aside>
  </section>

  <section className="ref-middle-grid">
   <article className="ref-featured ref-card">
    <ForestHeroArtwork/>
    <div className="ref-featured-shade"/>
    <div className="ref-featured-content">
     <span className="ref-light-kicker">Juego inmersivo destacado</span>
     <h2>La aventura del Bosque Mágico</h2>
     <p>Ayuda a Luma a encontrar los objetos, escuchar pistas y resolver misiones de comprensión lectora.</p>
     <div className="ref-tags"><span>Lenguaje</span><span>3.º básico</span><span>Comprensión</span><span>⭐ Niveles: 5</span></div>
     <div className="ref-game-actions"><Link href="/juegos" className="ref-play"><Play/> Iniciar juego</Link><button aria-label={playing?'Pausar':'Reproducir'} onClick={()=>setPlaying(v=>!v)}>{playing?<Pause/>:<Play/>}</button></div>
     <div className="ref-progress-box"><div><span>Progreso del juego</span><b>60%</b></div><div className="ref-progress"><i style={{width:'60%'}}/></div><div className="ref-clue-row"><span>Pistas encontradas</span><strong>2 / 4</strong></div></div>
    </div>
    <div className="ref-feature-controls"><button aria-label="Música"><Music2/></button><button aria-label={sound?'Silenciar':'Activar sonido'} onClick={()=>setSound(v=>!v)}>{sound?<Volume2/>:<VolumeX/>}</button><button aria-label="Pantalla completa"><Maximize2/></button></div>
    <div className="ref-mission-map"><div><i>1</i><span>La nota secreta</span></div><div><i>2</i><span>El ave mensajera</span></div><div><i>3</i><span>La cabaña misteriosa</span></div></div>
   </article>

   <aside className="ref-upcoming ref-card">
    <div className="ref-section-head"><div><h2>Próximas actividades</h2><p>Tu planificación pedagógica</p></div><Link href="/biblioteca">Ver todas</Link></div>
    <div className="ref-upcoming-list">{activities.slice(0,3).map(a=><Link href="/biblioteca" key={a.title} className="ref-upcoming-item"><div className="ref-upcoming-art"><PremiumCardArtwork kind={a.kind}/></div><div className="ref-upcoming-copy"><small>{a.format}</small><b>{a.title}</b><span>{a.subject} · {a.oa}</span></div><em><CalendarDays/>{a.date}</em></Link>)}</div>
   </aside>
  </section>

  <section className="ref-bottom-grid">
   <article className="ref-recommendations ref-card">
    <div className="ref-section-head"><div><h2>Recomendado para tus grupos</h2><p>Basado en el progreso y necesidades de apoyo.</p></div><div className="ref-arrows"><button aria-label="Anterior" onClick={()=>setIndex(i=>(i+activities.length-1)%activities.length)}><ChevronLeft/></button><button aria-label="Siguiente" onClick={()=>setIndex(i=>(i+1)%activities.length)}><ChevronRight/></button></div></div>
    <div className="ref-resource-row">{visible.map(a=><article className="ref-resource-card" key={a.title}><span className="ref-resource-subject">{a.subject}</span><PremiumCardArtwork kind={a.kind}/><h3>{a.title}</h3><small>{a.oa} · {a.level}</small><Link href="/biblioteca">Abrir actividad</Link></article>)}</div>
   </article>

   <aside className="ref-week ref-card">
    <div className="ref-section-head"><div><h2>Nivel de la semana</h2><p>Progreso docente y del curso</p></div></div>
    <div className="ref-level"><div className="ref-star">★</div><div><b>Explorador Experto</b><small>2.450 / 3.000 XP</small></div><div className="ref-medal"><Trophy/></div></div>
    <div className="ref-xp"><i style={{width:'82%'}}/></div>
    <div className="ref-achievement-head"><h3>Logros recientes</h3><Link href="/seguimiento">Ver todos</Link></div>
    <div className="ref-achievements">{achievements.map(([label,score,kind])=><div key={label}><span><PremiumCardArtwork kind={kind}/></span><b>{score}</b><small>{label}</small></div>)}</div>
   </aside>
  </section>
 </div>
}
