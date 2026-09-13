import Link from 'next/link'
import { AlertTriangle, ArrowRight, FileText, ShieldCheck } from 'lucide-react'

export const metadata = {
  title: 'Centro normativo | YOYOLETRASAI',
  description: 'Estado y borradores normativos de YOYOLETRASAI.',
  robots: { index: false, follow: false },
}

const cardStyle = { background: '#fff', border: '1px solid #e6e4ef', borderRadius: 20, padding: 22 } as const

export default function LegalCenterPage() {
  return (
    <>
      <section style={{ ...cardStyle, padding: 30, marginBottom: 18 }}>
        <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center', fontWeight: 800, color: '#6247aa' }}><ShieldCheck size={18} /> Gobernanza y transparencia</span>
        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.4rem)', margin: '12px 0 8px' }}>Centro normativo YOYO</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 780 }}>Reúne las reglas operativas que deben acompañar una plataforma educativa con IA, datos institucionales, recursos pedagógicos, integraciones y eventuales suscripciones.</p>
      </section>

      <section style={{ ...cardStyle, marginBottom: 18, borderColor: '#e7b64c' }} aria-label="Estado jurídico">
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}><AlertTriangle size={24} /><div><strong>Borradores operativos · revisión jurídica pendiente</strong><p style={{ marginBottom: 0, lineHeight: 1.6 }}>Estos textos documentan el comportamiento diseñado del producto y sirven de base de revisión. No se presentan como asesoría jurídica ni como políticas contractuales definitivamente aprobadas. Antes de habilitar contratación comercial o tratamiento institucional a escala, deben ser revisados por asesoría jurídica competente en Chile.</p></div></div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))', gap: 16 }}>
        <article style={cardStyle}><FileText size={26} /><h2>Términos de uso</h2><p style={{ lineHeight: 1.6 }}>Cuentas, roles, responsabilidad docente, uso de YOYO IA, recursos, integraciones, disponibilidad y facturación cuando exista proveedor verificado.</p><Link href="/legal/terminos" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 800 }}>Revisar borrador <ArrowRight size={16} /></Link></article>
        <article style={cardStyle}><ShieldCheck size={26} /><h2>Privacidad</h2><p style={{ lineHeight: 1.6 }}>Minimización de datos, información estudiantil, uso de IA, proveedores técnicos, seguridad, conservación y responsabilidades institucionales.</p><Link href="/legal/privacidad" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontWeight: 800 }}>Revisar borrador <ArrowRight size={16} /></Link></article>
      </div>
    </>
  )
}
