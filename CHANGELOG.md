# Changelog

All notable changes to `@wahoobay/design` are recorded here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are Git tags.

## 0.1.2 — 2026-10-30

### Added

- The icon set in `icons/` (exported as `@wahoobay/design/icons/*`): `arrow-left`, `arrow-right` and `external`, on a 24px grid with one 2px stroke in `currentColor`, each already marked `class="wb-icon" aria-hidden="true" focusable="false"`. `.wb-icon` sizes an inlined icon to 1em on the text baseline.
- `.wb-back`, the back link above a page's heading: the arrow, then the text, in action blue, underlined on hover and focus only, with the prose rhythm's gap above a heading between it and the `h1`.
- `.wb-initials`, a person's no-photo fallback: a square as wide as its parent, initials in muted ink at 800 on the ground colour.
- `.wb-logo-tile`, a partner's logo, contained, on the ground colour with a 1px line and 12px corners; a linked tile turns panel on hover and focus. `.wb-logo-tile--dark` puts a logo drawn in white on ink. On the dark theme the plain tile stays light and the dark tile dark.
- `.wb-btn--wrap`, a button whose label may wrap, and `.wb-btn__meta`, the small label at the end of a button that says what it opens (muted on ghost buttons).
- `.wb-caption`, the caption under a photo or of a link to a post; a caption link is underlined on hover and focus only.
- `.wb-panel--raised` and `.wb-card--raised`, which spend `--wb-shadow` on a surface over a photograph. Plain panels and cards stay flat.
- `.wb-video`, a 16:9 frame with 12px corners that a player fills, borderless.
- Phone-number links (`a[href^="tel:"]`) never break at their hyphens.

### Changed

- The documentation page shows the icons, the back link above a heading, initials beside a photo, the two logo tiles, document buttons, captions, the raised panel and card, and the video frame, in both themes.

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
