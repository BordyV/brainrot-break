import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, collide, irand, line, ring, shiny, shuffle, sparks, textWidth, wallCircle } from '../kit'
import type { Ball, Spark } from '../kit'

// Versus & battles: who wins? Rules everyone gets, endings nobody can call.

type Agent = { x: number; y: number; vx: number; vy: number; k: number }

/** Bars across the top, one per side, as wide as its share. */
function shares(px: Uint32Array, W: number, H: number, counts: number[], cols: number[], y = 0, h = 2) {
  const total = counts.reduce((s, v) => s + v, 0) || 1
  let x = 0
  counts.forEach((v, k) => {
    const w = k === counts.length - 1 ? W - x : Math.round((v / total) * W)
    rect(px, W, H, x, y, w, h, cols[k] as number)
    x += w
  })
}

// --- rock paper scissors ----------------------------------------------------------

const RPS_SPRITES = [
  ['.xx.', 'xxxx', 'xxxx', '.xx.'],
  ['xxxx', 'x..x', 'xxxx', 'xxxx'],
  ['x..x', '.xx.', '.xx.', 'x..x'],
]

function rpsMaker(colours: number[], sprites: string[][], bg: [number, number], fx: boolean): Maker {
  return (W, H, rng) => {
    let as: Agent[] = []
    let bits: Spark[] = []
    let hold = 0
    const top = 4
    function reset() {
      const n = W >= 24 ? 14 : 6
      as = []
      for (let k = 0; k < 3; k++) {
        const cx = [W * 0.25, W * 0.75, W * 0.5][k] as number
        const cy = [H * 0.3, H * 0.3, H * 0.75][k] as number
        for (let i = 0; i < n; i++) as.push({ x: cx + (rng() - 0.5) * W * 0.3, y: cy + (rng() - 0.5) * H * 0.2, vx: 0, vy: 0, k })
      }
    }
    reset()
    return {
      step() {
        bits = sparks(bits, 0)
        if (hold > 0) {
          if (--hold === 0) reset()
          return
        }
        for (const a of as) {
          const prey = (a.k + 2) % 3
          const hunter = (a.k + 1) % 3
          let tx = 0
          let ty = 0
          let pd = Infinity
          let hd = Infinity
          let hx = 0
          let hy = 0
          for (const o of as) {
            const d = Math.hypot(o.x - a.x, o.y - a.y)
            if (o.k === prey && d < pd) {
              pd = d
              tx = o.x
              ty = o.y
            }
            if (o.k === hunter && d < hd) {
              hd = d
              hx = o.x
              hy = o.y
            }
          }
          let ax = 0
          let ay = 0
          if (pd < Infinity) {
            ax += (tx - a.x) / (pd || 1)
            ay += (ty - a.y) / (pd || 1)
          }
          if (hd < 10) {
            ax -= ((hx - a.x) / (hd || 1)) * 1.2
            ay -= ((hy - a.y) / (hd || 1)) * 1.2
          }
          // keep apart from your own kind, so a team is a crowd and not a blob
          for (const o of as)
            if (o !== a && o.k === a.k) {
              const d = Math.hypot(o.x - a.x, o.y - a.y)
              if (d < 5 && d > 0) {
                ax -= ((o.x - a.x) / d) * (5 - d) * 0.5
                ay -= ((o.y - a.y) / d) * (5 - d) * 0.5
              }
            }
          a.vx = a.vx * 0.85 + ax * 0.06 + (rng() - 0.5) * 0.08
          a.vy = a.vy * 0.85 + ay * 0.06 + (rng() - 0.5) * 0.08
          a.x = clamp(a.x + a.vx, 1, W - 4)
          a.y = clamp(a.y + a.vy, top + 1, H - 5)
        }
        for (const a of as)
          for (const o of as)
            if (o.k === (a.k + 2) % 3 && Math.abs(o.x - a.x) < 3 && Math.abs(o.y - a.y) < 3) {
              o.k = a.k
              if (fx) burst(bits, rng, o.x + 2, o.y + 2, colours[a.k] as number, 5, 0.5)
            }
        if (new Set(as.map(a => a.k)).size === 1) hold = 70
      },
      draw(px) {
        sky(px, W, H, bg[0], bg[1])
        for (const a of as) sprite(px, W, H, a.x, a.y, sprites[a.k] as string[], { x: colours[a.k] as number })
        for (const b of bits) dot(px, W, H, b.x, b.y, b.c)
        shares(px, W, H, [0, 1, 2].map(k => as.filter(a => a.k === k).length), colours)
      },
    }
  }
}

const rps = rpsMaker([0x9a9aa8, 0xf4f4f0, 0xff4a5a], RPS_SPRITES, [0x2a3a2a, 0x1a2a1a], false)

// --- flag ball battle royale ------------------------------------------------------

const FLAGS = [
  [0x0055a4, 0xffffff, 0xef4135],
  [0x000000, 0xdd0000, 0xffce00],
  [0x009246, 0xffffff, 0xce2b37],
  [0xaa151b, 0xf1bf00, 0xaa151b],
  [0xff9933, 0xffffff, 0x138808],
  [0x003893, 0xffffff, 0x003893],
  [0x21468b, 0xffffff, 0xae1c28],
  [0x006b3f, 0xfcd116, 0xce1126],
  [0x0039a6, 0xffffff, 0xd52b1e],
  [0xffffff, 0xdc143c, 0xffffff],
]

const flagballs: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.52
  const R0 = Math.max(6, Math.min(W / 2 - 1, H / 2 - 5))
  let R = R0
  let balls: (Ball & { f: number; out: number })[] = []
  let hold = 0
  let t = 0

  function reset() {
    R = R0
    t = 0
    const n = W >= 24 ? 8 : 4
    balls = shuffle(rng, FLAGS.map((_, i) => i))
      .slice(0, n)
      .map((f, i) => {
        const a = (i / n) * Math.PI * 2
        return { x: cx + Math.cos(a) * R * 0.5, y: cy + Math.sin(a) * R * 0.5, vx: Math.cos(a + 1.6) * 0.8, vy: Math.sin(a + 1.6) * 0.8, r: 2.2, c: 0, f, out: 0 }
      })
  }
  reset()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (t > 60) R = Math.max(4, R - 0.025)
      for (const b of balls) {
        if (b.out) {
          b.out++
          b.vy += 0.1
          b.x += b.vx
          b.y += b.vy
          continue
        }
        b.x += b.vx
        b.y += b.vy
        b.vx += (rng() - 0.5) * 0.08
        b.vy += (rng() - 0.5) * 0.08
        const s = Math.hypot(b.vx, b.vy)
        if (s > 1.3) {
          b.vx *= 1.3 / s
          b.vy *= 1.3 / s
        }
      }
      const live = balls.filter(b => !b.out)
      for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) collide(live[i] as Ball, live[j] as Ball, 1.15)
      for (const b of live) if (Math.hypot(b.x - cx, b.y - cy) > R + b.r * 0.5) b.out = 1
      for (const b of live) if (!b.out) wallCircle(b, cx, cy, R + 3, 1)
      if (balls.filter(b => !b.out).length <= 1) hold = 80
    },
    draw(px) {
      sky(px, W, H, 0x0e1424, 0x1e2440)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const d = Math.hypot(x - cx, y - cy)
          if (d < R) px[y * W + x] = d > R - 1 ? 0xffe04a : 0x2a3456
          else if (d < R + 1.2) px[y * W + x] = 0xa08a2a
        }
      for (const b of balls) {
        if (b.out > 40) continue
        const f = FLAGS[b.f] as number[]
        for (let dy = -2; dy <= 2; dy++)
          for (let dx = -2; dx <= 2; dx++) {
            if (dx * dx + dy * dy > 5.2) continue
            dot(px, W, H, b.x + dx, b.y + dy, f[clamp(dx + 2, 0, 4) <= 1 ? 0 : dx + 2 >= 3 ? 2 : 1] as number)
          }
        if (b.out) ring(px, W, H, b.x, b.y, 3, 0xff3a3a)
      }
      const left = balls.filter(b => !b.out)
      if (hold > 0 && left[0] && hold % 10 < 5) ring(px, W, H, left[0].x, left[0].y, 4, 0xffe04a)
      text(px, W, H, 1, 1, String(left.length), 0xffffff)
    },
  }
}

// --- pong wars --------------------------------------------------------------------

const pongwars: Maker = (W, H, rng) => {
  const c = 2
  const top = 5
  const GW = Math.max(4, Math.floor(W / c))
  const GH = Math.max(4, Math.floor((H - top) / c))
  const grid = new Uint8Array(GW * GH)
  const DAY = 0xd9e8e3
  const NIGHT = 0x114c5a
  const balls = [
    { x: GW * 0.25, y: GH * 0.5, vx: 0.45, vy: -0.4, side: 0 },
    { x: GW * 0.75, y: GH * 0.5, vx: -0.45, vy: 0.4, side: 1 },
  ]
  for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) grid[y * GW + x] = x < GW / 2 ? 0 : 1

  return {
    step() {
      for (let s = 0; s < 2; s++)
        for (const b of balls) {
          // a ball bounces off cells of the other colour, and paints them its own
          for (const [ax, ay] of [
            [1, 0],
            [0, 1],
          ] as [number, number][]) {
            const nx = b.x + (ax ? b.vx : 0) / 2 + (ax ? Math.sign(b.vx) * 0.5 : 0)
            const ny = b.y + (ay ? b.vy : 0) / 2 + (ay ? Math.sign(b.vy) * 0.5 : 0)
            const gx = Math.floor(nx)
            const gy = Math.floor(ny)
            if (gx < 0 || gx >= GW) {
              if (ax) b.vx = -b.vx
              continue
            }
            if (gy < 0 || gy >= GH) {
              if (ay) b.vy = -b.vy
              continue
            }
            if (grid[gy * GW + gx] !== b.side) {
              grid[gy * GW + gx] = b.side
              if (ax) b.vx = -b.vx
              else b.vy = -b.vy
            }
          }
          b.x = clamp(b.x + b.vx / 2, 0.5, GW - 0.5)
          b.y = clamp(b.y + b.vy / 2, 0.5, GH - 0.5)
          b.vx += (rng() - 0.5) * 0.01
          b.vy += (rng() - 0.5) * 0.01
          const sp = Math.hypot(b.vx, b.vy)
          b.vx *= 0.9 / sp
          b.vy *= 0.9 / sp
        }
    },
    draw(px) {
      px.fill(0x0a2028)
      for (let k = 0; k < GW * GH; k++) rect(px, W, H, (k % GW) * c, top + Math.floor(k / GW) * c, c, c, grid[k] ? NIGHT : DAY)
      for (const b of balls) disc(px, W, H, b.x * c, top + b.y * c, 1.2, b.side ? DAY : NIGHT)
      const day = grid.filter(v => v === 0).length
      text(px, W, H, 1, 0, String(day), DAY)
      const n = String(GW * GH - day)
      text(px, W, H, W - 1 - textWidth(n), 0, n, 0x3aa0b8)
    },
  }
}

// --- ant colony war ---------------------------------------------------------------

const antwar: Maker = (W, H, rng) => {
  const COLS = [0xff5a3a, 0x2a2a2a]
  const nests = [
    { x: W * 0.25, y: H * 0.2, food: 0 },
    { x: W * 0.75, y: H * 0.8, food: 0 },
  ]
  type Ant = { x: number; y: number; a: number; side: number; carry: boolean; hp: number }
  let ants: Ant[] = []
  let food: { x: number; y: number; n: number }[] = []
  let bits: Spark[] = []
  let t = 0

  function reset() {
    ants = []
    for (let s = 0; s < 2; s++) for (let i = 0; i < 14; i++) ants.push({ x: nests[s]!.x, y: nests[s]!.y, a: rng() * 6.28, side: s, carry: false, hp: 3 })
    food = Array.from({ length: 4 }, () => ({ x: 4 + rng() * (W - 8), y: H * 0.35 + rng() * H * 0.3, n: 12 }))
    nests[0]!.food = 0
    nests[1]!.food = 0
  }
  reset()

  return {
    step() {
      t++
      bits = sparks(bits, 0)
      for (const a of ants) {
        const home = nests[a.side] as { x: number; y: number; food: number }
        let tx: number | undefined
        let ty: number | undefined
        if (a.carry) {
          tx = home.x
          ty = home.y
        } else {
          let bd = 14
          for (const f of food)
            if (f.n > 0) {
              const d = Math.hypot(f.x - a.x, f.y - a.y)
              if (d < bd) {
                bd = d
                tx = f.x
                ty = f.y
              }
            }
          for (const o of ants)
            if (o.side !== a.side) {
              const d = Math.hypot(o.x - a.x, o.y - a.y)
              if (d < 6 && d < bd) {
                bd = d
                tx = o.x
                ty = o.y
              }
            }
        }
        if (tx !== undefined && ty !== undefined) {
          const want = Math.atan2(ty - a.y, tx - a.x)
          a.a += clamp(Math.atan2(Math.sin(want - a.a), Math.cos(want - a.a)), -0.3, 0.3)
        }
        a.a += (rng() - 0.5) * 0.5
        a.x += Math.cos(a.a) * 0.4
        a.y += Math.sin(a.a) * 0.4
        if (a.x < 1 || a.x > W - 2) a.a = Math.PI - a.a
        if (a.y < 1 || a.y > H - 2) a.a = -a.a
        a.x = clamp(a.x, 1, W - 2)
        a.y = clamp(a.y, 1, H - 2)
        if (!a.carry)
          for (const f of food)
            if (f.n > 0 && Math.hypot(f.x - a.x, f.y - a.y) < 2) {
              f.n--
              a.carry = true
            }
        if (a.carry && Math.hypot(home.x - a.x, home.y - a.y) < 2) {
          a.carry = false
          home.food++
        }
      }
      for (const a of ants)
        for (const o of ants)
          if (o.side !== a.side && a.hp > 0 && o.hp > 0 && Math.abs(o.x - a.x) < 1.2 && Math.abs(o.y - a.y) < 1.2 && rng() < 0.1) {
            o.hp--
            if (o.hp === 0) burst(bits, rng, o.x, o.y, COLS[o.side] as number, 3, 0.4)
          }
      ants = ants.filter(a => a.hp > 0)
      for (const [s, n] of nests.entries())
        if (n.food >= 3) {
          n.food -= 3
          ants.push({ x: n.x, y: n.y, a: rng() * 6.28, side: s, carry: false, hp: 3 })
        }
      if (food.every(f => f.n <= 0) || t % 400 === 0) food.push({ x: 4 + rng() * (W - 8), y: 6 + rng() * (H - 12), n: 12 })
      food = food.filter(f => f.n > 0)
      const counts = [0, 1].map(s => ants.filter(a => a.side === s).length)
      if (counts.some(c => c === 0) || ants.length > 90) {
        reset()
        t = 0
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 7 + y * 13) % 17 === 0 ? 0xa0784a : (x * 3 + y * 5) % 11 === 0 ? 0xc49a68 : 0xb88a58
      for (const n of nests) {
        disc(px, W, H, n.x, n.y, 3, 0x7a5430)
        disc(px, W, H, n.x, n.y, 1.5, 0x2a1a0a)
      }
      for (const f of food) disc(px, W, H, f.x, f.y, 1 + f.n / 8, 0x6ad04a)
      for (const a of ants) {
        dot(px, W, H, a.x, a.y, COLS[a.side] as number)
        dot(px, W, H, a.x - Math.cos(a.a), a.y - Math.sin(a.a), scale(COLS[a.side] as number, 0.7))
        if (a.carry) dot(px, W, H, a.x + Math.cos(a.a), a.y + Math.sin(a.a), 0x8aff6a)
      }
      for (const b of bits) dot(px, W, H, b.x, b.y, 0xffffff)
      shares(px, W, H, [0, 1].map(s => ants.filter(a => a.side === s).length), COLS)
    },
  }
}

// --- red vs blue armies -----------------------------------------------------------

const armies: Maker = (W, H, rng) => {
  type Sol = { x: number; y: number; side: number; hp: number; cd: number; archer: boolean }
  let army: Sol[] = []
  let arrows: { x: number; y: number; vx: number; vy: number; side: number; l: number }[] = []
  let marks: [number, number, number][] = []
  let hold = 0
  let wins = [0, 0]
  const COLS = [0xe03a3a, 0x3a6ae0]

  function reset() {
    army = []
    marks = []
    arrows = []
    const n = W >= 24 ? 18 : 8
    for (let s = 0; s < 2; s++)
      for (let i = 0; i < n; i++) {
        const archer = i % 4 === 0
        army.push({ x: 3 + (i % 9) * ((W - 6) / 9) + rng(), y: s === 0 ? 6 + Math.floor(i / 9) * 3 + (archer ? -2 : 0) : H - 8 - Math.floor(i / 9) * 3 + (archer ? 2 : 0), side: s, hp: 3, cd: 0, archer })
      }
  }
  reset()

  return {
    step() {
      for (const a of arrows) {
        a.x += a.vx
        a.y += a.vy
        a.l--
        const hit = army.find(s => s.side !== a.side && s.hp > 0 && Math.abs(s.x - a.x) < 1.2 && Math.abs(s.y - a.y) < 1.2)
        if (hit) {
          hit.hp--
          a.l = 0
        }
      }
      arrows = arrows.filter(a => a.l > 0)
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (const s of army) {
        if (s.hp <= 0) continue
        let best: Sol | undefined
        let bd = Infinity
        for (const o of army)
          if (o.side !== s.side && o.hp > 0) {
            const d = Math.hypot(o.x - s.x, o.y - s.y)
            if (d < bd) {
              bd = d
              best = o
            }
          }
        if (!best) continue
        if (s.cd > 0) s.cd--
        const range = s.archer ? 14 : 1.6
        if (bd > range) {
          s.x += ((best.x - s.x) / bd) * 0.3 + (rng() - 0.5) * 0.1
          s.y += ((best.y - s.y) / bd) * 0.3
        } else if (s.cd === 0) {
          if (s.archer) arrows.push({ x: s.x, y: s.y, vx: ((best.x - s.x) / bd) * 1.2, vy: ((best.y - s.y) / bd) * 1.2, side: s.side, l: 16 })
          else if (rng() < 0.5) best.hp--
          s.cd = s.archer ? 20 : 6
        }
      }
      for (const s of army) if (s.hp <= 0 && s.hp > -10) {
        marks.push([s.x, s.y, s.side])
        s.hp = -10
      }
      army = army.filter(s => s.hp > -10)
      const alive = [0, 1].map(k => army.filter(s => s.side === k).length)
      if (alive.some(n => n === 0)) {
        wins[alive[0]! > 0 ? 0 : 1]!++
        hold = 60
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 3) % 7 === 0 ? 0x5a8a3a : 0x6a9a44
      for (const [x, y, s] of marks) dot(px, W, H, x, y, scale(COLS[s] as number, 0.45))
      for (const a of arrows) line(px, W, H, a.x, a.y, a.x - a.vx, a.y - a.vy, 0xe0d0a0)
      for (const s of army) {
        const c = COLS[s.side] as number
        dot(px, W, H, s.x, s.y - 1, 0xffd0a0)
        dot(px, W, H, s.x, s.y, c)
        dot(px, W, H, s.x + (s.side ? -1 : 1) * 0, s.y + 1, scale(c, 0.6))
        if (s.archer) dot(px, W, H, s.x + 1, s.y, 0x8a5a2a)
        else dot(px, W, H, s.x + 1, s.y - 1, 0xd0d8e0)
      }
      shares(px, W, H, [0, 1].map(k => army.filter(s => s.side === k).length), COLS)
      text(px, W, H, 1, 3, String(wins[0]), COLS[0] as number)
      text(px, W, H, W - 4, 3, String(wins[1] % 10), COLS[1] as number)
    },
  }
}

// --- territory automaton ----------------------------------------------------------

const automata: Maker = (W, H, rng) => {
  const N = 3
  let a = new Uint8Array(W * H)
  let b = new Uint8Array(W * H)
  let pal: number[] = []
  let t = 0

  function reset() {
    for (let i = 0; i < W * H; i++) a[i] = irand(rng, N)
    const h = rng()
    pal = Array.from({ length: N }, (_, k) => hsv(h + k / N, 0.65, 0.95))
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (t % 2) return
      // cyclic cellular automaton (the 3-colour, threshold-3 rule that makes
      // spirals): a cell is eaten by the next colour when 3 neighbours have it
      let changed = 0
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const v = a[y * W + x] as number
          const nx = (v + 1) % N
          let n = 0
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) {
              if (!dx && !dy) continue
              if (a[((y + dy + H) % H) * W + ((x + dx + W) % W)] === nx) n++
            }
          b[y * W + x] = n >= 3 ? nx : v
          if (n >= 3) changed++
        }
      ;[a, b] = [b, a]
      if (t > 900 || changed === 0) reset()
    },
    draw(px) {
      for (let i = 0; i < W * H; i++) px[i] = pal[a[i] as number] as number
    },
  }
}

// --- snake vs snake ---------------------------------------------------------------

const snakevs: Maker = (W, H, rng) => {
  const cs = 2
  const top = 6
  const GW = Math.max(6, Math.floor(W / cs))
  const GH = Math.max(6, Math.floor((H - top) / cs))
  const COLS = [0x4ae05a, 0xe0a03a]
  type S = { body: [number, number][]; alive: boolean; score: number }
  let snakes: S[] = []
  let apples: [number, number][] = []
  let t = 0
  let hold = 0
  let wins = [0, 0]

  const occ = () => {
    const s = new Set<number>()
    for (const sn of snakes) if (sn.alive) for (const [x, y] of sn.body) s.add(y * GW + x)
    return s
  }
  function reset() {
    snakes = [
      { body: [[3, 3], [2, 3], [1, 3]], alive: true, score: 0 },
      { body: [[GW - 4, GH - 4], [GW - 3, GH - 4], [GW - 2, GH - 4]], alive: true, score: 0 },
    ]
    apples = []
    for (let i = 0; i < 3; i++) apples.push([irand(rng, GW), irand(rng, GH)])
  }
  reset()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (t % 3) return
      const o = occ()
      for (const sn of snakes) {
        if (!sn.alive) continue
        const [hx, hy] = sn.body[0] as [number, number]
        // greedy towards the nearest apple, through cells free and with room
        let best: [number, number] | undefined
        let bs = -Infinity
        for (const [dx, dy] of DIRS) {
          const nx = hx + dx
          const ny = hy + dy
          if (nx < 0 || ny < 0 || nx >= GW || ny >= GH || o.has(ny * GW + nx)) continue
          let room = 0
          const seen = new Set([ny * GW + nx])
          const q = [ny * GW + nx]
          for (let i = 0; i < q.length && room < 40; i++) {
            room++
            const k = q[i] as number
            for (const [ex, ey] of DIRS) {
              const mx = (k % GW) + ex
              const my = Math.floor(k / GW) + ey
              const mk = my * GW + mx
              if (mx >= 0 && my >= 0 && mx < GW && my < GH && !o.has(mk) && !seen.has(mk)) {
                seen.add(mk)
                q.push(mk)
              }
            }
          }
          const d = Math.min(...apples.map(([ax, ay]) => Math.abs(ax - nx) + Math.abs(ay - ny)))
          const s = (room < sn.body.length ? -100 : 0) - d + rng() * 0.5
          if (s > bs) {
            bs = s
            best = [nx, ny]
          }
        }
        if (!best) {
          sn.alive = false
          continue
        }
        sn.body.unshift(best)
        const ai = apples.findIndex(([ax, ay]) => ax === best![0] && ay === best![1])
        if (ai >= 0) {
          sn.score++
          apples[ai] = [irand(rng, GW), irand(rng, GH)]
        } else sn.body.pop()
      }
      const [a, b] = snakes as [S, S]
      if (a.alive && b.alive && a.body[0]![0] === b.body[0]![0] && a.body[0]![1] === b.body[0]![1]) {
        a.alive = false
        b.alive = false
      }
      for (const sn of snakes) {
        if (!sn.alive) continue
        const [hx, hy] = sn.body[0] as [number, number]
        if (snakes.some(o2 => o2.alive && o2.body.slice(o2 === sn ? 1 : 0).some(([x, y]) => x === hx && y === hy))) sn.alive = false
      }
      if (snakes.some(s => !s.alive)) {
        snakes.forEach((s, i) => {
          if (s.alive) wins[i]!++
        })
        hold = 50
      }
    },
    draw(px) {
      px.fill(0x101a14)
      for (let y = 0; y < GH; y++) for (let x = 0; x < GW; x++) if ((x + y) % 2) rect(px, W, H, x * cs, top + y * cs, cs, cs, 0x14221a)
      for (const [ax, ay] of apples) {
        rect(px, W, H, ax * cs, top + ay * cs, cs, cs, 0xff3a3a)
        dot(px, W, H, ax * cs, top + ay * cs, 0xffa0a0)
      }
      snakes.forEach((sn, i) =>
        sn.body.forEach(([x, y], k) => {
          const c = !sn.alive && hold % 6 < 3 ? 0xffffff : k === 0 ? mix(COLS[i] as number, 0xffffff, 0.4) : (COLS[i] as number)
          rect(px, W, H, x * cs, top + y * cs, cs, cs, k % 2 ? scale(c, 0.85) : c)
        }),
      )
      text(px, W, H, 1, 0, String(wins[0]), COLS[0] as number)
      const w1 = String(wins[1])
      text(px, W, H, W - 1 - textWidth(w1), 0, w1, COLS[1] as number)
    },
  }
}

// --- stick-figure duel ------------------------------------------------------------

const stickduel: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.68)
  const edgeL = Math.round(W * 0.12)
  const edgeR = W - 1 - Math.round(W * 0.12)
  type F = { x: number; vx: number; kb: number; dir: number; act: number; t: number; y: number; vy: number; down: boolean }
  let f: F[] = []
  let sparksL: Spark[] = []
  let wins = [0, 0]
  let hold = 0
  const COLS = [0xff5a5a, 0x5ab0ff]

  function reset() {
    f = [
      { x: W * 0.3, vx: 0, kb: 0, dir: 1, act: 0, t: 0, y: 0, vy: 0, down: false },
      { x: W * 0.7, vx: 0, kb: 0, dir: -1, act: 0, t: 0, y: 0, vy: 0, down: false },
    ]
  }
  reset()

  return {
    step() {
      sparksL = sparks(sparksL, 0.08)
      if (hold > 0) {
        for (const p of f) if (p.down) {
          p.vy += 0.15
          p.y += p.vy
          p.x += p.vx
        }
        if (--hold === 0) reset()
        return
      }
      const [a, b] = f as [F, F]
      for (const [me, op] of [
        [a, b],
        [b, a],
      ] as [F, F][]) {
        me.t++
        const d = Math.abs(op.x - me.x)
        if (me.act === 0) {
          if (d > 7) me.vx = me.dir * 0.35
          else if (d < 5) me.vx = -me.dir * 0.25
          else me.vx = 0
          if (d < 9 && rng() < 0.05) {
            me.act = 1
            me.t = 0
          } else if (op.act === 1 && op.t < 4 && rng() < 0.35) {
            me.act = 2
            me.t = 0
          }
        } else if (me.act === 1) {
          me.vx = me.dir * (me.t < 4 ? 0.8 : -0.3)
          if (me.t === 4 && d < 8) {
            if (op.act === 2) {
              burst(sparksL, rng, (me.x + op.x) / 2, floor - 7, 0xffffa0, 6, 0.8)
              me.vx = -me.dir * 1.2
            } else {
              op.kb = me.dir * 1.6
              op.act = 3
              op.t = 0
              burst(sparksL, rng, op.x, floor - 6, 0xff4040, 5, 0.6)
            }
          }
          if (me.t > 10) me.act = 0
        } else if (me.act === 2) {
          me.vx = 0
          if (me.t > 8) me.act = 0
        } else if (me.act === 3) {
          me.vx = 0
          if (me.t > 14) me.act = 0
        }
        me.x += me.vx + me.kb
        me.vx *= 0.9
        me.kb *= 0.88
        if (me.x < edgeL || me.x > edgeR) {
          me.down = true
          me.vx = me.x < edgeL ? -0.5 : 0.5
          wins[f.indexOf(op)]!++
          hold = 60
        }
      }
      if (Math.abs(a.x - b.x) < 2) {
        a.x -= 1
        b.x += 1
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a1a3a, 0xff8a4a, floor)
      disc(px, W, H, W * 0.7, floor - 10, 5, 0xffd08a)
      rect(px, W, H, 0, floor, W, H - floor, 0x1a1020)
      rect(px, W, H, edgeL, floor, edgeR - edgeL + 1, 2, 0x5a4a6a)
      f.forEach((p, i) => {
        const c = COLS[i] as number
        const x = p.x
        const y = floor - 1 + p.y
        disc(px, W, H, x, y - 9, 1.2, c)
        line(px, W, H, x, y - 8, x, y - 4, c)
        line(px, W, H, x, y - 4, x - 2, y, c)
        line(px, W, H, x, y - 4, x + 2, y, c)
        const reach = p.act === 1 && p.t < 6 ? 4 : 2
        const hy = p.act === 2 ? y - 9 : y - 6
        line(px, W, H, x, y - 7, x + p.dir * 2, hy, c)
        line(px, W, H, x + p.dir * 2, hy, x + p.dir * (2 + reach + 2), p.act === 2 ? y - 11 : hy - 1, 0xe0e6ee)
      })
      for (const s of sparksL) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, 1, 1, String(wins[0]), COLS[0] as number)
      const w1 = String(wins[1])
      text(px, W, H, W - 1 - textWidth(w1), 1, w1, COLS[1] as number)
    },
  }
}

// --- big fish, little fish --------------------------------------------------------

const bigfish: Maker = (W, H, rng) => {
  type Fish = { x: number; y: number; vx: number; s: number; c: number; hero: boolean; wob: number }
  let fish: Fish[] = []
  let hero: Fish
  let bubbles: [number, number][] = []
  let hold = 0
  let eaten = 0

  const spawn = (): Fish => {
    const left = rng() < 0.5
    const s = 0.5 + rng() * Math.min(5, hero.s * 1.7)
    return { x: left ? -6 : W + 6, y: 6 + rng() * (H - 14), vx: (left ? 1 : -1) * (0.15 + rng() * 0.3), s, c: hsv(rng(), 0.6, 0.95), hero: false, wob: rng() * 6 }
  }
  function reset() {
    hero = { x: W / 2, y: H / 2, vx: 0.3, s: 1.2, c: 0xffa020, hero: true, wob: 0 }
    fish = []
    for (let i = 0; i < 6; i++) {
      const f = spawn()
      f.x = rng() * W
      fish.push(f)
    }
    eaten = 0
  }
  reset()

  return {
    step() {
      for (const b of bubbles) b[1] -= 0.3
      bubbles = bubbles.filter(b => b[1] > 0)
      if (rng() < 0.05) bubbles.push([rng() * W, H])
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (const f of fish) {
        f.x += f.vx
        f.wob += 0.2
      }
      fish = fish.filter(f => f.x > -10 && f.x < W + 10)
      while (fish.length < 7) fish.push(spawn())
      // the hero chases smaller fish and flees bigger ones
      let tx = W / 2
      let ty = H / 2
      let bd = Infinity
      for (const f of fish) {
        const d = Math.hypot(f.x - hero.x, f.y - hero.y)
        if (f.s > hero.s * 1.1 && d < 10) {
          tx = hero.x - (f.x - hero.x) * 2
          ty = hero.y - (f.y - hero.y) * 2
          bd = -1
          break
        }
        if (f.s < hero.s * 0.9 && d < bd) {
          bd = d
          tx = f.x
          ty = f.y
        }
      }
      const d = Math.hypot(tx - hero.x, ty - hero.y) || 1
      hero.vx = ((tx - hero.x) / d) * 0.55
      hero.x = clamp(hero.x + hero.vx, 2, W - 3)
      hero.y = clamp(hero.y + ((ty - hero.y) / d) * 0.55, 4, H - 5)
      hero.wob += 0.3
      fish = fish.filter(f => {
        const dd = Math.hypot(f.x - hero.x, f.y - hero.y)
        if (dd < hero.s * 1.3 && f.s < hero.s * 0.9) {
          hero.s = Math.min(W * 0.25, hero.s + f.s * 0.12)
          eaten++
          return true && false
        }
        if (dd < f.s * 1.3 && f.s > hero.s * 1.1) hold = 60
        return true
      })
      if (hero.s >= W * 0.24) hold = 70
    },
    draw(px) {
      sky(px, W, H, 0x1a6ab0, 0x0a1a4a)
      for (let x = 0; x < W; x += 3) dot(px, W, H, x, H - 2 - ((x * 7) % 3), 0xd8c08a)
      for (const [x, y] of bubbles) dot(px, W, H, x, y, 0x8ac8ff)
      const drawFish = (f: Fish) => {
        const dir = f.vx >= 0 ? 1 : -1
        const s = f.s
        for (let k = -s * 1.4; k <= s * 1.4; k += 0.5) {
          const h = s * 0.8 * Math.sqrt(Math.max(0, 1 - (k / (s * 1.4)) ** 2))
          line(px, W, H, f.x + k * dir, f.y - h, f.x + k * dir, f.y + h, f.c)
        }
        const tx = f.x - dir * s * 1.4
        line(px, W, H, tx, f.y, tx - dir * s * 0.8, f.y - s * 0.7 + Math.sin(f.wob) * 0.5, scale(f.c, 0.8))
        line(px, W, H, tx, f.y, tx - dir * s * 0.8, f.y + s * 0.7 + Math.sin(f.wob) * 0.5, scale(f.c, 0.8))
        dot(px, W, H, f.x + dir * s * 0.8, f.y - s * 0.2, 0x000000)
      }
      for (const f of fish) drawFish(f)
      if (!(hold > 0 && hero.s < W * 0.24 && hold % 6 < 3)) drawFish(hero)
      if (hold > 0 && hero.s >= W * 0.24) ring(px, W, H, hero.x, hero.y, hero.s * 2, 0xffe040)
      text(px, W, H, 1, 1, String(eaten), 0xffffff)
    },
  }
}

// --- zombie outbreak --------------------------------------------------------------

const zombies: Maker = (W, H, rng) => {
  let as: Agent[] = []
  let hold = 0
  let t = 0

  function reset() {
    as = Array.from({ length: W >= 24 ? 60 : 20 }, () => ({ x: 1 + rng() * (W - 2), y: 6 + rng() * (H - 8), vx: 0, vy: 0, k: 0 }))
    ;(as[0] as Agent).k = 1
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (const a of as) {
        let nx = 0
        let ny = 0
        let nd = Infinity
        for (const o of as) {
          if (o.k === a.k) continue
          const d = Math.hypot(o.x - a.x, o.y - a.y)
          if (d < nd) {
            nd = d
            nx = o.x
            ny = o.y
          }
        }
        const sp = a.k ? 0.22 : 0.3
        if (nd < (a.k ? 20 : 8)) {
          const dir = a.k ? 1 : -1
          a.vx = a.vx * 0.8 + ((nx - a.x) / nd) * sp * dir * 0.4
          a.vy = a.vy * 0.8 + ((ny - a.y) / nd) * sp * dir * 0.4
        } else {
          a.vx = a.vx * 0.9 + (rng() - 0.5) * 0.1
          a.vy = a.vy * 0.9 + (rng() - 0.5) * 0.1
        }
        a.x = clamp(a.x + a.vx, 1, W - 2)
        a.y = clamp(a.y + a.vy, 6, H - 3)
      }
      for (const z of as) if (z.k === 1) for (const h of as) if (h.k === 0 && Math.abs(h.x - z.x) < 1.5 && Math.abs(h.y - z.y) < 1.5 && rng() < 0.3) h.k = 2
      for (const a of as) if (a.k === 2) a.k = 1
      if (as.every(a => a.k === 1) || t > 1500) hold = 60
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (Math.floor(x / 8) + Math.floor(y / 8)) % 2 ? 0x3a3a42 : 0x34343c
      for (const a of as) {
        dot(px, W, H, a.x, a.y - 1, a.k ? 0x8ad06a : 0xffd0a0)
        dot(px, W, H, a.x, a.y, a.k ? 0x4a6a3a : 0x3a6ae0)
      }
      const z = as.filter(a => a.k).length
      shares(px, W, H, [as.length - z, z], [0x3a6ae0, 0x6ad04a], 0, 3)
      text(px, W, H, 1, H - 6 > 8 ? 4 : 4, String(as.length - z), 0xffffff)
    },
  }
}

// --- tank duel --------------------------------------------------------------------

const tankduel: Maker = (W, H, rng) => {
  let ground: number[] = []
  let tanks: { x: number; hp: number; angle: number; power: number; last: number }[] = []
  let turn = 0
  let shell: { x: number; y: number; vx: number; vy: number } | undefined
  let blast: { x: number; y: number; t: number } | undefined
  let wind = 0
  let wait = 30
  let hold = 0
  let wins = [0, 0]

  function reset() {
    ground = []
    const a = rng() * 6
    for (let x = 0; x < W; x++) ground.push(H * 0.62 + Math.sin(x * 0.18 + a) * H * 0.08 + Math.sin(x * 0.07 + a * 2) * H * 0.06)
    tanks = [
      { x: 3, hp: 3, angle: -0.9, power: 1.6, last: Infinity },
      { x: W - 4, hp: 3, angle: -Math.PI + 0.9, power: 1.6, last: Infinity },
    ]
    turn = 0
    wind = (rng() - 0.5) * 0.02
  }
  reset()
  const gy = (x: number) => ground[clamp(Math.round(x), 0, W - 1)] as number

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (blast) {
        if (++blast.t > 14) blast = undefined
        return
      }
      if (shell) {
        shell.vy += 0.05
        shell.vx += wind
        shell.x += shell.vx
        shell.y += shell.vy
        if (shell.x < -3 || shell.x > W + 3 || shell.y >= gy(shell.x)) {
          const bx = shell.x
          const by = Math.min(shell.y, gy(shell.x))
          blast = { x: bx, y: by, t: 0 }
          for (let x = 0; x < W; x++) {
            const d = Math.abs(x - bx)
            if (d < 3.5) ground[x] = Math.max(ground[x] as number, by + Math.sqrt(12.25 - d * d) * 0.8)
          }
          const shooter = tanks[turn] as { last: number; angle: number; power: number }
          const target = tanks[1 - turn] as { x: number; hp: number }
          shooter.last = bx - target.x
          if (Math.hypot(bx - target.x, by - gy(target.x)) < 4) target.hp--
          if (target.hp <= 0) {
            wins[turn]!++
            hold = 70
          }
          shell = undefined
          turn = 1 - turn
          wait = 18
          wind = clamp(wind + (rng() - 0.5) * 0.008, -0.02, 0.02)
        }
        return
      }
      if (--wait > 0) return
      // the gunner corrects its power from where its last shell landed
      const me = tanks[turn] as { x: number; angle: number; power: number; last: number }
      const dir = turn === 0 ? 1 : -1
      if (me.last !== Infinity) me.power = clamp(me.power - me.last * dir * 0.012 + (rng() - 0.5) * 0.04, 0.5, 2.2)
      if (me.last === Infinity) {
        const o = tanks[1 - turn] as { x: number }
        const s2 = Math.abs(Math.sin(2 * me.angle))
        me.power = Math.sqrt((0.05 * Math.abs(o.x - me.x)) / Math.max(0.3, s2)) * (0.9 + rng() * 0.25)
      }
      const y = gy(me.x) - 3
      shell = { x: me.x, y, vx: Math.cos(me.angle) * me.power, vy: Math.sin(me.angle) * me.power }
    },
    draw(px) {
      sky(px, W, H, 0x1a2a5a, 0xe08a5a)
      for (let x = 0; x < W; x++) {
        const g = Math.round(ground[x] as number)
        rect(px, W, H, x, g, 1, H - g, 0x6a5030)
        dot(px, W, H, x, g, 0x8ac04a)
      }
      tanks.forEach((tk, i) => {
        const y = gy(tk.x)
        const c = i ? 0x5ab0ff : 0xff6a4a
        rect(px, W, H, tk.x - 2, y - 2, 5, 2, c)
        rect(px, W, H, tk.x - 1, y - 3, 3, 1, c)
        line(px, W, H, tk.x, y - 3, tk.x + Math.cos(tk.angle) * 3, y - 3 + Math.sin(tk.angle) * 3, 0xd0d0d0)
        for (let k = 0; k < tk.hp; k++) dot(px, W, H, tk.x - 1 + k, y - 6, 0x6aff6a)
      })
      if (shell) dot(px, W, H, shell.x, shell.y, 0xffffff)
      if (blast) disc(px, W, H, blast.x, blast.y, 1 + blast.t * 0.25, blast.t % 4 < 2 ? 0xffe060 : 0xff6a20)
      const wx = W / 2
      line(px, W, H, wx, 3, wx + wind * 200, 3, 0xffffff)
      text(px, W, H, 1, 1, String(wins[0]), 0xff6a4a)
      const w1 = String(wins[1])
      text(px, W, H, W - 1 - textWidth(w1), 1, w1, 0x5ab0ff)
    },
  }
}

// --- dogfight ---------------------------------------------------------------------

const dogfight: Maker = (W, H, rng) => {
  type Jet = { x: number; y: number; a: number; cd: number; dead: number }
  const COLS = [0xff6a4a, 0x5ab0ff]
  let jets: Jet[] = []
  let shots: { x: number; y: number; vx: number; vy: number; l: number; o: number }[] = []
  let bits: Spark[] = []
  let score = [0, 0]
  const stars = Array.from({ length: 20 }, () => [rng() * W, rng() * H] as [number, number])

  const spawn = (i: number): Jet => ({ x: i ? W * 0.8 : W * 0.2, y: i ? H * 0.8 : H * 0.2, a: i ? -2.3 : 0.8, cd: 20, dead: 0 })
  jets = [spawn(0), spawn(1)]
  const wrapD = (d: number, m: number) => (d > m / 2 ? d - m : d < -m / 2 ? d + m : d)

  return {
    step() {
      bits = sparks(bits, 0)
      for (const s of shots) {
        s.x = (s.x + s.vx + W) % W
        s.y = (s.y + s.vy + H) % H
        s.l--
      }
      shots = shots.filter(s => s.l > 0)
      jets.forEach((j, i) => {
        if (j.dead) {
          if (--j.dead === 0) jets[i] = spawn(i)
          return
        }
        const o = jets[1 - i] as Jet
        const dx = wrapD(o.x - j.x, W)
        const dy = wrapD(o.y - j.y, H)
        const want = Math.atan2(dy, dx) + Math.sin(j.x * 0.3 + i) * 0.4
        const da = Math.atan2(Math.sin(want - j.a), Math.cos(want - j.a))
        j.a += clamp(da, -0.07, 0.07)
        j.x = (j.x + Math.cos(j.a) * 0.55 + W) % W
        j.y = (j.y + Math.sin(j.a) * 0.55 + H) % H
        if (--j.cd <= 0 && Math.abs(da) < 0.25 && !o.dead) {
          shots.push({ x: j.x, y: j.y, vx: Math.cos(j.a) * 1.5, vy: Math.sin(j.a) * 1.5, l: 22, o: i })
          j.cd = 12
        }
        for (const s of shots)
          if (s.o !== i && Math.abs(wrapD(s.x - j.x, W)) < 1.5 && Math.abs(wrapD(s.y - j.y, H)) < 1.5 && rng() < 0.5) {
            j.dead = 40
            s.l = 0
            score[1 - i]!++
            burst(bits, rng, j.x, j.y, COLS[i] as number, 14, 1)
          }
      })
    },
    draw(px) {
      px.fill(0x05060e)
      for (const [x, y] of stars) dot(px, W, H, x, y, 0x3a3a5a)
      for (const s of shots) dot(px, W, H, s.x, s.y, mix(COLS[s.o] as number, 0xffffff, 0.5))
      jets.forEach((j, i) => {
        if (j.dead) return
        const c = Math.cos(j.a)
        const s = Math.sin(j.a)
        const p = (f: number, g: number): [number, number] => [j.x + c * f - s * g, j.y + s * f + c * g]
        const n = p(2.5, 0)
        const l = p(-1.5, -2)
        const r = p(-1.5, 2)
        line(px, W, H, n[0], n[1], l[0], l[1], COLS[i] as number)
        line(px, W, H, n[0], n[1], r[0], r[1], COLS[i] as number)
        line(px, W, H, l[0], l[1], r[0], r[1], COLS[i] as number)
        const tl = p(-2.5, 0)
        dot(px, W, H, tl[0], tl[1], 0xffa020)
      })
      for (const b of bits) dot(px, W, H, b.x, b.y, b.c)
      text(px, W, H, 1, 1, String(score[0]), COLS[0] as number)
      const s1 = String(score[1])
      text(px, W, H, W - 1 - textWidth(s1), 1, s1, COLS[1] as number)
    },
  }
}

// --- virus vs white cells ---------------------------------------------------------

const viruses: Maker = (W, H, rng) => {
  let vir: Agent[] = []
  let cells: (Agent & { full: number })[] = []
  let reds: [number, number, number][] = []
  let t = 0

  function reset() {
    vir = Array.from({ length: 8 }, () => ({ x: rng() * W, y: rng() * H, vx: 0, vy: 0, k: 0 }))
    cells = Array.from({ length: 3 }, () => ({ x: rng() * W, y: rng() * H, vx: 0, vy: 0, k: 0, full: 0 }))
    reds = Array.from({ length: 10 }, () => [rng() * W, rng() * H, rng() * 6] as [number, number, number])
  }
  reset()

  return {
    step() {
      t++
      for (const r of reds) {
        r[1] -= 0.25
        r[2] += 0.05
        if (r[1] < -3) {
          r[1] = H + 3
          r[0] = rng() * W
        }
      }
      for (const v of vir) {
        v.vx = v.vx * 0.9 + (rng() - 0.5) * 0.15
        v.vy = v.vy * 0.9 + (rng() - 0.5) * 0.15 - 0.01
        v.x = clamp(v.x + v.vx, 1, W - 2)
        v.y = clamp(v.y + v.vy, 1, H - 2)
      }
      if (t % 40 === 0 && vir.length < 60) for (const v of vir.slice()) if (rng() < 0.35) vir.push({ x: v.x + 1, y: v.y, vx: 0, vy: 0, k: 0 })
      for (const c of cells) {
        if (c.full > 0) c.full--
        let best: Agent | undefined
        let bd = Infinity
        for (const v of vir) {
          const d = Math.hypot(v.x - c.x, v.y - c.y)
          if (d < bd) {
            bd = d
            best = v
          }
        }
        if (best) {
          c.vx = c.vx * 0.85 + ((best.x - c.x) / bd) * 0.06
          c.vy = c.vy * 0.85 + ((best.y - c.y) / bd) * 0.06
        }
        c.x = clamp(c.x + c.vx, 3, W - 4)
        c.y = clamp(c.y + c.vy, 3, H - 4)
        vir = vir.filter(v => {
          if (Math.hypot(v.x - c.x, v.y - c.y) < 3) {
            c.full = 10
            return false
          }
          return true
        })
      }
      if (!vir.length) for (let i = 0; i < 4; i++) vir.push({ x: rng() * W, y: rng() * H, vx: 0, vy: 0, k: 0 })
      if (vir.length >= 60 && t % 300 === 0) cells.push({ x: rng() * W, y: H, vx: 0, vy: 0, k: 0, full: 0 })
      if (cells.length > 6) cells.shift()
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(0x8a1a2a, 0xb83a4a, 0.5 + 0.5 * Math.sin(x * 0.3 + y * 0.1 + t * 0.02))
      for (const [x, y, a] of reds) {
        disc(px, W, H, x, y, 1.8, 0xd02030)
        dot(px, W, H, x + Math.cos(a) * 0.5, y, 0x9a1020)
      }
      for (const v of vir) {
        dot(px, W, H, v.x, v.y, 0x6ae04a)
        for (const [dx, dy] of DIRS) dot(px, W, H, v.x + dx, v.y + dy, (t >> 2) % 2 ? 0x3a9a2a : 0x8aff6a)
      }
      for (const c of cells) {
        disc(px, W, H, c.x, c.y, 2.8 + (c.full ? 0.4 : 0), 0xf0f0f8)
        disc(px, W, H, c.x + 0.5, c.y - 0.3, 1, 0xc0a8e0)
      }
      text(px, W, H, 1, 1, String(vir.length), 0x8aff6a)
    },
  }
}

// --- tower defence ----------------------------------------------------------------

const towerdef: Maker = (W, H, rng) => {
  const pts: [number, number][] = [
    [-2, H * 0.12],
    [W * 0.75, H * 0.12],
    [W * 0.75, H * 0.38],
    [W * 0.2, H * 0.38],
    [W * 0.2, H * 0.64],
    [W * 0.8, H * 0.64],
    [W * 0.8, H * 0.86],
    [-2, H * 0.86],
  ]
  const segs = pts.slice(0, -1).map((p, i) => [p, pts[i + 1] as [number, number], Math.hypot((pts[i + 1] as [number, number])[0] - p[0], (pts[i + 1] as [number, number])[1] - p[1])] as const)
  const total = segs.reduce((s, g) => s + g[2], 0)
  const at = (d: number): [number, number] => {
    for (const [a, b, l] of segs) {
      if (d <= l) return [a[0] + ((b[0] - a[0]) * d) / l, a[1] + ((b[1] - a[1]) * d) / l]
      d -= l
    }
    return pts[pts.length - 1] as [number, number]
  }
  const onPath = (x: number, y: number) => {
    for (const [a, b] of segs) {
      const minx = Math.min(a[0], b[0]) - 2
      const maxx = Math.max(a[0], b[0]) + 2
      const miny = Math.min(a[1], b[1]) - 2
      const maxy = Math.max(a[1], b[1]) + 2
      if (x >= minx && x <= maxx && y >= miny && y <= maxy) return true
    }
    return false
  }
  let creeps: { d: number; hp: number; max: number; v: number }[] = []
  let towers: { x: number; y: number; cd: number; lvl: number }[] = []
  let shots: { x: number; y: number; tx: number; ty: number; t: number }[] = []
  let wave = 0
  let spawned = 0
  let timer = 0
  let lives = 10
  let gold = 4
  let pause = 30

  function reset() {
    creeps = []
    towers = []
    wave = 0
    spawned = 0
    lives = 10
    gold = 4
  }
  reset()

  return {
    step() {
      for (const s of shots) s.t++
      shots = shots.filter(s => s.t < 4)
      if (pause > 0) {
        pause--
        return
      }
      if (gold >= 3) {
        for (let tries = 0; tries < 30; tries++) {
          const x = 2 + rng() * (W - 4)
          const y = 2 + rng() * (H - 4)
          if (onPath(x, y) || towers.some(t => Math.hypot(t.x - x, t.y - y) < 4)) continue
          let near = 0
          for (let d = 0; d < total; d += 2) {
            const [px0, py0] = at(d)
            if (Math.hypot(px0 - x, py0 - y) < 8) near++
          }
          if (near > 6) {
            towers.push({ x, y, cd: 0, lvl: 1 })
            gold -= 3
            break
          }
        }
      }
      if (spawned < 6 + wave * 2 && --timer <= 0) {
        const hp = 3 + wave * 2
        creeps.push({ d: 0, hp, max: hp, v: 0.25 + wave * 0.01 })
        spawned++
        timer = 18
      }
      for (const c of creeps) c.d += c.v
      for (const t of towers) {
        if (t.cd > 0) {
          t.cd--
          continue
        }
        const target = creeps.filter(c => {
          const [x, y] = at(c.d)
          return Math.hypot(x - t.x, y - t.y) < 9
        }).sort((a, b) => b.d - a.d)[0]
        if (target) {
          target.hp--
          const [x, y] = at(target.d)
          shots.push({ x: t.x, y: t.y, tx: x, ty: y, t: 0 })
          t.cd = 8
        }
      }
      creeps = creeps.filter(c => {
        if (c.hp <= 0) {
          gold++
          return false
        }
        if (c.d >= total) {
          lives--
          return false
        }
        return true
      })
      if (spawned >= 6 + wave * 2 && !creeps.length) {
        wave++
        spawned = 0
        pause = 30
      }
      if (lives <= 0 || wave > 12) {
        reset()
        pause = 50
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 5 + y * 3) % 13 === 0 ? 0x4a8a3a : 0x5a9a44
      for (let d = 0; d < total; d += 0.5) {
        const [x, y] = at(d)
        rect(px, W, H, x - 1.5, y - 1.5, 3, 3, 0xc8a870)
      }
      for (const t of towers) {
        rect(px, W, H, t.x - 1, t.y - 1, 3, 3, 0x7a7a8a)
        dot(px, W, H, t.x, t.y - 1, 0x3a6aff)
      }
      for (const s of shots) line(px, W, H, s.x, s.y - 1, s.tx, s.ty, 0x8ad0ff)
      for (const c of creeps) {
        const [x, y] = at(c.d)
        disc(px, W, H, x, y, 1, 0xe04a3a)
        rect(px, W, H, x - 1, y - 3, 3, 1, 0x3a0a0a)
        rect(px, W, H, x - 1, y - 3, Math.ceil((c.hp / c.max) * 3), 1, 0x6aff4a)
      }
      text(px, W, H, 1, 0, String(lives), 0xff6a6a)
      const wv = String(wave + 1)
      text(px, W, H, W - 1 - textWidth(wv), 0, wv, 0xffffff)
    },
  }
}

// --- colour tournament ------------------------------------------------------------

const tournament: Maker = (W, H, rng) => {
  const COLS = [0xff4a5a, 0x4ab0ff, 0xffd04a, 0x5ae07a, 0xc06aff, 0xff8a3a, 0x3ae0d0, 0xf0f0f0]
  let round: number[] = []
  let next: number[] = []
  let history: number[][] = []
  let mi = 0
  let fight: (Ball & { hp: number; k: number })[] = []
  let hold = 0
  let bits: Spark[] = []
  const ay = Math.round(H * 0.6)
  const R = Math.min(W / 2 - 2, H * 0.22)

  function start() {
    round = shuffle(rng, COLS.map((_, i) => i))
    history = [round.slice()]
    next = []
    mi = 0
    match()
  }
  function match() {
    const a = round[mi * 2] as number
    const b = round[mi * 2 + 1] as number
    fight = [a, b].map((k, i) => ({ x: W / 2 + (i ? 4 : -4), y: ay, vx: i ? -0.9 : 0.9, vy: (rng() - 0.5), r: 2.4, c: COLS[k] as number, hp: 5, k }))
  }
  start()

  return {
    step() {
      bits = sparks(bits, 0.04)
      if (hold > 0) {
        if (--hold === 0) start()
        return
      }
      const [a, b] = fight as [Ball & { hp: number; k: number }, Ball & { hp: number; k: number }]
      for (const f of fight) {
        f.x += f.vx
        f.y += f.vy
        if (wallCircle(f, W / 2, ay, R)) {
          f.vx += (rng() - 0.5) * 0.3
          f.vy += (rng() - 0.5) * 0.3
        }
      }
      if (collide(a, b)) {
        const loser = rng() < 0.5 ? a : b
        loser.hp--
        burst(bits, rng, (a.x + b.x) / 2, (a.y + b.y) / 2, loser.c, 6, 0.8)
      }
      for (const f of fight) {
        const s = Math.hypot(f.vx, f.vy)
        f.vx *= 1.1 / s
        f.vy *= 1.1 / s
      }
      const dead = fight.find(f => f.hp <= 0)
      if (dead) {
        next.push((dead === a ? b : a).k)
        mi++
        if (mi * 2 >= round.length) {
          history.push(next.slice())
          if (next.length === 1) {
            hold = 90
            return
          }
          round = next
          next = []
          mi = 0
        }
        match()
      }
    },
    draw(px) {
      sky(px, W, H, 0x14142a, 0x22223a)
      // the bracket: one row per round, winners rise
      history.forEach((r, ri) => {
        const y = 3 + (3 - ri) * 6
        const span = W / r.length
        r.forEach((k, i) => {
          const x = span * i + span / 2
          rect(px, W, H, x - 1, y, 3, 3, COLS[k] as number)
          if (ri > 0) {
            line(px, W, H, x - span / 4, y + 4, x + span / 4, y + 4, 0x5a5a7a)
            line(px, W, H, x, y + 3, x, y + 4, 0x5a5a7a)
          }
        })
      })
      ring(px, W, H, W / 2, ay, R + 1, 0x8a8aaa)
      if (hold === 0)
        for (const f of fight) {
          shiny(px, W, H, f)
          for (let k = 0; k < f.hp; k++) dot(px, W, H, f.x - 2 + k, f.y - 4, 0x6aff6a)
        }
      else {
        const w = history[history.length - 1]?.[0] ?? 0
        disc(px, W, H, W / 2, ay, 4 + (hold % 10 < 5 ? 1 : 0), COLS[w] as number)
        sprite(px, W, H, W / 2 - 2, ay - 9, ['x.x.x', 'xxxxx', 'xxxxx'], { x: 0xffd040 })
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- sumo bots --------------------------------------------------------------------

const sumo: Maker = (W, H, rng) => {
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const R = Math.min(W / 2 - 2, H / 2 - 6)
  const COLS = [0xff5a3a, 0x3a8aff]
  let bots: { x: number; y: number; vx: number; vy: number; a: number; out: boolean }[] = []
  let wins = [0, 0]
  let hold = 0
  let t = 0

  function reset() {
    bots = [
      { x: cx - R * 0.5, y: cy, vx: 0, vy: 0, a: 0, out: false },
      { x: cx + R * 0.5, y: cy, vx: 0, vy: 0, a: Math.PI, out: false },
    ]
    t = 0
  }
  reset()

  return {
    step() {
      t++
      if (hold > 0) {
        for (const b of bots) if (b.out) {
          b.x += b.vx
          b.y += b.vy
        }
        if (--hold === 0) reset()
        return
      }
      if (t < 25) return
      bots.forEach((b, i) => {
        const o = bots[1 - i] as { x: number; y: number }
        // aim beside the centre line: push towards the edge, not the middle
        const wx = o.x + (o.x - cx) * 0.3 + Math.sin(t * 0.05 + i * 2) * 2
        const wy = o.y + (o.y - cy) * 0.3 + Math.cos(t * 0.04 + i) * 2
        const want = Math.atan2(wy - b.y, wx - b.x)
        b.a += clamp(Math.atan2(Math.sin(want - b.a), Math.cos(want - b.a)), -0.08, 0.08)
        const power = 0.03 + rng() * 0.02
        b.vx = (b.vx + Math.cos(b.a) * power) * 0.92
        b.vy = (b.vy + Math.sin(b.a) * power) * 0.92
      })
      const a = bots[0] as { x: number; y: number; vx: number; vy: number }
      const b = bots[1] as { x: number; y: number; vx: number; vy: number }
      const ba: Ball = { x: a.x, y: a.y, vx: a.vx, vy: a.vy, r: 2.5, c: 0 }
      const bb: Ball = { x: b.x, y: b.y, vx: b.vx, vy: b.vy, r: 2.5, c: 0 }
      collide(ba, bb, 0.3)
      Object.assign(a, { x: ba.x, y: ba.y, vx: ba.vx, vy: ba.vy })
      Object.assign(b, { x: bb.x, y: bb.y, vx: bb.vx, vy: bb.vy })
      for (const q of bots) {
        q.x += q.vx
        q.y += q.vy
      }
      bots.forEach((q, i) => {
        if (!q.out && Math.hypot(q.x - cx, q.y - cy) > R) {
          q.out = true
          wins[1 - i]!++
          hold = 50
        }
      })
    },
    draw(px) {
      sky(px, W, H, 0x2a1a10, 0x4a2a1a)
      disc(px, W, H, cx, cy, R + 2, 0xd8b880)
      disc(px, W, H, cx, cy, R, 0xe8d0a0)
      ring(px, W, H, cx, cy, R, 0xffffff)
      rect(px, W, H, cx - 3, cy - 1, 1, 3, 0x6a4a2a)
      rect(px, W, H, cx + 3, cy - 1, 1, 3, 0x6a4a2a)
      bots.forEach((b, i) => {
        const c = COLS[i] as number
        rect(px, W, H, b.x - 2, b.y - 2, 5, 5, c)
        rect(px, W, H, b.x - 1, b.y - 1, 3, 3, scale(c, 0.6))
        dot(px, W, H, b.x + Math.cos(b.a) * 3, b.y + Math.sin(b.a) * 3, 0xe0e0e0)
      })
      text(px, W, H, 1, 1, String(wins[0]), COLS[0] as number)
      const w1 = String(wins[1])
      text(px, W, H, W - 1 - textWidth(w1), 1, w1, COLS[1] as number)
    },
  }
}

// --- fire vs water ----------------------------------------------------------------

const firewater: Maker = (W, H, rng) => {
  const GRASS = 0
  const FIRE = 1
  const BURNT = 2
  const WATER = 3
  const STEAM = 4
  let g = new Uint8Array(W * H)
  let age = new Uint8Array(W * H)
  let t = 0

  function reset() {
    g.fill(GRASS)
    age.fill(0)
    for (let k = 0; k < 3; k++) g[irand(rng, Math.floor(H / 3)) * W + irand(rng, W)] = FIRE
    for (let k = 0; k < 3; k++) g[(H - 1 - irand(rng, Math.floor(H / 3))) * W + irand(rng, W)] = WATER
    t = 0
  }
  reset()

  return {
    step() {
      t++
      const n = new Uint8Array(g)
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const k = y * W + x
          const v = g[k]!
          if (v === STEAM) {
            if (++age[k]! > 6) n[k] = BURNT
            continue
          }
          if (v !== FIRE && v !== WATER) continue
          for (const [dx, dy] of DIRS) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue
            const j = ny * W + nx
            const o = g[j]!
            if (v === FIRE && o === GRASS && rng() < 0.12) n[j] = FIRE
            if (v === WATER && (o === GRASS || o === BURNT) && rng() < 0.08) n[j] = WATER
            if (v === WATER && o === FIRE && rng() < 0.5) {
              n[j] = STEAM
              age[j] = 0
            }
          }
          if (v === FIRE && rng() < 0.03) n[k] = BURNT
        }
      g = n
      if (t > 500 || !g.includes(FIRE)) if (t > 60) reset()
    },
    draw(px) {
      for (let k = 0; k < W * H; k++) {
        const v = g[k]!
        const x = k % W
        const y = Math.floor(k / W)
        px[k] =
          v === GRASS ? ((x * 3 + y) % 5 ? 0x4aa03a : 0x5ab84a) : v === FIRE ? ((x + y + t) % 3 ? 0xff6a1a : 0xffd040) : v === BURNT ? 0x2a2420 : v === WATER ? ((x + y * 2 + (t >> 1)) % 6 ? 0x2a7aff : 0x6ab0ff) : 0xd0d8e0
      }
      const fire = g.filter(v => v === FIRE).length
      const water = g.filter(v => v === WATER).length
      shares(px, W, H, [fire, water], [0xff6a1a, 0x2a7aff])
    },
  }
}

// --- foxes and rabbits ------------------------------------------------------------

const foxrabbit: Maker = (W, H, rng) => {
  const top = 12
  const grass = new Float32Array(W * H)
  type An = { x: number; y: number; e: number; fox: boolean; a: number }
  let ans: An[] = []
  let hist: [number, number][] = []
  let t = 0

  function reset() {
    grass.fill(1)
    ans = []
    for (let i = 0; i < 20; i++) ans.push({ x: rng() * W, y: top + rng() * (H - top), e: 5, fox: false, a: rng() * 6 })
    for (let i = 0; i < 3; i++) ans.push({ x: rng() * W, y: top + rng() * (H - top), e: 12, fox: true, a: rng() * 6 })
    hist = []
  }
  reset()

  return {
    step() {
      t++
      for (let i = 0; i < W * H; i++) if (grass[i]! < 1) grass[i] = Math.min(1, grass[i]! + 0.004)
      const born: An[] = []
      for (const a of ans) {
        a.a += (rng() - 0.5) * 0.6
        if (a.fox) {
          let bd = 10
          for (const r of ans)
            if (!r.fox) {
              const d = Math.hypot(r.x - a.x, r.y - a.y)
              if (d < bd) {
                bd = d
                a.a = Math.atan2(r.y - a.y, r.x - a.x)
              }
            }
        }
        const sp = a.fox ? 0.45 : 0.35
        a.x += Math.cos(a.a) * sp
        a.y += Math.sin(a.a) * sp
        if (a.x < 0 || a.x > W - 1) a.a = Math.PI - a.a
        if (a.y < top || a.y > H - 1) a.a = -a.a
        a.x = clamp(a.x, 0, W - 1)
        a.y = clamp(a.y, top, H - 1)
        a.e -= a.fox ? 0.045 : 0.03
        if (!a.fox) {
          const k = Math.round(a.y) * W + Math.round(a.x)
          if (grass[k]! > 0.5) {
            a.e += 0.4
            grass[k] = 0
          }
          if (a.e > 8 && rng() < 0.05) {
            a.e -= 4
            born.push({ x: a.x, y: a.y, e: 4, fox: false, a: rng() * 6 })
          }
        } else {
          for (const r of ans)
            if (!r.fox && r.e > 0 && Math.hypot(r.x - a.x, r.y - a.y) < 1.5) {
              r.e = 0
              a.e += 5
            }
          if (a.e > 18 && rng() < 0.05) {
            a.e -= 8
            born.push({ x: a.x, y: a.y, e: 8, fox: true, a: rng() * 6 })
          }
        }
      }
      ans = ans.filter(a => a.e > 0).concat(born)
      if (ans.length > 160) ans = ans.slice(0, 160)
      if (t % 6 === 0) {
        hist.push([ans.filter(a => !a.fox).length, ans.filter(a => a.fox).length])
        if (hist.length > W) hist.shift()
      }
      if (!ans.some(a => !a.fox) || !ans.some(a => a.fox)) {
        if (!ans.some(a => a.fox)) for (let i = 0; i < 3; i++) ans.push({ x: rng() * W, y: top + rng() * (H - top), e: 12, fox: true, a: rng() * 6 })
        if (!ans.some(a => !a.fox)) for (let i = 0; i < 15; i++) ans.push({ x: rng() * W, y: top + rng() * (H - top), e: 5, fox: false, a: rng() * 6 })
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) px[y * W + x] = y < top ? 0x101820 : grass[y * W + x]! > 0.5 ? 0x5ab040 : grass[y * W + x]! > 0.2 ? 0x8a9a4a : 0x9a8a5a
      const max = Math.max(10, ...hist.flat())
      hist.forEach(([r, f], i) => {
        dot(px, W, H, i, top - 2 - (r / max) * (top - 3), 0xf0f0f0)
        dot(px, W, H, i, top - 2 - (f / max) * (top - 3), 0xff8a2a)
      })
      for (const a of ans) {
        if (a.fox) {
          dot(px, W, H, a.x, a.y, 0xff7a1a)
          dot(px, W, H, a.x - Math.cos(a.a), a.y - Math.sin(a.a), 0xffffff)
        } else dot(px, W, H, a.x, a.y, 0xf4f0e8)
      }
    },
  }
}

// --- last ball standing -----------------------------------------------------------

const lastball: Maker = (W, H, rng) => {
  const x0 = 1
  const y0 = 4
  const x1 = W - 2
  const y1 = H - 2
  let balls: (Ball & { hp: number })[] = []
  let bits: Spark[] = []
  let hold = 0

  function reset() {
    const n = W >= 24 ? 6 : 3
    balls = Array.from({ length: n }, (_, i) => {
      const a = rng() * 6.28
      return { x: 6 + rng() * (W - 12), y: 8 + rng() * (H - 16), vx: Math.cos(a), vy: Math.sin(a), r: 3.6, c: hsv(i / n, 0.7, 0.9), hp: 9 }
    })
  }
  reset()

  return {
    step() {
      bits = sparks(bits, 0.03)
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (const b of balls) {
        b.x += b.vx
        b.y += b.vy
        if (b.x < x0 + b.r || b.x > x1 - b.r) {
          b.vx = -b.vx
          b.x = clamp(b.x, x0 + b.r, x1 - b.r)
        }
        if (b.y < y0 + b.r || b.y > y1 - b.r) {
          b.vy = -b.vy
          b.y = clamp(b.y, y0 + b.r, y1 - b.r)
        }
      }
      for (let i = 0; i < balls.length; i++)
        for (let j = i + 1; j < balls.length; j++) {
          const a = balls[i] as Ball & { hp: number }
          const b = balls[j] as Ball & { hp: number }
          if (collide(a, b)) {
            const victim = rng() < 0.5 ? a : b
            victim.hp -= 1 + (rng() < 0.3 ? 1 : 0)
            burst(bits, rng, (a.x + b.x) / 2, (a.y + b.y) / 2, 0xffffff, 4, 0.6)
          }
        }
      for (const b of balls) {
        const s = Math.hypot(b.vx, b.vy) || 1
        b.vx *= 0.9 / s
        b.vy *= 0.9 / s
      }
      balls = balls.filter(b => {
        if (b.hp > 0) return true
        burst(bits, rng, b.x, b.y, b.c, 16, 1.2)
        return false
      })
      if (balls.length <= 1) hold = 80
    },
    draw(px) {
      sky(px, W, H, 0x1a1a2a, 0x2a1a2a)
      rect(px, W, H, x0 - 1, y0 - 1, x1 - x0 + 3, 1, 0x5a5a7a)
      rect(px, W, H, x0 - 1, y1 + 1, x1 - x0 + 3, 1, 0x5a5a7a)
      for (const b of balls) {
        disc(px, W, H, b.x, b.y, b.r, b.c)
        ring(px, W, H, b.x, b.y, b.r, scale(b.c, 0.6))
        text(px, W, H, b.x - 1, b.y - 2, String(Math.max(0, b.hp)), 0xffffff)
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      if (hold > 0 && balls[0] && hold % 10 < 5) sprite(px, W, H, balls[0].x - 2, balls[0].y - 8, ['x.x.x', 'xxxxx'], { x: 0xffd040 })
    },
  }
}

// --- fire, water, grass -----------------------------------------------------------

const elements = rpsMaker(
  [0xff6a1a, 0x3a9aff, 0x5ad04a],
  [
    ['.x..', '.xx.', 'xxxx', '.xx.'],
    ['.x..', 'xxx.', 'xxxx', '.xx.'],
    ['..xx', '.xxx', 'xxx.', 'x...'],
  ],
  [0x0e0a1a, 0x1a0e2a],
  true,
)

export const VERSUS = {
  rps,
  flagballs,
  pongwars,
  antwar,
  armies,
  automata,
  snakevs,
  stickduel,
  bigfish,
  zombies,
  tankduel,
  dogfight,
  viruses,
  towerdef,
  tournament,
  sumo,
  firewater,
  foxrabbit,
  lastball,
  elements,
}

