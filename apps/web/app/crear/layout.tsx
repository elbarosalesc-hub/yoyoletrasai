import type {ReactNode} from 'react'
import {CreatorMissionBridge} from '@/components/creator/CreatorMissionBridge'

export default function CrearLayout({children}:{children:ReactNode}){
 return <>
  {children}
  <CreatorMissionBridge/>
 </>
}
