'use client'

import { FormEvent, useState } from 'react'
import { Bot, ExternalLink, FileSearch, Loader2, ShieldCheck, Sparkles, Upload } from 'lucide-react'
import { AppShell } from '@/components/AppShell'

const modes = [
  ['creation', 'Crear recurso'], ['writing', 'Redacción'], ['assessment', 'Prueba'], ['guide', 'Guía'],
  ['summary', 'Resumen'], ['research', 'Investigación'], ['analysis', 'Análisis'], ['presentation', 'Presentación'],
]

type OfficialSource = { title: string; url: string; domain: string }
type OfficialResearch = { required?: boolean; state?: string; searchConfigured?: boolean; sources?: OfficialSource[] }

export default function YoyoAIPage() {
  const [prompt, setPrompt] = useState('')
  const [mode, setMode] = useState('creation')
  const [result, setResult] = useState('')
  const [sources, setSources] = useState<OfficialSource[]>([])
  const [research, setResearch] = useState<OfficialResearch | null>(null)
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    setResult('')
    setSources([])
    setResearch(null)
    try {
      const response = await fetch('/api/yoyo/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, mode }),
      })
      const data = await response.json()
      if (data.officialResearch) {
        setResearch(data.officialResearch)
        setSources(Array.isArray(data.officialResearch.sources) ? data.officialResearch.sources : [])
      }
      if (!response.ok) throw new Error(data.error || 'No fue posible generar la respuesta.')
      setResult(data.text || '')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible generar la respuesta.')
    } finally {
      setPending(false)
    }
  }

  return <AppShell active="YOYO IA">
    <div className="approved-platform-dashboard">
      <section className="approved-hero-row">
        <div><span className="approved-kicker">YOYO IA · CUENTA PROPIETARIA</span><h1>IA educativa exclusiva</h1><p>Creación, redacción, análisis e investigación con enfoque chileno, PIE, NEE y DUA, sin cuotas internas para la propietaria.</p></div>
      </section>
      <section className="approved-main-grid">
        <article className="approved-panel" style={{padding:24}}>
          <div className="approved-panel-heading"><div><h2>¿Qué necesitas crear o investigar?</h2><p>Selecciona un modo y describe con detalle el resultado esperado.</p></div><span><ShieldCheck size={16}/> Privado</span></div>
          <form onSubmit={submit} style={{display:'grid',gap:16}}>
            <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{modes.map(([value,label])=><button key={value} type="button" onClick={()=>setMode(value)} className={mode===value?'btn btn-primary':'btn btn-soft'}>{label}</button>)}</div>
            <textarea value={prompt} onChange={(event)=>setPrompt(event.target.value)} required rows={10} placeholder="Ejemplo: investiga normativa vigente de evaluación escolar en Chile usando fuentes oficiales, cita cada afirmación material y luego crea una guía docente aplicable..." style={{width:'100%',border:'1px solid #dde2ec',borderRadius:18,padding:18,font:'inherit',resize:'vertical'}} />
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button disabled={pending || !prompt.trim()} className="btn btn-primary" style={{display:'inline-flex',alignItems:'center',gap:8}}>{pending?<Loader2 className="spin" size={18}/>:<Sparkles size={18}/>} {pending?'YOYO está trabajando...':'Generar con YOYO IA'}</button>
              <button type="button" className="btn btn-soft" onClick={()=>setError('La carga de archivos se habilitará desde el espacio privado conectado al almacenamiento YOYO/Google.') }><Upload size={17}/> Subir archivos</button>
            </div>
          </form>
          {research?.required && <div className="approved-state" style={{marginTop:18}}><ShieldCheck/><strong>Investigación oficial: {research.state === 'verified' ? 'verificada' : 'requerida'}</strong><span>YOYO no responde afirmaciones factuales de investigación si no dispone de evidencia oficial suficiente.</span></div>}
          {error && <div className="approved-state error" style={{marginTop:18}}>{error}</div>}
          {result && <section style={{marginTop:22,padding:22,border:'1px solid #e5e7ef',borderRadius:20,whiteSpace:'pre-wrap',lineHeight:1.65}}><strong style={{display:'block',marginBottom:12}}>Resultado YOYO IA</strong>{result}</section>}
          {sources.length > 0 && <section style={{marginTop:18,padding:20,border:'1px solid #e5e7ef',borderRadius:20}}><strong style={{display:'block',marginBottom:10}}>Fuentes oficiales utilizadas</strong><div style={{display:'grid',gap:9}}>{sources.map((source)=><a key={source.url} href={source.url} target="_blank" rel="noreferrer" style={{display:'flex',alignItems:'center',gap:8}}><ExternalLink size={15}/><span>{source.title || source.domain}</span></a>)}</div></section>}
        </article>
        <aside className="approved-panel" style={{padding:24}}>
          <div className="approved-panel-heading"><div><h2>Capacidades activas</h2><p>Espacio propietario exclusivo.</p></div><Bot/></div>
          <div className="approved-readiness">
            <div><span><Sparkles/></span><div><strong>Creación pedagógica</strong><small>Guías, pruebas, informes, resúmenes y redacción</small></div></div>
            <div><span><FileSearch/></span><div><strong>Investigación oficial</strong><small>Fuentes oficiales verificables, trazabilidad y rechazo de referencias inventadas</small></div></div>
            <div><span><ShieldCheck/></span><div><strong>Uso propietario</strong><small>Sin cuotas artificiales internas</small></div></div>
          </div>
        </aside>
      </section>
    </div>
  </AppShell>
}
