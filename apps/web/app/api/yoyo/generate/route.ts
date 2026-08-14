import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { createGateway } from '@ai-sdk/gateway'
import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'
import { SUPABASE_URL } from '@/lib/supabase/config'

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

export async function POST(request: Request) {
  const owner = await verifyOwner()
  if (!owner) return NextResponse.json({ error: 'Acceso propietario requerido.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })

  const body = await request.json().catch(() => ({})) as { prompt?: string; mode?: string }
  const prompt = String(body.prompt || '').trim().slice(0, 24000)
  const mode = String(body.mode || 'creation').trim().slice(0, 80)
  if (!prompt) return NextResponse.json({ error: 'Escribe una solicitud para YOYO IA.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })

  try {
    const apiKey = await loadGatewayKey()
    const gateway = createGateway({ apiKey })
    const result = await generateText({
      model: gateway('openai/gpt-5.6-sol'),
      system: `Eres YOYO IA, motor educativo exclusivo de YoYoLetrasAI para Chile. Trabajas con rigor pedagógico, currículo chileno, PIE, NEE y DUA. La cuenta actual es propietaria y tiene acceso interno ilimitado. Nunca inventes fuentes, citas, autores, estadísticas ni normativa. Si una afirmación necesita verificación actual y no tienes evidencia, indícalo. En creación pedagógica entrega productos completos, utilizables y profesionalmente estructurados. Modo actual: ${mode}.`,
      prompt,
      maxOutputTokens: 32000,
      temperature: 0.2,
      abortSignal: AbortSignal.timeout(110000),
      providerOptions: { gateway: { disallowPromptTraining: true, tags: ['yoyo-ia', 'owner-full', `mode:${mode}`] } },
    })
    return NextResponse.json({ engine: 'YOYO-IA-EDU-CL-001', version: '3.6.0-full', ownerUnlimited: true, text: result.text, usage: result.usage || null }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'GENERATION_FAILED'
    const friendly = message === 'YOYO_CREDENTIAL_REQUIRED'
      ? 'Falta guardar la clave privada de YOYO IA en el perfil propietario.'
      : 'YOYO IA no pudo completar la solicitud en este momento.'
    return NextResponse.json({ error: friendly, code: message }, { status: message === 'YOYO_CREDENTIAL_REQUIRED' ? 503 : 502, headers: { 'Cache-Control': 'no-store' } })
  }
}