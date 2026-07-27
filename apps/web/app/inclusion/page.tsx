'use client'

import {useMemo,useState} from 'react'
import Link from 'next/link'
import {AppShell} from '@/components/AppShell'
import {Plus,Trash2,Volume2,Printer,Save,GripVertical,Sparkles} from 'lucide-react'

type Picto={id:number;icon:string;label:string;color:string}
const library:Picto[]=[
 {id:1,icon:'👀',label:'Mirar',color:'#e7f0ff'},{id:2,icon:'🎒',label:'Preparar',color:'#fff0dc'},{id:3,icon:'✏️',label:'Trabajar',color:'#eee7ff'},{id:4,icon:'✅',label:'Revisar',color:'#e3f7e9'},{id:5,icon:'🙋',label:'Pedir ayuda',color:'#ffe7eb'},{id:6,icon:'⏳',label:'Esperar',color:'#fff7d9'},{id:7,icon:'🧘',label:'Respirar',color:'#e6f7f5'},{id:8,icon:'🚪',label:'Salir',color:'#edf0f4'}
]

export default function Inclusion(){
 const[board,setBoard]=useState<Picto[]>(library.slice(0,4))
 const[title,setTitle]=useState('Mi rutina de trabajo autónomo')
 const[status,setStatus]=useState('Tablero sin publicar')
 const add=(p:Picto)=>setBoard(b=>[...b,{...p,id:Date.now()}])
 const remove=(id:number)=>setBoard(b=>b.filter(x=>x.id!==id))
 const speak=(text:string)=>{if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}
 const sequence=useMemo(()=>board.map(x=>x.label).join(', '),[board])
 return <AppShell active="Inclusión y PIE">
  <section className="premium-hero inclusion-hero"><span className="eyebrow">Inclusión, PIE y comunicación visual</span><h1>Pictogramas, rutinas y apoyos editables</h1><p>Crea secuencias visuales, escucha cada paso, adapta el tamaño y comparte el tablero con estudiantes, familias y equipo PIE.</p><div className="hero-cta"><button className="btn btn-coral" onClick={()=>setStatus('Tablero guardado y listo para asignar')}><Save size={17}/>Guardar tablero</button><button className="btn btn-soft" onClick={()=>speak(`${title}. ${sequence}`)}><Volume2 size={17}/>Escuchar secuencia</button></div></section>
  <div className="pictogram-workspace">
   <aside className="picto-library premium-card"><div className="section-title"><div><h2>Biblioteca visual</h2><p>Selecciona una acción para agregarla.</p></div><Sparkles/></div><input className="picto-search" placeholder="Buscar acción o emoción..."/>
    <div className="picto-library-grid">{library.map(p=><button key={p.id} onClick={()=>add(p)} style={{background:p.color}}><span>{p.icon}</span><b>{p.label}</b><Plus size={15}/></button>)}</div>
    <Link href="/multimedia" className="btn btn-soft">Abrir biblioteca completa</Link>
   </aside>
   <section className="visual-board premium-card"><div className="visual-board-head"><div><span>Tablero editable</span><input value={title} onChange={e=>setTitle(e.target.value)}/></div><div><button className="icon-button" onClick={()=>window.print()} aria-label="Imprimir"><Printer size={18}/></button><button className="icon-button" onClick={()=>setBoard([])} aria-label="Limpiar"><Trash2 size={18}/></button></div></div>
    <div className="sequence-board">{board.length===0?<div className="empty-board"><Plus size={34}/><b>Agrega pictogramas desde la biblioteca</b><span>La secuencia aparecerá aquí.</span></div>:board.map((p,i)=><article className="sequence-card" style={{background:p.color}} key={p.id}><GripVertical className="drag-handle" size={18}/><span className="step-number">{i+1}</span><button className="picto-audio" onClick={()=>speak(p.label)} aria-label={`Escuchar ${p.label}`}><Volume2 size={16}/></button><div className="picto-figure">{p.icon}</div><strong>{p.label}</strong><button className="remove-picto" onClick={()=>remove(p.id)} aria-label={`Quitar ${p.label}`}><Trash2 size={15}/></button></article>)}</div>
    <div className="board-options"><label><input type="checkbox" defaultChecked/> Mostrar números</label><label><input type="checkbox" defaultChecked/> Incluir audio</label><label><input type="checkbox"/> Marcar paso completado</label><select defaultValue="Grande"><option>Pequeño</option><option>Mediano</option><option>Grande</option></select></div>
   </section>
   <aside className="access-panel premium-card"><h2>Perfil de acceso</h2><label>Modo visual<select defaultValue="Alto contraste"><option>Estándar</option><option>Alto contraste</option><option>Blanco y negro</option></select></label><label>Tipo de texto<select defaultValue="Lectura fácil"><option>Lectura fácil</option><option>Texto completo</option><option>Solo imagen</option></select></label><div className="support-chips"><span>Audio</span><span>Texto simple</span><span>Respuesta táctil</span><span>Impresión</span></div><div className="insight"><b>Profesor Virtual</b><p>Recomienda agregar un paso de autorregulación antes de iniciar la tarea.</p></div><p className="save-status">{status}</p><Link className="btn btn-primary" href="/profesor-virtual">Consultar a YOYO</Link></aside>
  </div>
 </AppShell>
}
