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

export type EvolutionTrigger = 'owner_manual' | 'system'

function average(values: number[]) {
  if (!values.length) return null
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
}

function qualityFlag(row: Row, flag: string) {
  const report = row.quality_report
  if (!report || typeof report !== 'object' || Array.isArray(report)) return null
  const value = (report as Record<string, unknown>)[flag]
  return typeof value === 'boolean' ? value : null
}

export async function runEvolutionAudit(db: EvolutionDb, organizationId: string, triggeredBy: EvolutionTrigger) {
  const started = await db.from('evolution_audit_runs').insert({
    organization_id: organizationId,
    scope: 'full',
    triggered_by: triggeredBy,
    status: 'running',
    started_at: new Date().toISOString(),
  }).select('id').single()
  if (started.error || !started.data?.id) throw new Error(started.error?.message || 'No fue posible iniciar la auditoría.')
  const auditId = String(started.data.id)

  try {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const [resources, generations, evals, benchmarks, findings] = await Promise.all([
      db.from('resource_candidates').select('id,status,quality_score,quality_report').eq('organization_id', organizationId),
      db.from('ai_generations').select('id,status,created_at').eq('organization_id', organizationId).gte('created_at', since30d),
      db.from('ai_eval_runs').select('score,status,created_at').eq('organization_id', organizationId).gte('created_at', since30d),
      db.from('evolution_benchmarks').select('competitor_score,yoyo_score,target_score,status').eq('organization_id', organizationId).eq('status', 'active'),
      db.from('innovation_findings').select('id,status,priority,created_at').eq('organization_id', organizationId),
    ])

    const resourceRows = resources.data || []
    const published = resourceRows.filter(row => row.status === 'published')
    const drafts = resourceRows.filter(row => row.status === 'draft' || row.status === 'review')
    const qualityValues = published.map(row => Number(row.quality_score)).filter(Number.isFinite)
    const accessibilityValues = published
      .map(row => qualityFlag(row, 'accessibility'))
      .filter((value): value is boolean => value !== null)
      .map(value => value ? 100 : 0)
    const generationRows = generations.data || []
    const completeGenerations = generationRows.filter(row => row.status === 'complete').length
    const failedGenerations = generationRows.filter(row => row.status === 'error').length
    const reliability = generationRows.length ? Math.round((completeGenerations / generationRows.length) * 100) : null
    const evalScores = (evals.data || []).map(row => Number(row.score)).filter(Number.isFinite)
    const benchmarkRows = benchmarks.data || []
    const measuredBenchmarks = benchmarkRows.filter(row => Number.isFinite(Number(row.yoyo_score)))
    const playableGames = gameExperiences.filter(game => game.status === 'playable').length
    const gameCoverage = gameExperiences.length ? Math.round((playableGames / gameExperiences.length) * 100) : 0

    const metrics = {
      automation: { trigger: triggeredBy, cadenceHours: 72, publication: 'human-review-required' },
      resources: { total: resourceRows.length, published: published.length, awaitingReview: drafts.length, averageQuality: average(qualityValues), averageAccessibility: average(accessibilityValues) },
      ai: { generations30d: generationRows.length, complete: completeGenerations, failed: failedGenerations, reliability, averageEvalScore: average(evalScores) },
      benchmarks: { active: benchmarkRows.length, measured: measuredBenchmarks.length },
      games: { playable: playableGames, catalog: gameExperiences.length, coverage: gameCoverage },
      findings: { total: (findings.data || []).length },
    }

    const proposals: Row[] = []
    const propose = (area:string,title:string,problem:string,recommendation:string,priority:number,impact:number,effort:number,risk:number) => proposals.push({organization_id:organizationId,audit_run_id:auditId,area,title,problem,recommendation,priority,impact_score:impact,effort_score:effort,risk_score:risk,status:'proposed'})
    if (!evalScores.length) propose('ai','Activar evaluación reproducible de YOYO IA','No existen evaluaciones recientes comparables.','Ejecutar casos de evaluación por planificación, adaptación, accesibilidad y evaluación.',95,95,45,20)
    if (reliability !== null && reliability < 98) propose('ai','Elevar fiabilidad de YOYO IA',`Fiabilidad observada: ${reliability}%.`,'Revisar errores, timeouts, JSON inválido, routing y fallbacks hasta alcanzar al menos 98%.',92,95,55,30)
    if (gameCoverage < 100) propose('games','Completar variedad real de juegos',`${playableGames} de ${gameExperiences.length} experiencias están jugables.`,'Completar las experiencias pendientes con mecánicas realmente distintas, niveles, feedback, audio opcional y accesibilidad.',90,95,80,35)
    if (benchmarkRows.length && measuredBenchmarks.length < benchmarkRows.length) propose('benchmark','Completar benchmark verificable','Existen referencias competitivas sin medición interna completa.','Medir YOYO con evidencia reproducible y actualizar fuentes antes de realizar claims comparativos.',82,80,50,15)
    if (published.length < 20) propose('resources','Ampliar biblioteca premium validada',`Hay ${published.length} recursos publicados y ${drafts.length} en borrador/revisión.`,'Generar candidatos en borrador según brechas curriculares y aprobar sólo los que superen calidad, accesibilidad, originalidad y revisión humana.',86,90,65,25)
    const avgQuality = average(qualityValues); if (avgQuality !== null && avgQuality < 96) propose('resources','Elevar calidad editorial de recursos',`Calidad promedio: ${avgQuality}.`,'Aplicar revisión automática y humana antes de publicar; corregir espacio, claridad, pauta, originalidad y consistencia.',88,90,60,20)
    const avgAccessibility = average(accessibilityValues); if (avgAccessibility !== null && avgAccessibility < 98) propose('accessibility','Elevar accesibilidad de recursos',`Accesibilidad promedio: ${avgAccessibility}.`,'Corregir contraste, lectura, alternativas, navegación y carga cognitiva hasta alcanzar el estándar interno.',94,95,60,15)

    if (proposals.length) {
      const existing = await db.from('evolution_actions').select('title,status').eq('organization_id', organizationId).in('status', ['proposed','approved','implementing'])
      const titles = new Set((existing.data || []).map(row => String(row.title)))
      const deduped = proposals.filter(row => !titles.has(String(row.title)))
      if (deduped.length) await db.from('evolution_actions').insert(deduped).select('id')
    }

    await db.from('evolution_audit_runs').update({ status:'completed', metrics, overall_score: Math.round([average(qualityValues)||80,average(accessibilityValues)||80,reliability||80,gameCoverage||0].reduce((a,b)=>a+b,0)/4), resource_score:average(qualityValues), accessibility_score:average(accessibilityValues), ai_score:reliability, games_score:gameCoverage, benchmark_score:benchmarkRows.length?Math.round(measuredBenchmarks.length/benchmarkRows.length*100):null, completed_at:new Date().toISOString(), executive_summary:`Auditoría YOYO completada. ${proposals.length} brecha(s) priorizadas antes de deduplicación; publicación automática deshabilitada.` }).eq('id', auditId)
    return { auditId, proposed: proposals.length, metrics }
  } catch (error) {
    await db.from('evolution_audit_runs').update({status:'failed',error_message:error instanceof Error?error.message.slice(0,500):'AUDIT_FAILED',completed_at:new Date().toISOString()}).eq('id',auditId)
    throw error
  }
}
