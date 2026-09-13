create table if not exists public.virtual_teacher_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  mode text not null check (mode in ('planificar','adaptar','evaluar','analizar','comunicar')),
  prompt text not null check (char_length(prompt) between 1 and 4000),
  level text not null default '',
  subject text not null default '',
  title text not null check (char_length(title) between 1 and 240),
  summary text not null default '',
  sections jsonb not null default '[]'::jsonb,
  pedagogical_checks jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  constraint virtual_teacher_history_sections_array check (jsonb_typeof(sections) = 'array'),
  constraint virtual_teacher_history_checks_array check (jsonb_typeof(pedagogical_checks) = 'array'),
  constraint virtual_teacher_history_steps_array check (jsonb_typeof(next_steps) = 'array')
);

create index if not exists virtual_teacher_history_owner_idx
  on public.virtual_teacher_history (user_id, organization_id, created_at desc);

alter table public.virtual_teacher_history enable row level security;

revoke all on table public.virtual_teacher_history from anon, authenticated;
grant select, insert, delete on table public.virtual_teacher_history to authenticated;
grant all on table public.virtual_teacher_history to service_role;

drop policy if exists "users read own virtual teacher history" on public.virtual_teacher_history;
create policy "users read own virtual teacher history"
on public.virtual_teacher_history for select to authenticated
using (
  (select auth.uid()) = user_id
  and private.is_organization_member(organization_id)
);

drop policy if exists "users create own virtual teacher history" on public.virtual_teacher_history;
create policy "users create own virtual teacher history"
on public.virtual_teacher_history for insert to authenticated
with check (
  (select auth.uid()) = user_id
  and private.is_organization_member(organization_id)
);

drop policy if exists "users delete own virtual teacher history" on public.virtual_teacher_history;
create policy "users delete own virtual teacher history"
on public.virtual_teacher_history for delete to authenticated
using (
  (select auth.uid()) = user_id
  and private.is_organization_member(organization_id)
);
