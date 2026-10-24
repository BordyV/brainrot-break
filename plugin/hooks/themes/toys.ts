import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, collide, ellipse, irand, line, lit, ring, slab, sparks, tint, tones, wallCircle } from '../kit'
import type { Ball, Spark } from '../kit'

// Toys & desk toys: the things on a desk that keep moving.

// --- slinky on the stairs -----------------------------------------------------------

const slinky: Maker = (W, H, rng) => {
  const sw = Math.max(5, Math.round(W * 0.3))
  const sh = Math.max(4, Math.round(H * 0.11))
  const coils = 14
  let step = 0
  let k = 0
  let camX = 0
  let camY = 0
  let t = 0
  const hue = rng()

  return {
    step() {
      t++
      // one flip a step: the top of the slinky arcs over and lands a step lower
      k += 0.028
      if (k >= 1) {
        k = 0
        step++
        if (step > 40) step = 0
      }
      const tx = step * sw + sw * 0.5 - W * 0.35
      const ty = step * sh - H * 0.35
      camX += (tx - camX) * 0.08
      camY += (ty - camY) * 0.08
      if (step === 0 && k < 0.03) {
        camX = tx
        camY = ty
      }
    },
    draw(px) {
      sky(px, W, H, 0xe8dcc8, 0xd0c0a8)
      for (let x = 0; x < W; x++) if (Math.floor((x + camX * 0.3) / 6) % 2) for (let y = 0; y < H; y++) px[y * W + x] = mix(px[y * W + x], 0xc8b498, 0.25)
      // the stairs going down to the right: carpeted treads, lit noses
      for (let x = 0; x < W; x++) {
        const wx = x + camX
        const n = Math.floor(wx / sw)
        const fy = n * sh - camY + sh
        for (let y = Math.max(0, Math.round(fy)); y < H; y++) px[y * W + x] = y < fy + 1 ? 0xf0e0c0 : y < fy + 2 ? 0x8a5a3a : Math.floor(wx) % sw === 0 ? 0x5a3a22 : mix(0x7a4a2e, 0x4a2a18, (y - fy) / H)
      }
      // the coils: their two ends sit on two steps, the middle arcs between
      const x0 = step * sw + sw * 0.35 - camX
      const y0 = step * sh + sh - camY
      const x1 = x0 + sw
      const y1 = y0 + sh
      // the front end arcs over to the next step, then the back end follows it
      const th2 = Math.PI * Math.min(1, k * 2)
      const th1 = Math.PI * Math.max(0, k * 2 - 1)
      const r = (x1 - x0) / 2
      const lift = sh * 1.6
      for (let c = 0; c < coils; c++) {
        const u = c / (coils - 1)
        const th = th1 + (th2 - th1) * u
        const along = (1 - Math.cos(th)) / 2
        // where the ends overlap, the coils stack up instead
        const stack = (1 - Math.min(1, (th2 - th1) * 2)) * (th1 > 0 ? coils - 1 - c : c) * 0.6
        const ax = x0 + r - Math.cos(th) * r
        const ay = y0 + (y1 - y0) * along - Math.sin(th) * lift - 1 - stack
        const col = hsv(hue + c * 0.06, 0.65, 0.95)
        ellipse(px, W, H, ax, ay, 2.2, 0.8, col)
        dot(px, W, H, ax - 1, ay - 1, mix(col, 0xffffff, 0.5))
        dot(px, W, H, ax + 2, ay, mix(col, 0x1a1020, 0.4))
      }
      text(px, W, H, 1, 1, String(step), 0x5a3a22)
    },
  }
}

// --- drinking bird ------------------------------------------------------------------

const drinkingbird: Maker = (W, H, rng) => {
  const pivotX = W * 0.42
  const pivotY = H * 0.42
  const L = Math.min(W * 0.55, H * 0.32)
  let a = -0.25
  let va = 0
  let fill = 0
  let dips = 0
  let t = 0
  let drips: Spark[] = []
  const hat = hsv(rng() * 0.1, 0.8, 0.85)

  return {
    step() {
      t++
      drips = sparks(drips, 0.1)
      // the liquid climbs the neck, the head gets heavy, it tips into the glass
      fill = Math.min(1, fill + 0.008)
      const torque = (fill * 1.8 - 0.3 - a) * 0.006
      va = (va + torque) * 0.95
      a += va
      if (a > 1.3) {
        a = 1.3
        va = -0.015
        fill = 0
        dips++
        drips.push({ x: pivotX + Math.sin(a) * L, y: pivotY + Math.cos(a) * L * 0.1 + 10, vx: 0, vy: 0, l: 10, c: 0x8ad0ff })
      }
    },
    draw(px) {
      sky(px, W, H, 0xd8e4f0, 0xb8c8d8)
      const desk = Math.round(H * 0.8)
      for (let y = desk; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === desk ? 0xc89868 : mix(0xa87a4a, 0x7a5030, (y - desk) / (H - desk))
      // the glass of water it dips into
      const gx = Math.round(pivotX + Math.sin(1.3) * L * 0.68 + 1)
      const gy = Math.round(pivotY - Math.cos(1.3) * L * 0.68 - 2)
      for (let y = gy; y < desk; y++)
        for (let x = gx - 3; x <= gx + 3; x++) {
          const edge = x === gx - 3 || x === gx + 3
          dot(px, W, H, x, y, edge ? (x < gx ? 0xffffff : 0xa8b8c8) : y > gy + 2 ? 0x6ab8f0 : mix(px[y * W + x], 0xffffff, 0.3))
        }
      // the stand: two legs, a crossbar
      line(px, W, H, pivotX - 3, desk, pivotX, pivotY, 0x6a6a72)
      line(px, W, H, pivotX + 3, desk, pivotX, pivotY, 0x4a4a52)
      rect(px, W, H, pivotX - 4, desk - 1, 9, 1, 0x3a3a42)
      // the bird turns about the pivot: bottom bulb, neck tube, head, hat, beak
      const s = Math.sin(a)
      const c = Math.cos(a)
      const B = (d: number): [number, number] => [pivotX + s * d, pivotY - c * d]
      const [bx, by] = B(-L * 0.35)
      lit(px, W, H, bx, by, 3.2, 3.2, 0xd03a6a, 0x4a0a1a)
      dot(px, W, H, bx - 1, by - 1, 0xffb0c8)
      const neckLen = L * 0.95
      for (let k = 0; k < 40; k++) {
        const d = -L * 0.3 + (k / 40) * neckLen
        const [nx, ny] = B(d)
        const wet = k / 40 < fill * 0.85
        dot(px, W, H, nx, ny, wet ? 0xe04a7a : 0xd8e8f0)
        dot(px, W, H, nx + c, ny + s, 0xa8b8c8)
      }
      const [hx, hy] = B(L * 0.68)
      lit(px, W, H, hx, hy, 2.6, 2.6, 0x5a8ad0, 0x1a2a5a)
      // a top hat, a long beak, an eye
      const [tx, ty] = B(L * 0.68 + 3)
      rect(px, W, H, tx - 2, ty - 1, 5, 1, 0x1a1a24)
      rect(px, W, H, tx - 1, ty - 3, 3, 2, hat)
      const [kx, ky] = [hx + c * 3, hy + s * 3]
      line(px, W, H, hx + c * 1.5, hy + s * 1.5, kx + c * 2, ky + s * 2, 0xf0b030)
      dot(px, W, H, hx + c * 0.5 - s * 0.8, hy + s * 0.5 + c * -0.8, 0xffffff)
      for (const d of drips) dot(px, W, H, d.x, d.y, d.c)
      text(px, W, H, 1, 1, String(dips), 0x3a4a5a)
    },
  }
}

// --- water ring toss ----------------------------------------------------------------

const ringtoss: Maker = (W, H, rng) => {
  const x0 = 3
  const x1 = W - 3
  const y0 = 8
  const y1 = H - 12
  const pegs = [{ x: W * 0.35, top: y0 + (y1 - y0) * 0.45 }, { x: W * 0.68, top: y0 + (y1 - y0) * 0.35 }]
  type Ring = { x: number; y: number; vx: number; vy: number; hue: number; on: number }
  let rings: Ring[] = []
  let bubbles: Spark[] = []
  let press = [0, 0]
  let t = 0
  const reset = () => {
    rings = []
    for (let k = 0; k < 6; k++) rings.push({ x: x0 + 3 + rng() * (x1 - x0 - 6), y: y1 - 2 - rng() * 3, vx: 0, vy: 0, hue: k / 6, on: -1 })
    t = 0
  }
  reset()

  return {
    step() {
      t++
      bubbles = sparks(bubbles, -0.04)
      bubbles = bubbles.filter(b => b.y > y0)
      // the thumbs: left, right, left… jets of bubbles from the bottom corners
      if (t % 30 === 0) press[irand(rng, 2)] = 8
      for (let s = 0; s < 2; s++) {
        if (press[s] <= 0) continue
        press[s]--
        const jx = s ? x1 - 4 : x0 + 4
        for (let k = 0; k < 2; k++) bubbles.push({ x: jx + (rng() - 0.5) * 2, y: y1 - 1, vx: (s ? -0.3 : 0.3) + (rng() - 0.5) * 0.3, vy: -1, l: 40, c: 0xe0f8ff })
        for (const r of rings) {
          if (r.on >= 0) continue
          const d = Math.hypot(r.x - jx, r.y - y1)
          if (d < 18) {
            r.vy -= 0.18 * (1 - d / 18) + 0.03
            r.vx += (s ? -1 : 1) * 0.04 + (rng() - 0.5) * 0.05
          }
        }
      }
      for (const r of rings) {
        if (r.on >= 0) continue
        // rings sink slowly through the water
        r.vy += 0.008
        r.vx *= 0.96
        r.vy *= 0.96
        r.x = clamp(r.x + r.vx, x0 + 2, x1 - 2)
        r.y = clamp(r.y + r.vy, y0 + 1, y1 - 1)
        for (const [i, p] of pegs.entries()) if (Math.abs(r.x - p.x) < 0.9 && Math.abs(r.y - p.top) < 1 && r.vy > 0) r.on = i
      }
      if (t > 600 || rings.every(r => r.on >= 0)) reset()
    },
    draw(px) {
      sky(px, W, H, 0xf8c8d8, 0xf0a8c0)
      // the toy: a plastic case, water inside, two pegs, two buttons
      slab(px, W, H, x0 - 2, y0 - 2, x1 - x0 + 4, H - y0 - 1, 0xf0e060, 0x8a7a20)
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) px[y * W + x] = mix(0x7ad0f0, 0x3a8ad0, (y - y0) / (y1 - y0))
      for (let y = y0; y < y1; y++) tint(px, W, H, x0 + 1, y, 0xffffff, 0.4)
      for (const p of pegs) {
        rect(px, W, H, p.x, p.top, 1, y1 - p.top, 0xf05a5a)
        dot(px, W, H, p.x, p.top - 1, 0xff9a9a)
      }
      const stacked = [0, 0]
      for (const r of rings) {
        const col = hsv(r.hue, 0.75, 1)
        let x = r.x
        let y = r.y
        if (r.on >= 0) {
          x = pegs[r.on].x
          y = y1 - 1 - stacked[r.on]++ * 1.5
        }
        ellipse(px, W, H, x, y, 2, 0.6, col)
        dot(px, W, H, x, y, mix(col, 0x1a1a2a, 0.3))
      }
      for (const b of bubbles) dot(px, W, H, b.x, b.y, b.c)
      // the buttons, pressed in when the jets fire
      for (let s = 0; s < 2; s++) {
        const bx = s ? W - 7 : 7
        lit(px, W, H, bx, H - 6 + (press[s] ? 1 : 0), 2.5, 2, press[s] ? 0xd03a3a : 0xf05a5a, 0x6a1a1a)
      }
      const on = rings.filter(r => r.on >= 0).length
      text(px, W, H, W / 2 - 3, H - 8, `${on}/6`, 0x5a4a10)
    },
  }
}

// --- battling tops ------------------------------------------------------------------

const battletops: Maker = (W, H, rng) => {
  // two tops in a bowl: they circle, clash in sparks, slow down; the last one spinning wins
  const cx = W / 2
  const cy = H * 0.5
  const R = Math.min(W * 0.47, H * 0.3)
  type Top = Ball & { spin: number; a: number; out: number; hue: number }
  let tops: Top[] = []
  let fx: Spark[] = []
  let score = [0, 0]
  let over = 0
  let flash = 0
  const reset = () => {
    const r = Math.max(2.5, R * 0.3)
    tops = [0, 1].map(i => {
      const s = i ? 1 : -1
      return { x: cx + s * R * 0.6, y: cy - s * R * 0.2, vx: -s * 0.2, vy: s * 0.9, r, c: 0, spin: 0.85 + rng() * 0.15, a: rng() * 6, out: 0, hue: i ? 0.58 : 0.02 }
    })
    over = 0
  }
  reset()

  return {
    step() {
      fx = sparks(fx, 0)
      if (flash > 0) flash--
      for (const p of tops) {
        p.a += p.spin * 0.9
        if (p.out) {
          // a top that stopped topples onto its side and slides to rest
          p.out++
          p.vx *= 0.9
          p.vy *= 0.9
          p.x += p.vx
          p.y += p.vy
          continue
        }
        // the bowl pulls toward the middle; the spin drives a slow orbit
        const dx = p.x - cx
        const dy = p.y - cy
        const d = Math.hypot(dx, dy) || 1
        p.vx += (-dx / R) * 0.05 + (-dy / d) * 0.035 * p.spin
        p.vy += (-dy / R) * 0.05 + (dx / d) * 0.035 * p.spin
        p.vx *= 0.985
        p.vy *= 0.985
        // a dying top wobbles
        if (p.spin < 0.3) {
          p.vx += (rng() - 0.5) * 0.12
          p.vy += (rng() - 0.5) * 0.12
        }
        p.x += p.vx
        p.y += p.vy
        if (wallCircle(p, cx, cy, R - 1, 0.8)) p.spin -= 0.004
        p.spin -= 0.0026
      }
      const [a, b] = tops as [Top, Top]
      if (!a.out && !b.out && collide(a, b, 1.25)) {
        const hit = Math.hypot(a.vx - b.vx, a.vy - b.vy)
        if (hit > 0.3) {
          // the clash: sparks at the contact, both lose spin, the slower one more
          const mx = (a.x + b.x) / 2
          const my = (a.y + b.y) / 2
          burst(fx, rng, mx, my, 0xfff0a0, 6 + Math.round(hit * 4), 1 + hit * 0.6)
          flash = 2
          const loss = 0.02 + rng() * 0.05
          a.spin -= loss * (a.spin < b.spin ? 1.4 : 0.8)
          b.spin -= loss * (b.spin < a.spin ? 1.4 : 0.8)
        }
      }
      for (const p of tops) if (!p.out && p.spin <= 0.06) p.out = 1
      if (!over && tops.some(p => p.out)) {
        over = 1
        const loser = a.out ? 0 : 1
        score[1 - loser] = (score[1 - loser] as number) + 1
      }
      if (over && ++over > 60) reset()
    },
    draw(px) {
      // a dark stage, then the bowl: a dish in four tones, lit on its lower right inside
      sky(px, W, H, 0x0e1020, 0x1a1830)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const dx = x - cx
          const dy = y - cy
          const d = Math.hypot(dx, dy)
          if (d > R + 1.5) continue
          if (d > R - 0.5) {
            px[y * W + x] = dy < 0 ? 0x8a94b0 : 0x4a5068
            continue
          }
          const l = ((dx * 0.6 + dy * 0.8) / R) * (d / R)
          px[y * W + x] = l > 0.35 ? 0x5a6890 : l > 0 ? 0x44507a : l > -0.35 ? 0x343e64 : 0x283050
        }
      // a ring painted on the bowl's floor
      ring(px, W, H, cx, cy, R * 0.45, 0x4a5888)
      for (const p of tops) {
        const col = hsv(p.hue, 0.75, 0.95)
        const [hi, , sh, deep] = tones(col)
        if (p.out) {
          // on its side: a flat ellipse, still
          ellipse(px, W, H, p.x, p.y + 1, p.r + 1, p.r * 0.5, deep)
          ellipse(px, W, H, p.x, p.y, p.r + 1, p.r * 0.5, col)
          continue
        }
        // spinning: four coloured blades turning round a silver tip
        const wob = p.spin < 0.3 ? Math.sin(p.a * 0.7) * (0.3 - p.spin) * 4 : 0
        const x0 = p.x + wob
        const n = Math.ceil(p.r)
        for (let dy = -n; dy <= n; dy++)
          for (let dx = -n; dx <= n; dx++) {
            const d = Math.hypot(dx, dy)
            if (d > p.r + 0.3) continue
            const ang = Math.atan2(dy, dx) + p.a
            const blade = Math.floor(((ang / (Math.PI * 2)) * 4 + 8) % 4)
            const light = -(dx * 0.6 + dy * 0.8) / p.r
            let c = blade % 2 ? col : 0xc8ccd8
            c = light > 0.4 ? mix(c, hi, 0.6) : light < -0.4 ? mix(c, sh, 0.7) : c
            if (d > p.r - 0.7) c = deep
            if (d < 1) c = 0xf0f0f8
            dot(px, W, H, x0 + dx, p.y + dy, c)
          }
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.l > 6 ? 0xffffff : f.c)
      if (flash) for (let i = 0; i < W * H; i++) px[i] = mix(px[i] as number, 0xffffff, 0.15)
      text(px, W, H, 1, 1, String(score[0]), hsv(0.02, 0.6, 1))
      text(px, W, H, W - 4, 1, String(score[1]), hsv(0.58, 0.6, 1))
    },
  }
}

export const TOYS = {
  slinky,
  drinkingbird,
  ringtoss,
  battletops,
}
