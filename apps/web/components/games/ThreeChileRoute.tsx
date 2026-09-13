'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type ZoneId='norte'|'centro'|'sur'|'austral'
type Props={activeZone:ZoneId;completed:ZoneId[];reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

const zoneData:Record<ZoneId,{y:number;color:number,height:number}>={
 norte:{y:5.4,color:0xd59b45,height:3.8},
 centro:{y:1.5,color:0x79a95a,height:2.8},
 sur:{y:-2.0,color:0x3f927c,height:3.0},
 austral:{y:-5.7,color:0x6f91ae,height:4.0},
}

export default function ThreeChileRoute({activeZone,completed,reducedMotion=false,highContrast=false,onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||820,height=mount.clientHeight||540
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)
  const sky=highContrast?0x06121f:0xcfe9f5
  const scene=new THREE.Scene();scene.background=new THREE.Color(sky);scene.fog=new THREE.FogExp2(sky,.025)
  const camera=new THREE.PerspectiveCamera(42,width/height,.1,100);camera.position.set(11,3.5,16);camera.lookAt(0,0,0)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x122438:0x7194a3,1.5))
  const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(9,13,8);sun.castShadow=true;scene.add(sun)

  const ocean=new THREE.Mesh(new THREE.PlaneGeometry(30,24),new THREE.MeshStandardMaterial({color:highContrast?0x0b4167:0x5cb6d8,roughness:.48,metalness:.05}));ocean.rotation.x=-Math.PI/2;ocean.position.y=-.45;ocean.receiveShadow=true;scene.add(ocean)
  const route=new THREE.Group();route.rotation.z=-.12;scene.add(route)

  const zoneMeshes=new Map<ZoneId,THREE.Group>()
  ;(Object.entries(zoneData) as Array<[ZoneId,(typeof zoneData)[ZoneId]]>).forEach(([id,data])=>{
   const group=new THREE.Group();group.position.y=data.y;route.add(group);zoneMeshes.set(id,group)
   const active=id===activeZone,done=completed.includes(id)
   const landColor=active?(highContrast?0xffef55:0xffd166):done?(highContrast?0x2de2a7:0x62b58d):data.color
   const shape=new THREE.Shape();shape.moveTo(-.9,data.height/2);shape.bezierCurveTo(-1.3,data.height*.18,-.65,-data.height*.18,-.85,-data.height/2);shape.bezierCurveTo(-.2,-data.height*.58,.4,-data.height*.4,.62,-data.height/2);shape.bezierCurveTo(.72,-data.height*.12,.42,data.height*.15,.7,data.height/2);shape.bezierCurveTo(.2,data.height*.58,-.35,data.height*.48,-.9,data.height/2)
   const geometry=new THREE.ExtrudeGeometry(shape,{depth:.38,bevelEnabled:true,bevelSize:.05,bevelThickness:.05,bevelSegments:2})
   const land=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:landColor,roughness:.72,metalness:.04,emissive:active?landColor:0x000000,emissiveIntensity:active ? .12 : 0}));land.rotation.x=Math.PI/2;land.rotation.z=Math.PI;land.position.z=-.15;land.castShadow=true;group.add(land)
   const marker=new THREE.Mesh(new THREE.CylinderGeometry(.17,.17,.75,12),new THREE.MeshStandardMaterial({color:active?0xffffff:done?0xeafff7:0x26334c,roughness:.5}));marker.rotation.x=Math.PI/2;marker.position.set(1.15,0,.55);group.add(marker)
   const light=new THREE.Mesh(new THREE.SphereGeometry(.19,14,14),new THREE.MeshStandardMaterial({color:active?0xfff3a0:done?0x8ff0c8:0xffffff,emissive:active?0xffd166:done?0x2a9d8f:0x000000,emissiveIntensity:active||done ? .8 : 0}));light.position.set(1.15,0,.96);group.add(light)
  })

  const pathMaterial=new THREE.MeshStandardMaterial({color:highContrast?0xffffff:0xf9f4dc,roughness:.72})
  for(let i=0;i<11;i++){
   const dot=new THREE.Mesh(new THREE.SphereGeometry(.07,10,10),pathMaterial);dot.position.set(1.15,5.2-i*1.02,.48);route.add(dot)
  }
  const plane=new THREE.Group();route.add(plane)
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(.18,.65,5,10),new THREE.MeshStandardMaterial({color:highContrast?0xff4f86:0xe85d75,roughness:.45}));body.rotation.z=Math.PI/2;plane.add(body)
  const wing=new THREE.Mesh(new THREE.BoxGeometry(.16,.95,.06),new THREE.MeshStandardMaterial({color:0xffffff,roughness:.5}));wing.rotation.z=Math.PI/2;plane.add(wing)
  plane.position.set(2.05,zoneData[activeZone].y,.85)

  const mountains=new THREE.Group();scene.add(mountains)
  for(let i=0;i<13;i++){
   const cone=new THREE.Mesh(new THREE.ConeGeometry(.35+(i%3)*.12,1+(i%4)*.22,8),new THREE.MeshStandardMaterial({color:highContrast?0xdde9f5:0x8b8f91,roughness:.9}));cone.position.set(3.1+(i%2)*.35,-6+i*.95,.15);cone.rotation.z=i%2 ? .08 : -.08;mountains.add(cone)
  }

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();const targetY=zoneData[activeZone].y;if(!reducedMotion){plane.position.y+=(targetY-plane.position.y)*.035;plane.position.x=2.05+Math.sin(t*1.8)*.08;plane.rotation.z=Math.sin(t*1.4)*.04;const active=zoneMeshes.get(activeZone);if(active)active.rotation.y=Math.sin(t*1.3)*.035}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||540;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}})}
 },[activeZone,completed,reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Puedes completar la ruta usando las tarjetas de macrozonas y descripciones textuales.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Mapa 3D estilizado de Chile. Macrozona activa: ${activeZone}. Zonas completadas: ${completed.length} de 4.`}/>
}
