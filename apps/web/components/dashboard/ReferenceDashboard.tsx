'use client'

import Link from 'next/link'
import {useMemo,useState} from 'react'
import {Bell,BookOpen,Bot,CalendarDays,ChevronLeft,ChevronRight,ClipboardCheck,Clock3,Eye,FileText,Gamepad2,Music2,Pause,Play,Plus,Sparkles,Target,Trophy,Users,Volume2,VolumeX} from 'lucide-react'
import {ForestHeroArtwork,PremiumCardArtwork} from './PremiumArtwork'

type Activity={title:string;subject:string;oa:string;level:string;format:string;kind:'nature'|'reading'|'writing'|'math'|'science'|'teacher'|'sequence';date:string}

const activities:Activity[]=[
 {title:'Comprensión lectora: Cuentos',subject:'Lenguaje',oa:'OA 4',level:'3.º básico',format:'Juego + guía',kind:'reading',date:'20 de mayo'},
 {title:'Secuencia de eventos',subject:'Lectura',oa:'OA 2',level:'3.º básico',format:'Actividad interactiva',kind:'sequence',date:'21 de mayo'},
 {title:'Multiplicaciones divertidas',subject:'Matemática',oa:'OA 3',level:'4.º básico',format:'Mini desafío',kind:'math',date:'Mañana'},
 {title:'Trazo de la letra M manuscrita',subject:'Caligrafía',oa:'Nivel 1',level:'1.º básico',format:'Digital + PDF',kind:'writing',date:'Miércoles'},
 {title:'Estados del agua',subject:'Ciencias',oa:'OA 9',level:'4.º básico',format:'Simulación',kind:'science',date:'Viernes'}
]

const quickActions=[
 {label:'Nueva actividad',href:'/crear',icon:BookOpen,tone:'violet'},
 {label:'Mis recursos',href:'/biblioteca',icon:Target,tone:'green'},
 {label:'YOYO asistente',href:'/profesor-virtual',icon:Bot,tone:'blue'},
 {label:'Generar informe',href:'/informes',icon:FileText,tone:'gold'}
] as const

const achievements=[
 ['Lector ágil','15','reading'],['Genio de los números','25','math'],['Científico curioso','10','science'],['Escritor creativo','18','writing'],['Ayudante estrella','30','teacher']
] as const

export default function ReferenceDashboard(){
 const[sound,setSound]=useState(true)
 const[playing,setPlaying]=useState(false)
 const[index,setIndex]=useState(0)
 const visible=useMemo(()=>[0,1,2,3,4].map(i=>activities[(i+index)%activities.length]),[index])
 return <div className="ref-dashboard approved-dashboard">
  <section className="approved-welcome-row">
   <div className="approved-welcome-copy">
    <span className="approved-eyebrow">Panel docente inteligente</span>
    <h1>¡Bienvenida, YoYo Profe! <span aria-hidden="true">👋</span></h1>
    <p>Hoy es un gran día para crear experiencias de aprendizaje.</p>
   </div>
   <div className="approved-welcome-actions">
    <button className="approved-notification" aria-label="Notificaciones"><Bell/><span>3</span></button>
    <Link href="/crear" className="approved-create"><span>Crear actividad</span><Plus/></Link>
   </div>
  </section>

  <section className="approved-stats" aria-label="Resumen de actividad">
   <article className="approved-stat stat-violet"><span><Users/></span><div><strong>28</strong><small>de 32 activos</small><em>Estudiantes</em></div></article>
   <article className="approved-stat stat-green"><span><Target/></span><div><strong>15</strong><small>actividades realizadas</small><em>Este mes</em></div></article>
   <article className="approved-stat stat-blue"><span><Clock3/></span><div><strong>2h 35m</strong><small>tiempo de aprendizaje</small><em>Esta semana</em></div></article>
   <article className="approved-stat stat-gold"><span><Trophy/></span><div><strong>12</strong><small>logros obtenidos</small><em>¡Sigue así!</em></div></article>
  </section>

  <section className="approved-hero-section">
   <article className="ref-featured approved-featured">
    <ForestHeroArtwork/>
    <div className="approved-night-overlay"/>
    <div className="ref-featured-content approved-featured-content">
     <span className="approved-game-kicker">Juego inmersivo destacado</span>
     <h2>La aventura del<br/>Bosque Mágico</h2>
     <p>Ayuda a Luma a encontrar los objetos, escuchar pistas y resolver misiones de comprensión lectora.</p>
     <div className="ref-tags approved-tags"><span>Lenguaje</span><span>3.º básico</span><span>Comprensión</span><span>⭐ Niveles: 5</span></div>
     <div className="ref-game-actions approved-game-actions">
      <Link href="/juegos" className="ref-play approved-play"><Play/> Iniciar juego</Link>
      <button className="approved-preview" aria-label={playing?'Pausar vista previa':'Ver vista previa'} onClick={()=>setPlaying(v=>!v)}>{playing?<Pause/>:<Eye/>}<span>Vista previa</span></button>
     </div>
    </div>
    <div className="ref-feature-controls approved-feature-controls">
     <button aria-label="Música"><Music2/></button>
     <button aria-label={sound?'Silenciar':'Activar sonido'} onClick={()=>setSound(v=>!v)}>{sound?<Volume2/>:<VolumeX/>}</button>
     <Link href="/juegos" aria-label="Abrir juego"><Gamepad2/></Link>
    </div>
    <div className="approved-progress-strip">
     <div className="approved-progress-item"><div><span>Progreso del juego</span><strong>60%</strong></div><div className="approved-progress-track"><i style={{width:'60%'}}/></div></div>
     <div className="approved-progress-divider"/>
     <div className="approved-progress-item"><div><span>Pistas encontradas</span><strong>2 / 4</strong></div><div className="approved-progress-track clue"><i style={{width:'50%'}}/></div></div>
    </div>
   </article>
  </section>

  <section className="approved-lower-grid">
   <article className="approved-panel approved-upcoming-panel">
    <div className="approved-section-head"><div><h2>Próximas actividades</h2><p>Tu planificación pedagógica</p></div><Link href="/biblioteca">Ver todas</Link></div>
    <div className="approved-upcoming-grid">{activities.slice(0,2).map(a=><Link href="/biblioteca" key={a.title} className="approved-upcoming-card"><div className="approved-upcoming-art"><PremiumCardArtwork kind={a.kind}/></div><div><b>{a.title}</b><span>{a.level} · {a.subject}</span><small><CalendarDays/>{a.date}</small></div></Link>)}</div>
   </article>

   <aside className="approved-panel approved-actions-panel">
    <div className="approved-section-head"><div><h2>Acciones rápidas</h2><p>Accesos frecuentes</p></div></div>
    <div className="approved-quick-grid">{quickActions.map(({label,href,icon:Icon,tone})=><Link href={href} key={label} className={`approved-quick quick-${tone}`}><span><Icon/></span><b>{label}</b></Link>)}</div>
   </aside>
  </section>

  <section className="ref-bottom-grid approved-extra-grid">
   <article className="ref-recommendations approved-panel">
    <div className="approved-section-head"><div><h2>Recomendado para tus grupos</h2><p>Basado en el progreso y necesidades de apoyo.</p></div><div className="ref-arrows"><button aria-label="Anterior" onClick={()=>setIndex(i=>(i+activities.length-1)%activities.length)}><ChevronLeft/></button><button aria-label="Siguiente" onClick={()=>setIndex(i=>(i+1)%activities.length)}><ChevronRight/></button></div></div>
    <div className="ref-resource-row">{visible.map(a=><article className="ref-resource-card" key={a.title}><span className="ref-resource-subject">{a.subject}</span><PremiumCardArtwork kind={a.kind}/><h3>{a.title}</h3><small>{a.oa} · {a.level}</small><Link href="/biblioteca">Abrir actividad</Link></article>)}</div>
   </article>

   <aside className="ref-week approved-panel">
    <div className="approved-section-head"><div><h2>Nivel de la semana</h2><p>Progreso docente y del curso</p></div></div>
    <div className="ref-level"><div className="ref-star">★</div><div><b>Explorador Experto</b><small>2.450 / 3.000 XP</small></div><div className="ref-medal"><Trophy/></div></div>
    <div className="ref-xp"><i style={{width:'82%'}}/></div>
    <div className="ref-achievement-head"><h3>Logros recientes</h3><Link href="/seguimiento">Ver todos</Link></div>
    <div className="ref-achievements">{achievements.map(([label,score,kind])=><div key={label}><span><PremiumCardArtwork kind={kind}/></span><b>{score}</b><small>{label}</small></div>)}</div>
   </aside>
  </section>
 </div>
}
