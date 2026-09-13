import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const allowedThemes = new Set(['purple','teal','coral','gold'])
const allowedTones = new Set(['profesional_claro','cercano','tecnico'])
const allowedDepth = new Set(['breve','completo','profundo'])

function text(value: unknown, max = 240) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export async function GET() {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })

  const [{ data: profile }, { data: preferences, error }] = await Promise.all([
    supabase.from('profiles').select('display_name,first_name,last_name').eq('id', userId).maybeSingle(),
    (supabase as any).from('user_platform_preferences').select('*').eq('user_id', userId).eq('organization_id', organizationId).maybeSingle(),
  ])
  if (error) return NextResponse.json({ error: 'No fue posible cargar tus preferencias.' }, { status: 503 })
  const fullName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ').trim()
  return NextResponse.json({
    displayName: preferences?.display_name || profile?.display_name || fullName || '',
    specialty: preferences?.specialty || '',
    country: preferences?.country || 'Chile',
    defaultLevel: preferences?.default_level || '3.º básico',
    defaultSubject: preferences?.default_subject || 'Lenguaje y Comunicación',
    defaultSupportProfile: preferences?.default_support_profile || 'Acceso universal DUA',
    preferredDuration: preferences?.preferred_duration || '45 minutos',
    theme: preferences?.theme || 'purple',
    audio: preferences?.audio_enabled ?? true,
    animations: preferences?.animations_enabled ?? true,
    reduced: preferences?.reduced_motion ?? false,
    contrast: preferences?.high_contrast ?? false,
    notifications: preferences?.notifications_enabled ?? true,
    aiApproval: preferences?.ai_approval_required ?? true,
    virtualTeacherTone: preferences?.virtual_teacher_tone || 'profesional_claro',
    virtualTeacherDepth: preferences?.virtual_teacher_depth || 'completo',
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}

export async function PUT(request: Request) {
  const supabase = await createClient()
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })
  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 409 })
  const body = await request.json().catch(() => ({})) as Record<string, unknown>

  const displayName = text(body.displayName, 120)
  const theme = allowedThemes.has(String(body.theme)) ? String(body.theme) : 'purple'
  const virtualTeacherTone = allowedTones.has(String(body.virtualTeacherTone)) ? String(body.virtualTeacherTone) : 'profesional_claro'
  const virtualTeacherDepth = allowedDepth.has(String(body.virtualTeacherDepth)) ? String(body.virtualTeacherDepth) : 'completo'
  const values = {
    user_id: userId,
    organization_id: organizationId,
    display_name: displayName || null,
    specialty: text(body.specialty, 160) || null,
    country: text(body.country, 80) || 'Chile',
    default_level: text(body.defaultLevel, 80) || '3.º básico',
    default_subject: text(body.defaultSubject, 120) || 'Lenguaje y Comunicación',
    default_support_profile: text(body.defaultSupportProfile, 240) || 'Acceso universal DUA',
    preferred_duration: text(body.preferredDuration, 80) || '45 minutos',
    theme,
    audio_enabled: body.audio !== false,
    animations_enabled: body.animations !== false,
    reduced_motion: body.reduced === true,
    high_contrast: body.contrast === true,
    notifications_enabled: body.notifications !== false,
    ai_approval_required: body.aiApproval !== false,
    virtual_teacher_tone: virtualTeacherTone,
    virtual_teacher_depth: virtualTeacherDepth,
    updated_at: new Date().toISOString(),
  }

  const { error } = await (supabase as any).from('user_platform_preferences').upsert(values, { onConflict: 'user_id,organization_id' })
  if (error) return NextResponse.json({ error: 'No fue posible guardar tus preferencias.' }, { status: 503 })
  if (displayName) await supabase.from('profiles').update({ display_name: displayName }).eq('id', userId)
  return NextResponse.json({ ok: true, updatedAt: values.updated_at })
}
