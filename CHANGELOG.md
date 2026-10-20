# Changelog

The project follows [Semantic Versioning](https://semver.org/) and [Conventional Commits](https://www.conventionalcommits.org/).

## 1.0.0

The first public release.

- **The feed:** a TikTok-style feed of 347 pixel art mini-videos, each a small simulation drawn locally, with no tokens and no model call. It opens beside the conversation when an answer from Claude takes more than 2.5 s (or above the prompt on a narrow terminal), and with `/brainrot`. When Claude has answered, an end card sums up the wait and closes the feed after 15 s.
- **Two surfaces:** the Claude Code terminal (half-block cells, 15 frames a second) and the Claude desktop app (SVG frames, up to 10 a second, `/brainrot fps`).
- **Six languages:** English, French, Spanish, German, Brazilian Portuguese and Italian, for the interface, the comments and every video's captions and sounds (`/brainrot lang`, or ··· › Settings).
- **Watching:** scroll with the wheel, ▲ ▼ or `j`/`k`; click to pause, double-click or ♥ to like; ≡ opens comments; scrolling back resumes a video where it was left. `?` lists every key.
- **Choosing what comes up:** 24 themes, a video can have several. Likes bring a kind back sooner; ⊘ makes a kind rarer, with Undo; a quick skip lowers it a little. The ··· menu hides a playing video's theme, ticks themes on and off (a video shows as soon as one of its themes is ticked), keeps liked videos to watch again, and holds the settings (language, opening while Claude works, next video by itself). A click on a caption's hashtags keeps the feed to that theme.
- **Stats:** `/brainrot stats` for this session and all time; the last session is summed up when the next one starts.
