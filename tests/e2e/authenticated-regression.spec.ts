import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const baseUrl = 'http://127.0.0.1:3000'
const email = process.env.E2E_TEST_EMAIL?.trim() || ''
const password = process.env.E2E_TEST_PASSWORD?.trim() || ''
const enabled = Boolean(email && password)

test.describe('regresión autenticada', () => {
  test.skip(!enabled, 'Configura E2E_TEST_EMAIL y E2E_TEST_PASSWORD para activar este gate.')

  test('accede y valida rutas protegidas principales sin errores críticos de accesibilidad', async ({ page }) => {
    const browserErrors: string[] = []
    page.on('pageerror', (error) => browserErrors.push(`pageerror: ${error.message}`))
    page.on('console', (message) => {
      if (message.type() === 'error') browserErrors.push(`console: ${message.text()}`)
    })

    await page.goto(`${baseUrl}/acceso?next=/app`, { waitUntil: 'networkidle' })
    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /Ingresar/i }).click()
    await page.waitForURL(/\/(app|seleccionar-institucion)(?:[/?#]|$)/, { timeout: 20_000 })

    if (page.url().includes('/seleccionar-institucion')) {
      const firstChoice = page.locator('button, a').filter({ hasText: /Ingresar|Seleccionar|Continuar|Abrir/i }).first()
      await expect(firstChoice).toBeVisible()
      await firstChoice.click()
      await page.waitForURL(/\/app(?:[/?#]|$)/, { timeout: 20_000 })
    }

    for (const path of ['/app', '/cursos', '/misiones', '/profesor-virtual', '/juegos']) {
      const response = await page.goto(`${baseUrl}${path}`, { waitUntil: 'networkidle' })
      expect(response?.ok(), `${path} debe responder correctamente`).toBeTruthy()
      await expect(page.locator('main, [role="main"]').first()).toBeVisible()

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze()
      const blocking = results.violations.filter((violation) => violation.impact === 'critical' || violation.impact === 'serious')
      expect(blocking.map((violation) => ({ id: violation.id, impact: violation.impact, nodes: violation.nodes.map((node) => node.target) }))).toEqual([])

      await page.keyboard.press('Tab')
      const focusable = await page.evaluate(() => document.activeElement !== document.body)
      expect(focusable).toBeTruthy()
    }

    expect(browserErrors).toEqual([])
  })
})
