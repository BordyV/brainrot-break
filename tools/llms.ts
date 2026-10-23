// Writes the project page's llms.txt (https://llmstxt.org): what the mod is,
// how to install it, where its docs are, and every video by theme, each linked
// to the page playing it. tools/site.ts calls it, so the list follows the videos.

import { LABELS, THEME_NAMES } from '../plugin/hooks/i18n'
import { MAKERS, THEMES } from '../plugin/hooks/themes'
import type { Theme } from '../plugin/hooks/themes'
import type { Kind } from '../plugin/types'

const PAGE = 'https://bordyv.github.io/brainrot-break/'
const REPO = 'https://github.com/BordyV/brainrot-break'
const RAW = 'https://raw.githubusercontent.com/BordyV/brainrot-break/main'

export function llmsTxt(): string {
  const themes = (Object.keys(THEMES) as Theme[]).map(theme => {
    const kinds = Object.keys(THEMES[theme]) as Kind[]
    const videos = kinds.map(k => `[${LABELS.en[k]}](${PAGE}#${k})`).join(', ')
    return `- ${THEME_NAMES.en[theme]} (${kinds.length}): ${videos}`
  })
  return `# brainrot-break

> A Claude Code mod: a TikTok-style feed of ${Object.keys(MAKERS).length} pixel art mini-videos that opens while Claude answers, in the Claude Code terminal and the Claude desktop app. Every video is a small simulation drawn locally: it uses no tokens and calls no model.

The feed opens by itself when an answer takes more than about 2.5 s, and shows an end card when Claude has answered. Scroll, like, mark a video "not interested", or keep only some themes: the feed learns what to show. It speaks English, French, Spanish, German, Portuguese and Italian. It needs Claude Code 2.1.305 or later. MIT licence.

Install, at the prompt of a Claude Code session:

\`\`\`
/plugin marketplace add BordyV/brainrot-break
/plugin install brainrot-break@brainrot-break
\`\`\`

Commands: \`/brainrot\` opens the feed, \`/brainrot on|off\` turns the automatic opening on or off, \`/brainrot stats\` shows what you watched, \`/brainrot lang en|fr|es|de|pt|it\` sets the language, \`/brainrot fps 0-15\` sets the desktop app's frame rate.

## Docs

- [README](${RAW}/README.md): install, controls, commands, the list of videos
- [AGENTS.md](${RAW}/AGENTS.md): how the mod is built, and how to add a video
- [CHANGELOG](${RAW}/CHANGELOG.md): what each version changed

## Links

- [Project page](${PAGE}): every video playing in the browser, as in the mod
- [Repository](${REPO}): the source; the mod itself is the \`plugin/\` folder

## Videos

Each link opens the project page on that video.

${themes.join('\n')}
`
}
