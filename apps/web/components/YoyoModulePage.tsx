import Link from 'next/link'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles } from 'lucide-react'
import { AppShell } from '@/components/AppShell'

export function YoyoModulePage({ active, kicker, title, description, features, primaryHref='/yoyo-ia', primaryLabel='Abrir YOYO IA' }: { active:string; kicker:string; title:string; description:string; features:string[]; primaryHref?:string; primaryLabel?:string }) {
  return <AppShell active={active}>
    <div className="approved-platform-dashboard">
      <section className="approved-hero-row"><div><span className="approved-kicker">{kicker}</span><h1>{title}</h1><p>{description}</p></div><Link href={primaryHref} className="approved-primary-action"><Sparkles size={18}/>{primaryLabel}</Link></section>
      <section className="approved-main-grid">
        <article className="approved-panel" style={{padding:24}}><div className="approved-panel-heading"><div><h2>Funciones del módulo</h2><p>Integrado a la plataforma completa y al contexto institucional.</p></div><ShieldCheck/></div><div className="approved-readiness">{features.map((feature)=><div key={feature}><span><CheckCircle2/></span><div><strong>{feature}</strong><small>Diseñado para interoperar con cursos, recursos, evaluación y seguimiento.</small></div><CheckCircle2/></div>)}</div></article>
        <aside className="approved-panel" style={{padding:24}}><h2>Integración YOYO</h2><p>Este módulo no sustituye funcionalidades anteriores: amplía la plataforma existente y comparte identidad, permisos, almacenamiento y auditoría.</p><Link href="/app" className="btn btn-soft" style={{display:'inline-flex',marginTop:16}}>Volver al inicio <ArrowRight size={16}/></Link></aside>
      </section>
    </div>
  </AppShell>
}