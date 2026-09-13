import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

const requiredTables = [
  'organizations',
  'user_platform_preferences',
  'learning_missions',
  'learning_mission_progress',
  'learning_evidence',
  'virtual_teacher_history',
] as const

type TableCheck = {
  table: string
  ok: boolean
  code: string | null
}

export async function GET() {
  try {
    const supabase = await createClient()
    const claims = (await supabase.auth.getClaims()).data?.claims
    const userId = typeof claims?.sub === 'string' ? claims.sub : null

    if (!userId) {
      return NextResponse.json({ ok: false, service: 'supabase', error: 'No autenticado.' }, { status: 401 })
    }

    const checks: TableCheck[] = []

    for (const table of requiredTables) {
      const { error } = await (supabase as any)
        .from(table)
        .select('*', { head: true, count: 'exact' })
        .limit(1)

      checks.push({
        table,
        ok: !error,
        code: error?.code || null,
      })
    }

    const missing = checks.filter(item => !item.ok).map(item => item.table)
    const ok = missing.length === 0

    return NextResponse.json({
      ok,
      service: 'supabase',
      schemaReady: ok,
      requiredTables: checks,
      missingOrInaccessible: missing,
    }, {
      status: ok ? 200 : 503,
      headers: { 'Cache-Control': 'private, no-store' },
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: 'supabase',
        schemaReady: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
    )
  }
}
