#!/usr/bin/env node
/**
 * Pre-deploy security gate.
 *
 * Scoped to what this stack can actually get wrong: a static Storybook, built
 * from a public repo, served by Vercel. It does not make the system "safe from
 * attack" — it catches the specific, repeatable mistakes that would put
 * something private on a public URL, or ship a known-vulnerable dependency.
 *
 * Usage:
 *   node scripts/security-check.mjs               # pre-deploy: build output + deps + repo
 *   node scripts/security-check.mjs --dir docs/dist   # …against another build
 *   node scripts/security-check.mjs --url <url>   # post-deploy: also check the live response
 *   … --url <url> --expect protected             # assert the URL DOES require a login
 *
 * Exit 0 = every gate passed. Exit 1 = at least one FAIL. Warnings never fail.
 */

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { execSync } from 'node:child_process';

/*
 * The directory that is about to be served. There are two deployables now — the
 * Storybook and the reference site — and a gate that only ever looks at one of
 * them is a gate that stops covering the repo the day a second thing ships.
 */
const BUILD_DIR = (() => {
  const a = process.argv.slice(2);
  return a.includes('--dir') ? a[a.indexOf('--dir') + 1] : 'storybook-static';
})();
const TEXT_EXT = new Set(['.js', '.mjs', '.cjs', '.css', '.html', '.json', '.txt', '.map', '.svg']);

let fails = 0, warns = 0, passes = 0;
const pass = (m) => { passes++; console.log(`  \x1b[32mPASS\x1b[0m  ${m}`); };
const warn = (m) => { warns++; console.log(`  \x1b[33mWARN\x1b[0m  ${m}`); };
const fail = (m) => { fails++; console.log(`  \x1b[31mFAIL\x1b[0m  ${m}`); };
const head = (m) => console.log(`\n\x1b[1m${m}\x1b[0m`);

const args = process.argv.slice(2);
const urlArg = args.includes('--url') ? args[args.indexOf('--url') + 1] : null;
if (BUILD_DIR !== 'storybook-static') console.log(`  (checking ${BUILD_DIR}/)`);
// Whether this URL is *meant* to be readable without logging in. A gate cannot
// check an intention it was never told, and "200, no redirect" is a pass for a
// public site and a failure for a protected one.
const expect = args.includes('--expect') ? args[args.indexOf('--expect') + 1] : 'public';
if (!['public', 'protected'].includes(expect)) {
  console.error(`--expect must be "public" or "protected", got "${expect}"`);
  process.exit(2);
}

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const s = statSync(p);
    if (s.isDirectory()) walk(p, out);
    else if (TEXT_EXT.has(extname(p)) && s.size < 25_000_000) out.push(p);
  }
  return out;
}

// ── 1 · Credentials in the build output ──────────────────────────────────────
// These patterns are provider-specific on purpose. A generic "high entropy
// string" check drowns in minified JS and teaches you to ignore the output.
head('1 · Credentials in the build output');
const CRED = [
  [/gh[pousr]_[A-Za-z0-9]{30,}/g, 'GitHub token'],
  [/github_pat_[A-Za-z0-9_]{50,}/g, 'GitHub fine-grained PAT'],
  [/\bpat[A-Za-z0-9]{13}\.[a-f0-9]{64}\b/g, 'Airtable personal access token'],
  // Airtable legacy keys are key + 14 alphanumerics. Bare `key\w{14}` also
  // matches ordinary identifiers like keyboardDelete, so require the shape a
  // real key has: at least one digit and at least one capital.
  [/\bkey[A-Za-z0-9]{14}\b/g, 'Airtable legacy API key', (m) => /\d/.test(m.slice(3)) && /[A-Z]/.test(m.slice(3))],
  [/figd_[A-Za-z0-9_-]{30,}/g, 'Figma token'],
  [/sk-[A-Za-z0-9]{32,}/g, 'OpenAI-style key'],
  [/xox[baprs]-[A-Za-z0-9-]{20,}/g, 'Slack token'],
  [/AKIA[0-9A-Z]{16}/g, 'AWS access key'],
  [/AIza[0-9A-Za-z_-]{35}/g, 'Google API key'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, 'private key'],
];
if (!existsSync(BUILD_DIR)) {
  warn(`${BUILD_DIR}/ not present — run the build first, or this gate proves nothing`);
} else {
  const files = walk(BUILD_DIR);
  let hits = 0;
  for (const f of files) {
    const c = readFileSync(f, 'utf8');
    for (const [re, label, validate] of CRED) {
      for (const m of c.match(re) ?? []) {
        if (validate && !validate(m)) continue;
        fail(`${label} in ${f} — ${m.slice(0, 12)}…`);
        hits++;
        break;
      }
    }
  }
  if (!hits) pass(`no credential patterns across ${files.length} built files`);
}

// ── 2 · Registry identifiers in the build output ─────────────────────────────
// Exact-string search against the real IDs, so there are no false positives
// from minified bundles that happen to contain "app" + 14 characters.
head('2 · Registry identifiers (exact match against the local config)');
const cfgPath = '.claude/registry.local.json';
if (!existsSync(cfgPath)) {
  warn(`${cfgPath} missing — cannot check for identifier leakage`);
} else {
  const cfg = JSON.parse(readFileSync(cfgPath, 'utf8'));
  const ids = [cfg.baseId, cfg.baseIdAlias, ...Object.values(cfg.tables || {})].filter(
    (v) => typeof v === 'string' && /^(app|tbl|rec)[A-Za-z0-9]{14}$/.test(v)
  );
  const targets = [...walk(BUILD_DIR), ...trackedFiles()];
  let hits = 0;
  for (const f of targets) {
    let c;
    try { c = readFileSync(f, 'utf8'); } catch { continue; }
    for (const id of ids) if (c.includes(id)) { fail(`${id} appears in ${f}`); hits++; }
  }
  if (!hits) pass(`none of ${ids.length} registry IDs appear in the build or in tracked files`);
}

function trackedFiles() {
  try {
    return execSync('git ls-files', { encoding: 'utf8' })
      .split('\n').filter(Boolean)
      .filter((f) => TEXT_EXT.has(extname(f)) || extname(f) === '.md' || extname(f) === '.ts' || extname(f) === '.tsx');
  } catch { return []; }
}

// ── 3 · Build-time environment leakage ───────────────────────────────────────
// Vite inlines anything prefixed VITE_ straight into client JS. A secret named
// VITE_ANYTHING is a published secret, not a configured one.
head('3 · Build-time environment leakage');
const viteVars = Object.keys(process.env).filter((k) => k.startsWith('VITE_'));
if (viteVars.length) fail(`VITE_-prefixed vars are inlined into client JS: ${viteVars.join(', ')}`);
else pass('no VITE_-prefixed variables in the build environment');

const strayEnv = existsSync(BUILD_DIR)
  ? walk(BUILD_DIR).filter((f) => /(^|\/)\.env/.test(f))
  : [];
if (strayEnv.length) fail(`.env file inside the build output: ${strayEnv.join(', ')}`);
else pass('no .env files inside the build output');

// ── 4 · Dependencies ─────────────────────────────────────────────────────────
head('4 · Dependencies');
try {
  const raw = execSync('npm audit --json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const v = JSON.parse(raw).metadata?.vulnerabilities ?? {};
  const bad = (v.critical ?? 0) + (v.high ?? 0);
  const meh = (v.moderate ?? 0) + (v.low ?? 0);
  if (bad > 0) fail(`${v.critical ?? 0} critical, ${v.high ?? 0} high advisories — npm audit`);
  else pass('no critical or high advisories');
  if (meh > 0) warn(`${v.moderate ?? 0} moderate, ${v.low ?? 0} low advisories`);
} catch (e) {
  try {
    const v = JSON.parse(e.stdout || '{}').metadata?.vulnerabilities ?? {};
    const bad = (v.critical ?? 0) + (v.high ?? 0);
    if (bad > 0) fail(`${v.critical ?? 0} critical, ${v.high ?? 0} high advisories — npm audit`);
    else pass('no critical or high advisories');
  } catch { warn('npm audit did not return parseable output'); }
}

// ── 5 · Repository state ─────────────────────────────────────────────────────
head('5 · Repository state');
try {
  // reports/ is QA's evidence, not a build input — it is never bundled. A
  // stray report there blocked two unrelated deploys before this filter
  // existed, and a gate that fails for files you do not own is a gate people
  // learn to override. Anything that can reach the build still counts.
  const dirty = execSync('git status --porcelain', { encoding: 'utf8' })
    .split('\n')
    .filter((l) => l.trim() && !/^..\s+reports\//.test(l))
    .join('\n')
    .trim();
  if (dirty) fail(`working tree is dirty — you would deploy something that is not committed:\n        ${dirty.split('\n').slice(0, 5).join('\n        ')}`);
  else pass('working tree clean — what is committed is what deploys');
} catch { warn('not a git repository'); }

try {
  const ignored = execSync('git check-ignore .env .npmrc secrets.json .vercel 2>/dev/null || true', { encoding: 'utf8' })
    .split('\n').filter(Boolean);
  if (ignored.length >= 4) pass('.env, .npmrc, secrets.json and .vercel are all gitignored');
  else warn(`only ${ignored.length}/4 secret-bearing paths are gitignored`);
} catch { /* ignore */ }

// ── 6 · Live response headers (post-deploy) ──────────────────────────────────
if (urlArg) {
  head(`6 · Live response — ${urlArg}  (expected ${expect})`);
  const REQUIRED = {
    'x-content-type-options': (v) => v === 'nosniff',
    'referrer-policy': (v) => !!v,
    'strict-transport-security': (v) => /max-age=\d+/.test(v),
    'content-security-policy': (v) => /frame-ancestors/.test(v),
  };
  try {
    const res = await fetch(urlArg, { redirect: 'manual' });
    const loc = res.headers.get('location') || '';
    const isLogin = res.status >= 300 && res.status < 400 && /sso|login|auth/i.test(loc);

    if (expect === 'protected') {
      if (isLogin) pass(`requires a login (${res.status}) — protected, as intended`);
      else if (res.ok) fail(`serves HTTP ${res.status} to anyone — this URL was expected to require a login`);
      else fail(`returned HTTP ${res.status}`);
    } else {
      if (isLogin) fail(`redirects to a login page (${res.status}) — this URL is not publicly readable`);
      else if (res.status >= 300 && res.status < 400) warn(`redirects (${res.status}) to ${loc}`);
      else if (!res.ok) fail(`returned HTTP ${res.status}`);
      else pass(`serves HTTP ${res.status} without a login redirect — public, as intended`);
    }
    for (const [h, ok] of Object.entries(REQUIRED)) {
      const v = res.headers.get(h);
      if (v && ok(v)) pass(`${h}: ${v.slice(0, 60)}${v.length > 60 ? '…' : ''}`);
      else if (v) fail(`${h} present but weak: ${v.slice(0, 60)}`);
      else fail(`${h} missing`);
    }
  } catch (e) {
    fail(`could not reach ${urlArg} — ${e.message}`);
  }
}

// ── Verdict ──────────────────────────────────────────────────────────────────
console.log(`\n\x1b[1m${fails ? '\x1b[31mBLOCKED' : '\x1b[32mCLEAR'}\x1b[0m  ${passes} passed · ${warns} warned · ${fails} failed`);
if (fails) console.log('  Do not deploy. Fix the failures above, or say plainly why the gate is being overridden.\n');
process.exit(fails ? 1 : 0);
