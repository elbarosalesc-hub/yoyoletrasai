'use client'

import { useActionState } from 'react'
import { Save, ShieldCheck } from 'lucide-react'
import { initialSupportActionState, saveSupportProfile } from './actions'

type Profile = {
  support_status: string
  strengths: string | null
  barriers: string | null
  interests: string | null
  access_accommodations: string | null
  objective_accommodations: string | null
  assistive_technology: string | null
  responsible_team: string | null
  evidence_notes: string | null
  sensitive_notes: string | null
} | null

export function SupportProfileForm({ studentId, profile }: { studentId: string; profile: Profile }) {
  const action = saveSupportProfile.bind(null, studentId)
  const [state, formAction, pending] = useActionState(action, initialSupportActionState)

  return (
    <form action={formAction} className="premium-card support-profile-form">
      <div className="support-form-heading">
        <span className="eyebrow"><ShieldCheck size={15} /> Acceso restringido</span>
        <h2>Perfil pedagógico PIE y DUA</h2>
        <p>Registra información útil para la planificación, los apoyos y el seguimiento. Evita incorporar antecedentes clínicos que no sean necesarios para la intervención educativa.</p>
      </div>

      <label>Estado del apoyo
        <select name="supportStatus" defaultValue={profile?.support_status ?? 'monitoring'}>
          <option value="monitoring">En observación</option>
          <option value="active">Apoyo activo</option>
          <option value="closed">Proceso cerrado</option>
        </select>
      </label>

      <div className="form-two">
        <label>Fortalezas
          <textarea name="strengths" rows={5} defaultValue={profile?.strengths ?? ''} placeholder="Intereses, habilidades, recursos personales y formas efectivas de participación." />
        </label>
        <label>Barreras para el aprendizaje
          <textarea name="barriers" rows={5} defaultValue={profile?.barriers ?? ''} placeholder="Barreras observables en el entorno, las tareas, la comunicación o el acceso." />
        </label>
      </div>

      <label>Intereses y motivadores
        <textarea name="interests" rows={3} defaultValue={profile?.interests ?? ''} placeholder="Temas, actividades, materiales o formas de participación que favorecen el compromiso." />
      </label>

      <div className="form-two">
        <label>Adecuaciones de acceso
          <textarea name="accessAccommodations" rows={5} defaultValue={profile?.access_accommodations ?? ''} placeholder="Apoyos visuales, ubicación, tiempos, mediación, material ampliado u otras medidas." />
        </label>
        <label>Adecuaciones de objetivos
          <textarea name="objectiveAccommodations" rows={5} defaultValue={profile?.objective_accommodations ?? ''} placeholder="Priorización, graduación, temporalización o ajustes significativos cuando corresponda." />
        </label>
      </div>

      <div className="form-two">
        <label>Tecnología o recursos de apoyo
          <textarea name="assistiveTechnology" rows={4} defaultValue={profile?.assistive_technology ?? ''} placeholder="Dispositivos, software, material concreto o recursos de accesibilidad." />
        </label>
        <label>Equipo responsable
          <textarea name="responsibleTeam" rows={4} defaultValue={profile?.responsible_team ?? ''} placeholder="Docentes, profesionales PIE, asistentes y responsabilidades acordadas." />
        </label>
      </div>

      <label>Evidencias y próximos pasos
        <textarea name="evidenceNotes" rows={5} defaultValue={profile?.evidence_notes ?? ''} placeholder="Avances observados, apoyos efectivos y decisiones para el siguiente periodo." />
      </label>

      <label>Notas sensibles de uso interno
        <textarea name="sensitiveNotes" rows={4} defaultValue={profile?.sensitive_notes ?? ''} placeholder="Solo información estrictamente necesaria y pertinente para el equipo autorizado." />
      </label>

      <div className="support-form-actions">
        <button className="btn btn-primary" disabled={pending}><Save size={17} />{pending ? 'Guardando…' : 'Guardar perfil'}</button>
        {state.message && <p className={`save-status ${state.status}`}>{state.message}</p>}
      </div>
    </form>
  )
}
