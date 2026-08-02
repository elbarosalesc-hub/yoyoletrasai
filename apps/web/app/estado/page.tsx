import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, ArrowLeft, ShieldCheck } from 'lucide-react'
import { StatusMonitor } from './status-monitor'
import styles from './status.module.css'

export const metadata: Metadata = {
  title: 'Estado de la plataforma | YOYOLETRASAI',
  description: 'Comprobación operativa de la aplicación y sus servicios esenciales.',
  robots: { index: false, follow: false },
}

export default function PlatformStatusPage() {
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/presentacion" className={styles.backLink}>
          <ArrowLeft size={17} /> Volver
        </Link>
        <div className={styles.brand}>
          <span><ShieldCheck size={22} /></span>
          <div><strong>YOYOLETRASAI</strong><small>Centro de estado</small></div>
        </div>
      </header>

      <section className={styles.hero}>
        <span className={styles.eyebrow}><Activity size={16} /> Supervisión operativa</span>
        <h1>Estado de la plataforma</h1>
        <p>Verifica la aplicación, la configuración y la conexión con Supabase sin exponer claves ni datos institucionales.</p>
      </section>

      <StatusMonitor />
    </main>
  )
}
