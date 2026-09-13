import {NextResponse} from 'next/server'
import {cloudflareChatCompletion,getCloudflareAIConfig} from '@/lib/ai/cloudflare-gateway'
import {createClient} from '@/lib/supabase/server'

type Question={id?:string;prompt:string;type:'Selección múltiple'|'Desarrollo'|'Respuesta oral';points:number;options?:string[]}
type Rubric={id?:string;title:string;description:string;points:number}
type RequestBody={operation?:'generate'|'adapt';title?:string;level?:string;subject?:string;objective?:string;variant?:string;targetVariant?:string;questions?:Question[];rubric?:Rubric[]}
type AuthResult={allowed?:boolean;code?:string;eventId?:string;modelTier?:string;limits?:{maxOutputTokens?:number}}
type LooseClient={rpc:(fn:string,args:Record<string,unknown>)=>Promise<{data:unknown;error:{message?:string}|null}>}

type AiPayload={
 title:string
 subject:string
 objective:string
 variant:string
 questions:Array<{prompt:string;type:'Selección múltiple'|'Desarrollo'|'Respuesta oral';points:number;options?:string[]}>
 rubric:Array<{title:string;description:string;points:number}>
 supports:string[]
 equivalenceChecks:string[]
}

const allowedTypes=new Set(['Selección múltiple','Desarrollo','Respuesta oral'])
const modelByTier:Record<string,string>={
 essential:process.env.YOYO_AI_MODEL_ESSENTIAL||'google-ai-studio/gemini-2.5-flash',
 advanced:process.env.YOYO_AI_MODEL_ADVANCED||'anthropic/claude-sonnet-4-5',
 institution:process.env.YOYO_AI_MODEL_INSTITUTION||'anthropic/claude-sonnet-4-5',
 owner:process.env.YOYO_AI_MODEL_OWNER||'openai/gpt-5.2',
}

function text(value:unknown,max=4000){return typeof value==='string'?value.trim().slice(0,max):''}
function cleanJson(value:string){return JSON.parse(value.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/i,'').trim()) as unknown}
function supportGuidance(variant:string){
 const normalized=variant.toLowerCase()
 if(normalized.includes('tda'))return 'Segmenta instrucciones, reduce distractores irrelevantes, usa enunciados breves y previsibles, conserva el objetivo y la exigencia cognitiva central.'
 if(normalized.includes('dil'))return 'Usa lenguaje concreto y directo, una demanda por ítem, ejemplos o apoyos visuales descritos cuando ayuden, máximo tres alternativas cuando corresponda y conserva el mismo objetivo central.'
 if(normalized.includes('tea'))return 'Usa lenguaje explícito, formato predecible, evita ambigüedades e inferencias sociales innecesarias, ofrece estructura visual descrita y conserva el mismo objetivo central.'
 if(normalized.includes('lectura mediada'))return 'Permite mediación oral de instrucciones y lectura del enunciado sin entregar la respuesta; conserva contenido, objetivo y criterio de logro.'
 return 'Mantén una versión estándar clara, accesible y alineada al mismo objetivo.'
}

function normalizePayload(raw:unknown,fallback:{title:string;subject:string;objective:string;variant:string}):AiPayload{
 if(!raw||typeof raw!=='object')throw new Error('INVALID_AI_PAYLOAD')
 const record=raw as Record<string,unknown>
 const rawQuestions=Array.isArray(record.questions)?record.questions:[]
 const questions=rawQuestions.slice(0,40).map((item,index)=>{
  const row=(item&&typeof item==='object'?item:{}) as Record<string,unknown>
  const type=allowedTypes.has(String(row.type))?String(row.type) as Question['type']:'Desarrollo'
  const prompt=text(row.prompt,1200)
  const points=Math.max(1,Math.min(50,Number(row.points)||1))
  const options=type==='Selección múltiple'&&Array.isArray(row.options)?row.options.map(option=>text(option,300)).filter(Boolean).slice(0,5):undefined
  if(!prompt)throw new Error(`INVALID_QUESTION_${index+1}`)
  if(type==='Selección múltiple'&&(!options||options.length<2))throw new Error(`INVALID_OPTIONS_${index+1}`)
  return {prompt,type,points,options}
 })
 if(!questions.length)throw new Error('EMPTY_QUESTIONS')
 const rawRubric=Array.isArray(record.rubric)?record.rubric:[]
 const rubric=rawRubric.slice(0,12).map((item,index)=>{
  const row=(item&&typeof item==='object'?item:{}) as Record<string,unknown>
  const title=text(row.title,160)||`Criterio ${index+1}`
  const description=text(row.description,600)
  const points=Math.max(1,Math.min(50,Number(row.points)||1))
  return {title,description,points}
 })
 const stringList=(value:unknown,max:number)=>Array.isArray(value)?value.map(item=>text(item,500)).filter(Boolean).slice(0,max):[]
 return {
  title:text(record.title,300)||fallback.title,
  subject:text(record.subject,120)||fallback.subject,
  objective:text(record.objective,2000)||fallback.objective,
  variant:text(record.variant,120)||fallback.variant,
  questions,
  rubric,
  supports:stringList(record.supports,12),
  equivalenceChecks:stringList(record.equivalenceChecks,12),
 }
}

function buildPrompt(input:{operation:'generate'|'adapt';title:string;level:string;subject:string;objective:string;variant:string;targetVariant:string;questions:Question[];rubric:Rubric[]}){
 const source=input.operation==='adapt'?`\nINSTRUMENTO BASE A ADAPTAR:\n${JSON.stringify({questions:input.questions,rubric:input.rubric})}`:''
 return `Eres YOYO IA, motor independiente de YoYoLetrasAI especializado en evaluación educativa chilena.\n\nTAREA: ${input.operation==='adapt'?'crear una variante equivalente y accesible':'crear un instrumento de evaluación completo'}.\nTítulo: ${input.title}\nNivel: ${input.level}\nAsignatura: ${input.subject}\nObjetivo/habilidad común: ${input.objective}\nVersión destino: ${input.targetVariant}\n\nREGLAS OBLIGATORIAS:\n- Conserva exactamente el objetivo o habilidad central; no rebajes el aprendizaje por diagnóstico o perfil de apoyo.\n- No inventes códigos OA oficiales. Si el objetivo no incluye código, trabaja con la descripción entregada.\n- ${supportGuidance(input.targetVariant)}\n- Evita lenguaje estigmatizante.\n- Las preguntas deben ser evaluables, claras y no repetitivas.\n- En selección múltiple incluye entre 2 y 4 alternativas plausibles y una única mejor respuesta, pero no reveles la respuesta en el enunciado.\n- Mantén una distribución de puntaje coherente con el instrumento base cuando exista.\n- La rúbrica debe medir el mismo aprendizaje y permitir respuestas multimodales cuando sea pertinente.\n- Devuelve verificaciones explícitas de equivalencia y apoyos aplicados.\n${source}\n\nDevuelve EXCLUSIVAMENTE JSON válido con esta forma:\n{"title":"...","subject":"...","objective":"...","variant":"${input.targetVariant}","questions":[{"prompt":"...","type":"Selección múltiple","points":2,"options":["...","...","..."]}],"rubric":[{"title":"...","description":"...","points":2}],"supports":["..."],"equivalenceChecks":["Mismo objetivo central","... "]}`
}

export async function POST(request:Request){
 const supabase=await createClient();const db=supabase as unknown as LooseClient
 const claims=(await supabase.auth.getClaims()).data?.claims
 if(typeof claims?.sub!=='string')return NextResponse.json({error:'No autenticado.'},{status:401})
 const body=(await request.json().catch(()=>({}))) as RequestBody
 const operation=body.operation==='generate'?'generate':'adapt'
 const title=text(body.title,300),level=text(body.level,100),subject=text(body.subject,160),objective=text(body.objective,2200),variant=text(body.variant,120)||'Estándar',targetVariant=text(body.targetVariant,120)||variant
 const questions=Array.isArray(body.questions)?body.questions.slice(0,40):[]
 const rubric=Array.isArray(body.rubric)?body.rubric.slice(0,12):[]
 if(!title||!level||!subject||!objective)return NextResponse.json({error:'Completa título, nivel, asignatura y objetivo antes de usar YOYO IA.'},{status:400})
 if(operation==='adapt'&&!questions.length)return NextResponse.json({error:'La variante necesita un instrumento base con preguntas.'},{status:400})

 const authorization=await db.rpc('authorize_ai_request',{p_mode:'assessment',p_file_count:0,p_largest_file_bytes:0,p_total_file_bytes:0,p_estimated_tokens:6500})
 if(authorization.error)return NextResponse.json({error:'No fue posible verificar el plan de YOYO IA.'},{status:503})
 const auth=(authorization.data||{}) as AuthResult
 if(!auth.allowed||!auth.eventId)return NextResponse.json({error:'Solicitud no autorizada por el plan.',code:auth.code||'NOT_ALLOWED'},{status:403})
 const model=modelByTier[auth.modelTier||'essential']||modelByTier.essential
 if(!getCloudflareAIConfig().configured){await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'error',p_model_route:model,p_error_code:'CLOUDFLARE_AI_NOT_CONFIGURED'});return NextResponse.json({error:'YOYO IA requiere la configuración de Cloudflare AI para generar una adaptación real.',code:'CLOUDFLARE_AI_NOT_CONFIGURED'},{status:503})}
 try{
  const response=await cloudflareChatCompletion({model,messages:[{role:'system',content:'Devuelve únicamente JSON válido. No incluyas markdown.'},{role:'user',content:buildPrompt({operation,title,level,subject,objective,variant,targetVariant,questions,rubric})}],maxTokens:Math.min(Number(auth.limits?.maxOutputTokens)||8000,16000),temperature:0.25,timeoutMs:120000})
  const output=normalizePayload(cleanJson(response.text),{title,subject,objective,variant:targetVariant})
  const usage=response.usage||{}
  const inputTokens=Number((usage as Record<string,unknown>).prompt_tokens||(usage as Record<string,unknown>).input_tokens||0)
  const outputTokens=Number((usage as Record<string,unknown>).completion_tokens||(usage as Record<string,unknown>).output_tokens||0)
  const totalTokens=Number((usage as Record<string,unknown>).total_tokens||inputTokens+outputTokens)
  await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'complete',p_model_route:`cloudflare:${model}`,p_token_usage:usage,p_input_tokens:inputTokens,p_output_tokens:outputTokens,p_total_tokens:totalTokens})
  return NextResponse.json({output,provider:response.provider,modelTier:auth.modelTier})
 }catch(error){
  await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'error',p_model_route:`cloudflare:${model}`,p_error_code:'ASSESSMENT_ADAPTATION_FAILED'})
  console.error('[assessment-adapt]',error)
  return NextResponse.json({error:'YOYO IA no pudo completar una variante válida. El instrumento original no fue modificado.',code:'ASSESSMENT_ADAPTATION_FAILED'},{status:502})
 }
}
