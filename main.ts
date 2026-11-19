// Leonida Platinum — entrypoint (Node 22, standard library only).
//
// The guide itself is plain static files in app/: open app/index.html in a
// desktop browser and it works with the network off. This file is the
// hand-in step: it copies app/ and screenshots/ into the output directory
// the grader reads, then writes dossier.json — the summary the judge reads
// (screenshots, first-load files and bytes, and the source outline) — using
// the vendored make.fun library. Leave vendor/makefun-frontend.ts alone:
// the scorer requires dossier.json to be byte for byte what its own copy
// of that library writes.
//
// Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// then serve the output with any static server, or open out/app/index.html.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { buildDossier } from "./vendor/makefun-frontend.ts";

const here = fileURLToPath(new URL(".", import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

function handIn() {
  mkdirSync(outDir, { recursive: true });
  cpSync(join(here, "app"), join(outDir, "app"), { recursive: true });
  mkdirSync(join(outDir, "screenshots"), { recursive: true });
  if (existsSync(join(here, "screenshots"))) {
    cpSync(join(here, "screenshots"), join(outDir, "screenshots"), { recursive: true });
  }
  // The scorer's own caps (reference/gate.json): text_max_bytes shapes the
  // dossier bytes; the rest refuse an entry the scorer would refuse — more
  // than 4 screenshots or one over 256 KiB; more than 993 files and
  // directories in app/ or 48 MiB of app files.
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, "dossier.json"), dossier);
  console.log(`Leonida Platinum handed in to ${outDir}`);
}

handIn();
