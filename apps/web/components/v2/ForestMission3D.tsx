'use client'

import {useEffect,useMemo,useRef,useState} from 'react'
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gamepad2,
  Headphones,
  Lightbulb,
  Map,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'
import {getImmersiveWorld,immersiveWorlds,type ImmersiveMission,type ImmersiveWorld} from '@/lib/immersive/game-content'

type SceneApi={
  focus:(target:ImmersiveMission['targetObject'])=>void
  reset:()=>void
  setPaused:(paused:boolean)=>void
  dispose:()=>void
}

export function ForestMission3D(){
  const mountRef=useRef<HTMLDivElement|null>(null)
  const sceneApi=useRef<SceneApi|null>(null)
  const startedAt=useRef(Date.now())
  const ambientRef=useRef<{context:AudioContext;nodes:AudioNode[]}|null>(null)
  const [worldId,setWorldId]=useState(immersiveWorlds[0].id)
  const [running,setRunning]=useState(true)
  const [sound,setSound]=useState(true)
  const [ambient,setAmbient]=useState(false)
  const [mission,setMission]=useState(0)
  const [selected,setSelected]=useState<number|null>(null)
  const [score,setScore]=useState(0)
  const [correct,setCorrect]=useState(0)
  const [answered,setAnswered]=useState(0)
  const [hint,setHint]=useState(false)
  const [guideOpen,setGuideOpen]=useState(true)
  const [syncStatus,setSyncStatus]=useState<'idle'|'saving'|'saved'>('idle')
  const [explored,setExplored]=useState<string[]>([])

  const world=useMemo(()=>getImmersiveWorld(worldId),[worldId])
  const current=world.missions[mission]
  const progress=Math.round(((mission+(selected!==null?1:0))/world.missions.length)*100)

  useEffect(()=>{
    setMission(0);setSelected(null);setHint(false);setScore(0);setCorrect(0);setAnswered(0);setExplored([])
    startedAt.current=Date.now()
  },[worldId])

  useEffect(()=>{
    let disposed=false
    let renderer:any,scene:any,camera:any,frame=0,clock:any,character:any,guide:any,particles:any
    const keys=new Set<string>()
    const host=mountRef.current
    if(!host)return

    import('three').then(THREE=>{
      if(disposed||!host)return
      scene=new THREE.Scene()
      scene.background=new THREE.Color(world.sky)
      scene.fog=new THREE.Fog(world.fog,9,34)
      camera=new THREE.PerspectiveCamera(52,host.clientWidth/host.clientHeight,.1,120)
      camera.position.set(0,5.2,12)

      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75))
      renderer.setSize(host.clientWidth,host.clientHeight)
      renderer.shadowMap.enabled=true
      renderer.shadowMap.type=THREE.PCFSoftShadowMap
      renderer.outputColorSpace=THREE.SRGBColorSpace
      host.replaceChildren(renderer.domElement)

      scene.add(new THREE.HemisphereLight(world.theme==='city'?'#95b8ff':'#9fc1ff',world.ground,2.4))
      const keyLight=new THREE.DirectionalLight(world.theme==='laboratory'?'#b9fff5':'#fff0b8',3.2)
      keyLight.position.set(6,10,5);keyLight.castShadow=true;scene.add(keyLight)
      const accentLight=new THREE.PointLight(world.accent,9,15,2);accentLight.position.set(2.8,2.4,-3);scene.add(accentLight)

      const ground=new THREE.Mesh(new THREE.PlaneGeometry(46,46),new THREE.MeshStandardMaterial({color:world.ground,roughness:.94,metalness:world.theme==='city'?.12:0}))
      ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)

      const pathMaterial=new THREE.MeshStandardMaterial({color:world.theme==='forest'?'#9a744a':world.theme==='city'?'#4c5d7b':'#4f747a',roughness:.75,metalness:world.theme==='city'?.18:0})
      const path=new THREE.Mesh(new THREE.PlaneGeometry(5.2,28),pathMaterial);path.rotation.x=-Math.PI/2;path.position.set(0,.025,-5);scene.add(path)

      const objectMap=new Map<string,any>()
      const addTarget=(name:string,object:any)=>{object.userData.target=name;objectMap.set(name,object);scene.add(object)}

      function buildForest(){
        const treeMat=new THREE.MeshStandardMaterial({color:'#0d5a46',roughness:.9})
        const trunkMat=new THREE.MeshStandardMaterial({color:'#5d382b'})
        for(let i=0;i<24;i++){
          const x=(Math.random()-.5)*31,z=-Math.random()*27+7
          if(Math.abs(x)<3.1)continue
          const tree=new THREE.Group()
          const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.3,2.4,8),trunkMat);trunk.position.y=1.2;trunk.castShadow=true
          const crown1=new THREE.Mesh(new THREE.ConeGeometry(1.4,3.4,9),treeMat);crown1.position.y=3;crown1.castShadow=true
          const crown2=new THREE.Mesh(new THREE.ConeGeometry(1.05,2.7,9),treeMat);crown2.position.y=4.15;crown2.castShadow=true
          tree.add(trunk,crown1,crown2);tree.position.set(x,0,z);scene.add(tree)
        }
      }

      function buildCity(){
        const buildingColors=['#48567e','#35446d','#52688d','#414e70']
        for(let i=0;i<18;i++){
          const x=(i%2===0?-1:1)*(5+Math.random()*9),z=4-Math.floor(i/2)*3.2
          const h=2.5+Math.random()*5
          const building=new THREE.Mesh(new THREE.BoxGeometry(2.4,h,2.4),new THREE.MeshStandardMaterial({color:buildingColors[i%buildingColors.length],metalness:.22,roughness:.58}))
          building.position.set(x,h/2,z);building.castShadow=true;scene.add(building)
          for(let row=0;row<3;row++)for(let col=0;col<2;col++){
            const windowMesh=new THREE.Mesh(new THREE.PlaneGeometry(.35,.28),new THREE.MeshBasicMaterial({color:row===1&&col===0?world.accent:'#ffd66f'}))
            windowMesh.position.set(x+(col?-.42:.42),Math.min(h-.5,.8+row*.75),z+1.21);scene.add(windowMesh)
          }
        }
      }

      function buildLab(){
        for(let i=0;i<12;i++){
          const x=(i%2===0?-1:1)*(4.8+Math.random()*6.5),z=3-Math.floor(i/2)*4
          const station=new THREE.Group()
          const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.25,.55,18),new THREE.MeshStandardMaterial({color:'#335c66',metalness:.4,roughness:.35}))
          const tube=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,2.1,18),new THREE.MeshPhysicalMaterial({color:'#7af4df',transparent:true,opacity:.36,roughness:.1,transmission:.4}))
          tube.position.y=1.3
          const glow=new THREE.PointLight('#66f5dc',2.6,5);glow.position.y=1.5
          station.add(base,tube,glow);station.position.set(x,0,z);scene.add(station)
        }
      }

      if(world.theme==='forest')buildForest();else if(world.theme==='city')buildCity();else buildLab()

      const cabin=new THREE.Group()
      const cabinBody=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.3,2.8),new THREE.MeshStandardMaterial({color:world.theme==='city'?'#5369a5':'#82483f',metalness:world.theme==='city'?.25:0}));cabinBody.position.y=1.15;cabinBody.castShadow=true
      const roof=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.6,4),new THREE.MeshStandardMaterial({color:world.theme==='laboratory'?'#2e8d8d':'#bd6852'}));roof.position.y=2.9;roof.rotation.y=Math.PI/4;roof.castShadow=true
      const litWindow=new THREE.Mesh(new THREE.BoxGeometry(.72,.82,.09),new THREE.MeshStandardMaterial({color:'#fff09a',emissive:'#ffde62',emissiveIntensity:3}));litWindow.position.set(.75,1.45,1.44)
      cabin.add(cabinBody,roof,litWindow);cabin.position.set(4,0,-6);addTarget('cabin',cabin)

      const bridge=new THREE.Group()
      for(let i=0;i<7;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.72,.15,2.8),new THREE.MeshStandardMaterial({color:'#896743'}));plank.position.set((i-3)*.75,.2,-10);plank.rotation.z=(i%2?-.025:.025);bridge.add(plank)}
      addTarget('bridge',bridge)

      const sign=new THREE.Group()
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,2,8),new THREE.MeshStandardMaterial({color:'#705239'}));pole.position.y=1
      const board=new THREE.Mesh(new THREE.BoxGeometry(1.7,.75,.15),new THREE.MeshStandardMaterial({color:'#d8b477'}));board.position.y=1.75
      sign.add(pole,board);sign.position.set(-3,0,-4);addTarget('sign',sign)

      const orb=new THREE.Mesh(new THREE.SphereGeometry(.32,24,24),new THREE.MeshStandardMaterial({color:world.accent,emissive:world.accent,emissiveIntensity:2.8,roughness:.2}))
      orb.position.set(1.5,1,-2);addTarget('orb',orb)

      const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.75),new THREE.MeshStandardMaterial({color:world.accent,emissive:world.accent,emissiveIntensity:1.9,metalness:.2,roughness:.22}))
      crystal.position.set(-3,1.1,-8);addTarget('crystal',crystal)

      character=new THREE.Group()
      const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,24),new THREE.MeshStandardMaterial({color:'#f0ad78'}));head.position.y=2.45
      const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.15,8,16),new THREE.MeshStandardMaterial({color:'#7544e8'}));torso.position.y=1.35
      const legMat=new THREE.MeshStandardMaterial({color:'#2e2a68'})
      const leg1=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.9,10),legMat);leg1.position.set(-.25,.45,0)
      const leg2=leg1.clone();leg2.position.x=.25
      character.add(head,torso,leg1,leg2);character.position.set(0,0,4);scene.add(character)

      guide=new THREE.Group()
      const guideBody=new THREE.Mesh(new THREE.SphereGeometry(.38,20,20),new THREE.MeshStandardMaterial({color:'#d99e58'}))
      const wing1=new THREE.Mesh(new THREE.SphereGeometry(.22,12,12),new THREE.MeshStandardMaterial({color:'#9b673d'}));wing1.scale.set(.5,1.2,.25);wing1.position.x=-.38
      const wing2=wing1.clone();wing2.position.x=.38
      const eyeMat=new THREE.MeshStandardMaterial({color:'#fff8dc',emissive:'#fff3b0',emissiveIntensity:.8})
      const e1=new THREE.Mesh(new THREE.SphereGeometry(.09,12,12),eyeMat);e1.position.set(-.13,.08,.32)
      const e2=e1.clone();e2.position.x=.13
      guide.add(guideBody,wing1,wing2,e1,e2);guide.position.set(-1.6,4.7,-2.5);addTarget('owl',guide)

      const particleGeo=new THREE.BufferGeometry();const count=world.theme==='city'?70:150;const data=new Float32Array(count*3)
      for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*28;data[i*3+1]=Math.random()*8+.4;data[i*3+2]=-Math.random()*24+7}
      particleGeo.setAttribute('position',new THREE.BufferAttribute(data,3))
      particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:world.accent,size:world.theme==='city'?.045:.07,transparent:true,opacity:.78}));scene.add(particles)

      const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2()
      const canvas=renderer.domElement as HTMLCanvasElement
      canvas.tabIndex=0;canvas.setAttribute('aria-label',`Mundo 3D interactivo: ${world.title}`)

      const focus=(target:ImmersiveMission['targetObject'])=>{
        const object=objectMap.get(target);if(!object)return
        const targetPosition=new THREE.Vector3();object.getWorldPosition(targetPosition)
        character.position.x+=(targetPosition.x-character.position.x)*.45
        character.position.z+=(targetPosition.z-character.position.z)*.45
        camera.position.set(targetPosition.x+4,Math.max(4,targetPosition.y+3),targetPosition.z+7)
        camera.lookAt(targetPosition)
        object.scale.setScalar(1.18);setTimeout(()=>object.scale.setScalar(1),500)
        setExplored(current=>current.includes(target)?current:[...current,target])
        playTone(600,.11)
      }

      const onPointer=(event:PointerEvent)=>{
        const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1
        raycaster.setFromCamera(pointer,camera)
        const hits=raycaster.intersectObjects(Array.from(objectMap.values()),true)
        if(!hits.length)return
        let object=hits[0].object
        while(object&&!object.userData.target)object=object.parent
        if(object?.userData.target)focus(object.userData.target)
      }
      const onKeyDown=(event:KeyboardEvent)=>{keys.add(event.key.toLowerCase());if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(event.key.toLowerCase()))event.preventDefault()}
      const onKeyUp=(event:KeyboardEvent)=>keys.delete(event.key.toLowerCase())
      canvas.addEventListener('pointerdown',onPointer);window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp)

      clock=new THREE.Clock()
      const resize=()=>{if(!host||!renderer)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)}
      window.addEventListener('resize',resize)
      const animate=()=>{
        frame=requestAnimationFrame(animate);const delta=Math.min(.035,clock.getDelta());const elapsed=clock.elapsedTime
        if(running){
          const speed=3.1*delta;let moving=false
          if(keys.has('w')||keys.has('arrowup')){character.position.z-=speed;moving=true}
          if(keys.has('s')||keys.has('arrowdown')){character.position.z+=speed;moving=true}
          if(keys.has('a')||keys.has('arrowleft')){character.position.x-=speed;moving=true}
          if(keys.has('d')||keys.has('arrowright')){character.position.x+=speed;moving=true}
          character.position.x=Math.max(-8,Math.min(8,character.position.x));character.position.z=Math.max(-12,Math.min(6,character.position.z))
          character.position.y=moving?Math.abs(Math.sin(elapsed*8))*.08:Math.sin(elapsed*2)*.025
          guide.position.y=4.7+Math.sin(elapsed*1.8)*.25;guide.rotation.y=Math.sin(elapsed)*.35
          orb.position.y=1+Math.sin(elapsed*2)*.18;orb.rotation.y+=delta
          crystal.rotation.y+=delta*.8;crystal.rotation.x=Math.sin(elapsed*.7)*.16
          particles.rotation.y=elapsed*.018
          camera.position.x+=(character.position.x-camera.position.x)*.035
          camera.position.z+=(character.position.z+10-camera.position.z)*.035
          camera.lookAt(character.position.x,1.1,character.position.z-2.2)
        }
        renderer.render(scene,camera)
      }
      animate()

      sceneApi.current={
        focus,
        reset(){character.position.set(0,0,4);camera.position.set(0,5.2,12);camera.lookAt(0,1,-1)},
        setPaused(paused){setRunning(!paused)},
        dispose(){canvas.removeEventListener('pointerdown',onPointer);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp);window.removeEventListener('resize',resize);cancelAnimationFrame(frame);renderer.dispose();canvas.remove()}
      }
      sceneApi.current.focus(current.targetObject)
    })

    return()=>{disposed=true;sceneApi.current?.dispose();sceneApi.current=null}
  },[world.id])

  useEffect(()=>{sceneApi.current?.focus(current.targetObject)},[mission,current.targetObject])
  useEffect(()=>{sceneApi.current?.setPaused(!running)},[running])
  useEffect(()=>()=>stopAmbient(),[])

  function playTone(frequency=440,duration=.12){
    if(!sound||typeof window==='undefined')return
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext
    if(!AudioContextClass)return
    const context=new AudioContextClass();const oscillator=context.createOscillator();const gain=context.createGain()
    oscillator.frequency.value=frequency;oscillator.type='sine';gain.gain.setValueAtTime(.07,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+duration)
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+duration);oscillator.onended=()=>context.close()
  }

  function startAmbient(){
    if(typeof window==='undefined'||ambientRef.current)return
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext;if(!AudioContextClass)return
    const context=new AudioContextClass();const master=context.createGain();master.gain.value=.035;master.connect(context.destination)
    const nodes:AudioNode[]=[master]
    const frequencies=world.theme==='forest'?[110,164,220]:world.theme==='city'?[82,123,246]:[96,144,288]
    frequencies.forEach((frequency,index)=>{const osc=context.createOscillator();const gain=context.createGain();osc.type=index===0?'sine':'triangle';osc.frequency.value=frequency;gain.gain.value=index===0?.55:.18;osc.connect(gain);gain.connect(master);osc.start();nodes.push(osc,gain)})
    const lfo=context.createOscillator();const lfoGain=context.createGain();lfo.frequency.value=.12;lfoGain.gain.value=.018;lfo.connect(lfoGain);lfoGain.connect(master.gain);lfo.start();nodes.push(lfo,lfoGain)
    ambientRef.current={context,nodes};setAmbient(true)
  }
  function stopAmbient(){
    const ambientAudio=ambientRef.current;if(!ambientAudio)return
    ambientAudio.nodes.forEach(node=>{try{if('stop'in node)(node as OscillatorNode).stop()}catch{}});void ambientAudio.context.close();ambientRef.current=null;setAmbient(false)
  }

  function narrate(text:string){
    if(typeof window==='undefined'||!('speechSynthesis'in window))return
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=.88;utterance.pitch=1.02;window.speechSynthesis.speak(utterance)
  }

  async function persist(nextCorrect:number,nextAnswered:number,nextScore:number,nextMission:number){
    const client=createSupabaseBrowserClient();if(!client)return
    setSyncStatus('saving')
    const nextProgress=Math.round(Math.min(100,((nextMission+1)/world.missions.length)*100));const accuracy=nextAnswered?Math.round((nextCorrect/nextAnswered)*100):0
    const minutes=Math.max(1,Math.round((Date.now()-startedAt.current)/60000))
    await client.rpc('record_forest_mission_progress',{p_progress:nextProgress,p_accuracy:accuracy,p_minutes:minutes,p_xp:nextScore,p_correct:nextCorrect,p_total:nextAnswered})
    setSyncStatus('saved');window.setTimeout(()=>setSyncStatus('idle'),1600)
  }

  function choose(index:number){
    if(selected!==null)return
    const isCorrect=index===current.answer;const nextAnswered=answered+1;const nextCorrect=correct+(isCorrect?1:0);const nextScore=score+(isCorrect?current.xp:20)
    setSelected(index);setAnswered(nextAnswered);setCorrect(nextCorrect);setScore(nextScore)
    if(isCorrect){playTone(780,.2);narrate(`¡Muy bien! ${current.evidence}`)}else{playTone(210,.23);narrate(`Revisa las pistas. ${current.hint}`)}
    void persist(nextCorrect,nextAnswered,nextScore,mission)
  }

  function nextMission(){
    if(mission>=world.missions.length-1){setMission(0);setSelected(null);setHint(false);sceneApi.current?.reset();return}
    const next=mission+1;setMission(next);setSelected(null);setHint(false);playTone(540,.11)
  }

  function reset(){setMission(0);setSelected(null);setScore(0);setCorrect(0);setAnswered(0);setHint(false);setExplored([]);startedAt.current=Date.now();sceneApi.current?.reset()}

  return <section className="immersive-engine">
    <header className="immersive-world-tabs">
      <div><span><Gamepad2/> EXPERIENCIAS INMERSIVAS</span><strong>{world.title}</strong><small>{world.subject} · {world.level} · {world.skill}</small></div>
      <nav>{immersiveWorlds.map(item=><button key={item.id} className={item.id===world.id?'active':''} onClick={()=>setWorldId(item.id)}><i style={{background:item.accent}}/>{item.shortTitle}</button>)}</nav>
    </header>

    <div className="mission3d-shell immersive-runtime">
      <div className="mission3d-stage">
        <div ref={mountRef} className="mission3d-canvas"/>
        <div className="mission3d-hud"><span>MISIÓN {mission+1}/{world.missions.length}</span><strong>{score} XP</strong><em>{progress}% completado</em>{syncStatus!=='idle'&&<em>{syncStatus==='saving'?'Guardando...':'Progreso guardado'}</em>}</div>
        <div className="mission3d-controls">
          <button onClick={()=>setRunning(value=>!value)} aria-label={running?'Pausar animación':'Reanudar animación'}>{running?<Pause/>:<Play/>}</button>
          <button onClick={()=>{setSound(value=>!value);if(sound)stopAmbient()}} aria-label={sound?'Silenciar':'Activar sonido'}>{sound?<Volume2/>:<VolumeX/>}</button>
          <button className={ambient?'active':''} onClick={ambient?stopAmbient:startAmbient} aria-label="Activar ambiente sonoro"><Headphones/></button>
          <button onClick={()=>narrate(`${current.title}. ${current.narration}. ${current.question}`)} aria-label="Escuchar misión"><Sparkles/></button>
          <button onClick={reset} aria-label="Reiniciar"><RotateCcw/></button>
        </div>
        <div className="mission3d-map"><Map/><span>{world.ambientLabel}</span><div>{world.missions.map((item,index)=><i key={item.id} className={`${index<mission?'done':''} ${index===mission?'active':''}`}/>)}</div></div>
        <div className="mission3d-instruction"><span><Compass/> Explora con libertad</span><p>Usa WASD o las flechas. Haz clic en objetos iluminados para descubrir evidencias.</p><small>{explored.length} objetos explorados</small></div>
        {guideOpen&&<div className="virtual-guide-overlay"><span className="guide-avatar">🦉</span><div><small>PROFESOR VIRTUAL YOYO</small><strong>{current.title}</strong><p>{current.narration}</p><button onClick={()=>narrate(current.narration)}><Volume2/>Escuchar</button></div><button onClick={()=>setGuideOpen(false)} aria-label="Cerrar guía">×</button></div>}
        {!guideOpen&&<button className="open-guide" onClick={()=>setGuideOpen(true)}>🦉 Profesor virtual</button>}
      </div>

      <aside className="mission3d-panel">
        <span className="mission3d-kicker">{current.objective}</span>
        <h2>{current.title}</h2>
        <p>{current.question}</p>
        <div className="mission3d-options">{current.options.map((option,index)=>{
          const right=selected!==null&&index===current.answer;const wrong=selected===index&&index!==current.answer
          return <button key={option} className={`${right?'correct':''} ${wrong?'wrong':''}`} onClick={()=>choose(index)} disabled={selected!==null}><span>{String.fromCharCode(65+index)}</span>{option}{right&&<CheckCircle2/>}</button>
        })}</div>
        {hint&&<div className="mission3d-hint"><Lightbulb/>{current.hint}</div>}
        {selected!==null&&<div className={`mission-evidence ${selected===current.answer?'correct':'retry'}`}><strong>{selected===current.answer?'Evidencia encontrada':'Revisa la evidencia'}</strong><p>{selected===current.answer?current.evidence:current.hint}</p></div>}
        <div className="mission3d-panel-actions"><button onClick={()=>{setHint(true);sceneApi.current?.focus(current.targetObject)}}><Lightbulb/>Mostrar pista</button><button onClick={nextMission} disabled={selected===null}>{mission===world.missions.length-1?'Reiniciar mundo':'Siguiente misión'}<ChevronRight/></button></div>
        <div className="mission-navigation"><button onClick={()=>{setMission(Math.max(0,mission-1));setSelected(null)}} disabled={mission===0}><ChevronLeft/>Anterior</button><span>{correct}/{answered} respuestas correctas</span></div>
      </aside>
    </div>
  </section>
}
