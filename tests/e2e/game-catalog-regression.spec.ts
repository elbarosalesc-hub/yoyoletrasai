import { expect, test } from '@playwright/test'
import { gameExperiences } from '../../apps/web/lib/games/catalog'

const baseUrl = 'http://127.0.0.1:3000'

function routeFor(game: (typeof gameExperiences)[number]) {
  if (!game.route) return null
  return game.route.startsWith('#') ? `/juegos${game.route}` : game.route
}

test.describe('integridad del catálogo de juegos', () => {
  test('mantiene 12 experiencias distintas y completas', async ({ page }) => {
    expect(gameExperiences).toHaveLength(12)

    const ids = gameExperiences.map(game => game.id)
    const titles = gameExperiences.map(game => game.title)
    expect(new Set(ids).size).toBe(ids.length)
    expect(new Set(titles).size).toBe(titles.length)

    for (const game of gameExperiences) {
      expect(game.id.trim()).not.toBe('')
      expect(game.title.trim()).not.toBe('')
      expect(game.world.trim()).not.toBe('')
      expect(game.subject.trim()).not.toBe('')
      expect(game.levels.trim()).not.toBe('')
      expect(game.skill.trim()).not.toBe('')
      expect(game.mission.trim()).not.toBe('')
      expect(game.accessibility.length).toBeGreaterThan(0)
      if (game.status === 'playable') expect(game.route).toBeTruthy()
    }

    const response = await page.goto(`${baseUrl}/juegos`, { waitUntil: 'networkidle' })
    expect(response?.ok()).toBeTruthy()

    for (const title of titles) {
      await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible()
    }
  })

  for (const game of gameExperiences.filter(item => item.status === 'playable')) {
    test(`${game.title} abre su experiencia`, async ({ page }) => {
      const route = routeFor(game)
      expect(route).toBeTruthy()
      const response = await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
      expect(response?.ok()).toBeTruthy()
      await expect(page.locator('body')).not.toContainText('Application error')
      await expect(page.locator('body')).not.toContainText('Internal Server Error')
    })
  }
})
