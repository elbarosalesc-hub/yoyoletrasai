import { useState } from 'react';
import OwnerPlatformManager from './OwnerPlatformManager';
import OwnerAccessManager from './OwnerAccessManager';
import OwnerFactoryManager from './OwnerFactoryManager';

const SECTIONS = [
  ['platform', 'Plataforma'],
  ['access', 'Usuarios y clave IA'],
  ['factory', 'Fábrica de recursos'],
];

export default function OwnerCommandCenter({ accessToken, toast }) {
  const [section, setSection] = useState('platform');

  return <div className="owner-command-center">
    <div className="owner-access-card">
      <div className="owner-access-heading">
        <div>
          <span className="eyebrow">YOYO OWNER COMMAND CENTER</span>
          <h3>Una sola aplicación para administrar toda la plataforma</h3>
          <p>Centraliza configuración, IA exclusiva, usuarios, seguridad, recursos, mejora continua y preparación de versiones.</p>
        </div>
      </div>
      <div className="header-actions" role="tablist" aria-label="Secciones de administración propietaria">
        {SECTIONS.map(([id, label]) => <button
          key={id}
          type="button"
          role="tab"
          aria-selected={section === id}
          className={section === id ? 'button button--primary' : 'button button--ghost'}
          onClick={() => setSection(id)}
        >{label}</button>)}
      </div>
    </div>

    {section === 'platform' && <OwnerPlatformManager accessToken={accessToken} />}
    {section === 'access' && <OwnerAccessManager accessToken={accessToken} toast={toast} />}
    {section === 'factory' && <OwnerFactoryManager accessToken={accessToken} toast={toast} />}
  </div>;
}
