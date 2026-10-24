import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { clamp, ellipse, hash, irand, line, lit, litSprite, shuffle, slab, sparks, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Satisfying & ASMR: one motion that turns a mess into order.

// --- kinetic sand cutting ---------------------------------------------------------

const kinetic: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.66)
  const bw = Math.max(4, Math.round(W * 0.62))
  const bh = Math.max(3, Math.round(H * 0.3))
  const bx = W - bw - Math.max(1, Math.round(W * 0.06))
  let layers: number[] = []
  let left = 0
  let knife = -1
  let wait = 0
  let sweep = 0
  const pile: number[][] = Array.from({ length: W }, () => [])
  let grains: { x: number; y: number; vx: number; vy: number; c: number; t: number }[] = []

  function newBlock() {
    const hues = shuffle(rng, [0.95, 0.55, 0.78, 0.35, 0.12, 0.62])
    layers = []
    let k = 0
    while (layers.length < bh + 3) {
      const c = hsv(hues[k % 3] as number, 0.42, 0.97)
      const n = 2 + irand(rng, 3)
      for (let i = 0; i < n; i++) layers.push(c)
      k++
    }
    left = 0
  }
  newBlock()
  const colourAt = (x: number, r: number) => layers[clamp(r + Math.round(Math.sin(x * 0.55) * 1.2) + 1, 0, layers.length - 1)] as number

  function settle(cx: number, c: number) {
    const limit = bx + left - 1
    let i = clamp(cx, 0, limit)
    for (let n = 0; n < 6; n++) {
      const h = (pile[i] as number[]).length
      if (i > 0 && (pile[i - 1] as number[]).length < h - 1) i--
      else if (i < limit && (pile[i + 1] as number[]).length < h - 1) i++
      else break
    }
    ;(pile[i] as number[]).push(c)
  }

  return {
    step() {
      for (const g of grains) {
        if (g.t > 0) {
          g.t--
          continue
        }
        g.vy += 0.16
        g.x += g.vx
        g.y += g.vy
        const cx = clamp(Math.round(g.x), 0, W - 1)
        if (g.y >= floor - (pile[cx] as number[]).length - 1) {
          settle(cx, g.c)
          g.c = -1
        }
      }
      grains = grains.filter(g => g.c >= 0)
      if (sweep > 0) {
        sweep--
        pile.shift()
        pile.push([])
        if (sweep === 0) newBlock()
        return
      }
      if (wait > 0) {
        wait--
        return
      }
      if (left >= bw) {
        if (!grains.length) sweep = W
        return
      }
      if (knife < 0) knife = 0
      knife += 0.07
      if (knife >= 1) {
        const x0 = bx + left
        for (let x = x0; x < x0 + 2 && x < bx + bw; x++)
          for (let r = 0; r < bh; r++)
            grains.push({ x, y: floor - bh + r, vx: -0.15 - rng() * 0.55, vy: -rng() * 0.3, c: colourAt(x, r), t: Math.floor((bh - r) * 0.6 + rng() * 3) })
        left += 2
        knife = -1
        wait = 8
      }
    },
    draw(px) {
      sky(px, W, H, 0xf6d9e6, 0xd9d4f6, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0xb88a5a)
      rect(px, W, H, 0, floor, W, 1, 0xe9e4ef)
      rect(px, W, H, 0, floor + 1, W, 1, 0xa07548)
      for (let x = bx + left; x < bx + bw; x++)
        for (let r = 0; r < bh; r++) {
          let c = colourAt(x, r)
          if (x === bx + bw - 1) c = scale(c, 0.85)
          if (r === 0) c = mix(c, 0xffffff, 0.25)
          dot(px, W, H, x, floor - bh + r, c)
        }
      if (left < bw && left > 0) for (let r = 0; r < bh; r++) dot(px, W, H, bx + left, floor - bh + r, mix(colourAt(bx + left, r), 0xffffff, 0.2))
      pile.forEach((col, x) => col.forEach((c, j) => dot(px, W, H, x, floor - 1 - j, c)))
      for (const g of grains) dot(px, W, H, g.x, g.y, g.c)
      if (knife >= 0) {
        const kx = bx + left + 2
        const tip = floor - bh - 10 + knife * (bh + 10)
        rect(px, W, H, kx, tip - 9, 1, 9, 0xdfe4ea)
        rect(px, W, H, kx + 1, tip - 9, 1, 9, 0xa9b0ba)
        rect(px, W, H, kx - 1, tip - 15, 3, 6, 0x4a3426)
      }
    },
  }
}

// --- soap cube cutting ------------------------------------------------------------

const soap: Maker = (W, H, rng) => {
  const cs = 3
  const cols = Math.max(2, Math.floor((W * 0.66) / cs))
  const rows = Math.max(2, Math.floor((H * 0.27) / cs))
  const x0 = Math.floor((W - cols * cs) / 2)
  const y0 = Math.round(H * 0.16)
  const plate = H - 6
  let hue = rng()
  let phase = 0
  let t = 0
  const slots = Math.ceil(W / cs)
  let heap: number[][] = []
  type Cube = { c: number; r: number; x: number; y: number; vy: number; fall: number; done: boolean }
  let cubes: Cube[] = []

  function reset() {
    hue = (hue + 0.23 + rng() * 0.2) % 1
    phase = 0
    t = 0
    heap = Array.from({ length: slots }, () => [])
    cubes = []
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) cubes.push({ c, r, x: x0 + c * cs, y: y0 + r * cs, vy: 0, fall: -1, done: false })
  }
  reset()
  const body = (c: number, r: number) => {
    const base = hsv(hue + (c + r) * 0.006, 0.38, 0.96)
    return (c * 7 + r * 3) % 5 === 0 ? mix(base, 0xffffff, 0.3) : base
  }

  return {
    step() {
      t++
      if (phase === 0 && t > (cols - 1) * 8 + 4) {
        phase = 1
        t = 0
      } else if (phase === 1 && t > (rows - 1) * 8 + 4) {
        phase = 2
        t = 0
        const order = shuffle(rng, cubes.slice()).sort((a, b) => b.r - a.r)
        order.forEach((q, i) => (q.fall = i * 2 + irand(rng, 3)))
      } else if (phase === 2) {
        for (const q of cubes) {
          if (q.done || t < q.fall) continue
          q.vy += 0.22
          q.y += q.vy
          let s = clamp(Math.round(q.x / cs) + irand(rng, 3) - 1, 0, slots - 1)
          if ((heap[s] as number[]).length > (heap[Math.max(0, s - 1)] as number[]).length + 1) s = Math.max(0, s - 1)
          const top = plate - ((heap[s] as number[]).length + 1) * cs
          if (q.y >= top) {
            ;(heap[s] as number[]).push(body(q.c, q.r))
            q.done = true
          }
        }
        if (cubes.every(q => q.done) && t > 40) {
          phase = 3
          t = 0
        }
      } else if (phase === 3 && t > 45) reset()
    },
    draw(px) {
      sky(px, W, H, 0xcfeee8, 0xf3e9d8)
      rect(px, W, H, 0, plate, W, H - plate, 0xe8e2da)
      rect(px, W, H, 0, plate, W, 1, 0xffffff)
      heap.forEach((col, s) =>
        col.forEach((c, j) => {
          rect(px, W, H, s * cs, plate - (j + 1) * cs, cs, cs, c)
          dot(px, W, H, s * cs, plate - (j + 1) * cs, mix(c, 0xffffff, 0.4))
          rect(px, W, H, s * cs + cs - 1, plate - (j + 1) * cs, 1, cs, scale(c, 0.85))
        }),
      )
      const groove = (c: number) => scale(c, 0.8)
      for (const q of cubes) {
        if (q.done) continue
        const c = body(q.c, q.r)
        rect(px, W, H, q.x, q.y, cs, cs, c)
        const scoredV = phase > 0 || q.c < Math.floor(t / 8)
        const scoredH = phase > 1 || (phase === 1 && q.r < Math.floor(t / 8))
        if (phase === 2 && q.fall >= 0 && t >= q.fall) {
          dot(px, W, H, q.x, q.y, mix(c, 0xffffff, 0.4))
          rect(px, W, H, q.x + cs - 1, q.y, 1, cs, groove(c))
          rect(px, W, H, q.x, q.y + cs - 1, cs, 1, groove(c))
          continue
        }
        if (scoredV && q.c < cols - 1) rect(px, W, H, q.x + cs - 1, q.y, 1, cs, groove(c))
        if (scoredH && q.r < rows - 1) rect(px, W, H, q.x, q.y + cs - 1, cs, 1, groove(c))
        if (q.r === 0) rect(px, W, H, q.x, q.y, cs, 1, mix(c, 0xffffff, 0.35))
      }
      if (phase === 0 || phase === 1) {
        const k = Math.floor(t / 8)
        const f = (t % 8) / 8
        if (phase === 0 && k < cols - 1) {
          const bx = x0 + (k + 1) * cs - 1
          const by = y0 - 6 + f * (rows * cs + 6)
          rect(px, W, H, bx, by - 6, 1, 6, 0xe8edf2)
          rect(px, W, H, bx, by - 10, 1, 4, 0x6a5040)
        } else if (phase === 1 && k < rows - 1) {
          const by = y0 + (k + 1) * cs - 1
          const bx = x0 - 6 + f * (cols * cs + 6)
          rect(px, W, H, bx - 6, by, 6, 1, 0xe8edf2)
          rect(px, W, H, bx - 10, by, 4, 1, 0x6a5040)
        }
      }
    },
  }
}

// --- slime stretching -------------------------------------------------------------

const slime: Maker = (W, H, rng) => {
  const cx = W / 2
  const yb = H * 0.74
  let hue = rng()
  let t = 0
  const glitter = Array.from({ length: 10 }, () => ({ u: rng(), s: rng() * 2 - 1 }))
  const skin = 0xf0c09a
  return {
    step() {
      t++
      if (t % 150 === 0) hue = (hue + 0.3) % 1
    },
    draw(px) {
      sky(px, W, H, 0xfde2f3, 0xd8e8ff)
      const p = (t % 150) / 150
      // 0-0.55 stretch up, 0.55-0.65 wobble, 0.65-0.8 snap down, then rest
      const reach = p < 0.55 ? p / 0.55 : p < 0.65 ? 1 : p < 0.8 ? 1 - (p - 0.65) / 0.15 : 0
      const ease = reach * reach * (3 - 2 * reach)
      const len = H * 0.08 + ease * H * 0.55
      const yt = yb - len
      const wob = p >= 0.55 && p < 0.65 ? Math.sin(t * 1.4) * 1.2 : 0
      const rb = W * 0.22 * (1 - 0.35 * ease) + 2
      const rt = W * 0.1 + 1
      const neck = Math.max(0.6, W * 0.13 - ease * W * 0.11)
      const base = hsv(hue, 0.55, 0.95)
      const dark = hsv(hue, 0.7, 0.72)
      for (let y = Math.floor(yt - rt); y <= Math.ceil(yb + rb * 0.6); y++) {
        const u = clamp((y - yt) / Math.max(1, yb - yt), 0, 1)
        const sag = Math.sin(u * Math.PI) * (wob + ease * 1.5 * Math.sin(t * 0.08))
        let hw = neck * (0.6 + 0.8 * Math.abs(u - 0.5))
        const dt = (y - yt) / rt
        if (Math.abs(dt) < 1) hw = Math.max(hw, rt * Math.sqrt(1 - dt * dt))
        const db = (y - yb) / (y > yb ? rb * 0.6 : rb)
        if (Math.abs(db) < 1) hw = Math.max(hw, rb * Math.sqrt(1 - db * db))
        if (y < yt - rt) continue
        const xc = cx + sag
        for (let x = Math.round(xc - hw); x <= Math.round(xc + hw); x++) {
          const e = Math.abs(x - xc) / Math.max(0.5, hw)
          let c = e > 0.75 ? dark : base
          if (x - xc < -hw * 0.25 && x - xc > -hw * 0.6) c = mix(base, 0xffffff, 0.45)
          dot(px, W, H, x, y, c)
        }
      }
      for (const g of glitter) {
        const y = yt + g.u * (yb - yt)
        const hw = Math.max(neck, 1)
        if ((t + Math.floor(g.u * 20)) % 6 < 3) dot(px, W, H, cx + g.s * hw * 0.6, y, 0xffffff)
      }
      // two fingers pinch the top, a palm holds the bottom
      rect(px, W, H, cx - rt - 2, yt - rt - 3, 3, 4, skin)
      rect(px, W, H, cx + rt, yt - rt - 3, 3, 4, skin)
      rect(px, W, H, cx - rt - 2, yt - rt - 8, 3, 5, skin)
      rect(px, W, H, cx + rt, yt - rt - 8, 3, 5, skin)
      rect(px, W, H, cx - W * 0.35, yb + rb * 0.55, W * 0.7, 3, skin)
      rect(px, W, H, cx - W * 0.35, yb + rb * 0.55 + 3, W * 0.7, 1, 0xd9a07c)
    },
  }
}

// --- pressure washing -------------------------------------------------------------

const pressure: Maker = (W, H, rng) => {
  const dirt = new Float32Array(W * H)
  const wet = new Float32Array(W * H)
  let seed = irand(rng, 1e6)
  let brick = false
  let tx = 0
  let ty = 0
  let dir = 1
  let phase = 0
  let t = 0
  const band = 4
  const top = 4

  function soil() {
    seed = irand(rng, 1e6)
    brick = !brick
    for (let y = 0; y < H; y++)
      for (let x = 0; x < W; x++) {
        const blob = hash(x >> 2, y >> 2, seed)
        dirt[y * W + x] = blob > 0.3 ? 1 : 0.75
        wet[y * W + x] = 0
      }
    tx = 0
    ty = top
    dir = 1
  }
  soil()
  const stone = (x: number, y: number) => {
    const s = 6
    const row = Math.floor(y / s)
    const off = brick && row % 2 ? s / 2 : 0
    const col = Math.floor((x + off) / s)
    if (y % s === 0 || (x + off) % s === 0) return 0xc9c1b4
    const k = hash(col, row, 7)
    return mix(0xd8b48a, 0xb9a48f, k)
  }

  return {
    step() {
      t++
      for (let i = 0; i < W * H; i++) if (wet[i]! > 0) wet[i] = Math.max(0, wet[i]! - 0.006)
      if (phase === 0) {
        tx += dir * 1.1
        if (tx > W + 1 || tx < -2) {
          dir = -dir
          ty += band
          if (ty > H) {
            phase = 1
            t = 0
          }
        }
        for (let y = Math.floor(ty - 3); y <= ty + 3; y++)
          for (let x = Math.floor(tx - 3); x <= tx + 3; x++) {
            if (x < 0 || y < 0 || x >= W || y >= H) continue
            const d = Math.hypot(x - tx, y - ty)
            if (d > 2.8) continue
            const i = y * W + x
            if (dirt[i]! > 0) {
              dirt[i] = Math.max(0, dirt[i]! - (d < 1.5 ? 0.6 : 0.3))
              wet[i] = 1
            }
          }
        if (ty < 2) for (let i = 0; i < W * top; i++) dirt[i] = 0
      } else if (phase === 1 && t > 50) {
        phase = 2
        t = 0
      } else if (phase === 2) {
        if (t > 30) {
          soil()
          phase = 0
        }
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = y * W + x
          let c = stone(x, y)
          const w = wet[i]!
          if (w > 0.5) c = scale(c, 0.72)
          else if (w > 0.15) c = scale(c, 0.85)
          let d = dirt[i]!
          if (phase === 2) d = Math.max(d, (t / 30) * (hash(x >> 2, y >> 2, seed) > 0.3 ? 1 : 0.75))
          const q = Math.ceil(d * 3) / 3
          if (q > 0) c = mix(c, (x + y * 3) % 7 === 0 ? 0x2f3320 : 0x4a4630, q * 0.85)
          px[i] = c
        }
      if (phase === 0) {
        for (let k = 0; k < 6; k++) {
          const f = k / 6
          dot(px, W, H, tx + 3 - f * 3 + (hash(k, t, 1) - 0.5), ty + 5 - f * 5 + (hash(t, k, 2) - 0.5), mix(0xe8f6ff, 0xffffff, f))
        }
        line(px, W, H, tx + 3, ty + 6, tx + 8, ty + 14, 0x30343a)
        dot(px, W, H, tx + 3, ty + 5, 0xffd23a)
      } else if (phase === 1 && t % 10 < 5) {
        dot(px, W, H, (t * 7) % W, (t * 13) % H, 0xffffff)
      }
    },
  }
}

// --- carpet cleaning --------------------------------------------------------------

const carpet: Maker = (W, H, rng) => {
  const dirt = new Uint8Array(W * H)
  const head = 5
  const y0 = 4
  const y1 = H - 5
  let seed = 0
  let band = 0
  let hy = 0
  let phase = 0
  let t = 0
  let palette: number[] = []

  function soil() {
    seed = irand(rng, 1e6)
    const h = rng()
    palette = [hsv(h, 0.75, 0.55), hsv(h + 0.55, 0.6, 0.35), 0xe8c060, hsv(h + 0.08, 0.5, 0.8), 0xf4ead2]
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) dirt[y * W + x] = hash(x >> 1, y >> 1, seed) > 0.25 ? 2 : 1
    band = 0
    hy = y0 - 4
    phase = 0
  }
  soil()
  const pattern = (x: number, y: number) => {
    if (y < y0 || y > y1) return (y === y0 - 1 || y === y1 + 1) && x % 2 === 0 ? 0xf4ead2 : -1
    const bx = Math.min(x - 1, W - 2 - x)
    const by = Math.min(y - y0, y1 - y)
    const b = Math.min(bx, by)
    if (b < 0) return -1
    if (b === 0) return palette[1] as number
    if (b === 1) return palette[2] as number
    if (b === 2) return (x + y) % 3 === 0 ? (palette[4] as number) : (palette[1] as number)
    const dx = Math.abs(x - (W - 1) / 2) / (W * 0.32)
    const dy = Math.abs(y - (y0 + y1) / 2) / ((y1 - y0) * 0.32)
    const d = dx + dy
    if (d < 0.35) return palette[2] as number
    if (d < 0.7) return d < 0.45 ? (palette[4] as number) : (palette[1] as number)
    if (d < 0.8) return palette[2] as number
    if ((x + y) % 4 === 0 && (x - y) % 4 === 0) return palette[3] as number
    return palette[0] as number
  }

  return {
    step() {
      t++
      if (phase === 0) {
        hy += 1.1
        for (let y = Math.max(0, Math.floor(hy - 1)); y <= Math.min(H - 1, hy + 1); y++)
          for (let x = band * head; x < Math.min(W, band * head + head + 1); x++) dirt[y * W + x] = 0
        if (hy > y1 + 3) {
          band++
          hy = y0 - 4
          if (band * head >= W) {
            phase = 1
            t = 0
          }
        }
      } else if (phase === 1 && t > 60) soil()
    },
    draw(px) {
      px.fill(0x8a6f58)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x + y * 2) % 9 === 0) px[y * W + x] = 0x7d634e
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const c = pattern(x, y)
          if (c < 0) continue
          const d = dirt[y * W + x]!
          px[y * W + x] = d === 2 ? mix(c, 0x5a4a36, 0.72) : d === 1 ? mix(c, 0x6a5840, 0.55) : c
        }
      if (phase === 0) {
        const hx = band * head
        rect(px, W, H, hx, hy - 1, head + 1, 3, 0x3a3f46)
        rect(px, W, H, hx, hy + 2, head + 1, 1, 0xbfd8e6)
        line(px, W, H, hx + head / 2, hy - 1, hx + head / 2 + 2, -2, 0x5a6068)
      } else if (t % 12 < 6) dot(px, W, H, (t * 5) % W, y0 + ((t * 11) % (y1 - y0)), 0xffffff)
    },
  }
}

// --- perfect fit ------------------------------------------------------------------

const SHAPES: string[][] = [
  ['xxxxxxx', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx'],
  ['..xxx..', '.xxxxx.', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..'],
  ['...x...', '..xxx..', '..xxx..', '.xxxxx.', '.xxxxx.', 'xxxxxxx', 'xxxxxxx'],
  ['...x...', '..xxx..', 'xxxxxxx', '.xxxxx.', '..xxx..', '.xx.xx.', 'xx...xx'],
  ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'],
  ['..xxx..', '..xxx..', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '..xxx..', '..xxx..'],
  ['...x...', '..xxx..', '.xxxxx.', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...'],
  ['..xxx..', '.xxxxx.', 'xxxxxxx', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..'],
]

const perfect: Maker = (W, H, rng) => {
  const n = 7
  const cols = Math.max(1, Math.min(3, Math.floor((W - 2) / (n + 2))))
  const gx = (W - cols * n) / (cols + 1)
  const by = Math.round(H * 0.5)
  const rows = 2
  type Hole = { x: number; y: number; s: number; c: number; filled: boolean }
  let holes: Hole[] = []
  let cur = 0
  let sx = 0
  let sy = 0
  let phase = 0
  let t = 0
  let flash = 0
  let fake = -1

  function deal() {
    const kinds = shuffle(rng, SHAPES.map((_, i) => i)).slice(0, cols * rows)
    holes = kinds.map((s, i) => ({
      x: Math.round(gx + (i % cols) * (n + gx)),
      y: by + 3 + Math.floor(i / cols) * (n + 4),
      s,
      c: hsv(rng(), 0.7, 0.95),
      filled: false,
    }))
    shuffle(rng, holes)
    cur = 0
    begin()
  }
  function begin() {
    sx = rng() * (W - n)
    sy = -n
    phase = 0
    t = 0
    fake = rng() < 0.35 ? irand(rng, holes.length) : -1
    if (fake === cur) fake = -1
  }
  deal()

  return {
    step() {
      t++
      if (flash > 0) flash--
      const h = holes[cur]
      if (!h) {
        if (t > 50) deal()
        return
      }
      const target = phase === 0 && fake >= 0 ? (holes[fake] as Hole) : h
      if (phase === 0) {
        sx += (target.x - sx) * 0.12
        sy = Math.min(sy + 0.8, target.y - n - 2)
        if (Math.abs(sx - target.x) < 0.3 && sy >= target.y - n - 2) {
          if (fake >= 0) {
            phase = 1
            t = 0
          } else phase = 2
        }
      } else if (phase === 1) {
        sy = target.y - n - 2 - Math.abs(Math.sin(t * 0.5)) * 2
        if (t > 16) {
          fake = -1
          phase = 0
        }
      } else if (phase === 2) {
        sy += 0.6
        if (sy >= h.y) {
          h.filled = true
          flash = 6
          cur++
          t = 0
          if (holes[cur]) begin()
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x283048, 0x4a5a7a)
      rect(px, W, H, 1, by, W - 2, rows * (n + 4) + 3, 0xd8b07a)
      rect(px, W, H, 1, by, W - 2, 1, 0xf0d0a0)
      rect(px, W, H, 1, by + rows * (n + 4) + 2, W - 2, 1, 0xa87c4c)
      for (const [i, h] of holes.entries()) {
        const rows7 = SHAPES[h.s] as string[]
        litSprite(px, W, H, h.x, h.y, rows7, { x: h.filled ? h.c : 0x5a3e22 })
        if (!h.filled) litSprite(px, W, H, h.x, h.y, [rows7[0] as string], { x: 0x3a2814 })
        else if (flash > 0 && i === cur - 1) litSprite(px, W, H, h.x, h.y, rows7, { x: mix(h.c, 0xffffff, flash / 7) })
      }
      const h = holes[cur]
      if (h) {
        const rows7 = SHAPES[h.s] as string[]
        litSprite(px, W, H, sx, sy + 1, rows7, { x: 0x1a2030 })
        litSprite(px, W, H, sx, sy, rows7, { x: h.c })
        litSprite(px, W, H, sx, sy, [rows7[0] as string, rows7[1] as string], { x: mix(h.c, 0xffffff, 0.3) })
      }
      text(px, W, H, 1, 1, String(holes.filter(q => q.filled).length), 0xffffff)
    },
  }
}

// --- laser rust removal -----------------------------------------------------------

const laser: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.45
  const R = Math.min(W, H) * 0.42
  let kind = 0
  let seed = 0
  let sy = 0
  let spot = 0
  let sdir = 1
  let phase = 0
  let t = 0
  let sparks: { x: number; y: number; vx: number; vy: number; l: number }[] = []

  const inside = (x: number, y: number) => {
    const dx = x - cx
    const dy = y - cy
    const d = Math.hypot(dx, dy)
    if (kind === 0) {
      const a = Math.atan2(dy, dx)
      const tooth = Math.cos(a * 8) > 0.2 ? 1 : 0
      return d < R * 0.78 + tooth * R * 0.2 && d > R * 0.22
    }
    return d < R * 0.95
  }
  const metal = (x: number, y: number) => {
    const dx = x - cx
    const dy = y - cy
    const d = Math.hypot(dx, dy)
    const lit = (-dx - dy) / (R * 1.4)
    let c = mix(0x8a929c, 0xe6ebf0, clamp(0.5 + lit, 0, 1))
    if (kind === 0 && d < R * 0.4) c = scale(c, 0.85)
    if (kind === 1) {
      if (Math.abs(d - R * 0.8) < 0.7) c = scale(c, 0.7)
      const a = Math.atan2(dy, dx) + Math.PI / 2
      const star = R * 0.5 * (0.55 + 0.45 * Math.cos(a * 5))
      if (d < star) c = mix(c, 0xffffff, 0.25)
    }
    return Math.round(clamp(0.5 + lit, 0, 1) * 3) % 2 && (x + y) % 5 === 0 ? mix(c, 0xffffff, 0.15) : c
  }
  const rust = (x: number, y: number) => {
    const k = hash(x >> 1, y >> 1, seed)
    return k > 0.66 ? 0x8a3c14 : k > 0.25 ? 0xa65a22 : 0x6e3a1e
  }
  function next() {
    kind = (kind + 1) % 2
    seed = irand(rng, 1e6)
    sy = cy - R - 2
    phase = 0
    t = 0
  }
  next()

  return {
    step() {
      t++
      sparks = sparks.filter(s => --s.l > 0)
      for (const s of sparks) {
        s.x += s.vx
        s.y += s.vy
        s.vy += 0.1
      }
      if (phase === 0) {
        spot += sdir * 3
        if (spot > W + 2 || spot < -2) sdir = -sdir
        sy += 0.22
        if (inside(spot, sy)) for (let k = 0; k < 2; k++) sparks.push({ x: spot, y: sy, vx: (rng() - 0.5) * 1.6, vy: -rng() * 1.2, l: 6 + irand(rng, 5) })
        if (sy > cy + R + 2) {
          phase = 1
          t = 0
        }
      } else if (phase === 1 && t > 60) next()
    },
    draw(px) {
      sky(px, W, H, 0x1a1d24, 0x2c3038)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          if (!inside(x, y)) continue
          px[y * W + x] = y < sy ? metal(x, y) : rust(x, y)
        }
      if (phase === 0) {
        for (let x = 0; x < W; x++) if (inside(x, sy)) dot(px, W, H, x, sy, mix(0x6af0ff, 0xffffff, 0.3))
        dot(px, W, H, spot, sy, 0xffffff)
        dot(px, W, H, spot - sdir, sy, 0xb8f8ff)
      } else {
        const g = (t * 1.2) % (W + H)
        for (let y = 0; y < H; y++) {
          const x = g - y * 0.6
          if (inside(x, y)) dot(px, W, H, x, y, 0xffffff)
        }
      }
      for (const s of sparks) dot(px, W, H, s.x, s.y, s.l > 5 ? 0xfff2a0 : 0xff9a30)
      rect(px, W, H, 0, H - 6, W, 5, 0x3a3f48)
    },
  }
}

// --- ball sort puzzle -------------------------------------------------------------

const ballsort: Maker = (W, H, rng) => {
  const C = W >= 26 ? 4 : 3
  const cap = 4
  const T = C + 2
  const pitch = Math.floor(W / T)
  const ox = Math.floor((W - pitch * T) / 2) + Math.floor(pitch / 2)
  const tubeTop = Math.round(H * 0.35)
  const ball = 3
  const bottom = tubeTop + cap * ball + 2
  const colours = [0xff4d6d, 0x3ab0ff, 0xffd23a, 0x5ad66a, 0xb06aff]
  let tubes: number[][] = []
  let moves: [number, number][] = []
  let mi = 0
  let anim: { from: number; to: number; c: number; t: number } | undefined
  let done = 0
  let count = 0

  const key = (s: number[][]) => s.map(t => t.join('')).sort().join('|')
  function solve(start: number[][]): [number, number][] | undefined {
    const seen = new Set<string>()
    const path: [number, number][] = []
    const st = start.map(t => t.slice())
    const solved = () => st.every(t => t.length === 0 || (t.length === cap && t.every(c => c === t[0])))
    function dfs(depth: number): boolean {
      if (solved()) return true
      if (depth > 60) return false
      const k = key(st)
      if (seen.has(k)) return false
      seen.add(k)
      if (seen.size > 20000) return false
      for (let a = 0; a < T; a++) {
        const A = st[a] as number[]
        if (!A.length) continue
        if (A.length === cap && A.every(c => c === A[0])) continue
        const top = A[A.length - 1] as number
        for (let b = 0; b < T; b++) {
          const B = st[b] as number[]
          if (a === b || B.length >= cap) continue
          if (B.length && B[B.length - 1] !== top) continue
          if (!B.length && A.every(c => c === top)) continue
          B.push(A.pop() as number)
          path.push([a, b])
          if (dfs(depth + 1)) return true
          path.pop()
          A.push(B.pop() as number)
        }
      }
      return false
    }
    return dfs(0) ? path : undefined
  }
  function deal() {
    for (;;) {
      const balls = shuffle(rng, Array.from({ length: C * cap }, (_, i) => Math.floor(i / cap)))
      tubes = Array.from({ length: T }, (_, i) => (i < C ? balls.slice(i * cap, i * cap + cap) : []))
      const path = solve(tubes)
      if (path && path.length > 6) {
        moves = path
        break
      }
    }
    mi = 0
    count = 0
  }
  deal()
  const tx = (i: number) => ox + i * pitch
  const slotY = (n: number) => bottom - 2 - n * ball

  return {
    step() {
      if (done > 0) {
        if (--done === 0) deal()
        return
      }
      if (!anim) {
        const m = moves[mi]
        if (!m) {
          done = 60
          return
        }
        const c = (tubes[m[0]] as number[]).pop() as number
        anim = { from: m[0], to: m[1], c, t: 0 }
        return
      }
      anim.t++
      if (anim.t >= 22) {
        ;(tubes[anim.to] as number[]).push(anim.c)
        anim = undefined
        mi++
        count++
      }
    },
    draw(px) {
      // a soft glow behind the tubes
      sky(px, W, H, 0x22183e, 0x4a2e6a)
      ellipse(px, W, H, W / 2, bottom - cap * ball * 0.4, W * 0.6, cap * ball + 6, 0x3a2a5e)
      for (let i = 0; i < T; i++) {
        const x = tx(i)
        // the glass: a faint back, a bright left wall, a dimmer right wall, a rounded base
        for (let y = tubeTop; y < bottom; y++) for (let k = -1; k <= 1; k++) px[y * W + Math.round(x + k)] = mix(px[y * W + Math.round(x + k)] as number, 0xc8d8ff, 0.12)
        rect(px, W, H, x - 2, tubeTop, 1, cap * ball + 2, 0xe8f0ff)
        rect(px, W, H, x + 2, tubeTop, 1, cap * ball + 2, 0x8a9ac8)
        rect(px, W, H, x - 1, bottom, 3, 1, 0xa8b8e8)
        dot(px, W, H, x - 2, tubeTop - 1, 0xffffff)
        dot(px, W, H, x + 2, tubeTop - 1, 0xb8c8f0)
        const tube = tubes[i] as number[]
        const full = tube.length === cap && tube.every(c => c === tube[0])
        tube.forEach((c, n) => lit(px, W, H, x, slotY(n), 1.4, 1.4, full && done % 10 < 5 && done > 0 ? 0xffffff : (colours[c] as number)))
      }
      if (anim) {
        const lift = tubeTop - 4
        const fromY = slotY((tubes[anim.from] as number[]).length)
        const toY = slotY((tubes[anim.to] as number[]).length)
        const t = anim.t
        let x = tx(anim.from)
        let y = fromY
        if (t < 7) y = fromY + (lift - fromY) * (t / 7)
        else if (t < 15) {
          y = lift
          x = tx(anim.from) + (tx(anim.to) - tx(anim.from)) * ((t - 7) / 8)
        } else {
          x = tx(anim.to)
          y = lift + (toY - lift) * ((t - 15) / 7)
        }
        lit(px, W, H, x, y, 1.4, 1.4, colours[anim.c] as number)
      }
      text(px, W, H, 1, 1, String(count), 0xffffff)
    },
  }
}

// --- paint-bucket colouring -------------------------------------------------------

const bucket: Maker = (W, H, rng) => {
  const ink = new Uint8Array(W * H)
  const region = new Int32Array(W * H)
  const dist = new Int32Array(W * H)
  let colours: number[] = []
  let order: { id: number; sx: number; sy: number; size: number }[] = []
  let k = 0
  let fill = 0
  let pic = irand(rng, 3)
  let hold = 0
  let cursor = [W / 2, H / 2]
  const filled = new Set<number>()

  const plot = (x: number, y: number) => {
    x = Math.round(x)
    y = Math.round(y)
    if (x >= 0 && y >= 0 && x < W && y < H) ink[y * W + x] = 1
  }
  const seg = (x0: number, y0: number, x1: number, y1: number) => {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))))
    for (let i = 0; i <= n; i++) plot(x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n)
  }
  const circle = (cx: number, cy: number, r: number) => {
    const n = Math.max(8, Math.ceil(r * 8))
    for (let i = 0; i <= n; i++) {
      const a = (i / n) * Math.PI * 2
      plot(cx + Math.cos(a) * r, cy + Math.sin(a) * r)
    }
  }

  function draw() {
    ink.fill(0)
    const x0 = 1
    const y0 = 3
    const x1 = W - 2
    const y1 = H - 4
    seg(x0, y0, x1, y0)
    seg(x1, y0, x1, y1)
    seg(x1, y1, x0, y1)
    seg(x0, y1, x0, y0)
    const cx = W / 2
    const cy = (y0 + y1) / 2
    if (pic === 0) {
      for (let i = 0; i < 5; i++) seg(x0, y0 + rng() * (y1 - y0), x1, y0 + rng() * (y1 - y0))
      seg(x0 + rng() * (x1 - x0), y0, x0 + rng() * (x1 - x0), y1)
      circle(cx, cy, W * 0.22)
    } else if (pic === 1) {
      for (const r of [W * 0.12, W * 0.26, W * 0.4]) circle(cx, cy, r)
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2
        seg(cx + Math.cos(a) * W * 0.12, cy + Math.sin(a) * W * 0.12, cx + Math.cos(a) * W * 0.4, cy + Math.sin(a) * W * 0.4)
      }
      seg(x0, cy, cx - W * 0.4, cy)
      seg(x1, cy, cx + W * 0.4, cy)
    } else {
      const g = y0 + (y1 - y0) * 0.68
      seg(x0, g, x1, g)
      const hx0 = W * 0.2
      const hx1 = W * 0.8
      const hy = g - (y1 - y0) * 0.26
      seg(hx0, g, hx0, hy)
      seg(hx1, g, hx1, hy)
      seg(hx0, hy, hx1, hy)
      seg(hx0 - 1, hy, cx, hy - (y1 - y0) * 0.18)
      seg(hx1 + 1, hy, cx, hy - (y1 - y0) * 0.18)
      seg(cx - 2, g, cx - 2, g - 6)
      seg(cx + 2, g, cx + 2, g - 6)
      seg(cx - 2, g - 6, cx + 2, g - 6)
      circle(W * 0.78, y0 + 6, 3)
      seg(x0, g + 6, x1, g + 4)
    }
    // regions, by flood fill
    region.fill(-1)
    order = []
    let id = 0
    for (let s = 0; s < W * H; s++) {
      if (ink[s] || region[s]! >= 0) continue
      const q = [s]
      region[s] = id
      let size = 0
      let sx = 0
      let sy = 0
      for (let qi = 0; qi < q.length; qi++) {
        const p = q[qi] as number
        size++
        sx += p % W
        sy += Math.floor(p / W)
        const x = p % W
        for (const n of [p - 1, p + 1, p - W, p + W]) {
          if (n < 0 || n >= W * H || ink[n] || region[n]! >= 0) continue
          if ((n === p - 1 && x === 0) || (n === p + 1 && x === W - 1)) continue
          region[n] = id
          q.push(n)
        }
      }
      // a seed inside the region: the cell nearest its centre of mass
      const mx = sx / size
      const my = sy / size
      let best = s
      let bd = Infinity
      for (const p of q) {
        const d = (p % W - mx) ** 2 + (Math.floor(p / W) - my) ** 2
        if (d < bd) {
          bd = d
          best = p
        }
      }
      order.push({ id, sx: best % W, sy: Math.floor(best / W), size })
      id++
    }
    const base = rng()
    colours = order.map(o => (pic === 2 ? hsv(base + (o.sy / H) * 0.6, 0.55, 0.95) : hsv(base + o.id * 0.13 + rng() * 0.05, 0.6, 0.95)))
    order = shuffle(rng, order.filter(o => o.size > 1))
    if (pic === 2) order.sort((a, b) => b.size - a.size)
    k = 0
    fill = -1
    filled.clear()
  }
  draw()

  function measure(o: { id: number; sx: number; sy: number }) {
    dist.fill(-1)
    const start = o.sy * W + o.sx
    dist[start] = 0
    const q = [start]
    for (let qi = 0; qi < q.length; qi++) {
      const p = q[qi] as number
      const x = p % W
      for (const n of [p - 1, p + 1, p - W, p + W]) {
        if (n < 0 || n >= W * H || region[n] !== o.id || dist[n]! >= 0) continue
        if ((n === p - 1 && x === 0) || (n === p + 1 && x === W - 1)) continue
        dist[n] = dist[p]! + 1
        q.push(n)
      }
    }
  }

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          pic = (pic + 1) % 3
          draw()
        }
        return
      }
      const o = order[k]
      if (!o) {
        hold = 50
        return
      }
      if (fill < 0) {
        cursor[0]! += (o.sx - cursor[0]!) * 0.3
        cursor[1]! += (o.sy - cursor[1]!) * 0.3
        if (Math.hypot(o.sx - cursor[0]!, o.sy - cursor[1]!) < 0.8) {
          measure(o)
          fill = 0
        }
        return
      }
      fill += 1.6
      if (fill > 60) {
        filled.add(o.id)
        fill = -1
        k++
      }
    },
    draw(px) {
      const cur = order[k]
      for (let p = 0; p < W * H; p++) {
        if (ink[p]) {
          px[p] = 0x22243a
          continue
        }
        const r = region[p]!
        if (filled.has(r) || (cur && fill >= 0 && r === cur.id && dist[p]! <= fill)) px[p] = colours[r] as number
        else px[p] = 0xfaf6ee
      }
      if (hold > 0 && hold % 12 < 6) for (let x = 0; x < W; x += 5) dot(px, W, H, x + (hold % 5), 2, 0xffffff)
      if (cur && fill < 0) {
        const [x, y] = cursor as [number, number]
        litSprite(px, W, H, x - 1, y - 4, ['.xxx.', 'xccc.', 'xcccx', '.xxx.'], { x: 0x22243a, c: colours[cur.id] as number })
        dot(px, W, H, x, y, 0x22243a)
      }
    },
  }
}

// --- peeling the screen film ------------------------------------------------------

const film: Maker = (W, H, rng) => {
  const x0 = Math.round(W * 0.14)
  const y0 = Math.round(H * 0.07)
  const w = W - 2 * x0
  const h = Math.round(H * 0.82)
  let p = -6
  let phase = 0
  let t = 0
  let hue = rng()
  let slide = 0
  const bubbles = Array.from({ length: 5 }, () => [rng(), rng(), 1 + rng() * 1.5] as [number, number, number])

  const screen = (x: number, y: number) => {
    const u = x - x0 - 2
    const v = y - y0 - 4
    let c = mix(hsv(hue, 0.6, 0.55), hsv(hue + 0.15, 0.7, 0.9), v / h)
    const pitch = Math.max(4, Math.floor((w - 4) / 4))
    const iu = Math.floor(u / pitch)
    const iv = Math.floor((v - 8) / pitch)
    if (v >= 8 && iv < 4 && iu < 4 && u % pitch < pitch - 2 && (v - 8) % pitch < pitch - 2) c = hsv(hue + iu * 0.21 + iv * 0.37, 0.65, 1)
    return c
  }
  const inScreen = (x: number, y: number) => x >= x0 + 1 && x < x0 + w - 1 && y >= y0 + 2 && y < y0 + h - 2

  return {
    step() {
      t++
      if (phase === 0) {
        if (t > 20) p += 0.7
        if (p > w + h + 8) {
          phase = 1
          t = 0
        }
      } else if (phase === 1 && t > 40) {
        phase = 2
        t = 0
        slide = 0
        hue = (hue + 0.3) % 1
      } else if (phase === 2) {
        slide += 1.5
        if (slide > h + 4) {
          phase = 0
          p = -6
          t = 0
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0xe9edf2, 0xc5ccd6)
      rect(px, W, H, x0, y0, w, h, 0x15171c)
      dot(px, W, H, x0, y0, 0xe9edf2)
      dot(px, W, H, x0 + w - 1, y0, 0xe9edf2)
      dot(px, W, H, x0, y0 + h - 1, 0xc5ccd6)
      dot(px, W, H, x0 + w - 1, y0 + h - 1, 0xc5ccd6)
      for (let y = y0; y < y0 + h; y++)
        for (let x = x0; x < x0 + w; x++) {
          if (!inScreen(x, y)) continue
          let c = screen(x, y)
          const s = x - x0 + (y - y0)
          const covered = phase === 0 ? s >= p : phase === 2 ? y - y0 < slide : false
          if (covered) {
            c = mix(c, 0xdde6ef, 0.55)
            for (const [bu, bv, br] of bubbles) if (Math.abs(Math.hypot(x - x0 - bu * w, y - y0 - bv * h) - br) < 0.5) c = mix(c, 0xffffff, 0.6)
          }
          px[y * W + x] = c
        }
      if (phase === 0 || phase === 2) text(px, W, H, x0 + w / 2 - 7, y0 + 3, '9:41', 0xffffff)
      if (phase === 0) {
        if (p < 0) rect(px, W, H, x0 - 1, y0 - 1, 3, 3, 0x3ab0ff)
        for (let y = y0; y < y0 + h; y++)
          for (let x = x0; x < x0 + w; x++) {
            const s = x - x0 + (y - y0)
            const d = s - p
            if (d < 0 || d > 6) continue
            const u = p - (y - y0)
            const v = p - (x - x0)
            if (u < 0 || v < 0 || u >= w || v >= h) continue
            px[y * W + x] = mix(0xffffff, 0xaab8c8, d / 6)
          }
      }
      if (phase === 1 && t < 30) {
        const g = t * 2.5
        for (let y = y0; y < y0 + h; y++) {
          const x = x0 + g - (y - y0) * 0.5
          if (inScreen(x, y)) dot(px, W, H, x, y, 0xffffff)
        }
      }
    },
  }
}

// --- wood planer shavings ---------------------------------------------------------

const planer: Maker = (W, H, rng) => {
  const benchY = Math.round(H * 0.7)
  const thick = Math.max(5, Math.round(H * 0.2))
  const top0 = benchY - thick
  const floorY = H - 5
  const passes = 3
  const cut = new Float32Array(W)
  let pass = 0
  let bx = -14
  let back = false
  let hold = 0
  let seed = irand(rng, 1e6)
  let curls: { x: number; y: number; vy: number; a: number; rest: boolean }[] = []

  const grain = (x: number, y: number) => {
    const w = Math.sin(x * 0.3 + y * 1.1 + Math.sin(x * 0.11 + seed) * 2.5)
    return w > 0.65 ? 0xb87a44 : w < -0.75 ? 0xf0c28a : 0xdca468
  }
  const spiral = (px: Uint32Array, cx: number, cy: number, len: number, a0: number) => {
    for (let i = 0; i < len * 3; i++) {
      const u = i / 3
      const a = a0 + u * 0.55
      const r = 4.2 - u * 0.16
      if (r < 0.6) break
      dot(px, W, H, cx + Math.cos(a) * r, cy + Math.sin(a) * r, u % 4 < 1 ? 0xc88a52 : 0xf6d29c)
    }
  }

  return {
    step() {
      for (const c of curls) {
        if (c.rest) continue
        c.vy += 0.15
        c.y += c.vy
        c.x += 0.3
        c.a += 0.25
        if (c.y > floorY - 3) {
          c.y = floorY - 3
          c.rest = true
        }
      }
      if (hold > 0) {
        if (--hold === 0) {
          cut.fill(0)
          pass = 0
          seed = irand(rng, 1e6)
          curls = curls.slice(-3)
        }
        return
      }
      if (back) {
        bx -= 2.5
        if (bx < -14) {
          back = false
          pass++
          if (pass >= passes) hold = 70
        }
        return
      }
      bx += 0.7
      const mouth = Math.round(bx + 8)
      if (mouth >= 0 && mouth < W) cut[mouth] = pass + 1
      if (bx > W) {
        back = true
        curls.push({ x: W - 5, y: top0 - 6, vy: -0.6, a: 0, rest: false })
        if (curls.length > 7) curls.shift()
      }
    },
    draw(px) {
      px.fill(0x7a5a40)
      for (let y = 2; y < benchY; y += 4) for (let x = 2; x < W; x += 4) dot(px, W, H, x, y, 0x5a4230)
      rect(px, W, H, 0, floorY, W, H - floorY, 0x4a3628)
      slab(px, W, H, 0, benchY, W, 3, 0x8a5a32)
      rect(px, W, H, 1, benchY + 3, 3, floorY - benchY - 3, 0x6a4426)
      rect(px, W, H, W - 4, benchY + 3, 3, floorY - benchY - 3, 0x6a4426)
      for (let x = 0; x < W; x++) {
        const depth = cut[x]!
        for (let y = top0 + depth; y < benchY; y++) {
          let c = grain(x, y)
          const old = y < top0 + passes
          if (old) c = hash(x, y, seed) > 0.75 ? 0x55504a : 0x8a847c
          if (y === top0 + depth && depth > 0) c = depth >= passes ? 0xffe2b4 : mix(c, 0xffe2b4, 0.4)
          if (x === W - 1) c = scale(c, 0.8)
          dot(px, W, H, x, y, c)
        }
      }
      if (!back && hold === 0) {
        const y = top0 + pass - 4
        slab(px, W, H, bx, y + 1, 13, 3, 0x3e5266)
        rect(px, W, H, bx, y + 3, 13, 1, 0x26323e)
        rect(px, W, H, bx + 1, y + 1, 11, 1, 0x5a7288)
        rect(px, W, H, bx + 1, y - 3, 3, 4, 0x8a3a1e)
        rect(px, W, H, bx + 2, y - 4, 2, 1, 0xa84a26)
        rect(px, W, H, bx + 10, y - 1, 2, 2, 0x8a3a1e)
        line(px, W, H, bx + 6, y + 1, bx + 8, y - 3, 0xc8d0d8)
        line(px, W, H, bx + 7, y + 1, bx + 9, y - 3, 0x9aa4ae)
        const len = clamp((bx + 8) / 3, 0, 10)
        spiral(px, bx + 10, y - 5, len, bx * 0.25)
      }
      for (const c of curls) spiral(px, c.x, c.y, 9, c.a)
    },
  }
}

// --- bubble wrap ------------------------------------------------------------------

const bubblewrap: Maker = (W, H, rng) => {
  const pitch = 5
  const cols = Math.max(1, Math.floor((W - 2) / pitch))
  const rows = Math.max(1, Math.floor((H - 12) / pitch))
  const ox = Math.floor((W - cols * pitch) / 2) + 2
  const oy = 8
  const popped = new Int32Array(cols * rows)
  let order: number[] = []
  let k = 0
  let timer = 0
  let slide = 0
  let mode = 0
  let count = 0

  function sheet() {
    popped.fill(0)
    const ids = Array.from({ length: cols * rows }, (_, i) => i)
    if (mode === 0) order = shuffle(rng, ids)
    else if (mode === 1) order = ids.map(i => (Math.floor(i / cols) % 2 ? Math.floor(i / cols) * cols + (cols - 1 - (i % cols)) : i))
    else order = ids.sort((a, b) => Math.hypot((a % cols) - cols / 2, Math.floor(a / cols) - rows / 2) - Math.hypot((b % cols) - cols / 2, Math.floor(b / cols) - rows / 2))
    mode = (mode + 1) % 3
    k = 0
    timer = 10
  }
  sheet()

  return {
    step() {
      for (let i = 0; i < popped.length; i++) if (popped[i]! > 0 && popped[i]! < 6) popped[i]!++
      if (slide > 0) {
        slide -= 2
        if (slide <= 0) {
          slide = 0
          sheet()
        }
        return
      }
      if (--timer > 0) return
      const id = order[k]
      if (id === undefined) {
        slide = H
        return
      }
      popped[id] = 1
      count++
      k++
      const speed = Math.min(1, k / 20)
      timer = Math.max(2, Math.round(7 - speed * 5)) + (rng() < 0.1 ? 8 : 0)
    },
    draw(px) {
      sky(px, W, H, 0xffe4ec, 0xe4ecff)
      const off = slide > 0 ? -(H - slide) : 0
      rect(px, W, H, 1, oy - 3 + off, W - 2, rows * pitch + 4, 0xd6e9f6)
      for (let i = 0; i < cols * rows; i++) {
        const cx = ox + (i % cols) * pitch
        const cy = oy + Math.floor(i / cols) * pitch + off
        const p = popped[i]!
        if (p === 0) {
          lit(px, W, H, cx, cy, 1.8, 1.8, 0xe4f0fc)
          dot(px, W, H, cx + 1, cy + 1, 0xb8d4ea)
          dot(px, W, H, cx - 1, cy - 1, 0xffffff)
        } else {
          dot(px, W, H, cx - 1, cy, 0xb0c8dc)
          dot(px, W, H, cx, cy, 0xa0bcd2)
          dot(px, W, H, cx + 1, cy - 1, 0xb0c8dc)
          if (p < 6) {
            const r = 1 + p * 0.5
            for (const [dx, dy] of [
              [1, 0],
              [-1, 0],
              [0, 1],
              [0, -1],
            ] as [number, number][])
              dot(px, W, H, cx + dx * r, cy + dy * r, 0xffffff)
          }
        }
      }
      const id = order[k]
      if (id !== undefined && slide === 0) {
        const cx = ox + (id % cols) * pitch
        const cy = oy + Math.floor(id / cols) * pitch
        const press = timer < 3 ? 1 : 0
        disc(px, W, H, cx + 1, cy + 2 + press - 3, 2, 0xf2b8a0)
        rect(px, W, H, cx, cy + press - 2, 3, 8, 0xf2b8a0)
        dot(px, W, H, cx + 1, cy + press - 3, 0xffd8c8)
      }
      text(px, W, H, 1, 1, String(count), 0x6a5a8a)
    },
  }
}

// --- fridge restock ---------------------------------------------------------------

const restock: Maker = (W, H, rng) => {
  const shelves = 4
  const top = 5
  const gap = Math.max(5, Math.floor((H - 18) / shelves))
  const kinds = [
    { w: 2, h: 4, top: 1 },
    { w: 2, h: 7, top: 2 },
    { w: 3, h: 3, top: 1 },
    { w: 2, h: 5, top: 1 },
  ]
  type Item = { x: number; y: number; k: number; c: number; t: number; sx: number; sy: number }
  let items: Item[] = []
  let queue: Item[] = []
  let timer = 0
  let door = 0
  let phase = 0

  function plan() {
    queue = []
    for (let s = 0; s < shelves; s++) {
      const k = (s + irand(rng, 4)) % 4
      const kind = kinds[k] as { w: number; h: number }
      const base = rng()
      const floorY = top + (s + 1) * gap
      const n = Math.floor((W - 4) / (kind.w + 1))
      for (let i = 0; i < n; i++) {
        const c = hsv(base + Math.floor((i * 3) / n) * 0.12, 0.7, 0.95)
        queue.push({ x: 2 + i * (kind.w + 1), y: floorY - kind.h, k, c, t: 0, sx: W + 4, sy: H })
      }
    }
    items = []
    timer = 0
  }
  plan()

  return {
    step() {
      for (const it of items) if (it.t < 1) it.t = Math.min(1, it.t + 0.09)
      if (phase === 0) {
        if (--timer <= 0 && queue.length) {
          items.push(queue.shift() as Item)
          timer = 3
        }
        if (!queue.length && items.every(i => i.t >= 1)) {
          phase = 1
          timer = 50
        }
      } else if (phase === 1) {
        if (--timer <= 0) phase = 2
      } else if (phase === 2) {
        door += 0.06
        if (door >= 1) {
          plan()
          phase = 3
        }
      } else if (phase === 3) {
        door -= 0.06
        if (door <= 0) {
          door = 0
          phase = 0
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0xf4f9ff, 0xd8e4ee)
      rect(px, W, H, 0, 0, W, 2, 0xffffff)
      rect(px, W, H, 2, 2, W - 4, 1, 0xfff8d8)
      for (let s = 0; s < shelves; s++) {
        const y = top + (s + 1) * gap
        rect(px, W, H, 0, y, W, 1, 0xa8d0e8)
        rect(px, W, H, 0, y + 1, W, 1, 0xc8e0f0)
      }
      const by = top + shelves * gap + 2
      rect(px, W, H, 1, by, W - 2, H - by - 2, 0xc8dcea)
      for (let x = 3; x < W - 3; x += 3) disc(px, W, H, x, by + 3, 1, x % 2 ? 0x5ac04a : 0xf08a30)
      for (const it of items) {
        const e = 1 - (1 - it.t) ** 3
        const x = it.sx + (it.x - it.sx) * e
        const y = it.sy + (it.y - it.sy) * e - Math.sin(e * Math.PI) * 6
        const kind = kinds[it.k] as { w: number; h: number; top: number }
        rect(px, W, H, x, y, kind.w, kind.h, it.c)
        rect(px, W, H, x, y, kind.w, kind.top, it.k === 2 ? 0xe0e0e0 : mix(it.c, 0xffffff, 0.45))
        if (it.k === 1) dot(px, W, H, x, y - 1, scale(it.c, 0.7))
        dot(px, W, H, x, y + kind.top, mix(it.c, 0xffffff, 0.5))
      }
      if (door > 0) {
        const dw = Math.round(W * door)
        rect(px, W, H, W - dw, 0, dw, H, 0xeef2f6)
        rect(px, W, H, W - dw, 0, 1, H, 0xb8c0c8)
        rect(px, W, H, W - dw + 2, H * 0.3, 1, H * 0.25, 0x9aa4ae)
      }
    },
  }
}

// --- lawn mowing stripes ----------------------------------------------------------

const lawn: Maker = (W, H, rng) => {
  const fence = 6
  const cut = new Int8Array(W * H).fill(-1)
  const mw = 4
  let vertical = true
  let lane = 0
  let pos = 0
  let phase = 0
  let t = 0
  let seed = irand(rng, 1e6)
  let clips: { x: number; y: number; vx: number; vy: number; l: number }[] = []

  const lanes = () => Math.ceil((vertical ? W : H - fence) / mw)
  const span = () => (vertical ? H - fence : W)

  return {
    step() {
      t++
      clips = clips.filter(c => --c.l > 0)
      for (const c of clips) {
        c.x += c.vx
        c.y += c.vy
      }
      if (phase === 0) {
        pos += 0.9
        const dir = lane % 2
        const a = Math.floor(pos)
        for (let k = 0; k < mw; k++) {
          const along = dir ? span() - 1 - a : a
          const across = lane * mw + k
          const x = vertical ? across : along
          const y = vertical ? fence + along : fence + across
          if (x >= 0 && y >= fence && x < W && y < H) cut[y * W + x] = dir
        }
        if (rng() < 0.5) {
          const along = dir ? span() - 1 - pos : pos
          const x = vertical ? lane * mw + mw : along
          const y = vertical ? fence + along : fence + lane * mw + mw
          clips.push({ x, y, vx: vertical ? 0.6 : (rng() - 0.5) * 0.6, vy: vertical ? (rng() - 0.5) * 0.6 : 0.6, l: 6 })
        }
        if (pos >= span()) {
          pos = 0
          lane++
          if (lane >= lanes()) {
            phase = 1
            t = 0
          }
        }
      } else if (phase === 1 && t > 50) {
        phase = 2
        t = 0
      } else if (phase === 2) {
        for (let n = 0; n < W; n++) cut[(fence + irand(rng, H - fence)) * W + irand(rng, W)] = -1
        if (t > 70) {
          cut.fill(-1)
          vertical = !vertical
          lane = 0
          pos = 0
          phase = 0
          seed = irand(rng, 1e6)
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x9fd4f0, 0xd8f0ff, fence)
      for (let x = 0; x < W; x++) {
        const post = x % 4 === 0
        for (let y = 1; y < fence; y++) if (post || y === 2 || y === 4) dot(px, W, H, x, y, post ? 0xc89a6a : 0xb08050)
      }
      for (let y = fence; y < H; y++)
        for (let x = 0; x < W; x++) {
          const c = cut[y * W + x]!
          let col: number
          if (c >= 0) col = (vertical ? c : 1 - c) ? 0x5cae48 : 0x7ccc5c
          else {
            const k = hash(x, y, seed)
            col = k > 0.92 ? 0x6aa040 : k > 0.985 ? 0xffe04a : 0x3e7a2c
            if (k > 0.993) col = 0xffffff
          }
          px[y * W + x] = col
        }
      for (const c of clips) dot(px, W, H, c.x, c.y, 0x8ee070)
      if (phase === 0) {
        const dir = lane % 2
        const along = dir ? span() - 1 - pos : pos
        const across = lane * mw
        const x = vertical ? across : along - (dir ? 0 : mw - 1)
        const y = vertical ? fence + along - (dir ? 0 : mw - 1) : fence + across
        slab(px, W, H, x, y, mw, mw, 0xd8382a)
        rect(px, W, H, x + 1, y + 1, mw - 2, mw - 2, 0x2a2a2a)
        if (vertical) line(px, W, H, x + mw / 2, dir ? y + mw : y - 1, x + mw / 2, dir ? y + mw + 3 : y - 4, 0x3a3a3a)
        else line(px, W, H, dir ? x + mw : x - 1, y + mw / 2, dir ? x + mw + 3 : x - 4, y + mw / 2, 0x3a3a3a)
      }
    },
  }
}

// --- snow plough ------------------------------------------------------------------

const plough: Maker = (W, H, rng) => {
  const rw = Math.max(6, Math.round(W * 0.42) & ~1)
  const rx = Math.round((W - rw) / 2)
  const lane = rw / 2
  const snow = new Float32Array(W * H).fill(1)
  const bank = new Float32Array(H * 2)
  let truckY = H + 10
  let pass = 0
  let phase = 0
  let t = 0
  const flakes = Array.from({ length: 14 }, () => ({ x: rng() * W, y: rng() * H }))
  const trees = Array.from({ length: 6 }, (_, i) => ({ x: i % 2 ? rx + rw + 3 + rng() * (W - rx - rw - 6) : rng() * (rx - 5), y: (i + rng()) * (H / 6) }))

  return {
    step() {
      t++
      for (const f of flakes) {
        f.y += phase === 2 ? 0.9 : 0.35
        f.x += Math.sin((f.y + t) * 0.08) * 0.2
        if (f.y > H) {
          f.y = -1
          f.x = rng() * W
        }
      }
      if (phase === 0) {
        const up = pass === 0
        truckY += up ? -0.7 : 0.7
        const lx = rx + (up ? lane : 0)
        const blade = Math.round(up ? truckY : truckY + 9)
        for (let x = lx; x < lx + lane; x++) if (blade >= 0 && blade < H) snow[blade * W + x] = 0
        if (blade >= 0 && blade < H) bank[blade * 2 + (up ? 1 : 0)] = Math.min(3, bank[blade * 2 + (up ? 1 : 0)]! + 1.2)
        if ((up && truckY < -12) || (!up && truckY > H + 2)) {
          pass++
          truckY = pass === 1 ? -12 : H + 10
          if (pass === 2) {
            phase = 1
            t = 0
          }
        }
      } else if (phase === 1 && t > 40) {
        phase = 2
        t = 0
      } else if (phase === 2) {
        for (let y = 0; y < H; y++)
          for (let x = rx; x < rx + rw; x++) snow[y * W + x] = Math.min(1, snow[y * W + x]! + 0.006 + hash(x >> 1, y >> 2, 5) * 0.004)
        if (t > 150) {
          snow.fill(1)
          bank.fill(0)
          pass = 0
          truckY = H + 10
          phase = 0
        }
      }
    },
    draw(px) {
      px.fill(0xf2f6fb)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 3) > 0.94) px[y * W + x] = 0xdce6f2
      for (const tr of trees) {
        for (let k = 0; k < 5; k++) rect(px, W, H, tr.x + 2 - k / 2, tr.y + k, k + 1, 1, k % 2 ? 0x2a6a48 : 0x3a8a5a)
        dot(px, W, H, tr.x + 2, tr.y, 0xffffff)
        dot(px, W, H, tr.x + 2, tr.y + 5, 0x6a4a2a)
      }
      for (let y = 0; y < H; y++)
        for (let x = rx; x < rx + rw; x++) {
          const s = snow[y * W + x]!
          let c = 0x4a4e56
          if (x === rx + lane - 1 && y % 6 < 3) c = 0xf0c040
          if (s > 0.66) c = 0xf6f9fd
          else if (s > 0.33) c = mix(c, 0xe8eef6, 0.6)
          else if (s > 0.05) c = mix(c, 0xe8eef6, 0.3)
          px[y * W + x] = c
        }
      for (let y = 0; y < H; y++) {
        const l = bank[y * 2]!
        const r = bank[y * 2 + 1]!
        if (l > 0) rect(px, W, H, rx - Math.ceil(l), y, Math.ceil(l), 1, 0xffffff)
        if (l > 0) dot(px, W, H, rx - Math.ceil(l) - 1, y, 0xc8d8ea)
        if (r > 0) rect(px, W, H, rx + rw, y, Math.ceil(r), 1, 0xffffff)
        if (r > 0) dot(px, W, H, rx + rw + Math.ceil(r), y, 0xc8d8ea)
      }
      if (phase === 0) {
        const up = pass === 0
        const x = rx + (up ? lane : 0)
        const y = Math.round(truckY)
        rect(px, W, H, x, y + (up ? 1 : 0), lane, 9, 0xf08a1a)
        rect(px, W, H, x + 1, y + (up ? 2 : 5), lane - 2, 3, 0x2a3a4a)
        rect(px, W, H, x - 1, up ? y : y + 9, lane + 2, 1, 0xf0d040)
        if (t % 8 < 4) dot(px, W, H, x + lane / 2, y + (up ? 6 : 2), 0xffd040)
        for (let k = 0; k < 3; k++) dot(px, W, H, up ? x + lane + 1 + k : x - 2 - k, (up ? y : y + 9) - k + hash(k, t, 3), 0xffffff)
      }
      for (const f of flakes) dot(px, W, H, f.x, f.y, 0xffffff)
    },
  }
}

// --- window squeegee --------------------------------------------------------------

const squeegee: Maker = (W, H, rng) => {
  const f = 2
  const blade = 8
  const clean = new Uint8Array(W * H)
  let row = f
  let x = f
  let dir = 1
  let phase = 0
  let t = 0
  let night = false
  let seed = irand(rng, 1e6)
  const towers = Array.from({ length: 8 }, () => ({ h: 8 + rng() * H * 0.4, w: 3 + irand(rng, 4) }))
  const drips: { x: number; y: number; l: number }[] = []

  const view = (x: number, y: number) => {
    const g = y / H
    let c = night ? mix(0x0a1030, 0x3a2a6a, g) : mix(0x6ab8f0, 0xffe0b0, g)
    let ox = 0
    for (const tw of towers) {
      if (x >= ox && x < ox + tw.w && y > H - tw.h) {
        c = night ? 0x1a1a2e : 0x5a6a8a
        if (x % 2 === 1 && y % 3 === 0 && hash(x, y, 9) > (night ? 0.4 : 0.8)) c = night ? 0xffd870 : 0x9ab8d8
      }
      ox += tw.w
    }
    if (!night && Math.hypot(x - W * 0.7, y - H * 0.2) < 3) c = 0xfff4c0
    if (night && Math.hypot(x - W * 0.7, y - H * 0.15) < 2.5) c = 0xf0f0ff
    return c
  }

  return {
    step() {
      t++
      for (const d of drips) if (d.l > 0) {
        d.l--
        if (d.l % 3 === 0) d.y++
      }
      if (phase === 0) {
        x += dir * 1.1
        for (let y = row; y < row + blade && y < H - f; y++) {
          const xi = Math.round(x)
          if (xi >= f && xi < W - f) clean[y * W + xi] = 1
          if (xi - dir >= f && xi - dir < W - f) clean[y * W + xi - dir] = 1
        }
        if (rng() < 0.15) drips.push({ x: Math.round(x), y: row + blade, l: 12 })
        if ((dir > 0 && x >= W - f) || (dir < 0 && x < f)) {
          dir = -dir
          row += blade - 1
          if (row >= H - f) {
            phase = 1
            t = 0
          }
        }
      } else if (phase === 1 && t > 50) {
        phase = 2
        t = 0
      } else if (phase === 2) {
        for (let n = 0; n < 40; n++) clean[irand(rng, W * H)] = 0
        if (t > 45) {
          clean.fill(0)
          night = !night
          seed = irand(rng, 1e6)
          row = f
          x = f
          dir = 1
          phase = 0
          drips.length = 0
        }
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let xx = 0; xx < W; xx++) {
          let c = view(xx, y)
          if (!clean[y * W + xx]) {
            c = mix(c, 0xeef4fa, 0.62)
            const k = hash(xx >> 1, y >> 1, seed)
            if (k > 0.85) c = mix(c, 0xffffff, 0.6)
          }
          px[y * W + xx] = c
        }
      for (const d of drips) if (d.l > 0 && !clean[d.y * W + d.x]) dot(px, W, H, d.x, d.y, 0xcfe4f4)
      rect(px, W, H, 0, 0, W, f, 0xf4f4f4)
      rect(px, W, H, 0, H - f, W, f, 0xf4f4f4)
      rect(px, W, H, 0, 0, f, H, 0xf4f4f4)
      rect(px, W, H, W - f, 0, f, H, 0xf4f4f4)
      if (phase === 0) {
        rect(px, W, H, x, row, 1, blade, 0x2a2a2a)
        rect(px, W, H, x - dir, row + 1, 1, blade - 2, 0x9a9aa8)
        line(px, W, H, x - dir * 2, row + blade / 2, x - dir * 7, row + blade / 2 + 5, 0xf0c040)
      } else if (phase === 1 && t < 30) {
        const g = t * 3
        for (let y = 0; y < H; y++) dot(px, W, H, g - y * 0.5, y, 0xffffff)
      }
    },
  }
}

// --- floor tiling -----------------------------------------------------------------

const tiling: Maker = (W, H, rng) => {
  const ts = 4
  const p = ts + 1
  const cols = Math.max(1, Math.ceil(W / p))
  const rows = Math.max(1, Math.ceil(H / p))
  let laid: number[] = []
  let k = 0
  let timer = 0
  let style = irand(rng, 4)
  let hold = 0
  let seed = irand(rng, 1e6)

  const colour = (i: number, j: number) => {
    if (style === 0) return (i + j) % 2 ? 0x22252c : 0xf2efe8
    if (style === 1) return mix(0xc8643a, 0xe08a52, hash(i, j, seed))
    if (style === 2) {
      const a = Math.abs((i % 4) - 1.5)
      const b = Math.abs((j % 4) - 1.5)
      return a < 1 && b < 1 ? 0x2a6ab8 : a > 1 && b > 1 ? 0xf0c040 : 0xf6f2e8
    }
    return hsv(0.5 + j * 0.015 + hash(i, j, seed) * 0.04, 0.6, 0.6 + 0.3 * hash(j, i, seed))
  }

  return {
    step() {
      // the finished floor holds a moment, then on to the next room: tiles are never pulled back up
      if (hold > 0) {
        if (--hold === 0) {
          laid = []
          k = 0
          style = (style + 1) % 4
          seed = irand(rng, 1e6)
        }
        return
      }
      if (--timer > 0) return
      if (k >= cols * rows) {
        hold = 60
        return
      }
      laid.push(k)
      k++
      timer = 2
    },
    draw(px) {
      px.fill(0x9a958c)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 1) > 0.9) px[y * W + x] = 0x8a857c
      const next = Math.floor(k / cols)
      for (let x = 0; x < W; x++) for (let y = next * p; y < next * p + p; y++) if (y % 2 === 0) dot(px, W, H, x, y, 0xb8b4ac)
      laid.forEach((id, n) => {
        const i = id % cols
        const j = Math.floor(id / cols)
        const age = laid.length - n
        const drop = Math.max(0, 3 - age)
        const c = colour(i, j)
        const x = i * p
        const y = j * p - drop
        rect(px, W, H, x - 1, j * p - 1, p, p, 0xd8d4cc)
        if (drop > 0) rect(px, W, H, x + 1, j * p + 1, ts, ts, 0x6a665e)
        rect(px, W, H, x, y, ts, ts, c)
        dot(px, W, H, x, y, mix(c, 0xffffff, 0.45))
        rect(px, W, H, x + 1, y + ts - 1, ts - 1, 1, scale(c, 0.8))
        if (style === 0 && (i * 3 + j) % 5 === 0) dot(px, W, H, x + 2, y + 1, (i + j) % 2 ? 0x44474e : 0xd0ccc4)
      })
      if (hold > 0 && hold < 40) {
        const g = (40 - hold) * 2
        for (let y = 0; y < H; y++) dot(px, W, H, g - y * 0.6, y, 0xffffff)
      }
    },
  }
}

// --- zen garden rake --------------------------------------------------------------

const zen: Maker = (W, H, rng) => {
  type Stone = { x: number; y: number; r: number }
  let stones: Stone[] = []
  const shown = new Uint8Array(W * H)
  let phase = 0
  let rx = 0
  let ry = 0
  let si = 0
  let ang = 0
  let t = 0
  const band = 9

  function place() {
    stones = []
    const n = 2 + irand(rng, 2)
    for (let tries = 0; stones.length < n && tries < 200; tries++) {
      const r = 2 + rng() * Math.min(3, W / 10)
      const s = { x: r + 4 + rng() * (W - 2 * r - 8), y: r + 6 + rng() * (H - 2 * r - 14), r }
      if (stones.every(o => Math.hypot(o.x - s.x, o.y - s.y) > o.r + s.r + 9)) stones.push(s)
    }
    shown.fill(0)
    phase = 0
    rx = -3
    ry = 0
    si = 0
    ang = 0
  }
  place()
  const field = (x: number, y: number): [number, number] => {
    let best = Infinity
    let who = -1
    stones.forEach((s, i) => {
      const d = Math.hypot(x - s.x, y - s.y) - s.r
      if (d < best) {
        best = d
        who = i
      }
    })
    return best < 8 ? [best, who] : [y, -1]
  }

  return {
    step() {
      t++
      if (phase === 0) {
        rx += 1.2
        for (let y = ry; y < ry + band && y < H; y++) {
          const x = Math.round(rx)
          if (x >= 0 && x < W && field(x, y)[1] < 0) shown[y * W + x] = 1
          if (x - 1 >= 0 && x - 1 < W && field(x - 1, y)[1] < 0) shown[y * W + x - 1] = 1
        }
        if (rx > W + 3) {
          rx = -3
          ry += band
          if (ry >= H) phase = 1
        }
      } else if (phase === 1) {
        const s = stones[si]
        if (!s) {
          phase = 2
          t = 0
          return
        }
        ang += 0.09
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            const [, who] = field(x, y)
            if (who !== si) continue
            let a = Math.atan2(y - s.y, x - s.x) + Math.PI / 2
            if (a < 0) a += Math.PI * 2
            if (a <= ang) shown[y * W + x] = 1
          }
        if (ang > Math.PI * 2) {
          si++
          ang = 0
        }
      } else if (phase === 2) {
        if (t > 60) {
          phase = 3
          t = 0
        }
      } else if (phase === 3) {
        const y = Math.floor(t * 1.2)
        for (let yy = 0; yy < Math.min(y, H); yy++) for (let x = 0; x < W; x++) shown[yy * W + x] = 0
        if (y > H + 4) place()
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let c = 0xe8d9b4
          if (shown[y * W + x]) {
            const [v] = field(x, y)
            const m = ((Math.floor(v) % 3) + 3) % 3
            c = m === 0 ? 0xc8b48a : m === 1 ? 0xf4e8c8 : 0xe8d9b4
          }
          px[y * W + x] = c
        }
      for (const s of stones) {
        disc(px, W, H, s.x + 1, s.y + 1, s.r, 0xb8a47e)
        lit(px, W, H, s.x, s.y, s.r, s.r, 0x7a7a80)
        dot(px, W, H, s.x - s.r * 0.5, s.y - s.r * 0.6, 0x6a9a4a)
      }
      if (phase === 0) {
        rect(px, W, H, rx, ry, 1, band, 0x6a4a2a)
        for (let k = 0; k < band; k += 3) dot(px, W, H, rx + 1, ry + k, 0x4a321a)
        line(px, W, H, rx, ry + band / 2, rx - 8, ry + band / 2 - 10, 0x8a6a3a)
      } else if (phase === 1) {
        const s = stones[si]
        if (s) {
          const a = ang - Math.PI / 2
          const r = s.r + 4
          line(px, W, H, s.x + Math.cos(a) * (s.r + 1), s.y + Math.sin(a) * (s.r + 1), s.x + Math.cos(a) * (s.r + 8), s.y + Math.sin(a) * (s.r + 8), 0x6a4a2a)
          dot(px, W, H, s.x + Math.cos(a) * r, s.y + Math.sin(a) * r, 0x4a321a)
        }
      } else if (phase === 3) {
        const y = Math.floor(t * 1.2)
        rect(px, W, H, 0, y, W, 1, 0x8a6a3a)
      }
    },
  }
}

// --- falling sand: an hourglass -----------------------------------------------

const sable: Maker = (W, H, rng) => {
  const cx = W / 2
  const cap = 2
  const mid = H / 2
  const maxHalf = W / 2 - 3
  const inside = new Uint8Array(W * H)
  for (let y = cap + 1; y < H - cap - 1; y++) {
    const dy = Math.abs(y + 0.5 - mid) / (mid - cap - 1)
    const half = dy < 0.05 ? 1 : 1 + (maxHalf - 1) * Math.sin((Math.min(1, (dy - 0.05) * 1.3) * Math.PI) / 2)
    for (let x = 0; x < W; x++) if (Math.abs(x + 0.5 - cx) < half) inside[y * W + x] = 1
  }
  const grid = new Uint32Array(W * H)
  const hue = rng()
  const fillFrom = Math.round(cap + 3 + (mid - cap) * 0.08)
  for (let y = fillFrom; y < mid - 3; y++)
    for (let x = 0; x < W; x++)
      if (inside[y * W + x]) {
        const band = Math.floor((y - fillFrom) / 4)
        grid[y * W + x] = hsv(hue + band * 0.12, 0.65, 0.95 - rng() * 0.06)
      }
  const bg0 = 0x2b1d14
  const bg1 = 0x0f0a07
  let empty = 0
  let glint = 0

  function pass() {
    for (let y = H - 2; y >= 0; y--) {
      const ltr = rng() < 0.5
      for (let n = 0; n < W; n++) {
        const x = ltr ? n : W - 1 - n
        const i = y * W + x
        const c = grid[i]
        if (!c) continue
        const below = i + W
        if (inside[below] && !grid[below]) {
          grid[below] = c
          grid[i] = 0
          continue
        }
        const d = rng() < 0.5 ? -1 : 1
        for (const dx of [d, -d]) {
          const nx = x + dx
          const j = below + dx
          if (nx >= 0 && nx < W && inside[j] && !grid[j]) {
            grid[j] = c
            grid[i] = 0
            break
          }
        }
      }
    }
  }

  return {
    step() {
      if (glint > 0) glint--
      pass()
      let top = 0
      for (let i = 0; i < W * Math.floor(mid); i++) if (grid[i]) top++
      empty = top === 0 ? empty + 1 : 0
      if (empty > 25) {
        grid.reverse()
        empty = 0
        glint = 8
      }
    },
    draw(px) {
      sky(px, W, H, bg0, bg1)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = y * W + x
          if (inside[i]) {
            px[i] = grid[i] || mix(px[i] as number, 0x9fd8ff, 0.08 + glint * 0.03)
          } else if (
            (x > 0 && inside[i - 1]) ||
            (x < W - 1 && inside[i + 1]) ||
            (y > 0 && inside[i - W]) ||
            (y < H - 1 && inside[i + W])
          ) {
            px[i] = mix(px[i] as number, 0xcfeeff, 0.45)
          }
        }
      const wood = (y: number) => {
        for (let x = 1; x < W - 1; x++) px[y * W + x] = (x + y * 3) % 7 === 0 ? 0x6b3f1f : 0x8b5a2b
      }
      for (let y = 0; y <= cap; y++) {
        wood(y)
        wood(H - 1 - y)
      }
      for (const y of [0, H - 1 - cap]) for (let x = 1; x < W - 1; x++) px[y * W + x] = 0xb07a44
      for (const y of [cap, H - 1]) for (let x = 1; x < W - 1; x++) px[y * W + x] = 0x5a3518
      for (let y = cap; y < H - cap; y++) {
        px[y * W + 2] = 0x5a3518
        px[y * W + W - 3] = 0x5a3518
      }
    },
  }
}

// --- aquarium bubbles ---------------------------------------------------

const bulles: Maker = (W, H, rng) => {
  const surf = 4
  const floorY = H - 5
  const deep = hsv(0.6 + rng() * 0.04, 0.85, 0.22)
  const shallow = hsv(0.52 + rng() * 0.05, 0.7, 0.72)
  const kelp = Array.from({ length: 5 }, () => ({
    x: 2 + rng() * (W - 4),
    h: H * 0.2 + rng() * H * 0.3,
    c: hsv(0.27 + rng() * 0.12, 0.7, 0.5 + rng() * 0.2),
    ph: rng() * 6,
  }))
  const vents = [W * 0.3, W * 0.68].map(x => x + (rng() - 0.5) * 4)
  type B = { x: number; y: number; r: number; vy: number; ph: number }
  let bubbles: B[] = []
  let pops: { x: number; y: number; life: number }[] = []
  let t = 0

  return {
    step() {
      t++
      for (const v of vents)
        if (rng() < 0.3) bubbles.push({ x: v + (rng() - 0.5) * 1.5, y: floorY - 2, r: 0.4 + rng() * rng() * 2.4, vy: 0.12, ph: rng() * 6 })
      for (const b of bubbles) {
        b.vy = Math.min(0.9, b.vy + 0.01 + b.r * 0.004)
        b.y -= b.vy
        b.x += Math.sin(t * 0.15 + b.ph) * 0.25
        if (b.y < surf + 1) {
          pops.push({ x: b.x, y: surf + 1, life: 4 })
          b.r = -1
        }
      }
      bubbles = bubbles.filter(b => b.r > 0)
      for (const p of pops) p.life--
      pops = pops.filter(p => p.life > 0)
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let c = mix(shallow, deep, y / H)
          if (y < H * 0.75 && (x * 0.5 + y * 0.3 + t * 0.05) % 9 < 1.5) c = mix(c, 0xffffff, 0.1 * (1 - y / H))
          const wave = surf + Math.sin(x * 0.5 + t * 0.1) * 0.8
          if (y < wave) c = mix(0xbfe8ff, shallow, y / wave)
          else if (y < wave + 1) c = mix(c, 0xffffff, 0.35)
          if (y >= floorY + Math.sin(x * 0.3) * 0.8) c = (x * 7 + y * 13) % 11 === 0 ? 0xa08a5a : 0xd8c08a
          px[y * W + x] = c
        }
      for (const k of kelp)
        for (let j = 0; j < k.h; j++) {
          const x = k.x + Math.sin(j * 0.15 + t * 0.05 + k.ph) * (j / k.h) * 2.5
          dot(px, W, H, x, floorY - j, k.c)
          dot(px, W, H, x + 1, floorY - j, mix(k.c, 0x000000, 0.3))
        }
      for (const v of vents) {
        rect(px, W, H, v - 2, floorY - 2, 5, 2, 0x5a5560)
        dot(px, W, H, v, floorY - 3, 0x7a7580)
      }
      for (const b of bubbles) {
        if (b.r < 1) {
          dot(px, W, H, b.x, b.y, 0xdff6ff)
          continue
        }
        const n = Math.ceil(b.r) + 1
        for (let dy = -n; dy <= n; dy++)
          for (let dx = -n; dx <= n; dx++) {
            const d = Math.hypot(dx, dy)
            const xx = Math.round(b.x + dx)
            const yy = Math.round(b.y + dy)
            if (xx < 0 || xx >= W || yy < 0 || yy >= H) continue
            if (Math.abs(d - b.r) < 0.6) px[yy * W + xx] = 0xdff6ff
            else if (d < b.r) px[yy * W + xx] = mix(px[yy * W + xx] as number, 0xffffff, 0.15)
          }
        dot(px, W, H, b.x - b.r * 0.4, b.y - b.r * 0.4, 0xffffff)
      }
      for (const p of pops) {
        const r = 5 - p.life
        for (const [dx, dy] of [[-r, 0], [r, 0], [-r * 0.7, -r * 0.7], [r * 0.7, -r * 0.7]] as const) dot(px, W, H, p.x + dx, p.y + dy, 0xffffff)
      }
    },
  }
}

// --- paint that mixes ------------------------------------------------------------

const peinture: Maker = (W, H, rng) => {
  const palettes = [
    [0xf4ecd8, 0xff3a6e, 0xf4ecd8, 0x3a8eff, 0xffd23a],
    [0xf4ecd8, 0x1fb8a0, 0xff7a1a, 0xf4ecd8, 0x7a2aff],
    [0x1a1a40, 0xff4fa3, 0x3ae0e8, 0xf4ecd8, 0xff4fa3],
    [0xf0e8d0, 0xe8403a, 0x1f4a8a, 0xf0e8d0, 0xd8a03a],
  ]
  const colors = palettes[Math.floor(rng() * palettes.length)] as number[]
  // Each pixel remembers where its paint came from; the current carries those
  // coordinates, never the colours, so the swirls stay sharp.
  let u = new Float32Array(W * H)
  let v = new Float32Array(W * H)
  let nu = new Float32Array(W * H)
  let nv = new Float32Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      u[y * W + x] = x
      v[y * W + x] = y
    }
  let t = rng() * 1000
  const ph = rng() * 6
  // The current's terms depend on the row, the column or their sum alone:
  // worked out once a frame rather than once a pixel.
  const byRow = new Float64Array(H)
  const byCol = new Float64Array(W)
  const byDiag = new Float64Array(W + H)

  return {
    step() {
      t++
      for (let y = 0; y < H; y++) byRow[y] = Math.sin(y * 0.15 + t * 0.012 + ph) * 0.7
      for (let x = 0; x < W; x++) byCol[x] = 0.4 + Math.cos(x * 0.16 + t * 0.014) * 0.35
      for (let d = 0; d < W + H; d++) byDiag[d] = Math.sin(d * 0.09 - t * 0.017) * 0.5
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const vx = (byRow[y] as number) + (byDiag[x + y] as number)
          const vy = byCol[x] as number
          const sx = Math.max(0, Math.min(W - 1.001, x - vx))
          const sy = y - vy
          const i = y * W + x
          if (sy < 0) {
            nu[i] = sx
            nv[i] = sy - t * 0.4
            continue
          }
          const x0 = Math.floor(sx)
          const y0 = Math.floor(sy)
          const fx = sx - x0
          const fy = sy - y0
          const r0 = y0 * W
          const r1 = Math.min(H - 1, y0 + 1) * W
          const xa = Math.min(W - 1, x0)
          const xb = Math.min(W - 1, x0 + 1)
          nu[i] = ((u[r0 + xa] as number) * (1 - fx) + (u[r0 + xb] as number) * fx) * (1 - fy) + ((u[r1 + xa] as number) * (1 - fx) + (u[r1 + xb] as number) * fx) * fy
          nv[i] = ((v[r0 + xa] as number) * (1 - fx) + (v[r0 + xb] as number) * fx) * (1 - fy) + ((v[r1 + xa] as number) * (1 - fx) + (v[r1 + xb] as number) * fx) * fy
        }
      ;[u, nu] = [nu, u]
      ;[v, nv] = [nv, v]
    },
    draw(px) {
      const n = colors.length
      for (let i = 0; i < px.length; i++) {
        const band = Math.floor(((v[i] as number) + Math.sin((u[i] as number) * 0.3) * 3) / 6)
        px[i] = colors[((band % n) + n) % n] as number
      }
    },
  }
}

// --- dominoes --------------------------------------------------------------------

const dominos: Maker = (W, H, rng) => {
  const rows = 6
  const gap = 3
  const len = 5
  const top = 8
  const rowH = Math.floor((H - top - 2) / rows)
  const perRow = Math.floor((W - 4) / gap)
  type D = { x: number; base: number; dir: 1 | -1; a: number; v: number; c: number }
  const hue = rng()
  const list: D[] = []
  for (let r = 0; r < rows; r++)
    for (let i = 0; i < perRow; i++) {
      const dir: 1 | -1 = r % 2 ? -1 : 1
      const x = dir === 1 ? 2 + i * gap : W - 3 - i * gap
      list.push({ x, base: top + (r + 1) * rowH, dir, a: 0, v: 0, c: hsv(hue + list.length * 0.012, 0.75, 1) })
    }
  let phase: 'fall' | 'wait' | 'rise' = 'fall'
  let wait = 0
  let riseAt = 0
  ;(list[0] as D).v = 0.04

  return {
    step() {
      if (phase === 'fall') {
        list.forEach((d, i) => {
          if (d.v > 0 && d.a < 1.35) {
            d.v += 0.012
            d.a = Math.min(1.35, d.a + d.v)
          }
          const nextD = list[i + 1]
          if (nextD && d.a > 0.55 && nextD.v === 0) nextD.v = 0.04
        })
        if ((list[list.length - 1] as D).a >= 1.35) {
          phase = 'wait'
          wait = 30
        }
      } else if (phase === 'wait') {
        if (--wait === 0) {
          phase = 'rise'
          riseAt = list.length - 1
        }
      } else {
        for (let k = 0; k < 3 && riseAt >= 0; k++, riseAt--) {
          const d = list[riseAt] as D
          d.a = 0
          d.v = 0
        }
        if (riseAt < 0) {
          phase = 'fall'
          ;(list[0] as D).v = 0.04
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a2238, 0x16121e)
      for (let r = 0; r < rows; r++) {
        rect(px, W, H, 1, top + (r + 1) * rowH + 1, W - 2, 1, 0x6a5a7c)
        rect(px, W, H, 1, top + (r + 1) * rowH + 2, W - 2, 1, 0x241c30)
      }
      for (const d of list) {
        const ex = d.x + Math.sin(d.a) * len * d.dir
        const ey = d.base - Math.cos(d.a) * len
        line(px, W, H, d.x + 1, d.base, ex + 1, ey, scale(d.c, 0.65))
        line(px, W, H, d.x, d.base, ex, ey, d.c)
        dot(px, W, H, ex, ey, mix(d.c, 0xffffff, 0.5))
      }
    },
  }
}

// --- folding laundry ----------------------------------------------------------------

const laundry: Maker = (W, H, rng) => {
  const sw = Math.max(9, Math.round(W * 0.5)) - (Math.round(W * 0.5) % 3)
  const sh = Math.max(10, Math.round(H * 0.32))
  const ox = Math.round((W - sw) / 2)
  const oy = Math.round(H * 0.18)
  const sleeve = Math.max(2, Math.round(sw * 0.28))
  // the shirt laid flat: the body, sleeves out to the sides, a neck at the top
  const shape: [number, number][] = []
  for (let y = 0; y < sh; y++)
    for (let x = -sleeve; x < sw + sleeve; x++) {
      const body = x >= 0 && x < sw
      const arm = y < sleeve + 1 && (x < 0 ? -x <= sleeve - y * 0.3 : x >= sw ? x - sw < sleeve - y * 0.3 : false)
      const neck = y === 0 && Math.abs(x - (sw - 1) / 2) < sw * 0.18
      if ((body || arm) && !neck) shape.push([x, y])
    }
  let hue = rng()
  let t = 0
  let pile: number[] = []
  const P = { arrive: 16, left: 34, right: 52, up: 72, away: 92 }
  const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))

  return {
    step() {
      t++
      if (t > P.away + 6) {
        t = 0
        pile.push(hue)
        if (pile.length > 6) pile = []
        hue = (hue + 0.2 + rng() * 0.5) % 1
      }
    },
    draw(px) {
      // a wooden table with long planks
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y % 9 === 0 ? 0x9a6a40 : (x * 3 + y * 11) % 37 === 0 ? 0xb07a4a : 0xc08a58
      // the pile of folded shirts, bottom right
      const fw = sw / 3 + 2
      const fh = Math.round(sh / 2)
      const px0 = W - fw - 2
      const py0 = H - fh - 3
      pile.forEach((h, i) => {
        const c = hsv(h, 0.55, 0.85)
        rect(px, W, H, px0 + 1, py0 - i * 2 + 1, fw, fh, 0x7a5030)
        slab(px, W, H, px0, py0 - i * 2, fw, fh, c, tones(c)[3])
        rect(px, W, H, px0 + 2, py0 - i * 2 + 1, fw - 4, 1, tones(c)[2])
      })
      const front = hsv(hue, 0.6, 0.9)
      const back = tones(front)[2]
      const a = (sw / 3) | 0
      const b = sw - a
      const mid = Math.round(sh / 2)
      const pL = ease((t - P.arrive) / (P.left - P.arrive))
      const pR = ease((t - P.left) / (P.right - P.left))
      const pU = ease((t - P.right) / (P.up - P.right))
      const slide = t < P.arrive ? (1 - t / P.arrive) * -W : 0
      const away = ease((t - P.up - 4) / (P.away - P.up - 4))
      const dx = slide + away * (px0 - ox - a + 1)
      const dy = away * (py0 - pile.length * 2 - oy)
      type Px = { x: number; y: number; c: number; layer: number }
      const out: Px[] = []
      for (const [x0, y0] of shape) {
        let x = x0
        let y = y0
        let up = true
        let layer = 0
        // the left third folds over, then the right, then the bottom half up
        if (x < a) {
          x = a - (a - x) * Math.cos(Math.PI * pL)
          if (pL > 0.5) up = !up
          layer = 1
        } else if (x >= b) {
          x = b - (b - x) * Math.cos(Math.PI * pR)
          if (pR > 0.5) up = !up
          layer = 2
        }
        if (y >= mid) {
          y = mid - (mid - y) * Math.cos(Math.PI * pU)
          if (pU > 0.5) {
            up = !up
            layer += 3
          }
        }
        const shade = up ? front : back
        const edge = y0 === sh - 1 || x0 === -sleeve || x0 === sw + sleeve - 1
        out.push({ x: ox + x + dx, y: oy + y + dy, c: edge ? tones(front)[3] : y0 === 1 && Math.abs(x0 - (sw - 1) / 2) < sw * 0.25 ? tones(front)[2] : shade, layer })
      }
      out.sort((p, q) => p.layer - q.layer)
      for (const p of out) dot(px, W, H, p.x, p.y, p.c)
      // a little print on the chest, while it shows
      if (pU < 0.5 && t < P.away) dot(px, W, H, ox + sw / 2 + dx, oy + sh * 0.3 + dy, 0xffffff)
      text(px, W, H, 1, 1, String(pile.length), 0x5a3a1a)
    },
  }
}

// --- dishwasher Tetris -------------------------------------------------------------

const dishwasher: Maker = (W, H, rng) => {
  const x0 = 2
  const x1 = W - 2
  const topRack = Math.round(H * 0.38)
  const lowRack = Math.round(H * 0.72)
  type Dish = { kind: 'plate' | 'cup' | 'glass' | 'fork'; x: number; y: number; c: number }
  let slots: Dish[] = []
  let filled = 0
  let fly = 0
  let phase: 'load' | 'close' | 'wash' | 'open' | 'unload' = 'load'
  let t = 0
  let door = 0
  let shine: Spark[] = []
  const build = () => {
    slots = []
    const plates = Math.floor((x1 - x0 - 8) / 2.5)
    for (let k = 0; k < plates; k++) slots.push({ kind: 'plate', x: x0 + 2 + k * 2.5, y: lowRack, c: k % 3 === 2 ? 0xd8e8f8 : 0xf4f4f8 })
    for (let k = 0; k < 3; k++) slots.push({ kind: 'fork', x: x1 - 5 + k, y: lowRack, c: 0xb8c0cc })
    const cups = Math.floor((x1 - x0 - 2) / 5)
    for (let k = 0; k < cups; k++) slots.push({ kind: k % 2 ? 'glass' : 'cup', x: x0 + 3 + k * 5, y: topRack, c: k % 2 ? 0xc8e8f8 : hsv(rng(), 0.4, 0.9) })
    filled = 0
    fly = 0
    phase = 'load'
    t = 0
    door = 0
  }
  build()
  // the order: plates from the back, then the cups, then cutlery: no wasted space
  const order = () => slots

  return {
    step() {
      t++
      shine = sparks(shine, 0)
      if (phase === 'load') {
        if (++fly >= 9) {
          fly = 0
          filled++
          if (filled >= order().length) {
            phase = 'close'
            t = 0
          }
        }
      } else if (phase === 'close') {
        door = Math.min(1, door + 0.05)
        if (door >= 1) {
          phase = 'wash'
          t = 0
        }
      } else if (phase === 'wash') {
        if (t > 70) phase = 'open'
      } else if (phase === 'open') {
        door = Math.max(0, door - 0.05)
        if (door <= 0) {
          phase = 'unload'
          t = 0
          for (const s of slots) shine.push({ x: s.x, y: s.y - 3 - irand(rng, 3), vx: 0, vy: 0, l: 20 + irand(rng, 30), c: 0xffffff })
        }
      } else if (phase === 'unload' && t > 50) build()
    },
    draw(px) {
      sky(px, W, H, 0xe8e4dc, 0xd8d2c8)
      // the dishwasher: steel tub, two wire racks
      slab(px, W, H, 0, 6, W, H - 6, 0xb8bcc4, 0x5a5e68)
      rect(px, W, H, x0, 8, x1 - x0, H - 10, 0x8a909c)
      for (let y = 9; y < H - 2; y += 3) rect(px, W, H, x0, y, x1 - x0, 1, 0x9aa0ac)
      for (const ry of [topRack, lowRack]) {
        rect(px, W, H, x0, ry, x1 - x0, 1, 0xd8dce4)
        rect(px, W, H, x0, ry + 1, x1 - x0, 1, 0x5a5e68)
        for (let x = x0 + 1; x < x1; x += 2) dot(px, W, H, x, ry - 1, 0xd8dce4)
      }
      const dish = (d: Dish, x: number, y: number) => {
        if (d.kind === 'plate') {
          rect(px, W, H, x, y - 8, 1, 8, d.c)
          rect(px, W, H, x + 1, y - 7, 1, 6, tones(d.c)[2])
          dot(px, W, H, x, y - 8, 0x6a8ab0)
        } else if (d.kind === 'cup') {
          slab(px, W, H, x - 1.5, y - 4, 4, 4, d.c, tones(d.c)[3])
          dot(px, W, H, x + 2.5, y - 2, tones(d.c)[2])
        } else if (d.kind === 'glass') {
          rect(px, W, H, x - 1, y - 5, 3, 5, d.c)
          rect(px, W, H, x - 1, y - 5, 1, 5, 0xffffff)
        } else {
          rect(px, W, H, x, y - 6, 1, 6, d.c)
          dot(px, W, H, x, y - 7, 0xe0e4ec)
        }
      }
      const showing = phase === 'load' ? filled : slots.length
      for (let k = 0; k < showing; k++) dish(slots[k], slots[k].x, slots[k].y)
      if (phase === 'load' && filled < slots.length) {
        // the next one flies in from the top right and drops into place
        const d = slots[filled]
        const k = fly / 9
        const sx = W + 4
        const sy = 2
        dish(d, Math.round(sx + (d.x - sx) * k), Math.round(sy + (d.y - sy) * k - Math.sin(k * Math.PI) * 6))
      }
      // the door swings up to close; a blue light while it washes
      if (door > 0) {
        const h = Math.round(door * (H - 6))
        slab(px, W, H, 0, H - h, W, h, 0xd0d4dc, 0x6a6e78)
        rect(px, W, H, 2, H - h + 1, W - 4, 2, 0x3a3e48)
        if (phase === 'wash') {
          dot(px, W, H, W - 5, H - h + 2, t % 20 < 14 ? 0x4ac0ff : 0x2a6a8a)
          for (let k = 0; k < 3; k++) tint(px, W, H, 2 + ((t + k * 9) % (W - 4)), H - h - 1, 0xffffff, 0.5)
        }
      }
      for (const s of shine) if (s.l % 10 < 5) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 0, `${Math.min(filled, slots.length)}/${slots.length}`, 0x5a5e68)
    },
  }
}

export const SATISFYING = {
  sable,
  bulles,
  peinture,
  dominos,
  kinetic,
  soap,
  slime,
  pressure,
  carpet,
  perfect,
  laser,
  ballsort,
  bucket,
  film,
  planer,
  bubblewrap,
  restock,
  lawn,
  plough,
  squeegee,
  tiling,
  zen,
  laundry,
  dishwasher,
}

