'use client'

import {useState} from 'react'
import {Award,CheckCircle2,Crown,Gift,Medal,Plus,Sparkles,Star,Trophy,Users,Zap} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const challenges=[
 {title:'Detectives de pistas',group:'3.º básico',goal:'Completar 3 misiones de inferencias',reward:'150 XP',progress:68,tone:'violet'},
 {title:'Lectores constantes',group:'Grupo PIE',goal:'Leer 10 minutos durante 5 días',reward:'Insignia especial',progress:80,tone:'mint'},
 {title:'Maestros del cálculo',group:'5.º básico',goal:'Resolver 20 desafíos matemáticos',reward:'200 XP',progress:45,tone:'amber'}
]

export default function Gamificacion(){
 const[celebrated,setCelebrated]=useState(false)
 return <ModuleShell active="Gamificación">
  <section className="gamification-head"><div><span className="module-eyebrow"><Sparkles size={15}/> Motivación con propósito</span><h1>Gamificación y recompensas</h1><p>Crea desafíos, niveles, insignias y celebraciones vinculadas a evidencias reales de aprendizaje.</p></div><button onClick={()=>setCelebrated(true)}><Plus/>Crear desafío</button></section>

  {celebrated&&<div className="celebration-banner"><Sparkles/><span><strong>¡Nuevo desafío preparado!</strong><small>Revisa objetivos y recompensas antes de publicarlo.</small></span><button onClick={()=>setCelebrated(false)}>Cerrar</button></div>}

  <section className="gamification-summary"><article><span><Trophy/></span><div><strong>12</strong><small>desafíos activos</small></div></article><article><span><Users/></span><div><strong>28</strong><small>estudiantes participando</small></div></article><article><span><Zap/></span><div><strong>4.850</strong><small>XP obtenidos</small></div></article><article><span><Medal/></span><div><strong>36</strong><small>insignias entregadas</small></div></article></section>

  <section className="gamification-layout"><main><div className="gamification-section-head"><div><small>DESAFÍOS DEL CURSO</small><h2>Misiones activas</h2></div><button><Plus/>Nueva misión</button></div><div className="challenge-list">{challenges.map(challenge=><article key={challenge.title} className={`tone-${challenge.tone}`}><span className="challenge-icon"><TargetIcon tone={challenge.tone}/></span><div><h3>{challenge.title}</h3><p>{challenge.group} · {challenge.goal}</p><div className="challenge-progress"><span><i style={{width:`${challenge.progress}%`}}/></span><strong>{challenge.progress}%</strong></div></div><em>{challenge.reward}</em></article>)}</div></main><aside><div className="leaderboard-head"><Crown/><div><small>CLASIFICACIÓN COOPERATIVA</small><h2>Equipos destacados</h2></div></div>{[['Equipo Estrella','1.240 XP','⭐'],['Exploradores','1.080 XP','🧭'],['Lectores Valientes','960 XP','📚']].map(([name,xp,icon],index)=><div className="leader-row" key={name}><span>{index+1}</span><i>{icon}</i><div><strong>{name}</strong><small>{xp}</small></div>{index===0&&<Crown/>}</div>)}<div className="reward-box"><Gift/><div><strong>Próxima recompensa</strong><p>El curso está a 320 XP de desbloquear una celebración grupal.</p><span><i style={{width:'74%'}}/></span></div></div></aside></section>

  <section className="badge-showcase"><div><small>COLECCIÓN</small><h2>Insignias disponibles</h2></div><div>{[['Lector constante','📖'],['Gran compañero','🤝'],['Detective de pistas','🔎'],['Mente matemática','🧠'],['Científico curioso','🔬']].map(([name,icon])=><article key={name}><span>{icon}</span><strong>{name}</strong><small><CheckCircle2/>Criterios configurables</small></article>)}</div></section>
 </ModuleShell>
}

function TargetIcon({tone}:{tone:string}){return tone==='violet'?<Star/>:tone==='mint'?<Award/>:<Medal/>}
