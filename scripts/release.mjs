#!/usr/bin/env node
/**
 * The release run — 📦 Release's nine steps, automated, in order.
 *
 * Every step is a gate. **The run stops at the first failure and does nothing
 * after it.** That is the whole design: a pipeline that continues past a red
 * step so you can see the rest of the output is a pipeline that will eventually
 * publish past one.
 *
 * What it produces is a branch, a changelog draft and a proposed version. What
 * it does not produce is a release. It holds no credential, it does not tag, it
 * does not publish, and it never writes `version` into package.json. Everything
 * here is reversible — delete the branch and nothing happened. An npm version
 * cannot be unpublished after 72 hours, and that asymmetry is the reason the
 * last step is a person.
 *
 * Usage:
 *   npm run release                     # prepare, and leave git alone
 *   npm run release -- --branch         # …and create + push release/<version>
 *   npm run release -- --version 0.2.0  # override the proposal
 *
 * Exit 0 = prepared. Exit 1 = a gate failed, and the step number says which.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import {
  listComponents, readComponent, readPackage, readRegistryStatus, registryEntryFor,
  semver, REGISTRY_STATUS,
} from './lib/contract.mjs';

const args = process.argv.slice(2);
const wantBranch = args.includes('--branch');
const versionOverride = args.includes('--version') ? args[args.indexOf('--version') + 1] : null;

let step = 0;

const head = (n, title) => { step = n; console.log(`\n\x1b[1m${n} · ${title}\x1b[0m`); };
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const info = (m) => console.log(`    ${m}`);
const stop = (m, fix) => {
  console.log(`  \x1b[31m✗\x1b[0m ${m}`);
  console.log(`\n\x1b[1m\x1b[31mBLOCKED at step ${step}\x1b[0m`);
  if (fix) console.log(`  ${fix}`);
  console.log('  Nothing was branched, tagged, or published.\n');
  process.exit(1);
};

const sh = (cmd, opts = {}) =>
  execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
const both = (e) => ((e.stdout || '') + (e.stderr || '')).toString().trim();

console.log('\n\x1b[1m📦 Release · preparing\x1b[0m');

/* ── 1 · Read the board ──────────────────────────────────────────────────── */
head(1, 'Read the board');

const registry = readRegistryStatus();
if (!registry) {
  stop(
    `${REGISTRY_STATUS} is missing — the board has not been read.`,
    'Run the doc-generator agent; it has the Airtable connection. A release assembled\n'
    + '  from src/components/ is a release of whatever was on disk, which is the one thing\n'
    + '  the board exists to prevent.',
  );
}
info(`board read ${registry.readAt} by ${registry.readBy ?? 'unknown'}`);

const candidates = [];
const excluded = [];
const unreviewed = [];

for (const name of listComponents()) {
  const c = readComponent(name);
  const entry = registryEntryFor(name, registry);
  if (!entry) { excluded.push([name, 'no row on the board']); continue; }
  if (entry.development !== 'Completed' && entry.development !== 'Released') {
    excluded.push([name, entry.development || 'blank']);
    continue;
  }
  if (entry.verdict !== 'Cleared') unreviewed.push(name);
  candidates.push({ ...c, entry });
}

/*
 * An empty verdict and a `Blocked` one are not the same thing.
 *
 * Empty means nobody looked — that is a warning, and the card says so, because
 * there are reasons to ship something unreviewed and a person can weigh them.
 * `Blocked` means somebody looked and said no. Carrying on past that would make
 * the review advisory, and a gate nobody can fail is not a gate.
 */
const blockedByReview = candidates.filter((c) => c.entry.verdict === 'Blocked');
if (blockedByReview.length) {
  for (const c of blockedByReview) info(`\x1b[31mblocked — ${c.name}: Release Verdict reads "Blocked"\x1b[0m`);
  stop(
    `${blockedByReview.length} of ${candidates.length} candidate(s) carry a \`Blocked\` verdict.`,
    'Read reports/release-review/ for what each one found, fix what it names, and have the\n'
    + '  component reviewed again. A `Blocked` verdict is a person saying no; this run does not\n'
    + '  get to overrule it, and neither does --version.',
  );
}

if (!candidates.length) {
  stop('no component on the board reads `Completed`.',
    'There is nothing to release. That is a result, not a failure.');
}
ok(`${candidates.length} candidate(s): ${candidates.map((c) => c.name).join(', ')}`);
for (const [name, why] of excluded) info(`not included — ${name} (${why})`);
if (unreviewed.length) {
  info(`\x1b[33mnot reviewed — ${unreviewed.join(', ')}: Release Verdict is not "Cleared"\x1b[0m`);
  info('  they are in this release and nobody has gated their names. Say so when you confirm.');
}

/* ── 2 · Confirm each is on the entry point ─────────────────────────────── */
head(2, 'Confirm each is on the entry point');
for (const c of candidates) {
  if (!c.onSurface) {
    stop(`${c.name} is \`Completed\` but is not exported from src/index.ts.`,
      'Adding an export is a release decision and belongs to 🔨 Engineer, not to this run.');
  }
  if (!c.propsExported) {
    stop(`${c.name}Props is not exported — a consumer cannot type a wrapper around it.`,
      'Export the type from src/index.ts alongside the component.');
  }
}
ok(`all ${candidates.length} exported from src/index.ts, with their Props types`);

/* ── 3 · The working tree is clean ──────────────────────────────────────── */
head(3, 'The working tree is clean');

/*
 * `reports/` is excluded, and the reason is that this run writes into it.
 *
 * Step 9 puts its report there. So a first run left the tree dirty and a second
 * run refused at step 3 because of a file the first run had just written — the
 * gate poisoning its own next invocation, which is exactly what it felt like
 * from the outside: a release that worked once and then never again.
 *
 * Excluding it costs nothing, because the check is not about tidiness. It exists
 * so that what gets packed is what somebody reviewed, and `files` is
 * ["dist", "CHANGELOG.md"] — nothing under `reports/` can reach the tarball
 * whatever state it is in. The security gate carries the same exclusion for the
 * same reason.
 */
const dirty = sh('git status --porcelain')
  .split('\n')
  .filter((l) => l.trim() && !/^..\s+reports\//.test(l))
  .join('\n')
  .trim();
if (dirty) {
  stop(`the working tree has ${dirty.split('\n').length} uncommitted change(s) outside reports/:\n`
    + dirty.split('\n').map((l) => `      ${l}`).join('\n'),
    'What would be packed is not what anybody reviewed, and the tarball is\n'
    + '  unreproducible from that moment on. Commit or stash, then re-run.');
}
ok(`clean at ${sh('git rev-parse --short HEAD').trim()} on ${sh('git branch --show-current').trim()}`);

/* ── 4 · React is a peer dependency, and is not bundled ─────────────────── */
head(4, 'React is a peer dependency, and is not bundled');
const pkg = readPackage();

for (const dep of ['react', 'react-dom']) {
  if (pkg.dependencies?.[dep]) {
    stop(`${dep} is in "dependencies".`,
      'A consumer would install a second copy of React. That does not error — it produces\n'
      + '  "invalid hook call" from a component that is visibly fine, and nobody suspects the\n'
      + '  design system for a day. Move it to peerDependencies.');
  }
  if (!pkg.peerDependencies?.[dep]) {
    stop(`${dep} is not in "peerDependencies" — the contract is unstated.`);
  }
}
ok(`react ${pkg.peerDependencies.react} · react-dom ${pkg.peerDependencies['react-dom']} — peers, not dependencies`);

/* ── 5 · Build, tokens first ────────────────────────────────────────────── */
head(5, 'Build, tokens first');
try {
  sh('npm run build');
} catch (e) {
  stop('the build failed.', both(e).split('\n').slice(-6).join('\n  '));
}
if (!existsSync('dist/index.js')) stop('the build produced no dist/index.js.');

/*
 * The contract in package.json and the contract in the bundle have to agree.
 * `peerDependencies` says React belongs to the consumer; a bundle that inlined
 * it does the same damage from the other direction while that field still reads
 * perfectly correct.
 */
const bundle = readFileSync('dist/index.js', 'utf8');
if (/__SECRET_INTERNALS|ReactCurrentOwner/.test(bundle)) {
  stop('React appears to be inlined in dist/index.js.',
    "peerDependencies says it is the consumer's; the bundle says otherwise.\n"
    + '  Check rollupOptions.external in vite.config.ts.');
}
if (!/from\s*["']react["']/.test(bundle)) {
  stop('dist/index.js does not import React at all.',
    'Either the entry is wrong, or React was inlined under a name this check missed.');
}
ok('built; React is imported, not inlined');

/* ── 6 · npm pack --dry-run — read the file list ────────────────────────── */
head(6, 'npm pack — the file list, not the exit code');
const [tar] = JSON.parse(sh('npm pack --dry-run --json'));
const files = tar.files.map((f) => f.path);

const forbidden = files.filter((f) => /(^|\/)\.env|\.local\.json$|(^|\/)node_modules\//.test(f));
if (forbidden.length) {
  stop(`the tarball contains ${forbidden.length} file(s) that must never be published: ${forbidden.join(', ')}`,
    'npm does not take a publish back. Narrow "files" in package.json.');
}
if (!files.some((f) => f.startsWith('dist/') && f.endsWith('.js'))) {
  stop('the tarball has no dist/*.js — the package would install and export nothing.');
}
if (!files.includes('dist/styles.css')) {
  stop('the tarball has no dist/styles.css — every component would render unstyled.');
}
if (!files.some((f) => f.endsWith('.d.ts'))) {
  stop('the tarball has no type declarations — consumers get `any`.');
}

/*
 * Things that are not the library.
 *
 * This check exists because the run that first read this list out loud was
 * shipping `dist/components/accessible-props.test.d.ts` — the build tsconfig
 * excluded `*.test.ts` and the file was `.test.tsx`. Nothing failed: it built,
 * it packed, it installed, it rendered. A consumer would simply have received
 * the design system's test declarations forever.
 *
 * That is exactly the failure step 6 is written to catch by reading rather than
 * by exit code, so it is worth catching mechanically now that we have seen it.
 */
const notTheLibrary = files.filter((f) => /\.(test|spec|stories)\./.test(f));
if (notTheLibrary.length) {
  stop(`the tarball contains ${notTheLibrary.length} file(s) that are not the library: ${notTheLibrary.join(', ')}`,
    'Tests and stories are how the components are checked, not what ships. Narrow the\n'
    + '  excludes in tsconfig.build.json — note that an exclude for "*.test.ts" does not\n'
    + '  cover "*.test.tsx".');
}
for (const f of files) info(f);
ok(`${tar.entryCount} files, ${(tar.size / 1024).toFixed(1)} kB packed`);

/* ── 7 · Pack, install into an empty folder, render ─────────────────────── */
head(7, 'Install into an empty folder and render');
const smoke = join(tmpdir(), `sunim-smoke-${sh('git rev-parse --short HEAD').trim()}`);
rmSync(smoke, { recursive: true, force: true });
mkdirSync(smoke, { recursive: true });
let tgz;
try {
  tgz = sh('npm pack --silent').trim().split('\n').pop();
  cpSync(tgz, join(smoke, tgz));

  writeFileSync(join(smoke, 'package.json'), JSON.stringify(
    { name: 'smoke', private: true, type: 'module', version: '0.0.0' }, null, 2));

  writeFileSync(join(smoke, 'render.mjs'), `
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement as h } from 'react';
import * as ds from '@sunim/design-system';
import { readFileSync } from 'node:fs';

const names = ${JSON.stringify(candidates.map((c) => c.name))};
const missing = names.filter((n) => typeof ds[n] !== 'function');
if (missing.length) { console.error('not exported at runtime: ' + missing.join(', ')); process.exit(1); }

const html = renderToStaticMarkup(h('div', null, names.map((n, i) =>
  h(ds[n], { key: i, label: 'Smoke', title: 'Smoke' }))));
const css = readFileSync('node_modules/@sunim/design-system/dist/styles.css', 'utf8');

if (!html.trim()) { console.error('rendered nothing'); process.exit(1); }
for (const n of names) {
  if (!html.includes('sunim-' + n)) { console.error(n + ' rendered without its class'); process.exit(1); }
}
if (!css.includes('--color-accent-ink:')) { console.error('styles.css carries no tokens'); process.exit(1); }
if (css.indexOf('--color-accent-ink:') > css.indexOf('.sunim-Button')) {
  console.error('tokens come after the components; a cascade cannot read forwards'); process.exit(1);
}
console.log(html.length + ' bytes rendered, ' + (css.length / 1024).toFixed(1) + ' kB of CSS');
`);

  sh(`npm install ./${tgz} react@19 react-dom@19 --no-audit --no-fund --silent`, { cwd: smoke });
  info(sh('node render.mjs', { cwd: smoke }).trim());
  ok('installs from the tarball and renders every candidate');
} catch (e) {
  stop('the smoke install failed.',
    both(e).split('\n').slice(-8).join('\n  ')
    + '\n\n  This is the only step that tests what a consumer gets rather than what the'
    + `\n  repository contains. Left in place for inspection: ${smoke}`);
} finally {
  if (tgz && existsSync(tgz)) rmSync(tgz);
}
rmSync(smoke, { recursive: true, force: true });

/* ── 8 · Draft the changelog ────────────────────────────────────────────── */
head(8, 'Draft the changelog');

/*
 * Grouped from commit subjects — and it is a *draft*, which the report says
 * where a reader will see it. A commit subject records what was **done**; a
 * changelog entry has to say what **changed** for somebody who already has the
 * previous version installed. Those are different sentences, and only a person
 * can write the second one.
 */
const lastTag = (() => {
  try { return sh('git describe --tags --abbrev=0').trim(); } catch { return null; }
})();
const range = lastTag ? `${lastTag}..HEAD` : '';
const commits = sh(`git log --no-merges --format='%h %s' ${range} -- src/ package.json`)
  .split('\n').filter(Boolean)
  .map((l) => ({ sha: l.slice(0, l.indexOf(' ')), subject: l.slice(l.indexOf(' ') + 1) }));

const groups = { Added: [], Changed: [], Fixed: [], Deprecated: [], Removed: [] };
for (const { sha, subject } of commits) {
  const s = subject.toLowerCase();
  const bucket =
    /^remove|\bremoved\b|\bdrop(s|ped)?\b/.test(s) ? 'Removed'
      : /deprecat/.test(s) ? 'Deprecated'
        : /^fix|\bfix(es|ed)?\b|\bcorrect\b|\brepair\b/.test(s) ? 'Fixed'
          : /^add|\badds?\b|\bnew\b|\bintroduce/.test(s) ? 'Added'
            : 'Changed';
  groups[bucket].push({ sha, subject });
}
for (const [name, entries] of Object.entries(groups)) if (entries.length) info(`${name}: ${entries.length}`);
ok(`${commits.length} commit(s) since ${lastTag ?? 'the beginning'} — grouped, and a draft`);

/* ── 9 · Propose a version, and name the change that forces it ──────────── */
head(9, 'Propose a version');
const current = semver(pkg.version) ?? [0, 0, 0];

/*
 * Below 1.0.0 the minor is the breaking-change slot — VERSIONING.md is explicit
 * that a 0.x minor may break anything. Everything smaller is a patch.
 */
const breaking = groups.Removed.length > 0 || groups.Deprecated.length > 0;

let proposed;
let forcing;
if (versionOverride) {
  proposed = versionOverride;
  forcing = 'Named on the command line, overriding the proposal.';
} else if (!lastTag) {
  proposed = '0.1.0';
  forcing = `The first published version. Nothing has been released, so ${candidates.length} components `
    + 'enter the public surface at once. VERSIONING.md: 0.1.0 is where the surface becomes named '
    + 'and public, not where it becomes stable.';
} else if (breaking) {
  proposed = `${current[0]}.${current[1] + 1}.0`;
  const e = groups.Removed[0] ?? groups.Deprecated[0];
  forcing = `${e.subject} (${e.sha}) — a removal or deprecation, which below 1.0.0 is a minor bump.`;
} else {
  proposed = `${current[0]}.${current[1]}.${current[2] + 1}`;
  forcing = groups.Added.length
    ? `${groups.Added[0].subject} (${groups.Added[0].sha}) — additive only, so a patch.`
    : 'Nothing forces a bump. A release with no reason is one worth not doing.';
}
ok(`proposed \x1b[1m${proposed}\x1b[0m — package.json currently reads ${pkg.version}`);
info(forcing);

/* ── The report ─────────────────────────────────────────────────────────── */
mkdirSync('reports/release', { recursive: true });
const report = [
  `# Release ${proposed} — prepared, not performed`,
  '',
  `Prepared from \`${sh('git rev-parse HEAD').trim()}\`. Board read ${registry.readAt}.`,
  '',
  '## In this release',
  '',
  '| Component | Board status | Reviewed |',
  '|---|---|---|',
  ...candidates.map((c) => `| ${c.name} | ${c.entry.development} | ${c.entry.verdict === 'Cleared' ? 'Cleared' : '**not reviewed**'} |`),
  '',
  ...(excluded.length ? ['## Not included', '', ...excluded.map(([n, w]) => `- **${n}** — ${w}`), ''] : []),
  '## The package',
  '',
  `- ${tar.entryCount} files, ${(tar.size / 1024).toFixed(1)} kB packed, ${(tar.unpackedSize / 1024).toFixed(1)} kB unpacked`,
  `- React is a peer dependency (\`${pkg.peerDependencies.react}\`), imported and not inlined`,
  '- Installs from the tarball into an empty folder and renders every candidate',
  '',
  '<details><summary>Every file in the tarball</summary>',
  '',
  ...files.map((f) => `- \`${f}\``),
  '',
  '</details>',
  '',
  '## Changelog draft',
  '',
  '**This is a draft.** It is grouped from commit subjects, which record what was *done*.',
  'A changelog entry has to say what *changed* for somebody who already has the previous',
  'version installed. Rewrite each line for that reader before it ships.',
  '',
  ...Object.entries(groups).flatMap(([name, entries]) =>
    entries.length ? [`### ${name}`, '', ...entries.map((e) => `- ${e.subject} (\`${e.sha}\`)`), ''] : []),
  '## Proposed version',
  '',
  `**${proposed}** — package.json reads \`${pkg.version}\`.`,
  '',
  forcing,
  '',
  '## Not verified',
  '',
  '- The changelog wording. Generated from commit subjects; nobody has rewritten it.',
  ...(unreviewed.length ? [`- **${unreviewed.join(', ')}** — in this release with no \`Cleared\` verdict. Their names, surfaces and promises have not been gated.`] : []),
  '- How the package behaves in a bundler other than the one used here.',
  '- Whether the published tarball matches this one. That can only be checked after publishing.',
  '',
  '## What happens next',
  '',
  'Nothing, until a person decides. This run made a branch and a draft; it holds no credential',
  'and cannot publish. To release: confirm the version, have a human write it into',
  '`package.json`, and trigger the publish workflow.',
  '',
].join('\n');

writeFileSync(`reports/release/${proposed}.md`, report);
ok(`report → reports/release/${proposed}.md`);

/* ── The branch ─────────────────────────────────────────────────────────── */
let branchLine = 'not created (pass --branch)';
if (wantBranch) {
  const branch = `release/${proposed}`;
  try {
    sh(`git checkout -b ${branch}`);
    sh(`git add reports/release/${proposed}.md`);
    sh(`git commit -m ${JSON.stringify(`Prepare release ${proposed}`)}`);
    sh(`git push -u origin ${branch}`);
    branchLine = `${branch} ✓ pushed`;
  } catch (e) {
    branchLine = `${branch} ✗ ${both(e).split('\n').pop()}`;
  }
}

/* ── The card ───────────────────────────────────────────────────────────── */
console.log(`
\x1b[1m📦 Release · prepared\x1b[0m
Ready: ${candidates.map((c) => c.name).join(', ')}${unreviewed.length ? ` \x1b[33m(${unreviewed.join(', ')} not reviewed)\x1b[0m` : ''}
Not included: ${excluded.length ? excluded.map(([n, w]) => `${n} (${w})`).join(', ') : 'nothing — every component on the board is Completed'}
Build ✓  Pack ${tar.entryCount} files, ${(tar.size / 1024).toFixed(1)} kB ✓  Smoke install ✓ renders
Proposed: \x1b[1m${proposed}\x1b[0m
Branch: ${branchLine}

→ Your decision: confirm the version, write it into package.json, then run the publish workflow.
  This run holds no credential and published nothing.
`);
