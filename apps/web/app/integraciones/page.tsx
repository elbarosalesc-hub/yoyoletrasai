'use client'

import {useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {CheckCircle2,Cloud,KeyRound,RefreshCw,School,ShieldCheck,Unplug,Users,BookOpen,ClipboardList} from 'lucide-react'

type Provider='canvas'|'classroom'
type ProviderState={configured:boolean;missing:string[];required:string[]}
type IntegrationStatus={runtime?:string;providers?:Partial<Record<Provider,ProviderState>>;error?:string}

const providers={
 canvas:{name:'Canvas LMS',description:'Cursos, matrículas, tareas, calificaciones y enlaces a recursos.',required:['CANVAS_BASE_URL','CANVAS_CLIENT_ID','CANVAS_CLIENT_SECRET','CANVAS_REDIRECT_URI']},
 classroom:{name:'Google Classroom',description:'Cursos, estudiantes, trabajos de clase, materiales y entregas.',required:['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REDIRECT_URI']}
}

export default function Integraciones(){
 const[selected,setSelected]=useState<Provider>('canvas')
 const[serverStatus,setServerStatus]=useState<IntegrationStatus|null>(null)
 const[status,setStatus]=useState('Comprobando configuración segura del servidor...')
 const provider=providers[selected]
 const current=serverStatus?.providers?.[selected]
 const configured=current?.configured===true
 const permissions=useMemo(()=>selected==='canvas'?['Leer cursos y matrículas autorizadas','Crear o actualizar tareas seleccionadas','Leer entregas y resultados cuando la docente lo active']:['Leer cursos y listas autorizadas','Crear materiales y trabajos de clase','Leer entregas y calificaciones cuando la docente lo active'],[selected])

 async function refreshStatus(message=true){
  try{
   const response=await fetch('/api/integrations/status',{cache:'no-store'})
   const data=await response.json() as IntegrationStatus
   if(!response.ok)throw new Error(data.error||'No fue posible comprobar las integraciones.')
   setServerStatus(data)
   const selectedState=data.providers?.[selected]
   if(message)setStatus(selectedState?.configured?`${provider.name}: credenciales de servidor detectadas en Cloudflare Workers.`:`${provider.name}: faltan ${selectedState?.missing?.join(', ')||'credenciales OAuth'}.`)
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible comprobar las integraciones.')}
 }

 useEffect(()=>{void refreshStatus(false)},[])
 useEffect(()=>{
  if(!serverStatus)return
  const selectedState=serverStatus.providers?.[selected]
  setStatus(selectedState?.configured?`${provider.name}: configuración de servidor lista para activar OAuth.`:`${provider.name}: integración desactivada hasta completar ${selectedState?.missing?.join(', ')||'las credenciales OAuth'}.`)
 },[selected,serverStatus,provider.name])

 const requestConnection=()=>{
  if(!configured){setStatus(`No se puede iniciar OAuth todavía. Configura primero ${current?.missing?.join(', ')||'las credenciales requeridas'} como secretos de Cloudflare Workers.`);return}
  setStatus(`${provider.name} tiene sus credenciales detectadas. El siguiente paso es completar el consentimiento OAuth institucional; YOYO no enviará credenciales ni publicará actividades sin autorización docente.`)
 }

 return <AppShell active="Integraciones">
  <section className="premium-hero integrations-hero"><span className="eyebrow">Ecosistema institucional</span><h1>Canvas LMS y Google Classroom</h1><p>Sincroniza cursos, estudiantes y actividades mediante OAuth seguro. YOYOLETRASAI nunca solicita contraseñas del profesorado ni guarda secretos en el navegador.</p></section>
  <div className="integration-layout">
   <aside className="integration-providers premium-card"><h2>Plataformas</h2>{(Object.keys(providers) as Provider[]).map(key=>{const state=serverStatus?.providers?.[key];return <button key={key} className={selected===key?'active':''} onClick={()=>setSelected(key)}><span className={`provider-logo ${key}`}>{key==='canvas'?'C':'G'}</span><div><b>{providers[key].name}</b><small>{state?.configured?'Servidor configurado':'Sin conectar'}</small></div></button>})}<div className="integration-security"><ShieldCheck size={22}/><div><b>OAuth 2.0</b><p>Acceso revocable, permisos mínimos y secretos solo en Cloudflare Workers.</p></div></div></aside>
   <section className="integration-main premium-card"><div className="integration-title"><div className={`provider-logo large ${selected}`}>{selected==='canvas'?'C':'G'}</div><div><span>Integración institucional</span><h2>{provider.name}</h2><p>{provider.description}</p></div><span className="connection-state">{configured?<><ShieldCheck size={16}/>Servidor listo</>:<><Unplug size={16}/>Sin conectar</>}</span></div>
    <div className="sync-grid"><article><Users/><b>Cursos y grupos</b><p>Importación de cursos activos, docentes y estudiantes autorizados.</p></article><article><ClipboardList/><b>Actividades y tareas</b><p>Publicación de enlaces, instrucciones, fechas y puntajes máximos.</p></article><article><BookOpen/><b>Resultados</b><p>Sincronización opcional de estado, entregas y calificaciones aprobadas.</p></article><article><RefreshCw/><b>Sincronización</b><p>Manual o programada, con registro de cambios y errores.</p></article></div>
    <div className="oauth-requirements"><div><KeyRound size={22}/><div><h3>Configuración requerida en Cloudflare Workers</h3><p>Estas variables deben guardarse como secretos de producción; esta pantalla sólo comprueba su presencia y nunca expone sus valores.</p></div></div>{provider.required.map(x=><code key={x}>{current?.missing?.includes(x)?'FALTA · ':configured?'LISTO · ':''}{x}</code>)}</div>
    <div className="permission-list"><h3>Permisos propuestos</h3>{permissions.map(x=><div key={x}><CheckCircle2 size={17}/><span>{x}</span></div>)}</div>
    <div className="integration-actions"><button className="btn btn-primary" onClick={requestConnection}><Cloud size={18}/>{configured?'Preparar consentimiento OAuth':'Revisar configuración OAuth'}</button><button className="btn btn-soft" onClick={()=>void refreshStatus(true)}><RefreshCw size={17}/>Comprobar servidor</button></div><p className="save-status" role="status" aria-live="polite">{status}</p>
   </section>
   <aside className="integration-audit premium-card"><School size={30}/><h2>Flujo de publicación</h2>{['Seleccionar curso','Elegir recurso o evaluación','Revisar instrucciones y fecha','Autorizar publicación','Registrar enlace y resultado'].map((x,i)=><div className="audit-step" key={x}><span>{i+1}</span><div><b>{x}</b><small>{i<3?'Revisión docente':'Acción autorizada'}</small></div></div>)}<div className="insight"><b>Control docente</b><p>Ninguna actividad se publica ni ninguna calificación se devuelve sin una acción explícita de la docente.</p></div></aside>
  </div>
 </AppShell>
}
