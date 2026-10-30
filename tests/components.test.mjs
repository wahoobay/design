import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');

// The class names the site consumes, exactly as the design system publishes them.
const CLASSES = [
  'wb-container',
  'wb-nav', 'wb-nav__logo', 'wb-nav__links', 'wb-nav__link', 'wb-nav__link--on', 'wb-nav__cta',
  'wb-btn', 'wb-btn--action', 'wb-btn--ghost', 'wb-btn--accent',
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
];

// The component files in build order; each one's first class must appear in this order.
const ORDER = ['wb-prose', 'wb-nav', 'wb-icon', 'wb-btn', 'wb-live', 'wb-chip', 'wb-tile', 'wb-panel', 'wb-card', 'wb-media', 'wb-chart', 'wb-detect', 'wb-field', 'wb-footer', 'wb-container'];

// The only components allowed to use the Seagrass accent ("alive right now").
const ACCENT_OWNERS = ['wb-live', 'wb-chip', 'wb-tile--accent', 'wb-detect', 'wb-btn--accent', 'wb-chart'];

const selector = (cls) => new RegExp(`\\.${cls.replace(/-/g, '\\-')}(?![\\w-])`);
const classesUsed = (html) => new Set([...html.matchAll(/class="([^"]*)"/g)].flatMap((m) => m[1].split(/\s+/)));
const rules = (css) => [...css.replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ selector: m[1].trim(), body: m[2] }));

test('every var(--wb-…) in components.css names a token in tokens.css', () => {
  const css = read('dist/components.css');
  const tokens = read('dist/tokens.css');
  for (const m of css.matchAll(/var\((--wb-[a-z0-9-]+)/g)) assert.ok(tokens.includes(`${m[1]}:`), m[1]);
});

test('components.css has no hex colour and no px font-size below 12px', () => {
  const css = read('dist/components.css');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
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
    for (const part of sel.split(',')) {
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

test('body text keeps "(c)" as typed: Manrope\'s common ligatures are off', () => {
  const body = rules(read('dist/components.css')).find((r) => r.selector === 'body');
  assert.match(body.body, /font-variant-ligatures:\s*no-common-ligatures/);
});

test('the inlined logo has no inline style, so it follows currentColor; components.css needs no !important', () => {
  const html = read('dist/index.html');
  const svgs = [...html.matchAll(/<svg\b[^>]*aria-labelledby="wb-logo-title-\d+"[^>]*>/g)].map((m) => m[0]);
  assert.equal(svgs.length, 4, "two navs and two dark logo tiles");
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

test('the live badge breathes, only without reduced motion, and nothing else animates (spec §4.3)', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(css, /@keyframes wb-live-breathe\s*\{/);
  assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.wb-live::before\s*\{[^}]*animation:[^;]*wb-live-breathe/);
  assert.equal(css.match(/\banimation(-name)?:/g)?.length, 1, 'one animation in components.css');
});

test('the dark focus ring is not the accent, which means "alive right now"', () => {
  const { dark } = JSON.parse(read('tokens/tokens.json')).color;
  assert.ok(!['accent', 'accent-text', 'accent-tint'].some((k) => dark[k] === dark.focus), dark.focus);
});

test('detector waivers appear only where the spec overrides the detector: brand tile numbers and live badges', () => {
  const raw = read('dist/index.html');
  const html = raw.replace(/<!--[\s\S]*?-->/g, '');
  const waivers = [...html.matchAll(/<\w+ class="([^"]*)" data-impeccable-ignore="([^"]*)"/g)].map((m) => `${m[1]} ${m[2]}`);
  assert.equal(waivers.length, [...html.matchAll(/data-impeccable-ignore=/g)].length, 'every waiver sits right after a class');
  for (const w of waivers) assert.ok(['wb-tile__v low-contrast', 'wb-live pulsing-dot'].includes(w), w);
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
  assert.equal(navs.length, 2);
  for (const nav of navs) assert.equal(nav.match(/class="wb-nav__link[ "]/g)?.length, 6);
});
