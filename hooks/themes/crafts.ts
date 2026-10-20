import { disc, dot, hsv, mix, rect, scale, sky, sprite } from '../draw'
import type { Maker } from '../draw'
import { clamp, ellipse, hash, line, pick, shuffle } from '../kit'

// Crafts & makers: watching something get built, piece by piece.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

// Little pictures the crafts reuse, one character per pixel ('.' is empty).
const PICS: { rows: string[]; pal: Record<string, number> }[] = [
  {
    rows: ['..rr.rr..', '.rrrrrrr.', '.rrrrrrr.', '..rrrrr..', '...rrr...', '....r....'],
    pal: { r: 0xe8344a },
  },
  {
    rows: ['..rrrrr..', '.rrwrrwr.', 'rrrrrrrrr', '.wsssssw.', '..s.s.s..', '..sssss..', '...s.s...'],
    pal: { r: 0xe03a2a, w: 0xffffff, s: 0xf0d8b8 },
  },
  {
    rows: ['g.......g', 'gg.....gg', 'ggggggggg', 'gyggggyg.', 'ggggpgggg', '.ggggggg.', '..g...g..'],
    pal: { g: 0x8a8a96, y: 0x5ae04a, p: 0xff8aa0 },
  },
  {
    rows: ['..g...g..', '...g.g...', '..ggggg..', '.gg.g.gg.', 'ggggggggg', 'g.ggggg.g', 'g.g...g.g', '...g.g...'],
    pal: { g: 0x5ae05a },
  },
  {
    rows: ['....y....', '..yyyyy..', '.yyyyyyy.', 'yyyyyyyyy', 'bbbbbbbbb', 'bwbbbbwbb', 'bbbbbbbbb'],
    pal: { y: 0xffc030, b: 0x3a8ae0, w: 0xffffff },
  },
]

// --- brick build ------------------------------------------------------------------

const brickbuild: Maker = (W, H, rng) => {
  const ground = H - 5
  const unit = 3
  type B = { x: number; y: number; w: number; c: number }
  let plan: B[] = []
  let placed = 0
  let fall = 0
  let t = 0

  function design() {
    plan = []
    const cols = Math.floor((W - 6) / unit)
    const left = Math.floor((W - cols * unit) / 2)
    const wallC = pick(rng, [0xe03a3a, 0x3a8ae0, 0xf0c020, 0x3ac06a])
    const levels = 6
    for (let l = 0; l < levels; l++) {
      let x = l % 2 ? 0 : 1
      if (l % 2) plan.push({ x: 0, y: l, w: 1, c: wallC })
      while (x < cols) {
        const w = Math.min(cols - x, 2)
        const window = l >= 2 && l <= 3 && x >= 2 && x < cols - 2 && (x / 2) % 2 === 1
        plan.push({ x, y: l, w, c: window ? 0x8ad0f0 : wallC })
        x += w
      }
    }
    for (let r = 0; r < Math.floor(cols / 2); r++) {
      const w = cols - r * 2
      if (w <= 0) break
      plan.push({ x: r, y: levels + r, w, c: 0x8a3a2a })
    }
    plan = plan.map(b => ({ ...b, x: left + b.x * unit }))
    placed = 0
  }
  design()

  return {
    step() {
      t++
      if (placed >= plan.length) {
        if (++fall > 70) {
          fall = 0
          design()
        }
        return
      }
      if (t % 6 === 0) placed++
    },
    draw(px) {
      sky(px, W, H, 0xd8e8f8, 0xf8f0e0, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x3ac04a)
      for (let x = 1; x < W; x += 3) dot(px, W, H, x, ground, 0x5ae06a)
      const bh = 3
      for (let i = 0; i < placed; i++) {
        const b = plan[i] as B
        const y = ground - (b.y + 1) * bh
        const drop = i === placed - 1 ? Math.max(0, 5 - (t % 6)) : 0
        rect(px, W, H, b.x, y - drop, b.w * unit, bh, b.c)
        rect(px, W, H, b.x, y - drop, b.w * unit, 1, mix(b.c, 0xffffff, 0.35))
        rect(px, W, H, b.x + b.w * unit - 1, y - drop, 1, bh, scale(b.c, 0.75))
        for (let s = 0; s < b.w; s++) dot(px, W, H, b.x + s * unit + 1, y - drop - 1, mix(b.c, 0xffffff, 0.2))
      }
    },
  }
}

// --- pixel art drawing ------------------------------------------------------------

const pixeldraw: Maker = (W, H, rng) => {
  let pi = 0
  let k = 0
  let hold = 0
  let order: number[] = []
  const scaleK = 3

  function start() {
    const p = PICS[pi] as { rows: string[] }
    const n = p.rows.length * (p.rows[0] as string).length
    order = Array.from({ length: n }, (_, i) => i)
    if (rng() < 0.5) shuffle(rng, order)
    k = 0
  }
  start()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          pi = (pi + 1) % PICS.length
          start()
        }
        return
      }
      k++
      if (k >= order.length) hold = 60
    },
    draw(px) {
      px.fill(0xf8f8fc)
      for (let y = 0; y < H; y += scaleK) for (let x = 0; x < W; x++) dot(px, W, H, x, y, 0xe8e8f0)
      for (let x = 0; x < W; x += scaleK) for (let y = 0; y < H; y++) dot(px, W, H, x, y, 0xe8e8f0)
      const p = PICS[pi] as { rows: string[]; pal: Record<string, number> }
      const cols = (p.rows[0] as string).length
      const ox = Math.floor((W - cols * scaleK) / 2)
      const oy = Math.floor((H - p.rows.length * scaleK) / 2)
      let cur = [ox, oy]
      for (let i = 0; i < Math.min(k, order.length); i++) {
        const idx = order[i] as number
        const x = idx % cols
        const y = Math.floor(idx / cols)
        const ch = (p.rows[y] as string)[x] as string
        if (ch !== '.') rect(px, W, H, ox + x * scaleK, oy + y * scaleK, scaleK, scaleK, p.pal[ch] as number)
        cur = [ox + x * scaleK + 1, oy + y * scaleK + 1]
      }
      if (!hold) {
        const [cx, cy] = cur as [number, number]
        line(px, W, H, cx, cy, cx + 5, cy - 7, 0xf0c040)
        dot(px, W, H, cx, cy, 0x3a3a3a)
        dot(px, W, H, cx + 5, cy - 7, 0xff8aa0)
      }
      for (const [i, c] of Object.values(p.pal).entries()) rect(px, W, H, 2 + i * 4, H - 5, 3, 3, c)
    },
  }
}

// --- pottery wheel ----------------------------------------------------------------

const pottery: Maker = (W, H, rng) => {
  const wheel = Math.round(H * 0.72)
  const cx = W / 2
  let t = 0
  let shape = 0
  let clay = 0xc87a4a

  const profile = (u: number, f: number) => {
    // u from 0 (bottom) to 1 (top); f from 0 (lump) to 1 (vase)
    const lump = 6 * Math.sqrt(Math.max(0, 1 - u * u * 1.4))
    const vases = [
      4 + 3 * Math.sin(u * Math.PI * 0.9) - (u > 0.8 ? (u - 0.8) * 8 : 0) + (u > 0.9 ? 2 : 0),
      3 + u * 4,
      5 - 2 * Math.sin(u * Math.PI) + (u > 0.85 ? 1.5 : 0),
    ]
    return lump + ((vases[shape] as number) - lump) * f
  }

  return {
    step() {
      t++
      if (t > 300) {
        t = 0
        shape = (shape + 1) % 3
        clay = pick(rng, [0xc87a4a, 0xb8a090, 0xd89a6a])
      }
    },
    draw(px) {
      sky(px, W, H, 0xe8dcc8, 0xc8b8a0)
      rect(px, W, H, 0, wheel + 2, W, H - wheel - 2, 0x6a5a4a)
      ellipse(px, W, H, cx, wheel + 1, W * 0.38, 2, 0x8a8a92)
      const f = span(t, 30, 220)
      const height = 8 + f * H * 0.32
      for (let y = 0; y < height; y++) {
        const u = y / height
        const r = Math.max(0.5, profile(u, f))
        const yy = wheel - y
        for (let x = -r; x <= r; x++) {
          const k = x / r
          let c = mix(clay, scale(clay, 0.7), Math.abs(k))
          if (Math.sin(k * 3 + t * 0.6) > 0.95) c = mix(c, 0xffffff, 0.2)
          dot(px, W, H, cx + x, yy, c)
        }
      }
      if (t < 240) {
        const hy = wheel - height * (0.3 + 0.4 * Math.sin(t * 0.03) ** 2)
        const r = profile((wheel - hy) / height, f)
        rect(px, W, H, cx - r - 4, hy - 1, 3, 3, 0xf0c8a0)
        rect(px, W, H, cx + r + 1, hy - 1, 3, 3, 0xf0c8a0)
      }
      for (let k = 0; k < 4; k++) dot(px, W, H, cx + Math.cos(t * 0.6 + k * 1.6) * W * 0.36, wheel + 1 + Math.sin(t * 0.6 + k * 1.6), 0x5a5a62)
    },
  }
}

// --- cross-stitch -----------------------------------------------------------------

const crossstitch: Maker = (W, H) => {
  const cs = 3
  let pi = 0
  let k = 0
  let order: number[] = []
  let hold = 0

  function start() {
    const p = PICS[pi] as { rows: string[] }
    const cols = (p.rows[0] as string).length
    order = []
    p.rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && order.push(y * cols + x)))
    k = 0
  }
  start()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          pi = (pi + 1) % PICS.length
          start()
        }
        return
      }
      if (++k > order.length * 4) hold = 60
    },
    draw(px) {
      px.fill(0xf4efe0)
      for (let y = 0; y < H; y += cs) for (let x = 0; x < W; x += cs) dot(px, W, H, x, y, 0xd8d0b8)
      rect(px, W, H, 0, 0, W, 2, 0xc89a5a)
      rect(px, W, H, 0, H - 2, W, 2, 0xc89a5a)
      const p = PICS[pi] as { rows: string[]; pal: Record<string, number> }
      const cols = (p.rows[0] as string).length
      const ox = Math.floor((W - cols * cs) / 2)
      const oy = Math.floor((H - p.rows.length * cs) / 2)
      const done = Math.floor(k / 4)
      for (let i = 0; i < Math.min(done + 1, order.length); i++) {
        const idx = order[i] as number
        const x = ox + (idx % cols) * cs
        const y = oy + Math.floor(idx / cols) * cs
        const c = p.pal[(p.rows[Math.floor(idx / cols)] as string)[idx % cols] as string] as number
        const half = i === done ? k % 4 : 4
        if (half >= 1) {
          dot(px, W, H, x, y, c)
          dot(px, W, H, x + 1, y + 1, c)
          dot(px, W, H, x + 2, y + 2, c)
        }
        if (half >= 3) {
          dot(px, W, H, x + 2, y, scale(c, 0.85))
          dot(px, W, H, x, y + 2, scale(c, 0.85))
        }
      }
      if (!hold && order[done] !== undefined) {
        const idx = order[done] as number
        const x = ox + (idx % cols) * cs + 1
        const y = oy + Math.floor(idx / cols) * cs + 1
        line(px, W, H, x, y, x + 3, y - 6, 0xc8c8d0)
        line(px, W, H, x + 3, y - 6, W - 2, 3, 0xe8344a)
      }
    },
  }
}

// --- fuse beads -------------------------------------------------------------------

const fusebeads: Maker = (W, H, rng) => {
  const pitch = 3
  let pi = 1
  let k = 0
  let iron = -1
  let hold = 0
  let order: number[] = []

  function start() {
    const p = PICS[pi] as { rows: string[] }
    const cols = (p.rows[0] as string).length
    order = []
    p.rows.forEach((row, y) => [...row].forEach((ch, x) => ch !== '.' && order.push(y * cols + x)))
    shuffle(rng, order)
    k = 0
    iron = -1
  }
  start()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          pi = (pi + 1) % PICS.length
          start()
        }
        return
      }
      if (k < order.length) k += 0.5
      else if (iron < 0) iron = 0
      else {
        iron += 0.6
        if (iron > H + 10) hold = 50
      }
    },
    draw(px) {
      px.fill(0xe8e0f0)
      const p = PICS[pi] as { rows: string[]; pal: Record<string, number> }
      const cols = (p.rows[0] as string).length
      const ox = Math.floor((W - cols * pitch) / 2)
      const oy = Math.floor((H - p.rows.length * pitch) / 2)
      rect(px, W, H, ox - 2, oy - 2, cols * pitch + 3, p.rows.length * pitch + 3, 0xd0c8e0)
      for (let y = 0; y < p.rows.length; y++) for (let x = 0; x < cols; x++) dot(px, W, H, ox + x * pitch + 1, oy + y * pitch + 1, 0xb8b0c8)
      for (let i = 0; i < Math.floor(k); i++) {
        const idx = order[i] as number
        const x = ox + (idx % cols) * pitch
        const y = oy + Math.floor(idx / cols) * pitch
        const c = p.pal[(p.rows[Math.floor(idx / cols)] as string)[idx % cols] as string] as number
        const fused = iron >= 0 && y < iron - 6
        if (fused) rect(px, W, H, x, y, pitch, pitch, c)
        else {
          rect(px, W, H, x, y, 2, 2, c)
          dot(px, W, H, x + 1, y + 1, 0xe8e0f0)
        }
      }
      if (iron >= 0 && iron < H + 6) {
        rect(px, W, H, 1, iron - 6, W - 2, 6, 0xe0e4ec)
        rect(px, W, H, 1, iron - 6, W - 2, 1, 0xffffff)
        rect(px, W, H, W / 2 - 3, iron - 10, 6, 4, 0x3a8ae0)
        for (let x = 3; x < W - 3; x += 4) dot(px, W, H, x, iron - 8 - ((iron | 0) % 3), 0xf0f4f8)
      }
    },
  }
}

// --- mosaic -----------------------------------------------------------------------

const mosaic: Maker = (W, H, rng) => {
  type T = { x: number; y: number; w: number; h: number; c: number }
  let tiles: T[] = []
  let k = 0
  let hold = 0
  let scene = 0

  const colourAt = (x: number, y: number) => {
    const u = x / W
    const v = y / H
    if (scene === 0) {
      if (Math.hypot(u - 0.7, v - 0.25) < 0.14) return 0xffc030
      if (v > 0.55 + Math.sin(u * 9) * 0.04) return v > 0.75 ? 0x1a5ab0 : 0x3a8ae0
      return 0x8ad0f0
    }
    if (scene === 1) {
      const d = Math.hypot(u - 0.5, (v - 0.45) * 0.7)
      if (d < 0.08) return 0xffd040
      if (d < 0.32) return Math.floor(Math.atan2(v - 0.45, u - 0.5) * 2.5 + 10) % 2 ? 0xe84a7a : 0xf06a9a
      if (Math.abs(u - 0.5) < 0.03 && v > 0.6) return 0x3a9a3a
      return 0xf4ecd8
    }
    return Math.floor(u * 4 + v * 6) % 2 ? 0x2a6a8a : 0xe8a040
  }
  function plan() {
    tiles = []
    for (let y = 1; y < H - 1; y += 3)
      for (let x = 1; x < W - 1; x += 3) {
        const w = 2 + (hash(x, y, scene) > 0.7 ? 1 : 0)
        tiles.push({ x: x + (hash(y, x, 1) > 0.5 ? 0 : 0), y, w, h: 2, c: colourAt(x + 1, y + 1) })
      }
    shuffle(rng, tiles)
    tiles.sort((a, b) => a.y + a.x * 0.3 - (b.y + b.x * 0.3) + (rng() - 0.5) * 20)
    k = 0
  }
  plan()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          scene = (scene + 1) % 3
          plan()
        }
        return
      }
      k += 2
      if (k >= tiles.length) hold = 70
    },
    draw(px) {
      px.fill(0xd8d0c4)
      for (let i = 0; i < Math.min(k, tiles.length); i++) {
        const tl = tiles[i] as T
        const c = mix(tl.c, hash(tl.x, tl.y, 3) > 0.5 ? 0xffffff : 0x000000, 0.08)
        rect(px, W, H, tl.x, tl.y, Math.min(tl.w, W - 1 - tl.x), tl.h, c)
      }
    },
  }
}

// --- weaving loom -----------------------------------------------------------------

const loom: Maker = (W, H, rng) => {
  const top = 8
  let rows: number[][] = []
  let shuttle = 0
  let dir = 1
  let t = 0
  let pal: number[] = []

  function reset() {
    rows = []
    const h = rng()
    pal = [hsv(h, 0.6, 0.9), hsv(h + 0.5, 0.5, 0.9), 0xf4ecd8, hsv(h + 0.1, 0.7, 0.6)]
  }
  reset()

  return {
    step() {
      t++
      shuttle += dir * 1.2
      if (shuttle > W - 2 || shuttle < 1) {
        dir = -dir
        const r = rows.length
        const band = Math.floor(r / 4) % pal.length
        rows.push(Array.from({ length: W }, (_, x) => ((x + r) % 6 < 3 && r % 8 > 3 ? pal[(band + 1) % pal.length] : pal[band]) as number))
        if (top + rows.length > H - 4) reset()
      }
    },
    draw(px) {
      px.fill(0x6a4a2a)
      rect(px, W, H, 0, top - 4, W, 2, 0x8a6a3a)
      for (let x = 1; x < W - 1; x += 2) line(px, W, H, x, top - 2, x, H - 3, 0xe8e0d0)
      rows.forEach((r, i) => {
        const y = top + rows.length - 1 - i
        for (let x = 1; x < W - 1; x++) dot(px, W, H, x, y, (x + i) % 2 ? (r[x] as number) : scale(r[x] as number, 0.85))
      })
      const y = top + rows.length
      line(px, W, H, 1, y, W - 2, y, 0x9a8a7a)
      rect(px, W, H, shuttle - 3, y - 1, 6, 2, 0xb88a4a)
      line(px, W, H, dir > 0 ? 1 : W - 2, y, shuttle, y, pal[Math.floor(rows.length / 4) % pal.length] as number)
      rect(px, W, H, 0, H - 3, W, 3, 0x8a6a3a)
    },
  }
}

// --- mural ------------------------------------------------------------------------

const mural: Maker = (W, H, rng) => {
  const paint = new Uint32Array(W * H)
  const done = new Uint8Array(W * H)
  let layer = 0
  let row = 0
  let hold = 0
  let hue = rng()

  const target = (x: number, y: number, l: number): number | undefined => {
    const u = x / W
    const v = y / H
    if (l === 0) return mix(hsv(hue, 0.5, 0.95), hsv(hue + 0.1, 0.4, 1), v)
    if (l === 1) return Math.hypot(u - 0.7, v - 0.25) < 0.13 ? 0xffe070 : undefined
    if (l === 2) return v > 0.5 - Math.abs(Math.sin(u * 4)) * 0.18 ? hsv(hue + 0.6, 0.4, 0.6) : undefined
    if (l === 3) return v > 0.72 + Math.sin(u * 7) * 0.03 ? hsv(0.3, 0.5, 0.55) : undefined
    return Math.abs(u - 0.25) < 0.02 && v > 0.6 && v < 0.78 ? 0x5a3a2a : Math.hypot(u - 0.25, v - 0.58) < 0.08 ? 0x2a7a3a : undefined
  }
  function reset() {
    paint.fill(0xe8e4dc)
    done.fill(0)
    layer = 0
    row = 0
    hue = rng()
  }
  reset()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (let k = 0; k < 2; k++) {
        for (let x = 0; x < W; x++) {
          const c = target(x, row, layer)
          if (c !== undefined) paint[row * W + x] = c
        }
        row++
        if (row >= H) {
          row = 0
          layer++
          if (layer > 4) {
            hold = 60
            return
          }
        }
      }
    },
    draw(px) {
      px.set(paint)
      if (!hold) {
        rect(px, W, H, 0, row - 1, W, 1, 0xd8d8e0)
        rect(px, W, H, W / 2 - 1, row - 1, 3, 8, 0xc89a5a)
      }
    },
  }
}

// --- sandcastle -------------------------------------------------------------------

const sandcastle: Maker = (W, H, rng) => {
  const beach = Math.round(H * 0.65)
  let towers: { x: number; h: number; born: number }[] = []
  let tide = 0
  let t = 0

  function reset() {
    towers = []
    const n = 4
    for (let i = 0; i < n; i++) towers.push({ x: W * (0.15 + i * 0.22), h: 6 + rng() * 6, born: 30 + i * 40 })
    tide = 0
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (t > 260) tide = Math.min(1, tide + 0.006)
      if (t > 420) reset()
    },
    draw(px) {
      sky(px, W, H, 0x6ac0f0, 0xd8f0ff, beach - 6)
      for (let y = beach - 6; y < beach; y++) rect(px, W, H, 0, y, W, 1, (y + Math.floor(t / 8)) % 3 ? 0x3a90d0 : 0x6ab8f0)
      rect(px, W, H, 0, beach, W, H - beach, 0xf0d898)
      for (let x = 0; x < W; x++) if (hash(x, 1, 2) > 0.8) dot(px, W, H, x, beach + 3 + (x % 5), 0xd8c080)
      const wash = tide * (H - beach + 10)
      for (const tw of towers) {
        const g = span(t, tw.born, tw.born + 15)
        if (g <= 0) continue
        const h = tw.h * g * (1 - span(wash, 4, 14))
        if (h <= 0.5) continue
        rect(px, W, H, tw.x - 2, beach - h, 5, h, 0xe8c880)
        for (let k = 0; k < 3; k++) dot(px, W, H, tw.x - 2 + k * 2, beach - h - 1, 0xe8c880)
        dot(px, W, H, tw.x, beach - h + 2, 0x8a6a3a)
        if (h > 8) {
          line(px, W, H, tw.x, beach - h - 1, tw.x, beach - h - 5, 0x8a6a3a)
          rect(px, W, H, tw.x + 1, beach - h - 5, 2, 2, 0xe03a3a)
        }
      }
      if (towers.length > 1 && t > 200) for (let i = 0; i + 1 < towers.length; i++) rect(px, W, H, towers[i]!.x + 2, beach - 3 * (1 - tide), towers[i + 1]!.x - towers[i]!.x - 4, 3 * (1 - tide), 0xdcbc74)
      if (tide > 0) for (let y = beach - 6; y < beach - 6 + wash && y < H; y++) for (let x = 0; x < W; x++) if ((x + y + t) % 9 !== 0) dot(px, W, H, x, y, y > beach - 6 + wash - 2 ? 0xffffff : 0x4aa0e0)
      if (t > 30 && t < 200) {
        const i = Math.min(towers.length - 1, Math.floor((t - 30) / 40))
        const tw = towers[i]!
        const flip = ((t - 30) % 40) / 40
        rect(px, W, H, tw.x - 2, beach - tw.h - 4 - (1 - flip) * 6, 5, 4, 0xe03a3a)
      }
    },
  }
}

// --- block-game house -------------------------------------------------------------

const blockhouse: Maker = (W, H) => {
  const cs = 3
  const cols = Math.floor(W / cs)
  const ground = Math.round(H * 0.75)
  type Bl = { x: number; y: number; k: number }
  let plan: Bl[] = []
  let placed = 0
  let hold = 0
  let t = 0
  // 0 plank, 1 cobble, 2 glass, 3 door, 4 roof
  const COL = [
    [0xb8884a, 0x9a6a3a],
    [0x8a8a8a, 0x6a6a6a],
    [0xb8e0f0, 0xe8f8ff],
    [0x7a4a2a, 0x5a3a1a],
    [0x8a3a2a, 0x6a2a1a],
  ]

  function design() {
    plan = []
    const w = Math.min(cols - 2, 7)
    const x0 = Math.floor((cols - w) / 2)
    const h = 4
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const edge = x === 0 || x === w - 1
        const door = x === Math.floor(w / 2) && y < 2
        const win = !edge && y === 2 && x !== Math.floor(w / 2)
        plan.push({ x: x0 + x, y, k: y === 0 && edge ? 1 : door ? 3 : win ? 2 : edge ? 1 : 0 })
      }
    for (let r = 0; r < Math.ceil(w / 2); r++) for (let x = r; x < w - r; x++) plan.push({ x: x0 + x, y: h + r, k: 4 })
    placed = 0
  }
  design()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) design()
        return
      }
      if (t % 5 === 0) placed++
      if (placed >= plan.length) hold = 70
    },
    draw(px) {
      sky(px, W, H, 0x7ab8ff, 0xb8dcff, ground)
      for (let y = ground; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y < ground + 2 ? ((x + y) % 3 ? 0x5ab03a : 0x4a9a2a) : (hash(x >> 1, y >> 1, 4) > 0.8 ? 0x6a4a2a : 0x8a5a3a)
      disc(px, W, H, W * 0.8, 6, 3, 0xffffa0)
      rect(px, W, H, W * 0.1, 8, 7, 2, 0xffffff)
      const block = (bx: number, by: number, k: number) => {
        const [a, b] = COL[k] as [number, number]
        const x = bx * cs
        const y = ground - (by + 1) * cs
        rect(px, W, H, x, y, cs, cs, a)
        dot(px, W, H, x + 1, y + 1, b)
        if (k === 0) rect(px, W, H, x, y + cs - 1, cs, 1, b)
      }
      for (let i = 0; i < Math.min(placed, plan.length); i++) {
        const b = plan[i] as Bl
        block(b.x, b.y, b.k)
      }
      const next = plan[Math.min(placed, plan.length - 1)] as Bl
      const sx = (next.x + 1) * cs + 2
      const sy = ground - 9
      sprite(px, W, H, Math.min(W - 4, sx), sy, ['.h.', 'sss', 'ccc', 'bbb', 'b.b'], { h: 0x4a2a1a, s: 0xd8a070, c: 0x3ac0c0, b: 0x3a3aaa })
      if (!hold && t % 5 < 2) dot(px, W, H, next.x * cs + 1, ground - (next.y + 1) * cs + 1, 0xffffff)
    },
  }
}

// --- card tower -------------------------------------------------------------------

const cardtower: Maker = (W, H, rng) => {
  const floor = H - 5
  const levels = 4
  const ch = 7
  type C = { x0: number; y0: number; x1: number; y1: number; vx: number; vy: number; a: number; fall: boolean }
  let cards: C[] = []
  let plan: { x0: number; y0: number; x1: number; y1: number }[] = []
  let placed = 0
  let t = 0
  let gust = 0

  function design() {
    plan = []
    for (let l = 0; l < levels; l++) {
      const n = levels - l
      const y = floor - l * ch
      for (let i = 0; i < n; i++) {
        const cx = W / 2 + (i - (n - 1) / 2) * 6
        plan.push({ x0: cx - 3, y0: y, x1: cx - 1, y1: y - ch })
        plan.push({ x0: cx + 1, y0: y - ch, x1: cx + 3, y1: y })
        if (i < n - 1 && l < levels - 1) plan.push({ x0: cx, y0: y - ch, x1: cx + 6, y1: y - ch })
      }
    }
    cards = []
    placed = 0
    gust = 0
    t = 0
  }
  design()

  return {
    step() {
      t++
      if (gust === 0) {
        if (t % 8 === 0 && placed < plan.length) {
          const p = plan[placed++]!
          cards.push({ ...p, vx: 0, vy: 0, a: 0, fall: false })
        }
        if (placed >= plan.length && t > plan.length * 8 + 40) {
          gust = 1
          for (const c of cards) {
            c.fall = true
            c.vx = (rng() - 0.3) * 1
            c.vy = -rng() * 0.8
          }
        }
      } else {
        gust++
        for (const c of cards) {
          c.vy += 0.08
          for (const k of ['0', '1'] as const) {
            ;(c as unknown as Record<string, number>)['x' + k] += c.vx
            ;(c as unknown as Record<string, number>)['y' + k] += c.vy
          }
          if (Math.max(c.y0, c.y1) > floor) {
            const d = Math.max(c.y0, c.y1) - floor
            c.y0 -= d
            c.y1 -= d
            c.vy = 0
            c.vx *= 0.8
            c.y0 += (floor - c.y0) * 0.2
            c.y1 += (floor - c.y1) * 0.2
          }
        }
        if (gust > 120) design()
      }
    },
    draw(px) {
      px.fill(0x1a5a3a)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 7) > 0.92) px[y * W + x] = 0x14502f
      rect(px, W, H, 0, floor + 1, W, H - floor - 1, 0x6a4026)
      for (const c of cards) {
        line(px, W, H, c.x0, c.y0, c.x1, c.y1, 0xf8f8f8)
        dot(px, W, H, (c.x0 + c.x1) / 2, (c.y0 + c.y1) / 2, 0xe03a3a)
      }
      if (gust > 0 && gust < 30) for (let k = 0; k < 5; k++) line(px, W, H, (gust * 2 + k * 9) % W, 10 + k * 7, (gust * 2 + k * 9) % W + 4, 10 + k * 7, 0x8ad0ff)
    },
  }
}

// --- jenga collapse ---------------------------------------------------------------

const jenga: Maker = (W, H, rng) => {
  const floor = H - 4
  const bw = Math.round(W * 0.42)
  const bh = 2
  type B = { layer: number; slot: number; gone: boolean; x: number; y: number; vx: number; vy: number; fall: boolean }
  let blocks: B[] = []
  let layers = 0
  let t = 0
  let pull: B | undefined
  let pullT = 0
  let collapse = 0
  let pulls = 0

  function build() {
    blocks = []
    layers = Math.min(18, Math.floor((H - 10) / bh))
    for (let l = 0; l < layers; l++) for (let s = 0; s < 3; s++) blocks.push({ layer: l, slot: s, gone: false, x: 0, y: 0, vx: 0, vy: 0, fall: false })
    collapse = 0
    pulls = 0
  }
  build()
  const pos = (b: B): [number, number, number] => {
    const y = floor - (b.layer + 1) * bh
    if (b.layer % 2 === 0) return [W / 2 - bw / 2, y, bw]
    const w = bw / 3
    return [W / 2 - bw / 2 + b.slot * w, y, w - 0.5]
  }

  return {
    step() {
      t++
      if (collapse > 0) {
        collapse++
        for (const b of blocks) {
          if (!b.fall) continue
          b.vy += 0.12
          b.x += b.vx
          b.y += b.vy
          if (b.y > floor - pos(b)[1] - bh) {
            b.vy *= -0.3
            b.vx *= 0.7
            b.y = floor - pos(b)[1] - bh
          }
        }
        if (collapse > 120) build()
        return
      }
      if (!pull) {
        if (t % 40 === 0) {
          const cand = blocks.filter(b => !b.gone && b.layer < layers - 3 && b.layer > 0 && b.slot !== 1 && b.layer % 2 === 1)
          pull = pick(rng, cand)
          pullT = 0
        }
        return
      }
      pullT++
      if (pullT > 20) {
        pull.gone = true
        blocks.push({ layer: layers + Math.floor(pulls / 3), slot: pulls % 3, gone: false, x: 0, y: 0, vx: 0, vy: 0, fall: false })
        pulls++
        pull = undefined
        const risk = pulls * 0.04
        if (rng() < risk) {
          collapse = 1
          for (const b of blocks) if (!b.gone && b.layer > 2) {
            b.fall = true
            b.vx = (rng() - 0.5) * 1.2 + (b.layer - layers / 2) * 0.03
            b.vy = -rng() * 0.5
          }
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x3a2a3a, 0x5a4048, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0x8a5a36)
      const sway = collapse === 0 ? Math.sin(t * 0.05) * pulls * 0.04 : 0
      for (const b of blocks) {
        if (b.gone) continue
        const [x, y, w] = pos(b)
        let dx = sway * (b.layer / layers) * 3
        if (b === pull) dx += (pullT / 20) * (b.slot === 0 ? -bw : bw)
        const c = (b.layer + b.slot) % 2 ? 0xe8c890 : 0xd8b070
        rect(px, W, H, x + dx + b.x, y + b.y, w, bh, c)
        rect(px, W, H, x + dx + b.x, y + b.y, w, 1, mix(c, 0xffffff, 0.3))
        if (b.layer % 2 === 0) for (let k = 1; k < 3; k++) dot(px, W, H, x + dx + b.x + (w * k) / 3, y + b.y + 1, scale(c, 0.8))
      }
      if (pull) {
        const [x, y] = pos(pull)
        const hx = pull.slot === 0 ? x - 2 - (pullT / 20) * bw : x + bw / 3 + 1 + (pullT / 20) * bw
        rect(px, W, H, hx, y - 1, 3, 3, 0xf0c8a0)
      }
    },
  }
}

export const CRAFTS = {
  brickbuild,
  pixeldraw,
  pottery,
  crossstitch,
  fusebeads,
  mosaic,
  loom,
  mural,
  sandcastle,
  blockhouse,
  cardtower,
  jenga,
}

