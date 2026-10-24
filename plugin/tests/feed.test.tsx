import { expect, mock, test } from 'claude-code/testing'
import type { Engine, TestBody } from 'claude-code/testing'

import { COMMENTS, LABELS, LANGS, MISSING, STRINGS, THEME_NAMES } from '../hooks/i18n'
import { META } from '../hooks/register'
import { EXTRA_THEMES, THEMES, THEME_OF, themesOf } from '../hooks/themes'
import { MAKERS } from '../hooks/themes'

const PANE = {
  title: 'For you',
  isFocused: false,
  bodyColumns: 80,
  placement: 'dock',
  scroll: { offset: 0, bodyRows: 30 },
  view: {},
} as const

// The test runtime has timers; the engine's types (no DOM, no Node) do not declare them.
declare function setTimeout(fn: () => void, ms: number): unknown

// /brainrot as the person types it in the prompt.
const brainrot = ($: Engine, args: string) =>
  $.command.run({ command: 'brainrot', args, origin: { kind: 'composer' }, presentation: { isFullscreen: false, columns: 120 } })

const KIND_COUNT = Object.keys(META).length

const kindOf = (author: string | undefined) =>
  Object.entries(META).find(([, m]) => author !== undefined && m.authors.includes(author))?.[0]

// It scrolls through every video once: give it the time that takes.
test('likes, scrolls, and shows every kind once before any repeats', { timeoutMs: 20000 }, async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  expect(await ui.find({ key: 'video' })).toBeDefined()
  expect((await ui.find({ key: 'like' }))?.text).toBe('♡')

  await ui.press({ key: 'like' })
  expect((await ui.find({ key: 'like' }))?.text).toBe('♥')

  const seen: (string | undefined)[] = []
  const author = async () => (await ui.find({ type: 'Text', text: /^@/ }))?.text
  seen.push(kindOf(await author()))
  for (let i = 0; i < KIND_COUNT - 1; i++) {
    await ui.press({ key: 'next' })
    seen.push(kindOf(await author()))
  }
  expect(seen.includes(undefined)).toBe(false)
  expect(new Set(seen).size).toBe(KIND_COUNT)

  await ui.press({ key: 'next' })
  const seventeenth = kindOf(await author())
  expect(seventeenth).not.toBe(seen[KIND_COUNT - 1])

  expect((await ui.find({ key: 'like' }))?.text).toBe('♡')
  await ui.pointer({ type: 'down', x: 5, y: 5, button: 'left', in: 'tap' })
  await ui.pointer({ type: 'up', x: 5, y: 5, button: 'left', in: 'tap' })
  await ui.pointer({ type: 'down', x: 5, y: 5, button: 'left', in: 'tap' })
  expect((await ui.find({ key: 'like' }))?.text).toBe('♥')
  await ui.unmount()
})

test('scrolling back resumes a video without counting it twice', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const first = (await ui.find({ type: 'Text', text: /^@/ }))?.text
  await ui.press({ key: 'next' })
  await ui.press({ key: 'prev' })
  expect((await ui.find({ type: 'Text', text: /^@/ }))?.text).toBe(first)

  const stats = await brainrot($, 'stats')
  expect(stats.text).toContain('2 videos')
  await ui.unmount()
})

test('the feed speaks French on request', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  expect((await brainrot($, 'lang fr')).text).toBe('Langue : français.')
  expect((await brainrot($, '')).text).toContain('Feed ouvert')
  expect((await brainrot($, 'lang en')).text).toBe('Language: English.')
})

test('the feed plays, likes and scrolls on the terminal and the desktop app', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))
  await brainrot($, '')

  const terminal = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  expect(await terminal.find({ type: 'Raster' })).toBeDefined()
  await terminal.press({ key: 'next' })
  expect((await terminal.find({ key: 'like' }))?.text).toBe('♡')
  await terminal.press({ key: 'like' })
  expect((await terminal.find({ key: 'like' }))?.text).toBe('♥')
  await terminal.unmount()

  // The desktop's controls are a Client: a click on its rows, or a key once clicked.
  const desktop = await $.ui.mount({ plugin: 'brainrot-break', surface: 'desktop', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  expect(await desktop.find({ type: 'Svg' })).toBeDefined()
  const heart = async () => ((await desktop.find({ key: 'controls' }))?.props.props as { rows: { text: string }[] }).rows[2]?.text
  expect(await heart()).toBe('♥')
  await desktop.pointer({ type: 'down', x: 3, y: 10, button: 'left', in: 'controls' })
  expect(await heart()).toBe('♡')
  await desktop.pointer({ type: 'down', x: 3, y: 2, button: 'left', in: 'controls' })
  expect(await heart()).toBe('♥')
  await desktop.key({ key: 'l', in: 'controls' })
  expect(await heart()).toBe('♡')

  // ⊘ is a row of the controls, ··· one of its own above them, and the menu's rows take clicks
  const author = async () => (await desktop.find({ type: 'Text', text: /^@/ }))?.text
  const before = await author()
  await desktop.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'controls' })
  expect(await author()).not.toBe(before)
  expect(await desktop.find({ key: 'undo' })).toBeDefined()
  await desktop.pointer({ type: 'down', x: 3, y: 0, button: 'left', in: 'more' })
  expect(await desktop.find({ key: 'menu' })).toBeDefined()
  expect(await desktop.find({ type: 'Svg' })).toBeUndefined()
  const sheet = ((await desktop.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows
  await desktop.pointer({ type: 'down', x: 3, y: sheet.findIndex(r => r.act === 'menu'), button: 'left', in: 'menu' })
  expect(await desktop.find({ type: 'Svg' })).toBeDefined()
  await desktop.unmount()

  expect((await brainrot($, 'fps 0')).text).toContain('frozen')
  expect((await brainrot($, 'fps 99')).text).toContain('Usage')
  expect((await brainrot($, 'fps 10')).text).toContain('10 frames')
})

test('every video has a name, captions and sounds in every language, and no TODO left', async () => {
  // the feed tells videos apart by their authors, so a handle belongs to one kind
  const handles = Object.values(META).flatMap(m => m.authors)
  expect(handles.filter((a, i) => handles.indexOf(a) !== i)).toEqual([])
  expect(Object.keys(META).sort()).toEqual(Object.keys(MAKERS).sort())
  for (const kind of Object.keys(MAKERS) as (keyof typeof MAKERS)[]) {
    const meta = META[kind]
    expect(meta).toBeDefined()
    expect(meta.authors.length).toBeGreaterThan(0)
    for (const lang of LANGS) {
      expect(LABELS[lang][kind]).toBeDefined()
      expect(meta.captions[lang].length).toBe(meta.captions.en.length)
      expect(meta.sounds[lang].length).toBe(meta.sounds.en.length)
    }
    expect(JSON.stringify([meta.authors, meta.tags, meta.captions.en, meta.captions.fr, meta.sounds.en, meta.sounds.fr, LABELS.en[kind], LABELS.fr[kind]])).not.toContain('TODO')
  }
})

test('every kind has exactly one home theme, and its extra themes are real and different', async () => {
  const listed = [...Object.values(THEMES).flatMap(makers => Object.keys(makers))]
  expect(listed.filter((k, i) => listed.indexOf(k) !== i)).toEqual([])
  expect(listed.sort()).toEqual(Object.keys(MAKERS).sort())
  for (const [kind, extras] of Object.entries(EXTRA_THEMES)) {
    expect(Object.keys(MAKERS)).toContain(kind)
    for (const t of extras) {
      expect(Object.keys(THEMES)).toContain(t)
      expect(t).not.toBe(THEME_OF[kind])
    }
  }
})

type MenuRow = { text: string; act?: string }

test('the theme menu hides themes, keeps the last one, and shows them all again', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  await brainrot($, '')
  // a pane tall enough to list every theme at once (a shorter one scrolls)
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: { ...PANE, scroll: { offset: 0, bodyRows: 60 } } })
  const author = async () => (await ui.find({ type: 'Text', text: /^@/ }))?.text
  const rows = async () => ((await ui.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows
  const click = (y: number) => ui.pointer({ type: 'down', x: 1, y, button: 'left', in: 'menu' })
  const choose = async (act: string) => click((await rows()).findIndex(r => r.act === act))

  // ··· opens the sheet on the playing clip; "Hide #theme" hides its theme and moves on
  // the open menu covers the caption: read the author first
  const playing = THEME_OF[kindOf(await author()) ?? '']
  await ui.press({ key: 'themes' })
  expect(await ui.find({ key: 'video' })).toBeUndefined()
  await choose('hide')
  expect(await ui.find({ key: 'video' })).toBeDefined()
  // shown because another of its themes is ticked
  expect(themesOf(kindOf(await author()) ?? '').some(t => t !== playing)).toBe(true)
  await ui.press({ key: 'themes' })
  await choose('themes')
  expect((await rows()).find(r => r.act === `theme:${playing}`)?.text.startsWith('✗')).toBe(true)
  await choose('all')

  const themeRows = (await rows()).map((r, y) => ({ ...r, y })).filter(r => r.act?.startsWith('theme:'))
  expect(themeRows.length).toBe(Object.keys(THEMES).length)
  for (const r of themeRows) await click(r.y)
  // the last one stays on
  const kept = themeRows[themeRows.length - 1] as MenuRow & { y: number }
  const after = await rows()
  expect(after[kept.y]?.text.startsWith('✓')).toBe(true)
  expect(themeRows.slice(0, -1).every(r => after[r.y]?.text.startsWith('✗'))).toBe(true)

  await ui.press({ key: 'themes' })
  expect(await ui.find({ key: 'video' })).toBeDefined()
  const theme = kept.act?.slice('theme:'.length)
  for (let i = 0; i < 12; i++) {
    await ui.press({ key: 'next' })
    expect(themesOf(kindOf(await author()) ?? '')).toContain(theme)
  }

  await ui.press({ key: 'themes' })
  await choose('themes')
  await choose('all')
  expect((await rows()).filter(r => r.act?.startsWith('theme:')).every(r => r.text.startsWith('✓'))).toBe(true)
  // hide all keeps one on
  await choose('none')
  expect((await rows()).filter(r => r.act?.startsWith('theme:') && r.text.startsWith('✓')).length).toBe(1)
  await choose('all')
  await ui.press({ key: 'themes' })
  await ui.unmount()
})

test('not interested lowers the weights, never below the floor, and undo puts them back', async ($, on) => {
  const clock = mock.clock(on)
  const saved = ownStore(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const author = async () => (await ui.find({ type: 'Text', text: /^@/ }))?.text
  const scores = async () => (saved.scores ?? {}) as Record<string, number>
  const themeScores = async () => (saved.themeScores ?? {}) as Record<string, number>

  const first = kindOf(await author()) ?? ''
  const before = (await scores())[first]
  await ui.press({ key: 'nope' })
  expect(kindOf(await author())).not.toBe(first)
  expect(await ui.find({ key: 'undo' })).toBeDefined()
  expect((await scores())[first]).toBe(Math.max(0.2, (before ?? 1) * 0.5))
  expect((await themeScores())[THEME_OF[first] ?? '']).toBeLessThan(1)

  await ui.press({ key: 'undo' })
  expect((await scores())[first]).toBe(before)
  expect(await ui.find({ key: 'undo' })).toBeUndefined()

  for (let i = 0; i < 60; i++) await ui.press({ key: 'nope' })
  expect(Math.min(...Object.values(await scores()))).toBeGreaterThanOrEqual(0.2)
  expect(Math.min(...Object.values(await themeScores()))).toBeGreaterThanOrEqual(0.2)
  expect(await ui.find({ key: 'undo' })).toBeDefined()
  await clock.advance(5000)
  expect(await ui.find({ key: 'undo' })).toBeUndefined()
  await ui.unmount()
})

// The mod's store kept by the test itself, so it can read back what was saved.
function ownStore(on: Parameters<TestBody>[1]) {
  const saved: Record<string, unknown> = {}
  on('store.get', ($, e) => ({ value: saved[e.key] }))
  on('store.set', ($, e) => {
    saved[e.key] = e.value
    return { value: undefined }
  })
  on('store.delete', ($, e) => {
    delete saved[e.key]
    return { value: undefined }
  })
  on('store.keys', () => ({ value: Object.keys(saved) }))
  return saved
}

test('comments open under the caption and close on the next video', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  expect(await ui.find({ type: 'Text', text: /comments$/ })).toBeUndefined()
  await ui.press({ key: 'comments' })
  expect(await ui.find({ type: 'Text', text: /comments$/ })).toBeDefined()
  await ui.press({ key: 'next' })
  expect(await ui.find({ type: 'Text', text: /comments$/ })).toBeUndefined()
  await ui.unmount()
})

test('a liked video can be watched again from the menu', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const author = async () => (await ui.find({ type: 'Text', text: /^@/ }))?.text
  const rows = async () => ((await ui.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows
  const choose = async (act: (a: string) => boolean) =>
    ui.pointer({ type: 'down', x: 1, y: (await rows()).findIndex(r => r.act !== undefined && act(r.act)), button: 'left', in: 'menu' })

  const liked = await author()
  await ui.press({ key: 'like' })
  for (let i = 0; i < 3; i++) await ui.press({ key: 'next' })
  expect(await author()).not.toBe(liked)

  await ui.press({ key: 'themes' })
  await choose(a => a === 'likes')
  await choose(a => a.startsWith('play:'))
  expect(await ui.find({ key: 'video' })).toBeDefined()
  expect(await author()).toBe(liked)
  expect((await ui.find({ key: 'like' }))?.text).toBe('♥')
  await ui.unmount()
})

test('settings in the menu: the language, and the next video by itself', async ($, on) => {
  const clock = mock.clock(on)
  const saved = ownStore(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const author = async () => (await ui.find({ type: 'Text', text: /^@/ }))?.text
  const rows = async () => ((await ui.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows
  const choose = async (act: string) => ui.pointer({ type: 'down', x: 1, y: (await rows()).findIndex(r => r.act === act), button: 'left', in: 'menu' })

  await ui.press({ key: 'themes' })
  await choose('settings')
  // each click moves to the next language, round to English again
  await choose('lang')
  expect(saved.language).toBe('fr')
  expect((await rows()).some(r => r.text.startsWith('Langue'))).toBe(true)
  await choose('lang')
  expect(saved.language).toBe('es')
  expect((await rows()).some(r => r.text.startsWith('Idioma'))).toBe(true)
  for (let i = 0; i < LANGS.length - 2; i++) await choose('lang')
  expect(saved.language).toBe('en')
  await choose('autoscroll')
  expect(saved.autoScroll).toBe(true)
  await ui.press({ key: 'themes' })

  const first = await author()
  await clock.advance(66 * 310)
  expect(await author()).not.toBe(first)
  await ui.unmount()
})

test('a quick skip lowers the kind and its theme a little, and scrolling back undoes it', async ($, on) => {
  mock.clock(on)
  const saved = ownStore(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const kind = kindOf((await ui.find({ type: 'Text', text: /^@/ }))?.text) ?? ''
  const theme = THEME_OF[kind] ?? ''
  const scores = () => (saved.scores ?? {}) as Record<string, number>
  const themeScores = () => (saved.themeScores ?? {}) as Record<string, number>
  const before = { kind: scores()[kind], theme: themeScores()[theme] }

  await ui.press({ key: 'next' })
  expect(scores()[kind]).toBeLessThan(before.kind ?? 1)
  expect(themeScores()[theme]).toBeLessThan(before.theme ?? 1)
  await ui.press({ key: 'prev' })
  expect(scores()[kind]).toBe(before.kind)
  expect(themeScores()[theme]).toBe(before.theme)
  await ui.unmount()
})

test('a click on the hashtags keeps the feed to that theme until it is closed', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const theme = async () => THEME_OF[kindOf((await ui.find({ type: 'Text', text: /^@/ }))?.text) ?? '']
  const themes = async () => themesOf(kindOf((await ui.find({ type: 'Text', text: /^@/ }))?.text) ?? '')

  // the caption's rows of parts: a click on its words does nothing, one on its hashtags focuses
  const caption = async () => ((await ui.find({ key: 'caption' }))?.props.props as { rows: { parts?: { text: string; act?: string }[] }[] }).rows
  const clickPart = async (isTag: boolean) => {
    for (const [y, row] of (await caption()).entries()) {
      let x = 0
      for (const part of row.parts ?? []) {
        if ((part.act === 'focus') === isTag && part.text.trim()) return ui.pointer({ type: 'down', x, y, button: 'left', in: 'caption' })
        x += [...part.text].length
      }
    }
    throw new Error('no such part drawn')
  }

  const focused = await theme()
  expect(await ui.find({ key: 'unfocus' })).toBeUndefined()
  await clickPart(false)
  expect(await ui.find({ key: 'unfocus' })).toBeUndefined()
  await clickPart(true)
  expect(await ui.find({ key: 'unfocus' })).toBeDefined()
  for (let i = 0; i < 8; i++) {
    await ui.press({ key: 'next' })
    expect(await themes()).toContain(focused)
  }
  await ui.press({ key: 'unfocus' })
  expect(await ui.find({ key: 'unfocus' })).toBeUndefined()
  const after = new Set<string | undefined>()
  for (let i = 0; i < 8; i++) {
    await ui.press({ key: 'next' })
    after.add(await theme())
  }
  expect(after.size).toBeGreaterThan(1)
  await ui.unmount()
})

test('every language is complete: the interface, the themes, the comments and every video', async () => {
  for (const lang of LANGS) {
    expect(Object.keys(STRINGS[lang]).sort()).toEqual(Object.keys(STRINGS.en).sort())
    expect(Object.keys(THEME_NAMES[lang]).sort()).toEqual(Object.keys(THEMES).sort())
    expect(COMMENTS.generic[lang].length).toBe(COMMENTS.generic.en.length)
    for (const theme of Object.keys(THEMES) as (keyof typeof THEMES)[])
      expect(COMMENTS.themes[theme][lang].length).toBe(COMMENTS.themes[theme].en.length)
  }
  expect(MISSING).toEqual({ es: [], de: [], pt: [], it: [] })
})

test('the ? key shows the shortcuts, and again closes them', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  expect((await brainrot($, 'lang es')).text).toBe('Idioma: español.')
  expect((await brainrot($, 'lang en')).text).toBe('Language: English.')
  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  await ui.press({ key: 'help' })
  const rows = ((await ui.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows
  expect(rows[0]?.text).toBe('Shortcuts')
  expect(rows.some(r => r.text.startsWith('n ⊘'))).toBe(true)
  await ui.press({ key: 'help' })
  expect(await ui.find({ key: 'video' })).toBeDefined()
  await ui.unmount()
})

test('once a click on the video has paused it, the keys still work', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const author = async () => (await ui.find({ type: 'Text', text: /^@/ }))?.text
  const first = await author()
  // the click gives the video's layer the keyboard
  await ui.pointer({ type: 'down', x: 5, y: 5, button: 'left', in: 'tap' })
  await ui.key({ key: 'j', in: 'tap' })
  expect(await author()).not.toBe(first)
  await ui.key({ key: 'l', in: 'tap' })
  expect((await ui.find({ key: 'like' }))?.text).toBe('♥')
  await ui.key({ key: '?', in: 'tap' })
  expect(((await ui.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows[0]?.text).toBe('Shortcuts')
  await ui.unmount()
})

test('taking a like back takes back what it raised', async ($, on) => {
  mock.clock(on)
  const saved = ownStore(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const kind = kindOf((await ui.find({ type: 'Text', text: /^@/ }))?.text) ?? ''
  const scores = () => (saved.scores ?? {}) as Record<string, number>
  const themeScores = () => (saved.themeScores ?? {}) as Record<string, number>
  for (let i = 0; i < 4; i++) await ui.press({ key: 'like' })
  expect(Math.abs((scores()[kind] ?? 1) - 1)).toBeLessThan(1e-9)
  for (const t of themesOf(kind)) expect(Math.abs((themeScores()[t] ?? 1) - 1)).toBeLessThan(1e-9)
  await ui.unmount()
})

test('ticking a theme brings every video that has it, from whichever home', async ($, on) => {
  mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))

  await brainrot($, '')
  const ui = await $.ui.mount({ plugin: 'brainrot-break', surface: 'terminal', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const kind = async () => kindOf((await ui.find({ type: 'Text', text: /^@/ }))?.text) ?? ''
  const rows = async () => ((await ui.find({ key: 'menu' }))?.props.props as { rows: MenuRow[] }).rows
  // the menu shows the rows that fit: scroll it to the row before clicking it, down then back up
  const choose = async (act: string) => {
    for (let i = 0; i < 20 && !(await rows()).some(r => r.act === act); i++) await ui.press({ key: 'next' })
    for (let i = 0; i < 20 && !(await rows()).some(r => r.act === act); i++) await ui.press({ key: 'prev' })
    await ui.pointer({ type: 'down', x: 1, y: (await rows()).findIndex(r => r.act === act), button: 'left', in: 'menu' })
  }

  // the open menu covers the caption: read the author first
  const kept = THEME_OF[await kind()] as string
  await ui.press({ key: 'themes' })
  await choose('themes')
  await choose('none')
  // robots only: tick it, untick the one hide all kept
  if (kept !== 'robots') {
    await choose('theme:robots')
    await choose(`theme:${kept}`)
  }
  await ui.press({ key: 'themes' })
  const seen = new Set<string>()
  for (let i = 0; i < 12; i++) {
    await ui.press({ key: 'next' })
    const k = await kind()
    expect(themesOf(k)).toContain('robots')
    seen.add(k)
  }
  // the robot arm, the warehouse robots... not only the robot vacuum
  expect([...seen].some(k => k !== 'robovac')).toBe(true)
  await ui.unmount()
})

test('on the desktop, the wheel goes back up to the previous video', async ($, on) => {
  const clock = mock.clock(on)
  mock.store(on)
  on('ui.open', () => ({ value: { isPlaced: true as const } }))
  on('ui.close', () => ({ value: undefined }))

  // the engine's own scroll, beneath the mod: the window moves where it is told
  // (a call on $ is answered as { value }, which the hook's own type does not spell)
  on('ui.scroll', () => ({ value: {} }) as never)
  await brainrot($, '')
  const desktop = await $.ui.mount({ plugin: 'brainrot-break', surface: 'desktop', component: 'Pane', requestId: 'brainrot-break', props: PANE })
  const author = async () => (await desktop.find({ type: 'Text', text: /^@/ }))?.text
  // the desktop tree keeps a spare row above the feed, so a tick upward can arrive
  const wheel = (by: number) =>
    $.ui.scroll({ component: 'Pane', requestId: 'brainrot-break', offset: 1 + by, by, bodyRows: 30, contentRows: 32, origin: { kind: 'person' } })
  const first = await author()
  await wheel(1)
  expect(await author()).not.toBe(first)
  // one swipe per wheel flick: the next flick comes after the cooldown, in real time
  await new Promise(resolve => setTimeout(() => resolve(undefined), 400))
  await clock.advance(1000)
  await wheel(-1)
  expect(await author()).toBe(first)
  await desktop.unmount()
})
