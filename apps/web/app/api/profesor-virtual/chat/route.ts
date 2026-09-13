import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const modes = new Set(['planificar','adaptar','evaluar','analizar','comunicar'])
const modelByTier: Record<string,string> = {
  essential: process.env.YOYO_AI_MODEL_ESSENTIAL || 'google/gemini-3.6-flash',
  advanced: process.env.YOYO_AI_MODEL_ADVANCED || 'anthropic/claude-sonnet-5',
  institution: process.env.YOYO_AI_MODEL_INSTITUTION || 'anthropic/claude-sonnet-5',
  owner: process.env.YOYO_AI_MODEL_OWNER || 'openai/gpt-5.6-sol',
}

type Section = { title:string; items:string[] }
type TeacherResult = {
  title:string
  summary:string
  sections:Section[]
  pedagogicalChecks:string[]
  nextSteps:string[]
}

type LooseDb = {
  rpc:(fn:string,args:Record<string,unknown>)=>Promise<{data:any;error:{message?:string}|null}>
}

function clean(value: unknown, max = 2000) {
  return typeof value === 'string' ? value.replace(/\s+/g,' ').trim().slice(0,max) : ''
}

function extractJson(text:string) {
  const normalized=text.trim().replace(/^```json\s*/i,'').replace(/^```\s*/i,'').replace(/```$/i,'').trim()
  return JSON.parse(normalized) as TeacherResult
}

function fallback(mode:string, level:string, subject:string, prompt:string, support:string):TeacherResult {
  const modeTitle:Record<string,string>={planificar:'Planificación pedagógica',adaptar:'Adaptación DUA/PIE',evaluar:'Evaluación diversificada',analizar:'Análisis pedagógico',comunicar:'Comunicación educativa'}
  const sections:Record<string,Section[]>={
    planificar:[{title:'Inicio',items:['Activa conocimientos previos con una pregunta breve y contextualizada.','Explicita el propósito en lenguaje comprensible.']},{title:'Desarrollo',items:['Modela un ejemplo antes del trabajo autónomo.','Incluye práctica guiada y aplicación con opciones de respuesta.']},{title:'Cierre',items:['Recoge una evidencia breve de aprendizaje.','Define el siguiente paso según el desempeño observado.']}],
    adaptar:[{title:'Acceso',items:['Mantén el objetivo común y reduce barreras de acceso.','Entrega instrucciones breves, apoyos visuales y modelado.']},{title:'Participación',items:['Permite distintas formas de responder sin bajar la exigencia central.','Incorpora pausas, anticipación y apoyos graduados.']},{title:'Autonomía',items:['Retira apoyos progresivamente.','Registra qué ayuda fue necesaria y qué logró de manera independiente.']}],
    evaluar:[{title:'Instrumento',items:['Combina ítems breves, aplicación y evidencia del razonamiento.','Explicita puntajes y criterios de logro.']},{title:'Diversificación',items:['Reduce carga lingüística cuando no sea parte del objetivo.','Permite respuesta oral, visual o escrita cuando corresponda.']},{title:'Retroalimentación',items:['Distingue logro, error y apoyo requerido.','Entrega una acción concreta para mejorar.']}],
    analizar:[{title:'Lectura de evidencia',items:['Agrupa resultados por nivel de logro y tipo de error.','Distingue barreras de comprensión, procedimiento y acceso.']},{title:'Decisiones',items:['Prioriza reenseñanza del punto con mayor frecuencia de error.','Forma grupos flexibles por necesidad.']},{title:'Seguimiento',items:['Recoge nueva evidencia tras el apoyo.','Compara progreso y ajusta intensidad.']}],
    comunicar:[{title:'Mensaje',items:['Comienza por avances observables.','Describe la necesidad de apoyo sin etiquetas ni juicios absolutos.']},{title:'Acuerdos',items:['Define una acción escolar y una acción posible en casa.','Asigna responsables y fecha de revisión.']},{title:'Cierre',items:['Verifica comprensión de los acuerdos.','Mantén lenguaje claro, respetuoso y profesional.']}],
  }
  return {title:`${modeTitle[mode]||'Profesor Virtual'} · ${level}`,summary:`Propuesta para ${subject}. Necesidad: ${prompt}. Apoyos considerados: ${support}.`,sections:sections[mode]||sections.planificar,pedagogicalChecks:['Objetivo común conservado','DUA/PIE sin estigmatizar','Instrucciones claras','Evidencia de aprendizaje incluida'],nextSteps:['Revisar y ajustar al curso real','Convertir la propuesta en recurso o evaluación','Registrar evidencia después de aplicar']}
}

export async function POST(request:Request){
  const supabase=await createClient()
  const claims=(await supabase.auth.getClaims()).data?.claims
  const userId=typeof claims?.sub==='string'?claims.sub:null
  if(!userId)return NextResponse.json({error:'No autenticado.'},{status:401})

  const body=await request.json().catch(()=>({})) as Record<string,unknown>
  const mode=modes.has(String(body.mode))?String(body.mode):'planificar'
  const prompt=clean(body.prompt,3000)
  const level=clean(body.level,100)||'3.º básico'
  const subject=clean(body.subject,160)||'Lenguaje y Comunicación'
  const support=clean(body.supportProfile,800)||'Acceso universal DUA'
  const duration=clean(body.duration,100)||'45 minutos'
  const objective=clean(body.objective,1200)
  const tone=clean(body.tone,80)||'profesional_claro'
  const depth=clean(body.depth,80)||'completo'
  if(!prompt)return NextResponse.json({error:'Describe la necesidad pedagógica.'},{status:400})

  const db=supabase as unknown as LooseDb
  const authorization=await db.rpc('authorize_ai_request',{p_mode:mode==='evaluar'?'assessment':'activity',p_file_count:0,p_largest_file_bytes:0,p_total_file_bytes:0,p_estimated_tokens:4500})
  if(authorization.error)return NextResponse.json({error:'No fue posible verificar el acceso a YOYO IA.'},{status:503})
  const auth=authorization.data||{}
  if(!auth.allowed||!auth.eventId)return NextResponse.json({error:'Tu plan no autoriza esta solicitud.',code:auth.code||'NOT_ALLOWED'},{status:403})

  const model=modelByTier[auth.modelTier||'essential']||modelByTier.essential
  const token=process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN
  if(!token){
    const result=fallback(mode,level,subject,prompt,support)
    await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'complete',p_model_route:'teacher-fallback',p_error_code:null})
    return NextResponse.json({result,model:'teacher-fallback',fallback:true})
  }

  const system=`Eres Profesor Virtual YOYO, copiloto pedagógico profesional de YoYoLetrasAI. Trabajas con currículum chileno, DUA, PIE y evaluación formativa. No inventes códigos OA oficiales. Mantén el objetivo común y diversifica acceso, participación y respuesta. Entrega acciones concretas, no teoría genérica. Tono: ${tone}. Profundidad: ${depth}. Devuelve exclusivamente JSON válido.`
  const user=`MODO: ${mode}\nNIVEL: ${level}\nASIGNATURA: ${subject}\nDURACIÓN: ${duration}\nOBJETIVO/OA/HABILIDAD: ${objective||'No especificado; no inventar código OA'}\nNECESIDADES Y APOYOS: ${support}\nSOLICITUD DOCENTE: ${prompt}\n\nDevuelve exactamente esta estructura: {"title":"...","summary":"...","sections":[{"title":"...","items":["..."]}],"pedagogicalChecks":["..."],"nextSteps":["..."]}`

  try{
    const response=await fetch('https://ai-gateway.vercel.sh/v1/chat/completions',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify({model,messages:[{role:'system',content:system},{role:'user',content:user}],max_tokens:Math.min(Number(auth.limits?.maxOutputTokens)||6000,12000),temperature:0.3}),signal:AbortSignal.timeout(90000)})
    const raw=await response.json() as any
    if(!response.ok)throw new Error(raw?.error?.message||'AI_GATEWAY_ERROR')
    const result=extractJson(String(raw?.choices?.[0]?.message?.content||''))
    await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'complete',p_model_route:model,p_error_code:null})
    return NextResponse.json({result,model,fallback:false})
  }catch(error){
    const result=fallback(mode,level,subject,prompt,support)
    await db.rpc('complete_ai_request',{p_event_id:auth.eventId,p_status:'complete',p_model_route:'teacher-fallback',p_error_code:error instanceof Error?error.message.slice(0,120):'TEACHER_FALLBACK'})
    return NextResponse.json({result,model:'teacher-fallback',fallback:true})
  }
}
