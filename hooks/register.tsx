import { atom, read, update } from 'claude-code'
import type { Elements, EngineInterface, Register, Timer } from 'claude-code'

import type { EndCard, FeedMode, FeedStats, Kind, Video } from '../types'
import { encodeCells, svgFrame } from './cells'
import { drawHeart, drawProgress, mix, rect, rngFrom } from './draw'
import type { Sim } from './draw'
import { MAKERS, THEMES, THEME_OF, themesOf } from './themes'
import type { Theme } from './themes'
import { COMMENTS, LABELS, LANGS, META, STRINGS, THEME_NAMES } from './i18n'
import type { Lang } from './i18n'

export { META }

const PANE = 'brainrot-break'
const OPEN_DELAY_MS = 2500
const END_CARD_MS = 15000
const FRAME_MS = 66
const SWIPE_FRAMES = 6
const LOOP_FRAMES = 300
const SWIPE_COOLDOWN_MS = 350
const SIDE = 7
const LESS_OF_MS = 5000
// A swipe this soon after a clip starts counts as a quick skip.
const QUICK_SKIP_MS = 2000
const LIKED_KEPT = 50

const EMPTY_STATS: FeedStats = { views: 0, likes: 0, ms: 0, byKind: {} }

const feedAtom = atom({ plugin: 'brainrot-break', key: 'feed' } as const, [] as Video[])
const indexAtom = atom({ plugin: 'brainrot-break', key: 'index' } as const, 0)
const likedAtom = atom({ plugin: 'brainrot-break', key: 'liked' } as const, [] as string[])
const modeAtom = atom({ plugin: 'brainrot-break', key: 'mode' } as const, 'off' as FeedMode)
const endCardAtom = atom({ plugin: 'brainrot-break', key: 'endCard' } as const, null as EndCard | null)
const sessionAtom = atom({ plugin: 'brainrot-break', key: 'session' } as const, EMPTY_STATS)

const KINDS = Object.keys(MAKERS) as Kind[]
const THEME_LIST = Object.keys(THEMES) as Theme[]
const themeOf = (kind: Kind) => THEME_OF[kind] as Theme
const THEME_COUNTS = Object.fromEntries(THEME_LIST.map(t => [t, KINDS.filter(k => themesOf(k).includes(t)).length])) as Record<Theme, number>

// The playing video lives in module variables: it is redrawn 15 times a
// second by blits, and a reload simply starts the clip over.
type Player = {
  video?: Video
  sim?: Sim
  W: number
  H: number
  cur: Uint32Array
  shown: Uint32Array
  prev?: Uint32Array
  swipe: number
  dir: 1 | -1
  t: number
  hearts: { x: number; y: number; life: number }[]
  big: number
  bigAt?: { x: number; y: number }
  shownAt: number
  watchFrom: number
  isPaused: boolean
  isDim: boolean
}

const player: Player = {
  W: 0,
  H: 0,
  cur: new Uint32Array(0),
  shown: new Uint32Array(0),
  swipe: 0,
  dir: 1,
  t: 0,
  hearts: [],
  big: 0,
  shownAt: 0,
  watchFrom: 0,
  isPaused: false,
  isDim: false,
}
let mounted: { requestId: string; columns: number; rows: number } | undefined
// The desktop pane, when one draws the feed: it is redrawn rather than blitted.
let desktopSite: string | undefined
// How often the desktop redraws the video. Every redraw rebuilds the pane,
// so a lower rate leaves the mouse more time to land a click.
let desktopFps = 10
let desktopCredit = 0
// The desktop site last scrolled to the feed's row, past the spare one above.
let desktopPlaced: string | undefined
let ticker: Timer | undefined
let openTimer: Timer | undefined
let closeTimer: Timer | undefined
let manual = false
let enabled = true
let scores: Partial<Record<Kind, number>> = {}
// Lowered by ⊘ on the theme's videos; multiplies each kind's score.
let themeScores: Partial<Record<Theme, number>> = {}
let hidden: Theme[] = []
// A click on a caption's hashtags: only this theme for now, until it is closed.
let focus: Theme | undefined
// The ··· menu, drawn in place of the video while it is open: the action
// sheet on the playing clip, or the list of every theme one step further.
type MenuPage = 'sheet' | 'themes' | 'likes' | 'settings' | 'help'
const menu = { isOpen: false, page: 'sheet' as MenuPage, offset: 0, max: 0 }
// The videos liked, newest first, kept between sessions so they can be watched again.
let likedVideos: Video[] = []
let autoScroll = false
// The clip whose comments are open, if any.
let commentsFor: string | undefined
// The last ⊘, undoable for a few seconds: the weights it changed, as they were.
let lessOf: { kind: Kind; kindScore?: number; themeScores: Partial<Record<Theme, number>>; timer: Timer } | undefined
let lastSwipe = 0
let bag: Kind[] = []
let turn = { views: 0, likes: 0, startedAt: 0 }
let frames = 0
let defaultLang: Lang = 'en'
let lang: Lang = 'en'
const S = () => STRINGS[lang]

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)] as T
}

function fmt(n: number): string {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', S().decimal)}M`
  if (n >= 1e3) return `${(n / 1e3).toFixed(1).replace('.', S().decimal)}k`
  return String(n)
}

function duration(ms: number): string {
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s} s`
  if (s < 3600) return `${Math.floor(s / 60)} min ${s % 60 ? `${s % 60} s` : ''}`.trim()
  return `${Math.floor(s / 3600)} h ${Math.floor((s % 3600) / 60)}`
}

const clampWeight = (w: number) => Math.max(0.2, Math.min(6, w))
// A kind's themes count by their mean, so one with three themes is not lowered three times over.
const themeWeight = (kind: Kind) => {
  const ts = themesOf(kind)
  return ts.reduce((sum, t) => sum + (themeScores[t] ?? 1), 0) / ts.length
}
const weight = (kind: Kind) => clampWeight((scores[kind] ?? 1) * themeWeight(kind))
// A video is shown as soon as one of its themes is ticked; under a hashtag
// focus, as soon as one of them is the one.
const isVisible = (kind: Kind) => {
  const ts = themesOf(kind)
  return ts.some(t => !hidden.includes(t)) && (!focus || ts.includes(focus))
}

// Scales the score of every theme of a kind, and hands back their scores as they were, to undo it.
function scaleThemes(kind: Kind, factor: number): Partial<Record<Theme, number>> {
  const before: Partial<Record<Theme, number>> = {}
  const next = { ...themeScores }
  for (const t of themesOf(kind)) {
    before[t] = themeScores[t]
    next[t] = clampWeight((themeScores[t] ?? 1) * factor)
  }
  themeScores = next
  return before
}

function restoreThemes(before: Partial<Record<Theme, number>>) {
  let next = themeScores
  for (const t of Object.keys(before) as Theme[]) next = withScore(next, t, before[t])
  themeScores = next
}

// A shuffle bag: a round holds each kind at most once, and the kinds you
// like come out earlier in it. Never twice in a row. A kind joins a round
// with a chance its weight gives (1 and up: always, 0.2: one round in five),
// so ⊘ makes a kind rarer without hiding it. Hidden themes stay out.
function newRound(): Kind[] {
  const kinds = KINDS.filter(isVisible)
  for (;;) {
    const round = kinds.filter(k => Math.random() < weight(k))
    if (round.length > 0) return round
  }
}

function drawKind(prev?: Kind): Kind {
  bag = bag.filter(isVisible)
  if (bag.length === 0) bag = newRound()
  const candidates = bag.filter(k => k !== prev)
  const pool = candidates.length > 0 ? candidates : bag
  const weights = pool.map(weight)
  let r = Math.random() * weights.reduce((a, b) => a + b, 0)
  let kind = pool[0] as Kind
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i] as number
    if (r <= 0) {
      kind = pool[i] as Kind
      break
    }
  }
  bag = bag.filter(k => k !== kind)
  return kind
}

function makeVideo(prev?: Kind): Video {
  const kind = drawKind(prev)
  const m = META[kind]
  const likes = Math.floor(Math.pow(10, 2.5 + Math.random() * 3.8))
  return {
    id: Math.random().toString(36).slice(2, 10),
    kind,
    seed: Math.floor(Math.random() * 2 ** 31),
    author: pick(m.authors),
    caption: Math.floor(Math.random() * m.captions.en.length),
    tags: Math.floor(Math.random() * m.tags.length),
    sound: Math.floor(Math.random() * m.sounds.en.length),
    likes,
    comments: Math.floor(likes * (0.005 + Math.random() * 0.03)),
  }
}

function bump($: EngineInterface, kind: Kind, delta: number) {
  scores = { ...scores, [kind]: clampWeight((scores[kind] ?? 1) + delta) }
  void $.store.set('scores', scores)
}

function withScore<K extends string>(table: Partial<Record<K, number>>, key: K, value: number | undefined) {
  const next = { ...table }
  if (value === undefined) delete next[key]
  else next[key] = value
  return next
}

function saveWeights($: EngineInterface) {
  void $.store.set('scores', scores)
  void $.store.set('themeScores', themeScores)
}

// ⊘: much less of this kind, a little less of its theme, and on to the next clip.
async function notInterested($: EngineInterface) {
  if (menu.isOpen) await closeMenu($)
  const kind = player.video?.kind
  if (!kind) return
  lessOf?.timer.cancel()
  const timer = $.clock.after(LESS_OF_MS, () => {
    lessOf = undefined
    $.ui.invalidate('ui.render')
  })
  const kindScore = scores[kind]
  scores = { ...scores, [kind]: clampWeight((scores[kind] ?? 1) * 0.5) }
  lessOf = { kind, kindScore, themeScores: scaleThemes(kind, 0.85), timer }
  saveWeights($)
  bag = bag.filter(k => k !== kind)
  await swipe($, 1, false)
}

async function undoNotInterested($: EngineInterface) {
  if (!lessOf) return
  const { kind, kindScore, themeScores: before, timer } = lessOf
  timer.cancel()
  lessOf = undefined
  scores = withScore(scores, kind, kindScore)
  restoreThemes(before)
  saveWeights($)
  $.ui.invalidate('ui.render')
}

// Forgets every ⊘ (and quick skip): what was lowered goes back to normal, likes stay.
async function forgetNotInterested($: EngineInterface) {
  themeScores = {}
  scores = Object.fromEntries(Object.entries(scores).filter(([, v]) => (v ?? 1) >= 1))
  saveWeights($)
  $.ui.toast(S().forgotten)
  $.ui.invalidate('ui.render')
}

async function setHidden($: EngineInterface, next: Theme[]) {
  hidden = next
  void $.store.set('hiddenThemes', hidden)
  if (focus && hidden.includes(focus)) focus = undefined
  await redrawAhead($)
}

async function setFocus($: EngineInterface, theme: Theme | undefined) {
  focus = theme
  // a new round, so the feed follows the change at once
  bag = []
  await redrawAhead($)
}

const toggleFocus = ($: EngineInterface) => setFocus($, focus || !player.video ? undefined : themeOf(player.video.kind))

// The clips queued ahead may no longer belong in the feed: draw them again.
async function redrawAhead($: EngineInterface) {
  const index = await read($, indexAtom)
  await update($, feedAtom, list => {
    const out = list.slice(0, index + 1)
    for (const v of list.slice(index + 1)) out.push(isVisible(v.kind) ? v : makeVideo(out[out.length - 1]?.kind))
    return out
  })
  $.ui.invalidate('ui.render')
}

async function toggleTheme($: EngineInterface, theme: Theme) {
  if (hidden.includes(theme)) return setHidden($, hidden.filter(t => t !== theme))
  if (hidden.length >= THEME_LIST.length - 1) {
    $.ui.toast(S().lastTheme)
    return
  }
  await setHidden($, [...hidden, theme])
}

// The clip pauses while the menu covers it, and its watch time with it.
async function openMenu($: EngineInterface, page: MenuPage = 'sheet') {
  if (!menu.isOpen) {
    noteWatch()
    player.watchFrom = 0
  }
  menu.isOpen = true
  menu.page = page
  menu.offset = 0
  $.ui.invalidate('ui.render')
}

async function closeMenu($: EngineInterface) {
  if (!menu.isOpen) return
  menu.isOpen = false
  player.watchFrom = ticker ? Date.now() : 0
  if (player.video && !isVisible(player.video.kind)) await swipe($, 1, false)
  $.ui.invalidate('ui.render')
}

const toggleMenu = ($: EngineInterface) => (menu.isOpen ? closeMenu($) : openMenu($))
const toggleHelp = ($: EngineInterface) => (menu.isOpen && menu.page === 'help' ? closeMenu($) : openMenu($, 'help'))

// A liked video played again: it comes next in the feed.
async function playLiked($: EngineInterface, id: string) {
  const video = likedVideos.find(v => v.id === id)
  if (!video) return
  // the clip on screen already: back to it
  if (player.video?.id === id) return closeMenu($)
  const index = await read($, indexAtom)
  await update($, feedAtom, list => [...list.slice(0, index + 1), video, ...list.slice(index + 1).filter(v => v.id !== id)])
  menu.isOpen = false
  player.watchFrom = ticker ? Date.now() : 0
  await swipe($, 1, false)
}

// /brainrot, described in the feed's language: registered again when it changes.
async function registerCommand($: EngineInterface) {
  await $.command.register({ name: 'brainrot', description: S().commandDescription, argumentHint: '[on|off|stats|lang en|fr|es|de|pt|it]' })
}

async function setLanguage($: EngineInterface, next: Lang) {
  lang = next
  await $.store.set('language', next)
  // a description left in the old language is no reason to fail the switch
  await registerCommand($).catch(() => undefined)
  $.ui.invalidate('ui.render')
}

async function changeSetting($: EngineInterface, act: string) {
  if (act === 'lang') {
    await setLanguage($, LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length] as Lang)
  } else if (act === 'autoopen') {
    enabled = !enabled
    await $.store.set('enabled', enabled)
  } else if (act === 'autoscroll') {
    autoScroll = !autoScroll
    await $.store.set('autoScroll', autoScroll)
  }
  $.ui.invalidate('ui.render')
}

function toggleComments($: EngineInterface) {
  const id = player.video?.id
  commentsFor = commentsFor === id ? undefined : id
  $.ui.invalidate('ui.render')
}

// The comments under a clip: two of its theme's and three generic ones,
// picked from its seed, so a clip shows the same ones in either language.
function commentsOf(video: Video): { handle: string; text: string; likes: number }[] {
  const rng = rngFrom(video.seed ^ 0x2c6e)
  const order = (n: number) => {
    const a = [...Array(n).keys()]
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[a[i], a[j]] = [a[j] as number, a[i] as number]
    }
    return a
  }
  const theme = COMMENTS.themes[themeOf(video.kind)][lang]
  const generic = COMMENTS.generic[lang]
  const texts = [...order(theme.length).slice(0, 2).map(i => theme[i] as string), ...order(generic.length).slice(0, 3).map(i => generic[i] as string)]
  const handles = order(COMMENTS.handles.length)
  return texts
    .map((text, i) => ({ handle: COMMENTS.handles[handles[i] as number] as string, text, likes: Math.floor(video.likes * 0.08 * rng()) }))
    .sort((a, b) => b.likes - a.likes)
}

// Hides every theme but the playing clip's: one has to stay, and from there
// the ones wanted can be switched back on.
async function hideAllThemes($: EngineInterface) {
  const keep = player.video ? themeOf(player.video.kind) : THEME_LIST[0]
  await setHidden($, THEME_LIST.filter(t => t !== keep))
  if (keep) $.ui.toast(S().keptTheme(`#${THEME_NAMES[lang][keep]}`))
}

// The sheet's "Hide #theme": the playing clip's whole theme, then back to the feed.
async function hidePlayingTheme($: EngineInterface) {
  const kind = player.video?.kind
  if (!kind) return
  if (hidden.length >= THEME_LIST.length - 1) {
    $.ui.toast(S().lastTheme)
    return
  }
  const theme = themeOf(kind)
  await setHidden($, [...hidden, theme])
  $.ui.toast(S().themeHidden(`#${THEME_NAMES[lang][theme]}`))
  await closeMenu($)
}

// ▲ ▼, the wheel and j/k: a swipe, or a scroll of the menu while it is open.
async function move($: EngineInterface, dir: 1 | -1, rows = 3) {
  if (!menu.isOpen) return swipe($, dir)
  menu.offset = Math.max(0, Math.min(menu.max, menu.offset + dir * rows))
  $.ui.invalidate('ui.render')
}

type Part = { text: string; act?: string; color?: string }
type Row = { text: string; act?: string; color?: string; bold?: boolean; dim?: boolean; parts?: Part[] }

// The caption with its hashtags at the end, as on TikTok, wrapped to rows of
// parts at the width: the hashtags in cyan, and only they take a click.
function captionRows(caption: string, tags: string, width: number, maxRows: number): Row[] {
  const lines: Part[][] = [[]]
  let used = 0
  const add = (text: string, isTag: boolean) => {
    const line = lines[lines.length - 1] as Part[]
    const last = line[line.length - 1]
    if (last && (last.act === 'focus') === isTag) last.text += text
    else line.push(isTag ? { text, act: 'focus', color: 'cyan' } : { text })
    used += [...text].length
  }
  const words = [...caption.split(' ').map(w => [w, false] as const), ...tags.split(' ').map(w => [w, true] as const)]
  for (const [word, isTag] of words) {
    if (!word) continue
    const len = Math.min(width, [...word].length)
    if (used > 0 && used + 1 + len > width) {
      lines.push([])
      used = 0
    }
    // a space goes with the word before it: between two hashtags it takes the click too
    if (used > 0) add(' ', (lines[lines.length - 1]?.at(-1)?.act === 'focus'))
    add([...word].slice(0, width).join(''), isTag)
  }
  const shown = lines.slice(0, maxRows)
  if (lines.length > maxRows) {
    const last = shown[shown.length - 1]?.at(-1)
    if (last) last.text = [...last.text].slice(0, Math.max(0, [...last.text].length - 1)).join('') + '…'
  }
  return shown.map(parts => ({ text: parts.map(p => p.text).join(''), parts }))
}

function sheetRows(): Row[] {
  const kind = player.video?.kind
  const tag = kind ? `#${THEME_NAMES[lang][themeOf(kind)]}` : ''
  return [
    { text: `${S().thisVideo} ${tag}`, dim: true },
    { text: ' ' },
    { text: `⊘  ${S().nopeAction}`, act: 'nope' },
    { text: `✕  ${S().hideTheme(tag)}`, act: 'hide' },
    { text: `#  ${S().chooseThemes}`, act: 'themes' },
    { text: `♥  ${S().myLikes(likedVideos.length)}`, act: 'likes' },
    { text: `*  ${S().settings}`, act: 'settings' },
    { text: `?  ${S().shortcuts}`, act: 'help' },
    { text: `↺  ${S().forget}`, act: 'forget' },
    { text: ' ' },
    { text: `[ ${S().close} ]`, act: 'menu', bold: true },
  ]
}

function likesRows(): Row[] {
  const back: Row = { text: S().menuBack, act: 'sheet', dim: true }
  if (likedVideos.length === 0) return [back, { text: ' ' }, { text: S().noLikes, dim: true }]
  return [back, ...likedVideos.map(v => ({ text: `♥ ${LABELS[lang][v.kind]}  ${v.author}`, act: `play:${v.id}` }))]
}

// The ? page: every key, then what it does.
function helpRows(): Row[] {
  const keys: [string, string][] = [
    ['j k ▲ ▼', S().helpNext],
    ['l ♥', S().helpLike],
    ['click', S().helpPause],
    ['m ≡', S().helpComments],
    ['n ⊘', S().helpNope],
    ['u', S().helpUndo],
    ['t ···', S().helpMenu],
    ['#tags', S().helpTags],
    ['c x', S().helpEndCard],
    ['? h', S().helpHelp],
  ]
  return [
    { text: S().shortcuts, bold: true },
    { text: ' ' },
    ...keys.map(([key, what]) => ({ text: `${key.padEnd(8)}${what}` })),
    { text: ' ' },
    { text: `[ ${S().close} ]`, act: 'menu', bold: true },
  ]
}

function settingsRows(): Row[] {
  return [
    { text: S().menuBack, act: 'sheet', dim: true },
    { text: ' ' },
    { text: S().settingLanguage, act: 'lang' },
    { text: S().settingAutoOpen(enabled), act: 'autoopen' },
    { text: S().settingAutoScroll(autoScroll), act: 'autoscroll' },
  ]
}

// The menu's rows, as many as fit in the height; the rest scrolls.
function themeRows(width: number): Row[] {
  return [
    { text: S().menuBack, act: 'sheet', dim: true },
    { text: `${hidden.length === 0 ? '✓' : ' '} ${S().showAll}`, act: 'all', bold: true },
    { text: `  ${S().hideAll}`, act: 'none', bold: true },
    ...THEME_LIST.map(t => {
      const isOn = !hidden.includes(t)
      const name = THEME_NAMES[lang][t]
      const count = String(THEME_COUNTS[t])
      const room = Math.max(1, width - 2 - [...name].length - count.length)
      const row: Row = { text: `${isOn ? '✓' : '✗'} ${name}${' '.repeat(room)}${count}`, act: `theme:${t}` }
      return isOn ? row : { ...row, dim: true }
    }),
  ]
}

function menuRows(width: number, height: number): Row[] {
  const rows =
    menu.page === 'sheet'
      ? sheetRows()
      : menu.page === 'likes'
        ? likesRows()
        : menu.page === 'settings'
          ? settingsRows()
          : menu.page === 'help'
            ? helpRows()
            : themeRows(width)
  const h = Math.max(1, Math.min(height, rows.length))
  menu.max = rows.length - h
  menu.offset = Math.max(0, Math.min(menu.max, menu.offset))
  return rows.slice(menu.offset, menu.offset + h)
}

function addStats(s: FeedStats, kind: Kind | undefined, d: { views?: number; likes?: number; ms?: number }): FeedStats {
  const views = d.views ?? 0
  const likes = d.likes ?? 0
  const ms = d.ms ?? 0
  const byKind = { ...s.byKind }
  if (kind) {
    const k = byKind[kind] ?? { views: 0, likes: 0, ms: 0 }
    byKind[kind] = { views: k.views + views, likes: Math.max(0, k.likes + likes), ms: k.ms + ms }
  }
  return { views: s.views + views, likes: Math.max(0, s.likes + likes), ms: s.ms + ms, byKind }
}

function favorite(s: FeedStats): Kind | undefined {
  let best: Kind | undefined
  let score = 0
  for (const [k, v] of Object.entries(s.byKind) as [Kind, { views: number; likes: number; ms: number }][]) {
    const value = v.likes * 60000 + v.ms
    if (value > score) {
      score = value
      best = k
    }
  }
  return best
}

function statsLine(s: FeedStats): string {
  const fav = favorite(s)
  return S().statsLine(s.views, s.likes, duration(s.ms), fav && LABELS[lang][fav])
}

// Views and watch time are noted while drawing, where state cannot be
// written; they wait here until a timer or a handler writes them.
let pending: { kind: Kind; views?: number; ms?: number }[] = []

async function flushStats($: EngineInterface) {
  if (pending.length === 0) return
  const batch = pending
  pending = []
  await update($, sessionAtom, s => batch.reduce((acc, d) => addStats(acc, d.kind, d), s))
}

// Notes the time spent on the playing video since it was last counted.
function noteWatch() {
  const kind = player.video?.kind
  const now = Date.now()
  const ms = player.watchFrom ? now - player.watchFrom : 0
  player.watchFrom = ticker ? now : 0
  if (kind && ms > 0) pending.push({ kind, ms })
}

// The last few videos keep their simulation, so scrolling back resumes
// a clip where it was left instead of starting it over.
const KEPT_VIDEOS = 8
const kept = new Map<string, { sim: Sim; t: number; W: number; H: number }>()
let lastSkip: { id: string; kind: Kind; kindScore?: number; themeScores: Partial<Record<Theme, number>>; at: number } | undefined

function load(video: Video, W: number, H: number) {
  if (player.video?.id === video.id && player.W === W && player.H === H) return
  const isSameVideo = player.video?.id === video.id
  if (player.W !== W || player.H !== H) {
    player.shown = new Uint32Array(W * H)
    player.prev = undefined
    player.swipe = 0
  }
  if (!isSameVideo) noteWatch()
  if (player.video && player.sim && !isSameVideo) {
    kept.delete(player.video.id)
    kept.set(player.video.id, { sim: player.sim, t: player.t, W: player.W, H: player.H })
    for (const id of kept.keys()) if (kept.size > KEPT_VIDEOS) kept.delete(id)
  }
  const saved = isSameVideo ? undefined : kept.get(video.id)
  player.video = video
  player.W = W
  player.H = H
  player.cur = new Uint32Array(W * H)
  const isResumed = saved !== undefined && saved.W === W && saved.H === H
  player.sim = isResumed ? saved.sim : MAKERS[video.kind](W, H, rngFrom(video.seed))
  if (!isSameVideo) {
    player.t = isResumed ? saved.t : 0
    player.shownAt = Date.now()
    player.watchFrom = player.shownAt
    player.hearts = []
    player.big = 0
    player.isPaused = false
    if (!saved) {
      turn.views++
      pending.push({ kind: video.kind, views: 1 })
    }
  }
}

function advance() {
  if (player.swipe > 0) player.swipe--
  if (player.isPaused) return
  player.sim?.step()
  player.t++
  if (player.big > 0) player.big--
  for (const h of player.hearts) {
    h.y -= 0.7
    h.x += Math.sin(h.life * 0.5) * 0.3
    h.life--
  }
  player.hearts = player.hearts.filter(h => h.life > 0)
}

function compose(): Uint32Array {
  const { W, H, cur, shown, prev } = player
  player.sim?.draw(cur)
  for (const h of player.hearts) drawHeart(cur, W, H, h.x, h.y, Math.min(1, h.life / 8), false)
  if (player.big > 0) {
    const at = player.bigAt ?? { x: W / 2, y: H / 2 }
    drawHeart(cur, W, H, at.x - 7, at.y - 6, Math.min(1, player.big / 5), true)
  }
  drawProgress(cur, W, H, (player.t % LOOP_FRAMES) / LOOP_FRAMES)
  if (player.isDim) for (let i = 0; i < cur.length; i++) cur[i] = mix(cur[i] as number, 0x000000, 0.55)
  if (player.isPaused) {
    rect(cur, W, H, W / 2 - 4, H / 2 - 5, 3, 10, 0xf2f2f2)
    rect(cur, W, H, W / 2 + 1, H / 2 - 5, 3, 10, 0xf2f2f2)
  }
  if (player.swipe > 0 && prev) {
    const o = Math.round(H * (1 - player.swipe / SWIPE_FRAMES))
    for (let y = 0; y < H; y++) {
      const fromNew = player.dir === 1 ? y >= H - o : y < o
      const src = fromNew ? cur : prev
      const sy = player.dir === 1 ? (fromNew ? y - (H - o) : y + o) : fromNew ? y + H - o : y - o
      shown.set(src.subarray(sy * W, sy * W + W), y * W)
    }
  } else {
    shown.set(cur)
  }
  return shown
}

function tick($: EngineInterface) {
  if (!player.sim || menu.isOpen) return
  const term = mounted && mounted.columns === player.W && mounted.rows * 2 === player.H ? mounted : undefined
  if (!term && !desktopSite) return
  advance()
  if (++frames % 15 === 0) void flushStats($)
  // Next video by itself: once the clip has played its loop through.
  if (autoScroll && player.t === LOOP_FRAMES) void swipe($, 1, false)
  if (term) {
    const cells = encodeCells(compose(), term.columns, term.rows)
    void $.ui.blit({ requestId: term.requestId, key: 'video', cells }).catch(() => undefined)
  }
  // The desktop redraws ten times a second at most; the clip keeps its speed.
  // Each tick earns desktopFps fifteenths of a redraw, so 10 fps is two ticks in
  // three, not one in two (a rounded divisor gave 7.5).
  if (desktopSite && desktopPlaced !== desktopSite) {
    desktopPlaced = desktopSite
    void $.ui.scroll({ to: { key: 'feed' }, in: desktopSite, block: 'start' }).catch(() => undefined)
  }
  if (desktopSite && desktopFps > 0) {
    desktopCredit = Math.min(15, desktopCredit) + Math.min(15, desktopFps)
    if (desktopCredit >= 15) {
      desktopCredit -= 15
      $.ui.invalidate('ui.render')
    }
  }
}

function startTicker($: EngineInterface) {
  if (ticker) return
  ticker = $.clock.every(FRAME_MS, () => tick($))
  player.watchFrom = Date.now()
}

function stopTicker($: EngineInterface) {
  noteWatch()
  void flushStats($)
  ticker?.cancel()
  ticker = undefined
  player.watchFrom = 0
  mounted = undefined
  desktopSite = undefined
  desktopPlaced = undefined
}

async function ensureFeed($: EngineInterface) {
  const feed = await read($, feedAtom)
  if (feed.length > 0) return
  const first = makeVideo()
  await update($, feedAtom, () => [first, makeVideo(first.kind)])
  await update($, indexAtom, () => 0)
}

async function clearEndCard($: EngineInterface) {
  closeTimer?.cancel()
  closeTimer = undefined
  player.isDim = false
  await update($, endCardAtom, () => null)
}

async function openFeed($: EngineInterface) {
  await ensureFeed($)
  turn = { views: 0, likes: 0, startedAt: Date.now() }
  const opened = await $.ui.open({ id: PANE, title: S().paneTitle, rows: 30 })
  if (opened.isPlaced) {
    await update($, modeAtom, () => 'pane' as FeedMode)
  } else {
    // Too narrow for a pane opened unasked: play in the band above the prompt.
    await $.ui.close({ id: PANE })
    await update($, modeAtom, () => 'band' as FeedMode)
  }
  startTicker($)
}

async function closeFeed($: EngineInterface) {
  stopTicker($)
  manual = false
  menu.isOpen = false
  await clearEndCard($)
  const mode = await read($, modeAtom)
  await update($, modeAtom, () => 'off' as FeedMode)
  if (mode === 'pane') await $.ui.close({ id: PANE })
}

async function showEndCard($: EngineInterface) {
  noteWatch()
  await flushStats($)
  const card: EndCard = { views: turn.views, likes: turn.likes, seconds: Math.round((Date.now() - turn.startedAt) / 1000) }
  player.isDim = true
  await update($, endCardAtom, () => card)
  void $.store.set('lastSession', await read($, sessionAtom))
  closeTimer?.cancel()
  closeTimer = $.clock.after(END_CARD_MS, () => {
    closeTimer = undefined
    void closeFeed($)
  })
}

async function swipe($: EngineInterface, dir: 1 | -1, isSkip = true) {
  const now = Date.now()
  const index = await read($, indexAtom)
  const target = index + dir
  if (target < 0) return
  // A quick skip: a little less of this kind, and a touch less of its theme.
  if (isSkip && dir === 1 && player.video && now - player.shownAt < QUICK_SKIP_MS) {
    const { id, kind } = player.video
    const kindScore = scores[kind]
    scores = { ...scores, [kind]: clampWeight((scores[kind] ?? 1) * 0.75) }
    lastSkip = { id, kind, kindScore, themeScores: scaleThemes(kind, 0.97), at: now }
    saveWeights($)
  }
  let feed = await read($, feedAtom)
  if (target >= feed.length - 1) {
    const last = feed[feed.length - 1]?.kind
    const fresh = makeVideo(last)
    await update($, feedAtom, list => [...list, fresh])
    feed = await read($, feedAtom)
  }
  const video = feed[target]
  if (!video) return
  // Back on a clip skipped a moment ago: that skip was a mistake, not a verdict.
  if (dir === -1 && lastSkip?.id === video.id && now - lastSkip.at < 10000) {
    scores = withScore(scores, lastSkip.kind, lastSkip.kindScore)
    restoreThemes(lastSkip.themeScores)
    saveWeights($)
    lastSkip = undefined
  }
  commentsFor = undefined
  if (player.W > 0) {
    player.prev = player.shown.slice()
    player.swipe = SWIPE_FRAMES
    player.dir = dir
    load(video, player.W, player.H)
  }
  await update($, indexAtom, () => target)
}

async function like($: EngineInterface, at?: { x: number; y: number }) {
  const video = player.video
  if (!video) return
  const liked = await read($, likedAtom)
  const wasLiked = liked.includes(video.id)
  player.big = 12
  player.bigAt = at
  // A double tap only ever likes; the button toggles.
  if (at && wasLiked) return
  const isLiked = !wasLiked
  await update($, likedAtom, list => (isLiked ? [...new Set([...list, video.id])] : list.filter(id => id !== video.id)))
  likedVideos = isLiked ? [video, ...likedVideos.filter(v => v.id !== video.id)].slice(0, LIKED_KEPT) : likedVideos.filter(v => v.id !== video.id)
  void $.store.set('likedVideos', likedVideos)
  const delta = isLiked ? 1 : -1
  turn.likes = Math.max(0, turn.likes + delta)
  await update($, sessionAtom, s => addStats(s, video.kind, { likes: delta }))
  // A like raises the kind and its themes; taking it back lowers them again.
  bump($, video.kind, 2 * delta)
  scaleThemes(video.kind, isLiked ? 1.05 : 1 / 1.05)
  void $.store.set('themeScores', themeScores)
  if (!isLiked) {
    player.big = 0
    return
  }
  for (let i = 0; i < 5; i++)
    player.hearts.push({ x: player.W * (0.5 + Math.random() * 0.35), y: player.H * (0.65 + Math.random() * 0.2), life: 16 + i * 3 })
}

type Common = Pick<Elements['terminal'], 'Box' | 'Text' | 'Button' | 'Client'>

async function feedData($: EngineInterface) {
  const feed = await read($, feedAtom)
  const index = await read($, indexAtom)
  const liked = await read($, likedAtom)
  const card = await read($, endCardAtom)
  const video = feed[index]
  return { video, index, isLiked: video ? liked.includes(video.id) : false, card }
}

// The like and scroll column and the caption (or the end card): the same on
// every surface, only the video beside them differs.
async function feedParts(
  $: EngineInterface,
  els: Common,
  d: { video: Video; index: number; isLiked: boolean; card: EndCard | null },
  isWide: boolean,
  isDesktop: boolean,
  height = 0,
  captionWidth = 44,
) {
  const { Box, Text, Button, Client } = els
  const { video, index, isLiked, card } = d
  const meta = META[video.kind]
  // The menu's ··· sits at the top, level with the clip's top; the rest at the bottom.
  const actions = (
    <Box flexDirection="column" width={SIDE} height={height} alignItems="center" justifyContent="space-between">
      <Box flexDirection="column" alignItems="center">
        <Button key="themes" plain hotkey="t" onPress={() => toggleMenu($)}>
          ···
        </Button>
        <Button key="help" plain hotkey="h" onPress={() => toggleHelp($)}>
          ?
        </Button>
      </Box>
      <Box flexDirection="column" alignItems="center">
        <Button key="nope" plain hotkey="n" onPress={() => notInterested($)}>
          ⊘
        </Button>
        <Text> </Text>
        <Button key="like" plain hotkey="l" onPress={() => like($)}>
          {isLiked ? <Text color="#ff2d55" bold>♥</Text> : <Text bold>♡</Text>}
        </Button>
        <Text dimColor>{fmt(video.likes + (isLiked ? 1 : 0))}</Text>
        <Text> </Text>
        <Button key="comments" plain hotkey="m" onPress={() => toggleComments($)}>
          ≡
        </Button>
        <Text dimColor>{fmt(video.comments)}</Text>
        <Text> </Text>
        <Button key="prev" plain hotkey="k" onPress={() => move($, -1)}>
          ▲
        </Button>
        <Text dimColor>{`${index + 1}`}</Text>
        <Button key="next" plain hotkey="j" onPress={() => move($, 1)}>
          ▼
        </Button>
      </Box>
    </Box>
  )
  // The hashtags take a click: only this video's theme for now. Its own line, so the click lands on them.
  const capRows = captionRows(meta.captions[lang][video.caption] as string, meta.tags[video.tags] as string, captionWidth, isWide ? 4 : 1)
  const focusText = focus ? `◉ ${S().focusOn(`#${THEME_NAMES[lang][focus]}`)}` : ''
  const focusLine = isDesktop ? (
    <Client key="unfocus" module="./controls.tsx" props={{ rows: [{ text: focusText, act: 'focus', color: 'cyan', bold: true }], width: Math.min(44, [...focusText].length), isLeft: true }} width={Math.min(44, [...focusText].length)} height={1} />
  ) : (
    <Button key="unfocus" plain onPress={() => setFocus($, undefined)}>
      <Text color="cyan" bold>{focusText}</Text>
    </Button>
  )
  const info = card ? (
    <Box flexDirection="column">
      <Text bold color="green">
        {S().answered}
      </Text>
      <Text dimColor>{S().waiting}</Text>
      <Text> </Text>
      <Text>{S().thisWait(card.views, card.likes, duration(card.seconds * 1000))}</Text>
      <Text dimColor wrap="truncate-end">
        {S().session}: {statsLine(await read($, sessionAtom))}
      </Text>
      <Box flexDirection="row" gap={1}>
        <Button key="continue" hotkey="c" onPress={() => keepWatching($)}>
          {S().keepScrolling}
        </Button>
        <Button key="close" hotkey="x" variant="primary" onPress={() => closeFeed($)}>
          {S().close}
        </Button>
      </Box>
    </Box>
  ) : (
    <Box flexDirection="column">
      {commentsFor === video.id && (
        <Box flexDirection="column" marginBottom={1}>
          <Text bold>≡ {S().commentsTitle(fmt(video.comments))}</Text>
          {commentsOf(video).map(c => (
            <Text wrap="truncate-end">
              <Text bold>{c.handle}</Text> {c.text} <Text dimColor>♥ {fmt(c.likes)}</Text>
            </Text>
          ))}
        </Box>
      )}
      {focus && focusLine}
      <Text bold>{video.author}</Text>
      <Client key="caption" module="./controls.tsx" props={{ rows: capRows, width: captionWidth, isLeft: true }} width={captionWidth} height={capRows.length} />
      <Text dimColor wrap="truncate-end">
        ♫ {meta.sounds[lang][video.sound]}
      </Text>
      {lessOf && !isDesktop && (
        <Box flexDirection="row" gap={1}>
          <Text dimColor>⊘ {S().notInterested(LABELS[lang][lessOf.kind])} ·</Text>
          <Button key="undo" plain hotkey="u" onPress={() => undoNotInterested($)}>
            {S().undo}
          </Button>
        </Box>
      )}
    </Box>
  )
  return { actions, info }
}

async function feedTree($: EngineInterface, els: Elements['terminal'], requestId: string, columns: number, rows: number) {
  const { Box, Text, Raster, Client } = els
  if (columns < SIDE + 12 || rows < 7) return <Text dimColor>{S().tooSmall}</Text>

  const d = await feedData($)
  const { video, card } = d
  if (!video) return <Text dimColor>{S().loading}</Text>

  // A vertical 9:16 clip: each cell is two square-ish pixels, so C = R * 9 / 8.
  const fit = (r: number): [number, number] => {
    const R = Math.max(6, Math.min(36, r))
    return [Math.round((R * 9) / 8), R]
  }
  let [C, R] = fit(rows - 1)
  const isWide = columns >= C + SIDE + 28
  if (!isWide) {
    ;[C, R] = fit(rows - (card ? 7 : 4))
    if (C > columns - SIDE - 1) {
      C = Math.max(10, columns - SIDE - 1)
      R = Math.max(6, Math.min(R, Math.round((C * 8) / 9)))
    }
  }

  load(video, C, R * 2)
  mounted = { requestId, columns: C, rows: R }
  const captionWidth = isWide ? Math.min(44, columns - C - SIDE - 2) : columns
  const { actions, info } = await feedParts($, els, { ...d, video }, isWide, false, R, captionWidth)
  const menuList = menu.isOpen ? menuRows(C, R) : []
  const screen = menu.isOpen ? (
    <Box width={C} height={R}>
      <Client key="menu" module="./controls.tsx" props={{ rows: menuList, width: C, isLeft: true }} width={C} height={menuList.length} />
    </Box>
  ) : (
    <Box width={C} height={R}>
      <Raster key="video" columns={C} rows={R} cells={encodeCells(compose(), C, R)} />
      <Box position="absolute" top={0} left={0}>
        <Client key="tap" module="./tap.tsx" props={{ columns: C, rows: R }} width={C} height={R} />
      </Box>
    </Box>
  )

  if (isWide) {
    return (
      <Box flexDirection="row" gap={1}>
        {screen}
        {actions}
        <Box flexDirection="column" justifyContent="flex-end" width={Math.min(44, columns - C - SIDE - 2)}>
          {info}
          <Text> </Text>
          {!card && <Text dimColor>{S().hint}</Text>}
        </Box>
      </Box>
    )
  }
  return (
    <Box flexDirection="column">
      <Box flexDirection="row" gap={1}>
        {screen}
        {actions}
      </Box>
      {info}
    </Box>
  )
}

// The desktop draws the same clip at a fixed pixel size, scaled to the pane.
const DESKTOP_W = 32
const DESKTOP_H = 56

async function desktopTree($: EngineInterface, els: Elements['desktop'], requestId: string, columns: number, bodyRows: number) {
  const { Box, Text, Svg } = els
  const d = await feedData($)
  const { video, card } = d
  if (!video) return <Text dimColor>{S().loading}</Text>

  load(video, DESKTOP_W, DESKTOP_H)
  desktopSite = requestId
  const isWide = columns >= 70
  const scale = Math.max(4, Math.min(9, Math.floor((columns * 8 - (isWide ? 360 : 80)) / DESKTOP_W)))
  const { info: caption } = await feedParts($, els, { ...d, video, card: null }, isWide, true, 0, Math.min(44, columns))
  const { Client } = els
  // The Svg's size in cells (about 8 x 16 a cell): the tap layer's, and the side column's height.
  const tapCols = Math.ceil((DESKTOP_W * scale) / 8)
  const tapRows = Math.ceil((DESKTOP_H * scale) / 16)
  const sideRows = [
    { text: '⊘', act: 'nope' },
    { text: ' ' },
    d.isLiked ? { text: '♥', act: 'like', color: '#ff2d55', bold: true } : { text: '♡', act: 'like', bold: true },
    { text: fmt(video.likes + (d.isLiked ? 1 : 0)), act: 'like', dim: true },
    { text: ' ' },
    { text: '≡', act: 'comments' },
    { text: fmt(video.comments), act: 'comments', dim: true },
    { text: ' ' },
    { text: '▲', act: 'prev' },
    { text: `${d.index + 1}`, dim: true },
    { text: '▼', act: 'next' },
  ]
  const moreRows = [{ text: '···', act: 'menu' }, { text: '?', act: 'help' }]
  // No height of its own: the row stretches it to the video's, ··· at the top, ▼ at the bottom.
  const actions = (
    <Box flexDirection="column" justifyContent="space-between">
      <Client key="more" module="./controls.tsx" props={{ rows: moreRows, width: SIDE }} width={SIDE} height={moreRows.length} />
      <Client key="controls" module="./controls.tsx" props={{ rows: sideRows, width: SIDE }} width={SIDE} height={sideRows.length} />
    </Box>
  )
  const cardRows = [
    { text: `[ ${S().keepScrolling} ]`, act: 'continue' },
    { text: ' ' },
    { text: `[ ${S().close} ]`, act: 'close', bold: true },
  ]
  const undoRows = lessOf ? [{ text: `⊘ ${S().notInterested(LABELS[lang][lessOf.kind])} · ${S().undo}`, act: 'undo', dim: true }] : []
  const info = card ? (
    <Box flexDirection="column">
      <Text bold color="green">
        {S().answered}
      </Text>
      <Text dimColor>{S().waiting}</Text>
      <Text> </Text>
      <Text>{S().thisWait(card.views, card.likes, duration(card.seconds * 1000))}</Text>
      <Text dimColor wrap="truncate-end">
        {S().session}: {statsLine(await read($, sessionAtom))}
      </Text>
      <Text> </Text>
      <Client key="card" module="./controls.tsx" props={{ rows: cardRows, width: 28 }} width={28} height={cardRows.length} />
    </Box>
  ) : lessOf ? (
    <Box flexDirection="column">
      {caption}
      <Client key="undo" module="./controls.tsx" props={{ rows: undoRows, width: Math.min(44, columns), isLeft: true }} width={Math.min(44, columns)} height={1} />
    </Box>
  ) : (
    caption
  )
  // The Svg takes no clicks: a transparent tap layer over it does, as in the terminal.
  // Its size in cells comes from the Svg's pixels (about 8 x 16 a cell): sized
  // in percent, the region came out empty on the desktop and took no clicks.
  const menuList = menu.isOpen ? menuRows(tapCols, tapRows) : []
  const screen = menu.isOpen ? (
    <Box width={tapCols} height={tapRows}>
      <Client key="menu" module="./controls.tsx" props={{ rows: menuList, width: tapCols, isLeft: true }} width={tapCols} height={menuList.length} />
    </Box>
  ) : (
    <Box>
      <Svg
        source={svgFrame(compose(), DESKTOP_W, DESKTOP_H)}
        alt={`${video.author}: ${META[video.kind].captions[lang][video.caption]}`}
        width={DESKTOP_W * scale}
        height={DESKTOP_H * scale}
      />
      <Box position="absolute" top={0} left={0}>
        <Client key="tap" module="./tap.tsx" props={{ columns: tapCols, rows: tapRows }} width={tapCols} height={tapRows} />
      </Box>
    </Box>
  )
  const body = isWide ? (
    <Box flexDirection="row" gap={1}>
      {screen}
      {actions}
      <Box flexDirection="column" justifyContent="flex-end" width={44}>
        {info}
        <Text> </Text>
        {!card && <Text dimColor>{S().hintDesktop}</Text>}
      </Box>
    </Box>
  ) : (
    <Box flexDirection="column" gap={1}>
      <Box flexDirection="row" gap={1}>
        {screen}
        {actions}
      </Box>
      {info}
    </Box>
  )
  // The pane only hands the wheel on while it has something to scroll, in
  // that direction: a spare row above the feed and one below give it room both
  // ways, and ui.scroll keeps the window on the feed, one row down.
  return (
    <Box flexDirection="column" minHeight={bodyRows + 2}>
      <Box height={1} />
      <Box key="feed" flexDirection="column">
        {body}
      </Box>
    </Box>
  )
}

async function togglePause($: EngineInterface) {
  player.isPaused = !player.isPaused
  $.ui.invalidate('ui.render')
}

async function keepWatching($: EngineInterface) {
  manual = true
  await clearEndCard($)
}

export const register: Register = (on, options) => {
  defaultLang = LANGS.includes(options.language as Lang) ? (options.language as Lang) : 'en'
  lang = defaultLang

  on('session.start', async ($, e, next) => {
    const stored = (await $.store.get('language')) as Lang | undefined
    lang = stored && LANGS.includes(stored) ? stored : defaultLang
    await registerCommand($)
    enabled = (await $.store.get('enabled')) !== false
    const fps = await $.store.get('desktopFps')
    if (typeof fps === 'number') desktopFps = fps
    scores = ((await $.store.get('scores')) as Partial<Record<Kind, number>> | undefined) ?? {}
    themeScores = ((await $.store.get('themeScores')) as Partial<Record<Theme, number>> | undefined) ?? {}
    const storedHidden = ((await $.store.get('hiddenThemes')) as Theme[] | undefined) ?? []
    hidden = storedHidden.filter(t => THEME_LIST.includes(t))
    if (hidden.length >= THEME_LIST.length) hidden = []
    likedVideos = ((await $.store.get('likedVideos')) as Video[] | undefined)?.filter(v => v.kind in MAKERS) ?? []
    autoScroll = (await $.store.get('autoScroll')) === true
    await update($, likedAtom, list => [...new Set([...list, ...likedVideos.map(v => v.id)])])

    // A hot reload keeps this session's stats; a new session sums up the last one.
    const current = await read($, sessionAtom)
    if (current.views === 0) {
      const last = (await $.store.get('lastSession')) as FeedStats | undefined
      if (last && last.views > 0) {
        const all = ((await $.store.get('allTime')) as FeedStats | undefined) ?? EMPTY_STATS
        let sum = all
        for (const [k, v] of Object.entries(last.byKind) as [Kind, { views: number; likes: number; ms: number }][])
          sum = addStats(sum, k, v)
        await $.store.set('allTime', sum)
        await $.store.delete('lastSession')
        $.ui.toast(S().lastSession(statsLine(last)), { timeoutMs: 8000 })
      }
    }
    // After a hot reload the feed may still be on screen: keep it playing.
    if ((await read($, modeAtom)) !== 'off') startTicker($)

    return next(e)
  })

  on('command.run', { command: 'brainrot' }, async ($, e) => {
    const arg = e.args.trim().toLowerCase()
    if (arg === 'off') {
      enabled = false
      await $.store.set('enabled', false)
      await closeFeed($)
      return { text: S().off }
    }
    if (arg === 'on') {
      enabled = true
      await $.store.set('enabled', true)
      return { text: S().on }
    }
    if (arg === 'lang' || arg.startsWith('lang ')) {
      const wanted = arg.slice(4).trim() as Lang
      if (!LANGS.includes(wanted)) return { text: S().languageUsage }
      await setLanguage($, wanted)
      return { text: S().language }
    }
    if (arg === 'fps' || arg.startsWith('fps ')) {
      const n = Number(arg.slice(3).trim())
      if (!Number.isInteger(n) || n < 0 || n > 15) return { text: S().fpsUsage }
      desktopFps = n
      await $.store.set('desktopFps', n)
      $.ui.invalidate('ui.render')
      return { text: S().fps(n) }
    }
    if (arg === 'stats') {
      noteWatch()
      await flushStats($)
      const session = await read($, sessionAtom)
      const all = ((await $.store.get('allTime')) as FeedStats | undefined) ?? EMPTY_STATS
      const top = (Object.entries(session.byKind) as [Kind, { views: number; likes: number; ms: number }][])
        .sort((a, b) => b[1].likes * 60000 + b[1].ms - (a[1].likes * 60000 + a[1].ms))
        .slice(0, 3)
        .map(([k, v]) => `${LABELS[lang][k]} (${v.likes} ♥, ${duration(v.ms)})`)
      const total = { views: all.views + session.views, likes: all.likes + session.likes, ms: all.ms + session.ms, byKind: all.byKind }
      return {
        text: [
          S().statsTitle,
          `  ${statsLine(session)}`,
          top.length ? `  ${S().top}: ${top.join(', ')}` : `  ${S().nothingYet}`,
          `${S().allTime}: ${S().statsLine(total.views, total.likes, duration(total.ms))}`,
        ].join('\n'),
      }
    }
    manual = true
    await clearEndCard($)
    await openFeed($)
    return { text: S().opened }
  })

  on('turn.start', async ($, e, next) => {
    if (e.agentId === undefined && enabled) {
      if (ticker) {
        // A new prompt while the end card shows: the feed plays on for this turn.
        if (await read($, endCardAtom)) {
          await clearEndCard($)
          turn = { views: 0, likes: 0, startedAt: Date.now() }
        }
      } else if (!openTimer) {
        openTimer = $.clock.after(OPEN_DELAY_MS, () => {
          openTimer = undefined
          void openFeed($)
        })
      }
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    const result = await next(e)
    if (e.agentId === undefined) {
      openTimer?.cancel()
      openTimer = undefined
      const mode = await read($, modeAtom)
      if (!manual && mode !== 'off') {
        await showEndCard($)
        if (mode === 'band') $.ui.toast(S().answeredToast)
      }
    }
    return result
  })

  on('ui.close', { id: PANE }, async ($, e, next) => {
    if (e.origin.kind === 'person') {
      stopTicker($)
      manual = false
      menu.isOpen = false
      await clearEndCard($)
      await update($, modeAtom, () => 'off' as FeedMode)
    }
    return next(e)
  })

  on('ui.message', async ($, e, next) => {
    const data = e.data as { tap?: string; x?: number; y?: number; fx?: number; fy?: number; act?: string } | null
    if ((e.module.endsWith('controls.tsx') || e.module.endsWith('tap.tsx')) && data?.act) {
      const act = data.act
      if (act === 'like') await like($)
      else if (act === 'next') await move($, 1)
      else if (act === 'prev') await move($, -1)
      else if (act === 'pause') await togglePause($)
      else if (act === 'nope') await notInterested($)
      else if (act === 'undo') await undoNotInterested($)
      else if (act === 'menu') await toggleMenu($)
      else if (act === 'sheet') await openMenu($, 'sheet')
      else if (act === 'themes') await openMenu($, 'themes')
      else if (act === 'hide') await hidePlayingTheme($)
      else if (act === 'likes' || act === 'settings') await openMenu($, act)
      else if (act === 'help') await toggleHelp($)
      else if (act.startsWith('play:')) await playLiked($, act.slice(5))
      else if (['lang', 'autoopen', 'autoscroll'].includes(act)) await changeSetting($, act)
      else if (act === 'comments') toggleComments($)
      else if (act === 'focus') await toggleFocus($)
      else if (act === 'all') await setHidden($, [])
      else if (act === 'none') await hideAllThemes($)
      else if (act === 'forget') await forgetNotInterested($)
      else if (act.startsWith('theme:') && THEME_LIST.includes(act.slice(6) as Theme)) await toggleTheme($, act.slice(6) as Theme)
      else if (act === 'continue') await keepWatching($)
      else if (act === 'close') await closeFeed($)
      return {}
    }
    if (!e.module.endsWith('tap.tsx') || !data?.tap) return next(e)
    // The first tap of a double tap paused; the second one plays again and likes.
    await togglePause($)
    if (data.tap === 'double') {
      const at =
        data.fx !== undefined && data.fy !== undefined
          ? { x: data.fx * player.W, y: data.fy * player.H }
          : { x: data.x ?? player.W / 2, y: (data.y ?? player.H / 4) * 2 }
      await like($, at)
    }
    return {}
  })

  on('ui.scroll', async ($, e, next) => {
    const isOurs =
      (e.component === 'Pane' && e.requestId === PANE) ||
      (e.component === 'AbovePrompt' && (await read($, modeAtom)) === 'band')
    if (!isOurs || e.origin.kind !== 'person' || e.by === 0) return next(e)
    // The window stays on row 1 (the desktop keeps a spare row above the feed,
    // so the wheel can reach us upward too); the terminal's tree fits, so 0.
    const pinned = { ...e, offset: Math.min(1, Math.max(0, e.contentRows - e.bodyRows)) }
    // The menu scrolls a row a tick.
    if (menu.isOpen) {
      await move($, e.by > 0 ? 1 : -1, 1)
      return next(pinned)
    }
    // A wheel flick sends a burst of ticks: one swipe per flick.
    const now = Date.now()
    if (now - lastSwipe >= SWIPE_COOLDOWN_MS) await swipe($, e.by > 0 ? 1 : -1)
    lastSwipe = now
    return next(pinned)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    if (e.surface === 'terminal') return feedTree($, $.ui.resolve(e), e.requestId, e.props.bodyColumns, e.props.scroll.bodyRows)
    if (e.surface === 'desktop') return desktopTree($, $.ui.resolve(e), e.requestId, e.props.bodyColumns, e.props.scroll.bodyRows)
    const { Text } = $.ui.resolve(e)
    return <Text dimColor>{S().terminalOnly}</Text>
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || (await read($, modeAtom)) !== 'band') return next(e)
    if (e.surface === 'terminal') return feedTree($, $.ui.resolve(e), e.requestId, e.props.bodyColumns, Math.min(e.props.maxRows, 24))
    if (e.surface === 'desktop') return desktopTree($, $.ui.resolve(e), e.requestId, e.props.bodyColumns, e.props.scroll.bodyRows)
    return next(e)
  })
}
