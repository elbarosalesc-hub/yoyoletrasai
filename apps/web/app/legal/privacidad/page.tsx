import { AlertTriangle, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Privacidad · borrador | YOYOLETRASAI',
  description: 'Borrador operativo de privacidad y tratamiento de datos de YOYOLETRASAI.',
  robots: { index: false, follow: false },
}

const sectionStyle = { background: '#fff', border: '1px solid #e6e4ef', borderRadius: 18, padding: 22, marginBottom: 14, lineHeight: 1.65 } as const

export default function PrivacyDraftPage() {
  return (
    <>
      <section style={{ ...sectionStyle, padding: 30 }}>
        <p style={{ fontWeight: 800, color: '#6247aa' }}>Versión operativa 0.1 · 13 de septiembre de 2026</p>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', marginBottom: 8 }}>Privacidad y tratamiento de datos</h1>
        <p>Documento técnico-operativo que describe el diseño actual de privacidad de YOYOLETRASAI antes de su revisión jurídica definitiva.</p>
      </section>
      <section style={{ ...sectionStyle, borderColor: '#e7b64c' }}><p><AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} /><strong>Revisión jurídica pendiente.</strong> Este borrador no afirma cumplimiento legal definitivo ni sustituye una política aprobada por asesoría jurídica. Debe completarse con la identidad legal del responsable, canales de contacto, bases jurídicas y plazos definitivos antes del lanzamiento comercial.</p></section>
      <section style={sectionStyle}><h2>1. Principio de minimización</h2><p>YOYO está diseñado para usar la menor cantidad de información necesaria para prestar una función educativa. Las pantallas y servicios deben evitar solicitar datos de estudiantes que no sean pertinentes para la finalidad pedagógica seleccionada.</p></section>
      <section style={sectionStyle}><h2>2. Categorías de información</h2><p>Según los módulos habilitados, la plataforma puede procesar datos de cuenta y rol, institución y cursos, preferencias profesionales, objetivos y actividades educativas, misiones, progreso, evidencias pedagógicas, recursos creados, historial de Profesor Virtual y datos técnicos necesarios para seguridad y operación.</p></section>
      <section style={sectionStyle}><h2>3. Información de estudiantes</h2><p>La institución y sus profesionales deben limitar la información estudiantil a lo necesario para apoyar enseñanza, evaluación, seguimiento y accesibilidad. Los antecedentes sensibles no deben reutilizarse para finalidades distintas ni enviarse a servicios de IA cuando no sean indispensables. El diseño actual excluye `sensitive_notes` de los contextos enviados al modelo.</p></section>
      <section style={sectionStyle}><h2>4. YOYO IA y generación de contenido</h2><p>YOYO IA puede recibir instrucciones pedagógicas, contexto institucional seleccionado y material necesario para la tarea solicitada. El producto está diseñado para minimizar identificación directa y para impedir que secretos del servidor lleguen al navegador. Los resultados generados requieren revisión profesional cuando puedan afectar evaluación, adecuaciones, evidencias u otras decisiones sensibles.</p></section>
      <section style={sectionStyle}><h2>5. Infraestructura y proveedores técnicos</h2><p>La arquitectura prevista utiliza Supabase para servicios de datos/autenticación y Cloudflare Workers para ejecución y servicios de IA cuando estén efectivamente configurados. Otros proveedores sólo deben considerarse activos si existe una conexión real y verificable. Este documento no afirma que una integración opcional esté operativa por el solo hecho de aparecer en la interfaz.</p></section>
      <section style={sectionStyle}><h2>6. Integraciones institucionales</h2><p>Canvas, Google Classroom u otros servicios externos deben usar autorización revocable y permisos mínimos. Mientras el consentimiento OAuth no esté implementado y completado, YOYO no debe importar cursos, estudiantes, entregas o calificaciones ni presentar la integración como conectada.</p></section>
      <section style={sectionStyle}><h2>7. Seguridad</h2><p>El diseño separa secretos del servidor de los datos expuestos al navegador, aplica controles por rol, RLS en tablas públicas cuando corresponde, revisión humana para acciones sensibles y pruebas automáticas de accesibilidad y regresión. Ninguna medida elimina por completo el riesgo, por lo que la operación debe mantener monitoreo, actualización y respuesta documentada ante incidentes.</p></section>
      <section style={sectionStyle}><h2>8. Conservación y eliminación</h2><p>Los plazos definitivos de conservación deben establecerse en la política jurídica aprobada según la finalidad, obligaciones institucionales y tipo de registro. El producto debe evitar conservar información indefinidamente sin una finalidad activa y deberá incorporar procedimientos verificables de exportación, corrección y eliminación cuando el modelo contractual los defina.</p></section>
      <section style={sectionStyle}><h2>9. Acceso y responsabilidades institucionales</h2><p>Las organizaciones administradoras deben controlar quién puede acceder a cursos, evidencias, informes y configuraciones. El acceso técnico de una persona no debe utilizarse para finalidades incompatibles con su rol o con la autorización institucional correspondiente.</p></section>
      <section style={sectionStyle}><h2>10. Derechos y solicitudes</h2><p>La versión jurídica final deberá identificar al responsable del tratamiento y un canal formal para solicitudes de acceso, rectificación, eliminación u otros derechos aplicables. Hasta que esos datos estén definidos, YOYO no debe publicar un contacto o plazo inventado.</p></section>
      <section style={sectionStyle}><h2>11. Cambios y trazabilidad</h2><p>Los cambios relevantes a privacidad, infraestructura o finalidades deben quedar versionados y revisados antes de aplicarse. La autoevolución de YOYO puede generar propuestas o borradores, pero no debe modificar silenciosamente reglas contractuales ni publicar políticas definitivas.</p></section>
      <section style={sectionStyle}><ShieldCheck size={22} /><h2>12. Antes del lanzamiento comercial</h2><p>Debe realizarse revisión jurídica chilena, completar identidad/contacto del responsable, finalidades y bases jurídicas, encargados/proveedores definitivos, transferencias que correspondan, conservación, procedimientos de derechos, seguridad/incidentes y relación contractual con instituciones educativas.</p></section>
    </>
  )
}
