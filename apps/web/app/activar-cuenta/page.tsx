'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

function ActivationContent() {
  const params = useSearchParams()
  const [status, setStatus] = useState('Verificando tu acceso seguro…')
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function activate() {
      const tokenHash = params.get('token_hash')
      if (!tokenHash) {
        setFailed(true)
        setStatus('El enlace no contiene un token válido. Solicita uno nuevo desde la pantalla de acceso.')
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: 'magiclink',
      })

      if (cancelled) return
      if (error) {
        setFailed(true)
        setStatus('El enlace venció o ya fue utilizado. Solicita un nuevo enlace para crear tu contraseña.')
        return
      }

      setStatus('Identidad confirmada. Abriendo creación de contraseña…')
      window.location.replace('/restablecer-contrasena?first=1')
    }
    void activate()
    return () => { cancelled = true }
  }, [params])

  return (
    <main className="activation-shell">
      <section className="activation-card">
        <div className="activation-icon">{failed ? <ShieldCheck /> : <KeyRound />}</div>
        <span>YOYOLETRASAI · ACCESO PROPIETARIA</span>
        <h1>{failed ? 'No pudimos validar el enlace' : 'Activando tu cuenta'}</h1>
        <p>{status}</p>
        {!failed && <div className="activation-progress"><i /></div>}
        {failed && <a href="/acceso">Volver al acceso</a>}
        <small><CheckCircle2 size={14}/> El token es de un solo uso y no sustituye tu contraseña.</small>
      </section>
      <style jsx>{`
        .activation-shell{min-height:100vh;display:grid;place-items:center;padding:24px;background:radial-gradient(circle at top,#e3e8ff,transparent 38%),linear-gradient(145deg,#f8f9fd,#edf2fb);color:#172033}.activation-card{width:min(500px,100%);padding:40px;border-radius:30px;background:#fff;border:1px solid #e1e6f0;box-shadow:0 32px 90px #26345a20;text-align:center}.activation-icon{width:72px;height:72px;margin:0 auto 24px;display:grid;place-items:center;border-radius:22px;background:linear-gradient(145deg,#7658ef,#24c9b4);color:#fff}.activation-icon :global(svg){width:32px;height:32px}.activation-card>span{display:block;color:#6757df;font-size:12px;font-weight:900;letter-spacing:.12em}.activation-card h1{font-size:34px;margin:12px 0 10px}.activation-card p{color:#667085;line-height:1.65}.activation-progress{height:8px;border-radius:999px;background:#edf0f8;overflow:hidden;margin:24px 0}.activation-progress i{display:block;width:55%;height:100%;border-radius:inherit;background:linear-gradient(90deg,#7658ef,#24c9b4);animation:move 1.1s ease-in-out infinite alternate}.activation-card a{display:grid;place-items:center;height:50px;margin-top:24px;border-radius:14px;background:#5d55db;color:#fff;font-weight:900;text-decoration:none}.activation-card small{margin-top:24px;display:flex;justify-content:center;align-items:center;gap:6px;color:#7b8494}@keyframes move{to{transform:translateX(82%)}}
      `}</style>
    </main>
  )
}

export default function ActivateAccountPage(){
  return <Suspense fallback={<main className="activation-shell">Verificando acceso…</main>}><ActivationContent/></Suspense>
}
