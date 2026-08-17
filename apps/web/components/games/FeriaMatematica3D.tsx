'use client'

import {useMemo,useState} from 'react'
import ThreeFair from './ThreeFair'

type Props={reducedMotion?:boolean;highContrast?:boolean}
type Item={id:string;label:string;price:number;left:string;top:string;width:string;height:string}

const items:Item[]=[
 {id:'jugo',label:'Jugo natural',price:800,left:'9%',top:'48%',width:'20%',height:'24%'},
 {id:'brocheta',label:'Brocheta de fruta',price:1200,left:'71%',top:'48%',width:'20%',height:'24%'},
 {id:'libro',label:'Libro usado',price:2500,left:'9%',top:'69%',width:'20%',height:'21%'},
 {id:'lapiz',label:'Set de lápices',price:500,left:'71%',top:'69%',width:'20%',height:'21%'}
]

const levels=[
 {name:'Compra exacta',budget:2800,target:2800,goal:'Forma una compra de $2.800 exactos.'},
 {name:'Calcula el vuelto',budget:5000,target:2500,goal:'Compra un libro y calcula cuánto dinero quedará.'},
 {name:'Planifica',budget:4100,target:4100,goal:'Forma una compra de $4.100 sin superar el presupuesto.'}
]

export default function FeriaMatematica3D({reducedMotion=false,highContrast=false}:Props){
 const[level,setLevel]=useState(0),[cart,setCart]=useState<string[]>([]),[attempts,setAttempts]=useState(0),[message,setMessage]=useState('Explora los puestos y arma tu compra.'),[ready,setReady]=useState(false)
 const current=levels[level]
 const total=useMemo(()=>cart.reduce((sum,id)=>sum+(items.find(item=>item.id===id)?.price||0),0),[cart])
 const remaining=current.budget-total
 const solved=level===1?cart.length===1&&cart[0]==='libro':total===current.target
 const toggle=(id:string)=>{setCart(prev=>prev.includes(id)?prev.filter(item=>item!==id):[...prev,id]);const item=items.find(entry=>entry.id===id);if(item)setMessage(`${item.label}: $${item.price.toLocaleString('es-CL')}. Total actual $${(cart.includes(id)?total-item.price:total+item.price).toLocaleString('es-CL')}.`)}
 const check=()=>{setAttempts(value=>value+1);if(level===1){if(cart.length===1&&cart[0]==='libro')setMessage(`Correcto. De $5.000 quedan $${remaining.toLocaleString('es-CL')}.`);else setMessage('Para este desafío debes comprar sólo el libro usado y calcular el vuelto.')}else if(total===current.target)setMessage('¡Objetivo logrado! La compra coincide exactamente con el monto pedido.');else if(total>current.target)setMessage(`Te pasaste por $${(total-current.target).toLocaleString('es-CL')}. Revisa la combinación.`);else setMessage(`Faltan $${(current.target-total).toLocaleString('es-CL')} para llegar al objetivo.`)}
 const next=()=>{if(!solved)return;if(level<levels.length-1){setLevel(value=>value+1);setCart([]);setMessage('Nuevo desafío desbloqueado.')}else setMessage('Misión completada: resolviste compra exacta, vuelto y planificación de presupuesto.')}
 const reset=()=>{setLevel(0);setCart([]);setAttempts(0);setMessage('Misión reiniciada.')}
 return <section className="fair-game-wrap" id="feria-matematica">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Matemática · 3°–6° básico</span><h2>Feria matemática</h2><p>Compra, combina precios, calcula vuelto y toma decisiones dentro de una feria escolar 3D.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={reset}>Reiniciar</button></div></div>
  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card"><div className="game-hud"><span>{current.name}</span><div className="hud-progress"><i style={{width:`${Math.min(100,Math.round(level/levels.length*100+33))}%`}}/></div><b>${total.toLocaleString('es-CL')}</b></div>
    <div className="three-stage premium-webgl-scene" role="application" aria-label="Feria matemática tridimensional con alternativa accesible"><ThreeFair reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Feria escolar</strong><span>{ready?'Escena 3D activa. Selecciona productos.':'Cargando escena accesible…'}</span></div><div className="hotspot-layer">{items.map(item=><button key={item.id} type="button" className={'svg-hotspot '+(cart.includes(item.id)?'found':'')} style={{left:item.left,top:item.top,width:item.width,height:item.height}} onClick={()=>toggle(item.id)} aria-pressed={cart.includes(item.id)} aria-label={`${item.label}, ${item.price} pesos`}><span>{cart.includes(item.id)?'✓ ':''}{item.label}<small>${item.price.toLocaleString('es-CL')}</small></span></button>)}</div></div>
    <div className="accessible-object-list" aria-label="Productos disponibles">{items.map((item,index)=><button key={item.id} onClick={()=>toggle(item.id)} aria-pressed={cart.includes(item.id)}><span>{index+1}</span>{item.label} · ${item.price.toLocaleString('es-CL')}{cart.includes(item.id)?' seleccionado':''}</button>)}</div>
   </section>
   <aside className="panel challenge-panel"><span className="eyebrow">Nivel {level+1} de {levels.length}</span><h2>{current.goal}</h2><div className="metric-grid"><div><strong>${current.budget.toLocaleString('es-CL')}</strong><span>presupuesto</span></div><div><strong>${total.toLocaleString('es-CL')}</strong><span>total</span></div><div><strong>${remaining.toLocaleString('es-CL')}</strong><span>saldo</span></div><div><strong>{attempts}</strong><span>intentos</span></div></div><button className="btn btn-primary next-level" onClick={check}>Comprobar compra</button><button className="btn btn-coral next-level" disabled={!solved} onClick={next}>{level===levels.length-1?'Finalizar misión':'Siguiente desafío'}</button><div className="feedback-box" role="status" aria-live="polite">{message}</div><div className="accessibility-summary"><span>DUA:</span><span>escena + lista textual, teclado, alto contraste, movimiento reducido y cálculo visible.</span></div></aside>
  </div>
 </section>
}
