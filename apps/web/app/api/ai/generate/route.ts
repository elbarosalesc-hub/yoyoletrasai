import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { cloudflareChatCompletion, getCloudflareAIConfig } from '@/lib/ai/cloudflare-gateway'
import { loadVerifiedSourceContext } from '@/lib/ai/source-context'
import { createClient } from '@/lib/supabase/server'

type LooseClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message?: string } | null }>
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => { select: (columns: string) => { single: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }> } }
    update: (values: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }> }
  }
}

type SourceMetadata = { id: string; file_name: string; actual_bytes: number | null; status: string }
type RequestBody = { resourceType?:string; title?:string; subject?:string; level?:string; objective?:string; supportProfile?:string; visualStyle?:string; sourceIds?:string[]; mode?:string }
type AuthResult = { allowed?:boolean; code?:string; eventId?:string; userId?:string; organizationId?:string; planId?:string; planName?:string; modelTier?:string; ownerUnlimited?:boolean; limits?:{maxFiles?:number;maxFileBytes?:number;maxTotalFileBytes?:number;maxOutputTokens?:number} }

const modelByTier:Record<string,string>={
  essential:process.env.YOYO_AI_MODEL_ESSENTIAL||'google-ai-studio/gemini-2.5-flash',
  advanced:process.env.YOYO_AI_MODEL_ADVANCED||'anthropic/claude-sonnet-4-5',
  institution:process.env.YOYO_AI_MODEL_INSTITUTION||'anthropic/claude-sonnet-4-5',
  owner:process.env.YOYO_AI_MODEL_OWNER||'openai/gpt-5.2',
}

function safeText(value:unknown,max=5000){return typeof value==='string'?value.trim().slice(0,max):''}
function mapMode(resourceType:string,requestedMode?:string){if(requestedMode)return requestedMode;const n=resourceType.toLowerCase();if(n.includes('evalu')||n.includes('rúbrica')||n.includes('rubrica'))return'assessment';if(n.includes('informe'))return'report';if(n.includes('presentación')||n.includes('presentacion'))return'presentation';if(n.includes('resumen'))return'summary';if(n.includes('plan lector'))return'reading_plan';if(n.includes('guía')||n.includes('guia'))return'guide';if(n.includes('escritura'))return'writing';return'activity'}
function extractJson(text:string){const trimmed=text.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/i,'').trim();return JSON.parse(trimmed) as Record<string,unknown>}
function buildPrompt(body:Required<Pick<RequestBody,'resourceType'|'title'|'subject'|'level'|'objective'|'supportProfile'|'visualStyle'>>,sourceText:string,pendingFiles:string[]){
  const sourceSection=sourceText?`\nFUENTES VERIFICADAS PARA USAR COMO CONTEXTO:\n${sourceText}\n`:''
  const pendingSection=pendingFiles.length?`\nARCHIVOS ADJUNTOS AÚN NO ANALIZADOS: ${pendingFiles.join(', ')}. No afirmes haberlos leído ni cites información proveniente de ellos.\n`:''
  return `Eres el motor pedagógico YOYO IA de YoYoLetrasAI. Crea un recurso educativo chileno de calidad premium, listo para editar e imprimir.\n\nREQUISITOS OBLIGATORIOS:\n- Currículum chileno y lenguaje profesional docente.\n- Mantener el mismo objetivo central para todo el curso; diversificar acceso, apoyos y formas de respuesta mediante DUA.\n- Incorporar apoyos PIE/NEE sin estigmatizar ni separar al estudiante del objetivo común.\n- Instrucciones breves, claras y evaluables.\n- Progresión cognitiva y contextualización funcional.\n- Incluir versión docente, versión estudiante y pauta/respuestas o criterios de logro.\n- Evitar contenido de relleno, preguntas repetitivas y afirmaciones curriculares no verificables.\n- Si falta un código OA exacto, describir el objetivo sin inventar código oficial.\n- Cuando existan fuentes verificadas, prioriza su contenido y no inventes información ausente.\n\nCONFIGURACIÓN:\nTipo: ${body.resourceType}\nTema/título: ${body.title}\nAsignatura: ${body.subject}\nNivel: ${body.level}\nObjetivo: ${body.objective}\nPerfil de apoyo: ${body.supportProfile}\nEstilo visual: ${body.visualStyle}\n${sourceSection}${pendingSection}\nDevuelve EXCLUSIVAMENTE JSON válido con esta forma:\n{"title":"...","summary":"...","teacherVersion":{"purpose":"...","instructions":["..."],"activities":["..."],"assessment":"..."},"studentVersion":{"instructions":["..."],"activities":["..."]},"answerKey":["..."],"duaSupports":["..."],"accessibility":["..."],"qualityChecklist":{"curricularAlignment":true,"duaPie":true,"accessibility":true,"teacherVersion":true,"studentVersion":true,"answerKeyOrRubric":true,"editableReusable":true,"visualQuality":true}}`
}

export async function POST(request:Request){
  const supabase=await createClient();const db=supabase as unknown as LooseClient
  const claims=(await supabase.auth.getClaims()).data?.claims;const userId=typeof claims?.sub==='string'?claims.sub:null
  if(!userId)return NextResponse.json({error:'No autenticado.'},{status:401})
  const body=(await request.json().catch(()=>({}))) as RequestBody
  const resourceType=safeText(body.resourceType,120),title=safeText(body.title,300),subject=safeText(body.subject,120),level=safeText(body.level,80),objective=safeText(body.objective,2000),supportProfile=safeText(body.supportProfile,180)||'Acceso universal DUA',visualStyle=safeText(body.visualStyle,180)||'Infantil académico premium'
  const sourceIds=[...new Set((Array.isArray(body.sourceIds)?body.sourceIds:[]).filter(id=>typeof id==='string'&&id.length>10))].slice(0,200)
  if(!resourceType||!title||!subject||!level||!objective)return NextResponse.json({error:'Faltan datos pedagógicos obligatorios.'},{status:400})

  let sourceMetadata:SourceMetadata[]=[]
  if(sourceIds.length){const lookup=await (supabase as any).from('ai_source_files').select('id,file_name,actual_bytes,status').in('id',sourceIds).eq('user_id',userId).eq('status','ready');if(lookup.error)return NextResponse.json({error:'No fue posible verificar las fuentes.'},{status:503});sourceMetadata=(lookup.data||[]) as SourceMetadata[];if(sourceMetadata.length!==sourceIds.length)return NextResponse.json({error:'Una o más fuentes todavía no están listas.'},{status:409})}
  const fileCount=sourceMetadata.length,largestFileBytes=sourceMetadata.reduce((m,f)=>Math.max(m,Number(f.actual_bytes)||0),0),totalFileBytes=sourceMetadata.reduce((s,f)=>s+Math.max(0,Number(f.actual_bytes)||0),0)
  const mode=mapMode(resourceType,safeText(body.mode,40)),estimatedTokens=Math.min(32000,2600+objective.length*2+fileCount*500)
  const authorization=await db.rpc('authorize_ai_request',{p_mode:mode,p_file_count:fileCount,p_largest_file_bytes:largestFileBytes,p_total_file_bytes:totalFileBytes,p_estimated_tokens:estimatedTokens})
  if(authorization.error)return NextResponse.json({error:'No fue posible verificar el plan de YOYO IA.'},{status:503})
  const auth=(authorization.data??{}) as AuthResult
  if(!auth.allowed||!auth.eventId||!auth.organizationId||!auth.userId)return NextResponse.json({error:'Solicitud no autorizada por el plan.',code:auth.code||'NOT_ALLOWED'},{status:403})
  const maxFiles=Number(auth.limits?.maxFiles??-1),maxFileBytes=Number(auth.limits?.maxFileBytes??0),maxTotalFileBytes=Number(auth.limits?.maxTotalFileBytes??0)
  if((maxFiles!==-1&&fileCount>maxFiles)||(fileCount>0&&(largestFileBytes>maxFileBytes||totalFileBytes>maxTotalFileBytes))){await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'blocked',p_model_route:'not-routed',p_error_code:'FILE_LIMIT_EXCEEDED'});return NextResponse.json({error:'Las fuentes superan los límites del plan activo.',code:'FILE_LIMIT_EXCEEDED'},{status:413})}

  const model=modelByTier[auth.modelTier||'essential']||modelByTier.essential
  if(!getCloudflareAIConfig().configured){await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'error',p_model_route:model,p_error_code:'CLOUDFLARE_AI_NOT_CONFIGURED'});return NextResponse.json({error:'YOYO IA requiere la configuración de Cloudflare AI en este entorno.',code:'CLOUDFLARE_AI_NOT_CONFIGURED'},{status:503})}
  let sourceContext
  try{sourceContext=await loadVerifiedSourceContext(supabase,userId,sourceIds)}catch{await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'error',p_model_route:model,p_error_code:'SOURCE_CONTEXT_FAILED'});return NextResponse.json({error:'No fue posible cargar una o más fuentes verificadas.',code:'SOURCE_CONTEXT_FAILED'},{status:502})}
  const pendingNames=sourceContext.pendingSources.map(item=>item.fileName)
  const prompt=buildPrompt({resourceType,title,subject,level,objective,supportProfile,visualStyle},sourceContext.textContext,pendingNames)
  const generationKey=createHash('sha256').update(JSON.stringify({mode,resourceType,title,subject,level,objective,supportProfile,visualStyle,sourceIds})).digest('hex')
  const maxOutputTokens=Math.min(Number(auth.limits?.maxOutputTokens)||8000,64000)
  const generationInsert=await db.from('ai_generations').insert({organization_id:auth.organizationId,created_by:auth.userId,generation_key:generationKey,prompt_version:'yoyo-premium-v4-cloudflare',model,status:'pending',cache_source:'none',input_payload:{mode,resourceType,title,subject,level,objective,supportProfile,visualStyle,sourceIds,analyzedSourceIds:sourceContext.analyzedSourceIds,pendingSources:sourceContext.pendingSources}}).select('id').single()
  const generationId=typeof generationInsert.data?.id==='string'?generationInsert.data.id:null

  try{
    const userContent:Array<Record<string,unknown>>=[{type:'text',text:prompt}]
    for(const attachment of sourceContext.gatewayAttachments){if(attachment.kind==='pdf'){userContent.push({type:'file',file:{filename:attachment.fileName,file_data:`data:${attachment.mediaType};base64,${attachment.base64}`}})}else{userContent.push({type:'image_url',image_url:{url:`data:${attachment.mediaType};base64,${attachment.base64}`,detail:'auto'}})}}
    const response=await cloudflareChatCompletion({model,messages:[{role:'system',content:'Responde únicamente JSON válido. No incluyas markdown ni explicación fuera del JSON.'},{role:'user',content:userContent}],maxTokens:maxOutputTokens,temperature:0.35,timeoutMs:120000})
    const output=extractJson(response.text),usage=response.usage||{}
    const inputTokens=Number((usage as any).prompt_tokens||(usage as any).input_tokens||0),outputTokens=Number((usage as any).completion_tokens||(usage as any).output_tokens||0),totalTokens=Number((usage as any).total_tokens||inputTokens+outputTokens)
    await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'complete',p_model_route:`cloudflare:${model}`,p_token_usage:usage,p_input_tokens:inputTokens,p_output_tokens:outputTokens,p_total_tokens:totalTokens})
    if(generationId)await db.from('ai_generations').update({status:'complete',output_payload:output,token_usage:usage,provider_metadata:{gateway:'cloudflare-ai-rest',planId:auth.planId,modelTier:auth.modelTier,analyzedSourceIds:sourceContext.analyzedSourceIds,pendingSources:sourceContext.pendingSources},completed_at:new Date().toISOString()}).eq('id',generationId)
    return NextResponse.json({output,modelTier:auth.modelTier,planName:auth.planName,ownerUnlimited:auth.ownerUnlimited,usage,generationId,provider:response.provider,sources:{verified:sourceMetadata.length,analyzedSourceIds:sourceContext.analyzedSourceIds,pending:sourceContext.pendingSources}})
  }catch(error){
    const message=error instanceof Error?error.message.slice(0,500):'GENERATION_FAILED'
    await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'error',p_model_route:`cloudflare:${model}`,p_error_code:'GENERATION_FAILED'})
    if(generationId)await db.from('ai_generations').update({status:'error',error_message:message,completed_at:new Date().toISOString()}).eq('id',generationId)
    return NextResponse.json({error:'YOYO IA no pudo completar esta generación.',code:'GENERATION_FAILED'},{status:502})
  }
}
