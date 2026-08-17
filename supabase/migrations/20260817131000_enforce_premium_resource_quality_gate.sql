create or replace function public.enforce_premium_resource_quality_gate()
returns trigger
language plpgsql
as $$
begin
  if new.status = 'published' then
    if new.quality_score < 92 then
      raise exception 'Premium quality gate failed: score % is below 92', new.quality_score;
    end if;

    if coalesce((new.quality_report->>'curricularAlignment')::boolean, false) is not true
       or coalesce((new.quality_report->>'duaPie')::boolean, false) is not true
       or coalesce((new.quality_report->>'accessibility')::boolean, false) is not true
       or coalesce((new.quality_report->>'teacherVersion')::boolean, false) is not true
       or coalesce((new.quality_report->>'studentVersion')::boolean, false) is not true
       or coalesce((new.quality_report->>'answerKeyOrRubric')::boolean, false) is not true
       or coalesce((new.quality_report->>'editableReusable')::boolean, false) is not true
       or coalesce((new.quality_report->>'visualQuality')::boolean, false) is not true then
      raise exception 'Premium quality gate failed: mandatory quality dimensions are incomplete';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists resource_candidates_premium_quality_gate on public.resource_candidates;
create trigger resource_candidates_premium_quality_gate
before insert or update of status, quality_score, quality_report
on public.resource_candidates
for each row
execute function public.enforce_premium_resource_quality_gate();
