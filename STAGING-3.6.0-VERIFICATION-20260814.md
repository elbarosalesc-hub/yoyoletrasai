# Verificación aislada YoYoLetrasAI 3.6.0 — 2026-08-14

## Integridad del paquete

- Archivo fuente: `YoYoLetrasAI-3.6.0-owner-full-source.zip`
- SHA-256: `4a9a45ae0a19321fbcb65197019cc0634f3d8d3d9bb8e18de32d6ff39f863036`
- `unzip -t`: sin errores
- Archivos reales extraídos: 52
- Versión `package.json`: 3.6.0

## Componentes críticos confirmados en la fuente exacta

- `src/App.jsx`
- `src/modules.jsx`
- `src/features/ImmersiveGames.jsx`
- `src/features/OwnerFactoryManager.jsx`
- `src/features/YoyoAIStudio.jsx`
- `src/features/SourceLab.jsx`
- `src/features/ReadingPlan.jsx`
- `api/ai/generate.js`
- `api/owner/factory.js`
- `api/cron/resource-factory.js`
- `shared/yoyo-core.js`
- `shared/yoyo-ai-identity.js`
- `vercel.json`

## Comprobaciones funcionales de código

- `ImmersiveGames.jsx` instancia `THREE.WebGLRenderer`.
- `shared/yoyo-core.js` contiene `YOYO_MODULE_BLUEPRINTS`.
- `App.jsx` exige acceso propietario con `platform_admin` + plan `propietaria`.
- `vercel.json` contiene definición de cron jobs.

## Estado de build

Se intentó instalar dependencias en un entorno local aislado. La instalación quedó incompleta por timeout de red y `vite` quedó inválido/no disponible, por lo que todavía no se certifica un build reproducible local. Esto no afecta producción porque todo el trabajo se mantiene fuera de producción.

## Regla de seguridad

Este avance no autoriza ni ejecuta promoción a producción. No modificar dominio, alias, configuración productiva ni despliegue aprobado hasta que el Preview exacto 3.6 haya pasado validación completa.
