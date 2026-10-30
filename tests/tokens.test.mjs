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
  }
});
