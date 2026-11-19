// Leonida — GTA VI Trophy Guide & Tracker (gta6-trophy-guide-01).
// Node 22, standard library only. The entrypoint hands the guide in: it copies
// app/ (the offline guide) and screenshots/ (its renders) from beside this file
// to /output, then writes /output/dossier.json with the vendored make.fun
// library. Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// vendor/makefun-frontend.ts is the kit's copy, unchanged: the scorer rebuilds
// the dossier with its own copy and compares the two byte for byte.

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function copyTreeIfPresent(name: string): void {
  const source = join(repoRoot, name);
  if (!existsSync(source)) return;
  cpSync(source, join(outputDir, name), { recursive: true });
}

function shotCount(): number {
  const shots = join(outputDir, 'screenshots');
  if (!existsSync(shots)) return 0;
  return readdirSync(shots).filter((f) => !f.startsWith('.')).length;
}

mkdirSync(outputDir, { recursive: true });
copyTreeIfPresent('app');
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
copyTreeIfPresent('screenshots');

// Fail fast instead of handing in a screenshot-less entry: the judge reads
// the guide through its screenshots, so an entry without them is worthless.
if (shotCount() === 0) {
  throw new Error('no screenshots in screenshots/ — take 3 or 4 renders of the guide first');
}

// The scorer's own caps: text_max_bytes shapes the dossier text; the rest
// refuse an entry the scorer would refuse (more than 4 screenshots or one
// over 256 KiB; more than 993 files and directories in app/ or 48 MiB of
// app files, counted beside /output's own 1000-entry cap).
writeFileSync(
  join(outputDir, 'dossier.json'),
  buildDossier(outputDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    app_max_files: 993,
    app_max_bytes: 50331648,
  }),
);
