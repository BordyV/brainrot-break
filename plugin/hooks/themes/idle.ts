import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, hash, irand, lit, litSprite, ring, shuffle, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Idle, strategy & tycoon games: numbers that climb, armies that play themselves.

// --- factory automation -------------------------------------------------------------

const factory: Maker = (W, H, rng) => {
  const c = Math.max(2, Math.floor(W / 8))
  const cols = Math.floor(W / c)
  const rows = Math.floor((H - 7) / c)
  const oy = H - rows * c
  type Line = { y: number; ore: number; built: number; items: number[]; plates: number[] }
  let lines: Line[] = []
  let busItems: number[] = []
  let made = 0
  let t = 0
  let order: [number, number][] = []
  let fx: Spark[] = []
  const busX = cols - 1
  const chestY = rows - 2
  // each line: a miner (2 x 2), a belt, a furnace (2 x 2), then the bus down to the chest
  const reset = () => {
    const n = Math.max(1, Math.min(4, Math.floor((rows - 3) / 3)))
    lines = []
    for (let k = 0; k < n; k++) lines.push({ y: 1 + k * 3, ore: k % 2, built: 0, items: [], plates: [] })
    order = []
    for (let k = 0; k < n; k++) for (let s = 1; s <= 4; s++) order.push([k, s])
    shuffle(rng, order.slice(1))
    order.sort((a, b) => a[0] - b[0] || a[1] - b[1])
    busItems = []
    made = 0
    t = 0
  }
  reset()
  const beltStart = 2
  const furnaceX = cols - 4
  const beltLen = (furnaceX - beltStart) * c

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      // one new piece of the base every second
      const k = Math.floor(t / 15) - 1
      if (t % 15 === 0 && k >= 0 && k < order.length) {
        const [li, s] = order[k]
        lines[li].built = s
        const L = lines[li]
        const x = s === 1 ? 1 : s === 2 ? (beltStart + furnaceX) / 2 : s === 3 ? furnaceX + 1 : busX
        burst(fx, rng, x * c, (L.y + 1) * c + oy, 0xfff0a0, 6, 0.7)
      }
      const speed = 0.4
      for (const L of lines) {
        if (L.built >= 2 && t % 20 === 0) L.items.push(0)
        L.items = L.items.map(p => p + speed).filter(p => {
          if (p < beltLen) return true
          if (L.built >= 3) L.plates.push(0)
          return false
        })
        L.plates = L.plates.map(p => p + 1).filter(p => {
          if (p < 30) return true
          if (L.built >= 4) busItems.push((L.y + 1) * c)
          return false
        })
      }
      busItems = busItems.map(y => y + speed).filter(y => {
        if (y < chestY * c) return true
        made++
        return false
      })
      if (t > 600) reset()
    },
    draw(px) {
      // grass, then the ore patches on the left
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = hash(x >> 1, y >> 1, 4) < 0.2 ? 0x3a5a2e : 0x426634
      rect(px, W, H, 0, 0, W, oy, 0x1a1e24)
      const X = (cx: number) => cx * c
      const Y = (cy: number) => oy + cy * c
      for (const L of lines) {
        const oreC = L.ore ? 0xd8884a : 0x8aa0c0
        for (let y = Y(L.y - 1); y < Y(L.y + 3); y++) for (let x = 0; x < X(2) + 1; x++) if (hash(x, y, 9) < 0.35) dot(px, W, H, x, y, oreC)
        if (L.built >= 1) {
          slab(px, W, H, X(0), Y(L.y), 2 * c, 2 * c, 0x5a6a8a, 0x1a2030)
          const a = t * 0.3
          dot(px, W, H, X(1) + Math.cos(a) * (c * 0.5), Y(L.y + 1) + Math.sin(a) * (c * 0.5), 0xe8e8f0)
        }
        if (L.built >= 2) {
          // the belt, its chevrons sliding along
          for (let x = X(beltStart); x < X(furnaceX); x++)
            for (let y = Y(L.y) + 1; y < Y(L.y + 2) - 1; y++) px[y * W + x] = (x - Math.floor(t * 0.4)) % 4 === 0 ? 0x8a8a40 : 0x3a3a42
          for (const p of L.items) dot(px, W, H, X(beltStart) + p, Y(L.y + 1) - 0.5, oreC)
        }
        if (L.built >= 3) {
          slab(px, W, H, X(furnaceX), Y(L.y), 2 * c, 2 * c, 0x7a6a5a, 0x2a2018)
          const hot = L.items.length > 0
          rect(px, W, H, X(furnaceX) + c / 2, Y(L.y) + c, c, c / 2, hot && t % 6 < 4 ? 0xffb040 : 0x8a4020)
          for (let x = X(furnaceX + 2); x < X(busX); x++) px[(Y(L.y + 1) - 1) * W + x] = (x - Math.floor(t * 0.4)) % 4 === 0 ? 0x8a8a40 : 0x3a3a42
        }
      }
      if (lines.some(L => L.built >= 4)) {
        for (let y = Y(1); y < Y(chestY); y++)
          for (let x = X(busX); x < X(busX) + c; x++) px[y * W + x] = (y - Math.floor(t * 0.4)) % 4 === 0 ? 0x8a8a40 : 0x3a3a42
        for (const y of busItems) dot(px, W, H, X(busX) + c / 2, oy + y, 0xe0e4ec)
        slab(px, W, H, X(busX - 1), Y(chestY), 2 * c, 2 * c, 0xa8783a, 0x4a2a10)
        rect(px, W, H, X(busX - 1), Y(chestY) + c - 1, 2 * c, 1, 0x5a3a18)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(made), 0xffffff)
    },
  }
}

// --- idle mine ----------------------------------------------------------------------

const idlemine: Maker = (W, H, rng) => {
  const surface = 12
  const lh = Math.max(4, Math.floor((H - surface - 2) / 6))
  const levels = Math.max(1, Math.floor((H - surface - 2) / lh))
  const shaftX = Math.round(W * 0.62)
  let open = 1
  let cash = 0
  let piles: number[] = []
  let lift = { y: surface, load: 0, dir: 1, target: 0 }
  let t = 0
  let fx: Spark[] = []
  const cost = (n: number) => Math.round(25 * 2.2 ** n)
  const reset = () => {
    open = 1
    cash = 0
    piles = new Array(levels).fill(0)
    lift = { y: surface, load: 0, dir: 1, target: 0 }
    t = 0
  }
  reset()
  const levelY = (k: number) => surface + 2 + k * lh

  return {
    step() {
      t++
      fx = sparks(fx, 0.06)
      // the miners: deeper levels dig more each swing
      for (let k = 0; k < open; k++) if (t % 6 === k % 6) piles[k] += 4 + k * 6
      // the lift goes down to every open level and brings it all up
      const goal = lift.dir > 0 ? levelY(lift.target) + lh - 3 : surface
      lift.y += clamp(goal - lift.y, -1, 1)
      if (Math.abs(lift.y - goal) < 0.5) {
        if (lift.dir > 0) {
          lift.load += piles[lift.target]
          piles[lift.target] = 0
          if (lift.target < open - 1) lift.target++
          else lift.dir = -1
        } else {
          if (lift.load) {
            cash += lift.load
            fx.push({ x: shaftX, y: surface - 3, vx: 0, vy: -0.4, l: 14, c: 0xffe060 })
          }
          lift.load = 0
          lift.dir = 1
          lift.target = 0
        }
      }
      // buy the next level as soon as there is the cash
      if (open < levels && cash >= cost(open)) {
        cash -= cost(open)
        open++
        burst(fx, rng, W * 0.3, levelY(open - 1) + lh / 2, 0xffe080, 12, 1)
      }
      if (open >= levels && t > 480) reset()
    },
    draw(px) {
      sky(px, W, H, 0x6ab0f0, 0xb8e0f8, surface)
      rect(px, W, H, 0, surface - 1, W, 1, 0x5aa040)
      for (let y = surface; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x6a4a2e, 0x2e1e14, (y - surface) / (H - surface))
      // the warehouse up top
      slab(px, W, H, W - 9, surface - 6, 8, 5, 0xc8a060, 0x5a3a18)
      for (let k = 0; k < 3; k++) rect(px, W, H, W - 10 + k, surface - 7 - k, 10 - 2 * k, 1, 0xa83a2a)
      // the shaft and its frame
      rect(px, W, H, shaftX - 2, surface - 4, 5, 1, 0x6a5a48)
      rect(px, W, H, shaftX - 2, surface - 4, 1, H, 0x4a3a2a)
      rect(px, W, H, shaftX + 2, surface - 4, 1, H, 0x4a3a2a)
      for (let y = surface; y < H; y++) for (let x = shaftX - 1; x <= shaftX + 1; x++) px[y * W + x] = 0x1a120c
      for (let k = 0; k < levels; k++) {
        const y = levelY(k)
        if (k >= open) {
          // a locked level: rock with a price tag
          if (k === open) text(px, W, H, 2, y + 1 - (lh < 6 ? 1 : 0), String(cost(k)).slice(0, 4), 0x8a7a6a)
          continue
        }
        const ore = hsv(0.12 - k * 0.1, 0.6, 0.95)
        rect(px, W, H, 1, y, shaftX - 3, lh - 1, 0x22160e)
        rect(px, W, H, 1, y + lh - 2, shaftX - 3, 1, 0x5a4030)
        for (let x = 0; x < 2; x++) for (let yy = y; yy < y + lh - 1; yy++) if (hash(x, yy, k) < 0.6) dot(px, W, H, x, yy, ore)
        // the miner swings at the wall
        const swing = (t + k * 3) % 12 < 6
        const mx = 3
        rect(px, W, H, mx, y + lh - 4, 2, 2, 0x3a6ab0)
        dot(px, W, H, mx, y + lh - 5, 0xf0c090)
        dot(px, W, H, mx + 1, y + lh - 5, 0xf0d040)
        dot(px, W, H, swing ? mx - 1 : mx - 1, swing ? y + lh - 6 : y + lh - 4, 0xb0b0b8)
        // the pile by the shaft
        const p = Math.min(5, Math.ceil(piles[k] / 6))
        for (let i = 0; i < p; i++) dot(px, W, H, shaftX - 3 - (i % 3), y + lh - 3 - Math.floor(i / 3), ore)
      }
      slab(px, W, H, shaftX - 1, lift.y - 2, 3, 3, 0xa0a8b8, 0x3a4050)
      if (lift.load) dot(px, W, H, shaftX, lift.y - 1, 0xffd040)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(cash), 0xffffff)
    },
  }
}

// --- auto battler -------------------------------------------------------------------

const autobattler: Maker = (W, H, rng) => {
  const top = 9
  const bottom = H - 3
  type Unit = { x: number; y: number; team: 0 | 1; hp: number; max: number; ranged: boolean; cd: number; hue: number }
  let units: Unit[] = []
  let arrows: { x: number; y: number; tx: number; ty: number; team: number }[] = []
  let score = [0, 0]
  let pause = 30
  let fx: Spark[] = []
  let t = 0
  const round = () => {
    units = []
    for (const team of [0, 1] as const)
      for (let k = 0; k < 5; k++) {
        const ranged = rng() < 0.4
        const x = 4 + ((k * (W - 8)) / 4) + (rng() - 0.5) * 2
        const y = team ? top + 4 + (ranged ? 0 : 6) : bottom - 4 - (ranged ? 0 : 6)
        const max = ranged ? 6 : 12
        units.push({ x, y, team, hp: max, max, ranged, cd: irand(rng, 20), hue: team ? 0.0 : 0.6 })
      }
    arrows = []
    pause = 30
  }
  round()

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (pause > 0) {
        pause--
        return
      }
      for (const u of units) {
        if (u.hp <= 0) continue
        let best: Unit | null = null
        let bd = Infinity
        for (const v of units) {
          if (v.team === u.team || v.hp <= 0) continue
          const d = Math.hypot(v.x - u.x, v.y - u.y)
          if (d < bd) {
            bd = d
            best = v
          }
        }
        if (!best) continue
        const reach = u.ranged ? 14 : 4.5
        if (bd > reach) {
          u.x += ((best.x - u.x) / bd) * 0.35
          u.y += ((best.y - u.y) / bd) * 0.35
        } else if (--u.cd <= 0) {
          u.cd = u.ranged ? 22 : 14
          if (u.ranged) arrows.push({ x: u.x, y: u.y, tx: best.x, ty: best.y, team: u.team })
          else {
            best.hp -= 2 + irand(rng, 2)
            fx.push({ x: best.x, y: best.y - 1, vx: (rng() - 0.5) * 0.6, vy: -0.5, l: 8, c: 0xffffff })
          }
        }
      }
      // units keep a little apart
      for (const a of units)
        for (const b of units) {
          if (a === b || a.hp <= 0 || b.hp <= 0) continue
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 3.5 && d > 0) {
            a.x += ((a.x - b.x) / d) * 0.2
            a.y += ((a.y - b.y) / d) * 0.2
          }
        }
      arrows = arrows.filter(r => {
        const d = Math.hypot(r.tx - r.x, r.ty - r.y)
        if (d < 1.2) {
          for (const v of units) if (v.team !== r.team && v.hp > 0 && Math.hypot(v.x - r.x, v.y - r.y) < 3) {
            v.hp -= 2
            break
          }
          return false
        }
        r.x += ((r.tx - r.x) / d) * 1.2
        r.y += ((r.ty - r.y) / d) * 1.2
        return true
      })
      for (const u of units)
        if (u.hp <= 0 && u.max > 0) {
          burst(fx, rng, u.x, u.y, u.team ? 0xff6050 : 0x50a0ff, 8, 0.8)
          u.max = 0
        }
      const alive = [0, 1].map(team => units.some(u => u.team === team && u.hp > 0))
      if (!alive[0] || !alive[1]) {
        score[alive[0] ? 0 : 1]++
        if (score[0] + score[1] >= 5) score = [0, 0]
        round()
      }
    },
    draw(px) {
      // the board: a chequered arena, each team's half a little tinted
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const sq = (Math.floor(x / 4) + Math.floor((y - top) / 4)) % 2
          px[y * W + x] = y < top ? 0x1a1a24 : mix(sq ? 0x5a7a4a : 0x6a8a56, y < (top + bottom) / 2 ? 0x8a3a3a : 0x3a4a8a, 0.15)
        }
      for (const u of units) {
        if (u.hp <= 0) continue
        const col = u.team ? 0xd84a3a : 0x3a7ad8
        const x = Math.round(u.x)
        const y = Math.round(u.y)
        rect(px, W, H, x - 1, y + 2, 3, 1, 0x3a4a2a)
        if (u.ranged) lit(px, W, H, x, y, 1.6, 1.9, col, tones(col)[3])
        else slab(px, W, H, x - 1.5, y - 1.5, 4, 4, col, tones(col)[3])
        dot(px, W, H, x, y - (u.ranged ? 0 : 0), 0xffffff)
        // the health bar
        rect(px, W, H, x - 2, y - 4, 4, 1, 0x2a1a1a)
        rect(px, W, H, x - 2, y - 4, Math.max(1, Math.round((4 * u.hp) / u.max)), 1, 0x60e060)
      }
      for (const r of arrows) dot(px, W, H, r.x, r.y, 0xffe080)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(score[0]), 0x6aa0ff)
      text(px, W, H, W - 4, 1, String(score[1]), 0xff7060)
      text(px, W, H, W / 2 - 1, 1, '-', 0xb0b0b0)
    },
  }
}

// --- merge army ---------------------------------------------------------------------

const mergearmy: Maker = (W, H, rng) => {
  const cols = 3
  const rows = 3
  const cs = Math.max(4, Math.floor((W - 4) / cols))
  const gx = Math.floor((W - cols * cs) / 2)
  const gy = H - rows * cs - 3
  let grid: number[] = []
  let move: { from: number; to: number; k: number } | null = null
  let phase: 'merge' | 'march' | 'fight' | 'end' = 'merge'
  let t = 0
  let stage = 1
  let army: { x: number; y: number; lv: number; hp: number }[] = []
  let boss = { hp: 0, max: 0, y: 12 }
  let won = false
  let fx: Spark[] = []
  const start = () => {
    grid = new Array(cols * rows).fill(0)
    phase = 'merge'
    t = 0
    move = null
  }
  start()
  const cell = (i: number): [number, number] => [gx + (i % cols) * cs + cs / 2, gy + Math.floor(i / cols) * cs + cs / 2]
  const soldier = (px: Uint32Array, x: number, y: number, lv: number) => {
    const s = 1 + Math.min(3, lv) * 0.5
    const col = hsv(0.6 - lv * 0.1, 0.6, 0.95)
    lit(px, W, H, x, y + s * 0.6, s, s * 0.9, col, tones(col)[3])
    lit(px, W, H, x, y - s * 0.9, s * 0.7, s * 0.7, 0xf0c8a0, 0x6a4a30)
    if (lv >= 3) rect(px, W, H, x - 1, y - s * 1.7, 3, 1, 0xffd040)
  }

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (phase === 'merge') {
        if (move) {
          move.k += 0.12
          if (move.k >= 1) {
            grid[move.to]++
            grid[move.from] = 0
            const [x, y] = cell(move.to)
            burst(fx, rng, x, y, 0xfff0a0, 8, 0.9)
            move = null
          }
        } else if (t % 8 === 0) {
          // buy a soldier, or merge two of a level
          const pairs: [number, number][] = []
          for (let a = 0; a < grid.length; a++) for (let b = a + 1; b < grid.length; b++) if (grid[a] && grid[a] === grid[b]) pairs.push([a, b])
          const empty = grid.map((v, i) => (v ? -1 : i)).filter(i => i >= 0)
          if (pairs.length && (rng() < 0.6 || !empty.length)) {
            const [a, b] = pairs[irand(rng, pairs.length)]
            move = { from: a, to: b, k: 0 }
          } else if (empty.length) grid[empty[irand(rng, empty.length)]] = 1
        }
        if (t > 140 && !move) {
          phase = 'march'
          t = 0
          army = grid.map((lv, i) => ({ lv, i })).filter(s => s.lv).map(s => {
            const [x, y] = cell(s.i)
            return { x, y, lv: s.lv, hp: 2 ** s.lv }
          })
          boss = { hp: 20 * stage + 10, max: 20 * stage + 10, y: 12 }
        }
      } else if (phase === 'march') {
        for (const s of army) s.y -= 0.6
        if (army.every(s => s.y < H * 0.45) || t > 60) {
          phase = 'fight'
          t = 0
        }
      } else if (phase === 'fight') {
        for (const s of army) {
          if (s.hp <= 0) continue
          s.y += (boss.y + 8 - s.y) * 0.05
          if (t % 10 === 0) {
            boss.hp -= s.lv
            fx.push({ x: W / 2 + (rng() - 0.5) * 8, y: boss.y + 3, vx: (rng() - 0.5), vy: -0.6, l: 8, c: 0xffffff })
          }
        }
        if (t % 18 === 0) {
          const live = army.filter(s => s.hp > 0)
          if (live.length) {
            const s = live[irand(rng, live.length)]
            s.hp -= stage * 2
            if (s.hp <= 0) burst(fx, rng, s.x, s.y, 0x80a0ff, 6, 0.7)
          }
        }
        if (boss.hp <= 0 || army.every(s => s.hp <= 0)) {
          won = boss.hp <= 0
          if (won) for (let k = 0; k < 3; k++) burst(fx, rng, W / 2, boss.y, 0xff6050, 12, 1.3)
          phase = 'end'
          t = 0
        }
      } else if (phase === 'end' && t > 40) {
        stage = won ? stage + 1 : 1
        if (stage > 4) stage = 1
        start()
      }
    },
    draw(px) {
      sky(px, W, H, 0x5aa0e0, 0xa8d8f0, Math.round(H * 0.35))
      for (let y = Math.round(H * 0.35); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y) % 6 === 0 ? 0x5a9a44 : 0x64a84a
      // the boss: a big red ogre with its health bar
      if (phase !== 'merge' && (boss.hp > 0 || phase !== 'end')) {
        const hit = phase === 'fight' && t % 10 < 2
        lit(px, W, H, W / 2, boss.y + 2, 6, 6, hit ? 0xffffff : 0xc83a3a, 0x4a0a0a)
        dot(px, W, H, W / 2 - 2, boss.y, 0xffe040)
        dot(px, W, H, W / 2 + 2, boss.y, 0xffe040)
        rect(px, W, H, W / 2 - 2, boss.y + 4, 5, 1, 0x3a0a0a)
        rect(px, W, H, 4, 3, W - 8, 2, 0x3a1a1a)
        rect(px, W, H, 4, 3, Math.max(0, Math.round(((W - 8) * boss.hp) / Math.max(1, boss.max))), 2, 0xe84a3a)
      }
      if (phase === 'merge') {
        for (let i = 0; i < grid.length; i++) {
          const [x, y] = cell(i)
          slab(px, W, H, x - cs / 2 + 0.5, y - cs / 2 + 0.5, cs - 1, cs - 1, 0x8ac070, 0x3a6a2a)
          if (grid[i] && !(move && move.from === i)) {
            soldier(px, x, y, grid[i])
            text(px, W, H, x + cs / 2 - 4, y + cs / 2 - 6, String(grid[i]), 0xffffff)
          }
        }
        if (move) {
          const [x0, y0] = cell(move.from)
          const [x1, y1] = cell(move.to)
          soldier(px, x0 + (x1 - x0) * move.k, y0 + (y1 - y0) * move.k - Math.sin(move.k * Math.PI) * 4, grid[move.from])
        }
      } else for (const s of army) if (s.hp > 0) soldier(px, s.x, s.y, s.lv)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, H - 6 > gy ? 7 : 7, String(stage), 0xffffff)
    },
  }
}

// --- horde survivor -----------------------------------------------------------------

const HERO = ['.hh.', 'hffh', '.bb.', 'b..b']

const horde: Maker = (W, H, rng) => {
  type Foe = { x: number; y: number; hp: number; hue: number; flash: number }
  let foes: Foe[] = []
  let gems: { x: number; y: number }[] = []
  let x = W / 2
  let y = H / 2
  let t = 0
  let kills = 0
  let level = 1
  let xp = 0
  let nova = 0
  let fx: Spark[] = []
  const reset = () => {
    foes = []
    gems = []
    x = W / 2
    y = H / 2
    t = 0
    kills = 0
    level = 1
    xp = 0
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.04)
      // more of them every second
      const rate = Math.max(2, 10 - Math.floor(t / 60))
      if (t % rate === 0) {
        const a = rng() * Math.PI * 2
        const r = Math.hypot(W, H) / 2 + 2
        foes.push({ x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r, hp: 1 + Math.floor(t / 300), hue: rng() < 0.8 ? 0.78 : 0.0, flash: 0 })
      }
      // the hero drifts away from the thickest crowd
      let ax = 0
      let ay = 0
      for (const f of foes) {
        const d = Math.hypot(f.x - x, f.y - y) || 1
        if (d < 10) {
          ax -= (f.x - x) / d / d
          ay -= (f.y - y) / d / d
        }
      }
      x = clamp(x + clamp(ax * 2, -0.4, 0.4) + (W / 2 - x) * 0.01, 4, W - 4)
      y = clamp(y + clamp(ay * 2, -0.4, 0.4) + (H / 2 - y) * 0.01, 10, H - 6)
      for (const f of foes) {
        const d = Math.hypot(x - f.x, y - f.y) || 1
        f.x += ((x - f.x) / d) * 0.3
        f.y += ((y - f.y) / d) * 0.3
        if (f.flash) f.flash--
      }
      // the orbiting blades, one more per level
      const orbs = Math.min(5, 1 + level)
      for (let k = 0; k < orbs; k++) {
        const a = t * 0.15 + (k / orbs) * Math.PI * 2
        const ox = x + Math.cos(a) * 7
        const oy = y + Math.sin(a) * 7
        for (const f of foes)
          if (f.hp > 0 && !f.flash && Math.hypot(f.x - ox, f.y - oy) < 2.5) {
            f.hp--
            f.flash = 6
          }
      }
      // and a nova every few seconds
      if (t % 70 === 0) nova = 1
      if (nova) {
        nova++
        for (const f of foes) if (f.hp > 0 && Math.abs(Math.hypot(f.x - x, f.y - y) - nova * 0.9) < 1.2) f.hp = 0
        if (nova > 16) nova = 0
      }
      foes = foes.filter(f => {
        if (f.hp > 0) return true
        kills++
        gems.push({ x: f.x, y: f.y })
        fx.push({ x: f.x, y: f.y, vx: 0, vy: -0.3, l: 8, c: 0xffffff })
        return false
      })
      gems = gems.filter(g => {
        const d = Math.hypot(g.x - x, g.y - y)
        if (d < 9) {
          g.x += (x - g.x) * 0.25
          g.y += (y - g.y) * 0.25
        }
        if (d < 1.5) {
          if (++xp >= level * 6) {
            xp = 0
            level++
            for (let k = 0; k < 2; k++) burst(fx, rng, x, y, 0xffe060, 12, 1.2)
          }
          return false
        }
        return true
      })
      if (t > 520) reset()
    },
    draw(px) {
      // a dark field with stones and grass tufts
      for (let yy = 0; yy < H; yy++)
        for (let xx = 0; xx < W; xx++) {
          const h = hash(xx >> 1, yy >> 1, 6)
          px[yy * W + xx] = h < 0.05 ? 0x3a4a30 : h < 0.08 ? 0x4a4a4a : 0x24301e
        }
      if (nova) ring(px, W, H, x, y, nova * 0.9, 0xc0e0ff)
      for (const g of gems) {
        dot(px, W, H, g.x, g.y, 0x50c0ff)
        dot(px, W, H, g.x, g.y - 1, 0xb0f0ff)
      }
      for (const f of foes) {
        const col = f.flash ? 0xffffff : hsv(f.hue, 0.55, 0.75)
        rect(px, W, H, f.x - 1, f.y - 1, 3, 2, col)
        dot(px, W, H, f.x - 1, f.y - 2, col)
        dot(px, W, H, f.x + 1, f.y - 2, col)
        dot(px, W, H, f.x, f.y - 1, 0xff4040)
      }
      litSprite(px, W, H, Math.round(x - 2), Math.round(y - 2), HERO, { h: 0xe8c040, f: 0xf0c8a0, b: 0x4a7ae0 })
      const orbs = Math.min(5, 1 + level)
      for (let k = 0; k < orbs; k++) {
        const a = t * 0.15 + (k / orbs) * Math.PI * 2
        const ox = x + Math.cos(a) * 7
        const oy = y + Math.sin(a) * 7
        dot(px, W, H, ox, oy, 0xfff0a0)
        tint(px, W, H, ox + 1, oy, 0xff9030, 0.6)
        tint(px, W, H, ox, oy + 1, 0xff9030, 0.6)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      // the xp bar and the kill count
      rect(px, W, H, 0, 0, W, 2, 0x1a1a28)
      rect(px, W, H, 0, 0, Math.round((W * xp) / (level * 6)), 2, 0x50c0ff)
      text(px, W, H, 1, 3, String(kills), 0xffffff)
      const lv = String(level)
      text(px, W, H, W - 1 - textWidth(lv), 3, lv, 0xffe060)
    },
  }
}

export const IDLE = {
  factory,
  idlemine,
  autobattler,
  mergearmy,
  horde,
}
