const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000'

const routes = [
  '/',
  '/app',
  '/biblioteca',
  '/crear',
  '/profesor-virtual',
  '/cursos',
  '/juegos',
  '/caligrafia',
  '/inclusion',
  '/evaluaciones',
  '/simuladores',
  '/herramientas',
  '/seguimiento',
  '/familias',
  '/informes',
  '/integraciones',
  '/multimedia',
  '/qa',
  '/configuracion'
]

const failures = []

for (const route of routes) {
  try {
    const response = await fetch(`${baseUrl}${route}`, { redirect: 'follow' })
    const body = await response.text()

    if (!response.ok) {
      failures.push(`${route}: HTTP ${response.status}`)
      continue
    }

    if (!body.includes('YOYOLETRASAI')) {
      failures.push(`${route}: falta la identidad YOYOLETRASAI`)
    }

    console.log(`OK ${String(response.status).padEnd(3)} ${route}`)
  } catch (error) {
    failures.push(`${route}: ${error instanceof Error ? error.message : String(error)}`)
  }
}

const appResponse = await fetch(`${baseUrl}/app`)
const appHtml = await appResponse.text()
const requiredDashboardContent = [
  '¡Bienvenida de vuelta, Elba!',
  'La aventura del Bosque Mágico',
  'Próximas actividades',
  'Recomendado para tus grupos',
  'Nivel de la semana'
]

for (const text of requiredDashboardContent) {
  if (!appHtml.includes(text)) {
    failures.push(`/app: falta el bloque «${text}»`)
  }
}

const requiredAccessibilityContent = [
  'lang="es"',
  'Ir al contenido',
  'Navegación principal',
  'Navegación móvil'
]

for (const text of requiredAccessibilityContent) {
  if (!appHtml.includes(text)) {
    failures.push(`/app: falta el elemento de accesibilidad «${text}»`)
  }
}

if (failures.length > 0) {
  console.error('\nValidación fallida:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log(`\n${routes.length} rutas y la estructura principal fueron validadas correctamente.`)
