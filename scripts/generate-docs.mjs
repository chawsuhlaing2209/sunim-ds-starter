#!/usr/bin/env node
/**
 * Generates the reference site's content from the meta contract.
 *
 * Every component page comes out of four things that already exist: the intent
 * file, the props interface with its doc comments, the tokens the component
 * declares it needs, and the stories. Nothing is written twice, so nothing can
 * drift — a page is wrong only when the component is wrong.
 *
 * The part that matters is the refusal. This reads the intent through the same
 * `validateIntent` that 🧭 Reviewer's gate 6 uses, and **will not emit a page for
 * a component that fails it**. Without that, the two halves of the loop drift
 * apart silently and the failure mode is a published page confidently describing
 * a component that was never allowed to ship.
 *
 * Usage:
 *   node scripts/generate-docs.mjs              # all components
 *   node scripts/generate-docs.mjs --force      # emit anyway, marking each gap
 *
 * Exit 0 = every page written. Exit 1 = at least one component failed its gate.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Run from the repo root whatever directory npm invoked us from — `docs/` runs
 * this as `node ../scripts/generate-docs.mjs`, and every path in the contract is
 * relative to the root. */
process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..'));

import {
  listComponents, readComponent, readTokens, readModes, readPackage,
  validateIntent, resolveToken, isColour, parseDefaults, cssVar,
} from './lib/contract.mjs';

const DOCS = 'docs/src/content/docs';
const COMPONENTS_OUT = join(DOCS, 'components');
const START_OUT = join(DOCS, 'start');
const CONFIG = 'docs/reference.config.json';

const force = process.argv.includes('--force');
const site = JSON.parse(readFileSync(CONFIG, 'utf8'));
const pkg = readPackage();
const tokens = readTokens();
const modes = readModes();

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const note = (m) => console.log(`  \x1b[33m·\x1b[0m ${m}`);

/* ── Markdown helpers ────────────────────────────────────────────────────── */

/** A table cell cannot contain a raw pipe or a newline and survive. */
const cell = (s) => String(s ?? '').replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();

/** Frontmatter values go through JSON so quotes and colons cannot break YAML. */
const yaml = (s) => JSON.stringify(String(s ?? ''));

/** First sentence, for the frontmatter description. */
const firstSentence = (s) => {
  const m = /^(.+?[.!?])(\s|$)/s.exec(String(s ?? '').trim());
  return (m ? m[1] : String(s ?? '')).replace(/\s+/g, ' ').slice(0, 250);
};

const STATUS_NOTE = {
  experimental: 'Expect this to change. Do not build on the details.',
  settling: 'The shape looks right. The names may still move.',
  stable: 'Changing this would be treated as a breaking change.',
};

const STATUS_BADGE = { experimental: 'caution', settling: 'note', stable: 'success' };

/* ── One component page ──────────────────────────────────────────────────── */

function componentPage(c, index) {
  const { intent } = c;
  const defaults = parseDefaults(c.tsx, c.name);
  const storybook = site.storybookUrl.replace(/\/$/, '');
  const storyLink = (id) => `${storybook}/?path=/story/${id}`;
  const docsLink = `${storybook}/?path=/docs/${c.storyIds[0]?.id.split('--')[0]}--docs`;

  const out = [];

  out.push('---');
  out.push(`title: ${yaml(c.name)}`);
  out.push(`description: ${yaml(firstSentence(intent.use_when))}`);
  out.push('sidebar:');
  out.push(`  order: ${index + 1}`);
  out.push('  badge:');
  out.push(`    text: ${yaml(intent.status)}`);
  out.push(`    variant: ${STATUS_BADGE[intent.status] ?? 'note'}`);
  out.push('---');
  out.push('');
  out.push('import { Aside, Badge, LinkCard, CardGrid } from \'@astrojs/starlight/components\';');
  out.push('');

  /* ── Intent ──────────────────────────────────────────────────────────── */
  out.push('## When to use it');
  out.push('');
  out.push(intent.use_when);
  out.push('');
  out.push(`**Where it goes.** ${intent.placement}`);
  out.push('');
  out.push('<Aside type="caution" title="When not to use it">');
  out.push(intent.dont_use_when);
  out.push('</Aside>');
  out.push('');

  /* ── Props ───────────────────────────────────────────────────────────── */
  out.push('## Props');
  out.push('');
  if (!c.props?.length) {
    out.push('_This component declares no props._');
  } else {
    out.push('| Prop | Type | Default | What it does |');
    out.push('|---|---|---|---|');
    for (const p of c.props) {
      const def = defaults[p.name] !== undefined
        ? `\`${defaults[p.name]}\``
        : p.optional ? '—' : '**required**';
      out.push(`| \`${p.name}\` | \`${cell(p.type)}\` | ${def} | ${cell(p.doc ?? '')} |`);
    }
    out.push('');
    out.push('Prop names mirror the Figma property names exactly. That is a rule of the system, '
      + 'not a coincidence — it is what lets a design change and a code change be the same conversation.');
  }
  out.push('');

  /* ── Variants ────────────────────────────────────────────────────────── */
  if (c.unions.length) {
    out.push('## Variants');
    out.push('');
    out.push('| Type | Values |');
    out.push('|---|---|');
    for (const u of c.unions) {
      out.push(`| \`${u.typeName}\` | ${u.members.map((m) => `\`${m}\``).join(' · ')} |`);
    }
    out.push('');
    const total = c.unions.reduce((n, u) => n * u.members.length, 1);
    out.push(`That is ${total} combination${total === 1 ? '' : 's'}, and every one has a story.`);
    out.push('');
  }

  /* ── Tokens ──────────────────────────────────────────────────────────── */
  out.push('## Tokens it needs');
  out.push('');
  out.push('These are the semantic tokens this component cannot render without. Change one and '
    + 'this component changes with it.');
  out.push('');
  out.push('| Token | Resolves to | |');
  out.push('|---|---|---|');
  for (const dotted of intent.required_tokens) {
    const v = cssVar(dotted);
    const { resolved, chain } = resolveToken(v, tokens);
    const swatch = isColour(resolved)
      ? `<span class="sunim-swatch" style="background:${resolved}"></span>`
      : '';
    const via = chain.length > 1 ? ` <small>via \`${chain[1]}\`</small>` : '';
    out.push(`| \`${dotted}\` | ${swatch}\`${cell(resolved ?? '—')}\`${via} | |`);
  }
  out.push('');
  out.push(`<Aside type="note" title="Values shown are the \`${modes[0]}\` mode">`);
  out.push(`The token export defines ${modes.length} modes — ${modes.map((m) => `\`${m}\``).join(', ')} — `
    + 'and every one of these names is redeclared in each. A component binds the name, never the value, '
    + 'so it follows whichever mode the page is in.');
  out.push('</Aside>');
  out.push('');

  /* ── Accessibility ───────────────────────────────────────────────────── */
  out.push('## Accessibility');
  out.push('');
  out.push(intent.a11y);
  out.push('');

  /* ── Composition ─────────────────────────────────────────────────────── */
  const consumers = listComponents()
    .map(readComponent)
    .filter((o) => o.exists && o.composes.includes(c.name))
    .map((o) => o.name);

  if (c.composes.length || consumers.length) {
    out.push('## Composition');
    out.push('');
    if (c.composes.length) {
      out.push(`**Imports** ${c.composes.map((d) => `[${d}](/components/${d.toLowerCase()}/)`).join(', ')}. `
        + 'Not a copy of it — the same component, so a repair there is a repair here.');
      out.push('');
    }
    if (consumers.length) {
      out.push(`**Imported by** ${consumers.map((d) => `[${d}](/components/${d.toLowerCase()}/)`).join(', ')}. `
        + 'Changing this component means re-testing those.');
      out.push('');
    }
  }

  /* ── Design gaps ─────────────────────────────────────────────────────── */
  if (c.unbound.length) {
    out.push('## Values Figma never bound');
    out.push('');
    out.push('Each of these is a value the design carries as a plain number, with no variable behind '
      + 'it. They are transcribed exactly and quarantined in one block rather than mapped onto a '
      + 'token that happens to share the number — doing that would disguise an open design gap as a '
      + 'binding. Each becomes a token the moment design binds it.');
    out.push('');
    out.push('| Property | Value |');
    out.push('|---|---|');
    for (const u of c.unbound) out.push(`| \`${u.name}\` | \`${cell(u.value)}\` |`);
    out.push('');
  }

  /* ── Storybook ───────────────────────────────────────────────────────── */
  out.push('## See it render');
  out.push('');
  out.push('This page explains the component. Storybook is where it renders — every variant, every '
    + 'state, in all seven modes.');
  out.push('');
  out.push('<CardGrid>');
  out.push(`<LinkCard title="${c.name} in Storybook" description="${c.storyIds.length} stories, one per row of the variant matrix" href="${docsLink}" />`);
  if (c.figma) {
    out.push(`<LinkCard title="The Figma node" description="Node ${c.figma.node} — what this was built from, and what QA tests against" href="${c.figma.url}" />`);
  }
  out.push('</CardGrid>');
  out.push('');
  if (c.storyIds.length) {
    out.push('<details>');
    out.push(`<summary>All ${c.storyIds.length} stories</summary>`);
    out.push('');
    for (const s of c.storyIds) out.push(`- [${s.exportName}](${storyLink(s.id)})`);
    out.push('');
    out.push('</details>');
    out.push('');
  }

  /* ── The promise ─────────────────────────────────────────────────────── */
  out.push('## What this version promises');
  out.push('');
  out.push(`\`${c.name}\` entered the public surface in **${intent.since}** and is `
    + `**${intent.status}** — ${STATUS_NOTE[intent.status]}`);
  out.push('');
  out.push(`The package is at \`${pkg.version}\`. Below \`1.0.0\` a minor bump is allowed to break `
    + 'anything: that is the semver contract, not a loophole, and it is why the version starts with '
    + 'a zero. [What the number promises](/start/versioning/) has the detail.');
  out.push('');
  out.push('---');
  out.push('');
  out.push('<small>Generated from `' + c.paths.intent + '`, `' + c.paths.tsx + '` and the token build. '
    + 'Editing this page by hand lasts until the next build — change the source instead.</small>');
  out.push('');

  return out.join('\n');
}

/* ── The overview ────────────────────────────────────────────────────────── */

function overviewPage(components) {
  const out = [];
  out.push('---');
  out.push('title: All components');
  out.push('description: Every component in the system, with the one line that says what it is for.');
  out.push('sidebar:');
  out.push('  order: 0');
  out.push('---');
  out.push('');
  out.push('Four components, and the question each one answers. If none of these is the answer to '
    + 'yours, that is a gap to raise rather than a component to invent.');
  out.push('');
  out.push('| Component | Use when | Stability |');
  out.push('|---|---|---|');
  for (const c of components) {
    out.push(`| [${c.name}](/components/${c.name.toLowerCase()}/) | ${cell(c.intent.use_when)} | \`${c.intent.status}\` |`);
  }
  out.push('');
  out.push('## What is not here');
  out.push('');
  out.push('Anything not exported from `src/index.ts` is not part of the release, whatever else is in '
    + 'the repository. A page exists here only for components on that surface — which is why the list '
    + 'is shorter than the folder.');
  out.push('');
  return out.join('\n');
}

/* ── The tokens page ─────────────────────────────────────────────────────── */

function tokensPage(components) {
  const used = new Map();
  for (const c of components) {
    for (const dotted of c.intent.required_tokens) {
      if (!used.has(dotted)) used.set(dotted, []);
      used.get(dotted).push(c.name);
    }
  }

  const out = [];
  out.push('---');
  out.push('title: Tokens in use');
  out.push('description: Every semantic token a released component depends on, and which components break if it moves.');
  out.push('sidebar:');
  out.push('  order: 3');
  out.push('---');
  out.push('');
  out.push(`${used.size} semantic tokens carry the ${components.length} released components. This is not `
    + 'the whole export — it is the load-bearing part, the tokens a component has declared it cannot '
    + 'render without. Read it in the other direction and it answers the question a palette change '
    + 'raises: **what breaks if this moves.**');
  out.push('');
  out.push('| Token | Resolves to | Depended on by |');
  out.push('|---|---|---|');
  for (const [dotted, users] of [...used.entries()].sort()) {
    const { resolved, chain } = resolveToken(cssVar(dotted), tokens);
    const swatch = isColour(resolved) ? `<span class="sunim-swatch" style="background:${resolved}"></span>` : '';
    const via = chain.length > 1 ? ` <small>via \`${chain[1]}\`</small>` : '';
    out.push(`| \`${dotted}\` | ${swatch}\`${cell(resolved ?? '—')}\`${via} | ${users.join(', ')} |`);
  }
  out.push('');
  out.push(`Values shown are the \`${modes[0]}\` mode. The export defines ${modes.length} — `
    + `${modes.map((m) => `\`${m}\``).join(', ')} — and redeclares every one of these names in each.`);
  out.push('');
  out.push('## Where they come from');
  out.push('');
  out.push('Figma, through the Design Tokens export in `tokens/tokens.json`, built by Style Dictionary '
    + 'into `build/tokens/css/tokens.css`. That file is generated and is never edited by hand: a value '
    + 'that is wrong is wrong in Figma, and fixing it anywhere else lasts until the next export.');
  out.push('');
  out.push('Semantic tokens point at primitives — `color.accent.ink` is `--primitives-sky-600` — and a '
    + 'component references only the semantic name. That indirection is the whole point: it is what '
    + 'lets seven modes exist without a component knowing there is more than one.');
  out.push('');
  return out.join('\n');
}

/* ── The versioning page ─────────────────────────────────────────────────── */

function versioningPage() {
  const md = readFileSync('VERSIONING.md', 'utf8')
    /* Drop the H1 — Starlight renders the frontmatter title as the page heading,
     * and two would stack. */
    .replace(/^#\s+.*\n/, '');

  return [
    '---',
    'title: Versioning',
    'description: What a version number promises about this system, and what it deliberately does not.',
    'sidebar:',
    '  order: 2',
    '---',
    '',
    md.trim(),
    '',
    '---',
    '',
    '<small>Generated from `VERSIONING.md` in the repository. That file is the source; this is a copy '
    + 'that cannot fall behind it.</small>',
    '',
  ].join('\n');
}

/* ── Run ─────────────────────────────────────────────────────────────────── */

console.log('\n\x1b[1mGenerating the reference site\x1b[0m');

mkdirSync(COMPONENTS_OUT, { recursive: true });
mkdirSync(START_OUT, { recursive: true });

/* Clear the generated directory first. A component removed from the surface must
 * lose its page — leaving stale files behind is how a site keeps documenting
 * something that no longer exists. */
for (const f of readdirSync(COMPONENTS_OUT)) {
  if (f.endsWith('.md') || f.endsWith('.mdx')) unlinkSync(join(COMPONENTS_OUT, f));
}

const published = [];
let blocked = 0;
let skipped = 0;

for (const name of listComponents()) {
  const c = readComponent(name);

  if (!c.onSurface) {
    note(`${name} — not exported from src/index.ts, so it is not part of the release. No page.`);
    skipped++;
    continue;
  }

  const findings = validateIntent(c, tokens);
  if (findings.length && !force) {
    bad(`${name} — intent fails gate 6, so no page is published:`);
    for (const f of findings) console.log(`      ${f.message}`);
    blocked++;
    continue;
  }
  if (findings.length) {
    note(`${name} — ${findings.length} gate-6 finding(s), published anyway under --force`);
  }

  writeFileSync(join(COMPONENTS_OUT, `${name.toLowerCase()}.mdx`), componentPage(c, published.length));
  published.push(c);
  ok(`${name} — ${c.props?.length ?? 0} props · ${c.intent.required_tokens.length} tokens · ${c.storyIds.length} stories`);
}

if (published.length) {
  writeFileSync(join(COMPONENTS_OUT, 'overview.md'), overviewPage(published));
  writeFileSync(join(START_OUT, 'tokens.md'), tokensPage(published));
  ok(`overview + tokens pages`);
}

if (existsSync('VERSIONING.md')) {
  writeFileSync(join(START_OUT, 'versioning.md'), versioningPage());
  ok('versioning page, from VERSIONING.md');
} else {
  bad('VERSIONING.md is missing — the site cannot say what its version numbers promise');
  blocked++;
}

console.log(
  `\n${blocked ? '\x1b[31mBLOCKED\x1b[0m' : '\x1b[32mDONE\x1b[0m'}  `
  + `${published.length} published · ${skipped} not on the surface · ${blocked} blocked\n`,
);
if (blocked && !force) {
  console.log('  A page is not published for a component whose intent would fail the release gate.');
  console.log('  Fix the intent — `.claude/skills/intent/SKILL.md` — or re-run with --force to');
  console.log('  publish it with the gaps named. Do not use --force to make a deadline.\n');
}
process.exit(blocked && !force ? 1 : 0);
