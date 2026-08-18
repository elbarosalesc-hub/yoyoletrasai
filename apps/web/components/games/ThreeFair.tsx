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
type Interactive={id:string;group:THREE.Group;halo:THREE.Mesh;accent:THREE.PointLight}

const PRODUCT_META={
 jugo:{label:'JUGO NATURAL',price:'$800',accent:0xff6f61},
 brocheta:{label:'BROCHETA',price:'$1.200',accent:0x37b7a5},
 libro:{label:'LIBRO USADO',price:'$2.500',accent:0xe5a33d},
 lapiz:{label:'SET DE LAPICES',price:'$500',accent:0x7568dc}
} as const

export default function ThreeFair({reducedMotion=false,highContrast=false,selected=[],onReady,onSelect}:Props){
 const mountRef=useRef<HTMLDivElement>(null)
 const selectedRef=useRef(selected)
 const onReadyRef=useRef(onReady)
 const onSelectRef=useRef(onSelect)
 const[fallback,setFallback]=useState(false)
 useEffect(()=>{selectedRef.current=selected},[selected])
 useEffect(()=>{onReadyRef.current=onReady},[onReady])
 useEffect(()=>{onSelectRef.current=onSelect},[onSelect])

 useEffect(()=>{
  const mount=mountRef.current
  if(!mount)return
  let renderer:THREE.WebGLRenderer
  try{renderer=new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'})}catch{setFallback(true);onReadyRef.current?.(false);return}
  const width=mount.clientWidth||800;const height=mount.clientHeight||520
  renderer.setSize(width,height);renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18
  renderer.domElement.setAttribute('aria-hidden','true');renderer.domElement.style.cursor='grab';mount.appendChild(renderer.domElement)

  const scene=new THREE.Scene();scene.background=new THREE.Color(highContrast?0x091423:0x9fd7ef);scene.fog=new THREE.FogExp2(highContrast?0x091423:0xd8eef6,.02)
  const camera=new THREE.PerspectiveCamera(44,width/height,.1,100);camera.position.set(0,5.8,13.8);camera.lookAt(0,1.8,-5)
  scene.add(new THREE.HemisphereLight(0xffffff,highContrast?0x0a1b2f:0x6f8f67,2.35))
  const sun=new THREE.DirectionalLight(0xffe2b5,4.8);sun.position.set(8,13,7);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-18;sun.shadow.camera.right=18;sun.shadow.camera.top=18;sun.shadow.camera.bottom=-18;scene.add(sun)
  const rim=new THREE.DirectionalLight(highContrast?0x67d7ff:0xc5ddff,1.8);rim.position.set(-9,7,-8);scene.add(rim)

  const groundMat=new THREE.MeshStandardMaterial({color:highContrast?0x17283c:0xd8bd8e,roughness:.98})
  const ground=new THREE.Mesh(new THREE.PlaneGeometry(38,38),groundMat);ground.rotation.x=-Math.PI/2;ground.receiveShadow=true;scene.add(ground)
  const lane=new THREE.Mesh(new THREE.PlaneGeometry(8.6,34),new THREE.MeshStandardMaterial({color:highContrast?0x293f58:0xf1e2c7,roughness:1}));lane.rotation.x=-Math.PI/2;lane.position.set(0,.018,-6);scene.add(lane)
  for(let i=0;i<18;i++){const stone=new THREE.Mesh(new THREE.CircleGeometry(.28+(i%3)*.08,18),new THREE.MeshStandardMaterial({color:i%2?0xd4c19e:0xc9b38d,roughness:1}));stone.rotation.x=-Math.PI/2;stone.position.set((i%2?1:-1)*(1.7+(i%3)*.45),.03,2-i*1.7);stone.scale.y=.6;scene.add(stone)}

  const makeTextTexture=(title:string,price:string,accent:number)=>{const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const ctx=canvas.getContext('2d');if(!ctx)return null;ctx.fillStyle='#fffaf0';ctx.fillRect(0,0,512,256);ctx.fillStyle='#173f49';ctx.fillRect(0,0,512,58);ctx.fillStyle='#ffffff';ctx.font='700 28px system-ui';ctx.textAlign='center';ctx.fillText('YOYO FERIA',256,39);ctx.fillStyle=`#${new THREE.Color(accent).getHexString()}`;ctx.font='900 42px system-ui';ctx.fillText(title,256,126);ctx.fillStyle='#24353a';ctx.font='900 54px system-ui';ctx.fillText(price,256,206);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(renderer.capabilities.getMaxAnisotropy(),8);return texture}
  const makeSign=(title:string,price:string,accent:number)=>{const texture=makeTextTexture(title,price,accent);const material=new THREE.MeshStandardMaterial({map:texture||undefined,color:texture?0xffffff:accent,roughness:.58});const sign=new THREE.Mesh(new THREE.PlaneGeometry(2.35,1.18),material);sign.castShadow=true;return sign}
  const wood=new THREE.MeshStandardMaterial({color:0x7a4c2d,roughness:.86})
  const cream=new THREE.MeshStandardMaterial({color:0xfff5de,roughness:.72})
  const interactive:Interactive[]=[];const stalls:THREE.Group[]=[]

  const addAwning=(group:THREE.Group,accent:number)=>{for(let i=0;i<6;i++){const stripe=new THREE.Mesh(new THREE.BoxGeometry(.62,.13,2.72),new THREE.MeshStandardMaterial({color:i%2?0xfff5e9:accent,roughness:.7}));stripe.position.set(-1.55+i*.62,2.65,.02);stripe.rotation.z=-.05;stripe.castShadow=true;group.add(stripe)}const valance=new THREE.Mesh(new THREE.BoxGeometry(4.05,.22,.28),new THREE.MeshStandardMaterial({color:accent,roughness:.65}));valance.position.set(0,2.38,1.25);group.add(valance)}
  const addStallShell=(id:string,x:number,z:number,accent:number,label:string,price:string)=>{const group=new THREE.Group();group.userData.interactiveId=id;const floor=new THREE.Mesh(new THREE.BoxGeometry(4.2,.18,3.3),wood);floor.position.y=.09;floor.receiveShadow=true;group.add(floor);const counter=new THREE.Mesh(new THREE.BoxGeometry(4,1.15,1.15),new THREE.MeshStandardMaterial({color:accent,roughness:.72}));counter.position.set(0,.72,1.05);counter.castShadow=true;group.add(counter);const counterTop=new THREE.Mesh(new THREE.BoxGeometry(4.25,.18,1.35),cream);counterTop.position.set(0,1.35,1.02);counterTop.castShadow=true;group.add(counterTop);for(const sx of[-1.82,1.82]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,2.7,12),wood);post.position.set(sx,1.45,.96);post.castShadow=true;group.add(post)}addAwning(group,accent);const sign=makeSign(label,price,accent);sign.position.set(0,3.33,.02);group.add(sign);const back=new THREE.Mesh(new THREE.BoxGeometry(3.8,2.1,.12),new THREE.MeshStandardMaterial({color:0xfaf4e8,roughness:.82}));back.position.set(0,1.35,-1.24);group.add(back);group.position.set(x,0,z);scene.add(group);stalls.push(group);const halo=new THREE.Mesh(new THREE.RingGeometry(1.55,1.72,48),new THREE.MeshBasicMaterial({color:accent,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));halo.rotation.x=-Math.PI/2;halo.position.set(x,.07,z+1.25);scene.add(halo);const light=new THREE.PointLight(accent,0,5,2);light.position.set(x,2.1,z+1.1);scene.add(light);interactive.push({id,group,halo,accent:light});return group}

  const juice=addStallShell('jugo',-5.3,-4.1,PRODUCT_META.jugo.accent,PRODUCT_META.jugo.label,PRODUCT_META.jugo.price)
  const blender=new THREE.Group();const jug=new THREE.Mesh(new THREE.CylinderGeometry(.36,.3,.72,24),new THREE.MeshPhysicalMaterial({color:0xffb34d,transparent:true,opacity:.72,roughness:.28,transmission:.15}));jug.position.y=1.82;blender.add(jug);const base=new THREE.Mesh(new THREE.CylinderGeometry(.42,.48,.22,24),new THREE.MeshStandardMaterial({color:0x263c46,metalness:.35,roughness:.36}));base.position.y=1.38;blender.add(base);juice.add(blender);for(let i=0;i<7;i++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.18+(i%2)*.05,18,18),new THREE.MeshStandardMaterial({color:[0xff8a45,0xffd95a,0x80c65a][i%3],roughness:.64}));fruit.position.set(-1.35+i*.45,1.56,.62+(i%2)*.12);fruit.castShadow=true;juice.add(fruit)}for(let i=0;i<4;i++){const cup=new THREE.Mesh(new THREE.CylinderGeometry(.18,.14,.46,18),new THREE.MeshPhysicalMaterial({color:[0xffb746,0xff8f5c,0xffd75c,0xf39752][i],transparent:true,opacity:.78,roughness:.28}));cup.position.set(-.75+i*.5,1.68,1.38);juice.add(cup)}

  const skewer=addStallShell('brocheta',5.3,-4.1,PRODUCT_META.brocheta.accent,PRODUCT_META.brocheta.label,PRODUCT_META.brocheta.price)
  for(let r=0;r<3;r++){for(let i=0;i<5;i++){const fruit=new THREE.Mesh(new THREE.SphereGeometry(.13,16,16),new THREE.MeshStandardMaterial({color:[0xff5f57,0xffc94a,0x7ccb62,0x9a68d7,0xff8a49][i],roughness:.6}));fruit.position.set(-.95+i*.42,1.62+r*.18,.85-r*.12);fruit.castShadow=true;skewer.add(fruit)}}const tray=new THREE.Mesh(new THREE.BoxGeometry(2.8,.12,1.0),new THREE.MeshStandardMaterial({color:0xd9dde0,metalness:.45,roughness:.32}));tray.position.set(0,1.46,.78);skewer.add(tray)

  const books=addStallShell('libro',-5.3,-10.5,PRODUCT_META.libro.accent,PRODUCT_META.libro.label,PRODUCT_META.libro.price)
  const bookColors=[0x2f65a8,0xc84c5c,0x4f936c,0xe7a33a,0x795a9f,0x2d777b]
  for(let row=0;row<2;row++){for(let i=0;i<6;i++){const book=new THREE.Mesh(new THREE.BoxGeometry(.34,.7,.95),new THREE.MeshStandardMaterial({color:bookColors[(i+row)%bookColors.length],roughness:.78}));book.position.set(-1.2+i*.48,1.73+row*.72,.56);book.rotation.z=(i%2?.04:-.04);book.castShadow=true;books.add(book)}}const openBook=new THREE.Group();for(const side of[-1,1]){const page=new THREE.Mesh(new THREE.PlaneGeometry(.9,.64,8,4),new THREE.MeshStandardMaterial({color:0xfff9e8,side:THREE.DoubleSide,roughness:.92}));page.rotation.x=-Math.PI/2;page.rotation.z=side*.2;page.position.set(side*.4,1.5,1.32);openBook.add(page)}books.add(openBook)

  const pencils=addStallShell('lapiz',5.3,-10.5,PRODUCT_META.lapiz.accent,PRODUCT_META.lapiz.label,PRODUCT_META.lapiz.price)
  for(let cupIndex=0;cupIndex<4;cupIndex++){const holder=new THREE.Mesh(new THREE.CylinderGeometry(.28,.32,.55,18),new THREE.MeshStandardMaterial({color:[0xff6f7d,0x4ec0b8,0xffca4d,0x6c77d9][cupIndex],roughness:.65}));holder.position.set(-1.05+cupIndex*.7,1.65,.82);pencils.add(holder);for(let i=0;i<6;i++){const pencil=new THREE.Mesh(new THREE.CylinderGeometry(.025,.025,.85,8),new THREE.MeshStandardMaterial({color:[0xf05252,0x3b82c4,0xf4c340,0x4fa86a,0x7e5ac7,0xf08a42][i],roughness:.55}));pencil.position.set(holder.position.x+(i-2.5)*.035,2.25,holder.position.z);pencil.rotation.z=(i-2.5)*.035;pencils.add(pencil)}}

  const register=new THREE.Group();const desk=new THREE.Mesh(new THREE.BoxGeometry(3.5,1.18,1.8),new THREE.MeshStandardMaterial({color:0x153e50,roughness:.56}));desk.position.y=.62;desk.castShadow=true;register.add(desk);const trim=new THREE.Mesh(new THREE.BoxGeometry(3.6,.16,1.9),new THREE.MeshStandardMaterial({color:0xf3c768,metalness:.2,roughness:.42}));trim.position.y=1.23;register.add(trim);const screen=new THREE.Mesh(new THREE.BoxGeometry(1.45,.86,.12),new THREE.MeshStandardMaterial({color:0x9df5d1,emissive:0x116c50,emissiveIntensity:.7}));screen.position.set(0,1.62,.72);register.add(screen);const coins=new THREE.Group();for(let i=0;i<8;i++){const coin=new THREE.Mesh(new THREE.CylinderGeometry(.14,.14,.05,24),new THREE.MeshStandardMaterial({color:0xf6c94e,metalness:.55,roughness:.28}));coin.rotation.x=Math.PI/2;coin.position.set(-.7+i*.2,1.38,.9);coins.add(coin)}register.add(coins);register.position.set(0,0,-16.5);scene.add(register)

  const arch=new THREE.Group();for(const x of[-3.7,3.7]){const post=new THREE.Mesh(new THREE.CylinderGeometry(.16,.2,4.8,16),new THREE.MeshStandardMaterial({color:0x173f49,roughness:.7}));post.position.set(x,2.4,2.2);arch.add(post)}const beam=new THREE.Mesh(new THREE.BoxGeometry(8,.42,.42),new THREE.MeshStandardMaterial({color:0x173f49,roughness:.7}));beam.position.set(0,4.55,2.2);arch.add(beam);const archSign=makeSign('FERIA YOYO','APRENDE JUGANDO',0xe98772);archSign.scale.set(1.45,1.45,1.45);archSign.position.set(0,4.5,2.0);arch.add(archSign);scene.add(arch)

  const guide=new THREE.Group();const skin=new THREE.MeshStandardMaterial({color:0xe9a674,roughness:.68});const hairMat=new THREE.MeshStandardMaterial({color:0x382923,roughness:.86});const head=new THREE.Mesh(new THREE.SphereGeometry(.43,28,28),skin);head.position.y=2.42;guide.add(head);const hair=new THREE.Mesh(new THREE.SphereGeometry(.46,24,24,0,Math.PI*2,0,Math.PI*.56),hairMat);hair.position.y=2.58;guide.add(hair);const body=new THREE.Mesh(new THREE.CapsuleGeometry(.5,1.18,8,18),new THREE.MeshStandardMaterial({color:highContrast?0x5ba8ff:0x245f87,roughness:.6}));body.position.y=1.2;guide.add(body);const scarf=new THREE.Mesh(new THREE.TorusGeometry(.33,.08,10,24),new THREE.MeshStandardMaterial({color:0xe98772,roughness:.6}));scarf.rotation.x=Math.PI/2;scarf.position.y=1.92;guide.add(scarf);const arm=new THREE.Mesh(new THREE.CapsuleGeometry(.11,.72,6,12),skin);arm.position.set(.6,1.5,0);arm.rotation.z=.5;guide.add(arm);guide.position.set(0,0,1.3);scene.add(guide)

  const shoppers:AnimatedObject[]=[]
  const createShopper=(x:number,z:number,color:number,phase:number)=>{const g=new THREE.Group();const bodyMesh=new THREE.Mesh(new THREE.CapsuleGeometry(.29,.7,7,12),new THREE.MeshStandardMaterial({color,roughness:.7}));bodyMesh.position.y=.86;g.add(bodyMesh);const headMesh=new THREE.Mesh(new THREE.SphereGeometry(.26,18,18),skin);headMesh.position.y=1.62;g.add(headMesh);const backpack=new THREE.Mesh(new THREE.BoxGeometry(.45,.55,.25),new THREE.MeshStandardMaterial({color:0x314756,roughness:.8}));backpack.position.set(0,.95,-.31);g.add(backpack);g.position.set(x,0,z);scene.add(g);shoppers.push({group:g,phase,speed:.2+phase*.025,baseX:x,baseZ:z})}
  createShopper(-1.7,-5.7,0xee5c86,.2);createShopper(1.7,-8.2,0x4f9c78,1.4);createShopper(-1.2,-12.4,0xe69f32,2.2);createShopper(1.4,-13.2,0x6956bb,3.1)

  const bulbs:THREE.PointLight[]=[]
  for(let i=0;i<15;i++){const x=-7+i;const bulb=new THREE.Mesh(new THREE.SphereGeometry(.09,12,12),new THREE.MeshStandardMaterial({color:[0xffd15b,0xff7f72,0x6cd3d4,0x9b88ef][i%4],emissive:[0xffc63f,0xff5f4a,0x4ab9bf,0x755fd0][i%4],emissiveIntensity:1.25}));bulb.position.set(x,4.75,-6.5-Math.sin(i*.7)*.5);scene.add(bulb);if(i%3===0){const light=new THREE.PointLight((bulb.material as THREE.MeshStandardMaterial).color,1.4,4,2);light.position.copy(bulb.position);scene.add(light);bulbs.push(light)}}
  const balloons:THREE.Mesh[]=[];for(let i=0;i<12;i++){const balloon=new THREE.Mesh(new THREE.SphereGeometry(.18,18,18),new THREE.MeshPhysicalMaterial({color:[0xff6f7e,0xffcf56,0x61c6d8,0x9d83f2][i%4],roughness:.35,clearcoat:.45}));balloon.scale.y=1.25;balloon.position.set(-6.8+i*1.22,3.45+(i%3)*.38,-2.8-(i%4));scene.add(balloon);balloons.push(balloon)}
  const confetti:THREE.Mesh[]=[];for(let i=0;i<34;i++){const piece=new THREE.Mesh(new THREE.PlaneGeometry(.08,.14),new THREE.MeshBasicMaterial({color:[0xffc94d,0xff7682,0x52c5c7,0x8b78dc][i%4],side:THREE.DoubleSide,transparent:true,opacity:.75}));piece.position.set((Math.random()-.5)*16,1+Math.random()*4,-3-Math.random()*13);piece.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);scene.add(piece);confetti.push(piece)}

  const raycaster=new THREE.Raycaster();const pointer=new THREE.Vector2();let pointerX=0,pointerY=0
  const setPointer=(event:PointerEvent)=>{const rect=renderer.domElement.getBoundingClientRect();pointer.x=((event.clientX-rect.left)/Math.max(rect.width,1))*2-1;pointer.y=-((event.clientY-rect.top)/Math.max(rect.height,1))*2+1;pointerX=pointer.x;pointerY=pointer.y}
  const pick=()=>{raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(interactive.map(item=>item.group),true);if(!hits.length)return null;let node:THREE.Object3D|null=hits[0].object;while(node&&!node.userData.interactiveId)node=node.parent;return node?.userData.interactiveId as string|undefined}
  const onPointerMove=(event:PointerEvent)=>{setPointer(event);renderer.domElement.style.cursor=pick()?'pointer':'grab'}
  const onPointerDown=(event:PointerEvent)=>{setPointer(event);const id=pick();if(id)onSelectRef.current?.(id)}
  renderer.domElement.addEventListener('pointermove',onPointerMove);renderer.domElement.addEventListener('pointerdown',onPointerDown)

  const clock=new THREE.Clock();let raf=0
  const animate=()=>{const t=clock.getElapsedTime();const selectedNow=selectedRef.current;interactive.forEach((item,i)=>{const active=selectedNow.includes(item.id);(item.halo.material as THREE.MeshBasicMaterial).opacity=active?.7:.2;item.halo.scale.setScalar((active?1.08:1)*(1+Math.sin(t*2.3+i)*.045));item.accent.intensity=active?3.2:.15;item.group.position.y=active&&!reducedMotion?.06+Math.sin(t*4+i)*.025:0});if(!reducedMotion){guide.position.y=Math.sin(t*1.5)*.045;guide.rotation.y=Math.sin(t*.7)*.12;arm.rotation.z=.5+Math.sin(t*2.2)*.17;stalls.forEach((g,i)=>g.rotation.y=Math.sin(t*.32+i)*.004);balloons.forEach((b,i)=>{b.position.y+=Math.sin(t*1.25+i)*.0016;b.rotation.z=Math.sin(t+i)*.08});shoppers.forEach(s=>{s.group.position.x=s.baseX+Math.sin(t*s.speed+s.phase)*.75;s.group.position.z=s.baseZ+Math.cos(t*s.speed+s.phase)*.38;s.group.rotation.y=Math.sin(t*.58+s.phase)*.32});coins.rotation.y=t*.48;confetti.forEach((p,i)=>{p.rotation.z+=.004+(i%3)*.002;p.position.y+=Math.sin(t*.7+i)*.0008});bulbs.forEach((light,i)=>light.intensity=1.2+Math.sin(t*2+i)*.25);camera.position.x+=(pointerX*.42-camera.position.x)*.018;camera.position.y+=(5.8-pointerY*.16-camera.position.y)*.018;camera.lookAt(0,1.8,-5)}renderer.render(scene,camera);raf=requestAnimationFrame(animate)}
  animate();onReadyRef.current?.(true)
  const resize=()=>{const w=mount.clientWidth||800;const h=mount.clientHeight||520;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()};window.addEventListener('resize',resize)
  return()=>{cancelAnimationFrame(raf);window.removeEventListener('resize',resize);renderer.domElement.removeEventListener('pointermove',onPointerMove);renderer.domElement.removeEventListener('pointerdown',onPointerDown);renderer.dispose();if(renderer.domElement.parentElement===mount)mount.removeChild(renderer.domElement);scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();const m=o.material;if(Array.isArray(m))m.forEach(x=>{x.map?.dispose();x.dispose()});else{m.map?.dispose();m.dispose()}}})}
 },[reducedMotion,highContrast])

 if(fallback)return <div className="webgl-fallback" role="status">El dispositivo no admite WebGL. Se activó la alternativa accesible de la feria.</div>
 return <div ref={mountRef} className="webgl-forest" aria-label="Feria escolar tridimensional premium con puestos temáticos, productos reconocibles, señalética, iluminación ambiental, personajes y selección directa"/>
}
