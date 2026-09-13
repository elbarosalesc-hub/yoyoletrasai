'use client'

import {FormEvent,useMemo,useState} from 'react'
import {useRouter} from 'next/navigation'
import {AppShell} from '@/components/AppShell'
import {BookOpen,Copy,ExternalLink,Filter,Search,Sparkles,WandSparkles} from 'lucide-react'

type PromptItem={id:string;title:string;description:string;content:string;type:string;author:string;category:string;tags:string[];votes:number}
type SearchResponse={query?:string;count?:number;prompts?:PromptItem[];error?:string}

const promptTypes=['','TEXT','STRUCTURED','IMAGE','VIDEO','AUDIO']
const typeLabels:Record<string,string>={TEXT:'Texto',STRUCTURED:'Estructurado',IMAGE:'Imagen',VIDEO:'Video',AUDIO:'Audio'}

export default function PromptsPage(){
 const router=useRouter()
 const[query,setQuery]=useState('comprensión lectora educación básica')
 const[type,setType]=useState('TEXT')
 const[items,setItems]=useState<PromptItem[]>([])
 const[status,setStatus]=useState('Busca ideas y conviértelas en recursos pedagógicos dentro de YOYO IA.')
 const[loading,setLoading]=useState(false)
 const selectedCount=useMemo(()=>items.length,[items])

 async function search(event?:FormEvent){
  event?.preventDefault()
  const clean=query.trim()
  if(!clean){setStatus('Escribe un tema para buscar.');return}
  setLoading(true);setStatus('Buscando en Prompts.chat...')
  try{
   const params=new URLSearchParams({q:clean,limit:'12'})
   if(type)params.set('type',type)
   const response=await fetch(`/api/prompts-chat/search?${params.toString()}`,{cache:'no-store'})
   const data=(await response.json()) as SearchResponse
   if(!response.ok)throw new Error(data.error||'No fue posible completar la búsqueda.')
   setItems(data.prompts||[])
   setStatus(`${data.count||0} resultado(s) encontrados en Prompts.chat.`)
  }catch(error){setItems([]);setStatus(error instanceof Error?error.message:'No fue posible completar la búsqueda.')}
  finally{setLoading(false)}
 }

 function usePrompt(prompt:PromptItem){
  try{
   window.localStorage.setItem('yoyo-prompts-chat-selection',JSON.stringify({title:prompt.title,content:prompt.content,type:prompt.type,source:'prompts.chat',selectedAt:new Date().toISOString()}))
   router.push('/crear?from=prompts-chat')
  }catch{setStatus('No fue posible transferir este prompt al creador.')}
 }

 async function copyPrompt(content:string){
  try{await navigator.clipboard.writeText(content);setStatus('Prompt copiado al portapapeles.')}
  catch{setStatus('No fue posible copiar el prompt desde este navegador.')}
 }

 return <AppShell active="Prompts IA">
  <section className="premium-hero"><span className="eyebrow">Biblioteca inteligente</span><h1>Prompts IA para educación</h1><p>Explora ideas de Prompts.chat y conviértelas en recursos, evaluaciones, actividades, apoyos DUA/PIE o juegos dentro de YOYO IA.</p></section>
  <section className="premium-card" style={{marginBottom:20}}>
   <form onSubmit={search} className="prompt-search-form" style={{display:'grid',gridTemplateColumns:'1fr 220px auto',gap:12,alignItems:'end'}}>
    <label><span>Tema o necesidad pedagógica</span><div className="approved-search" style={{width:'100%',marginTop:6}}><Search size={18}/><input value={query} onChange={event=>setQuery(event.target.value)} style={{border:0,outline:'none',background:'transparent',width:'100%',color:'inherit'}} placeholder="Ej.: fracciones 5° básico, comprensión inferencial, TEA..."/></div></label>
    <label><span><Filter size={15}/> Tipo</span><select value={type} onChange={event=>setType(event.target.value)} style={{width:'100%',marginTop:6,padding:'12px 14px',borderRadius:12}}>{promptTypes.map(item=><option key={item||'all'} value={item}>{item?typeLabels[item]:'Todos'}</option>)}</select></label>
    <button className="btn btn-primary" type="submit" disabled={loading}><Sparkles size={17}/>{loading?'Buscando...':'Buscar prompts'}</button>
   </form>
   <p className="save-status" role="status" aria-live="polite">{status}</p>
  </section>

  <section className="premium-card">
   <div style={{display:'flex',justifyContent:'space-between',gap:16,alignItems:'center',marginBottom:16}}><div><span className="eyebrow">Resultados</span><h2 style={{margin:'4px 0'}}>Biblioteca externa, uso interno</h2></div><span>{selectedCount} visibles</span></div>
   {items.length===0?<div className="command-empty"><BookOpen/><strong>Aún no hay resultados</strong><span>Realiza una búsqueda y selecciona el prompt que quieras adaptar a tu clase.</span></div>:<div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:16}}>{items.map(prompt=><article key={prompt.id} className="premium-card" style={{margin:0}}>
    <div style={{display:'flex',justifyContent:'space-between',gap:12,alignItems:'start'}}><div><small>{typeLabels[prompt.type]||prompt.type} · {prompt.category}</small><h3 style={{margin:'6px 0'}}>{prompt.title}</h3></div><span>▲ {prompt.votes}</span></div>
    {prompt.description&&<p>{prompt.description}</p>}
    <div style={{maxHeight:170,overflow:'auto',whiteSpace:'pre-wrap',fontSize:14,lineHeight:1.45,padding:12,borderRadius:12,background:'rgba(255,255,255,.04)'}}>{prompt.content}</div>
    {prompt.tags.length>0&&<div style={{display:'flex',gap:6,flexWrap:'wrap',marginTop:10}}>{prompt.tags.map(tag=><small key={tag}>#{tag}</small>)}</div>}
    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:14}}><button className="btn btn-primary" onClick={()=>usePrompt(prompt)}><WandSparkles size={16}/>Usar en YOYO IA</button><button className="btn btn-soft" onClick={()=>copyPrompt(prompt.content)}><Copy size={16}/>Copiar</button><a className="btn btn-soft" href="https://prompts.chat" target="_blank" rel="noreferrer"><ExternalLink size={16}/>Fuente</a></div>
    <small style={{display:'block',marginTop:10}}>Autor: {prompt.author}</small>
   </article>)}</div>}
  </section>
 </AppShell>
}
