create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  recipient_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  type text not null default 'info' check (type in ('info','success','warning','urgent')),
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.role_permissions (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role text not null check (role in ('admin','teacher','student','guardian')),
  permission text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  primary key (organization_id,role,permission)
);

create index if not exists notifications_recipient_created_idx on public.notifications(recipient_id,created_at desc);
create index if not exists audit_logs_org_created_idx on public.audit_logs(organization_id,created_at desc);

alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;
alter table public.role_permissions enable row level security;

create policy "users read own notifications"
  on public.notifications for select
  using (
    organization_id=public.current_organization_id()
    and (recipient_id is null or recipient_id=auth.uid() or public.current_role()='admin')
  );

create policy "users update own notifications"
  on public.notifications for update
  using (recipient_id=auth.uid() and organization_id=public.current_organization_id())
  with check (recipient_id=auth.uid() and organization_id=public.current_organization_id());

create policy "staff create organization notifications"
  on public.notifications for insert
  with check (organization_id=public.current_organization_id() and public.current_role() in ('admin','teacher'));

create policy "admins read organization audit"
  on public.audit_logs for select
  using (organization_id=public.current_organization_id() and public.current_role()='admin');

create policy "members insert own audit events"
  on public.audit_logs for insert
  with check (organization_id=public.current_organization_id() and actor_id=auth.uid());

create policy "members read role permissions"
  on public.role_permissions for select
  using (organization_id=public.current_organization_id());

create policy "admins manage role permissions"
  on public.role_permissions for all
  using (organization_id=public.current_organization_id() and public.current_role()='admin')
  with check (organization_id=public.current_organization_id() and public.current_role()='admin');

create or replace function public.log_audit_event(
  p_action text,
  p_entity_type text,
  p_entity_id text default null,
  p_metadata jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path=public
as $$
declare
  org_id uuid;
begin
  org_id:=public.current_organization_id();
  if org_id is null then return; end if;
  insert into public.audit_logs(organization_id,actor_id,action,entity_type,entity_id,metadata)
  values(org_id,auth.uid(),p_action,p_entity_type,p_entity_id,p_metadata);
end;
$$;

grant execute on function public.log_audit_event(text,text,text,jsonb) to authenticated;

insert into public.role_permissions(organization_id,role,permission,enabled)
select o.id,r.role,p.permission,true
from public.organizations o
cross join (values('admin'),('teacher'),('student'),('guardian')) as r(role)
cross join (values
 ('view_dashboard'),('create_resources'),('manage_students'),('view_reports'),
 ('manage_users'),('play_games'),('view_family_portal'),('use_virtual_teacher')
) as p(permission)
on conflict do nothing;
