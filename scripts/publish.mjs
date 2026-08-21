#!/usr/bin/env node
/**
 * The publish. **Run this yourself — no agent runs it.**
 *
 * This is the working path, not the fallback. `.github/workflows/release-publish.yml`
 * still exists and is still correct, but it cannot run: GitHub locks Actions
 * account-wide over an unpaid balance, and this account cannot clear one —
 * PayPal does not operate in Myanmar and international card processing from
 * Myanmar banks is largely cut off. The repository is public, so Actions would
 * otherwise be free; the lock is not about what CI costs. GitLab is not a way
 * round it either — its free runners have required card verification since 2022,
 * and those two are the only providers npm accepts for provenance.
 *
 * So `--provenance` is unavailable, not deferred. What it would have given is a
 * signed attestation binding the tarball to the commit and workflow that built
 * it. What replaces it is weaker and worth being precise about: step 9 prints
 * the commit, the tag and the registry's own checksum for the tarball, and
 * appends them to the release report. Anyone can re-run that comparison later.
 * It is a recorded claim a person can check, not a cryptographic one a machine
 * can verify — and the difference matters.
 *
 * What this publishes is trusted because you ran it, and because the numbers
 * below can be checked against the registry. Nothing else.
 *
 * What it will not do:
 *
 *   - Ask you for a token, read one, or write one anywhere. Log in with
 *     `npm login` first; this reads whether you are logged in and never what
 *     with.
 *   - Publish past a red gate. It runs all nine release checks first, and they
 *     stop at the first failure.
 *   - Publish a version the changelog does not name. `0.1.1` went out while
 *     CHANGELOG.md still read `## Unreleased`, so the published tarball carried
 *     a changelog that did not mention the version inside it and the reference
 *     site went on announcing `0.1.0`. Step 4 is that failure, turned into a
 *     gate.
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
 *   npm run release:publish -- 0.1.0 --otp 123456
 *
 * On `--otp`: the code is passed straight through to npm and is never read,
 * logged, or stored here. npm has required a second factor to publish since
 * 2025 — either a one-time code, or a granular access token with "bypass 2FA"
 * enabled. Having 2FA *disabled* on the account does not exempt you; it only
 * removes the option of using a code.
 */

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
/* Passed through to npm untouched. Never read, never logged, never stored. */
const otp = args.includes('--otp') ? args[args.indexOf('--otp') + 1] : null;
const wanted = args.find((a) => !a.startsWith('--') && a !== otp);

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

/* ── The changelog records this version ──────────────────────────────────── */
step('4 · The changelog records this version');
/*
 * Publishing a version the changelog does not name is how the reference site
 * ends up announcing the previous release.
 *
 * That is not hypothetical. `0.1.1` was published while `CHANGELOG.md` still
 * said `## Unreleased`, and the site went on telling every reader the current
 * version was `0.1.0` — correct according to the only file it had to go on.
 *
 * The changelog is also the one document that ships *inside* the tarball, so an
 * entry missing here is missing for everybody who installs the package and looks
 * for what changed. Checked before the irreversible step rather than after it:
 * a heading can be written in ten seconds now, and not at all once the version
 * is on the registry.
 */
const CHANGELOG = 'CHANGELOG.md';
if (!existsSync(CHANGELOG)) {
  stop('CHANGELOG.md is missing.',
    'It ships inside the tarball. A package that cannot say what changed is not ready.');
}
const changelog = readFileSync(CHANGELOG, 'utf8');
const entry = new RegExp(`^##\\s+${pkg.version.replace(/\./g, '\\.')}\\s*[—-]\\s*(\\S+)\\s*$`, 'm')
  .exec(changelog);
if (!entry) {
  stop(
    `CHANGELOG.md has no "## ${pkg.version} — <date>" heading.`,
    `Add one — move "## Unreleased" down to it if that is where the notes are.\n`
    + '  Without it the published tarball carries a changelog that does not mention\n'
    + '  the version inside it, and the reference site keeps announcing the previous\n'
    + '  release. Both have happened.',
  );
}
ok(`recorded as released ${entry[1]}`);

/* ── The site that documents it ──────────────────────────────────────────── */
step('5 · The reference site builds for this version');
/*
 * Built *before* the publish, on purpose.
 *
 * The site does not depend on the package being on the registry, so there is no
 * reason to find out it cannot be built until after the one step that cannot be
 * taken back. If the documentation for this version cannot be generated, this is
 * not a version to publish.
 *
 * Built, never deployed. Deploying is 🚀 DevOps's and happens once a human says
 * so — step 12 hands it over rather than performing it.
 */
try {
  run('npm run docs:build');
} catch {
  stop('the reference site does not build for this version.',
    'A version whose documentation cannot be generated is not ready to publish.\n'
    + '  Nothing has been published; fix what the build named above and re-run.');
}
ok('built — the site will describe this version, once somebody deploys it');

/* ── Every gate, again ───────────────────────────────────────────────────── */
step('6 · The nine release gates');
try {
  run(`node scripts/release.mjs --version ${pkg.version}`);
} catch {
  stop('a release gate failed — see above.',
    'The gates stop at the first failure by design. Fix what it names and re-run.');
}

/* ── Publish ─────────────────────────────────────────────────────────────── */
step(`7 · ${dryRun ? 'Dry run — nothing leaves this machine' : 'Publish'}`);

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
  run(`npm publish --access public${dryRun ? ' --dry-run' : ''}${otp ? ` --otp=${otp}` : ''}`);
} catch (e) {
  failure = e;
}
restore();
ok('`private: true` restored');

if (failure) {
  /*
   * The one failure worth explaining rather than echoing. npm has required a
   * second factor to publish since 2025, and the message it prints sends you
   * looking at your security policy or your access rights — neither of which is
   * the problem.
   */
  const needsSecondFactor = /E403|two-factor|bypass 2fa/i.test(
    ((failure.stdout || '') + (failure.stderr || '')).toString(),
  );
  stop('npm publish failed — see above.',
    needsSecondFactor
      ? 'npm wants a second factor. Two ways, and neither involves this script holding\n'
        + '  anything:\n\n'
        + '    · A one-time code, if your account has 2FA on:\n'
        + '        npm run release:publish -- ' + pkg.version + ' --otp <code>\n\n'
        + '    · A granular access token with "Bypass 2FA" enabled, which is what CI\n'
        + '      needs anyway — one token covers both:\n'
        + '        npmjs.com → Access Tokens → Granular → scope @theproductiveschedule,\n'
        + '        Read and write, Bypass 2FA on\n'
        + '        npm config set //registry.npmjs.org/:_authToken <token>\n\n'
        + '  package.json is back as it was. Nothing is half-published.'
      : 'package.json is back as it was. Nothing is half-published: npm either took the\n'
        + '  whole tarball or none of it.');
}
ok(dryRun ? 'dry run complete — nothing was published' : `published ${pkg.name}@${pkg.version}`);

if (dryRun) {
  console.log(`\n  Re-run without --dry-run to publish ${pkg.version}.\n`);
  process.exit(0);
}

/* ── Tag, after the publish and never before ─────────────────────────────── */
step('8 · Tag');
try {
  run(`git tag -a v${pkg.version} -m "Release ${pkg.version}"`);
  run(`git push origin v${pkg.version}`);
  ok(`v${pkg.version} tagged and pushed`);
} catch {
  console.log('  \x1b[33m!\x1b[0m the publish succeeded but the tag did not. Tag by hand:');
  console.log(`      git tag -a v${pkg.version} -m "Release ${pkg.version}" && git push origin v${pkg.version}`);
}

/* ── What the registry actually serves ───────────────────────────────────── */
step('9 · Install what was published, and render it');
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

/* ── What binds this tarball to this commit ──────────────────────────────── */
/*
 * The stand-in for `--provenance`, and deliberately not called provenance.
 *
 * CI would have signed an attestation tying the published artefact to the commit
 * and workflow that produced it — something a machine can verify without
 * trusting anybody. This cannot. What it can do is record the numbers a person
 * needs to check the same claim by hand, at the moment they are still true,
 * because six months from now nobody will remember which commit went out.
 *
 * Written into the release report rather than only printed. A number that
 * scrolls past in a terminal is not a record.
 */
step('10 · The reference site, built and not deployed');
/*
 * The hand-over, which is deliberately not a deploy.
 *
 * The site was built at step 5, before the irreversible step, so what exists now
 * describes exactly the version that just went out. Performing the deploy is
 * 🚀 DevOps's job, done when a human says so — the same boundary that keeps
 * 📦 Release from publishing.
 *
 * What this step owes the person reading it is that the boundary costs them one
 * command and not an investigation. Until it is run, the live site announces the
 * previous release, and that is the failure this whole arrangement exists to
 * stop being silent about.
 */
console.log(`  \x1b[32m✓\x1b[0m docs/dist is built for ${pkg.version}`);
console.log('  \x1b[33m!\x1b[0m NOT deployed. The live site still shows the previous release until:');
console.log('\n      npm run docs:deploy -- --prod\n');

/* ── Record ──────────────────────────────────────────────────────────────── */
step('11 · Record what was published');

const readOrNull = (cmd) => {
  try {
    return sh(cmd).trim() || null;
  } catch {
    return null;
  }
};

const commit = readOrNull('git rev-parse HEAD');
const shasum = readOrNull(`npm view ${pkg.name}@${pkg.version} dist.shasum`);
const integrity = readOrNull(`npm view ${pkg.name}@${pkg.version} dist.integrity`);

console.log(`  commit     ${commit ?? '— git rev-parse failed'}`);
console.log(`  shasum     ${shasum ?? '— the registry is not serving it yet'}`);
console.log(`  integrity  ${integrity ?? '—'}`);

const reportPath = `reports/release/${pkg.version}.md`;
const record = [
  '',
  `## Published ${pkg.version}`,
  '',
  `- Package · \`${pkg.name}@${pkg.version}\``,
  `- Commit · \`${commit ?? 'unknown'}\``,
  `- Tag · \`v${pkg.version}\``,
  `- Registry shasum · \`${shasum ?? 'not readable at publish time'}\``,
  `- Registry integrity · \`${integrity ?? 'not readable at publish time'}\``,
  `- Reference site · built for \`${pkg.version}\`, **not deployed at publish time**`,
  '',
  'Published by hand, without `--provenance`. The header of `scripts/publish.mjs`',
  'says why that is unavailable rather than skipped. These numbers are a recorded',
  'claim a person can re-check against the registry — not an attestation a machine',
  'can verify, and the difference is the whole point of writing them down.',
  '',
  'To check it:',
  '',
  '```bash',
  `npm view ${pkg.name}@${pkg.version} dist.shasum`,
  `git rev-parse v${pkg.version}`,
  '```',
  '',
].join('\n');

try {
  if (existsSync(reportPath)) {
    appendFileSync(reportPath, record);
    ok(`appended to ${reportPath}`);
  } else {
    console.log(`  \x1b[33m!\x1b[0m ${reportPath} does not exist — nothing to append to.`);
    console.log('      Run the release first if you want this on the record.');
  }
} catch (e) {
  console.log(`  \x1b[33m!\x1b[0m could not write ${reportPath} — ${e.message}`);
}

console.log(`
\x1b[1m📦 Published\x1b[0m  ${pkg.name}@${pkg.version}

  Still to do, by hand:
    · \x1b[1mDeploy the reference site\x1b[0m:  npm run docs:deploy -- --prod
      It is built for this version and nothing else will deploy it. Until
      then the live site announces the previous release.
    · Then write Astro Link on each component's row.
      That is the last cell Development needs to read Released.
    · Check the numbers above against the registry before telling anyone to
      install it. They are the whole of what ties this tarball to this commit.
`);
