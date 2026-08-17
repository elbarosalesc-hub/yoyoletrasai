'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={reducedMotion?:boolean;highContrast?:boolean;onReady?:(ready:boolean)=>void}

type Floater={mesh:THREE.Mesh;speed:number;phase:number;baseY:number;radius:number}

export default function ThreeForest({reducedMotion=false,highContrast=false,onReady}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const [fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||800;const height=mount.clientHeight||520
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-hidden','true');mount.appendChild(renderer.domElement)

  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x071923:0x8fd6ee);scene.fog=new THREE.FogExp2(highContrast?0x071923:0xb9dfd5,.035)
  const camera=new THREE.PerspectiveCamera(48,width/height,.1,100);camera.position.set(0,5.2,11.8);camera.lookAt(0,1.5,-4)
  const hemi=new THREE.HemisphereLight(highContrast?0xffffff:0xeefcff,highContrast?0x0c4226:0x315f38,2.7);scene.add(hemi)
  const sun=new THREE.DirectionalLight(0xffefc0,4.2);sun.position.set(7,11,6);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun)
  const rim=new THREE.DirectionalLight(highContrast?0x8fe9ff:0xb5d7ff,1.6);rim.position.set(-8,5,-8);scene.add(rim)

  const groundMat=new THREE.MeshStandardMaterial({color:highContrast?0x13492c:0x477f45,roughness:.95})
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(38,38,32,32),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const path=new THREE.Mesh(new THREE.PlaneGeometry(4.4,28),new THREE.MeshStandardMaterial({color:highContrast?0xe9c572:0xd7bc87,roughness:1}));path.rotation.x=-Math.PI/2;path.position.set(0,.025,-6);scene.add(path)
  const stream=new THREE.Mesh(new THREE.PlaneGeometry(3.1,26),new THREE.MeshStandardMaterial({color:highContrast?0x4ce3ff:0x59b9d3,roughness:.18,metalness:.08,transparent:true,opacity:.86}));stream.rotation.x=-Math.PI/2;stream.rotation.z=.18;stream.position.set(-7,.04,-6);scene.add(stream)

  const trees:THREE.Group[]=[]
  const makeTree=(x:number,z:number,s=1,hue=0)=>{const g=new THREE.Group();const trunk=new THREE.Mesh(new THREE.CylinderGeometry(.16,.31,2.4,10),new THREE.MeshStandardMaterial({color:0x674333,roughness:1}));trunk.castShadow=true;trunk.position.y=1.2;g.add(trunk);const crownColor=highContrast?0x29e86e:[0x397b42,0x2f8b4b,0x4b9354][hue%3];for(let i=0;i<3;i++){const crown=new THREE.Mesh(new THREE.ConeGeometry(1.25-i*.12,2.3,12),new THREE.MeshStandardMaterial({color:crownColor,roughness:.82}));crown.position.y=2.65+i*.75;crown.castShadow=true;g.add(crown)}g.position.set(x,0,z);g.scale.setScalar(s);scene.add(g);trees.push(g)}
  ;[[-5,-1,1.15],[-7,-4,1.45],[-4,-7,1.05],[-8,-10,1.35],[-5,-14,1.1],[5,-2,1.08],[7,-5,1.42],[4,-9,1.05],[8,-12,1.3],[5,-16,1.12],[-10,-16,1.5],[10,-17,1.55]].forEach((v,i)=>makeTree(v[0],v[1],v[2],i))

  const cabin=new THREE.Group();const wallMat=new THREE.MeshStandardMaterial({color:highContrast?0xd67c45:0xb9683e,roughness:.88});const body=new THREE.Mesh(new THREE.BoxGeometry(3.8,2.6,3.2),wallMat);body.position.y=1.3;body.castShadow=true;cabin.add(body);const roof=new THREE.Mesh(new THREE.ConeGeometry(3.2,1.75,4),new THREE.MeshStandardMaterial({color:0x6c4132,roughness:.9}));roof.rotation.y=Math.PI/4;roof.position.y=3.3;roof.castShadow=true;cabin.add(roof);const door=new THREE.Mesh(new THREE.BoxGeometry(.82,1.55,.12),new THREE.MeshStandardMaterial({color:0x4e342d}));door.position.set(0,.78,1.66);cabin.add(door);[-1.05,1.05].forEach(x=>{const windowMesh=new THREE.Mesh(new THREE.BoxGeometry(.62,.62,.1),new THREE.MeshStandardMaterial({color:highContrast?0xfff06a:0xffd27d,emissive:highContrast?0xffdd44:0x8a4f13,emissiveIntensity:.55}));windowMesh.position.set(x,1.58,1.67);cabin.add(windowMesh)});cabin.position.set(4.2,0,-8.2);scene.add(cabin)

  const guide=new THREE.Group();const skin=new THREE.MeshStandardMaterial({color:0xf2b681,roughness:.7});const head=new THREE.Mesh(new THREE.SphereGeometry(.47,28,28),skin);head.position.y=2.45;head.castShadow=true;guide.add(head);const hair=new THREE.Mesh(new THREE.SphereGeometry(.49,24,24,0,Math.PI*2,0,Math.PI*.55),new THREE.MeshStandardMaterial({color:0x3a2824}));hair.position.y=2.62;guide.add(hair);const bodyGuide=new THREE.Mesh(new THREE.CapsuleGeometry(.56,1.18,8,18),new THREE.MeshStandardMaterial({color:highContrast?0x9f7cff:0x6f4bd8,roughness:.62}));bodyGuide.position.y=1.23;bodyGuide.castShadow=true;guide.add(bodyGuide);const armL=new THREE.Mesh(new THREE.CapsuleGeometry(.13,.72,6,12),skin);armL.position.set(-.64,1.42,0);armL.rotation.z=-.22;guide.add(armL);const armR=armL.clone();armR.position.x=.64;armR.rotation.z=.35;guide.add(armR);guide.position.set(-.35,0,1.1);scene.add(guide)

  const backpack=new THREE.Mesh(new THREE.BoxGeometry(.68,.82,.32),new THREE.MeshStandardMaterial({color:0xf08a55,roughness:.7}));backpack.position.set(-1.45,.5,.6);backpack.rotation.y=.32;backpack.castShadow=true;scene.add(backpack)
  const note=new THREE.Mesh(new THREE.BoxGeometry(.58,.04,.42),new THREE.MeshStandardMaterial({color:0xfff6cf,roughness:1}));note.position.set(.55,.08,-.55);note.rotation.y=-.35;scene.add(note)

  const fireflies:Floater[]=[];for(let i=0;i<36;i++){const mesh=new THREE.Mesh(new THREE.SphereGeometry(.038,8,8),new THREE.MeshBasicMaterial({color:highContrast?0xffffff:0xfff29a}));const baseY=.55+Math.random()*4.2;mesh.position.set((Math.random()-.5)*14,baseY,-1-Math.random()*16);scene.add(mesh);fireflies.push({mesh,speed:.4+Math.random()*.8,phase:Math.random()*Math.PI*2,baseY,radius:.08+Math.random()*.18})}
  const butterflies:Floater[]=[];for(let i=0;i<7;i++){const geo=new THREE.PlaneGeometry(.22,.13);const mat=new THREE.MeshBasicMaterial({color:[0xff8ca8,0xffd56a,0x8fd8ff,0xb995ff][i%4],side:THREE.DoubleSide,transparent:true,opacity:.95});const mesh=new THREE.Mesh(geo,mat);const baseY=1.2+Math.random()*2.6;mesh.position.set((Math.random()-.5)*8,baseY,-2-Math.random()*9);scene.add(mesh);butterflies.push({mesh,speed:.55+Math.random()*.45,phase:Math.random()*Math.PI*2,baseY,radius:.5+Math.random()*.8})}

  const cloudGroup=new THREE.Group();for(let i=0;i<8;i++){const cloud=new THREE.Group();for(let p=0;p<4;p++){const puff=new THREE.Mesh(new THREE.SphereGeometry(.55+.12*p,14,14),new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,opacity:.72}));puff.position.set(p*.55,Math.sin(p)*.15,0);cloud.add(puff)}cloud.position.set(-12+i*3.4,7.2+(i%2)*.7,-13-i*.55);cloudGroup.add(cloud)}scene.add(cloudGroup)

  let pointerX=0,pointerY=0;const onPointer=(event:PointerEvent)=>{const rect=mount.getBoundingClientRect();pointerX=((event.clientX-rect.left)/Math.max(rect.width,1)-.5)*2;pointerY=((event.clientY-rect.top)/Math.max(rect.height,1)-.5)*2};mount.addEventListener('pointermove',onPointer)
  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){guide.position.y=Math.sin(t*1.6)*.045;guide.rotation.y=Math.sin(t*.55)*.12;armR.rotation.z=.35+Math.sin(t*2.2)*.18;trees.forEach((g,i)=>g.rotation.z=Math.sin(t*.38+i*.73)*.009);fireflies.forEach(f=>{f.mesh.position.y=f.baseY+Math.sin(t*f.speed+f.phase)*f.radius;f.mesh.position.x+=Math.cos(t*f.speed*.7+f.phase)*.0015});butterflies.forEach((f,i)=>{f.mesh.position.y=f.baseY+Math.sin(t*f.speed*2+f.phase)*.28;f.mesh.position.x+=Math.cos(t*f.speed+f.phase)*.006;f.mesh.rotation.y=Math.sin(t*7+i)*.9});cloudGroup.position.x=((t*.18)%6)-3;stream.material=(stream.material as THREE.MeshStandardMaterial);const sm=stream.material as THREE.MeshStandardMaterial;sm.opacity=.8+Math.sin(t*1.8)*.05;camera.position.x+=(pointerX*.28-camera.position.x)*.018;camera.position.y+=(5.2-pointerY*.12-camera.position.y)*.018;camera.lookAt(0,1.5,-4)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||800;const h=mount.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);mount.removeEventListener('pointermove',onPointer);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}})}
 },[reducedMotion,highContrast,onReady])
 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Se activó la experiencia accesible equivalente.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Escena tridimensional animada del bosque con personaje, cabaña, agua, fauna y ambientación interactiva"/>
}
