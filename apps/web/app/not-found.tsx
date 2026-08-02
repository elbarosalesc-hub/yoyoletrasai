import Link from 'next/link'
import { ArrowLeft, Compass, Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <main className="platform-fallback">
      <section className="platform-fallback-card">
        <span className="platform-fallback-icon"><Compass size={30} /></span>
        <p className="platform-fallback-kicker">Página no encontrada</p>
        <h1>Esta dirección no existe o cambió de ubicación</h1>
        <p>
          Comprueba el enlace o regresa a una sección disponible de YOYOLETRASAI.
        </p>
        <div className="platform-fallback-actions">
          <Link href="/app"><Home size={17} /> Ir al panel</Link>
          <Link href="/presentacion"><ArrowLeft size={17} /> Ver presentación</Link>
        </div>
      </section>
    </main>
  )
}
