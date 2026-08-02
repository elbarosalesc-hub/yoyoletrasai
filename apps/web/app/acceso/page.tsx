'use client'

import { FormEvent, Suspense, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getSafeRedirectPath } from '@/lib/auth/redirect'

type Mode = 'login' | 'register' | 'recovery'

const messages: Record<string, string> = {
  missing_code: 'El enlace de acceso no contiene un código válido.',
  callback_failed: 'No fue posible completar el acceso. Solicita un nuevo enlace.',
  signed_out: 'Tu sesión se cerró correctamente.',
}

function getFriendlyError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  if (message.includes('invalid login credentials')) return 'El correo o la contraseña no son correctos.'
  if (message.includes('email not confirmed')) return 'Debes confirmar tu correo antes de ingresar.'
  if (message.includes('user already registered')) return 'Ya existe una cuenta asociada a este correo.'
  if (message.includes('password')) return 'La contraseña no cumple los requisitos de seguridad.'
  return 'No fue posible completar la solicitud. Inténtalo nuevamente.'
}

function AccessForm() {
  const params = useSearchParams()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const next = useMemo(() => getSafeRedirectPath(params.get('next')), [params])
  const initialMessage = messages[params.get('error') ?? params.get('message') ?? '']

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPending(true)
    setFeedback('')

    try {
      const supabase = createClient()

      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        window.location.assign(next)
        return
      }

      if (mode === 'register') {
        const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: callback, data: { display_name: displayName } },
        })
        if (error) throw error
        setFeedback(data.session ? 'Cuenta creada. Ingresando…' : 'Revisa tu correo para confirmar la cuenta.')
        if (data.session) window.location.assign(next)
        return
      }

      const callback = `${window.location.origin}/auth/callback?next=${encodeURIComponent('/restablecer-contrasena')}`
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: callback })
      if (error) throw error
      setFeedback('Enviamos un enlace de recuperación a tu correo.')
    } catch (error) {
      setFeedback(getFriendlyError(error))
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="access-panel">
      <div className="access-card">
        <span className="eyebrow">ACCESO SEGURO</span>
        <h2>{mode === 'login' ? 'Bienvenida nuevamente' : mode === 'register' ? 'Crear cuenta' : 'Recuperar acceso'}</h2>
        <p>{mode === 'recovery' ? 'Te enviaremos un enlace seguro.' : 'Utiliza tu correo institucional.'}</p>
        {(initialMessage || feedback) && <div className="feedback" role="status">{feedback || initialMessage}</div>}
        <form onSubmit={submit}>
          {mode === 'register' && <label>Nombre visible<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} required autoComplete="name" /></label>}
          <label>Correo electrónico<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
          {mode !== 'recovery' && <label>Contraseña<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>}
          <button disabled={pending}>{pending ? 'Procesando…' : mode === 'login' ? 'Ingresar' : mode === 'register' ? 'Crear cuenta' : 'Enviar enlace'}</button>
        </form>
        <div className="mode-actions">
          <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>{mode === 'login' ? 'Crear una cuenta' : 'Volver al ingreso'}</button>
          {mode === 'login' && <button type="button" onClick={() => setMode('recovery')}>Olvidé mi contraseña</button>}
        </div>
      </div>
    </section>
  )
}

export default function AccessPage() {
  return (
    <main className="access-shell">
      <section className="access-hero">
        <div className="brand">YO</div>
        <span>NEXO EDUCATIVO NACIONAL</span>
        <h1>Aprendizaje, inclusión y gestión escolar en un solo lugar.</h1>
        <p>Acceso seguro para docentes, estudiantes, familias y equipos institucionales.</p>
      </section>
      <Suspense fallback={<section className="access-panel"><div className="access-card">Cargando acceso seguro…</div></section>}>
        <AccessForm />
      </Suspense>
      <style jsx>{`
        .access-shell{min-height:100vh;display:grid;grid-template-columns:1.15fr .85fr;background:#f6f8fc;color:#182033}.access-hero{padding:clamp(32px,7vw,96px);display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 20% 20%,#ffffff30,transparent 28%),linear-gradient(145deg,#253f9b,#3157d5 58%,#12a89d);color:white}.brand{width:70px;height:70px;border-radius:22px;display:grid;place-items:center;background:white;color:#3157d5;font-weight:950;font-size:25px;box-shadow:0 18px 60px #10225a55}.access-hero span,.eyebrow{font-size:12px;font-weight:900;letter-spacing:.14em;margin-top:32px}.access-hero h1{font-size:clamp(40px,5vw,70px);line-height:1.02;max-width:760px;margin:18px 0}.access-hero p{font-size:19px;line-height:1.65;max-width:620px;color:#eef4ff}.access-panel{display:grid;place-items:center;padding:28px}.access-card{width:min(460px,100%);padding:36px;border-radius:26px;background:white;border:1px solid #e2e6ef;box-shadow:0 30px 80px #26345a1b}.access-card h2{font-size:31px;margin:10px 0}.access-card>p{color:#5d6578}.access-card form{display:grid;gap:17px;margin-top:26px}.access-card label{display:grid;gap:8px;font-weight:800;font-size:14px}.access-card input{height:50px;border:1px solid #d9deea;border-radius:14px;padding:0 15px;font:inherit;outline:none}.access-card input:focus{border-color:#3157d5;box-shadow:0 0 0 4px #3157d51a}.access-card form button{height:52px;border:0;border-radius:15px;background:#3157d5;color:white;font-weight:900;font-size:16px;cursor:pointer}.access-card form button:disabled{opacity:.65;cursor:wait}.feedback{padding:13px 15px;border-radius:13px;background:#eef2ff;color:#243c9b;font-weight:750;margin-top:18px}.mode-actions{display:flex;justify-content:space-between;gap:12px;margin-top:20px}.mode-actions button{border:0;background:none;color:#3157d5;font-weight:800;cursor:pointer;padding:8px 0}@media(max-width:820px){.access-shell{grid-template-columns:1fr}.access-hero{min-height:300px;padding:36px}.access-hero h1{font-size:38px}.access-panel{padding:18px}.access-card{padding:27px}.mode-actions{flex-direction:column;align-items:flex-start}}
      `}</style>
    </main>
  )
}
