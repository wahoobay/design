# Changelog

All notable changes to `@wahoobay/design` are recorded here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are Git tags.

## 0.2.0 — 2026-10-30

### Added

- The Deep Field pieces (spec §4.3, Presentation: Deep Field), for the home page:
  - `.wb-stage`, the full-height photograph the home page opens on, `min-height: clamp(32rem, 90vh, 52rem)`: the photo (`.wb-stage__photo`) covers it, the scrim (`.wb-stage__scrim`) darkens its foot, and the body (`.wb-stage__body`, with `.wb-container`) sits at the bottom with the headline (`.wb-stage__title`: the display size, weight 800, tracking -0.04em, line-height 0.98, at most 11ch wide), the lead (`.wb-stage__lead`, the xl size) and the actions (`.wb-stage__actions`). Text on the stage is white in both themes; a ghost button on it is outlined in white, and a focus ring on it is white.
  - `.wb-nav--over`, the navigation over the stage: at the top of the photograph, transparent, with no bottom line, the logo and the links white in both themes (the logo through `currentColor`). The current and hovered links are underlined in white; the links keep their 44px height.
  - `.wb-band` and `.wb-band__inner`: a full-bleed section on its own ground, 4rem above and below. With `data-theme="dark"` it is the home page's live band on the live-camera ground, with no modifier. Inside, the still and the words sit side by side from 48rem.
  - `.wb-figures`, `.wb-figure`, `.wb-figure__value` and `.wb-figure__label`: the impact numbers at the figure size in brand blue, weight 800, tracking -0.04em, tabular numerals, two columns on phones and four from 48rem, divided by 1px lines with a 12px inset. In two columns no line starts the second row.
  - `.wb-door`, with `__photo`, `__body`, `__title` and `__text`: a 4:5 photograph that is one link into a section, the title at the 3xl size on the picture over a scrim, without card chrome.
  - `.wb-feature`, with the same parts: the doorway's shape at 16:9 with the title at the 2xl size, for the one large news item. A doorway or a feature grows to fit a long title instead of cutting it off (`overflow: clip`, with `hidden` as the fallback).
  - `.wb-map`, the frame an interactive map or its still fills: full width, `clamp(20rem, 60vh, 36rem)` tall, a 1px line and the 12px corners.
  - `.wb-notice` and `.wb-notice--error`: what a form says once it is sent, closed or failed, on the panel ground with a 1px line. There is still no danger colour: the error notice's border is 2px of ink.
- Tokens: `--wb-text-display` (`clamp(3rem, 7.5vw, 7rem)`), `--wb-text-figure` (`clamp(2.5rem, 5vw, 4.5rem)`) and `--wb-track-display` (`-0.04em`); `--wb-color-on-photo` (`#FFFFFF`), `--wb-color-scrim` (`rgb(11 27 43 / 0.85)`, the dark ground at partial alpha) and `--wb-color-scrim-0` (`rgb(11 27 43 / 0)`), the same in both themes. Every scrim runs from `--wb-color-scrim-0` to `--wb-color-scrim`, so `components.css` still carries no colour literal. The scrims have no contrast pair in `scripts/contrast.mjs`: what shows through them is a photograph.

### Changed

- The documentation page shows the stage with the overlaid nav, the band (dark in the light section too), the four impact figures, three doorways, a feature, the map frame and both notices, in both themes, with the new tokens among the swatches and in the type scale.
- Detector waivers, element by element: `data-impeccable-ignore="low-contrast"` on text set on a photograph (the stage's title and lead, the doorways' and the feature's titles and text, and the links of the overlaid nav, only there) and on the light impact figures. The spec's Deep Field presentation sets text on photographs over a scrim; the detector sees neither the photograph nor the scrim and measures white on the page ground, so the finish review checks that contrast by eye on the real photographs. The impact figures are large brand-blue numbers, as the tile numbers are (3.8:1 on white, where 3:1 applies), which the detector cannot tell at a `clamp()` size. A consumer's pages need the same waivers on the same elements; `tests/components.test.mjs` pins where they may appear here.

## 0.1.4 — 2026-10-30

### Added

- `.wb-media`, a standalone photo or video outside prose (a page's banner, a post's photo): a block as wide as its column with the 12px corners, `var(--wb-radius)`. It never sets a height; where its context gives it one (an aspect-ratio or a height), a photo or video fills the box, cropped about its centre. `.wb-media--top` and `.wb-media--bottom` crop from that edge instead, so a subject there stays in frame without an inline style.

### Changed

- On screens up to 30rem (480px), the navigation's links wrap onto as many rows as they need, with a 4px gap between rows, instead of scrolling sideways, so every item is on screen. Wider than that, nothing changes.
- The documentation page shows a standalone photo and one kept to the top of a 21:9 band, in both themes; its example navigation bars carry the site's six items.

## 0.1.3 — 2026-10-30

### Changed

- A photo, video or embed in `.wb-prose` (a page's Markdown body) has the 12px corners of the cards, panels and tiles, `var(--wb-radius)`, in a paragraph or in a figure. The rule is `.wb-prose :where(img, video, iframe)`, one class strong, so a component inside prose keeps its own corners: a card's photo stays 8px.
- The documentation page shows a photo in a paragraph and a captioned figure in running text, in both themes.

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
