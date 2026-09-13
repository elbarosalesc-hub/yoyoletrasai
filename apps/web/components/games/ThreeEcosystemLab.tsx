'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={
 water:number
 light:number
 biodiversity:number
 pollution:number
 reducedMotion?:boolean
 highContrast?:boolean
 onReady?:(ready:boolean)=>void
}

export default function ThreeEcosystemLab({water,light,biodiversity,pollution,reducedMotion=false,highContrast=false,onReady}:Props){
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
  const sky=highContrast?0x061321:0xadddff
  const scene=new THREE.Scene();scene.background=new THREE.Color(sky);scene.fog=new THREE.FogExp2(sky,.022)
  const camera=new THREE.PerspectiveCamera(45,width/height,.1,100);camera.position.set(0,7.2,13.8);camera.lookAt(0,1,-4)
  const hemi=new THREE.HemisphereLight(0xffffff,highContrast?0x102719:0x416b39,Math.max(.8,light/32));scene.add(hemi)
  const sun=new THREE.DirectionalLight(0xffefb0,Math.max(.3,light/18));sun.position.set(7,12,5);sun.castShadow=true;scene.add(sun)
  const groundColor=highContrast?0x163b27:0x6ba854
  const ground=new THREE.Mesh(new THREE.CylinderGeometry(7.6,8.2,1.2,48),new THREE.MeshStandardMaterial({color:groundColor,roughness:.96}));ground.position.y=-.6;ground.receiveShadow=true;scene.add(ground)
  const waterColor=highContrast?0x3dc8ff:pollution>60?0x56746f:0x4da9db
  const pond=new THREE.Mesh(new THREE.CylinderGeometry(2.5,2.55,.14,40),new THREE.MeshStandardMaterial({color:waterColor,metalness:.05,roughness:.25,transparent:true,opacity:.82}));pond.position.set(-2.2,.08,-2.5);pond.scale.x=.6+.55*(water/100);pond.scale.z=.6+.55*(water/100);scene.add(pond)

  const plantGroup=new THREE.Group();scene.add(plantGroup)
  const plantCount=Math.max(3,Math.round(4+biodiversity/7))
  for(let i=0;i<plantCount;i++){
   const angle=(i/plantCount)*Math.PI*2
   const radius=3.2+(i%3)*.75
   const x=Math.cos(angle)*radius,z=-3+Math.sin(angle)*radius*.72
   const healthy=Math.max(.15,1-pollution/120)*(.45+water/180)*(.45+light/180)
   const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.09,.14,.65+healthy*.8,8),new THREE.MeshStandardMaterial({color:0x5b4129,roughness:.9}));trunk.position.set(x,.35+healthy*.4,z);trunk.castShadow=true;plantGroup.add(trunk)
   const crown=new THREE.Mesh(new THREE.SphereGeometry(.35+healthy*.42,12,12),new THREE.MeshStandardMaterial({color:pollution>65?0x7c8451:highContrast?0x44dd70:0x3f8d4f,roughness:.8}));crown.position.set(x,.95+healthy*.8,z);crown.castShadow=true;plantGroup.add(crown)
  }

  const rocks=new THREE.Group();scene.add(rocks)
  for(let i=0;i<8;i++){const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.25+(i%3)*.08),new THREE.MeshStandardMaterial({color:0x7b817e,roughness:1}));rock.position.set(-4+i*1.1,.15,-.6-(i%2)*.5);rocks.add(rock)}

  const animals=new THREE.Group();scene.add(animals)
  const animalCount=Math.max(1,Math.round(biodiversity/22))
  for(let i=0;i<animalCount;i++){
   const body=new THREE.Mesh(new THREE.SphereGeometry(.26,14,14),new THREE.MeshStandardMaterial({color:[0xe9a342,0xc5d36a,0xb57c50,0x7aa6d8][i%4],roughness:.72}));body.scale.set(1.35,.75,.85);body.position.set(-1.2+i*1.25,.42,-5+(i%2)*1.1);body.castShadow=true;animals.add(body)
   const head=new THREE.Mesh(new THREE.SphereGeometry(.16,12,12),(body.material as THREE.Material).clone() as THREE.MeshStandardMaterial);head.position.set(body.position.x+.3,.5,body.position.z);animals.add(head)
  }

  const pollutionGroup=new THREE.Group();scene.add(pollutionGroup)
  const particleCount=Math.round(pollution/10)
  for(let i=0;i<particleCount;i++){const trash=new THREE.Mesh(new THREE.BoxGeometry(.16,.08,.24),new THREE.MeshStandardMaterial({color:i%2?0xb94d45:0xc1b64d,roughness:.8}));trash.position.set(-3.7+(i%5)*1.05,.16,-1.5-Math.floor(i/5)*.7);trash.rotation.y=i*.7;pollutionGroup.add(trash)}

  const labRing=new THREE.Mesh(new THREE.TorusGeometry(7.7,.08,10,80),new THREE.MeshStandardMaterial({color:highContrast?0xffffff:0xe8f2ef,emissive:highContrast?0x445566:0x000000}));labRing.rotation.x=Math.PI/2;labRing.position.y=.02;scene.add(labRing)

  let px=0,py=0;const pointer=(event:PointerEvent)=>{const rect=mount.getBoundingClientRect();px=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2;py=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2};mount.addEventListener('pointermove',pointer)
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){animals.children.forEach((object,index)=>{object.position.y+=(Math.sin(t*2+index)*.002)});pond.rotation.y=t*.08;camera.position.x+=(px*.28-camera.position.x)*.018;camera.position.y+=(7.2-py*.15-camera.position.y)*.018;camera.lookAt(0,1,-4)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||500;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);mount.removeEventListener('pointermove',pointer);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[water,light,biodiversity,pollution,reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Usa los controles y resultados textuales del laboratorio para completar la simulación.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Ecosistema tridimensional dinámico con agua, plantas, animales y contaminación que cambia según las variables"/>
}
