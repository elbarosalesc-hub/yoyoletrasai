'use client'

import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {Bookmark,CheckCircle2,Eye,Filter,Grid2X2,List,Search,Users,X} from 'lucide-react'
import {AppShell} from '@/components/AppShell'
import {ResourceAssignmentModal,type ResourceAssignment} from '@/components/ResourceAssignmentModal'
import {resourceCatalog,type PremiumActivity} from '@/lib/resourceCatalog'

const art:Record<string,string>={forest:'🌳',reading:'📖',placevalue:'🏙️',market:'🛒',division:'➗',tracing:'🦌',letterm:'✍️',routine:'🧩',ecosystem:'🦊',circuit:'💡',assessment:'📝',puzzle:'🐱'}

type ViewMode='grid'|'list'

export default function Biblioteca(){
 const[q,setQ]=useState('')
 const[subject,setSubject]=useState('Todas')
 const[level,setLevel]=useState('Todos')
 const[format,setFormat]=useState('Todos')
 const[onlyFavorites,setOnlyFavorites]=useState(false)
 const[favorites,setFavorites]=useState<string[]>([])
 const[assignmentTarget,setAssignmentTarget]=useState<PremiumActivity|null>(null)
 const[preview,setPreview]=useState<PremiumActivity|null>(null)
 const[assignments,setAssignments]=useState<ResourceAssignment[]>([])
 const[view,setView]=useState<ViewMode>('grid')

 useEffect(()=>{
  try{
   setFavorites(JSON.parse(localStorage.getItem('yoyo-favorites')||'[]'))
   setAssignments(JSON.parse(localStorage.getItem('yoyo-assignments')||'[]'))
   setView((localStorage.getItem('yoyo-library-view') as ViewMode)||'grid')
  }catch{setFavorites([]);setAssignments([])}
 },[])

 const subjects=['Todas',...Array.from(new Set(resourceCatalog.map(r=>r.subject)))]
 const levels=['Todos',...Array.from(new Set(resourceCatalog.map(r=>r.level)))]
 const formats=['Todos',...Array.from(new Set(resourceCatalog.map(r=>r.format)))]
 const filtered=useMemo(()=>resourceCatalog.filter(resource=>{
  const text=(resource.title+' '+resource.summary+' '+resource.oa+' '+resource.subject+' '+resource.level).toLowerCase()
  return text.includes(q.toLowerCase())
   &&(subject==='Todas'||resource.subject===subject)
   &&(level==='Todos'||resource.level===level)
   &&(format==='Todos'||resource.format===format)
   &&(!onlyFavorites||favorites.includes(resource.slug))
 }),[q,subject,level,format,onlyFavorites,favorites])

 const toggleFavorite=(slug:string)=>{
  const next=favorites.includes(slug)?favorites.filter(item=>item!==slug):[...favorites,slug]
  setFavorites(next)
  localStorage.setItem('yoyo-favorites',JSON.stringify(next))
 }
 const changeView=(next:ViewMode)=>{setView(next);localStorage.setItem('yoyo-library-view',next)}
 const assignedSlugs=new Set(assignments.map(item=>item.activitySlug))
 const clearFilters=()=>{setQ('');setSubject('Todas');setLevel('Todos');setFormat('Todos');setOnlyFavorites(false)}

 return <AppShell active="Biblioteca">
  <section className="premium-hero library-hero"><span className="eyebrow">Biblioteca inteligente</span><h1>Recursos listos para enseñar, adaptar y asignar</h1><p>Explora actividades con objetivos, secuencia, apoyos y criterios de logro. Previsualiza, guarda favoritos y asigna a tus cursos sin abandonar la biblioteca.</p><div className="library-stats"><span><strong>{resourceCatalog.length}</strong> recursos</span><span><strong>{favorites.length}</strong> favoritos</span><span><strong>{assignments.length}</strong> asignaciones</span></div></section>

  <section className="library-control-panel premium-card">
   <div className="library-search"><Search size={19}/><input value={q} onChange={event=>setQ(event.target.value)} placeholder="Buscar por tema, OA, curso o habilidad"/></div>
   <div className="library-filter-grid">
    <label><span>Asignatura</span><select value={subject} onChange={event=>setSubject(event.target.value)}>{subjects.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Nivel</span><select value={level} onChange={event=>setLevel(event.target.value)}>{levels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Formato</span><select value={format} onChange={event=>setFormat(event.target.value)}>{formats.map(item=><option key={item}>{item}</option>)}</select></label>
    <button className={`favorite-filter ${onlyFavorites?'active':''}`} onClick={()=>setOnlyFavorites(value=>!value)}><Bookmark size={17}/>{onlyFavorites?'Mostrando favoritos':'Solo favoritos'}</button>
   </div>
   <div className="library-results-line"><span><Filter size={15}/>{filtered.length} resultados</span><div className="library-view-actions"><button className={view==='grid'?'active':''} onClick={()=>changeView('grid')} aria-label="Vista en cuadrícula"><Grid2X2/></button><button className={view==='list'?'active':''} onClick={()=>changeView('list')} aria-label="Vista en lista"><List/></button><button onClick={clearFilters}>Limpiar filtros</button></div></div>
  </section>

  {filtered.length===0?<section className="library-empty premium-card"><h2>No encontramos recursos</h2><p>Prueba quitando uno de los filtros o busca por otra habilidad.</p><button className="btn btn-primary" onClick={clearFilters}>Ver todos los recursos</button></section>:<div className={`premium-library-grid library-${view}`}>{filtered.map((resource,index)=>{
   const favorite=favorites.includes(resource.slug)
   const assigned=assignedSlugs.has(resource.slug)
   return <article className={`premium-resource-card tone-${index%6}`} key={resource.slug}>
    <div className="premium-card-art"><span>{art[resource.illustration]||'✨'}</span><em>{resource.format}</em><button className={`resource-favorite ${favorite?'active':''}`} onClick={()=>toggleFavorite(resource.slug)} aria-label={favorite?'Quitar de favoritos':'Guardar en favoritos'}><Bookmark/></button></div>
    <div className="premium-card-body"><div className="premium-card-meta"><span>{resource.subject}</span><b>{resource.oa}</b></div><h3>{resource.title}</h3><p>{resource.summary}</p><div className="premium-card-info"><span>{resource.level}</span><span>{resource.duration}</span></div>{assigned&&<div className="resource-assigned"><CheckCircle2 size={15}/>Ya asignada</div>}<div className="resource-actions"><button className="btn btn-soft" onClick={()=>setPreview(resource)}><Eye size={16}/>Vista rápida</button><button className="btn btn-soft" onClick={()=>setAssignmentTarget(resource)}><Users size={16}/>Asignar</button><Link className="btn btn-primary" href={`/biblioteca/${resource.slug}`}>Abrir</Link><Link className="btn btn-soft" href={`/crear?adaptar=${resource.slug}`}>Adaptar</Link></div></div>
   </article>
  })}</div>}

  {preview?<div className="resource-preview-backdrop" role="presentation" onMouseDown={()=>setPreview(null)}><aside className="resource-preview-drawer" role="dialog" aria-modal="true" aria-label={`Vista previa de ${preview.title}`} onMouseDown={event=>event.stopPropagation()}><button className="resource-preview-close" onClick={()=>setPreview(null)} aria-label="Cerrar vista previa"><X/></button><div className="resource-preview-hero"><span>{art[preview.illustration]||'✨'}</span><em>{preview.format}</em></div><div className="resource-preview-content"><span className="eyebrow">{preview.subject} · {preview.level}</span><h2>{preview.title}</h2><p>{preview.summary}</p><div className="resource-preview-facts"><div><b>{preview.oa}</b><small>Objetivo</small></div><div><b>{preview.duration}</b><small>Duración</small></div><div><b>{preview.format}</b><small>Formato</small></div></div><section><h3>Uso pedagógico sugerido</h3><p>Presenta el propósito, modela el primer paso y permite respuesta oral, escrita o manipulativa según las necesidades del grupo.</p></section><div className="resource-preview-actions"><Link className="btn btn-primary" href={`/biblioteca/${preview.slug}`}>Abrir recurso completo</Link><button className="btn btn-soft" onClick={()=>{setAssignmentTarget(preview);setPreview(null)}}><Users/>Asignar al curso</button><Link className="btn btn-soft" href={`/crear?adaptar=${preview.slug}`}>Crear adaptación</Link></div></div></aside></div>:null}

  <ResourceAssignmentModal activity={assignmentTarget} open={Boolean(assignmentTarget)} onClose={()=>setAssignmentTarget(null)} onSaved={assignment=>setAssignments(current=>[assignment,...current])}/>
 </AppShell>
}
