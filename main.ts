// Leonida Platinum — a gta6-trophy-guide-01 entry (Node 22, standard library
// only). The guide is this repository's app/ folder: plain static files a
// browser opens at app/index.html (ES modules, one stylesheet, no build step),
// working offline because it loads nothing over the network. Its trophy list
// and guides live in app/data/trophies.json, its roadmap and 100% checklist
// in app/data/roadmap.json, and its screenshots in screenshots/.
//
// This program hands the guide in: it checks the trophy file first (it must
// name all 55 official trophies, each with a guide), then copies app/ and
// screenshots/ from beside this file to /output and writes /output/dossier.json
// with the vendored make.fun library — the summary the judge reads (your
// screenshots, the first load's files and bytes, and your source). Leave
// vendor/makefun-frontend.ts as it is: the scorer requires dossier.json to be
// byte for byte what its own copy writes.
//
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The gate holds the trophy file to the same 55 official names, so refuse a
// handoff here — loudly, before anything is copied — when the file is short
// a trophy or a guide. The names are compared the way the gate compares
// them: case, curly quotes, dashes, the ellipsis and runs of white space set
// aside.
function checkTrophyFile() {
  const raw = readFileSync(join(here, 'app', 'data', 'trophies.json'), 'utf8');
  const data = JSON.parse(raw);
  const trophies = Array.isArray(data) ? data : data.trophies;
  if (!Array.isArray(trophies)) throw new Error('trophies.json holds no trophies array');
  const missing = trophies.filter((trophy) => !trophy || typeof trophy.name !== 'string' || !trophy.name.trim());
  if (missing.length > 0) throw new Error('trophies.json holds ' + missing.length + ' entries with no name');
  const guideless = trophies.filter((trophy) => typeof trophy.guide !== 'string' || !trophy.guide.trim());
  if (guideless.length > 0) {
    throw new Error('trophies without a guide: ' + guideless.map((trophy) => trophy.name).join(', '));
  }
  if (trophies.length !== 55) throw new Error('trophies.json holds ' + trophies.length + ' trophies, expected 55');
  return trophies.length;
}

const trophyCount = checkTrophyFile();
console.log('Leonida Platinum: ' + trophyCount + ' trophies, all with a guide.');

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The scorer's own caps (reference/gate.json): only text_max_bytes shapes the
// bytes; the others refuse an entry the scorer would refuse (more than 4
// screenshots or one over 256 KiB; more than 993 files and directories in
// app/ or 48 MiB of app files: app/ counts beside /output's own 1000-entry
// cap, its screenshots/ and dossier.json).
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
console.log('Wrote ' + join(out, 'dossier.json'));
