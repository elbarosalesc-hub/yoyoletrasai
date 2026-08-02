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

test.describe('vista previa aprobada', () => {
  test('la portada carga, navega y no presenta errores de navegador', async ({ page }) => {
    const browserErrors = collectBrowserErrors(page)
    const response = await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' })

    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Una plataforma clara, inclusiva y conectada')
    await expect(page.getByRole('link', { name: /Acceder a la plataforma/i })).toBeVisible()
    await expect(page.getByRole('heading', { name: /Todo el trabajo pedagógico organizado/i })).toBeVisible()

    await page.getByRole('link', { name: 'Explorar módulos' }).click()
    await expect(page).toHaveURL(/#ecosistema$/)

    await mkdir('/tmp/yoyo-preview', { recursive: true })
    await page.screenshot({ path: '/tmp/yoyo-preview/portada-aprobada.png', fullPage: true })

    expect(browserErrors).toEqual([])
  })

  test('el acceso seguro se muestra correctamente', async ({ page }) => {
    const browserErrors = collectBrowserErrors(page)
    const response = await page.goto(`${baseUrl}/acceso`, { waitUntil: 'networkidle' })

    expect(response?.ok()).toBeTruthy()
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Aprendizaje, inclusión y gestión escolar')
    await expect(page.getByRole('heading', { name: 'Bienvenida nuevamente' })).toBeVisible()
    await expect(page.getByLabel('Correo electrónico')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()

    await page.screenshot({ path: '/tmp/yoyo-preview/acceso-seguro.png', fullPage: true })
    expect(browserErrors).toEqual([])
  })
})
