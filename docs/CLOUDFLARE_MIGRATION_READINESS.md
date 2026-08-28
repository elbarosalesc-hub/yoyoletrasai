# YoYoLetrasAI - Cloudflare migration readiness

Date: 2026-08-28
Branch: `migration/cloudflare-readiness`

## Safety rule

This branch is audit-only. It must not modify production DNS, the existing Vercel project, production aliases, Supabase production data, or production secrets.

## Current architecture confirmed

- Next.js 16 / React 19 application under `apps/web`.
- Supabase SSR and supabase-js for auth/data.
- Server route handlers under `app/api`.
- Existing Vercel configuration remains untouched.
- Cloudflare Workers + vinext is the preferred migration target for current Next.js 16 applications according to Cloudflare documentation.

## Important source-of-truth blocker

GitHub `main` currently ends at commit `ea6d1fad982d08a36b99dc3ddec953036a58f97b` dated 2026-08-18. Later YoYoLetrasAI 3.7/3.8 packages were worked on after that date. Therefore this repository cannot yet be certified as the latest production source.

Do not deploy this branch as replacement production until the latest 3.8.x source is reconciled into GitHub.

## Backend audit

Supabase project `xpcywpvrveweynqvudcr` is ACTIVE_HEALTHY.

Security advisor findings requiring review before migration:

- `public.enforce_premium_resource_quality_gate`: mutable `search_path` warning.
- SECURITY DEFINER RPC functions callable by authenticated users: `authorize_ai_request`, `complete_ai_request`, `is_platform_admin`, `set_ai_entitlement`.
- Leaked password protection is disabled.
- RLS enabled without policy on internal-looking tables: `automation_runtime_config`, `platform_secret_store`, `release_staging_chunks`.

These must be reviewed against the application call paths before changing privileges; blindly revoking access could break YOYO IA or owner administration.

Performance advisor findings are mostly non-blocking indexes/unused indexes. They should be optimized after functional compatibility is proven.

## Migration gate

Migration may proceed only when all are true:

1. Latest 3.8.x source is reconciled into this repository.
2. Current Next.js build and TypeScript checks pass.
3. `npx vinext check` passes or all reported compatibility gaps are resolved.
4. Supabase auth/login is verified.
5. YOYO IA credential/provider path is verified with no secret exposed client-side.
6. Owner profile and entitlement/admin flows pass.
7. Core routes, library, generators, Plan Lector, YOYO Play and document generation pass smoke tests.
8. A Cloudflare preview (`*.workers.dev`) is validated before any custom domain change.
9. Vercel production remains available as rollback until Cloudflare production is accepted.

## Cost rule

No paid Cloudflare resource, Supabase branch, new Supabase project, custom paid service, domain purchase, or production cutover should be created as part of readiness testing without explicit cost confirmation.
