# YOYOLETRASAI · Production readiness

Actualizado: 2026-09-30

Este documento describe el estado y la configuración que exige el `main` actual. No contiene valores de secretos ni placeholders.

## Arquitectura canónica

- Código: GitHub (`main`).
- Runtime: Cloudflare Workers mediante vinext/Cloudflare Vite.
- Backend y autenticación: Supabase.
- YOYO IA: integración server-side configurable para Cloudflare AI/Gateway.
- Vercel no forma parte de la infraestructura activa documentada aquí.

## Cadena actual de validación y despliegue

La ruta automática actual es:

1. `Premium validation` se ejecuta en `push` a `main` (además de las ramas explícitas del workflow) y en `pull_request` hacia `main`.
2. Cuando una ejecución de `Premium validation` termina con `success` y su `head_branch` es `main`, dispara `Production preflight`.
3. Cuando `Production preflight` termina con `success` y su `head_branch` es `main`, dispara `Deploy Cloudflare production`.

`Production preflight` también admite ejecución manual mediante `workflow_dispatch`.

`Deploy Cloudflare production` también admite ejecución manual mediante `workflow_dispatch`, pero en ese caso exige que el input `confirm_production` sea exactamente `DEPLOY`.

Por lo tanto, `.github/workflows/deploy-cloudflare.yml` **no es exclusivamente manual**: publica automáticamente después de un `Production preflight` exitoso en `main`, y ese preflight puede provenir de una `Premium validation` exitosa en `main`.

El job de preflight y el job de deploy declaran `environment: production`. El deploy hace checkout explícito de `main`.

## Premium validation

Archivo: `.github/workflows/premium-validation.yml`.

### Disparadores

- `push` a:
  - `main`
  - `agent/full-premium-rebuild-v2`
  - `agent/corregir-mejorar-plataforma`
- `pull_request` hacia `main`

### Gates actuales

1. protección de superficies aprobadas (`npm run verify:approved-surfaces`);
2. instalación con lockfile;
3. TypeScript;
4. build Next.js;
5. build vinext para Cloudflare Workers;
6. verificación de `apps/web/dist/client` y `apps/web/dist/server/wrangler.json`;
7. `wrangler deploy --dry-run`;
8. regresión visual Playwright;
9. regresión del catálogo de juegos;
10. verificación de preview pública y navegación por teclado;
11. regresión autenticada cuando existe toda su configuración;
12. Lighthouse accessibility con mínimo 95% en `/presentacion` y `/acceso`;
13. subida de evidencias de regresión visual, Lighthouse y preview cuando correspondan.

### Configuración

No hay secretos o variables obligatorios para que el workflow ejecute sus gates públicos y de build.

**Opcional para iniciar la aplicación con Supabase público:**

- variable `NEXT_PUBLIC_SUPABASE_URL`
- secret `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Si ambos están presentes, se exportan durante el arranque de la aplicación. Si falta alguno, el workflow conserva el fallback de preview pública.

**Condicional para ejecutar el gate autenticado:** deben existir los cuatro valores siguientes; si falta cualquiera, ese gate se omite con un notice:

- secret `E2E_TEST_EMAIL`
- secret `E2E_TEST_PASSWORD`
- variable `NEXT_PUBLIC_SUPABASE_URL`
- secret `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Production preflight

Archivo: `.github/workflows/production-preflight.yml`.

### Disparadores

- manual: `workflow_dispatch`;
- automático: al completarse `Premium validation`, solo si la ejecución upstream terminó con `success` y su `head_branch` es `main`.

El job usa el environment `production`.

### Configuración obligatoria

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

El preflight falla si falta cualquiera de esos valores.

### Configuración opcional

- variable `YOYO_PRODUCTION_URL`
- variable `YOYO_BILLING_PROVIDER`

Si `YOYO_PRODUCTION_URL` está configurada, el preflight exige que use `https://` y consulta `/api/health`. Una respuesta distinta de HTTP 200 genera warning en este paso, no un fallo por sí sola.

### Configuración condicional: Mercado Pago

Solo cuando `YOYO_BILLING_PROVIDER == "mercadopago"` pasan a ser obligatorios:

- secret `MERCADOPAGO_ACCESS_TOKEN`
- secret `MERCADOPAGO_WEBHOOK_SECRET`
- variable `YOYO_PRODUCTION_URL`

Además, debe existir **al menos uno** de estos secrets:

- `MERCADOPAGO_PREMIUM_PLAN_ID`
- `MERCADOPAGO_INSTITUTION_PLAN_ID`

## Deploy Cloudflare production

Archivo: `.github/workflows/deploy-cloudflare.yml`.

### Disparadores

- manual: `workflow_dispatch` con `confirm_production=DEPLOY`;
- automático: al completarse `Production preflight`, solo si terminó con `success` y su `head_branch` es `main`.

El job usa el environment `production`, hace checkout explícito de `main`, vuelve a ejecutar validación de configuración, typecheck y builds, despliega el Worker y exige que `/api/health` responda correctamente después de publicar.

### Configuración obligatoria

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

### Configuración opcional

Estos valores se incorporan al archivo efímero de runtime solo cuando están definidos, pero el workflow no los exige de forma general:

Secrets:

- `YOYO_AI_GATEWAY_URL`
- `YOYO_BILLING_CHECKOUT_URL`
- `MERCADOPAGO_ACCESS_TOKEN`
- `MERCADOPAGO_WEBHOOK_SECRET`
- `MERCADOPAGO_PREMIUM_PLAN_ID`
- `MERCADOPAGO_INSTITUTION_PLAN_ID`

Variables:

- `YOYO_AI_MODEL_ESSENTIAL`
- `YOYO_AI_MODEL_ADVANCED`
- `YOYO_AI_MODEL_INSTITUTION`
- `YOYO_AI_MODEL_OWNER`
- `YOYO_BILLING_PROVIDER`
- `YOYO_PRODUCTION_URL`

`YOYO_PRODUCTION_URL` tiene además una función operativa: si está definida, se usa como URL pública para el health check posterior al deploy; si no está definida, el workflow intenta detectar una URL `workers.dev` en la salida de Wrangler. Si ninguna de las dos rutas produce una URL pública, el deploy falla.

### Configuración condicional: Mercado Pago

Cuando `YOYO_BILLING_PROVIDER == "mercadopago"`, son obligatorios:

- secret `MERCADOPAGO_ACCESS_TOKEN`
- secret `MERCADOPAGO_WEBHOOK_SECRET`
- variable `YOYO_PRODUCTION_URL`

Y debe existir al menos uno de:

- `MERCADOPAGO_PREMIUM_PLAN_ID`
- `MERCADOPAGO_INSTITUTION_PLAN_ID`

## Evolución YOYO programada

Archivo: `.github/workflows/evolution-schedule.yml`.

### Disparadores

- schedule diario: `0 5 * * *`;
- manual: `workflow_dispatch`.

El workflow no declara `environment: production`.

### Configuración obligatoria

- `CRON_SECRET` como secret.
- `YOYO_PRODUCTION_URL`, obtenida con esta precedencia:
  1. variable `YOYO_PRODUCTION_URL`;
  2. secret `YOYO_PRODUCTION_URL` como fallback.

La URL resultante debe existir y comenzar con `https://`.

El heartbeat es diario, pero la API debe reportar `cadenceHours == 72`. El workflow también comprueba que la publicación automática y los cambios directos en producción permanezcan bloqueados y que la revisión humana siga siendo obligatoria.

## Matriz resumida de configuración

| Workflow | Obligatoria | Opcional | Condicional |
| --- | --- | --- | --- |
| Premium validation | Ninguna para build/gates públicos | Supabase público | E2E autenticado requiere email, password y par público de Supabase |
| Production preflight | Credenciales Cloudflare deploy/runtime, Supabase público + service role, `CRON_SECRET`, `YOYO_OWNER_EMAIL` | `YOYO_PRODUCTION_URL`, `YOYO_BILLING_PROVIDER` | Con Mercado Pago: token, webhook, URL de producción y al menos un plan |
| Deploy Cloudflare production | Mismo núcleo obligatorio del preflight | IA, modelos, billing checkout/provider, `YOYO_PRODUCTION_URL`, datos Mercado Pago mientras no esté habilitado | Con Mercado Pago: token, webhook, URL de producción y al menos un plan |
| Evolución YOYO programada | `CRON_SECRET` y `YOYO_PRODUCTION_URL` (variable o secret fallback) | Ninguna declarada | Fallback de `YOYO_PRODUCTION_URL` desde variable a secret |

## Supabase

El repositorio contiene migraciones versionadas para preferencias, misiones, evidencias, evolución, historial del Profesor Virtual y fábrica de recursos, entre otras.

La verificación directa de esquema/migraciones en el proyecto productivo sigue requiriendo evidencia independiente del contenido de estos workflows. No declarar migraciones como aplicadas en producción sin comprobarlas contra el proyecto real.

## Fábrica automática y autoevolución

- Cadencia esperada por la API: 72 horas.
- El workflow programado verifica que `automaticPublishing` permanezca en `false`.
- Verifica que `humanReviewRequired` sea `true`.
- Verifica que `productionChangesApplied` permanezca en `false`.
- Verifica la gobernanza `audit-propose-and-draft-only`.
- La revisión humana sigue siendo obligatoria antes de aplicar cambios.

## Producción online

No registrar ni mostrar una URL como producción oficial hasta disponer de evidencia de que:

1. la configuración obligatoria aplicable está completa;
2. las migraciones/RLS necesarias de Supabase están verificadas contra el proyecto real;
3. la cadena de validación/despliegue correspondiente terminó con éxito;
4. `/api/health` y la navegación pública fueron comprobados sobre la URL desplegada.

No inventar, inferir ni documentar valores de secretos. Una URL `workers.dev` solo debe tratarse como URL desplegada cuando haya sido detectada por el propio workflow o verificada directamente.
