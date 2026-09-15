import Link from 'next/link'
import type { ReactNode } from 'react'
import { ArrowLeft, FileText, ShieldCheck } from 'lucide-react'

export default function LegalLayout({ children }: { children: ReactNode }) {
  return (
    <main style={{ minHeight: '100vh', background: '#f7f7fb', color: '#1d1d2b' }}>
      <header style={{ maxWidth: 980, margin: '0 auto', padding: '24px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <Link href="/presentacion" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'inherit', textDecoration: 'none', fontWeight: 700 }}>
          <ArrowLeft size={17} /> Volver a YOYO
        </Link>
        <nav aria-label="Centro normativo" style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link href="/legal" style={{ color: 'inherit' }}><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />Centro normativo</Link>
          <Link href="/legal/terminos" style={{ color: 'inherit' }}><FileText size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />Términos</Link>
          <Link href="/legal/privacidad" style={{ color: 'inherit' }}><ShieldCheck size={15} style={{ verticalAlign: 'middle', marginRight: 5 }} />Privacidad</Link>
        </nav>
      </header>
      <div style={{ maxWidth: 980, margin: '0 auto', padding: '20px 20px 64px' }}>{children}</div>
    </main>
  )
}
