'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[global-error]', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <html lang="es">
      <body>
        <main className="platform-fallback">
          <section className="platform-fallback-card" role="alert">
            <p className="platform-fallback-kicker">Protección global activa</p>
            <h1>La plataforma encontró un problema inesperado</h1>
            <p>
              La sesión se mantiene protegida. Recarga la aplicación para restablecer la interfaz.
            </p>
            <div className="platform-fallback-actions">
              <button type="button" onClick={reset}>Intentar nuevamente</button>
              <a href="/presentacion">Ir a la presentación pública</a>
            </div>
            {error.digest && <small>Referencia: {error.digest}</small>}
          </section>
        </main>
      </body>
    </html>
  )
}
