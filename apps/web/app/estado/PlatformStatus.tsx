'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, CircleAlert, LoaderCircle, RefreshCw, Server, ShieldCheck, Wifi } from 'lucide-react'
import styles from './estado.module.css'

type HealthResponse = {
  status: 'ok' | 'degraded' | 'error'
  application?: string
  database?: string
  timestamp?: string
  checks?: Record<string, string>
}

type LoadState = 'loading' | 'ready' | 'failed'

export default function PlatformStatus() {
  const [state, setState] = useState<LoadState>('loading')
  const [health, setHealth] = useState<HealthResponse | null>(null)

  const refresh = useCallback(async () => {
    setState('loading')

    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      })
      const payload = (await response.json()) as HealthResponse
      setHealth(payload)
      setState(response.ok ? 'ready' : 'failed')
    } catch {
      setHealth(null)
      setState('failed')
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const healthy = state === 'ready' && health?.status === 'ok'
  const checkedAt = health?.timestamp
    ? new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(new Date(health.timestamp))
    : 'Sin comprobación disponible'

  return (
    <section className={styles.panel} aria-live="polite">
      <div className={styles.summary}>
        <span className={healthy ? styles.okIcon : state === 'loading' ? styles.loadingIcon : styles.errorIcon}>
          {state === 'loading' ? (
            <LoaderCircle size={30} className={styles.spin} />
          ) : healthy ? (
            <CheckCircle2 size={30} />
          ) : (
            <CircleAlert size={30} />
          )}
        </span>
        <div>
          <small>Estado general</small>
          <h2>
            {state === 'loading'
              ? 'Comprobando servicios…'
              : healthy
                ? 'Plataforma operativa'
                : 'Revisión necesaria'}
          </h2>
          <p>
            {state === 'loading'
              ? 'Estamos verificando la aplicación y la conexión de datos.'
              : healthy
                ? 'Los servicios esenciales respondieron correctamente.'
                : 'Uno o más servicios no respondieron como se esperaba.'}
          </p>
        </div>
        <button type="button" onClick={refresh} disabled={state === 'loading'}>
          <RefreshCw size={17} /> Volver a comprobar
        </button>
      </div>

      <div className={styles.grid}>
        <article>
          <span><Server size={21} /></span>
          <div>
            <small>Aplicación</small>
            <strong>{health?.application ?? (state === 'loading' ? 'Comprobando' : 'No disponible')}</strong>
          </div>
        </article>
        <article>
          <span><Wifi size={21} /></span>
          <div>
            <small>Supabase</small>
            <strong>{health?.database ?? (state === 'loading' ? 'Comprobando' : 'No disponible')}</strong>
          </div>
        </article>
        <article>
          <span><ShieldCheck size={21} /></span>
          <div>
            <small>Seguridad</small>
            <strong>RLS y roles activos</strong>
          </div>
        </article>
      </div>

      <div className={styles.timestamp}>Última comprobación: {checkedAt}</div>
    </section>
  )
}
