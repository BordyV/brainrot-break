import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, hash, irand, lit, poly, rot, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Ocean & underwater: life under the surface, and a little above it.

/** Light rays slanting down from the surface. */
function rays(px: Uint32Array, W: number, H: number, t: number, depth: number) {
  for (let k = 0; k < 4; k++) {
    const x0 = ((k * W) / 3 + Math.sin(t * 0.01 + k) * 4) % (W + 10)
    for (let y = 0; y < H * depth; y++) {
      const x = x0 + y * 0.35
      const fade = 0.12 * (1 - y / (H * depth))
      tint(px, W, H, x, y, 0xd0f0ff, fade)
      tint(px, W, H, x + 1, y, 0xd0f0ff, fade)
    }
  }
}

// --- bait ball ----------------------------------------------------------------------

const baitball: Maker = (W, H, rng) => {
  type Fish = { x: number; y: number; vx: number; vy: number }
  const fish: Fish[] = []
  const cx = W / 2
  const cy = H * 0.5
  for (let k = 0; k < 70; k++) {
    const a = rng() * Math.PI * 2
    const r = rng() * W * 0.3
    fish.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, vx: 0, vy: 0 })
  }
  let shark = { x: -20, y: cy, vx: 0, on: false }
  let t = 0
  let fx: Spark[] = []

  return {
    step() {
      t++
      fx = sparks(fx, -0.02)
      if (!shark.on && t % 160 === 60) {
        const left = rng() < 0.5
        shark = { x: left ? -14 : W + 14, y: cy + (rng() - 0.5) * 10, vx: left ? 1.4 : -1.4, on: true }
      }
      if (shark.on) {
        shark.x += shark.vx
        if (shark.x < -20 || shark.x > W + 20) shark.on = false
      }
      // a tight swirl around the middle; everyone flees the shark
      for (const f of fish) {
        const dx = f.x - cx
        const dy = f.y - cy
        const r = Math.hypot(dx, dy) || 1
        f.vx += (-dy / r) * 0.04 - dx * 0.004 + (rng() - 0.5) * 0.12
        f.vy += (dx / r) * 0.04 - dy * 0.004 + (rng() - 0.5) * 0.12
        if (shark.on) {
          const sx = f.x - shark.x
          const sy = f.y - shark.y
          const d = Math.hypot(sx, sy) || 1
          if (d < 9) {
            f.vx += (sx / d) * 0.5
            f.vy += (sy / d) * 0.5
            if (rng() < 0.01) fx.push({ x: f.x, y: f.y, vx: 0, vy: -0.2, l: 20, c: 0xc0e8ff })
          }
        }
        const sp = Math.hypot(f.vx, f.vy)
        if (sp > 1.1) {
          f.vx *= 1.1 / sp
          f.vy *= 1.1 / sp
        }
        f.vx *= 0.94
        f.vy *= 0.94
        f.x += f.vx
        f.y += f.vy
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a8ad0, 0x0a2a5a)
      rays(px, W, H, t, 0.8)
      for (const f of fish) {
        const dir = f.vx >= 0 ? 1 : -1
        dot(px, W, H, f.x, f.y, 0xd8e8f8)
        dot(px, W, H, f.x - dir, f.y, 0x7a9ab8)
        if (Math.floor(f.x + f.y + t * 0.3) % 6 === 0) dot(px, W, H, f.x, f.y, 0xffffff)
      }
      if (shark.on) {
        const d = Math.sign(shark.vx)
        const x = shark.x
        const y = shark.y
        // body, belly, dorsal fin, tail, an eye
        lit(px, W, H, x, y, 7, 2.4, 0x6a7a8a, 0x2a3440)
        rect(px, W, H, x - 5, y + 1, 10, 1, 0xd8dce0)
        poly(px, W, H, [[x - d, y - 2], [x - d * 3, y - 5], [x - d * 4, y - 2]], 0x5a6a7a)
        poly(px, W, H, [[x - d * 6, y], [x - d * 10, y - 4], [x - d * 9, y], [x - d * 10, y + 3]], 0x5a6a7a)
        dot(px, W, H, x + d * 4, y - 1, 0x101010)
        dot(px, W, H, x + d * 6, y + 1, 0xa0a8b0)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- whale breach -------------------------------------------------------------------

const whale: Maker = (W, H, rng) => {
  const sea = Math.round(H * 0.46)
  let t = 0
  let x = W / 2
  let y = H + 10
  let vx = 0.2
  let vy = 0
  let a = -1.2
  let phase: 'rise' | 'air' | 'sink' | 'wait' = 'wait'
  let splash: Spark[] = []
  let foam = 0
  const go = () => {
    x = W * (0.3 + rng() * 0.4)
    y = H + 6
    vx = (rng() < 0.5 ? 1 : -1) * 0.25
    vy = -1.45
    phase = 'rise'
  }

  return {
    step() {
      t++
      splash = sparks(splash, 0.07)
      if (foam > 0) foam--
      if (phase === 'wait') {
        if (t % 90 === 30) go()
        return
      }
      const wasUnder = y > sea
      vy += y < sea ? 0.075 : phase === 'rise' ? -0.005 : 0.02
      x += vx
      y += vy
      a = Math.atan2(vy, vx * 4) * 0.9
      if (wasUnder && y <= sea) {
        phase = 'air'
        for (let k = 0; k < 22; k++) splash.push({ x: x + (rng() - 0.5) * 6, y: sea, vx: (rng() - 0.5) * 1.4, vy: -0.6 - rng() * 1.4, l: 30, c: k % 3 ? 0xffffff : 0xb0e0ff })
      }
      if (!wasUnder && y > sea) {
        phase = 'sink'
        foam = 60
        for (let k = 0; k < 34; k++) splash.push({ x: x + (rng() - 0.5) * 10, y: sea, vx: (rng() - 0.5) * 2, vy: -0.5 - rng() * 2, l: 34, c: k % 3 ? 0xffffff : 0xb0e0ff })
      }
      if (phase === 'sink' && y > H + 10) phase = 'wait'
    },
    draw(px) {
      sky(px, W, H, 0x3a4a8a, 0xf0a070, sea)
      // a low sun on the horizon, a far boat of whale watchers
      ellipse(px, W, H, W * 0.75, sea - 1, 4, 3, 0xffe8a0)
      rect(px, W, H, 3, sea - 2, 5, 1, 0x2a2a3a)
      rect(px, W, H, 5, sea - 4, 1, 2, 0x2a2a3a)
      for (let yy = sea; yy < H; yy++)
        for (let xx = 0; xx < W; xx++) px[yy * W + xx] = (xx * 2 + yy * 3 + Math.floor(t / 5)) % 23 === 0 && yy < sea + 8 ? 0x8ac0e8 : mix(0x2a6aa8, 0x0a1e40, (yy - sea) / (H - sea))
      if (phase !== 'wait') {
        // the whale, drawn along its own axis: a long lit body, a pale throat, flukes
        const body: [number, number][] = []
        const len = Math.min(16, W * 0.5)
        for (let k = 0; k <= 12; k++) {
          const u = (k / 12) * len - len * 0.6
          const half = Math.max(0.6, 3.3 * Math.sin((k / 12) * Math.PI * 0.95 + 0.15))
          body.push([u, -half])
        }
        for (let k = 12; k >= 0; k--) {
          const u = (k / 12) * len - len * 0.6
          const half = Math.max(0.6, 3.3 * Math.sin((k / 12) * Math.PI * 0.95 + 0.15))
          body.push([u, half])
        }
        const dir = vx >= 0 ? 1 : -1
        const P = (u: number, v: number): [number, number] => {
          const [rx, ry] = rot(u * dir, v, a * dir + (dir < 0 ? 0 : 0))
          return [x + rx, y + ry]
        }
        const under = y > sea
        const col = under ? 0x1a3a5a : 0x3a4a6a
        poly(px, W, H, body.map(([u, v]) => P(-u, v)), col)
        poly(px, W, H, body.filter(([, v]) => v > 1.5).map(([u, v]) => P(-u, v * 0.7 + 1)), under ? 0x3a5a7a : 0xd0d8e0)
        const [tx, ty] = P(len * 0.6 + 1, 0)
        poly(px, W, H, [[tx, ty], P(len * 0.6 + 4, -3), P(len * 0.6 + 3, 0), P(len * 0.6 + 4, 3)], col)
        poly(px, W, H, [P(-len * 0.1, 2), P(len * 0.05, 6), P(len * 0.08, 2)], under ? 0x2a4a6a : 0x5a6a8a)
        const [ex, ey] = P(-len * 0.4, 0.5)
        dot(px, W, H, ex, ey, 0x0a0a14)
        if (!under) {
          const [hx, hy] = P(-len * 0.2, -2.5)
          dot(px, W, H, hx, hy, 0x6a7aa0)
        }
        // the sea line passes in front of whatever is under it
        for (let xx = 0; xx < W; xx++) dot(px, W, H, xx, sea, 0xd0ecff)
      }
      if (foam) for (let k = -8; k <= 8; k++) if (hash(k, Math.floor(t / 3), 1) < foam / 70) dot(px, W, H, x + k, sea + (k % 2), 0xffffff)
      for (const s of splash) dot(px, W, H, s.x, s.y, s.y > sea ? 0x8ac0e8 : s.c)
    },
  }
}

// --- deep-sea dive ------------------------------------------------------------------

const deepsea: Maker = (W, H, rng) => {
  // the world is tall: the camera follows the sub down from the surface to the vents
  const bottom = 900
  let depth = 0
  let t = 0
  let hold = 0
  type Thing = { kind: 'fish' | 'jelly' | 'angler' | 'squid' | 'worm'; x: number; y: number; ph: number }
  let things: Thing[] = []
  const reset = () => {
    depth = 0
    t = 0
    hold = 0
    things = []
    for (let y = 40; y < bottom - 40; y += 24 + irand(rng, 16)) {
      const z = y / bottom
      const kind = z < 0.25 ? 'fish' : z < 0.5 ? 'jelly' : z < 0.8 ? (rng() < 0.6 ? 'angler' : 'squid') : 'jelly'
      things.push({ kind, x: 4 + rng() * (W - 8), y, ph: rng() * 6 })
    }
    for (let k = 0; k < 4; k++) things.push({ kind: 'worm', x: 3 + k * (W / 4) + rng() * 3, y: bottom - 2, ph: rng() * 6 })
  }
  reset()

  return {
    step() {
      t++
      if (depth < bottom - H * 0.6) depth += 1.1
      else if (++hold > 90) reset()
    },
    draw(px) {
      const cam = depth - H * 0.4
      for (let y = 0; y < H; y++) {
        const wy = y + cam
        const z = clamp(wy / bottom, 0, 1)
        const c = wy < 0 ? 0x8ac8f0 : mix(mix(0x2a8ad0, 0x0a2a5a, Math.min(1, z * 3)), 0x02040a, clamp((z - 0.3) * 1.6, 0, 1))
        for (let x = 0; x < W; x++) px[y * W + x] = c
      }
      // marine snow drifting in the dark
      for (let k = 0; k < 30; k++) {
        const sx = hash(k, 1, 3) * W
        const sy = (hash(k, 2, 3) * H * 3 - t * 0.2) % H
        const yy = (sy + H) % H
        if (yy + cam > 200) dot(px, W, H, sx, yy, 0x3a4a5a)
      }
      if (cam < 0) for (let x = 0; x < W; x++) dot(px, W, H, x, -cam, 0xe0f4ff)
      const sub = { x: W / 2 + Math.sin(t * 0.03) * 2, y: depth - cam }
      for (const th of things) {
        const y = th.y - cam
        if (y < -10 || y > H + 10) continue
        const x = th.x + Math.sin(t * 0.03 + th.ph) * 2
        if (th.kind === 'fish')
          for (let k = 0; k < 5; k++) {
            const fx0 = (x + k * 3 + t * 0.4) % (W + 6) - 3
            dot(px, W, H, fx0, y + (k % 2) * 2, 0xf0c040)
            dot(px, W, H, fx0 - 1, y + (k % 2) * 2, 0xc08a20)
          }
        if (th.kind === 'jelly') {
          const pulse = Math.sin(t * 0.1 + th.ph)
          lit(px, W, H, x, y, 2.5 + pulse * 0.3, 1.6, 0xd070e0)
          for (let k = -1; k <= 1; k++) for (let j = 1; j < 5; j++) dot(px, W, H, x + k * 1.5 + Math.sin(t * 0.1 + j) * 0.5, y + 1 + j, 0x8a3aa0)
        }
        if (th.kind === 'angler') {
          // the lure glows; the rest is barely there
          lit(px, W, H, x, y, 3, 2.4, 0x3a2a3a, 0x1a0e1a)
          for (let k = -2; k <= 2; k++) dot(px, W, H, x - 2 + Math.abs(k) * 0.3, y + 1 + k * 0.4, k % 2 ? 0xe0e0d0 : 0x3a2a3a)
          dot(px, W, H, x + 1, y - 3, 0x4a3a4a)
          dot(px, W, H, x - 1, y - 4, 0x4a3a4a)
          const glow = t % 40 < 30 ? 0xd0ff80 : 0x80c040
          dot(px, W, H, x - 2, y - 4, glow)
          for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) tint(px, W, H, x - 2 + dx, y - 4 + dy, glow, 0.4)
        }
        if (th.kind === 'squid') {
          lit(px, W, H, x, y, 2, 4, 0xa83a3a, 0x4a0a0a)
          dot(px, W, H, x, y - 1, 0xffffff)
          for (let k = -2; k <= 2; k++) for (let j = 4; j < 9; j++) dot(px, W, H, x + k + Math.sin(t * 0.08 + j + k) * 0.6, y + j, 0x8a2a2a)
        }
      }
      // the bottom: rock, a vent smoking, tube worms
      const by = bottom - cam
      if (by < H) {
        for (let y = Math.max(0, Math.round(by)); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y < by + 1 ? 0x3a3434 : 0x1e1a1a
        const vx = W * 0.7
        slab(px, W, H, vx - 2, by - 6, 4, 6, 0x4a3a34, 0x1a1210)
        for (let k = 0; k < 8; k++) dot(px, W, H, vx + Math.sin(t * 0.1 + k) * (k * 0.3), by - 7 - k * 1.5 - (t % 3), 0x4a4a52)
        for (const th of things)
          if (th.kind === 'worm')
            for (let j = 0; j < 4; j++) {
              dot(px, W, H, th.x, by - 1 - j, 0xe8e0d8)
              if (j === 3) dot(px, W, H, th.x + Math.sin(t * 0.1 + th.ph) * 0.6, by - 5, 0xe83a3a)
            }
      }
      // the sub: a headlight cone, a yellow hull, a porthole
      for (let k = 2; k < 14; k++) for (let w = -k * 0.4; w <= k * 0.4; w++) tint(px, W, H, sub.x + w, sub.y + 3 + k, 0xfff0b0, 0.18 - k * 0.01)
      lit(px, W, H, sub.x, sub.y, 5, 2.8, 0xf0c030, 0x5a3a08)
      slab(px, W, H, sub.x - 1, sub.y - 5, 3, 3, 0xe0b028, 0x5a3a08)
      dot(px, W, H, sub.x + 2, sub.y - 0.5, 0x60d0ff)
      dot(px, W, H, sub.x - 6, sub.y, t % 4 < 2 ? 0xd0d0d0 : 0x808080)
      const m = `${Math.max(0, Math.round(depth * 12))}`
      text(px, W, H, 1, 1, m, 0xffffff)
    },
  }
}

// --- turtle hatchlings --------------------------------------------------------------

const hatchlings: Maker = (W, H, rng) => {
  const surf = Math.round(H * 0.7)
  const nest = { x: W * 0.5, y: H * 0.2 }
  type Baby = { x: number; y: number; delay: number; state: 0 | 1 | 2 | 3; ph: number }
  let babies: Baby[] = []
  let gull = { x: -10, y: 8, target: -1, carry: false }
  let t = 0
  let safe = 0
  let fx: Spark[] = []
  const reset = () => {
    babies = []
    for (let k = 0; k < 14; k++) babies.push({ x: nest.x + (rng() - 0.5) * 3, y: nest.y, delay: k * 9 + irand(rng, 8), state: 0, ph: rng() * 6 })
    gull = { x: -10, y: 8, target: -1, carry: false }
    t = 0
    safe = 0
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.04)
      for (const b of babies) {
        if (b.state === 0 && t > b.delay) b.state = 1
        if (b.state === 1) {
          // a wobbly dash for the waves
          b.y += 0.35
          b.x += Math.sin(t * 0.3 + b.ph) * 0.3 + (rng() - 0.5) * 0.2
          b.x = clamp(b.x, 1, W - 2)
          if (b.y >= surf + 2) {
            b.state = 3
            safe++
            fx.push({ x: b.x, y: surf + 1, vx: 0, vy: -0.3, l: 10, c: 0xffffff })
          }
        }
      }
      // the gull picks one, swoops, and usually misses
      if (gull.target < 0 && t % 90 === 40) {
        const running = babies.map((b, i) => (b.state === 1 ? i : -1)).filter(i => i >= 0)
        if (running.length) {
          gull.target = running[irand(rng, running.length)]
          gull.x = rng() < 0.5 ? -8 : W + 8
          gull.y = 4
        }
      }
      if (gull.target >= 0) {
        const b = babies[gull.target]
        if (!gull.carry) {
          gull.x += clamp(b.x - gull.x, -1, 1)
          gull.y += clamp(b.y - 3 - gull.y, -0.8, 0.8)
          if (Math.hypot(b.x - gull.x, b.y - 3 - gull.y) < 1.5 || b.state !== 1) {
            if (b.state === 1 && rng() < 0.3) {
              b.state = 2
              gull.carry = true
            } else {
              gull.target = -1
              gull.carry = false
              for (let k = 0; k < 4; k++) fx.push({ x: gull.x, y: gull.y + 2, vx: (rng() - 0.5), vy: -rng() * 0.5, l: 10, c: 0xf0e0b0 })
            }
          }
        } else {
          gull.y -= 0.6
          gull.x += 0.6
          b.x = gull.x
          b.y = gull.y + 3
          if (gull.y < -8) {
            gull.target = -1
            gull.carry = false
          }
        }
      } else if (gull.x > -12 && gull.x < W + 12) {
        gull.x += 0.8
        gull.y -= 0.3
      }
      if (babies.every(b => b.state >= 2) && t > 200) reset()
    },
    draw(px) {
      // the beach at dawn: dunes, wet sand, the surf line rolling
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const wave = surf + Math.sin(x * 0.3 + t * 0.05) * 1.2 + Math.sin(t * 0.03) * 1.5
          px[y * W + x] = y < 4 ? mix(0xf0b080, 0xf8d8a8, y / 4) : y < wave ? (hash(x, y, 2) < 0.06 ? 0xd8b880 : mix(0xf0d8a8, 0xc8a878, (y - 4) / surf)) : y < wave + 1.5 ? 0xffffff : mix(0x4ab0d0, 0x1a6a98, (y - wave) / (H - wave))
        }
      // the nest, a little dip in the sand
      ellipse(px, W, H, nest.x, nest.y, 3, 1.5, 0xb89868)
      for (const b of babies) {
        if (b.state === 0 || b.state === 3) continue
        const flip = Math.floor(t / 3 + b.ph) % 2
        rect(px, W, H, b.x - 1, b.y - 1, 2, 2, 0x3a4a3a)
        dot(px, W, H, b.x - 1, b.y - 1, 0x5a6a50)
        dot(px, W, H, b.x - (flip ? 2 : -1), b.y, 0x2a3a2a)
        dot(px, W, H, b.x, b.y + 1, 0x2a3a2a)
      }
      if (gull.x > -10 && gull.x < W + 10) {
        const flap = Math.floor(t / 4) % 2
        rect(px, W, H, gull.x - 1, gull.y, 3, 1, 0xffffff)
        dot(px, W, H, gull.x - 2, gull.y - (flap ? 1 : -1), 0xd0d0d8)
        dot(px, W, H, gull.x + 2, gull.y - (flap ? 1 : -1), 0xd0d0d8)
        dot(px, W, H, gull.x + 2, gull.y, 0xf0a020)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      const tally = `${safe}/${babies.length}`
      text(px, W, H, W - 1 - textWidth(tally), H - 7, tally, 0xffffff)
    },
  }
}

// --- shell swap ---------------------------------------------------------------------

const shellswap: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.66)
  type Crab = { size: number; x: number; shell: number; naked: number }
  let crabs: Crab[] = []
  let shells: { size: number; x: number; y: number; hue: number }[] = []
  let step = 0
  let t = 0
  let arrive = 0
  const reset = () => {
    // crabs line up smallest to biggest; a new, bigger shell washes in
    crabs = []
    shells = []
    const n = 3
    for (let k = 0; k < n; k++) {
      const size = 2.4 + k * 0.9
      shells.push({ size, x: 4 + k * (W / 4.2) + size, y: floor, hue: 0.05 + rng() * 0.1 })
      crabs.push({ size: size * 0.8, x: shells[k].x, shell: k, naked: 0 })
    }
    shells.push({ size: 2.4 + n * 0.9, x: W + 8, y: floor, hue: 0.55 + rng() * 0.2 })
    step = 0
    t = 0
    arrive = 1
  }
  reset()

  return {
    step() {
      t++
      if (arrive) {
        const s = shells[shells.length - 1]
        s.x -= 0.25
        if (s.x <= W - s.size - 2) arrive = 0
        return
      }
      // the biggest crab first, then each takes the shell left behind
      const k = crabs.length - 1 - step
      if (k < 0) {
        if (t > 60) reset()
        return
      }
      const c = crabs[k]
      const target = shells[c.shell + 1]
      const dx = target.x - c.x
      c.naked = 1
      c.x += clamp(dx, -0.4, 0.4)
      if (Math.abs(dx) < 0.3) {
        c.shell++
        c.naked = 0
        step++
        t = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0x3aa0c8, 0x1a5a88, floor)
      rays(px, W, H, t, 0.7)
      for (let y = floor; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = hash(x, y, 5) < 0.08 ? 0xc8b088 : mix(0xe0cc9a, 0xb09868, (y - floor) / (H - floor))
      // a seaweed or two, a starfish
      for (const sx of [2, W - 3]) for (let y = floor - 10; y < floor; y++) dot(px, W, H, sx + Math.sin(y * 0.6 + t * 0.05), y, 0x3a8a4a)
      dot(px, W, H, W * 0.5, floor + 4, 0xf07a4a)
      for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) dot(px, W, H, W * 0.5 + a, floor + 4 + b, 0xe86a3a)
      const occupied = new Set(crabs.filter(c => !c.naked).map(c => c.shell))
      shells.forEach((s, i) => {
        // a spiral shell: lit, with a darker whorl
        const col = hsv(s.hue, 0.45, 0.9)
        lit(px, W, H, s.x, s.y - s.size, s.size + 0.6, s.size, col, tones(col)[3])
        dot(px, W, H, s.x - s.size * 0.2, s.y - s.size * 1.1, tones(col)[2])
        dot(px, W, H, s.x + s.size * 0.3, s.y - s.size * 0.8, tones(col)[2])
        void occupied
        void i
      })
      for (const c of crabs) {
        const s = c.naked ? null : shells[c.shell]
        const x = c.x
        const y = floor - 1
        // legs and claws poking out of the front of the shell, stalk eyes on top
        const front = x - (s ? s.size : c.size) - 0.5
        const walk = Math.floor(t / 3) % 2
        if (c.naked) {
          // out of its shell, soft and pink: hurry!
          lit(px, W, H, x, y - c.size * 0.6, c.size, c.size * 0.6, 0xf0a0a0, 0x8a4a4a)
        }
        for (let k = 0; k < 3; k++) dot(px, W, H, front + k, y - ((k + walk) % 2), 0xc83a22)
        rect(px, W, H, front - 2, y - 2, 2, 2, 0xe85a3a)
        dot(px, W, H, front - 2, y - 2, 0xff8a6a)
        dot(px, W, H, front, y - 3, 0xd84a2a)
        dot(px, W, H, front, y - 4, 0x1a1a1a)
        dot(px, W, H, front + 1, y - 4, 0x1a1a1a)
      }
      text(px, W, H, 1, 1, String(Math.min(step, crabs.length)), 0xffffff)
    },
  }
}

export const OCEAN = {
  baitball,
  whale,
  deepsea,
  hatchlings,
  shellswap,
}
