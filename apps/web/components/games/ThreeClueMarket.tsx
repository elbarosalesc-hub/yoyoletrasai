'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={mission:number;evidenceCount:number;reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

export function ThreeClueMarket({mission,evidenceCount,reducedMotion=false,highContrast=false,onReady}:Props){
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
  const bg=highContrast?0x071019:0xdff1f4
  const scene=new THREE.Scene();scene.background=new THREE.Color(bg)
  const camera=new THREE.PerspectiveCamera(45,width/height,.1,100);camera.position.set(0,6.8,13.5);camera.lookAt(0,1,0)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x172331:0x91a78d,1.45));const sun=new THREE.DirectionalLight(0xffffff,2);sun.position.set(7,10,6);scene.add(sun)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(18,14),new THREE.MeshStandardMaterial({color:highContrast?0x183246:0xc7d8c2,roughness:.95}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)

  const stallColors=[0xff7b72,0xffd166,0x65c3ba,0x8c7ae6]
  const positions=[[-4.5,0,-1.8],[-1.5,0,1.7],[1.5,0,-1.8],[4.5,0,1.7]] as Array<[number,number,number]>
  const market=new THREE.Group();scene.add(market)
  positions.forEach((pos,index)=>{
   const group=new THREE.Group();group.position.set(...pos);market.add(group)
   const base=new THREE.Mesh(new THREE.BoxGeometry(2.5,1.15,1.7),new THREE.MeshStandardMaterial({color:highContrast?0x27394e:0xf5eadb,roughness:.75}));base.position.y=.6;group.add(base)
   const roof=new THREE.Mesh(new THREE.ConeGeometry(1.8,.85,4),new THREE.MeshStandardMaterial({color:stallColors[index],roughness:.55,emissive:index===mission?stallColors[index]:0x000000,emissiveIntensity:index===mission?.3:0}));roof.position.y=2.15;roof.rotation.y=Math.PI/4;group.add(roof)
   const sign=new THREE.Mesh(new THREE.BoxGeometry(1.35,.45,.12),new THREE.MeshStandardMaterial({color:index===mission?0xffffff:0xc9d0d6,emissive:index===mission?0x546e7a:0x000000,emissiveIntensity:.25}));sign.position.set(0,1.55,.92);group.add(sign)
   for(let item=0;item<3;item++){const product=new THREE.Mesh(new THREE.SphereGeometry(.18+item*.03,12,10),new THREE.MeshStandardMaterial({color:stallColors[(index+item)%4],roughness:.55}));product.position.set(-.5+item*.5,1.05,.95);group.add(product)}
  })
  const clues=new THREE.Group();scene.add(clues)
  for(let i=0;i<3;i++){const card=new THREE.Mesh(new THREE.BoxGeometry(.65,.85,.07),new THREE.MeshStandardMaterial({color:i<evidenceCount?0xffffff:0x8898a8,emissive:i<evidenceCount?0x4f8f77:0x000000,emissiveIntensity:.35}));card.position.set(-.85+i*.85,2.8,-4.5);card.rotation.x=-.18;clues.add(card)}
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){market.rotation.y=Math.sin(t*.25)*.025;clues.position.y=Math.sin(t*1.2)*.08}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||820,h=mount.clientHeight||540;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();const material=object.material;if(Array.isArray(material))material.forEach(m=>m.dispose());else material.dispose()}})}
 },[mission,evidenceCount,reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">WebGL no está disponible. Puedes completar el mercado usando las pistas textuales.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label={`Mercado 3D. Puesto activo ${mission+1}. Pistas reunidas: ${evidenceCount}.`}/>
}
