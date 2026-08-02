# Conexión de YOYOLETRASAI con Supabase

## 1. Crear o seleccionar el proyecto

En Supabase, crea un proyecto para YOYOLETRASAI o selecciona uno existente. No publiques ninguna clave en GitHub.

## 2. Variables de entorno

Copia `.env.example` como `apps/web/.env.local` y completa:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

La clave `SUPABASE_SERVICE_ROLE_KEY` es solo para procesos seguros del servidor. No debe utilizarse en componentes cliente ni variables con prefijo `NEXT_PUBLIC_`.

## 3. Instalar dependencias

```bash
npm install
```

## 4. Vincular Supabase CLI

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

## 5. Aplicar migraciones

```bash
npx supabase db push
```

La migración inicial crea:

- organizaciones;
- perfiles;
- membresías institucionales y roles;
- cursos;
- funciones auxiliares de autorización;
- políticas Row Level Security;
- creación automática de perfil al registrar un usuario.

## 6. Probar la conexión

Con la aplicación en ejecución, abre:

```text
/api/health/supabase
```

Una respuesta correcta será:

```json
{"ok":true,"service":"supabase"}
```

## 7. Generar tipos TypeScript

Con Supabase local iniciado:

```bash
npm run supabase:types
```

Para el proyecto remoto también se pueden generar tipos mediante el `project-ref` y guardarlos en `apps/web/lib/supabase/database.types.ts`.

## 8. Seguridad obligatoria

- Mantener RLS activa en toda tabla con datos escolares.
- No usar la service role desde el navegador.
- Separar datos por organización.
- Aplicar privilegio mínimo.
- Auditar cambios sensibles.
- No guardar diagnósticos o antecedentes sensibles en tablas generales.
- Crear políticas específicas antes de incorporar estudiantes, familias, evidencias o apoyos PIE.
