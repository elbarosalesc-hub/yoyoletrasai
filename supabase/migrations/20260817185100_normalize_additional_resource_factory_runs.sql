do $$
declare
  v_org uuid;
  v_run_first uuid;
  v_run_second uuid;
begin
  select m.organization_id into v_org
  from auth.users u
  join public.organization_memberships m on m.user_id=u.id and m.is_active=true and m.role='platform_admin'::public.app_role
  where lower(u.email)=lower('elba.rosalesc@gmail.com')
  order by m.organization_id limit 1;

  if v_org is null then return; end if;

  select factory_run_id into v_run_first
  from public.resource_candidates
  where organization_id=v_org and resource_key='premium-reading-4b-semillas'
  limit 1;

  insert into public.resource_factory_runs (organization_id,triggered_by,status,requested_count,generated_count,published_count,started_at,completed_at)
  values (v_org,'system','completed',5,5,5,now(),now())
  returning id into v_run_second;

  update public.resource_candidates
  set factory_run_id=v_run_second
  where organization_id=v_org and resource_key in (
    'premium-inclusion-2b-rutina-instrucciones',
    'premium-history-5b-macrozonas-chile',
    'premium-assessment-6b-fracciones-decimales',
    'premium-planlector-4b-misterio-biblioteca',
    'premium-writing-2b-descripcion-personaje'
  );

  if v_run_first is not null then
    update public.resource_factory_runs set requested_count=5,generated_count=5,published_count=5 where id=v_run_first;
  end if;
end $$;
