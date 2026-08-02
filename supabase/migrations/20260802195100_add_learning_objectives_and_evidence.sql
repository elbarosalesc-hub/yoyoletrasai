create table if not exists public.learning_objectives (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  subject text not null check (char_length(subject) between 2 and 80),
  code text not null check (char_length(code) between 1 and 40),
  title text not null check (char_length(title) between 2 and 200),
  description text,
  academic_year integer not null check (academic_year between 2000 and 2200),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, course_id, subject, code, academic_year)
);

create table if not exists public.learning_evidence (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  objective_id uuid not null references public.learning_objectives(id) on delete cascade,
  evidence_type text not null check (evidence_type in ('written','oral','performance','project','observation','assessment','other')),
  description text not null check (char_length(description) between 2 and 2000),
  achievement_level text not null check (achievement_level in ('achieved','developing','initial','not_observed')),
  support_used text,
  autonomy_level text check (autonomy_level in ('independent','partial_support','full_support','not_observed')),
  observed_at date not null default current_date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_objectives_org_year_idx on public.learning_objectives (organization_id, academic_year, is_active);
create index if not exists learning_objectives_course_idx on public.learning_objectives (course_id, is_active);
create index if not exists learning_objectives_created_by_idx on public.learning_objectives (created_by);
create index if not exists learning_evidence_org_student_idx on public.learning_evidence (organization_id, student_id, observed_at desc);
create index if not exists learning_evidence_student_idx on public.learning_evidence (student_id, observed_at desc);
create index if not exists learning_evidence_objective_idx on public.learning_evidence (objective_id, achievement_level);
create index if not exists learning_evidence_course_idx on public.learning_evidence (course_id, observed_at desc);
create index if not exists learning_evidence_created_by_idx on public.learning_evidence (created_by);

alter table public.learning_objectives enable row level security;
alter table public.learning_evidence enable row level security;
revoke all on public.learning_objectives from anon, authenticated;
revoke all on public.learning_evidence from anon, authenticated;
grant select, insert, update on public.learning_objectives to authenticated;
grant select, insert, update, delete on public.learning_evidence to authenticated;

drop policy if exists "staff can read learning objectives" on public.learning_objectives;
create policy "staff can read learning objectives" on public.learning_objectives for select to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));

drop policy if exists "staff can create learning objectives" on public.learning_objectives;
create policy "staff can create learning objectives" on public.learning_objectives for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
  and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.organization_id = organization_id))
);

drop policy if exists "staff can update learning objectives" on public.learning_objectives;
create policy "staff can update learning objectives" on public.learning_objectives for update to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.organization_id = organization_id))
);

drop policy if exists "staff can read learning evidence" on public.learning_evidence;
create policy "staff can read learning evidence" on public.learning_evidence for select to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));

drop policy if exists "staff can create learning evidence" on public.learning_evidence;
create policy "staff can create learning evidence" on public.learning_evidence for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
  and exists (select 1 from public.learning_objectives o where o.id = objective_id and o.organization_id = organization_id)
  and (course_id is null or exists (select 1 from public.courses c where c.id = course_id and c.organization_id = organization_id))
);

drop policy if exists "staff can update learning evidence" on public.learning_evidence;
create policy "staff can update learning evidence" on public.learning_evidence for update to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
  and exists (select 1 from public.learning_objectives o where o.id = objective_id and o.organization_id = organization_id)
);

drop policy if exists "leaders can delete learning evidence" on public.learning_evidence;
create policy "leaders can delete learning evidence" on public.learning_evidence for delete to authenticated
using (private.has_organization_role(organization_id, array['utp','principal','institution_admin','platform_admin']::public.app_role[]));

drop trigger if exists set_learning_objectives_updated_at on public.learning_objectives;
create trigger set_learning_objectives_updated_at before update on public.learning_objectives for each row execute function private.set_updated_at();
drop trigger if exists set_learning_evidence_updated_at on public.learning_evidence;
create trigger set_learning_evidence_updated_at before update on public.learning_evidence for each row execute function private.set_updated_at();
