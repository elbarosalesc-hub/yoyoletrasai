import { redirect } from 'next/navigation'
import { createClient as createAdminSupabase } from '@supabase/supabase-js'
import { AppShell } from '@/components/AppShell'
import { createClient } from '@/lib/supabase/server'
import { SUPABASE_URL } from '@/lib/supabase/config'
import { OwnerKeyManager } from './OwnerKeyManager'

export const dynamic='force-dynamic'

async function ownerContext(){
  const supabase=await createClient()
  const {data}=await supabase.auth.getUser()
  if(!data.user)redirect('/acceso?next=/propietaria')
  const secret=process.env.SUPABASE_SECRET_KEY||process.env.SUPABASE_SERVICE_ROLE_KEY||''
  if(!secret)throw new Error('Falta configuración administrativa del servidor.')
  const admin=createAdminSupabase(SUPABASE_URL,secret,{auth:{persistSession:false,autoRefreshToken:false}})
  const [{data:membership},{data:entitlement}]=await Promise.all([
    admin.from('organization_memberships').select('id,organization_id').eq('user_id',data.user.id).eq('role','platform_admin').eq('is_active',true).maybeSingle(),
    admin.from('ai_entitlements').select('plan_id,status,period_end').eq('user_id',data.user.id).eq('plan_id','propietaria').in('status',['active','trialing']).gt('period_end',new Date().toISOString()).maybeSingle(),
  ])
  if(!membership||!entitlement)redirect('/app')
  return {email:data.user.email||'',plan:entitlement.plan_id}
}

export default async function OwnerPage(){
  const owner=await ownerContext()
  return <AppShell active="Propietaria">
    <div className="approved-platform-dashboard">
      <section className="approved-hero-row"><div><span className="approved-kicker">CONTROL PROPIETARIO</span><h1>Centro de comando de toda la plataforma</h1><p>{owner.email} · plan {owner.plan} · YOYO IA sin cuotas internas.</p></div></section>
      <section className="approved-main-grid">
        <OwnerKeyManager/>
        <aside className="approved-panel" style={{padding:24}}><h2>Gobierno seguro</h2><p>Los cambios sensibles se preparan, validan y revisan antes de llegar a producción. El dominio permanente y la plataforma completa quedan protegidos durante cada mejora.</p><div className="approved-readiness"><div><div><strong>Plataforma completa</strong><small>No se eliminan módulos existentes.</small></div></div><div><div><strong>YOYO IA propietaria</strong><small>Clave cifrada y reutilizable en servidor.</small></div></div><div><div><strong>Publicación controlada</strong><small>Preview, auditoría y build antes de producción.</small></div></div></div></aside>
      </section>
    </div>
  </AppShell>
}