import { useEffect, useMemo, useState } from 'react';

const EMPTY_ACCOUNT = { email: '', displayName: '', password: '', planId: 'basico', monthlyTokenLimit: '' };

function tokenValue(value) {
  if (value === -1) return 'Sin límite';
  return Number.isFinite(Number(value)) ? Number(value).toLocaleString('es-CL') : 'Según plan';
}

function EngineKey({ engine, busy, onSave }) {
  const [gatewayKey, setGatewayKey] = useState('');
  return <section className="owner-access-card owner-engine-card">
    <div><span className="eyebrow">MOTOR PRIVADO</span><h3>Credencial de YOYO IA</h3><p>La clave se cifra en el servidor. Nunca se envía nuevamente al navegador ni queda visible para usuarios.</p></div>
    <div className="engine-status"><b className={engine?.configured ? 'connected' : ''}>{engine?.configured ? '● Configurado' : '○ Pendiente'}</b><small>{engine?.configured ? `Origen: ${engine.source} · terminación ${engine.lastFour || 'protegida'}` : 'Ingresa una credencial del motor para habilitar generaciones.'}</small></div>
    <form onSubmit={async (event) => { event.preventDefault(); await onSave(gatewayKey); setGatewayKey(''); }}>
      <label>Nueva clave privada<input type="password" autoComplete="off" value={gatewayKey} onChange={(event) => setGatewayKey(event.target.value)} minLength="20" required placeholder="Se guardará cifrada" /></label>
      <button className="button button--primary" disabled={busy}>Guardar o rotar clave</button>
    </form>
  </section>;
}

export default function OwnerAccessManager({ accessToken, toast }) {
  const [data, setData] = useState({ engine: null, accounts: [] });
  const [account, setAccount] = useState(EMPTY_ACCOUNT);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [planEdit, setPlanEdit] = useState({ userId: '', planId: 'basico', monthlyTokenLimit: '', status: 'active' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const manageableAccounts = useMemo(() => data.accounts.filter((item) => item.role !== 'platform_admin'), [data.accounts]);

  async function load() {
    if (!accessToken) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/owner/control', { headers: { Authorization: `Bearer ${accessToken}` } });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No fue posible cargar los accesos.');
      setData(payload);
      setSelectedUserId((current) => current || payload.accounts[0]?.userId || '');
      const firstManaged = payload.accounts.find((item) => item.role !== 'platform_admin');
      setPlanEdit((current) => current.userId || !firstManaged ? current : { userId: firstManaged.userId, planId: firstManaged.planId || 'basico', monthlyTokenLimit: '', status: firstManaged.entitlementStatus === 'suspended' ? 'suspended' : 'active' });
    } catch (loadError) { setError(loadError.message); }
    finally { setBusy(false); }
  }

  useEffect(() => { load(); }, [accessToken]);

  async function post(body, successMessage) {
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/owner/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(body),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No fue posible completar la operación.');
      toast?.(payload.message || successMessage);
      await load();
      return true;
    } catch (requestError) { setError(requestError.message); return false; }
    finally { setBusy(false); }
  }

  async function createAccount(event) {
    event.preventDefault();
    const ok = await post({ action: 'create_account', ...account, monthlyTokenLimit: account.monthlyTokenLimit ? Number(account.monthlyTokenLimit) : null }, 'Cuenta creada.');
    if (ok) setAccount(EMPTY_ACCOUNT);
  }

  function choosePlanAccount(userId) {
    const selected = manageableAccounts.find((item) => item.userId === userId);
    setPlanEdit({ userId, planId: selected?.planId || 'basico', monthlyTokenLimit: '', status: selected?.entitlementStatus === 'suspended' ? 'suspended' : 'active' });
  }

  return <div className="owner-access-manager">
    <EngineKey engine={data.engine} busy={busy} onSave={(gatewayKey) => post({ action: 'save_engine_key', gatewayKey }, 'Clave del motor guardada.')} />
    {error && <p className="owner-access-error" role="alert">{error}</p>}

    <section className="owner-access-card">
      <div className="owner-access-heading"><div><span className="eyebrow">CUENTAS DE USUARIO</span><h3>Crear acceso con contraseña inicial</h3><p>La propietaria define la contraseña y asigna inmediatamente el plan y su límite de tokens.</p></div><b>{data.accounts.length} cuentas</b></div>
      <form className="owner-account-form" onSubmit={createAccount}>
        <label>Nombre visible<input value={account.displayName} onChange={(event) => setAccount({ ...account, displayName: event.target.value })} minLength="2" required /></label>
        <label>Correo<input type="email" value={account.email} onChange={(event) => setAccount({ ...account, email: event.target.value })} required /></label>
        <label>Contraseña inicial<input type="password" autoComplete="new-password" value={account.password} onChange={(event) => setAccount({ ...account, password: event.target.value })} minLength="12" required /></label>
        <label>Plan<select value={account.planId} onChange={(event) => setAccount({ ...account, planId: event.target.value })}><option value="basico">Básico</option><option value="premium">Premium</option></select></label>
        <label>Límite especial de tokens<input type="number" min="10000" max="100000000" value={account.monthlyTokenLimit} onChange={(event) => setAccount({ ...account, monthlyTokenLimit: event.target.value })} placeholder="Vacío = cuota del plan" /></label>
        <button className="button button--primary" disabled={busy}>Crear cuenta protegida</button>
        <small className="span-two">Mínimo 12 caracteres con mayúscula, minúscula, número y símbolo. La clave nunca se muestra en la lista.</small>
      </form>
    </section>

    <section className="owner-access-card">
      <div className="owner-access-heading"><div><span className="eyebrow">CONTROL DE CONSUMO</span><h3>Planes, tokens y estado</h3></div></div>
      <div className="owner-account-list">{data.accounts.map((item) => <article key={item.userId}><div><b>{item.displayName}</b><span>{item.email}</span><small>{item.role === 'platform_admin' ? 'Propietaria' : `Plan ${item.planName || 'sin asignar'}`} · {item.entitlementStatus || 'sin acceso'}</small></div><div><strong>{Number(item.monthlyTokenUsed || 0).toLocaleString('es-CL')} / {tokenValue(item.monthlyTokenLimit)}</strong><small>tokens usados / límite mensual</small><span>{item.unlimitedFiles ? 'Archivos sin límite de cantidad' : 'Archivos según plan'}</span></div></article>)}</div>
      {manageableAccounts.length > 0 && <form className="owner-inline-form" onSubmit={(event) => { event.preventDefault(); post({ action: 'update_account', ...planEdit, monthlyTokenLimit: planEdit.monthlyTokenLimit ? Number(planEdit.monthlyTokenLimit) : null }, 'Acceso actualizado.'); }}>
        <label>Usuario<select value={planEdit.userId} onChange={(event) => choosePlanAccount(event.target.value)}>{manageableAccounts.map((item) => <option key={item.userId} value={item.userId}>{item.email}</option>)}</select></label>
        <label>Plan<select value={planEdit.planId} onChange={(event) => setPlanEdit({ ...planEdit, planId: event.target.value })}><option value="basico">Básico</option><option value="premium">Premium</option></select></label>
        <label>Tokens personalizados<input type="number" min="10000" max="100000000" value={planEdit.monthlyTokenLimit} onChange={(event) => setPlanEdit({ ...planEdit, monthlyTokenLimit: event.target.value })} placeholder="Cuota del plan" /></label>
        <label>Estado<select value={planEdit.status} onChange={(event) => setPlanEdit({ ...planEdit, status: event.target.value })}><option value="active">Activo</option><option value="suspended">Suspendido</option></select></label>
        <button className="button button--secondary" disabled={busy}>Aplicar cambios</button>
      </form>}
    </section>

    <section className="owner-access-card">
      <div className="owner-access-heading"><div><span className="eyebrow">RECUPERACIÓN</span><h3>Crear una nueva contraseña</h3><p>Disponible para la cuenta propietaria y para cada usuario administrado.</p></div></div>
      <form className="owner-inline-form" onSubmit={async (event) => { event.preventDefault(); const ok = await post({ action: 'reset_password', userId: selectedUserId, password: newPassword }, 'Contraseña actualizada.'); if (ok) setNewPassword(''); }}>
        <label>Cuenta<select value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>{data.accounts.map((item) => <option key={item.userId} value={item.userId}>{item.email}</option>)}</select></label>
        <label>Nueva contraseña<input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} minLength="12" required /></label>
        <button className="button button--secondary" disabled={busy || !selectedUserId}>Actualizar contraseña</button>
      </form>
    </section>
  </div>;
}
