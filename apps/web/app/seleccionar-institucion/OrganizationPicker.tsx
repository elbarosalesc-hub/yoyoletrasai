'use client'

import { useState } from 'react'

type OrganizationOption = {
  id: string
  name: string
  slug: string
  role: string
}

export function OrganizationPicker({ organizations }: { organizations: OrganizationOption[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function selectOrganization(id: string) {
    setPendingId(id)
    setError('')
    const response = await fetch('/api/session/organization', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationId: id }),
    })

    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null
      setError(payload?.error ?? 'No fue posible seleccionar la institución.')
      setPendingId(null)
      return
    }

    window.location.assign('/app')
  }

  return (
    <div className="organization-list">
      {error && <div className="organization-error" role="alert">{error}</div>}
      {organizations.map((organization) => (
        <button key={organization.id} onClick={() => selectOrganization(organization.id)} disabled={pendingId !== null}>
          <span className="organization-avatar">{organization.name.slice(0, 2).toUpperCase()}</span>
          <span><strong>{organization.name}</strong><small>{organization.role.replaceAll('_', ' ')}</small></span>
          <em>{pendingId === organization.id ? 'Ingresando…' : 'Continuar →'}</em>
        </button>
      ))}
      <style jsx>{`
        .organization-list{display:grid;gap:14px}.organization-list button{width:100%;display:grid;grid-template-columns:56px 1fr auto;align-items:center;gap:15px;text-align:left;padding:16px;border:1px solid #e2e6ef;border-radius:18px;background:white;cursor:pointer;transition:.18s}.organization-list button:hover{transform:translateY(-2px);border-color:#3157d5;box-shadow:0 16px 38px #273b7c17}.organization-list button:disabled{cursor:wait;opacity:.7}.organization-avatar{width:52px;height:52px;border-radius:16px;display:grid;place-items:center;background:#e9eeff;color:#3157d5;font-weight:950}.organization-list strong,.organization-list small{display:block}.organization-list small{margin-top:5px;color:#687087;text-transform:capitalize}.organization-list em{font-style:normal;color:#3157d5;font-weight:900}.organization-error{padding:13px;border-radius:13px;background:#fff0ed;color:#9b3028;font-weight:800}@media(max-width:600px){.organization-list button{grid-template-columns:48px 1fr}.organization-list em{grid-column:2}}
      `}</style>
    </div>
  )
}
