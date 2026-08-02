'use client'

import Link from 'next/link'
import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Calculator,FlaskConical,PenTool,Route,Images,BookOpen,Search,ArrowRight,CheckCircle2,Sparkles,SlidersHorizontal} from 'lucide-react'
import {resourceCatalog} from '@/lib/resourceCatalog'

type Center={
 id:string
 title:string
 subtitle:string
 description:string
 icon:typeof Calculator
 photo:string
 accent:string
 tools:string[]
 filters:string[]
 href:string
}

const centers:Center[]=[
 {id:'matematica',title:'MathLab',subtitle:'Matemática visual y manipulativa',description:'Herramientas para numeración, operatoria, geometría, medición, fracciones, resolución de problemas y evaluación inmediata.',icon:Calculator,photo:'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1200&q=85',accent:'blue',tools:['Bloques base diez','Recta numérica','Fracciones visuales','Geoplano','Ábaco','Calculadora pedagógica'],filters:['OA chileno','Nivel de apoyo','Material concreto'],href:'/biblioteca?area=Matemática'},
 {id:'ciencias',title:'ExploraLab',subtitle:'Ciencias con observación real',description:'Experimentos seguros, fotografías auténticas, modelos explicativos, secuencias científicas y registro de hipótesis, observaciones y conclusiones.',icon:FlaskConical,photo:'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=85',accent:'green',tools:['Laboratorio virtual','Clasificador de seres vivos','Sistema solar','Cuerpo humano','Ciclo del agua','Bitácora científica'],filters:['Ciencias de la vida','Física y química','Tierra y universo'],href:'/biblioteca?area=Ciencias'},
 {id:'caligrafia',title:'Caligrafía Pro',subtitle:'Trazos graduados y personalizables',description:'Generador de letras, palabras y textos con pauta, dirección del trazo, tamaño ajustable, modelos manuscritos y versiones de alto contraste.',icon:PenTool,photo:'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=85',accent:'violet',tools:['Abecedario completo','Pauta caligráfica','Nombre personalizado','Palabras frecuentes','Copia breve','Alto contraste'],filters:['Imprenta','Ligada','Mayúscula y minúscula'],href:'/caligrafia'},
 {id:'grafomotricidad',title:'TrazoLab',subtitle:'Grafomotricidad progresiva',description:'Recorridos, líneas, curvas, bucles, laberintos y coordinación visomotora con progresión de dificultad y temáticas motivadoras.',icon:Route,photo:'https://images.unsplash.com/photo-1607453998774-d533f65dac99?auto=format&fit=crop&w=1200&q=85',accent:'orange',tools:['Líneas rectas','Curvas y ondas','Bucles','Laberintos','Unión de puntos','Coordinación ojo-mano'],filters:['4 a 7 años','Motricidad fina','Dificultad gradual'],href:'/caligrafia?modo=grafomotricidad'},
 {id:'pictogramas',title:'Pictogramas 360',subtitle:'Comunicación y anticipación',description:'Constructor de rutinas, tableros de comunicación, secuencias, normas y apoyos visuales con texto editable, voz y personalización.',icon:Images,photo:'https://images.unsplash.com/photo-1602030028438-4cf153cbae9e?auto=format&fit=crop&w=1200&q=85',accent:'pink',tools:['Rutina visual','Primero–después','Tablero de elección','Normas de aula','Emociones','Secuencias'],filters:['TEA','Comunicación aumentativa','Anticipación'],href:'/inclusion?pictogramas=1'},
 {id:'plan-lector',title:'Plan Lector',subtitle:'Lectura, fluidez y comprensión',description:'Rutas lectoras por nivel con textos graduados, control de palabras por minuto, vocabulario, inferencias, evidencias y seguimiento individual.',icon:BookOpen,photo:'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=85',accent:'indigo',tools:['Biblioteca graduada','Cronómetro lector','Preguntas por habilidad','Vocabulario contextual','Registro de fluidez','Informe de progreso'],filters:['Nivel lector','Interés','Habilidad curricular'],href:'/biblioteca?area=Lenguaje'},
]

export default function CentrosPedagogicos(){
 const[query,setQuery]=useState('')
 const[selected,setSelected]=useState('todos')
 const visible=useMemo(()=>centers.filter(center=>{
  const text=[center.title,center.subtitle,center.description,...center.tools,...center.filters].join(' ').toLowerCase()
  return (selected==='todos'||center.id===selected)&&text.includes(query.toLowerCase())
 }),[query,selected])
 const resourcesBySubject=(subject:string)=>resourceCatalog.filter(item=>item.subject.toLowerCase().includes(subject.toLowerCase())).length

 return <AppShell active="Centros pedagógicos">
  <section className="centers-hero">
   <div><span className="eyebrow"><Sparkles size={15}/> Ecosistema pedagógico premium</span><h1>Seis centros especializados, conectados en una sola plataforma</h1><p>Cada centro reúne herramientas interactivas, recursos imprimibles, adaptaciones DUA/PIE y seguimiento pedagógico. Las fotografías utilizadas representan objetos y contextos reales; los pictogramas y materiales propios se mantienen originales y editables.</p><div className="centers-hero-actions"><Link href="/biblioteca" className="btn btn-primary">Explorar biblioteca</Link><Link href="/crear" className="btn btn-soft">Crear recurso adaptado</Link></div></div>
   <aside><strong>{resourceCatalog.length}</strong><span>recursos conectados</span><div><CheckCircle2/> Currículo chileno</div><div><CheckCircle2/> DUA y PIE</div><div><CheckCircle2/> Vista digital e imprimible</div></aside>
  </section>

  <section className="centers-toolbar premium-card">
   <div className="centers-search"><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar herramienta, habilidad o apoyo..."/></div>
   <div className="centers-tabs"><button className={selected==='todos'?'active':''} onClick={()=>setSelected('todos')}><SlidersHorizontal/>Todos</button>{centers.map(center=><button className={selected===center.id?'active':''} onClick={()=>setSelected(center.id)} key={center.id}>{center.title}</button>)}</div>
  </section>

  <div className="centers-grid">{visible.map(center=>{
   const Icon=center.icon
   const count=center.id==='matematica'?resourcesBySubject('Matemática'):center.id==='ciencias'?resourcesBySubject('Ciencias'):center.id==='plan-lector'?resourcesBySubject('Lenguaje'):resourceCatalog.filter(item=>item.title.toLowerCase().includes(center.id.split('-')[0])).length
   return <article className={`center-card center-${center.accent}`} key={center.id}>
    <div className="center-photo" style={{backgroundImage:`linear-gradient(180deg,transparent 35%,rgba(8,18,38,.84)),url(${center.photo})`}}><span><Icon/>{center.title}</span><em>Imagen fotográfica real</em></div>
    <div className="center-body"><div className="center-heading"><div><small>{center.subtitle}</small><h2>{center.title}</h2></div><b>{count} recursos</b></div><p>{center.description}</p><div className="center-tool-list">{center.tools.map(tool=><span key={tool}><CheckCircle2/>{tool}</span>)}</div><div className="center-tags">{center.filters.map(filter=><span key={filter}>{filter}</span>)}</div><div className="center-actions"><Link className="btn btn-primary" href={center.href}>Abrir centro <ArrowRight/></Link><Link className="btn btn-soft" href={`/crear?centro=${center.id}`}>Crear material</Link></div></div>
   </article>
  })}</div>

  <section className="centers-standard premium-card"><span className="eyebrow">Estándar editorial YoYo Letras AI</span><h2>Todo recurso nuevo deberá ser completo, verificable y adaptable</h2><div>{['Objetivo de aprendizaje y habilidad','Instrucciones claras y modelado','Pauta o respuestas','Versión DUA/PIE','Formato digital e imprimible','Fotografías reales con procedencia controlada','Registro de resultados','Revisión pedagógica y de accesibilidad'].map(item=><span key={item}><CheckCircle2/>{item}</span>)}</div></section>
 </AppShell>
}
