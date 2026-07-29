'use client'

import {useEffect,useMemo,useRef,useState} from 'react'
import {
  Accessibility,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Compass,
  Eye,
  Gamepad2,
  Headphones,
  Lightbulb,
  Map,
  Pause,
  Play,
  RotateCcw,
  Settings2,
  Sparkles,
  Volume2,
  VolumeX
} from 'lucide-react'
import {createSupabaseBrowserClient} from '@/lib/supabase/client'
import {getImmersiveWorld,immersiveWorlds,type ImmersiveMission} from '@/lib/immersive/game-content'

type SceneApi={
  focus:(target:ImmersiveMission['targetObject'])=>void
  reset:()=>void
  setPaused:(paused:boolean)=>void
  dispose:()=>void
}

type AccessibilitySettings={
  reducedMotion:boolean
  highContrast:boolean
  largeText:boolean
  captions:boolean
  guided:boolean
}

const defaultAccessibility:AccessibilitySettings={
  reducedMotion:false,
  highContrast:false,
  largeText:false,
  captions:true,
  guided:true
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
  const [accessibilityOpen,setAccessibilityOpen]=useState(false)
  const [accessibility,setAccessibility]=useState(defaultAccessibility)
  const [narrationRate,setNarrationRate]=useState(.9)

  const world=useMemo(()=>getImmersiveWorld(worldId),[worldId])
  const current=world.missions[mission]
  const progress=Math.round(((mission+(selected!==null?1:0))/world.missions.length)*100)

  useEffect(()=>{
    const media=window.matchMedia?.('(prefers-reduced-motion: reduce)')
    if(media?.matches)setAccessibility(currentSettings=>({...currentSettings,reducedMotion:true}))
  },[])

  useEffect(()=>{
    setMission(0);setSelected(null);setHint(false);setScore(0);setCorrect(0);setAnswered(0);setExplored([])
    startedAt.current=Date.now()
  },[worldId])

  useEffect(()=>{
    if(accessibility.guided){setGuideOpen(true);setHint(true)}
  },[accessibility.guided,mission])

  useEffect(()=>{
    let disposed=false
    let renderer:any,scene:any,camera:any,frame=0,clock:any,character:any,guide:any,particles:any
    const keys=new Set<string>()
    const host=mountRef.current
    if(!host)return

    import('three').then(THREE=>{
      if(disposed||!host)return
      scene=new THREE.Scene()
      scene.background=new THREE.Color(accessibility.highContrast?'#020817':world.sky)
      scene.fog=new THREE.Fog(accessibility.highContrast?'#06111f':world.fog,accessibility.highContrast?15:9,accessibility.highContrast?42:34)
      camera=new THREE.PerspectiveCamera(52,host.clientWidth/host.clientHeight,.1,120)
      camera.position.set(0,5.2,12)

      renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75))
      renderer.setSize(host.clientWidth,host.clientHeight)
      renderer.shadowMap.enabled=true
      renderer.shadowMap.type=THREE.PCFSoftShadowMap
      renderer.outputColorSpace=THREE.SRGBColorSpace
      renderer.toneMapping=THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure=accessibility.highContrast?1.35:1.08
      host.replaceChildren(renderer.domElement)

      scene.add(new THREE.HemisphereLight(world.theme==='city'?'#a9c8ff':'#b7d7ff',accessibility.highContrast?'#06110d':world.ground,accessibility.highContrast?3.3:2.4))
      const keyLight=new THREE.DirectionalLight(world.theme==='laboratory'?'#cafff7':'#fff4c8',accessibility.highContrast?4.6:3.2)
      keyLight.position.set(6,10,5);keyLight.castShadow=true;scene.add(keyLight)
      const accentLight=new THREE.PointLight(world.accent,accessibility.highContrast?14:9,17,2);accentLight.position.set(2.8,2.4,-3);scene.add(accentLight)

      const ground=new THREE.Mesh(new THREE.PlaneGeometry(46,46),new THREE.MeshStandardMaterial({color:world.ground,roughness:.94,metalness:world.theme==='city'?.12:0}))
      ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)

      const pathMaterial=new THREE.MeshStandardMaterial({color:world.theme==='forest'?'#b89562':world.theme==='city'?'#64779a':'#5d8990',roughness:.72,metalness:world.theme==='city'?.18:0})
      const path=new THREE.Mesh(new THREE.PlaneGeometry(5.2,28),pathMaterial);path.rotation.x=-Math.PI/2;path.position.set(0,.025,-5);scene.add(path)

      const objectMap=new globalThis.Map<string,any>()
      const addTarget=(name:string,object:any)=>{object.userData.target=name;objectMap.set(name,object);scene.add(object)}

      function buildForest(){
        const treeColors=['#12634d','#17755a','#0e5543','#1b6c55']
        const trunkMat=new THREE.MeshStandardMaterial({color:'#654132',roughness:.92})
        for(let i=0;i<30;i++){
          const x=(Math.random()-.5)*31,z=-Math.random()*27+7
          if(Math.abs(x)<3.1)continue
          const tree=new THREE.Group()
          const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.32,2.5,10),trunkMat);trunk.position.y=1.25;trunk.castShadow=true
          const treeMat=new THREE.MeshStandardMaterial({color:treeColors[i%treeColors.length],roughness:.88})
          const crown1=new THREE.Mesh(new THREE.ConeGeometry(1.45,3.5,10),treeMat);crown1.position.y=3;crown1.castShadow=true
          const crown2=new THREE.Mesh(new THREE.ConeGeometry(1.08,2.8,10),treeMat);crown2.position.y=4.18;crown2.castShadow=true
          tree.add(trunk,crown1,crown2);tree.position.set(x,0,z);tree.rotation.y=Math.random()*Math.PI;scene.add(tree)
        }
      }

      function buildCity(){
        const buildingColors=['#526795','#405783','#6381a5','#495f89']
        for(let i=0;i<18;i++){
          const x=(i%2===0?-1:1)*(5+Math.random()*9),z=4-Math.floor(i/2)*3.2
          const h=2.5+Math.random()*5
          const building=new THREE.Mesh(new THREE.BoxGeometry(2.4,h,2.4),new THREE.MeshStandardMaterial({color:buildingColors[i%buildingColors.length],metalness:.28,roughness:.48}))
          building.position.set(x,h/2,z);building.castShadow=true;scene.add(building)
          for(let row=0;row<3;row++)for(let col=0;col<2;col++){
            const windowMesh=new THREE.Mesh(new THREE.PlaneGeometry(.35,.28),new THREE.MeshBasicMaterial({color:row===1&&col===0?world.accent:'#ffe18a'}))
            windowMesh.position.set(x+(col?-.42:.42),Math.min(h-.5,.8+row*.75),z+1.21);scene.add(windowMesh)
          }
        }
      }

      function buildLab(){
        for(let i=0;i<12;i++){
          const x=(i%2===0?-1:1)*(4.8+Math.random()*6.5),z=3-Math.floor(i/2)*4
          const station=new THREE.Group()
          const base=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.25,.55,18),new THREE.MeshStandardMaterial({color:'#3c6f79',metalness:.42,roughness:.3}))
          const tube=new THREE.Mesh(new THREE.CylinderGeometry(.45,.45,2.1,18),new THREE.MeshPhysicalMaterial({color:'#7af4df',transparent:true,opacity:.42,roughness:.08,transmission:.45}))
          tube.position.y=1.3
          const glow=new THREE.PointLight('#66f5dc',3.4,6);glow.position.y=1.5
          station.add(base,tube,glow);station.position.set(x,0,z);scene.add(station)
        }
      }

      if(world.theme==='forest')buildForest();else if(world.theme==='city')buildCity();else buildLab()

      const cabin=new THREE.Group()
      const cabinBody=new THREE.Mesh(new THREE.BoxGeometry(3.2,2.3,2.8),new THREE.MeshStandardMaterial({color:world.theme==='city'?'#6079b1':'#9a584a',metalness:world.theme==='city'?.25:0,roughness:.7}));cabinBody.position.y=1.15;cabinBody.castShadow=true
      const roof=new THREE.Mesh(new THREE.ConeGeometry(2.6,1.6,4),new THREE.MeshStandardMaterial({color:world.theme==='laboratory'?'#36a3a1':'#d0755c',roughness:.7}));roof.position.y=2.9;roof.rotation.y=Math.PI/4;roof.castShadow=true
      const litWindow=new THREE.Mesh(new THREE.BoxGeometry(.72,.82,.09),new THREE.MeshStandardMaterial({color:'#fff3a9',emissive:'#ffdf67',emissiveIntensity:4.2}));litWindow.position.set(.75,1.45,1.44)
      const door=new THREE.Mesh(new THREE.BoxGeometry(.72,1.25,.1),new THREE.MeshStandardMaterial({color:'#4b3033'}));door.position.set(-.55,.63,1.45)
      cabin.add(cabinBody,roof,litWindow,door);cabin.position.set(4,0,-6);addTarget('cabin',cabin)

      const bridge=new THREE.Group()
      for(let i=0;i<7;i++){const plank=new THREE.Mesh(new THREE.BoxGeometry(.72,.15,2.8),new THREE.MeshStandardMaterial({color:'#9a7650',roughness:.88}));plank.position.set((i-3)*.75,.2,-10);plank.rotation.z=(i%2?-.025:.025);bridge.add(plank)}
      addTarget('bridge',bridge)

      const sign=new THREE.Group()
      const pole=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,2,8),new THREE.MeshStandardMaterial({color:'#76583e'}));pole.position.y=1
      const board=new THREE.Mesh(new THREE.BoxGeometry(1.7,.75,.15),new THREE.MeshStandardMaterial({color:'#e2bf83'}));board.position.y=1.75
      sign.add(pole,board);sign.position.set(-3,0,-4);addTarget('sign',sign)

      const orb=new THREE.Mesh(new THREE.SphereGeometry(.32,24,24),new THREE.MeshStandardMaterial({color:world.accent,emissive:world.accent,emissiveIntensity:3.4,roughness:.15}))
      orb.position.set(1.5,1,-2);addTarget('orb',orb)

      const crystal=new THREE.Mesh(new THREE.OctahedronGeometry(.75),new THREE.MeshStandardMaterial({color:world.accent,emissive:world.accent,emissiveIntensity:2.5,metalness:.28,roughness:.18}))
      crystal.position.set(-3,1.1,-8);addTarget('crystal',crystal)

      character=new THREE.Group()
      const skin=new THREE.MeshStandardMaterial({color:'#f0ad78',roughness:.58})
      const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,24),skin);head.position.y=2.45
      const hair=new THREE.Mesh(new THREE.SphereGeometry(.5,22,18,0,Math.PI*2,0,Math.PI/1.9),new THREE.MeshStandardMaterial({color:'#34273f'}));hair.position.y=2.63
      const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.62,1.15,8,16),new THREE.MeshStandardMaterial({color:'#8152ec',roughness:.5}));torso.position.y=1.35
      const backpack=new THREE.Mesh(new THREE.BoxGeometry(.48,.75,.28),new THREE.MeshStandardMaterial({color:'#e5a83e'}));backpack.position.set(0,1.45,-.52)
      const legMat=new THREE.MeshStandardMaterial({color:'#312c6d'})
      const leg1=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.9,10),legMat);leg1.position.set(-.25,.45,0)
      const leg2=leg1.clone();leg2.position.x=.25
      const eyeMat=new THREE.MeshBasicMaterial({color:'#272230'})
      const eye1=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),eyeMat);eye1.position.set(-.14,2.48,.45)
      const eye2=eye1.clone();eye2.position.x=.14
      character.add(head,hair,torso,backpack,leg1,leg2,eye1,eye2);character.position.set(0,0,4);scene.add(character)

      guide=new THREE.Group()
      const robotWhite=new THREE.MeshStandardMaterial({color:'#eef3ff',metalness:.35,roughness:.22})
      const robotPurple=new THREE.MeshStandardMaterial({color:'#7b4ce9',emissive:'#4420a0',emissiveIntensity:.5,metalness:.32})
      const guideBody=new THREE.Mesh(new THREE.SphereGeometry(.42,22,22),robotWhite);guideBody.scale.set(1,1.12,.86)
      const face=new THREE.Mesh(new THREE.SphereGeometry(.31,20,20),robotPurple);face.position.z=.25;face.scale.set(1,.72,.38)
      const eyeGlow=new THREE.MeshBasicMaterial({color:'#7ff8e8'})
      const e1=new THREE.Mesh(new THREE.SphereGeometry(.045,10,10),eyeGlow);e1.position.set(-.11,.05,.53)
      const e2=e1.clone();e2.position.x=.11
      const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.3,8),robotPurple);antenna.position.y=.52
      const antennaOrb=new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),eyeGlow);antennaOrb.position.y=.7
      guide.add(guideBody,face,e1,e2,antenna,antennaOrb);guide.position.set(-1.6,4.7,-2.5);addTarget('owl',guide)

      const particleGeo=new THREE.BufferGeometry();const count=world.theme==='city'?85:175;const data=new Float32Array(count*3)
      for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*28;data[i*3+1]=Math.random()*8+.4;data[i*3+2]=-Math.random()*24+7}
      particleGeo.setAttribute('position',new THREE.BufferAttribute(data,3))
      particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:world.accent,size:world.theme==='city'?.05:.08,transparent:true,opacity:.84,depthWrite:false}));scene.add(particles)

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
        setExplored(currentTargets=>currentTargets.includes(target)?currentTargets:[...currentTargets,target])
        playTone(600,.11)
      }

      const onPointer=(event:PointerEvent)=>{
        const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1
        raycaster.setFromCamera(pointer,camera)
        const hits=raycaster.intersectObjects(Array.from(objectMap.values()),true)
        if(!hits.length)return
        let object:any=hits[0]?.object??null
        while(object&&!object.userData.target)object=object.parent
        if(object?.userData.target)focus(object.userData.target)
      }
      const onKeyDown=(event:KeyboardEvent)=>{keys.add(event.key.toLowerCase());if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(event.key.toLowerCase()))event.preventDefault()}
      const onKeyUp=(event:KeyboardEvent)=>keys.delete(event.key.toLowerCase())
      canvas.addEventListener('pointerdown',onPointer);window.addEventListener('keydown',onKeyDown);window.addEventListener('keyup',onKeyUp)

      clock=new THREE.Clock()
      const resize=()=>{if(!host||!renderer)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)}
      const animate=()=>{
        frame=requestAnimationFrame(animate)
        const delta=Math.min(clock.getDelta(),.04),elapsed=clock.elapsedTime
        if(running){
          const speed=5.2*delta
          if(keys.has('w')||keys.has('arrowup'))character.position.z-=speed
          if(keys.has('s')||keys.has('arrowdown'))character.position.z+=speed
          if(keys.has('a')||keys.has('arrowleft'))character.position.x-=speed
          if(keys.has('d')||keys.has('arrowright'))character.position.x+=speed
          character.position.x=Math.max(-13,Math.min(13,character.position.x));character.position.z=Math.max(-17,Math.min(8,character.position.z))
          if(!accessibility.reducedMotion){
            character.position.y=Math.abs(Math.sin(elapsed*6))*0.045
            guide.position.y=4.7+Math.sin(elapsed*1.8)*.28;guide.rotation.y=Math.sin(elapsed*.8)*.25
            orb.position.y=1+Math.sin(elapsed*2.2)*.2;orb.rotation.y+=delta
            crystal.rotation.y+=delta*.65;particles.rotation.y+=delta*.018
          }
          camera.position.x+=(character.position.x-camera.position.x)*(accessibility.reducedMotion?.08:.035)
          camera.position.z+=(character.position.z+11-camera.position.z)*(accessibility.reducedMotion?.06:.025)
          camera.lookAt(character.position.x,1.3,character.position.z-4)
        }
        renderer.render(scene,camera)
      }
      window.addEventListener('resize',resize);animate()

      sceneApi.current={focus,reset:()=>{character.position.set(0,0,4);camera.position.set(0,5.2,12);camera.lookAt(0,1,-2)},setPaused:(paused:boolean)=>setRunning(!paused),dispose:()=>{}}
      return()=>{window.removeEventListener('resize',resize);canvas.removeEventListener('pointerdown',onPointer);window.removeEventListener('keydown',onKeyDown);window.removeEventListener('keyup',onKeyUp)}
    }).catch(()=>{if(host)host.innerHTML='<div class="webgl-fallback"><strong>Vista 3D no disponible</strong><span>Tu navegador puede continuar con las actividades y narraciones.</span></div>'})

    return()=>{disposed=true;cancelAnimationFrame(frame);sceneApi.current=null;if(renderer){renderer.dispose();renderer.domElement?.remove()}}
  },[world,running,accessibility.reducedMotion,accessibility.highContrast])

  useEffect(()=>{sceneApi.current?.focus(current.targetObject)},[current.targetObject])

  function playTone(frequency=520,duration=.16){
    if(!sound||typeof window==='undefined')return
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext;if(!AudioContextClass)return
    const context=new AudioContextClass();const oscillator=context.createOscillator();const gain=context.createGain()
    oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(.055,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+duration)
    oscillator.connect(gain);gain.connect(context.destination);oscillator.start();oscillator.stop(context.currentTime+duration);oscillator.onended=()=>context.close()
  }

  function toggleAmbient(){
    if(ambientRef.current){ambientRef.current.nodes.forEach(node=>{try{(node as OscillatorNode).stop?.()}catch{}});ambientRef.current.context.close();ambientRef.current=null;setAmbient(false);return}
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext;if(!AudioContextClass)return
    const context=new AudioContextClass();const master=context.createGain();master.gain.value=.018;master.connect(context.destination)
    const nodes:AudioNode[]=[]
    ;[world.theme==='forest'?174:world.theme==='city'?130:220,world.theme==='forest'?261:195].forEach((frequency,index)=>{const osc=context.createOscillator();const gain=context.createGain();osc.type=index?'sine':'triangle';osc.frequency.value=frequency;gain.gain.value=index?.28:.22;osc.connect(gain);gain.connect(master);osc.start();nodes.push(osc,gain)})
    ambientRef.current={context,nodes};setAmbient(true)
  }

  function speak(text=current.narration){
    if(!sound||typeof window==='undefined'||!('speechSynthesis'in window))return
    window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(text);utterance.lang='es-CL';utterance.rate=narrationRate;utterance.pitch=1.04;window.speechSynthesis.speak(utterance)
  }

  async function persist(nextMission:number,nextCorrect:number,nextAnswered:number,nextScore:number){
    const client=createSupabaseBrowserClient();if(!client)return
    setSyncStatus('saving')
    const accuracy=nextAnswered?Math.round(nextCorrect/nextAnswered*100):0
    const minutes=Math.max(1,Math.round((Date.now()-startedAt.current)/60000))
    await client.rpc('record_forest_mission_progress',{p_progress:Math.round(nextMission/world.missions.length*100),p_accuracy:accuracy,p_minutes:minutes,p_xp:nextScore,p_correct:nextCorrect,p_total:nextAnswered})
    setSyncStatus('saved')
  }

  function answer(index:number){
    if(selected!==null)return
    const isCorrect=index===current.correct
    const nextCorrect=correct+(isCorrect?1:0),nextAnswered=answered+1,nextScore=score+(isCorrect?current.xp:5)
    setSelected(index);setCorrect(nextCorrect);setAnswered(nextAnswered);setScore(nextScore);playTone(isCorrect?720:220,isCorrect?.22:.3);persist(mission+1,nextCorrect,nextAnswered,nextScore)
  }

  function next(){if(mission<world.missions.length-1){setMission(value=>value+1);setSelected(null);setHint(accessibility.guided)}}
  function previous(){if(mission>0){setMission(value=>value-1);setSelected(null);setHint(accessibility.guided)}}
  function reset(){setMission(0);setSelected(null);setHint(accessibility.guided);setScore(0);setCorrect(0);setAnswered(0);setExplored([]);startedAt.current=Date.now();sceneApi.current?.reset()}
  function toggleAccessibility(key:keyof AccessibilitySettings){setAccessibility(currentSettings=>({...currentSettings,[key]:!currentSettings[key]}))}

  const shellClasses=['immersive-engine-shell',accessibility.highContrast?'immersive-high-contrast':'',accessibility.largeText?'immersive-large-text':'',accessibility.reducedMotion?'immersive-reduced-motion':''].filter(Boolean).join(' ')

  return <section className={shellClasses}>
    <header className="world-selector-bar">
      <div><span className="module-eyebrow"><Sparkles size={15}/> Motor inmersivo curricular</span><h1>Explora, escucha y aprende en 3D</h1><p>Tres mundos, quince misiones y evidencia pedagógica en tiempo real.</p></div>
      <div className="world-tabs">{immersiveWorlds.map(item=><button key={item.id} className={item.id===worldId?'active':''} onClick={()=>setWorldId(item.id)}><span>{item.emoji}</span><div><strong>{item.title}</strong><small>{item.subject} · {item.level}</small></div></button>)}</div>
    </header>

    <div className="immersive-accessibility-bar">
      <div><span><Accessibility/></span><div><strong>Accesibilidad dentro del juego</strong><small>La configuración se aplica inmediatamente a la escena y las actividades.</small></div></div>
      <button onClick={()=>setAccessibilityOpen(value=>!value)}><Settings2/>{accessibilityOpen?'Cerrar ajustes':'Personalizar experiencia'}</button>
    </div>

    {accessibilityOpen&&<section className="immersive-accessibility-panel">
      <button className={accessibility.reducedMotion?'active':''} onClick={()=>toggleAccessibility('reducedMotion')}><span><Pause/></span><div><strong>Movimiento reducido</strong><small>Detiene animaciones ambientales y suaviza la cámara.</small></div><i>{accessibility.reducedMotion?'Activo':'Inactivo'}</i></button>
      <button className={accessibility.highContrast?'active':''} onClick={()=>toggleAccessibility('highContrast')}><span><Eye/></span><div><strong>Contraste alto</strong><small>Aumenta luz, bordes y legibilidad de la escena.</small></div><i>{accessibility.highContrast?'Activo':'Inactivo'}</i></button>
      <button className={accessibility.largeText?'active':''} onClick={()=>toggleAccessibility('largeText')}><span><Accessibility/></span><div><strong>Texto ampliado</strong><small>Aumenta instrucciones, preguntas y respuestas.</small></div><i>{accessibility.largeText?'Activo':'Inactivo'}</i></button>
      <button className={accessibility.captions?'active':''} onClick={()=>toggleAccessibility('captions')}><span><Volume2/></span><div><strong>Subtítulos visibles</strong><small>Muestra la narración dentro de la escena.</small></div><i>{accessibility.captions?'Activo':'Inactivo'}</i></button>
      <button className={accessibility.guided?'active':''} onClick={()=>toggleAccessibility('guided')}><span><Lightbulb/></span><div><strong>Modo guiado</strong><small>Abre YOYO y presenta una pista en cada misión.</small></div><i>{accessibility.guided?'Activo':'Inactivo'}</i></button>
      <label><span><Volume2/></span><div><strong>Velocidad de narración</strong><small>{narrationRate===.75?'Lenta':narrationRate===.9?'Normal':'Rápida'}</small></div><select value={narrationRate} onChange={event=>setNarrationRate(Number(event.target.value))}><option value="0.75">Lenta</option><option value="0.9">Normal</option><option value="1.08">Rápida</option></select></label>
    </section>}

    <div className="immersive-layout">
      <article className="immersive-stage-card">
        <div ref={mountRef} className="immersive-canvas"/>
        <div className="immersive-hud top-left"><span><Gamepad2/> WASD o flechas</span><span><Compass/> Haz clic en objetos</span></div>
        <div className="immersive-hud top-right"><button onClick={()=>setRunning(value=>!value)}>{running?<Pause/>:<Play/>}</button><button onClick={()=>setSound(value=>!value)}>{sound?<Volume2/>:<VolumeX/>}</button><button className={ambient?'active':''} onClick={toggleAmbient}><Headphones/></button><button onClick={reset}><RotateCcw/></button></div>
        <div className="immersive-progress-hud"><div><span>Misión {mission+1} de {world.missions.length}</span><strong>{progress}%</strong></div><div><i style={{width:`${progress}%`}}/></div><div><span>XP <strong>{score}</strong></span><span>Precisión <strong>{answered?Math.round(correct/answered*100):0}%</strong></span><span>Explorados <strong>{explored.length}</strong></span></div></div>
        <button className="virtual-guide-orb" onClick={()=>setGuideOpen(value=>!value)} aria-label="Abrir profesor virtual"><BotAvatar/><span>YOYO</span></button>
        {guideOpen&&<aside className="in-world-guide"><button onClick={()=>setGuideOpen(false)}>×</button><span>PROFESOR VIRTUAL</span><strong>{current.guide}</strong><p>{current.narration}</p><button onClick={()=>speak()}><Volume2/>Escuchar explicación</button></aside>}
        {accessibility.captions&&<div className="immersive-caption"><Bot/><span>{current.narration}</span></div>}
      </article>

      <aside className="mission-console">
        <div className="mission-console-head"><span>{world.emoji}</span><div><small>{world.subject} · {world.skill}</small><h2>{current.title}</h2></div></div>
        <p className="mission-story">{current.story}</p>
        <div className="mission-objective"><Map/><div><small>OBJETIVO PEDAGÓGICO</small><strong>{world.objective}</strong></div></div>
        <div className="mission-question"><span>PREGUNTA</span><h3>{current.question}</h3></div>
        <div className="mission-options">{current.options.map((option,index)=>{const state=selected===null?'':index===current.correct?'correct':index===selected?'wrong':'';return <button className={state} key={option} onClick={()=>answer(index)} disabled={selected!==null}><span>{String.fromCharCode(65+index)}</span>{option}{state==='correct'&&<CheckCircle2/>}</button>})}</div>
        {selected===null?<button className="hint-button" onClick={()=>setHint(value=>!value)}><Lightbulb/>{hint?current.hint:'Necesito una pista'}</button>:<div className={`mission-feedback ${selected===current.correct?'success':'retry'}`}><strong>{selected===current.correct?'¡Excelente razonamiento!':'Revisemos la evidencia'}</strong><p>{current.evidence}</p><span>+{selected===current.correct?current.xp:5} XP · {syncStatus==='saving'?'Guardando...':syncStatus==='saved'?'Progreso guardado':'Modo demostración'}</span></div>}
        <div className="mission-nav"><button onClick={previous} disabled={mission===0}><ChevronLeft/>Anterior</button><button onClick={()=>sceneApi.current?.focus(current.targetObject)}><Compass/>Explorar objeto</button><button onClick={next} disabled={selected===null||mission===world.missions.length-1}>Siguiente<ChevronRight/></button></div>
      </aside>
    </div>
  </section>
}

function BotAvatar(){return <span className="yoyo-bot-avatar" aria-hidden="true"><i/><b/><em/><Bot/></span>}
