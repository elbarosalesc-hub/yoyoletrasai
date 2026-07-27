'use client'
import {Canvas,useFrame} from '@react-three/fiber'
import {useMemo,useRef} from 'react'
import * as THREE from 'three'

type Props={onSelect:(id:string)=>void;active:string[];reducedMotion?:boolean}

function Tree({x,z,scale=1}:{x:number;z:number;scale?:number}){
 return <group position={[x,0,z]} scale={scale}>
  <mesh position={[0,1.2,0]} castShadow><cylinderGeometry args={[.28,.38,2.4,10]}/><meshStandardMaterial color="#7b5038"/></mesh>
  <mesh position={[0,2.8,0]} castShadow><sphereGeometry args={[1.1,20,20]}/><meshStandardMaterial color="#4f9b58"/></mesh>
  <mesh position={[.55,2.65,.15]} castShadow><sphereGeometry args={[.75,18,18]}/><meshStandardMaterial color="#67ad5f"/></mesh>
 </group>
}

function Marker({id,label,color,position,onSelect,active,reducedMotion}:{id:string;label:string;color:string;position:[number,number,number];onSelect:(id:string)=>void;active:boolean;reducedMotion?:boolean}){
 const ref=useRef<THREE.Mesh>(null)
 useFrame((state)=>{if(ref.current&&!reducedMotion){ref.current.rotation.y+=.01;ref.current.position.y=position[1]+Math.sin(state.clock.elapsedTime*2+position[0])*.08}})
 return <group position={position} onClick={(e)=>{e.stopPropagation();onSelect(id)}}>
  <mesh ref={ref} castShadow scale={active?1.18:1}>
   <dodecahedronGeometry args={[.42,0]}/><meshStandardMaterial color={active?'#f38b73':color} emissive={active?'#5b1e16':'#000000'} emissiveIntensity={active?.25:0}/>
  </mesh>
  <mesh position={[0,-.62,0]}><boxGeometry args={[1.25,.34,.08]}/><meshStandardMaterial color="#ffffff"/></mesh>
 </group>
}

function Guide(){
 const ref=useRef<THREE.Group>(null)
 useFrame((s)=>{if(ref.current)ref.current.rotation.y=Math.sin(s.clock.elapsedTime*.6)*.18})
 return <group ref={ref} position={[0,0,1.2]}>
  <mesh position={[0,1.15,0]} castShadow><capsuleGeometry args={[.38,.75,8,16]}/><meshStandardMaterial color="#4f7188"/></mesh>
  <mesh position={[0,2.15,0]} castShadow><sphereGeometry args={[.42,20,20]}/><meshStandardMaterial color="#f0b989"/></mesh>
  <mesh position={[-.15,2.25,.38]}><sphereGeometry args={[.045,12,12]}/><meshStandardMaterial color="#2a2a2a"/></mesh>
  <mesh position={[.15,2.25,.38]}><sphereGeometry args={[.045,12,12]}/><meshStandardMaterial color="#2a2a2a"/></mesh>
 </group>
}

function Scene({onSelect,active,reducedMotion}:Props){
 const stars=useMemo(()=>Array.from({length:50},(_,i)=>[(Math.random()-.5)*18,4+Math.random()*6,-4-Math.random()*12] as [number,number,number]),[])
 return <>
  <color attach="background" args={['#a7d8f0']}/>
  <fog attach="fog" args={['#b8d9df',8,24]}/>
  <ambientLight intensity={1.25}/><directionalLight position={[5,9,5]} intensity={2.1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024}/>
  <mesh rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[30,30]}/><meshStandardMaterial color="#8fc384"/></mesh>
  <mesh position={[0,.02,-1]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[3.3,15]}/><meshStandardMaterial color="#d6bd91"/></mesh>
  {stars.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[.035,8,8]}/><meshBasicMaterial color="#ffffff"/></mesh>)}
  <Tree x={-3.8} z={-1}/><Tree x={3.6} z={-2} scale={1.1}/><Tree x={-4.3} z={-6} scale={.8}/><Tree x={4.1} z={-7} scale={.9}/>
  <Guide/>
  <Marker id="mochila" label="Mochila" color="#5b7bb5" position={[-2,.55,2.1]} onSelect={onSelect} active={active.includes('mochila')} reducedMotion={reducedMotion}/>
  <Marker id="nota" label="Nota" color="#f0c96c" position={[-.75,.55,.1]} onSelect={onSelect} active={active.includes('nota')} reducedMotion={reducedMotion}/>
  <Marker id="ave" label="Ave" color="#5bc0de" position={[1.35,1.35,-1.1]} onSelect={onSelect} active={active.includes('ave')} reducedMotion={reducedMotion}/>
  <Marker id="cabana" label="Cabaña" color="#b67a4a" position={[2.8,.55,-3.2]} onSelect={onSelect} active={active.includes('cabana')} reducedMotion={reducedMotion}/>
 </>
}

export default function Bosque3D(props:Props){return <div className="three-stage"><Canvas shadows camera={{position:[0,5.4,10],fov:48}}><Scene {...props}/></Canvas></div>}
