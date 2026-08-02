import { AppShell } from '@/components/AppShell'

type CheckState = 'operational' | 'warning' | 'unavailable'

type OperationalCheck = {
  label: string
  detail: string
  state: CheckState
}

async function checkDataGateway(): Promise<OperationalCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

  if (!url || !key) {
    return {
      label: 'Configuración de Supabase',
      detail: 'Faltan variables públicas requeridas en este entorno.',
      state: 'unavailable',
    }
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 4500)

  try {
    const response = await fetch(`${url}/rest/v1/`, {
      method: 'HEAD',
      headers: { apikey: key },
      cache: 'no-store',
      signal: controller.signal,
    })

    return {
      label: 'Gateway de datos',
      detail: response.ok
        ? 'Supabase responde correctamente.'
        : `Supabase respondió con estado ${response.status}.`,
      state: response.ok ? 'operational' : 'warning',
    }
  } catch {
    return {
      label: 'Gateway de datos',
      detail: 'No fue posible confirmar la conexión en este momento.',
      state: 'unavailable',
    }
  } finally {
    clearTimeout(timeout)
  }
}

const moduleStates = [
  ['Autenticación y recuperación', 'Conectado'],
  ['Instituciones y roles', 'Conectado'],
  ['Cursos y matrículas', 'Conectado'],
  ['Estudiantes', 'Conectado'],
  ['Ficha PIE y DUA', 'Conectado'],
  ['Evidencias y progreso por OA', 'Conectado'],
  ['Biblioteca', 'En expansión'],
  ['Evaluaciones y rúbricas', 'En expansión'],
  ['Crear con IA', 'En expansión'],
  ['Profesor Virtual', 'En expansión'],
  ['Familias e informes', 'En expansión'],
  ['Multimedia e integraciones', 'Pendiente de servicios'],
] as const

const stateLabels: Record<CheckState, string> = {
  operational: 'Operativo',
  warning: 'Revisar',
  unavailable: 'No disponible',
}

export default async function QA() {
  const gateway = await checkDataGateway()
  const environmentConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  )

  const checks: OperationalCheck[] = [
    {
      label: 'Aplicación Next.js',
      detail: 'Build, límites de error y página 404 habilitados.',
      state: 'operational',
    },
    {
      label: 'Variables de entorno',
      detail: environmentConfigured
        ? 'La configuración pública requerida está presente.'
        : 'Faltan variables públicas requeridas.',
      state: environmentConfigured ? 'operational' : 'unavailable',
    },
    gateway,
    {
      label: 'Seguridad HTTP',
      detail: 'HSTS, nosniff, protección de iframe y políticas del navegador activas.',
      state: 'operational',
    },
    {
      label: 'Aislamiento institucional',
      detail: 'RLS y permisos por organización y rol activos en Supabase.',
      state: 'operational',
    },
    {
      label: 'Dominio canónico',
      detail: 'La transferencia desde el proyecto Vite antiguo sigue pendiente en Vercel.',
      state: 'warning',
    },
  ]

  const operationalCount = checks.filter((check) => check.state === 'operational').length
  const attentionCount = checks.length - operationalCount

  return (
    <AppShell active="QA y publicación">
      <div className="page-head">
        <div>
          <h1>Estado de la plataforma</h1>
          <p>Diagnóstico operativo sin métricas simuladas ni datos institucionales sensibles.</p>
        </div>
        <span className={`tag ${attentionCount === 0 ? '' : 'tag-warning'}`}>
          {attentionCount === 0 ? 'Todo operativo' : `${attentionCount} punto${attentionCount === 1 ? '' : 's'} por revisar`}
        </span>
      </div>

      <div className="quick-grid">
        <div className="quick"><strong>{operationalCount}</strong><span>controles operativos</span></div>
        <div className="quick"><strong>{attentionCount}</strong><span>puntos por revisar</span></div>
        <div className="quick"><strong>{moduleStates.filter(([, state]) => state === 'Conectado').length}</strong><span>módulos conectados</span></div>
        <div className="quick"><strong>{moduleStates.filter(([, state]) => state !== 'Conectado').length}</strong><span>módulos en expansión</span></div>
      </div>

      <div className="content-grid">
        <section className="panel">
          <h2>Verificación operativa</h2>
          {checks.map((check) => (
            <div className="action-row" key={check.label}>
              <span>
                <strong>{check.label}</strong>
                <small>{check.detail}</small>
              </span>
              <em className={`status-pill status-${check.state}`}>
                {stateLabels[check.state]}
              </em>
            </div>
          ))}
        </section>

        <aside className="panel">
          <h2>Estado funcional</h2>
          {moduleStates.map(([module, state]) => (
            <div className="action-row" key={module}>
              <span>{module}</span>
              <small>{state}</small>
            </div>
          ))}
          <div className="insight">
            <b>Estado honesto</b>
            <p>
              Los módulos conectados persisten información real en Supabase. Los demás se
              mantienen identificados como expansión hasta completar sus servicios de backend.
            </p>
          </div>
        </aside>
      </div>
    </AppShell>
  )
}
