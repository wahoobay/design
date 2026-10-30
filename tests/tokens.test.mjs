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
