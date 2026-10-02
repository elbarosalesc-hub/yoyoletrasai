import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { cloudflareChatCompletion, getCloudflareAIConfig } from '@/lib/ai/cloudflare-gateway'
import { createAIUsageServiceClient } from '@/lib/ai/usage-service'
import { createClient } from '@/lib/supabase/server'

const modes = new Set(['planificar','adaptar','evaluar','analizar','comunicar'])
const modelByTier: Record<string,string> = {
  essential: process.env.YOYO_AI_MODEL_ESSENTIAL || 'google-ai-studio/gemini-2.5-flash',
  advanced: process.env.YOYO_AI_MODEL_ADVANCED || 'anthropic/claude-sonnet-4-5',
  institution: process.env.YOYO_AI_MODEL_INSTITUTION || 'anthropic/claude-sonnet-4-5',
  owner: process.env.YOYO_AI_MODEL_OWNER || 'openai/gpt-5.2',
}

type Section = { title:string; items:string[] }
type TeacherResult = { title:string; summary:string; sections:Section[]; pedagogicalChecks:string[]; nextSteps:string[] }
type LooseDb = { rpc:(fn:string,args:Record<string,unknown>)=>Promise<{data:any;error:{message?:string}|null}> }

function clean(value: unknown, max = 2000) {
  return typeof value === 'string' ? value.replace(/\s+/g,' ').trim().slice(0,max) : ''
}
function safeId(value: unknown) {
  const text = typeof value === 'string' ? value : ''
  return /^[0-9a-f-]{36}$/i.test(text) ? text : ''
}
function extractJson(text:string) {
  const normalized=text.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/i,'').trim()
  return JSON.parse(normalized) as TeacherResult
}
async function loadInstitutionalContext(supabase:any, organizationId:string, courseId:string, studentId:string, objectiveId:string) {
  if (!courseId) return ''
  const courseResult = await supabase.from('courses').select('id,name,level,academic_year').eq('organization_id',organizationId).eq('id',courseId).eq('is_active',true).maybeSingle()
  if (courseResult.error || !courseResult.data) return ''
  const course = courseResult.data
  const [objectivesResult,evidenceResult,enrollmentsResult]=await Promise.all([
    supabase.from('learning_objectives').select('id,subject,code,title,description').eq('organization_id',organizationId).eq('course_id',courseId).eq('is_active',true).order('subject').order('code'),
    supabase.from('learning_evidence').select('student_id,objective_id,achievement_level,autonomy_level,observed_at').eq('organization_id',organizationId).eq('course_id',courseId).order('observed_at',{ascending:false}).limit(100),
    supabase.from('course_enrollments').select('student_id').eq('organization_id',organizationId).eq('course_id',courseId).eq('enrollment_status','active'),
  ])
  const objectives=objectivesResult.error?[]:(objectivesResult.data||[])
  const selectedObjective=objectiveId?objectives.find((item:any)=>String(item.id)===objectiveId):null
  const evidence=evidenceResult.error?[]:(evidenceResult.data||[])
  const enrollments=enrollmentsResult.error?[]:(enrollmentsResult.data||[])
  const studentIds=new Set(enrollments.map((item:any)=>String(item.student_id)))
  const counts={achieved:0,developing:0,initial:0,not_observed:0}
  for(const row of evidence){const key=String(row.achievement_level) as keyof typeof counts;if(key in counts)counts[key]+=1}
  const parts=[`CONTEXTO INSTITUCIONAL VERIFICADO: Curso ${course.name}, nivel ${course.level}, año ${course.academic_year}.`,`Matrícula activa registrada: ${studentIds.size} estudiante(s).`,`Evidencias recientes del curso: ${evidence.length}. Distribución observada: logrado ${counts.achieved}, en desarrollo ${counts.developing}, inicial ${counts.initial}, no observado ${counts.not_observed}.`]
  if(selectedObjective)parts.push(`OA/HABILIDAD SELECCIONADA: ${selectedObjective.code} · ${selectedObjective.title}. ${selectedObjective.description||''}`)
  else if(objectives.length)parts.push(`OA/HABILIDADES disponibles en el curso: ${objectives.slice(0,8).map((item:any)=>`${item.code} ${item.title}`).join(' | ')}`)
  if(studentId&&studentIds.has(studentId)){
    const [supportResult,studentEvidenceResult]=await Promise.all([
      supabase.from('student_support_profiles').select('support_status,strengths,barriers,interests,access_accommodations,objective_accommodations,assistive_technology,evidence_notes').eq('organization_id',organizationId).eq('student_id',studentId).maybeSingle(),
      supabase.from('learning_evidence').select('objective_id,evidence_type,description,achievement_level,support_used,autonomy_level,observed_at').eq('organization_id',organizationId).eq('student_id',studentId).eq('course_id',courseId).order('observed_at',{ascending:false}).limit(6),
    ])
    const support=supportResult.error?null:supportResult.data
    const recent=studentEvidenceResult.error?[]:(studentEvidenceResult.data||[])
    parts.push('CONTEXTO INDIVIDUAL ANONIMIZADO: usa la etiqueta "estudiante seleccionado"; no infieras diagnóstico, identidad ni información no incluida.')
    if(support){if(support.strengths)parts.push(`Fortalezas: ${clean(support.strengths,700)}`);if(support.barriers)parts.push(`Barreras observadas: ${clean(support.barriers,700)}`);if(support.interests)parts.push(`Intereses útiles para contextualizar: ${clean(support.interests,500)}`);if(support.access_accommodations)parts.push(`Apoyos de acceso: ${clean(support.access_accommodations,700)}`);if(support.objective_accommodations)parts.push(`Ajustes de objetivo registrados: ${clean(support.objective_accommodations,700)}`);if(support.assistive_technology)parts.push(`Tecnología de apoyo: ${clean(support.assistive_technology,500)}`);if(support.evidence_notes)parts.push(`Notas pedagógicas de evidencia: ${clean(support.evidence_notes,700)}`)}
    if(recent.length)parts.push(`Evidencias individuales recientes: ${recent.map((item:any)=>`${item.observed_at}: ${clean(item.description,350)} [logro ${item.achievement_level}; autonomía ${item.autonomy_level||'sin registro'}; apoyo ${clean(item.support_used,180)||'sin registro'}]`).join(' | ')}`)
  }
  return parts.join('\n')
}

export async function POST(request:Request){
  const supabase=await createClient()
  const claims=(await supabase.auth.getClaims()).data?.claims
  const userId=typeof claims?.sub==='string'?claims.sub:null
  if(!userId)return NextResponse.json({error:'No autenticado.'},{status:401})
  const organizationId=(await cookies()).get('yoyo-organization-id')?.value
  if(!organizationId)return NextResponse.json({error:'No hay institución activa.'},{status:409})
  const body=await request.json().catch(()=>({})) as Record<string,unknown>
  const mode=modes.has(String(body.mode))?String(body.mode):'planificar'
  const prompt=clean(body.prompt,3000),level=clean(body.level,100)||'3.º básico',subject=clean(body.subject,160)||'Lenguaje y Comunicación',support=clean(body.supportProfile,800)||'Acceso universal DUA',duration=clean(body.duration,100)||'45 minutos',objective=clean(body.objective,1200),tone=clean(body.tone,80)||'profesional_claro',depth=clean(body.depth,80)||'completo'
  const courseId=safeId(body.courseId),studentId=safeId(body.studentId),objectiveId=safeId(body.objectiveId)
  if(!prompt)return NextResponse.json({error:'Describe la necesidad pedagógica.'},{status:400})
  if(!getCloudflareAIConfig().configured)return NextResponse.json({error:'Profesor Virtual requiere la configuración de IA real en este entorno.',code:'CLOUDFLARE_AI_NOT_CONFIGURED'},{status:503})
  const usageDb=createAIUsageServiceClient()
  if(!usageDb)return NextResponse.json({error:'Profesor Virtual requiere el backend seguro de consumo.',code:'AI_USAGE_BACKEND_NOT_CONFIGURED'},{status:503})
  const institutionalContext=await loadInstitutionalContext(supabase as any,organizationId,courseId,studentId,objectiveId)
  const db=supabase as unknown as LooseDb
  const authorization=await db.rpc('authorize_ai_request_for_org',{p_organization_id:organizationId,p_mode:mode==='evaluar'?'assessment':'activity',p_file_count:0,p_largest_file_bytes:0,p_total_file_bytes:0,p_estimated_tokens:Math.min(9000,4500+institutionalContext.length)})
  if(authorization.error)return NextResponse.json({error:'No fue posible verificar el acceso a YOYO IA.'},{status:503})
  const auth=authorization.data||{}
  if(!auth.allowed||!auth.eventId)return NextResponse.json({error:'Tu plan no autoriza esta solicitud.',code:auth.code||'NOT_ALLOWED'},{status:403})
  const model=modelByTier[auth.modelTier||'essential']||modelByTier.essential
  const system=`Eres Profesor Virtual YOYO, copiloto pedagógico profesional de YoYoLetrasAI. Trabajas con currículum chileno, DUA, PIE y evaluación formativa. No inventes códigos OA oficiales. Mantén el objetivo común y diversifica acceso, participación y respuesta. Entrega acciones concretas, no teoría genérica. Si recibes contexto individual, trátalo como "estudiante seleccionado" y no intentes identificarlo ni inferir diagnósticos. No reproduzcas información personal innecesaria. Tono: ${tone}. Profundidad: ${depth}. Devuelve exclusivamente JSON válido.`
  const user=`MODO: ${mode}\nNIVEL: ${level}\nASIGNATURA: ${subject}\nDURACIÓN: ${duration}\nOBJETIVO/OA/HABILIDAD: ${objective||'No especificado; no inventar código OA'}\nNECESIDADES Y APOYOS DEL BRIEF DOCENTE: ${support}\nSOLICITUD DOCENTE: ${prompt}\n${institutionalContext?`\n${institutionalContext}\n`:''}\nDevuelve exactamente esta estructura: {"title":"...","summary":"...","sections":[{"title":"...","items":["..."]}],"pedagogicalChecks":["..."],"nextSteps":["..."]}`
  try{
    const response=await cloudflareChatCompletion({model,messages:[{role:'system',content:system},{role:'user',content:user}],maxTokens:Math.min(Number(auth.limits?.maxOutputTokens)||6000,12000),temperature:0.3,timeoutMs:90000})
    const result=extractJson(response.text)
    await usageDb.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'complete',p_model_route:`cloudflare:${model}`,p_error_code:null})
    return NextResponse.json({result,model,fallback:false,contextUsed:Boolean(institutionalContext),provider:response.provider})
  }catch(error){
    const code=error instanceof Error?error.message.slice(0,120):'TEACHER_GENERATION_FAILED'
    await usageDb.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'error',p_model_route:`cloudflare:${model}`,p_error_code:code})
    return NextResponse.json({error:'Profesor Virtual no pudo completar esta generación. Conserva tu borrador y vuelve a intentarlo.',code:'TEACHER_GENERATION_FAILED'},{status:502})
  }
}
