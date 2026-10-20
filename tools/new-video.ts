// Scaffolds a new video in a theme, in the three places one lives:
//
//   npx tsx tools/new-video.ts <theme> <kind> "<English name>" "<French name>"
//   npx tsx tools/new-video.ts sports bowling "bowling" "bowling"
//
// 1. types/index.d.ts          the kind joins the `Kind` union
// 2. hooks/themes/<theme>.ts   a working placeholder simulation, listed in the theme's table
// 3. hooks/texts/<theme>.ts    its name, authors, tags, captions and sounds (TODO lines)
//
// Then write the simulation, replace every TODO and translate it in
// hooks/locales/: the tests fail until all of it is done, so a half-made video
// never ships. AGENTS.md has the rest.

import { readdirSync, readFileSync, writeFileSync } from 'node:fs'

const themes = readdirSync('hooks/themes')
  .filter(f => f.endsWith('.ts') && f !== 'index.ts')
  .map(f => f.slice(0, -3))

const [theme, kind, en, fr] = process.argv.slice(2)
if (!theme || !kind || !en || !fr || !/^[a-z][a-z0-9]*$/.test(kind)) {
  console.error('Usage: npx tsx tools/new-video.ts <theme> <kind: lowercase letters and digits> "<English name>" "<French name>"')
  console.error(`Themes: ${themes.join(', ')}`)
  process.exit(1)
}
if (!themes.includes(theme)) {
  console.error(`No theme "${theme}". Themes: ${themes.join(', ')}. A new theme needs its two files and a line in each index.ts: see AGENTS.md.`)
  process.exit(1)
}

const files = {
  types: 'types/index.d.ts',
  videos: `hooks/themes/${theme}.ts`,
  texts: `hooks/texts/${theme}.ts`,
}
// Read with LF line endings whatever the checkout uses; written back with LF.
const text = Object.fromEntries(Object.entries(files).map(([k, p]) => [k, readFileSync(p, 'utf8').split('\r\n').join('\n')])) as Record<keyof typeof files, string>

if (text.types.includes(`| '${kind}'`)) {
  console.error(`The kind "${kind}" exists already.`)
  process.exit(1)
}

function insert(name: keyof typeof files, anchor: RegExp, make: (match: string) => string) {
  const m = text[name].match(anchor)
  if (!m || m.index === undefined) {
    console.error(`Could not find where to add "${kind}" in ${files[name]} (looked for ${anchor}). Add it by hand: see AGENTS.md.`)
    process.exit(1)
  }
  text[name] = text[name].slice(0, m.index) + make(m[0]) + text[name].slice(m.index + m[0].length)
}

// 1. The Kind union: after its last member.
insert('types', /export type Kind =\n(?: {2}\| '[a-z0-9]+'\n)+/, m => `${m}  | '${kind}'\n`)

// 2. A placeholder that already plays, with no imports: a bouncing dot.
insert(
  'videos',
  /\nexport const [A-Z]+ = \{\n(?: {2}[a-z0-9]+,\n)*\}/,
  m =>
    `
// --- ${en} ` +
    '-'.repeat(Math.max(3, 79 - en.length)) +
    `

const ${kind}: Maker = (W, H, rng) => {
  // TODO: the simulation. step() moves it one frame (15 a second);
  // draw(px) paints all W * H pixels, 0x00RRGGBB, row by row.
  let x = rng() * W
  let y = rng() * H
  let vx = 0.6
  let vy = 0.45
  return {
    step() {
      x += vx
      y += vy
      if (x < 1 || x > W - 2) vx = -vx
      if (y < 1 || y > H - 2) vy = -vy
    },
    draw(px) {
      px.fill(0x202040)
      px[Math.round(y) * W + Math.round(x)] = 0xffffff
    },
  }
}
` +
    m.replace(/\}$/, `  ${kind},\n}`),
)

// 3. The texts: before the closing brace of the theme's table.
const quote = (s: string) => s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
insert(
  'texts',
  /\n\} satisfies Record<string, Entry>/,
  m =>
    `
  ${kind}: {
    name: { en: '${quote(en)}', fr: '${quote(fr)}' },
    authors: ['@TODO.one', '@TODO.two', '@TODO.three'],
    tags: ['#TODO #fyp', '#TODO #satisfying', '#TODO #foryou'],
    captions: {
      en: ['TODO caption 1', 'TODO caption 2', 'TODO caption 3', 'TODO caption 4'],
      fr: ['TODO légende 1', 'TODO légende 2', 'TODO légende 3', 'TODO légende 4'],
    },
    sounds: {
      en: ['TODO sound 1', 'TODO sound 2', 'TODO sound 3'],
      fr: ['TODO son 1', 'TODO son 2', 'TODO son 3'],
    },
  },` + m,
)

for (const [name, path] of Object.entries(files)) writeFileSync(path, text[name as keyof typeof files])
console.log(`Added "${kind}" to ${Object.values(files).join(', ')}.

Next:
  1. Write the simulation in ${files.videos} (search for "TODO: the simulation").
  2. Replace every TODO in its entry in ${files.texts}, English and French.
     Author handles must be unique across every video.
  3. npx tsx tools/render.ts ${kind}   look at tools/out/${kind}.png
  4. Translate it in hooks/locales/<lang>/${theme}.ts (es, de, pt, it), the same
     lines in the same order; npx tsx tools/sync-locales.ts lists what is left.
  5. npx tsx tools/check.ts             everything else
`)
