import { disc, dot, hsv, mix, rect, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, ellipse, hash, irand, line, pick, poly, sparks } from '../kit'
import type { Spark } from '../kit'

// Science experiments: each one comes with a built-in "wait for it".

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

function lab(px: Uint32Array, W: number, H: number, bench: number) {
  sky(px, W, H, 0xe8eef4, 0xd0dae4, bench)
  for (let y = 4; y < bench; y += 6) for (let x = (y / 6) % 2 ? 0 : 3; x < W; x += 6) rect(px, W, H, x, y, 5, 5, 0xf0f4f8)
  rect(px, W, H, 0, bench, W, H - bench, 0x3a3e46)
  rect(px, W, H, 0, bench, W, 1, 0x5a5e66)
}

// --- elephant toothpaste ----------------------------------------------------------

const toothpaste: Maker = (W, H, rng) => {
  const bench = Math.round(H * 0.8)
  const cx = W / 2
  let t = 0
  let foam: { x: number; y: number; vy: number; c: number; r: number }[] = []
  let col = [0xff6aa0, 0x6ab0ff]

  return {
    step() {
      t++
      if (t > 40 && t < 160) for (let k = 0; k < 3; k++) foam.push({ x: cx + (rng() - 0.5) * 2, y: bench - 12, vy: -1.4 - rng() * 0.6 + span(t, 40, 160) * 0.8, c: (t >> 3) % 2 ? (col[0] as number) : (col[1] as number), r: 1.5 + rng() })
      for (const f of foam) {
        f.vy += 0.03
        f.y += f.vy
        if (f.y > bench - 2) {
          f.y = bench - 2
          f.vy = 0
          f.x += (f.x < cx ? -1 : 1) * 0.15
        }
      }
      if (foam.length > 500) foam = foam.slice(-500)
      if (t > 320) {
        t = 0
        foam = []
        col = [hsv(rng(), 0.6, 1), hsv(rng(), 0.6, 1)]
      }
    },
    draw(px) {
      lab(px, W, H, bench)
      poly(px, W, H, [[cx - 2, bench - 13], [cx + 2, bench - 13], [cx + 6, bench], [cx - 6, bench]], 0xd8ecf4)
      poly(px, W, H, [[cx - 4, bench - 6], [cx + 4, bench - 6], [cx + 6, bench], [cx - 6, bench]], t < 40 ? 0xf0e070 : 0xf0d8e0)
      rect(px, W, H, cx - 2, bench - 15, 4, 2, 0xd8ecf4)
      if (t > 20 && t < 40) line(px, W, H, cx + 8, bench - 24, cx + 1, bench - 14, 0x8a5aff)
      for (const f of foam) disc(px, W, H, f.x, f.y, f.r, f.c)
      sprite(px, W, H, 1, bench - 9, ['.ww.', 'wwww', 'w..w'], { w: 0x3a3a3a })
    },
  }
}

// --- mentos and cola --------------------------------------------------------------

const mentos: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.85)
  const cx = W / 2
  let t = 0
  let spray: { x: number; y: number; vx: number; vy: number }[] = []
  let level = 1

  return {
    step() {
      t++
      if (t > 40 && t < 130 && level > 0) {
        const p = Math.max(0.2, level) * 3.4
        for (let k = 0; k < 6; k++) spray.push({ x: cx + (rng() - 0.5), y: ground - 12, vx: (rng() - 0.5) * 0.5, vy: -p * (0.85 + rng() * 0.3) })
        level -= 0.008
      }
      for (const s of spray) {
        s.vy += 0.12
        s.x += s.vx
        s.y += s.vy
      }
      spray = spray.filter(s => s.y < ground)
      if (t > 240) {
        t = 0
        level = 1
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ab8f0, 0xd8f0ff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x5aa83a)
      for (const s of spray) dot(px, W, H, s.x, s.y, s.vy < 0 ? 0xf0e8d8 : 0x8a5a3a)
      const by = ground - 12
      rect(px, W, H, cx - 2, by + 3, 5, 9, 0x3a2418)
      const lv = Math.round(level * 8)
      rect(px, W, H, cx - 2, by + 3, 5, 9 - lv, 0xd8ecf4)
      rect(px, W, H, cx - 1, by, 3, 3, 0xd8ecf4)
      rect(px, W, H, cx - 2, by + 6, 5, 2, 0xe03a3a)
      if (t < 40) {
        const my = 2 + (t / 40) * (by - 4)
        for (let k = 0; k < 3; k++) disc(px, W, H, cx, my - k * 3, 1, 0xf8f8f0)
      }
    },
  }
}

// --- newton's cradle --------------------------------------------------------------

const cradle: Maker = (W, H, rng) => {
  const n = 5
  const r = Math.min(2.2, W / 14)
  const L = H * 0.32
  const top = H * 0.2
  const x0 = W / 2 - (n - 1) * r
  let k = 1
  let amp = 0.38
  let t = 0

  return {
    step() {
      t++
      amp *= 0.9985
      if (amp < 0.12) {
        amp = 0.38
        k = 1 + irand(rng, 2)
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a2e38, 0x14161c)
      rect(px, W, H, x0 - r - 3, top - 1, (n - 1) * r * 2 + r * 2 + 6, 1, 0xb0b8c4)
      rect(px, W, H, x0 - r - 3, top + L + r + 3, (n - 1) * r * 2 + r * 2 + 6, 2, 0x5a5e68)
      rect(px, W, H, x0 - r - 3, top - 1, 1, L + r + 5, 0xb0b8c4)
      rect(px, W, H, x0 + (n - 1) * r * 2 + r + 2, top - 1, 1, L + r + 5, 0xb0b8c4)
      // the end balls take turns: k balls swing out on one side, then k on the other
      const s = Math.sin(t * 0.11)
      for (let i = 0; i < n; i++) {
        let a = 0
        if (i < k && s < 0) a = amp * s
        if (i >= n - k && s > 0) a = amp * s
        const px0 = x0 + i * r * 2
        const bx = px0 + Math.sin(a) * L
        const by = top + Math.cos(a) * L
        line(px, W, H, px0, top, bx, by, 0x8a8e98)
        disc(px, W, H, bx, by, r, 0xc8ccd4)
        dot(px, W, H, bx - r * 0.4, by - r * 0.4, 0xffffff)
      }
    },
  }
}

// --- tesla coil -------------------------------------------------------------------

const tesla: Maker = (W, H, rng) => {
  const base = H - 4
  const cx = W / 2
  const top = Math.round(H * 0.35)
  let arcs: [number, number][][] = []
  let t = 0

  return {
    step() {
      t++
      if (t % 2 === 0) {
        arcs = []
        const n = 1 + irand(rng, 3 + (Math.sin(t * 0.05) > 0 ? 3 : 0))
        for (let k = 0; k < n; k++) {
          let x = cx + (rng() - 0.5) * 6
          let y = top - 1
          const a = rng() * Math.PI * 2
          const seg: [number, number][] = [[x, y]]
          for (let s = 0; s < 10 + irand(rng, 8); s++) {
            x += Math.cos(a) * 1.5 + (rng() - 0.5) * 2.4
            y += Math.sin(a) * 1.5 + (rng() - 0.5) * 2.4
            seg.push([x, y])
          }
          arcs.push(seg)
        }
      }
    },
    draw(px) {
      px.fill(0x07040f)
      const glow = arcs.length / 6
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const d = Math.hypot(x - cx, y - top)
        if (d < 18) px[y * W + x] = mix(0x07040f, 0x4a2a8a, (1 - d / 18) * glow * 0.6)
      }
      for (let y = top + 3; y < base; y++) {
        rect(px, W, H, cx - 2, y, 5, 1, y % 2 ? 0xc87a3a : 0xa8602a)
      }
      rect(px, W, H, cx - 5, base, 11, 4, 0x3a3a42)
      ellipse(px, W, H, cx, top, 7, 2.5, 0xb8bcc8)
      ellipse(px, W, H, cx, top - 0.5, 5, 1.5, 0xe0e4ec)
      for (const seg of arcs)
        for (let i = 1; i < seg.length; i++) {
          const [ax, ay] = seg[i - 1] as [number, number]
          const [bx, by] = seg[i] as [number, number]
          line(px, W, H, ax, ay, bx, by, i < 3 ? 0xffffff : 0xc8a0ff)
        }
    },
  }
}

// --- mousetrap chain reaction -----------------------------------------------------

const mousetrap: Maker = (W, H, rng) => {
  type Trap = { x: number; y: number; sprung: number }
  type B = { x: number; y: number; z: number; vx: number; vy: number; vz: number }
  let traps: Trap[] = []
  let balls: B[] = []
  let t = 0

  function setup() {
    traps = []
    for (let y = 8; y < H - 4; y += 6) for (let x = 3; x < W - 3; x += 6) traps.push({ x: x + (Math.floor(y / 6) % 2) * 3, y, sprung: 0 })
    balls = [{ x: W / 2, y: H / 2, z: 30, vx: 0, vy: 0, vz: 0 }]
    t = 0
  }
  setup()

  return {
    step() {
      t++
      for (const b of balls) {
        b.vz -= 0.15
        b.x += b.vx
        b.y += b.vy
        b.z += b.vz
        if (b.z <= 0) {
          b.z = 0
          b.vz = -b.vz * 0.4
          b.vx *= 0.7
          b.vy *= 0.7
          for (const tr of traps)
            if (!tr.sprung && Math.abs(tr.x - b.x) < 3 && Math.abs(tr.y - b.y) < 3) {
              tr.sprung = 1
              for (let k = 0; k < 2; k++) {
                const a = rng() * 6.28
                const s = 0.5 + rng() * 0.8
                balls.push({ x: tr.x, y: tr.y, z: 1, vx: Math.cos(a) * s, vy: Math.sin(a) * s, vz: 2 + rng() * 1.5 })
              }
            }
        }
        if (b.x < 1 || b.x > W - 2) b.vx = -b.vx
        if (b.y < 1 || b.y > H - 2) b.vy = -b.vy
      }
      for (const tr of traps) if (tr.sprung > 0 && tr.sprung < 6) tr.sprung++
      balls = balls.filter(b => b.z > 0 || Math.abs(b.vx) + Math.abs(b.vy) > 0.05)
      if (balls.length > 120) balls = balls.slice(-120)
      if (t > 320) setup()
    },
    draw(px) {
      px.fill(0xb8a888)
      for (let y = 0; y < H; y += 5) rect(px, W, H, 0, y, W, 1, 0xa89878)
      for (const tr of traps) {
        rect(px, W, H, tr.x - 2, tr.y - 1, 5, 3, 0xd8b078)
        if (tr.sprung) rect(px, W, H, tr.x - 2, tr.y - 1, 5, 1, 0x8a8a92)
        else {
          rect(px, W, H, tr.x - 2, tr.y + 1, 5, 1, 0x8a8a92)
          dot(px, W, H, tr.x, tr.y, 0xffffff)
        }
      }
      for (const b of balls) {
        dot(px, W, H, b.x + b.z * 0.2, b.y + b.z * 0.2, 0x8a7a5a)
        disc(px, W, H, b.x, b.y - b.z * 0.5, b.z > 4 ? 1.2 : 0.8, 0xffffff)
      }
      text(px, W, H, 1, 1, String(traps.filter(tr => tr.sprung).length), 0x3a2a1a)
    },
  }
}

// --- baking soda volcano ----------------------------------------------------------

const sodavolcano: Maker = (W, H, rng) => {
  const bench = Math.round(H * 0.82)
  const cx = W / 2
  const peak = bench - 16
  let t = 0
  let foam: { x: number; y: number; vx: number; vy: number; flow: boolean }[] = []

  const slope = (x: number) => peak + Math.abs(x - cx) * 1.4

  return {
    step() {
      t++
      if (t > 50 && t < 170) for (let k = 0; k < 2; k++) foam.push({ x: cx + (rng() - 0.5) * 2, y: peak, vx: (rng() - 0.5) * 0.6, vy: -0.8 - rng() * 0.6, flow: false })
      for (const f of foam) {
        if (f.flow) {
          f.x += f.vx
          f.y = Math.min(bench - 1, slope(f.x) - 1)
          if (f.y >= bench - 1) f.vx *= 0.9
          continue
        }
        f.vy += 0.08
        f.x += f.vx
        f.y += f.vy
        if (f.vy > 0 && f.y >= slope(f.x) - 1) {
          f.flow = true
          f.vx = (f.x < cx ? -1 : 1) * (0.1 + rng() * 0.1)
        }
      }
      if (foam.length > 400) foam = foam.slice(-400)
      if (t > 300) {
        t = 0
        foam = []
      }
    },
    draw(px) {
      lab(px, W, H, bench)
      for (let x = 0; x < W; x++) {
        const y = slope(x)
        if (y < bench) rect(px, W, H, x, y, 1, bench - y, (x * 3) % 7 ? 0x8a6a4a : 0x7a5a3a)
      }
      rect(px, W, H, cx - 1, peak, 3, 2, 0x3a2a1a)
      if (t > 30 && t < 55) {
        line(px, W, H, cx + 6, peak - 12, cx + 1, peak - 1, 0xe8f0d0)
        rect(px, W, H, cx + 5, peak - 16, 4, 4, 0xe8f4f8)
      }
      for (const f of foam) dot(px, W, H, f.x, f.y, f.flow ? 0xe0402a : 0xff6a3a)
    },
  }
}

// --- crystal growth ---------------------------------------------------------------

const crystals: Maker = (W, H, rng) => {
  const jarTop = Math.round(H * 0.18)
  const jarBottom = H - 4
  const x0 = Math.round(W * 0.15)
  const x1 = W - x0
  const grid = new Uint8Array(W * H)
  let walkers: { x: number; y: number }[] = []
  let t = 0
  let col = 0x8ad0ff
  let count = 0

  function reset() {
    grid.fill(0)
    for (let y = jarTop + 3; y < jarBottom - 6; y++) grid[y * W + Math.round(W / 2)] = 1
    walkers = []
    t = 0
    count = 0
    col = pick(rng, [0x8ad0ff, 0xd08aff, 0x8affc0, 0xffd08a, 0xff8ac0])
  }
  reset()

  return {
    step() {
      t++
      while (walkers.length < 60) walkers.push({ x: x0 + 1 + irand(rng, x1 - x0 - 2), y: jarTop + 4 + irand(rng, jarBottom - jarTop - 6) })
      for (const w of walkers) {
        for (let s = 0; s < 3; s++) {
          const [dx, dy] = pick(rng, DIRS)
          w.x = clamp(w.x + dx, x0 + 1, x1 - 2)
          w.y = clamp(w.y + dy, jarTop + 4, jarBottom - 2)
          let touch = false
          for (const [ex, ey] of DIRS) if (grid[(w.y + ey) * W + w.x + ex] === 1) touch = true
          if (touch && rng() < 0.5) {
            grid[w.y * W + w.x] = 1
            count++
            w.x = -1
            break
          }
        }
      }
      walkers = walkers.filter(w => w.x >= 0)
      if (count > 260 || t > 1500) reset()
    },
    draw(px) {
      sky(px, W, H, 0xf0ece4, 0xd8d0c4)
      rect(px, W, H, x0, jarTop, x1 - x0, jarBottom - jarTop, mix(0xe8f4fc, col, 0.15))
      rect(px, W, H, x0 - 1, jarTop, 1, jarBottom - jarTop + 1, 0xc0d0dc)
      rect(px, W, H, x1, jarTop, 1, jarBottom - jarTop + 1, 0xc0d0dc)
      rect(px, W, H, x0 - 1, jarBottom, x1 - x0 + 2, 1, 0xc0d0dc)
      rect(px, W, H, x0 - 3, jarTop - 1, x1 - x0 + 6, 1, 0x8a6a4a)
      for (let y = jarTop; y < jarBottom; y++)
        for (let x = x0; x < x1; x++)
          if (grid[y * W + x]) px[y * W + x] = x === Math.round(W / 2) && y < jarBottom - 6 && !grid[y * W + x - 1] && !grid[y * W + x + 1] ? 0xf0f0f0 : hash(x, y, 4) > 0.6 ? mix(col, 0xffffff, 0.6) : col
      for (const w of walkers) if (hash(w.x, w.y, t) > 0.7) dot(px, W, H, w.x, w.y, mix(col, 0xffffff, 0.3))
    },
  }
}

// --- balloon pop in slow motion ---------------------------------------------------

const balloonpop: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.42
  const R = Math.min(W * 0.32, 10)
  let t = 0
  let drops: Spark[] = []

  return {
    step() {
      t++
      drops = sparks(drops, 0.06)
      if (t === 150) burst(drops, rng, cx, cy + R, 0x6ab0ff, 30, 1)
      if (t > 220) {
        t = 0
        drops = []
      }
    },
    draw(px) {
      sky(px, W, H, 0x1a1a2a, 0x2a2a3a)
      rect(px, W, H, 0, H - 4, W, 4, 0x3a3a4a)
      const pinX = cx + R + 8 - span(t, 20, 60) * 8
      const peel = span(t, 62, 100)
      const fall = span(t, 100, 150)
      const wy = cy + fall * fall * (H - cy - 6)
      if (t < 62) {
        disc(px, W, H, cx, cy, R, 0xe03a5a)
        dot(px, W, H, cx - R * 0.4, cy - R * 0.4, 0xff8aa0)
        dot(px, W, H, cx, cy + R + 1, 0xa02a3a)
      } else if (t < 150) {
        const squash = fall * 0.4
        ellipse(px, W, H, cx, wy, R * (1 + squash * 0.3), R * (1 - squash), 0x5aa0f0)
        dot(px, W, H, cx - R * 0.3, wy - R * 0.3, 0xc8e8ff)
        if (peel < 1) {
          const a0 = Math.PI * peel
          for (let k = 0; k < 40; k++) {
            const a = (k / 40) * Math.PI * 2
            const rel = Math.abs(Math.atan2(Math.sin(a), Math.cos(a)))
            if (rel < a0) continue
            dot(px, W, H, cx + Math.cos(a) * (R + 0.5 + peel * 3), cy + Math.sin(a) * (R + 0.5 + peel * 3), 0xe03a5a)
          }
        }
      }
      rect(px, W, H, pinX, cy - 0.5, 8, 1, 0xd0d0d8)
      dot(px, W, H, pinX + 8, cy, 0xe03a3a)
      for (const d of drops) dot(px, W, H, d.x, d.y, d.c)
      if (t > 60 && t < 160) text(px, W, H, 1, 1, '1000', 0xffe040)
    },
  }
}

// --- chladni plate ----------------------------------------------------------------

const chladni: Maker = (W, H, rng) => {
  const S = Math.min(W - 2, H - 10)
  const ox = (W - S) / 2
  const oy = (H - S) / 2
  let mode = [3, 5]
  let grains = Array.from({ length: 500 }, () => ({ x: rng(), y: rng() }))
  let t = 0

  const amp = (x: number, y: number) => {
    const [n, m] = mode as [number, number]
    return Math.sin(n * Math.PI * x) * Math.sin(m * Math.PI * y) - Math.sin(m * Math.PI * x) * Math.sin(n * Math.PI * y)
  }

  return {
    step() {
      t++
      if (t % 260 === 0) {
        mode = pick(rng, [
          [3, 5],
          [2, 7],
          [4, 7],
          [1, 4],
          [3, 8],
        ]) as number[]
      }
      const shake = 0.012
      for (const g of grains) {
        const a = Math.abs(amp(g.x, g.y))
        g.x = clamp(g.x + (rng() - 0.5) * shake * a * 3, 0, 1)
        g.y = clamp(g.y + (rng() - 0.5) * shake * a * 3, 0, 1)
      }
    },
    draw(px) {
      px.fill(0x1a1a20)
      rect(px, W, H, ox, oy, S, S, 0x2a2a34)
      rect(px, W, H, W / 2 - 1, oy + S, 3, H - oy - S, 0x5a5a62)
      for (const g of grains) dot(px, W, H, ox + g.x * (S - 1), oy + g.y * (S - 1), 0xf0e8d0)
      text(px, W, H, 1, 1, String(mode[0]! * 100 + mode[1]! * 10), 0x8a8a9a)
    },
  }
}

// --- gas in a box -----------------------------------------------------------------

const gasbox: Maker = (W, H, rng) => {
  const x0 = 3
  const x1 = W - 4
  const bottom = H - 8
  let piston = H * 0.3
  let temp = 0.3
  let target = 0.3
  let t = 0
  const ps = Array.from({ length: 50 }, () => {
    const a = rng() * 6.28
    return { x: x0 + 1 + rng() * (x1 - x0 - 2), y: piston + 1 + rng() * (bottom - piston - 2), vx: Math.cos(a), vy: Math.sin(a) }
  })

  return {
    step() {
      t++
      if (t % 200 === 0) target = target < 0.5 ? 1 : 0.25
      temp += (target - temp) * 0.01
      let hits = 0
      for (const p of ps) {
        const s = Math.hypot(p.vx, p.vy) || 1
        const want = 0.3 + temp * 1.2
        p.vx = (p.vx / s) * want
        p.vy = (p.vy / s) * want
        p.x += p.vx
        p.y += p.vy
        if (p.x < x0 + 1 || p.x > x1 - 1) {
          p.vx = -p.vx
          p.x = clamp(p.x, x0 + 1, x1 - 1)
        }
        if (p.y > bottom - 1) {
          p.vy = -Math.abs(p.vy)
          p.y = bottom - 1
        }
        if (p.y < piston + 1) {
          p.vy = Math.abs(p.vy)
          p.y = piston + 1
          hits++
        }
      }
      const want = bottom - 10 - temp * (bottom - 20) * 0.75
      piston += (want - piston) * 0.03
    },
    draw(px) {
      sky(px, W, H, 0xe8eef4, 0xd0dae4)
      rect(px, W, H, x0 - 1, 2, 1, bottom - 1, 0x8a8e98)
      rect(px, W, H, x1, 2, 1, bottom - 1, 0x8a8e98)
      rect(px, W, H, x0 - 1, bottom, x1 - x0 + 2, 1, 0x8a8e98)
      rect(px, W, H, x0, piston - 2, x1 - x0, 2, 0x6a6e78)
      rect(px, W, H, W / 2 - 1, 0, 2, piston - 2, 0x8a8e98)
      for (const p of ps) dot(px, W, H, p.x, p.y, mix(0x3a6ae0, 0xff3a2a, temp))
      const flames = Math.round(temp * 4)
      for (let k = 0; k < flames; k++) for (let x = x0 + 2; x < x1 - 1; x += 3) dot(px, W, H, x + (k % 2), bottom + 2 + (k % 2), k % 2 ? 0xff8a20 : 0x3a8aff)
      rect(px, W, H, 1, bottom + 5, W - 2, 2, 0x5a5e68)
      text(px, W, H, 1, 3, String(Math.round(20 + temp * 80)), mix(0x3a6ae0, 0xff3a2a, temp))
    },
  }
}

// --- water rocket -----------------------------------------------------------------

const waterrocket: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.88)
  const cx = W / 2
  let t = 0
  let y = 0
  let vy = 0
  let water: Spark[] = []
  let phase = 0

  return {
    step() {
      t++
      water = sparks(water, 0.12).filter(w => w.y < ground)
      if (phase === 0) {
        y = 0
        if (t > 90) {
          phase = 1
          vy = -2.6
        }
      } else if (phase === 1) {
        vy += 0.05
        y += vy
        if (t < 120) for (let k = 0; k < 4; k++) water.push({ x: cx + (rng() - 0.5), y: ground - 2 + y, vx: (rng() - 0.5) * 0.6, vy: 1 + rng(), l: 20, c: 0x8ad0ff })
        if (vy > 0) phase = 2
      } else if (phase === 2) {
        vy = Math.min(0.4, vy + 0.02)
        y += vy
        if (y >= 0) {
          y = 0
          phase = 3
          t = 0
        }
      } else if (phase === 3 && t > 40) {
        phase = 0
        t = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0x5ab0f0, 0xd8f0ff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x5aa83a)
      const ry = ground - 10 + y
      const drawY = Math.max(ry, 6)
      if (phase === 2) {
        ellipse(px, W, H, cx, drawY - 8, 5, 2, 0xe03a3a)
        line(px, W, H, cx - 4, drawY - 7, cx, drawY, 0xd0d0d0)
        line(px, W, H, cx + 4, drawY - 7, cx, drawY, 0xd0d0d0)
      }
      rect(px, W, H, cx - 1.5, drawY, 3, 9, 0xd8ecf4)
      rect(px, W, H, cx - 0.5, drawY - 2, 1, 2, 0xe03a3a)
      poly(px, W, H, [[cx - 1.5, drawY + 6], [cx - 3.5, drawY + 9], [cx - 1.5, drawY + 9]], 0xe03a3a)
      poly(px, W, H, [[cx + 1.5, drawY + 6], [cx + 3.5, drawY + 9], [cx + 1.5, drawY + 9]], 0xe03a3a)
      if (phase === 0) rect(px, W, H, cx - 1.5, drawY + 3, 3, 6, 0x6ab0ff)
      rect(px, W, H, cx - 3, ground - 1, 6, 1, 0x5a5a62)
      if (phase === 0) {
        const pump = Math.abs(Math.sin(t * 0.3)) * 3
        rect(px, W, H, 3, ground - 8 + pump, 1, 8 - pump, 0x3a3a42)
        rect(px, W, H, 2, ground - 9 + pump, 3, 1, 0x3a3a42)
        line(px, W, H, 3, ground - 1, cx - 3, ground - 1, 0x2a2a2a)
        text(px, W, H, W - 8, 2, String(Math.floor((t / 90) * 9)), 0x2a3a6a)
      }
      for (const w of water) dot(px, W, H, w.x, w.y, w.c)
    },
  }
}

// --- egg drop ---------------------------------------------------------------------

const eggdrop: Maker = (W, H, rng) => {
  const ground = H - 5
  let t = 0
  let kind = 0
  let y = 0
  let vy = 0
  let landed = false
  let survived = false
  let score = [0, 0]

  function reset() {
    kind = irand(rng, 3)
    y = 2
    vy = 0
    t = 0
    landed = false
    survived = kind === 0 ? rng() < 0.85 : kind === 1 ? rng() < 0.6 : rng() < 0.3
  }
  reset()

  return {
    step() {
      t++
      if (landed) {
        if (t > 60) reset()
        return
      }
      const drag = kind === 0 ? 0.12 : 0.02
      vy += 0.08
      vy *= 1 - drag
      y += vy
      if (y >= ground - 6) {
        y = ground - 6
        landed = true
        t = 0
        score[survived ? 0 : 1]!++
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ab0f0, 0xe0f4ff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x8a8a92)
      rect(px, W, H, 0, 0, 5, ground, 0xb87a5a)
      for (let yy = 2; yy < ground; yy += 4) rect(px, W, H, 1, yy, 3, 2, 0x8ad0f0)
      const cx = W / 2 + 2
      if (kind === 0 && !landed) {
        ellipse(px, W, H, cx, y - 8, 6, 2.5, 0xff6a3a)
        line(px, W, H, cx - 5, y - 7, cx - 1, y, 0xd0d0d0)
        line(px, W, H, cx + 5, y - 7, cx + 1, y, 0xd0d0d0)
      }
      if (kind === 1) {
        rect(px, W, H, cx - 3, y, 7, 6, 0xc8a070)
        for (let k = 0; k < 3; k++) line(px, W, H, cx - 3 + k * 3, y, cx - 4 + k * 3, y - 2, 0xff6aa0)
      }
      if (kind === 2) for (let k = 0; k < 3; k++) disc(px, W, H, cx - 3 + k * 3, y - 6 - (k % 2) * 2, 1.8, hsv(k * 0.3, 0.6, 1))
      if (landed && !survived) {
        ellipse(px, W, H, cx, ground - 1, 4, 1, 0xffffff)
        disc(px, W, H, cx, ground - 1, 1.2, 0xffc020)
      } else {
        ellipse(px, W, H, cx, y + (kind === 1 ? 3 : 2), 1.5, 2, 0xfaf4e8)
        dot(px, W, H, cx - 0.5, y + 1, 0xffffff)
      }
      if (landed) text(px, W, H, W / 2 - 1, 8, survived ? '!' : 'x', survived ? 0x3ac06a : 0xe03a3a)
      text(px, W, H, 7, ground + 1, String(score[0]), 0x3ac06a)
      text(px, W, H, W - 4, ground + 1, String(score[1]! % 10), 0xe03a3a)
    },
  }
}

// --- coil train -------------------------------------------------------------------

const coiltrain: Maker = (W, H) => {
  const cy = H / 2
  const R = Math.min(W * 0.4, H * 0.35)
  let a = 0
  let t = 0

  return {
    step() {
      t++
      a += 0.04
    },
    draw(px) {
      sky(px, W, H, 0x1a1e2a, 0x2a2e3a)
      const pos = (q: number): [number, number] => [W / 2 + Math.cos(q) * R, cy + Math.sin(q) * R * 0.55]
      const turns = 60
      const lit = (q: number) => Math.abs(Math.atan2(Math.sin(q - a), Math.cos(q - a))) < 0.35
      for (let k = 0; k < turns; k++) {
        const q = (k / turns) * Math.PI * 2
        if (Math.sin(q) > 0) continue
        const [x, y] = pos(q)
        const c = lit(q) ? 0xffd080 : 0xc87a3a
        line(px, W, H, x, y - 2, x, y + 2, c)
      }
      const [bx, by] = pos(a)
      const dir = a + Math.PI / 2
      for (let k = -2; k <= 2; k++) disc(px, W, H, bx + Math.cos(dir) * k, by + Math.sin(dir) * k * 0.55, 1.4, Math.abs(k) === 2 ? 0x9aa0aa : 0x3a3a3a)
      dot(px, W, H, bx, by - 1, 0xd8a020)
      for (let k = 0; k < turns; k++) {
        const q = (k / turns) * Math.PI * 2
        if (Math.sin(q) <= 0) continue
        const [x, y] = pos(q)
        const c = lit(q) ? 0xffe0a0 : 0xd88a4a
        line(px, W, H, x, y - 2, x, y + 2, c)
      }
      if (Math.sin(a) > 0) for (let k = -2; k <= 2; k++) dot(px, W, H, bx + Math.cos(dir) * k, by + Math.sin(dir) * k * 0.55, 0x5a5a62)
    },
  }
}

// --- ant farm ---------------------------------------------------------------------

const antfarm: Maker = (W, H, rng) => {
  const surface = Math.round(H * 0.2)
  const dug = new Uint8Array(W * H)
  type A = { x: number; y: number; dx: number; dy: number; carry: boolean }
  let ants: A[] = []
  let heap = new Float32Array(W)
  let t = 0

  function reset() {
    dug.fill(0)
    heap.fill(0)
    ants = Array.from({ length: 6 }, () => ({ x: W / 2, y: surface, dx: 0, dy: 1, carry: false }))
    t = 0
  }
  reset()

  return {
    step() {
      t++
      for (const a of ants) {
        if (a.carry) {
          // carry the grain back up through the tunnels
          const up = a.y > surface && (dug[(a.y - 1) * W + a.x] || a.y - 1 <= surface)
          if (up) a.y--
          else {
            const side = pick(rng, [-1, 1])
            if (dug[a.y * W + a.x + side]) a.x += side
          }
          if (a.y <= surface) {
            const hx = clamp(a.x + irand(rng, 7) - 3, 1, W - 2)
            heap[hx] = Math.min(surface - 2, heap[hx]! + 0.4)
            a.carry = false
          }
          continue
        }
        if (rng() < 0.2) {
          const d = pick(rng, [
            [0, 1],
            [0, 1],
            [0, 1],
            [1, 0],
            [-1, 0],
            [1, 1],
            [-1, 1],
          ])
          a.dx = d[0] as number
          a.dy = d[1] as number
        }
        const nx = clamp(a.x + a.dx, 1, W - 2)
        const ny = clamp(a.y + a.dy, surface, H - 3)
        if (!dug[ny * W + nx] && ny > surface) {
          // walk the tunnels freely, and only sometimes dig at the end of one
          if (rng() < (a.dy > 0 ? 0.9 : 0.2)) {
            dug[ny * W + nx] = 1
            a.carry = true
            a.x = nx
            a.y = ny
          }
          continue
        }
        a.x = nx
        a.y = ny
      }
      if (t > 2000) reset()
    },
    draw(px) {
      sky(px, W, H, 0x9ad0f0, 0xd8eef8, surface)
      for (let y = surface; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = dug[y * W + x] ? 0x4a3420 : hash(x, y, 2) > 0.85 ? 0xc8a070 : 0xd8b484
      for (let x = 0; x < W; x++) if (heap[x]! > 0) rect(px, W, H, x, surface - heap[x]!, 1, heap[x]!, 0xd0a878)
      rect(px, W, H, 0, 0, 1, H, 0x8a6a4a)
      rect(px, W, H, W - 1, 0, 1, H, 0x8a6a4a)
      rect(px, W, H, 0, H - 2, W, 2, 0x8a6a4a)
      for (const a of ants) {
        dot(px, W, H, a.x, a.y, 0x1a0e06)
        dot(px, W, H, a.x - a.dx, a.y - a.dy, 0x2a1a0e)
        if (a.carry) dot(px, W, H, a.x + a.dx, a.y + a.dy, 0xe8c890)
      }
    },
  }
}

export const SCIENCE = {
  toothpaste,
  mentos,
  cradle,
  tesla,
  mousetrap,
  sodavolcano,
  crystals,
  balloonpop,
  chladni,
  gasbox,
  waterrocket,
  eggdrop,
  coiltrain,
  antfarm,
}

