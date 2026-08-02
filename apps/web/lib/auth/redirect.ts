export function getSafeRedirectPath(
  value: string | null,
  fallback = '/seleccionar-institucion',
) {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  if (value.includes('\\') || /[\u0000-\u001F\u007F]/.test(value)) return fallback

  try {
    const parsed = new URL(value, 'https://yoyoletrasai.local')
    if (parsed.origin !== 'https://yoyoletrasai.local') return fallback
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
