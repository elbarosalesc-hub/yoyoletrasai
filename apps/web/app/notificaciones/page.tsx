'use client'

import {useMemo,useState} from 'react'
import {Bell,CheckCircle2,Filter,MessageSquare,Search,ShieldAlert,Sparkles} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const demo=[
 {id:'1',type:'urgent',title:'Revisar asistencia',body:'Dos estudiantes presentan asistencia inferior al 80%.',time:'Hace 12 min',read:false},
 {id:'2',type:'success',title:'Actividad completada',body:'El grupo de comprensión guiada finalizó la misión del Bosque Mágico.',time:'Hace 40 min',read:false},
 {id:'3',type:'info',title:'Nuevo recurso disponible',body:'YOYO creó una secuencia de inferencias sencillas lista para revisar.',time:'Hoy, 11:10',read:true},
 {id:'4',type:'warning',title:'Evidencias pendientes',body:'Quedan cuatro registros por completar antes del cierre semanal.',time:'Ayer, 16:45',read:true}
]

export default function NotificationsPage(){
 const[items,setItems]=useState(demo)
 const[query,setQuery]=useState('')
 const[onlyUnread,setOnlyUnread]=useState(false)
 const filtered=useMemo(()=>items.filter(item=>(!onlyUnread||!item.read)&&`${item.title} ${item.body}`.toLowerCase().includes(query.toLowerCase())),[items,query,onlyUnread])
 return <ModuleShell active="Notificaciones">
  <section className="admin-module-head"><div><span className="module-eyebrow"><Bell size={15}/> Centro institucional</span><h1>Notificaciones</h1><p>Alertas pedagógicas, avances de estudiantes y novedades de la plataforma.</p></div><button onClick={()=>setItems(current=>current.map(item=>({...item,read:true})))}><CheckCircle2/>Marcar todo como leído</button></section>
  <section className="admin-toolbar"><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar notificaciones..."/></label><button className={onlyUnread?'active':''} onClick={()=>setOnlyUnread(value=>!value)}><Filter/>Solo no leídas</button></section>
  <section className="notification-center-card">
   {filtered.map(item=><article key={item.id} className={`${item.read?'read':'unread'} type-${item.type}`}><span className="notification-type-icon">{item.type==='urgent'?<ShieldAlert/>:item.type==='success'?<CheckCircle2/>:item.type==='warning'?<MessageSquare/>:<Sparkles/>}</span><div><strong>{item.title}</strong><p>{item.body}</p><small>{item.time}</small></div>{!item.read&&<button onClick={()=>setItems(current=>current.map(entry=>entry.id===item.id?{...entry,read:true}:entry))}>Marcar leída</button>}</article>)}
  </section>
 </ModuleShell>
}
