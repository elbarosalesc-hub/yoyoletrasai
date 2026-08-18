'use client'

import {useEffect,useRef,useState} from 'react'
import * as THREE from 'three'

type Props={
 reducedMotion?:boolean
 highContrast?:boolean
 selected?:string[]
 onReady?:(ready:boolean)=>void
 onSelect?:(id:string)=>void
}

type AnimatedObject={group:THREE.Group;phase:number;speed:number;baseX:number;baseZ:number}
type Interactive={id:string;group:THREE.Group;halo:THREE.Mesh}

export default function ThreeFair({reducedMotion=false,highContrast=false,selected=[],onReady,onSelect}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{setFallback(true);onReady?.(false);return}
  const width=mount.clientWidth||800;const height=mount.clientHeight||520
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.style.cursor='grab';mount.appendChild(renderer.domElement)
  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x0c1728:0xbde9ff);scene.fog=new THREE.FogExp2(highContrast?0x0c1728:0xe7f6ff,.027)
  const camera=new THREE.PerspectiveCamera(46,width/height,.1,100);camera.position.set(0,6.1,12.8);camera.lookAt(0,1.75,-3.8)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x162b40:0x59734c,2.7))
  const sun=new THREE.DirectionalLight(0xfff0c5,4.3);sun.position.set(7,12,7);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);scene.add(sun)
  const fill=new THREE.DirectionalLight(highContrast?0x75d7ff:0xd5e7ff,1.5);fill.position.set(-7,6,-5);scene.add(fill)
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(36,32),new THREE.MeshStandardMaterial({color:highContrast?0x21354e:0xe3cea3,roughness:.96}));ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const lane=new THREE.Mesh(new THREE.PlaneGeometry(7.6,28),new THREE.MeshStandardMaterial({color:highContrast?0x344c68:0xf6ebd1,roughness:1}));lane.rotation.x=-Math.PI/2;lane.position.set(0,.02,-5);scene.add(lane)

  const stalls:THREE.Group[]=[];const interactive:Interactive[]=[]
  const stallColors=[0xff7468,0x38b7aa,0xf1b14a,0x7668de]
  const makeHalo=(x:number,z:number)=>{const halo=new THREE.Mesh(new THREE.RingGeometry(1.15,1.3,36),new THREE.MeshBasicMaterial({color:highContrast?0xffffff:0xffd86d,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.position.set(x,.08,z+1.05);scene.add(halo);return halo}
  const addStall=(id:string,x:number,z:number,color:number,awning:number,index:number)=>{const g=new THREE.Group();g.userData.interactiveId=id;const selectedNow=selected.includes(id);const baseMat=new THREE.MeshStandardMaterial({color,roughness:.72,emissive:selectedNow?0x3a1900:0x000000,emissiveIntensity:selectedNow?.75:0});const base=new THREE.Mesh(new THREE.BoxGeometry(3.5,1.35,2.35),baseMat);base.position.y=.68;base.castShadow=true;g.add(base);const roof=new THREE.Mesh(new THREE.BoxGeometry(3.95,.18,2.8),new THREE.MeshStandardMaterial({color:awning,roughness:.62}));roof.position.y=2.18;roof.castShadow=true;g.add(roof);for(const sx of[-1.48,1.48]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.07,.07,1.55,10),new THREE.MeshStandardMaterial({color:0x76513a}));post.position.set(sx,1.47,.92);g.add(post)}for(let i=0;i<7;i++){const item=new THREE.Mesh(new THREE.SphereGeometry(.18+(i%3)*.035,16,16),new THREE.MeshStandardMaterial({color:[0xffd45a,0x7ecf62,0xff8e65,0x7fb7ff][(i+index)%4],roughness:.68}));item.position.set(-1.2+i*.4,1.52,.38+(i%2)*.1);item.castShadow=true;g.add(item)}const sign=new THREE.Mesh(new THREE.BoxGeometry(1.4,.5,.08),new THREE.MeshStandardMaterial({color:0xffffff,emissive:selectedNow?0x756000:(highContrast?0x222222:0x000000),emissiveIntensity:selectedNow?.55:.08}));sign.position.set(0,2.65,.05);g.add(sign);g.position.set(x,0,z);scene.add(g);stalls.push(g);const halo=makeHalo(x,z);(halo.material as THREE.MeshBasicMaterial).opacity=selectedNow?.55:.2;interactive.push({id,group:g,halo})}
  addStall('jugo',-5,-4,stallColors[0],0xffefe9,0);addStall('brocheta',5,-4,stallColors[1],0xe8fff9,1);addStall('libro',-5,-10,stallColors[2],0xfff7dc,2);addStall('lapiz',5,-10,stallColors[3],0xf1edff,3)

  const register=new THREE.Group();const desk=new THREE.Mesh(new THREE.BoxGeometry(3.3,1.2,1.85),new THREE.MeshStandardMaterial({color:0x24415f,roughness:.68}));desk.position.y=.6;desk.castShadow=true;register.add(desk);const screen=new THREE.Mesh(new THREE.BoxGeometry(1.28,.82,.12),new THREE.MeshStandardMaterial({color:0x98f4d0,emissive:0x1a6b50,emissiveIntensity:.3}));screen.position.set(0,1.48,.74);register.add(screen);const coins=new THREE.Group();for(let i=0;i<6;i++){const coin=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.05,20),new THREE.MeshStandardMaterial({color:0xf4c64f,metalness:.45,roughness:.35}));coin.rotation.x=Math.PI/2;coin.position.set(-.55+i*.22,1.28,.92);coins.add(coin)}register.add(coins);register.position.set(0,0,-15);scene.add(register)

  const guide=new THREE.Group();const skin=new THREE.MeshStandardMaterial({color:0xf1b17e,roughness:.72});const head=new THREE.Mesh(new THREE.SphereGeometry(.45,26,26),skin);head.position.y=2.38;guide.add(head);const body=new THREE.Mesh(new THREE.CapsuleGeometry(.52,1.2,8,18),new THREE.MeshStandardMaterial({color:highContrast?0x5ba8ff:0x2f63d3,roughness:.62}));body.position.y=1.16;guide.add(body);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.12,.68,6,12),skin);arm.position.set(.61,1.4,0);arm.rotation.z=.42;guide.add(arm);guide.position.set(0,0,1.45);scene.add(guide)
  const shoppers:AnimatedObject[]=[]
  const createShopper=(x:number,z:number,color:number,phase:number)=>{const g=new THREE.Group();const bodyMesh=new THREE.Mesh(new THREE.CapsuleGeometry(.3,.72,7,12),new THREE.MeshStandardMaterial({color,roughness:.72}));bodyMesh.position.y=.85;g.add(bodyMesh);const headMesh=new THREE.Mesh(new THREE.SphereGeometry(.27,18,18),skin);headMesh.position.y=1.62;g.add(headMesh);g.position.set(x,0,z);scene.add(g);shoppers.push({group:g,phase,speed:.25+phase*.03,baseX:x,baseZ:z})}
  createShopper(-1.6,-5.5,0xee5c86,.2);createShopper(1.5,-8,0x4f9c78,1.4);createShopper(-1,-12,0xe69f32,2.2)
  const flags:THREE.Mesh[]=[];for(let i=0;i<14;i++){const flag=new THREE.Mesh(new THREE.PlaneGeometry(.48,.28),new THREE.MeshStandardMaterial({color:[0xffd15b,0xff6c78,0x68cfd1,0x8d77e8][i%4],side:THREE.DoubleSide}));flag.position.set(-6.4+i,4.7,-6.6-Math.sin(i*.8)*.3);scene.add(flag);flags.push(flag)}
  const balloons:THREE.Mesh[]=[];for(let i=0;i<10;i++){const balloon=new THREE.Mesh(new THREE.SphereGeometry(.2,18,18),new THREE.MeshStandardMaterial({color:[0xff6f7e,0xffcf56,0x61c6d8,0x9d83f2][i%4],roughness:.48}));balloon.scale.y=1.2;balloon.position.set(-6+i*1.35,3.4+(i%3)*.45,-3.5-(i%4));scene.add(balloon);balloons.push(balloon)}

  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let pointerX=0,pointerY=0
  const setPointer=(event:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/Math.max(rect.width,1))*2-1;pointer.y=-((event.clientY-rect.top)/Math.max(rect.height,1))*2+1;pointerX=pointer.x;pointerY=pointer.y}
  const pick=()=>{raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(interactive.flatMap(item=>[item.group,...item.group.children]),true);if(!hits.length)return null;let node:THREE.Object3D|null=hits[0].object;while(node&&!node.userData.interactiveId)node=node.parent;return node?.userData.interactiveId as string|undefined}
  const onPointerMove=(event:PointerEvent)=>{setPointer(event);renderer.domElement.style.cursor=pick()?'pointer':'grab'}
  const onPointerDown=(event:PointerEvent)=>{setPointer(event);const id=pick();if(id)onSelect?.(id)}
  renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerdown',onPointerDown)

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();if(!reducedMotion){guide.position.y=Math.sin(t*1.6)*.045;guide.rotation.y=Math.sin(t*.7)*.12;arm.rotation.z=.42+Math.sin(t*2.4)*.16;stalls.forEach((g,i)=>g.rotation.y=Math.sin(t*.32+i)*.006);interactive.forEach((item,i)=>item.halo.scale.setScalar(1+Math.sin(t*2+i)*.07));flags.forEach((f,i)=>{f.rotation.y=Math.sin(t*3+i)*.55;f.rotation.z=Math.sin(t*1.8+i)*.08});balloons.forEach((b,i)=>{b.position.y+=Math.sin(t*1.3+i)*.0017;b.rotation.z=Math.sin(t+i)*.08});shoppers.forEach(s=>{s.group.position.x=s.baseX+Math.sin(t*s.speed+s.phase)*.7;s.group.position.z=s.baseZ+Math.cos(t*s.speed+s.phase)*.35;s.group.rotation.y=Math.sin(t*.6+s.phase)*.35});coins.rotation.y=t*.35;camera.position.x+=(pointerX*.3-camera.position.x)*.018;camera.position.y+=(6.1-pointerY*.12-camera.position.y)*.018;camera.lookAt(0,1.75,-3.8)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReady?.(true)
  const resize=()=>{const w=mount.clientWidth||800;const h=mount.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>x.dispose());else m.dispose()}})}
 },[reducedMotion,highContrast,selected,onReady,onSelect])
 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Se activó la alternativa accesible de la feria.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Feria escolar tridimensional animada e interactiva con puestos seleccionables, personajes, globos y caja"/>
}
