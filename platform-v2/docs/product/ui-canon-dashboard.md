# Canon visual obligatorio: dashboard docente

## Fuente de verdad

La interfaz aprobada por la propietaria define el estándar visual obligatorio de YOYOLETRASAI V2 para desktop y mobile. Cualquier implementación que se aparte de su jerarquía, proporciones, paleta, navegación o densidad deberá justificarse mediante ADR y aprobación de producto.

## Layout desktop

- Contenedor principal blanco sobre canvas gris muy claro.
- Sidebar fija de 208 px con logo, navegación vertical y perfil docente al pie.
- Área principal con ancho máximo de 1180 px.
- Header con bienvenida, notificaciones y CTA `Crear actividad`.
- Grid de cuatro métricas.
- Hero central de juego destacado.
- Fila inferior con próximas actividades y acciones rápidas.

## Layout mobile

- Header compacto con menú, marca y notificaciones.
- Métricas en grid 2x2.
- Hero del juego en formato vertical.
- Navegación inferior fija con cinco destinos.
- Pantalla dedicada para el juego destacado.

## Navegación canónica

Desktop: Inicio, Biblioteca, Crear, YOYO, Juegos, Estudiantes, Informes, Configuración.

Mobile: Inicio, Biblioteca, Crear, YOYO, Juegos.

## Componentes obligatorios

- AppShell
- SidebarNav
- MobileTopBar
- MobileBottomNav
- WelcomeHeader
- NotificationBell
- PrimaryActionButton
- MetricCard
- FeaturedGameCard
- GameProgress
- UpcomingActivityCard
- QuickActionCard
- TeacherProfileCard

## Criterios de aceptación

1. La acción principal es visible sin scroll en desktop y mobile.
2. Las cuatro métricas conservan orden, color semántico y lectura rápida.
3. El juego destacado mantiene título, chips, CTA, vista previa y dos progresos.
4. La navegación activa es perceptible sin depender solo del color.
5. Todo control interactivo tiene estados hover, focus-visible, active, disabled y loading.
6. El diseño soporta teclado, zoom 200 %, movimiento reducido y contraste AA.
7. En 390 px no existe scroll horizontal.
8. En desktop el contenido no supera 1180 px y la sidebar permanece estable.
9. No se incorporan métricas ficticias en producción.
10. La revisión visual se realiza contra capturas baseline aprobadas.
