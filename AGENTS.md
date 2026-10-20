# brainrot-break: notes for agents

brainrot-break is a Claude Code mod (a plugin of function hooks): a TikTok-style feed of pixel art mini-videos that opens while Claude answers. Every video is a small simulation written in TypeScript and drawn locally. It uses no tokens and calls no model. It plays in the Claude Code terminal and in the Claude desktop app, in English by default, or in French, Spanish, German, Portuguese or Italian.

## Layout

| Path | What it holds |
| --- | --- |
| `.claude-plugin/plugin.json` | The manifest: name, version, the `language` option (`userConfig`) |
| `.claude-plugin/marketplace.json` | Makes the repository installable: `/plugin install brainrot-break --marketplace BordyV/brainrot-break` |
| `hooks/hooks.json` | Names the hooks module, `register.tsx` |
| `hooks/register.tsx` | The mod: hooks, the feed, the player, likes, scrolling, stats, the end card, commands, both surfaces' drawing |
| `hooks/draw.ts` | The `Maker` contract, the seeded random generator, the drawing helpers, and the heart and progress bar overlays |
| `hooks/themes/` | Every video, one file per theme (`sports.ts`, `dev.ts`...). `index.ts` gathers them in `THEMES` and `MAKERS` (every video by kind). New videos go here |
| `hooks/texts/` | The texts of the theme videos, one file per theme under the same names: each kind's name, authors, tags, captions and sounds. `index.ts` gathers them in `THEME_TEXTS` |
| `hooks/kit.ts` | Shared helpers for the theme videos (below) |
| `hooks/locales/` | The other languages (`es`, `de`, `pt`, `it`), one folder each: `ui.ts` (the interface, theme names, comments), then one file per theme of video texts, gathered in `videos.ts` by `tools/sync-locales.ts` |
| `hooks/i18n.ts` | Every text the user reads, in English and French (the other languages are merged in from `hooks/locales/`), and each video's authors, tags, captions and sounds (`META`) and name (`LABELS`). The theme texts are merged in from `hooks/texts/` |
| `hooks/cells.ts` | Frame encoders: Raster cells (terminal) and SVG (desktop) |
| `hooks/tap.tsx` | The `Client` over the video, on both surfaces: one click pauses, a double click likes, and once clicked it takes the feed's keys |
| `hooks/keys.ts` | The keys both `Client` modules turn into actions |
| `hooks/controls.tsx` | A `Client` of clickable rows: the desktop's side column and end card, the ··· menu and the caption (whose hashtags take a click), on both surfaces |
| `types/index.d.ts` | The `Kind` union, the `Video` type, and the `$.state` contract. The engine refuses imports in this file, so every kind is written out literally: `tools/sync-kinds.ts` keeps the list in step |
| `tests/feed.test.tsx` | `claude plugin test` tests |
| `tools/` | Scripts run with `npx tsx` (below) |
| `.github/workflows/check.yml` | CI: the kinds check, the translations check and the offline render, the parts of `check.ts` that need no Claude Code session |
| `docs/` | Two lists of 500 scored video ideas (`video-ideas.md`, `video-ideas-2.md`). The second one writes the score out as points per criterion; score new ideas the same way. Pick the next videos from there |
| `assets/preview.png` | The README's picture of every video, written by `tools/render.ts` |
| `assets/feed.gif` | The README's moving picture, written by `tools/gif.ts` |
| `CHANGELOG.md` | What each version changed. Add an entry with each version bump |

## Commands

Run from the repository root.

| Command | What it does |
| --- | --- |
| `npx tsx tools/check.ts` | Everything before a commit: type-check, validate, tests, render. Stops at the first failure |
| `npx tsx tools/render.ts` | Runs every video 600 frames offline, prints ms per frame and SVG sizes, rewrites `assets/preview.png` |
| `npx tsx tools/render.ts <kind>` | One video over 32 s, frames side by side in `tools/out/<kind>.png` (git-ignored). Look at it |
| `npx tsx tools/render.ts <theme>` | Every video of a theme, one row each, in `tools/out/<theme>.png`, with each one's time and SVG size. Several kinds or themes can be given |
| `npx tsx tools/gif.ts [kind...]` | Rewrites `assets/feed.gif`: six videos playing side by side, or the kinds given |
| `npx tsx tools/sync-locales.ts` | Rewrites each `hooks/locales/<lang>/videos.ts` from its theme files and lists the videos a language lacks. `--check` only lists them; `check.ts` runs it |
| `npx tsx tools/sync-kinds.ts` | Adds the theme kinds missing from the `Kind` union. `--check` only reports them; `check.ts` runs it first |
| `npx tsx tools/new-video.ts <theme> <kind> "<English name>" "<French name>"` | Scaffolds a new video (below) |
| `claude plugin validate .` / `claude plugin test .` | The engine's own checks, also run by `check.ts` |

Type-checking needs `.claude-plugin/types/`, which the engine writes (git-ignored) when it hot-reloads the mod. If it is missing, `check.ts` skips the step and says so: run `claude --plugin-dir .` here once in an interactive session to get it. Always pass `--noEmit` to `tsc`. Without the engine's tsconfig, a bare `tsc -p .` writes `.js` files next to the sources, and those would then shadow the modules.

## Trying a change in a real session

`claude --plugin-dir .` starts a session with this folder loaded, and hot-reloads the mod on save. An install from a marketplace is a copy, cached by version under `~/.claude/plugins/cache/`, and `/reload-plugins` reloads that copy, not the folder. To try a change through an install (from a marketplace added on a local clone), bump `version` in `.claude-plugin/plugin.json`, run `claude plugin update brainrot-break@<marketplace>` (it copies the folder again), then `/reload-plugins` or restart. No push is needed.

To exercise the feed, open it with `/brainrot`, or ask something that keeps Claude busy for more than 2.5 s. A shell command that waits, such as `ping -n 31 127.0.0.1 > /dev/null` on Windows, keeps a turn alive for 30 s where `sleep` is blocked.

## Rules

- English everywhere: code, comments, docs, commits. Every text the user sees goes through `hooks/i18n.ts`, in every language (`en` and `fr` there, the others in `hooks/locales/`), with the same number of lines in each list.
- Use LF line endings (`.gitattributes` enforces it). On Windows, Python's text mode writes CRLF. Edit files with the editor tools, or write with `newline=''`.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/): `type(scope): summary`, the summary in the imperative and lowercase, no full stop. Types: `feat` (a new video or feature), `fix`, `perf`, `refactor`, `docs`, `test`, `ci`, `chore`. The scope is optional: a theme (`feat(sports): add bowling`), a surface (`fix(desktop): ...`) or a part (`i18n`, `menu`, `tools`). A breaking change takes `!` after the type and a `BREAKING CHANGE:` footer. The body says why, in plain sentences.
- Versions follow [Semantic Versioning](https://semver.org/), from the commits since the last release: `feat` bumps the minor, `fix` and `perf` the patch, a breaking change the major. A release is a `chore(release): x.y.z` commit that bumps `version` in `.claude-plugin/plugin.json` and adds the version's entry to `CHANGELOG.md`.
- Commit locally. Push only when the user says so.
- Before a push: `tools/check.ts`, then the plugin-authoring skill's secret scan (`mcp__plugin-authoring__scan_secrets` on this folder). Keep the README's video list and `assets/preview.png` in step with the videos.
- Nothing personal or machine-specific goes in the repository: no local paths, names, accounts or keys.

## Adding a video

1. **Scaffold it:** `npx tsx tools/new-video.ts sports bowling "bowling" "bowling"`. This adds `'bowling'` to `Kind` in `types/index.d.ts`, a placeholder simulation (a bouncing dot) to `hooks/themes/sports.ts` and its table, and an entry to `hooks/texts/sports.ts` with the names and TODO lines. The kind is an internal id: lowercase letters and digits, never shown to the user, and unique across every theme. A new theme is two new files, `hooks/themes/<theme>.ts` and `hooks/texts/<theme>.ts`, each added to its folder's `index.ts`.
2. **Write the simulation** where the scaffold left `TODO: the simulation`. The contract is below.
3. **Look at it:** `npx tsx tools/render.ts bowling`, then open `tools/out/bowling.png`. Iterate until it looks good at 32 × 56 pixels. Expect to iterate: a first version is often too sparse, too blurry, too fast or too small.
4. **Fill its texts:** in `hooks/texts/<theme>.ts`, write 3 author handles, 3 tag lines, 4 captions and 3 sounds. Captions and sounds come in both `en` and `fr`, the same number of lines in the same order, because a video stores indexes into these lists and switching language retranslates it. Author handles must be unique across every video: the feed tells kinds apart by them, and a test checks it. The tone is TikTok: short, playful, a hook ("wait for it..."). The tests fail while any TODO is left.
5. **Translate it:** in `hooks/locales/<lang>/<theme>.ts` for `es`, `de`, `pt` and `it`, its name, the 4 captions and the 3 sounds, in the same order as English (create the file if the theme has none there, then run `npx tsx tools/sync-locales.ts`). The tests fail while a language lacks it.
6. **Check everything:** `npx tsx tools/check.ts`. The tests check that every kind shows up once before any repeats, that every video has a name, captions and sounds in every language, that author handles are unique, and that every kind has its texts.
7. **Publish it:** add the video to the README's list, in the family it belongs to. `render.ts` has already redrawn `assets/preview.png`. Commit, and push when the user says so.

### The simulation contract

A video is a `Maker`: `(W, H, rng) => { step(), draw(px) }`.

- `px` is a `Uint32Array` of `W * H` pixels, row by row, each `0x00RRGGBB`. `draw` must paint all of them every frame, because the buffer is reused. Start from a background (`sky(...)`, `px.fill(...)`).
- `step()` advances one frame. The feed calls it 15 times a second. Keep movement in pixels per frame, about 0.2 to 1.5.
- The size is usually 32 × 56 (9:16), but the terminal sizes the clip to the pane. Derive every position and size from `W` and `H`, and keep it working down to about 12 × 16.
- Use `rng` (seeded per video) instead of `Math.random`, so a clip is reproducible and the preview stable.
- The bottom pixel row is the progress bar, and like hearts are drawn over the middle and lower right. Keep scores and text to the top corners, as the other videos do (`text(...)`).
- Budget: under 1 ms a frame (the slowest today take about 0.3), and under 131,072 characters of SVG per frame, which is the desktop's limit. The SVG has one rectangle per horizontal run of one colour, so per-pixel noise and dithering cost the most (the rainy window, at about 38 k, is the largest). `render.ts` prints both numbers and fails above the SVG limit.
- `draw` can be called before the first `step`, so the starting state must already draw. Never call `rng` in `draw`: the terminal and the desktop draw at different rates, so it would change the clip. For noise in `draw`, use `hash(x, y, seed)`.
- Helpers in `hooks/draw.ts`: `rgb`, `mix`, `add`, `scale`, `hsv`, `rect`, `dot`, `disc`, `sprite` (ASCII art rows mapped to colours), `text`, `sky` (vertical gradient). `text` knows the digits, `D V Z` and `+ - x % : ! ? . /`.
- Helpers in `hooks/kit.ts`: maths (`clamp`, `lerp`, `irand`, `pick`, `shuffle`, `hash`, `rot`, `DIRS`), drawing (`line`, `ring`, `ellipse`, `poly`, `tint`, `shade`, `textWidth`), balls (`Ball`, `wallCircle`, `hitSeg`, `collide`, `keepSpeed`, `shiny`) and sparks (`Spark`, `burst`, `sparks`).
- A video can loop or reset itself. Games that play themselves need a bot that mostly wins, with the odd failure for drama (see `geodash` and `snake`).

## How the mod works (and its traps)

- **Lifecycle:** `turn.start` on the main loop arms a 2.5 s timer that opens the pane (`$.ui.open`). Opened unasked, the pane needs 144 terminal columns, or 110 once the user has opened it themselves; when it cannot be placed, the feed plays in the band above the prompt. At `turn.complete`, the end card shows (`endCard` state) and closes the feed after 15 s. A feed opened with `/brainrot` is manual and stays open.
- **The player:** module variables in `register.tsx`, so a hot reload restarts the clip. The 8 most recent clips keep their simulation (`kept`), so scrolling back resumes them. Kinds come from a shuffle bag: a kind joins each round with a chance its weight gives (its score times its theme's, 0.2 to 6; 1 and up: always), never the same twice in a row, liked kinds earlier. Likes raise the score (and a little the theme's), ⊘ and quick skips lower both, and the theme menu's hidden themes stay out of the bag, as does every other theme while a click on a caption's hashtags holds the feed to one (`focus`). Every video has a home theme, where its code and texts live (`THEME_OF` in `hooks/themes/index.ts`), and may have others (`EXTRA_THEMES`; `themesOf` gives them all). A video shows as soon as one of its themes is ticked in the theme list, and a hashtag focus on any of its themes shows it; and a theme score change (⊘, likes, quick skips) touches all of them; its weight takes their mean. The ··· menu (its pages: the sheet, themes, likes, settings), the ⊘ notice and the open comments are module variables too (`menu`, `lessOf`, `commentsFor`). The comments come from `COMMENTS` in `hooks/i18n.ts`: generic ones and three per theme, picked from the clip's seed.
- **A render hook never writes state:** the engine denies it. Views and watch time noted while drawing wait in `pending`, and the timer or a handler writes them (`flushStats`).
- **Terminal:** a `Raster` of `▀` cells, two pixels per cell, repainted 15 times a second with `$.ui.blit`, with no render pass. Buttons and hotkeys work, and `tap.tsx` gives click-to-pause and double-click-to-like.
- **Captions:** both surfaces draw the caption in a `controls.tsx` Client, as rows of parts (`captionRows`), so the hashtags at its end take a click by column.
- **Desktop app:** there is no `Raster` there. Each frame is an `Svg` (`svgFrame`) and the pane is redrawn with `$.ui.invalidate`, up to 10 times a second (`/brainrot fps 0-15`). Three desktop quirks were found by testing in the app:
  - Mouse presses on `Button`s are dropped ("ui_press not handled" in `%LOCALAPPDATA%\Claude\logs\claude.ai-web.log`), while Tab and Enter work. This happens even with the video frozen. So the desktop's controls are rows of the `controls.tsx` Client, which takes the pointer and posts the action (`ui.message`).
  - The wheel only reaches `ui.scroll` when the pane has something to scroll. The desktop tree is two rows taller than the pane (`minHeight = bodyRows + 2`), with a spare row above the feed, so the wheel has room both ways; the `ui.scroll` hook swipes and keeps the window on row 1.
  - The `Svg` receives no clicks, so a transparent `Client` (`tap.tsx`, as in the terminal) lies over it for tap-to-pause and double-tap. Size it in cells, computed from the Svg's pixels (about 8 × 16 a cell): sized in percent, its region came out empty and no click reached it.
- **State:** `$.state` values are declared in `types/index.d.ts` (`PluginState['brainrot-break']`). `$.store` keys: `enabled`, `scores`, `themeScores`, `hiddenThemes`, `likedVideos`, `autoScroll`, `language`, `desktopFps`, `lastSession`, `allTime`.
- **Commands:** `/brainrot` (open), `on`, `off`, `stats`, `lang en|fr|es|de|pt|it`, `fps 0-15`. Changing the language registers `/brainrot` again, so its description follows.
