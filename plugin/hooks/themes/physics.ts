import { add, disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, collide, hitSeg, irand, keepSpeed, line, ring, shiny, shuffle, sparks, textWidth, wallCircle } from '../kit'
import type { Ball, Spark } from '../kit'

// Ball & marble physics: a few balls, simple rules, a tense ending.

// --- ball grows on every bounce ---------------------------------------------------

const grow: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const R = Math.max(4, Math.min(W / 2 - 1, H / 2 - 5))
  let b: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: 1, c: 0 }
  let hue = 0
  let bounces = 0
  let hold = 0
  let flash = 0
  let trail: [number, number][] = []

  function reset() {
    hue = rng()
    b = { x: cx + (rng() - 0.5) * 4, y: cy - R * 0.4, vx: (rng() - 0.5) * 1.6, vy: 0, r: 1.2, c: hsv(hue, 0.7, 1) }
    bounces = 0
    trail = []
  }
  reset()

  return {
    step() {
      if (flash > 0) flash--
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (let s = 0; s < 2; s++) {
        b.vy += 0.03
        b.x += b.vx / 2
        b.y += b.vy / 2
        if (wallCircle(b, cx, cy, R)) {
          bounces++
          b.r = Math.min(R - 0.4, b.r + 0.32)
          hue += 0.06
          b.c = hsv(hue, 0.7, 1)
          keepSpeed(b, 1.2, 2.4)
          b.vx += (rng() - 0.5) * 0.3
          wallCircle(b, cx, cy, R)
          flash = 3
          if (b.r >= R - 0.6) hold = 50
        }
      }
      trail.push([b.x, b.y])
      if (trail.length > 8) trail.shift()
    },
    draw(px) {
      sky(px, W, H, 0x0c0a1e, 0x1e1036)
      ring(px, W, H, cx, cy, R + 1, flash > 0 ? 0xffffff : 0x8a7ac8)
      ring(px, W, H, cx, cy, R + 2, 0x3a2e68)
      trail.forEach(([x, y], i) => disc(px, W, H, x, y, b.r * 0.6, mix(0x1e1036, b.c, (i / trail.length) * 0.4)))
      shiny(px, W, H, b)
      if (hold > 0 && hold % 10 < 5) ring(px, W, H, cx, cy, R + 1, b.c)
      text(px, W, H, 1, 1, String(bounces), 0xffffff)
    },
  }
}

// --- escape the spinning rings ----------------------------------------------------

const rings: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const Rmax = Math.max(6, Math.min(W / 2 - 1, H / 2 - 5))
  type Ring = { r: number; a: number; w: number; gap: number; c: number; alive: boolean }
  let list: Ring[] = []
  let b: Ball = { x: cx, y: cy, vx: 0, vy: 0, r: 1, c: 0xffffff }
  let bits: Spark[] = []
  let broken = 0
  let hold = 0

  function reset() {
    list = []
    const hue = rng()
    for (let r = 4.5; r <= Rmax; r += 2.6) list.push({ r, a: rng() * Math.PI * 2, w: (0.02 + rng() * 0.03) * (list.length % 2 ? -1 : 1), gap: 0.95, c: hsv(hue + list.length * 0.11, 0.75, 1), alive: true })
    b = { x: cx, y: cy, vx: (rng() - 0.5) * 1.4, vy: -0.6, r: 1, c: 0xffffff }
    broken = 0
  }
  reset()

  return {
    step() {
      bits = sparks(bits, 0.03)
      for (const g of list) g.a += g.w
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (let s = 0; s < 3; s++) {
        b.vy += 0.012
        b.x += b.vx / 3
        b.y += b.vy / 3
        const g = list.find(q => q.alive)
        if (!g) {
          hold = 45
          break
        }
        const d = Math.hypot(b.x - cx, b.y - cy)
        if (d + b.r <= g.r) continue
        let rel = Math.atan2(b.y - cy, b.x - cx) - g.a
        rel = Math.atan2(Math.sin(rel), Math.cos(rel))
        if (Math.abs(rel) < g.gap / 2) {
          if (d - b.r > g.r) {
            g.alive = false
            broken++
            for (let i = 0; i < 24; i++) {
              const a = (i / 24) * Math.PI * 2
              if (Math.abs(Math.atan2(Math.sin(a - g.a), Math.cos(a - g.a))) < g.gap / 2) continue
              bits.push({ x: cx + Math.cos(a) * g.r, y: cy + Math.sin(a) * g.r, vx: Math.cos(a) * 0.7, vy: Math.sin(a) * 0.7, l: 14, c: g.c })
            }
          }
        } else if (wallCircle(b, cx, cy, g.r)) {
          keepSpeed(b, 1.1, 1.8)
          b.vx += (rng() - 0.5) * 0.2
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x050510, 0x10102a)
      for (const g of list) {
        if (!g.alive) continue
        const n = Math.ceil(g.r * 8)
        for (let i = 0; i < n; i++) {
          const a = g.a + (i / n) * Math.PI * 2
          const rel = Math.atan2(Math.sin(a - g.a), Math.cos(a - g.a))
          if (Math.abs(rel) < g.gap / 2) continue
          dot(px, W, H, cx + Math.cos(a) * g.r, cy + Math.sin(a) * g.r, g.c)
        }
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      shiny(px, W, H, b)
      text(px, W, H, 1, 1, String(broken), 0xffffff)
    },
  }
}

// --- marble race elimination ------------------------------------------------------

const marblerace: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.52
  const a = Math.max(3, W / 2 - 4)
  const L = Math.max(2, H - 16 - 2 * a)
  const P = 2 * L + 2 * Math.PI * a
  const pos = (u: number): [number, number, number, number] => {
    u = ((u % P) + P) % P
    if (u < L) return [cx + a, cy + L / 2 - u, 0, -1]
    u -= L
    if (u < Math.PI * a) {
      const th = u / a
      return [cx + a * Math.cos(th), cy - L / 2 - a * Math.sin(th), -Math.sin(th), -Math.cos(th)]
    }
    u -= Math.PI * a
    if (u < L) return [cx - a, cy - L / 2 + u, 0, 1]
    u -= L
    const th = Math.PI + u / a
    return [cx + a * Math.cos(th), cy + L / 2 - a * Math.sin(th), -Math.sin(th), -Math.cos(th)]
  }
  const bg = new Uint32Array(W * H)
  {
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) bg[y * W + x] = (Math.floor(y / 4) % 2 ? 0x3c8c3c : 0x358035)
    const put = (x: number, y: number, c: number) => {
      x = Math.round(x)
      y = Math.round(y)
      if (x >= 0 && y >= 0 && x < W && y < H) bg[y * W + x] = c
    }
    const n = Math.ceil(P * 3)
    for (let i = 0; i < n; i++) {
      const [x, y, tx, ty] = pos((i / n) * P)
      for (let o = -2; o <= 2; o += 0.5) put(x - ty * o, y + tx * o, 0x8a8a94)
    }
    for (let i = 0; i < n; i++) {
      const [x, y, tx, ty] = pos((i / n) * P)
      const k = Math.floor((i / n) * P / 2) % 2 ? 0xffffff : 0xe03030
      put(x - ty * 3, y + tx * 3, k)
      put(x + ty * 3, y - tx * 3, k)
    }
    for (let o = -2; o <= 2; o++) for (let d = 0; d < 2; d++) put(cx + a + o, cy + L / 2 - d, (o + d) % 2 ? 0x111111 : 0xffffff)
  }
  type M = { d: number; c: number; bias: number; ph: number; f: number; off: number; out: number }
  let ms: M[] = []
  let leaderLap = 0
  let hold = 0
  let t = 0
  let bits: Spark[] = []
  const COLS = [0xff3b3b, 0x3b9bff, 0xffd23b, 0x3bdc6a, 0xc04bff, 0xff8a2a, 0xffffff]

  function reset() {
    ms = COLS.slice(0, W >= 24 ? 7 : 4).map((c, i) => ({ d: -i * 1.2, c, bias: rng() * 0.08, ph: rng() * 6, f: 0.02 + rng() * 0.03, off: 0, out: 0 }))
    leaderLap = 0
  }
  reset()

  return {
    step() {
      t++
      bits = sparks(bits)
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      const live = ms.filter(m => !m.out)
      for (const m of live) {
        m.d += 0.5 + m.bias + 0.14 * Math.sin(t * m.f + m.ph)
        m.off = 1.4 * Math.sin(t * m.f * 1.3 + m.ph * 2)
      }
      const lead = Math.max(...live.map(m => m.d))
      if (Math.floor(lead / P) > leaderLap) {
        leaderLap = Math.floor(lead / P)
        const last = live.reduce((p, m) => (m.d < p.d ? m : p))
        last.out = 1
        const [x, y] = pos(last.d)
        burst(bits, rng, x, y, last.c, 14)
        if (live.length - 1 <= 1) hold = 90
      }
    },
    draw(px) {
      px.set(bg)
      for (const m of ms) {
        if (m.out) continue
        const [x, y, tx, ty] = pos(m.d)
        const b = { x: x - ty * m.off, y: y + tx * m.off, vx: 0, vy: 0, r: 1.2, c: m.c }
        shiny(px, W, H, b)
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      const order = ms.filter(m => !m.out).sort((p, q) => q.d - p.d)
      order.forEach((m, i) => rect(px, W, H, 1 + i * 3, 1, 2, 2, m.c))
      ms.filter(m => m.out).forEach((m, i) => rect(px, W, H, W - 3 - i * 3, 1, 2, 2, scale(m.c, 0.35)))
      if (hold > 0) {
        const w = order[0]
        if (w) {
          const [x, y] = pos(w.d)
          if (hold % 8 < 4) ring(px, W, H, x, y, 3, 0xffe040)
          for (let i = 0; i < 6; i++) dot(px, W, H, (i * 7 + hold * (i + 1)) % W, (hold * 2 + i * 13) % H, hsv(i / 6, 0.8, 1))
        }
      }
    },
  }
}

// --- ball splits on every bounce --------------------------------------------------

const split: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.52
  const R = Math.max(5, Math.min(W / 2 - 1, H / 2 - 5))
  const cap = 260
  let balls: (Ball & { h: number })[] = []
  let hold = 0
  let bits: Spark[] = []

  function reset() {
    balls = [{ x: cx, y: cy - R * 0.5, vx: (rng() - 0.5) * 0.8, vy: 0, r: 1, c: 0, h: rng() }]
  }
  reset()

  return {
    step() {
      bits = sparks(bits, 0.02)
      if (hold > 0) {
        hold--
        if (hold === 20) {
          for (const b of balls) if (rng() < 0.3) burst(bits, rng, b.x, b.y, hsv(b.h, 0.7, 1), 1, 1.5)
          balls = []
        }
        if (hold === 0) reset()
        return
      }
      const born: (Ball & { h: number })[] = []
      for (const b of balls) {
        b.vy += 0.04
        b.x += b.vx
        b.y += b.vy
        if (wallCircle(b, cx, cy, R)) {
          keepSpeed(b, 1, 2)
          if (balls.length + born.length < cap) born.push({ ...b, vx: b.vx * 0.8 + (rng() - 0.5), vy: b.vy * 0.8 + (rng() - 0.5), h: b.h + 0.05 })
        }
      }
      balls.push(...born)
      if (balls.length >= cap) hold = 50
    },
    draw(px) {
      sky(px, W, H, 0x08080e, 0x141428)
      ring(px, W, H, cx, cy, R + 1, 0x5a5a8a)
      for (const b of balls) {
        const c = hsv(b.h, 0.7, 1)
        if (balls.length < 8) disc(px, W, H, b.x, b.y, 1, c)
        else dot(px, W, H, b.x, b.y, c)
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      if (hold > 20 && hold % 6 < 3) ring(px, W, H, cx, cy, R + 1, 0xffffff)
      text(px, W, H, 1, 1, String(balls.length), 0xffffff)
    },
  }
}

// --- string-art bounce ------------------------------------------------------------

const stringart: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const R = Math.max(5, Math.min(W / 2 - 1, H / 2 - 5))
  let b: Ball = { x: cx, y: cy, vx: 0, vy: 0, r: 1, c: 0xffffff }
  let pins: { x: number; y: number; c: number }[] = []
  let hue = 0
  let hold = 0

  function reset() {
    hue = rng()
    pins = []
    const a = rng() * Math.PI * 2
    b = { x: cx, y: cy, vx: Math.cos(a) * 1.1, vy: Math.sin(a) * 1.1, r: 1, c: 0xffffff }
  }
  reset()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (let s = 0; s < 2; s++) {
        b.vy += 0.008
        b.x += b.vx / 2
        b.y += b.vy / 2
        if (wallCircle(b, cx, cy, R)) {
          keepSpeed(b, 1.1, 1.3)
          const a = Math.atan2(b.y - cy, b.x - cx)
          pins.push({ x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, c: hsv(hue + pins.length * 0.025, 0.7, 1) })
          if (pins.length >= 36) hold = 70
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x0a0614, 0x160a24)
      ring(px, W, H, cx, cy, R + 1, 0x4a3a6a)
      for (const p of pins) line(px, W, H, p.x, p.y, b.x, b.y, mix(0x0a0614, p.c, 0.6))
      for (const p of pins) dot(px, W, H, p.x, p.y, p.c)
      disc(px, W, H, b.x, b.y, 1, 0xffffff)
      text(px, W, H, 1, 1, String(pins.length), 0xffffff)
    },
  }
}

// --- which colour wins? -----------------------------------------------------------

const whichwins: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.55
  const R = Math.max(5, Math.min(W / 2 - 1, H / 2 - 7))
  const pts: [number, number][] = Array.from({ length: 6 }, (_, i) => [cx + Math.cos((i / 6) * Math.PI * 2 + Math.PI / 6) * R, cy + Math.sin((i / 6) * Math.PI * 2 + Math.PI / 6) * R])
  const inside = new Uint8Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      let ok = true
      for (let i = 0; i < 6; i++) {
        const [x0, y0] = pts[i] as [number, number]
        const [x1, y1] = pts[(i + 1) % 6] as [number, number]
        if ((x1 - x0) * (y - y0) - (y1 - y0) * (x - x0) < 0) ok = false
      }
      inside[y * W + x] = ok ? 1 : 0
    }
  const COLS = [0xff4060, 0x40a0ff, 0xffd040, 0x40e080]
  const paint = new Int8Array(W * H)
  let balls: Ball[] = []
  let t = 0
  let shares = [0, 0, 0, 0]
  let winner = -1
  const span = 420

  function reset() {
    paint.fill(-1)
    balls = COLS.map((c, i) => {
      const a = (i / 4) * Math.PI * 2 + rng()
      return { x: cx + Math.cos(a) * R * 0.4, y: cy + Math.sin(a) * R * 0.4, vx: Math.cos(a + 1) * 1.1, vy: Math.sin(a + 1) * 1.1, r: 1.6, c }
    })
    t = 0
    winner = -1
  }
  reset()

  return {
    step() {
      t++
      if (winner >= 0) {
        if (t > span + 70) reset()
        return
      }
      for (let s = 0; s < 2; s++) {
        for (const b of balls) {
          b.x += b.vx / 2
          b.y += b.vy / 2
          for (let i = 0; i < 6; i++) {
            const [x0, y0] = pts[i] as [number, number]
            const [x1, y1] = pts[(i + 1) % 6] as [number, number]
            hitSeg(b, x0, y0, x1, y1)
          }
        }
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) collide(balls[i] as Ball, balls[j] as Ball)
      }
      balls.forEach((b, k) => {
        keepSpeed(b, 1, 1.4)
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++) {
            const x = Math.round(b.x + dx)
            const y = Math.round(b.y + dy)
            if (dx * dx + dy * dy <= 5 && x >= 0 && y >= 0 && x < W && y < H && inside[y * W + x]) paint[y * W + x] = k
          }
      })
      if (t % 10 === 0) {
        shares = [0, 0, 0, 0]
        for (let i = 0; i < W * H; i++) if (paint[i]! >= 0) shares[paint[i]!]!++
      }
      if (t >= span) winner = shares.indexOf(Math.max(...shares))
    },
    draw(px) {
      sky(px, W, H, 0x101018, 0x1a1a28)
      for (let i = 0; i < W * H; i++) {
        if (!inside[i]) continue
        const p = paint[i]!
        let c = p >= 0 ? scale(COLS[p] as number, 0.6) : 0x2a2a3a
        if (winner >= 0 && t > span + 10) {
          const y = Math.floor(i / W)
          if (H - y < (t - span - 10) * 1.5) c = COLS[winner] as number
        }
        px[i] = c
      }
      for (let i = 0; i < 6; i++) {
        const [x0, y0] = pts[i] as [number, number]
        const [x1, y1] = pts[(i + 1) % 6] as [number, number]
        line(px, W, H, x0, y0, x1, y1, 0xd0d0e0)
      }
      for (const b of balls) {
        shiny(px, W, H, b)
        ring(px, W, H, b.x, b.y, b.r + 0.6, 0xffffff)
      }
      const total = shares.reduce((s, v) => s + v, 0) || 1
      let x = 0
      shares.forEach((v, k) => {
        const w = k === 3 ? W - x : Math.round((v / total) * W)
        rect(px, W, H, x, 0, w, 2, COLS[k] as number)
        x += w
      })
      const left = Math.max(0, Math.ceil((span - t) / 15))
      text(px, W, H, 1, 4, String(left), 0xffffff)
    },
  }
}

// --- ball in a spinning hexagon ---------------------------------------------------

const hexagon: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.52
  const R = Math.max(5, Math.min(W / 2 - 1, H / 2 - 5))
  let ang = 0
  let t = 0
  const balls: Ball[] = [0xff5a5a, 0x5ad0ff, 0xffd84a].map((c, i) => ({ x: cx + (i - 1) * 3, y: cy - R * 0.3, vx: (rng() - 0.5) * 1.2, vy: 0, r: 1.5, c }))
  const trails: [number, number][][] = balls.map(() => [])

  return {
    step() {
      t++
      const w = 0.04 * Math.sin(t * 0.006) + 0.025 * Math.sign(Math.sin(t * 0.006) || 1)
      for (let s = 0; s < 3; s++) {
        ang += w / 3
        for (const b of balls) {
          b.vy += 0.05 / 3
          b.x += b.vx / 3
          b.y += b.vy / 3
          for (let i = 0; i < 6; i++) {
            const a0 = ang + (i / 6) * Math.PI * 2
            const a1 = ang + ((i + 1) / 6) * Math.PI * 2
            const x0 = cx + Math.cos(a0) * R
            const y0 = cy + Math.sin(a0) * R
            const x1 = cx + Math.cos(a1) * R
            const y1 = cy + Math.sin(a1) * R
            hitSeg(b, x0, y0, x1, y1, 0.85, 0.95, -(b.y - cy) * w, (b.x - cx) * w)
          }
        }
        for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i] as Ball, balls[j] as Ball, 0.9)
        for (const b of balls) if (Math.hypot(b.x - cx, b.y - cy) > R) {
          b.x = cx
          b.y = cy
        }
      }
      balls.forEach((b, i) => {
        const tr = trails[i] as [number, number][]
        tr.push([b.x, b.y])
        if (tr.length > 10) tr.shift()
      })
    },
    draw(px) {
      sky(px, W, H, 0x06101a, 0x0e1e30)
      for (let i = 0; i < 6; i++) {
        const a0 = ang + (i / 6) * Math.PI * 2
        const a1 = ang + ((i + 1) / 6) * Math.PI * 2
        line(px, W, H, cx + Math.cos(a0) * (R + 1), cy + Math.sin(a0) * (R + 1), cx + Math.cos(a1) * (R + 1), cy + Math.sin(a1) * (R + 1), 0x1a5a7a)
        line(px, W, H, cx + Math.cos(a0) * R, cy + Math.sin(a0) * R, cx + Math.cos(a1) * R, cy + Math.sin(a1) * R, 0x5ae0ff)
      }
      balls.forEach((b, i) => {
        const tr = trails[i] as [number, number][]
        tr.forEach(([x, y], k) => dot(px, W, H, x, y, mix(0x0e1e30, b.c, (k / tr.length) * 0.6)))
      })
      for (const b of balls) shiny(px, W, H, b)
    },
  }
}

// --- marble funnel ----------------------------------------------------------------

const funnel: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.48
  const R = Math.max(5, Math.min(W / 2 - 1, H / 2 - 6))
  const sq = 0.8
  type M = { r: number; a: number; c: number; trail: [number, number][] }
  let ms: M[] = []
  let timer = 0
  let ripples: { l: number; c: number }[] = []
  let count = 0
  const bg = new Uint32Array(W * H)
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const d = Math.hypot(x - cx, (y - cy) / sq)
      let c = mix(0x1a2a44, 0x3a4a6a, y / H)
      if (d < R + 1.5) {
        const k = d / R
        c = mix(0x060a14, 0xb8c8e0, Math.pow(Math.min(1, k), 0.7))
        if (Math.floor(d) % 3 === 0 && d > 3) c = scale(c, 0.88)
        if (d > R) c = 0xe0e8f4
      }
      bg[y * W + x] = c
    }

  return {
    step() {
      ripples = ripples.filter(r => ++r.l < 12)
      if (--timer <= 0 && ms.length < 4) {
        ms.push({ r: R - 1, a: rng() * Math.PI * 2, c: hsv(rng(), 0.75, 1), trail: [] })
        timer = 40 + irand(rng, 40)
      }
      for (const m of ms) {
        const w = 0.9 / Math.pow(m.r, 0.85)
        m.a += w
        m.r -= 0.012 * (R / m.r) + 0.004
        m.trail.push([cx + Math.cos(m.a) * m.r, cy + Math.sin(m.a) * m.r * sq])
        if (m.trail.length > 6) m.trail.shift()
      }
      for (const m of ms) if (m.r < 1.5) {
        ripples.push({ l: 0, c: m.c })
        count++
      }
      ms = ms.filter(m => m.r >= 1.5)
    },
    draw(px) {
      px.set(bg)
      for (const r of ripples) ring(px, W, H, cx, cy, 1 + r.l * 0.4, mix(r.c, 0x060a14, r.l / 12))
      for (const m of ms) {
        m.trail.forEach(([x, y], i) => dot(px, W, H, x, y, mix(0x3a4a6a, m.c, (i / m.trail.length) * 0.5)))
        const x = cx + Math.cos(m.a) * m.r
        const y = cy + Math.sin(m.a) * m.r * sq
        dot(px, W, H, x + 1, y + 1, 0x101820)
        shiny(px, W, H, { x, y, vx: 0, vy: 0, r: m.r > 6 ? 1.3 : 1, c: m.c })
      }
      text(px, W, H, 1, 1, String(count), 0xffffff)
    },
  }
}

// --- balls vs saw blades ----------------------------------------------------------

const saws: Maker = (W, H, rng) => {
  const top = 7
  const bottom = H - 3
  let balls: Ball[] = []
  let bits: Spark[] = []
  let t = 0
  let hold = 0
  let saw: { x: number; y: number; r: number; a: number; s: number; ph: number }[] = []

  function reset() {
    const n = W >= 24 ? 10 : 5
    balls = Array.from({ length: n }, (_, i) => ({ x: 3 + rng() * (W - 6), y: top + 2 + rng() * 10, vx: (rng() - 0.5) * 1.2, vy: 0, r: 1.3, c: hsv(i / n, 0.75, 1) }))
    saw = [0.38, 0.6, 0.8].map((f, i) => ({ x: W / 2, y: top + (bottom - top) * f, r: Math.max(2, W / 11), a: 0, s: (0.012 + rng() * 0.01) * (i % 2 ? -1 : 1), ph: rng() * 6 }))
  }
  reset()

  return {
    step() {
      t++
      bits = sparks(bits)
      for (const s of saw) {
        s.a += 0.4
        s.x = W / 2 + Math.sin(t * Math.abs(s.s) + s.ph) * (W / 2 - s.r - 1)
      }
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (const b of balls) {
        b.vy += 0.06
        b.x += b.vx
        b.y += b.vy
        if (b.x < 1 + b.r || b.x > W - 2 - b.r) {
          b.vx = -b.vx
          b.x = clamp(b.x, 1 + b.r, W - 2 - b.r)
        }
        if (b.y > bottom - b.r) {
          b.y = bottom - b.r
          b.vy = -2.6 - rng() * 0.3
        }
        if (b.y < top + b.r) {
          b.y = top + b.r
          b.vy = Math.abs(b.vy)
        }
      }
      for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i] as Ball, balls[j] as Ball)
      balls = balls.filter(b => {
        const hit = saw.some(s => Math.hypot(b.x - s.x, b.y - s.y) < s.r + b.r - 0.3)
        if (hit) burst(bits, rng, b.x, b.y, b.c, 12)
        return !hit
      })
      if (balls.length <= 1) hold = 80
    },
    draw(px) {
      sky(px, W, H, 0x1a1420, 0x2a1e30)
      rect(px, W, H, 0, top - 1, W, 1, 0x6a5a7a)
      rect(px, W, H, 0, bottom, W, 1, 0x6a5a7a)
      for (const s of saw) {
        disc(px, W, H, s.x, s.y, s.r, 0x9aa2ae)
        disc(px, W, H, s.x, s.y, s.r * 0.35, 0x4a4e58)
        for (let k = 0; k < 8; k++) {
          const a = s.a + (k / 8) * Math.PI * 2
          dot(px, W, H, s.x + Math.cos(a) * (s.r + 1), s.y + Math.sin(a) * (s.r + 1), 0xe0e6ee)
        }
      }
      for (const b of balls) shiny(px, W, H, b)
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 0, String(balls.length), 0xffffff)
      if (hold > 0 && balls[0] && hold % 8 < 4) ring(px, W, H, balls[0].x, balls[0].y, 3, 0xffe040)
    },
  }
}

// --- bounce flashes ---------------------------------------------------------------

const flashes: Maker = (W, H, rng) => {
  const x0 = 1
  const y0 = 4
  const x1 = W - 2
  const y1 = H - 3
  const seg = 4
  const per = [Math.ceil((x1 - x0) / seg), Math.ceil((y1 - y0) / seg)]
  const glow = new Float32Array((per[0]! + per[1]!) * 2)
  const balls: Ball[] = [0, 1, 2].map(i => {
    const a = rng() * Math.PI * 2
    const s = 0.7 + i * 0.25
    return { x: W / 2, y: H / 2, vx: Math.cos(a) * s, vy: Math.sin(a) * s, r: 1, c: hsv(i / 3 + 0.1, 0.6, 1) }
  })
  let rings2: { x: number; y: number; l: number; c: number }[] = []
  const segColour = (i: number) => hsv(i / glow.length, 0.8, 1)

  return {
    step() {
      for (let i = 0; i < glow.length; i++) glow[i] = Math.max(0, glow[i]! - 0.06)
      rings2 = rings2.filter(r => ++r.l < 10)
      for (const b of balls) {
        b.x += b.vx
        b.y += b.vy
        let k = -1
        if (b.x < x0 + 1) {
          b.x = x0 + 1
          b.vx = Math.abs(b.vx)
          k = per[0]! * 2 + per[1]! + Math.floor((b.y - y0) / seg)
        } else if (b.x > x1 - 1) {
          b.x = x1 - 1
          b.vx = -Math.abs(b.vx)
          k = per[0]! * 2 + Math.floor((b.y - y0) / seg)
        } else if (b.y < y0 + 1) {
          b.y = y0 + 1
          b.vy = Math.abs(b.vy)
          k = Math.floor((b.x - x0) / seg)
        } else if (b.y > y1 - 1) {
          b.y = y1 - 1
          b.vy = -Math.abs(b.vy)
          k = per[0]! + Math.floor((b.x - x0) / seg)
        }
        if (k >= 0) {
          glow[clamp(k, 0, glow.length - 1)] = 1
          rings2.push({ x: b.x, y: b.y, l: 0, c: segColour(k) })
          const s = Math.hypot(b.vx, b.vy)
          const a = Math.atan2(b.vy, b.vx) + (rng() - 0.5) * 0.3
          b.vx = Math.cos(a) * s
          b.vy = Math.sin(a) * s
        }
      }
    },
    draw(px) {
      const beat = Math.max(...glow)
      sky(px, W, H, mix(0x08060e, 0x281a3a, beat * 0.5), 0x08060e)
      for (let i = 0; i < per[0]!; i++) {
        const g = glow[i]!
        const c = mix(0x2a2a3a, segColour(i), 0.25 + g * 0.75)
        rect(px, W, H, x0 + i * seg, y0 - 1, seg - 1, 1, c)
        const g2 = glow[per[0]! + i]!
        rect(px, W, H, x0 + i * seg, y1, seg - 1, 1, mix(0x2a2a3a, segColour(per[0]! + i), 0.25 + g2 * 0.75))
      }
      for (let i = 0; i < per[1]!; i++) {
        const gr = glow[per[0]! * 2 + i]!
        rect(px, W, H, x1, y0 + i * seg, 1, seg - 1, mix(0x2a2a3a, segColour(per[0]! * 2 + i), 0.25 + gr * 0.75))
        const gl = glow[per[0]! * 2 + per[1]! + i]!
        rect(px, W, H, x0 - 1, y0 + i * seg, 1, seg - 1, mix(0x2a2a3a, segColour(per[0]! * 2 + per[1]! + i), 0.25 + gl * 0.75))
      }
      for (const r of rings2) ring(px, W, H, r.x, r.y, r.l * 0.6, mix(r.c, 0x08060e, r.l / 10))
      for (const b of balls) disc(px, W, H, b.x, b.y, 1, b.c)
    },
  }
}

// --- marble elevator machine ------------------------------------------------------

const elevator: Maker = (W, H) => {
  const lx = W - 4
  const top = 6
  const bottom = H - 6
  const left = 2
  const right = W - 8
  const ramps = Math.max(2, Math.floor((bottom - top) / 9))
  const gap = (bottom - top) / ramps
  const pts: [number, number, number][] = [[lx, bottom, 0.4]]
  pts.push([lx, top - 2, 1.2])
  pts.push([right + 1, top, 0.6])
  for (let i = 0; i < ramps; i++) {
    const y = top + i * gap
    const toLeft = i % 2 === 0
    pts.push([toLeft ? left : right, y + 3, 1.6])
    pts.push([toLeft ? left : right, y + gap, 0.6])
  }
  pts.push([lx, bottom, 0.4])
  const segs = pts.slice(0, -1).map((p, i) => {
    const q = pts[i + 1] as [number, number, number]
    return { x0: p[0], y0: p[1], x1: q[0], y1: q[1], len: Math.hypot(q[0] - p[0], q[1] - p[1]), v: p[2] }
  })
  const total = segs.reduce((s, g) => s + g.len, 0)
  const at = (d: number): [number, number, number] => {
    d = ((d % total) + total) % total
    for (const g of segs) {
      if (d <= g.len) return [g.x0 + ((g.x1 - g.x0) * d) / g.len, g.y0 + ((g.y1 - g.y0) * d) / g.len, g.v]
      d -= g.len
    }
    return [lx, bottom, 0.4]
  }
  const n = 9
  const ms = Array.from({ length: n }, (_, i) => ({ d: (i / n) * total, c: hsv(i / n, 0.75, 1) }))
  let belt = 0

  return {
    step() {
      belt += 0.4
      ms.sort((a, b) => a.d - b.d)
      for (let i = 0; i < n; i++) {
        const m = ms[i] as { d: number; c: number }
        const ahead = ms[(i + 1) % n] as { d: number; c: number }
        let gapTo = ahead.d - m.d
        if (gapTo <= 0) gapTo += total
        const [, , v] = at(m.d)
        if (gapTo > 3.2) m.d = (m.d + Math.min(v, gapTo - 3.2)) % total
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a3a4a, 0x3a2a3a)
      for (let y = 0; y < H; y += 6) rect(px, W, H, 0, y, W, 1, 0x34404e)
      rect(px, W, H, lx - 1, top - 4, 3, bottom - top + 8, 0x1a1e24)
      for (let y = top - 4; y < bottom + 4; y++) if ((y + Math.floor(belt)) % 5 === 0) rect(px, W, H, lx - 2, y, 4, 1, 0x8a8a92)
      for (const g of segs) if (g.v !== 0.4 && g.v !== 1.2 && g.v !== 1.6) line(px, W, H, g.x0, g.y0 + 1.5, g.x1, g.y1 + 1.5, 0xc89050)
      for (const m of ms) {
        const [x, y] = at(m.d)
        shiny(px, W, H, { x, y, vx: 0, vy: 0, r: 1.2, c: m.c })
      }
      rect(px, W, H, lx - 3, bottom + 2, 7, 2, 0x5a4a3a)
    },
  }
}

// --- gravity-flip maze ------------------------------------------------------------

const gravmaze: Maker = (W, H, rng) => {
  const cs = 4
  const GW = Math.max(3, Math.floor((W - 1) / cs))
  const GH = Math.max(3, Math.floor((H - 8) / cs))
  const ox = Math.floor((W - GW * cs - 1) / 2)
  const oy = 6
  let walls: Uint8Array = new Uint8Array(0)
  let ball = [0, 0]
  let exit = [0, 0]
  let plan: number[] = []
  let pi = 0
  let pos = [0, 0]
  let target = [0, 0]
  let dir = 2
  let hold = 0
  let solved = 0

  const wallAt = (x: number, y: number, d: number) => {
    const [dx, dy] = DIRS[d] as [number, number]
    const nx = x + dx
    const ny = y + dy
    if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) return true
    return (walls[y * GW + x]! & (1 << d)) !== 0
  }
  const roll = (x: number, y: number, d: number): [number, number, boolean] => {
    const [dx, dy] = DIRS[d] as [number, number]
    while (!wallAt(x, y, d)) {
      x += dx
      y += dy
      if (x === exit[0] && y === exit[1]) return [x, y, true]
    }
    return [x, y, false]
  }

  function build() {
    for (let tries = 0; tries < 50; tries++) {
      walls = new Uint8Array(GW * GH).fill(15)
      const seen = new Uint8Array(GW * GH)
      const stack = [[0, 0]]
      seen[0] = 1
      while (stack.length) {
        const [x, y] = stack[stack.length - 1] as [number, number]
        const opts = shuffle(rng, [0, 1, 2, 3]).filter(d => {
          const [dx, dy] = DIRS[d] as [number, number]
          const nx = x + dx
          const ny = y + dy
          return nx >= 0 && ny >= 0 && nx < GW && ny < GH && !seen[ny * GW + nx]
        })
        const d = opts[0]
        if (d === undefined) {
          stack.pop()
          continue
        }
        const [dx, dy] = DIRS[d] as [number, number]
        walls[y * GW + x]! &= ~(1 << d)
        walls[(y + dy) * GW + x + dx]! &= ~(1 << (d ^ 1))
        seen[(y + dy) * GW + x + dx] = 1
        stack.push([x + dx, y + dy])
      }
      for (let k = 0; k < GW * GH * 0.35; k++) {
        const x = irand(rng, GW)
        const y = irand(rng, GH)
        const d = irand(rng, 4)
        const [dx, dy] = DIRS[d] as [number, number]
        if (x + dx < 0 || y + dy < 0 || x + dx >= GW || y + dy >= GH) continue
        walls[y * GW + x]! &= ~(1 << d)
        walls[(y + dy) * GW + x + dx]! &= ~(1 << (d ^ 1))
      }
      exit = [irand(rng, GW), GH - 1 - irand(rng, Math.ceil(GH / 3))]
      ball = roll(irand(rng, GW), 0, 2).slice(0, 2) as number[]
      if (ball[0] === exit[0] && ball[1] === exit[1]) continue
      // breadth-first search over tilts
      const from = new Map<number, [number, number]>()
      const k0 = ball[1]! * GW + ball[0]!
      from.set(k0, [-1, -1])
      const q = [k0]
      let goal = -1
      for (let qi = 0; qi < q.length && goal < 0; qi++) {
        const k = q[qi] as number
        for (let d = 0; d < 4; d++) {
          const [x, y, won] = roll(k % GW, Math.floor(k / GW), d)
          const nk = y * GW + x
          if (from.has(nk)) continue
          from.set(nk, [k, d])
          if (won) {
            goal = nk
            break
          }
          q.push(nk)
        }
      }
      if (goal < 0) continue
      const moves: number[] = []
      for (let k = goal; k !== k0; ) {
        const [p, d] = from.get(k) as [number, number]
        moves.unshift(d)
        k = p
      }
      if (moves.length < 3) continue
      plan = moves
      pi = 0
      pos = [ball[0]!, ball[1]!]
      target = [...pos]
      return
    }
  }
  build()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      const dx = target[0]! - pos[0]!
      const dy = target[1]! - pos[1]!
      if (Math.abs(dx) + Math.abs(dy) > 0.01) {
        const s = 0.35
        pos[0]! += clamp(dx, -s, s)
        pos[1]! += clamp(dy, -s, s)
        return
      }
      if (pos[0] === exit[0] && pos[1] === exit[1]) {
        solved++
        hold = 40
        return
      }
      const d = plan[pi++]
      if (d === undefined) {
        hold = 20
        return
      }
      dir = d
      const [x, y] = roll(Math.round(pos[0]!), Math.round(pos[1]!), d)
      target = [x, y]
    },
    draw(px) {
      sky(px, W, H, 0x1a2238, 0x2a1a38)
      for (let y = 0; y < GH; y++)
        for (let x = 0; x < GW; x++) {
          const bx = ox + x * cs
          const by = oy + y * cs
          rect(px, W, H, bx + 1, by + 1, cs - 1, cs - 1, 0x2e3a5a)
          const w = walls[y * GW + x]!
          if (w & 8) rect(px, W, H, bx, by, cs + 1, 1, 0x9ad0ff)
          if (w & 4) rect(px, W, H, bx, by + cs, cs + 1, 1, 0x9ad0ff)
          if (w & 2) rect(px, W, H, bx, by, 1, cs + 1, 0x9ad0ff)
          if (w & 1) rect(px, W, H, bx + cs, by, 1, cs + 1, 0x9ad0ff)
        }
      disc(px, W, H, ox + exit[0]! * cs + 2, oy + exit[1]! * cs + 2, 1.2, 0x050508)
      ring(px, W, H, ox + exit[0]! * cs + 2, oy + exit[1]! * cs + 2, 1.6, hold > 0 && hold % 6 < 3 ? 0xffe040 : 0x5a6a8a)
      if (!(hold > 0 && pos[0] === exit[0] && pos[1] === exit[1] && hold < 30)) shiny(px, W, H, { x: ox + pos[0]! * cs + 2, y: oy + pos[1]! * cs + 2, vx: 0, vy: 0, r: 1.3, c: 0xff6a3a })
      const [ax, ay] = DIRS[dir] as [number, number]
      const ax0 = W - 5
      const ay0 = 2
      line(px, W, H, ax0 - ax * 2, ay0 - ay * 2, ax0 + ax * 2, ay0 + ay * 2, 0xffe040)
      dot(px, W, H, ax0 + ax * 2 + ay, ay0 + ay * 2 + ax, 0xffe040)
      dot(px, W, H, ax0 + ax * 2 - ay, ay0 + ay * 2 - ax, 0xffe040)
      text(px, W, H, 1, 0, String(solved), 0xffffff)
    },
  }
}

// --- 100 balls, one hole ----------------------------------------------------------

const hole: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const top = 5
  const sideY = Math.round(H * 0.5)
  const holeY = Math.round(H * 0.72)
  const half = 1.6
  const walls: [number, number, number, number][] = [
    [1, top, 1, sideY],
    [W - 2, top, W - 2, sideY],
    [1, sideY, cx - half, holeY],
    [W - 2, sideY, cx + half, holeY],
  ]
  let balls: Ball[] = []
  let queue = 0
  let out = 0
  let hold = 0
  let hue = rng()
  const N = 100
  const cell = 2
  const GW = Math.ceil(W / cell) + 1

  function reset() {
    balls = []
    queue = N
    out = 0
    hue = rng()
  }
  reset()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (let k = 0; k < 3 && queue > 0; k++) {
        balls.push({ x: 4 + rng() * (W - 8), y: top + 1, vx: (rng() - 0.5) * 0.3, vy: 0.3, r: 0.95, c: hsv(hue + rng() * 0.25, 0.7, 1) })
        queue--
      }
      for (const b of balls) {
        b.vy += 0.06
        b.vx *= 0.99
        b.x += b.vx
        b.y += b.vy
      }
      for (let it = 0; it < 2; it++) {
        const grid = new Map<number, Ball[]>()
        for (const b of balls) {
          const k = Math.floor(b.y / cell + 1) * GW + Math.floor(b.x / cell)
          const list = grid.get(k)
          if (list) list.push(b)
          else grid.set(k, [b])
        }
        for (const b of balls) {
          const gx = Math.floor(b.x / cell)
          const gy = Math.floor(b.y / cell + 1)
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              const list = grid.get((gy + dy) * GW + gx + dx)
              if (list) for (const o of list) if (o !== b && o.x + o.y > b.x + b.y) collide(b, o, 0.2)
            }
          for (const [x0, y0, x1, y1] of walls) hitSeg(b, x0, y0, x1, y1, 0.2, 0.9)
          if (b.y < top + b.r) b.y = top + b.r
        }
      }
      const before = balls.length
      balls = balls.filter(b => b.y < H + 2)
      out += before - balls.length
      if (queue === 0 && balls.length === 0) hold = 40
    },
    draw(px) {
      sky(px, W, H, 0x10182a, 0x1a1028)
      for (const [x0, y0, x1, y1] of walls) line(px, W, H, x0, y0, x1, y1, 0xc8d4e8)
      rect(px, W, H, 0, top - 1, W, 1, 0x5a6a8a)
      for (const b of balls) {
        rect(px, W, H, b.x - 0.5, b.y - 0.5, 2, 2, b.c)
        dot(px, W, H, b.x - 0.5, b.y - 0.5, mix(b.c, 0xffffff, 0.5))
      }
      const left = N - out
      text(px, W, H, 1, 0, String(left), 0xffffff)
    },
  }
}

// --- snooker break ----------------------------------------------------------------

const snooker: Maker = (W, H, rng) => {
  const x0 = 2
  const y0 = 3
  const x1 = W - 3
  const y1 = H - 3
  const pockets: [number, number][] = [
    [x0, y0],
    [x1, y0],
    [x0, (y0 + y1) / 2],
    [x1, (y0 + y1) / 2],
    [x0, y1],
    [x1, y1],
  ]
  const r = 1.1
  let balls: (Ball & { cue: boolean })[] = []
  let phase = 0
  let t = 0
  let aim = { a: 0, s: 0 }
  let shots = 0
  let potted = 0

  function rack() {
    balls = []
    const ax = (x0 + x1) / 2
    const ay = y0 + (y1 - y0) * 0.3
    for (let row = 0; row < 4; row++)
      for (let k = 0; k <= row; k++) balls.push({ x: ax + (k - row / 2) * 2.3, y: ay - row * 2, vx: 0, vy: 0, r, c: 0xd8202a, cue: false })
    balls.push({ x: ax + (rng() - 0.5) * 4, y: y0 + (y1 - y0) * 0.78, vx: 0, vy: 0, r, c: 0xf4f4f0, cue: true })
    phase = 0
    t = 0
    shots = 0
    potted = 0
  }
  rack()
  const cue = () => balls.find(b => b.cue) as Ball

  function choose() {
    const c = cue()
    const reds = balls.filter(b => !b.cue)
    if (shots === 0) {
      const apex = reds.reduce((p, b) => (b.y > p.y ? b : p))
      aim = { a: Math.atan2(apex.y - c.y, apex.x - c.x) + (rng() - 0.5) * 0.05, s: 3 }
      return
    }
    let best = { a: rng() * 6, s: 1.5, score: Infinity }
    for (const b of reds)
      for (const [px0, py0] of pockets) {
        const dx = px0 - b.x
        const dy = py0 - b.y
        const d = Math.hypot(dx, dy)
        const gx = b.x - (dx / d) * 2 * r
        const gy = b.y - (dy / d) * 2 * r
        const ax = gx - c.x
        const ay = gy - c.y
        const cut = Math.acos(clamp((ax * dx + ay * dy) / (Math.hypot(ax, ay) * d || 1), -1, 1))
        const score = cut * 3 + d * 0.02 + Math.hypot(ax, ay) * 0.02
        if (cut < 1.1 && score < best.score) best = { a: Math.atan2(ay, ax), s: 1.4 + Math.hypot(ax, ay) * 0.025 + d * 0.02, score }
      }
    aim = { a: best.a + (rng() - 0.5) * 0.06, s: best.s }
  }

  return {
    step() {
      t++
      if (phase === 0) {
        if (t === 1) choose()
        if (t > 30) {
          const c = cue()
          c.vx = Math.cos(aim.a) * aim.s
          c.vy = Math.sin(aim.a) * aim.s
          phase = 1
          t = 0
          shots++
        }
        return
      }
      if (phase === 2) {
        if (t > 50) rack()
        return
      }
      for (let s = 0; s < 4; s++) {
        for (const b of balls) {
          b.x += b.vx / 4
          b.y += b.vy / 4
          if (b.x < x0 + r + 0.5 || b.x > x1 - r - 0.5) {
            b.vx = -b.vx * 0.85
            b.x = clamp(b.x, x0 + r + 0.5, x1 - r - 0.5)
          }
          if (b.y < y0 + r + 0.5 || b.y > y1 - r - 0.5) {
            b.vy = -b.vy * 0.85
            b.y = clamp(b.y, y0 + r + 0.5, y1 - r - 0.5)
          }
        }
        for (let i = 0; i < balls.length; i++) for (let j = i + 1; j < balls.length; j++) collide(balls[i] as Ball, balls[j] as Ball, 0.95)
        balls = balls.filter(b => {
          const inPocket = pockets.some(([px0, py0]) => Math.hypot(b.x - px0, b.y - py0) < 2.7)
          if (!inPocket) return true
          if (b.cue) {
            b.x = (x0 + x1) / 2
            b.y = y0 + (y1 - y0) * 0.78
            b.vx = 0
            b.vy = 0
            return true
          }
          potted++
          return false
        })
      }
      for (const b of balls) {
        b.vx *= 0.985
        b.vy *= 0.985
        if (Math.hypot(b.vx, b.vy) < 0.02) {
          b.vx = 0
          b.vy = 0
        }
      }
      if (balls.every(b => b.vx === 0 && b.vy === 0)) {
        t = 0
        phase = balls.length <= 1 || shots >= 20 ? 2 : 0
      }
    },
    draw(px) {
      px.fill(0x5a3418)
      rect(px, W, H, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0x1e7a3a)
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if ((x * 3 + y * 5) % 11 === 0) dot(px, W, H, x, y, 0x1c7236)
      line(px, W, H, x0, y0 + (y1 - y0) * 0.72, x1, y0 + (y1 - y0) * 0.72, 0x3a9a5a)
      for (const [px0, py0] of pockets) disc(px, W, H, px0 + (px0 < W / 2 ? 0.5 : -0.5), py0, 1.8, 0x0a0a0a)
      for (const b of balls) shiny(px, W, H, b)
      if (phase === 0 && t > 1) {
        const c = cue()
        const pull = t < 20 ? (t / 20) * 3 : 3 - (t - 20) * 0.3
        const sx = c.x - Math.cos(aim.a) * (2 + pull)
        const sy = c.y - Math.sin(aim.a) * (2 + pull)
        line(px, W, H, sx, sy, sx - Math.cos(aim.a) * 14, sy - Math.sin(aim.a) * 14, 0xd8b070)
        for (let k = 3; k < 30; k += 3) dot(px, W, H, c.x + Math.cos(aim.a) * k, c.y + Math.sin(aim.a) * k, 0x6ac08a)
      }
      text(px, W, H, W - 1 - textWidth(String(potted)), 0, String(potted), 0xffffff)
    },
  }
}

// --- pinball ----------------------------------------------------------------------

const pinball: Maker = (W, H, rng) => {
  const fy = H - 9
  const fl = Math.max(4, W * 0.24)
  const lp: [number, number] = [W * 0.24, fy]
  const rp: [number, number] = [W * 0.76 - 1, fy]
  const rest = 0.5
  const up = -0.45
  let la = rest
  let ra = rest
  let lw = 0
  let rw = 0
  let lt = 0
  let rt = 0
  let lc = 0
  let rc = 0
  const walls: [number, number, number, number][] = [
    [1, 6, 1, fy - 8],
    [W - 2, 6, W - 2, fy - 8],
    [1, fy - 8, lp[0], lp[1]],
    [W - 2, fy - 8, rp[0], rp[1]],
    [1, 6, 5, 2],
    [W - 2, 6, W - 6, 2],
    [5, 2, W - 6, 2],
  ]
  const bumpers = [
    { x: W * 0.3, y: H * 0.25, r: 2.2, f: 0 },
    { x: W * 0.7, y: H * 0.25, r: 2.2, f: 0 },
    { x: W * 0.5, y: H * 0.38, r: 2.2, f: 0 },
  ]
  const slings = [
    { x0: W * 0.18, y0: H * 0.55, x1: W * 0.32, y1: H * 0.62, f: 0 },
    { x0: W * 0.82, y0: H * 0.55, x1: W * 0.68, y1: H * 0.62, f: 0 },
  ]
  let b: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: 1.1, c: 0xe8eef4 }
  let score = 0
  let lives = 3
  let wait = 0

  function launch() {
    b = { x: W * 0.5 + (rng() - 0.5) * W * 0.4, y: 5, vx: (rng() - 0.5) * 1.2, vy: 0.3, r: 1.1, c: 0xe8eef4 }
  }
  launch()
  const tip = (p: [number, number], a: number, side: number): [number, number] => [p[0] + Math.cos(a) * fl * side, p[1] + Math.sin(a) * fl]

  return {
    step() {
      for (const q of bumpers) if (q.f > 0) q.f--
      for (const q of slings) if (q.f > 0) q.f--
      if (wait > 0) {
        if (--wait === 0) {
          if (lives === 0) {
            lives = 3
            score = 0
          }
          launch()
        }
        return
      }
      // the bot flicks a flipper when the ball comes down onto it, never holds it
      const near = b.y > fy - 7 && b.y < fy + 2 && b.vy > 0
      if (lt > 0) lt--
      else if (lc > 0) lc--
      else if (near && b.x < W / 2 + 1 && rng() < 0.8) {
        lt = 7
        lc = 10
      }
      if (rt > 0) rt--
      else if (rc > 0) rc--
      else if (near && b.x > W / 2 - 1 && rng() < 0.8) {
        rt = 7
        rc = 10
      }
      const nl = lt > 0 ? Math.max(up, la - 0.25) : Math.min(rest, la + 0.1)
      const nr = rt > 0 ? Math.max(up, ra - 0.25) : Math.min(rest, ra + 0.1)
      lw = nl - la
      rw = nr - ra
      la = nl
      ra = nr
      for (let s = 0; s < 4; s++) {
        b.vy += 0.045 / 4
        b.x += b.vx / 4
        b.y += b.vy / 4
        for (const [x0, y0, x1, y1] of walls) hitSeg(b, x0, y0, x1, y1, 0.5)
        for (const q of bumpers) {
          const d = Math.hypot(b.x - q.x, b.y - q.y)
          if (d < q.r + b.r) {
            const nx = (b.x - q.x) / d
            const ny = (b.y - q.y) / d
            b.x = q.x + nx * (q.r + b.r)
            b.y = q.y + ny * (q.r + b.r)
            b.vx = nx * 1.6
            b.vy = ny * 1.6
            q.f = 6
            score += 100
          }
        }
        for (const q of slings)
          if (hitSeg(b, q.x0, q.y0, q.x1, q.y1, 1.4)) {
            q.f = 5
            score += 10
          }
        const [ltx, lty] = tip(lp, la, 1)
        const [rtx, rty] = tip(rp, ra, -1)
        hitSeg(b, lp[0], lp[1], ltx, lty, 0.4, 1, -(b.y - lp[1]) * lw * 1.6, (b.x - lp[0]) * lw * 1.6)
        hitSeg(b, rp[0], rp[1], rtx, rty, 0.4, 1, (b.y - rp[1]) * rw * 1.6, -(b.x - rp[0]) * rw * 1.6)
      }
      keepSpeed(b, 0, 3)
      if (b.y > H + 2) {
        lives--
        wait = 30
      }
    },
    draw(px) {
      sky(px, W, H, 0x1a0a3a, 0x3a0a4a)
      for (let y = 4; y < fy; y += 5) for (let x = 3; x < W - 3; x += 5) dot(px, W, H, x, y, 0x4a2a6a)
      for (const [x0, y0, x1, y1] of walls) line(px, W, H, x0, y0, x1, y1, 0x7ae0ff)
      for (const q of bumpers) {
        disc(px, W, H, q.x, q.y, q.r, q.f > 0 ? 0xffffff : 0xff3a8a)
        disc(px, W, H, q.x, q.y, q.r * 0.5, q.f > 0 ? 0xff3a8a : 0xffd0e0)
      }
      for (const q of slings) line(px, W, H, q.x0, q.y0, q.x1, q.y1, q.f > 0 ? 0xffffff : 0xffd040)
      const [ltx, lty] = tip(lp, la, 1)
      const [rtx, rty] = tip(rp, ra, -1)
      line(px, W, H, lp[0], lp[1], ltx, lty, 0xff8a2a)
      line(px, W, H, lp[0], lp[1] + 1, ltx, lty + 1, 0xc05a10)
      line(px, W, H, rp[0], rp[1], rtx, rty, 0xff8a2a)
      line(px, W, H, rp[0], rp[1] + 1, rtx, rty + 1, 0xc05a10)
      if (wait === 0) shiny(px, W, H, b)
      const s = String(score)
      text(px, W, H, W / 2 - textWidth(s) / 2, 4, s, 0xffe040)
      for (let i = 0; i < lives; i++) dot(px, W, H, W - 3 - i * 2, H - 3, 0xe8eef4)
    },
  }
}

// --- peg breaker ------------------------------------------------------------------

const pegs: Maker = (W, H, rng) => {
  type Peg = { x: number; y: number; orange: boolean; lit: boolean; gone: boolean }
  let list: Peg[] = []
  let b: Ball | undefined
  let aim = 0
  let target = 0
  let phase = 0
  let t = 0
  let left = 10
  let bucket = W / 2
  let bdir = 0.4
  let fever = 0
  let slow = 0
  let bits: Spark[] = []

  function board() {
    list = []
    const rows = Math.max(3, Math.floor((H - 22) / 6))
    for (let j = 0; j < rows; j++) {
      const y = 12 + j * 6
      const n = Math.max(2, Math.floor((W - 4) / 5))
      for (let i = 0; i < n; i++) {
        const x = 3 + i * 5 + (j % 2 ? 2.5 : 0) + Math.sin(j + i * 0.5) * 0.6
        if (x > W - 3) continue
        list.push({ x, y: y + Math.sin(i * 0.8 + j) * 1.2, orange: false, lit: false, gone: false })
      }
    }
    for (const p of shuffle(rng, list.slice()).slice(0, 8)) p.orange = true
    left = 10
    fever = 0
  }
  board()

  return {
    step() {
      t++
      bits = sparks(bits)
      bucket += bdir
      if (bucket < 4 || bucket > W - 5) bdir = -bdir
      if (fever > 0) {
        if (--fever === 0) board()
        return
      }
      if (phase === 0) {
        if (t === 1) {
          const o = list.filter(p => p.orange && !p.gone)
          const p = o[irand(rng, o.length)]
          target = p ? Math.atan2(p.y - 3, p.x - W / 2) + (rng() - 0.5) * 0.25 : Math.PI / 2
        }
        aim += (target - aim) * 0.15
        if (t > 25) {
          b = { x: W / 2, y: 4, vx: Math.cos(aim) * 1.3, vy: Math.sin(aim) * 1.3, r: 1, c: 0xe8eef4 }
          phase = 1
          t = 0
        }
      } else if (phase === 1 && b) {
        for (let s = 0; s < 3; s++) {
          b.vy += 0.04 / 3
          b.x += b.vx / 3
          b.y += b.vy / 3
          if (b.x < 1 || b.x > W - 2) {
            b.vx = -b.vx
            b.x = clamp(b.x, 1, W - 2)
          }
          for (const p of list) {
            if (p.gone) continue
            const d = Math.hypot(b.x - p.x, b.y - p.y)
            if (d < 2) {
              const nx = (b.x - p.x) / d
              const ny = (b.y - p.y) / d
              const vn = b.vx * nx + b.vy * ny
              if (vn < 0) {
                b.vx -= 1.75 * vn * nx
                b.vy -= 1.75 * vn * ny
                b.vx += (rng() - 0.5) * 0.1
              }
              b.x = p.x + nx * 2
              b.y = p.y + ny * 2
              p.lit = true
            }
          }
        }
        // a ball stuck on pegs clears the lit ones around it, as in the real game
        slow = Math.hypot(b.vx, b.vy) < 0.25 ? slow + 1 : 0
        if (slow > 25) {
          for (const p of list)
            if (p.lit && !p.gone && Math.hypot(b.x - p.x, b.y - p.y) < 4) {
              p.gone = true
              burst(bits, rng, p.x, p.y, p.orange ? 0xff8a2a : 0x3a8aff, 4, 0.6)
            }
          slow = 0
        }
        if (b.y > H - 4 && Math.abs(b.x - bucket) < 3) {
          left++
          b.y = H + 5
        }
        if (b.y > H + 1) {
          b = undefined
          phase = 2
          t = 0
          left--
        }
      } else if (phase === 2) {
        if (t % 3 === 0) {
          const p = list.find(q => q.lit && !q.gone)
          if (p) {
            p.gone = true
            burst(bits, rng, p.x, p.y, p.orange ? 0xff8a2a : 0x3a8aff, 4, 0.6)
          } else {
            if (!list.some(q => q.orange && !q.gone)) fever = 70
            else if (left <= 0) board()
            phase = 0
            t = 0
          }
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x0a1a3a, 0x1a3a5a)
      for (const p of list) {
        if (p.gone) continue
        const c = p.orange ? (p.lit ? 0xffe0a0 : 0xff7a1a) : p.lit ? 0xb0e0ff : 0x2a6aff
        disc(px, W, H, p.x, p.y, 1, c)
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      line(px, W, H, W / 2, 3, W / 2 + Math.cos(aim) * 4, 3 + Math.sin(aim) * 4, 0xd0d8e0)
      disc(px, W, H, W / 2, 2, 1.5, 0x8a96a8)
      rect(px, W, H, bucket - 3, H - 4, 7, 2, 0xd0b060)
      if (b) shiny(px, W, H, b)
      text(px, W, H, 1, 0, String(left), 0xffffff)
      if (fever > 0) for (let i = 0; i < 12; i++) dot(px, W, H, (i * 5 + fever * 3) % W, (i * 11 + fever * 2) % H, hsv(i / 12 + fever * 0.02, 0.8, 1))
    },
  }
}

// --- colour gates -----------------------------------------------------------------

const gates: Maker = (W, H, rng) => {
  const COLS = [0xff4a5a, 0x4ab0ff, 0xffd04a, 0x5ae07a]
  const n = W >= 24 ? 4 : 3
  const beltY = 10
  const tubeTop = beltY + 4
  const tubeBottom = H - 3
  const pitch = Math.floor((W - 6) / n)
  const tubeX = (k: number) => 5 + k * pitch + Math.floor(pitch / 2)
  const cap = Math.floor((tubeBottom - tubeTop) / 2.4)
  const tubes: number[][] = Array.from({ length: n }, () => [])
  let balls: { x: number; y: number; c: number; drop: number; vy: number }[] = []
  let timer = 0
  let belt = 0
  const flap = new Float32Array(n)
  let drain = 0

  return {
    step() {
      belt += 0.5
      for (let k = 0; k < n; k++) flap[k] = Math.max(0, flap[k]! - 0.1)
      if (drain > 0) {
        drain--
        if (drain % 3 === 0) for (const t of tubes) t.shift()
        if (drain === 0) for (const t of tubes) t.length = 0
      }
      if (--timer <= 0) {
        balls.push({ x: -1, y: beltY - 1.5, c: irand(rng, n), drop: -1, vy: 0 })
        timer = 9 + irand(rng, 6)
      }
      for (const b of balls) {
        if (b.drop < 0) {
          b.x += 0.5
          const k = b.c
          if (Math.abs(b.x - tubeX(k)) < 0.3) {
            b.drop = k
            flap[k] = 1
          }
        } else {
          b.vy += 0.12
          b.y += b.vy
          const t = tubes[b.drop] as number[]
          if (b.y >= tubeBottom - 1 - t.length * 2.4) {
            t.push(b.c)
            b.drop = -2
          }
        }
      }
      balls = balls.filter(b => b.drop !== -2 && b.x < W + 2)
      if (drain === 0 && tubes.some(t => t.length >= cap)) drain = 3 * cap + 1
    },
    draw(px) {
      sky(px, W, H, 0x22283a, 0x1a1e2a)
      rect(px, W, H, 0, beltY, W, 3, 0x3a3e48)
      for (let x = 0; x < W; x++) if ((x - Math.floor(belt)) % 4 === 0) dot(px, W, H, x, beltY + 1, 0x5a5e68)
      for (let k = 0; k < n; k++) {
        const x = tubeX(k)
        rect(px, W, H, x - 2, tubeTop, 1, tubeBottom - tubeTop + 1, 0x8a9aba)
        rect(px, W, H, x + 2, tubeTop, 1, tubeBottom - tubeTop + 1, 0x8a9aba)
        rect(px, W, H, x - 2, tubeBottom + 1, 5, 1, 0x8a9aba)
        const open = flap[k]!
        rect(px, W, H, x - 1, beltY + 2 + open * 2, 3, 1, COLS[k] as number)
        rect(px, W, H, x - 2, beltY - 4, 5, 1, COLS[k] as number)
        ;(tubes[k] as number[]).forEach((c, i) => disc(px, W, H, x, tubeBottom - 1 - i * 2.4, 1, COLS[c] as number))
      }
      for (const b of balls) shiny(px, W, H, { x: b.x, y: b.y, vx: 0, vy: 0, r: 1.2, c: COLS[b.c] as number })
    },
  }
}

// --- rolling ball sky track -------------------------------------------------------

const skytrack: Maker = (W, H, rng) => {
  const lanes = 5
  const yh = Math.round(H * 0.28)
  const cx = (W - 1) / 2
  const tw0 = W / 5.4
  const rows: number[][] = []
  let cam = 0
  let lane = 2
  let bx = 2
  let fall = 0
  let gen = 0
  let dist = 0
  const ballS = 0.78
  const Zn = 2

  function genRow() {
    const r = Array(lanes).fill(1)
    const k = gen++
    if (k > 6) {
      const mode = k % 9
      if (mode === 3 || mode === 6) {
        const safe = irand(rng, lanes)
        for (let i = 0; i < lanes; i++) if (Math.abs(i - safe) > 1) r[i] = 0
      } else if (mode === 8 && rng() < 0.7) r[irand(rng, lanes)] = 2
    }
    rows.push(r)
  }
  for (let i = 0; i < 40; i++) genRow()
  const cellAt = (z: number, l: number) => {
    const row = rows[Math.floor(z)]
    return row ? (row[l] ?? 0) : 1
  }

  return {
    step() {
      if (fall > 0) {
        if (--fall === 0) {
          rows.length = 0
          gen = 0
          cam = 0
          for (let i = 0; i < 40; i++) genRow()
          dist = 0
          lane = 2
          bx = 2
        }
        return
      }
      cam += 0.13
      dist += 0.13
      while (rows.length < Math.floor(cam) + 40) genRow()
      const zb = cam + Zn * (1 / ballS - 1)
      // plan: the lane that stays on tiles over the next rows
      let best = lane
      let bestScore = -1
      for (let l = 0; l < lanes; l++) {
        let ok = 0
        for (let k = 0; k < 4; k++) if (cellAt(zb + k * 0.8, l) === 1) ok++
        else break
        const s = ok * 10 - Math.abs(l - lane)
        if (s > bestScore) {
          bestScore = s
          best = l
        }
      }
      if (rng() < 0.002) best = clamp(best + (rng() < 0.5 ? -1 : 1), 0, lanes - 1)
      lane = best
      bx += clamp(lane - bx, -0.18, 0.18)
      if (cellAt(zb, Math.round(bx)) !== 1) fall = 30
    },
    draw(px) {
      sky(px, W, H, 0x0a0a2a, 0x5a2a6a, yh + 2)
      for (let y = yh + 2; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x5a2a6a, 0x9a4a6a, (y - yh) / (H - yh))
      for (let i = 0; i < 10; i++) dot(px, W, H, (i * 13) % W, (i * 7) % yh, 0xffffff)
      for (let y = yh + 1; y < H; y++) {
        const s = (y - yh) / (H - yh)
        const z = cam + Zn * (1 / s - 1)
        const row = Math.floor(z)
        const tw = tw0 * s
        for (let x = 0; x < W; x++) {
          const l = Math.floor((x - cx) / tw + lanes / 2)
          if (l < 0 || l >= lanes) continue
          const cell = cellAt(z, l)
          if (cell === 0) continue
          let c = (row + l) % 2 ? 0x3ad0e0 : 0x2aa0c0
          if (cell === 2) c = 0xff4a3a
          const fog = Math.min(1, (z - cam) / 30)
          px[y * W + x] = mix(c, 0x5a2a6a, fog * 0.8)
        }
      }
      const sy = yh + ballS * (H - yh) - 3 + (fall > 0 ? (30 - fall) * 0.6 : 0)
      const sx = cx + (bx - lanes / 2 + 0.5) * tw0 * ballS
      const r = fall > 0 ? Math.max(0.5, 2 - (30 - fall) * 0.06) : 2
      disc(px, W, H, sx, sy, r, 0xffffff)
      dot(px, W, H, sx - 0.7, sy - 0.7, 0xffe0f0)
      text(px, W, H, 1, 1, String(Math.floor(dist)), 0xffffff)
    },
  }
}

// --- will it make it? -------------------------------------------------------------

const willit: Maker = (W, H, rng) => {
  const ground = H - 6
  let b: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: 1.1, c: 0xff7a2a }
  let cup = { x: 0, y: 0 }
  let wall = { x: 0, h: 0 }
  let phase = 0
  let t = 0
  let freeze = 0
  let made = 0
  let tries = 0
  let result = 0
  const g = 0.06

  function setup() {
    cup = { x: W * (0.62 + rng() * 0.25), y: ground - 4 - irand(rng, 10) }
    wall = rng() < 0.6 ? { x: W * 0.42, h: 6 + irand(rng, Math.max(1, Math.floor(H * 0.3))) } : { x: 0, h: 0 }
    b = { x: 3, y: ground - 2, vx: 0, vy: 0, r: 1.1, c: 0xff7a2a }
    const T = 40 + irand(rng, 20)
    const tx = cup.x + 1.5
    const ty = cup.y - 1
    b.vx = (tx - b.x) / T
    b.vy = (ty - b.y - 0.5 * g * T * T) / T
    if (rng() < 0.4) b.vx *= 0.93 + rng() * 0.12
    phase = 0
    t = 0
    freeze = 0
    result = 0
  }
  setup()

  return {
    step() {
      t++
      if (phase === 1) {
        if (t > 50) setup()
        return
      }
      if (freeze > 0) {
        freeze--
        return
      }
      if (t < 15) return
      const prevY = b.y
      b.vy += g
      b.x += b.vx
      b.y += b.vy
      if (result === 0 && b.vy > 0 && b.x > cup.x - 6 && b.x < cup.x && freeze === 0 && t < 200) {
        freeze = 25
        result = -1
      }
      if (wall.h && Math.abs(b.x - wall.x) < 1.5 && b.y > ground - wall.h) {
        b.vx = -Math.abs(b.vx) * 0.5
        b.x = wall.x - 1.5
      }
      if (prevY <= cup.y && b.y > cup.y && b.x > cup.x && b.x < cup.x + 4) {
        made++
        tries++
        phase = 1
        t = 0
        result = 1
        b.y = cup.y + 1
        return
      }
      if (Math.abs(b.y - cup.y) < 1.5 && (Math.abs(b.x - cup.x) < 1 || Math.abs(b.x - cup.x - 4) < 1)) {
        b.vy = -Math.abs(b.vy) * 0.5
        b.vx = (b.x < cup.x + 2 ? -1 : 1) * 0.5
      }
      if (b.y > ground - b.r) {
        b.y = ground - b.r
        b.vy = -b.vy * 0.5
        b.vx *= 0.8
        if (Math.abs(b.vy) < 0.3) {
          tries++
          phase = 1
          t = 0
          result = 2
        }
      }
      if (b.x > W + 3 || b.x < -3) {
        tries++
        phase = 1
        t = 0
        result = 2
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ab8ff, 0xd8f0ff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x5aa04a)
      rect(px, W, H, 0, ground, W, 1, 0x7ac05a)
      if (wall.h) rect(px, W, H, wall.x - 1, ground - wall.h, 2, wall.h, 0xb85a3a)
      rect(px, W, H, cup.x + 1.5, cup.y + 3, 1, ground - cup.y - 3, 0x8a8a92)
      rect(px, W, H, cup.x, cup.y, 1, 3, 0xe8e8f0)
      rect(px, W, H, cup.x + 4, cup.y, 1, 3, 0xe8e8f0)
      rect(px, W, H, cup.x, cup.y + 3, 5, 1, 0xe8e8f0)
      rect(px, W, H, 1, ground - 3, 4, 3, 0x3a3a42)
      shiny(px, W, H, b)
      if (freeze > 0 && freeze % 8 < 5) text(px, W, H, W / 2 - 1, H * 0.3, '?', 0xffffff)
      if (phase === 1 && result === 1) for (let i = 0; i < 10; i++) dot(px, W, H, cup.x + 2 + Math.cos(i) * t * 0.3, cup.y - t * 0.2 + Math.sin(i * 3) * 2, hsv(i / 10, 0.8, 1))
      const s = `${made}/${tries}`
      text(px, W, H, 1, 1, s, 0x1a2a4a)
    },
  }
}

// --- speeding rainbow ball --------------------------------------------------------

const rainbow: Maker = (W, H, rng) => {
  const x0 = 2
  const y0 = 6
  const x1 = W - 3
  const y1 = H - 4
  let b: Ball = { x: 0, y: 0, vx: 0, vy: 0, r: 1, c: 0xffffff }
  let trail: [number, number, number][] = []
  let hue = 0
  let hits = 0
  let flash = 0

  function reset() {
    const a = 0.3 + rng() * 0.9
    b = { x: (x0 + x1) / 2, y: (y0 + y1) / 2, vx: Math.cos(a) * 0.5, vy: Math.sin(a) * 0.5, r: 1, c: 0xffffff }
    trail = []
    hits = 0
  }
  reset()

  return {
    step() {
      if (flash > 0) {
        if (--flash === 0) reset()
        return
      }
      const s = Math.hypot(b.vx, b.vy)
      const n = Math.max(1, Math.ceil(s))
      for (let k = 0; k < n; k++) {
        b.x += b.vx / n
        b.y += b.vy / n
        let hit = false
        if (b.x < x0 + 1 || b.x > x1 - 1) {
          b.vx = -b.vx
          b.x = clamp(b.x, x0 + 1, x1 - 1)
          hit = true
        }
        if (b.y < y0 + 1 || b.y > y1 - 1) {
          b.vy = -b.vy
          b.y = clamp(b.y, y0 + 1, y1 - 1)
          hit = true
        }
        if (hit) {
          b.vx *= 1.045
          b.vy *= 1.045
          hits++
        }
        hue += 0.004
        trail.push([b.x, b.y, hue])
      }
      if (trail.length > 160) trail.splice(0, trail.length - 160)
      if (s > 7) flash = 25
    },
    draw(px) {
      sky(px, W, H, 0x0a0a12, 0x12101e)
      rect(px, W, H, x0, y0, x1 - x0 + 1, 1, 0x5a5a7a)
      rect(px, W, H, x0, y1, x1 - x0 + 1, 1, 0x5a5a7a)
      rect(px, W, H, x0, y0, 1, y1 - y0 + 1, 0x5a5a7a)
      rect(px, W, H, x1, y0, 1, y1 - y0 + 1, 0x5a5a7a)
      for (let i = 1; i < trail.length; i++) {
        const [ax, ay] = trail[i - 1] as [number, number, number]
        const [bx2, by2, h] = trail[i] as [number, number, number]
        line(px, W, H, ax, ay, bx2, by2, hsv(h, 0.85, 0.3 + 0.7 * (i / trail.length)))
      }
      disc(px, W, H, b.x, b.y, 1, 0xffffff)
      if (flash > 0) for (let y = 0; y < H; y += 2) for (let x = (y / 2) % 2; x < W; x += 2) dot(px, W, H, x, y, hsv(x / W + flash * 0.05, 0.7, 1))
      text(px, W, H, 1, 0, String(hits), 0xffffff)
    },
  }
}

// --- marbles: a Galton board ----------------------------------------------

const billes: Maker = (W, H, rng) => {
  const cx = Math.floor(W / 2)
  const s = 4
  const gap = 3
  const top = Math.round(H * 0.14)
  let rows = Math.max(2, Math.floor((W - 4) / s))
  while (rows > 2 && top + (rows - 1) * gap > H * 0.58) rows--
  const binTop = top + (rows - 1) * gap + 4
  const floor = H - 2
  const binH = floor - binTop
  const bins = rows + 1
  const pegX = (r: number, k: number) => cx + (k - r / 2) * s
  const pegY = (r: number) => top + r * gap
  const binX = (b: number) => cx + (b - rows / 2) * s
  const heights: number[] = new Array(bins * 3).fill(0)
  const settled = new Uint32Array(W * H)
  const bg0 = hsv(0.7 + rng() * 0.15, 0.6, 0.12)
  const bg1 = hsv(0.75 + rng() * 0.15, 0.55, 0.28)
  let hue = rng()
  type Ball = { r: number; k: number; dir: number; t: number; x: number; y: number; vy: number; falling: boolean; c: number }
  let balls: Ball[] = []
  let frame = 0
  let drain = 0

  return {
    step() {
      frame++
      if (drain > 0) {
        drain--
        for (let y = floor; y > binTop; y--)
          for (let x = 0; x < W; x++) settled[y * W + x] = settled[(y - 1) * W + x] as number
        for (let x = 0; x < W; x++) settled[binTop * W + x] = 0
        if (drain === 0) {
          settled.fill(0)
          heights.fill(0)
        }
        return
      }
      if (frame % 2 === 0 && balls.length < 60) {
        hue += 0.004
        balls.push({ r: -1, k: 0, dir: 0, t: 0, x: cx, y: 0, vy: 0, falling: false, c: hsv(hue, 0.75, 1) })
      }
      for (const b of balls) {
        if (b.falling) {
          b.vy = Math.min(1.5, b.vy + 0.12)
          b.y += b.vy
          const bin = Math.max(0, Math.min(bins - 1, b.k))
          let col = 0
          for (let j = 1; j < 3; j++) if ((heights[bin * 3 + j] ?? 0) < (heights[bin * 3 + col] ?? 0)) col = j
          const h = heights[bin * 3 + col] ?? 0
          if (b.y >= floor - h) {
            const x = Math.round(binX(bin)) - 1 + col
            const y = floor - h
            if (y > binTop) {
              settled[y * W + x] = b.c
              heights[bin * 3 + col] = h + 1
            }
            if (h + 1 >= binH - 1) drain = binH + 2
            b.r = -99
          }
          continue
        }
        b.t += 0.2
        if (b.t >= 1) {
          b.t = 0
          if (b.r >= 0) b.k += b.dir
          b.r++
          b.dir = rng() < 0.5 ? 0 : 1
          if (b.r >= rows) {
            b.falling = true
            b.x = binX(b.k)
            b.y = pegY(rows - 1) + 1
            b.vy = 0.3
            continue
          }
        }
        if (b.r < 0) {
          b.x = cx
          b.y = (pegY(0) - 1) * b.t
        } else {
          const x0 = pegX(b.r, b.k)
          const x1 = b.r + 1 < rows ? pegX(b.r + 1, b.k + b.dir) : binX(b.k + b.dir)
          b.x = x0 + (x1 - x0) * b.t
          b.y = pegY(b.r) - 1 + gap * b.t - Math.sin(Math.PI * b.t) * 1.2
        }
      }
      balls = balls.filter(b => b.r !== -99)
    },
    draw(px) {
      sky(px, W, H, bg0, bg1)
      for (let i = 0; i < 4; i++) {
        dot(px, W, H, cx - 2 - i, top - 3 - i, 0x8890a0)
        dot(px, W, H, cx + 2 + i, top - 3 - i, 0x8890a0)
      }
      for (let r = 0; r < rows; r++) for (let k = 0; k <= r; k++) dot(px, W, H, pegX(r, k), pegY(r), 0xe6e6f0)
      for (let b = 0; b <= bins; b++) {
        const x = Math.round(binX(b) - s / 2)
        for (let y = binTop; y <= floor; y++) dot(px, W, H, x, y, 0x8890a0)
      }
      for (let x = 0; x < W; x++) if (drain === 0) dot(px, W, H, x, floor + 1, 0x8890a0)
      for (let i = 0; i < settled.length; i++) if (settled[i]) px[i] = settled[i] as number
      for (const b of balls) dot(px, W, H, b.x, b.y, b.c)
    },
  }
}

// --- double pendulum -------------------------------------------------------------

const pendule: Maker = (W, H, rng) => {
  const trail = new Uint32Array(W * H)
  const ox = W / 2
  const oy = H * 0.38
  const L1 = W * 0.22
  const L2 = W * 0.22
  const g = 0.6
  let a1 = Math.PI * (0.55 + rng() * 0.4)
  let a2 = Math.PI * (0.5 + rng() * 0.8)
  let w1 = 0
  let w2 = 0
  let hue = rng()
  let last: [number, number] | undefined

  const ends = () => {
    const x1 = ox + L1 * Math.sin(a1)
    const y1 = oy + L1 * Math.cos(a1)
    return [x1, y1, x1 + L2 * Math.sin(a2), y1 + L2 * Math.cos(a2)] as const
  }

  return {
    step() {
      for (let i = 0; i < trail.length; i++) if (trail[i]) trail[i] = scale(trail[i] as number, 0.985)
      const dt = 0.25
      for (let s = 0; s < 4; s++) {
        const d = a1 - a2
        const den = 3 - Math.cos(2 * d)
        const acc1 = (-3 * g * Math.sin(a1) - g * Math.sin(a1 - 2 * a2) - 2 * Math.sin(d) * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) / (L1 * den)
        const acc2 = (2 * Math.sin(d) * (w1 * w1 * L1 * 2 + g * 2 * Math.cos(a1) + w2 * w2 * L2 * Math.cos(d))) / (L2 * den)
        w1 += acc1 * dt
        w2 += acc2 * dt
        a1 += w1 * dt
        a2 += w2 * dt
      }
      hue += 0.003
      const [, , x2, y2] = ends()
      if (last) line(trail, W, H, last[0], last[1], x2, y2, hsv(hue, 0.85, 1))
      last = [x2, y2]
    },
    draw(px) {
      sky(px, W, H, 0x0a0a18, 0x14102a)
      for (let i = 0; i < px.length; i++) if (trail[i]) px[i] = add(px[i] as number, trail[i] as number)
      const [x1, y1, x2, y2] = ends()
      line(px, W, H, ox, oy, x1, y1, 0xd0d0e0)
      line(px, W, H, x1, y1, x2, y2, 0xd0d0e0)
      disc(px, W, H, ox, oy, 0.8, 0x808090)
      disc(px, W, H, x1, y1, 1.2, 0xffffff)
      disc(px, W, H, x2, y2, 1.5, hsv(hue, 0.6, 1))
    },
  }
}

export const PHYSICS = {
  billes,
  pendule,
  grow,
  rings,
  marblerace,
  split,
  stringart,
  whichwins,
  hexagon,
  funnel,
  saws,
  flashes,
  elevator,
  gravmaze,
  hole,
  snooker,
  pinball,
  pegs,
  gates,
  skytrack,
  willit,
  rainbow,
}
