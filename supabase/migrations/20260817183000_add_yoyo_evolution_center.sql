create table if not exists public.evolution_audit_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  scope text not null check (scope in ('full','platform','ai','resources','games','accessibility','security','benchmark')),
  triggered_by text not null default 'owner_manual' check (triggered_by in ('owner_manual','system','vercel_cron')),
  status text not null default 'running' check (status in ('running','completed','failed')),
  executive_summary text,
  overall_score smallint check (overall_score between 0 and 100),
  platform_score smallint check (platform_score between 0 and 100),
  ai_score smallint check (ai_score between 0 and 100),
  resource_score smallint check (resource_score between 0 and 100),
  games_score smallint check (games_score between 0 and 100),
  accessibility_score smallint check (accessibility_score between 0 and 100),
  benchmark_score smallint check (benchmark_score between 0 and 100),
  metrics jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.evolution_benchmarks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  competitor text not null,
  category text not null,
  capability text not null,
  source_name text not null,
  source_url text not null check (source_url like 'https://%'),
  evidence text not null,
  competitor_score smallint check (competitor_score between 0 and 100),
  yoyo_score smallint check (yoyo_score between 0 and 100),
  target_score smallint check (target_score between 0 and 100),
  gap_score smallint generated always as (coalesce(target_score,0) - coalesce(yoyo_score,0)) stored,
  status text not null default 'active' check (status in ('active','stale','dismissed')),
  verified_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, competitor, category, capability)
);

create table if not exists public.evolution_actions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  audit_run_id uuid references public.evolution_audit_runs(id) on delete set null,
  finding_id uuid references public.innovation_findings(id) on delete set null,
  area text not null check (area in ('platform','ai','resources','games','accessibility','security','benchmark','operations')),
  title text not null,
  problem text not null,
  recommendation text not null,
  expected_impact text,
  priority smallint not null default 50 check (priority between 0 and 100),
  impact_score smallint check (impact_score between 0 and 100),
  effort_score smallint check (effort_score between 0 and 100),
  risk_score smallint check (risk_score between 0 and 100),
  status text not null default 'proposed' check (status in ('proposed','approved','implementing','validated','dismissed')),
  branch_name text,
  commit_sha text,
  pull_request_url text,
  validation jsonb not null default '{}'::jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  implemented_at timestamptz,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_eval_cases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_key text not null,
  category text not null check (category in ('generation','adaptation','analysis','assessment','writing','report','planning','multifile','safety','accessibility')),
  title text not null,
  description text,
  input_payload jsonb not null,
  expected_criteria jsonb not null,
  weight smallint not null default 100 check (weight between 1 and 100),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, case_key)
);

create table if not exists public.ai_eval_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  case_id uuid not null references public.ai_eval_cases(id) on delete cascade,
  generation_id uuid references public.ai_generations(id) on delete set null,
  model_route text not null,
  prompt_version text not null,
  status text not null default 'running' check (status in ('running','completed','failed')),
  score smallint check (score between 0 and 100),
  criteria_scores jsonb not null default '{}'::jsonb,
  latency_ms integer check (latency_ms is null or latency_ms >= 0),
  input_tokens integer check (input_tokens is null or input_tokens >= 0),
  output_tokens integer check (output_tokens is null or output_tokens >= 0),
  total_tokens integer check (total_tokens is null or total_tokens >= 0),
  notes text,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists evolution_audit_runs_org_created_idx on public.evolution_audit_runs (organization_id, created_at desc);
create index if not exists evolution_benchmarks_org_category_idx on public.evolution_benchmarks (organization_id, category, gap_score desc);
create index if not exists evolution_actions_org_status_idx on public.evolution_actions (organization_id, status, priority desc, created_at desc);
create index if not exists ai_eval_cases_org_active_idx on public.ai_eval_cases (organization_id, is_active, category);
create index if not exists ai_eval_runs_org_created_idx on public.ai_eval_runs (organization_id, created_at desc);

alter table public.evolution_audit_runs enable row level security;
alter table public.evolution_benchmarks enable row level security;
alter table public.evolution_actions enable row level security;
alter table public.ai_eval_cases enable row level security;
alter table public.ai_eval_runs enable row level security;

drop policy if exists "platform admins manage evolution audit runs" on public.evolution_audit_runs;
create policy "platform admins manage evolution audit runs" on public.evolution_audit_runs for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "platform admins manage evolution benchmarks" on public.evolution_benchmarks;
create policy "platform admins manage evolution benchmarks" on public.evolution_benchmarks for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "platform admins manage evolution actions" on public.evolution_actions;
create policy "platform admins manage evolution actions" on public.evolution_actions for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "platform admins manage ai eval cases" on public.ai_eval_cases;
create policy "platform admins manage ai eval cases" on public.ai_eval_cases for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());
drop policy if exists "platform admins manage ai eval runs" on public.ai_eval_runs;
create policy "platform admins manage ai eval runs" on public.ai_eval_runs for all to authenticated using (public.is_platform_admin()) with check (public.is_platform_admin());