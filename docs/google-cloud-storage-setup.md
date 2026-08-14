# Private Google Cloud Storage activation

The source is ready for a dedicated bucket owned by YoYoLetrasAI. Creating it is a billable Google Cloud action and requires the owner's project selection and credentials.

## Required owner decisions

1. Google Cloud project ID with billing enabled.
2. Globally unique bucket name.
3. Region. The source defaults to `southamerica-west1` for proximity to Chile; confirm availability and cost in the selected project.
4. Production origin allowed by CORS.

## Recommended bucket controls

- Uniform bucket-level access.
- Public access prevention enforced.
- Google-managed encryption at minimum; CMEK only if the organization already operates key rotation.
- Soft delete or object versioning according to the institution's retention policy.
- Lifecycle deletion for abandoned `uploading` objects and a documented retention period for completed source files.
- Dedicated service account with only the minimum object create/read/delete permissions on this bucket.

## CORS policy

Allow only the production and approved preview origins. Methods must include `PUT`; response headers must expose `Content-Range`, `Range`, `X-Goog-Hash` and `ETag`. Request headers must allow `Content-Type` and `Content-Range`. Do not use `*` in production when credentials or private upload-session URLs are involved.

## Server variables

Set these as encrypted Vercel environment variables, never with the `VITE_` prefix:

```text
GOOGLE_CLOUD_PROJECT_ID
GOOGLE_CLOUD_STORAGE_BUCKET
GOOGLE_CLOUD_CLIENT_EMAIL
GOOGLE_CLOUD_PRIVATE_KEY
GOOGLE_CLOUD_STORAGE_LOCATION
```

After activation, verify from **Perfil propietario → Motor y fábrica** that the status is `Conectado`, upload a small test file, remove it, then test a multi-block file larger than 8 MiB.
