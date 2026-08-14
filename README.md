# YoYoLetrasAI

Production candidate `3.6.0`.

## Local checks

```bash
npm install
npm run dev
npm run build
```

Vite serves the interface locally. YOYO IA is the product identity visible to users; model selection, fallback, tokens and provider credentials stay behind the server API. No provider key belongs in the browser.

## Secure bootstrap

1. Apply every SQL migration in `supabase/migrations`, including `20260813143000_two_plans_token_quotas_owner_credentials.sql`.
2. Configure `SUPABASE_SECRET_KEY` only in the server environment. The publishable key is not a substitute.
3. Create a 32-byte Base64 value for `YOYO_CREDENTIAL_ENCRYPTION_KEY`, for example with `openssl rand -base64 32`, and store it only in the server environment.
4. Sign in with the allowlisted owner account and open **Perfil propietario → Accesos y claves**.
5. From that screen, the owner can store or rotate the narrowly scoped AI Gateway key, create accounts with strong initial passwords, reset passwords, assign Basic/Premium and set a per-user token limit.
6. Create a private Google Cloud Storage bucket, configure CORS and set the five `GOOGLE_CLOUD_*` variables from `.env.example`. Do not expose the service-account private key to Vite.
7. Configure `YOYO_AUTOMATION_CRON_TOKEN` with the same secret stored by the database automation, or use Vercel's managed `CRON_SECRET` for Vercel Cron.

`AI_GATEWAY_API_KEY` remains an optional server-level bootstrap override. If it exists, it takes precedence over the owner-managed encrypted credential. Vercel OIDC is the final fallback. Never prefix a secret with `VITE_`, import it into client code or use a Supabase secret/service-role key in the browser.

Do not use `vercel env pull` casually on a shared project: it downloads the full environment. Configure only the required variables in the protected deployment environment.

## New candidate modules

- YOYO IA: independent product identity `YOYO-IA-EDU-CL-001`, server-controlled OpenAI model routing, complete activities, original images, evidence-bound reports, offline interactive presentations, captioned WebM videos and summaries.
- YOYO Research: real-time ranked search, source profiles, A/B/C authority classification, citations per finding, contradiction/limitation display and one-click conversion into an activity, presentation or report.
- Plan authorization: every request validates a signed-in Supabase user, active entitlement, allowed mode, private-file limits and reserved/consumed monthly tokens before generation.
- Two user plans: Basic includes 22 files per analysis, 564 MiB per file and a 2.2 GiB corpus; Premium includes 8,000,000 tokens/month, no commercial file-count limit, 2.2 GiB per file and processing in corpora up to 22 GiB.
- Google private storage: browser-to-bucket resumable uploads in 8 MiB blocks, server-issued sessions, metadata verification, CRC32C registration and short-lived read URLs for YOYO Core.
- YOYO Core resource factory: weekly original-resource batches rotate through all 19 modules, apply deterministic quality checks and publish automatically only when the owner enables that rule.
- Semestral radar: every six months the engine fingerprints authoritative curriculum, accessibility, AI-limit and storage sources; detected changes enter an auditable review trail instead of silently changing pedagogical behavior.
- Owner control: account creation, strong initial/reset passwords, Basic/Premium assignment, user-specific token caps and encrypted engine-key rotation are restricted to the verified platform owner.
- Analytical files: spreadsheets, datasets, source code and technical documents can be analyzed with traceable evidence, formulas, implementation guidance and test plans.
- Fuentes IA: private uploads of PDF, Word, PowerPoint, Excel, text and images; analysis, summary, activity or assessment; citations to page/slide/sheet/section, answer key, rubric, DUA, editable download and pedagogical saving.
- Plan Lector: weekly route, readings, vocabulary, evidence, DUA access, family bridge and progress.
- YOYO Play: WebGL 3D phonics world, reading escape room and rhythm-based syllable game.
- Mobile worksheet viewer: readable view, page view, 40–130% zoom, horizontal navigation and full screen.

The production gate and current-product comparison are documented in `docs/benchmark-v3.4.md` (updated for v3.6).
Current file-limit evidence and the Google Cloud activation procedure are documented in `docs/file-limit-benchmark-2026-08.md` and `docs/google-cloud-storage-setup.md`.
