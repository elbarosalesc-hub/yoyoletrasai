create table if not exists public.weekly_planners (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  blocks jsonb not null default '[]'::jsonb
    check (
      jsonb_typeof(blocks) = 'array'
      and jsonb_array_length(blocks) <= 80
      and octet_length(blocks::text) <= 500000
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists weekly_planners_org_user_idx
  on public.weekly_planners (organization_id, user_id);

alter table public.weekly_planners enable row level security;

revoke all on table public.weekly_planners from anon;
revoke all on table public.weekly_planners from authenticated;
grant select, insert, update, delete on table public.weekly_planners to authenticated;
grant all on table public.weekly_planners to service_role;

create policy "users read own weekly planner"
on public.weekly_planners
for select
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

create policy "users create own weekly planner"
on public.weekly_planners
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

create policy "users update own weekly planner"
on public.weekly_planners
for update
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
)
with check (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

create policy "users delete own weekly planner"
on public.weekly_planners
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop trigger if exists weekly_planners_set_updated_at on public.weekly_planners;
create trigger weekly_planners_set_updated_at
before update on public.weekly_planners
for each row execute function private.set_updated_at();

notify pgrst, 'reload schema';
