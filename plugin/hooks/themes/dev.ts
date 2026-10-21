import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { DIRS, burst, clamp, hash, irand, line, pick, ring, shuffle, sparks, textWidth } from '../kit'
import type { Spark } from '../kit'

// Developer humour: in-jokes for the people waiting on Claude.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

/** A retro window: title bar and grey body. */
function win(px: Uint32Array, W: number, H: number, x: number, y: number, w: number, h: number, title = 0x2a4aa8) {
  rect(px, W, H, x, y, w, h, 0xc0c0c0)
  rect(px, W, H, x, y, w, 1, 0xffffff)
  rect(px, W, H, x, y, 1, h, 0xffffff)
  rect(px, W, H, x + w - 1, y, 1, h, 0x5a5a5a)
  rect(px, W, H, x, y + h - 1, w, 1, 0x5a5a5a)
  rect(px, W, H, x + 1, y + 1, w - 2, 3, title)
  rect(px, W, H, x + w - 4, y + 1, 2, 2, 0xc0c0c0)
}

// --- stuck at 99% -----------------------------------------------------------------

const stuck99: Maker = (W, H, rng) => {
  let t = 0
  let pct = 0
  let ending = 0

  return {
    step() {
      t++
      if (t < 60) pct = span(t, 0, 60) * 0.99
      else if (t < 300) pct = 0.99
      else if (t === 300) ending = rng() < 0.5 ? 1 : 2
      if (t > 300 && ending === 1) pct = 1
      if (t > 300 && ending === 2) pct = 0
      if (t > 360) {
        t = 0
        pct = 0
      }
    },
    draw(px) {
      px.fill(0x008080)
      const x = 2
      const y = Math.round(H * 0.35)
      const w = W - 4
      win(px, W, H, x, y, w, 17)
      rect(px, W, H, x + 2, y + 10, w - 4, 4, 0xffffff)
      rect(px, W, H, x + 2, y + 10, w - 4, 1, 0x5a5a5a)
      const fill = Math.floor((w - 6) * pct)
      for (let k = 0; k < fill; k += 3) rect(px, W, H, x + 3 + k, y + 11, 2, 2, 0x000080)
      const label = `${Math.floor(pct * 100)}%`
      text(px, W, H, x + w / 2 - textWidth(label) / 2, y + 4, label, 0x000000)
      if (t > 80 && t < 300) {
        const k = Math.floor(t / 6) % 8
        const cx = W / 2
        const cy = y + 26
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2
          dot(px, W, H, cx + Math.cos(a) * 3, cy + Math.sin(a) * 3, i === k ? 0xffffff : 0x5aa0a0)
        }
      }
      if (t > 300 && ending === 2 && t % 10 < 6) text(px, W, H, W / 2 - 1, y + 24, '?', 0xffffff)
      if (t > 300 && ending === 1 && t % 10 < 6) text(px, W, H, W / 2 - 1, y + 24, '!', 0xffff00)
      rect(px, W, H, 0, H - 4, W, 4, 0xc0c0c0)
      rect(px, W, H, 1, H - 3, 7, 2, 0x3aa03a)
    },
  }
}

// --- git tree ---------------------------------------------------------------------

const gittree: Maker = (W, H, rng) => {
  const lanes = Math.max(3, Math.min(5, Math.floor(W / 6)))
  const lx = (l: number) => 4 + l * ((W - 8) / (lanes - 1))
  type Row = { y: number; dots: number[]; links: [number, number][] }
  let rows: Row[] = []
  let active = new Set([0])
  let y = H
  let t = 0
  const COLS = [0xe8e8f0, 0x3ad06a, 0x3a9aff, 0xffb020, 0xe04ac0]

  function add() {
    const links: [number, number][] = []
    const dots: number[] = []
    const lane = pick(rng, [...active])
    dots.push(lane)
    for (const l of active) links.push([l, l])
    const r = rng()
    if (r < 0.25 && active.size < lanes) {
      const free = [...Array(lanes).keys()].filter(l => !active.has(l))
      const nl = pick(rng, free)
      links.push([lane, nl])
      active.add(nl)
    } else if (r < 0.45 && active.size > 1) {
      const from = pick(rng, [...active].filter(l => l !== 0))
      if (from !== undefined) {
        links.push([from, 0])
        dots.push(0)
        active.delete(from)
      }
    }
    rows.push({ y, dots, links })
    y += 5
  }

  return {
    step() {
      t++
      if (t % 10 === 0) add()
      for (const r of rows) r.y -= 0.5
      y -= 0.5
      rows = rows.filter(r => r.y > -8)
    },
    draw(px) {
      px.fill(0x0d1117)
      for (let i = 0; i < rows.length; i++) {
        const r = rows[i] as Row
        const prev = rows[i - 1]
        if (prev)
          for (const [a, b] of r.links) line(px, W, H, lx(a), prev.y, lx(b), r.y, COLS[b] as number)
        for (const d of r.dots) {
          disc(px, W, H, lx(d), r.y, 1.3, COLS[d] as number)
          dot(px, W, H, lx(d), r.y, 0x0d1117)
        }
      }
      const head = rows[rows.length - 1]
      if (head) ring(px, W, H, lx(head.dots[0] as number), head.y, 2.5, 0xffffff)
    },
  }
}

// --- merge conflict ---------------------------------------------------------------

const mergeconflict: Maker = (W, H, rng) => {
  let t = 0
  let bits: Spark[] = []
  let ours: number[] = []
  let theirs: number[] = []

  function reset() {
    ours = Array.from({ length: 6 }, () => 3 + irand(rng, 8))
    theirs = Array.from({ length: 6 }, () => 3 + irand(rng, 8))
    t = 0
  }
  reset()

  return {
    step() {
      t++
      bits = sparks(bits, 0.05)
      if (t === 60) burst(bits, rng, W / 2, H / 2, 0xff4a4a, 20, 1.2)
      if (t > 260) reset()
    },
    draw(px) {
      px.fill(0x1e1e1e)
      const meet = span(t, 0, 60)
      const resolved = span(t, 160, 200)
      const top = Math.round(H * 0.3)
      ours.forEach((w, i) => {
        const x = -W / 2 + meet * (W / 2 - 2)
        rect(px, W, H, x + 2, top + i * 3, w, 1, mix(0x3ad06a, 0xb06aff, resolved))
      })
      theirs.forEach((w, i) => {
        const x = W + 2 - meet * (W / 2 + 2)
        rect(px, W, H, x + (resolved > 0 ? -W / 2 * resolved + 2 : 2), top + 20 + i * 3 - resolved * 20 + 1, w, 1, mix(0x3a9aff, 0xb06aff, resolved))
      })
      if (t > 60 && t < 170) {
        const m = t % 8 < 4 ? 0xff4a4a : 0xff8a8a
        for (const [k, y] of [
          [0, top - 3],
          [1, top + 18],
          [2, top + 38],
        ] as [number, number][]) {
          for (let x = 2; x < 2 + 7; x++) dot(px, W, H, x, y, k === 1 ? 0xe8e8e8 : m)
        }
      }
      for (const b of bits) dot(px, W, H, b.x, b.y, b.c)
      if (resolved >= 1) text(px, W, H, W - 6, 2, '!', 0x3ad06a)
    },
  }
}

// --- CI pipeline ------------------------------------------------------------------

const cipipeline: Maker = (W, H, rng) => {
  const stages = 5
  let t = 0
  let state: number[] = []
  let fail = -1
  let run = 1

  function reset() {
    state = Array(stages).fill(0)
    fail = rng() < 0.4 ? 1 + irand(rng, stages - 1) : -1
    t = 0
  }
  reset()

  return {
    step() {
      t++
      const cur = state.indexOf(0) === -1 ? stages : state.findIndex(s => s === 0 || s === 1)
      if (cur < stages) {
        if (state[cur] === 0) state[cur] = 1
        if (t % 45 === 0) {
          state[cur] = cur === fail ? 3 : 2
          if (cur === fail) for (let k = cur + 1; k < stages; k++) state[k] = 4
        }
      }
      if (t > stages * 45 + 80 || (fail >= 0 && t > (fail + 1) * 45 + 80)) {
        run++
        reset()
      }
    },
    draw(px) {
      px.fill(0x161b22)
      const h = Math.floor((H - 10) / stages)
      for (let i = 0; i < stages; i++) {
        const y = 6 + i * h
        const s = state[i] as number
        const c = s === 2 ? 0x2ea043 : s === 3 ? 0xda3633 : s === 1 ? 0xd29922 : s === 4 ? 0x30363d : 0x30363d
        rect(px, W, H, 3, y, W - 6, h - 3, 0x21262d)
        rect(px, W, H, 3, y, 2, h - 3, c)
        disc(px, W, H, 9, y + (h - 3) / 2, 2, c)
        if (s === 2) {
          dot(px, W, H, 8, y + (h - 3) / 2, 0xffffff)
          dot(px, W, H, 9, y + (h - 3) / 2 + 1, 0xffffff)
          dot(px, W, H, 10, y + (h - 3) / 2 - 1, 0xffffff)
        } else if (s === 3) text(px, W, H, 8, y + (h - 3) / 2 - 2, 'x', 0xffffff)
        else if (s === 1) dot(px, W, H, 9 + Math.cos(t * 0.4) * 1.5, y + (h - 3) / 2 + Math.sin(t * 0.4) * 1.5, 0xffffff)
        for (let k = 0; k < 2; k++) rect(px, W, H, 13, y + 2 + k * 3, 6 + ((i * 5 + k * 3) % 8), 1, s === 4 ? 0x484f58 : 0x8b949e)
        if (i < stages - 1) rect(px, W, H, 9, y + h - 3, 1, 3, 0x30363d)
      }
      text(px, W, H, 1, 0, String(run % 1000), 0x8b949e)
    },
  }
}

// --- stack overflow ---------------------------------------------------------------

const stackoverflow: Maker = (W, H, rng) => {
  let frames: number[] = []
  let t = 0
  let bits: Spark[] = []
  let topple = 0
  const fh = 3

  return {
    step() {
      t++
      bits = sparks(bits, 0.1)
      if (topple > 0) {
        if (++topple > 70) {
          topple = 0
          frames = []
        }
        return
      }
      if (t % 4 === 0) frames.push(hsv(0.55 + frames.length * 0.02, 0.5, 0.9))
      if (frames.length * fh > H - 6) {
        topple = 1
        for (let k = 0; k < frames.length; k += 2) burst(bits, rng, W / 2, H - 4 - k * fh, frames[k] as number, 2, 1.4)
      }
    },
    draw(px) {
      px.fill(0x1a1a24)
      rect(px, W, H, 0, H - 3, W, 3, 0x3a3a48)
      if (!topple)
        frames.forEach((c, i) => {
          const y = H - 3 - (i + 1) * fh
          const wob = Math.sin(t * 0.2 + i * 0.3) * (i / 20)
          rect(px, W, H, W * 0.2 + wob, y, W * 0.6, fh - 1, c)
          rect(px, W, H, W * 0.2 + 2 + wob, y + 1, 3 + (i % 4), 1, scale(c, 0.6))
        })
      for (const b of bits) rect(px, W, H, b.x, b.y, 3, 1, b.c)
      text(px, W, H, 1, 0, String(frames.length), topple ? 0xff4a4a : 0xffffff)
    },
  }
}

// --- whack-a-bug ------------------------------------------------------------------

const whackabug: Maker = (W, H, rng) => {
  const cols = 3
  const rows = 4
  const top = 10
  const cw = W / cols
  const rh = (H - top - 4) / rows
  type Hole = { up: number; bug: boolean; squash: number }
  let holes: Hole[] = Array.from({ length: cols * rows }, () => ({ up: 0, bug: false, squash: 0 }))
  let mallet = { x: W / 2, y: H / 2, hit: 0 }
  let score = 0
  let t = 0

  return {
    step() {
      t++
      for (const h of holes) {
        if (h.squash > 0) {
          h.squash--
          if (!h.squash) h.bug = false
          continue
        }
        if (h.bug) h.up = Math.min(1, h.up + 0.15)
        else h.up = Math.max(0, h.up - 0.15)
      }
      if (t % 18 === 0) {
        const free = holes.filter(h => !h.bug)
        const h = pick(rng, free)
        if (h) h.bug = true
      }
      const target = holes.findIndex(h => h.bug && h.up >= 1 && !h.squash)
      if (target >= 0) {
        const tx = (target % cols) * cw + cw / 2
        const ty = top + Math.floor(target / cols) * rh + rh / 2
        mallet.x += (tx - mallet.x) * 0.3
        mallet.y += (ty - mallet.y) * 0.3
        if (Math.hypot(tx - mallet.x, ty - mallet.y) < 1 && mallet.hit === 0) {
          mallet.hit = 6
          ;(holes[target] as Hole).squash = 15
          score++
        }
      }
      if (mallet.hit > 0) mallet.hit--
    },
    draw(px) {
      px.fill(0x3a7a3a)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 4) > 0.9) px[y * W + x] = 0x346e34
      holes.forEach((h, i) => {
        const x = (i % cols) * cw + cw / 2
        const y = top + Math.floor(i / cols) * rh + rh / 2
        rect(px, W, H, x - 3, y + 1, 7, 2, 0x1a1a14)
        if (h.up > 0) {
          const by = y + 1 - h.up * 4
          if (h.squash) {
            rect(px, W, H, x - 3, y, 7, 1, 0x6ad03a)
            dot(px, W, H, x - 2, y - 1, 0xffff60)
            dot(px, W, H, x + 2, y - 1, 0xffff60)
          } else {
            rect(px, W, H, x - 2, by, 5, 3, 0x6ad03a)
            dot(px, W, H, x - 1, by, 0xff3a3a)
            dot(px, W, H, x + 1, by, 0xff3a3a)
            dot(px, W, H, x - 3, by + 1, 0x2a5a1a)
            dot(px, W, H, x + 3, by + 1, 0x2a5a1a)
            dot(px, W, H, x - 3, by + 2, 0x2a5a1a)
            dot(px, W, H, x + 3, by + 2, 0x2a5a1a)
          }
        }
        rect(px, W, H, x - 3, y + 3, 7, 1, 0x5a3a1a)
      })
      const lift = mallet.hit > 0 ? 0 : 4
      rect(px, W, H, mallet.x + 1, mallet.y - 8 - lift, 1, 6, 0x8a5a2a)
      rect(px, W, H, mallet.x - 2, mallet.y - 3 - lift, 6, 3, 0xd0d0d8)
      text(px, W, H, 1, 1, String(score), 0xffffff)
    },
  }
}

// --- server rack ------------------------------------------------------------------

const serverrack: Maker = (W, H, rng) => {
  const units = Math.max(4, Math.floor((H - 6) / 5))
  let t = 0
  let alert = -1

  return {
    step() {
      t++
      if (t % 300 === 150) alert = irand(rng, units)
      if (t % 300 === 0) alert = -1
    },
    draw(px) {
      px.fill(0x0a0c10)
      rect(px, W, H, 1, 2, W - 2, H - 4, 0x1a1c22)
      rect(px, W, H, 1, 2, 1, H - 4, 0x3a3c44)
      rect(px, W, H, W - 2, 2, 1, H - 4, 0x3a3c44)
      for (let u = 0; u < units; u++) {
        const y = 4 + u * 5
        rect(px, W, H, 3, y, W - 6, 4, 0x2a2d36)
        rect(px, W, H, 3, y, W - 6, 1, 0x3a3e48)
        for (let k = 0; k < 4; k++) {
          const on = hash(k, u, Math.floor(t / (2 + k))) > 0.4
          dot(px, W, H, 5 + k * 2, y + 2, u === alert ? (t % 6 < 3 ? 0xff2a2a : 0x3a0a0a) : on ? (k === 3 ? 0xffb020 : 0x3aff6a) : 0x0a2a10)
        }
        for (let k = 0; k < 4; k++) dot(px, W, H, W - 12 + k * 2, y + 2, 0x0a0c10)
        const fx = W - 6
        const a = t * 0.8 + u
        dot(px, W, H, fx + Math.round(Math.cos(a)), y + 2 + Math.round(Math.sin(a)) * 0.5, 0x8a8e98)
      }
      for (let x = 3; x < W - 3; x += 3) line(px, W, H, x, H - 2, x + 1, H, [0x3a6aff, 0xffd040, 0xe03a3a][(x / 3) % 3] as number)
    },
  }
}

// --- loading spinners -------------------------------------------------------------

const spinners: Maker = (W, H) => {
  let t = 0

  return {
    step() {
      t++
    },
    draw(px) {
      const kind = Math.floor(t / 90) % 5
      const cx = W / 2
      const cy = H / 2
      px.fill([0x1a1a24, 0xf4f4f8, 0x1a1a24, 0xe8e0d0, 0x2a2a3a][kind] as number)
      if (kind === 0) {
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2 + Math.floor(t / 3) * (Math.PI / 4)
          disc(px, W, H, cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 1.2, mix(0x1a1a24, 0xffffff, i / 8))
        }
      } else if (kind === 1) {
        const x = cx + Math.sin(t * 0.12) * (W * 0.3)
        rect(px, W, H, 3, cy - 1, W - 6, 3, 0xd8d8e0)
        rect(px, W, H, x - 4, cy - 1, 8, 3, 0x3a8aff)
      } else if (kind === 2) {
        for (let i = 0; i < 3; i++) {
          const b = Math.max(0, Math.sin(t * 0.2 - i * 0.8))
          disc(px, W, H, cx - 6 + i * 6, cy - b * 3, 1.5, 0xffffff)
        }
      } else if (kind === 3) {
        const flip = Math.floor(t / 30) % 2
        const sand = (t % 30) / 30
        for (let y = -6; y <= 6; y++) {
          const hw = Math.abs(y) * 0.6 + 0.5
          rect(px, W, H, cx - hw, cy + y, hw * 2 + 1, 1, 0x8a6a4a)
          const filled = flip ? y < 0 : y > 0
          if (filled && Math.abs(y) / 6 < (y > 0 ? sand : 1 - sand) * 1.1) rect(px, W, H, cx - hw + 1, cy + y, hw * 2 - 1, 1, 0xe8c070)
        }
        rect(px, W, H, cx - 5, cy - 7, 11, 1, 0x5a3a2a)
        rect(px, W, H, cx - 5, cy + 7, 11, 1, 0x5a3a2a)
      } else {
        const a0 = t * 0.25
        for (let k = 0; k < 6; k++)
          for (let r = 0; r <= 6; r += 0.5) {
            const a = a0 + (k / 6) * Math.PI * 2
            for (let s = 0; s < 1; s += 0.15) dot(px, W, H, cx + Math.cos(a + s) * r, cy + Math.sin(a + s) * r, hsv(k / 6, 0.8, 1))
          }
      }
    },
  }
}

// --- packet routing ---------------------------------------------------------------

const packets: Maker = (W, H, rng) => {
  type N = { x: number; y: number }
  let nodes: N[] = []
  let edges: [number, number][] = []
  type P = { path: number[]; i: number; u: number; c: number; drop: boolean }
  let ps: P[] = []
  let drops: Spark[] = []
  let t = 0

  function build() {
    nodes = []
    for (let k = 0; k < 9; k++) {
      for (let tries = 0; tries < 40; tries++) {
        const n = { x: 3 + rng() * (W - 6), y: 4 + rng() * (H - 8) }
        if (nodes.every(o => Math.hypot(o.x - n.x, o.y - n.y) > 7)) {
          nodes.push(n)
          break
        }
      }
    }
    edges = []
    nodes.forEach((n, i) => {
      const near = nodes.map((o, j) => [j, Math.hypot(o.x - n.x, o.y - n.y)] as [number, number]).filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 2)
      for (const [j] of near) if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j])
    })
  }
  build()
  const route = (a: number, b: number) => {
    const from = new Map<number, number>([[a, -1]])
    const q = [a]
    for (let i = 0; i < q.length; i++) {
      const k = q[i] as number
      if (k === b) break
      for (const [x, y] of edges) {
        const nb = x === k ? y : y === k ? x : -1
        if (nb >= 0 && !from.has(nb)) {
          from.set(nb, k)
          q.push(nb)
        }
      }
    }
    if (!from.has(b)) return [a]
    const p: number[] = []
    for (let k = b; k !== -1; k = from.get(k) as number) p.unshift(k)
    return p
  }

  return {
    step() {
      t++
      drops = sparks(drops, 0.05)
      if (t % 10 === 0 && nodes.length > 1) {
        const a = irand(rng, nodes.length)
        let b = irand(rng, nodes.length)
        if (b === a) b = (a + 1) % nodes.length
        ps.push({ path: route(a, b), i: 0, u: 0, c: hsv(rng(), 0.7, 1), drop: rng() < 0.08 })
      }
      for (const p of ps) {
        p.u += 0.08
        if (p.u >= 1) {
          p.u = 0
          p.i++
          if (p.drop && p.i === 1 && p.path.length > 2) {
            const n = nodes[p.path[1] as number] as N
            burst(drops, rng, n.x, n.y, 0xff3a3a, 5, 0.6)
            p.i = 999
          }
        }
      }
      ps = ps.filter(p => p.i < p.path.length - 1)
      if (t % 900 === 0) build()
    },
    draw(px) {
      px.fill(0x0a1020)
      for (const [a, b] of edges) line(px, W, H, nodes[a]!.x, nodes[a]!.y, nodes[b]!.x, nodes[b]!.y, 0x1a3050)
      for (const n of nodes) {
        rect(px, W, H, n.x - 1.5, n.y - 1, 4, 3, 0x3a5a8a)
        dot(px, W, H, n.x - 0.5, n.y, t % 8 < 4 ? 0x3aff8a : 0x1a8a4a)
      }
      for (const p of ps) {
        const a = nodes[p.path[p.i] as number] as N
        const b = nodes[p.path[p.i + 1] as number] as N
        if (!a || !b) continue
        dot(px, W, H, a.x + (b.x - a.x) * p.u, a.y + (b.y - a.y) * p.u, p.c)
      }
      for (const d of drops) dot(px, W, H, d.x, d.y, d.c)
    },
  }
}

// --- garbage collector ------------------------------------------------------------

const gc: Maker = (W, H, rng) => {
  const cs = 4
  const cols = Math.max(3, Math.floor((W - 2) / cs))
  const rows = Math.max(4, Math.floor((H - 16) / cs))
  const oy = 12
  let cells: number[] = []
  let truck = -8
  let phase = 0
  let t = 0
  let freed = 0
  // -1 free, 0 live, 1 garbage

  function fill() {
    cells = Array.from({ length: cols * rows }, () => (rng() < 0.7 ? 0 : -1))
  }
  fill()

  return {
    step() {
      t++
      if (phase === 0) {
        if (t % 4 === 0) {
          const live = cells.map((c, i) => (c === 0 ? i : -1)).filter(i => i >= 0)
          const k = pick(rng, live)
          if (k !== undefined) cells[k] = 1
          const free = cells.map((c, i) => (c === -1 ? i : -1)).filter(i => i >= 0)
          const f = pick(rng, free)
          if (f !== undefined && rng() < 0.6) cells[f] = 0
        }
        if (cells.filter(c => c === 1).length > cells.length * 0.35) {
          phase = 1
          truck = -8
        }
      } else if (phase === 1) {
        truck += 0.6
        const col = Math.floor(truck / cs)
        for (let r = 0; r < rows; r++) {
          const k = r * cols + col
          if (col >= 0 && col < cols && cells[k] === 1) {
            cells[k] = -1
            freed++
          }
        }
        if (truck > W + 8) phase = 0
      }
    },
    draw(px) {
      px.fill(0x14161e)
      rect(px, W, H, 1, 2, W - 2, 7, 0x22252e)
      for (let k = 0; k < 3; k++) {
        disc(px, W, H, 5 + k * 9, 5, 2, 0x3a8aff)
      }
      for (let i = 0; i < cols * rows; i++) {
        const c = cells[i] as number
        const x = 1 + (i % cols) * cs
        const y = oy + Math.floor(i / cols) * cs
        rect(px, W, H, x, y, cs - 1, cs - 1, c === 0 ? 0x3ac06a : c === 1 ? 0x5a5a62 : 0x1e2028)
        if (c === 0 && (i * 7) % 11 === 0) line(px, W, H, 5 + ((i % 3) * 9), 7, x + 1, y, 0x1a5a8a)
      }
      if (phase === 1) {
        const y = oy + rows * cs / 2 - 4
        rect(px, W, H, truck - 6, y, 8, 6, 0x3a8a3a)
        rect(px, W, H, truck + 2, y + 2, 4, 4, 0xe0e0e0)
        dot(px, W, H, truck + 4, y + 3, 0x3a8aff)
        disc(px, W, H, truck - 4, y + 6, 1.2, 0x1a1a1a)
        disc(px, W, H, truck + 4, y + 6, 1.2, 0x1a1a1a)
      }
      text(px, W, H, 1, H - 6, String(freed), 0x3ac06a)
    },
  }
}

// --- memory leak ------------------------------------------------------------------

const memleak: Maker = (W, H, rng) => {
  let level = 0
  let t = 0
  let crash = 0
  let graph: number[] = []

  return {
    step() {
      t++
      if (crash > 0) {
        level = Math.max(0, level - 0.02)
        if (--crash === 0) graph = []
        return
      }
      level += 0.0012 + (rng() < 0.05 ? 0.01 : 0)
      if (t % 4 === 0) {
        graph.push(level)
        if (graph.length > W - 4) graph.shift()
      }
      if (level >= 1) crash = 60
    },
    draw(px) {
      px.fill(0x14161e)
      rect(px, W, H, 1, 1, W - 2, 12, 0x1e2028)
      graph.forEach((g, i) => dot(px, W, H, 2 + i, 12 - g * 10, g > 0.8 ? 0xff4a4a : 0xffb020))
      const floor = H - 2
      for (let k = 0; k < 3; k++) {
        const x = 3 + k * 10
        rect(px, W, H, x, 16, 7, floor - 16, 0x2a2d36)
        for (let y = 18; y < floor - 2; y += 4) {
          dot(px, W, H, x + 2, y, hash(k, y, t >> 3) > 0.5 ? 0x3aff6a : 0x0a3a1a)
          rect(px, W, H, x + 4, y, 2, 1, 0x3a3e48)
        }
      }
      const wy = floor - level * (floor - 16)
      for (let y = Math.floor(wy); y < floor; y++) for (let x = 0; x < W; x++) px[y * W + x] = mix(px[y * W + x] as number, (x + y + (t >> 2)) % 7 ? 0x2a6ab0 : 0x5a9ae0, 0.6)
      rect(px, W, H, 0, floor, W, 2, 0x3a3e48)
      if (crash > 0 && crash % 10 < 5) text(px, W, H, W / 2 - 1, 4, '!', 0xff4a4a)
      text(px, W, H, W - 14, 2, `${Math.floor(level * 100)}%`, 0xffffff)
    },
  }
}

// --- rubber duck ------------------------------------------------------------------

const rubberduck: Maker = (W, H) => {
  const desk = Math.round(H * 0.68)
  let t = 0

  return {
    step() {
      t++
    },
    draw(px) {
      sky(px, W, H, 0x1a1e2a, 0x2a2e3a, desk)
      rect(px, W, H, 0, desk, W, H - desk, 0x5a3a26)
      rect(px, W, H, 0, desk, W, 1, 0x7a5a3a)
      rect(px, W, H, 2, desk - 16, 14, 11, 0x14161e)
      rect(px, W, H, 3, desk - 15, 12, 9, 0x0d1117)
      for (let k = 0; k < 4; k++) rect(px, W, H, 4 + (k % 2) * 2, desk - 14 + k * 2, 4 + ((k * 5) % 6), 1, [0x3ad06a, 0x3a9aff, 0xffb020, 0xe04ac0][k] as number)
      rect(px, W, H, 8, desk - 5, 2, 5, 0x2a2a2a)
      const phase = t % 240
      const bob = Math.sin(t * 0.08) * 0.6
      const dx = W * 0.72
      const dy = desk - 4 + bob
      sprite(px, W, H, dx - 4, dy - 6, ['..yyy..', '.yyyyo.', '.yykyoo', '..yyy..', 'yyyyyyy', 'yyyyyyy', '.yyyyy.'], { y: 0xffd820, k: 0x1a1a1a, o: 0xff8a20 })
      if (phase < 140) {
        for (let k = 0; k < 3; k++) if ((t >> 3) % 4 > k) dot(px, W, H, 18 + k * 2, desk - 20, 0xffffff)
        rect(px, W, H, 16, desk - 22, 8, 5, 0xe8e8f0)
        for (let k = 0; k < 3; k++) if ((t >> 3) % 4 > k) dot(px, W, H, 18 + k * 2, desk - 20, 0x2a2a3a)
      } else if (phase < 180) text(px, W, H, dx - 1, dy - 14, '?', 0xffd820)
      else {
        disc(px, W, H, W / 2, 8, 3, 0xffe880)
        rect(px, W, H, W / 2 - 1, 11, 3, 2, 0xc0c0c8)
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2
          dot(px, W, H, W / 2 + Math.cos(a) * 5, 8 + Math.sin(a) * 5, 0xffe880)
        }
      }
    },
  }
}

// --- pipes screensaver ------------------------------------------------------------

const pipes: Maker = (W, H, rng) => {
  const cs = 2
  const GW = Math.max(4, Math.floor(W / cs))
  const GH = Math.max(4, Math.floor(H / cs))
  let grid = new Int32Array(GW * GH).fill(-1)
  type P = { x: number; y: number; d: number; c: number; alive: boolean }
  let ps: P[] = []
  let joints: [number, number, number][] = []
  let t = 0

  function spawn() {
    for (let tries = 0; tries < 20; tries++) {
      const x = irand(rng, GW)
      const y = irand(rng, GH)
      if (grid[y * GW + x] === -1) {
        const c = hsv(rng(), 0.7, 0.95)
        ps.push({ x, y, d: irand(rng, 4), c, alive: true })
        grid[y * GW + x] = c
        joints.push([x, y, c])
        return
      }
    }
  }
  spawn()

  return {
    step() {
      t++
      for (const p of ps) {
        if (!p.alive) continue
        if (rng() < 0.15) p.d = irand(rng, 4)
        let moved = false
        for (let k = 0; k < 4 && !moved; k++) {
          const d = (p.d + k) % 4
          const [dx, dy] = DIRS[d] as [number, number]
          const nx = p.x + dx
          const ny = p.y + dy
          if (nx >= 0 && ny >= 0 && nx < GW && ny < GH && grid[ny * GW + nx] === -1) {
            if (d !== p.d) joints.push([p.x, p.y, p.c])
            p.d = d
            p.x = nx
            p.y = ny
            grid[ny * GW + nx] = p.c
            moved = true
          }
        }
        if (!moved) {
          p.alive = false
          joints.push([p.x, p.y, p.c])
        }
      }
      if (ps.filter(p => p.alive).length < 2 && t % 10 === 0) spawn()
      if (grid.filter(g => g !== -1).length > GW * GH * 0.7 || t > 1500) {
        grid = new Int32Array(GW * GH).fill(-1)
        ps = []
        joints = []
        t = 0
        spawn()
      }
    },
    draw(px) {
      px.fill(0x000000)
      for (let k = 0; k < GW * GH; k++) {
        const c = grid[k]!
        if (c === -1) continue
        const x = (k % GW) * cs
        const y = Math.floor(k / GW) * cs
        rect(px, W, H, x, y, cs, cs, scale(c, 0.75))
        dot(px, W, H, x, y, mix(c, 0xffffff, 0.35))
      }
      for (const [x, y, c] of joints) {
        disc(px, W, H, x * cs + 0.5, y * cs + 0.5, 1.4, c)
        dot(px, W, H, x * cs, y * cs, 0xffffff)
      }
    },
  }
}

// --- flying toasters --------------------------------------------------------------

const toasters: Maker = (W, H, rng) => {
  type F = { x: number; y: number; toast: boolean; ph: number }
  let fs: F[] = Array.from({ length: 7 }, () => ({ x: rng() * W, y: rng() * H, toast: rng() < 0.35, ph: rng() * 6 }))
  let t = 0
  const stars = Array.from({ length: 20 }, () => [rng() * W, rng() * H] as [number, number])

  return {
    step() {
      t++
      for (const f of fs) {
        f.x -= 0.4
        f.y += 0.3
        if (f.x < -8 || f.y > H + 6) {
          f.x = W + rng() * 10
          f.y = -6 + rng() * H * 0.5
          f.toast = rng() < 0.35
        }
      }
    },
    draw(px) {
      px.fill(0x000000)
      for (const [x, y] of stars) dot(px, W, H, x, y, 0x5a5a6a)
      for (const f of fs) {
        if (f.toast) {
          rect(px, W, H, f.x, f.y, 4, 4, 0xd8a050)
          rect(px, W, H, f.x + 1, f.y + 1, 2, 2, 0xf0d090)
          continue
        }
        rect(px, W, H, f.x, f.y, 6, 4, 0xc8ccd4)
        rect(px, W, H, f.x, f.y, 6, 1, 0xf0f2f6)
        rect(px, W, H, f.x + 1, f.y - 1, 2, 1, 0x5a5a62)
        dot(px, W, H, f.x + 1, f.y + 2, 0x2a2a2a)
        const up = Math.sin(t * 0.4 + f.ph) > 0
        sprite(px, W, H, f.x + 6, f.y - (up ? 3 : 0), up ? ['xx..', 'xxx.', '.xxx'] : ['.xxx', 'xxx.', 'xx..'], { x: 0xffffff })
        sprite(px, W, H, f.x - 3, f.y - (up ? 3 : 0), up ? ['..xx', '.xxx', 'xxx.'] : ['xxx.', '.xxx', '..xx'], { x: 0xe0e0e0 })
      }
    },
  }
}

// --- disk defragmenter ------------------------------------------------------------

const defrag: Maker = (W, H, rng) => {
  const cw = 2
  const ch = 3
  const top = 8
  const cols = Math.floor((W - 2) / cw)
  const rows = Math.floor((H - top - 6) / ch)
  let blocks: number[] = []
  let read = -1
  let write = -1
  let t = 0
  // 0 free, 1 fragmented file, 2 contiguous (done), 3 system

  function scramble() {
    blocks = Array.from({ length: cols * rows }, () => (rng() < 0.55 ? 1 : 0))
    for (let k = 0; k < 6; k++) blocks[irand(rng, blocks.length)] = 3
  }
  scramble()

  return {
    step() {
      t++
      if (t % 2) return
      const firstFree = blocks.findIndex(b => b === 0 || b === 1)
      const lastFrag = blocks.lastIndexOf(1)
      if (firstFree < 0 || lastFrag < 0 || lastFrag < firstFree) {
        if (t % 120 === 0) scramble()
        read = write = -1
        return
      }
      if (blocks[firstFree] === 1) {
        blocks[firstFree] = 2
        write = firstFree
        read = -1
        return
      }
      read = lastFrag
      write = firstFree
      blocks[lastFrag] = 0
      blocks[firstFree] = 2
    },
    draw(px) {
      px.fill(0xc0c0c0)
      rect(px, W, H, 0, 0, W, 4, 0x000080)
      rect(px, W, H, 1, top - 1, cols * cw + 1, rows * ch + 1, 0x808080)
      for (let i = 0; i < cols * rows; i++) {
        const x = 1 + (i % cols) * cw
        const y = top + Math.floor(i / cols) * ch
        const b = blocks[i]
        let c = b === 0 ? 0xffffff : b === 1 ? 0x3a6aff : b === 2 ? 0x0000a8 : 0xa83a3a
        if (i === read) c = 0xff2a2a
        if (i === write) c = 0x2aff2a
        rect(px, W, H, x, y, cw - 1 + 1, ch - 1, c)
      }
      const done = blocks.filter(b => b === 2).length / Math.max(1, blocks.filter(b => b !== 0 && b !== 3).length)
      rect(px, W, H, 2, H - 4, W - 4, 2, 0xffffff)
      rect(px, W, H, 2, H - 4, (W - 4) * done, 2, 0x000080)
    },
  }
}

// --- tests passing ----------------------------------------------------------------

const tests: Maker = (W, H, rng) => {
  const total = Math.max(20, Math.floor((W - 2) / 3) * Math.floor((H - 14) / 3))
  const per = Math.floor((W - 2) / 3)
  let state: number[] = []
  let k = 0
  let t = 0

  function reset() {
    state = Array(total).fill(0)
    k = 0
  }
  reset()

  return {
    step() {
      t++
      if (k < total) {
        if (state[k] === 0) state[k] = 1
        else {
          state[k] = rng() < 0.03 ? 3 : 2
          k++
        }
      } else if (t % 120 === 0) reset()
    },
    draw(px) {
      px.fill(0x0d1117)
      for (let i = 0; i < total; i++) {
        const s = state[i] as number
        const c = s === 0 ? 0x21262d : s === 1 ? 0xd29922 : s === 2 ? 0x2ea043 : 0xda3633
        rect(px, W, H, 1 + (i % per) * 3, 12 + Math.floor(i / per) * 3, 2, 2, c)
      }
      const passed = state.filter(s => s === 2).length
      const failed = state.filter(s => s === 3).length
      text(px, W, H, 1, 1, String(passed), 0x2ea043)
      if (failed) text(px, W, H, W - 1 - textWidth(String(failed)), 1, String(failed), 0xda3633)
      if (k >= total) rect(px, W, H, 0, 8, W, 2, failed ? 0xda3633 : 0x2ea043)
    },
  }
}

// --- robot coder ------------------------------------------------------------------

const robotcoder: Maker = (W, H, rng) => {
  const desk = Math.round(H * 0.62)
  let lines: { indent: number; w: number; c: number; err: boolean }[] = []
  let cur = 0
  let t = 0

  return {
    step() {
      t++
      if (t % 3 === 0) {
        const l = lines[lines.length - 1]
        if (!l || cur >= l.w) {
          const indent = clamp((l?.indent ?? 0) + pick(rng, [-1, 0, 0, 1]), 0, 3)
          lines.push({ indent, w: 3 + irand(rng, 8), c: pick(rng, [0xc678dd, 0x61afef, 0x98c379, 0xe5c07b, 0xabb2bf]), err: rng() < 0.06 })
          cur = 0
          if (lines.length > 8) lines.shift()
        } else cur++
      }
      const l = lines[lines.length - 1]
      if (l?.err && cur >= l.w && t % 3 === 0) l.err = false
    },
    draw(px) {
      sky(px, W, H, 0x1a1e2a, 0x262a36, desk)
      rect(px, W, H, 0, desk, W, H - desk, 0x5a4a3a)
      const sx = 2
      const sy = 3
      const sw = W - 4
      const sh = desk - 10
      rect(px, W, H, sx, sy, sw, sh, 0x1a1a1a)
      rect(px, W, H, sx + 1, sy + 1, sw - 2, sh - 2, 0x282c34)
      lines.forEach((l, i) => {
        const y = sy + 2 + i * 3
        const w = i === lines.length - 1 ? cur : l.w
        rect(px, W, H, sx + 2 + l.indent * 2, y, w, 1, l.err ? 0xe06c75 : l.c)
        if (l.err) for (let x = 0; x < w; x += 2) dot(px, W, H, sx + 2 + l.indent * 2 + x, y + 1, 0xe06c75)
      })
      const last = lines[lines.length - 1]
      if (last && t % 10 < 6) rect(px, W, H, sx + 2 + last.indent * 2 + cur, sy + 2 + (lines.length - 1) * 3 - 1, 1, 3, 0xffffff)
      rect(px, W, H, W / 2 - 1, desk - 7, 3, 7, 0x2a2a2a)
      const rx = W / 2 - 4
      const ry = desk + 2
      rect(px, W, H, rx, ry, 9, 6, 0xb8bcc8)
      rect(px, W, H, rx + 2, ry + 2, 1, 1, 0x3ad0ff)
      rect(px, W, H, rx + 6, ry + 2, 1, 1, 0x3ad0ff)
      rect(px, W, H, rx + 4, ry - 2, 1, 2, 0x8a8e98)
      dot(px, W, H, rx + 4, ry - 3, t % 10 < 5 ? 0xff3a3a : 0x5a1a1a)
      const tap = Math.floor(t / 2) % 2
      rect(px, W, H, rx - 3, desk - 2 + tap, 3, 1, 0x8a8e98)
      rect(px, W, H, rx + 9, desk - 1 - tap, 3, 1, 0x8a8e98)
      rect(px, W, H, rx - 2, desk - 1, 13, 1, 0x2a2a30)
    },
  }
}

// --- neural network ---------------------------------------------------------------

const neuralnet: Maker = (W, H, rng) => {
  const layers = [4, 6, 6, 3]
  const pos = layers.map((n, l) => Array.from({ length: n }, (_, i) => [3 + (l * (W - 6)) / (layers.length - 1), 6 + ((i + 0.5) * (H - 12)) / n] as [number, number]))
  const weights = layers.slice(0, -1).map((n, l) => Array.from({ length: n * (layers[l + 1] as number) }, () => rng() * 2 - 1))
  let act = layers.map(n => Array(n).fill(0) as number[])
  let t = 0

  return {
    step() {
      t++
      const phase = t % 80
      if (phase === 0) act[0] = (act[0] as number[]).map(() => rng())
      const l = Math.floor(phase / 20)
      if (phase % 20 === 10 && l < layers.length - 1) {
        const n = layers[l] as number
        const m = layers[l + 1] as number
        act[l + 1] = Array.from({ length: m }, (_, j) => {
          let s = 0
          for (let i = 0; i < n; i++) s += (act[l] as number[])[i]! * (weights[l] as number[])[i * m + j]!
          return 1 / (1 + Math.exp(-s * 2))
        })
      }
      for (let k = 1; k < act.length; k++) if (Math.floor(phase / 20) < k - 1) act[k] = (act[k] as number[]).map(v => v * 0.9)
    },
    draw(px) {
      px.fill(0x0a0a18)
      const phase = t % 80
      for (let l = 0; l < layers.length - 1; l++) {
        const n = layers[l] as number
        const m = layers[l + 1] as number
        const live = Math.floor(phase / 20) === l
        for (let i = 0; i < n; i++)
          for (let j = 0; j < m; j++) {
            const w = (weights[l] as number[])[i * m + j]!
            const a = (act[l] as number[])[i]!
            const [x0, y0] = pos[l]![i]!
            const [x1, y1] = pos[l + 1]![j]!
            const base = w > 0 ? 0x1a3a6a : 0x5a1a2a
            line(px, W, H, x0, y0, x1, y1, live ? mix(base, w > 0 ? 0x6ab0ff : 0xff6a8a, a * Math.abs(w)) : base)
          }
      }
      layers.forEach((n, l) => {
        for (let i = 0; i < n; i++) {
          const [x, y] = pos[l]![i]!
          const a = (act[l] as number[])[i]!
          disc(px, W, H, x, y, 1.6, mix(0x2a2a4a, 0xffe080, a))
        }
      })
    },
  }
}

// --- node_modules black hole ------------------------------------------------------

const nodemodules: Maker = (W, H, rng) => {
  let size = 3
  let t = 0
  let boxes: { x: number; y: number; vx: number; vy: number; c: number }[] = []
  let hole = 0
  let mb = 0

  return {
    step() {
      t++
      const cx = W / 2
      const cy = H / 2
      if (t % 4 === 0) {
        const a = rng() * 6.28
        boxes.push({ x: cx + Math.cos(a) * W, y: cy + Math.sin(a) * H * 0.7, vx: 0, vy: 0, c: hsv(rng(), 0.5, 0.9) })
      }
      for (const b of boxes) {
        const dx = cx - b.x
        const dy = cy - b.y
        const d = Math.hypot(dx, dy) || 1
        const pull = hole ? 0.08 : 0.04
        b.vx = b.vx * 0.95 + (dx / d) * pull + (hole ? (-dy / d) * 0.05 : 0)
        b.vy = b.vy * 0.95 + (dy / d) * pull + (hole ? (dx / d) * 0.05 : 0)
        b.x += b.vx
        b.y += b.vy
      }
      boxes = boxes.filter(b => {
        if (Math.hypot(b.x - cx, b.y - cy) < size) {
          size = Math.min(W * 0.35, size + 0.05)
          mb += 37 + irand(rng, 200)
          return false
        }
        return true
      })
      if (size >= W * 0.35 && !hole) hole = 1
      if (hole) {
        hole++
        if (hole > 200) {
          hole = 0
          size = 3
          mb = 0
        }
      }
    },
    draw(px) {
      px.fill(hole ? 0x05050a : 0x1e1e2a)
      if (hole) for (let k = 0; k < 20; k++) dot(px, W, H, (k * 13 + t) % W, (k * 7) % H, 0x5a5a7a)
      const cx = W / 2
      const cy = H / 2
      if (hole) {
        disc(px, W, H, cx, cy, size + 2, 0x3a2a6a)
        disc(px, W, H, cx, cy, size, 0x000000)
        ring(px, W, H, cx, cy, size + 1, 0xb06aff)
      } else {
        rect(px, W, H, cx - size, cy - size * 0.7, size * 2, size * 1.5, 0xe8b040)
        rect(px, W, H, cx - size, cy - size * 0.7 - 2, size, 2, 0xe8b040)
        rect(px, W, H, cx - size, cy - size * 0.7 + 1, size * 2, 1, 0xf8d070)
      }
      for (const b of boxes) {
        rect(px, W, H, b.x - 1, b.y - 1, 2, 2, b.c)
        dot(px, W, H, b.x - 1, b.y - 1, mix(b.c, 0xffffff, 0.5))
      }
      text(px, W, H, 1, 1, String(Math.min(99999, mb)), 0xffffff)
    },
  }
}

// --- sorting, visualized ---------------------------------------------------------

const tri: Maker = (W, H, rng) => {
  const n = W
  const bw = 1
  let arr: number[] = []
  let marks: number[] = []
  let done = 0
  let algo = Math.floor(rng() * 4)
  const shuffle = () => {
    arr = Array.from({ length: n }, (_, i) => i + 1)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j] as number, arr[i] as number]
    }
  }
  const swap = (i: number, j: number) => {
    ;[arr[i], arr[j]] = [arr[j] as number, arr[i] as number]
  }
  function* bubble() {
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n - 1 - i; j++) {
        marks = [j, j + 1]
        if ((arr[j] as number) > (arr[j + 1] as number)) swap(j, j + 1)
        yield
      }
  }
  function* insertion() {
    for (let i = 1; i < n; i++)
      for (let j = i; j > 0 && (arr[j - 1] as number) > (arr[j] as number); j--) {
        marks = [j - 1, j]
        swap(j - 1, j)
        yield
      }
  }
  function* selection() {
    for (let i = 0; i < n; i++) {
      let m = i
      for (let j = i + 1; j < n; j++) {
        marks = [i, j, m]
        if ((arr[j] as number) < (arr[m] as number)) m = j
        yield
      }
      swap(i, m)
      yield
    }
  }
  function* quick(lo: number, hi: number): Generator<void> {
    if (lo >= hi) return
    const pivot = arr[hi] as number
    let i = lo
    for (let j = lo; j < hi; j++) {
      marks = [j, i, hi]
      if ((arr[j] as number) < pivot) {
        swap(i, j)
        i++
      }
      yield
    }
    swap(i, hi)
    yield
    yield* quick(lo, i - 1)
    yield* quick(i + 1, hi)
  }
  let run: Generator<void> = bubble()
  const start = () => {
    shuffle()
    algo = (algo + 1) % 4
    run = [bubble, insertion, selection, () => quick(0, n - 1)][algo]!()
    done = 0
  }
  start()
  const perFrame = [3, 2, 3, 1]

  return {
    step() {
      if (done > 0) {
        if ((done += 2) > n + 40) start()
        return
      }
      for (let k = 0; k < (perFrame[algo] as number); k++)
        if (run.next().done) {
          marks = []
          done = 1
          break
        }
    },
    draw(px) {
      px.fill(0x0e0e16)
      const hMax = H - 8
      arr.forEach((v, i) => {
        const h = Math.max(1, Math.round((v / n) * hMax))
        let c = hsv(v / n * 0.8, 0.7, 0.95)
        if (marks.includes(i)) c = i === marks[0] ? 0xffffff : 0xff3a3a
        if (done > 0 && i < done) c = mix(c, 0x3aff6a, 0.6)
        rect(px, W, H, i * bw, H - h, bw - (bw > 1 ? 0 : 0), h, c)
      })
      text(px, W, H, 1, 1, String(algo + 1), 0x808090)
    },
  }
}

// --- Matrix rain -----------------------------------------------------------------

const matrix: Maker = (W, H, rng) => {
  const gw = 4
  const gh = 5
  const cols = Math.floor(W / gw)
  const rows = Math.ceil(H / gh)
  const glyphs = Array.from({ length: cols * rows }, () => Math.floor(rng() * 4096))
  const heat = new Float32Array(cols * rows)
  const drops = Array.from({ length: cols }, () => ({ y: -rng() * rows * 2, v: 0.15 + rng() * 0.25 }))

  return {
    step() {
      for (let i = 0; i < heat.length; i++) heat[i] = (heat[i] as number) * 0.95
      drops.forEach((d, c) => {
        d.y += d.v
        const r = Math.floor(d.y)
        if (r >= 0 && r < rows) {
          heat[r * cols + c] = 1
          if (rng() < 0.5) glyphs[r * cols + c] = Math.floor(rng() * 4096)
        }
        if (d.y > rows + 8) {
          d.y = -rng() * 10
          d.v = 0.15 + rng() * 0.25
        }
      })
      for (let k = 0; k < 3; k++) glyphs[Math.floor(rng() * glyphs.length)] = Math.floor(rng() * 4096)
    },
    draw(px) {
      px.fill(0x000000)
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++) {
          const h = heat[r * cols + c] as number
          if (h < 0.04) continue
          const isHead = h > 0.97
          const col = isHead ? 0xd8ffd8 : mix(0x002a08, 0x2aff5a, h)
          const g = glyphs[r * cols + c] as number
          for (let j = 0; j < 4; j++) for (let i = 0; i < 3; i++) if ((g >> (j * 3 + i)) & 1) dot(px, W, H, c * gw + i, r * gh + j, col)
        }
    },
  }
}

export const DEV = {
  tri,
  matrix,
  stuck99,
  gittree,
  mergeconflict,
  cipipeline,
  stackoverflow,
  whackabug,
  serverrack,
  spinners,
  packets,
  gc,
  memleak,
  rubberduck,
  pipes,
  toasters,
  defrag,
  tests,
  robotcoder,
  neuralnet,
  nodemodules,
}

