import { useEffect, useMemo, useState } from 'react';
import { modules, resources } from './data';
import { getAIEntitlement, getOwnerContext, isSupabaseConfigured, supabase } from './supabase';
import OwnerAccessManager from './features/OwnerAccessManager';
import OwnerFactoryManager from './features/OwnerFactoryManager';

const tabs = [
  ['inicio', 'Inicio'], ['biblioteca', 'Biblioteca'], ['ia', 'YOYO IA'], ['propietaria', 'Propietaria'],
];

function StatusPill({ ok, children }) { return <span className={`pill ${ok ? 'pill--ok' : 'pill--warn'}`}>{children}</span>; }

export default function App() {
  const [page, setPage] = useState('inicio');
  const [health, setHealth] = useState(null);
  const [apiResources, setApiResources] = useState([]);
  const [session, setSession] = useState(null);
  const [ownerContext, setOwnerContext] = useState(null);
  const [entitlement, setEntitlement] = useState(null);
  const [auth, setAuth] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [query, setQuery] = useState('');
  const [aiPrompt, setAiPrompt] = useState('Crea una actividad breve y accesible de comprensión lectora para 4° básico.');
  const [aiResult, setAiResult] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch('/api/health').then((r) => r.json()).then(setHealth).catch(() => setHealth({ status: 'error' }));
    fetch('/api/resources').then((r) => r.json()).then((payload) => setApiResources(Array.isArray(payload) ? payload : payload.resources || [])).catch(() => setApiResources([]));
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const user = session?.user;
    if (!user) { setOwnerContext(null); setEntitlement(null); return; }
    Promise.allSettled([getOwnerContext(user.id), getAIEntitlement(user.id)]).then(([owner, plan]) => {
      setOwnerContext(owner.status === 'fulfilled' ? owner.value : null);
      setEntitlement(plan.status === 'fulfilled' ? plan.value : null);
    });
  }, [session]);

  const visibleResources = useMemo(() => {
    const source = apiResources.length ? apiResources : resources;
    const q = query.trim().toLowerCase();
    return q ? source.filter((item) => `${item.title} ${item.subject} ${item.level} ${item.skill}`.toLowerCase().includes(q)) : source;
  }, [apiResources, query]);

  const ownerFull = Boolean(session?.user && ownerContext?.role === 'platform_admin' && entitlement?.planId === 'propietaria');
  const accessToken = session?.access_token || '';
  const toast = (text) => { setMessage(text); setTimeout(() => setMessage(''), 4000); };

  async function signIn(event) {
    event.preventDefault();
    if (!supabase) return toast('Supabase no está configurado.');
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword(auth);
    setBusy(false);
    if (error) toast(error.message); else { setAuth({ email: '', password: '' }); toast('Sesión iniciada.'); }
  }

  async function runAI(event) {
    event.preventDefault();
    if (!accessToken) return toast('Inicia sesión para usar YOYO IA.');
    setBusy(true); setAiResult('');
    try {
      const response = await fetch('/api/ai/generate', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ mode: 'creation', prompt: aiPrompt, level: '4° básico', subject: 'Lenguaje', objective: 'Aprendizaje significativo e inclusivo', support: 'DUA y PIE', files: [], ownerAI: { enabled: ownerFull } }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || 'No fue posible generar.');
      setAiResult(payload.text || payload.result?.text || JSON.stringify(payload, null, 2));
    } catch (error) { toast(error.message); }
    finally { setBusy(false); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><b>YOYO</b><span>Letras AI</span><small>v3.6.0</small></div>
      <nav>{tabs.map(([id, label]) => <button key={id} className={page === id ? 'active' : ''} onClick={() => setPage(id)}>{label}</button>)}</nav>
      <div className="sidebar-status"><StatusPill ok={health?.status === 'ok'}>{health?.status === 'ok' ? 'Sistema operativo' : 'Verificando sistema'}</StatusPill><small>{session?.user?.email || 'Modo visitante'}</small></div>
    </aside>
    <main>
      <header><div><span className="eyebrow">PLATAFORMA EDUCATIVA CHILENA</span><h1>{page === 'inicio' ? 'Aprender, crear y acompañar con sentido' : tabs.find(([id]) => id === page)?.[1]}</h1></div><div className="header-actions">{health && <StatusPill ok={health.version === '3.6.0'}>API {health.version || 'sin versión'}</StatusPill>}{session && <button className="button button--ghost" onClick={() => supabase?.auth.signOut()}>Cerrar sesión</button>}</div></header>

      {message && <div className="toast">{message}</div>}

      {page === 'inicio' && <>
        <section className="hero"><div><span className="eyebrow">YOYO LETRAS AI · 3.6.0</span><h2>Recursos útiles, accesibles y listos para el aula.</h2><p>Un espacio para docentes, PIE, estudiantes y familias, con herramientas pedagógicas, biblioteca curricular y administración segura.</p><div className="hero-actions"><button className="button button--primary" onClick={() => setPage('biblioteca')}>Explorar biblioteca</button><button className="button button--secondary" onClick={() => setPage('ia')}>Abrir YOYO IA</button></div></div><img src="https://yoyoletrasai.vercel.app/assets/yoyo-learning-hero-v2.webp" alt="Niñas y niños aprendiendo con recursos educativos" /></section>
        <section className="metrics"><article><strong>{visibleResources.length}</strong><span>recursos iniciales</span></article><article><strong>{modules.length}</strong><span>módulos pedagógicos</span></article><article><strong>PIE + DUA</strong><span>enfoque transversal</span></article><article><strong>{health?.checks?.planAuthorization === 'configured' ? 'Conectado' : 'Pendiente'}</strong><span>control de planes</span></article></section>
        <section><div className="section-heading"><div><span className="eyebrow">MÓDULOS</span><h2>Todo el trabajo pedagógico en un solo lugar</h2></div></div><div className="module-grid">{modules.slice(0, 12).map((module) => <article key={module.id}><span className="module-icon">{module.icon}</span><h3>{module.label}</h3><p>{module.description}</p></article>)}</div></section>
      </>}

      {page === 'biblioteca' && <section><div className="section-heading"><div><span className="eyebrow">BIBLIOTECA CURRICULAR</span><h2>Materiales listos para adaptar, imprimir y usar</h2></div><input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nivel, asignatura o habilidad" /></div><div className="resource-grid">{visibleResources.map((resource) => <article key={resource.id}><div className="resource-top"><span>{resource.icon}</span><StatusPill ok>{resource.level}</StatusPill></div><h3>{resource.title}</h3><p>{resource.objective}</p><div className="tags"><span>{resource.subject}</span><span>{resource.skill}</span><span>{resource.duration}</span></div></article>)}</div></section>}

      {page === 'ia' && <section className="workspace"><div className="workspace-copy"><span className="eyebrow">YOYO IA</span><h2>Asistente pedagógico con control de acceso y consumo</h2><p>Las solicitudes se autorizan en servidor según usuario, plan, cuota y rol. La clave privada del motor no se expone al navegador.</p>{entitlement && <div className="plan-card"><b>{entitlement.plan?.name || entitlement.planId}</b><span>{entitlement.plan?.description}</span></div>}</div>{!session ? <form className="auth-card" onSubmit={signIn}><h3>Iniciar sesión</h3><label>Correo<input type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required /></label><label>Contraseña<input type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required /></label><button className="button button--primary" disabled={busy}>Ingresar</button><small>{isSupabaseConfigured ? 'Identidad Supabase conectada.' : 'Configuración de identidad pendiente.'}</small></form> : <form className="ai-card" onSubmit={runAI}><label>¿Qué quieres crear?<textarea rows="7" value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} /></label><button className="button button--primary" disabled={busy}>{busy ? 'Generando…' : 'Crear con YOYO IA'}</button>{aiResult && <pre>{aiResult}</pre>}</form>}</section>}

      {page === 'propietaria' && <section><div className="section-heading"><div><span className="eyebrow">CONTROL PROPIETARIO</span><h2>Gobernanza, cuentas y fábrica de recursos</h2></div></div>{!session ? <form className="auth-card compact" onSubmit={signIn}><h3>Acceso protegido</h3><label>Correo<input type="email" value={auth.email} onChange={(e) => setAuth({ ...auth, email: e.target.value })} required /></label><label>Contraseña<input type="password" value={auth.password} onChange={(e) => setAuth({ ...auth, password: e.target.value })} required /></label><button className="button button--primary" disabled={busy}>Ingresar</button></form> : ownerFull ? <div className="owner-stack"><OwnerAccessManager accessToken={accessToken} toast={toast} /><OwnerFactoryManager accessToken={accessToken} toast={toast} /></div> : <div className="notice"><b>Sesión válida, pero sin privilegios de propietaria.</b><p>La vista administrativa exige rol platform_admin y plan propietaria activos.</p></div>}</section>}
    </main>
  </div>;
}
