'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type RoomId='narrador'|'conflicto'|'personajes'|'simbolos'
type Props={activeRoom:RoomId;collected:RoomId[];reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

const roomColors:Record<RoomId,number>={narrador:0x6f56d9,conflicto:0xd96f56,personajes:0x2a9d8f,simbolos:0xd6a33f}
const roomPositions:Record<RoomId,[number,number,number]>={
 narrador:[-4.3,1.2,-3.5],
 conflicto:[4.3,1.2,-3.5],
 personajes:[-4.3,1.2,3.5],
 simbolos:[4.3,1.2,3.5],
}

export default function ThreeStoryMuseum({activeRoom,collected,reducedMotion=false,highContrast=false,onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||820,height=mount.clientHeight||540
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)
  const background=highContrast?0x07101d:0xece7df
  const scene=new THREE.Scene();scene.background=new THREE.Color(background);scene.fog=new THREE.FogExp2(background,.017)
  const camera=new THREE.PerspectiveCamera(45,width/height,.1,100);camera.position.set(0,8.3,14.5);camera.lookAt(0,1,0)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x142137:0x887c70,1.3))
  const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(8,12,7);key.castShadow=true;scene.add(key)

  const floor=new THREE.Mesh(new THREE.PlaneGeometry(22,18),new THREE.MeshStandardMaterial({color:highContrast?0x132238:0xc9bba8,roughness:.82}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor)
  const hall=new THREE.Mesh(new THREE.BoxGeometry(5.5,.12,14),new THREE.MeshStandardMaterial({color:highContrast?0x25334a:0xeee3d3,roughness:.9}));hall.position.y=.05;scene.add(hall)
  const central=new THREE.Mesh(new THREE.CylinderGeometry(1.8,2.1,.25,28),new THREE.MeshStandardMaterial({color:highContrast?0x364661:0xd5c4aa,roughness:.7}));central.position.y=.13;scene.add(central)

  const roomGroups=new Map<RoomId,THREE.Group>()
  ;(Object.entries(roomPositions) as Array<[RoomId,[number,number,number]]>).forEach(([id,pos])=>{
   const group=new THREE.Group();group.position.set(...pos);scene.add(group);roomGroups.set(id,group)
   const active=id===activeRoom,done=collected.includes(id),accent=roomColors[id]
   const wall=new THREE.Mesh(new THREE.BoxGeometry(5.5,2.7,.25),new THREE.MeshStandardMaterial({color:highContrast?0x1b2940:0xf7f1e8,roughness:.92,emissive:active?accent:0x000000,emissiveIntensity:active?.08:0}));wall.position.z=pos[2]<0?.5:-.5;wall.castShadow=true;group.add(wall)
   for(let frameIndex=0;frameIndex<3;frameIndex++){
    const frame=new THREE.Mesh(new THREE.BoxGeometry(1.05,1.15,.16),new THREE.MeshStandardMaterial({color:done?0xffffff:accent,roughness:.5,metalness:.08,emissive:active?accent:0x000000,emissiveIntensity:active?.2:0}));frame.position.set(-1.45+frameIndex*1.45,.35,pos[2]<0?.32:-.32);group.add(frame)
    const art=new THREE.Mesh(new THREE.PlaneGeometry(.72,.78),new THREE.MeshStandardMaterial({color:done?0x9eeacb:0xf7dfaa,roughness:.75}));art.position.set(frame.position.x,.35,pos[2]<0?.42:-.42);art.rotation.y=pos[2]<0?0:Math.PI;group.add(art)
   }
   const pedestal=new THREE.Mesh(new THREE.CylinderGeometry(.46,.58,1,12),new THREE.MeshStandardMaterial({color:active?accent:highContrast?0x3b4a62:0xbba98f,roughness:.66}));pedestal.position.set(0,-.7,0);group.add(pedestal)
   const evidence=new THREE.Mesh(new THREE.OctahedronGeometry(.32),new THREE.MeshStandardMaterial({color:done?0x59d8a9:0xffffff,emissive:done?0x2a9d8f:active?accent:0x000000,emissiveIntensity:done||active?.8:0,roughness:.35}));evidence.position.set(0,.05,0);group.add(evidence)
  })

  const ribbonMaterial=new THREE.MeshStandardMaterial({color:highContrast?0xf8f2ff:0x734b32,roughness:.75})
  for(let i=0;i<12;i++){
   const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,.65,8),ribbonMaterial);const angle=i/12*Math.PI*2;post.position.set(Math.cos(angle)*2.7,.34,Math.sin(angle)*2.7);scene.add(post)
  }
  const guide=new THREE.Group();scene.add(guide)
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.55,5,10),new THREE.MeshStandardMaterial({color:highContrast?0xffef56:0x355c7d,roughness:.45}));body.position.y=.8;guide.add(body)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.24,14,14),new THREE.MeshStandardMaterial({color:0xf0c7a4,roughness:.72}));head.position.y=1.5;guide.add(head)
  const target=roomPositions[activeRoom];guide.position.set(target[0]*.58,0,target[2]*.58)

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();const targetPos=roomPositions[activeRoom];if(!reducedMotion){guide.position.x+=(targetPos[0]*.58-guide.position.x)*.025;guide.position.z+=(targetPos[2]*.58-guide.position.z)*.025;guide.rotation.y=Math.sin(t*1.5)*.08;const room=roomGroups.get(activeRoom);if(room)room.rotation.y=Math.sin(t*.9)*.015}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||540;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[activeRoom,collected,reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Puedes completar la investigación usando las fichas textuales de cada sala.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Museo narrativo 3D. Sala activa: ${activeRoom}. Evidencias reunidas: ${collected.length} de 4.`}/>
}
