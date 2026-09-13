'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={
 numerator:number
 denominator:number
 targetNumerator:number
 targetDenominator:number
 reducedMotion?:boolean
 highContrast?:boolean
 onReady?:(ready:boolean)=>void
}

export default function ThreeFractionCity({numerator,denominator,targetNumerator,targetDenominator,reducedMotion=false,highContrast=false,onReady}:Props){
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

  const sky=highContrast?0x06101f:0xd7efff
  const scene=new THREE.Scene();scene.background=new THREE.Color(sky);scene.fog=new THREE.FogExp2(sky,.017)
  const camera=new THREE.PerspectiveCamera(44,width/height,.1,120);camera.position.set(9,8.2,15.5);camera.lookAt(0,1,-3)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x16203b:0x8db57a,1.55))
  const sun=new THREE.DirectionalLight(0xffffff,2.1);sun.position.set(8,14,8);sun.castShadow=true;scene.add(sun)

  const ground=new THREE.Mesh(new THREE.PlaneGeometry(30,26),new THREE.MeshStandardMaterial({color:highContrast?0x102238:0x8ec77a,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.position.y=-.04;ground.receiveShadow=true;scene.add(ground)
  const roadMaterial=new THREE.MeshStandardMaterial({color:highContrast?0x253148:0x454b54,roughness:.9})
  const roadA=new THREE.Mesh(new THREE.BoxGeometry(3.2,.08,24),roadMaterial);roadA.position.set(0,.02,-2);scene.add(roadA)
  const roadB=new THREE.Mesh(new THREE.BoxGeometry(23,.08,3),roadMaterial);roadB.position.set(0,.025,-3);scene.add(roadB)

  const district=new THREE.Group();scene.add(district)
  const activeColor=highContrast?0xffef4a:0x6f56d9
  const inactiveColor=highContrast?0x4a5568:0xe7e9f2
  const targetColor=highContrast?0x2de2a7:0x2a9d8f
  const segmentWidth=6/Math.max(denominator,1)
  for(let i=0;i<denominator;i++){
   const height=1.5+(i%3)*.45
   const building=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.5,segmentWidth*.82),height,2.7),new THREE.MeshStandardMaterial({color:i<numerator?activeColor:inactiveColor,roughness:.62,metalness:.06}))
   building.position.set(-3+segmentWidth/2+i*segmentWidth,height/2,-6.2);building.castShadow=true;building.receiveShadow=true;district.add(building)
   const roof=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.38,segmentWidth*.55),.12,1.5),new THREE.MeshStandardMaterial({color:i<numerator?0xffffff:0xb8bdca,emissive:i<numerator?activeColor:0x000000,emissiveIntensity:i<numerator?.15:0,roughness:.75}));roof.position.set(building.position.x,height+.08,-6.2);district.add(roof)
  }

  const targetGroup=new THREE.Group();scene.add(targetGroup)
  const targetWidth=5.4/Math.max(targetDenominator,1)
  for(let i=0;i<targetDenominator;i++){
   const piece=new THREE.Mesh(new THREE.BoxGeometry(Math.max(.45,targetWidth*.78),.46,1.55),new THREE.MeshStandardMaterial({color:i<targetNumerator?targetColor:inactiveColor,roughness:.7}))
   piece.position.set(-2.7+targetWidth/2+i*targetWidth,.25,2.4);piece.castShadow=true;targetGroup.add(piece)
  }

  const park=new THREE.Group();scene.add(park)
  for(let i=0;i<9;i++){
   const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.08,.11,.65,8),new THREE.MeshStandardMaterial({color:0x73553a,roughness:.9}));trunk.position.set(-7+(i%3)*1.05,.34,-.5-Math.floor(i/3)*1.2);park.add(trunk)
   const crown=new THREE.Mesh(new THREE.SphereGeometry(.33,12,12),new THREE.MeshStandardMaterial({color:highContrast?0x32dc73:0x4a9c58,roughness:.8}));crown.position.set(trunk.position.x,.9,trunk.position.z);park.add(crown)
  }

  const plaza=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.2,.16,40),new THREE.MeshStandardMaterial({color:highContrast?0x334766:0xe9d3a3,roughness:.85}));plaza.position.set(6,.08,2.4);scene.add(plaza)
  const tower=new THREE.Mesh(new THREE.CylinderGeometry(.62,.82,3.7,14),new THREE.MeshStandardMaterial({color:targetColor,roughness:.55}));tower.position.set(6,1.93,2.4);tower.castShadow=true;scene.add(tower)
  const beacon=new THREE.Mesh(new THREE.SphereGeometry(.3,16,16),new THREE.MeshStandardMaterial({color:0xffffff,emissive:targetColor,emissiveIntensity:.9}));beacon.position.set(6,4.05,2.4);scene.add(beacon)

  const fractionValue=denominator?numerator/denominator:0
  const targetValue=targetDenominator?targetNumerator/targetDenominator:0
  const close=Math.abs(fractionValue-targetValue)<.0001
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.8,.08,12,72),new THREE.MeshStandardMaterial({color:close?targetColor:activeColor,emissive:close?targetColor:0x000000,emissiveIntensity:close?.55:0}));ring.rotation.x=Math.PI/2;ring.position.set(0,.12,-6.2);scene.add(ring)

  let px=0,py=0
  const pointer=(event:PointerEvent)=>{const rect=mount.getBoundingClientRect();px=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2;py=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2}
  mount.addEventListener('pointermove',pointer)
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){ring.rotation.z=t*.15;beacon.position.y=4.05+Math.sin(t*2)*.08;camera.position.x+=(9+px*.55-camera.position.x)*.015;camera.position.y+=(8.2-py*.28-camera.position.y)*.015;camera.lookAt(0,1,-3)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||500;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);mount.removeEventListener('pointermove',pointer);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[numerator,denominator,targetNumerator,targetDenominator,reducedMotion,highContrast,onReady])

 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Puedes completar todos los desafíos con las representaciones numéricas y controles textuales.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Ciudad tridimensional que representa ${numerator} de ${denominator} partes activas; objetivo ${targetNumerator} de ${targetDenominator}`}/>
}
