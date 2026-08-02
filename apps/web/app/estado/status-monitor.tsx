'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, Database, RefreshCw, Server, Settings2, TriangleAlert } from 'lucide-react'
import styles from './status.module.css'

type HealthPayload = {
  status: 'ok' | 'degraded' | 'error'
  application?: string
  configuration?: string
  database?: string
  timestamp?: string
}

export function StatusMonitor() {
  const [payload, setPayload] = useState<HealthPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('Comprobando servicios esenciales…')

  const checkHealth = useCallback(async () => {
    setLoading(true)
    setMessage('Comprobando servicios esenciales…')

    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 8000)

    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        credentials: 'same-origin',
        signal: controller.signal,
      })
      const data = (await response.json()) as HealthPayload
      setPayload(data)
      setMessage(response.ok ? 'Comprobación completada.' : 'La plataforma necesita atención.')
    } catch {
      setPayload({ status: 'error', application: 'unreachable', configuration: 'unknown', database: 'unknown' })
      setMessage('No fue posible completar la comprobación.')
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkHealth()
  }, [checkHealth])

  const healthy = payload?.status === 'ok'

  const checks = [
    { label: 'Aplicación', value: payload?.application ?? 'checking', icon: Server },
    { label: 'Configuración', value: payload?.configuration ?? 'checking', icon: Settings2 },
    { label: 'Supabase', value: payload?.database ?? 'checking', icon: Database },
  ]

  return (
    <section className={styles.monitor} aria-live="polite">
      <div className={`${styles.summary} ${healthy ? styles.ok : styles.warning}`}>
        <span>{healthy ? <CheckCircle2 size={28} /> : <TriangleAlert size={28} />}</span>
        <div>
          <strong>{healthy ? 'Servicios operativos' : loading ? 'Comprobando…' : 'Revisión necesaria'}</strong>
          <p>{message}</p>
        </div>
        <button type="button" onClick={() => void checkHealth()} disabled={loading}>
          <RefreshCw size={17} className={loading ? styles.spinning : undefined} /> Reintentar
        </button>
      </div>

      <div className={styles.grid}>
        {checks.map(({ label, value, icon: Icon }) => {
          const itemOk = ['ok', 'configured', 'reachable'].includes(value)
          return (
            <article key={label}>
              <span className={itemOk ? styles.iconOk : styles.iconWarning}><Icon size={22} /></span>
              <div><small>{label}</small><strong>{itemOk ? 'Operativo' : loading ? 'Comprobando' : 'Revisar'}</strong></div>
              <em>{value}</em>
            </article>
          )
        })}
      </div>

      <aside className={styles.guidance}>
        <h2>Recuperación segura</h2>
        <p>Si un servicio aparece degradado, revisa primero las variables públicas de Supabase, el estado del proyecto y los registros del despliegue. Este panel nunca muestra claves, correos ni información de estudiantes.</p>
      </aside>
    </section>
  )
}
