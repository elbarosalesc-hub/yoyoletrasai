import { expect, test, type Page } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'

async function stabilize(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.addStyleTag({ content: `
    *, *::before, *::after {
      animation-duration: 0s !important;
      animation-delay: 0s !important;
      transition-duration: 0s !important;
      transition-delay: 0s !important;
      caret-color: transparent !important;
    }
  ` })
}

async function capture(page: Page, path: string, name: string, width: number, height: number) {
  await page.setViewportSize({ width, height })
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
  expect(response?.ok()).toBeTruthy()
  await stabilize(page)
  await page.evaluate(() => document.fonts?.ready)
  await expect(page).toHaveScreenshot(name, {
    fullPage: true,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixelRatio: 0.01,
    threshold: 0.2,
  })
}

test.describe('regresión visual pública', () => {
  test('portada móvil 390x844', async ({ page }) => {
    await capture(page, '/presentacion', 'presentacion-390.png', 390, 844)
  })

  test('portada tablet 768x1024', async ({ page }) => {
    await capture(page, '/presentacion', 'presentacion-768.png', 768, 1024)
  })

  test('portada desktop 1440x900', async ({ page }) => {
    await capture(page, '/presentacion', 'presentacion-1440.png', 1440, 900)
  })

  test('acceso móvil 390x844', async ({ page }) => {
    await capture(page, '/acceso', 'acceso-390.png', 390, 844)
  })

  test('acceso desktop 1440x900', async ({ page }) => {
    await capture(page, '/acceso', 'acceso-1440.png', 1440, 900)
  })
})
