import { mix, rect } from '../draw'
import type { Maker } from '../draw'
import { irand } from '../kit'

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
      // grass, then the road
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 3) % 7 === 0 ? 0x3a6a32 : 0x2e5a2a
      for (let k = 0; k < P; k++) {
        const [x, y] = pts[k]
        const ox = (x - cx) / rx
        const oy = (y - cy) / ry
        const d = Math.hypot(ox, oy) || 1
        for (let r = -1.5; r <= 1.5; r += 0.5) {
          const qx = Math.round(x + (ox / d) * r)
          const qy = Math.round(y + (oy / d) * r)
          if (qx >= 0 && qx < W && qy >= 0 && qy < H) px[qy * W + qx] = 0x4a4a52
        }
      }
      // the infield shows the history: jams are the red stripes running backwards
      rect(px, W, H, ix - 1, iy - 1, iw + 2, ih + 2, 0x24321f)
      for (let y = 0; y < ih; y++)
        for (let x = 0; x < iw; x++) {
          const c = hist[y * iw + x]
          px[(iy + y) * W + ix + x] = c || DARK
        }
      for (let i = 0; i < n; i++) {
        const [x, y] = pts[Math.floor(s[i]) % P]
        const c = speedColour(v[i] / V0)
        rect(px, W, H, Math.round(x) - 1, Math.round(y) - 1, 2, 2, i === braking && brakeT > 0 ? 0xffffff : c)
      }
    },
  }
}

export const SIMULATIONS = {
  powder,
  phantomjam,
}
