import { redirect } from 'next/navigation'
import { FlaskConical, ShieldCheck, Target } from 'lucide-react'
import { AppShell } from '@/components/AppShell'
import { EvolutionAuditButton } from '@/components/evolution/EvolutionAuditButton'
import { EvolutionScoreCards } from '@/components/evolution/EvolutionScoreCards'
import { EvolutionBenchmarkPanel } from '@/components/evolution/EvolutionBenchmarkPanel'
import { EvolutionBacklogPanel } from '@/components/evolution/EvolutionBacklogPanel'
import { requireOrganizationContext } from '@/lib/auth/organization-context'

export const dynamic = 'force-dynamic'
type Row = Record<string, unknown>
type QueryResult = Promise<{ data: Row[] | null; error: { message?: string } | null }>
type LooseQuery = { select:(columns:string)=>LooseQuery; eq:(column:string,value:string|boolean)=>LooseQuery; in:(column:string,values:string[])=>LooseQuery; order:(column:string,options?:Record<string,unknown>)=>LooseQuery; limit:(count:number)=>QueryResult; then:QueryResult['then'] }
type LooseClient = { from:(table:string)=>LooseQuery }

export default async function EvolutionCenter() {
  const context = await requireOrganizationContext('/evolucion')
  if (context.role !== 'platform_admin') redirect('/app')
  const db = context.supabase as unknown as LooseClient
  const orgId = context.organization.id
  const [auditsResult, benchmarksResult, actionsResult, evalCasesResult, evalRunsResult, findingsResult] = await Promise.all([
    db.from('evolution_audit_runs').select('id,status,executive_summary,overall_score,platform_score,ai_score,resource_score,games_score,accessibility_score,benchmark_score,metrics,created_at,completed_at').eq('organization_id',orgId).order('created_at',{ascending:false}).limit(5),
    db.from('evolution_benchmarks').select('competitor,category,capability,evidence,source_url,yoyo_score,target_score,status,verified_at').eq('organization_id',orgId).eq('status','active').order('competitor'),
    db.from('evolution_actions').select('id,area,title,problem,recommendation,expected_impact,priority,impact_score,effort_score,risk_score,status,branch_name,commit_sha,pull_request_url,validation,created_at').eq('organization_id',orgId).in('status',['proposed','approved','implementing','validated']).order('priority',{ascending:false}),
    db.from('ai_eval_cases').select('id,case_key,category,title,description,weight,is_active').eq('organization_id',orgId).eq('is_active',true).order('category'),
    db.from('ai_eval_runs').select('id,case_id,model_route,prompt_version,status,score,latency_ms,total_tokens,created_at').eq('organization_id',orgId).eq('status','completed').order('created_at',{ascending:false}).limit(30),
    db.from('innovation_findings').select('id,category,title,source_name,comparison,recommendation,expected_impact,score,status,created_at').eq('organization_id',orgId).in('status',['detected','candidate']).order('score',{ascending:false}),
  ])

  const latest=(auditsResult.data||[])[0]
  return <AppShell active="Evolución YOYO"><div className="evolution-center">
    <section className="evolution-hero"><div><span className="eyebrow">Propietaria · mejora continua gobernada</span><h1>Centro de Evolución YOYO</h1><p>Audita, compara, prioriza y valida la evolución de la plataforma, YOYO IA, recursos y juegos sin aplicar cambios directos a producción.</p><div className="evolution-hero-tags"><span><ShieldCheck size={15}/> Aprobación humana</span><span><FlaskConical size={15}/> Pruebas reproducibles</span><span><Target size={15}/> Benchmark con evidencia</span></div></div><div className="evolution-hero-action"><EvolutionAuditButton/><small>Todo cambio pasa por rama, CI, preview y aprobación propietaria.</small></div></section>
    <EvolutionScoreCards latest={latest}/>
    <EvolutionBenchmarkPanel benchmarks={benchmarksResult.data||[]} evalCases={evalCasesResult.data||[]} evalRuns={evalRunsResult.data||[]}/>
    <EvolutionBacklogPanel actions={actionsResult.data||[]} findings={findingsResult.data||[]}/>
  </div></AppShell>
}
