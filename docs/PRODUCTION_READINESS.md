# YOYOLETRASAI · Production readiness

Actualizado: 2026-09-13

## Arquitectura canónica

- Código: GitHub (`main`).
- Runtime: Cloudflare Workers mediante vinext/Cloudflare Vite.
- Backend y autenticación: Supabase.
- YOYO IA: Cloudflare AI mediante runtime server-side.
- Vercel no forma parte de la infraestructura activa.

## Validación automática disponible

La CI premium ejecuta:

1. `npm ci` con lockfile.
2. TypeScript.
3. build Next.js.
4. build vinext para Cloudflare Workers.
5. validación de `apps/web/dist/server/wrangler.json`.
6. `wrangler deploy --dry-run`.
7. regresión visual Playwright.
8. Axe + navegación por teclado.
9. regresión autenticada cuando existen credenciales E2E y configuración pública de Supabase.
10. Lighthouse accessibility con umbral interno >= 95 en las vistas públicas evaluadas.

## Despliegue

`.github/workflows/deploy-cloudflare.yml` es el único flujo canónico de publicación. Es manual, protegido por el environment `production` y exige escribir `DEPLOY` antes de ejecutar.

El workflow no debe ejecutarse hasta completar el environment `production` de GitHub.

### Valores obligatorios detectados por el preflight

Secrets:

- `CF_DEPLOY_API_TOKEN`
- `CF_DEPLOY_ACCOUNT_ID`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CRON_SECRET`
- `YOYO_OWNER_EMAIL`
- `YOYO_RUNTIME_CLOUDFLARE_ACCOUNT_ID`
- `YOYO_RUNTIME_CLOUDFLARE_API_TOKEN`

Variables:

- `NEXT_PUBLIC_SUPABASE_URL`

Opcionales:

- `YOYO_PRODUCTION_URL`
- `YOYO_AI_GATEWAY_URL`
- variables de modelos YOYO IA

El preflight ejecutado el 2026-09-13 confirmó que el environment `production` no tenía configurados los valores obligatorios. No se debe sustituir esta configuración por valores placeholder ni almacenar secretos en el repositorio.

## Supabase

El repositorio contiene migraciones versionadas para preferencias, misiones, evidencias, evolución, historial del Profesor Virtual y fábrica de recursos, entre otras.

La verificación directa de esquema/migraciones en el proyecto productivo está pendiente de evidencia porque el canal SQL del conector Supabase devolvió timeout en los intentos de lectura realizados. La API de administración sí confirmó que existe al menos una clave publicable activa para el proyecto.

No declarar las migraciones como aplicadas en producción hasta comprobarlas contra el proyecto real.

## Fábrica automática y autoevolución

- Cadencia: 72 horas.
- Genera candidatos de recurso, no publicaciones directas.
- `quality_score` inicia sin aprobar.
- La publicación requiere revisión humana y quality gate.
- No se inventan códigos OA.
- No se envían `sensitive_notes` a YOYO IA.

## Juegos

El catálogo canónico contiene 12/12 experiencias marcadas como jugables. Todas las incorporaciones recientes fueron sometidas a build Next, vinext, dry-run Cloudflare y QA premium antes del merge.

## Producción online

No registrar ni mostrar una URL como producción oficial hasta que se cumplan los cuatro puntos:

1. environment `production` completo;
2. migraciones/RLS de Supabase verificadas;
3. workflow protegido de Cloudflare ejecutado con éxito;
4. `/api/health` y navegación pública comprobados sobre la URL desplegada.

La ausencia de una URL verificada no debe sustituirse por una dirección `workers.dev` inferida o inventada.
