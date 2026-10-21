// Builds the project page into site/dist/: the feed playing in the browser,
// bundled from the mod's own simulations and texts.
//
//   npx tsx tools/site.ts          build site/dist/
//   npx tsx tools/site.ts --serve  build, then serve it on http://localhost:8080

import { execSync } from 'node:child_process'
import { copyFileSync, mkdirSync, readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join } from 'node:path'

const OUT = 'site/dist'

mkdirSync(OUT, { recursive: true })
execSync(`npx -y esbuild@0.28.2 site/app.ts --bundle --minify --format=iife --target=es2020 --outfile=${OUT}/app.js`, { stdio: 'inherit' })
for (const f of ['index.html', 'style.css', 'favicon.svg']) copyFileSync(join('site', f), join(OUT, f))
for (const f of ['preview.png', 'feed.gif']) copyFileSync(join('assets', f), join(OUT, f))
console.log(`site built in ${OUT}/`)

if (process.argv.includes('--serve')) {
  const types: Record<string, string> = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml' }
  createServer((req, res) => {
    const path = (req.url ?? '/').split(/[?#]/)[0] as string
    try {
      const file = join(OUT, path === '/' ? 'index.html' : path.replace(/\.\./g, ''))
      const body = readFileSync(file)
      res.writeHead(200, { 'content-type': types[extname(file)] ?? 'application/octet-stream' })
      res.end(body)
    } catch {
      res.writeHead(404).end()
    }
  }).listen(8080, () => console.log('http://localhost:8080'))
}
