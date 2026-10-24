import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { beam, burst, clamp, ellipse, irand, line, lit, litSprite, ring, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Party, board & fair games: chips, wheels, discs and pucks.

// --- Plinko -------------------------------------------------------------------------

const plinko: Maker = (W, H, rng) => {
  const top = 9
  const slotsY = H - 9
  const rows = 8
  const gap = (slotsY - top - 4) / rows
  const pegs: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    const n = r % 2 ? 6 : 7
    for (let k = 0; k < n; k++) pegs.push([(W / 7) * (k + (r % 2 ? 1 : 0.5)), top + 4 + r * gap])
  }
  const VALUES = [1, 5, 9, 5, 1]
  const sw = W / VALUES.length
  let chip = { x: W / 2, y: 2, vx: 0, vy: 0 }
  let score = 0
  let lit2 = -1
  let flash = 0
  let wait = 20
  let fx: Spark[] = []
  const drop = () => {
    chip = { x: W * 0.2 + rng() * W * 0.6, y: 2, vx: 0, vy: 0 }
  }
  drop()

  return {
    step() {
      fx = sparks(fx, 0.05)
      if (flash) flash--
      if (wait > 0) {
        wait--
        return
      }
      chip.vy += 0.07
      chip.x += chip.vx
      chip.y += chip.vy
      for (const [px0, py0] of pegs) {
        const dx = chip.x - px0
        const dy = chip.y - py0
        const d = Math.hypot(dx, dy)
        if (d < 2 && d > 0) {
          // bounce off the peg, a little left or right
          const nx = dx / d
          const ny = dy / d
          chip.x = px0 + nx * 2
          chip.y = py0 + ny * 2
          const dot2 = chip.vx * nx + chip.vy * ny
          chip.vx = (chip.vx - 2 * dot2 * nx) * 0.45 + (rng() - 0.5) * 0.3
          chip.vy = (chip.vy - 2 * dot2 * ny) * 0.45
        }
      }
      if (chip.x < 1.5) {
        chip.x = 1.5
        chip.vx = Math.abs(chip.vx) + 0.2
      }
      if (Math.abs(chip.vx) + Math.abs(chip.vy) < 0.08) chip.vx += (rng() - 0.5) * 0.6
      if (chip.x > W - 2.5) {
        chip.x = W - 2.5
        chip.vx = -Math.abs(chip.vx) - 0.2
      }
      chip.vx = clamp(chip.vx, -0.9, 0.9)
      if (chip.y > slotsY + 3) {
        lit2 = clamp(Math.floor(chip.x / sw), 0, VALUES.length - 1)
        score += VALUES[lit2]
        flash = 30
        burst(fx, rng, (lit2 + 0.5) * sw, slotsY + 2, hsv(lit2 * 0.2, 0.7, 1), lit2 === 2 ? 16 : 8, 1.1)
        drop()
        wait = 25
      }
    },
    draw(px) {
      sky(px, W, H, 0x3a1a5a, 0x1a1040)
      // the board: lights along the edge, pegs lit like little studs
      for (let y = 0; y < H; y += 3) {
        dot(px, W, H, 0, y, (y / 3 + Math.floor(flash / 3)) % 2 ? 0xffe060 : 0x8a6a20)
        dot(px, W, H, W - 1, y, (y / 3 + Math.floor(flash / 3)) % 2 ? 0x8a6a20 : 0xffe060)
      }
      for (const [x, y] of pegs) {
        dot(px, W, H, x, y, 0xe8e8f0)
        dot(px, W, H, x + 1, y, 0x8a8aa0)
        dot(px, W, H, x, y + 1, 0x6a6a80)
      }
      // the slots and their prizes
      for (let k = 0; k < VALUES.length; k++) {
        const x0 = Math.round(k * sw)
        const col = hsv(k * 0.2, 0.6, lit2 === k && flash % 6 < 3 ? 1 : 0.6)
        rect(px, W, H, x0, slotsY, Math.ceil(sw), H - slotsY, col)
        rect(px, W, H, x0, slotsY, 1, H - slotsY, 0x1a1030)
        text(px, W, H, x0 + sw / 2 - 1, slotsY + 2, String(VALUES[k]), 0xffffff)
      }
      lit(px, W, H, chip.x, chip.y, 1.8, 1.8, 0xff6a8a, 0x8a1a3a)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

// --- wheel of prizes ----------------------------------------------------------------

const prizewheel: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H * 0.45
  const R = Math.min(W * 0.46, H * 0.3)
  const N = 8
  let a = 0
  let v = 0
  let t = 0
  let rest = 30
  let flap = 0
  let win = -1
  let fx: Spark[] = []
  const hue = rng()

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (rest > 0) {
        if (--rest === 0) {
          v = 0.35 + rng() * 0.15
          win = -1
        }
        return
      }
      const before = Math.floor((a / (Math.PI * 2)) * N * 2)
      a += v
      v *= 0.988
      // a tick at every peg; the flapper bends
      if (Math.floor((a / (Math.PI * 2)) * N * 2) !== before) flap = 3
      if (flap) flap--
      if (v < 0.003) {
        v = 0
        win = ((Math.floor(((-a / (Math.PI * 2)) % 1 + 1) * N) % N) + N) % N
        rest = 70
        for (let k = 0; k < 3; k++) burst(fx, rng, cx, cy - R - 2, 0xffe060, 10, 1.2)
      }
    },
    draw(px) {
      sky(px, W, H, 0x5a1a3a, 0x2a0a20)
      for (let k = 0; k < 6; k++) for (let i = 0; i < 6; i++) tint(px, W, H, (k * 7 + 3) % W, H * 0.85 + i, 0xffd060, 0.05)
      // the stand
      slab(px, W, H, cx - 2, cy, 4, H - cy - 4, 0x8a6a40, 0x3a2410)
      slab(px, W, H, cx - 8, H - 5, 16, 3, 0x6a4a28, 0x3a2410)
      for (let y = Math.floor(cy - R); y <= cy + R; y++)
        for (let x = Math.floor(cx - R); x <= cx + R; x++) {
          const dx = x - cx
          const dy = y - cy
          const d = Math.hypot(dx, dy)
          if (d > R) continue
          const ang = (Math.atan2(dy, dx) + Math.PI / 2 - a + Math.PI * 8) % (Math.PI * 2)
          const seg = Math.floor((ang / (Math.PI * 2)) * N)
          let c = hsv(hue + seg / N, 0.7, 0.95)
          if (win === seg && t % 10 < 5) c = 0xffffff
          if (d > R - 1) c = 0xf0c040
          else if (d < 2) c = 0xd8d8e0
          else if (-(dx * 0.6 + dy * 0.8) / R > 0.5) c = mix(c, 0xffffff, 0.2)
          px[y * W + x] = c
        }
      // pegs on the rim, the pointer on top
      for (let k = 0; k < N * 2; k++) {
        const pa = a + (k / (N * 2)) * Math.PI * 2
        dot(px, W, H, cx + Math.cos(pa) * (R - 1), cy + Math.sin(pa) * (R - 1), 0xffffff)
      }
      const bend = flap ? 1 : 0
      for (let k = 0; k < 4; k++) rect(px, W, H, cx - 2 + k * 0.5 + bend * (k / 4), cy - R - 4 + k, 4 - k, 1, 0xe03a3a)
      ring(px, W, H, cx, cy, R + 0.5, 0x8a6020)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- four in a row ------------------------------------------------------------------

const connect4: Maker = (W, H, rng) => {
  const cols = 7
  const rows = 6
  const c = Math.max(2, Math.floor((W - 2) / cols))
  const ox = Math.floor((W - cols * c) / 2)
  const oy = Math.round(H * 0.5 - (rows * c) / 2)
  let grid: number[] = []
  let turn = 1
  let drop: { col: number; y: number; vy: number; row: number; who: number } | null = null
  let win: [number, number][] = []
  let wait = 20
  let wins = [0, 0]
  const reset = () => {
    grid = new Array(cols * rows).fill(0)
    turn = rng() < 0.5 ? 1 : 2
    win = []
    wait = 20
  }
  reset()
  const at = (x: number, y: number) => (x < 0 || y < 0 || x >= cols || y >= rows ? -1 : grid[y * cols + x])
  const lineOf = (x: number, y: number, who: number): [number, number][] => {
    for (const [dx, dy] of [[1, 0], [0, 1], [1, 1], [1, -1]]) {
      const run: [number, number][] = [[x, y]]
      for (const s of [1, -1]) for (let k = 1; at(x + dx * k * s, y + dy * k * s) === who; k++) run.push([x + dx * k * s, y + dy * k * s])
      if (run.length >= 4) return run
    }
    return []
  }
  const landing = (col: number) => {
    for (let y = rows - 1; y >= 0; y--) if (!grid[y * cols + col]) return y
    return -1
  }
  // win if it can, block if it must, else lean to the middle
  const choose = (who: number) => {
    const open = [...Array(cols).keys()].filter(x => landing(x) >= 0)
    for (const w of [who, 3 - who])
      for (const x of open) {
        const y = landing(x)
        grid[y * cols + x] = w
        const hit = lineOf(x, y, w).length
        grid[y * cols + x] = 0
        if (hit) return x
      }
    const weights = open.map(x => 4 - Math.abs(x - 3) + rng() * 3)
    return open[weights.indexOf(Math.max(...weights))]
  }

  return {
    step() {
      if (wait > 0) {
        if (--wait === 0 && win.length) reset()
        return
      }
      if (!drop) {
        const col = choose(turn)
        if (col === undefined) {
          wait = 40
          win = [[-1, -1]]
          return
        }
        drop = { col, y: oy - c, vy: 0, row: landing(col), who: turn }
        return
      }
      drop.vy += 0.25
      drop.y += drop.vy
      const target = oy + drop.row * c
      if (drop.y >= target) {
        if (drop.vy > 1.2) {
          drop.y = target
          drop.vy = -drop.vy * 0.25
          return
        }
        grid[drop.row * cols + drop.col] = drop.who
        const line4 = lineOf(drop.col, drop.row, drop.who)
        if (line4.length) {
          win = line4
          wins[drop.who - 1]++
          wait = 70
        } else wait = 6
        turn = 3 - turn
        drop = null
      }
    },
    draw(px) {
      sky(px, W, H, 0xe8e0f0, 0xc8c0d8)
      const disc = (x: number, y: number, who: number, hot: boolean) => {
        const col = who === 1 ? 0xe83a3a : 0xf0c830
        lit(px, W, H, x + (c - 1) / 2, y + (c - 1) / 2, c * 0.42, c * 0.42, hot ? 0xffffff : col, tones(col)[3])
      }
      if (drop) disc(ox + drop.col * c, drop.y, drop.who, false)
      // the blue board with its holes, discs showing through
      for (let y = oy; y < oy + rows * c; y++)
        for (let x = ox; x < ox + cols * c; x++) {
          const cx = ((x - ox) % c) - (c - 1) / 2
          const cy = ((y - oy) % c) - (c - 1) / 2
          if (cx * cx + cy * cy > (c * 0.42) ** 2) px[y * W + x] = x === ox || y === oy ? 0x5a7af0 : 0x2a4ad0
          else {
            const who = grid[Math.floor((y - oy) / c) * cols + Math.floor((x - ox) / c)]
            if (!who && !(drop && Math.floor((x - ox) / c) === drop.col && Math.abs(y - drop.y - c / 2) < c / 2)) px[y * W + x] = 0x1a2a6a
          }
        }
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const who = grid[y * cols + x]
          if (who) disc(ox + x * c, oy + y * c, who, win.some(([a, b]) => a === x && b === y) && wait % 10 < 5)
        }
      slab(px, W, H, ox - 2, oy + rows * c, cols * c + 4, 2, 0x2a3ab0)
      text(px, W, H, 1, 1, String(wins[0]), 0xe83a3a)
      text(px, W, H, W - 4, 1, String(wins[1]), 0xc8a020)
    },
  }
}

// --- air hockey ---------------------------------------------------------------------

const airhockey: Maker = (W, H, rng) => {
  const goalW = Math.round(W * 0.4)
  let puck = { x: W / 2, y: H / 2, vx: 0.6, vy: 1.2 }
  const pads = [
    { x: W / 2, y: H - 8, home: H - 8 },
    { x: W / 2, y: 8, home: 8 },
  ]
  let score = [0, 0]
  let flash = 0
  let t = 0
  let trail: [number, number][] = []
  let fx: Spark[] = []
  const serve = (to: number) => {
    puck = { x: W / 2, y: H / 2, vx: (rng() - 0.5) * 1.2, vy: to ? -1 : 1 }
  }

  return {
    step() {
      t++
      fx = sparks(fx, 0)
      if (flash > 0) {
        if (--flash === 0) serve(irand(rng, 2))
        return
      }
      puck.x += puck.vx
      puck.y += puck.vy
      puck.vx *= 0.998
      puck.vy *= 0.998
      trail.push([puck.x, puck.y])
      if (trail.length > 5) trail.shift()
      if (puck.x < 2 || puck.x > W - 3) {
        puck.vx = -puck.vx
        puck.x = clamp(puck.x, 2, W - 3)
      }
      const inGoal = Math.abs(puck.x - W / 2) < goalW / 2
      for (const [i, edge] of [[0, H - 2], [1, 1]] as [number, number][]) {
        if ((i === 0 && puck.y > edge) || (i === 1 && puck.y < edge)) {
          if (inGoal) {
            score[1 - i]++
            flash = 40
            burst(fx, rng, puck.x, edge, i ? 0xff4a4a : 0x4a8aff, 14, 1.3)
          } else {
            puck.vy = -puck.vy
            puck.y = i ? edge + 1 : edge - 1
          }
        }
      }
      // each paddle tracks the puck in its half, hits it hard toward the other goal
      pads.forEach((p, i) => {
        const mine = i === 0 ? puck.y > H / 2 : puck.y < H / 2
        const tx = mine ? puck.x : W / 2 + (puck.x - W / 2) * 0.4
        const ty = mine ? puck.y + (i === 0 ? 2 : -2) : p.home
        p.x += clamp(tx - p.x, -0.9, 0.9)
        p.y += clamp(ty - p.y, -0.9, 0.9)
        p.y = i === 0 ? clamp(p.y, H / 2 + 3, H - 4) : clamp(p.y, 3, H / 2 - 3)
        const dx = puck.x - p.x
        const dy = puck.y - p.y
        const d = Math.hypot(dx, dy)
        if (d < 4 && d > 0) {
          const sp = Math.max(1.4, Math.hypot(puck.vx, puck.vy) * 1.05)
          puck.vx = (dx / d) * sp + (rng() - 0.5) * 0.4
          puck.vy = (dy / d) * sp
          if (Math.abs(puck.vy) < 0.6) puck.vy = i === 0 ? -0.8 : 0.8
          puck.x = p.x + (dx / d) * 4
          puck.y = p.y + (dy / d) * 4
          fx.push({ x: puck.x, y: puck.y, vx: 0, vy: 0, l: 4, c: 0xffffff })
        }
      })
      const sp = Math.hypot(puck.vx, puck.vy)
      if (sp > 2.2) {
        puck.vx *= 2.2 / sp
        puck.vy *= 2.2 / sp
      }
    },
    draw(px) {
      // the table: white, the air holes, the centre line and circle, the goals
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x % 3 === 1 && y % 3 === 1) ? 0xc8d4e0 : 0xeef4fa
      rect(px, W, H, 0, H / 2, W, 1, 0xe85a5a)
      ring(px, W, H, W / 2, H / 2, 5, 0xe85a5a)
      ring(px, W, H, W / 2, 0, goalW / 2, 0x5a8ae8)
      ring(px, W, H, W / 2, H, goalW / 2, 0x5a8ae8)
      rect(px, W, H, W / 2 - goalW / 2, 0, goalW, 1, 0x1a1a24)
      rect(px, W, H, W / 2 - goalW / 2, H - 1, goalW, 1, 0x1a1a24)
      rect(px, W, H, 0, 0, 1, H, 0x5a6070)
      rect(px, W, H, W - 1, 0, 1, H, 0x3a4050)
      trail.forEach(([x, y], i) => tint(px, W, H, x, y, 0x3a3a4a, 0.1 + i * 0.05))
      lit(px, W, H, puck.x, puck.y, 1.6, 1.6, 0x2a2a34, 0x0a0a10)
      pads.forEach((p, i) => {
        const col = i === 0 ? 0x3a7ae8 : 0xe83a3a
        lit(px, W, H, p.x, p.y, 3, 3, col, tones(col)[3])
        lit(px, W, H, p.x - 0.5, p.y - 0.5, 1.2, 1.2, tones(col)[0])
      })
      if (flash) for (let i = 0; i < W * H; i++) px[i] = mix(px[i], 0xffffff, flash % 8 < 4 ? 0.2 : 0)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 2, H / 2 - 7, String(score[1]), 0xe83a3a)
      text(px, W, H, 2, H / 2 + 3, String(score[0]), 0x3a7ae8)
    },
  }
}

// --- arcade hoops -------------------------------------------------------------------

const hoops: Maker = (W, H, rng) => {
  const rimY = Math.round(H * 0.3)
  let rimX = W / 2
  type BallT = { x: number; y: number; vx: number; vy: number; scored: boolean; prevY: number }
  let balls: BallT[] = []
  let score = 0
  let time = 30
  let t = 0
  let net = 0
  let over = 0
  let fx: Spark[] = []
  const reset = () => {
    balls = []
    score = 0
    time = 30
    t = 0
    over = 0
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.05)
      if (net) net--
      if (over) {
        if (++over > 60) reset()
        return
      }
      if (t % 15 === 0 && --time <= 0) {
        over = 1
        return
      }
      // the hoop slides once the clock is under twenty
      if (time < 20) rimX = W / 2 + Math.sin(t * 0.04) * W * 0.2
      if (t % 17 === 0) {
        const x = W / 2 + (rng() - 0.5) * 6
        const y = H - 6
        const flight = 26
        const miss = rng() < 0.25 ? (rng() - 0.5) * 6 : 0
        // aim for where the rim will be
        const futureX = time < 20 ? W / 2 + Math.sin((t + flight) * 0.04) * W * 0.2 : rimX
        balls.push({ x, y, vx: (futureX + miss - x) / flight, vy: (rimY - 2 - y - 0.5 * 0.12 * flight * flight) / flight, scored: false, prevY: y })
      }
      for (const b of balls) {
        b.prevY = b.y
        b.vy += 0.12
        b.x += b.vx
        b.y += b.vy
        // through the rim on the way down
        if (!b.scored && b.prevY < rimY && b.y >= rimY && Math.abs(b.x - rimX) < 2.5) {
          b.scored = true
          score += time < 20 ? 3 : 2
          net = 8
          fx.push({ x: rimX, y: rimY - 3, vx: 0, vy: -0.4, l: 12, c: 0xffe060 })
        } else if (!b.scored && b.prevY < rimY && b.y >= rimY && Math.abs(Math.abs(b.x - rimX) - 3) < 1.2) {
          b.vx = -b.vx * 0.8
          b.vy = -b.vy * 0.4
        }
      }
      balls = balls.filter(b => b.y < H + 4)
    },
    draw(px) {
      // the machine: a lit backboard, side nets, a ramp of balls at the bottom
      sky(px, W, H, 0x1a1a3a, 0x0a0a20)
      for (let y = 0; y < H; y += 2) {
        dot(px, W, H, 1, y, 0x3a3a6a)
        dot(px, W, H, W - 2, y, 0x3a3a6a)
      }
      // the backboard comes down to the rim, which is bolted under its red square
      slab(px, W, H, rimX - 7, rimY - 10, 14, 10, 0xf0f0f8, 0x6a6a8a)
      rect(px, W, H, rimX - 3, rimY - 5, 7, 5, 0xe83a3a)
      rect(px, W, H, rimX - 2, rimY - 4, 5, 4, 0xf0f0f8)
      // the rim and its net, which swishes when a ball goes through
      rect(px, W, H, rimX - 3, rimY, 7, 1, 0xff7a20)
      for (let k = 0; k < 4; k++) {
        const sway = net ? Math.sin(net + k) * 1 : 0
        line(px, W, H, rimX - 3 + k * 0.4, rimY + 1, rimX - 2 + k * 0.5 + sway, rimY + 5, 0xe8e8f0)
        line(px, W, H, rimX + 3 - k * 0.4, rimY + 1, rimX + 2 - k * 0.5 + sway, rimY + 5, 0xe8e8f0)
      }
      for (let y = H - 5; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === H - 5 ? 0x8a5a30 : 0x5a3a20
      for (let k = 0; k < 5; k++) lit(px, W, H, 4 + k * 5, H - 3, 1.6, 1.6, 0xf08a30, 0x6a2a0a)
      for (const b of balls) {
        lit(px, W, H, b.x, b.y, 1.8, 1.8, 0xf08a30, 0x6a2a0a)
        dot(px, W, H, b.x, b.y, 0x5a2a0a)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      // the score and the clock, in red digits
      text(px, W, H, 1, 1, String(score), 0xffe060)
      const tm = String(Math.max(0, time))
      text(px, W, H, W - 1 - textWidth(tm), 1, tm, time < 10 && t % 10 < 5 ? 0xffffff : 0xff4040)
    },
  }
}

// --- cup shuffle --------------------------------------------------------------------

const cupshuffle: Maker = (W, H, rng) => {
  // three cups, one ball: shown, shuffled faster and faster, a guess, then the reveal
  const base = Math.round(H * 0.64)
  const ch = Math.max(5, Math.round(H * 0.17))
  const cw = Math.max(4, Math.round(W * 0.27))
  const slotX = [W * 0.2, W * 0.5, W * 0.8]
  let slot = [0, 1, 2]
  let ball = 1
  let phase: 'show' | 'shuffle' | 'guess' | 'reveal' = 'show'
  let t = 0
  let swaps = 0
  let total = 0
  let swap: { a: number; b: number; k: number; len: number } | null = null
  let guess = 0
  let wins = 0
  let rounds = 0
  let fx: Spark[] = []
  const cup = tones(0xd8342e)
  const reset = () => {
    slot = [0, 1, 2]
    ball = irand(rng, 3)
    phase = 'show'
    t = 0
    swaps = 0
    total = 7 + irand(rng, 6)
    swap = null
  }
  reset()
  // where a cup stands, and how high it is lifted
  const at = (i: number): [number, number, number] => {
    let x = slotX[slot[i] as number] as number
    let y = base
    let lift = 0
    if (swap && (swap.a === i || swap.b === i)) {
      const u = swap.k / swap.len
      const e = u * u * (3 - 2 * u)
      const from = slotX[slot[i] as number] as number
      const to = slotX[slot[i === swap.a ? swap.b : swap.a] as number] as number
      x = from + (to - from) * e
      y += Math.sin(u * Math.PI) * (i === swap.a ? -3 : 2)
    }
    if (phase === 'show' && i === ball) lift = Math.sin(clamp(t / 30, 0, 1) * Math.PI) * ch * 0.8
    if (phase === 'reveal') {
      const up = Math.sin(clamp(t / 40, 0, 1) * Math.PI) * ch * 0.8
      if (i === guess) lift = up
      if (i === ball && guess !== ball) lift = Math.sin(clamp((t - 20) / 40, 0, 1) * Math.PI) * ch * 0.8
    }
    return [x, y, lift]
  }

  return {
    step() {
      t++
      fx = sparks(fx, 0.06)
      if (phase === 'show' && t > 36) {
        phase = 'shuffle'
        t = 0
      } else if (phase === 'shuffle') {
        if (!swap) {
          if (swaps >= total) {
            phase = 'guess'
            t = 0
            // the bot follows the ball, most of the time
            guess = rng() < 0.7 ? ball : (ball + 1 + irand(rng, 2)) % 3
            return
          }
          const a = irand(rng, 3)
          const b = (a + 1 + irand(rng, 2)) % 3
          swap = { a, b, k: 0, len: Math.max(4, Math.round(14 - swaps * 1.2)) }
        }
        swap.k++
        if (swap.k >= swap.len) {
          const s = slot[swap.a] as number
          slot[swap.a] = slot[swap.b] as number
          slot[swap.b] = s
          swap = null
          swaps++
        }
      } else if (phase === 'guess' && t > 24) {
        phase = 'reveal'
        t = 0
        rounds++
        if (guess === ball) wins++
      } else if (phase === 'reveal') {
        if (t === 12) {
          const [x] = at(ball)
          burst(fx, rng, x, base - 1, guess === ball ? 0xffd84a : 0xa0a0b0, guess === ball ? 12 : 5, 0.8)
        }
        if (t > 70) reset()
      }
    },
    draw(px) {
      sky(px, W, H, 0x1a3a2a, 0x24543a, base + 2)
      // a soft spotlight on the felt
      for (let y = 0; y < base + 2; y++) {
        const k = Math.abs(y - H * 0.35) / H
        for (let x = 0; x < W; x++) if (Math.abs(x - W / 2) < W * (0.55 - k)) px[y * W + x] = mix(px[y * W + x] as number, 0x3a7a52, 0.35)
      }
      // the table's edge and front
      for (let y = base + 2; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === base + 2 ? 0xc89060 : y === base + 3 ? 0x8a5a34 : mix(0x6a4024, 0x3a2012, (y - base) / (H - base))
      // the ball, visible when its cup is lifted
      for (let i = 0; i < 3; i++) {
        const [x, y] = at(i)
        ellipse(px, W, H, x, y + 2, cw * 0.55, 0.8, 0x14301e)
      }
      const [bx] = at(ball)
      lit(px, W, H, bx, base - 1.5, 2.2, 2.2, 0xffd040, 0x7a5208)
      for (let i = 0; i < 3; i++) {
        const [x, y, lift] = at(i)
        // an upside-down cup: narrow top, wide rim, lit from the left
        const top = Math.round(y - ch - lift)
        for (let j = 0; j <= ch; j++) {
          const yy = top + j
          const half = (cw / 2) * (0.62 + 0.38 * (j / ch))
          const xa = Math.round(x - half)
          const xb = Math.round(x + half)
          for (let xx = xa; xx <= xb; xx++) {
            const u = (xx - xa) / Math.max(1, xb - xa)
            let c = u < 0.18 ? cup[0] : u < 0.62 ? cup[1] : u < 0.86 ? cup[2] : cup[3]
            if (j === 0) c = cup[2]
            if (j >= ch - 1) c = mix(c, 0xffffff, 0.35)
            if (xx === xa || xx === xb) c = 0x5a0e10
            dot(px, W, H, xx, yy, c)
          }
        }
      }
      // the bot's pick: an arrow over a cup
      if (phase === 'guess' || phase === 'reveal') {
        const [x] = at(guess)
        const ay = base - ch - 7 + (phase === 'guess' ? Math.round(Math.sin(t * 0.4)) : 0)
        for (let k = 0; k < 3; k++) rect(px, W, H, x - 2 + k, ay + k, 5 - k * 2, 1, 0xffffff)
      }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, `${wins}/${rounds}`, 0xe8f0e0)
      if (phase === 'guess') text(px, W, H, W - 4, 1, '?', 0xffd84a)
    },
  }
}

// --- bottle flip --------------------------------------------------------------------

const bottleflip: Maker = (W, H, rng) => {
  // a half-full water bottle spins up and lands standing, on its cap now and then, or topples
  const table = Math.round(H * 0.7)
  const L = Math.max(8, Math.round(H * 0.27))
  const R = Math.max(2, W * 0.11)
  const startX = W * 0.28
  const endX = W * 0.68
  let phase: 'rest' | 'fly' | 'land' | 'fall' = 'rest'
  let t = 0
  let ang = 0
  let x = startX
  let y = table
  let err = 0
  let wins = 0
  let tries = 0
  let fx: Spark[] = []
  let label = 0
  const T = 24

  return {
    step() {
      t++
      fx = sparks(fx, 0.08)
      if (phase === 'rest' && t > 18) {
        phase = 'fly'
        t = 0
        tries++
        label = rng()
        // how far off a full turn it lands: small is a stand, about half a turn is the cap
        const r = rng()
        err = r < 0.5 ? (rng() - 0.5) * 0.5 : r < 0.6 ? Math.PI + (rng() - 0.5) * 0.3 : (rng() < 0.5 ? -1 : 1) * (0.6 + rng() * 0.8)
      } else if (phase === 'fly') {
        const u = t / T
        x = startX + (endX - startX) * u
        y = table - Math.sin(u * Math.PI) * H * 0.45
        ang = (Math.PI * 2 + err) * u
        if (t >= T) {
          y = table
          const off = Math.atan2(Math.sin(err), Math.cos(err))
          if (Math.abs(off) < 0.35 || Math.abs(Math.abs(off) - Math.PI) < 0.2) {
            phase = 'land'
            wins++
            burst(fx, rng, x, table - L, Math.abs(off) > 1 ? 0xffd040 : 0x8af08a, Math.abs(off) > 1 ? 18 : 10, 1)
          } else phase = 'fall'
          t = 0
        }
      } else if (phase === 'land') {
        // it rocks and settles on its base (or its cap)
        const off = Math.atan2(Math.sin(err), Math.cos(err))
        const settle = Math.abs(off) > 1 ? Math.PI : 0
        ang = settle + (off - settle) * Math.cos(t * 0.6) * Math.exp(-t * 0.12)
        if (t > 40) {
          phase = 'rest'
          t = 0
          ang = 0
          x = startX
        }
      } else if (phase === 'fall') {
        // past the tipping point: it drops onto its side and rolls a little
        const side = Math.sin(err) > 0 ? 1 : -1
        ang += (side * Math.PI * 0.5 - Math.atan2(Math.sin(ang), Math.cos(ang))) * 0.3
        if (t > 6) x += side * Math.max(0, 0.6 - t * 0.02)
        if (t > 40) {
          phase = 'rest'
          t = 0
          ang = 0
          x = startX
        }
      }
    },
    draw(px) {
      // a bedroom wall, a poster, the desk
      sky(px, W, H, 0x3a4a6a, 0x5a6a8a, table)
      rect(px, W, H, W * 0.6, H * 0.12, W * 0.3, H * 0.2, 0xd8b04a)
      rect(px, W, H, W * 0.6 + 1, H * 0.12 + 1, W * 0.3 - 2, H * 0.2 - 2, 0xe86a4a)
      for (let yy = table; yy < H; yy++) for (let xx = 0; xx < W; xx++) px[yy * W + xx] = yy === table ? 0xd8a870 : yy === table + 1 ? 0xb08050 : mix(0x8a5a34, 0x4a2c18, (yy - table) / (H - table))
      // the bottle, drawn by turning each pixel back into the bottle's own frame
      const c = Math.cos(ang)
      const s = Math.sin(ang)
      // the pivot is the base's centre when standing; while flying, the middle
      const mid = phase === 'fly' ? L / 2 : 0
      const lying = phase === 'fall' ? Math.abs(Math.sin(ang)) * (R - 0.5) : 0
      const bx = x
      // on its cap, the base is up in the air, a bottle's length above the desk
      const by = phase === 'fly' ? y - L / 2 : phase === 'land' && c < 0 ? table - L : y - lying
      const lab = hsv(label, 0.7, 0.85)
      const reach = L + 2
      for (let yy = Math.floor(by - reach); yy <= by + reach; yy++)
        for (let xx = Math.floor(bx - reach); xx <= bx + reach; xx++) {
          const dx = xx + 0.5 - bx
          const dy = yy + 0.5 - by
          // uu runs from the base (0) to the cap (L), v across
          const v = dx * c + dy * s
          const uu = -dy * c + dx * s + mid
          if (uu < 0 || uu > L) continue
          const w = uu > L * 0.82 ? R * 0.45 : uu > L * 0.68 ? R * (0.45 + (0.82 - uu / L) * 4) : R
          if (Math.abs(v) > w) continue
          let col: number
          if (uu > L - 1.5) col = 0x2a6ad0
          else if (uu > L * 0.3 && uu < L * 0.52) col = Math.abs(v) < w - 1 ? lab : mix(lab, 0x200a28, 0.3)
          else if (uu < L * 0.42) col = mix(0x5aa8e8, 0x2a6ab0, (v + R) / (2 * R))
          else col = mix(px[yy * W + xx] ?? 0, 0xd8f0ff, 0.45)
          if (v < -w + 1) col = mix(col, 0xffffff, 0.45)
          dot(px, W, H, xx, yy, col)
        }
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      text(px, W, H, 1, 1, `${wins}/${tries}`, 0xf0f0ff)
    },
  }
}

// --- shooting gallery ---------------------------------------------------------------

const shootgallery: Maker = (W, H, rng) => {
  // tin ducks file along three rails; the sight takes aim, a hit duck tips over backwards
  const rails = [H * 0.37, H * 0.53, H * 0.69].map(Math.round)
  const DUCK = ['..yy...', '.yyey..', '.yyyybb', 'yyyyy..', 'yyyyyy.', '.yyyy..']
  const flip = DUCK.map(r => r.split('').reverse().join(''))
  type Duck = { x: number; row: number; down: number }
  let ducks: Duck[] = []
  for (let row = 0; row < 3; row++) for (let k = 0; k < 3; k++) ducks.push({ x: k * (W / 3 + 4) + row * 5, row, down: 0 })
  let aim = { x: W / 2, y: H / 2 }
  let target: Duck | null = null
  let off = { x: 0, y: 0 }
  let settle = 0
  let flash = 0
  let score = 0
  let shots = 10
  let reload = 0
  let fx: Spark[] = []
  const span = W + 14
  const dir = (row: number) => (row === 1 ? -1 : 1)

  return {
    step() {
      fx = sparks(fx, 0.08)
      if (flash > 0) flash--
      for (const d of ducks) {
        d.x += dir(d.row) * (0.35 + d.row * 0.1)
        if (d.x > W + 7) d.x -= span
        if (d.x < -7) d.x += span
        // a knocked duck stays down for a lap, then pops back up
        if (d.down > 0 && ++d.down > 120) d.down = 0
      }
      if (reload > 0) {
        if (--reload === 0) shots = 10
        return
      }
      if (!target || target.down || target.x < 2 || target.x > W - 8) {
        const up = ducks.filter(d => !d.down && d.x > 4 && d.x < W - 12)
        target = up.length ? (up[irand(rng, up.length)] as Duck) : null
        // the aim is off now and then
        off = rng() < 0.22 ? { x: (rng() - 0.5) * 9, y: (rng() - 0.5) * 6 } : { x: 0, y: 0 }
        settle = 0
        if (!target) return
      }
      // lead the duck a little, glide to it, steady, then fire
      const tx = target.x + 3 + dir(target.row) * 2 + off.x
      const ty = (rails[target.row] as number) - 3 + off.y
      aim.x += (tx - aim.x) * 0.25
      aim.y += (ty - aim.y) * 0.25
      if (Math.hypot(tx - aim.x, ty - aim.y) < 1 && ++settle > 4) {
        flash = 3
        shots--
        const hit = ducks.find(d => !d.down && Math.abs(aim.x - (d.x + 3)) < 3.5 && Math.abs(aim.y - ((rails[d.row] as number) - 3)) < 3.5)
        if (hit) {
          hit.down = 1
          score++
          burst(fx, rng, aim.x, aim.y, 0xfff0a0, 8, 0.9)
        } else fx.push({ x: aim.x, y: aim.y, vx: 0, vy: 0, l: 10, c: 0x2a1a10 })
        target = null
        if (shots <= 0) reload = 30
      }
    },
    draw(px) {
      // the booth: a dark back wall, a striped awning, the counter in front
      sky(px, W, H, 0x2a1830, 0x1a1020)
      rect(px, W, H, 0, 0, W, 6, 0x1a1020)
      for (let y = 6; y < 11; y++) for (let x = 0; x < W; x++) px[y * W + x] = Math.floor(x / 4) % 2 ? 0xf4f0e8 : 0xd8342e
      for (let x = 0; x < W; x++) if (Math.floor(x / 4) % 2 === 0) dot(px, W, H, x, 11, 0xa82422)
      // bulbs under the awning
      for (let x = 2; x < W; x += 6) dot(px, W, H, x, 13, 0xffe080)
      for (const [i, y] of rails.entries()) {
        rect(px, W, H, 0, y, W, 2, i % 2 ? 0x6a4a2a : 0x7a5530)
        rect(px, W, H, 0, y, W, 1, 0xa87a48)
      }
      for (const d of ducks) {
        const y = rails[d.row] as number
        const rows = dir(d.row) > 0 ? DUCK : flip
        if (d.down) {
          // tipped over backwards: a flat strip on the rail
          rect(px, W, H, d.x, y - 1, 7, 1, 0x8a7a2a)
          continue
        }
        litSprite(px, W, H, Math.round(d.x), y - 6, rows, { y: 0xf0c830, e: 0x1a1a1a, b: 0xf07a20 })
      }
      // the counter and the rifle, aimed at the sight
      for (let y = Math.round(H * 0.8); y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === Math.round(H * 0.8) ? 0xc89060 : mix(0x8a5a34, 0x4a2c18, (y - H * 0.8) / (H * 0.2))
      const bx = W - 3
      const by = H - 3
      const dx = aim.x - bx
      const dy = aim.y - by
      const d = Math.hypot(dx, dy) || 1
      beam(px, W, H, bx, by, bx + (dx / d) * 11, by + (dy / d) * 11, 0x5a3a24)
      line(px, W, H, bx + (dx / d) * 8, by + (dy / d) * 8, bx + (dx / d) * 15, by + (dy / d) * 15, 0x3a3a44)
      // the sight: a ring and a dot, white when it fires
      const c = flash ? 0xffffff : 0xff4a4a
      ring(px, W, H, aim.x, aim.y, 2.5, c)
      dot(px, W, H, aim.x, aim.y, c)
      for (const f of fx) dot(px, W, H, f.x, f.y, f.c)
      // the score and the pellets left, over the awning
      text(px, W, H, 1, 1, String(score), 0xf0e0c0)
      for (let k = 0; k < shots; k++) rect(px, W, H, W - 2 - k * 2, 1, 1, 3, 0xd8b040)
    },
  }
}

export const PARTY = {
  plinko,
  prizewheel,
  connect4,
  airhockey,
  hoops,
  cupshuffle,
  bottleflip,
  shootgallery,
}
