'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Blocks,Minus,Plus,RotateCcw,Volume2,CheckCircle2} from 'lucide-react'

export default function Manipulativos(){
 const[hundreds,setHundreds]=useState(3)
 const[tens,setTens]=useState(4)
 const[units,setUnits]=useState(7)
 const[message,setMessage]=useState('Construye un número y explica cómo está formado.')
 const value=useMemo(()=>hundreds*100+tens*10+units,[hundreds,tens,units])
 const adjust=(kind:'h'|'t'|'u',delta:number)=>{if(kind==='h')setHundreds(v=>Math.max(0,Math.min(9,v+delta)));if(kind==='t')setTens(v=>Math.max(0,Math.min(9,v+delta)));if(kind==='u')setUnits(v=>Math.max(0,Math.min(9,v+delta)))}
 const exchange=()=>{if(units>=10){setTens(v=>v+1);setUnits(v=>v-10);setMessage('Intercambiaste 10 unidades por 1 decena.')}else if(tens>=10){setHundreds(v=>v+1);setTens(v=>v-10);setMessage('Intercambiaste 10 decenas por 1 centena.')}else setMessage('Para intercambiar necesitas reunir 10 elementos de una misma posición.')}
 const speak=()=>{if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(`${value}. ${hundreds} centenas, ${tens} decenas y ${units} unidades.`))}}
 return <AppShell active="Herramientas docentes">
  <section className="premium-hero math-lab-hero"><span className="eyebrow">Manipulativo táctil</span><h1>Laboratorio de valor posicional</h1><p>Construye, descompone, intercambia y explica números usando bloques base diez.</p><div className="hero-cta"><button className="btn btn-coral" onClick={speak}><Volume2 size={18}/>Escuchar número</button><button className="btn btn-soft" onClick={()=>{setHundreds(3);setTens(4);setUnits(7);setMessage('Actividad reiniciada.')}}><RotateCcw size={17}/>Reiniciar</button></div></section>
  <div className="math-lab-layout">
   <aside className="math-controls premium-card"><h2>Construye el número</h2>{([['h','Centenas',hundreds],['t','Decenas',tens],['u','Unidades',units]] as const).map(([key,label,val])=><div className="place-control" key={key}><span>{label}</span><div><button onClick={()=>adjust(key,-1)}><Minus size={17}/></button><b>{val}</b><button onClick={()=>adjust(key,1)}><Plus size={17}/></button></div></div>)}<button className="btn btn-primary" onClick={exchange}><Blocks size={18}/>Intercambiar 10 por 1</button><div className="math-challenge"><b>Desafío YOYO</b><p>Representa 407 y explica por qué la columna de decenas queda vacía.</p></div></aside>
   <section className="base-ten-stage premium-card"><div className="number-display"><span>Número construido</span><strong>{value}</strong><small>{hundreds} centenas + {tens} decenas + {units} unidades</small></div><div className="block-zone"><div className="hundreds-zone"><h3>Centenas</h3><div>{Array.from({length:hundreds}).map((_,i)=><div className="hundred-block" key={i}>{Array.from({length:25}).map((_,j)=><i key={j}/>)}</div>)}</div></div><div className="tens-zone"><h3>Decenas</h3><div>{Array.from({length:tens}).map((_,i)=><div className="ten-block" key={i}>{Array.from({length:10}).map((_,j)=><i key={j}/>)}</div>)}</div></div><div className="units-zone"><h3>Unidades</h3><div>{Array.from({length:units}).map((_,i)=><div className="unit-block" key={i}/>)}</div></div></div></section>
   <aside className="math-explanation premium-card"><CheckCircle2 size={30}/><h2>Explicación matemática</h2><p className="math-message">{message}</p><label>Explica tu estrategia<textarea rows={6} placeholder={`Escribe o dicta cómo construiste ${value}...`}/></label><button className="btn btn-primary" onClick={()=>setMessage('Evidencia guardada. El Profesor Virtual preparará el siguiente desafío.')}>Guardar evidencia</button><div className="insight"><b>Profesor Virtual</b><p>Analiza intercambios, errores de posición y nivel de autonomía para proponer el siguiente reto.</p></div></aside>
  </div>
 </AppShell>
}
