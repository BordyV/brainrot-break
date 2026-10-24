import { dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker, Rng } from '../draw'
import { burst, clamp, ellipse, hash, irand, line, lit, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Fluids, sand & particles: water that finds its level, sand that piles up.

// The cells of the water and sand videos.
const AIR = 0
const ROCK = 1
const WET = 2

/** One pass of water: down, else down a diagonal, else along the way it was going. */
function flowWater(g: Uint8Array, dir: Int8Array, moved: Uint8Array, W: number, H: number, rng: Rng) {
  moved.fill(0)
  for (let y = H - 1; y >= 0; y--) {
    const ltr = (y + irand(rng, 2)) % 2 === 0
    for (let k = 0; k < W; k++) {
      const x = ltr ? k : W - 1 - k
      const i = y * W + x
      if (g[i] !== WET || moved[i]) continue
      const below = y < H - 1 ? i + W : -1
      if (below >= 0 && g[below] === AIR) {
        g[below] = WET
        g[i] = AIR
        moved[below] = 1
        dir[below] = dir[i]
        continue
      }
      const d = dir[i] || (rng() < 0.5 ? 1 : -1)
      let done = false
      if (below >= 0)
        for (const s of [d, -d]) {
          const nx = x + s
          if (nx >= 0 && nx < W && g[below + s] === AIR) {
            g[below + s] = WET
            g[i] = AIR
            moved[below + s] = 1
            dir[below + s] = s
            done = true
            break
          }
        }
      if (done) continue
      for (const s of [d, -d]) {
        const nx = x + s
        if (nx >= 0 && nx < W && g[i + s] === AIR) {
          g[i + s] = WET
          g[i] = AIR
          moved[i + s] = 1
          dir[i + s] = s
          done = true
          break
        }
      }
      if (!done) dir[i] = -d as -1 | 1
    }
  }
}

/** Paints water cells: a bright surface, then deeper and darker. */
function paintWater(px: Uint32Array, g: Uint8Array, W: number, H: number, top = 0xa8e4ff, base = 0x3a94e0, deep = 0x183c8a) {
  for (let x = 0; x < W; x++) {
    let depth = 0
    for (let y = 0; y < H; y++) {
      const i = y * W + x
      if (g[i] === WET) {
        px[i] = depth === 0 ? top : mix(base, deep, Math.min(1, depth / 20))
        depth++
      } else depth = 0
    }
  }
}

/** One pass of sand: down, else down a diagonal. Cells above WET are grains, keeping their colour. */
function flowSand(g: Uint8Array, W: number, H: number, rng: Rng) {
  for (let y = H - 2; y >= 0; y--) {
    const ltr = rng() < 0.5
    for (let k = 0; k < W; k++) {
      const x = ltr ? k : W - 1 - k
      const i = y * W + x
      if (g[i] <= WET) continue
      const b = i + W
      if (g[b] === AIR) {
        g[b] = g[i]
        g[i] = AIR
        continue
      }
      const s = rng() < 0.5 ? 1 : -1
      for (const d of [s, -s]) {
        const nx = x + d
        if (nx >= 0 && nx < W && g[b + d] === AIR && g[i + d] === AIR) {
          g[b + d] = g[i]
          g[i] = AIR
          break
        }
      }
    }
  }
}

// --- dam break ----------------------------------------------------------------------

const dambreak: Maker = (W, H, rng) => {
  const N = W * H
  const g = new Uint8Array(N)
  const dir = new Int8Array(N)
  const moved = new Uint8Array(N)
  const damX = Math.round(W * 0.34)
  const lakeTop = Math.round(H * 0.38)
  const lakeFloor = Math.round(H * 0.8)
  const valley = (x: number) => (x <= damX + 1 ? lakeFloor : Math.round(H * 0.73 + (x - damX) * 0.12))
  const houses = [0.55, 0.72, 0.88].map(f => Math.round(W * f))
  let t = 0
  let debris: Spark[] = []
  const reset = () => {
    g.fill(AIR)
    dir.fill(0)
    for (let x = 0; x < W; x++) for (let y = valley(x); y < H; y++) g[y * W + x] = ROCK
    for (let y = 0; y < H; y++) g[y * W + W - 1] = ROCK
    for (let y = lakeTop - 3; y < lakeFloor; y++) {
      g[y * W + damX] = ROCK
      g[y * W + damX + 1] = ROCK
    }
    for (let y = lakeTop; y < lakeFloor; y++) for (let x = 0; x < damX; x++) g[y * W + x] = WET
    for (const hx of houses) {
      const fy = valley(hx)
      for (let y = fy - 4; y < fy; y++) for (let x = hx - 2; x <= hx + 1; x++) g[y * W + x] = ROCK
    }
    t = 0
    debris = []
  }
  reset()

  return {
    step() {
      t++
      debris = sparks(debris, 0.08)
      // the dam cracks, then gives way from the bottom up
      if (t >= 50 && t < 64) {
        const y = lakeFloor - 1 - (t - 50) * 2
        for (const yy of [y, y - 1])
          if (yy >= lakeTop - 3) {
            g[yy * W + damX] = AIR
            g[yy * W + damX + 1] = AIR
            if (rng() < 0.7) debris.push({ x: damX + 1, y: yy, vx: 0.6 + rng() * 0.8, vy: -rng() * 0.8, l: 25, c: 0x9a9aa4 })
          }
      }
      for (let k = 0; k < 2; k++) flowWater(g, dir, moved, W, H, rng)
      if (t > 260) reset()
    },
    draw(px) {
      sky(px, W, H, 0x5a8ad0, 0xd0e4f0)
      for (let x = 0; x < W; x++) {
        const m = H * 0.3 + Math.sin(x * 0.35) * 2 + Math.sin(x * 0.13) * 3
        for (let y = Math.round(m); y < H; y++) px[y * W + x] = mix(0x7a90b0, 0x5a7090, (y - m) / 20)
      }
      for (let i = 0; i < N; i++) if (g[i] === ROCK) px[i] = 0x6a5a40
      for (let x = 0; x < W; x++) {
        const fy = valley(x)
        for (let y = fy; y < H; y++) px[y * W + x] = y === fy ? 0x7ac04a : y === fy + 1 ? 0x5a9a3a : mix(0x7a6044, 0x4a3828, (y - fy) / 12)
      }
      // the dam: concrete, lit on its face, a crack before it goes
      for (let y = lakeTop - 3; y < lakeFloor; y++) {
        if (g[y * W + damX] !== ROCK) continue
        dot(px, W, H, damX, y, 0xd8d8e0)
        dot(px, W, H, damX + 1, y, 0x9a9aa8)
        if (t > 25 && t < 64 && (y * 7) % 5 === 0 && y > lakeFloor - (t - 25) * 0.6) dot(px, W, H, damX + 1, y, 0x3a3a44)
      }
      // the houses, cream with red roofs and lit windows
      for (const hx of houses) {
        const fy = valley(hx)
        slab(px, W, H, hx - 2, fy - 4, 4, 4, 0xe8dcc0, 0x6a5a40)
        dot(px, W, H, hx - 1, fy - 3, 0xf0d060)
        for (let k = 0; k < 3; k++) rect(px, W, H, hx - 3 + k, fy - 5 - k, 6 - 2 * k, 1, k === 0 ? 0xb83a2a : 0xd84a34)
      }
      paintWater(px, g, W, H)
      for (const s of debris) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- tilting glass ------------------------------------------------------------------

const tiltglass: Maker = (W, H, rng) => {
  const gw = Math.max(6, Math.round(W * 0.44))
  const gh = Math.max(8, Math.round(H * 0.42))
  const bx = W / 2
  const by = Math.round(H * 0.74)
  const level = gh * 0.5
  let a = 0
  let t = 0
  let slope = 0
  let sv = 0
  let bubbles: { u: number; v: number }[] = []
  const hue = rng()

  return {
    step() {
      t++
      // tipped one way, then the other; the water lags behind and sloshes
      a = Math.sin(t * 0.04) * 0.42 * (0.7 + 0.3 * Math.sin(t * 0.011))
      sv += (-Math.tan(a) - slope) * 0.06
      sv *= 0.93
      slope += sv
      if (t % 9 === 0) bubbles.push({ u: (rng() - 0.5) * (gw - 4), v: 2 })
      for (const b of bubbles) b.v += 0.35
      bubbles = bubbles.filter(b => b.v < level + slope * b.u - 1)
    },
    draw(px) {
      sky(px, W, H, hsv(0.08 + hue * 0.1, 0.25, 0.95), hsv(0.07, 0.3, 0.8))
      // a window behind, the table
      slab(px, W, H, W * 0.6, H * 0.1, W * 0.34, H * 0.3, 0xb8dcf0, 0xe8e0d0)
      rect(px, W, H, W * 0.6 + W * 0.17, H * 0.1, 1, H * 0.3, 0xe8e0d0)
      for (let y = by + 3; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === by + 3 ? 0xd8a870 : mix(0xb07a48, 0x7a4e2a, (y - by) / (H - by))
      ellipse(px, W, H, bx, by + 4, gw * 0.55, 1, 0x7a4e2a)
      const c = Math.cos(a)
      const s = Math.sin(a)
      const half = gw / 2
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const dx = x - bx
          const dy = y - by
          const u = dx * c + dy * s
          const v = -(-dx * s + dy * c)
          if (v < 0 || v > gh || Math.abs(u) > half) continue
          const i = y * W + x
          const wall = Math.abs(u) > half - 1 || v < 1.5
          if (wall) {
            px[i] = u < 0 ? 0xe8f4ff : 0xa8c4d8
            continue
          }
          const surf = level + slope * u + Math.sin(u * 0.9 + t * 0.3) * Math.min(1.2, Math.abs(sv) * 8)
          if (v < surf) px[i] = v > surf - 1 ? 0xb8ecff : mix(0x5ab4f0, 0x2a74c8, 1 - v / gh)
          else px[i] = mix(px[i], 0xffffff, 0.25)
          if (Math.abs(u + half - 2.5) < 0.6 && v > 3 && v < gh - 2) px[i] = mix(px[i], 0xffffff, 0.5)
        }
      const P = (u: number, v: number): [number, number] => [bx + u * c + v * s, by + u * s - v * c]
      // ice cubes ride the surface; bubbles rise
      for (const iu of [-half * 0.35, half * 0.3]) {
        const v = level + slope * iu - 1
        const [x, y] = P(iu, v)
        slab(px, W, H, x - 1.5, y - 1.5, 3, 3, 0xe0f4ff)
      }
      for (const b of bubbles) {
        const [x, y] = P(b.u, b.v)
        dot(px, W, H, x, y, 0xd8f4ff)
      }
    },
  }
}

// --- sand art bottle ----------------------------------------------------------------

const SAND_ART = [0xf06a6a, 0xf0a84a, 0xf0e06a, 0x7ad06a, 0x5ac0e0, 0x7a7ae0, 0xd07ad0, 0xf8f0e0]

const sandart: Maker = (W, H, rng) => {
  const N = W * H
  const g = new Uint8Array(N)
  const tone = new Uint8Array(N)
  const cx = Math.floor(W / 2)
  const bw = Math.max(3, Math.round(W * 0.28))
  const neck = Math.max(1, Math.round(W * 0.09))
  const neckTop = 8
  const bodyTop = Math.round(H * 0.36)
  const bottom = H - 6
  const inside = (x: number, y: number) => {
    if (y >= bottom || y < neckTop) return false
    if (y < bodyTop) return Math.abs(x - cx) < neck
    const shoulder = Math.min(1, (y - bodyTop) / 4)
    return Math.abs(x - cx) < neck + (bw - neck) * Math.sqrt(shoulder)
  }
  let t = 0
  let colour = 0
  let full = 0
  let fx: Spark[] = []
  const reset = () => {
    for (let i = 0; i < N; i++) g[i] = inside(i % W, Math.floor(i / W)) ? AIR : ROCK
    colour = irand(rng, SAND_ART.length)
    full = 0
    t = 0
  }
  reset()
  const surface = (x: number) => {
    let y = bodyTop
    while (y < bottom && g[y * W + x] === AIR) y++
    return y
  }

  return {
    step() {
      fx = sparks(fx, 0.04)
      t++
      if (full) {
        if (++full > 70) reset()
        return
      }
      if (t % 45 === 0) colour = (colour + 1 + irand(rng, 2)) % SAND_ART.length
      // the pour tube sweeps inside, just above the sand: that makes the waves
      const tip = Math.round(cx + Math.sin(t * 0.045) * (bw - 2.5))
      const ty = Math.max(bodyTop, surface(tip) - 3)
      for (let k = 0; k < 5; k++) {
        const x = tip + irand(rng, 3) - 1
        if (g[ty * W + x] === AIR) {
          g[ty * W + x] = 3 + colour
          tone[ty * W + x] = irand(rng, 3)
        }
      }
      flowSand(g, W, H, rng)
      flowSand(g, W, H, rng)
      if (surface(cx) <= bodyTop + 1) {
        full = 1
        for (let k = 0; k < 3; k++) burst(fx, rng, cx, neckTop, SAND_ART[irand(rng, 8)], 10, 1)
      }
    },
    draw(px) {
      sky(px, W, H, 0xf8e8d0, 0xe8c8a0)
      for (let y = bottom + 1; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === bottom + 1 ? 0xc89868 : 0xa87850
      ellipse(px, W, H, cx, bottom + 1, bw + 1, 1, 0xa07048)
      for (let i = 0; i < N; i++) {
        const x = i % W
        const y = Math.floor(i / W)
        if (g[i] > WET) {
          const [hi, base, sh] = tones(SAND_ART[g[i] - 3])
          px[i] = [hi, base, sh][tone[i]] ?? base
          px[i] = tone[i] === 0 ? mix(base, hi, 0.4) : tone[i] === 2 ? mix(base, sh, 0.4) : base
        } else if (inside(x, y)) px[i] = mix(px[i], 0xffffff, 0.35)
        // the glass: a pale rim, a long highlight on the left
        else if (inside(x + 1, y) || inside(x - 1, y) || inside(x, y - 1)) px[i] = inside(x + 1, y) ? 0xf0f8ff : 0xb8c8d8
      }
      for (let y = bodyTop + 3; y < bottom - 3; y++) tint(px, W, H, cx - bw + 2, y, 0xffffff, 0.45)
      if (!full) {
        const tip = Math.round(cx + Math.sin(t * 0.045) * (bw - 2.5))
        const ty = Math.max(bodyTop, surface(tip) - 3)
        line(px, W, H, cx, 0, cx, bodyTop - 1, 0xd8d0c8)
        line(px, W, H, cx, bodyTop - 1, tip, ty - 1, 0xd8d0c8)
        dot(px, W, H, tip, ty, SAND_ART[colour])
      } else {
        // the cork
        slab(px, W, H, cx - neck, neckTop - 3, neck * 2, 4, 0xc8945a, 0x6a4422)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- water filling a cave -----------------------------------------------------------

const cavefill: Maker = (W, H, rng) => {
  const N = W * H
  const g = new Uint8Array(N)
  const dir = new Int8Array(N)
  const moved = new Uint8Array(N)
  let open = 0
  let space = 0
  let crystals: [number, number][] = []
  let source = 0
  let t = 0
  const carve = (cx: number, cy: number, rx: number, ry: number) => {
    for (let y = Math.floor(cy - ry); y <= cy + ry; y++)
      for (let x = Math.floor(cx - rx); x <= cx + rx; x++)
        if (x > 0 && x < W - 1 && y > 0 && y < H - 1 && ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1) g[y * W + x] = AIR
  }
  const tunnel = (x0: number, y0: number, x1: number, y1: number, r: number) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0))
    for (let k = 0; k <= n; k++) carve(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, r, r)
  }
  const build = () => {
    g.fill(ROCK)
    dir.fill(0)
    const j = () => (rng() - 0.5) * W * 0.1
    const cs: [number, number, number, number][] = [
      [W * 0.32 + j(), H * 0.22, W * 0.24, H * 0.07],
      [W * 0.66 + j(), H * 0.4, W * 0.25, H * 0.075],
      [W * 0.33 + j(), H * 0.6, W * 0.25, H * 0.075],
      [W * 0.62 + j(), H * 0.8, W * 0.3, H * 0.085],
    ]
    for (const [x, y, rx, ry] of cs) carve(x, y, rx, ry)
    for (let k = 0; k < 3; k++) {
      const [ax, ay, arx, ary] = cs[k]
      const [bx, by, brx, bry] = cs[k + 1]
      const side = bx > ax ? 1 : -1
      tunnel(ax + side * arx * 0.6, ay + ary * 0.5, bx - side * brx * 0.5, by - bry * 0.6, 1.1)
    }
    source = Math.round(cs[0][0])
    tunnel(source, 0, source, cs[0][1] - cs[0][3], 1)
    space = 0
    for (let i = 0; i < N; i++) if (g[i] === AIR && Math.floor(i / W) > cs[0][1] - cs[0][3]) space++
    crystals = []
    for (let k = 0; k < 14 && crystals.length < 4; k++) {
      const x = 1 + irand(rng, W - 2)
      const y = 4 + irand(rng, H - 8)
      if (g[y * W + x] === ROCK && g[(y - 1) * W + x] === AIR) crystals.push([x, y])
    }
    open = 0
    t = 0
  }
  build()

  return {
    step() {
      t++
      let water = 0
      for (let i = 0; i < N; i++) if (g[i] === WET) water++
      if (!open) {
        for (const dx of [0, 1]) if (g[W + source + dx - 1] === AIR) g[W + source + dx - 1] = WET
        if (water > space * 0.97 || t > 1400) open = 1
      } else {
        // the floor gives, and it all drains away
        for (let x = 1; x < W - 1; x++) if (g[(H - 2) * W + x] === WET) g[(H - 2) * W + x] = AIR
        for (let x = 1; x < W - 1; x++) for (let y = H - 2; y > 0; y--) if (g[y * W + x] === AIR) break
        let lowest = H - 2
        for (let y = H - 2; y > 0; y--) if ([...Array(W).keys()].some(x => g[y * W + x] === AIR)) lowest = y
        for (let y = Math.round(H * 0.8); y < H - 1; y++) for (let x = Math.round(W * 0.45); x < Math.round(W * 0.55); x++) g[y * W + x] = g[y * W + x] === ROCK ? AIR : g[y * W + x]
        if (water === 0 && open++ > 20) build()
        void lowest
      }
      for (let k = 0; k < 3; k++) flowWater(g, dir, moved, W, H, rng)
    },
    draw(px) {
      for (let i = 0; i < N; i++) {
        const x = i % W
        const y = Math.floor(i / W)
        if (g[i] === ROCK) {
          const up = y > 0 && g[i - W] !== ROCK
          const down = y < H - 1 && g[i + W] !== ROCK
          const left = x > 0 && g[i - 1] !== ROCK
          px[i] = up || left ? 0x8a6a4a : down ? 0x2a1c14 : hash(x >> 1, y >> 1, 3) < 0.2 ? 0x4a3626 : 0x3e2e20
        } else px[i] = mix(0x1a1418, 0x0e0a0e, y / H)
      }
      for (const [x, y] of crystals) {
        dot(px, W, H, x, y - 1, 0x80f0ff)
        dot(px, W, H, x, y - 2, 0xd0ffff)
        tint(px, W, H, x - 1, y - 1, 0x60c0e0, 0.4)
        tint(px, W, H, x + 1, y - 1, 0x60c0e0, 0.4)
      }
      paintWater(px, g, W, H, 0x9ae0ff, 0x2a8ad0, 0x10306a)
      let water = 0
      for (let i = 0; i < N; i++) if (g[i] === WET) water++
      const pct = `${Math.min(100, Math.round((water / Math.max(1, space)) * 100))}%`
      text(px, W, H, W - 1 - textWidth(pct), H - 6, pct, 0xd0e8ff)
    },
  }
}

// --- sand funnel maze ---------------------------------------------------------------

const sandmaze: Maker = (W, H, rng) => {
  const N = W * H
  const g = new Uint8Array(N)
  const solid = new Uint8Array(N)
  const tone = new Uint8Array(N)
  let gates: { x0: number; x1: number; y: number; period: number; ph: number; open: boolean }[] = []
  let t = 0
  let hue = 0
  let drain = 0
  const put = (x: number, y: number) => {
    x = Math.round(x)
    y = Math.round(y)
    if (x >= 0 && x < W && y >= 0 && y < H) solid[y * W + x] = 1
  }
  const build = () => {
    solid.fill(0)
    g.fill(AIR)
    // a hopper at the top, ramps that zigzag, a second funnel, a jar
    const funnel = (cy: number, half: number, gapHalf: number) => {
      for (let k = 0; k < half - gapHalf; k++) {
        put(W / 2 - half + k, cy + k)
        put(W / 2 + half - k - 1, cy + k)
      }
      return cy + half - gapHalf
    }
    const g1 = funnel(7, Math.round(W * 0.32), 2)
    gates = [{ x0: Math.round(W / 2 - 2), x1: Math.round(W / 2 + 1), y: g1 + 1, period: 70, ph: 0, open: false }]
    const slope = 0.75
    const r1 = g1 + 4
    for (let x = 0; x < Math.round(W * 0.72); x++) put(x, r1 + Math.round((x - W * 0.2) * slope))
    const r2 = r1 + Math.round(W * 0.52 * slope) + 4
    for (let x = W - 1; x > Math.round(W * 0.28); x--) put(x, r2 + Math.round((W * 0.8 - x) * slope))
    for (let y = 0; y < r2; y++) put(W - 1, y)
    const g2 = r2 + Math.round(W * 0.52 * slope) + 2
    gates.push({ x0: 0, x1: Math.round(W * 0.28), y: g2, period: 90, ph: 30, open: false })
    const jar = g2 + 4
    for (let y = jar; y < H; y++) {
      put(2, y)
      put(W - 3, y)
    }
    for (let x = 2; x < W - 2; x++) put(x, H - 1)
    drain = 0
  }
  build()

  return {
    step() {
      t++
      if (t % 60 === 0) hue = (hue + 0.13) % 1
      for (const gt of gates) gt.open = (t + gt.ph) % gt.period < gt.period * 0.45
      // sand rains into the hopper
      for (let k = 0; k < 3; k++) {
        const x = Math.round(W / 2 + (rng() - 0.5) * W * 0.3)
        if (g[2 * W + x] === AIR) {
          g[2 * W + x] = 3 + Math.floor(hue * 20)
          tone[2 * W + x] = irand(rng, 3)
        }
      }
      for (let i = 0; i < N; i++) if (solid[i]) g[i] = ROCK
      for (const gt of gates) for (let x = gt.x0; x <= gt.x1; x++) g[gt.y * W + x] = gt.open ? (g[gt.y * W + x] === ROCK ? AIR : g[gt.y * W + x]) : g[gt.y * W + x] > WET ? g[gt.y * W + x] : ROCK
      flowSand(g, W, H, rng)
      // the jar is full: its floor opens
      let level = H
      for (let y = H - 2; y > 0; y--) if (g[y * W + Math.floor(W / 2)] > WET) level = y
      if (level < H * 0.82 && !drain) drain = 1
      if (drain) {
        for (let x = 3; x < W - 3; x++) {
          g[(H - 1) * W + x] = AIR
          solid[(H - 1) * W + x] = 0
          if (g[(H - 2) * W + x] > WET) g[(H - 2) * W + x] = AIR
        }
        if (++drain > 80) {
          drain = 0
          for (let x = 2; x < W - 2; x++) solid[(H - 1) * W + x] = 1
        }
      }
      flowSand(g, W, H, rng)
    },
    draw(px) {
      sky(px, W, H, 0x2a2440, 0x3a2e48)
      for (let i = 0; i < N; i++) {
        const v = g[i]
        if (v > WET && !solid[i]) {
          const c = hsv((v - 3) / 20, 0.55, 0.95)
          px[i] = tone[i] === 0 ? mix(c, 0xffffff, 0.25) : tone[i] === 2 ? scale(c, 0.8) : c
        } else if (solid[i]) {
          const x = i % W
          const y = Math.floor(i / W)
          px[i] = y > 0 && !solid[i - W] ? 0xd8a868 : 0x8a5a30
          if (x > 0 && !solid[i - 1] && y > 0 && solid[i - W]) px[i] = 0xb8884e
        }
      }
      for (const gt of gates)
        for (let x = gt.x0 - 1; x <= gt.x1 + 1; x++) {
          if (gt.open) {
            dot(px, W, H, gt.x0 - 2, gt.y + (x - gt.x0), 0xe04040)
          } else dot(px, W, H, x, gt.y, 0xe04040)
        }
    },
  }
}

// --- snow globe ---------------------------------------------------------------------

const snowglobe: Maker = (W, H, rng) => {
  const cx = W / 2
  const R = Math.min(W * 0.44, H * 0.3)
  const cy = Math.round(H * 0.48)
  const groundY = cy + R * 0.45
  type Flake = { x: number; y: number; vx: number; vy: number }
  let flakes: Flake[] = []
  let settled = 0
  let t = 0
  let shake = 0
  let ox = 0
  for (let k = 0; k < 70; k++) flakes.push({ x: cx + (rng() - 0.5) * R * 1.4, y: groundY - rng() * 2, vx: 0, vy: 0 })

  return {
    step() {
      t++
      // a shake every eleven seconds, then the long settle
      if (t % 220 === 20) shake = 22
      if (shake > 0) {
        shake--
        ox = Math.sin(shake * 1.3) * 2 * (shake / 26)
        for (const f of flakes) {
          f.vx += (rng() - 0.5) * 0.9 + ox * 0.1
          f.vy -= rng() * 0.3
        }
        settled = 0
      } else ox = 0
      for (const f of flakes) {
        f.vx *= 0.9
        f.vy = f.vy * 0.9 + 0.02
        f.x += f.vx + Math.sin((t + f.y * 10) * 0.05) * 0.04
        f.y += f.vy
        const dx = f.x - cx
        const dy = f.y - cy
        const d = Math.hypot(dx, dy)
        if (d > R - 1.5) {
          f.x = cx + (dx / d) * (R - 1.5)
          f.y = cy + (dy / d) * (R - 1.5)
          f.vx *= -0.3
          f.vy *= -0.3
        }
        if (f.y > groundY) {
          f.y = groundY
          f.vx = 0
          f.vy = 0
        }
      }
      settled = flakes.filter(f => Math.abs(f.vy) < 0.03 && Math.abs(f.vx) < 0.03 && f.y > cy).length
    },
    draw(px) {
      // a cosy room with soft lights behind
      sky(px, W, H, 0x2a1e30, 0x3a2a3a)
      for (const [x, y, c] of [[0.15, 0.15, 0xf0c060], [0.85, 0.25, 0xf08a60], [0.7, 0.08, 0xa0c0f0]] as [number, number, number][])
        for (let k = 0; k < 3; k++) for (let a = 0; a < 6; a++) tint(px, W, H, x * W + Math.cos(a) * k, y * H + Math.sin(a) * k, c, 0.3)
      const gx = cx + ox
      // the wooden base
      slab(px, W, H, gx - R * 0.8, cy + R * 0.75, R * 1.6, R * 0.5, 0x8a4a2a, 0x3a1a0a)
      rect(px, W, H, gx - R * 0.7, cy + R * 0.95, R * 1.4, 1, 0xd8a040)
      for (let y = Math.floor(cy - R); y <= cy + R; y++)
        for (let x = Math.floor(gx - R); x <= gx + R; x++) {
          const d = Math.hypot(x - gx, y - cy)
          if (d > R || y > cy + R * 0.8) continue
          const i = y * W + x
          if (x < 0 || x >= W || y < 0 || y >= H) continue
          // inside: a night sky, a snowy hill
          px[i] = y > groundY ? (y < groundY + 1 ? 0xffffff : 0xd8e8f8) : mix(0x2a3a7a, 0x4a5aa0, (y - cy + R) / (2 * R))
          if (d > R - 1) px[i] = x < gx ? 0xc8e0f8 : 0x6a7a9a
        }
      // a house with a lit window and a pine tree
      const hx = gx - R * 0.25
      slab(px, W, H, hx - 3, groundY - 4, 6, 4, 0xb85a3a, 0x4a1a0a)
      for (let k = 0; k < 3; k++) rect(px, W, H, hx - 4 + k, groundY - 5 - k, 8 - 2 * k, 1, 0xffffff)
      dot(px, W, H, hx, groundY - 2, 0xffd860)
      const tx = gx + R * 0.35
      for (let k = 0; k < 4; k++) rect(px, W, H, tx - k, groundY - 7 + k * 2, 2 * k + 1, 2, k % 2 ? 0x2a7a3a : 0x3a9a4a)
      dot(px, W, H, tx, groundY - 8, 0xffe060)
      for (const f of flakes) {
        const x = f.x + ox
        if (Math.hypot(x - gx, f.y - cy) < R - 1) dot(px, W, H, x, f.y, 0xffffff)
      }
      // the glass highlight
      for (let a = 0; a < 10; a++) dot(px, W, H, gx + Math.cos(3.6 + a * 0.08) * (R - 2.5), cy + Math.sin(3.6 + a * 0.08) * (R - 2.5), 0xf0f8ff)
      const pct = `${Math.round((settled / flakes.length) * 100)}%`
      text(px, W, H, 1, 1, pct, 0xe0d0e8)
    },
  }
}

// --- canal lock ---------------------------------------------------------------------

const canallock: Maker = (W, H, rng) => {
  const low = Math.round(H * 0.68)
  const high = Math.round(H * 0.5)
  const gA = Math.round(W * 0.3)
  const gB = Math.round(W * 0.7)
  const bed = H - 4
  let level = low
  let boat = -10
  let goingUp = true
  let phase = 0
  let t = 0
  let gateA = 1
  let gateB = 0
  let jets: Spark[] = []
  const hue = rng()
  // the steps of one trip: in, close behind, level, open ahead, out
  const STEPS = ['enter', 'close', 'level', 'open', 'leave'] as const

  return {
    step() {
      t++
      jets = sparks(jets, 0.1)
      const step = STEPS[phase]
      const behind = goingUp ? 'A' : 'B'
      const target = goingUp ? high : low
      const speed = 0.3
      if (step === 'enter') {
        const stop = (gA + gB) / 2
        boat += goingUp ? speed : -speed
        if (goingUp ? boat >= stop : boat <= stop) {
          boat = stop
          phase++
        }
      } else if (step === 'close') {
        if (behind === 'A') gateA = Math.max(0, gateA - 0.05)
        else gateB = Math.max(0, gateB - 0.05)
        if ((behind === 'A' ? gateA : gateB) <= 0) phase++
      } else if (step === 'level') {
        // the sluice: water spouts through the gate ahead, or out of the one behind
        level += Math.sign(target - level) * 0.06
        const gx = goingUp ? gB : gA
        if (t % 2 === 0) jets.push({ x: gx + (goingUp ? -1 : -1), y: goingUp ? high + 3 : level + 2, vx: goingUp ? -0.7 - rng() * 0.3 : -0.8, vy: -0.2, l: 14, c: 0xd0f0ff })
        if (Math.abs(level - target) < 0.1) {
          level = target
          phase++
        }
      } else if (step === 'open') {
        if (goingUp) gateB = Math.min(1, gateB + 0.05)
        else gateA = Math.min(1, gateA + 0.05)
        if ((goingUp ? gateB : gateA) >= 1) phase++
      } else if (step === 'leave') {
        boat += goingUp ? speed : -speed
        if (boat > W + 12 || boat < -12) {
          goingUp = !goingUp
          phase = 0
          boat = goingUp ? -10 : W + 10
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x6aa8e0, 0xd8ecf8)
      for (let x = 0; x < W; x++) {
        const h = H * 0.32 + Math.sin(x * 0.4) * 1.5
        for (let y = Math.round(h); y < H; y++) px[y * W + x] = 0x7ab070
      }
      // the banks: low on the left, high on the right, the lock walls between
      const bank = (x0: number, x1: number, top: number) => {
        for (let y = top; y < H; y++) for (let x = x0; x < x1; x++) px[y * W + x] = y === top ? 0x8ad060 : y === top + 1 ? 0x5a9a3a : mix(0x8a7a6a, 0x5a4a3e, (y - top) / 20)
      }
      bank(0, W, high - 3)
      // the water, its level in each part
      const water = (x0: number, x1: number, top: number) => {
        for (let y = Math.round(top); y < bed; y++)
          for (let x = x0; x < x1; x++) px[y * W + x] = y === Math.round(top) ? 0xa8e0f8 : (x * 3 + y * 5 + Math.floor(t / 4)) % 17 === 0 ? 0x5ab0e8 : mix(0x3a8ad0, 0x1a4a8a, (y - top) / 16)
      }
      water(0, gA, low)
      water(gA + 1, gB, level)
      water(gB + 1, W, high)
      for (let y = bed; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = 0x5a4a3a
      // brick walls of the chamber
      for (let y = high - 2; y < H; y++)
        for (const x of [gA, gB]) if (y % 3 === 0) dot(px, W, H, x, y, 0x6a5040)
      // the gates: wooden, they rise on their frames to open
      const gate = (x: number, open: number) => {
        const lift = Math.round(open * (bed - high + 4))
        slab(px, W, H, x - 1, high - 6 - lift, 3, bed - high + 6, 0x8a5a30, 0x3a2414)
        rect(px, W, H, x - 2, high - 9, 5, 1, 0x4a4a52)
        rect(px, W, H, x - 2, high - 9, 1, 4, 0x4a4a52)
        rect(px, W, H, x + 2, high - 9, 1, 4, 0x4a4a52)
      }
      gate(gA, gateA)
      gate(gB, gateB)
      for (const j of jets) dot(px, W, H, j.x, j.y, j.c)
      // the boat: a narrowboat with a cabin and a chimney
      const wl = boat < gA ? low : boat > gB ? high : level
      const bx = Math.round(boat - 5)
      const by = Math.round(wl) - 2
      const hull = hsv(hue, 0.6, 0.7)
      slab(px, W, H, bx, by, 10, 3, hull, tones(hull)[3])
      rect(px, W, H, bx + 1, by + 2, 8, 1, 0x1a1a20)
      slab(px, W, H, bx + 2, by - 2, 6, 2, 0xe8d8b0, 0x5a4a30)
      dot(px, W, H, bx + 3, by - 1, 0x3a5a8a)
      dot(px, W, H, bx + 6, by - 1, 0x3a5a8a)
      rect(px, W, H, bx + (goingUp ? 7 : 2), by - 4, 1, 2, 0x2a2a30)
      if (t % 30 < 20) dot(px, W, H, bx + (goingUp ? 7 : 2), by - 6 - (t % 30) / 10, 0xd0d0d8)
    },
  }
}

// --- fizzy pour ---------------------------------------------------------------------

const fizzypour: Maker = (W, H, rng) => {
  const gw = Math.max(6, Math.round(W * 0.46))
  const gx = Math.round((W - gw) / 2)
  const gTop = Math.round(H * 0.32)
  const gBot = Math.round(H * 0.84)
  let liquid = 0
  let foam = 0
  let pour = 1
  let t = 0
  let drips: { x: number; y: number; len: number }[] = []
  let bubbles: Spark[] = []
  let over = 0
  const hue = rng()
  const reset = () => {
    liquid = 0
    foam = 0
    pour = 1
    t = 0
    drips = []
    over = 0
  }
  reset()
  const depth = gBot - gTop

  return {
    step() {
      t++
      if (pour) {
        liquid += 0.09
        foam = Math.min(foam + 0.16, 9 + liquid * 0.3)
        if (liquid + foam > depth + 2) {
          // over the brim: it runs down the sides
          pour = 0
          over = 1
          for (const x of [gx - 1, gx + gw]) for (let k = 0; k < 2; k++) drips.push({ x: x + (x < W / 2 ? -k : k), y: gTop, len: 0 })
        }
      } else {
        foam = Math.max(2, foam - 0.03)
        liquid = Math.min(liquid + 0.012, depth - 3)
        for (const d of drips) if (d.len < H - gTop - 8) d.len += 0.25 + (d.x % 2) * 0.1
        if (++over > 230) reset()
      }
      if (t % 3 === 0 && liquid > 1) bubbles.push({ x: gx + 1 + irand(rng, gw - 2), y: gBot - 1, vx: 0, vy: -0.3 - rng() * 0.3, l: 60, c: 0xd8b088 })
      bubbles = bubbles.filter(b => {
        b.y += b.vy
        return b.y > gBot - liquid
      })
    },
    draw(px) {
      sky(px, W, H, 0xe85a4a, 0xf0a060)
      for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x++) if ((x + y) % 8 === 0) px[y * W + x] = mix(px[y * W + x], 0xffffff, 0.15)
      const tableY = gBot + 2
      for (let y = tableY; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === tableY ? 0xf0e8f0 : 0xd0c8d8
      // the glass, the drink, the head of foam
      const cola = hsv(0.05 + hue * 0.03, 0.85, 0.35)
      const lTop = gBot - liquid
      const fTop = Math.max(gTop - 2, lTop - foam)
      for (let y = gTop; y <= gBot; y++)
        for (let x = gx; x < gx + gw; x++) {
          const i = y * W + x
          if (x === gx || x === gx + gw - 1 || y === gBot) {
            px[i] = x === gx ? 0xffffff : 0xc8d0e0
            continue
          }
          if (y >= lTop) px[i] = x < gx + 3 ? mix(cola, 0xffffff, 0.15) : mix(cola, 0x100404, (y - lTop) / depth * 0.4)
          else if (y >= fTop) px[i] = (x * 5 + y * 3) % 7 === 0 ? 0xd8c0a0 : y < fTop + 1 ? 0xfff4e0 : 0xf0e0c8
          else px[i] = mix(px[i], 0xffffff, 0.3)
        }
      // foam on top of the brim, rounded, and running down
      if (fTop < gTop) {
        for (let x = gx - 1; x <= gx + gw; x++) {
          const bump = Math.round(Math.sin(x * 1.3) * 0.7)
          for (let y = Math.round(fTop) + bump; y < gTop + 1; y++) dot(px, W, H, x, y, y === Math.round(fTop) + bump ? 0xffffff : 0xf0e0c8)
        }
      }
      for (const d of drips) for (let k = 0; k < d.len; k++) dot(px, W, H, d.x, gTop + k, k > d.len - 1.5 ? 0xffffff : 0xf0e0c8)
      for (const b of bubbles) dot(px, W, H, b.x, b.y, b.c)
      // the bottle, tipped over the glass
      if (pour) {
        const bx = gx + gw * 0.35
        const sy = gTop - 6
        for (let y = sy; y < lTop - foam; y++) dot(px, W, H, bx + Math.sin(y * 0.8 + t) * 0.4, y, mix(cola, 0xffffff, 0.2))
        line(px, W, H, bx - 1, sy - 1, bx - 8, sy - 9, 0x2a6a3a)
        line(px, W, H, bx, sy - 1, bx - 7, sy - 9, 0x3a8a4a)
        line(px, W, H, bx + 1, sy - 1, bx - 6, sy - 9, 0x1a4a2a)
        for (let k = 0; k < 3; k++) line(px, W, H, bx - 6 - k, sy - 8 - k, bx - 12 - k, sy - 14 - k, k === 1 ? 0x3a9a4a : 0x2a6a3a)
      }
    },
  }
}

export const FLUIDS = {
  dambreak,
  tiltglass,
  sandart,
  cavefill,
  sandmaze,
  snowglobe,
  canallock,
  fizzypour,
}
