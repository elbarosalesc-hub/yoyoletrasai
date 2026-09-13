'use client'

import {useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {CheckCircle2,Cloud,KeyRound,RefreshCw,School,ShieldCheck,Unplug,Users,BookOpen,ClipboardList,Clock3} from 'lucide-react'

type Provider='canvas'|'classroom'
type ProviderState={credentialsConfigured:boolean;oauthImplemented:boolean;connected:boolean;state:'credentials_ready'|'credentials_missing';missing:string[];required:string[]}
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
 const credentialsReady=current?.credentialsConfigured===true
 const connected=current?.connected===true
 const oauthImplemented=current?.oauthImplemented===true
 const permissions=useMemo(()=>selected==='canvas'?['Leer cursos y matrículas autorizadas','Crear o actualizar tareas seleccionadas','Leer entregas y resultados cuando la docente lo active']:['Leer cursos y listas autorizadas','Crear materiales y trabajos de clase','Leer entregas y calificaciones cuando la docente lo active'],[selected])

 async function refreshStatus(message=true){
  try{
   const response=await fetch('/api/integrations/status',{cache:'no-store'})
   const data=await response.json() as IntegrationStatus
   if(!response.ok)throw new Error(data.error||'No fue posible comprobar las integraciones.')
   setServerStatus(data)
   const selectedState=data.providers?.[selected]
   if(message){
    if(selectedState?.connected)setStatus(`${provider.name}: conexión institucional activa.`)
    else if(selectedState?.credentialsConfigured)setStatus(`${provider.name}: credenciales detectadas, pero el consentimiento OAuth todavía no está implementado en YOYO.`)
    else setStatus(`${provider.name}: faltan ${selectedState?.missing?.join(', ')||'credenciales OAuth'}.`)
   }
  }catch(error){setStatus(error instanceof Error?error.message:'No fue posible comprobar las integraciones.')}
 }

 useEffect(()=>{void refreshStatus(false)},[])
 useEffect(()=>{
  if(!serverStatus)return
  const selectedState=serverStatus.providers?.[selected]
  if(selectedState?.connected)setStatus(`${provider.name}: conexión institucional activa.`)
  else if(selectedState?.credentialsConfigured)setStatus(`${provider.name}: secretos del servidor listos. Falta implementar y completar OAuth institucional.`)
  else setStatus(`${provider.name}: integración desactivada hasta completar ${selectedState?.missing?.join(', ')||'las credenciales OAuth'}.`)
 },[selected,serverStatus,provider.name])

 const requestConnection=()=>{
  if(!credentialsReady){setStatus(`No se puede preparar OAuth todavía. Configura primero ${current?.missing?.join(', ')||'las credenciales requeridas'} como secretos de Cloudflare Workers.`);return}
  if(!oauthImplemented){setStatus(`${provider.name}: las credenciales del servidor están listas, pero el flujo OAuth aún no está implementado. Esta pantalla no simulará una conexión inexistente.`);return}
  setStatus(`${provider.name}: listo para iniciar consentimiento OAuth institucional.`)
 }

 return <AppShell active="Integraciones">
  <section className="premium-hero integrations-hero"><span className="eyebrow">Ecosistema institucional</span><h1>Canvas LMS y Google Classroom</h1><p>Estado real de preparación para sincronizar cursos, estudiantes y actividades mediante OAuth seguro. YOYOLETRASAI nunca solicita contraseñas del profesorado ni guarda secretos en el navegador.</p></section>
  <div className="integration-layout">
   <aside className="integration-providers premium-card"><h2>Plataformas</h2>{(Object.keys(providers) as Provider[]).map(key=>{const state=serverStatus?.providers?.[key];return <button key={key} className={selected===key?'active':''} onClick={()=>setSelected(key)}><span className={`provider-logo ${key}`}>{key==='canvas'?'C':'G'}</span><div><b>{providers[key].name}</b><small>{state?.connected?'Conectado':state?.credentialsConfigured?'Credenciales listas':'Sin configurar'}</small></div></button>})}<div className="integration-security"><ShieldCheck size={22}/><div><b>OAuth 2.0</b><p>Acceso revocable, permisos mínimos y secretos sólo en Cloudflare Workers. La conexión sólo se marcará activa después de OAuth real.</p></div></div></aside>
   <section className="integration-main premium-card"><div className="integration-title"><div className={`provider-logo large ${selected}`}>{selected==='canvas'?'C':'G'}</div><div><span>Integración institucional</span><h2>{provider.name}</h2><p>{provider.description}</p></div><span className="connection-state">{connected?<><CheckCircle2 size={16}/>Conectado</>:credentialsReady?<><Clock3 size={16}/>Preparación parcial</>:<><Unplug size={16}/>Sin configurar</>}</span></div>
    <div className="sync-grid"><article><Users/><b>Cursos y grupos</b><p>Importación disponible cuando exista conexión OAuth real.</p></article><article><ClipboardList/><b>Actividades y tareas</b><p>Publicación disponible sólo tras autorización institucional y revisión docente.</p></article><article><BookOpen/><b>Resultados</b><p>Lectura de entregas y calificaciones permanece inactiva hasta completar OAuth.</p></article><article><RefreshCw/><b>Sincronización</b><p>No se ejecuta ninguna sincronización mientras el proveedor no esté conectado realmente.</p></article></div>
    <div className="oauth-requirements"><div><KeyRound size={22}/><div><h3>Configuración requerida en Cloudflare Workers</h3><p>Estas variables deben guardarse como secretos de producción; esta pantalla sólo comprueba su presencia y nunca expone sus valores.</p></div></div>{provider.required.map(x=><code key={x}>{current?.missing?.includes(x)?'FALTA · ':credentialsReady?'LISTO · ':''}{x}</code>)}</div>
    <div className="permission-list"><h3>Permisos previstos para OAuth</h3>{permissions.map(x=><div key={x}><CheckCircle2 size={17}/><span>{x}</span></div>)}</div>
    <div className="integration-actions"><button className="btn btn-primary" onClick={requestConnection}><Cloud size={18}/>{connected?'Gestionar conexión':credentialsReady?'OAuth pendiente de implementación':'Revisar configuración OAuth'}</button><button className="btn btn-soft" onClick={()=>void refreshStatus(true)}><RefreshCw size={17}/>Comprobar servidor</button></div><p className="save-status" role="status" aria-live="polite">{status}</p>
   </section>
   <aside className="integration-audit premium-card"><School size={30}/><h2>Flujo objetivo de publicación</h2>{['Configurar secretos','Implementar OAuth','Autorizar institución','Seleccionar curso','Revisar y publicar'].map((x,i)=><div className="audit-step" key={x}><span>{i+1}</span><div><b>{x}</b><small>{i<2?'Preparación técnica':i===2?'Consentimiento real':'Acción docente'}</small></div></div>)}<div className="insight"><b>Estado actual</b><p>{oauthImplemented?'OAuth implementado; falta autorización por institución cuando corresponda.':'OAuth todavía no está implementado. YOYO no mostrará cursos, sincronización ni publicación como disponibles hasta que exista una conexión real.'}</p></div></aside>
  </div>
 </AppShell>
}
