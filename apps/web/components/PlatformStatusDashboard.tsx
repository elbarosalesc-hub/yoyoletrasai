'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Clock3,
  Database,
  Globe2,
  RefreshCw,
  ServerCog,
  ShieldCheck,
  TriangleAlert,
} from 'lucide-react'

type HealthPayload = {
  status: 'ok' | 'degraded' | 'misconfigured'
  checkedAt: string
  services: {
    application: string
    databaseGateway: string
  }
}

type LoadState = 'loading' | 'ready' | 'error'

const moduleChecks = [
  ['Autenticación y recuperación', 'Operativo'],
  ['Instituciones y roles', 'Operativo'],
  ['Cursos y matrículas', 'Operativo'],
  ['Fichas PIE y DUA', 'Operativo'],
  ['Evidencias y progreso por OA', 'Operativo'],
  ['Biblioteca y creación con IA', 'En expansión'],
  ['Evaluaciones e informes', 'En expansión'],
  ['Familias y comunicaciones', 'En expansión'],
] as const

function statusText(payload: HealthPayload | null, loadState: LoadState) {
  if (loadState === 'loading') return 'Verificando'
  if (loadState === 'error' || !payload) return 'Sin respuesta'
  if (payload.status === 'ok') return 'Operativa'
  if (payload.status === 'misconfigured') return 'Configuración incompleta'
  return 'Servicio degradado'
}

export function PlatformStatusDashboard() {
  const [payload, setPayload] = useState<HealthPayload | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')

  const checkHealth = useCallback(async () => {
    setLoadState('loading')

    try {
      const response = await fetch('/api/health', {
        cache: 'no-store',
        credentials: 'same-origin',
      })
      const data = (await response.json()) as HealthPayload
      setPayload(data)
      setLoadState(response.ok ? 'ready' : 'error')
    } catch {
      setPayload(null)
      setLoadState('error')
    }
  }, [])

  useEffect(() => {
    checkHealth()
  }, [checkHealth])

  const healthy = loadState === 'ready' && payload?.status === 'ok'
  const checkedAt = payload?.checkedAt
    ? new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'medium',
      }).format(new Date(payload.checkedAt))
    : 'Aún no disponible'

  return (
    <div className="status-dashboard">
      <section className={`status-hero ${healthy ? 'is-healthy' : 'is-warning'}`}>
        <div className="status-hero-icon" aria-hidden="true">
          {healthy ? <ShieldCheck size={34} /> : <TriangleAlert size={34} />}
        </div>
        <div>
          <span className="status-eyebrow">Estado operativo</span>
          <h2>{statusText(payload, loadState)}</h2>
          <p>
            Verificación en tiempo real de la aplicación y del gateway de datos, sin exponer
            credenciales ni información institucional.
          </p>
        </div>
        <button type="button" className="status-refresh" onClick={checkHealth} disabled={loadState === 'loading'}>
          <RefreshCw size={17} className={loadState === 'loading' ? 'is-spinning' : ''} />
          Verificar ahora
        </button>
      </section>

      <div className="status-metrics">
        <article>
          <span><Activity size={20} /></span>
          <div><strong>Aplicación</strong><small>{payload?.services.application ?? 'Verificando'}</small></div>
        </article>
        <article>
          <span><Database size={20} /></span>
          <div><strong>Supabase</strong><small>{payload?.services.databaseGateway ?? 'Verificando'}</small></div>
        </article>
        <article>
          <span><ServerCog size={20} /></span>
          <div><strong>Build Next.js</strong><small>Validado por CI</small></div>
        </article>
        <article>
          <span><Clock3 size={20} /></span>
          <div><strong>Última revisión</strong><small>{checkedAt}</small></div>
        </article>
      </div>

      <div className="status-columns">
        <section className="status-panel">
          <div className="status-panel-heading">
            <div><span className="status-eyebrow">Cobertura funcional</span><h3>Módulos críticos</h3></div>
            <CheckCircle2 size={21} />
          </div>
          <div className="status-list">
            {moduleChecks.map(([label, state]) => (
              <div key={label}>
                <span>{label}</span>
                <em className={state === 'Operativo' ? 'status-ok' : 'status-progress'}>{state}</em>
              </div>
            ))}
          </div>
        </section>

        <aside className="status-panel">
          <div className="status-panel-heading">
            <div><span className="status-eyebrow">Infraestructura</span><h3>Publicación canónica</h3></div>
            <Globe2 size={21} />
          </div>
          <div className="status-callout">
            <strong>Proyecto Next.js activo</strong>
            <p>El código oficial compila desde <code>apps/web</code> y el proyecto duplicado permanece ignorado.</p>
          </div>
          <div className="status-callout warning">
            <strong>Dominio antiguo pendiente de retiro</strong>
            <p>La transferencia requiere permisos administrativos de Vercel. La plataforma no depende de ese dominio para preservar sus datos.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
