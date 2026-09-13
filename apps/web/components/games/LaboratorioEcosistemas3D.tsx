'use client'

import {useEffect,useMemo,useState} from 'react'
import {CheckCircle2,FlaskConical,Leaf,RotateCcw,ShieldAlert,Sparkles} from 'lucide-react'
import ThreeEcosystemLab from './ThreeEcosystemLab'

type Props={reducedMotion?:boolean;highContrast?:boolean}
type Scenario={name:string;brief:string;targets:{balance:number;pollutionMax:number};start:{water:number;light:number;biodiversity:number;pollution:number};concept:string}

const scenarios:Scenario[]=[
 {name:'Humedal en sequía',brief:'Recupera el humedal sin crear un exceso artificial de agua.',targets:{balance:72,pollutionMax:35},start:{water:28,light:74,biodiversity:42,pollution:24},concept:'Los factores abióticos modifican la disponibilidad de recursos y la supervivencia.'},
 {name:'Bosque intervenido',brief:'Aumenta biodiversidad y reduce presión ambiental manteniendo recursos equilibrados.',targets:{balance:80,pollutionMax:25},start:{water:55,light:58,biodiversity:28,pollution:58},concept:'La diversidad de seres vivos favorece redes ecológicas más resilientes.'},
 {name:'Ecosistema resiliente',brief:'Construye un equilibrio estable capaz de tolerar cambios sin colapsar.',targets:{balance:88,pollutionMax:18},start:{water:48,light:52,biodiversity:52,pollution:42},concept:'Un ecosistema funciona como sistema: cambiar una variable produce efectos en otras.'},
]

function clamp(value:number){return Math.max(0,Math.min(100,value))}
function balanceScore(water:number,light:number,biodiversity:number,pollution:number){
 const waterFit=100-Math.abs(water-62)*1.35
 const lightFit=100-Math.abs(light-60)*1.2
 const diversityFit=biodiversity
 const clean=100-pollution
 return Math.round(clamp(waterFit*.22+lightFit*.18+diversityFit*.34+clean*.26))
}

export default function LaboratorioEcosistemas3D({reducedMotion=false,highContrast=false}:Props){
 const[index,setIndex]=useState(0),[water,setWater]=useState(scenarios[0].start.water),[light,setLight]=useState(scenarios[0].start.light),[biodiversity,setBiodiversity]=useState(scenarios[0].start.biodiversity),[pollution,setPollution]=useState(scenarios[0].start.pollution)
 const[observations,setObservations]=useState<string[]>([]),[ready,setReady]=useState(false),[message,setMessage]=useState('Modifica una variable, ejecuta la simulación y observa relaciones de causa y efecto.')
 const current=scenarios[index]
 const score=useMemo(()=>balanceScore(water,light,biodiversity,pollution),[water,light,biodiversity,pollution])
 const completed=score>=current.targets.balance&&pollution<=current.targets.pollutionMax

 useEffect(()=>{const start=current.start;setWater(start.water);setLight(start.light);setBiodiversity(start.biodiversity);setPollution(start.pollution);setObservations([]);setMessage('Nuevo escenario cargado. Formula una hipótesis antes de modificar variables.')},[current])

 function simulate(){
  let nextBiodiversity=biodiversity
  let nextPollution=pollution
  if(water<35)nextBiodiversity-=8
  if(water>82)nextBiodiversity-=4
  if(water>=48&&water<=75)nextBiodiversity+=5
  if(light<30||light>88)nextBiodiversity-=5
  if(light>=45&&light<=72)nextBiodiversity+=4
  if(pollution>55)nextBiodiversity-=10
  if(pollution<28)nextBiodiversity+=5
  if(biodiversity>70)nextPollution-=3
  setBiodiversity(clamp(nextBiodiversity));setPollution(clamp(nextPollution))
  const after=balanceScore(water,light,clamp(nextBiodiversity),clamp(nextPollution))
  const note=`Agua ${water}% · luz ${light}% · biodiversidad ${Math.round(clamp(nextBiodiversity))}% · contaminación ${Math.round(clamp(nextPollution))}% → equilibrio ${after}%`
  setObservations(items=>[note,...items].slice(0,5))
  setMessage(after>score?'El equilibrio mejoró. Identifica qué variable cambió y explica por qué pudo favorecer al sistema.':after===score?'El sistema se mantuvo estable. Prueba una modificación controlada para comparar.':'El equilibrio disminuyó. Revisa qué factor limitante o presión ambiental aumentó.')
 }
 function intervention(kind:'restore'|'clean'|'fragment'){
  if(kind==='restore'){setWater(value=>clamp(value+10));setBiodiversity(value=>clamp(value+8));setMessage('Restauración aplicada: recuperaste agua y hábitat. Ejecuta la simulación para observar el efecto combinado.')}
  if(kind==='clean'){setPollution(value=>clamp(value-18));setMessage('Limpieza aplicada: disminuyó la presión contaminante. Ejecuta la simulación y compara biodiversidad.')}
  if(kind==='fragment'){setBiodiversity(value=>clamp(value-14));setPollution(value=>clamp(value+8));setMessage('Fragmentación aplicada como experimento de riesgo: bajó el hábitat disponible y aumentó la presión ambiental.')}
 }
 function next(){if(!completed)return;if(index<scenarios.length-1)setIndex(value=>value+1);else setMessage('Laboratorio completo. Lograste explicar el ecosistema como un sistema de variables relacionadas.')}
 function reset(){const start=current.start;setWater(start.water);setLight(start.light);setBiodiversity(start.biodiversity);setPollution(start.pollution);setObservations([]);setMessage('Escenario reiniciado.')}

 return <section className="fair-game-wrap" id="laboratorio-ecosistemas">
  <div className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Ciencias · 4.º–6.º básico</span><h1>Laboratorio de ecosistemas</h1><p>Simula un ecosistema como sistema: modifica factores abióticos y presiones humanas, observa consecuencias y busca un equilibrio justificable.</p></div><div className="game-actions"><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/>Reiniciar escenario</button></div></div>
  <div className="level-rail">{scenarios.map((scenario,i)=><div key={scenario.name} className={'level-step '+(i===index?'active ':'')+(i<index?'done ':'')+(i>index?'locked':'')}><span>{i<index?<CheckCircle2 size={17}/>:i+1}</span><div><b>{scenario.name}</b><small>{i===index?'Simulación activa':i<index?'Completado':'Por desbloquear'}</small></div></div>)}</div>
  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card"><div className="game-hud"><span>{current.name}</span><div className="hud-progress"><i style={{width:`${score}%`}}/></div><b>Equilibrio {score}%</b></div><div className="three-stage premium-webgl-scene" role="application" aria-label="Simulador tridimensional de ecosistema con variables editables"><ThreeEcosystemLab water={water} light={light} biodiversity={biodiversity} pollution={pollution} reducedMotion={reducedMotion} highContrast={highContrast} onReady={setReady}/><div className="scene-guide-label"><strong>Modelo ecológico</strong><span>{ready?'Escena 3D activa. Los cambios visuales representan el modelo, no una predicción exacta de campo.':'Cargando ecosistema…'}</span></div></div><div className="feedback-box" role="status" aria-live="polite">{message}</div><div className="accessibility-summary"><Leaf size={18}/><span>{current.concept}</span></div></section>
   <aside className="panel challenge-panel"><span className="eyebrow"><FlaskConical size={14}/> Investigación guiada</span><h2>{current.brief}</h2><p>Meta: equilibrio ≥ {current.targets.balance}% y contaminación ≤ {current.targets.pollutionMax}%.</p>
    <div style={{display:'grid',gap:12}}><label>Agua disponible · {water}%<input type="range" min="0" max="100" value={water} onChange={event=>setWater(Number(event.target.value))}/></label><label>Luz solar · {light}%<input type="range" min="0" max="100" value={light} onChange={event=>setLight(Number(event.target.value))}/></label><label>Biodiversidad · {Math.round(biodiversity)}%<input type="range" min="0" max="100" value={biodiversity} onChange={event=>setBiodiversity(Number(event.target.value))}/></label><label>Contaminación · {Math.round(pollution)}%<input type="range" min="0" max="100" value={pollution} onChange={event=>setPollution(Number(event.target.value))}/></label></div>
    <div className="tool-row"><button className="btn btn-soft" onClick={()=>intervention('restore')}><Leaf size={15}/>Restaurar hábitat</button><button className="btn btn-soft" onClick={()=>intervention('clean')}><Sparkles size={15}/>Reducir contaminación</button><button className="btn btn-soft" onClick={()=>intervention('fragment')}><ShieldAlert size={15}/>Probar fragmentación</button></div><button className="btn btn-primary" onClick={simulate}><FlaskConical size={16}/>Ejecutar simulación</button>
    <div className="metric-grid"><div><strong>{score}%</strong><span>equilibrio</span></div><div><strong>{Math.round(biodiversity)}%</strong><span>biodiversidad</span></div><div><strong>{Math.round(pollution)}%</strong><span>contaminación</span></div><div><strong>{observations.length}</strong><span>observaciones</span></div></div>
    <div className="insight"><b>Bitácora experimental</b>{observations.length?observations.map((item,i)=><p key={`${item}-${i}`}>• {item}</p>):<p>Aún no ejecutas una simulación.</p>}</div><button className="btn btn-primary next-level" disabled={!completed} onClick={next}>{index===scenarios.length-1?'Finalizar laboratorio':'Siguiente escenario'}</button>
   </aside>
  </div>
 </section>
}
