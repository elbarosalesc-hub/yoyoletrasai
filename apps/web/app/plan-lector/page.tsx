import Link from 'next/link'
import {BookOpenCheck,ChartNoAxesCombined,Clock3,Headphones,Library,Mic2,Target} from 'lucide-react'
import {AppShell} from '@/components/AppShell'

const steps=[
 {title:'Diagnóstico lector',detail:'Precisión, ritmo, fluidez y comprensión inicial',status:'Disponible',href:'/herramientas/aula'},
 {title:'Ruta personalizada',detail:'Textos y habilidades según nivel de desempeño',status:'Activa',href:'/biblioteca'},
 {title:'Lectura acompañada',detail:'Modelado, audio, vocabulario y apoyos visuales',status:'Disponible',href:'/biblioteca/idea-principal'},
 {title:'Comprensión progresiva',detail:'Información explícita, secuencia, inferencias e idea principal',status:'Activa',href:'/biblioteca/secuencia-cuento'},
 {title:'Seguimiento y evidencia',detail:'Registro de palabras por minuto y avance por habilidad',status:'Conectado',href:'/seguimiento/evidencias'},
]

const collections=[
 {icon:'🌿',title:'Lecturas breves 3.º básico',description:'Textos originales con vocabulario accesible, secuencia e inferencias sencillas.',href:'/biblioteca?area=lectura'},
 {icon:'🔎',title:'Detectives de información',description:'Actividades para localizar datos explícitos y justificar respuestas.',href:'/biblioteca/idea-principal'},
 {icon:'🎭',title:'Personajes y ambientes',description:'Reconocimiento de rasgos, motivaciones, espacios y relaciones.',href:'/biblioteca/personajes-ambiente'},
]

export default function PlanLector(){
 return <AppShell active="Plan lector">
  <section className="centres-hero">
   <div className="centres-hero-copy"><span className="eyebrow"><BookOpenCheck size={16}/> Plan lector adaptativo</span><h1>Leer con propósito, apoyo y progreso visible</h1><p>Organiza rutas lectoras por curso y estudiante, combina fluidez con comprensión y registra evidencias sin separar el trabajo pedagógico del seguimiento.</p><div className="centres-hero-actions"><Link className="btn btn-primary" href="/biblioteca?area=lectura">Explorar lecturas</Link><Link className="btn btn-soft" href="/crear?tipo=lectura">Crear texto original</Link></div></div>
   <div className="centres-hero-panel"><div><strong>4</strong><span>habilidades por ruta</span></div><div><strong>1–12</strong><span>niveles escolares</span></div><div><strong>DUA</strong><span>apoyos configurables</span></div></div>
  </section>

  <section className="reader-dashboard" style={{marginTop:24}}>
   <article className="reader-panel premium-card"><span className="eyebrow"><Target size={15}/> Ruta pedagógica</span><h2>Secuencia de trabajo lector</h2><div className="reader-path">{steps.map((step,index)=><Link className="reader-step" href={step.href} key={step.title}><span>{index+1}</span><div><strong>{step.title}</strong><small>{step.detail}</small></div><em>{step.status}</em></Link>)}</div></article>
   <aside className="reader-panel premium-card"><span className="eyebrow"><ChartNoAxesCombined size={15}/> Panel del curso</span><h2>Indicadores centrales</h2><div className="reader-metrics"><div><strong>PPM</strong><span>Velocidad lectora</span></div><div><strong>%</strong><span>Precisión</span></div><div><strong>4</strong><span>Niveles de comprensión</span></div><div><strong>OA</strong><span>Progreso curricular</span></div></div><div className="centre-actions"><Link className="btn btn-primary" href="/progreso">Ver progreso</Link><Link className="btn btn-soft" href="/herramientas/aula"><Clock3 size={16}/>Medir lectura</Link></div></aside>
  </section>

  <section className="premium-card reader-panel" style={{marginTop:24}}><span className="eyebrow"><Library size={15}/> Colecciones iniciales</span><h2>Recursos listos para aplicar</h2><div className="reader-books">{collections.map(book=><article className="reader-book" key={book.title}><span>{book.icon}</span><h3>{book.title}</h3><p>{book.description}</p><Link href={book.href}>Abrir colección →</Link></article>)}</div></section>

  <section className="centres-quality premium-card"><div><span className="eyebrow"><Headphones size={15}/> Accesibilidad incorporada</span><h2>Una misma lectura, distintas formas de acceso y respuesta</h2></div><div className="centres-quality-grid"><span><Mic2 size={17}/>Lectura oral registrada</span><span><Headphones size={17}/>Audio y lectura modelada</span><span><BookOpenCheck size={17}/>Letra e interlineado adaptables</span><span><Target size={17}/>Preguntas graduadas</span></div></section>
 </AppShell>
}
