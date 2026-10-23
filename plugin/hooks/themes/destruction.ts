import { disc, dot, hsv, mix, rect, scale, sky } from '../draw'
import type { Maker } from '../draw'
import { burst, hash, line, lit, slab, sparks } from '../kit'
import type { Spark } from '../kit'

// Destruction: things breaking, debris for free.

// --- wrecking ball ----------------------------------------------------------------

const wreckingball: Maker = (W, H, rng) => {
  const gy = Math.round(H * 0.88)
  const pvx = Math.round(W * 0.5)
  const pvy = Math.round(H * 0.08)
  const R = Math.max(1.5, W / 11)
  const BW = W >= 24 ? 3 : 2
  const BH = 2
  const bx0 = Math.round(W * 0.56)
  const cols = Math.max(2, Math.floor((W - 1 - bx0) / BW))
  const rows = Math.max(3, Math.floor((gy - H * 0.42) / BH))
  const top = gy - rows * BH
  const intact = new Uint8Array(cols * rows)
  const tint = new Uint32Array(cols * rows)
  const rubble = new Uint32Array(W * H)
  const heap = new Int32Array(W)
  type Chunk = { x: number; y: number; vx: number; vy: number; c: number }
  let chunks: Chunk[] = []
  let dust: Spark[] = []

  let L = H * 0.4
  const swing = () => Math.asin(Math.min(1, (pvx - R - 1) / L))
  let a = -swing()
  let av = 0
  let t = 0
  let built = rows
  let resting = false

  const raise = () => {
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const k = r * cols + c
        intact[k] = 1
        const isWindow = c % 3 === 1 && r % 3 === 1 && r < rows - 1
        tint[k] = isWindow ? 0x2a3a5a : mix(0xa84a32, 0xc0603a, hash(c, r, 5))
      }
    rubble.fill(0)
    heap.fill(gy)
    chunks = []
    L = H * 0.4
    a = -swing()
    av = 0
    resting = false
  }
  raise()

  const loosen = (c: number, r: number, vx: number, vy: number) => {
    const k = r * cols + c
    if (!intact[k]) return
    intact[k] = 0
    chunks.push({ x: bx0 + c * BW, y: top + r * BH, vx, vy, c: tint[k] })
  }

  return {
    step() {
      t++
      // the pendulum, kept swinging by the crane operator
      const prev = av
      av += -(0.7 / L) * Math.sin(a)
      if (resting) av *= 0.96
      a += av
      if (!resting && prev < 0 && av >= 0) {
        L = Math.min(H * 0.74, L + H * 0.04)
        a += (-swing() - a) * 0.6
      }
      const bx = pvx + Math.sin(a) * L
      const by = pvy + Math.cos(a) * L
      const vx = av * Math.cos(a) * L
      const vy = -av * Math.sin(a) * L

      // the ball knocks out every brick it overlaps
      if (built >= rows)
        for (let r = 0; r < rows; r++)
          for (let c = 0; c < cols; c++) {
            if (!intact[r * cols + c]) continue
            const qx = Math.max(bx0 + c * BW, Math.min(bx, bx0 + c * BW + BW - 1))
            const qy = Math.max(top + r * BH, Math.min(by, top + r * BH + BH - 1))
            if (Math.hypot(qx - bx, qy - by) > R) continue
            loosen(c, r, vx * 0.7 + (rng() - 0.3) * 0.6, vy * 0.5 - rng() * 0.8)
            av *= 0.97
            if (rng() < 0.3) burst(dust, rng, qx, qy, 0xb8b0a8, 3, 0.6)
          }
      // a brick with nothing under it falls
      for (let r = rows - 2; r >= 0; r--)
        for (let c = 0; c < cols; c++)
          if (intact[r * cols + c] && !intact[(r + 1) * cols + c]) loosen(c, r, (rng() - 0.5) * 0.3, 0)

      const next: Chunk[] = []
      for (const ch of chunks) {
        ch.vy += 0.2
        ch.x += ch.vx
        ch.y += ch.vy
        if (ch.x < 0 || ch.x > W - BW) ch.vx *= -0.5
        ch.x = Math.max(0, Math.min(W - BW, ch.x))
        const x0 = Math.round(ch.x)
        let floor = gy
        for (let k = 0; k < BW; k++) floor = Math.min(floor, heap[x0 + k])
        if (ch.y + BH >= floor) {
          for (let k = 0; k < BW; k++) {
            const x = x0 + k
            for (let j = 0; j < BH && heap[x] > top; j++) {
              heap[x]--
              rubble[heap[x] * W + x] = ch.c
            }
          }
          if (rng() < 0.2) burst(dust, rng, ch.x + 1, floor - 1, 0xb8b0a8, 2, 0.4)
        } else next.push(ch)
      }
      chunks = next
      dust = sparks(dust, -0.01)

      // when the building is down, the ball rests, then it all comes back
      let left = 0
      for (let k = 0; k < intact.length; k++) left += intact[k]
      if (!resting && (left < intact.length * 0.12 || t > 900)) {
        resting = true
        t = 0
      }
      if (resting && t > 120 && chunks.length === 0) {
        raise()
        built = 0
        t = 0
      }
      if (built < rows && t % 2 === 0) built++
    },
    draw(px) {
      sky(px, W, H, 0x8ab8e0, 0xd8e4ec, gy)
      rect(px, W, H, 0, gy, W, H - gy, 0x5a5048)
      rect(px, W, H, 0, gy, W, 1, 0x7a6e62)
      for (let y = 0; y < gy; y++)
        for (let x = 0; x < W; x++) {
          const c = rubble[y * W + x]
          if (c) px[y * W + x] = c
        }
      // the building, raised row by row after a reset: bricks with a lit top and a mortar corner
      for (let r = rows - built; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          if (!intact[r * cols + c]) continue
          const x = bx0 + c * BW
          const y = top + r * BH
          const col = tint[r * cols + c] as number
          rect(px, W, H, x, y, BW, BH, col)
          rect(px, W, H, x, y, BW - 1, 1, mix(col, 0xfff0e0, 0.25))
          dot(px, W, H, x + BW - 1, y + BH - 1, 0x6a2c1e)
        }
      for (const ch of chunks) {
        rect(px, W, H, ch.x, ch.y, BW, BH, ch.c)
        dot(px, W, H, ch.x, ch.y, mix(ch.c, 0xfff0e0, 0.3))
      }
      // the crane: a lattice mast, a boom with a lit top, a cabin
      rect(px, W, H, 1, pvy - 1, 2, gy - pvy + 1, 0xe0a020)
      rect(px, W, H, 1, pvy - 1, 1, gy - pvy + 1, 0xf8c850)
      for (let y = pvy + 1; y < gy; y += 3) dot(px, W, H, 2, y, 0x8a6010)
      rect(px, W, H, 0, pvy - 2, Math.round(pvx) + 2, 2, 0xc88a18)
      rect(px, W, H, 0, pvy - 2, Math.round(pvx) + 2, 1, 0xf8c850)
      for (let x = 3; x < pvx; x += 3) dot(px, W, H, x, pvy - 1, 0x8a6010)
      slab(px, W, H, 2, gy - 4, 4, 4, 0x3a4a5a)
      dot(px, W, H, 3, gy - 3, 0x9ad0f0)
      // the ball: a chain, an outlined lit sphere
      const bx = pvx + Math.sin(a) * L
      const by = pvy + Math.cos(a) * L
      line(px, W, H, pvx, pvy, bx, by, 0x2a2a2a)
      lit(px, W, H, bx, by, R, R, 0x4a4a56, 0x121216)
      for (const s of dust) dot(px, W, H, s.x, s.y, s.l > 10 ? s.c : 0xd8d0c8)
    },
  }
}

// --- hydraulic press --------------------------------------------------------

const presse: Maker = (W, H, rng) => {
  const anvilY = H - 9
  const rest = 7
  const cx = W / 2
  type Obj = 'cube' | 'pasteque' | 'gelee' | 'bille' | 'canard'
  const KINDS: Obj[] = ['cube', 'pasteque', 'gelee', 'bille', 'canard']
  let obj: Obj = KINDS[Math.floor(rng() * KINDS.length)] as Obj
  let color = hsv(rng(), 0.7, 0.95)
  let w0 = 12
  let h0 = 12
  let h = h0
  let w = w0
  let ox = -w0
  let pressY = rest
  let phase: 'enter' | 'down' | 'crush' | 'hold' | 'up' | 'leave' = 'enter'
  let hold = 0
  let shake = 0
  type P = { x: number; y: number; vx: number; vy: number; c: number; life: number }
  let parts: P[] = []
  const seeds = Array.from({ length: 7 }, () => [0.25 + rng() * 0.5, 0.35 + rng() * 0.4] as const)

  function next() {
    obj = KINDS[Math.floor(rng() * KINDS.length)] as Obj
    color = hsv(rng(), 0.7, 0.95)
    w0 = 10 + Math.floor(rng() * 5)
    h0 = 10 + Math.floor(rng() * 5)
    w = w0
    h = h0
    ox = -w0
    phase = 'enter'
  }

  function colorAt(u: number, v: number): number | undefined {
    const ex = (2 * u - 1) ** 2 + (2 * v - 1) ** 2
    switch (obj) {
      case 'cube':
        if (v < 0.15) return mix(color, 0xffffff, 0.35)
        if (u > 0.82) return mix(color, 0x000000, 0.3)
        return color
      case 'pasteque':
        if (ex > 1) return undefined
        if (ex > 0.72) return Math.floor(u * 10) % 2 ? 0x2f8f3a : 0x1f6a2a
        if (ex > 0.6) return 0xe8f5c8
        return seeds.some(([su, sv]) => Math.abs(u - su) < 0.05 && Math.abs(v - sv) < 0.06) ? 0x1a1a1a : 0xff4a5a
      case 'gelee':
        if (ex > 1.1 && (u < 0.08 || u > 0.92 || v < 0.08)) return undefined
        return v < 0.2 && u < 0.4 ? 0xc8ffc0 : 0x5adf6a
      case 'bille':
        if (ex > 1) return undefined
        return hsv(Math.floor(Math.sqrt(ex) * 5) * 0.18 + 0.05, 0.75, 1)
      case 'canard': {
        const body = ((u - 0.55) / 0.45) ** 2 + ((v - 0.7) / 0.3) ** 2 <= 1
        const head = ((u - 0.35) / 0.25) ** 2 + ((v - 0.3) / 0.25) ** 2 <= 1
        if (Math.abs(u - 0.33) < 0.05 && Math.abs(v - 0.25) < 0.06) return 0x1a1a1a
        if (u < 0.12 && Math.abs(v - 0.38) < 0.08) return 0xff8a1a
        return body || head ? 0xffd93a : undefined
      }
    }
  }

  function splat() {
    shake = 6
    for (let i = 0; i < 50; i++) {
      const u = rng()
      const v = rng()
      const c = colorAt(u, v) ?? color
      const dir = rng() < 0.5 ? -1 : 1
      parts.push({ x: cx + dir * w * 0.4, y: anvilY - 1, vx: dir * (0.4 + rng() * 1.4), vy: -rng() * 1.5, c, life: 40 + rng() * 30 })
    }
  }

  return {
    step() {
      if (shake > 0) shake--
      if (phase === 'enter') {
        ox += 0.8
        if (ox >= cx - w0 / 2) {
          ox = cx - w0 / 2
          phase = 'down'
        }
      } else if (phase === 'down') {
        pressY += 0.7
        if (pressY >= anvilY - h0) phase = 'crush'
      } else if (phase === 'crush') {
        pressY += 0.22
        h = anvilY - pressY
        w = Math.min(W - 2, w0 * Math.pow(h0 / h, 0.75))
        if (h <= Math.max(2, h0 * 0.2)) {
          splat()
          phase = 'hold'
          hold = 18
        }
      } else if (phase === 'hold') {
        if (--hold <= 0) phase = 'up'
      } else if (phase === 'up') {
        pressY -= 0.9
        if (pressY <= rest) {
          pressY = rest
          ox = cx - w / 2
          phase = 'leave'
        }
      } else {
        ox += 1.2
        if (ox > W) next()
      }
      if (phase !== 'crush' && phase !== 'hold' && phase !== 'up' && phase !== 'leave') ox = phase === 'enter' ? ox : cx - w0 / 2
      for (const p of parts) {
        p.vy += 0.07
        p.x += p.vx
        p.y += p.vy
        if (p.y >= anvilY - 0.5 && p.x > 3 && p.x < W - 4) {
          p.y = anvilY - 0.5
          p.vy *= -0.3
          p.vx *= 0.7
        } else if (p.y >= H - 2) {
          p.y = H - 2
          p.vy = 0
          p.vx *= 0.5
        }
        p.life--
      }
      parts = parts.filter(p => p.life > 0)
    },
    draw(px) {
      sky(px, W, H, 0x3a3f4a, 0x1c1f26)
      const sx = shake > 0 ? (shake % 2 ? 1 : -1) : 0
      rect(px, W, H, 0, 0, 3, H, 0x2a2d35)
      rect(px, W, H, W - 3, 0, 3, H, 0x2a2d35)
      rect(px, W, H, 0, 0, W, 3, 0x2a2d35)
      for (let y = 0; y < H; y += 6) {
        dot(px, W, H, 1, y + 1, 0x8a8f9a)
        dot(px, W, H, W - 2, y + 1, 0x8a8f9a)
      }
      for (let y = 3; y < pressY - 4; y++)
        for (let x = Math.round(cx - 2); x < cx + 2; x++) px[y * W + x] = mix(0x9aa0aa, 0xe0e4ea, (x - cx + 2) / 4)
      rect(px, W, H, 3 + sx, pressY - 4, W - 6, 4, 0x7a808c)
      rect(px, W, H, 3 + sx, pressY - 3, W - 6, 1, 0x9aa0ac)
      rect(px, W, H, 3 + sx, pressY - 1, W - 6, 1, 0x555a64)
      rect(px, W, H, W - 4 + sx, pressY - 4, 1, 4, 0x4a4e58)
      for (let x = 3; x < W - 3; x++) if ((x + Math.floor(pressY)) % 4 < 2) dot(px, W, H, x + sx, pressY - 4, 0xf0c020)
      for (let y = anvilY; y < H; y++)
        for (let x = 4; x < W - 4; x++) px[y * W + x] = y === anvilY ? 0xa0a6b0 : (x + y) % 4 < 2 ? 0xf0c020 : 0x1a1a1a
      const x0 = phase === 'crush' || phase === 'hold' || phase === 'up' ? cx - w / 2 : ox
      const top = anvilY - h
      for (let y = Math.floor(top); y < anvilY; y++)
        for (let x = Math.floor(x0); x < x0 + w; x++) {
          const u = (x - x0 + 0.5) / w
          const v = (y - top + 0.5) / h
          const c = colorAt(u, v)
          if (c === undefined) continue
          // light from the upper left over whatever is being crushed
          const light = obj === 'cube' ? 0 : -((u - 0.5) * 1.2 + (v - 0.5) * 1.6)
          dot(px, W, H, x + sx, y, light > 0.45 ? mix(c, 0xfff8ee, 0.3) : light < -0.45 ? mix(scale(c, 0.72), 0x281436, 0.12) : c)
        }
      for (const p of parts) dot(px, W, H, p.x, p.y, p.c)
    },
  }
}

export const DESTRUCTION = {
  presse,
  wreckingball,
}
