import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, hash, irand, line, lit, shuffle, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Fantasy & RPG: slimes, bosses, swords and loot.

// --- slime merge --------------------------------------------------------------------

const SLIME_R = [2, 3, 4.3, 6]
const SLIME_HUE = [0.3, 0.55, 0.8, 0.12]

const slimemerge: Maker = (W, H, rng) => {
  const floor = H - 6
  type Slime = { x: number; y: number; vx: number; vy: number; lv: number; squash: number; cd: number }
  let slimes: Slime[] = []
  let t = 0
  let king = 0
  let fx: Spark[] = []
  const spawn = () => slimes.push({ x: 3 + rng() * (W - 6), y: -3, vx: 0, vy: 0, lv: 0, squash: 0, cd: irand(rng, 20) })
  const reset = () => {
    slimes = []
    for (let k = 0; k < 3; k++) spawn()
    t = 0
    king = 0
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.06)
      if (king) {
        if (++king > 90) {
          for (let k = 0; k < 4; k++) burst(fx, rng, W / 2, floor - 6, hsv(k * 0.25, 0.7, 1), 12, 1.4)
          reset()
        }
        return
      }
      if (t % 22 === 0 && slimes.length < 10) spawn()
      for (const s of slimes) {
        const r = SLIME_R[s.lv]
        s.vy += 0.09
        s.x += s.vx
        s.y += s.vy
        if (s.squash > 0) s.squash -= 0.1
        if (s.y > floor - r) {
          if (s.vy > 0.5) s.squash = 1
          s.y = floor - r
          s.vy = 0
          s.vx *= 0.6
          // hop toward the nearest slime of the same size
          if (--s.cd <= 0) {
            const mate = slimes.filter(o => o !== s && o.lv === s.lv).sort((a, b) => Math.abs(a.x - s.x) - Math.abs(b.x - s.x))[0]
            const dir = mate ? Math.sign(mate.x - s.x) || 1 : rng() < 0.5 ? -1 : 1
            s.vx = dir * (0.5 + rng() * 0.4)
            s.vy = -1.3 - rng() * 0.5
            s.cd = 18 + irand(rng, 20)
          }
        }
        if (s.x < r) {
          s.x = r
          s.vx = Math.abs(s.vx)
        }
        if (s.x > W - r) {
          s.x = W - r
          s.vx = -Math.abs(s.vx)
        }
      }
      // two of a size touch: one bigger slime
      for (let i = 0; i < slimes.length; i++)
        for (let j = i + 1; j < slimes.length; j++) {
          const a = slimes[i]
          const b = slimes[j]
          if (a.lv !== b.lv || a.lv >= 3) continue
          if (Math.hypot(a.x - b.x, a.y - b.y) < SLIME_R[a.lv] * 2) {
            a.lv++
            a.x = (a.x + b.x) / 2
            a.vy = -1.5
            a.squash = 1
            burst(fx, rng, a.x, a.y, hsv(SLIME_HUE[a.lv], 0.6, 1), 10, 1)
            slimes.splice(j, 1)
            if (a.lv === 3) king = 1
            return
          }
        }
    },
    draw(px) {
      // a dungeon: stone wall, torches, a dirt floor
      sky(px, W, H, 0x2a2438, 0x3a3048, floor)
      for (let y = 0; y < floor; y++) for (let x = 0; x < W; x++) if (y % 5 === 4 || (x + (Math.floor(y / 5) % 2) * 4) % 8 === 0) px[y * W + x] = 0x221c2e
      for (const tx of [3, W - 4]) {
        rect(px, W, H, tx, 12, 1, 3, 0x6a4a2a)
        dot(px, W, H, tx, 11, t % 6 < 3 ? 0xffd040 : 0xff8a20)
        for (let k = 1; k < 5; k++) for (let a = 0; a < 6; a++) tint(px, W, H, tx + Math.cos(a) * k, 11 + Math.sin(a) * k, 0xff9a40, 0.06)
      }
      for (let y = floor; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === floor ? 0x6a5a48 : hash(x, y, 1) < 0.1 ? 0x3a3028 : 0x4a3e32
      for (const s of slimes) {
        const r = SLIME_R[s.lv]
        const sq = s.squash > 0 ? s.squash * 0.35 : 0
        const rx = r * (1 + sq)
        const ry = r * (1 - sq) * 0.85
        const col = hsv(SLIME_HUE[s.lv], 0.65, 0.9)
        lit(px, W, H, s.x, s.y + r - ry, rx, ry, col, tones(col)[3])
        dot(px, W, H, s.x - rx * 0.4, s.y + r - ry * 1.5, 0xffffff)
        // two dot eyes and, for the king, a crown
        const ey = s.y + r - ry * 0.9
        dot(px, W, H, s.x - Math.max(1, r * 0.35), ey, 0x1a1020)
        dot(px, W, H, s.x + Math.max(1, r * 0.35), ey, 0x1a1020)
        if (s.lv === 3) {
          const cy = s.y + r - ry * 2 - 1
          rect(px, W, H, s.x - 3, cy, 7, 2, 0xf0c030)
          for (const k of [-3, 0, 3]) dot(px, W, H, s.x + k, cy - 1, 0xf0c030)
          dot(px, W, H, s.x, cy, 0xe04040)
        }
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(slimes.length), 0xd0c0e0)
    },
  }
}

// --- boss fight ---------------------------------------------------------------------

const bossfight: Maker = (W, H, rng) => {
  const floor = H - 8
  const bx = W * 0.62
  let hero = { x: 4, y: floor, vy: 0, hp: 5 }
  let boss = { hp: 80, hit: 0, slam: 0 }
  let t = 0
  let action = 0
  let nums: { x: number; y: number; n: number; l: number }[] = []
  let waves: { x: number; r: number }[] = []
  let fx: Spark[] = []
  let over = 0
  const reset = () => {
    hero = { x: 4, y: floor, vy: 0, hp: 5 }
    boss = { hp: 80, hit: 0, slam: 0 }
    t = 0
    over = 0
    nums = []
    waves = []
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.06)
      for (const n of nums) {
        n.y -= 0.3
        n.l--
      }
      nums = nums.filter(n => n.l > 0)
      for (const w of waves) w.r += 0.8
      waves = waves.filter(w => w.r < W)
      if (over) {
        if (++over > 80) reset()
        return
      }
      if (boss.hit) boss.hit--
      // the hero: run in, slash, back off; jump the shockwaves
      hero.vy += 0.15
      hero.y = Math.min(floor, hero.y + hero.vy)
      for (const w of waves)
        if (Math.abs(bx - w.r - hero.x) < 1.5 && hero.y >= floor - 0.5) {
          hero.vy = -2
        }
      action++
      const near = bx - 9
      if (action < 30) hero.x += (near - hero.x) * 0.15
      else if (action < 42) {
        if (action === 31 || action === 35 || action === 39) {
          const dmg = 4 + irand(rng, 6)
          boss.hp = Math.max(0, boss.hp - dmg)
          boss.hit = 4
          nums.push({ x: bx - 4 + rng() * 4, y: floor - 16, n: dmg, l: 20 })
          for (let k = 0; k < 5; k++) fx.push({ x: near + 3, y: floor - 4, vx: rng() - 0.3, vy: -rng(), l: 8, c: 0xffffff })
        }
      } else if (action < 62) hero.x += (4 - hero.x) * 0.12
      else action = 0
      if (t % 70 === 50) {
        boss.slam = 10
        waves.push({ x: bx, r: 0 })
      }
      if (boss.slam) boss.slam--
      if (boss.hp <= 0) {
        over = 1
        for (let k = 0; k < 5; k++) burst(fx, rng, bx, floor - 10, [0xffe060, 0xff8040, 0xffffff][k % 3], 14, 1.5)
      }
    },
    draw(px) {
      // a lava cave: dark rock, glowing cracks
      sky(px, W, H, 0x2a1418, 0x4a1e18, floor)
      for (let y = floor; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 3 + y * 7) % 13 === 0 ? 0xff6a20 : 0x3a2420
      rect(px, W, H, 0, floor, W, 1, 0x6a4a40)
      for (const w of waves) {
        const x = bx - w.r
        dot(px, W, H, x, floor - 1, 0xffa040)
        dot(px, W, H, x, floor - 2, 0xffd080)
        dot(px, W, H, bx + w.r, floor - 1, 0xffa040)
      }
      if (!over || over < 10) {
        // the golem: a stone body, arms, glowing eyes and core
        const lift = boss.slam ? -2 : 0
        const col = boss.hit ? 0xffffff : 0x7a6a6a
        lit(px, W, H, bx, floor - 12, 6, 8, col, 0x2a1e1e)
        lit(px, W, H, bx, floor - 22 + lift * 0.5, 4, 3.5, col, 0x2a1e1e)
        slab(px, W, H, bx - 10, floor - 16 + lift, 4, 10, boss.hit ? 0xffffff : 0x6a5a5a, 0x2a1e1e)
        slab(px, W, H, bx + 6, floor - 16 + lift, 4, 10, boss.hit ? 0xffffff : 0x6a5a5a, 0x2a1e1e)
        dot(px, W, H, bx - 2, floor - 22, 0xff4020)
        dot(px, W, H, bx + 2, floor - 22, 0xff4020)
        lit(px, W, H, bx, floor - 11, 1.6, 1.6, 0xffa020)
      }
      // the hero: a small knight with a sword
      const hx = Math.round(hero.x)
      const hy = Math.round(hero.y)
      rect(px, W, H, hx - 1, hy - 4, 3, 3, 0x4a7ad8)
      rect(px, W, H, hx - 1, hy - 6, 3, 2, 0xd8d8e0)
      dot(px, W, H, hx + 1, hy - 5, 0x1a1a24)
      rect(px, W, H, hx - 1, hy - 1, 1, 1, 0x3a3a4a)
      rect(px, W, H, hx + 1, hy - 1, 1, 1, 0x3a3a4a)
      const slash = action >= 30 && action < 42 && (action - 30) % 4 < 2
      if (slash) beam(px, W, H, hx + 2, hy - 5, hx + 6, hy - 1, 0xe8f0ff)
      else line(px, W, H, hx + 2, hy - 3, hx + 2, hy - 7, 0xd0d8e8)
      // the boss bar, the damage numbers
      rect(px, W, H, 2, 2, W - 4, 3, 0x1a0a0a)
      rect(px, W, H, 3, 3, Math.round(((W - 6) * boss.hp) / 80), 1, 0xe83a3a)
      for (const n of nums) text(px, W, H, n.x, n.y, String(n.n), n.l % 4 < 2 ? 0xffe060 : 0xffffff)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- forging a sword ----------------------------------------------------------------

const forge: Maker = (W, H, rng) => {
  const anvilY = Math.round(H * 0.62)
  let heat = 1
  let hits = 0
  let t = 0
  let phase: 'heat' | 'hammer' | 'quench' | 'show' = 'heat'
  let hammer = 0
  let steam: Spark[] = []
  let fx: Spark[] = []
  let blade = 0
  const reset = () => {
    heat = 1
    hits = 0
    t = 0
    phase = 'hammer'
    blade = 0
  }
  reset()
  const glow = (h: number) => (h > 0.75 ? mix(0xffd060, 0xfff8d0, (h - 0.75) * 4) : h > 0.45 ? mix(0xff7a20, 0xffd060, (h - 0.45) / 0.3) : h > 0.15 ? mix(0x8a2a1a, 0xff7a20, (h - 0.15) / 0.3) : mix(0x6a6e78, 0x8a2a1a, h / 0.15))

  return {
    step() {
      t++
      fx = sparks(fx, 0.1)
      steam = sparks(steam, -0.02)
      if (phase === 'hammer') {
        hammer = (t % 16) / 16
        if (t % 16 === 8) {
          hits++
          blade = Math.min(1, blade + 0.08)
          heat -= 0.06
          for (let k = 0; k < 7; k++) fx.push({ x: W / 2, y: anvilY - 2, vx: (rng() - 0.5) * 2.4, vy: -0.6 - rng() * 1.6, l: 10 + irand(rng, 10), c: rng() < 0.5 ? 0xffe080 : 0xff9030 })
        }
        if (heat < 0.2) {
          phase = blade >= 1 ? 'quench' : 'heat'
          t = 0
        }
      } else if (phase === 'heat') {
        heat = Math.min(1, heat + 0.02)
        if (heat >= 1) {
          phase = 'hammer'
          t = 0
        }
      } else if (phase === 'quench') {
        heat = Math.max(0, heat - 0.03)
        if (t % 2 === 0) for (let k = 0; k < 3; k++) steam.push({ x: W * 0.78 + (rng() - 0.5) * 6, y: anvilY - 2, vx: (rng() - 0.5) * 0.3, vy: -0.3 - rng() * 0.3, l: 30 + irand(rng, 20), c: 0xe8e8f0 })
        if (t > 50) {
          phase = 'show'
          t = 0
        }
      } else if (phase === 'show' && t > 60) reset()
    },
    draw(px) {
      // a dark smithy, the forge glowing on the left
      sky(px, W, H, 0x1e1a22, 0x2a2228)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x + (Math.floor(y / 4) % 2) * 3) % 6 === 0 || y % 4 === 0) px[y * W + x] = mix(px[y * W + x], 0x141018, 0.5)
      const fy = anvilY - 6
      slab(px, W, H, 0, fy, 8, H - fy, 0x5a4a44, 0x2a2020)
      for (let x = 1; x < 7; x++) dot(px, W, H, x, fy + 1, (x + Math.floor(t / 3)) % 3 ? 0xff8a20 : 0xffe060)
      for (let k = 1; k < 9; k++) for (let a = 0; a < 8; a++) tint(px, W, H, 4 + Math.cos(a) * k, fy + Math.sin(a) * k, 0xff7a20, 0.05)
      // the water bucket on the right
      slab(px, W, H, W - 9, anvilY - 1, 8, H - anvilY + 1, 0x6a4a2a, 0x2a1a0a)
      rect(px, W, H, W - 8, anvilY, 6, 1, 0x3a7ab0)
      // the anvil
      const ax = W / 2
      slab(px, W, H, ax - 7, anvilY, 13, 3, 0x5a5e6a, 0x1a1c22)
      slab(px, W, H, ax - 3, anvilY + 3, 6, 6, 0x4a4e58, 0x1a1c22)
      slab(px, W, H, ax - 6, anvilY + 9, 12, 3, 0x4a4e58, 0x1a1c22)
      rect(px, W, H, ax - 6, anvilY, 11, 1, 0x9aa0ac)
      // the blade: where it is depends on the step; its colour on the heat
      const len = Math.round(8 + blade * 6)
      let x0 = ax - len / 2
      let y0 = anvilY - 1
      if (phase === 'heat') {
        x0 = 1
        y0 = fy + 1
      }
      if (phase === 'quench') {
        x0 = W - 8
        y0 = anvilY + 1
      }
      if (phase === 'show') {
        x0 = ax - len / 2
        y0 = anvilY - 10
      }
      const col = phase === 'show' ? 0xd8e0ec : glow(heat)
      rect(px, W, H, x0, y0, len, 1, col)
      rect(px, W, H, x0 + 1, y0 - 1, len - 2, 1, mix(col, 0xffffff, 0.3))
      rect(px, W, H, x0 - 3, y0 - 1, 3, 3, 0x6a4a2a)
      rect(px, W, H, x0, y0 - 2, 1, 4, 0x8a8a90)
      if (phase === 'show' && t % 20 < 6) dot(px, W, H, x0 + (t % 20) * 2, y0 - 1, 0xffffff)
      // the hammer rises and falls
      if (phase === 'hammer') {
        const up = hammer < 0.5 ? hammer * 2 : 1 - (hammer - 0.5) * 2
        const hy = anvilY - 3 - Math.round((1 - up) * 10)
        beam(px, W, H, ax + 8, hy - 1, ax + 14, hy + 4, 0x8a5a30)
        slab(px, W, H, ax - 1, hy - 3, 5, 3, 0x6a6e78, 0x1a1c22)
      }
      for (const s of steam) tint(px, W, H, s.x, s.y, s.c, Math.min(0.8, s.l / 30))
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, W - 1 - textWidth(String(hits)), 1, String(hits), 0xd0c0b0)
    },
  }
}

// --- inventory packing --------------------------------------------------------------

// The loot: shapes in cells, and the icon drawn over them.
const LOOT: { cells: [number, number][]; c: number; icon: 'sword' | 'shield' | 'potion' | 'bow' | 'helm' | 'gem' | 'scroll' | 'axe' }[] = [
  { cells: [[0, 0], [0, 1], [0, 2], [0, 3]], c: 0xc8d0e0, icon: 'sword' },
  { cells: [[0, 0], [1, 0], [0, 1], [1, 1]], c: 0x8a5a30, icon: 'shield' },
  { cells: [[0, 0]], c: 0xe04a6a, icon: 'potion' },
  { cells: [[0, 0], [0, 1], [0, 2]], c: 0xa87a40, icon: 'bow' },
  { cells: [[0, 0], [1, 0]], c: 0x9aa0b0, icon: 'helm' },
  { cells: [[0, 0]], c: 0x4ad0e0, icon: 'gem' },
  { cells: [[0, 0], [1, 0]], c: 0xf0e0b0, icon: 'scroll' },
  { cells: [[0, 0], [1, 0], [0, 1], [0, 2]], c: 0x7a7a88, icon: 'axe' },
]

const inventory: Maker = (W, H, rng) => {
  const cols = 6
  const rows = 8
  const c = Math.max(2, Math.floor(Math.min((W - 2) / cols, (H - 14) / rows)))
  const ox = Math.floor((W - cols * c) / 2)
  const oy = H - rows * c - 3
  type Item = { kind: number; x: number; y: number; px: number; py: number; k: number }
  let items: Item[] = []
  let grid: number[] = []
  let t = 0
  let full = 0
  let fx: Spark[] = []
  const reset = () => {
    items = []
    grid = new Array(cols * rows).fill(-1)
    t = 0
    full = 0
  }
  reset()
  const fits = (kind: number, x: number, y: number) =>
    LOOT[kind].cells.every(([dx, dy]) => x + dx < cols && y + dy < rows && grid[(y + dy) * cols + x + dx] < 0)

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      for (const it of items) if (it.k < 1) it.k = Math.min(1, it.k + 0.08)
      if (full) {
        if (++full > 70) reset()
        return
      }
      if (t % 14 === 0) {
        // the next piece of loot, into the first place it fits, biggest gaps last
        const order = shuffle(rng, [...LOOT.keys()])
        let placed = false
        for (const kind of order) {
          for (let y = 0; y < rows && !placed; y++)
            for (let x = 0; x < cols && !placed; x++)
              if (fits(kind, x, y)) {
                const id = items.length
                for (const [dx, dy] of LOOT[kind].cells) grid[(y + dy) * cols + x + dx] = id
                items.push({ kind, x, y, px: W / 2, py: 2, k: 0 })
                placed = true
              }
          if (placed) break
        }
        if (!placed) {
          full = 1
          for (let k = 0; k < 3; k++) burst(fx, rng, W / 2, oy + rows * c * 0.5, 0xffe060, 10, 1.2)
        }
      }
    },
    draw(px) {
      // a leather backpack: stitched edge, a grid of pockets
      sky(px, W, H, 0x2a2030, 0x1a1420)
      slab(px, W, H, ox - 2, oy - 2, cols * c + 4, rows * c + 4, 0x7a4a28, 0x3a2010)
      for (let x = ox - 1; x < ox + cols * c + 1; x += 2) dot(px, W, H, x, oy - 1, 0xc89a60)
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) rect(px, W, H, ox + x * c, oy + y * c, c - 1, c - 1, (x + y) % 2 ? 0x3a2a24 : 0x342620)
      const icon = (it: Item, sx: number, sy: number) => {
        const L = LOOT[it.kind]
        for (const [dx, dy] of L.cells) slab(px, W, H, sx + dx * c, sy + dy * c, c - 1, c - 1, mix(L.c, 0x2a1e1a, 0.6))
        const w = (Math.max(...L.cells.map(p => p[0])) + 1) * c - 1
        const h = (Math.max(...L.cells.map(p => p[1])) + 1) * c - 1
        const cx = sx + w / 2
        const cy = sy + h / 2
        const [hi, base, sh] = tones(L.c)
        if (L.icon === 'sword') {
          line(px, W, H, cx, sy + 1, cx, sy + h - 4, hi)
          rect(px, W, H, cx - 1.5, sy + h - 4, 4, 1, 0xc8a040)
          rect(px, W, H, cx, sy + h - 3, 1, 2, 0x6a4a2a)
        } else if (L.icon === 'shield') lit(px, W, H, cx, cy, w * 0.4, h * 0.42, base, 0x3a2010)
        else if (L.icon === 'potion') {
          lit(px, W, H, cx, cy + 0.5, c * 0.32, c * 0.32, base)
          dot(px, W, H, cx, cy - c * 0.3, 0xe8e0d0)
        } else if (L.icon === 'bow') {
          line(px, W, H, cx + 1, sy + 1, cx - 1, cy, base)
          line(px, W, H, cx - 1, cy, cx + 1, sy + h - 1, base)
          line(px, W, H, cx + 1, sy + 1, cx + 1, sy + h - 1, 0xe8e8e8)
        } else if (L.icon === 'helm') {
          lit(px, W, H, cx, cy + 0.5, w * 0.35, h * 0.4, base, sh)
          rect(px, W, H, cx - 1, cy, 3, 1, 0x1a1a1a)
        } else if (L.icon === 'gem') {
          dot(px, W, H, cx, cy - 1, hi)
          rect(px, W, H, cx - 1, cy, 3, 1, base)
          dot(px, W, H, cx, cy + 1, sh)
        } else if (L.icon === 'scroll') {
          rect(px, W, H, sx + 1, cy - 1, w - 2, 3, base)
          rect(px, W, H, sx + 2, cy, w - 4, 1, 0xa08a60)
        } else {
          line(px, W, H, sx + 1, sy + h - 1, sx + 1, sy + 1, 0x8a5a30)
          slab(px, W, H, sx + 2, sy, c, c - 1, base)
        }
      }
      for (const it of items) {
        const k = it.k * it.k * (3 - 2 * it.k)
        const tx = ox + it.x * c
        const ty = oy + it.y * c
        icon(it, Math.round(it.px + (tx - it.px) * k), Math.round(it.py + (ty - it.py) * k))
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      let used = 0
      for (const g of grid) if (g >= 0) used++
      text(px, W, H, 1, 1, `${used}/${cols * rows}`, 0xe0c890)
    },
  }
}

export const FANTASY = {
  slimemerge,
  bossfight,
  forge,
  inventory,
}
