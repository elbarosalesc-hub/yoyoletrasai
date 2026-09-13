'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  Activity,
  CheckCircle2,
  Cloud,
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
  runtime?: string
  services: {
    application: string
    databaseGateway: string
    aiGateway?: string
    runtime?: string
  }
}

type LoadState = 'loading' | 'ready' | 'error'

const moduleChecks = [
  ['Autenticación y recuperación', 'Operativo'],
  ['Instituciones y roles', 'Operativo'],
  ['Cursos y matrículas', 'Operativo'],
  ['Fichas PIE y DUA', 'Operativo'],
  ['Evidencias y progreso por OA', 'Operativo'],
  ['Biblioteca y Misiones', 'Operativo'],
  ['Profesor Virtual y YOYO IA', 'En verificación'],
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

function serviceLabel(value?: string) {
  if (value === 'operational') return 'Operativa'
  if (value === 'reachable') return 'Conectado'
  if (value === 'configured') return 'Configurada'
  if (value === 'cloudflare-workers') return 'Cloudflare Workers'
  if (value === 'not_configured') return 'Sin configurar'
  if (value === 'unreachable') return 'Sin conexión'
  return value || 'Verificando'
}

export function PlatformStatusDashboard() {
  const [payload, setPayload] = useState<HealthPayload | null>(null)
  const [loadState, setLoadState] = useState<LoadState>('loading')

  const checkHealth = useCallback(async () => {
    setLoadState('loading')
    try {
      const response = await fetch('/api/health', { cache: 'no-store', credentials: 'same-origin' })
      const data = (await response.json()) as HealthPayload
      setPayload(data)
      setLoadState(response.ok ? 'ready' : 'error')
    } catch {
      setPayload(null)
      setLoadState('error')
    }
  }, [])

  useEffect(() => { void checkHealth() }, [checkHealth])

  const healthy = loadState === 'ready' && payload?.status === 'ok'
  const checkedAt = payload?.checkedAt
    ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'medium' }).format(new Date(payload.checkedAt))
    : 'Aún no disponible'
  const aiReady = payload?.services.aiGateway === 'configured'

  return (
    <div className="status-dashboard">
      <section className={`status-hero ${healthy ? 'is-healthy' : 'is-warning'}`}>
        <div className="status-hero-icon" aria-hidden="true">
          {healthy ? <ShieldCheck size={34} /> : <TriangleAlert size={34} />}
        </div>
        <div>
          <span className="status-eyebrow">Estado operativo</span>
          <h2>{statusText(payload, loadState)}</h2>
          <p>Verificación en tiempo real de aplicación, Supabase, runtime Cloudflare y configuración de YOYO IA sin exponer credenciales ni información institucional.</p>
          <small>Última revisión: {checkedAt}</small>
        </div>
        <button type="button" className="status-refresh" onClick={checkHealth} disabled={loadState === 'loading'}>
          <RefreshCw size={17} className={loadState === 'loading' ? 'is-spinning' : ''} /> Verificar ahora
        </button>
      </section>

      <div className="status-metrics">
        <article><span><Activity size={20} /></span><div><strong>Aplicación</strong><small>{serviceLabel(payload?.services.application)}</small></div></article>
        <article><span><Database size={20} /></span><div><strong>Supabase</strong><small>{serviceLabel(payload?.services.databaseGateway)}</small></div></article>
        <article><span><Cloud size={20} /></span><div><strong>YOYO IA</strong><small>{serviceLabel(payload?.services.aiGateway)}</small></div></article>
        <article><span><ServerCog size={20} /></span><div><strong>Runtime</strong><small>{serviceLabel(payload?.services.runtime || payload?.runtime)}</small></div></article>
      </div>

      <div className="status-columns">
        <section className="status-panel">
          <div className="status-panel-heading"><div><span className="status-eyebrow">Cobertura funcional</span><h3>Módulos críticos</h3></div><CheckCircle2 size={21} /></div>
          <div className="status-list">
            {moduleChecks.map(([label, state]) => (
              <div key={label}><span>{label}</span><em className={state === 'Operativo' ? 'status-ok' : 'status-progress'}>{state}</em></div>
            ))}
          </div>
        </section>

        <aside className="status-panel">
          <div className="status-panel-heading"><div><span className="status-eyebrow">Infraestructura</span><h3>Publicación canónica</h3></div><Globe2 size={21} /></div>
          <div className="status-callout"><strong>Cloudflare Workers</strong><p>Es el runtime oficial de producción. GitHub mantiene el código fuente y Supabase conserva autenticación, datos y RLS.</p></div>
          <div className={`status-callout ${aiReady ? '' : 'warning'}`}><strong>{aiReady ? 'YOYO IA preparada' : 'YOYO IA requiere configuración'}</strong><p>{aiReady ? 'La capa de Cloudflare AI está configurada en el servidor.' : 'Falta completar la configuración de Cloudflare AI en el entorno de producción. El health check nunca expone secretos.'}</p></div>
        </aside>
      </div>
    </div>
  )
}
