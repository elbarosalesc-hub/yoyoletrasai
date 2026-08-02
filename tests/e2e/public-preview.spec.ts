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

test.describe('vista previa premium', () => {
  test('la portada premium carga, navega y no presenta errores', async ({ page }) => {
    const browserErrors = collectBrowserErrors(page)
    const response = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })

    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('El centro de operaciones')
    await expect(page.getByRole('link', { name: /Entrar a la plataforma/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /De la planificación a la evidencia/i })).toBeVisible()

    await page.getByRole('link', { name: 'Explorar el ecosistema' }).click()
    await expect(page).toHaveURL(/#ecosistema$/)

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
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByRole('button', { name: /Mostrar contraseña/i })).toBeVisible()

    await page.screenshot({ path: '/tmp/yoyo-preview/acceso-premium.png', fullPage: true })
    expect(browserErrors).toEqual([])
  })
})
