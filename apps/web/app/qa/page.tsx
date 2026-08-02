import { AppShell } from '@/components/AppShell'
import { PlatformStatusDashboard } from '@/components/PlatformStatusDashboard'

export default function QA() {
  return (
    <AppShell active="QA y publicación">
      <div className="page-head">
        <div>
          <h1>Estado y calidad</h1>
          <p>Monitoreo operativo, seguridad y avance real de la plataforma.</p>
        </div>
        <span className="tag">Verificación activa</span>
      </div>
      <PlatformStatusDashboard />
    </AppShell>
  )
}
