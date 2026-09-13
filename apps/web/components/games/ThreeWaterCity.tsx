'use client'

import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'

type Props={reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

export default function ThreeWaterCity({reducedMotion=false,highContrast=false,onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||800,height=mount.clientHeight||520
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x071a2d:0xb8e8ff);scene.fog=new THREE.FogExp2(highContrast?0x071a2d:0xdaf5ff,.025)
  const camera=new THREE.PerspectiveCamera(48,width/height,.1,100);camera.position.set(0,7.2,14.5);camera.lookAt(0,1.8,-4.5)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x12324a:0x6b8f5c,2.5))
  const sun=new THREE.DirectionalLight(0xfff0c7,4);sun.position.set(8,13,7);sun.castShadow=true;scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(38,34),new THREE.MeshStandardMaterial({color:highContrast?0x183a35:0x88c774,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const river=new THREE.Mesh(new THREE.PlaneGeometry(6,34),new THREE.MeshStandardMaterial({color:highContrast?0x29a8ff:0x3fbce8,roughness:.28,metalness:.08}));river.rotation.x=-Math.PI/2;river.position.set(-8,.025,-5);scene.add(river)
  const road=new THREE.Mesh(new THREE.PlaneGeometry(8,30),new THREE.MeshStandardMaterial({color:highContrast?0x354a5f:0xa8a8a8,roughness:1}));road.rotation.x=-Math.PI/2;road.position.set(2,.03,-5);scene.add(road)

  const buildingMaterial=(color:number)=>new THREE.MeshStandardMaterial({color,roughness:.74})
  const addBuilding=(x:number,z:number,w:number,h:number,d:number,color:number)=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),buildingMaterial(color));body.position.y=h/2;body.castShadow=true;g.add(body);for(let row=0;row<Math.max(1,Math.floor(h));row++)for(let col=0;col<2;col++){const win=new THREE.Mesh(new THREE.BoxGeometry(.28,.34,.04),new THREE.MeshStandardMaterial({color:0xcaf3ff,emissive:0x1d6480,emissiveIntensity:.12}));win.position.set((col?1:-1)*w*.22,.65+row*.75,d/2+.025);g.add(win)}g.position.set(x,0,z);scene.add(g);return g}
  const buildings=[addBuilding(5,-2,3,3.2,2.8,0xf0b65f),addBuilding(6,-8,3.4,4.2,3,0xe27b68),addBuilding(-1,-10,4,2.7,3.2,0x7ba9d8)]

  const tank=new THREE.Group();const tankBody=new THREE.Mesh(new THREE.CylinderGeometry(1.35,1.35,2.8,28),new THREE.MeshStandardMaterial({color:0x65b8df,metalness:.22,roughness:.42}));tankBody.position.y=3.4;tank.add(tankBody);for(const x of[-.85,.85])for(const z of[-.85,.85]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.09,.12,2.4,10),new THREE.MeshStandardMaterial({color:0x5c6972,metalness:.3}));leg.position.set(x,1.2,z);tank.add(leg)}tank.position.set(-1,0,-2.5);scene.add(tank)

  const treatment=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(4.5,1.2,3.5),new THREE.MeshStandardMaterial({color:0x546c7c,roughness:.72}));base.position.y=.6;treatment.add(base);for(let i=0;i<3;i++){const basin=new THREE.Mesh(new THREE.CylinderGeometry(.7,.7,.45,24),new THREE.MeshStandardMaterial({color:0x49b9da,roughness:.28}));basin.position.set(-1.4+i*1.4,1.2,.2);treatment.add(basin)}treatment.position.set(-4,0,-12);scene.add(treatment)

  const trees:THREE.Group[]=[]
  for(let i=0;i<14;i++){const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.12,.17,1.2,10),new THREE.MeshStandardMaterial({color:0x77513b}));trunk.position.y=.6;g.add(trunk);const crown=new THREE.Mesh(new THREE.SphereGeometry(.65,16,16),new THREE.MeshStandardMaterial({color:highContrast?0x4fcf72:0x4eaa55,roughness:.82}));crown.position.y=1.55;g.add(crown);g.position.set(-14+(i%7)*4,0,-3-Math.floor(i/7)*11);scene.add(g);trees.push(g)}

  const droplets:THREE.Mesh[]=[]
  for(let i=0;i<22;i++){const drop=new THREE.Mesh(new THREE.SphereGeometry(.08,10,10),new THREE.MeshStandardMaterial({color:0xbcefff,emissive:0x167ca4,emissiveIntensity:.15}));drop.scale.y=1.5;drop.position.set(-8+(Math.sin(i*2.4)*1.5),1.3+(i%5)*.6,-14+(i%11)*2.4);scene.add(drop);droplets.push(drop)}

  const pipes:THREE.Mesh[]=[]
  const pipeMaterial=new THREE.MeshStandardMaterial({color:0x4c6673,metalness:.35,roughness:.5})
  for(let i=0;i<3;i++){const pipe=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,8,12),pipeMaterial);pipe.rotation.z=Math.PI/2;pipe.position.set(1.5,0.3,-3-i*4);scene.add(pipe);pipes.push(pipe)}

  let pointerX=0,pointerY=0
  const onPointer=(event:PointerEvent)=>{const rect=mount.getBoundingClientRect();pointerX=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2;pointerY=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2}
  mount.addEventListener('pointermove',onPointer)
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){droplets.forEach((drop,i)=>{drop.position.y+=Math.sin(t*2+i)*.0025;drop.position.x+=Math.sin(t*.7+i)*.0008});trees.forEach((tree,i)=>tree.rotation.z=Math.sin(t*.75+i)*.012);buildings.forEach((b,i)=>b.rotation.y=Math.sin(t*.18+i)*.004);tank.rotation.y=Math.sin(t*.28)*.02;treatment.rotation.y=Math.sin(t*.22)*.012;camera.position.x+=(pointerX*.38-camera.position.x)*.018;camera.position.y+=(7.2-pointerY*.18-camera.position.y)*.018;camera.lookAt(0,1.8,-4.5)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||800,h=mount.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);mount.removeEventListener('pointermove',onPointer);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Se activó la alternativa accesible de Misión Agua.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Ciudad sostenible tridimensional con río, estanque, planta de tratamiento, edificios y red de agua"/>
}
