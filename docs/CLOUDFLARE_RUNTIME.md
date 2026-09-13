# Runtime vigente: Cloudflare Workers + Supabase

## Decisión de arquitectura

YoYoLetrasAI ya no utiliza Vercel como infraestructura activa. La arquitectura objetivo es:

- **Cloudflare Workers**: runtime y publicación de la aplicación.
- **Supabase**: PostgreSQL, Auth, RLS, Storage y backend de datos.
- **Cloudflare AI REST / AI Gateway**: capa de acceso a modelos para YOYO IA y Profesor Virtual.
- **GitHub**: fuente de código, CI y scheduler de respaldo para Evolución YOYO.

## IA

El código usa `apps/web/lib/ai/cloudflare-gateway.ts` como única capa de transporte hacia modelos externos.

Variables server-side:

- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `YOYO_AI_GATEWAY_URL` (opcional)
- `YOYO_AI_MODEL_ESSENTIAL`
- `YOYO_AI_MODEL_ADVANCED`
- `YOYO_AI_MODEL_INSTITUTION`
- `YOYO_AI_MODEL_OWNER`

La URL por defecto es:

`https://api.cloudflare.com/client/v4/accounts/<ACCOUNT_ID>/ai/v1/chat/completions`

Los IDs de modelos son configuración y deben verificarse contra la disponibilidad actual de Cloudflare antes de modificarse.

## Evolución YOYO

`/api/cron/evolution` es una ruta protegida con `CRON_SECRET` y mantiene internamente el gate de 72 horas. El trigger se registra como `system`, por lo que no depende del proveedor de hosting.

`.github/workflows/evolution-schedule.yml` puede activar la ruta diariamente. Para que opere se deben definir en GitHub Actions Secrets:

- `YOYO_PRODUCTION_URL`
- `CRON_SECRET`

La llamada diaria no implica una auditoría diaria: la propia aplicación omite ejecuciones si la última auditoría ocurrió hace menos de 72 horas.

## Next.js 16 en Workers

Cloudflare recomienda actualmente **vinext** como ruta predeterminada para ejecutar Next.js en Workers. No se agregó una conversión automática a vinext en este cambio porque el repositorio debe pasar primero `vinext check` sobre el runtime realmente desplegado. Forzar `vinext init` sin comprobar compatibilidad puede romper una migración que ya esté operativa.

Cuando ChatGPT Work tenga acceso al runtime:

1. inspeccionar el Worker actualmente desplegado;
2. ejecutar `npx vinext check` en el proyecto;
3. comparar la configuración existente con la recomendada por Cloudflare;
4. migrar sólo si el check confirma compatibilidad o si las diferencias pueden corregirse de forma segura;
5. validar SSR, route handlers, cookies, Supabase SSR, uploads, Three.js, IA y cron;
6. desplegar primero preview, luego producción con rollback disponible.

## Seguridad

- Nunca poner `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDFLARE_API_TOKEN` ni `CRON_SECRET` en variables públicas.
- Mantener RLS en todas las tablas expuestas.
- El Profesor Virtual no envía nombres de estudiantes al modelo.
- Los secretos deben administrarse en Cloudflare/GitHub/Supabase, no en el repositorio.

## Auditoría Work

El procedimiento completo está en `docs/WORK_AUDIT_PROMPT.md`.
