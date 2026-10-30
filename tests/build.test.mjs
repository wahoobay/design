import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
test('build copies the logo files into dist/logo', () => {
  assert.ok(existsSync('dist/logo/wahoobay-logo.svg'));
  assert.ok(existsSync('dist/logo/wahoobay-mark.svg'));
  assert.match(readFileSync('dist/logo/wahoobay-logo.svg', 'utf8'), /fill="currentColor"/);
});
