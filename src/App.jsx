import { useEffect, useMemo, useState } from 'react';
import { modules, resources as seedResources } from './data';
import { isSupabaseConfigured, supabase } from './supabase';
import OwnerAccessManager from './features/OwnerAccessManager';
import OwnerFactoryManager from './features/OwnerFactoryManager';

function Login({ onReady }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (!supabase) return;
    setBusy(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) return setError(authError.message);
    onReady(data.session);
  }
  return <section className="login-card"><span className="eyebrow">ACCESO SEGURO</span><h2>Ingresa a YoYo Letras AI</h2><p>Acceso para propietaria y usuarios autorizados.</p><form onSubmit={submit}><label>Correo<input type="email" required value={email} onChange={(e)=>setEmail(e.target.value)} /></label><label>Contraseña<input type="password" required value={password} onChange={(e)=>setPassword(e.target.value)} /></label><button disabled={busy}>{busy?'Ingresando…':'Ingresar'}</button>{error&&<small className="error">{error}</small>}</form></section>;
}

function ResourceCard({ resource }) {
  return <article className="resource-card"><div className="resource-icon">{resource.icon || '✦'}</div><div><small>{resource.level} · {resource.subject}</small><h3>{resource.title}</h3><p>{resource.objective}</p><span>{resource.type}</span></div></article>;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [view, setView] = useState('dashboard');
  const [resources, setResources] = useState(seedResources);
  const [status, setStatus] = useState(null);
  const [toast, setToast] = useState('');
  const token = session?.access_token || '';
  const visibleResources = useMemo(() => resources.slice(0, 12), [resources]);

  useEffect(() => {
    fetch('/api/health').then(r=>r.json()).then(setStatus).catch(()=>{});
    fetch('/api/resources').then(r=>r.ok?r.json():Promise.reject()).then((payload)=>{
      const next = Array.isArray(payload) ? payload : payload.resources;
      if (Array.isArray(next) && next.length) setResources(next);
    }).catch(()=>{});
    if (!supabase) return;
    supabase.auth.getSession().then(({data})=>setSession(data.session || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next)=>setSession(next));
    return () => listener.subscription.unsubscribe();
  }, []);

  function notify(message){ setToast(message); window.setTimeout(()=>setToast(''), 2800); }
  async function signOut(){ if (supabase) await supabase.auth.signOut(); setSession(null); setView('dashboard'); }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">YO</div><div><b>YoYo Letras AI</b><small>Educación inclusiva · Chile</small></div></div>
      <nav>
        <button className={view==='dashboard'?'active':''} onClick={()=>setView('dashboard')}>⌂ Inicio</button>
        <button className={view==='library'?'active':''} onClick={()=>setView('library')}>▦ Biblioteca</button>
        {session && <button className={view==='owner'?'active':''} onClick={()=>setView('owner')}>⚙ Perfil propietario</button>}
      </nav>
      <div className="sidebar-foot"><small>Versión {status?.version || '3.6.0'}</small><span className={status?.status==='ok'?'ok':''}>● {status?.status==='ok'?'Operativa':'Comprobando'}</span></div>
    </aside>
    <main>
      <header><div><span className="eyebrow">PLATAFORMA EDUCATIVA</span><h1>{view==='owner'?'Perfil propietario':view==='library'?'Biblioteca pedagógica':'Hola, bienvenida a YoYo Letras AI'}</h1></div><div className="header-actions">{session?<><small>{session.user?.email}</small><button className="ghost" onClick={signOut}>Salir</button></>:<button onClick={()=>setView('login')}>Ingresar</button>}</div></header>

      {view==='login' && <Login onReady={(next)=>{setSession(next);setView('dashboard');}} />}

      {view==='dashboard' && <>
        <section className="hero"><div><span className="eyebrow">YOYO CORE 3.6</span><h2>Recursos reales, IA educativa y herramientas para PIE/NEE</h2><p>Una plataforma creada para planificar, adaptar, enseñar y evaluar con foco en el currículum chileno, DUA y participación de todo el curso.</p><div className="hero-actions"><button onClick={()=>setView('library')}>Explorar recursos</button>{!session&&<button className="ghost" onClick={()=>setView('login')}>Acceder</button>}</div></div><img src="/assets/yoyo-learning-hero-v2.webp" alt="YoYo Letras AI" /></section>
        <section><div className="section-head"><div><span className="eyebrow">MÓDULOS</span><h2>Todo tu espacio docente</h2></div><b>{modules.length} herramientas</b></div><div className="module-grid">{modules.map(m=><article key={m.id}><span>{m.icon}</span><div><h3>{m.label}</h3><p>{m.description}</p></div></article>)}</div></section>
        <section><div className="section-head"><div><span className="eyebrow">RECURSOS DESTACADOS</span><h2>Listos para usar y adaptar</h2></div><button className="ghost" onClick={()=>setView('library')}>Ver biblioteca</button></div><div className="resource-grid">{visibleResources.slice(0,6).map(r=><ResourceCard key={r.id} resource={r}/>)}</div></section>
      </>}

      {view==='library' && <section><div className="section-head"><div><span className="eyebrow">BIBLIOTECA</span><h2>{resources.length} recursos disponibles</h2></div></div><div className="resource-grid">{resources.map(r=><ResourceCard key={r.id} resource={r}/>)}</div></section>}

      {view==='owner' && session && <section className="owner-stack"><div className="owner-banner"><div><span className="eyebrow">CONTROL PROPIETARIO</span><h2>Gobernanza, accesos y fábrica de recursos</h2><p>Herramientas privadas protegidas por tu sesión autenticada.</p></div></div><OwnerAccessManager accessToken={token} toast={notify}/><OwnerFactoryManager accessToken={token} toast={notify}/></section>}

      {!isSupabaseConfigured && <p className="notice">Supabase público no está configurado en el navegador. Las APIs de servidor continúan protegidas.</p>}
    </main>
    {toast && <div className="toast">{toast}</div>}
  </div>;
}
