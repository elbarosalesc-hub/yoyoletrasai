create extension if not exists pgcrypto;
create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated, service_role;

do $$ begin
  create type public.app_role as enum (
    'student', 'guardian', 'teacher', 'pie', 'utp', 'principal',
    'institution_admin', 'platform_admin'
  );
exception when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type text not null default 'school',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  locale text not null default 'es-CL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  level text not null,
  academic_year integer not null check (academic_year between 2000 and 2200),
  teacher_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists organization_memberships_user_idx
  on public.organization_memberships(user_id, organization_id);
create index if not exists organization_memberships_org_active_idx
  on public.organization_memberships(organization_id, is_active);
create index if not exists courses_organization_idx
  on public.courses(organization_id, academic_year);
create index if not exists courses_teacher_idx
  on public.courses(teacher_id) where teacher_id is not null;

create or replace function private.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.is_active = true
  );
$$;

create or replace function private.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = (select auth.uid())
      and membership.role = any(allowed_roles)
      and membership.is_active = true
  );
$$;

revoke all on function private.is_organization_member(uuid) from public, anon;
revoke all on function private.has_organization_role(uuid, public.app_role[]) from public, anon;
grant execute on function private.is_organization_member(uuid) to authenticated, service_role;
grant execute on function private.has_organization_role(uuid, public.app_role[]) to authenticated, service_role;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.courses enable row level security;

revoke all on table public.organizations, public.profiles,
  public.organization_memberships, public.courses from anon;
revoke all on table public.organizations, public.profiles,
  public.organization_memberships, public.courses from authenticated;

grant select on public.organizations to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.organization_memberships to authenticated;
grant select, insert, update on public.courses to authenticated;
grant all on public.organizations, public.profiles,
  public.organization_memberships, public.courses to service_role;

alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated;

drop policy if exists "members can read their organizations" on public.organizations;
create policy "members can read their organizations"
on public.organizations for select to authenticated
using (private.is_organization_member(id));

drop policy if exists "users can read their own profile" on public.profiles;
create policy "users can read their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

drop policy if exists "members can read memberships in their organization"
  on public.organization_memberships;
create policy "members can read memberships in their organization"
on public.organization_memberships for select to authenticated
using (private.is_organization_member(organization_id));

drop policy if exists "authorized staff can manage memberships"
  on public.organization_memberships;
create policy "authorized staff can manage memberships"
on public.organization_memberships for all to authenticated
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
);

drop policy if exists "members can read courses" on public.courses;
create policy "members can read courses"
on public.courses for select to authenticated
using (private.is_organization_member(organization_id));

drop policy if exists "academic staff can create courses" on public.courses;
create policy "academic staff can create courses"
on public.courses for insert to authenticated
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
);

drop policy if exists "academic leaders can update courses" on public.courses;
create policy "academic leaders can update courses"
on public.courses for update to authenticated
using (
  teacher_id = (select auth.uid())
  or private.has_organization_role(
    organization_id,
    array['utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  teacher_id = (select auth.uid())
  or private.has_organization_role(
    organization_id,
    array['utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
);

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function private.set_updated_at() from public, anon, authenticated;

drop trigger if exists organizations_set_updated_at on public.organizations;
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function private.set_updated_at();

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function private.set_updated_at();

drop trigger if exists courses_set_updated_at on public.courses;
create trigger courses_set_updated_at
before update on public.courses
for each row execute function private.set_updated_at();

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email))
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke all on function private.handle_new_user() from public, anon, authenticated;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_user();

drop function if exists public.is_organization_member(uuid);
drop function if exists public.has_organization_role(uuid, public.app_role[]);
drop function if exists public.handle_new_user();

notify pgrst, 'reload schema';