import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { clamp, ellipse, irand, line, lit, litSprite, pick, poly, slab, textWidth } from '../kit'

// Sports: a clear goal and a decisive moment.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

// --- basketball trick shots -------------------------------------------------------

const trickshots: Maker = (W, H, rng) => {
  const floor = H - 5
  const hoop = { x: W - 7, y: Math.round(H * 0.35) }
  let ball = { x: 0, y: 0, vx: 0, vy: 0 }
  let shooter = 3
  let net = 0
  let made = 0
  let shots = 0
  let wait = 0
  let scored = false

  function shoot() {
    shooter = 3 + rng() * W * 0.4
    ball = { x: shooter + 1, y: floor - 9, vx: 0, vy: 0 }
    const T = 28 + irand(rng, 14)
    const bank = rng() < 0.35
    const tx = bank ? hoop.x + 4 : hoop.x + 1.5
    const ty = bank ? hoop.y - 5 : hoop.y - 1
    ball.vx = (tx - ball.x) / T * (0.95 + rng() * 0.12)
    ball.vy = (ty - ball.y - 0.5 * 0.1 * T * T) / T
    shots++
    scored = false
  }
  shoot()

  return {
    step() {
      if (net > 0) net--
      if (wait > 0) {
        if (--wait === 0) shoot()
        return
      }
      const prevY = ball.y
      ball.vy += 0.1
      ball.x += ball.vx
      ball.y += ball.vy
      if (ball.x > W - 3) {
        ball.x = W - 3
        ball.vx = -Math.abs(ball.vx) * 0.6
      }
      if (ball.x > hoop.x + 3 && ball.x < W - 2 && ball.y > hoop.y - 8 && ball.y < hoop.y) ball.vx = -Math.abs(ball.vx) * 0.6
      if (!scored && prevY < hoop.y && ball.y >= hoop.y && ball.x > hoop.x - 1.5 && ball.x < hoop.x + 3) {
        scored = true
        made++
        net = 15
        ball.vx *= 0.2
      } else if (!scored && Math.abs(ball.y - hoop.y) < 1.5 && Math.abs(ball.x - (hoop.x - 2)) < 1.2) {
        ball.vy = -Math.abs(ball.vy) * 0.5
        ball.vx = -Math.abs(ball.vx) - 0.3
      }
      if (ball.y > floor - 1) {
        ball.y = floor - 1
        ball.vy = -ball.vy * 0.55
        ball.vx *= 0.8
        if (Math.abs(ball.vy) < 0.4) wait = 25
      }
      if (ball.x < -3) wait = 10
    },
    draw(px) {
      sky(px, W, H, 0x3a2a4a, 0x5a3a5a, floor)
      for (let y = 4; y < floor - 4; y += 3) for (let x = 0; x < W; x += 2) if ((x + y) % 4 === 0) dot(px, W, H, x, y, 0x4a3a5a)
      rect(px, W, H, 0, floor, W, H - floor, 0xd8a060)
      for (let x = 0; x < W; x += 6) rect(px, W, H, x, floor, 1, H - floor, 0xc08a4a)
      rect(px, W, H, W - 2, hoop.y - 10, 1, floor - hoop.y + 10, 0x8a8a92)
      rect(px, W, H, W - 3, hoop.y - 8, 1, 8, 0xffffff)
      rect(px, W, H, hoop.x - 2, hoop.y, 5, 1, 0xff5a1a)
      for (let k = 0; k < 4; k++) line(px, W, H, hoop.x - 2 + k * 1.3, hoop.y + 1, hoop.x - 1 + k * 1 + (net > 0 ? Math.sin(net) : 0), hoop.y + 4 + (net > 0 ? 1 : 0), 0xf0f0f0)
      litSprite(px, W, H, shooter - 1, floor - 8, ['.s.', 'jjj', 'jjj', '.j.', 'b.b', 'b.b', 'k.k'], { s: 0x8a5a3a, j: 0xe03a3a, b: 0x2a2a6a, k: 0xffffff })
      lit(px, W, H, ball.x, ball.y, 1.5, 1.5, 0xf07a1a)
      dot(px, W, H, ball.x, ball.y, 0x8a3a0a)
      text(px, W, H, 1, 1, `${made}/${shots}`, 0xffffff)
    },
  }
}

// --- penalty shootout -------------------------------------------------------------

const penalty: Maker = (W, H, rng) => {
  const goalY = Math.round(H * 0.18)
  const gw = Math.round(W * 0.8)
  const gx = (W - gw) / 2
  let t = 0
  let ball = { x: W / 2, y: H * 0.78, sz: 1.6 }
  let target = { x: 0, y: 0 }
  let keeper = { x: W / 2, dive: 0, dir: 0 }
  let saved = false
  let goals = 0
  let saves = 0
  let net = 0

  function setup() {
    t = 0
    ball = { x: W / 2, y: H * 0.78, sz: 1.6 }
    const side = rng() < 0.5 ? -1 : 1
    target = { x: W / 2 + side * (gw / 2 - 2 - rng() * 4), y: goalY + 2 + rng() * 6 }
    keeper = { x: W / 2, dive: 0, dir: rng() < 0.55 ? side : -side }
    saved = false
  }
  setup()

  return {
    step() {
      t++
      if (net > 0) net--
      if (t > 30 && t <= 45) {
        const u = (t - 30) / 15
        ball.x = W / 2 + (target.x - W / 2) * u
        ball.y = H * 0.78 + (target.y - H * 0.78) * u
        ball.sz = 1.6 - u * 0.6
        keeper.dive = Math.min(1, keeper.dive + 0.1)
        if (t === 45) {
          const kx = W / 2 + keeper.dir * keeper.dive * gw * 0.38
          saved = keeper.dir === Math.sign(target.x - W / 2) && Math.abs(kx - target.x) < 5
          if (saved) saves++
          else {
            goals++
            net = 20
          }
        }
      }
      if (t > 45 && saved && t < 70) {
        ball.y += 0.8
        ball.x += (target.x > W / 2 ? 1 : -1) * 0.4
      }
      if (t > 100) setup()
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = Math.floor(y / 5) % 2 ? 0x3aa03a : 0x46b046
      for (let y = 0; y < goalY - 4; y++) rect(px, W, H, 0, y, W, 1, mix(0x2a2a3a, 0x5a5a6a, y / goalY))
      for (let y = goalY - 4; y < goalY + 10; y++)
        for (let x = gx; x < gx + gw; x++) if ((x + y) % 2 === 0) dot(px, W, H, x + (net > 0 && Math.abs(x - target.x) < 4 && Math.abs(y - target.y) < 4 ? 1 : 0), y, 0xd8d8e0)
      rect(px, W, H, gx - 1, goalY - 5, gw + 2, 1, 0xffffff)
      rect(px, W, H, gx - 1, goalY - 5, 1, 16, 0xffffff)
      rect(px, W, H, gx + gw, goalY - 5, 1, 16, 0xffffff)
      rect(px, W, H, 0, goalY + 11, W, 1, 0xffffff)
      dot(px, W, H, W / 2, H * 0.78 + 1, 0xffffff)
      const kx = W / 2 + keeper.dir * keeper.dive * gw * 0.38
      const lean = keeper.dive * keeper.dir
      litSprite(px, W, H, kx - 2, goalY + 2 - keeper.dive * 2, Math.abs(lean) > 0.5 ? ['g...g', 'ggggg', '.yyy.', '.y.y.'] : ['.g.', 'ggg', 'gyg', '.y.', 'y.y'], { g: 0x2ae0a0, y: 0x2a2a2a })
      if (t < 32) litSprite(px, W, H, W / 2 - 3, H * 0.78 + 1, ['.s.', 'rrr', '.r.', 'w.w'], { s: 0xffd0a0, r: 0xe03a3a, w: 0xffffff })
      lit(px, W, H, ball.x, ball.y, ball.sz, ball.sz, 0xf4f4f8)
      dot(px, W, H, ball.x, ball.y, 0x2a2a2a)
      text(px, W, H, 1, H - 7, String(goals), 0xffffff)
      text(px, W, H, W - 4, H - 7, String(saves % 10), 0x2ae0a0)
    },
  }
}

// --- bowling strike ---------------------------------------------------------------

const bowling: Maker = (W, H, rng) => {
  const cx = W / 2
  type Pin = { x: number; y: number; vx: number; vy: number; down: boolean }
  let pins: Pin[] = []
  let ball = { x: 0, y: 0, vx: 0, vy: 0 }
  let t = 0
  let hook = 0
  let downs = 0

  function setup() {
    pins = []
    const top = H * 0.18
    for (let r = 0; r < 4; r++) for (let k = 0; k <= r; k++) pins.push({ x: cx + (k - r / 2) * 3, y: top + (3 - r) * 3, vx: 0, vy: 0, down: false })
    ball = { x: cx + W * 0.25, y: H - 6, vx: -0.05, vy: -0.75 }
    hook = 0.006 + rng() * 0.006
    t = 0
  }
  setup()

  return {
    step() {
      t++
      if (t > 160) {
        setup()
        return
      }
      if (t > 20) {
        ball.vx -= hook
        ball.x += ball.vx
        ball.y += ball.vy
      }
      for (const p of pins) {
        const d = Math.hypot(p.x - ball.x, p.y - ball.y)
        if (d < 2.6 && !p.down) {
          p.down = true
          p.vx = (p.x - ball.x) * 0.4 + (rng() - 0.5) * 0.3
          p.vy = -0.6 - rng() * 0.3
        }
        if (p.down) {
          p.x += p.vx
          p.y += p.vy
          p.vx *= 0.95
          p.vy *= 0.95
          for (const q of pins)
            if (!q.down && Math.hypot(q.x - p.x, q.y - p.y) < 2 && (Math.abs(p.vx) + Math.abs(p.vy)) > 0.2) {
              q.down = true
              q.vx = p.vx * 0.8 + (rng() - 0.5) * 0.3
              q.vy = p.vy * 0.8
            }
        }
      }
      downs = pins.filter(p => p.down).length
    },
    draw(px) {
      px.fill(0x1a1420)
      const lw = W * 0.7
      for (let y = 0; y < H; y++) {
        rect(px, W, H, cx - lw / 2, y, lw, 1, (Math.floor(y / 2) % 2) ? 0xe0b070 : 0xd8a868)
        dot(px, W, H, cx - lw / 2 - 1, y, 0x2a2a30)
        dot(px, W, H, cx + lw / 2, y, 0x2a2a30)
      }
      for (let k = -2; k <= 2; k++) dot(px, W, H, cx + k * 3, H * 0.6, 0x8a5a2a)
      for (const p of pins) {
        if (p.down) {
          rect(px, W, H, p.x - 1, p.y, 3, 1, 0xf0f0f0)
          dot(px, W, H, p.x, p.y, 0xe03a3a)
        } else {
          rect(px, W, H, p.x - 0.5, p.y - 2, 1.5, 3, 0xf8f8f8)
          dot(px, W, H, p.x + 0.5, p.y, 0xb8b8c4)
          dot(px, W, H, p.x, p.y - 1, 0xe03a3a)
        }
      }
      lit(px, W, H, ball.x, ball.y, 1.8, 1.8, 0x3a3ac8)
      dot(px, W, H, ball.x - 0.5, ball.y - 0.5, 0x8a8aff)
      if (downs === 10 && t > 90 && t % 10 < 6) text(px, W, H, W / 2 - 1, H * 0.45, 'x', 0xffe040)
      text(px, W, H, 1, 1, String(downs), 0xffffff)
    },
  }
}

// --- hole in one ------------------------------------------------------------------

const holeinone: Maker = (W, H, rng) => {
  const hole = { x: W * 0.6, y: H * 0.25 }
  let ball = { x: 0, y: 0, vx: 0, vy: 0 }
  let t = 0
  let inHole = 0
  let sunk = 0
  let tries = 0
  const slope = { x: 0.004, y: 0 }

  function putt() {
    ball = { x: W * (0.3 + rng() * 0.4), y: H * 0.85, vx: 0, vy: 0 }
    slope.x = (rng() - 0.5) * 0.008
    const dx = hole.x - ball.x
    const dy = hole.y - ball.y
    const d = Math.hypot(dx, dy)
    const sp = Math.sqrt(d * 0.04) * (0.95 + rng() * 0.12)
    const aim = Math.atan2(dy, dx) - slope.x * 40 + (rng() - 0.5) * 0.08
    ball.vx = Math.cos(aim) * sp
    ball.vy = Math.sin(aim) * sp
    t = 0
    inHole = 0
    tries++
  }
  putt()

  return {
    step() {
      t++
      if (inHole) {
        if (++inHole > 60) putt()
        return
      }
      ball.vx += slope.x
      ball.x += ball.vx
      ball.y += ball.vy
      ball.vx *= 0.98
      ball.vy *= 0.98
      const d = Math.hypot(ball.x - hole.x, ball.y - hole.y)
      const sp = Math.hypot(ball.vx, ball.vy)
      if (d < 1.4 && sp < 0.9) {
        inHole = 1
        sunk++
      } else if (d < 1.6) {
        ball.vx += (ball.x - hole.x) * 0.1
      }
      if (sp < 0.02 || t > 300) {
        inHole = 40
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = Math.floor((x + y * 0.5) / 4) % 2 ? 0x4ab84a : 0x52c252
      ellipse(px, W, H, hole.x, hole.y, W * 0.4, H * 0.18, 0x6ad86a)
      ellipse(px, W, H, hole.x - W * 0.08, hole.y - H * 0.04, W * 0.25, H * 0.09, 0x80e480)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (Math.hypot(x - hole.x, (y - hole.y) * 1.2) < W * 0.42 && Math.floor((x - y) / 4) % 2) px[y * W + x] = 0x62d062
      disc(px, W, H, hole.x, hole.y, 1.2, 0x1a1a1a)
      line(px, W, H, hole.x, hole.y, hole.x, hole.y - 10, 0xe0e0e0)
      rect(px, W, H, hole.x + 1, hole.y - 10, 4, 3, (t >> 3) % 2 ? 0xe03a3a : 0xff4a4a)
      if (!(inHole && inHole < 40 && Math.hypot(ball.x - hole.x, ball.y - hole.y) < 2)) {
        dot(px, W, H, ball.x + 1, ball.y + 1, 0x2a6a2a)
        disc(px, W, H, ball.x, ball.y, 1, 0xffffff)
      }
      if (inHole && inHole < 40) for (let k = 0; k < 8; k++) dot(px, W, H, hole.x + Math.cos(k + inHole * 0.2) * inHole * 0.3, hole.y - 4 + Math.sin(k) * inHole * 0.2, hsv(k / 8, 0.8, 1))
      text(px, W, H, 1, 1, `${sunk}/${tries}`, 0xffffff)
    },
  }
}

// --- ski slalom -------------------------------------------------------------------

const slalom: Maker = (W, H, rng) => {
  let scroll = 0
  let gates: { y: number; x: number; red: boolean }[] = []
  let sx = W / 2
  let trail: [number, number][] = []
  let t = 0
  let next = 20

  return {
    step() {
      t++
      scroll += 0.8
      while (next < scroll + H + 20) {
        gates.push({ y: next, x: W * (gates.length % 2 ? 0.68 : 0.32) + (rng() - 0.5) * 4, red: gates.length % 2 === 0 })
        next += 18
      }
      gates = gates.filter(g => g.y > scroll - 10)
      const sy = scroll + H * 0.3
      const g = gates.find(q => q.y > sy)
      if (g) sx += clamp(g.x + (g.red ? 3 : -3) - sx, -0.6, 0.6)
      trail.push([sx, sy])
      if (trail.length > 40) trail.shift()
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 7 + Math.floor(y + scroll) * 3) % 41 === 0 ? 0xd8e4f0 : 0xf4f8fc
      for (const [x, y] of trail) {
        dot(px, W, H, x - 1, y - scroll, 0xc8d8e8)
        dot(px, W, H, x + 1, y - scroll, 0xc8d8e8)
      }
      for (const g of gates) {
        const y = g.y - scroll
        const c = g.red ? 0xe03a3a : 0x3a6ae0
        rect(px, W, H, g.x - 1, y - 4, 1, 5, 0x5a5a5a)
        rect(px, W, H, g.x, y - 4, 2, 2, c)
      }
      const sy = H * 0.3
      const prev = trail[trail.length - 3] ?? [sx, 0]
      const lean = clamp((sx - prev[0]) * 2, -1, 1)
      litSprite(px, W, H, sx - 1, sy - 4, ['.h.', 'jjj', '.j.', 'p.p'], { h: 0xffd040, j: 0xe03aa0, p: 0x2a2a3a })
      line(px, W, H, sx - 2 + lean, sy, sx - 1 + lean, sy + 2, 0x2a2a3a)
      line(px, W, H, sx + 1 + lean, sy, sx + 2 + lean, sy + 2, 0x2a2a3a)
      text(px, W, H, 1, H - 7, (t / 15).toFixed(1), 0x3a3a5a)
    },
  }
}

// --- skate halfpipe ---------------------------------------------------------------

const halfpipe: Maker = (W, H, rng) => {
  const bottom = H - 6
  const R = W * 0.45
  const cx = W / 2
  let a = -0.3
  let va = 0.03
  let air = 0
  let ay = 0
  let avy = 0
  let spin = 0
  let fall = 0
  let tricks = 0

  const pos = (q: number): [number, number] => [cx + Math.sin(q) * R, bottom - R + Math.cos(q) * R]

  return {
    step() {
      if (fall > 0) {
        if (--fall === 0) {
          a = 0
          va = 0.03
        }
        return
      }
      if (air) {
        avy += 0.08
        ay += avy
        spin += 0.35
        if (ay >= 0) {
          air = 0
          ay = 0
          va = -va * 0.98
          tricks++
          if (rng() < 0.08) fall = 40
        }
        return
      }
      va += -Math.sin(a) * 0.0012
      va *= 1.009
      a += va
      if (Math.abs(a) > Math.PI / 2) {
        a = Math.sign(a) * Math.PI / 2
        air = 1
        ay = 0
        avy = -Math.min(2.4, Math.abs(va) * 40)
        spin = 0
        va = 0.02 * Math.sign(a)
      }
    },
    draw(px) {
      sky(px, W, H, 0x5ab0ff, 0xd8f0ff)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const dx = x - cx
          const dy = y - (bottom - R)
          const d = Math.hypot(dx, dy)
          if ((d > R && y > bottom - R) || y > bottom) px[y * W + x] = d < R + 1.5 && y <= bottom ? 0xe0e0e8 : 0x8a8a96
        }
      for (let x = 0; x < W; x += 4) dot(px, W, H, x, bottom + 2, 0x6a6a76)
      let [x, y] = pos(a)
      if (air) y = bottom - R + ay
      if (fall) {
        litSprite(px, W, H, x - 2, y - 2, ['sbb', 'jjj'], { s: 0xffd0a0, b: 0x2a2a6a, j: 0xe0a03a })
      } else {
        const rot = air ? Math.floor(spin / 1.57) % 4 : 0
        const body = [
          ['.s.', 'jjj', '.j.', 'b.b'],
          ['...', 'sjb', 'jj.', '..b'],
          ['b.b', '.j.', 'jjj', '.s.'],
          ['...', 'bjs', '.jj', 'b..'],
        ][rot] as string[]
        litSprite(px, W, H, x - 1, y - 5, body, { s: 0xffd0a0, j: 0xe0a03a, b: 0x2a2a6a })
        line(px, W, H, x - 2, y - 1, x + 2, y - 1, 0x3a3a3a)
      }
      text(px, W, H, 1, 1, String(tricks), 0x2a3a6a)
    },
  }
}

// --- pit stop ---------------------------------------------------------------------

const pitstop: Maker = (W, H, rng) => {
  const box = H * 0.5
  let t = 0
  let car = -20
  let time = 0
  const crew = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]
  void rng

  return {
    step() {
      t++
      if (t < 60) car = -20 + span(t, 0, 60) * (box + 20)
      else if (t < 100) {
        car = box
        time = (t - 60) / 15
      } else car = box + (t - 100) ** 1.6 * 0.15
      if (t > 160) t = 0
    },
    draw(px) {
      px.fill(0x4a4a52)
      rect(px, W, H, 0, 0, 4, H, 0x2a2a30)
      for (let y = 0; y < H; y += 6) rect(px, W, H, 0, y, 4, 3, 0xe0e0e0)
      rect(px, W, H, W * 0.2, box - 10, W * 0.6, 20, 0x5a5a62)
      rect(px, W, H, W * 0.2, box - 10, W * 0.6, 1, 0xffd040)
      rect(px, W, H, W * 0.2, box + 10, W * 0.6, 1, 0xffd040)
      const cx = W / 2
      const y = car
      slab(px, W, H, cx - 2, y - 7, 5, 14, 0xd02020)
      slab(px, W, H, cx - 4, y - 8, 9, 2, 0xd02020)
      slab(px, W, H, cx - 4, y + 6, 9, 2, 0xd02020)
      dot(px, W, H, cx, y - 1, 0xffd040)
      const working = t > 60 && t < 100
      const phase = span(t, 62, 96)
      for (const [dx, dy] of crew) {
        const wx = cx + dx * 4
        const wy = y + dy * 5
        const swapped = phase > 0.5
        rect(px, W, H, wx - 1, wy - 1.5, 2, 3, swapped ? 0x1a1a1a : 0x3a3a3a)
        if (swapped) dot(px, W, H, wx - 1, wy - 1, 0xffe040)
        if (working) {
          const mx = cx + dx * (7 + (phase < 0.5 ? phase * 6 : (1 - phase) * 6))
          litSprite(px, W, H, mx - 1, wy - 1, ['.h.', 'ccc'], { h: 0xffffff, c: 0x3a6aff })
          if (phase > 0.25 && phase < 0.75) rect(px, W, H, mx + dx * 2 - 1, wy - 1.5, 2, 3, phase < 0.5 ? 0x3a3a3a : 0x1a1a1a)
        }
      }
      if (working) litSprite(px, W, H, cx - 1, y - 12, ['.h.', 'ccc'], { h: 0xffffff, c: 0x3a6aff })
      text(px, W, H, 1, 1, time.toFixed(1), 0xffe040)
    },
  }
}

// --- table tennis -----------------------------------------------------------------

const tabletennis: Maker = (W, H, rng) => {
  const tx0 = W * 0.15
  const tx1 = W * 0.85
  const ty0 = H * 0.18
  const ty1 = H * 0.82
  let ball = { x: W / 2, y: ty1 - 2, z: 2, vx: 0, vy: -0.7, vz: 0.5 }
  let pa = W / 2
  let pb = W / 2
  let sa = 0
  let sb = 0
  let wait = 0

  function serve(dir: number) {
    ball = { x: W / 2 + (rng() - 0.5) * 6, y: dir < 0 ? ty1 - 2 : ty0 + 2, z: 3, vx: (rng() - 0.5) * 0.3, vy: dir * 0.75, vz: 0.4 }
  }
  serve(-1)

  return {
    step() {
      if (wait > 0) {
        if (--wait === 0) serve(rng() < 0.5 ? -1 : 1)
        return
      }
      ball.vz -= 0.05
      ball.x += ball.vx
      ball.y += ball.vy
      ball.z += ball.vz
      if (ball.z <= 0) {
        if (ball.x < tx0 || ball.x > tx1 || ball.y < ty0 || ball.y > ty1) {
          if (ball.vy < 0) sa++
          else sb++
          wait = 30
          return
        }
        ball.z = 0
        ball.vz = 0.55
      }
      pa += clamp(ball.x - pa, -0.6, 0.6)
      pb += clamp(ball.x - pb, -0.6, 0.6)
      if (ball.vy < 0 && ball.y < ty0 - 1) {
        if (Math.abs(ball.x - pa) < 3 && rng() > 0.06) {
          ball.vy = 0.75 + rng() * 0.2
          ball.vx = (rng() - 0.5) * 0.4
          ball.vz = 0.35
        } else if (ball.y < ty0 - 6) {
          sb++
          wait = 30
        }
      }
      if (ball.vy > 0 && ball.y > ty1 + 1) {
        if (Math.abs(ball.x - pb) < 3 && rng() > 0.06) {
          ball.vy = -0.75 - rng() * 0.2
          ball.vx = (rng() - 0.5) * 0.4
          ball.vz = 0.35
        } else if (ball.y > ty1 + 6) {
          sa++
          wait = 30
        }
      }
      if (sa > 9 || sb > 9) {
        sa = 0
        sb = 0
      }
    },
    draw(px) {
      px.fill(0x8a2a3a)
      rect(px, W, H, tx0, ty0, tx1 - tx0, ty1 - ty0, 0x1a5a9a)
      rect(px, W, H, tx0, ty0, tx1 - tx0, 1, 0xffffff)
      rect(px, W, H, tx0, ty1 - 1, tx1 - tx0, 1, 0xffffff)
      rect(px, W, H, tx0, ty0, 1, ty1 - ty0, 0xffffff)
      rect(px, W, H, tx1 - 1, ty0, 1, ty1 - ty0, 0xffffff)
      rect(px, W, H, W / 2, ty0, 1, ty1 - ty0, 0xd8d8d8)
      rect(px, W, H, tx0 - 2, H / 2, tx1 - tx0 + 4, 1, 0xe8e8f0)
      dot(px, W, H, ball.x, ball.y, 0x0a2a4a)
      disc(px, W, H, ball.x, ball.y - ball.z * 2, 0.8, 0xffffff)
      lit(px, W, H, pa, ty0 - 3, 2, 1.4, 0xe02a2a)
      lit(px, W, H, pb, ty1 + 3, 2, 1.4, 0x3a3a3a)
      text(px, W, H, 1, 1, String(sa), 0xffffff)
      text(px, W, H, 1, H - 6, String(sb), 0xffffff)
    },
  }
}

// --- curling ----------------------------------------------------------------------

const curling: Maker = (W, H, rng) => {
  const house = { x: W / 2, y: H * 0.2 }
  type S = { x: number; y: number; vx: number; vy: number; red: boolean; spin: number }
  let stones: S[] = []
  let cur: S | undefined
  let t = 0
  let ends = 0

  function throwStone() {
    const red = stones.length % 2 === 0
    const spin = rng() < 0.5 ? -1 : 1
    cur = { x: W / 2 - spin * 3, y: H - 4, vx: spin * 0.012, vy: -(H - 4 - house.y) * 0.03 * (0.88 + rng() * 0.22), red, spin }
    t = 0
  }
  throwStone()

  return {
    step() {
      t++
      if (cur) {
        cur.vx -= cur.spin * 0.004 * Math.abs(cur.vy)
        cur.x += cur.vx
        cur.y += cur.vy
        cur.vy *= 0.97
        cur.vx *= 0.97
        for (const s of stones) {
          const d = Math.hypot(s.x - cur.x, s.y - cur.y)
          if (d < 3) {
            const nx = (s.x - cur.x) / d
            const ny = (s.y - cur.y) / d
            const vn = cur.vx * nx + cur.vy * ny
            s.vx += vn * nx
            s.vy += vn * ny
            cur.vx -= vn * nx
            cur.vy -= vn * ny
          }
        }
        if (cur.y < -3 || cur.x < -3 || cur.x > W + 3) {
          cur = undefined
          t = 0
        } else if (Math.abs(cur.vy) < 0.02 && Math.abs(cur.vx) < 0.02) {
          stones.push(cur)
          cur = undefined
          t = 0
        }
      } else if (t > 30) {
        if (stones.length >= 8) {
          stones = []
          ends++
        }
        throwStone()
      }
      for (const s of stones) {
        s.x += s.vx
        s.y += s.vy
        s.vx *= 0.95
        s.vy *= 0.95
      }
      stones = stones.filter(s => s.y > -3 && s.x > -3 && s.x < W + 3)
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 3 + y * 7) % 23 === 0 ? 0xe0ecf8 : 0xf4f8fc
      for (const [r, c] of [
        [W * 0.42, 0x3a6ae0],
        [W * 0.3, 0xf4f8fc],
        [W * 0.18, 0xe03a3a],
        [W * 0.06, 0xf4f8fc],
      ] as [number, number][])
        ellipse(px, W, H, house.x, house.y, r, r * 0.9, c)
      rect(px, W, H, 0, house.y, W, 1, 0x8ab0e0)
      rect(px, W, H, W / 2, 0, 1, H, 0x8ab0e0)
      const draw = (s: S) => {
        lit(px, W, H, s.x, s.y, 1.6, 1.6, 0x8a8a92)
        dot(px, W, H, s.x, s.y - 1, s.red ? 0xe03a3a : 0xffd040)
        dot(px, W, H, s.x, s.y, s.red ? 0xe03a3a : 0xffd040)
      }
      for (const s of stones) draw(s)
      if (cur) {
        draw(cur)
        if (cur.y < H * 0.8 && cur.y > house.y + 6) {
          const sweep = Math.sin(t * 0.8) * 2
          litSprite(px, W, H, cur.x - 4 + sweep, cur.y - 7, ['.s', 'jj', 'p.'], { s: 0xffd0a0, j: cur.red ? 0xe03a3a : 0xe0b020, p: 0x2a2a3a })
          litSprite(px, W, H, cur.x + 3 - sweep, cur.y - 7, ['s.', 'jj', '.p'], { s: 0xffd0a0, j: cur.red ? 0xe03a3a : 0xe0b020, p: 0x2a2a3a })
          line(px, W, H, cur.x - 3 + sweep, cur.y - 4, cur.x - 1 + sweep, cur.y - 3, 0x8a6a4a)
        }
      }
      text(px, W, H, 1, H - 6, String(ends), 0x3a5a8a)
    },
  }
}

// --- archery ----------------------------------------------------------------------

const archery: Maker = (W, H, rng) => {
  const ground = H - 6
  const target = { x: W - 4, y: H * 0.45 }
  let arrow = { x: 0, y: 0, vx: 0, vy: 0, stuck: false }
  let hits: [number, number][] = []
  let score = 0
  let t = 0
  let wind = 0

  function shoot() {
    wind = (rng() - 0.5) * 0.004
    arrow = { x: 6, y: H * 0.5, vx: 1.6, vy: -0.55 + (rng() - 0.5) * 0.12, stuck: false }
    t = 0
  }
  shoot()

  return {
    step() {
      t++
      if (arrow.stuck) {
        if (t > 50) {
          if (hits.length > 6) hits = []
          shoot()
        }
        return
      }
      if (t < 20) return
      arrow.vy += 0.035
      arrow.vy += wind
      arrow.x += arrow.vx
      arrow.y += arrow.vy
      if (arrow.x >= target.x - 1) {
        arrow.x = target.x - 1
        arrow.stuck = true
        t = 0
        const d = Math.abs(arrow.y - target.y)
        if (d < 8) {
          hits.push([arrow.x, arrow.y])
          score += Math.max(1, 10 - Math.round(d * 1.2))
        }
      }
      if (arrow.y > ground) {
        arrow.stuck = true
        t = 0
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ac8f0, 0xe0f4ff, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x5aa03a)
      rect(px, W, H, 0, ground, W, 1, 0x7ac05a)
      for (const [r, c] of [
        [8, 0xf0f0f0],
        [6, 0x2a2a2a],
        [4, 0x3a8ae0],
        [2.5, 0xe03a3a],
        [1, 0xffd040],
      ] as [number, number][])
        ellipse(px, W, H, target.x, target.y, 2, r, c)
      line(px, W, H, target.x, target.y + 8, target.x - 2, ground, 0x8a5a2a)
      litSprite(px, W, H, 2, H * 0.5 - 3, ['.s.', 'ggg', '.g.', 'b.b', 'b.b'], { s: 0xffd0a0, g: 0x3a7a3a, b: 0x5a3a2a })
      line(px, W, H, 5, H * 0.5 - 4, 5, H * 0.5 + 3, 0x8a5a2a)
      for (const [hx, hy] of hits) line(px, W, H, hx - 4, hy, hx, hy, 0x8a6a4a)
      const a = Math.atan2(arrow.vy, arrow.vx)
      line(px, W, H, arrow.x - Math.cos(a) * 5, arrow.y - Math.sin(a) * 5, arrow.x, arrow.y, 0x6a4a2a)
      dot(px, W, H, arrow.x - Math.cos(a) * 5, arrow.y - Math.sin(a) * 5, 0xe03a3a)
      dot(px, W, H, arrow.x, arrow.y, 0xd0d0d8)
      line(px, W, H, W / 2, 3, W / 2 + wind * 1500, 3, 0xffffff)
      text(px, W, H, 1, 1, String(score), 0x2a3a6a)
    },
  }
}

// --- volleyball -------------------------------------------------------------------

const volleyball: Maker = (W, H, rng) => {
  const floor = H - 6
  const net = W / 2
  const netTop = floor - 14
  let ball = { x: W * 0.25, y: floor - 20, vx: 0, vy: 0 }
  let players = [W * 0.15, W * 0.35, W * 0.65, W * 0.85]
  let jump = [0, 0, 0, 0]
  let score = [0, 0]
  let touches = 0
  let side = 0
  let wait = 0

  function serve() {
    side = rng() < 0.5 ? 0 : 1
    ball = { x: side ? W * 0.85 : W * 0.15, y: floor - 10, vx: side ? -0.8 : 0.8, vy: -2 }
    touches = 0
  }
  serve()

  return {
    step() {
      jump = jump.map(j => Math.max(0, j - 1))
      if (wait > 0) {
        if (--wait === 0) serve()
        return
      }
      ball.vy += 0.08
      ball.x += ball.vx
      ball.y += ball.vy
      if (Math.abs(ball.x - net) < 1 && ball.y > netTop) {
        ball.vx = -ball.vx * 0.5
        ball.x = net + Math.sign(ball.x - net || 1) * 1.2
      }
      const mySide = ball.x < net ? 0 : 1
      for (let i = 0; i < 4; i++) {
        const ps = i < 2 ? 0 : 1
        if (ps !== mySide) continue
        players[i] = players[i]! + clamp(ball.x + (ps ? 1 : -1) * (i % 2 ? 1 : 4) - players[i]!, -0.5, 0.5)
        players[i] = clamp(players[i]!, ps ? net + 2 : 2, ps ? W - 3 : net - 2)
      }
      if (ball.vy > 0 && ball.y > floor - 9) {
        const near = [0, 1, 2, 3].filter(i => (i < 2 ? 0 : 1) === mySide).sort((a, b) => Math.abs(players[a]! - ball.x) - Math.abs(players[b]! - ball.x))[0] as number
        if (Math.abs(players[near]! - ball.x) < 3 && rng() > 0.07) {
          touches = side === mySide ? touches + 1 : 1
          side = mySide
          const dir = mySide ? -1 : 1
          jump[near] = 8
          if (touches >= 3) {
            ball.vx = dir * (1.1 + rng() * 0.4)
            ball.vy = -0.6
            ball.y = netTop - 4
          } else if (touches === 2) {
            ball.vx = (net - dir * 4 - ball.x) / 30
            ball.vy = -2.2
          } else {
            ball.vx = dir * 0.2
            ball.vy = -2
          }
        }
      }
      if (ball.y > floor - 1) {
        score[mySide ? 0 : 1]!++
        if (score[0]! > 9 || score[1]! > 9) score = [0, 0]
        wait = 40
        ball.y = floor - 1
      }
    },
    draw(px) {
      sky(px, W, H, 0x5ab0f0, 0xffe8b0, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0xf0d890)
      rect(px, W, H, 0, floor, W, 1, 0xfff0b8)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, floor + 2, 0xd8c070)
      rect(px, W, H, net, netTop, 1, floor - netTop, 0x8a8a8a)
      for (let y = netTop; y < netTop + 5; y++) for (let x = net - 2; x <= net + 2; x++) if ((x + y) % 2) dot(px, W, H, x, y, 0xf0f0f0)
      players.forEach((p, i) => {
        const y = floor - 7 - (jump[i]! > 4 ? 8 - jump[i]! : jump[i]!) * 0.6
        litSprite(px, W, H, p - 1, y, ['.s.', 'jjj', 'sjs', '.b.', 'b.b', 'b.b', 'k.k'], { s: 0xd8a070, j: i < 2 ? 0xe03a3a : 0x3a6ae0, b: 0x2a2a2a, k: 0xf0f0f0 })
      })
      lit(px, W, H, ball.x, ball.y, 1.5, 1.5, 0xf4f4f8)
      dot(px, W, H, ball.x, ball.y, 0xffd040)
      text(px, W, H, 1, 1, String(score[0]), 0xe03a3a)
      text(px, W, H, W - 4, 1, String(score[1]), 0x3a6ae0)
    },
  }
}

// --- ski jump ---------------------------------------------------------------------

const skijump: Maker = (W, H, rng) => {
  const takeoff = { x: W * 0.25, y: H * 0.3 }
  const ramp = (x: number) => (x < takeoff.x ? 4 + (x / takeoff.x) ** 0.7 * (takeoff.y - 4) : takeoff.y)
  const hill = (x: number) => takeoff.y + 3 + (x - takeoff.x) * 0.5
  let phase = 0
  let x = 2
  let y = 4
  let vx = 0
  let vy = 0
  let best = 0
  let dist = 0
  let t = 0

  function reset() {
    phase = 0
    x = 2
    y = ramp(2)
    vx = 0.2
    vy = 0
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (phase === 0) {
        vx = Math.min(0.7, vx + 0.02)
        x += vx
        y = ramp(x)
        if (x >= takeoff.x) {
          phase = 1
          vy = -0.4 - rng() * 0.15
        }
      } else if (phase === 1) {
        vy += 0.06
        x += vx
        y += vy
        if (y >= hill(x) - 1 || x > W + 4) {
          phase = 2
          dist = Math.round((x - takeoff.x) * 3.2)
          best = Math.max(best, dist)
          t = 0
        }
      } else if (t > 60) reset()
    },
    draw(px) {
      sky(px, W, H, 0x6ab0f0, 0xe0f0ff)
      for (let xx = 0; xx < W; xx++) {
        const top = xx < takeoff.x ? ramp(xx) + 1 : hill(xx)
        rect(px, W, H, xx, top, 1, H - top, xx < takeoff.x ? 0x8a6a4a : 0xf4f8fc)
        if (xx < takeoff.x) dot(px, W, H, xx, top - 1, 0xf4f8fc)
        if (xx > takeoff.x && Math.round(xx - takeoff.x) % 6 === 0) dot(px, W, H, xx, hill(xx) + 1, 0xe03a3a)
      }
      for (let k = 0; k < 5; k++) rect(px, W, H, W * 0.6 + k * 3, H - 8, 2, 4, hsv(k * 0.2, 0.6, 0.8))
      const v = phase === 1
      litSprite(px, W, H, x - 2, y - 3, v ? ['..s', 'jjj', '.jj'] : ['.s.', 'jjj', '.j.'], { s: 0xffd0a0, j: 0x3a6ae0 })
      if (v) {
        line(px, W, H, x - 3, y + 1, x + 2, y - 1, 0xe03a3a)
        line(px, W, H, x - 3, y + 2, x + 2, y + 1, 0xe03a3a)
      } else line(px, W, H, x - 3, y + 0.5, x + 2, y + 0.5, 0xe03a3a)
      if (phase === 2) text(px, W, H, 1, H - 7, String(dist), 0x2a3a6a)
      text(px, W, H, 1, 1, String(best), 0x2a3a6a)
    },
  }
}

// --- horse race -------------------------------------------------------------------

const horserace: Maker = (W, H, rng) => {
  const lanes = W >= 24 ? 6 : 4
  const top = 8
  const lh = Math.floor((H - top - 6) / lanes)
  type Hr = { x: number; v: number; ph: number; c: number }
  let horses: Hr[] = []
  let cam = 0
  let finish = 0
  let done = 0
  let t = 0

  function reset() {
    horses = Array.from({ length: lanes }, (_, i) => ({ x: 0, v: 0, ph: rng() * 6, c: hsv(i / lanes, 0.7, 0.95) }))
    cam = 0
    finish = 220
    done = 0
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (done) {
        if (++done > 80) reset()
        return
      }
      for (const h of horses) {
        h.v = 0.9 + Math.sin(t * 0.03 + h.ph) * 0.25 + Math.sin(t * 0.011 + h.ph * 2) * 0.15
        h.x += h.v
      }
      const lead = Math.max(...horses.map(h => h.x))
      cam = lead - W * 0.7
      if (lead >= finish) done = 1
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y < top ? 0x5ab0e0 : y >= H - 5 ? 0x3a8a3a : (Math.floor(x + cam) % 8 < 4 ? 0xb8885a : 0xc8986a)
      for (let k = 0; k < W; k += 2) dot(px, W, H, k - (cam % 2), top - 1, 0xffffff)
      for (let k = 0; k <= lanes; k++) rect(px, W, H, 0, top + k * lh, W, 1, 0xe8d8c0)
      const fx = finish - cam + 4
      for (let y = top; y < H - 5; y++) dot(px, W, H, fx, y, y % 2 ? 0x000000 : 0xffffff)
      for (let x = -((Math.floor(cam) * 0.3) % 9); x < W; x += 9) rect(px, W, H, x, top - 5, 6, 3, 0xe8e0d0)
      const order = horses.slice().sort((a, b) => b.x - a.x)
      horses.forEach((h, i) => {
        const x = h.x - cam
        const y = top + i * lh + lh - 3
        const g = Math.floor(t * 0.4 + h.ph) % 2
        litSprite(px, W, H, x - 3, y - 4, ['....jj', '...jj.', 'bbbbbh', 'bbbbb.', g ? 'b..b..' : '.b..b.'], { b: 0x6a3a1a, h: 0x6a3a1a, j: h.c })
      })
      if (done && order[0]) {
        const i = horses.indexOf(order[0])
        if (done % 10 < 6) rect(px, W, H, 0, top + i * lh + 1, W, 1, 0xffe040)
      }
      order.forEach((h, k) => rect(px, W, H, 1 + k * 3, 1, 2, 2, h.c))
    },
  }
}

// --- cup stacking -----------------------------------------------------------------

const cupstack: Maker = (W, H, rng) => {
  const table = H - 8
  let t = 0
  let best = 99
  let run = 0
  const stacks = [W * 0.2, W * 0.5, W * 0.8]
  const sizes = [3, 3, 3]
  void rng

  return {
    step() {
      t++
      if (t > 160) {
        best = Math.min(best, run)
        t = 0
      }
      run = Math.min(t, 140) / 15
    },
    draw(px) {
      sky(px, W, H, 0x3a4a6a, 0x5a6a8a, table)
      rect(px, W, H, 0, table, W, H - table, 0x2a6ac0)
      rect(px, W, H, 0, table + 2, W, H - table - 2, 0x1e54a0)
      rect(px, W, H, 0, table, W, 1, 0x4a8ae0)
      const cup = (x: number, y: number, c: number) => {
        rect(px, W, H, x - 1, y - 3, 3, 3, c)
        dot(px, W, H, x - 1, y - 3, mix(c, 0xffffff, 0.4))
        dot(px, W, H, x, y, scale(c, 0.8))
      }
      // up-stack each pyramid in turn, then down-stack them
      stacks.forEach((sx, s) => {
        const n = sizes[s] as number
        const total = (n * (n + 1)) / 2
        const up = span(t, 10 + s * 18, 28 + s * 18)
        const down = span(t, 70 + s * 18, 88 + s * 18)
        const built = Math.round(total * up * (1 - down))
        const colours = [0xe03a3a, 0x3ad06a, 0xffd040]
        let k = 0
        for (let row = 0; row < n; row++)
          for (let i = 0; i < n - row; i++) {
            const placed = k < built
            k++
            const x = sx + (i - (n - row - 1) / 2) * 3
            const y = table - row * 3
            if (placed) cup(x, y, colours[s] as number)
          }
        const rest = total - built
        for (let r = 0; r < Math.ceil(rest / 2); r++) cup(sx, table - (r === 0 ? 0 : 0) - r * 0.6, scale(colours[s] as number, 0.85))
      })
      const handX = W * (0.2 + 0.3 * Math.floor(span(t, 10, 64) * 3) % 3)
      if (t < 140) {
        rect(px, W, H, handX - 3 + Math.sin(t * 0.8) * 2, table - 12, 2, 3, 0xffd0a0)
        rect(px, W, H, handX + 2 - Math.sin(t * 0.8) * 2, table - 12, 2, 3, 0xffd0a0)
      }
      text(px, W, H, 1, 1, run.toFixed(1), t > 140 ? 0x6aff6a : 0xffffff)
      if (best < 99) text(px, W, H, W - 1 - textWidth(best.toFixed(1)), 1, best.toFixed(1), 0xffe040)
    },
  }
}

// --- speed cube -------------------------------------------------------------------

const speedcube: Maker = (W, H, rng) => {
  type St = { p: [number, number, number]; n: [number, number, number]; c: number }
  const COL: Record<string, number> = { U: 0xffffff, D: 0xffd020, F: 0x2ac03a, B: 0x2a6ae0, R: 0xe02a2a, L: 0xff8a1a }
  let stickers: St[] = []
  let moves: [number, number, number][] = []
  let mi = 0
  let phase = 0
  let t = 0
  let clock = 0
  let hold = 0

  function solved() {
    stickers = []
    const faces: [[number, number, number], string][] = [
      [[0, -1, 0], 'U'],
      [[0, 1, 0], 'D'],
      [[0, 0, 1], 'F'],
      [[0, 0, -1], 'B'],
      [[1, 0, 0], 'R'],
      [[-1, 0, 0], 'L'],
    ]
    for (const [n, f] of faces)
      for (let a = -1; a <= 1; a++)
        for (let b = -1; b <= 1; b++) {
          const p: [number, number, number] = [0, 0, 0]
          const axis = n.findIndex(v => v !== 0)
          const others = [0, 1, 2].filter(i => i !== axis)
          p[axis] = n[axis] as number
          p[others[0] as number] = a
          p[others[1] as number] = b
          stickers.push({ p, n: [...n] as [number, number, number], c: COL[f] as number })
        }
  }
  // quarter turn of the layer at coordinate `layer` on `axis`, in direction `dir`
  const turn = (axis: number, layer: number, dir: number) => {
    const [i, j] = [0, 1, 2].filter(k => k !== axis) as [number, number]
    for (const s of stickers) {
      if (s.p[axis] !== layer) continue
      for (const v of [s.p, s.n]) {
        const a = v[i] as number
        const b = v[j] as number
        v[i] = -b * dir
        v[j] = a * dir
      }
    }
  }
  function scramble() {
    solved()
    moves = []
    let last = -1
    for (let k = 0; k < 18; k++) {
      let axis = irand(rng, 3)
      if (axis === last) axis = (axis + 1) % 3
      last = axis
      moves.push([axis, pick(rng, [-1, 1]), pick(rng, [-1, 1])])
    }
    mi = 0
    phase = 0
    clock = 0
  }
  scramble()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) scramble()
        return
      }
      if (phase === 1) clock++
      if (t % (phase === 0 ? 3 : 5)) return
      if (phase === 0) {
        const m = moves[mi++]
        if (m) turn(m[0], m[1], m[2])
        else {
          phase = 1
          mi = moves.length - 1
        }
      } else {
        const m = moves[mi--]
        if (m) turn(m[0], m[1], -m[2])
        else hold = 70
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a2a3a, 0x1a1a24)
      const s = Math.min(W, H) / 9
      const cx = W / 2
      const cy = H * 0.5
      // isometric: x to the lower right, z to the lower left, y up
      const iso = (x: number, y: number, z: number): [number, number] => [cx + (x - z) * s * 0.87, cy + (x + z) * s * 0.5 + y * s]
      const face = (st: St) => {
        const [x, y, z] = st.p
        const [nx, ny, nz] = st.n
        const corners: [number, number][] = []
        const axis = st.n.findIndex(v => v !== 0)
        const [i, j] = [0, 1, 2].filter(k => k !== axis) as [number, number]
        for (const [da, db] of [
          [-0.45, -0.45],
          [0.45, -0.45],
          [0.45, 0.45],
          [-0.45, 0.45],
        ] as [number, number][]) {
          const v = [x + nx * 0.5, y + ny * 0.5, z + nz * 0.5]
          v[i]! += da
          v[j]! += db
          corners.push(iso(v[0] as number, v[1] as number, v[2] as number))
        }
        const shade = ny < 0 ? 1 : nx > 0 ? 0.8 : 0.65
        poly(px, W, H, corners, scale(st.c, shade))
      }
      const visible = stickers.filter(st => st.n[1] === -1 || st.n[0] === 1 || st.n[2] === 1)
      for (const st of visible) face(st)
      text(px, W, H, W / 2 - textWidth((clock / 15).toFixed(1)) / 2, H - 8, (clock / 15).toFixed(1), phase === 1 ? 0xffffff : hold > 0 ? 0x6aff6a : 0x8a8a9a)
    },
  }
}

// --- keepy-uppy -------------------------------------------------------------------

const keepyuppy: Maker = (W, H, rng) => {
  const floor = H - 6
  const px0 = W / 2
  let ball = { x: px0, y: floor - 20, vy: 0, vx: 0 }
  let count = 0
  let best = 0
  let part = 0
  let drop = 0

  return {
    step() {
      if (drop > 0) {
        ball.vy += 0.15
        ball.y = Math.min(floor - 1, ball.y + ball.vy)
        ball.x += ball.vx
        if (--drop === 0) {
          ball = { x: px0, y: floor - 20, vy: 0, vx: 0 }
          count = 0
        }
        return
      }
      ball.vy += 0.12
      ball.y += ball.vy
      ball.x += ball.vx
      const contactY = [floor - 2, floor - 5, floor - 13][part] as number
      if (ball.vy > 0 && ball.y >= contactY) {
        if (rng() < 0.015) {
          drop = 50
          ball.vx = (rng() - 0.5) * 1.5
          return
        }
        count++
        best = Math.max(best, count)
        part = pick(rng, [0, 0, 1, 2])
        ball.vy = -2 - rng() * 0.5
        ball.vx = (px0 - ball.x) * 0.05 + (rng() - 0.5) * 0.2
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ab8f0, 0xd8f0ff, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0x4aa03a)
      rect(px, W, H, 0, floor, W, 1, 0x6ac05a)
      for (let x = 0; x < W; x += 2) dot(px, W, H, x, floor, 0x6ac04a)
      rect(px, W, H, 2, floor - 16, 1, 16, 0xffffff)
      rect(px, W, H, 2, floor - 16, 8, 1, 0xffffff)
      const kick = part === 0 && ball.y > floor - 6
      const knee = part === 1 && ball.y > floor - 9
      litSprite(px, W, H, px0 - 2, floor - 13, ['.ss.', '.ss.', 'jjjj', 'jjjj', '.jj.', '.bb.', '.b.b', knee ? '.bb.' : '.b.b', '.b.b', kick ? '.b.k' : '.b.b', 'k..k'], { s: 0x8a5a3a, j: 0xffd040, b: 0x2a2a6a, k: 0xffffff })
      lit(px, W, H, ball.x, ball.y, 1.5, 1.5, 0xf4f4f8)
      dot(px, W, H, ball.x, ball.y, 0x2a2a2a)
      text(px, W, H, 1, 1, String(count), 0x1a2a4a)
      const b = String(best)
      text(px, W, H, W - 1 - textWidth(b), 1, b, 0xe03a3a)
    },
  }
}

// --- parkour ----------------------------------------------------------------------

const parkour: Maker = (W, H, rng) => {
  type B = { x: number; w: number; h: number }
  let roofs: B[] = []
  let cam = 0
  let y = 0
  let vy = 0
  let air = false
  let roll = 0
  let t = 0
  const rx = W * 0.3
  let score = 0

  function reset() {
    roofs = [{ x: -5, w: 30, h: H * 0.4 }]
    cam = 0
    y = H - roofs[0]!.h
    vy = 0
    score = 0
  }
  reset()
  const gen = () => {
    while ((roofs[roofs.length - 1] as B).x + (roofs[roofs.length - 1] as B).w < cam + W + 20) {
      const last = roofs[roofs.length - 1] as B
      roofs.push({ x: last.x + last.w + 4 + rng() * 6, w: 10 + rng() * 16, h: clamp(last.h + (rng() - 0.5) * 12, H * 0.25, H * 0.6) })
    }
    roofs = roofs.filter(r => r.x + r.w > cam - 5)
  }

  return {
    step() {
      t++
      if (roll > 0) roll--
      cam += 0.9
      gen()
      const wx = cam + rx
      const under = roofs.find(r => wx >= r.x && wx <= r.x + r.w)
      const groundY = under ? H - under.h : H + 10
      if (!air) {
        const edge = under && wx + 2 > under.x + under.w
        const next = roofs.find(r => r.x > wx)
        if (edge || (next && next.x - wx < 3 && H - next.h < y - 1)) {
          air = true
          vy = -1.7
          score++
        }
        if (!under) air = true
      }
      if (air) {
        vy += 0.11
        y += vy
        if (vy > 0 && under && y >= groundY) {
          y = groundY
          air = false
          if (vy > 1.4) roll = 12
          vy = 0
        }
        if (y > H + 6) reset()
      } else y = groundY
    },
    draw(px) {
      sky(px, W, H, 0xff8a5a, 0xffd0a0)
      for (let x = 0; x < W; x++) {
        const h = H * 0.3 + Math.abs(Math.sin((x + cam * 0.3) * 0.13)) * H * 0.2
        rect(px, W, H, x, H - h, 1, h, 0xc87a6a)
      }
      for (const r of roofs) {
        const x = r.x - cam
        rect(px, W, H, x, H - r.h, r.w, r.h, 0x4a3a4a)
        rect(px, W, H, x, H - r.h, 1, r.h, 0x5e4e60)
        rect(px, W, H, x + r.w - 1, H - r.h, 1, r.h, 0x342834)
        rect(px, W, H, x, H - r.h, r.w, 1, 0x7a6a7a)
        for (let wy = H - r.h + 3; wy < H; wy += 4) for (let wx = x + 2; wx < x + r.w - 1; wx += 3) dot(px, W, H, wx, wy, 0xffd070)
      }
      const run = Math.floor(t * 0.4) % 2
      const rows = roll > 0 ? ['.s.', 'jjj', 'pp.'] : air ? ['.s..', 'jjjj', '.j..', 'p..p'] : ['.s.', 'jjj', '.j.', run ? 'p.p' : '.p.']
      litSprite(px, W, H, rx - 1, y - rows.length, rows, { s: 0xffd0a0, j: 0x2a2a2a, p: 0x3a6ae0 })
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

export const SPORTS = {
  trickshots,
  penalty,
  bowling,
  holeinone,
  slalom,
  halfpipe,
  pitstop,
  tabletennis,
  curling,
  archery,
  volleyball,
  skijump,
  horserace,
  cupstack,
  speedcube,
  keepyuppy,
  parkour,
}

