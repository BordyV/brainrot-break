# Changelog

The project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

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
