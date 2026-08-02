'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app-error]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <main className="platform-fallback">
      <section className="platform-fallback-card" role="alert">
        <span className="platform-fallback-icon"><AlertTriangle size={30} /></span>
        <p className="platform-fallback-kicker">Error recuperable</p>
        <h1>No pudimos cargar esta sección</h1>
        <p>
          Tus datos no se han eliminado. Puedes intentar nuevamente o volver al panel principal.
        </p>
        <div className="platform-fallback-actions">
          <button type="button" onClick={reset}>
            <RefreshCw size={17} /> Reintentar
          </button>
          <Link href="/app">
            <Home size={17} /> Volver al inicio
          </Link>
        </div>
        {error.digest && <small>Referencia: {error.digest}</small>}
      </section>
    </main>
  )
}
