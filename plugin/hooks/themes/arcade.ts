import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, clamp, irand, line, lit, litSprite, pick, ring, rot, shuffle, slab, textWidth } from '../kit'

// Retro arcade: classic games, drawn with original sprites and played by bots.

type Boom = { x: number; y: number; l: number; c: number }
function booms(list: Boom[]): Boom[] {
  for (const b of list) b.l--
  return list.filter(b => b.l > 0)
}
function drawBoom(px: Uint32Array, W: number, H: number, b: Boom) {
  const r = (12 - b.l) * 0.35
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2
    dot(px, W, H, b.x + Math.cos(a) * r, b.y + Math.sin(a) * r, b.l > 6 ? 0xffffff : b.c)
  }
}

// --- space invaders ---------------------------------------------------------------

const invaders: Maker = (W, H, rng) => {
  const FR = [
    ['.x...x.', '..xxx..', '.xxxxx.', 'xx.x.xx', 'x.....x'],
    ['.x...x.', 'x.xxx.x', 'xxxxxxx', '.x.x.x.', 'x.....x'],
  ]
  const SHIP = ['...x...', '.xxxxx.', 'xxxxxxx']
  const ROWC = [0xff5ae0, 0x5ae0ff, 0x5aff8a, 0xffe05a]
  const cols = Math.max(2, Math.floor((W - 6) / 8))
  const rows = 4
  const shieldY = H - 13
  let alive: boolean[] = []
  let fx = 0
  let fy = 0
  let dir = 1
  let tick = 0
  let frame = 0
  let px0 = W / 2
  let shot: { x: number; y: number } | undefined
  let bombs: { x: number; y: number }[] = []
  let shields = new Uint8Array(W * 4)
  let fx2: Boom[] = []
  let score = 0
  let lives = 3
  let dead = 0
  let ufo = -20

  function wave() {
    alive = Array(cols * rows).fill(true)
    fx = 1
    fy = 6
    dir = 1
    bombs = []
  }
  function newGame() {
    score = 0
    lives = 3
    shields = new Uint8Array(W * 4)
    const n = Math.max(1, Math.floor(W / 11))
    for (let k = 0; k < n; k++) {
      const cx = Math.round(((k + 0.5) * W) / n)
      for (let y = 0; y < 4; y++) for (let x = -2; x <= 2; x++) if (!(y === 3 && Math.abs(x) < 1) && !(y === 0 && Math.abs(x) === 2)) shields[y * W + cx + x] = 1
    }
    wave()
  }
  newGame()
  const ax = (i: number) => fx + (i % cols) * 8
  const ay = (i: number) => fy + Math.floor(i / cols) * 6

  return {
    step() {
      frame++
      fx2 = booms(fx2)
      if (dead > 0) {
        if (--dead === 0 && lives === 0) newGame()
        return
      }
      const n = alive.filter(Boolean).length
      if (n === 0) {
        wave()
        return
      }
      if (++tick >= 2 + Math.floor(n / 2)) {
        tick = 0
        let edge = false
        alive.forEach((a, i) => {
          if (a && (ax(i) + dir < 0 || ax(i) + 7 + dir > W)) edge = true
        })
        if (edge) {
          dir = -dir
          fy += 2
        } else fx += dir
      }
      if (ufo > -20) ufo -= 0.5
      else if (rng() < 0.003) ufo = W + 8
      if (rng() < 0.025 + 0.002 * (cols * rows - n)) {
        const shooters = alive.map((a, i) => (a ? i : -1)).filter(i => i >= 0 && !alive.some((b, j) => b && j % cols === i % cols && j > i))
        const s = shooters[irand(rng, shooters.length)]
        if (s !== undefined) bombs.push({ x: ax(s) + 3, y: ay(s) + 5 })
      }
      // the bot: under the nearest column, out of the way of bombs
      let target = px0
      let best = Infinity
      alive.forEach((a, i) => {
        if (!a) return
        const d = Math.abs(ax(i) + 3 + dir * 2 - px0) - Math.floor(i / cols) * 0.5
        if (d < best) {
          best = d
          target = ax(i) + 3 + dir * 2
        }
      })
      const danger = bombs.find(b => b.y > H - 22 && Math.abs(b.x - px0) < 4)
      if (danger) target = px0 + (danger.x < px0 ? 6 : -6)
      px0 = clamp(px0 + clamp(target - px0, -0.7, 0.7), 3, W - 4)
      if (!shot && Math.abs(target - px0) < 2 && !danger) shot = { x: Math.round(px0), y: H - 7 }
      if (shot) {
        shot.y -= 2
        const sx = shot.x
        const sy = shot.y
        const si = (sy - shieldY) * W + sx
        if (sy >= shieldY && sy < shieldY + 4 && shields[si]) {
          shields[si] = 0
          shot = undefined
        } else if (ufo > -20 && sy < 5 && Math.abs(sx - ufo - 3) < 4) {
          score += 300
          fx2.push({ x: ufo + 3, y: 2, l: 12, c: 0xff4040 })
          ufo = -20
          shot = undefined
        } else if (sy < 0) shot = undefined
        else {
          const hit = alive.findIndex((a, i) => a && sx >= ax(i) && sx < ax(i) + 7 && sy >= ay(i) && sy < ay(i) + 5)
          if (hit >= 0) {
            alive[hit] = false
            score += (rows - Math.floor(hit / cols)) * 10
            fx2.push({ x: ax(hit) + 3, y: ay(hit) + 2, l: 12, c: ROWC[Math.floor(hit / cols)] as number })
            shot = undefined
          }
        }
      }
      for (const b of bombs) b.y += 0.8
      bombs = bombs.filter(b => {
        const si = (Math.round(b.y) - shieldY) * W + Math.round(b.x)
        if (b.y >= shieldY && b.y < shieldY + 4 && shields[si]) {
          shields[si] = 0
          if (si + W < shields.length) shields[si + W] = 0
          return false
        }
        if (b.y > H - 7 && b.y < H - 3 && Math.abs(b.x - px0) < 3.5) {
          fx2.push({ x: px0, y: H - 5, l: 12, c: 0x5aff8a })
          lives--
          dead = 40
          return false
        }
        return b.y < H
      })
      if (alive.some((a, i) => a && ay(i) + 5 >= shieldY)) {
        lives = 0
        dead = 40
      }
    },
    draw(px) {
      px.fill(0x05050c)
      for (let i = 0; i < 12; i++) dot(px, W, H, (i * 37) % W, (i * 23) % H, 0x2a2a44)
      const f = FR[Math.floor(frame / 15) % 2] as string[]
      alive.forEach((a, i) => {
        if (a) sprite(px, W, H, ax(i), ay(i), f, { x: ROWC[Math.floor(i / cols)] as number })
      })
      if (ufo > -20) sprite(px, W, H, ufo, 1, ['..xxx..', '.xxxxx.', 'x.x.x.x'], { x: 0xff4040 })
      for (let y = 0; y < 4; y++) for (let x = 0; x < W; x++) if (shields[y * W + x]) dot(px, W, H, x, shieldY + y, 0x3ad04a)
      if (!dead || dead % 6 < 3) sprite(px, W, H, px0 - 3, H - 6, SHIP, { x: 0x5aff8a })
      if (shot) rect(px, W, H, shot.x, shot.y, 1, 2, 0xffffff)
      for (const b of bombs) dot(px, W, H, b.x + ((frame >> 1) % 2), b.y, 0xffe05a)
      for (const b of fx2) drawBoom(px, W, H, b)
      text(px, W, H, 1, 0, String(score), 0xffffff)
      for (let i = 0; i < lives; i++) dot(px, W, H, W - 2 - i * 2, 1, 0x5aff8a)
    },
  }
}

// --- asteroids --------------------------------------------------------------------

const asteroids: Maker = (W, H, rng) => {
  type Rock = { x: number; y: number; vx: number; vy: number; s: number; shape: number[]; a: number; w: number }
  const RAD = [0, 1.6, 3, 4.6]
  let rocks: Rock[] = []
  let ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 }
  let bullets: { x: number; y: number; vx: number; vy: number; l: number }[] = []
  let debris: Boom[] = []
  let cool = 0
  let dead = 0
  let thrust = 0
  let score = 0
  let lives = 3

  const rock = (x: number, y: number, s: number): Rock => {
    const a = rng() * Math.PI * 2
    const v = 0.15 + rng() * 0.25 + (3 - s) * 0.1
    return { x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, s, shape: Array.from({ length: 8 }, () => 0.7 + rng() * 0.4), a: 0, w: (rng() - 0.5) * 0.05 }
  }
  function wave() {
    rocks = []
    for (let i = 0; i < 4; i++) rocks.push(rock(i % 2 ? 0 : W - 1, rng() * H, 3))
  }
  wave()
  const wrap = (o: { x: number; y: number }) => {
    o.x = ((o.x % W) + W) % W
    o.y = ((o.y % H) + H) % H
  }
  const delta = (a: number, b: number, m: number) => {
    let d = b - a
    if (d > m / 2) d -= m
    if (d < -m / 2) d += m
    return d
  }

  return {
    step() {
      debris = booms(debris)
      for (const r of rocks) {
        r.x += r.vx
        r.y += r.vy
        r.a += r.w
        wrap(r)
      }
      for (const b of bullets) {
        b.x += b.vx
        b.y += b.vy
        b.l--
        wrap(b)
      }
      bullets = bullets.filter(b => b.l > 0)
      if (dead > 0) {
        if (--dead === 0) {
          if (lives === 0) {
            lives = 3
            score = 0
            wave()
          }
          ship = { x: W / 2, y: H / 2, a: -Math.PI / 2, vx: 0, vy: 0 }
        }
        return
      }
      // the bot: turn towards where the nearest rock will be, fire, dodge
      let near: Rock | undefined
      let nd = Infinity
      for (const r of rocks) {
        const d = Math.hypot(delta(ship.x, r.x, W), delta(ship.y, r.y, H))
        if (d < nd) {
          nd = d
          near = r
        }
      }
      thrust = 0
      if (near) {
        const tt = nd / 1.6
        const want = Math.atan2(delta(ship.y, near.y + near.vy * tt, H), delta(ship.x, near.x + near.vx * tt, W))
        let da = want - ship.a
        da = Math.atan2(Math.sin(da), Math.cos(da))
        ship.a += clamp(da, -0.12, 0.12)
        if (--cool <= 0 && Math.abs(da) < 0.2) {
          bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.a) * 1.6, vy: Math.sin(ship.a) * 1.6, l: 26 })
          cool = 7
        }
        if (nd < RAD[near.s]! + 6) {
          ship.vx -= Math.cos(ship.a) * 0.06
          ship.vy -= Math.sin(ship.a) * 0.06
          thrust = 1
        }
      }
      ship.vx *= 0.97
      ship.vy *= 0.97
      ship.x += ship.vx
      ship.y += ship.vy
      wrap(ship)
      const born: Rock[] = []
      rocks = rocks.filter(r => {
        const hit = bullets.find(b => Math.hypot(delta(b.x, r.x, W), delta(b.y, r.y, H)) < RAD[r.s]! + 0.5)
        if (!hit) return true
        hit.l = 0
        score += [0, 100, 50, 20][r.s] as number
        debris.push({ x: r.x, y: r.y, l: 12, c: 0xc8c8d0 })
        if (r.s > 1) born.push(rock(r.x, r.y, r.s - 1), rock(r.x, r.y, r.s - 1))
        return false
      })
      rocks.push(...born)
      if (rocks.some(r => Math.hypot(delta(ship.x, r.x, W), delta(ship.y, r.y, H)) < RAD[r.s]! + 1)) {
        debris.push({ x: ship.x, y: ship.y, l: 12, c: 0xffffff })
        lives--
        dead = 45
      }
      if (!rocks.length) wave()
    },
    draw(px) {
      px.fill(0x000006)
      for (let i = 0; i < 14; i++) dot(px, W, H, (i * 41) % W, (i * 29 + 7) % H, 0x22223a)
      for (const r of rocks) {
        const R = RAD[r.s] as number
        for (let k = 0; k < 8; k++) {
          const a0 = r.a + (k / 8) * Math.PI * 2
          const a1 = r.a + ((k + 1) / 8) * Math.PI * 2
          const r0 = R * (r.shape[k] as number)
          const r1 = R * (r.shape[(k + 1) % 8] as number)
          line(px, W, H, r.x + Math.cos(a0) * r0, r.y + Math.sin(a0) * r0, r.x + Math.cos(a1) * r1, r.y + Math.sin(a1) * r1, 0xd0d0d8)
        }
      }
      for (const b of bullets) dot(px, W, H, b.x, b.y, 0xffffff)
      if (!dead) {
        const c = Math.cos(ship.a)
        const s = Math.sin(ship.a)
        const p = (f: number, g: number): [number, number] => [ship.x + c * f - s * g, ship.y + s * f + c * g]
        const [nx, ny] = p(3, 0)
        const [lx, ly] = p(-2, -2)
        const [rx, ry] = p(-2, 2)
        line(px, W, H, nx, ny, lx, ly, 0xffffff)
        line(px, W, H, nx, ny, rx, ry, 0xffffff)
        line(px, W, H, lx, ly, rx, ry, 0xffffff)
        if (thrust) {
          const [fx, fy] = p(-4, 0)
          dot(px, W, H, fx, fy, 0xffa030)
        }
      }
      for (const d of debris) drawBoom(px, W, H, d)
      text(px, W, H, 1, 0, String(score), 0xffffff)
      for (let i = 0; i < lives; i++) dot(px, W, H, W - 2 - i * 2, 1, 0xffffff)
    },
  }
}

// --- frogger ----------------------------------------------------------------------

const frogger: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.floor(W / cs)
  const rows = Math.max(9, Math.floor((H - 5) / cs))
  const oy = H - rows * cs
  const river = Math.floor((rows - 3) / 2)
  // rows: 0 goal, 1..river river, river+1 median, then road, last start
  const roadA = river + 2
  type Lane = { v: number; len: number; gap: number; off: number; kind: 'log' | 'turtle' | 'car' | 'truck'; c: number }
  const lanes: (Lane | undefined)[] = []
  for (let r = 0; r < rows; r++) {
    if (r >= 1 && r <= river) {
      const turtle = r % 2 === 0
      lanes.push({ v: (0.15 + rng() * 0.25) * (r % 2 ? 1 : -1), len: turtle ? 2 : 3 + irand(rng, 2), gap: 2 + irand(rng, 3), off: rng() * 20, kind: turtle ? 'turtle' : 'log', c: 0 })
    } else if (r >= roadA && r < rows - 1) {
      const truck = rng() < 0.3
      lanes.push({ v: (0.2 + rng() * 0.35) * (r % 2 ? -1 : 1), len: truck ? 3 : 1.5, gap: 3 + irand(rng, 3), off: rng() * 20, kind: truck ? 'truck' : 'car', c: hsv(rng(), 0.7, 1) })
    } else lanes.push(undefined)
  }
  const slots = Math.max(2, Math.floor(cols / 2))
  const slotX = (k: number) => Math.round(((k + 0.5) * W) / slots)
  let filled: boolean[] = Array(slots).fill(false)
  let t = 0
  let fx = W / 2
  let fr = rows - 1
  let hop = 0
  let from: [number, number] = [0, 0]
  let to: [number, number] = [0, 0]
  let dead = 0
  let saved = 0

  const period = (l: Lane) => (l.len + l.gap) * cs
  const objects = (r: number, time: number): [number, number][] => {
    const l = lanes[r]
    if (!l) return []
    const p = period(l)
    const out: [number, number][] = []
    const shift = (((l.off * cs + l.v * time) % p) + p) % p
    for (let x = shift - p; x < W + p; x += p) out.push([x, x + l.len * cs])
    return out
  }
  const onObject = (r: number, x: number, time: number, margin: number) => objects(r, time).some(([a, b]) => x >= a + margin && x <= b - margin)
  const safe = (r: number, x: number, time: number) => {
    if (x < 1 || x > W - 2) return false
    if (r === 0) return slotFree(x)
    if (r >= 1 && r <= river) return onObject(r, x, time, 0.8)
    if (lanes[r]) return !objects(r, time).some(([a, b]) => x + 1.5 > a && x - 1.5 < b)
    return true
  }
  const slotFree = (x: number) => {
    for (let k = 0; k < slots; k++) if (!filled[k] && Math.abs(x - slotX(k)) < 1.6) return true
    return false
  }
  const riverDrift = (r: number) => (r >= 1 && r <= river ? (lanes[r] as Lane).v : 0)

  function plan() {
    // simulate a hop of 4 frames, then staying 6 more frames
    const ok = (r: number, x: number) => {
      let xx = x
      for (let k = 1; k <= 10; k++) {
        if (k > 4) xx += riverDrift(r)
        if (k >= 4 && !safe(r, xx, t + k)) return false
      }
      return true
    }
    const stay = (() => {
      let xx = fx
      for (let k = 1; k <= 6; k++) {
        xx += riverDrift(fr)
        if (!safe(fr, xx, t + k)) return false
      }
      return true
    })()
    const opts: [number, number][] = [[fr - 1, fx]]
    if (fr === 1) {
      for (let k = 0; k < slots; k++) if (!filled[k] && Math.abs(fx - slotX(k)) < 1.6) opts[0] = [0, slotX(k)]
    }
    const side: [number, number][] = [
      [fr, fx - cs],
      [fr, fx + cs],
      [fr + 1, fx],
    ]
    if (fr > 0 && ok(opts[0]![0], opts[0]![1]) && (fr !== 1 || opts[0]![0] === 0 ? true : false)) return opts[0]
    if (fr === 1) {
      // wait on the log for a slot, or shuffle along it
      if (stay) return undefined
    }
    if (stay && rng() < 0.85) return undefined
    for (const o of shuffle(rng, side)) if (o[0] < rows && ok(o[0], o[1])) return o
    return undefined
  }

  return {
    step() {
      t++
      if (dead > 0) {
        if (--dead === 0) {
          fx = W / 2
          fr = rows - 1
        }
        return
      }
      if (hop > 0) {
        hop--
        fx = to[1] + (from[1] - to[1]) * (hop / 4)
        if (hop === 0) {
          fr = to[0]
          if (fr === 0) {
            for (let k = 0; k < slots; k++) if (Math.abs(fx - slotX(k)) < 1.6) filled[k] = true
            saved++
            if (filled.every(Boolean)) filled = Array(slots).fill(false)
            fx = W / 2
            fr = rows - 1
          }
        }
      } else {
        const p = plan()
        if (p) {
          from = [fr, fx]
          to = p
          hop = 4
        }
      }
      if (hop === 0) fx += riverDrift(fr)
      if (hop === 0 && !safe(fr, fx, t)) dead = 30
    },
    draw(px) {
      px.fill(0x0a0a14)
      for (let r = 0; r < rows; r++) {
        const y = oy + r * cs
        let bg = 0x202028
        if (r === 0) bg = 0x1a6a2a
        else if (r <= river) bg = 0x1a3a8a
        else if (r === river + 1 || r === rows - 1) bg = 0x5a3a8a
        rect(px, W, H, 0, y, W, cs, bg)
        if (r > river + 1 && r < rows - 1) for (let x = 0; x < W; x += 4) dot(px, W, H, x + 1, y + cs - 1, 0x4a4a52)
        const l = lanes[r]
        if (l)
          for (const [a, b] of objects(r, t)) {
            if (l.kind === 'log') {
              rect(px, W, H, a, y + 1, b - a, cs - 2, 0x8a5a2a)
              rect(px, W, H, a, y + 1, b - a, 1, 0xa8783a)
            } else if (l.kind === 'turtle') {
              for (let x = a; x < b - 1; x += cs) {
                rect(px, W, H, x, y + 1, cs - 1, cs - 2, 0x2a9a4a)
                dot(px, W, H, x + 1, y + 1, 0x5aca6a)
              }
            } else {
              rect(px, W, H, a, y + 1, b - a, cs - 2, l.c)
              dot(px, W, H, l.v > 0 ? b - 1 : a, y + 1, 0xfff0a0)
              rect(px, W, H, a + 1, y + cs - 2, b - a - 2, 1, 0x101010)
            }
          }
      }
      for (let k = 0; k < slots; k++) {
        rect(px, W, H, slotX(k) - 1.5, oy, 3, cs, 0x1a3a8a)
        if (filled[k]) sprite(px, W, H, slotX(k) - 1, oy + 1, ['x.x', 'xxx', '.x.'], { x: 0x8aff5a })
      }
      const y = oy + fr * cs + (hop > 0 ? (to[0] - from[0]) * cs * (1 - hop / 4) : 0)
      if (dead > 0) sprite(px, W, H, fx - 1, y, ['x.x', '.x.', 'x.x'], { x: 0xff4040 })
      else sprite(px, W, H, fx - 1, y + 0.5, ['x.x', 'xxx', 'x.x'], { x: 0x6aff4a })
      text(px, W, H, 1, 0, String(saved), 0xffffff)
    },
  }
}

// --- pong, bot vs bot -------------------------------------------------------------

const pong: Maker = (W, H, rng) => {
  const pw = Math.max(4, Math.round(W * 0.22))
  const top = 4
  const bottom = H - 4
  let a = W / 2
  let b = W / 2
  let ball = { x: W / 2, y: H / 2, vx: 0.4, vy: 0.7 }
  let errA = 0
  let errB = 0
  let sa = 0
  let sb = 0
  let wait = 20
  const trail: [number, number][] = []

  function serve(dir: number) {
    const ang = (rng() - 0.5) * 1.1
    ball = { x: W / 2, y: H / 2, vx: Math.sin(ang) * 0.75, vy: Math.cos(ang) * 0.75 * dir }
    errA = (rng() - 0.5) * pw * 1.4
    errB = (rng() - 0.5) * pw * 1.4
    wait = 25
  }
  serve(1)
  const predict = (yTarget: number) => {
    let x = ball.x
    let y = ball.y
    let vx = ball.vx
    for (let k = 0; k < 400 && Math.abs(y - yTarget) > Math.abs(ball.vy); k++) {
      x += vx
      y += ball.vy
      if (x < 1 || x > W - 2) vx = -vx
    }
    return x
  }

  return {
    step() {
      if (wait > 0) {
        wait--
        return
      }
      const ta = ball.vy < 0 ? predict(top + 1) + errA * 0.8 : W / 2
      const tb = ball.vy > 0 ? predict(bottom - 1) + errB * 0.8 : W / 2
      a += clamp(ta - a, -0.75, 0.75)
      b += clamp(tb - b, -0.75, 0.75)
      ball.x += ball.vx
      ball.y += ball.vy
      if (ball.x < 1 || ball.x > W - 2) {
        ball.vx = -ball.vx
        ball.x = clamp(ball.x, 1, W - 2)
      }
      const hit = (p: number, y: number, dir: number) => {
        if (Math.abs(ball.x - p) <= pw / 2 + 0.5) {
          const off = (ball.x - p) / (pw / 2)
          const s = Math.min(2.2, Math.hypot(ball.vx, ball.vy) * 1.06)
          ball.vx = off * s * 0.7
          ball.vy = dir * Math.sqrt(Math.max(0.2, s * s - ball.vx * ball.vx))
          ball.y = y
          return true
        }
        return false
      }
      if (ball.vy < 0 && ball.y <= top + 1 && ball.y > top - 1) {
        if (hit(a, top + 1, 1)) errA = (rng() - 0.5) * pw * 1.6
      }
      if (ball.vy > 0 && ball.y >= bottom - 1 && ball.y < bottom + 1) {
        if (hit(b, bottom - 1, -1)) errB = (rng() - 0.5) * pw * 1.6
      }
      if (ball.y < 0) {
        sb++
        serve(-1)
      } else if (ball.y > H) {
        sa++
        serve(1)
      }
      if (sa > 9 || sb > 9) {
        sa = 0
        sb = 0
      }
      trail.push([ball.x, ball.y])
      if (trail.length > 4) trail.shift()
    },
    draw(px) {
      px.fill(0x000000)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, H / 2, 0x5a5a5a)
      text(px, W, H, 2, H / 2 - 7, String(sa), 0x9a9a9a)
      text(px, W, H, 2, H / 2 + 3, String(sb), 0x9a9a9a)
      rect(px, W, H, a - pw / 2, top, pw, 1, 0xffffff)
      rect(px, W, H, b - pw / 2, bottom, pw, 1, 0xffffff)
      trail.forEach(([x, y], i) => dot(px, W, H, x, y, mix(0, 0xffffff, (i + 1) / 8)))
      rect(px, W, H, ball.x - 0.5, ball.y - 0.5, 1, 1, 0xffffff)
      dot(px, W, H, ball.x, ball.y, 0xffffff)
    },
  }
}

// --- galaga dive ------------------------------------------------------------------

const galaga: Maker = (W, H, rng) => {
  const BEE = ['x.x.x', '.xxx.', 'xxxxx', '.x.x.']
  const BUG = ['.x.x.', 'xxxxx', 'x.x.x', 'x...x']
  const SHIP = ['..x..', '..x..', '.xxx.', 'xxxxx', 'x.x.x']
  type Foe = { hx: number; hy: number; x: number; y: number; st: number; u: number; dir: number; kind: number; shot: boolean }
  let foes: Foe[] = []
  let t = 0
  let sx = W / 2
  let shots: { x: number; y: number }[] = []
  let bombs: { x: number; y: number; vx: number }[] = []
  let fx2: Boom[] = []
  let dead = 0
  let score = 0
  const stars = Array.from({ length: 16 }, () => ({ x: rng() * W, y: rng() * H, c: hsv(rng(), 0.5, 1) }))

  function wave() {
    foes = []
    const per = Math.max(2, Math.floor((W - 4) / 6))
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < per; c++) {
        const hx = 2 + c * 6 + (W - 4 - per * 6) / 2 + 0.5
        const hy = 6 + r * 6
        foes.push({ hx, hy, x: hx, y: -10 - r * 8 - c * 3, st: 2, u: 0, dir: 1, kind: r === 0 ? 1 : 0, shot: false })
      }
  }
  wave()

  return {
    step() {
      t++
      fx2 = booms(fx2)
      for (const s of stars) {
        s.y += 0.5
        if (s.y > H) s.y = 0
      }
      const sway = Math.sin(t * 0.03) * 2
      for (const f of foes) {
        if (f.st === 0) {
          f.x = f.hx + sway
          f.y = f.hy
        } else if (f.st === 1) {
          f.u += 0.012
          const u = f.u
          f.x = f.hx + sway + Math.sin(u * Math.PI * 3) * W * 0.3 * f.dir
          f.y = f.hy + u * (H + 10)
          if (!f.shot && u > 0.35) {
            f.shot = true
            bombs.push({ x: f.x, y: f.y + 4, vx: clamp((sx - f.x) * 0.02, -0.3, 0.3) })
          }
          if (f.y > H + 4) {
            f.st = 2
            f.y = -8
          }
        } else {
          f.x += (f.hx + sway - f.x) * 0.08
          f.y += Math.min(1, f.hy - f.y) * 0.8
          if (Math.abs(f.y - f.hy) < 0.5) f.st = 0
        }
      }
      if (rng() < 0.02) {
        const idle = foes.filter(f => f.st === 0)
        const f = idle[irand(rng, idle.length)]
        if (f) {
          f.st = 1
          f.u = 0
          f.dir = rng() < 0.5 ? -1 : 1
          f.shot = false
        }
      }
      for (const s of shots) s.y -= 2
      shots = shots.filter(s => s.y > -2)
      for (const b of bombs) {
        b.y += 0.9
        b.x += b.vx
      }
      bombs = bombs.filter(b => b.y < H)
      foes = foes.filter(f => {
        const s = shots.find(q => Math.abs(q.x - f.x - 2) < 3 && q.y >= f.y && q.y < f.y + 4)
        if (!s) return true
        s.y = -10
        score += f.st === 1 ? 160 : 50
        fx2.push({ x: f.x + 2, y: f.y + 2, l: 12, c: f.kind ? 0xff4a4a : 0xffe04a })
        return false
      })
      if (!foes.length) wave()
      if (dead > 0) {
        dead--
        return
      }
      const diver = foes.filter(f => f.st === 1).sort((p, q) => q.y - p.y)[0]
      let target = diver ? diver.x + 2 : (foes[Math.floor((t / 60) % Math.max(1, foes.length))]?.x ?? W / 2) + 2
      const danger = bombs.find(b => b.y > H - 18 && Math.abs(b.x - sx) < 3)
      if (danger) target = sx + (danger.x < sx ? 5 : -5)
      sx = clamp(sx + clamp(target - sx, -0.8, 0.8), 3, W - 4)
      if (t % 8 === 0 && shots.length < 2) shots.push({ x: Math.round(sx), y: H - 8 })
      if (bombs.some(b => b.y > H - 7 && Math.abs(b.x - sx) < 2.5) || foes.some(f => f.st === 1 && f.y > H - 9 && Math.abs(f.x + 2 - sx) < 3)) {
        fx2.push({ x: sx, y: H - 5, l: 12, c: 0xffffff })
        dead = 40
        bombs = []
      }
    },
    draw(px) {
      px.fill(0x000008)
      for (const s of stars) dot(px, W, H, s.x, s.y, (t + s.x) % 20 < 14 ? s.c : 0x000008)
      for (const f of foes) sprite(px, W, H, f.x, f.y, f.kind ? BUG : BEE, { x: f.kind ? (Math.floor(t / 10) % 2 ? 0xff4a4a : 0xffffff) : 0xffe04a })
      for (const f of foes) if (!f.kind) dot(px, W, H, f.x + 2, f.y + 1, 0x4a8aff)
      for (const s of shots) rect(px, W, H, s.x, s.y, 1, 2, 0xffffff)
      for (const b of bombs) dot(px, W, H, b.x, b.y, 0xff6a6a)
      if (!dead) sprite(px, W, H, sx - 2, H - 7, SHIP, { x: 0xffffff })
      if (!dead) dot(px, W, H, sx, H - 5, 0xff4a4a)
      for (const b of fx2) drawBoom(px, W, H, b)
      text(px, W, H, 1, 0, String(score), 0xff4a4a)
    },
  }
}

// --- missile command --------------------------------------------------------------

const missile: Maker = (W, H, rng) => {
  const ground = H - 4
  const bases = [2, W / 2, W - 3].map(x => ({ x, ammo: 10 }))
  const cityX = [W * 0.17, W * 0.33, W * 0.67, W * 0.83].map(Math.round)
  let cities = [true, true, true, true]
  type Head = { sx: number; sy: number; tx: number; ty: number; u: number; v: number; targeted: boolean }
  let heads: Head[] = []
  let ours: { sx: number; sy: number; tx: number; ty: number; u: number; v: number }[] = []
  let blasts: { x: number; y: number; t: number; c: number }[] = []
  let spawned = 0
  let wave = 1
  let pause = 0
  let score = 0
  let t = 0

  const targets = () => [...cityX.filter((_, i) => cities[i]), ...bases.map(b => b.x)]
  const posOf = (h: { sx: number; sy: number; tx: number; ty: number; u: number }): [number, number] => [h.sx + (h.tx - h.sx) * h.u, h.sy + (h.ty - h.sy) * h.u]

  return {
    step() {
      t++
      if (pause > 0) {
        if (--pause === 0) {
          if (!cities.some(Boolean)) {
            cities = [true, true, true, true]
            score = 0
            wave = 1
          } else wave++
          for (const b of bases) b.ammo = 10
          spawned = 0
        }
        return
      }
      if (spawned < 8 + wave * 2 && rng() < 0.03 + wave * 0.005) {
        const tg = targets()
        heads.push({ sx: rng() * W, sy: 0, tx: pick(rng, tg), ty: ground, u: 0, v: 0.003 + wave * 0.0008, targeted: false })
        spawned++
      }
      for (const h of heads) h.u += h.v
      // the bot: intercept the most urgent warhead, from the nearest base with ammo
      if (t % 10 === 0) {
        const free = heads.filter(h => !h.targeted).sort((a, b) => b.u - a.u)[0]
        if (free) {
          const base = bases.filter(b => b.ammo > 0).sort((a, b) => Math.abs(a.x - free.tx) - Math.abs(b.x - free.tx))[0]
          if (base) {
            let k = 20
            for (let it = 0; it < 4; it++) {
              const [x, y] = posOf({ ...free, u: Math.min(1, free.u + free.v * k) })
              k = Math.hypot(x - base.x, y - ground) / 1.4
            }
            const [x, y] = posOf({ ...free, u: Math.min(0.97, free.u + free.v * k) })
            ours.push({ sx: base.x, sy: ground - 1, tx: x + (rng() - 0.5), ty: y, u: 0, v: 1.4 / Math.max(1, Math.hypot(x - base.x, y - ground)) })
            base.ammo--
            free.targeted = true
          }
        }
      }
      for (const o of ours) o.u += o.v
      ours = ours.filter(o => {
        if (o.u < 1) return true
        blasts.push({ x: o.tx, y: o.ty, t: 0, c: 0xffffff })
        return false
      })
      for (const b of blasts) b.t++
      blasts = blasts.filter(b => b.t < 24)
      heads = heads.filter(h => {
        const [x, y] = posOf(h)
        const r = (b: { t: number }) => (b.t < 12 ? b.t / 3 : (24 - b.t) / 3)
        if (blasts.some(b => Math.hypot(x - b.x, y - b.y) <= r(b))) {
          score += 25
          blasts.push({ x, y, t: 3, c: 0xffa040 })
          return false
        }
        if (h.u >= 1) {
          blasts.push({ x: h.tx, y: ground - 1, t: 0, c: 0xff4040 })
          const ci = cityX.indexOf(h.tx)
          if (ci >= 0) cities[ci] = false
          const bi = bases.findIndex(b => b.x === h.tx)
          if (bi >= 0) (bases[bi] as { ammo: number }).ammo = 0
          return false
        }
        return true
      })
      if (spawned >= 8 + wave * 2 && !heads.length && !blasts.length && !ours.length) pause = 50
      if (!cities.some(Boolean) && !pause) pause = 60
    },
    draw(px) {
      sky(px, W, H, 0x000010, 0x101040, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0xc8a040)
      for (const b of bases) {
        sprite(px, W, H, b.x - 2, ground - 2, ['..x..', '.xxx.'], { x: 0xc8a040 })
        for (let i = 0; i < Math.min(5, b.ammo); i++) dot(px, W, H, b.x - 2 + i, ground + 1, 0x2a6aff)
      }
      cityX.forEach((x, i) => {
        if (cities[i]) sprite(px, W, H, x - 2, ground - 3, ['.x.x.', 'xxxxx', 'xxxxx'], { x: 0x3ac8ff })
        else rect(px, W, H, x - 2, ground - 1, 5, 1, 0x5a4a3a)
      })
      for (const h of heads) {
        const [x, y] = posOf(h)
        line(px, W, H, h.sx, h.sy, x, y, 0xe03a3a)
        dot(px, W, H, x, y, 0xffffff)
      }
      for (const o of ours) {
        const [x, y] = posOf(o)
        line(px, W, H, o.sx, o.sy, x, y, 0x2a4aff)
        dot(px, W, H, o.tx, o.ty, 0x8aa0ff)
      }
      for (const b of blasts) {
        const r = b.t < 12 ? b.t / 3 : (24 - b.t) / 3
        disc(px, W, H, b.x, b.y, r, hsv(b.t * 0.08, 0.6, 1))
      }
      text(px, W, H, 1, 0, String(score), 0xff4040)
    },
  }
}

// --- barrel climber ---------------------------------------------------------------

const barrels: Maker = (W, H, rng) => {
  const levels = Math.max(3, Math.min(5, Math.floor((H - 14) / 9)))
  const gap = (H - 14) / levels
  const baseY = (i: number) => H - 4 - i * gap
  const slope = (i: number) => (i % 2 === 0 ? -2 : 2)
  const gy = (i: number, x: number) => baseY(i) + (slope(i) * (x - W / 2)) / W
  const ladderX = (i: number) => (i % 2 === 0 ? W - 6 : 5)
  type Bar = { x: number; lv: number; dir: number; fall: number; y: number; ladder: boolean; jumped: boolean }
  let bars: Bar[] = []
  let hx = 4
  let lv = 0
  let climb = -1
  let jy = 0
  let jv = 0
  let timer = 30
  let dead = 0
  let won = 0
  let score = 0
  let t = 0
  const HERO = ['.r.', 'rrr', '.s.', 'bbb', 'b.b']
  const APE = ['.bbbb.', 'bbssbb', 'bbbbbb', 'b.bb.b', 'bb..bb']

  function reset() {
    bars = []
    hx = 4
    lv = 0
    climb = -1
    jy = 0
    jv = 0
  }
  reset()
  const top = levels - 1

  return {
    step() {
      t++
      if (dead > 0) {
        if (--dead === 0) reset()
        return
      }
      if (won > 0) {
        if (--won === 0) reset()
        return
      }
      if (--timer <= 0) {
        bars.push({ x: 8, lv: top, dir: 1, fall: -1, y: 0, ladder: false, jumped: false })
        timer = 55 + irand(rng, 50)
      }
      for (const b of bars) {
        if (b.fall >= 0) {
          b.y += 0.8
          if (b.y >= gy(b.fall, b.x)) {
            b.lv = b.fall
            b.fall = -1
            b.dir = b.lv % 2 === 0 ? -1 : 1
            if (b.ladder) b.dir = b.lv % 2 === 0 ? -1 : 1
            b.ladder = false
          }
          continue
        }
        b.x += b.dir * 0.55
        b.y = gy(b.lv, b.x)
        const lx = ladderX(b.lv - 1)
        if (b.lv > 0 && Math.abs(b.x - lx) < 0.3 && rng() < 0.3) {
          b.fall = b.lv - 1
          b.ladder = true
        } else if (b.x < 1 || b.x > W - 2) {
          if (b.lv === 0) b.lv = -1
          else {
            b.fall = b.lv - 1
            b.x = clamp(b.x, 1, W - 2)
          }
        }
      }
      bars = bars.filter(b => b.lv >= 0)
      // the hero: walk to the ladder, climb, jump the barrels
      const lx = ladderX(lv)
      if (climb >= 0) {
        climb += 0.35
        if (climb >= gap) {
          lv++
          climb = -1
          if (lv >= top) {
            won = 60
            score += 1000
          }
        }
      } else {
        const d = lx - hx
        if (Math.abs(d) < 0.4 && jy === 0) climb = 0
        else hx += Math.sign(d) * 0.4
        const near = bars.find(b => b.fall < 0 && b.lv === lv && Math.abs(b.x - hx) < 5 && Math.sign(b.x - hx) === b.dir * -1)
        if (near && jy === 0 && jv === 0) jv = -1.1
      }
      if (jv !== 0 || jy < 0) {
        jv += 0.12
        jy += jv
        if (jy >= 0) {
          jy = 0
          jv = 0
        }
      }
      const y = climb >= 0 ? gy(lv, hx) - climb : gy(lv, hx) + jy
      for (const b of bars) {
        if (Math.abs(b.x - hx) < 2 && Math.abs(b.y - 1 - y) < 2.5) {
          dead = 50
        } else if (!b.jumped && b.lv === lv && Math.abs(b.x - hx) < 1 && jy < -1.5) {
          b.jumped = true
          score += 100
        }
      }
    },
    draw(px) {
      px.fill(0x000000)
      for (let i = 0; i < levels; i++) {
        for (let x = 0; x < W; x++) {
          const y = gy(i, x)
          dot(px, W, H, x, y + 1, 0xe0204a)
          dot(px, W, H, x, y + 3, 0xe0204a)
          if (x % 3 === 0) dot(px, W, H, x, y + 2, 0xe0204a)
        }
        if (i < levels - 1) {
          const x = ladderX(i)
          const y0 = gy(i, x)
          const y1 = gy(i + 1, x)
          for (let y = Math.round(y1) + 1; y <= y0; y++) {
            dot(px, W, H, x - 1, y, 0x3ad0e0)
            dot(px, W, H, x + 1, y, 0x3ad0e0)
            if (y % 2 === 0) dot(px, W, H, x, y, 0x3ad0e0)
          }
        }
      }
      sprite(px, W, H, 2, gy(top, 4) - 5, APE, { b: 0x8a4a1a, s: 0xe0a070 })
      sprite(px, W, H, W - 6, gy(top, W - 5) - 5, ['.p.', 'ppp', '.p.', 'p.p'], { p: 0xff8ad0 })
      if (won && won % 10 < 5) sprite(px, W, H, W - 9, gy(top, W - 8) - 8, ['x.x', 'xxx', '.x.'], { x: 0xff4a8a })
      rect(px, W, H, W - 5, gy(0, W - 4) - 3, 3, 3, 0x3a5aaa)
      if (t % 6 < 3) dot(px, W, H, W - 4, gy(0, W - 4) - 4, 0xffa020)
      for (const b of bars) {
        lit(px, W, H, b.x, b.y - 1.5, 1.6, 1.6, 0xa86a2a)
        dot(px, W, H, b.x + ((t >> 2) % 2 ? 1 : -1), b.y - 1.5, 0xe0a050)
      }
      const y = climb >= 0 ? gy(lv, hx) - climb : gy(lv, hx) + jy
      if (!dead || dead % 6 < 3) sprite(px, W, H, hx - 1, y - 5, HERO, { r: 0xff3a3a, s: 0xffd0a0, b: 0x3a6aff })
      text(px, W, H, 1, 0, String(score), 0xffffff)
    },
  }
}

// --- lunar lander -----------------------------------------------------------------

const lander: Maker = (W, H, rng) => {
  let ground: number[] = []
  let pad = 0
  const pw = 6
  let s = { x: 4, y: 6, vx: 0.25, vy: 0 }
  let fuel = 999
  let fire = 0
  let side = 0
  let phase = 0
  let t = 0
  let panic = false
  let landed = 0
  let debris: { x: number; y: number; vx: number; vy: number }[] = []
  const stars = Array.from({ length: 14 }, () => [rng() * W, rng() * H * 0.6] as [number, number])

  function terrain() {
    pad = 3 + irand(rng, Math.max(1, W - pw - 6))
    let y = H * 0.75
    ground = []
    for (let x = 0; x < W; x++) {
      if (x >= pad && x < pad + pw) {
        ground.push(Math.round(ground[pad - 1] ?? y))
        continue
      }
      y = clamp(y + (rng() - 0.5) * 5, H * 0.55, H - 5)
      ground.push(y)
    }
    s = { x: rng() < 0.5 ? 4 : W - 5, y: 6, vx: (rng() - 0.5) * 0.5, vy: 0 }
    fuel = 999
    phase = 0
    t = 0
    panic = rng() < 0.18
  }
  terrain()

  return {
    step() {
      t++
      for (const d of debris) {
        d.x += d.vx
        d.y += d.vy
        d.vy += 0.05
      }
      if (phase > 0) {
        if (t > 60) {
          debris = []
          terrain()
        }
        return
      }
      const tx = pad + pw / 2
      const gnd = ground[Math.round(clamp(s.x, 0, W - 1))] as number
      const alt = gnd - (s.y + 2)
      const over = Math.abs(s.x - tx) < 1.2
      const wantVx = clamp((tx - s.x) * 0.03, -0.3, 0.3)
      side = wantVx - s.vx > 0.02 ? 1 : wantVx - s.vx < -0.02 ? -1 : 0
      const wantVy = over ? (alt > 12 ? 0.35 : 0.12) : alt < 10 ? -0.1 : 0.05
      fire = s.vy > wantVy && fuel > 0 && !(panic && alt < 8) ? 1 : 0
      s.vx += side * 0.01
      s.vy += 0.012 - fire * 0.03
      fuel = Math.max(0, fuel - fire * 3 - Math.abs(side))
      s.x = clamp(s.x + s.vx, 1, W - 2)
      s.y += s.vy
      const under = Math.max(ground[Math.round(clamp(s.x - 1, 0, W - 1))] as number, ground[Math.round(clamp(s.x + 1, 0, W - 1))] as number)
      if (s.y + 2 >= Math.min(gnd, under) - 0.2) {
        const onPad = s.x - 1 >= pad && s.x + 1 < pad + pw
        if (onPad && s.vy < 0.3 && Math.abs(s.vx) < 0.15) {
          phase = 1
          landed++
          s.y = (ground[pad] as number) - 2
        } else {
          phase = 2
          for (let k = 0; k < 14; k++) debris.push({ x: s.x, y: s.y, vx: (rng() - 0.5) * 1.4, vy: -rng() * 1.2 })
        }
        t = 0
      }
    },
    draw(px) {
      px.fill(0x000000)
      for (const [x, y] of stars) dot(px, W, H, x, y, 0x5a5a6a)
      for (let x = 0; x < W; x++) {
        const g = Math.round(ground[x] as number)
        rect(px, W, H, x, g, 1, H - g, 0x3a3a44)
        dot(px, W, H, x, g, x >= pad && x < pad + pw ? 0xffe040 : 0xd0d0d8)
      }
      if (phase !== 2) {
        litSprite(px, W, H, s.x - 2, s.y - 3, ['.xxx.', 'xwwwx', '.xxx.', 'x...x'], { x: 0xd0d0d8, w: 0x4ab0ff })
        if (fire && phase === 0 && t % 3 !== 0) {
          dot(px, W, H, s.x, s.y + 1, 0xffa020)
          dot(px, W, H, s.x, s.y + 2, 0xff4020)
        }
        if (side && phase === 0) dot(px, W, H, s.x - side * 3, s.y - 2, 0xffe0a0)
      }
      for (const d of debris) dot(px, W, H, d.x, d.y, t % 4 < 2 ? 0xffa020 : 0xffffff)
      if (phase === 1 && t % 10 < 6) {
        rect(px, W, H, s.x + 3, s.y - 5, 1, 6, 0xffffff)
        rect(px, W, H, s.x + 4, s.y - 5, 2, 2, 0xff3a3a)
      }
      text(px, W, H, 1, 0, String(Math.floor(fuel / 10)), 0xffe040)
      text(px, W, H, W - 1 - textWidth(String(landed)), 0, String(landed), 0x8aff8a)
    },
  }
}

// --- centipede --------------------------------------------------------------------

const centipede: Maker = (W, H, rng) => {
  const cs = 3
  const cols = Math.floor(W / cs)
  const rows = Math.max(8, Math.floor((H - 4) / cs))
  const oy = H - rows * cs
  const zone = rows - 4
  let shrooms = new Map<number, number>()
  type Seg = { x: number; y: number }
  let bugs: { segs: Seg[]; dx: number; dy: number }[] = []
  let gx = W / 2
  let shot: { x: number; y: number } | undefined
  let t = 0
  let wave = 0
  let score = 0
  let fx2: Boom[] = []

  function spawn() {
    const n = Math.min(10, cols - 1)
    bugs = [{ segs: Array.from({ length: n }, (_, i) => ({ x: Math.max(0, cols - 1 - i), y: 0 })), dx: -1, dy: 1 }]
    for (let x = cols - n; x < cols; x++) bugs[0]!.segs.forEach(() => 0)
    wave++
  }
  function field() {
    shrooms = new Map()
    for (let k = 0; k < cols * rows * 0.1; k++) {
      const x = irand(rng, cols)
      const y = 1 + irand(rng, zone - 1)
      shrooms.set(y * cols + x, 3)
    }
  }
  field()
  spawn()
  wave = 1

  return {
    step() {
      t++
      fx2 = booms(fx2)
      if (t % 3 === 0)
        for (const b of bugs) {
          const head = b.segs[0] as Seg
          let nx = head.x + b.dx
          let ny = head.y
          if (nx < 0 || nx >= cols || shrooms.has(ny * cols + nx)) {
            nx = head.x
            ny = head.y + b.dy
            if (ny >= rows - 1 || ny < zone - 2 && b.dy < 0) b.dy = -b.dy
            if (ny >= rows) ny = rows - 2
            b.dx = -b.dx
          }
          for (let i = b.segs.length - 1; i > 0; i--) b.segs[i] = { ...(b.segs[i - 1] as Seg) }
          b.segs[0] = { x: nx, y: ny }
        }
      // the shooter: under the nearest head, firing
      const heads = bugs.map(b => b.segs[0] as Seg)
      const h = heads.sort((p, q) => q.y - p.y)[0]
      if (h) gx += clamp(h.x * cs + 1 + (bugs[0]?.dx ?? 0) * 2 - gx, -0.9, 0.9)
      gx = clamp(gx, 1, W - 2)
      if (!shot) shot = { x: Math.round(gx), y: H - 5 }
      shot.y -= 2.5
      const cx = Math.floor(shot.x / cs)
      const cy = Math.floor((shot.y - oy) / cs)
      const k = cy * cols + cx
      if (shot.y < oy) shot = undefined
      else if (shrooms.has(k)) {
        const v = (shrooms.get(k) as number) - 1
        if (v <= 0) shrooms.delete(k)
        else shrooms.set(k, v)
        score++
        shot = undefined
      } else {
        for (let bi = 0; bi < bugs.length && shot; bi++) {
          const b = bugs[bi] as { segs: Seg[]; dx: number; dy: number }
          const si = b.segs.findIndex(s => s.x === cx && s.y === cy)
          if (si >= 0) {
            score += si === 0 ? 100 : 10
            shrooms.set(k, 3)
            fx2.push({ x: cx * cs + 1, y: oy + cy * cs + 1, l: 10, c: 0x5aff5a })
            const tail = b.segs.slice(si + 1)
            b.segs = b.segs.slice(0, si)
            if (tail.length) bugs.push({ segs: tail, dx: -b.dx, dy: b.dy })
            shot = undefined
          }
        }
        bugs = bugs.filter(b => b.segs.length > 0)
      }
      if (!bugs.length) {
        spawn()
        if (wave % 3 === 0) field()
      }
    },
    draw(px) {
      px.fill(0x000000)
      const mc = hsv(wave * 0.17, 0.8, 1)
      for (const [k, v] of shrooms) {
        const x = (k % cols) * cs
        const y = oy + Math.floor(k / cols) * cs
        rect(px, W, H, x, y, cs - 1, v > 1 ? 1 : 0, mc)
        rect(px, W, H, x, y, cs - 1, 1, mc)
        if (v > 1) rect(px, W, H, x, y + 1, cs - 1, 1, scale(mc, 0.7))
        if (v > 2) dot(px, W, H, x + 1, y + 1, 0xffffff)
      }
      for (const b of bugs)
        b.segs.forEach((s, i) => {
          const x = s.x * cs
          const y = oy + s.y * cs
          rect(px, W, H, x, y, cs - 1, cs - 1, i === 0 ? 0xff4a4a : 0x5aff5a)
          if (i === 0) dot(px, W, H, x + (b.dx > 0 ? 1 : 0), y, 0xffffff)
        })
      if (shot) rect(px, W, H, shot.x, shot.y, 1, 2, 0xffffff)
      sprite(px, W, H, gx - 1, H - 4, ['.x.', 'xxx', 'x.x'], { x: 0x4ab0ff })
      for (const b of fx2) drawBoom(px, W, H, b)
      text(px, W, H, 1, 0, String(score), 0xffe04a)
    },
  }
}

// --- bomber maze ------------------------------------------------------------------

const bomber: Maker = (W, H, rng) => {
  const cs = 4
  let cols = Math.floor(W / cs)
  if (cols % 2 === 0) cols--
  let rows = Math.floor((H - 6) / cs)
  if (rows % 2 === 0) rows--
  cols = Math.max(5, cols)
  rows = Math.max(5, rows)
  const ox = Math.floor((W - cols * cs) / 2)
  const oy = H - rows * cs - 1
  const SOLID = 1
  const BRICK = 2
  let grid = new Uint8Array(cols * rows)
  let me = { x: 1, y: 1, px: 1, py: 1 }
  let moveT = 0
  let bomb: { x: number; y: number; t: number } | undefined
  let fire: { cells: number[]; t: number } | undefined
  let foes: { x: number; y: number; px: number; py: number; d: number }[] = []
  let dead = 0
  let level = 0
  let path: number[] = []

  const free = (x: number, y: number) => x >= 0 && y >= 0 && x < cols && y < rows && grid[y * cols + x] === 0 && !(bomb && bomb.x === x && bomb.y === y)
  const blastOf = (bx: number, by: number) => {
    const cells = [by * cols + bx]
    for (const [dx, dy] of DIRS)
      for (let k = 1; k <= 2; k++) {
        const x = bx + dx * k
        const y = by + dy * k
        if (x < 0 || y < 0 || x >= cols || y >= rows || grid[y * cols + x] === SOLID) break
        cells.push(y * cols + x)
        if (grid[y * cols + x] === BRICK) break
      }
    return cells
  }
  function build() {
    grid = new Uint8Array(cols * rows)
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1 || (x % 2 === 0 && y % 2 === 0)) grid[y * cols + x] = SOLID
        else if (x + y > 3 && rng() < 0.55) grid[y * cols + x] = BRICK
      }
    me = { x: 1, y: 1, px: 1, py: 1 }
    foes = []
    for (let k = 0; k < 3; k++) {
      for (let tries = 0; tries < 50; tries++) {
        const x = 1 + irand(rng, cols - 2)
        const y = 1 + irand(rng, rows - 2)
        if (grid[y * cols + x] === 0 && x + y > 6) {
          foes.push({ x, y, px: x, py: y, d: irand(rng, 4) })
          break
        }
      }
    }
    bomb = undefined
    fire = undefined
    path = []
    level++
  }
  build()
  const bfs = (goal: (x: number, y: number) => boolean, avoid: Set<number>): number[] | undefined => {
    const from = new Map<number, number>()
    const s = me.y * cols + me.x
    from.set(s, -1)
    const q = [s]
    for (let i = 0; i < q.length; i++) {
      const k = q[i] as number
      const x = k % cols
      const y = Math.floor(k / cols)
      if (goal(x, y) && !avoid.has(k)) {
        const p: number[] = []
        for (let c = k; c !== s; c = from.get(c) as number) p.unshift(c)
        return p
      }
      for (const [dx, dy] of DIRS) {
        const nx = x + dx
        const ny = y + dy
        const nk = ny * cols + nx
        if (from.has(nk) || !free(nx, ny)) continue
        if (foes.some(f => f.x === nx && f.y === ny)) continue
        from.set(nk, k)
        q.push(nk)
      }
    }
    return undefined
  }

  return {
    step() {
      if (dead > 0) {
        if (--dead === 0) {
          level = 0
          build()
        }
        return
      }
      if (fire && --fire.t <= 0) fire = undefined
      if (bomb && --bomb.t <= 0) {
        const cells = blastOf(bomb.x, bomb.y)
        for (const k of cells) if (grid[k] === BRICK) grid[k] = 0
        fire = { cells, t: 10 }
        bomb = undefined
        path = []
      }
      if (fire) {
        foes = foes.filter(f => !fire!.cells.includes(f.y * cols + f.x))
        if (fire.cells.includes(me.y * cols + me.x)) dead = 50
      }
      for (const f of foes) {
        f.px += (f.x - f.px) * 0.25
        f.py += (f.y - f.py) * 0.25
        if (Math.abs(f.x - f.px) + Math.abs(f.y - f.py) < 0.05 && rng() < 0.15) {
          const opts = DIRS.map((d, i) => [i, d] as [number, [number, number]]).filter(([, [dx, dy]]) => free(f.x + dx, f.y + dy))
          const keep = opts.find(([i]) => i === f.d)
          const o = keep && rng() < 0.7 ? keep : opts[irand(rng, opts.length)]
          if (o) {
            f.d = o[0]
            f.x += o[1][0]
            f.y += o[1][1]
          }
        }
        if (f.x === me.x && f.y === me.y) dead = 50
      }
      me.px += (me.x - me.px) * 0.3
      me.py += (me.y - me.py) * 0.3
      if (++moveT < 5) return
      moveT = 0
      if (!grid.includes(BRICK) && !foes.length && !bomb && !fire) {
        build()
        return
      }
      if (!path.length) {
        if (bomb) {
          const danger = new Set(blastOf(bomb.x, bomb.y))
          path = bfs(() => true, danger) ?? []
        } else if (!fire) {
          const target = (x: number, y: number) =>
            DIRS.some(([dx, dy]) => grid[(y + dy) * cols + x + dx] === BRICK || foes.some(f => Math.abs(f.x - x) + Math.abs(f.y - y) <= 2 && (f.x === x || f.y === y)))
          const p = bfs(target, new Set())
          if (p && !p.length) {
            const save = grid.slice()
            bomb = { x: me.x, y: me.y, t: 30 }
            const danger = new Set(blastOf(me.x, me.y))
            const escape = bfs(() => true, danger)
            if (!escape) {
              bomb = undefined
              grid = save
              path = [DIRS.map(([dx, dy]) => (me.y + dy) * cols + me.x + dx).find(k => grid[k] === 0) ?? me.y * cols + me.x]
            } else path = escape
          } else path = p ?? []
        }
      }
      const next = path.shift()
      if (next !== undefined && free(next % cols, Math.floor(next / cols))) {
        me.x = next % cols
        me.y = Math.floor(next / cols)
      } else path = []
    },
    draw(px) {
      px.fill(0x1a6a2a)
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const g = grid[y * cols + x]
          const X = ox + x * cs
          const Y = oy + y * cs
          if (g === SOLID) {
            rect(px, W, H, X, Y, cs, cs, 0x8a8a96)
            rect(px, W, H, X, Y, cs, 1, 0xc8c8d0)
            rect(px, W, H, X + cs - 1, Y, 1, cs, 0x5a5a66)
          } else if (g === BRICK) {
            rect(px, W, H, X, Y, cs, cs, 0xb86a3a)
            rect(px, W, H, X, Y + 1, cs, 1, 0x8a4a2a)
            dot(px, W, H, X + 1, Y + 2, 0x8a4a2a)
          } else rect(px, W, H, X, Y, cs, cs, 0x2a8a3a)
        }
      if (bomb) {
        lit(px, W, H, ox + bomb.x * cs + 1.5, oy + bomb.y * cs + 2, 1.6, 1.6, 0x2a2a34)
        dot(px, W, H, ox + bomb.x * cs + 2, oy + bomb.y * cs, bomb.t % 4 < 2 ? 0xffe040 : 0xff4020)
      }
      if (fire)
        for (const k of fire.cells) {
          const X = ox + (k % cols) * cs
          const Y = oy + Math.floor(k / cols) * cs
          rect(px, W, H, X, Y, cs, cs, fire.t % 4 < 2 ? 0xffa020 : 0xffe060)
          rect(px, W, H, X + 1, Y + 1, cs - 2, cs - 2, 0xffffff)
        }
      for (const f of foes) disc(px, W, H, ox + f.px * cs + 1.5, oy + f.py * cs + 1.5, 1.5, 0xff8a2a)
      if (!dead || dead % 6 < 3) {
        const X = ox + me.px * cs
        const Y = oy + me.py * cs
        rect(px, W, H, X, Y, 3, 2, 0xffffff)
        dot(px, W, H, X + 1, Y + 1, 0xff8ab0)
        rect(px, W, H, X, Y + 2, 3, 1, 0x3a6aff)
        dot(px, W, H, X + 1, Y - 1, 0xff3a6a)
      }
      text(px, W, H, 1, 0, String(level), 0xffffff)
    },
  }
}

// --- minesweeper ------------------------------------------------------------------

const minesweeper: Maker = (W, H, rng) => {
  const cw = 4
  const ch = 6
  const cols = Math.max(4, Math.floor((W - 2) / cw))
  const rows = Math.max(4, Math.floor((H - 10) / ch))
  const ox = Math.floor((W - cols * cw - 1) / 2) + 1
  const oy = H - rows * ch - 2
  const mines = Math.max(2, Math.round(cols * rows * 0.15))
  let mine: boolean[] = []
  let open: boolean[] = []
  let flag: boolean[] = []
  let started = false
  let state = 0
  let hold = 0
  let tick = 0
  let boom = -1
  let clock = 0
  let cursor = [W / 2, H / 2]
  const NUM = [0, 0x2a3aff, 0x2a8a2a, 0xff2a2a, 0x1a1a8a, 0x8a1a1a, 0x1a8a8a, 0x000000, 0x6a6a6a]

  const nb = (i: number) => {
    const x = i % cols
    const y = Math.floor(i / cols)
    const out: number[] = []
    for (let dy = -1; dy <= 1; dy++)
      for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue
        const nx = x + dx
        const ny = y + dy
        if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx)
      }
    return out
  }
  const count = (i: number) => nb(i).filter(j => mine[j]).length
  function reset() {
    mine = Array(cols * rows).fill(false)
    open = Array(cols * rows).fill(false)
    flag = Array(cols * rows).fill(false)
    started = false
    state = 0
    boom = -1
    clock = 0
  }
  reset()
  function reveal(i: number) {
    if (!started) {
      started = true
      const safe = new Set([i, ...nb(i)])
      const cells = shuffle(rng, Array.from({ length: cols * rows }, (_, k) => k).filter(k => !safe.has(k)))
      for (const k of cells.slice(0, mines)) mine[k] = true
    }
    if (mine[i]) {
      state = 2
      boom = i
      hold = 70
      return
    }
    const q = [i]
    while (q.length) {
      const k = q.pop() as number
      if (open[k] || flag[k]) continue
      open[k] = true
      if (count(k) === 0) q.push(...nb(k))
    }
    if (open.filter(Boolean).length === cols * rows - mines) {
      state = 1
      hold = 70
    }
  }
  function decide(): [number, boolean] {
    if (!started) return [Math.floor(rows / 2) * cols + Math.floor(cols / 2), false]
    for (let i = 0; i < cols * rows; i++) {
      if (!open[i]) continue
      const n = count(i)
      const hid = nb(i).filter(j => !open[j])
      const fl = hid.filter(j => flag[j])
      const unk = hid.filter(j => !flag[j])
      if (!unk.length) continue
      if (fl.length === n) return [unk[0] as number, false]
      if (hid.length === n) return [unk[0] as number, true]
    }
    const cand = Array.from({ length: cols * rows }, (_, k) => k).filter(k => !open[k] && !flag[k])
    return [pick(rng, cand), false]
  }

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (started) clock++
      if (++tick < 7) return
      tick = 0
      const [i, f] = decide()
      cursor = [ox + (i % cols) * cw + 2, oy + Math.floor(i / cols) * ch + 3]
      if (f) flag[i] = true
      else reveal(i)
    },
    draw(px) {
      px.fill(0xbdbdbd)
      rect(px, W, H, 0, 0, W, oy - 1, 0xbdbdbd)
      rect(px, W, H, 1, 1, 13, 6, 0x000000)
      text(px, W, H, 2, 1, String(Math.max(0, mines - flag.filter(Boolean).length)).padStart(3, '0'), 0xff2020)
      const fx = Math.round(W / 2 + 4)
      disc(px, W, H, fx, 4, 2.4, 0xffe020)
      if (state === 2) {
        dot(px, W, H, fx - 1, 3, 0)
        dot(px, W, H, fx + 1, 3, 0)
        dot(px, W, H, fx, 5, 0)
      } else if (state === 1) rect(px, W, H, fx - 2, 3, 5, 1, 0)
      else {
        dot(px, W, H, fx - 1, 3, 0)
        dot(px, W, H, fx + 1, 3, 0)
        rect(px, W, H, fx - 1, 5, 3, 1, 0)
      }
      if (W > 26) text(px, W, H, W - 13, 1, String(Math.min(999, Math.floor(clock / 15))).padStart(3, '0'), 0xff2020)
      rect(px, W, H, ox - 1, oy - 1, cols * cw + 1, rows * ch + 1, 0x7b7b7b)
      for (let i = 0; i < cols * rows; i++) {
        const x = ox + (i % cols) * cw
        const y = oy + Math.floor(i / cols) * ch
        if (open[i] || (state === 2 && mine[i])) {
          rect(px, W, H, x, y, cw - 1, ch - 1, i === boom ? 0xff2020 : 0xc6c6c6)
          if (mine[i]) {
            disc(px, W, H, x + 1, y + 2, 1, 0x000000)
            continue
          }
          const n = count(i)
          if (n) text(px, W, H, x, y, String(n), NUM[n] as number)
        } else {
          rect(px, W, H, x, y, cw - 1, ch - 1, 0xbdbdbd)
          rect(px, W, H, x, y, cw - 1, 1, 0xffffff)
          rect(px, W, H, x, y, 1, ch - 1, 0xffffff)
          rect(px, W, H, x + cw - 2, y + 1, 1, ch - 2, 0x8a8a8a)
          if (flag[i]) {
            rect(px, W, H, x + 1, y + 1, 1, 2, 0xff0000)
            rect(px, W, H, x + 1, y + 3, 1, 1, 0x000000)
          }
        }
      }
      const [cx, cy] = cursor as [number, number]
      sprite(px, W, H, cx, cy, ['x..', 'xx.', 'xxx', '.x.'], { x: 0xffffff })
    },
  }
}

// --- light cycles -----------------------------------------------------------------

const lightcycles: Maker = (W, H, rng) => {
  const top = 6
  const COLS = [0xffa020, 0x20e0ff, 0xff40c0, 0x60ff60]
  const n = W >= 24 ? 4 : 2
  let trail = new Int8Array(W * H)
  type Bike = { x: number; y: number; d: number; alive: boolean }
  let bikes: Bike[] = []
  let wins = [0, 0, 0, 0]
  let t = 0
  let hold = 0
  let fx2: Boom[] = []

  const blocked = (x: number, y: number) => x < 1 || y < top + 1 || x > W - 2 || y > H - 3 || trail[y * W + x] !== 0
  function reset() {
    trail = new Int8Array(W * H)
    const starts: [number, number, number][] = [
      [3, top + 4, 0],
      [W - 4, H - 6, 1],
      [W - 4, top + 4, 2],
      [3, H - 6, 3],
    ]
    bikes = starts.slice(0, n).map(([x, y, d]) => ({ x, y, d, alive: true }))
  }
  reset()
  const room = (x: number, y: number) => {
    if (blocked(x, y)) return 0
    const seen = new Set([y * W + x])
    const q = [y * W + x]
    for (let i = 0; i < q.length && seen.size < 80; i++) {
      const k = q[i] as number
      for (const [dx, dy] of DIRS) {
        const nx = (k % W) + dx
        const ny = Math.floor(k / W) + dy
        const nk = ny * W + nx
        if (!seen.has(nk) && !blocked(nx, ny)) {
          seen.add(nk)
          q.push(nk)
        }
      }
    }
    return seen.size
  }

  return {
    step() {
      t++
      fx2 = booms(fx2)
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (t % 2) return
      bikes.forEach((b, i) => {
        if (!b.alive) return
        trail[b.y * W + b.x] = i + 1
        let best = b.d
        let score = -1
        for (const d of [b.d, b.d ^ 2 ^ (b.d < 2 ? 0 : 0), 0, 1, 2, 3]) {
          if ((d ^ 1) === b.d) continue
          const [dx, dy] = DIRS[d] as [number, number]
          const s = room(b.x + dx, b.y + dy) + (d === b.d ? 3 : 0) + rng() * 4
          if (s > score) {
            score = s
            best = d
          }
        }
        b.d = best
      })
      for (const b of bikes) {
        if (!b.alive) continue
        const [dx, dy] = DIRS[b.d] as [number, number]
        b.x += dx
        b.y += dy
      }
      bikes.forEach((b, i) => {
        if (!b.alive) return
        const crash = blocked(b.x, b.y) || bikes.some((o, j) => j !== i && o.alive && o.x === b.x && o.y === b.y)
        if (crash) {
          b.alive = false
          fx2.push({ x: b.x, y: b.y, l: 12, c: COLS[i] as number })
          for (let k = 0; k < W * H; k++) if (trail[k] === i + 1) trail[k] = 0
        }
      })
      const live = bikes.filter(b => b.alive)
      if (live.length <= 1) {
        const w = bikes.findIndex(b => b.alive)
        if (w >= 0) wins[w]!++
        hold = 40
      }
    },
    draw(px) {
      px.fill(0x02030a)
      for (let y = top + 1; y < H - 2; y += 4) for (let x = 1; x < W - 1; x++) dot(px, W, H, x, y, 0x0a1428)
      for (let x = 1; x < W - 1; x += 4) for (let y = top + 1; y < H - 2; y++) dot(px, W, H, x, y, 0x0a1428)
      rect(px, W, H, 0, top, W, 1, 0x3a5aaa)
      rect(px, W, H, 0, H - 2, W, 1, 0x3a5aaa)
      rect(px, W, H, 0, top, 1, H - top - 1, 0x3a5aaa)
      rect(px, W, H, W - 1, top, 1, H - top - 1, 0x3a5aaa)
      for (let k = 0; k < W * H; k++) if (trail[k]! > 0) px[k] = scale(COLS[trail[k]! - 1] as number, 0.75)
      bikes.forEach((b, i) => {
        if (b.alive) dot(px, W, H, b.x, b.y, hold > 0 && hold % 6 < 3 ? 0xffffff : mix(COLS[i] as number, 0xffffff, 0.5))
      })
      for (const b of fx2) drawBoom(px, W, H, b)
      wins.slice(0, n).forEach((w, i) => text(px, W, H, 1 + i * 8, 0, String(w % 10), COLS[i] as number))
    },
  }
}

// --- lemmings ---------------------------------------------------------------------

const lemmings: Maker = (W, H) => {
  const ground = new Uint8Array(W * H)
  const y1 = Math.round(H * 0.32)
  const y2 = Math.round(H * 0.6)
  const gx0 = Math.round(W * 0.3)
  const gx1 = gx0 + 6
  const digX = Math.round(W * 0.66)
  const hatch = { x: Math.round(W * 0.16), y: Math.round(H * 0.14) }
  const door = 3
  type Lem = { x: number; y: number; dir: number; fall: number; job: 0 | 1 | 2 | 3; work: number; state: 0 | 1 | 2 }
  let lems: Lem[] = []
  let spawned = 0
  let timer = 0
  let saved = 0
  let digger = false
  let builder = false
  let blocker = false
  let hold = 0
  let t = 0
  let sparkles: Boom[] = []

  function level() {
    ground.fill(0)
    const fill = (x0: number, y0: number, w: number, h: number, v: number) => {
      for (let y = y0; y < y0 + h; y++) for (let x = x0; x < x0 + w; x++) if (x >= 0 && y >= 0 && x < W && y < H) ground[y * W + x] = v
    }
    fill(0, y1, W, 3, 1)
    fill(0, y2, gx0, 3, 1)
    fill(gx1, y2, W - gx1, 3, 1)
    fill(0, 0, 2, H, 3)
    fill(W - 2, 0, 2, H, 3)
    fill(0, H - 3, W, 3, 4)
    lems = []
    spawned = 0
    saved = 0
    digger = false
    builder = false
    blocker = false
    timer = 10
  }
  level()
  const solid = (x: number, y: number) => x < 0 || x >= W || y >= H || (y >= 0 && ground[y * W + x]! > 0)

  return {
    step() {
      t++
      sparkles = booms(sparkles)
      if (hold > 0) {
        if (--hold === 0) level()
        return
      }
      if (spawned < 10 && --timer <= 0) {
        lems.push({ x: hatch.x, y: hatch.y + 2, dir: 1, fall: 0, job: 0, work: 0, state: 0 })
        spawned++
        timer = 28
      }
      if (t % 2) return
      for (const l of lems) {
        if (l.state) continue
        if (!solid(l.x, l.y + 1)) {
          if (l.job === 1) l.job = 0
          l.y++
          l.fall++
          if (ground[(l.y + 1) * W + l.x] === 4 || l.y >= H - 4) l.state = 1
          continue
        }
        if (l.fall > 16) {
          l.state = 1
          continue
        }
        l.fall = 0
        if (!digger && l.y + 1 === y1 && Math.abs(l.x - digX) < 1) {
          digger = true
          l.job = 1
        }
        if (l.y + 1 === y2 && l.x > gx1 && l.x <= gx1 + 2 && l.dir < 0 && !builder) {
          builder = true
          l.job = 2
        }
        if (l.y + 1 === y2 && l.x > gx1 + 3 && l.x <= gx1 + 5 && builder && !blocker && l.job === 0 && !lems.some(o => o.job === 2 && o.work < 5 && o !== l) === false) {
          blocker = true
          l.job = 3
        }
        if (l.job === 1) {
          if (++l.work % 2 === 0) {
            for (let x = l.x - 1; x <= l.x + 1; x++) if (ground[(l.y + 1) * W + x] === 1) ground[(l.y + 1) * W + x] = 0
            if (!solid(l.x, l.y + 1)) l.y++
          }
          continue
        }
        if (l.job === 2) {
          l.work++
          if (l.work % 3 === 0) {
            const k = l.work / 3
            for (let i = 1; i <= 4; i++) {
              const x = l.x + l.dir * i
              if (x > 1 && x < W - 2) ground[l.y * W + x] = 2
            }
            l.x += l.dir * 2
            l.y -= 1
            if (k >= 6) l.job = 0
          }
          continue
        }
        if (l.job === 3) continue
        const nx = l.x + l.dir
        let step = -1
        for (let up = 0; up <= 3; up++) if (!solid(nx, l.y - up)) {
          step = up
          break
        }
        const blocked = lems.some(o => o.job === 3 && o !== l && !o.state && Math.abs(o.x - nx) < 2 && Math.abs(o.y - l.y) < 3)
        if (step < 0 || step > 2 || blocked) l.dir = -l.dir
        else {
          l.x = nx
          l.y -= step
        }
        if (l.y + 1 === y2 && l.x <= door + 1) {
          l.state = 2
          saved++
          sparkles.push({ x: l.x, y: l.y - 2, l: 10, c: 0x8aff8a })
        }
      }
      if (spawned >= 10 && lems.every(l => l.state || l.job === 3)) hold = 60
    },
    draw(px) {
      sky(px, W, H, 0x101030, 0x202050)
      for (let i = 0; i < W * H; i++) {
        const g = ground[i]
        if (!g) continue
        const y = Math.floor(i / W)
        px[i] = g === 1 ? (ground[i - W] ? 0x8a5a2a : 0x3aa03a) : g === 2 ? 0xe0c080 : g === 3 ? 0x6a6a7a : y % 2 ? 0x2a4aaa : 0x3a6aca
      }
      rect(px, W, H, hatch.x - 3, hatch.y - 2, 7, 2, 0x8a8aa0)
      rect(px, W, H, hatch.x - 2, hatch.y, 5, 1, 0x3a3a4a)
      rect(px, W, H, door - 1, y2 - 5, 5, 5, 0x6a3a1a)
      rect(px, W, H, door, y2 - 4, 3, 4, 0x1a0a00)
      dot(px, W, H, door + 1, y2 - 6, t % 6 < 3 ? 0xffa020 : 0xffe040)
      for (const l of lems) {
        if (l.state === 2) continue
        if (l.state === 1) {
          if (l.fall > 16 || l.y >= H - 4) rect(px, W, H, l.x - 1, l.y, 3, 1, 0xff4040)
          continue
        }
        dot(px, W, H, l.x, l.y - 3, 0x3aff5a)
        dot(px, W, H, l.x + (l.dir > 0 ? 0 : 0), l.y - 2, 0xffd0a0)
        dot(px, W, H, l.x, l.y - 1, 0x3a5aff)
        dot(px, W, H, l.x + ((t >> 2) % 2 ? l.dir : 0), l.y, 0x3a5aff)
        if (l.job === 3) {
          dot(px, W, H, l.x - 1, l.y - 2, 0x3a5aff)
          dot(px, W, H, l.x + 1, l.y - 2, 0x3a5aff)
        }
        if (l.job === 2) dot(px, W, H, l.x + l.dir, l.y - 1, 0xe0c080)
      }
      for (const s of sparkles) drawBoom(px, W, H, s)
      text(px, W, H, W - 1 - textWidth(String(saved)), 0, String(saved), 0x8aff8a)
    },
  }
}

// --- platformer -------------------------------------------------------------------

const platformer: Maker = (W, H, rng) => {
  const floorY = H - 8
  type Col = { g: number; block: number; kind: number; pipe: number }
  let world: Col[] = []
  let enemies: { x: number; y: number; vx: number; dead: number }[] = []
  let coins: { x: number; y: number; l: number }[] = []
  let hero = { x: 6, y: floorY, vy: 0 }
  let cam = 0
  let score = 0
  let dead = 0
  let t = 0
  const clouds = Array.from({ length: 4 }, () => ({ x: rng() * W * 2, y: 3 + rng() * 12 }))

  function gen(n: number) {
    while (world.length < n) {
      const x = world.length
      if (x < 12) {
        world.push({ g: floorY, block: 0, kind: 0, pipe: 0 })
        continue
      }
      const r = rng()
      if (r < 0.06) {
        const w = 3 + irand(rng, 3)
        for (let i = 0; i < w; i++) world.push({ g: H + 10, block: 0, kind: 0, pipe: 0 })
        for (let i = 0; i < 3; i++) world.push({ g: floorY, block: 0, kind: 0, pipe: 0 })
      } else if (r < 0.1) {
        const h = 5 + irand(rng, 5)
        for (let i = 0; i < 5; i++) world.push({ g: floorY, block: 0, kind: 0, pipe: h })
        for (let i = 0; i < 4; i++) world.push({ g: floorY, block: 0, kind: 0, pipe: 0 })
      } else if (r < 0.16) {
        const by = floorY - 13
        for (let i = 0; i < 12; i++) world.push({ g: floorY, block: by, kind: i >= 4 && i < 8 ? 2 : 1, pipe: 0 })
      } else {
        world.push({ g: floorY, block: 0, kind: 0, pipe: 0 })
        if (r > 0.97) enemies.push({ x: x + 0.5, y: floorY, vx: -0.25, dead: 0 })
      }
    }
  }
  function reset() {
    world = []
    enemies = []
    coins = []
    gen(80)
    hero = { x: 6, y: floorY, vy: 0 }
    cam = 0
    score = 0
  }
  reset()
  const colAt = (x: number) => world[Math.floor(x)] ?? { g: floorY, block: 0, kind: 0, pipe: 0 }
  const top = (x: number) => {
    const c = colAt(x)
    return c.pipe ? c.g - c.pipe : c.g
  }

  return {
    step() {
      t++
      for (const c of clouds) {
        c.x -= 0.1
        if (c.x - cam * 0.5 < -10) c.x += W + 20
      }
      coins = coins.filter(c => --c.l > 0)
      if (dead > 0) {
        if (--dead === 0) reset()
        return
      }
      gen(Math.floor(cam) + W + 40)
      const onGround = hero.y >= Math.min(top(hero.x - 1), top(hero.x + 1)) - 0.01 && hero.vy >= 0
      // the bot looks ahead: a gap, a pipe, an enemy or a box overhead means jump
      if (onGround) {
        let jump = false
        for (let k = 1; k <= 5; k++) {
          if (top(hero.x + 1 + k) > hero.y + 1) jump = k >= 2
          if (top(hero.x + 1 + k) < hero.y - 1 && k <= 3) jump = true
        }
        if (enemies.some(e => !e.dead && e.x - hero.x > 1 && e.x - hero.x < 7)) jump = true
        const c = colAt(hero.x + 2)
        if (c.kind === 2 && c.block && rng() < 0.3) jump = true
        if (jump) hero.vy = -2.15
      }
      let nx = hero.x + 0.65
      if (top(nx + 1.5) < hero.y - 0.5) nx = hero.x
      hero.x = nx
      hero.vy += 0.14
      const prevY = hero.y
      hero.y += hero.vy
      const c = colAt(hero.x + 1)
      if (c.block && hero.vy < 0 && hero.y - 6 <= c.block + 4 && prevY - 6 > c.block + 3) {
        hero.vy = 0.3
        if (c.kind === 2) {
          c.kind = 3
          coins.push({ x: Math.floor(hero.x + 1), y: c.block - 4, l: 15 })
          score++
        }
      }
      if (c.block && hero.vy > 0 && prevY <= c.block && hero.y >= c.block) {
        hero.y = c.block
        hero.vy = 0
      }
      const g = Math.min(top(hero.x), top(hero.x + 2))
      if (hero.vy >= 0 && hero.y >= g && prevY <= g + 1) {
        hero.y = g
        hero.vy = 0
      }
      for (const e of enemies) {
        if (e.dead) {
          e.dead++
          continue
        }
        if (e.x < cam + W + 4) e.x += e.vx
        if (top(e.x + e.vx * 4) < e.y || top(e.x) > e.y + 2) e.vx = -e.vx
        if (Math.abs(e.x - hero.x - 1) < 2.5 && Math.abs(e.y - hero.y) < 3) {
          if (hero.vy > 0 && hero.y < e.y) {
            e.dead = 1
            hero.vy = -1.4
            score++
          } else dead = 45
        }
      }
      enemies = enemies.filter(e => e.dead < 15 && e.x > cam - 5)
      if (hero.y > H + 4) dead = 45
      cam = Math.max(cam, hero.x - 10)
    },
    draw(px) {
      sky(px, W, H, 0x5a8aff, 0x9ac0ff)
      for (const c of clouds) {
        const x = c.x - cam * 0.5
        rect(px, W, H, x, c.y, 6, 2, 0xffffff)
        rect(px, W, H, x + 1, c.y - 1, 3, 1, 0xffffff)
      }
      for (let i = 0; i < 3; i++) {
        const hx = ((i * 23 - cam * 0.3) % (W + 20) + W + 20) % (W + 20) - 10
        for (let k = 0; k < 6; k++) rect(px, W, H, hx + k, floorY - 6 + Math.abs(k - 3), 1, 6 - Math.abs(k - 3), 0x4ac04a)
      }
      for (let sx = 0; sx < W; sx++) {
        const wx = Math.floor(sx + cam)
        const c = colAt(wx)
        if (c.g < H) {
          rect(px, W, H, sx, c.g, 1, H - c.g, (wx + Math.floor(c.g)) % 4 === 0 ? 0x9a4a1a : 0xc86a2a)
          dot(px, W, H, sx, c.g, 0xe08a4a)
        }
        if (c.pipe) {
          rect(px, W, H, sx, c.g - c.pipe, 1, c.pipe, (wx % 5) < 2 ? 0x5ae05a : 0x2a9a2a)
          dot(px, W, H, sx, c.g - c.pipe, 0x0a5a0a)
        }
        if (c.block) {
          const col = c.kind === 2 ? (t % 20 < 14 ? 0xffc020 : 0xe09010) : c.kind === 3 ? 0x8a6a4a : 0xb85a2a
          rect(px, W, H, sx, c.block, 1, 4, col)
          if (c.kind !== 2 && wx % 4 === 0) rect(px, W, H, sx, c.block, 1, 4, 0x6a2a0a)
          if (c.kind === 2 && wx % 4 === 1) dot(px, W, H, sx, c.block + 1, 0xffffff)
        }
      }
      for (const co of coins) disc(px, W, H, co.x - cam, co.y - (15 - co.l) * 0.6, 1, 0xffe040)
      for (const e of enemies) {
        const x = e.x - cam - 1.5
        if (e.dead) rect(px, W, H, x, e.y - 1, 4, 1, 0x8a4a1a)
        else litSprite(px, W, H, x, e.y - 4, ['.bb.', 'bwwb', 'bbbb', 'k..k'], { b: 0x9a5a2a, w: 0xffffff, k: 0x2a1a0a })
      }
      if (!dead || dead % 6 < 3) {
        const run = Math.floor(t / 4) % 2
        litSprite(px, W, H, hero.x - cam, hero.y - 7, ['.rrr', 'rrrr', '.sss', '.ss.', 'rbbr', '.bb.', run ? 'k..k' : '.kk.'], {
          r: 0xe02a2a,
          s: 0xffc890,
          b: 0x2a4aff,
          k: 0x5a2a0a,
        })
      }
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

// --- bubble shooter ---------------------------------------------------------------

const bubbleshooter: Maker = (W, H, rng) => {
  const COLS = [0xff4a5a, 0x4ab0ff, 0xffd04a, 0x5ae07a, 0xc06aff]
  const pitch = 4
  const cols = Math.max(3, Math.floor((W - 2) / pitch))
  const rowH = 3.5
  const top = 3
  const maxRows = Math.max(6, Math.floor((H - 16) / rowH))
  const lx = W / 2
  const ly = H - 5
  let grid: number[] = []
  let shot: { x: number; y: number; vx: number; vy: number; c: number } | undefined
  let next = 0
  let aim = -Math.PI / 2
  let target = -Math.PI / 2
  let wait = 0
  let falling: { x: number; y: number; vy: number; c: number }[] = []
  let pops: Boom[] = []
  let score = 0

  const cx = (r: number, c: number) => 2 + c * pitch + (r % 2 ? pitch / 2 : 0) + 0.5
  const cy = (r: number) => top + r * rowH + 1
  const idx = (r: number, c: number) => r * cols + c
  const valid = (r: number, c: number) => r >= 0 && r < maxRows && c >= 0 && c < cols - (r % 2)
  const neigh = (r: number, c: number): [number, number][] => {
    const o = r % 2 ? 1 : 0
    return ([
      [r, c - 1],
      [r, c + 1],
      [r - 1, c - 1 + o],
      [r - 1, c + o],
      [r + 1, c - 1 + o],
      [r + 1, c + o],
    ] as [number, number][]).filter(([a, b]) => valid(a, b))
  }
  function fill() {
    grid = Array(maxRows * cols).fill(-1)
    for (let r = 0; r < Math.floor(maxRows * 0.45); r++) for (let c = 0; c < cols - (r % 2); c++) grid[idx(r, c)] = irand(rng, 4)
    next = irand(rng, 4)
  }
  fill()
  // whether a bubble at (x, y) touches the ceiling or the grid: only the cells around it
  const touching = (x: number, y: number) => {
    if (y < top + 1) return true
    const r0 = Math.round((y - top - 1) / rowH)
    for (let r = r0 - 1; r <= r0 + 1; r++) {
      const c0 = Math.round((x - 2.5 - (r % 2 ? pitch / 2 : 0)) / pitch)
      for (let c = c0 - 1; c <= c0 + 1; c++) if (valid(r, c) && grid[idx(r, c)]! >= 0 && Math.hypot(cx(r, c) - x, cy(r) - y) < 3.4) return true
    }
    return false
  }
  // the empty cell, next to the grid, nearest to where a bubble stopped
  const snap = (x: number, y: number): [number, number] | undefined => {
    const r0 = Math.round((y - top - 1) / rowH)
    let best: [number, number] | undefined
    let bd = Infinity
    for (let r = Math.max(0, r0 - 2); r <= Math.min(maxRows - 1, r0 + 2); r++)
      for (let c = 0; c < cols - (r % 2); c++) {
        if (grid[idx(r, c)]! >= 0) continue
        if (r > 0 && !neigh(r, c).some(([a2, b2]) => grid[idx(a2, b2)]! >= 0)) continue
        const d = Math.hypot(cx(r, c) - x, cy(r) - y)
        if (d < bd) {
          bd = d
          best = [r, c]
        }
      }
    return best
  }
  // where a shot at angle a would stick, by stepping along it
  function land(a: number): [number, number] | undefined {
    let x = lx
    let y = ly
    let vx = Math.cos(a)
    const vy = Math.sin(a)
    for (let k = 0; k < 200; k++) {
      x += vx
      y += vy
      if (x < 1.5 || x > W - 2.5) vx = -vx
      if (touching(x, y)) return snap(x, y)
    }
    return undefined
  }
  const cluster = (r: number, c: number, col: number) => {
    const seen = new Set([idx(r, c)])
    const q: [number, number][] = [[r, c]]
    while (q.length) {
      const [a, b] = q.pop() as [number, number]
      for (const [a2, b2] of neigh(a, b)) {
        const k = idx(a2, b2)
        if (!seen.has(k) && grid[k] === col) {
          seen.add(k)
          q.push([a2, b2])
        }
      }
    }
    return seen
  }
  function choose() {
    let best = -Math.PI / 2
    let bs = -Infinity
    for (let a = -Math.PI + 0.35; a < -0.35; a += 0.06) {
      const p = land(a)
      if (!p) continue
      grid[idx(p[0], p[1])] = next
      const n = cluster(p[0], p[1], next).size
      grid[idx(p[0], p[1])] = -1
      const s = (n >= 3 ? n * 10 : n) - p[0] * 0.3 + rng() * 2
      if (s > bs) {
        bs = s
        best = a
      }
    }
    target = best
  }

  return {
    step() {
      pops = booms(pops)
      for (const f of falling) {
        f.vy += 0.15
        f.y += f.vy
      }
      falling = falling.filter(f => f.y < H + 3)
      if (wait > 0) {
        wait--
        if (wait === 20) choose()
        return
      }
      if (!shot) {
        aim += (target - aim) * 0.25
        if (Math.abs(target - aim) < 0.01) shot = { x: lx, y: ly, vx: Math.cos(aim) * 1.6, vy: Math.sin(aim) * 1.6, c: next }
        return
      }
      for (let s = 0; s < 3; s++) {
        shot.x += shot.vx / 3
        shot.y += shot.vy / 3
        if (shot.x < 1.5 || shot.x > W - 2.5) shot.vx = -shot.vx
        if (!touching(shot.x, shot.y)) continue
        const best = snap(shot.x, shot.y)
        if (best) {
          const [r, c] = best
          grid[idx(r, c)] = shot.c
          const cl = cluster(r, c, shot.c)
          if (cl.size >= 3) {
            for (const k of cl) {
              const rr = Math.floor(k / cols)
              pops.push({ x: cx(rr, k % cols), y: cy(rr), l: 10, c: COLS[grid[k]!] as number })
              grid[k] = -1
              score += 10
            }
            const keep = new Set<number>()
            const q: [number, number][] = []
            for (let c2 = 0; c2 < cols; c2++)
              if (grid[idx(0, c2)]! >= 0) {
                keep.add(idx(0, c2))
                q.push([0, c2])
              }
            while (q.length) {
              const [a, b] = q.pop() as [number, number]
              for (const [a2, b2] of neigh(a, b)) {
                const k = idx(a2, b2)
                if (!keep.has(k) && grid[k]! >= 0) {
                  keep.add(k)
                  q.push([a2, b2])
                }
              }
            }
            for (let k = 0; k < grid.length; k++)
              if (grid[k]! >= 0 && !keep.has(k)) {
                const rr = Math.floor(k / cols)
                falling.push({ x: cx(rr, k % cols), y: cy(rr), vy: -0.5, c: grid[k]! })
                grid[k] = -1
                score += 20
              }
          }
          if (r >= maxRows - 1 || grid.every(g => g < 0)) fill()
        }
        shot = undefined
        const present = [...new Set(grid.filter(g => g >= 0))]
        next = present.length ? pick(rng, present) : irand(rng, 4)
        wait = 22
        break
      }
    },
    draw(px) {
      sky(px, W, H, 0x1a1a3a, 0x3a2a5a)
      rect(px, W, H, 0, H - 9, W, 1, 0x5a4a7a)
      for (let r = 0; r < maxRows; r++)
        for (let c = 0; c < cols - (r % 2); c++) {
          const g = grid[idx(r, c)]!
          if (g < 0) continue
          lit(px, W, H, cx(r, c), cy(r), 1.6, 1.6, COLS[g] as number)
          dot(px, W, H, cx(r, c) - 1, cy(r) - 1, mix(COLS[g] as number, 0xffffff, 0.6))
        }
      for (const f of falling) lit(px, W, H, f.x, f.y, 1.6, 1.6, COLS[f.c] as number)
      for (const p of pops) drawBoom(px, W, H, p)
      for (let k = 2; k < 12; k += 2) dot(px, W, H, lx + Math.cos(aim) * k, ly + Math.sin(aim) * k, 0x8a8aaa)
      if (shot) lit(px, W, H, shot.x, shot.y, 1.6, 1.6, COLS[shot.c] as number)
      else lit(px, W, H, lx, ly, 1.6, 1.6, COLS[next] as number)
      rect(px, W, H, lx - 3, ly + 2, 7, 2, 0x8a8aa8)
      text(px, W, H, 1, H - 7, String(score), 0xffffff)
    },
  }
}

// --- falling jewels ---------------------------------------------------------------

const jewels: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.max(3, Math.min(6, Math.floor((W - 4) / cs)))
  const rows = Math.max(6, Math.floor((H - 8) / cs))
  const ox = Math.floor((W - cols * cs) / 2)
  const oy = H - rows * cs - 1
  const COLS = [0xff3a5a, 0x3ab0ff, 0xffd03a, 0x5ae06a, 0xc05aff, 0xff8a3a]
  let grid = new Int8Array(cols * rows).fill(-1)
  let piece = [0, 0, 0]
  let px0 = 0
  let py = -3
  let target = 0
  let flash: Set<number> | undefined
  let flashT = 0
  let score = 0
  let chain = 0

  const newPiece = () => {
    piece = [irand(rng, 5), irand(rng, 5), irand(rng, 5)]
    px0 = Math.floor(cols / 2)
    py = -3
    plan()
  }
  const matches = (g: Int8Array) => {
    const out = new Set<number>()
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        const c = g[y * cols + x]!
        if (c < 0) continue
        for (const [dx, dy] of [
          [1, 0],
          [0, 1],
          [1, 1],
          [1, -1],
        ] as [number, number][]) {
          const run = [y * cols + x]
          for (let k = 1; ; k++) {
            const nx = x + dx * k
            const ny = y + dy * k
            if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || g[ny * cols + nx] !== c) break
            run.push(ny * cols + nx)
          }
          if (run.length >= 3) for (const i of run) out.add(i)
        }
      }
    return out
  }
  const height = (g: Int8Array, x: number) => {
    let y = 0
    while (y < rows && g[y * cols + x]! < 0) y++
    return y
  }
  function plan() {
    let best = -Infinity
    for (let rot = 0; rot < 3; rot++) {
      for (let x = 0; x < cols; x++) {
        const g = grid.slice()
        const h = height(g, x)
        if (h < 3) continue
        const p = [piece[(rot + 0) % 3], piece[(rot + 1) % 3], piece[(rot + 2) % 3]] as number[]
        for (let k = 0; k < 3; k++) g[(h - 3 + k) * cols + x] = p[k] as number
        const s = matches(g).size * 10 + h + rng() * 2
        if (s > best) {
          best = s
          target = x
          piece = p
        }
      }
    }
  }
  newPiece()
  function settle() {
    for (let x = 0; x < cols; x++) {
      const col: number[] = []
      for (let y = rows - 1; y >= 0; y--) if (grid[y * cols + x]! >= 0) col.push(grid[y * cols + x]!)
      for (let y = rows - 1, k = 0; y >= 0; y--, k++) grid[y * cols + x] = col[k] ?? -1
    }
  }

  return {
    step() {
      if (flash) {
        if (--flashT <= 0) {
          for (const i of flash) grid[i] = -1
          score += flash.size * 10 * chain
          settle()
          const m = matches(grid)
          if (m.size) {
            chain++
            flash = m
            flashT = 12
          } else {
            flash = undefined
            newPiece()
          }
        }
        return
      }
      if (px0 !== target) {
        px0 += Math.sign(target - px0)
        return
      }
      py += 0.5
      const h = height(grid, px0)
      if (py + 3 > h) {
        if (h < 3) {
          grid.fill(-1)
          score = 0
          newPiece()
          return
        }
        for (let k = 0; k < 3; k++) grid[(h - 3 + k) * cols + px0] = piece[k] as number
        const m = matches(grid)
        if (m.size) {
          chain = 1
          flash = m
          flashT = 12
        } else newPiece()
      }
    },
    draw(px) {
      sky(px, W, H, 0x101028, 0x281038)
      rect(px, W, H, ox - 1, oy, cols * cs + 2, rows * cs + 1, 0x8a7a40)
      rect(px, W, H, ox, oy, cols * cs, rows * cs, 0x05050f)
      const gem = (x: number, y: number, c: number, lit: boolean) => {
        const col = lit ? 0xffffff : (COLS[c] as number)
        litSprite(px, W, H, x, y, ['.x.', 'xxx', '.x.'], { x: col })
        dot(px, W, H, x + 1, y + 1, mix(col, 0xffffff, 0.6))
        dot(px, W, H, x, y + 1, scale(col, 0.7))
      }
      for (let i = 0; i < cols * rows; i++) {
        const c = grid[i]!
        if (c >= 0) gem(ox + (i % cols) * cs, oy + Math.floor(i / cols) * cs + 1, c, !!flash?.has(i) && flashT % 4 < 2)
      }
      if (!flash) for (let k = 0; k < 3; k++) gem(ox + px0 * cs, oy + (py + k) * cs + 1, piece[k] as number, false)
      text(px, W, H, 1, 1, String(score), 0xffe040)
    },
  }
}

// --- sokoban ----------------------------------------------------------------------

// Each level with its shortest solution (right, left, down, up), found offline by a
// breadth-first search: searching while the feed plays would stall a frame.
const LEVELS: [string[], string][] = [
  [['#######', '#     #', '# $.  #', '#  @  #', '# .$  #', '#     #', '#######'], 'rdlullur'],
  [['######', '#    #', '# #@ #', '# $* #', '# .* #', '#    #', '######'], 'rddlruulduullddr'],
  [['  ####', '###  #', '#  $ #', '# #. #', '#  .@#', '# $  #', '##   #', ' #####'], 'uuuldlldddrdru'],
  [['########', '#  #   #', '# $  $ #', '#. @ #.#', '#  ##  #', '#      #', '########'], 'ululdrrrrurd'],
  [['  ##### ', '###   # ', '#.@$  # ', '### $.# ', '#.##$ # ', '# # . ##', '#$ *$$.#', '#   .  #', '########'], 'rurrddddldruuuulllrdrdrddlldllurlu'],
]

const sokoban: Maker = (W, H) => {
  const cs = 4
  let li = 0
  let walls = new Set<number>()
  let goals = new Set<number>()
  let boxes: number[] = []
  let me = 0
  let w = 0
  let h = 0
  let moves: number[] = []
  let mi = 0
  let anim = 0
  let from = [0, 0]
  let boxFrom = -1
  let boxTo = -1
  let hold = 0
  let steps = 0

  function load() {
    const [L, sol] = LEVELS[li % LEVELS.length] as [string[], string]
    h = L.length
    w = Math.max(...L.map(r => r.length))
    walls = new Set()
    goals = new Set()
    boxes = []
    L.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        const k = y * w + x
        if (ch === '#') walls.add(k)
        if (ch === '.' || ch === '*' || ch === '+') goals.add(k)
        if (ch === '$' || ch === '*') boxes.push(k)
        if (ch === '@' || ch === '+') me = k
      }),
    )
    moves = [...sol].map(ch => 'rldu'.indexOf(ch))
    mi = 0
    steps = 0
  }
  load()
  const ox = () => Math.floor((W - w * cs) / 2)
  const oy = () => Math.floor((H - h * cs) / 2) + 2

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          li++
          load()
        }
        return
      }
      if (anim > 0) {
        anim--
        return
      }
      const d = moves[mi]
      if (d === undefined) {
        hold = 50
        return
      }
      const D = [1, -1, w, -w]
      from = [me % w, Math.floor(me / w)]
      const n = me + (D[d] as number)
      const bi = boxes.indexOf(n)
      boxFrom = -1
      if (bi >= 0) {
        boxFrom = n
        boxTo = n + (D[d] as number)
        boxes[bi] = boxTo
      }
      me = n
      mi++
      steps++
      anim = 5
    },
    draw(px) {
      px.fill(0x16161e)
      const X = ox()
      const Y = oy()
      const f = anim / 5
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const k = y * w + x
          const sx = X + x * cs
          const sy = Y + y * cs
          if (walls.has(k)) {
            // bricks: a lit top row, mortar lines, a staggered joint
            rect(px, W, H, sx, sy, cs, cs, 0x8a3a2a)
            rect(px, W, H, sx, sy, cs, 1, 0xb85a44)
            rect(px, W, H, sx, sy + 2, cs, 1, 0x5a2218)
            dot(px, W, H, sx + (y % 2 ? 1 : 3), sy + 1, 0x5a2218)
            dot(px, W, H, sx + (y % 2 ? 3 : 1), sy + 3, 0x5a2218)
          } else if (x > 0 && y > 0 && x < w - 1 && y < h - 1) {
            rect(px, W, H, sx, sy, cs, cs, (x + y) % 2 ? 0x3a3a30 : 0x34342c)
            if (walls.has(k - w)) rect(px, W, H, sx, sy, cs, 1, 0x26261e)
            if (goals.has(k)) {
              rect(px, W, H, sx + 1, sy + 1, 2, 2, 0xffd040)
              dot(px, W, H, sx + 1, sy + 1, 0xfff0a0)
            }
          }
        }
      for (const b of boxes) {
        let bx = X + (b % w) * cs
        let by = Y + Math.floor(b / w) * cs
        if (b === boxTo && boxFrom >= 0 && anim > 0) {
          bx += ((boxFrom % w) - (b % w)) * cs * f
          by += (Math.floor(boxFrom / w) - Math.floor(b / w)) * cs * f
        }
        const done = goals.has(b)
        // a crate: lit planks, a dark frame, a cross brace
        slab(px, W, H, bx, by, cs, cs, done ? 0x5ad05a : 0xd0962e)
        dot(px, W, H, bx + 1, by + 1, done ? 0x2a7a2a : 0x7a4a14)
        dot(px, W, H, bx + 2, by + 2, done ? 0x2a7a2a : 0x7a4a14)
        if (hold > 0 && hold % 10 < 5) rect(px, W, H, bx + 1, by + 1, cs - 2, cs - 2, 0xffffff)
      }
      const mx = X + ((me % w) + (from[0]! - (me % w)) * f) * cs
      const my = Y + (Math.floor(me / w) + (from[1]! - Math.floor(me / w)) * f) * cs
      rect(px, W, H, mx + 1, my, 2, 1, 0xffd0a0)
      dot(px, W, H, mx + 2, my, 0xd8a078)
      rect(px, W, H, mx, my + 1, 4, 2, 0x3a6aff)
      rect(px, W, H, mx, my + 1, 1, 2, 0x6a9aff)
      rect(px, W, H, mx + 3, my + 1, 1, 2, 0x2a48b8)
      rect(px, W, H, mx + 1, my + 3, 1, 1, 0x2a2a3a)
      rect(px, W, H, mx + 2, my + 3, 1, 1, 0x2a2a3a)
      text(px, W, H, 1, 1, String(steps), 0xffffff)
    },
  }
}

// --- solitaire win cascade --------------------------------------------------------

const solitaire: Maker = (W, H, rng) => {
  const cw = 5
  const ch = 7
  const felt = 0x0a7a3a
  const canvas = new Uint32Array(W * H).fill(felt)
  let card: { x: number; y: number; vx: number; vy: number; s: number } | undefined
  let n = 0
  let wait = 20
  const SUITS = [
    ['x.x', 'xxx', '.x.'],
    ['.x.', 'xxx', '.x.'],
    ['.x.', 'xxx', 'x.x'],
    ['x.x', '.x.', 'xxx'],
  ]
  const piles = 4
  const pileX = (k: number) => W - 1 - (piles - k) * (cw + 1)

  const stamp = (buf: Uint32Array, x: number, y: number, s: number) => {
    rect(buf, W, H, x, y, cw, ch, 0xffffff)
    rect(buf, W, H, x, y, cw, 1, 0xd8d8d8)
    rect(buf, W, H, x, y + ch - 1, cw, 1, 0x9a9a9a)
    rect(buf, W, H, x + cw - 1, y, 1, ch, 0x9a9a9a)
    sprite(buf, W, H, x + 1, y + 2, SUITS[s % 4] as string[], { x: s % 4 < 2 ? 0xe02020 : 0x101010 })
    dot(buf, W, H, x + 1, y + 1, s % 4 < 2 ? 0xe02020 : 0x101010)
  }

  return {
    step() {
      if (wait > 0) {
        if (--wait === 0 && n >= 52) {
          canvas.fill(felt)
          n = 0
        }
        return
      }
      if (!card) {
        const k = n % piles
        card = { x: pileX(k), y: 1, vx: -(0.6 + rng() * 1.4) * (rng() < 0.2 ? -1 : 1), vy: (rng() - 0.6) * 1.5, s: n }
        n++
      }
      card.vy += 0.12
      card.x += card.vx
      card.y += card.vy
      if (card.y > H - ch - 1) {
        card.y = H - ch - 1
        card.vy = -card.vy * (0.75 + rng() * 0.1)
      }
      stamp(canvas, card.x, card.y, card.s)
      if (card.x < -cw || card.x > W) {
        card = undefined
        if (n >= 52) wait = 40
      }
    },
    draw(px) {
      px.set(canvas)
      for (let k = 0; k < piles; k++) {
        const left = 13 - Math.floor(n / piles) - (k < n % piles ? 1 : 0)
        if (left > 0) stamp(px, pileX(k), 1, k + (13 - left) * 4)
        else rect(px, W, H, pileX(k), 1, cw, ch, 0x0a6a32)
      }
    },
  }
}

// --- mini-runner, Subway style ----------------------------------------------

const runner: Maker = (W, H, rng) => {
  const hy = Math.round(H * 0.3)
  const cx = W / 2
  const lw = W * 0.34
  const K = 0.16
  const TL = 4
  const PD = 1.2
  const FAR = 30
  const proj = (d: number) => 1 / (1 + Math.max(d, -0.9) * K)
  const yOf = (d: number) => hy + (H - hy) * proj(d)
  const xOf = (lane: number, d: number) => cx + (lane - 1) * lw * proj(d)
  const skyTop = hsv(0.58 + rng() * 0.12, 0.6, 0.6)
  const skyBot = hsv(0.03 + rng() * 0.08, 0.45, 1)
  const wallHue = rng()
  const city = mix(skyTop, 0x100820, 0.55)
  const skyline: number[] = []
  while (skyline.length < W) {
    const w = 2 + Math.floor(rng() * 4)
    const h = 2 + Math.floor(rng() * hy * 0.45)
    for (let i = 0; i < w; i++) skyline.push(h)
  }
  const TRAIN = [0xe8403a, 0x3a8ee8, 0xf0b429, 0x41c47b, 0xb44ae8]
  type Ob = { lane: number; d: number; kind: 0 | 1 | 2; color: number }
  let obs: Ob[] = []
  let dist = 0
  let speed = 0.3
  let x = 1
  let target = 1
  let jumpT = 0
  let frame = 0
  let score = 0
  let flash = 0
  let nextSpawn = 0
  const len = (o: Ob) => (o.kind === 0 ? TL : o.kind === 1 ? 0.6 : 0.3)

  function spawnRow(at: number) {
    const lanes = [0, 1, 2].sort(() => rng() - 0.5)
    const blocked = rng() < 0.4 ? 2 : 1
    lanes.forEach((lane, i) => {
      if (i < blocked) {
        const kind = rng() < 0.65 ? 0 : 1
        obs.push({ lane, d: at, kind, color: TRAIN[Math.floor(rng() * TRAIN.length)] as number })
      } else if (rng() < 0.7) {
        for (let k = 0; k < 4; k++) obs.push({ lane, d: at + k * 1.3, kind: 2, color: 0xffd23f })
      }
    })
  }
  for (let d = 10; d < FAR; d += 9) spawnRow(d)

  const danger = (l: number) =>
    obs.find(o => o.lane === l && o.kind !== 2 && o.d + len(o) > PD - 0.3 && o.d < PD + 7.5)

  return {
    step() {
      frame++
      if (flash > 0) flash--
      dist += speed
      speed = Math.min(0.55, speed + 0.0004)
      for (const o of obs) o.d -= speed
      obs = obs.filter(o => o.d + len(o) > -1)
      nextSpawn -= speed
      if (nextSpawn <= 0) {
        spawnRow(FAR)
        nextSpawn = 8 + rng() * 5
      }

      const here = danger(target)
      if (here?.kind === 1 && !obs.some(o => o.kind === 0 && o.lane === target && o.d < PD + 7.5)) {
        if (here.d - PD < 1.6 && jumpT === 0) jumpT = 14
      } else if (here) {
        const free = [0, 1, 2].filter(l => !danger(l))
        const coin = free.find(l => obs.some(o => o.kind === 2 && o.lane === l && o.d < PD + 8))
        const pick = coin ?? free.sort((a, b) => Math.abs(a - x) - Math.abs(b - x))[0]
        if (pick !== undefined) target = pick
      } else if (rng() < 0.02) {
        const coin = [0, 1, 2].find(l => !danger(l) && obs.some(o => o.kind === 2 && o.lane === l && o.d < PD + 6))
        if (coin !== undefined) target = coin
      }
      x += Math.max(-0.22, Math.min(0.22, target - x))
      if (jumpT > 0) jumpT--

      const lane = Math.round(x)
      for (const o of obs) {
        if (o.lane !== lane || o.d > PD + 0.4 || o.d + len(o) < PD - 0.4) continue
        if (o.kind === 2) {
          o.d = -99
          score++
        } else if (o.kind === 0 || jumpT === 0) {
          flash = 8
          obs = obs.filter(p => p.d > PD + 6)
          break
        }
      }
    },
    draw(px) {
      sky(px, W, H, skyTop, skyBot, hy)
      disc(px, W, H, W * 0.72, hy * 0.5, W * 0.08, 0xfff1b8)
      for (let i = 0; i < W; i++) for (let y = hy - (skyline[i] ?? 0); y < hy; y++) dot(px, W, H, i, y, city)

      for (let y = hy; y < H; y++) {
        const p = (y - hy + 0.5) / (H - hy)
        const d = (1 / p - 1) / K
        const w = d + dist
        const half = lw * 1.5 * p
        const fog = (1 - p) * (1 - p) * 0.7
        for (let i = 0; i < W; i++) {
          const dx = i + 0.5 - cx
          let c: number
          if (Math.abs(dx) > half) {
            const panel = Math.floor(w / 3)
            c = hsv(wallHue + (panel % 5) * 0.17, 0.55, 0.35 + 0.3 * p)
            if ((w % 3) < 0.25) c = 0x2a2230
          } else {
            const lf = dx / (lw * p) + 1.5
            const local = lf - Math.floor(lf)
            c = (w * 0.9) % 1 < 0.3 ? 0x6b4a2b : 0x4b4552
            const rail = Math.min(Math.abs(local - 0.22), Math.abs(local - 0.78)) * lw * p
            if (rail < 0.55) c = 0xb8c0cc
          }
          px[y * W + i] = mix(c, skyBot, fog)
        }
      }

      const items: Array<{ d: number; draw: () => void }> = obs
        .filter(o => o.d > -0.9)
        .map(o => ({
          d: o.d,
          draw: () => {
            const p = proj(o.d)
            const ox = xOf(o.lane, o.d)
            const oy = yOf(o.d)
            if (o.kind === 0) {
              const roof = mix(o.color, 0xffffff, 0.35)
              for (let dd = o.d + TL; dd > o.d; dd -= 0.08) {
                const q = proj(dd)
                const ry = yOf(dd) - lw * q
                rect(px, W, H, xOf(o.lane, dd) - 0.4 * lw * q, ry, 0.8 * lw * q, 1, roof)
              }
              const fw = 0.8 * lw * p
              const fh = lw * p
              rect(px, W, H, ox - fw / 2, oy - fh, fw, fh, o.color)
              rect(px, W, H, ox - fw * 0.35, oy - fh * 0.82, fw * 0.7, fh * 0.32, 0x1d2b3a)
              dot(px, W, H, ox - fw * 0.3, oy - fh * 0.25, 0xfff4a0)
              dot(px, W, H, ox + fw * 0.3 - 1, oy - fh * 0.25, 0xfff4a0)
            } else if (o.kind === 1) {
              const bw = 0.8 * lw * p
              const bh = Math.max(1, 0.35 * lw * p)
              for (let yy = 0; yy < bh; yy++)
                for (let xx = 0; xx < bw; xx++)
                  dot(px, W, H, ox - bw / 2 + xx, oy - bh * 1.6 + yy, ((xx + yy) >> 1) & 1 ? 0xe8403a : 0xf4f4f4)
              rect(px, W, H, ox - bw / 2, oy - bh * 0.6, 1, bh * 0.6, 0x555555)
              rect(px, W, H, ox + bw / 2 - 1, oy - bh * 0.6, 1, bh * 0.6, 0x555555)
            } else {
              const r = Math.max(0.5, 0.12 * lw * p)
              const bob = Math.sin(frame * 0.3 + o.d) * 0.6 * p
              disc(px, W, H, ox, oy - 0.4 * lw * p + bob, r, (frame + Math.round(o.d * 3)) % 8 < 2 ? 0xfff8d0 : o.color)
            }
          },
        }))
      items.push({
        d: PD,
        draw: () => {
          const p = proj(PD)
          const jh = jumpT > 0 ? Math.sin(Math.PI * (1 - jumpT / 14)) : 0
          const bx = Math.round(cx + (x - 1) * lw * p - 3)
          const by = Math.round(yOf(PD) - 9 - jh * lw * 0.9 * p)
          rect(px, W, H, bx + 1, yOf(PD) - 1, 4, 1, 0x2a2228)
          const legs = frame % 6 < 3 || jh > 0 ? ['.p..p.', '.k..k.'] : ['..pp..', '.k..k.']
          sprite(px, W, H, bx, by, ['..cc..', '.cccc.', '.hhhh.', '..ss..', '.ssss.', 's.ss.s', '..pp..', ...legs], {
            c: 0xe8403a,
            h: 0x5a3a22,
            s: 0x3ab4e8,
            p: 0x2b3a67,
            k: 0xf4f4f4,
          })
        },
      })
      items.sort((a, b) => b.d - a.d).forEach(it => it.draw())

      text(px, W, H, 2, 2, String(score), 0x000000)
      text(px, W, H, 1, 1, String(score), 0xffd23f)
      if (flash > 0) for (let i = 0; i < px.length; i++) px[i] = mix(px[i] as number, 0xffffff, flash / 10)
    },
  }
}

// --- Tetris (a heuristic bot, no model) -----------------------------------

const tetris: Maker = (W, H, rng) => {
  const COLS = 10
  const ROWS = 20
  const cs = Math.max(1, Math.floor(Math.min((W - 2) / COLS, (H - 8) / ROWS)))
  const ox = Math.floor((W - COLS * cs) / 2)
  const oy = H - ROWS * cs - 1
  const SHAPES: [number, number][][] = [
    [[0, 1], [1, 1], [2, 1], [3, 1]],
    [[0, 0], [1, 0], [0, 1], [1, 1]],
    [[1, 0], [0, 1], [1, 1], [2, 1]],
    [[1, 0], [2, 0], [0, 1], [1, 1]],
    [[0, 0], [1, 0], [1, 1], [2, 1]],
    [[0, 0], [0, 1], [1, 1], [2, 1]],
    [[2, 0], [0, 1], [1, 1], [2, 1]],
  ]
  const COLORS = [0x3ae0e8, 0xf0e040, 0xb44ae8, 0x41d46b, 0xe8403a, 0x3a6ee8, 0xf09a2a]
  const norm = (cells: [number, number][]) => {
    const mx = Math.min(...cells.map(c => c[0]))
    const my = Math.min(...cells.map(c => c[1]))
    return cells.map(([x, y]) => [x - mx, y - my] as [number, number])
  }
  const ROTS = SHAPES.map(s => {
    const out: [number, number][][] = []
    let cur = s
    for (let i = 0; i < 4; i++) {
      const n = norm(cur)
      if (!out.some(o => JSON.stringify(o) === JSON.stringify(n))) out.push(n)
      cur = cur.map(([x, y]) => [-y, x] as [number, number])
    }
    return out
  })
  let board = new Int32Array(COLS * ROWS)
  let piece = { k: 0, r: 0, x: 3, y: 0 }
  let target = { r: 0, x: 3 }
  let clearing: number[] = []
  let flash = 0
  let wipe = 0
  let lines = 0
  let frame = 0

  const cellsOf = (k: number, r: number) => (ROTS[k] as [number, number][][])[r % (ROTS[k] as [number, number][][]).length] as [number, number][]
  const valid = (b: Int32Array, k: number, r: number, x: number, y: number) =>
    cellsOf(k, r).every(([cx, cy]) => {
      const X = x + cx
      const Y = y + cy
      return X >= 0 && X < COLS && Y < ROWS && (Y < 0 || !b[Y * COLS + X])
    })

  function evaluate(b: Int32Array) {
    let full = 0
    const heights: number[] = []
    let holes = 0
    for (let y = 0; y < ROWS; y++) {
      let n = 0
      for (let x = 0; x < COLS; x++) if (b[y * COLS + x]) n++
      if (n === COLS) full++
    }
    for (let x = 0; x < COLS; x++) {
      let hgt = 0
      let seen = false
      for (let y = 0; y < ROWS; y++) {
        if (b[y * COLS + x]) {
          if (!seen) hgt = ROWS - y
          seen = true
        } else if (seen) holes++
      }
      heights.push(hgt)
    }
    const agg = heights.reduce((a, h) => a + h, 0)
    let bump = 0
    for (let x = 1; x < COLS; x++) bump += Math.abs((heights[x] as number) - (heights[x - 1] as number))
    return -0.51 * agg + 0.76 * full - 0.36 * holes - 0.18 * bump
  }

  function spawn() {
    const k = Math.floor(rng() * SHAPES.length)
    piece = { k, r: 0, x: 3, y: 0 }
    if (!valid(board, k, 0, 3, 0)) {
      wipe = ROWS
      return
    }
    let best = -Infinity
    for (let r = 0; r < (ROTS[k] as unknown[]).length; r++)
      for (let x = -2; x < COLS; x++) {
        if (!valid(board, k, r, x, 0)) continue
        let y = 0
        while (valid(board, k, r, x, y + 1)) y++
        const b = board.slice()
        for (const [cx, cy] of cellsOf(k, r)) if (y + cy >= 0) b[(y + cy) * COLS + x + cx] = 1
        const s = evaluate(b) + rng() * 0.05
        if (s > best) {
          best = s
          target = { r, x }
        }
      }
  }
  spawn()

  return {
    step() {
      frame++
      if (wipe > 0) {
        wipe--
        board.fill(0, wipe * COLS, (wipe + 1) * COLS)
        if (wipe === 0) {
          board = new Int32Array(COLS * ROWS)
          lines = 0
          spawn()
        }
        return
      }
      if (flash > 0) {
        if (--flash === 0) {
          for (const row of clearing) {
            board.copyWithin(COLS, 0, row * COLS)
            board.fill(0, 0, COLS)
          }
          lines += clearing.length
          clearing = []
          spawn()
        }
        return
      }
      const { k } = piece
      if (piece.r !== target.r && frame % 2 === 0 && valid(board, k, piece.r + 1, piece.x, piece.y)) piece.r = (piece.r + 1) % (ROTS[k] as unknown[]).length
      else if (piece.x !== target.x && valid(board, k, piece.r, piece.x + Math.sign(target.x - piece.x), piece.y)) piece.x += Math.sign(target.x - piece.x)
      const aligned = piece.r === target.r && piece.x === target.x
      if (aligned || frame % 3 === 0) {
        if (valid(board, k, piece.r, piece.x, piece.y + 1)) piece.y++
        else {
          for (const [cx, cy] of cellsOf(k, piece.r)) if (piece.y + cy >= 0) board[(piece.y + cy) * COLS + piece.x + cx] = COLORS[k] as number
          for (let y = 0; y < ROWS; y++) {
            let n = 0
            for (let x = 0; x < COLS; x++) if (board[y * COLS + x]) n++
            if (n === COLS) clearing.push(y)
          }
          if (clearing.length) flash = 6
          else spawn()
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x101028, 0x1a1030)
      rect(px, W, H, ox - 1, oy - 1, COLS * cs + 2, ROWS * cs + 2, 0x4a4a70)
      rect(px, W, H, ox, oy, COLS * cs, ROWS * cs, 0x14142a)
      const cell = (x: number, y: number, c: number) => {
        if (cs >= 3) slab(px, W, H, ox + x * cs, oy + y * cs, cs, cs, c)
        else {
          rect(px, W, H, ox + x * cs, oy + y * cs, cs, cs, c)
          if (cs >= 2) {
            dot(px, W, H, ox + x * cs, oy + y * cs, mix(c, 0xffffff, 0.5))
            dot(px, W, H, ox + x * cs + 1, oy + y * cs + 1, scale(c, 0.7))
          }
        }
      }
      for (let y = 0; y < ROWS; y++)
        for (let x = 0; x < COLS; x++) {
          const c = board[y * COLS + x] as number
          if (c) cell(x, y, clearing.includes(y) && flash % 2 ? 0xffffff : c)
        }
      if (!flash && !wipe)
        for (const [cx, cy] of cellsOf(piece.k, piece.r)) if (piece.y + cy >= 0) cell(piece.x + cx, piece.y + cy, COLORS[piece.k] as number)
      text(px, W, H, ox, 1, String(lines), 0xf0e040)
    },
  }
}

// --- brick breaker -------------------------------------------------------------

const briques: Maker = (W, H, rng) => {
  const BC = Math.floor((W - 2) / 4)
  const BR = 7
  const bx0 = Math.floor((W - BC * 4) / 2) + 1
  const top = 7
  const bricks = new Uint32Array(BC * BR)
  let hue = rng()
  const build = () => {
    for (let r = 0; r < BR; r++) for (let c = 0; c < BC; c++) bricks[r * BC + c] = hsv(hue + r * 0.11, 0.7, 1)
    hue += 0.3
  }
  build()
  const padY = H - 4
  const pw = 7
  let pad = W / 2
  let ball = { x: W / 2, y: padY - 2, vx: 0.45, vy: -0.75 }
  let trail: [number, number][] = []
  let parts: { x: number; y: number; vx: number; vy: number; c: number; life: number }[] = []
  let score = 0
  let rebuild = 0

  return {
    step() {
      if (rebuild > 0) {
        if (--rebuild === 0) build()
      }
      for (let sub = 0; sub < 2; sub++) {
        ball.x += ball.vx / 2
        ball.y += ball.vy / 2
        if (ball.x < 0 || ball.x > W - 1) {
          ball.vx = -ball.vx
          ball.x = Math.max(0, Math.min(W - 1, ball.x))
        }
        if (ball.y < 0) {
          ball.vy = Math.abs(ball.vy)
          ball.y = 0
        }
        const c = Math.floor((ball.x - bx0) / 4)
        const r = Math.floor((ball.y - top) / 3)
        const inBrick = (ball.x - bx0) % 4 < 3 && (ball.y - top) % 3 < 2
        if (c >= 0 && c < BC && r >= 0 && r < BR && inBrick && bricks[r * BC + c]) {
          const col = bricks[r * BC + c] as number
          bricks[r * BC + c] = 0
          ball.vy = -ball.vy
          score++
          for (let i = 0; i < 5; i++) parts.push({ x: ball.x, y: ball.y, vx: (rng() - 0.5) * 1.2, vy: (rng() - 0.5) * 1.2, c: col, life: 14 })
          if (!bricks.some(b => b !== 0)) rebuild = 25
        }
        if (ball.vy > 0 && ball.y >= padY - 1 && ball.y <= padY + 0.5 && Math.abs(ball.x - pad) <= pw / 2 + 0.5) {
          const off = (ball.x - pad) / (pw / 2)
          const sp = Math.hypot(ball.vx, ball.vy)
          ball.vx = off * 0.7
          ball.vy = -Math.sqrt(Math.max(0.2, sp * sp - ball.vx * ball.vx))
        }
        if (ball.y > H) ball = { x: pad, y: padY - 2, vx: (rng() - 0.5) * 0.8, vy: -0.75 }
      }
      const aim = ball.x + (rng() - 0.5) * 2
      pad += Math.max(-0.8, Math.min(0.8, aim - pad))
      pad = Math.max(pw / 2, Math.min(W - pw / 2, pad))
      trail.unshift([ball.x, ball.y])
      trail = trail.slice(0, 4)
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.05
        p.life--
      }
      parts = parts.filter(p => p.life > 0)
    },
    draw(px) {
      sky(px, W, H, 0x1a0f2e, 0x0a0614)
      for (let r = 0; r < BR; r++)
        for (let c = 0; c < BC; c++) {
          const col = bricks[r * BC + c] as number
          if (!col) continue
          rect(px, W, H, bx0 + c * 4, top + r * 3, 3, 2, col)
          rect(px, W, H, bx0 + c * 4, top + r * 3, 3, 1, mix(col, 0xffffff, 0.35))
        }
      for (const p of parts) dot(px, W, H, p.x, p.y, mix(0x000000, p.c, p.life / 14))
      trail.forEach(([x, y], i) => dot(px, W, H, x, y, mix(0xffffff, 0x1a0f2e, i / 4)))
      rect(px, W, H, pad - pw / 2, padY, pw, 1, 0xe0e0ff)
      dot(px, W, H, pad - pw / 2, padY, 0x3ae0e8)
      dot(px, W, H, pad + pw / 2 - 1, padY, 0x3ae0e8)
      text(px, W, H, 1, 1, String(score), 0xb0b0d0)
    },
  }
}

// --- top-down racing ------------------------------------------------------

const course: Maker = (W, H, rng) => {
  const half = W * 0.28
  const ph = rng() * 100
  const center = (wy: number) => W / 2 + Math.sin(wy * 0.035 + ph) * W * 0.16 + Math.sin(wy * 0.011) * W * 0.07
  const CAR = ['.rrr.', 'rwwwr', 'rrrrr', 'krrrk', 'rrrrr', 'rwwwr', 'krrrk', '.rrr.']
  const playerY = H - 10
  let s = 0
  let lane = 1
  let px0 = W / 2
  let opp: { wy: number; lane: number; c: number }[] = []
  let overtakes = 0
  let flash = 0
  const trees: { wy: number; side: number; off: number }[] = []
  for (let wy = 0; wy < H + 20; wy += 7) trees.push({ wy, side: rng() < 0.5 ? -1 : 1, off: rng() * 4 })
  const laneX = (wy: number, l: number) => center(wy) + (l === 0 ? -1 : 1) * half * 0.45

  return {
    step() {
      s += 1.1
      if (flash > 0) flash--
      if (rng() < 0.03 && !opp.some(o => o.wy > s + H - 6)) opp.push({ wy: s + H + 6, lane: rng() < 0.5 ? 0 : 1, c: hsv(rng(), 0.7, 0.9) })
      for (const o of opp) o.wy += 0.55
      const pwy = s + H - playerY
      for (const o of opp) {
        if (o.wy < pwy - 2 && !(o as { passed?: boolean }).passed) {
          ;(o as { passed?: boolean }).passed = true
          overtakes++
        }
      }
      opp = opp.filter(o => o.wy > s - 10)
      const ahead = opp.find(o => o.lane === lane && o.wy > pwy && o.wy - pwy < 22)
      if (ahead) lane = 1 - lane
      const tx = laneX(pwy, lane)
      px0 += Math.max(-0.6, Math.min(0.6, tx - px0))
      for (const o of opp) if (Math.abs(o.wy - pwy) < 6 && Math.abs(laneX(o.wy, o.lane) - px0) < 4) flash = 6
      while ((trees[trees.length - 1]?.wy ?? 0) < s + H + 20) trees.push({ wy: (trees[trees.length - 1]?.wy ?? s) + 7, side: rng() < 0.5 ? -1 : 1, off: rng() * 4 })
      while ((trees[0]?.wy ?? Infinity) < s - 5) trees.shift()
    },
    draw(px) {
      for (let y = 0; y < H; y++) {
        const wy = s + H - y
        const c = center(wy)
        for (let x = 0; x < W; x++) {
          const dx = Math.abs(x + 0.5 - c)
          let col: number
          if (dx < half) {
            col = (x * 3 + Math.floor(wy) * 7) % 13 === 0 ? 0x44444c : 0x3a3a42
            if (dx < 0.6 && Math.floor(wy / 4) % 2 === 0) col = 0xf4f4f4
          } else if (dx < half + 1.5) col = Math.floor(wy / 2) % 2 ? 0xe8403a : 0xf4f4f4
          else col = Math.floor(wy / 6) % 2 ? 0x3a9a40 : 0x348a3a
          px[y * W + x] = col
        }
      }
      for (const t of trees) {
        const y = s + H - t.wy
        const x = center(t.wy) + t.side * (half + 4 + t.off)
        rect(px, W, H, x, y + 1, 1, 2, 0x5a3a22)
        lit(px, W, H, x, y, 2, 2, 0x2a7a34)
      }
      for (const o of opp) litSprite(px, W, H, laneX(o.wy, o.lane) - 2, s + H - o.wy - 4, CAR, { r: o.c, w: 0x9fd8ff, k: 0x111111 })
      litSprite(px, W, H, px0 - 2, playerY - 4, CAR, { r: flash > 0 && flash % 2 ? 0xffffff : 0xe8203a, w: 0x9fd8ff, k: 0x111111 })
      text(px, W, H, 1, 1, String(overtakes), 0xffffff)
    },
  }
}

// --- Snake (a path-finding bot) -------------------------------------------------

const snake: Maker = (W, H, rng) => {
  const cs = 2
  const GW = Math.floor(W / cs)
  const GH = Math.floor((H - 6) / cs)
  const oy = H - GH * cs
  let body: [number, number][] = []
  let apple: [number, number] = [0, 0]
  let frame = 0
  let dead = 0
  let best = 0
  const hue = rng()

  const key = (x: number, y: number) => y * GW + x
  function placeApple() {
    const used = new Set(body.map(([x, y]) => key(x, y)))
    const free: [number, number][] = []
    for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if (!used.has(key(x, y))) free.push([x, y])
    apple = free[Math.floor(rng() * free.length)] ?? [0, 0]
  }
  function reset() {
    const y = Math.floor(GH / 2)
    body = [
      [4, y],
      [3, y],
      [2, y],
    ]
    placeApple()
  }
  reset()

  // Breadth-first search from the head to a target, through cells the body
  // will have left by the time the head gets there.
  function firstStep(tx: number, ty: number, ignoreTail: boolean): [number, number] | undefined {
    const [hx, hy] = body[0] as [number, number]
    const blocked = new Set(body.slice(0, ignoreTail ? -1 : undefined).map(([x, y]) => key(x, y)))
    const from = new Map<number, number>()
    const queue: [number, number][] = [[hx, hy]]
    from.set(key(hx, hy), -1)
    while (queue.length) {
      const [x, y] = queue.shift() as [number, number]
      if (x === tx && y === ty) {
        let k = key(x, y)
        while (from.get(k) !== key(hx, hy)) k = from.get(k) as number
        return [k % GW, Math.floor(k / GW)]
      }
      for (const [dx, dy] of DIRS) {
        const nx = x + dx
        const ny = y + dy
        const nk = key(nx, ny)
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || from.has(nk) || blocked.has(nk)) continue
        from.set(nk, key(x, y))
        queue.push([nx, ny])
      }
    }
    return undefined
  }

  return {
    step() {
      frame++
      if (dead > 0) {
        if (--dead === 0) reset()
        return
      }
      if (frame % 2) return
      const tail = body[body.length - 1] as [number, number]
      let next = firstStep(apple[0], apple[1], true) ?? firstStep(tail[0], tail[1], true)
      if (!next) {
        const [hx, hy] = body[0] as [number, number]
        const used = new Set(body.map(([x, y]) => key(x, y)))
        const free = DIRS.map(([dx, dy]) => [hx + dx, hy + dy] as [number, number]).filter(
          ([x, y]) => x >= 0 && y >= 0 && x < GW && y < GH && !used.has(key(x, y)),
        )
        next = free[0]
      }
      if (!next) {
        dead = 30
        return
      }
      body.unshift(next)
      if (next[0] === apple[0] && next[1] === apple[1]) {
        best = Math.max(best, body.length - 3)
        if (body.length > GW * GH * 0.55) dead = 30
        else placeApple()
      } else body.pop()
    },
    draw(px) {
      sky(px, W, H, 0x0c1a10, 0x08120a)
      for (let y = 0; y < GH; y++)
        for (let x = 0; x < GW; x++) if ((x + y) % 2 === 0) rect(px, W, H, x * cs, oy + y * cs, cs, cs, 0x10241a)
      lit(px, W, H, apple[0] * cs + 0.5, oy + apple[1] * cs + 0.5, 1.4, 1.4, 0xff3a3a)
      dot(px, W, H, apple[0] * cs + 1, oy + apple[1] * cs - 1, 0x3ac040)
      body.forEach(([x, y], i) => {
        const c = dead > 0 && dead % 4 < 2 ? 0xffffff : hsv(hue + i * 0.015, 0.75, i === 0 ? 1 : 0.85)
        rect(px, W, H, x * cs, oy + y * cs, cs, cs, c)
      })
      const [hx, hy] = body[0] as [number, number]
      dot(px, W, H, hx * cs, oy + hy * cs, 0x000000)
      text(px, W, H, 1, 0, String(body.length - 3), 0xb0ffb0)
    },
  }
}

// --- the Chrome dino ------------------------------------------------------------

const dino: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.68)
  const dx = 4
  const RUN_A = ['.....xxxx', '.....x.xx', '.....xxxx', '.....xxx.', 'x...xxxx.', 'xx.xxxxxx', 'xxxxxxx..', '.xxxxxx..', '..xx.x...', '..x...x..']
  const RUN_B = ['.....xxxx', '.....x.xx', '.....xxxx', '.....xxx.', 'x...xxxx.', 'xx.xxxxxx', 'xxxxxxx..', '.xxxxxx..', '..x..xx..', '..xx.....']
  const DUCK = ['.......xxxx', 'xx.xxxxx.xx', 'xxxxxxxxxxx', '.xxxxxxxx..', '..x..x.....']
  const CACTUS = ['.x.', 'xx.', 'xxx', '.xx', '.x.', '.x.', '.x.']
  const BIRD_A = ['x......', 'xx...xx', '.xxxxx.', '...x...']
  const BIRD_B = ['...x...', '.xxxxxx', 'xx.....', 'x......']
  type Ob = { x: number; kind: 'cactus' | 'big' | 'bird'; y: number }
  let obs: Ob[] = []
  let y = 0
  let vy = 0
  let duck = 0
  let speed = 1
  let score = 0
  let frame = 0
  let nextGap = 30
  let clouds = Array.from({ length: 3 }, () => ({ x: rng() * W, y: 4 + rng() * ground * 0.5 }))

  return {
    step() {
      frame++
      speed = Math.min(2, 1 + score / 1500)
      score++
      for (const o of obs) o.x -= speed
      obs = obs.filter(o => o.x > -8)
      if (--nextGap <= 0) {
        const r = rng()
        obs.push(r < 0.2 && score > 200 ? { x: W + 2, kind: 'bird', y: ground - 13 } : { x: W + 2, kind: r < 0.55 ? 'cactus' : 'big', y: ground })
        nextGap = 35 + Math.floor(rng() * 40)
      }
      for (const c of clouds) {
        c.x -= 0.2
        if (c.x < -8) c.x = W + 4
      }
      const near = obs.find(o => o.x + 6 > dx && o.x - dx < 14)
      if (near && near.kind === 'bird') duck = 6
      else if (near && y === 0 && near.x - dx < 9 + speed * 3) vy = -2.6
      if (duck > 0) duck--
      vy += 0.25
      y = Math.min(0, y + vy)
      if (y === 0) vy = 0
    },
    draw(px) {
      const night = Math.floor(score / 700) % 2 === 1
      const bg = night ? 0x202124 : 0xf7f7f7
      const fg = night ? 0xbdbdbd : 0x535353
      px.fill(bg)
      for (const c of clouds) {
        rect(px, W, H, c.x, c.y, 6, 1, night ? 0x3a3a3a : 0xdcdcdc)
        rect(px, W, H, c.x + 1, c.y - 1, 3, 1, night ? 0x3a3a3a : 0xdcdcdc)
      }
      if (night) disc(px, W, H, W * 0.75, 8, 2, 0xe8e8e8)
      for (let x = 0; x < W; x++) {
        dot(px, W, H, x, ground, fg)
        if ((x * 7 + score) % 11 === 0) dot(px, W, H, x, ground + 2, fg)
        if ((x * 5 + score) % 17 === 0) dot(px, W, H, x, ground + 4, fg)
      }
      const colors = { x: fg }
      for (const o of obs) {
        if (o.kind === 'bird') sprite(px, W, H, o.x, o.y, Math.floor(frame / 6) % 2 ? BIRD_A : BIRD_B, colors)
        else if (o.kind === 'big') {
          sprite(px, W, H, o.x, o.y - 7, CACTUS, colors)
          sprite(px, W, H, o.x + 3, o.y - 7, CACTUS, colors)
        } else sprite(px, W, H, o.x, o.y - 7, CACTUS, colors)
      }
      if (duck > 0) sprite(px, W, H, dx, ground - 5, DUCK, colors)
      else sprite(px, W, H, dx, ground - 10 + y, y < 0 || Math.floor(frame / 4) % 2 ? RUN_A : RUN_B, colors)
      text(px, W, H, W - 4 * String(Math.floor(score / 10)).length, 1, String(Math.floor(score / 10)), fg)
    },
  }
}

// --- Pac-Man ----------------------------------------------------------------------

const pacman: Maker = (W, H, rng) => {
  const MAZE = [
    '##########',
    '#o......o#',
    '#.##..##.#',
    '#........#',
    '#.#.##.#.#',
    '#.#....#.#',
    '#...##...#',
    '###.##.###',
    '#........#',
    '###.##.###',
    '#...##...#',
    '#.#....#.#',
    '#.#.##.#.#',
    '#........#',
    '#.##..##.#',
    '#o......o#',
    '##########',
  ]
  const MW = 10
  const MH = MAZE.length
  const ts = Math.max(2, Math.floor(Math.min(W / MW, (H - 5) / MH)))
  const ox = Math.floor((W - MW * ts) / 2)
  const oy = H - MH * ts
  const wall = (x: number, y: number) => x < 0 || y < 0 || x >= MW || y >= MH || (MAZE[y] as string)[x] === '#'
  let pellets = new Map<number, 'dot' | 'power'>()
  const fill = () => {
    pellets = new Map()
    MAZE.forEach((row, y) =>
      [...row].forEach((ch, x) => {
        if (ch === '.') pellets.set(y * MW + x, 'dot')
        if (ch === 'o') pellets.set(y * MW + x, 'power')
      }),
    )
    pellets.delete(13 * MW + 4)
  }
  fill()
  type Mover = { x: number; y: number; px: number; py: number; t: number }
  const pac: Mover & { dir: [number, number] } = { x: 4, y: 13, px: 4, py: 13, t: 0, dir: [1, 0] }
  const GHOSTS = [0xff0000, 0xffb8ff, 0x00ffff, 0xffb852]
  const ghosts = GHOSTS.map((c, i) => ({ x: 3 + (i % 2) * 3, y: 8, px: 3 + (i % 2) * 3, py: 8, t: 0, c, home: 0 }))
  let fright = 0
  let frame = 0
  let score = 0
  let dying = 0

  const neighbors = (x: number, y: number) => DIRS.map(([dx, dy]) => [x + dx, y + dy] as [number, number]).filter(([a, b]) => !wall(a, b))
  function bfs(fromX: number, fromY: number, goal: (x: number, y: number) => boolean, avoid: Set<number>) {
    const seen = new Map<number, number>([[fromY * MW + fromX, -1]])
    const q: [number, number][] = [[fromX, fromY]]
    while (q.length) {
      const [x, y] = q.shift() as [number, number]
      if (goal(x, y) && !(x === fromX && y === fromY)) {
        let k = y * MW + x
        while (seen.get(k) !== fromY * MW + fromX) k = seen.get(k) as number
        return [k % MW, Math.floor(k / MW)] as [number, number]
      }
      for (const [a, b] of neighbors(x, y)) {
        const k = b * MW + a
        if (seen.has(k) || avoid.has(k)) continue
        seen.set(k, y * MW + x)
        q.push([a, b])
      }
    }
    return undefined
  }

  return {
    step() {
      frame++
      if (dying > 0) {
        if (--dying === 0) {
          Object.assign(pac, { x: 4, y: 13, px: 4, py: 13, t: 0 })
          ghosts.forEach((g, i) => Object.assign(g, { x: 3 + (i % 2) * 3, y: 8, px: 3 + (i % 2) * 3, py: 8, t: 0 }))
        }
        return
      }
      if (fright > 0) fright--
      pac.t += 1 / 4
      if (pac.t >= 1) {
        pac.t = 0
        pac.px = pac.x
        pac.py = pac.y
        const k = pac.y * MW + pac.x
        const p = pellets.get(k)
        if (p) {
          pellets.delete(k)
          score += p === 'power' ? 5 : 1
          if (p === 'power') fright = 90
        }
        if (pellets.size === 0) fill()
        const danger = new Set<number>()
        if (fright < 20)
          for (const g of ghosts) {
            danger.add(g.y * MW + g.x)
            for (const [a, b] of neighbors(g.x, g.y)) danger.add(b * MW + a)
          }
        const step = bfs(pac.x, pac.y, (x, y) => pellets.has(y * MW + x), danger) ??
          neighbors(pac.x, pac.y).sort(
            (a, b) =>
              Math.min(...ghosts.map(g => Math.abs(g.x - b[0]) + Math.abs(g.y - b[1]))) -
              Math.min(...ghosts.map(g => Math.abs(g.x - a[0]) + Math.abs(g.y - a[1]))),
          )[0]
        if (step) {
          pac.dir = [step[0] - pac.x, step[1] - pac.y]
          pac.x = step[0]
          pac.y = step[1]
        }
      }
      for (const g of ghosts) {
        g.t += fright > 0 ? 1 / 8 : 1 / 5
        if (g.t < 1) continue
        g.t = 0
        const back = [g.px, g.py]
        g.px = g.x
        g.py = g.y
        let options = neighbors(g.x, g.y).filter(([a, b]) => a !== back[0] || b !== back[1])
        if (options.length === 0) options = neighbors(g.x, g.y)
        const d = (o: [number, number]) => Math.abs(o[0] - pac.x) + Math.abs(o[1] - pac.y)
        options.sort((a, b) => (fright > 0 ? d(b) - d(a) : d(a) - d(b)))
        const pickOne = rng() < 0.65 ? options[0] : options[Math.floor(rng() * options.length)]
        if (pickOne) {
          g.x = pickOne[0]
          g.y = pickOne[1]
        }
      }
      for (const g of ghosts)
        if (g.x === pac.x && g.y === pac.y) {
          if (fright > 0) {
            score += 20
            Object.assign(g, { x: 4, y: 8, px: 4, py: 8, t: 0 })
          } else dying = 30
        }
    },
    draw(px) {
      px.fill(0x000000)
      for (let y = 0; y < MH; y++)
        for (let x = 0; x < MW; x++) {
          if (wall(x, y)) {
            rect(px, W, H, ox + x * ts, oy + y * ts, ts, ts, 0x10106a)
            const edge = (a: number, b: number) => !wall(a, b)
            if (edge(x, y - 1)) rect(px, W, H, ox + x * ts, oy + y * ts, ts, 1, 0x3a3aff)
            if (edge(x, y + 1)) rect(px, W, H, ox + x * ts, oy + y * ts + ts - 1, ts, 1, 0x3a3aff)
            if (edge(x - 1, y)) rect(px, W, H, ox + x * ts, oy + y * ts, 1, ts, 0x3a3aff)
            if (edge(x + 1, y)) rect(px, W, H, ox + x * ts + ts - 1, oy + y * ts, 1, ts, 0x3a3aff)
          }
          const p = pellets.get(y * MW + x)
          const cx = ox + x * ts + Math.floor(ts / 2)
          const cy = oy + y * ts + Math.floor(ts / 2)
          if (p === 'dot') dot(px, W, H, cx, cy, 0xffb8ae)
          if (p === 'power' && frame % 16 < 10) rect(px, W, H, cx - 1, cy - 1, 2, 2, 0xffb8ae)
        }
      const at = (m: Mover) => [ox + (m.px + (m.x - m.px) * m.t) * ts, oy + (m.py + (m.y - m.py) * m.t) * ts] as const
      for (const g of ghosts) {
        const [gx, gy] = at(g)
        const c = fright > 0 ? (fright < 25 && frame % 8 < 4 ? 0xffffff : 0x2121ff) : g.c
        rect(px, W, H, gx, gy, ts, ts, c)
        if (ts >= 3) {
          dot(px, W, H, gx, gy, 0x000000)
          dot(px, W, H, gx + ts - 1, gy, 0x000000)
          dot(px, W, H, gx + (ts > 3 ? 1 : 0), gy + 1, 0xffffff)
          dot(px, W, H, gx + ts - (ts > 3 ? 2 : 1), gy + 1, 0xffffff)
        }
      }
      const [pxx, pyy] = at(pac)
      const open = frame % 8 < 4
      for (let j = 0; j < ts; j++)
        for (let i = 0; i < ts; i++) {
          const rx = i - (ts - 1) / 2
          const ry = j - (ts - 1) / 2
          if (rx * rx + ry * ry > (ts / 2) * (ts / 2) + 0.3) continue
          const along = rx * pac.dir[0] + ry * pac.dir[1]
          const across = Math.abs(rx * pac.dir[1] - ry * pac.dir[0])
          if (open && along > 0 && across <= along * 0.8) continue
          dot(px, W, H, pxx + i, pyy + j, dying > 0 && dying % 4 < 2 ? 0x000000 : 0xffff00)
        }
      text(px, W, H, ox, 0, String(score), 0xffffff)
    },
  }
}

// --- Geometry Dash ---------------------------------------------------------------

const geodash: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.66)
  const cubeX = Math.round(W * 0.25)
  const size = 4
  const speed = 1.2
  const G = 0.24
  const JUMP = -2.3
  type Ob = { x: number; n: number }
  let obs: Ob[] = []
  let y = 0
  let vy = 0
  let rot = 0
  let attempt = 1
  let dist = 0
  let dead = 0
  let hue = rng()
  let parts: { x: number; y: number; vx: number; vy: number; life: number; c: number }[] = []
  let nextAt = 40

  const spikeAt = (x: number) => obs.some(o => x >= o.x && x < o.x + o.n * 3)
  return {
    step() {
      hue += 0.0015
      if (dead > 0) {
        for (const p of parts) {
          p.x += p.vx
          p.y += p.vy
          p.vy += 0.1
          p.life--
        }
        if (--dead === 0) {
          obs = []
          attempt++
          dist = 0
          nextAt = 40
          parts = []
          y = 0
          vy = 0
        }
        return
      }
      dist += speed
      for (const o of obs) o.x -= speed
      obs = obs.filter(o => o.x > -12)
      if (dist >= nextAt) {
        obs.push({ x: W + 2, n: 1 + Math.floor(rng() * 3) })
        nextAt = dist + 34 + rng() * 30
      }
      const ahead = obs.find(o => o.x + o.n * 3 > cubeX && o.x - (cubeX + size) < 10 + o.n * 2)
      // The bot jumps a little late now and then: that is what attempts are for.
      if (ahead && y === 0 && ahead.x - (cubeX + size) < 3 + ahead.n * 2 + (rng() < 0.01 ? -6 : 0)) vy = JUMP
      vy += G
      y = Math.min(0, y + vy)
      if (y === 0) {
        vy = 0
        rot = Math.round(rot / 4) * 4
      } else rot += 0.5
      if (y === 0 && rng() < 0.6)
        parts.push({ x: cubeX, y: ground - 1, vx: -0.5 - rng() * 0.5, vy: -rng() * 0.3, life: 10, c: hsv(hue + 0.5, 0.6, 1) })
      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.life--
      }
      parts = parts.filter(p => p.life > 0)
      if (y > -2 && (spikeAt(cubeX + 1) || spikeAt(cubeX + size - 1))) {
        dead = 30
        for (let i = 0; i < 24; i++)
          parts.push({ x: cubeX + 2, y: ground - 2 + y, vx: (rng() - 0.5) * 2, vy: -rng() * 2, life: 30, c: hsv(hue + rng() * 0.2, 0.8, 1) })
      }
    },
    draw(px) {
      const beat = Math.floor(dist / 18) % 2 === 0 ? 1 : 0.85
      sky(px, W, H, scale(hsv(hue, 0.7, 0.55), beat), hsv(hue + 0.08, 0.8, 0.25), ground)
      for (let yy = 4; yy < ground; yy += 8)
        for (let x = 0; x < W; x++) if ((x + Math.floor(dist / 3) + yy) % 8 === 0) dot(px, W, H, x, yy, hsv(hue, 0.5, 0.7))
      for (let yy = ground; yy < H; yy++)
        for (let x = 0; x < W; x++)
          px[yy * W + x] = yy === ground ? 0xffffff : (x + Math.floor(dist)) % 8 < 1 || (yy - ground) % 8 === 0 ? hsv(hue, 0.7, 0.45) : hsv(hue, 0.8, 0.3)
      for (const o of obs)
        for (let k = 0; k < o.n; k++)
          for (let j = 0; j < 4; j++) {
            const half = j / 2
            for (let i = -half; i <= half; i++) dot(px, W, H, o.x + k * 3 + 1 + i, ground - 4 + j, j === 3 ? 0x101010 : 0x202020)
            dot(px, W, H, o.x + k * 3 + 1, ground - 4, 0xffffff)
          }
      for (const p of parts) dot(px, W, H, p.x, p.y, mix(0x000000, p.c, Math.min(1, p.life / 10)))
      if (dead === 0) {
        const top = ground - size + y
        const diamond = Math.round(rot) % 4 >= 2
        if (diamond) {
          for (let j = 0; j < size + 1; j++) {
            const half = j < (size + 1) / 2 ? j : size - j
            for (let i = -half; i <= half; i++) dot(px, W, H, cubeX + size / 2 + i, top - 0.5 + j, j === 0 || Math.abs(i) === half ? 0x000000 : 0xffd23f)
          }
        } else {
          rect(px, W, H, cubeX, top, size, size, 0x000000)
          rect(px, W, H, cubeX + 0.5, top + 0.5, size - 1, size - 1, 0xffd23f)
          dot(px, W, H, cubeX + 1, top + 1, 0x3ae0e8)
          dot(px, W, H, cubeX + 2, top + 1, 0x3ae0e8)
        }
      }
      text(px, W, H, 1, 1, String(attempt), 0xffffff)
    },
  }
}

// --- speedrun ---------------------------------------------------------------------

const speedrun: Maker = (W, H, rng) => {
  const ground = Math.round(H * 0.72)
  const walls = [30, 52, 78, 100, 126]
  const goal = 150
  const wallH = (i: number) => 8 + (i % 3) * 4
  let runner = 0
  let ghost = { x: 0, y: 0, vy: 0 }
  let t = 0
  let done = 0
  let record = 0
  let cam = 0
  let glitch = 0
  let fx: { x: number; y: number; vx: number; vy: number; l: number; c: number }[] = []
  const reset = () => {
    runner = 2
    ghost = { x: 2, y: 0, vy: 0 }
    t = 0
    done = 0
    cam = 0
    glitch = 0
  }
  reset()
  const timeText = (f: number) => {
    const s = f / 15
    return `${Math.floor(s)}.${String(Math.floor((s % 1) * 100)).padStart(2, '0')}`
  }

  return {
    step() {
      t++
      fx = fx.filter(s => {
        s.x += s.vx
        s.y += s.vy
        return --s.l > 0
      })
      if (glitch) glitch--
      // the ghost of the normal route: run, jump every wall
      ghost.vy += 0.15
      ghost.y = Math.min(0, ghost.y + ghost.vy)
      if (ghost.x < goal) {
        const next = walls.find(w => w > ghost.x - 1)
        if (next !== undefined && next - ghost.x < 6 && ghost.y === 0) ghost.vy = -2.4 - wallH(walls.indexOf(next)) * 0.05
        const blocked = next !== undefined && next - ghost.x < 1.5 && -ghost.y < wallH(walls.indexOf(next))
        if (!blocked) ghost.x += 0.45
      }
      if (done) {
        if (++done > 90) reset()
        cam += (runner - W * 0.6 - cam) * 0.1
        return
      }
      // the runner: straight through the walls, with a glitch each time
      const before = runner
      runner += 0.8
      for (const w of walls)
        if (before < w && runner >= w) {
          glitch = 6
          for (let k = 0; k < 6; k++) fx.push({ x: w, y: ground - 3 - rng() * 4, vx: (rng() - 0.5) * 1.2, vy: rng() - 0.5, l: 8, c: k % 2 ? 0xff40ff : 0x40ffff })
        }
      if (runner >= goal) {
        done = 1
        record = record ? Math.min(record, t) : t
        for (let k = 0; k < 20; k++) fx.push({ x: goal, y: ground - 10, vx: (rng() - 0.5) * 2, vy: (rng() - 0.5) * 2, l: 20, c: 0xffe060 })
      }
      cam += (runner - W * 0.4 - cam) * 0.2
    },
    draw(px) {
      sky(px, W, H, 0x5a8ad8, 0xa8d0f0, ground)
      for (let x = 0; x < W; x++) {
        const wx = x + cam
        const hill = ground - 6 - Math.sin(wx * 0.05) * 4
        for (let y = Math.round(hill); y < ground; y++) px[y * W + x] = 0x6aa86a
        for (let y = ground; y < H; y++) px[y * W + x] = y === ground ? 0x7ad04a : (Math.floor(wx) + y) % 6 === 0 ? 0x8a5a30 : 0xa87040
      }
      walls.forEach((w, i) => slab(px, W, H, w - cam, ground - wallH(i), 3, wallH(i), 0xb86a3a, 0x4a2a14))
      // the flag at the end
      const fx0 = goal - cam
      rect(px, W, H, fx0, ground - 14, 1, 14, 0xd0d0d8)
      rect(px, W, H, fx0 + 1, ground - 14, 5, 3, done ? 0xffe060 : 0xe03a3a)
      // the ghost, faint; the runner, a green blob that tears when it clips
      const gx = ghost.x - cam
      for (let k = 0; k < 9; k++) {
        const x = Math.round(gx - 1 + (k % 3))
        const y = Math.round(ground - 3 + Math.floor(k / 3) + ghost.y)
        if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = mix(px[y * W + x], 0xffffff, 0.35)
      }
      const rx = Math.round(runner - cam)
      if (glitch) {
        lit(px, W, H, rx - 1, ground - 2, 2, 2, 0xff40ff)
        lit(px, W, H, rx + 1, ground - 2, 2, 2, 0x40ffff)
      }
      lit(px, W, H, rx, ground - 2, 2, 2, 0x4ae04a, 0x1a5a1a)
      dot(px, W, H, rx + 1, ground - 3, 0xffffff)
      for (const s of fx) dot(px, W, H, s.x - cam, s.y, s.c)
      text(px, W, H, 1, 1, timeText(done ? record : t), done ? 0xffe060 : 0xffffff)
    },
  }
}

export const ARCADE = {
  runner,
  tetris,
  briques,
  course,
  snake,
  dino,
  pacman,
  geodash,
  invaders,
  asteroids,
  frogger,
  pong,
  galaga,
  missile,
  barrels,
  lander,
  centipede,
  bomber,
  minesweeper,
  lightcycles,
  lemmings,
  platformer,
  bubbleshooter,
  jewels,
  sokoban,
  solitaire,
  speedrun,
}

