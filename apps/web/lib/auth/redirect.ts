export function getSafeRedirectPath(value: string | null, fallback = '/seleccionar-institucion') {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
