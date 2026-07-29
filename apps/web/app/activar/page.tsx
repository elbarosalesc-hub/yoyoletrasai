'use client'

import {useEffect,useState} from 'react'
import {CheckCircle2,Eye,EyeOff,KeyRound,Mail,ShieldCheck,UserRound} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

export default function ActivateAccountPage(){
 const[code,setCode]=useState('')
 const[fullName,setFullName]=useState('')
 const[email,setEmail]=useState('')
 const[password,setPassword]=useState('')
 const[show,setShow]=useState(false)
 const[message,setMessage]=useState('')
 const[done,setDone]=useState(false)
 const[loading,setLoading]=useState(false)

 useEffect(()=>{const value=new URLSearchParams(window.location.search).get('invite');if(value)setCode(value)},[])

 async function activate(){
  if(!code||!fullName||!email||password.length<8){setMessage('Completa todos los datos y utiliza una contraseña de al menos 8 caracteres.');return}
  const client=createSupabaseBrowserClient()
  if(!client){setMessage('Supabase aún no está configurado.');return}
  setLoading(true)
  const{error}=await client.auth.signUp({email,password,options:{data:{invite_code:code,full_name:fullName}}})
  setLoading(false)
  if(error){setMessage(error.message);return}
  setDone(true);setMessage('Cuenta activada. Revisa tu correo si el establecimiento requiere confirmación.')
 }

 return <main className="auth-flow-page"><section className="auth-flow-card auth-activation-card">
  <span className="auth-flow-icon"><ShieldCheck/></span><small>INVITACIÓN INSTITUCIONAL</small><h1>Activa tu cuenta</h1><p>Usa el código enviado por el establecimiento. El rol y los permisos se asignarán automáticamente.</p>
  <label>Código de invitación<div className="auth-field-icon"><KeyRound/><input value={code} onChange={event=>setCode(event.target.value.toUpperCase())} placeholder="ABC123..."/></div></label>
  <label>Nombre completo<div className="auth-field-icon"><UserRound/><input value={fullName} onChange={event=>setFullName(event.target.value)} placeholder="Nombre y apellido"/></div></label>
  <label>Correo institucional<div className="auth-field-icon"><Mail/><input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="nombre@colegio.cl"/></div></label>
  <label>Contraseña<div className="auth-flow-password"><input type={show?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} placeholder="Mínimo 8 caracteres"/><button onClick={()=>setShow(value=>!value)}>{show?<EyeOff/>:<Eye/>}</button></div></label>
  {message&&<div className="auth-flow-message"><CheckCircle2/>{message}</div>}
  {done?<a className="auth-flow-primary-link" href="/login">Continuar al acceso</a>:<button onClick={activate} disabled={loading}>{loading?'Activando...':'Activar cuenta'}</button>}
  <div className="auth-flow-security"><ShieldCheck/><span>La invitación valida colegio, rol y, cuando corresponde, estudiante vinculado.</span></div>
 </section></main>
}
