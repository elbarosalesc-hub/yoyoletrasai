'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Sector='oxigeno'|'energia'|'suministros'|'equilibrio'
type Props={activeSector:Sector;completed:Sector[];reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

const colors:Record<Sector,number>={oxigeno:0x63c7ff,energia:0xffc857,suministros:0x62d394,equilibrio:0xb28dff}

export function ThreeSpaceBase({activeSector,completed,reducedMotion=false,highContrast=false,onReady}:Props){
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
  const background=highContrast?0x02050b:0x071426
  const scene=new THREE.Scene();scene.background=new THREE.Color(background)
  const camera=new THREE.PerspectiveCamera(45,width/height,.1,100);camera.position.set(0,7.2,14.5);camera.lookAt(0,1.3,0)
  scene.add(new THREE.AmbientLight(0xffffff,.8));const key=new THREE.DirectionalLight(0xffffff,2);key.position.set(8,12,6);scene.add(key)

  const stars=new THREE.BufferGeometry();const points:number[]=[]
  for(let i=0;i<220;i++){points.push((Math.random()-.5)*50,(Math.random()-.5)*30,(Math.random()-.5)*40)}
  stars.setAttribute('position',new THREE.Float32BufferAttribute(points,3));scene.add(new THREE.Points(stars,new THREE.PointsMaterial({color:0xffffff,size:.05})))

  const base=new THREE.Group();scene.add(base)
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(2.2,2.4,1.2,28),new THREE.MeshStandardMaterial({color:highContrast?0x22344f:0xdbe7f0,metalness:.55,roughness:.35}));hub.position.y=.6;base.add(hub)
  const dome=new THREE.Mesh(new THREE.SphereGeometry(1.55,28,18,0,Math.PI*2,0,Math.PI/2),new THREE.MeshStandardMaterial({color:0x7bdff2,transparent:true,opacity:.45,metalness:.1,roughness:.15}));dome.position.y=1.2;base.add(dome)

  const sectors:Record<Sector,[number,number,number]>={oxigeno:[-4.4,.7,0],energia:[4.4,.7,0],suministros:[0,.7,4.2],equilibrio:[0,.7,-4.2]}
  ;(Object.entries(sectors) as Array<[Sector,[number,number,number]]>).forEach(([id,pos])=>{
   const active=id===activeSector,done=completed.includes(id)
   const sectorModule=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.35,2.5),new THREE.MeshStandardMaterial({color:active?colors[id]:done?0x4fd19a:highContrast?0x24334a:0x8899aa,emissive:active?colors[id]:done?0x2a7d5d:0x000000,emissiveIntensity:active||done?.35:0,metalness:.45,roughness:.4}));sectorModule.position.set(...pos);sectorModule.castShadow=true;base.add(sectorModule)
   const connector=new THREE.Mesh(new THREE.BoxGeometry(Math.abs(pos[0])>.1?2.2:.75,.35,Math.abs(pos[2])>.1?2.2:.75),new THREE.MeshStandardMaterial({color:0x65798a,metalness:.55,roughness:.4}));connector.position.set(pos[0]*.55,.45,pos[2]*.55);base.add(connector)
   const beacon=new THREE.Mesh(new THREE.SphereGeometry(.18,12,12),new THREE.MeshBasicMaterial({color:active?0xffffff:done?0x9effc8:colors[id]}));beacon.position.set(pos[0],1.65,pos[2]);base.add(beacon)
  })

  const solarMat=new THREE.MeshStandardMaterial({color:0x234a78,metalness:.65,roughness:.25,emissive:activeSector==='energia'?0x1d5b91:0x000000,emissiveIntensity:.35})
  for(const side of[-1,1]){for(let i=0;i<3;i++){const panel=new THREE.Mesh(new THREE.BoxGeometry(1.4,.08,.9),solarMat);panel.position.set(side*(3.7+i*1.3),.4,-4.7);panel.rotation.x=-.25;base.add(panel)}}

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){base.rotation.y=Math.sin(t*.28)*.06;dome.rotation.y=t*.08}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||540;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(item=>item.dispose());else material.dispose()}});stars.dispose()}
 },[activeSector,completed,reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Puedes administrar la base usando los desafíos y tablas textuales.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Base espacial 3D. Sector activo: ${activeSector}. Sectores estabilizados: ${completed.length} de 4.`}/>
}
