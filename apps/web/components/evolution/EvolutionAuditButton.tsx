'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, ScanSearch } from 'lucide-react'

export function EvolutionAuditButton() {
  const router = useRouter()
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')

  async function runAudit() {
    if (running) return
    setRunning(true)
    setMessage('Auditando plataforma, IA, recursos, juegos y benchmark...')
    try {
      const response = await fetch('/api/evolution/audit', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || 'No fue posible ejecutar la auditoría.')
      setMessage(`Auditoría completada · ${data.proposed || 0} mejora(s) nueva(s) priorizada(s).`)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No fue posible ejecutar la auditoría.')
    } finally {
      setRunning(false)
    }
  }

  return <div className="evolution-run-control">
    <button className="btn btn-coral" onClick={runAudit} disabled={running}>
      {running ? <RefreshCw size={17} className="spin" /> : <ScanSearch size={17} />}
      {running ? 'Auditando...' : 'Ejecutar auditoría integral'}
    </button>
    {message && <small role="status" aria-live="polite">{message}</small>}
  </div>
}
