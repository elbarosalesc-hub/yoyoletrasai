'use client'

import {useEffect,useRef,useState} from 'react'
import {Maximize2,Pause,Play,Volume2,VolumeX} from 'lucide-react'

type AudioRig={context:AudioContext;nodes:AudioNode[]}

export function ImmersivePreview3D(){
  const hostRef=useRef<HTMLDivElement|null>(null)
  const runningRef=useRef(true)
  const audioRef=useRef<AudioRig|null>(null)
  const [running,setRunning]=useState(true)
  const [sound,setSound]=useState(false)
  const [explored,setExplored]=useState(3)
  const [activeObject,setActiveObject]=useState('Linterna mágica')

  useEffect(()=>{runningRef.current=running},[running])

  useEffect(()=>{
    let disposed=false
    let renderer:any,scene:any,camera:any,frame=0,clock:any
    let hero:any,robot:any,lanternGlow:any,fireflies:any,moonGlow:any,smoke:any
    const host=hostRef.current
    if(!host)return

    import('three').then(THREE=>{
      if(disposed||!host)return

      scene=new THREE.Scene()
      scene.background=new THREE.Color('#07152f')
      scene.fog=new THREE.FogExp2('#0b2236',.045)

      camera=new THREE.PerspectiveCamera(43,host.clientWidth/host.clientHeight,.1,100)
      camera.position.set(1.8,4.4,10.8)
      camera.lookAt(0,1.65,-2.6)

      renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})
      renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.8))
      renderer.setSize(host.clientWidth,host.clientHeight)
      renderer.shadowMap.enabled=true
      renderer.shadowMap.type=THREE.PCFSoftShadowMap
      renderer.outputColorSpace=THREE.SRGBColorSpace
      renderer.toneMapping=THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure=1.12
      host.replaceChildren(renderer.domElement)

      const hemi=new THREE.HemisphereLight('#92b8ff','#112d26',2.4)
      scene.add(hemi)
      const moonLight=new THREE.DirectionalLight('#fff1b7',3.5)
      moonLight.position.set(5,9,4);moonLight.castShadow=true
      moonLight.shadow.mapSize.set(1024,1024);scene.add(moonLight)
      const cabinLight=new THREE.PointLight('#ffd76b',12,12,2)
      cabinLight.position.set(3.2,2,-4.2);scene.add(cabinLight)
      lanternGlow=new THREE.PointLight('#ffe27b',9,8,2)
      lanternGlow.position.set(.9,1.45,.3);scene.add(lanternGlow)
      const violetFill=new THREE.PointLight('#7c55ff',5,10,2)
      violetFill.position.set(-3.5,2.5,2.5);scene.add(violetFill)

      const skyGeo=new THREE.SphereGeometry(45,32,16)
      const skyMat=new THREE.ShaderMaterial({
        side:THREE.BackSide,
        uniforms:{topColor:{value:new THREE.Color('#071b48')},bottomColor:{value:new THREE.Color('#17606b')},offset:{value:8},exponent:{value:.72}},
        vertexShader:'varying vec3 vWorldPosition; void main(){vec4 worldPosition=modelMatrix*vec4(position,1.0);vWorldPosition=worldPosition.xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:'uniform vec3 topColor;uniform vec3 bottomColor;uniform float offset;uniform float exponent;varying vec3 vWorldPosition;void main(){float h=normalize(vWorldPosition+offset).y;gl_FragColor=vec4(mix(bottomColor,topColor,max(pow(max(h,0.0),exponent),0.0)),1.0);}'
      })
      scene.add(new THREE.Mesh(skyGeo,skyMat))

      const moon=new THREE.Mesh(new THREE.SphereGeometry(.78,32,32),new THREE.MeshBasicMaterial({color:'#fff0a8'}))
      moon.position.set(4.8,6.7,-10);scene.add(moon)
      moonGlow=new THREE.Mesh(new THREE.SphereGeometry(1.55,24,24),new THREE.MeshBasicMaterial({color:'#fff2b0',transparent:true,opacity:.12,side:THREE.BackSide}))
      moonGlow.position.copy(moon.position);scene.add(moonGlow)

      const starGeo=new THREE.BufferGeometry();const starCount=180;const starData=new Float32Array(starCount*3)
      for(let i=0;i<starCount;i++){starData[i*3]=(Math.random()-.5)*34;starData[i*3+1]=3+Math.random()*11;starData[i*3+2]=-6-Math.random()*25}
      starGeo.setAttribute('position',new THREE.BufferAttribute(starData,3))
      const stars=new THREE.Points(starGeo,new THREE.PointsMaterial({color:'#dce9ff',size:.035,transparent:true,opacity:.86}))
      scene.add(stars)

      const groundMat=new THREE.MeshStandardMaterial({color:'#123c31',roughness:.96})
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(34,36,1,1),groundMat)
      ground.rotation.x=-Math.PI/2;ground.position.z=-5;ground.receiveShadow=true;scene.add(ground)

      const hillMat=new THREE.MeshStandardMaterial({color:'#0d423a',roughness:1})
      for(let i=0;i<5;i++){
        const hill=new THREE.Mesh(new THREE.SphereGeometry(4.2+i*.25,24,12),hillMat)
        hill.scale.set(1.7,.55,1);hill.position.set((i-2)*5,-2.4,-9-i*.8);scene.add(hill)
      }

      const pathMat=new THREE.MeshStandardMaterial({color:'#9c784e',roughness:.88})
      const path=new THREE.Mesh(new THREE.PlaneGeometry(4.3,25),pathMat)
      path.rotation.x=-Math.PI/2;path.rotation.z=-.09;path.position.set(1,.025,-5);scene.add(path)

      const trunkMat=new THREE.MeshStandardMaterial({color:'#51362e',roughness:.95})
      const leafColors=['#0d4d43','#125c49','#0a413c','#176050']
      const treeGroups:any[]=[]
      for(let i=0;i<31;i++){
        const x=(Math.random()-.5)*27,z=3-Math.random()*25
        if(Math.abs(x-1)<3.4)continue
        const tree=new THREE.Group()
        const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12+.08*Math.random(),.22+.1*Math.random(),2.2+Math.random(),8),trunkMat)
        trunk.position.y=1.1;trunk.castShadow=true
        const leafMat=new THREE.MeshStandardMaterial({color:leafColors[i%leafColors.length],roughness:.9})
        const crown1=new THREE.Mesh(new THREE.ConeGeometry(.9+Math.random()*.4,2.5+Math.random(),8),leafMat);crown1.position.y=2.7;crown1.castShadow=true
        const crown2=new THREE.Mesh(new THREE.ConeGeometry(.68+Math.random()*.28,2.1+Math.random()*.5,8),leafMat);crown2.position.y=3.75;crown2.castShadow=true
        tree.add(trunk,crown1,crown2);tree.position.set(x,0,z);tree.rotation.y=Math.random()*Math.PI
        tree.userData.baseY=tree.position.y;treeGroups.push(tree);scene.add(tree)
      }

      const cabin=new THREE.Group();cabin.userData.target='Cabaña luminosa'
      const wallMat=new THREE.MeshStandardMaterial({color:'#7d493f',roughness:.8})
      const roofMat=new THREE.MeshStandardMaterial({color:'#a9554a',roughness:.82})
      const body=new THREE.Mesh(new THREE.BoxGeometry(3.25,2.35,2.7),wallMat);body.position.y=1.18;body.castShadow=true
      const roof=new THREE.Mesh(new THREE.ConeGeometry(2.55,1.55,4),roofMat);roof.position.y=2.95;roof.rotation.y=Math.PI/4;roof.castShadow=true
      cabin.add(body,roof)
      const windowMat=new THREE.MeshStandardMaterial({color:'#ffe585',emissive:'#ffd85c',emissiveIntensity:3.5})
      const windows=[[-.72,1.45,1.37],[.72,1.45,1.37]]
      windows.forEach(([x,y,z])=>{const windowMesh=new THREE.Mesh(new THREE.BoxGeometry(.55,.72,.07),windowMat);windowMesh.position.set(x,y,z);cabin.add(windowMesh)})
      const door=new THREE.Mesh(new THREE.BoxGeometry(.68,1.25,.08),new THREE.MeshStandardMaterial({color:'#4a302d'}));door.position.set(0,.64,1.39);cabin.add(door)
      const chimney=new THREE.Mesh(new THREE.BoxGeometry(.42,1.2,.42),wallMat);chimney.position.set(.95,3.4,-.3);cabin.add(chimney)
      cabin.position.set(3.8,0,-5.7);scene.add(cabin)

      const smokeGeo=new THREE.BufferGeometry();const smokeCount=18;const smokeData=new Float32Array(smokeCount*3)
      for(let i=0;i<smokeCount;i++){smokeData[i*3]=4.75+(Math.random()-.5)*.25;smokeData[i*3+1]=3.8+Math.random()*3;smokeData[i*3+2]=-6+(Math.random()-.5)*.25}
      smokeGeo.setAttribute('position',new THREE.BufferAttribute(smokeData,3))
      smoke=new THREE.Points(smokeGeo,new THREE.PointsMaterial({color:'#bac8d4',size:.22,transparent:true,opacity:.25,depthWrite:false}));scene.add(smoke)

      const mushroomMat=new THREE.MeshStandardMaterial({color:'#e0564a',roughness:.65})
      const mushroomStemMat=new THREE.MeshStandardMaterial({color:'#f2d6a7'})
      for(let i=0;i<13;i++){
        const mushroom=new THREE.Group();mushroom.userData.target='Hongos luminosos'
        const stem=new THREE.Mesh(new THREE.CylinderGeometry(.05,.075,.35,8),mushroomStemMat);stem.position.y=.17
        const cap=new THREE.Mesh(new THREE.SphereGeometry(.18,12,8,0,Math.PI*2,0,Math.PI/2),mushroomMat);cap.position.y=.34
        mushroom.add(stem,cap);mushroom.position.set((Math.random()-.5)*11,.01,-1-Math.random()*11);mushroom.scale.setScalar(.75+Math.random()*.85);scene.add(mushroom)
      }

      hero=new THREE.Group();hero.userData.target='Luma y su linterna'
      const skin=new THREE.MeshStandardMaterial({color:'#f0ad78',roughness:.65})
      const hair=new THREE.MeshStandardMaterial({color:'#2b2135',roughness:.8})
      const purple=new THREE.MeshStandardMaterial({color:'#7441e5',roughness:.55})
      const darkPurple=new THREE.MeshStandardMaterial({color:'#342c73'})
      const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,24),skin);head.position.y=2.62;head.castShadow=true
      const hairCap=new THREE.Mesh(new THREE.SphereGeometry(.51,20,16,0,Math.PI*2,0,Math.PI/1.75),hair);hairCap.position.set(0,2.82,-.02)
      const bun=new THREE.Mesh(new THREE.SphereGeometry(.23,18,18),hair);bun.position.set(-.3,3.08,-.08)
      const bodyHero=new THREE.Mesh(new THREE.CapsuleGeometry(.58,1.05,8,18),purple);bodyHero.position.y=1.45;bodyHero.castShadow=true
      const backpack=new THREE.Mesh(new THREE.BoxGeometry(.48,.82,.3),new THREE.MeshStandardMaterial({color:'#f2b642'}));backpack.position.set(0,1.58,-.47)
      const leg1=new THREE.Mesh(new THREE.CylinderGeometry(.13,.16,.92,10),darkPurple);leg1.position.set(-.24,.45,0)
      const leg2=leg1.clone();leg2.position.x=.24
      const arm1=new THREE.Mesh(new THREE.CylinderGeometry(.09,.11,.95,10),skin);arm1.position.set(.56,1.55,.05);arm1.rotation.z=-.72
      const arm2=arm1.clone();arm2.position.x=-.56;arm2.rotation.z=.45
      const lanternFrame=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.36,10),new THREE.MeshStandardMaterial({color:'#8a5a2d',metalness:.35,roughness:.45}));lanternFrame.position.set(1,1.15,.08)
      const lanternCore=new THREE.Mesh(new THREE.SphereGeometry(.12,16,16),new THREE.MeshStandardMaterial({color:'#fff4a8',emissive:'#ffe05f',emissiveIntensity:5}));lanternCore.position.copy(lanternFrame.position);lanternCore.userData.target='Linterna mágica'
      hero.add(head,hairCap,bun,bodyHero,backpack,leg1,leg2,arm1,arm2,lanternFrame,lanternCore)
      hero.position.set(-.8,0,1.2);scene.add(hero)

      robot=new THREE.Group();robot.userData.target='Profesor virtual YOYO'
      const robotWhite=new THREE.MeshStandardMaterial({color:'#edf3ff',metalness:.45,roughness:.25})
      const robotPurple=new THREE.MeshStandardMaterial({color:'#7547ec',emissive:'#3b1e9a',emissiveIntensity:.45,metalness:.35})
      const robotBody=new THREE.Mesh(new THREE.SphereGeometry(.42,24,24),robotWhite);robotBody.scale.set(1,1.12,.85)
      const robotFace=new THREE.Mesh(new THREE.SphereGeometry(.31,20,20),robotPurple);robotFace.position.z=.25;robotFace.scale.set(1,.72,.38)
      const eyeMat=new THREE.MeshBasicMaterial({color:'#77f6e8'})
      const eye1=new THREE.Mesh(new THREE.SphereGeometry(.045,10,10),eyeMat);eye1.position.set(-.11,.06,.53)
      const eye2=eye1.clone();eye2.position.x=.11
      const antenna=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.3,8),robotPurple);antenna.position.y=.52
      const antennaOrb=new THREE.Mesh(new THREE.SphereGeometry(.07,12,12),eyeMat);antennaOrb.position.y=.7
      robot.add(robotBody,robotFace,eye1,eye2,antenna,antennaOrb);robot.position.set(-3.2,3.6,-2.6);scene.add(robot)

      const fireflyGeo=new THREE.BufferGeometry();const fireflyCount=140;const fireflyData=new Float32Array(fireflyCount*3)
      for(let i=0;i<fireflyCount;i++){fireflyData[i*3]=(Math.random()-.5)*22;fireflyData[i*3+1]=.25+Math.random()*5.8;fireflyData[i*3+2]=3-Math.random()*21}
      fireflyGeo.setAttribute('position',new THREE.BufferAttribute(fireflyData,3))
      fireflies=new THREE.Points(fireflyGeo,new THREE.PointsMaterial({color:'#ffe764',size:.075,transparent:true,opacity:.88,depthWrite:false}));scene.add(fireflies)

      const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();const interactive=[cabin,hero,robot,lanternCore]
      const canvas=renderer.domElement as HTMLCanvasElement
      canvas.setAttribute('aria-label','Vista 3D interactiva del Bosque Mágico')
      canvas.tabIndex=0

      const onPointer=(event:PointerEvent)=>{
        const rect=canvas.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/rect.width)*2-1;pointer.y=-((event.clientY-rect.top)/rect.height)*2+1
        raycaster.setFromCamera(pointer,camera)
        const hits=raycaster.intersectObjects(interactive,true)
        if(!hits.length)return
        let item:any=hits[0].object
        while(item&&!item.userData.target)item=item.parent
        const label=item?.userData?.target??hits[0].object.userData.target
        if(label){setActiveObject(label);setExplored(value=>Math.min(6,value+1));playChime(660)}
      }
      canvas.addEventListener('pointerdown',onPointer)

      const resize=()=>{if(!host||!renderer)return;camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)}
      window.addEventListener('resize',resize)
      clock=new THREE.Clock()
      const animate=()=>{
        frame=requestAnimationFrame(animate)
        const elapsed=clock.getElapsedTime()
        if(runningRef.current){
          hero.position.y=Math.abs(Math.sin(elapsed*2.3))*.035
          hero.rotation.y=Math.sin(elapsed*.36)*.05
          arm1.rotation.x=Math.sin(elapsed*1.4)*.18
          arm2.rotation.x=-Math.sin(elapsed*1.4)*.14
          lanternGlow.intensity=8.3+Math.sin(elapsed*3.2)*1.9
          robot.position.y=3.6+Math.sin(elapsed*1.35)*.25
          robot.rotation.y=Math.sin(elapsed*.7)*.3
          fireflies.rotation.y+=.0008
          fireflies.position.y=Math.sin(elapsed*.6)*.08
          moonGlow.scale.setScalar(1+Math.sin(elapsed*.9)*.045)
          smoke.position.y=(elapsed*.17)%1.6
          treeGroups.forEach((tree,index)=>{tree.rotation.z=Math.sin(elapsed*.45+index)*.004})
          camera.position.x=1.8+Math.sin(elapsed*.13)*.32
          camera.position.y=4.4+Math.sin(elapsed*.18)*.08
          camera.lookAt(.4,1.55,-2.7)
        }
        renderer.render(scene,camera)
      }
      animate()

      return()=>{canvas.removeEventListener('pointerdown',onPointer);window.removeEventListener('resize',resize)}
    }).catch(()=>{if(host)host.innerHTML='<div class="webgl-fallback"><strong>Vista 3D no disponible</strong><span>Activa WebGL para disfrutar la experiencia inmersiva.</span></div>'})

    return()=>{disposed=true;cancelAnimationFrame(frame);if(renderer){renderer.dispose();renderer.domElement?.remove()};stopAmbient()}
  },[])

  function playChime(frequency=520){
    if(!sound||typeof window==='undefined')return
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext
    if(!AudioContextClass)return
    const context=new AudioContextClass();const osc=context.createOscillator();const gain=context.createGain()
    osc.type='sine';osc.frequency.setValueAtTime(frequency,context.currentTime);osc.frequency.exponentialRampToValueAtTime(frequency*1.42,context.currentTime+.28)
    gain.gain.setValueAtTime(.065,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.42)
    osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.42);osc.onended=()=>context.close()
  }

  function stopAmbient(){
    if(!audioRef.current)return
    audioRef.current.nodes.forEach(node=>{try{(node as OscillatorNode).stop?.()}catch{}})
    void audioRef.current.context.close();audioRef.current=null
  }

  function toggleSound(){
    if(sound){stopAmbient();setSound(false);return}
    setSound(true)
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext
    if(!AudioContextClass)return
    const context=new AudioContextClass();const master=context.createGain();master.gain.value=.018;master.connect(context.destination)
    const nodes:AudioNode[]=[]
    ;[110,174,261].forEach((frequency,index)=>{const osc=context.createOscillator();const gain=context.createGain();osc.type=index===0?'triangle':'sine';osc.frequency.value=frequency;gain.gain.value=index===0?.24:.11;osc.connect(gain);gain.connect(master);osc.start();nodes.push(osc,gain)})
    const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);const data=buffer.getChannelData(0)
    for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*(.2+Math.sin(i/3100)*.08)
    const noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true
    const filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=520
    const noiseGain=context.createGain();noiseGain.gain.value=.055;noise.connect(filter);filter.connect(noiseGain);noiseGain.connect(master);noise.start();nodes.push(noise,filter,noiseGain)
    audioRef.current={context,nodes};playChime(640)
  }

  function toggleFullscreen(){
    const host=hostRef.current?.parentElement
    if(!host)return
    if(document.fullscreenElement)void document.exitFullscreen();else void host.requestFullscreen?.()
  }

  return <div className="immersive-preview-card premium-live-scene">
    <div ref={hostRef} className="immersive-preview-canvas"/>
    <div className="immersive-preview-gradient"/>
    <div className="scene-interaction-note"><strong>{activeObject}</strong><span>Haz clic en la escena para explorar</span></div>
    <div className="immersive-preview-controls"><button onClick={()=>setRunning(value=>!value)} aria-label={running?'Pausar animación':'Reproducir animación'}>{running?<Pause/>:<Play/>}</button><button className={sound?'active':''} onClick={toggleSound} aria-label={sound?'Silenciar ambiente':'Activar ambiente'}>{sound?<Volume2/>:<VolumeX/>}</button><button onClick={toggleFullscreen} aria-label="Pantalla completa"><Maximize2/></button></div>
    <span className="immersive-live-badge"><i/> Vista 3D en vivo · {explored}/6 objetos</span>
  </div>
}
