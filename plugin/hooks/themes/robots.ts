import { disc, dot, mix, rect, text } from '../draw'
import type { Maker } from '../draw'
import { hash, irand, lit, slab, textWidth } from '../kit'

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

export const ROBOTS = {
  robovac,
}
