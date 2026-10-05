# Supabase schema drift audit — 2026-10-02

This report is generated from read-only inspection of the connected Supabase project and the safe rebuild branch.

## Safety status

- Production database was **not modified**.
- No migration was applied remotely.
- The report exists to prevent an unsafe assumption that repository migrations and the live database are currently identical.

## Connected project

- Project ref: `xpcywpvrveweynqvudcr`
- PostgreSQL: 17
- Administrative status observed: `ACTIVE_HEALTHY`

## Summary

- Repository migration files: **22**
- Remote migration history entries: **47**
- Remote migration versions missing from the repository: **44**
- Repository migration versions not applied remotely: **19**

## Remote-only migration history

- `20260802191918_add_students_enrollments_and_support_profiles`
- `20260802191953_harden_student_enrollment_access`
- `20260802192011_index_student_audit_foreign_keys`
- `20260802195140_add_learning_objectives_and_evidence`
- `20260802195142_add_learning_objectives_and_evidence`
- `20260802195143_add_learning_objectives_and_evidence`
- `20260802195204_index_learning_evidence_student`
- `20260802195205_index_learning_evidence_student`
- `20260802195206_add_learning_objectives_and_evidence_v2`
- `20260802195216_add_direct_student_evidence_index`
- `20260802205925_add_assessments_rubrics_and_results`
- `20260802205950_index_assessment_results_student`
- `20260802213155_fix_cross_organization_rls_checks`
- `20260802215114_add_assessment_questions_table`
- `20260802215124_secure_assessment_questions`
- `20260802222948_provision_platform_owner`
- `20260802223032_reserve_platform_owner_elba_rosales_v2`
- `20260802223050_repair_owner_provisioning`
- `20260809194721_add_yoyoletrasai_workspace_persistence`
- `20260809194810_index_yoyoletrasai_workspace_foreign_keys`
- `20260810192217_add_ai_plans_entitlements_and_usage`
- `20260810192314_index_ai_entitlement_foreign_keys`
- `20260813164036_add_owner_innovation_radar_and_resource_factory`
- `20260813165604_schedule_yoyo_automations_with_vault`
- `20260813185120_two_plans_token_quotas_owner_credentials_v360`
- `20260813191317_add_ai_source_files_v360`
- `20260813200810_create_temporary_release_staging_v360`
- `20260813202839_disable_temporary_release_staging_v360`
- `20260813203423_owner_vault_service_functions_v360`
- `20260813203510_temporary_release_chunks_private_v360`
- `20260813203622_owner_vault_status_v360`
- `20260813214629_temporary_release_fetch_v360`
- `20260813215200_temporary_exact_release_stage_v360`
- `20260814160244_owner_ai_unlimited_usage`
- `20260814161319_expand_ai_plan_modes_for_user_parity`
- `20260816211709_harden_release_staging_v8`
- `20260817165945_align_yoyo_ai_file_limits_by_plan`
- `20260817170931_enforce_premium_resource_quality_gate`
- `20260817174216_align_yoyo_ai_usage_modes`
- `20260817174259_secure_yoyo_ai_runtime_policies`
- `20260817174339_secure_yoyo_ai_source_files`
- `20260817182352_add_yoyo_evolution_center_v2`
- `20260817182558_seed_yoyo_evolution_benchmarks_and_evals`
- `20260824190847_enable_assessment_mode`

## Repository-only migrations

- `20260802191900_add_students_enrollments_and_support_profiles`
- `20260802192100_harden_student_module`
- `20260802195100_add_learning_objectives_and_evidence`
- `20260817131000_enforce_premium_resource_quality_gate`
- `20260817134200_align_yoyo_ai_runtime`
- `20260817181500_sync_final_yoyo_ai_plan_limits`
- `20260817182000_seed_canonical_premium_resources`
- `20260817183000_add_yoyo_evolution_center`
- `20260817183500_seed_yoyo_evolution_benchmarks_and_evals`
- `20260817185000_seed_additional_premium_resources`
- `20260817185100_normalize_additional_resource_factory_runs`
- `20260913102500_add_user_platform_preferences`
- `20260913104500_add_learning_missions`
- `20260913161700_add_virtual_teacher_history`
- `20260913163951_restore_resource_factory_schema`
- `20260913172535_add_billing_subscriptions`
- `20261002141000_add_inclusion_boards`
- `20261002142500_harden_user_platform_preferences_rls`
- `20261002144000_harden_security_and_fk_indexes`

## Required gate before applying new migrations

1. Do not run a blanket `supabase db push` against production.
2. First reconstruct or baseline the authoritative remote schema in a safe preview environment.
3. Compare tables, functions, policies, grants, triggers and indexes.
4. Apply only reviewed additive migrations.
5. Regenerate `apps/web/lib/supabase/database.types.ts` after preview migrations.
6. Run security/performance advisors again.
7. Run authenticated E2E and tenant-isolation tests before any production approval.

## Current rebuild migrations awaiting preview validation

- `20261002141000_add_inclusion_boards`
- `20261002142500_harden_user_platform_preferences_rls`
- `20261002144000_harden_security_and_fk_indexes`

## Important observation

The live project already contains schema objects such as assessments, AI entitlements, automation/radar infrastructure and other tables that are not fully represented by the migration subset currently present in the repository. The generated TypeScript types have therefore been synchronized from the live schema in the safe branch, but they must be regenerated again after the rebuild migrations are applied in preview.
