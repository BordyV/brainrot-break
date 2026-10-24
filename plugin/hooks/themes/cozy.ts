import { add, disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { clamp, ellipse, hash, irand, line, lit, litSprite, pick, ring, shuffle, slab, tint } from '../kit'

// Cozy & lo-fi: slow, steady motion to rest the eyes while Claude thinks.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

// --- lo-fi study desk -------------------------------------------------------------

const lofi: Maker = (W, H, rng) => {
  const desk = Math.round(H * 0.66)
  let t = 0
  const drops = Array.from({ length: 16 }, () => ({ x: rng(), y: rng() }))
  const wx0 = 2
  const wx1 = Math.round(W * 0.55)
  const wy0 = 4
  const wy1 = Math.round(H * 0.4)

  return {
    step() {
      t++
      for (const d of drops) {
        d.y += 0.03
        if (d.y > 1) {
          d.y = 0
          d.x = rng()
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a2440, 0x3a2e48, desk)
      rect(px, W, H, wx0, wy0, wx1 - wx0, wy1 - wy0, 0x101830)
      for (let k = 0; k < 7; k++) {
        const bx = wx0 + 1 + k * 3
        const bh = 4 + ((k * 7) % 9)
        rect(px, W, H, bx, wy1 - bh, 3, bh, 0x1a2240)
        for (let y = wy1 - bh + 1; y < wy1; y += 2) if (hash(bx, y, 1) > 0.5) dot(px, W, H, bx + 1, y, 0xffd070)
      }
      for (const d of drops) line(px, W, H, wx0 + d.x * (wx1 - wx0), wy0 + d.y * (wy1 - wy0), wx0 + d.x * (wx1 - wx0), wy0 + d.y * (wy1 - wy0) + 1.5, 0x6a7ab0)
      rect(px, W, H, wx0 - 1, wy0 - 1, wx1 - wx0 + 2, 1, 0x6a4a3a)
      rect(px, W, H, wx0 - 1, wy1, wx1 - wx0 + 2, 1, 0x6a4a3a)
      rect(px, W, H, wx0 - 1, wy0, 1, wy1 - wy0, 0x6a4a3a)
      rect(px, W, H, wx1, wy0, 1, wy1 - wy0, 0x6a4a3a)
      rect(px, W, H, (wx0 + wx1) / 2, wy0, 1, wy1 - wy0, 0x6a4a3a)
      // lamp glow
      for (let y = 0; y < desk; y++) for (let x = 0; x < W; x++) {
        const d = Math.hypot(x - W * 0.82, y - desk + 4)
        if (d < 14) px[y * W + x] = mix(px[y * W + x] as number, 0xffc070, (1 - d / 14) * 0.35)
      }
      rect(px, W, H, 0, desk, W, H - desk, 0x6a4026)
      rect(px, W, H, 0, desk, W, 1, 0x8a5a36)
      line(px, W, H, W * 0.82, desk, W * 0.82, desk - 9, 0x3a3a40)
      line(px, W, H, W * 0.82, desk - 9, W * 0.74, desk - 12, 0x3a3a40)
      rect(px, W, H, W * 0.7, desk - 13, 4, 2, 0xe8b050)
      rect(px, W, H, W * 0.38, desk - 1, 8, 1, 0xf4f0e0)
      const hand = Math.sin(t * 0.3) * 1.5
      const sx = Math.round(W * 0.18)
      litSprite(px, W, H, sx, desk - 13, ['..hhh..', '.hhhhh.', 'phhhssp', 'p.hsss.', '..sss..', '.ccccc.', 'ccccccc', 'ccccccc', 'ccccccc', 'ccccccc', 'ccccccc', 'ccccccc', 'ccccccc'], {
        h: 0x3a2a24,
        s: 0xffd0b0,
        p: 0xd04a6a,
        c: 0xe8a0b0,
      })
      line(px, W, H, sx + 6, desk - 6, W * 0.4 + hand, desk - 2, 0xe8a0b0)
      dot(px, W, H, W * 0.4 + hand, desk - 2, 0xffd0b0)
      rect(px, W, H, W * 0.6, desk - 4, 3, 4, 0xf0f0f0)
      for (let k = 0; k < 3; k++) {
        const s = ((t * 0.2 + k * 7) % 21) / 21
        dot(px, W, H, W * 0.6 + 1 + Math.sin(t * 0.05 + k) * 1, desk - 5 - s * 8, mix(0xe8e8f0, 0x3a2e48, s))
      }
      litSprite(px, W, H, W - 8, desk - 4, ['o...o.', 'ooooo.', 'ooooot', '.oooot'], { o: 0x5a5a62, t: 0x5a5a62 })
      dot(px, W, H, W - 2 + Math.sin(t * 0.08), desk - 5, 0x5a5a62)
    },
  }
}

// --- aquarium ---------------------------------------------------------------------

const aquarium: Maker = (W, H, rng) => {
  const top = 4
  const gravel = H - 6
  type F = { x: number; y: number; vx: number; c: number; s: number }
  const fish: F[] = Array.from({ length: 7 }, () => ({ x: rng() * W, y: top + 6 + rng() * (gravel - top - 12), vx: (rng() < 0.5 ? -1 : 1) * (0.15 + rng() * 0.25), c: pick(rng, [0xff8a2a, 0xff4a6a, 0x4ad0ff, 0xffe040, 0xa06aff, 0x6aff9a]), s: rng() < 0.3 ? 2 : 1 }))
  let bubbles: { x: number; y: number }[] = []
  let t = 0

  return {
    step() {
      t++
      for (const f of fish) {
        f.x += f.vx
        f.y += Math.sin(t * 0.03 + f.x) * 0.05
        if (f.x < 2 || f.x > W - 3) f.vx = -f.vx
        if (rng() < 0.003) f.vx = -f.vx
      }
      if (t % 5 === 0) bubbles.push({ x: W * 0.85 + rng(), y: gravel - 2 })
      for (const b of bubbles) {
        b.y -= 0.5
        b.x += Math.sin(b.y * 0.5) * 0.2
      }
      bubbles = bubbles.filter(b => b.y > top)
    },
    draw(px) {
      // water, light rays from the surface, the lid and its lamp
      sky(px, W, H, 0x3aa4dc, 0x0a2e5a)
      for (let y = top; y < gravel; y++) {
        const fade = 0.2 * (1 - (y - top) / (gravel - top))
        for (let x = 0; x < W; x++) if ((((x + y * 0.45 + t * 0.03) % 9) + 9) % 9 < 2) px[y * W + x] = mix(px[y * W + x] as number, 0xb8ecff, fade)
      }
      rect(px, W, H, 0, 0, W, top, 0x1a1a22)
      rect(px, W, H, 0, top - 1, W, 1, 0x3a3a4a)
      rect(px, W, H, W * 0.25, top - 1, W * 0.5, 1, 0xfff0c0)
      for (let x = 0; x < W; x++) dot(px, W, H, x, top, Math.sin(x * 0.7 + t * 0.1) > 0.6 ? 0xe0f8ff : 0x7acdf0)
      // gravel: pebbles two pixels wide, a lit top row, darker deeper down
      for (let y = gravel; y < H; y++)
        for (let x = 0; x < W; x++) {
          const h = hash(Math.floor((x + (y % 2)) / 2), y, 4)
          const deep = (y - gravel) / (H - gravel)
          const c = y === gravel ? 0xf0dcb0 : h > 0.66 ? 0xe0c48e : h > 0.33 ? 0xc0a070 : 0x8a7050
          px[y * W + x] = mix(c, 0x3a2e28, deep * 0.45)
        }
      rect(px, W, H, 0, gravel - 1, W, 1, 0x0e3a5e)
      // a rock, lit from the upper left
      const rx = W * 0.2
      ellipse(px, W, H, rx, gravel - 1, 4, 2.6, 0x4a4a5c)
      ellipse(px, W, H, rx - 0.6, gravel - 1.6, 3, 1.8, 0x707084)
      ellipse(px, W, H, rx - 1.6, gravel - 2.4, 1.2, 0.7, 0x9a9ab0)
      // plants: a swaying stem with leaves, lit side and shaded side
      for (const [i, f] of [0.1, 0.32, 0.72].entries()) {
        const x0 = W * f
        const h = H * (0.22 + i * 0.04)
        for (let y = gravel; y > gravel - h; y--) {
          const x = x0 + Math.sin(y * 0.4 + t * 0.04 + i) * 1.2
          dot(px, W, H, x, y, 0x2a8a3a)
          if ((y + i) % 3 === 0) {
            const side = (y + i) % 6 === 0 ? -1 : 1
            dot(px, W, H, x + side, y, side < 0 ? 0x6ad86a : 0x1a6a2a)
            dot(px, W, H, x + side * 2, y - 1, side < 0 ? 0x8ae87a : 0x2a7a32)
          }
        }
        dot(px, W, H, x0 + Math.sin((gravel - h) * 0.4 + t * 0.04 + i) * 1.2, gravel - h, 0x9af08a)
      }
      // a little castle: lit face, mid, shaded face, a dark door
      const kx = Math.round(W * 0.52)
      const ky = gravel - 7
      for (let x = 0; x < 6; x++) {
        const c = x < 2 ? 0xb4b4c4 : x < 4 ? 0x8a8a9c : 0x5a5a6c
        rect(px, W, H, kx + x, ky + 1, 1, 6, c)
        if (x % 2 === 0) dot(px, W, H, kx + x, ky, c)
      }
      rect(px, W, H, kx + 2, ky + 4, 2, 3, 0x14243a)
      dot(px, W, H, kx + 1, ky + 2, 0x14243a)
      dot(px, W, H, kx + 4, ky + 2, 0x14243a)
      dot(px, W, H, kx + 2, ky - 1, 0x5a5a6c)
      dot(px, W, H, kx + 3, ky - 1, 0xff4a4a)
      // bubbles: some bigger, with a highlight
      for (const [i, b] of bubbles.entries()) {
        if (i % 3 === 0) {
          dot(px, W, H, b.x, b.y, 0x7ac8f0)
          dot(px, W, H, b.x + 1, b.y, 0x7ac8f0)
          dot(px, W, H, b.x, b.y - 1, 0xffffff)
        } else dot(px, W, H, b.x, b.y, 0xc8ecff)
      }
      // fish: back darker, belly lighter, a darker tail, an eye; clownfish get a stripe
      for (const f of fish) {
        const d = f.vx > 0 ? 1 : -1
        if (f.s === 2) {
          ellipse(px, W, H, f.x, f.y, 2.2, 1.4, f.c)
          rect(px, W, H, f.x - 1, f.y - 1, 3, 1, scale(f.c, 0.75))
          rect(px, W, H, f.x - 1, f.y + 1, 3, 1, mix(f.c, 0xffffff, 0.4))
          dot(px, W, H, f.x, f.y - 2, scale(f.c, 0.6))
          for (const v of [-1, 0, 1]) dot(px, W, H, f.x - d * 3, f.y + v, scale(f.c, v ? 0.6 : 0.8))
          if (f.c === 0xff8a2a) for (const v of [-1, 0, 1]) dot(px, W, H, f.x - d * 0.5, f.y + v, 0xfff4ec)
          dot(px, W, H, f.x + d * 1.5, f.y - 0.5, 0x101018)
        } else {
          dot(px, W, H, f.x + d, f.y, mix(f.c, 0xffffff, 0.3))
          dot(px, W, H, f.x, f.y, f.c)
          dot(px, W, H, f.x, f.y - 1, mix(f.c, 0xffffff, 0.2))
          dot(px, W, H, f.x - d, f.y, scale(f.c, 0.75))
          dot(px, W, H, f.x - d * 2, f.y - 1, scale(f.c, 0.6))
          dot(px, W, H, f.x - d * 2, f.y + 1, scale(f.c, 0.6))
          dot(px, W, H, f.x + d, f.y - 1, 0x101018)
        }
      }
    },
  }
}

// --- windowsill plant -------------------------------------------------------------

const plant: Maker = (W, H, rng) => {
  const sill = Math.round(H * 0.76)
  const cx = W / 2
  let t = 0
  let leaves: { y: number; side: number; born: number }[] = []
  let water = 0

  function reset() {
    leaves = []
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (t % 45 === 0 && leaves.length < 9) leaves.push({ y: leaves.length, side: leaves.length % 2 ? 1 : -1, born: t })
      if (t % 200 === 120) water = 40
      if (water > 0) water--
      if (t > 520) reset()
      void rng
    },
    draw(px) {
      const day = (Math.sin(t * 0.012) + 1) / 2
      sky(px, W, H, mix(0x1a2048, 0x8ad0ff, day), mix(0x3a2a5a, 0xe8f4ff, day), sill)
      disc(px, W, H, 4 + t * 0.05, sill - 8 - day * 20, 2.5, day > 0.3 ? 0xfff0a0 : 0xe8e8f8)
      for (let x = 0; x < W; x++) rect(px, W, H, x, sill - 6 - Math.sin(x * 0.3) * 2, 1, 8, mix(0x1a2a3a, 0x6aa86a, day))
      rect(px, W, H, 0, 0, 2, sill, 0xf0ece4)
      rect(px, W, H, W - 2, 0, 2, sill, 0xf0ece4)
      rect(px, W, H, 0, 0, W, 2, 0xf0ece4)
      rect(px, W, H, W / 2 - 0.5, 0, 1, sill, 0xf0ece4)
      rect(px, W, H, 0, sill, W, H - sill, 0xe8e0d0)
      rect(px, W, H, 0, sill, W, 1, 0xffffff)
      slab(px, W, H, cx - 4, sill - 6, 9, 6, 0xc8603a)
      slab(px, W, H, cx - 5, sill - 7, 11, 2, 0xd8704a)
      const h = Math.min(leaves.length * 3 + span(t % 45, 0, 45) * 3, 30)
      line(px, W, H, cx, sill - 7, cx + Math.sin(t * 0.02) * 0.6, sill - 7 - h, 0x3a8a2a)
      for (const l of leaves) {
        const g = span(t, l.born, l.born + 30)
        const ly = sill - 9 - l.y * 3
        const len = 1 + g * 3.5
        line(px, W, H, cx, ly, cx + l.side * len, ly - len * 0.5, 0x4ab03a)
        line(px, W, H, cx, ly + 1, cx + l.side * len * 0.8, ly - len * 0.3 + 1, 0x3a9a2a)
      }
      if (water > 0) {
        const wx = cx + 8
        rect(px, W, H, wx, sill - 18, 6, 4, 0x6a9ad0)
        line(px, W, H, wx, sill - 17, wx - 4, sill - 19, 0x6a9ad0)
        for (let k = 0; k < 3; k++) dot(px, W, H, wx - 4, sill - 18 + ((water + k * 3) % 9), 0x8ac8ff)
      }
    },
  }
}

// --- café window ------------------------------------------------------------------

const cafe: Maker = (W, H, rng) => {
  const street = Math.round(H * 0.5)
  const table = Math.round(H * 0.74)
  type P = { x: number; v: number; c: number; umb: boolean; h: number }
  let ps: P[] = []
  let t = 0
  let rain = false

  return {
    step() {
      t++
      if (t % 400 === 0) rain = !rain
      if (rng() < 0.02) {
        const v = (rng() < 0.5 ? 1 : -1) * (0.15 + rng() * 0.2)
        ps.push({ x: v > 0 ? -4 : W + 4, v, c: hsv(rng(), 0.5, 0.7), umb: rain && rng() < 0.8, h: 7 + irand(rng, 3) })
      }
      for (const p of ps) p.x += p.v
      ps = ps.filter(p => p.x > -6 && p.x < W + 6)
    },
    draw(px) {
      sky(px, W, H, rain ? 0x6a7a8a : 0x9ad0f0, rain ? 0xa0a8b0 : 0xe0f0f8, street)
      for (let x = 0; x < W; x += 9) rect(px, W, H, x, street - 18, 8, 18, rain ? 0x7a6a6a : 0xc88a6a)
      rect(px, W, H, 0, street, W, 4, 0x8a8a92)
      for (const p of ps) {
        const y = street - 1
        rect(px, W, H, p.x, y - p.h + 3, 2, p.h - 3, p.c)
        dot(px, W, H, p.x, y - p.h + 2, 0xffd0a0)
        if (Math.floor(t * 0.2 + p.x) % 2) dot(px, W, H, p.x + 1, y, 0x2a2a2a)
        else dot(px, W, H, p.x, y, 0x2a2a2a)
        if (p.umb) {
          rect(px, W, H, p.x - 2, y - p.h, 6, 1, scale(p.c, 0.8))
          line(px, W, H, p.x + 1, y - p.h, p.x + 1, y - p.h + 3, 0x3a3a3a)
        }
      }
      if (rain) for (let k = 0; k < 20; k++) dot(px, W, H, (k * 7 + t) % W, (k * 13 + t * 2) % street, 0xc8d8e8)
      for (let y = street + 4; y < table; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x5a3a28, 0x3a2418, (y - street) / (table - street))
      rect(px, W, H, 0, street + 4, W, 1, 0x8a6a4a)
      if (rain) for (let k = 0; k < 6; k++) line(px, W, H, (k * 6 + 2) % W, (k * 5 + (t >> 2)) % street, (k * 6 + 2) % W, ((k * 5 + (t >> 2)) % street) + 3, 0xd0e0f0)
      rect(px, W, H, 0, table, W, H - table, 0xa86a3a)
      rect(px, W, H, 0, table, W, 1, 0xc88a52)
      const cx = W * 0.6
      slab(px, W, H, cx - 3, table - 5, 6, 5, 0xf8f4ec)
      rect(px, W, H, cx + 3, table - 4, 2, 2, 0xf8f4ec)
      ellipse(px, W, H, cx, table, 5, 1, 0xf0ece4)
      rect(px, W, H, cx - 2, table - 5, 4, 1, 0x8a5a2a)
      for (let k = 0; k < 3; k++) {
        const s = ((t * 0.25 + k * 8) % 24) / 24
        dot(px, W, H, cx - 1 + k + Math.sin(t * 0.05 + k * 2) * 1.2, table - 6 - s * 10, mix(0xf0f0f0, 0x3a2418, s))
      }
      litSprite(px, W, H, W * 0.15, table - 3, ['.oo.', 'oooo', 'oooo'], { o: 0xd8a860 })
    },
  }
}

// --- train window -----------------------------------------------------------------

const trainwindow: Maker = (W, H, rng) => {
  const fx0 = 2
  const fy0 = Math.round(H * 0.12)
  const fx1 = W - 3
  const fy1 = Math.round(H * 0.62)
  let t = 0
  let scroll = 0
  const hue = rng()

  return {
    step() {
      t++
      scroll += 1
    },
    draw(px) {
      const time = (Math.sin(t * 0.004) + 1) / 2
      sky(px, W, H, mix(0xff9a6a, 0x6ab0f0, time), mix(0xffd8a0, 0xd8f0ff, time), fy1)
      disc(px, W, H, W * 0.7, fy0 + 8 + (1 - time) * 10, 3, mix(0xff6a3a, 0xfff4c0, time))
      for (let x = 0; x < W; x++) {
        const m = fy1 - 14 - Math.abs(Math.sin((x + scroll * 0.1) * 0.08 + hue)) * 10
        rect(px, W, H, x, m, 1, fy1 - m, mix(0x8a7aa8, 0x7a9ac0, time))
        const hll = fy1 - 6 - Math.sin((x + scroll * 0.4) * 0.15) * 3
        rect(px, W, H, x, hll, 1, fy1 - hll, mix(0x4a6a3a, 0x5a9a4a, time))
      }
      for (let k = 0; k < 3; k++) {
        const x = ((k * 23 - scroll * 0.4) % (W + 20) + W + 20) % (W + 20) - 10
        litSprite(px, W, H, x, fy1 - 9, ['.rr.', 'rrrr', 'wwww', 'wdww'], { r: 0xc84a3a, w: 0xf0e8d8, d: 0x6a4a2a })
      }
      for (let k = 0; k < 4; k++) {
        const x = ((k * 17 - scroll * 1.6) % (W + 30) + W + 30) % (W + 30) - 10
        lit(px, W, H, x, fy1 - 6, 3, 3, 0x2a5a2a)
        rect(px, W, H, x, fy1 - 3, 1, 4, 0x3a2a1a)
      }
      const pole = ((-scroll * 3) % 60 + 60) % 60 - 10
      rect(px, W, H, pole, fy0, 1, fy1 - fy0, 0x3a3a3a)
      line(px, W, H, 0, fy0 + 3, W, fy0 + 4, 0x2a2a2a)
      rect(px, W, H, 0, 0, W, fy0, 0x8a2a2a)
      rect(px, W, H, 0, fy1, W, H - fy1, 0x8a2a2a)
      rect(px, W, H, 0, fy0, fx0, fy1 - fy0, 0x8a2a2a)
      rect(px, W, H, fx1, fy0, W - fx1, fy1 - fy0, 0x8a2a2a)
      rect(px, W, H, fx0 - 1, fy0 - 1, fx1 - fx0 + 2, 1, 0xc8a050)
      rect(px, W, H, fx0 - 1, fy1, fx1 - fx0 + 2, 1, 0xc8a050)
      rect(px, W, H, 0, fy1 + 4, W, 3, 0x5a6a9a)
      rect(px, W, H, 0, fy1 + 7, W, H - fy1 - 7, 0x3a4a7a)
      for (let x = 2; x < W; x += 4) dot(px, W, H, x, fy1 + 9, 0x4a5a8a)
      rect(px, W, H, W * 0.6, fy1 + 1, 4, 3, 0xf4f0e0)
      dot(px, W, H, W * 0.6 + 1, fy1 + 1, 0x8a5a2a)
    },
  }
}

// --- bookshelf tidying ------------------------------------------------------------

const bookshelf: Maker = (W, H, rng) => {
  const shelves = 3
  const gap = Math.floor((H - 8) / shelves)
  const per = Math.max(3, Math.floor((W - 4) / 3))
  type B = { hue: number; h: number; w: number }
  let rows: B[][] = []
  let row = 0
  let i = 0
  let j = 0
  let swap: { a: number; b: number; t: number } | undefined
  let hold = 0

  function reset() {
    rows = Array.from({ length: shelves }, () => shuffle(rng, Array.from({ length: per }, (_, k) => ({ hue: k / per, h: gap - 3 - irand(rng, 4), w: 2 + (rng() < 0.3 ? 1 : 0) }))))
    row = 0
    i = 1
    j = 1
  }
  reset()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (swap) {
        if (++swap.t >= 6) {
          const r = rows[row] as B[]
          ;[r[swap.a], r[swap.b]] = [r[swap.b] as B, r[swap.a] as B]
          swap = undefined
        }
        return
      }
      // one insertion-sort step at a time, by colour
      const r = rows[row] as B[]
      if (i >= r.length) {
        row++
        i = 1
        j = 1
        if (row >= shelves) hold = 90
        return
      }
      if (j > 0 && (r[j - 1] as B).hue > (r[j] as B).hue) {
        swap = { a: j - 1, b: j, t: 0 }
        j--
      } else {
        i++
        j = i
      }
    },
    draw(px) {
      px.fill(0x5a3a26)
      for (let y = 0; y < H; y += 4) rect(px, W, H, 0, y, W, 1, 0x52341f)
      rows.forEach((r, s) => {
        const base = 4 + (s + 1) * gap
        slab(px, W, H, 0, base, W, 2, 0x8a5a36)
        let x = 2
        r.forEach((b, k) => {
          let dx = 0
          if (swap && s === row) {
            const f = swap.t / 6
            if (k === swap.a) dx = 3 * f
            if (k === swap.b) dx = -3 * f
          }
          const c = hsv(b.hue * 0.85, 0.6, 0.85)
          rect(px, W, H, x + dx, base - b.h, b.w, b.h, c)
          rect(px, W, H, x + dx, base - b.h + 2, b.w, 1, mix(c, 0xffffff, 0.5))
          dot(px, W, H, x + dx, base - b.h, mix(c, 0xffffff, 0.3))
          x += 3
        })
      })
    },
  }
}

// --- night city windows -----------------------------------------------------------

const citywindows: Maker = (W, H, rng) => {
  type B = { x: number; w: number; h: number; lit: Uint8Array; cols: number; rows: number }
  const bs: B[] = []
  let x = 0
  while (x < W) {
    const w = 7 + irand(rng, 6)
    const h = Math.round(H * (0.4 + rng() * 0.45))
    const cols = Math.floor((w - 1) / 2)
    const rows = Math.floor((h - 3) / 3)
    const lit = new Uint8Array(cols * rows).map(() => (rng() < 0.4 ? 1 + irand(rng, 3) : 0))
    bs.push({ x, w, h, lit, cols, rows })
    x += w + 1
  }
  let t = 0
  let cars: { x: number; v: number }[] = []

  return {
    step() {
      t++
      for (const b of bs) if (rng() < 0.15) {
        const k = irand(rng, b.lit.length)
        b.lit[k] = b.lit[k] ? 0 : 1 + irand(rng, 3)
      }
      if (rng() < 0.03) cars.push({ x: rng() < 0.5 ? -3 : W + 3, v: rng() < 0.5 ? 0.6 : -0.6 })
      for (const c of cars) c.x += c.v
      cars = cars.filter(c => c.x > -5 && c.x < W + 5)
      if (cars[0] && cars[0].v === 0) cars = []
    },
    draw(px) {
      sky(px, W, H, 0x050820, 0x2a1a4a)
      disc(px, W, H, W * 0.2, 8, 3, 0xf0f0e0)
      disc(px, W, H, W * 0.2 + 1.5, 7, 2.5, 0x0a0e28)
      for (let k = 0; k < 12; k++) dot(px, W, H, (k * 37) % W, (k * 11) % 20, 0xa0a0c0)
      const ground = H - 3
      for (const b of bs) {
        rect(px, W, H, b.x, ground - b.h, b.w, b.h, 0x14142a)
        for (let r = 0; r < b.rows; r++)
          for (let c = 0; c < b.cols; c++) {
            const v = b.lit[r * b.cols + c]!
            const col = v === 1 ? 0xffd870 : v === 2 ? 0xffb050 : v === 3 ? 0xa0c8ff : 0x22223a
            dot(px, W, H, b.x + 1 + c * 2, ground - b.h + 2 + r * 3, col)
            dot(px, W, H, b.x + 1 + c * 2, ground - b.h + 3 + r * 3, v ? scale(col, 0.8) : 0x1a1a30)
          }
      }
      rect(px, W, H, 0, ground, W, 3, 0x1a1a24)
      for (const c of cars) {
        dot(px, W, H, c.x, ground + 1, c.v > 0 ? 0xffffe0 : 0xff3a3a)
        dot(px, W, H, c.x - Math.sign(c.v), ground + 1, c.v > 0 ? 0xff3a3a : 0xffffe0)
      }
    },
  }
}

// --- knitting ---------------------------------------------------------------------

const knitting: Maker = (W, H, rng) => {
  const sw = Math.round(W * 0.5)
  const sx = Math.round((W - sw) / 2)
  let rowsDone = 0
  let t = 0
  let stripes: number[] = []

  function reset() {
    rowsDone = 0
    const a = rng()
    stripes = [hsv(a, 0.55, 0.9), hsv(a + 0.5, 0.45, 0.95), 0xf4f0e8]
  }
  reset()

  return {
    step() {
      t++
      if (t % 8 === 0) rowsDone++
      if (6 + rowsDone * 2 > H + 10) reset()
    },
    draw(px) {
      sky(px, W, H, 0xf0e4d4, 0xd8c4a8)
      const shown = Math.min(rowsDone, Math.floor((H - 8) / 2))
      const offset = Math.max(0, rowsDone - shown)
      for (let r = 0; r < shown; r++) {
        const y = 6 + (shown - 1 - r) * 2
        const c = stripes[Math.floor((r + offset) / 6) % stripes.length] as number
        for (let x = 0; x < sw; x += 2) {
          dot(px, W, H, sx + x, y, c)
          dot(px, W, H, sx + x + 1, y, c)
          dot(px, W, H, sx + x, y + 1, scale(c, 0.85))
          dot(px, W, H, sx + x + 1, y + 1, scale(c, 0.85))
        }
      }
      const prog = (t % 8) / 8
      line(px, W, H, sx - 4, 5, sx + sw + 3, 4, 0xb8885a)
      line(px, W, H, sx - 3 + prog * sw, 2, sx + 3 + prog * sw, 8, 0xc8985a)
      const ball = 6 - Math.min(4, rowsDone * 0.03)
      lit(px, W, H, W - 6, H - 8, ball, ball, stripes[0] as number)
      line(px, W, H, W - 6 - ball * 0.5, H - 8, W - 6 + ball * 0.5, H - 8 - ball * 0.3, scale(stripes[0] as number, 0.8))
      line(px, W, H, W - 6, H - 8 - ball, sx + sw, 6, stripes[0] as number)
    },
  }
}

// --- hot air balloons -------------------------------------------------------------

const balloons: Maker = (W, H, rng) => {
  type B = { x: number; y: number; s: number; c1: number; c2: number; v: number; ph: number }
  const bs: B[] = Array.from({ length: 5 }, () => ({ x: rng() * W, y: H * 0.2 + rng() * H * 0.6, s: 0.6 + rng() * 0.8, c1: hsv(rng(), 0.7, 0.95), c2: hsv(rng(), 0.6, 1), v: 0.05 + rng() * 0.1, ph: rng() * 6 }))
  bs.sort((a, b) => a.s - b.s)
  let t = 0

  return {
    step() {
      t++
      for (const b of bs) {
        b.y -= b.v * b.s
        b.x += 0.05 * b.s
        if (b.y < -10) {
          b.y = H + 4
          b.x = rng() * W
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x8aa8e0, 0xffd0a8)
      disc(px, W, H, W * 0.3, H * 0.8, 6, 0xfff0c0)
      for (let x = 0; x < W; x++) {
        const h1 = H * 0.78 + Math.sin(x * 0.15) * 3
        rect(px, W, H, x, h1, 1, H - h1, 0x9aa080)
        const h2 = H * 0.88 + Math.sin(x * 0.25 + 2) * 2
        rect(px, W, H, x, h2, 1, H - h2, 0x6a8a5a)
      }
      for (const b of bs) {
        const r = 3.5 * b.s + 1
        for (let y = -r; y <= r * 1.2; y++) {
          const k = y / r
          const hw = y < 0 ? r * Math.sqrt(1 - k * k) : r * (1 - (y / (r * 1.2)) * 0.6)
          for (let x = -hw; x <= hw; x++) {
            const stripe = Math.floor(((x / hw) + 1) * 2.5) % 2
            dot(px, W, H, b.x + x, b.y + y, stripe ? b.c1 : b.c2)
          }
        }
        const by = b.y + r * 1.2
        line(px, W, H, b.x - r * 0.4, by, b.x - r * 0.25, by + 2 * b.s, 0x5a4a3a)
        line(px, W, H, b.x + r * 0.4, by, b.x + r * 0.25, by + 2 * b.s, 0x5a4a3a)
        rect(px, W, H, b.x - r * 0.3, by + 2 * b.s, r * 0.6 + 1, 1.5 * b.s, 0x8a5a2a)
        if (Math.sin(t * 0.1 + b.ph) > 0.7) dot(px, W, H, b.x, by + 0.5, 0xffa020)
      }
    },
  }
}

// --- lantern festival -------------------------------------------------------------

const lanterns: Maker = (W, H, rng) => {
  const water = Math.round(H * 0.72)
  type L = { x: number; y: number; v: number; ph: number }
  let ls: L[] = Array.from({ length: 16 }, () => ({ x: rng() * W, y: rng() * water, v: 0.1 + rng() * 0.15, ph: rng() * 6 }))
  let t = 0

  return {
    step() {
      t++
      for (const l of ls) {
        l.y -= l.v
        l.x += Math.sin(t * 0.02 + l.ph) * 0.05
        if (l.y < -4) {
          l.y = water - 2
          l.x = rng() * W
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x0a0a2a, 0x2a1a4a, water)
      for (let k = 0; k < 14; k++) dot(px, W, H, (k * 29) % W, (k * 13) % (water / 2), 0x8a8ab0)
      for (let x = 0; x < W; x++) rect(px, W, H, x, water - 3 - Math.abs(Math.sin(x * 0.2)) * 3, 1, 4, 0x0a0a18)
      for (let y = water; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x14143a, 0x0a0a20, (y - water) / (H - water))
      for (const l of ls) {
        const s = 1 + (1 - l.y / water) * 0
        const flick = Math.sin(t * 0.3 + l.ph) > 0 ? 0xffc060 : 0xffa040
        rect(px, W, H, l.x - 1, l.y - 1, 2 * s + 1, 3, flick)
        dot(px, W, H, l.x, l.y + 1, 0xfff0a0)
        const ry = water + (water - l.y) * 0.25
        if (ry < H) dot(px, W, H, l.x + Math.sin(t * 0.1 + l.y) * 0.5, ry, mix(flick, 0x14143a, 0.5))
      }
    },
  }
}

// --- fishing dock -----------------------------------------------------------------

const fishing: Maker = (W, H, rng) => {
  const water = Math.round(H * 0.6)
  const dock = water - 2
  let t = 0
  let phase = 0
  let caught = 0
  let fishC = 0xc0c8d0
  let fx = 0
  let fy = 0

  return {
    step() {
      t++
      if (phase === 0 && t > 150 + irand(rng, 2) && rng() < 0.01) {
        phase = 1
        t = 0
      } else if (phase === 1 && t > 30) {
        phase = 2
        t = 0
        fishC = pick(rng, [0xc0c8d0, 0xf0a040, 0x6ab0e0, 0xe06a6a])
      } else if (phase === 2 && t > 50) {
        phase = 0
        t = 0
        caught++
      }
    },
    draw(px) {
      sky(px, W, H, 0xff8a5a, 0xffd0a0, water)
      disc(px, W, H, W * 0.75, water - 2, 5, 0xffe080)
      for (let y = water; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 2 + (t >> 3)) % 9 === 0 ? 0xffb080 : mix(0x3a5a8a, 0x1a2a4a, (y - water) / (H - water))
      for (let y = water; y < H; y++) if ((y - water) % 3 === 0) dot(px, W, H, W * 0.75 + ((y * 3 + t) % 5) - 2, y, 0xffe080)
      slab(px, W, H, 0, dock, W * 0.4, 2, 0x8a5a36)
      for (let x = 2; x < W * 0.4; x += 5) rect(px, W, H, x, dock + 2, 1, H - dock, 0x5a3a24)
      litSprite(px, W, H, W * 0.22, dock - 7, ['.hh', 'hss', '.cc', 'ccc', 'cbb', 'b.b'], { h: 0x6a5a2a, s: 0xffd0a0, c: 0x3a6a8a, b: 0x2a2a3a })
      const tipX = W * 0.62
      const tipY = dock - 16 - (phase === 2 ? 4 : 0)
      line(px, W, H, W * 0.22 + 2, dock - 4, tipX, tipY, 0x6a4a2a)
      const floatX = W * 0.78
      const bob = phase === 1 ? (t % 6 < 3 ? 2 : 0) : Math.sin(t * 0.1) * 0.5
      if (phase < 2) {
        line(px, W, H, tipX, tipY, floatX, water - 1 + bob, 0xe0e0e0)
        dot(px, W, H, floatX, water - 1 + bob, 0xff3a3a)
        dot(px, W, H, floatX, water + bob, 0xffffff)
      } else {
        const u = span(t, 0, 30)
        fx = floatX + (tipX - floatX) * u
        fy = water - Math.sin(u * Math.PI) * 10 + (tipY + 4 - water) * u
        line(px, W, H, tipX, tipY, fx, fy - 1, 0xe0e0e0)
        litSprite(px, W, H, fx - 1, fy, ['.x.', 'xxx', 'xxx', '.x.', 'x.x'], { x: fishC })
      }
      for (let i = 0; i < Math.min(caught, 6); i++) dot(px, W, H, 2 + i, dock - 1, 0xc0c8d0)
      slab(px, W, H, 1, dock - 3, 8, 3, 0x4a6a8a)
      text(px, W, H, 1, 1, String(caught), 0xffffff)
    },
  }
}

// --- farm crops -------------------------------------------------------------------

const farm: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.max(3, Math.floor((W - 4) / cs))
  const rows = Math.max(3, Math.floor((H - 16) / cs))
  const ox = Math.floor((W - cols * cs) / 2)
  const oy = 10
  let stage = new Uint8Array(cols * rows)
  let kind = new Uint8Array(cols * rows)
  let fx = 0
  let fy = 0
  let t = 0
  let todo = 0
  // 0 grass, 1 tilled, 2 seed, 3 sprout, 4 grown

  const CROPS = [
    { c: 0xe8c040, top: 0xf8e080 },
    { c: 0xf08a2a, top: 0x4ab03a },
    { c: 0xe8702a, top: 0xf0a040 },
  ]

  return {
    step() {
      t++
      if (t % 12 === 0) for (let k = 0; k < stage.length; k++) if ((stage[k] === 2 || stage[k] === 3) && rng() < 0.3) stage[k]!++
      if (t % 2) return
      const k = todo % stage.length
      const tx = k % cols
      const ty = Math.floor(k / cols)
      fx += clamp(tx - fx, -1, 1)
      fy += clamp(ty - fy, -1, 1)
      if (fx === tx && fy === ty) {
        const s = stage[k]!
        if (s === 0) stage[k] = 1
        else if (s === 1) {
          stage[k] = 2
          kind[k] = Math.floor(ty / 2) % 3
        } else if (s === 4) stage[k] = 0
        else if (s === 2 || s === 3) {
          todo++
          return
        }
        todo++
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ad0ff, 0xd8f0ff, 8)
      rect(px, W, H, 0, 8, W, H - 8, 0x6ac04a)
      for (let y = 8; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 3) > 0.9) dot(px, W, H, x, y, 0x5aa83a)
      litSprite(px, W, H, W - 9, 0, ['..rrr..', '.rrrrr.', 'rrrrrrr', '.wwdww.', '.wwdww.'], { r: 0xc84a3a, w: 0xf0e0c0, d: 0x6a4a2a })
      for (let k = 0; k < cols * rows; k++) {
        const x = ox + (k % cols) * cs
        const y = oy + Math.floor(k / cols) * cs
        const s = stage[k]!
        if (s === 0) continue
        slab(px, W, H, x, y, cs - 1, cs - 1, 0x8a5a36)
        dot(px, W, H, x, y + 1, 0x6a4026)
        const cr = CROPS[kind[k]!] as { c: number; top: number }
        if (s === 2) dot(px, W, H, x + 1, y + 1, 0xd8c890)
        if (s === 3) {
          dot(px, W, H, x + 1, y + 1, 0x5ad03a)
          dot(px, W, H, x + 1, y, 0x5ad03a)
        }
        if (s === 4) {
          rect(px, W, H, x, y + 1, 3, 2, cr.c)
          dot(px, W, H, x + 1, y, cr.top)
        }
      }
      const x = ox + fx * cs
      const y = oy + fy * cs - 3
      litSprite(px, W, H, x, y, ['.h.', 'hhh', '.s.', 'bbb', 'b.b'], { h: 0xe8c860, s: 0xffd0a0, b: 0x3a6aaa })
    },
  }
}

// --- campfire marshmallows --------------------------------------------------------

const marshmallow: Maker = (W, H, rng) => {
  const fire = Math.round(H * 0.82)
  let t = 0
  let flames = Array.from({ length: 24 }, () => ({ x: 0, y: 0, l: 0 }))

  return {
    step() {
      t++
      for (const f of flames) {
        if (f.l <= 0) {
          f.x = W / 2 + (rng() - 0.5) * 10
          f.y = fire
          f.l = 8 + irand(rng, 10)
        }
        f.y -= 0.6
        f.x += (rng() - 0.5) * 0.4
        f.l--
      }
      if (t > 300) t = 0
    },
    draw(px) {
      sky(px, W, H, 0x05050f, 0x1a0e14)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const d = Math.hypot(x - W / 2, y - fire)
        if (d < 22) px[y * W + x] = mix(px[y * W + x] as number, 0xff8a2a, (1 - d / 22) * 0.35)
      }
      for (const f of flames) {
        const u = f.l / 18
        dot(px, W, H, f.x, f.y, u > 0.6 ? 0xffe080 : u > 0.3 ? 0xff9a2a : 0xd03a1a)
      }
      slab(px, W, H, W / 2 - 7, fire, 14, 2, 0x5a3a20)
      line(px, W, H, W / 2 - 6, fire + 2, W / 2 + 6, fire - 1, 0x6a4428)
      // the marshmallow: golden, then on fire, blown out, black
      const toast = span(t, 0, 140)
      const burn = t > 150 && t < 200
      const charred = t >= 200
      const mx = W / 2 + 3
      const my = fire - 14
      line(px, W, H, W - 1, my - 10, mx + 2, my, 0xb8885a)
      const c = charred ? 0x2a2420 : mix(0xfaf8f0, 0xd89040, toast)
      rect(px, W, H, mx - 2, my - 2, 4, 4, c)
      dot(px, W, H, mx - 2, my - 2, charred ? 0x3a3430 : mix(0xffffff, 0xe8a850, toast))
      if (burn) for (let k = 0; k < 6; k++) dot(px, W, H, mx - 2 + ((k * 3 + t) % 5), my - 3 - ((t + k * 2) % 4), k % 2 ? 0xffd040 : 0xff6a1a)
      if (t > 198 && t < 230) for (let k = 0; k < 3; k++) dot(px, W, H, mx - 1 + k, my - 4 - (t - 198) * 0.3 - k, 0x8a8a8a)
    },
  }
}

// --- jellyfish --------------------------------------------------------------------

const jellyfish: Maker = (W, H, rng) => {
  type J = { x: number; y: number; ph: number; c: number; s: number }
  const js: J[] = Array.from({ length: 4 }, () => ({ x: rng() * W, y: rng() * H, ph: rng() * 6, c: pick(rng, [0xff8ad0, 0x8ad0ff, 0xc08aff, 0xffd08a]), s: 0.7 + rng() * 0.6 }))
  let t = 0
  const motes = Array.from({ length: 20 }, () => ({ x: rng() * W, y: rng() * H }))

  return {
    step() {
      t++
      for (const j of js) {
        const pulse = Math.max(0, Math.sin(t * 0.08 + j.ph))
        j.y -= pulse * 0.25 * j.s
        j.y += 0.04
        j.x += Math.sin(t * 0.01 + j.ph) * 0.05
        if (j.y < -10) {
          j.y = H + 6
          j.x = rng() * W
        }
      }
      for (const m of motes) {
        m.y -= 0.05
        if (m.y < 0) m.y = H
      }
    },
    draw(px) {
      sky(px, W, H, 0x0a1a3a, 0x02040e)
      for (const m of motes) dot(px, W, H, m.x, m.y, 0x2a4a6a)
      for (const j of js) {
        const pulse = Math.max(0, Math.sin(t * 0.08 + j.ph))
        const rx = (3 - pulse) * j.s + 1
        const ry = (2 + pulse) * j.s
        for (let y = -ry; y <= 0; y++) {
          const hw = rx * Math.sqrt(1 - (y / ry) ** 2)
          for (let x = -hw; x <= hw; x++) dot(px, W, H, j.x + x, j.y + y, mix(j.c, 0xffffff, y < -ry * 0.6 ? 0.4 : 0))
        }
        for (let k = -2; k <= 2; k++) {
          for (let s = 1; s < 8 * j.s; s++) dot(px, W, H, j.x + k * rx * 0.35 + Math.sin(t * 0.1 + s * 0.5 + k) * 0.8, j.y + s, mix(j.c, 0x02040e, s / (9 * j.s)))
        }
      }
    },
  }
}

// --- ferris wheel -----------------------------------------------------------------

const ferris: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.42
  const R = Math.min(W * 0.4, H * 0.3)
  let a = 0
  let t = 0
  const colours = Array.from({ length: 8 }, () => hsv(rng(), 0.6, 1))

  return {
    step() {
      t++
      a += 0.006
    },
    draw(px) {
      sky(px, W, H, 0x2a2060, 0xff9a6a)
      for (let x = 0; x < W; x++) {
        const h = 5 + ((x * 13) % 9)
        rect(px, W, H, x, H - 8 - h, 1, h, 0x2a1a3a)
      }
      rect(px, W, H, 0, H - 8, W, 8, 0x1a1028)
      line(px, W, H, cx, cy, cx - R * 0.6, H - 8, 0x5a4a6a)
      line(px, W, H, cx, cy, cx + R * 0.6, H - 8, 0x5a4a6a)
      ring(px, W, H, cx, cy, R, 0xe0e0f0)
      for (let k = 0; k < 8; k++) {
        const q = a + (k / 8) * Math.PI * 2
        line(px, W, H, cx, cy, cx + Math.cos(q) * R, cy + Math.sin(q) * R, 0x8a8aa0)
        for (let s = 0.3; s < 1; s += 0.35) dot(px, W, H, cx + Math.cos(q) * R * s, cy + Math.sin(q) * R * s, (t >> 3) % 8 === k ? 0xffffff : 0xffd060)
      }
      for (let k = 0; k < 8; k++) {
        const q = a + (k / 8) * Math.PI * 2
        const gx = cx + Math.cos(q) * R
        const gy = cy + Math.sin(q) * R
        rect(px, W, H, gx - 1.5, gy + 1, 3, 3, colours[k] as number)
        dot(px, W, H, gx, gy, 0x8a8aa0)
      }
      disc(px, W, H, cx, cy, 1.5, 0xffd060)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, H - 6, (x + (t >> 2)) % 6 < 3 ? 0xffd060 : 0xff6aa0)
    },
  }
}

// --- sailing ----------------------------------------------------------------------

const sailing: Maker = (W, H, rng) => {
  const sea = Math.round(H * 0.58)
  let bx = -10
  let t = 0
  const gulls = Array.from({ length: 3 }, () => ({ x: rng() * W, y: 6 + rng() * 14, ph: rng() * 6 }))

  return {
    step() {
      t++
      bx += 0.12
      if (bx > W + 10) bx = -12
      for (const g of gulls) {
        g.x += 0.2
        if (g.x > W + 3) g.x = -3
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ab8f0, 0xe0f4ff, sea)
      disc(px, W, H, W * 0.8, 8, 3, 0xfff8c0)
      for (const [cx, cy] of [
        [W * 0.25 + (t * 0.03) % W, 10],
        [W * 0.6 + (t * 0.02) % W, 16],
      ] as [number, number][]) {
        const x = (cx % (W + 12)) - 6
        ellipse(px, W, H, x + 0.5, cy + 0.6, 5, 1.5, 0xd8e8f8)
        ellipse(px, W, H, x, cy, 5, 1.5, 0xffffff)
        ellipse(px, W, H, x + 2, cy - 1, 3, 1.5, 0xffffff)
      }
      for (const g of gulls) {
        const f = Math.sin(t * 0.2 + g.ph) > 0
        dot(px, W, H, g.x, g.y, 0x3a3a3a)
        dot(px, W, H, g.x - 1, g.y - (f ? 1 : 0), 0x3a3a3a)
        dot(px, W, H, g.x + 1, g.y - (f ? 1 : 0), 0x3a3a3a)
      }
      for (let y = sea; y < H; y++)
        for (let x = 0; x < W; x++) {
          const w = Math.sin(x * 0.5 + y * 0.8 - t * 0.08)
          px[y * W + x] = w > 0.85 ? 0xc8ecff : mix(0x3a90d0, 0x1a5a9a, (y - sea) / (H - sea))
        }
      const by = sea + Math.sin(t * 0.06) * 0.8
      for (let k = 0; k < 4; k++) rect(px, W, H, bx - 5 + k, by + k * 0.5, 10 - k * 2, 1, 0x8a4a2a)
      rect(px, W, H, bx, by - 13, 1, 13, 0x5a3a24)
      const billow = Math.sin(t * 0.05) * 0.5
      for (let y = 0; y < 11; y++) {
        const w = (y / 11) * 6 + billow
        rect(px, W, H, bx + 1, by - 12 + y, w, 1, y % 4 === 0 ? 0xe03a3a : 0xffffff)
        rect(px, W, H, bx - (y / 11) * 3, by - 10 + y * 0.8, (y / 11) * 3, 1, 0xf0f0f0)
      }
    },
  }
}

// --- lighthouse -------------------------------------------------------------------

const lighthouse: Maker = (W, H, rng) => {
  const sea = Math.round(H * 0.7)
  const lx = Math.round(W * 0.28)
  const top = Math.round(H * 0.3)
  let t = 0
  let spray: { x: number; y: number; vy: number; vx: number; l: number }[] = []

  return {
    step() {
      t++
      if (t % 40 === 0) for (let k = 0; k < 10; k++) spray.push({ x: lx + 6 + rng() * 4, y: sea - 1, vx: (rng() - 0.3) * 0.6, vy: -1 - rng() * 1.2, l: 20 })
      for (const s of spray) {
        s.vy += 0.08
        s.x += s.vx
        s.y += s.vy
        s.l--
      }
      spray = spray.filter(s => s.l > 0)
    },
    draw(px) {
      sky(px, W, H, 0x0a1020, 0x2a3048, sea)
      const a = t * 0.05
      const dir = Math.cos(a)
      if (Math.sin(a) < 0.3)
        for (let k = 0; k < W * 1.2; k++) {
          const x = lx + dir * k
          for (let s = -k * 0.15; s <= k * 0.15; s++) {
            const y = top + 1 + s
            const kk = Math.round(y) * W + Math.round(x)
            if (x >= 0 && x < W && y >= 0 && y < H) px[kk] = mix(px[kk] as number, 0xfff4c0, 0.25 * (1 - k / (W * 1.2)))
          }
        }
      for (let y = sea; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 2 + y + (t >> 2)) % 7 === 0 ? 0x5a7aa0 : mix(0x2a3a5a, 0x101828, (y - sea) / (H - sea))
      for (let x = 0; x < W * 0.55; x++) {
        const h = 4 + Math.abs(Math.sin(x * 0.7)) * 3
        rect(px, W, H, x, sea - h + 2, 1, h, 0x3a3a42)
      }
      for (let y = top; y < sea - 2; y++) {
        const hw = 2 + ((y - top) / (sea - top)) * 2
        const band = Math.floor((y - top) / 4) % 2
        rect(px, W, H, lx - hw, y, hw * 2, 1, band ? 0xe03a3a : 0xf4f4f0)
        rect(px, W, H, lx + hw * 0.35, y, hw * 0.65, 1, band ? 0xa82a2a : 0xc8c8d0)
      }
      rect(px, W, H, lx - 3, top - 4, 6, 4, 0x2a2a32)
      rect(px, W, H, lx - 2, top - 3, 4, 2, 0xfff4a0)
      rect(px, W, H, lx - 3, top - 5, 6, 1, 0x3a3a42)
      for (const s of spray) dot(px, W, H, s.x, s.y, 0xd8e8f8)
      for (let k = 0; k < 14; k++) line(px, W, H, (k * 5 + t * 0.7) % W, (k * 9 + t * 1.6) % H, (k * 5 + t * 0.7) % W - 0.5, ((k * 9 + t * 1.6) % H) + 1.5, 0x5a6a8a)
    },
  }
}

// --- lava lamp -------------------------------------------------------------

const lava: Maker = (W, H, rng) => {
  const palettes = [
    [0x3a0f5c, 0x7a1f6b, 0xff7a1a, 0xffd23a],
    [0x0b2f4f, 0x165a6e, 0x7dff6a, 0xe6ffb0],
    [0x1a1450, 0x3b1e7a, 0xff4fa3, 0xffc4e6],
    [0x07281f, 0x0f4a3c, 0xff5a3a, 0xffcf7a],
  ]
  const [liq0, liq1, wax0, wax1] = palettes[Math.floor(rng() * palettes.length)] as [number, number, number, number]
  const cx = W / 2
  const topY = Math.round(H * 0.12)
  const botY = Math.round(H * 0.8)
  const hw = (y: number) => W * 0.16 + W * 0.24 * Math.pow((y - topY) / (botY - topY), 0.7)
  const blobs = Array.from({ length: 6 }, () => ({
    x: cx + (rng() - 0.5) * W * 0.25,
    r: W * (0.07 + rng() * 0.07),
    period: 220 + rng() * 260,
    phase: rng() * Math.PI * 2,
    sway: rng() * W * 0.06,
  }))
  let t = rng() * 1000

  return {
    step() {
      t++
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const halo = Math.max(0, 1 - Math.hypot(x - cx, (y - H * 0.5) * 0.6) / (W * 0.75))
          px[y * W + x] = mix(0x0a0810, wax0, halo * 0.22)
        }
      const pos = blobs.map(b => ({
        x: b.x + Math.sin(t / (b.period * 0.7) + b.phase) * b.sway,
        y: botY - 3 - (botY - topY - 8) * (0.5 - 0.5 * Math.cos((t / b.period) * Math.PI * 2 + b.phase)),
        r2: b.r * b.r,
      }))
      pos.push({ x: cx, y: botY + 3, r2: (W * 0.3) ** 2 })
      for (let y = topY; y < botY; y++) {
        const half = hw(y)
        for (let x = 0; x < W; x++) {
          const dx = x + 0.5 - cx
          if (Math.abs(dx) > half) continue
          let f = 0
          for (const p of pos) f += p.r2 / ((x - p.x) ** 2 + (y - p.y) ** 2 + 0.5)
          const light = 1 - Math.abs(dx) / half
          px[y * W + x] =
            f > 1 ? mix(wax0, wax1, Math.min(1, (f - 1) * 0.5) * (0.4 + 0.6 * light)) : mix(liq0, liq1, Math.min(1, f) * 0.8 + light * 0.2)
        }
      }
      const metal = (y: number, half: number) => {
        for (let x = 0; x < W; x++) {
          const dx = x + 0.5 - cx
          if (Math.abs(dx) <= half) px[y * W + x] = mix(0x4a4f5a, 0xdfe4ec, Math.cos((dx / half) * 1.3) * 0.5 + 0.5)
        }
      }
      for (let y = 0; y < topY; y++) metal(y, W * 0.1 + (W * 0.06 * y) / topY)
      for (let y = botY; y < H; y++) metal(y, W * 0.4 - (W * 0.12 * (y - botY)) / (H - botY))
    },
  }
}

// --- fireworks ----------------------------------------------------------

const feux: Maker = (W, H, rng) => {
  const trail = new Uint32Array(W * H)
  const stars = Array.from({ length: 22 }, () => ({ x: Math.floor(rng() * W), y: Math.floor(rng() * H * 0.6), p: rng() * 6 }))
  const skyline: number[] = []
  while (skyline.length < W) {
    const w = 3 + Math.floor(rng() * 4)
    const h = 3 + Math.floor(rng() * H * 0.14)
    for (let i = 0; i < w; i++) skyline.push(h)
  }
  const windows = Array.from({ length: W * H }, () => rng() < 0.18)
  type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: number; drag: number }
  let rockets: P[] = []
  let parts: P[] = []
  let frame = 0
  let boom = 0
  const ground = (x: number) => H - (skyline[x] ?? 0)

  function launch() {
    const x = W * (0.15 + rng() * 0.7)
    rockets.push({ x, y: H - 2, vx: (rng() - 0.5) * 0.2, vy: -(1.1 + rng() * 0.55) * Math.sqrt(H / 56), life: 0, max: 0, c: hsv(rng(), 0.7, 1), drag: 0 })
  }
  function explode(r: P) {
    boom = 6
    const kind = rng()
    const n = 26 + Math.floor(rng() * 16)
    const base = rng()
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + rng() * 0.2
      const sp = kind < 0.4 ? 0.9 : 0.3 + rng() * 0.8
      const willow = kind > 0.8
      parts.push({
        x: r.x,
        y: r.y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: willow ? 45 : 28,
        max: willow ? 45 : 28,
        c: willow ? 0xffcf5a : hsv(base + (rng() - 0.5) * 0.08, 0.85, 1),
        drag: willow ? 0.93 : 0.96,
      })
    }
  }

  return {
    step() {
      frame++
      if (boom > 0) boom--
      for (let i = 0; i < trail.length; i++) trail[i] = scale(trail[i] as number, 0.82)
      if (rockets.length < 2 && rng() < 0.06) launch()
      for (const r of rockets) {
        r.vy += 0.035
        r.x += r.vx
        r.y += r.vy
        dot(trail, W, H, r.x, r.y + 1, 0xff9a3a)
        if (r.vy > -0.15) {
          explode(r)
          r.life = -1
        }
      }
      rockets = rockets.filter(r => r.life >= 0)
      for (const p of parts) {
        p.vx *= p.drag
        p.vy = p.vy * p.drag + 0.025
        p.x += p.vx
        p.y += p.vy
        p.life--
        const k = p.life / p.max
        if (k > 0.15 || frame % 2 === 0) dot(trail, W, H, p.x, p.y, k > 0.8 ? mix(p.c, 0xffffff, 0.5) : scale(p.c, 0.45 + 0.55 * k))
      }
      parts = parts.filter(p => p.life > 0)
    },
    draw(px) {
      sky(px, W, H, 0x050816, mix(0x1a1240, 0x3a1a50, boom / 6))
      for (const s of stars) if ((frame / 8 + s.p) % 6 > 0.6) dot(px, W, H, s.x, s.y, 0x8890b0)
      for (let i = 0; i < px.length; i++) if (trail[i]) px[i] = add(px[i] as number, trail[i] as number)
      for (let x = 0; x < W; x++)
        for (let y = ground(x); y < H; y++) {
          const lit = windows[y * W + x] && y > ground(x) && x % 2 === 0
          px[y * W + x] = lit ? 0xffd27a : mix(0x0c0a18, 0x3a2050, boom / 12)
        }
    },
  }
}

// --- campfire ---------------------------------------------------------------

const feu: Maker = (W, H, rng) => {
  const MAX = 36
  const heat = new Uint8Array(W * H)
  const base = H - 7
  const palette = Array.from({ length: MAX + 1 }, (_, i) => {
    const k = i / MAX
    if (k < 0.33) return mix(0x000000, 0xbf1f07, k / 0.33)
    if (k < 0.66) return mix(0xbf1f07, 0xff9f0f, (k - 0.33) / 0.33)
    return mix(0xff9f0f, 0xffffc0, (k - 0.66) / 0.34)
  })
  const stars = Array.from({ length: 18 }, () => ({ x: Math.floor(rng() * W), y: Math.floor(rng() * H * 0.45), p: rng() * 9 }))
  let embers: { x: number; y: number; vx: number; vy: number; life: number }[] = []
  let t = 0
  let glow = 1

  return {
    step() {
      t++
      for (let x = 0; x < W; x++) {
        const dx = Math.abs(x + 0.5 - W / 2) / (W * 0.16)
        heat[base * W + x] = dx < 1 ? Math.round(MAX * (1 - dx * dx * 0.5) * (rng() < 0.85 ? 1 : 0.6)) : 0
      }
      for (let y = 1; y <= base; y++)
        for (let x = 0; x < W; x++) {
          const src = y * W + x
          const p = heat[src] as number
          if (p === 0) {
            heat[src - W] = 0
            continue
          }
          const r = Math.floor(rng() * 3)
          const dst = Math.max(0, Math.min(W * H - 1, src - r + 1 - W))
          heat[dst] = Math.max(0, p - (r & 1) - (rng() < 0.75 ? 1 : 0))
        }
      if (rng() < 0.3) embers.push({ x: W / 2 + (rng() - 0.5) * W * 0.3, y: base - 6, vx: (rng() - 0.5) * 0.3, vy: -0.4 - rng() * 0.5, life: 30 + rng() * 30 })
      for (const e of embers) {
        e.x += e.vx + Math.sin(t * 0.2 + e.life) * 0.2
        e.y += e.vy
        e.life--
      }
      embers = embers.filter(e => e.life > 0 && e.y > 0)
      glow = 0.85 + rng() * 0.15
    },
    draw(px) {
      sky(px, W, H, 0x04060f, 0x15101a, base)
      for (const s of stars) if ((t / 10 + s.p) % 9 > 1) dot(px, W, H, s.x, s.y, 0x7a7f9a)
      for (let y = base; y < H; y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x - W / 2, (y - base) * 2) / (W * 0.7)
          px[y * W + x] = mix(0x1a120c, 0x6a3a1a, Math.max(0, 1 - d) * glow)
        }
      for (let i = 0; i < W * base; i++) {
        const hv = heat[i] as number
        if (hv > 2) px[i] = add(px[i] as number, palette[hv] as number)
      }
      for (let i = 0; i < W * 0.5; i++) {
        const x = W * 0.25 + i
        const y1 = base + 1 + (i / (W * 0.5)) * 3
        const y2 = base + 4 - (i / (W * 0.5)) * 3
        rect(px, W, H, x, y1, 1, 2, 0x5a3418)
        rect(px, W, H, x, y2, 1, 2, 0x6e4220)
      }
      for (const e of embers) dot(px, W, H, e.x, e.y, mix(0x401000, 0xffb040, Math.min(1, e.life / 30)))
    },
  }
}

// --- snow on a cabin -------------------------------------------------------

const neige: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.82)
  const far: number[] = []
  const near: number[] = []
  const a = rng() * 6
  for (let x = 0; x < W; x++) {
    far.push(H * 0.45 - (Math.sin(x * 0.21 + a) * 0.5 + Math.sin(x * 0.53 + a * 2) * 0.3 + 0.8) * H * 0.12)
    near.push(H * 0.62 - (Math.sin(x * 0.17 + a * 3) * 0.5 + Math.sin(x * 0.41) * 0.25 + 0.7) * H * 0.08)
  }
  const snowH = new Float32Array(W)
  const flakes = Array.from({ length: 70 }, () => ({ x: rng() * W, y: rng() * H, vy: 0.15 + rng() * 0.3, ph: rng() * 6 }))
  let smoke: { x: number; y: number; life: number }[] = []
  const cw = Math.min(16, W - 6)
  const chX = Math.round(W / 2 - cw / 2)
  const wallH = 7
  const roofH = Math.round(cw / 2.4)
  const trees = [W * 0.12, W * 0.88, W * 0.2]
  let t = 0

  return {
    step() {
      t++
      for (const f of flakes) {
        f.y += f.vy
        f.x += Math.sin(t * 0.05 + f.ph) * 0.2
        const xi = Math.max(0, Math.min(W - 1, Math.round(f.x)))
        if (f.y >= ground - (snowH[xi] as number)) {
          snowH[xi] = Math.min(4, (snowH[xi] as number) + 0.08)
          f.y = -1
          f.x = rng() * W
        }
      }
      if (t % 4 === 0) smoke.push({ x: chX + cw - 4, y: ground - wallH - roofH - 2, life: 40 })
      for (const s of smoke) {
        s.y -= 0.25
        s.x += 0.12 + Math.sin(s.life * 0.2) * 0.1
        s.life--
      }
      smoke = smoke.filter(s => s.life > 0)
    },
    draw(px) {
      sky(px, W, H, 0x0b1530, 0x2a3d6b)
      disc(px, W, H, W * 0.78, H * 0.1, W * 0.07, 0xf4f0d8)
      for (let x = 0; x < W; x++) {
        for (let y = Math.round(far[x] as number); y < H; y++) px[y * W + x] = y < (far[x] as number) + 2 ? 0xe8eef8 : 0x3a4a75
        for (let y = Math.round(near[x] as number); y < H; y++) px[y * W + x] = 0x2a3558
        for (let y = ground - Math.round(snowH[x] as number); y < H; y++) px[y * W + x] = y === ground - Math.round(snowH[x] as number) ? 0xffffff : 0xdfe8f5
      }
      for (const tx of trees)
        for (let j = 0; j < 12; j++) {
          const half = (j % 4) + 1 + Math.floor(j / 4) * 0.5
          for (let i = -half; i <= half; i++) dot(px, W, H, tx + i, ground - 12 + j, j % 4 === 0 ? 0xf0f4ff : 0x1f4a35)
        }
      slab(px, W, H, chX, ground - wallH, cw, wallH, 0x6b3f1f)
      for (let y = ground - wallH; y < ground; y += 2) rect(px, W, H, chX, y, cw, 1, 0x5a3418)
      rect(px, W, H, chX + cw - 5, ground - wallH - roofH - 2, 2, 4, 0x4a4a52)
      for (let j = 0; j <= roofH; j++) {
        const half = (cw / 2 + 1) * (j / roofH)
        for (let i = -half; i <= half; i++) dot(px, W, H, chX + cw / 2 + i, ground - wallH - roofH + j, j < 2 || Math.abs(i) > half - 1 ? 0xf4f8ff : 0x8a2a2a)
      }
      const flicker = 0.85 + Math.sin(t * 0.3) * 0.15
      rect(px, W, H, chX + 3, ground - wallH + 2, 3, 3, mix(0xb07020, 0xffd27a, flicker))
      rect(px, W, H, chX + cw - 6, ground - wallH + 2, 3, 3, mix(0xb07020, 0xffd27a, flicker))
      rect(px, W, H, chX + cw / 2 - 1, ground - 4, 2, 4, 0x3a2010)
      for (const s of smoke) dot(px, W, H, s.x, s.y, mix(0x2a3d6b, 0x9aa0b0, s.life / 40))
      for (const f of flakes) dot(px, W, H, f.x, f.y, 0xffffff)
    },
  }
}

// --- rain on a window -------------------------------------------------------------

const vitre: Maker = (W, H, rng) => {
  const bg = new Uint32Array(W * H)
  const lights = Array.from({ length: 14 }, () => ({
    x: rng() * W,
    y: H * 0.3 + rng() * H * 0.6,
    r: 1.5 + rng() * 3,
    c: [0xffb050, 0xff5a7a, 0x5ac8ff, 0xffe08a][Math.floor(rng() * 4)] as number,
  }))
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let c = mix(0x0e1424, 0x1c1a2e, y / H)
      for (const l of lights) {
        const d = Math.hypot(x - l.x, y - l.y) / l.r
        if (d < 1.4) c = add(c, scale(l.c, 0.45 * Math.max(0, 1 - d * d * 0.5)))
      }
      bg[y * W + x] = c
    }
  const wet = new Float32Array(W * H)
  let still = Array.from({ length: 40 }, () => ({ x: rng() * W, y: rng() * H }))
  type Drop = { x: number; y: number; r: number; v: number }
  let drops: Drop[] = []

  return {
    step() {
      for (let i = 0; i < wet.length; i++) wet[i] = (wet[i] as number) * 0.985
      if (rng() < 0.5) still.push({ x: rng() * W, y: rng() * H })
      if (still.length > 70) still.shift()
      if (rng() < 0.06) drops.push({ x: 2 + rng() * (W - 4), y: rng() * H * 0.4, r: 1 + rng() * 0.8, v: 0.2 + rng() * 0.4 })
      for (const d of drops) {
        d.v = Math.min(1.2, d.v + 0.01)
        d.y += d.v
        d.x += (rng() - 0.5) * 0.4
        const xi = Math.round(d.x)
        const yi = Math.round(d.y - d.r - 1)
        if (xi >= 0 && xi < W && yi >= 0 && yi < H) wet[yi * W + xi] = 1
        still = still.filter(s => {
          const hit = Math.abs(s.x - d.x) < d.r + 0.5 && Math.abs(s.y - d.y) < d.r + 0.5
          if (hit) d.r = Math.min(2.2, d.r + 0.05)
          return !hit
        })
      }
      drops = drops.filter(d => d.y < H + 3)
    },
    draw(px) {
      px.set(bg)
      for (let i = 0; i < px.length; i++) {
        const w = wet[i] as number
        if (w > 0.05) px[i] = mix(px[i] as number, 0xa0b0c8, w * 0.3)
      }
      for (const s of still) dot(px, W, H, s.x, s.y, mix(bg[Math.round(s.y) * W + Math.round(s.x)] ?? 0, 0xd8e4f0, 0.5))
      for (const d of drops) {
        const n = Math.ceil(d.r)
        for (let dy = -n; dy <= n; dy++)
          for (let dx = -n; dx <= n; dx++) {
            if (dx * dx + dy * dy > d.r * d.r + 0.3) continue
            const xi = Math.round(d.x + dx)
            const yi = Math.round(d.y + dy)
            if (xi < 0 || xi >= W || yi < 0 || yi >= H) continue
            const sx = Math.max(0, Math.min(W - 1, Math.round(d.x - dx * 2)))
            const sy = Math.max(0, Math.min(H - 1, Math.round(d.y - dy * 2)))
            px[yi * W + xi] = mix(bg[sy * W + sx] as number, 0xffffff, 0.2)
          }
        dot(px, W, H, d.x - d.r * 0.4, d.y - d.r * 0.5, 0xffffff)
      }
      rect(px, W, H, 0, 0, W, 1, 0x2a2228)
      rect(px, W, H, 0, H - 1, W, 1, 0x2a2228)
      rect(px, W, H, Math.floor(W / 2), 0, 1, H, 0x2a2228)
      rect(px, W, H, 0, Math.floor(H * 0.45), W, 1, 0x2a2228)
    },
  }
}

// --- laundromat at night ------------------------------------------------------------

const laundromat: Maker = (W, H, rng) => {
  // a laundromat at night: dryers over washers, laundry tumbling behind the portholes, a neon glow
  const top = Math.round(H * 0.16)
  const rowH = Math.round((H * 0.9 - top) / 2)
  const colW = Math.floor(W / 2)
  const r = Math.max(3, Math.min(colW * 0.3, (rowH - 12.5) / 2))
  type Piece = { a: number; x: number; y: number; vy: number; fall: boolean; c: number }
  type Machine = { x: number; y: number; wash: boolean; w: number; dir: number; time: number; pieces: Piece[]; spin: number }
  const machines: Machine[] = []
  for (let row = 0; row < 2; row++)
    for (let col = 0; col < 2; col++) {
      const x = col * colW + colW / 2
      // the porthole sits under the control panel
      const y = top + row * rowH + 9 + r
      const hue = rng()
      machines.push({
        x,
        y,
        wash: row === 1,
        w: 0.12 + rng() * 0.05,
        dir: 1,
        time: 20 + irand(rng, 40),
        spin: 0,
        pieces: Array.from({ length: 8 }, (_, k) => ({ a: (k / 8) * Math.PI * 2, x: 0, y: 0, vy: 0, fall: false, c: hsv(hue + k * 0.13, 0.55, 0.85) })),
      })
    }
  let t = 0

  return {
    step() {
      t++
      for (const m of machines) {
        if (t % 15 === 0) m.time--
        if (m.time <= 0) {
          m.time = 30 + irand(rng, 30)
          m.spin = 45
        }
        if (m.wash && t % 60 === 0) m.dir = -m.dir
        if (m.spin > 0) m.spin--
        const w = m.spin > 0 ? 0.6 : m.w * m.dir
        const R = r - 1.2
        for (const p of m.pieces) {
          if (!p.fall) {
            // carried round by the drum, then dropped from near the top
            p.a += w
            p.x = Math.cos(p.a) * R
            p.y = Math.sin(p.a) * R
            if (m.spin === 0 && Math.sin(p.a) < -0.75 && rng() < 0.2) {
              p.fall = true
              p.vy = 0
            }
          } else {
            p.vy += 0.12
            p.y += p.vy
            if (p.x * p.x + p.y * p.y >= R * R && p.y > 0) {
              p.fall = false
              p.a = Math.atan2(p.y, p.x)
            }
          }
        }
      }
    },
    draw(px) {
      // the wall with its neon tube, the machines, a tiled floor that catches the light
      sky(px, W, H, 0x1a1830, 0x2a2440)
      for (let x = 2; x < W - 2; x++) {
        const y = Math.round(top * 0.5 + Math.sin(x * 0.5) * 1.5)
        dot(px, W, H, x, y, 0xff6ad0)
        tint(px, W, H, x, y - 1, 0xff6ad0, 0.35)
        tint(px, W, H, x, y + 1, 0xff6ad0, 0.35)
      }
      const floor = Math.round(top + rowH * 2)
      for (let y = floor; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (Math.floor(x / 4) + Math.floor((y - floor) / 3)) % 2 ? 0x3a3a52 : 0x4a4a64
      for (const m of machines) {
        const x0 = Math.round(m.x - colW / 2 + 1)
        const y0 = Math.round(m.y - 9 - r + 1)
        slab(px, W, H, x0, y0, colW - 2, rowH - 2, m.wash ? 0xf4f4fa : 0xe0e4ee, 0x5a5a6a)
        // the panel: a dial and the red countdown
        rect(px, W, H, x0 + 1, y0 + 1, colW - 4, 6, 0x3a3a48)
        lit(px, W, H, x0 + 3, y0 + 4, 1.2, 1.2, 0xc0c0c8)
        text(px, W, H, x0 + colW - 11, y0 + 2, String(Math.min(99, m.time)).padStart(2, '0'), 0xff4a3a)
        // the porthole: steel ring, the drum's dark inside, water in the washers
        const R = r
        for (let dy = -Math.ceil(R + 1); dy <= R + 1; dy++)
          for (let dx = -Math.ceil(R + 1); dx <= R + 1; dx++) {
            const d = Math.hypot(dx, dy)
            if (d > R + 1) continue
            let c: number
            if (d > R) c = dx + dy < 0 ? 0xf0f0f8 : 0x7a7a8a
            else if (m.wash && dy > R * 0.2 + Math.sin(dx * 0.8 + t * 0.3) * 0.6) c = 0x3a6ab0
            else c = 0x1a1a28
            dot(px, W, H, m.x + dx, m.y + dy, c)
          }
        // the laundry: blurred into a ring on the spin, tumbling otherwise
        for (const p of m.pieces) {
          if (m.spin > 0) {
            for (let k = 0; k < 3; k++) {
              const a = p.a - k * 0.3
              dot(px, W, H, m.x + Math.cos(a) * (R - 1.2), m.y + Math.sin(a) * (R - 1.2), mix(p.c, 0x1a1a28, k * 0.3))
            }
            continue
          }
          rect(px, W, H, m.x + p.x - 1, m.y + p.y - 0.5, 2, 2, p.c)
          dot(px, W, H, m.x + p.x - 1, m.y + p.y - 0.5, mix(p.c, 0xffffff, 0.4))
        }
        // glass: a sheen on the upper left, foam on the water line
        dot(px, W, H, m.x - R * 0.5, m.y - R * 0.6, 0xffffff)
        dot(px, W, H, m.x - R * 0.6, m.y - R * 0.4, 0xc8d8f0)
      }
      // the neon's pink reflected on the floor tiles
      for (let x = 0; x < W; x++) tint(px, W, H, x, floor, 0xff6ad0, 0.3)
    },
  }
}

export const COZY = {
  lava,
  feux,
  feu,
  neige,
  vitre,
  lofi,
  aquarium,
  plant,
  cafe,
  trainwindow,
  bookshelf,
  citywindows,
  knitting,
  balloons,
  lanterns,
  fishing,
  farm,
  marshmallow,
  jellyfish,
  ferris,
  sailing,
  lighthouse,
  laundromat,
}
