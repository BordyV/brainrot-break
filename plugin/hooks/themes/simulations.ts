import { dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, clamp, ellipse, hash, irand, line, lit, poly, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Simulations & emergence: simple rules, surprising crowds.

// --- falling sand world -----------------------------------------------------------

const EMPTY = 0
const SAND = 1
const WATER = 2
const STONE = 3
const WOOD = 4
const FIRE = 5
const STEAM = 6

const powder: Maker = (W, H, rng) => {
  const N = W * H
  const mat = new Uint8Array(N)
  const life = new Uint8Array(N)
  const tone = new Uint8Array(N)
  const moved = new Uint8Array(N)
  let t = 0
  let variant = 0

  const put = (x: number, y: number, m: number) => {
    if (x < 0 || x >= W || y < 0 || y >= H) return
    const i = y * W + x
    mat[i] = m
    tone[i] = irand(rng, 3)
    life[i] = m === FIRE ? 20 + irand(rng, 30) : m === STEAM ? 20 + irand(rng, 20) : 0
  }
  // a level: stone ledges, a basin, and a wooden tree to burn
  const build = () => {
    mat.fill(EMPTY)
    const mirror = variant % 2 === 1
    const X = (x: number) => (mirror ? W - 1 - x : x)
    // two ledges that hand everything on, down to the right-hand basin
    const ly = Math.round(H * 0.3)
    for (let x = 0; x < Math.round(W * 0.5); x++) {
      put(X(x), ly + Math.round(x * 0.35), STONE)
      put(X(x), ly + Math.round(x * 0.35) + 1, STONE)
    }
    const ry = Math.round(H * 0.5)
    for (let x = Math.round(W * 0.3); x < W - 5; x++) {
      put(X(x), ry + Math.round((x - W * 0.3) * 0.3), STONE)
      put(X(x), ry + Math.round((x - W * 0.3) * 0.3) + 1, STONE)
    }
    const by = H - 1
    for (let x = 0; x < W; x++) put(x, by, STONE)
    for (let y = Math.round(H * 0.82); y < H; y++) put(X(Math.round(W * 0.5)), y, STONE)
    // the tree, in the dry half of the basin
    const tx = X(Math.round(W * 0.22))
    for (let y = Math.round(H * 0.8); y < by; y++) put(tx, y, WOOD)
    for (let y = Math.round(H * 0.7); y < Math.round(H * 0.82); y++)
      for (let dx = -3; dx <= 3; dx++) if (Math.abs(dx) + Math.abs(y - H * 0.76) * 0.8 < 4) put(tx + dx, y, WOOD)
  }
  build()

  const swap = (i: number, j: number) => {
    const m = mat[i]
    mat[i] = mat[j]
    mat[j] = m
    const tn = tone[i]
    tone[i] = tone[j]
    tone[j] = tn
    const l = life[i]
    life[i] = life[j]
    life[j] = l
    moved[j] = 1
  }

  return {
    step() {
      t++
      // pour: sand from one side, water from the other, then a spark
      const sx = Math.round(W * (variant % 2 ? 0.75 : 0.25))
      if (t < 260 && t % 2 === 0) put(sx + irand(rng, 3) - 1, 0, SAND)
      if (t > 120 && t < 330) put(W - 1 - sx + irand(rng, 3) - 1, 0, WATER)
      if (t === 380) {
        const tx = variant % 2 ? W - 1 - Math.round(W * 0.22) : Math.round(W * 0.22)
        for (let y = H - 2; y > 0; y--)
          if (mat[y * W + tx] === WOOD && mat[(y - 1) * W + tx] !== WOOD) {
            put(tx, y - 1, FIRE)
            break
          }
      }
      if (t > 640) {
        variant++
        build()
        t = 0
      }

      moved.fill(0)
      const flip = t % 2 === 0
      for (let y = H - 1; y >= 0; y--)
        for (let k = 0; k < W; k++) {
          const x = flip ? k : W - 1 - k
          const i = y * W + x
          if (moved[i]) continue
          const m = mat[i]
          if (m === SAND || m === WATER) {
            if (y === H - 1) continue
            const below = i + W
            const d = rng() < 0.5 ? -1 : 1
            const canSink = (j: number) => mat[j] === EMPTY || (m === SAND && mat[j] === WATER) || mat[j] === STEAM
            if (canSink(below)) swap(i, below)
            else if (x + d >= 0 && x + d < W && canSink(below + d)) swap(i, below + d)
            else if (x - d >= 0 && x - d < W && canSink(below - d)) swap(i, below - d)
            else if (m === WATER) {
              if (x + d >= 0 && x + d < W && mat[i + d] === EMPTY) swap(i, i + d)
              else if (x - d >= 0 && x - d < W && mat[i - d] === EMPTY) swap(i, i - d)
            }
          } else if (m === FIRE) {
            // burn the wood around, boil the water around, die out
            for (let n = 0; n < 4; n++) {
              const nx = x + [1, -1, 0, 0][n]
              const ny = y + [0, 0, 1, -1][n]
              if (nx < 0 || nx >= W || ny < 0 || ny >= H) continue
              const j = ny * W + nx
              if (mat[j] === WOOD && rng() < 0.09) {
                put(nx, ny, FIRE)
                moved[j] = 1
              } else if (mat[j] === WATER && rng() < 0.3) {
                put(nx, ny, STEAM)
                life[i] = 0
              }
            }
            if (y > 0 && mat[i - W] === EMPTY && rng() < 0.08) {
              put(x, y - 1, FIRE)
              life[i - W] = 3 + irand(rng, 4)
              moved[i - W] = 1
            }
            if (life[i] > 0) life[i]--
            else mat[i] = rng() < 0.4 ? STEAM : EMPTY
            if (mat[i] === STEAM) life[i] = 10 + irand(rng, 10)
          } else if (m === STEAM) {
            if (life[i] > 0) life[i]--
            else {
              mat[i] = EMPTY
              continue
            }
            if (y === 0) continue
            const d = irand(rng, 3) - 1
            const j = i - W + (x + d >= 0 && x + d < W ? d : 0)
            if (mat[j] === EMPTY) swap(i, j)
          }
        }
    },
    draw(px) {
      const SANDS = [0xe6c27a, 0xd9b46a, 0xf0cf8a]
      const WATERS = [0x3a7bd5, 0x3472c8, 0x4a8be5]
      for (let i = 0; i < N; i++) {
        const m = mat[i]
        const tn = tone[i]
        let c: number
        if (m === EMPTY) c = 0x161620
        else if (m === SAND) c = SANDS[tn]
        else if (m === WATER) c = WATERS[(tn + (t >> 3)) % 3]
        else if (m === STONE) c = tn === 0 ? 0x5c5c6c : 0x6c6c7c
        else if (m === WOOD) c = tn === 0 ? 0x7a4a22 : 0x8a5a2a
        else if (m === FIRE) c = life[i] > 15 ? 0xffe060 : life[i] > 6 ? 0xff8a20 : 0xd83a1a
        else c = mix(0x161620, 0xc8d0e0, Math.min(1, life[i] / 12))
        // a lit surface where the grain has nothing above it, a darker underside where nothing holds it below
        if (m !== EMPTY && m !== FIRE && m !== STEAM) {
          if (i < W || mat[i - W] === EMPTY) c = mix(c, 0xfff8ee, 0.3)
          else if (i + W < N && mat[i + W] === EMPTY) c = scale(c, 0.75)
        }
        px[i] = c
      }
      if (t > 600) rect(px, W, H, 0, 0, W, Math.round(((t - 600) / 40) * H), 0x161620)
    },
  }
}

// --- phantom traffic jam ----------------------------------------------------------

const phantomjam: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = (H - 1) / 2
  const rx = W / 2 - 2.5
  const ry = H / 2 - 4
  // the ring's points, evenly spaced along its length
  const pts: [number, number][] = []
  {
    const raw: [number, number][] = []
    for (let k = 0; k < 2000; k++) {
      const a = (k / 2000) * Math.PI * 2
      raw.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry])
    }
    let len = 0
    const acc = [0]
    for (let k = 1; k <= raw.length; k++) {
      const [x0, y0] = raw[k - 1]
      const [x1, y1] = raw[k % raw.length]
      len += Math.hypot(x1 - x0, y1 - y0)
      acc.push(len)
    }
    const P = Math.round(len)
    let j = 0
    for (let s = 0; s < P; s++) {
      while (acc[j + 1] < (s / P) * len) j++
      pts.push(raw[j % raw.length])
    }
  }
  const P = pts.length
  const n = Math.max(5, Math.round(P / 9))
  const V0 = 0.55
  const LEN = 2
  let s: number[] = []
  let v: number[] = []
  const spread = () => {
    s = Array.from({ length: n }, (_, i) => (i * P) / n)
    v = Array.from({ length: n }, () => V0 * 0.9)
  }
  spread()

  // the space-time picture inside the ring: one row per moment, scrolling down
  const ix = Math.round(cx - rx * 0.62)
  const iw = Math.max(4, Math.round(rx * 1.24))
  const iy = Math.round(cy - ry * 0.72)
  const ih = Math.max(4, Math.round(ry * 1.44))
  const hist = new Uint32Array(iw * ih)
  const DARK = 0x1c2a1c

  let t = 0
  let braking = -1
  let brakeT = 0
  const speedColour = (k: number) => (k < 0.35 ? mix(0xd02a2a, 0xf08a20, k / 0.35) : k < 0.7 ? mix(0xf08a20, 0xf0d030, (k - 0.35) / 0.35) : mix(0xf0d030, 0x40d060, (k - 0.7) / 0.3))

  return {
    step() {
      t++
      if (t % 220 === 60) {
        braking = irand(rng, n)
        brakeT = 10
      }
      if (t > 900) {
        t = 0
        spread()
      }
      const acc: number[] = []
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n
        let gap = s[j] - s[i] - LEN
        if (gap < 0) gap += P
        const dv = v[i] - v[j]
        const want = 1.5 + v[i] * 9 + (v[i] * dv) / (2 * Math.sqrt(0.02 * 0.05))
        acc.push(0.02 * (1 - (v[i] / V0) ** 4 - (Math.max(0, want) / Math.max(0.1, gap)) ** 2))
      }
      for (let i = 0; i < n; i++) {
        v[i] = Math.max(0, Math.min(V0, v[i] + acc[i]))
        if (i === braking && brakeT > 0) v[i] = Math.max(0, v[i] - 0.15)
        s[i] = (s[i] + v[i]) % P
      }
      if (brakeT > 0) brakeT--
      if (t % 2 === 0) {
        // each spot of the road takes the speed of the next car ahead of it
        hist.copyWithin(iw, 0, iw * (ih - 1))
        for (let x = 0; x < iw; x++) {
          const at = ((x + 0.5) / iw) * P
          let best = Infinity
          let k = 0
          for (let i = 0; i < n; i++) {
            const ahead = (s[i] - at + P) % P
            if (ahead < best) {
              best = ahead
              k = i
            }
          }
          hist[x] = speedColour(v[k] / V0)
        }
      }
    },
    draw(px) {
      // grass with a little texture, then the road: a lit outer kerb, asphalt, a dark inner kerb
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 3) % 7 === 0 ? 0x3a6a32 : (x * 5 + y) % 11 === 0 ? 0x26502a : 0x2e5a2a
      for (let k = 0; k < P; k++) {
        const [x, y] = pts[k]
        const ox = (x - cx) / rx
        const oy = (y - cy) / ry
        const d = Math.hypot(ox, oy) || 1
        for (let r = -2; r <= 2; r += 0.5) {
          const qx = Math.round(x + (ox / d) * r)
          const qy = Math.round(y + (oy / d) * r)
          if (qx >= 0 && qx < W && qy >= 0 && qy < H) px[qy * W + qx] = r > 1.6 ? 0x8a8a94 : r < -1.6 ? 0x2a2a30 : 0x4a4a52
        }
      }
      // the infield shows the history: jams are the red stripes running backwards
      rect(px, W, H, ix - 1, iy - 1, iw + 2, ih + 2, 0x1a2616)
      rect(px, W, H, ix - 1, iy + ih, iw + 2, 1, 0x3a4a34)
      for (let y = 0; y < ih; y++)
        for (let x = 0; x < iw; x++) {
          const c = hist[y * iw + x]
          px[(iy + y) * W + ix + x] = c || DARK
        }
      // cars: a lit roof corner, the colour of their speed, a darker back corner
      for (let i = 0; i < n; i++) {
        const [x, y] = pts[Math.floor(s[i]) % P]
        const c = i === braking && brakeT > 0 ? 0xffffff : speedColour(v[i] / V0)
        const X = Math.round(x) - 1
        const Y = Math.round(y) - 1
        rect(px, W, H, X, Y, 2, 2, c)
        dot(px, W, H, X, Y, mix(c, 0xffffff, 0.4))
        dot(px, W, H, X + 1, Y + 1, scale(c, 0.65))
      }
    },
  }
}

// --- particle life ------------------------------------------------------------------

const LIFE_COLOURS = [0xff5a6a, 0x4ac8ff, 0xffd24a, 0x7aff6a]

const particlelife: Maker = (W, H, rng) => {
  const K = 4
  const N = Math.max(24, Math.round((W * H) / 22))
  const xs = new Float32Array(N)
  const ys = new Float32Array(N)
  const vx = new Float32Array(N)
  const vy = new Float32Array(N)
  const kind = new Uint8Array(N)
  const rmax = Math.max(5, Math.min(W, H) * 0.32)
  let rules: number[][] = []
  let t = 0
  const newRules = () => {
    rules = [...Array(K)].map(() => [...Array(K)].map(() => rng() * 2 - 1))
    // each colour likes its own a little, so creatures hold together
    for (let k = 0; k < K; k++) rules[k][k] = 0.3 + rng() * 0.7
  }
  newRules()
  for (let i = 0; i < N; i++) {
    xs[i] = rng() * W
    ys[i] = rng() * H
    kind[i] = i % K
  }
  // close up they always push apart; further out, the rule pulls or pushes
  const force = (r: number, a: number) => {
    const beta = 0.3
    if (r < beta) return r / beta - 1
    return a * (1 - Math.abs(2 * r - 1 - beta) / (1 - beta))
  }

  return {
    step() {
      t++
      if (t % 330 === 0) newRules()
      for (let i = 0; i < N; i++) {
        let fx = 0
        let fy = 0
        const row = rules[kind[i]]
        for (let j = 0; j < N; j++) {
          if (j === i) continue
          let dx = xs[j] - xs[i]
          let dy = ys[j] - ys[i]
          if (dx > W / 2) dx -= W
          else if (dx < -W / 2) dx += W
          if (dy > H / 2) dy -= H
          else if (dy < -H / 2) dy += H
          const r = Math.hypot(dx, dy)
          if (r <= 0 || r >= rmax) continue
          const f = force(r / rmax, row[kind[j]])
          fx += (dx / r) * f
          fy += (dy / r) * f
        }
        vx[i] = vx[i] * 0.8 + fx * 0.09
        vy[i] = vy[i] * 0.8 + fy * 0.09
        const sp = Math.hypot(vx[i], vy[i])
        if (sp > 1.2) {
          vx[i] *= 1.2 / sp
          vy[i] *= 1.2 / sp
        }
      }
      for (let i = 0; i < N; i++) {
        xs[i] = (xs[i] + vx[i] + W) % W
        ys[i] = (ys[i] + vy[i] + H) % H
      }
    },
    draw(px) {
      sky(px, W, H, 0x100c20, 0x080614)
      for (let y = 0; y < H; y += 8) for (let x = 0; x < W; x++) px[y * W + x] = 0x120e24
      for (let x = 0; x < W; x += 8) for (let y = 0; y < H; y++) px[y * W + x] = 0x120e24
      for (let i = 0; i < N; i++) {
        const [hi, base, sh] = tones(LIFE_COLOURS[kind[i]])
        const x = Math.floor(xs[i])
        const y = Math.floor(ys[i])
        dot(px, W, H, x, y, hi)
        dot(px, W, H, (x + 1) % W, y, base)
        dot(px, W, H, x, (y + 1) % H, base)
        dot(px, W, H, (x + 1) % W, (y + 1) % H, sh)
      }
      // the rules, as the apps show them: green pulls, red pushes
      if (W >= 20) {
        rect(px, W, H, 0, 0, K * 2 + 4, K * 2 + 4, 0x08060e)
        for (let k = 0; k < K; k++) {
          rect(px, W, H, 2 + k * 2, 0, 2, 1, LIFE_COLOURS[k])
          rect(px, W, H, 0, 2 + k * 2, 1, 2, LIFE_COLOURS[k])
          for (let j = 0; j < K; j++) {
            const a = rules[k][j]
            rect(px, W, H, 2 + j * 2, 2 + k * 2, 2, 2, a > 0 ? mix(0x102010, 0x40e060, a) : mix(0x201010, 0xe04040, -a))
          }
        }
      }
    },
  }
}

// --- genetic cars -------------------------------------------------------------------

type Genes = { r1: number; r2: number; len: number; power: number; hue: number }

const geneticcars: Maker = (W, H, rng) => {
  const ground = (x: number) => {
    const amp = 1 + Math.max(0, x) * 0.01
    return H * 0.66 + Math.sin(x * 0.11) * amp * 1.4 + Math.sin(x * 0.29 + 1) * amp * 0.55 + Math.sin(x * 0.53 + 2) * amp * 0.2
  }
  type Car = Genes & { x: number; v: number; stuck: number; dead: boolean; spin: number }
  let cars: Car[] = []
  let gen = 0
  let best = 0
  let cam = 0
  let hold = 0
  const random = (): Genes => ({ r1: 1.4 + rng() * 1.2, r2: 1.4 + rng() * 1.2, len: 4 + rng() * 3, power: 0.3 + rng() * 0.3, hue: rng() })
  const mutate = (a: Genes, b: Genes): Genes => {
    const m = (x: number, y: number, lo: number, hi: number) => clamp((rng() < 0.5 ? x : y) + (rng() - 0.5) * (hi - lo) * 0.3, lo, hi)
    return { r1: m(a.r1, b.r1, 1.4, 3.8), r2: m(a.r2, b.r2, 1.4, 3.8), len: m(a.len, b.len, 4, 10), power: m(a.power, b.power, 0.3, 1), hue: (a.hue + (rng() - 0.5) * 0.4 + 1) % 1 }
  }
  const spawn = (genes: Genes[]) => {
    cars = genes.map((g, i) => ({ ...g, x: 2 - i * 3, v: 0, stuck: 0, dead: false, spin: 0 }))
    gen++
    cam = 0
  }
  spawn([...Array(6)].map(random))

  // how steep a car can climb: big wheels and power help, a long base rides over the bumps
  const climb = (c: Car) => 0.04 + (c.r1 + c.r2) * 0.055 + c.power * 0.22
  const slope = (c: Car) => (ground(c.x) - ground(c.x + c.len)) / c.len

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          const ranked = cars.slice().sort((a, b) => b.x - a.x)
          const [a, b] = ranked
          spawn([a, b, ...[...Array(4)].map(() => mutate(a, b))])
        }
        return
      }
      for (const c of cars) {
        if (c.dead) continue
        const s = slope(c)
        const target = s > climb(c) ? 0 : (0.35 + c.power * 0.45) * (1 - s * 0.6)
        c.v += (target - c.v) * 0.08
        c.x += c.v
        c.spin += c.v / Math.max(1, (c.r1 + c.r2) / 2)
        if (c.v < 0.05) {
          if (++c.stuck > 25) c.dead = true
        } else c.stuck = 0
        best = Math.max(best, c.x)
      }
      const lead = Math.max(...cars.filter(c => !c.dead).map(c => c.x), 0)
      if (cars.every(c => c.dead)) hold = 30
      else cam += (Math.max(0, lead - W * 0.55) - cam) * 0.1
    },
    draw(px) {
      sky(px, W, H, 0x6ab4f0, 0xd0ecff)
      // far hills drift slowly
      for (let x = 0; x < W; x++) {
        const h = H * 0.5 + Math.sin((x + cam * 0.3) * 0.12) * 3 + Math.sin((x + cam * 0.3) * 0.05) * 4
        for (let y = Math.round(h); y < H; y++) px[y * W + x] = y < h + 1 ? 0x8ac0a0 : 0x7aae92
      }
      for (let x = 0; x < W; x++) {
        const g = ground(x + cam)
        for (let y = Math.max(0, Math.round(g)); y < H; y++) {
          const d = y - g
          px[y * W + x] = d < 1 ? 0x7ad04a : d < 2.5 ? 0x4aa034 : hash(x + Math.floor(cam), y, 2) < 0.08 ? 0x6a4428 : mix(0x8a5a34, 0x4a2c18, Math.min(1, d / 20))
        }
      }
      // a post every 50 m and the best so far
      for (let m = 50; m < cam + W + 50; m += 50) {
        const x = Math.round(m - cam)
        if (x < 0 || x >= W) continue
        rect(px, W, H, x, ground(m) - 6, 1, 6, 0xf0f0f0)
        rect(px, W, H, x + 1, ground(m) - 6, 2, 2, 0xe04040)
      }
      const bx = Math.round(best - cam)
      if (bx >= 0 && bx < W) for (let y = 7; y < ground(best); y += 2) dot(px, W, H, bx, y, 0xffffff)
      for (const c of cars) {
        const x0 = c.x - cam
        const x1 = x0 + c.len
        const y0 = ground(c.x) - c.r1
        const y1 = ground(c.x + c.len) - c.r2
        const col = c.dead ? 0x8a8a90 : hsv(c.hue, 0.7, 0.95)
        const lift = 1.5
        poly(px, W, H, [[x0, y0 - lift], [x1, y1 - lift], [(x0 + x1) / 2 + 1, Math.min(y0, y1) - 3.5 - lift]], tones(col)[1])
        beam(px, W, H, x0, y0 - lift, x1, y1 - lift, col)
        for (const [wx, wy, r] of [[x0, y0, c.r1], [x1, y1, c.r2]] as [number, number, number][]) {
          lit(px, W, H, wx, wy, r, r, 0x4a4a52, 0x1a1a1e)
          dot(px, W, H, wx + Math.cos(c.spin) * (r - 0.8), wy + Math.sin(c.spin) * (r - 0.8), 0xd0d0d8)
        }
        if (c.dead) {
          dot(px, W, H, (x0 + x1) / 2, Math.min(y0, y1) - 6, 0xe04040)
        }
      }
      text(px, W, H, 1, 1, String(gen), 0x1a3a5a)
      const m = `${Math.round(best)}`
      if (W >= 24) text(px, W, H, W - 1 - textWidth(m), 1, m, 0x1a3a5a)
    },
  }
}

// --- cars learn to drive ------------------------------------------------------------

const learncars: Maker = (W, H, rng) => {
  // the track: a closed curve, sampled evenly along its length
  let pts: [number, number][] = []
  let curv: number[] = []
  let L = 0
  const half = Math.max(2, W / 11)
  const build = (seed: number) => {
    const raw: [number, number][] = []
    for (let k = 0; k < 900; k++) {
      const a = (k / 900) * Math.PI * 2
      const wob = 1 + 0.18 * Math.sin(3 * a + seed) + 0.1 * Math.sin(5 * a + seed * 2)
      raw.push([W / 2 + (W / 2 - half - 2) * Math.sin(a) * wob, H / 2 + 2 + (H / 2 - half - 6) * Math.cos(a) * (2 - wob) * 0.95])
    }
    const acc = [0]
    for (let k = 1; k <= raw.length; k++) acc.push(acc[k - 1] + Math.hypot(raw[k % raw.length][0] - raw[k - 1][0], raw[k % raw.length][1] - raw[k - 1][1]))
    L = Math.round(acc[raw.length])
    pts = []
    let j = 0
    for (let s = 0; s < L; s++) {
      while (acc[j + 1] < (s * acc[raw.length]) / L) j++
      pts.push(raw[j])
    }
    curv = pts.map((_, s) => {
      const [ax, ay] = pts[(s - 3 + L) % L]
      const [bx, by] = pts[s]
      const [cx, cy] = pts[(s + 3) % L]
      const h1 = Math.atan2(by - ay, bx - ax)
      const h2 = Math.atan2(cy - by, cx - bx)
      let d = h2 - h1
      while (d > Math.PI) d -= Math.PI * 2
      while (d < -Math.PI) d += Math.PI * 2
      return d / 6
    })
  }
  type Car = { s: number; d: number; skill: number; dead: number; laps: number; hue: number }
  let cars: Car[] = []
  let gen = 0
  let hold = 0
  let won = 0
  let fx: Spark[] = []
  const maxK = () => Math.max(...curv.map(Math.abs))
  let v = 1
  const spawn = (skills: number[]) => {
    gen++
    cars = skills.map((skill, i) => ({ s: -i * 4, d: (i % 3) - 1, skill: clamp(skill, 0, 1), dead: 0, laps: 0, hue: 0.55 + i * 0.07 }))
  }
  const restart = () => {
    build(rng() * 6)
    v = Math.sqrt(0.95 / maxK()) * 0.11
    gen = 0
    won = 0
    spawn([...Array(8)].map(() => rng() * 0.45))
  }
  restart()
  const grip = (c: Car) => (0.25 + c.skill * 0.75) * maxK() * 1.2

  return {
    step() {
      fx = sparks(fx, 0.03)
      if (hold > 0) {
        if (--hold === 0) {
          if (won) restart()
          else {
            // the next generation: the one that got furthest, plus small mutations
            const bestCar = cars.slice().sort((a, b) => b.s + b.laps * L - (a.s + a.laps * L))[0]
            spawn([bestCar.skill, ...[...Array(7)].map(() => bestCar.skill + (rng() - 0.3) * 0.25)])
          }
        }
        return
      }
      for (const c of cars) {
        if (c.dead) continue
        const k = curv[((Math.floor(c.s) % L) + L) % L]
        const need = Math.abs(k)
        // too fast for the corner: it slides out, and off it goes
        if (need > grip(c)) c.d -= Math.sign(k) * (need - grip(c)) * 120 * v
        else c.d *= 0.97
        c.s += v
        if (c.s >= L) {
          c.s -= L
          c.laps++
        }
        if (Math.abs(c.d) > half + 0.5) {
          c.dead = 1
          const [x, y] = pts[((Math.floor(c.s) % L) + L) % L]
          burst(fx, rng, x, y, 0xffa040, 6, 0.7)
        }
      }
      if (cars.some(c => c.laps >= 2) && !won) {
        won = 1
        hold = 40
      } else if (cars.every(c => c.dead)) hold = 25
    },
    draw(px) {
      // grass with mown stripes
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = Math.floor((x + y) / 4) % 2 ? 0x3a8a3a : 0x449a40
      // the asphalt, kerbs where it bends
      for (let s = 0; s < L; s++) {
        const [x, y] = pts[s]
        const kerb = Math.abs(curv[s]) > maxK() * 0.45
        for (let dy = -half - 1; dy <= half + 1; dy++)
          for (let dx = -half - 1; dx <= half + 1; dx++) {
            const r = Math.hypot(dx, dy)
            if (r > half + 1) continue
            const at = Math.round(y + dy) * W + Math.round(x + dx)
            if (at < 0 || at >= W * H || Math.round(x + dx) < 0 || Math.round(x + dx) >= W) continue
            if (r > half) {
              if (px[at] !== 0x4a4a52 && px[at] !== 0x54545c) px[at] = kerb ? (Math.floor(s / 2) % 2 ? 0xe03a3a : 0xf0f0f0) : 0x2a6a2a
            } else px[at] = (x + dx + y + dy) % 7 < 1 ? 0x54545c : 0x4a4a52
          }
      }
      // the start line
      const [sx, sy] = pts[0]
      for (let k = -half; k <= half; k++) dot(px, W, H, sx + k, sy, k % 2 ? 0xffffff : 0x1a1a1a)
      const leader = cars.filter(c => !c.dead).sort((a, b) => b.s + b.laps * L - (a.s + a.laps * L))[0]
      for (const c of cars) {
        const i = ((Math.floor(c.s) % L) + L) % L
        const [x, y] = pts[i]
        const [nx, ny] = pts[(i + 2) % L]
        const hx = nx - x
        const hy = ny - y
        const hl = Math.hypot(hx, hy) || 1
        const px0 = x + (-hy / hl) * c.d
        const py0 = y + (hx / hl) * c.d
        const col = c.dead ? 0x6a6a70 : hsv(c.hue, 0.75, 1)
        // the leader's sensors: rays forward and to each side
        if (c === leader && !c.dead)
          for (const a of [-0.7, 0, 0.7]) {
            const ca = Math.cos(a)
            const sa = Math.sin(a)
            const rx = (hx / hl) * ca - (hy / hl) * sa
            const ry = (hx / hl) * sa + (hy / hl) * ca
            for (let r = 2; r < 8; r++) tint(px, W, H, px0 + rx * r, py0 + ry * r, 0xfff080, 0.5)
          }
        // a little car, three long and two wide, lit at the nose
        const ux = hx / hl
        const uy = hy / hl
        const [hi, base, sh] = tones(col)
        for (let a = -1; a <= 1; a++)
          for (const b of [0, 1]) {
            const side = b ? 0.9 : 0
            dot(px, W, H, px0 + ux * a - uy * side, py0 + uy * a + ux * side, a === 1 ? hi : b ? sh : base)
          }
      }
      text(px, W, H, 1, 1, String(gen), 0xffffff)
      const alive = cars.filter(c => !c.dead).length
      if (W >= 24) text(px, W, H, W - 1 - textWidth(`${alive}/8`), 1, `${alive}/8`, 0xd0f0d0)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- rope bridge --------------------------------------------------------------------

const ropebridge: Maker = (W, H, rng) => {
  const left = Math.max(3, Math.round(W * 0.16))
  const right = W - left
  const top = Math.round(H * 0.36)
  const N = 12
  type P = { x: number; y: number; px: number; py: number }
  let ps: P[] = []
  let links: boolean[] = []
  let rest = 0
  type Box = { s: number; x: number; y: number; vx: number; vy: number; free: boolean }
  let boxes: Box[] = []
  let t = 0
  let snapped = -1
  let after = 0
  let breakAt = 3
  let fx: Spark[] = []
  const reset = () => {
    ps = []
    for (let i = 0; i < N; i++) {
      const x = left + ((right - left) * i) / (N - 1)
      ps.push({ x, y: top, px: x, py: top })
    }
    links = new Array(N - 1).fill(true)
    rest = ((right - left) / (N - 1)) * 1.04
    boxes = []
    t = 0
    snapped = -1
    after = 0
    breakAt = 3 + irand(rng, 2)
  }
  reset()
  // where a box sits on the deck: between two planks, by its distance along
  const at = (s: number): [number, number, number] => {
    const f = clamp(s, 0, 0.999) * (N - 1)
    const i = Math.floor(f)
    const k = f - i
    return [ps[i].x + (ps[i + 1].x - ps[i].x) * k, ps[i].y + (ps[i + 1].y - ps[i].y) * k, i]
  }

  return {
    step() {
      fx = sparks(fx, 0.08)
      t++
      if (snapped >= 0 && ++after > 110) reset()
      if (snapped < 0 && t % 75 === 1 && boxes.length < breakAt) boxes.push({ s: -0.08, x: 0, y: 0, vx: 0, vy: 0, free: false })
      for (const p of ps) {
        const vx = (p.x - p.px) * 0.98
        const vy = (p.y - p.py) * 0.98
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + 0.05
      }
      for (const b of boxes) {
        if (b.free) continue
        b.s += 0.0045
        if (b.s > 1.05) b.free = true
        if (b.s > 0 && b.s < 1) {
          const [, , i] = at(b.s)
          ps[i].y += 0.09
          ps[i + 1].y += 0.09
        }
      }
      for (let it = 0; it < 10; it++) {
        for (let i = 0; i < N - 1; i++) {
          if (!links[i]) continue
          const a = ps[i]
          const b = ps[i + 1]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy) || 1
          const k = ((d - rest) / d) * 0.5
          a.x += dx * k
          a.y += dy * k
          b.x -= dx * k
          b.y -= dy * k
        }
        ps[0].x = left
        ps[0].y = top
        ps[N - 1].x = right
        ps[N - 1].y = top
      }
      // the last box on, and the middle plank gives
      if (snapped < 0 && boxes.length >= breakAt && boxes[breakAt - 1].s > 0.42) {
        snapped = Math.floor((N - 1) * 0.5) - 1 + irand(rng, 2)
        links[snapped] = false
        for (const b of boxes)
          if (b.s > 0 && b.s < 1) {
            const [x, y] = at(b.s)
            b.free = true
            b.x = x
            b.y = y
            b.vx = (rng() - 0.5) * 0.4
            b.vy = 0
          }
        burst(fx, rng, ps[snapped].x, ps[snapped].y, 0xc8a070, 10, 1)
      }
      for (const b of boxes) {
        if (!b.free) continue
        if (b.s > 1) {
          b.x = right + (b.s - 1) * 40
          b.y = top
          b.s += 0.004
          continue
        }
        b.vy += 0.08
        b.x += b.vx
        b.y += b.vy
        if (b.y > H - 6 && b.vy > 0) {
          for (let k = 0; k < 6; k++) fx.push({ x: b.x, y: H - 6, vx: (rng() - 0.5) * 1.2, vy: -rng() * 1.2, l: 14, c: 0xd0f0ff })
          b.vy = -0.2
          b.y = H + 20
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0xf0a070, 0x8ab0d8)
      // the far mountains, the gorge, the river
      for (let x = 0; x < W; x++) {
        const m = H * 0.24 + Math.sin(x * 0.3) * 2 + Math.sin(x * 0.11 + 1) * 3
        for (let y = Math.round(m); y < H; y++) px[y * W + x] = mix(0x6a78a0, 0x4a5478, (y - m) / 20)
      }
      for (let y = top; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x3a3a50, 0x1a1a28, (y - top) / (H - top))
      for (let y = H - 6; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 2 + Math.floor(t / 3)) % 9 === 0 ? 0xd0f0ff : mix(0x2a6aa0, 0x1a4a7a, (y - H + 6) / 6)
      // the cliffs, lit from the left
      for (const [x0, w] of [[0, left], [right, W - right]] as [number, number][]) {
        slab(px, W, H, x0, top, w, H - top, 0x7a6a5a)
        rect(px, W, H, x0, top - 1, w, 2, 0x5aa040)
        rect(px, W, H, x0, top - 1, w, 1, 0x8ad060)
        for (let y = top + 3; y < H; y += 4) rect(px, W, H, x0 + ((y * 3) % Math.max(1, w)), y, 2, 1, 0x5a4a3c)
      }
      // the posts, the hand ropes, the planks
      for (const x of [left - 1, right]) {
        rect(px, W, H, x, top - 5, 1, 5, 0x6a4428)
        dot(px, W, H, x, top - 6, 0x8a6038)
      }
      for (let i = 0; i < N - 1; i++) {
        if (!links[i]) continue
        const a = ps[i]
        const b = ps[i + 1]
        line(px, W, H, a.x, a.y - 4, b.x, b.y - 4, 0xc8a878)
        dot(px, W, H, a.x, a.y - 2, 0xa88858)
        dot(px, W, H, a.x, a.y - 3, 0xa88858)
      }
      for (let i = 0; i < N - 1; i++) {
        const a = ps[i]
        const b = ps[i + 1]
        if (!links[i] && snapped >= 0) {
          // the broken ends hang from what is left
          continue
        }
        line(px, W, H, a.x, a.y, b.x, b.y, 0xb07a44)
        line(px, W, H, a.x, a.y + 1, b.x, b.y + 1, 0x6a4424)
        dot(px, W, H, a.x, a.y, 0x3a2414)
      }
      for (const b of boxes) {
        let x = b.x
        let y = b.y
        if (!b.free) {
          if (b.s < 0) {
            x = left + b.s * 40
            y = top
          } else [x, y] = at(b.s)
        }
        slab(px, W, H, x - 2, y - 4, 4, 4, 0xc8904a, 0x5a3818)
        dot(px, W, H, x - 1, y - 3, 0x8a5a2a)
        dot(px, W, H, x, y - 2, 0x8a5a2a)
      }
      const on = boxes.filter(b => !b.free && b.s > 0 && b.s < 1).length
      text(px, W, H, 1, 1, `${on}`, 0xffffff)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- soft bodies --------------------------------------------------------------------

const softbody: Maker = (W, H, rng) => {
  const sw = Math.max(4, Math.round(W / 5))
  const sh = Math.max(3, Math.round(H / 9))
  const y0 = Math.round(H * 0.3)
  const stepTop = (x: number) => (x < 0 ? y0 : y0 + Math.floor(x / sw) * sh)
  const R = Math.max(2.5, W / 5.5)
  const n = 12
  type Pt = { x: number; y: number; px: number; py: number }
  type Blob = { pts: Pt[]; area: number; hue: number; age: number }
  let blobs: Blob[] = []
  let t = 0
  const area = (b: Blob) => {
    let a = 0
    for (let i = 0; i < n; i++) {
      const p = b.pts[i]
      const q = b.pts[(i + 1) % n]
      a += p.x * q.y - q.x * p.y
    }
    return a / 2
  }
  const spawn = () => {
    const cx = R + 1 + rng() * 2
    const cy = -R - 2
    const pts: Pt[] = []
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2
      const x = cx + Math.cos(a) * R
      const y = cy + Math.sin(a) * R
      pts.push({ x, y, px: x - 0.3, py: y })
    }
    const b: Blob = { pts, area: 0, hue: rng(), age: 0 }
    b.area = area(b)
    blobs.push(b)
  }
  const edge = (2 * Math.PI * R) / n

  return {
    step() {
      t++
      if (t % 70 === 1 && blobs.length < 3) spawn()
      for (const b of blobs) {
        b.age++
        for (const p of b.pts) {
          const vx = (p.x - p.px) * 0.995
          const vy = (p.y - p.py) * 0.995
          p.px = p.x
          p.py = p.y
          p.x += vx
          p.y += vy + 0.06
        }
        for (let it = 0; it < 6; it++) {
          // the skin keeps its length, the inside keeps its volume
          for (let i = 0; i < n; i++) {
            const a = b.pts[i]
            const c = b.pts[(i + 1) % n]
            const dx = c.x - a.x
            const dy = c.y - a.y
            const d = Math.hypot(dx, dy) || 1
            const k = ((d - edge) / d) * 0.5
            a.x += dx * k
            a.y += dy * k
            c.x -= dx * k
            c.y -= dy * k
          }
          const push = ((b.area - area(b)) / (n * edge)) * 0.5
          for (let i = 0; i < n; i++) {
            const a = b.pts[(i - 1 + n) % n]
            const c = b.pts[(i + 1) % n]
            const nx = c.y - a.y
            const ny = -(c.x - a.x)
            const l = Math.hypot(nx, ny) || 1
            b.pts[i].x += (nx / l) * push
            b.pts[i].y += (ny / l) * push
          }
          for (const p of b.pts) {
            const ty = stepTop(p.x)
            if (p.y > ty) {
              // onto the tread, or back off the riser it ran into
              const fromAbove = p.py <= ty + 0.5 || stepTop(p.px) >= ty
              if (fromAbove) {
                p.y = ty
                p.px = p.x - (p.x - p.px) * 0.85
              } else {
                p.x = Math.floor(p.x / sw) * sw - 0.01
              }
            }
            if (p.x < 0) p.x = 0
          }
        }
      }
      // blobs push each other apart
      for (const a of blobs)
        for (const b of blobs) {
          if (a === b) continue
          let cx = 0
          let cy = 0
          for (const p of b.pts) {
            cx += p.x / n
            cy += p.y / n
          }
          for (const p of a.pts) {
            const d = Math.hypot(p.x - cx, p.y - cy)
            if (d < R * 0.95 && d > 0) {
              p.x += ((p.x - cx) / d) * (R * 0.95 - d) * 0.5
              p.y += ((p.y - cy) / d) * (R * 0.95 - d) * 0.5
            }
          }
        }
      blobs = blobs.filter(b => b.pts.some(p => p.x < W + R && p.y < H + R))
    },
    draw(px) {
      sky(px, W, H, 0x3a2a4a, 0x2a1e36)
      for (let x = 0; x < W; x += 6) for (let y = 0; y < H; y++) px[y * W + x] = 0x34263f
      // the stairs: a lit nose on every tread, the riser in shade
      for (let x = 0; x < W; x++) {
        const ty = stepTop(x)
        const first = x % sw === 0
        for (let y = ty; y < H; y++) px[y * W + x] = y === ty ? 0xe8d8c0 : y === ty + 1 ? 0xc8b498 : first ? 0x7a6450 : mix(0xa89074, 0x6a5440, (y - ty) / H)
      }
      const mask = new Uint8Array(W * H)
      for (const b of blobs) {
        mask.fill(0)
        const pts = b.pts.map(p => [p.x, p.y] as [number, number])
        const tmp = new Uint32Array(W * H)
        poly(tmp, W, H, pts, 1)
        let cx = 0
        let cy = 0
        for (const p of b.pts) {
          cx += p.x / n
          cy += p.y / n
        }
        const col = hsv(b.hue, 0.6, 0.95)
        const [hi, base, sh, deep] = tones(col)
        for (let i = 0; i < W * H; i++) if (tmp[i]) mask[i] = 1
        for (let y = 0; y < H; y++)
          for (let x = 0; x < W; x++) {
            const i = y * W + x
            if (!mask[i]) continue
            const edgePx = x === 0 || x === W - 1 || y === 0 || y === H - 1 || !mask[i - 1] || !mask[i + 1] || !mask[i - W] || !mask[i + W]
            if (edgePx) {
              px[i] = scale(deep, 0.8)
              continue
            }
            const l = -((x - cx) * 0.6 + (y - cy) * 0.8) / R
            px[i] = l > 0.45 ? hi : l > -0.2 ? base : l > -0.65 ? sh : deep
          }
        // a face, squashed with the body
        let minY = Infinity
        let maxY = -Infinity
        for (const p of b.pts) {
          minY = Math.min(minY, p.y)
          maxY = Math.max(maxY, p.y)
        }
        const squash = clamp((maxY - minY) / (2 * R), 0.4, 1.4)
        dot(px, W, H, cx - 1.5, cy - squash, 0x1a1020)
        dot(px, W, H, cx + 1.5, cy - squash, 0x1a1020)
        dot(px, W, H, cx - R * 0.45, cy - R * 0.6 * squash, 0xffffff)
      }
    },
  }
}

// --- ragdoll stairs -----------------------------------------------------------------

const ragdoll: Maker = (W, H, rng) => {
  const sw = 7
  const sh = 5
  const floor = (x: number) => Math.floor(x / sw) * sh
  type P = { x: number; y: number; px: number; py: number }
  // head, neck, pelvis, knees and feet, elbows and hands
  const BONES: [number, number, number][] = [
    [0, 1, 2.5], [1, 2, 6], [2, 3, 4], [3, 4, 4], [2, 5, 4], [5, 6, 4], [1, 7, 3.5], [7, 8, 3.5], [1, 9, 3.5], [9, 10, 3.5], [0, 2, 8.4], [3, 5, 2.5],
  ]
  let ps: P[] = []
  let camX = 0
  let camY = 0
  let t = 0
  let score = 0
  let hits: Spark[] = []
  const reset = () => {
    const bx = 4
    const by = floor(bx) - 14
    const pose: [number, number][] = [[0, 0], [0, 2.5], [0, 8.5], [-1, 12.5], [-1, 16.5], [1, 12.5], [1, 16.5], [-2, 5.5], [-3, 8.5], [2, 5.5], [3, 8.5]]
    ps = pose.map(([x, y]) => ({ x: bx + x, y: by + y, px: bx + x - 0.9, py: by + y + 0.1 }))
    // a shove at the top
    ps[0].px -= 0.6
    ps[1].px -= 0.4
    camX = ps[2].x - W * 0.4
    camY = ps[2].y - H * 0.42
    t = 0
    score = 0
  }
  reset()

  return {
    step() {
      hits = sparks(hits, 0.05)
      t++
      if (t > 430) reset()
      for (const p of ps) {
        const vx = (p.x - p.px) * 0.995
        const vy = (p.y - p.py) * 0.995
        p.px = p.x
        p.py = p.y
        p.x += vx
        p.y += vy + 0.08
      }
      for (let it = 0; it < 6; it++) {
        for (const [a, b, len] of BONES) {
          const A = ps[a]
          const B = ps[b]
          const dx = B.x - A.x
          const dy = B.y - A.y
          const d = Math.hypot(dx, dy) || 1
          if (a === 3 && b === 5 && d > len) continue
          const k = ((d - len) / d) * 0.5
          A.x += dx * k
          A.y += dy * k
          B.x -= dx * k
          B.y -= dy * k
        }
        for (const p of ps) {
          const fy = floor(p.x)
          if (p.y > fy) {
            const vy = p.y - p.py
            const vx = p.x - p.px
            if (it === 0 && vy > 0.7) {
              score += Math.round(vy * 41)
              hits.push({ x: p.x, y: fy, vx: (rng() - 0.5) * 0.6, vy: -0.5, l: 10, c: 0xff5040 })
            }
            p.y = fy
            p.py = fy + vy * 0.35
            p.px = p.x - vx * 0.8
          }
        }
      }
      // keep it tumbling: a nudge down the stairs if it settles
      if (Math.abs(ps[2].x - ps[2].px) < 0.08 && t > 30) for (const p of ps) p.px -= 0.15
      camX += (ps[2].x - W * 0.4 - camX) * 0.15
      camY += (ps[2].y - H * 0.45 - camY) * 0.15
    },
    draw(px) {
      sky(px, W, H, 0x4a5a78, 0x2a3450)
      // wallpaper stripes that scroll with the house
      for (let x = 0; x < W; x++) if (Math.floor((x + camX * 0.5) / 4) % 2) for (let y = 0; y < H; y++) px[y * W + x] = mix(px[y * W + x], 0x5a6a88, 0.3)
      // the stairs in profile: a carpet runner, lit treads, risers in shade
      for (let x = 0; x < W; x++) {
        const wx = x + camX
        const fy = floor(wx) - camY
        const nose = Math.floor(wx) % sw === 0
        for (let y = Math.max(0, Math.round(fy)); y < H; y++) {
          const d = y - fy
          px[y * W + x] = d < 1 ? 0xd04050 : d < 2 ? 0x9a2a3a : nose ? 0x5a3a28 : mix(0x8a5e3e, 0x4a3020, Math.min(1, d / 18))
        }
      }
      // the banister, its posts
      for (let x = 0; x < W; x++) {
        const wx = x + camX
        const by = (wx * sh) / sw - camY - 10
        dot(px, W, H, x, by, 0xc89a60)
        dot(px, W, H, x, by + 1, 0x7a5430)
        if (Math.floor(wx) % sw === 3) for (let y = by + 2; y < floor(wx) - camY; y++) dot(px, W, H, x, y, 0x9a7048)
      }
      const P = (i: number): [number, number] => [ps[i].x - camX, ps[i].y - camY]
      const limb = (a: number, b: number, c: number) => {
        const [x0, y0] = P(a)
        const [x1, y1] = P(b)
        line(px, W, H, x0 + 0.5, y0 + 0.5, x1 + 0.5, y1 + 0.5, scale(c, 0.6))
        line(px, W, H, x0, y0, x1, y1, c)
      }
      for (const [a, b] of [[2, 3], [3, 4], [2, 5], [5, 6], [1, 7], [7, 8], [1, 9], [9, 10]]) limb(a, b, 0xe8b030)
      const [nx, ny] = P(1)
      const [hx, hy] = P(2)
      beam(px, W, H, nx, ny, hx, hy, 0xf0c040)
      const [cx, cy] = P(0)
      lit(px, W, H, cx, cy, 2.2, 2.2, 0xf0c848, 0x5a4010)
      // the crash test target on the head
      dot(px, W, H, cx, cy, 0x1a1a1a)
      dot(px, W, H, cx - 1, cy - 1, 0x1a1a1a)
      text(px, W, H, 1, 1, String(score), 0xffffff)
      for (const s of hits) dot(px, W, H, s.x - camX, s.y - camY, s.c)
    },
  }
}

export const SIMULATIONS = {
  powder,
  phantomjam,
  particlelife,
  geneticcars,
  learncars,
  ropebridge,
  softbody,
  ragdoll,
}
