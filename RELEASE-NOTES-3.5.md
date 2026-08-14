# YoYoLetrasAI 3.5.0 — acceso propietario, tokens y archivos

## Implementado

- Identidad visible **YOYO IA**, independiente de otras plataformas; el servidor usa únicamente rutas OpenAI y una herramienta separada de recuperación web.
- Dos planes para usuarios:
  - **Básico:** 500.000 tokens al mes, carga y análisis de hasta 3 archivos, 5 MB por archivo y 15 MB por análisis.
  - **Premium:** 8.000.000 tokens al mes, carga y análisis sin límite comercial de cantidad, 20 MB por archivo y 50 MB técnicos por análisis.
- Reserva atómica y registro del consumo real de tokens por usuario. Las reservas abandonadas dejan de bloquear la cuota después de 15 minutos.
- Carga directa al bucket privado `yoyo-ai-sources`, con políticas RLS por carpeta de usuario. Los archivos ya no viajan como Base64 en el cuerpo de la API.
- Nuevo panel **Perfil propietario → Accesos y claves** para:
  - crear cuentas y contraseñas iniciales fuertes;
  - restablecer contraseñas;
  - asignar Básico o Premium;
  - fijar una cuota especial de tokens;
  - suspender/reactivar accesos;
  - revisar consumo mensual;
  - guardar o rotar la clave del motor cifrada con AES-256-GCM.

## Activación pendiente en producción

La migración `supabase/migrations/20260813143000_two_plans_token_quotas_owner_credentials.sql` está incluida, pero **no fue aplicada al proyecto Supabase compartido** porque la protección del entorno exigió aprobación explícita por su impacto sobre planes y usuarios existentes.

Antes de desplegar la interfaz 3.5.0:

1. Revisar y aprobar la reasignación `docente → basico` y `profesional/institucion → premium`.
2. Aplicar la migración.
3. Configurar `SUPABASE_SECRET_KEY` y `YOYO_CREDENTIAL_ENCRYPTION_KEY` en el servidor.
4. Activar en Supabase Auth la protección contra contraseñas filtradas.
5. Desplegar aplicación y funciones en el mismo cambio.
6. Probar una cuenta Básico y una Premium con archivos reales y una cuota reducida de ensayo.

## Verificación realizada

- `npm run build`: correcto.
- Importación de todas las funciones de servidor: correcta.
- Dependencias instaladas y consistentes: correctas.
- La verificación visual automatizada no pudo ejecutarse porque el entorno no dispone de Chrome/Chromium.

Una ventaja frente a productos externos debe sostenerse con el benchmark reproducible de `docs/benchmark-v3.4.md`; no se considera demostrado un liderazgo universal sólo por una declaración comercial.
