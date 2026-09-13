'use client'

import {useEffect,useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {BadgeCheck,BrainCircuit,CheckCircle2,CreditCard,FileCheck2,Infinity,LockKeyhole,RefreshCw,ShieldCheck,Sparkles,WalletCards} from 'lucide-react'

type SessionContext={displayName?:string;roleLabel?:string;plan?:'basic'|'premium'|'owner';isOwner?:boolean;aiUnlimited?:boolean;permissions?:{premiumResources?:boolean;managePlatform?:boolean;managePlans?:boolean;manageModules?:boolean;manageThemes?:boolean;managePayments?:boolean}}
type AiPlan={id?:string;name?:string;description?:string;max_files_per_request?:number;max_file_bytes?:number;max_total_file_bytes?:number;max_output_tokens?:number;unlimited_file_analysis?:boolean;model_tier?:string;monthly_ai_requests?:number;monthly_research_requests?:number;monthly_token_limit?:number}
type Entitlement={plan?:AiPlan;error?:string}
type BillingStatus={configured:boolean;provider:string|null;checkoutAvailable:boolean;checkoutUrl:string|null;recurringBillingVerified:boolean;webhookVerified:boolean;status:string;error?:string}

const productLabels={basic:'Básico',premium:'Premium',owner:'Propietaria'} as const
const planSummary={
 basic:['Juegos 3D','Creación esencial','Exportación impresión/TXT','Acceso docente estándar'],
 premium:['Biblioteca Premium','Adaptaciones avanzadas','Analítica pedagógica','Exportaciones ampliadas','Juegos 3D'],
 owner:['Acceso completo','YOYO IA ampliada','Administración de módulos','Gestión de planes y plataforma','Juegos 3D y analítica completa'],
} as const

function formatBytes(value?:number){if(!value||value<=0)return '—';const mb=value/1024/1024;return mb>=1024?`${(mb/1024).toFixed(1)} GB`:`${Math.round(mb)} MB`}

export default function Planes(){
 const[session,setSession]=useState<SessionContext|null>(null)
 const[entitlement,setEntitlement]=useState<Entitlement|null>(null)
 const[billing,setBilling]=useState<BillingStatus|null>(null)
 const[status,setStatus]=useState('Comprobando plan y facturación...')
 const[loading,setLoading]=useState(true)

 async function load(){
  setLoading(true);setStatus('Comprobando plan y facturación...')
  try{
   const [sessionResponse,entitlementResponse,billingResponse]=await Promise.all([
    fetch('/api/session/context',{cache:'no-store'}),
    fetch('/api/ai/entitlement',{cache:'no-store'}),
    fetch('/api/billing/status',{cache:'no-store'}),
   ])
   const sessionData=await sessionResponse.json() as SessionContext&{error?:string}
   const entitlementData=await entitlementResponse.json() as Entitlement
   const billingData=await billingResponse.json() as BillingStatus
   if(sessionResponse.ok)setSession(sessionData)
   if(entitlementResponse.ok)setEntitlement(entitlementData);else setEntitlement({error:entitlementData.error||'Sin entitlement YOYO IA verificado.'})
   if(billingResponse.ok)setBilling(billingData)
   setStatus('Estado actualizado desde sesión, entitlement YOYO IA y configuración de facturación.')
  }catch{setStatus('No fue posible comprobar todos los servicios del plan.')}
  finally{setLoading(false)}
 }

 useEffect(()=>{void load()},[])
 const activePlan=session?.plan||'basic'
 const capabilities=useMemo(()=>planSummary[activePlan],[activePlan])
 const aiPlan=entitlement?.plan
 const canManageBilling=session?.permissions?.managePayments===true

 function openCheckout(){
  if(!billing?.configured||!billing.checkoutUrl){setStatus('No existe una pasarela de pago conectada y verificada. YOYO no abrirá un checkout simulado.');return}
  setStatus('Abriendo el portal configurado. La pasarela aún requiere verificación de cobro recurrente y webhook antes de considerarse plenamente operativa.')
  window.location.assign(billing.checkoutUrl)
 }

 return <AppShell active="Planes">
  <section className="premium-hero"><span className="eyebrow">Planes · suscripción · políticas</span><h1>Centro de Planes YOYO</h1><p>Consulta el acceso real de tu cuenta, límites de YOYO IA y estado de facturación. Este módulo no inventa precios, cobros ni renovaciones: sólo muestra capacidades verificables.</p><div className="tool-row" style={{marginTop:14}}><button className="btn btn-soft" onClick={()=>void load()} disabled={loading}><RefreshCw size={16}/>{loading?'Comprobando...':'Actualizar estado'}</button></div></section>

  <section className="metric-grid" style={{marginBottom:20}}>
   <div><strong>{productLabels[activePlan]}</strong><span>plan de producto</span></div>
   <div><strong>{session?.aiUnlimited?<Infinity/>:aiPlan?.monthly_ai_requests??'—'}</strong><span>{session?.aiUnlimited?'YOYO IA sin límite de producto':'solicitudes IA/mes'}</span></div>
   <div><strong>{aiPlan?.model_tier||'—'}</strong><span>nivel de modelo activo</span></div>
   <div><strong>{billing?.configured?'Configurada':'No conectada'}</strong><span>facturación</span></div>
  </section>

  <div className="settings-grid">
   <section className="settings-card"><div className="settings-title"><BadgeCheck/><div><h2>Tu acceso actual</h2><p>{session?.displayName||'Usuario'} · {session?.roleLabel||'Rol en comprobación'}</p></div></div><div className="insight"><b>{productLabels[activePlan]}</b>{capabilities.map(item=><p key={item}>✓ {item}</p>)}</div><p className="setting-note">El plan de producto proviene del contexto de sesión y permisos actuales; no se deduce desde esta pantalla.</p></section>

   <section className="settings-card"><div className="settings-title"><BrainCircuit/><div><h2>YOYO IA</h2><p>Entitlement técnico verificado por la API de IA.</p></div></div>{aiPlan?<><p><b>{aiPlan.name||aiPlan.id||'Plan IA'}</b></p>{aiPlan.description&&<p>{aiPlan.description}</p>}<div className="insight"><p>Archivos por solicitud: <b>{typeof aiPlan.max_files_per_request==='number'?aiPlan.max_files_per_request:'—'}</b></p><p>Máximo por archivo: <b>{formatBytes(aiPlan.max_file_bytes)}</b></p><p>Carga total: <b>{formatBytes(aiPlan.max_total_file_bytes)}</b></p><p>Salida máxima: <b>{aiPlan.max_output_tokens?.toLocaleString('es-CL')||'—'} tokens</b></p><p>Análisis ilimitado de archivos: <b>{aiPlan.unlimited_file_analysis?'Sí':'No'}</b></p></div></>:<div className="insight"><p>{entitlement?.error||'No hay entitlement de IA verificado.'}</p></div>}</section>

   <section className="settings-card"><div className="settings-title"><CreditCard/><div><h2>Facturación</h2><p>Estado real de la pasarela, sin checkout ficticio.</p></div></div>{billing?.configured?<><div className="insight"><b>Proveedor configurado: {billing.provider}</b><p>Checkout: disponible</p><p>Cobro recurrente verificado: {billing.recurringBillingVerified?'Sí':'No'}</p><p>Webhook verificado: {billing.webhookVerified?'Sí':'No'}</p></div><button className="btn btn-primary" onClick={openCheckout}><WalletCards size={17}/>Abrir portal configurado</button></>:<div className="insight"><LockKeyhole size={18}/><div><b>Pasarela no conectada</b><p>No hay un proveedor de pagos configurado en el runtime. No se muestran precios, renovaciones ni cobros simulados.</p></div></div>}<p className="setting-note">{canManageBilling?'Tu perfil puede administrar pagos cuando exista una pasarela verificada.':'Tu perfil no tiene permisos de administración de pagos.'}</p></section>

   <section className="settings-card"><div className="settings-title"><ShieldCheck/><div><h2>Condiciones operativas actuales</h2><p>Reglas de producto; revisión legal formal pendiente.</p></div></div><div className="insight"><p>✓ Las acciones sensibles de IA requieren revisión humana cuando corresponda.</p><p>✓ Los datos de estudiantes se minimizan y no se envían `sensitive_notes` al modelo.</p><p>✓ Los recursos generados no se consideran evidencia institucional hasta que una profesional los revise o registre.</p><p>✓ Las integraciones y cobros sólo se consideran activos cuando existe conexión real verificada.</p></div><p className="setting-note">Este bloque no sustituye términos legales, política de privacidad ni contrato de servicio revisados por asesoría jurídica.</p></section>

   <section className="settings-card"><div className="settings-title"><FileCheck2/><div><h2>Gobernanza de cambios</h2><p>Qué puede cambiar automáticamente YOYO.</p></div></div><div className="insight"><p>✓ Auditoría y propuestas pueden automatizarse.</p><p>✓ Publicación de recursos y cambios de producción requieren revisión.</p><p>✓ Ninguna pasarela de pago se habilita sólo por existir una interfaz.</p><p>✓ Los OA no deben inventarse: se usan registros institucionales verificados.</p></div></section>

   <section className="settings-card"><div className="settings-title"><Sparkles/><div><h2>Comparación de niveles</h2><p>Capacidades del producto, sin precios inventados.</p></div></div>{(['basic','premium','owner'] as const).map(plan=><div className="insight" key={plan} style={{marginBottom:10}}><b>{productLabels[plan]}{plan===activePlan?' · actual':''}</b><p>{planSummary[plan].join(' · ')}</p></div>)}</section>
  </div>
  <p className="save-status" role="status" aria-live="polite" style={{marginTop:16}}>{status}</p>
 </AppShell>
}
