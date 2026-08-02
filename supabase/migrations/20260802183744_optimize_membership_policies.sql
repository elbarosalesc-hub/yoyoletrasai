drop policy if exists "authorized staff can manage memberships"
  on public.organization_memberships;

drop policy if exists "authorized staff can create memberships"
  on public.organization_memberships;
create policy "authorized staff can create memberships"
on public.organization_memberships for insert to authenticated
with check (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
);

drop policy if exists "authorized staff can update memberships"
  on public.organization_memberships;
create policy "authorized staff can update memberships"
on public.organization_memberships for update to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
)
with check (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
);

drop policy if exists "authorized staff can delete memberships"
  on public.organization_memberships;
create policy "authorized staff can delete memberships"
on public.organization_memberships for delete to authenticated
using (
  private.has_organization_role(
    organization_id,
    array['principal','institution_admin','platform_admin']::public.app_role[]
  )
);

notify pgrst, 'reload schema';