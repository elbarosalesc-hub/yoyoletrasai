'use client'

import {useEffect,useState} from 'react'
import {AppShell} from '@/components/AppShell'
import LaboratorioEcosistemas3D from '@/components/games/LaboratorioEcosistemas3D'

export default function LaboratorioEcosistemasPage(){
 const[reduced,setReduced]=useState(false),[contrast,setContrast]=useState(false)
 useEffect(()=>{
  fetch('/api/profile/preferences',{cache:'no-store'}).then(async response=>response.ok?response.json():null).then((prefs:{animations?:boolean;reduced?:boolean;contrast?:boolean}|null)=>{
   if(!prefs)return
   setReduced(prefs.reduced===true||prefs.animations===false)
   setContrast(prefs.contrast===true)
  }).catch(()=>null)
 },[])
 return <AppShell active="Juegos 3D"><LaboratorioEcosistemas3D reducedMotion={reduced} highContrast={contrast}/></AppShell>
}
