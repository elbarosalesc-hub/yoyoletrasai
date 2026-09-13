# YOYOLETRASAI PREMIUM

Plataforma educativa SaaS con inteligencia artificial para Chile y Latinoamérica.

> **IMPORTANTE:** la plataforma anterior y la infraestructura anterior quedan obsoletas. No deben utilizarse como fuente de código, diseño, despliegue ni futuras actualizaciones.

## Propiedad y administración

- **Propietaria:** Elba Rosales
- **Rama principal:** `main`
- **Repositorio oficial:** `elbarosalesc-hub/yoyoletrasai`
- **Backend:** Supabase
- **Runtime / despliegue web:** Cloudflare Workers

## Arquitectura vigente

- GitHub es la fuente oficial del código.
- Cloudflare Workers es la infraestructura de ejecución y publicación de la aplicación.
- Supabase proporciona base de datos, autenticación, RLS y servicios backend.
- YOYO IA utiliza un runtime de IA desacoplado y configurable sobre Cloudflare AI.
- Las automatizaciones periódicas se autorizan con `CRON_SECRET` y no dependen de un proveedor de hosting concreto.

## Regla de continuidad

Toda modificación futura debe partir exclusivamente desde:

1. el repositorio `elbarosalesc-hub/yoyoletrasai`;
2. la rama `main`;
3. el proyecto Supabase configurado por variables de entorno;
4. Cloudflare Workers como runtime de producción;
5. secretos administrados fuera del repositorio.

## Variables críticas

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `CLOUDFLARE_ACCOUNT_ID`
- `CLOUDFLARE_API_TOKEN`
- `YOYO_AI_GATEWAY_URL` (opcional)
- `CRON_SECRET`
- `YOYO_PRODUCTION_URL`

Nunca almacenar secretos reales en GitHub. El frontend sólo debe recibir variables explícitamente públicas. Las credenciales de servicio, Cloudflare AI y automatización son exclusivamente server-side.

## IA

YOYO IA no debe acoplarse a un único proveedor de modelos. El routing por plan se configura mediante `YOYO_AI_MODEL_*` y pasa por la capa de Cloudflare. Antes de cambiar IDs de modelos se debe comprobar disponibilidad actual en Cloudflare.

## Automatización y evolución

El Centro de Evolución YOYO audita y propone mejoras. La automatización no publica código ni recursos críticos por sí sola. La cadencia objetivo es cada 72 horas y la ruta programada mantiene un gate de cadencia además de autorización mediante secreto.

## QA

Los pull requests hacia `main` deben pasar typecheck, build, arranque, Playwright, controles responsive y accesibilidad básica. Las auditorías visuales integrales se realizan con navegador y evidencia de capturas cuando el entorno Work esté disponible.

El prompt maestro para esa auditoría está versionado en `docs/WORK_AUDIT_PROMPT.md`.
