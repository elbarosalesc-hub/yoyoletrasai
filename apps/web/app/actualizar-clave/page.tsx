'use client'

import {useState} from 'react'
import {CheckCircle2,Eye,EyeOff,KeyRound,ShieldCheck} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

export default function UpdatePasswordPage(){
 const[password,setPassword]=useState('')
 const[confirm,setConfirm]=useState('')
 const[show,setShow]=useState(false)
 const[message,setMessage]=useState('')
 const[done,setDone]=useState(false)

 async function updatePassword(){
  if(password.length<8){setMessage('La contraseña debe tener al menos 8 caracteres.');return}
  if(password!==confirm){setMessage('Las contraseñas no coinciden.');return}
  const client=createSupabaseBrowserClient()
  if(!client){setMessage('Supabase aún no está configurado.');return}
  const{error}=await client.auth.updateUser({password})
  if(error){setMessage(error.message);return}
  setDone(true);setMessage('Contraseña actualizada correctamente.')
 }

 return <main className="auth-flow-page"><section className="auth-flow-card">
  <span className="auth-flow-icon"><KeyRound/></span><small>NUEVA CONTRASEÑA</small><h1>Crea una clave segura</h1><p>Utiliza al menos 8 caracteres y evita repetir contraseñas de otros servicios.</p>
  <label>Nueva contraseña<div className="auth-flow-password"><input type={show?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder="••••••••"/><button onClick={()=>setShow(value=>!value)} aria-label="Mostrar u ocultar contraseña">{show?<EyeOff/>:<Eye/>}</button></div></label>
  <label>Confirmar contraseña<input type={show?'text':'password'} value={confirm} onChange={event=>setConfirm(event.target.value)} placeholder="••••••••"/></label>
  {message&&<div className="auth-flow-message"><CheckCircle2/>{message}</div>}
  {done?<a className="auth-flow-primary-link" href="/login">Ingresar a la plataforma</a>:<button onClick={updatePassword} disabled={!password||!confirm}>Guardar nueva contraseña</button>}
  <div className="auth-flow-security"><ShieldCheck/><span>La sesión de recuperación se valida antes de guardar la nueva clave.</span></div>
 </section></main>
}
