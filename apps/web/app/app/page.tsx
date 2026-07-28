import Link from 'next/link'
import {AppShell} from '@/components/AppShell'
import {ForestHeroArt,ActivityArtwork} from '@/components/dashboard/DashboardIllustrations'
import {Sparkles,BookOpen,ClipboardCheck,Gamepad2,CalendarDays,Music,Volume2,Trophy,Clock3,Users,Target} from 'lucide-react'
import {premiumActivities} from '@/lib/premiumActivities'

const recommended=premiumActivities.slice(0,4)
const artKinds=['reading','math','writing','science']

export default function Dashboard(){return <AppShell active="Inicio"><div className="premium-dashboard canonical-dashboard">
 <section className="welcome-grid">
  <div className="welcome-card premium-card"><h1>¡Bienvenida de vuelta, Elba! 👋</h1><p>Hoy es un gran día para inspirar y transformar aprendizajes.</p><div className="welcome-actions"><Link href="/crear" className="welcome-action purple"><Sparkles/><span><b>Crear actividad</b><small>Diseña experiencias de aprendizaje</small></span></Link><Link href="/biblioteca" className="welcome-action green"><BookOpen/><span><b>Buscar recursos</b><small>Explora materiales listos para usar</small></span></Link><Link href="/juegos" className="welcome-action blue"><Gamepad2/><span><b>Juego aleatorio</b><small>Aprender jugando es más divertido</small></span></Link><Link href="/evaluaciones" className="welcome-action orange"><ClipboardCheck/><span><b>Rúbricas</b><small>Evalúa y da seguimiento con facilidad</small></span></Link></div></div>
  <aside className="summary-card premium-card"><div className="summary-head"><h2>Resumen del día</h2><span>Hoy</span></div><div className="summary-grid"><div className="summary-stat violet"><Users/><strong>28</strong><span>estudiantes de 32 activos</span></div><div className="summary-stat mint"><Target/><strong>15</strong><span>actividades realizadas</span></div><div className="summary-stat cyan"><Clock3/><strong>2h 35m</strong><span>tiempo de aprendizaje</span></div><div className="summary-stat yellow"><Trophy/><strong>12</strong><span>logros obtenidos</span></div></div></aside>
 </section>
 <section className="dashboard-middle">
  <div className="featured-game premium-card canonical-featured"><ForestHeroArt/><div className="featured-overlay"></div><div className="featured-copy"><span>Juego inmersivo destacado</span><h2>La Aventura del Bosque Mágico</h2><p>Ayuda a Luma a encontrar los objetos, escuchar pistas y resolver misiones de comprensión lectora.</p><div className="game-cta"><Link href="/juegos" className="featured-play">Iniciar juego</Link></div><div className="featured-progress"><div><small>Progreso del juego</small><span><i style={{width:'60%'}}></i></span><strong>60%</strong></div><div><small>Pistas encontradas</small><strong>2 / 4</strong></div></div></div><div className="featured-controls"><button aria-label="Música"><Music/></button><button aria-label="Sonido"><Volume2/></button></div></div>
  <aside className="upcoming premium-card"><div className="section-title"><h2>Próximas actividades</h2><Link href="/biblioteca">Ver todas</Link></div>{premiumActivities.slice(0,3).map((a,i)=><Link href={`/biblioteca/${a.slug}`} className="upcoming-item" key={a.slug}><div className={`upcoming-thumb theme-${i}`}><ActivityArtwork kind={artKinds[i]}/></div><div><small>{a.format}</small><b>{a.title}</b><span>{a.subject} · {a.oa}</span></div><em><CalendarDays size={15}/>{i===0?'Hoy':i===1?'Mañana':'Viernes'}</em></Link>)}</aside>
 </section>
 <section className="dashboard-bottom">
  <div className="recommendations premium-card"><div className="section-title"><div><h2>Recomendado para tus grupos</h2><p>Basado en el progreso y las necesidades de aprendizaje.</p></div><Link href="/biblioteca">Ver todas</Link></div><div className="recommendation-row">{recommended.map((a,i)=><article className={`recommend-card recommendation-${i}`} key={a.slug}><span>{a.subject}</span><ActivityArtwork kind={artKinds[i]}/><h3>{a.title}</h3><small>{a.oa} · {a.level}</small><Link href={`/biblioteca/${a.slug}`}>Abrir actividad</Link></article>)}</div></div>
 </section>
 </div></AppShell>}
