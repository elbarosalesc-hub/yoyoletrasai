import { Bot, Gamepad2, Gauge, Library, Radar, ShieldCheck } from 'lucide-react'

function score(value: unknown) {
  return typeof value === 'number' ? `${value}/100` : 'Pendiente'
}

export function EvolutionScoreCards({ latest }: { latest?: Record<string, unknown> }) {
  const cards = [
    ['Plataforma', latest?.platform_score, Gauge],
    ['YOYO IA', latest?.ai_score, Bot],
    ['Recursos', latest?.resource_score, Library],
    ['Juegos 3D', latest?.games_score, Gamepad2],
    ['Accesibilidad', latest?.accessibility_score, ShieldCheck],
    ['Benchmark', latest?.benchmark_score, Radar],
  ] as const

  return <section className="evolution-score-strip">
    <div className="evolution-overall"><span>Índice de evolución</span><strong>{score(latest?.overall_score)}</strong><small>{latest?.executive_summary ? String(latest.executive_summary) : 'Ejecuta la primera auditoría integral para establecer la línea base.'}</small></div>
    <div className="evolution-score-grid">{cards.map(([label, value, Icon]) => <article key={label}><Icon size={19}/><span>{label}</span><strong>{score(value)}</strong></article>)}</div>
  </section>
}
