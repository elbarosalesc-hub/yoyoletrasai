create table if not exists public.student_guardians (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  student_id uuid not null references public.students(id) on delete cascade,
  guardian_user_id uuid not null references auth.users(id) on delete cascade,
  relationship text,
  is_active boolean not null default true,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (organization_id, student_id, guardian_user_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  objective_id uuid references public.learning_objectives(id) on delete set null,
  report_type text not null check (report_type in ('familia','avance','pie','curso')),
  title text not null,
  period text,
  body text not null default '',
  status text not null default 'draft' check (status in ('draft','approved','archived')),
  version integer not null default 1 check (version > 0),
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.report_versions (
  id uuid primary key default gen_random_uuid(),
  report_id uuid not null references public.reports(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  version integer not null check (version > 0),
  body text not null,
  status_snapshot text not null check (status_snapshot in ('draft','approved','archived')),
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  unique (report_id, version)
);

create table if not exists public.family_communications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  student_id uuid references public.students(id) on delete set null,
  objective_id uuid references public.learning_objectives(id) on delete set null,
  report_id uuid references public.reports(id) on delete set null,
  title text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft','approved','sent','archived')),
  channel text not null default 'manual' check (channel in ('manual','email','other')),
  created_by uuid not null references auth.users(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  sent_at timestamptz,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists student_guardians_guardian_idx
  on public.student_guardians (guardian_user_id, organization_id, is_active);
create index if not exists student_guardians_student_idx
  on public.student_guardians (student_id, organization_id, is_active);
create index if not exists reports_org_status_idx
  on public.reports (organization_id, status, updated_at desc);
create index if not exists reports_student_idx
  on public.reports (student_id, updated_at desc)
  where student_id is not null;
create index if not exists report_versions_report_idx
  on public.report_versions (report_id, version desc);
create index if not exists family_communications_org_status_idx
  on public.family_communications (organization_id, status, updated_at desc);
create index if not exists family_communications_student_idx
  on public.family_communications (student_id, updated_at desc)
  where student_id is not null;

alter table public.student_guardians enable row level security;
alter table public.reports enable row level security;
alter table public.report_versions enable row level security;
alter table public.family_communications enable row level security;

revoke all on table public.student_guardians, public.reports, public.report_versions, public.family_communications from anon;
revoke all on table public.student_guardians, public.reports, public.report_versions, public.family_communications from authenticated;

grant select, insert, update, delete on table public.student_guardians to authenticated;
grant select, insert, update, delete on table public.reports to authenticated;
grant select, insert on table public.report_versions to authenticated;
grant select, insert, update, delete on table public.family_communications to authenticated;

grant all on table public.student_guardians, public.reports, public.report_versions, public.family_communications to service_role;

create policy "staff read guardian links"
on public.student_guardians for select to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  or guardian_user_id = (select auth.uid())
);

create policy "authorized staff manage guardian links"
on public.student_guardians for all to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
  and created_by = (select auth.uid())
  and exists (
    select 1 from public.students s
    where s.id = student_id
      and s.organization_id = organization_id
  )
);

create policy "staff read reports"
on public.reports for select to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  or (
    status = 'approved'
    and student_id is not null
    and exists (
      select 1
      from public.student_guardians g
      where g.organization_id = reports.organization_id
        and g.student_id = reports.student_id
        and g.guardian_user_id = (select auth.uid())
        and g.is_active
    )
  )
);

create policy "staff create reports"
on public.reports for insert to authenticated
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and created_by = (select auth.uid())
  and (course_id is null or exists (
    select 1 from public.courses c
    where c.id = course_id and c.organization_id = organization_id
  ))
  and (student_id is null or exists (
    select 1 from public.students s
    where s.id = student_id and s.organization_id = organization_id
  ))
  and (objective_id is null or exists (
    select 1 from public.learning_objectives o
    where o.id = objective_id and o.organization_id = organization_id
  ))
);

create policy "staff update reports"
on public.reports for update to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and (course_id is null or exists (
    select 1 from public.courses c
    where c.id = course_id and c.organization_id = organization_id
  ))
  and (student_id is null or exists (
    select 1 from public.students s
    where s.id = student_id and s.organization_id = organization_id
  ))
  and (objective_id is null or exists (
    select 1 from public.learning_objectives o
    where o.id = objective_id and o.organization_id = organization_id
  ))
);

create policy "leadership delete draft reports"
on public.reports for delete to authenticated
using (
  status = 'draft'
  and private.has_organization_role(
    organization_id,
    array['utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
);

create policy "staff and authorized guardians read report versions"
on public.report_versions for select to authenticated
using (
  exists (
    select 1
    from public.reports r
    where r.id = report_versions.report_id
      and r.organization_id = report_versions.organization_id
      and (
        private.has_organization_role(
          r.organization_id,
          array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
        )
        or (
          r.status = 'approved'
          and r.student_id is not null
          and exists (
            select 1
            from public.student_guardians g
            where g.organization_id = r.organization_id
              and g.student_id = r.student_id
              and g.guardian_user_id = (select auth.uid())
              and g.is_active
          )
        )
      )
  )
);

create policy "staff append report versions"
on public.report_versions for insert to authenticated
with check (
  created_by = (select auth.uid())
  and exists (
    select 1
    from public.reports r
    where r.id = report_versions.report_id
      and r.organization_id = report_versions.organization_id
      and private.has_organization_role(
        r.organization_id,
        array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
      )
  )
);

create policy "staff read family communications"
on public.family_communications for select to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  or (
    status in ('approved','sent')
    and student_id is not null
    and exists (
      select 1
      from public.student_guardians g
      where g.organization_id = family_communications.organization_id
        and g.student_id = family_communications.student_id
        and g.guardian_user_id = (select auth.uid())
        and g.is_active
    )
  )
);

create policy "staff create family communications"
on public.family_communications for insert to authenticated
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and created_by = (select auth.uid())
  and (course_id is null or exists (
    select 1 from public.courses c
    where c.id = course_id and c.organization_id = organization_id
  ))
  and (student_id is null or exists (
    select 1 from public.students s
    where s.id = student_id and s.organization_id = organization_id
  ))
  and (objective_id is null or exists (
    select 1 from public.learning_objectives o
    where o.id = objective_id and o.organization_id = organization_id
  ))
);

create policy "staff update family communications"
on public.family_communications for update to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and (course_id is null or exists (
    select 1 from public.courses c
    where c.id = course_id and c.organization_id = organization_id
  ))
  and (student_id is null or exists (
    select 1 from public.students s
    where s.id = student_id and s.organization_id = organization_id
  ))
  and (objective_id is null or exists (
    select 1 from public.learning_objectives o
    where o.id = objective_id and o.organization_id = organization_id
  ))
);

create policy "leadership delete draft family communications"
on public.family_communications for delete to authenticated
using (
  status = 'draft'
  and private.has_organization_role(
    organization_id,
    array['utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
);

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function private.set_updated_at();

drop trigger if exists family_communications_set_updated_at on public.family_communications;
create trigger family_communications_set_updated_at
before update on public.family_communications
for each row execute function private.set_updated_at();

notify pgrst, 'reload schema';
