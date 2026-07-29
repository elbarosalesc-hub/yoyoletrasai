'use client'

import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {
  Bookmark,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Filter,
  Grid3X3,
  ListFilter,
  Search,
  Sparkles,
  Users
} from 'lucide-react'
import {ModuleShell,ModuleStat} from '@/components/v2/ModuleShell'
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

 return <ModuleShell active="Biblioteca">
  <section className="module-hero library-v2-hero">
   <div className="module-hero-copy"><span className="module-eyebrow"><Sparkles size={15}/> Biblioteca inteligente</span><h1>Recursos que se adaptan a cada forma de aprender</h1><p>Encuentra actividades curriculares, materiales DUA y apoyos PIE listos para usar, adaptar o asignar en pocos pasos.</p><div className="module-hero-actions"><a href="#recursos" className="module-primary"><BookOpen size={18}/>Explorar recursos</a><a href="/crear" className="module-secondary"><Sparkles size={18}/>Crear con YOYO</a></div></div>
   <div className="library-hero-visual" aria-hidden="true"><div className="library-orb main">📚</div><div className="library-orb one">🧩</div><div className="library-orb two">🔬</div><div className="library-orb three">✏️</div><span className="library-spark spark-one">✦</span><span className="library-spark spark-two">✦</span></div>
  </section>

  <section className="module-stats-grid">
   <ModuleStat icon={BookOpen} value={String(premiumActivities.length)} label="recursos disponibles" tone="violet"/>
   <ModuleStat icon={Bookmark} value={String(favorites.length)} label="guardados" tone="amber"/>
   <ModuleStat icon={Users} value={String(assignments.length)} label="asignaciones" tone="mint"/>
   <ModuleStat icon={CheckCircle2} value="92%" label="con apoyos DUA" tone="blue"/>
  </section>

  <section className="library-v2-layout" id="recursos">
   <aside className="library-filter-card">
    <div className="filter-title"><span><ListFilter size={19}/></span><div><small>FILTROS</small><h2>Encuentra lo que necesitas</h2></div></div>
    <label><span>Asignatura</span><select value={subject} onChange={event=>setSubject(event.target.value)}>{subjects.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Nivel</span><select value={level} onChange={event=>setLevel(event.target.value)}>{levels.map(item=><option key={item}>{item}</option>)}</select></label>
    <label><span>Formato</span><select value={format} onChange={event=>setFormat(event.target.value)}>{formats.map(item=><option key={item}>{item}</option>)}</select></label>
    <button className={`favorite-filter-v2 ${onlyFavorites?'active':''}`} onClick={()=>setOnlyFavorites(value=>!value)}><Bookmark size={17}/>{onlyFavorites?'Mostrando favoritos':'Solo favoritos'}</button>
    <button className="clear-filter" onClick={clearFilters}>Limpiar filtros</button>
   </aside>

   <div className="library-main">
    <div className="library-toolbar-v2"><label><Search size={19}/><input value={q} onChange={event=>setQ(event.target.value)} placeholder="Buscar por tema, OA, curso o habilidad..."/></label><div className="results-count"><Filter size={15}/><span>{filtered.length} resultados</span></div><button aria-label="Vista en cuadrícula"><Grid3X3 size={18}/></button></div>

    {filtered.length===0?<section className="library-empty-v2"><div>🔎</div><h2>No encontramos recursos</h2><p>Prueba quitando uno de los filtros o busca por otra habilidad.</p><button onClick={clearFilters}>Ver todos los recursos</button></section>:<div className="library-card-grid">{filtered.map((resource,index)=>{
     const favorite=favorites.includes(resource.slug)
     const assigned=assignedSlugs.has(resource.slug)
     return <article className={`resource-card-v2 resource-tone-${index%6}`} key={resource.slug}>
      <div className="resource-cover-v2"><div className="resource-illustration"><span>{art[resource.illustration]||'✨'}</span></div><em>{resource.format}</em><button className={`resource-favorite-v2 ${favorite?'active':''}`} onClick={()=>toggleFavorite(resource.slug)} aria-label={favorite?'Quitar de favoritos':'Guardar en favoritos'}><Bookmark/></button></div>
      <div className="resource-body-v2"><div className="resource-meta-v2"><span>{resource.subject}</span><b>{resource.oa}</b></div><h3>{resource.title}</h3><p>{resource.summary}</p><div className="resource-info-v2"><span>{resource.level}</span><span>{resource.duration}</span></div>{assigned&&<div className="resource-assigned-v2"><CheckCircle2 size={15}/>Ya asignada</div>}<div className="resource-actions-v2"><Link className="open-resource" href={`/biblioteca/${resource.slug}`}>Abrir recurso<ChevronRight size={17}/></Link><button onClick={()=>setSelected(resource)}><Users size={16}/>Asignar</button><Link href={`/crear?adaptar=${resource.slug}`}>Adaptar</Link></div></div>
     </article>
    })}</div>}
   </div>
  </section>

  <ResourceAssignmentModal activity={selected} open={Boolean(selected)} onClose={()=>setSelected(null)} onSaved={assignment=>setAssignments(current=>[assignment,...current])}/>
 </ModuleShell>
}
