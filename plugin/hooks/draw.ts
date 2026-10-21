// Each "video" is a little simulation drawn into a W x H pixel buffer
// (0x00RRGGBB per pixel). Two pixel rows make one terminal row (▀).

export type Rng = () => number

export interface Sim {
  step(): void
  draw(px: Uint32Array): void
}

export type Maker = (W: number, H: number, rng: Rng) => Sim

export function rngFrom(seed: number): Rng {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// --- colour and drawing helpers ---------------------------------------------

const c255 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v | 0)

export const rgb = (r: number, g: number, b: number) => (c255(r) << 16) | (c255(g) << 8) | c255(b)

export function mix(a: number, b: number, t: number): number {
  const u = 1 - t
  return rgb(
    ((a >> 16) & 255) * u + ((b >> 16) & 255) * t,
    ((a >> 8) & 255) * u + ((b >> 8) & 255) * t,
    (a & 255) * u + (b & 255) * t,
  )
}

export function add(a: number, b: number): number {
  return rgb(((a >> 16) & 255) + ((b >> 16) & 255), ((a >> 8) & 255) + ((b >> 8) & 255), (a & 255) + (b & 255))
}

export function scale(a: number, k: number): number {
  return rgb(((a >> 16) & 255) * k, ((a >> 8) & 255) * k, (a & 255) * k)
}

export function hsv(h: number, s: number, v: number): number {
  h = ((h % 1) + 1) % 1
  const i = Math.floor(h * 6)
  const f = h * 6 - i
  const p = v * (1 - s)
  const q = v * (1 - f * s)
  const t = v * (1 - (1 - f) * s)
  const [r, g, b] = [
    [v, t, p],
    [q, v, p],
    [p, v, t],
    [p, q, v],
    [t, p, v],
    [v, p, q],
  ][i % 6] as [number, number, number]
  return rgb(r * 255, g * 255, b * 255)
}

export function rect(px: Uint32Array, W: number, H: number, x0: number, y0: number, w: number, h: number, c: number) {
  const xa = Math.max(0, Math.round(x0))
  const ya = Math.max(0, Math.round(y0))
  const xb = Math.min(W, Math.round(x0 + w))
  const yb = Math.min(H, Math.round(y0 + h))
  for (let y = ya; y < yb; y++) for (let x = xa; x < xb; x++) px[y * W + x] = c
}

export function dot(px: Uint32Array, W: number, H: number, x: number, y: number, c: number) {
  x = Math.round(x)
  y = Math.round(y)
  if (x >= 0 && x < W && y >= 0 && y < H) px[y * W + x] = c
}

export function disc(px: Uint32Array, W: number, H: number, cx: number, cy: number, r: number, c: number) {
  const n = Math.ceil(r)
  for (let dy = -n; dy <= n; dy++)
    for (let dx = -n; dx <= n; dx++) if (dx * dx + dy * dy <= r * r + 0.3) dot(px, W, H, cx + dx, cy + dy, c)
}

export function sprite(px: Uint32Array, W: number, H: number, x: number, y: number, rows: string[], colors: Record<string, number>) {
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      const c = colors[row[i] as string]
      if (c !== undefined) dot(px, W, H, x + i, y + j, c)
    }
  })
}

const FONT: Record<string, string> = {
  '0': '111101101101111',
  '1': '010110010010111',
  '2': '111001111100111',
  '3': '111001111001111',
  '4': '101101111001001',
  '5': '111100111001111',
  '6': '111100111101111',
  '7': '111001001001001',
  '8': '111101111101111',
  '9': '111101111001111',
  A: '010101111101101',
  B: '110101110101110',
  C: '011100100100011',
  D: '110101101101110',
  S: '011100010001110',
  V: '101101101101010',
  Z: '111001010100111',
  '+': '000010111010000',
  '-': '000000111000000',
  x: '000101010101000',
  '%': '101001010100101',
  ':': '000010000010000',
  '!': '010010010000010',
  '?': '111001011000010',
  '.': '000000000000010',
  '/': '001001010100100',
}

export function text(px: Uint32Array, W: number, H: number, x: number, y: number, s: string, c: number) {
  for (let k = 0; k < s.length; k++) {
    const g = FONT[s[k] as string]
    if (!g) continue
    for (let j = 0; j < 15; j++) if (g[j] === '1') dot(px, W, H, x + k * 4 + (j % 3), y + Math.floor(j / 3), c)
  }
}

export function sky(px: Uint32Array, W: number, H: number, top: number, bottom: number, to = H) {
  for (let y = 0; y < to; y++) {
    const c = mix(top, bottom, y / Math.max(1, to - 1))
    for (let x = 0; x < W; x++) px[y * W + x] = c
  }
}

// --- overlays: hearts, progress bar ---------------------------------------------

const HEART = ['.x.x.', 'xxxxx', '.xxx.', '..x..']
const BIG_HEART = ['.xx.xx.', 'xxxxxxx', 'xxxxxxx', '.xxxxx.', '..xxx..', '...x...']

export function drawHeart(px: Uint32Array, W: number, H: number, x: number, y: number, k: number, big: boolean) {
  const rows = big ? BIG_HEART : HEART
  const n = big ? 2 : 1
  rows.forEach((row, j) => {
    for (let i = 0; i < row.length; i++) {
      if (row[i] !== 'x') continue
      for (let a = 0; a < n; a++)
        for (let b = 0; b < n; b++) {
          const xx = Math.round(x + i * n + a)
          const yy = Math.round(y + j * n + b)
          if (xx >= 0 && xx < W && yy >= 0 && yy < H) px[yy * W + xx] = mix(px[yy * W + xx] as number, 0xff2d55, k)
        }
    }
  })
}

export function drawProgress(px: Uint32Array, W: number, H: number, t: number) {
  const n = Math.round(W * t)
  for (let x = 0; x < W; x++) px[(H - 1) * W + x] = x < n ? 0xf2f2f2 : mix(px[(H - 1) * W + x] as number, 0x333333, 0.8)
}
