# Despliegue Vercel + Supabase

## Variables obligatorias

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

## Variable solo servidor

- `SUPABASE_SERVICE_ROLE_KEY`

## Orden de vinculación

1. Crear proyecto Supabase en la región más conveniente para Chile.
2. Ejecutar migraciones y revisar políticas RLS.
3. Importar `elbarosalesc-hub/yoyoletrasai` en Vercel.
4. Seleccionar la rama de rebuild para el primer preview.
5. Agregar variables para Preview y Production.
6. Configurar en Supabase las URLs autorizadas del dominio de Vercel.
7. Validar `/api/health`, login, callback y dashboard.
8. Promover el despliegue validado y luego fusionar a `main`.

## Criterios de cutover

- CI verde.
- Migración aplicada sin errores.
- Login y cierre de sesión validados.
- RLS comprobado con dos usuarios de instituciones diferentes.
- Dashboard usable en escritorio y móvil.
- Rollback disponible mediante `archive/pre-rebuild-2026-07-30`.
