import { Activity, CheckCircle2, TriangleAlert } from 'lucide-react'

type Row = Record<string, unknown>
const areaLabel: Record<string, string> = { platform:'Plataforma', ai:'YOYO IA', resources:'Recursos', games:'Juegos 3D', accessibility:'Accesibilidad', security:'Seguridad', benchmark:'Benchmark', operations:'Operación' }

export function EvolutionBacklogPanel({ actions, findings }: { actions: Row[]; findings: Row[] }) {
  const validated = actions.filter(item => item.status === 'validated').length
  const active = actions.filter(item => item.status !== 'validated').length
  return <>
    <section className="evolution-panel evolution-backlog">
      <div className="evolution-heading"><div><span className="eyebrow">Backlog gobernado</span><h2>Mejoras priorizadas</h2><p>La auditoría propone; sólo la propietaria aprueba y una validación técnica puede marcar una mejora como lista.</p></div><div className="evolution-summary-pills"><span>{active} activas</span><span>{validated} validadas</span></div></div>
      <div className="action-table">{actions.length ? actions.map(item => <article key={String(item.id)}>
        <div className="action-priority"><strong>{String(item.priority)}</strong><small>prioridad</small></div>
        <div className="action-copy"><span>{areaLabel[String(item.area)] || String(item.area)}</span><h3>{String(item.title)}</h3><p>{String(item.problem)}</p><small><b>Recomendación:</b> {String(item.recommendation)}</small></div>
        <div className="action-state"><b className={`state-${String(item.status)}`}>{String(item.status)}</b><small>{item.commit_sha ? `Commit ${String(item.commit_sha).slice(0,7)}` : 'Sin implementación aún'}</small></div>
      </article>) : <div className="evolution-empty"><CheckCircle2/> No hay mejoras pendientes. Ejecuta una auditoría para revisar el estado actual.</div>}</div>
    </section>
    <section className="evolution-grid-two">
      <article className="evolution-panel"><div className="evolution-heading"><div><span className="eyebrow">Radar</span><h2>Hallazgos de innovación</h2></div><span className="evolution-count">{findings.length}</span></div><div className="finding-list">{findings.slice(0,8).map(item => <div key={String(item.id)}><Activity size={17}/><div><strong>{String(item.title)}</strong><small>{String(item.source_name)} · score {String(item.score ?? '—')}</small><p>{String(item.recommendation || item.comparison || '')}</p></div></div>)}{!findings.length&&<div className="evolution-empty">Sin hallazgos abiertos.</div>}</div></article>
      <article className="evolution-panel"><div className="evolution-heading"><div><span className="eyebrow">Gobernanza</span><h2>Pipeline de implementación</h2></div></div><div className="governance-steps"><div><span>1</span><strong>Auditar</strong><small>Métricas y evidencia</small></div><div><span>2</span><strong>Comparar</strong><small>Benchmark vigente</small></div><div><span>3</span><strong>Proponer</strong><small>Impacto, esfuerzo y riesgo</small></div><div><span>4</span><strong>Implementar</strong><small>Rama segura + commit</small></div><div><span>5</span><strong>Validar</strong><small>CI + calidad + preview</small></div><div><span>6</span><strong>Actualizar</strong><small>Aprobación propietaria</small></div></div><div className="evolution-warning"><TriangleAlert size={18}/><p>Ninguna mejora automática tiene permiso para fusionar main ni promover producción.</p></div></article>
    </section>
  </>
}
