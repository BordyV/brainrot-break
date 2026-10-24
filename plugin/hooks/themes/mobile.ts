import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, collide, ellipse, irand, line, lit, litSprite, pick, poly, ring, shiny, shuffle, slab, sparks, textWidth, tones } from '../kit'
import type { Ball, Spark } from '../kit'

// Mobile & hyper-casual: phone games everybody has played, each with a bot.

// --- flappy bird ------------------------------------------------------------------

const flappy: Maker = (W, H, rng) => {
  const ground = H - 6
  const gapH = Math.max(10, Math.round(H * 0.25))
  const pw = 5
  const bx = Math.round(W * 0.3)
  let pipes: { x: number; gy: number; scored: boolean }[] = []
  let y = H * 0.4
  let vy = 0
  let score = 0
  let dead = 0
  let lazy = 0
  let t = 0
  const BIRD = ['.yyw.', 'yyywk', 'wyyoo', '.yyy.']

  function reset() {
    pipes = []
    y = H * 0.4
    vy = 0
    score = 0
  }
  reset()

  return {
    step() {
      t++
      if (dead > 0) {
        vy += 0.15
        y = Math.min(ground - 2, y + vy)
        if (--dead === 0) reset()
        return
      }
      for (const p of pipes) p.x -= 0.6
      pipes = pipes.filter(p => p.x > -pw - 2)
      const last = pipes[pipes.length - 1]
      if (!last || last.x < W - 18) {
        const lo = 6 + gapH / 2
        const hi = ground - 6 - gapH / 2
        const from = last ? last.gy : (lo + hi) / 2
        pipes.push({ x: W + 2, gy: clamp(from + (rng() - 0.5) * 20, lo, Math.max(lo, hi)), scored: false })
      }
      const next = pipes.find(p => p.x + pw > bx - 1)
      const target = next ? next.gy + 2 : H * 0.45
      if (lazy > 0) lazy--
      else if (rng() < 0.0015) lazy = 14
      if (!lazy && y + vy * 2 > target + 2 && vy > -0.5) vy = -1.45
      vy += 0.13
      y += vy
      for (const p of pipes) {
        if (!p.scored && p.x + pw < bx) {
          p.scored = true
          score++
        }
        if (bx + 2 >= p.x && bx - 2 <= p.x + pw && (y - 1 < p.gy - gapH / 2 || y + 1 > p.gy + gapH / 2)) dead = 40
      }
      if (y > ground - 2 || y < 0) dead = 40
    },
    draw(px) {
      sky(px, W, H, 0x4ec0ca, 0xb8ecf0, ground)
      for (let x = 0; x < W; x++) {
        const h = 4 + ((x * 7 + Math.floor(x / 3)) % 5)
        rect(px, W, H, x, ground - 8 - h, 1, h + 8, (x % 4 === 1 && h > 6) ? 0xb8e0c8 : 0xa0d8b8)
      }
      rect(px, W, H, 0, ground - 3, W, 3, 0x5ad05a)
      for (const p of pipes) {
        const top = p.gy - gapH / 2
        const bot = p.gy + gapH / 2
        for (const [y0, y1] of [
          [0, top],
          [bot, ground],
        ] as [number, number][]) {
          rect(px, W, H, p.x, y0, pw, y1 - y0, 0x5ac83a)
          rect(px, W, H, p.x, y0, 1, y1 - y0, 0x9aee6a)
          rect(px, W, H, p.x + pw - 1, y0, 1, y1 - y0, 0x2a8a1a)
        }
        rect(px, W, H, p.x - 1, top - 2, pw + 2, 2, 0x4ab82a)
        rect(px, W, H, p.x - 1, bot, pw + 2, 2, 0x4ab82a)
      }
      rect(px, W, H, 0, ground, W, H - ground, 0xded895)
      for (let x = 0; x < W; x++) if ((x + Math.floor(t * 0.6)) % 4 < 2) dot(px, W, H, x, ground, 0x9ad04a)
      litSprite(px, W, H, bx - 2, y - 2, BIRD, { y: 0xf8d830, w: 0xffffff, k: 0x000000, o: 0xf87830 })
      if (Math.floor(t / 4) % 2 && !dead) dot(px, W, H, bx - 2, y, 0xffffff)
      const s = String(score)
      text(px, W, H, W / 2 - textWidth(s) / 2 + 1, 4, s, 0x000000)
      text(px, W, H, W / 2 - textWidth(s) / 2, 3, s, 0xffffff)
    },
  }
}

// --- 2048 -------------------------------------------------------------------------

const TILE = [0xcdc1b4, 0xeee4da, 0xede0c8, 0xf2b179, 0xf59563, 0xf67c5f, 0xf65e3b, 0xedcf72, 0xedcc61, 0xedc850, 0xedc53f, 0xedc22e, 0x3c3a32]

const game2048: Maker = (W, H, rng) => {
  const ts = Math.max(3, Math.min(7, Math.floor((W - 3) / 4)))
  const size = ts * 4 + 3
  const ox = Math.floor((W - size) / 2)
  const oy = Math.floor((H - size) / 2) + 3
  let g = new Array(16).fill(0)
  let anim: { from: number; to: number; v: number }[] = []
  let at = 0
  let pops = new Set<number>()
  let hold = 0
  let best = 0
  const WEIGHT = [0, 1, 2, 3, 7, 6, 5, 4, 8, 9, 10, 11, 15, 14, 13, 12]

  const spawn = (b: number[]) => {
    const e = b.map((v, i) => (v ? -1 : i)).filter(i => i >= 0)
    if (e.length) b[pick(rng, e)] = rng() < 0.9 ? 1 : 2
  }
  function reset() {
    g = new Array(16).fill(0)
    spawn(g)
    spawn(g)
  }
  reset()
  // slides a board; returns the new board, the moves made and the merged cells
  const slide = (b: number[], dir: number) => {
    const out = new Array(16).fill(0)
    const moves: { from: number; to: number; v: number }[] = []
    const merged = new Set<number>()
    for (let l = 0; l < 4; l++) {
      const idx = [0, 1, 2, 3].map(k => {
        const p = dir === 0 || dir === 2 ? k : 3 - k
        return dir < 2 ? l * 4 + p : p * 4 + l
      })
      let w = 0
      let lastV = 0
      let lastAt = -1
      for (const i of idx) {
        const v = b[i] as number
        if (!v) continue
        if (v === lastV && lastAt >= 0) {
          out[lastAt] = v + 1
          merged.add(lastAt)
          moves.push({ from: i, to: lastAt, v })
          lastV = 0
          lastAt = -1
        } else {
          const to = idx[w++] as number
          out[to] = v
          moves.push({ from: i, to, v })
          lastV = v
          lastAt = to
        }
      }
    }
    return { out, moves, merged }
  }
  const value = (b: number[]) => {
    let s = 0
    for (let i = 0; i < 16; i++) s += (b[i] as number) * (b[i] as number) * (WEIGHT[i] as number) + (b[i] ? 0 : 6)
    return s
  }

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (at > 0) {
        if (--at === 0) {
          anim = []
          spawn(g)
          best = Math.max(...g)
        }
        return
      }
      pops = new Set()
      let pickDir = -1
      let score = -Infinity
      for (let d = 0; d < 4; d++) {
        const r = slide(g, d)
        if (r.out.every((v, i) => v === g[i])) continue
        const s = value(r.out) + (d === 3 ? 0 : d === 2 ? -400 : 0) + rng()
        if (s > score) {
          score = s
          pickDir = d
        }
      }
      if (pickDir < 0) {
        hold = 70
        return
      }
      const r = slide(g, pickDir)
      g = r.out
      anim = r.moves
      pops = r.merged
      at = 5
    },
    draw(px) {
      px.fill(0xfaf8ef)
      // the board's frame a pixel round the grid; at 32 pixels wide it fills the width
      rect(px, W, H, ox - 1, oy - 1, size + 2, size + 2, 0xbbada0)
      const pos = (i: number): [number, number] => [ox + (i % 4) * (ts + 1), oy + Math.floor(i / 4) * (ts + 1)]
      for (let i = 0; i < 16; i++) {
        const [x, y] = pos(i)
        rect(px, W, H, x, y, ts, ts, TILE[0] as number)
        rect(px, W, H, x, y, ts, 1, scale(TILE[0] as number, 0.92))
      }
      const tile = (x: number, y: number, v: number, big: boolean) => {
        const c = TILE[Math.min(v, 12)] as number
        const x0 = x - (big ? 1 : 0)
        const y0 = y - (big ? 1 : 0)
        // tiles a pixel apart: seven wide, so two digits of the 3-pixel font fit
        const s0 = ts + (big ? 2 : 0)
        // a tile with a little depth: a lit top edge, a shaded bottom edge
        rect(px, W, H, x0, y0, s0, s0, c)
        rect(px, W, H, x0, y0, s0, 1, mix(c, 0xffffff, 0.25))
        rect(px, W, H, x0, y0 + s0 - 1, s0, 1, scale(c, 0.85))
        const s = String(2 ** v)
        if (textWidth(s) <= ts) text(px, W, H, x + Math.floor((ts - textWidth(s)) / 2), y + Math.floor((ts - 5) / 2), s, v <= 2 ? 0x776e65 : 0xffffff)
        else dot(px, W, H, x + 1, y + 1, 0xffffff)
      }
      if (at > 0) {
        const f = at / 5
        for (const m of anim) {
          const [x0, y0] = pos(m.from)
          const [x1, y1] = pos(m.to)
          tile(x1 + (x0 - x1) * f, y1 + (y0 - y1) * f, m.v, false)
        }
      } else for (let i = 0; i < 16; i++) if (g[i]) tile(...pos(i), g[i] as number, pops.has(i) && hold === 0)
      const b = String(2 ** Math.max(1, best))
      text(px, W, H, W / 2 - textWidth(b) / 2, oy - 8, b, hold > 0 ? 0xf65e3b : 0x776e65)
    },
  }
}

// --- stack tower ------------------------------------------------------------------

const stack: Maker = (W, H, rng) => {
  const bh = 3
  type Blk = { x: number; w: number; c: number }
  let tower: Blk[] = []
  let cur = { x: 0, w: 0, dir: 1 }
  let hue = 0
  let cuts: { x: number; y: number; w: number; vy: number; c: number }[] = []
  let flash = 0
  let fall = 0
  let aim = 0
  let cam = 0

  function reset() {
    hue = rng()
    const w = Math.round(W * 0.55)
    tower = [{ x: (W - w) / 2, w, c: hsv(hue, 0.5, 0.9) }]
    next()
    cam = 0
  }
  function next() {
    const top = tower[tower.length - 1] as Blk
    cur = { x: tower.length % 2 ? -top.w : W, w: top.w, dir: tower.length % 2 ? 1 : -1 }
    const r = rng()
    aim = r < 0.65 ? 0 : r < 0.98 ? (rng() - 0.5) * 3 : (rng() < 0.5 ? -1 : 1) * top.w
  }
  reset()
  const baseY = () => H - 8 - (tower.length - 1) * bh + cam

  return {
    step() {
      if (flash > 0) flash--
      for (const c of cuts) {
        c.vy += 0.15
        c.y += c.vy
      }
      cuts = cuts.filter(c => c.y < H + 5)
      const want = Math.max(0, tower.length - 8) * bh
      cam += (want - cam) * 0.1
      if (fall > 0) {
        if (--fall === 0) reset()
        return
      }
      const top = tower[tower.length - 1] as Blk
      const speed = Math.min(1.3, 0.55 + tower.length * 0.02)
      cur.x += cur.dir * speed
      const target = top.x + aim
      if (Math.abs(cur.x - target) <= speed / 2 + 0.01 || cur.x > W + 2 || cur.x < -cur.w - 2) {
        const perfect = Math.abs(cur.x - top.x) < 0.6
        if (perfect) cur.x = top.x
        const a = Math.max(cur.x, top.x)
        const b = Math.min(cur.x + cur.w, top.x + top.w)
        const c = hsv(hue + tower.length * 0.035, 0.5, 0.9)
        const y = baseY() - bh
        if (b - a <= 0.5) {
          cuts.push({ x: cur.x, y, w: cur.w, vy: 0, c })
          fall = 60
          return
        }
        if (cur.x < a) cuts.push({ x: cur.x, y, w: a - cur.x, vy: 0, c })
        if (cur.x + cur.w > b) cuts.push({ x: b, y, w: cur.x + cur.w - b, vy: 0, c })
        tower.push({ x: a, w: b - a, c })
        if (perfect) flash = 8
        next()
      }
    },
    draw(px) {
      sky(px, W, H, hsv(hue + tower.length * 0.035, 0.35, 0.45), hsv(hue + tower.length * 0.035 + 0.1, 0.4, 0.75))
      const y0 = baseY()
      tower.forEach((b, i) => {
        const y = y0 - i * bh + (tower.length - 1) * bh - (tower.length - 1) * bh
        const yy = H - 8 - i * bh + cam
        void y
        if (yy > H || yy < -bh) return
        rect(px, W, H, b.x, yy, b.w, bh, b.c)
        rect(px, W, H, b.x, yy, b.w, 1, mix(b.c, 0xffffff, 0.35))
        rect(px, W, H, b.x, yy + bh - 1, b.w, 1, scale(b.c, 0.75))
      })
      if (!fall) {
        const c = hsv(hue + tower.length * 0.035, 0.5, 0.9)
        const yy = H - 8 - tower.length * bh + cam
        rect(px, W, H, cur.x, yy, cur.w, bh, c)
        rect(px, W, H, cur.x, yy, cur.w, 1, mix(c, 0xffffff, 0.35))
      }
      for (const c of cuts) rect(px, W, H, c.x, c.y, c.w, bh, c.c)
      if (flash > 0) {
        const t = tower[tower.length - 1] as Blk
        const yy = H - 8 - (tower.length - 1) * bh + cam
        rect(px, W, H, t.x - (8 - flash) * 0.5, yy - 1, t.w + (8 - flash), 1, 0xffffff)
      }
      const s = String(tower.length - 1)
      text(px, W, H, W / 2 - textWidth(s) / 2, 3, s, 0xffffff)
    },
  }
}

// --- fruit slicing ----------------------------------------------------------------

const fruitslice: Maker = (W, H, rng) => {
  const KINDS = [
    { r: 3, skin: 0x2a8a2a, flesh: 0xff3a4a, stripe: 0x1a5a1a },
    { r: 2, skin: 0xff9a1a, flesh: 0xffd08a, stripe: 0xff9a1a },
    { r: 2, skin: 0xe02a2a, flesh: 0xfff0c0, stripe: 0xe02a2a },
    { r: 2, skin: 0x8a6a3a, flesh: 0x8ae04a, stripe: 0x8a6a3a },
    { r: 2, skin: 0xffe02a, flesh: 0xfff6a0, stripe: 0xffe02a },
  ]
  type F = { x: number; y: number; vx: number; vy: number; k: number; bomb: boolean; cut: boolean }
  let fruits: F[] = []
  let halves: { x: number; y: number; vx: number; vy: number; k: number; side: number }[] = []
  let juice: Spark[] = []
  const stains = new Float32Array(W * H)
  const stainC = new Uint32Array(W * H)
  let blade: [number, number][] = []
  let swipe: { x0: number; y0: number; x1: number; y1: number; t: number } | undefined
  let timer = 10
  let score = 0

  return {
    step() {
      for (let i = 0; i < stains.length; i++) if (stains[i]! > 0) stains[i] = Math.max(0, stains[i]! - 0.004)
      juice = sparks(juice, 0.12)
      if (--timer <= 0) {
        const n = 1 + irand(rng, 3)
        for (let k = 0; k < n; k++) {
          const x = W * (0.2 + rng() * 0.6)
          fruits.push({ x, y: H + 3, vx: (W / 2 - x) * 0.02 + (rng() - 0.5) * 0.4, vy: -(2.4 + rng() * 0.6) * Math.sqrt(H / 56), k: irand(rng, KINDS.length), bomb: rng() < 0.1, cut: false })
        }
        timer = 35 + irand(rng, 30)
      }
      for (const f of fruits) {
        f.vy += 0.07
        f.x += f.vx
        f.y += f.vy
      }
      for (const h of halves) {
        h.vy += 0.1
        h.x += h.vx
        h.y += h.vy
      }
      halves = halves.filter(h => h.y < H + 4)
      fruits = fruits.filter(f => f.y < H + 5 && !f.cut)
      if (!swipe) {
        const ready = fruits.filter(f => !f.bomb && f.vy > -0.4 && f.vy < 0.6 && f.y < H * 0.7)
        if (ready.length) {
          const f = pick(rng, ready)
          const a = rng() * Math.PI
          const len = 14
          swipe = { x0: f.x - Math.cos(a) * len, y0: f.y - Math.sin(a) * len, x1: f.x + Math.cos(a) * len, y1: f.y + Math.sin(a) * len, t: 0 }
        }
      }
      if (swipe) {
        swipe.t++
        const u = Math.min(1, swipe.t / 5)
        const x = swipe.x0 + (swipe.x1 - swipe.x0) * u
        const y = swipe.y0 + (swipe.y1 - swipe.y0) * u
        blade.push([x, y])
        for (const f of fruits) {
          if (f.cut || f.bomb) continue
          const k = KINDS[f.k] as { r: number; flesh: number }
          if (Math.hypot(f.x - x, f.y - y) < k.r + 1.5) {
            f.cut = true
            score++
            halves.push({ x: f.x - 1, y: f.y, vx: f.vx - 0.4, vy: f.vy, k: f.k, side: 0 }, { x: f.x + 1, y: f.y, vx: f.vx + 0.4, vy: f.vy, k: f.k, side: 1 })
            burst(juice, rng, f.x, f.y, k.flesh, 8, 1)
            for (let n = 0; n < 10; n++) {
              const sx = Math.round(f.x + (rng() - 0.5) * 8)
              const sy = Math.round(f.y + (rng() - 0.5) * 8)
              if (sx >= 0 && sy >= 0 && sx < W && sy < H) {
                stains[sy * W + sx] = 1
                stainC[sy * W + sx] = k.flesh
              }
            }
          }
        }
        if (swipe.t >= 5) swipe = undefined
      }
      if (blade.length > 6 || (!swipe && blade.length)) blade.shift()
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let c = x % 8 === 0 ? 0x5a3a1e : x % 8 < 4 ? 0x7a5230 : 0x6e4a2a
          if (y % 19 === (x >> 3) % 7) c = 0x5a3a1e
          const s = stains[y * W + x]!
          if (s > 0) c = mix(c, stainC[y * W + x] as number, Math.min(0.7, s))
          px[y * W + x] = c
        }
      for (const h of halves) {
        const k = KINDS[h.k] as { r: number; skin: number; flesh: number }
        disc(px, W, H, h.x, h.y, k.r - 0.3, k.skin)
        disc(px, W, H, h.x + (h.side ? -0.5 : 0.5), h.y, k.r - 1, k.flesh)
      }
      for (const f of fruits) {
        if (f.bomb) {
          lit(px, W, H, f.x, f.y, 2, 2, 0x2a2a34)
          dot(px, W, H, f.x - 1, f.y - 1, 0x5a5a6a)
          dot(px, W, H, f.x + 1, f.y - 3, Math.floor(f.y) % 2 ? 0xff4020 : 0xffe040)
          continue
        }
        const k = KINDS[f.k] as { r: number; skin: number; stripe: number }
        lit(px, W, H, f.x, f.y, k.r, k.r, k.skin)
        if (k.stripe !== k.skin) {
          dot(px, W, H, f.x - 1, f.y - 1, k.stripe)
          dot(px, W, H, f.x + 1, f.y, k.stripe)
          dot(px, W, H, f.x, f.y + 2, k.stripe)
        }
        dot(px, W, H, f.x - k.r * 0.5, f.y - k.r * 0.5, mix(k.skin, 0xffffff, 0.5))
      }
      for (const j of juice) dot(px, W, H, j.x, j.y, j.c)
      for (let i = 1; i < blade.length; i++) {
        const [ax, ay] = blade[i - 1] as [number, number]
        const [bx, by] = blade[i] as [number, number]
        line(px, W, H, ax, ay, bx, by, mix(0x8ad0ff, 0xffffff, i / blade.length))
      }
      text(px, W, H, 1, 1, String(score), 0xffe040)
    },
  }
}

// --- road and river hopper --------------------------------------------------------

const crossy: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.floor(W / cs)
  type Lane = { kind: number; v: number; len: number; gap: number; off: number; trees: Set<number>; c: number; warn: number }
  const lanes = new Map<number, Lane>()
  let cam = 0
  let col = Math.floor(cols / 2)
  let row = 0
  let fx = 0
  let hop = 0
  let fromRow = 0
  let fromX = 0
  let dead = 0
  let best = 0
  let t = 0

  const lane = (r: number): Lane => {
    let l = lanes.get(r)
    if (!l) {
      const k = r < 2 ? 0 : rng() < 0.35 ? 0 : rng() < 0.5 ? 1 : rng() < 0.75 ? 2 : 3
      const trees = new Set<number>()
      if (k === 0 && r > 1) for (let c = 0; c < cols; c++) if (rng() < 0.25) trees.add(c)
      l = {
        kind: k,
        v: (k === 3 ? 2.2 : 0.25 + rng() * 0.4) * (rng() < 0.5 ? 1 : -1),
        len: k === 1 ? 1.5 + irand(rng, 2) : k === 2 ? 2 + irand(rng, 2) : 9,
        gap: k === 3 ? 30 : 2 + irand(rng, 3),
        off: rng() * 40,
        trees,
        c: hsv(rng(), 0.7, 0.95),
        warn: 0,
      }
      lanes.set(r, l)
    }
    return l
  }
  const objs = (r: number, time: number): [number, number][] => {
    const l = lane(r)
    if (l.kind === 0) return []
    const p = (l.len + l.gap) * cs
    const shift = (((l.off * cs + l.v * time) % p) + p) % p
    const out: [number, number][] = []
    for (let x = shift - p; x < W + p; x += p) out.push([x, x + l.len * cs])
    return out
  }
  const safeAt = (r: number, x: number, time: number) => {
    const l = lane(r)
    if (x < 0.5 || x > W - 1.5) return false
    if (l.kind === 0) return !l.trees.has(Math.floor(x / cs))
    if (l.kind === 2) return objs(r, time).some(([a, b]) => x >= a + 0.5 && x <= b - 0.5)
    return !objs(r, time).some(([a, b]) => x + 2 > a && x - 2 < b)
  }
  const drift = (r: number) => (lane(r).kind === 2 ? lane(r).v : 0)
  function reset() {
    lanes.clear()
    cam = 0
    row = 0
    col = Math.floor(cols / 2)
    fx = col * cs + 2
    best = 0
  }
  reset()

  return {
    step() {
      t++
      if (dead > 0) {
        if (--dead === 0) reset()
        return
      }
      cam += (row - 3 - cam) * 0.08
      if (hop > 0) {
        hop--
        if (hop === 0) best = Math.max(best, row)
      } else {
        const ok = (r: number, x: number) => {
          let xx = x
          for (let k = 1; k <= 9; k++) {
            if (k > 4) xx += drift(r)
            if (k >= 4 && !safeAt(r, xx, t + k)) return false
          }
          return true
        }
        const stay = (() => {
          let xx = fx
          for (let k = 1; k <= 6; k++) {
            xx += drift(row)
            if (!safeAt(row, xx, t + k)) return false
          }
          return true
        })()
        const opts: [number, number][] = [[row + 1, fx]]
        const side = shuffle(rng, [
          [row, fx - cs],
          [row, fx + cs],
        ] as [number, number][])
        let go: [number, number] | undefined
        if (ok(row + 1, fx)) go = opts[0]
        else if (!stay) go = side.find(o => ok(o[0], o[1])) ?? ([row - 1, fx] as [number, number])
        if (go) {
          fromRow = row
          fromX = fx
          row = go[0]
          fx = go[1]
          hop = 4
        }
      }
      if (hop === 0) fx += drift(row)
      if (hop === 0 && !safeAt(row, fx, t)) dead = 35
      if (row < cam - 1) dead = 35
      for (const [r, l] of lanes) if (r < cam - 4) lanes.delete(r)
    },
    draw(px) {
      const rows = Math.ceil(H / cs) + 1
      for (let k = 0; k < rows; k++) {
        const r = Math.floor(cam) + k
        const y = H - (r - cam + 1) * cs
        const l = lane(r)
        const base = l.kind === 0 ? (r % 2 ? 0x8ad04a : 0x9ae05a) : l.kind === 1 ? 0x4a4a52 : l.kind === 2 ? 0x4aa0ff : 0x6a5a4a
        rect(px, W, H, 0, y, W, cs, base)
        if (l.kind === 3) {
          for (let x = 0; x < W; x += 2) dot(px, W, H, x, y + 1, 0x9a8a7a)
          rect(px, W, H, 0, y + 2, W, 1, 0xc0c0c8)
        }
        if (l.kind === 1) for (let x = 0; x < W; x += 4) dot(px, W, H, x, y + cs - 1, 0x8a8a92)
        for (const c of l.trees) {
          rect(px, W, H, c * cs, y, cs - 1, cs - 1, 0x2a7a2a)
          rect(px, W, H, c * cs, y, cs - 1, 1, 0x4aaa3a)
        }
        for (const [a, b] of objs(r, t)) {
          if (l.kind === 2) {
            rect(px, W, H, a, y + 1, b - a, cs - 2, 0x8a5a2a)
            rect(px, W, H, a, y + 1, b - a, 1, 0xb07a40)
          } else if (l.kind === 1) {
            rect(px, W, H, a, y, b - a, cs - 1, l.c)
            rect(px, W, H, a + 1, y, b - a - 2, 1, mix(l.c, 0xffffff, 0.4))
            rect(px, W, H, a, y + cs - 1, b - a, 1, 0x1a1a1a)
          } else if (l.kind === 3) {
            rect(px, W, H, a, y, b - a, cs - 1, 0xc83a3a)
            for (let x = a + 1; x < b - 1; x += 3) dot(px, W, H, x, y + 1, 0xa0d0ff)
          }
        }
      }
      const y = H - (row - cam + 1) * cs - (hop > 0 ? (fromRow - row) * cs * (hop / 4) * -1 + Math.sin((hop / 4) * Math.PI) * 2 : 0)
      const x = hop > 0 ? fx + (fromX - fx) * (hop / 4) : fx
      if (dead > 0) rect(px, W, H, x - 2, y + 1, 4, 2, 0xffffff)
      else {
        rect(px, W, H, x - 1.5, y, 3, 3, 0xffffff)
        dot(px, W, H, x - 1, y - 1, 0xff3a3a)
        dot(px, W, H, x + 1, y + 1, 0xffa020)
        dot(px, W, H, x - 1, y + 3, 0xd0d0d0)
      }
      text(px, W, H, 1, 1, String(best), 0xffffff)
    },
  }
}

// --- helix jump -------------------------------------------------------------------

const helix: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const R = W * 0.4
  const gap = 12
  const SEG = 12
  type Plat = { y: number; segs: number[]; gone: number }
  let plats: Plat[] = []
  let rot = 0
  let by = 0
  let vy = 0
  let cam = 0
  let score = 0
  let dead = 0
  let splats: { y: number; a: number }[] = []
  let hue = rng()

  const makePlat = (y: number, i: number): Plat => {
    const segs = Array(SEG).fill(1)
    {
      const g = irand(rng, SEG)
      segs[g] = 0
      if (rng() < 0.6) segs[(g + 1) % SEG] = 0
      for (let k = 0; k < SEG; k++) if (segs[k] && i > 1 && rng() < Math.min(0.3, i * 0.02)) segs[k] = 2
    }
    return { y, segs, gone: 0 }
  }
  function reset() {
    plats = []
    for (let i = 0; i < 12; i++) plats.push(makePlat(20 + i * gap, i))
    by = 10
    vy = 0
    cam = 0
    score = 0
    rot = 0
    splats = []
    hue = rng()
  }
  reset()
  const segAt = (p: Plat, a: number) => {
    const k = Math.floor(((((a / (Math.PI * 2)) % 1) + 1) % 1) * SEG)
    return k
  }

  return {
    step() {
      if (dead > 0) {
        if (--dead === 0) reset()
        return
      }
      const next = plats.find(p => p.y > by && !p.gone)
      if (next) {
        let best = rot
        let bd = Infinity
        for (let k = 0; k < SEG; k++) {
          if (next.segs[k] !== 0) continue
          const a = ((k + 0.5) / SEG) * Math.PI * 2
          let d = a - rot
          d = Math.atan2(Math.sin(d), Math.cos(d))
          if (Math.abs(d) < bd) {
            bd = Math.abs(d)
            best = rot + d
          }
        }
        rot += clamp(best - rot, -0.09, 0.09)
      }
      vy += 0.12
      const prev = by
      by += vy
      for (const p of plats) {
        if (p.gone || !(prev <= p.y - 1.5 && by > p.y - 1.5)) continue
        const s = p.segs[segAt(p, rot)]
        if (s === 0) {
          p.gone = 1
          score++
        } else if (s === 2) {
          dead = 45
          by = p.y - 1.5
        } else {
          by = p.y - 1.5
          vy = -1.9
          splats.push({ y: p.y, a: rot })
          if (splats.length > 20) splats.shift()
        }
      }
      for (const p of plats) if (p.gone) p.gone++
      cam += (by - H * 0.35 - cam) * 0.15
      plats = plats.filter(p => p.y > cam - 10)
      while (plats.length < 12) {
        const last = plats[plats.length - 1] as Plat
        plats.push(makePlat(last.y + gap, score + plats.length))
      }
    },
    draw(px) {
      sky(px, W, H, hsv(hue, 0.4, 0.95), hsv(hue + 0.1, 0.5, 0.75))
      const plat = (p: Plat, front: boolean) => {
        const y = p.y - cam + (p.gone ? p.gone * 0.6 : 0)
        if (y < -3 || y > H + 3) return
        for (let k = 0; k < 90; k++) {
          const a = (k / 90) * Math.PI * 2
          const rel = a - rot
          const z = Math.cos(rel)
          if (front !== z >= 0) continue
          const s = p.segs[Math.floor((k / 90) * SEG)]
          if (s === 0) continue
          const x = cx + Math.sin(rel) * R
          let c = s === 2 ? 0xe02a2a : hsv(hue + 0.5, 0.6, 0.95)
          c = scale(c, 0.6 + 0.4 * Math.max(0, z))
          if (p.gone) c = mix(c, 0xffffff, 0.5)
          dot(px, W, H, x, y, c)
          dot(px, W, H, x, y + 1, scale(c, 0.75))
        }
      }
      for (const p of plats) plat(p, false)
      rect(px, W, H, cx - 2, 0, 4, H, hsv(hue, 0.15, 0.98))
      rect(px, W, H, cx + 1, 0, 1, H, hsv(hue, 0.2, 0.85))
      for (const p of plats) plat(p, true)
      for (const s of splats) {
        const rel = s.a - rot
        if (Math.cos(rel) > 0) dot(px, W, H, cx + Math.sin(rel) * R, s.y - cam, hsv(hue + 0.8, 0.8, 0.9))
      }
      lit(px, W, H, cx, by - cam, 1.6, 1.6, dead ? 0xffffff : hsv(hue + 0.8, 0.85, 1))
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

// --- colour switch ----------------------------------------------------------------

const colorswitch: Maker = (W, H, rng) => {
  const COLS = [0xff3a8a, 0x3ad0ff, 0xffe03a, 0x8a3aff]
  const cx = (W - 1) / 2
  const R = Math.min(W * 0.32, 10)
  type Ring = { y: number; a: number; w: number; sw: boolean }
  let rings: Ring[] = []
  let by = 0
  let vy = 0
  let col = 0
  let cam = 0
  let score = 0
  let dead = 0
  let shards: Spark[] = []

  function reset() {
    rings = []
    for (let i = 0; i < 6; i++) rings.push({ y: -i * 34, a: rng() * 6, w: (0.025 + rng() * 0.02) * (i % 2 ? 1 : -1), sw: true })
    by = H * 0.75
    vy = 0
    cam = 0
    col = irand(rng, 4)
    score = 0
  }
  reset()
  const colourAt = (r: Ring, x: number, y: number) => {
    let a = Math.atan2(y - r.y, x - cx) - r.a
    a = ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
    return Math.floor(a / (Math.PI / 2))
  }
  // whether the ball stays safe for n frames, tapping now or not
  const safe = (tap: boolean, n: number) => {
    let y = by
    let v = tap ? -1.7 : vy
    for (let k = 1; k <= n; k++) {
      v += 0.1
      y += v
      for (const r of rings) {
        const a = r.a + r.w * k
        const d = Math.abs(y - r.y)
        if (Math.abs(d - R) < 2.2) {
          const rr = { ...r, a }
          if (colourAt(rr, cx, y) !== col) return false
        }
      }
      if (y > cam + H + 2) return false
    }
    return true
  }

  return {
    step() {
      shards = sparks(shards, 0.05)
      if (dead > 0) {
        if (--dead === 0) reset()
        return
      }
      for (const r of rings) r.a += r.w
      const hover = cam + H * 0.62
      if (by > hover && safe(true, 16)) vy = -1.7
      else if (by > cam + H * 0.85 && !safe(false, 6)) vy = -1.7
      vy += 0.1
      by += vy
      for (const r of rings) {
        if (Math.abs(Math.abs(by - r.y) - R) < 1.6 && colourAt(r, cx, by) !== col) {
          dead = 45
          burst(shards, rng, cx, by - cam, COLS[col] as number, 16, 1.5)
        }
        if (r.sw && by < r.y - R - 6) {
          r.sw = false
          col = (col + 1 + irand(rng, 3)) % 4
          score++
        }
      }
      if (by > cam + H + 3) {
        dead = 45
      }
      cam = Math.min(cam, by - H * 0.55)
      rings = rings.filter(r => r.y < cam + H + R + 4)
      while (rings.length < 6) {
        const last = rings[rings.length - 1] as Ring
        rings.push({ y: last.y - 34, a: rng() * 6, w: (0.025 + rng() * 0.025) * (rng() < 0.5 ? 1 : -1), sw: true })
      }
    },
    draw(px) {
      px.fill(0x1a1a24)
      for (const r of rings) {
        const y = r.y - cam
        for (let k = 0; k < 96; k++) {
          const a = (k / 96) * Math.PI * 2
          const c = COLS[Math.floor((((a - r.a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 2))] as number
          dot(px, W, H, cx + Math.cos(a) * R, y + Math.sin(a) * R, c)
          dot(px, W, H, cx + Math.cos(a) * (R - 1), y + Math.sin(a) * (R - 1), c)
        }
        if (r.sw) {
          const sy = y - R - 6
          for (let q = 0; q < 4; q++) dot(px, W, H, cx + (q % 2 ? 1 : -1) * 0.5, sy + (q < 2 ? -0.5 : 0.5), COLS[q] as number)
        }
        litSprite(px, W, H, cx - 1, y - 1, ['.x.', 'xxx', '.x.'], { x: 0xffffff })
      }
      if (!dead) lit(px, W, H, cx, by - cam, 1.6, 1.6, COLS[col] as number)
      for (const s of shards) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

// --- hole swallowing a city -------------------------------------------------------

const holecity: Maker = (W, H, rng) => {
  type Obj = { x: number; y: number; s: number; kind: number; c: number; fall: number; vx: number; vy: number }
  let objs: Obj[] = []
  let hole = { x: W / 2, y: H / 2, r: 2 }
  let total = 0
  let t = 0
  let hold = 0
  const road = 10

  function city() {
    objs = []
    for (let by = 2; by < H; by += road)
      for (let bx = 2; bx < W; bx += road) {
        const n = 1 + irand(rng, 2)
        for (let k = 0; k < n; k++) {
          const s = 2 + irand(rng, 4)
          objs.push({ x: bx + 1 + rng() * (road - 3 - s) + s / 2, y: by + 1 + rng() * (road - 3 - s) + s / 2, s, kind: 2, c: hsv(rng(), 0.35, 0.85), fall: 0, vx: 0, vy: 0 })
        }
        if (rng() < 0.6) objs.push({ x: bx + rng() * 6, y: by + rng() * 6, s: 1.5, kind: 1, c: 0x2a8a3a, fall: 0, vx: 0, vy: 0 })
      }
    for (let k = 0; k < 14; k++) {
      const horiz = rng() < 0.5
      const lane = Math.floor(rng() * (horiz ? H : W) / road) * road
      objs.push({ x: horiz ? rng() * W : lane, y: horiz ? lane : rng() * H, s: 1.2, kind: 3, c: hsv(rng(), 0.8, 1), fall: 0, vx: horiz ? 0.3 : 0, vy: horiz ? 0 : 0.3 })
    }
    for (let k = 0; k < 20; k++) objs.push({ x: rng() * W, y: rng() * H, s: 0.6, kind: 0, c: hsv(rng(), 0.5, 1), fall: 0, vx: 0, vy: 0 })
    total = objs.length
    hole = { x: W / 2, y: H / 2, r: 2 }
    t = 0
  }
  city()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) city()
        return
      }
      for (const o of objs) {
        if (o.fall) continue
        o.x = (o.x + o.vx + W) % W
        o.y = (o.y + o.vy + H) % H
      }
      const edible = objs.filter(o => !o.fall && o.s <= hole.r * 1.5)
      let target: Obj | undefined
      let bd = Infinity
      for (const o of edible) {
        const d = Math.hypot(o.x - hole.x, o.y - hole.y) - o.s * 2
        if (d < bd) {
          bd = d
          target = o
        }
      }
      if (target) {
        const d = Math.hypot(target.x - hole.x, target.y - hole.y) || 1
        const sp = 0.45
        hole.x += ((target.x - hole.x) / d) * Math.min(sp, d)
        hole.y += ((target.y - hole.y) / d) * Math.min(sp, d)
      }
      for (const o of objs) {
        if (o.fall) {
          o.fall++
          o.x += (hole.x - o.x) * 0.2
          o.y += (hole.y - o.y) * 0.2
          continue
        }
        if (o.s <= hole.r * 1.5 && Math.hypot(o.x - hole.x, o.y - hole.y) < hole.r) {
          o.fall = 1
          hole.r = Math.min(W * 0.45, hole.r + o.s * 0.05)
        }
      }
      objs = objs.filter(o => o.fall < 10)
      if (!objs.length || t > 900) hold = 50
    },
    draw(px) {
      px.fill(0xb8bcc4)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (x % road === 0 || y % road === 0) px[y * W + x] = 0x5a5e66
      for (let y = 0; y < H; y += road) for (let x = 3; x < W; x += 4) dot(px, W, H, x, y, 0xe0e070)
      ellipse(px, W, H, hole.x, hole.y, hole.r + 0.6, hole.r + 0.6, 0x3a3a8a)
      disc(px, W, H, hole.x, hole.y, hole.r, 0x050508)
      for (const o of objs) {
        const s = o.fall ? o.s * (1 - o.fall / 10) : o.s
        if (o.kind === 2) {
          rect(px, W, H, o.x - s / 2 + 1, o.y - s / 2 + 1, s, s, 0x7a7e86)
          rect(px, W, H, o.x - s / 2, o.y - s / 2, s, s, o.c)
          rect(px, W, H, o.x - s / 2, o.y - s / 2, s, 1, mix(o.c, 0xffffff, 0.4))
        } else if (o.kind === 1) lit(px, W, H, o.x, o.y, s, s, o.c)
        else rect(px, W, H, o.x, o.y, Math.max(1, s * 1.5), Math.max(1, s), o.c)
      }
      const pct = Math.round(((total - objs.length) / Math.max(1, total)) * 100)
      text(px, W, H, 1, 1, `${pct}%`, 0xffffff)
    },
  }
}

// --- territory painter ------------------------------------------------------------

const territory: Maker = (W, H, rng) => {
  const c = 2
  const GW = Math.max(6, Math.floor(W / c))
  const top = 6
  const GH = Math.max(6, Math.floor((H - top) / c))
  const COLS = [0xff4a6a, 0x4ab0ff, 0xffc03a]
  const owner = new Int8Array(GW * GH).fill(-1)
  const trail = new Int8Array(GW * GH).fill(-1)
  type P = { x: number; y: number; d: number; plan: number[]; alive: boolean; respawn: number }
  let ps: P[] = []
  let t = 0

  function spawn(i: number) {
    for (let tries = 0; tries < 100; tries++) {
      const x = 2 + irand(rng, GW - 4)
      const y = 2 + irand(rng, GH - 4)
      let free = true
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if (owner[(y + dy) * GW + x + dx] !== -1) free = false
      if (!free && tries < 90) continue
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) owner[(y + dy) * GW + x + dx] = i
      ps[i] = { x, y, d: irand(rng, 4), plan: [], alive: true, respawn: 0 }
      return
    }
  }
  function reset() {
    owner.fill(-1)
    trail.fill(-1)
    ps = []
    for (let i = 0; i < COLS.length; i++) spawn(i)
  }
  reset()
  const kill = (i: number) => {
    const p = ps[i] as P
    p.alive = false
    p.respawn = 40
    for (let k = 0; k < owner.length; k++) {
      if (owner[k] === i) owner[k] = -1
      if (trail[k] === i) trail[k] = -1
    }
  }
  const claim = (i: number) => {
    for (let k = 0; k < trail.length; k++)
      if (trail[k] === i) {
        trail[k] = -1
        owner[k] = i
      }
    const seen = new Uint8Array(GW * GH)
    const q: number[] = []
    for (let x = 0; x < GW; x++) for (const y of [0, GH - 1]) if (owner[y * GW + x] !== i && !seen[y * GW + x]) {
      seen[y * GW + x] = 1
      q.push(y * GW + x)
    }
    for (let y = 0; y < GH; y++) for (const x of [0, GW - 1]) if (owner[y * GW + x] !== i && !seen[y * GW + x]) {
      seen[y * GW + x] = 1
      q.push(y * GW + x)
    }
    for (let qi = 0; qi < q.length; qi++) {
      const k = q[qi] as number
      const x = k % GW
      const y = Math.floor(k / GW)
      for (const [dx, dy] of DIRS) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue
        const nk = ny * GW + nx
        if (seen[nk] || owner[nk] === i) continue
        seen[nk] = 1
        q.push(nk)
      }
    }
    for (let k = 0; k < owner.length; k++) if (!seen[k] && owner[k] !== i) owner[k] = i
  }
  const turnRight = (d: number) => [3, 2, 0, 1][d] as number
  const turnLeft = (d: number) => [2, 3, 1, 0][d] as number

  return {
    step() {
      t++
      if (t % 3) return
      ps.forEach((p, i) => {
        if (!p.alive) {
          if (--p.respawn === 0) spawn(i)
          return
        }
        if (!p.plan.length && owner[p.y * GW + p.x] === i) {
          const a = 3 + irand(rng, 4)
          const b = 2 + irand(rng, 4)
          const right = rng() < 0.5
          const d0 = irand(rng, 4)
          const d1 = right ? turnRight(d0) : turnLeft(d0)
          const d2 = right ? turnRight(d1) : turnLeft(d1)
          p.plan = [...Array(a).fill(d0), ...Array(b).fill(d1), ...Array(a + 2).fill(d2)]
        }
        let d = p.plan.length ? (p.plan.shift() as number) : p.d
        for (let tries = 0; tries < 4; tries++) {
          const [dx, dy] = DIRS[d] as [number, number]
          const nx = p.x + dx
          const ny = p.y + dy
          if (nx >= 0 && ny >= 0 && nx < GW && ny < GH && trail[ny * GW + nx] !== i && (d ^ 1) !== p.d) break
          d = turnRight(d)
          p.plan = []
        }
        p.d = d
        const [dx, dy] = DIRS[d] as [number, number]
        p.x = clamp(p.x + dx, 0, GW - 1)
        p.y = clamp(p.y + dy, 0, GH - 1)
        const k = p.y * GW + p.x
        const other = trail[k]!
        if (other >= 0 && other !== i) kill(other)
        if (owner[k] === i) {
          if (trail.includes(i)) claim(i)
        } else trail[k] = i
      })
      if (ps.some((p, i) => owner.filter(o => o === i).length > GW * GH * 0.6)) reset()
    },
    draw(px) {
      px.fill(0xf0f0f4)
      for (let y = 0; y < top; y++) for (let x = 0; x < W; x++) px[y * W + x] = 0xffffff
      for (let k = 0; k < GW * GH; k++) {
        const x = (k % GW) * c
        const y = top + Math.floor(k / GW) * c
        const o = owner[k]!
        const tr = trail[k]!
        if (o >= 0) rect(px, W, H, x, y, c, c, mix(COLS[o] as number, 0xffffff, 0.45))
        if (tr >= 0) rect(px, W, H, x, y, c, c, mix(COLS[tr] as number, 0xffffff, 0.15))
      }
      ps.forEach((p, i) => {
        if (!p.alive) return
        rect(px, W, H, p.x * c, top + p.y * c, c, c, scale(COLS[i] as number, 0.7))
        dot(px, W, H, p.x * c, top + p.y * c, 0xffffff)
      })
      let x = 0
      COLS.forEach((col, i) => {
        const n = owner.filter(o => o === i).length
        const w = Math.round((n / (GW * GH)) * W)
        rect(px, W, H, x, 1, w, 3, col)
        x += w
      })
    },
  }
}

// --- cell eater -------------------------------------------------------------------

const cells: Maker = (W, H, rng) => {
  type C = Ball & { tx: number; ty: number; dead: number }
  let cs: C[] = []
  let pellets: [number, number, number][] = []

  function reset() {
    cs = Array.from({ length: 7 }, (_, i) => ({ x: rng() * W, y: rng() * H, vx: 0, vy: 0, r: 1.3 + rng() * 2, c: hsv(i / 7, 0.65, 0.95), tx: 0, ty: 0, dead: 0 }))
    pellets = Array.from({ length: 50 }, () => [rng() * W, rng() * H, hsv(rng(), 0.7, 1)] as [number, number, number])
  }
  reset()

  return {
    step() {
      for (const c of cs) {
        if (c.dead > 0) {
          if (--c.dead === 0) {
            c.r = 1.3
            c.x = rng() * W
            c.y = rng() * H
          }
          continue
        }
        let tx = c.x
        let ty = c.y
        let best = Infinity
        for (const o of cs) {
          if (o === c || o.dead) continue
          const d = Math.hypot(o.x - c.x, o.y - c.y)
          if (o.r > c.r * 1.12 && d < o.r + 8) {
            tx = c.x - (o.x - c.x) * 3
            ty = c.y - (o.y - c.y) * 3
            best = -1
            break
          }
          if (c.r > o.r * 1.12 && d < 18 && d - 6 < best) {
            best = d - 6
            tx = o.x
            ty = o.y
          }
        }
        if (best === Infinity)
          for (const [px0, py0] of pellets) {
            const d = Math.hypot(px0 - c.x, py0 - c.y)
            if (d < best) {
              best = d
              tx = px0
              ty = py0
            }
          }
        const d = Math.hypot(tx - c.x, ty - c.y) || 1
        const sp = 0.9 / Math.sqrt(c.r)
        c.x = clamp(c.x + ((tx - c.x) / d) * sp, c.r, W - 1 - c.r)
        c.y = clamp(c.y + ((ty - c.y) / d) * sp, c.r, H - 1 - c.r)
        pellets = pellets.filter(([px0, py0]) => {
          if (Math.hypot(px0 - c.x, py0 - c.y) < c.r) {
            c.r = Math.sqrt(c.r * c.r + 0.3)
            return false
          }
          return true
        })
      }
      for (const a of cs)
        for (const b of cs) {
          if (a === b || a.dead || b.dead) continue
          if (a.r > b.r * 1.12 && Math.hypot(a.x - b.x, a.y - b.y) < a.r - b.r * 0.4) {
            a.r = Math.sqrt(a.r * a.r + b.r * b.r)
            b.dead = 40
          }
        }
      while (pellets.length < 50) pellets.push([rng() * W, rng() * H, hsv(rng(), 0.7, 1)])
      if (cs.some(c => c.r > Math.min(W, H) * 0.32)) reset()
    },
    draw(px) {
      px.fill(0xf4f6f8)
      for (let y = 0; y < H; y += 4) for (let x = 0; x < W; x++) px[y * W + x] = 0xdfe3e8
      for (let x = 0; x < W; x += 4) for (let y = 0; y < H; y++) px[y * W + x] = 0xdfe3e8
      for (const [x, y, c] of pellets) dot(px, W, H, x, y, c)
      const live = cs.filter(c => !c.dead).sort((a, b) => a.r - b.r)
      for (const c of live) {
        lit(px, W, H, c.x, c.y, c.r, c.r, c.c, scale(c.c, 0.6))
      }
    },
  }
}

// --- match-3 cascade --------------------------------------------------------------

const match3: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.max(4, Math.floor(W / cs))
  const rows = Math.max(5, Math.min(11, Math.floor((H - 8) / cs)))
  const ox = Math.floor((W - cols * cs) / 2)
  const oy = H - rows * cs - 2
  const COLS = [0xff3a4a, 0x3a8aff, 0xffd02a, 0x3ad05a, 0xb05aff, 0xff8a2a]
  const SHAPES = [
    ['.x.', 'xxx', '.x.'],
    ['xxx', 'xxx', 'xxx'],
    ['.x.', 'xxx', 'xxx'],
    ['x.x', 'xxx', 'x.x'],
    ['xxx', 'x.x', 'xxx'],
    ['.x.', 'x.x', '.x.'],
  ]
  let g: number[] = []
  let off: number[] = []
  let phase = 0
  let t = 0
  let swap: [number, number] = [0, 0]
  let clear = new Set<number>()
  let score = 0

  const runs = (b: number[]) => {
    const out = new Set<number>()
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const v = b[y * cols + x]
        if (x + 2 < cols && b[y * cols + x + 1] === v && b[y * cols + x + 2] === v) for (let k = 0; k < 3; k++) out.add(y * cols + x + k)
        if (y + 2 < rows && b[(y + 1) * cols + x] === v && b[(y + 2) * cols + x] === v) for (let k = 0; k < 3; k++) out.add((y + k) * cols + x)
      }
    return out
  }
  function fill() {
    do {
      g = Array.from({ length: cols * rows }, () => irand(rng, 5))
    } while (runs(g).size)
    off = Array(cols * rows).fill(0)
  }
  fill()
  function choose(): [number, number] | undefined {
    let best: [number, number] | undefined
    let bs = 0
    for (let i = 0; i < cols * rows; i++)
      for (const j of [i + 1, i + cols]) {
        if (j >= cols * rows || (j === i + 1 && j % cols === 0)) continue
        const b = g.slice()
        ;[b[i], b[j]] = [b[j] as number, b[i] as number]
        const n = runs(b).size + rng() * 0.5
        if (n > bs) {
          bs = n
          best = [i, j]
        }
      }
    return best
  }

  return {
    step() {
      t++
      for (let i = 0; i < off.length; i++) if (off[i]! > 0) off[i] = Math.max(0, off[i]! - 0.6)
      if (off.some(o => o > 0)) return
      if (phase === 0) {
        if (t < 20) return
        const s = choose()
        if (!s) {
          fill()
          return
        }
        swap = s
        phase = 1
        t = 0
      } else if (phase === 1 && t >= 6) {
        const [i, j] = swap
        ;[g[i], g[j]] = [g[j] as number, g[i] as number]
        clear = runs(g)
        phase = 2
        t = 0
      } else if (phase === 2 && t >= 8) {
        score += clear.size * 10
        for (const k of clear) g[k] = -1
        for (let x = 0; x < cols; x++) {
          const col: number[] = []
          for (let y = rows - 1; y >= 0; y--) if (g[y * cols + x]! >= 0) col.push(g[y * cols + x]!)
          const missing = rows - col.length
          for (let y = rows - 1, k = 0; y >= 0; y--, k++) {
            const was = g[y * cols + x]
            g[y * cols + x] = col[k] ?? irand(rng, 5)
            if (k >= col.length) off[y * cols + x] = missing * cs
            else if (was === -1 || clear.size) off[y * cols + x] = 0
          }
          // pieces above holes fall by the number of holes below them
          let holes = 0
          for (let y = rows - 1; y >= 0; y--) {
            const k = y * cols + x
            if (clear.has(k)) holes++
            else if (holes && y < rows) off[k + holes * cols] = Math.max(off[k + holes * cols] ?? 0, holes * cs)
          }
        }
        clear = runs(g)
        phase = clear.size ? 2 : 0
        t = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0x3a1a5a, 0x1a2a6a)
      rect(px, W, H, ox - 1, oy - 1, cols * cs + 2, rows * cs + 2, 0x2a1a4a)
      for (let i = 0; i < cols * rows; i++) {
        const x = ox + (i % cols) * cs
        const y = oy + Math.floor(i / cols) * cs
        if ((i % cols) % 2 === Math.floor(i / cols) % 2) rect(px, W, H, x, y, cs, cs, 0x342258)
        const v = g[i]!
        if (v < 0) continue
        let dx = 0
        let dy = 0
        if (phase === 1) {
          const [a, b] = swap
          const f = t / 6
          if (i === a || i === b) {
            const o = i === a ? b : a
            dx = ((o % cols) - (i % cols)) * cs * f
            dy = (Math.floor(o / cols) - Math.floor(i / cols)) * cs * f
          }
        }
        const lit = phase === 2 && clear.has(i) && t % 4 < 2
        litSprite(px, W, H, x + dx, y + dy - off[i]!, SHAPES[v] as string[], { x: lit ? 0xffffff : (COLS[v] as number) })
        dot(px, W, H, x + dx, y + dy - off[i]!, mix(COLS[v] as number, 0xffffff, 0.6))
      }
      text(px, W, H, 1, 1, String(score), 0xffe040)
    },
  }
}

// --- block blast ------------------------------------------------------------------

const PIECES: [number, number][][] = [
  [[0, 0]],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [1, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [0, 1],
    [1, 1],
    [2, 1],
    [0, 2],
    [1, 2],
    [2, 2],
  ],
]

const blockblast: Maker = (W, H, rng) => {
  const n = 8
  const cs = Math.max(2, Math.floor(W / n))
  const ox = Math.floor((W - n * cs) / 2)
  const oy = 7
  const trayY = oy + n * cs + 4
  let b: number[] = []
  let tray: { p: number; c: number }[] = []
  let moving: { p: number; c: number; x: number; y: number; tx: number; ty: number; t: number; from: number } | undefined
  let flash: Set<number> | undefined
  let ft = 0
  let score = 0
  let over = 0

  function deal() {
    tray = [0, 1, 2].map(() => ({ p: irand(rng, PIECES.length), c: hsv(rng(), 0.7, 1) }))
  }
  function reset() {
    b = Array(n * n).fill(-1)
    deal()
    score = 0
  }
  reset()
  const fits = (p: number, x: number, y: number) =>
    (PIECES[p] as [number, number][]).every(([dx, dy]) => x + dx < n && y + dy < n && b[(y + dy) * n + x + dx] === -1)
  const lines = (bb: number[]) => {
    const out = new Set<number>()
    for (let y = 0; y < n; y++) if ([...Array(n).keys()].every(x => bb[y * n + x] !== -1)) for (let x = 0; x < n; x++) out.add(y * n + x)
    for (let x = 0; x < n; x++) if ([...Array(n).keys()].every(y => bb[y * n + x] !== -1)) for (let y = 0; y < n; y++) out.add(y * n + x)
    return out
  }

  return {
    step() {
      if (over > 0) {
        if (--over === 0) reset()
        return
      }
      if (flash) {
        if (--ft <= 0) {
          for (const k of flash) b[k] = -1
          flash = undefined
        }
        return
      }
      if (moving) {
        moving.t++
        const f = Math.min(1, moving.t / 10)
        moving.x = moving.x + (moving.tx - moving.x) * f
        moving.y = moving.y + (moving.ty - moving.y) * f
        if (moving.t >= 10) {
          const ox2 = Math.round((moving.tx - ox) / cs)
          const oy2 = Math.round((moving.ty - oy) / cs)
          for (const [dx, dy] of PIECES[moving.p] as [number, number][]) b[(oy2 + dy) * n + ox2 + dx] = moving.c
          score += (PIECES[moving.p] as [number, number][]).length
          tray.splice(moving.from, 1)
          moving = undefined
          const l = lines(b)
          if (l.size) {
            flash = l
            ft = 10
            score += l.size * 2
          }
          if (!tray.length) deal()
        }
        return
      }
      let best: { i: number; x: number; y: number; s: number } | undefined
      tray.forEach((tp, i) => {
        for (let y = 0; y < n; y++)
          for (let x = 0; x < n; x++) {
            if (!fits(tp.p, x, y)) continue
            const bb = b.slice()
            for (const [dx, dy] of PIECES[tp.p] as [number, number][]) bb[(y + dy) * n + x + dx] = 0
            let s = lines(bb).size * 5
            for (const [dx, dy] of PIECES[tp.p] as [number, number][])
              for (const [ex, ey] of DIRS) {
                const nx = x + dx + ex
                const ny = y + dy + ey
                if (nx < 0 || ny < 0 || nx >= n || ny >= n || bb[ny * n + nx] !== -1) s += 0.5
              }
            s += rng() * 0.3
            if (!best || s > best.s) best = { i, x, y, s }
          }
      })
      if (!best) {
        over = 60
        return
      }
      const tp = tray[best.i] as { p: number; c: number }
      moving = { p: tp.p, c: tp.c, x: 3 + best.i * (W / 3), y: trayY, tx: ox + best.x * cs, ty: oy + best.y * cs, t: 0, from: best.i }
    },
    draw(px) {
      sky(px, W, H, 0x2a3a7a, 0x1a2050)
      rect(px, W, H, ox - 1, oy - 1, n * cs + 1, n * cs + 1, 0x141a3a)
      for (let i = 0; i < n * n; i++) {
        const x = ox + (i % n) * cs
        const y = oy + Math.floor(i / n) * cs
        const v = b[i]!
        const lit = flash?.has(i) && ft % 4 < 2
        const cc = over > 0 && v !== -1 ? 0x6a6a7a : v === -1 ? 0x222a52 : lit ? 0xffffff : v
        if (v === -1) rect(px, W, H, x, y, cs - 1, cs - 1, cc)
        else slab(px, W, H, x, y, cs - 1, cs - 1, cc)
        if (v !== -1 && !lit) dot(px, W, H, x, y, mix(v, 0xffffff, 0.5))
      }
      tray.forEach((tp, i) => {
        if (moving && moving.from === i) return
        for (const [dx, dy] of PIECES[tp.p] as [number, number][]) rect(px, W, H, 2 + i * (W / 3) + dx * 2, trayY + dy * 2, 2, 2, tp.c)
      })
      if (moving) for (const [dx, dy] of PIECES[moving.p] as [number, number][]) rect(px, W, H, moving.x + dx * cs, moving.y + dy * cs, cs - 1, cs - 1, moving.c)
      text(px, W, H, 1, 0, String(score), 0xffffff)
    },
  }
}

// --- zigzag -----------------------------------------------------------------------

const zigzag: Maker = (W, H, rng) => {
  const tw = 6
  const th = 3
  let path: { x: number; y: number; d: number; gem: boolean }[] = []
  let u = 0
  let fall = 0
  let score = 0
  let hue = rng()
  let late = false

  function build() {
    path = [{ x: 0, y: 0, d: 1, gem: false }]
    let d = 1
    while (path.length < 400) {
      const n = 2 + irand(rng, 5)
      for (let k = 0; k < n; k++) {
        const p = path[path.length - 1] as { x: number; y: number }
        path.push({ x: p.x + d * tw * 0.5, y: p.y - th * 0.5, d, gem: rng() < 0.08 })
      }
      d = -d
    }
    u = 0
    score = 0
    late = false
  }
  build()

  return {
    step() {
      hue += 0.0008
      if (fall > 0) {
        if (--fall === 0) build()
        return
      }
      u += 0.13
      const i = Math.floor(u)
      const cur = path[i]
      const nxt = path[i + 1]
      if (cur && nxt && cur.d !== nxt.d && u - i > 0.5 && !late && rng() < 0.004) late = true
      if (late && u - i > 0.95) {
        fall = 50
        late = false
      }
      const p = path[Math.round(u)]
      if (p?.gem) {
        p.gem = false
        score += 2
      }
      if (u % 1 < 0.13) score++
    },
    draw(px) {
      sky(px, W, H, hsv(hue, 0.5, 0.9), hsv(hue + 0.1, 0.6, 0.7))
      const i = Math.floor(u)
      const a = path[i] as { x: number; y: number }
      const b = path[i + 1] ?? a
      const f = u - i
      let bx = a.x + (b.x - a.x) * f
      let by = a.y + (b.y - a.y) * f
      if (fall > 0) {
        const d = (path[i] as { d: number }).d
        bx += d * (50 - fall) * 0.3
        by += (50 - fall) * 0.15 + ((50 - fall) * (50 - fall)) * 0.01
      }
      const camX = W / 2 - (a.x + (b.x - a.x) * f)
      const camY = H * 0.65 - (a.y + (b.y - a.y) * f)
      const top = mix(hsv(hue + 0.5, 0.2, 1), 0xffffff, 0.3)
      const left = hsv(hue + 0.5, 0.5, 0.75)
      const right = hsv(hue + 0.5, 0.5, 0.55)
      for (let k = Math.max(0, i - 12); k < Math.min(path.length, i + 40); k++) {
        const p = path[path.length - 1 - (path.length - 1 - k)] as { x: number; y: number; gem: boolean }
        const drop = k < i - 1 ? (i - 1 - k) * 1.5 + f * 1.5 : 0
        const x = p.x + camX
        const y = p.y + camY + drop
        if (y < -6 || y > H + 6) continue
        poly(px, W, H, [[x - tw / 2, y], [x, y - th / 2], [x + tw / 2, y], [x, y + th / 2]], top)
        rect(px, W, H, x - tw / 2, y + 1, tw / 2, 4, left)
        rect(px, W, H, x, y + 1, tw / 2, 4, right)
        poly(px, W, H, [[x - tw / 2, y], [x, y - th / 2], [x + tw / 2, y], [x, y + th / 2]], top)
        if (p.gem) dot(px, W, H, x, y - 1, 0xff3aa0)
      }
      lit(px, W, H, bx + camX, by + camY - 1.5, 1.6, 1.6, 0xf4f4f8)
      text(px, W, H, W / 2 - textWidth(String(score)) / 2, 2, String(score), 0xffffff)
    },
  }
}

// --- knife throw ------------------------------------------------------------------

const knives: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.32
  const R = Math.min(W * 0.27, 9)
  let ang = 0
  let w = 0.04
  let t = 0
  let stuck: number[] = []
  let apples: number[] = []
  let left = 7
  let level = 1
  let fly: { y: number } | undefined
  let bounce: { x: number; y: number; vx: number; vy: number; a: number } | undefined
  let chunks: { x: number; y: number; vx: number; vy: number; c: number }[] = []
  let hold = 0

  function setup(keep: boolean) {
    if (!keep) level = 1
    stuck = Array.from({ length: Math.min(4, level - 1) }, () => rng() * Math.PI * 2)
    apples = rng() < 0.6 ? [rng() * Math.PI * 2] : []
    left = 6 + Math.min(4, level)
    ang = 0
  }
  setup(false)
  const at = (a: number) => (((Math.PI / 2 - a) % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
  const clash = (a: number) => stuck.some(s => Math.abs(Math.atan2(Math.sin(s - a), Math.cos(s - a))) < 0.28)

  return {
    step() {
      t++
      for (const c of chunks) {
        c.vy += 0.12
        c.x += c.vx
        c.y += c.vy
      }
      chunks = chunks.filter(c => c.y < H + 4)
      if (bounce) {
        bounce.vy += 0.12
        bounce.x += bounce.vx
        bounce.y += bounce.vy
        bounce.a += 0.4
        if (bounce.y > H + 6) bounce = undefined
      }
      if (hold > 0) {
        if (--hold === 0) setup(true)
        return
      }
      w = 0.045 * Math.sin(t * 0.012 * (1 + level * 0.2)) + 0.02 * (level % 2 ? 1 : -1)
      ang += w
      if (!fly) {
        const travel = (H - 8 - (cy + R)) / 3
        const future = at(ang + w * travel)
        if (left > 0 && !bounce && (!clash(future) || rng() < 0.003) && rng() < 0.08) fly = { y: H - 8 }
        return
      }
      fly.y -= 3
      if (fly.y <= cy + R) {
        const a = at(ang)
        if (clash(a)) {
          bounce = { x: cx, y: cy + R + 2, vx: (rng() - 0.5) * 1.5, vy: 1, a: 0 }
          fly = undefined
          hold = 50
          level = 0
          return
        }
        apples = apples.filter(p => {
          if (Math.abs(Math.atan2(Math.sin(p - a), Math.cos(p - a))) < 0.4) {
            for (let k = 0; k < 6; k++) chunks.push({ x: cx, y: cy + R, vx: (rng() - 0.5) * 2, vy: -rng() * 2, c: 0xe02a2a })
            return false
          }
          return true
        })
        stuck.push(a)
        left--
        fly = undefined
        if (left === 0) {
          for (let k = 0; k < 14; k++) chunks.push({ x: cx + (rng() - 0.5) * R, y: cy + (rng() - 0.5) * R, vx: (rng() - 0.5) * 2.5, vy: -rng() * 2.5, c: k % 2 ? 0xc88a4a : 0x8a5a2a })
          level++
          hold = 40
          stuck = []
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a1a3a, 0x4a2a4a)
      const knife = (x0: number, y0: number, dx: number, dy: number) => {
        line(px, W, H, x0, y0, x0 + dx * 4, y0 + dy * 4, 0xe0e6ee)
        line(px, W, H, x0 + dx * 5, y0 + dy * 5, x0 + dx * 7, y0 + dy * 7, 0x8a4a2a)
      }
      if (!(hold > 0 && left === 0)) {
        for (const s of stuck) {
          const a = s + ang
          knife(cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1), Math.cos(a), Math.sin(a))
        }
        lit(px, W, H, cx, cy, R, R, 0xb8783a, 0x6a3a14)
        ring(px, W, H, cx, cy, R * 0.66, 0x9a6230)
        ring(px, W, H, cx, cy, R * 0.33, 0x9a6230)
        ring(px, W, H, cx, cy, R, 0x7a4a22)
        for (let k = 0; k < 3; k++) {
          const a = ang + k * 2.1
          line(px, W, H, cx, cy, cx + Math.cos(a) * R * 0.9, cy + Math.sin(a) * R * 0.9, 0xa86a32)
        }
        for (const p of apples) {
          const a = p + ang
          lit(px, W, H, cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2), 1.6, 1.6, 0xe02a2a)
        }
      }
      for (const c of chunks) dot(px, W, H, c.x, c.y, c.c)
      if (fly) knife(cx, fly.y, 0, 1)
      else if (left > 0 && !hold) knife(cx, H - 8, 0, 1)
      if (bounce) knife(bounce.x, bounce.y, Math.cos(bounce.a), Math.sin(bounce.a))
      for (let k = 0; k < left; k++) rect(px, W, H, 1, H - 3 - k * 3, 1, 2, 0xe0e6ee)
      text(px, W, H, 1, 1, String(level), 0xffffff)
    },
  }
}

// --- runner gates (+10, x2) -------------------------------------------------------

const crowdrun: Maker = (W, H, rng) => {
  const yh = Math.round(H * 0.22)
  const yb = Math.round(H * 0.82)
  const K = 18
  type Gate = { z: number; ops: [string, number][]; done: boolean }
  type Foe = { z: number; n: number; done: boolean }
  let gates: Gate[] = []
  let foes: Foe[] = []
  let boss = { z: 0, n: 0 }
  let cam = 0
  let n = 5
  let lane = 0
  let fight = 0
  let end = 0
  let won = false
  let dots: [number, number][] = []

  const apply = ([op, v]: [string, number], x: number) => (op === '+' ? x + v : op === 'x' ? x * v : op === '-' ? Math.max(0, x - v) : Math.floor(x / v))
  function reset() {
    gates = []
    foes = []
    for (let k = 0; k < 6; k++) {
      const good: [string, number] = rng() < 0.5 ? ['+', 5 + irand(rng, 4) * 5] : ['x', 2 + irand(rng, 2)]
      const bad: [string, number] = rng() < 0.5 ? ['-', 5 + irand(rng, 4) * 5] : ['/', 2]
      gates.push({ z: 30 + k * 45, ops: rng() < 0.5 ? [good, bad] : [bad, good], done: false })
      if (k % 2) foes.push({ z: 52 + k * 45, n: 5 + irand(rng, 15), done: false })
    }
    boss = { z: 30 + 6 * 45 + 20, n: 40 + irand(rng, 60) }
    cam = 0
    n = 5
    lane = 0
    fight = 0
    end = 0
  }
  reset()
  const proj = (d: number): [number, number] => {
    const s = K / (Math.max(0.1, d) + K)
    return [yh + (yb - yh) * s, s]
  }

  return {
    step() {
      if (end > 0) {
        if (--end === 0) reset()
        return
      }
      if (fight) {
        if (n > 0 && boss.n > 0) {
          n--
          boss.n--
        } else {
          won = n > 0
          end = 70
        }
        return
      }
      cam += 0.35
      const g = gates.find(q => !q.done && q.z > cam)
      if (g) {
        const l = apply(g.ops[0] as [string, number], n)
        const r = apply(g.ops[1] as [string, number], n)
        const want = l >= r ? -1 : 1
        lane += clamp(want - lane, -0.05, 0.05)
        if (g.z - cam < 0.4) {
          g.done = true
          n = apply(g.ops[lane < 0 ? 0 : 1] as [string, number], n)
        }
      }
      for (const f of foes)
        if (!f.done && f.z - cam < 0.4) {
          f.done = true
          n = Math.max(0, n - f.n)
        }
      if (n === 0) {
        won = false
        end = 60
      }
      if (boss.z - cam < 2) fight = 1
      const m = Math.min(n, 60)
      while (dots.length < m) dots.push([0, 0])
      dots.length = m
      dots = dots.map((_, i) => {
        const a = i * 2.4
        const r = Math.sqrt(i) * 1.1
        return [Math.cos(a) * r, Math.sin(a) * r * 0.5]
      })
    },
    draw(px) {
      sky(px, W, H, 0x6ac0ff, 0xd8f0ff, yh)
      rect(px, W, H, 0, yh, W, H - yh, 0x7ad06a)
      const roadAt = (y: number) => {
        const s = (y - yh) / (yb - yh)
        return W * (0.12 + 0.42 * s)
      }
      for (let y = yh; y < H; y++) {
        const hw = roadAt(y)
        rect(px, W, H, W / 2 - hw, y, hw * 2, 1, 0x9aa0b0)
        dot(px, W, H, W / 2 - hw, y, 0xffffff)
        dot(px, W, H, W / 2 + hw, y, 0xffffff)
      }
      for (const g of gates) {
        if (g.done) continue
        const [y, s] = proj(g.z - cam)
        if (y < yh) continue
        const hw = roadAt(y)
        g.ops.forEach((op, i) => {
          const good = op[0] === '+' || op[0] === 'x'
          const x0 = i === 0 ? W / 2 - hw : W / 2
          const h = Math.max(1, 8 * s)
          for (let yy = y - h; yy < y; yy++) for (let x = x0; x < x0 + hw; x++) if ((x + yy) % 2 === 0) dot(px, W, H, x, yy, good ? 0x3a9aff : 0xff4a4a)
          if (s > 0.45) {
            const label = op[0] + op[1]
            text(px, W, H, x0 + hw / 2 - textWidth(label) / 2, y - h - 6, label, 0xffffff)
          }
        })
      }
      for (const f of foes) {
        if (f.done) continue
        const [y, s] = proj(f.z - cam)
        if (y < yh) continue
        for (let i = 0; i < Math.min(f.n, 20); i++) dot(px, W, H, W / 2 + Math.cos(i * 2.4) * Math.sqrt(i) * 1.1 * s, y - 1 + Math.sin(i * 2.4) * Math.sqrt(i) * 0.5 * s, 0xe02a2a)
      }
      {
        const [y, s] = proj(boss.z - cam)
        if (y >= yh) {
          const h = Math.max(2, 18 * s)
          rect(px, W, H, W / 2 - h * 0.25, y - h, h * 0.5, h, 0xe02a2a)
          disc(px, W, H, W / 2, y - h - h * 0.15, h * 0.15, 0xe02a2a)
          if (s > 0.3) text(px, W, H, W / 2 - textWidth(String(boss.n)) / 2, y - h - h * 0.3 - 6, String(boss.n), 0xffffff)
        }
      }
      const cx = W / 2 + lane * W * 0.22
      for (const [dx, dy] of dots) {
        dot(px, W, H, cx + dx, yb + 3 + dy, 0x2a6aff)
        dot(px, W, H, cx + dx, yb + 2 + dy, 0x8ab8ff)
      }
      const label = String(n)
      text(px, W, H, cx - textWidth(label) / 2, yb - 7 - Math.sqrt(dots.length) * 0.5, label, 0xffffff)
      if (end > 0 && won) for (let i = 0; i < 14; i++) dot(px, W, H, (i * 7 + end * 3) % W, (end * 2 + i * 11) % H, hsv(i / 14, 0.8, 1))
    },
  }
}

// --- pull the pin -----------------------------------------------------------------

const pullpin: Maker = (W, H, rng) => {
  const EMPTY = 0
  const WALL = 1
  const GOLD = 2
  const LAVA = 3
  const WATER = 4
  const STONE = 5
  const PIN = 6
  const grid = new Uint8Array(W * H)
  const pinOf = new Int8Array(W * H).fill(-1)
  let pins: { x: number; y: number; w: number; out: number; pulled: boolean }[] = []
  let order: number[] = []
  let oi = 0
  let t = 0
  let state = 0
  let hold = 0
  let collected = 0
  const heroX = Math.round(W * 0.5)
  const floor = H - 4

  function level() {
    grid.fill(EMPTY)
    pinOf.fill(-1)
    const box = (x0: number, y0: number, x1: number, y1: number) => {
      for (let x = x0; x <= x1; x++) {
        grid[y0 * W + x] = WALL
        grid[y1 * W + x] = WALL
      }
      for (let y = y0; y <= y1; y++) {
        grid[y * W + x0] = WALL
        grid[y * W + x1] = WALL
      }
    }
    box(1, 3, W - 2, floor)
    const mid = Math.round(W / 2)
    const yA = Math.round(H * 0.3)
    const yB = Math.round(H * 0.55)
    for (let y = 3; y < yA; y++) grid[y * W + mid] = WALL
    pins = []
    const addPin = (x0: number, y: number, w: number) => {
      const i = pins.length
      pins.push({ x: x0, y, w, out: 0, pulled: false })
      for (let x = x0; x < x0 + w; x++) {
        grid[y * W + x] = PIN
        pinOf[y * W + x] = i
      }
    }
    addPin(2, yA, mid - 2)
    addPin(mid + 1, yA, W - 3 - mid)
    const fill = (x0: number, y0: number, x1: number, y1: number, v: number) => {
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (grid[y * W + x] === EMPTY && rng() < 0.92) grid[y * W + x] = v
    }
    const goldLeft = rng() < 0.5
    fill(goldLeft ? 2 : mid + 1, 6, goldLeft ? mid - 1 : W - 3, yA - 1, GOLD)
    fill(goldLeft ? mid + 1 : 2, 6, goldLeft ? W - 3 : mid - 1, yA - 1, LAVA)
    for (let x = 2; x < W - 2; x++) if (x < W * 0.25 || x > W * 0.75) grid[yB * W + x] = WALL
    addPin(Math.round(W * 0.25), yB, Math.round(W * 0.5))
    fill(2, yA + 2, W - 3, yB - 1, EMPTY)
    for (let y = yB - 6; y < yB; y++) for (let x = Math.round(W * 0.27); x < W * 0.73; x++) if (grid[y * W + x] === EMPTY) grid[y * W + x] = WATER
    const lavaPin = goldLeft ? 1 : 0
    const goldPin = goldLeft ? 0 : 1
    // the right order: water down first, then lava onto it (stone), then gold
    order = rng() < 0.75 ? [2, lavaPin, goldPin] : [lavaPin, 2, goldPin]
    oi = 0
    t = 0
    state = 0
    collected = 0
  }
  level()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) level()
        return
      }
      for (const p of pins)
        if (p.pulled && p.out < p.w + 4) {
          p.out += 1
          for (let x = p.x; x < p.x + p.w; x++) if (x < p.x + p.out && pinOf[p.y * W + x] >= 0) {
            grid[p.y * W + x] = EMPTY
            pinOf[p.y * W + x] = -1
          }
        }
      if (t % 45 === 0 && oi < order.length) (pins[order[oi++] as number] as { pulled: boolean }).pulled = true
      for (let y = H - 2; y >= 0; y--) {
        const ltr = (y + t) % 2 === 0
        for (let i = 0; i < W; i++) {
          const x = ltr ? i : W - 1 - i
          const k = y * W + x
          const v = grid[k]!
          if (v === EMPTY || v === WALL || v === PIN || v === STONE) continue
          const below = k + W
          const free = (j: number) => grid[j] === EMPTY
          if (v === LAVA) {
            for (const j of [k - 1, k + 1, k - W, k + W])
              if (grid[j] === WATER) {
                grid[k] = STONE
                grid[j] = EMPTY
                break
              }
            if (grid[k] === STONE) continue
          }
          const dir = rng() < 0.5 ? -1 : 1
          if (free(below)) {
            grid[below] = v
            grid[k] = EMPTY
          } else if (x + dir >= 0 && x + dir < W && free(below + dir)) {
            grid[below + dir] = v
            grid[k] = EMPTY
          } else if ((v === WATER || v === LAVA) && x + dir >= 0 && x + dir < W && free(k + dir) && rng() < (v === LAVA ? 0.4 : 0.9)) {
            grid[k + dir] = v
            grid[k] = EMPTY
          }
        }
      }
      for (let x = 2; x < W - 2; x++) {
        const k = (floor - 1) * W + x
        if (Math.abs(x - heroX) < 3 && grid[k] === GOLD) {
          grid[k] = EMPTY
          collected++
        }
        for (let y = floor - 6; y < floor; y++) if (Math.abs(x - heroX) < 2 && grid[y * W + x] === LAVA && state === 0) {
          state = 2
          hold = 70
        }
      }
      if (state === 0 && collected > 25) {
        state = 1
        hold = 70
      }
      if (t > 500 && !hold) hold = 30
    },
    draw(px) {
      px.fill(0x2a2a3a)
      for (let k = 0; k < W * H; k++) {
        const v = grid[k]!
        const y = Math.floor(k / W)
        const x = k % W
        if (v === WALL) px[k] = 0x9aa0b4
        else if (v === PIN) px[k] = 0xffd040
        else if (v === GOLD) px[k] = (x + y) % 3 ? 0xffd030 : 0xfff0a0
        else if (v === LAVA) px[k] = (x * 3 + y + (t >> 2)) % 5 ? 0xff4a1a : 0xffa020
        else if (v === WATER) px[k] = (x + y + (t >> 3)) % 4 ? 0x2a8aff : 0x6ab8ff
        else if (v === STONE) px[k] = (x + y) % 2 ? 0x6a6a72 : 0x5a5a62
        else px[k] = y < 3 ? 0x1a1a24 : 0x3a3a50
      }
      for (const p of pins) if (p.pulled && p.out > 0) rect(px, W, H, p.x + p.out, p.y, Math.min(4, p.w), 1, 0xffd040)
      const hy = floor - 6
      const burnt = state === 2
      litSprite(px, W, H, heroX - 1, hy, ['.h.', 'sss', 'bbb', 'b.b', 'k.k'], { h: burnt ? 0x2a2a2a : 0x8a5a2a, s: burnt ? 0x3a3a3a : 0xffd0a0, b: burnt ? 0x2a2a2a : 0x3a6aff, k: 0x1a1a1a })
      if (state === 1 && t % 10 < 5) ring(px, W, H, heroX, hy + 2, 4, 0xffe040)
      text(px, W, H, 1, 0, String(collected), 0xffd040)
    },
  }
}

// --- parking jam ------------------------------------------------------------------

const parking: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.max(4, Math.floor((W - 6) / cs))
  const rows = Math.max(5, Math.floor((H - 14) / cs))
  const ox = Math.floor((W - cols * cs) / 2)
  const oy = Math.floor((H - rows * cs) / 2) + 2
  type Car = { x: number; y: number; len: number; d: number; c: number; gone: boolean; px: number; py: number; moving: number; bump: number }
  let cars: Car[] = []
  let wait = 20
  let count = 0

  const cellsOf = (c: Car) => Array.from({ length: c.len }, (_, k) => [c.x + (c.d < 2 ? k : 0), c.y + (c.d >= 2 ? k : 0)] as [number, number])
  const occupied = (list: Car[]) => {
    const s = new Set<number>()
    for (const c of list) if (!c.gone) for (const [x, y] of cellsOf(c)) s.add(y * cols + x)
    return s
  }
  const clearPath = (c: Car, list: Car[]) => {
    const occ = occupied(list.filter(o => o !== c))
    const [dx, dy] = DIRS[c.d] as [number, number]
    const cellsC = cellsOf(c)
    const head = c.d === 0 || c.d === 2 ? (cellsC[cellsC.length - 1] as [number, number]) : (cellsC[0] as [number, number])
    let [x, y] = head
    for (;;) {
      x += dx
      y += dy
      if (x < 0 || y < 0 || x >= cols || y >= rows) return true
      if (occ.has(y * cols + x)) return false
    }
  }
  function lot() {
    for (let tries = 0; tries < 30; tries++) {
      const list: Car[] = []
      for (let k = 0; k < 40 && list.length < cols * rows * 0.32; k++) {
        const d = irand(rng, 4)
        const len = 2 + (rng() < 0.2 ? 1 : 0)
        const x = irand(rng, cols - (d < 2 ? len - 1 : 0))
        const y = irand(rng, rows - (d >= 2 ? len - 1 : 0))
        const car: Car = { x, y, len, d, c: hsv(rng(), 0.7, 0.95), gone: false, px: 0, py: 0, moving: 0, bump: 0 }
        const occ = occupied(list)
        if (cellsOf(car).some(([cx, cy]) => occ.has(cy * cols + cx))) continue
        list.push(car)
      }
      const sim = list.map(c => ({ ...c }))
      let progress = true
      while (progress) {
        progress = false
        for (const c of sim) if (!c.gone && clearPath(c, sim)) {
          c.gone = true
          progress = true
        }
      }
      if (sim.every(c => c.gone) || tries === 29) {
        cars = list
        return
      }
    }
  }
  lot()

  return {
    step() {
      for (const c of cars) {
        if (c.bump > 0) {
          c.bump--
          const [dx, dy] = DIRS[c.d] as [number, number]
          const k = c.bump > 6 ? 12 - c.bump : c.bump
          c.px = dx * k * 0.3
          c.py = dy * k * 0.3
          continue
        }
        if (!c.moving) continue
        const [dx, dy] = DIRS[c.d] as [number, number]
        c.moving += 0.12
        c.px = dx * c.moving * c.moving
        c.py = dy * c.moving * c.moving
        if (Math.abs(c.px) > W + 10 || Math.abs(c.py) > H + 10) {
          c.gone = true
          c.moving = 0
        }
      }
      if (--wait > 0) return
      const live = cars.filter(c => !c.gone && !c.moving)
      if (!live.length) {
        if (cars.every(c => c.gone)) {
          lot()
          wait = 30
        }
        return
      }
      const free = live.filter(c => clearPath(c, cars.filter(o => !o.moving)))
      if (free.length && rng() > 0.12) {
        pick(rng, free).moving = 0.5
        count++
      } else pick(rng, live).bump = 12
      wait = 12
    },
    draw(px) {
      px.fill(0x3a3e46)
      rect(px, W, H, ox - 1, oy - 1, cols * cs + 2, rows * cs + 2, 0x2a2e36)
      for (let x = 0; x <= cols; x++) for (let y = 0; y < rows * cs; y += 2) dot(px, W, H, ox + x * cs - 1, oy + y, 0x5a5e66)
      for (let x = 0; x < W; x += 6) {
        dot(px, W, H, x, oy - 3, 0xe0e070)
        dot(px, W, H, x, oy + rows * cs + 2, 0xe0e070)
      }
      for (const c of cars) {
        if (c.gone) continue
        const cl = cellsOf(c)
        const xs = cl.map(([x]) => x)
        const ys = cl.map(([, y]) => y)
        const x0 = ox + Math.min(...xs) * cs + c.px
        const y0 = oy + Math.min(...ys) * cs + c.py
        const w = (Math.max(...xs) - Math.min(...xs) + 1) * cs - 1
        const h = (Math.max(...ys) - Math.min(...ys) + 1) * cs - 1
        rect(px, W, H, x0, y0, w, h, c.c)
        rect(px, W, H, x0 + 1, y0 + 1, w - 2, h - 2, scale(c.c, 0.8))
        const [dx, dy] = DIRS[c.d] as [number, number]
        if (dx) rect(px, W, H, dx > 0 ? x0 + w - 2 : x0 + 1, y0 + 1, 1, h - 2, 0xa8d8ff)
        else rect(px, W, H, x0 + 1, dy > 0 ? y0 + h - 2 : y0 + 1, w - 2, 1, 0xa8d8ff)
      }
      text(px, W, H, 1, 0, String(count), 0xffffff)
    },
  }
}

// --- water sort -------------------------------------------------------------------

const watersort: Maker = (W, H, rng) => {
  const C = W >= 26 ? 4 : 3
  const cap = 4
  const T = C + 2
  const COLS = [0xff4a6a, 0x3ab0ff, 0xffd03a, 0x5ae06a, 0xb05aff]
  const pitch = Math.floor(W / T)
  const lh = 3
  const top = Math.round(H * 0.38)
  const bottom = top + cap * lh + 1
  const tx = (i: number) => Math.floor((W - pitch * T) / 2) + i * pitch + Math.floor(pitch / 2)
  let tubes: number[][] = []
  let moves: [number, number][] = []
  let mi = 0
  let anim: { a: number; b: number; t: number; n: number; c: number } | undefined
  let hold = 0
  let count = 0

  const runTop = (t: number[]) => {
    let n = 0
    for (let k = t.length - 1; k >= 0 && t[k] === t[t.length - 1]; k--) n++
    return n
  }
  function solve(start: number[][]): [number, number][] | undefined {
    const st = start.map(t => t.slice())
    const seen = new Set<string>()
    const path: [number, number][] = []
    const done = () => st.every(t => !t.length || (t.length === cap && t.every(c => c === t[0])))
    const dfs = (d: number): boolean => {
      if (done()) return true
      if (d > 50 || seen.size > 15000) return false
      const k = st.map(t => t.join('')).sort().join('|')
      if (seen.has(k)) return false
      seen.add(k)
      for (let a = 0; a < T; a++) {
        const A = st[a] as number[]
        if (!A.length || (A.length === cap && A.every(c => c === A[0]))) continue
        const top = A[A.length - 1] as number
        const n = runTop(A)
        for (let b = 0; b < T; b++) {
          const B = st[b] as number[]
          if (a === b || B.length >= cap || (B.length && B[B.length - 1] !== top) || (!B.length && n === A.length)) continue
          const m = Math.min(n, cap - B.length)
          for (let i = 0; i < m; i++) B.push(A.pop() as number)
          path.push([a, b])
          if (dfs(d + 1)) return true
          path.pop()
          for (let i = 0; i < m; i++) A.push(B.pop() as number)
        }
      }
      return false
    }
    return dfs(0) ? path : undefined
  }
  function deal() {
    for (;;) {
      const cols = shuffle(rng, Array.from({ length: C * cap }, (_, i) => Math.floor(i / cap)))
      tubes = Array.from({ length: T }, (_, i) => (i < C ? cols.slice(i * cap, i * cap + cap) : []))
      const p = solve(tubes)
      if (p && p.length > 5) {
        moves = p
        break
      }
    }
    mi = 0
    count = 0
  }
  deal()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) deal()
        return
      }
      if (!anim) {
        const m = moves[mi]
        if (!m) {
          hold = 60
          return
        }
        const A = tubes[m[0]] as number[]
        const B = tubes[m[1]] as number[]
        anim = { a: m[0], b: m[1], t: 0, n: Math.min(runTop(A), cap - B.length), c: A[A.length - 1] as number }
        return
      }
      anim.t++
      if (anim.t > 12 && anim.t <= 12 + anim.n * 6 && (anim.t - 12) % 6 === 0) (tubes[anim.b] as number[]).push((tubes[anim.a] as number[]).pop() as number)
      if (anim.t >= 24 + anim.n * 6) {
        anim = undefined
        mi++
        count++
      }
    },
    draw(px) {
      sky(px, W, H, 0x162638, 0x2a1a3a)
      ellipse(px, W, H, W / 2, bottom - cap * lh * 0.4, W * 0.6, cap * lh + 6, 0x22283e)
      for (let i = 0; i < T; i++) {
        let x = tx(i)
        let y = 0
        if (anim && anim.a === i) {
          const lift = anim.t < 12 ? anim.t / 12 : anim.t > 12 + anim.n * 6 ? Math.max(0, 1 - (anim.t - 12 - anim.n * 6) / 12) : 1
          x += (tx(anim.b) - 2 - x) * lift
          y = -10 * lift
        }
        // the liquid: lit on the left, shaded on the right, a bright surface line
        ;(tubes[i] as number[]).forEach((c, k) => {
          const col = COLS[c] as number
          const ly = bottom + y - (k + 1) * lh
          rect(px, W, H, x - 1, ly, 3, lh, col)
          rect(px, W, H, x - 1, ly, 1, lh, mix(col, 0xffffff, 0.25))
          rect(px, W, H, x + 1, ly, 1, lh, scale(col, 0.78))
          if (k === (tubes[i] as number[]).length - 1) rect(px, W, H, x - 1, ly, 3, 1, mix(col, 0xffffff, 0.45))
        })
        // the glass: a bright left wall, a dimmer right wall, a lip
        rect(px, W, H, x - 2, top + y, 1, cap * lh + 1, 0xe8f0ff)
        rect(px, W, H, x + 2, top + y, 1, cap * lh + 1, 0x8a9ac0)
        rect(px, W, H, x - 1, bottom + y, 3, 1, 0xa8b8e0)
        dot(px, W, H, x - 2, top + y - 1, 0xffffff)
        dot(px, W, H, x + 2, top + y - 1, 0xb8c8e8)
        const full = (tubes[i] as number[]).length === cap && (tubes[i] as number[]).every(c => c === (tubes[i] as number[])[0])
        if (full && !anim) rect(px, W, H, x - 1, top - 1, 3, 1, COLS[(tubes[i] as number[])[0] as number] as number)
      }
      if (anim && anim.t > 12 && anim.t <= 12 + anim.n * 6) {
        const x = tx(anim.b)
        const col = COLS[anim.c] as number
        line(px, W, H, x, top - 10, x, bottom - (tubes[anim.b] as number[]).length * lh, col)
        line(px, W, H, x + 1, top - 9, x + 1, bottom - (tubes[anim.b] as number[]).length * lh, scale(col, 0.75))
      }
      text(px, W, H, 1, 1, String(count), 0xffffff)
    },
  }
}

// --- doodle jump ------------------------------------------------------------------

const doodle: Maker = (W, H, rng) => {
  type Plat = { x: number; y: number; type: number; vx: number; broken: number }
  let plats: Plat[] = []
  let d = { x: W / 2, y: H - 10, vx: 0, vy: -2.6 }
  let face = 1
  let cam = 0
  let best = 0
  let dead = 0

  function reset() {
    plats = []
    let y = H - 4
    while (y > -H * 2) {
      plats.push({ x: 2 + rng() * (W - 9), y, type: 0, vx: 0, broken: 0 })
      y -= 6 + rng() * 7
    }
    plats[0]!.x = W / 2 - 3
    d = { x: W / 2, y: H - 10, vx: 0, vy: -2.6 }
    cam = 0
    best = 0
  }
  reset()
  const gen = () => {
    let top = Math.min(...plats.map(p => p.y))
    while (top > cam - H) {
      top -= 6 + rng() * Math.min(10, 6 + best / 60)
      const r = rng()
      plats.push({ x: 2 + rng() * (W - 9), y: top, type: r < 0.12 ? 1 : r < 0.22 ? 2 : r < 0.3 ? 3 : 0, vx: r < 0.12 ? 0.3 : 0, broken: 0 })
    }
  }

  return {
    step() {
      if (dead > 0) {
        d.vy += 0.12
        d.y += d.vy
        if (--dead === 0) reset()
        return
      }
      for (const p of plats) {
        if (p.type === 1) {
          p.x += p.vx
          if (p.x < 1 || p.x > W - 8) p.vx = -p.vx
        }
        if (p.broken) p.y += 1.2
      }
      // steer to the best platform above that a jump can reach
      const reach = plats.filter(p => p.y < d.y - 2 && p.y > d.y - 26 && p.type !== 2 && !p.broken)
      const target = reach.sort((a, b) => a.y - b.y)[0]
      const tx = target ? target.x + 3 : d.x
      if (d.vy > -1.5 || !target) d.vx += clamp((tx - d.x) * 0.05 - d.vx, -0.15, 0.15)
      d.vx = clamp(d.vx, -0.9, 0.9)
      d.x += d.vx
      // it turns to face the way it drifts, snout first
      if (Math.abs(d.vx) > 0.15) face = d.vx > 0 ? 1 : -1
      if (d.x < -2) d.x = W + 1
      if (d.x > W + 2) d.x = -1
      d.vy += 0.1
      const prev = d.y
      d.y += d.vy
      if (d.vy > 0)
        for (const p of plats) {
          if (p.broken) continue
          if (prev <= p.y && d.y >= p.y && d.x + 2 > p.x && d.x - 2 < p.x + 6) {
            if (p.type === 2) {
              p.broken = 1
              continue
            }
            d.y = p.y
            d.vy = p.type === 3 ? -4 : -2.6
          }
        }
      cam = Math.min(cam, d.y - H * 0.45)
      best = Math.max(best, Math.round(-cam))
      plats = plats.filter(p => p.y < cam + H + 4)
      gen()
      if (d.y > cam + H + 3) dead = 40
    },
    draw(px) {
      px.fill(0xfaf4e4)
      const off = Math.floor(-cam) % 4
      for (let y = (off + 4) % 4; y < H; y += 4) for (let x = 0; x < W; x++) px[y * W + x] = 0xe8e0f0
      for (let x = 0; x < W; x += 4) for (let y = 0; y < H; y++) px[y * W + x] = 0xe8e0f0
      for (const p of plats) {
        const y = p.y - cam
        const c = p.type === 1 ? 0x3a9aff : p.type === 2 ? 0xa86a3a : 0x5ac83a
        rect(px, W, H, p.x, y, 7, 2, c)
        rect(px, W, H, p.x, y + 1, 7, 1, scale(c, 0.7))
        if (p.type === 3) rect(px, W, H, p.x + 3, y - 2, 2, 2, 0xa0a0b0)
      }
      const x = d.x - 2
      const y = d.y - cam - 5
      const DOODLER = ['.ggg.', 'ggwgg', 'ggggs', 'gyyy.', '.k.k.']
      litSprite(px, W, H, x, y, face > 0 ? DOODLER : DOODLER.map(r => r.split('').reverse().join('')), { g: 0x8ad83a, w: 0x000000, s: 0x8ad83a, y: 0x5aa02a, k: 0x2a2a2a })
      text(px, W, H, 1, 1, String(best), 0x3a3a5a)
    },
  }
}

// --- slingshot birds --------------------------------------------------------------

const slingshot: Maker = (W, H, rng) => {
  const ground = H - 6
  const sx = 5
  const sy = ground - 8
  type Blk = { x: number; y: number; w: number; h: number; vx: number; vy: number; stone: boolean }
  type Pig = { x: number; y: number; vy: number; dead: number }
  let blocks: Blk[] = []
  let pigs: Pig[] = []
  let bird: (Ball & { on: boolean }) | undefined
  let birds = 3
  let wait = 30
  let trail: [number, number][] = []
  let score = 0
  let hold = 0

  function build() {
    blocks = []
    pigs = []
    const bx = Math.round(W * 0.62)
    const levels = 2 + irand(rng, 2)
    let y = ground
    for (let l = 0; l < levels; l++) {
      const stone = rng() < 0.3
      blocks.push({ x: bx, y: y - 6, w: 1, h: 6, vx: 0, vy: 0, stone })
      blocks.push({ x: bx + 7, y: y - 6, w: 1, h: 6, vx: 0, vy: 0, stone })
      blocks.push({ x: bx - 1, y: y - 7, w: 10, h: 1, vx: 0, vy: 0, stone })
      pigs.push({ x: bx + 4, y: y - 1.5, vy: 0, dead: 0 })
      y -= 7
    }
    pigs.push({ x: bx + 4, y: y - 1.5, vy: 0, dead: 0 })
    birds = 3
  }
  build()
  const overlap = (a: Blk, b: Blk) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      for (const b of blocks) {
        b.vy += 0.1
        b.x += b.vx
        b.y += b.vy
        b.vx *= 0.92
        if (b.y + b.h > ground) {
          b.y = ground - b.h
          b.vy = 0
        }
        for (const o of blocks) {
          if (o === b || !overlap(b, o)) continue
          if (b.y < o.y && b.vy >= 0) {
            b.y = o.y - b.h
            b.vy = 0
          }
        }
      }
      for (const p of pigs) {
        if (p.dead) {
          p.dead++
          continue
        }
        p.vy += 0.1
        p.y += p.vy
        let rest = ground - 1.5
        for (const b of blocks) if (p.x > b.x - 1 && p.x < b.x + b.w + 1 && b.y >= p.y - 1 && b.y - 1.5 < rest) rest = b.y - 1.5
        if (p.y >= rest) {
          if (p.vy > 1.2) p.dead = 1
          p.y = rest
          p.vy = 0
        }
        if (blocks.some(b => Math.abs(b.vx) > 0.3 && Math.abs(b.x + b.w / 2 - p.x) < b.w / 2 + 1.5 && Math.abs(b.y + b.h / 2 - p.y) < b.h / 2 + 1.5)) p.dead = 1
      }
      for (const p of pigs) if (p.dead === 1) score += 500
      if (bird && !bird.on) {
        bird.vy += 0.08
        bird.x += bird.vx
        bird.y += bird.vy
        trail.push([bird.x, bird.y])
        for (const b of blocks) {
          if (bird.x + 1 > b.x && bird.x - 1 < b.x + b.w && bird.y + 1 > b.y && bird.y - 1 < b.y + b.h) {
            b.vx += bird.vx * (b.stone ? 0.3 : 0.8)
            b.vy -= 0.3
            bird.vx *= 0.5
            bird.vy *= 0.5
          }
        }
        for (const p of pigs) if (!p.dead && Math.hypot(p.x - bird.x, p.y - bird.y) < 2.7) p.dead = 1
        if (bird.y > ground - 1) {
          bird.y = ground - 1
          bird.vy = -bird.vy * 0.3
          bird.vx *= 0.7
        }
        if ((Math.abs(bird.vx) < 0.05 && bird.y >= ground - 1.5) || bird.x > W + 3) bird = undefined
      }
      pigs = pigs.filter(p => p.dead < 20)
      if (!pigs.length && !bird) {
        hold = 50
        return
      }
      if (!bird) {
        if (--wait > 0) return
        if (birds === 0) {
          hold = 40
          return
        }
        birds--
        trail = []
        const target = pigs[pigs.length - 1] ?? { x: W * 0.7, y: ground }
        const T = 22 + irand(rng, 10)
        const vx = (target.x - sx) / T
        const vy = (target.y - sy - 0.5 * 0.08 * T * T) / T
        bird = { x: sx, y: sy, vx: vx * (0.92 + rng() * 0.16), vy, r: 1.2, c: 0xe02a2a, on: true }
        wait = 25
      } else if (bird.on && --wait <= 0) bird.on = false
    },
    draw(px) {
      sky(px, W, H, 0x8ad0ff, 0xe0f4ff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x6ab84a)
      rect(px, W, H, 0, ground + 1, W, H - ground - 1, 0x8a6a3a)
      for (const [x, y] of trail) if ((x | 0) % 3 === 0) dot(px, W, H, x, y, 0xffffff)
      line(px, W, H, sx, ground, sx, sy + 2, 0x6a3a1a)
      line(px, W, H, sx, sy + 2, sx - 2, sy - 1, 0x6a3a1a)
      line(px, W, H, sx, sy + 2, sx + 2, sy - 1, 0x6a3a1a)
      for (const b of blocks) {
        slab(px, W, H, b.x, b.y, b.w, b.h, b.stone ? 0x9a9aa8 : 0xd8a050)
        if (b.w > 2) rect(px, W, H, b.x, b.y, b.w, 1, b.stone ? 0xc0c0cc : 0xf0c070)
      }
      for (const p of pigs) {
        if (p.dead) {
          if (p.dead < 10) ring(px, W, H, p.x, p.y, p.dead * 0.4, 0xffffff)
          continue
        }
        lit(px, W, H, p.x, p.y, 1.6, 1.6, 0x6ad04a)
        dot(px, W, H, p.x - 1, p.y - 1, 0xffffff)
        dot(px, W, H, p.x + 1, p.y - 1, 0xffffff)
        dot(px, W, H, p.x, p.y, 0x3a8a2a)
      }
      if (bird) {
        lit(px, W, H, bird.x, bird.y, 1.5, 1.5, 0xe02a2a)
        dot(px, W, H, bird.x + 1, bird.y - 1, 0xffffff)
        dot(px, W, H, bird.x + 1, bird.y, 0xffa020)
      }
      for (let i = 0; i < birds; i++) disc(px, W, H, 2 + i * 3, ground - 1, 1, 0xe02a2a)
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

// --- merge watermelon -------------------------------------------------------------

const FRUIT = [0xe0202a, 0xff5a7a, 0x9a3aff, 0xffa020, 0xff7a2a, 0xe02a2a, 0xf0e04a, 0xffb0c0, 0xf0d020, 0x8ae06a, 0x2a9a3a]

const suika: Maker = (W, H, rng) => {
  const x0 = 2
  const x1 = W - 3
  const bottom = H - 4
  const line0 = 12
  const radius = (k: number) => Math.min(W * 0.32, [1.3, 1.7, 2.2, 2.7, 3.2, 3.8, 4.4, 5.1, 5.9, 6.7, 7.6][k] as number)
  type F = Ball & { k: number }
  let fruits: F[] = []
  let hand = W / 2
  let target = W / 2
  let next = 0
  let wait = 20
  let over = 0
  let danger = 0
  let score = 0
  let pops: Spark[] = []

  function reset() {
    fruits = []
    score = 0
    next = irand(rng, 4)
  }
  reset()
  function choose() {
    let best = W / 2
    let bs = -Infinity
    for (let x = x0 + 2; x <= x1 - 2; x += 1) {
      const r = radius(next)
      let surface = bottom
      let match = false
      for (const f of fruits)
        if (Math.abs(f.x - x) < f.r + r) {
          const top = f.y - f.r
          if (top < surface) {
            surface = top
            match = f.k === next
          }
        }
      const s = surface * 0.15 + (match ? 8 : 0) + rng() * 0.6
      if (s > bs) {
        bs = s
        best = x
      }
    }
    target = best
  }
  choose()

  return {
    step() {
      pops = sparks(pops, 0.04)
      if (over > 0) {
        for (const f of fruits) {
          f.vy += 0.15
          f.y += f.vy
        }
        if (--over === 0) reset()
        return
      }
      hand += clamp(target - hand, -0.8, 0.8)
      if (--wait <= 0 && Math.abs(target - hand) < 0.5) {
        fruits.push({ x: hand, y: 6, vx: 0, vy: 0, r: radius(next), c: FRUIT[next] as number, k: next })
        next = irand(rng, 5)
        wait = 28
        choose()
      }
      for (let s = 0; s < 3; s++) {
        for (const f of fruits) {
          f.vy += 0.08 / 3
          f.x += f.vx / 3
          f.y += f.vy / 3
          if (f.x - f.r < x0) {
            f.x = x0 + f.r
            f.vx = Math.abs(f.vx) * 0.3
          }
          if (f.x + f.r > x1) {
            f.x = x1 - f.r
            f.vx = -Math.abs(f.vx) * 0.3
          }
          if (f.y + f.r > bottom) {
            f.y = bottom - f.r
            f.vy = -Math.abs(f.vy) * 0.2
            f.vx *= 0.9
          }
        }
        for (let i = 0; i < fruits.length; i++)
          for (let j = i + 1; j < fruits.length; j++) {
            const a = fruits[i] as F
            const b = fruits[j] as F
            if (a.k === b.k && Math.hypot(a.x - b.x, a.y - b.y) < a.r + b.r + 0.3 && a.k >= 0 && b.k >= 0) {
              const k = a.k + 1
              burst(pops, rng, (a.x + b.x) / 2, (a.y + b.y) / 2, a.c, 8, 0.8)
              score += (k + 1) * 2
              a.k = -1
              b.k = -1
              if (k <= 10) fruits.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, vx: 0, vy: -0.3, r: radius(k), c: FRUIT[k] as number, k })
            } else collide(a, b, 0.15)
          }
        fruits = fruits.filter(f => f.k >= 0)
      }
      for (const f of fruits) {
        f.vx *= 0.99
        f.vy *= 0.995
      }
      danger = fruits.some(f => f.y - f.r < line0 && Math.abs(f.vy) < 0.1) ? danger + 1 : 0
      if (danger > 40) over = 50
    },
    draw(px) {
      px.fill(0xf6e8c8)
      rect(px, W, H, x0 - 1, line0 - 2, 1, bottom - line0 + 3, 0xc89a5a)
      rect(px, W, H, x1 + 1, line0 - 2, 1, bottom - line0 + 3, 0xc89a5a)
      rect(px, W, H, x0 - 1, bottom + 1, x1 - x0 + 3, 1, 0xc89a5a)
      rect(px, W, H, x0, bottom - 0, x1 - x0 + 1, 1, 0xe8d0a0)
      for (let x = x0; x <= x1; x += 2) dot(px, W, H, x, line0, danger > 0 && danger % 6 < 3 ? 0xff3a3a : 0xe0b080)
      for (const f of fruits) {
        lit(px, W, H, f.x, f.y, f.r, f.r, f.c, scale(f.c, 0.55))
        dot(px, W, H, f.x - f.r * 0.4, f.y - f.r * 0.4, mix(f.c, 0xffffff, 0.6))
        if (f.k === 10) for (let k = -2; k <= 2; k += 2) line(px, W, H, f.x + k, f.y - f.r + 1, f.x + k, f.y + f.r - 1, 0x1a6a2a)
      }
      for (const p of pops) dot(px, W, H, p.x, p.y, p.c)
      if (!over) {
        line(px, W, H, hand, 2, hand, 4, 0x8a6a4a)
        lit(px, W, H, hand, 6, radius(next), radius(next), FRUIT[next] as number)
      }
      text(px, W, H, 1, 1, String(score), 0x8a5a2a)
    },
  }
}

// --- screw jam ----------------------------------------------------------------------

const screwjam: Maker = (W, H, rng) => {
  // plates held by coloured screws: each screw undone flies to the box of its colour, and loose plates fall
  const COLORS = [0xe8423a, 0x3a8ae8, 0xf0c030, 0x4ac25a, 0xb05ae0]
  type Screw = { x: number; y: number; c: number; gone: boolean }
  type Plate = { x: number; y: number; y0: number; w: number; h: number; c: number; screws: Screw[]; vy: number; fall: boolean; layer: number }
  type Box = { c: number; n: number; y: number }
  type Fly = { s: Screw; x0: number; y0: number; x1: number; y1: number; k: number; to: 'box' | 'tray'; box?: Box }
  let plates: Plate[] = []
  let boxes: Box[] = []
  let queue: number[] = []
  let tray: (number | null)[] = []
  let fly: Fly | null = null
  let turning = 0
  let wait = 0
  let fx: Spark[] = []
  const boxY = 3
  const trayY = 12
  const boxX = (i: number) => Math.round(W * (i ? 0.73 : 0.27))
  const trayX = (i: number) => Math.round(W / 2 + (i - 2) * 5)
  const reset = () => {
    const cols = shuffle(rng, COLORS.slice()).slice(0, 4)
    const bag = shuffle(rng, cols.flatMap(c => [c, c, c]))
    plates = []
    const top = 20
    const bottom = H - 6
    for (let i = 0; i < 6; i++) {
      const tall = rng() < 0.4
      const w = tall ? 7 : 13 + irand(rng, Math.max(1, W - 20))
      const h = tall ? 14 + irand(rng, 10) : 7
      const x = 2 + irand(rng, Math.max(1, W - w - 4))
      const y = top + irand(rng, Math.max(1, bottom - top - h))
      const ends: [number, number][] = tall ? [[x + 3, y + 3], [x + 3, y + h - 4]] : [[x + 3, y + 3], [x + w - 4, y + 3]]
      plates.push({ x, y, y0: y, w, h, c: hsv(rng(), 0.25, 0.9), screws: ends.map(([sx, sy]) => ({ x: sx, y: sy, c: bag.pop() as number, gone: false })), vy: 0, fall: false, layer: i })
    }
    queue = shuffle(rng, cols.slice())
    boxes = [0, 1].map(() => ({ c: queue.shift() as number, n: 0, y: boxY }))
    tray = [null, null, null, null, null]
    fly = null
    wait = 20
  }
  reset()
  // a screw can be undone when no plate above it covers it
  const free = (p: Plate, s: Screw) => !plates.some(q => q.layer > p.layer && !q.fall && s.x >= q.x - 1 && s.x <= q.x + q.w && s.y >= q.y - 1 && s.y <= q.y + q.h)
  const nextBox = (b: Box) => {
    b.c = queue.shift() ?? -1
    b.n = 0
    b.y = -8
    // screws waiting in the tray jump into the new box
    for (let i = 0; i < tray.length; i++) if (tray[i] === b.c && b.n < 3) {
      tray[i] = null
      b.n++
    }
  }

  return {
    step() {
      fx = sparks(fx, 0.06)
      for (const b of boxes) b.y += (boxY - b.y) * 0.25
      for (const p of plates) if (p.fall) {
        p.vy += 0.15
        p.y += p.vy
      }
      if (wait > 0) {
        wait--
        return
      }
      if (fly) {
        if (turning > 0) {
          turning--
          return
        }
        fly.k += 1 / 9
        if (fly.k >= 1) {
          if (fly.to === 'box' && fly.box) {
            fly.box.n++
            if (fly.box.n >= 3) {
              burst(fx, rng, boxX(boxes.indexOf(fly.box)), boxY + 3, fly.box.c, 10, 0.9)
              nextBox(fly.box)
            }
          } else tray[tray.indexOf(null)] = fly.s.c
          fly = null
          for (const p of plates) if (!p.fall && p.screws.every(s => s.gone)) p.fall = true
          wait = 4
        }
        return
      }
      if (plates.every(p => p.fall && p.y > H)) {
        reset()
        return
      }
      // the bot: a free screw that fits an open box, else one for the tray
      const options: [Plate, Screw][] = []
      for (const p of plates) if (!p.fall) for (const s of p.screws) if (!s.gone && free(p, s)) options.push([p, s])
      if (!options.length) return
      const fit = options.filter(([, s]) => boxes.some(b => b.c === s.c && b.n < 3))
      const pick0 = fit.length ? (fit[irand(rng, fit.length)] as [Plate, Screw]) : rng() < 0.85 ? (options[irand(rng, options.length)] as [Plate, Screw]) : null
      if (!pick0 || (!fit.length && !tray.includes(null))) {
        // stuck: the tray is full; start over
        if (!tray.includes(null)) {
          burst(fx, rng, W / 2, trayY, 0xff4040, 14, 1.2)
          reset()
        }
        return
      }
      const [, s] = pick0
      s.gone = true
      turning = 6
      const box = boxes.find(b => b.c === s.c && b.n < 3)
      if (box) fly = { s, x0: s.x, y0: s.y, x1: boxX(boxes.indexOf(box)) - 3 + box.n * 3, y1: boxY + 3, k: 0, to: 'box', box }
      else fly = { s, x0: s.x, y0: s.y, x1: trayX(tray.indexOf(null)), y1: trayY, k: 0, to: 'tray' }
    },
    draw(px) {
      sky(px, W, H, 0x2a3a5a, 0x1a2238)
      // the board: a wooden panel with a lit edge
      slab(px, W, H, 0, 17, W, H - 18, 0x8a6a4a, 0x3a2a1a)
      for (let y = 18; y < H - 2; y++) if (y % 6 === 0) for (let x = 1; x < W - 1; x++) px[y * W + x] = 0x7a5a3a
      // the plates, bottom layer first, translucent so the ones under them show
      for (const p of plates) {
        const [hi, base, sh] = tones(p.c)
        for (let y = Math.round(p.y); y < Math.round(p.y + p.h); y++)
          for (let x = p.x; x < p.x + p.w; x++) {
            if (y < 0 || y >= H || x < 0 || x >= W) continue
            const edge = x === p.x || y === Math.round(p.y) || x === p.x + p.w - 1 || y === Math.round(p.y + p.h) - 1
            const c = edge ? mix(sh, 0x1a1020, 0.4) : x === p.x + 1 || y === Math.round(p.y) + 1 ? hi : base
            px[y * W + x] = mix(px[y * W + x] as number, c, edge ? 0.95 : 0.9)
          }
        // the screws, or the holes they leave in the plate
        for (const s of p.screws) {
          const sy = s.y + Math.round(p.y - p.y0)
          if (s.gone) {
            dot(px, W, H, s.x, sy, 0x2a1a10)
            continue
          }
          lit(px, W, H, s.x, sy, 2.2, 2.2, s.c)
          dot(px, W, H, s.x, sy, mix(s.c, 0x101010, 0.55))
        }
      }
      // the boxes at the top, each with three holes; the tray of spare slots under them
      for (const [i, b] of boxes.entries()) {
        if (b.c < 0) continue
        const x = boxX(i)
        slab(px, W, H, x - 6, b.y, 13, 7, b.c, mix(b.c, 0x101018, 0.6))
        for (let k = 0; k < 3; k++) {
          const hx = x - 3 + k * 3
          if (k < b.n) lit(px, W, H, hx, b.y + 3, 1.2, 1.2, mix(b.c, 0xffffff, 0.2))
          else dot(px, W, H, hx, b.y + 3, mix(b.c, 0x101018, 0.5))
        }
      }
      for (let i = 0; i < 5; i++) {
        rect(px, W, H, trayX(i) - 2, trayY - 2, 5, 5, 0x10182a)
        const c = tray[i]
        if (c !== null && c !== undefined) lit(px, W, H, trayX(i), trayY, 1.6, 1.6, c)
      }
      // the screw in flight: it spins out, then flies
      if (fly) {
        const k = turning > 0 ? 0 : fly.k
        const e = k * k * (3 - 2 * k)
        const x = fly.x0 + (fly.x1 - fly.x0) * e
        const y = fly.y0 + (fly.y1 - fly.y0) * e - Math.sin(k * Math.PI) * 4 - (turning > 0 ? (6 - turning) * 0.3 : 0)
        lit(px, W, H, x, y, 2.2, 2.2, fly.s.c)
        const a = turning % 2
        dot(px, W, H, x - (a ? 1 : 0), y - (a ? 0 : 1), 0x101010)
        dot(px, W, H, x + (a ? 1 : 0), y + (a ? 0 : 1), 0x101010)
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
    },
  }
}

// --- hexa sort ----------------------------------------------------------------------

const hexasort: Maker = (W, H, rng) => {
  // stacks of hex tiles land on a grid; tiles slide onto neighbours of the same colour, and ten of a colour clear
  const COLORS = [0xe84a5a, 0x4a9ae8, 0xf0c03a, 0x5ac86a, 0xb06ae0]
  const cols = 3
  const rows = 6
  const dx = Math.max(6, Math.round(W * 0.25))
  const dy = Math.max(4, Math.round(H * 0.09))
  const gx = Math.round((W - (cols - 0.5) * dx - 7) / 2)
  const gy = Math.round(H * 0.28)
  const HEX = ['.xxxxx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.']
  let grid: number[][] = []
  let offer: number[][] = []
  let moving: { c: number; from: [number, number]; to: [number, number]; k: number } | null = null
  let queue: [number, number][] = []
  let pops: { x: number; y: number; c: number; n: number; k: number }[] = []
  let score = 0
  let wait = 0
  let fx: Spark[] = []
  const pos = (i: number): [number, number] => {
    const r = Math.floor(i / cols)
    const c = i % cols
    return [gx + c * dx + (r % 2) * (dx / 2), gy + r * dy]
  }
  const nbrs = (i: number) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    const odd = r % 2
    const list: [number, number][] = [[r, c - 1], [r, c + 1], [r - 1, c - 1 + odd], [r - 1, c + odd], [r + 1, c - 1 + odd], [r + 1, c + odd]]
    return list.filter(([rr, cc]) => rr >= 0 && rr < rows && cc >= 0 && cc < cols).map(([rr, cc]) => rr * cols + cc)
  }
  const top = (s: number[]) => s[s.length - 1] ?? -1
  const run = (s: number[]) => {
    let n = 0
    for (let k = s.length - 1; k >= 0 && s[k] === top(s); k--) n++
    return n
  }
  const newStack = () => {
    const s: number[] = []
    const parts = 1 + irand(rng, 3)
    for (let p = 0; p < parts; p++) {
      const c = irand(rng, 4)
      for (let k = 0; k < 1 + irand(rng, 3); k++) s.push(c)
    }
    return s
  }
  const reset = () => {
    grid = Array.from({ length: cols * rows }, () => [])
    offer = [newStack(), newStack(), newStack()]
    queue = []
    moving = null
    wait = 10
  }
  reset()
  // finds the next pair of neighbours with the same top colour: the smaller run moves onto the bigger stack
  const findMove = (): [number, number] | null => {
    for (let i = 0; i < grid.length; i++) {
      const s = grid[i] as number[]
      if (!s.length) continue
      for (const j of nbrs(i)) {
        const o = grid[j] as number[]
        if (o.length && top(o) === top(s) && (run(s) < run(o) || (run(s) === run(o) && i < j))) return [i, j]
      }
    }
    return null
  }

  return {
    step() {
      fx = sparks(fx, 0.05)
      pops = pops.filter(p => ++p.k < 14)
      if (wait > 0) {
        wait--
        return
      }
      if (moving) {
        moving.k += 0.25
        if (moving.k >= 1) {
          ;(grid[moving.to[0]] as number[]).push(moving.c)
          moving = null
        }
        return
      }
      // one tile at a time along the current move
      const mv = queue[0]
      if (mv) {
        const [a, b] = mv
        const s = grid[a] as number[]
        const o = grid[b] as number[]
        if (s.length && o.length && top(s) === top(o)) {
          moving = { c: s.pop() as number, from: [a, s.length], to: [b, o.length], k: 0 }
          return
        }
        queue.shift()
        return
      }
      // ten or more of one colour on top: they clear
      for (let i = 0; i < grid.length; i++) {
        const s = grid[i] as number[]
        const n = run(s)
        if (n >= 10) {
          const c = top(s)
          s.length -= n
          score += n
          const [x, y] = pos(i)
          pops.push({ x, y, c: COLORS[c] as number, n, k: 0 })
          burst(fx, rng, x + 3, y - s.length, COLORS[c] as number, 14, 1)
          wait = 8
          return
        }
      }
      const m = findMove()
      if (m) {
        queue.push(m)
        return
      }
      // the bot: places an offered stack where its top colour has the most neighbours
      const empty = grid.map((s, i) => (s.length ? -1 : i)).filter(i => i >= 0)
      if (!empty.length) {
        burst(fx, rng, W / 2, H / 2, 0xffffff, 20, 1.4)
        reset()
        return
      }
      const oi = irand(rng, 3)
      const st = offer[oi] as number[]
      let bestI = empty[irand(rng, empty.length)] as number
      let bestN = -1
      for (const i of empty) {
        const n = nbrs(i).filter(j => top(grid[j] as number[]) === top(st)).length + rng() * 0.5
        if (n > bestN) {
          bestN = n
          bestI = i
        }
      }
      grid[bestI] = st
      offer[oi] = newStack()
      wait = 6
    },
    draw(px) {
      sky(px, W, H, 0x2a2450, 0x4a3a7a)
      // the empty board cells, a shade lighter than the background
      for (let i = 0; i < grid.length; i++) {
        const [x, y] = pos(i)
        sprite(px, W, H, x, y, HEX, { x: 0x5a4c90 })
        sprite(px, W, H, x, y + 1, ['', '.xxxxx.', '', ''], { x: 0x4a3e7a })
      }
      // a stack: one row of side per tile, the top face full
      const stack = (x: number, y: number, s: number[], lift = 0) => {
        for (let k = 0; k < s.length; k++) {
          const c = COLORS[s[k] as number] as number
          const [hi, base, sh, deep] = tones(c)
          const yy = y - k - lift
          sprite(px, W, H, x, yy + 1, ['', '', '', '.xxxxx.'], { x: deep })
          sprite(px, W, H, x, yy, HEX, { x: k === s.length - 1 ? base : sh })
          if (k === s.length - 1) {
            sprite(px, W, H, x, yy, ['.xxx...', 'x......'], { x: hi })
          }
        }
      }
      for (let i = 0; i < grid.length; i++) {
        const [x, y] = pos(i)
        stack(x, y, (grid[i] as number[]).slice(0, 14))
      }
      if (moving) {
        const [fx0, fy0] = pos(moving.from[0])
        const [tx, ty] = pos(moving.to[0])
        const k = moving.k
        const x = fx0 + (tx - fx0) * k
        const y = fy0 - moving.from[1] + (ty - moving.to[1] - (fy0 - moving.from[1])) * k - Math.sin(k * Math.PI) * 5
        stack(x, y, [moving.c])
      }
      for (const p of pops) for (let k = 0; k < 3; k++) sprite(px, W, H, p.x, p.y - p.k * 2 - k * 3, HEX, { x: mix(p.c, 0xffffff, p.k / 14) })
      // the three stacks on offer, on a tray at the bottom
      rect(px, W, H, 0, H - 10, W, 9, 0x1a1636)
      for (let k = 0; k < 3; k++) stack(Math.round(W * (0.08 + k * 0.32)), H - 6, (offer[k] as number[]).slice(0, 6))
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, String(score), 0xf0e8ff)
    },
  }
}

// --- colour block jam ---------------------------------------------------------------

const blockjam: Maker = (W, H, rng) => {
  // coloured blocks slide across a board and out through the door of their colour
  const COLORS = [0xe8463a, 0x3a8ae8, 0xf0c030, 0x4ac25a]
  const gw = 5
  const gh = 8
  const cell = Math.max(3, Math.min(Math.floor((W - 4) / gw), Math.floor((H - 14) / gh)))
  const bx = Math.round((W - gw * cell) / 2)
  const by = Math.round((H - gh * cell) / 2) + 2
  type Block = { x: number; y: number; w: number; h: number; c: number; px: number; py: number; out: number; dir: [number, number] }
  type Door = { side: 0 | 1 | 2 | 3; a: number; n: number; c: number }
  let blocks: Block[] = []
  let doors: Door[] = []
  let moving: Block | null = null
  let tries = 0
  let cleared = 0
  let fx: Spark[] = []
  let wait = 0
  const occupied = (x: number, y: number, skip?: Block) => blocks.some(b => b !== skip && !b.out && x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h)
  const reset = () => {
    // a door of each colour on a wall: 0 left, 1 right, 2 top, 3 bottom
    const sides = shuffle(rng, [0, 1, 2, 3]) as (0 | 1 | 2 | 3)[]
    doors = COLORS.map((c, i) => {
      const side = sides[i] as 0 | 1 | 2 | 3
      const len = side < 2 ? gh : gw
      const n = Math.min(len - 1, 3 + irand(rng, 2))
      return { side, a: irand(rng, len - n + 1), n, c: i }
    })
    blocks = []
    const shapes: [number, number][] = [[1, 1], [1, 2], [2, 1], [2, 2], [1, 3], [3, 1]]
    for (let k = 0; k < 60 && blocks.length < 11; k++) {
      const [w, h] = shapes[irand(rng, shapes.length)] as [number, number]
      const x = irand(rng, gw - w + 1)
      const y = irand(rng, gh - h + 1)
      let free = true
      for (let i = 0; i < w; i++) for (let j = 0; j < h; j++) if (occupied(x + i, y + j)) free = false
      if (free) blocks.push({ x, y, w, h, c: irand(rng, 4), px: x, py: y, out: 0, dir: [0, 0] })
    }
    tries = 0
    wait = 15
  }
  reset()
  // how far a block can slide one way before it hits something
  const reach = (b: Block, dx: number, dy: number) => {
    let n = 0
    for (;;) {
      const nx = b.x + dx * (n + 1)
      const ny = b.y + dy * (n + 1)
      if (nx < 0 || ny < 0 || nx + b.w > gw || ny + b.h > gh) return n
      for (let i = 0; i < b.w; i++) for (let j = 0; j < b.h; j++) if (occupied(nx + i, ny + j, b)) return n
      n++
    }
  }
  // the door this block fits through from where it stands, and the way to it
  const exitOf = (b: Block): [number, number] | null => {
    for (const d of doors) {
      if (d.c !== b.c) continue
      const [dx, dy] = [[-1, 0], [1, 0], [0, -1], [0, 1]][d.side] as [number, number]
      const along = d.side < 2 ? [b.y, b.h] : [b.x, b.w]
      if ((along[0] as number) < d.a || (along[0] as number) + (along[1] as number) > d.a + d.n) continue
      const dist = dx < 0 ? b.x : dx > 0 ? gw - b.x - b.w : dy < 0 ? b.y : gh - b.y - b.h
      if (reach(b, dx, dy) >= dist) return [dx, dy]
    }
    return null
  }

  return {
    step() {
      fx = sparks(fx, 0.04)
      for (const b of blocks) {
        b.px += (b.x - b.px) * 0.35
        b.py += (b.y - b.py) * 0.35
        if (b.out) b.out++
      }
      blocks = blocks.filter(b => b.out < 14)
      if (wait > 0) {
        wait--
        return
      }
      if (moving && (Math.abs(moving.px - moving.x) > 0.1 || Math.abs(moving.py - moving.y) > 0.1)) return
      moving = null
      if (!blocks.length) {
        reset()
        return
      }
      // a block that can leave, leaves; otherwise one slides somewhere to make room
      const ready = blocks.filter(b => !b.out && exitOf(b))
      if (ready.length) {
        const b = ready[irand(rng, ready.length)] as Block
        const [dx, dy] = exitOf(b) as [number, number]
        b.out = 1
        b.dir = [dx, dy]
        b.x += dx * (gw + 2)
        b.y += dy * (gh + 2)
        cleared++
        burst(fx, rng, bx + (b.px + b.w / 2) * cell, by + (b.py + b.h / 2) * cell, COLORS[b.c] as number, 8, 0.8)
        wait = 8
        return
      }
      // every slide of every block; the ones that line a block up with its door first
      const live = blocks.filter(b => !b.out)
      const moves: [Block, number, number, number][] = []
      const good: [Block, number, number, number][] = []
      for (const b of live)
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as [number, number][])
          for (let n = 1; n <= reach(b, dx, dy); n++) {
            moves.push([b, dx, dy, n])
            b.x += dx * n
            b.y += dy * n
            if (exitOf(b)) good.push([b, dx, dy, n])
            b.x -= dx * n
            b.y -= dy * n
          }
      if (!moves.length || ++tries > 40) {
        reset()
        return
      }
      const list = good.length ? good : moves
      const [b, dx, dy, n] = list[irand(rng, list.length)] as [Block, number, number, number]
      b.x += dx * n
      b.y += dy * n
      moving = b
      wait = 3
    },
    draw(px) {
      sky(px, W, H, 0x1e2a44, 0x10182a)
      // the walls, with the coloured doors cut in them
      slab(px, W, H, bx - 2, by - 2, gw * cell + 4, gh * cell + 4, 0xb8c0d0, 0x4a5468)
      for (let y = 0; y < gh * cell; y++)
        for (let x = 0; x < gw * cell; x++) px[(by + y) * W + bx + x] = (x % cell === 0 || y % cell === 0) ? 0x26304a : 0x2e3a58
      for (const d of doors) {
        const c = COLORS[d.c] as number
        const s0 = d.a * cell
        const s1 = (d.a + d.n) * cell
        if (d.side === 0) rect(px, W, H, bx - 2, by + s0, 2, s1 - s0, c)
        if (d.side === 1) rect(px, W, H, bx + gw * cell, by + s0, 2, s1 - s0, c)
        if (d.side === 2) rect(px, W, H, bx + s0, by - 2, s1 - s0, 2, c)
        if (d.side === 3) rect(px, W, H, bx + s0, by + gh * cell, s1 - s0, 2, c)
      }
      // the blocks: lit boxes; one leaving shrinks into its door
      for (const b of blocks) {
        const k = b.out ? 1 - b.out / 14 : 1
        const w = b.w * cell * (b.out ? Math.max(0.2, k) : 1)
        const h = b.h * cell * (b.out ? Math.max(0.2, k) : 1)
        const x = bx + b.px * cell + (b.w * cell - w) / 2
        const y = by + b.py * cell + (b.h * cell - h) / 2
        const xa = Math.max(bx, x)
        const ya = Math.max(by, y)
        const xb = Math.min(bx + gw * cell, x + w)
        const yb = Math.min(by + gh * cell, y + h)
        if (xb - xa < 1 || yb - ya < 1) continue
        slab(px, W, H, xa + 0.5, ya + 0.5, xb - xa - 1, yb - ya - 1, COLORS[b.c] as number, mix(COLORS[b.c] as number, 0x0a0a18, 0.55))
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, String(cleared), 0xd8e0f0)
    },
  }
}

export const MOBILE = {
  flappy,
  game2048,
  stack,
  fruitslice,
  crossy,
  helix,
  colorswitch,
  holecity,
  territory,
  cells,
  match3,
  blockblast,
  zigzag,
  knives,
  crowdrun,
  pullpin,
  parking,
  watersort,
  doodle,
  slingshot,
  suika,
  screwjam,
  hexasort,
  blockjam,
}

