create table if not exists public.learning_missions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  objective_id uuid references public.learning_objectives(id) on delete set null,
  title text not null check (char_length(title) between 2 and 180),
  description text,
  experience_type text not null check (experience_type in ('resource','assessment','game','lesson','project','practice')),
  source_href text,
  support_profile text,
  differentiation jsonb not null default '{}'::jsonb,
  due_at timestamptz,
  status text not null default 'draft' check (status in ('draft','assigned','closed','archived')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.learning_mission_progress (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mission_id uuid not null references public.learning_missions(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  status text not null default 'assigned' check (status in ('assigned','in_progress','completed','needs_support')),
  progress smallint not null default 0 check (progress between 0 and 100),
  support_used text,
  evidence_note text,
  last_activity_at timestamptz,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, student_id)
);

create index if not exists learning_missions_org_course_idx on public.learning_missions (organization_id, course_id, status, created_at desc);
create index if not exists learning_mission_progress_mission_idx on public.learning_mission_progress (mission_id, status, progress);
create index if not exists learning_mission_progress_student_idx on public.learning_mission_progress (student_id, updated_at desc);

alter table public.learning_missions enable row level security;
alter table public.learning_mission_progress enable row level security;
revoke all on public.learning_missions from anon, authenticated;
revoke all on public.learning_mission_progress from anon, authenticated;
grant select, insert, update, delete on public.learning_missions to authenticated;
grant select, insert, update, delete on public.learning_mission_progress to authenticated;

drop policy if exists "staff can manage learning missions" on public.learning_missions;
create policy "staff can manage learning missions" on public.learning_missions for all to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.courses c where c.id = course_id and c.organization_id = organization_id)
  and (objective_id is null or exists (select 1 from public.learning_objectives o where o.id = objective_id and o.organization_id = organization_id))
);

drop policy if exists "staff can manage mission progress" on public.learning_mission_progress;
create policy "staff can manage mission progress" on public.learning_mission_progress for all to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.learning_missions m where m.id = mission_id and m.organization_id = organization_id)
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
);

drop trigger if exists set_learning_missions_updated_at on public.learning_missions;
create trigger set_learning_missions_updated_at before update on public.learning_missions for each row execute function private.set_updated_at();
drop trigger if exists set_learning_mission_progress_updated_at on public.learning_mission_progress;
create trigger set_learning_mission_progress_updated_at before update on public.learning_mission_progress for each row execute function private.set_updated_at();
