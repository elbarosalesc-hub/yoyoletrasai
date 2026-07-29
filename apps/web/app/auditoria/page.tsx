import {Download,FileClock,Filter,Search,ShieldCheck} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const events=[
 {actor:'Elba Rosales',action:'Creó una invitación',entity:'Usuario docente',date:'29 jul · 15:28',ip:'Sesión web'},
 {actor:'María Guzmán',action:'Actualizó una evaluación',entity:'Comprensión lectora',date:'29 jul · 14:52',ip:'Sesión web'},
 {actor:'Sistema',action:'Registró progreso 3D',entity:'Bosque de las inferencias',date:'29 jul · 13:40',ip:'Automático'},
 {actor:'Elba Rosales',action:'Cambió permisos',entity:'Rol apoderado',date:'28 jul · 17:05',ip:'Sesión web'}
]

export default function AuditPage(){
 return <ModuleShell active="Auditoría">
  <section className="admin-module-head"><div><span className="module-eyebrow"><FileClock size={15}/> Seguridad institucional</span><h1>Registro de auditoría</h1><p>Historial de accesos, cambios y acciones relevantes dentro de la plataforma.</p></div><button><Download/>Exportar registro</button></section>
  <section className="admin-toolbar"><label><Search/><input placeholder="Buscar acción, usuario o módulo..."/></label><button><Filter/>Filtrar periodo</button></section>
  <section className="audit-table-card"><header><span>ACTIVIDAD RECIENTE</span><strong>Últimos movimientos institucionales</strong></header>{events.map((event,index)=><article key={`${event.actor}-${index}`}><span className="audit-icon"><ShieldCheck/></span><div><strong>{event.action}</strong><small>{event.actor} · {event.entity}</small></div><em>{event.date}</em><code>{event.ip}</code></article>)}</section>
 </ModuleShell>
}
