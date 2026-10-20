import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { clamp, hash, irand, line, pick, ring, textWidth } from '../kit'

// Music & dance: no sound, so the rhythm has to show.

/** 120 beats a minute at 15 frames a second: a beat every 7.5 frames. */
const beatOf = (t: number) => t / 7.5
const kick = (t: number) => Math.max(0, 1 - (beatOf(t) % 1) * 3)

// --- audio visualiser -------------------------------------------------------------

const visualiser: Maker = (W, H, rng) => {
  const n = Math.max(4, Math.floor(W / 3))
  const bars = new Float32Array(n)
  const caps = new Float32Array(n)
  const ph = Array.from({ length: n }, () => rng() * 6)
  let t = 0
  const base = H * 0.62

  return {
    step() {
      t++
      const k = kick(t)
      for (let i = 0; i < n; i++) {
        const low = i < n / 3 ? k * 0.9 : 0
        const v = 0.25 + 0.25 * Math.sin(t * (0.1 + i * 0.03) + (ph[i] as number)) + 0.2 * Math.sin(t * 0.37 + i) + low
        bars[i] = Math.max(bars[i]! * 0.82, clamp(v, 0.05, 1))
        caps[i] = Math.max(caps[i]! - 0.015, bars[i]!)
      }
    },
    draw(px) {
      const k = kick(t)
      sky(px, W, H, mix(0x0a0618, 0x2a0a3a, k * 0.5), 0x05030c)
      for (let i = 0; i < n; i++) {
        const x = i * 3 + Math.floor((W - n * 3) / 2)
        const h = bars[i]! * base * 0.9
        for (let y = 0; y < h; y++) rect(px, W, H, x, base - y, 2, 1, hsv(0.75 - (y / base) * 0.6, 0.8, 1))
        rect(px, W, H, x, base - caps[i]! * base * 0.9 - 2, 2, 1, 0xffffff)
        for (let y = 0; y < h * 0.5; y++) rect(px, W, H, x, base + 2 + y, 2, 1, scale(hsv(0.75 - (y / base) * 0.6, 0.8, 1), 0.35 - (y / h) * 0.4))
      }
      rect(px, W, H, 0, base + 1, W, 1, 0x3a2a5a)
    },
  }
}

// --- piano tiles ------------------------------------------------------------------

const pianotiles: Maker = (W, H, rng) => {
  const cols = 4
  const cw = W / cols
  const th = Math.max(6, Math.round(H * 0.18))
  type T = { c: number; y: number; len: number; hit: number }
  let tiles: T[] = []
  let speed = 0.7
  let next = 0
  let score = 0
  let tap: { x: number; y: number; l: number } | undefined
  let t = 0

  return {
    step() {
      t++
      speed = Math.min(1.8, 0.7 + score * 0.01)
      next -= speed
      if (next <= 0) {
        const long = rng() < 0.15
        tiles.push({ c: irand(rng, cols), y: -th * (long ? 2 : 1), len: long ? 2 : 1, hit: 0 })
        next = th * (long ? 2 : 1)
      }
      for (const tl of tiles) {
        tl.y += speed
        if (!tl.hit && tl.y + th * tl.len > H * 0.8) {
          tl.hit = 1
          score++
          tap = { x: tl.c * cw + cw / 2, y: H * 0.85, l: 6 }
        }
      }
      tiles = tiles.filter(tl => tl.y < H)
      if (tap && --tap.l <= 0) tap = undefined
      if (score > 300) score = 0
    },
    draw(px) {
      px.fill(0xf4f4f8)
      for (let k = 1; k < cols; k++) rect(px, W, H, Math.round(k * cw), 0, 1, H, 0xc8c8d4)
      for (const tl of tiles) {
        const x = Math.round(tl.c * cw) + 1
        rect(px, W, H, x, tl.y, Math.round(cw) - 1, th * tl.len - 1, tl.hit ? 0xb8c0d0 : 0x1a1a24)
        if (tl.len > 1 && !tl.hit) rect(px, W, H, x + cw / 2 - 1, tl.y + 2, 1, th * 2 - 4, 0x5a8aff)
      }
      if (tap) {
        disc(px, W, H, tap.x, tap.y, 2 + (6 - tap.l) * 0.6, 0xffd0a0)
        ring(px, W, H, tap.x, tap.y - 8, 8 - tap.l, 0x5a8aff)
      }
      text(px, W, H, W / 2 - textWidth(String(score)) / 2, 2, String(score), 0xe03a3a)
    },
  }
}

// --- trend dance ------------------------------------------------------------------

// keyframes: [left arm, right arm, left leg, right leg, hip sway, bounce] in radians and pixels
const MOVES: number[][] = [
  [0.4, -0.4, 0.15, -0.15, 0, 0],
  [2.6, -0.4, 0.15, -0.15, -1, 1],
  [2.6, -2.6, 0.15, -0.15, 0, 0],
  [0.4, -2.6, 0.15, -0.15, 1, 1],
  [1.6, -1.6, 0.4, -0.1, -1, 0],
  [1.6, -1.6, 0.1, -0.4, 1, 1],
  [-0.4, 0.4, 0.3, -0.3, 0, 2],
  [3.0, -3.0, 0.1, -0.1, 0, 0],
]

const trenddance: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.82)
  let t = 0
  let seq = [0, 1, 2, 3, 4, 5, 6, 7]
  let hue = rng()

  return {
    step() {
      t++
      if (t % 240 === 0) {
        seq = seq.map(() => irand(rng, MOVES.length))
        hue = rng()
      }
    },
    draw(px) {
      const b = beatOf(t)
      const k = kick(t)
      sky(px, W, H, hsv(hue, 0.6, 0.25 + k * 0.15), hsv(hue + 0.15, 0.7, 0.4), floor)
      for (let i = 0; i < 3; i++) {
        const a = Math.sin(t * 0.05 + i * 2) * 0.6
        for (let s = 0; s < H; s++) dot(px, W, H, W * (0.2 + i * 0.3) + Math.sin(a) * s, s * Math.cos(a), mix(hsv(hue + i * 0.3, 0.5, 0.5), 0x000000, s / H))
      }
      rect(px, W, H, 0, floor, W, H - floor, 0x2a1a3a)
      for (let x = 0; x < W; x += 4) dot(px, W, H, x + (Math.floor(b) % 2) * 2, floor + 2, hsv(hue + x * 0.03, 0.8, 1))
      const cur = MOVES[seq[Math.floor(b) % seq.length] as number] as number[]
      const nxt = MOVES[seq[(Math.floor(b) + 1) % seq.length] as number] as number[]
      const f = Math.min(1, (b % 1) * 3)
      const pose = cur.map((v, i) => v + ((nxt[i] as number) - v) * f)
      const cx = W / 2 + (pose[4] as number) * 1.5
      const hipY = floor - 9 - (pose[5] as number) * 0.5
      const shoulderY = hipY - 7
      const skin = 0xe8b890
      const shirt = hsv(hue + 0.5, 0.6, 1)
      line(px, W, H, cx, hipY, cx + Math.sin(pose[2] as number) * 8, hipY + Math.cos(pose[2] as number) * 9, 0x2a3a8a)
      line(px, W, H, cx + 1, hipY, cx + 1 + Math.sin(pose[3] as number) * 8, hipY + Math.cos(pose[3] as number) * 9, 0x2a3a8a)
      rect(px, W, H, cx - 1.5, shoulderY, 4, 8, shirt)
      line(px, W, H, cx - 1, shoulderY + 1, cx - 1 - Math.sin(pose[0] as number) * 6, shoulderY + 1 + Math.cos(pose[0] as number) * 6, skin)
      line(px, W, H, cx + 2, shoulderY + 1, cx + 2 - Math.sin(pose[1] as number) * 6, shoulderY + 1 + Math.cos(pose[1] as number) * 6, skin)
      disc(px, W, H, cx + 0.5, shoulderY - 3, 2.2, skin)
      rect(px, W, H, cx - 1.5, shoulderY - 6, 4, 2, 0x3a2a1a)
      for (let i = 0; i < 6; i++) {
        const x = 2 + i * (W / 6)
        const up = (Math.floor(b) + i) % 2
        sprite(px, W, H, x, H - 4 - up, ['.x.', 'xxx'], { x: 0x0a0612 })
      }
    },
  }
}

// --- guitar highway ---------------------------------------------------------------

const guitar: Maker = (W, H, rng) => {
  const lanes = 5
  const COLS = [0x3ad04a, 0xe03a3a, 0xf0d020, 0x3a8ae0, 0xf08a20]
  const top = Math.round(H * 0.1)
  const strike = Math.round(H * 0.82)
  type N = { lane: number; z: number }
  let notes: N[] = []
  let flash = new Float32Array(lanes)
  let streak = 0
  let t = 0

  const proj = (lane: number, z: number): [number, number] => {
    const s = 0.35 + 0.65 * (1 - z)
    const y = strike - z * (strike - top)
    const w = W * 0.85 * s
    return [W / 2 - w / 2 + (lane + 0.5) * (w / lanes), y]
  }

  return {
    step() {
      t++
      for (let i = 0; i < lanes; i++) flash[i] = Math.max(0, flash[i]! - 0.1)
      if (t % 8 === 0 && rng() < 0.75) notes.push({ lane: irand(rng, lanes), z: 1 })
      for (const n of notes) n.z -= 0.012
      notes = notes.filter(n => {
        if (n.z <= 0) {
          flash[n.lane] = 1
          streak++
          if (rng() < 0.01) streak = 0
          return false
        }
        return true
      })
    },
    draw(px) {
      px.fill(0x0a0612)
      for (let y = top; y < H; y++) {
        const z = clamp((strike - y) / (strike - top), -0.2, 1)
        const s = 0.35 + 0.65 * (1 - z)
        const w = W * 0.85 * s
        rect(px, W, H, W / 2 - w / 2, y, w, 1, 0x2a1a24)
        for (let k = 0; k <= lanes; k++) dot(px, W, H, W / 2 - w / 2 + (k * w) / lanes, y, 0x5a4a5a)
        if (Math.floor(z * 20 + t * 0.24) % 4 === 0) rect(px, W, H, W / 2 - w / 2, y, w, 1, 0x3a2a34)
      }
      for (let i = 0; i < lanes; i++) {
        const [x] = proj(i, 0)
        ring(px, W, H, x, strike, 2, flash[i]! > 0 ? 0xffffff : (COLS[i] as number))
        if (flash[i]! > 0.3) for (let k = 0; k < 4; k++) dot(px, W, H, x + Math.cos(k * 1.6 + t) * 3 * flash[i]!, strike - 3 * flash[i]! + Math.sin(k) * 2, COLS[i] as number)
      }
      for (const n of notes) {
        const [x, y] = proj(n.lane, n.z)
        const r = 0.6 + (1 - n.z) * 1.4
        disc(px, W, H, x, y, r, COLS[n.lane] as number)
        dot(px, W, H, x, y, 0xffffff)
      }
      text(px, W, H, 1, 1, String(streak), 0xffe040)
    },
  }
}

// --- bass drop --------------------------------------------------------------------

const bassdrop: Maker = (W, H, rng) => {
  let t = 0
  const cycle = 220
  let rings: { r: number }[] = []

  return {
    step() {
      t++
      const c = t % cycle
      if (c === 120) rings.push({ r: 1 })
      if (c > 120 && c % 8 === 0) rings.push({ r: 1 })
      for (const r of rings) r.r += 1.2
      rings = rings.filter(r => r.r < H)
      void rng
    },
    draw(px) {
      const c = t % cycle
      const build = Math.min(1, c / 120)
      const drop = c >= 120
      const strobe = drop && Math.floor(c / 2) % 2 === 0
      const shake = drop ? (Math.sin(t * 2.3) * 1.5 * kick(t)) | 0 : 0
      sky(px, W, H, drop ? (strobe ? 0x3a0a5a : 0x0a0214) : mix(0x05050f, 0x1a0a2a, build), 0x05030a)
      if (!drop) {
        const speed = 1 + build * 6
        for (let k = 0; k < 8; k++) {
          const y = H - (((t * speed) + k * 9) % H)
          rect(px, W, H, 0, y, W, 1, hsv(0.8 - build * 0.3, 0.7, 0.3 + build * 0.5))
        }
      }
      for (const r of rings) ring(px, W, H, W / 2 + shake, H * 0.45, r.r, hsv(0.85 - r.r * 0.01, 0.8, 1))
      const pump = drop ? kick(t) : build * 0.3 * kick(t)
      for (const sy of [H * 0.25, H * 0.65]) {
        const cx = W / 2 + shake
        rect(px, W, H, cx - 8, sy - 8, 16, 16, 0x1a1a1e)
        disc(px, W, H, cx, sy, 5 + pump * 1.5, 0x3a3a42)
        disc(px, W, H, cx, sy, 2 + pump, 0x5a5a62)
        ring(px, W, H, cx, sy, 6, 0x2a2a30)
      }
      const bar = Math.floor(build * (W - 4))
      if (!drop) {
        rect(px, W, H, 2, H - 4, W - 4, 2, 0x2a2a3a)
        rect(px, W, H, 2, H - 4, bar, 2, hsv(0.9 - build * 0.4, 0.8, 1))
      }
    },
  }
}

// --- DJ decks ---------------------------------------------------------------------

const djdecks: Maker = (W, H, rng) => {
  let t = 0
  let fader = 0.5
  let target = 0.5
  const hands = Array.from({ length: 8 }, () => rng() * 6)

  return {
    step() {
      t++
      if (t % 60 === 0) target = rng()
      fader += (target - fader) * 0.05
    },
    draw(px) {
      const b = beatOf(t)
      sky(px, W, H, mix(0x14081e, 0x3a1040, kick(t) * 0.5), 0x0a0410)
      for (let i = 0; i < 4; i++) {
        const a = Math.sin(t * 0.04 + i) * 0.8
        line(px, W, H, W * (i / 3), 0, W * (i / 3) + Math.sin(a) * H * 0.5, H * 0.45, hsv((i * 0.25 + t * 0.003) % 1, 0.7, 0.6))
      }
      const deckY = H * 0.5
      rect(px, W, H, 1, deckY - 8, W - 2, 16, 0x2a2a30)
      rect(px, W, H, 1, deckY - 8, W - 2, 1, 0x4a4a52)
      for (const [cx, dir] of [
        [W * 0.25, 1],
        [W * 0.75, -1],
      ] as [number, number][]) {
        disc(px, W, H, cx, deckY, 6, 0x101014)
        ring(px, W, H, cx, deckY, 4, 0x1e1e24)
        disc(px, W, H, cx, deckY, 1.5, dir > 0 ? 0xe03a3a : 0x3a8ae0)
        const a = t * 0.25 * dir
        dot(px, W, H, cx + Math.cos(a) * 3, deckY + Math.sin(a) * 3, 0xd0d0d8)
        line(px, W, H, cx + 6, deckY - 6, cx + 3, deckY - 1, 0xb0b0b8)
      }
      rect(px, W, H, W / 2 - 2, deckY - 6, 4, 12, 0x1a1a1e)
      rect(px, W, H, W / 2 - 2 + fader * 3, deckY + 3, 1, 2, 0xffffff)
      for (let k = 0; k < 3; k++) dot(px, W, H, W / 2 - 1 + k, deckY - 4 + ((Math.floor(b) + k) % 3), 0x3aff6a)
      sprite(px, W, H, W / 2 - 3, deckY - 15, ['.hhh.', 'hssh.', '.sss.', 'ccccc', 'ccccc'], { h: 0x1a1a1a, s: 0xc8906a, c: 0x2a2a2a })
      for (let i = 0; i < hands.length; i++) {
        const x = 2 + i * (W / hands.length)
        const up = Math.sin(t * 0.5 + (hands[i] as number)) > 0 ? 2 : 0
        rect(px, W, H, x, H - 6 - up, 1, 3 + up, 0xd8a080)
        disc(px, W, H, x + 1, H - 2, 2, 0x1a1020)
      }
    },
  }
}

// --- rhythm circles ---------------------------------------------------------------

const rhythm: Maker = (W, H, rng) => {
  type C = { x: number; y: number; t0: number; n: number; c: number; hit: number }
  let cs: C[] = []
  let cursor = { x: W / 2, y: H / 2 }
  let combo = 0
  let t = 0
  let n = 1
  const life = 30

  return {
    step() {
      t++
      if (t % 10 === 0) {
        const last = cs[cs.length - 1]
        const x = clamp((last ? last.x : W / 2) + (rng() - 0.5) * W * 0.8, 4, W - 5)
        const y = 10 + rng() * (H - 18)
        cs.push({ x, y, t0: t, n: n++ % 9 || 9, c: hsv(rng(), 0.6, 1), hit: 0 })
      }
      for (const c of cs) {
        if (!c.hit && t - c.t0 >= life) {
          c.hit = t
          combo++
        }
      }
      const target = cs.find(c => !c.hit)
      if (target) {
        cursor.x += (target.x - cursor.x) * 0.25
        cursor.y += (target.y - cursor.y) * 0.25
      }
      cs = cs.filter(c => !c.hit || t - c.hit < 8)
    },
    draw(px) {
      sky(px, W, H, 0x14102a, 0x2a1a3a)
      const pending = cs.filter(c => !c.hit)
      for (let i = 1; i < pending.length; i++) line(px, W, H, pending[i - 1]!.x, pending[i - 1]!.y, pending[i]!.x, pending[i]!.y, 0x3a2a5a)
      for (const c of cs.slice().reverse()) {
        if (c.hit) {
          const f = (t - c.hit) / 8
          ring(px, W, H, c.x, c.y, 3 + f * 3, mix(c.c, 0x14102a, f))
          if (f < 0.6) text(px, W, H, c.x - 5, c.y - 2, '300', 0x6ad0ff)
          continue
        }
        const a = 1 - (t - c.t0) / life
        disc(px, W, H, c.x, c.y, 3, c.c)
        ring(px, W, H, c.x, c.y, 3, 0xffffff)
        text(px, W, H, c.x - 1, c.y - 2, String(c.n), 0xffffff)
        ring(px, W, H, c.x, c.y, 3 + a * 6, mix(c.c, 0xffffff, 0.3))
      }
      disc(px, W, H, cursor.x, cursor.y, 1.2, 0xffe080)
      text(px, W, H, 1, H - 7, String(combo), 0xffffff)
    },
  }
}

// --- disco floor ------------------------------------------------------------------

const disco: Maker = (W, H, rng) => {
  const top = Math.round(H * 0.3)
  const cs = 4
  let t = 0
  let pattern = 0
  const dancers = Array.from({ length: 5 }, () => ({ x: 2 + rng() * (W - 4), y: top + 6 + rng() * (H - top - 10), c: hsv(rng(), 0.6, 1) }))

  return {
    step() {
      t++
      if (t % 120 === 0) pattern = (pattern + 1) % 4
    },
    draw(px) {
      const b = Math.floor(beatOf(t))
      px.fill(0x0a0614)
      sky(px, W, H, 0x0a0614, 0x1a0a24, top)
      line(px, W, H, W / 2, 0, W / 2, 6, 0x8a8a8a)
      disc(px, W, H, W / 2, 9, 3.5, 0xc0c0d0)
      for (let k = 0; k < 8; k++) dot(px, W, H, W / 2 - 3 + ((k * 3 + b) % 7), 7 + (k % 4) * 1.5, 0xffffff)
      for (let k = 0; k < 10; k++) {
        const a = t * 0.03 + k * 0.63
        dot(px, W, H, W / 2 + Math.cos(a) * (6 + k * 1.5), 9 + Math.sin(a) * (3 + k * 2) + 6, hsv(k / 10, 0.4, 1))
      }
      for (let y = top; y < H; y += cs)
        for (let x = 0; x < W; x += cs) {
          const i = x / cs
          const j = (y - top) / cs
          let on = false
          if (pattern === 0) on = (i + j + b) % 2 === 0
          else if (pattern === 1) on = (j + b) % 4 === 0 || (i + b) % 4 === 0
          else if (pattern === 2) on = Math.floor(Math.hypot(i - W / cs / 2, j - (H - top) / cs / 2) - b) % 3 === 0
          else on = hash(i, j, b) > 0.6
          const c = on ? hsv((i * 0.1 + j * 0.07 + b * 0.13) % 1, 0.75, 1) : 0x1a1426
          rect(px, W, H, x, y, cs - 1, cs - 1, c)
        }
      for (const d of dancers) {
        const up = (b + Math.floor(d.x)) % 2
        sprite(px, W, H, d.x - 1, d.y - 5 - up, [up ? 'x.x' : '.x.', '.h.', 'ccc', '.c.', 'c.c'], { x: 0xe0b090, h: 0xe0b090, c: d.c })
      }
    },
  }
}

// --- stadium wave -----------------------------------------------------------------

const stadiumwave: Maker = (W, H, rng) => {
  const rows = Math.max(4, Math.floor(H * 0.5 / 4))
  const seats = Math.floor(W / 2)
  const shirt = Array.from({ length: rows * seats }, () => pick(rng, [0xe03a3a, 0xffffff, 0x3a6ae0, 0xffd040, 0xe03a3a]))
  let t = 0

  return {
    step() {
      t++
    },
    draw(px) {
      px.fill(0x3a3a4a)
      sky(px, W, H, 0x1a2a5a, 0x3a4a7a, 6)
      for (let k = 0; k < 4; k++) disc(px, W, H, 4 + k * 8, 3, 1.5, 0xffffe0)
      const top = 6
      const wave = (t * 0.5) % (seats + 20) - 10
      for (let r = 0; r < rows; r++) {
        const y = top + r * 4
        rect(px, W, H, 0, y + 3, W, 1, 0x5a5a6a)
        for (let s = 0; s < seats; s++) {
          const d = Math.abs(s - wave - r * 0.6)
          const up = d < 2.5 ? (d < 1.2 ? 2 : 1) : 0
          const x = s * 2
          dot(px, W, H, x, y + 1 - up, 0xe0b090)
          dot(px, W, H, x, y + 2 - up, shirt[r * seats + s] as number)
          if (up === 2) dot(px, W, H, x, y - 1 - up + 1, 0xe0b090)
        }
      }
      const field = top + rows * 4 + 1
      for (let y = field; y < H; y++) rect(px, W, H, 0, y, W, 1, Math.floor((y - field) / 3) % 2 ? 0x3aa03a : 0x46b046)
      rect(px, W, H, 0, field, W, 1, 0xffffff)
      ring(px, W, H, W / 2, field + (H - field) / 2, 4, 0xffffff)
    },
  }
}

// --- conga line -------------------------------------------------------------------

const conga: Maker = (W, H, rng) => {
  let path: [number, number][] = [[W / 2, H / 2]]
  let n = 3
  let t = 0
  let ang = 0
  let x = W / 2
  let y = H / 2
  const cols: number[] = Array.from({ length: 40 }, () => hsv(rng(), 0.6, 1))
  let joiners: { x: number; y: number; c: number }[] = []

  return {
    step() {
      t++
      ang += Math.sin(t * 0.02) * 0.06 + 0.02
      x += Math.cos(ang) * 0.4
      y += Math.sin(ang) * 0.4
      if (x < 3 || x > W - 4) ang = Math.PI - ang
      if (y < 6 || y > H - 4) ang = -ang
      x = clamp(x, 3, W - 4)
      y = clamp(y, 6, H - 4)
      path.unshift([x, y])
      if (path.length > 600) path.pop()
      if (joiners.length < 2 && rng() < 0.01) joiners.push({ x: rng() * W, y: 6 + rng() * (H - 10), c: n })
      const tail = path[Math.min(path.length - 1, n * 6)] as [number, number]
      joiners = joiners.filter(j => {
        const d = Math.hypot(tail[0] - j.x, tail[1] - j.y) || 1
        j.x += ((tail[0] - j.x) / d) * Math.min(d, 0.7)
        j.y += ((tail[1] - j.y) / d) * Math.min(d, 0.7)
        if (Math.hypot(tail[0] - j.x, tail[1] - j.y) < 2) {
          n++
          return false
        }
        return true
      })
      if (n > 30) {
        n = 3
        path = path.slice(0, 20)
      }
    },
    draw(px) {
      const b = Math.floor(beatOf(t))
      for (let yy = 0; yy < H; yy++) for (let xx = 0; xx < W; xx++) px[yy * W + xx] = (Math.floor(xx / 4) + Math.floor(yy / 4)) % 2 ? 0x2a1a3a : 0x342244
      const person = (px0: number, py0: number, c: number, kickLeg: boolean) => {
        dot(px, W, H, px0, py0 - 3, 0xe0b090)
        dot(px, W, H, px0, py0 - 2, c)
        dot(px, W, H, px0, py0 - 1, c)
        dot(px, W, H, px0 + (kickLeg ? 1 : 0), py0, 0x2a2a4a)
      }
      for (let i = n - 1; i >= 0; i--) {
        const p = path[Math.min(path.length - 1, i * 6)] as [number, number]
        person(p[0], p[1], cols[i % cols.length] as number, (b + i) % 2 === 0)
      }
      for (const j of joiners) person(j.x, j.y, cols[j.c % cols.length] as number, false)
      text(px, W, H, 1, 1, String(n), 0xffffff)
    },
  }
}

// --- dancing fountain -------------------------------------------------------------

const fountain: Maker = (W, H, rng) => {
  const pool = Math.round(H * 0.8)
  const jets = Math.max(3, Math.floor(W / 5))
  let drops: { x: number; y: number; vx: number; vy: number; c: number }[] = []
  let t = 0

  return {
    step() {
      t++
      const b = beatOf(t)
      for (let j = 0; j < jets; j++) {
        if ((t + j) % 2) continue
        const x = (j + 0.5) * (W / jets)
        const phase = Math.floor(b / 8) % 3
        const h = phase === 0 ? 0.5 + 0.5 * Math.sin(b * 0.8 + j * 0.9) : phase === 1 ? (j % 2 === Math.floor(b) % 2 ? 1 : 0.2) : 1 - Math.abs(j - jets / 2 + 0.5) / jets
        const v = 1.2 + h * 2.2
        for (let k = 0; k < 1; k++) drops.push({ x, y: pool, vx: (rng() - 0.5) * 0.15 + (phase === 2 ? (j - jets / 2) * 0.05 : 0), vy: -v * (0.9 + rng() * 0.15), c: hsv((j / jets + t * 0.002) % 1, 0.5, 1) })
      }
      for (const d of drops) {
        d.vy += 0.09
        d.x += d.vx
        d.y += d.vy
      }
      drops = drops.filter(d => d.y <= pool)
    },
    draw(px) {
      sky(px, W, H, 0x050818, 0x1a1030, pool)
      for (let x = 0; x < W; x++) rect(px, W, H, x, pool - 8 - ((x * 7) % 6), 1, 8, 0x0a0a18)
      for (let y = pool; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y + (t >> 2)) % 6 === 0 ? 0x2a3a6a : 0x141a3a
      for (const d of drops) {
        dot(px, W, H, d.x, d.y, d.c)
        const ry = pool + (pool - d.y) * 0.15
        if (ry < H && (Math.floor(d.y) % 3 === 0)) dot(px, W, H, d.x, ry, scale(d.c, 0.4))
      }
    },
  }
}

// --- marble xylophone -------------------------------------------------------------

const xylophone: Maker = (W, H, rng) => {
  const n = 8
  const bars = Array.from({ length: n }, (_, i) => ({ x: i % 2 ? W * 0.62 : W * 0.38, y: 8 + i * ((H - 14) / n), c: hsv(i / n, 0.75, 1), flash: 0 }))
  type M = { x: number; y: number; vx: number; vy: number; bar: number; c: number }
  let ms: M[] = []
  let t = 0

  return {
    step() {
      t++
      for (const b of bars) b.flash = Math.max(0, b.flash - 0.08)
      if (t % 30 === 0) ms.push({ x: bars[0]!.x - 6, y: 2, vx: 0.35, vy: 0, bar: 0, c: hsv(rng(), 0.4, 1) })
      for (const m of ms) {
        m.vy += 0.12
        m.x += m.vx
        m.y += m.vy
        const b = bars[m.bar]
        if (b && m.vy > 0 && m.y >= b.y - 1 && Math.abs(m.x - b.x) < 5) {
          m.y = b.y - 1
          b.flash = 1
          m.vy = -1.2
          const nb = bars[m.bar + 1]
          m.vx = nb ? (nb.x - b.x) / 22 : 0.5
          m.bar++
        }
      }
      ms = ms.filter(m => m.y < H + 3)
    },
    draw(px) {
      sky(px, W, H, 0x1a1a2a, 0x2a2238)
      for (const b of bars) {
        rect(px, W, H, b.x - 5, b.y, 10, 2, mix(b.c, 0xffffff, b.flash * 0.7))
        dot(px, W, H, b.x - 4, b.y + 1, 0x8a8a8a)
        dot(px, W, H, b.x + 4, b.y + 1, 0x8a8a8a)
        if (b.flash > 0.5) ring(px, W, H, b.x, b.y, (1 - b.flash) * 8 + 2, b.c)
      }
      for (const m of ms) {
        disc(px, W, H, m.x, m.y, 1, m.c)
        dot(px, W, H, m.x - 0.4, m.y - 0.4, 0xffffff)
      }
    },
  }
}

// --- dancing robot ----------------------------------------------------------------

const robot: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.85)
  let t = 0
  let pose = [0, 0, 0, 0]
  let target = [0, 0, 0, 0]
  void rng

  return {
    step() {
      t++
      if (t % 8 === 0) {
        const b = Math.floor(beatOf(t))
        target = [((b * 3) % 5) - 2, ((b * 7) % 5) - 2, b % 3 === 0 ? 1 : 0, (b % 4) - 1.5].map(v => v * 0.7)
      }
      // snap: robots don't ease, they tick
      pose = pose.map((p, i) => p + Math.sign((target[i] as number) - p) * Math.min(Math.abs((target[i] as number) - p), 0.35))
    },
    draw(px) {
      sky(px, W, H, 0x0a1a2a, 0x1a2a3a, floor)
      for (let y = 0; y < floor; y += 4) rect(px, W, H, 0, y, W, 1, 0x12223a)
      for (let x = 0; x < W; x += 4) rect(px, W, H, x, 0, 1, floor, 0x12223a)
      rect(px, W, H, 0, floor, W, H - floor, 0x2a2a34)
      const cx = W / 2
      const bob = pose[2] as number
      const hipY = floor - 9 + bob
      const metal = 0xc8ccd4
      const dark = 0x8a8e98
      rect(px, W, H, cx - 3, hipY - 9, 7, 9, metal)
      rect(px, W, H, cx - 1, hipY - 7, 3, 2, Math.floor(beatOf(t)) % 2 ? 0xff3a6a : 0x3aff8a)
      rect(px, W, H, cx - 2, hipY - 14, 5, 5, metal)
      rect(px, W, H, cx - 1, hipY - 12, 1, 1, 0x3ad0ff)
      rect(px, W, H, cx + 1, hipY - 12, 1, 1, 0x3ad0ff)
      dot(px, W, H, cx, hipY - 16, dark)
      dot(px, W, H, cx, hipY - 17, 0xff3a3a)
      const arm = (sx: number, a: number, side: number) => {
        const ex = sx + side * 3
        const ey = hipY - 8 + Math.round(a) * 2
        line(px, W, H, sx, hipY - 8, ex, ey, dark)
        line(px, W, H, ex, ey, ex + (a > 0 ? 0 : side * 2), ey + (a > 0 ? -3 : 2), metal)
      }
      arm(cx - 3, pose[0] as number, -1)
      arm(cx + 3, pose[1] as number, 1)
      const legSpread = 1 + Math.abs(pose[3] as number)
      line(px, W, H, cx - 1, hipY, cx - legSpread, floor - 1, dark)
      line(px, W, H, cx + 1, hipY, cx + legSpread, floor - 1, dark)
      rect(px, W, H, cx - legSpread - 1, floor - 1, 2, 1, metal)
      rect(px, W, H, cx + legSpread, floor - 1, 2, 1, metal)
    },
  }
}

export const MUSIC = {
  visualiser,
  pianotiles,
  trenddance,
  guitar,
  bassdrop,
  djdecks,
  rhythm,
  disco,
  stadiumwave,
  conga,
  fountain,
  xylophone,
  robot,
}

