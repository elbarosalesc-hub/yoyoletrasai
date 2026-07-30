create extension if not exists pgcrypto;

create type public.app_role as enum ('platform_admin','institution_admin','director','coordinator','teacher','special_educator','support_professional','guardian','student');
create type public.mission_status as enum ('draft','published','archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  locale text not null default 'es-CL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code text not null default 'CL',
  created_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id, role)
);

create table public.student_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  level integer not null default 1 check (level > 0),
  xp integer not null default 0 check (xp >= 0),
  energy integer not null default 100 check (energy between 0 and 100),
  coins integer not null default 0 check (coins >= 0),
  streak_days integer not null default 0 check (streak_days >= 0),
  updated_at timestamptz not null default now()
);

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text not null default '',
  subject text not null default 'Lenguaje',
  xp_reward integer not null default 0 check (xp_reward >= 0),
  coin_reward integer not null default 0 check (coin_reward >= 0),
  status public.mission_status not null default 'draft',
  content jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.mission_attempts (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions(id) on delete cascade,
  student_id uuid not null references auth.users(id) on delete cascade,
  progress integer not null default 0 check (progress between 0 and 100),
  score numeric(5,2),
  answers jsonb not null default '{}'::jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (mission_id, student_id)
);

create table public.agenda_items (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  item_type text not null default 'activity',
  starts_at timestamptz not null,
  ends_at timestamptz,
  status text not null default 'scheduled',
  created_at timestamptz not null default now()
);

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references auth.users(id) on delete cascade,
  mission_id uuid references public.missions(id) on delete set null,
  amount integer not null,
  currency text not null check (currency in ('xp','coins')),
  reason text not null,
  idempotency_key text not null unique,
  created_at timestamptz not null default now()
);

create index memberships_user_idx on public.memberships(user_id, organization_id);
create index missions_org_status_idx on public.missions(organization_id, status);
create index agenda_user_time_idx on public.agenda_items(user_id, starts_at);
create index attempts_student_idx on public.mission_attempts(student_id, updated_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger students_updated_at before update on public.student_profiles for each row execute function public.set_updated_at();
create trigger missions_updated_at before update on public.missions for each row execute function public.set_updated_at();
create trigger attempts_updated_at before update on public.mission_attempts for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

create or replace function public.is_org_member(target_org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org and user_id = auth.uid() and is_active
  );
$$;

create or replace function public.has_org_role(target_org uuid, accepted_roles public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.memberships
    where organization_id = target_org and user_id = auth.uid() and is_active and role = any(accepted_roles)
  );
$$;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.student_profiles enable row level security;
alter table public.missions enable row level security;
alter table public.mission_attempts enable row level security;
alter table public.agenda_items enable row level security;
alter table public.wallet_transactions enable row level security;

create policy "profiles_read_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations_read_member" on public.organizations for select using (public.is_org_member(id));
create policy "memberships_read_own" on public.memberships for select using (user_id = auth.uid() or public.has_org_role(organization_id, array['platform_admin','institution_admin','director']::public.app_role[]));
create policy "memberships_manage_admin" on public.memberships for all using (public.has_org_role(organization_id, array['platform_admin','institution_admin']::public.app_role[])) with check (public.has_org_role(organization_id, array['platform_admin','institution_admin']::public.app_role[]));
create policy "student_profile_read_own" on public.student_profiles for select using (id = auth.uid() or public.has_org_role(organization_id, array['platform_admin','institution_admin','director','coordinator','teacher','special_educator','support_professional']::public.app_role[]));
create policy "missions_read_member" on public.missions for select using (public.is_org_member(organization_id) and status = 'published' or public.has_org_role(organization_id, array['platform_admin','institution_admin','director','coordinator','teacher','special_educator']::public.app_role[]));
create policy "missions_manage_staff" on public.missions for all using (public.has_org_role(organization_id, array['platform_admin','institution_admin','director','coordinator','teacher','special_educator']::public.app_role[])) with check (public.has_org_role(organization_id, array['platform_admin','institution_admin','director','coordinator','teacher','special_educator']::public.app_role[]));
create policy "attempts_read_own_or_staff" on public.mission_attempts for select using (student_id = auth.uid() or exists (select 1 from public.missions m where m.id = mission_id and public.has_org_role(m.organization_id, array['platform_admin','institution_admin','director','coordinator','teacher','special_educator']::public.app_role[])));
create policy "attempts_write_own" on public.mission_attempts for insert with check (student_id = auth.uid());
create policy "attempts_update_own" on public.mission_attempts for update using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "agenda_read_own" on public.agenda_items for select using (user_id = auth.uid());
create policy "wallet_read_own" on public.wallet_transactions for select using (student_id = auth.uid());

revoke all on public.wallet_transactions from authenticated;
grant select on public.wallet_transactions to authenticated;
