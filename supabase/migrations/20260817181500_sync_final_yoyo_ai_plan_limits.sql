update public.ai_plans
set max_files_per_request = 12,
    max_file_bytes = 20971520,
    max_total_file_bytes = 251658240,
    updated_at = now()
where id = 'basico';

update public.ai_plans
set max_files_per_request = 48,
    max_file_bytes = 20971520,
    max_total_file_bytes = 1006632960,
    updated_at = now()
where id = 'premium';

update public.ai_plans
set max_files_per_request = -1,
    max_file_bytes = 20971520,
    max_total_file_bytes = 2147483648,
    updated_at = now()
where id = 'propietaria';
