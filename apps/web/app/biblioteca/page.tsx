'use client'

import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {Bookmark,CheckCircle2,Filter,Search,Users} from 'lucide-react'
import {AppShell} from '@/components/AppShell'
import {ResourceAssignmentModal,type ResourceAssignment} from '@/components/ResourceAssignmentModal'
import {premiumActivities,type PremiumActivity} from '@/lib/premiumActivities'

const art:Record<string,string>={forest:'🌳',reading:'📖',placevalue:'🏙️',market:'🛒',division:'➗',tracing:'🦌',letterm:'✍️',routine:'🧩',ecosystem:'🦊',circuit:'💡',assessment:'📝',puzzle:'🐱'}

export default function Biblioteca(){
 const[q,setQ]=useState('')
 const[subject,setSubject]=useState('Todas')
 const[level,setLevel]=useState('Todos')
 const[format,setFormat]=useState('Todos')
 const[onlyFavorites,setOnlyFavorites]=useState(false)
 const[favorites,setFavorites]=useState<string[]>([])
 const[selected,setSelected]=useState<PremiumActivity|null>(null)
 const[assignments,setAssignments]=useState<ResourceAssignment[]>([])

 useEffect(()=>{
  try{
   setFavorites(JSON.parse(localStorage.getItem('yoyo-favorites')||'[]'))
   setAssignments(JSON.parse(localStorage.getItem('yoyo-assignments')||'[]'))
  }catch{setFavorites([]);setAssignments([])}
 },[])

 const subjects=['Todas',...Array.from(new Set(premiumActivities.map(r=>r.subject)))]
 const levels=['Todos',...Array.from(new Set(premiumActivities.map(r=>r.level)))]
 const formats=['Todos',...Array.from(new Set(premiumActivities.map(r=>r.format)))]
 const filtered=useMemo(()=>premiumActivities.filter(resource=>{
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
 const assignedSlugs=new Set(assignments.map(item=>item.activitySlug))
 const clearFilters=()=>{setQ('');setSubject('Todas');setLevel('Todos');setFormat('Todos');setOnlyFavorites(false)}

 return <AppShell active="Biblioteca">
  <section className="premium-hero library-hero"><span className="eyebrow">Biblioteca Premium</span><h1>Recursos listos para enseñar, adaptar y asignar</h1><p>Explora actividades con objetivos, secuencia, apoyos y criterios de logro. Guarda favoritos y asígnalos a tus cursos desde la misma pantalla.</p><div className="library-stats"><span><strong>{premiumActivities.length}</strong> recursos disponibles</span><span><strong>{favorites.length}</strong> favoritos</span><span><strong>{assignments.length}</strong> asignaciones</span></div></section>

  <section className="library-control-panel premium-card">
   <div className="library-search"><Search size={19}/><input value={q} onChange={event=>setQ(event.target.value)} placeholder="Buscar por tema, OA, curso o habilidad"/></div>
   <div className="library-filter-grid">
    <label><span>Asignatura</span><select value={subject} onChange={event=>setSubject(event.target.value)}>{subjects.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Nivel</span><select value={level} onChange={event=>setLevel(event.target.value)}>{levels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Formato</span><select value={format} onChange={event=>setFormat(event.target.value)}>{formats.map(item=><option key={item}>{item}</option>)}</select></label>
    <button className={`favorite-filter ${onlyFavorites?'active':''}`} onClick={()=>setOnlyFavorites(value=>!value)}><Bookmark size={17}/>{onlyFavorites?'Mostrando favoritos':'Solo favoritos'}</button>
   </div>
   <div className="library-results-line"><span><Filter size={15}/>{filtered.length} resultados</span><button onClick={clearFilters}>Limpiar filtros</button></div>
  </section>

  {filtered.length===0?<section className="library-empty premium-card"><h2>No encontramos recursos</h2><p>Prueba quitando uno de los filtros o busca por otra habilidad.</p><button className="btn btn-primary" onClick={clearFilters}>Ver todos los recursos</button></section>:<div className="premium-library-grid">{filtered.map((resource,index)=>{
   const favorite=favorites.includes(resource.slug)
   const assigned=assignedSlugs.has(resource.slug)
   return <article className={`premium-resource-card tone-${index%6}`} key={resource.slug}>
    <div className="premium-card-art"><span>{art[resource.illustration]||'✨'}</span><em>{resource.format}</em><button className={`resource-favorite ${favorite?'active':''}`} onClick={()=>toggleFavorite(resource.slug)} aria-label={favorite?'Quitar de favoritos':'Guardar en favoritos'}><Bookmark/></button></div>
    <div className="premium-card-body"><div className="premium-card-meta"><span>{resource.subject}</span><b>{resource.oa}</b></div><h3>{resource.title}</h3><p>{resource.summary}</p><div className="premium-card-info"><span>{resource.level}</span><span>{resource.duration}</span></div>{assigned&&<div className="resource-assigned"><CheckCircle2 size={15}/>Ya asignada</div>}<div className="resource-actions"><Link className="btn btn-primary" href={`/biblioteca/${resource.slug}`}>Abrir</Link><button className="btn btn-soft" onClick={()=>setSelected(resource)}><Users size={16}/>Asignar</button><Link className="btn btn-soft" href={`/crear?adaptar=${resource.slug}`}>Adaptar</Link></div></div>
   </article>
  })}</div>}

  <ResourceAssignmentModal activity={selected} open={Boolean(selected)} onClose={()=>setSelected(null)} onSaved={assignment=>setAssignments(current=>[assignment,...current])}/>
 </AppShell>
}
