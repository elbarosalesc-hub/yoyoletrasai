import { createHash } from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LooseClient = {
  rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { message?: string } | null }>
  from: (table: string) => {
    insert: (values: Record<string, unknown>) => { select: (columns: string) => { single: () => Promise<{ data: Record<string, unknown> | null; error: { message?: string } | null }> } }
    update: (values: Record<string, unknown>) => { eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }> }
  }
}

type RequestBody = {
  resourceType?: string
  title?: string
  subject?: string
  level?: string
  objective?: string
  supportProfile?: string
  visualStyle?: string
  sourceFiles?: Array<{ name: string; size: number; type?: string }>
  mode?: string
}

type AuthResult = {
  allowed?: boolean
  code?: string
  eventId?: string
  userId?: string
  organizationId?: string
  planId?: string
  planName?: string
  modelTier?: string
  ownerUnlimited?: boolean
  limits?: { maxOutputTokens?: number }
}

const modelByTier: Record<string, string> = {
  essential: process.env.YOYO_AI_MODEL_ESSENTIAL || 'google/gemini-3.6-flash',
  advanced: process.env.YOYO_AI_MODEL_ADVANCED || 'anthropic/claude-sonnet-5',
  institution: process.env.YOYO_AI_MODEL_INSTITUTION || 'anthropic/claude-sonnet-5',
  owner: process.env.YOYO_AI_MODEL_OWNER || 'openai/gpt-5.6-sol',
}

function safeText(value: unknown, max = 5000) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function mapMode(resourceType: string, requestedMode?: string) {
  if (requestedMode) return requestedMode
  const normalized = resourceType.toLowerCase()
  if (normalized.includes('evalu')) return 'assessment'
  if (normalized.includes('rúbrica') || normalized.includes('rubrica')) return 'assessment'
  if (normalized.includes('informe')) return 'report'
  if (normalized.includes('presentación') || normalized.includes('presentacion')) return 'presentation'
  if (normalized.includes('resumen')) return 'summary'
  if (normalized.includes('plan lector')) return 'reading_plan'
  if (normalized.includes('guía') || normalized.includes('guia')) return 'guide'
  if (normalized.includes('escritura')) return 'writing'
  return 'activity'
}

function buildPrompt(body: Required<Pick<RequestBody, 'resourceType' | 'title' | 'subject' | 'level' | 'objective' | 'supportProfile' | 'visualStyle'>>) {
  return `Eres el motor pedagógico YOYO IA de YoYoLetrasAI. Crea un recurso educativo chileno de calidad premium, listo para editar e imprimir.

REQUISITOS OBLIGATORIOS:
- Currículum chileno y lenguaje profesional docente.
- Mantener el mismo objetivo central para todo el curso; diversificar acceso, apoyos y formas de respuesta mediante DUA.
- Incorporar apoyos PIE/NEE sin estigmatizar ni separar al estudiante del objetivo común.
- Instrucciones breves, claras y evaluables.
- Progresión cognitiva y contextualización funcional.
- Incluir versión docente, versión estudiante y pauta/respuestas o criterios de logro.
- Evitar contenido de relleno, preguntas repetitivas y afirmaciones curriculares no verificables.
- Si falta un código OA exacto, describir el objetivo sin inventar código oficial.

CONFIGURACIÓN:
Tipo: ${body.resourceType}
Tema/título: ${body.title}
Asignatura: ${body.subject}
Nivel: ${body.level}
Objetivo: ${body.objective}
Perfil de apoyo: ${body.supportProfile}
Estilo visual: ${body.visualStyle}

Devuelve EXCLUSIVAMENTE JSON válido con esta forma:
{
  "title": "...",
  "summary": "...",
  "teacherVersion": {"purpose":"...","instructions":["..."],"activities":["..."],"assessment":"..."},
  "studentVersion": {"instructions":["..."],"activities":["..."]},
  "answerKey": ["..."],
  "duaSupports": ["..."],
  "accessibility": ["..."],
  "qualityChecklist": {"curricularAlignment":true,"duaPie":true,"accessibility":true,"teacherVersion":true,"studentVersion":true,"answerKeyOrRubric":true,"editableReusable":true,"visualQuality":true}
}`
}

function extractJson(text: string) {
  const trimmed = text.trim().replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim()
  return JSON.parse(trimmed) as Record<string, unknown>
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const db = supabase as unknown as LooseClient
  const body = (await request.json().catch(() => ({}))) as RequestBody

  const resourceType = safeText(body.resourceType, 120)
  const title = safeText(body.title, 300)
  const subject = safeText(body.subject, 120)
  const level = safeText(body.level, 80)
  const objective = safeText(body.objective, 2000)
  const supportProfile = safeText(body.supportProfile, 180) || 'Acceso universal DUA'
  const visualStyle = safeText(body.visualStyle, 180) || 'Infantil académico premium'

  if (!resourceType || !title || !subject || !level || !objective) {
    return NextResponse.json({ error: 'Faltan datos pedagógicos obligatorios.' }, { status: 400 })
  }

  const sourceFiles = Array.isArray(body.sourceFiles) ? body.sourceFiles.slice(0, 200) : []
  const fileCount = sourceFiles.length
  const largestFileBytes = sourceFiles.reduce((max, file) => Math.max(max, Number(file.size) || 0), 0)
  const totalFileBytes = sourceFiles.reduce((sum, file) => sum + Math.max(0, Number(file.size) || 0), 0)
  const mode = mapMode(resourceType, safeText(body.mode, 40))
  const estimatedTokens = Math.min(12000, 2200 + objective.length * 2 + fileCount * 300)

  const authorization = await db.rpc('authorize_ai_request', {
    p_mode: mode,
    p_file_count: fileCount,
    p_largest_file_bytes: largestFileBytes,
    p_total_file_bytes: totalFileBytes,
    p_estimated_tokens: estimatedTokens,
  })

  if (authorization.error) {
    return NextResponse.json({ error: 'No fue posible verificar el plan de YOYO IA.' }, { status: 503 })
  }

  const auth = (authorization.data ?? {}) as AuthResult
  if (!auth.allowed || !auth.eventId || !auth.organizationId || !auth.userId) {
    return NextResponse.json({ error: 'Solicitud no autorizada por el plan.', code: auth.code || 'NOT_ALLOWED' }, { status: 403 })
  }

  const model = modelByTier[auth.modelTier || 'essential'] || modelByTier.essential
  const gatewayToken = process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN
  if (!gatewayToken) {
    await db.rpc('complete_ai_request', { p_event_id: auth.eventId, p_status: 'error', p_model_route: model, p_error_code: 'GATEWAY_NOT_CONFIGURED' })
    return NextResponse.json({ error: 'El gateway de YOYO IA aún no está habilitado en este entorno.', code: 'GATEWAY_NOT_CONFIGURED' }, { status: 503 })
  }

  const prompt = buildPrompt({ resourceType, title, subject, level, objective, supportProfile, visualStyle })
  const generationKey = createHash('sha256').update(JSON.stringify({ mode, resourceType, title, subject, level, objective, supportProfile, visualStyle, sourceFiles: sourceFiles.map(({ name, size }) => ({ name, size })) })).digest('hex')
  const maxOutputTokens = Math.min(Number(auth.limits?.maxOutputTokens) || 8000, 32000)

  const generationInsert = await db.from('ai_generations').insert({
    organization_id: auth.organizationId,
    created_by: auth.userId,
    generation_key: generationKey,
    prompt_version: 'yoyo-premium-v2',
    model,
    status: 'pending',
    cache_source: 'none',
    input_payload: { mode, resourceType, title, subject, level, objective, supportProfile, visualStyle, sourceFiles: sourceFiles.map(({ name, size, type }) => ({ name, size, type })) },
  }).select('id').single()

  const generationId = typeof generationInsert.data?.id === 'string' ? generationInsert.data.id : null

  try {
    const gatewayResponse = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${gatewayToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: 'Responde únicamente JSON válido. No incluyas markdown ni explicación fuera del JSON.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxOutputTokens,
        temperature: 0.35,
      }),
      signal: AbortSignal.timeout(120000),
    })

    const raw = await gatewayResponse.json() as Record<string, any>
    if (!gatewayResponse.ok) throw new Error(typeof raw?.error?.message === 'string' ? raw.error.message : 'AI_GATEWAY_ERROR')

    const text = String(raw?.choices?.[0]?.message?.content || '')
    const output = extractJson(text)
    const usage = raw?.usage || {}
    const inputTokens = Number(usage.prompt_tokens || usage.input_tokens || 0)
    const outputTokens = Number(usage.completion_tokens || usage.output_tokens || 0)
    const totalTokens = Number(usage.total_tokens || inputTokens + outputTokens)

    await db.rpc('complete_ai_request', {
      p_event_id: auth.eventId,
      p_status: 'complete',
      p_model_route: model,
      p_token_usage: usage,
      p_input_tokens: inputTokens,
      p_output_tokens: outputTokens,
      p_total_tokens: totalTokens,
    })

    if (generationId) {
      await db.from('ai_generations').update({
        status: 'complete',
        output_payload: output,
        token_usage: usage,
        provider_metadata: { gateway: true, planId: auth.planId, modelTier: auth.modelTier },
        completed_at: new Date().toISOString(),
      }).eq('id', generationId)
    }

    return NextResponse.json({ output, modelTier: auth.modelTier, planName: auth.planName, ownerUnlimited: auth.ownerUnlimited, usage, generationId })
  } catch (error) {
    const message = error instanceof Error ? error.message.slice(0, 500) : 'GENERATION_FAILED'
    await db.rpc('complete_ai_request', { p_event_id: auth.eventId, p_status: 'error', p_model_route: model, p_error_code: 'GENERATION_FAILED' })
    if (generationId) await db.from('ai_generations').update({ status: 'error', error_message: message, completed_at: new Date().toISOString() }).eq('id', generationId)
    return NextResponse.json({ error: 'YOYO IA no pudo completar esta generación.', code: 'GENERATION_FAILED' }, { status: 502 })
  }
}
