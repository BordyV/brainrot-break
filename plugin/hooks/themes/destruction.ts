import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, clamp, ellipse, hash, irand, line, lit, slab, sparks, tint } from '../kit'
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

// --- voxel tower collapse -----------------------------------------------------------

const voxeltower: Maker = (W, H, rng) => {
  const c = W >= 24 ? 2 : 1
  const cols = Math.floor((W - 2) / c)
  const ground = H - 5
  const tw = Math.min(cols - 4, 12)
  const th = Math.min(Math.floor((ground - 9) / c), 22)
  const tx = Math.floor((cols - tw) / 2)
  // the tower's blocks, by colour: stone, glass, roof, door
  type Block = { col: number; row: number; colour: number; x: number; y: number; vx: number; vy: number; t: number; state: 0 | 1 | 2 }
  let blocks: Block[] = []
  let heap = new Int16Array(cols)
  let t = 0
  let phase: 'build' | 'stand' | 'pull' | 'fall' | 'rest' = 'build'
  let pulled = -1
  let lean = 1
  let fx: Spark[] = []
  const reset = () => {
    blocks = []
    heap = new Int16Array(cols)
    const hue = rng()
    const stone = hsv(0.08 + hue * 0.1, 0.25, 0.75)
    for (let r = 0; r < th; r++)
      for (let q = 0; q < tw; q++) {
        let colour = stone
        if (r >= th - 2) colour = r === th - 1 && (q === 0 || q === tw - 1 || q % 3 === 1) ? 0xb84030 : r === th - 1 ? -1 : 0xc84a38
        else if (r > 2 && r % 3 !== 0 && q % 3 === 1) colour = 0x6ab8f0
        else if (r < 2 && (q === Math.floor(tw / 2) || q === Math.floor(tw / 2) - 1)) colour = 0x6a4428
        if (colour < 0) continue
        blocks.push({ col: tx + q, row: r, colour, x: (tx + q) * c + 1, y: ground - (r + 1) * c, vx: 0, vy: 0, t: 0, state: 0 })
      }
    phase = 'build'
    t = 0
    pulled = -1
  }
  reset()
  const bottomY = (col: number) => ground - heap[col] * c

  return {
    step() {
      fx = sparks(fx, 0.03)
      t++
      if (phase === 'build' && t > th * 3 + 10) {
        phase = 'stand'
        t = 0
      } else if (phase === 'stand' && t > 25) {
        phase = 'pull'
        t = 0
        // one block near the bottom corner: the one that held it all
        const side = tx + (rng() < 0.5 ? 0 : tw - 1)
        lean = side === tx ? -1 : 1
        const low = blocks.filter(b => b.row === 0 && b.col === side)
        pulled = blocks.indexOf(low[0])
      } else if (phase === 'pull') {
        const b = blocks[pulled]
        b.x += b.col === tx ? -0.5 : 0.5
        if (t > 14) {
          blocks.splice(pulled, 1)
          pulled = -1
          phase = 'fall'
          t = 0
          for (const k of blocks) k.t = k.row * 0.8 + rng() * 4
        }
      } else if (phase === 'fall') {
        let moving = 0
        for (const b of blocks) {
          if (b.state === 2) continue
          if (b.state === 0) {
            if (t < b.t) continue
            b.state = 1
            b.vx = lean * (0.08 + b.row * 0.05) + (rng() - 0.5) * 0.3
            b.vy = 0
          }
          moving++
          b.vy += 0.12
          b.x += b.vx
          b.y += b.vy
          b.x = clamp(b.x, 0, (cols - 1) * c)
          let col = Math.round(b.x / c)
          if (b.y + c >= bottomY(col)) {
            // it lands: roll down the heap like sand, then stay
            for (let k = 0; k < 10; k++) {
              const l = col > 0 && heap[col - 1] < heap[col] - 1
              const r = col < cols - 1 && heap[col + 1] < heap[col] - 1
              if (l && (!r || rng() < 0.5)) col--
              else if (r) col++
              else break
            }
            heap[col]++
            b.state = 2
            b.x = col * c
            b.y = ground - heap[col] * c
            if (b.vy > 1.5 && rng() < 0.3) fx.push({ x: b.x, y: b.y, vx: (rng() - 0.5) * 0.8, vy: -0.4, l: 16, c: 0xb8a890 })
          }
        }
        if (!moving && t > 40) {
          phase = 'rest'
          t = 0
        }
      } else if (phase === 'rest' && t > 50) reset()
    },
    draw(px) {
      sky(px, W, H, 0x5a8ad0, 0xc8e0f0)
      for (let x = 0; x < W; x++) {
        const h = H * 0.55 + Math.sin(x * 0.2) * 2
        for (let y = Math.round(h); y < ground; y++) px[y * W + x] = 0x7aa0c0
      }
      rect(px, W, H, 0, ground, W, H - ground, 0x5a9a3a)
      rect(px, W, H, 0, ground, W, 1, 0x8ad060)
      for (let y = ground + 2; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 4) < 0.15) px[y * W + x] = 0x4a7a2e
      const block = (x: number, y: number, colour: number) => {
        const [hi, base, sh] = colour === 0x6ab8f0 ? [0xd0f0ff, colour, 0x3a78b0] : [mix(colour, 0xffffff, 0.35), colour, scale(colour, 0.65)]
        if (c === 1) return dot(px, W, H, x, y, base)
        dot(px, W, H, x, y, hi)
        dot(px, W, H, x + 1, y, base)
        dot(px, W, H, x, y + 1, base)
        dot(px, W, H, x + 1, y + 1, sh)
      }
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i]
        if (phase === 'build' && b.row * 3 > t) continue
        const drop = phase === 'build' ? Math.max(0, b.row * 3 + 3 - t) * 3 : 0
        block(Math.round(b.x), Math.round(b.y - drop), i === pulled ? 0xe04040 : b.colour)
      }
      for (const s of fx) {
        tint(px, W, H, s.x, s.y, s.c, 0.6)
        tint(px, W, H, s.x + 1, s.y, s.c, 0.4)
      }
      const fallen = blocks.filter(b => b.state === 2).length
      text(px, W, H, 1, 1, String(fallen), 0xffffff)
    },
  }
}

// --- slow-motion bullet -------------------------------------------------------------

const bullettime: Maker = (W, H, rng) => {
  const gap = Math.max(30, W * 1.4)
  const cy = Math.round(H * 0.46)
  type Kind = 'apple' | 'can' | 'balloon'
  let order: Kind[] = []
  let bx = 0
  let cam = 0
  let hit = [false, false, false]
  let since = [0, 0, 0]
  let bits: Spark[] = []
  let jets: Spark[] = []
  let rings: { x: number; r: number }[] = []
  let t = 0
  const reset = () => {
    order = (['apple', 'can', 'balloon'] as Kind[]).sort(() => rng() - 0.5)
    bx = -10
    cam = -W / 2
    hit = [false, false, false]
    since = [0, 0, 0]
    bits = []
    jets = []
    rings = []
    t = 0
  }
  reset()
  const objX = (i: number) => gap * (i + 0.6)

  return {
    step() {
      t++
      bits = sparks(bits, 0.025)
      jets = sparks(jets, 0.03)
      for (const r of rings) r.r += 0.4
      rings = rings.filter(r => r.r < 9)
      bx += 0.55
      if (t % 6 === 0) rings.push({ x: bx - 2, r: 1 })
      cam += (bx - W * 0.45 - cam) * 0.2
      order.forEach((kind, i) => {
        const x = objX(i)
        if (hit[i]) {
          since[i]++
          if (kind === 'can' && since[i] < 70 && since[i] % 2 === 0) {
            jets.push({ x: x - 3, y: cy + 1, vx: -0.5 - rng() * 0.2, vy: -0.1, l: 40, c: 0x8ad0ff })
            jets.push({ x: x + 3, y: cy + 1, vx: 0.7 + rng() * 0.3, vy: -0.15, l: 40, c: 0x8ad0ff })
          }
          if (kind === 'balloon' && since[i] === 14)
            for (let k = 0; k < 40; k++) {
              const a = rng() * Math.PI * 2
              const r = rng() * 4
              bits.push({ x: x + Math.cos(a) * r, y: cy - 2 + Math.sin(a) * r * 1.2, vx: Math.cos(a) * 0.1 + 0.05, vy: 0, l: 120, c: rng() < 0.5 ? 0x5ab0f0 : 0x8ad0ff })
            }
          return
        }
        if (bx >= x - 3) {
          hit[i] = true
          rings.push({ x: bx, r: 2 })
          if (kind === 'apple')
            for (let k = 0; k < 26; k++) {
              const a = (rng() - 0.5) * 2.2
              const v = 0.2 + rng() * 0.5
              bits.push({ x: x + rng() * 3, y: cy + (rng() - 0.5) * 6, vx: Math.cos(a) * v + 0.2, vy: Math.sin(a) * v - 0.15, l: 140, c: k % 3 === 0 ? 0xd02a2a : k % 3 === 1 ? 0xf8f0c8 : 0xe8d090 })
            }
          if (kind === 'balloon')
            for (let k = 0; k < 12; k++) {
              const a = (k / 12) * Math.PI * 2
              bits.push({ x: x + Math.cos(a) * 4, y: cy - 2 + Math.sin(a) * 5, vx: Math.cos(a) * 0.5, vy: Math.sin(a) * 0.5, l: 30, c: 0xe84a8a })
            }
        }
      })
      if (bx > objX(2) + W) reset()
    },
    draw(px) {
      sky(px, W, H, 0x1a1a24, 0x2a2a38)
      // the studio: a backdrop that curves into the floor, a ruler of marks
      for (let y = cy + 8; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x3a3a48, 0x24242e, (y - cy - 8) / (H - cy))
      for (let x = 0; x < W; x++) if (Math.floor(x + cam) % 6 === 0) dot(px, W, H, x, cy + 8, 0x5a5a6a)
      const sx = (x: number) => x - cam
      order.forEach((kind, i) => {
        const x = sx(objX(i))
        // the stand
        rect(px, W, H, x - 1, cy + 5, 3, 3, 0x4a4a58)
        rect(px, W, H, x - 3, cy + 7, 7, 1, 0x5a5a68)
        if (kind === 'apple' && !hit[i]) {
          lit(px, W, H, x, cy, 3.5, 3.2, 0xd8302a, 0x5a0a0a)
          rect(px, W, H, x, cy - 5, 1, 2, 0x5a3a1a)
          dot(px, W, H, x + 1, cy - 5, 0x4ab03a)
          dot(px, W, H, x + 2, cy - 5, 0x4ab03a)
        }
        if (kind === 'can') {
          const jump = hit[i] ? Math.min(2, since[i] * 0.05) : 0
          slab(px, W, H, x - 3, cy - 4 - jump, 6, 9, 0xd02a2a, 0x5a0a0a)
          rect(px, W, H, x - 2, cy - 1 - jump, 4, 2, 0xf0f0f0)
          rect(px, W, H, x - 2, cy - 4 - jump, 4, 1, 0xd0d0d8)
          if (hit[i]) {
            dot(px, W, H, x - 3, cy + 1 - jump, 0x1a1a1a)
            dot(px, W, H, x + 2, cy + 1 - jump, 0x1a1a1a)
          }
        }
        if (kind === 'balloon') {
          if (!hit[i]) {
            lit(px, W, H, x, cy - 2, 3.5, 4.2, 0xe84a8a, 0x6a1030)
            dot(px, W, H, x, cy + 3, 0xa82a5a)
            line(px, W, H, x, cy + 4, x, cy + 6, 0xd0d0d0)
          } else if (since[i] < 14) {
            // the water keeps the balloon's shape for a moment after the rubber is gone
            lit(px, W, H, x, cy - 2, 3.5, 4.2, 0x5ab0f0)
            dot(px, W, H, x - 1, cy - 4, 0xd0f0ff)
          }
        }
      })
      for (const r of rings) for (let a = 0; a < 12; a++) tint(px, W, H, sx(r.x) - Math.abs(Math.cos(a)) * r.r, cy + Math.sin(a) * r.r, 0xffffff, 0.15)
      for (const s of jets) dot(px, W, H, sx(s.x), s.y, s.c)
      for (const s of bits) {
        dot(px, W, H, sx(s.x), s.y, s.c)
        if (s.y > cy + 7) s.vy = 0
      }
      // the bullet: brass with a lit top, a heat streak behind
      const bxs = sx(bx)
      for (let k = 1; k < 8; k++) tint(px, W, H, bxs - k - 1, cy, 0xfff0c0, 0.5 - k * 0.06)
      rect(px, W, H, bxs - 1, cy - 1, 3, 2, 0xc89a40)
      rect(px, W, H, bxs - 1, cy - 1, 3, 1, 0xf0d080)
      dot(px, W, H, bxs + 2, cy, 0xa87a30)
      text(px, W, H, 1, 1, 'x0.01', 0xd0d0e0)
    },
  }
}

// --- wood splitting -----------------------------------------------------------------

const woodsplit: Maker = (W, H, rng) => {
  const blockY = Math.round(H * 0.72)
  const cx = Math.round(W * 0.4)
  const lw = Math.max(4, Math.round(W * 0.22))
  const lh = Math.max(5, Math.round(H * 0.17))
  let t = 0
  let angle = 0
  let phase: 'place' | 'lift' | 'swing' | 'stuck' | 'split' = 'place'
  let tough = false
  let split = 0
  let halves: { x: number; y: number; vx: number; vy: number; side: number; land: number }[] = []
  let pile = 0
  let fx: Spark[] = []
  const next = () => {
    phase = 'place'
    t = 0
    tough = rng() < 0.3
  }
  next()

  return {
    step() {
      fx = sparks(fx, 0.08)
      t++
      // the axe: up over the shoulder, then down hard
      if (phase === 'place' && t > 12) {
        phase = 'lift'
        t = 0
      } else if (phase === 'lift') {
        angle = Math.min(1, t / 18)
        if (t > 22) {
          phase = 'swing'
          t = 0
        }
      } else if (phase === 'swing') {
        angle = 1 - Math.min(1, (t * t) / 16)
        if (angle <= 0) {
          for (let k = 0; k < 8; k++) fx.push({ x: cx + (rng() - 0.5) * lw, y: blockY - lh, vx: (rng() - 0.5) * 1.4, vy: -rng() * 1.2, l: 14, c: 0xe8c890 })
          if (tough) {
            tough = false
            phase = 'stuck'
            t = 0
          } else {
            phase = 'split'
            t = 0
            split++
            halves = [-1, 1].map(side => ({ x: cx, y: blockY - lh, vx: side * (0.5 + rng() * 0.3), vy: -1, side, land: 0 }))
          }
        }
      } else if (phase === 'stuck' && t > 16) {
        phase = 'lift'
        t = 0
      } else if (phase === 'split') {
        for (const h of halves) {
          if (h.land) continue
          h.vy += 0.12
          h.x += h.vx
          h.y += h.vy
          if (h.y > blockY + 4) {
            h.land = 1
            if (h.side > 0) pile++
          }
        }
        if (t > 30) {
          if (pile > 24) pile = 0
          next()
        }
      }
    },
    draw(px) {
      // a forest at dusk, a few pines, the ground
      sky(px, W, H, 0x3a4a78, 0xf0a868)
      for (let x = 0; x < W; x++) {
        const h = H * 0.42 + Math.sin(x * 0.7) * 3 + (x % 5 === 2 ? -4 : 0)
        for (let y = Math.round(h); y < blockY; y++) px[y * W + x] = mix(0x2a3a3a, 0x1e2a2a, (y - h) / 20)
      }
      for (let y = blockY; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = hash(x, y, 1) < 0.1 ? 0x5a4a2a : mix(0x7a6a3a, 0x4a3e24, (y - blockY) / (H - blockY))
      // the woodpile on the right grows, split ends out
      const px0 = W - 13
      for (let i = 0; i < pile; i++) {
        const row = Math.floor(i / 4)
        const q = i % 4
        const x = px0 + q * 3 + (row % 2)
        const y = H - 3 - row * 3
        lit(px, W, H, x + 1, y, 1.7, 1.5, 0xe0b880, 0x4a2a12)
        dot(px, W, H, x + 1, y, 0xa87a48)
      }
      // the chopping block: a stump with rings on top
      slab(px, W, H, cx - lw / 2 - 2, blockY - 2, lw + 4, 7, 0x7a5030, 0x3a2414)
      for (let k = 2; k < lw + 2; k += 2) rect(px, W, H, cx - lw / 2 - 1 + k, blockY, 1, 4, 0x5a3820)
      ellipse(px, W, H, cx, blockY - 2, lw / 2 + 2, 1, 0xd8b078)
      const log = (x: number, y: number, w: number, halfSide: number) => {
        slab(px, W, H, x, y, w, lh, 0x8a5a30, 0x3a2414)
        // bark in long vertical grooves, rings on the cut top, the pale inside where it split
        for (let k = 2; k < w - 1; k += 2) rect(px, W, H, x + k, y + 2, 1, lh - 3, 0x5a3820)
        rect(px, W, H, x + 1, y, w - 2, 1, 0xe8c890)
        if (halfSide) rect(px, W, H, halfSide < 0 ? x + w - 2 : x + 1, y + 1, 1, lh - 2, 0xf0d8a0)
      }
      if (phase === 'split') {
        for (const h of halves) log(Math.round(h.x + (h.side < 0 ? -lw / 2 : 0)), Math.round(h.y), Math.ceil(lw / 2), h.side)
      } else if (phase !== 'place' || t > 4) {
        const drop = phase === 'place' ? Math.max(0, 12 - t * 1.5) : 0
        log(cx - lw / 2, blockY - 2 - lh - drop, lw, 0)
        if (phase === 'stuck') rect(px, W, H, cx, blockY - 2 - lh, 1, 3, 0x2a1a0a)
      }
      // the axe on its arc, from the hands: down on the log, or up over the shoulder
      const len = Math.min(15, H * 0.28)
      const sx0 = cx + len * 0.75
      const sy0 = blockY - 2 - lh - len * 0.55
      const down = Math.atan2(blockY - 2 - lh - 2 - sy0, cx - sx0)
      const up = -Math.PI / 2 - 0.5
      const a = down + (up - down) * angle
      const headX = sx0 + Math.cos(a) * len
      const headY = sy0 + Math.sin(a) * len
      beam(px, W, H, sx0, sy0, headX, headY, 0xb88a50)
      // the head across the handle: steel, a bright edge
      const nx = -Math.sin(a)
      const ny = Math.cos(a)
      for (let k = -2; k <= 2; k++) {
        dot(px, W, H, headX + nx * k, headY + ny * k, k < 0 ? 0xb8c0cc : 0x6a7280)
        dot(px, W, H, headX + nx * k + Math.cos(a), headY + ny * k + Math.sin(a), 0xe8f0ff)
      }
      lit(px, W, H, sx0, sy0, 1.6, 1.6, 0x8a4a2a)
      text(px, W, H, 1, 1, String(split), 0xffffff)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- barrel chain -------------------------------------------------------------------

const barrelchain: Maker = (W, H, rng) => {
  const floorY = Math.round(H * 0.7)
  const gap = Math.max(9, Math.round(W * 0.34))
  const N = 9
  type Boom = { x: number; t: number }
  let lit2 = -1
  let lastAt = 0
  let t = 0
  let booms: Boom[] = []
  let debris: Spark[] = []
  let lids: Spark[] = []
  let cam = 0
  let flash = 0
  let gone = new Uint8Array(N)
  const bx = (i: number) => 12 + i * gap
  const reset = () => {
    lit2 = -1
    t = 0
    booms = []
    debris = []
    lids = []
    cam = 0
    flash = 0
    gone = new Uint8Array(N)
  }
  reset()

  return {
    step() {
      t++
      debris = sparks(debris, 0.09)
      lids = sparks(lids, 0.06)
      for (const b of booms) b.t++
      booms = booms.filter(b => b.t < 40)
      if (flash > 0) flash--
      if (lit2 < 0 && t > 25) {
        lit2 = 0
        lastAt = t
      }
      // each blast lights the next barrel a moment later
      if (lit2 >= 0 && lit2 < N && t - lastAt > 11 + (lit2 % 3)) {
        const x = bx(lit2)
        gone[lit2] = 1
        const big = lit2 === N - 1
        booms.push({ x, t: big ? -6 : 0 })
        if (big) flash = 10
        for (let k = 0; k < (big ? 40 : 18); k++) {
          const a = -Math.PI * rng()
          const v = 0.6 + rng() * (big ? 2 : 1.3)
          debris.push({ x, y: floorY - 4, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: 20 + irand(rng, 20), c: k % 3 ? 0x5a1a14 : 0xa82a20 })
        }
        lids.push({ x, y: floorY - 8, vx: (rng() - 0.3) * 0.6, vy: -2.2, l: 60, c: 0x8a2018 })
        lit2++
        lastAt = t
      }
      const target = lit2 >= 0 ? bx(Math.min(N - 1, lit2)) - W * 0.5 : 0
      cam += (Math.max(0, target) - cam) * 0.1
      if (lit2 >= N && t - lastAt > 70) reset()
    },
    draw(px) {
      // a long concrete corridor: wall panels, a pipe, warning stripes on the floor
      sky(px, W, H, 0x2a2e36, 0x3a3e48, floorY)
      for (let x = 0; x < W; x++) {
        const wx = Math.floor(x + cam)
        if (wx % 16 === 0) for (let y = 4; y < floorY; y++) px[y * W + x] = 0x24282e
        if (wx % 16 === 1) for (let y = 4; y < floorY; y++) px[y * W + x] = 0x4a4e58
        px[8 * W + x] = 0x6a6a72
        px[9 * W + x] = 0x3a3a42
        if (wx % 24 === 5) for (let y = 10; y < 14; y++) px[y * W + x] = 0x5a5e68
      }
      for (let y = floorY; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === floorY ? 0x5a5a62 : y < floorY + 3 && Math.floor((x + cam + y) / 3) % 2 ? 0xd0a020 : mix(0x3a3a40, 0x1a1a20, (y - floorY) / (H - floorY))
      // the fire lights the walls around it
      for (const b of booms) {
        const r = 14 - b.t * 0.25
        if (r <= 0 || b.t < 0) continue
        for (let y = 0; y < floorY; y++)
          for (let x = 0; x < W; x++) {
            const d = Math.hypot(x + cam - b.x, (y - floorY) * 1.3)
            if (d < r) px[y * W + x] = mix(px[y * W + x], 0xff8a30, 0.35 * (1 - d / r))
          }
      }
      for (let i = 0; i < N; i++) {
        if (gone[i]) continue
        const x = Math.round(bx(i) - cam)
        const big = i === N - 1
        const w = big ? 8 : 6
        const h = big ? 10 : 8
        slab(px, W, H, x - w / 2, floorY - h, w, h, big ? 0xd8a020 : 0xc83224, big ? 0x5a3a08 : 0x4a0e0a)
        rect(px, W, H, x - w / 2 + 1, floorY - h + 2, w - 2, 1, big ? 0x8a6010 : 0x8a1e16)
        rect(px, W, H, x - w / 2 + 1, floorY - 3, w - 2, 1, big ? 0x8a6010 : 0x8a1e16)
        if (W >= 20) dot(px, W, H, x, floorY - h / 2 - 1, big ? 0x1a1a1a : 0xf0d040)
      }
      for (const b of booms) {
        if (b.t < 0) continue
        // a fireball: white, then yellow, orange, then smoke that rises
        const x = b.x - cam
        const r = Math.min(7, 2 + b.t * 0.8)
        const y = floorY - 5 - b.t * 0.3
        if (b.t < 14) {
          lit(px, W, H, x, y, r, r * 0.9, 0xff9a30)
          ellipse(px, W, H, x - 0.5, y - 0.5, r * 0.65, r * 0.6, b.t < 5 ? 0xffffff : 0xffe060)
        } else {
          const s = Math.min(8, r)
          for (let dy = -s; dy <= s; dy++) for (let dx = -s; dx <= s; dx++) if (dx * dx + dy * dy * 1.4 < s * s) tint(px, W, H, x + dx, y - (b.t - 14) * 0.4 + dy, dy < 0 && dx < 0 ? 0x8a8a92 : 0x4a4a52, 0.55 - (b.t - 14) / 60)
        }
      }
      for (const s of debris) dot(px, W, H, s.x - cam, Math.min(s.y, floorY), s.c)
      for (const s of lids) {
        rect(px, W, H, s.x - cam - 2, s.y, 4, 1, s.c)
        if (s.y > floorY) s.vy = 0
      }
      if (flash) for (let i = 0; i < W * H; i++) px[i] = mix(px[i], 0xfff8e0, flash / 22)
      text(px, W, H, 1, 1, String(Math.max(0, lit2)), 0xffffff)
    },
  }
}

export const DESTRUCTION = {
  presse,
  wreckingball,
  voxeltower,
  bullettime,
  woodsplit,
  barrelchain,
}
