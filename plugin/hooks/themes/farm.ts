import { dot, rect, sky, text } from '../draw'
import type { Maker } from '../draw'
import { clamp, hash, line, lit, poly, slab, sparks, textWidth } from '../kit'
import type { Spark } from '../kit'

// Farm, garden & plants: fields, flocks and one hungry plant.

// --- combine harvester --------------------------------------------------------------

const combine: Maker = (W, H, rng) => {
  const lane = 7
  const lanes = Math.max(1, Math.floor((H - 8) / lane))
  const top = H - lanes * lane
  const cut = new Uint8Array(W * H)
  let lx = -6
  let row = 0
  let dir = 1
  let t = 0
  let hold = 0
  let straw: Spark[] = []
  const reset = () => {
    cut.fill(0)
    lx = -6
    row = 0
    dir = 1
    hold = 0
  }
  reset()

  return {
    step() {
      t++
      straw = sparks(straw, 0)
      if (hold > 0) {
        if (--hold === 0) reset()
        return
      }
      // across the field, turn at the headland, back the other way
      lx += dir * 0.55
      const y0 = top + row * lane
      for (let y = y0; y < y0 + lane; y++) {
        const x = Math.round(lx + dir * 3)
        if (x >= 0 && x < W && y >= 0 && y < H) cut[y * W + x] = 1
      }
      if (t % 4 === 0) straw.push({ x: lx - dir * 4, y: y0 + lane / 2 + (rng() - 0.5) * 2, vx: 0, vy: 0, l: 200, c: 0xe8d090 })
      if ((dir > 0 && lx > W + 5) || (dir < 0 && lx < -5)) {
        row++
        dir = -dir
        if (row >= lanes) hold = 60
      }
    },
    draw(px) {
      // the field: standing wheat in rows of ears, cut stubble in pale stripes
      rect(px, W, H, 0, 0, W, top, 0x5a9a3a)
      for (let x = 0; x < W; x++) if (hash(x, 0, 3) < 0.4) rect(px, W, H, x, top - 2, 1, 2, 0x3a7a2a)
      for (let y = top; y < H; y++)
        for (let x = 0; x < W; x++) {
          const i = y * W + x
          if (cut[i]) px[i] = (y - top) % lane === 0 ? 0xc8a860 : (x + y) % 3 === 0 ? 0xd8bc78 : 0xe0c888
          else px[i] = y % 2 === 0 ? (hash(x, y, 1) < 0.3 ? 0xf8d860 : 0xe8b840) : 0xc89a30
        }
      for (const s of straw) dot(px, W, H, s.x, s.y, s.c)
      if (hold > 0 || row >= lanes) {
        const pct = '100%'
        text(px, W, H, 1, 1, pct, 0xffffff)
        return
      }
      // the combine: a green body, a cab, the wide header reel turning in front
      const y0 = top + row * lane
      const x = lx
      slab(px, W, H, x - 4, y0 + 1, 8, lane - 2, 0x3a9a3a, 0x1a4a1a)
      slab(px, W, H, x - (dir > 0 ? 1 : 2), y0 + 2, 3, 3, 0xa8d8f0, 0x2a4a5a)
      const hx = x + dir * 5
      rect(px, W, H, hx - 1, y0, 2, lane, 0xd8b030)
      for (let y = y0; y < y0 + lane; y++) if ((y + Math.floor(t / 2)) % 3 === 0) dot(px, W, H, hx, y, 0xf8e080)
      dot(px, W, H, x - dir * 3, y0 + 1, 0x2a2a2a)
      let n = 0
      for (let i = top * W; i < W * H; i++) if (cut[i]) n++
      text(px, W, H, 1, 1, `${Math.round((n / ((H - top) * W)) * 100)}%`, 0xffffff)
    },
  }
}

// --- sheepdog -----------------------------------------------------------------------

const sheepdog: Maker = (W, H, rng) => {
  const pen = { x: W - 12, y: 8, w: 11, h: 12 }
  type Sheep = { x: number; y: number; vx: number; vy: number; inPen: boolean }
  let flock: Sheep[] = []
  let dog = { x: 4, y: H - 4 }
  let t = 0
  let done = 0
  const reset = () => {
    flock = []
    for (let k = 0; k < 9; k++) flock.push({ x: 6 + rng() * (W - 14), y: H * 0.55 + rng() * H * 0.3, vx: 0, vy: 0, inPen: false })
    dog = { x: 3, y: H - 3 }
    t = 0
    done = 0
  }
  reset()
  const gate = { x: pen.x, y: pen.y + pen.h }

  return {
    step() {
      t++
      if (done) {
        if (++done > 60) reset()
        return
      }
      const out = flock.filter(s => !s.inPen)
      if (!out.length) {
        done = 1
        return
      }
      // the dog circles behind the flock, on the far side from the gate
      let cx = 0
      let cy = 0
      for (const s of out) {
        cx += s.x / out.length
        cy += s.y / out.length
      }
      const gx = gate.x + pen.w / 2
      const gy = gate.y
      const dx = cx - gx
      const dy = cy - gy
      const d = Math.hypot(dx, dy) || 1
      const tx = cx + (dx / d) * 9
      const ty = cy + (dy / d) * 9
      dog.x += clamp(tx - dog.x, -0.8, 0.8)
      dog.y += clamp(ty - dog.y, -0.8, 0.8)
      for (const s of flock) {
        if (s.inPen) {
          s.vx *= 0.8
          s.vy *= 0.8
          s.x = clamp(s.x + s.vx + (rng() - 0.5) * 0.1, pen.x + 2, pen.x + pen.w - 2)
          s.y = clamp(s.y + s.vy + (rng() - 0.5) * 0.1, pen.y + 2, pen.y + pen.h - 2)
          continue
        }
        const ex = s.x - dog.x
        const ey = s.y - dog.y
        const e = Math.hypot(ex, ey) || 1
        if (e < 11) {
          s.vx += (ex / e) * 0.12
          s.vy += (ey / e) * 0.12
        }
        // keep near the others
        s.vx += (cx - s.x) * 0.004 + (rng() - 0.5) * 0.05
        s.vy += (cy - s.y) * 0.004 + (rng() - 0.5) * 0.05
        s.vx *= 0.88
        s.vy *= 0.88
        s.x = clamp(s.x + s.vx, 2, W - 2)
        s.y = clamp(s.y + s.vy, 4, H - 2)
        // in through the gate at the bottom of the pen
        if (s.x > pen.x && s.x < pen.x + pen.w && s.y < pen.y + pen.h + 1 && s.y > pen.y) s.inPen = true
        else if (s.x > pen.x - 1 && s.y < pen.y + pen.h && s.y > pen.y - 1) s.x = pen.x - 1
      }
    },
    draw(px) {
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = hash(x >> 1, y >> 1, 2) < 0.15 ? 0x5aa040 : (x + y) % 5 === 0 ? 0x6ab84a : 0x64b046
      // the pen: a wooden fence, open at the bottom
      for (let x = pen.x; x <= pen.x + pen.w; x++) {
        dot(px, W, H, x, pen.y, 0x8a5a30)
      }
      for (let y = pen.y; y <= pen.y + pen.h; y++) {
        dot(px, W, H, pen.x, y, 0x8a5a30)
        dot(px, W, H, pen.x + pen.w, y, 0x8a5a30)
      }
      if (done) for (let x = pen.x; x <= pen.x + pen.w; x++) dot(px, W, H, x, pen.y + pen.h, 0xa87a48)
      for (const s of flock) {
        lit(px, W, H, s.x, s.y, 1.8, 1.4, 0xf4f0e8, 0x8a8478)
        dot(px, W, H, s.x + (s.vx >= 0 ? 1.5 : -1.5), s.y, 0x2a2a2a)
      }
      // the dog: black with a white collar
      rect(px, W, H, dog.x - 1, dog.y - 1, 3, 2, 0x1a1a1a)
      dot(px, W, H, dog.x, dog.y - 1, 0xf0f0f0)
      dot(px, W, H, dog.x + 1, dog.y - 2, 0x1a1a1a)
      const inside = flock.filter(s => s.inPen).length
      text(px, W, H, 1, 1, `${inside}/${flock.length}`, 0xffffff)
    },
  }
}

// --- Venus flytrap ------------------------------------------------------------------

const flytrap: Maker = (W, H, rng) => {
  const cx = W / 2
  const base = Math.round(H * 0.72)
  const jawY = Math.round(H * 0.48)
  let open = 1
  let t = 0
  let fly = { x: 4, y: 10, a: 0 }
  let state: 'fly' | 'land' | 'snap' | 'digest' | 'reopen' = 'fly'
  let caught = 0
  let fx: Spark[] = []
  const reset = () => {
    fly = { x: rng() < 0.5 ? 3 : W - 3, y: 6 + rng() * 6, a: rng() * 6 }
    state = 'fly'
    t = 0
  }
  reset()

  return {
    step() {
      t++
      fx = sparks(fx, 0.04)
      if (state === 'fly') {
        fly.a += 0.12
        fly.x += Math.cos(fly.a) * 0.8 + (cx - fly.x) * 0.01
        fly.y += Math.sin(fly.a * 1.3) * 0.6 + (jawY - 6 - fly.y) * 0.01
        if (t > 120) state = 'land'
      } else if (state === 'land') {
        fly.x += (cx - fly.x) * 0.08
        fly.y += (jawY - fly.y) * 0.08
        if (Math.hypot(cx - fly.x, jawY - fly.y) < 0.6) {
          state = 'snap'
          t = 0
        }
      } else if (state === 'snap') {
        // the trigger hairs: then it shuts in a blink
        if (t > 15) open = Math.max(0, open - 0.35)
        if (open <= 0) {
          state = 'digest'
          t = 0
          caught++
          for (let k = 0; k < 6; k++) fx.push({ x: cx + (rng() - 0.5) * 6, y: jawY, vx: (rng() - 0.5) * 0.8, vy: -rng() * 0.8, l: 10, c: 0xc0ff80 })
        }
      } else if (state === 'digest') {
        if (t > 120) state = 'reopen'
      } else if (state === 'reopen') {
        open = Math.min(1, open + 0.01)
        if (open >= 1) reset()
      }
    },
    draw(px) {
      sky(px, W, H, 0xd8ecd0, 0xb8d8c0)
      // a window frame behind, the sill, the pot
      slab(px, W, H, 0, 0, W, 4, 0xf0ece0)
      for (let y = base + 6; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = y === base + 6 ? 0xffffff : 0xe0d8c8
      poly(px, W, H, [[cx - 7, base], [cx + 7, base], [cx + 5, base + 7], [cx - 5, base + 7]], 0xc86a3a)
      rect(px, W, H, cx - 7, base, 14, 1, 0xe08a5a)
      rect(px, W, H, cx - 6, base - 1, 12, 1, 0x4a3020)
      // the stem and a couple of resting traps
      line(px, W, H, cx, base - 1, cx, jawY + 4, 0x4a9a3a)
      line(px, W, H, cx - 1, base - 1, cx - 6, base - 6, 0x4a9a3a)
      line(px, W, H, cx + 1, base - 1, cx + 7, base - 5, 0x4a9a3a)
      lit(px, W, H, cx - 7, base - 7, 2, 1, 0x8ac04a)
      lit(px, W, H, cx + 8, base - 6, 2, 1, 0x8ac04a)
      // the trap: two lobes, red inside, teeth along the rims; they close together
      const gap = open * 5
      const shake = state === 'digest' && t % 20 < 4 ? 1 : 0
      for (const s of [-1, 1]) {
        const lobe: [number, number][] = [
          [cx + shake, jawY + 2],
          [cx + s * 6 + shake, jawY + 1 - gap * 0.3],
          [cx + s * 6 + shake, jawY - 1 - gap],
          [cx + shake, jawY - 1 - gap * 0.2],
        ]
        poly(px, W, H, lobe, 0x6ab03a)
        if (open > 0.2) poly(px, W, H, lobe.map(([x, y]) => [cx + (x - cx) * 0.75, y + 0.5] as [number, number]), 0xd83a3a)
        for (let k = 0; k <= 6; k++) dot(px, W, H, cx + s * k + shake, jawY - 2 - gap * (k / 6) - (k % 2), 0xe8f0a0)
      }
      if (state === 'fly' || state === 'land' || (state === 'snap' && open > 0.3)) {
        const wing = t % 2 ? 0xd0d8e8 : 0xa0a8c0
        dot(px, W, H, fly.x, fly.y, 0x1a1a20)
        dot(px, W, H, fly.x + 1, fly.y, 0x2a2a30)
        dot(px, W, H, fly.x, fly.y - 1, wing)
        dot(px, W, H, fly.x + 1, fly.y - 1, wing)
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
      text(px, W, H, W - 1 - textWidth(String(caught)), 6, String(caught), 0x3a5a3a)
    },
  }
}

export const FARM = {
  combine,
  sheepdog,
  flytrap,
}
