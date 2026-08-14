# YoYoLetrasAI 3.6 — YOYO Core, Google private storage and original-resource factory

- Raises Basic to 22 files, 564 MiB per file and a 2.2 GiB corpus; Premium keeps unlimited commercial file count with 2.2 GiB per file and 22 GiB per corpus.
- Adds direct, resumable 8 MiB uploads to an owner-controlled private Google Cloud Storage bucket, with server-side entitlement and metadata verification.
- Adds YOYO Core 3.0 as the platform-owned pedagogical orchestration, audit and resource-generation layer.
- Adds weekly original-resource batches that rotate through all 19 modules and an owner review/publication queue.
- Adds a six-month official-source fingerprint radar so changes are detected and audited before pedagogical criteria change.
- Adds the owner dashboard for engine, storage, automation, coverage and quality thresholds.

Production activation still requires applying the new migrations, configuring the Google Cloud project/bucket/CORS, and installing the server-only environment variables. No private credential is included in the source archive.
