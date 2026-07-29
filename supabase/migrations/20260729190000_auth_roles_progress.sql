create table if not exists public.student_accounts (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  student_id uuid not null unique references public.students(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.guardian_students (
  guardian_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  relationship text not null default 'Apoderado',
  created_at timestamptz not null default now(),
  primary key (guardian_id, student_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  code text not null unique,
  email text,
  full_name text not null,
  role text not null check (role in ('admin','teacher','student','guardian')),
  student_id uuid references public.students(id) on delete cascade,
  expires_at timestamptz not null default (now() + interval '14 days'),
  used_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.game_progress add column if not exists xp_earned integer not null default 0 check (xp_earned >= 0);
alter table public.game_progress add column if not exists correct_answers integer not null default 0 check (correct_answers >= 0);
alter table public.game_progress add column if not exists total_answers integer not null default 0 check (total_answers >= 0);
alter table public.game_progress add column if not exists last_played_at timestamptz not null default now();

alter table public.student_accounts enable row level security;
alter table public.guardian_students enable row level security;
alter table public.organization_invites enable row level security;

create or replace function public.current_role()
returns text language sql stable security definer set search_path=public as $$
  select role from public.profiles where id=auth.uid()
$$;

create or replace function public.current_student_id()
returns uuid language sql stable security definer set search_path=public as $$
  select student_id from public.student_accounts where profile_id=auth.uid()
$$;

create policy "users read own student account"
  on public.student_accounts for select
  using (
    profile_id=auth.uid()
    or (
      organization_id=public.current_organization_id()
      and public.current_role() in ('admin','teacher')
    )
  );

create policy "guardians read own links"
  on public.guardian_students for select
  using (
    guardian_id=auth.uid()
    or (
      organization_id=public.current_organization_id()
      and public.current_role() in ('admin','teacher')
    )
  );

create policy "admins manage student accounts"
  on public.student_accounts for all
  using (organization_id=public.current_organization_id() and public.current_role()='admin')
  with check (organization_id=public.current_organization_id() and public.current_role()='admin');

create policy "admins manage guardian links"
  on public.guardian_students for all
  using (organization_id=public.current_organization_id() and public.current_role()='admin')
  with check (organization_id=public.current_organization_id() and public.current_role()='admin');

create policy "admins manage organization invites"
  on public.organization_invites for all
  using (organization_id=public.current_organization_id() and public.current_role()='admin')
  with check (organization_id=public.current_organization_id() and public.current_role()='admin');

create or replace function public.handle_new_user_from_invite()
returns trigger
language plpgsql
security definer
set search_path=public
as $$
declare
  invite_record public.organization_invites%rowtype;
begin
  select * into invite_record
  from public.organization_invites
  where code=new.raw_user_meta_data->>'invite_code'
    and used_at is null
    and expires_at>now()
    and (email is null or lower(email)=lower(new.email))
  limit 1;

  if invite_record.id is null then
    return new;
  end if;

  insert into public.profiles(id,organization_id,full_name,role)
  values(new.id,invite_record.organization_id,coalesce(new.raw_user_meta_data->>'full_name',invite_record.full_name),invite_record.role)
  on conflict(id) do nothing;

  if invite_record.role='student' and invite_record.student_id is not null then
    insert into public.student_accounts(profile_id,student_id,organization_id)
    values(new.id,invite_record.student_id,invite_record.organization_id)
    on conflict do nothing;
  elsif invite_record.role='guardian' and invite_record.student_id is not null then
    insert into public.guardian_students(guardian_id,student_id,organization_id)
    values(new.id,invite_record.student_id,invite_record.organization_id)
    on conflict do nothing;
  end if;

  update public.organization_invites set used_at=now() where id=invite_record.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_from_invite on auth.users;
create trigger on_auth_user_created_from_invite
  after insert on auth.users
  for each row execute function public.handle_new_user_from_invite();

drop policy if exists "members read organization students" on public.students;
create policy "role scoped student access"
  on public.students for select
  using (
    organization_id=public.current_organization_id()
    and (
      public.current_role() in ('admin','teacher')
      or id=public.current_student_id()
      or exists(
        select 1 from public.guardian_students gs
        where gs.guardian_id=auth.uid() and gs.student_id=students.id
      )
    )
  );

create policy "teachers manage organization students"
  on public.students for all
  using (organization_id=public.current_organization_id() and public.current_role() in ('admin','teacher'))
  with check (organization_id=public.current_organization_id() and public.current_role() in ('admin','teacher'));

drop policy if exists "members read organization sessions" on public.learning_sessions;
create policy "role scoped learning sessions"
  on public.learning_sessions for select
  using (
    organization_id=public.current_organization_id()
    and (
      public.current_role() in ('admin','teacher')
      or student_id=public.current_student_id()
      or exists(
        select 1 from public.guardian_students gs
        where gs.guardian_id=auth.uid() and gs.student_id=learning_sessions.student_id
      )
    )
  );

drop policy if exists "members read organization achievements" on public.achievements;
create policy "role scoped achievements"
  on public.achievements for select
  using (
    organization_id=public.current_organization_id()
    and (
      public.current_role() in ('admin','teacher')
      or student_id=public.current_student_id()
      or exists(
        select 1 from public.guardian_students gs
        where gs.guardian_id=auth.uid() and gs.student_id=achievements.student_id
      )
    )
  );

drop policy if exists "members read organization game progress" on public.game_progress;
drop policy if exists "teachers manage organization game progress" on public.game_progress;
create policy "role scoped game progress read"
  on public.game_progress for select
  using (
    organization_id=public.current_organization_id()
    and (
      public.current_role() in ('admin','teacher')
      or student_id=public.current_student_id()
      or exists(
        select 1 from public.guardian_students gs
        where gs.guardian_id=auth.uid() and gs.student_id=game_progress.student_id
      )
    )
  );

create policy "teachers manage game progress"
  on public.game_progress for all
  using (organization_id=public.current_organization_id() and public.current_role() in ('admin','teacher'))
  with check (organization_id=public.current_organization_id() and public.current_role() in ('admin','teacher'));

insert into public.games(organization_id,title,slug,description,subject,level,skill,cover_tone,difficulty,is_published)
select null,'Bosque de las inferencias','bosque-inferencias','Misión 3D de comprensión lectora con pistas visuales y narración.','Lenguaje','3.º básico','Inferencias sencillas','forest',3,true
where not exists(select 1 from public.games where slug='bosque-inferencias' and organization_id is null);

create or replace function public.record_forest_mission_progress(
  p_progress integer,
  p_accuracy integer,
  p_minutes integer,
  p_xp integer,
  p_correct integer,
  p_total integer
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  target_student uuid;
  target_org uuid;
  target_game uuid;
begin
  select student_id,organization_id into target_student,target_org
  from public.student_accounts where profile_id=auth.uid();

  if target_student is null then
    return;
  end if;

  select id into target_game from public.games
  where slug='bosque-inferencias' and organization_id is null
  order by created_at limit 1;

  insert into public.game_progress(
    organization_id,game_id,student_id,progress_percent,current_level,accuracy_percent,
    minutes_played,xp_earned,correct_answers,total_answers,last_played_at,completed_at
  ) values(
    target_org,target_game,target_student,greatest(0,least(100,p_progress)),greatest(1,ceil(p_progress/34.0)::integer),
    greatest(0,least(100,p_accuracy)),greatest(0,p_minutes),greatest(0,p_xp),greatest(0,p_correct),greatest(0,p_total),now(),
    case when p_progress>=100 then now() else null end
  )
  on conflict(game_id,student_id) do update set
    progress_percent=greatest(game_progress.progress_percent,excluded.progress_percent),
    current_level=greatest(game_progress.current_level,excluded.current_level),
    accuracy_percent=excluded.accuracy_percent,
    minutes_played=greatest(game_progress.minutes_played,excluded.minutes_played),
    xp_earned=greatest(game_progress.xp_earned,excluded.xp_earned),
    correct_answers=greatest(game_progress.correct_answers,excluded.correct_answers),
    total_answers=greatest(game_progress.total_answers,excluded.total_answers),
    last_played_at=now(),
    completed_at=coalesce(game_progress.completed_at,excluded.completed_at),
    updated_at=now();
end;
$$;

grant execute on function public.record_forest_mission_progress(integer,integer,integer,integer,integer,integer) to authenticated;
