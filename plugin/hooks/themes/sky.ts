import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, hash, irand, line, lit, poly, slab, sparks, tint } from '../kit'
import type { Spark } from '../kit'

// Birds, sky & flight: things in the air, on purpose or not.

// --- paper plane --------------------------------------------------------------------

const paperplane: Maker = (W, H, rng) => {
  const floor = H - 6
  const bin = { x: W - 7, w: 6, h: 6 }
  let x = 2
  let y = 10
  let vx = 0
  let vy = 0
  let a = 0
  let t = 0
  let landed = 0
  let made = 0
  let throws = 0
  let fx: Spark[] = []
  // each throw aims somewhere near the bin: most land in it, some fall short or fly long
  let tx = 0
  let drop = 0
  const toss = () => {
    x = 3
    y = 12
    vx = 0.42
    vy = 0
    a = 0
    tx = bin.x + bin.w / 2 + (rng() < 0.6 ? 0 : (rng() < 0.5 ? -1 : 1) * (5 + rng() * 3))
    drop = (floor - bin.h / 2 - 12) / ((tx - 3) / vx)
    landed = 0
    t = 0
    throws++
  }
  toss()

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (landed) {
        if (++landed > 50) toss()
        return
      }
      // a glider: it sinks, swoops up, stalls and sinks again, less each time
      const k = Math.min(1, (x - 3) / Math.max(1, tx - 3))
      const ny = 12 + drop * t + Math.sin(t * 0.13) * 4 * (1 - k)
      vy = ny - y
      x += vx
      y = ny
      a += (Math.atan2(vy, vx) - a) * 0.3
      if (x > W - 2) {
        vx = -vx * 0.3
        x = W - 2
      }
      const inBin = x > bin.x && x < bin.x + bin.w && y > floor - bin.h
      if (inBin || y > floor - 1) {
        landed = 1
        if (inBin) {
          made++
          burst(fx, rng, bin.x + bin.w / 2, floor - bin.h, 0xffe060, 10, 1)
        }
        y = Math.min(y, floor - 1)
      }
    },
    draw(px) {
      // a classroom wall, a window, the floor
      sky(px, W, H, 0xf0e8d0, 0xe0d4b8, floor)
      slab(px, W, H, 3, 18, 12, 14, 0xa8d8f0, 0xd8ccb0)
      rect(px, W, H, 9, 18, 1, 14, 0xd8ccb0)
      rect(px, W, H, 3, 25, 12, 1, 0xd8ccb0)
      for (let yy = floor; yy < H; yy++) for (let xx = 0; xx < W; xx++) px[yy * W + xx] = (xx + Math.floor(yy / 2) * 4) % 8 === 0 ? 0x8a6040 : 0xa87a50
      // the bin
      slab(px, W, H, bin.x, floor - bin.h, bin.w, bin.h, 0x5a7aa0, 0x2a3a50)
      rect(px, W, H, bin.x, floor - bin.h, bin.w, 1, 0x8aa8c8)
      // the plane: two white wings, a fold down the middle
      const c = Math.cos(a)
      const s = Math.sin(a)
      const P = (u: number, v: number): [number, number] => [x + u * c - v * s, y + u * s + v * c]
      poly(px, W, H, [P(3, 0), P(-3, -2), P(-2, 0)], 0xffffff)
      poly(px, W, H, [P(3, 0), P(-2, 0), P(-3, 1.5)], 0xc8d0dc)
      line(px, W, H, ...P(3, 0), ...P(-2.5, 0), 0x8a94a8)
      for (const sp of fx) dot(px, W, H, sp.x, sp.y, sp.c)
      text(px, W, H, 1, 1, `${made}/${throws}`, 0x5a4a3a)
    },
  }
}

// --- drone light show ---------------------------------------------------------------

const droneshow: Maker = (W, H, rng) => {
  const N = 40
  const cx = W / 2
  const cy = H * 0.38
  const S = Math.min(W, H) * 0.38
  // the shapes, each a set of N points
  const shape = (k: number): [number, number][] => {
    const pts: [number, number][] = []
    for (let i = 0; i < N; i++) {
      const u = i / N
      const a = u * Math.PI * 2
      let p: [number, number]
      if (k === 0) p = [((i % 8) - 3.5) * S * 0.24, (Math.floor(i / 8) - 2) * S * 0.24]
      else if (k === 1) {
        // a heart
        const hx = 16 * Math.sin(a) ** 3
        const hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))
        p = [hx * S * 0.055, hy * S * 0.055]
      } else if (k === 2) {
        // a star
        const r = (i % 2 ? 0.45 : 1) * S
        p = [Math.cos(a - Math.PI / 2) * r, Math.sin(a - Math.PI / 2) * r]
      } else if (k === 3) {
        // a smiley: a ring, two eyes, a smile
        if (i < 26) p = [Math.cos(a * (40 / 26)) * S, Math.sin(a * (40 / 26)) * S]
        else if (i < 28) p = [(i === 26 ? -0.35 : 0.35) * S, -0.3 * S]
        else {
          const b = 0.4 + ((i - 28) / 11) * 2.3
          p = [Math.cos(b) * S * 0.55, Math.sin(b) * S * 0.5 + S * 0.05]
        }
      } else {
        // a rocket
        const col = i % 4
        p = i < 32 ? [(col - 1.5) * S * 0.2, (Math.floor(i / 4) - 4) * S * 0.2] : [((i % 2) * 2 - 1) * S * 0.45, (0.4 + Math.floor((i - 32) / 2) * 0.12) * S]
      }
      pts.push([cx + p[0], cy + p[1]])
    }
    return pts
  }
  const HUES = [0.6, 0.97, 0.13, 0.15, 0.55]
  let from = shape(0)
  let to = shape(0)
  let k = 0
  let t = 0
  let hue = 0.6
  let hue0 = 0.6
  const drones = from.map(([x, y]) => ({ x, y }))
  const next = () => {
    from = drones.map(d => [d.x, d.y] as [number, number])
    k = (k + 1) % 5
    const target = shape(k)
    // match each drone to a target in the same angular order, so paths rarely cross
    const ang = (p: [number, number]) => Math.atan2(p[1] - cy, p[0] - cx)
    const order = from.map((p, i) => i).sort((a, b) => ang(from[a]) - ang(from[b]))
    const tOrder = target.map((p, i) => i).sort((a, b) => ang(target[a]) - ang(target[b]))
    to = new Array(N)
    order.forEach((di, j) => (to[di] = target[tOrder[j]]))
    hue0 = hue
    t = 0
  }

  return {
    step() {
      t++
      if (t === 110) next()
      const m = clamp((t - 0) / 60, 0, 1)
      const e = m * m * (3 - 2 * m)
      drones.forEach((d, i) => {
        d.x = from[i][0] + (to[i][0] - from[i][0]) * e + Math.sin(t * 0.05 + i) * 0.15
        d.y = from[i][1] + (to[i][1] - from[i][1]) * e + Math.cos(t * 0.04 + i) * 0.15
      })
      hue = hue0 + (HUES[k] - hue0) * e
      if (t > 110) t = 110
    },
    draw(px) {
      sky(px, W, H, 0x050818, 0x141a3a)
      for (let i = 0; i < 20; i++) dot(px, W, H, hash(i, 1, 2) * W, hash(i, 2, 2) * H * 0.6, 0x5a6a8a)
      // the skyline and its lit windows, the crowd's phones at the bottom
      for (let x = 0; x < W; x++) {
        const h = H * 0.78 - Math.floor(hash(Math.floor(x / 4), 0, 5) * 8)
        for (let y = Math.round(h); y < H; y++) px[y * W + x] = (x % 4 === 1 && y % 3 === 0 && hash(x, y, 6) < 0.5) ? 0xf0d080 : 0x0e1020
      }
      for (let x = 1; x < W; x += 3) dot(px, W, H, x, H - 3 - (x % 2), 0xd0e0ff)
      for (const [i, d] of drones.entries()) {
        const c = hsv(hue + (k === 1 ? 0 : i * 0.004), 0.7, 1)
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) tint(px, W, H, d.x + dx, d.y + dy, c, 0.35)
        dot(px, W, H, d.x, d.y, mix(c, 0xffffff, 0.5))
      }
    },
  }
}

// --- seagull heist ------------------------------------------------------------------

const seagull: Maker = (W, H, rng) => {
  const sand = Math.round(H * 0.62)
  let gx = -10
  let gy = 10
  let state: 'circle' | 'dive' | 'steal' | 'away' = 'circle'
  let t = 0
  let has = true
  let flail = 0
  let fx: Spark[] = []
  const reset = () => {
    gx = -10
    gy = 10
    state = 'circle'
    t = 0
    has = true
    flail = 0
  }
  reset()
  const snack = { x: W * 0.55, y: sand + 6 }

  return {
    step() {
      t++
      fx = sparks(fx, 0.06)
      if (flail) flail--
      if (state === 'circle') {
        gx = W / 2 + Math.cos(t * 0.05) * W * 0.35
        gy = 10 + Math.sin(t * 0.05) * 4
        if (t > 70 + irand(rng, 40)) state = 'dive'
      } else if (state === 'dive') {
        gx += clamp(snack.x - gx, -1.2, 1.2)
        gy += clamp(snack.y - 2 - gy, -1.2, 1.2)
        if (Math.hypot(snack.x - gx, snack.y - 2 - gy) < 1.5) {
          state = 'steal'
          has = false
          flail = 40
          for (let k = 0; k < 8; k++) fx.push({ x: snack.x, y: snack.y, vx: (rng() - 0.5), vy: -rng(), l: 12, c: 0xf0d060 })
        }
      } else if (state === 'steal') {
        gx += 1
        gy -= 0.8
        if (gy < -6) state = 'away'
      } else if (state === 'away' && ++t > 260) reset()
    },
    draw(px) {
      sky(px, W, H, 0x5aaaf0, 0xc8e8ff, Math.round(H * 0.42))
      for (let y = Math.round(H * 0.42); y < sand; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 3 + y * 5 + Math.floor(t / 6)) % 19 === 0 ? 0xd8f0ff : mix(0x3a9ad8, 0x2a7ab8, (y - H * 0.42) / 10)
      for (let y = sand; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = hash(x, y, 1) < 0.06 ? 0xd8b880 : 0xf0d8a0
      for (let x = 0; x < W; x++) dot(px, W, H, x, sand, 0xffffff)
      // the towel and the person on it
      slab(px, W, H, W * 0.15, sand + 8, W * 0.55, 6, 0xe84a5a)
      for (let x = Math.round(W * 0.15); x < W * 0.7; x += 3) rect(px, W, H, x, sand + 8, 1, 6, 0xf0f0f0)
      const pxp = W * 0.35
      lit(px, W, H, pxp, sand + 4, 3, 3, 0xf0c090, 0x6a4020)
      rect(px, W, H, pxp - 3, sand + 1, 6, 2, 0x5a3a1a)
      slab(px, W, H, pxp - 3, sand + 7, 7, 8, 0x3a7ad8)
      const arm = flail && flail % 6 < 3 ? -4 : 0
      line(px, W, H, pxp + 2, sand + 9, pxp + 5, sand + 8 + arm, 0xf0c090)
      line(px, W, H, pxp - 2, sand + 9, pxp - 5, sand + 8 + (flail ? -arm - 4 : 0), 0xf0c090)
      // the chips: a red box, golden fries
      const sx = has ? snack.x : gx
      const sy = has ? snack.y : gy + 3
      slab(px, W, H, sx - 1.5, sy - 1, 4, 3, 0xd83a2a)
      for (let k = 0; k < 4; k++) dot(px, W, H, sx - 1 + k, sy - 2 - (k % 2), 0xf8d050)
      // the gull: white body, grey wings that flap, a yellow beak
      const flap = Math.floor(t / 4) % 2
      lit(px, W, H, gx, gy, 3.4, 2, 0xffffff, 0x8a8a98)
      line(px, W, H, gx - 1, gy - 1, gx - 6, gy - 2 - flap * 3, 0xa0a8b8)
      line(px, W, H, gx - 1, gy, gx - 5, gy - 1 - flap * 3, 0x8a90a0)
      line(px, W, H, gx + 1, gy - 1, gx + 6, gy - 2 - flap * 3, 0xa0a8b8)
      line(px, W, H, gx + 1, gy, gx + 5, gy - 1 - flap * 3, 0x8a90a0)
      dot(px, W, H, gx + 2, gy - 1, 0x1a1a1a)
      dot(px, W, H, gx + 3, gy, 0xf0b020)
      dot(px, W, H, gx + 4, gy, 0xf0b020)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

export const SKY = {
  paperplane,
  droneshow,
  seagull,
}
