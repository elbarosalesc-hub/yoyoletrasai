'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type SystemId='respiratorio'|'circulatorio'|'digestivo'|'integracion'
type Props={activeSystem:SystemId;completed:SystemId[];reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

const systemColors:Record<SystemId,number>={
 respiratorio:0x62b6cb,
 circulatorio:0xe25555,
 digestivo:0xf0a44b,
 integracion:0x8a6fd1,
}

export default function ThreeHumanBodyExpedition({activeSystem,completed,reducedMotion=false,highContrast=false,onReady}:Props){
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

  const background=highContrast?0x071018:0xeaf3f6
  const scene=new THREE.Scene();scene.background=new THREE.Color(background);scene.fog=new THREE.FogExp2(background,.012)
  const camera=new THREE.PerspectiveCamera(43,width/height,.1,100);camera.position.set(0,4.2,12.2);camera.lookAt(0,1.3,0)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x112131:0x8ba1ad,1.45))
  const key=new THREE.DirectionalLight(0xffffff,2.2);key.position.set(6,10,8);key.castShadow=true;scene.add(key)

  const floor=new THREE.Mesh(new THREE.CircleGeometry(7.4,48),new THREE.MeshStandardMaterial({color:highContrast?0x14263a:0xc9dde5,roughness:.92}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor)
  const platform=new THREE.Mesh(new THREE.CylinderGeometry(2.9,3.3,.38,40),new THREE.MeshStandardMaterial({color:highContrast?0x243b52:0xffffff,roughness:.7,metalness:.05}));platform.position.y=.18;platform.receiveShadow=true;scene.add(platform)

  const body=new THREE.Group();scene.add(body)
  const bodyMaterial=new THREE.MeshStandardMaterial({color:highContrast?0xe8eef6:0xf3d2bc,transparent:true,opacity:.38,roughness:.78})
  const torso=new THREE.Mesh(new THREE.CapsuleGeometry(1.28,3.7,9,20),bodyMaterial);torso.position.y=2.7;torso.castShadow=true;body.add(torso)
  const head=new THREE.Mesh(new THREE.SphereGeometry(.82,28,24),bodyMaterial);head.position.y=5.45;body.add(head)
  for(const side of[-1,1]){
   const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.24,2.8,6,12),bodyMaterial);arm.position.set(side*1.65,2.75,0);arm.rotation.z=side*.17;body.add(arm)
   const leg=new THREE.Mesh(new THREE.CapsuleGeometry(.34,3.1,6,12),bodyMaterial);leg.position.set(side*.62,-.3,0);body.add(leg)
  }

  const organGroups=new Map<SystemId,THREE.Group>()
  const makeGroup=(id:SystemId)=>{const group=new THREE.Group();body.add(group);organGroups.set(id,group);return group}

  const respiratory=makeGroup('respiratorio')
  const lungMat=new THREE.MeshStandardMaterial({color:systemColors.respiratorio,roughness:.48,emissive:activeSystem==='respiratorio'?systemColors.respiratorio:0x000000,emissiveIntensity:activeSystem==='respiratorio'?.28:0})
  for(const side of[-1,1]){const lung=new THREE.Mesh(new THREE.SphereGeometry(.62,22,18),lungMat);lung.scale.set(.85,1.35,.55);lung.position.set(side*.63,3.55,.2);respiratory.add(lung)}
  const trachea=new THREE.Mesh(new THREE.CylinderGeometry(.12,.12,1.55,12),new THREE.MeshStandardMaterial({color:0xb9dce6,roughness:.4}));trachea.position.set(0,4.65,.14);respiratory.add(trachea)

  const circulatory=makeGroup('circulatorio')
  const heart=new THREE.Mesh(new THREE.SphereGeometry(.46,22,18),new THREE.MeshStandardMaterial({color:systemColors.circulatorio,roughness:.35,emissive:activeSystem==='circulatorio'?systemColors.circulatorio:0x000000,emissiveIntensity:activeSystem==='circulatorio'?.35:0}));heart.scale.set(.9,1.15,.78);heart.position.set(.18,3.25,.75);circulatory.add(heart)
  const vesselMat=new THREE.MeshStandardMaterial({color:0xc33f4d,roughness:.4})
  for(const [x,y,h] of [[0,1.2,3.4],[-.65,1.5,2.5],[.65,1.5,2.5]] as Array<[number,number,number]>){const vessel=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,h,8),vesselMat);vessel.position.set(x,y,.58);circulatory.add(vessel)}

  const digestive=makeGroup('digestivo')
  const stomach=new THREE.Mesh(new THREE.SphereGeometry(.5,20,16),new THREE.MeshStandardMaterial({color:systemColors.digestivo,roughness:.48,emissive:activeSystem==='digestivo'?systemColors.digestivo:0x000000,emissiveIntensity:activeSystem==='digestivo'?.3:0}));stomach.scale.set(.85,1.2,.65);stomach.position.set(.42,2.15,.45);digestive.add(stomach)
  const intestine=new THREE.Mesh(new THREE.TorusKnotGeometry(.55,.11,80,10,2,3),new THREE.MeshStandardMaterial({color:0xd87b45,roughness:.58}));intestine.scale.set(1.0,.72,.55);intestine.position.set(0,1.15,.35);digestive.add(intestine)

  const integration=makeGroup('integracion')
  const brain=new THREE.Mesh(new THREE.SphereGeometry(.52,24,20),new THREE.MeshStandardMaterial({color:systemColors.integracion,roughness:.5,emissive:activeSystem==='integracion'?systemColors.integracion:0x000000,emissiveIntensity:activeSystem==='integracion'?.32:0}));brain.scale.set(1.05,.72,.9);brain.position.set(0,5.48,.1);integration.add(brain)
  const spinal=new THREE.Mesh(new THREE.CylinderGeometry(.065,.065,4.2,10),new THREE.MeshStandardMaterial({color:0x9c88d8,roughness:.45}));spinal.position.set(0,2.85,-.62);integration.add(spinal)

  organGroups.forEach((group,id)=>{
   const active=id===activeSystem
   const done=completed.includes(id)
   group.traverse(object=>{if(object instanceof THREE.Mesh){object.visible=true;if(done){const mat=object.material;if(!Array.isArray(mat)&&'emissive'in mat){mat.emissive=new THREE.Color(0x4bc78d);mat.emissiveIntensity=Math.max(mat.emissiveIntensity,.18)}}}})
   if(!active&&!done)group.scale.setScalar(.84)
  })

  const scanner=new THREE.Group();scene.add(scanner)
  const ring=new THREE.Mesh(new THREE.TorusGeometry(3.15,.06,10,70),new THREE.MeshStandardMaterial({color:systemColors[activeSystem],emissive:systemColors[activeSystem],emissiveIntensity:.6,roughness:.3}));ring.rotation.x=Math.PI/2;ring.position.y=2.8;scanner.add(ring)
  for(let i=0;i<6;i++){const light=new THREE.Mesh(new THREE.SphereGeometry(.08,10,10),new THREE.MeshBasicMaterial({color:0xffffff}));const angle=i/6*Math.PI*2;light.position.set(Math.cos(angle)*3.15,2.8,Math.sin(angle)*3.15);scanner.add(light)}

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){ring.rotation.z=t*.18;heart.scale.set(.9*(1+Math.sin(t*4)*.035),1.15*(1+Math.sin(t*4)*.035),.78*(1+Math.sin(t*4)*.035));respiratory.scale.set(1+Math.sin(t*2)*.025,1+Math.sin(t*2)*.04,1+Math.sin(t*2)*.025);body.rotation.y=Math.sin(t*.45)*.045}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||540;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[activeSystem,completed,reducedMotion,highContrast,onReady])

 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Puedes completar toda la expedición usando la alternativa textual y los desafíos escritos.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Exploración anatómica 3D. Sistema activo: ${activeSystem}. Etapas completadas: ${completed.length} de 4.`}/>
}
