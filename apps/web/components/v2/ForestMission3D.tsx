'use client'

import {useEffect,useRef,useState} from 'react'
import {CheckCircle2,Headphones,Lightbulb,Pause,Play,RotateCcw,Volume2,VolumeX} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'

type Mission={title:string;question:string;options:string[];answer:number;hint:string}

const missions:Mission[]=[
  {title:'La luz de la cabaña',question:'¿Qué pista permite inferir que alguien está dentro de la cabaña?',options:['La ventana está iluminada','Hay árboles alrededor','La luna está alta'],answer:0,hint:'Observa qué elemento muestra actividad humana.'},
  {title:'El sendero secreto',question:'¿Por qué Luma lleva una linterna?',options:['Porque quiere decorar el bosque','Porque necesita ver en la oscuridad','Porque busca insectos'],answer:1,hint:'Piensa en el momento del día y la visibilidad.'},
  {title:'El mensaje del búho',question:'Si el búho vuela hacia la cabaña, ¿qué puede estar indicando?',options:['Que allí está la siguiente pista','Que quiere dormir','Que empieza a llover'],answer:0,hint:'Relaciona su movimiento con el objetivo de la misión.'}
]

export function ForestMission3D(){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const startedAt=useRef(Date.now())
  const [running,setRunning]=useState(true)
  const [sound,setSound]=useState(true)
  const [mission,setMission]=useState(0)
  const [selected,setSelected]=useState<number|null>(null)
  const [score,setScore]=useState(0)
  const [correct,setCorrect]=useState(0)
  const [answered,setAnswered]=useState(0)
  const [hint,setHint]=useState(false)
  const [syncStatus,setSyncStatus]=useState<'idle'|'saving'|'saved'>('idle')

  useEffect(()=>{
    let disposed=false
    let renderer:any,scene:any,camera:any,frame=0,clock:any,character:any,owl:any,particles:any
    const host=mountRef.current
    if(!host)return

    import('three').then(THREE=>{
      if(disposed||!host)return
      scene=new THREE.Scene()
      scene.background=new THREE.Color('#09152f')
      scene.fog=new THREE.Fog('#09152f',8,28)
      camera=new THREE.PerspectiveCamera(48,host.clientWidth/host.clientHeight,.1,100)
      camera.position.set(0,3.6,9.5)
      camera.lookAt(0,1,0)

      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false})
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,2))
      renderer.setSize(host.clientWidth,host.clientHeight)
      renderer.shadowMap.enabled=true
      host.appendChild(renderer.domElement)

      scene.add(new THREE.HemisphereLight('#799cff','#122a25',2.2))
      const moon=new THREE.DirectionalLight('#fff0a8',2.8)
      moon.position.set(5,8,4);moon.castShadow=true;scene.add(moon)
      const lamp=new THREE.PointLight('#ffd95f',8,12,2);lamp.position.set(2.7,1.8,.5);scene.add(lamp)

      const ground=new THREE.Mesh(new THREE.PlaneGeometry(34,34),new THREE.MeshStandardMaterial({color:'#123a31',roughness:1}))
      ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)

      const path=new THREE.Mesh(new THREE.PlaneGeometry(4,20),new THREE.MeshStandardMaterial({color:'#987044',roughness:1}))
      path.rotation.x=-Math.PI/2;path.rotation.z=-.18;path.position.set(1,.02,-3);scene.add(path)

      const treeMat=new THREE.MeshStandardMaterial({color:'#0d5a46',roughness:.9})
      const trunkMat=new THREE.MeshStandardMaterial({color:'#5d382b'})
      for(let i=0;i<18;i++){
        const x=(Math.random()-.5)*24,z=-Math.random()*20+4
        if(Math.abs(x)<2.4)continue
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.25,2.2,8),trunkMat);trunk.position.set(x,1.1,z);trunk.castShadow=true
        const crown=new THREE.Mesh(new THREE.ConeGeometry(1.2,3.4,9),treeMat);crown.position.set(x,3,z);crown.castShadow=true
        scene.add(trunk,crown)
      }

      const house=new THREE.Group()
      const body=new THREE.Mesh(new THREE.BoxGeometry(3,2.2,2.6),new THREE.MeshStandardMaterial({color:'#81483e'}));body.position.y=1.1;body.castShadow=true
      const roof=new THREE.Mesh(new THREE.ConeGeometry(2.45,1.55,4),new THREE.MeshStandardMaterial({color:'#bd6751'}));roof.position.y=2.8;roof.rotation.y=Math.PI/4;roof.castShadow=true
      const windowMesh=new THREE.Mesh(new THREE.BoxGeometry(.65,.75,.08),new THREE.MeshStandardMaterial({color:'#ffe477',emissive:'#ffd851',emissiveIntensity:2}));windowMesh.position.set(.75,1.45,1.34)
      house.add(body,roof,windowMesh);house.position.set(3,0,-4.5);scene.add(house)

      character=new THREE.Group()
      const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,24),new THREE.MeshStandardMaterial({color:'#f0ad78'}));head.position.y=2.45
      const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.15,8,16),new THREE.MeshStandardMaterial({color:'#7544e8'}));torso.position.y=1.35
      const legMat=new THREE.MeshStandardMaterial({color:'#2e2a68'})
      const leg1=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.9,10),legMat);leg1.position.set(-.25,.45,0)
      const leg2=leg1.clone();leg2.position.x=.25
      const flashlight=new THREE.Mesh(new THREE.CylinderGeometry(.09,.13,.5,10),new THREE.MeshStandardMaterial({color:'#775d3f'}));flashlight.rotation.z=Math.PI/2;flashlight.position.set(.95,1.55,.1)
      character.add(head,torso,leg1,leg2,flashlight);character.position.set(-2,0,2.5);character.rotation.y=-.2;scene.add(character)

      owl=new THREE.Group()
      const owlBody=new THREE.Mesh(new THREE.SphereGeometry(.35,18,18),new THREE.MeshStandardMaterial({color:'#d8a05d'}))
      const eyeMat=new THREE.MeshStandardMaterial({color:'#fff8dc',emissive:'#fff3b0',emissiveIntensity:.8})
      const e1=new THREE.Mesh(new THREE.SphereGeometry(.09,12,12),eyeMat);e1.position.set(-.13,.08,.3)
      const e2=e1.clone();e2.position.x=.13
      owl.add(owlBody,e1,e2);owl.position.set(-1.2,4.7,-2.5);scene.add(owl)

      const particleGeo=new THREE.BufferGeometry();const count=110;const data=new Float32Array(count*3)
      for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*24;data[i*3+1]=Math.random()*7+.4;data[i*3+2]=-Math.random()*18+4}
      particleGeo.setAttribute('position',new THREE.BufferAttribute(data,3))
      particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:'#ffe96b',size:.06,transparent:true,opacity:.85}));scene.add(particles)
      clock=new THREE.Clock()

      const resize=()=>{if(!host||!renderer)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)}
      window.addEventListener('resize',resize)
      const animate=()=>{frame=requestAnimationFrame(animate);const t=clock.getElapsedTime();if(running){character.position.y=Math.sin(t*2.2)*.04;character.rotation.y=-.2+Math.sin(t*.7)*.08;owl.position.y=4.7+Math.sin(t*1.8)*.22;owl.rotation.y=Math.sin(t)*.3;particles.rotation.y=t*.025;camera.position.x=Math.sin(t*.18)*.25;camera.lookAt(0,1,-1.2)}renderer.render(scene,camera)}
      animate()
      ;(renderer.domElement as HTMLCanvasElement).tabIndex=0
      ;(renderer.domElement as HTMLCanvasElement).setAttribute('aria-label','Escenario 3D interactivo del Bosque Mágico')
      ;(renderer.domElement as HTMLCanvasElement).onclick=()=>{owl.position.x*=-1;playTone(620,.08)}
      return()=>window.removeEventListener('resize',resize)
    })

    return()=>{disposed=true;cancelAnimationFrame(frame);if(renderer){renderer.dispose();renderer.domElement?.remove()}}
  },[running])

  function playTone(frequency=440,duration=.12){
    if(!sound||typeof window==='undefined')return
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext
    if(!AudioContextClass)return
    const context=new AudioContextClass();const oscillator=context.createOscillator();const gain=context.createGain()
    oscillator.frequency.value=frequency;oscillator.type='sine';gain.gain.setValueAtTime(.08,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+duration)
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+duration)
  }

  function narrate(text:string){
    if(typeof window==='undefined'||!('speechSynthesis'in window))return
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.92;window.speechSynthesis.speak(utterance)
  }

  async function persist(nextCorrect:number,nextAnswered:number,nextScore:number,nextMission:number){
    const client=createSupabaseBrowserClient()
    if(!client)return
    setSyncStatus('saving')
    const progress=Math.round(Math.min(100,((nextMission+1)/missions.length)*100))
    const accuracy=nextAnswered?Math.round((nextCorrect/nextAnswered)*100):0
    const minutes=Math.max(1,Math.round((Date.now()-startedAt.current)/60000))
    await client.rpc('record_forest_mission_progress',{p_progress:progress,p_accuracy:accuracy,p_minutes:minutes,p_xp:nextScore,p_correct:nextCorrect,p_total:nextAnswered})
    setSyncStatus('saved')
    window.setTimeout(()=>setSyncStatus('idle'),1800)
  }

  function choose(index:number){
    if(selected!==null)return
    const isCorrect=index===missions[mission].answer
    const nextAnswered=answered+1
    const nextCorrect=correct+(isCorrect?1:0)
    const nextScore=score+(isCorrect?100:0)
    setSelected(index);setAnswered(nextAnswered);setCorrect(nextCorrect);setScore(nextScore)
    if(isCorrect){playTone(760,.18);narrate('¡Muy bien! Encontraste la pista correcta.')}
    else{playTone(210,.22);narrate('Inténtalo nuevamente. Revisa las pistas del escenario.')}
    void persist(nextCorrect,nextAnswered,nextScore,mission)
  }

  function nextMission(){const next=(mission+1)%missions.length;setMission(next);setSelected(null);setHint(false);playTone(520,.1)}
  const current=missions[mission]

  return <section className="mission3d-shell">
    <div className="mission3d-stage">
      <div ref={mountRef} className="mission3d-canvas"/>
      <div className="mission3d-hud"><span>MISIÓN {mission+1}/{missions.length}</span><strong>{score} XP</strong>{syncStatus!=='idle'&&<em>{syncStatus==='saving'?'Guardando...':'Progreso guardado'}</em>}</div>
      <div className="mission3d-controls">
        <button onClick={()=>setRunning(value=>!value)} aria-label={running?'Pausar animación':'Reanudar animación'}>{running?<Pause/>:<Play/>}</button>
        <button onClick={()=>setSound(value=>!value)} aria-label={sound?'Silenciar':'Activar sonido'}>{sound?<Volume2/>:<VolumeX/>}</button>
        <button onClick={()=>narrate(`${current.title}. ${current.question}`)} aria-label="Escuchar misión"><Headphones/></button>
        <button onClick={()=>{setMission(0);setSelected(null);setScore(0);setCorrect(0);setAnswered(0);setHint(false);startedAt.current=Date.now()}} aria-label="Reiniciar"><RotateCcw/></button>
      </div>
      <div className="mission3d-instruction"><span>Explora</span><p>Haz clic en el escenario para mover al búho y descubrir pistas.</p></div>
    </div>

    <aside className="mission3d-panel">
      <span className="mission3d-kicker">DESAFÍO DE COMPRENSIÓN</span>
      <h2>{current.title}</h2>
      <p>{current.question}</p>
      <div className="mission3d-options">{current.options.map((option,index)=>{
        const right=selected!==null&&index===current.answer
        const wrong=selected===index&&index!==current.answer
        return <button key={option} className={`${right?'correct':''} ${wrong?'wrong':''}`} onClick={()=>choose(index)} disabled={selected!==null}><span>{String.fromCharCode(65+index)}</span>{option}{right&&<CheckCircle2/>}</button>
      })}</div>
      {hint&&<div className="mission3d-hint"><Lightbulb/>{current.hint}</div>}
      <div className="mission3d-panel-actions"><button onClick={()=>setHint(true)}><Lightbulb/>Ver pista</button><button onClick={nextMission} disabled={selected===null}>Siguiente misión</button></div>
    </aside>
  </section>
}
