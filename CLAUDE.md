# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A single-page, static HTML investment research report (in Simplified Chinese)
analyzing the purchase cost and 2026–2035 short-term-rental outlook for the
"Quill Residences 22-16" property in Kuala Lumpur. There is no build system,
no package manager, no tests, and no backend — it is plain HTML/CSS/JS served
as static files.

## Running / previewing

Open `index.html` directly in a browser, or serve the folder over HTTP so the
audio and relative assets load cleanly:

```
python3 -m http.server 8000   # then visit http://localhost:8000
```

There is nothing to build, lint, or test.

## Files

- `index.html` — the report for screen viewing. Contains a click-to-enter cover
  overlay, sidebar TOC, the 11 report sections, and the background-music UI.
- `index-print.html` — a print-optimized variant of the **same report content**.
  It drops the cover overlay and floating music button, adds an inline `@media print`
  `<style>` block (A4 portrait), and runs an inline script that calls
  `window.print()` automatically on load.
- `styles.css` — all shared styling for both HTML files. Organized into clearly
  labeled section comment banners; a `:root` block holds the color/design tokens.
- `app.js` — two self-invoking modules: (1) scroll-spy that highlights the active
  TOC link via `IntersectionObserver`, and (2) the background-music controller.
- `bgm.mp3` — background music asset (~3.5 MB), referenced by the `<audio id="bgm">`.

## Key conventions

### Keep the two HTML files in sync
`index.html` and `index-print.html` carry the same report body. When you edit
report content (any `<section class="part">`), apply the equivalent change to
**both** files. They differ only in chrome: the print file has no overlay/music
and an extra print stylesheet + auto-print script.

### Cache-busting version query
CSS/JS are linked with a manual version query, e.g. `styles.css?v=4` and
`app.js?v=4`. After editing `styles.css` or `app.js`, bump the `?v=` number in
**every** `<link>`/`<script>` reference across both HTML files so viewers don't
get a stale cached copy.

### Content markup vocabulary
The report relies on a fixed set of semantic classes — reuse them rather than
inventing new ones or adding inline styles:

- Structure: `.part` (a numbered section), `.part-header` / `.part-title`,
  `.h2` / `.h3` (in-section headings), `.tbl-wrap` around every `<table>`,
  `.compact` (tight bullet line), `.callout` (highlighted note), `.code` (pre block).
- Data-reliability tags: `<span class="tag tag-fact">` 事实, `tag-infer` 推测,
  `tag-unknown` 不确定, `tag-fact-plus` 事实+推理, `tag-conclude` 结论,
  `tag-insight` / `tag-key` / `tag-warn`. The report's whole credibility model
  is "every claim is labeled as fact / inference / unknown" — preserve it.
- Number emphasis: wrap figures in `<span class="num ...">` with a currency
  modifier — `num-rm` (RM), `num-usd` (USD), `num-cny` / `num-cny-zh` (CNY),
  `num-pct` (percentages). These render in an emphasized monospace style.

### Language
All user-facing copy is Simplified Chinese (`<html lang="zh-CN">`). Keep new
content in Chinese to match.

### Music autoplay
Browsers block audio autoplay until a user gesture. `app.js` handles this by
starting playback from the cover-overlay click and from the first
click/scroll/keydown/touch. Don't "fix" the bare `audio.play().catch(...)`
calls — the empty catches intentionally swallow expected autoplay rejections.

## Git workflow

Active development branch for this work: `claude/claude-md-docs-wQD5N`.
Commit messages in this repo are short, imperative one-liners
(e.g. "Add inline music player bar below the report title").
