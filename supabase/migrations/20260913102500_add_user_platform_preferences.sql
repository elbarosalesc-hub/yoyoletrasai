create table if not exists public.user_platform_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  display_name text,
  specialty text,
  country text not null default 'Chile',
  default_level text not null default '3.º básico',
  default_subject text not null default 'Lenguaje y Comunicación',
  default_support_profile text not null default 'Acceso universal DUA',
  preferred_duration text not null default '45 minutos',
  theme text not null default 'purple',
  audio_enabled boolean not null default true,
  animations_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  notifications_enabled boolean not null default true,
  ai_approval_required boolean not null default true,
  virtual_teacher_tone text not null default 'profesional_claro',
  virtual_teacher_depth text not null default 'completo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, organization_id)
);

alter table public.user_platform_preferences enable row level security;

drop policy if exists "users manage own platform preferences" on public.user_platform_preferences;
create policy "users manage own platform preferences"
on public.user_platform_preferences
for all
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create index if not exists user_platform_preferences_org_idx
  on public.user_platform_preferences (organization_id, updated_at desc);
