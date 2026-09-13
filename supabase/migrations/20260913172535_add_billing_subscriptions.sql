create table if not exists public.billing_subscriptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null check (provider in ('mercadopago')),
  plan_key text not null check (plan_key in ('premium','institution')),
  provider_plan_id text,
  external_subscription_id text,
  external_reference text not null,
  status text not null default 'pending' check (status in ('pending','authorized','paused','cancelled','cancelled_by_provider','rejected','unknown')),
  payer_email text,
  checkout_url text,
  next_payment_at timestamptz,
  provider_updated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (provider, external_reference),
  unique (provider, external_subscription_id)
);

create table if not exists public.billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('mercadopago')),
  provider_event_key text not null,
  topic text not null,
  external_resource_id text,
  signature_valid boolean not null default false,
  payload jsonb not null default '{}'::jsonb,
  processed_at timestamptz,
  processing_error text,
  created_at timestamptz not null default now(),
  unique (provider, provider_event_key)
);

create index if not exists billing_subscriptions_org_user_idx
  on public.billing_subscriptions (organization_id, user_id, created_at desc);
create index if not exists billing_subscriptions_external_idx
  on public.billing_subscriptions (provider, external_subscription_id)
  where external_subscription_id is not null;
create index if not exists billing_subscriptions_status_idx
  on public.billing_subscriptions (organization_id, status, updated_at desc);
create index if not exists billing_events_resource_idx
  on public.billing_events (provider, external_resource_id, created_at desc)
  where external_resource_id is not null;

alter table public.billing_subscriptions enable row level security;
alter table public.billing_events enable row level security;

revoke all on table public.billing_subscriptions, public.billing_events from anon;
revoke all on table public.billing_subscriptions, public.billing_events from authenticated;

grant select on public.billing_subscriptions to authenticated;
grant all on public.billing_subscriptions, public.billing_events to service_role;

drop policy if exists "members read own billing subscriptions" on public.billing_subscriptions;
create policy "members read own billing subscriptions"
on public.billing_subscriptions for select to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop policy if exists "platform admins read organization billing" on public.billing_subscriptions;
create policy "platform admins read organization billing"
on public.billing_subscriptions for select to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin','institution_admin']::public.app_role[]
  )
);

drop trigger if exists billing_subscriptions_set_updated_at on public.billing_subscriptions;
create trigger billing_subscriptions_set_updated_at
before update on public.billing_subscriptions
for each row execute function private.set_updated_at();

comment on table public.billing_subscriptions is 'Server-managed subscription state. Authenticated clients have read-only RLS access; payment mutations use service role.';
comment on table public.billing_events is 'Server-only immutable-ish webhook audit trail. Raw provider payloads are never granted to authenticated clients.';

notify pgrst, 'reload schema';
