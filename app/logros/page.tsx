import { Award, Flame, Medal, ShieldCheck, Sparkles, Star, Trophy } from 'lucide-react'
import { PlatformShell } from '@/app/components/PlatformShell'

const achievements = [
  { title: 'Exploradora de palabras', description: 'Completaste 10 misiones de lectura.', icon: Trophy, unlocked: true },
  { title: 'Racha brillante', description: 'Aprendiste durante 5 días seguidos.', icon: Flame, unlocked: true },
  { title: 'Cazadora de pistas', description: 'Resolviste 20 desafíos con pistas.', icon: Sparkles, unlocked: true },
  { title: 'Guardiana de historias', description: 'Completa el mundo Bosque de las Palabras.', icon: ShieldCheck, unlocked: false },
  { title: 'Maestra del vocabulario', description: 'Aprende 100 palabras nuevas.', icon: Medal, unlocked: false },
  { title: 'Estrella colaborativa', description: 'Participa en 5 misiones grupales.', icon: Star, unlocked: false },
]

export default function AchievementsPage() {
  return (
    <PlatformShell title="Logros" subtitle="Celebra tu progreso y descubre los próximos desafíos que puedes desbloquear.">
      <section className="achievement-hero glass-card">
        <div className="achievement-emblem"><Award /></div>
        <div><span className="eyebrow">COLECCIÓN PERSONAL</span><h2>3 de 6 logros desbloqueados</h2><p>Cada logro representa esfuerzo, constancia y nuevas habilidades.</p></div>
        <div className="achievement-total"><strong>12</strong><span>insignias totales</span></div>
      </section>
      <section className="achievement-grid">
        {achievements.map(({ title, description, icon: Icon, unlocked }) => (
          <article className={`achievement-card ${unlocked ? 'unlocked' : 'locked'}`} key={title}>
            <div className="achievement-icon"><Icon /></div>
            <span>{unlocked ? 'DESBLOQUEADO' : 'PRÓXIMAMENTE'}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </article>
        ))}
      </section>
    </PlatformShell>
  )
}
