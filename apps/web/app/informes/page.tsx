'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {FileText,Users,BarChart3,Accessibility,Download,Save,CheckCircle2,Sparkles} from 'lucide-react'

const templates=[
 {id:'familia',title:'Informe para la familia',icon:Users},
 {id:'avance',title:'Estado de avance',icon:BarChart3},
 {id:'pie',title:'Seguimiento PIE',icon:Accessibility},
 {id:'curso',title:'Informe de curso',icon:FileText}
]

export default function Informes(){
 const[type,setType]=useState('familia')
 const[student,setStudent]=useState('Valentina D.')
 const[status,setStatus]=useState('Borrador editable')
 const[approved,setApproved]=useState(false)
 const[body,setBody]=useState(`Valentina ha mostrado avances sostenidos en participación y comprensión de instrucciones breves. Se beneficia especialmente de apoyos visuales, modelamiento y lectura acompañada.\n\nEn Lenguaje, identifica información explícita y comienza a justificar inferencias sencillas cuando dispone de pistas destacadas. En Matemática, representa números hasta 1.000 con material concreto y requiere continuar fortaleciendo la autonomía durante el cálculo escrito.\n\nSe recomienda mantener rutinas estructuradas, anticipar las actividades y reforzar la lectura diaria mediante textos breves de interés personal.`)
 const current=useMemo(()=>templates.find(t=>t.id===type)||templates[0],[type])
 const save=()=>{setStatus('Borrador guardado');setApproved(false)}
 const generate=()=>{setBody(v=>v+`\n\nPróximo paso sugerido por YOYO: trabajar justificación de respuestas mediante dos pistas del texto y una frase modelo.`);setStatus('Sugerencia del Profesor Virtual agregada')}
 return <AppShell active="Informes">
  <section className="premium-hero report-hero"><span className="eyebrow">Editor profesional</span><h1>Informes construidos desde evidencias reales</h1><p>YOYO prepara borradores, pero el profesional revisa, modifica y aprueba antes de exportar o compartir.</p><div className="hero-cta"><button className="btn btn-coral" onClick={generate}><Sparkles size={18}/>Agregar análisis YOYO</button><button className="btn btn-soft" onClick={save}><Save size={17}/>Guardar borrador</button></div></section>
  <div className="report-workspace">
   <aside className="report-library premium-card"><h2>Tipo de informe</h2>{templates.map(({id,title,icon:Icon})=><button key={id} className={type===id?'active':''} onClick={()=>{setType(id);setApproved(false)}}><Icon size={20}/><span>{title}</span></button>)}<label>Estudiante o curso<select value={student} onChange={e=>setStudent(e.target.value)}><option>Valentina D.</option><option>Javier M.</option><option>3.º básico</option><option>5.º básico</option></select></label><div className="report-sources"><b>Fuentes vinculadas</b><span>✓ 12 evidencias</span><span>✓ 3 evaluaciones</span><span>✓ 5 apoyos registrados</span><span>✓ 2 observaciones familiares</span></div></aside>
   <section className="report-editor premium-card"><div className="report-editor-head"><div><span>{current.title}</span><h2>{student}</h2></div><div className={approved?'report-state approved':'report-state'}>{approved?'Aprobado':'En revisión'}</div></div><div className="report-metadata"><label>Periodo<select><option>Primer semestre 2026</option><option>Segundo semestre 2026</option></select></label><label>Responsable<input defaultValue="Elba Rosales"/></label><label>Fecha<input type="date" defaultValue="2026-07-27"/></label></div><textarea className="report-body" value={body} onChange={e=>{setBody(e.target.value);setApproved(false)}}/><div className="report-editor-actions"><button className="btn btn-primary" onClick={()=>{setApproved(true);setStatus('Informe aprobado por la profesional')}}><CheckCircle2 size={18}/>Revisar y aprobar</button><button className="btn btn-soft" disabled={!approved}><Download size={18}/>Exportar PDF</button></div><p className="save-status">{status}</p></section>
   <aside className="report-assistant premium-card"><h2>Control de calidad</h2>{['Lenguaje positivo y claro','Fortalezas antes de dificultades','Apoyos específicos','Próximos pasos observables','Sin diagnósticos innecesarios'].map(x=><div className="quality-check-row" key={x}><CheckCircle2 size={17}/><span>{x}</span></div>)}<div className="insight"><b>Profesor Virtual</b><p>Detectó que el informe presenta evidencia suficiente, pero recomienda agregar una meta de autonomía medible para el siguiente periodo.</p></div><button className="btn btn-soft" onClick={generate}>Aplicar recomendación</button></aside>
  </div>
 </AppShell>
}
