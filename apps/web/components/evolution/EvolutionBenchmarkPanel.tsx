import { ArrowUpRight, BrainCircuit, Sparkles } from 'lucide-react'

type Row = Record<string, unknown>
function score(value: unknown) { return typeof value === 'number' ? `${value}/100` : 'Pendiente' }

export function EvolutionBenchmarkPanel({ benchmarks, evalCases, evalRuns }: { benchmarks: Row[]; evalCases: Row[]; evalRuns: Row[] }) {
  const measured = benchmarks.filter(item => typeof item.yoyo_score === 'number').length
  return <section className="evolution-grid-two">
    <article className="evolution-panel">
      <div className="evolution-heading"><div><span className="eyebrow">Benchmark competitivo</span><h2>Capacidades verificadas</h2></div><span className="evolution-count">{measured}/{benchmarks.length} medidas</span></div>
      <div className="benchmark-list">{benchmarks.length ? benchmarks.map(item => <article key={`${item.competitor}-${item.capability}`}>
        <div className="benchmark-top"><strong>{String(item.competitor)}</strong><span>{String(item.category)}</span></div>
        <h3>{String(item.capability).replaceAll('-', ' ')}</h3><p>{String(item.evidence)}</p>
        <div className="benchmark-bottom"><span>YOYO: <b>{score(item.yoyo_score)}</b></span><span>Objetivo: <b>{score(item.target_score)}</b></span><a href={String(item.source_url)} target="_blank" rel="noreferrer">Fuente <ArrowUpRight size={13}/></a></div>
      </article>) : <div className="evolution-empty">Aún no hay capacidades benchmark registradas.</div>}</div>
    </article>
    <article className="evolution-panel">
      <div className="evolution-heading"><div><span className="eyebrow">YOYO IA</span><h2>Batería de evaluación</h2></div><span className="evolution-count">{evalCases.length} casos activos</span></div>
      <div className="eval-list">{evalCases.map(item => { const latestRun = evalRuns.find(run => run.case_id === item.id); return <div key={String(item.id)}><span className="eval-icon"><BrainCircuit size={17}/></span><div><strong>{String(item.title)}</strong><small>{String(item.category)} · peso {String(item.weight)}</small></div><b>{latestRun ? score(latestRun.score) : 'Sin ejecutar'}</b></div> })}</div>
      <div className="evolution-note"><Sparkles size={18}/><p>La batería cubre generación, adaptación, análisis cruzado, evaluación, informes, planificación, accesibilidad y seguridad.</p></div>
    </article>
  </section>
}
