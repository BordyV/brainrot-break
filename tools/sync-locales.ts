// Keeps each language of hooks/locales/ in step with the videos:
//
//   npx tsx tools/sync-locales.ts           rewrites hooks/locales/<lang>/videos.ts
//                                           from the theme files there, and lists
//                                           the videos each language still lacks
//   npx tsx tools/sync-locales.ts --check   only lists them, and fails if any
//
// A language's videos come one file per theme (hooks/locales/<lang>/<theme>.ts),
// each exporting the theme's name in capitals.

import { existsSync, readdirSync, writeFileSync } from 'node:fs'

import { MISSING } from '../hooks/i18n'
import { LOCALES } from '../hooks/locales'

const isCheck = process.argv.includes('--check')
let missing = 0

for (const lang of Object.keys(LOCALES) as (keyof typeof LOCALES)[]) {
  const dir = `hooks/locales/${lang}`
  if (!isCheck) {
    const files = readdirSync(dir)
      .filter(f => f.endsWith('.ts') && !['index.ts', 'ui.ts', 'videos.ts'].includes(f))
      .map(f => f.slice(0, -3))
      .sort((a, b) => a.localeCompare(b))
    const name = (f: string) => f.toUpperCase()
    const out = [
      "import type { Locale } from '../../i18n'",
      ...files.map(f => `import { ${name(f)} } from './${f}'`),
      '',
      "// Every video's texts in this language, gathered from one file per theme.",
      '',
      "export const VIDEOS: Locale['videos'] = {",
      ...files.map(f => `  ...${name(f)},`),
      '}',
      '',
    ]
    if (existsSync(dir)) writeFileSync(`${dir}/videos.ts`, out.join('\n'))
  }
  const left = MISSING[lang]
  missing += left.length
  console.log(`${lang}: ${left.length ? `${left.length} videos left (${left.slice(0, 8).join(', ')}${left.length > 8 ? ', ...' : ''})` : 'complete'}`)
}

if (isCheck && missing > 0) process.exit(1)
