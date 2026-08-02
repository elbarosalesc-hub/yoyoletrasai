'use client'

import { useCallback, useEffect, useState } from 'react'
import { Activity, CheckCircle2, Database, RefreshCw, Server, TriangleAlert } from 'lucide-react'
import styles from './estado.module.css'

type HealthPayload = {
  status: 'ok' | 'degraded' | 'misconfigured'
  checkedAt: string
  services: {
    application: string
    databaseGateway: string
  }
}

function serviceState(value: string) {
  return ['ok', 'reachable'].includes(value) ? 'ok' : 'warning'
}

export function StatusPanel() {
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [requestFailed, setRequestFailed] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setRequestFailed(false)

    try {
      const response = await fetch('/api/health', { cache: 'no-store' })
      const payload = (await response.json()) as HealthPayload
      setHealth(payload)
    } catch {
      setRequestFailed(true)
      setHealth(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const overallOk = health?.status === 'ok' && !requestFailed

  return (
    <section className={styles.statusPanel} aria-live="polite">
      <div className={styles.summaryCard} data-state={overallOk ? 'ok' : 'warning'}>
        <span className={styles.summaryIcon}>
          {overallOk ? <CheckCircle2 size={30} /> : <TriangleAlert size={30} />}
        </span>
        <div>
          <small>Estado general</small>
          <h2>{loading ? 'Comprobando servicios…' : overallOk ? 'Todos los sistemas operativos' : 'Revisión requerida'}</h2>
          <p>
            {loading
              ? 'La plataforma está verificando su configuración y la conexión de datos.'
              : overallOk
                ? 'La aplicación y el gateway de Supabase responden correctamente.'
                : 'La aplicación continúa protegida, pero uno de los servicios no respondió como se esperaba.'}
          </p>
        </div>
        <button type="button" onClick={() => void load()} disabled={loading}>
          <RefreshCw size={17} className={loading ? styles.spinning : undefined} />
          Actualizar
        </button>
      </div>

      <div className={styles.serviceGrid}>
        <article data-state={health ? serviceState(health.services.application) : 'warning'}>
          <span><Server size={22} /></span>
          <div>
            <small>Aplicación web</small>
            <strong>{health?.services.application === 'ok' ? 'Operativa' : loading ? 'Comprobando' : 'Sin respuesta'}</strong>
            <p>Rutas, componentes y procesamiento del servidor.</p>
          </div>
        </article>

        <article data-state={health ? serviceState(health.services.databaseGateway) : 'warning'}>
          <span><Database size={22} /></span>
          <div>
            <small>Supabase</small>
            <strong>{health?.services.databaseGateway === 'reachable' ? 'Conectado' : loading ? 'Comprobando' : 'Revisión requerida'}</strong>
            <p>Gateway de datos, autenticación y servicios institucionales.</p>
          </div>
        </article>

        <article data-state={requestFailed ? 'warning' : 'ok'}>
          <span><Activity size={22} /></span>
          <div>
            <small>Monitoreo</small>
            <strong>{requestFailed ? 'No disponible' : 'Activo'}</strong>
            <p>Comprobación sin caché y con tiempo máximo de espera.</p>
          </div>
        </article>
      </div>

      <div className={styles.detailsCard}>
        <div>
          <strong>Última comprobación</strong>
          <span>{health?.checkedAt ? new Date(health.checkedAt).toLocaleString('es-CL') : 'Pendiente'}</span>
        </div>
        <div>
          <strong>Privacidad</strong>
          <span>Este panel no expone claves, usuarios ni información institucional.</span>
        </div>
        <div>
          <strong>Respuesta ante fallos</strong>
          <span>Los errores críticos muestran una pantalla recuperable en lugar de dejar la aplicación en blanco.</span>
        </div>
      </div>
    </section>
  )
}
