'use client'

import {useEffect,useMemo,useState} from 'react'
import Link from 'next/link'
import {AppShell} from '@/components/AppShell'
import {Plus,Trash2,Volume2,Printer,Save,GripVertical,Sparkles} from 'lucide-react'

type Picto={id:number;icon:string;label:string;color:string}
type SavedBoard={title:string;board:Picto[];showNumbers:boolean;includeAudio:boolean;markCompleted:boolean;size:string;visualMode:string;textMode:string;updatedAt:string}
type TeacherTransfer={source:'inclusion';mode:'adaptar';prompt:string;supportProfile:string;updatedAt:string}
const STORAGE_KEY='yoyo-inclusion-board'
const TEACHER_CONTEXT_KEY='yoyo-profesor-virtual-transfer'
const library:Picto[]=[
 {id:1,icon:'👀',label:'Mirar',color:'#e7f0ff'},{id:2,icon:'🎒',label:'Preparar',color:'#fff0dc'},{id:3,icon:'✏️',label:'Trabajar',color:'#eee7ff'},{id:4,icon:'✅',label:'Revisar',color:'#e3f7e9'},{id:5,icon:'🙋',label:'Pedir ayuda',color:'#ffe7eb'},{id:6,icon:'⏳',label:'Esperar',color:'#fff7d9'},{id:7,icon:'🧘',label:'Respirar',color:'#e6f7f5'},{id:8,icon:'🚪',label:'Salir',color:'#edf0f4'}
]

export default function Inclusion(){
 const[board,setBoard]=useState<Picto[]>(library.slice(0,4))
 const[title,setTitle]=useState('Mi rutina de trabajo autónomo')
 const[status,setStatus]=useState('Tablero sin publicar')
 const[query,setQuery]=useState('')
 const[showNumbers,setShowNumbers]=useState(true)
 const[includeAudio,setIncludeAudio]=useState(true)
 const[markCompleted,setMarkCompleted]=useState(false)
 const[size,setSize]=useState('Grande')
 const[visualMode,setVisualMode]=useState('Alto contraste')
 const[textMode,setTextMode]=useState('Lectura fácil')
 useEffect(()=>{
  try{
   const raw=localStorage.getItem(STORAGE_KEY)
   if(!raw)return
   const saved=JSON.parse(raw) as Partial<SavedBoard>
   if(typeof saved.title==='string')setTitle(saved.title)
   if(Array.isArray(saved.board)&&saved.board.every(item=>item&&typeof item.label==='string'&&typeof item.icon==='string'))setBoard(saved.board as Picto[])
   if(typeof saved.showNumbers==='boolean')setShowNumbers(saved.showNumbers)
   if(typeof saved.includeAudio==='boolean')setIncludeAudio(saved.includeAudio)
   if(typeof saved.markCompleted==='boolean')setMarkCompleted(saved.markCompleted)
   if(typeof saved.size==='string')setSize(saved.size)
   if(typeof saved.visualMode==='string')setVisualMode(saved.visualMode)
   if(typeof saved.textMode==='string')setTextMode(saved.textMode)
   setStatus('Tablero recuperado desde este dispositivo')
  }catch{setStatus('No fue posible recuperar el último tablero guardado')}
 },[])
 const add=(p:Picto)=>setBoard(b=>[...b,{...p,id:Date.now()+Math.floor(Math.random()*1000)}])
 const remove=(id:number)=>setBoard(b=>b.filter(x=>x.id!==id))
 const speak=(text:string)=>{if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}
 const sequence=useMemo(()=>board.map(x=>x.label).join(', '),[board])
 const filteredLibrary=useMemo(()=>{const normalized=query.trim().toLocaleLowerCase('es');return normalized?library.filter(item=>item.label.toLocaleLowerCase('es').includes(normalized)):library},[query])
 const saveBoard=()=>{
  const payload:SavedBoard={title,board,showNumbers,includeAudio,markCompleted,size,visualMode,textMode,updatedAt:new Date().toISOString()}
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify(payload));setStatus('Tablero guardado en este dispositivo y listo para asignar')}catch{setStatus('No fue posible guardar el tablero en este dispositivo')}
 }
 const prepareTeacherContext=()=>{
  const steps=board.map(item=>item.label).filter(Boolean).slice(0,20)
  const transfer:TeacherTransfer={
   source:'inclusion',
   mode:'adaptar',
   prompt:`Propón apoyos DUA/PIE para fortalecer la autonomía usando el tablero visual "${title}". Mantén el objetivo pedagógico y sugiere cómo modelar, aplicar y retirar gradualmente los apoyos.${steps.length?` Secuencia actual: ${steps.join(' → ')}.`:''}`,
   supportProfile:[`Tablero visual: ${title}`,steps.length?`Secuencia: ${steps.join(' → ')}`:'Secuencia aún sin pasos',`Modo visual: ${visualMode}`,`Tipo de texto: ${textMode}`,`Tamaño: ${size}`,includeAudio?'Audio activado':'Audio desactivado',markCompleted?'Seguimiento de pasos activado':'Seguimiento de pasos desactivado'].join(' · '),
   updatedAt:new Date().toISOString(),
  }
  try{localStorage.setItem(TEACHER_CONTEXT_KEY,JSON.stringify(transfer));setStatus('Contexto PIE preparado para Profesor Virtual')}catch{setStatus('No fue posible preparar el contexto para Profesor Virtual')}
 }
 return <AppShell active="Inclusión y PIE">
  <section className="premium-hero inclusion-hero"><span className="eyebrow">Inclusión, PIE y comunicación visual</span><h1>Pictogramas, rutinas y apoyos editables</h1><p>Crea secuencias visuales, escucha cada paso, adapta el tamaño y comparte el tablero con estudiantes, familias y equipo PIE.</p><div className="hero-cta"><button className="btn btn-coral" onClick={saveBoard}><Save size={17}/>Guardar tablero</button><button className="btn btn-soft" onClick={()=>speak(`${title}. ${sequence}`)}><Volume2 size={17}/>Escuchar secuencia</button></div></section>
  <div className="pictogram-workspace">
   <aside className="picto-library premium-card"><div className="section-title"><div><h2>Biblioteca visual</h2><p>Selecciona una acción para agregarla.</p></div><Sparkles/></div><input className="picto-search" placeholder="Buscar acción o emoción..." value={query} onChange={event=>setQuery(event.target.value)} aria-label="Buscar pictogramas"/>
    <div className="picto-library-grid">{filteredLibrary.map(p=><button key={p.id} onClick={()=>add(p)} style={{background:p.color}}><span>{p.icon}</span><b>{p.label}</b><Plus size={15}/></button>)}</div>
    <Link href="/multimedia" className="btn btn-soft">Abrir biblioteca completa</Link>
   </aside>
   <section className="visual-board premium-card"><div className="visual-board-head"><div><span>Tablero editable</span><input value={title} onChange={e=>setTitle(e.target.value)}/></div><div><button className="icon-button" onClick={()=>window.print()} aria-label="Imprimir"><Printer size={18}/></button><button className="icon-button" onClick={()=>{setBoard([]);setStatus('Tablero limpiado')}} aria-label="Limpiar"><Trash2 size={18}/></button></div></div>
    <div className="sequence-board">{board.length===0?<div className="empty-board"><Plus size={34}/><b>Agrega pictogramas desde la biblioteca</b><span>La secuencia aparecerá aquí.</span></div>:board.map((p,i)=><article className="sequence-card" style={{background:p.color}} key={p.id}><GripVertical className="drag-handle" size={18}/>{showNumbers&&<span className="step-number">{i+1}</span>}{includeAudio&&<button className="picto-audio" onClick={()=>speak(p.label)} aria-label={`Escuchar ${p.label}`}><Volume2 size={16}/></button>}<div className="picto-figure">{p.icon}</div><strong>{p.label}</strong>{markCompleted&&<input type="checkbox" aria-label={`Marcar ${p.label} como completado`}/>}<button className="remove-picto" onClick={()=>remove(p.id)} aria-label={`Quitar ${p.label}`}><Trash2 size={15}/></button></article>)}</div>
    <div className="board-options"><label><input type="checkbox" checked={showNumbers} onChange={e=>setShowNumbers(e.target.checked)}/> Mostrar números</label><label><input type="checkbox" checked={includeAudio} onChange={e=>setIncludeAudio(e.target.checked)}/> Incluir audio</label><label><input type="checkbox" checked={markCompleted} onChange={e=>setMarkCompleted(e.target.checked)}/> Marcar paso completado</label><select value={size} onChange={e=>setSize(e.target.value)} aria-label="Tamaño del tablero"><option>Pequeño</option><option>Mediano</option><option>Grande</option></select></div>
   </section>
   <aside className="access-panel premium-card"><h2>Perfil de acceso</h2><label>Modo visual<select value={visualMode} onChange={e=>setVisualMode(e.target.value)}><option>Estándar</option><option>Alto contraste</option><option>Blanco y negro</option></select></label><label>Tipo de texto<select value={textMode} onChange={e=>setTextMode(e.target.value)}><option>Lectura fácil</option><option>Texto completo</option><option>Solo imagen</option></select></label><div className="support-chips"><span>Audio</span><span>Texto simple</span><span>Respuesta táctil</span><span>Impresión</span></div><div className="insight"><b>Profesor Virtual</b><p>Recomienda agregar un paso de autorregulación antes de iniciar la tarea.</p></div><p className="save-status" role="status" aria-live="polite">{status}</p><Link className="btn btn-primary" href="/profesor-virtual" onClick={prepareTeacherContext}>Consultar a YOYO</Link></aside>
  </div>
 </AppShell>
}
