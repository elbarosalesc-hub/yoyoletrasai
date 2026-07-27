'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {CheckCircle2,Cloud,ExternalLink,KeyRound,RefreshCw,School,ShieldCheck,Unplug,Users,BookOpen,ClipboardList} from 'lucide-react'

type Provider='canvas'|'classroom'

const providers={
 canvas:{name:'Canvas LMS',description:'Cursos, matrículas, tareas, calificaciones y enlaces a recursos.',required:['CANVAS_BASE_URL','CANVAS_CLIENT_ID','CANVAS_CLIENT_SECRET','CANVAS_REDIRECT_URI']},
 classroom:{name:'Google Classroom',description:'Cursos, estudiantes, trabajos de clase, materiales y entregas.',required:['GOOGLE_CLIENT_ID','GOOGLE_CLIENT_SECRET','GOOGLE_REDIRECT_URI']}
}

export default function Integraciones(){
 const[selected,setSelected]=useState<Provider>('canvas')
 const[requested,setRequested]=useState<Record<Provider,boolean>>({canvas:false,classroom:false})
 const[status,setStatus]=useState('Las conexiones permanecen desactivadas hasta configurar OAuth en el servidor.')
 const provider=providers[selected]
 const permissions=useMemo(()=>selected==='canvas'?['Leer cursos y matrículas autorizadas','Crear o actualizar tareas seleccionadas','Leer entregas y resultados cuando la docente lo active']:['Leer cursos y listas autorizadas','Crear materiales y trabajos de clase','Leer entregas y calificaciones cuando la docente lo active'],[selected])
 const requestConnection=()=>{setRequested(v=>({...v,[selected]:true}));setStatus(`Solicitud de conexión para ${provider.name} preparada. Deben cargarse las credenciales en Vercel antes de autorizar.`)}
 return <AppShell active="Integraciones">
  <section className="premium-hero integrations-hero"><span className="eyebrow">Ecosistema institucional</span><h1>Canvas LMS y Google Classroom</h1><p>Sincroniza cursos, estudiantes y actividades mediante OAuth seguro. YOYOLETRASAI nunca solicita contraseñas del profesorado ni guarda secretos en el navegador.</p></section>
  <div className="integration-layout">
   <aside className="integration-providers premium-card"><h2>Plataformas</h2>{(Object.keys(providers) as Provider[]).map(key=><button key={key} className={selected===key?'active':''} onClick={()=>setSelected(key)}><span className={`provider-logo ${key}`}>{key==='canvas'?'C':'G'}</span><div><b>{providers[key].name}</b><small>{requested[key]?'Configuración solicitada':'Sin conectar'}</small></div></button>)}<div className="integration-security"><ShieldCheck size={22}/><div><b>OAuth 2.0</b><p>Acceso revocable, permisos mínimos y secretos solo en servidor.</p></div></div></aside>
   <section className="integration-main premium-card"><div className="integration-title"><div className={`provider-logo large ${selected}`}>{selected==='canvas'?'C':'G'}</div><div><span>Integración institucional</span><h2>{provider.name}</h2><p>{provider.description}</p></div><span className="connection-state"><Unplug size={16}/>Sin conectar</span></div>
    <div className="sync-grid"><article><Users/><b>Cursos y grupos</b><p>Importación de cursos activos, docentes y estudiantes autorizados.</p></article><article><ClipboardList/><b>Actividades y tareas</b><p>Publicación de enlaces, instrucciones, fechas y puntajes máximos.</p></article><article><BookOpen/><b>Resultados</b><p>Sincronización opcional de estado, entregas y calificaciones aprobadas.</p></article><article><RefreshCw/><b>Sincronización</b><p>Manual o programada, con registro de cambios y errores.</p></article></div>
    <div className="oauth-requirements"><div><KeyRound size={22}/><div><h3>Configuración requerida en Vercel</h3><p>Estas variables deben guardarse como secretos del proyecto, nunca dentro del código.</p></div></div>{provider.required.map(x=><code key={x}>{x}</code>)}</div>
    <div className="permission-list"><h3>Permisos propuestos</h3>{permissions.map(x=><div key={x}><CheckCircle2 size={17}/><span>{x}</span></div>)}</div>
    <div className="integration-actions"><button className="btn btn-primary" onClick={requestConnection}><Cloud size={18}/>Preparar conexión OAuth</button><button className="btn btn-soft" onClick={()=>setStatus('Prueba no disponible: primero deben cargarse las credenciales del servidor.')}><ExternalLink size={17}/>Probar configuración</button></div><p className="save-status" role="status" aria-live="polite">{status}</p>
   </section>
   <aside className="integration-audit premium-card"><School size={30}/><h2>Flujo de publicación</h2>{['Seleccionar curso','Elegir recurso o evaluación','Revisar instrucciones y fecha','Autorizar publicación','Registrar enlace y resultado'].map((x,i)=><div className="audit-step" key={x}><span>{i+1}</span><div><b>{x}</b><small>{i<3?'Revisión docente':'Acción autorizada'}</small></div></div>)}<div className="insight"><b>Control docente</b><p>Ninguna actividad se publica ni ninguna calificación se devuelve sin una acción explícita de la docente.</p></div></aside>
  </div>
 </AppShell>
}
