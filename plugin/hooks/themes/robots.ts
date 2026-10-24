import { disc, dot, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, hash, irand, lit, litSprite, slab, sparks, textWidth, tint } from '../kit'
import type { Spark } from '../kit'

// Sci-fi, robots & mecha: machines that act alive.

// --- robot vacuum -----------------------------------------------------------------

const robovac: Maker = (W, H, rng) => {
  const solid = new Uint8Array(W * H)
  const dust = new Uint8Array(W * H)
  const R = Math.max(1.2, W / 13)
  const wall = 2
  const top = 8
  // the furniture: a sofa, a table on four legs, a plant
  const sofa = { x: wall, y: top, w: Math.round(W * 0.55), h: Math.round(H * 0.12) }
  const table = { x: Math.round(W * 0.3), y: Math.round(H * 0.45), w: Math.round(W * 0.42), h: Math.round(H * 0.16) }
  const plant = { x: W - wall - 3, y: top + 3, r: Math.max(1.5, W / 14) }
  const dock = { x: Math.round(W / 2), y: H - wall - 2 }
  // the spot it never reaches: a crumb pile tucked behind the plant
  const spot = { x: W - wall - 1, y: top }

  const block = (x: number, y: number, w: number, h: number) => {
    for (let j = Math.max(0, y); j < Math.min(H, y + h); j++)
      for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) solid[j * W + i] = 1
  }
  block(0, 0, W, top)
  block(0, 0, wall, H)
  block(W - wall, 0, wall, H)
  block(0, H - wall, W, wall)
  block(sofa.x, sofa.y, sofa.w, sofa.h)
  for (const [lx, ly] of [
    [table.x, table.y],
    [table.x + table.w - 1, table.y],
    [table.x, table.y + table.h - 1],
    [table.x + table.w - 1, table.y + table.h - 1],
  ])
    block(lx, ly, 1, 1)
  for (let j = -3; j <= 3; j++)
    for (let i = -3; i <= 3; i++) if (i * i + j * j <= plant.r * plant.r + 0.5) block(Math.round(plant.x + i), Math.round(plant.y + j), 1, 1)

  let total = 0
  let x = 0
  let y = 0
  let head = 0
  let t = 0
  let mode: 'out' | 'lanes' | 'shift' | 'seek' | 'home' | 'docked' = 'out'
  let target = -1
  let tries = 0
  const skip = new Set<number>()
  let dir = 1
  let shifted = 0
  let docked = 0
  let seed = irand(rng, 1000)

  const free = (cx: number, cy: number) => {
    for (let k = 0; k < 8; k++) {
      const a = (k / 8) * Math.PI * 2
      const qx = Math.round(cx + Math.cos(a) * R)
      const qy = Math.round(cy + Math.sin(a) * R)
      if (qx < 0 || qx >= W || qy < 0 || qy >= H || solid[qy * W + qx]) return false
    }
    return true
  }
  const spill = () => {
    dust.fill(0)
    total = 0
    for (let j = top; j < H - wall; j++)
      for (let i = wall; i < W - wall; i++) {
        const k = j * W + i
        if (solid[k]) continue
        // crumbs come in little drifts, plus a sprinkle everywhere
        const drift = hash(Math.floor(i / 5), Math.floor(j / 5), seed) < 0.3
        if (hash(i, j, seed + 1) < (drift ? 0.45 : 0.12)) {
          dust[k] = 1 + (hash(i, j, seed + 2) < 0.5 ? 1 : 0)
          total++
        }
      }
    for (let j = 0; j < 2; j++)
      for (let i = 0; i < 2; i++) {
        const k = (spot.y + j) * W + spot.x - i
        if (!solid[k] && !dust[k]) {
          dust[k] = 2
          total++
        }
      }
    x = dock.x
    y = dock.y - R
    head = -Math.PI / 2
    mode = 'out'
    target = -1
    skip.clear()
    t = 0
  }
  spill()

  const goTo = (tx: number, ty: number) => {
    const dx = tx - x
    const dy = ty - y
    const d = Math.hypot(dx, dy)
    if (d < 0.3) return
    const sp = Math.min(1, d)
    head = Math.atan2(dy, dx)
    if (free(x + (dx / d) * sp, y + (dy / d) * sp)) {
      x += (dx / d) * sp
      y += (dy / d) * sp
      return
    }
    // slip round whatever is in the way
    for (const turn of [0.6, -0.6, 1.2, -1.2, Math.PI / 2, -Math.PI / 2]) {
      const a = head + turn
      if (free(x + Math.cos(a) * sp, y + Math.sin(a) * sp)) {
        x += Math.cos(a) * sp
        y += Math.sin(a) * sp
        return
      }
    }
  }
  const clean = () => {
    for (let j = Math.floor(y - R); j <= Math.ceil(y + R); j++)
      for (let i = Math.floor(x - R); i <= Math.ceil(x + R); i++)
        if (i >= 0 && i < W && j >= 0 && j < H && (i - x) ** 2 + (j - y) ** 2 <= R * R + 0.5) dust[j * W + i] = 0
  }
  const left = () => {
    let n = 0
    for (let k = 0; k < dust.length; k++) if (dust[k]) n++
    return n
  }

  return {
    step() {
      t++
      if (mode === 'docked') {
        docked++
        if (docked > 60) {
          seed = irand(rng, 1000)
          spill()
        }
        return
      }
      const speed = 0.7
      if (mode === 'out') {
        // up to the top, then back and forth in lanes, like the real ones
        if (free(x, y - speed)) y -= speed
        else {
          mode = 'lanes'
          dir = rng() < 0.5 ? 1 : -1
        }
      } else if (mode === 'lanes' || mode === 'shift') {
        if (mode === 'lanes') {
          head = dir > 0 ? 0 : Math.PI
          if (free(x + dir * speed, y)) x += dir * speed
          else {
            mode = 'shift'
            shifted = 0
          }
        } else {
          head = Math.PI / 2
          if (free(x, y + speed) && shifted < R * 2 - 0.5) {
            y += speed
            shifted += speed
          } else if (shifted > 0) {
            mode = 'lanes'
            dir = -dir
          } else mode = 'seek'
        }
        if (t > 620) mode = 'seek'
      } else if (mode === 'seek') {
        // then it hunts what the lanes missed, and gives up on what it can't reach
        if (target < 0 || !dust[target]) {
          target = -1
          let best = Infinity
          for (let k = 0; k < dust.length; k++) {
            if (!dust[k] || skip.has(k)) continue
            const d = ((k % W) - x) ** 2 + (Math.floor(k / W) - y) ** 2
            if (d < best) {
              best = d
              target = k
            }
          }
          tries = 0
          if (target < 0) mode = 'home'
        } else {
          goTo(target % W, Math.floor(target / W))
          if (++tries > 50) {
            skip.add(target)
            target = -1
          }
        }
        if (t > 800) mode = 'home'
      } else if (mode === 'home') {
        if (Math.hypot(dock.x - x, dock.y - R - y) < 0.6) {
          mode = 'docked'
          docked = 0
          return
        }
        goTo(dock.x, dock.y - R)
      }
      clean()
    },
    draw(px) {
      // a wooden floor: planks three pixels wide, staggered seams, two tones
      for (let j = 0; j < H; j++) {
        const row = Math.floor(j / 3)
        for (let i = 0; i < W; i++) {
          const seam = (i + row * 7) % 11 === 0
          px[j * W + i] = j % 3 === 2 || seam ? 0xa47a4c : hash(Math.floor((i + row * 7) / 11), row, 9) > 0.5 ? 0xc4966a : 0xbc8e60
        }
      }
      // a rug with a border and a fringe
      const rug = { x: Math.round(W * 0.15), y: Math.round(H * 0.68), w: Math.round(W * 0.6), h: Math.round(H * 0.16) }
      rect(px, W, H, rug.x, rug.y, rug.w, rug.h, 0x3e5a88)
      rect(px, W, H, rug.x + 1, rug.y + 1, rug.w - 2, rug.h - 2, 0x6a8ab8)
      rect(px, W, H, rug.x + 2, rug.y + 2, rug.w - 4, rug.h - 4, 0x5a7aa8)
      for (let i = rug.x; i < rug.x + rug.w; i += 2) {
        dot(px, W, H, i, rug.y - 1, 0xe8e0d0)
        dot(px, W, H, i, rug.y + rug.h, 0xe8e0d0)
      }
      for (let k = 0; k < dust.length; k++) if (dust[k]) px[k] = dust[k] === 2 ? 0x5a4a3a : mix(px[k], 0x4a3a2a, 0.55)
      // walls, lit on top, a baseboard shadow along the floor
      rect(px, W, H, 0, 0, W, top, 0xece2d0)
      rect(px, W, H, 0, top - 2, W, 1, 0xd8ccb6)
      rect(px, W, H, 0, top - 1, W, 1, 0xa89880)
      rect(px, W, H, 0, 0, wall, H, 0xd8ccb8)
      rect(px, W, H, wall - 1, top, 1, H, 0xb4a690)
      rect(px, W, H, W - wall, 0, wall, H, 0xc8bca8)
      rect(px, W, H, 0, H - wall, W, wall, 0xc8bca8)
      // the sofa: a back, two cushions, armrests
      slab(px, W, H, sofa.x, sofa.y, sofa.w, sofa.h, 0x8a3a4a, 0x4a1a24)
      const half = Math.round(sofa.w / 2)
      slab(px, W, H, sofa.x + 2, sofa.y + 2, half - 2, sofa.h - 3, 0xa84a5a)
      slab(px, W, H, sofa.x + half, sofa.y + 2, sofa.w - half - 2, sofa.h - 3, 0xa84a5a)
      // the plant: a lit pot, leaves with a highlight
      lit(px, W, H, plant.x, plant.y, plant.r, plant.r, 0xa8603a, 0x5a2a14)
      lit(px, W, H, plant.x, plant.y, plant.r - 0.6, plant.r - 0.6, 0x3a9a3a)
      dot(px, W, H, plant.x - 1, plant.y - 1, 0x8ae07a)
      // the dock
      slab(px, W, H, dock.x - 2, H - wall - 1, 5, 1, 0x2a2a30)
      dot(px, W, H, dock.x, H - wall - 1, mode === 'docked' ? 0x40e060 : 0xe0a020)
      // the robot: a shadow, an outlined lit body, a sensor; under the table when it's there
      lit(px, W, H, x + 0.6, y + 0.8, R, R, 0x6a4a30)
      lit(px, W, H, x, y, R, R, 0x4a4a58, 0x16161c)
      dot(px, W, H, x - R * 0.3, y - R * 0.3, 0x9a9aa8)
      dot(px, W, H, x + Math.cos(head) * (R - 0.5), y + Math.sin(head) * (R - 0.5), t % 10 < 6 ? 0x40d0ff : 0x2080a0)
      for (let j = table.y; j < table.y + table.h; j++)
        for (let i = table.x; i < table.x + table.w; i++)
          if (i >= 0 && i < W && j >= 0 && j < H) px[j * W + i] = mix(px[j * W + i], j === table.y ? 0x9a6c44 : i === table.x + table.w - 1 || j === table.y + table.h - 1 ? 0x4a2e18 : 0x6a4428, 0.8)
      // how clean the floor is
      const pct = `${Math.round((1 - left() / Math.max(1, total)) * 100)}%`
      text(px, W, H, 1, 1, pct, 0x3a3a48)
      if (mode === 'docked' && docked % 20 < 12 && W >= 20) text(px, W, H, W - 1 - textWidth('!'), 1, '!', 0xd03a3a)
    },
  }
}

// --- laser grid heist ---------------------------------------------------------------

const THIEF = ['..k..', '.kwk.', 'kkkkk', '.kkk.', '.k.k.']

const laserheist: Maker = (W, H, rng) => {
  const top = 11
  const bottom = H - 6
  type Row = { y: number; kind: 'blink' | 'gap'; ph: number; sp: number }
  let rows: Row[] = []
  let x = W / 2
  let y = bottom
  let t = 0
  let next = 0
  let crossing = false
  let slip = -1
  let alarm = 0
  let won = 0
  let fx: Spark[] = []
  const reset = () => {
    const n = 4
    rows = []
    for (let i = 0; i < n; i++) rows.push({ y: Math.round(bottom - 7 - (i * (bottom - top - 12)) / (n - 1)), kind: rng() < 0.5 ? 'blink' : 'gap', ph: rng() * 100, sp: 0.03 + rng() * 0.03 })
    x = W / 2
    y = bottom
    t = 0
    next = 0
    crossing = false
    // now and then the thief goes a moment too early
    slip = rng() < 0.25 ? irand(rng, n) : -1
    alarm = 0
    won = 0
  }
  reset()
  const on = (r: Row, tt: number) => (tt + r.ph) % 50 < 28
  const gapX = (r: Row, tt: number) => W / 2 + Math.sin(tt * r.sp + r.ph) * (W / 2 - 5)
  const burns = (r: Row, tt: number, px0: number) => (r.kind === 'blink' ? on(r, tt) : Math.abs(px0 - gapX(r, tt)) > 2.5)

  return {
    step() {
      fx = sparks(fx, 0.04)
      t++
      if (alarm > 0) {
        if (++alarm > 60) reset()
        return
      }
      if (won > 0) {
        if (++won > 50) reset()
        return
      }
      const r = rows[next]
      if (!r) {
        // the last stretch: up to the diamond
        y -= 0.5
        x += (W / 2 - x) * 0.1
        if (y <= top + 3) {
          won = 1
          for (let k = 0; k < 3; k++) burst(fx, rng, W / 2, top, 0xa0f8ff, 8, 1)
        }
        return
      }
      if (r.kind === 'gap') x += Math.max(-0.7, Math.min(0.7, gapX(r, t + 4) - x))
      if (!crossing) {
        if (y > r.y + 4) y -= 0.5
        else {
          // waiting for the beam to go dark, or for the gap to come round
          let safe = true
          for (let k = 0; k < 10; k++) if (burns(r, t + k, r.kind === 'gap' ? gapX(r, t + k) : x)) safe = false
          if (r.kind === 'gap') safe = Math.abs(x - gapX(r, t)) < 1
          if (safe || (next === slip && rng() < 0.05)) crossing = true
        }
      } else {
        y -= 0.9
        if (y < r.y - 3) {
          crossing = false
          next++
        }
      }
      if (Math.abs(y - r.y) < 1.5 && burns(r, t, x)) {
        alarm = 1
        for (let k = 0; k < 2; k++) burst(fx, rng, x, y, 0xff4040, 8, 0.8)
      }
    },
    draw(px) {
      // a marble floor in dim light, the walls of the vault
      for (let yy = 0; yy < H; yy++)
        for (let xx = 0; xx < W; xx++) {
          const tile = (Math.floor(xx / 4) + Math.floor(yy / 4)) % 2
          px[yy * W + xx] = mix(tile ? 0x22243a : 0x1c1e30, 0x0a0a14, Math.abs(xx - W / 2) / W)
        }
      rect(px, W, H, 0, 0, W, 6, 0x3a3a50)
      rect(px, W, H, 0, 5, W, 1, 0x50506a)
      // the pedestal and its diamond
      slab(px, W, H, W / 2 - 3, top - 2, 7, 5, 0x6a6a80, 0x2a2a38)
      if (!won) {
        const sparkle = t % 30 < 4
        rect(px, W, H, W / 2 - 1, top - 4, 3, 1, 0xa0f8ff)
        rect(px, W, H, W / 2 - 2, top - 3, 5, 1, 0x60d8f0)
        rect(px, W, H, W / 2 - 1, top - 2, 3, 1, 0x40b0d8)
        dot(px, W, H, W / 2, top - 1, 0x40b0d8)
        if (sparkle) dot(px, W, H, W / 2 - 1, top - 4, 0xffffff)
      }
      for (const r of rows) {
        const lit2 = r.kind === 'blink' ? on(r, t) : true
        slab(px, W, H, 0, r.y - 1, 2, 3, 0x5a5a6a)
        slab(px, W, H, W - 2, r.y - 1, 2, 3, 0x5a5a6a)
        dot(px, W, H, 1, r.y, lit2 ? 0xff4050 : 0x5a2028)
        dot(px, W, H, W - 2, r.y, lit2 ? 0xff4050 : 0x5a2028)
        if (r.kind === 'blink' && !lit2) continue
        const g = r.kind === 'gap' ? gapX(r, t) : -99
        for (let xx = 2; xx < W - 2; xx++) {
          if (Math.abs(xx - g) <= 2.5) continue
          dot(px, W, H, xx, r.y, 0xff3a4a)
          tint(px, W, H, xx, r.y - 1, 0xff2030, 0.35)
          tint(px, W, H, xx, r.y + 1, 0xff2030, 0.35)
        }
      }
      // a torch beam ahead of the thief
      for (let k = 2; k < 9; k++) for (let w = -k / 2; w <= k / 2; w++) tint(px, W, H, x + w, y - 2 - k, 0xfff4c0, 0.3 - k * 0.02)
      litSprite(px, W, H, Math.round(x - 2), Math.round(y - 2), THIEF, { k: 0x40405e, w: 0xf0f0f0 })
      if (won) lit(px, W, H, x + 2, y + 1, 1.6, 1.6, 0x8a7a5a)
      if (alarm) {
        const k = alarm % 10 < 5
        for (let i = 0; i < W * H; i++) px[i] = mix(px[i], 0xff2020, k ? 0.3 : 0.1)
        disc(px, W, H, 2, 2, 1.5, k ? 0xff4040 : 0x6a1010)
        disc(px, W, H, W - 3, 2, 1.5, k ? 0x6a1010 : 0xff4040)
      }
      text(px, W, H, W - 1 - textWidth(`${next}/${rows.length}`), 0, `${Math.min(next, rows.length)}/${rows.length}`, 0xd0d0e0)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- robot learns to walk -------------------------------------------------------------

const robowalk: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.74)
  const leg = Math.max(3, Math.round(H * 0.075))
  const bw = Math.max(5, Math.round(W * 0.26))
  const bh = Math.max(4, Math.round(W * 0.22))
  let x = 0
  let phase = 0
  let tilt = 0
  let spin = 0
  let state: 'walk' | 'wobble' | 'fall' | 'down' | 'up' | 'win' = 'walk'
  let t = 0
  let attempt = 1
  let fails = 0
  let failAt = 0
  let fallDir = 1
  let fx: Spark[] = []
  const run = () => {
    attempt = 1
    fails = 1 + irand(rng, 3)
    start()
  }
  const start = () => {
    x = W * 0.2
    phase = 0
    tilt = 0
    spin = 0
    state = 'walk'
    t = 0
    failAt = attempt <= fails ? 15 + irand(rng, 30) : 9999
    fallDir = rng() < 0.6 ? 1 : -1
  }
  run()

  return {
    step() {
      fx = sparks(fx, 0.06)
      t++
      if (state === 'walk') {
        phase += 0.16
        x += 0.32
        if (t > failAt) {
          state = 'wobble'
          t = 0
        }
        if (x > W + bw) {
          state = 'win'
          t = 0
          for (let k = 0; k < 4; k++) burst(fx, rng, W / 2, H * 0.3, [0xff5a6a, 0x5ad0ff, 0xffd24a, 0x7aff6a][k], 10, 1.3)
        }
      } else if (state === 'wobble') {
        tilt = Math.sin(t * 0.5) * t * 0.012
        if (t > 22) {
          state = 'fall'
          spin = fallDir * 0.02
          tilt = fallDir * 0.15
        }
      } else if (state === 'fall') {
        spin += Math.sin(tilt) * 0.03
        tilt += spin
        if (Math.abs(tilt) > 1.45) {
          tilt = Math.sign(tilt) * 1.45
          if (Math.abs(spin) > 0.04) spin = -spin * 0.3
          else {
            state = 'down'
            t = 0
            for (let k = 0; k < 6; k++) fx.push({ x: x + fallDir * (leg * 2 + bh), y: ground, vx: (rng() - 0.5) * 0.8, vy: -rng() * 0.6, l: 14, c: 0xb8b8c8 })
          }
        }
      } else if (state === 'down' && t > 30) {
        state = 'up'
        t = 0
      } else if (state === 'up') {
        tilt *= 0.88
        if (t > 25) {
          attempt++
          start()
        }
      } else if (state === 'win' && t > 45) run()
    },
    draw(px) {
      // the lab: a tiled wall, a monitor counting the tries, a floor with hazard stripes
      sky(px, W, H, 0x2a3446, 0x3a4658, ground)
      for (let yy = 0; yy < ground; yy++) for (let xx = 0; xx < W; xx++) if (xx % 8 === 0 || yy % 8 === 0) px[yy * W + xx] = 0x26303e
      slab(px, W, H, 2, 8, 13, 9, 0x1a2028, 0x0a0e12)
      text(px, W, H, 4, 10, String(attempt), state === 'win' ? 0x60ff90 : 0x60d0ff)
      for (let k = 0; k < Math.min(attempt - 1, 3); k++) {
        dot(px, W, H, 11, 10 + k * 2, 0xff5050)
      }
      for (let yy = ground; yy < H; yy++) for (let xx = 0; xx < W; xx++) px[yy * W + xx] = yy === ground ? 0x8a94a8 : mix(0x4a5262, 0x2a303c, (yy - ground) / (H - ground))
      // the robot, drawn around its feet, so a fall turns it about them
      const pivotX = x
      const c = Math.cos(tilt)
      const s = Math.sin(tilt)
      const P = (lx: number, ly: number): [number, number] => [pivotX + lx * c - ly * s, ground + lx * s + ly * c]
      const hipY = -leg * 2 + (state === 'walk' ? Math.abs(Math.sin(phase)) * 0.6 : 0)
      for (const side of [0, 1]) {
        const a = state === 'walk' ? Math.sin(phase + side * Math.PI) * 0.5 : 0
        const knee = state === 'walk' ? Math.max(0, Math.sin(phase + side * Math.PI + 1)) * 0.6 : 0
        const kx = Math.sin(a) * leg
        const ky = hipY + Math.cos(a) * leg
        const fxp = kx + Math.sin(a - knee) * leg
        const fyp = Math.min(0, ky + Math.cos(a - knee) * leg)
        const col = side ? 0x7a8498 : 0x9aa4b8
        beam(px, W, H, ...P(0, hipY), ...P(kx, ky), col)
        beam(px, W, H, ...P(kx, ky), ...P(fxp, fyp), col)
        const [fx0, fy0] = P(fxp + 1, fyp)
        rect(px, W, H, fx0 - 2, fy0 - 1, 4, 1, 0x3a4050)
      }
      // the body: a lit box with a screen for a face, an antenna
      const corners: [number, number][] = [P(-bw / 2, hipY), P(bw / 2, hipY), P(bw / 2, hipY - bh), P(-bw / 2, hipY - bh)]
      const outline = corners.map(([a, b]) => [a, b] as [number, number])
      for (let k = 0; k < 4; k++) {
        const [ax, ay] = outline[k]
        const [bx, by] = outline[(k + 1) % 4]
        for (let j = 0; j <= 12; j++) dot(px, W, H, ax + ((bx - ax) * j) / 12, ay + ((by - ay) * j) / 12, 0x1a2030)
      }
      for (let ly = hipY - bh + 1; ly < hipY; ly++)
        for (let lx = -bw / 2 + 1; lx < bw / 2; lx++) {
          const [qx, qy] = P(lx, ly)
          const edge = ly < hipY - bh + 2 || lx < -bw / 2 + 2
          dot(px, W, H, qx, qy, edge ? 0xe8ecf4 : ly > hipY - 2 || lx > bw / 2 - 2 ? 0x8a94a8 : 0xc0c8d8)
        }
      for (let ly = hipY - bh + 2; ly < hipY - 1.5; ly++)
        for (let lx = -bw / 2 + 2; lx < bw / 2 - 1.5; lx++) {
          const [qx, qy] = P(lx, ly)
          dot(px, W, H, qx, qy, 0x1a2a3a)
        }
      const happy = state === 'win' || state === 'walk'
      const eye = state === 'fall' || state === 'down' ? 0xff6060 : 0x60f0ff
      dot(px, W, H, ...P(-1.5 + 1, hipY - bh + 3), eye)
      dot(px, W, H, ...P(1.5 + 1, hipY - bh + 3), eye)
      if (happy) dot(px, W, H, ...P(1, hipY - bh + 4), eye)
      const [ax, ay] = P(0, hipY - bh - 2)
      const [ax0, ay0] = P(0, hipY - bh)
      dot(px, W, H, ax0, ay0 - 1, 0x6a7488)
      dot(px, W, H, ax, ay, t % 16 < 8 ? 0xff5050 : 0xffd040)
      for (const sp of fx) dot(px, W, H, sp.x, sp.y, sp.c)
    },
  }
}

export const ROBOTS = {
  robovac,
  laserheist,
  robowalk,
}
