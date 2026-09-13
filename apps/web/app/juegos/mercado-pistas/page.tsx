'use client'

import {useEffect,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import MercadoPistas3D from '@/components/games/MercadoPistas3D'

export default function MercadoPistasPage(){
 const[reduced,setReduced]=useState(false)
 const[contrast,setContrast]=useState(false)
 const[audio,setAudio]=useState(true)
 useEffect(()=>{
  fetch('/api/profile/preferences',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((prefs:{animations?:boolean;reduced?:boolean;contrast?:boolean;audio?:boolean}|null)=>{
   if(!prefs)return
   setReduced(prefs.reduced===true||prefs.animations===false)
   setContrast(prefs.contrast===true)
   setAudio(prefs.audio!==false)
  }).catch(()=>null)
 },[])
 return <AppShell active="Juegos 3D"><MercadoPistas3D reducedMotion={reduced} highContrast={contrast} audioEnabled={audio}/></AppShell>
}
