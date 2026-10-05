create table if not exists public.inclusion_boards (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Mi rutina de trabajo autónomo'
    check (char_length(title) between 1 and 160),
  payload jsonb not null default '{}'::jsonb
    check (
      jsonb_typeof(payload) = 'object'
      and octet_length(payload::text) <= 100000
    ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists inclusion_boards_org_user_idx
  on public.inclusion_boards (organization_id, user_id);

alter table public.inclusion_boards enable row level security;

revoke all on table public.inclusion_boards from anon;
revoke all on table public.inclusion_boards from authenticated;
grant select, insert, update, delete on public.inclusion_boards to authenticated;
grant all on public.inclusion_boards to service_role;

drop policy if exists "users manage own inclusion board in active organization" on public.inclusion_boards;
create policy "users manage own inclusion board in active organization"
on public.inclusion_boards
for all
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
)
with check (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop trigger if exists inclusion_boards_set_updated_at on public.inclusion_boards;
create trigger inclusion_boards_set_updated_at
before update on public.inclusion_boards
for each row execute function private.set_updated_at();

notify pgrst, 'reload schema';
