revoke all on table public.user_platform_preferences from anon;
revoke all on table public.user_platform_preferences from authenticated;
grant select, insert, update, delete on public.user_platform_preferences to authenticated;
grant all on public.user_platform_preferences to service_role;

drop policy if exists "users manage own platform preferences" on public.user_platform_preferences;
create policy "users manage own platform preferences"
on public.user_platform_preferences
for all
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
)
with check (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);


-- Harden the owner-only Evolution Center and remove the legacy Vercel trigger name.
alter table public.evolution_audit_runs
  drop constraint if exists evolution_audit_runs_triggered_by_check;

alter table public.evolution_audit_runs
  add constraint evolution_audit_runs_triggered_by_check
  check (triggered_by in ('owner_manual','system'));

revoke all on table
  public.evolution_audit_runs,
  public.evolution_benchmarks,
  public.evolution_actions,
  public.ai_eval_cases,
  public.ai_eval_runs
from anon;

revoke all on table
  public.evolution_audit_runs,
  public.evolution_benchmarks,
  public.evolution_actions,
  public.ai_eval_cases,
  public.ai_eval_runs
from authenticated;

grant select, insert, update, delete on table
  public.evolution_audit_runs,
  public.evolution_benchmarks,
  public.evolution_actions,
  public.ai_eval_cases,
  public.ai_eval_runs
to authenticated;

grant all on table
  public.evolution_audit_runs,
  public.evolution_benchmarks,
  public.evolution_actions,
  public.ai_eval_cases,
  public.ai_eval_runs
to service_role;

drop policy if exists "platform admins manage evolution audit runs" on public.evolution_audit_runs;
create policy "platform admins manage evolution audit runs"
on public.evolution_audit_runs for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

drop policy if exists "platform admins manage evolution benchmarks" on public.evolution_benchmarks;
create policy "platform admins manage evolution benchmarks"
on public.evolution_benchmarks for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

drop policy if exists "platform admins manage evolution actions" on public.evolution_actions;
create policy "platform admins manage evolution actions"
on public.evolution_actions for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

drop policy if exists "platform admins manage ai eval cases" on public.ai_eval_cases;
create policy "platform admins manage ai eval cases"
on public.ai_eval_cases for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

drop policy if exists "platform admins manage ai eval runs" on public.ai_eval_runs;
create policy "platform admins manage ai eval runs"
on public.ai_eval_runs for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

notify pgrst, 'reload schema';
