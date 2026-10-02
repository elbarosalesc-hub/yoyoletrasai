-- Security and performance hardening based on live Supabase advisors.
-- Safe, additive changes only. Apply first in preview.

alter function public.enforce_premium_resource_quality_gate()
  set search_path = '';

revoke all on function public.enforce_premium_resource_quality_gate() from public, anon, authenticated;
grant execute on function public.enforce_premium_resource_quality_gate() to service_role;

drop policy if exists "public read active ai plans" on public.ai_plans;
drop policy if exists "users read entitled ai plan" on public.ai_plans;

create policy "anon read active public ai plans"
on public.ai_plans
for select
to anon
using (active and is_public);

create policy "authenticated read available ai plans"
on public.ai_plans
for select
to authenticated
using (
  active
  and (
    is_public
    or exists (
      select 1
      from public.ai_entitlements e
      where e.user_id = (select auth.uid())
        and e.plan_id = ai_plans.id
        and e.status in ('active','trialing')
    )
  )
);

create index if not exists ai_eval_runs_case_id_idx
  on public.ai_eval_runs(case_id);

create index if not exists ai_eval_runs_generation_id_idx
  on public.ai_eval_runs(generation_id)
  where generation_id is not null;

create index if not exists ai_source_files_plan_id_idx
  on public.ai_source_files(plan_id);

create index if not exists automation_profiles_owner_id_idx
  on public.automation_profiles(owner_id);

create index if not exists automation_profiles_updated_by_idx
  on public.automation_profiles(updated_by)
  where updated_by is not null;

create index if not exists evolution_actions_approved_by_idx
  on public.evolution_actions(approved_by)
  where approved_by is not null;

create index if not exists evolution_actions_audit_run_id_idx
  on public.evolution_actions(audit_run_id)
  where audit_run_id is not null;

create index if not exists evolution_actions_finding_id_idx
  on public.evolution_actions(finding_id)
  where finding_id is not null;

create index if not exists platform_secret_store_configured_by_idx
  on public.platform_secret_store(configured_by)
  where configured_by is not null;

create index if not exists resource_candidates_created_by_idx
  on public.resource_candidates(created_by)
  where created_by is not null;

notify pgrst, 'reload schema';
