'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={reducedMotion?:boolean;highContrast?:boolean;focusId?:string;onReady?:(ready:boolean)=>void}

type FarmObject={id:string;group:THREE.Group;phase:number;baseY:number}

export default function ThreeWordFarm({reducedMotion=false,highContrast=false,focusId='',onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||820,height=mount.clientHeight||500
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x07111f:0xbfe8ff);scene.fog=new THREE.FogExp2(highContrast?0x07111f:0xdff3ff,.024)
  const camera=new THREE.PerspectiveCamera(45,width/height,.1,100);camera.position.set(0,6.4,13.4);camera.lookAt(0,1.5,-4)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x0f2334:0x5f7a45,2.5))
  const sun=new THREE.DirectionalLight(0xfff3c8,4);sun.position.set(8,12,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(34,28),new THREE.MeshStandardMaterial({color:highContrast?0x18382d:0x86bd68,roughness:.96}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const path=new THREE.Mesh(new THREE.PlaneGeometry(5.4,25),new THREE.MeshStandardMaterial({color:highContrast?0x5c6e78:0xe8c894,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,.02,-5);scene.add(path)

  const barn=new THREE.Group();const barnBody=new THREE.Mesh(new THREE.BoxGeometry(6.2,3.4,4),new THREE.MeshStandardMaterial({color:highContrast?0xa93333:0xc94f43,roughness:.78}));barnBody.position.y=1.7;barnBody.castShadow=true;barn.add(barnBody)
  const roof=new THREE.Mesh(new THREE.ConeGeometry(4.7,2.1,4),new THREE.MeshStandardMaterial({color:highContrast?0xf4f4f4:0x623c2c,roughness:.74}));roof.rotation.y=Math.PI/4;roof.scale.z=.72;roof.position.y=4.15;roof.castShadow=true;barn.add(roof)
  const door=new THREE.Mesh(new THREE.BoxGeometry(1.9,2.6,.12),new THREE.MeshStandardMaterial({color:0x70462e,roughness:.9}));door.position.set(0,1.3,2.05);barn.add(door);barn.position.set(0,0,-11);scene.add(barn)

  const fenceMat=new THREE.MeshStandardMaterial({color:highContrast?0xf0f0f0:0xd6bb83,roughness:.9})
  for(const side of[-1,1]){for(let i=0;i<6;i++){const post=new THREE.Mesh(new THREE.BoxGeometry(.14,1.05,.14),fenceMat);post.position.set(side*4.2,.52,-1.2-i*2.2);scene.add(post)}for(const y of[.42,.82]){const rail=new THREE.Mesh(new THREE.BoxGeometry(.13,.13,11.2),fenceMat);rail.position.set(side*4.2,y,-6.7);scene.add(rail)}}

  const farmObjects:FarmObject[]=[]
  const addAnimal=(id:string,x:number,z:number,color:number,accent:number,phase:number)=>{const g=new THREE.Group();const body=new THREE.Mesh(new THREE.CapsuleGeometry(.62,.9,8,20),new THREE.MeshStandardMaterial({color,roughness:.72}));body.rotation.z=Math.PI/2;body.position.y=.78;body.castShadow=true;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.48,20,20),new THREE.MeshStandardMaterial({color:accent,roughness:.68}));head.position.set(.72,1.08,0);head.castShadow=true;g.add(head);for(const sx of[-.42,.35]){for(const sz of[-.32,.32]){const leg=new THREE.Mesh(new THREE.CylinderGeometry(.07,.09,.62,10),new THREE.MeshStandardMaterial({color:0x614b3a}));leg.position.set(sx,.31,sz);g.add(leg)}}for(const ez of[-.25,.25]){const ear=new THREE.Mesh(new THREE.ConeGeometry(.13,.38,10),new THREE.MeshStandardMaterial({color:accent}));ear.position.set(.75,1.53,ez);ear.rotation.z=-.3;g.add(ear)}g.position.set(x,0,z);scene.add(g);farmObjects.push({id,group:g,phase,baseY:0})}
  addAnimal('vaca',-5.7,-4.1,0xf2f2ed,0x4d4b49,.3);addAnimal('pato',5.5,-4.6,0xf0cf4e,0xe29d24,1.5);addAnimal('gato',-5.4,-9.3,0xd78d52,0xb8673b,2.2)

  const addBasket=(id:string,x:number,z:number,color:number,phase:number)=>{const g=new THREE.Group();const basket=new THREE.Mesh(new THREE.CylinderGeometry(.72,.55,.8,18),new THREE.MeshStandardMaterial({color:0x9c663d,roughness:.86}));basket.position.y=.42;g.add(basket);for(let i=0;i<4;i++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.25,16,16),new THREE.MeshStandardMaterial({color,roughness:.58}));fruit.position.set(-.35+i*.23,.9,(i%2?-.1:.12));g.add(fruit)}g.position.set(x,0,z);scene.add(g);farmObjects.push({id,group:g,phase,baseY:0})}
  addBasket('manzana',5.2,-9,0xd9443b,1);addBasket('sol',-3.6,-1,0xf6ce46,2.5)

  const windmill=new THREE.Group();const tower=new THREE.Mesh(new THREE.CylinderGeometry(.36,.68,4.2,14),new THREE.MeshStandardMaterial({color:0xeee3c7,roughness:.75}));tower.position.y=2.1;windmill.add(tower);const rotor=new THREE.Group();for(let i=0;i<4;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.16,2.8,.1),new THREE.MeshStandardMaterial({color:0xe8f1ef,roughness:.6}));blade.position.y=1.25;blade.rotation.z=i*Math.PI/2;rotor.add(blade)}rotor.position.set(0,3.9,.46);windmill.add(rotor);windmill.position.set(6.2,0,-12.5);scene.add(windmill)

  const letters=['M','P','S','L'];letters.forEach((_,i)=>{const tile=new THREE.Mesh(new THREE.BoxGeometry(1.05,.18,1.05),new THREE.MeshStandardMaterial({color:[0x5fb7dd,0xef9061,0xe9c54d,0x8f79d9][i],roughness:.58}));tile.position.set(-2.1+i*1.4,.12,1.3);tile.castShadow=true;scene.add(tile)})

  let pointerX=0,pointerY=0;const onPointer=(event:PointerEvent)=>{const rect=mount.getBoundingClientRect();pointerX=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2;pointerY=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2};mount.addEventListener('pointermove',onPointer)
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){rotor.rotation.z=t*.8;farmObjects.forEach((item,index)=>{item.group.position.y=item.baseY+Math.sin(t*1.4+item.phase)*.035;item.group.rotation.y=Math.sin(t*.55+item.phase)*.12+(index%2?Math.PI:0)});camera.position.x+=(pointerX*.3-camera.position.x)*.018;camera.position.y+=(6.4-pointerY*.12-camera.position.y)*.018;camera.lookAt(0,1.5,-4)}farmObjects.forEach(item=>{const focused=item.id===focusId;item.group.scale.lerp(new THREE.Vector3(focused?1.14:1,focused?1.14:1,focused?1.14:1),.08)});renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||500;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);mount.removeEventListener('pointermove',onPointer);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[reducedMotion,highContrast,focusId,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Usa las tarjetas textuales de la granja para completar la misión.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Granja tridimensional animada con establo, animales, canastos, molino y fichas de letras"/>
}
