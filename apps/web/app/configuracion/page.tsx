'use client'

import {useState} from 'react'
import {
  Accessibility,
  Bell,
  Check,
  ChevronRight,
  Cloud,
  Database,
  Globe2,
  KeyRound,
  LockKeyhole,
  Palette,
  Save,
  School,
  ShieldCheck,
  Sparkles,
  UserRound,
  Volume2,
  WandSparkles
} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

const sections=[
 {id:'perfil',label:'Perfil docente',icon:UserRound},
 {id:'institucion',label:'Institución y currículo',icon:School},
 {id:'accesibilidad',label:'Accesibilidad',icon:Accessibility},
 {id:'yoyo',label:'YOYO y automatización',icon:Sparkles},
 {id:'notificaciones',label:'Notificaciones',icon:Bell},
 {id:'privacidad',label:'Privacidad y datos',icon:ShieldCheck}
]

export default function ConfiguracionV2(){
 const[active,setActive]=useState('perfil')
 const[saved,setSaved]=useState(false)
 const[settings,setSettings]=useState({
  audio:true,animations:true,reducedMotion:false,highContrast:false,notifications:true,
  aiApproval:true,weeklySummary:true,studentAlerts:true,dataAnalytics:true
 })
 const toggle=(key:keyof typeof settings)=>{setSettings(current=>({...current,[key]:!current[key]}));setSaved(false)}
 const save=()=>{setSaved(true);window.setTimeout(()=>setSaved(false),2000)}

 return <ModuleShell active="Configuración">
  <section className="settings-hero-v2">
   <div><span className="module-eyebrow"><Sparkles size={15}/> Preferencias y administración</span><h1>Configuración de la plataforma</h1><p>Personaliza la experiencia docente, la accesibilidad, la institución y el control de datos.</p></div>
   <button onClick={save} className={saved?'saved':''}>{saved?<><Check/>Cambios guardados</>:<><Save/>Guardar cambios</>}</button>
  </section>

  <section className="settings-layout-v2">
   <aside className="settings-nav-v2">
    <div className="settings-nav-title-v2"><span>CONFIGURACIÓN</span><strong>Colegio Coyam</strong></div>
    <nav>{sections.map(({id,label,icon:Icon})=><button key={id} className={active===id?'active':''} onClick={()=>setActive(id)}><Icon/><span>{label}</span><ChevronRight/></button>)}</nav>
    <div className="settings-sync-v2"><span><Cloud/></span><div><strong>Datos sincronizados</strong><small>Supabase preparado</small></div><i/></div>
   </aside>

   <main className="settings-content-v2">
    {active==='perfil'&&<section className="settings-panel-v2">
     <header><span><UserRound/></span><div><small>PERFIL DOCENTE</small><h2>Información personal</h2><p>Datos visibles dentro de la institución.</p></div></header>
     <div className="settings-profile-row-v2"><span className="settings-avatar-v2">ER</span><div><strong>Elba Rosales</strong><small>Educadora diferencial · PIE</small></div><button>Cambiar imagen</button></div>
     <div className="settings-form-grid-v2"><label>Nombre completo<input defaultValue="Elba Rosales"/></label><label>Correo institucional<input defaultValue="elba@colegiocoyam.cl"/></label><label>Rol principal<select defaultValue="Educadora diferencial"><option>Educadora diferencial</option><option>Docente</option><option>Coordinación PIE</option><option>UTP</option></select></label><label>Curso prioritario<select defaultValue="3.º básico"><option>3.º básico</option><option>5.º básico</option><option>Todos los cursos</option></select></label></div>
    </section>}

    {active==='institucion'&&<section className="settings-panel-v2">
     <header><span><School/></span><div><small>CONTEXTO INSTITUCIONAL</small><h2>Institución y currículo</h2><p>Configura la identidad y el marco pedagógico.</p></div></header>
     <div className="institution-card-v2"><span>C</span><div><strong>Colegio Coyam</strong><small>Chillán · Chile</small></div><em>Institución activa</em></div>
     <div className="settings-form-grid-v2"><label>Nombre de la institución<input defaultValue="Colegio Coyam"/></label><label>País<select defaultValue="Chile"><option>Chile</option><option>Argentina</option><option>Perú</option><option>Colombia</option></select></label><label>Marco curricular<select defaultValue="Bases Curriculares MINEDUC"><option>Bases Curriculares MINEDUC</option><option>Currículo institucional</option></select></label><label>Nivel principal<select defaultValue="Educación básica"><option>Educación parvularia</option><option>Educación básica</option><option>Educación media</option></select></label><label>Zona horaria<select defaultValue="America/Santiago"><option>America/Santiago</option></select></label><label>Idioma<select defaultValue="Español"><option>Español</option><option>Inglés</option></select></label></div>
    </section>}

    {active==='accesibilidad'&&<section className="settings-panel-v2">
     <header><span><Accessibility/></span><div><small>ACCESIBILIDAD</small><h2>Experiencia inclusiva</h2><p>Preferencias visuales, auditivas y de movimiento.</p></div></header>
     <div className="settings-toggle-grid-v2">
      <Toggle icon={Volume2} title="Audio y narración" text="Activa instrucciones y lectura en voz alta." value={settings.audio} onClick={()=>toggle('audio')}/>
      <Toggle icon={WandSparkles} title="Animaciones educativas" text="Muestra transiciones y movimiento pedagógico." value={settings.animations} onClick={()=>toggle('animations')}/>
      <Toggle icon={Accessibility} title="Movimiento reducido" text="Disminuye animaciones y efectos dinámicos." value={settings.reducedMotion} onClick={()=>toggle('reducedMotion')}/>
      <Toggle icon={Palette} title="Alto contraste" text="Aumenta contraste y visibilidad de controles." value={settings.highContrast} onClick={()=>toggle('highContrast')}/>
     </div>
     <div className="theme-section-v2"><span>COLOR PRINCIPAL</span><div>{['violet','mint','blue','coral'].map(tone=><button key={tone} className={`theme-choice-v2 ${tone} ${tone==='violet'?'active':''}`} aria-label={`Tema ${tone}`}><i/>{tone==='violet'&&<Check/>}</button>)}</div></div>
    </section>}

    {active==='yoyo'&&<section className="settings-panel-v2">
     <header><span><Sparkles/></span><div><small>YOYO IA</small><h2>Automatización y control</h2><p>Define qué puede preparar y cuándo debe solicitar aprobación.</p></div></header>
     <div className="ai-policy-card-v2"><span><LockKeyhole/></span><div><strong>Control docente activado</strong><p>YOYO nunca publicará, enviará o modificará información sensible sin revisión profesional.</p></div></div>
     <div className="settings-toggle-list-v2">
      <Toggle icon={ShieldCheck} title="Solicitar aprobación" text="YOYO debe pedir permiso antes de ejecutar acciones." value={settings.aiApproval} onClick={()=>toggle('aiApproval')}/>
      <Toggle icon={Sparkles} title="Resumen pedagógico semanal" text="Generar un resumen automático cada viernes." value={settings.weeklySummary} onClick={()=>toggle('weeklySummary')}/>
      <Toggle icon={Bell} title="Alertas de estudiantes" text="Notificar cambios relevantes de progreso o asistencia." value={settings.studentAlerts} onClick={()=>toggle('studentAlerts')}/>
     </div>
    </section>}

    {active==='notificaciones'&&<section className="settings-panel-v2">
     <header><span><Bell/></span><div><small>NOTIFICACIONES</small><h2>Alertas y recordatorios</h2><p>Selecciona la información que deseas recibir.</p></div></header>
     <div className="settings-toggle-list-v2"><Toggle icon={Bell} title="Notificaciones generales" text="Actividad, sistema y recordatorios." value={settings.notifications} onClick={()=>toggle('notifications')}/><Toggle icon={Sparkles} title="Sugerencias de YOYO" text="Nuevas propuestas y recomendaciones pedagógicas." value={settings.weeklySummary} onClick={()=>toggle('weeklySummary')}/><Toggle icon={UserRound} title="Alertas de seguimiento" text="Asistencia, progreso y evidencias pendientes." value={settings.studentAlerts} onClick={()=>toggle('studentAlerts')}/></div>
    </section>}

    {active==='privacidad'&&<section className="settings-panel-v2">
     <header><span><ShieldCheck/></span><div><small>PRIVACIDAD Y SEGURIDAD</small><h2>Datos institucionales</h2><p>Control de acceso, almacenamiento y auditoría.</p></div></header>
     <div className="security-grid-v2"><article><span><Database/></span><div><strong>Base de datos</strong><small>Supabase PostgreSQL con RLS</small></div><em>Preparada</em></article><article><span><KeyRound/></span><div><strong>Acceso institucional</strong><small>Roles y permisos por organización</small></div><em>Seguro</em></article><article><span><Globe2/></span><div><strong>Región</strong><small>Zona horaria America/Santiago</small></div><em>Chile</em></article></div>
     <div className="settings-toggle-list-v2"><Toggle icon={BarIcon} title="Analítica pedagógica" text="Utilizar datos de actividad para generar indicadores." value={settings.dataAnalytics} onClick={()=>toggle('dataAnalytics')}/></div>
     <div className="privacy-actions-v2"><button>Revisar permisos</button><button>Descargar historial</button><button className="danger">Cerrar todas las sesiones</button></div>
    </section>}
   </main>
  </section>
 </ModuleShell>
}

function Toggle({icon:Icon,title,text,value,onClick}:{icon:typeof Accessibility;title:string;text:string;value:boolean;onClick:()=>void}){
 return <button className={`setting-row-v2 ${value?'on':''}`} onClick={onClick}><span><Icon/></span><div><strong>{title}</strong><small>{text}</small></div><i><em/></i></button>
}

function BarIcon(){return <Database/>}
