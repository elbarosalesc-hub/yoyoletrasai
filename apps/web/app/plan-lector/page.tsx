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
  <section className="center-hero">
   <div className="center-hero-copy"><span className="eyebrow"><BookOpenCheck size={16}/> Plan lector adaptativo</span><h1>Leer con propósito, apoyo y progreso visible</h1><p>Organiza rutas lectoras por curso y estudiante, combina fluidez con comprensión y registra evidencias sin separar el trabajo pedagógico del seguimiento.</p><div className="center-hero-actions"><Link className="btn btn-primary" href="/biblioteca?area=lectura">Explorar lecturas</Link><Link className="btn btn-soft" href="/crear?tipo=lectura">Crear texto original</Link></div></div>
   <div className="center-quality-card"><Target/><strong>Ruta completa</strong><span>Diagnóstico · práctica · comprensión · evidencia · retroalimentación</span><div><BookOpenCheck/>Textos originales y graduados</div><div><Headphones/>Audiolectura y modelado</div><div><ChartNoAxesCombined/>Seguimiento individual y grupal</div></div>
  </section>

  <section className="reader-dashboard" style={{display:'grid',gridTemplateColumns:'1.2fr .8fr',gap:20,marginTop:24}}>
   <article className="premium-card" style={{padding:26}}><span className="eyebrow"><Target size={15}/> Ruta pedagógica</span><h2>Secuencia de trabajo lector</h2><div style={{display:'grid',gap:10}}>{steps.map((step,index)=><Link href={step.href} key={step.title} style={{display:'grid',gridTemplateColumns:'40px 1fr auto',gap:12,alignItems:'center',padding:14,border:'1px solid #e2e7f0',borderRadius:15,textDecoration:'none',color:'inherit'}}><span style={{display:'grid',placeItems:'center',width:36,height:36,borderRadius:12,background:'#eef2ff',fontWeight:900}}>{index+1}</span><div style={{display:'grid'}}><strong>{step.title}</strong><small style={{color:'#667085'}}>{step.detail}</small></div><em style={{fontStyle:'normal',fontSize:12,fontWeight:800,color:'#4f46e5'}}>{step.status}</em></Link>)}</div></article>
   <aside className="premium-card" style={{padding:26}}><span className="eyebrow"><ChartNoAxesCombined size={15}/> Panel del curso</span><h2>Indicadores centrales</h2><div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,margin:'18px 0'}}><div className="premium-card" style={{padding:16}}><strong style={{fontSize:24}}>PPM</strong><p>Velocidad lectora</p></div><div className="premium-card" style={{padding:16}}><strong style={{fontSize:24}}>%</strong><p>Precisión</p></div><div className="premium-card" style={{padding:16}}><strong style={{fontSize:24}}>4</strong><p>Niveles de comprensión</p></div><div className="premium-card" style={{padding:16}}><strong style={{fontSize:24}}>OA</strong><p>Progreso curricular</p></div></div><div className="center-hero-actions"><Link className="btn btn-primary" href="/progreso">Ver progreso</Link><Link className="btn btn-soft" href="/herramientas/aula"><Clock3 size={16}/>Medir lectura</Link></div></aside>
  </section>

  <section className="premium-card" style={{padding:26,marginTop:24}}><span className="eyebrow"><Library size={15}/> Colecciones iniciales</span><h2>Recursos listos para aplicar</h2><div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:14}}>{collections.map(book=><article className="premium-card" style={{padding:20}} key={book.title}><span style={{fontSize:34}}>{book.icon}</span><h3>{book.title}</h3><p style={{color:'#667085',lineHeight:1.55}}>{book.description}</p><Link href={book.href}>Abrir colección →</Link></article>)}</div></section>

  <section className="center-principles"><div><strong><Mic2 size={18}/> Oral</strong><span>Lectura y respuestas registrables</span></div><div><strong><Headphones size={18}/> Audio</strong><span>Modelado y acceso multimodal</span></div><div><strong><BookOpenCheck size={18}/> Adaptable</strong><span>Letra, espaciado y extensión graduables</span></div><div><strong><Target size={18}/> Progresivo</strong><span>Preguntas literales, inferenciales y críticas</span></div></section>
 </AppShell>
}
