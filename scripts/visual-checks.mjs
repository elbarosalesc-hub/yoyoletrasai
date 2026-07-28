import { chromium } from 'playwright'
import fs from 'node:fs/promises'

const baseUrl = process.env.BASE_URL || 'http://127.0.0.1:3000'
const outputDir = 'artifacts/visual-validation'
await fs.mkdir(outputDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const results = []
const failures = []

async function saveJson() {
  await fs.writeFile(`${outputDir}/results.json`, JSON.stringify({ results, failures, generatedAt: new Date().toISOString() }, null, 2))
}

async function validateViewport(name, viewport) {
  const page = await browser.newPage({ viewport })
  const consoleErrors = []
  page.on('console', message => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  page.on('pageerror', error => consoleErrors.push(error.message))

  const record = { name, viewport, checks: [] }

  try {
    const response = await page.goto(`${baseUrl}/app`, { waitUntil: 'domcontentloaded', timeout: 30000 })
    record.status = response?.status() || null
    await page.locator('.ref-dashboard').waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(500)
    await page.screenshot({ path: `${outputDir}/${name}-initial.png`, fullPage: true })

    const required = ['.ref-top-grid','.ref-welcome-card','.ref-summary-card','.ref-featured','.ref-upcoming','.ref-recommendations','.ref-week']
    for (const selector of required) {
      const count = await page.locator(selector).count()
      record.checks.push({ check: selector, count })
      if (count !== 1) throw new Error(`${name}: falta o se duplicó ${selector}`)
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

    record.metrics = metrics
    if (metrics.scrollWidth > metrics.clientWidth + 2) throw new Error(`${name}: existe desbordamiento horizontal (${metrics.scrollWidth}px > ${metrics.clientWidth}px)`)

    if (name === 'desktop') {
      const countColumns = value => value.trim().split(/\s+/).filter(Boolean).length
      if (countColumns(metrics.topColumns) < 2) throw new Error('desktop: bienvenida y resumen no están en dos columnas')
      if (countColumns(metrics.middleColumns) < 2) throw new Error('desktop: juego y próximas actividades no están en dos columnas')
      if (countColumns(metrics.bottomColumns) < 2) throw new Error('desktop: recomendaciones y logros no están en dos columnas')
      if (metrics.mobileNavDisplay !== 'none') throw new Error('desktop: la navegación móvil está visible')
    }

    if (name === 'mobile') {
      if (metrics.mobileNavDisplay === 'none' || metrics.mobileNavDisplay === 'missing') throw new Error('mobile: la navegación inferior no está visible')
      await page.locator('.mobile-menu-button').first().click()
      await page.locator('.premium-sidebar.sidebar-open').waitFor({ state: 'visible', timeout: 5000 })
      await page.locator('.sidebar-close').click()
    }

    await page.locator('.ref-feature-controls button').nth(1).click()
    await page.locator('.ref-game-actions button').click()
    await page.locator('.ref-arrows button').nth(1).click()
    await page.screenshot({ path: `${outputDir}/${name}-validated.png`, fullPage: true })

    const relevantConsoleErrors = consoleErrors.filter(error => !error.includes('favicon') && !error.includes('Failed to load resource'))
    if (relevantConsoleErrors.length > 0) throw new Error(`${name}: errores de consola: ${relevantConsoleErrors.join(' | ')}`)

    record.passed = true
    results.push(record)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    record.passed = false
    record.error = message
    results.push(record)
    failures.push(message)
    try { await page.screenshot({ path: `${outputDir}/${name}-failure.png`, fullPage: true }) } catch {}
  } finally {
    await page.close()
    await saveJson()
  }
}

try {
  await validateViewport('desktop', { width: 1440, height: 1000 })
  await validateViewport('mobile', { width: 390, height: 844 })
} finally {
  await browser.close()
}

if (failures.length > 0) {
  console.error('Validación visual fallida:')
  for (const failure of failures) console.error(`- ${failure}`)
  process.exit(1)
}

console.log('Validación visual completada correctamente.')
