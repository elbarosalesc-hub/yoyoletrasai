'use client'
import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import TraceCanvas from '@/components/tools/TraceCanvas'

const images=[['🐒','mono'],['🍎','manzana'],['✋','mano'],['🗺️','mapa']]
const levels=[
 {id:'trazo',label:'Trazos base',description:'Líneas, arcos, ondas y bucles preparatorios.'},
 {id:'letra',label:'Letra aislada',description:'Modelo, direccionalidad y repetición guiada.'},
 {id:'silaba',label:'Sílabas',description:'Uniones frecuentes y automatización.'},
 {id:'palabra',label:'Palabras',description:'Transferencia a vocabulario significativo.'},
 {id:'frase',label:'Frases',description:'Escritura funcional con legibilidad y ritmo.'},
]

type ScriptStyle='Imprenta mayúscula'|'Imprenta minúscula'|'Manuscrita mayúscula'|'Manuscrita minúscula'
type Handedness='right'|'left'

export default function Caligrafia(){
 const[style,setStyle]=useState<ScriptStyle>('Imprenta minúscula')
 const[letter,setLetter]=useState('m')
 const[image,setImage]=useState(images[0])
 const[level,setLevel]=useState('letra')
 const[handedness,setHandedness]=useState<Handedness>('right')
 const[showStart,setShowStart]=useState(true)
 const[showDirection,setShowDirection]=useState(true)
 const[showGuides,setShowGuides]=useState(true)
 const isUpper=style.includes('mayúscula')
 const isManuscript=style.startsWith('Manuscrita')
 const label=useMemo(()=>isUpper?letter.toUpperCase():letter.toLowerCase(),[isUpper,letter])
 const rows=useMemo(()=>{
  const base=isUpper?letter.toUpperCase():letter.toLowerCase()
  const family=[`${base}  ${base}  ${base}  ${base}  ${base}`,`${base}a  ${base}e  ${base}i  ${base}o  ${base}u`,`${image[1]}   mano   mapa`,`Mi mamá me mima.`]
  if(level==='trazo')return ['||||   ----   ////   \\','∩ ∩ ∩   ∪ ∪ ∪   ~~~~~','oooo   eeee   llll','zigzag   ondas   bucles']
  if(level==='silaba')return [`${base}a   ${base}e   ${base}i   ${base}o   ${base}u`,`${base}am   ${base}em   ${base}im   ${base}om   ${base}um`,`${base}a${base}a   ${base}e${base}e   ${base}i${base}i`,`ma  me  mi  mo  mu`]
  if(level==='palabra')return [`${image[1]}   mano   mapa   mimo`,`mamá   mimo   mima   meme`,`mesa   mapa   mano   mono`,`Mi palabra favorita: __________`]
  if(level==='frase')return ['Mi mamá me mima.','Mimi mira el mapa.','Mi mano mueve el lápiz.','Escribo una frase: ____________________']
  return family
 },[isUpper,letter,image,level])

 return <AppShell active="Caligrafía">
  <section className="premium-hero"><span className="eyebrow">Estudio de escritura</span><h1>Caligrafía completa: imprenta y manuscrita</h1><p>Modelos diferenciados en mayúscula y minúscula, direccionalidad, pauta, lateralidad, progresión y práctica lista para pantalla e impresión.</p></section>
  <div className="studio-layout">
   <section className="panel form-panel"><h2>Configura la actividad</h2><label>Letra</label><input value={letter} maxLength={2} onChange={e=>setLetter(e.target.value||'m')}/><label>Tipo de escritura</label><select value={style} onChange={e=>setStyle(e.target.value as ScriptStyle)}><option>Imprenta mayúscula</option><option>Imprenta minúscula</option><option>Manuscrita mayúscula</option><option>Manuscrita minúscula</option></select><label>Progresión</label><select value={level} onChange={e=>setLevel(e.target.value)}>{levels.map(item=><option key={item.id} value={item.id}>{item.label}</option>)}</select><small>{levels.find(item=>item.id===level)?.description}</small><label>Lateralidad</label><div className="image-picker"><button className={'image-choice '+(handedness==='right'?'active':'')} onClick={()=>setHandedness('right')}><span>✋</span>Diestra</button><button className={'image-choice '+(handedness==='left'?'active':'')} onClick={()=>setHandedness('left')}><span>🤚</span>Zurda</button></div><label>Imagen asociada</label><div className="image-picker">{images.map(x=><button key={x[1]} className={'image-choice '+(image[1]===x[1]?'active':'')} onClick={()=>setImage(x)}><span>{x[0]}</span>{x[1]}</button>)}</div><div className="option-list"><label><input type="checkbox" checked={showStart} onChange={e=>setShowStart(e.target.checked)}/> Punto de inicio</label><label><input type="checkbox" checked={showDirection} onChange={e=>setShowDirection(e.target.checked)}/> Flechas de dirección</label><label><input type="checkbox" checked={showGuides} onChange={e=>setShowGuides(e.target.checked)}/> Pauta gráfica</label><span>✓ Audio del fonema</span><span>✓ Versión diestra/zurda</span></div></section>
   <section className="worksheet"><h2>La letra {label} · {isManuscript?'manuscrita':'imprenta'}</h2><p>Observa, escucha, traza y escribe con progresión desde el gesto gráfico hasta la frase.</p><div className="image-word"><span>{image[0]}</span><div><strong>{image[1]}</strong><small>Empieza con /{letter.toLowerCase()}/</small></div></div><TraceCanvas letter={label} word={image[1]} writingStyle={isManuscript?'manuscript':'print'} handedness={handedness} showGuides={showGuides} showStart={showStart} showDirection={showDirection}/>{rows.map((r,i)=><div className={'writing-row '+(isManuscript?'writing-manuscript':'writing-print')} key={i}>{r}</div>)}</section>
   <aside className="panel"><h2>Control de calidad</h2><div className="quality-list"><span>✓ Imprenta mayúscula y minúscula</span><span>✓ Manuscrita mayúscula y minúscula</span><span>✓ Formación y direccionalidad</span><span>✓ Progresión desde trazos a frases</span><span>✓ Imagen fonológica</span><span>✓ Impresión y accesibilidad</span></div><div className="insight"><b>Profesor Virtual</b><p>En manuscrita, prioriza continuidad del trazo, bucles amplios y control del tamaño antes de aumentar velocidad.</p></div></aside>
  </div>
 </AppShell>
}
