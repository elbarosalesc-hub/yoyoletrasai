# YoYoLetrasAI 3.6.0 — diagnóstico seguro de integración

Fecha: 2026-08-14

Este diagnóstico se realiza únicamente sobre la rama aislada `staging/v3.6.0-exact-20260814` y sobre lecturas de logs. No modifica producción, dominio, alias, variables productivas ni datos.

## Hallazgos

1. La producción restaurada continúa recibiendo tráfico en el despliegue anterior aprobado.
2. Los errores observados en un despliegue anterior distinto a la producción restaurada fueron:
   - `/api/owner/automation` → 401 `Inicia sesión como propietaria.`
   - `/api/cron/innovation-scan` → 401 `Solicitud de cron no autorizada.`
3. El paquete 3.6 exacto recibido no usa esa ruta antigua de propietario. El flujo 3.6 usa `session.access_token` de Supabase y lo transmite como `Authorization: Bearer <token>` a `/api/owner/factory` y otros endpoints de propietaria.
4. El paquete 3.6 exacto valida la automatización mediante `YOYO_AUTOMATION_CRON_TOKEN` o `CRON_SECRET` y exige encabezado Bearer coincidente.
5. La cuenta propietaria en Supabase está confirmada y dispone de `platform_admin`, plan `propietaria` y tier `owner`; por tanto, el problema de acceso no corresponde a ausencia del rol en base de datos.
6. La fábrica está configurada en base de datos, pero no registra ejecuciones exitosas; esto es coherente con que el backend 3.6 completo todavía no esté validado/desplegado como Preview operativo.

## Criterio de corrección

No se parcheará la producción antigua. Se validará el paquete 3.6 completo en Preview aislado con su propio flujo de autenticación y cron. Solo después de superar pruebas funcionales se podrá proponer una promoción explícita.

## Pruebas obligatorias de Preview

- Login de propietaria y carga del contexto `platform_admin`.
- Acceso a pestañas propietarias completas.
- `/api/owner/factory` con Bearer real de Supabase.
- Ejecución manual de fábrica y creación de candidatos.
- Cron de fábrica con token válido en Preview.
- YOYO IA, fuentes, plan lector, juegos 3D y navegación de los 19 módulos.
- `/api/health` y `/api/resources`.
- Confirmación de que no existe cambio de dominio ni promoción a production.
