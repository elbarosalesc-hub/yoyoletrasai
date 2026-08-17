'use client'

import Link from 'next/link'
import {useEffect,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {ownerApplications,premiumGeneratorCapabilities} from '@/lib/product/catalog'
import {Bell,Volume2,Sparkles,ShieldCheck,Accessibility,Palette,UserRound,School,Crown,Infinity,Boxes,ArrowRight,WalletCards,Settings2} from 'lucide-react'

type SessionContext={
 displayName?:string
 roleLabel?:string
 plan?:'basic'|'premium'|'owner'
 isOwner?:boolean
 aiUnlimited?:boolean
 permissions?:{premiumResources?:boolean;managePlatform?:boolean;managePlans?:boolean;manageModules?:boolean;manageThemes?:boolean;managePayments?:boolean}
}

export default function Configuracion(){
 const[settings,setSettings]=useState({audio:true,animations:true,reduced:false,contrast:false,notifications:true,aiApproval:true})
 const[session,setSession]=useState<SessionContext|null>(null)
 const toggle=(key:keyof typeof settings)=>setSettings(s=>({...s,[key]:!s[key]}))
 useEffect(()=>{fetch('/api/session/context',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(setSession).catch(()=>setSession(null))},[])
 const owner=session?.isOwner===true
 return <AppShell active="Configuración">
  <section className="premium-hero"><span className="eyebrow">Perfil y configuración integral</span><h1>{owner?'Perfil Propietaria':'Personaliza YOYOLETRASAI'}</h1><p>{owner?'Control total de aplicaciones, IA, módulos, apariencia, planes y operación de la plataforma.':'Controla accesibilidad, multimedia, privacidad, Profesor Virtual y preferencias institucionales.'}</p></section>
  {owner&&<section className="panel" style={{marginBottom:20}}><div className="settings-title"><Crown/><div><h2>Acceso Propietaria · sin límites</h2><p>Tu cuenta conserva acceso completo a la IA y a las funciones premium de YoYoLetrasAI.</p></div></div><div className="metric-grid"><div><strong><Infinity/></strong><span>IA ilimitada</span></div><div><strong>{ownerApplications.length}</strong><span>aplicaciones registradas</span></div><div><strong>Premium</strong><span>recursos y generadores</span></div><div><strong>100%</strong><span>control de plataforma</span></div></div></section>}
  <div className="settings-grid">
   <section className="settings-card"><div className="settings-title"><UserRound/><div><h2>Perfil docente</h2><p>Datos personales y preferencias de trabajo.</p></div></div><label>Nombre<input defaultValue={session?.displayName||'Elba Rosales'}/></label><label>Rol<input value={session?.roleLabel||'Educadora diferencial'} readOnly/></label></section>
   <section className="settings-card"><div className="settings-title"><School/><div><h2>Contexto educativo</h2><p>Currículo, niveles y cursos prioritarios.</p></div></div><label>País<select defaultValue="Chile"><option>Chile</option><option>Argentina</option><option>Perú</option><option>Colombia</option></select></label><label>Nivel principal<select defaultValue="Educación básica"><option>Educación parvularia</option><option>Educación básica</option><option>Educación media</option></select></label></section>
   <section className="settings-card"><div className="settings-title"><Accessibility/><div><h2>Accesibilidad</h2><p>Preferencias visuales, auditivas y de movimiento.</p></div></div>{[['contrast','Alto contraste'],['reduced','Movimiento reducido']].map(([k,l])=><button key={k} className={`setting-toggle ${settings[k as keyof typeof settings]?'on':''}`} onClick={()=>toggle(k as keyof typeof settings)}><span>{l}</span><i/></button>)}</section>
   <section className="settings-card"><div className="settings-title"><Volume2/><div><h2>Audio y animaciones</h2><p>Controla sonidos, narración y movimiento.</p></div></div>{[['audio','Audio y narración'],['animations','Animaciones educativas']].map(([k,l])=><button key={k} className={`setting-toggle ${settings[k as keyof typeof settings]?'on':''}`} onClick={()=>toggle(k as keyof typeof settings)}><span>{l}</span><i/></button>)}</section>
   <section className="settings-card"><div className="settings-title"><Sparkles/><div><h2>YOYO IA</h2><p>IA pedagógica propia, contextual y vinculada a los módulos.</p></div></div><button className={`setting-toggle ${settings.aiApproval?'on':''}`} onClick={()=>toggle('aiApproval')}><span>Solicitar aprobación antes de ejecutar acciones sensibles</span><i/></button><p className="setting-note">{session?.aiUnlimited?'Tu perfil dispone de uso ilimitado.':'El uso depende del plan activo.'}</p><Link href="/crear" className="btn btn-primary">Abrir generador premium <ArrowRight size={16}/></Link></section>
   <section className="settings-card"><div className="settings-title"><Bell/><div><h2>Notificaciones</h2><p>Alertas pedagógicas y administrativas.</p></div></div><button className={`setting-toggle ${settings.notifications?'on':''}`} onClick={()=>toggle('notifications')}><span>Notificaciones prioritarias</span><i/></button></section>
   <section className="settings-card"><div className="settings-title"><Palette/><div><h2>Apariencia</h2><p>Personaliza el entorno visual.</p></div></div><div className="theme-options"><button className="theme-dot purple"/><button className="theme-dot teal"/><button className="theme-dot coral"/><button className="theme-dot gold"/></div></section>
   <section className="settings-card"><div className="settings-title"><ShieldCheck/><div><h2>Privacidad y seguridad</h2><p>Permisos, sesiones y auditoría.</p></div></div><button className="btn btn-soft">Revisar permisos</button><button className="btn btn-soft">Historial de acciones</button></section>
  </div>
  {owner&&<>
   <section className="panel" style={{marginTop:20}}><div className="settings-title"><Boxes/><div><h2>Aplicaciones y módulos de Propietaria</h2><p>Ningún módulo se elimina: este inventario es la base para mejorar cada experiencia de forma progresiva.</p></div></div><div className="game-experience-catalog">{ownerApplications.map(app=><article className="game-experience-card" key={app.href}><small>{app.category}</small><h3>{app.label}</h3><p>{app.description}</p><Link className="game-card-action" href={app.href}>Abrir aplicación <ArrowRight size={16}/></Link></article>)}</div></section>
   <section className="panel" style={{marginTop:20}}><div className="settings-title"><Settings2/><div><h2>Control premium de plataforma</h2><p>Arquitectura prevista para administración de módulos, temas, planes, pagos y generación de recursos.</p></div></div><div className="tool-row"><button className="btn btn-soft"><Boxes size={16}/>Módulos</button><button className="btn btn-soft"><Palette size={16}/>Temas y diseño</button><button className="btn btn-soft"><WalletCards size={16}/>Planes y pagos</button></div><div className="insight" style={{marginTop:14}}><b>Generador Premium</b>{premiumGeneratorCapabilities.map(item=><p key={item}>✓ {item}</p>)}</div></section>
  </>}
 </AppShell>
}
