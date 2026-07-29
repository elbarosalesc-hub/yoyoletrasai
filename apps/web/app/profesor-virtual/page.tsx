'use client'

import {useMemo,useState} from 'react'
import {
  Bot,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Headphones,
  Mic2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Save,
  Send,
  Settings2,
  ShieldCheck,
  Sparkles,
  Subtitles,
  Volume2
} from 'lucide-react'
import {ModuleShell} from '@/components/v2/ModuleShell'

type LessonStep={id:number;title:string;text:string;question:string;options:string[];correct:number}

const initialLesson:LessonStep[]=[
 {id:1,title:'Activamos conocimientos',text:'Antes de leer, observa el título y la imagen. Pregúntate de qué podría tratar el texto.',question:'¿Qué hacemos antes de leer?',options:['Observamos el título y la imagen','Respondemos sin mirar','Copiamos todo el texto'],correct:0},
 {id:2,title:'Buscamos pistas',text:'Mientras lees, identifica palabras, acciones y detalles que entregan información importante.',question:'¿Qué debemos buscar en el texto?',options:['Pistas y detalles importantes','Solo palabras largas','Únicamente el final'],correct:0},
 {id:3,title:'Hacemos una inferencia',text:'Une las pistas del texto con lo que ya sabes para construir una idea que no aparece escrita de forma directa.',question:'¿Cómo se construye una inferencia?',options:['Uniendo pistas y conocimientos previos','Adivinando sin leer','Repitiendo una oración'],correct:0},
 {id:4,title:'Justificamos',text:'Explica tu respuesta indicando qué pista del texto te ayudó a pensarla.',question:'¿Qué debe incluir la justificación?',options:['La pista que apoyó la respuesta','Solo una palabra','Una opinión sin evidencia'],correct:0}
]

export default function ProfesorVirtual(){
 const[lesson,setLesson]=useState(initialLesson)
 const[step,setStep]=useState(0)
 const[playing,setPlaying]=useState(false)
 const[answer,setAnswer]=useState<number|null>(null)
 const[mode,setMode]=useState<'docente'|'estudiante'>('docente')
 const[captions,setCaptions]=useState(true)
 const[rate,setRate]=useState(.88)
 const[message,setMessage]=useState('')
 const current=lesson[step]
 const progress=useMemo(()=>Math.round((step+1)/lesson.length*100),[step,lesson.length])

 function notify(text:string){setMessage(text);window.setTimeout(()=>setMessage(''),2200)}
 function speak(){
  if(typeof window==='undefined'||!('speechSynthesis'in window))return
  window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(`${current.title}. ${current.text}`);utterance.lang='es-CL';utterance.rate=rate;utterance.pitch=1.04
  utterance.onstart=()=>setPlaying(true);utterance.onend=()=>setPlaying(false);utterance.onerror=()=>setPlaying(false);window.speechSynthesis.speak(utterance)
 }
 function stop(){if(typeof window!=='undefined')window.speechSynthesis.cancel();setPlaying(false)}
 function next(){if(step<lesson.length-1){setStep(value=>value+1);setAnswer(null);stop()}}
 function previous(){if(step>0){setStep(value=>value-1);setAnswer(null);stop()}}
 function updateStep(field:'title'|'text'|'question',value:string){setLesson(items=>items.map((item,index)=>index===step?{...item,[field]:value}:item))}
 function addStep(){const id=Date.now();setLesson(items=>[...items,{id,title:'Nuevo paso',text:'Escribe aquí la explicación de YOYO.',question:'Escribe una pregunta de comprobación.',options:['Respuesta correcta','Distractor 1','Distractor 2'],correct:0}]);setStep(lesson.length);setAnswer(null)}

 return <ModuleShell active="Profesor virtual">
  {message&&<div className="functional-toast"><CheckCircle2/>{message}</div>}
  <section className="virtual-teacher-v2-head">
   <div><span className="module-eyebrow"><Sparkles size={15}/> Enseñanza guiada multimodal</span><h1>Profesor virtual YOYO</h1><p>Crea lecciones guiadas con voz, subtítulos, modelado explícito, preguntas y retroalimentación.</p></div>
   <div className="virtual-teacher-head-actions"><button onClick={()=>setMode(mode==='docente'?'estudiante':'docente')}><Eye/>{mode==='docente'?'Vista estudiante':'Volver al editor'}</button><button onClick={()=>notify('Lección guardada como borrador')}><Save/>Guardar</button><button onClick={()=>notify('Lección asignada a 3.º básico')}><Send/>Asignar</button></div>
  </section>

  <section className={`virtual-teacher-v2-layout mode-${mode}`}>
   <aside className="virtual-lesson-outline">
    <header><span><Settings2/></span><div><small>SECUENCIA</small><h2>Pasos de la lección</h2></div></header>
    <div>{lesson.map((item,index)=><button key={item.id} className={index===step?'active':''} onClick={()=>{setStep(index);setAnswer(null);stop()}}><span>{index+1}</span><div><strong>{item.title}</strong><small>{index===0?'Activación':index===lesson.length-1?'Cierre':'Modelado guiado'}</small></div>{index<step&&<Check/>}</button>)}</div>
    <button className="virtual-add-step" onClick={addStep}><Plus/>Agregar paso</button>
    <section className="virtual-voice-settings"><small>VOZ Y ACCESO</small><label><Mic2/><span>Velocidad</span><select value={rate} onChange={event=>setRate(Number(event.target.value))}><option value="0.72">Lenta</option><option value="0.88">Normal</option><option value="1.05">Rápida</option></select></label><button className={captions?'active':''} onClick={()=>setCaptions(value=>!value)}><Subtitles/><span>Subtítulos</span><i>{captions?'Activos':'Inactivos'}</i></button><div><ShieldCheck/><span><strong>Control docente</strong><small>Revisión antes de publicar</small></span></div></section>
   </aside>

   <main className="virtual-classroom-card">
    <div className="virtual-classroom-scene">
     <img src="/illustrations/profesor-yoyo-premium.svg" alt="Profesor virtual YOYO explicando una lección en un aula interactiva"/>
     <div className="virtual-board-overlay"><span>PASO {step+1} DE {lesson.length}</span><h2>{current.title}</h2><p>{current.text}</p><div><i style={{width:`${progress}%`}}/></div></div>
     <div className={`virtual-yoyo-status ${playing?'speaking':''}`}><span><Bot/></span><div><strong>{playing?'YOYO está explicando':'YOYO está listo'}</strong><small>{playing?'Escucha y observa la pizarra':'Pulsa reproducir para comenzar'}</small><div><i/><i/><i/><i/></div></div></div>
     {captions&&<div className="virtual-caption-v2"><Subtitles/><span>{current.text}</span></div>}
    </div>
    <div className="virtual-playback"><button onClick={previous} disabled={step===0}><ChevronLeft/>Anterior</button><button className="virtual-play-main" onClick={playing?stop:speak}>{playing?<><Pause/>Pausar explicación</>:<><Play/>Reproducir explicación</>}</button><button onClick={()=>{setStep(0);setAnswer(null);stop()}}><RotateCcw/>Reiniciar</button><button onClick={next} disabled={step===lesson.length-1}>Siguiente<ChevronRight/></button></div>
   </main>

   <aside className="virtual-lesson-editor">
    {mode==='docente'?<>
     <header><span>EDITOR DEL PASO</span><h2>Contenido y comprobación</h2><p>Todo cambio se refleja inmediatamente en la vista previa.</p></header>
     <label>Título<input value={current.title} onChange={event=>updateStep('title',event.target.value)}/></label>
     <label>Explicación de YOYO<textarea rows={5} value={current.text} onChange={event=>updateStep('text',event.target.value)}/></label>
     <label>Pregunta de comprobación<textarea rows={3} value={current.question} onChange={event=>updateStep('question',event.target.value)}/></label>
     <div className="virtual-option-editor"><small>ALTERNATIVAS</small>{current.options.map((option,index)=><label key={`${current.id}-${index}`}><button className={current.correct===index?'correct':''} onClick={()=>setLesson(items=>items.map((item,itemIndex)=>itemIndex===step?{...item,correct:index}:item))}>{String.fromCharCode(65+index)}</button><input value={option} onChange={event=>setLesson(items=>items.map((item,itemIndex)=>itemIndex===step?{...item,options:item.options.map((value,optionIndex)=>optionIndex===index?event.target.value:value)}:item))}/></label>)}</div>
    </>:<>
     <header><span>COMPROBEMOS</span><h2>{current.question}</h2><p>Selecciona una respuesta. YOYO entregará retroalimentación inmediata.</p></header>
     <div className="virtual-student-options">{current.options.map((option,index)=>{const state=answer===null?'':index===current.correct?'correct':answer===index?'wrong':'';return <button className={state} key={option} onClick={()=>setAnswer(index)} disabled={answer!==null}><span>{String.fromCharCode(65+index)}</span>{option}{state==='correct'&&<CheckCircle2/>}</button>})}</div>
     {answer!==null&&<div className={answer===current.correct?'virtual-feedback success':'virtual-feedback retry'}><strong>{answer===current.correct?'¡Excelente!':'Revisemos juntos'}</strong><p>{answer===current.correct?'Usaste correctamente la estrategia presentada por YOYO.':'Escucha nuevamente la explicación y busca la pista principal.'}</p><button onClick={speak}><Headphones/>Escuchar explicación</button></div>}
    </>}
   </aside>
  </section>

  <section className="virtual-teacher-features"><article><span><Volume2/></span><div><h3>Voz configurable</h3><p>Español de Chile, ritmo lento, normal o rápido.</p></div></article><article><span><Subtitles/></span><div><h3>Acceso multimodal</h3><p>Voz, texto, ilustración y comprobación guiada.</p></div></article><article><span><ShieldCheck/></span><div><h3>Aprobación profesional</h3><p>El docente edita y revisa cada paso antes de asignarlo.</p></div></article></section>
 </ModuleShell>
}
