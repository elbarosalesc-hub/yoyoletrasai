import {NextRequest,NextResponse} from 'next/server'

export const runtime='nodejs'
export const dynamic='force-dynamic'

const PROMPTS_CHAT_SEARCH='https://prompts.chat/api/prompts'
const ALLOWED_TYPES=new Set(['TEXT','STRUCTURED','IMAGE','VIDEO','AUDIO'])

type RemotePrompt={
 id?:string|number
 title?:string
 description?:string|null
 content?:string
 type?:string
 author?:string|{username?:string;name?:string}|null
 category?:string|{name?:string;slug?:string}|null
 tags?:Array<string|{name?:string;slug?:string}>
 votes?:number
 createdAt?:string
}

function toText(value:unknown){return typeof value==='string'?value:''}
function tagText(value:string|{name?:string;slug?:string}){return typeof value==='string'?value:(value.name||value.slug||'')}
function authorText(value:RemotePrompt['author']){return typeof value==='string'?value:(value?.username||value?.name||'Comunidad')}
function categoryText(value:RemotePrompt['category']){return typeof value==='string'?value:(value?.name||value?.slug||'General')}
function extractPrompts(payload:unknown):RemotePrompt[]{
 if(Array.isArray(payload))return payload as RemotePrompt[]
 if(!payload||typeof payload!=='object')return[]
 const root=payload as Record<string,unknown>
 const direct=[root.prompts,root.items,root.results]
 for(const candidate of direct)if(Array.isArray(candidate))return candidate as RemotePrompt[]
 const data=root.data
 if(Array.isArray(data))return data as RemotePrompt[]
 if(data&&typeof data==='object'){
  const nested=data as Record<string,unknown>
  for(const candidate of [nested.prompts,nested.items,nested.results])if(Array.isArray(candidate))return candidate as RemotePrompt[]
 }
 return[]
}

export async function GET(request:NextRequest){
 const query=(request.nextUrl.searchParams.get('q')||'').trim().slice(0,180)
 const requestedType=(request.nextUrl.searchParams.get('type')||'').trim().toUpperCase()
 const type=ALLOWED_TYPES.has(requestedType)?requestedType:''
 const requestedLimit=Number(request.nextUrl.searchParams.get('limit')||12)
 const limit=Math.max(1,Math.min(Number.isFinite(requestedLimit)?requestedLimit:12,24))
 if(!query)return NextResponse.json({error:'Escribe un tema para buscar prompts.'},{status:400})

 const url=new URL(PROMPTS_CHAT_SEARCH)
 url.searchParams.set('q',query)
 url.searchParams.set('perPage',String(Math.min(type?24:limit,24)))

 try{
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'YoYoLetrasAI/1.0'},cache:'no-store',signal:AbortSignal.timeout(8000)})
  if(!response.ok)throw new Error(`Prompts.chat respondió ${response.status}`)
  const payload=await response.json() as unknown
  let prompts=extractPrompts(payload).map((prompt,index)=>({
   id:String(prompt.id??`${Date.now()}-${index}`),
   title:toText(prompt.title)||'Prompt sin título',
   description:toText(prompt.description),
   content:toText(prompt.content),
   type:toText(prompt.type).toUpperCase()||'TEXT',
   author:authorText(prompt.author),
   category:categoryText(prompt.category),
   tags:Array.isArray(prompt.tags)?prompt.tags.map(tagText).filter(Boolean).slice(0,8):[],
   votes:typeof prompt.votes==='number'?prompt.votes:0,
   createdAt:toText(prompt.createdAt),
  })).filter(prompt=>prompt.content)
  if(type)prompts=prompts.filter(prompt=>prompt.type===type)
  prompts=prompts.slice(0,limit)
  return NextResponse.json({query,count:prompts.length,prompts,source:'prompts.chat'},{headers:{'Cache-Control':'private, max-age=60, stale-while-revalidate=120'}})
 }catch(error){
  console.error('[prompts-chat/search]',error)
  return NextResponse.json({error:'Prompts.chat no está disponible temporalmente. Intenta nuevamente.'},{status:502})
 }
}
