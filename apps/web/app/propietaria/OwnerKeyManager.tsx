'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react'

type Status = { configured:boolean; source:string; lastFour?:string|null; fingerprint?:string|null; updatedAt?:string|null }

export function OwnerKeyManager(){
  const[key,setKey]=useState('')
  const[status,setStatus]=useState<Status|null>(null)
  const[message,setMessage]=useState('')
  const[pending,setPending]=useState(false)

  async function load(){
    const response=await fetch('/api/owner/yoyo-key',{cache:'no-store'})
    const data=await response.json()
    if(response.ok)setStatus(data)
  }
  useEffect(()=>{load()},[])

  async function submit(event:FormEvent){
    event.preventDefault();setPending(true);setMessage('')
    try{
      const response=await fetch('/api/owner/yoyo-key',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key})})
      const data=await response.json()
      if(!response.ok)throw new Error(data.error||'No fue posible guardar la clave.')
      setKey('');setStatus(data);setMessage('Clave guardada y cifrada correctamente. YOYO IA podrá reutilizarla sin volver a solicitarla.')
    }catch(error){setMessage(error instanceof Error?error.message:'No fue posible guardar la clave.')}
    finally{setPending(false)}
  }

  return <section className="approved-panel" style={{padding:24}}>
    <div className="approved-panel-heading"><div><h2>Clave privada de YOYO IA</h2><p>Se cifra en servidor y nunca se devuelve completa al navegador.</p></div><ShieldCheck/></div>
    {status?.configured&&<div className="approved-state" style={{marginBottom:18}}><CheckCircle2/><strong>Configurada</strong><span>Terminación: ••••{status.lastFour||'----'} · origen: {status.source}</span></div>}
    <form onSubmit={submit} style={{display:'grid',gap:12}}>
      <label style={{display:'grid',gap:8,fontWeight:800}}>Guardar o rotar clave<input type="password" value={key} onChange={(event)=>setKey(event.target.value)} minLength={20} required autoComplete="off" placeholder="Pega tu clave una sola vez" style={{height:52,border:'1px solid #d9deea',borderRadius:14,padding:'0 14px',font:'inherit'}}/></label>
      <button disabled={pending} className="btn btn-primary" style={{display:'inline-flex',alignItems:'center',gap:8,width:'fit-content'}}>{pending?<Loader2 size={17}/>:<KeyRound size={17}/>} Guardar cifrada</button>
    </form>
    {message&&<p role="status" style={{marginTop:14}}>{message}</p>}
  </section>
}