import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

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
];

// The component files in build order; each one's first class must appear in this order.
const ORDER = ['wb-prose', 'wb-nav', 'wb-btn', 'wb-live', 'wb-chip', 'wb-tile', 'wb-panel', 'wb-card', 'wb-chart', 'wb-detect', 'wb-field', 'wb-footer', 'wb-container'];

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
