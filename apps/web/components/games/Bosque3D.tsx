'use client'

import {useState} from 'react'
import ThreeForest from './ThreeForest'

type Props={onSelect:(id:string)=>void;active:string[];reducedMotion?:boolean;highContrast?:boolean}

const objects=[
 {id:'mochila',label:'Mochila'},
 {id:'nota',label:'Nota'},
 {id:'ave',label:'Ave'},
 {id:'cabana',label:'Cabaña'}
]

export default function Bosque3D({onSelect,active,reducedMotion=false,highContrast=false}:Props){
 const[webglReady,setWebglReady]=useState(false)
 return <div className={'three-stage premium-webgl-scene '+(reducedMotion?'reduced-motion ':'')+(highContrast?'high-contrast':'')} role="application" aria-label="Bosque tridimensional interactivo con alternativa accesible">
  <ThreeForest reducedMotion={reducedMotion} highContrast={highContrast} active={active} onReady={setWebglReady} onSelect={onSelect}/>
  <div className="scene-guide-label"><strong>Sofía</strong><span>{webglReady?'Toca directamente las pistas que encuentres en la escena 3D.':'Cargando experiencia accesible…'}</span></div>
  <div className="scene-discovery" aria-hidden="true"><span>{active.length}/4 pistas descubiertas</span>{objects.map(o=><i key={o.id} className={active.includes(o.id)?'found':''}/>)}</div>
  <div className="accessible-object-list" aria-label="Alternativa accesible para explorar las pistas">
   {objects.map((o,i)=><button key={o.id} type="button" onClick={()=>onSelect(o.id)} aria-pressed={active.includes(o.id)}><span>{active.includes(o.id)?'✓':i+1}</span>{o.label}{active.includes(o.id)&&' encontrada'}</button>)}
  </div>
 </div>
}
