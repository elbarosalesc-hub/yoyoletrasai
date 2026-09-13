'use client'

import { useEffect } from 'react'

type PlatformPreferences = {
  theme?: 'purple' | 'teal' | 'coral' | 'gold'
  audio?: boolean
  animations?: boolean
  reduced?: boolean
  contrast?: boolean
}

function applyPreferences(preferences: PlatformPreferences) {
  const root = document.documentElement
  root.dataset.yoyoTheme = preferences.theme || 'purple'
  root.dataset.yoyoAudio = preferences.audio === false ? 'off' : 'on'
  root.dataset.yoyoAnimations = preferences.animations === false ? 'off' : 'on'
  root.dataset.yoyoReducedMotion = preferences.reduced === true ? 'on' : 'off'
  root.dataset.yoyoContrast = preferences.contrast === true ? 'high' : 'standard'
}

export function PlatformPreferencesBridge() {
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      try {
        const response = await fetch('/api/profile/preferences', { cache: 'no-store' })
        if (!response.ok) return
        const preferences = (await response.json()) as PlatformPreferences
        if (!cancelled) applyPreferences(preferences)
      } catch {
        // Public/auth pages may not have a session or organization context yet.
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
      window.removeEventListener('yoyo:preferences-updated', listener)
    }
  }, [])

  return null
}
