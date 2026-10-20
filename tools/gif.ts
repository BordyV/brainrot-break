// Writes assets/feed.gif, the README's moving picture: a few videos playing
// side by side, as the feed draws them.
//
//   npx tsx tools/gif.ts              the default line-up
//   npx tsx tools/gif.ts <kind>...    those videos instead
//
// It runs the same simulations the mod runs, at the same 32 x 56 pixels.

import { writeFileSync } from 'node:fs'

import { rngFrom } from '../hooks/draw'
import { MAKERS } from '../hooks/themes'
import type { Kind } from '../types'

const W = 32
const H = 56
const SCALE = 4
const GAP = 8
const FRAMES = 120
// Skipped before recording, so the clips are already under way.
const WARMUP = 150
// 15 frames a second, as the feed steps them; GIF delays are in hundredths.
const DELAY = 7
const BACKGROUND = 0x121212

const args = process.argv.slice(2)
const unknown = args.filter(a => !(a in MAKERS))
if (unknown.length) {
  console.error(`Unknown kind: ${unknown.join(', ')}`)
  process.exit(1)
}
const kinds = (args.length ? args : ['tetris', 'feux', 'lava', 'sable', 'rings', 'aurore']) as Kind[]

const OW = kinds.length * (W * SCALE + GAP) + GAP
const OH = H * SCALE + GAP * 2

// Every frame of the line-up, as 0xRRGGBB pixels of the whole picture.
function frames(): Uint32Array[] {
  const sims = kinds.map(k => MAKERS[k](W, H, rngFrom(1234)))
  const px = new Uint32Array(W * H)
  const out: Uint32Array[] = []
  for (let f = 0; f < WARMUP; f++) for (const sim of sims) sim.step()
  for (let f = 0; f < FRAMES; f++) {
    const img = new Uint32Array(OW * OH).fill(BACKGROUND)
    sims.forEach((sim, i) => {
      sim.step()
      sim.draw(px)
      const ox = GAP + i * (W * SCALE + GAP)
      for (let y = 0; y < H * SCALE; y++)
        for (let x = 0; x < W * SCALE; x++) img[(GAP + y) * OW + ox + x] = px[Math.floor(y / SCALE) * W + Math.floor(x / SCALE)]!
    })
    out.push(img)
  }
  return out
}

// The 255 most used colours, index 0 left for "unchanged since the last frame".
function palette(all: Uint32Array[]): number[] {
  const count = new Map<number, number>()
  for (const img of all) for (const c of img) count.set(c, (count.get(c) ?? 0) + 1)
  return [0, ...[...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 255).map(([c]) => c)]
}

function nearest(colours: number[]) {
  const cache = new Map<number, number>()
  for (let i = 1; i < colours.length; i++) cache.set(colours[i]!, i)
  return (c: number) => {
    const hit = cache.get(c)
    if (hit !== undefined) return hit
    let best = 1
    let dist = Infinity
    for (let i = 1; i < colours.length; i++) {
      const p = colours[i]!
      const dr = ((p >> 16) & 255) - ((c >> 16) & 255)
      const dg = ((p >> 8) & 255) - ((c >> 8) & 255)
      const db = (p & 255) - (c & 255)
      const d = dr * dr * 2 + dg * dg * 4 + db * db * 3
      if (d < dist) {
        dist = d
        best = i
      }
    }
    cache.set(c, best)
    return best
  }
}

// GIF's variable-width LZW over 8-bit indexes, cut into sub-blocks.
function lzw(indexes: Uint8Array): Buffer {
  const clear = 256
  const end = 257
  const bytes: number[] = []
  let acc = 0
  let bits = 0
  let size = 9
  const emit = (code: number) => {
    acc |= code << bits
    bits += size
    while (bits >= 8) {
      bytes.push(acc & 255)
      acc >>>= 8
      bits -= 8
    }
  }
  let dict = new Map<number, number>()
  let next = 258
  emit(clear)
  let prefix = indexes[0]!
  for (let i = 1; i < indexes.length; i++) {
    const k = indexes[i]!
    const key = prefix * 256 + k
    const found = dict.get(key)
    if (found !== undefined) {
      prefix = found
      continue
    }
    emit(prefix)
    if (next < 4096) {
      dict.set(key, next++)
      if (next > 1 << size && size < 12) size++
    } else {
      emit(clear)
      dict = new Map()
      next = 258
      size = 9
    }
    prefix = k
  }
  emit(prefix)
  emit(end)
  if (bits > 0) bytes.push(acc & 255)
  const out: number[] = [8]
  for (let i = 0; i < bytes.length; i += 255) {
    const block = bytes.slice(i, i + 255)
    out.push(block.length, ...block)
  }
  out.push(0)
  return Buffer.from(out)
}

const u16 = (n: number) => [n & 255, (n >> 8) & 255]

const all = frames()
const colours = palette(all)
const toIndex = nearest(colours)
const parts: Buffer[] = [
  Buffer.from('GIF89a', 'ascii'),
  Buffer.from([...u16(OW), ...u16(OH), 0xf7, 0, 0]),
  Buffer.from(colours.flatMap(c => [(c >> 16) & 255, (c >> 8) & 255, c & 255])),
  // loop for ever
  Buffer.from([0x21, 0xff, 11, ...Buffer.from('NETSCAPE2.0', 'ascii'), 3, 1, 0, 0, 0]),
]
let prev: Uint8Array | undefined
for (const img of all) {
  const idx = new Uint8Array(img.length)
  for (let i = 0; i < img.length; i++) idx[i] = toIndex(img[i]!)
  // a pixel unchanged since the last frame is left transparent, which LZW packs well
  const out = prev ? idx.map((v, i) => (v === prev![i] ? 0 : v)) : idx
  prev = idx
  parts.push(Buffer.from([0x21, 0xf9, 4, 0x05, ...u16(DELAY), 0, 0]))
  parts.push(Buffer.from([0x2c, 0, 0, 0, 0, ...u16(OW), ...u16(OH), 0]))
  parts.push(lzw(out))
}
parts.push(Buffer.from([0x3b]))
const gif = Buffer.concat(parts)
writeFileSync('assets/feed.gif', gif)
console.log(`assets/feed.gif written: ${OW} x ${OH}, ${FRAMES} frames, ${Math.round(gif.length / 1024)} KB`)
