create extension if not exists pgcrypto;

create type public.app_role as enum (
  'student',
  'guardian',
  'teacher',
  'pie',
  'utp',
  'principal',
  'institution_admin',
  'platform_admin'
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  organization_type text not null default 'school',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  display_name text,
  avatar_url text,
  locale text not null default 'es-CL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  level text not null,
  academic_year integer not null,
  teacher_id uuid references auth.users(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index organization_memberships_user_idx
  on public.organization_memberships(user_id, organization_id);
create index courses_organization_idx
  on public.courses(organization_id, academic_year);

create or replace function public.is_organization_member(target_organization_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.is_active = true
  );
$$;

create or replace function public.has_organization_role(
  target_organization_id uuid,
  allowed_roles public.app_role[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_organization_id
      and membership.user_id = auth.uid()
      and membership.role = any(allowed_roles)
      and membership.is_active = true
  );
$$;

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.courses enable row level security;

create policy "members can read their organizations"
on public.organizations for select
to authenticated
using (public.is_organization_member(id));

create policy "users can read their own profile"
on public.profiles for select
to authenticated
using (id = auth.uid());

create policy "users can update their own profile"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "members can read memberships in their organization"
on public.organization_memberships for select
to authenticated
using (public.is_organization_member(organization_id));

create policy "authorized staff can manage memberships"
on public.organization_memberships for all
to authenticated
using (
  public.has_organization_role(
    organization_id,
    array['principal', 'institution_admin', 'platform_admin']::public.app_role[]
  )
)
with check (
  public.has_organization_role(
    organization_id,
    array['principal', 'institution_admin', 'platform_admin']::public.app_role[]
  )
);

create policy "members can read courses"
on public.courses for select
to authenticated
using (public.is_organization_member(organization_id));

create policy "academic staff can create courses"
on public.courses for insert
to authenticated
with check (
  public.has_organization_role(
    organization_id,
    array['teacher', 'pie', 'utp', 'principal', 'institution_admin', 'platform_admin']::public.app_role[]
  )
);

create policy "academic leaders can update courses"
on public.courses for update
to authenticated
using (
  teacher_id = auth.uid()
  or public.has_organization_role(
    organization_id,
    array['utp', 'principal', 'institution_admin', 'platform_admin']::public.app_role[]
  )
)
with check (
  teacher_id = auth.uid()
  or public.has_organization_role(
    organization_id,
    array['utp', 'principal', 'institution_admin', 'platform_admin']::public.app_role[]
  )
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', new.email));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
