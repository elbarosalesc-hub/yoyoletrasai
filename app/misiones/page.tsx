import { BookOpen, CheckCircle2, LockKeyhole, Play, Sparkles, Star } from 'lucide-react'
import { PlatformShell } from '@/app/components/PlatformShell'

const missions = [
  { title: 'El secreto del árbol luminoso', world: 'Bosque de las Palabras', progress: 60, reward: 40, state: 'continue' },
  { title: 'El puente de las sílabas', world: 'Bosque de las Palabras', progress: 0, reward: 55, state: 'available' },
  { title: 'La biblioteca escondida', world: 'Ciudad de los Cuentos', progress: 0, reward: 80, state: 'locked' },
]

export default function MissionsPage() {
  return (
    <PlatformShell title="Misiones" subtitle="Continúa tu recorrido, desbloquea mundos y fortalece tus aprendizajes.">
      <section className="module-summary-grid">
        <article className="module-stat-card"><Sparkles /><strong>3</strong><span>misiones activas</span></article>
        <article className="module-stat-card"><CheckCircle2 /><strong>12</strong><span>misiones completadas</span></article>
        <article className="module-stat-card"><Star /><strong>640</strong><span>XP acumulada</span></article>
      </section>
      <section className="mission-library">
        {missions.map((mission) => (
          <article className={`mission-library-card ${mission.state}`} key={mission.title}>
            <div className="mission-library-icon">{mission.state === 'locked' ? <LockKeyhole /> : <BookOpen />}</div>
            <div className="mission-library-copy">
              <small>{mission.world}</small>
              <h2>{mission.title}</h2>
              <div className="library-progress"><i><b style={{ width: `${mission.progress}%` }} /></i><span>{mission.progress}%</span></div>
              <p>Recompensa: {mission.reward} XP y una oportunidad de obtener una insignia especial.</p>
            </div>
            <button type="button" disabled={mission.state === 'locked'} className="primary-button">
              {mission.state === 'continue' ? 'Continuar' : mission.state === 'locked' ? 'Bloqueada' : 'Comenzar'}
              {mission.state !== 'locked' && <Play />}
            </button>
          </article>
        ))}
      </section>
    </PlatformShell>
  )
}
