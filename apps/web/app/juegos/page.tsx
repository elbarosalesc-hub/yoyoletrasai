'use client'
import dynamic from 'next/dynamic'
import {useMemo,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import {Volume2,VolumeX,Sparkles,Accessibility,Play,Pause,CheckCircle2,Star,Lock,RotateCcw,Eye,Brain,Keyboard,Gamepad2,Map,FlaskConical,Calculator,BookOpen,ArrowRight} from 'lucide-react'
import {gameExperiences} from '@/lib/games/catalog'
const Bosque3D=dynamic(()=>import('@/components/games/Bosque3D'),{ssr:false})
const FeriaMatematica3D=dynamic(()=>import('@/components/games/FeriaMatematica3D'),{ssr:false})

const clues:Record<string,string>={mochila:'La mochila sigue cerrada. Sofía todavía no se ha preparado para entrar.',nota:'La nota dice: “Espera a la profesora antes de pasar”.',ave:'El ave permanece tranquila. No hay una amenaza visible en el entorno.',cabana:'La puerta está entreabierta y la cabaña se encuentra sin luz.'}
const levels=[
 {id:1,name:'Explorar',goal:2,skill:'Localizar información',question:'¿Por qué Sofía espera antes de entrar?',answers:['Porque está perdida.','Porque debe esperar a la profesora.','Porque el ave la asustó.'],correct:1},
 {id:2,name:'Relacionar',goal:3,skill:'Relacionar pistas',question:'¿Qué dos pistas apoyan mejor la inferencia?',answers:['Nota y mochila','Ave y árbol','Cabaña y cielo'],correct:0},
 {id:3,name:'Inferir',goal:3,skill:'Inferencia sencilla',question:'¿Cómo se siente Sofía antes de entrar?',answers:['Cauta y atenta','Enojada con el ave','Aburrida del bosque'],correct:0},
 {id:4,name:'Justificar',goal:4,skill:'Justificar con evidencia',question:'Completa: Sofía espera porque…',answers:['la nota se lo indica y aún no está preparada.','quiere perseguir al ave.','el bosque está vacío.'],correct:0},
 {id:5,name:'Transferir',goal:4,skill:'Aplicar a una situación nueva',question:'Si la nota desapareciera, ¿qué otra pista permitiría actuar con cautela?',answers:['La cabaña oscura y entreabierta.','El color del cielo.','El tamaño de los árboles.'],correct:0}
]
function tone(ok=true){const Ctx=window.AudioContext||(window as typeof window&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();const osc=ctx.createOscillator();const gain=ctx.createGain();osc.type=ok?'sine':'triangle';osc.frequency.value=ok?660:220;gain.gain.value=.08;osc.connect(gain);gain.connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+.18)}
function speak(text:string){if('speechSynthesis'in window){speechSynthesis.cancel();speechSynthesis.speak(new SpeechSynthesisUtterance(text))}}
function subjectIcon(subject:string){if(subject==='Matemática')return Calculator;if(subject==='Ciencias')return FlaskConical;if(subject.includes('Historia'))return Map;if(subject==='Lenguaje')return BookOpen;return Gamepad2}

export default function Juegos(){
 const[running,setRunning]=useState(false),[sound,setSound]=useState(true),[reduced,setReduced]=useState(false),[contrast,setContrast]=useState(false)
 const[level,setLevel]=useState(0),[found,setFound]=useState<string[]>([]),[answer,setAnswer]=useState<number|null>(null),[attempts,setAttempts]=useState(0)
 const[feedback,setFeedback]=useState('Inicia la misión y explora los objetos del bosque.')
 const current=levels[level];const unlocked=found.length>=current.goal;const progress=Math.min(100,Math.round(found.length/current.goal*100));const correct=answer===current.correct
 const stars=useMemo(()=>level+(correct?1:0),[level,correct]);const accuracy=attempts===0?100:Math.round(((level+(correct?1:0))/attempts)*100)
 const select=(id:string)=>{if(!running){setFeedback('Primero inicia la misión.');return}if(!found.includes(id))setFound(v=>[...v,id]);setFeedback(clues[id]);if(sound){tone(true);speak(clues[id])}}
 const choose=(i:number)=>{if(!unlocked)return;setAttempts(v=>v+1);setAnswer(i);const ok=i===current.correct;const msg=ok?'Respuesta correcta. Usaste evidencia pertinente.':'Aún no. Revisa las pistas más relacionadas con la pregunta.';setFeedback(msg);if(sound){tone(ok);speak(msg)}}
 const next=()=>{if(!correct)return;if(level<levels.length-1){setLevel(v=>v+1);setAnswer(null);setFound([]);setFeedback('Nuevo nivel desbloqueado. La complejidad aumentó.')}else setFeedback('Misión completa. Lograste explorar, relacionar, inferir, justificar y transferir.')}
 const reset=()=>{setFound([]);setAnswer(null);setLevel(0);setAttempts(0);setFeedback('Misión reiniciada.')}
 const playableCount=gameExperiences.filter(game=>game.status==='playable').length
 return <AppShell active="Juegos inmersivos">
  <section className="game-premium-head"><div><span className="eyebrow">Experiencias pedagógicas 3D · PIE + DUA</span><h1>Juegos que enseñan dentro de una misión</h1><p>No son cuestionarios con decoración: cada experiencia parte de un entorno, una meta, decisiones, feedback y progresión pedagógica.</p></div><div className="game-actions"><a className="btn btn-coral" href="#bosque-inferencias"><Play size={18}/> Jugar Bosque</a><a className="btn btn-soft" href="#feria-matematica"><Calculator size={18}/> Jugar Feria</a></div></section>

  <section className="approved-panel" style={{marginBottom:24}}>
   <div className="approved-panel-heading"><div><span className="eyebrow">Catálogo 3D</span><h2>12 mundos pedagógicos</h2><p>Las experiencias sólo se marcan disponibles cuando existe una escena interactiva real con alternativa accesible.</p></div><span className="control-chip"><Gamepad2 size={16}/> {playableCount} jugables · {gameExperiences.length-playableCount} en desarrollo</span></div>
   <div className="game-experience-catalog">{gameExperiences.map(game=>{const Icon=subjectIcon(game.subject);return <article key={game.id} className={'game-experience-card '+(game.status==='playable'?'is-playable':'is-development')}>
    <div className="game-experience-top"><span className="game-experience-icon"><Icon/></span><span className="game-status-badge">{game.status==='playable'?'Disponible ahora':'En desarrollo'}</span></div>
    <small>{game.world} · {game.subject}</small><h3>{game.title}</h3><p>{game.mission}</p>
    <div className="game-experience-meta"><span><b>Nivel</b>{game.levels}</span><span><b>Habilidad</b>{game.skill}</span></div>
    <div className="game-access-tags">{game.accessibility.map(item=><span key={item}>{item}</span>)}</div>
    {game.status==='playable'&&game.route?<a href={game.route} className="game-card-action">Entrar a la misión <ArrowRight size={16}/></a>:<span className="game-card-action muted"><Lock size={15}/> Escena pendiente de construcción</span>}
   </article>})}</div>
  </section>

  <section id="bosque-inferencias" className="game-premium-head"><div><span className="eyebrow">WebGL 3D · Lenguaje · 3.º básico</span><h2>Bosque de las inferencias</h2><p>Cinco niveles progresivos, narración, apoyos accesibles, dificultad adaptativa y analítica docente.</p></div><div className="game-actions"><button className="btn btn-coral" onClick={()=>setRunning(v=>!v)}>{running?<Pause size={18}/>:<Play size={18}/>} {running?'Pausar':'Comenzar misión'}</button><button className="btn btn-soft" onClick={reset}><RotateCcw size={17}/> Reiniciar</button></div></section>
  <div className="level-rail">{levels.map((l,i)=><div key={l.id} className={'level-step '+(i===level?'active ':'')+(i<level?'done ':'')+(i>level?'locked':'')}><span>{i<level?<CheckCircle2 size={18}/>:i>level?<Lock size={16}/>:l.id}</span><div><b>{l.name}</b><small>{l.skill}</small></div></div>)}</div>
  <div className="tool-row"><button className="control-chip" onClick={()=>setSound(v=>!v)}>{sound?<Volume2 size={16}/>:<VolumeX size={16}/>} {sound?'Audio activo':'Audio desactivado'}</button><button className="control-chip" onClick={()=>setReduced(v=>!v)}><Sparkles size={16}/>{reduced?'Movimiento reducido':'Animaciones activas'}</button><button className="control-chip" onClick={()=>setContrast(v=>!v)}><Eye size={16}/>{contrast?'Contraste alto':'Contraste estándar'}</button><span className="control-chip"><Keyboard size={16}/>Teclado y foco visibles</span><span className="control-chip"><Star size={16}/>{stars}/5 logros</span></div>
  <div className="game-layout premium-game-grid">
   <section className="immersive-stage premium-3d-card"><div className="game-hud"><span>Nivel {current.id}: {current.name}</span><div className="hud-progress"><i style={{width:progress+'%'}}/></div><b>{found.length}/{current.goal} pistas</b></div><Bosque3D onSelect={select} active={found} reducedMotion={reduced} highContrast={contrast}/><div className="mission"><b>Misión:</b> explora, escucha y responde usando evidencia.<div className="feedback-box" role="status" aria-live="polite">{feedback}</div></div></section>
   <aside className="panel challenge-panel"><span className="eyebrow">{current.skill}</span><h2>{current.question}</h2><div className="answer-stack">{current.answers.map((a,i)=><button key={a} disabled={!unlocked} onClick={()=>choose(i)} className={'answer-card '+(answer===i?(i===current.correct?'correct':'wrong'):'')}>{String.fromCharCode(65+i)}. {a}</button>)}</div>{!unlocked&&<div className="locked-note"><Lock size={16}/> Encuentra {current.goal-found.length} pista(s) más.</div>}<button className="btn btn-primary next-level" disabled={!correct} onClick={next}>{level===levels.length-1?'Finalizar misión':'Ir al siguiente nivel'}</button><div className="teacher-live"><h3>Analítica docente</h3><div className="metric-grid"><div><strong>{attempts}</strong><span>intentos</span></div><div><strong>{accuracy}%</strong><span>precisión</span></div><div><strong>{sound?'Sí':'No'}</strong><span>narración</span></div><div><strong>{current.id}/5</strong><span>complejidad</span></div></div><div className="accessibility-summary"><Accessibility size={18}/><span>Alternativa textual, lector de pantalla, reducción de movimiento y alto contraste disponibles.</span></div><div className="difficulty-note"><Brain size={18}/><span>La dificultad progresa desde localizar hasta transferir el aprendizaje.</span></div></div></aside>
  </div>
  <FeriaMatematica3D reducedMotion={reduced} highContrast={contrast}/>
 </AppShell>
}
