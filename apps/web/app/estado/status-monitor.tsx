'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { CheckCircle2, Database, RefreshCw, Server, Settings2, TriangleAlert } from 'lucide-react'
import styles from './status.module.css'

type HealthPayload = {
  status: 'ok' | 'degraded' | 'error'
  application?: 'operational'
  configuration?: 'valid' | 'missing'
  database?: 'reachable' | 'unreachable' | 'not_configured'
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
    const timeout = window.setTimeout(() => controller.abort(), 8_000)

    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      })
      const result = (await response.json()) as HealthPayload
      setPayload(result)

      if (result.status === 'ok') {
        setMessage('Los servicios esenciales responden correctamente.')
      } else if (result.configuration === 'missing') {
        setMessage('La aplicación responde, pero faltan variables de configuración esenciales.')
      } else {
        setMessage('La plataforma responde con capacidad limitada. Revisa la conectividad de datos.')
      }
    } catch {
      setPayload(null)
      setMessage('No fue posible completar la comprobación. Revisa la conexión e inténtalo nuevamente.')
    } finally {
      window.clearTimeout(timeout)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void checkHealth()
  }, [checkHealth])

  const applicationOk = payload?.application === 'operational'
  const configurationOk = payload?.configuration === 'valid'
  const databaseOk = payload?.database === 'reachable'
  const overallOk = payload?.status === 'ok'
  const checkFailed = !loading && !payload

  return (
    <section className={styles.monitor} aria-live="polite">
      <div className={`${styles.summary} ${overallOk ? styles.summaryOk : checkFailed ? styles.summaryError : styles.summaryPending}`}>
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
        <StatusCard icon={<Server size={22} />} title="Aplicación web" value={applicationOk ? 'Aplicación disponible' : loading ? 'Comprobando' : 'Sin respuesta verificada'} ok={applicationOk} />
        <StatusCard icon={<Settings2 size={22} />} title="Configuración" value={configurationOk ? 'Variables configuradas' : loading ? 'Comprobando' : 'Configuración incompleta'} ok={configurationOk} />
        <StatusCard icon={<Database size={22} />} title="Supabase" value={databaseLabel(payload?.database, loading)} ok={databaseOk} />
      </div>

      <article className={styles.guide}>
        <h2>Recuperación segura</h2>
        <p>Si algún servicio aparece limitado, no vuelvas a enviar formularios repetidamente. Actualiza esta comprobación, confirma la conexión y conserva el código de error mostrado por la pantalla de contingencia.</p>
        <div>
          <span>1</span><p><strong>Comprueba nuevamente.</strong> Los cortes breves pueden recuperarse solos.</p>
          <span>2</span><p><strong>Revisa el acceso.</strong> Cierra sesión y vuelve a ingresar si el problema es de autenticación.</p>
          <span>3</span><p><strong>Escala con contexto.</strong> Informa la ruta, hora y código de error, nunca contraseñas ni claves.</p>
        </div>
      </article>
    </section>
  )
}

function StatusCard({ icon, title, value, ok }: { icon: ReactNode; title: string; value: string; ok: boolean }) {
  return (
    <article className={styles.card}>
      <span className={styles.cardIcon}>{icon}</span>
      <div><small>{title}</small><strong>{value}</strong></div>
      <em className={ok ? styles.good : styles.review}>{ok ? 'Operativo' : 'Revisar'}</em>
    </article>
  )
}

function databaseLabel(value: HealthPayload['database'], loading: boolean) {
  if (loading) return 'Comprobando'
  if (value === 'reachable') return 'Servicio accesible'
  if (value === 'not_configured') return 'Configuración incompleta'
  if (value === 'unreachable') return 'Servicio sin respuesta'
  return 'No disponible'
}
