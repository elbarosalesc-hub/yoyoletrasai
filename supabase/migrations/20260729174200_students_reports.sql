create table if not exists public.student_support_profiles (
  student_id uuid primary key references public.students(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  support_category text,
  support_summary text,
  accommodations text[] not null default '{}',
  attendance_rate numeric not null default 100 check (attendance_rate between 0 and 100),
  updated_at timestamptz not null default now()
);

create table if not exists public.student_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  subject text not null,
  skill text not null,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  observed_at timestamptz not null default now()
);

create index if not exists student_progress_student_observed_idx
  on public.student_progress(student_id, observed_at desc);

alter table public.student_support_profiles enable row level security;
alter table public.student_progress enable row level security;

create policy "members read organization support profiles"
  on public.student_support_profiles for select
  using (organization_id=public.current_organization_id());

create policy "teachers manage organization support profiles"
  on public.student_support_profiles for all
  using (organization_id=public.current_organization_id())
  with check (organization_id=public.current_organization_id());

create policy "members read organization progress"
  on public.student_progress for select
  using (organization_id=public.current_organization_id());

create policy "teachers manage organization progress"
  on public.student_progress for all
  using (organization_id=public.current_organization_id())
  with check (organization_id=public.current_organization_id());

create or replace function public.teacher_students_overview()
returns table(
  student_id uuid,
  full_name text,
  group_name text,
  level text,
  support_category text,
  support_summary text,
  attendance_rate numeric,
  progress_percent integer,
  evidence_count bigint,
  last_observed_at timestamptz
)
language sql stable security definer set search_path=public as $$
  with org as (select public.current_organization_id() id),
  latest_progress as (
    select distinct on (student_id)
      student_id, progress_percent, observed_at
    from public.student_progress
    where organization_id=(select id from org)
    order by student_id, observed_at desc
  ),
  evidence as (
    select student_id, coalesce(sum(evidence_count),0)::bigint evidence_count
    from public.student_progress
    where organization_id=(select id from org)
    group by student_id
  )
  select
    s.id,
    s.full_name,
    coalesce(g.name,'Sin grupo'),
    coalesce(g.level,'Sin nivel'),
    coalesce(sp.support_category,'Apoyo general'),
    coalesce(sp.support_summary,'Sin observaciones registradas'),
    coalesce(sp.attendance_rate,100),
    coalesce(lp.progress_percent,0),
    coalesce(e.evidence_count,0),
    lp.observed_at
  from public.students s
  left join public.group_students gs on gs.student_id=s.id
  left join public.groups g on g.id=gs.group_id and g.teacher_id=auth.uid()
  left join public.student_support_profiles sp on sp.student_id=s.id
  left join latest_progress lp on lp.student_id=s.id
  left join evidence e on e.student_id=s.id
  where s.organization_id=(select id from org) and s.is_active
  order by s.full_name;
$$;

create or replace function public.teacher_reports_snapshot()
returns table(
  total_students bigint,
  on_track bigint,
  needs_attention bigint,
  pending_evidence bigint,
  average_progress numeric,
  average_attendance numeric,
  total_evidence bigint
)
language sql stable security definer set search_path=public as $$
  with students_overview as (
    select * from public.teacher_students_overview()
  )
  select
    count(*),
    count(*) filter(where progress_percent>=70),
    count(*) filter(where progress_percent<50 or attendance_rate<80),
    count(*) filter(where evidence_count=0),
    coalesce(round(avg(progress_percent),0),0),
    coalesce(round(avg(attendance_rate),0),0),
    coalesce(sum(evidence_count),0)
  from students_overview;
$$;

grant execute on function public.teacher_students_overview() to authenticated;
grant execute on function public.teacher_reports_snapshot() to authenticated;
