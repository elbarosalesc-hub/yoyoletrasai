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
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      const result = (await response.json()) as HealthPayload
      setPayload(result)
      setMessage(response.ok ? 'Los servicios esenciales responden correctamente.' : 'La plataforma responde con capacidad limitada.')
    } catch {
      setPayload({ status: 'error' })
      setMessage('No fue posible completar la comprobación. Revisa la conexión e inténtalo nuevamente.')
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkHealth()
  }, [checkHealth])

  const overallOk = payload?.status === 'ok'

  return (
    <section className={styles.monitor} aria-live="polite">
      <div className={`${styles.summary} ${overallOk ? styles.summaryOk : payload?.status === 'error' ? styles.summaryError : styles.summaryPending}`}>
        <span className={styles.summaryIcon}>
          {overallOk ? <CheckCircle2 size={28} /> : <TriangleAlert size={28} />}
        </span>
        <div>
          <strong>{loading ? 'Verificación en curso' : overallOk ? 'Plataforma operativa' : 'Revisión necesaria'}</strong>
          <p>{message}</p>
          {payload?.timestamp && <small>Última comprobación: {new Date(payload.timestamp).toLocaleString('es-CL')}</small>}
        </div>
        <button type="button" onClick={() => void checkHealth()} disabled={loading}>
          <RefreshCw size={17} className={loading ? styles.spinning : undefined} />
          {loading ? 'Comprobando' : 'Comprobar nuevamente'}
        </button>
      </div>

      <div className={styles.grid}>
        <StatusCard
          icon={<Server size={22} />}
          title="Aplicación web"
          value={payload?.application ?? (payload ? 'No disponible' : 'Comprobando')}
          ok={payload?.application === 'operational'}
        />
        <StatusCard
          icon={<Settings2 size={22} />}
          title="Configuración"
          value={payload?.configuration ?? (payload ? 'No disponible' : 'Comprobando')}
          ok={payload?.configuration === 'valid'}
        />
        <StatusCard
          icon={<Database size={22} />}
          title="Supabase"
          value={payload?.database ?? (payload ? 'No disponible' : 'Comprobando')}
          ok={payload?.database === 'reachable'}
        />
      </div>

      <article className={styles.guide}>
        <h2>Recuperación segura</h2>
        <p>
          Si algún servicio aparece limitado, no vuelvas a enviar formularios repetidamente. Actualiza esta comprobación,
          confirma la conexión y conserva el código de error mostrado por la pantalla de contingencia.
        </p>
        <div>
          <span>1</span><p><strong>Comprueba nuevamente.</strong> Los cortes breves pueden recuperarse solos.</p>
          <span>2</span><p><strong>Revisa el acceso.</strong> Cierra sesión y vuelve a ingresar si el problema es de autenticación.</p>
          <span>3</span><p><strong>Escala con contexto.</strong> Informa la ruta, hora y código de error, nunca contraseñas ni claves.</p>
        </div>
      </article>
    </section>
  )
}

function StatusCard({ icon, title, value, ok }: { icon: React.ReactNode; title: string; value: string; ok: boolean }) {
  return (
    <article className={styles.card}>
      <span className={styles.cardIcon}>{icon}</span>
      <div>
        <small>{title}</small>
        <strong>{humanize(value)}</strong>
      </div>
      <em className={ok ? styles.good : styles.review}>{ok ? 'Operativo' : 'Revisar'}</em>
    </article>
  )
}

function humanize(value: string) {
  const labels: Record<string, string> = {
    operational: 'Aplicación disponible',
    valid: 'Variables configuradas',
    reachable: 'Servicio accesible',
    missing: 'Configuración incompleta',
    unreachable: 'Servicio sin respuesta',
    checking: 'Comprobando',
  }
  return labels[value] ?? value.replaceAll('_', ' ')
}
