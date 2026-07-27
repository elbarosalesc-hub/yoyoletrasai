'use client'

import {useState} from 'react'
import ThreeForest from './ThreeForest'

type Props={onSelect:(id:string)=>void;active:string[];reducedMotion?:boolean;highContrast?:boolean}

const objects=[
 {id:'mochila',label:'Mochila',left:'20%',top:'61%',width:'15%',height:'20%'},
 {id:'nota',label:'Nota',left:'43%',top:'55%',width:'15%',height:'17%'},
 {id:'ave',label:'Ave',left:'64%',top:'28%',width:'14%',height:'16%'},
 {id:'cabana',label:'Cabaña',left:'75%',top:'47%',width:'20%',height:'27%'}
]

export default function Bosque3D({onSelect,active,reducedMotion=false,highContrast=false}:Props){
 const[webglReady,setWebglReady]=useState(false)
 return <div className={'three-stage premium-webgl-scene '+(reducedMotion?'reduced-motion ':'')+(highContrast?'high-contrast':'')} role="application" aria-label="Bosque tridimensional interactivo con alternativa accesible">
  <ThreeForest reducedMotion={reducedMotion} highContrast={highContrast} onReady={setWebglReady}/>
  <div className="scene-guide-label"><strong>Sofía</strong><span>{webglReady?'Escena 3D activa. Explora las pistas.':'Cargando escena accesible…'}</span></div>
  <div className="hotspot-layer" aria-label="Objetos interactivos del bosque">
   {objects.map(o=><button key={o.id} type="button" className={'svg-hotspot '+(active.includes(o.id)?'found':'')} style={{left:o.left,top:o.top,width:o.width,height:o.height}} onClick={()=>onSelect(o.id)} aria-label={`Explorar ${o.label}`} aria-pressed={active.includes(o.id)}><span>{active.includes(o.id)?`✓ ${o.label}`:o.label}</span></button>)}
  </div>
  <div className="accessible-object-list" aria-label="Lista alternativa de objetos">
   {objects.map((o,i)=><button key={o.id} onClick={()=>onSelect(o.id)} aria-pressed={active.includes(o.id)}><span>{i+1}</span>{o.label}{active.includes(o.id)&&' encontrada'}</button>)}
  </div>
 </div>
}
