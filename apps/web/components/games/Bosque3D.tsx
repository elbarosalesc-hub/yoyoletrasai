'use client'

type Props={onSelect:(id:string)=>void;active:string[];reducedMotion?:boolean}

const objects=[
 {id:'mochila',label:'Mochila',icon:'🎒',className:'obj-backpack'},
 {id:'nota',label:'Nota',icon:'📝',className:'obj-note'},
 {id:'ave',label:'Ave',icon:'🐦',className:'obj-bird'},
 {id:'cabana',label:'Cabaña',icon:'🏡',className:'obj-cabin'}
]

export default function Bosque3D({onSelect,active,reducedMotion}:Props){
 return <div className={'three-stage css-scene '+(reducedMotion?'reduced-motion':'')} role="application" aria-label="Bosque interactivo">
  <div className="scene-sky"><span className="scene-cloud cloud-one"/><span className="scene-cloud cloud-two"/><span className="scene-sun"/></div>
  <div className="scene-mountains"><i/><i/><i/></div>
  <div className="scene-ground"><span className="scene-path"/><span className="scene-tree tree-a">🌳</span><span className="scene-tree tree-b">🌲</span><span className="scene-tree tree-c">🌳</span><span className="scene-flower flowers-a">🌼🌷</span><span className="scene-flower flowers-b">🌸🌻</span></div>
  <div className="scene-guide"><span className="guide-avatar">👧🏽</span><small>Sofía</small></div>
  {objects.map(o=><button key={o.id} type="button" className={'scene-object '+o.className+(active.includes(o.id)?' found':'')} onClick={()=>onSelect(o.id)} aria-pressed={active.includes(o.id)}><span>{o.icon}</span><b>{o.label}</b>{active.includes(o.id)&&<em>✓</em>}</button>)}
  <div className="scene-depth depth-front"/><div className="scene-depth depth-back"/>
 </div>
}