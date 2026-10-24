import { add, disc, dot, hsv, mix, rect, scale, sky, sprite } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, ellipse, hash, irand, line, lit, litSprite, pick, slab, sparks, tones } from '../kit'
import type { Spark } from '../kit'

// Nature & weather: an event, not just a mood.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

// --- thunderstorm -----------------------------------------------------------------

const thunderstorm: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.82)
  let drops = Array.from({ length: 50 }, () => ({ x: rng() * W, y: rng() * H }))
  let bolt: [number, number][][] = []
  let flash = 0
  let t = 0
  let splashes: Spark[] = []
  const hills = Array.from({ length: W }, (_, x) => ground - 3 - Math.sin(x * 0.2) * 2 - Math.sin(x * 0.07 + 1) * 3)

  function strike() {
    bolt = []
    const grow = (x: number, y: number, depth: number) => {
      const seg: [number, number][] = [[x, y]]
      while (y < hills[clamp(Math.round(x), 0, W - 1)]! && seg.length < 60) {
        x += (rng() - 0.5) * 3
        y += 1 + rng() * 2
        seg.push([x, y])
        if (depth < 2 && rng() < 0.08) grow(x, y, depth + 1)
        if (depth > 0 && rng() < 0.15) break
      }
      bolt.push(seg)
    }
    grow(W * (0.2 + rng() * 0.6), 6, 0)
    flash = 10
  }

  return {
    step() {
      t++
      splashes = sparks(splashes, 0.08)
      for (const d of drops) {
        d.y += 2.2
        d.x -= 0.6
        if (d.y > ground) {
          if (rng() < 0.2) splashes.push({ x: d.x, y: ground, vx: (rng() - 0.5) * 0.5, vy: -0.5, l: 5, c: 0x8ab0d0 })
          d.y = -2
          d.x = rng() * (W + 10)
        }
      }
      if (flash > 0) flash--
      else if (rng() < 0.012) strike()
      if (flash === 0) bolt = []
    },
    draw(px) {
      const lit = flash > 6 ? 0.6 : flash > 0 ? 0.25 : 0
      for (let y = 0; y < H; y++) {
        const c = y < ground ? mix(0x1a1e2a, 0x3a4250, y / ground) : 0x1a1a1e
        for (let x = 0; x < W; x++) px[y * W + x] = mix(c, 0xd8e0ff, lit)
      }
      for (let x = 0; x < W; x++) {
        const c1 = 6 + Math.sin(x * 0.3 + t * 0.02) * 2 + Math.sin(x * 0.11 - t * 0.01) * 3
        rect(px, W, H, x, 0, 1, c1, mix(0x2a2e38, 0xa0a8c0, lit))
        rect(px, W, H, x, c1, 1, 1, mix(0x3a3e48, 0xffffff, lit))
      }
      for (let x = 0; x < W; x++) rect(px, W, H, x, hills[x]!, 1, H - hills[x]!, mix(0x10141a, 0x5a6070, lit))
      for (const seg of bolt)
        for (let i = 1; i < seg.length; i++) {
          const [ax, ay] = seg[i - 1] as [number, number]
          const [bx, by] = seg[i] as [number, number]
          line(px, W, H, ax, ay, bx, by, flash > 4 ? 0xffffff : 0xb8c8ff)
        }
      for (const d of drops) line(px, W, H, d.x, d.y, d.x + 0.6, d.y - 2, 0x6a7a9a)
      for (const s of splashes) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- tornado ----------------------------------------------------------------------

const tornado: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.78)
  let x = W * 0.3
  let vx = 0.15
  let t = 0
  let debris = Array.from({ length: 24 }, () => ({ a: rng() * 6.28, h: rng(), r: rng(), c: pick(rng, [0x6a4a2a, 0x8a8a8a, 0xc8a060, 0x3a3a3a]) }))
  const fence = Array.from({ length: Math.ceil(W / 3) }, (_, i) => ({ x: i * 3, up: true }))

  return {
    step() {
      t++
      x += vx + Math.sin(t * 0.02) * 0.1
      // it veers off just short of the house: a near miss, since a direct hit would leave nothing standing
      if (x < W * 0.2 || x > W * 0.62) vx = -vx
      for (const d of debris) {
        d.a += 0.15 + (1 - d.h) * 0.1
        d.h += 0.006
        if (d.h > 1) {
          d.h = 0
          d.r = rng()
        }
      }
      for (const f of fence) if (f.up && Math.abs(f.x - x) < 3 && rng() < 0.2) f.up = false
      if (t % 600 === 0) for (const f of fence) f.up = true
    },
    draw(px) {
      sky(px, W, H, 0x3a4a3a, 0x8a9a7a, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x6a8a3a)
      for (let xx = 0; xx < W; xx++) if ((xx * 7) % 5 === 0) dot(px, W, H, xx, ground + 2, 0x5a7a2a)
      for (const f of fence) if (f.up) {
        rect(px, W, H, f.x, ground - 3, 1, 3, 0x8a6a4a)
        dot(px, W, H, f.x + 1, ground - 2, 0x8a6a4a)
      }
      slab(px, W, H, W * 0.75, ground - 6, 6, 6, 0xa83a2a)
      rect(px, W, H, W * 0.75 + 2, ground - 4, 2, 2, 0xffd88a)
      for (let k = 0; k < 4; k++) {
        rect(px, W, H, W * 0.75 - 1 + k, ground - 7 - k, 8 - k * 2, 1, 0x6a2a1a)
        dot(px, W, H, W * 0.75 - 1 + k, ground - 7 - k, 0x9a4a32)
      }
      const top = 4
      for (let y = top; y < ground; y++) {
        const u = (ground - y) / (ground - top)
        const cx = x + Math.sin(y * 0.15 - t * 0.05) * u * 3 + u * u * 4
        const hw = 0.8 + u * u * W * 0.3
        for (let k = -hw; k <= hw; k++) {
          const band = Math.sin((k / hw) * 3 + y * 0.6 - t * 0.4) > 0.3
          const c = band ? 0x8a8a84 : 0x6a6a66
          dot(px, W, H, cx + k, y, k < -hw * 0.5 ? mix(c, 0xd8d8d0, 0.2) : k > hw * 0.4 ? scale(c, 0.75) : c)
        }
      }
      for (let y = 0; y < top + 3; y++) rect(px, W, H, 0, y, W, 1, mix(0x2a2e2a, 0x4a4e46, y / (top + 3)))
      for (const d of debris) {
        const y = ground - d.h * (ground - top) * 0.8
        const u = (ground - y) / (ground - top)
        const rr = (1 + u * u * W * 0.3) * (0.8 + d.r * 0.5)
        const cx = x + Math.sin(y * 0.15 - t * 0.05) * u * 3 + u * u * 4
        if (Math.sin(d.a) > -0.2) dot(px, W, H, cx + Math.cos(d.a) * rr, y, d.c)
      }
      for (let k = 0; k < 8; k++) dot(px, W, H, x + Math.cos(t * 0.3 + k) * (3 + k * 0.4), ground - 1 - (k % 3), 0xa89a7a)
    },
  }
}

// --- waves and surfer -------------------------------------------------------------

const surfer: Maker = (W, H, rng) => {
  const sea = Math.round(H * 0.45)
  let t = 0
  let sx = W * 0.5
  let wipe = 0
  let spray: Spark[] = []

  const crest = (x: number) => {
    const p = ((x / W) * 1.2 + t * 0.006) % 1
    return sea - Math.max(0, Math.sin(p * Math.PI)) * H * 0.25
  }

  return {
    step() {
      t++
      spray = sparks(spray, 0.1)
      if (wipe > 0) {
        if (--wipe === 0) sx = W * 0.5
        return
      }
      sx = W * 0.5 + Math.sin(t * 0.04) * W * 0.25
      if (rng() < 0.4) spray.push({ x: sx + 2, y: crest(sx) + 3, vx: 0.4 + rng() * 0.5, vy: -0.5 - rng() * 0.6, l: 10, c: 0xffffff })
      if (rng() < 0.002) {
        wipe = 60
        burst(spray, rng, sx, crest(sx) + 3, 0xffffff, 16, 1.2)
      }
    },
    draw(px) {
      sky(px, W, H, 0xffb06a, 0xffe0a0, sea)
      disc(px, W, H, W * 0.8, sea - H * 0.25, 6, 0xffd890)
      disc(px, W, H, W * 0.8, sea - H * 0.25, 4, 0xfff4c0)
      for (let x = 0; x < W; x++) {
        const c = crest(x)
        for (let y = Math.floor(c); y < H; y++) {
          const d = y - c
          let col = mix(0x2a8ac0, 0x0a3a6a, clamp((y - sea + 10) / (H - sea + 10), 0, 1))
          if (d < 1.5) col = 0xffffff
          else if (d < 4) col = 0x8ad0f0
          if ((x * 3 + y * 7 + (t >> 1)) % 23 === 0) col = mix(col, 0xffffff, 0.4)
          dot(px, W, H, x, y, col)
        }
      }
      for (const s of spray) dot(px, W, H, s.x, s.y, s.c)
      if (!wipe) {
        const y = crest(sx) + 4
        line(px, W, H, sx - 3, y + 1, sx + 3, y, 0xffe040)
        sprite(px, W, H, sx - 1, y - 6, ['.s.', 'rrr', '.r.', 'b.b', 'b.b'], { s: 0xffc890, r: 0xe03a3a, b: 0x2a3a6a })
      } else if (wipe > 30) sprite(px, W, H, sx - 1, crest(sx) + 8, ['s.b', 'rrb'], { s: 0xffc890, r: 0xe03a3a, b: 0x2a3a6a })
    },
  }
}

// --- volcano ----------------------------------------------------------------------

const volcano: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.85)
  const peak = Math.round(H * 0.45)
  const cx = W / 2
  const slope = (x: number) => peak + Math.abs(x - cx) * 1.6 + Math.max(0, 2 - Math.abs(x - cx)) * 1.5
  let lava: { x: number; y: number; vx: number; vy: number; l: number; flow: boolean }[] = []
  let smoke: { x: number; y: number; r: number }[] = []
  let flowed = new Float32Array(W)
  let t = 0

  return {
    step() {
      t++
      const erupt = t > 120 && t < 320
      if (erupt)
        for (let k = 0; k < 3; k++) lava.push({ x: cx + (rng() - 0.5) * 2, y: peak, vx: (rng() - 0.5) * 1.2, vy: -1.2 - rng() * 1.6, l: 200, flow: false })
      if (t % 4 === 0) smoke.push({ x: cx + (rng() - 0.5) * 2, y: peak - 2, r: erupt ? 2 : 1 })
      for (const s of smoke) {
        s.y -= erupt ? 0.5 : 0.25
        s.x += 0.15
        s.r += erupt ? 0.06 : 0.02
      }
      smoke = smoke.filter(s => s.y > -6)
      for (const p of lava) {
        p.l--
        if (p.flow) {
          p.x += p.vx
          p.y = slope(p.x) - 1
          const k = Math.round(clamp(p.x, 0, W - 1))
          flowed[k] = Math.min(1, flowed[k]! + 0.01)
          if (p.y > ground - 1) p.l = 0
          continue
        }
        p.vy += 0.06
        p.x += p.vx
        p.y += p.vy
        if (p.vy > 0 && p.y >= slope(p.x) - 1) {
          p.flow = true
          p.vx = (p.x < cx ? -1 : 1) * (0.2 + rng() * 0.2)
        }
      }
      lava = lava.filter(p => p.l > 0)
      for (let i = 0; i < W; i++) flowed[i] = Math.max(0, flowed[i]! - (erupt ? 0 : 0.002))
      if (t > 480) {
        t = 0
        flowed = new Float32Array(W)
      }
    },
    draw(px) {
      // the sky reddens with the eruption; stars fade out
      const g = span(t, 100, 140) * (1 - span(t, 330, 400))
      sky(px, W, H, mix(0x14102a, 0x3a0e10, g), mix(0x3a2a4a, 0xa8381a, g))
      for (let k = 0; k < 12; k++) {
        const x = Math.floor(hash(k, 1, 7) * W)
        const y = Math.floor(hash(k, 2, 7) * peak * 0.9)
        px[y * W + x] = mix(px[y * W + x] as number, 0xe8e0ff, 0.8 * (1 - g))
      }
      // a far range, then the cone: lit left flank, shaded right, rock strata
      for (let x = 0; x < W; x++) {
        const ridge = Math.round(peak + H * 0.14 + Math.sin(x * 0.35) * 2 + Math.sin(x * 0.13 + 1) * 3)
        rect(px, W, H, x, ridge, 1, ground - ridge, mix(0x2a2238, 0x4a1c1c, g))
      }
      const shake = t > 90 && t < 130 ? Math.sin(t * 2) * 0.7 : 0
      for (let x = 0; x < W; x++) {
        const y0 = slope(x - shake)
        const side = x - shake - cx
        const lava = flowed[x]!
        for (let y = Math.max(0, Math.floor(y0)); y < H; y++) {
          const depth = y - y0
          let c: number
          if (y >= ground) c = mix(0x2a2024, 0x6a2010, g * 0.5 * (1 - (y - ground) / (H - ground)))
          else {
            c = side < -1 ? 0x5e4a4c : side > 1 ? 0x3a2a30 : 0x4a3a3e
            if ((Math.floor((y + hash(Math.floor(x / 3), 0, 3) * 3) / 4) % 3) === 0) c = scale(c, 0.82)
            c = mix(c, 0x1e1618, Math.min(1, depth / 26))
            if (depth < 1 && side < 0) c = 0x8a6a66
            if (lava > 0.1 && depth < 4) {
              const heat = Math.min(1, lava * 1.5)
              c = depth < 1 ? mix(c, 0xffe060, heat) : depth < 2.2 ? mix(c, 0xff6a1a, heat) : mix(c, 0x8a2a14, heat * 0.6)
            }
          }
          dot(px, W, H, x, y, c)
        }
      }
      // the crater: dark at rest, glowing while it erupts
      if (t > 110 && t < 330) {
        disc(px, W, H, cx, peak, 2, 0xff8a1a)
        disc(px, W, H, cx, peak - 0.5, 1, 0xfff0a0)
      } else rect(px, W, H, cx - 2, Math.round(slope(cx)), 4, 1, 0x1a1214)
      // smoke puffs: a dark body, a lit cap, an orange underside while it erupts
      for (const s of smoke) {
        disc(px, W, H, s.x + 0.4, s.y + 0.4, s.r, mix(0x3a3038, 0x8a3a20, g * 0.6))
        disc(px, W, H, s.x - s.r * 0.25, s.y - s.r * 0.25, s.r * 0.7, 0x6a5e66)
        if (s.r > 1.5) dot(px, W, H, s.x - s.r * 0.4, s.y - s.r * 0.5, 0x8a7e86)
      }
      // lava bombs with a cooling trail
      for (const p of lava) {
        if (!p.flow) dot(px, W, H, p.x - p.vx, p.y - p.vy, 0xa02a10)
        dot(px, W, H, p.x, p.y, p.l % 6 < 3 ? 0xffe060 : 0xff5a1a)
      }
    },
  }
}

// --- waterfall --------------------------------------------------------------------

const waterfall: Maker = (W, H, rng) => {
  const lip = Math.round(H * 0.2)
  const pool = Math.round(H * 0.72)
  const x0 = Math.round(W * 0.32)
  const x1 = Math.round(W * 0.68)
  let t = 0
  const mist = Array.from({ length: 24 }, () => ({ x: x0 + rng() * (x1 - x0), y: pool - rng() * 6, vy: -rng() * 0.3 }))

  return {
    step() {
      t++
      for (const m of mist) {
        m.y += m.vy
        m.x += (rng() - 0.5) * 0.4
        if (m.y < pool - 10) {
          m.y = pool
          m.x = x0 + rng() * (x1 - x0)
          m.vy = -0.1 - rng() * 0.3
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ac8f0, 0xd8f0ff, lip)
      for (let y = 0; y < pool; y++) {
        rect(px, W, H, 0, Math.max(y, lip - 6), x0, 1, (y + Math.floor(y / 5)) % 7 === 0 ? 0x5a5a4a : 0x6a6a58)
        rect(px, W, H, x1, Math.max(y, lip - 6), W - x1, 1, (y + Math.floor(y / 4)) % 6 === 0 ? 0x5a5a4a : 0x6a6a58)
      }
      rect(px, W, H, x0 - 2, lip - 6, 2, pool - lip + 6, 0x8a8a72)
      rect(px, W, H, x1, lip - 6, 2, pool - lip + 6, 0x4a4a3c)
      rect(px, W, H, 0, lip - 6, 2, pool - lip + 6, 0x4e4e40)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, lip - 7, 0x3a8a3a)
      for (let x = 0; x < x0; x += 4) lit(px, W, H, x + 2, lip - 7, 2, 2, 0x3a8a3a)
      for (let x = x1; x < W; x += 4) lit(px, W, H, x + 2, lip - 7, 2, 2, 0x3a8a3a)
      for (let y = lip; y < pool; y++)
        for (let x = x0; x < x1; x++) {
          const s = (x * 7 + Math.floor(y - t * 1.5) * 3) % 11
          dot(px, W, H, x, y, s < 2 ? 0xffffff : s < 5 ? 0xa8d8f8 : 0x5ab0e8)
        }
      rect(px, W, H, x0 - 1, lip, x1 - x0 + 2, 1, 0xffffff)
      for (let y = pool; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 2 + (t >> 2)) % 9 === 0 ? 0x8ad0f0 : mix(0x3a90c8, 0x1a5a8a, (y - pool) / (H - pool))
      for (let x = x0 - 1; x <= x1; x++) dot(px, W, H, x, pool + ((x + (t >> 1)) % 3 === 0 ? 1 : 0), 0xffffff)
      for (const m of mist) dot(px, W, H, m.x, m.y, 0xf0f8ff)
      if ((t >> 6) % 3 === 0) for (let k = 0; k < 5; k++) for (let x = x0 - 2; x < x1 + 2; x += 2) dot(px, W, H, x, pool - 8 + k, hsv(k / 5, 0.5, 1))
    },
  }
}

// --- four seasons tree ------------------------------------------------------------

const seasons: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.8)
  const cx = W / 2
  let t = 0
  const leaves = Array.from({ length: 70 }, () => {
    const a = rng() * 6.28
    const r = Math.sqrt(rng())
    return { x: cx + Math.cos(a) * r * W * 0.38, y: H * 0.38 + Math.sin(a) * r * H * 0.16, fall: 0, vx: 0 }
  })
  let snow = Array.from({ length: 20 }, () => ({ x: rng() * W, y: rng() * H }))

  return {
    step() {
      t++
      const s = Math.floor(t / 150) % 4
      const u = (t % 150) / 150
      for (const l of leaves) {
        if (s === 2 && !l.fall && rng() < 0.01) l.fall = 1
        if (l.fall) {
          l.y += 0.35
          l.x += Math.sin(l.y * 0.4) * 0.3
          if (l.y > ground - 1) l.y = ground - 1
        }
        if (s === 0 && u < 0.02) {
          l.fall = 0
          const a = rng() * 6.28
          const r = Math.sqrt(rng())
          l.x = cx + Math.cos(a) * r * W * 0.38
          l.y = H * 0.38 + Math.sin(a) * r * H * 0.16
        }
      }
      for (const f of snow) {
        f.y += 0.3
        f.x += Math.sin(f.y * 0.2) * 0.2
        if (f.y > ground) {
          f.y = 0
          f.x = rng() * W
        }
      }
    },
    draw(px) {
      const s = Math.floor(t / 150) % 4
      const SKY = [
        [0x9ad8ff, 0xe8f8ff],
        [0x5ab0ff, 0xb8e8ff],
        [0xb8a0c8, 0xffd8a0],
        [0x8a98b0, 0xd8e0e8],
      ][s] as [number, number]
      const GROUND = [0x7ad050, 0x5ab040, 0xb8903a, 0xf4f8fc][s] as number
      sky(px, W, H, SKY[0], SKY[1], ground)
      rect(px, W, H, 0, ground, W, H - ground, GROUND)
      rect(px, W, H, cx - 1, H * 0.4, 3, ground - H * 0.4, 0x6a4a2a)
      rect(px, W, H, cx - 1, H * 0.4, 1, ground - H * 0.4, 0x8a6a42)
      rect(px, W, H, cx + 1, H * 0.4, 1, ground - H * 0.4, 0x4a321a)
      ellipse(px, W, H, cx + 1, ground, W * 0.3, 1, scale(GROUND, 0.8))
      line(px, W, H, cx, H * 0.48, cx - W * 0.25, H * 0.34, 0x6a4a2a)
      line(px, W, H, cx, H * 0.45, cx + W * 0.22, H * 0.3, 0x6a4a2a)
      line(px, W, H, cx, H * 0.42, cx + 1, H * 0.24, 0x6a4a2a)
      const LEAF = [0xffb0d0, 0x3a9a3a, 0xf08a2a, 0]
      leaves.forEach((l, i) => {
        if (s === 3 && !l.fall) return
        let c = LEAF[s] as number
        if (s === 0 && i % 3 === 0) c = 0xffffff
        if (s === 1 && i % 4 === 0) c = 0x4ab04a
        if (s === 2 && i % 3 === 0) c = 0xe0402a
        if (s === 3) c = 0xa8784a
        dot(px, W, H, l.x, l.y, l.fall ? c : mix(c, 0xffffff, 0.2))
        if (!l.fall) dot(px, W, H, l.x + 1, l.y, scale(c, 0.8))
      })
      if (s === 3) {
        for (const f of snow) dot(px, W, H, f.x, f.y, 0xffffff)
        line(px, W, H, cx - W * 0.25, H * 0.34 - 1, cx, H * 0.48 - 1, 0xffffff)
      }
      if (s === 1) disc(px, W, H, W * 0.82, 6, 3, 0xfff080)
    },
  }
}

// --- flower blooming --------------------------------------------------------------

const bloom: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.82)
  type F = { x: number; h: number; c: number; born: number; petals: number }
  let fs: F[] = []
  let t = 0

  function reset() {
    fs = [0.2, 0.5, 0.8].map((u, i) => ({ x: W * u, h: H * (0.3 + rng() * 0.25), c: hsv(rng(), 0.6, 1), born: i * 40, petals: 5 + irand(rng, 3) }))
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (t > 420) reset()
    },
    draw(px) {
      const day = (Math.sin(t * 0.015) + 1) / 2
      sky(px, W, H, mix(0x2a3a6a, 0x8ad0ff, day), mix(0xf0a070, 0xe0f4ff, day), ground)
      disc(px, W, H, W * 0.15 + t * 0.05, 8 + (1 - day) * 10, 3, 0xfff0a0)
      rect(px, W, H, 0, ground, W, H - ground, 0x5a3a24)
      rect(px, W, H, 0, ground + 1, W, 1, 0x4a2e1c)
      for (let x = 0; x < W; x += 2) dot(px, W, H, x, ground, 0x6ab048)
      for (const f of fs) {
        const g = span(t, f.born, f.born + 120)
        const top = ground - f.h * g
        line(px, W, H, f.x, ground, f.x + Math.sin(t * 0.02 + f.x) * 0.6 * g, top, 0x3a9a3a)
        if (g > 0.4) {
          dot(px, W, H, f.x - 1, ground - f.h * g * 0.5, 0x4ab04a)
          dot(px, W, H, f.x - 2, ground - f.h * g * 0.5 - 1, 0x4ab04a)
        }
        const open = span(t, f.born + 120, f.born + 220)
        if (g >= 1) {
          const r = 1 + open * 3
          for (let p = 0; p < f.petals; p++) {
            const a = (p / f.petals) * 6.28 + t * 0.002
            const pc = open < 0.3 ? 0x5ab05a : f.c
            const lightUp = Math.cos(a) + Math.sin(a) < 0
            disc(px, W, H, f.x + Math.cos(a) * r * 0.8, top + Math.sin(a) * r * 0.8, 0.4 + open * 1.2, lightUp ? mix(pc, 0xffffff, 0.2) : scale(pc, 0.85))
          }
          lit(px, W, H, f.x, top, 0.5 + open, 0.5 + open, 0xffd040)
        }
      }
    },
  }
}

// --- forest fire ------------------------------------------------------------------

const forestfire: Maker = (W, H, rng) => {
  const c = 2
  const GW = Math.max(4, Math.floor(W / c))
  const GH = Math.max(4, Math.floor(H / c))
  let g = new Uint8Array(GW * GH)
  let rain = 0
  let t = 0
  let drops = Array.from({ length: 30 }, () => ({ x: rng() * W, y: rng() * H }))
  // 0 ash, 1 tree, 2 fire, 3 sprout

  function reset() {
    for (let i = 0; i < GW * GH; i++) g[i] = rng() < 0.75 ? 1 : 3
    g[irand(rng, GW * GH)] = 2
    rain = 0
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (rain) for (const d of drops) {
        d.y += 2
        d.x -= 0.3
        if (d.y > H) {
          d.y = 0
          d.x = rng() * W
        }
      }
      if (t % 3) return
      const n = new Uint8Array(g)
      for (let y = 0; y < GH; y++)
        for (let x = 0; x < GW; x++) {
          const k = y * GW + x
          const v = g[k]!
          if (v === 2) {
            n[k] = rain && rng() < 0.3 ? 0 : rng() < 0.25 ? 0 : 2
            for (const [dx, dy] of DIRS) {
              const nx = x + dx
              const ny = y + dy
              if (nx >= 0 && ny >= 0 && nx < GW && ny < GH && g[ny * GW + nx] === 1 && rng() < (rain ? 0.1 : 0.6)) n[ny * GW + nx] = 2
            }
          } else if (v === 0 && rain && rng() < 0.01) n[k] = 3
          else if (v === 3 && rng() < 0.01) n[k] = 1
        }
      g = n
      const fires = g.filter(v => v === 2).length
      if (!rain && (fires > GW * GH * 0.15 || t > 300)) rain = 1
      if (rain && fires === 0 && t > 900) reset()
      if (fires === 0 && !rain && t > 60) rain = 1
    },
    draw(px) {
      for (let k = 0; k < GW * GH; k++) {
        const v = g[k]!
        const x = (k % GW) * c
        const y = Math.floor(k / GW) * c
        if (v === 1) {
          rect(px, W, H, x, y, c, c, 0x2a7a2a)
          dot(px, W, H, x, y, 0x5ac05a)
          dot(px, W, H, x + c - 1, y + c - 1, 0x1a4a1e)
        } else if (v === 2) {
          rect(px, W, H, x, y, c, c, (x + y + t) % 4 < 2 ? 0xff6a1a : 0xffc030)
          dot(px, W, H, x + 1, y, 0xffe080)
        } else if (v === 3) {
          rect(px, W, H, x, y, c, c, 0x3a3020)
          dot(px, W, H, x, y + 1, 0x6ad04a)
        } else rect(px, W, H, x, y, c, c, (x + y) % 3 ? 0x2a2420 : 0x3a3430)
      }
      if (rain) {
        for (let k = 0; k < W * H; k++) px[k] = mix(px[k] as number, 0x6a7a8a, 0.15)
        for (const d of drops) line(px, W, H, d.x, d.y, d.x + 0.3, d.y - 2, 0xa0b8d0)
      }
    },
  }
}

// --- geyser -----------------------------------------------------------------------

const geyser: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.8)
  const cx = W / 2
  let water: Spark[] = []
  let steam: { x: number; y: number; r: number }[] = []
  let t = 0

  return {
    step() {
      t++
      water = sparks(water, 0.08).filter(w => w.y < ground)
      const phase = t % 400
      if (phase > 180 && phase < 260) for (let k = 0; k < 6; k++) water.push({ x: cx + (rng() - 0.5) * 2, y: ground - 2, vx: (rng() - 0.5) * 0.5, vy: -2.5 - rng() * 1.5, l: 60, c: rng() < 0.5 ? 0xffffff : 0xb8e0ff })
      if (rng() < (phase > 150 ? 0.5 : 0.15)) steam.push({ x: cx + (rng() - 0.5) * 6, y: ground - 2, r: 1 })
      for (const s of steam) {
        s.y -= 0.3
        s.x += 0.1
        s.r += 0.04
      }
      steam = steam.filter(s => s.y > -4)
    },
    draw(px) {
      sky(px, W, H, 0x6aa8e0, 0xc8e8f8, ground)
      for (let x = 0; x < W; x++) {
        const h = 6 + Math.sin(x * 0.15) * 3
        rect(px, W, H, x, ground - 8 - h, 1, h, 0x7a9a8a)
        dot(px, W, H, x, ground - 8 - h, 0x9ab8a8)
      }
      rect(px, W, H, 0, ground, W, H - ground, 0xd8c8a0)
      lit(px, W, H, cx, ground + 2, W * 0.3, 2.5, 0xe8d8a8)
      ellipse(px, W, H, cx, ground + 2, W * 0.2, 1.5, 0x3a98c0)
      ellipse(px, W, H, cx - 0.5, ground + 1.6, W * 0.13, 0.8, 0x6ad0f0)
      const phase = t % 400
      if (phase > 120 && phase < 180) for (let k = 0; k < 4; k++) dot(px, W, H, cx - 3 + ((t + k * 5) % 7), ground + 1 - (t + k) % 2, 0xffffff)
      for (const s of steam) disc(px, W, H, s.x + 0.4, s.y + 0.4, s.r, 0xc8d4e0)
      for (const s of steam) disc(px, W, H, s.x - s.r * 0.2, s.y - s.r * 0.25, s.r * 0.75, 0xfafcff)
      for (const w of water) dot(px, W, H, w.x, w.y, w.c)
      for (let i = 0; i < 4; i++) sprite(px, W, H, 2 + i * 3, ground + 3, ['.s.', 'ccc', 'c.c'], { s: 0xffd0a0, c: hsv(i * 0.27, 0.6, 0.9) })
    },
  }
}

// --- falling leaves ---------------------------------------------------------------

const leaves: Maker = (W, H, rng) => {
  const ground = H - 3
  type L = { x: number; y: number; ph: number; c: number; rest: boolean }
  let ls: L[] = []
  let pile = new Float32Array(W)
  let gust = 0
  let t = 0

  return {
    step() {
      t++
      if (rng() < 0.3) ls.push({ x: rng() * W, y: -2, ph: rng() * 6, c: pick(rng, [0xe86a1a, 0xd83a1a, 0xf0b020, 0xa85a1a]), rest: false })
      if (t % 500 === 400) gust = 60
      if (gust > 0) gust--
      for (const l of ls) {
        if (l.rest) {
          if (gust > 0) {
            l.rest = false
            l.y -= 2
          }
          continue
        }
        l.y += 0.3
        l.x += Math.sin(l.y * 0.2 + l.ph) * 0.4 + (gust > 0 ? 1.4 : 0)
        const k = Math.round(clamp(l.x, 0, W - 1))
        if (l.y >= ground - pile[k]! && gust === 0) {
          l.rest = true
          pile[k] = pile[k]! + 0.5
          for (const n of [k - 1, k + 1]) if (n >= 0 && n < W && pile[n]! < pile[k]! - 1) pile[n] = pile[n]! + 0.25
        }
      }
      if (gust > 0) pile = pile.map(v => Math.max(0, v - 0.2))
      ls = ls.filter(l => l.x < W + 3 && (l.rest || l.y < H))
      if (ls.length > 600) ls = ls.slice(-600)
    },
    draw(px) {
      sky(px, W, H, 0xb8c8e0, 0xf0d8b0, ground)
      rect(px, W, H, 0, ground, W, 3, 0x6a7a3a)
      for (let x = 0; x < W; x++)
        if (pile[x]! > 0) {
          rect(px, W, H, x, ground - pile[x]!, 1, pile[x]!, (x * 3) % 4 ? 0xb8541a : 0xd8802a)
          dot(px, W, H, x, ground - pile[x]!, 0xf0a84a)
        }
      for (const l of ls) {
        dot(px, W, H, l.x, l.y, l.c)
        if (!l.rest) dot(px, W, H, l.x + Math.cos(l.y * 0.3 + l.ph), l.y, scale(l.c, 0.8))
      }
      if (gust > 0) for (let k = 0; k < 5; k++) line(px, W, H, (t * 3 + k * 13) % W, 10 + k * 9, (t * 3 + k * 13) % W + 5, 10 + k * 9, 0xffffff)
    },
  }
}

// --- mushrooms after rain ---------------------------------------------------------

const mushrooms: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.74)
  type M = { x: number; h: number; r: number; c: number; born: number; spots: boolean }
  let ms: M[] = []
  let drops = Array.from({ length: 30 }, () => ({ x: rng() * W, y: rng() * H }))
  let snail = -4
  let t = 0

  function reset() {
    ms = Array.from({ length: 7 }, (_, i) => ({ x: 2 + rng() * (W - 4), h: 2 + rng() * 6, r: 1.5 + rng() * 2.5, c: pick(rng, [0xd83a2a, 0xc8a070, 0xf0e0c0, 0x8a5a3a]), born: 20 + i * 35, spots: rng() < 0.5 }))
    ms.sort((a, b) => a.h - b.h)
    t = 0
    snail = -4
  }
  reset()

  return {
    step() {
      t++
      snail += 0.04
      for (const d of drops) {
        d.y += 1.6
        if (d.y > ground) {
          d.y = -2
          d.x = rng() * W
        }
      }
      if (t > 400) reset()
    },
    draw(px) {
      sky(px, W, H, 0x3a4a3a, 0x5a6a52, ground)
      for (let x = 0; x < W; x += 6) rect(px, W, H, x, 0, 3, ground, 0x2a3a2a)
      rect(px, W, H, 0, ground, W, H - ground, 0x4a3a24)
      for (let x = 0; x < W; x++) if ((x * 5) % 3 === 0) dot(px, W, H, x, ground, 0x5a8a3a)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, ground + 2 + (x % 2), 0xa8602a)
      for (const m of ms) {
        const g = span(t, m.born, m.born + 30)
        if (g <= 0) continue
        const h = m.h * g
        rect(px, W, H, m.x - 0.5, ground - h, 1.5, h, 0xf0e8d8)
        rect(px, W, H, m.x + 0.5, ground - h, 1, h, 0xc8bca8)
        const r = m.r * g
        const [hi, base, sh] = tones(m.c)
        for (let y = 0; y <= r; y++) {
          const hw = r * Math.sqrt(1 - (y / (r + 0.01)) ** 2)
          rect(px, W, H, m.x - hw, ground - h - y, hw * 2 + 1, 1, y === 0 ? sh : base)
          if (y > 0) {
            rect(px, W, H, m.x - hw, ground - h - y, Math.max(1, hw * 0.6), 1, hi)
            rect(px, W, H, m.x + hw * 0.5, ground - h - y, hw * 0.5 + 1, 1, sh)
          }
        }
        if (m.spots && g > 0.8) {
          dot(px, W, H, m.x - r * 0.4, ground - h - r * 0.5, 0xffffff)
          dot(px, W, H, m.x + r * 0.4, ground - h - r * 0.3, 0xffffff)
        }
      }
      sprite(px, W, H, snail, ground - 3, ['.hs.', 'hsdd', 'bbbbb'], { h: 0xe8b060, s: 0xc8883a, d: 0x8a5a24, b: 0xb8a890 })
      for (const d of drops) line(px, W, H, d.x, d.y, d.x, d.y - 1.5, 0x8aa0b8)
    },
  }
}

// --- coral reef -------------------------------------------------------------------

const reef: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.8)
  let t = 0
  const corals = Array.from({ length: 6 }, (_, i) => ({ x: 2 + (i / 5) * (W - 4), h: 6 + rng() * 10, c: hsv(rng(), 0.6, 1), kind: i % 3 }))
  type Fish = { x: number; y: number; vx: number; c: number }
  let school: Fish[] = Array.from({ length: 12 }, () => ({ x: rng() * W, y: H * 0.3 + rng() * 6, vx: 0.35, c: 0x5ab0ff }))
  const clown = { a: 0 }

  return {
    step() {
      t++
      const lead = school[0] as Fish
      const ty = H * 0.3 + Math.sin(t * 0.02) * H * 0.12
      for (const f of school) {
        f.x += f.vx
        f.y += (ty + Math.sin(f.x * 0.3) * 2 - f.y) * 0.05
        if (f.x > W + 3) f.x = -3 - rng() * 6
      }
      void lead
      clown.a += 0.05
    },
    draw(px) {
      sky(px, W, H, 0x3ab0e0, 0x0a3a6a, floor)
      for (let k = 0; k < 4; k++) {
        const x0 = (k * 9 + t * 0.05) % (W + 10) - 5
        for (let y = 0; y < floor; y++) dot(px, W, H, x0 + y * 0.3, y, mix(0x6ad0f0, 0x3ab0e0, y / floor))
      }
      rect(px, W, H, 0, floor, W, H - floor, 0xe0d0a0)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, floor + 1 + (x % 2), 0xc8b888)
      for (const c of corals) {
        const sway = Math.sin(t * 0.04 + c.x) * 1
        if (c.kind === 0) {
          line(px, W, H, c.x + 1, floor, c.x + 1 + sway, floor - c.h, scale(c.c, 0.7))
          line(px, W, H, c.x, floor, c.x + sway, floor - c.h, c.c)
          line(px, W, H, c.x, floor - c.h * 0.4, c.x - 2 + sway, floor - c.h * 0.8, c.c)
          line(px, W, H, c.x, floor - c.h * 0.5, c.x + 2 + sway, floor - c.h * 0.9, c.c)
        } else if (c.kind === 1) {
          lit(px, W, H, c.x, floor - 2, 2.5, 2.5, c.c)
          for (let k = 0; k < 5; k++) dot(px, W, H, c.x - 2 + k, floor - 4 - (k % 2) + sway * 0.5, mix(c.c, 0xffffff, 0.4))
        } else for (let k = -2; k <= 2; k++) line(px, W, H, c.x + k, floor, c.x + k * 1.5 + sway, floor - c.h * 0.6, c.c)
      }
      const ax = W * 0.5
      for (let k = -3; k <= 3; k++) line(px, W, H, ax + k * 0.8, floor, ax + k * 1.3 + Math.sin(t * 0.06 + k) * 1.2, floor - 6, 0xd070c0)
      const cx = ax + Math.cos(clown.a) * 4
      const cy = floor - 8 + Math.sin(clown.a * 2) * 1.5
      // facing the way it swims round the anemone: a forked tail behind, two white bands, an eye in front
      const CLOWN = ['o.owoo.', 'oowowko', 'o.owoo.']
      const right = Math.sin(clown.a) < 0
      litSprite(px, W, H, cx - 3, cy - 1, right ? CLOWN : CLOWN.map(r => r.split('').reverse().join('')), { o: 0xff8a1a, w: 0xffffff, k: 0x101018 })
      for (const f of school) {
        dot(px, W, H, f.x, f.y, f.c)
        dot(px, W, H, f.x - 1, f.y, 0x2a6aff)
      }
      for (let k = 0; k < 5; k++) {
        const y = floor - ((t * 0.3 + k * 11) % floor)
        dot(px, W, H, ax + 2 + Math.sin(y * 0.3) * 0.6, y, 0xa8e0ff)
      }
    },
  }
}

// --- northern lights ------------------------------------------------------------

const aurore: Maker = (W, H, rng) => {
  const horizon = Math.round(H * 0.7)
  const sets = [
    [0x3dff9a, 0xb44aff],
    [0x40f0e0, 0xff5ab4],
    [0x6aff5a, 0x4a7aff],
  ]
  const [c1, c2] = sets[Math.floor(rng() * sets.length)] as [number, number]
  const stars = Array.from({ length: 30 }, () => ({ x: Math.floor(rng() * W), y: Math.floor(rng() * horizon), p: rng() * 7 }))
  const ridge: number[] = []
  for (let x = 0; x < W; x++) ridge.push(horizon - 2 - Math.abs(Math.sin(x * 0.19 + 1) * 4) - Math.abs(Math.sin(x * 0.07)) * 5)
  let t = rng() * 500

  return {
    step() {
      t++
    },
    draw(px) {
      sky(px, W, H, 0x020414, 0x0a1a2e, horizon)
      for (const s of stars) if ((t / 9 + s.p) % 7 > 0.8) dot(px, W, H, s.x, s.y, 0x9aa0c0)
      for (let x = 0; x < W; x++) {
        const c = H * 0.33 + Math.sin(x * 0.12 + t * 0.02) * H * 0.08 + Math.sin(x * 0.31 - t * 0.035) * H * 0.04
        const len = H * 0.18 * (0.6 + 0.4 * Math.sin(x * 0.7 + t * 0.05)) * (0.7 + 0.3 * Math.sin(x * 1.9 - t * 0.08))
        const I = 0.55 + 0.45 * Math.sin(x * 0.08 - t * 0.015)
        for (let y = 0; y < horizon; y++) {
          const d = c - y
          const k = d >= 0 ? Math.exp(-d / len) : Math.exp(d * 0.6)
          const col = d >= 0 ? mix(c1, c2, Math.min(1, (d / len) * 0.8)) : c1
          if (k > 0.02) px[y * W + x] = add(px[y * W + x] as number, scale(col, k * I * 1.25))
        }
      }
      for (let x = 0; x < W; x++) for (let y = Math.round(ridge[x] as number); y < horizon; y++) px[y * W + x] = 0x05060c
      for (let y = horizon; y < H; y++) {
        const sy = 2 * horizon - y - 1
        const off = Math.round(Math.sin(y * 0.8 + t * 0.1))
        for (let x = 0; x < W; x++) {
          const sx = Math.max(0, Math.min(W - 1, x + off))
          px[y * W + x] = sy >= 0 ? scale(px[sy * W + sx] as number, 0.45) : 0
        }
      }
    },
  }
}

// --- sunset over the sea ---------------------------------------------------------

const sunset: Maker = (W, H, rng) => {
  const horizon = Math.round(H * 0.56)
  const LOOP = 420
  let t = Math.floor(rng() * LOOP * 0.4)
  const stars = Array.from({ length: 25 }, () => ({ x: Math.floor(rng() * W), y: Math.floor(rng() * horizon * 0.8), p: rng() * 5 }))
  const clouds = Array.from({ length: 3 }, () => ({ x: rng() * W, y: horizon * (0.25 + rng() * 0.45), w: 6 + rng() * 8 }))
  let birds = Array.from({ length: 3 }, () => ({ x: rng() * W, y: horizon * (0.3 + rng() * 0.3), ph: rng() * 6 }))

  return {
    step() {
      t = (t + 1) % LOOP
      for (const c of clouds) {
        c.x += 0.05
        if (c.x > W + 10) c.x = -c.w
      }
      for (const b of birds) {
        b.x += 0.25
        if (b.x > W + 3) b.x = -3
      }
    },
    draw(px) {
      const k = t / LOOP
      const sunY = horizon * 0.25 + k * horizon * 1.1
      const dusk = Math.min(1, Math.max(0, (sunY - horizon * 0.7) / (horizon * 0.6)))
      const top = mix(mix(0x3a6ab8, 0x3a2a6a, dusk), 0x0a0a2a, Math.max(0, dusk - 0.5) * 2)
      const low = mix(mix(0xffb070, 0xff5a3a, dusk), 0x3a1a4a, Math.max(0, dusk - 0.6) * 2.5)
      sky(px, W, H, top, low, horizon)
      if (dusk > 0.5) for (const s of stars) if ((t / 7 + s.p) % 5 > 0.7) px[s.y * W + s.x] = mix(px[s.y * W + s.x] as number, 0xffffff, (dusk - 0.5) * 2)
      const sunR = W * 0.14
      const sunC = mix(0xfff0b0, 0xff6a2a, dusk)
      for (let y = Math.max(0, Math.floor(sunY - sunR * 2)); y < Math.min(horizon, sunY + sunR * 2); y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x + 0.5 - W / 2, y + 0.5 - sunY) / (sunR * 2)
          if (d < 1) px[y * W + x] = mix(px[y * W + x] as number, sunC, Math.floor((1 - d) * 3) * 0.1)
        }
      for (let y = Math.floor(sunY - sunR); y < Math.min(horizon, sunY + sunR + 1); y++)
        for (let x = 0; x < W; x++) if ((x + 0.5 - W / 2) ** 2 + (y + 0.5 - sunY) ** 2 <= sunR * sunR && y >= 0) px[y * W + x] = sunC
      for (const c of clouds) {
        rect(px, W, H, c.x, c.y, c.w, 1, mix(0x6a3a6a, 0x2a1a3a, dusk))
        rect(px, W, H, c.x + 2, c.y - 1, c.w * 0.5, 1, mix(0xff9a8a, 0x3a2a4a, dusk))
      }
      for (const b of birds) {
        const up = Math.sin(t * 0.3 + b.ph) > 0 ? 1 : 0
        dot(px, W, H, b.x - 1, b.y - up, 0x1a1020)
        dot(px, W, H, b.x, b.y, 0x1a1020)
        dot(px, W, H, b.x + 1, b.y - up, 0x1a1020)
      }
      const sea0 = mix(0x2a4a8a, 0x1a1a40, dusk)
      const sea1 = mix(0x0a1a40, 0x05051a, dusk)
      for (let y = horizon; y < H; y++) {
        const d = (y - horizon) / (H - horizon)
        for (let x = 0; x < W; x++) {
          let c = mix(sea0, sea1, d)
          if (Math.sin(x * 0.5 + y * 2.1 + t * 0.12) > 0.85) c = mix(c, 0xffffff, 0.15)
          const glitter = Math.abs(x + 0.5 - W / 2 + Math.sin(y * 1.7 + t * 0.2) * 2) < sunR * (0.4 + d * 0.8)
          if (sunY < horizon + sunR && glitter && (x + y + Math.floor(t / 3)) % 3 !== 0) c = mix(c, sunC, 0.75 * (1 - dusk * 0.6))
          px[y * W + x] = c
        }
      }
    },
  }
}

export const NATURE = {
  aurore,
  sunset,
  thunderstorm,
  tornado,
  surfer,
  volcano,
  waterfall,
  seasons,
  bloom,
  forestfire,
  geyser,
  leaves,
  mushrooms,
  reef,
}
