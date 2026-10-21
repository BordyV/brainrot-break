// The project page: the feed playing in the browser, from the same
// simulations and texts as the mod. Built by tools/site.ts.

import type { Kind } from '../types'
import { drawHeart, drawProgress, rngFrom } from '../hooks/draw'
import type { Sim } from '../hooks/draw'
import { LABELS, LANGS, META, THEME_NAMES } from '../hooks/i18n'
import type { Lang } from '../hooks/i18n'
import { MAKERS, THEMES, themesOf } from '../hooks/themes'
import type { Theme } from '../hooks/themes'

const W = 32
const H = 56
const FPS = 15
const LOOP_FRAMES = 300
const KEPT = 8

// The page's own texts. The videos' texts come from hooks/i18n.ts.
const SITE: Record<Lang, Record<string, string>> = {
  en: {
    tagline: 'A TikTok-style feed of pixel art mini-videos that opens while Claude answers. Every video is a tiny simulation drawn locally: no tokens, no model.',
    install: 'Install in Claude Code',
    desktop: 'In the Claude desktop app: + next to the prompt, Plugins, Add marketplace, then BordyV/brainrot-break.',
    copy: 'copy',
    copied: 'copied',
    all: 'all',
    videos: 'every video',
    keys: 'wheel or ↑↓ to scroll · double-click or L to like · click or space to pause',
    auto: 'auto-scroll',
    paused: 'paused',
  },
  fr: {
    tagline: 'Un feed façon TikTok de mini-vidéos en pixel art qui s’ouvre pendant que Claude répond. Chaque vidéo est une petite simulation dessinée en local : aucun token, aucun modèle.',
    install: 'Installer dans Claude Code',
    desktop: 'Dans l’app Claude desktop : + à côté du prompt, Plugins, Add marketplace, puis BordyV/brainrot-break.',
    copy: 'copier',
    copied: 'copié',
    all: 'tout',
    videos: 'toutes les vidéos',
    keys: 'molette ou ↑↓ pour défiler · double-clic ou L pour liker · clic ou espace pour la pause',
    auto: 'défilement auto',
    paused: 'en pause',
  },
  es: {
    tagline: 'Un feed estilo TikTok de minivídeos en pixel art que se abre mientras Claude responde. Cada vídeo es una pequeña simulación dibujada en local: sin tokens, sin modelo.',
    install: 'Instalar en Claude Code',
    desktop: 'En la app de escritorio de Claude: + junto al prompt, Plugins, Add marketplace y luego BordyV/brainrot-break.',
    copy: 'copiar',
    copied: 'copiado',
    all: 'todo',
    videos: 'todos los vídeos',
    keys: 'rueda o ↑↓ para pasar · doble clic o L para dar like · clic o espacio para pausar',
    auto: 'avance automático',
    paused: 'en pausa',
  },
  de: {
    tagline: 'Ein TikTok-artiger Feed aus Pixel-Art-Minivideos, der sich öffnet, während Claude antwortet. Jedes Video ist eine kleine, lokal gezeichnete Simulation: keine Tokens, kein Modell.',
    install: 'In Claude Code installieren',
    desktop: 'In der Claude-Desktop-App: + neben dem Prompt, Plugins, Add marketplace, dann BordyV/brainrot-break.',
    copy: 'kopieren',
    copied: 'kopiert',
    all: 'alle',
    videos: 'alle Videos',
    keys: 'Mausrad oder ↑↓ zum Scrollen · Doppelklick oder L zum Liken · Klick oder Leertaste für Pause',
    auto: 'automatisch weiter',
    paused: 'pausiert',
  },
  pt: {
    tagline: 'Um feed estilo TikTok de minivídeos em pixel art que abre enquanto o Claude responde. Cada vídeo é uma pequena simulação desenhada localmente: sem tokens, sem modelo.',
    install: 'Instalar no Claude Code',
    desktop: 'No app desktop do Claude: + ao lado do prompt, Plugins, Add marketplace e depois BordyV/brainrot-break.',
    copy: 'copiar',
    copied: 'copiado',
    all: 'tudo',
    videos: 'todos os vídeos',
    keys: 'roda ou ↑↓ para rolar · duplo clique ou L para curtir · clique ou espaço para pausar',
    auto: 'rolagem automática',
    paused: 'pausado',
  },
  it: {
    tagline: 'Un feed in stile TikTok di mini-video in pixel art che si apre mentre Claude risponde. Ogni video è una piccola simulazione disegnata in locale: niente token, nessun modello.',
    install: 'Installa in Claude Code',
    desktop: 'Nell’app desktop di Claude: + accanto al prompt, Plugins, Add marketplace, poi BordyV/brainrot-break.',
    copy: 'copia',
    copied: 'copiato',
    all: 'tutto',
    videos: 'tutti i video',
    keys: 'rotella o ↑↓ per scorrere · doppio clic o L per il like · clic o spazio per la pausa',
    auto: 'scorrimento automatico',
    paused: 'in pausa',
  },
}

const KINDS = Object.keys(MAKERS) as Kind[]

type Clip = { kind: Kind; seed: number; author: number; tags: number; caption: number; sound: number }
type Heart = { x: number; y: number; life: number }

let lang: Lang = pickLang()
let focus: Theme | null = null
let auto = false
let paused = false
const liked = new Set<number>()

const feed: Clip[] = []
let at = 0
let bag: Kind[] = []
const sims = new Map<number, { sim: Sim; t: number }>()
let hearts: Heart[] = []
let big = 0
let bigAt = { x: W / 2, y: H / 2 }

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T
const screen = $<HTMLCanvasElement>('screen')
const ctx = screen.getContext('2d') as CanvasRenderingContext2D
const image = ctx.createImageData(W, H)
const out = new Uint32Array(image.data.buffer)
const px = new Uint32Array(W * H)

function pickLang(): Lang {
  try {
    const saved = localStorage.getItem('lang') as Lang | null
    if (saved && LANGS.includes(saved)) return saved
  } catch {}
  const nav = navigator.language.slice(0, 2) as Lang
  return LANGS.includes(nav) ? nav : 'en'
}

const randInt = (n: number) => Math.floor(Math.random() * n)

function inFocus(kind: Kind) {
  return !focus || themesOf(kind).includes(focus)
}

// A shuffle bag, as in the mod: every kind once before any repeats.
function nextKind(): Kind {
  if (!bag.length) {
    bag = KINDS.filter(inFocus)
    for (let i = bag.length - 1; i > 0; i--) {
      const j = randInt(i + 1)
      ;[bag[i], bag[j]] = [bag[j] as Kind, bag[i] as Kind]
    }
  }
  return bag.pop() as Kind
}

function clipOf(kind: Kind): Clip {
  const m = META[kind]
  return {
    kind,
    seed: randInt(2 ** 31),
    author: randInt(m.authors.length),
    tags: randInt(m.tags.length),
    caption: randInt(m.captions.en.length),
    sound: randInt(m.sounds.en.length),
  }
}

function simAt(i: number) {
  let s = sims.get(i)
  if (!s) {
    const clip = feed[i] as Clip
    s = { sim: MAKERS[clip.kind](W, H, rngFrom(clip.seed)), t: 0 }
    sims.set(i, s)
    for (const k of sims.keys()) if (Math.abs(k - i) >= KEPT) sims.delete(k)
  }
  return s
}

function go(delta: number) {
  const next = at + delta
  if (next < 0) return
  while (feed.length <= next) feed.push(clipOf(nextKind()))
  at = next
  hearts = []
  big = 0
  paused = false
  swipe(delta)
  showClip()
}

// Plays a given kind next, from the grid or a link.
function play(kind: Kind) {
  feed.splice(at + 1, feed.length, clipOf(kind))
  for (const k of sims.keys()) if (k > at) sims.delete(k)
  go(1)
}

function swipe(delta: number) {
  screen.classList.remove('up', 'down')
  void screen.offsetWidth
  screen.classList.add(delta < 0 ? 'down' : 'up')
}

function like(x = W - 9, y = H * 0.55) {
  liked.add(at)
  big = 8
  bigAt = { x: Math.max(0, Math.min(W - 14, x)), y: Math.max(0, Math.min(H - 14, y)) }
  for (let i = 0; i < 3; i++) hearts.push({ x: W - 7 + Math.random() * 3, y: H - 12, life: 20 + i * 4 })
  showSide()
}

const fmt = (n: number) => (n >= 1e6 ? (n / 1e6).toFixed(1) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n))

function showSide() {
  const clip = feed[at] as Clip
  const base = (clip.seed % 90000) + 900
  $('likes').textContent = fmt(base + (liked.has(at) ? 1 : 0))
  $('like').textContent = liked.has(at) ? '♥' : '♡'
  $('like').classList.toggle('on', liked.has(at))
  $('comments').textContent = fmt(Math.floor(base / 37))
  $('index').textContent = String(at + 1)
}

function showClip() {
  const clip = feed[at] as Clip
  const m = META[clip.kind]
  $('author').textContent = m.authors[clip.author] as string
  $('caption').textContent = m.captions[lang][clip.caption] as string
  $('tags').innerHTML = ''
  for (const tag of (m.tags[clip.tags] as string).split(' ')) {
    const a = document.createElement('span')
    a.textContent = tag + ' '
    $('tags').append(a)
  }
  $('sound').textContent = '♫ ' + m.sounds[lang][clip.sound]
  history.replaceState(null, '', '#' + clip.kind)
  showSide()
}

function render() {
  const s = simAt(at)
  s.sim.draw(px)
  for (const h of hearts) drawHeart(px, W, H, h.x, h.y, Math.min(1, h.life / 8), false)
  if (big > 0) drawHeart(px, W, H, bigAt.x, bigAt.y, Math.min(1, big / 5), true)
  drawProgress(px, W, H, (s.t % LOOP_FRAMES) / LOOP_FRAMES)
  blit(px, out)
  ctx.putImageData(image, 0, 0)
}

// 0x00RRGGBB to the canvas's little-endian RGBA bytes.
function blit(src: Uint32Array, dst: Uint32Array) {
  for (let i = 0; i < src.length; i++) {
    const c = src[i] as number
    dst[i] = 0xff000000 | ((c & 0xff) << 16) | (c & 0xff00) | ((c >> 16) & 0xff)
  }
}

function tick() {
  const s = simAt(at)
  if (!paused) {
    s.sim.step()
    s.t++
    if (auto && s.t % LOOP_FRAMES === 0) go(1)
  }
  for (const h of hearts) {
    h.y -= 0.6
    h.life--
  }
  hearts = hearts.filter(h => h.life > 0)
  if (big > 0) big -= 0.5
}

let last = performance.now()
let acc = 0
function frame(now: number) {
  acc += Math.min(500, now - last)
  last = now
  while (acc >= 1000 / FPS) {
    tick()
    acc -= 1000 / FPS
  }
  render()
  tickTiles(now)
  requestAnimationFrame(frame)
}

// The grid: one still per video, playing while the pointer is on it.
type Tile = { kind: Kind; canvas: HTMLCanvasElement; sim: Sim; px: Uint32Array; image: ImageData }
const tiles: Tile[] = []
let hovered: Tile | null = null
let tileClock = 0

function drawTile(t: Tile) {
  t.sim.draw(t.px)
  blit(t.px, new Uint32Array(t.image.data.buffer))
  ;(t.canvas.getContext('2d') as CanvasRenderingContext2D).putImageData(t.image, 0, 0)
}

function tickTiles(now: number) {
  if (!hovered || now - tileClock < 1000 / FPS) return
  tileClock = now
  hovered.sim.step()
  drawTile(hovered)
}

function buildGrid() {
  const grid = $('grid')
  grid.innerHTML = ''
  tiles.length = 0
  for (const theme of Object.keys(THEMES) as Theme[]) {
    const kinds = KINDS.filter(k => themesOf(k).includes(theme))
    const section = document.createElement('section')
    const h = document.createElement('h3')
    h.textContent = `#${THEME_NAMES[lang][theme]} · ${kinds.length}`
    section.append(h)
    const row = document.createElement('div')
    row.className = 'tiles'
    for (const kind of kinds) {
      const b = document.createElement('button')
      b.className = 'tile'
      b.title = LABELS[lang][kind]
      const canvas = document.createElement('canvas')
      canvas.width = W
      canvas.height = H
      const label = document.createElement('span')
      label.textContent = LABELS[lang][kind]
      b.append(canvas, label)
      const tile: Tile = { kind, canvas, sim: MAKERS[kind](W, H, rngFrom(hashKind(kind))), px: new Uint32Array(W * H), image: new ImageData(W, H) }
      tiles.push(tile)
      b.addEventListener('pointerenter', () => (hovered = tile))
      b.addEventListener('pointerleave', () => hovered === tile && (hovered = null))
      b.addEventListener('click', () => {
        play(kind)
        $('phone').scrollIntoView({ behavior: 'smooth', block: 'center' })
      })
      row.append(b)
    }
    section.append(row)
    grid.append(section)
  }
  // Warm the stills up in slices, so the page shows at once.
  let i = 0
  const warm = () => {
    const end = Math.min(tiles.length, i + 12)
    for (; i < end; i++) {
      const t = tiles[i] as Tile
      for (let f = 0; f < 45; f++) t.sim.step()
      drawTile(t)
    }
    if (i < tiles.length) setTimeout(warm, 0)
  }
  warm()
}

function hashKind(kind: string) {
  let h = 2166136261
  for (let i = 0; i < kind.length; i++) h = Math.imul(h ^ kind.charCodeAt(i), 16777619)
  return h >>> 0
}

function buildThemes() {
  const box = $('themes')
  box.innerHTML = ''
  const chip = (label: string, theme: Theme | null) => {
    const b = document.createElement('button')
    b.className = 'chip' + (focus === theme ? ' on' : '')
    b.textContent = label
    b.addEventListener('click', () => {
      focus = theme
      bag = []
      buildThemes()
      if (!inFocus((feed[at] as Clip).kind)) {
        feed.length = at + 1
        go(1)
      } else feed.length = at + 1
    })
    box.append(b)
  }
  chip(SITE[lang].all as string, null)
  for (const theme of Object.keys(THEMES) as Theme[]) chip('#' + THEME_NAMES[lang][theme], theme)
}

function applyLang() {
  document.documentElement.lang = lang
  for (const el of document.querySelectorAll<HTMLElement>('[data-t]')) el.textContent = SITE[lang][el.dataset.t as string] as string
  $('count').textContent = String(KINDS.length)
  buildThemes()
  buildGrid()
  showClip()
}

function setup() {
  const select = $<HTMLSelectElement>('lang')
  for (const l of LANGS) select.append(new Option(l.toUpperCase(), l))
  select.value = lang
  select.addEventListener('change', () => {
    lang = select.value as Lang
    try {
      localStorage.setItem('lang', lang)
    } catch {}
    applyLang()
  })

  const phone = $('phone')
  let wheelAt = 0
  phone.addEventListener(
    'wheel',
    e => {
      e.preventDefault()
      const now = performance.now()
      if (now - wheelAt < 450 || Math.abs(e.deltaY) < 8) return
      wheelAt = now
      go(e.deltaY > 0 ? 1 : -1)
    },
    { passive: false },
  )

  let touchY: number | null = null
  phone.addEventListener('touchstart', e => (touchY = e.touches[0]?.clientY ?? null), { passive: true })
  phone.addEventListener('touchend', e => {
    const y = e.changedTouches[0]?.clientY
    if (touchY !== null && y !== undefined && Math.abs(y - touchY) > 40) go(y < touchY ? 1 : -1)
    touchY = null
  })

  // One click pauses, a double click likes where it lands.
  let clickTimer = 0
  screen.addEventListener('click', () => {
    clearTimeout(clickTimer)
    clickTimer = window.setTimeout(() => (paused = !paused), 250)
  })
  screen.addEventListener('dblclick', e => {
    clearTimeout(clickTimer)
    const r = screen.getBoundingClientRect()
    like(((e.clientX - r.left) / r.width) * W - 7, ((e.clientY - r.top) / r.height) * H - 6)
  })

  $('like').addEventListener('click', () => {
    if (liked.has(at)) {
      liked.delete(at)
      showSide()
    } else like()
  })
  $('nope').addEventListener('click', () => go(1))
  $('menu').addEventListener('click', () => $('themes').scrollIntoView({ behavior: 'smooth', block: 'center' }))
  $('help').addEventListener('click', () => ($('keys').hidden = !$('keys').hidden))
  $('up').addEventListener('click', () => go(-1))
  $('down').addEventListener('click', () => go(1))
  $<HTMLInputElement>('auto').addEventListener('change', e => (auto = (e.target as HTMLInputElement).checked))

  document.addEventListener('keydown', e => {
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement) return
    if (e.key === 'ArrowDown' || e.key === 'j') go(1)
    else if (e.key === 'ArrowUp' || e.key === 'k') go(-1)
    else if (e.key === 'l') like()
    else if (e.key === 'n') go(1)
    else if (e.key === ' ') paused = !paused
    else return
    e.preventDefault()
  })

  for (const b of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
    b.addEventListener('click', async () => {
      await navigator.clipboard?.writeText(b.dataset.copy as string)
      b.textContent = SITE[lang].copied as string
      setTimeout(() => (b.textContent = SITE[lang].copy as string), 1200)
    })
  }

  const fromLink = location.hash.slice(1) as Kind
  feed.push(clipOf(MAKERS[fromLink] ? fromLink : nextKind()))
  applyLang()
  requestAnimationFrame(frame)
}

setup()
