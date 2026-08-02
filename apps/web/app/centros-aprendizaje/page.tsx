'use client'

import Image from 'next/image'
import Link from 'next/link'
import {useMemo,useState} from 'react'
import {ArrowRight,BookOpen,CheckCircle2,FlaskConical,Images,PenTool,Search,Sparkles,SquareFunction} from 'lucide-react'
import {AppShell} from '@/components/AppShell'
import {learningCenters} from '@/lib/learningCenters'

const iconMap:Record<string,typeof BookOpen>={matematica:SquareFunction,ciencias:FlaskConical,caligrafia:PenTool,grafomotricidad:PenTool,pictogramas:Images,'plan-lector':BookOpen}

export default function CentrosAprendizaje(){
 const[active,setActive]=useState('todos')
 const[query,setQuery]=useState('')
 const visible=useMemo(()=>learningCenters.filter(center=>{
  const matchesCenter=active==='todos'||center.slug===active
  const haystack=`${center.title} ${center.eyebrow} ${center.description} ${center.tools.map(tool=>tool.title+' '+tool.description+' '+tool.tag).join(' ')}`.toLowerCase()
  return matchesCenter&&haystack.includes(query.toLowerCase())
 }),[active,query])
 const toolCount=learningCenters.reduce((total,center)=>total+center.tools.length,0)
 return <AppShell active="Centros de aprendizaje">
  <section className="learning-hero">
   <div><span className="eyebrow">Ecosistema curricular premium</span><h1>Centros de aprendizaje para enseñar, explorar y crear</h1><p>Herramientas originales conectadas con la biblioteca, evaluación, seguimiento y apoyos PIE/DUA. Cada experiencia puede abrirse, adaptarse y asignarse desde un mismo lugar.</p><div className="learning-hero-actions"><Link className="btn btn-primary" href="/biblioteca">Explorar biblioteca</Link><Link className="btn btn-soft" href="/crear">Crear recurso adaptado</Link></div></div>
   <div className="learning-hero-panel"><div><strong>6</strong><span>centros especializados</span></div><div><strong>{toolCount}</strong><span>herramientas conectadas</span></div><div><strong>100%</strong><span>adaptable e inclusivo</span></div></div>
  </section>

  <section className="learning-toolbar premium-card">
   <div className="learning-search"><Search size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar herramienta, habilidad o contenido"/></div>
   <div className="learning-tabs"><button className={active==='todos'?'active':''} onClick={()=>setActive('todos')}>Todos</button>{learningCenters.map(center=><button className={active===center.slug?'active':''} onClick={()=>setActive(center.slug)} key={center.slug}>{center.eyebrow}</button>)}</div>
  </section>

  <div className="learning-center-grid">{visible.map(center=>{
   const Icon=iconMap[center.slug]||Sparkles
   return <article className="learning-center-card" key={center.slug} style={{'--center-accent':center.accent} as React.CSSProperties}>
    <div className="learning-center-image"><Image src={center.image} alt={`Imagen realista para ${center.title}`} fill sizes="(max-width: 900px) 100vw, 50vw"/><span><Icon size={18}/>{center.eyebrow}</span></div>
    <div className="learning-center-copy"><h2>{center.title}</h2><p>{center.description}</p><div className="learning-tool-list">{center.tools.map(tool=><Link href={tool.href} className="learning-tool" key={tool.title}><div><span>{tool.tag}</span><strong>{tool.title}</strong><p>{tool.description}</p></div><ArrowRight size={18}/></Link>)}</div><div className="learning-center-footer"><span><CheckCircle2 size={16}/>Incluye adaptación PIE/DUA</span><Link className="btn btn-primary" href={center.href}>Abrir centro</Link></div></div>
   </article>
  })}</div>

  {visible.length===0&&<section className="premium-card learning-empty"><h2>No encontramos coincidencias</h2><p>Prueba con lectura, fracciones, trazos, emociones o ciencias.</p><button className="btn btn-primary" onClick={()=>{setQuery('');setActive('todos')}}>Ver todos los centros</button></section>}
 </AppShell>
}
