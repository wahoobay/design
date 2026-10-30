import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

export async function build(root = process.cwd()) {
  const dist = join(root, 'dist');
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, 'logo'), { recursive: true });
  for (const name of await readdir(join(root, 'brand'))) {
    if (name.endsWith('.svg')) {
      await cp(join(root, 'brand', name), join(dist, 'logo', name));
    }
  }
  await writeFile(join(dist, 'tokens.css'), tokensCss(JSON.parse(await readFile(join(root, 'tokens', 'tokens.json'), 'utf8'))));
}

const HEADER = '/* Wahoo Bay design tokens — generated from tokens/tokens.json; values from docs/superpowers/specs/2026-10-29-wahoobay-net-overhaul-design.md §4.3 (wahoobay/infra). Do not edit by hand. */';

const decls = (prefix, map) => Object.entries(map).map(([k, v]) => `  --wb-${prefix}${k}: ${v};`);

function tokensCss(t) {
  const radius = Object.entries(t.radius).map(([k, v]) => `  --wb-radius${k === 'default' ? '' : `-${k}`}: ${v};`);
  const light = [
    ...decls('color-', t.color.light),
    ...decls('font-', t.font),
    ...decls('text-', t.text),
    ...decls('space-', t.space),
    ...radius,
    `  --wb-shadow: ${t.shadow};`,
    `  --wb-measure: ${t.measure};`,
  ];
  return `${HEADER}\n:root {\n${light.join('\n')}\n}\n[data-theme="dark"] {\n${decls('color-', t.color.dark).join('\n')}\n}\n`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await build();
}
