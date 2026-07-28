'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Check,Download,FileText,Printer,RefreshCw,Save,Sparkles} from 'lucide-react'

type ResourceType='Guía de aprendizaje'|'Evaluación'|'Rúbrica'

const activityBank:Record<ResourceType,string[]>={
 'Guía de aprendizaje':['Lee el texto o situación presentada.','Localiza dos datos importantes.','Explica la idea principal con tus palabras.','Realiza una inferencia sencilla.','Cierra con una reflexión sobre lo aprendido.'],
 'Evaluación':['Selecciona la alternativa correcta.','Relaciona cada concepto con su definición.','Responde una pregunta de desarrollo breve.','Justifica una respuesta usando evidencia.','Revisa tus respuestas antes de entregar.'],
 'Rúbrica':['Comprende el objetivo de la actividad.','Desarrolla la tarea con precisión.','Explica o fundamenta sus respuestas.','Utiliza apoyos de manera autónoma.','Presenta el trabajo de forma clara y ordenada.']
}

export default function Crear(){
 const[type,setType]=useState<ResourceType>('Guía de aprendizaje')
 const[title,setTitle]=useState('Comprensión lectora: El bosque nativo')
 const[level,setLevel]=useState('3° básico')
 const[subject,setSubject]=useState('Lenguaje y Comunicación')
 const[objective,setObjective]=useState('Comprender un texto breve y justificar una respuesta con evidencia.')
 const[adaptation,setAdaptation]=useState('Apoyo visual moderado')
 const[count,setCount]=useState(4)
 const[generated,setGenerated]=useState(true)
 const[saved,setSaved]=useState(false)

 const activities=useMemo(()=>activityBank[type].slice(0,count),[type,count])
 const support=adaptation==='Lectura silábica'?'Texto segmentado, sílabas destacadas, vocabulario anticipado y menor extensión.':adaptation==='Respuesta oral'?'Posibilidad de responder oralmente, mediación docente y registro por audio.':'Palabras clave, instrucciones breves, ejemplos modelados e imágenes de apoyo.'

 function generate(){setGenerated(false);setSaved(false);window.setTimeout(()=>setGenerated(true),300)}
 function save(){localStorage.setItem('yoyo-creator-draft',JSON.stringify({type,title,level,subject,objective,adaptation,count}));setSaved(true)}
 function print(){window.print()}

 return <AppShell active="Crear con IA"><div className="creator-functional">
  <div className="page-head creator-head"><div><span className="creator-kicker"><Sparkles size={16}/> YOYO IA pedagógica</span><h1>Crear recurso educativo</h1><p>Configura, genera, revisa y guarda un material listo para utilizar.</p></div><button className="btn btn-primary" onClick={save}><Save size={17}/>{saved?'Borrador guardado':'Guardar borrador'}</button></div>
  <div className="creator-workspace">
   <section className="panel creator-form"><div className="creator-section-title"><div><h2>Configuración pedagógica</h2><p>Completa los datos esenciales del recurso.</p></div><FileText/></div>
    <label>Tipo de recurso</label><select value={type} onChange={e=>setType(e.target.value as ResourceType)}><option>Guía de aprendizaje</option><option>Evaluación</option><option>Rúbrica</option></select>
    <label>Título o tema</label><input value={title} onChange={e=>setTitle(e.target.value)}/>
    <div className="creator-two"><div><label>Nivel</label><select value={level} onChange={e=>setLevel(e.target.value)}><option>1° básico</option><option>2° básico</option><option>3° básico</option><option>4° básico</option><option>5° básico</option><option>6° básico</option><option>7° básico</option><option>8° básico</option></select></div><div><label>Asignatura</label><select value={subject} onChange={e=>setSubject(e.target.value)}><option>Lenguaje y Comunicación</option><option>Matemática</option><option>Ciencias Naturales</option><option>Historia</option></select></div></div>
    <label>Objetivo de aprendizaje</label><textarea rows={3} value={objective} onChange={e=>setObjective(e.target.value)}/>
    <div className="creator-two"><div><label>Perfil de apoyo</label><select value={adaptation} onChange={e=>setAdaptation(e.target.value)}><option>Apoyo visual moderado</option><option>Lectura silábica</option><option>Respuesta oral</option></select></div><div><label>Cantidad de actividades</label><select value={count} onChange={e=>setCount(Number(e.target.value))}><option value={3}>3 actividades</option><option value={4}>4 actividades</option><option value={5}>5 actividades</option></select></div></div>
    <button className="creator-generate" onClick={generate}><Sparkles size={18}/>{generated?'Generar nueva versión':'Generando recurso...'}</button>
   </section>
   <section className={`preview-paper creator-preview ${generated?'ready':'loading'}`}><div className="preview-toolbar"><div><span>{type}</span><b>Vista previa editable</b></div><div><button aria-label="Regenerar" onClick={generate}><RefreshCw size={17}/></button><button aria-label="Imprimir" onClick={print}><Printer size={17}/></button><button aria-label="Descargar" onClick={print}><Download size={17}/></button></div></div>
    <div className="resource-sheet"><header><small>YOYOLETRASAI · {subject}</small><h2>{title}</h2><div className="sheet-meta"><span>{level}</span><span>{type}</span><span>{adaptation}</span></div></header><div className="sheet-student"><span>Nombre: ______________________________</span><span>Fecha: ______________</span></div><div className="sheet-objective"><b>Objetivo</b><p>{objective}</p></div><h3>{type==='Rúbrica'?'Criterios de evaluación':'Actividades'}</h3><div className="generated-activities">{activities.map((item,index)=><div className="generated-item" key={item}><span>{index+1}</span><div><p>{item}</p>{type==='Rúbrica'?<div className="rubric-scale"><i>Logrado</i><i>En desarrollo</i><i>Requiere apoyo</i></div>:<div className="answer-lines"><i></i><i></i></div>}</div></div>)}</div><aside className="dua-box"><Check size={19}/><div><b>Apoyo DUA incluido</b><p>{support}</p></div></aside></div>
   </section>
  </div>
 </div></AppShell>
}