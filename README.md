# YoYo Letras AI

Reconstrucción total de la plataforma educativa sobre **Next.js 16, Vercel y Supabase**.

## Estado del rebuild

- Aplicación nueva en la raíz del repositorio.
- Dashboard inmersivo funcional y responsive.
- Autenticación SSR preparada con Supabase.
- PostgreSQL y Row Level Security definidos mediante migración.
- CI de GitHub configurado.
- Proyecto anterior conservado en la rama `archive/pre-rebuild-2026-07-30`.

## Desarrollo local

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm dev
```

La aplicación queda disponible en `http://localhost:3000` y el health check en `/api/health`.

## Supabase

1. Crear un proyecto en Supabase.
2. Copiar URL y Publishable Key en `.env.local`.
3. Ejecutar la migración `supabase/migrations/20260730190000_initial_platform.sql`.
4. Configurar la URL de callback `/auth/callback`.

## Vercel

Importar el repositorio desde GitHub. Vercel detectará Next.js desde la raíz. Agregar las variables de `.env.example` en Development, Preview y Production.

## Seguridad

Nunca subir `SUPABASE_SERVICE_ROLE_KEY` al repositorio ni exponerla con el prefijo `NEXT_PUBLIC_`.
