import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { gameExperiences } from '@/lib/games/catalog'

type Row = Record<string, unknown>
type QueryResult = Promise<{ data: Row[] | null; error: { message?: string } | null }>
type LooseQuery = {
  select: (columns: string) => LooseQuery
  eq: (column: string, value: string | boolean) => LooseQuery
  in: (column: string, values: string[]) => LooseQuery
  gte: (column: string, value: string) => LooseQuery
  order: (column: string, options?: Record<string, unknown>) => LooseQuery
  insert: (values: Row | Row[]) => { select: (columns: string) => { single: () => Promise<{ data: Row | null; error: { message?: string } | null }> } }
  update: (values: Row) => { eq: (column: string, value: string) => Promise<{ error: { message?: string } | null }> }
  then: QueryResult['then']
}
type LooseClient = {
  from: (table: string) => LooseQuery
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message?: string } | null }>
}

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export async function POST() {
  const supabase = await createClient()
  const db = supabase as unknown as LooseClient
  const claims = (await supabase.auth.getClaims()).data?.claims
  const userId = typeof claims?.sub === 'string' ? claims.sub : null
  if (!userId) return NextResponse.json({ error: 'No autenticado.' }, { status: 401 })

  const admin = await db.rpc('is_platform_admin')
  if (admin.error || admin.data !== true) return NextResponse.json({ error: 'Sólo el perfil propietario puede ejecutar esta auditoría.' }, { status: 403 })

  const organizationId = (await cookies()).get('yoyo-organization-id')?.value
  if (!organizationId) return NextResponse.json({ error: 'No hay institución activa.' }, { status: 400 })

  const started = await db.from('evolution_audit_runs').insert({ organization_id: organizationId, scope: 'full', triggered_by: 'owner_manual', status: 'running' }).select('id').single()
  if (started.error || !started.data?.id) return NextResponse.json({ error: 'No fue posible iniciar la auditoría.' }, { status: 500 })
  const auditId = String(started.data.id)

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [resourcesResult, generationsResult, evalsResult, benchmarksResult, findingsResult, actionsResult] = await Promise.all([
      db.from('resource_candidates').select('quality_score,quality_report,status').eq('organization_id', organizationId).eq('status', 'published'),
      db.from('ai_generations').select('status,created_at').eq('organization_id', organizationId).gte('created_at', since),
      db.from('ai_eval_runs').select('score,status,created_at').eq('organization_id', organizationId).eq('status', 'completed').order('created_at', { ascending: false }),
      db.from('evolution_benchmarks').select('competitor,category,yoyo_score,target_score,status,verified_at').eq('organization_id', organizationId).eq('status', 'active'),
      db.from('innovation_findings').select('status,score,category').eq('organization_id', organizationId).in('status', ['detected','candidate']),
      db.from('evolution_actions').select('title,status').eq('organization_id', organizationId).in('status', ['proposed','approved','implementing']),
    ])

    const resources = resourcesResult.data || []
    const qualityScores = resources.map(row => Number(row.quality_score || 0)).filter(Boolean)
    const resourceScore = average(qualityScores)
    const accessibleCount = resources.filter(row => (row.quality_report as Row | null)?.accessibility === true).length
    const accessibilityScore = resources.length ? Math.round(accessibleCount / resources.length * 100) : null

    const generations = generationsResult.data || []
    const completedGenerations = generations.filter(row => row.status === 'complete').length
    const failedGenerations = generations.filter(row => row.status === 'error').length
    const reliabilityBase = completedGenerations + failedGenerations
    const aiReliability = reliabilityBase ? Math.round(completedGenerations / reliabilityBase * 100) : null

    const evalScores = (evalsResult.data || []).map(row => Number(row.score || 0)).filter(Boolean)
    const aiEvalScore = average(evalScores)
    const aiScore = aiEvalScore ?? aiReliability

    const benchmarks = benchmarksResult.data || []
    const measuredBenchmarks = benchmarks.filter(row => typeof row.yoyo_score === 'number')
    const benchmarkScore = benchmarks.length ? Math.round(measuredBenchmarks.length / benchmarks.length * 100) : null

    const playableGames = gameExperiences.filter(game => game.status === 'playable').length
    const gameCoverageScore = Math.round(playableGames / gameExperiences.length * 100)
    const platformParts = [resourceScore, accessibilityScore, aiReliability].filter((value): value is number => value !== null)
    const platformScore = platformParts.length ? Math.round(platformParts.reduce((sum, value) => sum + value, 0) / platformParts.length) : null
    const scoreParts = [platformScore, aiScore, resourceScore, gameCoverageScore, accessibilityScore, benchmarkScore].filter((value): value is number => value !== null)
    const overallScore = scoreParts.length ? Math.round(scoreParts.reduce((sum, value) => sum + value, 0) / scoreParts.length) : null

    const metrics = {
      resources: { published: resources.length, averageQuality: resourceScore, accessible: accessibleCount },
      ai: { generations30d: generations.length, completed: completedGenerations, failed: failedGenerations, reliability: aiReliability, evalRuns: evalScores.length, evalScore: aiEvalScore },
      games: { playable: playableGames, catalog: gameExperiences.length, coverageScore: gameCoverageScore },
      benchmark: { capabilities: benchmarks.length, measured: measuredBenchmarks.length },
      innovation: { openFindings: (findingsResult.data || []).length },
    }

    await db.from('evolution_audit_runs').update({
      status: 'completed', executive_summary: `Auditoría integral completada: ${resources.length} recursos publicados, ${playableGames}/${gameExperiences.length} juegos jugables y ${measuredBenchmarks.length}/${benchmarks.length} capacidades benchmark medidas.`,
      overall_score: overallScore, platform_score: platformScore, ai_score: aiScore, resource_score: resourceScore, games_score: gameCoverageScore,
      accessibility_score: accessibilityScore, benchmark_score: benchmarkScore, metrics, completed_at: new Date().toISOString(),
    }).eq('id', auditId)

    const existingTitles = new Set((actionsResult.data || []).map(row => String(row.title)))
    const proposals: Row[] = []
    if (evalScores.length === 0) proposals.push({ area: 'ai', title: 'Ejecutar batería completa de evaluación YOYO IA', problem: 'No existen resultados comparables de la batería de evaluación.', recommendation: 'Ejecutar los casos activos contra las rutas de modelo y registrar score, latencia y tokens.', expected_impact: 'Permite comparar calidad entre versiones y modelos con evidencia reproducible.', priority: 100, impact_score: 100, effort_score: 45, risk_score: 15 })
    if (playableGames < 3) proposals.push({ area: 'games', title: 'Construir las próximas escenas 3D prioritarias', problem: `Sólo ${playableGames} de ${gameExperiences.length} experiencias del catálogo están jugables.`, recommendation: 'Implementar primero Feria matemática, Laboratorio de ecosistemas y Senderos de trazos con interacción WebGL, accesibilidad y analítica.', expected_impact: 'Aumenta variedad pedagógica y diferenciación frente a generadores de actividades planas.', priority: 92, impact_score: 95, effort_score: 80, risk_score: 30 })
    if (benchmarkScore !== 100) proposals.push({ area: 'benchmark', title: 'Completar medición reproducible contra benchmark', problem: `${measuredBenchmarks.length} de ${benchmarks.length} capacidades tienen score interno comparable.`, recommendation: 'Definir prueba verificable por capacidad y guardar yoyo_score únicamente después de ejecutarla.', expected_impact: 'Evita claims sin evidencia y orienta inversión hacia brechas reales.', priority: 96, impact_score: 100, effort_score: 55, risk_score: 10 })
    if (resourceScore !== null && resourceScore < 96) proposals.push({ area: 'resources', title: 'Elevar estándar medio de recursos premium a 96+', problem: `El promedio actual de calidad publicada es ${resourceScore}/100.`, recommendation: 'Reauditar recursos con foco en profundidad pedagógica, accesibilidad, valor visual, edición y reutilización antes de nuevas expansiones.', expected_impact: 'Mejora consistencia premium y reduce recursos apenas por encima del quality gate.', priority: 88, impact_score: 90, effort_score: 50, risk_score: 15 })

    const missing = proposals.filter(proposal => !existingTitles.has(String(proposal.title))).map(proposal => ({ ...proposal, organization_id: organizationId, audit_run_id: auditId, status: 'proposed' }))
    for (const proposal of missing) await db.from('evolution_actions').insert(proposal).select('id').single()

    return NextResponse.json({ auditId, scores: { overallScore, platformScore, aiScore, resourceScore, gameCoverageScore, accessibilityScore, benchmarkScore }, metrics, proposed: missing.length })
  } catch (error) {
    await db.from('evolution_audit_runs').update({ status: 'failed', error_message: error instanceof Error ? error.message.slice(0, 500) : 'AUDIT_FAILED', completed_at: new Date().toISOString() }).eq('id', auditId)
    return NextResponse.json({ error: 'La auditoría no pudo completarse.', auditId }, { status: 500 })
  }
}
