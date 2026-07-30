import {Accessibility,BarChart3,BookOpen,Bot,Boxes,CalendarDays,ChevronRight,ClipboardCheck,Clock3,FolderKanban,Images,Medal,Presentation,Sparkles,Target,Trophy,Users,Volume2} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'
import {DashboardImmersiveHero} from '@/components/v2/DashboardImmersiveHero'
import {getDashboardSnapshot} from '@/lib/dashboard-data'

const immersiveTools=[
  {label:'Mundos 3D',description:'3 mundos y 15 misiones',icon:Boxes,href:'/juegos'},
  {label:'Profesor virtual',description:'Voz, modelado y preguntas',icon:Presentation,href:'/profesor-virtual'},
  {label:'Biblioteca',description:'Recursos curriculares',icon:BookOpen,href:'/biblioteca'},
  {label:'Tareas',description:'Asignación y seguimiento',icon:ClipboardCheck,href:'/tareas'},
  {label:'Portafolios',description:'Evidencias por estudiante',icon:FolderKanban,href:'/portafolios'},
  {label:'Gamificación',description:'XP, logros y desafíos',icon:Trophy,href:'/gamificacion'},
  {label:'Audio',description:'Ambientes y voces',icon:Volume2,href:'/audio'},
  {label:'Recursos PIE',description:'Apoyos y adecuaciones',icon:Accessibility,href:'/recursos-pie'},
  {label:'Multimedia',description:'Imágenes, audio y escenas',icon:Images,href:'/multimedia'}
]

export default async function TeacherDashboard(){
  const snapshot=await getDashboardSnapshot()
  const hours=Math.floor(snapshot.learningMinutes/60)
  const minutes=snapshot.learningMinutes%60
  const metrics=[
    {value:String(snapshot.activeStudents),label:'Estudiantes activos',icon:Users},
    {value:String(snapshot.completedActivities),label:'Actividades completadas',icon:Target},
    {value:`${hours}h ${minutes}m`,label:'Tiempo de aprendizaje',icon:Clock3},
    {value:String(snapshot.achievements),label:'Logros obtenidos',icon:Medal}
  ]

  return <ModuleShell active="Inicio">
    <main className="world-dashboard-v3">
      <header className="world-dashboard-head">
        <div><span><Sparkles/>MUNDO EDUCATIVO EN VIVO</span><h1>¡Hola, {snapshot.teacherName}!</h1><p>Tu aula, tus misiones y YOYO reunidos dentro de una experiencia inmersiva.</p></div>
        <a href="/estudio-inmersivo"><Sparkles/>Crear experiencia</a>
      </header>

      <section className="world-hud-metrics" aria-label="Resumen pedagógico">
        {metrics.map(({value,label,icon:Icon})=><article key={label}><Icon/><div><strong>{value}</strong><span>{label}</span></div></article>)}
      </section>

      <section className="world-dashboard-stage">
        <DashboardImmersiveHero/>
        <aside className="world-dashboard-rail">
          <article className="world-agenda-card"><div className="world-card-title"><span><CalendarDays/>AGENDA DE HOY</span><a href="/calendario">Ver todo<ChevronRight/></a></div><div className="world-agenda-list"><div><time>09:15</time><i/><span><strong>Lectura guiada</strong><small>3.º básico · Sala 5</small></span></div><div className="active"><time>10:30</time><i/><span><strong>Comprensión lectora</strong><small>Grupo de apoyo PIE</small></span><em>Ahora</em></div><div><time>12:00</time><i/><span><strong>Revisión de avances</strong><small>Equipo multidisciplinario</small></span></div></div></article>
          <article className="world-yoyo-card"><div className="world-yoyo-orb"><Bot/></div><div><span>PROFESOR VIRTUAL</span><h2>YOYO está listo</h2><p>Puede narrar, modelar, hacer preguntas y adaptar la misión según las necesidades del grupo.</p><a href="/profesor-virtual">Iniciar presentación<ChevronRight/></a></div></article>
          <article className="world-progress-card"><BarChart3/><div><span>PROGRESO SEMANAL</span><strong>+{snapshot.weeklyGrowth}%</strong><p>{snapshot.participation}% de participación · {snapshot.activeGroups} grupos activos</p><i><b style={{width:`${Math.min(100,snapshot.participation)}%`}}/></i></div></article>
        </aside>
      </section>

      <section className="world-app-dock" aria-label="Aplicaciones educativas">
        {immersiveTools.map(({label,description,icon:Icon,href})=><a href={href} key={label}><span><Icon/></span><div><strong>{label}</strong><small>{description}</small></div></a>)}
      </section>
    </main>
  </ModuleShell>
}