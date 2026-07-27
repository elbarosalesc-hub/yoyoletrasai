'use client'
import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import TraceCanvas from '@/components/tools/TraceCanvas'

const images=[['🐒','mono'],['🍎','manzana'],['✋','mano'],['🗺️','mapa']]

export default function Caligrafia(){
 const[style,setStyle]=useState('Manuscrita')
 const[letter,setLetter]=useState('m')
 const[image,setImage]=useState(images[0])
 const label=useMemo(()=>style.includes('mayúscula')?letter.toUpperCase():letter.toLowerCase(),[style,letter])
 return <AppShell active="Caligrafía">
  <section className="premium-hero"><span className="eyebrow">Estudio de escritura</span><h1>Caligrafía y grafomotricidad realmente interactiva</h1><p>Imprenta, manuscrita, ligada, imágenes fonológicas, trazado táctil y progresión para pantalla e impresión.</p></section>
  <div className="studio-layout">
   <section className="panel form-panel"><h2>Configura la actividad</h2><label>Letra</label><input value={letter} maxLength={2} onChange={e=>setLetter(e.target.value||'m')}/><label>Estilo</label><select value={style} onChange={e=>setStyle(e.target.value)}><option>Imprenta mayúscula</option><option>Imprenta minúscula</option><option>Manuscrita</option><option>Ligada</option></select><label>Imagen asociada</label><div className="image-picker">{images.map(x=><button key={x[1]} className={'image-choice '+(image[1]===x[1]?'active':'')} onClick={()=>setImage(x)}><span>{x[0]}</span>{x[1]}</button>)}</div><div className="option-list"><span>✓ Punto de inicio</span><span>✓ Flechas de dirección</span><span>✓ Audio del fonema</span><span>✓ Versión diestra/zurda</span></div></section>
   <section className="worksheet"><h2>La letra {label}</h2><p>Observa, escucha, traza y escribe.</p><div className="image-word"><span>{image[0]}</span><div><strong>{image[1]}</strong><small>Empieza con /{letter.toLowerCase()}/</small></div></div><TraceCanvas letter={label} word={image[1]}/>{[`${label}  ${label}  ${label}  ${label}  ${label}`,`${label}a  ${label}e  ${label}i  ${label}o  ${label}u`,`${image[1]}   mano   mapa`,`Mi mamá me mima.`].map((r,i)=><div className="writing-row" key={i}>{r}</div>)}</section>
   <aside className="panel"><h2>Control de calidad</h2><div className="quality-list"><span>✓ Formación y dirección</span><span>✓ Progresión significativa</span><span>✓ Imagen fonológica</span><span>✓ Impresión validada</span><span>✓ Accesibilidad</span></div><div className="insight"><b>Profesor Virtual</b><p>Antes de la letra manuscrita, agrega una actividad de pinza fina y bucles amplios.</p></div></aside>
  </div>
 </AppShell>
}
