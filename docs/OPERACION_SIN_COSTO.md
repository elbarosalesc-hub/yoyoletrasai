# Operación sin costo — YoYoLetrasAI

## Objetivo

Mantener una base funcional de YoYoLetrasAI que pueda operar sin servicios externos de pago, preservando la portada, los recursos aprobados y la arquitectura oficial.

## Base gratuita prioritaria

1. **Frontend y runtime:** Cloudflare Workers dentro de los límites del plan gratuito.
2. **Backend:** Supabase Free para autenticación, datos, RLS, almacenamiento y funciones dentro de sus cuotas.
3. **Código y QA:** repositorio público de GitHub y GitHub Actions para validación.
4. **Funciones de aula:** ejecutar en el navegador siempre que sea posible.
5. **Persistencia no sensible:** localStorage para preferencias, borradores e historial local cuando no sea necesario sincronizar.
6. **Audio local:** Web Audio API y Speech Synthesis del navegador.
7. **Visuales interactivos:** React, CSS y WebGL ya incluidos en la aplicación.

## Regla de costos

Las funciones esenciales deben tener una ruta que no requiera:
- modelos de IA externos;
- generación de video o avatar de pago;
- analítica premium;
- servicios SaaS de juegos;
- compras de almacenamiento adicional;
- APIs por llamada.

Las capacidades que puedan generar consumo deben mostrarse como **opcionales** y nunca ser necesarias para utilizar las herramientas básicas.

## Profesor Virtual

El Profesor Virtual debe ofrecer:
- **Generar gratis local** como opción prioritaria;
- YOYO IA como opción adicional;
- historial local cuando la persistencia institucional no esté disponible;
- lectura en voz alta con la voz del navegador;
- posibilidad de copiar y convertir el resultado en otros recursos.

El modo local no debe invocar rutas de IA, modelos, tokens ni APIs externas.

## Centro de Aula

Las siguientes herramientas deben funcionar completamente en el navegador:
- temporizador;
- selector equitativo;
- creador de grupos;
- semáforo visual por grupos;
- calculadora de calificación;
- medidor de velocidad lectora.

No deben requerir cuentas en servicios externos ni llamadas de pago.

## YOYO Play

Priorizar juegos implementados con los componentes ya incluidos en el repositorio. Antes de integrar un motor, SDK o servicio de terceros, comprobar que:
- no sea necesario para el funcionamiento del juego;
- no introduzca una cuota obligatoria;
- exista una alternativa textual/accesible;
- el juego conserve su objetivo pedagógico sin depender del servicio.

## Guardas de seguridad

- No exponer claves secretas en el navegador.
- Mantener RLS en tablas expuestas.
- No almacenar datos sensibles de estudiantes en localStorage.
- No activar facturación automática desde código.
- No eliminar fallbacks locales al añadir IA.
- No publicar cambios de producción sin pasar typecheck, build, regresión visual, pruebas de teclado y accesibilidad.

## Umbral preventivo

Antes de superar aproximadamente el 80% de una cuota gratuita, revisar el uso y reducir consumo antes de considerar un plan pagado. No ampliar plan ni habilitar facturación sin una decisión explícita de la propietaria.

## Principio de continuidad

Toda mejora nueva debe responder primero a esta pregunta:

> ¿Puede esta función resolver el objetivo pedagógico localmente o con la infraestructura gratuita ya disponible?

Si la respuesta es sí, esa será la implementación predeterminada.
