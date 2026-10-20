import { hsv, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, sparks, textWidth } from '../kit'
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
      // table and pegs
      rect(px, W, H, 0, baseY, W, H - baseY, 0x6a4428)
      rect(px, W, H, 0, baseY, W, 1, 0x8a5a34)
      for (let p = 0; p < 3; p++) rect(px, W, H, pegX(p), pegTop, 1, baseY - pegTop, 0xb08a5a)
      const disc = (d: number, x: number, y: number) => {
        const w = width(d)
        const c = hsv(hue0 + d / n * 0.8, 0.6, 0.95)
        rect(px, W, H, x - (w - 1) / 2, y, w, dh, c)
        if (dh > 1) rect(px, W, H, x - (w - 1) / 2, y + dh - 1, w, 1, scale(c, 0.75))
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

export const PUZZLES = {
  hanoi,
}
