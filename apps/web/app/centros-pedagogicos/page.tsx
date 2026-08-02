'use client'

import Link from 'next/link'
import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {BookOpen,BrainCircuit,CheckCircle2,ChevronRight,FlaskConical,Grid3X3,Image as ImageIcon,PenLine,Search,Sparkles,Shapes} from 'lucide-react'

type Center={
 id:string
 title:string
 eyebrow:string
 description:string
 image:string
 icon:typeof BookOpen
 tone:string
 tools:string[]
 resources:{title:string;detail:string;href:string;badge:string}[]
}

const centers:Center[]=[
 {id:'matematica',title:'MathLab',eyebrow:'Matemática manipulativa e interactiva',description:'Herramientas visuales para número, operaciones, geometría, medición, datos y resolución de problemas, con modelamiento paso a paso.',image:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1400&q=88',icon:Grid3X3,tone:'violet',tools:['Bloques base diez','Recta numérica','Fracciones visuales','Geoplano','Ábaco','Balanza de ecuaciones'],resources:[{title:'Ciudad de las centenas',detail:'Representación y descomposición hasta 1.000.',href:'/biblioteca/valor-posicional',badge:'Manipulativo'},{title:'Laboratorio de división',detail:'Algoritmo visible con comprobación.',href:'/biblioteca/division-paso-a-paso',badge:'Tutor guiado'},{title:'Rompecabezas tabla del 6',detail:'Asociación operación–resultado.',href:'/biblioteca/tabla-6-rompecabezas',badge:'Juego'}]},
 {id:'ciencias',title:'Ciencia Viva',eyebrow:'Experimentación, simulación y observación',description:'Experiencias de ciencias con fotografías reales, hipótesis, variables, registro de evidencias y conclusiones adaptadas por nivel.',image:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1400&q=88',icon:FlaskConical,tone:'cyan',tools:['Laboratorio virtual','Clasificador de seres vivos','Sistema solar 3D','Circuitos eléctricos','Ciclo del agua','Cuerpo humano'],resources:[{title:'Ecosistema en equilibrio',detail:'Red alimentaria y cambios de población.',href:'/biblioteca/ecosistema-equilibrio',badge:'Simulación'},{title:'Misión circuito encendido',detail:'Construcción y prueba de conductores.',href:'/biblioteca/circuito-electrico',badge:'Laboratorio'},{title:'Sistema solar',detail:'Escalas, movimientos y exploración guiada.',href:'/biblioteca/sistema-solar',badge:'Exploración'}]},
 {id:'caligrafia',title:'Estudio de Caligrafía',eyebrow:'Escritura clara, progresiva y accesible',description:'Modelos animados de trazo, pauta configurable, letra imprenta y manuscrita, modos diestro y zurdo, y exportación imprimible.',image:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1400&q=88',icon:PenLine,tone:'rose',tools:['Trazado animado','Pauta doble y caligráfica','Modo zurdo','Control de presión','Abecedario completo','Palabras y oraciones'],resources:[{title:'Letra M',detail:'Fonema, grafema, sílabas y oración.',href:'/biblioteca/caligrafia-m',badge:'Interactivo'},{title:'Abecedario progresivo',detail:'Mayúsculas y minúsculas por familia de trazos.',href:'/caligrafia',badge:'Colección'},{title:'Generador de pautas',detail:'Texto, tamaño, inclinación y espaciado editables.',href:'/caligrafia',badge:'Herramienta'}]},
 {id:'grafomotricidad',title:'Taller Grafomotor',eyebrow:'Coordinación visomotora y preescritura',description:'Recorridos graduados, patrones, laberintos y ejercicios de control motor con estímulos realistas y versiones de baja carga visual.',image:'https://images.unsplash.com/photo-1596464716127-f2a82984de30?auto=format&fit=crop&w=1400&q=88',icon:Shapes,tone:'amber',tools:['Líneas y curvas','Bucles y espirales','Laberintos','Patrones','Coordinación bilateral','Progresión de dificultad'],resources:[{title:'Aventuras de grafomotricidad',detail:'Recorridos con animales y trazos progresivos.',href:'/biblioteca/trazos-animales',badge:'Táctil + PDF'},{title:'Circuitos de precisión',detail:'Caminos estrechos y control del lápiz.',href:'/caligrafia',badge:'Progresivo'},{title:'Patrones rítmicos',detail:'Secuencias gráficas y coordinación.',href:'/caligrafia',badge:'Imprimible'}]},
 {id:'pictogramas',title:'Comunicador Visual',eyebrow:'Pictogramas, rutinas y comunicación aumentativa',description:'Constructor de tableros visuales con fotografías reales, pictogramas originales, texto simple, audio y secuencias personalizables.',image:'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&w=1400&q=88',icon:ImageIcon,tone:'green',tools:['Tableros de comunicación','Rutinas visuales','Primero–después','Historias sociales','Emociones','Elección y anticipación'],resources:[{title:'Mi rutina de trabajo',detail:'Cinco pasos para aumentar autonomía.',href:'/biblioteca/rutina-visual',badge:'Tablero visual'},{title:'Semáforo de emociones',detail:'Identificación y estrategias de regulación.',href:'/biblioteca/semaforo-emociones',badge:'Autorregulación'},{title:'Creador de secuencias',detail:'Fotografía, pictograma, texto y audio.',href:'/crear',badge:'Personalizable'}]},
 {id:'plan-lector',title:'Plan Lector Inteligente',eyebrow:'Fluidez, comprensión y motivación lectora',description:'Rutas de lectura por nivel, intereses y desempeño, con textos originales, audiomodelamiento, preguntas graduadas y seguimiento individual.',image:'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1400&q=88',icon:BookOpen,tone:'blue',tools:['Diagnóstico lector','Rutas semanales','Fluidez y precisión','Comprensión literal e inferencial','Vocabulario','Panel de progreso'],resources:[{title:'Ruta de fluidez',detail:'Lectura modelada y progreso personal.',href:'/biblioteca/velocidad-lectora',badge:'Entrenamiento'},{title:'Detectives del bosque',detail:'Inferencias usando pistas del texto.',href:'/biblioteca/bosque-inferencias',badge:'Comprensión'},{title:'Secuencia de cuento',detail:'Orden temporal, conectores y reconstrucción.',href:'/biblioteca/secuencia-cuento',badge:'Actividad'}]}
]

export default function CentrosPedagogicos(){
 const[query,setQuery]=useState('')
 const[active,setActive]=useState('todos')
 const filtered=useMemo(()=>centers.filter(center=>{
  const matchesActive=active==='todos'||center.id===active
  const text=[center.title,center.eyebrow,center.description,...center.tools,...center.resources.map(r=>r.title)].join(' ').toLowerCase()
  return matchesActive&&text.includes(query.toLowerCase())
 }),[query,active])

 return <AppShell active="Centros pedagógicos">
  <section className="center-hero">
   <div className="center-hero-copy"><span className="eyebrow"><Sparkles size={15}/> Ecosistema pedagógico premium</span><h1>Seis centros especializados para enseñar, crear y adaptar</h1><p>Matemática, ciencias, escritura, comunicación visual y lectura reunidas en una experiencia coherente, accesible y conectada con PIE y DUA.</p><div className="center-hero-actions"><Link className="btn btn-primary" href="/biblioteca">Explorar biblioteca</Link><Link className="btn btn-soft" href="/crear">Crear recurso adaptado</Link></div></div>
   <div className="center-quality-card"><BrainCircuit/><strong>Estándar YoYo Premium</strong><span>Objetivo · modelamiento · práctica · apoyo · evidencia · retroalimentación</span><div><CheckCircle2/>Contenido original y revisable</div><div><CheckCircle2/>Fotografías reales y recursos accesibles</div><div><CheckCircle2/>Versiones interactivas e imprimibles</div></div>
  </section>

  <section className="center-toolbar premium-card">
   <div className="center-search"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar herramienta, habilidad o recurso"/></div>
   <div className="center-tabs"><button className={active==='todos'?'active':''} onClick={()=>setActive('todos')}>Todos</button>{centers.map(center=><button key={center.id} className={active===center.id?'active':''} onClick={()=>setActive(center.id)}>{center.title}</button>)}</div>
  </section>

  <section className="centers-grid">{filtered.map(center=>{
   const Icon=center.icon
   return <article className={`center-card center-${center.tone}`} key={center.id}>
    <div className="center-photo" style={{backgroundImage:`linear-gradient(180deg,rgba(9,18,40,.04),rgba(9,18,40,.78)),url(${center.image})`}}><span><Icon/> {center.eyebrow}</span><h2>{center.title}</h2></div>
    <div className="center-body"><p>{center.description}</p><div className="center-tools">{center.tools.map(tool=><span key={tool}>{tool}</span>)}</div><div className="center-resources"><h3>Recursos destacados</h3>{center.resources.map(resource=><Link href={resource.href} key={resource.title}><div><strong>{resource.title}</strong><small>{resource.detail}</small></div><span>{resource.badge}</span><ChevronRight/></Link>)}</div></div>
   </article>
  })}</section>

  <section className="center-principles"><div><strong>100%</strong><span>contenido pedagógico original</span></div><div><strong>PIE + DUA</strong><span>apoyos configurables sin etiquetar al estudiante</span></div><div><strong>Real + visual</strong><span>fotografías auténticas, pictogramas propios y diagramas claros</span></div><div><strong>Multiformato</strong><span>pantalla, impresión, audio y respuesta oral</span></div></section>
 </AppShell>
}
