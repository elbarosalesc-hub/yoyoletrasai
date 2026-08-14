# YoYoLetrasAI 3.6.0 — validación segura de esquema

Fecha: 2026-08-14

Este control se realizó sin modificar producción, dominio, alias, secretos ni configuración aprobada.

## Migraciones incluidas en el paquete 3.6

- `20260810193000_add_ai_plans_entitlements_and_usage.sql`
- `20260810194000_index_ai_entitlement_foreign_keys.sql`
- `20260813143000_two_plans_token_quotas_owner_credentials.sql`
- `20260813185000_yoyo_core_resource_factory.sql`
- `20260813190000_yoyo_core_google_storage_and_superior_file_limits.sql`

## Verificación de objetos requeridos en Supabase actual

Confirmados en el esquema `public`:

- `ai_plans`
- `ai_entitlements`
- `ai_usage_events`
- `automation_profiles`
- `resource_factory_runs`
- `resource_candidates`
- `platform_resources`
- `innovation_scans`
- `innovation_source_snapshots`
- `innovation_findings`
- `ai_source_files`
- `platform_secret_store`

La verificación se realizó mediante consultas de lectura sobre `information_schema`; no se aplicaron migraciones ni cambios DDL.

## Estado de implementación

La base de datos contiene los objetos estructurales principales que el paquete 3.6 espera. Esto permite continuar con validación de compatibilidad de columnas, políticas, funciones y ejecución de Preview sin alterar producción.

## Regla de seguridad vigente

1. No aplicar migraciones a producción si el objeto ya existe sin comparar primero su definición.
2. No modificar credenciales ni secretos productivos durante staging.
3. No promover un deployment 3.6 hasta superar build, APIs, propietario, IA, fábrica, juegos 3D y navegación.
4. Cualquier discrepancia se corrige primero en rama/Preview aislado.
