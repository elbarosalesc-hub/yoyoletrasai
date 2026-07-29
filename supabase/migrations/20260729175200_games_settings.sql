create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  subject text,
  level text,
  skill text,
  cover_tone text not null default 'violet',
  difficulty integer not null default 1 check (difficulty between 1 and 5),
  is_published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(organization_id, slug)
);

create table if not exists public.game_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  game_id uuid not null references public.games(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  current_level integer not null default 1 check (current_level >= 1),
  accuracy_percent integer not null default 0 check (accuracy_percent between 0 and 100),
  minutes_played integer not null default 0 check (minutes_played >= 0),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(game_id, student_id)
);

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  theme text not null default 'violet',
  audio_enabled boolean not null default true,
  animations_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  notifications_enabled boolean not null default true,
  ai_requires_approval boolean not null default true,
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_settings (
  organization_id uuid primary key references public.organizations(id) on delete cascade,
  country text not null default 'Chile',
  curriculum text not null default 'Bases Curriculares MINEDUC',
  primary_level text not null default 'Educación básica',
  timezone text not null default 'America/Santiago',
  data_retention_days integer not null default 730 check (data_retention_days >= 30),
  updated_at timestamptz not null default now()
);

alter table public.games enable row level security;
alter table public.game_progress enable row level security;
alter table public.user_preferences enable row level security;
alter table public.organization_settings enable row level security;

create policy "members read published and organization games"
  on public.games for select
  using (is_published and (organization_id is null or organization_id=public.current_organization_id()));

create policy "teachers manage organization games"
  on public.games for all
  using (organization_id=public.current_organization_id())
  with check (organization_id=public.current_organization_id());

create policy "members read organization game progress"
  on public.game_progress for select
  using (organization_id=public.current_organization_id());

create policy "teachers manage organization game progress"
  on public.game_progress for all
  using (organization_id=public.current_organization_id())
  with check (organization_id=public.current_organization_id());

create policy "users manage own preferences"
  on public.user_preferences for all
  using (user_id=auth.uid() and organization_id=public.current_organization_id())
  with check (user_id=auth.uid() and organization_id=public.current_organization_id());

create policy "members read organization settings"
  on public.organization_settings for select
  using (organization_id=public.current_organization_id());

create policy "admins manage organization settings"
  on public.organization_settings for all
  using (
    organization_id=public.current_organization_id()
    and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
  )
  with check (
    organization_id=public.current_organization_id()
    and exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')
  );

create or replace function public.teacher_games_snapshot()
returns table(
  published_games bigint,
  active_players bigint,
  average_progress numeric,
  minutes_played bigint,
  completed_missions bigint
)
language sql stable security definer set search_path=public as $$
  with org as (select public.current_organization_id() id)
  select
    (select count(*) from public.games g where g.is_published and (g.organization_id is null or g.organization_id=(select id from org))),
    count(distinct gp.student_id),
    coalesce(round(avg(gp.progress_percent),0),0),
    coalesce(sum(gp.minutes_played),0),
    count(*) filter(where gp.completed_at is not null)
  from public.game_progress gp
  where gp.organization_id=(select id from org);
$$;

grant execute on function public.teacher_games_snapshot() to authenticated;
