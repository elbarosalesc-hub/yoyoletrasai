# Revisión integral de YOYOLETRASAI

Fecha de revisión: 2 de agosto de 2026.

## Corrección aplicada

La ruta principal dejó de redirigir a la maqueta estática antigua ubicada en `/nueva-plataforma-2026/index.html`. Ahora utiliza directamente la presentación institucional moderna de Next.js, manteniendo un único origen visual y evitando que la portada pública quede desconectada de la aplicación real.

## Estado comprobado

- La aplicación funcional está construida con Next.js 16, React 19 y Supabase.
- Existen módulos reales para autenticación, selección institucional, cursos, estudiantes, perfiles PIE/DUA, objetivos de aprendizaje, evidencias y estado operativo.
- La seguridad multitenant se apoya en contexto institucional y políticas RLS.
- La vista pública no debe mostrar datos personales, institucionales ni pedagógicos reales.
- El centro de estado utiliza un contrato único para aplicación, configuración y conectividad de Supabase.

## Hallazgos prioritarios

### 1. Configuración de Vercel desalineada

El proyecto conectado en Vercel está interpretando la aplicación como Vite y sirve una portada estática independiente. La aplicación canónica del repositorio es Next.js y se encuentra en `apps/web`.

Configuración requerida en Vercel:

- Root Directory: `apps/web`
- Framework Preset: `Next.js`
- Install Command: `npm install`
- Build Command: `npm run build`
- Output Directory: automática de Next.js
- Node.js: 22 o superior

No se debe promover una nueva versión a producción hasta comprobar variables de entorno, compilación, autenticación y políticas RLS.

### 2. Navegación que debe consolidarse

Actualmente, Estudiantes y Analítica reutilizan `/seguimiento`. El módulo curricular real se encuentra en `/progreso`, mientras que la gestión de estudiantes permanece en `/seguimiento`. La navegación final debe mostrar:

- Estudiantes → `/seguimiento`
- Progreso por OA → `/progreso`
- Evidencias → `/seguimiento/evidencias`
- Estado del sistema → `/estado`

### 3. Deuda visual acumulada

El layout global importa numerosas hojas de estilo históricas. No deben eliminarse sin una prueba de regresión por ruta, pero conviene migrar progresivamente hacia estilos por módulo y retirar reglas duplicadas después de verificar:

- dashboard;
- cursos;
- estudiantes;
- ficha individual;
- progreso por OA;
- biblioteca;
- creación con IA;
- experiencia móvil.

### 4. Criterios de calidad para considerar una versión lista

- Compilación y typecheck sin errores.
- Navegación completa mediante teclado.
- Contraste y foco visibles según WCAG 2.2 AA.
- Estados vacíos, error, carga y éxito en todos los módulos.
- Ninguna cifra o evidencia simulada en áreas institucionales.
- Pruebas de aislamiento entre instituciones y roles.
- Validación responsive en 360 px, 768 px, 1024 px y escritorio amplio.
- Revisión de formularios con mensajes comprensibles y recuperación segura.

## Estrategia recomendada

1. Corregir la integración canónica de Vercel sin promoverla todavía a producción.
2. Ejecutar build y typecheck del workspace web.
3. Consolidar la navegación y el sistema visual.
4. Verificar los flujos reales de acceso, institución, cursos, estudiantes, apoyos y evidencias.
5. Crear una vista previa protegida para revisión final.
6. Promover únicamente después de aprobar seguridad, accesibilidad y funcionamiento.
