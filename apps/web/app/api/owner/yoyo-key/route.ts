import crypto from 'node:crypto'
import { NextResponse } from 'next/server'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { SUPABASE_URL } from '@/lib/supabase/config'

export const dynamic = 'force-dynamic'

function adminClient() {
  const secret = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!secret) throw new Error('SUPABASE_ADMIN_NOT_CONFIGURED')
  return createAdminSupabase(SUPABASE_URL, secret, { auth: { persistSession: false, autoRefreshToken: false } })
}

function encryptionKey() {
  const raw = process.env.YOYO_CREDENTIAL_ENCRYPTION_KEY || process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  if (!raw) throw new Error('YOYO_ENCRYPTION_NOT_CONFIGURED')
  return crypto.createHash('sha256').update(`yoyo-credential-v1:${raw}`).digest()
}

async function requireOwner() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()
  if (error || !data.user) return null
  const admin = adminClient()
  const [{ data: membership }, { data: entitlement }] = await Promise.all([
    admin.from('organization_memberships').select('id').eq('user_id', data.user.id).eq('role', 'platform_admin').eq('is_active', true).maybeSingle(),
    admin.from('ai_entitlements').select('plan_id,status,period_end').eq('user_id', data.user.id).eq('plan_id', 'propietaria').in('status', ['active','trialing']).gt('period_end', new Date().toISOString()).maybeSingle(),
  ])
  return membership && entitlement ? { user: data.user, admin } : null
}

export async function GET() {
  const owner = await requireOwner()
  if (!owner) return NextResponse.json({ error: 'Acceso propietario requerido.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  if (process.env.AI_GATEWAY_API_KEY) return NextResponse.json({ configured: true, source: 'server_environment', lastFour: process.env.AI_GATEWAY_API_KEY.slice(-4) }, { headers: { 'Cache-Control': 'no-store' } })
  const { data } = await owner.admin.from('platform_secret_store').select('fingerprint,last_four,updated_at').eq('id','yoyo_ai_gateway').maybeSingle()
  return NextResponse.json({ configured: Boolean(data), source: data ? 'encrypted_owner_store' : 'not_configured', lastFour: data?.last_four || null, fingerprint: data?.fingerprint || null, updatedAt: data?.updated_at || null }, { headers: { 'Cache-Control': 'no-store' } })
}

export async function POST(request: Request) {
  const owner = await requireOwner()
  if (!owner) return NextResponse.json({ error: 'Acceso propietario requerido.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } })
  const body = await request.json().catch(() => ({})) as { key?: string }
  const value = String(body.key || '').trim()
  if (value.length < 20) return NextResponse.json({ error: 'La clave no parece válida.' }, { status: 400, headers: { 'Cache-Control': 'no-store' } })
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()
  const fingerprint = crypto.createHash('sha256').update(value).digest('hex').slice(0,12)
  const { error } = await owner.admin.from('platform_secret_store').upsert({
    id:'yoyo_ai_gateway', ciphertext:ciphertext.toString('base64'), iv:iv.toString('base64'), auth_tag:authTag.toString('base64'),
    fingerprint, last_four:value.slice(-4), configured_by:owner.user.id, updated_at:new Date().toISOString(),
  }, { onConflict:'id' })
  if (error) return NextResponse.json({ error:'No fue posible guardar la clave cifrada.' }, { status:500, headers:{'Cache-Control':'no-store'} })
  return NextResponse.json({ configured:true, source:'encrypted_owner_store', fingerprint, lastFour:value.slice(-4) }, { headers:{'Cache-Control':'no-store'} })
}