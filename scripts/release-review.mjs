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
 * Everything it knows about a component comes from `scripts/lib/contract.mjs`,
 * which is also what generates the reference site. One reader, so the site can
 * never publish an intent this would have failed.
 *
 * Usage:
 *   node scripts/release-review.mjs Button
 *   node scripts/release-review.mjs --all
 *   node scripts/release-review.mjs --all --version 0.1.0   # the version being cut
 *
 * Exit 0 = no gate failed mechanically. Exit 1 = at least one FAIL.
 * REVIEW items never fail — 📦 Release closes those, and its report is what
 * says whether the component is releasable.
 */

import { existsSync } from 'node:fs';
import {
  SURFACE, TOKENS_CSS,
  listComponents, readComponent, readTokens, readPackage,
  validateIntent, stripBlockComments, stripLineComments,
  semver, cmpSemver, STATUSES,
} from './lib/contract.mjs';

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

const pkg = readPackage();
/* The version whose promise we are checking against: the one being cut if the
 * caller named it, otherwise whatever package.json currently claims. */
const releaseVersion = versionArg ?? pkg.version;
const tokens = readTokens();

function reviewComponent(name) {
  banner(name);
  const c = readComponent(name);

  if (!c.exists) {
    gate(1, 'Is it actually done?');
    fail(`${c.paths.tsx} does not exist — there is nothing to review`);
    return;
  }

  /* ── 1 · Is it actually done? ─────────────────────────────────────────── */
  gate(1, 'Is it actually done?');
  for (const [label, p] of [['implementation', c.paths.tsx], ['styles', c.paths.css], ['stories', c.paths.stories]]) {
    if (existsSync(p)) pass(`${label} — ${p}`);
    else fail(`${label} missing — ${p}`);
  }
  if (c.figma) pass(`stories name the Figma node they were built from — ${c.figma.node}`);
  else fail('no Figma node URL in the stories file — QA has nothing to test against');

  review('registry — read `Development` and `Synchronization %` on this row. '
    + 'Completed at 100% with no `Fixed (To re-test)` row, or it is not done');
  review('run `npm run lint` and `npm test` — this script does not run them for you');

  /* ── 2 · Are the tokens clean? ────────────────────────────────────────── */
  gate(2, 'Are the tokens clean?');
  let rawHex = 0;
  for (const [kind, content] of [['tsx', c.tsx], ['css', c.css]].filter(([, x]) => x)) {
    for (const m of stripLineComments(stripBlockComments(content)).match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) {
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
  for (const line of stripBlockComments(c.css ?? '').split('\n')) {
    if (!/\b\d+(\.\d+)?px\b/.test(line)) continue;
    if (/--sunim-[A-Za-z]+-unbound-/.test(line)) continue;
    fail(`raw px in ${name}.css — "${line.trim()}"`);
    rawPx++;
  }
  if (!rawPx) pass('no raw px outside the unbound-token quarantine');

  const primitives = new Set([...(c.css ?? '').matchAll(/var\(\s*(--primitives-[a-z0-9-]+)/gi)].map((m) => m[1]));
  if (primitives.size) for (const p of primitives) fail(`reaches a base token directly — ${p}. Components use semantic tokens`);
  else pass('no base tokens referenced directly');

  if (c.unbound.length) {
    warn(`${c.unbound.length} value(s) Figma never bound, held in quarantine: ${c.unbound.map((u) => u.name).join(', ')}`);
    review('each unbound value is a design gap. Confirm it is still open with 🎨 Human before promising this surface');
  } else {
    pass('nothing unbound — every value in this component came from a binding');
  }

  /* ── 3 · Is the public surface decided? ───────────────────────────────── */
  gate(3, 'Is the public surface decided?');
  if (!existsSync(SURFACE)) {
    fail(`${SURFACE} does not exist — nothing declares what this package exports`);
  } else {
    if (c.onSurface) pass(`exported from ${SURFACE}`);
    else fail(`not exported from ${SURFACE} — it is internal, so it cannot be part of a release`);
    if (c.propsExported) pass(`${name}Props is exported — consumers can type their wrappers`);
    else fail(`${name}Props is not exported — a consumer cannot type a wrapper around ${name}`);
  }
  for (const dep of c.composes) {
    const sib = readComponent(dep);
    if (sib.exists && sib.onSurface) pass(`composes ${dep}, which is on the surface too`);
    else fail(`composes ${dep}, which is not exported — this leaks a type a consumer cannot import`);
  }

  /* ── 4 · Are the names final? ─────────────────────────────────────────── */
  gate(4, 'Are the names final?');
  if (c.hasSymbol) pass(`exported symbol matches the folder — ${name}`);
  else fail(`no \`export function ${name}\` in ${name}.tsx — folder and symbol disagree`);

  if (c.hasClassPrefix) pass(`CSS class prefix matches — .sunim-${name}`);
  else if (c.css) fail(`no .sunim-${name} class in ${name}.css — the CSS names it something else`);

  /*
   * CLAUDE.md: "A component's props are its documented API. Undocumented
   * behaviour is a bug." An undocumented prop is a name nobody has defended,
   * and this is the last gate before it becomes a name you cannot change.
   */
  if (!c.props) {
    fail(`no \`export interface ${name}Props\` — the API is not written down`);
  } else {
    const undocumented = c.props.filter((p) => !p.doc).map((p) => p.name);
    if (undocumented.length) fail(`undocumented prop(s): ${undocumented.join(', ')}`);
    else pass(`all ${c.props.length} props carry a doc comment`);
  }
  review('prop names must match the Figma property names exactly — compare against the node, not against this file');

  /* ── 5 · Are the states complete? ─────────────────────────────────────── */
  gate(5, 'Are the states complete?');
  if (!c.unions.length) warn('no variant union types found — either this component has no variants, or they are not typed');
  for (const { typeName, members } of c.unions) {
    const missing = members.filter((m) => !c.stories || !new RegExp(`['"\`]${m}['"\`]`).test(c.stories));
    if (missing.length) fail(`${typeName}: no story covers ${missing.map((m) => `"${m}"`).join(', ')}`);
    else pass(`${typeName}: all ${members.length} values appear in the stories`);
  }
  review('a story existing is not a state working. Click every state in the deployed Storybook — '
    + 'disabled, loading and focus are the three that render fine and behave wrongly');

  /* ── 6 · Is the intent documented? ────────────────────────────────────── */
  gate(6, 'Is the intent documented?');
  const findings = validateIntent(c, tokens);
  for (const f of findings) (f.severity === 'warn' ? warn : fail)(f.message);
  if (!findings.some((f) => f.severity !== 'warn')) {
    pass(`intent states use, misuse, placement, ${c.intent.required_tokens.length} tokens and accessibility`);
    pass('every required token exists in the build and is referenced by the component');
  }
  if (!tokens.size) warn(`${TOKENS_CSS} not built — token existence was not checked. Run \`npm run build:tokens\``);
  review('read the intent against the component. "Correct" is not the same as "true" — '
    + 'the dont_use_when is the field that is usually aspirational');

  /* ── 7 · Do you understand what this version means? ───────────────────── */
  gate(7, `Do you understand what ${releaseVersion} means?`);
  if (existsSync('VERSIONING.md')) pass('VERSIONING.md defines what the number promises, and what it does not');
  else fail('VERSIONING.md does not exist — there is no written answer to what this number promises');

  const rel = semver(releaseVersion);
  const since = c.intent ? semver(c.intent.since) : null;
  if (!rel) {
    fail(`the release version "${releaseVersion}" is not semver`);
  } else if (c.intent && !since) {
    fail(`intent.since is "${c.intent.since}", which is not semver`);
  } else if (since) {
    if (cmpSemver(since, rel) > 0 && versionArg) {
      fail(`intent.since is ${c.intent.since} but you are cutting ${versionArg} — it promises a version that does not exist`);
    } else if (cmpSemver(since, semver(pkg.version)) > 0) {
      warn(`staged for ${c.intent.since}; package.json still reads ${pkg.version}. `
        + 'Bumping it is a human release act — see VERSIONING.md. '
        + `Re-run with \`--version ${c.intent.since}\` to review against the version being cut`);
    } else {
      pass(`since ${c.intent.since} is at or behind the release being cut`);
    }

    if (c.intent.status === 'stable' && rel[0] === 0) {
      fail(`status is "stable" at ${releaseVersion}. A 0.x version makes no compatibility promise, `
        + 'so calling it stable overstates what the number can carry');
    } else if (STATUSES.includes(c.intent.status)) {
      pass(`status "${c.intent.status}" is consistent with ${releaseVersion}`);
    }
  }
  review(`say, in your report and in your own words, what ${releaseVersion} promises about ${name} `
    + 'and what it deliberately does not. A gate cannot check comprehension; that sentence can');
}

/* ── Run ─────────────────────────────────────────────────────────────────── */

const targets = all ? listComponents() : named;

if (!targets.length) {
  console.error('Usage: node scripts/release-review.mjs <Component> | --all [--version 0.1.0]');
  process.exit(2);
}

console.log(`\n\x1b[1mRelease review\x1b[0m — ${targets.length} component(s) against ${releaseVersion}`);
for (const t of targets) reviewComponent(t);

console.log(
  `\n\x1b[1m${fails ? '\x1b[31mBLOCKED' : '\x1b[32mCLEAR'}\x1b[0m  `
  + `${passes} passed · ${warns} warned · ${fails} failed · ${reviews} awaiting 📦 Release`,
);
if (fails) console.log('  Not releasable. Fix the failures above, or record in the review why the gate was overridden.');
console.log(`  CLEAR means the mechanical half passed. ${reviews} item(s) still need judgement — `
  + 'that is what the review report is for.\n');
process.exit(fails ? 1 : 0);
