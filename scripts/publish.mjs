#!/usr/bin/env node
/**
 * The manual publish. **Run this yourself — no agent runs it.**
 *
 * `.github/workflows/release-publish.yml` is the better path and stays the
 * default: it publishes from a clean checkout with `--provenance`, which
 * attaches a signed attestation of the commit and workflow that built the
 * tarball. This script cannot do that — provenance needs the OIDC token a CI
 * runner has and a laptop does not — so what it publishes is trusted because you
 * ran it, and nothing else.
 *
 * Use it when CI cannot run. Prefer CI when it can.
 *
 * What it will not do:
 *
 *   - Ask you for a token, read one, or write one anywhere. Log in with
 *     `npm login` first; this reads whether you are logged in and never what
 *     with.
 *   - Publish past a red gate. It runs all nine release checks first, and they
 *     stop at the first failure.
 *   - Publish a version you did not name. The argument must match package.json,
 *     which a human wrote.
 *   - Leave `private: true` off. It is removed for the publish and put straight
 *     back — inline, and again on `exit` and on SIGINT, so a failure, a crash or
 *     a Ctrl-C all end with the catch in place. It was a `finally` first, and a
 *     `finally` does not run when something calls `process.exit()`.
 *
 * Usage:
 *   npm login
 *   npm run release:publish -- 0.1.0
 *   npm run release:publish -- 0.1.0 --dry-run
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const wanted = args.find((a) => !a.startsWith('--'));

const step = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);
const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const stop = (m, fix) => {
  console.log(`  \x1b[31m✗\x1b[0m ${m}`);
  if (fix) console.log(`\n  ${fix}`);
  console.log('\n  Nothing was published.\n');
  process.exit(1);
};
const sh = (cmd, opts = {}) =>
  execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], ...opts });
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

console.log(`\n\x1b[1m📦 Publishing — manually${dryRun ? ', dry run' : ''}\x1b[0m`);

/* ── Who is publishing ───────────────────────────────────────────────────── */
step('1 · npm login');
let who;
try {
  who = sh('npm whoami').trim();
} catch {
  stop(
    'not logged in to npm.',
    'Run `npm login` first. This script never handles a token — it reads whether\n'
    + '  you are logged in, never what with.',
  );
}
ok(`logged in as ${who}`);

/* ── The version was written by a person ─────────────────────────────────── */
step('2 · The version you named matches the file');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
if (!wanted) {
  stop('no version given.', `Run \`npm run release:publish -- ${pkg.version}\`.`);
}
if (wanted !== pkg.version) {
  stop(
    `you asked to publish ${wanted}, but package.json reads ${pkg.version}.`,
    'A human writes that number into the file; naming it on a command line is not\n'
    + '  the same act. If they disagree, somebody is publishing a version they did\n'
    + '  not write. Commit the bump, then re-run.',
  );
}
ok(`${pkg.name}@${pkg.version}`);

/* ── Not already there ───────────────────────────────────────────────────── */
step('3 · This version is not already on the registry');
try {
  const existing = sh(`npm view ${pkg.name}@${pkg.version} version`).trim();
  if (existing) {
    stop(
      `${pkg.name}@${existing} is already published.`,
      'npm does not allow republishing a version, and unpublishing is only possible\n'
      + '  within 72 hours and burns the number either way. Bump and re-run.',
    );
  }
} catch {
  ok('not published yet');
}

/* ── Every gate, again ───────────────────────────────────────────────────── */
step('4 · The nine release gates');
try {
  run(`node scripts/release.mjs --version ${pkg.version}`);
} catch {
  stop('a release gate failed — see above.',
    'The gates stop at the first failure by design. Fix what it names and re-run.');
}

/* ── Publish ─────────────────────────────────────────────────────────────── */
step(`5 · ${dryRun ? 'Dry run — nothing leaves this machine' : 'Publish'}`);

/*
 * `private: true` lives in package.json so an absent-minded `npm publish` is
 * refused. It comes off for exactly this command and goes straight back.
 *
 * This was written as try/catch/finally and the finally did not run, because the
 * catch called a helper that ends in `process.exit()` — and `process.exit()`
 * skips finally blocks. So the first failed publish left `private` removed and
 * committed nothing about it: the guarantee this comment claimed was exactly
 * inverted, and the repo sat there publishable by accident.
 *
 * Restoring is now registered on `exit` and on SIGINT, and also done inline. The
 * inline call is the normal path; the handlers are what a Ctrl-C or a
 * `process.exit()` deeper in the stack falls back to. Any of the three is
 * enough, which is the point — a safety net with one strand is a claim, not a
 * net.
 *
 * The removal is a line edit rather than a JSON round-trip, so the file that
 * gets packed is byte-identical to the reviewed one apart from the line that
 * has to go.
 */
const original = readFileSync('package.json', 'utf8');
const opened = original.replace(/^\s*"private":\s*true,\n/m, '');
if (opened === original) {
  stop('could not find `"private": true` to remove from package.json.',
    'Refusing rather than guessing: if the flag is not where it is expected, the\n'
    + '  safety catch is not doing what this script assumes it does.');
}

let restored = false;
const restore = () => {
  if (restored) return;
  restored = true;
  try {
    writeFileSync('package.json', original);
  } catch { /* nothing useful to do while exiting */ }
};
process.on('exit', restore);
process.on('SIGINT', () => { restore(); process.exit(130); });

let failure = null;
try {
  writeFileSync('package.json', opened);
  run(`npm publish --access public${dryRun ? ' --dry-run' : ''}`);
} catch (e) {
  failure = e;
}
restore();
ok('`private: true` restored');

if (failure) {
  stop('npm publish failed — see above.',
    'package.json is back as it was. Nothing is half-published: npm either took the\n'
    + '  whole tarball or none of it.');
}
ok(dryRun ? 'dry run complete — nothing was published' : `published ${pkg.name}@${pkg.version}`);

if (dryRun) {
  console.log(`\n  Re-run without --dry-run to publish ${pkg.version}.\n`);
  process.exit(0);
}

/* ── Tag, after the publish and never before ─────────────────────────────── */
step('6 · Tag');
try {
  run(`git tag -a v${pkg.version} -m "Release ${pkg.version}"`);
  run(`git push origin v${pkg.version}`);
  ok(`v${pkg.version} tagged and pushed`);
} catch {
  console.log('  \x1b[33m!\x1b[0m the publish succeeded but the tag did not. Tag by hand:');
  console.log(`      git tag -a v${pkg.version} -m "Release ${pkg.version}" && git push origin v${pkg.version}`);
}

/* ── What the registry actually serves ───────────────────────────────────── */
step('7 · Install what was published, and render it');
console.log('  waiting for the registry to serve it…');
const smoke = `/tmp/sunim-verify-${pkg.version}`;
try {
  sh(`rm -rf ${smoke} && mkdir -p ${smoke}`);
  writeFileSync(`${smoke}/package.json`, JSON.stringify(
    { name: 'verify', private: true, type: 'module', version: '0.0.0' }, null, 2));
  writeFileSync(`${smoke}/verify.mjs`, `
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement as h } from 'react';
import { Button } from '${pkg.name}';
import { readFileSync } from 'node:fs';

const html = renderToStaticMarkup(h(Button, { label: 'Published' }));
const css = readFileSync('node_modules/${pkg.name}/dist/styles.css', 'utf8');
if (!html.includes('Published')) throw new Error('the published package rendered nothing');
if (!css.includes('--color-accent-ink:')) throw new Error('the published styles carry no tokens');
console.log('  the published version installs and renders');
`);

  let installed = false;
  for (let i = 0; i < 6 && !installed; i++) {
    try {
      sh(`npm install ${pkg.name}@${pkg.version} react@19 react-dom@19 --no-audit --no-fund --silent`,
        { cwd: smoke });
      installed = true;
    } catch {
      sh('sleep 10');
    }
  }
  if (!installed) throw new Error('not served by the registry after a minute');
  run(`node ${smoke}/verify.mjs`);
  ok('what the registry serves is what was built');
} catch (e) {
  console.log(`  \x1b[33m!\x1b[0m could not verify from the registry — ${e.message}`);
  console.log('      The publish itself succeeded. Check by hand before telling anyone to install it.');
}

console.log(`
\x1b[1m📦 Published\x1b[0m  ${pkg.name}@${pkg.version}

  Still to do, by hand:
    · Deploy the reference site, then write Astro Link on each component's row.
      That is the last cell Development needs to read Released.
    · Prefer the CI workflow next time. It publishes with --provenance, which this
      cannot: a signed attestation of the commit and workflow that built the
      tarball. Manual publishes are trusted because you ran them, and nothing else.
`);
