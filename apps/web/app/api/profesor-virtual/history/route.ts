import {cookies} from 'next/headers'
import {NextResponse} from 'next/server'
import {createClient} from '@/lib/supabase/server'

export const dynamic='force-dynamic'

const allowedModes=new Set(['planificar','adaptar','evaluar','analizar','comunicar'])
const fallbackCodes=new Set(['42P01','42501','PGRST205'])

function text(value:unknown,max:number){return typeof value==='string'?value.trim().slice(0,max):''}
function stringArray(value:unknown,maxItems=12,maxLength=700){return Array.isArray(value)?value.filter(item=>typeof item==='string').slice(0,maxItems).map(item=>String(item).slice(0,maxLength)):[]}
function sections(value:unknown){
 if(!Array.isArray(value))return[]
 return value.slice(0,12).map(item=>{
  const row=item&&typeof item==='object'?item as Record<string,unknown>:{}
  return {title:text(row.title,160),items:stringArray(row.items,16,900)}
 }).filter(item=>item.title||item.items.length)
}

async function context(){
 const supabase=await createClient()
 const claims=(await supabase.auth.getClaims()).data?.claims
 const userId=typeof claims?.sub==='string'?claims.sub:null
 const organizationId=(await cookies()).get('yoyo-organization-id')?.value||null
 return {supabase,userId,organizationId}
}

export async function GET(){
 const {supabase,userId,organizationId}=await context()
 if(!userId)return NextResponse.json({error:'No autenticado.'},{status:401})
 if(!organizationId)return NextResponse.json({error:'No hay institución activa.'},{status:409})
 const {data,error}=await (supabase as any).from('virtual_teacher_history')
  .select('id,mode,prompt,level,subject,title,summary,sections,pedagogical_checks,next_steps,created_at')
  .eq('user_id',userId).eq('organization_id',organizationId).order('created_at',{ascending:false}).limit(12)
 if(error){
  if(fallbackCodes.has(error.code))return NextResponse.json({history:[],persistence:'local-fallback',schemaReady:false},{headers:{'Cache-Control':'private, no-store'}})
  return NextResponse.json({error:'No fue posible cargar el historial institucional.'},{status:503})
 }
 const history=(data||[]).map((row:Record<string,unknown>)=>({
  id:String(row.id),mode:String(row.mode),prompt:String(row.prompt||''),level:String(row.level||''),subject:String(row.subject||''),title:String(row.title||''),summary:String(row.summary||''),
  sections:Array.isArray(row.sections)?row.sections:[],pedagogicalChecks:Array.isArray(row.pedagogical_checks)?row.pedagogical_checks:[],nextSteps:Array.isArray(row.next_steps)?row.next_steps:[],generatedAt:String(row.created_at),
 }))
 return NextResponse.json({history,persistence:'institutional',schemaReady:true},{headers:{'Cache-Control':'private, no-store'}})
}

export async function POST(request:Request){
 const {supabase,userId,organizationId}=await context()
 if(!userId)return NextResponse.json({error:'No autenticado.'},{status:401})
 if(!organizationId)return NextResponse.json({error:'No hay institución activa.'},{status:409})
 const body=await request.json().catch(()=>({})) as Record<string,unknown>
 const mode=String(body.mode||'')
 const title=text(body.title,240),prompt=text(body.prompt,4000)
 if(!allowedModes.has(mode)||!title||!prompt)return NextResponse.json({error:'Historial inválido.'},{status:400})
 const values={
  user_id:userId,organization_id:organizationId,mode,prompt,level:text(body.level,100),subject:text(body.subject,140),title,summary:text(body.summary,5000),sections:sections(body.sections),
  pedagogical_checks:stringArray(body.pedagogicalChecks,20,700),next_steps:stringArray(body.nextSteps,20,700),
 }
 const {data,error}=await (supabase as any).from('virtual_teacher_history').insert(values).select('id,created_at').single()
 if(error){
  if(fallbackCodes.has(error.code))return NextResponse.json({saved:false,persistence:'local-fallback',schemaReady:false},{status:503})
  return NextResponse.json({error:'No fue posible guardar el historial institucional.'},{status:503})
 }
 return NextResponse.json({saved:true,persistence:'institutional',id:data.id,generatedAt:data.created_at},{status:201})
}

export async function DELETE(request:Request){
 const {supabase,userId,organizationId}=await context()
 if(!userId)return NextResponse.json({error:'No autenticado.'},{status:401})
 if(!organizationId)return NextResponse.json({error:'No hay institución activa.'},{status:409})
 const id=new URL(request.url).searchParams.get('id')
 if(!id)return NextResponse.json({error:'Falta id.'},{status:400})
 const {error}=await (supabase as any).from('virtual_teacher_history').delete().eq('id',id).eq('user_id',userId).eq('organization_id',organizationId)
 if(error)return NextResponse.json({error:'No fue posible eliminar el registro.'},{status:503})
 return NextResponse.json({ok:true})
}
