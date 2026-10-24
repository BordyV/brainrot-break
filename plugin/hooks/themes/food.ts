import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, clamp, ellipse, hash, irand, line, lit, pick, ring, rot, shade, slab, sparks, tones } from '../kit'
import type { Spark } from '../kit'

// Food & cooking: a satisfying transformation or a growing pile.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)
const ease = (u: number) => u * u * (3 - 2 * u)

function counter(px: Uint32Array, W: number, H: number, top: number) {
  // tiles lit on their top edge and shaded on their right, a wooden counter with a lit lip and grain
  sky(px, W, H, 0xf4e8d8, 0xe2ccb2, top)
  for (let y = 3; y < top - 2; y += 6)
    for (let x = (y / 6) % 2 ? 0 : 3; x < W; x += 6) {
      rect(px, W, H, x, y, 5, 5, 0xf8f0e6)
      rect(px, W, H, x, y, 5, 1, 0xfffaf2)
      rect(px, W, H, x + 4, y + 1, 1, 4, 0xe8dccb)
    }
  rect(px, W, H, 0, top, W, H - top, 0x9a6a42)
  rect(px, W, H, 0, top, W, 1, 0xc8945e)
  rect(px, W, H, 0, top + 1, W, 1, 0x7a5032)
  for (let y = top + 3; y < H; y += 3) for (let x = (y * 7) % 5; x < W; x += 9) rect(px, W, H, x, y, 4, 1, 0x8a5c38)
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
      const pw = Math.max(6, Math.round(W * 0.36))
      // a pancake: a lit top, the golden side, a browned underside
      const cake = (x: number, y: number, w: number, c: number) => {
        rect(px, W, H, x - w / 2 + 1, y, w - 2, 1, mix(c, 0xfff0c0, 0.4))
        rect(px, W, H, x - w / 2, y + 1, w, 1, c)
        rect(px, W, H, x - w / 2, y + 2, w, 1, scale(c, 0.75))
        dot(px, W, H, x + w / 2 - 1, y + 1, scale(c, 0.85))
      }
      // the pan: a lit rim, a dark inside, a wooden handle to the left
      rect(px, W, H, 0, top - 3, panX - pw / 2 - 1, 1, 0x7a5434)
      rect(px, W, H, 0, top - 2, panX - pw / 2 - 1, 1, 0x4a321e)
      ellipse(px, W, H, panX, top - 1.5, pw / 2 + 1.5, 1.5, 0x1a1a20)
      rect(px, W, H, panX - pw / 2 - 1, top - 3, pw + 2, 1, 0x4a4a56)
      rect(px, W, H, panX - pw / 2 - 1, top - 3, 3, 1, 0x8a8a98)
      // the plate and its shadow
      ellipse(px, W, H, plateX + 1, top + 0.5, pw / 2 + 2, 1, 0x7a5434)
      rect(px, W, H, plateX - pw / 2 - 2, top - 1, pw + 4, 1, 0xf4f4f8)
      rect(px, W, H, plateX - pw / 2 - 1, top, pw + 2, 1, 0xb8bcc8)
      for (let i = 0; i < stack; i++) cake(plateX, top - 4 - i * 3, pw, i % 2 ? 0xd89848 : 0xe0a050)
      if (syrup > 0) {
        const y0 = top - 4 - (stack - 1) * 3
        const drip = Math.min(stack * 3, syrup / 5)
        rect(px, W, H, plateX - pw / 2 + 1, y0, pw - 2, 1, 0x9a4a10)
        dot(px, W, H, plateX - pw / 2 + 2, y0, 0xd88a3a)
        rect(px, W, H, plateX - pw / 2, y0 + 1, 1, drip, 0x8a3a0c)
        rect(px, W, H, plateX + pw / 2 - 1, y0 + 1, 1, drip * 0.7, 0x8a3a0c)
        slab(px, W, H, plateX - 1, y0 - 2, 3, 2, 0xfff0a0)
      }
      if (syrup > 0) return
      // cook, bubble, flip once, flip onto the plate
      const cook = span(t, 0, 50)
      const c = mix(0xf8e0b0, 0xe0a050, cook)
      if (t < 55) {
        cake(panX, top - 6, pw - 2, c)
        if (t > 20) for (let k = 0; k < 4; k++) if ((t + k * 7) % 14 < 4) dot(px, W, H, panX - 4 + k * 3, top - 6, 0xfff0d0)
      } else if (t < 85) {
        const u = (t - 55) / 30
        const y = top - 6 - Math.sin(u * Math.PI) * H * 0.35
        const a = u * Math.PI * 2
        const hw = (pw / 2 - 1) * Math.abs(Math.cos(a)) + 0.5
        rect(px, W, H, panX - hw, y, hw * 2, 2, Math.cos(a) > 0 ? mix(c, 0xfff0c0, 0.25) : scale(c, 0.8))
      } else if (t < 110) cake(panX, top - 6, pw - 2, 0xd89040)
      else {
        const u = (t - 110) / 40
        const x = panX + (plateX - panX) * ease(u)
        const y = top - 6 - Math.sin(u * Math.PI) * H * 0.3 + u * (2 - stack * 3)
        cake(x, y, pw, 0xe0a050)
      }
      for (let k = 0; k < 3; k++) {
        const s = ((t * 0.3 + k * 10) % 20) / 20
        dot(px, W, H, panX - 3 + k * 3 + Math.sin(t * 0.1 + k) * 1, top - 8 - s * 12, mix(0xffffff, 0xf4e8d8, s))
      }
    },
  }
}

// --- ramen pull -------------------------------------------------------------------

const ramen: Maker = (W, H, rng) => {
  const cx = W / 2
  const by = Math.round(H * 0.62)
  const R = W * 0.42
  const D = R * 0.9
  let t = 0
  void rng

  return {
    step() {
      t++
    },
    draw(px) {
      // a warm wall, a wooden counter, the bowl's shadow on it
      sky(px, W, H, 0x2e1a1c, 0x5a2c24, by)
      rect(px, W, H, 0, by, W, H - by, 0x4a2c1c)
      for (let x = 2; x < W; x += 5) rect(px, W, H, x, by + 1, 1, H - by, 0x3e2416)
      rect(px, W, H, 0, by, W, 1, 0x8a5a36)
      ellipse(px, W, H, cx + 1.5, by + D, R * 0.85, 2, 0x2a170e)
      // the bowl, lit from the upper left: highlight, base, shadow, deep, outline
      for (let y = by; y < by + D; y++) {
        const k = (y - by) / D
        const hw = R * Math.sqrt(Math.max(0, 1 - k * k))
        const band = k > 0.18 && k < 0.34
        for (let x = Math.ceil(cx - hw); x <= Math.floor(cx + hw); x++) {
          const u = (x - cx) / Math.max(1, hw)
          const light = -u * 0.7 + 0.25 - k * 0.7
          const edge = x === Math.ceil(cx - hw) || x === Math.floor(cx + hw) || y >= by + D - 1
          let c = light > 0.45 ? 0xe8584a : light > 0 ? 0xc82a2a : light > -0.45 ? 0x921c24 : 0x5e1018
          if (band) c = (x + y) % 4 === 0 ? c : light > 0.2 ? 0xf8ecd8 : light > -0.3 ? 0xe0ccb0 : 0xa89078
          dot(px, W, H, x, y, edge ? 0x2a0a10 : c)
        }
      }
      // the rim, then the broth: darker at the edge, a gloss streak
      ellipse(px, W, H, cx, by, R, 3.5, 0xa82228)
      for (let x = Math.ceil(cx - R); x <= cx; x++) dot(px, W, H, x, by - 3.5 * Math.sqrt(Math.max(0, 1 - ((x - cx) / R) ** 2)), 0xff8a78)
      ellipse(px, W, H, cx, by, R - 1, 2.5, 0x9a5a1e)
      ellipse(px, W, H, cx - 0.5, by - 0.3, R - 2.5, 1.8, 0xd8903a)
      rect(px, W, H, cx - R * 0.55, by - 1, R * 0.35, 1, 0xf0b860)
      // toppings: egg, chashu, naruto, nori, spring onion
      disc(px, W, H, cx - R * 0.45, by - 0.5, 2, 0xfff4e0)
      disc(px, W, H, cx - R * 0.45, by - 0.5, 1, 0xff9a1a)
      dot(px, W, H, cx - R * 0.45 - 0.5, by - 1, 0xffd060)
      dot(px, W, H, cx - R * 0.45 + 1.5, by + 0.5, 0xd8c8b0)
      disc(px, W, H, cx + R * 0.62, by + 0.3, 1.6, 0xf0d0b0)
      disc(px, W, H, cx + R * 0.62, by + 0.3, 0.9, 0xb8644a)
      disc(px, W, H, cx + R * 0.05, by + 0.5, 1.4, 0xffffff)
      dot(px, W, H, cx + R * 0.05, by + 0.5, 0xff5a8a)
      dot(px, W, H, cx + R * 0.05 + 1, by + 1.5, 0xd8d0c8)
      rect(px, W, H, cx + R * 0.3, by - 3, 4, 4, 0x1a3a1e)
      rect(px, W, H, cx + R * 0.3, by - 3, 1, 4, 0x2e5a32)
      rect(px, W, H, cx + R * 0.3, by - 3, 4, 1, 0x2e5a32)
      for (const [i, [u, v]] of ([[-0.15, -0.6], [0.22, 0.7], [-0.7, 0.8], [0.45, -1.2]] as const).entries())
        dot(px, W, H, cx + u * R, by + v, i % 2 ? 0x8ae05a : 0x3a9a2a)
      // the noodles: two strands behind, two in front, each with a highlight and a shadow
      const lift = (Math.sin(t * 0.05) + 1) / 2
      const top = by - 4 - lift * H * 0.35
      for (const k of [1, 3, 0, 2]) {
        const x0 = cx - 3 + k * 2
        const back = k % 2 === 1
        for (let y = top; y < by; y += 0.5) {
          const w = Math.cos(y * 0.6 + k)
          const c = w > 0.4 ? 0xfff2b8 : w > -0.5 ? 0xf0d478 : 0xc8a040
          dot(px, W, H, x0 + Math.sin(y * 0.6 + k) * 0.8, y, back ? mix(c, 0x5a2c24, 0.25) : c)
        }
      }
      // chopsticks, two pixels wide: a lit edge and a shaded one
      line(px, W, H, cx - 4, top - 1, cx + 10, top - 14, 0xd8a868)
      line(px, W, H, cx - 3, top - 1, cx + 11, top - 14, 0x8a5a32)
      line(px, W, H, cx + 3, top - 1, cx + 12, top - 12, 0xe8bc80)
      line(px, W, H, cx + 4, top - 1, cx + 13, top - 12, 0x9a6a3a)
      for (let k = 0; k < 6; k++) {
        const s = ((t * 0.4 + k * 9) % 30) / 30
        const x = cx - R * 0.6 + k * (R * 0.25) + Math.sin(t * 0.07 + k) * 1.5
        const y = by - 2 - s * 18
        dot(px, W, H, x, y, mix(0xf4f0ec, 0x3a1e1e, s))
        if (s < 0.5) dot(px, W, H, x + 1, y - 1, mix(0xf4f0ec, 0x3a1e1e, s + 0.3))
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
      sky(px, W, H, 0x3a2a24, 0x241812)
      // a wooden board, then the crust lit from the upper left, the dough, the sauce
      lit(px, W, H, cx + 0.5, cy + 1, R + 4, R + 4, 0x8a5a32, 0x4a2c16)
      lit(px, W, H, cx, cy, R + 2, R + 2, 0xd8984e, 0x7a4418)
      disc(px, W, H, cx, cy, R, 0xe8c080)
      const sauce = span(t, 0, 20)
      if (sauce > 0) {
        disc(px, W, H, cx, cy, (R - 1) * sauce, 0xa82420)
        disc(px, W, H, cx - 0.5, cy - 0.5, (R - 2) * sauce, 0xc8302a)
      }
      for (const p of tops) {
        const fall = clamp((p.land - t) / 10, 0, 1)
        const [dx, dy] = rot(p.r, 0, p.a + ang)
        const x = cx + dx
        const y = cy + dy - fall * 20
        if (p.kind === 0) {
          dot(px, W, H, x, y, 0xfff0b0)
          dot(px, W, H, x + 1, y, 0xffe08a)
          dot(px, W, H, x, y + 1, 0xe8c070)
        } else if (p.kind === 1) lit(px, W, H, x, y, 1.4, 1.4, 0xc0282a)
        else if (p.kind === 2) {
          dot(px, W, H, x, y, 0x3a9a3a)
          dot(px, W, H, x + 1, y - 1, 0x6ac04a)
        } else if (p.kind === 3) {
          for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]] as const) dot(px, W, H, x + ox, y + oy, 0x2a2a2a)
          dot(px, W, H, x - 1, y - 1, 0x6a6a6a)
        } else {
          dot(px, W, H, x, y, 0xf0a030)
          dot(px, W, H, x + 1, y, 0xc87018)
        }
      }
      if (phase) {
        for (let k = 0; k < 4; k++) {
          const [dx, dy] = rot(R, 0, ang + (k / 4) * Math.PI)
          line(px, W, H, cx - dx, cy - dy, cx + dx, cy + dy, 0x7a4a24)
        }
        if (t > 340) {
          const u = span(t, 340, 380)
          const [dx, dy] = rot(R * 0.5, 0, ang + Math.PI / 8)
          for (let y = 0; y < 3; y++) {
            line(px, W, H, cx + dx * 0.3, cy + dy * 0.3 - u * 14 + y, cx + dx * 0.3, cy + dy * 0.3 + y, 0xfff0b0)
            line(px, W, H, cx + dx * 0.3 + 1, cy + dy * 0.3 - u * 14 + y, cx + dx * 0.3 + 1, cy + dy * 0.3 + y, 0xe8c070)
          }
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
      sky(px, W, H, 0x34344a, 0x1e1e2a)
      // the stove and its gas flames: blue at the root, orange at the tip
      rect(px, W, H, 0, potBottom + 2, W, H - potBottom - 2, 0x26262c)
      rect(px, W, H, 0, potBottom + 4, W, 1, 0x3a3a44)
      for (let x = potL + 1; x < potR - 1; x += 3) {
        const f = (t + x * 3) % 6 < 3
        dot(px, W, H, x, potBottom + 2, f ? 0xffd040 : 0xff8a2a)
        dot(px, W, H, x, potBottom + 3, 0x3a7aff)
      }
      // the pot: a faint glass inside, steel walls lit on the left and shaded on the right
      shade(px, W, H, potL, potTop, potR - potL, potBottom - potTop + 1, 0x8aa0c0, 0.1)
      rect(px, W, H, potL - 2, potTop, 1, potBottom - potTop + 2, 0xd0d8e4)
      rect(px, W, H, potL - 1, potTop, 1, potBottom - potTop + 2, 0x8a94a4)
      rect(px, W, H, potR, potTop, 1, potBottom - potTop + 2, 0x6a7280)
      rect(px, W, H, potR + 1, potTop, 1, potBottom - potTop + 2, 0x4a525e)
      rect(px, W, H, potL - 2, potBottom + 1, potR - potL + 4, 1, 0x5a6270)
      slab(px, W, H, potL - 5, potTop + 2, 3, 2, 0x3a3a42)
      slab(px, W, H, potR + 2, potTop + 2, 3, 2, 0x3a3a42)
      for (const k of kernels) {
        if (k.popped) {
          lit(px, W, H, k.x, k.y, 1.4, 1.2, k.c)
          dot(px, W, H, k.x + 1, k.y + 1, 0xf0d890)
        } else {
          dot(px, W, H, k.x, k.y, 0xe8b030)
          dot(px, W, H, k.x + 1, k.y, 0xb07a18)
        }
      }
      const lw = potR - potL + 4
      if (lid.vy === 0 && lid.y < potTop) {
        rect(px, W, H, potL - 2, lid.y, lw, 1, 0xe0e8f0)
        rect(px, W, H, potL - 2, lid.y + 1, lw, 1, 0x8a94a4)
        slab(px, W, H, W / 2 - 1, lid.y - 1, 3, 1, 0x3a3a3a)
      } else if (lid.vy !== 0) {
        const [dx, dy] = rot(lw / 2, 0, lid.a)
        line(px, W, H, W / 2 - dx, lid.y - dy + 1, W / 2 + dx, lid.y + dy + 1, 0x8a94a4)
        line(px, W, H, W / 2 - dx, lid.y - dy, W / 2 + dx, lid.y + dy, 0xe0e8f0)
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
      // a cream wall under an indigo banner, two lit conveyor belts
      sky(px, W, H, 0xf0e4d0, 0xd8c4a4)
      rect(px, W, H, 0, 0, W, Math.round(H * 0.12), 0x24305a)
      rect(px, W, H, 0, Math.round(H * 0.12), W, 1, 0x161e3c)
      disc(px, W, H, W / 2, H * 0.06, 1.5, 0xf4f0e8)
      for (const y of lanes) {
        rect(px, W, H, 0, y - 2, W, 6, 0x8a9098)
        rect(px, W, H, 0, y - 2, W, 1, 0xc8ccd4)
        rect(px, W, H, 0, y + 3, W, 1, 0x4a5058)
        rect(px, W, H, 0, y + 4, W, 1, 0xb8a888)
        for (let x = 0; x < W; x++) if ((x + Math.floor(t * 0.3) * (y === lanes[0] ? 1 : -1)) % 3 === 0) dot(px, W, H, x, y + 2, 0x6a7078)
      }
      const drawPlate = (x: number, y: number, p: Plate) => {
        const rim = RIMS[p.rim] as number
        ellipse(px, W, H, x, y + 1.6, 4, 1.5, scale(rim, 0.6))
        ellipse(px, W, H, x, y + 1, 4, 1.5, rim)
        ellipse(px, W, H, x, y + 1, 3, 1, 0xfafafa)
        if (p.kind < 2) {
          // nigiri: a rice bed with a shaded base, a slice of fish on top with a sheen
          rect(px, W, H, x - 2, y - 1, 5, 2, 0xfafaf0)
          rect(px, W, H, x - 2, y, 5, 1, 0xd8d4c8)
          rect(px, W, H, x - 2, y - 2, 5, 1, p.kind ? 0xff7a4a : 0xd8302a)
          rect(px, W, H, x - 1, y - 3, 3, 1, p.kind ? 0xff9a6a : 0xe84a40)
          dot(px, W, H, x - 1, y - 3, p.kind ? 0xffd0b0 : 0xff8a80)
        } else if (p.kind === 2) {
          // two maki: nori sides lit on the left, rice tops, a filling
          for (const ox of [-2, 1]) {
            rect(px, W, H, x + ox, y - 2, 2, 3, 0x1a2a1e)
            rect(px, W, H, x + ox, y - 2, 1, 3, 0x2e4432)
            rect(px, W, H, x + ox, y - 3, 2, 1, 0xf4f4ec)
            dot(px, W, H, x + ox + 1, y - 3, ox < 0 ? 0xff7a5a : 0x6ac04a)
          }
        } else {
          // tamago: a rice bed, a lit omelette block, a nori belt
          rect(px, W, H, x - 2, y - 1, 5, 2, 0xfafaf0)
          rect(px, W, H, x - 2, y - 3, 5, 2, 0xffd040)
          rect(px, W, H, x - 2, y - 3, 5, 1, 0xffe680)
          rect(px, W, H, x, y - 3, 1, 4, 0x1a2a1e)
        }
      }
      plates.forEach(p => drawPlate(p.x, (lanes[p.lane] as number) - 1, p))
      if (grab) {
        const u = grab.t / 30
        const x = grab.x + (W - 6 - grab.x) * u
        const y = grab.y - 1 + (H - 8 - stack * 2 - grab.y) * u - Math.sin(u * Math.PI) * 8
        drawPlate(x, y, grab.p)
        line(px, W, H, x + 2, y - 2, x + 7, y - 10, 0x8a5a32)
        line(px, W, H, x + 1, y - 2, x + 6, y - 10, 0xd8a868)
        line(px, W, H, x + 3, y - 2, x + 9, y - 9, 0x9a6a3a)
        line(px, W, H, x + 2, y - 2, x + 8, y - 9, 0xe8bc80)
      }
      for (let i = 0; i < stack; i++) {
        ellipse(px, W, H, W - 6, H - 4.5 - i * 2, 4, 1, scale(RIMS[i % 5] as number, 0.6))
        ellipse(px, W, H, W - 6, H - 5 - i * 2, 4, 1, RIMS[i % 5] as number)
      }
      text(px, W, H, 1, Math.round(H * 0.12) + 2, String(stack), 0x5a3a1a)
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
      ellipse(px, W, H, cx + 1, H - 6, 10, 1, 0x7a5032)
      rect(px, W, H, cx - 9, H - 7, 18, 1, 0xf8f8fc)
      rect(px, W, H, cx - 8, H - 6, 16, 1, 0xc0c4d0)
      // each layer drawn with a lit top and a shaded underside
      const layer = (k: number, xs: number, yy: number, w: number, topBun: boolean) => {
        const L = LAYERS[k] as { h: number; c: number; top: number; kind: string }
        if (L.kind === 'bun' && topBun) {
          rect(px, W, H, xs + 2, yy - 2, w - 4, 1, 0xf0b860)
          rect(px, W, H, xs + 1, yy - 1, w - 2, 1, 0xe8a850)
          rect(px, W, H, xs, yy, w, 2, 0xd8903a)
          rect(px, W, H, xs, yy + 2, w, 1, 0xa86a2a)
          for (let s = 0; s < 4; s++) dot(px, W, H, xs + 2 + s * 3, yy - 1 + (s % 2), 0xfff4d0)
          return
        }
        if (L.kind === 'bun') {
          rect(px, W, H, xs, yy, w, 1, 0xf0b860)
          rect(px, W, H, xs, yy + 1, w, 1, 0xd8903a)
          rect(px, W, H, xs + 1, yy + 2, w - 2, 1, 0xa86a2a)
          return
        }
        if (L.kind === 'patty') {
          rect(px, W, H, xs, yy, w, 1, 0x7a4428)
          rect(px, W, H, xs, yy + 1, w, 1, 0x4a2614)
          for (let x = 1; x < w; x += 3) dot(px, W, H, xs + x, yy, 0x9a5a34)
          return
        }
        if (L.kind === 'cheese') {
          rect(px, W, H, xs, yy, w, 1, 0xffc020)
          rect(px, W, H, xs, yy, w * 0.4, 1, 0xffe060)
          dot(px, W, H, xs + 2, yy + 1, 0xffb010)
          dot(px, W, H, xs + w - 4, yy + 1, 0xffb010)
          return
        }
        if (L.kind === 'lettuce') {
          rect(px, W, H, xs, yy, w, 1, 0x5ac03a)
          for (let x = 0; x < w; x += 2) dot(px, W, H, xs + x, yy - 1 + (x % 4 ? 1 : 0), x % 4 ? 0x3a9a2a : 0x8ae05a)
          return
        }
        if (L.kind === 'tomato') {
          rect(px, W, H, xs, yy, w, 1, 0xe03a2a)
          for (let x = 1; x < w - 1; x += 3) dot(px, W, H, xs + x, yy, 0xffa060)
          dot(px, W, H, xs + w - 1, yy, 0xa02418)
          return
        }
        rect(px, W, H, xs, yy, w, 1, 0xf4e8f8)
        for (let x = 1; x < w; x += 3) dot(px, W, H, xs + x, yy, 0xc8a0d0)
      }
      const base = H - 7 + cam
      const sway = topple > 30 ? (topple - 30) * 0.08 : Math.sin(t * 0.08) * Math.min(1.5, stack.length * 0.08)
      let y = base
      stack.forEach((k, i) => {
        const L = LAYERS[k] as { h: number; kind: string }
        y -= L.h
        const off = sway * (i / 4)
        const fallOff = topple > 30 ? (topple - 30) ** 1.6 * 0.02 * i : 0
        const x0 = cx - 7 + off + fallOff * (i % 2 ? 1 : -1)
        const w = L.kind === 'tomato' || L.kind === 'onion' ? 12 : 14
        layer(k, x0 + (14 - w) / 2, y + fallOff * 0.5, w, L.kind === 'bun' && i > 0)
      })
      if (falling) layer(falling.k, cx - 7, base + falling.y, 14, falling.k === 0)
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
      // the stand: a lit plate on a lit pedestal
      rect(px, W, H, cx - cw / 2 - 2, base, cw + 4, 1, 0xf4f4fa)
      rect(px, W, H, cx - cw / 2 - 2, base + 1, cw + 4, 1, 0xa8a8b4)
      rect(px, W, H, cx - 2, base + 2, 1, H - base - 2, 0xe0e0e8)
      rect(px, W, H, cx - 1, base + 2, 2, H - base - 2, 0xb0b0bc)
      rect(px, W, H, cx + 1, base + 2, 1, H - base - 2, 0x80808c)
      for (let y = base - ch; y < base; y++)
        for (let x = Math.round(cx - cw / 2); x < cx + cw / 2; x++) {
          const u = (x - (cx - cw / 2)) / cw
          const a = Math.asin(clamp(u * 2 - 1, -1, 1)) + ang
          const k = Math.floor(((a % 6.28) + 6.28) % 6.28 / 6.28 * 64)
          const bump = (rough[k] as number) * (1 - smooth)
          let c = mix(col, 0xffffff, 0.25 * Math.cos((u * 2 - 1) * 1.3))
          c = scale(c, 0.9 + bump * 0.2 - Math.abs(u - 0.5) * 0.25 - (u > 0.5 ? (u - 0.5) * 0.3 : 0))
          if (bump > 0.6 && (x + y) % 2) c = scale(c, 0.85)
          dot(px, W, H, x, y, c)
        }
      ellipse(px, W, H, cx, base - ch, cw / 2, 2, mix(col, 0xffffff, 0.35))
      rect(px, W, H, cx - cw * 0.3, base - ch - 1, cw * 0.25, 1, mix(col, 0xffffff, 0.7))
      if (smooth > 0.8) for (let k = 0; k < 6; k++) rect(px, W, H, cx - cw / 2 + 2 + (k * (cw - 4)) / 5, base - ch + 1, 1, 1 + ((k * 7) % 3), mix(col, 0xffffff, 0.3))
      for (const d of dots) {
        const a = d.a + ang
        const xx = cx + Math.sin(a) * cw * 0.45 * d.y
        const yy = base - ch + Math.cos(a) * 1.5 * d.y
        if (Math.cos(a) > -0.3) dot(px, W, H, xx, yy, d.c)
      }
      if (t < 200) {
        const sx = cx + cw / 2 + 1
        rect(px, W, H, sx, base - ch, 1, ch, 0xe8ecf4)
        rect(px, W, H, sx + 1, base - ch, 1, ch, 0x9aa0ac)
        line(px, W, H, sx + 1, base - ch, sx + 5, base - ch - 8, 0x6a4a2a)
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
      sky(px, W, H, 0x2e2e36, 0x18181e)
      // the pan: a handle, a lit rim, a dark cooking surface warmer in the middle
      line(px, W, H, cx + R, cy + 1, W, cy + 5, 0x15151a)
      line(px, W, H, cx + R, cy, W, cy + 4, 0x34343c)
      lit(px, W, H, cx, cy, R + 1, R + 1, 0x5a5a66)
      disc(px, W, H, cx, cy, R, 0x26262c)
      disc(px, W, H, cx + 0.5, cy + 0.5, R * 0.75, 0x2b2b32)
      for (let a = Math.PI * 1.05; a < Math.PI * 1.45; a += 0.08) dot(px, W, H, cx + Math.cos(a) * (R + 0.5), cy + Math.sin(a) * (R + 0.5), 0x9a9aa8)
      for (let k = 0; k < 6; k++) dot(px, W, H, cx - R * 0.6 + k * 3, cy - R * 0.5 + (k % 2) * 3, 0x3a3a44)
      const crack = span(t, 0, 25)
      if (t < 30) {
        const ey = cy - R - 6 + crack * 4
        lit(px, W, H, cx - crack * 3, ey, 2, 2.5, 0xf0e0c8)
        lit(px, W, H, cx + crack * 3, ey, 2, 2.5, 0xf0e0c8)
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
            // the white is shaded on its lower right
            if (x - cx + (y - cy) > rr * 0.6) c = mix(c, 0xc8c4cc, 0.5)
            if (d > rr - 1 && set > 0.6) c = hash(x, y, 3) > 0.5 ? 0xc8883a : 0xe0b070
            if (set < 1 && hash(x, y + t, 5) > 0.93) c = 0xffffff
            dot(px, W, H, x, y, c)
          }
        const wob = Math.sin(t * 0.3) * 0.3 * (1 - set)
        lit(px, W, H, cx + 1, cy - 1 + wob, 2.6, 2.4, 0xffb020)
        dot(px, W, H, cx, cy - 2 + wob, 0xfff4c0)
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
      // a table and the cup's shadow
      rect(px, W, H, 0, bottom + 1, W, H - bottom - 1, 0xe8b8a0)
      rect(px, W, H, 0, bottom + 1, W, 1, 0xf4ccb4)
      ellipse(px, W, H, cx + 2, bottom + 1.5, cw / 2, 1, 0xd09a88)
      const level = bottom - tea * (bottom - top - 4)
      // the cup: tea lit on the left and darker on the right, a bright left wall, a dimmer right wall
      for (let y = top; y <= bottom; y++) {
        const hw = wAt(y)
        const c = y > level ? mix(tint, 0xffffff, ((y - level) / (bottom - level + 1)) * 0.15) : 0xf4f0f4
        rect(px, W, H, cx - hw, y, hw * 2, 1, y === Math.round(level) && tea > 0 ? mix(tint, 0xffffff, 0.4) : c)
        rect(px, W, H, cx + hw * 0.4, y, hw * 0.6, 1, scale(c, 0.9))
        dot(px, W, H, cx - hw, y, 0xffffff)
        dot(px, W, H, cx + hw, y, 0xb8b0c8)
      }
      rect(px, W, H, cx - cw / 2 - 1, top - 1, cw + 2, 1, 0xe0d8e8)
      if (tea > 0.3)
        for (let k = 0; k < 3; k++) {
          const x = cx - 5 + k * 4
          const y = level + 2 + k * 3
          rect(px, W, H, x, y, 3, 3, 0xe8f4ff)
          dot(px, W, H, x, y, 0xffffff)
          dot(px, W, H, x + 2, y + 2, 0xb8d0e8)
        }
      for (const p of pearls) {
        lit(px, W, H, p.x, p.y, 1.2, 1.2, 0x3a2418)
        dot(px, W, H, p.x - 0.5, p.y - 0.5, 0x8a6a5a)
      }
      if (t > 160) {
        const sy = top - 10 + Math.min(1, (t - 160) / 20) * 14
        rect(px, W, H, cx - 1, sy, 1, bottom - sy, 0xff9ac0)
        rect(px, W, H, cx, sy, 1, bottom - sy, 0xff6aa0)
        rect(px, W, H, cx + 1, sy, 1, bottom - sy, 0xd04a80)
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
      // the board: a lit top edge, the face, a shaded bottom, grain
      rect(px, W, H, 1, board, W - 2, 6, 0xd8b078)
      rect(px, W, H, 1, board, W - 2, 1, 0xf0d098)
      rect(px, W, H, 1, board + 4, W - 2, 2, 0xa87a48)
      rect(px, W, H, W - 2, board, 1, 6, 0xb88a58)
      for (let x = 3; x < W - 3; x += 4) dot(px, W, H, x, board + 2, 0xc8a068)
      const f = FRUITS[fi] as { skin: number; flesh: number; seed: number; r: number }
      const fx = W * 0.3 + f.r
      const fy = board - f.r
      const cutX = W * 0.3 + cuts * 2.2
      const [hi, base, sh, deep] = tones(f.skin)
      for (let y = board - f.r * 2; y < board; y++)
        for (let x = Math.floor(cutX); x < fx + f.r; x++) {
          const d = Math.hypot(x - fx, y - fy)
          if (d > f.r) continue
          let c: number
          if (x <= cutX + 0.5) {
            // the cut face: flesh, a skin rim, seeds near the middle
            c = d > f.r - 1 ? scale(f.skin, 0.9) : d < f.r * 0.45 && (x + y) % 3 === 0 ? f.seed : mix(f.flesh, 0xffffff, d < f.r * 0.5 ? 0.15 : 0)
          } else {
            const light = -(((x - fx) / f.r) * 0.6 + ((y - fy) / f.r) * 0.8)
            c = light > 0.45 ? hi : light > -0.2 ? base : light > -0.6 ? sh : deep
          }
          dot(px, W, H, x, y, c)
        }
      slices.forEach((s, i) => {
        const x = W * 0.12 + i * 1.6 * s.tilt + (1 - s.tilt) * (s.x - W * 0.12)
        const h = Math.round(f.r * 2 * Math.sqrt(Math.max(0.1, 1 - ((s.x - fx) / f.r) ** 2)))
        rect(px, W, H, x, board - h, 1, h, f.flesh)
        rect(px, W, H, x + 1, board - h, 1, h, scale(f.flesh, 0.85))
        dot(px, W, H, x, board - h, f.skin)
        dot(px, W, H, x + 1, board - h, scale(f.skin, 0.8))
        dot(px, W, H, x + 1, board - h / 2, f.seed)
      })
      // the knife: a bright edge, a steel blade in shadow on the back, a handle with rivets
      const kx = cutX + 1
      const ky = board - f.r * 2 - 6 + knifeY * (f.r * 2 + 6)
      rect(px, W, H, kx, ky - 8, 1, 8, 0xf4f8fc)
      rect(px, W, H, kx + 1, ky - 8, 1, 8, 0xa8b0bc)
      rect(px, W, H, kx, ky - 14, 2, 6, 0x3a2418)
      rect(px, W, H, kx, ky - 14, 1, 6, 0x5a3a24)
      dot(px, W, H, kx, ky - 12, 0xc8c8d0)
      dot(px, W, H, kx, ky - 10, 0xc8c8d0)
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
      sky(px, W, H, 0xf4f6fa, 0xd0d8e2)
      // the belt: a lit edge, moving segments, a shaded body
      rect(px, W, H, 0, belt, W, 2, 0x8a9098)
      rect(px, W, H, 0, belt, W, 1, 0xb8c0c8)
      for (let x = 0; x < W; x++) if ((x + Math.floor(t * 0.25)) % 4 === 0) dot(px, W, H, x, belt + 1, 0x6a7078)
      rect(px, W, H, 0, belt + 2, W, H - belt - 2, 0xb0b8c0)
      rect(px, W, H, 0, belt + 2, W, 1, 0x7a828c)
      // the machine: a lit nozzle box, a flowing glaze curtain
      slab(px, W, H, curtainX - 5, 0, 11, 7, 0x9aa2ac)
      for (let x = curtainX - 3; x <= curtainX + 3; x++)
        for (let y = 7; y < belt - 2; y++) {
          const s = (((x * 3 + y - t * 2) % 7) + 7) % 7
          dot(px, W, H, x, y, x === curtainX + 3 ? 0xecccd8 : s === 0 ? 0xffffff : s < 3 ? 0xfff0f4 : 0xf8e0ea)
        }
      for (let x = curtainX - 4; x <= curtainX + 4; x++) dot(px, W, H, x, belt - 1, 0xffffff)
      for (const d of ds) {
        const y = belt - 3
        // the donut: lit dough with an outline, a dark hole, glaze with a gloss, sprinkles
        lit(px, W, H, d.x, y, 4, 2.2, 0xd89048, 0x7a4418)
        if (d.glazed > 0) {
          for (let x = -4; x <= 4; x++) if (Math.abs(x) / 4 < d.glazed * 1.2) dot(px, W, H, d.x + x, y - 1, 0xffe8f0)
          lit(px, W, H, d.x, y - 1, 3.5 * d.glazed, 1.4 * d.glazed, 0xffe0ea)
          if (d.glazed >= 1) {
            dot(px, W, H, d.x - 3, y + 1, 0xffe0ea)
            dot(px, W, H, d.x + 2, y + 1, 0xffe0ea)
            dot(px, W, H, d.x - 2, y - 2, 0xffffff)
          }
        }
        ellipse(px, W, H, d.x, y - 1, 1.2, 0.6, 0x6a3a1a)
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
      // a dark kitchen with tile lines, a flat top lit on its front edge
      sky(px, W, H, 0x2a2420, 0x3e3028, grill)
      for (let y = 3; y < grill - 2; y += 4) rect(px, W, H, 0, y, W, 1, 0x241e1a)
      rect(px, W, H, 0, grill, W, 3, 0x4a4a52)
      rect(px, W, H, 0, grill, W, 1, 0x6a6a76)
      rect(px, W, H, 0, grill + 2, W, 1, 0x34343a)
      rect(px, W, H, 0, grill + 3, W, H - grill - 3, 0x222226)
      rect(px, W, H, 0, grill + 3, W, 1, 0x101014)
      for (let x = 1; x < W; x += 4) dot(px, W, H, x, grill + 1, 0x5a5a64)
      const flat = ease(span(t, 40, 60))
      const brown = span(t, 60, 160)
      const flipped = t > 170
      const pw = 6 + flat * 10
      const ph = 6 - flat * 3.5
      const meat = mix(0xc84a5a, 0x5a2a14, flipped ? 0.85 : brown * 0.6)
      if (t > 10) lit(px, W, H, cx, grill - ph / 2, pw / 2, ph / 2, meat, scale(meat, 0.45))
      if (flipped) for (let k = 0; k < 6; k++) dot(px, W, H, cx - pw / 2 + 2 + k * 2, grill - ph + 1, 0x3a1a0a)
      if (t > 200) {
        const melt = span(t, 200, 250)
        rect(px, W, H, cx - 5, grill - ph - 1, 10, 1, 0xffc020)
        rect(px, W, H, cx - 5, grill - ph - 1, 4, 1, 0xffe070)
        rect(px, W, H, cx - 5, grill - ph, 1, melt * 2, 0xffb010)
        rect(px, W, H, cx + 4, grill - ph, 1, melt * 2.5, 0xffb010)
      }
      if (t < 10) lit(px, W, H, cx, grill - 3 - (10 - t) * 2, 3, 3, 0xc84a5a)
      // the press: a lit steel plate, a dark handle with a lit edge
      const press = t < 40 ? -14 + span(t, 15, 40) * 8 : t < 60 ? -6 + flat * 6 - (6 - ph) : t < 80 ? -ph - 1 - span(t, 60, 80) * 14 : -30
      rect(px, W, H, cx - 8, grill + press - 3, 16, 1, 0xe0e6ee)
      rect(px, W, H, cx - 8, grill + press - 2, 16, 1, 0x8a929c)
      rect(px, W, H, cx - 1, grill + press - 9, 2, 6, 0x2a2a2a)
      rect(px, W, H, cx - 1, grill + press - 9, 1, 6, 0x4a4a4a)
      if (t > 160 && t < 176) {
        const u = (t - 160) / 16
        rect(px, W, H, cx - 8, grill - 2 - Math.sin(u * Math.PI) * 10, 14, 1, 0xe0e6ee)
        rect(px, W, H, cx - 8, grill - 1 - Math.sin(u * Math.PI) * 10, 14, 1, 0x8a929c)
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
      sky(px, W, H, 0xfff0f8, 0xe4ecff)
      // the cart: stripes, lit on the left and shaded on the right
      rect(px, W, H, cx - W * 0.45, bowl, W * 0.9, H - bowl, 0xe8a0c0)
      for (let x = 0; x < W; x += 4) rect(px, W, H, x, bowl + 2, 2, H - bowl - 2, 0xffffff)
      shade(px, W, H, cx + W * 0.15, bowl, W * 0.3, H - bowl, 0x6a3a6a, 0.18)
      rect(px, W, H, cx - W * 0.45, bowl, 1, H - bowl, 0xfff0f8)
      // the bowl: a lit rim, a darker inside
      lit(px, W, H, cx, bowl, W * 0.45, 4, 0xc8d0dc)
      ellipse(px, W, H, cx, bowl - 0.5, W * 0.4, 2.6, 0x8a94a4)
      for (let k = 0; k < 12; k++) {
        const a = t * 0.3 + k * 0.5
        dot(px, W, H, cx + Math.cos(a) * W * 0.4, bowl - 1 + Math.sin(a) * 2, mix(col, 0xffffff, 0.4))
      }
      const lift = t > 240 ? span(t, 240, 280) * H * 0.2 : 0
      const n = fluff.length
      const size = 2 + Math.sqrt(n) * 0.9
      const sy = bowl - 8 - size - lift
      const spin = t * 0.15
      // the cloud: a lit body once there is enough of it, then the strands on top, toned by where they sit
      if (n > 12) lit(px, W, H, cx, sy, size * 0.95, size * 0.8, col)
      for (const f of fluff) {
        const a = f.a + spin
        const r = size * Math.sqrt(f.r)
        const x = cx + Math.cos(a) * r
        const y = sy + (f.y - 0.5) * size * 1.6 + Math.sin(a) * r * 0.3
        const l = -((x - cx) * 0.6 + (y - sy) * 0.8) / size
        dot(px, W, H, x, y, l > 0.35 ? mix(col, 0xffffff, 0.5) : l > -0.3 ? col : scale(col, 0.82))
      }
      line(px, W, H, cx, sy, cx + (t > 240 ? 0 : Math.cos(spin) * 1), H - 2 - lift, 0xf8f0e0)
      line(px, W, H, cx + 1, sy, cx + 1 + (t > 240 ? 0 : Math.cos(spin) * 1), H - 2 - lift, 0xc8b8a0)
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
      ellipse(px, W, H, W * 0.25, H * 0.15, 4, 1.5, 0xffffff)
      ellipse(px, W, H, W * 0.27, H * 0.16, 4, 1, 0xe0f0fc)
      ellipse(px, W, H, W * 0.78, H * 0.25, 3, 1, 0xf4fbff)
      // the cone: a waffle pattern, lit on the left, shaded on the right, an outline
      for (let y = coneTop; y < H; y++) {
        const hw = Math.max(0, 4 * (1 - (y - coneTop) / (H - coneTop)))
        for (let x = Math.round(cx - hw); x <= cx + hw; x++) {
          const waffle = (x + y) % 3 === 0 || (((x - y) % 3) + 3) % 3 === 0
          let c = waffle ? 0xb8803a : 0xe0a858
          if (x < cx - hw * 0.3) c = mix(c, 0xfff0d0, 0.2)
          else if (x > cx + hw * 0.3) c = scale(c, 0.8)
          if (x === Math.round(cx - hw) || x >= Math.floor(cx + hw)) c = 0x8a5a24
          dot(px, W, H, x, y, c)
        }
      }
      rect(px, W, H, cx - 4.5, coneTop, 9, 1, 0xf0c070)
      const sway = Math.sin(t * 0.07) * scoops.length * 0.18
      scoops.forEach((s, i) => {
        const fallX = topple > 20 ? (topple - 20) ** 1.5 * 0.05 * i : 0
        const x = cx + s.dx + sway * (i / Math.max(1, scoops.length)) + fallX
        const y = coneTop - i * 4 - 2 + (topple > 20 ? (topple - 20) ** 1.7 * 0.02 * i : 0)
        // a scoop: lit with an outline, and a drippy skirt
        lit(px, W, H, x, y, 3.2, 2.8, s.c, scale(s.c, 0.6))
        dot(px, W, H, x - 2, y + 3, scale(s.c, 0.75))
        dot(px, W, H, x + 1, y + 3, scale(s.c, 0.75))
      })
      if (fall) lit(px, W, H, fall.x, fall.y, 3.2, 2.8, fall.c, scale(fall.c, 0.6))
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
      ellipse(px, W, H, cx + 1, cy + R + 1, R, 0.8, 0x7a5032)
      if (!burst2) {
        const squeeze = bands * 0.012
        const shake = bands > 10 ? Math.sin(t * 1.3) * (bands - 10) * 0.08 : 0
        const y0 = Math.floor(cy - R * 1.1)
        const y1 = Math.floor(cy + R * 1.1)
        for (let y = y0; y <= y1; y++) {
          const k = (y - cy) / R
          const pinch = 1 - squeeze * Math.exp(-k * k * 8)
          const hw = R * 1.15 * Math.sqrt(Math.max(0, 1 - (k / (1 + squeeze)) ** 2)) * pinch
          const xa = Math.round(cx - hw + shake)
          const xb = Math.floor(cx + hw + shake)
          for (let x = xa; x <= xb; x++) {
            // stripes, lit from the upper left, an outline
            const stripe = Math.sin((x - cx) * 0.9 + k) > 0.4
            const c = stripe ? 0x1a6a2a : 0x3aa03a
            const light = -(((x - cx) / Math.max(1, hw)) * 0.55 + k * 0.8)
            let col = light > 0.5 ? mix(c, 0xd8ffb0, 0.35) : light < -0.75 ? scale(c, 0.5) : light < -0.4 ? scale(c, 0.7) : c
            if (x === xa || x === xb || y === y0 || y === y1) col = 0x0e3a16
            dot(px, W, H, x, y, col)
          }
        }
        dot(px, W, H, cx - R * 0.45, cy - R * 0.55, 0xe8ffe0)
        dot(px, W, H, cx - R * 0.45 + 1, cy - R * 0.55, 0xb8f0a0)
        for (let b = 0; b < bands; b++) {
          const y = cy - 1 + (b % 3) - 1
          const hw = R * 1.15 * (1 - squeeze)
          line(px, W, H, cx - hw + shake, y, cx + hw + shake, y, hsv(b * 0.13, 0.7, 1))
          line(px, W, H, cx + hw * 0.4 + shake, y, cx + hw + shake, y, hsv(b * 0.13, 0.7, 0.7))
        }
      } else {
        // the burst half: rind, a pale band, red flesh with seeds
        lit(px, W, H, cx, cy + R * 0.8, R * 0.8, R * 0.8, 0x3aa03a, 0x0e3a16)
        disc(px, W, H, cx, cy + R * 0.8, R * 0.66, 0xd8f0b0)
        disc(px, W, H, cx, cy + R * 0.8, R * 0.58, 0xff4a5a)
        disc(px, W, H, cx - R * 0.15, cy + R * 0.65, R * 0.3, 0xff7a84)
        for (let k = 0; k < 5; k++) dot(px, W, H, cx + Math.cos(k * 1.3) * R * 0.35, cy + R * 0.8 + Math.sin(k * 1.3) * R * 0.35, 0x1a1a1a)
      }
      for (const b of boom) dot(px, W, H, b.x, b.y, b.c)
      text(px, W, H, 1, 1, String(bands), 0x5a3a1a)
    },
  }
}

// --- mochi pounding -----------------------------------------------------------------

const mochi: Maker = (W, H, rng) => {
  // a mallet pounds the rice dough in a wooden mortar; a hand turns it between blows, faster and faster
  const mx = W / 2
  const rim = Math.round(H * 0.62)
  const tubW = Math.round(W * 0.78)
  const doughY = rim - 1
  const headW = Math.max(7, Math.round(W * 0.5))
  const headH = Math.max(5, Math.round(H * 0.13))
  const top = Math.round(H * 0.08)
  let p = 0
  let period = 26
  let hits = 0
  let squash = 0
  let turn = 0
  let t = 0
  let fx: Spark[] = []
  const wood = 0x9a5a2e

  // the mallet's height: up, held, then a slam that speeds up as it falls
  const fall = () => (p < 0.18 ? 1 - p / 0.18 : p < 0.62 ? 0 : ((p - 0.62) / 0.38) ** 2)
  // the hand: in to fold the dough while the mallet is up, out before it falls
  const reach = () => (p > 0.2 && p < 0.58 ? Math.sin(((p - 0.2) / 0.38) * Math.PI) : 0)

  return {
    step() {
      t++
      fx = sparks(fx, 0.03)
      p += 1 / period
      if (p >= 1) {
        p -= 1
        hits++
        squash = 1
        // a puff of rice flour where it lands
        for (let k = 0; k < 6; k++) fx.push({ x: mx + (rng() - 0.5) * headW, y: doughY - 3, vx: (rng() - 0.5) * 0.8, vy: -0.3 - rng() * 0.4, l: 12 + irand(rng, 8), c: 0xf8f4ec })
        // the rhythm tightens, then eases back
        period = hits % 24 < 18 ? Math.max(9, period - 1) : Math.min(26, period + 3)
      }
      squash *= 0.8
      if (reach() > 0.9) turn = (turn + 0.15) % 1
    },
    draw(px) {
      // a warm shop: paper screens with their wooden grid, a dark floor
      sky(px, W, H, 0x6a4a32, 0x4a3020)
      for (let y = 0; y < rim; y++) for (let x = 0; x < W; x++) if (x % 8 === 3 || y % 10 === 6) px[y * W + x] = 0x3a2416
      // a paper lantern's glow, top left
      lit(px, W, H, W * 0.2, H * 0.2, 3, 4, 0xf05a3a)
      rect(px, W, H, W * 0.2 - 1, H * 0.2 - 5, 3, 1, 0x2a1a10)
      for (let y = Math.round(H * 0.7); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x5a3a24, 0x2e1c12, (y - H * 0.7) / (H * 0.3))
      // the dough, squashed flat by a blow, a fold line that moves as the hand turns it
      const s = squash
      lit(px, W, H, mx, doughY - 3 + s * 1.5, tubW * 0.34 + s * 3, 4 - s * 1.8, 0xf6f0e4, 0xc8bca8)
      const fold = Math.round(mx - tubW * 0.25 + turn * tubW * 0.5)
      for (let k = -1; k <= 1; k++) dot(px, W, H, fold + k, doughY - 4 + s + Math.abs(k), 0xd8ccb8)
      // the mortar: a wooden tub, rings of darker grain, lit from the left
      const [hi, base, sh, deep] = tones(wood)
      const x0 = Math.round(mx - tubW / 2)
      for (let y = rim; y < H - 3; y++) {
        const k = (y - rim) / (H - 3 - rim)
        const inset = Math.round(k * k * 3)
        for (let x = x0 + inset; x < x0 + tubW - inset; x++) {
          const u = (x - x0) / tubW
          let c = u < 0.15 ? hi : u < 0.6 ? base : u < 0.85 ? sh : deep
          if (y === rim) c = 0xc88a52
          if ((y - rim) % 5 === 3) c = mix(c, 0x3a1c0c, 0.35)
          if (x === x0 + inset || x === x0 + tubW - inset - 1) c = 0x3a1a0a
          px[y * W + x] = c
        }
      }
      // the hand, wet, folding from the left
      const r = reach()
      if (r > 0) {
        const hx = -3 + r * (mx - 2)
        const hy = doughY - 5
        line(px, W, H, -2, hy - 3, hx - 2, hy, 0xe0a882)
        line(px, W, H, -2, hy - 2, hx - 2, hy + 1, 0xc08868)
        lit(px, W, H, hx, hy, 2.5, 1.8, 0xf0b890, 0x8a5a3a)
      }
      // the mallet: a long handle up to the top right, a heavy head
      const hy = Math.round(top + fall() * (doughY - 4 - headH - top))
      const hx = Math.round(mx - headW / 2)
      beam(px, W, H, mx + 1, hy + 1, W + 4, hy - H * 0.35, 0x9a6a3a)
      // a barrel-shaped head, darker end grain, two iron bands
      lit(px, W, H, mx, hy + headH / 2, headW / 2, headH / 2, 0xc08a52, 0x4a2410)
      for (const k of [0.28, 0.72]) {
        const bx = Math.round(hx + headW * k)
        for (let y = hy + 1; y < hy + headH - 1; y++) dot(px, W, H, bx, y, y < hy + 2 ? 0x8a8a90 : 0x4a4a52)
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, String(hits), 0xf0e0c0)
    },
  }
}

// --- tanghulu -----------------------------------------------------------------------

const tanghulu: Maker = (W, H, rng) => {
  // fruit on a skewer dips into hot sugar, turns, comes out glassy; the shell sets, then a bite cracks it
  const potTop = Math.round(H * 0.72)
  const cx = W / 2
  const FRUITS = [
    { c: 0xe0283a, r: 3.6, seeds: true },
    { c: 0x7a2a8a, r: 2.8, seeds: false },
    { c: 0xf08a20, r: 3.2, seeds: false },
    { c: 0x5ab03a, r: 2.8, seeds: false },
  ]
  type Fruit = { c: number; r: number; seeds: boolean }
  let fruits: Fruit[] = []
  let y = 0
  let coat = 0
  let phase: 'down' | 'dip' | 'up' | 'set' | 'bite' = 'down'
  let t = 0
  let spin = 0
  let bite = 0
  let fx: Spark[] = []
  let drips: Spark[] = []
  const reset = () => {
    const kind = irand(rng, FRUITS.length)
    fruits = Array.from({ length: 4 }, (_, i) => FRUITS[i === 3 && rng() < 0.5 ? irand(rng, FRUITS.length) : kind] as Fruit)
    y = -40
    coat = 0
    bite = 0
    phase = 'down'
    t = 0
  }
  reset()
  const span = () => fruits.reduce((s, f) => s + f.r * 2 + 1, 0)

  return {
    step() {
      t++
      fx = sparks(fx, 0.12)
      drips = sparks(drips, 0.12).filter(d => d.y < potTop)
      const bottomAt = potTop + 4
      if (phase === 'down') {
        y += 1.4
        if (y + span() >= bottomAt) {
          phase = 'dip'
          t = 0
        }
      } else if (phase === 'dip') {
        spin += 0.25
        if (t > 30) {
          phase = 'up'
          coat = 1
        }
      } else if (phase === 'up') {
        y -= 1
        if (rng() < 0.4) drips.push({ x: cx + (rng() - 0.5) * 4, y: y + span(), vx: 0, vy: 0.4, l: 30, c: 0xf0a020 })
        if (y <= H * 0.12) {
          phase = 'set'
          t = 0
        }
      } else if (phase === 'set') {
        if (t > 30) {
          phase = 'bite'
          t = 0
        }
      } else if (phase === 'bite') {
        if (t === 8) {
          bite = 1
          for (let k = 0; k < 10; k++) fx.push({ x: cx + 2 + rng() * 3, y: y + 1 + rng() * 4, vx: 0.4 + rng() * 1.2, vy: -1 - rng(), l: 14 + irand(rng, 10), c: rng() < 0.6 ? 0xfff0c0 : 0xf0b040 })
        }
        if (t > 50) reset()
      }
    },
    draw(px) {
      // a night market: dark, warm lights, the stall's red cloth
      sky(px, W, H, 0x1a1428, 0x3a1a24, potTop)
      for (let k = 0; k < 5; k++) lit(px, W, H, 3 + k * 7, 4, 1.6, 1.6, k % 2 ? 0xffd070 : 0xff8a5a)
      for (let yy = potTop; yy < H; yy++) for (let x = 0; x < W; x++) px[yy * W + x] = mix(0xa82a2a, 0x5a1414, (yy - potTop) / (H - potTop))
      // the skewer and its fruit, glassy once coated
      const len = span()
      line(px, W, H, cx, y - 8, cx, y + len, 0xd8b078)
      line(px, W, H, cx + 1, y - 8, cx + 1, y + len, 0xa88050)
      let fy = y
      for (const [i, f] of fruits.entries()) {
        const fcy = fy + f.r
        if (coat) ellipse(px, W, H, cx, fcy, f.r + 0.7, f.r + 0.7, mix(0xfff0d0, f.c, 0.45))
        lit(px, W, H, cx, fcy, f.r, f.r, coat ? mix(f.c, 0xffd890, 0.15) : f.c, mix(f.c, 0x200810, coat ? 0.35 : 0.6))
        if (f.seeds) for (let k = 0; k < 4; k++) dot(px, W, H, cx - 1 + (k % 2) * 2, fcy - 1 + Math.floor(k / 2) * 2, 0xf8e080)
        if (i === 0 && f.seeds) {
          dot(px, W, H, cx - 1, fy - 1, 0x3a9a3a)
          dot(px, W, H, cx + 1, fy - 1, 0x3a9a3a)
        }
        // the shine of the sugar glass: it slides round while it turns in the pot
        if (coat) {
          const s = Math.round(Math.sin(spin) * 1)
          dot(px, W, H, cx - f.r * 0.5 + s, fcy - f.r * 0.5, 0xffffff)
          dot(px, W, H, cx - f.r * 0.5 + s + 1, fcy - f.r * 0.5, 0xfff8e0)
          dot(px, W, H, cx + f.r * 0.6, fcy + f.r * 0.3, 0xfff0c0)
        }
        // the bite: a chunk gone from the top fruit, its flesh showing
        if (bite && i === 0) {
          disc(px, W, H, cx + f.r, fcy - 1, f.r * 0.8, 0x1a1428)
          dot(px, W, H, cx + f.r * 0.3, fcy - 1, mix(f.c, 0xffffff, 0.5))
          dot(px, W, H, cx + f.r * 0.3, fcy, mix(f.c, 0xffffff, 0.5))
        }
        fy += f.r * 2 + 1
      }
      // the pot of bubbling sugar, in front of the fruit while it dips
      slab(px, W, H, 3, potTop - 2, W - 6, H - potTop + 2, 0x4a4a54, 0x14141a)
      for (let x = 5; x < W - 5; x++) {
        const bub = Math.sin(x * 1.3 + t * 0.4) > 0.8
        px[(potTop - 2) * W + x] = bub ? 0xffe890 : 0xf0a020
        px[(potTop - 1) * W + x] = 0xc87010
      }
      for (const d of drips) dot(px, W, H, d.x, d.y, d.c)
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
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
  mochi,
  tanghulu,
}
