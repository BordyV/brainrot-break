import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, clamp, ellipse, hash, irand, line, lit, poly, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Insects & tiny worlds: small lives, big drama.

// --- caterpillar to butterfly -------------------------------------------------------

const butterfly: Maker = (W, H, rng) => {
  const branchY = Math.round(H * 0.46)
  let t = 0
  let hue = rng()
  let bites = 0
  let bx = W * 0.55
  let by = H * 0.3
  const T = { eat: 160, hang: 200, spin: 250, wait: 330, open: 380, fly: 470 }

  return {
    step() {
      t++
      if (t < T.eat && t % 8 === 0) bites++
      if (t >= T.open) {
        const k = t - T.open
        bx = W * 0.55 + Math.sin(k * 0.08) * 6 + k * 0.1
        by = branchY + 12 - k * 0.25 + Math.sin(k * 0.2) * 2
      }
      if (t > T.fly) {
        t = 0
        bites = 0
        hue = rng()
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ad0f0, 0xe0f4d8)
      for (let y = Math.round(H * 0.75); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x6ab04a, 0x3a7a2a, (y - H * 0.75) / (H * 0.25))
      // the branch, and the leaf being eaten from its tip
      beam(px, W, H, 0, branchY, W, branchY - 3, 0x8a5a30)
      const leafLen = Math.max(0, 16 - bites * 0.65)
      if (leafLen > 0) {
        const lx = W * 0.22
        const ly = branchY + 1
        poly(px, W, H, [[lx, ly], [lx - 3, ly + leafLen * 0.5], [lx, ly + leafLen], [lx + 3, ly + leafLen * 0.5]], 0x4ab83a)
        line(px, W, H, lx, ly, lx, ly + leafLen, 0x2a7a2a)
        for (let k = 0; k < bites; k++) dot(px, W, H, lx + ((k % 2) * 2 - 1) * 2, ly + leafLen - 1, 0x8ad0f0)
      }
      const fat = 1 + Math.min(1, bites / 20) * 0.5
      if (t < T.hang) {
        // the caterpillar: green segments with yellow spots, chewing at the leaf
        const head = t < T.eat ? W * 0.22 + 3 : Math.min(W * 0.55, W * 0.22 + 3 + (t - T.eat) * 0.3)
        for (let k = 0; k < 6; k++) {
          const x = head + k * 1.8
          const y = branchY - 2 - Math.abs(Math.sin(t * 0.2 - k * 0.6)) * (t < T.eat ? 0.3 : 1)
          lit(px, W, H, x, y, fat, fat, 0x6ad04a, 0x2a6a1a)
          if (k % 2) dot(px, W, H, x, y - fat, 0xf0e040)
        }
        dot(px, W, H, head - 1, branchY - 3, 0x1a1a1a)
      } else if (t < T.open) {
        // the chrysalis hangs and darkens; then it goes clear
        const x = W * 0.55
        const k = Math.min(1, (t - T.hang) / (T.spin - T.hang))
        const col = t < T.wait ? mix(0x6ad04a, 0x4a9a3a, k) : mix(0x4a9a3a, hsv(hue, 0.7, 0.6), (t - T.wait) / (T.open - T.wait))
        line(px, W, H, x, branchY - 2, x, branchY + 2, 0x6a4a2a)
        lit(px, W, H, x, branchY + 7, 2.2 * Math.min(1, k + 0.4), 5, col, 0x1a3a1a)
        dot(px, W, H, x - 1, branchY + 5, 0xf0e060)
        if (t > T.wait && t % 10 < 3) tint(px, W, H, x + 1, branchY + 8, 0xffffff, 0.5)
      } else {
        // the butterfly: wings beat, four lit panels with eye spots
        const flap = Math.abs(Math.sin(t * 0.35))
        const span = 3 + flap * 5
        const col = hsv(hue, 0.75, 0.95)
        for (const s of [-1, 1]) {
          lit(px, W, H, bx + s * span * 0.6, by - 2, span * 0.6, 3.4, col, tones(col)[3])
          lit(px, W, H, bx + s * span * 0.45, by + 2, span * 0.4, 2.4, mix(col, 0xff8040, 0.3), tones(col)[3])
          dot(px, W, H, bx + s * span * 0.7, by - 2, 0x1a1a2a)
        }
        rect(px, W, H, bx, by - 3, 1, 6, 0x2a1a1a)
        dot(px, W, H, bx - 1, by - 5, 0x2a1a1a)
        dot(px, W, H, bx + 1, by - 5, 0x2a1a1a)
      }
    },
  }
}

// --- dung beetle --------------------------------------------------------------------

const dungbeetle: Maker = (W, H, rng) => {
  // a slope up to a crest, then down the far side
  const ground = (x: number) => {
    const crest = W * 0.7
    return x < crest ? H * 0.82 - (x / crest) * H * 0.3 : H * 0.52 + (x - crest) * 0.9
  }
  const R = Math.max(2.5, W * 0.12)
  let s = 2
  let v = 0
  let t = 0
  let slip = 0
  let roll = 0
  let over = 0
  const reset = () => {
    s = 3
    v = 0
    t = 0
    slip = 0
    roll = 0
    over = 0
  }
  reset()

  return {
    step() {
      t++
      if (over) {
        // over the crest: the ball runs away down the other side
        v += 0.04
        s += v
        roll += v / R
        if (s > W + 10) reset()
        return
      }
      if (slip > 0) {
        slip--
        s -= 0.6
        roll -= 0.6 / R
        if (slip === 0) s = Math.max(3, s)
        return
      }
      s += 0.18
      roll += 0.18 / R
      if (rng() < 0.004 && s > W * 0.3) slip = 18
      if (s > W * 0.72) over = 1
    },
    draw(px) {
      // the savanna at sunset, acacias far away
      sky(px, W, H, 0xf08a4a, 0xf8d090)
      ellipse(px, W, H, W * 0.25, H * 0.34, 4, 4, 0xffe8a0)
      for (let x = 0; x < W; x++) for (let y = Math.round(H * 0.45); y < H; y++) px[y * W + x] = mix(0xc88a50, 0xa86a3a, (y - H * 0.45) / (H * 0.55))
      rect(px, W, H, W * 0.1, H * 0.4, 1, 4, 0x4a3020)
      ellipse(px, W, H, W * 0.1, H * 0.4, 3, 1, 0x4a5a28)
      for (let x = 0; x < W; x++) {
        const g = ground(x)
        for (let y = Math.round(g); y < H; y++) px[y * W + x] = y < g + 1 ? 0xe0b070 : hash(x, y, 2) < 0.1 ? 0x8a5a30 : mix(0xb87a44, 0x7a4a24, (y - g) / 20)
      }
      // the dung ball: lumpy, lit, rolling
      const bx = s
      const by = ground(s) - R
      lit(px, W, H, bx, by, R, R, 0x7a5030, 0x2a1808)
      for (let k = 0; k < 4; k++) {
        const a = roll + k * 1.6
        dot(px, W, H, bx + Math.cos(a) * R * 0.55, by + Math.sin(a) * R * 0.55, 0x5a3a20)
      }
      if (!over) {
        // the beetle, head down behind it, back legs up on the ball
        const ex = bx - R - 2.5
        const ey = ground(ex) - 2
        lit(px, W, H, ex, ey, 2.4, 1.7, 0x2a2a3a, 0x0a0a10)
        dot(px, W, H, ex - 1, ey - 1, 0x6a7aa0)
        dot(px, W, H, ex - 2.5, ey + 1, 0x1a1a24)
        const step = Math.floor(t / 4) % 2
        line(px, W, H, ex + 1, ey - 1, bx - R + 0.5, by - 1 + step, 0x1a1a24)
        line(px, W, H, ex + 1, ey, bx - R + 0.5, by + 1 - step, 0x1a1a24)
        dot(px, W, H, ex - 1, ey + 2, 0x1a1a24)
        dot(px, W, H, ex + 1, ey + 2 - step, 0x1a1a24)
      }
      const pct = `${Math.round(clamp(s / (W * 0.72), 0, 1) * 100)}%`
      text(px, W, H, 1, 1, pct, 0xffffff)
    },
  }
}

// --- mosquito vs swatter ------------------------------------------------------------

const mosquito: Maker = (W, H, rng) => {
  let mx = W / 2
  let my = H / 2
  let vx = 0
  let vy = 0
  let sw = { x: W / 2, y: H * 0.8, z: 0, aim: [0, 0] as [number, number], swing: 0 }
  let misses = 0
  let t = 0
  let fx: Spark[] = []
  let flash = 0

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (flash) flash--
      // the mosquito wanders, then darts when the swatter comes
      vx += (rng() - 0.5) * 0.5
      vy += (rng() - 0.5) * 0.5
      const dx = mx - sw.x
      const dy = my - sw.y
      const d = Math.hypot(dx, dy) || 1
      if (sw.swing > 0 && d < 12) {
        vx += (dx / d) * 0.9
        vy += (dy / d) * 0.9
      }
      vx *= 0.85
      vy *= 0.85
      mx = clamp(mx + vx, 3, W - 3)
      my = clamp(my + vy, 8, H - 6)
      if (sw.swing > 0) {
        sw.swing++
        const k = Math.min(1, sw.swing / 6)
        sw.x += (sw.aim[0] - sw.x) * k * 0.6
        sw.y += (sw.aim[1] - sw.y) * k * 0.6
        if (sw.swing === 7) {
          // SLAP. and it's not there.
          flash = 4
          misses++
          for (let k2 = 0; k2 < 8; k2++) fx.push({ x: sw.aim[0] + (rng() - 0.5) * 6, y: sw.aim[1] + (rng() - 0.5) * 6, vx: (rng() - 0.5), vy: (rng() - 0.5), l: 8, c: 0xffffff })
        }
        if (sw.swing > 18) sw.swing = 0
      } else {
        sw.x += (mx - sw.x) * 0.06
        sw.y += (my + 6 - sw.y) * 0.06
        if (t % 40 === 0) {
          sw.swing = 1
          sw.aim = [mx, my]
        }
      }
    },
    draw(px) {
      // a bedroom wall at night, a lamp, a picture frame
      sky(px, W, H, 0x3a3a5a, 0x2a2a44)
      for (let x = 0; x < W; x += 5) for (let y = 0; y < H; y++) px[y * W + x] = mix(px[y * W + x], 0x4a4a6a, 0.3)
      for (let k = 0; k < 10; k++) for (let a = 0; a < 8; a++) tint(px, W, H, 4 + Math.cos(a) * k, 4 + Math.sin(a) * k, 0xffd890, 0.08)
      slab(px, W, H, 2, 1, 5, 4, 0xf0c060)
      slab(px, W, H, W - 12, H * 0.25, 9, 7, 0x8a6a3a, 0x3a2a14)
      rect(px, W, H, W - 11, H * 0.25 + 1, 7, 5, 0x5a8ab0)
      if (flash) for (let i = 0; i < W * H; i++) px[i] = mix(px[i], 0xffffff, 0.15)
      // the mosquito: a dark body, wings in a blur
      const wing = t % 2 ? 0xc8d0e0 : 0x8a90a8
      dot(px, W, H, mx, my, 0x2a1a1a)
      dot(px, W, H, mx + 1, my, 0x4a2a2a)
      dot(px, W, H, mx - 1, my + 1, 0x2a1a1a)
      dot(px, W, H, mx, my - 1, wing)
      dot(px, W, H, mx + 1, my - 1, wing)
      dot(px, W, H, mx - 1, my, 0x2a1a1a)
      // the swatter: a mesh head on a long handle
      const size = sw.swing > 0 && sw.swing < 8 ? 6 : 5
      const hx = sw.x
      const hy = sw.y
      for (let y = -size; y <= size; y++)
        for (let x = -size + 1; x <= size - 1; x++) {
          const edge = Math.abs(y) === size || Math.abs(x) === size - 1
          if (edge) dot(px, W, H, hx + x, hy + y, 0xd03a3a)
          else if ((x + y) % 2 === 0) tint(px, W, H, hx + x, hy + y, 0xe85a5a, 0.6)
        }
      beam(px, W, H, hx + 1, hy + size, hx + 5, hy + size + 16, 0xd8d0c0)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, W - 1 - textWidth('x' + misses), 1, 'x' + misses, 0xff8080)
    },
  }
}

// --- fly at the window --------------------------------------------------------------

const flywindow: Maker = (W, H, rng) => {
  const fx0 = 2
  const mid = Math.round(W * 0.58)
  const top = 6
  const bottom = Math.round(H * 0.82)
  let x = W * 0.3
  let y = H * 0.5
  let vx = 0.6
  let vy = 0
  let bonks = 0
  let t = 0
  let out = 0
  let fx: Spark[] = []
  const reset = () => {
    x = W * 0.3
    y = H * 0.5
    bonks = 0
    t = 0
    out = 0
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (out) {
        x += 0.8
        y -= 0.5
        if (++out > 50) reset()
        return
      }
      // it flies at the glass, bonk, back off, and again; the gap is right there
      vx += (rng() - 0.5) * 0.3
      vy += (rng() - 0.5) * 0.3
      vx = clamp(vx, -0.9, 0.9)
      vy = clamp(vy, -0.9, 0.9)
      x += vx
      y += vy
      if (y < top + 2 || y > bottom - 2) vy = -vy
      if (x < fx0 + 2) vx = Math.abs(vx)
      if (x > mid - 2) {
        if (t > 380 && y > top + 4 && y < bottom - 4) {
          out = 1
          return
        }
        x = mid - 2
        vx = -Math.abs(vx) - 0.3
        bonks++
        for (let k = 0; k < 3; k++) fx.push({ x: mid - 1, y, vx: -rng() * 0.4, vy: (rng() - 0.5) * 0.6, l: 6, c: 0xffffff })
      }
      // it hits the glass… on the closed side; the open half is to its right
      if (y > H * 0.45 && x > mid - 6 && rng() < 0.05) vy -= 0.6
    },
    draw(px) {
      // outside: sky and garden; inside: the window frame and sill
      sky(px, W, H, 0x6ab4f0, 0xc8e8ff)
      for (let yy = Math.round(H * 0.6); yy < H; yy++) for (let xx = 0; xx < W; xx++) px[yy * W + xx] = hash(xx >> 1, yy >> 1, 4) < 0.2 ? 0x4a9a3a : 0x5aaa44
      ellipse(px, W, H, W * 0.8, H * 0.55, 5, 4, 0x3a8a3a)
      // the closed pane on the left: glass with streaks of reflection
      for (let yy = top; yy < bottom; yy++)
        for (let xx = fx0; xx < mid; xx++) {
          px[yy * W + xx] = mix(px[yy * W + xx], 0xd8ecff, 0.25)
          if ((xx + yy) % 11 === 0 || (xx + yy) % 11 === 1) tint(px, W, H, xx, yy, 0xffffff, 0.35)
        }
      // the frame: the left pane's frame, the open half's swung-in sash
      const wood = 0xf0ece4
      rect(px, W, H, 0, 0, W, top, 0xe0d8cc)
      rect(px, W, H, 0, bottom, W, H - bottom, 0xd8d0c4)
      rect(px, W, H, 0, bottom, W, 1, 0xffffff)
      slab(px, W, H, 0, top, fx0, bottom - top, wood)
      slab(px, W, H, mid, top, 2, bottom - top, wood)
      slab(px, W, H, W - 2, top, 2, bottom - top, wood)
      rect(px, W, H, fx0, top, mid - fx0, 1, 0xb8b0a4)
      // the open sash, swung in at an angle
      line(px, W, H, W - 2, top + 1, W - 6, top + 4, 0xd8d0c4)
      line(px, W, H, W - 2, bottom - 1, W - 6, bottom - 4, 0xd8d0c4)
      // the fly: a fat dark body, wings that buzz
      const wing = t % 2 ? 0xd0d8e8 : 0xa0a8c0
      lit(px, W, H, x, y, 1.4, 1, 0x2a2a30, 0x0a0a10)
      dot(px, W, H, x - 1, y - 1, wing)
      dot(px, W, H, x + 1, y - 1, wing)
      dot(px, W, H, x + 1, y, 0x8a2020)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, H - 6, String(bonks), 0x5a5048)
    },
  }
}

// --- ant mill -----------------------------------------------------------------------

const antmill: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.52
  const R = Math.min(W, H) * 0.4
  type Ant = { a: number; r: number; joining: number; x: number; y: number }
  const ants: Ant[] = []
  for (let k = 0; k < 18; k++) ants.push({ a: (k / 18) * Math.PI * 2, r: R + (rng() - 0.5) * 3, joining: 0, x: 0, y: 0 })
  let t = 0
  let laps = 0
  let newcomer: Ant | null = null

  return {
    step() {
      t++
      // round and round, each following the one in front
      for (const a of ants) {
        a.a += 0.012 + Math.sin(a.a * 3 + t * 0.01) * 0.002
        a.r += (R + Math.sin(a.a * 5 + t * 0.02) * 1.5 - a.r) * 0.05
        a.x = cx + Math.cos(a.a) * a.r
        a.y = cy + Math.sin(a.a) * a.r * 1.15
      }
      if (t % 525 === 0) laps++
      // now and then one more walks in and joins the circle
      if (!newcomer && t % 200 === 100) newcomer = { a: rng() * Math.PI * 2, r: R * 2.2, joining: 1, x: 0, y: 0 }
      if (newcomer) {
        newcomer.r -= 0.4
        newcomer.a += 0.006
        newcomer.x = cx + Math.cos(newcomer.a) * newcomer.r
        newcomer.y = cy + Math.sin(newcomer.a) * newcomer.r * 1.15
        if (newcomer.r <= R) {
          newcomer.joining = 0
          if (ants.length < 26) ants.push(newcomer)
          newcomer = null
        }
      }
    },
    draw(px) {
      // dry soil, pebbles, the worn trail
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const h = hash(x, y, 3)
          px[y * W + x] = h < 0.05 ? 0x9a7a5a : h < 0.08 ? 0x6a4e34 : 0x8a6a48
        }
      for (let k = 0; k < 200; k++) {
        const a = (k / 200) * Math.PI * 2
        tint(px, W, H, cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2) * 1.15, 0x7a5a3a, 0.4)
      }
      // a leaf in the middle that no one goes to
      lit(px, W, H, cx, cy, 3, 1.8, 0x5aa03a, 0x2a5a1a)
      line(px, W, H, cx - 3, cy, cx + 3, cy, 0x3a7a2a)
      const all = newcomer ? [...ants, newcomer] : ants
      for (const a of all) {
        const hx = -Math.sin(a.a)
        const hy = Math.cos(a.a) * 1.15
        const l = Math.hypot(hx, hy) || 1
        // head, thorax, a big abdomen, legs that step
        const ux = hx / l
        const uy = hy / l
        dot(px, W, H, a.x + ux * 1.5, a.y + uy * 1.5, 0x2a1a10)
        dot(px, W, H, a.x, a.y, 0x1a0e08)
        dot(px, W, H, a.x - ux * 1.5, a.y - uy * 1.5, 0x3a2014)
        dot(px, W, H, a.x - ux * 2.3, a.y - uy * 2.3, 0x2a1a10)
        const leg = Math.floor(t / 3 + a.a * 10) % 2 ? 1 : -1
        dot(px, W, H, a.x - uy * 1.2 + ux * leg * 0.5, a.y + ux * 1.2 + uy * leg * 0.5, 0x4a3020)
        dot(px, W, H, a.x + uy * 1.2 - ux * leg * 0.5, a.y - ux * 1.2 - uy * leg * 0.5, 0x4a3020)
      }
      text(px, W, H, 1, 1, String(all.length), 0xf0e0c0)
      void laps
    },
  }
}

export const INSECTS = {
  butterfly,
  dungbeetle,
  mosquito,
  flywindow,
  antmill,
}
