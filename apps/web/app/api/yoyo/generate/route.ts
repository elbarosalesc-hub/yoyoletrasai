import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { createGateway } from '@ai-sdk/gateway'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { SUPABASE_URL } from '@/lib/supabase/config'
import { generateYoyoNative, yoyoRuntimeStatus } from '@/lib/ai/yoyo-runtime'
import { OFFICIAL_RESEARCH_POLICY, shouldSearchOfficialSources } from '@/lib/ai/official-sources'
import { officialSearchStatus, searchOfficialSources } from '@/lib/ai/official-search'

export const dynamic = 'force-dynamic'

function adminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!secret) throw new Error('SUPABASE_ADMIN_NOT_CONFIGURED')
  return createAdminSupabase(SUPABASE_URL, secret, { auth: { persistSession: false, autoRefreshToken: false } })
}

function encryptionMaterial() {
  const raw = process.env.YOYO_CREDENTIAL_ENCRYPTION_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!raw) throw new Error('YOYO_ENCRYPTION_NOT_CONFIGURED')
  return crypto.createHash('sha256').update(`yoyo-credential-v1:${raw}`).digest()
}

async function loadGatewayKey() {
  if (process.env.AI_GATEWAY_API_KEY) return process.env.AI_GATEWAY_API_KEY
  const admin = adminClient()
  const { data, error } = await admin.from('platform_secret_store').select('ciphertext, iv, auth_tag').eq('id', 'yoyo_ai_gateway').maybeSingle()
  if (error || !data) throw new Error('YOYO_CREDENTIAL_REQUIRED')
  const decipher = crypto.createDecipheriv('aes-256-gcm', encryptionMaterial(), Buffer.from(data.iv, 'base64'))
  decipher.setAuthTag(Buffer.from(data.auth_tag, 'base64'))
  return Buffer.concat([decipher.update(Buffer.from(data.ciphertext, 'base64')), decipher.final()]).toString('utf8')
}

async function verifyOwner() {
  const supabase = await createClient()
  const { data: userData, error: userError } = await supabase.auth.getUser()
  const user = userData.user
  if (userError || !user) return null
  const admin = adminClient()
  const [{ data: membership }, { data: entitlement }] = await Promise.all([
    admin.from('organization_memberships').select('id').eq('user_id', user.id).eq('role', 'platform_admin').eq('is_active', true).maybeSingle(),
    admin.from('ai_entitlements').select('plan_id,status,period_end').eq('user_id', user.id).eq('plan_id', 'propietaria').in('status', ['active', 'trialing']).gt('period_end', new Date().toISOString()).maybeSingle(),
  ])
  if (!membership || !entitlement) return null
  return user
}

async function externalFallback(system:string,prompt:string,mode:string){
  const apiKey=await loadGatewayKey()
  const gateway=createGateway({apiKey})
  const result=await generateText({
    model:gateway('openai/gpt-5.6-sol'),system,prompt,maxOutputTokens:32000,temperature:0.2,
    abortSignal:AbortSignal.timeout(110000),
    providerOptions:{gateway:{disallowPromptTraining:true,tags:['yoyo-ia','owner-full','external-fallback',`mode:${mode}`]}},
  })
  return {text:result.text,usage:result.usage||null,runtime:'external-fallback' as const,modelRoute:'openai/gpt-5.6-sol'}
}

export async function POST(request: Request) {
  const owner = await verifyOwner()
  if (!owner) return NextResponse.json({ error: 'Acceso propietario requerido.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })

  const body = await request.json().catch(() => ({})) as { prompt?: string; mode?: string }
  const prompt = String(body.prompt || '').trim().slice(0, 24000)
  const mode = String(body.mode || 'creation').trim().slice(0, 80)
  if (!prompt) return NextResponse.json({ error: 'Escribe una solicitud para YOYO IA.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })

  const mustResearch = shouldSearchOfficialSources(mode, prompt)
  const searchStatus = officialSearchStatus()
  let researchContext = ''
  let sources: { title: string; url: string; domain: string }[] = []
  let researchState: 'not-needed' | 'verified' | 'unavailable' | 'failed' = mustResearch ? 'unavailable' : 'not-needed'

  if (mustResearch) {
    if (searchStatus.configured) {
      try {
        const search = await searchOfficialSources(prompt)
        sources = search.sources
        researchContext = [
          'EVIDENCIA OFICIAL RECUPERADA PARA ESTA RESPUESTA:',
          search.text || 'Sin resumen adicional.',
          sources.length ? `FUENTES OFICIALES RECUPERADAS:\n${sources.map((source, index) => `${index + 1}. ${source.title} — ${source.url}`).join('\n')}` : 'No se recuperaron fuentes oficiales verificables.',
        ].join('\n\n')
        researchState = sources.length ? 'verified' : 'unavailable'
      } catch (error) {
        console.error('YOYO official research failed', { message: error instanceof Error ? error.message : 'unknown' })
        researchState = 'failed'
      }
    }

    if (researchState !== 'verified') {
      return NextResponse.json({
        error: 'YOYO IA necesita fuentes oficiales verificables para esta solicitud y la búsqueda oficial todavía no entregó evidencia suficiente. No generaré una respuesta factual sin respaldo.',
        code: 'OFFICIAL_SOURCES_REQUIRED',
        officialResearch: { required: true, state: researchState, searchConfigured: searchStatus.configured, sources: [] },
      }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
  }

  const system=`Eres YOYO IA, motor educativo exclusivo de YoYoLetrasAI para Chile. Trabajas con rigor pedagógico, currículo chileno, PIE, NEE y DUA. La cuenta actual es propietaria y tiene acceso interno ilimitado. ${OFFICIAL_RESEARCH_POLICY} En creación pedagógica entrega productos completos, utilizables y profesionalmente estructurados. Modo actual: ${mode}.`
  const groundedPrompt = researchContext ? `${researchContext}\n\nSOLICITUD DE LA USUARIA:\n${prompt}` : prompt

  try {
    const runtime=yoyoRuntimeStatus()
    let result
    if(runtime.configured){
      try{result=await generateYoyoNative({system,prompt:groundedPrompt,maxOutputTokens:32000})}
      catch(nativeError){
        if(!runtime.fallbackAllowed)throw nativeError
        console.error('YOYO native runtime unavailable; controlled fallback enabled',{message:nativeError instanceof Error?nativeError.message:'unknown'})
        result=await externalFallback(system,groundedPrompt,mode)
      }
    }else{
      if(!runtime.fallbackAllowed)throw new Error('YOYO_NATIVE_RUNTIME_REQUIRED')
      result=await externalFallback(system,groundedPrompt,mode)
    }
    return NextResponse.json({
      engine: 'YOYO-IA-EDU-CL-001',
      version: '3.6.0-full',
      ownerUnlimited: true,
      runtime:result.runtime,
      modelRoute:result.modelRoute,
      text: result.text,
      usage: result.usage || null,
      officialResearch: { required: mustResearch, state: researchState, searchConfigured: searchStatus.configured, sources },
    }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GENERATION_FAILED'
    const friendly = message === 'YOYO_CREDENTIAL_REQUIRED'
      ? 'Falta guardar la clave privada de YOYO IA en el perfil propietario.'
      : message === 'YOYO_NATIVE_RUNTIME_REQUIRED'
        ? 'YOYO Native Runtime está configurado como obligatorio y todavía no está disponible.'
        : 'YOYO IA no pudo completar la solicitud en este momento.'
    return NextResponse.json({ error: friendly, code: message }, { status: message === 'YOYO_CREDENTIAL_REQUIRED' ? 503 : 502, headers: { 'Cache-Control': 'no-store' } })
  }
}
