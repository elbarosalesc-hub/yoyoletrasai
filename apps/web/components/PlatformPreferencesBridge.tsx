'use client'

import { useEffect } from 'react'

type PlatformPreferences = {
  theme?: 'purple' | 'teal' | 'coral' | 'gold'
  audio?: boolean
  animations?: boolean
  reduced?: boolean
  contrast?: boolean
}

const publicPrefixes=['/presentacion','/acceso','/login','/activar-cuenta','/restablecer-contrasena','/auth']

function applyPreferences(preferences: PlatformPreferences) {
  const root = document.documentElement
  root.dataset.yoyoTheme = preferences.theme || 'purple'
  root.dataset.yoyoAudio = preferences.audio === false ? 'off' : 'on'
  root.dataset.yoyoAnimations = preferences.animations === false ? 'off' : 'on'
  root.dataset.yoyoReducedMotion = preferences.reduced === true ? 'on' : 'off'
  root.dataset.yoyoContrast = preferences.contrast === true ? 'high' : 'standard'
}

function isPublicRoute(pathname:string){
  return pathname==='/'||publicPrefixes.some(prefix=>pathname===prefix||pathname.startsWith(`${prefix}/`))
}

export function PlatformPreferencesBridge() {
  useEffect(() => {
    let cancelled = false
    let controller:AbortController|null=null

    const load = async () => {
      if(isPublicRoute(window.location.pathname))return
      controller=new AbortController()
      const timeout=window.setTimeout(()=>controller?.abort(),5000)
      try {
        const response = await fetch('/api/profile/preferences', { cache: 'no-store', signal:controller.signal })
        if (!response.ok) return
        const preferences = (await response.json()) as PlatformPreferences
        if (!cancelled) applyPreferences(preferences)
      } catch {
        // A protected page remains usable even if preferences cannot be loaded.
      } finally {
        window.clearTimeout(timeout)
      }
    }

    void load()

    const listener = (event: Event) => {
      const detail = (event as CustomEvent<PlatformPreferences>).detail
      if (detail) applyPreferences(detail)
    }
    window.addEventListener('yoyo:preferences-updated', listener)
    return () => {
      cancelled = true
      controller?.abort()
      window.removeEventListener('yoyo:preferences-updated', listener)
    }
  }, [])

  return null
}
