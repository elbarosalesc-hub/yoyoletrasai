import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { gameExperiences } from '../../apps/web/lib/games/catalog'

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

    for (const path of ['/app', '/cursos', '/misiones', '/profesor-virtual', '/juegos', '/inclusion']) {
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

    for (const game of gameExperiences.filter((item) => item.status === 'playable' && item.route)) {
      const route = game.route!.startsWith('#') ? `/juegos${game.route}` : game.route!
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok(), `${game.title} debe abrir con sesión válida`).toBeTruthy()
      await expect(page.locator('body')).not.toContainText('Application error')
      await expect(page.locator('body')).not.toContainText('Internal Server Error')
    }

    expect(browserErrors).toEqual([])
  })

  test('Inclusión y PIE filtra, guarda y recupera un tablero sin alterar la experiencia aprobada', async ({ page }) => {
    await page.goto(`${baseUrl}/acceso?next=/inclusion`, { waitUntil: 'networkidle' })
    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /Ingresar/i }).click()
    await page.waitForURL(/\/(inclusion|seleccionar-institucion)(?:[/?#]|$)/, { timeout: 20_000 })

    if (page.url().includes('/seleccionar-institucion')) {
      const firstChoice = page.locator('button, a').filter({ hasText: /Ingresar|Seleccionar|Continuar|Abrir/i }).first()
      await expect(firstChoice).toBeVisible()
      await firstChoice.click()
      await page.goto(`${baseUrl}/inclusion`, { waitUntil: 'networkidle' })
    }

    const search = page.getByRole('textbox', { name: /Buscar pictogramas/i })
    await search.fill('Respirar')
    await expect(page.getByRole('button', { name: /Respirar/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Preparar/i })).toHaveCount(0)

    await search.fill('')
    await page.getByRole('button', { name: /Respirar/i }).click()
    await page.getByRole('checkbox', { name: /Marcar paso completado/i }).check()
    await page.getByRole('button', { name: /Guardar tablero/i }).click()
    await expect(page.getByRole('status')).toContainText(/guardado/i)

    const localCopy = await page.evaluate(() => localStorage.getItem('yoyo-inclusion-board'))
    expect(localCopy).toBeNull()

    await page.reload({ waitUntil: 'networkidle' })
    await expect(page.getByRole('status')).toContainText(/institucional recuperado/i)
    await expect(page.getByRole('checkbox', { name: /Marcar paso completado/i })).toBeChecked()
  })

  test('Informes y Familias persisten borradores y aprobaciones en el backend E2E', async ({ page }) => {
    await page.goto(`${baseUrl}/acceso?next=/informes`, { waitUntil: 'networkidle' })
    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /Ingresar/i }).click()
    await page.waitForURL(/\/(informes|seleccionar-institucion)(?:[/?#]|$)/, { timeout: 20_000 })

    if (page.url().includes('/seleccionar-institucion')) {
      const firstChoice = page.locator('button, a').filter({ hasText: /Ingresar|Seleccionar|Continuar|Abrir/i }).first()
      await expect(firstChoice).toBeVisible()
      await firstChoice.click()
      await page.goto(`${baseUrl}/informes`, { waitUntil: 'networkidle' })
    }

    const localReport = await page.evaluate(() => localStorage.getItem('yoyo-report-draft'))
    expect(localReport).toBeNull()

    const contextResponse = await page.request.get(`${baseUrl}/api/profesor-virtual/context`)
    expect(contextResponse.ok()).toBeTruthy()
    const context = await contextResponse.json() as { courses?: Array<{ id?: string }> }
    const courseId = context.courses?.find((item) => typeof item.id === 'string')?.id
    expect(courseId).toBeTruthy()

    const stamp = Date.now()
    const draftResponse = await page.request.post(`${baseUrl}/api/reports`, {
      data: {
        reportType: 'curso',
        courseId,
        title: `E2E informe ${stamp}`,
        period: 'Validación E2E',
        body: 'Contenido de prueba E2E sin datos personales reales.',
        status: 'draft',
      },
    })
    expect(draftResponse.ok()).toBeTruthy()
    const draft = await draftResponse.json() as { report?: { id?: string; version?: number; status?: string } }
    expect(draft.report?.id).toBeTruthy()
    expect(draft.report?.version).toBe(1)
    expect(draft.report?.status).toBe('draft')

    const approvedResponse = await page.request.post(`${baseUrl}/api/reports`, {
      data: {
        id: draft.report?.id,
        reportType: 'curso',
        courseId,
        title: `E2E informe ${stamp}`,
        period: 'Validación E2E',
        body: 'Contenido de prueba E2E revisado y aprobado.',
        status: 'approved',
      },
    })
    expect(approvedResponse.ok()).toBeTruthy()
    const approved = await approvedResponse.json() as { report?: { version?: number; status?: string } }
    expect(approved.report?.version).toBe(2)
    expect(approved.report?.status).toBe('approved')

    const historyResponse = await page.request.get(`${baseUrl}/api/reports?id=${draft.report?.id}`)
    expect(historyResponse.ok()).toBeTruthy()
    const history = await historyResponse.json() as { report?: { status?: string; version?: number }; versions?: Array<{ version?: number }> }
    expect(history.report?.status).toBe('approved')
    expect(history.report?.version).toBe(2)
    expect(history.versions?.map((item) => item.version)).toEqual(expect.arrayContaining([1, 2]))

    const familyDraftResponse = await page.request.post(`${baseUrl}/api/family-communications`, {
      data: {
        title: `E2E comunicación ${stamp}`,
        body: 'Borrador E2E sin datos personales reales.',
        status: 'draft',
      },
    })
    expect(familyDraftResponse.ok()).toBeTruthy()
    const familyDraft = await familyDraftResponse.json() as { communication?: { id?: string; status?: string } }
    expect(familyDraft.communication?.id).toBeTruthy()
    expect(familyDraft.communication?.status).toBe('draft')

    const familyApprovedResponse = await page.request.post(`${baseUrl}/api/family-communications`, {
      data: {
        id: familyDraft.communication?.id,
        title: `E2E comunicación ${stamp}`,
        body: 'Comunicación E2E revisada y aprobada.',
        status: 'approved',
      },
    })
    expect(familyApprovedResponse.ok()).toBeTruthy()
    const familyApproved = await familyApprovedResponse.json() as { communication?: { status?: string } }
    expect(familyApproved.communication?.status).toBe('approved')
  })

  test('Crear persiste borrador e historial institucional sin localStorage', async ({ page }) => {
    await page.goto(`${baseUrl}/acceso?next=/crear`, { waitUntil: 'networkidle' })
    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /Ingresar/i }).click()
    await page.waitForURL(/\/(crear|seleccionar-institucion)(?:[/?#]|$)/, { timeout: 20_000 })

    if (page.url().includes('/seleccionar-institucion')) {
      const firstChoice = page.locator('button, a').filter({ hasText: /Ingresar|Seleccionar|Continuar|Abrir/i }).first()
      await expect(firstChoice).toBeVisible()
      await firstChoice.click()
      await page.goto(`${baseUrl}/crear`, { waitUntil: 'networkidle' })
    }

    const stamp = Date.now()
    const draft = {
      title: `E2E recurso ${stamp}`,
      level: '3° básico',
      resourceType: 'Guía de aprendizaje',
      subject: 'Lenguaje y Comunicación',
      objective: 'Validar persistencia institucional del creador.',
      adaptation: 'Acceso universal DUA',
      visualStyle: 'Infantil académico premium',
      packageMode: 'Paquete completo',
      questions: [{ id: stamp, text: 'Actividad E2E.' }],
      aiOutput: null,
      origin: 'manual',
      updatedAt: new Date().toISOString(),
    }
    const history = [{ ...draft, id: String(stamp) }]

    const saved = await page.request.put(`${baseUrl}/api/resource-drafts`, { data: { draft, history } })
    expect(saved.ok()).toBeTruthy()

    const loaded = await page.request.get(`${baseUrl}/api/resource-drafts`)
    expect(loaded.ok()).toBeTruthy()
    const data = await loaded.json() as { draft?: { title?: string }; history?: Array<{ id?: string }> }
    expect(data.draft?.title).toBe(draft.title)
    expect(data.history?.[0]?.id).toBe(String(stamp))

    const localCopies = await page.evaluate(() => ({
      draft: localStorage.getItem('yoyo-resource-draft'),
      history: localStorage.getItem('yoyo-resource-history'),
    }))
    expect(localCopies).toEqual({ draft: null, history: null })
  })

  test('Inclusión y PIE transfiere su contexto al Profesor Virtual sin rediseñar el flujo', async ({ page }) => {
    await page.goto(`${baseUrl}/acceso?next=/inclusion`, { waitUntil: 'networkidle' })
    await page.getByRole('textbox', { name: /Correo electrónico/i }).fill(email)
    await page.locator('input[type="password"]').fill(password)
    await page.getByRole('button', { name: /Ingresar/i }).click()
    await page.waitForURL(/\/(inclusion|seleccionar-institucion)(?:[/?#]|$)/, { timeout: 20_000 })

    if (page.url().includes('/seleccionar-institucion')) {
      const firstChoice = page.locator('button, a').filter({ hasText: /Ingresar|Seleccionar|Continuar|Abrir/i }).first()
      await expect(firstChoice).toBeVisible()
      await firstChoice.click()
      await page.goto(`${baseUrl}/inclusion`, { waitUntil: 'networkidle' })
    }

    await page.locator('.visual-board-head input').fill('Rutina PIE de autonomía')
    await page.getByRole('checkbox', { name: /Marcar paso completado/i }).check()
    await page.getByRole('link', { name: /Consultar a YOYO/i }).click()
    await page.waitForURL(/\/profesor-virtual(?:[/?#]|$)/, { timeout: 20_000 })

    await expect(page.getByRole('button', { name: /Adaptar/i })).toHaveClass(/active/)
    await expect(page.getByLabel(/Necesidades y apoyos/i)).toHaveValue(/Rutina PIE de autonomía/)
    await expect(page.getByLabel(/Necesidades y apoyos/i)).toHaveValue(/Seguimiento de pasos activado/)
    await expect(page.getByPlaceholder(/Describe el objetivo, dificultad, curso o recurso/i)).toHaveValue(/Rutina PIE de autonomía/)

    const transferred = await page.evaluate(() => localStorage.getItem('yoyo-profesor-virtual-transfer'))
    expect(transferred).toBeNull()
  })
})
