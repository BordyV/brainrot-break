import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, ellipse, irand, line, pick, poly, sparks } from '../kit'
import type { Spark } from '../kit'

// Machines & how it's made: input, process, output, again.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

function belt(px: Uint32Array, W: number, H: number, y: number, t: number, speed: number) {
  rect(px, W, H, 0, y, W, 3, 0x3a3e46)
  for (let x = 0; x < W; x++) if ((x - Math.floor(t * speed)) % 4 === 0) dot(px, W, H, x, y + 1, 0x5a5e66)
  rect(px, W, H, 0, y + 3, W, 1, 0x2a2e36)
}

// --- claw machine -----------------------------------------------------------------

const claw: Maker = (W, H, rng) => {
  const glassTop = 6
  const pile = Math.round(H * 0.7)
  const chuteX = 4
  type P = { x: number; y: number; c: number }
  let toys: P[] = []
  let cx = W / 2
  let cy = glassTop + 3
  let open = 1
  let phase = 0
  let target: P | undefined
  let held: P | undefined
  let slip = false
  let wins = 0
  let t = 0

  function stock() {
    toys = []
    for (let i = 0; i < 12; i++) toys.push({ x: 9 + rng() * (W - 13), y: pile - 1 - (i % 3) * 2.5 - rng(), c: hsv(rng(), 0.55, 1) })
  }
  stock()

  return {
    step() {
      t++
      if (phase === 0) {
        target = target ?? pick(rng, toys)
        if (!target) {
          stock()
          return
        }
        cx += clamp(target.x - cx, -0.4, 0.4)
        if (Math.abs(target.x - cx) < 0.3) {
          phase = 1
          slip = rng() < 0.45
        }
      } else if (phase === 1) {
        cy += 0.5
        if (cy >= target!.y - 4) {
          phase = 2
          t = 0
        }
      } else if (phase === 2) {
        open = 1 - span(t, 0, 10)
        if (t > 12) {
          held = target
          toys = toys.filter(p => p !== target)
          phase = 3
        }
      } else if (phase === 3) {
        cy -= 0.4
        if (held) held.y = cy + 4
        if (slip && cy < pile - 14 && held) {
          toys.push({ ...held, y: pile - 1 })
          held = undefined
        }
        if (cy <= glassTop + 3) phase = 4
      } else if (phase === 4) {
        cx += clamp(chuteX + 2 - cx, -0.5, 0.5)
        if (held) held.x = cx
        if (Math.abs(cx - chuteX - 2) < 0.3) {
          open = 1
          if (held) wins++
          held = undefined
          phase = 5
          t = 0
        }
      } else if (phase === 5 && t > 20) {
        phase = 0
        target = undefined
        if (toys.length < 4) stock()
      }
    },
    draw(px) {
      px.fill(0xd83a6a)
      rect(px, W, H, 1, glassTop - 2, W - 2, pile - glassTop + 6, 0x2a3a5a)
      for (let y = glassTop; y < pile + 3; y++) if (y % 9 === 0) dot(px, W, H, W - 3, y, 0x8ab0e0)
      rect(px, W, H, 1, pile + 1, W - 2, 3, 0x6a4a8a)
      rect(px, W, H, chuteX - 2, pile - 6, 7, 10, 0x1a1a2a)
      rect(px, W, H, chuteX - 2, pile - 6, 7, 1, 0xd0d0d8)
      for (const p of toys) {
        disc(px, W, H, p.x, p.y, 2, p.c)
        dot(px, W, H, p.x - 1, p.y - 1, 0x1a1a1a)
        dot(px, W, H, p.x + 1, p.y - 1, 0x1a1a1a)
      }
      if (held) {
        disc(px, W, H, held.x, held.y, 2, held.c)
        dot(px, W, H, held.x - 1, held.y - 1, 0x1a1a1a)
      }
      rect(px, W, H, 1, glassTop - 1, W - 2, 1, 0x8a8a92)
      line(px, W, H, cx, glassTop, cx, cy, 0xc0c0c8)
      rect(px, W, H, cx - 1, cy, 3, 2, 0xd0d0d8)
      const spread = 1 + open * 2
      line(px, W, H, cx - 1, cy + 2, cx - spread, cy + 5, 0xd0d0d8)
      line(px, W, H, cx + 1, cy + 2, cx + spread, cy + 5, 0xd0d0d8)
      rect(px, W, H, 0, H - 6, W, 6, 0xb82a5a)
      disc(px, W, H, W - 6, H - 3, 1.5, 0xff3a3a)
      text(px, W, H, 2, H - 6, String(wins), 0xffe040)
      for (let x = 2; x < W - 2; x += 3) dot(px, W, H, x, 1, (x + (t >> 2)) % 6 < 3 ? 0xffe040 : 0xff8ad0)
    },
  }
}

// --- vending machine --------------------------------------------------------------

const vending: Maker = (W, H, rng) => {
  const rows = 4
  const cols = 3
  const gx = 3
  const gy = 5
  const cw = Math.floor((W * 0.7 - 4) / cols)
  const rh = Math.floor((H * 0.6) / rows)
  const items: number[][] = Array.from({ length: rows * cols }, () => Array(3).fill(0).map(() => hsv(rng(), 0.7, 0.95)))
  let sel = 0
  let phase = 0
  let t = 0
  let fall = { x: 0, y: 0, c: 0, stuck: false }
  let shake = 0
  let count = 0

  return {
    step() {
      t++
      if (shake > 0) shake--
      if (phase === 0 && t > 30) {
        sel = irand(rng, rows * cols)
        phase = 1
        t = 0
      } else if (phase === 1 && t > 25) {
        const r = Math.floor(sel / cols)
        const c = sel % cols
        fall = { x: gx + c * cw + cw / 2, y: gy + r * rh + rh - 4, c: (items[sel] as number[])[0] as number, stuck: rng() < 0.3 }
        ;(items[sel] as number[]).push((items[sel] as number[]).shift() as number)
        phase = 2
        t = 0
      } else if (phase === 2) {
        if (fall.stuck && t > 6 && t < 50) {
          if (t === 30) shake = 10
          return
        }
        fall.y += 1.2
        if (fall.y > H * 0.78) {
          phase = 3
          t = 0
          count++
        }
      } else if (phase === 3 && t > 30) {
        phase = 0
        t = 0
      }
    },
    draw(px) {
      const sx = shake > 0 ? Math.sin(shake * 2) : 0
      px.fill(0x2a2a34)
      rect(px, W, H, 1 + sx, 2, W - 2, H - 4, 0xc83a3a)
      rect(px, W, H, gx + sx, gy, cols * cw, rows * rh, 0x1a1e2a)
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const k = r * cols + c
          const x = gx + c * cw + sx
          const y = gy + r * rh
          const spin = phase === 1 && k === sel ? t * 0.3 : 0
          for (let s = 0; s < 3; s++) {
            const col = (items[k] as number[])[s] as number
            rect(px, W, H, x + 1, y + rh - 5 - s * 0, cw - 2, 3, s === 0 ? col : scale(col, 0.6 - s * 0.15))
          }
          for (let k2 = 0; k2 < cw - 2; k2 += 2) dot(px, W, H, x + 1 + k2, y + rh - 2 + Math.round(Math.sin(k2 + spin)), 0x9a9aa2)
        }
        rect(px, W, H, gx + sx, gy + (r + 1) * rh - 1, cols * cw, 1, 0x8a8a92)
      }
      rect(px, W, H, gx + sx, H * 0.75, cols * cw, H * 0.12, 0x101016)
      const kx = W * 0.78 + sx
      rect(px, W, H, kx, gy + 2, 5, 12, 0x2a2a2a)
      for (let k = 0; k < 9; k++) dot(px, W, H, kx + 1 + (k % 3), gy + 3 + Math.floor(k / 3) * 2, phase === 1 && k === sel % 9 ? 0x3aff6a : 0xb0b0b8)
      rect(px, W, H, kx, gy + 18, 5, 2, 0x101010)
      if (phase === 2 || phase === 3) rect(px, W, H, fall.x - 2 + sx, fall.y, 4, 3, fall.c)
      if (phase === 2 && fall.stuck && t > 20 && t < 50) text(px, W, H, W * 0.8, H * 0.55, '!', 0xffe040)
      text(px, W, H, 2, H - 8, String(count), 0xffffff)
    },
  }
}

// --- assembly line ----------------------------------------------------------------

const assembly: Maker = (W, H, rng) => {
  const lineY = Math.round(H * 0.65)
  type Car = { x: number; stage: number; c: number }
  let cars: Car[] = []
  let t = 0
  const stations = [W * 0.2, W * 0.45, W * 0.7]

  return {
    step() {
      t++
      if (t % 60 === 0) cars.push({ x: -12, stage: 0, c: hsv(rng(), 0.7, 0.9) })
      for (const c of cars) {
        c.x += 0.25
        for (let s = 0; s < stations.length; s++) if (c.stage === s && c.x + 6 > (stations[s] as number)) c.stage = s + 1
      }
      cars = cars.filter(c => c.x < W + 4)
    },
    draw(px) {
      sky(px, W, H, 0x8a8e98, 0x6a6e78, lineY)
      for (let x = 0; x < W; x += 8) rect(px, W, H, x, 0, 1, lineY, 0x7a7e88)
      belt(px, W, H, lineY, t, 0.25)
      rect(px, W, H, 0, lineY + 4, W, H - lineY - 4, 0x4a4e58)
      for (let i = 0; i < W; i += 6) rect(px, W, H, i, lineY + 4, 3, H, 0xe0c020)
      stations.forEach((sx, s) => {
        const busy = cars.some(c => Math.abs(c.x + 6 - sx) < 4)
        const swing = busy ? Math.sin(t * 0.4) * 2 : 0
        rect(px, W, H, sx - 1, 4, 3, 4, 0xe08a20)
        line(px, W, H, sx, 8, sx + swing, lineY - 12, 0xe08a20)
        line(px, W, H, sx + swing, lineY - 12, sx + swing * 1.5, lineY - 8, 0xf0a030)
        if (busy && t % 4 < 2) dot(px, W, H, sx + swing * 1.5, lineY - 7, s === 1 ? 0xffffff : 0xffe080)
      })
      for (const c of cars) {
        const x = c.x
        const y = lineY - 1
        rect(px, W, H, x, y - 2, 12, 2, 0x5a5a62)
        if (c.stage >= 1) {
          disc(px, W, H, x + 2.5, y, 1.4, 0x1a1a1a)
          disc(px, W, H, x + 9.5, y, 1.4, 0x1a1a1a)
        }
        if (c.stage >= 2) {
          rect(px, W, H, x, y - 5, 12, 3, c.stage >= 3 ? c.c : 0xb0b0b8)
          rect(px, W, H, x + 3, y - 8, 6, 3, c.stage >= 3 ? c.c : 0xb0b0b8)
        }
        if (c.stage >= 3) rect(px, W, H, x + 4, y - 7, 4, 1, 0xa8d8ff)
      }
    },
  }
}

// --- bottling line ----------------------------------------------------------------

const bottling: Maker = (W, H, rng) => {
  const lineY = Math.round(H * 0.7)
  type B = { x: number; fill: number; cap: boolean; label: boolean }
  let bs: B[] = []
  let t = 0
  let drink = 0xe05a2a
  const filler = W * 0.3
  const capper = W * 0.55
  const labeler = W * 0.8

  for (let x = -40; x < W; x += 6) bs.push({ x, fill: x > filler ? 1 : 0, cap: x > capper, label: x > labeler })

  return {
    step() {
      t++
      for (const b of bs) {
        const moving = !(Math.abs(b.x - filler) < 0.3 && b.fill < 1)
        if (moving) b.x += 0.3
        if (Math.abs(b.x - filler) < 0.3) b.fill = Math.min(1, b.fill + 0.05)
        if (Math.abs(b.x - capper) < 0.5) b.cap = true
        if (Math.abs(b.x - labeler) < 0.5) b.label = true
      }
      bs = bs.filter(b => b.x < W + 4)
      if (Math.min(...bs.map(b => b.x)) > -2) bs.push({ x: Math.min(...bs.map(b => b.x)) - 6, fill: 0, cap: false, label: false })
      if (t % 600 === 0) drink = hsv(rng(), 0.7, 0.85)
    },
    draw(px) {
      sky(px, W, H, 0xe8ecf0, 0xc8ccd4, lineY)
      belt(px, W, H, lineY, t, 0.3)
      rect(px, W, H, 0, lineY + 4, W, H - lineY - 4, 0x8a8e98)
      rect(px, W, H, filler - 3, 2, 6, 6, 0x8a8e98)
      rect(px, W, H, filler - 1, 8, 2, lineY - 22, 0xa0a4ac)
      const filling = bs.some(b => Math.abs(b.x - filler) < 0.3 && b.fill < 1)
      if (filling) line(px, W, H, filler, lineY - 14, filler, lineY - 10, drink)
      const press = Math.abs(Math.sin(t * 0.2)) * 2
      rect(px, W, H, capper - 2, lineY - 20 + press, 4, 4, 0x6a6e78)
      rect(px, W, H, capper - 0.5, 2, 1, lineY - 20 + press, 0x8a8e98)
      rect(px, W, H, labeler - 3, lineY - 14, 1, 10, 0xf0f0f0)
      disc(px, W, H, labeler - 5, lineY - 10, 2, 0xf0f0f0)
      for (const b of bs) {
        const x = b.x
        const y = lineY
        rect(px, W, H, x - 1, y - 9, 3, 9, 0xd8ecf4)
        rect(px, W, H, x, y - 11, 1, 2, 0xd8ecf4)
        const h = Math.round(b.fill * 8)
        if (h > 0) rect(px, W, H, x - 1, y - h, 3, h, drink)
        if (b.cap) rect(px, W, H, x - 0.5, y - 12, 2, 1, 0xe0c020)
        if (b.label) rect(px, W, H, x - 1, y - 6, 3, 2, 0xffffff)
      }
    },
  }
}

// --- rube goldberg machine --------------------------------------------------------

const rube: Maker = (W, H, rng) => {
  let t = 0
  const floor = H - 4
  const doms = Array.from({ length: 5 }, (_, i) => ({ x: W * 0.15 + i * 3, a: 0 }))
  let ball = { x: 3, y: 6, vx: 0, vy: 0 }
  let ball2 = { x: W * 0.62, y: floor - 9, vx: 0, vy: 0, on: false }
  let saw = 0
  let pop: Spark[] = []
  let popped = false

  function reset() {
    t = 0
    for (const d of doms) d.a = 0
    ball = { x: 3, y: 6, vx: 0, vy: 0 }
    ball2 = { x: W * 0.62, y: floor - 9, vx: 0, vy: 0, on: false }
    saw = 0
    popped = false
    pop = []
  }
  reset()
  const rampY = (x: number) => 6 + x * 0.6

  return {
    step() {
      t++
      pop = sparks(pop, 0.1)
      // 1. the ball rolls down the ramp onto the dominoes
      if (ball.y < floor - 2 && ball.x < doms[0]!.x - 1) {
        ball.x += 0.5
        ball.y = Math.min(rampY(ball.x), floor - 2)
      } else if (doms[0]!.a === 0) doms[0]!.a = 0.01
      // 2. the dominoes fall one after another
      doms.forEach((d, i) => {
        if (d.a > 0 && d.a < 1.4) d.a += 0.08
        if (d.a > 0.6 && doms[i + 1] && doms[i + 1]!.a === 0) doms[i + 1]!.a = 0.01
      })
      // 3. the last domino tips the seesaw, which launches the second ball
      const last = doms[doms.length - 1]!
      if (last.a > 1.2 && saw === 0) saw = 0.01
      if (saw > 0 && saw < 1) saw += 0.1
      if (saw >= 1 && !ball2.on) {
        ball2.on = true
        ball2.vx = 0.55
        ball2.vy = -2.1
      }
      if (ball2.on) {
        ball2.vy += 0.1
        ball2.x += ball2.vx
        ball2.y += ball2.vy
        // 4. into the funnel, onto the pin, and the balloon pops
        if (!popped && ball2.x > W * 0.86 && ball2.y > H * 0.3) {
          popped = true
          burst(pop, rng, W * 0.86, H * 0.18, 0xff3a6a, 18, 1.2)
        }
        if (ball2.y > floor - 1) {
          ball2.y = floor - 1
          ball2.vx = 0
        }
      }
      if (t > 300) reset()
    },
    draw(px) {
      sky(px, W, H, 0xf4ecd8, 0xe0d4b8, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0x9a6a3a)
      line(px, W, H, 0, rampY(0) + 1.5, doms[0]!.x - 1, rampY(doms[0]!.x - 1) + 1.5, 0x8a5a2a)
      rect(px, W, H, 0, rampY(0) + 2, 1, floor - rampY(0), 0x8a5a2a)
      for (const d of doms) line(px, W, H, d.x, floor, d.x + Math.sin(d.a) * 5, floor - Math.cos(d.a) * 5, 0x2a2a3a)
      const pv = W * 0.5
      const tilt = saw * 0.4
      line(px, W, H, pv - 6, floor - 3 - tilt * 6, pv + 6, floor - 3 + tilt * 6, 0xc8883a)
      poly(px, W, H, [[pv, floor - 3], [pv - 2, floor], [pv + 2, floor]], 0x6a4a2a)
      rect(px, W, H, W * 0.86 - 3, H * 0.4, 7, 1, 0x8a8a92)
      line(px, W, H, W * 0.86 + 3, H * 0.4, W * 0.86 + 3, H * 0.4 - 6, 0x8a8a92)
      line(px, W, H, W * 0.86, H * 0.4, W * 0.86, H * 0.24, 0xd0d0d8)
      if (!popped) {
        ellipse(px, W, H, W * 0.86, H * 0.18, 3, 4, 0xff3a6a)
        dot(px, W, H, W * 0.86 - 1, H * 0.18 - 2, 0xffb0c0)
        line(px, W, H, W * 0.86, H * 0.18 + 4, W * 0.86, H * 0.24, 0x5a5a5a)
      }
      for (const p of pop) dot(px, W, H, p.x, p.y, p.c)
      disc(px, W, H, ball.x, ball.y, 1.2, 0x3a6ae0)
      disc(px, W, H, ball2.on ? ball2.x : pv + 5, ball2.on ? ball2.y : floor - 4 + tilt * 6 - 1.5, 1.2, 0xe03a3a)
      if (popped && t % 10 < 6) text(px, W, H, W / 2 - 1, 4, '!', 0xe03a3a)
    },
  }
}

// --- coin pusher ------------------------------------------------------------------

const coinpusher: Maker = (W, H, rng) => {
  const shelf = Math.round(H * 0.62)
  const edge = W - 3
  type C = { x: number; y: number; vy: number; fall: boolean }
  let coins: C[] = []
  let push = 0
  let t = 0
  let won = 0
  let flash = 0

  function stock() {
    coins = []
    for (let i = 0; i < 45; i++) coins.push({ x: 6 + rng() * (edge - 9), y: shelf - 1 - Math.floor(rng() * 3), vy: 0, fall: false })
  }
  stock()

  return {
    step() {
      t++
      if (flash > 0) flash--
      const prev = push
      push = (Math.sin(t * 0.04) + 1) * 3
      const dp = push - prev
      if (t % 20 === 0) coins.push({ x: 4 + rng() * 6, y: 4, vy: 0, fall: true })
      for (const c of coins) {
        if (c.fall) {
          c.vy += 0.15
          c.y += c.vy
          const floorY = c.x > edge ? H + 5 : shelf - 1 - coins.filter(o => !o.fall && Math.abs(o.x - c.x) < 2).length * 0.6
          if (c.y >= floorY && c.x <= edge) {
            c.y = Math.round(floorY)
            c.fall = false
          }
          continue
        }
        if (dp > 0 && c.x < 4 + push + 2) c.x += dp * 1.1
        const crowd = coins.filter(o => !o.fall && o !== c && Math.abs(o.x - c.x) < 1.6 && o.x < c.x).length
        if (crowd > 2) c.x += 0.05
        if (c.x > edge) {
          c.fall = true
          c.vy = 0
        }
      }
      const before = coins.length
      coins = coins.filter(c => c.y < H + 3)
      if (coins.length < before) {
        won += before - coins.length
        flash = 8
      }
      if (coins.length > 80) stock()
    },
    draw(px) {
      px.fill(0x3a1a4a)
      for (let k = 0; k < 8; k++) dot(px, W, H, 1 + k * 4, 1, (k + (t >> 3)) % 2 ? 0xffe040 : 0xff4a8a)
      rect(px, W, H, 1, 3, W - 2, shelf - 3, 0x2a2a4a)
      rect(px, W, H, 1, shelf, edge, 2, 0x8a8aa0)
      rect(px, W, H, 1, shelf - 10, 3 + push, 10, 0xb0b0c8)
      rect(px, W, H, 1, shelf - 10, 3 + push, 1, 0xe0e0f0)
      for (const c of coins) {
        rect(px, W, H, c.x - 1, c.y, 3, 1, 0xf0c030)
        dot(px, W, H, c.x, c.y, 0xfff0a0)
      }
      rect(px, W, H, 1, H - 8, W - 2, 6, flash > 0 ? 0x5a3a7a : 0x1a1a2a)
      text(px, W, H, 2, H - 7, String(won), 0xffe040)
    },
  }
}

// --- gumball machine --------------------------------------------------------------

const gumball: Maker = (W, H, rng) => {
  const cx = W / 2
  const gy = H * 0.32
  const R = Math.min(W * 0.4, H * 0.24)
  const balls = Array.from({ length: 40 }, () => {
    const a = rng() * 6.28
    const r = Math.sqrt(rng()) * (R - 2)
    return { x: cx + Math.cos(a) * r, y: gy + Math.abs(Math.sin(a)) * r * 0.9, c: hsv(rng(), 0.7, 1) }
  })
  let t = 0
  let rolling: { u: number; c: number } | undefined
  let crank = 0
  let out: { c: number; t: number } | undefined

  return {
    step() {
      t++
      if (out && ++out.t > 40) out = undefined
      if (!rolling && t % 90 === 0) {
        const b = balls.pop()
        if (b) rolling = { u: 0, c: b.c }
        if (balls.length < 10) for (let i = 0; i < 30; i++) balls.unshift({ x: cx + (rng() - 0.5) * R * 1.4, y: gy + rng() * R * 0.6, c: hsv(rng(), 0.7, 1) })
      }
      if (rolling) {
        crank += 0.15
        rolling.u += 0.012
        if (rolling.u >= 1) {
          out = { c: rolling.c, t: 0 }
          rolling = undefined
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0xffe8f0, 0xf0d8e8)
      disc(px, W, H, cx, gy, R + 1, 0xd0e8f8)
      disc(px, W, H, cx, gy, R, 0xe8f4fc)
      for (const b of balls) disc(px, W, H, b.x, b.y, 1.3, b.c)
      dot(px, W, H, cx - R * 0.5, gy - R * 0.5, 0xffffff)
      dot(px, W, H, cx - R * 0.5 + 1, gy - R * 0.5 + 1, 0xffffff)
      rect(px, W, H, cx - 3, gy - R - 2, 6, 2, 0xe02a3a)
      const by = gy + R
      poly(px, W, H, [[cx - R * 0.6, by], [cx + R * 0.6, by], [cx + R * 0.5, H - 4], [cx - R * 0.5, H - 4]], 0xe02a3a)
      rect(px, W, H, cx - R * 0.7, H - 4, R * 1.4, 3, 0xb01a2a)
      disc(px, W, H, cx, by + 6, 2.5, 0xd0d0d8)
      line(px, W, H, cx, by + 6, cx + Math.cos(crank) * 2.5, by + 6 + Math.sin(crank) * 2.5, 0x6a6a72)
      rect(px, W, H, cx - 2, H - 12, 5, 4, 0x5a1a2a)
      if (rolling) {
        const u = rolling.u
        const a = u * Math.PI * 4
        disc(px, W, H, cx + Math.cos(a) * R * 0.35, by + 3 + u * (H - 16 - by), 1.2, rolling.c)
      }
      if (out) disc(px, W, H, cx, H - 10, 1.4, out.c)
    },
  }
}

// --- laser cutter -----------------------------------------------------------------

const lasercut: Maker = (W, H, rng) => {
  const sx0 = 3
  const sy0 = Math.round(H * 0.2)
  const sw = W - 6
  const sh = Math.round(H * 0.6)
  const burnt = new Uint8Array(W * H)
  let path: [number, number][] = []
  let pi = 0
  let shape = 0
  let lift = 0
  let sparksL: Spark[] = []
  let t = 0

  function plan() {
    burnt.fill(0)
    path = []
    const cx = sx0 + sw / 2
    const cy = sy0 + sh / 2
    const R = Math.min(sw, sh) * 0.4
    for (let k = 0; k <= 200; k++) {
      const a = (k / 200) * Math.PI * 2
      let r = R
      if (shape === 0) r = R * (0.55 + 0.45 * Math.cos(5 * a) ** 2)
      else if (shape === 1) {
        const x = 16 * Math.sin(a) ** 3
        const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a))
        path.push([cx + (x / 17) * R, cy + (y / 17) * R])
        continue
      } else r = R * (0.8 + 0.2 * Math.sign(Math.sin(a * 8)))
      path.push([cx + Math.cos(a - Math.PI / 2) * r, cy + Math.sin(a - Math.PI / 2) * r])
    }
    pi = 0
    lift = 0
    shape = (shape + 1) % 3
  }
  plan()

  return {
    step() {
      t++
      sparksL = sparks(sparksL, 0.08)
      if (pi < path.length) {
        for (let s = 0; s < 2 && pi < path.length; s++) {
          const [x, y] = path[pi++] as [number, number]
          const k = Math.round(y) * W + Math.round(x)
          if (k >= 0 && k < W * H) burnt[k] = 1
          if (rng() < 0.5) sparksL.push({ x, y, vx: (rng() - 0.5) * 0.8, vy: -rng() * 0.8, l: 6, c: pick(rng, [0xffe080, 0xff8a20]) })
        }
      } else {
        lift++
        if (lift > 90) plan()
      }
    },
    draw(px) {
      px.fill(0x2a2a30)
      rect(px, W, H, sx0, sy0, sw, sh, 0xd8b078)
      for (let y = sy0; y < sy0 + sh; y += 3) rect(px, W, H, sx0, y, sw, 1, 0xcca06c)
      const raise = lift > 20 ? Math.min(3, (lift - 20) * 0.1) : 0
      for (let k = 0; k < W * H; k++) if (burnt[k]) px[k] = 0x3a2010
      if (raise > 0 && path.length) {
        const xs = path.map(p => p[0])
        const ys = path.map(p => p[1])
        for (let y = Math.floor(Math.min(...ys)); y <= Math.max(...ys); y++)
          for (let x = Math.floor(Math.min(...xs)); x <= Math.max(...xs); x++) {
            let inside = false
            for (let i = 0, j = path.length - 1; i < path.length; j = i++) {
              const [xi, yi] = path[i] as [number, number]
              const [xj, yj] = path[j] as [number, number]
              if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
            }
            if (inside) {
              dot(px, W, H, x, y, 0x1a1a1e)
              dot(px, W, H, x, y - raise, 0xe8c088)
            }
          }
      }
      const cur = path[Math.min(pi, path.length - 1)] as [number, number]
      if (pi < path.length) {
        rect(px, W, H, 0, cur[1] - 1, W, 1, 0x5a5a62)
        rect(px, W, H, cur[0] - 2, cur[1] - 3, 4, 3, 0x8a8a92)
        dot(px, W, H, cur[0], cur[1], 0xffffff)
      }
      for (const s of sparksL) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- 3D printer -------------------------------------------------------------------

const printer3d: Maker = (W, H, rng) => {
  const bed = Math.round(H * 0.78)
  const cx = W / 2
  let layer = 0
  let nx = 0
  let dir = 1
  let shape = 0
  let col = 0x3ad0a0
  let hold = 0
  const maxLayers = Math.round(H * 0.45)

  const widthAt = (l: number) => {
    const u = l / maxLayers
    if (shape === 0) return W * 0.18 * (1 + 0.6 * Math.sin(u * Math.PI * 1.3))
    if (shape === 1) return W * 0.3 * (1 - u * 0.85)
    return W * (0.12 + 0.12 * Math.abs(Math.sin(u * Math.PI * 3)))
  }

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          layer = 0
          shape = (shape + 1) % 3
          col = hsv(rng(), 0.6, 0.95)
        }
        return
      }
      const hw = widthAt(layer)
      nx += dir * 1.2
      if (nx > hw || nx < -hw) {
        dir = -dir
        nx = clamp(nx, -hw, hw)
        layer++
        if (layer >= maxLayers) hold = 70
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a2e38, 0x1a1e26)
      rect(px, W, H, 2, 3, 1, bed, 0x6a6e78)
      rect(px, W, H, W - 3, 3, 1, bed, 0x6a6e78)
      rect(px, W, H, 2, bed, W - 4, 2, 0x3a3a42)
      rect(px, W, H, 3, bed, W - 6, 1, 0x5a8a5a)
      for (let l = 0; l < layer; l++) {
        const hw = widthAt(l)
        const y = bed - 1 - l
        rect(px, W, H, cx - hw, y, hw * 2 + 1, 1, l % 2 ? col : scale(col, 0.9))
        dot(px, W, H, cx - hw, y, scale(col, 0.7))
      }
      if (hold === 0) {
        const hw = widthAt(layer)
        const y = bed - 1 - layer
        rect(px, W, H, cx - hw, y, nx + hw + 1, 1, mix(col, 0xffffff, 0.3))
        rect(px, W, H, 2, y - 6, W - 4, 1, 0x8a8e98)
        rect(px, W, H, cx + nx - 2, y - 6, 5, 4, 0xd0d0d8)
        rect(px, W, H, cx + nx - 0.5, y - 2, 1, 1, 0xff8a20)
      }
      text(px, W, H, 1, H - 6, `${Math.round((layer / maxLayers) * 100)}%`, 0x8ae0b0)
    },
  }
}

// --- colour sorter ----------------------------------------------------------------

const colorsorter: Maker = (W, H, rng) => {
  const lineY = Math.round(H * 0.4)
  const COLS = [0xe03a3a, 0x3a8ae0, 0xf0c020]
  const gates = [W * 0.3, W * 0.55, W * 0.8]
  type I = { x: number; y: number; c: number; kicked: boolean; vy: number; vx: number }
  let items: I[] = []
  let bins = [0, 0, 0]
  let kick = [0, 0, 0]
  let t = 0

  return {
    step() {
      t++
      kick = kick.map(k => Math.max(0, k - 1))
      if (t % 14 === 0) items.push({ x: -3, y: lineY - 2, c: irand(rng, 3), kicked: false, vy: 0, vx: 0 })
      for (const it of items) {
        if (it.kicked) {
          it.vy += 0.15
          it.y += it.vy
          it.x += it.vx
          continue
        }
        it.x += 0.4
        const g = gates[it.c] as number
        if (Math.abs(it.x - g) < 0.3) {
          it.kicked = true
          it.vy = 0.5
          it.vx = 0
          kick[it.c] = 6
        }
      }
      items = items.filter(it => {
        if (it.kicked && it.y > H - 8 - Math.min(10, bins[it.c]! * 0.3)) {
          bins[it.c]!++
          return false
        }
        return it.x < W + 3
      })
      if (bins.some(b => b > 40)) bins = [0, 0, 0]
    },
    draw(px) {
      sky(px, W, H, 0xdce0e8, 0xb8bcc8)
      belt(px, W, H, lineY, t, 0.4)
      rect(px, W, H, 2, 2, 5, 4, 0x3a3a42)
      dot(px, W, H, 4, 4, t % 6 < 3 ? 0xff3a3a : 0x3aff6a)
      gates.forEach((g, k) => {
        rect(px, W, H, g - 1, lineY - 10 + (kick[k]! > 0 ? 4 : 0), 3, 4, 0x6a6e78)
        rect(px, W, H, g - 0.5, 2, 1, lineY - 10 + (kick[k]! > 0 ? 4 : 0), 0x8a8e98)
        rect(px, W, H, g - 3, H - 9, 7, 8, 0x5a5e68)
        rect(px, W, H, g - 2, H - 9, 5, 7, 0x2a2e36)
        const n = Math.min(7, Math.floor(bins[k]! / 5))
        if (n) rect(px, W, H, g - 2, H - 2 - n, 5, n, COLS[k] as number)
        rect(px, W, H, g - 3, H - 10, 7, 1, COLS[k] as number)
      })
      for (const it of items) {
        rect(px, W, H, it.x - 1, it.y - 1, 3, 2, COLS[it.c] as number)
        dot(px, W, H, it.x - 1, it.y - 1, mix(COLS[it.c] as number, 0xffffff, 0.5))
      }
    },
  }
}

// --- crayon factory ---------------------------------------------------------------

const crayons: Maker = (W, H, rng) => {
  const n = Math.max(4, Math.floor((W - 4) / 3))
  const moldY = Math.round(H * 0.6)
  let t = 0
  let col = 0xe03a3a

  return {
    step() {
      t++
      if (t > 240) {
        t = 0
        col = hsv(rng(), 0.75, 0.95)
      }
    },
    draw(px) {
      sky(px, W, H, 0xf0e8d8, 0xd8c8b0)
      rect(px, W, H, W / 2 - 6, 2, 12, 8, 0xa0a4ac)
      rect(px, W, H, W / 2 - 5, 3, 10, 5, col)
      const pour = span(t, 20, 120)
      const pourX = 2 + pour * (W - 4)
      if (t > 20 && t < 120) line(px, W, H, W / 2, 10, pourX, moldY - 8, col)
      rect(px, W, H, 1, moldY - 8, W - 2, 12, 0x8a8e98)
      const eject = span(t, 150, 190)
      for (let i = 0; i < n; i++) {
        const x = 2 + i * 3
        rect(px, W, H, x, moldY - 8, 2, 10, 0x4a4e58)
        const filled = x < pourX || t >= 120
        if (!filled) continue
        const cool = span(t, 120, 150)
        const c = mix(mix(col, 0xffffff, 0.3), col, cool)
        const y = moldY - 8 - eject * 12
        rect(px, W, H, x, y, 2, 10, c)
        dot(px, W, H, x, y - 1, c)
        if (t > 200) rect(px, W, H, x, y + 3, 2, 4, 0xf4f0e0)
        if (t > 200) dot(px, W, H, x, y + 5, scale(c, 0.6))
      }
      rect(px, W, H, 0, moldY + 4, W, H - moldY - 4, 0x6a6e78)
    },
  }
}

// --- wood chipper -----------------------------------------------------------------

const chipper: Maker = (W, H, rng) => {
  const ground = H - 4
  const mx = W * 0.35
  let branch = { x: -14, len: 12 }
  let chips: Spark[] = []
  let pile: number[] = Array(W).fill(0)
  let t = 0

  return {
    step() {
      t++
      branch.x += 0.3
      const inside = branch.x + branch.len > mx - 2
      if (inside) {
        branch.len -= 0.3
        for (let k = 0; k < 3; k++) chips.push({ x: mx + 8, y: H * 0.45, vx: 0.8 + rng() * 0.8, vy: -0.6 - rng() * 0.6, l: 60, c: pick(rng, [0xd8a868, 0xc89050, 0xe8c080, 0x6a8a3a]) })
        if (branch.len <= 0) branch = { x: -14 - rng() * 10, len: 10 + rng() * 6 }
      }
      for (const c of chips) {
        c.vy += 0.1
        c.x += c.vx
        c.y += c.vy
        const k = Math.round(clamp(c.x, 0, W - 1))
        if (c.y >= ground - pile[k]!) {
          pile[k] = Math.min(H * 0.3, pile[k]! + 0.08)
          c.l = 0
        }
      }
      chips = chips.filter(c => c.l > 0 && c.x < W + 2)
      if (Math.max(...pile) >= H * 0.3) pile = pile.map(() => 0)
    },
    draw(px) {
      sky(px, W, H, 0x8ac8f0, 0xe0f0e0, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x6a8a3a)
      for (let x = 0; x < W; x++) if (pile[x]! > 0) rect(px, W, H, x, ground - pile[x]!, 1, pile[x]!, (x % 3) ? 0xc89050 : 0xd8a868)
      rect(px, W, H, mx - 3, H * 0.4, 10, 12, 0xe08a20)
      rect(px, W, H, mx - 3, H * 0.4, 10, 1, 0xf0b040)
      poly(px, W, H, [[mx - 3, H * 0.4], [mx - 8, H * 0.32], [mx - 8, H * 0.5], [mx - 3, H * 0.48]], 0xc87010)
      line(px, W, H, mx + 7, H * 0.45, mx + 10, H * 0.42, 0x3a3a3a)
      disc(px, W, H, mx, ground - 1, 2, 0x1a1a1a)
      disc(px, W, H, mx + 5, ground - 1, 2, 0x1a1a1a)
      rect(px, W, H, mx - 1, H * 0.4 + 12, 8, ground - H * 0.4 - 13, 0x5a5a62)
      if (branch.len > 0) {
        const bx = Math.min(branch.x, mx - 8)
        line(px, W, H, bx, H * 0.42, bx + branch.len, H * 0.42, 0x6a4a2a)
        line(px, W, H, bx + 3, H * 0.42, bx + 1, H * 0.38, 0x6a4a2a)
        dot(px, W, H, bx + 1, H * 0.37, 0x4a9a3a)
        dot(px, W, H, bx, H * 0.38, 0x4a9a3a)
      }
      for (const c of chips) dot(px, W, H, c.x, c.y, c.c)
    },
  }
}

// --- paper shredder ---------------------------------------------------------------

const shredder: Maker = (W, H, rng) => {
  const slot = Math.round(H * 0.38)
  const x0 = Math.round(W * 0.2)
  const x1 = W - x0
  let sheet = { y: 4, lines: [] as number[] }
  let strips: { x: number; y: number; len: number }[] = []
  let bin = 0
  let t = 0

  function newSheet() {
    sheet = { y: -H * 0.3, lines: Array.from({ length: 8 }, () => 2 + rng() * (x1 - x0 - 6)) }
  }
  newSheet()

  return {
    step() {
      t++
      sheet.y += 0.3
      const sheetH = H * 0.3
      if (sheet.y + sheetH > slot) {
        for (let x = x0 + 1; x < x1 - 1; x += 2) if (rng() < 0.15) strips.push({ x, y: slot + 6, len: 1 })
      }
      if (sheet.y > slot) {
        newSheet()
        bin = Math.min(1, bin + 0.1)
        if (bin >= 1) bin = 0
      }
      for (const s of strips) {
        s.y += 0.5
        s.len = Math.min(4, s.len + 0.2)
      }
      strips = strips.filter(s => s.y < H - 4 - bin * 10)
    },
    draw(px) {
      sky(px, W, H, 0xe8eef4, 0xc8d0dc)
      const sheetH = H * 0.3
      const vis = Math.min(sheetH, slot - sheet.y)
      if (vis > 0) {
        rect(px, W, H, x0 + 1, sheet.y, x1 - x0 - 2, vis, 0xfafafa)
        sheet.lines.forEach((w, i) => {
          const y = sheet.y + 2 + i * 2.5
          if (y < slot) rect(px, W, H, x0 + 3, y, w, 1, 0x9aa0b0)
        })
      }
      rect(px, W, H, x0 - 2, slot, x1 - x0 + 4, 6, 0x3a3e46)
      rect(px, W, H, x0, slot + 1, x1 - x0, 1, 0x1a1a1e)
      dot(px, W, H, x1, slot + 3, t % 10 < 5 ? 0x3aff6a : 0x1a6a2a)
      rect(px, W, H, x0 - 2, slot + 6, x1 - x0 + 4, H - slot - 8, 0x5a5e68)
      rect(px, W, H, x0, slot + 7, x1 - x0, H - slot - 10, 0x2a2e36)
      for (const s of strips) rect(px, W, H, s.x, s.y, 1, s.len, 0xf0f0f0)
      const fill = Math.round(bin * 10)
      for (let y = 0; y < fill; y++) for (let x = x0; x < x1; x++) if ((x + y) % 2) dot(px, W, H, x, H - 4 - y, 0xe0e4e8)
    },
  }
}

// --- gacha machine ----------------------------------------------------------------

const gacha: Maker = (W, H, rng) => {
  const cx = W / 2
  const top = Math.round(H * 0.12)
  let t = 0
  let cap = 0x3ab0ff
  let prize = 0
  let rare = false
  const PRIZES = [
    ['.x.', 'xxx', '.x.'],
    ['x.x', 'xxx', '.x.'],
    ['xxx', 'x.x', 'xxx'],
    ['.x.', 'x.x', '.x.'],
  ]

  return {
    step() {
      t++
      if (t > 200) {
        t = 0
        cap = hsv(rng(), 0.7, 1)
        prize = irand(rng, PRIZES.length)
        rare = rng() < 0.2
      }
    },
    draw(px) {
      sky(px, W, H, 0xfff0f6, 0xf0e0ff)
      rect(px, W, H, cx - 10, top, 20, 20, 0xe8f4fc)
      rect(px, W, H, cx - 11, top - 1, 22, 1, 0xff6aa0)
      for (let k = 0; k < 14; k++) disc(px, W, H, cx - 7 + (k % 5) * 3.5, top + 6 + Math.floor(k / 5) * 4, 1.5, hsv(k * 0.13, 0.6, 1))
      rect(px, W, H, cx - 11, top + 20, 22, 16, 0xff6aa0)
      const knob = span(t, 20, 50) * Math.PI * 2
      disc(px, W, H, cx, top + 26, 3, 0xffffff)
      line(px, W, H, cx - Math.cos(knob) * 3, top + 26 - Math.sin(knob) * 3, cx + Math.cos(knob) * 3, top + 26 + Math.sin(knob) * 3, 0xc84a7a)
      rect(px, W, H, cx - 3, top + 31, 6, 4, 0x8a2a5a)
      if (t > 10 && t < 22) {
        const y = top - 8 + (t - 10) * 0.6
        disc(px, W, H, cx + 8, y, 1, 0xf0c030)
      }
      const drop = span(t, 50, 70)
      if (t > 50) {
        const y = top + 30 + drop * (H - top - 36)
        const opened = span(t, 90, 110)
        disc(px, W, H, cx, y - opened * 3, 3, cap)
        dot(px, W, H, cx - 1, y - 1 - opened * 3, 0xffffff)
        if (opened < 1) disc(px, W, H, cx, y + opened * 2, 3, 0xf8f8f8)
        else rect(px, W, H, cx - 3, y + 2, 6, 1, 0xf8f8f8)
        if (opened >= 1) {
          sprite(px, W, H, cx - 1, y - 9, PRIZES[prize] as string[], { x: rare ? 0xffd040 : hsv(prize * 0.25, 0.6, 1) })
          if (rare) for (let k = 0; k < 6; k++) dot(px, W, H, cx + Math.cos(k + t * 0.2) * 6, y - 8 + Math.sin(k + t * 0.2) * 4, 0xffe080)
        }
      }
    },
  }
}

// --- robot arm --------------------------------------------------------------------

const robotarm: Maker = (W, H, rng) => {
  const lineY = Math.round(H * 0.7)
  const base = { x: W * 0.5, y: lineY - 2 }
  const L1 = H * 0.22
  const L2 = H * 0.2
  let box = { x: -4, c: 0xc8884a }
  let held = false
  let pallet: number[] = []
  let tgt = { x: base.x, y: base.y - 10 }
  let hand = { x: base.x, y: base.y - 20 }
  let phase = 0
  let t = 0

  const ik = (x: number, y: number) => {
    const dx = x - base.x
    const dy = y - base.y
    const d = Math.min(L1 + L2 - 0.1, Math.hypot(dx, dy))
    const a = Math.atan2(dy, dx)
    const b = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1))
    const ex = base.x + Math.cos(a - b) * L1
    const ey = base.y + Math.sin(a - b) * L1
    return { ex, ey, hx: base.x + Math.cos(a) * d, hy: base.y + Math.sin(a) * d }
  }

  return {
    step() {
      t++
      if (!held) box.x += 0.35
      const pickX = W * 0.22
      const palX = W * 0.8
      const stackY = lineY - 2 - pallet.length * 3
      if (phase === 0) {
        tgt = { x: pickX, y: lineY - 6 }
        if (Math.abs(box.x - pickX) < 0.4 && Math.hypot(hand.x - pickX, hand.y - (lineY - 3)) < 4) {
          held = true
          phase = 1
        }
        if (box.x > W + 4) box = { x: -4, c: hsv(0.08, 0.5, 0.6 + rng() * 0.3) }
      } else if (phase === 1) {
        tgt = { x: palX, y: stackY - 6 }
        if (Math.hypot(hand.x - palX, hand.y - (stackY - 3)) < 1) {
          pallet.push(box.c)
          held = false
          box = { x: -4, c: hsv(0.08, 0.5, 0.6 + rng() * 0.3) }
          phase = 0
          if (pallet.length > 8) pallet = []
        }
      }
      if (phase === 0 && Math.abs(box.x - pickX) < 6) tgt = { x: pickX, y: lineY - 3 }
      if (phase === 1) tgt = { x: palX, y: stackY - 3 }
      hand.x += clamp(tgt.x - hand.x, -0.8, 0.8)
      hand.y += clamp(tgt.y - hand.y, -0.8, 0.8)
    },
    draw(px) {
      sky(px, W, H, 0x9aa0ac, 0x6a707c, lineY)
      belt(px, W, H, lineY, t, 0.35)
      rect(px, W, H, 0, lineY + 4, W, H - lineY - 4, 0x4a4e58)
      rect(px, W, H, W * 0.8 - 5, lineY - 1, 10, 2, 0x8a6a3a)
      pallet.forEach((c, i) => {
        rect(px, W, H, W * 0.8 - 2, lineY - 4 - i * 3, 5, 3, c)
        rect(px, W, H, W * 0.8 - 2, lineY - 4 - i * 3, 5, 1, mix(c, 0xffffff, 0.3))
      })
      const { ex, ey, hx, hy } = ik(hand.x, hand.y)
      rect(px, W, H, base.x - 3, base.y, 7, 3, 0x3a3a42)
      line(px, W, H, base.x, base.y, ex, ey, 0xf0a020)
      line(px, W, H, base.x + 1, base.y, ex + 1, ey, 0xd08010)
      line(px, W, H, ex, ey, hx, hy, 0xf0a020)
      disc(px, W, H, ex, ey, 1.2, 0x3a3a42)
      rect(px, W, H, hx - 2, hy, 5, 1, 0x3a3a42)
      const bx = held ? hx : box.x
      const by = held ? hy + 1 : lineY - 3
      rect(px, W, H, bx - 2, by, 5, 3, box.c)
      rect(px, W, H, bx - 2, by, 5, 1, mix(box.c, 0xffffff, 0.3))
    },
  }
}

// --- pin art ----------------------------------------------------------------------

const pinart: Maker = (W, H) => {
  const pitch = 2
  const cols = Math.floor(W / pitch)
  const rows = Math.floor(H / pitch)
  const depth = new Float32Array(cols * rows)
  let shape = 0
  let t = 0

  const press = (x: number, y: number) => {
    const u = (x - cols / 2) / (cols / 2)
    const v = (y - rows / 2) / (rows / 2)
    if (shape === 0) {
      const palm = Math.hypot(u, (v - 0.2) * 1.3) < 0.45
      const finger = [-0.36, -0.12, 0.12, 0.36].some(f => Math.abs(u - f) < 0.08 && v < 0.1 && v > -0.55 + Math.abs(f) * 0.4)
      const thumb = Math.abs(u + 0.5 + v * 0.3) < 0.08 && v > -0.05 && v < 0.35
      return palm || finger || thumb ? 1 : 0
    }
    if (shape === 1) {
      const x2 = u * 1.2
      const y2 = -v * 1.3 + 0.3
      return (x2 * x2 + y2 * y2 - 1) ** 3 - x2 * x2 * y2 * y2 * y2 < 0 ? 1 : 0
    }
    const d = Math.hypot(u, v * 0.6)
    if (d > 0.7) return 0
    const eye = Math.hypot(Math.abs(u) - 0.25, v * 0.6 + 0.12) < 0.1
    const smile = Math.abs(Math.hypot(u, v * 0.6 - 0.05) - 0.4) < 0.06 && v > 0.1
    return eye || smile ? 0.3 : 1
  }

  return {
    step() {
      t++
      const phase = t % 240
      const target = phase < 40 ? 0 : phase < 180 ? 1 : 0
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const k = y * cols + x
          const want = press(x, y) * target
          depth[k] = depth[k]! + (want - depth[k]!) * 0.08
        }
      if (phase === 239) shape = (shape + 1) % 3
    },
    draw(px) {
      px.fill(0x1a1c22)
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const d = depth[y * cols + x]!
          const c = mix(0x5a5e68, 0xf0f2f6, d)
          dot(px, W, H, x * pitch, y * pitch - d * 1, c)
          if (d > 0.3) dot(px, W, H, x * pitch + 1, y * pitch - d + 1, scale(c, 0.6))
        }
    },
  }
}

// --- warehouse robots -------------------------------------------------------------

const warehouse: Maker = (W, H, rng) => {
  const cs = 4
  const GW = Math.max(4, Math.floor(W / cs))
  const GH = Math.max(4, Math.floor((H - 6) / cs))
  const oy = 6
  type R = { x: number; y: number; px: number; py: number; carry: number; goal: [number, number]; path: [number, number][]; wait: number }
  const shelves = new Map<number, number>()
  for (let y = 1; y < GH - 2; y++) for (let x = 1; x < GW - 1; x++) if (x % 3 !== 0 && y % 3 !== 2 && rng() < 0.7) shelves.set(y * GW + x, hsv(rng(), 0.5, 0.85))
  let robots: R[] = Array.from({ length: Math.min(5, GW) }, (_, i) => ({ x: i, y: GH - 1, px: i, py: GH - 1, carry: -1, goal: [i, GH - 1] as [number, number], path: [], wait: 0 }))
  const station: [number, number] = [GW - 1, GH - 1]
  let t = 0
  let picked = 0

  const bfs = (r: R, to: [number, number]) => {
    const from = new Map<number, number>()
    const s = r.y * GW + r.x
    from.set(s, -1)
    const q = [s]
    const goal = to[1] * GW + to[0]
    for (let i = 0; i < q.length; i++) {
      const k = q[i] as number
      if (k === goal) break
      for (const [dx, dy] of DIRS) {
        const nx = (k % GW) + dx
        const ny = Math.floor(k / GW) + dy
        const nk = ny * GW + nx
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || from.has(nk)) continue
        if (r.carry >= 0 && shelves.has(nk) && nk !== goal) continue
        if (robots.some(o => o !== r && o.x === nx && o.y === ny)) continue
        from.set(nk, k)
        q.push(nk)
      }
    }
    const p: [number, number][] = []
    for (let k = goal; from.has(k) && k !== s; k = from.get(k) as number) p.unshift([k % GW, Math.floor(k / GW)])
    return p
  }

  return {
    step() {
      t++
      for (const r of robots) {
        r.px += (r.x - r.px) * 0.3
        r.py += (r.y - r.py) * 0.3
      }
      if (t % 5) return
      for (const r of robots) {
        if (!r.path.length) {
          if (r.carry < 0) {
            const keys = [...shelves.keys()]
            const k = pick(rng, keys)
            if (k === undefined) continue
            r.goal = [k % GW, Math.floor(k / GW)]
            r.path = bfs(r, r.goal)
          } else {
            r.goal = station
            r.path = bfs(r, station)
          }
          continue
        }
        const [nx, ny] = r.path[0] as [number, number]
        if (robots.some(o => o !== r && o.x === nx && o.y === ny)) {
          // blocked: after a short wait, look for a way around the others
          if (++r.wait > 2) {
            r.wait = 0
            r.path = bfs(r, r.goal)
          }
          continue
        }
        r.wait = 0
        r.path.shift()
        r.x = nx
        r.y = ny
        if (!r.path.length) {
          const k = r.y * GW + r.x
          if (r.carry < 0 && shelves.has(k)) {
            r.carry = shelves.get(k) as number
            shelves.delete(k)
          } else if (r.carry >= 0 && r.x === station[0] && r.y === station[1]) {
            picked++
            const empty = []
            for (let y = 1; y < GH - 2; y++) for (let x = 1; x < GW - 1; x++) if (x % 3 !== 0 && y % 3 !== 2 && !shelves.has(y * GW + x)) empty.push(y * GW + x)
            const slot = pick(rng, empty)
            if (slot !== undefined) shelves.set(slot, r.carry)
            r.carry = -1
          }
        }
      }
    },
    draw(px) {
      px.fill(0xb8bcc4)
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) rect(px, W, H, x * cs, oy + y * cs, cs - 1, cs - 1, 0xc8ccd4)
      rect(px, W, H, station[0] * cs - 1, oy + station[1] * cs - 1, cs + 1, cs + 1, 0x3ac06a)
      for (const [k, c] of shelves) rect(px, W, H, (k % GW) * cs, oy + Math.floor(k / GW) * cs, cs - 1, cs - 1, c)
      for (const r of robots) {
        rect(px, W, H, r.px * cs, oy + r.py * cs, cs - 1, cs - 1, 0xf08a20)
        if (r.carry >= 0) rect(px, W, H, r.px * cs, oy + r.py * cs - 1, cs - 1, cs - 2, r.carry)
        dot(px, W, H, r.px * cs + 1, oy + r.py * cs + 2, 0x3a3a3a)
      }
      text(px, W, H, 1, 0, String(picked), 0x3a3a42)
    },
  }
}

export const MACHINES = {
  claw,
  vending,
  assembly,
  bottling,
  rube,
  coinpusher,
  gumball,
  lasercut,
  printer3d,
  colorsorter,
  crayons,
  chipper,
  shredder,
  gacha,
  robotarm,
  pinart,
  warehouse,
}

