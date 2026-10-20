// Packs a W x 2R pixel buffer into Raster cells: one ▀ per cell, its
// foreground the upper pixel and its background the lower one.

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

function base64(bytes: Uint8Array): string {
  const out: string[] = []
  let i = 0
  for (; i + 2 < bytes.length; i += 3) {
    const v = (bytes[i]! << 16) | (bytes[i + 1]! << 8) | bytes[i + 2]!
    out.push(B64[(v >> 18) & 63]! + B64[(v >> 12) & 63]! + B64[(v >> 6) & 63]! + B64[v & 63]!)
  }
  const rest = bytes.length - i
  if (rest === 1) {
    const v = bytes[i]! << 16
    out.push(B64[(v >> 18) & 63]! + B64[(v >> 12) & 63]! + '==')
  } else if (rest === 2) {
    const v = (bytes[i]! << 16) | (bytes[i + 1]! << 8)
    out.push(B64[(v >> 18) & 63]! + B64[(v >> 12) & 63]! + B64[(v >> 6) & 63]! + '=')
  }
  return out.join('')
}

export function encodeCells(px: Uint32Array, columns: number, rows: number): string {
  const words = new Uint32Array(columns * rows * 3)
  const view = new DataView(words.buffer)
  for (let cy = 0; cy < rows; cy++)
    for (let x = 0; x < columns; x++) {
      const o = (cy * columns + x) * 12
      view.setUint32(o, 0x2580, true)
      view.setUint32(o + 4, px[2 * cy * columns + x]! & 0xffffff, true)
      view.setUint32(o + 8, px[(2 * cy + 1) * columns + x]! & 0xffffff, true)
    }
  return base64(new Uint8Array(words.buffer))
}

// The desktop has no Raster: a frame is an SVG instead, one path per colour,
// each horizontal run of a colour one rectangle of it.
export function svgFrame(px: Uint32Array, width: number, height: number): string {
  const paths = new Map<number, string[]>()
  for (let y = 0; y < height; y++) {
    let x = 0
    while (x < width) {
      const c = px[y * width + x]! & 0xffffff
      let end = x + 1
      while (end < width && (px[y * width + end]! & 0xffffff) === c) end++
      let runs = paths.get(c)
      if (!runs) paths.set(c, (runs = []))
      runs.push(`M${x} ${y}h${end - x}v1h-${end - x}z`)
      x = end
    }
  }
  let out = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">`
  for (const [c, runs] of paths) out += `<path fill="#${c.toString(16).padStart(6, '0')}" d="${runs.join('')}"/>`
  return out + '</svg>'
}
