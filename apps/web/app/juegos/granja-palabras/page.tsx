'use client'

import {useEffect,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import GranjaPalabras3D from '@/components/games/GranjaPalabras3D'

export default function GranjaPalabrasPage(){
 const[reduced,setReduced]=useState(false),[contrast,setContrast]=useState(false),[audio,setAudio]=useState(true)
 useEffect(()=>{
  fetch('/api/profile/preferences',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((prefs:{audio?:boolean;animations?:boolean;reduced?:boolean;contrast?:boolean}|null)=>{
   if(!prefs)return
   setAudio(prefs.audio!==false)
   setReduced(prefs.reduced===true||prefs.animations===false)
   setContrast(prefs.contrast===true)
  }).catch(()=>null)
 },[])
 return <AppShell active="Juegos 3D"><GranjaPalabras3D reducedMotion={reduced} highContrast={contrast} audioEnabled={audio}/></AppShell>
}
