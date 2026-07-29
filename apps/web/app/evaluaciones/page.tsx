'use client'

import {useMemo,useState} from 'react'
import {ModuleShell} from '@/components/v2/ModuleShell'
import {ClipboardCheck,Plus,Trash2,Sparkles,CheckCircle2,Printer,Save} from 'lucide-react'

type Question={id:number;prompt:string;type:'Selección múltiple'|'Desarrollo'|'Respuesta oral';points:number}

export default function Evaluaciones(){
 const[title,setTitle]=useState('Comprensión inferencial: El bosque nativo')
 const[level,setLevel]=useState('3.º básico')
 const[variant,setVariant]=useState('Estándar')
 const[status,setStatus]=useState('Borrador guardado automáticamente')
 const[questions,setQuestions]=useState<Question[]>([
  {id:1,prompt:'¿Qué emoción siente Sofía antes de entrar a la cabaña?',type:'Selección múltiple',points:2},
  {id:2,prompt:'Escribe dos pistas del texto que apoyen tu respuesta.',type:'Desarrollo',points:4},
  {id:3,prompt:'Explica oralmente por qué Sofía espera a la profesora.',type:'Respuesta oral',points:4}
 ])
 const total=useMemo(()=>questions.reduce((sum,question)=>sum+question.points,0),[questions])
 const update=(id:number,key:keyof Question,value:string|number)=>setQuestions(items=>items.map(question=>question.id===id?{...question,[key]:value}:question))
 const add=()=>setQuestions(items=>[...items,{id:Date.now(),prompt:'Nueva pregunta',type:'Selección múltiple',points:2}])
 const remove=(id:number)=>setQuestions(items=>items.filter(question=>question.id!==id))
 const generate=()=>{setVariant(value=>value==='Estándar'?'TDA':value==='TDA'?'DIL':'Estándar');setStatus('Versión adaptada generada y lista para revisión docente')}

 return <ModuleShell active="Evaluaciones">
  <section className="module-page-v2 legacy-module-v2">
   <section className="premium-hero evaluation-hero"><span className="eyebrow">Constructor funcional</span><h1>Evaluaciones, rúbricas y versiones diversificadas</h1><p>Diseña el instrumento, modifica preguntas, asigna puntajes y genera variantes equivalentes sin perder el objetivo de aprendizaje.</p><div className="hero-cta"><button className="btn btn-coral" onClick={generate}><Sparkles size={18}/>Generar versión {variant==='Estándar'?'TDA':variant==='TDA'?'DIL':'estándar'}</button><button className="btn btn-soft" onClick={()=>setStatus('Evaluación guardada')}><Save size={17}/>Guardar</button></div></section>
   <div className="builder-layout">
    <aside className="builder-settings premium-card"><h2>Configuración</h2><label>Título<input value={title} onChange={event=>setTitle(event.target.value)}/></label><label>Nivel<select value={level} onChange={event=>setLevel(event.target.value)}><option>1.º básico</option><option>3.º básico</option><option>5.º básico</option><option>Multinivel</option></select></label><label>Versión<select value={variant} onChange={event=>setVariant(event.target.value)}><option>Estándar</option><option>TDA</option><option>DIL</option><option>Lectura mediada</option></select></label><div className="builder-summary"><span><b>{questions.length}</b> preguntas</span><span><b>{total}</b> puntos</span><span><b>OA 4</b> vinculado</span></div><button className="btn btn-primary" onClick={add}><Plus size={17}/>Agregar pregunta</button></aside>
    <section className="assessment-editor premium-card"><div className="assessment-editor-head"><div><span>{variant} · {level}</span><h2>{title}</h2></div><button className="icon-button" aria-label="Imprimir"><Printer size={19}/></button></div>{questions.map((question,index)=><article className="question-builder" key={question.id}><div className="question-number">{index+1}</div><div className="question-fields"><textarea value={question.prompt} onChange={event=>update(question.id,'prompt',event.target.value)} rows={2}/><div><select value={question.type} onChange={event=>update(question.id,'type',event.target.value)}><option>Selección múltiple</option><option>Desarrollo</option><option>Respuesta oral</option></select><label>Puntaje<input type="number" min="1" max="20" value={question.points} onChange={event=>update(question.id,'points',Number(event.target.value))}/></label></div>{question.type==='Selección múltiple'&&<div className="option-editor">{['A. Está preocupada','B. Está enojada','C. Está aburrida','D. Está sorprendida'].map(option=><button key={option}>{option}</button>)}</div>}</div><button className="delete-question" onClick={()=>remove(question.id)} aria-label="Eliminar pregunta"><Trash2 size={17}/></button></article>)}</section>
    <aside className="rubric-panel premium-card"><div className="rubric-title"><ClipboardCheck/><div><h2>Rúbrica automática</h2><p>Editable antes de publicar.</p></div></div>{[['Uso de pistas','Identifica dos pistas pertinentes.'],['Inferencia','Formula una conclusión coherente.'],['Justificación','Explica la relación entre pistas y respuesta.']].map(([criterion,description],index)=><div className="rubric-row" key={criterion}><span>{index+1}</span><div><b>{criterion}</b><p>{description}</p></div><select defaultValue="4"><option>4 pts</option><option>3 pts</option><option>2 pts</option><option>1 pt</option></select></div>)}<div className="quality-check"><CheckCircle2/><div><b>Revisión pedagógica</b><p>La versión {variant} conserva el mismo OA y permite respuesta multimodal.</p></div></div><p className="save-status">{status}</p></aside>
   </div>
  </section>
 </ModuleShell>
}
