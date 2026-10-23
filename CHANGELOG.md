# Changelog

The project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

## 1.4.0

- Every video is redrawn with light and shading: one light from the upper left, three or four tones per material, outlines and layered backgrounds, so objects have volume instead of flat fills. The simulations are unchanged, and the classic arcade screens and the memes keep their known looks.
- The aquarium's small fish get a readable shape on the desktop app.
- The project page gets a favicon, a picture when its link is shared, and an `llms.txt` for agents that read it.

## 1.3.0

- Eight new videos in the memes theme: Coccodrillo Bombardiere, Tronchetto Tum Tum, Ballerina Cappuccina, Elefantino Cactusino, a tier list, the cat on the keyboard, touch grass and the feed in the feed. The cat and touch grass also show under the dev theme.
- A project page plays the feed in the browser, every video included: https://bordyv.github.io/brainrot-break/
- An install now copies only the mod (the repository's `plugin/` folder), not the README's pictures, the tools and the docs.

## 1.2.1

- Desktop app: the video takes the most the pane allows, across and down, instead of stopping at a fixed size.

## 1.2.0

- Terminal under 110 columns: no feed by the prompt any more, one line says the window is too narrow (with ⇥ to move to the side when it is wide enough). The clip waits and picks up on the side once the window is widened.

## 1.1.1

- The shortcuts line under the caption is gone: `?` lists them.

## 1.1.0

- The caption always goes under the video, in the terminal and the desktop app; the open menu takes the whole height.
- On a narrow terminal, the feed plays above the prompt with a new ⇥ button (`p`) that moves it to the side. That works from 110 columns, and after it the feed opens beside the conversation by itself from 110 columns instead of 144.
- The feed moves from above the prompt to the side by itself once the terminal gets wide enough.

## 1.0.1

- Desktop app: the wheel goes back up to the previous video again (it only went down).

## 1.0.0

The first public release.

- **The feed:** a TikTok-style feed of 347 pixel art mini-videos, each a small simulation drawn locally, with no tokens and no model call. It opens beside the conversation when an answer from Claude takes more than 2.5 s (or above the prompt on a narrow terminal), and with `/brainrot`. When Claude has answered, an end card sums up the wait and closes the feed after 15 s.
- **Two surfaces:** the Claude Code terminal (half-block cells, 15 frames a second) and the Claude desktop app (SVG frames, up to 10 a second, `/brainrot fps`).
- **Six languages:** English, French, Spanish, German, Brazilian Portuguese and Italian, for the interface, the comments and every video's captions and sounds (`/brainrot lang`, or ··· › Settings).
- **Watching:** scroll with the wheel, ▲ ▼ or `j`/`k`; click to pause, double-click or ♥ to like; ≡ opens comments; scrolling back resumes a video where it was left. `?` lists every key.
- **Choosing what comes up:** 24 themes, a video can have several. Likes bring a kind back sooner; ⊘ makes a kind rarer, with Undo; a quick skip lowers it a little. The ··· menu hides a playing video's theme, ticks themes on and off (a video shows as soon as one of its themes is ticked), keeps liked videos to watch again, and holds the settings (language, opening while Claude works, next video by itself). A click on a caption's hashtags keeps the feed to that theme.
- **Stats:** `/brainrot stats` for this session and all time; the last session is summed up when the next one starts.
