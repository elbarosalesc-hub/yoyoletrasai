# YOYOLETRASAI PREMIUM

Nueva plataforma educativa SaaS con inteligencia artificial para Chile y Latinoamérica.

> **IMPORTANTE:** la plataforma anterior queda obsoleta y no debe utilizarse como fuente de código, diseño, despliegue ni futuras actualizaciones.

## Propiedad y administración

- **Propietaria:** Elba Rosales
- **Correo administrador:** elba.rosalesc@gmail.com
- **Rama principal:** `main`

## Enlaces oficiales de la versión nueva

- **Nueva plataforma permanente:** https://yoyoletrasai-premium-elbarosalesc-pngs-projects.vercel.app
- **Repositorio oficial:** https://github.com/elbarosalesc-hub/yoyoletrasai
- **Backend Supabase:** https://xpcywpvrveweynqvudcr.supabase.co
- **Nuevo proyecto Vercel:** `yoyoletrasai-premium`

## Enlace antiguo — no utilizar

- `https://yoyoletrasai.vercel.app`

Ese dominio corresponde a la plataforma anterior. No debe tomarse como referencia para revisar diseño, funcionalidad, contenido ni despliegues nuevos.

## Regla de continuidad

Toda modificación futura debe partir exclusivamente desde:

1. el repositorio `elbarosalesc-hub/yoyoletrasai`;
2. la rama `main`;
3. el proyecto Supabase `xpcywpvrveweynqvudcr`;
4. el proyecto Vercel `yoyoletrasai-premium`;
5. el correo administrador `elba.rosalesc@gmail.com`.

## Arquitectura de publicación

GitHub es la fuente oficial del código. Vercel publica la nueva plataforma y Supabase proporciona base de datos, autenticación y servicios backend.

## Seguridad

Las claves privadas y `SUPABASE_SERVICE_ROLE_KEY` nunca deben almacenarse en GitHub. Deben mantenerse únicamente como variables de entorno cifradas en Vercel. El frontend debe utilizar exclusivamente la URL pública y la clave publicable de Supabase.
