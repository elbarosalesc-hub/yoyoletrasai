'use client'

import {useState} from 'react'
import {Check,KeyRound,Save,ShieldCheck,Users} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const permissionLabels=[
 ['view_dashboard','Ver panel principal'],
 ['create_resources','Crear recursos'],
 ['manage_students','Gestionar estudiantes'],
 ['view_reports','Ver informes'],
 ['manage_users','Gestionar usuarios'],
 ['play_games','Acceder a juegos 3D'],
 ['view_family_portal','Ver portal familiar'],
 ['use_virtual_teacher','Usar profesor virtual']
] as const

const roles=['admin','teacher','student','guardian'] as const
const roleNames={admin:'Administrador',teacher:'Docente',student:'Estudiante',guardian:'Apoderado'}

export default function PermissionsPage(){
 const[enabled,setEnabled]=useState<Record<string,boolean>>(()=>{
  const entries=roles.flatMap(role=>permissionLabels.map(([key])=>{
   const allowed=role==='admin'
    || role==='teacher'
    || (role==='student'&&['view_dashboard','play_games','use_virtual_teacher'].includes(key))
    || (role==='guardian'&&key==='view_family_portal')
   return [`${role}:${key}`,allowed] as const
  }))
  return Object.fromEntries(entries)
 })
 const[message,setMessage]=useState('Modo demostración: los permisos se guardarán en Supabase al conectarlo.')

 return <ModuleShell active="Permisos">
  <section className="admin-module-head"><div><span className="module-eyebrow"><KeyRound size={15}/> Control de acceso</span><h1>Permisos por rol</h1><p>Define qué herramientas puede utilizar cada tipo de usuario dentro de la institución.</p></div><button onClick={()=>setMessage('Configuración guardada correctamente.')}><Save/>Guardar cambios</button></section>
  <section className="permission-matrix-card"><header><div><span>PERMISOS</span><strong>Matriz institucional</strong></div>{roles.map(role=><span key={role}><Users/>{roleNames[role]}</span>)}</header>{permissionLabels.map(([key,label])=><article key={key}><div><ShieldCheck/><span><strong>{label}</strong><small>{key}</small></span></div>{roles.map(role=>{const id=`${role}:${key}`;return <button key={role} className={enabled[id]?'enabled':''} onClick={()=>setEnabled(current=>({...current,[id]:!current[id]}))} aria-label={`${enabled[id]?'Desactivar':'Activar'} ${label} para ${roleNames[role]}`}>{enabled[id]&&<Check/>}</button>})}</article>)}</section>
  <div className="users-admin-message"><ShieldCheck/>{message}</div>
 </ModuleShell>
}
