'use client'

import {useEffect,useState} from 'react'
import {Award,BarChart3,BookOpen,CalendarDays,CheckCircle2,ChevronRight,Clock3,Download,Gamepad2,LogOut,Mail,MessageCircleMore,School,ShieldCheck,Target,TrendingUp,UserRound} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

type Child={id:string;name:string;level:string;progress:number;attendance:number;xp:number}

export default function FamilyDashboard(){
 const[child,setChild]=useState<Child>({id:'demo',name:'Sofía González',level:'3.º básico A',progress:74,attendance:92,xp:1240})
 const[connected,setConnected]=useState(false)

 useEffect(()=>{
  const client=createSupabaseBrowserClient()
  if(!client)return
  client.auth.getUser().then(async({data})=>{
   if(!data.user)return
   const{data:link}=await client.from('guardian_students').select('student_id,students(full_name)').eq('guardian_id',data.user.id).limit(1).maybeSingle()
   if(!link?.student_id)return
   const{data:progress}=await client.from('game_progress').select('progress_percent,xp_earned').eq('student_id',link.student_id).order('updated_at',{ascending:false}).limit(1).maybeSingle()
   const{data:support}=await client.from('student_support_profiles').select('attendance_rate').eq('student_id',link.student_id).maybeSingle()
   setChild(current=>({...current,id:link.student_id,name:(link as any)?.students?.full_name||current.name,progress:progress?.progress_percent||current.progress,xp:progress?.xp_earned||current.xp,attendance:Number(support?.attendance_rate||current.attendance)}))
   setConnected(true)
  })
 },[])

 async function signOut(){const client=createSupabaseBrowserClient();await client?.auth.signOut();window.location.assign('/login')}

 return <main className="family-portal-v2">
  <header className="family-topbar-v2"><a href="/familia" className="family-logo-v2"><span>Y</span><strong>YOYOLETRASAI</strong><small>Portal de familias</small></a><nav><a href="#progreso">Progreso</a><a href="#agenda">Agenda</a><a href="#mensajes">Mensajes</a></nav><div><span className={connected?'connected':''}><i/>{connected?'Datos sincronizados':'Vista demostrativa'}</span><button onClick={signOut}><LogOut/>Salir</button></div></header>
  <div className="family-content-v2">
   <section className="family-welcome-v2"><div><span><ShieldCheck/> INFORMACIÓN SEGURA Y ACTUALIZADA</span><h1>Hola, familia de {child.name.split(' ')[0]} 👋</h1><p>Aquí encontrarás avances, asistencia, próximos hitos y mensajes del equipo educativo.</p></div><div className="family-child-card-v2"><span className="family-avatar-v2">SG</span><div><strong>{child.name}</strong><small>{child.level} · Colegio Coyam</small></div><button><ChevronRight/></button></div></section>

   <section className="family-stat-grid-v2"><article><span><TrendingUp/></span><div><strong>{child.progress}%</strong><small>Progreso general</small></div><em>+8% este mes</em></article><article><span><School/></span><div><strong>{child.attendance}%</strong><small>Asistencia</small></div><em>En buen rango</em></article><article><span><Award/></span><div><strong>{child.xp}</strong><small>Puntos XP</small></div><em>6 insignias</em></article><article><span><CheckCircle2/></span><div><strong>18</strong><small>Actividades terminadas</small></div><em>3 esta semana</em></article></section>

   <section className="family-main-grid-v2" id="progreso">
    <article className="family-progress-card-v2"><header><div><span>APRENDIZAJE</span><h2>Progreso por habilidad</h2><p>Resumen de las evidencias registradas por el equipo docente.</p></div><button><Download/>Descargar informe</button></header><div className="family-skill-list-v2"><div><span className="skill-icon-v2 violet"><BookOpen/></span><div><strong>Comprensión lectora</strong><small>Identifica información e infiere a partir de pistas.</small></div><span className="family-progress-bar-v2"><i style={{width:'78%'}}/></span><em>78%</em></div><div><span className="skill-icon-v2 mint"><Target/></span><div><strong>Inferencias sencillas</strong><small>Avanza con apoyos visuales y preguntas graduadas.</small></div><span className="family-progress-bar-v2"><i style={{width:'64%'}}/></span><em>64%</em></div><div><span className="skill-icon-v2 blue"><Gamepad2/></span><div><strong>Aprendizaje mediante juego</strong><small>Completa misiones y sostiene la atención.</small></div><span className="family-progress-bar-v2"><i style={{width:'86%'}}/></span><em>86%</em></div></div></article>

    <aside className="family-summary-v2"><article><span><UserRound/></span><div><small>FORTALEZA DESTACADA</small><h3>Participación y motivación</h3><p>{child.name.split(' ')[0]} responde muy bien a experiencias visuales, juegos y actividades breves.</p></div></article><article><span><Target/></span><div><small>PRÓXIMO FOCO</small><h3>Justificar sus respuestas</h3><p>Se reforzará el uso de pistas del texto para explicar inferencias.</p></div></article></aside>
   </section>

   <section className="family-lower-grid-v2">
    <article id="agenda"><header><div><span>AGENDA</span><h2>Próximas actividades</h2></div><CalendarDays/></header><div className="family-agenda-list-v2"><div><time>30 JUL</time><span><BookOpen/></span><div><strong>Lectura guiada</strong><small>Texto breve con apoyo visual</small></div></div><div><time>01 AGO</time><span><Gamepad2/></span><div><strong>Misión 3D</strong><small>Bosque de las inferencias</small></div></div><div><time>05 AGO</time><span><BarChart3/></span><div><strong>Revisión de avances</strong><small>Registro del equipo PIE</small></div></div></div></article>

    <article id="mensajes"><header><div><span>COMUNICACIÓN</span><h2>Mensajes recientes</h2></div><MessageCircleMore/></header><div className="family-message-v2"><span>ER</span><div><strong>Elba Rosales · Docente PIE</strong><small>Hoy, 12:20</small><p>Sofía participó con entusiasmo en la lectura guiada. Continuaremos reforzando la justificación de sus respuestas.</p><button><Mail/>Responder mensaje</button></div></div></article>
   </section>
  </div>
 </main>
}
