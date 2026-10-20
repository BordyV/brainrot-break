import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, hash, irand, line, pick, poly, ring, shade, shuffle, sparks, textWidth, tint } from '../kit'
import type { Spark } from '../kit'

// Seasons, holidays & spooky: something moves first, the season comes second.

function stars(px: Uint32Array, W: number, H: number, n: number, t: number, seed: number, bottom = H * 0.6) {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(i, 1, seed) * W)
    const y = Math.floor(hash(i, 2, seed) * bottom)
    const tw = hash(i, Math.floor(t / 8), seed + 1) < 0.15
    dot(px, W, H, x, y, tw ? 0x8a8ab0 : 0xe8e8ff)
  }
}

function moon(px: Uint32Array, W: number, H: number, x: number, y: number, r: number) {
  disc(px, W, H, x, y, r + 1, 0x4a4a6a)
  disc(px, W, H, x, y, r, 0xf4ecc8)
  disc(px, W, H, x - r * 0.35, y + r * 0.2, Math.max(0.6, r * 0.22), 0xddd2a8)
  disc(px, W, H, x + r * 0.3, y - r * 0.35, Math.max(0.5, r * 0.15), 0xddd2a8)
}

/** text() at an integer scale. */
function bigText(px: Uint32Array, W: number, H: number, x: number, y: number, s: string, c: number, k: number) {
  const w = textWidth(s)
  const tmp = new Uint32Array(w * 5)
  text(tmp, w, 5, 0, 0, s, 1)
  for (let j = 0; j < 5; j++)
    for (let i = 0; i < w; i++) if (tmp[j * w + i]) rect(px, W, H, x + i * k, y + j * k, k, k, c)
}

// --- pumpkin patch ----------------------------------------------------------------

const pumpkins: Maker = (W, H, rng) => {
  const u = W / 32
  type P = { x: number; y: number; r: number; face: number; on: number }
  let patch: P[] = []
  let order: number[] = []
  let t = 0
  const plant = () => {
    patch = []
    const rows = [H * 0.62, H * 0.74, H * 0.88]
    rows.forEach((y, j) => {
      const n = j === 2 ? 2 : 3
      for (let i = 0; i < n; i++) {
        const x = ((i + 0.5 + (j % 2 ? 0.3 : 0)) / n) * W + (rng() - 0.5) * 2
        patch.push({ x, y, r: (3 + j * 1.2) * u + rng() * u, face: irand(rng, 3), on: -1 })
      }
    })
    order = shuffle(rng, patch.map((_, i) => i))
    t = 0
  }
  plant()

  return {
    step() {
      t++
      const k = Math.floor((t - 15) / 18)
      if (k >= 0 && k < order.length && (t - 15) % 18 === 0) patch[order[k]].on = t
      if (t > 15 + order.length * 18 + 90) plant()
    },
    draw(px) {
      const fy = Math.round(H * 0.55)
      sky(px, W, H, 0x0a0a20, 0x2a1a40, fy)
      stars(px, W, H, 14, t, 3, fy)
      moon(px, W, H, W * 0.75, H * 0.14, 4 * u)
      // a fence and the field
      for (let x = 1; x < W; x += Math.max(3, Math.round(4 * u))) rect(px, W, H, x, fy - 5, 1, 5, 0x3a2a3a)
      rect(px, W, H, 0, fy - 4, W, 1, 0x3a2a3a)
      for (let y = fy; y < H; y++) {
        const c = mix(0x1a2a1a, 0x2a3a1a, (y - fy) / (H - fy))
        for (let x = 0; x < W; x++) px[y * W + x] = c
      }
      for (let i = 0; i < 10; i++) {
        const x = hash(i, 3, 5) * W
        const y = fy + 2 + hash(i, 4, 5) * (H - fy - 3)
        line(px, W, H, x, y, x + 2, y - 1, 0x2a5a2a)
      }
      const flicker = (p: P) => {
        if (p.on < 0) return 0
        return clamp((t - p.on) / 6, 0, 1) * (0.85 + 0.15 * hash(Math.floor(t / 2), p.face, Math.round(p.x)))
      }
      // glow first, so pumpkins sit on it
      for (const p of patch) {
        const g = flicker(p)
        if (g <= 0) continue
        for (let dy = -p.r * 2.4; dy <= p.r * 2.4; dy++)
          for (let dx = -p.r * 2.4; dx <= p.r * 2.4; dx++) {
            const d = Math.hypot(dx, dy * 1.3) / (p.r * 2.4)
            if (d < 1) tint(px, W, H, p.x + dx, p.y + dy, 0xff8a20, (1 - d) * 0.35 * g)
          }
      }
      for (const p of patch) {
        const g = flicker(p)
        const ry = p.r * 0.75
        ellipse(px, W, H, p.x, p.y, p.r, ry, 0xd0601a)
        ellipse(px, W, H, p.x, p.y, p.r * 0.5, ry, 0xe8782a)
        line(px, W, H, p.x - p.r * 0.5, p.y - ry + 1, p.x - p.r * 0.5, p.y + ry - 1, 0xb04a10)
        line(px, W, H, p.x + p.r * 0.5, p.y - ry + 1, p.x + p.r * 0.5, p.y + ry - 1, 0xb04a10)
        rect(px, W, H, p.x - 0.5, p.y - ry - 1.5, Math.max(1, u), 2, 0x3a6a2a)
        const lit = g > 0 ? mix(0x6a2a08, 0xffe060, g) : 0x5a2a08
        const ex = p.r * 0.38
        const ey = p.y - ry * 0.25
        if (p.face === 1) {
          rect(px, W, H, p.x - ex - 0.5, ey - 0.5, Math.max(1, p.r * 0.25), Math.max(1, p.r * 0.25), lit)
          rect(px, W, H, p.x + ex - 0.5, ey - 0.5, Math.max(1, p.r * 0.25), Math.max(1, p.r * 0.25), lit)
        } else {
          poly(px, W, H, [[p.x - ex - p.r * 0.2, ey + 1], [p.x - ex + p.r * 0.2, ey + 1], [p.x - ex, ey - p.r * 0.25]], lit)
          poly(px, W, H, [[p.x + ex - p.r * 0.2, ey + 1], [p.x + ex + p.r * 0.2, ey + 1], [p.x + ex, ey - p.r * 0.25]], lit)
          dot(px, W, H, p.x - ex, ey, lit)
          dot(px, W, H, p.x + ex, ey, lit)
        }
        const my = p.y + ry * 0.35
        for (let dx = -Math.round(p.r * 0.55); dx <= Math.round(p.r * 0.55); dx++) {
          dot(px, W, H, p.x + dx, my, lit)
          if (p.face !== 2 && (dx + 10) % 2 === 0) dot(px, W, H, p.x + dx, my - 1, lit)
          if (p.face === 2 && Math.abs(dx) < p.r * 0.4) dot(px, W, H, p.x + dx, my + 1, lit)
        }
      }
    },
  }
}

// --- haunted house ----------------------------------------------------------------

const haunted: Maker = (W, H, rng) => {
  const u = W / 32
  const hx = W * 0.15
  const hw = W * 0.7
  const roof = H * 0.3
  const base = H * 0.86
  const wins: [number, number][] = []
  const ww = Math.max(2, Math.round(4 * u))
  const wh = Math.max(3, Math.round(5 * u))
  for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) wins.push([Math.round(hx + hw * (0.28 + i * 0.44) - ww / 2), Math.round(roof + 6 * u + j * (wh + 4 * u))])
  let lit = wins.map(() => 0)
  let ghost = 0
  let ghostT = 0
  let outside = { x: -6, y: H * 0.2, on: false, t: 0 }
  let flash = 0
  let t = 0

  return {
    step() {
      t++
      ghostT++
      if (ghostT > 14) {
        ghostT = 0
        let g = irand(rng, wins.length)
        if (g === ghost) g = (g + 1) % wins.length
        ghost = g
      }
      lit = lit.map((v, i) => (i === ghost ? Math.min(1, v + 0.25) : Math.max(0, v - 0.08)))
      if (!outside.on && rng() < 0.01) outside = { x: -6, y: H * (0.1 + rng() * 0.15), on: true, t: 0 }
      if (outside.on) {
        outside.t++
        outside.x += 0.6
        if (outside.x > W + 6) outside.on = false
      }
      if (flash > 0) flash--
      else if (rng() < 0.006) flash = 6
    },
    draw(px) {
      const bright = flash > 0 && flash % 3 !== 0
      sky(px, W, H, bright ? 0x8a8ac0 : 0x101028, bright ? 0x5a5a8a : 0x3a2a4a)
      if (!bright) stars(px, W, H, 12, t, 9, H * 0.4)
      moon(px, W, H, W * 0.8, H * 0.1, 3.5 * u)
      const house = bright ? 0x2a2a3a : 0x1a1420
      // dead tree
      line(px, W, H, W * 0.06, base, W * 0.08, H * 0.45, house)
      line(px, W, H, W * 0.08, H * 0.55, W * 0.02, H * 0.47, house)
      line(px, W, H, W * 0.08, H * 0.5, W * 0.14, H * 0.43, house)
      // house: walls, a pointed roof and a crooked tower
      rect(px, W, H, hx, roof, hw, base - roof, house)
      poly(px, W, H, [[hx - 2, roof + 1], [hx + hw / 2, roof - 9 * u], [hx + hw + 2, roof + 1]], house)
      rect(px, W, H, hx + hw * 0.7, roof - 12 * u, 4 * u, 8 * u, house)
      poly(px, W, H, [[hx + hw * 0.7 - 1, roof - 12 * u], [hx + hw * 0.7 + 2 * u + 1, roof - 17 * u], [hx + hw * 0.7 + 4 * u + 1, roof - 12 * u]], house)
      // door
      rect(px, W, H, hx + hw / 2 - 2 * u, base - 7 * u, 4 * u, 7 * u, 0x0a0608)
      wins.forEach(([x, y], i) => {
        const c = mix(0x2a2030, 0xffd860, lit[i])
        rect(px, W, H, x, y, ww, wh, c)
        if (i === ghost && lit[i] > 0.5) {
          const gx = x + ww / 2
          const gy = y + wh / 2 + Math.sin(t * 0.4) * 0.5
          ellipse(px, W, H, gx, gy, Math.max(1, ww * 0.35), Math.max(1, wh * 0.35), 0xf8f8ff)
          dot(px, W, H, gx - 0.5, gy - 0.5, 0x101010)
          dot(px, W, H, gx + 0.8, gy - 0.5, 0x101010)
        }
        rect(px, W, H, x + ww / 2, y, 1, wh, mix(0x1a1420, c, 0.4))
      })
      // the ghost outside
      if (outside.on) {
        const gx = outside.x
        const gy = outside.y + Math.sin(outside.t * 0.25) * 2
        ellipse(px, W, H, gx, gy, 3 * u, 3 * u, 0xf0f0ff)
        rect(px, W, H, gx - 3 * u, gy, 6 * u + 1, 3 * u, 0xf0f0ff)
        for (let k = 0; k < 3; k++) dot(px, W, H, gx - 2 * u + k * 2 * u + (outside.t % 2), gy + 3 * u, 0xf0f0ff)
        dot(px, W, H, gx - u, gy - u, 0x101010)
        dot(px, W, H, gx + u, gy - u, 0x101010)
        dot(px, W, H, gx, gy + u, 0x101010)
      }
      // ground and graves
      rect(px, W, H, 0, base, W, H - base, 0x1a2418)
      for (const gxk of [0.08, 0.88]) {
        const gx = W * gxk
        rect(px, W, H, gx - 1.5 * u, base - 4 * u, 3 * u, 4 * u + 1, 0x5a5a6a)
        ellipse(px, W, H, gx, base - 4 * u, 1.5 * u, u, 0x5a5a6a)
      }
    },
  }
}

// --- Christmas tree lights --------------------------------------------------------

const xmaslights: Maker = (W, H, rng) => {
  const u = W / 32
  const top = H * 0.14
  const bot = H * 0.78
  const cx = W / 2
  const halfAt = (y: number) => ((y - top) / (bot - top)) * W * 0.42
  // bulbs along a garland that winds down the tree
  const bulbs: [number, number][] = []
  const turns = 4
  const n = 34
  for (let i = 0; i < n; i++) {
    const q = i / (n - 1)
    const y = top + 3 + q * (bot - top - 4)
    const a = q * turns * Math.PI * 2
    if (Math.cos(a) < -0.2) continue
    bulbs.push([cx + Math.sin(a) * halfAt(y) * 0.92, y])
  }
  const COLS = [0xff3a3a, 0x3aff6a, 0x3a8aff, 0xffd03a, 0xff6ae0]
  let mode = 0
  let t = 0
  let snow = Array.from({ length: 18 }, () => [rng() * W, rng() * H, 0.2 + rng() * 0.4])

  return {
    step() {
      t++
      if (t % 90 === 0) mode = (mode + 1 + irand(rng, 3)) % 4
      for (const s of snow) {
        s[1] += s[2]
        s[0] += Math.sin(t * 0.05 + s[2] * 10) * 0.15
        if (s[1] > H) {
          s[1] = -1
          s[0] = rng() * W
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x0a1430, 0x1a2a50)
      const fy = Math.round(H * 0.85)
      rect(px, W, H, 0, fy, W, H - fy, 0xe8eef8)
      rect(px, W, H, 0, fy, W, 1, 0xffffff)
      // tree in three tiers
      for (let k = 0; k < 3; k++) {
        const a = top + (k * (bot - top)) / 4
        const b = top + ((k + 2) * (bot - top)) / 4
        poly(px, W, H, [[cx, a - 1], [cx - halfAt(b), b], [cx + halfAt(b), b]], k % 2 ? 0x1a6a3a : 0x1a5a32)
      }
      rect(px, W, H, cx - 1.5 * u, bot, 3 * u, fy - bot, 0x5a3418)
      // presents
      rect(px, W, H, cx - 10 * u, fy - 4 * u, 5 * u, 4 * u, 0xd03a4a)
      rect(px, W, H, cx - 8 * u, fy - 4 * u, u, 4 * u, 0xffd03a)
      rect(px, W, H, cx + 5 * u, fy - 5 * u, 5 * u, 5 * u, 0x3a6ad0)
      rect(px, W, H, cx + 7 * u, fy - 5 * u, u, 5 * u, 0xffffff)
      // bulbs
      bulbs.forEach(([x, y], i) => {
        let on = true
        let c = COLS[i % COLS.length]
        if (mode === 0) on = (i + Math.floor(t / 3)) % 4 !== 0
        else if (mode === 1) on = (i + Math.floor(t / 8)) % 2 === 0
        else if (mode === 2) on = hash(i, Math.floor(t / 4), 2) < 0.6
        else c = hsv(i * 0.05 - t * 0.03, 0.8, 1)
        if (on) {
          tint(px, W, H, x - 1, y, c, 0.35)
          tint(px, W, H, x + 1, y, c, 0.35)
          tint(px, W, H, x, y - 1, c, 0.35)
          tint(px, W, H, x, y + 1, c, 0.35)
        }
        dot(px, W, H, x, y, on ? c : scale(c, 0.3))
      })
      // star
      const glow = 0.6 + 0.4 * Math.sin(t * 0.2)
      const sc = mix(0xb08a20, 0xfff080, glow)
      dot(px, W, H, cx, top - 3, sc)
      rect(px, W, H, cx - 2, top - 2, 5, 1, sc)
      rect(px, W, H, cx - 1, top - 3, 3, 3, sc)
      dot(px, W, H, cx - 1, top, sc)
      dot(px, W, H, cx + 1, top, sc)
      for (const s of snow) dot(px, W, H, s[0], s[1], 0xffffff)
    },
  }
}

// --- the sleigh across the moon ---------------------------------------------------

const sleigh: Maker = (W, H, rng) => {
  const u = W / 32
  let x = -20 * u
  let trail: Spark[] = []
  let t = 0

  return {
    step() {
      t++
      x += 0.45
      if (x > W + 22 * u) x = -20 * u
      const y = H * 0.32 - Math.sin((x / W) * Math.PI) * H * 0.1
      if (t % 2 === 0 && x > -20 * u && x < W + 4) trail.push({ x: x - 9 * u, y: y + 2, vx: -0.1, vy: 0.05 + rng() * 0.05, l: 30, c: pick(rng, [0xfff4a0, 0xffffff, 0xffd060]) })
      trail = sparks(trail, 0)
    },
    draw(px) {
      sky(px, W, H, 0x050a24, 0x2a3a6a)
      stars(px, W, H, 20, t, 4, H * 0.55)
      const mr = 9 * u
      moon(px, W, H, W * 0.5, H * 0.28, mr)
      // hills, houses with lit windows
      for (let xx = 0; xx < W; xx++) {
        const h1 = H * 0.72 + Math.sin(xx * 0.18) * 2
        const h2 = H * 0.8 + Math.sin(xx * 0.11 + 2) * 2
        for (let y = Math.round(h1); y < H; y++) px[y * W + xx] = y >= h2 ? 0xf0f4ff : 0xb8c4e0
      }
      for (const hk of [0.2, 0.62, 0.85]) {
        const hx = W * hk
        const hy = H * 0.8 + Math.sin(hx * 0.11 + 2) * 2
        rect(px, W, H, hx - 3 * u, hy - 4 * u, 6 * u, 4 * u, 0x5a3a3a)
        poly(px, W, H, [[hx - 4 * u, hy - 4 * u], [hx, hy - 7 * u], [hx + 4 * u, hy - 4 * u]], 0xf0f4ff)
        dot(px, W, H, hx - u, hy - 2 * u, 0xffd060)
        dot(px, W, H, hx + u, hy - 2 * u, 0xffd060)
      }
      for (const s of trail) dot(px, W, H, s.x, s.y, s.l > 10 ? s.c : 0x8a8a6a)
      // sleigh and two reindeer
      const y = H * 0.32 - Math.sin((x / W) * Math.PI) * H * 0.1
      const sx = x - 7 * u
      rect(px, W, H, sx - 3 * u, y - 2 * u, 6 * u, 2 * u + 1, 0xc02a2a)
      rect(px, W, H, sx - 3 * u, y - 4 * u, 2 * u, 2 * u, 0xc02a2a)
      line(px, W, H, sx - 4 * u, y + u + 1, sx + 4 * u, y + u + 1, 0xd8b040)
      dot(px, W, H, sx + 4 * u + 1, y + u, 0xd8b040)
      // the driver and the sack
      disc(px, W, H, sx, y - 3 * u, 1.2 * u, 0xd02a2a)
      dot(px, W, H, sx, y - 4.5 * u, 0xffffff)
      disc(px, W, H, sx - 2 * u, y - 3 * u, 1.3 * u, 0x8a6a3a)
      for (let r = 0; r < 2; r++) {
        const rx = x + r * 6 * u
        const leg = Math.floor(t / 3 + r) % 2
        line(px, W, H, sx + 3 * u, y - u, rx - 2 * u, y - u, 0xd8b040)
        ellipse(px, W, H, rx, y - u, 2 * u, u, 0x8a5a2a)
        dot(px, W, H, rx + 2.5 * u, y - 2.5 * u, 0x8a5a2a)
        dot(px, W, H, rx + 3 * u, y - 3 * u, 0x8a5a2a)
        dot(px, W, H, rx + 3.5 * u, y - 2.5 * u, r === 1 ? 0xff2a2a : 0x3a2a1a)
        line(px, W, H, rx + 2.5 * u, y - 3.5 * u, rx + 2 * u, y - 5 * u, 0x6a4a2a)
        line(px, W, H, rx - 1.5 * u, y, rx - 1.5 * u + (leg ? u : -u), y + 2 * u, 0x6a4a2a)
        line(px, W, H, rx + 1.5 * u, y, rx + 1.5 * u + (leg ? -u : u), y + 2 * u, 0x6a4a2a)
      }
    },
  }
}

// --- unwrapping a gift ------------------------------------------------------------

const unwrap: Maker = (W, H, rng) => {
  const u = W / 32
  let t = 0
  let paper = rng()
  let gift = irand(rng, 3)
  let confetti: Spark[] = []
  const SHAKE = 50
  const POP = 70

  return {
    step() {
      t++
      if (t === POP) {
        for (let k = 0; k < 3; k++) burst(confetti, rng, W / 2, H * 0.55, hsv(rng(), 0.7, 1), 12, 1.6)
      }
      if (t > POP + 100) {
        t = 0
        paper = rng()
        gift = (gift + 1 + irand(rng, 2)) % 3
      }
      confetti = sparks(confetti, 0.05)
    },
    draw(px) {
      sky(px, W, H, 0xfff0e8, 0xf0d0e0)
      const fy = Math.round(H * 0.82)
      rect(px, W, H, 0, fy, W, H - fy, 0xc89a70)
      rect(px, W, H, 0, fy, W, 1, 0xa87a50)
      const bw = 16 * u
      const bh = 12 * u
      const shake = t < SHAKE && t > 15 ? Math.round(Math.sin(t * 1.3) * (t / SHAKE) * 1.5) : 0
      const cx = W / 2 + shake
      const c = hsv(paper, 0.55, 0.9)
      const rib = hsv(paper + 0.5, 0.6, 1)
      // the gift that comes out
      if (t >= POP) {
        const rise = Math.min(1, (t - POP) / 15)
        const gy = fy - bh - rise * 8 * u
        if (gift === 0) {
          // a teddy bear
          disc(px, W, H, cx, gy, 3.5 * u, 0xa0703a)
          disc(px, W, H, cx - 3 * u, gy - 3 * u, 1.5 * u, 0xa0703a)
          disc(px, W, H, cx + 3 * u, gy - 3 * u, 1.5 * u, 0xa0703a)
          disc(px, W, H, cx, gy + u, 1.5 * u, 0xd8b080)
          dot(px, W, H, cx - 1.3 * u, gy - u, 0x101010)
          dot(px, W, H, cx + 1.3 * u, gy - u, 0x101010)
          dot(px, W, H, cx, gy + 0.5 * u, 0x3a2010)
          ellipse(px, W, H, cx, gy + 6 * u, 3.5 * u, 3 * u, 0xa0703a)
        } else if (gift === 1) {
          // a rubber duck
          ellipse(px, W, H, cx, gy + 4 * u, 5 * u, 3 * u, 0xffd020)
          disc(px, W, H, cx + 2 * u, gy, 2.8 * u, 0xffd020)
          dot(px, W, H, cx + 3 * u, gy - u, 0x101010)
          rect(px, W, H, cx + 4.5 * u, gy, 2 * u, u, 0xff8a20)
        } else {
          // a heart balloon on a string
          const hy = gy - 4 * u
          disc(px, W, H, cx - 2 * u, hy, 2.5 * u, 0xff3a6a)
          disc(px, W, H, cx + 2 * u, hy, 2.5 * u, 0xff3a6a)
          poly(px, W, H, [[cx - 4.5 * u, hy + 0.5], [cx + 4.5 * u, hy + 0.5], [cx, hy + 5 * u]], 0xff3a6a)
          dot(px, W, H, cx - 2 * u, hy - u, 0xffb0c0)
          line(px, W, H, cx, hy + 5 * u, cx + Math.sin(t * 0.2), fy - bh, 0x8a8a8a)
        }
      }
      // box
      rect(px, W, H, cx - bw / 2, fy - bh, bw, bh, c)
      rect(px, W, H, cx - u, fy - bh, 2 * u, bh, rib)
      shade(px, W, H, cx + bw / 2 - 2 * u, fy - bh, 2 * u, bh, 0x000000, 0.15)
      // the lid flies off
      const lt = t - POP
      const lx = cx + (lt > 0 ? lt * 0.9 : 0)
      const ly = fy - bh - 3 * u + (lt > 0 ? -lt * 2.2 + lt * lt * 0.12 : 0) - (t > SHAKE && t < POP ? (t - SHAKE) * 0.05 : 0)
      if (ly < H) {
        rect(px, W, H, lx - bw / 2 - u, ly, bw + 2 * u, 3 * u, scale(c, 0.9))
        rect(px, W, H, lx - u, ly, 2 * u, 3 * u, rib)
        if (lt <= 0) {
          ellipse(px, W, H, lx - 2.5 * u, ly - 1.5 * u, 2.5 * u, 1.5 * u, rib)
          ellipse(px, W, H, lx + 2.5 * u, ly - 1.5 * u, 2.5 * u, 1.5 * u, rib)
          ellipse(px, W, H, lx - 2.5 * u, ly - 1.5 * u, 1.2 * u, 0.6 * u, scale(rib, 0.8))
          ellipse(px, W, H, lx + 2.5 * u, ly - 1.5 * u, 1.2 * u, 0.6 * u, scale(rib, 0.8))
        }
      }
      for (const s of confetti) {
        dot(px, W, H, s.x, s.y, s.c)
        dot(px, W, H, s.x + 1, s.y, s.c)
      }
    },
  }
}

// --- New Year's ball drop ---------------------------------------------------------

const balldrop: Maker = (W, H, rng) => {
  const u = W / 32
  const SEC = 12
  let t = 0
  let shots: Spark[] = []
  let rockets: { x: number; y: number; vy: number; c: number }[] = []

  return {
    step() {
      t++
      const end = SEC * 10
      if (t > end && t < end + 110 && t % 9 === 0) rockets.push({ x: W * (0.15 + rng() * 0.7), y: H, vy: -2.4 - rng() * 0.6, c: hsv(rng(), 0.7, 1) })
      rockets = rockets.filter(r => {
        r.y += r.vy
        r.vy += 0.07
        if (r.vy > -0.4) {
          burst(shots, rng, r.x, r.y, r.c, 18, 1.1)
          return false
        }
        return true
      })
      shots = sparks(shots, 0.03)
      if (t > end + 150) t = 0
    },
    draw(px) {
      sky(px, W, H, 0x050818, 0x1a1a40)
      const end = SEC * 10
      const left = Math.max(0, 10 - Math.floor(t / SEC))
      const prog = clamp(t / end, 0, 1)
      // skyline
      for (let x = 0; x < W; x++) {
        const s = Math.floor(x / 4)
        const h = H * (0.25 + hash(s, 1, 2) * 0.25)
        for (let y = Math.round(H - h); y < H; y++) {
          const win = x % 4 !== 3 && y % 3 === 1 && hash(x, y, 3) < 0.35
          px[y * W + x] = win ? 0xffd070 : 0x14142a
        }
      }
      // the tower and its pole
      const cx = W / 2
      const poleTop = H * 0.2
      const poleBot = H * 0.55
      rect(px, W, H, cx - 3 * u, poleBot, 6 * u, H - poleBot, 0x2a2a44)
      for (let y = Math.round(poleBot + 2); y < H; y += 3) rect(px, W, H, cx - 2 * u, y, 4 * u, 1, 0x4a4a6a)
      rect(px, W, H, cx - 0.5, poleTop, 1, poleBot - poleTop, 0x8a8aa0)
      // the ball, glittering
      const by = poleTop + prog * (poleBot - poleTop - 3 * u)
      const r = 3 * u
      disc(px, W, H, cx, by, r, 0xc0c8e0)
      for (let k = 0; k < 6; k++) {
        const a = k + t * 0.15
        dot(px, W, H, cx + Math.cos(a) * r * 0.6, by + Math.sin(a * 1.3) * r * 0.6, hsv(k / 6 + t * 0.02, 0.6, 1))
      }
      if (t >= end) for (let k = 0; k < 8; k++) dot(px, W, H, cx + Math.cos(k + t) * (r + 2), by + Math.sin(k + t) * (r + 2), 0xffffff)
      // the countdown
      if (t < end + 10) {
        const s = String(left)
        const k = Math.max(1, Math.floor(W / 14))
        const pulse = (t % SEC) < 3 ? 0xffffff : 0xffd040
        bigText(px, W, H, Math.round(cx - (textWidth(s) * k) / 2), 2, s, pulse, k)
      }
      for (const rk of rockets) dot(px, W, H, rk.x, rk.y, 0xffe0a0)
      for (const s of shots) dot(px, W, H, s.x, s.y, s.l > 12 ? s.c : scale(s.c, 0.5))
    },
  }
}

// --- dragon dance -----------------------------------------------------------------

const dragondance: Maker = (W, H, rng) => {
  const u = W / 32
  const N = 9
  let t = 0
  let pops: Spark[] = []

  return {
    step() {
      t++
      if (rng() < 0.06) burst(pops, rng, rng() < 0.5 ? 2 : W - 3, H * (0.75 + rng() * 0.15), pick(rng, [0xffd040, 0xff6a2a, 0xffffff]), 5, 0.9)
      pops = sparks(pops, 0.06)
    },
    draw(px) {
      sky(px, W, H, 0x1a0a14, 0x3a1424)
      const fy = Math.round(H * 0.82)
      // buildings on both sides and the street
      rect(px, W, H, 0, H * 0.2, 4 * u, fy - H * 0.2, 0x2a1418)
      rect(px, W, H, W - 4 * u, H * 0.25, 4 * u, fy - H * 0.25, 0x2a1418)
      rect(px, W, H, 0, fy, W, H - fy, 0x3a2a2a)
      for (let x = (t * 0) % 4; x < W; x += 4) rect(px, W, H, x, fy + 3, 2, 1, 0x5a4a4a)
      // lantern strings
      for (const [y0, sag] of [[H * 0.12, 3], [H * 0.24, 4]] as [number, number][]) {
        for (let x = 0; x < W; x++) dot(px, W, H, x, y0 + Math.sin((x / W) * Math.PI) * sag, 0x5a3a3a)
        for (let k = 1; k < 5; k++) {
          const x = (k / 5) * W
          const y = y0 + Math.sin((x / W) * Math.PI) * sag + 1
          const glow = 0.8 + 0.2 * Math.sin(t * 0.2 + k)
          ellipse(px, W, H, x, y + u, 1.5 * u, 1.2 * u + 0.5, mix(0x8a1010, 0xff3a2a, glow))
          dot(px, W, H, x, y + 2.5 * u, 0xffd040)
        }
      }
      // the dragon: a chain of segments on a weaving wave
      const pts: [number, number][] = []
      for (let i = 0; i < N; i++) {
        const q = t * 0.12 - i * 0.55
        pts.push([W / 2 + Math.sin(q * 0.6) * W * 0.32, H * 0.55 + Math.sin(q) * H * 0.08])
      }
      // dancers' poles and legs
      for (let i = 0; i < N; i += 2) {
        const [x, y] = pts[i]
        line(px, W, H, x, y + 2 * u, x, fy - 3 * u, 0x8a6a3a)
        const leg = Math.floor(t / 3 + i) % 2
        rect(px, W, H, x - u, fy - 3 * u, 2 * u, 2 * u, 0x1a1a1a)
        dot(px, W, H, x - u + (leg ? 0 : -1), fy - 1, 0x1a1a1a)
        dot(px, W, H, x + u + (leg ? 1 : 0), fy - 1, 0x1a1a1a)
      }
      for (let i = N - 1; i >= 1; i--) {
        const [x, y] = pts[i]
        const r = (3.2 - i * 0.12) * u
        disc(px, W, H, x, y, r, i % 2 ? 0xd02020 : 0xe84020)
        dot(px, W, H, x, y - r, 0xffd040)
        dot(px, W, H, x, y + r * 0.5, 0xffd040)
      }
      // head
      const [hx, hy] = pts[0]
      const dir = pts[0][0] >= pts[1][0] ? 1 : -1
      ellipse(px, W, H, hx, hy, 4.5 * u, 3.5 * u, 0xd02020)
      rect(px, W, H, hx + dir * 2 * u - 2 * u, hy + u, 4 * u, 2 * u, 0xffd040)
      dot(px, W, H, hx + dir * 1.5 * u, hy - 1.5 * u, 0xffffff)
      dot(px, W, H, hx + dir * 1.5 * u, hy - 1.5 * u + 1, 0x101010)
      line(px, W, H, hx - dir * u, hy - 3 * u, hx - dir * 3 * u, hy - 6 * u, 0xffd040)
      line(px, W, H, hx + dir * 4 * u, hy + 2 * u, hx + dir * 6 * u, hy + 3 * u + Math.sin(t * 0.4), 0xffd040)
      for (const s of pops) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- building a snowman -----------------------------------------------------------

const snowman: Maker = (W, H, rng) => {
  const u = W / 32
  let t = 0
  let flakes = Array.from({ length: 16 }, () => [rng() * W, rng() * H])
  const cx = W / 2
  const fy = Math.round(H * 0.82)
  const R = [6 * u, 4.5 * u, 3.3 * u]
  const at = (i: number) => fy - R[0] * 2 - (i > 1 ? R[1] * 2 : 0) + (i === 0 ? R[0] : i === 1 ? -R[1] : -R[2])
  // stages: roll 0, roll 1 + lift, roll 2 + lift, then decorations, wave, melt
  const S = [0, 50, 100, 150, 165, 180, 195, 210, 260, 330]

  return {
    step() {
      t++
      if (t > S[9] + 20) t = 0
      for (const f of flakes) {
        f[1] += 0.3
        f[0] += Math.sin(t * 0.07 + f[1]) * 0.1
        if (f[1] > H) {
          f[1] = 0
          f[0] = rng() * W
        }
      }
    },
    draw(px) {
      const melt = clamp((t - S[8]) / (S[9] - S[8]), 0, 1)
      sky(px, W, H, mix(0x8aa8d0, 0x8ac8f0, melt), mix(0xd8e4f4, 0xf0f0d0, melt))
      if (melt > 0) disc(px, W, H, W * 0.8, H * 0.1 + (1 - melt) * 10, 3 * u, 0xffe060)
      rect(px, W, H, 0, fy, W, H - fy, 0xf4f8ff)
      for (let x = 0; x < W; x++) if (hash(x, 1, 2) < 0.3) dot(px, W, H, x, fy, 0xdce4f0)
      const snow = 0xffffff
      const edge = 0xc8d4e8
      const ball = (x: number, y: number, r: number) => {
        disc(px, W, H, x, y, r + 0.5, edge)
        disc(px, W, H, x - 0.5, y - 0.5, r, snow)
      }
      const squash = 1 - melt * 0.7
      // ball i rolls in from a side while growing, then is lifted onto the stack
      for (let i = 0; i < 3; i++) {
        const t0 = S[i]
        if (t < t0) continue
        const k = clamp((t - t0) / 35, 0, 1)
        const lift = i === 0 ? 1 : clamp((t - t0 - 35) / 12, 0, 1)
        const r = R[i] * (0.3 + 0.7 * k) * (i === 2 ? 1 : squash)
        const from = i % 2 ? W + 6 : -6
        const rollX = from + (cx - from) * k
        const groundY = fy - r
        const top = at(i) + (fy - at(i)) * (1 - squash) * (i === 0 ? 0.3 : 0.6)
        const y = groundY + (top - groundY) * lift - Math.sin(lift * Math.PI) * 4 * u
        if (melt >= 1 && i > 0) continue
        ball(rollX, y, r)
      }
      if (melt > 0) ellipse(px, W, H, cx, fy, R[0] * (1 + melt), 1 + melt * 2, snow)
      const hy = at(2) + (fy - at(2)) * (1 - squash) * 0.6
      const by = at(1) + (fy - at(1)) * (1 - squash) * 0.6
      if (melt < 1) {
        // eyes and carrot
        if (t > S[3]) {
          dot(px, W, H, cx - 1.2 * u, hy - u, 0x1a1a1a)
          dot(px, W, H, cx + 1.2 * u, hy - u, 0x1a1a1a)
          for (let k = -1; k <= 1; k++) dot(px, W, H, cx + k * u, hy + 1.6 * u - Math.abs(k) * 0.5 * u, 0x3a3a3a)
        }
        if (t > S[4]) rect(px, W, H, cx, hy + 0.2 * u, 3 * u, 1, 0xff8a20)
        // scarf and buttons
        if (t > S[5]) {
          rect(px, W, H, cx - 3 * u, hy + R[2] - 0.5, 6 * u, 1.5 * u, 0xd03a3a)
          rect(px, W, H, cx + 1.5 * u, hy + R[2], 1.5 * u, 3.5 * u, 0xd03a3a)
          for (let k = 0; k < 2; k++) dot(px, W, H, cx, by - u + k * 2.5 * u, 0x1a1a1a)
        }
        // stick arms, one waves
        if (t > S[6]) {
          const wave = t > S[7] ? Math.sin(t * 0.4) * 2 * u : 0
          line(px, W, H, cx - R[1], by, cx - R[1] - 4 * u, by - 2 * u, 0x6a4a2a)
          line(px, W, H, cx + R[1], by, cx + R[1] + 3 * u, by - 3 * u - wave, 0x6a4a2a)
        }
        // the hat drops in
        if (t > S[6]) {
          const drop = clamp((t - S[6]) / 10, 0, 1)
          const ty = hy - R[2] - 3 * u - (1 - drop) * H * 0.3
          rect(px, W, H, cx - 2.2 * u, ty, 4.4 * u + 1, 3 * u, 0x1a1a24)
          rect(px, W, H, cx - 3.5 * u, ty + 3 * u, 7 * u + 1, u, 0x1a1a24)
          rect(px, W, H, cx - 2.2 * u, ty + 2 * u, 4.4 * u + 1, 0.8 * u, 0xd03a3a)
        }
      } else {
        rect(px, W, H, cx - 3.5 * u, fy - u, 7 * u + 1, u, 0x1a1a24)
        rect(px, W, H, cx + 3 * u, fy - 0.5, 3 * u, 1, 0xff8a20)
      }
      for (const f of flakes) if (melt < 0.3) dot(px, W, H, f[0], f[1], 0xffffff)
    },
  }
}

// --- cherry blossoms --------------------------------------------------------------

const blossoms: Maker = (W, H, rng) => {
  const fy = Math.round(H * 0.8)
  const ground = new Uint8Array(W * (H - fy))
  type Petal = { x: number; y: number; vx: number; ph: number; c: number }
  let petals: Petal[] = []
  let t = 0
  let gust = 0
  const PINK = [0xffc0d8, 0xffa8c8, 0xffe0ec]

  return {
    step() {
      t++
      if (t % 200 === 0) gust = 40
      if (gust > 0) gust--
      const wind = 0.15 + (gust > 0 ? 0.6 : 0)
      const spawn = gust > 0 ? 3 : 1
      for (let k = 0; k < spawn; k++)
        if (rng() < 0.6) petals.push({ x: rng() * W * 1.2 - W * 0.2, y: H * 0.15 + rng() * H * 0.1, vx: 0, ph: rng() * 6, c: irand(rng, 3) })
      const next: Petal[] = []
      for (const p of petals) {
        p.ph += 0.15
        p.x += wind + Math.sin(p.ph) * 0.3
        p.y += 0.3 + Math.cos(p.ph) * 0.1
        if (p.y >= fy) {
          const x = Math.round(p.x)
          const y = Math.round(p.y) - fy
          if (x >= 0 && x < W) ground[Math.min(H - fy - 1, y) * W + x] = p.c + 1
        } else if (p.x < W + 2) next.push(p)
      }
      petals = next
      if (t > 600) {
        ground.fill(0)
        t = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0xa8d0f0, 0xfff0f4, fy)
      // distant hills and the lane
      for (let x = 0; x < W; x++) {
        const h = fy - 6 - Math.sin(x * 0.2) * 2
        for (let y = Math.round(h); y < fy; y++) px[y * W + x] = 0xb8d0b0
      }
      for (let y = fy; y < H; y++) {
        const c = mix(0x8ab070, 0x6a9a5a, (y - fy) / (H - fy))
        for (let x = 0; x < W; x++) px[y * W + x] = c
      }
      for (let y = fy; y < H; y++) {
        const half = 2 + (y - fy) * 0.8
        for (let x = Math.round(W / 2 - half); x <= Math.round(W / 2 + half); x++) dot(px, W, H, x, y, 0xd8c8a8)
      }
      for (let y = 0; y < H - fy; y++)
        for (let x = 0; x < W; x++) {
          const c = ground[y * W + x]
          if (c) px[(y + fy) * W + x] = PINK[c - 1]
        }
      // trees on both sides: trunk and a big crown of blossoms
      for (const [tx, side] of [[W * 0.1, 1], [W * 0.92, -1]] as [number, number][]) {
        line(px, W, H, tx, fy + 2, tx, H * 0.3, 0x5a3a3a)
        line(px, W, H, tx + side, fy + 2, tx + side, H * 0.35, 0x5a3a3a)
        line(px, W, H, tx, H * 0.4, tx + side * W * 0.25, H * 0.18, 0x5a3a3a)
        for (let k = 0; k < 18; k++) {
          const cx = tx + side * hash(k, 1, 3) * W * 0.32 + (hash(k, 5, 3) - 0.5) * 4
          const cy = H * 0.06 + hash(k, 2, 3) * H * 0.3
          disc(px, W, H, cx, cy, 2 + hash(k, 4, 3) * 2.5, PINK[k % 3])
        }
      }
      for (const p of petals) dot(px, W, H, p.x, p.y, PINK[p.c])
    },
  }
}

// --- witch's cauldron -------------------------------------------------------------

const cauldron: Maker = (W, H, rng) => {
  const u = W / 32
  type Bubble = { x: number; r: number; life: number }
  let bubbles: Bubble[] = []
  let steam: Spark[] = []
  let witch = -10
  let t = 0
  let brew = rng()

  return {
    step() {
      t++
      if (rng() < 0.25) bubbles.push({ x: W / 2 + (rng() - 0.5) * 16 * u, r: 0.5 + rng() * 1.5 * u, life: 10 + irand(rng, 10) })
      bubbles = bubbles.filter(b => --b.life > 0)
      if (rng() < 0.3) steam.push({ x: W / 2 + (rng() - 0.5) * 12 * u, y: H * 0.6, vx: (rng() - 0.5) * 0.2, vy: -0.3 - rng() * 0.3, l: 30 + irand(rng, 20), c: 0 })
      steam = sparks(steam, 0)
      witch += 0.7
      if (witch > W + 40) {
        witch = -14
        brew = rng()
      }
    },
    draw(px) {
      sky(px, W, H, 0x0c0a1e, 0x24183a)
      stars(px, W, H, 12, t, 11, H * 0.45)
      moon(px, W, H, W * 0.3, H * 0.14, 5 * u)
      // the witch on her broom, against the moon
      const wy = H * 0.15 + Math.sin(witch * 0.1) * 3
      if (witch > -14 && witch < W + 10) {
        line(px, W, H, witch - 5 * u, wy + 2 * u, witch + 5 * u, wy + 1.5 * u, 0x8a6a3a)
        for (let k = 0; k < 3; k++) dot(px, W, H, witch - 6 * u, wy + 1.5 * u + k, 0xc0a050)
        poly(px, W, H, [[witch - 2 * u, wy + 2 * u], [witch + 2 * u, wy + 2 * u], [witch, wy - 2 * u]], 0x1a1a2a)
        disc(px, W, H, witch + 0.5 * u, wy - 2.5 * u, 1.2 * u, 0x7ac05a)
        poly(px, W, H, [[witch - 2.5 * u, wy - 3 * u], [witch + 3 * u, wy - 3 * u], [witch - 0.5 * u, wy - 8 * u]], 0x1a1a2a)
        for (let k = 0; k < 4; k++) if (hash(k, Math.floor(witch), 1) < 0.5) dot(px, W, H, witch - 8 * u - k * 2, wy + 2 * u + hash(k, 2, Math.floor(witch)) * 2, 0xc0a0ff)
      }
      const fy = Math.round(H * 0.86)
      rect(px, W, H, 0, fy, W, H - fy, 0x1a1418)
      // fire under the pot
      for (let k = 0; k < 9; k++) {
        const x = W / 2 - 6 * u + k * 1.5 * u
        const h = (2 + hash(k, Math.floor(t / 2), 4) * 4) * u
        line(px, W, H, x, fy, x, fy - h, k % 2 ? 0xff8a20 : 0xffd040)
      }
      rect(px, W, H, W / 2 - 8 * u, fy - u, 16 * u, u + 1, 0x3a2a1a)
      // the pot and its brew
      const potY = H * 0.68
      const brewC = hsv(brew * 0.4 + 0.25, 0.8, 0.85)
      ellipse(px, W, H, W / 2, potY + 4 * u, 11 * u, 8 * u, 0x1a1a22)
      ellipse(px, W, H, W / 2 - 4 * u, potY + 2 * u, 2 * u, 3 * u, 0x2e2e3a)
      ellipse(px, W, H, W / 2, potY - 2 * u, 11 * u, 2.5 * u, 0x2a2a34)
      ellipse(px, W, H, W / 2, potY - 2 * u, 9.5 * u, 1.8 * u, brewC)
      for (const b of bubbles) {
        const y = potY - 2.5 * u - (b.life < 4 ? 0 : 0.5)
        if (b.life < 3) ring(px, W, H, b.x, y, b.r + 1, scale(brewC, 1.3))
        else disc(px, W, H, b.x, y, b.r, scale(brewC, 1.25))
      }
      for (const s of steam) {
        const k = s.l / 50
        tint(px, W, H, s.x, s.y, brewC, 0.25 + k * 0.35)
      }
    },
  }
}

// --- bats at dusk -----------------------------------------------------------------

const bats: Maker = (W, H, rng) => {
  type Bat = { x: number; y: number; vx: number; vy: number; ph: number }
  let flock: Bat[] = []
  let t = 0
  const cave = { x: W * 0.22, y: H * 0.72 }

  return {
    step() {
      t++
      const cyc = t % 360
      const rate = cyc < 240 ? Math.sin((cyc / 240) * Math.PI) : 0
      if (rng() < rate * 0.9) flock.push({ x: cave.x + (rng() - 0.5) * 3, y: cave.y, vx: 0.3 + rng() * 0.3, vy: -0.6 - rng() * 0.4, ph: rng() * 6 })
      for (const b of flock) {
        b.ph += 0.9
        // a river of bats that curls up and away to the right
        const tx = W * 0.9 + Math.sin(t * 0.02 + b.ph * 0.05) * W * 0.1
        const ty = H * 0.08
        b.vx += ((tx - b.x) * 0.0015) + (rng() - 0.5) * 0.12
        b.vy += ((ty - b.y) * 0.0015) + (rng() - 0.5) * 0.12
        b.vx *= 0.97
        b.vy *= 0.97
        b.x += b.vx
        b.y += b.vy
      }
      flock = flock.filter(b => b.y > -4 && b.x < W + 4 && !(b.y < H * 0.12 && b.x > W * 0.8 && rng() < 0.1))
    },
    draw(px) {
      sky(px, W, H, 0x2a1a4a, 0xff8a4a, Math.round(H * 0.8))
      for (let y = Math.round(H * 0.8); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = 0xff8a4a
      disc(px, W, H, W * 0.7, H * 0.66, W * 0.12, 0xffc070)
      // the cliff with its cave
      for (let x = 0; x < W; x++) {
        const top = H * (0.5 + (x / W) * 0.32) + Math.sin(x * 0.7) * 1.2
        for (let y = Math.round(top); y < H; y++) px[y * W + x] = 0x1a1020
      }
      ellipse(px, W, H, cave.x, cave.y + 2, W * 0.1, H * 0.05, 0x050208)
      for (let x = 0; x < W; x++) if (hash(x, 1, 6) < 0.4) dot(px, W, H, x, H - 1 - Math.floor(hash(x, 2, 6) * 2), 0x0e0814)
      for (const b of flock) {
        const up = Math.sin(b.ph) > 0
        dot(px, W, H, b.x, b.y, 0x0a0610)
        dot(px, W, H, b.x - 1, b.y + (up ? -1 : 0), 0x0a0610)
        dot(px, W, H, b.x + 1, b.y + (up ? -1 : 0), 0x0a0610)
        if (!up) {
          dot(px, W, H, b.x - 1, b.y + 1, 0x0a0610)
          dot(px, W, H, b.x + 1, b.y + 1, 0x0a0610)
        }
      }
    },
  }
}

// --- a spider weaving its web -----------------------------------------------------

const spiderweb: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.42
  const N = 10
  let len: number[] = []
  let off = 0
  let t = 0
  const RAD = 30
  const SPIRAL = 280
  const reset = () => {
    off = rng() * 0.6
    len = Array.from({ length: N }, (_, i) => {
      const a = off + (i / N) * Math.PI * 2
      const lx = Math.abs(Math.cos(a)) > 1e-3 ? (W / 2 - 1) / Math.abs(Math.cos(a)) : 999
      const ly = Math.abs(Math.sin(a)) > 1e-3 ? (H * 0.4) / Math.abs(Math.sin(a)) : 999
      return Math.min(lx, ly) * (0.85 + rng() * 0.1)
    })
    t = 0
  }
  reset()
  const at = (i: number, f: number): [number, number] => {
    const k = ((i % N) + N) % N
    const a = off + (k / N) * Math.PI * 2
    return [cx + Math.cos(a) * len[k] * f, cy + Math.sin(a) * len[k] * f]
  }
  // the spiral is a chain of straight threads from radial to radial, inside out
  const turns = 8
  const spiralPt = (s: number): [number, number] => {
    const i = Math.floor(s)
    const f = 0.12 + (s / (N * turns)) * 0.82
    return at(i, f)
  }

  return {
    step() {
      t++
      if (t > N * RAD + SPIRAL + 120) reset()
    },
    draw(px) {
      sky(px, W, H, 0x10241a, 0x2a4a2a)
      // the branches it hangs from
      line(px, W, H, 0, 2, W - 1, 4, 0x4a3a2a)
      line(px, W, H, 0, 3, W - 1, 5, 0x3a2a1a)
      line(px, W, H, 1, 0, 1, H - 1, 0x3a2a1a)
      line(px, W, H, W - 2, 0, W - 2, H - 1, 0x3a2a1a)
      const silk = 0xd8e0e8
      const radDone = Math.min(N, t / RAD)
      let sx = cx
      let sy = cy
      for (let i = 0; i < Math.ceil(radDone); i++) {
        const f = Math.min(1, radDone - i)
        const [x, y] = at(i, f)
        line(px, W, H, cx, cy, x, y, silk)
        if (i === Math.ceil(radDone) - 1 && radDone < N) {
          sx = x
          sy = y
        }
      }
      if (t > N * RAD) {
        const s = Math.min(N * turns, ((t - N * RAD) / SPIRAL) * N * turns)
        for (let k = 0; k < Math.floor(s); k++) {
          const [x0, y0] = spiralPt(k)
          const [x1, y1] = spiralPt(k + 1)
          line(px, W, H, x0, y0, x1, y1, 0xb8c0cc)
        }
        const k = Math.floor(s)
        const [x0, y0] = spiralPt(k)
        const [x1, y1] = spiralPt(k + 1)
        const f = s - k
        sx = x0 + (x1 - x0) * f
        sy = y0 + (y1 - y0) * f
        if (s >= N * turns) {
          sx = cx
          sy = cy
          // dew drops catch the light
          for (let d = 0; d < 14; d++) {
            const [x, y] = spiralPt(Math.floor(hash(d, 1, 3) * N * turns))
            dot(px, W, H, x, y, hash(d, Math.floor(t / 6), 2) < 0.3 ? 0xffffff : 0x8ad0ff)
          }
        }
      }
      // spider
      disc(px, W, H, sx, sy, 1.4, 0x1a1a1a)
      dot(px, W, H, sx, sy - 2, 0x1a1a1a)
      for (const d of [-1, 1]) {
        dot(px, W, H, sx + d * 2, sy - 1, 0x1a1a1a)
        dot(px, W, H, sx + d * 2, sy + 1, 0x1a1a1a)
        dot(px, W, H, sx + d * 3, sy - 2 + (t % 4 < 2 ? 0 : 1), 0x1a1a1a)
        dot(px, W, H, sx + d * 3, sy + 2 - (t % 4 < 2 ? 0 : 1), 0x1a1a1a)
      }
      dot(px, W, H, sx, sy, 0xc03a2a)
    },
  }
}

// --- piñata -----------------------------------------------------------------------

const pinata: Maker = (W, H, rng) => {
  const u = W / 32
  const fy = Math.round(H * 0.88)
  let ang = 0
  let av = 0
  let hits = 0
  let need = 4
  let swing = 0
  let burstAt = -1
  let t = 0
  let hue = rng()
  type Candy = { x: number; y: number; vx: number; vy: number; c: number; rest: boolean }
  let candy: Candy[] = []
  let flash = 0
  const pivotY = 2

  return {
    step() {
      t++
      av += -Math.sin(ang) * 0.02
      av *= 0.985
      ang += av
      if (flash > 0) flash--
      if (burstAt < 0) {
        if (swing > 0) {
          swing++
          if (swing === 6) {
            av = Math.max(-0.12, Math.min(0.12, av + 0.06))
            hits++
            flash = 3
            if (hits >= need) {
              burstAt = t
              const [px0, py0] = pos()
              for (let k = 0; k < 30; k++)
                candy.push({ x: px0, y: py0, vx: (rng() - 0.5) * 2.4, vy: -rng() * 2, c: hsv(rng(), 0.7, 1), rest: false })
            }
          }
          if (swing > 10) swing = 0
        } else if (Math.abs(ang) < 0.12 && av <= 0 && rng() < 0.4) swing = 1
      }
      for (const c of candy) {
        if (c.rest) continue
        c.vy += 0.15
        c.x += c.vx
        c.y += c.vy
        if (c.x < 0 || c.x > W - 1) c.vx *= -0.6
        if (c.y >= fy - 1) {
          c.y = fy - 1 - (hash(Math.round(c.x), 1, candy.indexOf(c)) < 0.5 ? 1 : 0)
          if (Math.abs(c.vy) < 0.8) c.rest = true
          c.vy *= -0.4
          c.vx *= 0.6
        }
      }
      if (burstAt >= 0 && t - burstAt > 110) {
        burstAt = -1
        hits = 0
        need = 3 + irand(rng, 4)
        candy = []
        hue = rng()
        ang = 0
        av = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ad0ff, 0xd0f0ff)
      // bunting
      for (let k = 0; k < 6; k++) {
        const x = (k + 0.5) * (W / 6)
        poly(px, W, H, [[x - 2 * u, 7], [x + 2 * u, 7], [x, 7 + 3 * u]], hsv(k / 6, 0.6, 1))
      }
      rect(px, W, H, 0, fy, W, H - fy, 0x6ab04a)
      rect(px, W, H, 0, fy, W, 1, 0x8ad06a)
      const [x, y] = pos()
      line(px, W, H, W / 2, pivotY, x, y - 4 * u, 0xe8e0c0)
      if (burstAt < 0) {
        // a star piñata with tassels
        const cols = [hsv(hue, 0.7, 1), hsv(hue + 0.33, 0.7, 1), hsv(hue + 0.66, 0.7, 1)]
        const r = 6 * u
        const pts: [number, number][] = []
        for (let k = 0; k < 10; k++) {
          const a = -Math.PI / 2 + (k / 10) * Math.PI * 2 + ang * 0.5
          const rr = k % 2 ? r * 0.5 : r
          pts.push([x + Math.cos(a) * rr, y + Math.sin(a) * rr])
        }
        poly(px, W, H, pts, flash ? 0xffffff : cols[0])
        disc(px, W, H, x, y, r * 0.45, flash ? 0xffffff : cols[1])
        for (let k = 0; k < 5; k++) {
          const [tx, ty] = pts[k * 2]
          line(px, W, H, tx, ty, tx + Math.sin(t * 0.2 + k) * 0.8, ty + 2, cols[(k + 2) % 3])
        }
        // cracks
        for (let k = 0; k < hits; k++) line(px, W, H, x - 2 + k, y - 2 + (k % 2) * 3, x + k - 1, y + (k % 2), 0x3a2a2a)
      } else {
        for (let k = 0; k < 6; k++) {
          const q = (t - burstAt) * 0.6
          dot(px, W, H, x + Math.cos(k) * q, y + Math.sin(k) * q + q * q * 0.05, hsv(hue + k * 0.1, 0.7, 1))
        }
      }
      // the kid with a stick and a blindfold
      const kx = W * 0.25
      const ky = fy
      rect(px, W, H, kx - u, ky - 6 * u, 2 * u + 1, 4 * u, 0x3a6ad0)
      rect(px, W, H, kx - u, ky - 2 * u, u, 2 * u, 0x2a2a4a)
      rect(px, W, H, kx + 0.5 * u, ky - 2 * u, u, 2 * u, 0x2a2a4a)
      disc(px, W, H, kx, ky - 8 * u, 1.8 * u, 0xf0c090)
      rect(px, W, H, kx - 1.8 * u, ky - 8.5 * u, 3.6 * u + 1, 1, 0xd03a3a)
      const sa = swing > 0 ? -2.3 + Math.min(1, swing / 6) * 1.45 : -2.2 + Math.sin(t * 0.1) * 0.15
      const hx = kx + 1.5 * u
      const hy = ky - 5 * u
      line(px, W, H, hx, hy, hx + Math.cos(sa) * 11 * u, hy + Math.sin(sa) * 11 * u, 0x8a5a2a)
      for (const c of candy) {
        dot(px, W, H, c.x, c.y, c.c)
        dot(px, W, H, c.x + 1, c.y, c.c)
      }
    },
  }
  function pos(): [number, number] {
    const L = H * 0.42
    return [W / 2 + Math.sin(ang) * L, pivotY + Math.cos(ang) * L]
  }
}

// --- jumping into a leaf pile -----------------------------------------------------

const leafpile: Maker = (W, H, rng) => {
  const u = W / 32
  const fy = Math.round(H * 0.85)
  type Leaf = { x: number; y: number; vx: number; vy: number; c: number; ph: number; rest: boolean }
  let leaves: Leaf[] = []
  let t = 0
  let kx = -4
  let ky = fy
  let kvy = 0
  let phase = 0
  const COLS = [0xe8641a, 0xd8341a, 0xf0a020, 0xb05a1a, 0xe8c040]
  const pileX = W * 0.62
  const heap = () => {
    leaves = []
    for (let k = 0; k < 110; k++) {
      const a = rng()
      const r = Math.sqrt(rng())
      const x = pileX + (a - 0.5) * 2 * 9 * u * r
      const h = (1 - Math.abs((x - pileX) / (9 * u))) * 8 * u
      leaves.push({ x, y: fy - 1 - rng() * Math.max(0, h), vx: 0, vy: 0, c: irand(rng, COLS.length), ph: rng() * 6, rest: true })
    }
    kx = -4
    ky = fy
    kvy = 0
    phase = 0
    t = 0
  }
  heap()

  return {
    step() {
      t++
      if (phase === 0) {
        kx += 0.7
        if (kx > pileX - 20) {
          phase = 1
          kvy = -2.2
        }
      } else if (phase === 1) {
        kx += 0.7
        kvy += 0.15
        ky += kvy
        if (ky >= fy - 4 * u && kvy > 0) {
          phase = 2
          ky = fy - 0.5 * u
          for (const l of leaves) {
            const d = Math.hypot(l.x - kx, l.y - ky)
            const k = Math.max(0, 1 - d / (12 * u))
            l.vx = (l.x - kx) * 0.08 * k + (rng() - 0.5) * k
            l.vy = -(1.5 + rng() * 2.5) * k
            l.rest = k === 0
          }
          t = 0
        }
      } else if (t > 140) heap()
      for (const l of leaves) {
        if (l.rest) continue
        l.ph += 0.3
        l.vy = Math.min(l.vy + 0.08, 0.5)
        l.vx *= 0.98
        l.x += l.vx + (l.vy > 0 ? Math.sin(l.ph) * 0.4 : 0)
        l.y += l.vy
        if (l.y >= fy - 1) {
          const near = phase === 2 ? Math.max(0, 1 - Math.abs(l.x - kx) / (5 * u)) : 0
          l.y = fy - 1 - (hash(Math.round(l.x), Math.round(l.ph), 2) < 0.4 ? 1 : 0) - Math.round(hash(Math.round(l.ph * 10), 3, 4) * near * 4 * u)
          l.rest = true
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ab8e0, 0xf8e0b8, fy)
      // a tree and a house wall
      rect(px, W, H, W * 0.06, H * 0.3, 3 * u, fy - H * 0.3, 0x5a3a2a)
      disc(px, W, H, W * 0.1, H * 0.25, 7 * u, 0xd8642a)
      disc(px, W, H, W * 0.2, H * 0.3, 5 * u, 0xe89a2a)
      for (let y = fy; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y) % 5 ? 0x7a9a4a : 0x6a8a3a
      // the rake leans on the tree
      line(px, W, H, W * 0.18, fy - 1, W * 0.32, fy - 12 * u, 0x9a7a4a)
      rect(px, W, H, W * 0.15, fy - 2, 3 * u, 1, 0x6a6a6a)
      const buried = phase === 2
      const drawKid = () => {
        const x = kx
        const y = ky
        if (buried) {
          disc(px, W, H, x, y - 2 * u, 1.8 * u, 0xf0c090)
          rect(px, W, H, x - 2 * u, y - 4 * u, 4 * u + 1, u, 0x2a6ad0)
          dot(px, W, H, x - 0.6 * u, y - 2 * u, 0x101010)
          dot(px, W, H, x + 0.6 * u, y - 2 * u, 0x101010)
          if (t > 40 && t % 30 < 15) {
            line(px, W, H, x - 2 * u, y - 2 * u, x - 4 * u, y - 5 * u, 0xf0c090)
            line(px, W, H, x + 2 * u, y - 2 * u, x + 4 * u, y - 5 * u, 0xf0c090)
          }
          return
        }
        const leg = Math.floor(t / 3) % 2
        rect(px, W, H, x - u, y - 6 * u, 2 * u + 1, 3 * u, 0xd03a3a)
        line(px, W, H, x - 0.5 * u, y - 3 * u, x - u + (leg ? 1 : -1) * u, y - 1, 0x2a3a6a)
        line(px, W, H, x + 0.5 * u, y - 3 * u, x + u + (leg ? -1 : 1) * u, y - 1, 0x2a3a6a)
        disc(px, W, H, x, y - 8 * u, 1.8 * u, 0xf0c090)
        rect(px, W, H, x - 2 * u, y - 10 * u, 4 * u + 1, u, 0x2a6ad0)
        if (phase === 1) {
          line(px, W, H, x - u, y - 5.5 * u, x - 3 * u, y - 8 * u, 0xf0c090)
          line(px, W, H, x + u, y - 5.5 * u, x + 3 * u, y - 8 * u, 0xf0c090)
        }
      }
      if (!buried) drawKid()
      for (const l of leaves) {
        const c = COLS[l.c]
        dot(px, W, H, l.x, l.y, c)
        if (l.rest || Math.sin(l.ph) > 0) dot(px, W, H, l.x + 1, l.y, scale(c, 0.85))
      }
      if (buried) drawKid()
    },
  }
}

export const SEASONS = {
  pumpkins,
  haunted,
  xmaslights,
  sleigh,
  unwrap,
  balldrop,
  dragondance,
  snowman,
  blossoms,
  cauldron,
  bats,
  spiderweb,
  pinata,
  leafpile,
}
