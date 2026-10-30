import { cp, mkdir, readdir, rm } from 'node:fs/promises';
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
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await build();
}
