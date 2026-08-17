'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

export default function ThreeFair({reducedMotion=false,highContrast=false,onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||800;const height=mount.clientHeight||520
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true
  renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x121a2b:0xbfe7ff);scene.fog=new THREE.Fog(highContrast?0x121a2b:0xe9f7ff,14,36)
  const camera=new THREE.PerspectiveCamera(46,width/height,.1,100);camera.position.set(0,6.2,12.5);camera.lookAt(0,1.7,-2)
  scene.add(new THREE.HemisphereLight(0xffffff,0x4b6744,2.5))
  const sun=new THREE.DirectionalLight(0xfff1ca,3.8);sun.position.set(7,11,6);sun.castShadow=true;scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(34,30),new THREE.MeshStandardMaterial({color:highContrast?0x20334d:0xe6d2a7,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const lane=new THREE.Mesh(new THREE.PlaneGeometry(7,26),new THREE.MeshStandardMaterial({color:highContrast?0x314660:0xf3e7ca,roughness:1}));lane.rotation.x=-Math.PI/2;lane.position.y=.02;lane.position.z=-4;scene.add(lane)
  const stalls:THREE.Group[]=[]
  const stallColors=[0xff7f6e,0x46b6aa,0xf3b24f,0x7267d9]
  const addStall=(x:number,z:number,color:number,labelColor:number)=>{const g=new THREE.Group();const base=new THREE.Mesh(new THREE.BoxGeometry(3.4,1.35,2.3),new THREE.MeshStandardMaterial({color,roughness:.72}));base.position.y=.68;base.castShadow=true;g.add(base);const roof=new THREE.Mesh(new THREE.BoxGeometry(3.8,.18,2.7),new THREE.MeshStandardMaterial({color:labelColor,roughness:.65}));roof.position.y=2.15;roof.castShadow=true;g.add(roof);for(const sx of[-1.45,1.45]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1.5,8),new THREE.MeshStandardMaterial({color:0x79533c}));post.position.set(sx,1.45,.9);g.add(post)};for(let i=0;i<5;i++){const item=new THREE.Mesh(new THREE.SphereGeometry(.22,14,14),new THREE.MeshStandardMaterial({color:i%2?0xffd45a:0x83c95b}));item.position.set(-1.1+i*.55,1.48,.35);item.castShadow=true;g.add(item)}g.position.set(x,0,z);scene.add(g);stalls.push(g)}
  addStall(-5,-4,stallColors[0],0xfff1e7);addStall(5,-4,stallColors[1],0xe8fff9);addStall(-5,-10,stallColors[2],0xfff6d8);addStall(5,-10,stallColors[3],0xf1edff)
  const register=new THREE.Group();const desk=new THREE.Mesh(new THREE.BoxGeometry(3.2,1.2,1.8),new THREE.MeshStandardMaterial({color:0x24415f}));desk.position.y=.6;desk.castShadow=true;register.add(desk);const screen=new THREE.Mesh(new THREE.BoxGeometry(1.25,.8,.12),new THREE.MeshStandardMaterial({color:0x98f4d0,emissive:0x1a6b50,emissiveIntensity:.15}));screen.position.set(0,1.45,.72);register.add(screen);register.position.set(0,0,-15);scene.add(register)
  const guide=new THREE.Group();const head=new THREE.Mesh(new THREE.SphereGeometry(.45,24,24),new THREE.MeshStandardMaterial({color:0xf1b17e}));head.position.y=2.35;guide.add(head);const body=new THREE.Mesh(new THREE.CapsuleGeometry(.52,1.2,8,16),new THREE.MeshStandardMaterial({color:0x2f63d3}));body.position.y=1.15;guide.add(body);guide.position.set(0,0,1.6);scene.add(guide)
  const flags:THREE.Mesh[]=[];for(let i=0;i<10;i++){const flag=new THREE.Mesh(new THREE.BoxGeometry(.45,.24,.04),new THREE.MeshStandardMaterial({color:i%2?0xffd15b:0xff6c78}));flag.position.set(-4.5+i,4.6,-6.5-Math.sin(i)*.4);scene.add(flag);flags.push(flag)}
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){guide.position.y=Math.sin(t*1.6)*.045;guide.rotation.y=Math.sin(t*.7)*.12;stalls.forEach((g,i)=>g.rotation.y=Math.sin(t*.3+i)*.005);flags.forEach((f,i)=>f.rotation.z=Math.sin(t*1.8+i)*.05)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||800;const h=mount.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()}
  window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(mount.contains(renderer.domElement))mount.removeChild(renderer.domElement);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}})}
 },[reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Se activó la alternativa accesible de la feria.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Feria escolar tridimensional interactiva"/>
}
