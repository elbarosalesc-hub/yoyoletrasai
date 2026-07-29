'use client'

import {useState} from 'react'
import {ArrowRight,BookOpen,Eye,EyeOff,GraduationCap,LockKeyhole,ShieldCheck,Sparkles,UserRound} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

const roleRoutes:Record<string,string>={admin:'/app',teacher:'/app',student:'/estudiante',guardian:'/familia'}

export default function LoginPage(){
 const[email,setEmail]=useState('')
 const[password,setPassword]=useState('')
 const[show,setShow]=useState(false)
 const[loading,setLoading]=useState(false)
 const[message,setMessage]=useState('')

 async function signIn(){
  setMessage('')
  const client=createSupabaseBrowserClient()
  if(!client){setMessage('Supabase aún no está configurado. Usa la vista demostrativa mientras se conectan las credenciales.');return}
  setLoading(true)
  const{data,error}=await client.auth.signInWithPassword({email,password})
  if(error||!data.user){setMessage(error?.message||'No fue posible iniciar sesión.');setLoading(false);return}
  const{data:profile}=await client.from('profiles').select('role').eq('id',data.user.id).single()
  window.location.assign(roleRoutes[profile?.role||'teacher']||'/app')
 }

 return <main className="auth-page-v2">
  <section className="auth-brand-panel-v2">
   <div className="auth-logo-v2"><span>Y</span><strong>YOYOLETRASAI</strong></div>
   <div className="auth-brand-copy-v2"><span><Sparkles/> Plataforma educativa inteligente</span><h1>Aprender, enseñar y acompañar en un solo lugar.</h1><p>Experiencias inclusivas, juegos 3D, profesor virtual y seguimiento pedagógico protegido por institución.</p></div>
   <div className="auth-feature-grid-v2"><article><GraduationCap/><strong>Docentes</strong><small>Planificación, creación y analítica.</small></article><article><BookOpen/><strong>Estudiantes</strong><small>Misiones, contenidos y progreso.</small></article><article><UserRound/><strong>Familias</strong><small>Avances, asistencia y comunicación.</small></article><article><ShieldCheck/><strong>Seguro</strong><small>Roles, RLS y datos por colegio.</small></article></div>
  </section>
  <section className="auth-form-panel-v2">
   <div className="auth-card-v2">
    <span className="auth-eyebrow-v2">ACCESO INSTITUCIONAL</span><h2>Bienvenido nuevamente</h2><p>Ingresa con la cuenta creada mediante invitación de tu establecimiento.</p>
    <label>Correo institucional<input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="nombre@colegio.cl"/></label>
    <label>Contraseña<div className="password-field-v2"><input type={show?'text':'password'} value={password} onChange={event=>setPassword(event.target.value)} onKeyDown={event=>event.key==='Enter'&&signIn()} placeholder="••••••••"/><button onClick={()=>setShow(value=>!value)} aria-label={show?'Ocultar contraseña':'Mostrar contraseña'}>{show?<EyeOff/>:<Eye/>}</button></div></label>
    <div className="auth-options-v2"><label><input type="checkbox"/>Recordarme</label><button>Recuperar contraseña</button></div>
    {message&&<div className="auth-message-v2"><LockKeyhole/>{message}</div>}
    <button className="auth-submit-v2" onClick={signIn} disabled={loading||!email||!password}>{loading?'Ingresando...':<>Ingresar a la plataforma<ArrowRight/></>}</button>
    <div className="auth-demo-v2"><strong>Vista demostrativa</strong><span>Mientras Supabase no esté conectado, puedes continuar revisando el panel docente.</span><a href="/app">Abrir demostración</a></div>
   </div>
  </section>
 </main>
}
