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
  updated_at timestamptz not null default now(),
  constraint reports_scope_check check (
    (report_type = 'curso' and course_id is not null)
    or
    (report_type in ('familia','avance','pie') and student_id is not null)
  )
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
grant select on table public.report_versions to authenticated;
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

create policy "authorized staff create guardian links"
on public.student_guardians for insert to authenticated
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
  and exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = organization_id
      and m.user_id = guardian_user_id
      and m.role = 'guardian'::public.app_role
      and m.is_active = true
  )
);

create policy "authorized staff update guardian links"
on public.student_guardians for update to authenticated
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
  and exists (
    select 1 from public.students s
    where s.id = student_id
      and s.organization_id = organization_id
  )
  and exists (
    select 1
    from public.organization_memberships m
    where m.organization_id = organization_id
      and m.user_id = guardian_user_id
      and m.role = 'guardian'::public.app_role
      and m.is_active = true
  )
);

create policy "authorized staff delete guardian links"
on public.student_guardians for delete to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
);

create policy "staff read reports"
on public.reports for select to authenticated
using (
  (
    report_type = 'pie'
    and private.has_organization_role(
      organization_id,
      array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    )
  )
  or (
    report_type <> 'pie'
    and private.has_organization_role(
      organization_id,
      array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    )
  )
  or (
    status = 'approved'
    and report_type in ('familia','avance')
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
  (
    (report_type = 'pie' and private.has_organization_role(
      organization_id,
      array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    ))
    or
    (report_type <> 'pie' and private.has_organization_role(
      organization_id,
      array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    ))
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
    where o.id = objective_id
      and o.organization_id = organization_id
      and (course_id is null or o.course_id is null or o.course_id = course_id)
  ))
  and (
    course_id is null
    or student_id is null
    or exists (
      select 1 from public.course_enrollments e
      where e.organization_id = organization_id
        and e.course_id = course_id
        and e.student_id = student_id
        and e.enrollment_status = 'active'
    )
  )
  and (
    (status = 'approved' and approved_by = (select auth.uid()) and approved_at is not null)
    or (status = 'draft' and approved_by is null and approved_at is null)
    or status = 'archived'
  )
);

create policy "staff update reports"
on public.reports for update to authenticated
using (
  (
    report_type = 'pie'
    and private.has_organization_role(
      organization_id,
      array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    )
  )
  or (
    report_type <> 'pie'
    and private.has_organization_role(
      organization_id,
      array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    )
  )
)
with check (
  (
    (report_type = 'pie' and private.has_organization_role(
      organization_id,
      array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    ))
    or
    (report_type <> 'pie' and private.has_organization_role(
      organization_id,
      array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
    ))
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
    where o.id = objective_id
      and o.organization_id = organization_id
      and (course_id is null or o.course_id is null or o.course_id = course_id)
  ))
  and (
    course_id is null
    or student_id is null
    or exists (
      select 1 from public.course_enrollments e
      where e.organization_id = organization_id
        and e.course_id = course_id
        and e.student_id = student_id
        and e.enrollment_status = 'active'
    )
  )
  and (
    (status = 'approved' and approved_by = (select auth.uid()) and approved_at is not null)
    or (status = 'draft' and approved_by is null and approved_at is null)
    or status = 'archived'
  )
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
        (
          (r.report_type = 'pie' and private.has_organization_role(
            r.organization_id,
            array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
          ))
          or
          (r.report_type <> 'pie' and private.has_organization_role(
            r.organization_id,
            array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
          ))
        )
        or (
          r.status = 'approved'
          and report_versions.status_snapshot = 'approved'
          and r.report_type in ('familia','avance')
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
      and (
        (r.report_type = 'pie' and private.has_organization_role(
          r.organization_id,
          array['pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
        ))
        or
        (r.report_type <> 'pie' and private.has_organization_role(
          r.organization_id,
          array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
        ))
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
    where o.id = objective_id
      and o.organization_id = organization_id
      and (course_id is null or o.course_id is null or o.course_id = course_id)
  ))
  and (report_id is null or exists (
    select 1 from public.reports r
    where r.id = report_id
      and r.organization_id = organization_id
      and (student_id is null or r.student_id is null or r.student_id = student_id)
  ))
  and (
    course_id is null
    or student_id is null
    or exists (
      select 1 from public.course_enrollments e
      where e.organization_id = organization_id
        and e.course_id = course_id
        and e.student_id = student_id
        and e.enrollment_status = 'active'
    )
  )
  and status <> 'sent'
  and (
    (status = 'approved' and reviewed_by = (select auth.uid()) and reviewed_at is not null)
    or (status = 'draft' and reviewed_by is null and reviewed_at is null)
    or status = 'archived'
  )
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
    where o.id = objective_id
      and o.organization_id = organization_id
      and (course_id is null or o.course_id is null or o.course_id = course_id)
  ))
  and (report_id is null or exists (
    select 1 from public.reports r
    where r.id = report_id
      and r.organization_id = organization_id
      and (student_id is null or r.student_id is null or r.student_id = student_id)
  ))
  and (
    course_id is null
    or student_id is null
    or exists (
      select 1 from public.course_enrollments e
      where e.organization_id = organization_id
        and e.course_id = course_id
        and e.student_id = student_id
        and e.enrollment_status = 'active'
    )
  )
  and status <> 'sent'
  and (
    (status = 'approved' and reviewed_by = (select auth.uid()) and reviewed_at is not null)
    or (status = 'draft' and reviewed_by is null and reviewed_at is null)
    or status = 'archived'
  )
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

create or replace function private.enforce_report_integrity()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.organization_id <> old.organization_id or new.created_by <> old.created_by then
    raise exception 'REPORT_IDENTITY_IMMUTABLE';
  end if;
  if new.version <> old.version + 1 then
    raise exception 'REPORT_VERSION_MUST_INCREMENT';
  end if;
  return new;
end;
$function$;

revoke all on function private.enforce_report_integrity() from public, anon;
grant execute on function private.enforce_report_integrity() to authenticated, service_role;

drop trigger if exists reports_enforce_integrity on public.reports;
create trigger reports_enforce_integrity
before update on public.reports
for each row execute function private.enforce_report_integrity();

create or replace function private.capture_report_version()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.report_versions (
    report_id,
    organization_id,
    version,
    body,
    status_snapshot,
    created_by
  )
  values (
    new.id,
    new.organization_id,
    new.version,
    new.body,
    new.status,
    coalesce(auth.uid(), new.created_by)
  );
  return new;
end;
$function$;

revoke all on function private.capture_report_version() from public, anon, authenticated;

drop trigger if exists reports_capture_version on public.reports;
create trigger reports_capture_version
after insert or update on public.reports
for each row execute function private.capture_report_version();

create or replace function private.enforce_family_communication_integrity()
returns trigger
language plpgsql
set search_path = ''
as $function$
begin
  if new.organization_id <> old.organization_id or new.created_by <> old.created_by then
    raise exception 'COMMUNICATION_IDENTITY_IMMUTABLE';
  end if;
  return new;
end;
$function$;

revoke all on function private.enforce_family_communication_integrity() from public, anon;
grant execute on function private.enforce_family_communication_integrity() to authenticated, service_role;

drop trigger if exists family_communications_enforce_integrity on public.family_communications;
create trigger family_communications_enforce_integrity
before update on public.family_communications
for each row execute function private.enforce_family_communication_integrity();

drop trigger if exists reports_set_updated_at on public.reports;
create trigger reports_set_updated_at
before update on public.reports
for each row execute function private.set_updated_at();

drop trigger if exists family_communications_set_updated_at on public.family_communications;
create trigger family_communications_set_updated_at
before update on public.family_communications
for each row execute function private.set_updated_at();

create or replace function public.save_report(
  p_organization_id uuid,
  p_report_id uuid,
  p_report_type text,
  p_title text,
  p_period text,
  p_body text,
  p_status text,
  p_course_id uuid default null,
  p_student_id uuid default null,
  p_objective_id uuid default null
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_organization_id uuid := p_organization_id;
  v_report public.reports%rowtype;
  v_version integer;
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  if v_organization_id is null or not private.is_organization_member(v_organization_id) then
    raise exception 'ORGANIZATION_FORBIDDEN';
  end if;

  if p_report_type not in ('familia','avance','pie','curso') then
    raise exception 'INVALID_REPORT_TYPE';
  end if;

  if p_status not in ('draft','approved','archived') then
    raise exception 'INVALID_REPORT_STATUS';
  end if;

  if nullif(trim(p_title),'') is null or nullif(trim(p_body),'') is null then
    raise exception 'REPORT_CONTENT_REQUIRED';
  end if;

  if p_report_id is null then
    insert into public.reports (
      organization_id,
      course_id,
      student_id,
      objective_id,
      report_type,
      title,
      period,
      body,
      status,
      version,
      created_by,
      approved_by,
      approved_at,
      archived_at
    )
    values (
      v_organization_id,
      p_course_id,
      p_student_id,
      p_objective_id,
      p_report_type,
      trim(p_title),
      nullif(trim(p_period),''),
      p_body,
      p_status,
      1,
      v_user_id,
      case when p_status='approved' then v_user_id else null end,
      case when p_status='approved' then now() else null end,
      case when p_status='archived' then now() else null end
    )
    returning * into v_report;

    v_version := 1;
  else
    select *
    into v_report
    from public.reports
    where id = p_report_id
      and organization_id = v_organization_id
    for update;

    if not found then
      raise exception 'REPORT_NOT_FOUND';
    end if;

    if v_report.status = 'archived' then
      raise exception 'ARCHIVED_REPORT_IS_IMMUTABLE';
    end if;

    v_version := v_report.version + 1;

    update public.reports
    set course_id = p_course_id,
        student_id = p_student_id,
        objective_id = p_objective_id,
        report_type = p_report_type,
        title = trim(p_title),
        period = nullif(trim(p_period),''),
        body = p_body,
        status = p_status,
        version = v_version,
        approved_by = case when p_status='approved' then v_user_id when p_status='draft' then null else approved_by end,
        approved_at = case when p_status='approved' then now() when p_status='draft' then null else approved_at end,
        archived_at = case when p_status='archived' then now() else null end
    where id = p_report_id
    returning * into v_report;
  end if;

  return jsonb_build_object(
    'id', v_report.id,
    'version', v_version,
    'status', p_status,
    'updatedAt', v_report.updated_at
  );
end;
$function$;

revoke all on function public.save_report(
  uuid,uuid,text,text,text,text,text,uuid,uuid,uuid
) from public, anon;
grant execute on function public.save_report(
  uuid,uuid,text,text,text,text,text,uuid,uuid,uuid
) to authenticated, service_role;

notify pgrst, 'reload schema';
