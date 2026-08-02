'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Building2, ChevronDown, LogOut, Settings, ShieldCheck } from 'lucide-react'

type SessionContext = {
  displayName: string
  initials: string
  role: string
  roleLabel: string
  organizationId: string
  organizationName: string
  organizationSlug: string
  avatarUrl: string | null
}

type SessionMenuProps = {
  open: boolean
  onToggle: () => void
  onClose: () => void
}

export function SessionMenu({ open, onToggle, onClose }: SessionMenuProps) {
  const [context, setContext] = useState<SessionContext | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let active = true

    async function loadContext() {
      try {
        const response = await fetch('/api/session/context', {
          credentials: 'same-origin',
          cache: 'no-store',
        })

        if (!response.ok) throw new Error('No fue posible cargar la sesión')
        const payload = (await response.json()) as SessionContext
        if (active) setContext(payload)
      } catch {
        if (active) setFailed(true)
      }
    }

    loadContext()
    return () => {
      active = false
    }
  }, [])

  const displayName = context?.displayName ?? (failed ? 'Sesión activa' : 'Cargando…')
  const roleLabel = context?.roleLabel ?? 'Perfil institucional'
  const initials = context?.initials ?? 'YO'

  return (
    <div className="top-action-wrap profile-wrap">
      <button
        className="user user-button"
        onClick={onToggle}
        aria-expanded={open}
        aria-label="Abrir menú de sesión"
      >
        <div>
          <strong>{roleLabel}</strong>
          <br />
          <small>{displayName}</small>
        </div>
        <div className="avatar avatar-photo" aria-hidden="true">
          {context?.avatarUrl ? (
            <Image src={context.avatarUrl} alt="" width={42} height={42} />
          ) : initials}
        </div>
        <ChevronDown size={15} />
      </button>

      {open && (
        <div className="top-popover profile-popover">
          <div className="profile-summary">
            <div className="avatar avatar-photo" aria-hidden="true">
              {context?.avatarUrl ? (
                <Image src={context.avatarUrl} alt="" width={46} height={46} />
              ) : initials}
            </div>
            <div>
              <strong>{displayName}</strong>
              <span>{roleLabel}</span>
              {context?.organizationName && <small>{context.organizationName}</small>}
            </div>
          </div>

          <Link href="/configuracion" onClick={onClose}>
            <Settings size={17} /> Configuración
          </Link>
          <Link href="/seleccionar-institucion" onClick={onClose}>
            <Building2 size={17} /> Cambiar institución
          </Link>
          <Link href="/estado" onClick={onClose}>
            <ShieldCheck size={17} /> Estado de la plataforma
          </Link>
          <form action="/auth/cerrar-sesion" method="post">
            <button type="submit">
              <LogOut size={17} /> Cerrar sesión
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
