import { BookOpen, CalendarDays, CheckCircle2, Clock3, Compass, Trophy } from 'lucide-react'
import { PlatformShell } from '@/app/components/PlatformShell'

const days = [
  { day: 'Lun', date: '27', active: false },
  { day: 'Mar', date: '28', active: false },
  { day: 'Mié', date: '29', active: false },
  { day: 'Jue', date: '30', active: true },
  { day: 'Vie', date: '31', active: false },
]

export default function AgendaPage() {
  return (
    <PlatformShell title="Agenda" subtitle="Organiza tus actividades, clases, desafíos y momentos de descanso.">
      <section className="week-strip">
        {days.map((item) => <article key={item.date} className={item.active ? 'active' : ''}><span>{item.day}</span><strong>{item.date}</strong></article>)}
      </section>
      <section className="agenda-module-grid">
        <article className="day-timeline glass-card">
          <header><div><span className="eyebrow">JUEVES 30 DE JULIO</span><h2>Plan del día</h2></div><CalendarDays /></header>
          <div className="timeline-entry completed"><time>09:00</time><span><BookOpen /></span><div><strong>Lectura guiada</strong><small>Comprensión de información explícita · 25 min</small></div><CheckCircle2 /></div>
          <div className="timeline-entry current"><time>10:30</time><span><Compass /></span><div><strong>Misión del Bosque</strong><small>Actividad en curso · 60% completado</small></div><button className="primary-button">Continuar</button></div>
          <div className="timeline-entry"><time>12:15</time><span><Trophy /></span><div><strong>Desafío semanal</strong><small>Vocabulario y pistas · 20 min</small></div></div>
          <div className="timeline-entry"><time>15:00</time><span><Clock3 /></span><div><strong>Repaso personal</strong><small>Actividad sugerida · 15 min</small></div></div>
        </article>
        <aside className="agenda-insight glass-card"><span className="eyebrow">RECOMENDACIÓN</span><h2>Buen ritmo de aprendizaje</h2><p>Has completado la primera actividad y mantienes tu misión principal al día. Después del desafío semanal tendrás un bloque libre.</p><div className="focus-meter"><span><i style={{width:'72%'}} /></span><strong>72% del día organizado</strong></div></aside>
      </section>
    </PlatformShell>
  )
}
