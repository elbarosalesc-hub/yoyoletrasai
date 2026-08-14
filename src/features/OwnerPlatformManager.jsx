import { useEffect, useMemo, useState } from 'react';
import './OwnerPlatformManager.css';

async function loadOwnerProfile(accessToken) {
  const response = await fetch('/api/owner/profile', { headers: { Authorization: `Bearer ${accessToken}` } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'No fue posible cargar el perfil propietario.');
  return payload;
}

function State({ ok, pendingLabel = 'Pendiente', readyLabel = 'Listo' }) {
  return <span className={`owner-state ${ok ? 'ready' : 'pending'}`}>{ok ? readyLabel : pendingLabel}</span>;
}

export default function OwnerPlatformManager({ accessToken }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    if (!accessToken) return;
    setBusy(true); setError('');
    try { setData(await loadOwnerProfile(accessToken)); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  useEffect(() => { load(); }, [accessToken]);

  const missing = useMemo(() => data?.coverage?.missing || [], [data]);
  if (!data) return <section className="owner-platform-panel"><div className="owner-platform-loading"><b>{error || 'Cargando Centro de Control Propietario…'}</b>{error && <button className="button button--secondary" onClick={load}>Reintentar</button>}</div></section>;

  const profile = data.profile;
  return <section className="owner-platform-panel">
    <div className="owner-platform-hero">
      <div><span className="eyebrow">PERFIL PROPIETARIO · CONTROL MAESTRO</span><h3>Centro de Control YoYoLetrasAI</h3><p>Gobernanza de plataforma, IA, módulos, diseño, automatización, planes y futuras integraciones. Los cambios sensibles permanecen bloqueados hasta una aprobación explícita.</p></div>
      <div className="owner-protection"><strong>Producción protegida</strong><span>Dominio, alias y despliegue no se modifican desde este panel.</span></div>
    </div>

    {error && <p className="owner-access-error" role="alert">{error}</p>}

    <div className="owner-control-grid">
      <article><span>Motor nativo YOYO</span><strong>{data.runtime.nativeModel}</strong><State ok={data.runtime.nativeConfigured} readyLabel="Conectado" pendingLabel="Adaptador listo · servidor pendiente" /></article>
      <article><span>YOYO Storage</span><strong>{data.storage.bucket || 'yoyo-private'}</strong><State ok={data.storage.configured} readyLabel="Conectado" pendingLabel="Adaptador listo · almacenamiento pendiente" /></article>
      <article><span>Paridad funcional</span><strong>{data.coverage.covered}/{data.coverage.total}</strong><State ok={missing.length === 0} readyLabel="Verificada" pendingLabel={`${missing.length} capacidades por implementar`} /></article>
      <article><span>Autoevolución</span><strong>Cada 6 meses</strong><State ok={profile.automation.capabilityBenchmarkMonths === 6 && profile.automation.curriculumRefreshMonths === 6} readyLabel="Programada" /></article>
    </div>

    <div className="owner-platform-columns">
      <section className="owner-platform-card">
        <div><span className="eyebrow">MÓDULOS</span><h4>Administración de los 19 módulos</h4><p>La arquitectura contempla renombrar, mostrar/ocultar, cambiar íconos y generar recursos por módulo. Las escrituras se habilitarán por etapas para evitar cambios destructivos.</p></div>
        <div className="owner-module-list">{profile.modules.map((module) => <article key={module.id}><b>{module.label}</b><small>{module.resourceFactory ? 'Generador activo en arquitectura' : 'Sin generador'}</small><State ok={module.configurable} /></article>)}</div>
      </section>

      <section className="owner-platform-card">
        <div><span className="eyebrow">DISEÑO Y MARCA</span><h4>Tema, colores, tipografía e íconos</h4></div>
        <div className="owner-config-list">
          <article><div><b>Tema visual</b><small>Vista previa propietaria antes de aplicar.</small></div><State ok={profile.visualDesign.themeControl} /></article>
          <article><div><b>Paleta y colores</b><small>Control centralizado sin editar producción directamente.</small></div><State ok={profile.visualDesign.paletteControl} /></article>
          <article><div><b>Íconos y densidad</b><small>Configurables por módulo y experiencia.</small></div><State ok={profile.visualDesign.iconControl && profile.visualDesign.densityControl} /></article>
          <article><div><b>Tipografía</b><small>Preparada para control global y accesibilidad.</small></div><State ok={profile.visualDesign.typographyControl} /></article>
        </div>
      </section>
    </div>

    <div className="owner-platform-columns">
      <section className="owner-platform-card">
        <div><span className="eyebrow">OPERACIÓN</span><h4>Cache, planes, términos y pagos</h4></div>
        <div className="owner-config-list">
          <article><div><b>Cache seguro versionado</b><small>Invalida recursos al cambiar versión y excluye secretos/tokens.</small></div><State ok={profile.cache.configurable} /></article>
          <article><div><b>Planes y cuotas</b><small>Catálogo, límites y suspensión administrables por propietaria.</small></div><State ok={profile.plans.ownerCanManageCatalog && profile.plans.ownerCanManageQuotas} /></article>
          <article><div><b>Términos y privacidad</b><small>Versionado y aprobación propietaria obligatoria.</small></div><State ok={profile.legal.termsVersioning && profile.legal.privacyVersioning} /></article>
          <article><div><b>Métodos de pago</b><small>Arquitectura preparada; activación real permanece bloqueada hasta autorización.</small></div><State ok={profile.payments.enabled} readyLabel="Activo" pendingLabel="Preparado · no activado" /></article>
        </div>
      </section>

      <section className="owner-platform-card">
        <div><span className="eyebrow">IA FULL PROPIETARIA</span><h4>{profile.ai.ownerRoles.length} roles expertos coordinados</h4><p>Los roles se conservan como protocolo exclusivo del perfil propietario.</p></div>
        <div className="owner-role-cloud">{profile.ai.ownerRoles.map((role) => <span key={role.id} title={role.mandate}>{role.label}</span>)}</div>
        <div className="owner-independence"><b>{data.checklist.readyForFullIndependence ? 'Independencia completa verificada' : 'Independencia en implementación segura'}</b><small>Para declararla completa deben estar conectados el motor nativo, YOYO Storage y cerradas las brechas funcionales verificadas.</small></div>
      </section>
    </div>

    {missing.length > 0 && <section className="owner-platform-card owner-gaps"><div><span className="eyebrow">HOJA DE RUTA AUTOMÁTICA</span><h4>Capacidades pendientes detectadas</h4><p>Se muestran como brechas reales para evitar afirmar funciones que todavía no están verificadas.</p></div><div>{missing.map((item) => <span key={item}>{item.replaceAll('_', ' ')}</span>)}</div></section>}

    <section className="owner-safe-banner"><b>Modo de mejora incremental activo.</b><span>{data.safeguards.message}</span></section>
  </section>;
}
