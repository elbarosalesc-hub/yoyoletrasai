-- Bootstrap the resource factory before the historical quality gate and seeds.
-- These definitions are intentionally idempotent. A later migration hardens
-- grants, RLS policies, indexes and production installations that predate this file.
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

alter table public.platform_resources enable row level security;
alter table public.resource_factory_runs enable row level security;
alter table public.resource_candidates enable row level security;

create or replace function public.enforce_premium_resource_quality_gate()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.status = 'published' then
    if new.quality_score < 92 then
      raise exception 'Premium quality gate failed: score % is below 92', new.quality_score;
    end if;

    if coalesce((new.quality_report->>'curricularAlignment')::boolean, false) is not true
       or coalesce((new.quality_report->>'duaPie')::boolean, false) is not true
       or coalesce((new.quality_report->>'accessibility')::boolean, false) is not true
       or coalesce((new.quality_report->>'teacherVersion')::boolean, false) is not true
       or coalesce((new.quality_report->>'studentVersion')::boolean, false) is not true
       or coalesce((new.quality_report->>'answerKeyOrRubric')::boolean, false) is not true
       or coalesce((new.quality_report->>'editableReusable')::boolean, false) is not true
       or coalesce((new.quality_report->>'visualQuality')::boolean, false) is not true then
      raise exception 'Premium quality gate failed: mandatory quality dimensions are incomplete';
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_premium_resource_quality_gate() from public, anon, authenticated;
grant execute on function public.enforce_premium_resource_quality_gate() to service_role;

drop trigger if exists resource_candidates_premium_quality_gate on public.resource_candidates;
create trigger resource_candidates_premium_quality_gate
before insert or update of status, quality_score, quality_report
on public.resource_candidates
for each row
execute function public.enforce_premium_resource_quality_gate();
