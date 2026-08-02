alter table public.students enable row level security;
alter table public.course_enrollments enable row level security;
alter table public.student_support_profiles enable row level security;

revoke all privileges on table public.students from anon, authenticated;
revoke all privileges on table public.course_enrollments from anon, authenticated;
revoke all privileges on table public.student_support_profiles from anon, authenticated;

grant select, insert, update on table public.students to authenticated;
grant select, insert, update, delete on table public.course_enrollments to authenticated;
grant select, insert, update on table public.student_support_profiles to authenticated;

drop policy if exists "organization staff can read students" on public.students;
drop policy if exists "authorized staff can create students" on public.students;
drop policy if exists "authorized staff can update students" on public.students;
create policy "organization staff can read students" on public.students for select to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));
create policy "authorized staff can create students" on public.students for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
);
create policy "authorized staff can update students" on public.students for update to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]));

drop policy if exists "organization staff can read enrollments" on public.course_enrollments;
drop policy if exists "authorized staff can create enrollments" on public.course_enrollments;
drop policy if exists "authorized staff can update enrollments" on public.course_enrollments;
drop policy if exists "leaders can delete enrollments" on public.course_enrollments;
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
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.courses c where c.id = course_id and c.organization_id = organization_id)
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
);
create policy "leaders can delete enrollments" on public.course_enrollments for delete to authenticated
using (private.has_organization_role(organization_id, array['utp','principal','institution_admin','platform_admin']::public.app_role[]));

drop policy if exists "pie team can read support profiles" on public.student_support_profiles;
drop policy if exists "pie team can create support profiles" on public.student_support_profiles;
drop policy if exists "pie team can update support profiles" on public.student_support_profiles;
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
with check (
  private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = organization_id)
);

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at before update on public.students for each row execute function private.set_updated_at();
drop trigger if exists set_course_enrollments_updated_at on public.course_enrollments;
create trigger set_course_enrollments_updated_at before update on public.course_enrollments for each row execute function private.set_updated_at();
drop trigger if exists set_student_support_profiles_updated_at on public.student_support_profiles;
create trigger set_student_support_profiles_updated_at before update on public.student_support_profiles for each row execute function private.set_updated_at();

create index if not exists students_created_by_idx on public.students (created_by) where created_by is not null;
create index if not exists course_enrollments_created_by_idx on public.course_enrollments (created_by) where created_by is not null;
create index if not exists student_support_profiles_created_by_idx on public.student_support_profiles (created_by) where created_by is not null;
create index if not exists student_support_profiles_updated_by_idx on public.student_support_profiles (updated_by) where updated_by is not null;