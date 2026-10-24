import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, clamp, ellipse, irand, line, lit, pick, poly, ring, shuffle, textWidth } from '../kit'

// Generative art & maths: rules on a grid, endless variety, no art to draw.

// --- game of life -----------------------------------------------------------------

const life: Maker = (W, H, rng) => {
  let a = new Uint8Array(W * H)
  let b = new Uint8Array(W * H)
  const age = new Uint16Array(W * H)
  const ghost = new Float32Array(W * H)
  let t = 0
  let still = 0
  let hue = rng()

  function seed() {
    for (let i = 0; i < W * H; i++) {
      a[i] = rng() < 0.32 ? 1 : 0
      age[i] = 0
    }
    hue = rng()
    t = 0
    still = 0
  }
  seed()

  return {
    step() {
      t++
      for (let i = 0; i < W * H; i++) if (ghost[i]! > 0) ghost[i] = Math.max(0, ghost[i]! - 0.06)
      if (t % 3) return
      let changes = 0
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let n = 0
          for (let dy = -1; dy <= 1; dy++)
            for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && a[((y + dy + H) % H) * W + ((x + dx + W) % W)]) n++
          const k = y * W + x
          const live = a[k] ? n === 2 || n === 3 : n === 3
          b[k] = live ? 1 : 0
          if (live !== !!a[k]) changes++
          if (a[k] && !live) ghost[k] = 1
          age[k] = live ? Math.min(60000, age[k]! + 1) : 0
        }
      ;[a, b] = [b, a]
      still = changes < W * 0.3 ? still + 1 : 0
      if (still > 40 || t > 1800) seed()
    },
    draw(px) {
      // live cells as little lit tiles: brighter where nothing lives above or to the left, darker below and right
      for (let k = 0; k < W * H; k++) {
        if (a[k]) {
          const x = k % W
          const c = hsv(hue + Math.min(age[k]!, 30) * 0.012, 0.75, age[k]! < 2 ? 1 : 0.85)
          const open = k < W || !a[k - W] || x === 0 || !a[k - 1]
          const shut = k + W >= W * H || !a[k + W] || x === W - 1 || !a[k + 1]
          px[k] = open && !shut ? mix(c, 0xffffff, 0.3) : shut && !open ? scale(c, 0.7) : c
        } else px[k] = ghost[k]! > 0.5 ? hsv(hue + 0.5, 0.6, 0.25) : 0x07070e
      }
    },
  }
}

// --- langton's ant ----------------------------------------------------------------

const RULES = ['RL', 'RLR', 'LLRR', 'LRRRRRLLR', 'RRLLLRLLLRRR', 'LRRL']

const langton: Maker = (W, H, rng) => {
  let grid = new Uint8Array(W * H)
  let rule = 'RL'
  let x = 0
  let y = 0
  let d = 3
  let t = 0
  let pal: number[] = []
  let ri = irand(rng, RULES.length)
  const DX = [0, 1, 0, -1]
  const DY = [-1, 0, 1, 0]

  function reset() {
    grid = new Uint8Array(W * H)
    rule = RULES[ri++ % RULES.length] as string
    x = Math.floor(W / 2)
    y = Math.floor(H / 2)
    d = 0
    t = 0
    const h = rng()
    pal = [0x0a0a14, ...Array.from({ length: rule.length - 1 }, (_, k) => hsv(h + k * 0.13, 0.7, 0.95))]
  }
  reset()

  return {
    step() {
      t++
      for (let s = 0; s < 30; s++) {
        const k = y * W + x
        const v = grid[k] as number
        d = (d + (rule[v] === 'R' ? 1 : 3)) % 4
        grid[k] = (v + 1) % rule.length
        x = (x + (DX[d] as number) + W) % W
        y = (y + (DY[d] as number) + H) % H
      }
      if (t > 700) reset()
    },
    draw(px) {
      // each coloured trail cell lit on its top edge, shaded on its bottom edge
      for (let k = 0; k < W * H; k++) {
        const g = grid[k] as number
        const c = pal[g] as number
        if (!g) {
          px[k] = c
          continue
        }
        px[k] = k >= W && grid[k - W] !== g ? mix(c, 0xffffff, 0.3) : k + W < W * H && grid[k + W] !== g ? scale(c, 0.72) : c
      }
      dot(px, W, H, x, y, 0xff3a3a)
      dot(px, W, H, x - 1, y - 1, 0xffa0a0)
    },
  }
}

// --- boids ------------------------------------------------------------------------

const boids: Maker = (W, H, rng) => {
  type B = { x: number; y: number; vx: number; vy: number }
  const n = W >= 24 ? 40 : 16
  const bs: B[] = Array.from({ length: n }, () => {
    const a = rng() * 6.28
    return { x: rng() * W, y: rng() * H, vx: Math.cos(a) * 0.6, vy: Math.sin(a) * 0.6 }
  })
  const rocks = [
    { x: W * 0.3, y: H * 0.35, r: 3 },
    { x: W * 0.7, y: H * 0.68, r: 3.5 },
  ]
  let hawk = { x: -10, y: H / 2, vx: 0, vy: 0, on: 0 }
  let t = 0

  return {
    step() {
      t++
      if (!hawk.on && t % 300 === 150) hawk = { x: -4, y: rng() * H, vx: 0, vy: 0, on: 200 }
      if (hawk.on) {
        hawk.on--
        const c = bs.reduce((s, b) => [s[0]! + b.x / n, s[1]! + b.y / n], [0, 0])
        hawk.vx += clamp(((c[0] as number) - hawk.x) * 0.01, -0.05, 0.05)
        hawk.vy += clamp(((c[1] as number) - hawk.y) * 0.01, -0.05, 0.05)
        const s = Math.hypot(hawk.vx, hawk.vy)
        if (s > 0.9) {
          hawk.vx *= 0.9 / s
          hawk.vy *= 0.9 / s
        }
        hawk.x += hawk.vx
        hawk.y += hawk.vy
        if (!hawk.on) hawk.x = -10
      }
      for (const b of bs) {
        let cx = 0
        let cy = 0
        let ax = 0
        let ay = 0
        let sx = 0
        let sy = 0
        let m = 0
        for (const o of bs) {
          if (o === b) continue
          const dx = o.x - b.x
          const dy = o.y - b.y
          const d = Math.hypot(dx, dy)
          if (d < 8) {
            cx += o.x
            cy += o.y
            ax += o.vx
            ay += o.vy
            m++
            if (d < 2.5) {
              sx -= dx / (d || 1)
              sy -= dy / (d || 1)
            }
          }
        }
        if (m) {
          b.vx += (cx / m - b.x) * 0.004 + (ax / m - b.vx) * 0.05
          b.vy += (cy / m - b.y) * 0.004 + (ay / m - b.vy) * 0.05
        }
        b.vx += sx * 0.05
        b.vy += sy * 0.05
        for (const r of rocks) {
          const d = Math.hypot(b.x - r.x, b.y - r.y)
          if (d < r.r + 4) {
            b.vx += ((b.x - r.x) / d) * 0.08
            b.vy += ((b.y - r.y) / d) * 0.08
          }
        }
        if (hawk.on) {
          const d = Math.hypot(b.x - hawk.x, b.y - hawk.y)
          if (d < 10) {
            b.vx += ((b.x - hawk.x) / d) * 0.12
            b.vy += ((b.y - hawk.y) / d) * 0.12
          }
        }
        if (b.x < 3) b.vx += 0.06
        if (b.x > W - 4) b.vx -= 0.06
        if (b.y < 3) b.vy += 0.06
        if (b.y > H - 4) b.vy -= 0.06
        const s = Math.hypot(b.vx, b.vy)
        const v = clamp(s, 0.45, hawk.on ? 1.2 : 0.8)
        b.vx *= v / s
        b.vy *= v / s
        b.x += b.vx
        b.y += b.vy
      }
    },
    draw(px) {
      // dusk: a low sun, its glow, lit rocks, birds with a wing
      sky(px, W, H, 0x2a3a6a, 0xe8a06a)
      ellipse(px, W, H, W * 0.7, H * 0.92, W * 0.45, H * 0.2, 0xeca86e)
      ellipse(px, W, H, W * 0.7, H * 0.92, W * 0.3, H * 0.12, 0xf2b676)
      disc(px, W, H, W * 0.7, H * 0.92, Math.max(2, W * 0.12), 0xffd890)
      for (const r of rocks) lit(px, W, H, r.x, r.y, r.r, r.r, 0x4a3a4a, 0x1e141e)
      for (const b of bs) {
        dot(px, W, H, b.x - b.vx * 1.4, b.y - b.vy * 1.4, 0x3a2a3a)
        dot(px, W, H, b.x - b.vy, b.y + b.vx, 0x2a1e2a)
        dot(px, W, H, b.x, b.y, 0x140c1a)
      }
      if (hawk.on) {
        const a = Math.atan2(hawk.vy, hawk.vx)
        line(px, W, H, hawk.x - Math.sin(a) * 2, hawk.y + Math.cos(a) * 2, hawk.x + Math.sin(a) * 2, hawk.y - Math.cos(a) * 2, 0x5a2a1a)
        dot(px, W, H, hawk.x - Math.sin(a) * 2, hawk.y + Math.cos(a) * 2, 0x8a4a2a)
        dot(px, W, H, hawk.x + Math.cos(a), hawk.y + Math.sin(a), 0xffd040)
      }
    },
  }
}

// --- spirograph -------------------------------------------------------------------

const spirograph: Maker = (W, H, rng) => {
  const canvas = new Uint32Array(W * H)
  const cx = (W - 1) / 2
  const cy = H * 0.5
  const S = Math.min(W / 2 - 1, H / 2 - 2)
  let R = 1
  let r = 0
  let d = 0
  let th = 0
  let end = 0
  let hue = 0
  let hold = 0
  let last: [number, number] | undefined
  const bg = 0x0a0a16

  function reset() {
    canvas.fill(bg)
    const Rn = pick(rng, [5, 7, 8, 9, 10, 11])
    let rn = 1 + irand(rng, Rn - 1)
    if (rn === Rn / 2) rn++
    R = 1
    r = rn / Rn
    d = r * (0.5 + rng() * 0.6)
    const g = gcd(Rn, rn)
    end = (Math.PI * 2 * rn) / g
    th = 0
    hue = rng()
    last = undefined
  }
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  reset()
  const at = (t: number): [number, number] => {
    const k = S / (R - r + d)
    return [cx + ((R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)) * k, cy + ((R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)) * k]
  }

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      for (let s = 0; s < 6; s++) {
        th += 0.02
        const p = at(th)
        if (last) line(canvas, W, H, last[0], last[1], p[0], p[1], hsv(hue + th * 0.02, 0.7, 1))
        last = p
      }
      if (th >= end) hold = 70
    },
    draw(px) {
      px.set(canvas)
      if (!hold) {
        const k = S / (R - r + d)
        const gx = cx + (R - r) * Math.cos(th) * k
        const gy = cy + (R - r) * Math.sin(th) * k
        ring(px, W, H, gx, gy, r * k, 0x5a5a7a)
        ring(px, W, H, cx, cy, R * k, 0x2a2a3a)
        const [x, y] = at(th)
        line(px, W, H, gx, gy, x, y, 0x8a8aaa)
        dot(px, W, H, x, y, 0xffffff)
      }
    },
  }
}

// --- growing fractal tree ---------------------------------------------------------

const fractaltree: Maker = (W, H, rng) => {
  type Br = { x0: number; y0: number; a: number; len: number; depth: number; born: number }
  let brs: Br[] = []
  let leaves: { x: number; y: number; c: number; born: number; fall: number; vx: number }[] = []
  let t = 0
  let spread = 0.4
  let shrink = 0.72
  let leafHue = 0.35
  const maxD = 8

  function plant() {
    brs = []
    leaves = []
    t = 0
    spread = 0.3 + rng() * 0.3
    shrink = 0.68 + rng() * 0.08
    leafHue = pick(rng, [0.33, 0.95, 0.08, 0.12])
    const grow = (x0: number, y0: number, a: number, len: number, depth: number, born: number) => {
      brs.push({ x0, y0, a, len, depth, born })
      const x1 = x0 + Math.cos(a) * len
      const y1 = y0 + Math.sin(a) * len
      if (depth >= maxD || len < 1.2) {
        leaves.push({ x: x1, y: y1, c: hsv(leafHue + (rng() - 0.5) * 0.06, 0.6, 0.9), born: born + 18, fall: 0, vx: 0 })
        return
      }
      const n = rng() < 0.2 ? 3 : 2
      for (let i = 0; i < n; i++) {
        const da = n === 2 ? (i ? spread : -spread) : (i - 1) * spread
        grow(x1, y1, a + da + (rng() - 0.5) * 0.25, len * (shrink + (rng() - 0.5) * 0.1), depth + 1, born + 14)
      }
    }
    grow(W / 2, H - 5, -Math.PI / 2, H * 0.2, 0, 0)
  }
  plant()

  return {
    step() {
      t++
      if (t > 360) {
        for (const l of leaves) {
          if (!l.fall && rng() < 0.02) l.fall = 1
          if (l.fall) {
            l.y += 0.3
            l.x += Math.sin(l.y * 0.5) * 0.3
          }
        }
      }
      if (t > 560) plant()
    },
    draw(px) {
      sky(px, W, H, 0x9ad0f0, 0xf0e8d0, H - 5)
      rect(px, W, H, 0, H - 5, W, 5, 0x5a8a3e)
      rect(px, W, H, 0, H - 5, W, 1, 0x8ac060)
      ellipse(px, W, H, W / 2 + 1, H - 4.5, W * 0.25, 1, 0x46702e)
      const sway = Math.sin(t * 0.04) * 0.02
      for (const b of brs) {
        const g = clamp((t - b.born) / 14, 0, 1)
        if (g <= 0) continue
        const a = b.a + sway * b.depth
        const x1 = b.x0 + Math.cos(a) * b.len * g
        const y1 = b.y0 + Math.sin(a) * b.len * g
        const c = mix(0x5a3a1e, 0x8a6a3a, b.depth / maxD)
        if (b.depth < 2) {
          line(px, W, H, b.x0 + 1, b.y0, x1 + 1, y1, scale(c, 0.7))
          line(px, W, H, b.x0, b.y0, x1, y1, mix(c, 0xd8b080, 0.3))
        } else line(px, W, H, b.x0, b.y0, x1, y1, c)
      }
      for (const l of leaves) {
        if (t < l.born) continue
        dot(px, W, H, l.x, l.y, l.fall ? l.c : mix(l.c, 0xffffff, 0.25))
        if (!l.fall) {
          dot(px, W, H, l.x + 1, l.y, l.c)
          dot(px, W, H, l.x + 1, l.y + 1, scale(l.c, 0.7))
        }
      }
    },
  }
}

// --- maze, generated then solved --------------------------------------------------

const mazesolve: Maker = (W, H, rng) => {
  const cw = Math.max(2, Math.floor((W - 1) / 2))
  const ch = Math.max(2, Math.floor((H - 1) / 2))
  const open = new Uint8Array(W * H)
  const dist = new Int32Array(W * H)
  let stack: [number, number][] = []
  let phase = 0
  let front: number[] = []
  let maxD = 0
  let path: number[] = []
  let pi = 0
  let hold = 0
  const seen = new Uint8Array(cw * ch)
  const sx = 1
  const sy = 1
  const gx = cw * 2 - 1
  const gy = ch * 2 - 1

  function reset() {
    open.fill(0)
    seen.fill(0)
    dist.fill(-1)
    stack = [[0, 0]]
    seen[0] = 1
    open[sy * W + sx] = 1
    phase = 0
    path = []
    pi = 0
    maxD = 0
  }
  reset()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (phase === 0) {
        for (let s = 0; s < 4 && stack.length; s++) {
          const [x, y] = stack[stack.length - 1] as [number, number]
          const opts = shuffle(rng, DIRS.slice()).filter(([dx, dy]) => {
            const nx = x + dx
            const ny = y + dy
            return nx >= 0 && ny >= 0 && nx < cw && ny < ch && !seen[ny * cw + nx]
          })
          const o = opts[0]
          if (!o) {
            stack.pop()
            continue
          }
          const nx = x + o[0]
          const ny = y + o[1]
          seen[ny * cw + nx] = 1
          open[(y * 2 + 1 + o[1]) * W + x * 2 + 1 + o[0]] = 1
          open[(ny * 2 + 1) * W + nx * 2 + 1] = 1
          stack.push([nx, ny])
        }
        if (!stack.length) {
          phase = 1
          front = [sy * W + sx]
          dist[sy * W + sx] = 0
        }
      } else if (phase === 1) {
        const next: number[] = []
        for (const k of front)
          for (const d of [1, -1, W, -W]) {
            const j = k + d
            if (j >= 0 && j < W * H && open[j] && dist[j] < 0) {
              dist[j] = dist[k]! + 1
              maxD = Math.max(maxD, dist[j]!)
              next.push(j)
            }
          }
        front = next
        if (dist[gy * W + gx]! >= 0 || !front.length) {
          phase = 2
          let k = gy * W + gx
          path = [k]
          while (dist[k]! > 0) {
            for (const d of [1, -1, W, -W]) {
              const j = k + d
              if (j >= 0 && j < W * H && dist[j] === dist[k]! - 1) {
                k = j
                break
              }
            }
            path.push(k)
          }
          path.reverse()
        }
      } else if (phase === 2) {
        pi += 2
        if (pi >= path.length) hold = 60
      }
    },
    draw(px) {
      for (let k = 0; k < W * H; k++) {
        if (!open[k]) {
          px[k] = k + W < W * H && open[k + W] ? 0x2a2a48 : 0x101024
          continue
        }
        const d = dist[k]!
        const c = d >= 0 ? hsv(0.6 + (d / Math.max(1, maxD)) * 0.5, 0.55, 0.75) : 0xe8e8f0
        px[k] = k >= W && !open[k - W] ? scale(c, 0.8) : c
      }
      if (phase === 0 && stack.length) {
        const [x, y] = stack[stack.length - 1] as [number, number]
        dot(px, W, H, x * 2 + 1, y * 2 + 1, 0xff3a6a)
      }
      for (let i = 0; i < Math.min(pi, path.length); i++) px[path[i] as number] = 0xffffff
      dot(px, W, H, sx, sy, 0x3aff6a)
      dot(px, W, H, gx, gy, 0xff3a3a)
    },
  }
}

// --- A* pathfinding ---------------------------------------------------------------

const astar: Maker = (W, H, rng) => {
  const c = 2
  const GW = Math.max(4, Math.floor(W / c))
  const GH = Math.max(4, Math.floor(H / c))
  let wall = new Uint8Array(GW * GH)
  let g = new Float32Array(GW * GH)
  let state = new Uint8Array(GW * GH)
  let from = new Int32Array(GW * GH)
  let openList: number[] = []
  let start = 0
  let goal = 0
  let path: number[] = []
  let phase = 0
  let pi = 0
  let hold = 0

  const h = (k: number) => Math.abs((k % GW) - (goal % GW)) + Math.abs(Math.floor(k / GW) - Math.floor(goal / GW))
  function reset() {
    wall = new Uint8Array(GW * GH)
    for (let n = 0; n < 7; n++) {
      const horiz = rng() < 0.5
      const x = irand(rng, GW)
      const y = irand(rng, GH)
      const len = 4 + irand(rng, Math.max(GW, GH) / 2)
      for (let i = 0; i < len; i++) {
        const xx = horiz ? x + i : x
        const yy = horiz ? y : y + i
        if (xx < GW && yy < GH) wall[yy * GW + xx] = 1
      }
    }
    for (let n = 0; n < GW * GH * 0.06; n++) wall[irand(rng, GW * GH)] = 1
    start = (1 + irand(rng, 3)) * GW + 1 + irand(rng, GW - 2)
    goal = (GH - 2 - irand(rng, 3)) * GW + 1 + irand(rng, GW - 2)
    wall[start] = 0
    wall[goal] = 0
    g = new Float32Array(GW * GH).fill(Infinity)
    state = new Uint8Array(GW * GH)
    from = new Int32Array(GW * GH).fill(-1)
    g[start] = 0
    openList = [start]
    state[start] = 1
    path = []
    phase = 0
    pi = 0
  }
  reset()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (phase === 0) {
        for (let s = 0; s < 3; s++) {
          if (!openList.length) {
            hold = 40
            return
          }
          let bi = 0
          for (let i = 1; i < openList.length; i++) {
            const a = openList[i] as number
            const b = openList[bi] as number
            if (g[a]! + h(a) * 1.2 < g[b]! + h(b) * 1.2) bi = i
          }
          const k = openList.splice(bi, 1)[0] as number
          state[k] = 2
          if (k === goal) {
            phase = 1
            for (let p = goal; p >= 0; p = from[p]!) path.unshift(p)
            return
          }
          const x = k % GW
          const y = Math.floor(k / GW)
          for (const [dx, dy] of DIRS) {
            const nx = x + dx
            const ny = y + dy
            if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue
            const j = ny * GW + nx
            if (wall[j] || state[j] === 2) continue
            if (g[k]! + 1 < g[j]!) {
              g[j] = g[k]! + 1
              from[j] = k
              if (state[j] !== 1) {
                state[j] = 1
                openList.push(j)
              }
            }
          }
        }
      } else {
        pi++
        if (pi > path.length + 20) hold = 30
      }
    },
    draw(px) {
      for (let k = 0; k < GW * GH; k++) {
        let col = 0x1a1e2a
        if (wall[k]) col = 0x6a7088
        else if (state[k] === 2) col = hsv(0.55 + g[k]! * 0.012, 0.6, 0.55)
        else if (state[k] === 1) col = 0x8affc8
        rect(px, W, H, (k % GW) * c, Math.floor(k / GW) * c, c, c, col)
        if (wall[k]) {
          dot(px, W, H, (k % GW) * c, Math.floor(k / GW) * c, 0x9aa0b8)
          dot(px, W, H, (k % GW) * c + c - 1, Math.floor(k / GW) * c + c - 1, 0x40445a)
        }
      }
      for (let i = 0; i < Math.min(pi, path.length); i++) {
        const k = path[i] as number
        rect(px, W, H, (k % GW) * c, Math.floor(k / GW) * c, c, c, 0xffe040)
      }
      rect(px, W, H, (start % GW) * c, Math.floor(start / GW) * c, c, c, 0x3aff6a)
      rect(px, W, H, (goal % GW) * c, Math.floor(goal / GW) * c, c, c, 0xff3a5a)
    },
  }
}

// --- voronoi growth ---------------------------------------------------------------

const voronoi: Maker = (W, H, rng) => {
  let seeds: { x: number; y: number; c: number; vx: number; vy: number }[] = []
  let r = 0
  let t = 0
  const own = new Int16Array(W * H)
  const dist = new Float32Array(W * H)

  function reset() {
    const h = rng()
    seeds = Array.from({ length: 10 + irand(rng, 6) }, (_, i) => ({ x: rng() * W, y: rng() * H, c: hsv(h + i * 0.07, 0.55, 0.95), vx: (rng() - 0.5) * 0.1, vy: (rng() - 0.5) * 0.1 }))
    r = 0
    t = 0
  }
  reset()

  return {
    step() {
      t++
      r += 0.25
      if (r > 30) for (const s of seeds) {
        s.x = clamp(s.x + s.vx, 0, W - 1)
        s.y = clamp(s.y + s.vy, 0, H - 1)
      }
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let best = Infinity
          let who = 0
          seeds.forEach((s, i) => {
            const d = (s.x - x) ** 2 + (s.y - y) ** 2
            if (d < best) {
              best = d
              who = i
            }
          })
          own[y * W + x] = who
          dist[y * W + x] = Math.sqrt(best)
        }
      if (t > 500) reset()
    },
    draw(px) {
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          const k = y * W + x
          const o = own[k]!
          if (dist[k]! > r) {
            px[k] = 0x0e0e18
            continue
          }
          const edge = (x + 1 < W && own[k + 1] !== o) || (y + 1 < H && own[k + W] !== o)
          const s = seeds[o] as { c: number }
          px[k] = edge ? 0x0e0e18 : Math.abs(dist[k]! - r) < 0.8 ? 0xffffff : mix(s.c, 0xffffff, Math.max(0, 0.3 - dist[k]! * 0.02))
        }
      for (const s of seeds) dot(px, W, H, s.x, s.y, 0x0e0e18)
    },
  }
}

// --- dragon curve -----------------------------------------------------------------

const dragon: Maker = (W, H, rng) => {
  let pts: [number, number][] = [
    [0, 0],
    [1, 0],
  ]
  let it = 0
  let fold = 0
  let hue = rng()

  function unfold(base: [number, number][], ang: number): [number, number][] {
    const [px0, py0] = base[base.length - 1] as [number, number]
    const c = Math.cos(ang)
    const s = Math.sin(ang)
    const copy = base
      .slice(0, -1)
      .reverse()
      .map(([x, y]) => {
        const dx = x - px0
        const dy = y - py0
        return [px0 + dx * c - dy * s, py0 + dx * s + dy * c] as [number, number]
      })
    return [...base, ...copy]
  }

  return {
    step() {
      fold += 0.03
      if (fold >= 1) {
        pts = unfold(pts, Math.PI / 2)
        fold = 0
        it++
        if (it >= 11) {
          pts = [
            [0, 0],
            [1, 0],
          ]
          it = 0
          hue = rng()
        }
      }
    },
    draw(px) {
      px.fill(0x08080f)
      const e = fold < 0.85 ? fold / 0.85 : 1
      const cur = fold > 0 ? unfold(pts, (Math.PI / 2) * (e * e * (3 - 2 * e))) : pts
      let x0 = Infinity
      let x1 = -Infinity
      let y0 = Infinity
      let y1 = -Infinity
      for (const [x, y] of cur) {
        x0 = Math.min(x0, x)
        x1 = Math.max(x1, x)
        y0 = Math.min(y0, y)
        y1 = Math.max(y1, y)
      }
      const k = Math.min((W - 3) / Math.max(1, x1 - x0), (H - 3) / Math.max(1, y1 - y0))
      const ox = (W - (x1 - x0) * k) / 2 - x0 * k
      const oy = (H - (y1 - y0) * k) / 2 - y0 * k
      for (let i = 1; i < cur.length; i++) {
        const [ax, ay] = cur[i - 1] as [number, number]
        const [bx, by] = cur[i] as [number, number]
        line(px, W, H, ox + ax * k, oy + ay * k, ox + bx * k, oy + by * k, hsv(hue + (i / cur.length) * 0.6, 0.75, 1))
      }
    },
  }
}

// --- hilbert curve ----------------------------------------------------------------

const hilbert: Maker = (W, H, rng) => {
  let order = 2
  let pts: [number, number][] = []
  let drawn = 0
  let hold = 0
  let hue = rng()

  const d2xy = (n: number, d: number): [number, number] => {
    let x = 0
    let y = 0
    let t = d
    for (let s = 1; s < n; s *= 2) {
      const rx = 1 & (t / 2)
      const ry = 1 & (t ^ rx)
      if (ry === 0) {
        if (rx === 1) {
          x = s - 1 - x
          y = s - 1 - y
        }
        ;[x, y] = [y, x]
      }
      x += s * rx
      y += s * ry
      t = Math.floor(t / 4)
    }
    return [x, y]
  }
  function build() {
    const n = 2 ** order
    pts = Array.from({ length: n * n }, (_, d) => d2xy(n, d))
    drawn = 0
  }
  build()

  return {
    step() {
      if (hold > 0) {
        if (--hold === 0) {
          order = order >= 5 ? 2 : order + 1
          if (order === 2) hue = rng()
          build()
        }
        return
      }
      drawn += Math.max(1, pts.length / 120)
      if (drawn >= pts.length) hold = 45
    },
    draw(px) {
      px.fill(0x0a0a14)
      const n = 2 ** order
      const size = Math.min(W, H) - 2
      const k = size / n
      const ox = (W - size) / 2 + k / 2
      const oy = (H - size) / 2 + k / 2
      const m = Math.min(pts.length, Math.floor(drawn))
      for (let i = 1; i < m; i++) {
        const [ax, ay] = pts[i - 1] as [number, number]
        const [bx, by] = pts[i] as [number, number]
        line(px, W, H, ox + ax * k, oy + ay * k, ox + bx * k, oy + by * k, hsv(hue + (i / pts.length) * 0.8, 0.7, 1))
      }
      const [lx, ly] = pts[Math.max(0, m - 1)] as [number, number]
      if (!hold) dot(px, W, H, ox + lx * k, oy + ly * k, 0xffffff)
    },
  }
}

// --- spinning cube ----------------------------------------------------------------

const SOLIDS: { v: [number, number, number][]; e: [number, number][] }[] = [
  {
    v: [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ],
    e: [
      [0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7],
    ],
  },
  {
    v: [
      [1.3, 0, 0],
      [-1.3, 0, 0],
      [0, 1.3, 0],
      [0, -1.3, 0],
      [0, 0, 1.3],
      [0, 0, -1.3],
    ],
    e: [
      [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [1, 3], [1, 4], [1, 5], [2, 4], [4, 3], [3, 5], [5, 2],
    ],
  },
  {
    v: [
      [1, 1, 1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
    ],
    e: [
      [0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3],
    ],
  },
]

const cube: Maker = (W, H, rng) => {
  let a = 0
  let b = 0
  let t = 0
  let si = 0
  let hue = rng()

  return {
    step() {
      t++
      a += 0.025
      b += 0.017
      if (t % 300 === 0) {
        si = (si + 1) % SOLIDS.length
        hue = rng()
      }
    },
    draw(px) {
      sky(px, W, H, 0x050510, 0x10051a)
      for (let y = Math.floor(H * 0.75); y < H; y += 3) for (let x = 0; x < W; x++) dot(px, W, H, x, y, 0x2a0a3a)
      for (let x = 0; x < W; x += 4) line(px, W, H, W / 2 + (x - W / 2) * 0.3, H * 0.75, x, H, 0x2a0a3a)
      const s = SOLIDS[si] as { v: [number, number, number][]; e: [number, number][] }
      const scaleK = Math.min(W, H) * 0.25
      const pr = s.v.map(([x, y, z]) => {
        let x1 = x * Math.cos(a) - z * Math.sin(a)
        let z1 = x * Math.sin(a) + z * Math.cos(a)
        const y1 = y * Math.cos(b) - z1 * Math.sin(b)
        z1 = y * Math.sin(b) + z1 * Math.cos(b)
        const p = 3.2 / (3.2 + z1)
        x1 *= p
        return [W / 2 + x1 * scaleK, H * 0.42 + y1 * p * scaleK, z1] as [number, number, number]
      })
      const order = s.e.slice().sort((e1, e2) => (pr[e2[0]]![2] + pr[e2[1]]![2]) - (pr[e1[0]]![2] + pr[e1[1]]![2]))
      for (const [i, j] of order) {
        const p = pr[i] as [number, number, number]
        const q = pr[j] as [number, number, number]
        const depth = clamp(0.55 - (p[2] + q[2]) * 0.2, 0.25, 1)
        line(px, W, H, p[0], p[1], q[0], q[1], hsv(hue, 0.7, depth))
      }
      for (const p of pr) dot(px, W, H, p[0], p[1], 0xffffff)
    },
  }
}

// --- spinning donut ---------------------------------------------------------------

const donut: Maker = (W, H) => {
  let A = 0
  let B = 0
  const zb = new Float32Array(W * H)
  const lum = new Float32Array(W * H)
  const frost = new Uint8Array(W * H)
  const SPR = [0xff4a6a, 0x4ab0ff, 0xffe04a, 0x6aff8a, 0xffffff]

  return {
    step() {
      A += 0.05
      B += 0.025
    },
    draw(px) {
      sky(px, W, H, 0xffe8f0, 0xf0d0e8)
      zb.fill(0)
      lum.fill(-2)
      frost.fill(0)
      const R1 = 1
      const R2 = 2.1
      const K2 = 6
      const K1 = (Math.min(W, H * 1.2) * K2 * 0.36) / (R1 + R2)
      const cA = Math.cos(A)
      const sA = Math.sin(A)
      const cB = Math.cos(B)
      const sB = Math.sin(B)
      for (let th = 0; th < Math.PI * 2; th += 0.12) {
        const ct = Math.cos(th)
        const st = Math.sin(th)
        for (let ph = 0; ph < Math.PI * 2; ph += 0.05) {
          const cp = Math.cos(ph)
          const sp = Math.sin(ph)
          const cx = R2 + R1 * ct
          const cy = R1 * st
          const x = cx * (cB * cp + sA * sB * sp) - cy * cA * sB
          const y = cx * (sB * cp - sA * cB * sp) + cy * cA * cB
          const z = K2 + cA * cx * sp + cy * sA
          const ooz = 1 / z
          const xp = Math.round(W / 2 + K1 * ooz * x)
          const yp = Math.round(H / 2 - K1 * ooz * y)
          if (xp < 0 || yp < 0 || xp >= W || yp >= H) continue
          const L = cp * ct * sB - cA * ct * sp - sA * st + cB * (cA * st - ct * sA * sp)
          const k = yp * W + xp
          if (ooz > zb[k]!) {
            zb[k] = ooz
            lum[k] = L
            // the icing covers the side of the ring that faces up in its own frame
            frost[k] = st > -0.15 ? (Math.floor(th * 7 + ph * 11) % 9 === 0 ? 2 : 1) : 0
            if (frost[k] === 2) frost[k] = 2 + (Math.floor(ph * 13) % SPR.length)
          }
        }
      }
      for (let k = 0; k < W * H; k++) {
        const L = lum[k]!
        if (L < -1.5) continue
        const lv = clamp((L + 1) / 2.4, 0.15, 1)
        const q = Math.round(lv * 5) / 5
        const f = frost[k]!
        if (f >= 2) px[k] = SPR[f - 2] as number
        else if (f === 1) px[k] = mix(0x8a2a5a, 0xffa8d0, q)
        else px[k] = mix(0x6a3a1a, 0xf0b070, q)
      }
    },
  }
}

// --- wave function collapse -------------------------------------------------------

// Tiles by their edges (north, east, south, west): g grass, r road.
const WFC: { e: string; w: number; draw: string[] }[] = [
  { e: 'gggg', w: 14, draw: ['gggg', 'gGgg', 'gggg', 'ggGg'] },
  { e: 'rgrg', w: 3, draw: ['grrg', 'grrg', 'grrg', 'grrg'] },
  { e: 'grgr', w: 3, draw: ['gggg', 'rrrr', 'rrrr', 'gggg'] },
  { e: 'rrgg', w: 1, draw: ['grrg', 'grrr', 'grrr', 'gggg'] },
  { e: 'grrg', w: 1, draw: ['gggg', 'grrr', 'grrr', 'grrg'] },
  { e: 'ggrr', w: 1, draw: ['gggg', 'rrrg', 'rrrg', 'grrg'] },
  { e: 'rggr', w: 1, draw: ['grrg', 'rrrg', 'rrrg', 'gggg'] },
  { e: 'rrrr', w: 1, draw: ['grrg', 'rrrr', 'rrrr', 'grrg'] },
  { e: 'gggg', w: 2, draw: ['gbbg', 'brrb', 'bwwb', 'gbbg'] },
  { e: 'gggg', w: 2, draw: ['gttg', 'tTTt', 'tTTt', 'gkkg'] },
  { e: 'gggg', w: 1, draw: ['gccg', 'cCCc', 'cCCc', 'gccg'] },
]

const wfc: Maker = (W, H, rng) => {
  const cs = 4
  const GW = Math.max(2, Math.floor(W / cs))
  const GH = Math.max(2, Math.floor(H / cs))
  const ox = Math.floor((W - GW * cs) / 2)
  const oy = Math.floor((H - GH * cs) / 2)
  let opts: number[][] = []
  let hold = 0
  let t = 0
  const COL: Record<string, number> = { g: 0x6ac04a, G: 0x5aa83a, r: 0xb8a888, b: 0xc84a3a, w: 0xf0e0c0, t: 0x2a8a3a, T: 0x3aa04a, k: 0x6a4a2a, c: 0x3a8ae0, C: 0x5ab0ff }

  function reset() {
    opts = Array.from({ length: GW * GH }, () => WFC.map((_, i) => i))
    t = 0
  }
  reset()
  const fits = (a: number, b: number, dir: number) => {
    // dir: 0 = b is east of a, 1 = b is south of a
    const ea = (WFC[a] as { e: string }).e
    const eb = (WFC[b] as { e: string }).e
    return dir === 0 ? ea[1] === eb[3] : ea[2] === eb[0]
  }
  function propagate(start: number): boolean {
    const q = [start]
    while (q.length) {
      const k = q.pop() as number
      const x = k % GW
      const y = Math.floor(k / GW)
      for (const [dx, dy, dir, flip] of [
        [1, 0, 0, false],
        [0, 1, 1, false],
        [-1, 0, 0, true],
        [0, -1, 1, true],
      ] as [number, number, number, boolean][]) {
        const nx = x + dx
        const ny = y + dy
        if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) continue
        const j = ny * GW + nx
        const before = (opts[j] as number[]).length
        opts[j] = (opts[j] as number[]).filter(b => (opts[k] as number[]).some(a => (flip ? fits(b, a, dir) : fits(a, b, dir))))
        if (!(opts[j] as number[]).length) return false
        if ((opts[j] as number[]).length < before) q.push(j)
      }
    }
    return true
  }

  return {
    step() {
      t++
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      if (t % 2) return
      let best = -1
      let bn = Infinity
      for (let k = 0; k < opts.length; k++) {
        const n = (opts[k] as number[]).length
        if (n > 1 && n + rng() * 0.5 < bn) {
          bn = n + rng() * 0.5
          best = k
        }
      }
      if (best < 0) {
        hold = 70
        return
      }
      const o = opts[best] as number[]
      const total = o.reduce((s, i) => s + (WFC[i] as { w: number }).w, 0)
      let r = rng() * total
      let pickI = o[0] as number
      for (const i of o) {
        r -= (WFC[i] as { w: number }).w
        if (r <= 0) {
          pickI = i
          break
        }
      }
      opts[best] = [pickI]
      if (!propagate(best)) reset()
    },
    draw(px) {
      px.fill(0x1a2a1a)
      for (let k = 0; k < GW * GH; k++) {
        const o = opts[k] as number[]
        const x = ox + (k % GW) * cs
        const y = oy + Math.floor(k / GW) * cs
        if (o.length === 1) {
          const rows = (WFC[o[0] as number] as { draw: string[] }).draw
          rows.forEach((row, j) => [...row].forEach((ch, i) => dot(px, W, H, x + i, y + j, COL[ch] as number)))
        } else {
          const v = 1 - o.length / WFC.length
          rect(px, W, H, x, y, cs, cs, mix(0x1a2a1a, 0x3a5a3a, v))
          dot(px, W, H, x + 1, y + 1, mix(0x2a3a2a, 0x8aa08a, v))
        }
      }
    },
  }
}

// --- water Pythagoras ---------------------------------------------------------------

const pythagoras: Maker = (W, H) => {
  const cx = W / 2
  const cy = H * 0.5
  const k = Math.min(W, H) / 9.5
  // a 3-4-5 triangle; a square on each side, as tanks joined at the triangle
  const A: [number, number] = [-2 * k, 1.5 * k]
  const B: [number, number] = [2 * k, 1.5 * k]
  const C: [number, number] = [-2 * k + 4 * k * 0.36, 1.5 * k - 4 * k * 0.48]
  const square = (p: [number, number], q: [number, number]): [number, number][] => {
    // the square built outward on side p→q
    const dx = q[0] - p[0]
    const dy = q[1] - p[1]
    return [p, q, [q[0] - dy, q[1] + dx], [p[0] - dy, p[1] + dx]]
  }
  const big = square(A, B)
  const s1 = square(C, A)
  const s2 = square(B, C)
  let t = 0
  const T = 220

  return {
    step() {
      t = (t + 1) % (T * 2)
    },
    draw(px) {
      sky(px, W, H, 0x1a2a3a, 0x0e1822)
      for (let y = 0; y < H; y += 6) for (let x = 0; x < W; x++) px[y * W + x] = 0x162432
      // half a turn, a pause, half a turn back; the water flows as the tanks tip
      const phase = t % T
      const turn = Math.min(1, Math.max(0, (phase - 40) / 140))
      const e = turn * turn * (3 - 2 * turn)
      const ang = (t < T ? e : 1 + e) * Math.PI
      const flow = t < T ? e : 1 - e
      const ca = Math.cos(ang)
      const sa = Math.sin(ang)
      const P = ([x, y]: [number, number]): [number, number] => [cx + x * ca - y * sa, cy + x * sa + y * ca]
      // each tank: its pixels on screen, the water filling the lowest of them
      const fill = (pts: [number, number][], level: number, col: number) => {
        const tmp = new Uint32Array(W * H)
        poly(tmp, W, H, pts.map(P), 1)
        const cells: number[] = []
        for (let i = 0; i < W * H; i++) if (tmp[i]) cells.push(i)
        cells.sort((a, b) => b - a)
        const n = Math.round(cells.length * level)
        cells.forEach((i, j) => (px[i] = j < n ? (j > n - W * 0.3 ? 0x8ad8ff : col) : 0x24384a))
        const q = pts.map(P)
        for (let j = 0; j < 4; j++) line(px, W, H, ...q[j], ...q[(j + 1) % 4], 0xd8e8f8)
      }
      // the water always sits in the tanks underneath: the big square while it hangs below the
      // triangle, then the two small ones once the turn has brought them down
      fill(big, 1 - flow, 0x3a90e0)
      fill(s1, flow, 0x3a90e0)
      fill(s2, flow, 0x3a90e0)
      const tri = [A, B, C].map(P)
      poly(px, W, H, tri, 0x5a6a7a)
      for (let j = 0; j < 3; j++) line(px, W, H, ...tri[j], ...tri[(j + 1) % 3], 0xf0d060)
      text(px, W, H, 1, 1, 'A+B', 0xf0d060)
      text(px, W, H, W - textWidth('C') - 1, 1, 'C', 0xf0d060)
    },
  }
}

// --- pendulum wave ------------------------------------------------------------------

const pendulumwave: Maker = (W, H) => {
  const N = 15
  const top = 5
  const A = W * 0.3
  let t = 0
  // in 60 seconds the shortest swings 51 times, the longest 65: they drift in and out of step
  const period = 60 * 15

  return {
    step() {
      t = (t + 1) % period
    },
    draw(px) {
      sky(px, W, H, 0x101424, 0x1a1e34)
      rect(px, W, H, 1, top - 2, W - 2, 2, 0x8a8a9a)
      rect(px, W, H, 1, top - 2, W - 2, 1, 0xc8c8d8)
      // seen end-on, every pendulum hangs from the same bar; a pendulum's length goes as 1 / f²,
      // so the slowest is the longest and the fastest only (51 / 65)² as long. Drawn longest first.
      const Lmax = H - top - 6
      for (let i = 0; i < N; i++) {
        const f = (51 + i) / period
        const L = Lmax * (51 / (51 + i)) ** 2
        // released together from the same sideways pull, so each swings through its own angle, on an arc
        const th = Math.asin(Math.min(0.9, A / L)) * Math.sin(2 * Math.PI * f * t)
        const x = W / 2 + Math.sin(th) * L
        const y = top + Math.cos(th) * L
        for (let s = 0; s < 1; s += 0.08) {
          const lx = W / 2 + (x - W / 2) * s
          const ly = top + (y - top) * s
          const at = Math.round(ly) * W + Math.round(lx)
          if (lx >= 0 && lx < W && ly >= 0 && ly < H) px[at] = mix(px[at], 0x6a6e88, 0.25)
        }
        const col = hsv(i / N, 0.7, 1)
        lit(px, W, H, x, y, 1.4, 1.4, col)
      }
    },
  }
}

// --- travelling salesman ------------------------------------------------------------

const salesman: Maker = (W, H, rng) => {
  const N = 16
  let pts: [number, number][] = []
  let tour: number[] = []
  let t = 0
  let hold = 0
  let swaps = 0
  let flash: [number, number] = [-1, -1]
  const len = () => {
    let s = 0
    for (let i = 0; i < N; i++) {
      const [ax, ay] = pts[tour[i]]
      const [bx, by] = pts[tour[(i + 1) % N]]
      s += Math.hypot(bx - ax, by - ay)
    }
    return s
  }
  const reset = () => {
    pts = []
    for (let i = 0; i < N; i++) pts.push([3 + rng() * (W - 6), 10 + rng() * (H - 14)])
    tour = shuffle(rng, [...Array(N).keys()])
    t = 0
    hold = 0
    swaps = 0
  }
  reset()
  const d = (a: number, b: number) => Math.hypot(pts[a][0] - pts[b][0], pts[a][1] - pts[b][1])
  // one 2-opt move: undo the first crossing it finds, which makes the tour shorter
  const improve = () => {
    for (let i = 0; i < N - 1; i++)
      for (let j = i + 2; j < N; j++) {
        if (i === 0 && j === N - 1) continue
        const a = tour[i]
        const b = tour[i + 1]
        const c = tour[j]
        const e = tour[(j + 1) % N]
        if (d(a, c) + d(b, e) < d(a, b) + d(c, e) - 0.01) {
          const mid = tour.slice(i + 1, j + 1).reverse()
          tour.splice(i + 1, mid.length, ...mid)
          flash = [i + 1, j]
          return true
        }
      }
    return false
  }

  return {
    step() {
      t++
      if (hold) {
        if (++hold > 70) reset()
        return
      }
      if (t % 9 === 0) {
        if (improve()) swaps++
        else hold = 1
      }
    },
    draw(px) {
      sky(px, W, H, 0xf0ead8, 0xe0d6bc)
      // a map: faint grid, the route in red, the cities as pins
      for (let y = 0; y < H; y += 5) for (let x = 0; x < W; x++) px[y * W + x] = mix(px[y * W + x], 0xc8b890, 0.3)
      for (let i = 0; i < N; i++) {
        const [ax, ay] = pts[tour[i]]
        const [bx, by] = pts[tour[(i + 1) % N]]
        const hot = (i === flash[0] - 1 || i === flash[1]) && t % 9 < 5
        line(px, W, H, ax, ay, bx, by, hold ? (t % 10 < 5 ? 0x3aa04a : 0x2a8a3a) : hot ? 0xffa020 : 0xd83a3a)
      }
      for (const [x, y] of pts) {
        dot(px, W, H, x, y, 0x2a2a3a)
        dot(px, W, H, x, y - 1, 0x4a5ad8)
        dot(px, W, H, x - 1, y - 1, 0x6a7af0)
      }
      text(px, W, H, 1, 1, String(Math.round(len())), 0x5a3a1a)
    },
  }
}

export const GENERATIVE = {
  life,
  langton,
  boids,
  spirograph,
  fractaltree,
  mazesolve,
  astar,
  voronoi,
  dragon,
  hilbert,
  cube,
  donut,
  wfc,
  pythagoras,
  pendulumwave,
  salesman,
}
