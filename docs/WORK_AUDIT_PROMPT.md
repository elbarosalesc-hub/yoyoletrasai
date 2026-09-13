# Prompt maestro para ChatGPT Work — Auditoría integral YoYoLetrasAI

Usa este prompt cuando ChatGPT Work tenga acceso al navegador, al repositorio, a la plataforma desplegada y a los conectores necesarios.

---

Actúa como un equipo senior compuesto por:
- arquitecto/a SaaS y Cloudflare Workers;
- ingeniero/a senior Next.js 16 / React 19 / TypeScript;
- especialista en Supabase, RLS, seguridad y multi-tenant;
- diseñador/a UX/UI de producto educativo;
- especialista WCAG, DUA y accesibilidad;
- educador/a diferencial experto/a en PIE y currículum chileno;
- diseñador/a instruccional y especialista en evaluación formativa;
- desarrollador/a de experiencias WebGL/Three.js y juegos educativos;
- especialista QA, observabilidad, rendimiento y automatización.

OBJETIVO
Audita, corrige y mejora integralmente YoYoLetrasAI hasta dejarla coherente, operativa, medible, accesible, profesional y diferenciada. No hagas una auditoría teórica: inspecciona, prueba, corrige, valida y deja evidencia. Trabaja sobre el repositorio oficial `elbarosalesc-hub/yoyoletrasai`, rama `main`, y sobre la infraestructura Cloudflare Workers + Supabase actualmente activa. NO uses Vercel como infraestructura, gateway de IA, cron, referencia de despliegue ni destino de variables.

PRINCIPIOS NO NEGOCIABLES
1. YOYO IA es la IA propia de la plataforma; no presentes ChatGPT como si fuera la plataforma.
2. Mantén enfoque chileno: currículum, OA verificados, DUA, PIE, NEE transitorias/permanentes, evaluación formativa y lenguaje profesional docente.
3. No inventes códigos OA. Si un OA no está verificado, usa habilidad/objetivo sin código.
4. No copies contenido propietario de Kahoot, Nearpod, Canva, Twinkl, MagicSchool, EduFácil u otras plataformas. Úsalas sólo como benchmark de capacidades y experiencia.
5. No publiques cambios inseguros ni rompas producción. Usa ramas/PR, CI y rollback.
6. No expongas datos sensibles de estudiantes a modelos externos. Mantén anonimización y mínimo dato necesario.
7. No marques una función como “operativa” si sólo es demo, localStorage, mock o UI sin backend.
8. Ningún juego se considera “disponible” si no tiene escena/interacción real, mecánica propia, progresión pedagógica, feedback y alternativa accesible.
9. Toda acción automática de evolución debe ser gobernada: auditar/proponer puede ser automático; publicar código o cambios pedagógicos críticos requiere validación.

FASE 1 — DESCUBRIMIENTO Y EVIDENCIA
- Abre la plataforma de producción en Cloudflare y captura evidencia de los principales flujos: acceso, dashboard, perfil, Profesor Virtual, Crear con YOYO IA, Prompts IA, Biblioteca, Misiones, Cursos, Estudiantes, Evaluaciones, Progreso/OA, Evidencias, PIE/DUA, Familias, Informes, Integraciones, Juegos 3D, Evolución YOYO y Configuración.
- Verifica desktop 1440x900, tablet 768x1024 y móvil 390x844.
- Revisa consola, errores de red, tiempos de carga, rutas 404/500, hydration, focus, teclado, scroll horizontal, reduced-motion, contraste y estados loading/empty/error/success.
- Identifica botones decorativos, funciones simuladas, mocks y dependencias de localStorage que deban convertirse a persistencia institucional.
- Revisa repositorio, GitHub Actions, Cloudflare Workers Builds/Deployments, Wrangler, vinext, Supabase migrations, RLS, secretos y variables.

FASE 2 — INFRAESTRUCTURA CLOUDFLARE
- Confirma que no queden dependencias operativas de Vercel.
- Valida `wrangler.jsonc`, vinext/Vite, `nodejs_compat`, observabilidad, Workers Builds y preview deployments.
- Comprueba secretos de producción: Supabase, Cloudflare AI Gateway, owner identity y cron.
- Verifica AI Gateway de Cloudflare con el endpoint REST actual y los modelos realmente disponibles antes de cambiar IDs.
- Verifica Cron Trigger del Worker de evolución y que el gate real de 72 horas funcione.
- Comprueba logs, errores, límites, timeouts y consumo.

FASE 3 — SUPABASE Y SEGURIDAD
- Confirma que todas las migraciones del repositorio estén aplicadas, especialmente preferencias, Evolución YOYO y Misiones de Aprendizaje.
- Ejecuta advisors de seguridad y rendimiento.
- Audita RLS por organización, cursos, estudiantes, apoyos, OA, evidencias, misiones, progreso, recursos e IA.
- Busca BOLA/IDOR, uso incorrecto de service role, políticas UPDATE sin WITH CHECK, views sin security_invoker y funciones SECURITY DEFINER innecesarias.
- Verifica que `sensitive_notes` y otra información sensible nunca se envíen a IA externa.

FASE 4 — PRODUCTO Y UX
- Audita jerarquía visual, consistencia, navegación, densidad, estados, responsive y claridad de acciones.
- Unifica design system: tokens, botones, inputs, cards, badges, tablas, drawers, modales, skeletons, empty/error states y focus-visible.
- Corrige inconsistencias de nombres activos del AppShell.
- Reduce duplicación y elimina módulos que sólo repiten capacidades sin añadir valor.
- Mantén un flujo central: crear/adaptar → asignar como Misión → desarrollar → observar → evidenciar → analizar → decidir siguiente apoyo.

FASE 5 — PROFESOR VIRTUAL Y YOYO IA
- Prueba generación real, autorización por plan, fallback y errores.
- Valida que Profesor Virtual use curso, OA, evidencias y apoyos reales sin identificar estudiantes ante el modelo.
- Añade, si falta, acciones para convertir resultados a recurso, evaluación, Misión, informe o plan de apoyo.
- Evalúa calidad con una batería reproducible de prompts por nivel/asignatura/PIE/DUA.
- Revisa latencia, tokens, fallos, JSON inválido y recuperación.
- No dependas de un único proveedor: usa Cloudflare AI Gateway y routing configurable.

FASE 6 — BIBLIOTECA, MISIONES Y EVIDENCIA
- Verifica que asignar desde Biblioteca cree una Misión real en servidor.
- Añade asignación desde Crear con YOYO IA, Profesor Virtual, Evaluaciones y Juegos cuando sea pedagógicamente coherente.
- Permite curso, OA, fecha, modalidad de apoyo y diferenciación sin bajar el objetivo común.
- Verifica progreso individual, completitud, apoyo requerido y posterior evidencia.
- Elimina “asignaciones” o métricas que existan sólo en localStorage.

FASE 7 — JUEGOS
- Prueba Bosque de las inferencias, Feria matemática y Misión Agua.
- Verifica teclado, alternativa textual, alto contraste, movimiento reducido, audio opcional y feedback.
- Amplía variedad con nuevas mecánicas, no reskins: laboratorio/simulación, construcción, exploración geográfica, fonología/grafomotricidad, estrategia matemática y colaboración.
- Cada juego debe tener niveles, objetivo/habilidad, feedback causal, analítica y evidencia exportable.
- No marques un juego como disponible hasta que sea realmente jugable.

FASE 8 — QA AUTOMÁTICO
- Mantén typecheck + build + arranque + Playwright.
- Añade axe-core o equivalente a rutas críticas y exige cero violaciones críticas/serias.
- Añade Lighthouse/medición real de accesibilidad y rendimiento cuando el entorno lo permita.
- Añade regresión visual con artefactos comparativos para desktop/tablet/móvil.
- Prueba keyboard-only, reduced-motion, no horizontal overflow, formularios, errores y estados vacíos.
- Añade pruebas autenticadas con datos sandbox, nunca con datos sensibles reales.

FASE 9 — BENCHMARK
Compara capacidades actuales con Kahoot, Nearpod, Canva for Education, MagicSchool, NotebookLM, Perplexity, Claude, ChatGPT, Twinkl, EduFácil y referentes vigentes. Usa fuentes actuales. No midas por cantidad de features sino por:
- tiempo ahorrado al docente;
- calidad pedagógica;
- inclusión y accesibilidad;
- contexto curricular;
- integración entre módulos;
- trazabilidad del aprendizaje;
- calidad de juego/interactividad;
- privacidad/seguridad;
- administración institucional;
- fiabilidad y rendimiento.
Registra brechas verificables en Evolución YOYO y evita claims de “mejor del mercado” sin evidencia.

FASE 10 — IMPLEMENTACIÓN Y ENTREGA
- Corrige primero P0/P1 y luego P2.
- Para cada lote: rama → cambios → pruebas → screenshots/evidencia → PR → CI → merge si pasa.
- No dejes TODO críticos sin issue/backlog.
- Actualiza documentación de arquitectura y despliegue Cloudflare.
- Al finalizar entrega:
  1. resumen ejecutivo;
  2. tabla de hallazgos y estado;
  3. cambios implementados con PR/commit;
  4. capturas antes/después;
  5. resultados de QA/accessibility/performance;
  6. estado de Cloudflare y Supabase;
  7. brechas restantes priorizadas;
  8. riesgos y rollback;
  9. próximos 10 avances de mayor impacto.

CRITERIO FINAL
No termines al encontrar problemas: corrígelos cuando sea seguro y verificable. No llames “completa” a la plataforma sólo porque las pantallas existen. Debe haber persistencia, permisos, flujos reales, feedback, observabilidad, QA y evidencia pedagógica. Prioriza originalidad, calidad y utilidad real sobre volumen de funciones.
