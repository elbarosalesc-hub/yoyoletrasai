import { AlertTriangle } from 'lucide-react'

export const metadata = {
  title: 'Términos de uso · borrador | YOYOLETRASAI',
  description: 'Borrador operativo de términos de uso de YOYOLETRASAI.',
  robots: { index: false, follow: false },
}

const sectionStyle = { background: '#fff', border: '1px solid #e6e4ef', borderRadius: 18, padding: 22, marginBottom: 14, lineHeight: 1.65 } as const

export default function TermsDraftPage() {
  return (
    <>
      <section style={{ ...sectionStyle, padding: 30 }}>
        <p style={{ fontWeight: 800, color: '#6247aa' }}>Versión operativa 0.1 · 13 de septiembre de 2026</p>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.2rem)', marginBottom: 8 }}>Términos de uso</h1>
        <p>Borrador de trabajo para describir las reglas del producto antes de su revisión y aprobación jurídica definitiva.</p>
      </section>
      <section style={{ ...sectionStyle, borderColor: '#e7b64c' }}><p><AlertTriangle size={18} style={{ verticalAlign: 'middle', marginRight: 7 }} /><strong>Revisión jurídica pendiente.</strong> Este documento no sustituye asesoría legal y no debe presentarse como contrato definitivo mientras conserve este aviso.</p></section>
      <section style={sectionStyle}><h2>1. Alcance del servicio</h2><p>YOYOLETRASAI es una plataforma educativa que organiza recursos, herramientas docentes, experiencias interactivas, analítica pedagógica y funciones de YOYO IA. Las capacidades disponibles dependen del rol, la institución, la configuración técnica y el plan habilitado.</p></section>
      <section style={sectionStyle}><h2>2. Cuentas, roles e instituciones</h2><p>Cada persona debe utilizar su propia cuenta y mantener seguras sus credenciales. Los permisos se asignan por rol e institución. Las acciones de administración, publicación, acceso a evidencias y configuración institucional deben respetar los permisos efectivos del sistema.</p></section>
      <section style={sectionStyle}><h2>3. Uso pedagógico y responsabilidad profesional</h2><p>Los recursos y sugerencias de la plataforma apoyan el trabajo profesional; no sustituyen el juicio pedagógico. Antes de usar una evaluación, adaptación, informe, evidencia o recurso con estudiantes, la profesional responsable debe revisar su pertinencia, exactitud, accesibilidad y adecuación al contexto.</p></section>
      <section style={sectionStyle}><h2>4. YOYO IA</h2><p>YOYO IA puede generar, adaptar, resumir y proponer contenido. Sus resultados pueden contener errores o requerir contextualización. La plataforma incorpora revisión humana para acciones sensibles y no debe inventar códigos OA ni presentar contenido generado como evidencia institucional sin validación profesional.</p></section>
      <section style={sectionStyle}><h2>5. Datos de estudiantes</h2><p>Las personas usuarias deben ingresar únicamente la información necesaria para la finalidad educativa autorizada. Debe evitarse incluir secretos, credenciales o antecedentes sensibles cuando no sean indispensables. La plataforma está diseñada para minimizar el envío de información identificable a servicios de IA.</p></section>
      <section style={sectionStyle}><h2>6. Recursos, originalidad y propiedad intelectual</h2><p>La plataforma busca producir recursos originales y no debe utilizarse para copiar contenido propietario de terceros. Quien suba archivos debe contar con autorización suficiente para utilizarlos. Las referencias a otras plataformas sirven como benchmark funcional y no autorizan copiar sus materiales.</p></section>
      <section style={sectionStyle}><h2>7. Integraciones externas</h2><p>Canvas, Google Classroom u otros servicios sólo se consideran conectados después de una autorización real y verificable. Mientras no exista OAuth o conexión equivalente, YOYO no debe representar sincronizaciones, cursos o publicaciones externas como activas.</p></section>
      <section style={sectionStyle}><h2>8. Planes, pagos y suscripciones</h2><p>La interfaz no debe inventar precios, renovaciones ni cobros. Una suscripción comercial sólo puede considerarse operativa cuando exista un proveedor de pagos configurado, checkout válido, verificación de cobro recurrente y manejo de eventos/webhooks conforme al diseño aprobado.</p></section>
      <section style={sectionStyle}><h2>9. Uso prohibido</h2><p>No se permite usar la plataforma para vulnerar cuentas, eludir controles de acceso, introducir código malicioso, publicar información obtenida sin autorización, suplantar identidades, acosar a estudiantes o personal, ni utilizar datos educativos para finalidades incompatibles con su propósito autorizado.</p></section>
      <section style={sectionStyle}><h2>10. Disponibilidad y cambios</h2><p>Las funciones pueden evolucionar. Las mejoras automáticas pueden auditar y proponer cambios o crear borradores, pero la publicación de recursos y los cambios de producción sensibles deben conservar controles de revisión y trazabilidad.</p></section>
      <section style={sectionStyle}><h2>11. Suspensión y cierre de acceso</h2><p>El acceso puede limitarse cuando exista riesgo de seguridad, uso abusivo, pérdida de autorización institucional o necesidad de proteger datos y continuidad del servicio. Los procedimientos definitivos de suspensión, exportación y eliminación deben quedar establecidos en la versión jurídica aprobada.</p></section>
      <section style={sectionStyle}><h2>12. Aprobación pendiente</h2><p>Antes del lanzamiento comercial definitivo deben incorporarse la identidad legal del prestador, domicilio/contacto contractual, jurisdicción aplicable, condiciones económicas finales, soporte, tratamiento de controversias y cualquier cláusula requerida por asesoría jurídica.</p></section>
    </>
  )
}
