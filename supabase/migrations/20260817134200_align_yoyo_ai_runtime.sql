alter table public.ai_usage_events drop constraint if exists ai_usage_events_mode_check;
alter table public.ai_usage_events add constraint ai_usage_events_mode_check check (mode = any (array['activity'::text,'writing'::text,'assessment'::text,'guide'::text,'analysis'::text,'image'::text,'report'::text,'presentation'::text,'video'::text,'summary'::text,'reading_plan'::text,'research'::text,'sources'::text]));

create policy "users read entitled ai plan" on public.ai_plans for select to authenticated using (active and exists (select 1 from public.ai_entitlements e where e.user_id = (select auth.uid()) and e.plan_id = ai_plans.id and e.status in ('active','trialing')));

create policy "users create own ai usage" on public.ai_usage_events for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.organization_memberships m where m.user_id = (select auth.uid()) and m.organization_id = ai_usage_events.organization_id and m.is_active = true));

create policy "users update own ai usage" on public.ai_usage_events for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

alter table public.ai_source_files enable row level security;
create policy "users read own ai source files" on public.ai_source_files for select to authenticated using (user_id = (select auth.uid()));
create policy "users create own ai source files" on public.ai_source_files for insert to authenticated with check (user_id = (select auth.uid()) and exists (select 1 from public.organization_memberships m where m.user_id = (select auth.uid()) and m.organization_id = ai_source_files.organization_id and m.is_active = true));
create policy "users update own ai source files" on public.ai_source_files for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "users delete own ai source files" on public.ai_source_files for delete to authenticated using (user_id = (select auth.uid()));
