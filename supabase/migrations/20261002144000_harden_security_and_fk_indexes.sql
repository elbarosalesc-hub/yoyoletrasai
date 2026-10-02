-- Security and performance hardening based on live Supabase advisors.
-- Safe, additive changes only. Apply first in preview.

alter function public.enforce_premium_resource_quality_gate()
  set search_path = '';

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


drop policy if exists "users read own ai entitlement" on public.ai_entitlements;
create policy "users read own ai entitlement"
on public.ai_entitlements
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

drop policy if exists "users read own ai usage" on public.ai_usage_events;
create policy "users read own ai usage"
on public.ai_usage_events
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

revoke all on function public.is_platform_admin() from public, anon, authenticated;
grant execute on function public.is_platform_admin() to service_role;

revoke all on function public.set_ai_entitlement(
  uuid,
  text,
  text,
  timestamptz
) from public, anon, authenticated;
grant execute on function public.set_ai_entitlement(
  uuid,
  text,
  text,
  timestamptz
) to service_role;


-- Retire legacy Supabase Cron jobs that still target the discontinued Vercel runtime.
do $
declare
  v_jobname text;
begin
  if to_regclass('cron.job') is not null then
    foreach v_jobname in array array[
      'yoyo-innovation-scan-monthly',
      'yoyo-resource-factory-weekly'
    ]
    loop
      if exists (select 1 from cron.job where jobname = v_jobname) then
        execute format('select cron.unschedule(%L)', v_jobname);
      end if;
    end loop;
  end if;
end
$;

drop function if exists private.invoke_yoyo_automation(text);


-- Strengthen AI source isolation by active organization membership.
drop policy if exists "users read own ai source files" on public.ai_source_files;
create policy "users read own ai source files"
on public.ai_source_files
for select
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop policy if exists "users update own ai source files" on public.ai_source_files;
create policy "users update own ai source files"
on public.ai_source_files
for update
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
)
with check (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop policy if exists "users delete own ai source files" on public.ai_source_files;
create policy "users delete own ai source files"
on public.ai_source_files
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop policy if exists "users read own yoyo ai sources" on storage.objects;
create policy "users read own yoyo ai sources"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

drop policy if exists "users upload own yoyo ai sources" on storage.objects;
create policy "users upload own yoyo ai sources"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

drop policy if exists "users update own yoyo ai sources" on storage.objects;
create policy "users update own yoyo ai sources"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
)
with check (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

drop policy if exists "users delete own yoyo ai sources" on storage.objects;
create policy "users delete own yoyo ai sources"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);


drop policy if exists "members read authorized institution subscriptions" on public.billing_subscriptions;
create policy "members read authorized institution subscriptions"
on public.billing_subscriptions
for select
to authenticated
using (
  plan_key = 'institution'
  and status = 'authorized'
  and private.is_organization_member(organization_id)
);

notify pgrst, 'reload schema';
