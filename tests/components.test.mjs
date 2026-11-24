import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { whiteOnScrim, contrast } from '../scripts/contrast.mjs';

const read = (path) => readFileSync(path, 'utf8');

// The class names the site consumes, exactly as the design system publishes them.
const CLASSES = [
  'wb-container',
  'wb-nav', 'wb-nav__logo', 'wb-nav__links', 'wb-nav__link', 'wb-nav__link--on', 'wb-nav__cta', 'wb-nav--over', 'wb-subnav',
  'wb-btn', 'wb-btn--action', 'wb-btn--ghost', 'wb-btn--accent', 'wb-btn--busy',
  'wb-live',
  'wb-chip', 'wb-chip__meta',
  'wb-tile', 'wb-tile__k', 'wb-tile__v', 'wb-tile--accent',
  'wb-panel', 'wb-panel__title',
  'wb-card', 'wb-card__media', 'wb-card__body',
  'wb-chart', 'wb-chart__legend',
  'wb-detect', 'wb-detect__label',
  'wb-field', 'wb-label', 'wb-input', 'wb-select', 'wb-textarea', 'wb-help', 'wb-error',
  'wb-footer',
  'wb-lead', 'wb-sr-only',
  'wb-icon', 'wb-back', 'wb-initials', 'wb-logo-tile', 'wb-logo-tile--dark', 'wb-btn--wrap', 'wb-btn__meta', 'wb-caption',
  'wb-panel--raised', 'wb-card--raised', 'wb-video',
  'wb-media', 'wb-media--top',
  'wb-map', 'wb-marker', 'wb-marker--camera',
  'wb-stage', 'wb-stage__photo', 'wb-stage__scrim', 'wb-stage__body', 'wb-stage__title', 'wb-stage__lead', 'wb-stage__actions',
  'wb-band', 'wb-band__inner',
  'wb-figures', 'wb-figure', 'wb-figure__value', 'wb-figure__label',
  'wb-door', 'wb-door__photo', 'wb-door__body', 'wb-door__title', 'wb-door__text',
  'wb-feature', 'wb-feature__photo', 'wb-feature__body', 'wb-feature__title', 'wb-feature__text',
  'wb-notice', 'wb-notice--error',
  'wb-live--off', 'wb-seg', 'wb-seg__btn', 'wb-detect--inside', 'wb-detect--right', 'wb-as-is',
  'wb-chart--tall', 'wb-chart__axis', 'wb-chart__grid', 'wb-chart__bar', 'wb-chart__empty',
  'wb-toolbar', 'wb-table', 'wb-table-wrap', 'wb-pager', 'wb-pager__info', 'wb-pager__prev', 'wb-pager__next',
  'wb-dialog', 'wb-dialog__title', 'wb-dialog__actions', 'wb-status',
  // 0.5.0: the Jump In hero and the action ticker.
  'wb-hero', 'wb-hero__water', 'wb-hero__rays', 'wb-hero__bubbles', 'wb-hero__school', 'wb-hero__fish', 'wb-hero__body', 'wb-hero__tag',
  'wb-hero__title', 'wb-hero__foot', 'wb-hero__lead', 'wb-hero__actions', 'wb-hero__pause',
  'wb-hero__fish--shark', 'wb-hero__fish--turtle', 'wb-hero__fish--ray',
  'wb-ticker', 'wb-ticker__track', 'wb-ticker__group', 'wb-ticker__word',
];

// The component files in build order; each one's first class must appear in this order.
const ORDER = ['wb-prose', 'wb-nav', 'wb-icon', 'wb-btn', 'wb-seg', 'wb-live', 'wb-chip', 'wb-tile', 'wb-panel', 'wb-card', 'wb-media',
  'wb-stage', 'wb-hero', 'wb-ticker', 'wb-band', 'wb-figures', 'wb-door', 'wb-feature', 'wb-chart', 'wb-detect', 'wb-field', 'wb-toolbar', 'wb-table-wrap', 'wb-pager', 'wb-dialog', 'wb-footer', 'wb-container', 'wb-as-is'];

// The only components allowed to use the Seagrass accent ("alive right now").
// 0.2.2: a camera's map marker, because a camera is alive right now.
const ACCENT_OWNERS = ['wb-live', 'wb-chip', 'wb-tile--accent', 'wb-detect', 'wb-btn--accent', 'wb-chart', 'wb-marker--camera'];

const selector = (cls) => new RegExp(`\\.${cls.replace(/-/g, '\\-')}(?![\\w-])`);
const classesUsed = (html) => new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)));
const rules = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));

test('every var(--wb-…) in components.css names a token in tokens.css', () => {
  const css = read('dist/components.css');
  const tokens = read('dist/tokens.css');
  for (const m of css.matchAll(/var\((--wb-[a-z0-9-]+)/g)) assert.ok(tokens.includes(`${m[1]}:`), m[1]);
});

test('components.css has no colour literal (hex, rgb, hsl) and no px font-size below 12px', () => {
  const css = read('dist/components.css');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  assert.doesNotMatch(css, /\b(rgba?|hsla?|hwb|lab|lch|oklab|oklch)\(/i, 'colours come from tokens.css, the scrims too');
  for (const m of css.matchAll(/font-size:\s*(\d+(\.\d+)?)px/g)) assert.ok(Number(m[1]) >= 12, m[0]);
});

test('index.html renders every class in a light section and again inside <section data-theme="dark">', () => {
  const html = read('dist/index.html');
  assert.ok(html.includes('data-theme="dark"'));
  const at = html.indexOf('<section data-theme="dark"');
  assert.ok(at > 0, 'a <section data-theme="dark"> after the light content');
  const light = classesUsed(html.slice(0, at));
  const dark = classesUsed(html.slice(at));
  for (const cls of CLASSES) {
    assert.ok(light.has(cls), `light: ${cls}`);
    assert.ok(dark.has(cls), `dark: ${cls}`);
  }
});

test('components.css never switches theme on prefers-color-scheme', () => {
  assert.doesNotMatch(read('dist/components.css'), /@media\s*\(prefers-color-scheme/);
});

test('components.css defines every class, base first, then the component files in order', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  for (const cls of CLASSES) assert.match(css, selector(cls), cls);
  const at = ORDER.map((cls) => css.search(selector(cls)));
  assert.deepEqual([...at].sort((a, b) => a - b), at, `first definitions out of order: ${ORDER.join(' < ')}`);
});

test('the accent appears only in the components that mean "alive right now", and in a chart only as series 2', () => {
  // A component owns its elements: .wb-chart__legend belongs to .wb-chart.
  const owns = (cls, part) => new RegExp(`\\.${cls.replace(/-/g, '\\-')}(?:__[a-z-]+)?(?![\\w-])`).test(part);
  for (const { selector: sel, body } of rules(read('dist/components.css'))) {
    if (!/--wb-color-(on-)?accent/.test(body)) continue;
    // Split on the commas between selectors, not the ones inside :not(…).
    for (const part of sel.split(/,(?![^()]*\))/)) {
      assert.ok(ACCENT_OWNERS.some((cls) => owns(cls, part)), `accent used by ${part.trim()}`);
      if (owns('wb-chart', part)) assert.match(part, /\[data-series="2"\]/, `chart accent outside series 2: ${part.trim()}`);
    }
  }
});

test('buttons and nav links are at least 44px tall (2.75rem)', () => {
  const css = rules(read('dist/components.css'));
  for (const cls of ['.wb-btn', '.wb-nav__link']) {
    const rule = css.find((r) => r.selector === cls);
    assert.ok(rule, cls);
    assert.match(rule.body, /min-height:\s*2\.75rem/, cls);
  }
});

test('index.html inlines the logo in place of every placeholder, with unique ids', () => {
  const html = read('dist/index.html');
  const svg = read('brand/wahoobay-logo.svg');
  assert.doesNotMatch(html, /@wb-logo/);
  const firstPath = svg.match(/<path d="([^"]{0,80})/)[1];
  assert.ok(html.split(firstPath).length - 1 >= 2, 'the logo is inlined in both navs');
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  assert.deepEqual(ids.filter((id, i) => ids.indexOf(id) !== i), [], 'duplicate ids');
  for (const m of html.matchAll(/aria-labelledby="([^"]+)"/g)) assert.ok(ids.includes(m[1]), m[1]);
});

test('index.html swatches print the hex each token has in tokens.css', () => {
  const html = read('dist/index.html');
  const tokens = read('dist/tokens.css');
  const swatches = [...html.matchAll(/<code>(--wb-color-[a-z0-9-]+)<\/code>\s*<code>(#[0-9A-F]{6})<\/code>/g)];
  assert.ok(swatches.length >= 29, `${swatches.length} swatches, want every light and dark colour`);
  for (const [, name, hex] of swatches) assert.ok(tokens.includes(`${name}: ${hex};`), `${name}: ${hex}`);
});

test('index.html carries the overlong fixtures: a 60-character species chip and a 40-character tile label', () => {
  const html = read('dist/index.html');
  const chips = [...html.matchAll(/class="wb-chip">([^<]*)<\w+ class="wb-chip__meta">/g)].map((m) => m[1].length);
  const labels = [...html.matchAll(/<(\w+) class="wb-tile__k">([^<]*)<\/\1>/g)].map((m) => m[2].length);
  assert.ok(chips.includes(60), `chip name lengths ${chips}`);
  assert.ok(labels.includes(40), `tile label lengths ${labels}`);
});

test('body text keeps "(c)" as typed: common ligatures are off', () => {
  const body = rules(read('dist/components.css')).find((r) => r.selector === 'body');
  assert.match(body.body, /font-variant-ligatures:\s*no-common-ligatures/);
});

test('the inlined logo has no inline style, so it follows currentColor; components.css needs no !important', () => {
  const html = read('dist/index.html');
  const svgs = [...html.matchAll(/<svg\b[^>]*aria-labelledby="wb-logo-title-\d+"[^>]*>/g)].map((m) => m[0]);
  assert.equal(svgs.length, 6, 'two navs, two navs over a photograph and two dark logo tiles');
  for (const tag of svgs) assert.doesNotMatch(tag, /\sstyle=/, tag);
  assert.match(read('dist/logo/wahoobay-logo.svg'), /<svg\b[^>]*style="color:#0088D6"/, 'the <img> file keeps its default colour');
  assert.doesNotMatch(read('dist/components.css'), /!important/);
});

test('stat tile numbers are brand blue (spec §4.3: large numbers); the accent tile keeps the accent', () => {
  const css = rules(read('dist/components.css'));
  assert.match(css.find((r) => r.selector === '.wb-tile__v').body, /color:\s*var\(--wb-color-brand\)/);
  assert.match(css.find((r) => r.selector === '.wb-tile--accent .wb-tile__v').body, /color:\s*var\(--wb-color-accent-text\)/);
});

test('nav links draw the focus ring inside the link, where the scrolling row cannot clip it', () => {
  const rule = rules(read('dist/components.css')).find((r) => r.selector === '.wb-nav__link:focus-visible');
  assert.ok(rule, '.wb-nav__link:focus-visible');
  assert.match(rule.body, /outline-offset:\s*-2px/);
});

test('the logo is 34px tall on light and 30px on dark (spec §4.3)', () => {
  const css = rules(read('dist/components.css'));
  assert.match(css.find((r) => r.selector === '.wb-nav__logo :is(svg, img)').body, /height:\s*2\.125rem/);
  assert.match(css.find((r) => r.selector === '[data-theme="dark"] .wb-nav__logo :is(svg, img)').body, /height:\s*1\.875rem/);
});

test('the live badge breathes and a detection box fades in, only without reduced motion; the busy ring turns; the hero and the ticker move; nothing else animates (spec §4.3)', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /@keyframes wb-live-breathe\s*\{/);
  // 0.3.0: the offline badge is not in the breathing rule at all (the detector reads the selector, not the cascade).
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.wb-live:not\(\.wb-live--off\)::before\s*\{[^}]*animation:[^;]*wb-live-breathe/);
  // 0.2.2: a busy button's ring turns while it works, a status, not decoration; reduced motion stops it.
  assert.match(css, /@keyframes wb-spin\s*\{/);
  // 0.3.0 (Ruling 9): a detection box and its label fade in together, 150ms of opacity, as the box appears: with the
  // badge, the live page's one authored moment. Without the media query's no-preference there is no fade at all.
  assert.match(css, /@keyframes wb-detect-in\s*\{\s*from\s*\{\s*opacity:\s*0;?\s*\}\s*\}/, 'the fade animates opacity only');
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.wb-detect\s*\{\s*animation:\s*wb-detect-in 150ms ease-out;?\s*\}\s*\}/, 'the fade, only without reduced motion');
  const animated = rules(css).filter((r) => /\banimation(-name)?:/.test(r.body)).map((r) => `${r.selector} ${r.body.match(/animation(?:-name)?:\s*([^;]+)/)[1].trim()}`);
  // 0.5.0: the hero's water moves (rays sway, bubbles rise, fish swim with their boxes) and the ticker scrolls, the home
  // page's motion (PRODUCT.md, the Jump In brand); every one of them only without reduced motion (tested below).
  assert.deepEqual(animated, ['.wb-btn--busy::after wb-spin .8s linear infinite', '.wb-btn--busy::after none', '.wb-live:not(.wb-live--off)::before wb-live-breathe 2.4s ease-in-out infinite',
    '.wb-hero__rays > span wb-hero-sway 9s ease-in-out infinite', '.wb-hero__bubbles > span wb-hero-rise 9s linear infinite',
    '.wb-hero__fish wb-hero-swim 26s linear infinite, wb-hero-bob 4s ease-in-out infinite', '.wb-hero__fish:nth-child(even) wb-hero-swim-left, wb-hero-bob',
    '.wb-hero__fish--ray::before wb-hero-flap 2.8s ease-in-out infinite', '.wb-hero__fish--turtle::before wb-hero-paddle 5s ease-in-out infinite',
    '.wb-ticker__track wb-ticker 45s linear infinite',
    '.wb-detect wb-detect-in 150ms ease-out']);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.wb-btn--busy::after\s*\{\s*animation:\s*none;?\s*\}/, 'reduced motion stops the ring');
  assert.doesNotMatch(css, /\btransition(-[a-z]+)?:/, 'nothing moves by transition either');
});

test('the dark focus ring is not the accent, which means "alive right now"', () => {
  const { dark } = JSON.parse(read('tokens/tokens.json')).color;
  assert.ok(!['accent', 'accent-text', 'accent-tint'].some((k) => dark[k] === dark.focus), dark.focus);
});

// 0.2.0: the Deep Field presentation (spec §4.3) sets text on photographs over a scrim. The detector cannot see the scrim
// and charges white on the page ground; the finish review checks that contrast by eye on the real photographs. The impact
// figures are large brand-blue numbers, as the tile numbers are: 3:1 applies, which the detector cannot tell at clamp().
const WAIVERS = [
  'wb-tile__v low-contrast', 'wb-figure__value low-contrast', 'wb-live pulsing-dot',
  'wb-stage__title low-contrast', 'wb-stage__lead low-contrast',
  'wb-door__title low-contrast', 'wb-door__text low-contrast',
  'wb-feature__title low-contrast', 'wb-feature__text low-contrast',
  'wb-nav__link low-contrast',
  // 0.5.0: the ticker's endless scroll is the home page's motion (PRODUCT.md, the Jump In brand); the detector calls any
  // infinite horizontal loop a marquee. It holds under the pointer and with the pause button, and not at all with reduced motion.
  'wb-ticker__track marquee',
];

test('detector waivers appear only where the spec overrides the detector: brand-blue large numbers, live badges, text on photographs', () => {
  const raw = read('dist/index.html');
  const html = raw.replace(/<!--[\s\S]*?-->/g, '');
  const waivers = [...html.matchAll(/<\w+ class="([^"]*)" data-impeccable-ignore="([^"]*)"/g)].map((m) => `${m[1]} ${m[2]}`);
  assert.equal(waivers.length, [...html.matchAll(/data-impeccable-ignore=/g)].length, 'every waiver sits right after a class');
  for (const w of waivers) assert.ok(WAIVERS.includes(w), w);
  // A nav link is on a photograph only in the overlaid nav; everywhere else it is on the ground and is checked.
  const outside = html.replace(/<nav class="wb-nav wb-nav--over"[\s\S]*?<\/nav>/g, '');
  assert.doesNotMatch(outside, /class="wb-nav__link[^"]*" data-impeccable-ignore=/, 'a nav link is waived only inside .wb-nav--over');
  assert.doesNotMatch(raw, /impeccable-disable/, 'no file-wide or line waivers');
});

const rule = (css, sel) => css.find((r) => r.selector.replace(/\s+/g, ' ') === sel);

test('headings stay ink: h1 and h2 at weight 800, h3 and h4 at 700, and no base rule colours a heading (spec §4.3)', () => {
  const css = rules(read('dist/components.css'));
  assert.match(rule(css, 'h1, h2')?.body ?? '', /font-weight:\s*800/, 'h1, h2');
  assert.match(rule(css, 'h3, h4')?.body ?? '', /font-weight:\s*700/, 'h3, h4');
  for (const r of css.filter((r) => /^h[1-4](, h[1-4])*$/.test(r.selector.replace(/\s+/g, ' '))))
    assert.doesNotMatch(r.body, /(^|[;\s])color:/, r.selector);
});

test('the reset sets address upright', () => {
  assert.match(rule(rules(read('dist/components.css')), 'address')?.body ?? '', /font-style:\s*normal/);
});

test('.wb-lead is the large paragraph in secondary ink at the reading measure', () => {
  const body = rule(rules(read('dist/components.css')), '.wb-lead')?.body ?? '';
  assert.match(body, /font-size:\s*var\(--wb-text-lg\)/);
  assert.match(body, /color:\s*var\(--wb-color-ink-2\)/);
  assert.match(body, /max-width:\s*var\(--wb-measure\)/);
});

test('.wb-sr-only is the visually-hidden rule, and .wb-skip uses it until it has focus', () => {
  const body = rule(rules(read('dist/components.css')), '.wb-sr-only, .wb-skip:not(:focus)')?.body ?? '';
  for (const d of [/position:\s*absolute/, /width:\s*1px/, /height:\s*1px/, /overflow:\s*hidden/, /clip:\s*rect\(0 0 0 0\)/, /clip-path:\s*inset\(50%\)/, /white-space:\s*nowrap/])
    assert.match(body, d, String(d));
  assert.doesNotMatch(body, /display:\s*none|visibility:\s*hidden/, 'still read by screen readers');
});

test('.wb-skip, with focus, is fixed at the top left in the action colours and 44px tall', () => {
  const body = rule(rules(read('dist/components.css')), '.wb-skip')?.body ?? '';
  for (const d of [/position:\s*fixed/, /top:\s*var\(--wb-space-3\)/, /left:\s*var\(--wb-space-3\)/, /z-index:/, /min-height:\s*2\.75rem/,
    /background:\s*var\(--wb-color-action\)/, /color:\s*var\(--wb-color-on-action\)/])
    assert.match(body, d, String(d));
});

test('index.html starts with a skip link to <main id="main"> and shows a lead and screen-reader-only text', () => {
  const html = read('dist/index.html');
  assert.match(html, /<body>\s*<a class="wb-skip" href="#main">Skip to content<\/a>/);
  assert.match(html, /<main id="main">/);
  assert.match(html, /<span class="wb-sr-only">[^<]{10,}<\/span>/);
});


// 0.1.2: the pieces the site styled locally (finish review, fixes 1–3).
const has = (body, decls, where) => { for (const d of decls) assert.match(body, d, `${where}: ${d}`); };

test('.wb-back: an action-blue link, icon before text, underlined on hover and focus only, the heading rhythm clear of the h1', () => {
  const css = rules(read('dist/components.css'));
  const body = rule(css, '.wb-back')?.body ?? '';
  has(body, [/display:\s*inline-flex/, /align-items:\s*center/, /gap:\s*var\(--wb-space-1\)/, /color:\s*var\(--wb-color-action\)/, /text-decoration:\s*none/], '.wb-back');
  assert.match(rule(css, '.wb-back:is(:hover, :focus-visible)')?.body ?? '', /text-decoration:\s*underline/);
  // The gap above the heading is the prose rhythm's gap above a heading, which is larger than the one below it.
  const above = rule(css, '.wb-prose > * + :is(h1, h2, h3, h4)')?.body.match(/margin-block-start:\s*(var\(--wb-space-\d\))/)?.[1];
  const below = rule(css, '.wb-prose > :is(h1, h2, h3, h4) + *')?.body.match(/margin-block-start:\s*var\(--wb-space-(\d)\)/)?.[1];
  assert.ok(above && below, 'the prose heading rhythm');
  assert.match(body, new RegExp(`margin-block-end:\\s*${above.replace(/[()]/g, '\\$&')}`), '.wb-back margin-block-end');
  assert.ok(Number(above.match(/\d/)[0]) > Number(below), 'above the heading > below it');
});

test('.wb-initials: the no-photo square, sized by its parent, in the look the site gave it', () => {
  const body = rule(rules(read('dist/components.css')), '.wb-initials')?.body ?? '';
  has(body, [/display:\s*grid/, /place-items:\s*center/, /width:\s*100%/, /aspect-ratio:\s*1\s*;/, /border-radius:\s*var\(--wb-radius-sm\)/,
    /background:\s*var\(--wb-color-bg\)/, /color:\s*var\(--wb-color-ink-3\)/, /font-size:\s*var\(--wb-text-2xl\)/, /font-weight:\s*800/], '.wb-initials');
});

test('.wb-logo-tile: 1px line, 12px corners, the ground, the panel on hover and focus; the dark tile is ink and stays dark', () => {
  const css = rules(read('dist/components.css'));
  has(rule(css, '.wb-logo-tile')?.body ?? '', [/display:\s*flex/, /align-items:\s*center/, /justify-content:\s*center/, /height:\s*100%/,
    /min-height:\s*7rem/, /padding:\s*var\(--wb-space-3\)/, /border:\s*1px solid var\(--wb-color-line\)/, /border-radius:\s*var\(--wb-radius\)/,
    /background:\s*var\(--wb-color-bg\)/], '.wb-logo-tile');
  assert.match(rule(css, 'a.wb-logo-tile:is(:hover, :focus-visible)')?.body ?? '', /background:\s*var\(--wb-color-panel\)/);
  has(rule(css, '.wb-logo-tile :is(img, svg)')?.body ?? '', [/max-width:\s*100%/, /max-height:\s*5rem/, /object-fit:\s*contain/], 'the logo');
  has(rule(css, '.wb-logo-tile--dark')?.body ?? '', [/background:\s*var\(--wb-color-ink\)/, /border-color:\s*var\(--wb-color-ink\)/], '.wb-logo-tile--dark');
  // A logo drawn in white must keep a dark ground under the pointer: the dark tile's hover is not the panel.
  const hover = rule(css, 'a.wb-logo-tile--dark:is(:hover, :focus-visible)')?.body ?? '';
  assert.match(hover, /background:/);
  assert.doesNotMatch(hover, /--wb-color-panel/);
  assert.ok(!rules(read('dist/components.css')).some((r) => /\bfilter:/.test(r.body)), 'no logo is recoloured with a filter');
  // A logo is drawn for its ground, not for the theme: on the dark theme the plain tile stays light and the dark one dark.
  assert.match(rule(css, '[data-theme="dark"] .wb-logo-tile')?.body ?? '', /background:\s*var\(--wb-color-ink\)/);
  assert.match(rule(css, '[data-theme="dark"] .wb-logo-tile--dark')?.body ?? '', /background:\s*var\(--wb-color-bg\)/);
});

test('.wb-btn--wrap lets a long label wrap; .wb-btn__meta is the small kind label at the end, muted on ghost buttons', () => {
  const css = rules(read('dist/components.css'));
  has(rule(css, '.wb-btn--wrap')?.body ?? '', [/max-width:\s*100%/, /height:\s*auto/, /white-space:\s*normal/, /line-height:\s*1\.35/, /text-align:\s*start/], '.wb-btn--wrap');
  const meta = rule(css, '.wb-btn__meta')?.body ?? '';
  has(meta, [/margin-inline-start:\s*auto/, /font-size:\s*var\(--wb-text-sm\)/, /font-weight:\s*500/], '.wb-btn__meta');
  assert.doesNotMatch(meta, /(^|[;\s])color:/, 'the meta label inherits its colour on filled buttons');
  assert.match(rule(css, '.wb-btn--ghost .wb-btn__meta')?.body ?? '', /color:\s*var\(--wb-color-ink-3\)/);
});

test('.wb-caption: small, 500, secondary ink, 1.4; a caption link is underlined on hover and focus only', () => {
  const css = rules(read('dist/components.css'));
  has(rule(css, '.wb-caption')?.body ?? '', [/color:\s*var\(--wb-color-ink-2\)/, /font-size:\s*var\(--wb-text-sm\)/, /font-weight:\s*500/, /line-height:\s*1\.4\s*;/], '.wb-caption');
  assert.match(rule(css, 'a.wb-caption')?.body ?? '', /text-decoration:\s*none/);
  assert.match(rule(css, 'a.wb-caption:is(:hover, :focus-visible)')?.body ?? '', /text-decoration:\s*underline/);
});

test('the raised panel and card spend the blue-tinted shadow; plain panels and cards stay flat (spec §4.3)', () => {
  const raw = read('dist/components.css');
  assert.match(raw, /var\(--wb-shadow\)/);
  const css = rules(raw);
  for (const sel of ['.wb-panel--raised', '.wb-card--raised']) assert.match(rule(css, sel)?.body ?? '', /box-shadow:\s*var\(--wb-shadow\)/, sel);
  for (const sel of ['.wb-panel', '.wb-card']) assert.doesNotMatch(rule(css, sel)?.body ?? '', /box-shadow/, sel);
});

test('.wb-video: a 16:9 frame with 12px corners; the player fills it, borderless', () => {
  const css = rules(read('dist/components.css'));
  has(rule(css, '.wb-video')?.body ?? '', [/aspect-ratio:\s*16 \/ 9/, /overflow:\s*hidden/, /border-radius:\s*var\(--wb-radius\)/], '.wb-video');
  has(rule(css, '.wb-video > :is(iframe, video, img)')?.body ?? '', [/display:\s*block/, /width:\s*100%/, /height:\s*100%/, /border:\s*0/], 'the player');
});

test('a phone number link never breaks at its hyphens', () => {
  assert.match(rule(rules(read('dist/components.css')), 'a[href^="tel:"]')?.body ?? '', /white-space:\s*nowrap/);
});

test('index.html shows the 0.1.2 pieces in both themes as the site uses them', () => {
  const html = read('dist/index.html');
  const at = html.indexOf('<section data-theme="dark"');
  for (const [theme, part] of [['light', html.slice(0, at)], ['dark', html.slice(at)]]) {
    const backs = [...part.matchAll(/<a class="wb-back"[^>]*>([\s\S]*?)<\/a>\s*<h[1-6]\b/g)];
    assert.equal(backs.length, 1, `${theme}: a back link right above a heading`);
    assert.match(backs[0][1], /^\s*<svg class="wb-icon"/, `${theme}: the arrow comes before the text`);
    assert.match(part, /<ul class="docs-row docs-icons"[\s\S]*?(<svg class="wb-icon"[\s\S]*?){3}<\/ul>/, `${theme}: an icon row`);
    assert.match(part, /class="wb-initials[^"]*"[^>]*>[A-Z]{2}</, `${theme}: initials`);
    assert.match(part, /class="wb-card__media[^"]*"/, `${theme}: a photo beside them`);
    assert.equal(part.match(/class="wb-logo-tile[ "]/g)?.length, 2, `${theme}: two logo tiles`);
    assert.equal(part.match(/class="wb-logo-tile wb-logo-tile--dark"/g)?.length, 1, `${theme}: one of them dark`);
    assert.match(part, /<a class="wb-btn wb-btn--ghost wb-btn--wrap"[^>]*>[^<]{40,}<span class="wb-btn__meta">[^<]+<\/span>/, `${theme}: a long ghost button with its kind`);
    assert.match(part, /<img\b[^>]*>\s*<figcaption class="wb-caption">/, `${theme}: a caption under a photo`);
    assert.match(part, /class="wb-panel wb-panel--raised/, `${theme}: a raised panel`);
  }
});

test('every file in src/components/ is in components.css', () => {
  const css = read('dist/components.css');
  const files = readdirSync('src/components').filter((f) => f.endsWith('.css'));
  assert.ok(files.length > 0);
  for (const f of files) assert.ok(css.includes(read(`src/components/${f}`)), `${f} is missing from dist/components.css`);
});

// 0.1.3: photos in running text were square while every card, panel and tile around them had 12px corners
// (Dan's staging review, 2026-10-30).
test('a photo, video or embed in .wb-prose has the 12px corners; a component\'s own corners still win inside prose', () => {
  const css = rules(read('dist/components.css'));
  const at = css.findIndex((r) => r.selector.replace(/\s+/g, ' ') === '.wb-prose :where(img, video, iframe)');
  assert.ok(at >= 0, '.wb-prose :where(img, video, iframe)');
  assert.match(css[at].body, /border-radius:\s*var\(--wb-radius\)\s*;/);
  // :where() keeps the rule at one class, so a card's photo (.wb-card__media, 8px, later in the file) keeps its corners.
  const media = css.findIndex((r) => r.selector === '.wb-card__media');
  assert.ok(media > at, 'the card media rule comes after the prose rule');
});

test('index.html shows a photo in a paragraph and a captioned figure in running text, in both themes', () => {
  const html = read('dist/index.html');
  const at = html.indexOf('<section data-theme="dark"');
  for (const [theme, part] of [['light', html.slice(0, at)], ['dark', html.slice(at)]]) {
    const prose = part.match(/<div class="wb-prose[^"]*">([\s\S]*?)<\/div>/)?.[1] ?? '';
    assert.match(prose, /<p><img\b[^>]*\balt="[^"]+"[^>]*><\/p>/, `${theme}: a photo in a paragraph, as Markdown writes it`);
    assert.match(prose, /<figure>\s*<img\b[^>]*\balt="[^"]+"[^>]*>\s*<figcaption class="wb-caption">[^<]+<\/figcaption>\s*<\/figure>/, `${theme}: a figure with its caption`);
  }
});

// 0.1.4: the site's page banners and post photos stood outside prose, square beside the 12px cards (Dan's staging
// review, 2026-10-30). .wb-media rounds any standalone photo or video; --top and --bottom keep a subject in frame.
test('.wb-media is a rounded block that never forces a height; --top and --bottom move the crop', () => {
  const css = rules(read('dist/components.css'));
  const media = rule(css, '.wb-media')?.body ?? '';
  has(media, [/display:\s*block/, /width:\s*100%/, /height:\s*auto/, /border-radius:\s*var\(--wb-radius\)\s*;/, /overflow:\s*hidden/], '.wb-media');
  assert.doesNotMatch(media, /aspect-ratio|(^|[;\s])height:(?!\s*auto)/, 'the context sets the height, not .wb-media');
  assert.match(rule(css, ':where(img, video).wb-media')?.body ?? '', /object-fit:\s*cover/, 'a photo or video fills the box its context gives it');
  assert.match(rule(css, '.wb-media--top')?.body ?? '', /object-position:\s*top\s*;/);
  assert.match(rule(css, '.wb-media--bottom')?.body ?? '', /object-position:\s*bottom\s*;/);
});

test('index.html shows a standalone photo and one kept to the top of its band, in both themes', () => {
  const html = read('dist/index.html');
  const at = html.indexOf('<section data-theme="dark"');
  for (const [theme, part] of [['light', html.slice(0, at)], ['dark', html.slice(at)]]) {
    assert.match(part, /<img class="wb-media"[^>]*\balt="[^"]+"/, `${theme}: a .wb-media photo`);
    assert.match(part, /<img class="wb-media wb-media--top[ "][^>]*\balt="[^"]+"/, `${theme}: a .wb-media--top photo`);
  }
});

// 0.1.4: with six items at 390px the sideways-scrolling links row put the last item off-screen (Dan's staging review).
test('on screens up to 30rem (480px) the nav links wrap onto rows instead of scrolling; wider, the row still scrolls', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const narrow = css.match(/@media \(max-width: 47\.99rem\)\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  assert.match(narrow, /\.wb-nav__links\s*\{[^}]*overflow-x:\s*auto/, 'below 48rem the row scrolls');
  const phone = css.match(/@media \(max-width: 30rem\)\s*\{([\s\S]*?)\n\}/);
  assert.ok(phone, '@media (max-width: 30rem)');
  const links = phone[1].match(/\.wb-nav__links\s*\{([^}]*)\}/)?.[1] ?? '';
  has(links, [/flex-wrap:\s*wrap/, /overflow:\s*visible/, /row-gap:\s*var\(--wb-space-\d\)/], '.wb-nav__links at 30rem');
  assert.ok(phone.index > css.indexOf('@media (max-width: 47.99rem)'), 'the 30rem block comes after the 48rem one, so it wins');
});

test('the documentation navs carry the site\'s six items, so the narrow-screen rows are on show', () => {
  const html = read('dist/index.html');
  const navs = [...html.matchAll(/<ul class="wb-nav__links">([\s\S]*?)<\/ul>/g)].map((m) => m[1]);
  assert.equal(navs.length, 4, 'a nav and a nav over a photograph in each theme');
  for (const nav of navs) assert.equal(nav.match(/class="wb-nav__link[ "]/g)?.length, 6);
});

// 0.2.0: the Deep Field pieces (spec §4.3, Presentation: Deep Field): the stage, the overlaid nav, the dark band, the
// figures, the doorways, the feature, the map frame and the notice.
const block = (sel) => rule(rules(read('dist/components.css')), sel)?.body ?? '';

test('stage: full-height photo hero with the display scale on a scrim', () => {
  // 0.2.1: a 20rem floor (was 32rem), so the stage is never taller than a landscape phone's viewport (spec §4.3).
  assert.match(block('.wb-stage'), /min-height:\s*clamp\(20rem,\s*90vh,\s*52rem\)/);
  assert.match(block('.wb-stage__photo'), /object-fit:\s*cover/);
  assert.match(block('.wb-stage__title'), /font-size:\s*var\(--wb-text-display\)/);
  assert.match(block('.wb-stage__title'), /letter-spacing:\s*var\(--wb-track-display\)/);
  assert.match(block('.wb-stage__title'), /line-height:\s*0?\.98/);
  assert.match(block('.wb-stage__scrim'), /linear-gradient/);
});

test('figures: brand-blue tabular numerals with 1px dividers and a 12px inset', () => {
  assert.match(block('.wb-figure__value'), /font-size:\s*var\(--wb-text-figure\)/);
  assert.match(block('.wb-figure__value'), /font-variant-numeric:\s*tabular-nums/);
  assert.match(block('.wb-figure__value'), /color:\s*var\(--wb-color-brand\)/);
  assert.match(block('.wb-figure'), /padding(-inline)?:\s*[^;]*var\(--wb-space-3\)/);
  assert.match(block('.wb-figure + .wb-figure'), /border-inline-start:\s*1px solid var\(--wb-color-line\)/);
});

test('door and feature: the title sits on the photograph over a scrim, 4:5 and 16:9', () => {
  assert.match(block('.wb-door'), /aspect-ratio:\s*4\s*\/\s*5/);
  assert.match(block('.wb-feature'), /aspect-ratio:\s*16\s*\/\s*9/);
  for (const c of ['.wb-door__body', '.wb-feature__body']) assert.match(block(c), /linear-gradient/, c);
});

test('only the stage, the doorway, the feature and the dialog backdrop draw a scrim', () => {
  const users = rules(read('dist/components.css')).filter((r) => /--wb-color-scrim/.test(r.body)).map((r) => r.selector).sort();
  assert.deepEqual(users, ['.wb-dialog::backdrop', '.wb-door__body', '.wb-feature__body', '.wb-stage__scrim']);
});

// A scrim's alpha down its box, read from the gradient's stops and the tokens (the same in both themes).
const scrimAt = (sel) => {
  const { light } = JSON.parse(read('tokens/tokens.json')).color;
  const alpha = (name) => Number(light[name].match(/\/\s*([\d.]+)\)$/)[1]);
  const gradient = block(sel).match(/linear-gradient\(180deg,([^;]*)\)\s*;/)?.[1] ?? '';
  const stops = [...gradient.matchAll(/var\(--wb-color-(scrim[a-z0-9-]*)\)\s+(\d+)%/g)].map((m) => [Number(m[2]), alpha(m[1])]);
  assert.ok(stops.length >= 3 && stops.length === gradient.split(',').length, `${sel}: every stop is a scrim token at a position: ${gradient}`);
  return (p) => {
    if (p <= stops[0][0]) return stops[0][1];
    for (let i = 1; i < stops.length; i += 1) {
      const [[p0, a0], [p1, a1]] = [stops[i - 1], stops[i]];
      if (p <= p1) return a0 + ((a1 - a0) * (p - p0)) / (p1 - p0);
    }
    return stops.at(-1)[1];
  };
};

// 0.2.2: on the doorways and the news feature the title and its sentence sat where the scrim was still thin, over white
// shirts and bright water (finish review, fix 1). The scrim is full by 40% of the body and held, and the body's first
// 4rem are padding, so the first line of text starts where the scrim is already at full strength.
test('the doorway\'s and the feature\'s scrim: full by 30% of the body, white text 4.5:1 or better from 23% down even over a white photograph; the text starts 4rem in', () => {
  for (const sel of ['.wb-door__body', '.wb-feature__body']) {
    const at = scrimAt(sel);
    assert.equal(at(0), 0, `${sel}: clear at the top`);
    // 0.3.2 (finish review): the full scrim came at 40%, so body text 3.6-3.8:1 over the lighter photographs. Full at 30%.
    for (let p = 30; p <= 100; p += 1) assert.equal(at(p), 0.85, `${sel} ${p}%`);
    for (let p = 23; p <= 100; p += 1) assert.ok(whiteOnScrim(at(p)) >= 4.5, `${sel} ${p}%: ${whiteOnScrim(at(p)).toFixed(2)}:1`);
    assert.ok(whiteOnScrim(at(100)) >= 11, `${sel}: 11:1 at full over white (${whiteOnScrim(at(100)).toFixed(2)})`);
    assert.match(block(sel), /padding-top:\s*var\(--wb-space-8\)/, `${sel}: padding-top`);
    // The deeper body made the doorway's smallest width, through its 4:5, wider than a phone (the docs page at 390px):
    // it takes the width its row gives it.
    const box = sel.replace('__body', '');
    assert.match(block(box), /min-width:\s*0\s*;/, `${box}: min-width`);
    // The shorthand comes first, so the 4rem top wins.
    assert.ok(block(sel).search(/padding:\s*var\(--wb-space-6\)/) < block(sel).search(/padding-top:/), `${sel}: padding order`);
  }
});

// 0.2.1: the stage's scrim was clear to 30% and full only at the foot, so the headline's top line sat almost on the bare
// photograph, and the nav over it had nothing (Task 1 review). 0.2.2: on a phone the nav wraps onto three rows over the
// photograph, so the top band is stronger (0.55) and deeper: held to 15%, clear by 32% (finish review, fix 2).
test('the stage scrim: a band of 0.7 to 15% and clear at 30%; the full 0.85 from 40% down; white small text 4.5:1 or better in the band and from 38% down, even over a white photograph', () => {
  const at = scrimAt('.wb-stage__scrim');
  // 0.3.2 (finish review): over-nav links ~3.5:1 and the lede ~4.2:1 on the real photographs. The band is 0.7 (0.55 before)
  // and the full scrim comes by 40% (45% before).
  for (let p = 0; p <= 15; p += 1) {
    assert.ok(at(p) >= 0.7, `top band ${p}%: ${at(p).toFixed(3)}`);
    assert.ok(whiteOnScrim(at(p)) >= 4.5, `nav links ${p}%: ${whiteOnScrim(at(p)).toFixed(2)}:1`);
  }
  assert.equal(at(30), 0, 'clear at 30%');
  for (let p = 38; p <= 100; p += 1) assert.ok(whiteOnScrim(at(p)) >= 4.5, `lede ${p}%: ${whiteOnScrim(at(p)).toFixed(2)}:1`);
  // The display headline's region is at least where it was (0.5 or more from 40% down, the full 0.85 from the ramp's end).
  for (let p = 40; p <= 100; p += 1) assert.ok(at(p) >= 0.5, `${p}%: ${at(p).toFixed(3)}`);
  for (let p = 40; p <= 100; p += 1) assert.equal(at(p), 0.85, `${p}%`);
});

test('text on a photograph is --wb-color-on-photo, which stays white in both themes, never the ground colour', () => {
  for (const sel of ['.wb-stage', '.wb-door', '.wb-feature', '.wb-nav--over']) {
    assert.match(block(sel), /(^|[;\s])color:\s*var\(--wb-color-on-photo\)/, sel);
    assert.doesNotMatch(block(sel), /(^|[;\s])color:\s*var\(--wb-color-bg\)/, sel);
  }
  // The links and the logo of the overlaid nav follow it: the logo is drawn in currentColor.
  assert.match(block('.wb-nav--over .wb-nav__link'), /color:\s*inherit/);
  assert.match(block('.wb-nav--over .wb-nav__logo'), /color:\s*inherit/);
  // A ghost button on the stage is drawn in the photo's text colour, not in ink, which the photograph would swallow.
  assert.match(block('.wb-stage .wb-btn--ghost'), /color:\s*var\(--wb-color-on-photo\)/);
});

test('the overlaid nav sits transparent at the top of the photograph, its links still 44px tall', () => {
  const over = block('.wb-nav--over');
  has(over, [/position:\s*absolute/, /inset-inline:\s*0/, /top:\s*0/, /z-index:\s*2/, /background:\s*transparent/, /border-bottom:\s*0/], '.wb-nav--over');
  assert.doesNotMatch(block('.wb-nav--over .wb-nav__link'), /min-height|padding|height:/, 'the link keeps its 2.75rem');
});

test('band: the dark theme\'s ground through its own tokens, no modifier; the inner grid splits at 48rem', () => {
  has(block('.wb-band'), [/background:\s*var\(--wb-color-bg\)/, /color:\s*var\(--wb-color-ink\)/, /padding-top:\s*var\(--wb-space-8\)/,
    /padding-bottom:\s*var\(--wb-space-8\)/], '.wb-band');
  has(block('.wb-band__inner'), [/display:\s*grid/, /gap:\s*var\(--wb-space-6\)/], '.wb-band__inner');
  const wide = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '').match(/@media \(min-width: 48rem\)\s*\{\s*\.wb-band__inner\s*\{([^}]*)\}/)?.[1] ?? '';
  assert.match(wide, /grid-template-columns:\s*1\.1fr 1fr/);
});

test('map frame and notices: a 1px line and 12px corners; an error notice is said in ink, never a danger colour', () => {
  has(block('.wb-map'), [/width:\s*100%/, /height:\s*clamp\(20rem,\s*60vh,\s*36rem\)/, /border:\s*1px solid var\(--wb-color-line\)/,
    /border-radius:\s*var\(--wb-radius\)/, /overflow:\s*hidden/], '.wb-map');
  has(block('.wb-notice'), [/padding:\s*var\(--wb-space-4\) var\(--wb-space-5\)/, /border:\s*1px solid var\(--wb-color-line\)/,
    /border-radius:\s*var\(--wb-radius\)/, /background:\s*var\(--wb-color-panel\)/, /color:\s*var\(--wb-color-ink\)/], '.wb-notice');
  has(block('.wb-notice--error'), [/border-color:\s*currentColor/, /color:\s*var\(--wb-color-ink\)/], '.wb-notice--error');
  assert.doesNotMatch(read('dist/tokens.css'), /--wb-color-(error|danger)/, 'there is no danger colour');
});

test('index.html shows the Deep Field pieces in both themes, the band dark in the light section too', () => {
  const html = read('dist/index.html');
  const at = html.indexOf('<section data-theme="dark"');
  for (const [theme, part] of [['light', html.slice(0, at)], ['dark', html.slice(at)]]) {
    const stage = part.match(/<div class="wb-stage">([\s\S]*?)<\/h4>/)?.[1] ?? '';
    assert.match(stage, /<img class="wb-stage__photo" src="\.\/media\/[a-z-]+\.jpg"/, `${theme}: the stage on a docs photograph`);
    assert.match(stage, /<nav class="wb-nav wb-nav--over"/, `${theme}: the overlaid nav on the stage`);
    assert.match(part, /<div class="wb-stage__actions">\s*(<a class="wb-btn [^"]*"[^>]*>[^<]+<\/a>\s*){2}<\/div>/, `${theme}: two buttons on the stage`);
    assert.match(part, /<div class="wb-band" data-theme="dark">[\s\S]*?class="wb-video[\s\S]*?class="wb-chip[\s\S]*?(class="wb-btn [\s\S]*?){3}/, `${theme}: the band`);
    const figures = [...part.matchAll(/<b class="wb-figure__value"[^>]*>([^<]+)<\/b><span class="wb-figure__label">([^<]+)<\/span>/g)].map((m) => `${m[1]} ${m[2]}`);
    assert.deepEqual(figures, ['14,910 Community members', '3,000 Students', '201 Educators', '184 Species documented'], `${theme}: the four figures`);
    assert.equal(part.match(/<a class="wb-door" /g)?.length, 3, `${theme}: three doorways`);
    assert.equal(part.match(/<a class="wb-feature[ "]/g)?.length, 1, `${theme}: one feature`);
    assert.match(part, /<div class="wb-map[ "][^>]*>\s*<img\b[^>]*\balt="[^"]+"/, `${theme}: the map frame`);
    assert.match(part, /class="wb-notice"/, `${theme}: a notice`);
    assert.match(part, /class="wb-notice wb-notice--error"/, `${theme}: an error notice`);
  }
});

test('a doorway or feature grows to fit a long title instead of cutting it off: overflow clip, with hidden as the fallback', () => {
  for (const sel of ['.wb-door', '.wb-feature']) assert.match(block(sel), /overflow:\s*hidden;\s*overflow:\s*clip;/, sel);
});

test('in two columns the figures draw no line at the start of the second row', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const narrow = [...css.matchAll(/@media \(max-width: 47\.99rem\)\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');
  assert.match(narrow, /\.wb-figure:nth-child\(odd\)\s*\{\s*border-inline-start:\s*0;?\s*\}/);
});

// 0.2.2: the pieces the site's step 2a needed (finish review, fixes 3 and 7; Rulings Q and V).
const theme = (html) => {
  const at = html.indexOf('<section data-theme="dark"');
  return [['light', html.slice(0, at)], ['dark', html.slice(at)]];
};

// The section navigation sat under the H1 on some pages and above it on others, its active underline 12px left of the
// column (finish review, fix 3). One wrapping row of nav links whose labels and underlines start at the column.
test('.wb-subnav: a wrapping row of nav links, each label (and its underline) flush with its own edge, so every row starts at the column', () => {
  has(block('.wb-subnav'), [/display:\s*flex/, /flex-wrap:\s*wrap/, /column-gap:\s*var\(--wb-space-4\)/, /margin:\s*0/, /padding:\s*0/, /list-style:\s*none/], '.wb-subnav');
  assert.match(block('.wb-subnav > li'), /display:\s*flex/);
  // No inline padding on any of its links: the first is flush with the column (finish review), and so is the first of
  // a wrapped row; the current link's underline (the nav's inset shadow, across the padding box) is as wide as its label.
  assert.match(block('.wb-subnav .wb-nav__link'), /padding-inline:\s*0\s*;/);
  assert.doesNotMatch(read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, ''), /\.wb-subnav [^{]*--on[^{]*\{[^}]*padding/, 'the current link keeps the alignment');
  // An icon after a link's label (external) sits a 4px gap from it, in the bar and in the section navigation.
  assert.match(block('.wb-nav__link'), /gap:\s*var\(--wb-space-1\)/);
  // The ring outside the link: with no padding an inset ring would cut into the label.
  assert.match(block('.wb-subnav .wb-nav__link:focus-visible'), /outline-offset:\s*2px/);
  for (const [name, part] of theme(read('dist/index.html'))) {
    const nav = part.match(/<nav aria-label="[^"]+">\s*<ul class="wb-subnav" role="list">([\s\S]*?)<\/ul>\s*<\/nav>\s*<h4\b/)?.[1] ?? '';
    assert.ok(nav, `${name}: a subnav right above a heading`);
    assert.equal(nav.match(/<li><a class="wb-nav__link[ "]/g)?.length, 6, `${name}: six links`);
    assert.match(nav, /<li><a class="wb-nav__link wb-nav__link--on" href="#" aria-current="page">/, `${name}: the current one first`);
    assert.match(nav, /<a class="wb-nav__link" href="#" target="_blank" rel="noopener">[^<]+<svg class="wb-icon"[\s\S]*?<\/svg><span class="wb-sr-only"> \(opens in a new tab\)<\/span><\/a>/, `${name}: an external link with its icon after the label`);
  }
});

// The photo field's "Choose Files" was the browser's own button (finish review, fix 7): it is the ghost button now.
test('a file field\'s button is the ghost button: 1px line, 8px corners, the sans face, 44px, ink, the panel under the pointer', () => {
  const button = block('.wb-input[type="file"]::file-selector-button');
  has(button, [/min-height:\s*2\.75rem/, /margin-inline-end:\s*var\(--wb-space-3\)/, /border:\s*1px solid var\(--wb-color-line\)/,
    /border-radius:\s*var\(--wb-radius-sm\)/, /font-family:\s*var\(--wb-font-sans\)/, /font-weight:\s*700/, /color:\s*var\(--wb-color-ink\)/,
    /background:\s*var\(--wb-color-bg\)/, /cursor:\s*pointer/], 'the file button');
  assert.doesNotMatch(button, /(^|[;\s])font:/, 'no font shorthand: it would reset the ligature setting');
  assert.match(block('.wb-input[type="file"]::file-selector-button:hover'), /background:\s*var\(--wb-color-panel\)/);
  // The field is the button and the file names beside it, not a box around a box.
  has(block('.wb-input[type="file"]'), [/padding:\s*0/, /border:\s*0/, /background:\s*transparent/], 'the file field');
  assert.match(block('.wb-input[type="file"][aria-invalid="true"]::file-selector-button'), /border:\s*2px solid var\(--wb-color-ink\)/, 'an invalid file field is marked on its button');
  for (const [name, part] of theme(read('dist/index.html')))
    assert.match(part, /<label class="wb-label" for="(photos-[ld])">[^<]+<\/label>\s*<input class="wb-input" id="\1" type="file"[^>]*>/, `${name}: a file field`);
});

// Ruling Q: the map's markers were the accent's chips (a sensor is not alive right now) and the map's words Mapbox's
// Helvetica. A marker is an action-blue pin, a camera's the accent; the map speaks in the system's face.
test('.wb-marker: a 16px action-blue pin with a 2px ring of the ground, in a 44px target; a camera\'s is the accent', () => {
  has(block('.wb-marker'), [/display:\s*grid/, /place-items:\s*center/, /width:\s*2\.75rem/, /height:\s*2\.75rem/, /padding:\s*0/, /border:\s*0/,
    /background:\s*transparent/, /cursor:\s*pointer/], '.wb-marker, the target');
  has(block('.wb-marker::before'), [/content:\s*""/, /width:\s*1rem/, /height:\s*1rem/, /border-radius:\s*50%/, /background:\s*var\(--wb-color-action\)/,
    /box-shadow:\s*0 0 0 2px var\(--wb-color-bg\),\s*var\(--wb-shadow\)/], '.wb-marker::before, the pin');
  assert.match(block('.wb-marker--camera::before'), /background:\s*var\(--wb-color-accent\)/);
  for (const [name, part] of theme(read('dist/index.html'))) {
    const map = part.match(/<div class="wb-map docs-map">([\s\S]*?)<\/div>/)?.[1] ?? '';
    assert.match(map, /<button class="wb-marker docs-marker-[a-z]+" type="button" aria-label="[^"]+"><\/button>/, `${name}: a sensor marker on the map frame`);
    assert.match(map, /<button class="wb-marker wb-marker--camera docs-marker-[a-z]+" type="button" aria-label="[^"]+"><\/button>/, `${name}: a camera marker`);
  }
});

test('the map frame speaks in the system\'s face, and Mapbox GL\'s classes appear in that one rule only', () => {
  assert.match(block('.wb-map'), /font-family:\s*var\(--wb-font-sans\)/);
  const css = rules(read('dist/components.css'));
  const third = css.filter((r) => /mapboxgl/.test(r.selector));
  assert.equal(third.length, 1, 'one rule names Mapbox GL');
  assert.deepEqual(third[0].selector.split(',').map((s) => s.trim()).sort(),
    ['.wb-map .mapboxgl-ctrl', '.wb-map .mapboxgl-map', '.wb-map .mapboxgl-popup-content', '.wb-map.mapboxgl-map']);
  assert.match(third[0].body, /^\s*font-family:\s*inherit;?\s*$/);
});

// Ruling V: the sighting form's submit was disabled while it sent, and looked exactly as it did before (final review).
test('a disabled button reads as unavailable and does not darken under the pointer; a busy button keeps its label and turns a ring after it', () => {
  has(block('.wb-btn:disabled, .wb-btn[aria-disabled="true"]'), [/opacity:\s*\.55/, /cursor:\s*not-allowed/], 'disabled');
  const css = rules(read('dist/components.css'));
  for (const r of css.filter((r) => /^\.wb-btn--[a-z]+[^ ]*:hover/.test(r.selector)))
    assert.match(r.selector, /:not\(:disabled, \[aria-disabled="true"\]\):hover$/, `${r.selector}: suppressed when disabled`);
  assert.equal(css.filter((r) => /^\.wb-btn--(action|ghost|accent)/.test(r.selector) && /:hover/.test(r.selector)).length, 3, 'the three hovers');
  has(block('.wb-btn--busy::after'), [/content:\s*""/, /width:\s*1em/, /height:\s*1em/, /border:\s*2px solid currentColor/, /border-top-color:\s*transparent/,
    /border-radius:\s*50%/, /animation:\s*wb-spin \.8s linear infinite/], '.wb-btn--busy::after');
  for (const [name, part] of theme(read('dist/index.html'))) {
    assert.match(part, /<button class="wb-btn wb-btn--action" type="button" disabled>[^<]+<\/button>/, `${name}: a disabled button`);
    assert.match(part, /<button class="wb-btn wb-btn--action wb-btn--busy" type="button" disabled>[^<]+<\/button>/, `${name}: a busy button`);
  }
});

// 0.3.0: the pieces the site's live page and trends page draw with (plan 7, Task 5): chart series 3 to 8, axes,
// gridlines, bars, the tall chart and the empty chart; the offline badge; the segmented control; the video frame as the
// detection boxes' container.
const SERIES = { 1: 'brand', 2: 'accent', 3: 'series-3', 4: 'series-4', 5: 'series-5', 6: 'series-6', 7: 'series-7', 8: 'series-8', other: 'series-other' };

test('chart series 1 to 8 and other: each sets its colour once, for its marks and its legend key; lines, bars and keys take it', () => {
  for (const [n, token] of Object.entries(SERIES))
    assert.match(block(`.wb-chart svg [data-series="${n}"], .wb-chart__legend [data-series="${n}"]::before`), new RegExp(`^\\s*color:\\s*var\\(--wb-color-${token}\\);?\\s*$`), `series ${n}`);
  assert.match(block('.wb-chart svg [data-series]'), /stroke:\s*currentColor/, 'a line is drawn in its series colour');
  assert.match(block('.wb-chart__legend [data-series]::before'), /background:\s*currentColor/, 'a legend key is its series colour');
  has(block('.wb-chart svg .wb-chart__bar[data-series]'), [/fill:\s*currentColor/, /stroke:\s*none/], 'a bar');
  // A series colour is never text: only a mark in the drawing or a legend key's swatch takes one; the legend's words stay muted ink.
  for (const { selector: sel, body } of rules(read('dist/components.css'))) {
    if (!/--wb-color-series-/.test(body)) continue;
    for (const part of sel.split(','))
      assert.match(part.trim(), /^(\.wb-chart svg \[data-series="([3-8]|other)"\]|\.wb-chart__legend \[data-series="([3-8]|other)"\]::before)$/, `series colour on ${part.trim()}`);
  }
  assert.match(block('.wb-chart__legend'), /color:\s*var\(--wb-color-ink-3\)/);
});

test('chart axes and gridlines: 1px lines in the line colour, the grid dashed at half strength; axis labels small, muted, tabular', () => {
  has(block('.wb-chart__axis'), [/color:\s*var\(--wb-color-ink-3\)/, /font-size:\s*var\(--wb-text-xs\)/, /font-variant-numeric:\s*tabular-nums/], '.wb-chart__axis');
  assert.match(block('.wb-chart svg .wb-chart__axis text'), /fill:\s*currentColor/, 'an axis label in SVG takes the muted ink');
  for (const sel of ['.wb-chart svg .wb-chart__axis :is(line, path)', '.wb-chart svg .wb-chart__grid :is(line, path)'])
    has(block(sel), [/fill:\s*none/, /stroke:\s*var\(--wb-color-line\)/, /stroke-width:\s*1\s*;/, /vector-effect:\s*non-scaling-stroke/], sel);
  has(block('.wb-chart svg .wb-chart__grid :is(line, path)'), [/stroke-opacity:\s*0?\.5\s*;/, /stroke-dasharray:\s*\d/], 'the grid');
  assert.doesNotMatch(block('.wb-chart svg .wb-chart__axis :is(line, path)'), /stroke-dasharray|stroke-opacity/, 'the axis is solid');
});

test('the tall chart is 2:1, for the trends page; an empty chart is one sentence centred where the drawing would be', () => {
  assert.match(block('.wb-chart svg'), /aspect-ratio:\s*5 \/ 1/);
  assert.match(block('.wb-chart--tall svg, .wb-chart--tall .wb-chart__empty'), /^\s*aspect-ratio:\s*2 \/ 1;?\s*$/);
  has(block('.wb-chart__empty'), [/display:\s*grid/, /place-items:\s*center/, /aspect-ratio:\s*5 \/ 1/, /margin:\s*0/, /color:\s*var\(--wb-color-ink-3\)/,
    /font-size:\s*var\(--wb-text-sm\)/, /text-align:\s*center/], '.wb-chart__empty');
});

test('.wb-live--off: off the accent, on the panel ground in secondary ink, its dot muted ink and still; the page says "Offline"', () => {
  has(block('.wb-live--off'), [/background:\s*var\(--wb-color-panel\)/, /color:\s*var\(--wb-color-ink-2\)/], '.wb-live--off');
  assert.match(block('.wb-live--off::before'), /^\s*background:\s*var\(--wb-color-ink-3\);?\s*$/, 'the dot');
  for (const r of rules(read('dist/components.css')).filter((r) => /wb-live--off/.test(r.selector) && !/:not\(\.wb-live--off\)/.test(r.selector))) {
    assert.doesNotMatch(r.body, /--wb-color-(on-)?accent/, `${r.selector}: the accent means alive right now`);
    assert.doesNotMatch(r.body, /\banimation/, `${r.selector}: nothing moves`);
  }
  // The dot is still: the one rule that animates a badge's dot leaves the offline badge out.
  const dots = rules(read('dist/components.css')).filter((r) => /\.wb-live\b[^,]*::before/.test(r.selector) && /\banimation/.test(r.body)).map((r) => r.selector);
  assert.deepEqual(dots, ['.wb-live:not(.wb-live--off)::before']);
});

test('.wb-seg: buttons in a group with a 1px line and 12px corners, each 44px, in ink; the chosen one on the panel wash; themed by tokens alone', () => {
  has(block('.wb-seg'), [/display:\s*flex;/, /flex-wrap:\s*wrap/, /border:\s*1px solid var\(--wb-color-line\)/, /border-radius:\s*var\(--wb-radius\)/, /background:\s*var\(--wb-color-bg\)/], '.wb-seg');
  assert.doesNotMatch(block('.wb-seg'), /overflow/, 'nothing clips a button or its focus ring');
  has(block('.wb-seg__btn'), [/min-width:\s*2\.75rem/, /min-height:\s*2\.75rem/, /margin:\s*0/, /border:\s*0/, /background:\s*transparent/, /color:\s*var\(--wb-color-ink\)/,
    /font:\s*inherit/, /font-weight:\s*700/, /cursor:\s*pointer/], '.wb-seg__btn');
  assert.match(block('.wb-seg__btn + .wb-seg__btn'), /border-inline-start:\s*1px solid var\(--wb-color-line\)/);
  // The end buttons follow the group's corners from inside its 1px line, so the chosen one's wash stays in the frame.
  has(block('.wb-seg__btn:first-child'), [/border-start-start-radius:\s*calc\(var\(--wb-radius\) - 1px\)/, /border-end-start-radius:\s*calc\(var\(--wb-radius\) - 1px\)/], 'the first');
  has(block('.wb-seg__btn:last-child'), [/border-start-end-radius:\s*calc\(var\(--wb-radius\) - 1px\)/, /border-end-end-radius:\s*calc\(var\(--wb-radius\) - 1px\)/], 'the last');
  // The panel wash is the chosen one; on the white page it is faint (1.06:1), so it is underlined as the current nav link is.
  has(block('.wb-seg__btn[aria-pressed="true"]'), [/background:\s*var\(--wb-color-panel\)/, /box-shadow:\s*inset 0 -2px 0 var\(--wb-color-action\)/], 'the chosen button');
  assert.doesNotMatch(block('.wb-seg__btn[aria-pressed="true"]'), /(^|[;\s])color:/, 'the chosen button keeps the ink');
  // The ring from base.css, drawn inside the button as in the nav, where the next button cannot cover it.
  assert.match(block('.wb-seg__btn:focus-visible'), /^\s*outline-offset:\s*-2px;?\s*$/);
  assert.ok(!rules(read('dist/components.css')).some((r) => /wb-seg/.test(r.selector) && /data-theme/.test(r.selector)), 'no dark rule: the tokens theme it');
});

test('.wb-video positions what it holds, so a detection box is placed in the frame', () => {
  assert.match(block('.wb-video'), /position:\s*relative/);
  assert.match(block('.wb-detect'), /position:\s*absolute/);
});

test('index.html shows the 0.3.0 pieces in both themes: both badges, the range control, seven series and Other in a tall bar chart, an empty chart, three boxes on a video frame', () => {
  const html = read('dist/index.html');
  const swatches = { 3: '#E69F00', 4: '#56B4E9', 5: '#D55E00', 6: '#CC79A7', 7: '#009E73', 8: '#F0E442' };
  for (const [n, hex] of Object.entries(swatches)) assert.ok(html.includes(`<code>--wb-color-series-${n}</code> <code>${hex}</code>`), `a swatch for series ${n}`);
  assert.match(html, /<p class="docs-intro">[^<]*(<code>[^<]*<\/code>[^<]*)*never text[^<]*<\/p>/, 'the series are said to be never text');
  for (const [name, part] of theme(html)) {
    assert.match(part, /<li><strong>[^<]+<\/strong> <span class="wb-live" data-impeccable-ignore="pulsing-dot">Live<\/span><\/li>\s*<li><strong>[^<]+<\/strong> <span class="wb-live wb-live--off">Offline<\/span><\/li>/,
      `${name}: the live and the offline badge side by side`);
    const seg = part.match(/<div class="wb-seg" role="group" aria-label="[^"]+">([\s\S]*?)<\/div>/)?.[1] ?? '';
    const pressed = [...seg.matchAll(/<button class="wb-seg__btn" type="button" aria-pressed="(true|false)">[^<]+<\/button>/g)].map((m) => m[1]);
    assert.ok(pressed.length >= 3, `${name}: a range control of three or more buttons`);
    assert.equal(seg.match(/<button\b/g).length, pressed.length, `${name}: every button in it is a .wb-seg__btn with its state`);
    assert.equal(pressed.filter((p) => p === 'true').length, 1, `${name}: one of them chosen`);
    const bars = [...part.matchAll(/<figure class="wb-chart wb-chart--tall">([\s\S]*?)<\/figure>/g)].map((m) => m[1]).find((c) => /class="wb-chart__bar"/.test(c)) ?? '';
    assert.ok(bars, `${name}: a tall bar chart`);
    assert.deepEqual([...new Set([...bars.matchAll(/<rect class="wb-chart__bar" data-series="(\d|other)"/g)].map((m) => m[1]))].sort(), ['1', '2', '3', '4', '5', '6', '7', 'other'], `${name}: seven series and Other, of bars`);
    assert.deepEqual([...bars.matchAll(/<li data-series="(\d|other)"(?: data-kind="bar")?>[^<]+<\/li>/g)].map((m) => m[1]), ['1', '2', '3', '4', '5', '6', '7', 'other'], `${name}: a legend of the seven and Other, in order`);
    assert.match(bars, /<g class="wb-chart__grid">\s*(<line\b[^>]*\/>\s*){2,}<\/g>/, `${name}: gridlines`);
    assert.match(bars, /<g class="wb-chart__axis">\s*<line\b[^>]*\/>(\s*<text\b[^>]*>[^<]+<\/text>){4,}\s*<\/g>/, `${name}: an axis with its labels`);
    assert.match(part, /<figure class="wb-chart">\s*<figcaption>[^<]+<\/figcaption>\s*<p class="wb-chart__empty">[^<]+<\/p>\s*<\/figure>/, `${name}: an empty chart, its sentence instead of the drawing`);
    const frame = part.match(/<div class="wb-video[^"]*">\s*<img\b[^>]*>\s*((?:<div class="wb-detect(?: wb-detect--(?:inside|right))*" style="[^"]*"><span class="wb-detect__label">[^<]+<small>[\d.]+<\/small><\/span><\/div>\s*)+)<\/div>/)?.[1] ?? '';
    const boxes = [...frame.matchAll(/style="([^"]*)"/g)].map((m) => m[1]);
    assert.equal(boxes.length, 3, `${name}: three detection boxes on a video frame`);
    for (const box of boxes) assert.match(box, /^left: [\d.]+%; top: [\d.]+%; width: [\d.]+%; height: [\d.]+%$/, `${name}: a box's geometry, in percent of the frame`);
  }
});

test('0.3.1: .wb-detect--inside pins the label inside the box; the docs show one box of each placement per theme', () => {
  has(block('.wb-detect--inside .wb-detect__label'), [/top:\s*-2px/, /left:\s*-2px/, /bottom:\s*auto/, /border-radius:\s*0\.25rem 0 0\.25rem 0/], 'the inside label');
  const html = read('dist/index.html');
  for (const [name, part] of theme(html)) {
    const frame = part.match(/<div class="wb-video docs-video-frame">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)?.[1] ?? '';
    assert.equal((frame.match(/class="wb-detect wb-detect--inside"/g) ?? []).length, 1, `${name}: one box inside`);
    assert.equal((frame.match(/class="wb-detect"/g) ?? []).length, 1, `${name}: one box above`);
  }
});

test('0.3.1: .wb-seg wraps on a narrow screen and its buttons grow; the docs show four labels in both themes', () => {
  assert.match(block('.wb-seg'), /flex-wrap:\s*wrap/);
  assert.match(block('.wb-seg__btn'), /flex:\s*1 1 auto/);
  for (const [name, part] of theme(read('dist/index.html'))) {
    const seg = part.match(/<div class="wb-seg" role="group" aria-label="[^"]+">([\s\S]*?)<\/div>/)?.[1] ?? '';
    assert.deepEqual([...seg.matchAll(/aria-pressed="(?:true|false)">([^<]+)</g)].map((m) => m[1]), ['24 hours', '7 days', '30 days', '1 year'], `${name}: the four-label range`);
  }
});

test('0.3.1: a bar legend key is a square in the series colour, and the docs bar legend uses it', () => {
  has(block('.wb-chart__legend [data-kind="bar"]::before'), [/width:\s*0\.75em/, /height:\s*0\.75em/], 'the square key');
  for (const [name, part] of theme(read('dist/index.html'))) {
    const bars = [...part.matchAll(/<figure class="wb-chart wb-chart--tall">([\s\S]*?)<\/figure>/g)].map((m) => m[1]).find((c) => /class="wb-chart__bar"/.test(c)) ?? '';
    assert.equal([...bars.matchAll(/<li data-series="(?:\d|other)" data-kind="bar">/g)].length, 8, `${name}: eight square keys`);
    assert.match(bars, /<figcaption>Fish seen per day, 7 days<\/figcaption>\s*<svg[^>]*aria-label="Fish seen per day /, `${name}: caption and label agree`);
  }
});

// 0.3.2: the finish-wave additions.
test('0.3.2: .wb-detect--right anchors the label to the box\'s right edge, alone and with --inside; the docs show a box near the right edge per theme', () => {
  has(block('.wb-detect--right .wb-detect__label'), [/left:\s*auto/, /right:\s*-2px/, /border-radius:\s*0\.25rem 0\.25rem 0 0\.25rem/], 'the right label');
  has(block('.wb-detect--right.wb-detect--inside .wb-detect__label'), [/top:\s*-2px/, /right:\s*-2px/, /left:\s*auto/, /bottom:\s*auto/, /border-radius:\s*0 0\.25rem 0 0\.25rem/], 'right and inside');
  // The combined rule is more specific than either, and --right comes after --inside, so neither can undo the other.
  const css = read('dist/components.css');
  assert.ok(css.indexOf('.wb-detect--right .wb-detect__label') > css.indexOf('.wb-detect--inside .wb-detect__label'), '--right after --inside');
  for (const [name, part] of theme(read('dist/index.html'))) {
    const frame = part.match(/<div class="wb-video docs-video-frame">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/)?.[1] ?? '';
    const right = frame.match(/class="wb-detect wb-detect--right" style="left: ([\d.]+)%; top: [\d.]+%; width: ([\d.]+)%/);
    assert.ok(right, `${name}: a box with --right in the video frame`);
    assert.ok(Number(right[1]) + Number(right[2]) >= 95, `${name}: the box is near the right edge (${Number(right[1]) + Number(right[2])}%)`);
  }
});

test('0.3.2: .wb-as-is keeps the case of a label, and wins on the tile label, the chart caption and the panel title; the docs show a tile "pH"', () => {
  has(block('.wb-as-is'), [/text-transform:\s*none/, /letter-spacing:\s*normal/], '.wb-as-is');
  const css = read('dist/components.css');
  // The component rules out-rank a lone class (.wb-chart figcaption is 0,1,1), so each gets its own, more specific pair.
  for (const sel of ['.wb-tile__k.wb-as-is', '.wb-chart figcaption.wb-as-is', '.wb-panel__title.wb-as-is'])
    has(block(`.wb-as-is, .wb-tile__k.wb-as-is, .wb-chart figcaption.wb-as-is, .wb-panel__title.wb-as-is`), [/text-transform:\s*none/, /letter-spacing:\s*normal/], sel);
  const at = css.indexOf('.wb-tile__k.wb-as-is');
  for (const earlier of ['.wb-tile__k {', '.wb-chart figcaption {', '.wb-panel__title {', '.wb-caption {']) assert.ok(css.indexOf(earlier) < at, `${earlier} before the utility`);
  for (const [name, part] of theme(read('dist/index.html')))
    assert.match(part, /<p class="wb-tile__k wb-as-is">pH<\/p>/, `${name}: a tile labelled pH`);
});

test('0.3.2: a neutral "other" series takes --wb-color-series-other, as series 1 to 8 do', () => {
  assert.match(block('.wb-chart svg [data-series="other"], .wb-chart__legend [data-series="other"]::before'), /^\s*color:\s*var\(--wb-color-series-other\);?\s*$/);
  for (const [name, part] of theme(read('dist/index.html'))) {
    const bars = [...part.matchAll(/<figure class="wb-chart wb-chart--tall">([\s\S]*?)<\/figure>/g)].map((m) => m[1]).find((c) => /class="wb-chart__bar"/.test(c)) ?? '';
    assert.match(bars, /<rect class="wb-chart__bar" data-series="other"/, `${name}: Other bars`);
    assert.match(bars, /<li data-series="other" data-kind="bar">Other species<\/li>/, `${name}: Other in the legend`);
    assert.doesNotMatch(bars, /data-series="8"/, `${name}: no eighth series: it is Other`);
  }
});

test('0.3.2: a chart\'s drawing is at least 140px (8.75rem) tall, so a narrow panel keeps a readable plot; the tall chart is unchanged', () => {
  assert.match(block('.wb-chart svg'), /min-height:\s*8\.75rem\s*;/);
  assert.match(block('.wb-chart--tall svg, .wb-chart--tall .wb-chart__empty'), /^\s*aspect-ratio:\s*2 \/ 1;?\s*$/);
});

test('0.4.0 admin pieces: stacking asks the wrapper, the dialog backdrop is the scrim, status chips are never the accent', () => {
  const css = read('dist/components.css');
  assert.match(css, /\.wb-table-wrap \{\s*position: relative;\s*container-type: inline-size;/);
  assert.match(css, /@container \(max-width: 36rem\) \{\s*\.wb-table\[data-stack\] thead/);
  assert.match(css, /\.wb-dialog::backdrop \{ background: var\(--wb-color-scrim\); \}/);
  for (const status of ['pending', 'verified', 'rejected']) assert.match(css, new RegExp(`\\.wb-status\\[data-status="${status}"\\]`));
  const statusCss = css.slice(css.indexOf('.wb-status {'), css.indexOf('/* Stat tile')).replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(statusCss, /accent/);
  for (const f of ['table', 'pager', 'dialog', 'toolbar']) assert.doesNotMatch(read(`src/components/${f}.css`), /accent/, f);
});

test('0.4.1: status never wraps, shown/hidden never use the accent, long-text cells, wrapper position, stacked children, grave button, toolbar alignment', () => {
  const css = read('dist/components.css');
  const strip = (x) => x.replace(/\/\*[\s\S]*?\*\//g, '');
  const statusBlock = css.match(/\.wb-status \{[^}]*\}/)[0];
  assert.match(statusBlock, /white-space:\s*nowrap/);
  assert.match(statusBlock, /overflow-wrap:\s*normal/);
  assert.match(statusBlock, /flex-wrap:\s*nowrap/);
  assert.match(css, /\.wb-status\[data-status="shown"\]/);
  assert.match(css, /\.wb-status\[data-status="verified"\],\s*\.wb-status\[data-status="shown"\] \{/);
  const statusCss = strip(css.slice(css.indexOf('.wb-status {'), css.indexOf('/* Stat tile')));
  assert.doesNotMatch(statusCss, /accent/);
  assert.match(css, /\.wb-table__long \{ overflow-wrap: anywhere; \}/);
  assert.match(css, /\.wb-table-wrap \{\s*position: relative;/);
  assert.match(css, /@container \(max-width: 36rem\) \{[\s\S]*\.wb-table\[data-stack\] :is\(th, td\)\[data-label\] > \* \{ grid-column: 2; \}/);
  const grave = strip(css).match(/\.wb-btn--grave[^{]*\{[^}]*\}/g).join('\n');
  assert.match(grave, /background:\s*var\(--wb-color-ink\)/);
  assert.match(grave, /color:\s*var\(--wb-color-bg\)/);
  assert.match(grave, /:hover/);
  assert.match(grave, /:active/);
  const colours = [...grave.matchAll(/--wb-color-([a-z0-9-]+)/g)].map((m) => m[1]);
  for (const c of colours) assert.ok(['ink', 'ink-2', 'bg'].includes(c), c);
  assert.doesNotMatch(grave, /#[0-9a-f]{3,6}\b|rgba?\(|accent|action/i);
  assert.match(css, /\.wb-toolbar \{[^}]*align-items:\s*flex-start/);
  assert.doesNotMatch(css.match(/\.wb-toolbar \{[^}]*\}/)[0], /flex-end/);
});

test('0.4.1: the grave button reads at 4.5:1 in light and dark, at rest and on hover/active', () => {
  const mix = (a, b, pct) => '#' + [1, 3, 5].map((i) => Math.round(parseInt(a.slice(i, i + 2), 16) * pct + parseInt(b.slice(i, i + 2), 16) * (1 - pct)).toString(16).padStart(2, '0')).join('');
  const light = { ink: '#0F2233', ink2: '#35495A', bg: '#FFFFFF' }, dark = { ink: '#EAF6F5', ink2: '#CBE3E2', bg: '#020B12' };
  for (const c of [light, dark]) for (const pct of [1, 0.85, 0.7]) assert.ok(contrast(mix(c.ink, c.ink2, pct), c.bg) >= 4.5, `${pct}`);
});

// 0.5.0: the Jump In hero and the action ticker (the wahoobay.org home page, the 2026-11-24 design canvas, board D).
// A file's text with every @media (prefers-reduced-motion: no-preference) { … } block taken out, and those blocks.
const motionBlocks = (file) => {
  const css = read(file).replace(/\/\*[\s\S]*?\*\//g, '');
  const inside = [];
  let outside = '';
  let at = 0;
  for (const m of css.matchAll(/@media \(prefers-reduced-motion: no-preference\)\s*\{/g)) {
    if (m.index < at) continue;
    let depth = 1;
    let i = m.index + m[0].length;
    for (; depth > 0 && i < css.length; i += 1) depth += css[i] === '{' ? 1 : css[i] === '}' ? -1 : 0;
    outside += css.slice(at, m.index);
    inside.push(css.slice(m.index + m[0].length, i - 1));
    at = i;
  }
  return { outside: outside + css.slice(at), inside: inside.join('\n') };
};

test('0.5.0 hero: deep water from the four water tokens, white text, the headline at the hero size, tracked in, at .86', () => {
  has(block('.wb-hero'), [/position:\s*relative/, /display:\s*flex/, /align-items:\s*flex-end/, /min-height:\s*clamp\(30rem,\s*100vh,\s*55rem\)/, /overflow:\s*hidden/,
    /background:\s*linear-gradient\(180deg, var\(--wb-color-water-1\) 0%, var\(--wb-color-water-2\) 22%, var\(--wb-color-water-3\) 55%, var\(--wb-color-water-4\) 100%\)/,
    /(^|[;\s])color:\s*var\(--wb-color-on-photo\)/], '.wb-hero');
  has(block('.wb-hero__title'), [/font-family:\s*var\(--wb-font-display\)/, /font-size:\s*var\(--wb-text-hero\)/, /letter-spacing:\s*var\(--wb-track-hero\)/,
    /line-height:\s*0?\.86\s*;/, /font-weight:\s*800/, /margin:\s*0/], '.wb-hero__title');
  has(block('.wb-hero__water'), [/position:\s*absolute/, /inset:\s*0/, /overflow:\s*hidden/, /pointer-events:\s*none/], 'the water, behind the words');
  has(block('.wb-hero__body'), [/position:\s*relative/, /display:\s*flex/, /flex-direction:\s*column/], 'the words, over the water');
  // A tag that wraps on a phone wraps evenly, not with "FL" alone on its second line.
  has(block('.wb-hero__tag'), [/align-self:\s*flex-start/, /border-radius:\s*var\(--wb-radius-pill\)/, /text-transform:\s*uppercase/, /text-wrap:\s*balance/], 'the tag');
  has(block('.wb-hero__lead'), [/max-width:\s*34rem/, /font-size:\s*var\(--wb-text-xl\)/], 'the lead');
  has(block('.wb-hero__foot'), [/display:\s*flex/, /flex-wrap:\s*wrap/, /justify-content:\s*space-between/], 'the lead and the actions');
  has(block('.wb-hero__actions'), [/display:\s*flex/, /flex-wrap:\s*wrap/, /gap:\s*var\(--wb-space-3\)/], 'the actions');
  // As on the stage: a ghost button and the focus ring are drawn in the text colour, which reads on all of the water.
  assert.match(block('.wb-hero .wb-btn--ghost'), /color:\s*var\(--wb-color-on-photo\)/);
  assert.match(block('.wb-hero .wb-btn--ghost:hover'), /border-color:\s*var\(--wb-color-on-photo\)/);
  assert.match(block('.wb-hero :focus-visible'), /outline-color:\s*var\(--wb-color-on-photo\)/);
  assert.doesNotMatch(read('src/components/hero.css').replace(/\/\*[\s\S]*?\*\//g, ''), /--wb-color-(on-)?accent|--wb-color-scrim/, 'the hero owns no accent and no scrim: its boxes are .wb-detect');
});

// The lanes: six, each with its height in the water, its time and its way across (odd lanes swim right, even left).
// 2026-11-24 (Dan): more, and more varied, animals: a shark, a turtle and a ray, drawn as plainly as the fish.
test('0.5.0 hero: six rays, ten bubbles and six lanes of swimmers, each placed by its own rule; a swimmer is a silhouette in its detection box', () => {
  for (let n = 1; n <= 6; n += 1) has(block(`.wb-hero__rays > span:nth-child(${n})`), [/left:\s*\d+%/, /width:\s*[\d.]+rem/], `ray ${n}`);
  for (let n = 1; n <= 10; n += 1) assert.match(block(`.wb-hero__bubbles > span:nth-child(${n})`), /left:\s*\d+%/, `bubble ${n}`);
  for (let n = 1; n <= 6; n += 1) has(block(`.wb-hero__fish:nth-child(${n})`), [/top:\s*\d+%/, /width:\s*[\d.]+rem/], `lane ${n}`);
  has(block('.wb-hero__rays > span'), [/position:\s*absolute/, /background:\s*linear-gradient\(180deg, var\(--wb-color-ray\), var\(--wb-color-ray-0\)\)/,
    /mask-image:\s*linear-gradient\(90deg, transparent, var\(--wb-color-on-photo\), transparent\)/, /transform-origin:\s*top center/], 'a ray');
  has(block('.wb-hero__bubbles > span'), [/position:\s*absolute/, /border:\s*1px solid var\(--wb-color-bubble\)/, /border-radius:\s*50%/, /opacity:\s*0\s*;/], 'a bubble, unseen until it rises');
  has(block('.wb-hero__fish'), [/position:\s*absolute/, /aspect-ratio:\s*2\s*;/], 'a fish');
  has(block('.wb-hero__fish::before'), [/content:\s*""/, /position:\s*absolute/, /inset:\s*0/, /background:\s*var\(--wb-color-fish\)/,
    /mask-image:\s*url\("data:image\/svg\+xml,[^"]+"\)/, /mask-size:\s*contain/, /mask-repeat:\s*no-repeat/], 'the silhouette');
  // The even lanes swim the other way: the silhouette faces left, mirrored with `scale`, so a shape's own motion
  // (the ray's wings, the turtle's paddling) can use `transform` on it.
  assert.match(block('.wb-hero__fish:nth-child(even)::before'), /^\s*scale:\s*-1 1;?\s*$/);
  // The shapes: each its own drawing and proportions, and a size of its own whatever its lane (a shark is never small).
  for (const [shape, ratio] of [['shark', '3.4'], ['turtle', '1.5'], ['ray', '1.55']]) {
    assert.match(block(`.wb-hero__fish--${shape}::before`), /^\s*mask-image:\s*url\("data:image\/svg\+xml,[^"]+"\);?\s*$/, `${shape}: its drawing`);
    has(block(`.wb-hero__school > .wb-hero__fish--${shape}`), [/width:\s*[\d.]+rem/, new RegExp(`aspect-ratio:\\s*${ratio.replace('.', '\\.')}\\s*;`)], `${shape}: its size`);
  }
  // The spotted eagle ray's spots are holes in its drawing: the water shows through them.
  assert.ok((block('.wb-hero__fish--ray::before').match(/a\d/g) ?? []).length >= 6, 'six spots or more (one arc command each, its second arc a repeat)');
  const css = read('dist/components.css');
  assert.ok(css.indexOf('.wb-hero__school > .wb-hero__fish--shark') > css.indexOf('.wb-hero__fish:nth-child(6)'), 'a shape\'s size comes after the lanes, so it wins');
  // A fish's box is the design's detection box (detect.css owns it), a little larger than the silhouette, its label above.
  assert.match(block('.wb-hero__fish > .wb-detect'), /inset:\s*-0\.625rem -0\.875rem/);
  assert.doesNotMatch(read('src/components/hero.css').replace(/\/\*[\s\S]*?\*\//g, ''), /\.wb-detect/, 'detect.css styles the box, after the chart, in its own file');
});

test('0.5.0 hero: everything that moves moves only without reduced motion; with it, the fish are not drawn and the water is still', () => {
  const { outside, inside } = motionBlocks('src/components/hero.css');
  assert.doesNotMatch(outside, /\banimation(?!-play-state)[a-z-]*\s*:/, 'no animation outside the no-preference blocks (holding one, animation-play-state, may be anywhere)');
  for (const name of ['wb-hero-sway', 'wb-hero-rise', 'wb-hero-swim', 'wb-hero-swim-left', 'wb-hero-bob', 'wb-hero-flap', 'wb-hero-paddle']) assert.match(outside, new RegExp(`@keyframes ${name}\\s*\\{`), name);
  for (let n = 2; n <= 6; n += 1) assert.match(inside, new RegExp(`\\.wb-hero__fish:nth-child\\(${n}\\)\\s*\\{[^}]*animation-delay:`), `lane ${n} sets off at its own time`);
  // A swimmer starts and ends out of sight: past the edge by its own width and 8rem more, room for a label longer than it.
  assert.match(outside, /@keyframes wb-hero-swim\s*\{\s*from\s*\{\s*translate:\s*calc\(-100% - 8rem\) 0;?\s*\}\s*to\s*\{\s*translate:\s*calc\(100vw \+ 8rem\) 0;?\s*\}\s*\}/, 'across the whole width');
  assert.match(outside, /@keyframes wb-hero-swim-left\s*\{\s*from\s*\{\s*translate:\s*calc\(100vw \+ 8rem\) 0;?\s*\}\s*to\s*\{\s*translate:\s*calc\(-100% - 8rem\) 0;?\s*\}\s*\}/, 'and back');
  assert.match(outside, /@keyframes wb-hero-flap\s*\{[^}]*transform:\s*scaleY\(/, 'the ray\'s wings');
  assert.match(outside, /@keyframes wb-hero-paddle\s*\{[^}]*transform:\s*rotate\(/, 'the turtle rocks as it paddles');
  // Still water draws no fish (a box frozen on a drawn fish says nothing), and the bubbles stay below the edge, unseen.
  assert.match(block('.wb-hero__school'), /display:\s*none/);
  assert.match(inside, /\.wb-hero__school\s*\{\s*display:\s*block;?\s*\}/, 'the fish swim only with motion');
  for (let n = 2; n <= 6; n += 1) assert.match(inside, new RegExp(`\\.wb-hero__rays > span:nth-child\\(${n}\\)\\s*\\{[^}]*animation-duration:[^}]*animation-delay:`), `ray ${n} keeps its own time`);
  for (let n = 2; n <= 10; n += 1) assert.match(inside, new RegExp(`\\.wb-hero__bubbles > span:nth-child\\(${n}\\)\\s*\\{[^}]*animation-delay:`), `bubble ${n} rises at its own time`);
});

// WCAG 2.2.2 (level A): motion that starts by itself and lasts more than five seconds can be paused. The page's button
// sets data-motion="paused" on the root; with reduced motion nothing moves, so there is no button.
test('0.5.0 hero: a pause button for the motion, shown once the page can use it, and none with reduced motion', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /\[data-motion="paused"\] :is\(\.wb-hero, \.wb-ticker\) \*\s*\{\s*animation-play-state:\s*paused;?\s*\}/);
  // A media control, not a third call to action: a 44px round button in the corner, its icon the only thing drawn and its
  // name ("Pause motion", "Play motion") screen-reader text.
  has(block('.wb-hero__pause'), [/position:\s*absolute/, /right:\s*var\(--wb-space-4\)/, /bottom:\s*var\(--wb-space-4\)/, /display:\s*grid/, /place-items:\s*center/,
    /width:\s*2\.75rem/, /height:\s*2\.75rem/, /padding:\s*0/, /border:\s*1\.5px solid color-mix\(in srgb, var\(--wb-color-on-photo\) 60%, transparent\)/,
    /border-radius:\s*50%/, /color:\s*var\(--wb-color-on-photo\)/, /font-size:\s*1\.25rem/, /cursor:\s*pointer/], 'the pause button, in the corner');
  assert.match(block('.wb-hero__pause:hover'), /border-color:\s*var\(--wb-color-on-photo\)/);
  assert.match(block('.wb-hero__pause[hidden]'), /display:\s*none/, 'hidden until the page\'s script shows it (.wb-btn is inline-flex)');
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.wb-hero__pause\s*\{\s*display:\s*none;?\s*\}\s*\}/);
});

test('0.5.0 ticker: the action words between two 1px lines, in the display face, every third in the action colour', () => {
  has(block('.wb-ticker'), [/overflow:\s*hidden/, /border-top:\s*1px solid var\(--wb-color-line\)/, /border-bottom:\s*1px solid var\(--wb-color-line\)/,
    /padding-top:\s*var\(--wb-space-5\)/, /padding-bottom:\s*var\(--wb-space-5\)/], '.wb-ticker');
  has(block('.wb-ticker__group'), [/display:\s*flex/, /flex-wrap:\s*wrap/, /margin:\s*0/, /padding:\s*0/, /list-style:\s*none/], 'a group of words');
  has(block('.wb-ticker__word'), [/font-family:\s*var\(--wb-font-display\)/, /font-size:\s*var\(--wb-text-2xl\)/, /font-weight:\s*700/, /white-space:\s*nowrap/,
    /color:\s*var\(--wb-color-ink-3\)/], 'a word');
  assert.match(block('.wb-ticker__word:nth-child(3n + 1)'), /^\s*color:\s*var\(--wb-color-action\);?\s*$/, 'every third word, from the first');
  has(block('.wb-ticker__word::after'), [/content:\s*""/, /border-radius:\s*50%/, /background:\s*var\(--wb-color-line\)/], 'the dot between words');
  // Still, the words wrap in one group and the copy is not drawn; moving, the track holds both groups in a row and
  // scrolls by one group's width, so the loop has no seam. The pointer over it holds it.
  assert.match(block('.wb-ticker__group + .wb-ticker__group'), /display:\s*none/);
  const { outside, inside } = motionBlocks('src/components/ticker.css');
  assert.doesNotMatch(outside, /\banimation(?!-play-state)[a-z-]*\s*:/, 'no animation outside the no-preference block (holding one, animation-play-state, may be anywhere)');
  assert.match(outside, /@keyframes wb-ticker\s*\{\s*to\s*\{\s*transform:\s*translateX\(-50%\);?\s*\}\s*\}/);
  assert.match(inside, /\.wb-ticker__track\s*\{[^}]*width:\s*max-content[^}]*animation:\s*wb-ticker 45s linear infinite/);
  assert.match(inside, /\.wb-ticker__group\s*\{[^}]*flex-wrap:\s*nowrap/);
  assert.match(inside, /\.wb-ticker__group \+ \.wb-ticker__group\s*\{\s*display:\s*flex;?\s*\}/);
  assert.match(inside, /\.wb-ticker:hover \.wb-ticker__track\s*\{\s*animation-play-state:\s*paused;?\s*\}/);
  // Still, the words wrap onto rows, where a dot would end a row: there are none, and the gap alone parts the words.
  assert.match(outside, /@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.wb-ticker__word::after\s*\{\s*content:\s*none;?\s*\}\s*\}/);
  assert.doesNotMatch(outside + inside, /:last-child::after/, 'in the loop every word has its dot, the last one too');
});

// As the site's species list (its explorer) names them, which the site reads them from; each with its shape.
const HERO_FISH = [['Sergeant Major', ''], ['Blue Tang Surgeonfish', ''], ['Bar Jack', ''], ['Spotted Eagle Ray', 'ray'], ['Nurse Shark', 'shark'], ['Green Sea Turtle', 'turtle']];
const TICKER_WORDS = ['Visit', 'Swim', 'Snorkel', 'Jump in', 'Explore', 'Learn', 'Watch', 'Discover', 'Participate', 'Volunteer', 'Contribute', 'Protect'];

test('index.html shows the hero and the ticker in both themes, as the home page draws them', () => {
  for (const [name, part] of theme(read('dist/index.html'))) {
    const hero = part.match(/<div class="wb-hero">([\s\S]*?)<\/button>\s*<\/div>/)?.[1] ?? '';
    assert.ok(hero, `${name}: a hero`);
    const water = hero.match(/<div class="wb-hero__water" aria-hidden="true">([\s\S]*?)<\/div>\s*<div class="wb-container wb-hero__body">/)?.[1] ?? '';
    assert.equal(water.match(/<div class="wb-hero__rays">((?:<span><\/span>)+)<\/div>/)?.[1].match(/<span>/g).length, 6, `${name}: six rays`);
    assert.equal(water.match(/<div class="wb-hero__bubbles">((?:<span><\/span>)+)<\/div>/)?.[1].match(/<span>/g).length, 10, `${name}: ten bubbles`);
    const fish = [...water.matchAll(/<div class="wb-hero__fish(?: wb-hero__fish--([a-z]+))?"><div class="wb-detect"><span class="wb-detect__label">([^<]+)<\/span><\/div><\/div>/g)].map((m) => [m[2], m[1] ?? '']);
    assert.deepEqual(fish, HERO_FISH, `${name}: six swimmers in their boxes, three fish, a ray, a shark and a turtle, named from the species list`);
    assert.match(hero, /<p class="wb-hero__tag"[^>]*>[^<]+<\/p>\s*<h4 class="wb-hero__title"[^>]*>The reef<br>is live\.<\/h4>/, `${name}: the tag, then the headline`);
    assert.match(hero, /<div class="wb-hero__foot">\s*<p class="wb-hero__lead"[^>]*>[^<]+<\/p>\s*<div class="wb-hero__actions">\s*<a class="wb-btn wb-btn--action" href="#">[^<]+<\/a>\s*<a class="wb-btn wb-btn--ghost" href="#">[^<]+<\/a>\s*<\/div>\s*<\/div>/,
      `${name}: the lead beside the two actions`);
    assert.match(hero, /<button class="wb-hero__pause" type="button"><svg class="wb-icon"[^>]*>[\s\S]*?<\/svg><span class="wb-sr-only">Pause motion<\/span>$/, `${name}: the pause button, named for screen readers`);
    const ticker = part.match(/<div class="wb-ticker" role="region" aria-label="[^"]+">\s*<div class="wb-ticker__track" data-impeccable-ignore="marquee">([\s\S]*?)<\/div>\s*<\/div>/)?.[1] ?? '';
    const groups = [...ticker.matchAll(/<ul class="wb-ticker__group" role="list"( aria-hidden="true")?>([\s\S]*?)<\/ul>/g)];
    assert.equal(groups.length, 2, `${name}: the words and their copy`);
    assert.deepEqual(groups.map((g) => Boolean(g[1])), [false, true], `${name}: the copy is hidden from screen readers`);
    for (const [, , words] of groups) assert.deepEqual([...words.matchAll(/<li class="wb-ticker__word">([^<]+)<\/li>/g)].map((m) => m[1]), TICKER_WORDS, `${name}: the twelve words`);
  }
});
