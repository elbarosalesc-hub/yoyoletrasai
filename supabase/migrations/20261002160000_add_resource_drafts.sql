create table if not exists public.resource_drafts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint resource_drafts_payload_check check (
    jsonb_typeof(payload) = 'object'
    and jsonb_typeof(history) = 'array'
    and jsonb_array_length(history) <= 10
    and octet_length(payload::text) + octet_length(history::text) <= 1000000
  ),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create index if not exists resource_drafts_org_user_idx
  on public.resource_drafts (organization_id, user_id);

alter table public.resource_drafts enable row level security;

revoke all on table public.resource_drafts from anon;
revoke all on table public.resource_drafts from authenticated;
grant select, insert, update, delete on table public.resource_drafts to authenticated;
grant all on table public.resource_drafts to service_role;

create policy "users read own resource draft"
on public.resource_drafts
for select
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

create policy "users create own resource draft"
on public.resource_drafts
for insert
to authenticated
with check (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

create policy "users update own resource draft"
on public.resource_drafts
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

create policy "users delete own resource draft"
on public.resource_drafts
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop trigger if exists resource_drafts_set_updated_at on public.resource_drafts;
create trigger resource_drafts_set_updated_at
before update on public.resource_drafts
for each row execute function private.set_updated_at();

notify pgrst, 'reload schema';
