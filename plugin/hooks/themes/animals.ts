import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, irand, line, lit, litSprite, pick, ring, slab, sparks, textWidth, tint } from '../kit'
import type { Spark } from '../kit'

// Animals & pets: one animal, one funny thing, a loop.

const ease = (t: number) => {
  const u = clamp(t, 0, 1)
  return u * u * (3 - 2 * u)
}
/** 0 to 1 across [a, b] of a timeline. */
const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

// --- cat pushes the glass ---------------------------------------------------------

const catglass: Maker = (W, H, rng) => {
  const table = Math.round(H * 0.58)
  const edge = Math.round(W * 0.8)
  let t = 0
  let fur = 0xf0a040
  let shards: Spark[] = []
  const CAT = [
    '.o...o..',
    '.oo.oo..',
    '.ooooo..',
    '.oeoeo..',
    '.ooqoo..',
    '..ooo...',
    '.ooooo..',
    'oowwwoo.',
    'ooooooo.',
    'ooooooot',
    '.oo.oo.t',
  ]

  return {
    step() {
      t++
      shards = sparks(shards, 0.12).filter(s => s.y < H - 3)
      if (t === 128) {
        burst(shards, rng, edge + 3, H - 6, 0xc8f0ff, 12, 1.2)
        burst(shards, rng, edge + 3, H - 6, 0x6ab0ff, 8, 0.8)
      }
      if (t > 210) {
        t = 0
        fur = pick(rng, [0xf0a040, 0x6a6a72, 0x2a2a2e, 0xe8e0d0, 0xc8783a])
      }
    },
    draw(px) {
      sky(px, W, H, 0xf6e6d0, 0xe8cfae, table)
      for (let y = 4; y < table - 2; y += 9) rect(px, W, H, 0, y, W, 1, 0xead8be)
      rect(px, W, H, 0, table, edge + 2, 2, 0x8a5a32)
      rect(px, W, H, 0, table + 2, edge + 2, H - table - 2, 0x6a4226)
      rect(px, W, H, edge + 2, table, W - edge - 2, H - table, 0xd8c0a0)
      rect(px, W, H, 0, H - 3, W, 3, 0xb89a78)
      const cx = Math.round(W * 0.25)
      const blink = t % 50 > 46 || (t > 160 && t < 175)
      const look = t > 140
      const rows = CAT.map((r, i) => (i === 3 && blink ? r.replace(/e/g, 'o') : r))
      litSprite(px, W, H, cx, table - 11, rows, { o: fur, e: 0x3ad06a, q: 0xff8aa0, w: mix(fur, 0xffffff, 0.5), t: fur })
      if (look) dot(px, W, H, cx + 2, table - 8, 0x000000)
      const push = span(t, 30, 110)
      const gx = Math.round(W * 0.55) + (edge - Math.round(W * 0.55)) * ease(push)
      if (t > 25 && t < 120) line(px, W, H, cx + 6, table - 4, gx - 1, table - 4, fur)
      if (t < 112) {
        rect(px, W, H, gx, table - 6, 4, 6, 0xc8f0ff)
        rect(px, W, H, gx + 1, table - 4, 2, 4, 0x6ab0ff)
        rect(px, W, H, gx, table - 6, 1, 6, 0xe8faff)
      } else if (t < 128) {
        const f = (t - 112) / 16
        const y = table - 6 + f * f * (H - table - 2)
        const a = f * 2
        line(px, W, H, edge + 2, y, edge + 2 + Math.cos(a) * 4, y + Math.sin(a) * 4, 0xc8f0ff)
        line(px, W, H, edge + 3, y, edge + 3 + Math.cos(a) * 4, y + Math.sin(a) * 4, 0x6ab0ff)
      } else if (t < 200) rect(px, W, H, edge - 1, H - 4, 8, 1, 0x6ab0ff)
      for (const s of shards) dot(px, W, H, s.x, s.y, s.c)
      if (t > 135 && t < 160) text(px, W, H, cx + 8, table - 18, '!', 0xff3a3a)
    },
  }
}

// --- dog zoomies ------------------------------------------------------------------

const zoomies: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.52
  const rx = W * 0.36
  const ry = H * 0.32
  let a = 0
  let speed = 0
  let dir = 1
  let t = 0
  let rest = 0
  let dust: Spark[] = []
  const flowers = Array.from({ length: 8 }, () => [rng() * W, rng() * H, hsv(rng(), 0.6, 1)] as [number, number, number])

  return {
    step() {
      t++
      dust = sparks(dust, 0)
      if (rest > 0) {
        rest--
        speed *= 0.9
        if (rest === 0) dir = rng() < 0.5 ? -1 : 1
      } else {
        speed = Math.min(0.14, speed + 0.004)
        if (t % 260 === 200) rest = 70
        if (rng() < 0.004) dir = -dir
      }
      a += speed * dir
      if (speed > 0.08 && rng() < 0.6) {
        const x = cx + Math.cos(a) * rx
        const y = cy + Math.sin(a) * ry
        dust.push({ x, y, vx: (rng() - 0.5) * 0.3, vy: (rng() - 0.5) * 0.3, l: 10, c: 0xc8a870 })
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 2) % 9 === 0 ? 0x5aa03a : 0x6ab84a
      for (let k = 0; k < 120; k++) {
        const q = (k / 120) * Math.PI * 2
        dot(px, W, H, cx + Math.cos(q) * rx, cy + Math.sin(q) * ry, 0x8ac060)
      }
      for (const [x, y, c] of flowers) dot(px, W, H, x, y, c)
      ellipse(px, W, H, cx, cy, 4, 3, 0x6ac8ff)
      ellipse(px, W, H, cx, cy, 3, 2, 0x9ae0ff)
      litSprite(px, W, H, 2, 2, ['.s.', 'sss', '.b.', 'b.b'], { s: 0xffd0a0, b: 0x3a5aaa })
      for (const d of dust) dot(px, W, H, d.x, d.y, d.c)
      const x = cx + Math.cos(a) * rx
      const y = cy + Math.sin(a) * ry
      // the way it runs: the ellipse's own tangent, not a circle's
      const h = Math.atan2(ry * Math.cos(a) * dir, -rx * Math.sin(a) * dir)
      if (rest > 0 && speed < 0.03) {
        lit(px, W, H, x, y, 2.5, 1.5, 0xb8783a)
        dot(px, W, H, x + 2, y - 1, 0x2a1a0a)
        if (t % 20 < 10) dot(px, W, H, x + 3, y, 0xff6a8a)
      } else {
        for (let k = -2; k <= 2; k++) disc(px, W, H, x + Math.cos(h) * k * 0.9, y + Math.sin(h) * k * 0.9, 1.2, 0xb8783a)
        dot(px, W, H, x + Math.cos(h) * 3, y + Math.sin(h) * 3, 0x2a1a0a)
        dot(px, W, H, x - Math.cos(h) * 3.2, y - Math.sin(h) * 3.2, 0xffffff)
        if (speed > 0.1) for (let k = 4; k < 8; k += 2) dot(px, W, H, x - Math.cos(h) * k, y - Math.sin(h) * k, 0xffffff)
      }
    },
  }
}

// --- capybara spa -----------------------------------------------------------------

const capybara: Maker = (W, H, rng) => {
  const water = Math.round(H * 0.52)
  let t = 0
  const steam = Array.from({ length: 10 }, () => ({ x: rng() * W, y: water - rng() * 20, s: 0.15 + rng() * 0.15 }))
  const snow = Array.from({ length: 12 }, () => ({ x: rng() * W, y: rng() * H }))
  const CAPY = ['..bbbbbbbb..', '.bbbbbbbbbbe', 'bbbbbbbbbbbb', 'bbbbbbbbbbbn', 'bbbbbbbbbbbb']

  return {
    step() {
      t++
      for (const s of steam) {
        s.y -= s.s
        s.x += Math.sin((s.y + t) * 0.1) * 0.1
        if (s.y < water - 26) {
          s.y = water
          s.x = rng() * W
        }
      }
      for (const s of snow) {
        s.y += 0.25
        if (s.y > water) {
          s.y = 0
          s.x = rng() * W
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x5a6a8a, 0xb0b8c8, water)
      for (let x = 0; x < W; x++) {
        const h = 6 + Math.sin(x * 0.4) * 2 + Math.sin(x * 1.3) * 1
        rect(px, W, H, x, water - h, 1, h, (x % 5) < 2 ? 0x7a7a82 : 0x6a6a72)
        dot(px, W, H, x, water - h, 0xf0f4f8)
      }
      for (let y = water; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y + (t >> 3)) % 7 === 0 ? 0x8ad8d0 : mix(0x5ac0b8, 0x2a8a90, (y - water) / (H - water))
      const bob = Math.sin(t * 0.05) * 0.6
      const cx = Math.round(W / 2 - 6)
      const cy = water - 3 + bob
      litSprite(px, W, H, cx, cy, CAPY, { b: 0x9a6a3a, e: 0x2a1a0a, n: 0x5a3a1a })
      if (t % 80 > 74) litSprite(px, W, H, cx + 11, cy + 1, ['b'], { b: 0x9a6a3a })
      rect(px, W, H, cx, water, 12, 1, 0x8ad8d0)
      disc(px, W, H, cx + 6, cy - 2, 1.6, 0xff9a1a)
      dot(px, W, H, cx + 6, cy - 4, 0x3a9a2a)
      for (let k = 0; k < 3; k++) {
        const rr = ((t * 0.08 + k * 2) % 6) + 1
        for (let q = 0; q < 16; q++) {
          const ang = (q / 16) * Math.PI * 2
          dot(px, W, H, cx + 6 + Math.cos(ang) * rr * 1.6, water + 1 + Math.sin(ang) * rr * 0.4, 0xa8e8e0)
        }
      }
      for (const s of steam) dot(px, W, H, s.x, s.y, 0xe8eef4)
      for (const s of snow) dot(px, W, H, s.x, s.y, 0xffffff)
      const dx = (t * 0.15) % (W + 10) - 5
      litSprite(px, W, H, dx, water + 8, ['.y.', 'yyy'], { y: 0xffe040 })
      dot(px, W, H, dx + 3, water + 8, 0xff8a20)
    },
  }
}

// --- ducklings in a row -----------------------------------------------------------

const ducklings: Maker = (W, H, rng) => {
  const path = Math.round(H * 0.6)
  let t = 0
  let lost = 2
  const n = 5

  return {
    step() {
      t++
      if (t > 420) {
        t = 0
        lost = irand(rng, n)
      }
    },
    draw(px) {
      sky(px, W, H, 0x9ad8ff, 0xd8f0ff, Math.round(H * 0.35))
      for (let y = Math.round(H * 0.35); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 3 + y) % 11 === 0 ? 0x5aa83a : 0x6ac04a
      rect(px, W, H, 0, path - 2, W, 6, 0xd8c098)
      ellipse(px, W, H, W * 0.75, H * 0.85, W * 0.3, 4, 0x5ab0e8)
      const flowerX = W * 0.35
      dot(px, W, H, flowerX, path - 6, 0xff6a9a)
      dot(px, W, H, flowerX, path - 5, 0x3a8a2a)
      const mx = -8 + t * 0.12
      const step = Math.floor(t / 5) % 2
      litSprite(px, W, H, mx, path - 6, ['..ww.', '.wwko', 'wwww.', 'wwww.', '.o.o.'], { w: 0xf4f4f0, k: 0x000000, o: 0xff9a2a })
      for (let i = 0; i < n; i++) {
        let x = mx - 4 - i * 4
        let y = path - 3
        if (i === lost) {
          const away = span(t, 140, 180) - span(t, 230, 270)
          const panic = t > 230 && t < 300
          x += (flowerX - x) * away
          y -= away * 3
          if (panic) x += Math.sin(t * 0.8) * 0.5
        }
        litSprite(px, W, H, x, y + ((step + i) % 2 ? 0 : -0.5), ['.yy', 'yyk', 'yyy'], { y: 0xffe040, k: 0x000000 })
        dot(px, W, H, x + 3, y + 1, 0xff9a2a)
      }
      if (t > 225 && t < 250) text(px, W, H, mx - 4 - lost * 4, path - 12, '!', 0xff3a3a)
    },
  }
}

// --- frog and flies ---------------------------------------------------------------

const frog: Maker = (W, H, rng) => {
  const water = Math.round(H * 0.45)
  const pads = [
    { x: W * 0.3, y: H * 0.75 },
    { x: W * 0.7, y: H * 0.62 },
    { x: W * 0.4, y: H * 0.88 },
  ]
  let at = 0
  let jump = -1
  let to = 0
  let flies = Array.from({ length: 3 }, () => ({ x: rng() * W, y: 6 + rng() * (water - 4), a: rng() * 6 }))
  let tongue: { x: number; y: number; t: number } | undefined
  let caught = 0
  let gulp = 0
  let t = 0

  return {
    step() {
      t++
      if (gulp > 0) gulp--
      for (const f of flies) {
        f.a += (rng() - 0.5) * 0.8
        f.x = clamp(f.x + Math.cos(f.a) * 0.6, 1, W - 2)
        f.y = clamp(f.y + Math.sin(f.a) * 0.6, 4, H - 4)
      }
      const p = pads[at] as { x: number; y: number }
      if (jump >= 0) {
        jump += 0.04
        if (jump >= 1) {
          at = to
          jump = -1
        }
        return
      }
      if (tongue) {
        tongue.t++
        if (tongue.t > 8) tongue = undefined
        return
      }
      const fx = p.x
      const fy = p.y - 3
      const near = flies.find(f => Math.hypot(f.x - fx, f.y - fy) < 14)
      if (near && rng() < 0.15) {
        tongue = { x: near.x, y: near.y, t: 0 }
        flies = flies.filter(f => f !== near)
        flies.push({ x: rng() < 0.5 ? 0 : W - 1, y: 6 + rng() * 20, a: rng() * 6 })
        caught++
        gulp = 20
      } else if (rng() < 0.004) {
        to = (at + 1 + irand(rng, 2)) % pads.length
        jump = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0xb8e0a0, 0x7ab870, water)
      for (let x = 0; x < W; x += 3) rect(px, W, H, x, water - 6 - (x % 4), 1, 6 + (x % 4), 0x3a7a2a)
      for (let y = water; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 3 + (t >> 2)) % 13 === 0 ? 0x4a8ab0 : mix(0x2a6a8a, 0x1a4a6a, (y - water) / (H - water))
      for (const p of pads) {
        lit(px, W, H, p.x, p.y, 4, 1.6, 0x4aa03a)
        dot(px, W, H, p.x + 2, p.y, 0x2a6a8a)
      }
      const p = pads[at] as { x: number; y: number }
      let fx = p.x
      let fy = p.y - 2
      if (jump >= 0) {
        const q = pads[to] as { x: number; y: number }
        fx = p.x + (q.x - p.x) * jump
        fy = p.y - 2 + (q.y - p.y) * jump - Math.sin(jump * Math.PI) * 10
      }
      litSprite(px, W, H, fx - 3, fy - 3, ['.e.e.', 'ggggg', 'ggggg', 'g...g'], { e: 0xffffff, g: 0x5ad03a })
      dot(px, W, H, fx - 2, fy - 3, 0x000000)
      dot(px, W, H, fx, fy - 3, 0x000000)
      if (gulp > 10) disc(px, W, H, fx, fy - 1, 1.2, 0xc8f0a0)
      if (tongue) line(px, W, H, fx - 1, fy - 1, tongue.x, tongue.y, 0xff6a8a)
      for (const f of flies) {
        dot(px, W, H, f.x, f.y, 0x1a1a1a)
        if (t % 2) dot(px, W, H, f.x, f.y - 1, 0xe0e8ff)
      }
      text(px, W, H, 1, 1, String(caught), 0xffffff)
    },
  }
}

// --- hamster wheel ----------------------------------------------------------------

const hamster: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.48
  const R = Math.min(W * 0.42, H * 0.3)
  let rot = 0
  let speed = 0
  let pos = Math.PI / 2
  let fling = -1
  let fx = 0
  let fy = 0
  let fvx = 0
  let fvy = 0
  let dizzy = 0
  let t = 0

  return {
    step() {
      t++
      if (fling >= 0) {
        fling++
        fvy += 0.12
        fx += fvx
        fy += fvy
        if (fy > H - 6) {
          fy = H - 6
          fvy = 0
          fvx *= 0.8
        }
        if (fling > 30) dizzy = 60
        if (fling > 30) fling = -1
        speed *= 0.97
        rot += speed
        return
      }
      if (dizzy > 0) {
        dizzy--
        speed *= 0.97
        rot += speed
        if (dizzy === 0) pos = Math.PI / 2
        return
      }
      speed = Math.min(0.32, speed + 0.0015 + (t % 400 > 300 ? 0.003 : 0))
      rot += speed
      if (speed > 0.16) pos -= (speed - 0.16) * 0.8
      else pos += (Math.PI / 2 - pos) * 0.1
      if (pos < -Math.PI * 1.4) {
        fling = 0
        fx = cx + Math.cos(pos) * (R - 3)
        fy = cy + Math.sin(pos) * (R - 3)
        fvx = 1.2 + rng() * 0.5
        fvy = -1
        speed = 0.2
        t = 0
      }
    },
    draw(px) {
      px.fill(0xf0e0c8)
      for (let x = 2; x < W; x += 4) rect(px, W, H, x, 0, 1, H, 0xc8b8a0)
      rect(px, W, H, 0, H - 4, W, 4, 0xe8d090)
      for (let x = 0; x < W; x += 2) dot(px, W, H, x, H - 4 + (x % 3), 0xd0b070)
      line(px, W, H, cx, cy, cx - 4, H - 4, 0x8a8a96)
      line(px, W, H, cx, cy, cx + 4, H - 4, 0x8a8a96)
      ring(px, W, H, cx, cy, R, 0x3a8ae0)
      ring(px, W, H, cx, cy, R - 1, 0x2a6ac0)
      for (let k = 0; k < 8; k++) {
        const a = rot + (k / 8) * Math.PI * 2
        line(px, W, H, cx, cy, cx + Math.cos(a) * (R - 1), cy + Math.sin(a) * (R - 1), 0x9ac0f0)
      }
      disc(px, W, H, cx, cy, 1.2, 0x2a6ac0)
      let hx = cx + Math.cos(pos) * (R - 3)
      let hy = cy + Math.sin(pos) * (R - 3)
      if (fling >= 0 || dizzy > 0) {
        hx = fx
        hy = fy
      }
      const legs = Math.floor(t * (0.2 + speed)) % 2
      lit(px, W, H, hx, hy, 2.2, 1.6, 0xf0b060)
      dot(px, W, H, hx + 1, hy - 1, 0x1a1a1a)
      dot(px, W, H, hx - 1, hy + 1, 0xffffff)
      if (!dizzy && fling < 0) dot(px, W, H, hx + (legs ? 1 : -1), hy + 2, 0xd0905a)
      if (dizzy > 0) for (let k = 0; k < 3; k++) dot(px, W, H, hx + Math.cos(t * 0.3 + k * 2) * 3, hy - 3 + Math.sin(t * 0.3 + k * 2), 0xffe040)
      if (speed > 0.16 && fling < 0 && !dizzy) for (let k = 2; k < 6; k++) dot(px, W, H, hx - k, hy + (k % 2), 0xffffff)
    },
  }
}

// --- penguin slide ----------------------------------------------------------------

const penguins: Maker = (W, H, rng) => {
  const top = Math.round(H * 0.3)
  const sea = Math.round(H * 0.82)
  type P = { u: number; v: number; phase: number; delay: number }
  let ps: P[] = []
  let splash: Spark[] = []
  let t = 0
  const slopeY = (x: number) => top + 4 + (x / W) * (sea - top - 6)

  function reset() {
    ps = Array.from({ length: 5 }, (_, i) => ({ u: -4 - i * 5, v: 0, phase: 0, delay: i * 12 }))
    t = 0
  }
  reset()

  return {
    step() {
      t++
      splash = sparks(splash, 0.12)
      for (const p of ps) {
        if (p.phase === 0) {
          p.u += 0.18
          if (p.u >= 3 && t > p.delay + 40) p.phase = 1
        } else if (p.phase === 1) {
          p.v = Math.min(1.6, p.v + 0.05)
          p.u += p.v
          if (p.u > W + 2) {
            p.phase = 2
            burst(splash, rng, W - 3, sea, 0xd8f0ff, 10, 1)
          }
        }
      }
      if (ps.every(p => p.phase === 2) && t > 60) reset()
    },
    draw(px) {
      sky(px, W, H, 0x6ab0e8, 0xd8f0ff, sea)
      for (let y = top; y < sea; y++) {
        const x0 = ((y - top - 4) / (sea - top - 6)) * W
        for (let x = 0; x < W; x++) if (x <= x0 + 2) px[y * W + x] = x > x0 - 1 ? 0xffffff : mix(0xe8f0f8, 0xc8d8e8, x / W)
      }
      for (let y = sea; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y + (t >> 2)) % 8 === 0 ? 0x6ab8f0 : 0x2a6ab0
      for (const p of ps) {
        if (p.phase === 2) continue
        if (p.phase === 0) {
          const w = Math.sin(p.u * 3) > 0 ? 0 : 1
          litSprite(px, W, H, p.u, top - 4 + w * 0, ['.kk.', 'kwwk', 'kwwk', '.oo.'], { k: 0x1a1a2a, w: 0xffffff, o: 0xff9a1a })
          dot(px, W, H, p.u + 2, top - 3, 0xff9a1a)
        } else {
          const y = slopeY(p.u) - 2
          litSprite(px, W, H, p.u - 2, y, ['.kkkko', 'kwwwwk'], { k: 0x1a1a2a, w: 0xffffff, o: 0xff9a1a })
          if (p.v > 1) dot(px, W, H, p.u - 4, y + 1, 0xffffff)
        }
      }
      for (const s of splash) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- corgi walk -------------------------------------------------------------------

const corgi: Maker = (W, H, rng) => {
  const horizon = Math.round(H * 0.32)
  let t = 0
  let look = 0
  void rng

  return {
    step() {
      t++
      if (t % 240 === 180) look = 40
      if (look > 0) look--
    },
    draw(px) {
      sky(px, W, H, 0x8ac8ff, 0xd8f0ff, horizon)
      for (let y = horizon; y < H; y++) {
        const s = (y - horizon) / (H - horizon)
        const hw = 2 + s * W * 0.32
        for (let x = 0; x < W; x++) {
          const onPath = Math.abs(x - W / 2) < hw
          const stripe = Math.floor(Math.log(s + 0.05) * 10 - t * 0.08) % 2 === 0
          px[y * W + x] = onPath ? (stripe ? 0xd8c098 : 0xccb48a) : stripe ? 0x5ab040 : 0x52a63a
        }
      }
      for (let k = 0; k < 4; k++) {
        const s = ((k * 0.25 + t * 0.004) % 1) ** 2
        const y = horizon + s * (H - horizon)
        const side = k % 2 ? -1 : 1
        const x = W / 2 + side * (4 + s * W * 0.45)
        const sz = 1 + s * 4
        lit(px, W, H, x, y - sz, sz, sz, 0x2a8a3a)
        rect(px, W, H, x, y - sz * 0.2, 1, sz * 0.6, 0x6a4a2a)
      }
      const cx = W / 2
      const cy = H * 0.72
      const wig = Math.sin(t * 0.4) * 1.2
      const step = Math.floor(t / 4) % 2
      lit(px, W, H, cx - 2 + wig * 0.3, cy, 3.3, 3.3, 0xe8903a)
      lit(px, W, H, cx + 2 + wig * 0.3, cy, 3.3, 3.3, 0xe8903a)
      disc(px, W, H, cx - 2 + wig * 0.3, cy + 1, 2, 0xfff0dc)
      disc(px, W, H, cx + 2 + wig * 0.3, cy + 1, 2, 0xfff0dc)
      dot(px, W, H, cx + wig * 0.3, cy + 1, 0xc8703a)
      rect(px, W, H, cx - 4, cy + 3 + step, 2, 2, 0xfff0dc)
      rect(px, W, H, cx + 3, cy + 3 + (1 - step), 2, 2, 0xfff0dc)
      const hx = cx + (look > 0 ? (look > 20 ? 2 : 1) : 0)
      litSprite(px, W, H, hx - 3, cy - 9, ['.e...e.', 'eee.eee', 'ooooooo', '.ooooo.'], { e: 0xe8903a, o: 0xe8903a })
      if (look > 0) {
        dot(px, W, H, hx + 1, cy - 7, 0x1a1a1a)
        dot(px, W, H, hx + 3, cy - 6, 0x1a1a1a)
      }
    },
  }
}

// --- cat vs cucumber --------------------------------------------------------------

const cucumber: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.72)
  let t = 0
  let fur = 0x6a6a72
  const SIT = ['o...o...', 'oo.oo...', 'ooooo...', 'oeoeo...', '.ooo....', 'oooooo..', 'oooooooo', 'ooooooo.', '.o..o...']
  const JUMP = ['o.o..', 'ooo..', 'EoE..', 'ooo..', '.ooo.', '.oooo', 'o.o.o', 'o...o']

  return {
    step() {
      t++
      if (t > 230) {
        t = 0
        fur = pick(rng, [0x6a6a72, 0xf0a040, 0x2a2a2e, 0xe8e0d0])
      }
    },
    draw(px) {
      sky(px, W, H, 0xf0e6d8, 0xe0d0b8, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0xa87a4a)
      for (let x = 0; x < W; x += 6) rect(px, W, H, x, floor, 1, H - floor, 0x8a5a32)
      const bx = Math.round(W * 0.68)
      slab(px, W, H, bx, floor - 2, 6, 2, 0xe03a5a)
      rect(px, W, H, bx + 1, floor - 3, 4, 1, 0xa86a3a)
      const placed = span(t, 30, 60)
      const ux = Math.round(W * 0.2)
      if (t > 20 && t < 70) {
        const hx = ux + 3
        line(px, W, H, hx, -2, hx, floor - 6 + (1 - placed) * -8, 0xffd0a0)
      }
      if (t > 40) {
        rect(px, W, H, ux, floor - 2, 7, 2, 0x3a9a3a)
        rect(px, W, H, ux, floor - 2, 7, 1, 0x5ac05a)
      }
      const turn = t > 95
      const leap = span(t, 105, 150)
      if (t < 105) {
        const rows = turn ? SIT.map(r => [...r].reverse().join('')) : SIT
        litSprite(px, W, H, bx - 7, floor - 9, rows, { o: fur, e: 0x3ad06a })
        if (!turn && t % 10 < 5) dot(px, W, H, bx - 1, floor - 4, fur)
      } else if (t < 150) {
        const x = bx - 6 + leap * (W - bx + 2)
        const y = floor - 9 - Math.sin(leap * Math.PI) * H * 0.4
        litSprite(px, W, H, x, y, JUMP, { o: fur, E: 0xffffff })
        text(px, W, H, x - 2, y - 7, '!', 0xff3a3a)
      } else {
        litSprite(px, W, H, W - 7, floor - 9, SIT.map(r => [...r].reverse().join('')), { o: fur, e: 0x3ad06a })
        if (t > 170 && t % 30 < 15) text(px, W, H, W - 10, floor - 17, '?', 0x3a3a3a)
      }
    },
  }
}

// --- baby hippo -------------------------------------------------------------------

const hippo: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.66)
  let t = 0
  let splashes: Spark[] = []

  return {
    step() {
      t++
      splashes = sparks(splashes, 0.12)
      if (t === 150) burst(splashes, rng, W * 0.62, ground + 4, 0x9ad0ff, 14, 1.3)
      if (t > 240) t = 0
    },
    draw(px) {
      sky(px, W, H, 0xe8f0d8, 0xc8d8b0, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x8a7050)
      ellipse(px, W, H, W * 0.62, ground + 6, W * 0.32, 4, 0x5a9ab8)
      for (let x = 0; x < W; x += 5) rect(px, W, H, x, 4, 1, ground - 4, 0x8a8a72)
      rect(px, W, H, 0, 6, W, 1, 0x8a8a72)
      const bite = t > 40 && t < 110 ? Math.abs(Math.sin((t - 40) * 0.25)) : 0
      const inPool = span(t, 130, 150) - span(t, 210, 235)
      const hx = W * 0.3 + inPool * W * 0.32
      const hy = ground - 3 + inPool * 6 - Math.sin(inPool * Math.PI) * 6
      lit(px, W, H, hx, hy, 6, 3.5, 0x8a7a8a, 0x4a3a4a)
      const mouth = bite * 3
      lit(px, W, H, hx + 6, hy - 2 - mouth * 0.5, 3, 2, 0x9a8a9a)
      ellipse(px, W, H, hx + 6, hy + mouth * 0.5, 3, 1.5, 0x9a8a9a)
      if (mouth > 1) rect(px, W, H, hx + 4, hy - 1 - mouth * 0.3, 4, mouth * 0.8, 0xff7a9a)
      dot(px, W, H, hx + 4, hy - 4 - mouth * 0.5, 0x1a1a1a)
      dot(px, W, H, hx + 2, hy - 5, 0xff9ab0)
      if (inPool < 0.5) {
        rect(px, W, H, hx - 4, hy + 2, 2, 2, 0x7a6a7a)
        rect(px, W, H, hx + 2, hy + 2, 2, 2, 0x7a6a7a)
      }
      if (t > 35 && t < 115) {
        const bx = W - 3 - bite * 2
        rect(px, W, H, bx - 2, ground - 3, 5, 3, 0x3a3a2a)
        rect(px, W, H, bx - 1, ground - 12, 3, 9, 0x4a5a3a)
      }
      for (const s of splashes) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- frisbee dog ------------------------------------------------------------------

const frisbee: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.74)
  let t = 0
  let fx = 0
  let fy = 0
  let fvx = 0
  let fvy = 0
  let dx = 3
  let dy = 0
  let dvy = 0
  let has = false
  let miss = false
  let caught = 0
  // the way the dog faces: where it runs, and back to the thrower with the frisbee
  let face = 1

  function throwIt() {
    fx = 4
    fy = ground - 8
    fvx = 0.3 + rng() * 0.15
    fvy = -0.6 - rng() * 0.2
    has = false
    miss = rng() < 0.2
    dx = 6
    t = 0
  }
  throwIt()

  return {
    step() {
      t++
      if (!has) {
        fvy += 0.02
        fx += fvx
        fy += fvy
        if (fx > W - 3) fvx = -Math.abs(fvx)
        if (fy > ground - 1) {
          fy = ground - 1
          fvx *= 0.8
          fvy = 0
        }
        const target = fx + fvx * 6
        const before = dx
        dx = clamp(dx + clamp(target - 4 - dx, -0.9, 0.9), 0, W - 8)
        if (Math.abs(dx - before) > 0.05) face = dx > before ? 1 : -1
        if (dy === 0 && !miss && Math.abs(fx - dx - 6) < 4 && fy < ground - 6 && fvy > 0) dvy = -1.5
        if (dvy !== 0 || dy < 0) {
          dvy += 0.1
          dy += dvy
          if (dy >= 0) {
            dy = 0
            dvy = 0
          }
        }
        const onGround = fy >= ground - 1.5 && Math.abs(fx - dx - 6) < 3
        if (onGround || (Math.abs(fx - dx - 6) < 2.5 && Math.abs(fy - (ground - 5 + dy)) < 3)) {
          has = true
          if (fy < ground - 2) caught++
        }
      } else {
        dx -= 0.6
        face = -1
        if (dy < 0) {
          dvy += 0.1
          dy = Math.min(0, dy + dvy)
        }
        fx = dx
        fy = ground - 5 + dy
        if (dx < 6) throwIt()
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ac0ff, 0xc8ecff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x5ab040)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, ground, 0x7ad050)
      for (let k = 0; k < 2; k++) {
        const tx = W * (0.3 + k * 0.5)
        lit(px, W, H, tx, ground - 14, 5, 5, 0x3a8a3a)
        rect(px, W, H, tx, ground - 10, 1, 10, 0x6a4a2a)
      }
      litSprite(px, W, H, 1, ground - 8, ['.s.', 'sss', 'rrr', 'rrr', 'b.b', 'b.b', 'b.b', 'k.k'], { s: 0xffd0a0, r: 0xe04a4a, b: 0x3a4aaa, k: 0x2a2a2a })
      const run = Math.floor(t / 3) % 2
      const DOG = ['.....bb.', '.....bwk', 'bbbbbbb.', 'bbbbbb..', run ? 'b.b.b...' : '.b.b.b..']
      litSprite(px, W, H, dx, ground - 6 + dy, face > 0 ? DOG : DOG.map(r => r.split('').reverse().join('')), { b: 0x2a2a2a, w: 0xffffff, k: 0x1a1a1a })
      // the white tip of its tail, at the back
      dot(px, W, H, face > 0 ? dx + 1 : dx + 6, ground - 5 + dy, 0xffffff)
      rect(px, W, H, fx - 1.5, fy, 3, 1, 0xff3aa0)
      text(px, W, H, W - 1 - 3, 1, String(caught % 10), 0xffffff)
    },
  }
}

// --- bird feeder ------------------------------------------------------------------

const feeder: Maker = (W, H, rng) => {
  const fx = W / 2
  const fy = H * 0.42
  type Bird = { x: number; y: number; tx: number; ty: number; c: number; state: number; t: number }
  let birds: Bird[] = []
  let seeds: Spark[] = []
  let sq = { y: -10, phase: 0, t: 0 }
  let t = 0

  const perch = (i: number): [number, number] => [fx + (i % 2 ? 4 : -4), fy + 5 + Math.floor(i / 2) * 3]

  return {
    step() {
      t++
      seeds = sparks(seeds, 0.08).filter(s => s.y < H - 4)
      if (sq.phase === 0 && t % 500 === 300) sq = { y: -10, phase: 1, t: 0 }
      if (sq.phase) {
        sq.t++
        if (sq.phase === 1) {
          sq.y += 0.5
          if (sq.y > fy - 4) sq.phase = 2
        } else if (sq.phase === 2) {
          if (rng() < 0.2) seeds.push({ x: fx, y: fy + 6, vx: (rng() - 0.5) * 0.4, vy: 0, l: 40, c: 0xd8b060 })
          if (sq.t > 160) sq.phase = 3
        } else {
          sq.y += 2
          if (sq.y > H + 6) sq.phase = 0
        }
      }
      if (birds.length < 4 && rng() < 0.02 && sq.phase !== 2) {
        const i = [0, 1, 2, 3].find(k => !birds.some(b => b.state < 3 && Math.abs(b.tx - perch(k)[0]) < 1 && Math.abs(b.ty - perch(k)[1]) < 1))
        if (i !== undefined) {
          const [tx, ty] = perch(i)
          birds.push({ x: rng() < 0.5 ? -3 : W + 3, y: rng() * fy, tx, ty, c: pick(rng, [0xe03a3a, 0x3a8ae0, 0xffd040, 0x8a6a4a]), state: 0, t: 0 })
        }
      }
      for (const b of birds) {
        b.t++
        if (sq.phase === 2 && b.state < 2) {
          b.state = 2
          b.tx = b.x < fx ? -6 : W + 6
          b.ty = rng() * fy
        }
        if (b.state === 0) {
          b.x += (b.tx - b.x) * 0.06
          b.y += (b.ty - b.y) * 0.06 + Math.sin(b.t * 0.6) * 0.3
          if (Math.hypot(b.tx - b.x, b.ty - b.y) < 0.6) {
            b.state = 1
            b.t = 0
          }
        } else if (b.state === 1) {
          if (b.t % 12 === 0) seeds.push({ x: b.x, y: b.y + 1, vx: (rng() - 0.5) * 0.3, vy: 0, l: 30, c: 0xd8b060 })
          if (b.t > 90 + irand(rng, 60)) {
            b.state = 2
            b.tx = b.x < fx ? -6 : W + 6
            b.ty = rng() * fy
          }
        } else {
          b.x += (b.tx - b.x) * 0.05
          b.y += (b.ty - b.y) * 0.05 - 0.2
          if (b.x < -4 || b.x > W + 4) b.state = 3
        }
      }
      birds = birds.filter(b => b.state < 3)
    },
    draw(px) {
      sky(px, W, H, 0xa8d8f0, 0xe8f4e0)
      rect(px, W, H, 0, H - 4, W, 4, 0x6aa84a)
      line(px, W, H, 0, 6, W, 4, 0x6a4a2a)
      line(px, W, H, 0, 7, W, 5, 0x5a3a1a)
      for (let k = 0; k < 6; k++) lit(px, W, H, k * 6 + 2, 4 + (k % 2), 2, 2, 0x4a9a3a)
      line(px, W, H, fx, 5, fx, fy - 2, 0x8a8a8a)
      litSprite(px, W, H, fx - 4, fy - 3, ['..rrrrr..', '.rrrrrrr.', 'rrrrrrrrr', '.wsssssw.', '.wsssssw.', '.wsssssw.', '.wwwwwww.', 'k.......k'], { r: 0xc84a3a, w: 0xf0e0c0, s: 0xd8b060, k: 0x6a4a2a })
      for (const s of seeds) dot(px, W, H, s.x, s.y, s.c)
      for (const b of birds) {
        const flap = b.state !== 1 && b.t % 6 < 3
        litSprite(px, W, H, b.x - 1, b.y - 1, flap ? ['x.x', '.x.', '.x.'] : ['.x.', 'xxx', '.x.'], { x: b.c })
        dot(px, W, H, b.x + (b.x < fx ? 1 : -1), b.y - 1, 0x1a1a1a)
      }
      if (sq.phase) {
        const sy = sq.y
        litSprite(px, W, H, fx - 2, sy - 2, ['.tt..', 'tt.bb', '.bbbb', '.bbbe', '..bb.'], { t: 0x9a6a3a, b: 0x8a5a2a, e: 0x1a1a1a })
      }
    },
  }
}

// --- otters holding hands ---------------------------------------------------------

const otters: Maker = (W, H, rng) => {
  const sea = Math.round(H * 0.4)
  let t = 0
  let tap = 0
  const kelp = Array.from({ length: 5 }, () => rng() * W)

  return {
    step() {
      t++
      if (t % 160 === 100) tap = 30
      if (tap > 0) tap--
    },
    draw(px) {
      sky(px, W, H, 0xffb87a, 0xffe0b0, sea)
      disc(px, W, H, W * 0.75, sea - 6, 4, 0xfff0c0)
      for (let y = sea; y < H; y++)
        for (let x = 0; x < W; x++) {
          const w = Math.sin(x * 0.4 + t * 0.06 + y * 0.3)
          px[y * W + x] = w > 0.85 ? 0x8ac8e8 : mix(0x3a8ab0, 0x1a4a7a, (y - sea) / (H - sea))
        }
      for (const k of kelp) for (let y = H - 1; y > sea + 10; y -= 1) dot(px, W, H, k + Math.sin(y * 0.3 + t * 0.03) * 1.2, y, 0x2a6a3a)
      const cx = W / 2 + Math.sin(t * 0.01) * W * 0.15
      const cy = sea + 5 + Math.sin(t * 0.06) * 0.8
      const a = Math.sin(t * 0.015) * 0.3
      const otter = (ox: number, oy: number, flip: number) => {
        for (let k = -4; k <= 4; k++) disc(px, W, H, ox + Math.cos(a) * k, oy + Math.sin(a) * k * flip, 1.6, 0x7a4a2a)
        for (let k = -3; k <= 3; k++) dot(px, W, H, ox + Math.cos(a) * k, oy - 1 + Math.sin(a) * k * flip, 0xa0704a)
        const hx = ox + Math.cos(a) * 5
        const hy = oy + Math.sin(a) * 5 * flip
        lit(px, W, H, hx, hy - 1, 1.6, 1.6, 0x9a6a3a)
        dot(px, W, H, hx + 0.5, hy - 1.5, 0x1a1a1a)
        dot(px, W, H, hx + 1.5, hy - 1, 0xd8b090)
      }
      otter(cx - 3, cy - 2, 1)
      otter(cx - 3, cy + 3, -1)
      line(px, W, H, cx - 2, cy - 1, cx - 2, cy + 2, 0x6a3a1a)
      if (tap > 0) {
        const up = tap % 8 < 4
        disc(px, W, H, cx - 1, cy - 3 - (up ? 2 : 0), 1, 0x9a9aa2)
        rect(px, W, H, cx - 2, cy - 2, 3, 1, 0xd0a0b0)
      }
    },
  }
}

// --- raccoon raid -----------------------------------------------------------------

const raccoon: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.78)
  let t = 0
  let trash: { x: number; y: number; vx: number; vy: number; c: number }[] = []

  return {
    step() {
      t++
      for (const p of trash) {
        if (p.y < ground - 1) {
          p.vy += 0.12
          p.x += p.vx
          p.y += p.vy
        } else {
          p.y = ground - 1
          p.vx = 0
        }
      }
      if (t === 90)
        for (let k = 0; k < 10; k++) trash.push({ x: W * 0.62, y: ground - 6, vx: (rng() - 0.3) * 1.2, vy: -rng() * 1.5, c: pick(rng, [0xe0e0e0, 0x8ac04a, 0xd04a3a, 0x8a6a4a, 0xf0d060]) })
      if (t > 260) {
        t = 0
        trash = []
      }
    },
    draw(px) {
      const lit = t > 170 && t < 260
      sky(px, W, H, 0x0a0a1e, 0x1a1a32, ground)
      rect(px, W, H, 0, 0, W * 0.45, ground, 0x2a2230)
      for (let y = 4; y < ground; y += 3) for (let x = (y % 6) ? 0 : 2; x < W * 0.45; x += 4) dot(px, W, H, x, y, 0x342a3c)
      rect(px, W, H, W * 0.1, H * 0.25, 6, 7, lit ? 0xffe08a : 0x1a1a2a)
      rect(px, W, H, W * 0.1 + 2, H * 0.25, 1, 7, 0x2a2230)
      if (lit) for (let y = ground; y > H * 0.32; y--) for (let x = W * 0.05; x < W * 0.05 + (ground - y) * 0.5 + 6; x++) {
        const k = Math.round(y) * W + Math.round(x)
        if (k >= 0 && k < W * H) px[k] = mix(px[k] as number, 0xffe08a, 0.15)
      }
      rect(px, W, H, 0, ground, W, H - ground, 0x3a3a44)
      for (let x = 0; x < W; x += 5) dot(px, W, H, x, ground + 2, 0x4a4a54)
      const bx = Math.round(W * 0.58)
      const tipped = t >= 90
      if (!tipped) {
        slab(px, W, H, bx, ground - 9, 7, 9, 0x5a6a5a)
        rect(px, W, H, bx - 1, ground - 10, 9, 2, 0x6a7a6a)
        for (let y = ground - 8; y < ground; y += 2) rect(px, W, H, bx, y, 7, 1, 0x4a5a4a)
      } else {
        rect(px, W, H, bx, ground - 7, 9, 7, 0x5a6a5a)
        rect(px, W, H, bx - 1, ground - 7, 1, 7, 0x2a2a2a)
        rect(px, W, H, bx + 11, ground - 2, 3, 2, 0x6a7a6a)
      }
      for (const p of trash) dot(px, W, H, p.x, p.y, p.c)
      let rx = -8 + span(t, 10, 70) * (bx - 6)
      if (t > 175) rx = bx - 6 - span(t, 175, 210) * (bx + 4) * -1 + span(t, 175, 210) * (W + 10)
      const peek = t > 70 && t < 175
      const ry = ground - 5
      // it always heads right, in to the bin and out past it: masked face in front, striped tail behind
      litSprite(px, W, H, rx, ry, ['...g.g.', '...gggg', '.gwkkw.', '.gggggg', 'sgggggg', '.sg.g.g'], { g: 0x8a8a92, k: 0x1a1a1a, w: 0xffffff, s: 0x5a5a62 })
      if (peek && t > 120) {
        rect(px, W, H, rx + 3, ry + 1, 3, 2, 0xf0c040)
        dot(px, W, H, rx + 4, ry + 1, 0xd04a3a)
      }
      if (t > 175) {
        rect(px, W, H, rx + 5, ry + 1, 3, 2, 0xf0c040)
        dot(px, W, H, rx + 6, ry + 1, 0xd04a3a)
      }
      if (!lit && (t >> 3) % 6 === 0) {
        dot(px, W, H, rx + 4, ry + 2, 0xfff0a0)
        dot(px, W, H, rx + 5, ry + 2, 0xfff0a0)
      }
      if (lit && t < 190) text(px, W, H, rx + 1, ry - 8, '!', 0xff3a3a)
    },
  }
}

// --- leafcutter ants --------------------------------------------------------------

const leafcutter: Maker = (W, H, rng) => {
  const nest = { x: 4, y: H * 0.78 }
  const tree = { x: W - 5, y: H * 0.25 }
  type Ant = { u: number; back: boolean; leaf: number; c: number; drop: boolean }
  const ants: Ant[] = Array.from({ length: 22 }, (_, i) => ({ u: i / 22, back: i % 2 === 0, leaf: 1 + irand(rng, 3), c: hsv(0.28 + rng() * 0.08, 0.7, 0.5 + rng() * 0.4), drop: false }))
  const at = (u: number): [number, number] => {
    const x = tree.x + (nest.x - tree.x) * u
    const y = tree.y + (nest.y - tree.y) * u + Math.sin(u * Math.PI * 3) * 5
    return [x, y]
  }
  let dropped: [number, number, number][] = []
  let t = 0

  return {
    step() {
      t++
      for (const a of ants) {
        a.u += a.back ? -0.0035 : 0.0035
        if (a.u > 1) {
          a.u = 1
          a.back = true
        }
        if (a.u < 0) {
          a.u = 0
          a.back = false
          a.leaf = 1 + irand(rng, 3)
          a.c = hsv(0.28 + rng() * 0.08, 0.7, 0.5 + rng() * 0.4)
        }
        if (!a.back && rng() < 0.0008) {
          const [x, y] = at(a.u)
          dropped.push([x, y - 2, a.c])
          a.back = true
        }
      }
      if (dropped.length > 6) dropped.shift()
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 7 + y * 3) % 13 === 0 ? 0x5a3a20 : (x + y * 5) % 17 === 0 ? 0x7a5432 : 0x6a4628
      for (let k = 0; k <= 60; k++) {
        const [x, y] = at(k / 60)
        dot(px, W, H, x, y, 0x5a3c22)
      }
      lit(px, W, H, nest.x, nest.y, 3, 3, 0x8a6a42)
      disc(px, W, H, nest.x, nest.y, 1.5, 0x1a0e06)
      rect(px, W, H, tree.x - 1, 0, 4, tree.y + 2, 0x4a3018)
      for (let k = 0; k < 6; k++) lit(px, W, H, tree.x - 4 + k * 2, tree.y - 4 + (k % 2) * 2, 2, 2, 0x3a8a2a)
      for (const [x, y, c] of dropped) rect(px, W, H, x, y, 2, 2, c)
      for (const a of ants) {
        const [x, y] = at(a.u)
        dot(px, W, H, x, y, 0x8a2a10)
        dot(px, W, H, x + (a.back ? 1 : -1), y, 0x6a1a08)
        if (!a.back) rect(px, W, H, x - 1, y - 1 - a.leaf, a.leaf + 1, a.leaf, a.c)
      }
      void t
    },
  }
}

// --- octopus camouflage -----------------------------------------------------------

const octopus: Maker = (W, H, rng) => {
  const zones = [
    { x0: 0, c: 0xd8c088 },
    { x0: W * 0.33, c: 0x8a5a7a },
    { x0: W * 0.66, c: 0x4a8a5a },
  ]
  let x = W * 0.15
  let dir = 1
  let col = 0xff6a3a
  let ink: Spark[] = []
  let fish = { x: -6, on: false }
  let alarm = 0
  let t = 0

  const bgAt = (xx: number) => {
    let c = (zones[0] as { c: number }).c
    for (const z of zones) if (xx >= z.x0) c = z.c
    return c
  }

  return {
    step() {
      t++
      ink = sparks(ink, -0.01)
      if (alarm > 0) {
        alarm--
        x += dir * 1.2
        if (alarm === 0) dir = -dir
      } else {
        x += dir * 0.15
        col = mix(col, bgAt(x), 0.03)
      }
      if (x < 4 || x > W - 5) {
        dir = -dir
        x = clamp(x, 4, W - 5)
      }
      if (!fish.on && t % 360 === 200) fish = { x: dir > 0 ? W + 5 : -5, on: true }
      if (fish.on) {
        fish.x += fish.x > x ? -0.5 : 0.5
        if (Math.abs(fish.x - x) < 8 && !alarm) {
          alarm = 25
          burst(ink, rng, x, H * 0.7, 0x1a1a24, 20, 0.6)
          dir = fish.x > x ? -1 : 1
        }
        if (alarm && (fish.x < -6 || fish.x > W + 6)) fish.on = false
        if (alarm) fish.x += fish.x > x ? 0.8 : -0.8
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a6a9a, 0x0a2a4a)
      for (const [i, z] of zones.entries()) {
        const x1 = (zones[i + 1]?.x0 ?? W) as number
        for (let y = Math.round(H * 0.7); y < H; y++) for (let xx = Math.floor(z.x0); xx < x1; xx++) px[y * W + xx] = (xx + y) % 5 === 0 ? scale(z.c, 0.85) : z.c
      }
      for (let k = 0; k < 6; k++) dot(px, W, H, (k * 11 + t * 0.1) % W, (k * 7 + t * 0.2) % (H * 0.6), 0x6aa8d0)
      const y = H * 0.7 - 2
      const c = alarm > 0 ? (alarm % 4 < 2 ? 0xff3a3a : 0xffffff) : col
      lit(px, W, H, x, y - 3, 3, 3, c)
      for (let k = -2; k <= 2; k++) {
        const wav = Math.sin(t * 0.2 + k) * 1
        line(px, W, H, x + k * 1.2, y - 1, x + k * 2.2 + wav, y + 2, scale(c, 0.85))
      }
      dot(px, W, H, x - 1, y - 3, 0xffffff)
      dot(px, W, H, x + 1, y - 3, 0xffffff)
      dot(px, W, H, x - 1, y - 2, 0x1a1a1a)
      dot(px, W, H, x + 1, y - 2, 0x1a1a1a)
      for (const s of ink) disc(px, W, H, s.x, s.y, 1.3, s.c)
      if (fish.on) {
        // it swims toward the octopus, then away once it is spotted: face that way
        const FISH = ['y.yy.', 'yyyky', 'y.yy.']
        const right = alarm ? fish.x > x : fish.x < x
        litSprite(px, W, H, fish.x - 2, H * 0.4, right ? FISH : FISH.map(r => r.split('').reverse().join('')), { y: 0xffd040, k: 0x1a1a1a })
      }
    },
  }
}

// --- bees in the garden -----------------------------------------------------------

const bees: Maker = (W, H, rng) => {
  const flowers = Array.from({ length: 6 }, (_, i) => ({ x: 3 + (i / 5) * (W - 6), y: H * 0.55 + rng() * H * 0.3, c: hsv(rng(), 0.6, 1), h: 4 + rng() * 6 }))
  const hive = { x: W - 5, y: 8 }
  type Bee = { x: number; y: number; tx: number; ty: number; t: number; at: number; pollen: number }
  const bs: Bee[] = Array.from({ length: 6 }, () => ({ x: hive.x, y: hive.y, tx: hive.x, ty: hive.y, t: irand(rng, 60), at: -1, pollen: 0 }))
  let t = 0

  return {
    step() {
      t++
      for (const b of bs) {
        b.t--
        const d = Math.hypot(b.tx - b.x, b.ty - b.y)
        if (d > 0.5) {
          b.x += ((b.tx - b.x) / d) * 0.5 + Math.sin(t * 0.5 + b.ty) * 0.2
          b.y += ((b.ty - b.y) / d) * 0.5 + Math.cos(t * 0.4 + b.tx) * 0.2
        } else if (b.t <= 0) {
          if (b.pollen >= 3) {
            b.tx = hive.x
            b.ty = hive.y + 2
            b.pollen = 0
          } else {
            const f = pick(rng, flowers)
            b.tx = f.x
            b.ty = f.y - f.h - 1
            b.pollen++
          }
          b.t = 30 + irand(rng, 40)
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x9ad8ff, 0xe8f8e0)
      for (let y = Math.round(H * 0.6); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 3) % 7 === 0 ? 0x5aa83a : 0x6ac048
      for (const f of flowers) {
        const sway = Math.sin(t * 0.04 + f.x) * 0.8
        line(px, W, H, f.x, f.y, f.x + sway, f.y - f.h, 0x3a8a2a)
        const hx = f.x + sway
        const hy = f.y - f.h
        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ] as [number, number][])
          dot(px, W, H, hx + dx, hy + dy, f.c)
        dot(px, W, H, hx, hy, 0xffd040)
      }
      line(px, W, H, hive.x, 0, hive.x, 3, 0x6a4a2a)
      lit(px, W, H, hive.x, hive.y, 3, 4, 0xe0a83a)
      for (let k = -3; k <= 3; k += 2) rect(px, W, H, hive.x - 3, hive.y + k, 7, 1, 0xb8802a)
      dot(px, W, H, hive.x, hive.y + 2, 0x2a1a0a)
      for (const b of bs) {
        dot(px, W, H, b.x, b.y, 0xffd020)
        dot(px, W, H, b.x - 1, b.y, 0x1a1a1a)
        if (t % 2) dot(px, W, H, b.x, b.y - 1, 0xe8f4ff)
        if (b.pollen) dot(px, W, H, b.x, b.y + 1, 0xffa020)
      }
    },
  }
}

// --- squirrel obstacle course -----------------------------------------------------

const squirrel: Maker = (W, H, rng) => {
  const ground = H - 5
  const pts: [number, number, number][] = [
    [2, H * 0.3, 0],
    [W * 0.45, H * 0.3, 0],
    [W * 0.6, H * 0.45, 1],
    [W * 0.85, H * 0.45, 0],
    [W * 0.3, H * 0.62, 1],
    [W * 0.6, H * 0.62, 0],
    [W * 0.85, H * 0.8, 1],
    [W * 0.2, ground - 1, 1],
  ]
  let seg = 0
  let u = 0
  let t = 0
  let hold = 0
  let wheel = 0
  void rng

  return {
    step() {
      t++
      wheel += 0.1
      if (hold > 0) {
        if (--hold === 0) {
          seg = 0
          u = 0
        }
        return
      }
      const a = pts[seg] as [number, number, number]
      const b = pts[seg + 1] as [number, number, number] | undefined
      if (!b) {
        hold = 70
        return
      }
      const len = Math.hypot(b[0] - a[0], b[1] - a[1])
      u += (b[2] ? 0.9 : 0.55) / len
      if (u >= 1) {
        u = 0
        seg++
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ac8f0, 0xd8f0d0, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x6aa84a)
      rect(px, W, H, 0, H * 0.3 + 1, 2, H, 0x6a4a2a)
      line(px, W, H, 2, H * 0.3 + 1, W * 0.45, H * 0.3 + 1, 0xd8c8a0)
      rect(px, W, H, W * 0.58, H * 0.45 + 1, W * 0.3, 2, 0xa8784a)
      ring(px, W, H, W * 0.85, H * 0.45 - 3, 3.5, 0x8a8a96)
      line(px, W, H, W * 0.85, H * 0.45 - 3, W * 0.85 + Math.cos(wheel) * 3, H * 0.45 - 3 + Math.sin(wheel) * 3, 0x8a8a96)
      rect(px, W, H, W * 0.28, H * 0.62 + 1, W * 0.34, 1, 0xa8784a)
      for (let x = W * 0.3; x < W * 0.6; x += 4) rect(px, W, H, x, H * 0.62 + 1, 1, ground - H * 0.62, 0x8a6a3a)
      rect(px, W, H, W * 0.83, H * 0.8 + 1, 4, ground - H * 0.8, 0x8a6a3a)
      const nx = W * 0.2
      if (!(hold > 0 && hold < 50)) {
        lit(px, W, H, nx, ground - 2, 1.5, 1.5, 0xa8783a)
        rect(px, W, H, nx - 1, ground - 4, 3, 1, 0x6a4a2a)
      }
      const a = pts[seg] as [number, number, number]
      const b = (pts[seg + 1] ?? a) as [number, number, number]
      let x = a[0] + (b[0] - a[0]) * u
      let y = a[1] + (b[1] - a[1]) * u
      if (b[2]) y -= Math.sin(u * Math.PI) * 6
      const dir = b[0] >= a[0] ? 1 : -1
      if (hold > 0) {
        x = nx + 2
        y = ground - 1
      }
      const rows = ['...tt', '..ttt', 'bb.tt', 'bbbb.', 'b.b..']
      litSprite(px, W, H, x - 2, y - 5, dir > 0 ? rows.map(r => [...r].reverse().join('')) : rows, { t: 0xc8884a, b: 0xa86a3a })
      dot(px, W, H, x + dir, y - 4, 0x1a1a1a)
      if (hold > 0 && hold % 10 < 5) text(px, W, H, x - 1, y - 12, '!', 0xffd040)
    },
  }
}

// --- sleeping cat ---------------------------------------------------------------

const chat: Maker = (W, H, rng) => {
  const furs = [
    [0xf0a050, 0xc0702a],
    [0x9a9aa8, 0x6a6a78],
    [0x3a3a42, 0x26262c],
    [0xf4f0e8, 0xd8b890],
  ]
  const [fur, stripe] = furs[Math.floor(rng() * furs.length)] as [number, number]
  const floorY = Math.round(H * 0.72)
  const cx = W / 2
  const cushionY = floorY + 3
  let t = 0
  let zs: { x: number; y: number; life: number }[] = []
  let twitch = 0

  return {
    step() {
      t++
      if (t % 45 === 0) zs.push({ x: cx + W * 0.2, y: cushionY - 14, life: 50 })
      for (const z of zs) {
        z.y -= 0.25
        z.x += Math.sin(z.life * 0.15) * 0.15
        z.life--
      }
      zs = zs.filter(z => z.life > 0)
      if (twitch > 0) twitch--
      else if (rng() < 0.01) twitch = 5
    },
    draw(px) {
      for (let y = 0; y < floorY; y++)
        for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 2) % 8 === 0 ? 0x47334a : mix(0x3b2a3f, 0x2a1e2e, y / floorY)
      for (let y = floorY; y < H; y++)
        for (let x = 0; x < W; x++) px[y * W + x] = (x + (y % 3 === 0 ? 0 : 5)) % 10 === 0 || y % 3 === 0 ? 0x5a3a22 : 0x7a5030
      rect(px, W, H, 3, 4, 11, 10, 0x6a4a3a)
      rect(px, W, H, 4, 5, 9, 8, 0x101838)
      disc(px, W, H, 10, 8, 1.6, 0xf4f0d8)
      rect(px, W, H, 8, 5, 1, 8, 0x6a4a3a)
      rect(px, W, H, 4, 9, 9, 1, 0x6a4a3a)
      for (let y = cushionY - 2; y < cushionY + 4; y++)
        for (let x = 0; x < W; x++) {
          const k = ((x - cx) / (W * 0.42)) ** 2 + ((y - cushionY - 1) / 3) ** 2
          if (k <= 1) px[y * W + x] = k > 0.7 ? 0x8a2050 : 0xb03a6a
        }
      const breath = Math.sin(t * 0.08) * 0.7
      const rx = W * 0.27
      const ry = 4.5 + breath
      const by = cushionY - 2 - ry
      for (let y = Math.floor(by - ry - 1); y <= by + ry + 1; y++)
        for (let x = Math.floor(cx - rx - 1); x <= cx + rx + 1; x++) {
          const k = ((x - cx) / rx) ** 2 + ((y - by) / ry) ** 2
          if (k <= 1) dot(px, W, H, x, y, Math.floor((x - cx + 40) / 3) % 2 && k < 0.75 && y < by + ry * 0.5 ? stripe : fur)
        }
      for (let a = 0; a < Math.PI * 0.8; a += 0.05) {
        const x = cx - Math.cos(a) * (rx + 0.5)
        const y = by + Math.sin(a) * (ry + 0.6)
        dot(px, W, H, x, y, stripe)
      }
      const hx = cx + rx * 0.6
      const hy = by - ry * 0.35
      lit(px, W, H, hx, hy, 4, 4, fur)
      const ear = twitch > 0 ? 1 : 0
      for (const side of [-1, 1]) {
        for (let j = 0; j < 3; j++)
          for (let i = 0; i <= 2 - j; i++) {
            dot(px, W, H, hx + side * (1.5 + i) - (side < 0 ? 0 : 0), hy - 3 - j - (side > 0 ? ear : 0), fur)
          }
        dot(px, W, H, hx + side * 2, hy - 3 - (side > 0 ? ear : 0), 0xf0a0b0)
      }
      dot(px, W, H, hx - 2, hy, 0x1a1a1a)
      dot(px, W, H, hx - 1, hy + 0.4, 0x1a1a1a)
      dot(px, W, H, hx + 1, hy + 0.4, 0x1a1a1a)
      dot(px, W, H, hx + 2, hy, 0x1a1a1a)
      dot(px, W, H, hx, hy + 2, 0xf08090)
      for (const z of zs) text(px, W, H, z.x, z.y, 'Z', mix(0x2a1e2e, 0xe8e8ff, Math.min(1, z.life / 25)))
    },
  }
}

// --- cat vs laser pointer -----------------------------------------------------------

const catlaser: Maker = (W, H, rng) => {
  // a red dot darts about the room; the cat stalks it, wiggles, pounces, and mostly misses
  const floor = Math.round(H * 0.72)
  const CAT = [
    '..........o..o',
    '..........oooo',
    'o.........ooeon',
    '.o.oodoodoooo..',
    '..ooooooooowo..',
    '..oodoodooowo..',
    '..oooooooooo...',
    '..o.o....o.o...',
    '..o.o....o.o...',
  ]
  const CROUCH = [
    '...............',
    '...............',
    '..........o..o.',
    'o.........oooo.',
    '.o........ooeon',
    '..oodoodoooooo.',
    '..ooooooooowo..',
    '..oodoodooowo..',
    '..oo.oo..oo.oo.',
  ]
  const fur = { o: 0xe8903a, d: 0xa8521a, e: 0x2a5a1a, n: 0xf08a9a, w: 0xfff0dc }
  const flip = (rows: string[]) => rows.map(r => r.padEnd(15, '.').split('').reverse().join(''))
  let dot0 = { x: W * 0.7, y: floor + 8 }
  let target = { x: W * 0.3, y: floor + 8 }
  let hold = 0
  let cx = W * 0.3
  let cy = 0
  let vy = 0
  let vx = 0
  let face = 1
  let state: 'stalk' | 'wiggle' | 'pounce' | 'land' = 'stalk'
  let timer = 0
  let catches = 0
  let caught = 0
  let t = 0
  let fx: Spark[] = []
  const newTarget = () => {
    const wall = rng() < 0.25
    target = wall ? { x: 3 + rng() * (W - 6), y: H * 0.22 + rng() * (floor - H * 0.3) } : { x: 3 + rng() * (W - 6), y: floor + 7 + rng() * (H - floor - 11) }
    hold = 8 + irand(rng, 25)
  }

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      // the dot: dashes to a spot, waits, dashes again; it flees a pounce
      if (caught > 0) caught--
      else if (hold > 0) hold--
      else {
        const dx = target.x - dot0.x
        const dy = target.y - dot0.y
        const d = Math.hypot(dx, dy)
        if (d < 1.6) newTarget()
        else {
          dot0.x += (dx / d) * 1.6
          dot0.y += (dy / d) * 1.6
        }
      }
      const onFloor = dot0.y > floor
      const dx = dot0.x - cx
      if (state === 'stalk') {
        face = dx > 0 ? 1 : -1
        if (Math.abs(dx) > 9) cx += Math.sign(dx) * 0.7
        else if (Math.abs(dx) < 5) cx -= Math.sign(dx) * 0.3
        else if (hold > 0 && caught === 0) {
          state = 'wiggle'
          timer = 10 + irand(rng, 10)
        }
        // up the wall: a leap at it now and then
        if (!onFloor && Math.abs(dx) < 4 && hold > 4 && rng() < 0.03) {
          state = 'pounce'
          vy = -2.6
          vx = 0
        }
      } else if (state === 'wiggle') {
        if (--timer <= 0) {
          state = 'pounce'
          vy = -1.6
          vx = (dx - face * 4) / 20
          // most of the time the dot slips away just before the paws land
          if (rng() < 0.7) {
            target = { x: clamp(dot0.x + (rng() < 0.5 ? -1 : 1) * (10 + rng() * 8), 3, W - 3), y: floor + 7 + rng() * (H - floor - 11) }
            hold = 3
          } else hold = Math.max(hold, 26)
        }
      } else if (state === 'pounce') {
        cx = clamp(cx + vx, 4, W - 4)
        cy += vy
        vy += 0.16
        if (cy >= 0) {
          cy = 0
          state = 'land'
          timer = 12
          if (Math.abs(dot0.x - cx - face * 4) < 3.5 && onFloor) {
            catches++
            caught = 20
            burst(fx, rng, cx + face * 4, floor + 8, 0xffe080, 8, 0.7)
          }
        }
      } else if (--timer <= 0) {
        state = 'stalk'
        if (caught) newTarget()
      }
    },
    draw(px) {
      // a living room: warm wall, a framed picture, a skirting board, a wooden floor
      sky(px, W, H, 0x4a3a5a, 0x6a5068, floor)
      rect(px, W, H, W * 0.55, H * 0.12, W * 0.32, H * 0.14, 0x3a2a3a)
      rect(px, W, H, W * 0.55 + 1, H * 0.12 + 1, W * 0.32 - 2, H * 0.14 - 2, 0x5a8aa0)
      rect(px, W, H, W * 0.55 + 1, H * 0.2, W * 0.32 - 2, H * 0.06 - 1, 0x4a7a4a)
      rect(px, W, H, 0, floor - 2, W, 2, 0xd8c8b8)
      for (let y = floor; y < H; y++) {
        const plank = Math.floor((y - floor) / 3)
        for (let x = 0; x < W; x++) {
          const seam = (x + plank * 11) % 16 === 0 || (y - floor) % 3 === 2
          px[y * W + x] = seam ? 0x5a3420 : mix(0x9a6038, 0x6a4026, (y - floor) / (H - floor))
        }
      }
      // the cat's shadow, then the cat
      ellipse(px, W, H, cx, floor + 10, 6 + cy * 0.2, 1, 0x4a2c18)
      const rows = state === 'wiggle' || state === 'land' ? CROUCH : CAT
      const wig = state === 'wiggle' ? (t % 4 < 2 ? 1 : 0) : 0
      litSprite(px, W, H, Math.round(cx - 7 + wig), Math.round(floor + 1 + cy), face > 0 ? rows : flip(rows), fur)
      // the dot: a hot red centre and a soft glow
      if (caught === 0 || caught % 4 < 2) {
        for (let k = 0; k < 9; k++) {
          const [ox, oy] = [(k % 3) - 1, Math.floor(k / 3) - 1]
          if (ox && oy) continue
          tint(px, W, H, dot0.x + ox, dot0.y + oy, 0xff3030, 0.45)
        }
        dot(px, W, H, dot0.x, dot0.y, 0xffd0c0)
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, String(catches), 0xf0e0d0)
    },
  }
}

// --- salmon run ---------------------------------------------------------------------

const salmon: Maker = (W, H, rng) => {
  // salmon leap up a waterfall; some make it, some fall back, and the bear at the top catches one now and then
  const lip = Math.round(H * 0.38)
  const pool = Math.round(H * 0.74)
  const fallX0 = 2
  const fallX1 = W - 2
  const bearX = Math.round(W * 0.66)
  type Fish = { x: number; y: number; vx: number; vy: number; up: number }
  let fish: Fish[] = []
  let fx: Spark[] = []
  let made = 0
  let caught = 0
  let chomp = 0
  let held = 0
  let t = 0
  const BEAR = [
    '..bb....bb..',
    '..bbbbbbbb..',
    '.bbbbbbbbbb.',
    '.bbebbbbebb.',
    '.bbbbbbbbbb.',
    '.bbbbmmbbbb.',
    '..bbbnnbbb..',
    '.bbbbbbbbbb.',
    'bbbbbbbbbbbb',
    'bbbbbbbbbbbb',
  ]

  return {
    step() {
      t++
      fx = sparks(fx, 0.08)
      if (chomp > 0) chomp--
      if (held > 0) held--
      if (rng() < 0.06 && fish.length < 5) {
        const x = fallX0 + 4 + rng() * (fallX1 - fallX0 - 8)
        fish.push({ x, y: pool + 2, vx: (rng() - 0.5) * 0.3, vy: -Math.sqrt(0.24 * (pool + 2 - lip) * (0.8 + rng() * 0.4)), up: 0 })
        for (let k = 0; k < 4; k++) fx.push({ x, y: pool, vx: (rng() - 0.5) * 0.8, vy: -0.6 - rng() * 0.6, l: 8, c: 0xffffff })
      }
      for (const f of fish) {
        if (f.up) {
          // over the lip: it swims away upstream
          f.x -= 0.6
          f.up++
          continue
        }
        f.x += f.vx
        f.y += f.vy
        f.vy += 0.12
        // the bear's jaws, at the top of the fall
        if (!held && chomp === 0 && Math.abs(f.x - (bearX + 1)) < 4 && Math.abs(f.y - (lip - 4)) < 3 && rng() < 0.6) {
          chomp = 10
          held = 40
          caught++
          f.up = 999
          continue
        }
        if (f.vy > -0.3 && f.y < lip - 1) {
          f.up = 1
          f.y = lip - 2
          made++
        }
        if (f.y > pool + 3) {
          f.up = 999
          for (let k = 0; k < 5; k++) fx.push({ x: f.x, y: pool, vx: (rng() - 0.5) * 1, vy: -0.5 - rng() * 0.8, l: 9, c: 0xd8f0ff })
        }
      }
      fish = fish.filter(f => f.up < 40)
    },
    draw(px) {
      // dusk sky, a dark pine ridge, the river up top, the falls, the pool, the rocks
      sky(px, W, H, 0x5a7aa8, 0xa8c0d0, lip - 4)
      for (let x = 0; x < W; x++) {
        const ridge = Math.round(lip - 10 + Math.abs(((x * 7) % 10) - 5) * 0.8 + Math.sin(x * 0.5) * 1.5)
        for (let y = Math.max(0, ridge); y < lip; y++) px[y * W + x] = 0x24402e
      }
      for (let y = lip - 3; y < lip; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === lip - 3 ? 0x8ac8e8 : 0x4a90c0
      for (let y = lip; y < pool; y++)
        for (let x = 0; x < W; x++) {
          if (x < fallX0 || x >= fallX1) {
            px[y * W + x] = 0x3a3430
            continue
          }
          // streaks running down the falls
          const band = Math.floor((y - t * 1.6 + (x % 3) * 4 + (x % 5) * 3) / 5) % 3
          px[y * W + x] = band === 0 ? 0xf0f8ff : band === 1 ? 0xb8dcf0 : 0x8ac0e0
        }
      for (let y = pool; y < H; y++)
        for (let x = 0; x < W; x++) px[y * W + x] = y < pool + 2 ? (Math.floor((x + t * 0.5) / 3) % 2 ? 0xffffff : 0xd8eef8) : mix(0x2a6a9a, 0x123a5a, (y - pool) / (H - pool))
      // the bear, standing in the river at the lip
      litSprite(px, W, H, bearX - 5, lip - 13, BEAR, { b: 0x6a4026, e: 0x1a1008, m: 0x2a1a10, n: chomp > 0 ? 0xc04a4a : 0x4a2a18 })
      rect(px, W, H, bearX - 5, lip - 3, 12, 3, 0x4a90c0)
      if (held) {
        // a salmon in its jaws, flapping
        rect(px, W, H, bearX - 2, lip - 7 + (t % 4 < 2 ? 0 : 1), 7, 2, 0xe86a5a)
        dot(px, W, H, bearX + 4, lip - 8, 0xe86a5a)
      }
      // the salmon: a silver-pink body pointing the way it moves, a darker back, a tail
      for (const f of fish) {
        if (f.up >= 999) continue
        const sp = Math.hypot(f.vx || -0.6, f.up ? 0 : f.vy) || 1
        const ux = (f.up ? -0.6 : f.vx) / sp
        const uy = (f.up ? 0 : f.vy) / sp
        for (let k = -3; k <= 3; k++) {
          const x = f.x + ux * k
          const y = f.y + uy * k
          dot(px, W, H, x, y, k > 1 ? 0xf0a090 : 0xe86a5a)
          dot(px, W, H, x - uy, y + ux, k === 3 ? 0xffffff : 0xa83a3a)
        }
        dot(px, W, H, f.x - ux * 4 - uy, f.y - uy * 4 + ux, 0xa83a3a)
        dot(px, W, H, f.x - ux * 4 + uy, f.y - uy * 4 - ux, 0xa83a3a)
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, String(made), 0xffffff)
      text(px, W, H, W - textWidth(String(caught)) - 1, 1, String(caught), 0xf0c080)
    },
  }
}

export const ANIMALS = {
  chat,
  catglass,
  zoomies,
  capybara,
  ducklings,
  frog,
  hamster,
  penguins,
  corgi,
  cucumber,
  hippo,
  frisbee,
  feeder,
  otters,
  raccoon,
  leafcutter,
  octopus,
  bees,
  squirrel,
  catlaser,
  salmon,
}
