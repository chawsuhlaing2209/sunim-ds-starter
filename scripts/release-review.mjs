#!/usr/bin/env node
/**
 * The mechanical half of the release review.
 *
 * Seven gates stand between a component and a public version number. Four of
 * them can be decided by reading files, and this script decides those. The
 * other three need somebody to look at the design, the rendered component, and
 * what the version number is promising — so for those it gathers the evidence,
 * prints it, and marks it REVIEW rather than pretending to have judged it.
 *
 * That split is the point. A gate that quietly passes because nothing checked
 * it is worse than no gate, because the report says "7/7" either way.
 *
 * Usage:
 *   node scripts/release-review.mjs Button
 *   node scripts/release-review.mjs --all
 *   node scripts/release-review.mjs --all --version 0.1.0   # the version being cut
 *
 * Exit 0 = no gate failed mechanically. Exit 1 = at least one FAIL.
 * REVIEW items never fail — 🧭 Reviewer closes those, and its report is what
 * says whether the component is releasable.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const COMPONENTS_DIR = 'src/components';
const TOKENS_CSS = 'build/tokens/css/tokens.css';
const SURFACE = 'src/index.ts';

let fails = 0, warns = 0, passes = 0, reviews = 0;
const pass = (m) => { passes++; console.log(`  \x1b[32mPASS\x1b[0m    ${m}`); };
const warn = (m) => { warns++; console.log(`  \x1b[33mWARN\x1b[0m    ${m}`); };
const fail = (m) => { fails++; console.log(`  \x1b[31mFAIL\x1b[0m    ${m}`); };
const review = (m) => { reviews++; console.log(`  \x1b[36mREVIEW\x1b[0m  ${m}`); };
const gate = (n, m) => console.log(`\n  \x1b[1m${n} · ${m}\x1b[0m`);
const banner = (m) => console.log(`\n\x1b[1m━━ ${m} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\x1b[0m`);

const args = process.argv.slice(2);
const all = args.includes('--all');
const versionArg = args.includes('--version') ? args[args.indexOf('--version') + 1] : null;
const named = args.filter((a) => !a.startsWith('--') && a !== versionArg);

/* ── Shared reads ────────────────────────────────────────────────────────── */

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
/* The version whose promise we are checking against: the one being cut if the
 * caller named it, otherwise whatever package.json currently claims. */
const releaseVersion = versionArg ?? pkg.version;

const surface = existsSync(SURFACE) ? readFileSync(SURFACE, 'utf8') : null;
const tokensCss = existsSync(TOKENS_CSS) ? readFileSync(TOKENS_CSS, 'utf8') : null;

/** Every `--custom-property` the generated build actually defines. */
const definedTokens = new Set(
  [...(tokensCss ?? '').matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map((m) => m[1]),
);

const stripBlockComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '');
const stripLineComments = (s) => s.replace(/^\s*\/\/.*$/gm, '');

const semver = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v ?? '');
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};
const cmp = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/** `color.accent.ink-deep` → `--color-accent-ink-deep`. */
const cssVar = (dotted) => `--${dotted.replace(/\./g, '-')}`;

const INTENT_KEYS = [
  'component', 'since', 'status',
  'use_when', 'dont_use_when', 'placement', 'required_tokens', 'a11y',
];
const PROSE_KEYS = ['use_when', 'dont_use_when', 'placement', 'a11y'];
const STATUSES = ['experimental', 'settling', 'stable'];

/* ── The review of one component ─────────────────────────────────────────── */

function reviewComponent(name) {
  banner(name);

  const dir = join(COMPONENTS_DIR, name);
  const paths = {
    tsx: join(dir, `${name}.tsx`),
    css: join(dir, `${name}.css`),
    stories: join(dir, `${name}.stories.tsx`),
    intent: join(dir, `${name}.intent.json`),
  };
  const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);
  const tsx = read(paths.tsx);
  const css = read(paths.css);
  const stories = read(paths.stories);

  if (!tsx) {
    gate(1, 'Is it actually done?');
    fail(`${paths.tsx} does not exist — there is nothing to review`);
    return;
  }

  /* ── 1 · Is it actually done? ─────────────────────────────────────────── */
  gate(1, 'Is it actually done?');
  for (const [label, p] of [['implementation', paths.tsx], ['styles', paths.css], ['stories', paths.stories]]) {
    if (existsSync(p)) pass(`${label} — ${p}`);
    else fail(`${label} missing — ${p}`);
  }
  if (stories && /figma\.com\/design\/[^\s)`'"]+node-id=/i.test(stories)) {
    pass('stories name the Figma node they were built from');
  } else {
    fail('no Figma node URL in the stories file — QA has nothing to test against');
  }
  review('registry — read `Development` and `Synchronization %` on this row. '
    + 'Completed at 100% with no `Fixed (To re-test)` row, or it is not done');
  review('run `npm run lint` and `npm test` — this script does not run them for you');

  /* ── 2 · Are the tokens clean? ────────────────────────────────────────── */
  gate(2, 'Are the tokens clean?');
  const sources = [['tsx', tsx], ['css', css]].filter(([, c]) => c);

  let rawHex = 0;
  for (const [kind, content] of sources) {
    const bare = stripLineComments(stripBlockComments(content));
    for (const m of bare.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
      fail(`raw hex ${m} in ${name}.${kind} — every colour is a token`);
      rawHex++;
    }
  }
  if (!rawHex) pass('no raw hex outside comments');

  /*
   * Raw px is allowed in exactly one place: the `--sunim-<Name>-unbound-*`
   * block, where a value Figma never bound is transcribed and quarantined. That
   * is a design gap being held visible, which is the opposite of a shortcut.
   */
  let rawPx = 0;
  if (css) {
    for (const line of stripBlockComments(css).split('\n')) {
      if (!/\b\d+(\.\d+)?px\b/.test(line)) continue;
      if (/--sunim-[A-Za-z]+-unbound-/.test(line)) continue;
      fail(`raw px in ${name}.css — "${line.trim()}"`);
      rawPx++;
    }
  }
  if (!rawPx) pass('no raw px outside the unbound-token quarantine');

  const primitives = [...(css ?? '').matchAll(/var\(\s*(--primitives-[a-z0-9-]+)/gi)].map((m) => m[1]);
  if (primitives.length) {
    for (const p of new Set(primitives)) fail(`reaches a base token directly — ${p}. Components use semantic tokens`);
  } else {
    pass('no base tokens referenced directly');
  }

  const unbound = [...stripBlockComments(css ?? '').matchAll(/(--sunim-[A-Za-z]+-unbound-[a-z0-9-]+)\s*:/gi)].map((m) => m[1]);
  if (unbound.length) {
    warn(`${unbound.length} value(s) Figma never bound, held in quarantine: ${[...new Set(unbound)].join(', ')}`);
    review('each unbound value is a design gap. Confirm it is still open with 🎨 Human before promising this surface');
  } else {
    pass('nothing unbound — every value in this component came from a binding');
  }

  /* ── 3 · Is the public surface decided? ───────────────────────────────── */
  gate(3, 'Is the public surface decided?');
  if (!surface) {
    fail(`${SURFACE} does not exist — nothing declares what this package exports`);
  } else {
    const exported = new RegExp(`\\b${name}\\b`).test(
      (surface.match(/export\s*{[^}]*}/g) ?? []).join(' '),
    );
    if (exported) pass(`exported from ${SURFACE}`);
    else fail(`not exported from ${SURFACE} — it is internal, so it cannot be part of a release`);

    if (new RegExp(`\\b${name}Props\\b`).test(surface)) pass(`${name}Props is exported — consumers can type their wrappers`);
    else fail(`${name}Props is not exported — a consumer cannot type a wrapper around ${name}`);
  }
  const deep = tsx.match(/from\s+'\.\.\/(\w+)\/\1'/g) ?? [];
  if (deep.length) review(`imports ${deep.length} sibling component(s) — confirm each is on the surface too, or this export leaks an internal type`);

  /* ── 4 · Are the names final? ─────────────────────────────────────────── */
  gate(4, 'Are the names final?');
  if (new RegExp(`export function ${name}\\b`).test(tsx)) pass(`exported symbol matches the folder — ${name}`);
  else fail(`no \`export function ${name}\` in ${name}.tsx — folder and symbol disagree`);

  if (css && css.includes(`sunim-${name}`)) pass(`CSS class prefix matches — .sunim-${name}`);
  else if (css) fail(`no .sunim-${name} class in ${name}.css — the CSS names it something else`);

  /*
   * CLAUDE.md: "A component's props are its documented API. Undocumented
   * behaviour is a bug." An undocumented prop is a name nobody has defended,
   * and this is the last gate before it becomes a name you cannot change.
   */
  const iface = new RegExp(`export interface ${name}Props[^{]*{([\\s\\S]*?)\\n}`).exec(tsx);
  if (!iface) {
    fail(`no \`export interface ${name}Props\` — the API is not written down`);
  } else {
    const lines = iface[1].split('\n');
    const undocumented = [];
    lines.forEach((line, i) => {
      const prop = /^\s{2}(\w+)\??:/.exec(line);
      if (!prop) return;
      const before = lines.slice(0, i).reverse().find((l) => l.trim() !== '');
      if (!before || !before.trim().endsWith('*/')) undocumented.push(prop[1]);
    });
    if (undocumented.length) fail(`undocumented prop(s): ${undocumented.join(', ')}`);
    else pass('every prop carries a doc comment');
  }
  review('prop names must match the Figma property names exactly — compare against the node, not against this file');

  /* ── 5 · Are the states complete? ─────────────────────────────────────── */
  gate(5, 'Are the states complete?');
  const unions = [...tsx.matchAll(/export type (\w+) =([^;]+);/g)]
    .map(([, typeName, body]) => ({ typeName, members: [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]) }))
    .filter((u) => u.members.length);

  if (!unions.length) {
    warn('no variant union types found — either this component has no variants, or they are not typed');
  }
  for (const { typeName, members } of unions) {
    const missing = members.filter((m) => !stories || !new RegExp(`['"\`]${m}['"\`]`).test(stories));
    if (missing.length) fail(`${typeName}: no story covers ${missing.map((m) => `"${m}"`).join(', ')}`);
    else pass(`${typeName}: all ${members.length} values appear in the stories`);
  }
  review('a story existing is not a state working. Click every state in the deployed Storybook — '
    + 'disabled, loading and focus are the three that render fine and behave wrongly');

  /* ── 6 · Is the intent documented? ────────────────────────────────────── */
  gate(6, 'Is the intent documented?');
  let intent = null;
  if (!existsSync(paths.intent)) {
    fail(`${paths.intent} does not exist — nothing says what this component is for`);
  } else {
    try {
      intent = JSON.parse(readFileSync(paths.intent, 'utf8'));
    } catch (e) {
      fail(`${paths.intent} is not valid JSON — ${e.message}`);
    }
  }

  if (intent) {
    const missing = INTENT_KEYS.filter((k) => intent[k] === undefined);
    if (missing.length) fail(`intent is missing: ${missing.join(', ')}`);

    /* Only the prose fields. `component`, `since` and `status` are short by
     * design, and a length floor on them would fail every valid intent. */
    const blank = PROSE_KEYS.filter(
      (k) => typeof intent[k] === 'string' && intent[k].trim().length < 24,
    );
    if (blank.length) fail(`intent field(s) too short to mean anything: ${blank.join(', ')}`);

    for (const k of INTENT_KEYS) {
      if (typeof intent[k] === 'string' && /\bTBD\b|\bTODO\b|\bn\/a\b/i.test(intent[k])) {
        fail(`intent.${k} is a placeholder, not an intent`);
      }
    }

    if (intent.component && intent.component !== name) {
      fail(`intent names "${intent.component}" but lives in ${name}/ — one of them is wrong`);
    }

    if (!STATUSES.includes(intent.status)) {
      fail(`intent.status is "${intent.status}", expected one of ${STATUSES.join(', ')}`);
    }

    const required = Array.isArray(intent.required_tokens) ? intent.required_tokens : [];
    if (!required.length) {
      fail('intent.required_tokens is empty — every component in this system renders from tokens');
    } else {
      const body = `${css ?? ''}\n${tsx}`;
      let bad = 0;
      for (const dotted of required) {
        if (/[{}]/.test(dotted)) {
          fail(`required_tokens contains a placeholder — "${dotted}". A brace cannot be resolved, so it checks nothing`);
          bad++;
          continue;
        }
        const v = cssVar(dotted);
        if (definedTokens.size && !definedTokens.has(v)) {
          fail(`required token ${dotted} resolves to ${v}, which the token build does not define`);
          bad++;
        } else if (!body.includes(v)) {
          fail(`required token ${dotted} (${v}) is declared but never referenced by ${name}`);
          bad++;
        }
      }
      if (!bad) pass(`all ${required.length} required tokens exist and are actually used`);
      if (!definedTokens.size) warn(`${TOKENS_CSS} not built — token existence was not checked. Run \`npm run build:tokens\``);
    }

    if (!missing.length && !blank.length) pass('intent states use, misuse, placement, tokens and accessibility');
    review('read the intent against the component. "Correct" is not the same as "true" — '
      + 'the dont_use_when is the field that is usually aspirational');
  }

  /* ── 7 · Do you understand what this version means? ───────────────────── */
  gate(7, `Do you understand what ${releaseVersion} means?`);
  if (!existsSync('VERSIONING.md')) {
    fail('VERSIONING.md does not exist — there is no written answer to what this number promises');
  } else {
    pass('VERSIONING.md defines what the number promises, and what it does not');
  }

  const rel = semver(releaseVersion);
  const since = intent ? semver(intent.since) : null;
  if (!rel) {
    fail(`the release version "${releaseVersion}" is not semver`);
  } else if (intent && !since) {
    fail(`intent.since is "${intent.since}", which is not semver`);
  } else if (since) {
    if (cmp(since, rel) > 0 && versionArg) {
      fail(`intent.since is ${intent.since} but you are cutting ${versionArg} — it promises a version that does not exist`);
    } else if (cmp(since, semver(pkg.version)) > 0) {
      warn(`staged for ${intent.since}; package.json still reads ${pkg.version}. `
        + 'Bumping it is a human release act — see VERSIONING.md. '
        + `Re-run with \`--version ${intent.since}\` to review against the version being cut`);
    } else {
      pass(`since ${intent.since} is at or behind the release being cut`);
    }

    if (intent.status === 'stable' && rel[0] === 0) {
      fail(`status is "stable" at ${releaseVersion}. A 0.x version makes no compatibility promise, `
        + 'so calling it stable overstates what the number can carry');
    } else if (intent) {
      pass(`status "${intent.status}" is consistent with ${releaseVersion}`);
    }
  }
  review(`say, in your report and in your own words, what ${releaseVersion} promises about ${name} `
    + 'and what it deliberately does not. A gate cannot check comprehension; that sentence can');
}

/* ── Run ─────────────────────────────────────────────────────────────────── */

const targets = all
  ? readdirSync(COMPONENTS_DIR).filter((d) => existsSync(join(COMPONENTS_DIR, d, `${d}.tsx`))).sort()
  : named;

if (!targets.length) {
  console.error('Usage: node scripts/release-review.mjs <Component> | --all [--version 0.1.0]');
  process.exit(2);
}

console.log(`\n\x1b[1mRelease review\x1b[0m — ${targets.length} component(s) against ${releaseVersion}`);
for (const t of targets) reviewComponent(t);

console.log(
  `\n\x1b[1m${fails ? '\x1b[31mBLOCKED' : '\x1b[32mCLEAR'}\x1b[0m  `
  + `${passes} passed · ${warns} warned · ${fails} failed · ${reviews} awaiting 🧭 Reviewer`,
);
if (fails) console.log('  Not releasable. Fix the failures above, or record in the review why the gate was overridden.');
console.log(`  CLEAR means the mechanical half passed. ${reviews} item(s) still need judgement — `
  + 'that is what the review report is for.\n');
process.exit(fails ? 1 : 0);
