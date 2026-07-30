'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setMessage('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      window.location.assign('/dashboard')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible iniciar sesión.')
    } finally {
      setPending(false)
    }
  }

  return (
    <main className="login-shell">
      <section className="login-art" aria-label="Bienvenida a YoYo Letras AI">
        <div className="brand-mark">YO</div>
        <span className="eyebrow">APRENDER ES UNA AVENTURA</span>
        <h1>Un mundo educativo creado para avanzar a tu propio ritmo.</h1>
        <p>Misiones, apoyos personalizados, progreso y acompañamiento pedagógico en un solo lugar.</p>
        <div className="floating-orb orb-one" />
        <div className="floating-orb orb-two" />
      </section>
      <section className="login-panel">
        <div className="login-card">
          <span className="eyebrow">ACCESO SEGURO</span>
          <h2>Bienvenida a YoYo Letras AI</h2>
          <p>Ingresa con tu cuenta institucional.</p>
          <form onSubmit={handleSubmit}>
            <label>Correo electrónico<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" /></label>
            <label>Contraseña<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" /></label>
            {message && <div className="form-message" role="alert">{message}</div>}
            <button className="primary-button" disabled={pending}>{pending ? 'Ingresando…' : 'Ingresar'}</button>
          </form>
          <Link className="demo-link" href="/dashboard">Ver experiencia de demostración</Link>
        </div>
      </section>
    </main>
  )
}
