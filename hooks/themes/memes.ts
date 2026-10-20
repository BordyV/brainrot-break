import { disc, dot, hsv, mix, rect, scale, sky, text } from '../draw'
import type { Maker } from '../draw'
import { burst, ellipse, hash, irand, line, pick, poly, ring, sparks } from '../kit'
import type { Spark } from '../kit'

// Internet memes & brainrot: original characters only, no named memes.

// --- absurd creature parade -------------------------------------------------------

const creatures: Maker = (W, H, rng) => {
  const u = W / 32
  const gy = Math.round(H * 0.8)
  type Creature = { body: number; legs: number; hat: number; hue: number }
  const fresh = (prev?: Creature): Creature => {
    let body = irand(rng, 5)
    if (prev && body === prev.body) body = (body + 1 + irand(rng, 4)) % 5
    return { body, legs: irand(rng, 4), hat: irand(rng, 4), hue: rng() }
  }
  let cur = fresh()
  let t = 0
  let x = -14 * u
  let walk = 0
  let confetti: Spark[] = []
  const ENTER = 45
  const SHOW = 60

  return {
    step() {
      t++
      if (t < ENTER) {
        x += (W / 2 + 14 * u) / ENTER
        walk++
      } else if (t < ENTER + SHOW) {
        x = W / 2
        if (t === ENTER + 4) burst(confetti, rng, W / 2, H * 0.3, hsv(rng(), 0.7, 1), 16, 1.4)
        if (t === ENTER + 20) burst(confetti, rng, W * 0.3, H * 0.25, hsv(rng(), 0.7, 1), 10, 1.2)
        if (t === ENTER + 30) burst(confetti, rng, W * 0.7, H * 0.25, hsv(rng(), 0.7, 1), 10, 1.2)
      } else if (x < W + 14 * u) {
        x += (W / 2 + 14 * u) / ENTER
        walk++
      } else {
        cur = fresh(cur)
        t = 0
        x = -14 * u
      }
      confetti = sparks(confetti, 0.04)
    },
    draw(px) {
      const showing = t >= ENTER && t < ENTER + SHOW
      const spin = t * (showing ? 0.06 : 0.015)
      const a = hsv(cur.hue, 0.45, 1)
      const b = hsv(cur.hue, 0.6, 0.85)
      const cx0 = W / 2
      const cy0 = H * 0.42
      for (let y = 0; y < gy; y++)
        for (let xx = 0; xx < W; xx++) {
          const ang = Math.atan2(y - cy0, xx - cx0) + spin
          px[y * W + xx] = Math.floor(((ang + Math.PI * 4) / (Math.PI * 2)) * 14) % 2 ? a : b
        }
      rect(px, W, H, 0, gy, W, H - gy, 0x3a2a4a)
      rect(px, W, H, 0, gy, W, 1, 0x6a4a8a)
      ellipse(px, W, H, x, gy, 8 * u, 1.2, 0x2a1a3a)

      const bounce = showing ? Math.abs(Math.sin(t * 0.35)) * 3 * u : Math.abs(Math.sin(walk * 0.5)) * u
      const cy = gy - 9 * u - bounce
      const ry = 5 * u
      const rx = 8 * u
      const ph = showing ? Math.sin(t * 0.7) : Math.sin(walk * 0.5)
      const legTop = cy + ry - 1

      // legs first, the body covers their tops
      for (const side of [-1, 1]) {
        const lx = x + side * 3 * u
        const swing = ph * side * 2 * u
        if (cur.legs === 0) {
          // sneakers
          line(px, W, H, lx, legTop, lx + swing, gy - 2, 0xd8a070)
          rect(px, W, H, lx + swing - u, gy - 2, 3.5 * u, 2, 0xffffff)
          rect(px, W, H, lx + swing - u, gy - 1, 3.5 * u, 1, 0xe03a3a)
        } else if (cur.legs === 1) {
          // chicken legs
          line(px, W, H, lx, legTop, lx + swing, gy - 1, 0xf0a020)
          line(px, W, H, lx + swing, gy - 1, lx + swing + 2 * u, gy - 1, 0xf0a020)
          dot(px, W, H, lx + swing - 1, gy - 1, 0xf0a020)
        } else if (cur.legs === 2) {
          // wheels
          const r = 2.2 * u
          disc(px, W, H, lx, gy - r, r, 0x202020)
          const sa = -(walk + t) * 0.4
          dot(px, W, H, lx + Math.cos(sa) * r * 0.6, gy - r + Math.sin(sa) * r * 0.6, 0xc0c0c0)
          dot(px, W, H, lx, gy - r, 0x808080)
        } else {
          // tentacles
          for (let k = 0; k <= 8; k++) {
            const yy = legTop + ((gy - legTop) * k) / 8
            dot(px, W, H, lx + Math.sin(k * 0.8 + walk * 0.5 + side) * u * 1.5, yy, 0xb050c0)
            dot(px, W, H, lx + 1 + Math.sin(k * 0.8 + walk * 0.5 + side) * u * 1.5, yy, 0xb050c0)
          }
        }
      }

      // body
      let eyeX = x + 3 * u
      let eyeY = cy - 1.5 * u
      if (cur.body === 0) {
        // shark
        poly(px, W, H, [[x - u, cy - ry + 1], [x + 2 * u, cy - ry - 4 * u], [x + 3 * u, cy - ry + 1]], 0x5a6c80)
        poly(px, W, H, [[x - rx + 1, cy], [x - rx - 4 * u, cy - 4 * u], [x - rx - 3 * u, cy + 3 * u]], 0x5a6c80)
        ellipse(px, W, H, x, cy, rx + u, ry, 0x7a8ca0)
        ellipse(px, W, H, x + u, cy + 2 * u, rx - u, ry * 0.5, 0xe8eef4)
        for (let k = 0; k < 4; k++) dot(px, W, H, x + 4 * u + k * 1.2 * u, cy + u + (k % 2), 0xffffff)
        line(px, W, H, x + 3 * u, cy + u, x + rx, cy + u, 0x3a2030)
        dot(px, W, H, x + 2 * u, cy - u, 0x3a4a5a)
      } else if (cur.body === 1) {
        // bread loaf
        ellipse(px, W, H, x, cy - ry * 0.3, rx, ry * 0.8, 0xc07830)
        rect(px, W, H, x - rx, cy - ry * 0.3, rx * 2 + 1, ry * 1.3, 0xc07830)
        ellipse(px, W, H, x, cy - ry * 0.3, rx - 1, ry * 0.8 - 1, 0xe0a050)
        rect(px, W, H, x - rx + 1, cy - ry * 0.3, rx * 2 - 1, ry * 1.3 - 1, 0xf0d090)
        for (let k = -1; k <= 1; k++) line(px, W, H, x + k * 3 * u - u, cy - ry * 0.9, x + k * 3 * u + u, cy - ry * 0.6, 0xa06020)
      } else if (cur.body === 2) {
        // coffee cup
        ring(px, W, H, x - rx, cy, 2.5 * u, 0xf0eadc)
        poly(px, W, H, [[x - rx, cy - ry], [x + rx, cy - ry], [x + rx - 2 * u, cy + ry], [x - rx + 2 * u, cy + ry]], 0xf0eadc)
        rect(px, W, H, x - rx + 1, cy - ry, rx * 2 - 1, 1.5 * u, 0x5a3418)
        rect(px, W, H, x - rx + 2 * u, cy + u, rx * 2 - 4 * u, 1.5 * u, 0xe05a5a)
        for (let k = 0; k < 3; k++) dot(px, W, H, x + Math.sin(t * 0.3 + k) * u - u, cy - ry - 2 - k * 2, 0xffffff)
        eyeY = cy - 2 * u + 2
      } else if (cur.body === 3) {
        // tomato
        disc(px, W, H, x, cy, ry + u, 0xe03a2a)
        disc(px, W, H, x - 2 * u, cy - 2 * u, u, 0xff8a7a)
        poly(px, W, H, [[x - 3 * u, cy - ry - u], [x, cy - ry + u], [x + 3 * u, cy - ry - u], [x, cy - ry - 3 * u]], 0x3aa03a)
        eyeX = x + 2 * u
      } else {
        // cactus
        rect(px, W, H, x - 3 * u, cy - ry - 2 * u, 6 * u + 1, ry * 2 + 2 * u, 0x3a9a4a)
        rect(px, W, H, x - 7 * u, cy - 2 * u, 4 * u, 2 * u, 0x3a9a4a)
        rect(px, W, H, x - 7 * u, cy - 6 * u, 2 * u, 4 * u, 0x3a9a4a)
        rect(px, W, H, x + 3 * u, cy, 4 * u, 2 * u, 0x3a9a4a)
        rect(px, W, H, x + 5 * u, cy - 4 * u, 2 * u, 4 * u, 0x3a9a4a)
        for (let k = 0; k < 6; k++) dot(px, W, H, x - 2 * u + (k % 3) * 2 * u, cy - ry + Math.floor(k / 3) * 6 * u, 0xd0f0a0)
        dot(px, W, H, x - 1, cy - ry - 2 * u - 1, 0xff60a0)
        eyeX = x + u
        eyeY = cy - 2 * u
      }

      // googly eyes that wobble
      const er = Math.max(1, 1.6 * u)
      for (const k of [0, 1]) {
        const ex = eyeX + k * (er * 2 + 0.5)
        disc(px, W, H, ex, eyeY, er, 0xffffff)
        const wob = t * 0.5 + k * 2
        dot(px, W, H, ex + Math.round(Math.cos(wob) * (er - 0.6)), eyeY + Math.round(Math.sin(wob) * (er - 0.6)), 0x101010)
      }

      // hat
      const top = cur.body === 4 ? cy - ry - 2 * u : cur.body === 3 ? cy - ry - 3 * u : cy - ry - (cur.body === 0 ? 0 : 0.5)
      const hx = cur.body === 0 ? x - 3 * u : x
      if (cur.hat === 0) {
        rect(px, W, H, hx - 3 * u, top - 2 * u, 6 * u + 1, 2 * u, 0xf0c020)
        for (let k = -1; k <= 1; k++) dot(px, W, H, hx + k * 3 * u, top - 3 * u, 0xf0c020)
        dot(px, W, H, hx, top - u, 0xe03a5a)
      } else if (cur.hat === 1) {
        ellipse(px, W, H, hx, top - u, 3 * u, 1.5 * u, 0x3a6ae0)
        rect(px, W, H, hx, top - 3 * u, 1, 2 * u, 0x404040)
        const pr = 3 * u * Math.cos(t * 0.9)
        line(px, W, H, hx - pr, top - 3 * u, hx + pr, top - 3 * u, 0xe03a3a)
      } else if (cur.hat === 2) {
        rect(px, W, H, hx - 5 * u, top - u, 10 * u + 1, u + 0.5, 0x8a5a2a)
        rect(px, W, H, hx - 2.5 * u, top - 4 * u, 5 * u + 1, 3 * u, 0x8a5a2a)
        rect(px, W, H, hx - 2.5 * u, top - 1.8 * u, 5 * u + 1, 0.8 * u, 0x3a2010)
      }

      for (const s of confetti) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- split screen: kinetic sand above, parkour below ------------------------------

const splitrunner: Maker = (W, H, rng) => {
  const mid = Math.floor(H / 2)
  // top: a layered sand block cut slice by slice
  const tray = mid - 3
  const pile = new Uint32Array(W * mid)
  const heap = new Int32Array(W).fill(tray)
  let bx0 = 0
  let bx1 = 0
  let bTop = 0
  let layers: number[] = []
  let cutX = 0
  let knife = 0
  let grains: { x: number; y: number; vx: number; vy: number; c: number }[] = []
  const newBlock = () => {
    const w = Math.max(6, Math.round(W * 0.42))
    bx0 = Math.round(W * 0.48)
    bx1 = bx0 + w
    bTop = Math.max(2, Math.round(tray - mid * 0.55))
    const h0 = rng()
    const n = 4 + irand(rng, 3)
    layers = Array.from({ length: n }, (_, i) => hsv(h0 + i * 0.09, 0.45, 0.95))
    cutX = bx0
    knife = 0
    pile.fill(0)
    heap.fill(tray)
  }
  newBlock()
  const layerAt = (y: number) => layers[Math.min(layers.length - 1, Math.floor(((y - bTop) / (tray - bTop)) * layers.length))] as number

  // bottom: rooftops scrolling under a runner
  type Roof = { x: number; w: number; y: number; c: number }
  let roofs: Roof[] = []
  const baseY = mid + Math.round((H - mid) * 0.6)
  const addRoof = (x: number) => {
    const prev = roofs[roofs.length - 1]
    const y = prev ? Math.max(mid + 6, Math.min(H - 4, prev.y + irand(rng, 7) - 3)) : baseY
    roofs.push({ x, w: 14 + irand(rng, 16), y, c: pick(rng, [0x3a3050, 0x4a3a5a, 0x2a3a50]) })
  }
  addRoof(-4)
  while ((roofs[roofs.length - 1] as Roof).x < W * 2) {
    const r = roofs[roofs.length - 1] as Roof
    addRoof(r.x + r.w + 4 + irand(rng, 5))
  }
  const rx = Math.round(W * 0.3)
  let ry = baseY
  let vy = 0
  let air = false
  let flip = 0
  let run = 0
  let scroll = 0

  return {
    step() {
      // top
      if (knife === 0 && grains.length === 0) {
        if (cutX >= bx1) newBlock()
        else knife = 1
      } else if (knife > 0) {
        knife += 2
        const ky = bTop - 4 + knife
        if (ky >= tray) {
          const th = 2
          for (let x = cutX; x < Math.min(bx1, cutX + th); x++)
            for (let y = bTop; y < tray; y++)
              grains.push({ x, y, vx: -0.15 - rng() * 0.5, vy: -rng() * 0.3, c: layerAt(y) })
          cutX += th
          knife = 0
        }
      }
      const next: typeof grains = []
      for (const g of grains) {
        g.vy += 0.12
        g.x += g.vx
        g.y += g.vy
        let ix = Math.round(g.x)
        if (ix < 0) ix = 0
        if (ix >= cutX) ix = cutX - 1
        if (ix < 0) continue
        if (g.y >= (heap[ix] as number) - 1) {
          // slide down to a lower neighbour, like sand
          for (let k = 0; k < 3; k++) {
            const h = heap[ix] as number
            if (ix > 0 && (heap[ix - 1] as number) > h + 1) ix--
            else if (ix + 1 < cutX && (heap[ix + 1] as number) > h + 1) ix++
            else break
          }
          const y = (heap[ix] as number) - 1
          if (y >= 0) {
            pile[y * W + ix] = g.c
            heap[ix] = y
          }
        } else next.push(g)
      }
      grains = next

      // bottom
      scroll += 1
      run++
      for (const r of roofs) r.x -= 1
      if ((roofs[0] as Roof).x + (roofs[0] as Roof).w < -2) roofs.shift()
      const last = roofs[roofs.length - 1] as Roof
      if (last.x < W * 2) addRoof(last.x + last.w + 4 + irand(rng, 5))
      const under = roofs.find(r => rx >= r.x && rx < r.x + r.w)
      if (!air) {
        const edge = under ? under.x + under.w - rx : 0
        if (!under || edge <= 2) {
          const nxt = roofs.find(r => r.x > rx) as Roof
          vy = nxt.y < ry ? -2.6 : -2.1
          air = true
          flip = rng() < 0.25 ? 1 : 0
        } else ry = under.y
      } else {
        vy += 0.25
        ry += vy
        if (flip > 0) flip++
        if (under && vy > 0 && ry >= under.y && ry - vy <= under.y + 1) {
          ry = under.y
          vy = 0
          air = false
          flip = 0
        }
        if (ry > H + 6) {
          ry = mid
          vy = 0
        }
      }
    },
    draw(px) {
      // top half: a studio table
      for (let y = 0; y < mid; y++) {
        const c = mix(0xf4e4d8, 0xe8c8c0, y / mid)
        for (let x = 0; x < W; x++) px[y * W + x] = c
      }
      rect(px, W, H, 0, tray, W, mid - tray, 0xb8b0c8)
      rect(px, W, H, 0, tray, W, 1, 0xd8d0e8)
      for (let y = 0; y < tray; y++)
        for (let x = 0; x < W; x++) {
          const c = pile[y * W + x] as number
          if (c) px[y * W + x] = c
        }
      for (let y = bTop; y < tray; y++) {
        const c = layerAt(y)
        for (let x = cutX; x < bx1; x++) px[y * W + x] = hash(x, y, 7) < 0.15 ? scale(c, 0.92) : c
      }
      for (const g of grains) dot(px, W, H, g.x, g.y, g.c)
      if (knife > 0) {
        const ky = bTop - 4 + knife
        rect(px, W, H, cutX + 1, ky - (tray - bTop) - 2, 1, tray - bTop + 2, 0xe8eef4)
        rect(px, W, H, cutX + 1, ky - (tray - bTop) - 6, 2, 4, 0x3a3a4a)
      }

      // bottom half: dusk over the rooftops
      for (let y = mid; y < H; y++) {
        const c = mix(0xff9a5a, 0x5a3a7a, (y - mid) / (H - mid))
        for (let x = 0; x < W; x++) px[y * W + x] = c
      }
      for (let x = 0; x < W; x++) {
        const s = Math.floor((x + scroll * 0.4) / 5)
        const h = 4 + Math.floor(hash(s, 1, 3) * 6)
        for (let y = H - 2 - h; y < H; y++) px[y * W + x] = 0x6a4a7a
      }
      for (const r of roofs) {
        rect(px, W, H, r.x, r.y, r.w, H - r.y, r.c)
        rect(px, W, H, r.x, r.y, r.w, 1, 0x8a7a9a)
        for (let y = r.y + 3; y < H - 1; y += 3)
          for (let x = 2; x < r.w - 1; x += 3)
            if (hash(Math.round(r.x - scroll + x), y, 9) < 0.4) dot(px, W, H, r.x + x, y, 0xffd070)
      }
      // the runner
      const fx = rx
      const fy = Math.round(ry)
      const leg = Math.floor(run / 3) % 2
      if (flip > 0) {
        const a = flip * 0.5
        for (let k = 0; k < 5; k++) dot(px, W, H, fx + Math.sin(a) * (k - 2.5), fy - 3 - Math.cos(a) * (k - 2.5), 0x101820)
        dot(px, W, H, fx + Math.sin(a) * -3, fy - 3 - Math.cos(a) * -3, 0xffc8a0)
      } else {
        dot(px, W, H, fx, fy - 5, 0xffc8a0)
        rect(px, W, H, fx, fy - 4, 1, 2, 0xe03a3a)
        dot(px, W, H, fx + (leg ? 1 : -1), fy - 3, 0x101820)
        dot(px, W, H, fx + (air ? 1 : leg ? 1 : -1), fy - 1, 0x2a3a6a)
        dot(px, W, H, fx + (air ? -1 : leg ? -1 : 1), fy - 1, 0x2a3a6a)
        dot(px, W, H, fx, fy - 2, 0x2a3a6a)
      }
      rect(px, W, H, 0, mid, W, 1, 0x101010)
    },
  }
}

// --- spinning cat -----------------------------------------------------------------

const CAT_FRONT = [
  '.K.........K.',
  'KOK.......KOK',
  'KOOK.....KOOK',
  'KOOOKKKKKOOOK',
  'KOOOOOOOOOOOK',
  'KOOEOOOOOEOOK',
  'KOOEOOOOOEOOK',
  'KOOOOOPOOOOOK',
  '.KOOOMOMOOOK.',
  '..KKOOOOOKK..',
  '..KOOWWWOOK..',
  '.KOOWWWWWOOK.',
  '.KOOWWWWWOOK.',
  'KOOOOWWWOOOOK',
  'KOWWOOOOOWWOK',
  '.KKKKKKKKKKK.',
]
const CAT_BACK = CAT_FRONT.map((r, j) => {
  const s = r.replace(/[EPMW]/g, 'O')
  return j === 4 || j === 7 || j === 11 ? s.replace(/O/g, (_, i: number) => (i % 3 === 0 ? 'S' : 'O')) : s
})
const CAT_COLS: Record<string, number> = { K: 0x2a1a10, O: 0xf0a040, S: 0xc06a20, E: 0x101010, P: 0xff8aa0, M: 0x5a2a1a, W: 0xfff4e0 }

const spincat: Maker = (W, H, rng) => {
  const s = Math.max(1, Math.floor(Math.min(W / 16, H / 24)))
  const sw = 13
  const sh = CAT_FRONT.length
  let a = 0
  let w = 0
  let t = 0
  let hue = rng()

  return {
    step() {
      t++
      if (t < 200) w = 0.04 + (t / 200) ** 2 * 1.1
      else if (t < 240) w = 1.14
      else if (t === 240) {
        w = 0
        a = 0
      } else if (t > 290) {
        t = 0
        hue = rng()
      }
      a += w
    },
    draw(px) {
      const fast = t > 150 && t < 240
      const bg = fast ? hsv(hue + t * 0.05, 0.6, 0.9) : t >= 240 ? 0x1a1a2a : hsv(hue, 0.25, 0.95)
      sky(px, W, H, bg, scale(bg, 0.75))
      const cx = W / 2
      const by = Math.round(H * 0.72)
      // turntable
      ellipse(px, W, H, cx, by + 1, sw * s * 0.6 + 2, 2.5, 0x4a4a5a)
      ellipse(px, W, H, cx, by, sw * s * 0.6 + 2, 2.5, 0x8a8a9a)
      for (let k = 0; k < 6; k++) {
        const q = a + (k / 6) * Math.PI * 2
        if (Math.sin(q) > 0) dot(px, W, H, cx + Math.cos(q) * (sw * s * 0.6), by + Math.sin(q) * 1.5, 0xd0d0e0)
      }
      // speed lines
      if (w > 0.4)
        for (let k = 0; k < 6; k++) {
          const y = Math.round(H * 0.2 + hash(k, Math.floor(t / 2), 4) * H * 0.5)
          const x0 = hash(k, Math.floor(t / 2), 5) < 0.5 ? 1 : W - 6
          rect(px, W, H, x0, y, 4, 1, scale(bg, 1.3))
        }
      // the cat, squashed by its angle
      const c = Math.cos(a)
      const sprite = c >= 0 ? CAT_FRONT : CAT_BACK
      const half = (sw * s) / 2
      const reach = Math.max(0.6, half * Math.abs(c))
      const top = by - sh * s
      const light = 0.65 + 0.35 * Math.abs(c)
      for (let dx = -Math.ceil(reach); dx <= Math.ceil(reach); dx++) {
        let i = Math.floor((dx / Math.max(0.05, Math.abs(c)) + half) / s)
        if (c < 0) i = sw - 1 - i
        if (i < 0 || i >= sw) continue
        for (let j = 0; j < sh * s; j++) {
          const ch = (sprite[Math.floor(j / s)] as string)[i] as string
          const col = CAT_COLS[ch]
          if (col !== undefined) dot(px, W, H, cx + dx, top + j, ch === 'K' ? col : scale(col, light))
        }
      }
      // the stare after the stop
      if (t >= 240 && t % 20 < 12) {
        dot(px, W, H, 2, 2, 0xffffff)
        dot(px, W, H, W - 3, 2, 0xffffff)
      }
    },
  }
}

// --- rat dance --------------------------------------------------------------------

const ratdance: Maker = (W, H, rng) => {
  const u = W / 32
  const BEAT = 8
  let t = 0
  let seed = irand(rng, 1000)
  const moves = [0, 1, 2, 3, 1, 2, 4, 4]
  let order = moves.slice()

  return {
    step() {
      t++
      if (t % (BEAT * 8) === 0) {
        seed = irand(rng, 1000)
        order = moves.map(() => pick(rng, moves))
      }
    },
    draw(px) {
      const beat = Math.floor(t / BEAT)
      const k = (t % BEAT) / BEAT
      const hit = k < 0.25
      sky(px, W, H, 0x1a0a2a, 0x3a1a4a)
      const fy = Math.round(H * 0.72)
      // spotlight
      for (let y = 0; y < fy; y++) {
        const half = 2 + (y / fy) * W * 0.32
        for (let x = Math.max(0, Math.round(W / 2 - half)); x <= Math.min(W - 1, Math.round(W / 2 + half)); x++)
          px[y * W + x] = mix(px[y * W + x] as number, 0xffe8a0, hit ? 0.28 : 0.18)
      }
      // disco floor
      const tile = Math.max(2, Math.round(4 * u))
      for (let y = fy; y < H; y++)
        for (let x = 0; x < W; x++) {
          const ti = Math.floor(x / tile)
          const tj = Math.floor((y - fy) / tile)
          const r = hash(ti, tj, beat + seed)
          px[y * W + x] = r < 0.45 ? hsv(r * 2, 0.7, hit ? 1 : 0.8) : (ti + tj) % 2 ? 0x2a1a3a : 0x221430
        }

      const move = order[beat % order.length] as number
      const sway = move === 3 ? Math.sin(t * 0.4) * 2 * u : 0
      const squat = hit ? u : 0
      const cx = W / 2 + sway
      const by = fy - 2 - squat
      const body = 0x8a8a9a
      const pale = 0xc8c8d4
      const pink = 0xff9ab0
      // tail
      for (let i = 0; i < 10; i++) {
        const q = i / 10
        dot(px, W, H, cx + 3 * u + q * 7 * u, by - q * 4 * u + Math.sin(t * 0.5 + q * 4) * 2 * u, pink)
      }
      // feet
      const step = move === 4 ? (beat % 2 ? 1 : -1) * u : 0
      ellipse(px, W, H, cx - 2.5 * u + step, by, 2 * u, 0.8, pink)
      ellipse(px, W, H, cx + 2.5 * u - step, by, 2 * u, 0.8, pink)
      // body
      const bcy = by - 6 * u
      ellipse(px, W, H, cx, bcy, 4.5 * u, 6 * u, body)
      ellipse(px, W, H, cx, bcy + u, 2.8 * u, 4 * u, pale)
      // arms
      const sx = 4 * u
      const shoulder = bcy - 3 * u
      const up = (side: number) => {
        if (move === 0) return true
        if (move === 1) return side < 0 ? beat % 2 === 0 : beat % 2 === 1
        if (move === 2) return false
        if (move === 3) return side > 0
        return beat % 2 === 0
      }
      for (const side of [-1, 1]) {
        const ax = cx + side * sx
        const hx = ax + side * (up(side) ? 1.5 * u : 3 * u)
        const hy = up(side) ? shoulder - 5 * u - (hit ? u : 0) : shoulder + (move === 2 ? 0 : 3 * u)
        line(px, W, H, ax, shoulder, hx, hy, body)
        line(px, W, H, ax + side, shoulder, hx + side, hy, body)
        disc(px, W, H, hx, hy, Math.max(0.6, 0.9 * u), pink)
      }
      // head
      const hcy = bcy - 8 * u + (hit ? 1 : 0)
      const tilt = move === 1 ? (beat % 2 ? 1 : -1) * u : 0
      disc(px, W, H, cx - 3.5 * u + tilt, hcy - 3 * u, 2.6 * u, body)
      disc(px, W, H, cx + 3.5 * u + tilt, hcy - 3 * u, 2.6 * u, body)
      disc(px, W, H, cx - 3.5 * u + tilt, hcy - 3 * u, 1.5 * u, pink)
      disc(px, W, H, cx + 3.5 * u + tilt, hcy - 3 * u, 1.5 * u, pink)
      ellipse(px, W, H, cx + tilt, hcy, 4 * u, 3.5 * u, body)
      ellipse(px, W, H, cx + tilt, hcy + 1.5 * u, 2 * u, 1.6 * u, pale)
      dot(px, W, H, cx + tilt, hcy + u, pink)
      dot(px, W, H, cx - 1.6 * u + tilt, hcy - u, 0x101010)
      dot(px, W, H, cx + 1.6 * u + tilt, hcy - u, 0x101010)
      for (const side of [-1, 1]) line(px, W, H, cx + tilt + side * 2.5 * u, hcy + 1.5 * u, cx + tilt + side * 5.5 * u, hcy + u, 0xe0e0e8)
      // music notes
      for (let n = 0; n < 2; n++) {
        const life = (t + n * 20) % 40
        const x = n ? W * 0.82 : W * 0.15
        const y = H * 0.35 - life * 0.3
        const c = hsv((beat * 0.13 + n * 0.5) % 1, 0.5, 1)
        rect(px, W, H, x, y, 1, 4, c)
        rect(px, W, H, x - 1, y + 3, 2, 2, c)
        dot(px, W, H, x + 1, y, c)
      }
    },
  }
}

// --- bongo cat --------------------------------------------------------------------

const bongocat: Maker = (W, H, rng) => {
  const u = W / 32
  const PATTERNS = ['LRLR', 'LLRR', 'L.R.', 'LRRL', 'RRRR', 'LLLL', 'L.LR', 'RLRL']
  let pattern = pick(rng, PATTERNS)
  let t = 0
  const down = [0, 0]
  let fx: Spark[] = []
  const TICK = 4

  return {
    step() {
      t++
      down[0] = Math.max(0, (down[0] as number) - 1)
      down[1] = Math.max(0, (down[1] as number) - 1)
      if (t % TICK === 0) {
        const k = Math.floor(t / TICK)
        if (k % 16 === 0) pattern = rng() < 0.15 ? 'LRLRLRLR' : pick(rng, PATTERNS)
        const ch = pattern[k % pattern.length]
        if (ch === 'L' || ch === 'R') {
          const side = ch === 'L' ? 0 : 1
          down[side] = 2
          burst(fx, rng, side ? W / 2 + 9 * u : W / 2 - 9 * u, H * 0.7 - 3 * u, 0xffe060, 5, 0.9)
        }
      }
      fx = sparks(fx, 0.05)
    },
    draw(px) {
      sky(px, W, H, 0xfde8d0, 0xf8c8b8)
      const dy = Math.round(H * 0.7)
      const ink = 0x1a1a1a
      const fur = 0xffffff
      const cx = W / 2
      const bob = (down[0] || down[1]) ? 1 : 0
      // the cat behind the desk
      const hcy = dy - 16 * u + bob
      ellipse(px, W, H, cx, dy - 4 * u, 10 * u + 1, 9 * u + 1, ink)
      ellipse(px, W, H, cx, dy - 4 * u, 10 * u, 9 * u, fur)
      poly(px, W, H, [[cx - 9 * u, hcy - 2 * u], [cx - 8 * u, hcy - 9 * u], [cx - 3 * u, hcy - 5 * u]], ink)
      poly(px, W, H, [[cx + 9 * u, hcy - 2 * u], [cx + 8 * u, hcy - 9 * u], [cx + 3 * u, hcy - 5 * u]], ink)
      poly(px, W, H, [[cx - 8 * u + 1, hcy - 3 * u], [cx - 7.5 * u, hcy - 7 * u], [cx - 4 * u, hcy - 4.5 * u]], 0xffb0c0)
      poly(px, W, H, [[cx + 8 * u - 1, hcy - 3 * u], [cx + 7.5 * u, hcy - 7 * u], [cx + 4 * u, hcy - 4.5 * u]], 0xffb0c0)
      ellipse(px, W, H, cx, hcy, 9 * u + 1, 6 * u + 1, ink)
      ellipse(px, W, H, cx, hcy, 9 * u, 6 * u, fur)
      // face: dot eyes, a w mouth, blush
      const blink = t % 70 < 3
      for (const side of [-1, 1]) {
        const ex = cx + side * 4 * u
        if (blink) line(px, W, H, ex - 1, hcy - u, ex + 1, hcy - u, ink)
        else disc(px, W, H, ex, hcy - u, Math.max(0.5, 0.9 * u), ink)
        dot(px, W, H, ex + side * u, hcy + 1.5 * u, 0xffb0c0)
      }
      dot(px, W, H, cx - 1, hcy + u, ink)
      dot(px, W, H, cx, hcy + u + 1, ink)
      dot(px, W, H, cx + 1, hcy + u, ink)
      // desk
      rect(px, W, H, 0, dy, W, H - dy, 0x8a5a3a)
      rect(px, W, H, 0, dy, W, 1, 0xa87a50)
      for (let y = dy + 3; y < H; y += 4) rect(px, W, H, 0, y, W, 1, 0x7a4a2a)
      // bongos
      const drums = [cx - 9 * u, cx + 9 * u]
      for (let i = 0; i < 2; i++) {
        const x = drums[i] as number
        const r = (i ? 4.5 : 5) * u
        const lit = (down[i] as number) > 0
        rect(px, W, H, x - r + u, dy - 2 * u, 2 * r - 2 * u, 9 * u, 0xc06a30)
        rect(px, W, H, x - r + 2 * u, dy - 2 * u, u, 9 * u, 0xd8884a)
        rect(px, W, H, x - r + u, dy + 2 * u, 2 * r - 2 * u, u, 0xe0b040)
        ellipse(px, W, H, x, dy - 2 * u, r, 1.6 * u, 0x7a3a18)
        ellipse(px, W, H, x, dy - 2 * u, r - 1, 1.6 * u - 0.5, lit ? 0xfff8e8 : 0xf0dcc0)
      }
      // paws: up in the air or down on the drums
      for (let i = 0; i < 2; i++) {
        const x = drums[i] as number
        const isDown = (down[i] as number) > 0
        const py = isDown ? dy - 3 * u : dy - 10 * u
        ellipse(px, W, H, x, py, 3 * u + 1, 2 * u + 1, ink)
        ellipse(px, W, H, x, py, 3 * u, 2 * u, fur)
        if (!isDown) for (let k = -1; k <= 1; k++) dot(px, W, H, x + k * 1.3 * u, py + u, 0xffb0c0)
        if (isDown) {
          const side = i ? 1 : -1
          for (let k = 0; k < 3; k++) {
            const ang = -Math.PI / 2 + side * (0.5 + k * 0.45)
            line(px, W, H, x + Math.cos(ang) * 5 * u, py + Math.sin(ang) * 4 * u, x + Math.cos(ang) * 7 * u, py + Math.sin(ang) * 6 * u, ink)
          }
        }
      }
      for (const s of fx) dot(px, W, H, s.x, s.y, s.c)
    },
  }
}

// --- the backrooms ----------------------------------------------------------------

const backrooms: Maker = (W, H, rng) => {
  let z = 0
  let t = 0
  let flick = 0
  let turn = 0
  const WALL = [0xd8c878, 0xc8b868, 0xb0a058, 0x948848, 0x786e3a, 0x5c542c, 0x40381e]
  const CARPET = [0xa89848, 0x98883e, 0x847634, 0x6e622a, 0x584e22, 0x423a18, 0x2c2810]
  const CEIL = [0xe8e0b0, 0xd8d0a0, 0xc0b88c, 0xa49e76, 0x88825e, 0x6c6848, 0x504c34]
  const fog = (d: number) => Math.min(6, Math.floor(d / 1.6))

  return {
    step() {
      t++
      z += 0.06
      if (flick > 0) flick--
      else if (rng() < 0.02) flick = 4 + irand(rng, 6)
      if (turn > 0) turn--
      else if (rng() < 0.004) turn = 30
    },
    draw(px) {
      const cx = W / 2 + (turn > 0 ? Math.sin((turn / 30) * Math.PI) * W * 0.25 : 0)
      const hy = H * 0.45 + Math.sin(t * 0.25) * 0.6
      const f = W * 0.45
      const dark = flick > 0 && flick % 2 === 0
      for (let y = 0; y < H; y++) {
        const dy = (hy - y) / f
        for (let x = 0; x < W; x++) {
          const dx = (x - cx) / f
          const zw = Math.abs(dx) > 1e-3 ? 1 / Math.abs(dx) : 99
          const zc = Math.abs(dy) > 1e-3 ? 1 / Math.abs(dy) : 99
          let c: number
          if (zw < zc) {
            const d = zw
            const along = d + z
            const seg = Math.floor(along / 3)
            const door = (along % 3) > 2.1 && hash(seg, dx > 0 ? 1 : 2, 7) < 0.45
            const yy = dy * d
            if (door && yy < 0.5) c = 0x14100a
            else c = WALL[Math.min(6, fog(d) + ((Math.floor(along * 2) & 1) && d < 4 ? 1 : 0))]
          } else {
            const d = zc
            const along = d + z
            if (dy > 0) {
              const xx = dx * d
              const light = (along % 2) < 0.5 && Math.abs(xx) < 0.35
              c = light ? (dark && d < 3 ? CEIL[3] : 0xfffff0) : CEIL[Math.min(6, fog(d) + ((Math.floor(along) & 1) || Math.abs(xx) > 0.85 ? 1 : 0))]
            } else c = CARPET[fog(d)]
          }
          if (Math.max(zw, zc) > 14 && Math.min(zw, zc) > 14) c = 0x241e10
          px[y * W + x] = dark ? scale(c, 0.6) : c
        }
      }
    },
  }
}

// --- bouncing DVD logo -----------------------------------------------------

const dvd: Maker = (W, H, rng) => {
  const lw = 11
  const lh = 7
  const ax = Math.max(1, W - lw)
  const ay = Math.max(1, H - lh)
  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  const lcm = (ax * ay) / gcd(ax, ay)
  const tri = (u: number, a: number) => a - Math.abs((u % (2 * a)) - a)
  let u = Math.max(0, lcm - 70 - Math.floor(rng() * 40)) * 2
  let hue = rng()
  let party = 0
  let corners = 0
  type C = { x: number; y: number; vx: number; vy: number; c: number }
  let confetti: C[] = []

  return {
    step() {
      const before = [Math.floor(u / 2 / ax), Math.floor(u / 2 / ay)]
      u += 1
      const hitX = Math.floor(u / 2 / ax) !== before[0]
      const hitY = Math.floor(u / 2 / ay) !== before[1]
      if (hitX || hitY) hue += 0.17 + rng() * 0.2
      if (hitX && hitY) {
        party = 45
        corners++
        for (let i = 0; i < 50; i++)
          confetti.push({ x: rng() * W, y: -rng() * H * 0.3, vx: (rng() - 0.5) * 0.4, vy: 0.2 + rng() * 0.5, c: hsv(rng(), 0.8, 1) })
      }
      if (party > 0) party--
      for (const c of confetti) {
        c.x += c.vx
        c.y += c.vy
      }
      confetti = confetti.filter(c => c.y < H)
    },
    draw(px) {
      for (let y = 0; y < H; y++) {
        const c = party > 0 && (party >> 2) % 2 ? 0x1a1a2a : y % 2 ? 0x050505 : 0x000000
        for (let x = 0; x < W; x++) px[y * W + x] = c
      }
      const x = Math.round(tri(u / 2, ax))
      const y = Math.round(tri(u / 2, ay))
      const col = hsv(hue, 0.85, 1)
      text(px, W, H, x, y, 'DVD', col)
      for (let i = 1; i < lw - 1; i++) dot(px, W, H, x + i, y + 6, i === 5 ? 0x000000 : col)
      for (const c of confetti) dot(px, W, H, c.x, c.y, c.c)
      if (corners > 0) text(px, W, H, 1, H - 7, String(corners), 0x666666)
    },
  }
}

// --- Nyan Cat ------------------------------------------------------------------

const nyan: Maker = (W, H, rng) => {
  const RAINBOW = [0xff0000, 0xff9900, 0xffff00, 0x33ff00, 0x0099ff, 0x6633ff]
  const tw = 12
  const th = 9
  const catX = W - tw - 6
  const catY = Math.round(H * 0.45)
  let t = 0
  let stars = Array.from({ length: 10 }, () => ({ x: rng() * W, y: rng() * H, s: 0.8 + rng() * 1.2, p: Math.floor(rng() * 4) }))

  return {
    step() {
      t++
      for (const s of stars) {
        s.x -= s.s
        if (s.x < -3) {
          s.x = W + 2
          s.y = rng() * H
        }
      }
      if (t % 4 === 0) for (const s of stars) s.p = (s.p + 1) % 4
    },
    draw(px) {
      px.fill(0x0f2b5c)
      for (const s of stars) {
        const r = s.p === 3 ? 1 : s.p
        dot(px, W, H, s.x, s.y, 0xffffff)
        if (r > 0) for (const [dx, dy] of [[r, 0], [-r, 0], [0, r], [0, -r]] as const) dot(px, W, H, s.x + dx, s.y + dy, 0xffffff)
      }
      const bob = Math.floor(t / 4) % 2
      for (let x = 0; x < catX + 2; x++) {
        const wave = Math.floor((x + t) / 4) % 2
        RAINBOW.forEach((c, i) => {
          dot(px, W, H, x, catY + 1 + i * 1.5 + wave, c)
          dot(px, W, H, x, catY + 2 + i * 1.5 + wave, c)
        })
      }
      const y0 = catY + bob
      const legs = Math.floor(t / 3) % 2
      for (const lx of [1, 4, 8, 11]) rect(px, W, H, catX + lx - legs, y0 + th, 2, 2, 0x999999)
      rect(px, W, H, catX - 3, y0 + 4 + (legs ? 1 : 0), 4, 2, 0x999999)
      rect(px, W, H, catX, y0, tw, th, 0xffcc99)
      rect(px, W, H, catX + 1, y0 + 1, tw - 2, th - 2, 0xff99ff)
      for (const [sx, sy] of [[2, 2], [5, 1], [8, 3], [3, 5], [7, 6], [9, 2], [5, 4]] as const) dot(px, W, H, catX + sx, y0 + sy, 0xff3399)
      const hx = catX + tw - 4
      const hy = y0 + 3
      rect(px, W, H, hx, hy, 8, 6, 0x999999)
      dot(px, W, H, hx + 1, hy - 1, 0x999999)
      dot(px, W, H, hx + 6, hy - 1, 0x999999)
      dot(px, W, H, hx + 2, hy + 2, 0x000000)
      dot(px, W, H, hx + 5, hy + 2, 0x000000)
      dot(px, W, H, hx + 1, hy + 4, 0xff9999)
      dot(px, W, H, hx + 6, hy + 4, 0xff9999)
      rect(px, W, H, hx + 3, hy + 4, 2, 1, 0x000000)
    },
  }
}

export const MEMES = {
  dvd,
  nyan,
  creatures,
  splitrunner,
  spincat,
  ratdance,
  bongocat,
  backrooms,
}
