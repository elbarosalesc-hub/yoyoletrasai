import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000'
const outputDir = 'artifacts/visual-validation'
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []

async function validateViewport(name, viewport) {
  const page = await browser.newPage({ viewportSize: viewport })
  const consoleErrors = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  await page.goto(`${baseUrl}/app`, { waitUntil: 'networkidle' })
  await page.locator('.ref-dashboard').waitFor({ state: 'visible' })

  const required = [
    '.ref-top-grid',
    '.ref-welcome-card',
    '.ref-summary-card',
    '.ref-featured',
    '.ref-upcoming',
    '.ref-recommendations',
    '.ref-week'
  ]

  for (const selector of required) {
    if (await page.locator(selector).count() !== 1) {
      throw new Error(`${name}: falta o se duplicó ${selector}`)
    }
  }

  const metrics = await page.evaluate(() => {
    const root = document.documentElement
    const body = document.body
    const top = document.querySelector('.ref-top-grid')
    const middle = document.querySelector('.ref-middle-grid')
    const bottom = document.querySelector('.ref-bottom-grid')
    const mobileNav = document.querySelector('.premium-mobile-nav')
    return {
      scrollWidth: Math.max(root.scrollWidth, body.scrollWidth),
      clientWidth: root.clientWidth,
      topColumns: top ? getComputedStyle(top).gridTemplateColumns : '',
      middleColumns: middle ? getComputedStyle(middle).gridTemplateColumns : '',
      bottomColumns: bottom ? getComputedStyle(bottom).gridTemplateColumns : '',
      mobileNavDisplay: mobileNav ? getComputedStyle(mobileNav).display : 'missing'
    }
  })

  if (metrics.scrollWidth > metrics.clientWidth + 2) {
    throw new Error(`${name}: existe desbordamiento horizontal (${metrics.scrollWidth}px > ${metrics.clientWidth}px)`)
  }

  if (name === 'desktop') {
    if (!metrics.topColumns.includes('px') || metrics.topColumns.split(' ').length < 2) {
      throw new Error('desktop: bienvenida y resumen no están en dos columnas')
    }
    if (metrics.mobileNavDisplay !== 'none') {
      throw new Error('desktop: la navegación móvil está visible')
    }
  }

  if (name === 'mobile') {
    if (metrics.mobileNavDisplay === 'none' || metrics.mobileNavDisplay === 'missing') {
      throw new Error('mobile: la navegación inferior no está visible')
    }
    const menuButton = page.getByRole('button', { name: 'Abrir menú' })
    await menuButton.click()
    await page.locator('.premium-sidebar.sidebar-open').waitFor({ state: 'visible' })
    await page.getByRole('button', { name: 'Cerrar menú' }).click()
  }

  await page.getByRole('button', { name: /Silenciar|Activar sonido/ }).click()
  await page.getByRole('button', { name: /Reproducir|Pausar/ }).click()
  await page.getByRole('button', { name: 'Siguiente' }).click()

  await page.screenshot({ path: `${outputDir}/${name}.png`, fullPage: true })

  if (consoleErrors.length > 0) {
    throw new Error(`${name}: errores de consola: ${consoleErrors.join(' | ')}`)
  }

  results.push({ name, ...metrics })
  await page.close()
}

try {
  await validateViewport('desktop', { width: 1440, height: 1000 })
  await validateViewport('mobile', { width: 390, height: 844 })
  await fs.writeFile(`${outputDir}/results.json`, JSON.stringify(results, null, 2))
  console.log('Validación visual completada correctamente.')
} finally {
  await browser.close()
}
