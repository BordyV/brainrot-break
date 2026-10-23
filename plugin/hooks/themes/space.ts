import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, hash, irand, line, lit, pick, ring, slab, sparks } from '../kit'
import type { Spark } from '../kit'

// Space & sci-fi: black skies are cheap to draw and easy to read.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

function stars(px: Uint32Array, W: number, H: number, seed: number, t = 0, density = 0.04) {
  for (let y = 0; y < H; y++)
    for (let x = 0; x < W; x++) {
      const h = hash(x, y, seed)
      if (h < density) px[y * W + x] = mix(px[y * W + x] as number, 0xffffff, (h / density) * (0.6 + 0.4 * Math.sin(t * 0.05 + x * y)))
    }
}

// --- rocket launch and landing ----------------------------------------------------

const rocket: Maker = (W, H, rng) => {
  const pad = H - 6
  const cx = W / 2
  let t = 0
  let smoke: { x: number; y: number; r: number; vx: number }[] = []
  let flames: Spark[] = []

  return {
    step() {
      t++
      flames = sparks(flames, 0.05)
      for (const s of smoke) {
        s.x += s.vx
        s.r += 0.05
        s.vx *= 0.98
      }
      smoke = smoke.filter(s => s.r < 6)
      const rise = t > 75 && t < 200
      if ((t > 55 && t < 120) || (t > 330 && t < 380)) for (let k = 0; k < 2; k++) smoke.push({ x: cx + (rng() - 0.5) * 3, y: pad - 1, r: 1, vx: (rng() < 0.5 ? -1 : 1) * (0.3 + rng() * 0.6) })
      if (rise || (t > 280 && t < 380)) {
        const y = t < 200 ? rocketY(t) : boosterY(t)
        flames.push({ x: cx + (rng() - 0.5), y: y + 1, vx: (rng() - 0.5) * 0.3, vy: 0.8 + rng() * 0.6, l: 6, c: pick(rng, [0xffe080, 0xffa020, 0xff6020]) })
      }
      if (t > 460) {
        t = 0
        smoke = []
      }
    },
    draw(px) {
      const alt = span(t, 75, 200)
      sky(px, W, H, mix(0x4a8ad0, 0x05051a, alt), mix(0xb8d8f0, 0x2a3a6a, alt))
      if (alt > 0.4) stars(px, W, H, 11, t, 0.03 * alt)
      rect(px, W, H, 0, pad, W, H - pad, 0x5a5a62)
      rect(px, W, H, 0, pad, W, 1, 0x7a7a84)
      slab(px, W, H, cx - 6, pad - 1, 12, 2, 0x8a8a92)
      rect(px, W, H, cx + 5, pad - 22, 2, 22, 0x9a3a2a)
      rect(px, W, H, cx + 5, pad - 22, 1, 22, 0xc85a42)
      for (let y = pad - 22; y < pad; y += 3) dot(px, W, H, cx + 6, y, 0x6a2a1a)
      if (t < 200) {
        const y = rocketY(t)
        drawStack(px, W, H, cx, y, true)
      }
      if (t >= 200 && t < 280) {
        const u = span(t, 200, 280)
        rect(px, W, H, cx - 1, -10 + u * 2, 2, 1, 0xffffff)
      }
      if (t >= 280) {
        const y = boosterY(t)
        drawStack(px, W, H, cx, y, false)
        if (y > pad - 20) {
          dot(px, W, H, cx - 2, y + 1, 0x3a3a3a)
          dot(px, W, H, cx + 2, y + 1, 0x3a3a3a)
        }
      }
      for (const f of flames) dot(px, W, H, f.x, f.y, f.c)
      for (const s of smoke) disc(px, W, H, s.x + 0.4, s.y + 0.4, s.r, 0xb8bcc8)
      for (const s of smoke) disc(px, W, H, s.x - s.r * 0.2, s.y - s.r * 0.25, s.r * 0.75, 0xf4f4f8)
      if (t < 75) {
        const n = String(Math.max(0, 10 - Math.floor(t / 7)))
        text(px, W, H, 2, 2, n, 0xffffff)
      }
    },
  }
  function rocketY(t: number) {
    const u = span(t, 75, 200)
    return pad - 1 - u * u * (H + 20)
  }
  function boosterY(t: number) {
    const u = span(t, 280, 380)
    return -20 + (pad - 1 + 20) * (1 - (1 - u) * (1 - u))
  }
  function drawStack(px: Uint32Array, W: number, H: number, x: number, bottom: number, full: boolean) {
    const h = full ? 18 : 12
    rect(px, W, H, x - 1, bottom - h, 3, h, 0xf0f0f4)
    rect(px, W, H, x + 1, bottom - h, 1, h, 0xc8c8d0)
    rect(px, W, H, x - 1, bottom - 6, 3, 1, 0x2a2a30)
    if (full) {
      rect(px, W, H, x, bottom - h - 2, 1, 2, 0xf0f0f4)
      rect(px, W, H, x - 1, bottom - h + 4, 3, 1, 0x2a2a30)
    }
    dot(px, W, H, x - 2, bottom - 1, 0x3a3a40)
    dot(px, W, H, x + 2, bottom - 1, 0x3a3a40)
  }
}

// --- solar system -----------------------------------------------------------------

const solarsystem: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const sq = 1.6
  const R = Math.min(W / 2 - 1, (H / 2 - 2) / sq)
  const planets = [
    { r: 0.18, c: 0xb8a898, s: 0.6 },
    { r: 0.3, c: 0xe8c890, s: 1 },
    { r: 0.43, c: 0x3a8ae0, s: 1.1 },
    { r: 0.56, c: 0xd85a3a, s: 0.8 },
    { r: 0.76, c: 0xd8a870, s: 1.8 },
    { r: 0.96, c: 0xe8d8a0, s: 1.4 },
  ].map(p => ({ ...p, a: rng() * 6.28 }))
  let t = 0

  return {
    step() {
      t++
      for (const p of planets) p.a += 0.03 / Math.pow(p.r * 3, 1.5)
    },
    draw(px) {
      px.fill(0x03030c)
      stars(px, W, H, 5, t)
      for (const p of planets)
        for (let k = 0; k < 80; k++) {
          const a = (k / 80) * 6.28
          dot(px, W, H, cx + Math.cos(a) * p.r * R, cy + Math.sin(a) * p.r * R * sq, 0x1a1a30)
        }
      const draw = (front: boolean) => {
        planets.forEach((p, i) => {
          const z = Math.sin(p.a)
          if (front !== z >= 0) return
          const x = cx + Math.cos(p.a) * p.r * R
          const y = cy + Math.sin(p.a) * p.r * R * sq
          lit(px, W, H, x, y, p.s, p.s, p.c)
          if (i === 5) line(px, W, H, x - 3, y + 0.5, x + 3, y - 0.5, 0xc8b890)
          if (i === 2) dot(px, W, H, x + Math.cos(t * 0.15) * 2, y + Math.sin(t * 0.15) * 2, 0xd0d0d0)
        })
      }
      draw(false)
      disc(px, W, H, cx, cy, 3, 0xffd040)
      disc(px, W, H, cx, cy, 2, 0xfff4a0)
      draw(true)
    },
  }
}

// --- black hole -------------------------------------------------------------------

const blackhole: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.48
  const R = Math.min(W, H) * 0.14
  type P = { r: number; a: number; c: number }
  let ps: P[] = []
  let t = 0

  return {
    step() {
      t++
      if (ps.length < 60 && rng() < 0.5) ps.push({ r: R * 4 + rng() * R * 2, a: rng() * 6.28, c: pick(rng, [0xffffff, 0xfff0c0, 0xa0c8ff]) })
      for (const p of ps) {
        p.a += 0.6 / Math.pow(p.r, 1.1)
        p.r -= 0.05 + 2 / p.r
      }
      ps = ps.filter(p => p.r > R * 0.9)
    },
    draw(px) {
      px.fill(0x02020a)
      stars(px, W, H, 9, t, 0.03)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const dx = x - cx
          const dy = (y - cy) * 3
          const d = Math.hypot(dx, dy)
          if (d > R * 1.3 && d < R * 3.2) {
            const a = Math.atan2(dy, dx)
            const band = Math.sin(a * 3 - t * 0.12 + d * 0.5)
            const heat = 1 - (d - R * 1.3) / (R * 1.9)
            px[y * W + x] = mix(px[y * W + x] as number, mix(0xff6a1a, 0xffe8a0, heat), 0.55 + band * 0.25)
          }
        }
      ring(px, W, H, cx, cy, R * 1.25, 0xffd090)
      disc(px, W, H, cx, cy, R, 0x000000)
      for (let x = Math.round(cx - R * 3.2); x <= cx + R * 3.2; x++) {
        const d = Math.abs(x - cx)
        if (d < R * 1.1) continue
        const heat = 1 - (d - R * 1.1) / (R * 2.1)
        dot(px, W, H, x, cy + 1, mix(0xff8a2a, 0xfff4c0, heat))
      }
      for (const p of ps) {
        const x = cx + Math.cos(p.a) * p.r
        const y = cy + Math.sin(p.a) * p.r * 0.5
        dot(px, W, H, x, y, p.c)
        if (p.r < R * 2.5) dot(px, W, H, x - Math.sin(p.a), y + Math.cos(p.a) * 0.5, scale(p.c, 0.5))
      }
    },
  }
}

// --- warp speed -------------------------------------------------------------------

const warp: Maker = (W, H, rng) => {
  type S = { a: number; d: number; c: number }
  let ss: S[] = Array.from({ length: 70 }, () => ({ a: rng() * 6.28, d: rng() * 30, c: pick(rng, [0xffffff, 0xb0d0ff, 0xffe0c0]) }))
  let t = 0
  const cx = W / 2
  const cy = H * 0.42

  return {
    step() {
      t++
      const v = 0.05 + Math.pow((Math.sin(t * 0.012 - 1.5) + 1) / 2, 2) * 1.6
      for (const s of ss) {
        s.d += v * (0.2 + s.d * 0.06)
        if (s.d > 40) {
          s.d = rng() * 2
          s.a = rng() * 6.28
        }
      }
    },
    draw(px) {
      px.fill(0x02020c)
      const v = 0.05 + Math.pow((Math.sin(t * 0.012 - 1.5) + 1) / 2, 2) * 1.6
      for (const s of ss) {
        const x = cx + Math.cos(s.a) * s.d
        const y = cy + Math.sin(s.a) * s.d * 1.3
        const len = v * s.d * 0.12
        line(px, W, H, x, y, x - Math.cos(s.a) * len, y - Math.sin(s.a) * len * 1.3, mix(s.c, 0x2a2a6a, Math.max(0, 1 - s.d / 12)))
      }
      if (v > 1.2) disc(px, W, H, cx, cy, (v - 1.2) * 3, 0xc8d8ff)
      rect(px, W, H, 0, H * 0.78, W, H * 0.22, 0x1a1e2a)
      line(px, W, H, 0, H * 0.78, W * 0.2, H * 0.72, 0x2a2e3a)
      line(px, W, H, W - 1, H * 0.78, W * 0.8, H * 0.72, 0x2a2e3a)
      line(px, W, H, W * 0.2, H * 0.72, W * 0.8, H * 0.72, 0x2a2e3a)
      for (let k = 0; k < 6; k++) dot(px, W, H, 3 + k * 5, H * 0.84, (t >> 3) % 6 === k ? 0xff4a4a : 0x4aff8a)
      rect(px, W, H, W / 2 - 3, H * 0.88, 6, 2, 0x3a4a6a)
    },
  }
}

// --- UFO abduction ----------------------------------------------------------------

const ufo: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.8)
  type Cow = { x: number; y: number; up: boolean; gone: boolean; a: number }
  let cows: Cow[] = []
  let ux = W / 2
  let target: Cow | undefined
  let count = 0
  let t = 0
  const uy = Math.round(H * 0.22)

  function herd() {
    cows = Array.from({ length: 4 }, () => ({ x: 3 + rng() * (W - 8), y: ground - 3, up: false, gone: false, a: 0 }))
  }
  herd()

  return {
    step() {
      t++
      if (!target || target.gone) target = cows.find(c => !c.gone)
      if (!target) {
        herd()
        return
      }
      const dx = target.x + 2 - ux
      if (Math.abs(dx) > 0.5) ux += Math.sign(dx) * 0.4
      else {
        target.up = true
        target.y -= 0.3
        target.a += 0.08
        if (target.y < uy + 2) {
          target.gone = true
          count++
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x050a1e, 0x1a2a4a, ground)
      stars(px, W, H, 3, t)
      disc(px, W, H, W * 0.8, 6, 2.5, 0xf0f0e0)
      rect(px, W, H, 0, ground, W, H - ground, 0x1a3a1a)
      for (let x = 0; x < W; x += 2) dot(px, W, H, x, ground, 0x2a5a2a)
      slab(px, W, H, 2, ground - 7, 7, 7, 0x7a301e)
      for (let k = 0; k < 4; k++) {
        rect(px, W, H, 1 + k, ground - 8 - k, 9 - k * 2, 1, 0x4a1a10)
        dot(px, W, H, 1 + k, ground - 8 - k, 0x6a2a1a)
      }
      dot(px, W, H, 5, ground - 4, 0xffe080)
      const beaming = target?.up
      if (beaming) {
        for (let y = uy + 2; y < ground; y++) {
          const hw = 1.5 + (y - uy) * 0.18
          for (let x = Math.round(ux - hw); x <= ux + hw; x++) {
            const k = y * W + x
            if (x >= 0 && x < W) px[k] = mix(px[k] as number, 0x8aff8a, 0.3)
          }
        }
      }
      for (const c of cows) {
        if (c.gone) continue
        const flip = c.up && Math.cos(c.a) < 0
        const rows = ['ww.kw', 'wkwww', 'w.w.w']
        sprite(px, W, H, c.x, c.y, flip ? rows.slice().reverse() : rows, { w: 0xf4f4f0, k: 0x1a1a1a })
        dot(px, W, H, c.x + 4, c.y + (flip ? 2 : 0), 0xffa0b0)
      }
      const wob = Math.sin(t * 0.1) * 0.6
      lit(px, W, H, ux, uy + wob, 6, 1.6, 0x9aa0b0, 0x3a3e4a)
      lit(px, W, H, ux, uy - 1.5 + wob, 3, 1.5, 0x8ad0ff)
      for (let k = 0; k < 4; k++) dot(px, W, H, ux - 4.5 + k * 3, uy + 1 + wob, (t >> 2) % 4 === k ? 0xffe040 : 0xff4a4a)
      text(px, W, H, W - 1 - 3 * String(count).length - (String(count).length - 1), 1, String(count), 0x8aff8a)
    },
  }
}

// --- planet formation -------------------------------------------------------------

const planetform: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  type D = { r: number; a: number; c: number }
  let dust: D[] = []
  let planet = { r: 0.6, a: 0, orbit: 0 }
  let t = 0

  function reset() {
    const R = Math.min(W / 2, H / 3)
    dust = Array.from({ length: 220 }, () => ({ r: 4 + rng() * R, a: rng() * 6.28, c: pick(rng, [0xa08a6a, 0xc8a878, 0x8a7a6a, 0xe0c090]) }))
    planet = { r: 0.6, a: 0, orbit: R * 0.6 }
    t = 0
  }
  reset()

  return {
    step() {
      t++
      for (const d of dust) d.a += 0.5 / Math.pow(d.r, 1.2)
      planet.a += 0.5 / Math.pow(planet.orbit, 1.2)
      const px0 = Math.cos(planet.a) * planet.orbit
      const py0 = Math.sin(planet.a) * planet.orbit
      dust = dust.filter(d => {
        const dx = Math.cos(d.a) * d.r - px0
        const dy = Math.sin(d.a) * d.r - py0
        if (Math.hypot(dx, dy) < planet.r + 2.2) {
          planet.r = Math.min(5, planet.r + 0.025)
          return false
        }
        if (Math.abs(d.r - planet.orbit) < planet.r + 3) d.r += (planet.orbit - d.r) * 0.01
        return true
      })
      if (dust.length < 30 || t > 1200) reset()
    },
    draw(px) {
      px.fill(0x04040c)
      stars(px, W, H, 21, t, 0.02)
      disc(px, W, H, cx, cy, 2.5, 0xffe080)
      ring(px, W, H, cx, cy, 3.2, 0xffa040)
      for (const d of dust) dot(px, W, H, cx + Math.cos(d.a) * d.r, cy + Math.sin(d.a) * d.r * 0.55, d.c)
      const x = cx + Math.cos(planet.a) * planet.orbit
      const y = cy + Math.sin(planet.a) * planet.orbit * 0.55
      lit(px, W, H, x, y, planet.r, planet.r, planet.r > 3 ? 0x5a8aaa : 0xa86a3a)
    },
  }
}

// --- mars rover -------------------------------------------------------------------

const rover: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.7)
  let scroll = 0
  let t = 0
  let dust: Spark[] = []
  const heli = { on: 0, x: 0, y: 0 }

  const surface = (x: number) => ground + Math.sin(x * 0.12) * 1.5 + Math.sin(x * 0.31) * 0.8 + (hash(Math.floor(x / 9), 1, 4) > 0.75 ? -1 : 0)

  return {
    step() {
      t++
      scroll += 0.25
      dust = sparks(dust, 0.02)
      if (rng() < 0.4) dust.push({ x: W * 0.3, y: ground, vx: -0.4 - rng() * 0.3, vy: -0.1 - rng() * 0.2, l: 14, c: 0xd08a5a })
      if (!heli.on && t % 500 === 250) heli.on = 160
      if (heli.on) heli.on--
    },
    draw(px) {
      sky(px, W, H, 0xd8a070, 0xf0c8a0)
      disc(px, W, H, W * 0.8, H * 0.15, 1.5, 0xf8f0e0)
      for (let x = 0; x < W; x++) {
        const far = H * 0.5 + Math.sin((x + scroll * 0.3) * 0.09) * 3
        rect(px, W, H, x, far, 1, ground - far, 0xb86a40)
      }
      for (let x = 0; x < W; x++) {
        const s = surface(x + scroll)
        rect(px, W, H, x, s, 1, H - s, 0xc87a4a)
        dot(px, W, H, x, s, 0xe0966a)
        if (hash(Math.floor(x + scroll), 2, 5) > 0.9) dot(px, W, H, x, s + 3, 0x9a5a34)
      }
      for (const d of dust) dot(px, W, H, d.x, d.y, d.c)
      const rx = W * 0.32
      const ry = surface(rx + 4 + scroll) - 5
      slab(px, W, H, rx, ry, 9, 3, 0xd8d8d8)
      rect(px, W, H, rx - 1, ry - 1, 11, 1, 0x3a4a8a)
      rect(px, W, H, rx - 1, ry - 1, 4, 1, 0x6a7ac0)
      rect(px, W, H, rx + 7, ry - 4, 1, 3, 0xa0a0a0)
      rect(px, W, H, rx + 6, ry - 5, 3, 1, 0xd8d8d8)
      for (let k = 0; k < 3; k++) {
        const wx = rx + 1 + k * 3.5
        lit(px, W, H, wx, surface(wx + scroll) - 1.2, 1.3, 1.3, 0x4a4a4a)
      }
      if (heli.on) {
        const u = 1 - heli.on / 160
        const hx = rx + 4 + u * W * 0.5
        const hy = ground - 4 - Math.sin(u * Math.PI) * H * 0.3
        rect(px, W, H, hx - 1, hy, 2, 2, 0xc8c8c8)
        line(px, W, H, hx - 3, hy - 1, hx + 3, hy - 1, t % 2 ? 0x8a8a8a : 0x5a5a5a)
      }
    },
  }
}

// --- docking ----------------------------------------------------------------------

const docking: Maker = (W, H, rng) => {
  const port = { x: W / 2, y: H * 0.3 }
  let cap = { x: 0, y: 0, vx: 0, vy: 0 }
  let puffs: Spark[] = []
  let docked = 0
  let t = 0

  function reset() {
    cap = { x: W / 2 + (rng() - 0.5) * W * 0.5, y: H * 0.85, vx: 0, vy: 0 }
    docked = 0
    t = 0
  }
  reset()

  return {
    step() {
      t++
      puffs = sparks(puffs, 0)
      if (docked) {
        if (++docked > 100) reset()
        return
      }
      const tx = port.x
      const ty = port.y + 5
      const ax = clamp((tx - cap.x) * 0.002 - cap.vx * 0.05, -0.01, 0.01)
      const ay = clamp((ty - cap.y) * 0.0015 - cap.vy * 0.05, -0.01, 0.01)
      if (Math.abs(ax) > 0.004) puffs.push({ x: cap.x + (ax > 0 ? -2 : 2), y: cap.y, vx: -Math.sign(ax) * 0.4, vy: 0, l: 6, c: 0xffffff })
      if (Math.abs(ay) > 0.004) puffs.push({ x: cap.x, y: cap.y + (ay > 0 ? -3 : 3), vx: 0, vy: -Math.sign(ay) * 0.4, l: 6, c: 0xffffff })
      cap.vx += ax
      cap.vy += ay
      cap.x += cap.vx
      cap.y += cap.vy
      if (Math.abs(cap.x - tx) < 0.4 && Math.abs(cap.y - ty) < 0.5) {
        cap.x = tx
        cap.y = ty
        docked = 1
      }
    },
    draw(px) {
      px.fill(0x02020a)
      stars(px, W, H, 33, t, 0.03)
      for (let y = Math.round(H * 0.82); y < H; y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x - W / 2, y - H * 1.8)
          if (d < H) px[y * W + x] = d > H - 1.5 ? 0x8ac8ff : mix(0x2a6ab0, 0x3a9a5a, hash(x >> 2, y >> 2, 2) > 0.6 ? 0.6 : 0)
        }
      slab(px, W, H, 0, port.y - 4, W, 3, 0xc8c8d0)
      rect(px, W, H, 2, port.y - 10, W * 0.3, 14, 0x2a3a8a)
      rect(px, W, H, W * 0.68, port.y - 10, W * 0.3, 14, 0x2a3a8a)
      for (let x = 3; x < W * 0.3; x += 3) rect(px, W, H, x, port.y - 10, 1, 14, 0x4a5aaa)
      for (let x = W * 0.69; x < W - 2; x += 3) rect(px, W, H, x, port.y - 10, 1, 14, 0x4a5aaa)
      slab(px, W, H, port.x - 3, port.y - 6, 7, 7, 0xe0e0e8, 0x5a5a66)
      rect(px, W, H, port.x - 1, port.y + 1, 3, 1, docked && docked % 10 < 5 ? 0x6aff6a : 0xffd040)
      lit(px, W, H, cap.x, cap.y + 2, 2.5, 3.5, 0xf0f0f4)
      rect(px, W, H, cap.x - 1, cap.y - 2, 3, 1, 0x8a8a92)
      dot(px, W, H, cap.x, cap.y + 1, 0x2a2a3a)
      for (const p of puffs) dot(px, W, H, p.x, p.y, p.c)
    },
  }
}

// --- meteor shower ----------------------------------------------------------------

const meteors: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.8)
  let ms: { x: number; y: number; vx: number; vy: number; l: number }[] = []
  let wishes = 0
  let t = 0

  return {
    step() {
      t++
      if (rng() < 0.04) {
        ms.push({ x: rng() * W * 1.2, y: rng() * H * 0.3, vx: -1.2 - rng(), vy: 0.6 + rng() * 0.5, l: 14 + irand(rng, 10) })
        wishes++
      }
      for (const m of ms) {
        m.x += m.vx
        m.y += m.vy
        m.l--
      }
      ms = ms.filter(m => m.l > 0)
    },
    draw(px) {
      sky(px, W, H, 0x02041a, 0x1a1a4a, ground)
      stars(px, W, H, 41, t, 0.06)
      for (let y = 0; y < ground; y++) for (let x = 0; x < W; x++) if (Math.abs(x - y * 0.6 - W * 0.1) < 3 && hash(x, y, 8) > 0.6) px[y * W + x] = mix(px[y * W + x] as number, 0x8a7ab0, 0.3)
      for (const m of ms) for (let k = 0; k < 6; k++) dot(px, W, H, m.x - m.vx * k * 0.8, m.y - m.vy * k * 0.8, mix(0xffffff, 0x3a3a8a, k / 6))
      for (let x = 0; x < W; x++) {
        const h = 4 + Math.abs(Math.sin(x * 0.2)) * 6
        rect(px, W, H, x, ground - h, 1, h + H, 0x05050c)
      }
      sprite(px, W, H, W * 0.6, ground - 5, ['..x..', '.xxd.', 'xxxdd'], { x: 0xd87a2a, d: 0x8a4a1a })
      dot(px, W, H, W * 0.6 + 2, ground - 3, 0xffd060)
      sprite(px, W, H, W * 0.3, ground - 2, ['.s', 'bb'], { s: 0xffd0a0, b: 0x3a5aaa })
      text(px, W, H, 1, 1, String(wishes), 0xffe080)
    },
  }
}

// --- rapid unscheduled disassembly ------------------------------------------------

const rud: Maker = (W, H, rng) => {
  const pad = H - 6
  const cx = W / 2
  let t = 0
  let bits: Spark[] = []
  let fire: { x: number; y: number; r: number }[] = []
  let wob = 0

  return {
    step() {
      t++
      bits = sparks(bits, 0.06)
      for (const f of fire) f.r += 0.15
      fire = fire.filter(f => f.r < 8)
      if (t === 160) {
        const y = rY(t)
        burst(bits, rng, cx + wob, y - 8, 0xf0f0f4, 24, 1.5)
        burst(bits, rng, cx + wob, y - 8, 0xffa020, 20, 1)
        for (let k = 0; k < 5; k++) fire.push({ x: cx + wob + (rng() - 0.5) * 6, y: y - 8 + (rng() - 0.5) * 6, r: 1 })
      }
      if (t > 300) t = 0
      wob = t > 90 && t < 160 ? Math.sin(t * 0.4) * (t - 90) * 0.04 : 0
    },
    draw(px) {
      sky(px, W, H, 0x5a9ae0, 0xd0e8f8)
      rect(px, W, H, 0, pad, W, H - pad, 0x8a7a5a)
      rect(px, W, H, cx - 5, pad - 1, 10, 1, 0x6a6a72)
      if (t < 160) {
        const y = rY(t)
        rect(px, W, H, cx - 1 + wob, y - 16, 3, 16, 0xd8d8e0)
        rect(px, W, H, cx + 1 + wob, y - 16, 1, 16, 0xa8a8b4)
        rect(px, W, H, cx + wob, y - 18, 1, 2, 0xd8d8e0)
        rect(px, W, H, cx - 1 + wob, y - 10, 3, 1, 0x2a2a30)
        if (t > 40) for (let k = 0; k < 3; k++) dot(px, W, H, cx + wob + (k - 1), y + 1 + ((t + k) % 3), k === 1 ? 0xffe080 : 0xff8020)
        if (t > 110 && t % 6 < 3) dot(px, W, H, cx + 2 + wob, y - 6, 0xff4020)
      }
      for (const f of fire) {
        if (f.r < 5) disc(px, W, H, f.x, f.y, f.r, f.r < 3 ? 0xffe060 : 0xff7a20)
        else {
          disc(px, W, H, f.x + 0.4, f.y + 0.4, f.r, 0x44444c)
          disc(px, W, H, f.x - f.r * 0.2, f.y - f.r * 0.25, f.r * 0.7, 0x6a6a74)
        }
      }
      for (const b of bits) dot(px, W, H, b.x, b.y, b.c)
      if (t > 170 && t < 260) for (let i = 0; i < 4; i++) sprite(px, W, H, 2 + i * 4, pad + 1, ['.s.', 'bbb'], { s: 0xffd0a0, b: hsv(i * 0.2, 0.6, 0.9) })
    },
  }
  function rY(t: number) {
    const u = span(t, 40, 160)
    return pad - 1 - u * u * H * 0.55
  }
}

// --- kessler cascade --------------------------------------------------------------

const kessler: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.55
  const ER = Math.min(W, H) * 0.22
  type Sat = { r: number; a: number; w: number; tilt: number; alive: boolean; debris: boolean }
  let sats: Sat[] = []
  let flash: Spark[] = []
  let t = 0

  function reset() {
    sats = Array.from({ length: 14 }, () => ({ r: ER + 3 + rng() * (W / 2 - ER - 2), a: rng() * 6.28, w: (0.02 + rng() * 0.02) * (rng() < 0.5 ? 1 : -1), tilt: 0.3 + rng() * 0.7, alive: true, debris: false }))
    t = 0
  }
  reset()
  const pos = (s: Sat): [number, number] => [cx + Math.cos(s.a) * s.r, cy + Math.sin(s.a) * s.r * s.tilt]

  return {
    step() {
      t++
      flash = sparks(flash, 0)
      for (const s of sats) s.a += s.w * (ER / s.r) * 1.5
      if (t === 120) {
        const s = sats[0] as Sat
        s.alive = false
        const [x, y] = pos(s)
        for (let k = 0; k < 6; k++) sats.push({ r: s.r + (rng() - 0.5) * 3, a: s.a + (rng() - 0.5) * 0.3, w: s.w * (0.8 + rng() * 0.6), tilt: s.tilt + (rng() - 0.5) * 0.3, alive: true, debris: true })
        burst(flash, rng, x, y, 0xffffff, 8, 0.6)
      }
      for (const s of sats) {
        if (!s.alive || s.debris) continue
        const [x, y] = pos(s)
        const hit = sats.find(d => d.alive && d.debris && Math.hypot(pos(d)[0] - x, pos(d)[1] - y) < 1.5)
        if (hit) {
          s.alive = false
          for (let k = 0; k < 5; k++) sats.push({ r: s.r + (rng() - 0.5) * 4, a: s.a + (rng() - 0.5) * 0.4, w: s.w * (0.6 + rng() * 0.8), tilt: s.tilt + (rng() - 0.5) * 0.4, alive: true, debris: true })
          burst(flash, rng, x, y, 0xffe080, 8, 0.6)
        }
      }
      sats = sats.filter(s => s.alive)
      if (sats.length > 260) sats = sats.slice(-260)
      if (t > 900) reset()
    },
    draw(px) {
      px.fill(0x02020a)
      stars(px, W, H, 51, t, 0.03)
      const behind = (s: Sat) => Math.sin(s.a) < 0
      for (const s of sats) if (behind(s)) {
        const [x, y] = pos(s)
        dot(px, W, H, x, y, s.debris ? 0x8a8a8a : 0xffd040)
      }
      for (let y = Math.floor(cy - ER); y <= cy + ER; y++)
        for (let x = Math.floor(cx - ER); x <= cx + ER; x++) {
          const d = Math.hypot(x - cx, y - cy)
          if (d > ER) continue
          const land = hash((x + Math.floor(t * 0.1)) >> 1, y >> 1, 6) > 0.55
          const c = land ? 0x3a9a4a : 0x2a6ac0
          dot(px, W, H, x, y, d > ER - 1 ? 0x8ac8ff : mix(c, 0x02020a, Math.max(0, (x - cx) / ER) * 0.6))
        }
      for (const s of sats) if (!behind(s)) {
        const [x, y] = pos(s)
        if (s.debris) dot(px, W, H, x, y, 0xb0b0b0)
        else {
          dot(px, W, H, x, y, 0xffd040)
          dot(px, W, H, x - 1, y, 0x3a6aff)
          dot(px, W, H, x + 1, y, 0x3a6aff)
        }
      }
      for (const f of flash) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, String(sats.filter(s => s.debris).length), 0xd0d0d0)
    },
  }
}

// --- terraforming -----------------------------------------------------------------

const terraform: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const R = Math.min(W / 2 - 1, H * 0.3)
  const seed = irand(rng, 1000)
  let t = 0
  const height = (lon: number, lat: number) =>
    Math.sin(lon * 3 + seed) * 0.5 + Math.sin(lon * 7 + lat * 4 + seed * 2) * 0.3 + Math.cos(lat * 5 + lon * 2) * 0.3 + Math.sin(lon * 13 - lat * 9) * 0.12

  return {
    step() {
      t++
      if (t > 900) t = 0
    },
    draw(px) {
      px.fill(0x02020a)
      stars(px, W, H, 61, t, 0.03)
      const sea = -1.2 + span(t, 100, 400) * 1.2
      const green = span(t, 350, 650)
      const clouds = span(t, 250, 500)
      const rotA = t * 0.02
      for (let y = Math.floor(cy - R); y <= cy + R; y++)
        for (let x = Math.floor(cx - R); x <= cx + R; x++) {
          const dx = (x - cx) / R
          const dy = (y - cy) / R
          const r2 = dx * dx + dy * dy
          if (r2 > 1) continue
          const lat = Math.asin(dy)
          const lon = Math.asin(clamp(dx / Math.max(0.01, Math.cos(lat)), -1, 1)) + rotA
          const h = height(lon, lat)
          let c: number
          if (h < sea) c = mix(0x1a5ab0, 0x2a8ae0, clamp((h - sea + 0.6) / 0.6, 0, 1))
          else {
            const red = mix(0xc8603a, 0x8a3a20, clamp(h, 0, 1))
            c = h - sea < 0.15 && green > 0 ? mix(red, 0xd8c890, green) : mix(red, 0x3a9a3a, green * clamp(1 - Math.abs(lat), 0, 1))
            if (Math.abs(lat) > 1.2) c = 0xf0f4f8
          }
          if (clouds > 0 && Math.sin(lon * 5 + lat * 3 - t * 0.03) + Math.sin(lon * 11 - t * 0.05) > 2 - clouds * 1.2) c = mix(c, 0xffffff, 0.75)
          const shade = clamp(0.35 + (-dx * 0.6 - dy * 0.3 + Math.sqrt(1 - r2)) * 0.6, 0.15, 1)
          dot(px, W, H, x, y, scale(c, shade))
        }
      if (green > 0.5) ring(px, W, H, cx, cy, R + 0.8, 0x4a8ad0)
      text(px, W, H, 1, 1, `${Math.round(green * 100)}%`, 0x8aff8a)
    },
  }
}

// --- wormhole ---------------------------------------------------------------------

const wormhole: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  let t = 0
  const hue = rng()

  return {
    step() {
      t++
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const dx = x - cx + Math.sin(t * 0.02) * 3
          const dy = (y - cy) * 0.6 + Math.cos(t * 0.017) * 2
          const d = Math.hypot(dx, dy) + 0.5
          const depth = 30 / d + t * 0.25
          const a = Math.atan2(dy, dx) / Math.PI + depth * 0.05
          const band = (Math.floor(depth) + Math.floor(a * 6)) % 2
          const fade = clamp(d / 12, 0, 1)
          let c = hsv(hue + depth * 0.02, 0.7, band ? 0.9 : 0.45)
          c = mix(0xffffff, c, fade)
          px[y * W + x] = c
        }
      disc(px, W, H, cx - Math.sin(t * 0.02) * 3, cy - Math.cos(t * 0.017) * 2 / 0.6, 1.5, 0xffffff)
    },
  }
}

// --- three-body problem -----------------------------------------------------------

const threebody: Maker = (W, H, rng) => {
  type B = { x: number; y: number; vx: number; vy: number; c: number; tr: [number, number][] }
  let bs: B[] = []
  let t = 0

  function reset() {
    const cols = [0xffd040, 0xff6a3a, 0x6ab0ff]
    bs = cols.map((c, i) => {
      const a = (i / 3) * 6.28 + rng() * 0.4
      const r = 1 + rng() * 0.3
      return { x: Math.cos(a) * r, y: Math.sin(a) * r, vx: -Math.sin(a) * 0.45 * (0.8 + rng() * 0.4), vy: Math.cos(a) * 0.45 * (0.8 + rng() * 0.4), c, tr: [] }
    })
    const mx = bs.reduce((s, b) => s + b.vx, 0) / 3
    const my = bs.reduce((s, b) => s + b.vy, 0) / 3
    for (const b of bs) {
      b.vx -= mx
      b.vy -= my
    }
    t = 0
  }
  reset()

  return {
    step() {
      t++
      for (let s = 0; s < 8; s++) {
        const dt = 0.004
        for (const a of bs) {
          let ax = 0
          let ay = 0
          for (const b of bs) {
            if (a === b) continue
            const dx = b.x - a.x
            const dy = b.y - a.y
            const d2 = dx * dx + dy * dy + 0.01
            const f = 1 / (d2 * Math.sqrt(d2))
            ax += dx * f
            ay += dy * f
          }
          a.vx += ax * dt
          a.vy += ay * dt
        }
        for (const a of bs) {
          a.x += a.vx * dt
          a.y += a.vy * dt
        }
      }
      for (const b of bs) {
        b.tr.push([b.x, b.y])
        if (b.tr.length > 60) b.tr.shift()
      }
      const far = bs.some(b => Math.hypot(b.x, b.y) > 4)
      if (far || t > 1500) reset()
    },
    draw(px) {
      px.fill(0x03030c)
      stars(px, W, H, 71, t, 0.03)
      const k = Math.min(W, H) / 4.2
      const cx = W / 2
      const cy = H / 2
      for (const b of bs)
        b.tr.forEach(([x, y], i) => dot(px, W, H, cx + x * k, cy + y * k, mix(0x03030c, b.c, (i / b.tr.length) * 0.7)))
      for (const b of bs) {
        disc(px, W, H, cx + b.x * k, cy + b.y * k, 1.6, b.c)
        dot(px, W, H, cx + b.x * k - 0.5, cy + b.y * k - 0.5, 0xffffff)
      }
    },
  }
}

export const SPACE = {
  rocket,
  solarsystem,
  blackhole,
  warp,
  ufo,
  planetform,
  rover,
  docking,
  meteors,
  rud,
  kessler,
  terraform,
  wormhole,
  threebody,
}
