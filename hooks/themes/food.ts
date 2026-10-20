import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, hash, irand, line, pick, ring, rot, sparks } from '../kit'
import type { Spark } from '../kit'

// Food & cooking: a satisfying transformation or a growing pile.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)
const ease = (u: number) => u * u * (3 - 2 * u)

function counter(px: Uint32Array, W: number, H: number, top: number) {
  sky(px, W, H, 0xf4e8d8, 0xe8d4bc, top)
  for (let y = 3; y < top - 2; y += 6) for (let x = (y / 6) % 2 ? 0 : 3; x < W; x += 6) rect(px, W, H, x, y, 5, 5, 0xf8f0e6)
  rect(px, W, H, 0, top, W, H - top, 0x9a6a42)
  rect(px, W, H, 0, top, W, 1, 0xb8885a)
}

// --- pancake flip -----------------------------------------------------------------

const pancakes: Maker = (W, H, rng) => {
  const top = Math.round(H * 0.72)
  const panX = Math.round(W * 0.25)
  const plateX = Math.round(W * 0.72)
  let stack = 0
  let t = 0
  let syrup = 0

  return {
    step() {
      t++
      if (t > 150) {
        t = 0
        stack++
        if (stack >= 7) syrup = 1
      }
      if (syrup > 0) {
        syrup++
        if (syrup > 120) {
          syrup = 0
          stack = 0
        }
      }
      void rng
    },
    draw(px) {
      counter(px, W, H, top)
      rect(px, W, H, panX - 7, top - 3, 14, 2, 0x2a2a30)
      rect(px, W, H, panX + 7, top - 3, 8, 1, 0x3a3a40)
      rect(px, W, H, panX - 6, top - 1, 12, 1, 0x1a1a1e)
      rect(px, W, H, plateX - 7, top - 1, 14, 1, 0xf0f0f0)
      for (let i = 0; i < stack; i++) {
        rect(px, W, H, plateX - 5, top - 3 - i * 2, 10, 2, 0xe0a050)
        rect(px, W, H, plateX - 5, top - 3 - i * 2, 10, 1, 0xf0c070)
      }
      if (syrup > 0) {
        const y0 = top - 2 - stack * 2
        rect(px, W, H, plateX - 2, y0 - 1, 4, 1, 0xf8e080)
        const drip = Math.min(stack * 2, syrup / 6)
        rect(px, W, H, plateX - 5, y0, 10, 1, 0x9a4a10)
        rect(px, W, H, plateX - 5, y0, 1, drip, 0x9a4a10)
        rect(px, W, H, plateX + 4, y0, 1, drip * 0.7, 0x9a4a10)
      }
      if (syrup > 0) return
      // cook, bubble, flip once, flip onto the plate
      const cook = span(t, 0, 50)
      const c = mix(0xf8e0b0, 0xe0a050, cook)
      if (t < 55) {
        rect(px, W, H, panX - 5, top - 5, 10, 2, c)
        if (t > 20) for (let k = 0; k < 4; k++) if ((t + k * 7) % 14 < 4) dot(px, W, H, panX - 4 + k * 3, top - 5, 0xfff0d0)
      } else if (t < 85) {
        const u = (t - 55) / 30
        const y = top - 5 - Math.sin(u * Math.PI) * H * 0.35
        const a = u * Math.PI * 2
        const hw = 5 * Math.abs(Math.cos(a)) + 0.5
        rect(px, W, H, panX - hw, y, hw * 2, 2, c)
      } else if (t < 110) rect(px, W, H, panX - 5, top - 5, 10, 2, 0xd89040)
      else {
        const u = (t - 110) / 40
        const x = panX + (plateX - panX) * ease(u)
        const y = top - 5 - Math.sin(u * Math.PI) * H * 0.3 + u * (2 - stack * 2)
        rect(px, W, H, x - 5, y, 10, 2, 0xe0a050)
      }
      for (let k = 0; k < 3; k++) {
        const s = ((t * 0.3 + k * 10) % 20) / 20
        dot(px, W, H, panX - 3 + k * 3 + Math.sin(t * 0.1 + k) * 1, top - 7 - s * 12, mix(0xffffff, 0xf4e8d8, s))
      }
    },
  }
}

// --- ramen pull -------------------------------------------------------------------

const ramen: Maker = (W, H, rng) => {
  const cx = W / 2
  const by = Math.round(H * 0.62)
  const R = W * 0.42
  let t = 0
  void rng

  return {
    step() {
      t++
    },
    draw(px) {
      sky(px, W, H, 0x2a1a1a, 0x5a2a20, by)
      rect(px, W, H, 0, by, W, H - by, 0x3a2418)
      for (let x = 0; x < W; x += 5) rect(px, W, H, x, by, 1, H - by, 0x2a1810)
      for (let y = by; y < by + R * 0.9; y++) {
        const k = (y - by) / (R * 0.9)
        const hw = R * Math.sqrt(Math.max(0, 1 - k * k))
        rect(px, W, H, cx - hw, y, hw * 2, 1, k > 0.85 ? 0x7a1a1a : 0xc82a2a)
      }
      ellipse(px, W, H, cx, by, R, 3.5, 0xe0a050)
      ellipse(px, W, H, cx, by, R - 1, 2.5, 0xd8903a)
      ring(px, W, H, cx, by, R, 0xd02a2a)
      disc(px, W, H, cx - R * 0.45, by - 0.5, 2, 0xfff4e0)
      disc(px, W, H, cx - R * 0.45, by - 0.5, 1, 0xffa020)
      rect(px, W, H, cx + R * 0.3, by - 3, 4, 4, 0x1a3a1a)
      disc(px, W, H, cx + R * 0.05, by + 0.5, 1.4, 0xffffff)
      dot(px, W, H, cx + R * 0.05, by + 0.5, 0xff6a9a)
      const lift = (Math.sin(t * 0.05) + 1) / 2
      const top = by - 4 - lift * H * 0.35
      for (let k = 0; k < 4; k++) {
        const x0 = cx - 3 + k * 2
        for (let y = top; y < by; y += 0.5) dot(px, W, H, x0 + Math.sin(y * 0.6 + k) * 0.8, y, k % 2 ? 0xf8e8a0 : 0xf0d880)
      }
      line(px, W, H, cx - 4, top - 1, cx + 10, top - 14, 0xa8784a)
      line(px, W, H, cx + 3, top - 1, cx + 12, top - 12, 0xc89060)
      for (let k = 0; k < 6; k++) {
        const s = ((t * 0.4 + k * 9) % 30) / 30
        dot(px, W, H, cx - R * 0.6 + k * (R * 0.25) + Math.sin(t * 0.07 + k) * 1.5, by - 2 - s * 18, mix(0xf0f0f0, 0x3a1a1a, s))
      }
    },
  }
}

// --- pizza toppings ---------------------------------------------------------------

const pizza: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.55
  const R = Math.min(W / 2 - 2, H * 0.3)
  type Top = { r: number; a: number; kind: number; land: number }
  let tops: Top[] = []
  let ang = 0
  let t = 0
  let phase = 0
  const KIND = [0xffe9a0, 0xc8282a, 0x2a8a2a, 0x3a3a3a, 0xf0a030]

  function reset() {
    tops = []
    t = 0
    phase = 0
  }
  reset()

  return {
    step() {
      t++
      ang += 0.02
      if (t > 20 && t < 260 && t % 4 === 0) {
        const kind = t < 120 ? 0 : t < 180 ? 1 : t < 220 ? 2 : pick(rng, [3, 4])
        const r = Math.sqrt(rng()) * (R - 2)
        tops.push({ r, a: rng() * 6.28 - ang, kind, land: t + 10 })
      }
      if (t > 320) phase = 1
      if (t > 400) reset()
    },
    draw(px) {
      sky(px, W, H, 0x3a2a24, 0x2a1a14)
      disc(px, W, H, cx, cy, R + 2, 0xc8884a)
      disc(px, W, H, cx, cy, R, 0xd8a060)
      const sauce = span(t, 0, 20)
      if (sauce > 0) disc(px, W, H, cx, cy, (R - 1) * sauce, 0xc8302a)
      for (const p of tops) {
        const fall = clamp((p.land - t) / 10, 0, 1)
        const [dx, dy] = rot(p.r, 0, p.a + ang)
        const x = cx + dx
        const y = cy + dy - fall * 20
        if (p.kind === 0) {
          dot(px, W, H, x, y, KIND[0] as number)
          dot(px, W, H, x + 1, y, 0xfff4c0)
        } else if (p.kind === 1) {
          disc(px, W, H, x, y, 1.2, KIND[1] as number)
          dot(px, W, H, x - 0.5, y - 0.5, 0xe05050)
        } else dot(px, W, H, x, y, KIND[p.kind] as number)
      }
      if (phase) {
        for (let k = 0; k < 4; k++) {
          const [dx, dy] = rot(R, 0, ang + (k / 4) * Math.PI)
          line(px, W, H, cx - dx, cy - dy, cx + dx, cy + dy, 0x8a5a30)
        }
        if (t > 340) {
          const u = span(t, 340, 380)
          const [dx, dy] = rot(R * 0.5, 0, ang + Math.PI / 8)
          for (let y = 0; y < 3; y++) line(px, W, H, cx + dx * 0.3, cy + dy * 0.3 - u * 14 + y, cx + dx * 0.3, cy + dy * 0.3 + y, 0xffe9a0)
        }
      }
    },
  }
}

// --- popcorn ----------------------------------------------------------------------

const popcorn: Maker = (W, H, rng) => {
  const potL = Math.round(W * 0.18)
  const potR = W - potL
  const potBottom = Math.round(H * 0.78)
  const potTop = Math.round(H * 0.5)
  let kernels: { x: number; y: number; vx: number; vy: number; popped: boolean; rest: boolean; c: number }[] = []
  let t = 0
  let lid = { y: potTop - 1, vy: 0, a: 0 }

  function reset() {
    kernels = Array.from({ length: 70 }, () => ({ x: potL + 2 + rng() * (potR - potL - 4), y: potBottom - 2, vx: 0, vy: 0, popped: false, rest: true, c: 0xe8c040 }))
    t = 0
    lid = { y: potTop - 1, vy: 0, a: 0 }
  }
  reset()
  const heights = new Float32Array(W)

  return {
    step() {
      t++
      heights.fill(potBottom - 1)
      for (const k of kernels) if (k.popped && k.rest) heights[Math.round(k.x)] = Math.min(heights[Math.round(k.x)]!, k.y - 1.5)
      for (const k of kernels) {
        if (!k.popped && t > 40 && rng() < 0.012 + t * 0.00004) {
          k.popped = true
          k.rest = false
          k.vy = -1.6 - rng() * 1.4
          k.vx = (rng() - 0.5) * 0.8
          k.c = pick(rng, [0xfff8e0, 0xfff0c8, 0xffffff])
        }
        if (k.rest) continue
        k.vy += 0.12
        k.x += k.vx
        k.y += k.vy
        if (k.y > potTop - 2 && (k.x < potL + 1 || k.x > potR - 2) && lid.y >= potTop - 2) k.vx = -k.vx
        if (k.y > potTop) k.x = clamp(k.x, potL + 1, potR - 2)
        const floorY = k.x > potL && k.x < potR ? heights[Math.round(clamp(k.x, 0, W - 1))]! : H - 4
        if (k.vy > 0 && k.y >= floorY) {
          k.y = floorY
          k.rest = true
        }
        if (lid.vy === 0 && k.y < lid.y + 1 && lid.y < potTop) {
          k.vy = Math.abs(k.vy) * 0.5
        }
      }
      const fill = kernels.filter(k => k.popped && k.rest && k.y < potTop + 3).length
      if (fill > 3 && lid.vy === 0 && lid.y >= potTop - 1) lid.vy = -1.4
      if (lid.vy !== 0) {
        lid.vy += 0.08
        lid.y += lid.vy
        lid.a += 0.08
        if (lid.y > H) lid.vy = 0
      }
      if (t > 420) reset()
    },
    draw(px) {
      sky(px, W, H, 0x3a3a48, 0x24242e)
      rect(px, W, H, 0, potBottom + 2, W, H - potBottom - 2, 0x2a2a2a)
      for (let x = potL; x < potR; x += 3) dot(px, W, H, x, potBottom + 3, t % 6 < 3 ? 0xff6a2a : 0xff3a1a)
      rect(px, W, H, potL - 1, potTop, 1, potBottom - potTop + 2, 0xa0a8b4)
      rect(px, W, H, potR, potTop, 1, potBottom - potTop + 2, 0x707884)
      rect(px, W, H, potL - 1, potBottom + 1, potR - potL + 2, 1, 0x707884)
      rect(px, W, H, potL - 4, potTop + 2, 3, 1, 0x3a3a3a)
      rect(px, W, H, potR + 1, potTop + 2, 3, 1, 0x3a3a3a)
      for (const k of kernels) {
        if (k.popped) {
          disc(px, W, H, k.x, k.y, 1.2, k.c)
          dot(px, W, H, k.x + 1, k.y + 1, 0xf0d890)
        } else dot(px, W, H, k.x, k.y, k.c)
      }
      const lw = potR - potL + 2
      if (lid.vy === 0 && lid.y < potTop) {
        rect(px, W, H, potL - 1, lid.y, lw, 1, 0xc0c8d4)
        rect(px, W, H, W / 2 - 1, lid.y - 1, 3, 1, 0x3a3a3a)
      } else if (lid.vy !== 0) {
        const [dx, dy] = rot(lw / 2, 0, lid.a)
        line(px, W, H, W / 2 - dx, lid.y - dy, W / 2 + dx, lid.y + dy, 0xc0c8d4)
      }
      text(px, W, H, 1, 1, String(kernels.filter(k => k.popped).length), 0xffe080)
    },
  }
}

// --- sushi conveyor ---------------------------------------------------------------

const sushi: Maker = (W, H, rng) => {
  const lanes = [Math.round(H * 0.38), Math.round(H * 0.68)]
  type Plate = { x: number; lane: number; rim: number; kind: number }
  let plates: Plate[] = []
  let stack = 0
  let grab: { x: number; y: number; t: number; p: Plate } | undefined
  let t = 0
  const RIMS = [0xe03a3a, 0x3a8ae0, 0xffd040, 0x3ac06a, 0x2a2a2a]

  for (const [li] of lanes.entries()) for (let x = 0; x < W + 10; x += 10) plates.push({ x: x + rng() * 3, lane: li, rim: irand(rng, 5), kind: irand(rng, 4) })

  return {
    step() {
      t++
      for (const p of plates) {
        p.x += p.lane ? -0.3 : 0.3
        if (p.x > W + 6) p.x -= W + 14
        if (p.x < -8) p.x += W + 14
      }
      if (grab) {
        grab.t++
        if (grab.t > 30) {
          grab = undefined
          stack++
          if (stack > 8) stack = 0
        }
      } else if (t % 120 === 60) {
        const p = plates.find(q => q.lane === 1 && q.x > W * 0.4 && q.x < W * 0.6)
        if (p) {
          grab = { x: p.x, y: lanes[1] as number, t: 0, p }
          plates = plates.filter(q => q !== p)
          plates.push({ x: W + 8, lane: 1, rim: irand(rng, 5), kind: irand(rng, 4) })
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0xf0e4d0, 0xd8c8a8)
      for (const y of lanes) {
        rect(px, W, H, 0, y - 2, W, 6, 0x9aa0a8)
        for (let x = 0; x < W; x++) if ((x + Math.floor(t * 0.3) * (y === lanes[0] ? 1 : -1)) % 3 === 0) dot(px, W, H, x, y + 3, 0x7a8088)
      }
      const drawPlate = (x: number, y: number, p: Plate) => {
        ellipse(px, W, H, x, y + 1, 4, 1.5, RIMS[p.rim] as number)
        ellipse(px, W, H, x, y + 1, 3, 1, 0xf8f8f8)
        if (p.kind < 2) {
          rect(px, W, H, x - 2, y - 1, 5, 2, 0xfafaf0)
          rect(px, W, H, x - 2, y - 2, 5, 1, p.kind ? 0xff7a5a : 0xd8302a)
          dot(px, W, H, x, y - 2, p.kind ? 0xffb090 : 0xff6a6a)
        } else if (p.kind === 2) {
          rect(px, W, H, x - 2, y - 2, 2, 3, 0x1a2a1a)
          rect(px, W, H, x + 1, y - 2, 2, 3, 0x1a2a1a)
          dot(px, W, H, x - 1, y - 1, 0xff7a5a)
          dot(px, W, H, x + 2, y - 1, 0x6ac04a)
        } else {
          rect(px, W, H, x - 2, y - 1, 5, 2, 0xfafaf0)
          rect(px, W, H, x - 2, y - 2, 5, 1, 0xffd040)
          rect(px, W, H, x - 1, y - 1, 3, 1, 0x1a2a1a)
        }
      }
      plates.forEach(p => drawPlate(p.x, (lanes[p.lane] as number) - 1, p))
      if (grab) {
        const u = grab.t / 30
        const x = grab.x + (W - 6 - grab.x) * u
        const y = grab.y - 1 + (H - 8 - stack * 2 - grab.y) * u - Math.sin(u * Math.PI) * 8
        drawPlate(x, y, grab.p)
        line(px, W, H, x + 1, y - 2, x + 6, y - 10, 0xb8885a)
        line(px, W, H, x + 2, y - 2, x + 8, y - 9, 0xd8a870)
      }
      for (let i = 0; i < stack; i++) ellipse(px, W, H, W - 6, H - 5 - i * 2, 4, 1, RIMS[i % 5] as number)
      text(px, W, H, 1, 1, String(stack), 0x5a3a1a)
    },
  }
}

// --- burger stack -----------------------------------------------------------------

const burger: Maker = (W, H, rng) => {
  const LAYERS = [
    { h: 3, c: 0xd8903a, top: 0xe8a84a, kind: 'bun' },
    { h: 2, c: 0x6a3a1e, top: 0x8a4a28, kind: 'patty' },
    { h: 1, c: 0xffc020, top: 0xffd040, kind: 'cheese' },
    { h: 1, c: 0x5ac03a, top: 0x7ad84a, kind: 'lettuce' },
    { h: 1, c: 0xe03a2a, top: 0xf05a4a, kind: 'tomato' },
    { h: 1, c: 0xf0e0f0, top: 0xffffff, kind: 'onion' },
  ]
  const cx = W / 2
  let stack: number[] = []
  let falling: { k: number; y: number; vy: number } | undefined
  let cam = 0
  let topple = 0
  let t = 0

  function reset() {
    stack = [0]
    cam = 0
    topple = 0
  }
  reset()
  const heightOf = (s: number[]) => s.reduce((h, k) => h + (LAYERS[k] as { h: number }).h, 0)

  return {
    step() {
      t++
      if (topple > 0) {
        topple++
        if (topple > 80) reset()
        return
      }
      const h = heightOf(stack)
      cam += (Math.max(0, h - H * 0.45) - cam) * 0.1
      if (!falling) {
        const k = stack.length > 14 ? 0 : 1 + irand(rng, 5)
        falling = { k, y: cam - 8 - (H - 10), vy: 0 }
        return
      }
      falling.vy += 0.15
      falling.y += falling.vy
      const surface = -(h) + 0
      if (falling.y >= surface) {
        stack.push(falling.k)
        const done = falling.k === 0
        falling = undefined
        if (done) topple = 1
      }
    },
    draw(px) {
      counter(px, W, H, H - 6)
      rect(px, W, H, cx - 9, H - 7, 18, 1, 0xf8f8f8)
      const base = H - 7 + cam
      const sway = topple > 30 ? (topple - 30) * 0.08 : Math.sin(t * 0.08) * Math.min(1.5, stack.length * 0.08)
      let y = base
      stack.forEach((k, i) => {
        const L = LAYERS[k] as { h: number; c: number; top: number; kind: string }
        y -= L.h
        const off = sway * (i / 4)
        const fallOff = topple > 30 ? ((topple - 30) ** 1.6) * 0.02 * i : 0
        const x0 = cx - 7 + off + fallOff * (i % 2 ? 1 : -1)
        const yy = y + fallOff * 0.5
        const w = L.kind === 'tomato' || L.kind === 'onion' ? 12 : 14
        const xs = x0 + (14 - w) / 2
        rect(px, W, H, xs, yy, w, L.h, L.c)
        rect(px, W, H, xs, yy, w, 1, L.top)
        if (L.kind === 'cheese') {
          dot(px, W, H, xs + 2, yy + 1, L.c)
          dot(px, W, H, xs + 10, yy + 1, L.c)
        }
        if (L.kind === 'lettuce') for (let x = 0; x < w; x += 2) dot(px, W, H, xs + x, yy - 1 + (x % 4 ? 1 : 0), L.top)
        if (L.kind === 'bun' && i > 0) {
          rect(px, W, H, xs + 1, yy - 1, 12, 1, L.top)
          for (let s = 0; s < 4; s++) dot(px, W, H, xs + 2 + s * 3, yy, 0xfff4d0)
        }
      })
      if (falling) {
        const L = LAYERS[falling.k] as { h: number; c: number; top: number }
        rect(px, W, H, cx - 7, base + falling.y, 14, L.h, L.c)
        rect(px, W, H, cx - 7, base + falling.y, 14, 1, L.top)
      }
      text(px, W, H, 1, 1, String(stack.length), 0x5a3a1a)
    },
  }
}

// --- cake frosting ----------------------------------------------------------------

const cake: Maker = (W, H, rng) => {
  const cx = W / 2
  const base = Math.round(H * 0.72)
  const cw = Math.round(W * 0.7)
  const ch = Math.round(H * 0.24)
  let rough: number[] = []
  let smooth = 0
  let t = 0
  let ang = 0
  let col = 0xffb0d0
  let dots: { a: number; y: number; c: number }[] = []

  function reset() {
    rough = Array.from({ length: 64 }, () => rng())
    smooth = 0
    t = 0
    col = pick(rng, [0xffb0d0, 0xb0d8ff, 0xfff0b0, 0xd0b0ff, 0xb0ffd0])
    dots = []
  }
  reset()

  return {
    step() {
      t++
      ang += 0.05
      if (t < 200) smooth = Math.min(1, smooth + 0.006)
      if (t > 210 && t < 300 && t % 6 === 0) dots.push({ a: -ang + rng() * 6.28, y: rng(), c: pick(rng, [0xffffff, 0xff4a8a, 0x4ab0ff, 0xffd040]) })
      if (t > 360) reset()
    },
    draw(px) {
      counter(px, W, H, base + 3)
      rect(px, W, H, cx - cw / 2 - 2, base, cw + 4, 2, 0xd0d0d8)
      rect(px, W, H, cx - 2, base + 2, 4, H - base - 2, 0xa0a0a8)
      for (let y = base - ch; y < base; y++)
        for (let x = Math.round(cx - cw / 2); x < cx + cw / 2; x++) {
          const u = (x - (cx - cw / 2)) / cw
          const a = Math.asin(clamp(u * 2 - 1, -1, 1)) + ang
          const k = Math.floor(((a % 6.28) + 6.28) % 6.28 / 6.28 * 64)
          const bump = (rough[k] as number) * (1 - smooth)
          let c = mix(col, 0xffffff, 0.25 * Math.cos((u * 2 - 1) * 1.3))
          c = scale(c, 0.9 + bump * 0.2 - Math.abs(u - 0.5) * 0.25)
          if (bump > 0.6 && (x + y) % 2) c = scale(c, 0.85)
          dot(px, W, H, x, y, c)
        }
      ellipse(px, W, H, cx, base - ch, cw / 2, 2, mix(col, 0xffffff, 0.35))
      for (const d of dots) {
        const a = d.a + ang
        const xx = cx + Math.sin(a) * cw * 0.45 * d.y
        const yy = base - ch + Math.cos(a) * 1.5 * d.y
        if (Math.cos(a) > -0.3) dot(px, W, H, xx, yy, d.c)
      }
      if (t < 200) {
        const sx = cx + cw / 2 + 1
        rect(px, W, H, sx, base - ch, 1, ch, 0xd8dce4)
        line(px, W, H, sx, base - ch, sx + 4, base - ch - 8, 0x6a4a2a)
      }
    },
  }
}

// --- frying an egg ----------------------------------------------------------------

const egg: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.55
  const R = Math.min(W / 2 - 1, H * 0.3)
  let t = 0
  let shape: number[] = []
  let salt: Spark[] = []

  function reset() {
    t = 0
    shape = Array.from({ length: 24 }, () => 0.75 + rng() * 0.4)
    salt = []
  }
  reset()

  return {
    step() {
      t++
      salt = sparks(salt, 0.1).filter(s => s.y < cy + 3)
      if (t > 180 && t < 200 && t % 2 === 0) salt.push({ x: cx + (rng() - 0.5) * 8, y: cy - R, vx: (rng() - 0.5) * 0.2, vy: 0.5, l: 40, c: 0xffffff })
      if (t > 300) reset()
    },
    draw(px) {
      sky(px, W, H, 0x2a2a30, 0x1a1a20)
      disc(px, W, H, cx, cy, R + 1, 0x4a4a52)
      disc(px, W, H, cx, cy, R, 0x2a2a30)
      line(px, W, H, cx + R, cy, W, cy + 4, 0x3a3a40)
      for (let k = 0; k < 6; k++) dot(px, W, H, cx - R * 0.6 + k * 3, cy - R * 0.5 + (k % 2) * 3, 0x3a3a42)
      const crack = span(t, 0, 25)
      if (t < 30) {
        const ey = cy - R - 6 + crack * 4
        ellipse(px, W, H, cx - crack * 3, ey, 2, 2.5, 0xf0e0c8)
        ellipse(px, W, H, cx + crack * 3, ey, 2, 2.5, 0xf0e0c8)
        if (crack > 0.5) line(px, W, H, cx, ey + 2, cx, cy, 0xf8f8f0)
      }
      const spread = ease(span(t, 20, 60))
      const set = span(t, 50, 160)
      const wr = R * 0.72 * spread
      if (spread > 0) {
        for (let y = Math.floor(cy - wr - 2); y <= cy + wr + 2; y++)
          for (let x = Math.floor(cx - wr - 2); x <= cx + wr + 2; x++) {
            const a = Math.atan2(y - cy, x - cx)
            const k = Math.floor(((a + Math.PI) / (Math.PI * 2)) * 24) % 24
            const rr = wr * (shape[k] as number)
            const d = Math.hypot(x - cx, y - cy)
            if (d > rr) continue
            let c = mix(0xd8d8d0, 0xffffff, set)
            if (d > rr - 1 && set > 0.6) c = hash(x, y, 3) > 0.5 ? 0xc8883a : 0xe0b070
            if (set < 1 && hash(x, y + t, 5) > 0.93) c = 0xffffff
            dot(px, W, H, x, y, c)
          }
        const wob = Math.sin(t * 0.3) * 0.3 * (1 - set)
        disc(px, W, H, cx + 1, cy - 1 + wob, 2.6, 0xffb020)
        dot(px, W, H, cx, cy - 2 + wob, 0xffe080)
      }
      for (const s of salt) dot(px, W, H, s.x, s.y, s.c)
      if (set > 0.2 && set < 1) for (let k = 0; k < 3; k++) dot(px, W, H, cx - wr + hash(k, t, 1) * wr * 2, cy - wr - 1 - hash(t, k, 2) * 3, 0xffe8c0)
    },
  }
}

// --- bubble tea -------------------------------------------------------------------

const boba: Maker = (W, H, rng) => {
  const cx = W / 2
  const top = Math.round(H * 0.22)
  const bottom = H - 4
  const cw = Math.round(W * 0.56)
  let pearls: { x: number; y: number; vy: number; rest: boolean; up: number }[] = []
  let tea = 0
  let t = 0
  let tint = 0xd8a878

  function reset() {
    pearls = []
    tea = 0
    t = 0
    tint = pick(rng, [0xd8a878, 0xe0b0c8, 0xa8d090, 0xc8a8e0])
  }
  reset()
  const wAt = (y: number) => cw / 2 - ((y - top) / (bottom - top)) * 2

  return {
    step() {
      t++
      if (t < 50 && t % 2 === 0) pearls.push({ x: cx + (rng() - 0.5) * cw * 0.7, y: top - 4, vy: 0, rest: false, up: 0 })
      for (const p of pearls) {
        if (p.up > 0) {
          p.y -= 1.2
          continue
        }
        if (p.rest) continue
        p.vy += 0.15
        p.y += p.vy
        const below = pearls.filter(q => q !== p && q.rest && Math.abs(q.x - p.x) < 2 && q.y > p.y)
        const floorY = Math.min(bottom - 2, ...below.map(q => q.y - 2))
        if (p.y >= floorY) {
          p.y = floorY
          p.rest = true
        }
      }
      if (t > 60 && t < 140) tea = Math.min(1, tea + 0.0125)
      if (t > 190) {
        tea = Math.max(0, tea - 0.004)
        if (t % 6 === 0) {
          const p = pearls.find(q => q.up === 0 && Math.abs(q.x - cx) < 4)
          if (p) {
            p.up = 1
            p.x = cx
          }
        }
      }
      pearls = pearls.filter(p => p.y > -4)
      if (t > 420) reset()
    },
    draw(px) {
      sky(px, W, H, 0xffe0e8, 0xffd0b8)
      const level = bottom - tea * (bottom - top - 4)
      for (let y = top; y <= bottom; y++) {
        const hw = wAt(y)
        rect(px, W, H, cx - hw, y, hw * 2, 1, y > level ? mix(tint, 0xffffff, (y - level) / (bottom - level + 1) * 0.15) : 0xf4f0f4)
        dot(px, W, H, cx - hw, y, 0xd8d0e0)
        dot(px, W, H, cx + hw, y, 0xd8d0e0)
      }
      rect(px, W, H, cx - cw / 2 - 1, top - 1, cw + 2, 1, 0xe0d8e8)
      if (tea > 0.3) for (let k = 0; k < 3; k++) rect(px, W, H, cx - 5 + k * 4, level + 2 + k * 3, 3, 3, 0xe8f4ff)
      for (const p of pearls) {
        disc(px, W, H, p.x, p.y, 1.1, 0x2a1a14)
        dot(px, W, H, p.x - 0.5, p.y - 0.5, 0x5a3a2a)
      }
      if (t > 160) {
        const sy = top - 10 + Math.min(1, (t - 160) / 20) * 14
        rect(px, W, H, cx - 1, sy, 3, bottom - sy, 0xff6aa0)
        rect(px, W, H, cx, sy, 1, bottom - sy, 0xff9ac0)
      }
      for (let y = top + 3; y < top + 9; y++) if (t > 140) rect(px, W, H, cx - wAt(y) + 1, y, 1, 1, 0xffffff)
    },
  }
}

// --- fruit slicing board ----------------------------------------------------------

const fruitboard: Maker = (W, H, rng) => {
  const board = Math.round(H * 0.6)
  const FRUITS = [
    { skin: 0xe02a3a, flesh: 0xff7a8a, seed: 0xffe080, r: 4 },
    { skin: 0x8a6a3a, flesh: 0x8ad83a, seed: 0x1a1a1a, r: 4 },
    { skin: 0xff9a1a, flesh: 0xffc060, seed: 0xffe8b0, r: 5 },
    { skin: 0xf0e040, flesh: 0xfff8c0, seed: 0xe8d890, r: 4 },
  ]
  let fi = 0
  let cuts = 0
  let t = 0
  let knifeY = 0
  let slices: { x: number; tilt: number }[] = []

  return {
    step() {
      t++
      const phase = t % 20
      knifeY = phase < 10 ? phase / 10 : 1 - (phase - 10) / 10
      if (phase === 10) {
        cuts++
        const f = FRUITS[fi] as { r: number }
        slices.push({ x: W * 0.3 + cuts * 2.2, tilt: 0 })
        if (cuts * 2.2 > f.r * 2) {
          cuts = 0
          fi = (fi + 1) % FRUITS.length
          slices = []
        }
      }
      for (const s of slices) s.tilt = Math.min(1, s.tilt + 0.1)
      void rng
    },
    draw(px) {
      counter(px, W, H, board + 6)
      rect(px, W, H, 1, board, W - 2, 6, 0xd8b078)
      rect(px, W, H, 1, board, W - 2, 1, 0xe8c890)
      for (let x = 3; x < W - 3; x += 4) dot(px, W, H, x, board + 3, 0xc8a068)
      const f = FRUITS[fi] as { skin: number; flesh: number; seed: number; r: number }
      const fx = W * 0.3 + f.r
      const cutX = W * 0.3 + cuts * 2.2
      for (let y = board - f.r * 2; y < board; y++)
        for (let x = Math.floor(cutX); x < fx + f.r; x++) {
          const d = Math.hypot(x - fx, y - (board - f.r))
          if (d > f.r) continue
          dot(px, W, H, x, y, x <= cutX + 0.5 ? f.flesh : d > f.r - 1 ? scale(f.skin, 0.85) : f.skin)
        }
      slices.forEach((s, i) => {
        const x = W * 0.12 + i * 1.6 * s.tilt + (1 - s.tilt) * (s.x - W * 0.12)
        const h = Math.round(f.r * 2 * Math.sqrt(Math.max(0.1, 1 - ((s.x - fx) / f.r) ** 2)))
        rect(px, W, H, x, board - h, 2, h, f.flesh)
        dot(px, W, H, x, board - h, f.skin)
        dot(px, W, H, x + 1, board - h / 2, f.seed)
      })
      const kx = cutX + 1
      const ky = board - f.r * 2 - 6 + knifeY * (f.r * 2 + 6)
      rect(px, W, H, kx, ky - 8, 1, 8, 0xe0e6ee)
      rect(px, W, H, kx + 1, ky - 8, 1, 8, 0xb0b8c0)
      rect(px, W, H, kx, ky - 14, 2, 6, 0x2a2a2a)
    },
  }
}

// --- donut glazing ----------------------------------------------------------------

const glaze: Maker = (W, H, rng) => {
  const belt = Math.round(H * 0.68)
  const curtainX = Math.round(W * 0.45)
  type D = { x: number; glazed: number; spr: number[]; c: number }
  let ds: D[] = []
  let t = 0
  for (let x = -4; x < W + 8; x += 11) ds.push({ x, glazed: x > curtainX ? 1 : 0, spr: [], c: 0 })

  return {
    step() {
      t++
      for (const d of ds) {
        d.x += 0.25
        if (Math.abs(d.x - curtainX) < 4) d.glazed = Math.min(1, d.glazed + 0.05)
        if (d.glazed >= 1 && d.x > curtainX + 8 && d.spr.length < 8 && rng() < 0.3) d.spr.push(irand(rng, 4) * 100 + irand(rng, 7))
      }
      ds = ds.filter(d => d.x < W + 8)
      if (Math.min(...ds.map(d => d.x)) > 6) ds.push({ x: -6, glazed: 0, spr: [], c: 0 })
    },
    draw(px) {
      sky(px, W, H, 0xf0f4f8, 0xd8e0e8)
      rect(px, W, H, 0, belt, W, 2, 0x8a9098)
      for (let x = 0; x < W; x++) if ((x + Math.floor(t * 0.25)) % 4 === 0) dot(px, W, H, x, belt + 1, 0x6a7078)
      rect(px, W, H, 0, belt + 2, W, H - belt - 2, 0xb8c0c8)
      rect(px, W, H, curtainX - 4, 0, 9, 6, 0xa0a8b0)
      for (let x = curtainX - 3; x <= curtainX + 3; x++) for (let y = 6; y < belt - 2; y++) if ((x + y + t) % 5) dot(px, W, H, x, y, 0xfff8f0)
      for (let x = curtainX - 4; x <= curtainX + 4; x++) dot(px, W, H, x, belt - 1, 0xffffff)
      for (const d of ds) {
        const y = belt - 3
        ellipse(px, W, H, d.x, y, 4, 2.2, 0xd89048)
        if (d.glazed > 0) {
          for (let x = -4; x <= 4; x++) if (Math.abs(x) / 4 < d.glazed * 1.2) dot(px, W, H, d.x + x, y - 1, 0xfff0f4)
          ellipse(px, W, H, d.x, y - 1, 3.5 * d.glazed, 1.4 * d.glazed, 0xfff0f4)
          if (d.glazed >= 1) {
            dot(px, W, H, d.x - 3, y + 1, 0xfff0f4)
            dot(px, W, H, d.x + 2, y + 1, 0xfff0f4)
          }
        }
        ellipse(px, W, H, d.x, y - 1, 1.2, 0.6, 0xb8c0c8)
        for (const s of d.spr) dot(px, W, H, d.x - 3 + (s % 100), y - 2 + (s % 2), [0xff4a6a, 0x4ab0ff, 0xffd040, 0x6ad04a][Math.floor(s / 100)] as number)
      }
    },
  }
}

// --- smash burger -----------------------------------------------------------------

const smashburger: Maker = (W, H, rng) => {
  const grill = Math.round(H * 0.66)
  const cx = W / 2
  let t = 0
  let sizzle: Spark[] = []

  return {
    step() {
      t++
      sizzle = sparks(sizzle, -0.02)
      if (t > 50 && t < 220 && rng() < 0.4) sizzle.push({ x: cx + (rng() - 0.5) * 16, y: grill - 2, vx: (rng() - 0.5) * 0.3, vy: -0.3 - rng() * 0.4, l: 14, c: 0xe8e8e8 })
      if (t === 60) burst(sizzle, rng, cx, grill - 2, 0xffd080, 14, 1.2)
      if (t > 300) t = 0
    },
    draw(px) {
      sky(px, W, H, 0x2a2420, 0x3a2e26, grill)
      rect(px, W, H, 0, grill, W, 3, 0x4a4a50)
      rect(px, W, H, 0, grill + 3, W, H - grill - 3, 0x2a2a2e)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, grill + 1, 0x5a5a62)
      const flat = ease(span(t, 40, 60))
      const brown = span(t, 60, 160)
      const flipped = t > 170
      const pw = 6 + flat * 10
      const ph = 6 - flat * 3.5
      const meat = mix(0xc84a5a, 0x5a2a14, flipped ? 0.85 : brown * 0.6)
      if (t > 10) ellipse(px, W, H, cx, grill - ph / 2, pw / 2, ph / 2, meat)
      if (flipped) for (let k = 0; k < 6; k++) dot(px, W, H, cx - pw / 2 + 2 + k * 2, grill - ph + 1, 0x3a1a0a)
      if (t > 200) {
        const melt = span(t, 200, 250)
        rect(px, W, H, cx - 5, grill - ph - 1, 10, 1, 0xffc020)
        rect(px, W, H, cx - 5, grill - ph, 1, melt * 2, 0xffc020)
        rect(px, W, H, cx + 4, grill - ph, 1, melt * 2.5, 0xffc020)
      }
      if (t < 10) disc(px, W, H, cx, grill - 3 - (10 - t) * 2, 3, 0xc84a5a)
      const press = t < 40 ? -14 + span(t, 15, 40) * 8 : t < 60 ? -6 + flat * 6 - (6 - ph) : t < 80 ? -ph - 1 - span(t, 60, 80) * 14 : -30
      rect(px, W, H, cx - 8, grill + press - 3, 16, 2, 0xb0b8c0)
      rect(px, W, H, cx - 1, grill + press - 9, 2, 6, 0x3a3a3a)
      if (t > 160 && t < 176) {
        const u = (t - 160) / 16
        rect(px, W, H, cx - 8, grill - 2 - Math.sin(u * Math.PI) * 10, 14, 1, 0xd0d8e0)
      }
      for (const s of sizzle) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- cotton candy -----------------------------------------------------------------

const cottoncandy: Maker = (W, H, rng) => {
  const cx = W / 2
  const bowl = Math.round(H * 0.72)
  let t = 0
  let fluff: { a: number; r: number; y: number }[] = []
  let col = 0xff9ad0

  return {
    step() {
      t++
      if (t < 240 && t % 2 === 0) fluff.push({ a: rng() * 6.28, r: rng(), y: rng() })
      if (t > 330) {
        t = 0
        fluff = []
        col = col === 0xff9ad0 ? 0x9ad0ff : 0xff9ad0
      }
    },
    draw(px) {
      sky(px, W, H, 0xfff0f8, 0xe8f0ff)
      ellipse(px, W, H, cx, bowl, W * 0.45, 4, 0xd0d8e0)
      rect(px, W, H, cx - W * 0.45, bowl, W * 0.9, H - bowl, 0xe8a0c0)
      for (let x = 0; x < W; x += 4) rect(px, W, H, x, bowl + 2, 2, H - bowl - 2, 0xffffff)
      for (let k = 0; k < 12; k++) {
        const a = t * 0.3 + k * 0.5
        dot(px, W, H, cx + Math.cos(a) * W * 0.4, bowl - 1 + Math.sin(a) * 2, mix(col, 0xffffff, 0.4))
      }
      const lift = t > 240 ? span(t, 240, 280) * H * 0.2 : 0
      const n = fluff.length
      const size = 2 + Math.sqrt(n) * 0.9
      const sy = bowl - 8 - size - lift
      const spin = t * 0.15
      for (const f of fluff) {
        const a = f.a + spin
        const r = size * Math.sqrt(f.r)
        const x = cx + Math.cos(a) * r
        const y = sy + (f.y - 0.5) * size * 1.6 + Math.sin(a) * r * 0.3
        dot(px, W, H, x, y, f.r > 0.7 ? mix(col, 0xffffff, 0.3) : col)
      }
      line(px, W, H, cx, sy, cx + (t > 240 ? 0 : Math.cos(spin) * 1), H - 2 - lift, 0xf8f0e0)
    },
  }
}

// --- ice cream tower --------------------------------------------------------------

const icecream: Maker = (W, H, rng) => {
  const cx = W / 2
  const coneTop = Math.round(H * 0.72)
  type S = { c: number; dx: number }
  let scoops: S[] = []
  let fall: { c: number; y: number; vy: number; x: number } | undefined
  let topple = 0
  let t = 0
  const FLAV = [0xfff4e0, 0xff9ac0, 0x6a3a1a, 0x9ae0b0, 0xffe080, 0xc0a0ff]

  return {
    step() {
      t++
      if (topple > 0) {
        topple++
        if (topple > 70) {
          scoops = []
          topple = 0
        }
        return
      }
      const sway = Math.sin(t * 0.07) * scoops.length * 0.18
      if (!fall) fall = { c: pick(rng, FLAV), y: -6, vy: 0, x: cx + (rng() - 0.5) * 2 }
      fall.vy += 0.12
      fall.y += fall.vy
      const topY = coneTop - scoops.length * 4 - 2
      if (fall.y >= topY) {
        scoops.push({ c: fall.c, dx: fall.x - cx + sway })
        fall = undefined
        if (scoops.length >= 9 || (scoops.length > 5 && rng() < 0.15)) topple = 1
      }
    },
    draw(px) {
      sky(px, W, H, 0x9ad8ff, 0xfff0d0)
      for (let y = coneTop; y < H; y++) {
        const hw = Math.max(0, 4 * (1 - (y - coneTop) / (H - coneTop)))
        rect(px, W, H, cx - hw, y, hw * 2, 1, 0xd8a050)
        if ((y + Math.floor(cx)) % 3 === 0) rect(px, W, H, cx - hw, y, hw * 2, 1, 0xb8803a)
      }
      const sway = Math.sin(t * 0.07) * scoops.length * 0.18
      scoops.forEach((s, i) => {
        const fallX = topple > 20 ? (topple - 20) ** 1.5 * 0.05 * i : 0
        const x = cx + s.dx + sway * (i / Math.max(1, scoops.length)) + fallX
        const y = coneTop - i * 4 - 2 + (topple > 20 ? (topple - 20) ** 1.7 * 0.02 * i : 0)
        disc(px, W, H, x, y, 3, s.c)
        dot(px, W, H, x - 1, y - 2, mix(s.c, 0xffffff, 0.5))
        dot(px, W, H, x + 2, y + 2, scale(s.c, 0.85))
      })
      if (fall) disc(px, W, H, fall.x, fall.y, 3, fall.c)
      text(px, W, H, 1, 1, String(scoops.length), 0x3a5a7a)
    },
  }
}

// --- rubber-band watermelon -------------------------------------------------------

const watermelon: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.58
  const R = Math.min(W * 0.42, H * 0.22)
  let bands = 0
  let t = 0
  let boom: Spark[] = []
  let burst2 = 0

  return {
    step() {
      t++
      boom = sparks(boom, 0.12)
      if (burst2 > 0) {
        if (++burst2 > 80) {
          burst2 = 0
          bands = 0
          t = 0
        }
        return
      }
      if (t % 14 === 0) bands++
      if (bands > 16 + irand(rng, 6)) {
        burst2 = 1
        burst(boom, rng, cx, cy, 0xff3a4a, 40, 2)
        burst(boom, rng, cx, cy, 0x2a8a2a, 16, 1.6)
        burst(boom, rng, cx, cy, 0x1a1a1a, 8, 1.2)
      }
    },
    draw(px) {
      counter(px, W, H, Math.round(cy + R + 1))
      if (!burst2) {
        const squeeze = bands * 0.012
        const shake = bands > 10 ? Math.sin(t * 1.3) * (bands - 10) * 0.08 : 0
        for (let y = Math.floor(cy - R * 1.1); y <= cy + R * 1.1; y++) {
          const k = (y - cy) / R
          const pinch = 1 - squeeze * Math.exp(-k * k * 8)
          const hw = R * 1.15 * Math.sqrt(Math.max(0, 1 - (k / (1 + squeeze)) ** 2)) * pinch
          for (let x = Math.round(cx - hw + shake); x <= cx + hw + shake; x++) {
            const stripe = Math.sin((x - cx) * 0.9 + k) > 0.4
            dot(px, W, H, x, y, stripe ? 0x1a6a2a : 0x3aa03a)
          }
        }
        for (let b = 0; b < bands; b++) {
          const y = cy - 1 + (b % 3) - 1
          const hw = R * 1.15 * (1 - squeeze)
          line(px, W, H, cx - hw + shake, y, cx + hw + shake, y, hsv(b * 0.13, 0.7, 1))
        }
      } else {
        disc(px, W, H, cx, cy + R * 0.8, R * 0.8, 0x3aa03a)
        disc(px, W, H, cx, cy + R * 0.8, R * 0.6, 0xff4a5a)
      }
      for (const b of boom) dot(px, W, H, b.x, b.y, b.c)
      text(px, W, H, 1, 1, String(bands), 0x5a3a1a)
    },
  }
}

export const FOOD = {
  pancakes,
  ramen,
  pizza,
  popcorn,
  sushi,
  burger,
  cake,
  egg,
  boba,
  fruitboard,
  glaze,
  smashburger,
  cottoncandy,
  icecream,
  watermelon,
}
