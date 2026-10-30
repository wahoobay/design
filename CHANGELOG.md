# Changelog

All notable changes to `@wahoobay/design` are recorded here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are Git tags.

## 0.1.1 — 2026-10-30

### Added

- `.wb-lead`, the lead paragraph: the large size in secondary ink at the reading measure.
- `.wb-sr-only`, text for screen readers only.
- `.wb-skip`, the skip link: hidden until it has focus, then an action button at the top left.

### Changed

- Headings set their weight: `h1` and `h2` at 800, `h3` and `h4` at 700 (spec §4.3). They stay ink.
- The reset sets `address` upright.
- The documentation page starts with a skip link and shows the lead paragraph and screen-reader-only text in both themes.
- `package.json` carries the release version (0.1.0 shipped with `0.0.0`), and the release workflow fails when the tag and the version differ.

## 0.1.0 — 2026-10-30

### Added

- Design tokens in `tokens.css`, light and dark.
- Manrope, self-hosted, with its `@font-face` rules in `fonts.css`.
- Component styles in `components.css`: button (with accent, action and ghost variants), card, chart, chip, container, error, field, footer, help, input, label, live, nav, num, panel, prose, select, textarea and tile.
- The logo and square mark in `logo/`, drawn in `currentColor`.
- A documentation page, `index.html`, with its photos in `media/`.
- The Impeccable detector (`npm run check`) in CI and in the release workflow.
