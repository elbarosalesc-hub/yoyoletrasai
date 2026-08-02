import type { Metadata } from 'next'
import { Activity, ArrowLeft, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
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
          <div>
            <strong>YOYOLETRASAI</strong>
            <small>Centro de estado operativo</small>
          </div>
        </div>
      </header>
      <section className={styles.hero}>
        <span className={styles.eyebrow}><Activity size={16} /> Monitoreo seguro</span>
        <h1>Estado de la plataforma</h1>
        <p>Esta vista comprueba la aplicación y la conectividad esencial sin mostrar claves, identidades, instituciones ni información de estudiantes.</p>
      </section>
      <StatusMonitor />
    </main>
  )
}
