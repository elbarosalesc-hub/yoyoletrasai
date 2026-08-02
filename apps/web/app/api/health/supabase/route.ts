import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.from('organizations').select('id').limit(1)

    if (error) {
      return NextResponse.json(
        { ok: false, service: 'supabase', error: error.message },
        { status: 503 },
      )
    }

    return NextResponse.json({ ok: true, service: 'supabase' })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: 'supabase',
        error: error instanceof Error ? error.message : 'Error desconocido',
      },
      { status: 503 },
    )
  }
}
