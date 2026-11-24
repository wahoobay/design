import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

test('fonts.css declares Inter Variable and Bricolage Grotesque Variable for both shipped subsets and every file exists', () => {
  const css = readFileSync('dist/fonts.css', 'utf8');
  assert.ok(css.includes('font-family: "Inter Variable"'));
  assert.ok(css.includes('font-family: "Bricolage Grotesque Variable"'));
  assert.doesNotMatch(css, /Manrope/);
  assert.ok(css.includes('font-display: swap'));
  assert.equal(css.match(/@font-face/g).length, 4);
  const urls = [...css.matchAll(/url\("\.\/fonts\/([^"]+)"\)/g)].map((m) => m[1]);
  assert.deepEqual(urls.sort(), ['bricolage-grotesque-latin-ext-wght-normal.woff2', 'bricolage-grotesque-latin-wght-normal.woff2', 'inter-latin-ext-wght-normal.woff2', 'inter-latin-wght-normal.woff2']);
  for (const f of urls) assert.ok(existsSync(`dist/fonts/${f}`), f);
});
test('components.css carries the base styles', () => {
  const css = readFileSync('dist/components.css', 'utf8');
  for (const s of ['html { color-scheme: light; }', '[data-theme="dark"] { color-scheme: dark; }', '::selection', ':focus-visible', '.wb-num', '.wb-prose'])
    assert.ok(css.includes(s), s);
});
test('components.css uses tokens only: no hex, no small px font-size, no prefers-color-scheme, every var exists', () => {
  const css = readFileSync('dist/components.css', 'utf8');
  const tokens = readFileSync('dist/tokens.css', 'utf8');
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b/i);
  assert.doesNotMatch(css, /prefers-color-scheme/);
  for (const m of css.matchAll(/font-size:\s*(\d+(?:\.\d+)?)px/g)) assert.ok(Number(m[1]) >= 12, m[0]);
  for (const m of css.matchAll(/var\((--wb-[a-z0-9-]+)/g)) assert.ok(tokens.includes(`${m[1]}:`), m[1]);
});
// 0.5.0: the large type is set in the display family: h1 and h2, the stage title and the figure values.
test('components.css sets headings, the stage title and figures in the display family', () => {
  const css = readFileSync('dist/components.css', 'utf8');
  assert.match(css, /h1, h2 \{[^}]*font-family: var\(--wb-font-display\)/);
  assert.match(css, /\.wb-stage__title \{[^}]*font-family: var\(--wb-font-display\)/);
  assert.match(css, /\.wb-figure__value \{[^}]*font-family: var\(--wb-font-display\)/);
});
