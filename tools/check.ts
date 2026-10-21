// Everything to run before a commit, in order, stopping at the first failure:
//
//   npx tsx tools/check.ts
//
// every kind listed in types/index.d.ts, type-check, `claude plugin validate`, `claude plugin test`, then the offline
// render (every video runs 600 frames, SVG frames stay under the desktop's
// limit, assets/preview.png is redrawn), and the project page's build.

import { existsSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const steps: [string, string][] = [
  ['kinds', 'npx -y tsx@4.19.2 tools/sync-kinds.ts --check'],
  ['locales', 'npx -y tsx@4.19.2 tools/sync-locales.ts --check'],
  ['types', 'npx -y -p typescript@5.6.3 tsc -p . --noEmit'],
  ['validate', 'claude plugin validate .'],
  ['test', 'claude plugin test .'],
  ['render', 'npx -y tsx@4.19.2 tools/render.ts'],
  ['site', 'npx -y tsx@4.19.2 tools/site.ts'],
]

for (const [name, command] of steps) {
  if (name === 'types' && !existsSync('.claude-plugin/types/tsconfig.json')) {
    console.warn(
      '\n== types: skipped. The engine writes .claude-plugin/types/ when it hot-reloads the mod:\n' +
        '   run `claude --plugin-dir .` here once (an interactive session), then check again.',
    )
    continue
  }
  console.log(`\n== ${name}: ${command}`)
  const run = spawnSync(command, { shell: true, stdio: 'inherit' })
  if (run.status !== 0) {
    console.error(`\n== ${name} failed.`)
    process.exit(run.status ?? 1)
  }
}
console.log('\n== all checks passed.')
