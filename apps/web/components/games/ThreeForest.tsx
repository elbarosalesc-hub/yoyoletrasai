'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

export default function ThreeForest({reducedMotion=false,highContrast=false,onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const [fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||800;const height=mount.clientHeight||520
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true
  renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x0e2030:0x9fdcff);scene.fog=new THREE.Fog(highContrast?0x0e2030:0xcfeee4,12,32)
  const camera=new THREE.PerspectiveCamera(48,width/height,.1,100);camera.position.set(0,5.4,11);camera.lookAt(0,1.4,0)
  const hemi=new THREE.HemisphereLight(highContrast?0xffffff:0xe8fbff,0x254632,2.4);scene.add(hemi)
  const sun=new THREE.DirectionalLight(0xfff3c4,3.4);sun.position.set(7,10,5);sun.castShadow=true;scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(34,34,32,32),new THREE.MeshStandardMaterial({color:highContrast?0x17482d:0x3d8b50,roughness:.92}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const path=new THREE.Mesh(new THREE.PlaneGeometry(4,25),new THREE.MeshStandardMaterial({color:highContrast?0xe6c078:0xd8b985,roughness:1}));path.rotation.x=-Math.PI/2;path.position.y=.02;path.position.z=-5;scene.add(path)
  const trunks:THREE.Group[]=[]
  const makeTree=(x:number,z:number,s=1)=>{const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.18,.28,2.2,8),new THREE.MeshStandardMaterial({color:0x704735}));trunk.castShadow=true;trunk.position.y=1.1;g.add(trunk);const crown=new THREE.Mesh(new THREE.ConeGeometry(1.25,3.3,10),new THREE.MeshStandardMaterial({color:highContrast?0x1ecf63:0x2d8b50}));crown.position.y=3.2;crown.castShadow=true;g.add(crown);g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);trunks.push(g)}
  ;[[-5,-2,1.2],[-7,-7,1.5],[-4,-10,1],[-8,-14,1.35],[5,-3,1.1],[7,-8,1.45],[4,-12,1],[8,-15,1.3]].forEach(v=>makeTree(v[0],v[1],v[2]))
  const cabin=new THREE.Group();const body=new THREE.Mesh(new THREE.BoxGeometry(3.6,2.5,3),new THREE.MeshStandardMaterial({color:0xb8683f}));body.position.y=1.25;body.castShadow=true;cabin.add(body);const roof=new THREE.Mesh(new THREE.ConeGeometry(3,1.7,4),new THREE.MeshStandardMaterial({color:0x704533}));roof.rotation.y=Math.PI/4;roof.position.y=3.15;roof.castShadow=true;cabin.add(roof);const door=new THREE.Mesh(new THREE.BoxGeometry(.8,1.5,.15),new THREE.MeshStandardMaterial({color:0x51372c}));door.position.set(0,.76,1.58);cabin.add(door);cabin.position.set(4.2,0,-7);scene.add(cabin)
  const guide=new THREE.Group();const head=new THREE.Mesh(new THREE.SphereGeometry(.48,24,24),new THREE.MeshStandardMaterial({color:0xf0b17c}));head.position.y=2.35;head.castShadow=true;guide.add(head);const bodyGuide=new THREE.Mesh(new THREE.CapsuleGeometry(.55,1.25,8,16),new THREE.MeshStandardMaterial({color:0x7547df}));bodyGuide.position.y=1.15;bodyGuide.castShadow=true;guide.add(bodyGuide);guide.position.set(-.4,0,1.5);scene.add(guide)
  const fireflies:Array<{mesh:THREE.Mesh;speed:number;phase:number}>=[]
  for(let i=0;i<24;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.035,8,8),new THREE.MeshBasicMaterial({color:0xfff09a}));mesh.position.set((Math.random()-.5)*12,.6+Math.random()*4,-2-Math.random()*14);scene.add(mesh);fireflies.push({mesh,speed:.25+Math.random()*.55,phase:Math.random()*Math.PI*2})}
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){guide.rotation.y=Math.sin(t*.65)*.12;guide.position.y=Math.sin(t*1.4)*.05;trunks.forEach((g,i)=>g.rotation.z=Math.sin(t*.35+i)*.008);fireflies.forEach(f=>{f.mesh.position.y+=Math.sin(t*f.speed+f.phase)*.0018;f.mesh.material=(f.mesh.material as THREE.Material)})}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||800;const h=mount.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
  window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();mount.removeChild(renderer.domElement);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}})}
 },[reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Se activó la escena accesible equivalente.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Escena tridimensional animada del bosque"/>
}
