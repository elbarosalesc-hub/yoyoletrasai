'use client'

import {useEffect,useMemo,useState} from 'react'
import {CheckCircle2,Clock3,Copy,Mail,Plus,RefreshCw,Search,ShieldCheck,Trash2,UserRoundCheck,Users} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

type Role='admin'|'teacher'|'student'|'guardian'
type Invite={id:string;full_name:string;email:string|null;role:Role;code:string;expires_at:string;used_at:string|null}
type Profile={id:string;full_name:string;role:Role;created_at:string}

const demoProfiles:Profile[]=[
 {id:'1',full_name:'Elba Rosales',role:'admin',created_at:'2026-03-01'},
 {id:'2',full_name:'María Guzmán',role:'teacher',created_at:'2026-04-12'},
 {id:'3',full_name:'Sofía Martínez',role:'student',created_at:'2026-05-08'},
 {id:'4',full_name:'Ana Martínez',role:'guardian',created_at:'2026-05-08'}
]

export default function UsersAndRolesPage(){
 const[profiles,setProfiles]=useState<Profile[]>(demoProfiles)
 const[invites,setInvites]=useState<Invite[]>([])
 const[query,setQuery]=useState('')
 const[showCreate,setShowCreate]=useState(false)
 const[fullName,setFullName]=useState('')
 const[email,setEmail]=useState('')
 const[role,setRole]=useState<Role>('teacher')
 const[message,setMessage]=useState('Modo demostración: conecta Supabase para administrar cuentas reales.')
 const[loading,setLoading]=useState(false)

 useEffect(()=>{void loadData()},[])

 async function loadData(){
  const client=createSupabaseBrowserClient()
  if(!client)return
  setLoading(true)
  const[{data:profileRows},{data:inviteRows}]=await Promise.all([
   client.from('profiles').select('id,full_name,role,created_at').order('created_at',{ascending:false}),
   client.from('organization_invites').select('id,full_name,email,role,code,expires_at,used_at').order('created_at',{ascending:false})
  ])
  if(profileRows)setProfiles(profileRows as Profile[])
  if(inviteRows)setInvites(inviteRows as Invite[])
  setMessage('Supabase conectado. Los cambios quedan protegidos por rol administrador.')
  setLoading(false)
 }

 async function createInvite(){
  if(!fullName.trim())return
  const code=crypto.randomUUID().replaceAll('-','').slice(0,12).toUpperCase()
  const client=createSupabaseBrowserClient()
  if(!client){
   setInvites(current=>[{id:crypto.randomUUID(),full_name:fullName,email:email||null,role,code,expires_at:new Date(Date.now()+14*86400000).toISOString(),used_at:null},...current])
   setMessage('Invitación demostrativa creada. Se guardará en Supabase cuando esté conectado.')
  }else{
   const{data:profile}=await client.auth.getUser()
   const{data:adminProfile}=await client.from('profiles').select('organization_id').eq('id',profile.user?.id).single()
   const{error}=await client.from('organization_invites').insert({organization_id:adminProfile?.organization_id,full_name:fullName,email:email||null,role,code,created_by:profile.user?.id}).select().single()
   if(error){setMessage(error.message);return}
   setMessage('Invitación creada correctamente.')
   await loadData()
  }
  setFullName('');setEmail('');setRole('teacher');setShowCreate(false)
 }

 async function removeInvite(id:string){
  const client=createSupabaseBrowserClient()
  if(client)await client.from('organization_invites').delete().eq('id',id)
  setInvites(current=>current.filter(item=>item.id!==id))
 }

 const filtered=useMemo(()=>profiles.filter(item=>`${item.full_name} ${item.role}`.toLowerCase().includes(query.toLowerCase())),[profiles,query])
 const roleLabel:Record<Role,string>={admin:'Administrador',teacher:'Docente',student:'Estudiante',guardian:'Apoderado'}

 return <ModuleShell active="Usuarios y roles">
  <section className="users-admin-head">
   <div><span className="module-eyebrow"><ShieldCheck size={15}/> Administración institucional</span><h1>Usuarios, roles e invitaciones</h1><p>Controla quién puede acceder y qué información puede ver dentro de la plataforma.</p></div>
   <button className="users-primary" onClick={()=>setShowCreate(value=>!value)}><Plus/>Nueva invitación</button>
  </section>

  <section className="users-admin-stats">
   <article><Users/><div><strong>{profiles.length}</strong><span>cuentas activas</span></div></article>
   <article><Mail/><div><strong>{invites.filter(item=>!item.used_at).length}</strong><span>invitaciones pendientes</span></div></article>
   <article><UserRoundCheck/><div><strong>{profiles.filter(item=>item.role==='guardian').length}</strong><span>apoderados vinculados</span></div></article>
   <article><ShieldCheck/><div><strong>4</strong><span>roles protegidos</span></div></article>
  </section>

  {showCreate&&<section className="invite-builder-card">
   <div><span>CREAR INVITACIÓN</span><h2>Nuevo acceso institucional</h2></div>
   <label>Nombre completo<input value={fullName} onChange={event=>setFullName(event.target.value)} placeholder="Nombre del usuario"/></label>
   <label>Correo electrónico<input type="email" value={email} onChange={event=>setEmail(event.target.value)} placeholder="usuario@colegio.cl"/></label>
   <label>Rol<select value={role} onChange={event=>setRole(event.target.value as Role)}><option value="teacher">Docente</option><option value="student">Estudiante</option><option value="guardian">Apoderado</option><option value="admin">Administrador</option></select></label>
   <button onClick={createInvite}><Plus/>Crear invitación por 14 días</button>
  </section>}

  <div className="users-admin-layout">
   <section className="users-table-card">
    <header><div><span>CUENTAS</span><h2>Miembros de la institución</h2></div><label><Search/><input value={query} onChange={event=>setQuery(event.target.value)} placeholder="Buscar usuario..."/></label></header>
    <div className="users-table">
     {filtered.map(profile=><article key={profile.id}><span className={`role-avatar role-${profile.role}`}>{profile.full_name.split(' ').map(part=>part[0]).slice(0,2).join('')}</span><div><strong>{profile.full_name}</strong><small>Creado el {new Date(profile.created_at).toLocaleDateString('es-CL')}</small></div><span className={`role-pill role-${profile.role}`}>{roleLabel[profile.role]}</span><em><CheckCircle2/>Activo</em></article>)}
    </div>
   </section>

   <aside className="invites-card">
    <header><div><span>INVITACIONES</span><h2>Accesos pendientes</h2></div><button onClick={()=>void loadData()} aria-label="Actualizar"><RefreshCw className={loading?'spin':''}/></button></header>
    <div className="invite-list">
     {invites.length===0&&<div className="invite-empty"><Mail/><strong>No hay invitaciones pendientes</strong><p>Crea una invitación para docentes, estudiantes o familias.</p></div>}
     {invites.map(invite=><article key={invite.id}><div><strong>{invite.full_name}</strong><small>{roleLabel[invite.role]} · {invite.email||'Sin correo definido'}</small></div><code>{invite.code}</code><div className="invite-actions"><button onClick={()=>navigator.clipboard.writeText(`${window.location.origin}/login?invite=${invite.code}`)}><Copy/>Copiar enlace</button><button onClick={()=>void removeInvite(invite.id)} aria-label="Eliminar invitación"><Trash2/></button></div><span><Clock3/>Vence {new Date(invite.expires_at).toLocaleDateString('es-CL')}</span></article>)}
    </div>
   </aside>
  </div>

  <div className="users-admin-message"><ShieldCheck/>{message}</div>
 </ModuleShell>
}
