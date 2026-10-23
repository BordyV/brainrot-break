import { disc, dot, mix, scale } from './draw'
import type { Rng } from './draw'

// Drawing and maths helpers shared by the videos in hooks/themes/.

export const DIRS: [number, number][] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
]

export const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const irand = (rng: Rng, n: number) => Math.floor(rng() * n)
export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)] as T

export function shuffle<T>(rng: Rng, list: T[]): T[] {
  for (let i = list.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    const t = list[i] as T
    list[i] = list[j] as T
    list[j] = t
  }
  return list
}

/** A stable value in [0, 1) for a grid cell: textures that do not flicker. */
export function hash(x: number, y: number, seed = 0): number {
  let h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(seed | 0, 2147483647)
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export function line(px: Uint32Array, W: number, H: number, x0: number, y0: number, x1: number, y1: number, c: number) {
  const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))))
  for (let i = 0; i <= n; i++) dot(px, W, H, x0 + ((x1 - x0) * i) / n, y0 + ((y1 - y0) * i) / n, c)
}

/** The outline of a circle. */
export function ring(px: Uint32Array, W: number, H: number, cx: number, cy: number, r: number, c: number) {
  const n = Math.max(8, Math.ceil(r * 7))
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    dot(px, W, H, cx + Math.cos(a) * r, cy + Math.sin(a) * r, c)
  }
}

export function ellipse(px: Uint32Array, W: number, H: number, cx: number, cy: number, rx: number, ry: number, c: number) {
  const ya = Math.max(0, Math.ceil(cy - ry))
  const yb = Math.min(H - 1, Math.floor(cy + ry))
  for (let y = ya; y <= yb; y++) {
    const k = (y - cy) / Math.max(0.5, ry)
    const half = rx * Math.sqrt(Math.max(0, 1 - k * k))
    const xa = Math.max(0, Math.round(cx - half))
    const xb = Math.min(W - 1, Math.round(cx + half))
    for (let x = xa; x <= xb; x++) px[y * W + x] = c
  }
}

/** A filled polygon, by scanline. Points are [x, y] pairs. */
export function poly(px: Uint32Array, W: number, H: number, pts: [number, number][], c: number) {
  let ya = Infinity
  let yb = -Infinity
  for (const [, y] of pts) {
    ya = Math.min(ya, y)
    yb = Math.max(yb, y)
  }
  for (let y = Math.max(0, Math.ceil(ya - 0.5)); y <= Math.min(H - 1, Math.floor(yb + 0.5)); y++) {
    const yc = y
    const xs: number[] = []
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i] as [number, number]
      const [x1, y1] = pts[(i + 1) % pts.length] as [number, number]
      if (y0 === y1) continue
      if ((yc >= Math.min(y0, y1)) && yc < Math.max(y0, y1)) xs.push(x0 + ((yc - y0) * (x1 - x0)) / (y1 - y0))
    }
    xs.sort((a, b) => a - b)
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.max(0, Math.round(xs[k] as number))
      const xb = Math.min(W - 1, Math.round(xs[k + 1] as number))
      for (let x = xa; x <= xb; x++) px[y * W + x] = c
    }
  }
}

/** Blends a colour into the pixel already there. */
export function tint(px: Uint32Array, W: number, H: number, x: number, y: number, c: number, t: number) {
  x = Math.round(x)
  y = Math.round(y)
  if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = mix(px[y * W + x] as number, c, t)
}

/** Blends a colour over a rectangle. */
export function shade(px: Uint32Array, W: number, H: number, x0: number, y0: number, w: number, h: number, c: number, t: number) {
  const xa = Math.max(0, Math.round(x0))
  const ya = Math.max(0, Math.round(y0))
  const xb = Math.min(W, Math.round(x0 + w))
  const yb = Math.min(H, Math.round(y0 + h))
  for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) px[y * W + x] = mix(px[y * W + x] as number, c, t)
}

/** A colour's four tones, lit from the upper left: highlight, base, shadow, deep shadow (shadows lean purple). */
export function tones(c: number): [number, number, number, number] {
  return [mix(c, 0xfff8ee, 0.42), c, mix(scale(c, 0.72), 0x281436, 0.15), mix(scale(c, 0.5), 0x200a28, 0.25)]
}

/** A filled ellipse lit from the upper left, in the four tones of c, with an outline if one is given. */
export function lit(px: Uint32Array, W: number, H: number, cx: number, cy: number, rx: number, ry: number, c: number, edge?: number) {
  const [hi, base, sh, deep] = tones(c)
  const inside = (x: number, y: number) => ((x - cx) / Math.max(0.5, rx)) ** 2 + ((y - cy) / Math.max(0.5, ry)) ** 2 <= 1
  const ya = Math.max(0, Math.ceil(cy - ry))
  const yb = Math.min(H - 1, Math.floor(cy + ry))
  const xa = Math.max(0, Math.ceil(cx - rx))
  const xb = Math.min(W - 1, Math.floor(cx + rx))
  for (let y = ya; y <= yb; y++)
    for (let x = xa; x <= xb; x++) {
      if (!inside(x, y)) continue
      if (edge !== undefined && (!inside(x - 1, y) || !inside(x + 1, y) || !inside(x, y - 1) || !inside(x, y + 1))) {
        px[y * W + x] = edge
        continue
      }
      const light = -(((x - cx) / Math.max(0.5, rx)) * 0.6 + ((y - cy) / Math.max(0.5, ry)) * 0.8)
      px[y * W + x] = light > 0.5 ? hi : light > -0.15 ? base : light > -0.6 ? sh : deep
    }
}

/** A box lit from the upper left: highlight on top and left, shadow on the right and the bottom, an outline if one is given. */
export function slab(px: Uint32Array, W: number, H: number, x: number, y: number, w: number, h: number, c: number, edge?: number) {
  x = Math.round(x)
  y = Math.round(y)
  w = Math.round(w)
  h = Math.round(h)
  if (w <= 0 || h <= 0) return
  const fill = (x0: number, y0: number, ww: number, hh: number, cc: number) => {
    for (let yy = Math.max(0, y0); yy < Math.min(H, y0 + hh); yy++) for (let xx = Math.max(0, x0); xx < Math.min(W, x0 + ww); xx++) px[yy * W + xx] = cc
  }
  if (edge !== undefined) {
    fill(x, y, w, h, edge)
    if (w > 2 && h > 2) slab(px, W, H, x + 1, y + 1, w - 2, h - 2, c)
    return
  }
  const [hi, base, sh, deep] = tones(c)
  fill(x, y, w, h, base)
  if (w > 1 && h > 1) {
    fill(x, y + h - 1, w, 1, sh)
    fill(x + w - 1, y, 1, h, sh)
    fill(x, y, w, 1, hi)
    fill(x, y, 1, h - 1, mix(base, hi, 0.5))
    if (w > 2 && h > 2) fill(x + w - 1, y + h - 1, 1, 1, deep)
  }
}

/** A bar three pixels thick from (x0, y0) to (x1, y1): its upper-left side lit, the other side in shadow. */
export function beam(px: Uint32Array, W: number, H: number, x0: number, y0: number, x1: number, y1: number, c: number) {
  const [hi, base, sh] = tones(c)
  const len = Math.max(0.001, Math.hypot(x1 - x0, y1 - y0))
  let nx = -(y1 - y0) / len
  let ny = (x1 - x0) / len
  if (nx + ny > 0) {
    nx = -nx
    ny = -ny
  }
  line(px, W, H, x0 - nx, y0 - ny, x1 - nx, y1 - ny, sh)
  line(px, W, H, x0 + nx, y0 + ny, x1 + nx, y1 + ny, hi)
  line(px, W, H, x0, y0, x1, y1, base)
}

/** sprite() lit from the upper left: a pixel with nothing above or to its left is lighter, one with nothing below or to its right darker. */
export function litSprite(px: Uint32Array, W: number, H: number, x: number, y: number, rows: string[], colors: Record<string, number>) {
  const at = (i: number, j: number) => colors[(rows[j] ?? '')[i] as string] !== undefined
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = colors[row[i] as string]
      if (c === undefined) continue
      const open = !at(i, j - 1) || !at(i - 1, j)
      const shut = !at(i, j + 1) || !at(i + 1, j)
      const xx = Math.round(x + i)
      const yy = Math.round(y + j)
      if (xx >= 0 && xx < W && yy >= 0 && yy < H) px[yy * W + xx] = open && !shut ? mix(c, 0xfff8ee, 0.3) : shut && !open ? mix(scale(c, 0.72), 0x281436, 0.12) : c
    }
  })
}

/** Width in pixels of a string drawn with text(). */
export const textWidth = (s: string) => Math.max(0, s.length * 4 - 1)

/** Rotates (x, y) by angle a around the origin. */
export const rot = (x: number, y: number, a: number): [number, number] => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)]

// --- balls: walls, segments, collisions -----------------------------------------

export type Ball = { x: number; y: number; vx: number; vy: number; r: number; c: number }

/** Keeps a ball inside a circle; true when it bounced. */
export function wallCircle(b: Ball, cx: number, cy: number, R: number, e = 1): boolean {
  const dx = b.x - cx
  const dy = b.y - cy
  const d = Math.hypot(dx, dy)
  if (d + b.r <= R || d === 0) return false
  const nx = dx / d
  const ny = dy / d
  const vn = b.vx * nx + b.vy * ny
  if (vn > 0) {
    b.vx -= (1 + e) * vn * nx
    b.vy -= (1 + e) * vn * ny
  }
  b.x = cx + nx * (R - b.r)
  b.y = cy + ny * (R - b.r)
  return true
}

/** Bounces a ball off a segment, which may be moving (wvx, wvy at the contact). */
export function hitSeg(b: Ball, x0: number, y0: number, x1: number, y1: number, e = 1, friction = 1, wvx = 0, wvy = 0): boolean {
  const ex = x1 - x0
  const ey = y1 - y0
  const t = clamp(((b.x - x0) * ex + (b.y - y0) * ey) / (ex * ex + ey * ey || 1), 0, 1)
  const qx = x0 + ex * t
  const qy = y0 + ey * t
  const dx = b.x - qx
  const dy = b.y - qy
  const d = Math.hypot(dx, dy)
  if (d >= b.r || d === 0) return false
  const nx = dx / d
  const ny = dy / d
  let rvx = b.vx - wvx
  let rvy = b.vy - wvy
  const vn = rvx * nx + rvy * ny
  if (vn < 0) {
    const tvx = rvx - vn * nx
    const tvy = rvy - vn * ny
    rvx = tvx * friction - e * vn * nx
    rvy = tvy * friction - e * vn * ny
    b.vx = rvx + wvx
    b.vy = rvy + wvy
  }
  b.x = qx + nx * b.r
  b.y = qy + ny * b.r
  return true
}

/** An elastic collision between two balls, heavier when bigger. */
export function collide(a: Ball, b: Ball, e = 1): boolean {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy)
  const min = a.r + b.r
  if (d >= min || d === 0) return false
  const nx = dx / d
  const ny = dy / d
  const ma = a.r * a.r
  const mb = b.r * b.r
  const push = (min - d) / (ma + mb)
  a.x -= nx * push * mb
  a.y -= ny * push * mb
  b.x += nx * push * ma
  b.y += ny * push * ma
  const vn = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
  if (vn < 0) {
    const j = ((1 + e) * vn) / (ma + mb)
    a.vx += j * mb * nx
    a.vy += j * mb * ny
    b.vx -= j * ma * nx
    b.vy -= j * ma * ny
  }
  return true
}

export function keepSpeed(b: Ball, min: number, max = Infinity) {
  const s = Math.hypot(b.vx, b.vy)
  if (s === 0) {
    b.vx = min
    return
  }
  if (s < min) {
    b.vx *= min / s
    b.vy *= min / s
  } else if (s > max) {
    b.vx *= max / s
    b.vy *= max / s
  }
}

/** A ball: from 1.5 pixels of radius a sphere lit from the upper left, smaller a disc with a glint. */
export function shiny(px: Uint32Array, W: number, H: number, b: Ball) {
  if (b.r >= 1.5) lit(px, W, H, b.x, b.y, b.r, b.r, b.c)
  else disc(px, W, H, b.x, b.y, b.r, b.c)
  if (b.r >= 1.2) dot(px, W, H, b.x - b.r * 0.4, b.y - b.r * 0.4, mix(b.c, 0xffffff, 0.6))
}

export type Spark = { x: number; y: number; vx: number; vy: number; l: number; c: number }
export function burst(list: Spark[], rng: () => number, x: number, y: number, c: number, n = 10, v = 1.2) {
  for (let i = 0; i < n; i++) {
    const a = rng() * Math.PI * 2
    const s = v * (0.3 + rng())
    list.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l: 10 + irand(rng, 10), c })
  }
}
export function sparks(list: Spark[], g = 0.05): Spark[] {
  for (const s of list) {
    s.x += s.vx
    s.y += s.vy
    s.vy += g
    s.l--
  }
  return list.filter(s => s.l > 0)
}
