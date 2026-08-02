create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  first_name text not null check (char_length(first_name) between 1 and 80),
  last_name text not null check (char_length(last_name) between 1 and 120),
  preferred_name text,
  external_reference text,
  birth_date date,
  status text not null default 'active' check (status in ('active','inactive','graduated','transferred')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, external_reference)
);

create index if not exists students_organization_status_idx on public.students (organization_id, status, last_name, first_name);

create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  enrollment_status text not null default 'active' check (enrollment_status in ('active','withdrawn','completed')),
  enrolled_at date not null default current_date,
  withdrawn_at date,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (course_id, student_id)
);

create index if not exists course_enrollments_organization_idx on public.course_enrollments (organization_id, enrollment_status);
create index if not exists course_enrollments_course_idx on public.course_enrollments (course_id, enrollment_status);
create index if not exists course_enrollments_student_idx on public.course_enrollments (student_id, enrollment_status);

create table if not exists public.student_support_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  support_status text not null default 'monitoring' check (support_status in ('monitoring','active','closed')),
  strengths text,
  barriers text,
  interests text,
  access_accommodations text,
  objective_accommodations text,
  assistive_technology text,
  responsible_team text,
  evidence_notes text,
  sensitive_notes text,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id)
);

create index if not exists student_support_profiles_organization_idx on public.student_support_profiles (organization_id, support_status);

alter table public.students enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.student_support_profiles enable row level security;

revoke all on public.students from anon;
revoke all on public.course_enrollments from anon;
revoke all on public.student_support_profiles from anon;
grant select, insert, update on public.students to authenticated;
grant select, insert, update, delete on public.course_enrollments to authenticated;
grant select, insert, update on public.student_support_profiles to authenticated;

create policy "organization staff can read students" on public.students for select to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));
create policy "authorized staff can create students" on public.students for insert to authenticated
with check (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]) and created_by = (select auth.uid()));
create policy "authorized staff can update students" on public.students for update to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));

create policy "organization staff can read enrollments" on public.course_enrollments for select to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));
create policy "authorized staff can create enrollments" on public.course_enrollments for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
  and exists (select 1 from public.courses c where c.id = course_id and c.organization_id = organization_id)
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
);
create policy "authorized staff can update enrollments" on public.course_enrollments for update to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));
create policy "leaders can delete enrollments" on public.course_enrollments for delete to authenticated
using (private.has_organization_role(organization_id, array['utp','principal','institution_admin','platform_admin']::public.app_role[]));

create policy "pie team can read support profiles" on public.student_support_profiles for select to authenticated
using (private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));
create policy "pie team can create support profiles" on public.student_support_profiles for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
);
create policy "pie team can update support profiles" on public.student_support_profiles for update to authenticated
using (private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));

create trigger set_students_updated_at before update on public.students for each row execute function private.set_updated_at();
create trigger set_course_enrollments_updated_at before update on public.course_enrollments for each row execute function private.set_updated_at();
create trigger set_student_support_profiles_updated_at before update on public.student_support_profiles for each row execute function private.set_updated_at();