import { useEffect, useMemo, useState } from 'react';
import './OwnerFactoryManager.css';

async function factoryRequest(accessToken, body) {
  const response = await fetch('/api/owner/factory', {
    method: body ? 'POST' : 'GET',
    headers: { Authorization: `Bearer ${accessToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'No fue posible conectar con YOYO Core.');
  return payload;
}

function dateLabel(value) {
  return value ? new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Pendiente';
}

function percent(value) {
  return `${Math.round((Number(value) || 0) * 100)}%`;
}

export default function OwnerFactoryManager({ accessToken, toast }) {
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = async () => {
    if (!accessToken) return;
    try { setError(''); setData(await factoryRequest(accessToken)); }
    catch (requestError) { setError(requestError.message); }
  };
  useEffect(() => { load(); }, [accessToken]);

  const moduleCoverage = useMemo(() => {
    const counts = new Map((data?.modules || []).map((module) => [module.id, 0]));
    (data?.candidates || []).forEach((candidate) => counts.set(candidate.payload?.moduleId, (counts.get(candidate.payload?.moduleId) || 0) + 1));
    return counts;
  }, [data]);

  async function act(body, success) {
    setBusy(true); setError('');
    try { const next = await factoryRequest(accessToken, body); setData(next); toast?.(next.message || success); }
    catch (requestError) { setError(requestError.message); }
    finally { setBusy(false); }
  }

  if (!data) return <div className="factory-loading"><b>{error || 'Cargando YOYO Core…'}</b>{error && <button className="button button--secondary" onClick={load}>Reintentar</button>}</div>;
  const profile = data.profile;
  const review = data.candidates.filter((candidate) => candidate.status === 'review');
  const ownerProfile = data.ownerProfile || {};
  const checklist = data.checklist || { checks: [], blocking: [] };

  return <div className="factory-manager">
    <section className="factory-hero">
      <div><span className="eyebrow">MOTOR PROPIO · {data.engine.version}</span><h3>{data.engine.name}</h3><p>Orquesta creación original, control DUA, trazabilidad, fábrica de recursos y actualización comparativa cada seis meses. Los cambios críticos siguen bloqueados fuera de producción hasta aprobación propietaria.</p></div>
      <button disabled={busy || profile.factory_running} className="button button--primary" onClick={() => act({ action: 'run_now' }, 'Ciclo de creación completado.')}>{profile.factory_running ? 'Creando recursos…' : 'Crear lote ahora'}</button>
    </section>
    {error && <p className="source-file-error" role="alert">{error}</p>}

    <section className="factory-review">
      <div><span className="eyebrow">CENTRO DE CONTROL PROPIETARIO</span><h4>Estado de independencia y bloqueos seguros</h4></div>
      <div className="owner-control-checks">{checklist.checks.map((check) => <article key={check.id} className={check.ok ? 'covered' : ''}><div><small>{check.ok ? 'LISTO' : 'PENDIENTE'}</small><h5>{check.label}</h5></div><strong>{check.ok ? '✓' : '○'}</strong></article>)}</div>
      <p className="factory-empty">{checklist.readyForFullIndependence ? 'La arquitectura verificada cumple los requisitos definidos para independencia completa.' : `Independencia total aún bloqueada de forma segura por: ${checklist.blocking.join(', ') || 'ninguno'}. No se ocultan dependencias externas ni se promueve automáticamente a producción.`}</p>
    </section>

    <div className="factory-status-grid">
      <article><span>YOYO Native Runtime</span><strong>{data.runtime?.nativeConfigured ? 'Conectado' : 'Preparado, pendiente de servidor'}</strong><small>{data.runtime?.nativeModel || 'yoyo-edu-cl'} · fallback externo {data.runtime?.externalFallbackAllowed ? 'controlado' : 'desactivado'}</small></article>
      <article><span>YOYO Storage</span><strong>{data.storage?.configured ? 'Conectado' : 'Preparado, pendiente de infraestructura'}</strong><small>{data.storage?.bucket || 'yoyo-private'} · {data.storage?.ownership || 'platform-controlled'}</small></article>
      <article><span>Paridad funcional</span><strong>{percent(data.coverage?.ratio)}</strong><small>{data.coverage?.covered || 0} de {data.coverage?.total || 0} capacidades verificadas; las faltantes quedan visibles como brechas.</small></article>
      <article><span>Meta competitiva</span><strong>+20% medible</strong><small>Se aplica después de cerrar paridad y comprobar calidad; no se declara alcanzada sin evidencia.</small></article>
      <article><span>Fábrica continua</span><strong>{profile.resource_factory_enabled ? 'Activa' : 'En pausa'}</strong><small>Próximo lote: {dateLabel(profile.next_factory_at)}</small></article>
      <article><span>Radar y benchmark</span><strong>Cada 6 meses</strong><small>Próxima revisión: {dateLabel(profile.next_scan_at)}</small></article>
      <article><span>Control de calidad</span><strong>≥ {Math.max(90, Number(profile.quality_threshold || 0))}/100</strong><small>{profile.auto_publish_resources ? 'Publicación automática sólo sobre umbral configurado' : 'Revisión propietaria antes de publicar'}</small></article>
      <article><span>Producción y dominio</span><strong>Protegidos</strong><small>Sin promoción automática, sin cambios de dominio ni alias desde este panel.</small></article>
    </div>

    <section className="factory-settings">
      <div><span className="eyebrow">GOBERNANZA</span><h4>Reglas de creación</h4></div>
      <label><span>Fábrica activa</span><input type="checkbox" checked={profile.resource_factory_enabled} onChange={(event) => setData({ ...data, profile: { ...profile, resource_factory_enabled: event.target.checked } })}/></label>
      <label><span>Publicar al superar el umbral</span><input type="checkbox" checked={profile.auto_publish_resources} onChange={(event) => setData({ ...data, profile: { ...profile, auto_publish_resources: event.target.checked } })}/></label>
      <label><span>Recursos por lote</span><input type="number" min="1" max="5" value={profile.factory_batch_size} onChange={(event) => setData({ ...data, profile: { ...profile, factory_batch_size: Number(event.target.value) } })}/></label>
      <label><span>Umbral de calidad</span><input type="number" min="90" max="98" value={Math.max(90, Number(profile.quality_threshold || 90))} onChange={(event) => setData({ ...data, profile: { ...profile, quality_threshold: Number(event.target.value) } })}/></label>
      <button disabled={busy} className="button button--secondary" onClick={() => act({ action: 'update_profile', enabled: profile.enabled, resourceFactoryEnabled: profile.resource_factory_enabled, autoPublish: profile.auto_publish_resources, batchSize: profile.factory_batch_size, qualityThreshold: Math.max(90, Number(profile.quality_threshold || 90)) }, 'Configuración guardada.')}>Guardar reglas</button>
    </section>

    <section className="factory-coverage"><div><span className="eyebrow">19 MÓDULOS</span><h4>Cobertura de recursos propios</h4></div><div>{data.modules.map((module) => <article key={module.id} className={moduleCoverage.get(module.id) ? 'covered' : ''}><span>{moduleCoverage.get(module.id) ? '✓' : '○'}</span><b>{module.label}</b><small>{moduleCoverage.get(module.id) || 0} creados</small></article>)}</div></section>

    <section className="factory-review">
      <div><span className="eyebrow">CONFIGURACIÓN DEL PERFIL PROPIETARIO</span><h4>Controles reservados y preparados</h4></div>
      <div className="owner-control-summary">
        <article><div><small>MÓDULOS</small><h5>Agregar, quitar, renombrar, ocultar e iconos</h5><p>{ownerProfile.modules?.length || 0} módulos declarados como administrables y conectados a la fábrica.</p></div></article>
        <article><div><small>DISEÑO</small><h5>Temas, colores, tipografía, densidad e iconografía</h5><p>Los cambios visuales requieren vista previa propietaria antes de activarse.</p></div></article>
        <article><div><small>PLATAFORMA</small><h5>Caché, planes, cuotas y accesos</h5><p>Configuración versionada y protección explícita de secretos y tokens.</p></div></article>
        <article><div><small>LEGAL Y PAGOS</small><h5>Términos, privacidad y métodos de pago</h5><p>Arquitectura preparada; pagos permanecen desactivados hasta activación explícita de la propietaria.</p></div></article>
        <article><div><small>YOYO IA</small><h5>Roles, motor, almacenamiento, benchmark y autoactualización</h5><p>{ownerProfile.ai?.ownerRoles?.length || 0} roles especializados preservados y auditables.</p></div></article>
      </div>
    </section>

    <section className="factory-review"><div><span className="eyebrow">BANDEJA PROPIETARIA</span><h4>{review.length} borradores por revisar</h4></div>{review.length ? <div>{review.map((candidate) => <article key={candidate.id}><div><small>{candidate.payload?.moduleLabel} · {candidate.quality_score}/100</small><h5>{candidate.title}</h5><p>{candidate.payload?.objective}</p></div><span><button disabled={busy} onClick={() => act({ action: 'review_candidate', candidateId: candidate.id, decision: 'dismiss' })}>Descartar</button><button disabled={busy} className="button button--primary" onClick={() => act({ action: 'review_candidate', candidateId: candidate.id, decision: 'publish' })}>Publicar</button></span></article>)}</div> : <p className="factory-empty">No hay borradores pendientes. Los próximos lotes cubrirán primero los módulos con menos recursos.</p>}</section>
  </div>;
}
