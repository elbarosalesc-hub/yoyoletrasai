import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowRight,CheckCircle2,Download,Printer,Sparkles} from 'lucide-react'
import {AppShell} from '@/components/AppShell'
import {getLearningCenter,learningCenters} from '@/lib/learningCenters'

export function generateStaticParams(){return learningCenters.map(center=>({slug:center.slug}))}

export default async function LearningCenterPage({params}:{params:Promise<{slug:string}>}){
 const{slug}=await params
 const center=getLearningCenter(slug)
 if(!center)notFound()
 return <AppShell active={center.title}>
  <section className={`learning-center-hero center-${center.accent}`}>
   <div className="learning-center-hero-image" style={{backgroundImage:`linear-gradient(90deg,rgba(8,13,35,.93),rgba(8,13,35,.38)),url(${center.image})`}}/>
   <div className="learning-center-hero-copy"><span className="eyebrow">Centro pedagógico premium</span><h1>{center.title}</h1><h2>{center.subtitle}</h2><p>{center.description}</p><div className="learning-center-audiences">{center.audiences.map(item=><span key={item}>{item}</span>)}</div><div className="learning-center-actions"><Link href="/biblioteca" className="btn btn-primary"><Sparkles size={17}/>Explorar recursos</Link><Link href="/crear" className="btn btn-soft">Crear material</Link></div></div>
  </section>

  <section className="learning-center-section"><div className="section-heading"><div><span className="eyebrow">Herramientas funcionales</span><h2>Aprender haciendo</h2></div><p>Cada herramienta incluye modelado, práctica guiada, adaptación DUA/PIE y evidencia de progreso.</p></div><div className="learning-tools-grid">{center.tools.map((tool,index)=><article className="learning-tool-card" key={tool.title}><span className="learning-tool-number">0{index+1}</span><em>{tool.badge}</em><h3>{tool.title}</h3><p>{tool.description}</p><Link href={tool.href}>Abrir herramienta <ArrowRight size={16}/></Link></article>)}</div></section>

  <section className="learning-center-section learning-resource-section"><div className="section-heading"><div><span className="eyebrow">Biblioteca especializada</span><h2>Colecciones del módulo</h2></div><div className="learning-export-actions"><button><Printer size={16}/>Imprimir</button><button><Download size={16}/>Exportar</button></div></div><div className="learning-resource-grid">{center.resources.map((resource,index)=><Link href={`/biblioteca?subject=${encodeURIComponent(resource)}`} className="learning-resource-item" key={resource}><span>{String(index+1).padStart(2,'0')}</span><strong>{resource}</strong><ArrowRight size={16}/></Link>)}</div></section>

  <section className="learning-center-premium"><div><span className="eyebrow">Estándar YoYo Letras AI</span><h2>Experiencia premium e inclusiva</h2><p>No son fichas aisladas: cada experiencia puede asignarse, adaptarse, utilizarse en pantalla o imprimirse y quedar vinculada al seguimiento del estudiante.</p></div><div className="learning-premium-list">{center.premium.map(item=><span key={item}><CheckCircle2 size={18}/>{item}</span>)}</div></section>
 </AppShell>
}
