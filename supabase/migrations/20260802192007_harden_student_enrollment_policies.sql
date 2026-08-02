-- Sincroniza el endurecimiento aplicado en Supabase.
-- Las políticas validan que curso, estudiante y matrícula pertenezcan a la misma institución.

create index if not exists students_organization_status_idx
  on public.students (organization_id, status, last_name, first_name);
create index if not exists course_enrollments_organization_idx
  on public.course_enrollments (organization_id, enrollment_status);
create index if not exists course_enrollments_course_idx
  on public.course_enrollments (course_id, enrollment_status);
create index if not exists course_enrollments_student_idx
  on public.course_enrollments (student_id, enrollment_status);
create index if not exists student_support_profiles_organization_idx
  on public.student_support_profiles (organization_id, support_status);

drop policy if exists "authorized staff can create enrollments" on public.course_enrollments;
drop policy if exists "authorized staff can update enrollments" on public.course_enrollments;
drop policy if exists "pie team can create support profiles" on public.student_support_profiles;
drop policy if exists "pie team can update support profiles" on public.student_support_profiles;

create policy "authorized staff can create enrollments"
on public.course_enrollments for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
  and exists (select 1 from public.courses c where c.id = course_id and c.organization_id = course_enrollments.organization_id)
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = course_enrollments.organization_id)
);

create policy "authorized staff can update enrollments"
on public.course_enrollments for update to authenticated
using (private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (
  private.has_organization_role(organization_id, array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.courses c where c.id = course_id and c.organization_id = course_enrollments.organization_id)
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = course_enrollments.organization_id)
);

create policy "pie team can create support profiles"
on public.student_support_profiles for insert to authenticated
with check (
  private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and created_by = (select auth.uid())
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = student_support_profiles.organization_id)
);

create policy "pie team can update support profiles"
on public.student_support_profiles for update to authenticated
using (private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]))
with check (
  private.has_organization_role(organization_id, array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[])
  and exists (select 1 from public.students s where s.id = student_id and s.organization_id = student_support_profiles.organization_id)
);
