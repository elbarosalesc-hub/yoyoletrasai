import { useEffect, useState } from 'react';
import { isSupabaseConfigured } from './supabase';

const MODULES = [
  ['Biblioteca pedagógica','Recursos curriculares, PIE y DUA'],
  ['YoYo AI Studio','Generación pedagógica asistida por IA'],
  ['Plan lector','Lectura graduada y comprensión'],
  ['Grafomotricidad','Trazos progresivos y preparación para la escritura'],
  ['Caligrafía','Imprenta y cursiva con direccionalidad'],
  ['Centro PIE / DUA','Apoyos diversificados y accesibilidad'],
  ['Perfil propietario','Administración, automatización y control']
];

export default function App() {
  const [health, setHealth] = useState(null);
  const [resources, setResources] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([
      fetch('/api/health').then(r => r.json()),
      fetch('/api/resources').then(r => r.json())
    ]).then(([h, r]) => {
      setHealth(h);
      setResources(Array.isArray(r) ? r : (r.resources || []));
    }).catch((e) => setError(e.message));
  }, []);

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="mark">Y</div><div><strong>YoYoLetras<span>AI</span></strong><small>Educación que incluye</small></div></div>
      <nav>{MODULES.map(([name], i)=><button key={name} className={i===0?'active':''}>{name}</button>)}</nav>
      <div className="owner"><b>ER</b><span>Elba Rosales<small>Superadministradora</small></span></div>
    </aside>
    <main>
      <header><div><p className="eyebrow">Plataforma educativa chilena</p><h1>YoYo Letras AI <span>3.6.0</span></h1><p>Currículum nacional · PIE/NEE · DUA · recursos pedagógicos y automatización propietaria.</p></div><div className={`status ${health?.status==='ok'?'ok':''}`}>{health?.status==='ok'?'Operativa':'Verificando…'}</div></header>
      {error && <div className="alert">No fue posible cargar el estado: {error}</div>}
      <section className="hero"><div><span className="pill">Versión 3.6.0</span><h2>Educación que incluye, crea y acompaña.</h2><p>Un espacio para planificar, adaptar, crear y organizar experiencias de aprendizaje con foco en calidad pedagógica e inclusión.</p><div className="checks"><span>Supabase: {isSupabaseConfigured ? 'configurado' : 'pendiente'}</span><span>API: {health?.checks?.application || 'verificando'}</span><span>Recursos: {resources.length}</span></div></div></section>
      <section><div className="section-head"><div><p className="eyebrow">Módulos</p><h2>Centro de trabajo</h2></div></div><div className="grid">{MODULES.map(([name, desc],i)=><article key={name}><div className="icon">{['📚','✨','📖','✍️','✒️','🧩','⚙️'][i]}</div><h3>{name}</h3><p>{desc}</p><button>Entrar</button></article>)}</div></section>
      <section><div className="section-head"><div><p className="eyebrow">Biblioteca</p><h2>Recursos pedagógicos</h2></div><span>{resources.length} disponibles</span></div><div className="resources">{resources.slice(0,8).map((r)=><article key={r.id || r.title}><b>{r.icon || '📄'}</b><div><h3>{r.title}</h3><p>{r.level || r.subject || 'Recurso educativo'} · {r.skill || r.type || 'Actividad'}</p></div></article>)}</div></section>
      <footer>YoYoLetrasAI 3.6.0 · entorno de publicación seguro</footer>
    </main>
  </div>;
}
