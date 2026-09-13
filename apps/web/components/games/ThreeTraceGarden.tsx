'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={progress:number;stage:number;reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

export function ThreeTraceGarden({progress,stage,reducedMotion=false,highContrast=false,onReady}:Props){
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
  const bg=highContrast?0x061016:0xeaf7ef
  const scene=new THREE.Scene();scene.background=new THREE.Color(bg)
  const camera=new THREE.PerspectiveCamera(44,width/height,.1,100);camera.position.set(0,6.5,12);camera.lookAt(0,1,0)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x142634:0x8aac8b,1.45));const sun=new THREE.DirectionalLight(0xffffff,1.9);sun.position.set(7,10,7);scene.add(sun)
  const ground=new THREE.Mesh(new THREE.CircleGeometry(7.5,48),new THREE.MeshStandardMaterial({color:highContrast?0x163326:0x99cf8a,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)

  const path=new THREE.Group();scene.add(path)
  for(let i=0;i<28;i++){
   const x=-5+i*.38
   const z=Math.sin(i*.55+stage*.65)*1.15
   const tile=new THREE.Mesh(new THREE.CylinderGeometry(.19,.23,.1,10),new THREE.MeshStandardMaterial({color:i/27*100<=progress?0xffd166:highContrast?0x415165:0xd7c3a5,emissive:i/27*100<=progress?0x7a5310:0x000000,emissiveIntensity:.25,roughness:.8}));tile.position.set(x,.06,z);path.add(tile)
  }

  const flowers=new THREE.Group();scene.add(flowers)
  for(let i=0;i<12;i++){
   const angle=i/12*Math.PI*2
   const stem=new THREE.Mesh(new THREE.CylinderGeometry(.035,.05,.65,8),new THREE.MeshStandardMaterial({color:0x318a52}));stem.position.set(Math.cos(angle)*5.6,.33,Math.sin(angle)*5.6);flowers.add(stem)
   const bloom=new THREE.Mesh(new THREE.SphereGeometry(.18,12,10),new THREE.MeshStandardMaterial({color:i/11*100<=progress?0xff75a0:highContrast?0x5d6980:0xffffff,emissive:i/11*100<=progress?0x6b1935:0x000000,emissiveIntensity:.28}));bloom.position.set(Math.cos(angle)*5.6,.72,Math.sin(angle)*5.6);flowers.add(bloom)
  }
  const arch=new THREE.Group();scene.add(arch)
  for(const side of[-1,1]){const post=new THREE.Mesh(new THREE.BoxGeometry(.28,2.5,.28),new THREE.MeshStandardMaterial({color:0x8d6e63}));post.position.set(side*1.5,1.25,-4.7);arch.add(post)}
  const top=new THREE.Mesh(new THREE.TorusGeometry(1.5,.16,10,30,Math.PI),new THREE.MeshStandardMaterial({color:progress>=100?0x62d394:0x8d6e63,emissive:progress>=100?0x216b4c:0x000000,emissiveIntensity:.3}));top.rotation.z=Math.PI;top.position.set(0,2.5,-4.7);arch.add(top)

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){flowers.rotation.y=Math.sin(t*.35)*.035;path.position.y=Math.sin(t*.8)*.015}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||540;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[progress,stage,reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. El trazado táctil sigue funcionando normalmente.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Jardín 3D de progreso. Trazado completado: ${progress}%.`}/>
}
