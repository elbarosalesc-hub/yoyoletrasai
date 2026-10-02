revoke all on table public.user_platform_preferences from anon;
revoke all on table public.user_platform_preferences from authenticated;
grant select, insert, update, delete on public.user_platform_preferences to authenticated;
grant all on public.user_platform_preferences to service_role;

drop policy if exists "users manage own platform preferences" on public.user_platform_preferences;
create policy "users manage own platform preferences"
on public.user_platform_preferences
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

notify pgrst, 'reload schema';
