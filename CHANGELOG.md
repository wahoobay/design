# Changelog

All notable changes to `@wahoobay/design` are recorded here, newest first. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions are Git tags.

## 0.3.1 — 2026-10-31

### Added

- `.wb-detect--inside`, for a detection box whose top sits within about 1.5em of the frame's top edge (the page adds it when it measures that): its label is pinned inside the box at the top-left (`top: -2px; left: -2px; bottom: auto`) with the corner radii adjusted (`0.25rem 0 0.25rem 0`) so the label's outer corner matches the box. Nothing else about the box or label changes, and the fade-in applies to both. The docs' video frame shows one box of each placement.
- A square legend key for bar charts: `data-kind="bar"` on a legend item makes its key a 0.75em square in the series colour (the line key stays for lines). The docs' stacked bar chart uses it.

### Changed

- `.wb-seg` wraps on a narrow screen: `display: flex; flex-wrap: wrap` (the border and corners stay on the group) and `.wb-seg__btn` takes `flex: 1 1 auto`, so four labels such as "24 hours / 7 days / 30 days / 1 year" fit a 320px viewport; buttons stay at least 44px tall and wide. The docs' example has those four labels.
- The docs' stacked bar chart's caption says "Fish seen per day, 7 days", as its `aria-label` and its y-axis do (it said "Species seen per day").
- Reworded the 0.3.0 entry for the docs page's positioning: only the positioned container for the boxes went; `.docs-still .wb-live` still places the band's badge.

## 0.3.0 — 2026-10-30

### Added

- Chart series 3 to 8, the Wong colour-blind-safe set (spec §4.3), after brand blue (series 1) and the accent (series 2), the same in both themes: `--wb-color-series-3` `#E69F00`, `-4` `#56B4E9`, `-5` `#D55E00`, `-6` `#CC79A7`, `-7` `#009E73`, `-8` `#F0E442`. They are the strokes and fills of chart marks, never text, so they have no contrast pair in `scripts/contrast.mjs`; a legend in ink names each one.
- Chart pieces, for the trends page and the live page's chart: `.wb-chart__bar` on an SVG `<rect data-series="…">` is filled with its series colour, with no outline; `.wb-chart__axis`, a `<g>` of lines and `<text>` labels, draws 1px lines in `--wb-color-line` and its labels at `--wb-text-xs` in `--wb-color-ink-3` with tabular numerals; `.wb-chart__grid`, a `<g>` of lines, draws them 1px in `--wb-color-line` at half strength, dashed. Text in an SVG scales with its viewBox, so a chart drawn in CSS pixels at the size it is shown keeps its labels at that size. `.wb-chart--tall` makes the drawing 2:1 (it is 5:1). `.wb-chart__empty` is the sentence a chart with no data shows in place of its SVG, `--wb-text-sm` in muted ink, centred in the box the drawing would fill, so the frame keeps its size.
- `.wb-live--off`, the badge of a stream that is off: off the accent, on `--wb-color-panel` in `--wb-color-ink-2`, its dot `--wb-color-ink-3` and still. The page sets the word ("Offline"). It needs no detector waiver.
- `.wb-seg`, a segmented control for one choice of a few, such as a chart's range: a `role="group"` (with a name) of `<button class="wb-seg__btn" type="button" aria-pressed="…">`, in a 1px `--wb-color-line` frame with the 12px corners, each button at least 44px square in ink. The page sets `aria-pressed="true"` on the chosen one, which is on the panel wash and, because the wash alone is faint on the white page, underlined in action blue as the current nav link is. The focus ring is drawn inside the button, as in the nav. Both themes through the tokens.
- The detection box's entrance (spec §4.3, Ruling 9): a `.wb-detect` and its label fade in together over 150ms as the box enters the page, only without `prefers-reduced-motion: reduce`. A box that only moves does not fade again. With the live badge's breath it is the live page's one authored moment; the busy button's ring is the only other animation.

### Changed

- `.wb-video` is `position: relative`, so what is drawn over the video (detection boxes placed with `left`, `top`, `width` and `height` in percent, a badge) is placed in the frame and clipped to it. A consumer that positioned the frame itself can keep doing so.
- A chart series now sets `color` on its marks and its legend key, and lines (`stroke`), bars (`fill`) and legend keys (`background`) take it as `currentColor`; the markup is unchanged (`data-series="1"` to `"8"`).
- The live badge's breathing rule is `.wb-live:not(.wb-live--off)::before`, so the offline badge is outside it.
- The documentation page shows, in both themes: the live and the offline badge side by side, the segmented control, a tall stacked bar chart of the eight series with its axis and gridlines, an empty chart, and two detection boxes in a `.wb-video` frame (the docs page's own positioned container for the boxes is gone; `.docs-still .wb-live` still places the band's badge). The six series are among the swatches.

## 0.2.2 — 2026-10-30

### Changed

- The doorway's and the feature's scrim reaches the full `--wb-color-scrim` by 40% of the words' box and holds it to the foot (it ran from clear to full over the whole box), and the box starts with 4rem of padding (`--wb-space-8`, it was 2rem), so the title's first line sits where the scrim is already at full strength, over white shirts and bright water too. `.wb-door` and `.wb-feature` take `min-width: 0`: their text sets their height, so in a plain grid or flex row their smallest width, through the 4:5 or 16:9, could be wider than a phone.
- The stage's top band is stronger and deeper, for the three rows the nav wraps onto over the photograph on a phone: `--wb-color-scrim-top` is `rgb(11 27 43 / 0.55)` in both themes (it was 0.35), held to 15% and clear by 32% (it was clear by 20%); the scrim then reaches the full `--wb-color-scrim` by 45% (it was 50%), so the headline's first line is still on 0.5 or more from 40% down.
- A nav link sets a 4px gap (`--wb-space-1`) between its label and an icon after it, such as the `external` icon on a link to another site.

### Added

- `.wb-subnav`, the section navigation above a page's heading: on the list of `.wb-nav__link` items (each in an `<li>`), one row that wraps, `column-gap: var(--wb-space-4)`, on a phone onto as many rows as it needs, never sideways. Its links have no inline padding, so the first label, and the first of every wrapped row, starts at the content column, and the current link's underline is as wide as its label; the focus ring sits 2px outside the link.
- A file field's button (`.wb-input[type="file"]::file-selector-button`) is the ghost button's look: a 1px line in `--wb-color-line`, the 8px corners (`--wb-radius-sm`), the sans face at 700, 44px tall, ink text on the ground, the panel under the pointer, `--wb-space-3` before the file names. The field itself drops the input's box, so there is no box around a box; an invalid one is marked on its button with 2px of ink.
- `.wb-marker`, a place on a map: a 16px pin in action blue (`--wb-color-action`) ringed with 2px of the ground colour and `--wb-shadow`, centred in a clear 44px target. `.wb-marker--camera` is the accent, because a camera is alive right now (it joins the accent's owners). `.wb-map` sets the sans face, and Mapbox GL's container, popups and controls inside it take it (`font-family: inherit` on `.mapboxgl-map`, `.mapboxgl-popup-content` and `.mapboxgl-ctrl`): the one rule that names a third-party class, because Mapbox GL sets Helvetica on its container.
- Button states. A disabled button (`:disabled` or `aria-disabled="true"`) fades to `opacity: .55`, shows `cursor: not-allowed` and does not darken under the pointer; its text is below 4.5:1 on purpose, as WCAG 1.4.3 exempts an inactive control (no token pair is added: the fade is opacity, not a colour). `.wb-btn--busy`, on a button at work and disabled while it is: the label stays and a 1em ring in its text colour, open at the top, turns after it (`wb-spin`, 0.8s), standing still under `prefers-reduced-motion: reduce`. It is the only animation besides the live badge.
- The documentation page shows, in both themes: the section navigation above a heading, with the current page first and an external link with its icon; a disabled and a busy button; a file field; a sensor's and a camera's marker on the map frame; and the new scrim values.

## 0.2.1 — 2026-10-30

### Changed

- The stage's scrim opens with a band of the new `--wb-color-scrim-top` (`rgb(11 27 43 / 0.35)`, both themes) under the overlaid nav, clear by 20%, and reaches the full `--wb-color-scrim` by 50%, held to the foot, so the headline's first line sits on 0.5 or more (it was clear to 30% and full only at the foot).
- The stage's height floor is 20rem, `min-height: clamp(20rem, 90vh, 52rem)` (it was 32rem), so the stage is never taller than a landscape phone's viewport.

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
