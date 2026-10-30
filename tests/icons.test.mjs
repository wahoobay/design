import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const ICONS = ['arrow-left', 'arrow-right', 'external'];

test('the icon set: one stroke weight, currentColor, and each file is already correct inlined', () => {
  for (const name of ICONS) {
    const file = `icons/${name}.svg`;
    assert.ok(existsSync(file), file);
    const svg = read(file);
    const root = svg.match(/<svg\b[^>]*>/)?.[0] ?? '';
    assert.match(root, /\bviewBox="0 0 24 24"/, `${file}: viewBox`);
    assert.match(root, /\bfill="none"/, `${file}: fill`);
    assert.match(root, /\bstroke="currentColor"/, `${file}: stroke`);
    assert.match(root, /\bstroke-width="2"/, `${file}: stroke width`);
    assert.match(root, /\bstroke-linecap="round"/, `${file}: linecap`);
    assert.match(root, /\bstroke-linejoin="round"/, `${file}: linejoin`);
    assert.match(root, /\bclass="wb-icon"/, `${file}: class`);
    assert.match(root, /\baria-hidden="true"/, `${file}: aria-hidden`);
    assert.match(root, /\bfocusable="false"/, `${file}: focusable`);
    for (const [, value] of svg.matchAll(/\bfill="([^"]*)"/g)) assert.equal(value, 'none', `${file}: fill="${value}"`);
    for (const [, value] of svg.matchAll(/\bstroke="([^"]*)"/g)) assert.equal(value, 'currentColor', `${file}: stroke="${value}"`);
    assert.equal(svg.match(/\bstroke-width="/g).length, 1, `${file}: one stroke width, on the root`);
    assert.doesNotMatch(svg, /#[0-9a-f]{3,8}\b|\brgba?\(|\bhsla?\(|\bstyle=/i, `${file}: no colour literal or inline style`);
  }
});

test('the build copies the icons to dist/icons, and the package exports them', () => {
  for (const name of ICONS) assert.equal(read(`dist/icons/${name}.svg`), read(`icons/${name}.svg`), name);
  const { exports } = JSON.parse(read('package.json'));
  assert.equal(exports['./icons/*'], './dist/icons/*');
});

test('.wb-icon is 1em square, never shrinks and sits on the text baseline', () => {
  const css = read('dist/components.css').replace(/\/\*[\s\S]*?\*\//g, '');
  const body = css.match(/(?:^|\})\s*\.wb-icon\s*\{([^}]*)\}/)?.[1] ?? '';
  for (const d of [/width:\s*1em/, /height:\s*1em/, /flex:\s*none/, /vertical-align:\s*-0\.125em/]) assert.match(body, d, String(d));
});

test('index.html inlines every icon in both themes, from the shipped files', () => {
  const html = read('dist/index.html');
  assert.doesNotMatch(html, /@wb-icon/, 'no icon placeholder left');
  const at = html.indexOf('<section data-theme="dark"');
  for (const name of ICONS) {
    const svg = read(`icons/${name}.svg`);
    const inner = svg.slice(svg.indexOf('>', svg.indexOf('<svg')) + 1, svg.lastIndexOf('</svg>')).trim();
    assert.ok(html.slice(0, at).includes(inner), `light: ${name}`);
    assert.ok(html.slice(at).includes(inner), `dark: ${name}`);
  }
});
