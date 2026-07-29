import type {LucideIcon} from 'lucide-react'
import {ArrowRight,CheckCircle2,Clock3,Plus,Sparkles} from 'lucide-react'
import {ModuleShell} from './ModuleShell'

export type OverviewCard={title:string;description:string;meta:string;icon:LucideIcon;tone:'violet'|'mint'|'blue'|'amber'}

export function ModuleOverview({active,eyebrow,title,description,cards,primaryAction}:{active:string;eyebrow:string;title:string;description:string;cards:OverviewCard[];primaryAction:string}){
  return <ModuleShell active={active}>
    <section className="module-overview-hero"><div><span className="module-eyebrow"><Sparkles size={15}/>{eyebrow}</span><h1>{title}</h1><p>{description}</p></div><button><Plus/>{primaryAction}</button></section>
    <section className="module-overview-grid">{cards.map(({title,description,meta,icon:Icon,tone})=><article key={title} className={`module-overview-card tone-${tone}`}><span><Icon/></span><div><strong>{title}</strong><p>{description}</p><small><Clock3/>{meta}</small></div><button aria-label={`Abrir ${title}`}><ArrowRight/></button></article>)}</section>
    <section className="module-overview-bottom"><article><span><CheckCircle2/></span><div><small>ESTADO DEL MÓDULO</small><h2>Base funcional preparada</h2><p>La ruta, navegación y estructura visual ya están disponibles. La siguiente iteración conectará formularios y datos reales desde Supabase.</p></div></article><article><span><Sparkles/></span><div><small>YOYO IA</small><h2>Automatización segura</h2><p>Las sugerencias del asistente quedarán sujetas a revisión docente antes de guardarse o compartirse.</p></div></article></section>
  </ModuleShell>
}
