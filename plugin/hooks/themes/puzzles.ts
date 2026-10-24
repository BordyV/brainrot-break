import { dot, hsv, mix, rect, sky, text } from '../draw'
import type { Maker, Rng } from '../draw'
import { DIRS, burst, ellipse, hash, irand, lit, litSprite, shuffle, slab, sparks, textWidth, tint, tones } from '../kit'
import type { Spark } from '../kit'

// Puzzles & logic: puzzles that solve themselves, one move at a time.

// --- Tower of Hanoi ---------------------------------------------------------------

const hanoi: Maker = (W, H, rng) => {
  const gap = W / 3
  const n = Math.max(2, Math.min(5, Math.floor(gap / 2)))
  const dh = Math.max(1, Math.min(3, Math.floor((H * 0.4) / n)))
  const baseY = Math.round(H * 0.8)
  const pegTop = baseY - (n + 2) * dh
  const pegX = (p: number) => Math.round(gap * (p + 0.5))
  const width = (d: number) => Math.max(2, Math.round(((d + 1) / n) * (gap - 1)))
  const hue0 = rng()

  let pegs: number[][] = []
  let moves: [number, number][] = []
  let from = 0
  const plan = (k: number, a: number, b: number, c: number) => {
    if (k === 0) return
    plan(k - 1, a, c, b)
    moves.push([a, c])
    plan(k - 1, b, a, c)
  }
  const reset = (start: number) => {
    from = start
    const to = (start + 2) % 3
    pegs = [[], [], []]
    for (let d = n - 1; d >= 0; d--) pegs[start].push(d)
    moves = []
    plan(n, start, 3 - start - to, to)
  }
  reset(0)

  // the disc in flight: lift, slide, drop
  const STEP = n > 5 ? 7 : 10
  let m = 0
  let t = 0
  let held = -1
  let hx = 0
  let hy = 0
  let pause = 30
  let fx: Spark[] = []

  return {
    step() {
      fx = sparks(fx, 0.04)
      if (pause > 0) {
        pause--
        if (pause === 0 && m >= moves.length) {
          reset((from + 2) % 3)
          m = 0
          pause = 20
        }
        return
      }
      const [a, b] = moves[m]
      if (t === 0) held = pegs[a].pop() as number
      t++
      const k = t / STEP
      const ya = baseY - (pegs[a].length + 1) * dh
      const yb = baseY - (pegs[b].length + 1) * dh
      const lift = pegTop - dh * 2
      if (k < 0.33) {
        hx = pegX(a)
        hy = ya + (lift - ya) * (k / 0.33)
      } else if (k < 0.66) {
        hx = pegX(a) + (pegX(b) - pegX(a)) * ((k - 0.33) / 0.33)
        hy = lift
      } else {
        hx = pegX(b)
        hy = lift + (yb - lift) * Math.min(1, (k - 0.66) / 0.34)
      }
      if (t >= STEP) {
        pegs[b].push(held)
        held = -1
        t = 0
        m++
        if (m >= moves.length) {
          pause = 60
          for (let i = 0; i < 3; i++) burst(fx, rng, pegX(b), baseY - n * dh - 2, hsv(hue0 + i * 0.3, 0.6, 1), 10, 1.2)
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x1a1428, 0x2e2240)
      ellipse(px, W, H, W / 2, baseY, W * 0.7, H * 0.35, 0x2a2040)
      // a wooden table with grain, pegs with a lit side and a foot
      rect(px, W, H, 0, baseY, W, H - baseY, 0x6a4428)
      rect(px, W, H, 0, baseY, W, 1, 0x9a6a3e)
      rect(px, W, H, 0, baseY + 1, W, 1, 0x56361e)
      for (let y = baseY + 3; y < H; y += 3) rect(px, W, H, (y * 7) % 9, y, W * 0.5, 1, 0x5e3c22)
      for (let p = 0; p < 3; p++) {
        rect(px, W, H, pegX(p), pegTop, 1, baseY - pegTop, 0xd8b07a)
        rect(px, W, H, pegX(p) + 1, pegTop, 1, baseY - pegTop, 0x8a6438)
        rect(px, W, H, pegX(p) - 1, baseY - 1, 4, 1, 0x7a5430)
      }
      // a disc: a lit top row, the colour, a shaded bottom row, rounded ends
      const disc = (d: number, x: number, y: number) => {
        const w = width(d)
        const [hi, base, sh, deep] = tones(hsv(hue0 + (d / n) * 0.8, 0.6, 0.95))
        const x0 = Math.round(x - (w - 1) / 2)
        rect(px, W, H, x0, y, w, dh, base)
        if (dh > 1) {
          rect(px, W, H, x0 + 1, y, w - 2, 1, hi)
          rect(px, W, H, x0, y + dh - 1, w, 1, sh)
          rect(px, W, H, x0 + w - 1, y, 1, dh, sh)
          rect(px, W, H, x0 + 1, y + dh - 1, w - 2, 1, deep)
          if (w > 3) rect(px, W, H, x0, y, 1, 1, sh)
        }
      }
      for (let p = 0; p < 3; p++) pegs[p].forEach((d, i) => disc(d, pegX(p), baseY - (i + 1) * dh))
      if (held >= 0) disc(held, Math.round(hx), Math.round(hy))
      // the move count, out of the best possible
      const total = String(moves.length)
      text(px, W, H, 1, 1, String(Math.min(m, moves.length)), 0xffffff)
      if (W >= 24) text(px, W, H, W - 1 - textWidth('/' + total), 1, '/' + total, 0x8a7aa8)
      for (const s of fx) rect(px, W, H, s.x, s.y, 1, 1, s.c)
    },
  }
}

const ease = (k: number) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k))
const neighbours = (i: number, cols: number, rows: number) =>
  DIRS.map(([dx, dy]) => [(i % cols) + dx, Math.floor(i / cols) + dy]).filter(([x, y]) => x >= 0 && y >= 0 && x < cols && y < rows).map(([x, y]) => y * cols + x)

// --- sudoku solver ----------------------------------------------------------------

// The digits are colours: a cell is two pixels wide, where a digit can't be read.
const DIGITS = [0xe84a4a, 0xf08a2a, 0xf0d040, 0x6ac84a, 0x2ab0a0, 0x3a8ae8, 0x7a5ae0, 0xd05ac8, 0x9a6a44]

const sudoku: Maker = (W, H, rng) => {
  const p = Math.max(2, Math.floor((W - 2) / 9))
  const size = p * 9 + 1
  const ox = Math.floor((W - size) / 2)
  const oy = Math.max(7, Math.round(H * 0.4 - size / 2))
  const grid = new Int8Array(81)
  const given = new Uint8Array(81)
  const flash = new Uint8Array(81)
  let order: number[] = []
  let k = 0
  let cur = -1
  let t = 0
  let hold = 0
  let fx: Spark[] = []

  const ok = (i: number, d: number) => {
    const r = Math.floor(i / 9)
    const c = i % 9
    for (let j = 0; j < 9; j++) if (grid[r * 9 + j] === d || grid[j * 9 + c] === d) return false
    const br = r - (r % 3)
    const bc = c - (c % 3)
    for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) if (grid[(br + a) * 9 + bc + b] === d) return false
    return true
  }
  const fill = (i: number): boolean => {
    if (i === 81) return true
    for (const d of shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (!ok(i, d)) continue
      grid[i] = d
      if (fill(i + 1)) return true
      grid[i] = 0
    }
    return false
  }
  const reset = () => {
    grid.fill(0)
    fill(0)
    given.fill(1)
    for (const i of shuffle(rng, [...Array(81).keys()]).slice(0, 46)) {
      grid[i] = 0
      given[i] = 0
    }
    // the cells with the fewest candidates first, as a person would start
    const cand = (i: number) => {
      let n = 0
      for (let d = 1; d <= 9; d++) if (ok(i, d)) n++
      return n
    }
    order = [...Array(81).keys()].filter(i => !given[i]).sort((a, b) => cand(a) - cand(b) || a - b)
    k = 0
    t = 0
    cur = -1
  }
  reset()

  // one try: the next digit that fits in this cell, or back to the cell before
  const act = () => {
    const i = order[k]
    cur = i
    let d = grid[i] + 1
    grid[i] = 0
    while (d <= 9 && !ok(i, d)) d++
    if (d <= 9) {
      grid[i] = d
      k++
    } else {
      flash[i] = 5
      k--
    }
  }

  return {
    step() {
      fx = sparks(fx, 0.04)
      for (let i = 0; i < 81; i++) if (flash[i]) flash[i]--
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      t++
      // calm at first, then it hurries when the backtracking drags on
      const n = t < 100 ? t % 2 : 1 + Math.floor((t - 100) / 80)
      for (let j = 0; j < n && k < order.length; j++) act()
      if (k >= order.length) {
        hold = 80
        cur = -1
        for (let j = 0; j < 4; j++) burst(fx, rng, ox + size / 2, oy + size / 2, DIGITS[irand(rng, 9)], 10, 1.3)
      }
    },
    draw(px) {
      sky(px, W, H, 0x262c40, 0x12151f)
      // the paper, its thin lines, and the darker lines of the boxes
      rect(px, W, H, ox + 1, oy + 1, size, size, 0x0a0c14)
      rect(px, W, H, ox, oy, size, size, 0xb8b0a0)
      for (let j = 0; j <= 9; j += 3) {
        rect(px, W, H, ox + j * p, oy, 1, size, 0x4a4438)
        rect(px, W, H, ox, oy + j * p, size, 1, 0x4a4438)
      }
      const wave = hold > 0 ? (80 - hold) * 0.5 : -99
      const count = new Array(10).fill(0)
      for (let i = 0; i < 81; i++) {
        const r = Math.floor(i / 9)
        const c = i % 9
        const x = ox + 1 + c * p
        const y = oy + 1 + r * p
        let bg = given[i] ? 0xd8d0be : 0xf6f1e6
        if (flash[i]) bg = 0xf07070
        const d = grid[i]
        if (d) {
          count[d]++
          const [hi, base, sh] = tones(DIGITS[d - 1])
          rect(px, W, H, x, y, p - 1, p - 1, given[i] ? sh : base)
          if (p >= 3) dot(px, W, H, x, y, given[i] ? base : hi)
        } else rect(px, W, H, x, y, p - 1, p - 1, bg)
        if (Math.abs(r + c - wave) < 1) rect(px, W, H, x, y, p - 1, p - 1, 0xfff6c8)
      }
      // the cell it is trying
      if (cur >= 0) {
        const x = ox + (cur % 9) * p
        const y = oy + Math.floor(cur / 9) * p
        const c = flash[cur] ? 0xff4040 : 0xff9a20
        rect(px, W, H, x, y, p + 1, 1, c)
        rect(px, W, H, x, y + p, p + 1, 1, c)
        rect(px, W, H, x, y, 1, p + 1, c)
        rect(px, W, H, x + p, y, 1, p + 1, c)
      }
      // the colours, lit once all nine of one are placed
      const ly = oy + size + 3
      for (let d = 1; d <= 9; d++) {
        const x = ox + 1 + (d - 1) * p
        const done = count[d] === 9
        slab(px, W, H, x, ly, p - 1, p, done ? DIGITS[d - 1] : mix(DIGITS[d - 1], 0x1a1e2a, 0.65))
      }
      // a pencil lying by the grid
      const py = Math.min(H - 6, ly + p + 6)
      rect(px, W, H, ox + 4, py, size - 10, 2, 0xf0c040)
      rect(px, W, H, ox + 4, py + 1, size - 10, 1, 0xb88a20)
      rect(px, W, H, ox + size - 6, py, 2, 2, 0xe8b8a0)
      dot(px, W, H, ox + size - 4, py, 0x4a3a30)
      rect(px, W, H, ox + 2, py, 2, 2, 0xe87a8a)
      let filled = 0
      for (let i = 0; i < 81; i++) if (grid[i]) filled++
      text(px, W, H, 1, 1, String(filled), 0xffffff)
      if (W >= 24) text(px, W, H, W - 1 - textWidth('/81'), 1, '/81', 0x7a8aa8)
      for (const s of fx) rect(px, W, H, s.x, s.y, 1, 1, s.c)
    },
  }
}

// --- sliding 15-puzzle -------------------------------------------------------------

// The pictures the tiles make, drawn once a round on a B x B canvas.
function sunsetPicture(B: number, rng: Rng): Uint32Array {
  const pic = new Uint32Array(B * B)
  const hue = rng()
  const horizon = Math.round(B * 0.62)
  sky(pic, B, B, hsv(0.7 + hue * 0.15, 0.6, 0.45), hsv(0.06, 0.75, 1), horizon)
  const sx = B * (0.35 + rng() * 0.3)
  const sy = B * 0.44
  for (let r = 0; r < 3; r++) for (let x = 0; x < B; x++) for (let y = 0; y < horizon; y++) {
    const d = Math.hypot(x - sx, y - sy)
    if (d < B * 0.17) pic[y * B + x] = 0xfff0a0
    else if (r === 0 && d < B * 0.24) pic[y * B + x] = mix(pic[y * B + x], 0xffd070, 0.4)
  }
  const ph = rng() * 6
  for (let x = 0; x < B; x++) {
    const far = B * 0.46 + Math.sin(x * 0.4 + ph) * B * 0.07 + Math.sin(x * 1.1) * B * 0.02
    const near = B * 0.56 + Math.sin(x * 0.27 + ph * 2) * B * 0.06
    for (let y = Math.round(far); y < horizon; y++) pic[y * B + x] = y < far + 1.5 ? 0x8a5a9a : 0x6a4080
    for (let y = Math.round(near); y < horizon; y++) pic[y * B + x] = y < near + 1.5 ? 0x5a3a6a : 0x3a2450
  }
  // the lake: the sky upside down, darker, with a path of light under the sun
  for (let y = horizon; y < B; y++)
    for (let x = 0; x < B; x++) {
      const m = pic[(2 * horizon - y - 1) * B + x]
      pic[y * B + x] = (y + Math.round(x / 3)) % 3 === 0 && Math.abs(x - sx) < B * 0.12 ? 0xffe0a0 : mix(m, 0x1a2a5a, 0.45)
    }
  return pic
}

function planetPicture(B: number, rng: Rng): Uint32Array {
  const pic = new Uint32Array(B * B)
  sky(pic, B, B, 0x0a0820, 0x1a1040)
  for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) if (hash(x, y, 7) < 0.04) pic[y * B + x] = hash(x, y, 8) < 0.5 ? 0xffffff : 0x8a9ae0
  const cx = B * 0.5
  const cy = B * 0.52
  const R = B * 0.27
  const hue = rng()
  const ringPx = (front: boolean) => {
    for (let k = 0; k < 160; k++) {
      const a = (k / 160) * Math.PI * 2
      if (Math.sin(a) > 0 !== front) continue
      for (const rr of [1.55, 1.75]) dot(pic, B, B, cx + Math.cos(a) * R * rr, cy + Math.sin(a) * R * rr * 0.32, rr > 1.6 ? 0xd8c090 : 0xf0dca8)
    }
  }
  ringPx(false)
  lit(pic, B, B, cx, cy, R, R, hsv(hue, 0.55, 0.85), hsv(hue, 0.6, 0.3))
  for (let y = Math.round(cy - R); y < cy + R; y++)
    if (Math.floor(y / 3) % 2) for (let x = Math.round(cx - R); x < cx + R; x++) if (Math.hypot(x - cx, y - cy) < R - 1) pic[y * B + x] = mix(pic[y * B + x], hsv(hue + 0.08, 0.6, 0.6), 0.35)
  ringPx(true)
  disc(pic, B, B, B * 0.18, B * 0.2, B * 0.07, 0xd8d8e0)
  dot(pic, B, B, B * 0.17, B * 0.19, 0xffffff)
  return pic
}

function disc(px: Uint32Array, W: number, H: number, cx: number, cy: number, r: number, c: number) {
  for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if ((x - cx) ** 2 + (y - cy) ** 2 <= r * r) dot(px, W, H, x, y, c)
}

const slide15: Maker = (W, H, rng) => {
  const n = 4
  const s = Math.max(2, Math.floor(Math.min(W - 4, H - 18) / n))
  const B = n * s
  const ox = Math.floor((W - B) / 2)
  const oy = 9
  const pos: number[] = []
  let pic = new Uint32Array(B * B)
  let empties: number[] = []
  let phase: 'show' | 'pop' | 'shuffle' | 'solve' | 'done' = 'show'
  let t = 0
  let j = 0
  let moves = 0
  let round = 0
  let slide: { tile: number; from: number; to: number; k: number; dur: number } | null = null
  let fx: Spark[] = []

  const reset = () => {
    pic = round++ % 2 ? planetPicture(B, rng) : sunsetPicture(B, rng)
    pos.length = 0
    for (let i = 0; i < 16; i++) pos.push(i)
    // the shuffle is a walk of the hole; the solve walks it back
    empties = [15]
    let prev = -1
    for (let m = 0; m < 34; m++) {
      const e = empties[empties.length - 1]
      const opts = neighbours(e, n, n).filter(q => q !== prev)
      prev = e
      empties.push(opts[irand(rng, opts.length)])
    }
    phase = 'show'
    t = 0
    j = 0
    moves = 0
  }
  reset()

  const start = (from: number, to: number, dur: number) => {
    slide = { tile: pos[from], from, to, k: 0, dur }
  }

  return {
    step() {
      fx = sparks(fx, 0.04)
      t++
      if (slide) {
        if (++slide.k >= slide.dur) {
          pos[slide.to] = slide.tile
          pos[slide.from] = 15
          slide = null
        }
        return
      }
      if (phase === 'show' && t > 30) {
        phase = 'pop'
        t = 0
      } else if (phase === 'pop' && t > 10) {
        phase = 'shuffle'
        pos[15] = 15
      } else if (phase === 'shuffle') {
        if (j < empties.length - 1) {
          start(empties[j + 1], empties[j], 2)
          j++
        } else if (t > 2) {
          phase = 'solve'
          t = -12
        }
      } else if (phase === 'solve' && t > 0) {
        if (j > 0) {
          start(empties[j - 1], empties[j], 5)
          j--
          moves++
        } else {
          phase = 'done'
          t = 0
          for (let i = 0; i < 4; i++) burst(fx, rng, ox + B - s / 2, oy + B - s / 2, hsv(i * 0.25, 0.5, 1), 8, 1.2)
        }
      } else if (phase === 'done' && t > 60) reset()
    },
    draw(px) {
      sky(px, W, H, 0x2a2238, 0x141020)
      // the plastic frame
      slab(px, W, H, ox - 2, oy - 2, B + 4, B + 4, 0x3a3a4a, 0x1a1a24)
      rect(px, W, H, ox, oy, B, B, 0x120e16)
      const tile = (id: number, x: number, y: number) => {
        const sx = (id % n) * s
        const sy = Math.floor(id / n) * s
        for (let v = 0; v < s; v++)
          for (let u = 0; u < s; u++) {
            let c = pic[(sy + v) * B + sx + u]
            if (phase !== 'done' || t < 8) {
              if (u === 0 || v === 0) c = mix(c, 0xffffff, 0.3)
              else if (u === s - 1 || v === s - 1) c = mix(c, 0x100818, 0.4)
            }
            dot(px, W, H, x + u, y + v, c)
          }
      }
      for (let i = 0; i < 16; i++) {
        const id = pos[i]
        if (id === 15 && phase !== 'show' && phase !== 'done') continue
        if (slide && i === slide.from) continue
        tile(id, ox + (i % n) * s, oy + Math.floor(i / n) * s)
      }
      if (slide) {
        const k = ease(slide.k / slide.dur)
        const fx0 = (slide.from % n) * s
        const fy0 = Math.floor(slide.from / n) * s
        const tx = (slide.to % n) * s
        const ty = Math.floor(slide.to / n) * s
        tile(slide.tile, Math.round(ox + fx0 + (tx - fx0) * k), Math.round(oy + fy0 + (ty - fy0) * k))
      }
      // the corner piece lifts out before the shuffle
      if (phase === 'pop') tile(15, ox + 3 * s + t, oy + 3 * s + Math.round(t * 1.5))
      // the picture to make, small, under the board
      const T = Math.min(14, H - (oy + B + 5) - 2)
      if (T >= 6) {
        const tx = Math.floor((W - T) / 2)
        const ty = oy + B + 5
        slab(px, W, H, tx - 1, ty - 1, T + 2, T + 2, 0x3a3a4a, 0x1a1a24)
        for (let v = 0; v < T; v++) for (let u = 0; u < T; u++) dot(px, W, H, tx + u, ty + v, pic[Math.floor((v * B) / T) * B + Math.floor((u * B) / T)])
      }
      if (phase === 'shuffle' || phase === 'solve') text(px, W, H, 1, 1, String(moves), 0xffffff)
      for (const sp of fx) rect(px, W, H, sp.x, sp.y, 1, 1, sp.c)
    },
  }
}

// --- flow connect ------------------------------------------------------------------

const FLOWS = [0xe8343a, 0x2a6ae8, 0x2ab84a, 0xf0d02a, 0xf0861a, 0x3ad0e0, 0xd040c8, 0x9a4a2a]

const flow: Maker = (W, H, rng) => {
  const n = W >= 26 ? 6 : 5
  const c = Math.max(2, Math.floor((W - 2) / n))
  const B = n * c
  const ox = Math.floor((W - B) / 2)
  const oy = Math.max(8, Math.round(H * 0.5 - B / 2))
  let paths: number[][] = []
  let colours: number[] = []
  let drawn: number[] = []
  let queue: number[] = []
  let t = 0
  let hold = 0
  let fx: Spark[] = []

  const build = () => {
    // a random path through every cell (a snake, then many backbite moves), cut into flows
    let path: number[] = []
    for (let r = 0; r < n; r++) for (let q = 0; q < n; q++) path.push(r * n + (r % 2 ? n - 1 - q : q))
    for (let it = 0; it < 700; it++) {
      if (rng() < 0.5) path.reverse()
      const end = path[path.length - 1]
      const opts = neighbours(end, n, n).filter(q => q !== path[path.length - 2])
      const idx = path.indexOf(opts[irand(rng, opts.length)])
      path = path.slice(0, idx + 1).concat(path.slice(idx + 1).reverse())
    }
    const k = n === 6 ? 6 + irand(rng, 2) : 5
    const lens = new Array(k).fill(3)
    for (let left = n * n - 3 * k; left > 0; left--) lens[irand(rng, k)]++
    paths = []
    let at = 0
    for (const l of lens) {
      const p = path.slice(at, at + l)
      paths.push(rng() < 0.5 ? p.reverse() : p)
      at += l
    }
    colours = shuffle(rng, FLOWS.slice()).slice(0, k)
    drawn = paths.map(() => 1)
    queue = shuffle(rng, paths.map((_, i) => i))
    t = 0
  }
  build()

  return {
    step() {
      fx = sparks(fx, 0.04)
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      t++
      const q = queue[0]
      if (q === undefined) return
      if (t % 3 === 0) {
        if (drawn[q] < paths[q].length) drawn[q]++
        else if (t % 12 === 0) {
          queue.shift()
          const end = paths[q][paths[q].length - 1]
          burst(fx, rng, ox + (end % n) * c + c / 2, oy + Math.floor(end / n) * c + c / 2, colours[q], 6, 0.8)
          if (!queue.length) hold = 60
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x181a2c, 0x0a0a14)
      slab(px, W, H, ox - 1, oy - 1, B + 2, B + 2, 0x30324a, 0x1a1a2a)
      const owner = new Int8Array(n * n).fill(-1)
      paths.forEach((p, i) => {
        for (let j = 0; j < drawn[i]; j++) owner[p[j]] = i
      })
      for (let i = 0; i < n * n; i++) {
        const x = ox + (i % n) * c
        const y = oy + Math.floor(i / n) * c
        rect(px, W, H, x, y, c, c, 0x2a2c40)
        const bg = owner[i] >= 0 ? mix(colours[owner[i]], 0x0c0c18, hold > 0 && hold % 20 > 10 ? 0.45 : 0.68) : 0x0e0e1a
        rect(px, W, H, x, y, c - 1, c - 1, bg)
      }
      const w = c >= 5 ? 3 : 1
      const off = Math.floor((c - w) / 2)
      const centre = (i: number): [number, number] => [ox + (i % n) * c + off, oy + Math.floor(i / n) * c + off]
      paths.forEach((p, i) => {
        const [hi, base, sh] = tones(colours[i])
        for (let j = 0; j + 1 < drawn[i]; j++) {
          const [x0, y0] = centre(p[j])
          const [x1, y1] = centre(p[j + 1])
          const x = Math.min(x0, x1)
          const y = Math.min(y0, y1)
          const ww = Math.abs(x1 - x0) + w
          const hh = Math.abs(y1 - y0) + w
          rect(px, W, H, x, y, ww, hh, base)
          if (w > 1) {
            if (y0 === y1) {
              rect(px, W, H, x, y, ww, 1, hi)
              rect(px, W, H, x, y + w - 1, ww, 1, sh)
            } else {
              rect(px, W, H, x, y, 1, hh, hi)
              rect(px, W, H, x + w - 1, y, 1, hh, sh)
            }
          }
        }
        for (const e of [p[0], p[p.length - 1]]) {
          const x = ox + (e % n) * c + (c - 1) / 2
          const y = oy + Math.floor(e / n) * c + (c - 1) / 2
          lit(px, W, H, x, y, c * 0.42, c * 0.42, colours[i], tones(colours[i])[3])
        }
      })
      let done = 0
      for (let i = 0; i < paths.length; i++) if (drawn[i] === paths[i].length) done++
      text(px, W, H, 1, 1, `${done}/${paths.length}`, 0xffffff)
      let full = 0
      for (let i = 0; i < n * n; i++) if (owner[i] >= 0) full++
      const pct = `${Math.round((full / (n * n)) * 100)}%`
      if (W >= 28) text(px, W, H, W - 1 - textWidth(pct), 1, pct, 0x8a8ab8)
      for (const s of fx) rect(px, W, H, s.x, s.y, 1, 1, s.c)
    },
  }
}

// --- pipe rotation puzzle ------------------------------------------------------------

// A tile's openings: 1 up, 2 right, 4 down, 8 left.
const turnMask = (m: number) => ((m << 1) | (m >> 3)) & 15
const bitOf = (dx: number, dy: number) => (dx > 0 ? 2 : dx < 0 ? 8 : dy > 0 ? 4 : 1)

const pipeturn: Maker = (W, H, rng) => {
  const cols = 4
  const rows = 7
  const c = Math.max(3, Math.min(Math.floor((W - 8) / cols), Math.floor((H - 14) / rows)))
  const gw = cols * c
  const gh = rows * c
  const ox = Math.floor((W - gw) / 2)
  const oy = Math.max(8, Math.round((H - gh) / 2) + 1)
  const base = new Uint8Array(cols * rows)
  const rot = new Uint8Array(cols * rows)
  let path: number[] = []
  let r0 = 0
  let r1 = 0
  let fix = 0
  let spin = 0
  let wet = 0
  let t = 0
  let hold = 0
  let drops: Spark[] = []

  const shown = (i: number) => {
    let m = base[i]
    for (let k = 0; k < rot[i]; k++) m = turnMask(m)
    return m
  }
  const build = () => {
    for (;;) {
      r0 = irand(rng, rows)
      r1 = irand(rng, rows)
      const seen = new Uint8Array(cols * rows)
      let calls = 0
      const go = (i: number, acc: number[]): number[] | null => {
        if (++calls > 4000) return null
        acc.push(i)
        seen[i] = 1
        if (i % cols === cols - 1 && Math.floor(i / cols) === r1 && acc.length >= 9) return acc
        for (const q of shuffle(rng, neighbours(i, cols, rows))) {
          if (seen[q]) continue
          const r = go(q, acc)
          if (r) return r
        }
        acc.pop()
        seen[i] = 0
        return null
      }
      const p = go(r0 * cols, [])
      if (p && p.length <= 16) {
        path = p
        break
      }
    }
    for (let i = 0; i < cols * rows; i++) {
      base[i] = [5, 3, 7, 3][irand(rng, 4)]
      rot[i] = irand(rng, 4)
    }
    path.forEach((i, j) => {
      const prev = j > 0 ? path[j - 1] : i - 1
      const next = j < path.length - 1 ? path[j + 1] : i + 1
      base[i] = bitOf((prev % cols) - (i % cols) || (j === 0 ? -1 : 0), Math.floor(prev / cols) - Math.floor(i / cols)) | bitOf((next % cols) - (i % cols) || (j === path.length - 1 ? 1 : 0), Math.floor(next / cols) - Math.floor(i / cols))
      if (rng() < 0.85) rot[i] = 1 + irand(rng, 3)
    })
    fix = 0
    spin = 0
    wet = 0
    t = 0
  }
  build()

  return {
    step() {
      drops = sparks(drops, 0.12)
      if (hold > 0) {
        if (hold % 3 === 0) drops.push({ x: ox + gw + 2, y: oy + r1 * c + c / 2 + 1, vx: 0.4 + rng() * 0.3, vy: 0, l: 20, c: 0x5ac8ff })
        if (--hold === 0) build()
        return
      }
      t++
      if (fix < path.length) {
        const i = path[fix]
        if (shown(i) === base[i]) {
          fix++
          return
        }
        if (++spin >= 6) {
          spin = 0
          rot[i] = (rot[i] + 1) % 4
        }
      } else if (t % 4 === 0) {
        wet++
        if (wet > path.length + 1) hold = 70
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a3040, 0x161a22)
      // a brick wall behind
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) if (y % 4 === 3 || (x + (Math.floor(y / 4) % 2) * 3) % 6 === 0) px[y * W + x] = mix(px[y * W + x], 0x0a0c12, 0.35)
      slab(px, W, H, ox - 1, oy - 1, gw + 2, gh + 2, 0x4a5060, 0x1a1e26)
      const pipe = (x: number, y: number, m: number, water: boolean) => {
        const cx = x + Math.floor(c / 2) - 1
        const cy = y + Math.floor(c / 2) - 1
        const half = Math.floor(c / 2) + 1
        const seg = (sx: number, sy: number, w: number, h: number, horiz: boolean) => {
          rect(px, W, H, sx, sy, w, h, 0xc87a3a)
          if (horiz) rect(px, W, H, sx, sy, w, 1, 0xf0b070)
          else rect(px, W, H, sx, sy, 1, h, 0xf0b070)
          if (water) rect(px, W, H, horiz ? sx : sx + 1, horiz ? sy + 1 : sy, horiz ? w : 1, horiz ? 1 : h, 0x3ab0f0)
        }
        if (m & 1) seg(cx, y, 2, half, false)
        if (m & 4) seg(cx, cy, 2, c - (cy - y), false)
        if (m & 8) seg(x, cy, half, 2, true)
        if (m & 2) seg(cx, cy, c - (cx - x), 2, true)
        rect(px, W, H, cx, cy, 2, 2, 0xb06a30)
        if (water) dot(px, W, H, cx + 1, cy + 1, 0x3ab0f0)
      }
      for (let i = 0; i < cols * rows; i++) {
        const x = ox + (i % cols) * c
        const y = oy + Math.floor(i / cols) * c
        const busy = fix < path.length && path[fix] === i
        slab(px, W, H, x, y, c, c, busy ? 0x6a7488 : 0x3a4250)
        const j = path.indexOf(i)
        pipe(x, y, shown(i), j >= 0 && j < wet)
        if (busy && spin < 2) tint(px, W, H, x + c / 2, y + c / 2, 0xffffff, 0.6)
      }
      // the tap on the left, the drain on the right
      const ty = oy + r0 * c + Math.floor(c / 2) - 1
      rect(px, W, H, 0, ty, ox, 2, 0x9aa0b0)
      rect(px, W, H, 0, ty, ox, 1, 0xd0d4de)
      if (wet > 0) rect(px, W, H, 0, ty + 1, ox, 1, 0x3ab0f0)
      lit(px, W, H, Math.max(1, ox - 2), ty - 2, 1.6, 1.6, 0xd03a3a, 0x5a1010)
      const dy = oy + r1 * c + Math.floor(c / 2) - 1
      rect(px, W, H, ox + gw, dy, W - ox - gw, 2, 0x9aa0b0)
      rect(px, W, H, ox + gw, dy, W - ox - gw, 1, 0xd0d4de)
      if (wet > path.length) rect(px, W, H, ox + gw, dy + 1, W - ox - gw, 1, 0x3ab0f0)
      for (const d of drops) dot(px, W, H, d.x, d.y, d.c)
      text(px, W, H, 1, 1, `${Math.min(fix, path.length)}/${path.length}`, 0xffffff)
    },
  }
}

// --- jigsaw --------------------------------------------------------------------------

function sunflowerPicture(B: number, rng: Rng): Uint32Array {
  const pic = new Uint32Array(B * B)
  sky(pic, B, B, 0x4a9ae0, 0xb8e4f8)
  const cx = B * (0.42 + rng() * 0.16)
  const cy = B * 0.36
  const R = B * 0.13
  ellipse(pic, B, B, B * 0.5, B * 1.05, B * 0.8, B * 0.3, 0x4aa040)
  ellipse(pic, B, B, B * 0.5, B * 1.06, B * 0.8, B * 0.28, 0x3a8a34)
  rect(pic, B, B, cx - 0.5, cy, 2, B, 0x3a8a2a)
  lit(pic, B, B, cx + B * 0.12, cy + B * 0.35, B * 0.1, B * 0.05, 0x4ab03a)
  lit(pic, B, B, cx - B * 0.1, cy + B * 0.5, B * 0.1, B * 0.05, 0x4ab03a)
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2
    lit(pic, B, B, cx + Math.cos(a) * R * 1.55, cy + Math.sin(a) * R * 1.55, R * 0.55, R * 0.55, 0xf8c820)
  }
  lit(pic, B, B, cx, cy, R, R, 0x7a4a22, 0x3a2010)
  for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) if (Math.hypot(x - cx, y - cy) < R - 1 && hash(x, y, 3) < 0.3) pic[y * B + x] = 0x4a2a14
  ellipse(pic, B, B, B * 0.8, B * 0.12, B * 0.12, B * 0.05, 0xf8fcff)
  ellipse(pic, B, B, B * 0.15, B * 0.2, B * 0.09, B * 0.04, 0xf0f8ff)
  return pic
}

function balloonPicture(B: number, rng: Rng): Uint32Array {
  const pic = new Uint32Array(B * B)
  sky(pic, B, B, 0xf08a6a, 0xfce0a0)
  for (let x = 0; x < B; x++) {
    const h = B * 0.8 + Math.sin(x * 0.3 + rng()) * B * 0.05
    for (let y = Math.round(h); y < B; y++) pic[y * B + x] = y < h + 1.5 ? 0x6a9a4a : 0x4a7a3a
  }
  const cx = B * 0.5
  const cy = B * 0.38
  const R = B * 0.28
  const hue = rng()
  lit(pic, B, B, cx, cy, R * 0.9, R, hsv(hue, 0.7, 0.9), hsv(hue, 0.8, 0.35))
  for (let y = Math.round(cy - R); y < cy + R; y++)
    for (let x = Math.round(cx - R); x < cx + R; x++) {
      const inside = ((x - cx) / (R * 0.9)) ** 2 + ((y - cy) / R) ** 2 < 0.85
      if (inside && Math.floor(((x - cx) / (R * 0.9)) * 3 + 10) % 2 === 0) pic[y * B + x] = mix(pic[y * B + x], 0xfff4e0, 0.6)
    }
  rect(pic, B, B, cx - B * 0.06, cy + R + 2, B * 0.12 + 1, B * 0.07, 0x8a5a2a)
  rect(pic, B, B, cx - B * 0.06, cy + R + 2, B * 0.12 + 1, 1, 0xb88050)
  dot(pic, B, B, cx - B * 0.07, cy + R + 1, 0x4a3020)
  dot(pic, B, B, cx + B * 0.07, cy + R + 1, 0x4a3020)
  ellipse(pic, B, B, B * 0.15, B * 0.15, B * 0.1, B * 0.04, 0xfff8f0)
  return pic
}

const jigsaw: Maker = (W, H, rng) => {
  const n = 4
  const s = Math.max(3, Math.floor(Math.min(W - 4, H * 0.55) / n))
  const B = n * s
  const ox = Math.floor((W - B) / 2)
  const oy = 7
  const owner = new Int8Array(B * B)
  let pic = new Uint32Array(B * B)
  type Piece = { x: number; y: number; placed: boolean }
  let pieces: Piece[] = []
  let queue: number[] = []
  let fly = -1
  let ft = 0
  let fromX = 0
  let fromY = 0
  let hold = 0
  let round = 0
  let fx: Spark[] = []

  const build = () => {
    pic = round++ % 2 ? balloonPicture(B, rng) : sunflowerPicture(B, rng)
    for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) owner[y * B + x] = Math.floor(y / s) * n + Math.floor(x / s)
    // the knobs: two pixels pushed into the next piece, in or out at random
    if (s >= 5) {
      const mid = Math.floor(s / 2) - 1
      for (let r = 0; r < n; r++)
        for (let q = 0; q < n; q++) {
          const id = r * n + q
          if (q < n - 1) {
            const out = rng() < 0.5
            const ex = (q + 1) * s
            for (let y = r * s + mid; y < r * s + mid + 3; y++) for (const x of out ? [ex, ex + 1] : [ex - 2, ex - 1]) owner[y * B + x] = out ? id : id + 1
          }
          if (r < n - 1) {
            const out = rng() < 0.5
            const ey = (r + 1) * s
            for (let x = q * s + mid; x < q * s + mid + 3; x++) for (const y of out ? [ey, ey + 1] : [ey - 2, ey - 1]) owner[y * B + x] = out ? id : id + n
          }
        }
    }
    const top = oy + B + 3
    pieces = []
    for (let i = 0; i < n * n; i++) pieces.push({ x: irand(rng, Math.max(1, W - s)), y: top + irand(rng, Math.max(1, H - 4 - s - top)), placed: false })
    const edge = (i: number) => i % n === 0 || i % n === n - 1 || i < n || i >= n * (n - 1)
    const ids = shuffle(rng, [...Array(n * n).keys()])
    queue = ids.filter(edge).concat(ids.filter(i => !edge(i)))
    fly = -1
  }
  build()

  return {
    step() {
      fx = sparks(fx, 0.05)
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      if (fly < 0) {
        if (!queue.length) {
          hold = 70
          return
        }
        fly = queue.shift() as number
        ft = 0
        fromX = pieces[fly].x
        fromY = pieces[fly].y
      }
      ft++
      const p = pieces[fly]
      const k = ease(ft / 12)
      p.x = fromX + (ox + (fly % n) * s - fromX) * k
      p.y = fromY + (oy + Math.floor(fly / n) * s - fromY) * k - Math.sin(k * Math.PI) * 4
      if (ft >= 12) {
        p.placed = true
        burst(fx, rng, p.x + s / 2, p.y + s / 2, 0xfff4c0, 5, 0.7)
        fly = -1
      }
    },
    draw(px) {
      // a felt table, the tray with a ghost of the picture
      sky(px, W, H, 0x2a5a48, 0x163a2e)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 5) < 0.06) px[y * W + x] = 0x1e4a3a
      slab(px, W, H, ox - 2, oy - 2, B + 4, B + 4, 0x6a4a2a, 0x3a2414)
      for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) px[(oy + y) * W + ox + x] = mix(pic[y * B + x], 0x2a2420, 0.82)
      const piece = (id: number, x: number, y: number, loose: boolean) => {
        const tx = (id % n) * s
        const ty = Math.floor(id / n) * s
        for (let v = -2; v < s + 2; v++)
          for (let u = -2; u < s + 2; u++) {
            const bx = tx + u
            const by = ty + v
            if (bx < 0 || by < 0 || bx >= B || by >= B || owner[by * B + bx] !== id) continue
            const own = (a: number, b: number) => a >= 0 && b >= 0 && a < B && b < B && owner[b * B + a] === id
            let c = pic[by * B + bx]
            if (!own(bx + 1, by) || !own(bx, by + 1)) c = mix(c, 0x100c08, loose ? 0.45 : 0.18)
            else if (loose && (!own(bx - 1, by) || !own(bx, by - 1))) c = mix(c, 0xffffff, 0.3)
            dot(px, W, H, Math.round(x) + u, Math.round(y) + v, c)
          }
      }
      const loose = (id: number, x: number, y: number) => {
        piece(id, x, y, true)
      }
      pieces.forEach((p, i) => {
        if (p.placed) piece(i, ox + (i % n) * s, oy + Math.floor(i / n) * s, false)
      })
      pieces.forEach((p, i) => {
        if (!p.placed && i !== fly) {
          for (let v = 0; v < s; v++) for (let u = 0; u < s; u++) tint(px, W, H, p.x + u + 1, p.y + v + 1, 0x0a1a14, 0.4)
          loose(i, p.x, p.y)
        }
      })
      if (fly >= 0) {
        const p = pieces[fly]
        for (let v = 0; v < s; v++) for (let u = 0; u < s; u++) tint(px, W, H, p.x + u + 2, p.y + v + 3, 0x0a1a14, 0.45)
        loose(fly, p.x, p.y)
      }
      if (hold > 0 && hold < 60) {
        const band = (70 - hold) * 1.2 - 10
        for (let y = 0; y < B; y++) for (let x = 0; x < B; x++) if (Math.abs(x + y - band) < 2) tint(px, W, H, ox + x, oy + y, 0xffffff, 0.45)
      }
      const placed = pieces.filter(p => p.placed).length
      text(px, W, H, 1, 1, String(placed), 0xffffff)
      if (W >= 24) text(px, W, H, W - 1 - textWidth('/16'), 1, '/16', 0xa8d0b8)
      for (const sp of fx) rect(px, W, H, sp.x, sp.y, 1, 1, sp.c)
    },
  }
}

// --- ice sliding puzzle --------------------------------------------------------------

const PENGUIN = ['.kkk.', 'kwkwk', 'kwowk', 'kwwwk', '.f.f.']

const icepuzzle: Maker = (W, H, rng) => {
  const cols = 5
  const rows = 8
  const c = Math.max(2, Math.min(Math.floor((W - 4) / cols), Math.floor((H - 16) / rows)))
  const gw = cols * c
  const gh = rows * c
  const ox = Math.floor((W - gw) / 2)
  const oy = Math.max(10, H - gh - 4)
  const rock = new Uint8Array(cols * rows)
  let exit = 0
  let at = 0
  let plan: number[] = []
  let x = 0
  let y = 0
  let tx = 0
  let ty = 0
  let wait = 0
  let moves = 0
  let won = 0
  let trail: { x: number; y: number; l: number }[] = []
  let fx: Spark[] = []

  // where a slide stops: the cell before a rock or the wall, or -1 out through the gap
  const slide = (i: number, d: number) => {
    const [dx, dy] = DIRS[d]
    let cx = i % cols
    let cy = Math.floor(i / cols)
    for (;;) {
      const nx = cx + dx
      const ny = cy + dy
      if (ny < 0 && nx === exit) return -1
      if (nx < 0 || ny < 0 || nx >= cols || ny >= rows || rock[ny * cols + nx]) return cy * cols + cx
      cx = nx
      cy = ny
    }
  }
  const build = () => {
    for (let tries = 0; tries < 200; tries++) {
      for (let i = 0; i < cols * rows; i++) rock[i] = rng() < 0.17 ? 1 : 0
      exit = irand(rng, cols)
      at = (rows - 1) * cols + irand(rng, cols)
      rock[at] = 0
      // a breadth-first search over the cells where a slide can stop
      const from = new Int16Array(cols * rows).fill(-2)
      from[at] = -1
      const q = [at]
      let end = -1
      while (q.length && end < 0) {
        const i = q.shift() as number
        for (let d = 0; d < 4; d++) {
          const j = slide(i, d)
          if (j === -1) {
            end = i
            break
          }
          if (from[j] === -2) {
            from[j] = i
            q.push(j)
          }
        }
      }
      if (end < 0) continue
      plan = []
      for (let i = end; i !== -1; i = from[i]) plan.unshift(i)
      if (plan.length >= 5 || tries > 150) break
    }
    plan.push(-1)
    plan.shift()
    x = tx = ox + (at % cols) * c
    y = ty = oy + Math.floor(at / cols) * c
    moves = 0
    won = 0
    wait = 15
  }
  build()

  return {
    step() {
      fx = sparks(fx, 0.06)
      trail = trail.filter(p => --p.l > 0)
      if (won > 0) {
        if (++won > 45) build()
        return
      }
      if (x !== tx || y !== ty) {
        const dx = Math.sign(tx - x)
        const dy = Math.sign(ty - y)
        x += dx * Math.min(1.25, Math.abs(tx - x))
        y += dy * Math.min(1.25, Math.abs(ty - y))
        trail.push({ x: x + c / 2, y: y + c - 1, l: 24 })
        if (x === tx && y === ty) {
          if (plan.length === 0) won = 1
          else {
            wait = 8
            for (let k = 0; k < 4; k++) fx.push({ x: x + c / 2 + dx * c * 0.6, y: y + c / 2 + dy * c * 0.6, vx: (rng() - 0.5) * 0.8, vy: -rng() * 0.6, l: 10, c: 0xffffff })
          }
        }
        return
      }
      if (wait > 0) {
        wait--
        return
      }
      const next = plan.shift()
      if (next === undefined) return
      moves++
      if (next === -1) {
        tx = ox + exit * c
        ty = oy - c - 3
      } else {
        tx = ox + (next % cols) * c
        ty = oy + Math.floor(next / cols) * c
      }
    },
    draw(px) {
      px.fill(0xdce8f4)
      sky(px, W, H, 0x9ad0f0, 0xd8f0ff, oy)
      // the igloo past the gap
      const gx = ox + exit * c + c / 2
      lit(px, W, H, gx, oy - 2, c * 1.2, c * 1.1, 0xf4fbff, 0x8aa8c8)
      rect(px, W, H, gx - 1, oy - 3, 3, 3, 0x2a3a5a)
      // the ice: pale blue with long diagonal glints
      for (let yy = oy; yy < oy + gh; yy++)
        for (let xx = ox; xx < ox + gw; xx++) px[yy * W + xx] = (xx * 2 + yy) % 13 === 0 ? 0xe8f8ff : mix(0xa8dcf4, 0x7ab8e0, (yy - oy) / gh)
      for (const p of trail) tint(px, W, H, p.x, p.y, 0xffffff, p.l / 40)
      // the snowbank all round, with the gap
      const bank = (bx: number, by: number, bw: number, bh: number) => slab(px, W, H, bx, by, bw, bh, 0xf0f6fc)
      bank(ox - 2, oy - 2, gw + 4, 2)
      bank(ox - 2, oy + gh, gw + 4, 2)
      bank(ox - 2, oy, 2, gh)
      bank(ox + gw, oy, 2, gh)
      rect(px, W, H, ox + exit * c, oy - 2, c, 2, 0xa8dcf4)
      for (let yy = oy + gh + 2; yy < H; yy++) for (let xx = 0; xx < W; xx++) px[yy * W + xx] = 0xdce8f4
      for (let i = 0; i < cols * rows; i++)
        if (rock[i]) lit(px, W, H, ox + (i % cols) * c + (c - 1) / 2, oy + Math.floor(i / cols) * c + (c - 1) / 2, c * 0.55, c * 0.5, 0x8a90a4, 0x3a3e4e)
      if (c >= 5) litSprite(px, W, H, Math.round(x), Math.round(y), PENGUIN, { k: 0x1e2236, w: 0xf4f4f8, o: 0xf09a20, f: 0xf09a20 })
      else rect(px, W, H, x, y, c, c, 0x1e2236)
      text(px, W, H, 1, 1, String(moves), 0x2a3a5a)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- laser mirrors -------------------------------------------------------------------

const mirrors: Maker = (W, H, rng) => {
  const cols = 6
  const rows = 9
  const c = Math.max(2, Math.min(Math.floor((W - 4) / cols), Math.floor((H - 14) / rows)))
  const gw = cols * c
  const gh = rows * c
  const ox = Math.floor((W - gw) / 2)
  const oy = Math.max(9, Math.round((H - gh) / 2) + 1)
  // a mirror: 0 is /, 1 is \
  type Mirror = { want: number; now: number }
  let mir = new Map<number, Mirror>()
  let targets: number[] = []
  let r0 = 0
  let spin = -1
  let st = 0
  let wait = 20
  let hold = 0
  let t = 0
  let fx: Spark[] = []

  const bounce = (m: number, dx: number, dy: number): [number, number] => (m === 0 ? [-dy, -dx] : [dy, dx])
  const trace = () => {
    const cells: number[] = []
    let x = 0
    let y = r0
    let dx = 1
    let dy = 0
    for (let k = 0; k < 80 && x >= 0 && y >= 0 && x < cols && y < rows; k++) {
      const i = y * cols + x
      cells.push(i)
      const m = mir.get(i)
      if (m) [dx, dy] = bounce(m.now, dx, dy)
      x += dx
      y += dy
    }
    return { cells, x, y }
  }
  let goal = { x: 0, y: 0 }
  const build = () => {
    for (let tries = 0; ; tries++) {
      mir = new Map()
      r0 = 1 + irand(rng, rows - 2)
      const seen = new Set<number>()
      let x = 0
      let y = r0
      let dx = 1
      let dy = 0
      let run = 0
      const path: number[] = []
      let ok = false
      for (let k = 0; k < 60; k++) {
        const i = y * cols + x
        seen.add(i)
        path.push(i)
        const fine = (ax: number, ay: number) => ax >= 0 && ay >= 0 && ax < cols && ay < rows && !seen.has(ay * cols + ax)
        const turns = ([[-dy, -dx], [dy, dx]] as [number, number][]).filter(([a, b]) => fine(x + a, y + b))
        const straight = fine(x + dx, y + dy)
        const leaving = x + dx < 0 || y + dy < 0 || x + dx >= cols || y + dy >= rows
        if (leaving && path.length >= 13 && run >= 1) {
          goal = { x: x + dx, y: y + dy }
          ok = true
          break
        }
        if (turns.length && (!straight || (run >= 1 && rng() < 0.45)) && !(x === 0 && y === r0)) {
          const [ndx, ndy] = turns[irand(rng, turns.length)]
          mir.set(i, { want: ndx === -dy && ndy === -dx ? 0 : 1, now: 0 })
          dx = ndx
          dy = ndy
          run = 0
        } else if (straight) run++
        else break
        x += dx
        y += dy
      }
      if (!ok && tries < 60) continue
      const plain = path.filter(i => !mir.has(i) && i !== path[0])
      targets = shuffle(rng, plain).slice(0, 3)
      // a few decoys off the path, then every mirror knocked out of place
      for (let k = 0; k < 3; k++) {
        const i = irand(rng, cols * rows)
        if (!seen.has(i)) mir.set(i, { want: irand(rng, 2), now: 0 })
      }
      let wrong = 0
      for (const [i, m] of mir) {
        m.now = path.includes(i) && rng() < 0.75 ? 1 - m.want : m.want
        if (m.now !== m.want) wrong++
      }
      if (wrong < 2 && tries < 60) continue
      break
    }
    spin = -1
    wait = 20
    t = 0
  }
  build()

  return {
    step() {
      fx = sparks(fx, 0.04)
      t++
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      if (spin >= 0) {
        if (++st >= 8) {
          const m = mir.get(spin) as Mirror
          m.now = 1 - m.now
          spin = -1
          wait = 14
        }
        return
      }
      if (wait > 0) {
        wait--
        return
      }
      const { cells, x, y } = trace()
      const bad = cells.find(i => {
        const m = mir.get(i)
        return m !== undefined && m.now !== m.want
      })
      if (bad !== undefined) {
        spin = bad
        st = 0
      } else if (x === goal.x && y === goal.y) {
        hold = 70
        for (let k = 0; k < 3; k++) burst(fx, rng, ox + goal.x * c + c / 2, oy + goal.y * c + c / 2, 0x80ff90, 8, 1)
      }
    },
    draw(px) {
      sky(px, W, H, 0x1a1c28, 0x0c0d14)
      rect(px, W, H, ox - 1, oy - 1, gw + 2, gh + 2, 0x2e3244)
      for (let i = 0; i < cols * rows; i++) {
        const x = ox + (i % cols) * c
        const y = oy + Math.floor(i / cols) * c
        rect(px, W, H, x, y, c - 1, c - 1, (i + Math.floor(i / cols)) % 2 ? 0x1c1f2c : 0x202434)
      }
      const { cells, x: ex, y: ey } = trace()
      const centre = (cx: number, cy: number): [number, number] => [ox + cx * c + (c - 1) / 2, oy + cy * c + (c - 1) / 2]
      // the beam: a hot core and a soft glow
      const pts: [number, number][] = [centre(-1, r0), ...cells.map(i => centre(i % cols, Math.floor(i / cols))), centre(ex, ey)]
      for (let k = 0; k + 1 < pts.length; k++) {
        const [x0, y0] = pts[k]
        const [x1, y1] = pts[k + 1]
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)))
        for (let s = 0; s <= steps; s++) {
          const bx = x0 + ((x1 - x0) * s) / steps
          const by = y0 + ((y1 - y0) * s) / steps
          for (const [a, b] of DIRS) tint(px, W, H, bx + a, by + b, 0xff3050, 0.3)
        }
      }
      for (let k = 0; k + 1 < pts.length; k++) {
        const [x0, y0] = pts[k]
        const [x1, y1] = pts[k + 1]
        const steps = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)))
        for (let s = 0; s <= steps; s++) dot(px, W, H, x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, 0xff7080)
      }
      // the crystals to light
      let hit = 0
      for (const i of targets) {
        const on = cells.includes(i)
        if (on) hit++
        const [cx, cy] = centre(i % cols, Math.floor(i / cols))
        const col = on ? 0x80fff0 : 0x2a7a80
        for (let d = -1; d <= 1; d++) dot(px, W, H, cx + d, cy, col)
        dot(px, W, H, cx, cy - 1, on ? 0xffffff : 0x4aa0a8)
        dot(px, W, H, cx, cy + 1, on ? 0x40c0c0 : 0x1a5058)
      }
      for (const [i, m] of mir) {
        const x = ox + (i % cols) * c
        const y = oy + Math.floor(i / cols) * c
        const spinning = spin === i
        const shape = spinning ? (st < 4 ? 2 : 3) : m.now
        for (let k = 0; k < c - 1; k++) {
          const [mx, my] = shape === 0 ? [x + k, y + c - 2 - k] : shape === 1 ? [x + k, y + k] : shape === 2 ? [x + (c - 2) / 2, y + k] : [x + k, y + (c - 2) / 2]
          dot(px, W, H, mx + 1, my, 0x3a4050)
          dot(px, W, H, mx, my, k < (c - 1) / 2 ? 0xffffff : 0xb8c4d4)
        }
      }
      // the emitter on the left, the receiver where the beam must leave
      const [lx, ly] = centre(-1, r0)
      slab(px, W, H, 0, ly - 2, Math.max(2, ox), 5, 0x6a7080, 0x2a2e38)
      dot(px, W, H, Math.max(1, ox - 1), ly, 0xff4060)
      const [gx, gy] = centre(goal.x, goal.y)
      const lit2 = ex === goal.x && ey === goal.y
      slab(px, W, H, gx - 2, gy - 2, 5, 5, lit2 ? 0x40d060 : 0x3a5040, 0x1a2a1e)
      if (lit2) dot(px, W, H, gx, gy, 0xc0ffc0)
      void lx
      text(px, W, H, 1, 1, `${hit}/${targets.length}`, 0xffffff)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- unblock the arrows --------------------------------------------------------------

// DIRS order: right, left, down, up
const ARROWS = [
  ['..x.', 'xxxx', 'xxxx', '..x.'],
  ['.x..', 'xxxx', 'xxxx', '.x..'],
  ['.xx.', '.xx.', 'xxxx', '.xx.'],
  ['.xx.', 'xxxx', '.xx.', '.xx.'],
]
const ARROW_COLOURS = [0xf08a3a, 0x3aa0f0, 0x5ac85a, 0xe05a8a]

const arrows: Maker = (W, H, rng) => {
  const cols = 5
  const rows = 7
  const c = Math.max(3, Math.min(Math.floor((W - 2) / cols), Math.floor((H - 12) / rows)))
  const gw = cols * c
  const gh = rows * c
  const ox = Math.floor((W - gw) / 2)
  const oy = Math.max(8, Math.round((H - gh) / 2) + 1)
  const dir = new Int8Array(cols * rows)
  type Mover = { i: number; d: number; off: number; v: number; back: number; stop: number }
  let mover: Mover | null = null
  let wait = 20
  let misses = 0
  let hold = 0
  let fx: Spark[] = []

  // the first tile in the way, or -1 when the path to the edge is clear
  const blocker = (i: number, d = dir[i]) => {
    const [dx, dy] = DIRS[d]
    let x = (i % cols) + dx
    let y = Math.floor(i / cols) + dy
    while (x >= 0 && y >= 0 && x < cols && y < rows) {
      if (dir[y * cols + x] >= 0) return y * cols + x
      x += dx
      y += dy
    }
    return -1
  }
  const build = () => {
    for (let i = 0; i < cols * rows; i++) dir[i] = irand(rng, 4)
    for (let k = 0; k < 3; k++) dir[irand(rng, cols * rows)] = -1
    // play it once: when stuck, turn a tile to a free way out, so the board can always be cleared
    const keep = Int8Array.from(dir)
    for (;;) {
      const left = [...dir.keys()].filter(i => dir[i] >= 0)
      if (!left.length) break
      const free = left.filter(i => blocker(i) < 0)
      if (free.length) {
        dir[free[irand(rng, free.length)]] = -1
        continue
      }
      for (const i of shuffle(rng, left)) {
        const ways = [0, 1, 2, 3].filter(d => blocker(i, d) < 0)
        if (ways.length) {
          keep[i] = ways[irand(rng, ways.length)]
          dir[i] = keep[i]
          break
        }
      }
    }
    dir.set(keep)
    misses = 0
    wait = 20
  }
  build()

  const cellXY = (i: number): [number, number] => [ox + (i % cols) * c, oy + Math.floor(i / cols) * c]

  return {
    step() {
      fx = sparks(fx, 0.05)
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      if (mover) {
        const m = mover
        if (m.back > 0) {
          // a wrong tap: it bumps the tile in the way and slides back
          m.off += m.v
          if (m.off >= m.stop) {
            m.v = -0.8
            m.back--
          }
          if (m.off <= 0 && m.v < 0) {
            dir[m.i] = m.d
            mover = null
            wait = 10
          }
          return
        }
        m.v = Math.min(2.5, m.v + 0.2)
        m.off += m.v
        if (m.off > Math.max(W, H)) {
          mover = null
          wait = 3
        }
        return
      }
      if (wait > 0) {
        wait--
        return
      }
      const left = [...dir.keys()].filter(i => dir[i] >= 0)
      if (!left.length) {
        hold = 50
        return
      }
      const free = left.filter(i => blocker(i) < 0)
      const stuck = left.filter(i => blocker(i) >= 0)
      if (stuck.length && rng() < 0.05) {
        const i = stuck[irand(rng, stuck.length)]
        const b = blocker(i)
        const dist = (Math.abs((b % cols) - (i % cols)) + Math.abs(Math.floor(b / cols) - Math.floor(i / cols)) - 1) * c
        mover = { i, d: dir[i], off: 0, v: 1, back: 1, stop: dist + 1 }
        dir[i] = -1
        misses++
        const [bx, by] = cellXY(b)
        burst(fx, rng, bx + c / 2, by + c / 2, 0xff5050, 5, 0.6)
        return
      }
      const i = free[irand(rng, free.length)]
      mover = { i, d: dir[i], off: 0, v: 0.4, back: 0, stop: 0 }
      dir[i] = -1
    },
    draw(px) {
      sky(px, W, H, 0x24344a, 0x111a26)
      slab(px, W, H, ox - 2, oy - 2, gw + 4, gh + 4, 0x34465e, 0x18222e)
      rect(px, W, H, ox, oy, gw, gh, 0x1c2838)
      for (let i = 0; i < cols * rows; i++) {
        const [x, y] = cellXY(i)
        dot(px, W, H, x + c / 2, y + c / 2, 0x2a3a50)
      }
      const tile = (x: number, y: number, d: number, hot: boolean) => {
        const col = hot ? 0xff6060 : ARROW_COLOURS[d]
        slab(px, W, H, x, y, c - 1, c - 1, col, tones(col)[3])
        if (c >= 6) {
          const rows4 = ARROWS[d]
          for (let v = 0; v < 4; v++) for (let u = 0; u < 4; u++) if (rows4[v][u] === 'x') dot(px, W, H, x + 1 + u, y + 1 + v, 0xffffff)
        }
      }
      for (let i = 0; i < cols * rows; i++) if (dir[i] >= 0) tile(...cellXY(i), dir[i], false)
      if (mover) {
        const [x, y] = cellXY(mover.i)
        const [dx, dy] = DIRS[mover.d]
        tile(Math.round(x + dx * mover.off), Math.round(y + dy * mover.off), mover.d, mover.back > 0 || mover.v < 0)
      }
      let left = 0
      for (let i = 0; i < cols * rows; i++) if (dir[i] >= 0) left++
      text(px, W, H, 1, 1, String(left), 0xffffff)
      if (misses && W >= 24) text(px, W, H, W - 1 - textWidth('x' + misses), 1, 'x' + misses, 0xff6060)
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- triple tile match ---------------------------------------------------------------

const SYMBOLS = [
  ['.x.x.', 'xxxxx', 'xxxxx', '.xxx.', '..x..'],
  ['..x..', '.xxx.', 'xxxxx', '.xxx.', '.x.x.'],
  ['..x..', '.xxx.', 'xxxxx', 'xxxxx', '.xxx.'],
  ['...xx', '.xxxx', 'xxxx.', 'xxx..', 'x....'],
  ['...x.', '..x.x', '.x..x', 'xx.xx', 'xx.xx'],
  ['.xxx.', 'xx...', 'xx...', 'xx...', '.xxx.'],
]
const SYMBOL_COLOURS = [0xf05a8a, 0xf0c020, 0x3a9af0, 0x4ab84a, 0xe03a3a, 0x8a5ae0]

const triplematch: Maker = (W, H, rng) => {
  const s = Math.max(3, Math.min(7, Math.floor((W - 4) / 4)))
  const bx = Math.floor((W - 4 * s) / 2)
  const by = 9
  const slot = Math.max(2, Math.floor((W - 4) / 7))
  const ty = H - slot - 5
  type Tile = { x: number; y: number; layer: number; kind: number; gone: boolean }
  let tiles: Tile[] = []
  let tray: number[] = []
  let fly: { kind: number; x: number; y: number; k: number; tx: number; ty: number } | null = null
  let wait = 20
  let hold = 0
  let lost = false
  let fx: Spark[] = []

  const build = () => {
    const spots: [number, number, number][] = []
    for (let r = 0; r < 4; r++) for (let q = 0; q < 4; q++) spots.push([bx + q * s, by + r * s, 0])
    for (let r = 0; r < 3; r++) for (let q = 0; q < 3; q++) spots.push([bx + q * s + s / 2, by + r * s + s / 2, 1])
    spots.push([bx + s, by + s, 2], [bx + 2 * s, by + s, 2])
    const kinds: number[] = []
    for (let k = 0; k < spots.length / 3; k++) for (let j = 0; j < 3; j++) kinds.push(k % SYMBOLS.length)
    shuffle(rng, kinds)
    tiles = spots.map(([x, y, layer], i) => ({ x: Math.round(x), y: Math.round(y), layer, kind: kinds[i], gone: false }))
    tray = []
    lost = false
    wait = 20
  }
  build()

  const free = (a: Tile) => !tiles.some(b => !b.gone && b.layer > a.layer && Math.abs(b.x - a.x) < s && Math.abs(b.y - a.y) < s)

  return {
    step() {
      fx = sparks(fx, 0.05)
      if (hold > 0) {
        if (--hold === 0) build()
        return
      }
      if (fly) {
        fly.k++
        if (fly.k >= 9) {
          // in the tray next to its own kind; three of a kind clear
          const kind = fly.kind
          const at = tray.lastIndexOf(kind)
          tray.splice(at >= 0 ? at + 1 : tray.length, 0, kind)
          fly = null
          wait = 4
          if (tray.filter(k => k === kind).length === 3) {
            const i = tray.indexOf(kind)
            tray.splice(i, 3)
            burst(fx, rng, 2 + (i + 1.5) * slot, ty + slot / 2, SYMBOL_COLOURS[kind], 12, 1.2)
          } else if (tray.length >= 7) {
            lost = true
            hold = 50
          }
          if (!tiles.some(t => !t.gone) && !tray.length) hold = 60
        }
        return
      }
      if (wait > 0) {
        wait--
        return
      }
      const open = tiles.filter(t => !t.gone && free(t))
      if (!open.length) return
      // a pair in the tray first, then a single, then whatever is on top
      const count = (k: number) => tray.filter(x => x === k).length
      let pickT = open.find(t => count(t.kind) === 2) ?? (rng() < 0.85 ? open.find(t => count(t.kind) === 1) : undefined)
      if (!pickT) {
        const top = open.filter(t => t.layer === Math.max(...open.map(o => o.layer)))
        pickT = top[irand(rng, top.length)]
      }
      pickT.gone = true
      const at = tray.lastIndexOf(pickT.kind)
      const idx = at >= 0 ? at + 1 : tray.length
      fly = { kind: pickT.kind, x: pickT.x, y: pickT.y, k: 0, tx: 2 + idx * slot, ty }
    },
    draw(px) {
      sky(px, W, H, 0xf0d8a8, 0xd8a870)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x + y * 3) % 9 === 0) px[y * W + x] = mix(px[y * W + x], 0xc08850, 0.3)
      const tile = (x: number, y: number, kind: number, shadowed: boolean, size: number) => {
        rect(px, W, H, x + 1, y + 1, size, size, 0x6a4a2a)
        slab(px, W, H, x, y, size, size, shadowed ? 0xb8ae9a : 0xfaf4e4, shadowed ? 0x5a5040 : 0x8a7a60)
        if (size >= 7) {
          const col = shadowed ? mix(SYMBOL_COLOURS[kind], 0x6a6050, 0.5) : SYMBOL_COLOURS[kind]
          litSprite(px, W, H, x + 1, y + 1, SYMBOLS[kind], { x: col })
        } else rect(px, W, H, x + 1, y + 1, size - 2, size - 2, SYMBOL_COLOURS[kind])
      }
      for (let layer = 0; layer < 3; layer++) for (const t of tiles) if (!t.gone && t.layer === layer) tile(t.x, t.y, t.kind, !free(t), s)
      // the tray, seven slots
      slab(px, W, H, 1, ty - 2, 7 * slot + 2, slot + 4, lost ? 0xc04040 : 0x7a4a2a, 0x3a2010)
      for (let i = 0; i < 7; i++) rect(px, W, H, 2 + i * slot, ty, slot - 1, slot, 0x4a2a14)
      tray.forEach((k, i) => {
        slab(px, W, H, 2 + i * slot, ty, slot - 1, slot, 0xfaf4e4)
        rect(px, W, H, 3 + i * slot, ty + 1, slot - 3, slot - 2, SYMBOL_COLOURS[k])
      })
      if (fly) {
        const k = ease(fly.k / 9)
        const size = Math.round(s + (slot - s) * k)
        tile(Math.round(fly.x + (fly.tx - fly.x) * k), Math.round(fly.y + (fly.ty - fly.y) * k - Math.sin(k * Math.PI) * 6), fly.kind, false, size)
      }
      const left = tiles.filter(t => !t.gone).length
      text(px, W, H, 1, 1, String(left), 0x5a3418)
      for (const sp of fx) dot(px, W, H, sp.x, sp.y, sp.c)
    },
  }
}

export const PUZZLES = {
  hanoi,
  sudoku,
  slide15,
  flow,
  pipeturn,
  jigsaw,
  icepuzzle,
  mirrors,
  arrows,
  triplematch,
}
