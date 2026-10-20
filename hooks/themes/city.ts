import { disc, dot, hsv, mix, rect, scale, sky, sprite, text } from '../draw'
import type { Maker } from '../draw'
import { burst, clamp, ellipse, hash, irand, line, pick, poly, ring, sparks } from '../kit'
import type { Spark } from '../kit'

// Vehicles & city: busy little worlds to watch from above.

const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1)

function car(px: Uint32Array, W: number, H: number, x: number, y: number, horiz: boolean, c: number) {
  if (horiz) {
    rect(px, W, H, x - 2, y - 1, 5, 3, c)
    dot(px, W, H, x, y, 0xa8d8ff)
  } else {
    rect(px, W, H, x - 1, y - 2, 3, 5, c)
    dot(px, W, H, x, y, 0xa8d8ff)
  }
}

// --- traffic lights ---------------------------------------------------------------

const traffic: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H / 2
  const half = 4
  type C = { d: number; p: number; c: number }
  let cars: C[] = []
  let t = 0
  // d: 0 down, 1 up, 2 right, 3 left; p: distance travelled from its entry edge
  const len = (d: number) => (d < 2 ? H : W)
  const stop = (d: number) => (d < 2 ? cy - half - 3 : cx - half - 3)
  const pos = (c: C): [number, number] => {
    if (c.d === 0) return [cx + 2, c.p]
    if (c.d === 1) return [cx - 2, H - c.p]
    if (c.d === 2) return [c.p, cy - 2]
    return [W - c.p, cy + 2]
  }

  return {
    step() {
      t++
      const ns = Math.floor(t / 180) % 2 === 0
      const amber = t % 180 > 150
      if (rng() < 0.05) {
        const d = irand(rng, 4)
        if (!cars.some(c => c.d === d && c.p < 6)) cars.push({ d, p: -3, c: hsv(rng(), 0.7, 0.95) })
      }
      for (const c of cars) {
        const green = (c.d < 2) === ns && !amber
        const s = stop(c.d)
        const ahead = cars.filter(o => o.d === c.d && o.p > c.p).sort((a, b) => a.p - b.p)[0]
        let v = 0.5
        if (ahead && ahead.p - c.p < 6) v = 0
        if (!green && c.p < s && c.p + v >= s - 0.5) v = Math.max(0, s - c.p - 0.5)
        c.p += v
      }
      cars = cars.filter(c => c.p < len(c.d) + 4)
    },
    draw(px) {
      px.fill(0x5aa04a)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 2) > 0.92) px[y * W + x] = 0x4a903a
      rect(px, W, H, cx - half, 0, half * 2, H, 0x4a4a52)
      rect(px, W, H, 0, cy - half, W, half * 2, 0x4a4a52)
      for (let y = 0; y < H; y += 4) if (Math.abs(y - cy) > half) dot(px, W, H, cx, y, 0xe0e0a0)
      for (let x = 0; x < W; x += 4) if (Math.abs(x - cx) > half) dot(px, W, H, x, cy, 0xe0e0a0)
      for (let k = -half; k < half; k += 2) {
        dot(px, W, H, cx + k, cy - half - 1, 0xffffff)
        dot(px, W, H, cx + k, cy + half, 0xffffff)
        dot(px, W, H, cx - half - 1, cy + k, 0xffffff)
        dot(px, W, H, cx + half, cy + k, 0xffffff)
      }
      for (const c of cars) {
        const [x, y] = pos(c)
        car(px, W, H, x, y, c.d >= 2, c.c)
      }
      const ns = Math.floor(t / 180) % 2 === 0
      const amber = t % 180 > 150
      const light = (x: number, y: number, on: boolean) => {
        rect(px, W, H, x, y, 2, 4, 0x1a1a1a)
        dot(px, W, H, x, y, on ? 0x2a2a2a : amber ? 0x2a2a2a : 0xff3a3a)
        dot(px, W, H, x, y + 1, on && amber ? 0xffb020 : 0x2a2a2a)
        dot(px, W, H, x, y + 2, on && !amber ? 0x3aff6a : 0x2a2a2a)
      }
      light(cx + half + 1, cy - half - 5, ns)
      light(cx - half - 3, cy + half + 1, ns)
      light(cx - half - 3, cy - half - 5, !ns)
      light(cx + half + 1, cy + half + 1, !ns)
    },
  }
}

// --- roundabout -------------------------------------------------------------------

const roundabout: Maker = (W, H, rng) => {
  const cx = W / 2
  const cy = H / 2
  const R = Math.min(W, H) * 0.3
  type C = { stage: number; a: number; p: number; arm: number; exit: number; c: number }
  let cars: C[] = []
  const ARM = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]
  const armLen = Math.max(W, H)

  return {
    step() {
      if (rng() < 0.05) {
        const arm = irand(rng, 4)
        cars.push({ stage: 0, a: 0, p: armLen / 2 + 4, arm, exit: (arm + 1 + irand(rng, 3)) % 4, c: hsv(rng(), 0.7, 0.95) })
      }
      for (const c of cars) {
        if (c.stage === 0) {
          const blocked = cars.some(o => o.stage === 0 && o.arm === c.arm && o.p < c.p && c.p - o.p < 5)
          const yieldRing = c.p < R + 4 && cars.some(o => o.stage === 1 && Math.abs(Math.atan2(Math.sin(ARM[c.arm]! - 0.6 - o.a), Math.cos(ARM[c.arm]! - 0.6 - o.a))) < 0.5)
          if (!blocked && !yieldRing) c.p -= 0.45
          if (c.p <= R) {
            c.stage = 1
            c.a = ARM[c.arm] as number
          }
        } else if (c.stage === 1) {
          c.a += 0.45 / R
          const target = ARM[c.exit] as number
          if (Math.abs(Math.atan2(Math.sin(c.a - target), Math.cos(c.a - target))) < 0.05 && c.a - (ARM[c.arm] as number) > 0.5) {
            c.stage = 2
            c.p = R
            c.arm = c.exit
          }
        } else c.p += 0.45
      }
      cars = cars.filter(c => c.p < armLen)
    },
    draw(px) {
      px.fill(0x5aa04a)
      for (const a of ARM) {
        const ex = cx + Math.cos(a) * armLen
        const ey = cy + Math.sin(a) * armLen
        for (let k = -3; k <= 3; k++) line(px, W, H, cx + Math.sin(a) * k, cy - Math.cos(a) * k, ex + Math.sin(a) * k, ey - Math.cos(a) * k, 0x4a4a52)
      }
      disc(px, W, H, cx, cy, R + 3, 0x4a4a52)
      disc(px, W, H, cx, cy, R - 3, 0x6ac05a)
      ring(px, W, H, cx, cy, R - 3, 0xffffff)
      disc(px, W, H, cx, cy, 2, 0xff6a9a)
      for (const c of cars) {
        let x: number
        let y: number
        if (c.stage === 1) {
          x = cx + Math.cos(c.a) * R
          y = cy + Math.sin(c.a) * R
        } else {
          const a = ARM[c.arm] as number
          const side = c.stage === 0 ? -1.5 : 1.5
          x = cx + Math.cos(a) * c.p + Math.sin(a) * side
          y = cy + Math.sin(a) * c.p - Math.cos(a) * side
        }
        disc(px, W, H, x, y, 1.2, c.c)
        dot(px, W, H, x, y, mix(c.c, 0xffffff, 0.5))
      }
    },
  }
}

// --- parallel parking -------------------------------------------------------------

const parallel: Maker = (W, H, rng) => {
  const curb = Math.round(W * 0.3)
  const gapY = H * 0.5
  let tries: { x: number; y: number; a: number }[][] = []
  let path: { x: number; y: number; a: number }[] = []
  let pi = 0
  let attempt = 0
  let bump = 0
  let hold = 0
  const parkedC = [0x3a6ae0, 0xe0c03a, 0x6a6a72, 0x3ac06a]

  function plan() {
    attempt = 0
    tries = []
    const n = 1 + irand(rng, 3)
    for (let k = 0; k < n; k++) tries.push(maneuver(k < n - 1 ? (rng() < 0.5 ? 3 : -3) : 0))
    pi = 0
    path = tries[0] as { x: number; y: number; a: number }[]
  }
  function maneuver(err: number) {
    const out: { x: number; y: number; a: number }[] = []
    const sx = curb + 7
    const sy = gapY - 12
    for (let k = 0; k <= 30; k++) out.push({ x: sx, y: sy - 10 + k * (10 / 30), a: 0 })
    for (let k = 0; k <= 40; k++) {
      const u = k / 40
      const x = sx - (sx - curb - 2 + err * 0.3) * (u < 0.5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u))
      const y = sy + u * (14 + err)
      const a = Math.sin(u * Math.PI) * 0.6
      out.push({ x, y, a })
    }
    return out
  }
  plan()

  return {
    step() {
      if (bump > 0) bump--
      if (hold > 0) {
        if (--hold === 0) plan()
        return
      }
      pi++
      if (pi >= path.length) {
        attempt++
        if (attempt >= tries.length) hold = 70
        else {
          bump = 10
          path = tries[attempt] as { x: number; y: number; a: number }[]
          pi = 0
        }
      }
    },
    draw(px) {
      px.fill(0x4a4a52)
      rect(px, W, H, 0, 0, curb - 4, H, 0xb8b0a0)
      rect(px, W, H, curb - 4, 0, 1, H, 0xe0d8c8)
      for (let y = 0; y < H; y += 6) dot(px, W, H, W * 0.75, y, 0xe0e0a0)
      const park = (y: number, c: number) => {
        rect(px, W, H, curb - 2, y - 4, 4, 8, c)
        rect(px, W, H, curb - 1, y - 3, 2, 2, 0xa8d8ff)
      }
      park(gapY - 14, parkedC[0] as number)
      park(gapY + 14, parkedC[1] as number)
      park(gapY - 26, parkedC[2] as number)
      park(gapY + 26, parkedC[3] as number)
      const p = path[Math.min(pi, path.length - 1)] as { x: number; y: number; a: number }
      const shake = bump > 0 ? Math.sin(bump * 2) : 0
      const c = Math.cos(p.a)
      const s = Math.sin(p.a)
      const pts: [number, number][] = [
        [-2, -4],
        [2, -4],
        [2, 4],
        [-2, 4],
      ].map(([x, y]) => [p.x + shake + x * c - y * s, p.y + x * s + y * c] as [number, number])
      poly(px, W, H, pts, 0xe03a3a)
      dot(px, W, H, p.x + shake + 2 * s, p.y - 2 * c, 0xa8d8ff)
      if (bump > 5) text(px, W, H, p.x + 4, p.y - 8, '!', 0xffe040)
      if (hold > 0 && hold % 10 < 6) text(px, W, H, W - 8, 2, String(attempt), 0xffffff)
    },
  }
}

// --- level crossing ---------------------------------------------------------------

const levelcross: Maker = (W, H, rng) => {
  const road = Math.round(H * 0.62)
  const rail = Math.round(W * 0.55)
  let t = 0
  let train = -1
  let cars: { x: number; c: number }[] = []
  let wagons = 6

  return {
    step() {
      t++
      const cycle = t % 420
      if (cycle === 60) {
        train = -60 - wagons * 9
        wagons = 4 + irand(rng, 6)
      }
      if (train > -999) {
        train += 1.4
        if (train > H + 10) train = -999
      }
      const closed = cycle > 40 && cycle < 300
      if (rng() < 0.03 && !cars.some(c => c.x < 6)) cars.push({ x: -4, c: hsv(rng(), 0.7, 0.95) })
      for (const c of cars) {
        const ahead = cars.filter(o => o.x > c.x).sort((a, b) => a.x - b.x)[0]
        let v = 0.45
        if (ahead && ahead.x - c.x < 7) v = 0
        if (closed && c.x < rail - 6 && c.x + v >= rail - 6) v = 0
        c.x += v
      }
      cars = cars.filter(c => c.x < W + 5)
    },
    draw(px) {
      px.fill(0x6ab04a)
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (hash(x, y, 7) > 0.93) px[y * W + x] = 0x5aa03a
      rect(px, W, H, 0, road - 3, W, 6, 0x4a4a52)
      for (let x = 0; x < W; x += 4) dot(px, W, H, x, road, 0xe0e0a0)
      rect(px, W, H, rail - 3, 0, 6, H, 0x8a7a6a)
      for (let y = 0; y < H; y += 2) rect(px, W, H, rail - 3, y, 6, 1, 0x6a4a2a)
      rect(px, W, H, rail - 2, 0, 1, H, 0xb0b0b8)
      rect(px, W, H, rail + 1, 0, 1, H, 0xb0b0b8)
      const cycle = t % 420
      const closed = cycle > 40 && cycle < 300
      const arm = closed ? span(cycle, 40, 55) : 1 - span(cycle, 300, 315)
      const bx = rail - 6
      rect(px, W, H, bx, road - 8, 1, 5, 0x3a3a3a)
      line(px, W, H, bx, road - 8, bx + (1 - arm) * 1 + arm * 0, road - 8 + arm * 0 - (1 - arm) * 8, 0xffffff)
      if (arm > 0.5) for (let k = 0; k < 8; k++) dot(px, W, H, bx - k, road - 8, k % 2 ? 0xe03a3a : 0xffffff)
      const blink = closed && t % 12 < 6
      dot(px, W, H, bx - 1, road - 10, blink ? 0xff3a3a : 0x4a1a1a)
      dot(px, W, H, bx + 1, road - 10, !blink && closed ? 0xff3a3a : 0x4a1a1a)
      for (const c of cars) car(px, W, H, c.x, road + 1.5, true, c.c)
      if (train > -999) {
        for (let k = 0; k <= wagons; k++) {
          const y = train - k * 9
          rect(px, W, H, rail - 3, y - 8, 6, 8, k === 0 ? 0xe03a3a : k % 2 ? 0x3a6ae0 : 0x2a8a5a)
          rect(px, W, H, rail - 2, y - 7, 4, 2, k === 0 ? 0xffe060 : 0xa8d8ff)
        }
      }
    },
  }
}

// --- runway -----------------------------------------------------------------------

const runway: Maker = (W, H, rng) => {
  const cx = W / 2
  let t = 0
  type P = { y: number; z: number; mode: number; c: number }
  let planes: P[] = []

  return {
    step() {
      t++
      if (t % 200 === 1) planes.push({ y: -10, z: 10, mode: 0, c: pick(rng, [0xffffff, 0xe0e8f0]) })
      if (t % 200 === 100) planes.push({ y: H * 0.8, z: 0, mode: 1, c: pick(rng, [0xffffff, 0xe0e8f0]) })
      for (const p of planes) {
        if (p.mode === 0) {
          p.y += 0.9 - Math.min(0.6, Math.max(0, p.y - H * 0.4) * 0.03)
          p.z = Math.max(0, 10 - (p.y + 10) * 0.25)
        } else {
          p.y -= 0.3 + Math.max(0, H * 0.8 - p.y) * 0.04
          p.z = Math.max(0, (H * 0.6 - p.y) * 0.2)
        }
      }
      planes = planes.filter(p => p.y > -16 && p.y < H + 6)
    },
    draw(px) {
      px.fill(0x6aa04a)
      rect(px, W, H, cx - 6, 0, 12, H, 0x4a4a52)
      for (let y = 0; y < H; y += 6) rect(px, W, H, cx, y, 1, 3, 0xffffff)
      for (let y = 0; y < H; y += 4) {
        dot(px, W, H, cx - 7, y, (t >> 2) % 6 === (y >> 2) % 6 ? 0xffffff : 0x3a8aff)
        dot(px, W, H, cx + 6, y, (t >> 2) % 6 === (y >> 2) % 6 ? 0xffffff : 0x3a8aff)
      }
      rect(px, W, H, 1, H * 0.3, 6, 8, 0xb8b8c0)
      rect(px, W, H, 3, H * 0.3 - 4, 2, 4, 0xd0d0d8)
      for (const p of planes) {
        const s = 1 + p.z * 0.06
        ellipse(px, W, H, cx + p.z * 0.6, p.y + p.z, 2 * s, 1, 0x3a5a3a)
        const x = cx
        const y = p.y
        rect(px, W, H, x - 0.5, y - 4 * s, 2, 8 * s, p.c)
        rect(px, W, H, x - 5 * s, y - 1, 10 * s + 1, 2, p.c)
        rect(px, W, H, x - 2 * s, y + 3 * s, 4 * s + 1, 1, p.c)
        dot(px, W, H, x, y - 4 * s, 0x3a8aff)
        if (t % 10 < 5) dot(px, W, H, x - 5 * s, y, 0xff3a3a)
      }
    },
  }
}

// --- car wash tunnel --------------------------------------------------------------

const carwash: Maker = (W, H, rng) => {
  const floor = Math.round(H * 0.68)
  let x = -14
  let t = 0
  let foam: { x: number; y: number; l: number }[] = []
  let sparkle: Spark[] = []
  let c = 0xe03a3a

  return {
    step() {
      t++
      x += 0.2
      if (x > W + 4) {
        x = -14
        c = hsv(rng(), 0.7, 0.9)
      }
      foam = foam.filter(f => --f.l > 0)
      if (x > W * 0.2 && x < W * 0.55) for (let k = 0; k < 2; k++) foam.push({ x: x + rng() * 12, y: floor - 3 - rng() * 6, l: 30 })
      sparkle = sparks(sparkle, 0)
      if (x > W * 0.75 && rng() < 0.3) sparkle.push({ x: x + rng() * 12, y: floor - 2 - rng() * 6, vx: 0, vy: 0, l: 6, c: 0xffffff })
    },
    draw(px) {
      sky(px, W, H, 0x8ac8f0, 0xd8f0ff, floor)
      rect(px, W, H, 0, floor, W, H - floor, 0x6a6a72)
      rect(px, W, H, W * 0.18, floor - 22, W * 0.62, 22, 0x2a5a8a)
      rect(px, W, H, W * 0.18, floor - 23, W * 0.62, 2, 0xffd040)
      rect(px, W, H, W * 0.2, floor - 20, W * 0.58, 20, 0x3a6a9a)
      for (const bxr of [0.32, 0.45]) {
        const bx = W * bxr
        for (let y = floor - 18; y < floor; y++) dot(px, W, H, bx + Math.sin(y + t * 0.6) * 1.5, y, hsv(0.55 + bxr, 0.6, 1))
        rect(px, W, H, bx - 0.5, floor - 19, 1, 19, 0x9a9aa0)
      }
      if (x > W * 0.5) for (let k = 0; k < 6; k++) dot(px, W, H, W * 0.58 + (k % 3), floor - 18 + ((t * 2 + k * 3) % 16), 0x8ad0ff)
      const clean = span(x, W * 0.45, W * 0.6)
      const body = mix(mix(c, 0x6a5a3a, 0.6), c, clean)
      rect(px, W, H, x, floor - 5, 12, 3, body)
      rect(px, W, H, x + 2, floor - 8, 7, 3, body)
      rect(px, W, H, x + 3, floor - 7, 5, 1, 0xa8d8ff)
      disc(px, W, H, x + 2.5, floor - 1.5, 1.4, 0x1a1a1a)
      disc(px, W, H, x + 9.5, floor - 1.5, 1.4, 0x1a1a1a)
      if (clean < 1) for (let k = 0; k < 6; k++) dot(px, W, H, x + 1 + ((k * 5) % 11), floor - 4 - (k % 3), 0x5a4a2a)
      for (const f of foam) disc(px, W, H, f.x, f.y, 1, 0xf8fcff)
      for (const s of sparkle) dot(px, W, H, s.x, s.y, 0xffffff)
    },
  }
}

// --- tower crane ------------------------------------------------------------------

const crane: Maker = (W, H, rng) => {
  const ground = H - 4
  const mast = Math.round(W * 0.2)
  const jibY = 6
  const bx = Math.round(W * 0.48)
  const bw = Math.round(W * 0.4)
  let floors = 0
  let t = 0
  let trolley = mast + 3
  let hook = jibY + 3
  let phase = 0
  let colour = 0xc8b8a0

  return {
    step() {
      t++
      const top = ground - floors * 3
      if (phase === 0) {
        trolley += (mast + 4 - trolley) * 0.1
        hook += (ground - 2 - hook) * 0.08
        if (hook > ground - 3) phase = 1
      } else if (phase === 1) {
        hook += (jibY + 4 - hook) * 0.06
        if (hook < jibY + 6) phase = 2
      } else if (phase === 2) {
        trolley += (bx + bw / 2 - trolley) * 0.06
        if (Math.abs(trolley - bx - bw / 2) < 0.5) phase = 3
      } else if (phase === 3) {
        hook += (top - 3 - hook) * 0.08
        if (hook > top - 4) {
          floors++
          phase = 0
          if (ground - floors * 3 < jibY + 12) {
            floors = 0
            colour = hsv(rng(), 0.2, 0.8)
          }
        }
      }
    },
    draw(px) {
      sky(px, W, H, 0x6ab0f0, 0xd8eef8, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x8a7a5a)
      for (let y = jibY; y < ground; y++) {
        dot(px, W, H, mast - 1, y, 0xffc020)
        dot(px, W, H, mast + 1, y, 0xffc020)
        if (y % 3 === 0) dot(px, W, H, mast, y, 0xd8a010)
      }
      rect(px, W, H, mast - 6, jibY, W - mast + 4, 1, 0xffc020)
      for (let x = mast - 6; x < W - 2; x += 3) dot(px, W, H, x, jibY + 1, 0xd8a010)
      rect(px, W, H, mast - 7, jibY + 1, 4, 3, 0x7a7a82)
      rect(px, W, H, mast - 1, jibY - 3, 3, 3, 0x3a6aaa)
      for (let f = 0; f < floors; f++) {
        const y = ground - (f + 1) * 3
        rect(px, W, H, bx, y, bw, 3, colour)
        rect(px, W, H, bx, y, bw, 1, scale(colour, 0.8))
        for (let wx = bx + 1; wx < bx + bw - 1; wx += 3) dot(px, W, H, wx, y + 1, f % 2 ? 0x3a5a8a : 0x5a8aba)
      }
      line(px, W, H, trolley, jibY + 1, trolley, hook, 0x3a3a3a)
      if (phase >= 1 && phase <= 3) {
        rect(px, W, H, trolley - bw / 2, hook + 1, bw, 2, colour)
        rect(px, W, H, trolley - bw / 2, hook + 1, bw, 1, scale(colour, 0.8))
      } else dot(px, W, H, trolley, hook + 1, 0x3a3a3a)
      rect(px, W, H, trolley - 1, jibY + 1, 3, 1, 0x3a3a3a)
      text(px, W, H, W - 1 - 3 * String(floors).length - (String(floors).length - 1), ground - 7 > jibY + 4 ? 9 : 9, String(floors), 0x2a3a6a)
    },
  }
}

// --- city builder -----------------------------------------------------------------

const citybuilder: Maker = (W, H, rng) => {
  const cs = 3
  const GW = Math.max(4, Math.floor(W / cs))
  const GH = Math.max(4, Math.floor(H / cs))
  let grid = new Uint8Array(GW * GH)
  let col = new Uint32Array(GW * GH)
  let t = 0
  // 0 grass, 1 road, 2 house, 3 shop, 4 tower, 5 park

  function reset() {
    grid = new Uint8Array(GW * GH)
    const cx = Math.floor(GW / 2)
    const cy = Math.floor(GH / 2)
    grid[cy * GW + cx] = 1
    t = 0
  }
  reset()

  return {
    step() {
      t++
      const roads: number[] = []
      for (let k = 0; k < grid.length; k++) if (grid[k] === 1) roads.push(k)
      const r = pick(rng, roads)
      const x = r % GW
      const y = Math.floor(r / GW)
      const d = irand(rng, 4)
      const [dx, dy] = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ][d] as [number, number]
      const nx = x + dx
      const ny = y + dy
      if (nx < 0 || ny < 0 || nx >= GW || ny >= GH) return
      const nk = ny * GW + nx
      if (grid[nk] === 0) {
        const ox = Math.floor(GW / 2)
        const oy = Math.floor(GH / 2)
        const straight = ((nx - ox) % 4 === 0 && dx === 0) || ((ny - oy) % 4 === 0 && dy === 0)
        if (straight) grid[nk] = 1
        else {
          const dist = Math.hypot(nx - GW / 2, ny - GH / 2)
          grid[nk] = rng() < 0.08 ? 5 : dist < 4 ? 4 : dist < 7 ? 3 : 2
          col[nk] = grid[nk] === 4 ? hsv(0.6, 0.15, 0.6 + rng() * 0.3) : grid[nk] === 3 ? hsv(rng(), 0.4, 0.9) : hsv(rng() * 0.1, 0.5, 0.8)
        }
      } else if (grid[nk]! >= 2 && grid[nk]! < 4 && rng() < 0.05) {
        grid[nk]!++
        col[nk] = grid[nk] === 4 ? hsv(0.6, 0.15, 0.7) : hsv(rng(), 0.4, 0.9)
      }
      if (t > 1600 || !grid.includes(0)) reset()
    },
    draw(px) {
      px.fill(0x6ab04a)
      for (let k = 0; k < GW * GH; k++) {
        const x = (k % GW) * cs
        const y = Math.floor(k / GW) * cs
        const g = grid[k]!
        if (g === 1) rect(px, W, H, x, y, cs, cs, 0x5a5a62)
        else if (g === 2) {
          rect(px, W, H, x, y + 1, cs - 1, cs - 1, col[k]!)
          rect(px, W, H, x, y, cs - 1, 1, 0xc84a3a)
        } else if (g === 3) {
          rect(px, W, H, x, y, cs, cs, col[k]!)
          dot(px, W, H, x + 1, y + 1, 0xffffff)
        } else if (g === 4) {
          rect(px, W, H, x, y, cs, cs, col[k]!)
          dot(px, W, H, x, y, 0xa8d8ff)
          dot(px, W, H, x + 2, y + 2, 0x3a3a4a)
        } else if (g === 5) {
          rect(px, W, H, x, y, cs, cs, 0x4ac04a)
          dot(px, W, H, x + 1, y + 1, 0x2a8a2a)
        }
      }
      const pop = grid.filter(g => g >= 2).length * 37
      text(px, W, H, 1, 1, String(pop), 0xffffff)
    },
  }
}

// --- metro map --------------------------------------------------------------------

const metro: Maker = (W, H, rng) => {
  type St = { x: number; y: number; shape: number; wait: number[] }
  type Ln = { stops: number[]; c: number; trains: { u: number; dir: number; load: number[] }[] }
  let stations: St[] = []
  let lines: Ln[] = []
  let t = 0
  let delivered = 0
  const COLS = [0xe03a3a, 0x3a8ae0, 0xf0c020, 0x3ac06a]

  function reset() {
    stations = []
    lines = []
    for (let k = 0; k < 3; k++) addStation()
    lines.push({ stops: [0, 1, 2], c: COLS[0] as number, trains: [{ u: 0, dir: 1, load: [] }] })
    t = 0
    delivered = 0
  }
  function addStation() {
    for (let tries = 0; tries < 50; tries++) {
      const x = 4 + rng() * (W - 8)
      const y = 8 + rng() * (H - 14)
      if (stations.every(s => Math.hypot(s.x - x, s.y - y) > 8)) {
        stations.push({ x, y, shape: irand(rng, 3), wait: [] })
        return stations.length - 1
      }
    }
    // no room left far from the others: place it anyway
    stations.push({ x: 4 + rng() * (W - 8), y: 8 + rng() * (H - 14), shape: irand(rng, 3), wait: [] })
    return stations.length - 1
  }
  reset()
  const pointOn = (l: Ln, u: number): [number, number] => {
    const n = l.stops.length - 1
    const i = clamp(Math.floor(u), 0, n - 1)
    const f = u - i
    const a = stations[l.stops[i] as number] as St
    const b = stations[l.stops[i + 1] as number] as St
    return [a.x + (b.x - a.x) * f, a.y + (b.y - a.y) * f]
  }

  return {
    step() {
      t++
      if (t % 200 === 0 && stations.length < 12) {
        const s = addStation()
        if (s >= 0) {
          const l = lines.length < 4 && rng() < 0.4 ? undefined : pick(rng, lines)
          if (l) l.stops.push(s)
          else {
            const near = stations.map((q, i) => [i, Math.hypot(q.x - stations[s]!.x, q.y - stations[s]!.y)] as [number, number]).filter(([i]) => i !== s).sort((a, b) => a[1] - b[1])[0]
            lines.push({ stops: [near ? near[0] : 0, s], c: COLS[lines.length] as number, trains: [{ u: 0, dir: 1, load: [] }] })
          }
        }
      }
      if (rng() < 0.06) {
        const s = pick(rng, stations)
        if (s.wait.length < 6) s.wait.push(irand(rng, 3))
      }
      for (const l of lines)
        for (const tr of l.trains) {
          tr.u += tr.dir * 0.02
          const n = l.stops.length - 1
          if (tr.u >= n) {
            tr.u = n
            tr.dir = -1
          }
          if (tr.u <= 0) {
            tr.u = 0
            tr.dir = 1
          }
          const near = Math.abs(tr.u - Math.round(tr.u)) < 0.02
          if (near) {
            const st = stations[l.stops[Math.round(tr.u)] as number] as St
            const before = tr.load.length
            tr.load = tr.load.filter(p => p !== st.shape)
            delivered += before - tr.load.length
            while (st.wait.length && tr.load.length < 6) tr.load.push(st.wait.shift() as number)
          }
        }
      if (t > 2400) reset()
    },
    draw(px) {
      px.fill(0xf4f0e8)
      for (const l of lines)
        for (let i = 0; i + 1 < l.stops.length; i++) {
          const a = stations[l.stops[i] as number] as St
          const b = stations[l.stops[i + 1] as number] as St
          line(px, W, H, a.x, a.y, b.x, b.y, l.c)
          line(px, W, H, a.x + 0.5, a.y + 0.5, b.x + 0.5, b.y + 0.5, l.c)
        }
      const shape = (x: number, y: number, s: number, c: number, big: boolean) => {
        const r = big ? 2 : 1
        if (s === 0) disc(px, W, H, x, y, r, c)
        else if (s === 1) rect(px, W, H, x - r, y - r, r * 2 + 1, r * 2 + 1, c)
        else poly(px, W, H, [[x, y - r - 0.5], [x + r + 0.5, y + r], [x - r - 0.5, y + r]], c)
      }
      for (const s of stations) {
        shape(s.x, s.y, s.shape, 0x2a2a2a, true)
        shape(s.x, s.y, s.shape, 0xffffff, false)
        s.wait.forEach((w, i) => dot(px, W, H, s.x + 3 + i, s.y - 2, [0x2a2a2a, 0x5a5a5a, 0x8a8a8a][w] as number))
      }
      for (const l of lines)
        for (const tr of l.trains) {
          const [x, y] = pointOn(l, tr.u)
          rect(px, W, H, x - 1.5, y - 1, 4, 3, l.c)
          tr.load.forEach((_, i) => dot(px, W, H, x - 1 + (i % 3), y + (i < 3 ? 0 : 1) - 0.5, 0xffffff))
        }
      text(px, W, H, 1, 1, String(delivered), 0x2a2a2a)
    },
  }
}

// --- drag race --------------------------------------------------------------------

const dragrace: Maker = (W, H, rng) => {
  let t = 0
  let cars = [0, 0]
  let v = [0, 0]
  let react = [0, 0]
  let wins = [0, 0]
  let winner = -1
  const finish = H * 0.08
  const start = H - 8

  function reset() {
    t = 0
    cars = [start, start]
    v = [0, 0]
    react = [irand(rng, 10), irand(rng, 10)]
    winner = -1
  }
  reset()

  return {
    step() {
      t++
      if (t > 260) reset()
      if (t < 60) return
      for (let i = 0; i < 2; i++) {
        if (t - 60 < (react[i] as number)) continue
        v[i] = Math.min(2.2, (v[i] as number) + 0.03 + (i ? 0.002 : 0) * (react[1]! > react[0]! ? 1 : 0))
        cars[i] = (cars[i] as number) - (v[i] as number)
      }
      if (winner < 0 && (cars[0]! <= finish || cars[1]! <= finish)) {
        winner = cars[0]! <= cars[1]! ? 0 : 1
        wins[winner]!++
      }
    },
    draw(px) {
      px.fill(0x3a3a42)
      rect(px, W, H, 0, 0, 3, H, 0x8a8a92)
      rect(px, W, H, W - 3, 0, 3, H, 0x8a8a92)
      rect(px, W, H, W / 2, 0, 1, H, 0xe0e0e0)
      for (let x = 3; x < W - 3; x++) dot(px, W, H, x, finish, (x + Math.floor(finish)) % 2 ? 0xffffff : 0x000000)
      for (let x = 3; x < W - 3; x++) dot(px, W, H, x, start + 4, 0xffffff)
      for (let y = 0; y < H; y++) if ((y * 7) % 13 === 0) dot(px, W, H, W * 0.25 + (y % 3), y, 0x2a2a2e)
      const lights = Math.floor(t / 15)
      for (let k = 0; k < 3; k++) dot(px, W, H, W / 2, start - 14 + k * 2, lights > k && t < 60 ? 0xffb020 : 0x2a2a2a)
      dot(px, W, H, W / 2, start - 8, t >= 60 ? 0x3aff6a : 0x2a2a2a)
      const cols = [0xe03a3a, 0x3a8ae0]
      for (let i = 0; i < 2; i++) {
        const x = i ? W * 0.75 : W * 0.25
        const y = cars[i] as number
        const wheelie = v[i]! > 0 && v[i]! < 0.6 ? 1 : 0
        rect(px, W, H, x - 1.5, y - 4 - wheelie, 3, 8, cols[i] as number)
        rect(px, W, H, x - 2.5, y + 2, 5, 2, 0x1a1a1a)
        rect(px, W, H, x - 1.5, y - 5 - wheelie, 3, 1, 0x1a1a1a)
        dot(px, W, H, x, y - 1, 0xa8d8ff)
        if (v[i]! > 0.3) for (let k = 0; k < 3; k++) dot(px, W, H, x - 1 + k, y + 5 + ((t + k) % 3), 0xd8d8d8)
        if (winner === i && t % 10 < 6) rect(px, W, H, x - 3, finish - 3, 7, 1, 0xffe040)
      }
      text(px, W, H, 4, H - 6, String(wins[0] % 10), cols[0] as number)
      text(px, W, H, W - 7, H - 6, String(wins[1] % 10), cols[1] as number)
    },
  }
}

// --- monster truck ----------------------------------------------------------------

const monstertruck: Maker = (W, H, rng) => {
  const ground = H - 8
  const rampX = W * 0.25
  let x = -12
  let y = ground
  let vy = 0
  let air = false
  let crushed = new Set<number>()
  let dust: Spark[] = []
  let t = 0
  const cars = [0, 1, 2, 3].map(k => W * 0.48 + k * 5)
  const carC = cars.map(() => hsv(rng(), 0.6, 0.9))

  return {
    step() {
      t++
      dust = sparks(dust, 0.05)
      x += 0.55
      const onRamp = x > rampX - 8 && x < rampX
      if (!air && onRamp) y = ground - (x - rampX + 8) * 0.6
      if (!air && x >= rampX && x < rampX + 1) {
        air = true
        vy = -1.6
      }
      if (air) {
        vy += 0.08
        y += vy
        const top = cars.some((cx, k) => !crushed.has(k) && Math.abs(cx - x - 5) < 4) ? ground - 4 : ground
        if (y >= top) {
          y = top
          vy = -Math.abs(vy) * 0.35
          if (Math.abs(vy) < 0.3) {
            air = y < ground
            vy = 0
          }
          cars.forEach((cx, k) => {
            if (Math.abs(cx - x - 5) < 5 && !crushed.has(k)) {
              crushed.add(k)
              burst(dust, rng, cx, ground - 2, 0xc8a070, 6, 0.8)
            }
          })
        }
      } else if (!onRamp) {
        const top = cars.some((cx, k) => Math.abs(cx - x - 5) < 4) ? ground - 2 : ground
        y += (top - y) * 0.3
      }
      if (x > W + 14) {
        x = -12
        y = ground
        air = false
        crushed = new Set()
      }
    },
    draw(px) {
      sky(px, W, H, 0x2a3a6a, 0x6a5a8a, ground)
      for (let k = 0; k < 6; k++) dot(px, W, H, k * 6 + 2, 3, (t >> 3) % 2 ? 0xffffa0 : 0xffffff)
      for (let yy = ground - 14; yy < ground - 8; yy++) for (let xx = 0; xx < W; xx += 2) dot(px, W, H, xx + (yy % 2), yy, hsv(((xx * 7 + yy) % 10) / 10, 0.4, 0.5))
      rect(px, W, H, 0, ground, W, H - ground, 0x8a6a4a)
      poly(px, W, H, [[rampX - 8, ground], [rampX, ground - 5], [rampX, ground]], 0x6a5a4a)
      cars.forEach((cx, k) => {
        if (crushed.has(k)) rect(px, W, H, cx - 2, ground - 1, 5, 1, carC[k] as number)
        else {
          rect(px, W, H, cx - 2, ground - 3, 5, 3, carC[k] as number)
          dot(px, W, H, cx, ground - 3, 0xa8d8ff)
        }
      })
      const ty = y
      rect(px, W, H, x, ty - 9, 10, 4, 0x3aa03a)
      rect(px, W, H, x + 5, ty - 12, 4, 3, 0x3aa03a)
      dot(px, W, H, x + 7, ty - 11, 0xa8d8ff)
      disc(px, W, H, x + 2, ty - 3, 3, 0x1a1a1a)
      disc(px, W, H, x + 8, ty - 3, 3, 0x1a1a1a)
      dot(px, W, H, x + 2, ty - 3, 0x8a8a8a)
      dot(px, W, H, x + 8, ty - 3, 0x8a8a8a)
      for (const d of dust) dot(px, W, H, d.x, d.y, d.c)
      text(px, W, H, 1, 1, String(crushed.size), 0xffe040)
    },
  }
}

// --- container port ---------------------------------------------------------------

const port: Maker = (W, H, rng) => {
  const quay = Math.round(H * 0.5)
  const sea = quay + 2
  const COLS = [0xe03a3a, 0x3a8ae0, 0xf0b020, 0x3ab06a, 0xe07a2a]
  let yard: number[] = []
  let ship: number[] = []
  let shipX = -20
  let gx = W * 0.3
  let hook = 6
  let carry = -1
  let phase = 0
  const slots = 6

  function reset() {
    yard = Array.from({ length: 10 }, () => pick(rng, COLS))
    ship = []
    shipX = -24
    phase = 0
  }
  reset()

  return {
    step() {
      if (phase === 0) {
        shipX += 0.3
        if (shipX >= 2) phase = 1
        return
      }
      if (phase === 5) {
        shipX -= 0.4
        if (shipX < -26) reset()
        return
      }
      const yardX = W * 0.75
      const shipSlot = shipX + 3 + (ship.length % slots) * 3.5
      if (phase === 1) {
        gx += clamp(yardX - gx, -0.6, 0.6)
        if (Math.abs(gx - yardX) < 0.5) {
          hook += 0.6
          if (hook > quay - 3 - Math.ceil(yard.length / 2) * 3) {
            carry = yard.pop() ?? -1
            phase = 2
          }
        }
      } else if (phase === 2) {
        hook -= 0.6
        if (hook < 8) phase = 3
      } else if (phase === 3) {
        gx += clamp(shipSlot - gx, -0.6, 0.6)
        if (Math.abs(gx - shipSlot) < 0.5) {
          hook += 0.6
          if (hook > sea - 4 - Math.floor(ship.length / slots) * 3) {
            ship.push(carry)
            carry = -1
            phase = yard.length ? 4 : 5
          }
        }
      } else if (phase === 4) {
        hook -= 0.6
        if (hook < 8) phase = 1
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ac8f0, 0xe0f0f8, sea)
      for (let y = sea; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x + y * 3) % 11 === 0 ? 0x5a9ad0 : 0x2a6aa8
      rect(px, W, H, W * 0.55, quay, W * 0.45, H - quay, 0x8a8a92)
      rect(px, W, H, W * 0.55, quay, W * 0.45, 1, 0xb0b0b8)
      yard.forEach((c, i) => rect(px, W, H, W * 0.62 + (i % 2) * 4, quay - 3 - Math.floor(i / 2) * 3, 4, 3, c))
      rect(px, W, H, shipX, sea - 3, 24, 4, 0x2a2a3a)
      rect(px, W, H, shipX, sea + 1, 24, 2, 0xc83a2a)
      rect(px, W, H, shipX + 20, sea - 8, 4, 5, 0xf0f0f0)
      ship.forEach((c, i) => rect(px, W, H, shipX + 3 + (i % slots) * 3.5 - 1.5, sea - 6 - Math.floor(i / slots) * 3, 3, 3, c))
      rect(px, W, H, W * 0.15, 4, W * 0.8, 2, 0xf0b020)
      rect(px, W, H, W * 0.9, 4, 2, quay - 4, 0xf0b020)
      rect(px, W, H, gx - 2, 5, 4, 2, 0x3a3a3a)
      line(px, W, H, gx, 7, gx, hook, 0x3a3a3a)
      if (carry >= 0) rect(px, W, H, gx - 2, hook, 4, 3, carry)
    },
  }
}

// --- drawbridge -------------------------------------------------------------------

const drawbridge: Maker = (W, H, rng) => {
  const road = Math.round(H * 0.42)
  const water = road + 3
  const pivotL = W * 0.2
  const pivotR = W * 0.8
  let t = 0
  let ship = -16
  let cars: { x: number; v: number }[] = []

  return {
    step() {
      t++
      const cycle = t % 500
      if (cycle > 100 && cycle < 350) ship += 0.25
      else if (cycle === 0) ship = -16
      const open = cycle > 60 && cycle < 380
      if (!open && rng() < 0.04) cars.push({ x: rng() < 0.5 ? -3 : W + 3, v: 0 })
      for (const c of cars) {
        if (c.v === 0) c.v = c.x < 0 ? 0.5 : -0.5
        const before = c.v > 0 ? c.x < pivotL - 2 : c.x > pivotR + 2
        if (open && before && Math.abs(c.x - (c.v > 0 ? pivotL - 3 : pivotR + 3)) < 1) continue
        c.x += c.v
      }
      cars = cars.filter(c => c.x > -5 && c.x < W + 5)
    },
    draw(px) {
      sky(px, W, H, 0xffb07a, 0xffe0c0, water)
      for (let y = water; y < H; y++) for (let x = 0; x < W; x++) px[y * W + x] = (x * 2 + y + (t >> 2)) % 9 === 0 ? 0x8ac0e0 : 0x3a7ab0
      rect(px, W, H, 0, road, pivotL, 2, 0x5a5a62)
      rect(px, W, H, pivotR, road, W - pivotR, 2, 0x5a5a62)
      rect(px, W, H, pivotL - 3, road + 2, 3, H, 0x8a7a6a)
      rect(px, W, H, pivotR, road + 2, 3, H, 0x8a7a6a)
      const cycle = t % 500
      const lift = cycle < 60 ? 0 : cycle < 100 ? (cycle - 60) / 40 : cycle < 340 ? 1 : cycle < 380 ? 1 - (cycle - 340) / 40 : 0
      const a = lift * 1.2
      const half = (pivotR - pivotL) / 2
      line(px, W, H, pivotL, road, pivotL + Math.cos(a) * half, road - Math.sin(a) * half, 0x5a5a62)
      line(px, W, H, pivotL, road + 1, pivotL + Math.cos(a) * half, road + 1 - Math.sin(a) * half, 0x3a3a42)
      line(px, W, H, pivotR, road, pivotR - Math.cos(a) * half, road - Math.sin(a) * half, 0x5a5a62)
      line(px, W, H, pivotR, road + 1, pivotR - Math.cos(a) * half, road + 1 - Math.sin(a) * half, 0x3a3a42)
      rect(px, W, H, pivotL - 4, road - 12, 3, 12, 0x9a8a7a)
      rect(px, W, H, pivotR + 1, road - 12, 3, 12, 0x9a8a7a)
      if (ship > -16) {
        rect(px, W, H, ship, water - 2, 14, 3, 0xf0f0f0)
        rect(px, W, H, ship + 2, water - 6, 6, 4, 0xe0e0e0)
        rect(px, W, H, ship + 4, water - 12, 1, 6, 0x5a5a5a)
        rect(px, W, H, ship, water + 1, 14, 1, 0x2a5a8a)
      }
      for (const c of cars) car(px, W, H, c.x, road - 2, true, c.v > 0 ? 0xe03a3a : 0x3a8ae0)
    },
  }
}

// --- night highway ----------------------------------------------------------------

const nighthighway: Maker = (W, H, rng) => {
  const trails = new Float32Array(W * H * 2)
  const horizon = Math.round(H * 0.3)
  type V = { z: number; lane: number; dir: number }
  let vs: V[] = []
  let t = 0

  return {
    step() {
      t++
      for (let i = 0; i < trails.length; i++) trails[i]! *= 0.9
      if (rng() < 0.25) {
        const dir = rng() < 0.5 ? 1 : -1
        vs.push({ z: dir > 0 ? 1 : 0.05, lane: irand(rng, 2), dir })
      }
      for (const v of vs) v.z *= v.dir > 0 ? 0.985 : 1.012
      vs = vs.filter(v => v.z > 0.04 && v.z < 1.05)
      for (const v of vs) {
        const s = 1 - v.z
        const y = horizon + s * (H - horizon)
        const side = v.dir > 0 ? 1 : -1
        const x = W / 2 + side * (1 + s * W * (0.12 + v.lane * 0.12))
        const k = (Math.round(y) * W + Math.round(x)) * 2 + (v.dir > 0 ? 0 : 1)
        if (y >= 0 && y < H && x >= 0 && x < W) trails[k] = 1
        const k2 = (Math.round(y) * W + Math.round(x + side)) * 2 + (v.dir > 0 ? 0 : 1)
        if (x + side >= 0 && x + side < W) trails[k2] = 1
      }
    },
    draw(px) {
      sky(px, W, H, 0x05051a, 0x1a1030, horizon)
      for (let x = 0; x < W; x++) rect(px, W, H, x, horizon - 4 - ((x * 7) % 5), 1, 6, 0x0a0a18)
      for (let y = horizon; y < H; y++) {
        const s = (y - horizon) / (H - horizon)
        for (let x = 0; x < W; x++) {
          const on = Math.abs(x - W / 2) < 1 + s * W * 0.4
          px[y * W + x] = on ? 0x16161e : 0x0a0a10
        }
        if (Math.floor(y * 0.5 + t * 0.5) % 4 < 2) dot(px, W, H, W / 2, y, 0x4a4a3a)
      }
      for (let k = 0; k < W * H; k++) {
        const w = trails[k * 2]!
        const r = trails[k * 2 + 1]!
        if (w > 0.05) px[k] = mix(px[k] as number, 0xfff4d0, Math.min(1, w))
        if (r > 0.05) px[k] = mix(px[k] as number, 0xff3a2a, Math.min(1, r))
      }
    },
  }
}

// --- rollercoaster ----------------------------------------------------------------

const coaster: Maker = (W, H, rng) => {
  // a closed track: lift hill, drop, loop, hills, back to the station
  const pts: [number, number][] = []
  const base = H * 0.82
  const N = 400
  for (let i = 0; i < N; i++) {
    const u = i / N
    let x: number
    let y: number
    if (u < 0.2) {
      x = W * 0.08 + u * 5 * W * 0.25
      y = base - u * 5 * H * 0.55
    } else if (u < 0.35) {
      const v = (u - 0.2) / 0.15
      x = W * 0.33 + v * W * 0.15
      y = base - H * 0.55 + Math.sin(v * Math.PI / 2) * H * 0.55
    } else if (u < 0.6) {
      const v = (u - 0.35) / 0.25
      const r = H * 0.14
      x = W * 0.62 + Math.sin(v * Math.PI * 2) * r * 0.9 + v * 2
      y = base - r + Math.cos(v * Math.PI * 2) * r
    } else if (u < 0.8) {
      const v = (u - 0.6) / 0.2
      x = W * 0.64 + v * W * 0.28
      y = base - Math.sin(v * Math.PI * 2) * H * 0.12 - Math.abs(Math.sin(v * Math.PI)) * H * 0.08
    } else {
      const v = (u - 0.8) / 0.2
      x = W * 0.92 - v * W * 0.84
      y = base + 3
    }
    pts.push([x, y])
  }
  let s = 0
  let v = 0.5
  let t = 0
  void rng

  return {
    step() {
      t++
      const u = (s % N) / N
      const i = Math.floor(s) % N
      const a = pts[i] as [number, number]
      const b = pts[(i + 1) % N] as [number, number]
      const dy = b[1] - a[1]
      const seg = Math.hypot(b[0] - a[0], dy) || 1
      if (u < 0.2 || u > 0.85) v = 0.6
      else v = Math.max(0.6, v + (dy / seg) * 0.04)
      v *= 0.998
      s += v / seg
    },
    draw(px) {
      sky(px, W, H, 0x6ab8f0, 0xffe0b0)
      rect(px, W, H, 0, base + 4, W, H - base - 4, 0x5aa04a)
      for (let i = 0; i < N; i += 8) {
        const [x, y] = pts[i] as [number, number]
        if (y < base) line(px, W, H, x, y + 1, x, base + 4, 0xb0b0b8)
      }
      for (let i = 0; i < N; i++) {
        const [x, y] = pts[i] as [number, number]
        dot(px, W, H, x, y, 0xe03a3a)
        if (i % 2) dot(px, W, H, x, y + 1, 0x8a2a2a)
      }
      rect(px, W, H, W * 0.06, base, 8, 4, 0x8a5a3a)
      for (let k = 0; k < 3; k++) {
        const i = Math.floor(s - k * 7 + N * 10) % N
        const [x, y] = pts[i] as [number, number]
        rect(px, W, H, x - 1, y - 2, 3, 2, hsv(k * 0.3, 0.7, 1))
        const hands = (s % N) / N > 0.25 && (s % N) / N < 0.8
        dot(px, W, H, x, y - 3 - (hands ? 1 : 0), 0xffd0a0)
      }
    },
  }
}

// --- building demolition ----------------------------------------------------------

const demolition: Maker = (W, H, rng) => {
  const ground = H - 5
  const floors = Math.max(6, Math.floor((H * 0.65) / 3))
  const bx = Math.round(W * 0.25)
  const bw = Math.round(W * 0.5)
  let t = 0
  let dust: { x: number; y: number; r: number; vx: number }[] = []
  let flashes: [number, number][] = []

  return {
    step() {
      t++
      const fall = t - 90
      if (t > 50 && t < 90 && t % 4 === 0) flashes.push([bx + rng() * bw, ground - rng() * floors * 3])
      if (t >= 90) flashes = []
      if (fall > 0 && fall < 80) for (let k = 0; k < 3; k++) dust.push({ x: bx + rng() * bw, y: ground - 2, r: 1, vx: (rng() - 0.5) * 1.2 })
      for (const d of dust) {
        d.r += 0.08
        d.x += d.vx
        d.y -= 0.12
        d.vx *= 0.97
      }
      dust = dust.filter(d => d.r < 9)
      if (t > 300) {
        t = 0
        dust = []
      }
    },
    draw(px) {
      sky(px, W, H, 0x8ab8e0, 0xe0ecf4, ground)
      rect(px, W, H, 0, ground, W, H - ground, 0x7a6a5a)
      for (let k = 0; k < 4; k++) rect(px, W, H, k * 9 - 2, ground - 8 - (k % 2) * 4, 6, 8 + (k % 2) * 4, 0x9aa0b0)
      const fall = Math.max(0, t - 90)
      const gone = Math.min(floors, fall * fall * 0.004)
      const standing = t > 260 ? Math.min(floors, (t - 260) * 0.4) : floors - gone
      for (let f = 0; f < Math.floor(standing); f++) {
        const y = ground - (f + 1) * 3 + (t > 90 && t < 260 ? gone * 0 : 0)
        const tilt = t > 90 && t < 260 ? (f / floors) * Math.sin(fall * 0.05) * 1.5 : 0
        rect(px, W, H, bx + tilt, y, bw, 3, 0xc8b8a0)
        for (let wx = bx + 2; wx < bx + bw - 1; wx += 3) dot(px, W, H, wx + tilt, y + 1, 0x4a5a7a)
      }
      if (t > 90 && t < 260) rect(px, W, H, bx - 2, ground - 3, bw + 4, 3, 0x9a8a78)
      for (const [x, y] of flashes) disc(px, W, H, x, y, 1.5, 0xffe080)
      for (const d of dust) disc(px, W, H, d.x, d.y, d.r, 0xd8ccb8)
      if (t < 90) text(px, W, H, 1, 1, String(Math.max(0, 3 - Math.floor(t / 30))), 0xe03a3a)
    },
  }
}

// --- a cyberpunk city in the rain -------------------------------------------------

const cyber: Maker = (W, H, rng) => {
  const street = Math.round(H * 0.78)
  const NEON = [0xff2a8a, 0x2ae8ff, 0xb44aff, 0xffd23a]
  type B = { x: number; w: number; h: number; c: number; sign?: { y: number; c: number; ph: number } }
  const far: B[] = []
  const near: B[] = []
  for (let x = -2; x < W; ) {
    const w = 3 + Math.floor(rng() * 4)
    far.push({ x, w, h: H * (0.25 + rng() * 0.3), c: 0x1a1030 })
    x += w
  }
  for (let x = -2; x < W; ) {
    const w = 5 + Math.floor(rng() * 6)
    const h = H * (0.3 + rng() * 0.35)
    near.push({ x, w, h, c: 0x0c0818, sign: rng() < 0.7 ? { y: street - h + 3 + rng() * h * 0.5, c: NEON[Math.floor(rng() * NEON.length)] as number, ph: rng() * 6 } : undefined })
    x += w + 1
  }
  const windows = Array.from({ length: W * H }, () => rng() < 0.12)
  let rain = Array.from({ length: 45 }, () => ({ x: rng() * W, y: rng() * H, v: 1.5 + rng() }))
  let cars: { x: number; y: number; v: number; c: number }[] = []
  let t = 0

  return {
    step() {
      t++
      for (const r of rain) {
        r.y += r.v
        r.x -= r.v * 0.3
        if (r.y > H) {
          r.y = -2
          r.x = rng() * (W + 10)
        }
      }
      if (rng() < 0.03) {
        const dir = rng() < 0.5 ? 1 : -1
        cars.push({ x: dir > 0 ? -6 : W + 6, y: 6 + rng() * H * 0.4, v: dir * (0.5 + rng() * 0.7), c: NEON[Math.floor(rng() * NEON.length)] as number })
      }
      for (const c of cars) c.x += c.v
      cars = cars.filter(c => c.x > -10 && c.x < W + 10)
    },
    draw(px) {
      sky(px, W, H, 0x12061e, 0x4a1050, street)
      for (const b of far)
        for (let y = Math.round(street - b.h); y < street; y++)
          for (let x = b.x; x < b.x + b.w; x++) dot(px, W, H, x, y, windows[y * W + Math.max(0, x)] && x % 2 ? 0x6a3a8a : b.c)
      for (const c of cars) {
        rect(px, W, H, c.x, c.y, 4, 2, 0x2a2a3a)
        dot(px, W, H, c.v > 0 ? c.x + 3 : c.x, c.y + 1, 0xfff4c0)
        line(px, W, H, c.v > 0 ? c.x - 1 : c.x + 4, c.y + 1, c.v > 0 ? c.x - 6 : c.x + 9, c.y + 1, scale(c.c, 0.6))
      }
      for (const b of near) {
        for (let y = Math.round(street - b.h); y < street; y++)
          for (let x = b.x; x < b.x + b.w; x++) dot(px, W, H, x, y, windows[(y * 3 + x * 7) % (W * H)] && y % 3 === 0 ? 0x2ae8ff : b.c)
        if (b.sign) {
          const on = Math.sin(t * 0.2 + b.sign.ph) > -0.7
          rect(px, W, H, b.x + 1, b.sign.y, Math.max(2, b.w - 2), 2, on ? b.sign.c : scale(b.sign.c, 0.25))
        }
      }
      for (let y = street; y < H; y++) {
        const sy = 2 * street - y - 1
        const off = Math.round(Math.sin(y * 1.3 + t * 0.15) * 1.2)
        for (let x = 0; x < W; x++) {
          const sx = Math.max(0, Math.min(W - 1, x + off))
          px[y * W + x] = mix(0x08040e, sy >= 0 ? (px[sy * W + sx] as number) : 0, 0.45)
        }
      }
      for (const r of rain) {
        dot(px, W, H, r.x, r.y, 0x8a9ac0)
        dot(px, W, H, r.x + 0.3, r.y - 1, 0x4a5a80)
      }
    },
  }
}

export const CITY = {
  cyber,
  traffic,
  roundabout,
  parallel,
  levelcross,
  runway,
  carwash,
  crane,
  citybuilder,
  metro,
  dragrace,
  monstertruck,
  port,
  drawbridge,
  nighthighway,
  coaster,
  demolition,
}
