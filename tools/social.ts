// Draws the social preview: the picture a link to the repository or the
// project page shows on GitHub, chats and social networks.
//
//   npx tsx tools/social.ts   writes assets/social.png, 1280 x 640
//
// The smiley comes from site/favicon.svg, the clips from the mod's own
// simulations. GitHub takes the picture by hand: Settings, Social preview.

import { readFileSync, writeFileSync } from 'node:fs'

import { rngFrom } from '../plugin/hooks/draw'
import { MAKERS } from '../plugin/hooks/themes'
import type { Kind } from '../plugin/types'
import { png } from './png'

const OW = 1280
const OH = 640
// GitHub crops the edges: its template keeps everything that matters 80 px
// inside them.
const SAFE = 80
const W = 32
const H = 56

// The clips shown, left to right, each at the frame it looks best.
const CLIPS: [Kind, number][] = [
  ['volcano', 250],
  ['aquarium', 170],
  ['nyan', 170],
  ['ramen', 300],
  ['grow', 120],
]

const BG_TOP = 0x17171f
const BG_BOTTOM = 0x2a1d3d
const FRAME = 0x34344a
const TITLE = 0xf4f4f8
const TAGLINE = 0xa8a8c0

// 5 x 7 glyphs, enough for the title and the tagline; g j p q y have an
// eighth row, under the line.
const FONT: Record<string, string[]> = {
  a: ['.....', '.....', '.###.', '....#', '.####', '#...#', '.####'],
  b: ['#....', '#....', '####.', '#...#', '#...#', '#...#', '####.'],
  c: ['.....', '.....', '.###.', '#....', '#....', '#...#', '.###.'],
  d: ['....#', '....#', '.####', '#...#', '#...#', '#...#', '.####'],
  e: ['.....', '.....', '.###.', '#...#', '#####', '#....', '.###.'],
  f: ['..##.', '.#..#', '.#...', '###..', '.#...', '.#...', '.#...'],
  g: ['.....', '.....', '.####', '#...#', '#...#', '.####', '....#', '.###.'],
  h: ['#....', '#....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
  i: ['..#..', '.....', '.##..', '..#..', '..#..', '..#..', '.###.'],
  j: ['...#.', '.....', '..##.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  k: ['#....', '#....', '#..#.', '#.#..', '##...', '#.#..', '#..#.'],
  l: ['.##..', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  m: ['.....', '.....', '##.#.', '#.#.#', '#.#.#', '#...#', '#...#'],
  n: ['.....', '.....', '#.##.', '##..#', '#...#', '#...#', '#...#'],
  o: ['.....', '.....', '.###.', '#...#', '#...#', '#...#', '.###.'],
  p: ['.....', '.....', '####.', '#...#', '#...#', '####.', '#....', '#....'],
  q: ['.....', '.....', '.####', '#...#', '#...#', '.####', '....#', '....#'],
  r: ['.....', '.....', '#.##.', '##..#', '#....', '#....', '#....'],
  s: ['.....', '.....', '.####', '#....', '.###.', '....#', '####.'],
  t: ['.#...', '.#...', '###..', '.#...', '.#...', '.#..#', '..##.'],
  u: ['.....', '.....', '#...#', '#...#', '#...#', '#..##', '.##.#'],
  v: ['.....', '.....', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  w: ['.....', '.....', '#...#', '#...#', '#.#.#', '#.#.#', '.#.#.'],
  x: ['.....', '.....', '#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
  y: ['.....', '.....', '#...#', '#...#', '#...#', '.####', '....#', '.###.'],
  z: ['.....', '.....', '#####', '...#.', '..#..', '.#...', '#####'],
  '0': ['.###.', '#...#', '#..##', '#.#.#', '##..#', '#...#', '.###.'],
  '1': ['..#..', '.##..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  '2': ['.###.', '#...#', '....#', '...#.', '..#..', '.#...', '#####'],
  '3': ['#####', '...#.', '..#..', '...#.', '....#', '#...#', '.###.'],
  '4': ['...#.', '..##.', '.#.#.', '#..#.', '#####', '...#.', '...#.'],
  '5': ['#####', '#....', '####.', '....#', '....#', '#...#', '.###.'],
  '6': ['..##.', '.#...', '#....', '####.', '#...#', '#...#', '.###.'],
  '7': ['#####', '....#', '...#.', '..#..', '.#...', '.#...', '.#...'],
  '8': ['.###.', '#...#', '#...#', '.###.', '#...#', '#...#', '.###.'],
  '9': ['.###.', '#...#', '#...#', '.####', '....#', '...#.', '.##..'],
  '-': ['.....', '.....', '.....', '#####', '.....', '.....', '.....'],
  ',': ['.....', '.....', '.....', '.....', '.##..', '..#..', '.#...'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.##..', '.##..'],
  ' ': ['.....', '.....', '.....', '.....', '.....', '.....', '.....'],
}

const out = new Uint32Array(OW * OH)

function fill(x0: number, y0: number, w: number, h: number, c: number): void {
  for (let y = Math.max(0, y0); y < Math.min(OH, y0 + h); y++) out.fill(c, y * OW + Math.max(0, x0), y * OW + Math.min(OW, x0 + w))
}

const textWidth = (s: string, scale: number) => (s.length * 6 - 1) * scale

function write(s: string, x: number, y: number, scale: number, c: number): void {
  for (const [i, ch] of [...s].entries()) {
    const glyph = FONT[ch]
    if (!glyph) throw new Error(`no glyph for '${ch}'`)
    glyph.forEach((row, gy) => [...row].forEach((p, gx) => p === '#' && fill(x + (i * 6 + gx) * scale, y + gy * scale, scale, scale, c)))
  }
}

// The favicon's 16 x 16 smiley: one rectangle per run in its paths.
function smiley(x: number, y: number, scale: number): void {
  const svg = readFileSync('site/favicon.svg', 'utf8')
  for (const [, colour, d] of svg.matchAll(/fill="#([0-9a-f]{6})" d="([^"]+)"/g))
    for (const [, rx, ry, rw] of d!.matchAll(/M(\d+) (\d+)h(\d+)/g)) fill(x + +rx! * scale, y + +ry! * scale, +rw! * scale, scale, parseInt(colour!, 16))
}

function clip(kind: Kind, frame: number): Uint32Array {
  const sim = MAKERS[kind](W, H, rngFrom(1234))
  for (let f = 0; f < frame; f++) sim.step()
  const px = new Uint32Array(W * H)
  sim.draw(px)
  return px
}

// The background: a vertical gradient.
for (let y = 0; y < OH; y++) {
  const t = y / (OH - 1)
  const ch = (s: number) => Math.round(((BG_TOP >> s) & 255) * (1 - t) + ((BG_BOTTOM >> s) & 255) * t)
  fill(0, y, OW, 1, (ch(16) << 16) | (ch(8) << 8) | ch(0))
}

// The title, the smiley before it, the tagline under it.
const title = 'brainrot-break'
const TS = 8
const SS = 4
const titleW = 16 * SS + 28 + textWidth(title, TS)
const tx = Math.round((OW - titleW) / 2)
smiley(tx, SAFE + 12, SS)
write(title, tx + 16 * SS + 28, SAFE + 16, TS, TITLE)
const tagline = `${Object.keys(MAKERS).length} pixel art mini-videos to scroll while claude answers`
write(tagline, Math.round((OW - textWidth(tagline, 3)) / 2), SAFE + 114, 3, TAGLINE)

// The clips, each in a phone frame.
const CS = 5
const PAD = 8
const GAP = 40
const PW = W * CS + 2 * PAD
const PH = H * CS + 2 * PAD
const rowX = Math.round((OW - (CLIPS.length * PW + (CLIPS.length - 1) * GAP)) / 2)
const rowY = OH - SAFE - PH
if (rowX < SAFE || tx < SAFE) throw new Error('the clips or the title spill out of the safe area: fewer clips, or smaller')
for (const [i, [kind, frame]] of CLIPS.entries()) {
  const x0 = rowX + i * (PW + GAP)
  // a frame with its corners cut, two steps deep
  fill(x0 + 2 * CS, rowY, PW - 4 * CS, PH, FRAME)
  fill(x0 + CS, rowY + CS, PW - 2 * CS, PH - 2 * CS, FRAME)
  fill(x0, rowY + 2 * CS, PW, PH - 4 * CS, FRAME)
  const px = clip(kind, frame)
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) fill(x0 + PAD + x * CS, rowY + PAD + y * CS, CS, CS, px[y * W + x]!)
}

const rgb = new Uint8Array(OW * OH * 3)
out.forEach((c, i) => {
  rgb[i * 3] = (c >> 16) & 255
  rgb[i * 3 + 1] = (c >> 8) & 255
  rgb[i * 3 + 2] = c & 255
})
writeFileSync('assets/social.png', png(OW, OH, rgb))
console.log('assets/social.png written, 1280 x 640')
