// Adds the kinds of hooks/themes/ to the `Kind` union in types/index.d.ts,
// which must list every kind by name (the engine wants that file to stand alone):
//
//   npx tsx tools/sync-kinds.ts           adds the missing kinds
//   npx tsx tools/sync-kinds.ts --check   only fails if one is missing

import { readFileSync, writeFileSync } from 'node:fs'

import { THEME_MAKERS } from '../hooks/themes'

const path = 'types/index.d.ts'
const text = readFileSync(path, 'utf8').split('\r\n').join('\n')
const union = text.match(/export type Kind =\n(?: {2}\| '[a-z0-9]+'\n)+/)
if (!union || union.index === undefined) {
  console.error(`Could not find the Kind union in ${path}.`)
  process.exit(1)
}
const listed = new Set([...union[0].matchAll(/'([a-z0-9]+)'/g)].map(m => m[1]))
const missing = Object.keys(THEME_MAKERS).filter(k => !listed.has(k))
if (process.argv.includes('--check')) {
  if (missing.length) {
    console.error(`Kinds missing from ${path}: ${missing.join(', ')}. Run npx tsx tools/sync-kinds.ts`)
    process.exit(1)
  }
  console.log(`${path}: every kind is listed.`)
} else {
  const end = union.index + union[0].length
  writeFileSync(path, text.slice(0, end) + missing.map(k => `  | '${k}'\n`).join('') + text.slice(end))
  console.log(missing.length ? `Added to ${path}: ${missing.join(', ')}` : `${path}: nothing to add.`)
}
