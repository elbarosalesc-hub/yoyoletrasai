'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bell, BookOpen, Bot, CalendarDays, CheckCircle2, ChevronRight, Coins, Compass, Heart, HelpCircle, Home, Map, MessageCircle, Settings, Sparkles, Star, Trophy, Volume2, Zap } from 'lucide-react'

const answers = ['Una estrella escondida', 'Una llave dorada', 'Un libro mágico']

export function DashboardExperience({ displayName, authenticated }: { displayName: string; authenticated: boolean }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [feedback, setFeedback] = useState('')
  const [xp, setXp] = useState(640)
  const [coins, setCoins] = useState(1250)
  const [assistantOpen, setAssistantOpen] = useState(false)

  function verifyAnswer() {
    if (!selected) {
      setFeedback('Selecciona una alternativa antes de comprobar.')
      return
    }
    if (selected === 'Una llave dorada') {
      setFeedback('¡Excelente! Encontraste la pista correcta y ganaste 40 XP.')
      setXp((value) => Math.min(value + 40, 1000))
      setCoins((value) => value + 20)
    } else {
      setFeedback('Casi. Observa el brillo junto al árbol y vuelve a intentarlo.')
    }
  }

  return (
    <main className="dashboard-shell">
      <header className="top-status-bar">
        <Link href="/dashboard" className="dashboard-logo"><span>YO</span><strong>YoYo Letras AI</strong></Link>
        <nav className="quick-actions" aria-label="Acciones rápidas">
          <button aria-label="Sonido"><Volume2 /></button>
          <button aria-label="Notificaciones"><Bell /></button>
          <button aria-label="Configuración"><Settings /></button>
        </nav>
        <div className="player-stats">
          <div className="level-pill"><Star /><span>Nivel 8</span><i><b style={{ width: `${xp / 10}%` }} /></i></div>
          <span className="stat-chip heart"><Heart /> 4</span>
          <span className="stat-chip energy"><Zap /> 92</span>
          <span className="stat-chip coin"><Coins /> {coins}</span>
          <div className="avatar">ER</div>
        </div>
      </header>

      <section className="dashboard-grid">
        <section className="adventure-scene">
          <div className="sky-glow" />
          <div className="moon" />
          <div className="mountain mountain-one" />
          <div className="mountain mountain-two" />
          <div className="forest floor-one" />
          <div className="forest floor-two" />
          <div className="cabin"><span className="cabin-window" /><span className="cabin-door" /></div>
          <div className="hero-character"><span className="hero-head" /><span className="hero-body" /><span className="hero-book">Aa</span></div>
          <div className="robot-character"><Bot /></div>
          <div className="welcome-copy">
            <span className="eyebrow">BOSQUE DE LAS PALABRAS</span>
            <h1>¡Hola, {displayName}!</h1>
            <p>Hoy continuarás una aventura de comprensión lectora. Completa la misión para abrir el Portal de las Historias.</p>
            {!authenticated && <span className="demo-badge">Modo demostración</span>}
          </div>
          <article className="player-card glass-card">
            <div className="mini-avatar">ER</div>
            <div><small>AVENTURERA</small><h2>{displayName}</h2><p>Nivel 8 · Exploradora de palabras</p></div>
            <div className="mini-progress"><span><i style={{ width: `${xp / 10}%` }} /></span><strong>{xp}/1000 XP</strong></div>
          </article>
        </section>

        <section className="mission-card glass-card">
          <div className="mission-header"><div><span className="eyebrow">MISIÓN PRINCIPAL · 3 DE 5</span><h2>El secreto del árbol luminoso</h2></div><span className="reward-pill"><Trophy /> +40 XP</span></div>
          <div className="mission-progress"><i><b style={{ width: '60%' }} /></i><span>60%</span></div>
          <div className="story-box"><Sparkles /><p>Luma encontró un destello cerca del árbol antiguo. Lee con atención y descubre qué objeto escondía la luz.</p></div>
          <fieldset>
            <legend>¿Qué encontró Luma junto al árbol?</legend>
            {answers.map((answer) => (
              <button key={answer} type="button" className={`answer-option ${selected === answer ? 'selected' : ''}`} onClick={() => { setSelected(answer); setFeedback('') }}>
                <span>{selected === answer ? <CheckCircle2 /> : <span className="option-letter">{String.fromCharCode(65 + answers.indexOf(answer))}</span>}</span>{answer}
              </button>
            ))}
          </fieldset>
          {feedback && <div className="mission-feedback" role="status">{feedback}</div>}
          <div className="mission-actions"><button className="hint-button" onClick={() => setAssistantOpen(true)}><HelpCircle /> Pedir una pista</button><button className="primary-button" onClick={verifyAnswer}>Comprobar <ChevronRight /></button></div>
          <div className="reward-row"><span><Coins /> 20 monedas</span><span><Star /> Progreso de ruta</span><span><Trophy /> Insignia posible</span></div>
        </section>

        <aside className="right-rail">
          <section className="agenda-card glass-card">
            <div className="rail-heading"><div><span className="eyebrow">TU DÍA</span><h2>Agenda de hoy</h2></div><CalendarDays /></div>
            <div className="agenda-list">
              <article><time>09:00</time><span className="agenda-icon purple"><BookOpen /></span><div><strong>Lectura guiada</strong><small>Completada</small></div><CheckCircle2 className="done" /></article>
              <article><time>10:30</time><span className="agenda-icon blue"><Compass /></span><div><strong>Misión del bosque</strong><small>En curso</small></div><span className="live-dot" /></article>
              <article><time>12:15</time><span className="agenda-icon gold"><Trophy /></span><div><strong>Desafío semanal</strong><small>20 minutos</small></div></article>
            </div>
            <button className="secondary-button">Ver calendario completo</button>
          </section>
          <section className="assistant-card glass-card">
            <div className="assistant-avatar"><Bot /></div>
            <div><span className="eyebrow">PROFESORA AI</span><h2>Yoyo</h2><p>Estoy aquí para darte pistas y explicarte cada paso con calma.</p></div>
            <button className="primary-button" onClick={() => setAssistantOpen(true)}><MessageCircle /> Hablar con Yoyo</button>
          </section>
        </aside>
      </section>

      <nav className="bottom-navigation" aria-label="Navegación principal">
        <Link className="active" href="/dashboard"><Home /><span>Inicio</span></Link>
        <Link href="#"><BookOpen /><span>Diario</span></Link>
        <Link href="#"><Map /><span>Mapa</span></Link>
        <Link href="#"><Compass /><span>Misiones</span></Link>
        <Link href="#"><Trophy /><span>Logros</span></Link>
        <Link href="#"><Settings /><span>Más</span></Link>
      </nav>

      {assistantOpen && <div className="assistant-drawer" role="dialog" aria-modal="true" aria-label="Asistente Yoyo"><div className="drawer-header"><div className="assistant-avatar"><Bot /></div><div><strong>Yoyo</strong><small>Asistente educativa</small></div><button onClick={() => setAssistantOpen(false)} aria-label="Cerrar">×</button></div><div className="chat-bubble">Observa la parte del texto que habla de un objeto que puede abrir algo. ¿Qué alternativa cumple esa función?</div><div className="quick-replies"><button onClick={() => setFeedback('Pista: sirve para abrir una puerta o un cofre.')}>Dame otra pista</button><button onClick={() => setFeedback('Busca una palabra asociada a abrir.')}>Explícamelo más fácil</button></div></div>}
    </main>
  )
}
