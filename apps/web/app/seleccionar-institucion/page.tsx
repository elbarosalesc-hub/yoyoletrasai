import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OrganizationPicker } from './OrganizationPicker'

export default async function SelectOrganizationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/acceso?next=/seleccionar-institucion')

  const { data, error } = await supabase
    .from('organization_memberships')
    .select('role, organization:organizations(id, name, slug)')
    .eq('user_id', user.id)
    .eq('is_active', true)

  if (error) throw new Error(`No fue posible cargar las instituciones: ${error.message}`)

  const organizations = (data ?? []).flatMap((membership) => {
    const organization = Array.isArray(membership.organization)
      ? membership.organization[0]
      : membership.organization
    return organization ? [{ ...organization, role: membership.role }] : []
  })

  return (
    <main className="selector-shell">
      <section className="selector-card">
        <span className="eyebrow">CONTEXTO DE TRABAJO</span>
        <h1>Selecciona tu institución</h1>
        <p>Los permisos, cursos y datos se cargarán según la institución elegida.</p>
        {organizations.length > 0 ? (
          <OrganizationPicker organizations={organizations} />
        ) : (
          <div className="empty-state">
            <strong>Aún no tienes una institución asignada.</strong>
            <p>Un administrador debe agregarte a una organización antes de continuar.</p>
          </div>
        )}
        <form action="/auth/cerrar-sesion" method="post"><button className="signout">Cerrar sesión</button></form>
      </section>
      <style>{`
        .selector-shell{min-height:100vh;display:grid;place-items:center;padding:28px;background:radial-gradient(circle at top,#e9eeff,transparent 35%),#f7f8fc;color:#192033}.selector-card{width:min(680px,100%);padding:clamp(26px,5vw,48px);border-radius:28px;background:#fff;border:1px solid #e2e6ef;box-shadow:0 30px 90px #27345a1a}.selector-card .eyebrow{font-size:12px;letter-spacing:.15em;font-weight:950;color:#3157d5}.selector-card h1{font-size:clamp(32px,5vw,48px);margin:10px 0}.selector-card>p{color:#5d6578;margin-bottom:28px}.empty-state{padding:24px;border-radius:18px;background:#fff6d8;border:1px solid #eab83a55}.empty-state p{margin-bottom:0;color:#66551d}.signout{margin-top:24px;border:0;background:none;color:#5d6578;font-weight:800;cursor:pointer;padding:8px 0}
      `}</style>
    </main>
  )
}
