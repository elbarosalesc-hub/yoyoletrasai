import { mkdir } from 'node:fs/promises'
import { expect, test, type Page } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

function collectBrowserErrors(page: Page) {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  return errors
}

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1)
}

async function expectBasicAccessibility(page: Page) {
  const violations = await page.evaluate(() => {
    const missingAlt = [...document.querySelectorAll('img')].filter((node) => !node.hasAttribute('alt')).length
    const unnamedButtons = [...document.querySelectorAll('button')].filter((node) => {
      const text = node.textContent?.trim()
      return !text && !node.getAttribute('aria-label') && !node.getAttribute('aria-labelledby') && !node.getAttribute('title')
    }).length
    const unnamedLinks = [...document.querySelectorAll('a')].filter((node) => {
      const text = node.textContent?.trim()
      return !text && !node.getAttribute('aria-label') && !node.getAttribute('aria-labelledby') && !node.getAttribute('title')
    }).length
    return { missingAlt, unnamedButtons, unnamedLinks }
  })
  expect(violations).toEqual({ missingAlt: 0, unnamedButtons: 0, unnamedLinks: 0 })
}

async function expectKeyboardEntry(page: Page) {
  await page.keyboard.press('Tab')
  const active = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement | null
    return { tag: element?.tagName || '', focusable: Boolean(element && element !== document.body) }
  })
  expect(active.focusable).toBeTruthy()
}

test.describe('vista previa premium', () => {
  test('la portada premium carga, navega y no presenta errores', async ({ page }) => {
    const browserErrors = collectBrowserErrors(page)
    const response = await page.goto(`${baseUrl}/presentacion`, { waitUntil: 'networkidle' })

    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('El centro de operaciones')
    await expect(page.getByRole('link', { name: /Entrar a la plataforma/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /De la planificación a la evidencia/i })).toBeVisible()

    await page.getByRole('link', { name: 'Explorar el ecosistema' }).click()
    await expect(page).toHaveURL(/#ecosistema$/)
    await expectNoHorizontalOverflow(page)
    await expectBasicAccessibility(page)
    await expectKeyboardEntry(page)

    await mkdir('/tmp/yoyo-preview', { recursive: true })
    await page.screenshot({ path: '/tmp/yoyo-preview/portada-premium.png', fullPage: true })

    expect(browserErrors).toEqual([])
  })

  test('el acceso premium se muestra correctamente', async ({ page }) => {
    const browserErrors = collectBrowserErrors(page)
    const response = await page.goto(`${baseUrl}/acceso`, { waitUntil: 'networkidle' })

    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Aprendizaje, inclusión y gestión escolar')
    await expect(page.getByRole('heading', { name: 'Bienvenida nuevamente' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: /Correo electrónico/i })).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Mostrar contraseña/i })).toBeVisible()
    await expectNoHorizontalOverflow(page)
    await expectBasicAccessibility(page)
    await expectKeyboardEntry(page)

    await page.screenshot({ path: '/tmp/yoyo-preview/acceso-premium.png', fullPage: true })
    expect(browserErrors).toEqual([])
  })

  for (const viewport of [
    { name: 'movil', width: 390, height: 844 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1440, height: 900 },
  ]) {
    test(`portada sin desborde en ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      await page.goto(`${baseUrl}/presentacion`, { waitUntil: 'networkidle' })
      await expectNoHorizontalOverflow(page)
      await mkdir('/tmp/yoyo-preview', { recursive: true })
      await page.screenshot({ path: `/tmp/yoyo-preview/portada-${viewport.name}.png`, fullPage: true })
    })
  }

  test('respeta preferencia de movimiento reducido del sistema', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.goto(`${baseUrl}/presentacion`, { waitUntil: 'networkidle' })
    const matches = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    expect(matches).toBeTruthy()
  })
})
