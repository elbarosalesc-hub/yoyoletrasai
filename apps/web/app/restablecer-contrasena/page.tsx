'use client'

import { FormEvent, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [pending, setPending] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [success, setSuccess] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedback('')
    if (password.length < 8) { setFeedback('La contraseña debe tener al menos 8 caracteres.'); return }
    if (password !== confirmation) { setFeedback('Las contraseñas no coinciden.'); return }
    setPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setSuccess(true)
      setFeedback('Tu contraseña quedó guardada. Ya puedes entrar a tu panel de propietaria.')
    } catch {
      setFeedback('No fue posible guardar la contraseña. Solicita un nuevo enlace de activación.')
    } finally { setPending(false) }
  }

  return <main className="reset-shell"><section className="reset-card"><div className="reset-brand">YO</div><span>SEGURIDAD DE CUENTA</span><h1>Crear nueva contraseña</h1><p>Define y guarda tu contraseña personal para ingresar a YOYOLETRASAI.</p>{feedback&&<div className={`feedback ${success?'success':''}`} role="status">{feedback}</div>}{!success?<form onSubmit={submit}><label>Nueva contraseña<input type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={8} required autoComplete="new-password"/></label><label>Confirmar contraseña<input type="password" value={confirmation} onChange={e=>setConfirmation(e.target.value)} minLength={8} required autoComplete="new-password"/></label><button disabled={pending}>{pending?'Guardando…':'Guardar mi contraseña'}</button></form>:<a className="continue" href="/app">Entrar y ver las mejoras</a>}</section><style jsx>{`
.reset-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#dfe8ff 0,transparent 34%),linear-gradient(145deg,#f7f9fd,#edf2fb);color:#172033}.reset-card{width:min(480px,100%);padding:38px;border-radius:28px;background:#fff;border:1px solid #e0e5ef;box-shadow:0 30px 80px #26345a20}.reset-brand{width:66px;height:66px;border-radius:21px;display:grid;place-items:center;background:linear-gradient(145deg,#3157d5,#12a89d);color:#fff;font-size:24px;font-weight:950;box-shadow:0 16px 40px #3157d544}.reset-card>span{display:block;margin-top:26px;color:#3157d5;font-size:12px;font-weight:900;letter-spacing:.14em}.reset-card h1{font-size:34px;line-height:1.08;margin:12px 0}.reset-card p{color:#60697c;line-height:1.6}.reset-card form{display:grid;gap:18px;margin-top:26px}.reset-card label{display:grid;gap:8px;font-weight:850;font-size:14px}.reset-card input{height:50px;border:1px solid #d8deea;border-radius:14px;padding:0 15px;font:inherit;outline:none}.reset-card input:focus{border-color:#3157d5;box-shadow:0 0 0 4px #3157d51a}.reset-card button,.continue{height:52px;border:0;border-radius:15px;background:linear-gradient(135deg,#3157d5,#12a89d);color:#fff;font-weight:900;font-size:16px;display:grid;place-items:center;text-decoration:none;cursor:pointer}.reset-card button:disabled{opacity:.65;cursor:wait}.feedback{padding:13px 15px;border-radius:13px;background:#fff3e8;color:#8b4f16;font-weight:750;margin-top:18px}.feedback.success{background:#eaf9f1;color:#176f48}.continue{margin-top:24px}
`}</style></main>
}
