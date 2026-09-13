create table if not exists public.platform_resources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_by uuid references auth.users(id) on delete set null,
  resource_key text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, resource_key)
);

create table if not exists public.resource_factory_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  triggered_by text not null default 'system' check (triggered_by in ('system','owner_manual','scheduled')),
  status text not null default 'running' check (status in ('running','completed','failed')),
  requested_count integer not null default 0 check (requested_count >= 0),
  generated_count integer not null default 0 check (generated_count >= 0),
  published_count integer not null default 0 check (published_count >= 0),
  metadata jsonb not null default '{}'::jsonb,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.resource_candidates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  factory_run_id uuid references public.resource_factory_runs(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  resource_key text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  quality_score smallint check (quality_score between 0 and 100),
  quality_report jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','review','published','rejected')),
  published_resource_id uuid references public.platform_resources(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, resource_key)
);

create index if not exists platform_resources_org_updated_idx
  on public.platform_resources (organization_id, updated_at desc);
create index if not exists resource_factory_runs_org_started_idx
  on public.resource_factory_runs (organization_id, started_at desc);
create index if not exists resource_candidates_org_status_idx
  on public.resource_candidates (organization_id, status, created_at desc);
create index if not exists resource_candidates_factory_run_idx
  on public.resource_candidates (factory_run_id) where factory_run_id is not null;

alter table public.platform_resources enable row level security;
alter table public.resource_factory_runs enable row level security;
alter table public.resource_candidates enable row level security;

revoke all on table public.platform_resources, public.resource_factory_runs, public.resource_candidates from anon;
revoke all on table public.platform_resources, public.resource_factory_runs, public.resource_candidates from authenticated;

grant select on public.platform_resources to authenticated;
grant select, insert, update on public.resource_factory_runs to authenticated;
grant select, insert, update on public.resource_candidates to authenticated;
grant all on public.platform_resources, public.resource_factory_runs, public.resource_candidates to service_role;

-- The trigger function was introduced by an older migration. It remains in
-- public for compatibility, but it is not a callable Data API surface.
revoke all on function public.enforce_premium_resource_quality_gate() from public, anon, authenticated;
grant execute on function public.enforce_premium_resource_quality_gate() to service_role;

drop policy if exists "members can read platform resources" on public.platform_resources;
create policy "members can read platform resources"
on public.platform_resources for select to authenticated
using (private.is_organization_member(organization_id));

drop policy if exists "authorized staff can manage platform resources" on public.platform_resources;
create policy "authorized staff can manage platform resources"
on public.platform_resources for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
);

drop policy if exists "members can read resource factory runs" on public.resource_factory_runs;
create policy "members can read resource factory runs"
on public.resource_factory_runs for select to authenticated
using (private.is_organization_member(organization_id));

drop policy if exists "platform admins manage resource factory runs" on public.resource_factory_runs;
create policy "platform admins manage resource factory runs"
on public.resource_factory_runs for all to authenticated
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

drop policy if exists "members can read resource candidates" on public.resource_candidates;
create policy "members can read resource candidates"
on public.resource_candidates for select to authenticated
using (private.is_organization_member(organization_id));

drop policy if exists "platform admins manage resource candidates" on public.resource_candidates;
create policy "platform admins manage resource candidates"
on public.resource_candidates for all to authenticated
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

drop trigger if exists platform_resources_set_updated_at on public.platform_resources;
create trigger platform_resources_set_updated_at
before update on public.platform_resources
for each row execute function private.set_updated_at();

drop trigger if exists resource_candidates_set_updated_at on public.resource_candidates;
create trigger resource_candidates_set_updated_at
before update on public.resource_candidates
for each row execute function private.set_updated_at();

notify pgrst, 'reload schema';
