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

export type EvolutionDb = {
  from: (table: string) => LooseQuery
  rpc: (fn: string, args?: Record<string, unknown>) => Promise<{ data: unknown; error: { message?: string } | null }>
}

export type EvolutionTrigger = 'owner_manual' | 'system' | 'vercel_cron'

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

export async function runEvolutionAudit(db: EvolutionDb, organizationId: string, triggeredBy: EvolutionTrigger) {
  const started = await db.from('evolution_audit_runs').insert({
    organization_id: organizationId,
    scope: 'full',
    triggered_by: triggeredBy,
    status: 'running',
  }).select('id').single()

  if (started.error || !started.data?.id) throw new Error('No fue posible iniciar la auditoría.')
  const auditId = String(started.data.id)

  try {
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [resourcesResult, generationsResult, evalsResult, benchmarksResult, findingsResult, actionsResult] = await Promise.all([
      db.from('resource_candidates').select('quality_score,quality_report,status').eq('organization_id', organizationId).eq('status', 'published'),
      db.from('ai_generations').select('status,created_at').eq('organization_id', organizationId).gte('created_at', since),
      db.from('ai_eval_runs').select('score,status,created_at').eq('organization_id', organizationId).eq('status', 'completed').order('created_at', { ascending: false }),
      db.from('evolution_benchmarks').select('competitor,category,yoyo_score,target_score,status,verified_at').eq('organization_id', organizationId).eq('status', 'active'),
      db.from('innovation_findings').select('status,score,category').eq('organization_id', organizationId).in('status', ['detected', 'candidate']),
      db.from('evolution_actions').select('title,status').eq('organization_id', organizationId).in('status', ['proposed', 'approved', 'implementing']),
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
    const gameCoverageScore = gameExperiences.length ? Math.round(playableGames / gameExperiences.length * 100) : 0
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
      automation: { trigger: triggeredBy, cadenceHours: 72 },
    }

    await db.from('evolution_audit_runs').update({
      status: 'completed',
      executive_summary: `Auditoría integral completada: ${resources.length} recursos publicados, ${playableGames}/${gameExperiences.length} juegos jugables y ${measuredBenchmarks.length}/${benchmarks.length} capacidades benchmark medidas.`,
      overall_score: overallScore,
      platform_score: platformScore,
      ai_score: aiScore,
      resource_score: resourceScore,
      games_score: gameCoverageScore,
      accessibility_score: accessibilityScore,
      benchmark_score: benchmarkScore,
      metrics,
      completed_at: new Date().toISOString(),
    }).eq('id', auditId)

    const existingTitles = new Set((actionsResult.data || []).map(row => String(row.title)))
    const proposals: Row[] = []

    if (evalScores.length === 0) proposals.push({ area: 'ai', title: 'Ejecutar batería completa de evaluación YOYO IA', problem: 'No existen resultados comparables de la batería de evaluación.', recommendation: 'Ejecutar los casos activos contra las rutas de modelo y registrar score, latencia y tokens.', expected_impact: 'Permite comparar calidad entre versiones y modelos con evidencia reproducible.', priority: 100, impact_score: 100, effort_score: 45, risk_score: 15 })
    if (aiReliability !== null && aiReliability < 98) proposals.push({ area: 'ai', title: 'Elevar confiabilidad operativa de YOYO IA a 98%+', problem: `La confiabilidad de generaciones de los últimos 30 días es ${aiReliability}%.`, recommendation: 'Revisar rutas con error, timeouts, validación JSON y fallbacks por modelo antes de ampliar volumen.', expected_impact: 'Reduce fallas visibles y mejora continuidad de generación para docentes.', priority: 97, impact_score: 98, effort_score: 55, risk_score: 20 })
    if (gameCoverageScore < 70) proposals.push({ area: 'games', title: 'Expandir variedad jugable 3D y mecánicas pedagógicas', problem: `La cobertura jugable es ${playableGames}/${gameExperiences.length} (${gameCoverageScore}%).`, recommendation: 'Priorizar experiencias con mecánicas distintas: exploración, clasificación, carrera de precisión, laboratorio, escape room y desafío colaborativo; cada una con niveles, feedback, sonido opcional y accesibilidad.', expected_impact: 'Aumenta variedad real y evita repetir el mismo juego con distinto contenido.', priority: 94, impact_score: 96, effort_score: 78, risk_score: 28 })
    if (benchmarkScore !== 100) proposals.push({ area: 'benchmark', title: 'Completar medición reproducible contra benchmark', problem: `${measuredBenchmarks.length} de ${benchmarks.length} capacidades tienen score interno comparable.`, recommendation: 'Definir prueba verificable por capacidad y guardar yoyo_score únicamente después de ejecutarla.', expected_impact: 'Evita claims sin evidencia y orienta inversión hacia brechas reales.', priority: 96, impact_score: 100, effort_score: 55, risk_score: 10 })
    if (resources.length < 20) proposals.push({ area: 'resources', title: 'Expandir biblioteca premium con cobertura curricular y formatos diversos', problem: `Actualmente existen ${resources.length} recursos publicados medidos por el centro de evolución.`, recommendation: 'Aumentar cobertura por nivel, asignatura, OA/habilidad y formato, evitando plantillas repetidas y exigiendo quality gate antes de publicar.', expected_impact: 'Aumenta utilidad diaria y profundidad de la biblioteca sin sacrificar estándar.', priority: 91, impact_score: 94, effort_score: 60, risk_score: 18 })
    if (resourceScore !== null && resourceScore < 96) proposals.push({ area: 'resources', title: 'Elevar estándar medio de recursos premium a 96+', problem: `El promedio actual de calidad publicada es ${resourceScore}/100.`, recommendation: 'Reauditar recursos con foco en profundidad pedagógica, accesibilidad, valor visual, edición y reutilización antes de nuevas expansiones.', expected_impact: 'Mejora consistencia premium y reduce recursos apenas por encima del quality gate.', priority: 88, impact_score: 90, effort_score: 50, risk_score: 15 })
    if (accessibilityScore !== null && accessibilityScore < 98) proposals.push({ area: 'accessibility', title: 'Llevar accesibilidad de recursos publicados a 98%+', problem: `La cobertura de accesibilidad medida es ${accessibilityScore}%.`, recommendation: 'Corregir contraste, estructura, instrucciones, alternativas de respuesta y compatibilidad con apoyos DUA/PIE antes de republicar.', expected_impact: 'Mejora acceso universal y reduce necesidad de rehacer materiales caso a caso.', priority: 93, impact_score: 96, effort_score: 50, risk_score: 12 })

    const missing = proposals.filter(proposal => !existingTitles.has(String(proposal.title))).map(proposal => ({ ...proposal, organization_id: organizationId, audit_run_id: auditId, status: 'proposed' }))
    for (const proposal of missing) await db.from('evolution_actions').insert(proposal).select('id').single()

    return { auditId, scores: { overallScore, platformScore, aiScore, resourceScore, gameCoverageScore, accessibilityScore, benchmarkScore }, metrics, proposed: missing.length }
  } catch (error) {
    await db.from('evolution_audit_runs').update({ status: 'failed', error_message: error instanceof Error ? error.message.slice(0, 500) : 'AUDIT_FAILED', completed_at: new Date().toISOString() }).eq('id', auditId)
    throw error
  }
}
