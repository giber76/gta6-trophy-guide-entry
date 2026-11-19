// Leonida Platinum — the entrypoint for this gta6-trophy-guide-01 submission.
//
// What this program does, in plain terms: it takes the finished guide (the
// static files in app/) and the screenshots (in screenshots/) and publishes
// them into the output directory the grader reads, then writes a dossier.json
// that summarises the entry for the judge. The dossier is produced by the
// vendored make.fun library, which the scorer requires to be byte for byte
// what its own copy writes, so this file does not build the dossier by hand.
//
// The guide itself is plain static files: app/index.html plus its CSS and
// JavaScript, with the trophy data in app/data/trophies.json and the roadmap
// in app/data/roadmap.json. Nothing is fetched over the network, so the app
// works fully offline. To look at it locally, run `node serve.ts` and open
// http://localhost:8080.
//
// To run this entrypoint outside the grader's container, point the output
// directory at a folder of your choice:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The folder this file lives in, so the app/ and screenshots/ beside it can
// always be found no matter where the program is started from.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));

// The grader reads /output. Outside the grader, MAKEFUN_OUTPUT_DIR stands
// in for it, which is how the entry is tested locally.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Publish the guide and its screenshots into the output directory.
function publishAssets() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  const shotsDir = join(repoRoot, 'screenshots');
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }
}

// Write the dossier the judge reads. The caps come from the scorer's own
// reference, so an entry that passes here will not be refused for size:
// at most 163840 bytes of text, at most 4 screenshots of 262144 bytes each,
// and at most 993 files totalling 48 MiB inside app/.
function writeDossier() {
  const dossier = buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

publishAssets();
writeDossier();
