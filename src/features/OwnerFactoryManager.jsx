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

  const coverage = useMemo(() => {
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
  return <div className="factory-manager">
    <section className="factory-hero">
      <div><span className="eyebrow">MOTOR PROPIO · {data.engine.version}</span><h3>{data.engine.name}</h3><p>Orquesta creación original, control DUA, trazabilidad y actualización de criterios cada seis meses.</p></div>
      <button disabled={busy || profile.factory_running} className="button button--primary" onClick={() => act({ action: 'run_now' }, 'Ciclo de creación completado.')}>{profile.factory_running ? 'Creando recursos…' : 'Crear lote ahora'}</button>
    </section>
    {error && <p className="source-file-error" role="alert">{error}</p>}
    <div className="factory-status-grid">
      <article><span>Google Cloud privado</span><strong>{data.storage.configured ? 'Conectado' : 'Pendiente de credenciales'}</strong><small>{data.storage.bucket || 'El bucket se activa con las variables privadas del proyecto'}</small></article>
      <article><span>Fábrica continua</span><strong>{profile.resource_factory_enabled ? 'Activa' : 'En pausa'}</strong><small>Próximo lote: {dateLabel(profile.next_factory_at)}</small></article>
      <article><span>Radar de actualización</span><strong>Cada 6 meses</strong><small>Próxima revisión: {dateLabel(profile.next_scan_at)}</small></article>
      <article><span>Control de calidad</span><strong>≥ {profile.quality_threshold}/100</strong><small>{profile.auto_publish_resources ? 'Publicación automática sobre umbral' : 'Revisión propietaria antes de publicar'}</small></article>
    </div>
    <section className="factory-settings">
      <div><span className="eyebrow">GOBERNANZA</span><h4>Reglas de creación</h4></div>
      <label><span>Fábrica activa</span><input type="checkbox" checked={profile.resource_factory_enabled} onChange={(event) => setData({ ...data, profile: { ...profile, resource_factory_enabled: event.target.checked } })}/></label>
      <label><span>Publicar al superar el umbral</span><input type="checkbox" checked={profile.auto_publish_resources} onChange={(event) => setData({ ...data, profile: { ...profile, auto_publish_resources: event.target.checked } })}/></label>
      <label><span>Recursos por lote</span><input type="number" min="1" max="5" value={profile.factory_batch_size} onChange={(event) => setData({ ...data, profile: { ...profile, factory_batch_size: Number(event.target.value) } })}/></label>
      <label><span>Umbral de calidad</span><input type="number" min="86" max="98" value={profile.quality_threshold} onChange={(event) => setData({ ...data, profile: { ...profile, quality_threshold: Number(event.target.value) } })}/></label>
      <button disabled={busy} className="button button--secondary" onClick={() => act({ action: 'update_profile', enabled: profile.enabled, resourceFactoryEnabled: profile.resource_factory_enabled, autoPublish: profile.auto_publish_resources, batchSize: profile.factory_batch_size, qualityThreshold: profile.quality_threshold }, 'Configuración guardada.')}>Guardar reglas</button>
    </section>
    <section className="factory-coverage"><div><span className="eyebrow">19 MÓDULOS</span><h4>Cobertura de recursos propios</h4></div><div>{data.modules.map((module) => <article key={module.id} className={coverage.get(module.id) ? 'covered' : ''}><span>{coverage.get(module.id) ? '✓' : '○'}</span><b>{module.label}</b><small>{coverage.get(module.id) || 0} creados</small></article>)}</div></section>
    <section className="factory-review"><div><span className="eyebrow">BANDEJA PROPIETARIA</span><h4>{review.length} borradores por revisar</h4></div>{review.length ? <div>{review.map((candidate) => <article key={candidate.id}><div><small>{candidate.payload?.moduleLabel} · {candidate.quality_score}/100</small><h5>{candidate.title}</h5><p>{candidate.payload?.objective}</p></div><span><button disabled={busy} onClick={() => act({ action: 'review_candidate', candidateId: candidate.id, decision: 'dismiss' })}>Descartar</button><button disabled={busy} className="button button--primary" onClick={() => act({ action: 'review_candidate', candidateId: candidate.id, decision: 'publish' })}>Publicar</button></span></article>)}</div> : <p className="factory-empty">No hay borradores pendientes. Los próximos lotes cubrirán primero los módulos con menos recursos.</p>}</section>
  </div>;
}
