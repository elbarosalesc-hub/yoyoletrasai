-- Security and performance hardening based on live Supabase advisors.
-- Validated only in a reversible transaction before any production application.

alter function public.enforce_premium_resource_quality_gate()
  set search_path = '';

drop policy if exists "public read active ai plans" on public.ai_plans;
drop policy if exists "users read entitled ai plan" on public.ai_plans;
drop policy if exists "anon read active public ai plans" on public.ai_plans;
drop policy if exists "authenticated read available ai plans" on public.ai_plans;

create policy "anon read active public ai plans"
on public.ai_plans
for select
to anon
using (active and is_public);

create policy "authenticated read available ai plans"
on public.ai_plans
for select
to authenticated
using (
  active
  and (
    is_public
    or exists (
      select 1
      from public.ai_entitlements e
      where e.user_id = (select auth.uid())
        and e.plan_id = ai_plans.id
        and e.status in ('active','trialing')
    )
  )
);

create index if not exists ai_eval_runs_case_id_idx
  on public.ai_eval_runs(case_id);

create index if not exists ai_eval_runs_generation_id_idx
  on public.ai_eval_runs(generation_id)
  where generation_id is not null;

create index if not exists ai_source_files_plan_id_idx
  on public.ai_source_files(plan_id);

create index if not exists automation_profiles_owner_id_idx
  on public.automation_profiles(owner_id);

create index if not exists automation_profiles_updated_by_idx
  on public.automation_profiles(updated_by)
  where updated_by is not null;

create index if not exists evolution_actions_approved_by_idx
  on public.evolution_actions(approved_by)
  where approved_by is not null;

create index if not exists evolution_actions_audit_run_id_idx
  on public.evolution_actions(audit_run_id)
  where audit_run_id is not null;

create index if not exists evolution_actions_finding_id_idx
  on public.evolution_actions(finding_id)
  where finding_id is not null;

create index if not exists platform_secret_store_configured_by_idx
  on public.platform_secret_store(configured_by)
  where configured_by is not null;

create index if not exists resource_candidates_created_by_idx
  on public.resource_candidates(created_by)
  where created_by is not null;

drop policy if exists "users read own ai entitlement" on public.ai_entitlements;
create policy "users read own ai entitlement"
on public.ai_entitlements
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

drop policy if exists "users read own ai usage" on public.ai_usage_events;
create policy "users read own ai usage"
on public.ai_usage_events
for select
to authenticated
using (
  (select auth.uid()) = user_id
  or private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
);

revoke all on function public.is_platform_admin() from public, anon, authenticated;
grant execute on function public.is_platform_admin() to service_role;

revoke all on function public.set_ai_entitlement(
  uuid,
  text,
  text,
  timestamptz
) from public, anon, authenticated;
grant execute on function public.set_ai_entitlement(
  uuid,
  text,
  text,
  timestamptz
) to service_role;

do $$
declare
  v_jobname text;
begin
  if to_regclass('cron.job') is not null then
    foreach v_jobname in array array[
      'yoyo-innovation-scan-monthly',
      'yoyo-resource-factory-weekly'
    ]
    loop
      if exists (select 1 from cron.job where jobname = v_jobname) then
        perform cron.unschedule(v_jobname);
      end if;
    end loop;
  end if;
end
$$;

drop function if exists private.invoke_yoyo_automation(text);

drop policy if exists "users read own ai source files" on public.ai_source_files;
create policy "users read own ai source files"
on public.ai_source_files
for select
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop policy if exists "users update own ai source files" on public.ai_source_files;
create policy "users update own ai source files"
on public.ai_source_files
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

drop policy if exists "users delete own ai source files" on public.ai_source_files;
create policy "users delete own ai source files"
on public.ai_source_files
for delete
to authenticated
using (
  user_id = (select auth.uid())
  and private.is_organization_member(organization_id)
);

drop policy if exists "users read own yoyo ai sources" on storage.objects;
create policy "users read own yoyo ai sources"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

drop policy if exists "users upload own yoyo ai sources" on storage.objects;
create policy "users upload own yoyo ai sources"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

drop policy if exists "users update own yoyo ai sources" on storage.objects;
create policy "users update own yoyo ai sources"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
)
with check (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

drop policy if exists "users delete own yoyo ai sources" on storage.objects;
create policy "users delete own yoyo ai sources"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'yoyo-ai-sources'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1
    from public.organization_memberships m
    where m.user_id = (select auth.uid())
      and m.organization_id::text = (storage.foldername(name))[2]
      and m.is_active = true
  )
);

revoke select on table public.billing_subscriptions from authenticated;
grant select (
  id,
  organization_id,
  user_id,
  provider,
  plan_key,
  status,
  next_payment_at,
  created_at,
  updated_at
) on public.billing_subscriptions to authenticated;

drop policy if exists "members read authorized institution subscriptions" on public.billing_subscriptions;
create policy "members read authorized institution subscriptions"
on public.billing_subscriptions
for select
to authenticated
using (
  plan_key = 'institution'
  and status = 'authorized'
  and private.is_organization_member(organization_id)
);

drop policy if exists "authorized staff can manage memberships" on public.organization_memberships;
drop policy if exists "authorized staff can create memberships" on public.organization_memberships;
drop policy if exists "authorized staff can update memberships" on public.organization_memberships;
drop policy if exists "authorized staff can delete memberships" on public.organization_memberships;

create policy "authorized staff can create memberships"
on public.organization_memberships
for insert
to authenticated
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
  or (
    role <> 'platform_admin'::public.app_role
    and private.has_organization_role(
      organization_id,
      array['institution_admin']::public.app_role[]
    )
  )
  or (
    role = any(array['student','guardian','teacher','pie','utp']::public.app_role[])
    and private.has_organization_role(
      organization_id,
      array['principal']::public.app_role[]
    )
  )
);

create policy "authorized staff can update memberships"
on public.organization_memberships
for update
to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
  or (
    role <> 'platform_admin'::public.app_role
    and private.has_organization_role(
      organization_id,
      array['institution_admin']::public.app_role[]
    )
  )
  or (
    role = any(array['student','guardian','teacher','pie','utp']::public.app_role[])
    and private.has_organization_role(
      organization_id,
      array['principal']::public.app_role[]
    )
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
  or (
    role <> 'platform_admin'::public.app_role
    and private.has_organization_role(
      organization_id,
      array['institution_admin']::public.app_role[]
    )
  )
  or (
    role = any(array['student','guardian','teacher','pie','utp']::public.app_role[])
    and private.has_organization_role(
      organization_id,
      array['principal']::public.app_role[]
    )
  )
);

create policy "authorized staff can delete memberships"
on public.organization_memberships
for delete
to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['platform_admin']::public.app_role[]
  )
  or (
    role <> 'platform_admin'::public.app_role
    and private.has_organization_role(
      organization_id,
      array['institution_admin']::public.app_role[]
    )
  )
  or (
    role = any(array['student','guardian','teacher','pie','utp']::public.app_role[])
    and private.has_organization_role(
      organization_id,
      array['principal']::public.app_role[]
    )
  )
);

create or replace function public.authorize_ai_request_for_org(
  p_organization_id uuid,
  p_mode text,
  p_file_count integer default 0,
  p_largest_file_bytes bigint default 0,
  p_total_file_bytes bigint default 0,
  p_estimated_tokens bigint default 0
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_user_id uuid := auth.uid();
  v_ent record;
  v_month_start timestamptz := date_trunc('month', now());
  v_total_requests integer;
  v_research_requests integer;
  v_token_used bigint;
  v_event_id uuid;
  v_request_limit integer;
  v_research_limit integer;
  v_token_limit bigint;
  v_reserved_tokens bigint := greatest(0, p_estimated_tokens);
  v_owner_unlimited boolean := false;
begin
  if v_user_id is null then
    return jsonb_build_object('allowed', false, 'code', 'AUTH_REQUIRED');
  end if;

  if p_organization_id is null or not private.is_organization_member(p_organization_id) then
    return jsonb_build_object('allowed', false, 'code', 'ORGANIZATION_FORBIDDEN');
  end if;

  if p_file_count < 0 or p_largest_file_bytes < 0 or p_total_file_bytes < 0 or p_estimated_tokens < 0 then
    return jsonb_build_object('allowed', false, 'code', 'INVALID_USAGE_ESTIMATE');
  end if;

  perform pg_advisory_xact_lock(
    hashtextextended(v_user_id::text || ':' || p_organization_id::text, 0)
  );

  select
    e.user_id,
    e.organization_id,
    e.plan_id,
    e.credential_id,
    e.status,
    e.period_start,
    e.period_end,
    e.quota_overrides,
    p.name as plan_name,
    p.monthly_ai_requests,
    p.monthly_research_requests,
    p.monthly_token_limit,
    p.max_output_tokens,
    p.max_files_per_request,
    p.max_file_bytes,
    p.max_total_file_bytes,
    p.unlimited_file_analysis,
    p.model_tier,
    p.allowed_modes
  into v_ent
  from public.ai_entitlements e
  join public.ai_plans p
    on p.id = e.plan_id
   and p.active
  where e.user_id = v_user_id
    and e.organization_id = p_organization_id
    and e.status in ('active','trialing')
    and now() >= e.period_start
    and now() < e.period_end
  order by
    case e.status when 'active' then 0 else 1 end,
    e.period_end desc
  limit 1;

  if not found then
    return jsonb_build_object('allowed', false, 'code', 'PLAN_REQUIRED');
  end if;

  if v_ent.status = 'active'
     and v_ent.plan_id = 'premium'
     and not exists (
       select 1
       from public.billing_subscriptions b
       where b.organization_id = p_organization_id
         and b.user_id = v_user_id
         and b.plan_key = 'premium'
         and b.status = 'authorized'
     ) then
    return jsonb_build_object('allowed', false, 'code', 'PAYMENT_REQUIRED');
  end if;

  if v_ent.status = 'active'
     and v_ent.plan_id = 'institucion'
     and not exists (
       select 1
       from public.billing_subscriptions b
       where b.organization_id = p_organization_id
         and b.plan_key = 'institution'
         and b.status = 'authorized'
     ) then
    return jsonb_build_object('allowed', false, 'code', 'PAYMENT_REQUIRED');
  end if;

  if not (p_mode = any(v_ent.allowed_modes)) then
    return jsonb_build_object(
      'allowed', false,
      'code', 'FEATURE_NOT_INCLUDED',
      'planId', v_ent.plan_id,
      'planName', v_ent.plan_name
    );
  end if;

  v_owner_unlimited := v_ent.plan_id = 'propietaria' and v_ent.model_tier = 'owner';

  if p_mode = 'sources' and (
    p_file_count < 1
    or (v_ent.max_files_per_request <> -1 and p_file_count > v_ent.max_files_per_request)
    or p_largest_file_bytes > v_ent.max_file_bytes
    or p_total_file_bytes > v_ent.max_total_file_bytes
  ) then
    return jsonb_build_object(
      'allowed', false,
      'code', 'FILE_LIMIT_EXCEEDED',
      'planId', v_ent.plan_id,
      'maxFiles', v_ent.max_files_per_request,
      'maxFileBytes', v_ent.max_file_bytes,
      'maxTotalFileBytes', v_ent.max_total_file_bytes,
      'unlimitedFiles', v_ent.unlimited_file_analysis
    );
  end if;

  select count(*)::integer
  into v_total_requests
  from public.ai_usage_events
  where user_id = v_user_id
    and organization_id = p_organization_id
    and created_at >= greatest(v_month_start, v_ent.period_start)
    and status in ('reserved','complete','error','blocked')
    and (status <> 'reserved' or created_at >= now() - interval '15 minutes');

  select count(*)::integer
  into v_research_requests
  from public.ai_usage_events
  where user_id = v_user_id
    and organization_id = p_organization_id
    and mode = 'research'
    and created_at >= greatest(v_month_start, v_ent.period_start)
    and status in ('reserved','complete','error','blocked')
    and (status <> 'reserved' or created_at >= now() - interval '15 minutes');

  select coalesce(
    sum(case when status = 'reserved' then reserved_tokens else total_tokens end),
    0
  )::bigint
  into v_token_used
  from public.ai_usage_events
  where user_id = v_user_id
    and organization_id = p_organization_id
    and created_at >= greatest(v_month_start, v_ent.period_start)
    and status in ('reserved','complete','error','blocked')
    and (status <> 'reserved' or created_at >= now() - interval '15 minutes');

  if v_owner_unlimited then
    v_request_limit := -1;
    v_research_limit := -1;
    v_token_limit := -1;
  else
    v_request_limit := case
      when (v_ent.quota_overrides->>'monthlyAiRequests') ~ '^[0-9]+$'
        then (v_ent.quota_overrides->>'monthlyAiRequests')::integer
      else v_ent.monthly_ai_requests
    end;

    v_research_limit := case
      when (v_ent.quota_overrides->>'monthlyResearchRequests') ~ '^[0-9]+$'
        then (v_ent.quota_overrides->>'monthlyResearchRequests')::integer
      else v_ent.monthly_research_requests
    end;

    v_token_limit := case
      when (v_ent.quota_overrides->>'monthlyTokenLimit') ~ '^-?[0-9]+$'
        then (v_ent.quota_overrides->>'monthlyTokenLimit')::bigint
      else v_ent.monthly_token_limit
    end;
  end if;

  if v_request_limit <> -1 and v_total_requests >= v_request_limit then
    return jsonb_build_object(
      'allowed', false,
      'code', 'MONTHLY_QUOTA_EXCEEDED',
      'planId', v_ent.plan_id,
      'used', v_total_requests,
      'limit', v_request_limit
    );
  end if;

  if p_mode = 'research'
     and v_research_limit <> -1
     and v_research_requests >= v_research_limit then
    return jsonb_build_object(
      'allowed', false,
      'code', 'RESEARCH_QUOTA_EXCEEDED',
      'planId', v_ent.plan_id,
      'used', v_research_requests,
      'limit', v_research_limit
    );
  end if;

  if v_token_limit <> -1
     and v_token_used + v_reserved_tokens > v_token_limit then
    return jsonb_build_object(
      'allowed', false,
      'code', 'TOKEN_QUOTA_EXCEEDED',
      'planId', v_ent.plan_id,
      'used', v_token_used,
      'requested', v_reserved_tokens,
      'limit', v_token_limit
    );
  end if;

  insert into public.ai_usage_events (
    user_id,
    organization_id,
    plan_id,
    credential_id,
    mode,
    file_count,
    file_bytes,
    reserved_tokens
  )
  values (
    v_user_id,
    p_organization_id,
    v_ent.plan_id,
    v_ent.credential_id,
    p_mode,
    p_file_count,
    p_total_file_bytes,
    v_reserved_tokens
  )
  returning id into v_event_id;

  return jsonb_build_object(
    'allowed', true,
    'eventId', v_event_id,
    'userId', v_user_id,
    'organizationId', p_organization_id,
    'credentialId', v_ent.credential_id,
    'planId', v_ent.plan_id,
    'planName', v_ent.plan_name,
    'modelTier', v_ent.model_tier,
    'ownerUnlimited', v_owner_unlimited,
    'usage', jsonb_build_object(
      'monthlyUsed', v_total_requests + 1,
      'monthlyLimit', v_request_limit,
      'researchUsed', v_research_requests + case when p_mode='research' then 1 else 0 end,
      'researchLimit', v_research_limit,
      'monthlyTokenUsed', v_token_used + v_reserved_tokens,
      'monthlyTokenLimit', v_token_limit,
      'tokenRemaining',
        case
          when v_token_limit = -1 then null
          else greatest(0, v_token_limit - v_token_used - v_reserved_tokens)
        end
    ),
    'limits', jsonb_build_object(
      'maxFiles', v_ent.max_files_per_request,
      'maxFileBytes', v_ent.max_file_bytes,
      'maxTotalFileBytes', v_ent.max_total_file_bytes,
      'maxOutputTokens', v_ent.max_output_tokens,
      'unlimitedFiles', v_ent.unlimited_file_analysis,
      'unlimitedUsage', v_owner_unlimited
    )
  );
end;
$function$;

revoke all on function public.authorize_ai_request_for_org(
  uuid,
  text,
  integer,
  bigint,
  bigint,
  bigint
) from public, anon;

grant execute on function public.authorize_ai_request_for_org(
  uuid,
  text,
  integer,
  bigint,
  bigint,
  bigint
) to authenticated, service_role;

revoke execute on function public.authorize_ai_request(
  text,
  integer,
  bigint,
  bigint,
  bigint
) from public, anon, authenticated;

alter table public.ai_entitlements
  drop constraint if exists ai_entitlements_pkey;

alter table public.ai_entitlements
  add primary key (user_id, organization_id);

create index if not exists ai_entitlements_org_status_idx
  on public.ai_entitlements(organization_id, status, period_end desc);

create or replace function public.set_ai_entitlement_for_org(
  p_user_id uuid,
  p_organization_id uuid,
  p_plan_id text,
  p_status text default 'active',
  p_period_end timestamptz default (date_trunc('month', now()) + interval '1 month'),
  p_assigned_by uuid default null
)
returns text
language plpgsql
security definer
set search_path = ''
as $function$
declare
  v_credential text;
begin
  if p_user_id is null or p_organization_id is null then
    raise exception 'user and organization are required';
  end if;

  if p_status not in ('active','trialing','past_due','suspended','cancelled') then
    raise exception 'invalid status';
  end if;

  if p_period_end <= now() then
    raise exception 'period end must be in the future';
  end if;

  if not exists (
    select 1
    from public.ai_plans
    where id = p_plan_id
      and active
  ) then
    raise exception 'invalid plan';
  end if;

  if not exists (
    select 1
    from public.organization_memberships m
    where m.user_id = p_user_id
      and m.organization_id = p_organization_id
      and m.is_active = true
  ) then
    raise exception 'user has no active membership in organization';
  end if;

  insert into public.ai_entitlements (
    user_id,
    organization_id,
    plan_id,
    status,
    period_start,
    period_end,
    assigned_by
  )
  values (
    p_user_id,
    p_organization_id,
    p_plan_id,
    p_status,
    now(),
    p_period_end,
    p_assigned_by
  )
  on conflict (user_id, organization_id) do update
  set plan_id = excluded.plan_id,
      status = excluded.status,
      period_start = excluded.period_start,
      period_end = excluded.period_end,
      assigned_by = excluded.assigned_by,
      updated_at = now()
  returning credential_id into v_credential;

  return v_credential;
end;
$function$;

revoke all on function public.set_ai_entitlement_for_org(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid
) from public, anon, authenticated;

grant execute on function public.set_ai_entitlement_for_org(
  uuid,
  uuid,
  text,
  text,
  timestamptz,
  uuid
) to service_role;

revoke all on function public.set_ai_entitlement(
  uuid,
  text,
  text,
  timestamptz
) from public, anon, authenticated, service_role;


-- Keep learning mission objective/course relationships internally consistent.
drop policy if exists "staff can manage learning missions" on public.learning_missions;
create policy "staff can manage learning missions"
on public.learning_missions
for all
to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and exists (
    select 1
    from public.courses c
    where c.id = course_id
      and c.organization_id = organization_id
  )
  and (
    objective_id is null
    or exists (
      select 1
      from public.learning_objectives o
      where o.id = objective_id
        and o.organization_id = organization_id
        and (o.course_id is null or o.course_id = course_id)
    )
  )
);


-- Keep learning evidence objective/course relationships internally consistent.
drop policy if exists "staff can create learning evidence" on public.learning_evidence;
create policy "staff can create learning evidence"
on public.learning_evidence
for insert
to authenticated
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and created_by = (select auth.uid())
  and exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.organization_id = organization_id
  )
  and exists (
    select 1
    from public.learning_objectives o
    where o.id = objective_id
      and o.organization_id = organization_id
      and (
        course_id is null
        or o.course_id is null
        or o.course_id = course_id
      )
  )
  and (
    course_id is null
    or exists (
      select 1
      from public.courses c
      where c.id = course_id
        and c.organization_id = organization_id
    )
  )
);

drop policy if exists "staff can update learning evidence" on public.learning_evidence;
create policy "staff can update learning evidence"
on public.learning_evidence
for update
to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['teacher','pie','utp','principal','institution_admin','platform_admin']::public.app_role[]
  )
  and exists (
    select 1
    from public.students s
    where s.id = student_id
      and s.organization_id = organization_id
  )
  and exists (
    select 1
    from public.learning_objectives o
    where o.id = objective_id
      and o.organization_id = organization_id
      and (
        course_id is null
        or o.course_id is null
        or o.course_id = course_id
      )
  )
  and (
    course_id is null
    or exists (
      select 1
      from public.courses c
      where c.id = course_id
        and c.organization_id = organization_id
    )
  )
);


-- Remove inherited non-CRUD privileges from critical exposed tables.
revoke truncate, references, trigger, maintain on table
  public.ai_entitlements,
  public.ai_eval_cases,
  public.ai_eval_runs,
  public.ai_generations,
  public.ai_plans,
  public.ai_usage_events,
  public.assessment_questions,
  public.evolution_actions,
  public.evolution_audit_runs,
  public.evolution_benchmarks,
  public.platform_resources,
  public.platform_settings,
  public.resource_assignments
from anon, authenticated;

notify pgrst, 'reload schema';
