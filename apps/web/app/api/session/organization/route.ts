import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 })

  const payload = await request.json().catch(() => null) as { organizationId?: string } | null
  const organizationId = payload?.organizationId
  if (!organizationId) return NextResponse.json({ error: 'Institución requerida' }, { status: 400 })

  const { data, error } = await supabase
    .from('organization_memberships')
    .select('organization_id')
    .eq('organization_id', organizationId)
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()

  if (error || !data) return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 })

  const response = NextResponse.json({ ok: true })
  response.cookies.set('yoyo-organization-id', organizationId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  return response
}
