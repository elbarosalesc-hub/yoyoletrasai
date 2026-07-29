'use client'

import {useEffect,useState} from 'react'
import {Award,BookOpen,CalendarDays,ChevronRight,Clock3,Gamepad2,Headphones,LogOut,Medal,Play,Sparkles,Star,Target,Trophy} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

type StudentSummary={name:string;progress:number;xp:number;streak:number;missions:number}

export default function StudentDashboard(){
 const[summary,setSummary]=useState<StudentSummary>({name:'Luma',progress:68,xp:1240,streak:5,missions:7})
 const[connected,setConnected]=useState(false)

 useEffect(()=>{
  const client=createSupabaseBrowserClient()
  if(!client)return
  client.auth.getUser().then(async({data})=>{
   if(!data.user)return
   const{data:account}=await client.from('student_accounts').select('student_id,students(full_name)').eq('profile_id',data.user.id).single()
   const studentId=account?.student_id
   if(!studentId)return
   const{data:progress}=await client.from('game_progress').select('progress_percent,xp_earned').eq('student_id',studentId).order('updated_at',{ascending:false}).limit(1).maybeSingle()
   setSummary(current=>({...current,name:(account as any)?.students?.full_name||current.name,progress:progress?.progress_percent||current.progress,xp:progress?.xp_earned||current.xp}))
   setConnected(true)
  })
 },[])

 async function signOut(){const client=createSupabaseBrowserClient();await client?.auth.signOut();window.location.assign('/login')}

 return <main className="student-portal-v2">
  <header className="student-topbar-v2"><a href="/estudiante" className="student-logo-v2"><span>Y</span><strong>YOYOLETRASAI</strong></a><div className="student-top-actions-v2"><span className={connected?'connected':''}><i/>{connected?'Progreso sincronizado':'Modo demostración'}</span><button onClick={signOut}><LogOut/>Salir</button></div></header>
  <div className="student-content-v2">
   <section className="student-welcome-v2"><div><span><Sparkles/> MI AVENTURA DE APRENDIZAJE</span><h1>¡Hola, {summary.name}! 👋</h1><p>Hoy tienes una nueva misión, una lectura con audio y un desafío para ganar una insignia.</p><div><a href="/juegos"><Play/>Continuar misión 3D</a><a href="/contenidos"><BookOpen/>Ver mis contenidos</a></div></div><div className="student-level-v2"><div className="level-ring-v2" style={{'--student-progress':`${summary.progress*3.6}deg`} as React.CSSProperties}><span><strong>{summary.progress}%</strong><small>Nivel 4</small></span></div><p>{summary.xp} XP acumulados</p></div></section>

   <section className="student-stat-grid-v2"><article><span><Star/></span><strong>{summary.xp}</strong><small>Puntos XP</small></article><article><span><Trophy/></span><strong>{summary.missions}</strong><small>Misiones completadas</small></article><article><span><Medal/></span><strong>6</strong><small>Insignias</small></article><article><span><Target/></span><strong>{summary.streak} días</strong><small>Racha de aprendizaje</small></article></section>

   <section className="student-main-grid-v2">
    <article className="student-mission-card-v2"><div className="mission-art-v2"><span>🌙</span><i/><i/></div><div className="student-mission-copy-v2"><span>MISIÓN ACTIVA · LENGUAJE</span><h2>Bosque de las inferencias</h2><p>Explora el bosque, escucha las pistas y descubre qué ocurre en la cabaña.</p><div className="mission-progress-student-v2"><span><i style={{width:`${summary.progress}%`}}/></span><strong>{summary.progress}%</strong></div><a href="/juegos"><Gamepad2/>Entrar a la misión<ChevronRight/></a></div></article>

    <aside className="student-today-v2"><header><div><span>HOY</span><h2>Mi agenda</h2></div><CalendarDays/></header><div><article><time>09:15</time><span><Headphones/></span><div><strong>Lectura con audio</strong><small>El bosque nativo · 12 min</small></div></article><article><time>10:30</time><span><Gamepad2/></span><div><strong>Misión 3D</strong><small>Inferencias · 15 min</small></div></article><article><time>12:00</time><span><Award/></span><div><strong>Desafío semanal</strong><small>Completa 3 actividades</small></div></article></div></aside>
   </section>

   <section className="student-bottom-grid-v2"><article><header><div><span>CONTENIDOS</span><h2>Continúa aprendiendo</h2></div><a href="/contenidos">Ver todos<ChevronRight/></a></header><div className="student-content-cards-v2"><a href="/contenidos"><span>📖</span><div><strong>Lectura y comprensión</strong><small>4 de 6 actividades</small></div></a><a href="/contenidos"><span>🧠</span><div><strong>Inferencias sencillas</strong><small>2 de 5 actividades</small></div></a><a href="/contenidos"><span>✖️</span><div><strong>Multiplicación</strong><small>3 de 8 actividades</small></div></a></div></article><article className="student-achievement-v2"><span><Trophy/></span><div><small>NUEVA INSIGNIA CERCA</small><h2>Explorador del bosque</h2><p>Completa una misión más para desbloquearla.</p><div><span><i style={{width:'80%'}}/></span><strong>4/5</strong></div></div></article></section>
  </div>
 </main>
}
