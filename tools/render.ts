// Renders the videos offline, to look at them without a Claude Code session.
//
//   npx tsx tools/render.ts           every video: assets/preview.png, plus a
//                                     table of ms per frame and SVG frame sizes
//   npx tsx tools/render.ts <kind>    one video over time: tools/out/<kind>.png
//   npx tsx tools/render.ts <theme>   a theme of plugin/hooks/themes/, one row per video:
//                                     tools/out/<theme>.png, and a check that each
//                                     video paints every pixel at three sizes
//
// It runs the same simulations the mod runs, at the same 32 x 56 pixels.

import { mkdirSync, writeFileSync } from 'node:fs'

import { svgFrame } from '../plugin/hooks/cells'
import { THEMES } from '../plugin/hooks/themes'
import { rngFrom } from '../plugin/hooks/draw'
import { MAKERS } from '../plugin/hooks/themes'
import type { Kind } from '../plugin/types'
import { png } from './png'

const W = 32
const H = 56
const SVG_LIMIT = 131072

// Lays frames out on a grid, each pixel `scale` times bigger, `gap` apart.
function sheet(frames: Uint32Array[], cols: number, scale: number, gap: number): Buffer {
  const rows = Math.ceil(frames.length / cols)
  const OW = cols * (W * scale + gap) + gap
  const OH = rows * (H * scale + gap) + gap
  const out = new Uint8Array(OW * OH * 3).fill(18)
  frames.forEach((px, i) => {
    const ox = gap + (i % cols) * (W * scale + gap)
    const oy = gap + Math.floor(i / cols) * (H * scale + gap)
    for (let y = 0; y < H * scale; y++)
      for (let x = 0; x < W * scale; x++) {
        const c = px[Math.floor(y / scale) * W + Math.floor(x / scale)]!
        const o = ((oy + y) * OW + ox + x) * 3
        out[o] = (c >> 16) & 255
        out[o + 1] = (c >> 8) & 255
        out[o + 2] = c & 255
      }
  })
  return png(OW, OH, out)
}

const args = process.argv.slice(2)
const unknown = args.filter(a => !(a in THEMES) && !(a in MAKERS))
if (unknown.length) {
  console.error(`Unknown kind or theme: ${unknown.join(', ')}.\nThemes: ${Object.keys(THEMES).join(', ')}\nKinds: ${Object.keys(MAKERS).join(', ')}`)
  process.exit(1)
}
const kinds = args.flatMap(a => (a in THEMES ? Object.keys(THEMES[a as keyof typeof THEMES]) : [a])) as Kind[]

// Frames 60 to 480 of one run, every 60 (4 s at 15 frames a second).
function filmstrip(kind: Kind): Uint32Array[] {
  const sim = MAKERS[kind](W, H, rngFrom(1234))
  const frames: Uint32Array[] = []
  for (let f = 1; f <= 480; f++) {
    sim.step()
    if (f % 60 === 0) {
      const px = new Uint32Array(W * H)
      sim.draw(px)
      frames.push(px)
    }
  }
  return frames
}

// Runs a video at a size, and before each draw fills the buffer with a marker
// no colour uses: a marker left afterwards is a pixel the video forgot.
const MARK = 0xff000000
function probe(kind: Kind, w: number, h: number, frames: number): string | undefined {
  try {
    const sim = MAKERS[kind](w, h, rngFrom(99))
    const px = new Uint32Array(w * h)
    // the feed may draw a clip before its first step
    px.fill(MARK)
    sim.draw(px)
    if (px.includes(MARK)) return `${px.filter(c => c === MARK).length} pixels left unpainted at ${w}x${h}, before the first step`
    for (let f = 1; f <= frames; f++) {
      sim.step()
      if (f % 25 === 0) {
        px.fill(MARK)
        sim.draw(px)
        const left = px.filter(c => c === MARK).length
        if (left) return `${left} pixels left unpainted at ${w}x${h}, frame ${f}`
      }
    }
  } catch (e) {
    return `throws at ${w}x${h}: ${(e as Error).message}`
  }
  return undefined
}

// Runs a video 600 frames: ms per frame, its slowest frame, and its largest SVG frame.
function budget(kind: Kind, seed: number, keep?: Uint32Array[]): { ms: number; peak: number; svg: number } {
  const sim = MAKERS[kind](W, H, rngFrom(seed))
  const px = new Uint32Array(W * H)
  let svg = 0
  let peak = 0
  const t0 = performance.now()
  for (let f = 1; f <= 600; f++) {
    const s0 = performance.now()
    sim.step()
    peak = Math.max(peak, performance.now() - s0)
    if (f % 10 === 0) {
      sim.draw(px)
      svg = Math.max(svg, svgFrame(px, W, H).length)
    }
    if (f === 170) keep?.push(px.slice())
  }
  return { ms: (performance.now() - t0) / 600, peak, svg }
}

const SIZES = [
  [32, 56],
  [20, 34],
  [12, 16],
] as const

mkdirSync('tools/out', { recursive: true })
if (kinds.length === 1) {
  const only = kinds[0] as Kind
  writeFileSync(`tools/out/${only}.png`, sheet(filmstrip(only), 8, 6, 6))
  console.log(`tools/out/${only}.png: frames 60 to 480, every 60 (4 s at 15 frames a second)`)
} else if (kinds.length > 1) {
  const name = args.length === 1 ? (args[0] as string) : 'sheet'
  writeFileSync(`tools/out/${name}.png`, sheet(kinds.flatMap(filmstrip), 8, kinds.length > 8 ? 3 : 5, 3))
  console.log(`tools/out/${name}.png: one row per video, frames 60 to 480 every 60\n`)
  for (const kind of kinds) {
    const { ms, peak, svg } = budget(kind, 777)
    const problems = SIZES.map(([w, h]) => probe(kind, w, h, 400)).filter(Boolean)
    console.log(`${kind.padEnd(13)} ${ms.toFixed(3)} ms/frame  slowest ${peak.toFixed(1)} ms  largest SVG frame ${svg}${svg > SVG_LIMIT ? '  TOO LARGE' : ''}  ${problems.join('; ')}`)
  }
} else {
  const frames: Uint32Array[] = []
  const problems: string[] = []
  let worst = 0
  for (const [i, kind] of (Object.keys(MAKERS) as Kind[]).entries()) {
    const { ms, peak, svg } = budget(kind, 777 + i, frames)
    worst = Math.max(worst, svg)
    console.log(`${kind.padEnd(13)} ${ms.toFixed(3)} ms/frame  slowest ${peak.toFixed(1)} ms  largest SVG frame ${svg}${svg > SVG_LIMIT ? '  TOO LARGE' : ''}`)
    for (const [w, h] of SIZES) {
      const problem = probe(kind, w, h, 300)
      if (problem) problems.push(`${kind}: ${problem}`)
    }
  }
  // Wide enough to stay a landscape picture as the videos add up.
  const big = frames.length > 60
  writeFileSync('assets/preview.png', sheet(frames, Math.max(7, Math.ceil(Math.sqrt(frames.length * 2.2))), big ? 2 : 4, big ? 3 : 5))
  console.log(`\nassets/preview.png written. Largest SVG frame ${worst} of ${SVG_LIMIT} allowed.`)
  for (const p of problems) console.log(`PROBLEM ${p}`)
  if (worst > SVG_LIMIT || problems.length) process.exit(1)
}
