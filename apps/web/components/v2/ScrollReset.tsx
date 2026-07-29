'use client'

import {useEffect} from 'react'
import {usePathname} from 'next/navigation'

export function ScrollReset(){
  const pathname=usePathname()

  useEffect(()=>{
    const reset=()=>{
      window.scrollTo({top:0,left:0,behavior:'auto'})
      document.documentElement.scrollTop=0
      document.body.scrollTop=0
    }
    reset()
    const frame=window.requestAnimationFrame(reset)
    return()=>window.cancelAnimationFrame(frame)
  },[pathname])

  return null
}
