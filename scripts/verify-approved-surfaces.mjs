import { execFileSync } from 'node:child_process'

const approvedBaseline = 'a90e94dbb561e8e0b03032f6db5fafc25bf2d8e0'

const protectedPaths = [
  'apps/web/app/presentacion/page.tsx',
  'apps/web/app/presentacion/presentacion.module.css',
  'apps/web/app/acceso/page.tsx',
  'apps/web/app/approved-experience.css',
  'apps/web/app/approved-platform.css',
  'apps/web/app/approved-shell.css',
  'apps/web/components/AppShell.tsx',
  'tests/e2e/visual-regression.spec.ts',
  'tests/e2e/visual-regression.spec.ts-snapshots/acceso-1440-linux.png',
  'tests/e2e/visual-regression.spec.ts-snapshots/acceso-390-linux.png',
  'tests/e2e/visual-regression.spec.ts-snapshots/presentacion-1440-linux.png',
  'tests/e2e/visual-regression.spec.ts-snapshots/presentacion-390-linux.png',
  'tests/e2e/visual-regression.spec.ts-snapshots/presentacion-768-linux.png',
]

function git(args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim()
}

function fail(message) {
  console.error(`::error::${message}`)
  process.exitCode = 1
}

try {
  git(['cat-file', '-e', `${approvedBaseline}^{commit}`])
} catch {
  console.error(`::error::No fue posible leer la línea base visual aprobada ${approvedBaseline}. El checkout debe incluir historial completo.`)
  process.exit(1)
}

console.log(`Verificando superficies aprobadas contra ${approvedBaseline}...`)

for (const path of protectedPaths) {
  try {
    const expected = git(['rev-parse', `${approvedBaseline}:${path}`])
    const actual = git(['hash-object', path])

    if (actual !== expected) {
      fail(`Superficie aprobada modificada: ${path}. Esperado ${expected}, actual ${actual}. Conserva la versión aprobada o realiza un proceso explícito de re-aprobación visual.`)
    } else {
      console.log(`OK ${path}`)
    }
  } catch {
    fail(`No fue posible verificar ${path}. El archivo puede faltar o no existir en la línea base aprobada.`)
  }
}

if (process.exitCode) {
  console.error('La validación se detuvo para evitar una regresión sobre la experiencia aprobada.')
} else {
  console.log('Integridad de superficies aprobadas: OK. Las mejoras aditivas pueden continuar.')
}
