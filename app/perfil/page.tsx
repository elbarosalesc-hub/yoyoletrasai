import { BookOpen, Coins, Heart, ShieldCheck, Star, Trophy, Zap } from 'lucide-react'
import { PlatformShell } from '@/app/components/PlatformShell'

export default function ProfilePage() {
  return (
    <PlatformShell title="Perfil" subtitle="Revisa tu nivel, recompensas, preferencias y progreso general.">
      <section className="profile-grid">
        <article className="profile-main-card glass-card">
          <div className="profile-avatar-large">ER</div>
          <span className="eyebrow">EXPLORADORA DE PALABRAS</span>
          <h2>Elba</h2>
          <p>Nivel 8 · Bosque de las Palabras</p>
          <div className="profile-level"><span><i style={{width:'64%'}} /></span><strong>640 / 1000 XP</strong></div>
          <div className="profile-stat-row"><span><Heart />4 vidas</span><span><Zap />92 energía</span><span><Coins />1250 monedas</span></div>
        </article>
        <section className="profile-details">
          <article className="profile-detail-card"><Star /><div><strong>Nivel actual</strong><span>8 · Exploradora</span></div></article>
          <article className="profile-detail-card"><Trophy /><div><strong>Logros</strong><span>12 insignias obtenidas</span></div></article>
          <article className="profile-detail-card"><BookOpen /><div><strong>Misiones</strong><span>12 completadas · 3 activas</span></div></article>
          <article className="profile-detail-card"><ShieldCheck /><div><strong>Cuenta protegida</strong><span>Acceso institucional seguro</span></div></article>
        </section>
      </section>
      <section className="preferences-card glass-card"><div><span className="eyebrow">PREFERENCIAS DE EXPERIENCIA</span><h2>Accesibilidad y concentración</h2><p>Estos controles quedarán vinculados al perfil en Supabase.</p></div><div className="preference-list"><label><span>Reducir movimiento</span><input type="checkbox" /></label><label><span>Lectura en voz alta</span><input type="checkbox" /></label><label><span>Modo de baja estimulación</span><input type="checkbox" /></label></div></section>
    </PlatformShell>
  )
}
