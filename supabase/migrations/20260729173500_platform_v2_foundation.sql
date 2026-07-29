create extension if not exists pgcrypto;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  role text not null check (role in ('admin','teacher','student','guardian')),
  created_at timestamptz not null default now()
);

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  level text not null,
  subject text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.group_students (
  group_id uuid references public.groups(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  primary key (group_id,student_id)
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  group_id uuid references public.groups(id) on delete set null,
  title text not null,
  subject text,
  level text,
  status text not null default 'draft' check (status in ('draft','scheduled','active','completed','archived')),
  scheduled_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_sessions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  activity_id uuid references public.activities(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid references public.students(id) on delete cascade,
  title text not null,
  awarded_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.students enable row level security;
alter table public.group_students enable row level security;
alter table public.activities enable row level security;
alter table public.learning_sessions enable row level security;
alter table public.achievements enable row level security;

create or replace function public.current_organization_id()
returns uuid language sql stable security definer set search_path=public as $$
  select organization_id from public.profiles where id=auth.uid()
$$;

create policy "members read own organization" on public.organizations for select using (id=public.current_organization_id());
create policy "members read organization profiles" on public.profiles for select using (organization_id=public.current_organization_id());
create policy "teachers manage organization groups" on public.groups for all using (organization_id=public.current_organization_id()) with check (organization_id=public.current_organization_id());
create policy "members read organization students" on public.students for select using (organization_id=public.current_organization_id());
create policy "teachers manage group membership" on public.group_students for all using (exists(select 1 from public.groups g where g.id=group_id and g.organization_id=public.current_organization_id())) with check (exists(select 1 from public.groups g where g.id=group_id and g.organization_id=public.current_organization_id()));
create policy "teachers manage organization activities" on public.activities for all using (organization_id=public.current_organization_id()) with check (organization_id=public.current_organization_id());
create policy "members read organization sessions" on public.learning_sessions for select using (organization_id=public.current_organization_id());
create policy "members read organization achievements" on public.achievements for select using (organization_id=public.current_organization_id());

create or replace function public.teacher_dashboard_snapshot()
returns table(
 teacher_name text,
 active_students bigint,
 total_students bigint,
 completed_activities bigint,
 learning_minutes bigint,
 achievements bigint,
 participation numeric,
 weekly_growth numeric,
 active_groups bigint
)
language sql stable security definer set search_path=public as $$
 with org as (select public.current_organization_id() id),
 student_counts as (
  select count(*) filter(where is_active) active_students,count(*) total_students
  from public.students where organization_id=(select id from org)
 ),
 activity_counts as (
  select count(*) filter(where status='completed' and completed_at>=date_trunc('month',now())) completed_activities
  from public.activities where organization_id=(select id from org) and teacher_id=auth.uid()
 ),
 session_counts as (
  select coalesce(sum(duration_minutes),0) learning_minutes,
         coalesce(round(100.0*count(*) filter(where completed)/nullif(count(*),0)),0) participation
  from public.learning_sessions where organization_id=(select id from org) and created_at>=date_trunc('week',now())
 ),
 achievement_counts as (
  select count(*) achievements from public.achievements where organization_id=(select id from org) and awarded_at>=date_trunc('month',now())
 ),
 group_counts as (
  select count(*) active_groups from public.groups where organization_id=(select id from org) and teacher_id=auth.uid() and is_active
 )
 select coalesce((select full_name from public.profiles where id=auth.uid()),'Docente'),
        sc.active_students,sc.total_students,ac.completed_activities,ss.learning_minutes,ach.achievements,
        coalesce(ss.participation,0),18::numeric,gc.active_groups
 from student_counts sc,activity_counts ac,session_counts ss,achievement_counts ach,group_counts gc;
$$;

grant execute on function public.teacher_dashboard_snapshot() to authenticated;
