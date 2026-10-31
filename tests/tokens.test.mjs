import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { contrast, pairs } from '../scripts/contrast.mjs';

test('light and dark tokens meet WCAG AA on every text pair', () => {
  const tokens = JSON.parse(readFileSync('tokens/tokens.json', 'utf8'));
  for (const theme of ['light', 'dark']) for (const [fg, bg] of pairs) {
    const ratio = contrast(tokens.color[theme][fg] ?? tokens.color.light[fg], tokens.color[theme][bg] ?? tokens.color.light[bg]);
    assert.ok(ratio >= 4.5, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}`);
  }
});
test('tokens.css carries the decided values', () => {
  const css = readFileSync('dist/tokens.css', 'utf8');
  for (const line of ['--wb-color-brand: #0088D6', '--wb-color-action: #0072B5', '--wb-color-accent: #0B7F72', '--wb-radius: 12px'])
    assert.ok(css.includes(line), line);
  assert.match(css, /\[data-theme="dark"\]\s*\{[^}]*--wb-color-accent: #2DD4BF/);
  assert.doesNotMatch(css, /prefers-color-scheme/);
});
test('tokens: display and figure sizes, display tracking', () => {
  const t = readFileSync('dist/tokens.css', 'utf8');
  assert.match(t, /--wb-text-display:\s*clamp\(3rem,\s*7\.5vw,\s*7rem\)/);
  assert.match(t, /--wb-text-figure:\s*clamp\(2\.5rem,\s*5vw,\s*4\.5rem\)/);
  assert.match(t, /--wb-track-display:\s*-0?\.04em/);
});
// The scrims are the dark ground at partial alpha. They have no contrast pair in scripts/contrast.mjs: what shows through
// them is a photograph, so their contrast is checked by eye (spec §4.3), not computed.
test('tokens: text on photographs and its scrim are the same in both themes', () => {
  const t = readFileSync('dist/tokens.css', 'utf8');
  const [light, dark] = [t.match(/:root\s*\{([^}]*)\}/)[1], t.match(/\[data-theme="dark"\]\s*\{([^}]*)\}/)[1]];
  for (const [theme, block] of [['light', light], ['dark', dark]]) {
    assert.match(block, /--wb-color-on-photo: #FFFFFF;/, `${theme}: on-photo`);
    assert.match(block, /--wb-color-scrim: rgb\(11 27 43 \/ 0\.85\);/, `${theme}: scrim`);
    assert.match(block, /--wb-color-scrim-0: rgb\(11 27 43 \/ 0\);/, `${theme}: scrim-0`);
    assert.match(block, /--wb-color-scrim-top: rgb\(11 27 43 \/ 0\.55\);/, `${theme}: scrim-top`);
  }
});
// 0.3.0: chart series 3 to 8 are the Wong colour-blind-safe set (spec §4.3), after brand blue (series 1) and the accent
// (series 2). They are the strokes and fills of chart marks, never text, so they have no contrast pair.
test('tokens: chart series 3 to 8 are the Wong set, the same in both themes, and never a text pair', () => {
  const t = readFileSync('dist/tokens.css', 'utf8');
  const [light, dark] = [t.match(/:root\s*\{([^}]*)\}/)[1], t.match(/\[data-theme="dark"\]\s*\{([^}]*)\}/)[1]];
  const series = { 3: '#E69F00', 4: '#56B4E9', 5: '#D55E00', 6: '#CC79A7', 7: '#009E73', 8: '#F0E442' };
  for (const [theme, block] of [['light', light], ['dark', dark]]) {
    for (const [n, hex] of Object.entries(series)) assert.match(block, new RegExp(`--wb-color-series-${n}: ${hex};`), `${theme}: series ${n}`);
    assert.equal(block.match(/--wb-color-series-\d+:/g)?.length, 6, `${theme}: six series tokens, none for 1 and 2`);
  }
  assert.ok(!pairs.flat().some((name) => name.startsWith('series')), 'no series token in a text pair');
});
