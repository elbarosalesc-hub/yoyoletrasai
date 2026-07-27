'use client'

import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {FlaskConical,Zap,Droplets,Leaf,Move3D,Play,RotateCcw,Camera,CheckCircle2} from 'lucide-react'

type Mode='Circuito'|'Ecosistema'|'Agua'|'Movimiento'

export default function Simuladores(){
 const[mode,setMode]=useState<Mode>('Circuito')
 const[voltage,setVoltage]=useState(3)
 const[closed,setClosed]=useState(true)
 const[material,setMaterial]=useState('Cobre')
 const[hypothesis,setHypothesis]=useState('Si el circuito está cerrado y uso un conductor, la ampolleta encenderá.')
 const[run,setRun]=useState(false)
 const[result,setResult]=useState('Aún no se ejecuta el experimento.')
 const modes=[['Circuito',Zap],['Ecosistema',Leaf],['Agua',Droplets],['Movimiento',Move3D]] as const
 const conducts=material==='Cobre'||material==='Aluminio'
 const brightness=useMemo(()=>closed&&conducts?Math.min(1,voltage/5):0,[closed,conducts,voltage])
 const execute=()=>{setRun(true);setResult(mode==='Circuito'?(brightness>0?`La ampolleta encendió con intensidad ${Math.round(brightness*100)}%. El circuito está cerrado y ${material.toLowerCase()} conduce la corriente.`:`La ampolleta no encendió. Revisa el interruptor o el material.`):mode==='Ecosistema'?'La población de aves disminuyó después de reducir las plantas. La cadena alimentaria perdió equilibrio.':mode==='Agua'?'Al aumentar la temperatura, el agua cambió de líquido a gas.':'Al aumentar la fuerza, el objeto recorrió una distancia mayor.')}
 return <AppShell active="Simuladores y ciencias">
  <section className="premium-hero science-hero"><span className="eyebrow">Laboratorio virtual funcional</span><h1>Experimenta, modifica variables y explica resultados</h1><p>Cada simulación integra hipótesis, manipulación, observación, evidencia y conclusión.</p></section>
  <div className="simulation-tabs">{modes.map(([m,I])=><button key={m} className={mode===m?'active':''} onClick={()=>{setMode(m);setRun(false)}}><I size={19}/>{m}</button>)}</div>
  <div className="simulation-layout">
   <aside className="simulation-controls premium-card"><h2>Variables</h2>{mode==='Circuito'?<><label>Voltaje <b>{voltage} V</b><input type="range" min="1" max="5" value={voltage} onChange={e=>setVoltage(Number(e.target.value))}/></label><label>Interruptor<select value={closed?'Cerrado':'Abierto'} onChange={e=>setClosed(e.target.value==='Cerrado')}><option>Cerrado</option><option>Abierto</option></select></label><label>Material<select value={material} onChange={e=>setMaterial(e.target.value)}><option>Cobre</option><option>Aluminio</option><option>Plástico</option><option>Madera</option></select></label></>:<><label>Variable principal<input type="range" min="0" max="100" defaultValue="50"/></label><label>Condición<select><option>Normal</option><option>Aumentada</option><option>Reducida</option></select></label></>}<label>Hipótesis<textarea rows={5} value={hypothesis} onChange={e=>setHypothesis(e.target.value)}/></label><button className="btn btn-coral" onClick={execute}><Play size={17}/>Ejecutar experimento</button><button className="btn btn-soft" onClick={()=>{setRun(false);setResult('Aún no se ejecuta el experimento.')}}><RotateCcw size={17}/>Reiniciar</button></aside>
   <section className="simulation-stage premium-card">
    <div className="simulation-stage-head"><div><span>Simulación activa</span><h2>{mode==='Circuito'?'Circuito eléctrico básico':mode==='Ecosistema'?'Ecosistema en equilibrio':mode==='Agua'?'Cambios de estado del agua':'Fuerza y movimiento'}</h2></div><button className="icon-button"><Camera size={18}/></button></div>
    {mode==='Circuito'?<div className="circuit-scene">
      <div className="battery"><span>+</span><b>{voltage}V</b><span>−</span></div>
      <div className={`wire top ${closed?'connected':''}`}/><div className={`wire bottom ${closed?'connected':''}`}/>
      <button className={`switch ${closed?'closed':''}`} onClick={()=>setClosed(v=>!v)}><i/></button>
      <div className="material-block"><b>{material}</b><small>{conducts?'Conductor':'Aislante'}</small></div>
      <div className="bulb" style={{filter:`drop-shadow(0 0 ${10+brightness*35}px rgba(255,210,70,${brightness}))`}}><span style={{opacity:.25+brightness*.75}}>💡</span><b>{brightness>0?'Encendida':'Apagada'}</b></div>
     </div>:<div className={`generic-simulation ${mode.toLowerCase()}`}><FlaskConical size={80}/><h3>{run?'Cambio observado':'Configura las variables y ejecuta'}</h3><p>{run?result:'La escena reaccionará según tus decisiones.'}</p></div>}
    <div className="observation-strip"><div><b>Estado</b><span>{run?'Experimento ejecutado':'Preparado'}</span></div><div><b>Variable modificada</b><span>{mode==='Circuito'?`${voltage} V · ${material}`:'Condición del sistema'}</span></div><div><b>Resultado esperado</b><span>{mode==='Circuito'?(brightness>0?'Encender':'No encender'):'Cambio observable'}</span></div></div>
   </section>
   <aside className="science-notebook premium-card"><h2>Cuaderno científico</h2><div className="notebook-step done"><CheckCircle2/><div><b>1. Hipótesis</b><p>{hypothesis}</p></div></div><div className={`notebook-step ${run?'done':''}`}><CheckCircle2/><div><b>2. Observación</b><p>{run?result:'Ejecuta la simulación para registrar la observación.'}</p></div></div><label>3. Conclusión<textarea rows={6} placeholder="Explica qué ocurrió y por qué..."/></label><button className="btn btn-primary">Guardar evidencia</button></aside>
  </div>
 </AppShell>
}
