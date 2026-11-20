// Leonida Platinum Log — entrypoint.
// Hands the guide in: copies app/ and screenshots/ from this repository to
// the output directory and writes dossier.json with the kit's buildDossier.
// Runs under plain node (node22, no network, read-only /bot): no document,
// no browser globals, no network — only node:fs, node:path and node:url.
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const REPO_ROOT = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || '/output';

const CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000
};

function copyTree(name: string): void {
  const from = join(REPO_ROOT, name);
  if (!existsSync(from)) return;
  cpSync(from, join(OUTPUT_DIR, name), { recursive: true });
}

mkdirSync(OUTPUT_DIR, { recursive: true });
copyTree('app');
copyTree('screenshots');

const dossier = buildDossier(OUTPUT_DIR, CAPS);
writeFileSync(join(OUTPUT_DIR, 'dossier.json'), dossier);
console.log('wrote ' + join(OUTPUT_DIR, 'dossier.json') + ' (' + dossier.length + ' bytes)');
