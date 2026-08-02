'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, LoaderCircle, RefreshCw, Server, ShieldCheck, TriangleAlert, WifiOff } from 'lucide-react'

type HealthPayload = {
  status: 'ok' | 'degraded' | 'error'
  service: string
  timestamp: string
  checks: {
    application: boolean
    configuration: boolean
    supabase: boolean
  }
  message?: string
}

type RouteCheck = {
  path: string
  label: string
  ok: boolean | null
}

const criticalRoutes = [
  { path: '/presentacion', label: 'Presentación pública' },
  { path: '/acceso', label: 'Acceso institucional' },
  { path: '/api/health', label: 'Servicio de salud' },
]

export default function StatusMonitor() {
  const [health, setHealth] = useState<HealthPayload | null>(null)
  const [routes, setRoutes] = useState<RouteCheck[]>(
    criticalRoutes.map((route) => ({ ...route, ok: null })),
  )
  const [loading, setLoading] = useState(true)
  const [lastError, setLastError] = useState<string | null>(null)

  const runChecks = useCallback(async () => {
    setLoading(true)
    setLastError(null)

    try {
      const healthResponse = await fetch('/api/health', {
        cache: 'no-store',
        headers: { Accept: 'application/json' },
      })

      const payload = (await healthResponse.json()) as HealthPayload
      setHealth(payload)

      const routeResults = await Promise.all(
        criticalRoutes.map(async (route) => {
          try {
            const response = await fetch(route.path, {
              method: 'HEAD',
              cache: 'no-store',
              redirect: 'manual',
            })
            return { ...route, ok: response.status < 500 }
          } catch {
            return { ...route, ok: false }
          }
        }),
      )
      setRoutes(routeResults)
    } catch {
      setHealth(null)
      setRoutes(criticalRoutes.map((route) => ({ ...route, ok: false })))
      setLastError('No fue posible completar la verificación automática.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    runChecks()
    const interval = window.setInterval(runChecks, 30_000)
    return () => window.clearInterval(interval)
  }, [runChecks])

  const overallOk =
    health?.status === 'ok' && routes.every((route) => route.ok !== false)

  return (
    <section className="status-monitor" aria-live="polite">
      <div className="status-overview">
        <div className={`status-orb ${overallOk ? 'is-ok' : health ? 'is-warning' : 'is-loading'}`}>
          {loading ? (
            <LoaderCircle className="status-spin" size={32} />
          ) : overallOk ? (
            <CheckCircle2 size={32} />
          ) : health ? (
            <TriangleAlert size={32} />
          ) : (
            <WifiOff size={32} />
          )}
        </div>
        <div>
          <span className="status-kicker">Estado actual</span>
          <h2>{loading ? 'Verificando servicios…' : overallOk ? 'Plataforma operativa' : 'Revisión necesaria'}</h2>
          <p>
            {lastError ??
              health?.message ??
              'Comprobación automática de la aplicación, Supabase y rutas críticas.'}
          </p>
        </div>
        <button type="button" onClick={runChecks} disabled={loading} className="status-refresh">
          <RefreshCw size={17} className={loading ? 'status-spin' : ''} />
          Verificar ahora
        </button>
      </div>

      <div className="status-grid">
        <StatusCard
          icon={<Server size={21} />}
          title="Aplicación Next.js"
          description="Servidor, renderizado y endpoint de salud."
          ok={health?.checks.application ?? null}
        />
        <StatusCard
          icon={<ShieldCheck size={21} />}
          title="Configuración segura"
          description="Variables públicas requeridas presentes, sin exponer secretos."
          ok={health?.checks.configuration ?? null}
        />
        <StatusCard
          icon={<CheckCircle2 size={21} />}
          title="Supabase"
          description="Conectividad con el gateway de datos y servicios institucionales."
          ok={health?.checks.supabase ?? null}
        />
      </div>

      <div className="status-routes">
        <div>
          <span className="status-kicker">Rutas críticas</span>
          <h3>Disponibilidad de accesos principales</h3>
        </div>
        <div className="status-route-list">
          {routes.map((route) => (
            <div className="status-route" key={route.path}>
              <span className={`status-dot ${route.ok === true ? 'is-ok' : route.ok === false ? 'is-error' : ''}`} />
              <div>
                <strong>{route.label}</strong>
                <small>{route.path}</small>
              </div>
              <em>{route.ok === null ? 'Pendiente' : route.ok ? 'Disponible' : 'No disponible'}</em>
            </div>
          ))}
        </div>
      </div>

      <p className="status-footnote">
        Última comprobación: {health?.timestamp ? new Date(health.timestamp).toLocaleString('es-CL') : 'en curso'}.
        Este panel no muestra credenciales, nombres de estudiantes ni información institucional.
      </p>
    </section>
  )
}

function StatusCard({
  icon,
  title,
  description,
  ok,
}: {
  icon: React.ReactNode
  title: string
  description: string
  ok: boolean | null
}) {
  return (
    <article className="status-card">
      <span className="status-card-icon">{icon}</span>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <span className={`status-pill ${ok === true ? 'is-ok' : ok === false ? 'is-error' : ''}`}>
        {ok === null ? 'Verificando' : ok ? 'Operativo' : 'Atención'}
      </span>
    </article>
  )
}
