# YoYoLetrasAI 3.6.0 — integración aislada

Este branch existe exclusivamente para integrar y validar el paquete 3.6.0 sin modificar producción, dominio, alias, configuración aprobada ni datos productivos.

## Fuente exacta recibida

- Archivo: `YoYoLetrasAI-3.6.0-owner-full-source.zip`
- SHA-256: `4a9a45ae0a19321fbcb65197019cc0634f3d8d3d9bb8e18de32d6ff39f863036`
- Archivos del paquete: 52
- Aplicación: Vite + React + Vercel Functions + Supabase

## Regla de seguridad

1. No promover automáticamente a `production`.
2. No modificar `yoyoletrasai.vercel.app` ni sus dominios/alias.
3. No reemplazar la configuración productiva actual.
4. No modificar secretos ni variables productivas durante la validación.
5. Todo cambio 3.6 debe probarse primero en Preview aislado.
6. Solo una autorización explícita posterior puede promover un artefacto ya validado.

## Alcance 3.6 que debe pasar validación

- Perfil propietario y permisos `platform_admin` / plan `propietaria` / tier `owner`.
- YOYO IA 3.0 y sus modos multimodales.
- Generación automática de recursos y actividades para los 19 módulos mediante fábrica rotativa.
- Owner Factory Manager y control de publicación.
- Investigación/Fuentes IA.
- Plan lector.
- Juegos inmersivos 3D con Three.js y fallback accesible.
- Animaciones y experiencia visual del paquete 3.6.
- Límites Basic/Premium y carga resumible.
- Google Cloud Storage según configuración 3.6.
- API `/api/health`, `/api/resources`, IA, owner, storage y cron.
- Migraciones Supabase 3.6 y automatizaciones.

Este archivo es un marcador de seguridad; no cambia producción.