'use client'

import {useEffect,useRef,useState} from 'react'
import {Maximize2,Pause,Play,Volume2,VolumeX} from 'lucide-react'

export function ImmersivePreview3D(){
  const hostRef=useRef<HTMLDivElement|null>(null)
  const [running,setRunning]=useState(true)
  const [sound,setSound]=useState(false)

  useEffect(()=>{
    let disposed=false
    let renderer:any,scene:any,camera:any,frame=0,clock:any,character:any,owl:any,orb:any,particles:any
    const host=hostRef.current
    if(!host)return

    import('three').then(THREE=>{
      if(disposed||!host)return
      scene=new THREE.Scene();scene.background=new THREE.Color('#07152f');scene.fog=new THREE.Fog('#0a2437',8,25)
      camera=new THREE.PerspectiveCamera(46,host.clientWidth/host.clientHeight,.1,70);camera.position.set(0,4,9);camera.lookAt(0,1,-2)
      renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5));renderer.setSize(host.clientWidth,host.clientHeight);renderer.shadowMap.enabled=true;host.replaceChildren(renderer.domElement)
      scene.add(new THREE.HemisphereLight('#98baff','#163f35',2.3))
      const moonLight=new THREE.DirectionalLight('#fff0aa',2.6);moonLight.position.set(4,8,3);moonLight.castShadow=true;scene.add(moonLight)
      const lamp=new THREE.PointLight('#ffd75c',7,10,2);lamp.position.set(2.7,1.7,-3.5);scene.add(lamp)
      const ground=new THREE.Mesh(new THREE.PlaneGeometry(28,28),new THREE.MeshStandardMaterial({color:'#153f34',roughness:1}));ground.rotation.x=-Math.PI/2;scene.add(ground)
      const treeMat=new THREE.MeshStandardMaterial({color:'#0d5946'});const trunkMat=new THREE.MeshStandardMaterial({color:'#58372a'})
      for(let i=0;i<15;i++){const x=(Math.random()-.5)*20,z=-Math.random()*16+3;if(Math.abs(x)<2.5)continue;const tree=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.24,2,7),trunkMat);trunk.position.y=1;const crown=new THREE.Mesh(new THREE.ConeGeometry(1.05,3,8),treeMat);crown.position.y=2.8;tree.add(trunk,crown);tree.position.set(x,0,z);scene.add(tree)}
      const cabin=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(2.6,1.9,2.2),new THREE.MeshStandardMaterial({color:'#82483f'}));body.position.y=.95;const roof=new THREE.Mesh(new THREE.ConeGeometry(2,1.3,4),new THREE.MeshStandardMaterial({color:'#bd6751'}));roof.position.y=2.3;roof.rotation.y=Math.PI/4;const windowMesh=new THREE.Mesh(new THREE.BoxGeometry(.55,.6,.06),new THREE.MeshStandardMaterial({color:'#ffe77c',emissive:'#ffd95c',emissiveIntensity:3}));windowMesh.position.set(.65,1.2,1.13);cabin.add(body,roof,windowMesh);cabin.position.set(3,0,-4);scene.add(cabin)
      character=new THREE.Group();const head=new THREE.Mesh(new THREE.SphereGeometry(.4,18,18),new THREE.MeshStandardMaterial({color:'#efad79'}));head.position.y=2.05;const torso=new THREE.Mesh(new THREE.CapsuleGeometry(.5,.9,7,12),new THREE.MeshStandardMaterial({color:'#7544e8'}));torso.position.y=1.1;character.add(head,torso);character.position.set(-1.6,0,1.8);scene.add(character)
      owl=new THREE.Mesh(new THREE.SphereGeometry(.28,16,16),new THREE.MeshStandardMaterial({color:'#d89f5b'}));owl.position.set(-.8,3.8,-2);scene.add(owl)
      orb=new THREE.Mesh(new THREE.SphereGeometry(.22,18,18),new THREE.MeshStandardMaterial({color:'#8af2bb',emissive:'#71efae',emissiveIntensity:2.7}));orb.position.set(1.2,.8,-1.5);scene.add(orb)
      const particleGeo=new THREE.BufferGeometry();const count=85;const data=new Float32Array(count*3);for(let i=0;i<count;i++){data[i*3]=(Math.random()-.5)*20;data[i*3+1]=Math.random()*6+.3;data[i*3+2]=-Math.random()*16+3}particleGeo.setAttribute('position',new THREE.BufferAttribute(data,3));particles=new THREE.Points(particleGeo,new THREE.PointsMaterial({color:'#ffe96b',size:.055,transparent:true,opacity:.8}));scene.add(particles)
      clock=new THREE.Clock();const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight)};window.addEventListener('resize',resize)
      const animate=()=>{frame=requestAnimationFrame(animate);const t=clock.getElapsedTime();if(running){character.position.y=Math.abs(Math.sin(t*2.8))*.05;character.position.x=-1.6+Math.sin(t*.42)*.32;owl.position.y=3.8+Math.sin(t*1.8)*.22;owl.position.x=-.8+Math.cos(t*.7)*.5;orb.position.y=.8+Math.sin(t*2.2)*.16;orb.rotation.y=t;particles.rotation.y=t*.025;camera.position.x=Math.sin(t*.15)*.3;camera.lookAt(0,1,-1.8)}renderer.render(scene,camera)};animate()
      return()=>window.removeEventListener('resize',resize)
    })
    return()=>{disposed=true;cancelAnimationFrame(frame);if(renderer){renderer.dispose();renderer.domElement?.remove()}}
  },[running])

  function playPreviewSound(){
    setSound(value=>!value)
    if(sound||typeof window==='undefined')return
    const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext;if(!AudioContextClass)return
    const context=new AudioContextClass();const osc=context.createOscillator();const gain=context.createGain();osc.frequency.value=520;gain.gain.setValueAtTime(.05,context.currentTime);gain.gain.exponentialRampToValueAtTime(.001,context.currentTime+.3);osc.connect(gain);gain.connect(context.destination);osc.start();osc.stop(context.currentTime+.3);osc.onended=()=>context.close()
  }

  return <div className="immersive-preview-card">
    <div ref={hostRef} className="immersive-preview-canvas"/>
    <div className="immersive-preview-gradient"/>
    <div className="immersive-preview-controls"><button onClick={()=>setRunning(value=>!value)} aria-label={running?'Pausar animación':'Reproducir animación'}>{running?<Pause/>:<Play/>}</button><button onClick={playPreviewSound} aria-label="Probar sonido">{sound?<Volume2/>:<VolumeX/>}</button><a href="/juegos" aria-label="Abrir experiencia completa"><Maximize2/></a></div>
    <span className="immersive-live-badge"><i/> Vista 3D en vivo</span>
  </div>
}
