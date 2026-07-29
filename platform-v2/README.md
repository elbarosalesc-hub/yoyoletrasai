# YOYOLETRASAI Platform V2

Nueva base profesional para la reconstruccion total de YOYOLETRASAI.

## Principios

- Base limpia: no importa codigo desde la aplicacion legacy.
- Monorepo con aplicaciones web, API y worker.
- TypeScript estricto.
- Arquitectura modular y multi-tenant.
- Calidad automatizada mediante CI.
- Ningun secreto en el repositorio.

## Estructura inicial

- `apps/web`: experiencia web responsive.
- `apps/api`: API modular versionada.
- `apps/worker`: procesos asincronos.
- `packages/contracts`: contratos compartidos.
- `packages/validation`: validacion compartida.
- `packages/observability`: logs y trazabilidad.
- `docs`: arquitectura y decisiones tecnicas.

## Estado

Sprint 0 en construccion. Esta carpeta se mantiene aislada del codigo legacy hasta que la nueva plataforma sea validada.