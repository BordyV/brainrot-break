import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, hash, irand, lerp, line, pick, poly, ring, sparks } from '../kit'
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

// --- Coccodrillo Bombardiere --------------------------------------------------------

const crocbomber: Maker = (W, H, rng) => {
  const u = W / 32
  const gy = Math.round(H * 0.84)
  const SPEED = 0.7
  const HOUSE_COLS = [0xf0c060, 0xe89a70, 0xf4d8b0, 0xe0807a, 0xf0e0a0, 0xc0d890]
  type House = { x: number; w: number; h: number; c: number }
  type Drop = { x: number; y: number; vy: number; meat: boolean }
  type Splat = { x: number; y: number; c: number }
  const houses: House[] = []
  let edge = 0
  const grow = () => {
    while (edge < cam + W + 10) {
      const w = Math.max(4, Math.round((5 + irand(rng, 4)) * u))
      houses.push({ x: edge, w, h: Math.round((7 + irand(rng, 9)) * u), c: pick(rng, HOUSE_COLS) })
      edge += w
    }
    while (houses.length && (houses[0] as House).x + (houses[0] as House).w < cam - 2) houses.shift()
  }
  const roofAt = (wx: number) => {
    for (const h of houses) if (wx >= h.x && wx < h.x + h.w) return gy - h.h
    return gy
  }
  let cam = 0
  let t = 0
  let drops: Drop[] = []
  let splats: Splat[] = []
  let bits: Spark[] = []
  let nextDrop = 12
  grow()

  const body = () => {
    const cx = W * 0.52 + Math.sin(t * 0.031) * 2 * u
    const cy = H * 0.3 + Math.sin(t * 0.083) * 3 * u
    return [cx, cy] as const
  }

  return {
    step() {
      t++
      cam += SPEED
      grow()
      const [cx, cy] = body()
      if (--nextDrop <= 0) {
        drops.push({ x: cam + cx - u, y: cy + 3 * u, vy: 0.2, meat: rng() < 0.35 })
        nextDrop = 14 + irand(rng, 16)
      }
      for (const d of drops) {
        d.vy += 0.05
        d.y += d.vy
        d.x += 0.25
      }
      drops = drops.filter(d => {
        const top = roofAt(Math.round(d.x))
        if (d.y < top - 1) return true
        const c = d.meat ? 0x8a3a20 : 0xe03a2a
        splats.push({ x: Math.round(d.x), y: top, c })
        burst(bits, rng, d.x - cam, top - 1, c, 8, 1)
        burst(bits, rng, d.x - cam, top - 1, d.meat ? 0xe03a2a : 0xf0d060, 5, 0.9)
        return false
      })
      for (const b of bits) b.x -= SPEED
      bits = sparks(bits, 0.06)
      splats = splats.filter(s => s.x > cam - 4)
    },
    draw(px) {
      sky(px, W, H, 0x4aa0e8, 0xb8e4f8, gy)
      // clouds, slower than the town
      for (let k = 0; k < 3; k++) {
        const span = W + 20 * u
        const x = (((k * 17 * u - cam * 0.35) % span) + span) % span - 10 * u
        const y = H * (0.08 + k * 0.17)
        ellipse(px, W, H, x, y, 5 * u, 1.5 * u, 0xffffff)
        ellipse(px, W, H, x + 2 * u, y - u, 3 * u, 1.5 * u, 0xffffff)
      }
      // hills far behind
      for (let x = 0; x < W; x++) {
        const hy = Math.round(gy - 9 * u - Math.sin((x + cam * 0.2) * 0.12) * 3 * u)
        for (let y = hy; y < gy; y++) px[y * W + x] = y === hy ? 0x8ac070 : 0x6aa058
      }
      // houses
      for (const h of houses) {
        const x = h.x - cam
        const top = gy - h.h
        rect(px, W, H, x, top, h.w, h.h, h.c)
        rect(px, W, H, x, top - 1, h.w, 1.5, 0xc0502a)
        rect(px, W, H, x + h.w - 1, top, 1, h.h, scale(h.c, 0.85))
        for (let wy = top + 2 * u; wy < gy - 3 * u; wy += 4 * u)
          for (let wx = x + u; wx < x + h.w - 2 * u; wx += 3 * u) {
            rect(px, W, H, wx, wy, Math.max(1, u), 2 * u, 0x3a5a2a)
            rect(px, W, H, wx + u, wy, Math.max(1, u), 2 * u, 0x4a7a3a)
          }
      }
      for (const s of splats) {
        dot(px, W, H, s.x - cam, s.y - 1, s.c)
        dot(px, W, H, s.x - cam - 1, s.y - 1, s.c)
        dot(px, W, H, s.x - cam + 1, s.y, s.c)
      }
      // quay and sea
      rect(px, W, H, 0, gy, W, Math.max(1, u), 0x9a9a9a)
      for (let y = gy + Math.max(1, Math.round(u)); y < H; y++)
        for (let x = 0; x < W; x++)
          px[y * W + x] = hash(Math.floor((x + cam * 0.5) / 3), y, Math.floor(t / 6)) < 0.08 ? 0xc8ecff : 0x2a7ac0

      for (const d of drops) {
        const x = d.x - cam
        if (d.meat) {
          disc(px, W, H, x, d.y, 1.2 * u, 0x8a3a20)
          dot(px, W, H, x - 0.4 * u, d.y - 0.4 * u, 0xc06a40)
        } else {
          disc(px, W, H, x, d.y, 1.6 * u, 0xe0a040)
          disc(px, W, H, x, d.y, 1.1 * u, 0xf0d060)
          dot(px, W, H, x - 0.5 * u, d.y, 0xe03a2a)
          dot(px, W, H, x + 0.6 * u, d.y - 0.5 * u, 0xe03a2a)
        }
      }

      // the crocodile plane, facing right
      const [cx, cy] = body()
      const v = 0.85 * u
      const g = 0x4a9a3a
      const dk = 0x2a6a2a
      const belly = 0xc8d880
      const steel = 0x9aa4b0
      // far wing, tail fin
      poly(px, W, H, [[cx - u, cy - u], [cx + 2 * v, cy - u], [cx, cy - 5 * v], [cx - 3 * v, cy - 5 * v]], 0x7a848e)
      poly(px, W, H, [[cx - 14 * v, cy - u], [cx - 10 * v, cy - u], [cx - 13 * v, cy - 6 * v], [cx - 15 * v, cy - 6 * v]], steel)
      // tail
      poly(px, W, H, [[cx - 6 * v, cy - 2 * v], [cx - 6 * v, cy + 2 * v], [cx - 15 * v, cy + 0.5 * v]], g)
      // body and belly
      ellipse(px, W, H, cx, cy, 7 * v, 2.6 * v, g)
      ellipse(px, W, H, cx, cy + 1.2 * v, 6 * v, 1.2 * v, belly)
      for (let k = -2; k <= 2; k++) dot(px, W, H, cx + k * 2.4 * v, cy - 2.5 * v, dk)
      // jaws, slightly open, with teeth
      const jaw = Math.sin(t * 0.25) > 0.6 ? u : 0
      poly(px, W, H, [[cx + 5 * v, cy - 2 * v], [cx + 13 * v, cy - 0.5 * v], [cx + 13 * v, cy + 0.5 * v], [cx + 5 * v, cy + 0.5 * v]], g)
      poly(px, W, H, [[cx + 5 * v, cy + u], [cx + 12 * v, cy + u + jaw], [cx + 12 * v, cy + 2 * v + jaw], [cx + 5 * v, cy + 2.2 * v]], belly)
      for (let k = 0; k < 4; k++) dot(px, W, H, cx + (6 + k * 1.8) * v, cy + 0.8 * v, 0xffffff)
      dot(px, W, H, cx + 12.4 * v, cy - u, dk)
      // eye on a bump, aviator goggles
      disc(px, W, H, cx + 5 * v, cy - 2.6 * v, 1.6 * v, g)
      disc(px, W, H, cx + 5 * v, cy - 2.8 * v, 1.1 * v, 0x6a4a2a)
      dot(px, W, H, cx + 5 * v, cy - 2.8 * v, 0xfff060)
      dot(px, W, H, cx + 5.4 * v, cy - 2.8 * v, 0x101010)
      line(px, W, H, cx + 3.4 * v, cy - 2.8 * v, cx - 1.5 * v, cy - 2.2 * v, 0x6a4a2a)
      // near wing with a roundel
      poly(px, W, H, [[cx - 3 * v, cy + u], [cx + 2 * v, cy + u], [cx - 2 * v, cy + 7 * v], [cx - 6 * v, cy + 7 * v]], steel)
      dot(px, W, H, cx - 2.5 * v, cy + 4.5 * v, 0xe03a2a)
      dot(px, W, H, cx - 3.5 * v, cy + 4.5 * v, 0x2aa04a)
      // propeller on the nose
      const pr = Math.abs(Math.cos(t * 1.3)) * 3.5 * v
      line(px, W, H, cx + 13.5 * v, cy - pr, cx + 13.5 * v, cy + pr, 0xd8d8d8)
      dot(px, W, H, cx + 13.5 * v, cy, 0x606060)
      // a little exhaust trail
      for (let k = 1; k <= 3; k++) {
        const wob = hash(k, Math.floor(t / 3)) * 2 - 1
        dot(px, W, H, cx - 15 * v - k * 2 * v, cy + wob, mix(0xffffff, 0xb8e4f8, k / 4))
      }

      for (const b of bits) dot(px, W, H, b.x, b.y, b.c)
    },
  }
}

// --- Tronchetto Tum Tum -------------------------------------------------------------

const tumtum: Maker = (W, H, rng) => {
  const u = W / 32
  const gy = Math.round(H * 0.8)
  const GAP = Math.round(30 * u)
  const BAT = 8 * u
  const HOUSE_COLS = [0x5a4a6a, 0x4a5a6a, 0x6a5048, 0x4a6058]
  type House = { x: number; h: number; c: number; lit: number }
  const houses: House[] = []
  const house = (i: number): House => {
    while (houses.length <= i)
      houses.push({ x: Math.round(14 * u) + houses.length * GAP, h: Math.round((20 + irand(rng, 8)) * u), c: pick(rng, HOUSE_COLS), lit: -1 })
    return houses[i] as House
  }
  const doorX = (h: House) => h.x + 3 * u
  const standX = (h: House) => doorX(h) - BAT - 3 * u
  let i = 0
  let x = -6 * u
  let phase: 'walk' | 'knock' = 'walk'
  let kt = 0
  let t = 0
  let walk = 0
  let shake = 0
  let rings: { x: number; y: number; r: number }[] = []
  let dust: Spark[] = []
  let hits = 0
  const HIT = [9, 22, 35]
  const swing = (k: number) => {
    // bat angle: 0 points right at the door, negative is up
    const rest = -1.1
    for (const h of HIT) {
      const s = k - (h - 9)
      if (s < 0 || s >= 13) continue
      if (s < 6) return lerp(rest, -2.4, s / 6)
      if (s < 9) return lerp(-2.4, -0.05, (s - 6) / 3)
      return lerp(-0.05, rest, (s - 9) / 4)
    }
    return rest
  }

  return {
    step() {
      t++
      house(i + 2)
      if (phase === 'walk') {
        const target = standX(house(i))
        x += 0.8
        walk++
        if (x >= target) {
          x = target
          phase = 'knock'
          kt = 0
          hits = 0
        }
      } else {
        kt++
        const h = house(i)
        if (HIT.includes(kt)) {
          hits++
          shake = 3
          const hy = gy - 9 * u
          rings.push({ x: doorX(h), y: hy, r: 1 })
          burst(dust, rng, doorX(h), hy, 0xd8b070, 5, 0.8)
        }
        if (kt === 48) h.lit = t
        if (kt === 66) {
          phase = 'walk'
          i++
        }
      }
      for (const r of rings) r.r += 0.8
      rings = rings.filter(r => r.r < 9 * u)
      dust = sparks(dust, 0.05)
      if (shake > 0) shake--
    },
    draw(px) {
      const cam = Math.round(x - W * 0.3) + (shake % 2 ? 1 : 0)
      sky(px, W, H, 0x0a0a24, 0x2a2050, gy)
      for (let y = 0; y < gy * 0.6; y++)
        for (let xx = 0; xx < W; xx++) {
          const wx = xx + Math.floor(cam * 0.1)
          if (hash(wx, y, 7) < 0.015) px[y * W + xx] = hash(wx, y, Math.floor(t / 8)) < 0.5 ? 0xffffff : 0x8888b0
        }
      disc(px, W, H, W * 0.8, H * 0.1, 3 * u, 0xf0eccc)
      disc(px, W, H, W * 0.8 + 1.5 * u, H * 0.1 - u, 2.5 * u, 0x16143a)

      for (const h of houses) {
        const hx = h.x - cam
        if (hx > W || hx + 22 * u < 0) continue
        const top = gy - h.h
        poly(px, W, H, [[hx - u, top], [hx + 23 * u, top], [hx + 11 * u, top - 7 * u]], 0x6a2a2a)
        rect(px, W, H, hx, top, 22 * u, h.h, h.c)
        const on = h.lit >= 0
        const glow = on ? Math.min(1, (t - h.lit) / 6) : 0
        for (const wx of [hx + 4 * u, hx + 13 * u]) {
          const wy = top + 4 * u
          rect(px, W, H, wx, wy, 5 * u, 5 * u, mix(0x1a1a2a, 0xffd860, glow))
          if (on && t - h.lit > 10 && wx > hx + 10 * u) {
            // a sleepy face shows up
            disc(px, W, H, wx + 2.5 * u, wy + 3.4 * u, 1.4 * u, 0x2a2018)
            dot(px, W, H, wx + 2 * u, wy + 3 * u, 0xffffff)
            dot(px, W, H, wx + 3 * u, wy + 3 * u, 0xffffff)
          }
          rect(px, W, H, wx + 2.5 * u - 0.3, wy, 1, 5 * u, 0x2a2018)
        }
        const dx = doorX(h) - cam
        rect(px, W, H, dx, gy - 11 * u, 6 * u, 11 * u, 0x5a3418)
        rect(px, W, H, dx + u, gy - 10 * u, 4 * u, 4 * u, 0x6a4422)
        dot(px, W, H, dx + 4.5 * u, gy - 5 * u, 0xf0c040)
        if (on) for (let k = 0; k < 3; k++) dot(px, W, H, dx + (1 + k * 2) * u, gy - 12.5 * u, 0xffd860)
      }
      // street
      rect(px, W, H, 0, gy, W, H - gy, 0x2a2a34)
      rect(px, W, H, 0, gy, W, Math.max(1, u), 0x5a5a64)
      for (let xx = 0; xx < W; xx++) if (((xx + cam) >> 2) % 3 === 0) dot(px, W, H, xx, gy + (H - gy) * 0.55, 0x8a8a70)

      // the log
      const lx = x - cam
      const bob = phase === 'walk' ? Math.abs(Math.sin(walk * 0.4)) * u : 0
      const top = gy - 16 * u - bob
      const lw = 7 * u
      for (const side of [0, 1]) {
        const swingL = phase === 'walk' ? Math.sin(walk * 0.4 + side * Math.PI) * 1.5 * u : 0
        line(px, W, H, lx + (2 + side * 3) * u, gy - 3 * u - bob, lx + (2 + side * 3) * u + swingL, gy - 1, 0x3a2410)
      }
      rect(px, W, H, lx, top, lw, gy - 3 * u - top, 0x9a6a38)
      for (let k = 1; k < 4; k++) rect(px, W, H, lx + k * 1.8 * u, top + 2 * u + (k % 2) * 3 * u, Math.max(1, 0.5 * u), 7 * u, 0x7a4a24)
      ellipse(px, W, H, lx + lw / 2, top, lw / 2, 1.5 * u, 0xe0b878)
      ellipse(px, W, H, lx + lw / 2, top, lw / 4, 0.7 * u, 0xb08048)
      // face: wide eyes, a grin
      const ey = top + 4 * u
      for (const ex of [lx + 2 * u, lx + 5 * u]) {
        disc(px, W, H, ex, ey, 1.2 * u, 0xffffff)
        dot(px, W, H, ex + 0.4 * u, ey, 0x101010)
      }
      line(px, W, H, lx + 1.5 * u, ey - 2 * u, lx + 3 * u, ey - 1.5 * u, 0x3a2410)
      line(px, W, H, lx + 4 * u, ey - 1.5 * u, lx + 5.5 * u, ey - 2 * u, 0x3a2410)
      rect(px, W, H, lx + 1.5 * u, ey + 2.5 * u, 4.5 * u, 1.2 * u, 0x2a1408)
      rect(px, W, H, lx + 2 * u, ey + 2.5 * u, 3.5 * u, Math.max(1, 0.5 * u), 0xffffff)
      // arm and bat
      const hx = lx + lw + u
      const hy = top + 9 * u
      line(px, W, H, lx + lw - u, top + 8 * u, hx, hy, 0x7a4a24)
      const a = phase === 'knock' ? swing(kt) : -1.1 + Math.sin(walk * 0.4) * 0.15
      const bx = hx + Math.cos(a) * BAT
      const by = hy + Math.sin(a) * BAT
      line(px, W, H, hx, hy, bx, by, 0xd8b070)
      line(px, W, H, hx + Math.cos(a) * BAT * 0.4, hy + Math.sin(a) * BAT * 0.4 + 1, bx, by + 1, 0xd8b070)
      line(px, W, H, hx, hy, hx + Math.cos(a) * 2 * u, hy + Math.sin(a) * 2 * u, 0x4a2a14)

      for (const r of rings) ring(px, W, H, r.x - cam, r.y, r.r, mix(0xfff0c0, 0x2a2050, r.r / (9 * u)))
      for (const d of dust) dot(px, W, H, d.x - cam, d.y, d.c)
      if (phase === 'knock' && hits) text(px, W, H, 1, 1, 'x' + hits, 0xffd860)
    },
  }
}

// --- tier list ----------------------------------------------------------------------

const tierlist: Maker = (W, H, rng) => {
  const TIERS = [0xff7070, 0xffb060, 0xffe070, 0x90e070]
  const LETTERS = ['S', 'A', 'B', 'C']
  const top = 1
  const rowH = Math.max(4, Math.floor((H * 0.72 - top) / 4))
  const lab = Math.max(5, Math.round(W * 0.2))
  const ic = Math.max(3, rowH - 3)
  const slotW = ic + 2
  const slots = Math.max(1, Math.floor((W - lab - 1) / slotW))
  const poolY = top + rowH * 4 + (H - top - rowH * 4) / 2 - 1
  type Item = { k: number; x: number; y: number; row: number; vy: number }
  let placed: Item[] = []
  const queue = [irand(rng, 7), irand(rng, 7), irand(rng, 7)]
  let cur: Item = { k: irand(rng, 7), x: W / 2, y: H + ic, row: -1, vy: 0 }
  let phase: 'rise' | 'hover' | 'place' | 'clear' = 'rise'
  let pt = 0
  let visits: number[] = []
  let slot = 0
  let bits: Spark[] = []
  const slotXY = (row: number, s: number): [number, number] => [lab + 2 + s * slotW + ic / 2, top + row * rowH + (rowH - 1) / 2]
  const fill = (row: number) => placed.filter(p => p.row === row).length
  const next = () => {
    cur = { k: queue.shift() as number, x: W / 2, y: H + ic, row: -1, vy: 0 }
    queue.push(irand(rng, 7))
    phase = 'rise'
    pt = 0
  }

  return {
    step() {
      pt++
      if (phase === 'rise') {
        cur.y = lerp(H + ic, poolY, Math.min(1, pt / 8))
        if (pt >= 14) {
          const open = [0, 1, 2, 3].filter(r => fill(r) < slots)
          if (placed.length >= slots * 3 || !open.length) {
            phase = 'clear'
            pt = 0
            return
          }
          const target = pick(rng, open)
          visits = []
          for (let n = 1 + irand(rng, 3); n > 0; n--) visits.push(irand(rng, 4))
          visits.push(target)
          cur.row = target
          phase = 'hover'
          pt = 0
        }
      } else if (phase === 'hover') {
        const idx = Math.floor(pt / 10)
        if (idx >= visits.length) {
          slot = fill(cur.row)
          phase = 'place'
          pt = 0
        } else {
          const ty = slotXY(visits[idx] as number, 0)[1]
          cur.x += (lab + (W - lab) * 0.62 - cur.x) * 0.3
          cur.y += (ty - cur.y) * 0.35
        }
      } else if (phase === 'place') {
        const [sx, sy] = slotXY(cur.row, slot)
        cur.x += (sx - cur.x) * 0.4
        cur.y += (sy - cur.y) * 0.4
        if (pt >= 8) {
          cur.x = sx
          cur.y = sy
          placed.push(cur)
          burst(bits, rng, sx, sy, TIERS[cur.row] as number, 8, 0.9)
          next()
        }
      } else {
        for (const p of placed) {
          p.vy += 0.12
          p.y += p.vy
        }
        if (pt > 40) {
          placed = []
          next()
        }
      }
      bits = sparks(bits, 0.04)
    },
    draw(px) {
      px.fill(0x1a1a22)
      const hot = phase === 'hover' ? visits[Math.min(visits.length - 1, Math.floor(pt / 10))] : -1
      for (let r = 0; r < 4; r++) {
        const y = top + r * rowH
        rect(px, W, H, 0, y, lab, rowH - 1, TIERS[r] as number)
        text(px, W, H, Math.floor((lab - 3) / 2), y + Math.floor((rowH - 6) / 2), LETTERS[r] as string, 0x1a1a22)
        rect(px, W, H, lab + 1, y, W - lab - 1, rowH - 1, r === hot ? 0x44445a : 0x2a2a36)
      }
      rect(px, W, H, 0, top + rowH * 4, W, H - top - rowH * 4, 0x22222c)
      for (let q = 0; q < 2; q++) icon(px, W, H, queue[q] as number, W - 3 - q * (ic * 0.7 + 2), H - 3 - ic * 0.35, ic * 0.7, 0.45)
      for (const p of placed) icon(px, W, H, p.k, p.x, p.y, ic, 1)
      const wob = phase === 'hover' ? Math.round(Math.sin(pt * 1.3)) : 0
      if (phase !== 'clear') icon(px, W, H, cur.k, cur.x + wob, cur.y, phase === 'rise' ? ic * 1.3 : ic, 1)
      for (const b of bits) dot(px, W, H, b.x, b.y, b.c)
    },
  }
}

// a small item drawn at (cx, cy), s pixels wide, faded towards the background by 1 - k
function icon(px: Uint32Array, W: number, H: number, k: number, cx: number, cy: number, s: number, f: number) {
  const r = s / 2
  const c = (v: number) => mix(0x22222c, v, f)
  if (k === 0) {
    poly(px, W, H, [[cx - r, cy - r], [cx + r, cy - r], [cx, cy + r]], c(0xf0c050))
    rect(px, W, H, cx - r, cy - r, s, Math.max(1, s * 0.2), c(0xc07830))
    dot(px, W, H, cx, cy - r * 0.2, c(0xe03a2a))
  } else if (k === 1) {
    disc(px, W, H, cx - r * 0.1, cy + r * 0.3, r * 0.75, c(0xffd840))
    disc(px, W, H, cx + r * 0.3, cy - r * 0.4, r * 0.5, c(0xffd840))
    dot(px, W, H, cx + r * 0.85, cy - r * 0.3, c(0xff8a20))
    dot(px, W, H, cx + r * 0.35, cy - r * 0.5, c(0x101010))
  } else if (k === 2) {
    rect(px, W, H, cx - r * 0.8, cy - r * 0.6, r * 1.4, r * 1.4, c(0xf4f0e8))
    rect(px, W, H, cx - r * 0.8, cy - r * 0.6, r * 1.4, 1, c(0x6a3a1a))
    dot(px, W, H, cx + r * 0.8, cy, c(0xf4f0e8))
  } else if (k === 3) {
    for (let a = 0.3; a < 2.9; a += 0.25) {
      dot(px, W, H, cx + Math.cos(a) * r * 0.9, cy - r * 0.5 + Math.sin(a) * r * 0.9, c(0xf8e050))
      dot(px, W, H, cx + Math.cos(a) * r * 0.6, cy - r * 0.5 + Math.sin(a) * r * 0.6, c(0xe8c030))
    }
  } else if (k === 4) {
    disc(px, W, H, cx, cy + r * 0.1, r * 0.85, c(0x8a8a92))
    dot(px, W, H, cx - r * 0.3, cy - r * 0.2, c(0xb0b0b8))
  } else if (k === 5) {
    disc(px, W, H, cx, cy + r * 0.1, r * 0.8, c(0xf0a040))
    poly(px, W, H, [[cx - r * 0.8, cy - r * 0.2], [cx - r * 0.7, cy - r], [cx - r * 0.1, cy - r * 0.5]], c(0xf0a040))
    poly(px, W, H, [[cx + r * 0.8, cy - r * 0.2], [cx + r * 0.7, cy - r], [cx + r * 0.1, cy - r * 0.5]], c(0xf0a040))
    dot(px, W, H, cx - r * 0.35, cy, c(0x101010))
    dot(px, W, H, cx + r * 0.35, cy, c(0x101010))
  } else {
    rect(px, W, H, cx - r, cy - r * 0.4, s, r * 1.1, c(0x4a9a3a))
    rect(px, W, H, cx - r * 0.2, cy + r * 0.3, r * 1.2, 1, c(0xffffff))
    dot(px, W, H, cx - r * 0.4, cy - r * 0.6, c(0xfff060))
  }
}

// --- cat on the keyboard ------------------------------------------------------------

const catkeys: Maker = (W, H, rng) => {
  const u = W / 32
  const CODE = [0xc678dd, 0x61afef, 0x98c379, 0xe5c07b, 0xabb2bf, 0xabb2bf]
  const mTop = 1
  const mH = Math.round(H * 0.46)
  const desk = Math.round(H * 0.56)
  const kbTop = Math.round(H * 0.66)
  const kbBot = Math.round(H * 0.88)
  const COLS = 9
  const ROWS = 4
  const kw = (W - 4) / COLS
  const kh = (kbBot - kbTop - 2) / ROWS
  type Seg = { w: number; c: number }
  type Line = { ind: number; segs: Seg[]; bad: boolean }
  const fresh = (): Line => {
    const segs: Seg[] = []
    const ind = irand(rng, 3) * 2
    let room = W - 8 - ind
    for (let n = 1 + irand(rng, 4); n > 0 && room > 3; n--) {
      const w = Math.min(room, 2 + irand(rng, 6))
      segs.push({ w, c: pick(rng, CODE) })
      room -= w + 1
    }
    return { ind, segs, bad: false }
  }
  const lines: Line[] = []
  for (let n = 0; n < 8; n++) lines.push(fresh())
  const pressed = new Float32Array(COLS * ROWS)
  let phase: 'type' | 'walk' | 'oops' | 'undo' = 'type'
  let pt = 0
  let dir = 1
  let x = 0
  let paw = 0

  return {
    step() {
      pt++
      for (let k = 0; k < pressed.length; k++) if (pressed[k]) pressed[k] = Math.max(0, (pressed[k] as number) - 1)
      const press = (col: number) => {
        const k = clamp(col, 0, COLS - 1) + COLS * irand(rng, ROWS)
        pressed[k] = 4
      }
      if (phase === 'type') {
        // the owner types calm, tidy code
        if (pt % 9 === 0) {
          lines.push(fresh())
          press(irand(rng, COLS))
        }
        if (pt > 60) {
          phase = 'walk'
          pt = 0
          x = dir > 0 ? -10 * u : W + 10 * u
        }
      } else if (phase === 'walk') {
        x += dir * 0.6
        if (pt % 5 === 0) {
          paw++
          const fx = x + dir * (paw % 2 ? 3 : -2) * u
          if (fx > 1 && fx < W - 2) {
            press(Math.floor((fx - 2) / kw))
            let last = lines[lines.length - 1] as Line
            const used = last.ind + last.segs.reduce((a, s) => a + s.w + 1, 0)
            if (!last.bad || used > W - 10) {
              last = { ind: irand(rng, 4), segs: [], bad: true }
              lines.push(last)
            }
            last.segs.push({ w: 1 + irand(rng, 4), c: hsv(rng(), 0.7, 1) })
          }
        }
        if ((dir > 0 && x > W + 10 * u) || (dir < 0 && x < -10 * u)) {
          phase = 'oops'
          pt = 0
        }
      } else if (phase === 'oops') {
        if (pt > 24) {
          phase = 'undo'
          pt = 0
        }
      } else if (pt % 4 === 0) {
        // ctrl+z, one line at a time
        const i = lines.map(l => l.bad).lastIndexOf(true)
        if (i < 0) {
          phase = 'type'
          pt = 0
          dir = -dir
        } else {
          lines.splice(i, 1)
          press(1)
          press(2)
        }
      }
      while (lines.length > 40) lines.shift()
    },
    draw(px) {
      px.fill(0x3a3048)
      for (let y = 0; y < desk; y += 4) rect(px, W, H, 0, y, W, 1, 0x40354e)
      // monitor
      rect(px, W, H, 1, mTop, W - 2, mH, 0x2a2a32)
      rect(px, W, H, 2, mTop + 1, W - 4, mH - 3, 0x14161e)
      rect(px, W, H, W / 2 - 2 * u, mTop + mH, 4 * u, desk - mTop - mH, 0x2a2a32)
      const maxL = Math.floor((mH - 5) / 2)
      const shown = lines.slice(-maxL)
      const flash = phase === 'oops' && Math.floor(pt / 4) % 2 === 0
      shown.forEach((l, j) => {
        const y = mTop + 2 + j * 2
        let xx = 3 + l.ind
        for (const s of l.segs) {
          if (xx >= W - 3) break
          rect(px, W, H, xx, y, Math.min(s.w, W - 3 - xx), 1, l.bad && flash ? 0xff4040 : s.c)
          xx += s.w + 1
        }
        if (l.bad) dot(px, W, H, 2, y, 0xff4040)
      })
      if (Math.floor(pt / 6) % 2 === 0) {
        const l = shown[shown.length - 1]
        const y = mTop + 2 + (shown.length - 1) * 2
        const end = l ? 3 + l.ind + l.segs.reduce((a, s) => a + s.w + 1, 0) : 3
        rect(px, W, H, Math.min(end, W - 4), y - 1, 1, 2, 0xffffff)
      }
      if (phase === 'oops' || phase === 'undo') text(px, W, H, W - 6, mTop + mH - 8, '!', 0xff4040)
      // desk and keyboard
      rect(px, W, H, 0, desk, W, H - desk, 0x6a4a30)
      rect(px, W, H, 0, desk, W, 1, 0x8a6a48)
      rect(px, W, H, 1, kbTop, W - 2, kbBot - kbTop, 0x2a2a30)
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++) {
          const p = pressed[c + r * COLS] as number
          rect(px, W, H, 2 + c * kw, kbTop + 1 + r * kh + (p ? 1 : 0), Math.max(1, kw - 1), Math.max(1, kh - 1), p ? 0x8a8a98 : 0xc8c8d4)
        }
      // the cat walks across the keys
      if (phase === 'walk') {
        const fy = kbTop + 2 * u
        const ph = Math.sin(pt * 0.63)
        const bx = x
        const by = fy - 4 * u
        for (const [lx, s] of [[-3, 1], [-2, -1], [2, -1], [3, 1]] as const)
          line(px, W, H, bx + dir * lx * u, by + u, bx + dir * lx * u + ph * s * u, fy, 0xe08a30)
        for (let k = 0; k <= 6; k++) {
          const tx = bx - dir * (4 + k * 0.7) * u
          const ty = by - k * 0.9 * u + Math.sin(pt * 0.3 + k * 0.6) * k * 0.2 * u
          disc(px, W, H, tx, ty, 0.6 * u, 0xf0a040)
        }
        ellipse(px, W, H, bx, by, 4.5 * u, 2.2 * u, 0xf0a040)
        for (let k = -1; k <= 1; k++) rect(px, W, H, bx + k * 2 * u, by - 2 * u, Math.max(1, 0.7 * u), 1.5 * u, 0xc06a20)
        const hx = bx + dir * 5 * u
        const hy = by - 2 * u
        disc(px, W, H, hx, hy, 2.2 * u, 0xf0a040)
        poly(px, W, H, [[hx - 2 * u, hy - u], [hx - 1.6 * u, hy - 3.6 * u], [hx - 0.2 * u, hy - 1.8 * u]], 0xf0a040)
        poly(px, W, H, [[hx + 2 * u, hy - u], [hx + 1.6 * u, hy - 3.6 * u], [hx + 0.2 * u, hy - 1.8 * u]], 0xf0a040)
        dot(px, W, H, hx + dir * u, hy - 0.3 * u, 0x101010)
        dot(px, W, H, hx + dir * 2 * u, hy + 0.6 * u, 0xff8aa0)
      }
    },
  }
}

// --- touch grass --------------------------------------------------------------------

const touchgrass: Maker = (W, H, rng) => {
  const u = W / 32
  const gy = Math.round(H * 0.8)
  const T = 340
  const seed = irand(rng, 1000)
  const SKIN = 0xf0c8a0
  const HAIR = 0x3a2418
  const HOODIE = 0x6a6a7a
  const JEANS = 0x3a4a7a
  let t = 0

  const standing = (px: Uint32Array, x: number, foot: number, walk: number) => {
    const sw = Math.sin(walk * 0.5) * 1.5 * u
    line(px, W, H, x - 0.5 * u, foot - 4 * u, x - 0.5 * u + sw, foot - 1, JEANS)
    line(px, W, H, x + 0.5 * u, foot - 4 * u, x + 0.5 * u - sw, foot - 1, JEANS)
    rect(px, W, H, x - 1.5 * u, foot - 9 * u, 3 * u + 1, 5 * u, HOODIE)
    line(px, W, H, x, foot - 8 * u, x - sw * 0.8, foot - 5 * u, HOODIE)
    disc(px, W, H, x, foot - 10.8 * u, 1.8 * u, SKIN)
    rect(px, W, H, x - 1.8 * u, foot - 12.8 * u, 3.6 * u + 1, 1.2 * u, HAIR)
    dot(px, W, H, x + u, foot - 11 * u, 0x101010)
  }

  return {
    step() {
      t++
    },
    draw(px) {
      const f = t % T
      if (f < 120) {
        // the room: a desk on the left, a door on the right
        px.fill(0x1c1a2a)
        rect(px, W, H, 0, gy, W, H - gy, 0x2a2434)
        const doorX = W - 8 * u
        const open = f > 100
        rect(px, W, H, doorX, gy - 16 * u, 7 * u, 16 * u, open ? 0xfff4c0 : 0x4a3424)
        if (open) for (let y = gy; y < H; y++) rect(px, W, H, doorX - (y - gy) * 0.6, y, 7 * u + (y - gy) * 0.6, 1, 0x5a5040)
        else dot(px, W, H, doorX + u, gy - 8 * u, 0xf0c040)
        const deskY = gy - 7 * u
        const glow = f < 70 ? 0.7 + 0.3 * Math.sin(f * 0.9) * Math.sin(f * 0.37) : 0.5
        rect(px, W, H, 0, deskY - 7 * u, 9 * u, 6 * u, 0x20222a)
        rect(px, W, H, u, deskY - 6 * u, 7 * u, 4 * u, mix(0x203050, 0x60a0ff, glow))
        rect(px, W, H, 3.5 * u, deskY - u, 2 * u, u, 0x20222a)
        rect(px, W, H, 0, deskY, 11 * u, u, 0x5a4030)
        rect(px, W, H, 9 * u, deskY, u, 7 * u, 0x5a4030)
        if (f < 70) {
          // hunched over the keyboard, typing
          const x = 13 * u
          rect(px, W, H, x - 2 * u, gy - 6 * u, 4 * u, u, 0x3a3a44)
          rect(px, W, H, x + u, gy - 5 * u, u, 5 * u, 0x3a3a44)
          rect(px, W, H, x - 4 * u, gy - 6.5 * u, 5 * u, 1.5 * u, JEANS)
          line(px, W, H, x - 4 * u, gy - 5 * u, x - 4 * u, gy - 1, JEANS)
          poly(px, W, H, [[x - u, gy - 6 * u], [x + 2 * u, gy - 6 * u], [x - u, gy - 11 * u], [x - 4 * u, gy - 10 * u]], HOODIE)
          const tap = f % 4 < 2 ? 0 : 0.6 * u
          line(px, W, H, x - 2 * u, gy - 10 * u, x - 6 * u, deskY - 0.5 - tap, HOODIE)
          disc(px, W, H, x - 4.5 * u, gy - 11.5 * u, 1.8 * u, mix(SKIN, 0x80b0ff, 0.35))
          rect(px, W, H, x - 5 * u, gy - 13.4 * u, 3.6 * u, 1.2 * u, HAIR)
        } else {
          const x = lerp(13 * u, doorX + 3 * u, clamp((f - 72) / 40, 0, 1))
          standing(px, x, gy, f)
        }
      } else {
        // outside
        const g = f - 120
        sky(px, W, H, 0x5ab0f0, 0xc8ecff, gy)
        const sx = W * 0.78
        const sy = H * 0.14
        for (let k = 0; k < 8; k++) {
          const a = k * 0.785 + g * 0.02
          line(px, W, H, sx + Math.cos(a) * 4 * u, sy + Math.sin(a) * 4 * u, sx + Math.cos(a) * 6 * u, sy + Math.sin(a) * 6 * u, 0xfff0a0)
        }
        disc(px, W, H, sx, sy, 3 * u, 0xffe060)
        const cx = ((W * 0.2 - g * 0.15) % (W + 12 * u) + W + 12 * u) % (W + 12 * u) - 6 * u
        ellipse(px, W, H, cx, H * 0.3, 5 * u, 1.5 * u, 0xffffff)
        ellipse(px, W, H, cx + 2 * u, H * 0.3 - u, 3 * u, 1.5 * u, 0xffffff)
        rect(px, W, H, 0, gy, W, H - gy, 0x3a9a3a)
        for (let y = gy + 2; y < H; y += 3) for (let x = 0; x < W; x++) if (hash(x, y, seed) < 0.12) px[y * W + x] = 0x2e8030
        const mid = W * 0.42
        const blades = (front: boolean) => {
          for (let x = 0; x < W; x++) {
            if ((hash(x, 1, seed) < 0.5) !== front) continue
            if (front && g >= 50 && x > mid - 8 * u && x < mid + 9 * u) continue
            const h = Math.round((front ? 1 : 2) * u + hash(x, 0, seed) * 3 * u)
            const lean = Math.round(Math.sin(g * 0.12 + x * 0.4) * 0.7)
            for (let k = 1; k <= h; k++) dot(px, W, H, x + (k > h / 2 ? lean : 0), gy - k + (front ? 2 : 0), front ? 0x4ab84a : 0x3aa83a)
          }
        }
        blades(false)
        if (g < 50) standing(px, lerp(-4 * u, mid, g / 50), gy + u, g)
        else {
          // lying in the grass, arms behind the head
          const y = gy - 1.5 * u
          rect(px, W, H, mid - 3 * u, y - u, 6 * u, 2.2 * u, HOODIE)
          rect(px, W, H, mid + 3 * u, y - 0.4 * u, 5 * u, 1.6 * u, JEANS)
          line(px, W, H, mid - 3 * u, y - u, mid - 6 * u, y - 2.5 * u, HOODIE)
          disc(px, W, H, mid - 5 * u, y - 0.5 * u, 1.8 * u, SKIN)
          rect(px, W, H, mid - 7 * u, y - 2 * u, 1.2 * u, 3 * u, HAIR)
          dot(px, W, H, mid - 4.4 * u, y - 1.4 * u, 0x101010)
          dot(px, W, H, mid - 4.4 * u, y + 0.4 * u, 0xc06050)
          // flowers sprout around
          for (let k = 0; k < 7; k++) {
            if (g - 60 < k * 14) break
            const fx = Math.round(hash(k, 3, seed) * (W - 2)) + 1
            const fy = gy + 1 + Math.round(hash(k, 4, seed) * (H - gy - 4))
            const c = [0xff70a0, 0xffe060, 0xffffff, 0xb080ff][k % 4] as number
            dot(px, W, H, fx, fy, c)
            dot(px, W, H, fx - 1, fy, c)
            dot(px, W, H, fx + 1, fy, c)
            dot(px, W, H, fx, fy - 1, c)
            dot(px, W, H, fx, fy, 0xf0a020)
          }
          // a butterfly visits
          const ba = g * 0.05
          const bx = mid + Math.cos(ba) * 7 * u
          const by = gy - 8 * u + Math.sin(ba * 2) * 3 * u
          const flap = Math.floor(g / 2) % 2
          dot(px, W, H, bx, by, 0x302010)
          dot(px, W, H, bx - 1, by - flap, 0xff9030)
          dot(px, W, H, bx + 1, by - flap, 0xff9030)
          if (flap) {
            dot(px, W, H, bx - 1, by - 2, 0xff9030)
            dot(px, W, H, bx + 1, by - 2, 0xff9030)
          }
        }
        blades(true)
        if (f > T - 20) {
          const k = (f - (T - 20)) / 20
          for (let i = 0; i < px.length; i++) px[i] = mix(px[i] as number, 0x000000, k)
        }
      }
    },
  }
}

// --- the feed in the feed -----------------------------------------------------------

const feedfeed: Maker = (W, H, rng) => {
  const pw = Math.max(8, Math.round(W * 0.66))
  const ph = Math.max(12, Math.round(H * 0.68))
  const ox = Math.round((W - pw) / 2)
  const oy = Math.round(H * 0.1)
  const sw = pw - 2
  const sh = ph - 4
  const CLIP = 50
  const SWIPE = 8
  const KINDS = 6
  const buf = new Uint32Array(sw * sh)
  let order = [irand(rng, KINDS)]
  let t = 0
  let liked = false
  const tri = (v: number, m: number) => m - Math.abs((((v % (2 * m)) + 2 * m) % (2 * m)) - m)

  // one tiny clip, drawn from its own clock alone
  const clip = (k: number, b: Uint32Array, w: number, h: number, tt: number) => {
    if (k === 0) {
      b.fill(0x101018)
      const bw = Math.max(2, Math.round(w * 0.3))
      const x = tri(tt * 0.6, w - bw)
      const y = tri(tt * 0.45 + 3, h - 2)
      rect(b, w, h, x, y, bw, 2, hsv(Math.floor((tt * 0.6) / (w - bw)) * 0.17 + Math.floor((tt * 0.45 + 3) / (h - 2)) * 0.31, 0.7, 1))
    } else if (k === 1) {
      sky(b, w, h, 0x4aa0e8, 0xb8e4f8)
      rect(b, w, h, 0, h - 3, w, 3, 0x2a7ac0)
      const y = h * 0.35 + Math.sin(tt * 0.2) * 1.5
      rect(b, w, h, w / 2 - 4, y, 8, 2, 0x4a9a3a)
      rect(b, w, h, w / 2 - 1, y + 1, 2, 3, 0x9aa4b0)
      dot(b, w, h, w / 2 + 2, y, 0xfff060)
      dot(b, w, h, w / 2 + 4, y + (tt % 2), 0xd8d8d8)
    } else if (k === 2) {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          const a = Math.atan2(y - h / 2, x - w / 2) + tt * 0.15
          b[y * w + x] = Math.floor(((a + Math.PI * 8) / (Math.PI * 2)) * 8) % 2 ? 0xff70a0 : 0xffd060
        }
    } else if (k === 3) {
      b.fill(0x2a1a3a)
      const r = Math.max(2, w * 0.25)
      const cx = w / 2
      const cy = h / 2
      const s = Math.cos(tt * 0.4)
      disc(b, w, h, cx, cy, r, 0xf0a040)
      dot(b, w, h, cx - r * 0.7 * s, cy - r, 0xf0a040)
      dot(b, w, h, cx + r * 0.7 * s, cy - r, 0xf0a040)
      if (s > 0) {
        dot(b, w, h, cx - r * 0.4 * s, cy - 1, 0x101010)
        dot(b, w, h, cx + r * 0.4 * s, cy - 1, 0x101010)
      }
    } else if (k === 4) {
      b.fill(0x1a1020)
      const pile = Math.min(h * 0.6, tt * 0.25)
      for (let x = 0; x < w; x++) {
        const hh = Math.max(0, pile - Math.abs(x - w / 2) * 0.9)
        rect(b, w, h, x, h - hh, 1, hh, hash(x, 0, 3) < 0.5 ? 0xe0b060 : 0xd0a050)
      }
      for (let k2 = 0; k2 < 3; k2++) dot(b, w, h, w / 2, (tt * 1.5 + k2 * 4) % (h - pile), 0xe0b060)
    } else {
      // the feed, inside the feed, inside the feed
      b.fill(0x2a1a3a)
      const iw = Math.max(3, Math.round(w * 0.5))
      const ih = Math.max(5, Math.round(h * 0.6))
      const ix = Math.round((w - iw) / 2)
      const iy = Math.round((h - ih) / 2)
      rect(b, w, h, ix, iy, iw, ih, 0x101014)
      rect(b, w, h, ix + 1, iy + 1, iw - 2, ih - 2, hsv(tt * 0.01, 0.5, 0.5))
      dot(b, w, h, ix + 1 + tri(tt * 0.4, iw - 3), iy + 1 + tri(tt * 0.3, ih - 3), 0xffffff)
    }
  }

  const HEART = ['.r.r.', 'rrrrr', 'rrrrr', '.rrr.', '..r..']

  return {
    step() {
      t++
      const f = t % (CLIP + SWIPE)
      if (f === 0) {
        let k = irand(rng, KINDS)
        if (k === order[order.length - 1]) k = (k + 1) % KINDS
        order.push(k)
        if (order.length > 3) order = order.slice(-3)
        liked = rng() < 0.4
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a1a3a, 0x4a2a5a)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 11) < 0.01) px[y * W + x] = 0x6a4a7a
      rect(px, W, H, ox - 1, oy - 1, pw + 2, ph + 2, 0x3a3a44)
      rect(px, W, H, ox, oy, pw, ph, 0x101014)
      const f = t % (CLIP + SWIPE)
      const cur = order[order.length - 1] as number
      const prev = order[order.length - 2]
      const tt = Math.floor(t / (CLIP + SWIPE)) * 7 + f
      // during the first frames of a clip, the previous one slides away
      const slide = prev !== undefined && f < SWIPE ? Math.round(sh * (1 - f / SWIPE) ** 2) : 0
      const blit = (k: number, dy: number, at: number) => {
        clip(k, buf, sw, sh, at)
        for (let y = 0; y < sh; y++) {
          const yy = y + dy
          if (yy < 0 || yy >= sh) continue
          for (let x = 0; x < sw; x++) dot(px, W, H, ox + 1 + x, oy + 2 + yy, buf[y * sw + x] as number)
        }
      }
      blit(cur, slide, tt)
      if (slide) blit(prev as number, slide - sh, tt + CLIP)
      // the tiny app around the clip
      for (let k = 0; k < 3; k++) dot(px, W, H, ox + pw - 3, oy + ph * 0.45 + k * 3, 0xffffff)
      rect(px, W, H, ox + 1, oy + ph - 3, ((sw * f) / (CLIP + SWIPE)) | 0, 1, 0xffffff)
      rect(px, W, H, ox + pw / 2 - 1, oy + 1, 3, 1, 0x2a2a30)
      if (liked && f > 22 && f < 36) {
        const k = Math.min(1, (f - 22) / 3)
        if (k >= 1) sprite(px, W, H, ox + pw / 2 - 2, oy + ph * 0.45 - 2 - (f - 25) * 0.3, HEART, { r: 0xff3060 })
        else dot(px, W, H, ox + pw / 2, oy + ph * 0.45, 0xff3060)
      }
      // the thumb: it rests, then flicks up
      const lift = f >= CLIP + SWIPE - 6 ? (f - (CLIP + SWIPE - 6)) / 6 : f < 3 ? 1 - f / 3 : 0
      const tx = ox + pw * 0.6
      const ty = oy + ph * (0.85 - lift * 0.45)
      line(px, W, H, W + 2, H - 1, tx, ty, 0xe0a880)
      line(px, W, H, W + 2, H, tx + 1, ty + 1, 0xe0a880)
      line(px, W, H, W + 2, H - 2, tx + 1, ty, 0xe0a880)
      dot(px, W, H, tx, ty, 0xf0c0a0)
      // the fingers holding the left edge
      for (let k = 0; k < 3; k++) rect(px, W, H, ox - 2, oy + ph * 0.5 + k * 3, 2, 2, 0xe0a880)
      rect(px, W, H, ox - 1, oy + ph + 1, pw * 0.7, H, 0xd09870)
    },
  }
}

// --- Ballerina Cappuccina -----------------------------------------------------------

const ballerina: Maker = (W, H, rng) => {
  const u = W / 32
  const gy = Math.round(H * 0.82)
  const T = 250
  const CUP = 0xf4f0e8
  const PINK = 0xf8a0c8
  const SKIN = 0xf0c8a0
  let t = 0
  let a = 0
  let foam: Spark[] = []
  let roses: { x: number; y: number; vy: number }[] = []
  const speed = (f: number) => (f < 110 ? lerp(0.05, 0.75, f / 110) : f < 160 ? 0.75 : f < 210 ? lerp(0.75, 0, (f - 160) / 50) : 0)

  return {
    step() {
      t++
      const f = t % T
      if (f === 0) roses = []
      a += speed(f)
      const cx = W / 2
      const cupTop = gy - 23 * u
      if (f > 90 && f < 170 && rng() < 0.6) {
        const s = rng() < 0.5 ? -1 : 1
        foam.push({ x: cx + s * 2 * u, y: cupTop, vx: s * (0.6 + rng() * 0.8), vy: -0.5 - rng() * 0.6, l: 14 + irand(rng, 8), c: rng() < 0.5 ? 0xf0e0c0 : 0xffffff })
      }
      if (f > 212 && f < 240 && rng() < 0.25) roses.push({ x: W * 0.15 + rng() * W * 0.7, y: -2, vy: 0.5 })
      for (const r of roses) {
        if (r.y < gy + 2 * u) {
          r.vy += 0.06
          r.y = Math.min(gy + 2 * u, r.y + r.vy)
        }
      }
      foam = sparks(foam, 0.06)
    },
    draw(px) {
      const f = t % T
      const cx = W / 2
      // stage, curtains, spotlight
      for (let y = 0; y < H; y++)
        for (let x = 0; x < W; x++) {
          let c = y < gy ? 0x3a1020 : (Math.floor(y - gy) % 3 === 2 ? 0x6a4020 : 0x8a5a30)
          const half = 2 * u + (y / H) * W * 0.32
          if (Math.abs(x - cx) < half) c = mix(c, 0xfff0c0, y < gy ? 0.18 : 0.35)
          px[y * W + x] = c
        }
      for (const side of [0, 1])
        for (let x = 0; x < 5 * u; x++) {
          const xx = side ? W - 1 - x : x
          const c = Math.floor(x / Math.max(1, u * 1.2)) % 2 ? 0x801828 : 0xa02030
          rect(px, W, H, xx, 0, 1, gy + 2 * u - (x / (5 * u)) * 4 * u, c)
        }
      rect(px, W, H, 0, 0, W, 2 * u, 0xa02030)
      ellipse(px, W, H, cx, gy + u, 5 * u, 1.2 * u, mix(0x8a5a30, 0x000000, 0.35))

      const ca = Math.cos(a)
      const sa = Math.sin(a)
      // standing leg, and the bent one swinging round
      const hip = gy - 10 * u
      rect(px, W, H, cx - 0.5 * u, hip, Math.max(1, u), 10 * u, PINK)
      dot(px, W, H, cx, gy - 1, 0xffe0f0)
      const knee: [number, number] = [cx + ca * 3 * u, hip + 3 * u]
      const back = sa < 0
      const leg = () => {
        line(px, W, H, cx, hip + u, knee[0], knee[1], PINK)
        line(px, W, H, knee[0], knee[1], cx + ca * 0.5 * u, hip + 5 * u, PINK)
      }
      if (back) leg()
      // torso and tutu
      rect(px, W, H, cx - u, hip - 6 * u, 2 * u + 1, 6 * u, 0xe880b0)
      ellipse(px, W, H, cx, hip, 6 * u, 1.6 * u, PINK)
      for (let j = 0; j < 6; j++) {
        const b = a + (j * Math.PI) / 3
        if (Math.sin(b) > 0) dot(px, W, H, cx + Math.cos(b) * 5 * u, hip + Math.sin(b) * 0.8 * u, 0xd870a0)
      }
      if (!back) leg()
      // arms in an arch above the cup
      const sh = hip - 6 * u
      const reach = 2 * u + Math.abs(ca) * 3 * u
      for (const s of [-1, 1]) {
        line(px, W, H, cx + s * u, sh, cx + s * reach, sh - 5 * u, SKIN)
        line(px, W, H, cx + s * reach, sh - 5 * u, cx + s * 0.5, sh - 11 * u, SKIN)
      }
      // the head: a cappuccino cup on its saucer
      const handleX = cx + ca * 3 * u
      const cupY = sh - 1
      const handle = () => ring(px, W, H, handleX, cupY - 2.5 * u, 1.2 * u, CUP)
      ellipse(px, W, H, cx, cupY, 3.5 * u, 0.8 * u, 0xe0dcd0)
      if (back) handle()
      poly(px, W, H, [[cx - 2.6 * u, cupY - 5 * u], [cx + 2.6 * u, cupY - 5 * u], [cx + 1.8 * u, cupY - 0.5], [cx - 1.8 * u, cupY - 0.5]], CUP)
      ellipse(px, W, H, cx, cupY - 5 * u, 2.6 * u, 0.9 * u, 0x8a5a30)
      ellipse(px, W, H, cx + sa * 0.6 * u, cupY - 5 * u, 1.3 * u, 0.5 * u, 0xf0e0c0)
      if (!back) handle()
      // a face painted on the cup, when it looks this way
      if (ca > -0.3) {
        const fx = cx + sa * 1.2 * u
        dot(px, W, H, fx - 0.8 * u, cupY - 3 * u, 0x3a2418)
        dot(px, W, H, fx + 0.8 * u, cupY - 3 * u, 0x3a2418)
        dot(px, W, H, fx, cupY - 1.8 * u, 0xe05a7a)
      }
      // speed lines when she really goes
      if (speed(f) > 0.5)
        for (let k = 0; k < 4; k++) {
          const b = a * 0.5 + k * 1.57
          dot(px, W, H, cx + Math.cos(b) * 8 * u, hip - 4 * u + Math.sin(b) * 2 * u, 0xfff0c0)
        }
      for (const s of foam) dot(px, W, H, s.x, s.y, s.c)
      for (const r of roses) {
        dot(px, W, H, r.x, r.y, 0xe02040)
        dot(px, W, H, r.x + 1, r.y, 0xe02040)
        dot(px, W, H, r.x - 1, r.y + 1, 0x3a8a3a)
      }
    },
  }
}

// --- Elefantino Cactusino -----------------------------------------------------------

const elefantino: Maker = (W, H, rng) => {
  const u = W / 32
  const gy = Math.round(H * 0.78)
  const SPEED = 0.5
  const G = 0x4aa050
  const GD = 0x3a8040
  const SPINE = 0xf8f4c8
  type Balloon = { x: number; y: number; c: number; ph: number }
  let balloons: Balloon[] = []
  let bits: Spark[] = []
  let cam = 0
  let t = 0
  let lift = 0
  let shock = 0
  let popped = 0
  let next = 10
  const cx = W * 0.4
  const by = gy - 9 * u
  const head: [number, number] = [cx + 7 * u, gy - 13 * u]
  // the trunk: a curve from the face, curled down, or raised to reach
  const trunk = (k: number): [number, number] => {
    const x0 = head[0] + 3 * u
    const y0 = head[1] + u
    const ang = lerp(1.3, -0.9, lift) + k * lerp(0.2, -0.6, lift)
    let x = x0
    let y = y0
    const n = Math.round(k * 6)
    for (let i = 0; i < n; i++) {
      const b = ang + (i / 6) * lerp(0.9, -1.2, lift)
      x += Math.cos(b) * 1.3 * u
      y += Math.sin(b) * 1.3 * u
    }
    return [x, y]
  }

  return {
    step() {
      t++
      cam += SPEED
      if (--next <= 0) {
        balloons.push({ x: W + 3 * u, y: H * (0.12 + rng() * 0.38), c: hsv(rng(), 0.65, 1), ph: rng() * 6 })
        next = 18 + irand(rng, 22)
      }
      for (const b of balloons) {
        b.x -= SPEED + 0.25
        b.y += Math.sin(t * 0.08 + b.ph) * 0.15
      }
      const near = balloons.find(b => b.x > cx && b.x < cx + 20 * u && b.y > head[1] - 12 * u)
      lift += ((near ? 1 : 0) - lift) * 0.12
      const tip = trunk(1)
      balloons = balloons.filter(b => {
        const r = 2.2 * u
        const hitTip = Math.hypot(b.x - tip[0], b.y - tip[1]) < r + 1.5 * u
        const hitHead = Math.hypot(b.x - head[0], b.y - head[1]) < r + 4.5 * u
        const hitBody = Math.hypot((b.x - cx) / (8 * u), (b.y - by) / (5 * u)) < 1.2
        if (hitTip || hitHead || hitBody) {
          burst(bits, rng, b.x, b.y, b.c, 12, 1.3)
          shock = 10
          popped++
          return false
        }
        return b.x > -4 * u
      })
      for (const s of bits) s.x -= SPEED
      bits = sparks(bits, 0.05)
      if (shock > 0) shock--
    },
    draw(px) {
      sky(px, W, H, 0xf8a050, 0xfcd890, gy)
      disc(px, W, H, W * 0.78, H * 0.17, 4 * u, 0xfff0a0)
      for (let x = 0; x < W; x++) {
        const dy = Math.round(gy - 4 * u - Math.sin((x + cam * 0.25) * 0.09) * 3 * u)
        rect(px, W, H, x, dy, 1, gy - dy, 0xe8b068)
      }
      // little cacti far behind
      for (let k = 0; k < 3; k++) {
        const span = W + 10 * u
        const x = ((((k * 13 * u - cam * 0.6) % span) + span) % span) - 4 * u
        rect(px, W, H, x, gy - 6 * u, 2 * u, 6 * u, 0x6a9a50)
        rect(px, W, H, x - 1.5 * u, gy - 4 * u, 1.5 * u, u, 0x6a9a50)
        rect(px, W, H, x - 1.5 * u, gy - 5.5 * u, u, 1.5 * u, 0x6a9a50)
      }
      rect(px, W, H, 0, gy, W, H - gy, 0xf0c070)
      for (let y = gy + 1; y < H; y += 2)
        for (let x = 0; x < W; x++) if (hash(Math.floor(x + cam), y, 5) < 0.06) px[y * W + x] = 0xd09a50

      // legs, walking
      for (const [lx, s] of [[-5, 1], [-2, -1], [3, 1], [5.5, -1]] as const) {
        const up = Math.max(0, Math.sin(t * 0.35) * s) * u
        rect(px, W, H, cx + lx * u - u, by + 3 * u, 2.5 * u, gy - by - 3 * u - up, lx === -2 || lx === 5.5 ? GD : G)
        rect(px, W, H, cx + lx * u - u, gy - up - 1, 2.5 * u, 1, 0xd8e8b0)
      }
      line(px, W, H, cx - 8 * u, by - u, cx - 10 * u, by + 2 * u, GD)
      // body with cactus ribs and spines
      ellipse(px, W, H, cx, by, 8 * u, 5 * u, G)
      for (let k = -3; k <= 3; k++) line(px, W, H, cx + k * 2 * u, by - 4 * u + Math.abs(k) * 0.6 * u, cx + k * 2 * u, by + 4 * u - Math.abs(k) * 0.6 * u, GD)
      for (let k = 0; k < 14; k++) {
        const b = (k / 14) * Math.PI * 2
        dot(px, W, H, cx + Math.cos(b) * 8.6 * u, by + Math.sin(b) * 5.6 * u, SPINE)
      }
      // head, ear pad, trunk
      disc(px, W, H, head[0], head[1], 4 * u, G)
      for (let k = 0; k < 9; k++) {
        const b = -Math.PI * 0.9 + (k / 8) * Math.PI * 1.1
        dot(px, W, H, head[0] + Math.cos(b) * 4.6 * u, head[1] + Math.sin(b) * 4.6 * u, SPINE)
      }
      ellipse(px, W, H, head[0] - 2.5 * u, head[1] + 0.5 * u, 2.6 * u, 3.6 * u, GD)
      dot(px, W, H, head[0] - 2.5 * u, head[1] - 3.6 * u, SPINE)
      dot(px, W, H, head[0] - 4.6 * u, head[1] + u, SPINE)
      for (let k = 0; k <= 12; k++) {
        const [x, y] = trunk(k / 12)
        disc(px, W, H, x, y, 1.2 * u * (1 - k / 30), G)
        if (k % 4 === 2) dot(px, W, H, x, y - 1.2 * u, SPINE)
      }
      const er = shock ? 1.4 * u : 0.9 * u
      disc(px, W, H, head[0] + 1.5 * u, head[1] - u, er, 0xffffff)
      dot(px, W, H, head[0] + 1.5 * u + (shock ? 0 : 0.3 * u), head[1] - u, 0x101010)
      // a flower on top
      for (const [fx, fy] of [[0, -1], [-1, 0], [1, 0], [0, 1]] as const) dot(px, W, H, head[0] + fx, head[1] - 4.8 * u + fy, 0xff70b0)
      dot(px, W, H, head[0], head[1] - 4.8 * u, 0xffe060)

      for (const b of balloons) {
        line(px, W, H, b.x, b.y + 2.2 * u, b.x + Math.sin(t * 0.2 + b.ph), b.y + 6 * u, 0x8a6a50)
        disc(px, W, H, b.x, b.y, 2.2 * u, b.c)
        dot(px, W, H, b.x - 0.8 * u, b.y - 0.8 * u, mix(b.c, 0xffffff, 0.6))
      }
      for (const s of bits) dot(px, W, H, s.x, s.y, s.c)
      if (shock) text(px, W, H, head[0] + 4 * u, head[1] - 9 * u, '!', 0xffffff)
      text(px, W, H, 1, 1, String(popped), 0xffffff)
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
  crocbomber,
  tumtum,
  tierlist,
  catkeys,
  touchgrass,
  feedfeed,
  ballerina,
  elefantino,
}
