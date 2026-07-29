import type {LucideIcon} from 'lucide-react'
import {ArrowUpRight,CheckCircle2,ChevronRight,Clock3,Plus,Sparkles} from 'lucide-react'
import {ModuleShell} from './ModuleShell'

export type ModuleCard={title:string;description:string;meta:string;progress?:number;status?:string}

export function PlatformModulePage({
  active,
  eyebrow,
  title,
  description,
  icon:Icon,
  stats,
  cards,
  actionLabel='Crear nuevo',
  actionHref='/crear'
}:{
  active:string
  eyebrow:string
  title:string
  description:string
  icon:LucideIcon
  stats:{value:string;label:string}[]
  cards:ModuleCard[]
  actionLabel?:string
  actionHref?:string
}){
  return <ModuleShell active={active} createHref={actionHref}>
    <section className="module-hero compact-module-hero">
      <div className="module-hero-copy">
        <span className="module-eyebrow"><Sparkles size={15}/>{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
        <div className="module-hero-actions"><a className="module-primary" href={actionHref}><Plus size={18}/>{actionLabel}</a><a className="module-secondary" href="/yoyo"><Sparkles size={18}/>Pedir ayuda a YOYO</a></div>
      </div>
      <div className="simple-module-visual" aria-hidden="true"><span><Icon/></span><i/><i/></div>
    </section>

    <section className="simple-module-stats">{stats.map(item=><article key={item.label}><strong>{item.value}</strong><span>{item.label}</span></article>)}</section>

    <section className="simple-module-grid">{cards.map((card,index)=><article className="simple-module-card" key={card.title}><div className="simple-card-head"><span>{index+1}</span><em>{card.status||'Activo'}</em></div><h2>{card.title}</h2><p>{card.description}</p><small><Clock3 size={14}/>{card.meta}</small>{typeof card.progress==='number'&&<div className="simple-progress"><span><i style={{width:`${card.progress}%`}}/></span><strong>{card.progress}%</strong></div>}<a href="#"><span>{card.status==='Pendiente'?'Revisar':'Abrir módulo'}</span><ChevronRight/></a></article>)}</section>

    <section className="simple-module-footer"><span><CheckCircle2/></span><div><strong>Módulo integrado al ecosistema YOYOLETRASAI</strong><p>Preparado para datos de Supabase, permisos por rol y seguimiento institucional.</p></div><a href="/configuracion">Revisar configuración<ArrowUpRight/></a></section>
  </ModuleShell>
}
