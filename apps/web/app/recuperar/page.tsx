'use client'

import {useState} from 'react'
import {ArrowLeft,CheckCircle2,Mail,ShieldCheck} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

export default function RecoverPasswordPage(){
 const[email,setEmail]=useState('')
 const[message,setMessage]=useState('')
 const[loading,setLoading]=useState(false)

 async function sendRecovery(){
  const client=createSupabaseBrowserClient()
  if(!client){setMessage('Supabase aún no está configurado.');return}
  setLoading(true)
  const redirectTo=`${window.location.origin}/actualizar-clave`
  const{error}=await client.auth.resetPasswordForEmail(email,{redirectTo})
  setLoading(false)
  setMessage(error?error.message:'Te enviamos un enlace para crear una nueva contraseña.')
 }

 return <main className="auth-flow-page">
  <section className="auth-flow-card">
   <a href="/login" className="auth-flow-back"><ArrowLeft/>Volver al acceso</a>
   <span className="auth-flow-icon"><Mail/></span>
   <small>RECUPERACIÓN SEGURA</small>
   <h1>Recupera tu contraseña</h1>
   <p>Ingresa tu correo institucional. Recibirás un enlace temporal para establecer una nueva clave.</p>
   <label>Correo institucional<input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="nombre@colegio.cl"/></label>
   {message&&<div className="auth-flow-message"><CheckCircle2/>{message}</div>}
   <button onClick={sendRecovery} disabled={!email||loading}>{loading?'Enviando...':'Enviar enlace de recuperación'}</button>
   <div className="auth-flow-security"><ShieldCheck/><span>El enlace expira y solo puede utilizarse una vez.</span></div>
  </section>
 </main>
}
