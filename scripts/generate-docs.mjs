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
 * `validateIntent` that 📦 Release's gate 6 uses, and **will not emit a page for
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
  parseMetaArgs, classifyStories, readChangelog,
  REGISTRY_STATUS, readRegistryStatus, registryEntryFor, staleFor,
} from './lib/contract.mjs';

const DOCS = 'docs/src/content/docs';
const STYLES_OUT = 'docs/src/styles';
const TOKENS_SRC = 'build/tokens/css/tokens.css';
/*
 * Where each generated page lands.
 *
 * The directory is the URL, and the URL is what somebody pastes into a message
 * six months from now. `core/` is the reference material — the components and
 * the tokens they stand on. `get-started/` is what changed and what a number
 * promises. Both are groups a reader picked out of the sidebar, so the path and
 * the label say the same word.
 */
const COMPONENTS_OUT = join(DOCS, 'core', 'components');
const CORE_OUT = join(DOCS, 'core');
const GET_STARTED_OUT = join(DOCS, 'get-started');
const CONFIG = 'docs/reference.config.json';

const argv = process.argv.slice(2);
const force = argv.includes('--force');
const site = JSON.parse(readFileSync(CONFIG, 'utf8'));

/*
 * Where the embedded stories come from.
 *
 * The config names the deployed Storybook, which is right for a build and wrong
 * for development: the deployed one sends `frame-ancestors 'self'`, so every
 * frame on a page served from :4321 comes up blank and the one thing you were
 * trying to look at is the one thing you cannot see. `--storybook` points them
 * at a local dev server, which sends no CSP.
 */
if (argv.includes('--storybook')) {
  site.storybookUrl = argv[argv.indexOf('--storybook') + 1];
}
const pkg = readPackage();
const tokens = readTokens();
/*
 * Every custom property that any `[data-theme="…"]` block redeclares.
 *
 * The flattened map cannot answer this — it keeps the first declaration and
 * throws the mode blocks away, which is right for resolving a value and useless
 * for asking whether a mode moves it. Read once here rather than per page.
 */
const perModeNames = (() => {
  const set = new Set();
  if (!existsSync(TOKENS_SRC)) return set;
  const css = readFileSync(TOKENS_SRC, 'utf8');
  for (const [, body] of css.matchAll(/\[data-theme="[a-z]+"\][^{]*\{([\s\S]*?)\n\}/g)) {
    for (const [, name] of body.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gm)) set.add(name);
  }
  return set;
})();
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

/* ── Embeds ──────────────────────────────────────────────────────────────── */

/**
 * A Storybook frame, in both themes.
 *
 * Two iframes and a CSS swap rather than one. A story renders in whichever Figma
 * mode Storybook was asked for, and a day-mode component sitting in a dark page
 * reads as a rendering bug rather than as a frame — which is exactly the wrong
 * impression for the page that is meant to prove the component looks right. The
 * hidden one is `loading="lazy"`, so it costs nothing until the reader switches.
 *
 * The frames are cross-origin unless the site and Storybook share a host, and
 * the deployed CSP sets `frame-ancestors 'self'`. The generator warns about that
 * once, at the end, rather than on every embed.
 */
function storyEmbed(storybook, id, { view = 'story', kind = 'story', title } = {}) {
  const src = (mode) =>
    `${storybook}/iframe.html?id=${id}&viewMode=${view}&globals=theme:${mode}`;
  return [
    '<div class="sunim-embed-pair">',
    `<iframe class="sunim-embed sunim-embed--${kind}" data-embed-theme="light" src="${src('day')}" title="${title} — day" loading="lazy"></iframe>`,
    `<iframe class="sunim-embed sunim-embed--${kind}" data-embed-theme="dark" src="${src('night')}" title="${title} — night" loading="lazy"></iframe>`,
    '</div>',
  ].join('\n');
}

/** Turns `WithCustomIcon` into `With custom icon`. */
const humanise = (s) =>
  s.replace(/([a-z0-9])([A-Z])/g, '$1 $2').replace(/^./, (m) => m.toUpperCase()).toLowerCase()
    .replace(/^./, (m) => m.toUpperCase());

/**
 * The usage example, written from the stories' own args.
 *
 * Anything this generator invented for `label` would be filler — text that looks
 * like documentation and says nothing. The stories already carry the copy
 * somebody chose when they built the component, so the example uses that, and
 * every attribute in it is either required or a value a human picked.
 */
function usageExample(c, defaults, metaArgs) {
  const known = new Map((c.props ?? []).map((p) => [p.name, p]));
  const chosen = [];

  for (const p of c.props ?? []) {
    const value = metaArgs[p.name] ?? (p.optional ? undefined : defaults[p.name]);
    if (value === undefined) continue;
    /* A ReactNode arg belongs in a story, not in a two-line example — rendering
     * half of one produces code that does not compile. */
    if (/ReactNode|=>|\(/.test(p.type)) continue;
    chosen.push([p.name, value]);
  }

  const attrs = chosen.map(([k, v]) => {
    if (v === 'true') return k;
    if (v === 'false') return `${k}={false}`;
    if (/^-?\d+(\.\d+)?$/.test(v) && !/string/.test(known.get(k)?.type ?? '')) return `${k}={${v}}`;
    return `${k}="${v}"`;
  });

  const open = `<${c.name}`;
  const line = `${open} ${attrs.join(' ')} />`;
  const jsx = line.length <= 76
    ? `  return ${line};`
    : [`  return (`, `    ${open}`, ...attrs.map((a) => `      ${a}`), `    />`, `  );`].join('\n');

  return [
    `import { ${c.name} } from '${pkg.name}';`,
    '',
    `export function Example() {`,
    jsx,
    `}`,
  ].join('\n');
}

/* ── One component page ──────────────────────────────────────────────────── */

function componentPage(c, index) {
  const { intent } = c;
  const defaults = parseDefaults(c.tsx, c.name);
  const metaArgs = parseMetaArgs(c.stories);
  const { matrix, examples } = classifyStories(c.storyIds, c.unions, c.name);
  const storybook = site.storybookUrl.replace(/\/$/, '');
  const storyLink = (id) => `${storybook}/?path=/story/${id}`;
  const kind = c.storyIds[0]?.id.split('--')[0] ?? '';
  const docsId = `${kind}--docs`;

  const consumers = listComponents()
    .map(readComponent)
    .filter((o) => o.exists && o.composes.includes(c.name))
    .map((o) => o.name);

  const o = [];
  const push = (...lines) => o.push(...lines);

  /* ── Frontmatter ─────────────────────────────────────────────────────── */
  push('---');
  push(`title: ${yaml(c.name)}`);
  push(`description: ${yaml(firstSentence(intent.use_when))}`);
  push('sidebar:');
  push(`  order: ${index + 1}`);
  push('  badge:');
  push(`    text: ${yaml(intent.status)}`);
  push(`    variant: ${STATUS_BADGE[intent.status] ?? 'note'}`);
  push('---');
  push('');
  push("import { Tabs, TabItem, Aside, LinkCard, CardGrid, Code } from '@astrojs/starlight/components';");
  push('');

  /*
   * A header strip rather than a lead sentence. The one-sentence summary is
   * already the frontmatter description, and repeating it here put the same
   * words twice on the screen — once above the tabs and once under "When to use
   * it", four lines apart.
   */
  push('<p class="sunim-pageheader">');
  push(`<span class="sunim-status">${intent.status} · since ${intent.since}</span>`);
  if (kind) push(`<a href="${storybook}/?path=/docs/${docsId}">Storybook</a>`);
  if (c.figma) push(`<a href="${c.figma.url}">Figma node ${c.figma.node}</a>`);
  push(`<a href="${site.repoUrl}/tree/main/${c.paths.dir}">Source</a>`);
  push('</p>');
  push('');
  push('<Tabs>');
  push('');

  /* ── Usage ───────────────────────────────────────────────────────────── */
  push('<TabItem label="Usage">');
  push('');
  push('### When to use it');
  push('');
  push(intent.use_when);
  push('');
  push(`**Where it goes.** ${intent.placement}`);
  push('');
  push('<Aside type="caution" title="When not to use it">');
  push(intent.dont_use_when);
  push('</Aside>');
  push('');
  push('### Accessibility');
  push('');
  push(intent.a11y);
  push('');

  if (c.composes.length || consumers.length) {
    push('### Composition');
    push('');
    if (c.composes.length) {
      push(`**Imports** ${c.composes.map((d) => `[${d}](/core/components/${d.toLowerCase()}/)`).join(', ')} — `
        + 'the component itself, not a copy of it, so a repair there is a repair here.');
      push('');
    }
    if (consumers.length) {
      push(`**Imported by** ${consumers.map((d) => `[${d}](/core/components/${d.toLowerCase()}/)`).join(', ')}. `
        + 'Changing this component means re-testing those.');
      push('');
    }
  }

  push('### What this version promises');
  push('');
  push(`\`${c.name}\` entered the public surface in **${intent.since}** and is **${intent.status}** — `
    + `${STATUS_NOTE[intent.status]}`);
  push('');
  push(`The package is at \`${pkg.version}\`. Below \`1.0.0\` a minor bump is allowed to break anything: `
    + 'that is the semver contract, not a loophole, and it is why the version starts with a zero. '
    + '[What the number promises](/get-started/versioning/) has the detail.');
  push('');
  push('</TabItem>');
  push('');

  /* ── Examples ────────────────────────────────────────────────────────── */
  push('<TabItem label="Examples">');
  push('');
  push('### The common case');
  push('');
  push('```tsx');
  push(usageExample(c, defaults, metaArgs));
  push('```');
  push('');
  push('Every value in that example is either required or one a person chose when they built the '
    + "component's stories. Nothing in it was invented to fill the page.");
  push('');

  if (examples.length) {
    push('### Worth seeing');
    push('');
    push('These are the stories that were written on purpose, rather than to fill a row of the '
      + 'variant matrix — the cases that show something the matrix cannot.');
    push('');
    for (const s of examples) {
      push(`#### ${humanise(s.exportName)}`);
      push('');
      push(storyEmbed(storybook, s.id, { title: `${c.name} — ${s.exportName}` }));
      push('');
      push(`<p class="sunim-embed-note">Rendered live from Storybook · <a href="${storyLink(s.id)}">open it there</a> to change the props or the mode.</p>`);
      push('');
    }
  }
  push('</TabItem>');
  push('');

  /* ── Code ────────────────────────────────────────────────────────────── */
  push('<TabItem label="Code">');
  push('');
  push('### Import');
  push('');
  push('```tsx');
  push(`import { ${c.name}${c.props ? `, type ${c.name}Props` : ''} } from '${pkg.name}';`);
  push('```');
  push('');
  push(`The package is private at \`${pkg.version}\` and is not on npm yet — that is the import once `
    + 'it is published. Until then it is a workspace import, and either way the name comes from '
    + '`src/index.ts`, which is the only thing that decides what is public.');
  push('');

  push('### Props');
  push('');
  if (!c.props?.length) {
    push('_This component declares no props._');
  } else {
    push('| Prop | Type | Default | What it does |');
    push('|---|---|---|---|');
    for (const p of c.props) {
      const def = defaults[p.name] !== undefined
        ? `\`${defaults[p.name]}\``
        : p.optional ? '—' : '**required**';
      push(`| \`${p.name}\` | \`${cell(p.type)}\` | ${def} | ${cell(p.doc ?? '')} |`);
    }
    push('');
    push('Prop names mirror the Figma property names exactly. That is a rule of the system rather than '
      + 'a coincidence — it is what lets a design change and a code change be the same conversation.');
  }
  push('');

  if (c.unions.length) {
    push('### Types');
    push('');
    push('| Type | Values |');
    push('|---|---|');
    for (const u of c.unions) push(`| \`${u.typeName}\` | ${u.members.map((m) => `\`${m}\``).join(' · ')} |`);
    push('');
  }

  push('### Tokens it needs');
  push('');
  push('The semantic tokens this component cannot render without. Change one and this component '
    + 'changes with it.');
  push('');
  push('| Token | Resolves to |');
  push('|---|---|');
  for (const dotted of intent.required_tokens) {
    const v = cssVar(dotted);
    const { resolved, chain } = resolveToken(v, tokens);
    const swatch = isColour(resolved) ? `<span class="sunim-swatch" style="background:${resolved}"></span>` : '';
    const via = chain.length > 1 ? ` <small>via \`${chain[1]}\`</small>` : '';
    push(`| \`${dotted}\` | ${swatch}\`${cell(resolved ?? '—')}\`${via} |`);
  }
  push('');
  push(`<Aside type="note" title="Values shown are the \`${modes[0]}\` mode">`);
  push(`The export defines ${modes.length} modes — ${modes.map((m) => `\`${m}\``).join(', ')} — and `
    + 'redeclares every one of these names in each. A component binds the name and never the value, '
    + 'so it follows whichever mode the page is in — including this one.');
  push('</Aside>');
  push('');

  if (kind) {
    push('### The full API, in Storybook');
    push('');
    push("Storybook's own props table and controls, live. Change a prop here and the component "
      + 'responds — this is the same page an engineer works against.');
    push('');
    push(storyEmbed(storybook, docsId, { view: 'docs', kind: 'props', title: `${c.name} — full API` }));
    push('');
    push(`<p class="sunim-embed-note">If this frame is blank, the deployed Storybook is refusing to be `
      + `embedded — see <a href="/help/embedding/">Embedding</a>. `
      + `<a href="${storybook}/?path=/docs/${docsId}">Open it directly</a>.</p>`);
    push('');
  }
  push('</TabItem>');
  push('');

  /* ── Design ──────────────────────────────────────────────────────────── */
  push('<TabItem label="Design">');
  push('');
  if (c.figma) {
    push('### The Figma node');
    push('');
    push(`Node \`${c.figma.node}\` — what this component was built from, and what QA tests against. `
      + 'Not a screenshot of it: the live node.');
    push('');
    push(`<iframe class="sunim-embed sunim-embed--figma" src="${c.figma.embed}" title="${c.name} in Figma" loading="lazy" allowfullscreen></iframe>`);
    push('');
    push(`<p class="sunim-embed-note">The frame renders only for someone who can see the file. If it `
      + `shows a sign-in, the file is not shared to anyone-with-the-link — `
      + `<a href="${c.figma.url}">open the node in Figma</a>.</p>`);
    push('');
  }

  if (matrix.length) {
    push('### The variant matrix');
    push('');
    const axes = c.unions.map((u) => `${u.typeName.replace(c.name, '') || u.typeName} (${u.members.length})`).join(' × ');
    push(`${axes} = **${matrix.length} variants**, and every one has a story. That is the contract `
      + 'between the design and the code: a variant in the Figma set with no story is a guaranteed QA '
      + 'failure, and a story with no variant behind it is something nobody designed.');
    push('');
    push('<details>');
    push(`<summary>All ${matrix.length} variants</summary>`);
    push('');
    for (const s of matrix) push(`- [${humanise(s.exportName)}](${storyLink(s.id)})`);
    push('');
    push('</details>');
    push('');
  }

  push('### Every mode');
  push('');
  push(`The token export carries ${modes.length} Figma modes. This component names tokens and never `
    + 'values, so it renders in all of them without knowing there is more than one.');
  push('');
  push('<div class="sunim-modes">');
  for (const mode of modes) {
    push(`<div class="sunim-mode" data-sunim-mode="${mode}">`);
    push('<div class="sunim-mode__swatches">'
      + '<span style="background:var(--color-surface-page)"></span>'
      + '<span style="background:var(--color-surface-card)"></span>'
      + '<span style="background:var(--color-accent-ink)"></span>'
      + '<span style="background:var(--color-text-heading)"></span>'
      + '</div>');
    push(`<div class="sunim-mode__name">${mode}</div>`);
    push('</div>');
  }
  push('</div>');
  push('');

  if (c.unbound.length) {
    push('### Values Figma never bound');
    push('');
    push('Each of these is a value the design carries as a plain number, with no variable behind it. '
      + 'They are transcribed exactly and quarantined in one block rather than mapped onto a token '
      + 'that happens to share the number — doing that would disguise an open design gap as a '
      + 'binding, and hide it from whoever looks next. Each becomes a token the moment design binds '
      + 'it.');
    push('');
    push('| Property | Value |');
    push('|---|---|');
    for (const u of c.unbound) push(`| \`${u.name}\` | \`${cell(u.value)}\` |`);
    push('');
  } else {
    push('### Values Figma never bound');
    push('');
    push('None. Every visual value on this component came from a variable binding — which is worth '
      + 'stating rather than leaving as an absence.');
    push('');
  }
  push('</TabItem>');
  push('');

  /* ── Changelog ───────────────────────────────────────────────────────── */
  push('<TabItem label="Changelog">');
  push('');
  const log = readChangelog(c.paths.dir);
  if (!log.length) {
    push('_No history — this is either a new component or a checkout without git._');
  } else {
    push(`Every commit that touched \`${c.paths.dir}\`, newest first.`);
    push('');
    push('| Date | Change | Commit |');
    push('|---|---|---|');
    for (const e of log) {
      push(`| ${e.date} | ${cell(e.subject)} | [\`${e.sha}\`](${site.repoUrl}/commit/${e.sha}) |`);
    }
    push('');
    push('<Aside type="note" title="Derived, not maintained">');
    push('This is read from git rather than written by hand, because a hand-written changelog is a '
      + 'second record of what happened and the second record is the one that goes stale. The cost is '
      + 'that a commit message **is** the entry — which is arguably the point.');
    push('');
    push(`There are no version numbers here yet. Nothing has been tagged, and the package is still at `
      + `\`${pkg.version}\` — see [Versioning](/get-started/versioning/).`);
    push('</Aside>');
  }
  push('');
  push('</TabItem>');
  push('');
  push('</Tabs>');
  push('');
  push('---');
  push('');
  push('<small>Generated from `' + c.paths.intent + '`, `' + c.paths.tsx + '`, the stories and the '
    + 'token build. Editing this page by hand lasts until the next build — change the source instead.</small>');
  push('');

  return o.join('\n');
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
    out.push(`| [${c.name}](/core/components/${c.name.toLowerCase()}/) | ${cell(c.intent.use_when)} | \`${c.intent.status}\` |`);
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
  out.push('title: Tokens');
  out.push('description: Every semantic token a released component depends on, and which components break if it moves.');
  out.push('sidebar:');
  out.push('  order: 2');
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
  /*
   * Which of these tokens a mode actually moves.
   *
   * This used to claim every one of them was redeclared in every mode. It is
   * not true and never was: the export redeclares colour per mode and declares
   * everything else once. Somebody reading the old sentence would expect the
   * focus ring to darken at night, and it does not — so the count is measured
   * here rather than asserted.
   */
  const perMode = [...used.keys()].filter((dotted) => perModeNames.has(cssVar(dotted))).length;

  out.push(`Values shown are the \`${modes[0]}\` mode. The export defines ${modes.length} — `
    + `${modes.map((m) => `\`${m}\``).join(', ')}.`);
  out.push('');
  out.push(`**${perMode} of these ${used.size} tokens are redeclared per mode; the other `
    + `${used.size - perMode} are declared once and are the same in all ${modes.length}.** A mode `
    + 'moves colour and nothing else — spacing, radius, type and the effects keep their values, so '
    + 'the focus ring is the same blue at night as at noon. That is worth knowing before you design '
    + 'a dark screen against it. See [Theming](/styling/theming/).');
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
    '  order: 4',
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

/* ── The changelog page ─────────────────────────────────────────────────── */

/**
 * Reads the release history out of `CHANGELOG.md`.
 *
 * Same arrangement as the versioning page: the repository file is the source and
 * this is a copy that cannot fall behind it, because it is rewritten on every
 * build. A changelog maintained separately for the website is a changelog that
 * disagrees with the one inside the published tarball — and the tarball's copy
 * is the one a consumer actually has.
 */
function changelogPage() {
  const md = readFileSync('CHANGELOG.md', 'utf8').replace(/^#\s+.*\n/, '');

  return [
    '---',
    'title: Changelog',
    'description: Every released version, and what it means for somebody who has the previous one installed.',
    'sidebar:',
    '  order: 1',
    '---',
    '',
    md.trim(),
    '',
    '---',
    '',
    '<small>Generated from `CHANGELOG.md` in the repository — the same file that ships inside the '
    + 'published package. That one is the source; this is a copy that cannot fall behind it.</small>',
    '',
  ].join('\n');
}

/**
 * The most recent released version, read out of the changelog's first `##`.
 *
 * Returns `null` rather than guessing when the file has no release heading yet.
 * A home page that invents a release is worse than one that admits there has not
 * been a release, and a system with an empty changelog is a real state — every
 * one of these has been in it.
 */
function latestRelease() {
  if (!existsSync('CHANGELOG.md')) return null;
  const md = readFileSync('CHANGELOG.md', 'utf8');
  const heading = md.match(/^##\s+(\d[^\s—-]*)\s*[—-]\s*(\S+)\s*$/m);
  if (!heading) return null;
  const [, version, date] = heading;
  /* The lead line is the bolded sentence directly under the heading — the one
   * that says what this version is, before the Added/Changed lists. */
  const after = md.slice(md.indexOf(heading[0]) + heading[0].length);
  const lead = after.match(/\*\*(.+?)\*\*/s);
  return { version, date, lead: lead ? lead[1].replace(/\s+/g, ' ').trim() : null };
}

/* ── The home page ───────────────────────────────────────────────────────── */

/**
 * Generated, like every other page here, and for the same reason.
 *
 * The home page carries the current version, the current release date and the
 * count of what has shipped. Every one of those is a fact that moves, and a
 * hand-written home page is the first page to go stale and the last one anybody
 * notices — it is the page a reader trusts most and re-reads least.
 */
function homePage(components) {
  const rel = latestRelease();
  const tokenCount = new Set(components.flatMap((c) => c.intent.required_tokens)).size;

  const out = [];
  out.push('---');
  out.push(`title: ${yaml(site.title)}`);
  out.push(`description: ${yaml(site.description)}`);
  out.push('template: splash');
  /* The page title and the site title are the same string here, and Starlight
   * joins them — "Sunim Design System | Sunim Design System" in the tab, in a
   * bookmark and in a search result. Override the one tag rather than renaming
   * the page, because the title is also the hero heading. */
  out.push('head:');
  out.push('  - tag: title');
  out.push(`    content: ${yaml(site.title)}`);
  out.push('hero:');
  out.push('  tagline: |');
  out.push('    Props tell you how to call a component. Nothing in them tells you when you should —');
  out.push('    or when to reach for a different one. That is the question this site answers.');
  out.push('  actions:');
  out.push('    - text: Start designing');
  out.push('      link: /designing/introduction/');
  out.push('      icon: right-arrow');
  out.push('    - text: Start coding');
  out.push('      link: /developing/introduction/');
  out.push('      icon: right-arrow');
  out.push('      variant: secondary');
  out.push('    - text: Open Storybook');
  out.push(`      link: ${site.storybookUrl}`);
  out.push('      icon: external');
  out.push('      variant: minimal');
  out.push('---');
  out.push('');
  out.push("import { Card, CardGrid, LinkCard } from '@astrojs/starlight/components';");
  out.push('');

  /* ── Latest release ─────────────────────────────────────────────────── */
  if (rel) {
    out.push(`## Latest release — \`${rel.version}\``);
    out.push('');
    out.push(`<p class="sunim-release-date">Published ${rel.date}. `
      + `${components.length} component${components.length === 1 ? '' : 's'} on the public surface, `
      + `carried by ${tokenCount} semantic tokens across ${modes.length} Figma modes.</p>`);
    out.push('');
    if (rel.lead) out.push(`${rel.lead}`);
    out.push('');
    out.push('```bash');
    out.push(`npm install ${pkg.name}`);
    out.push('```');
    out.push('');
    out.push('<LinkCard title="Read the release notes" '
      + `description="Everything ${rel.version} added, and every limitation it states rather than hides." `
      + 'href="/get-started/changelog/" />');
    out.push('');
  } else {
    out.push('## Nothing released yet');
    out.push('');
    out.push('`CHANGELOG.md` carries no released version, so there is nothing here to install. '
      + 'This page will say otherwise the moment there is.');
    out.push('');
  }

  /* ── The four doors ─────────────────────────────────────────────────── */
  out.push('## Where to go');
  out.push('');
  out.push('<CardGrid>');
  out.push('  <LinkCard title="Start designing" href="/designing/introduction/" '
    + 'description="Get the library and the variables into your Figma file, and know which modes you '
    + 'are designing against." />');
  out.push('  <LinkCard title="Start coding" href="/developing/introduction/" '
    + `description="Install ${pkg.name}, load one stylesheet in the right order, and render the first `
    + 'component." />');
  out.push('  <LinkCard title="Components" href="/core/components/overview/" '
    + `description="All ${components.length} of them — what each is for, what it is not for, and what it `
    + 'refuses to promise." />');
  out.push('  <LinkCard title="Tokens" href="/core/tokens/" '
    + `description="The ${tokenCount} semantic tokens the components stand on, and what breaks if one `
    + 'moves." />');
  out.push('</CardGrid>');
  out.push('');

  /* ── What this site is, in four lines ───────────────────────────────── */
  out.push('## What this site is');
  out.push('');
  out.push('<CardGrid stagger>');
  out.push('  <Card title="Explained here, rendered there" icon="open-book">');
  out.push('    Storybook is where the variants render, live, in every state. This is where they are');
  out.push('    *explained*. Each page embeds and deep-links into the matching stories rather than');
  out.push('    re-rendering anything, so there is no second rendering to keep in step.');
  out.push('  </Card>');
  out.push('  <Card title="Written once, checked once" icon="approve-check">');
  out.push("    The intent that becomes a page's *When to use* section is the same file the release gate");
  out.push('    reads. A page cannot be published for a component whose intent would fail that gate —');
  out.push('    the generator refuses.');
  out.push('  </Card>');
  out.push('  <Card title="The reference is generated" icon="setting">');
  out.push('    Components, tokens, the changelog, the versioning page and this one come out of');
  out.push('    `scripts/generate-docs.mjs` — from the props, the intent, the token build and the');
  out.push('    stories. The guides are written by hand; the reference cannot be, or it drifts.');
  out.push('  </Card>');
  out.push('  <Card title="It says what it does not promise" icon="warning">');
  out.push('    Accessibility limits, values Figma never bound, and what a `0.x` version explicitly does');
  out.push('    not guarantee. Every page carries them rather than leaving them to be discovered.');
  out.push('  </Card>');
  out.push('</CardGrid>');
  out.push('');
  return out.join('\n');
}

/* ── The token stylesheet ────────────────────────────────────────────────── */

/**
 * Re-scopes the design system's own tokens onto the site's theme attribute.
 *
 * The site is styled with the system it documents — which is the only honest way
 * for a design system's reference site to look, and the fastest way to notice a
 * palette that does not work.
 *
 * It cannot simply import `build/tokens/css/tokens.css`, because that file and
 * Starlight both key off `data-theme` and mean different things by it. Ours
 * carries seven Figma modes (`day`, `night`, `sunrise`…); Starlight carries
 * `light` and `dark`. One attribute, two vocabularies.
 *
 * So this rewrites rather than copies: the `day` block becomes `light`, the
 * `night` block becomes `dark`, and the remaining five stay reachable under
 * `[data-sunim-mode]` so a page can show them side by side.
 *
 * **Values are never touched.** Every declaration is passed through verbatim; only
 * selectors change. Copying a value here would put a second source of truth one
 * palette change away from being wrong, which is the thing `build/tokens/` exists
 * to prevent.
 */
function tokenStylesheet() {
  const css = readFileSync(TOKENS_SRC, 'utf8');

  /** The body of one top-level block, by its selector. */
  const blockBody = (selector) => {
    const i = css.indexOf(`${selector} {`);
    if (i === -1) return null;
    const start = css.indexOf('{', i) + 1;
    const end = css.indexOf('\n}', start);
    return css.slice(start, end);
  };

  const root = blockBody(':root');
  const out = [
    '/*',
    ' * GENERATED by scripts/generate-docs.mjs from build/tokens/css/tokens.css.',
    ' * Never edit this file. It is rewritten on every `npm run docs:generate`,',
    ' * and the change you made here will be gone while the value you meant to',
    ' * change is still wrong. Fix it in Figma, re-export, rebuild.',
    ' *',
    ' * Selectors are rewritten; values are not. `day` becomes Starlight\'s',
    ' * `light`, `night` becomes `dark`, and the other five Figma modes stay',
    ' * reachable under [data-sunim-mode] for pages that show them side by side.',
    ' */',
    '',
    `:root {${root}\n}`,
    '',
  ];

  const map = { light: 'day', dark: 'night' };
  for (const [slTheme, mode] of Object.entries(map)) {
    const body = blockBody(`[data-theme="${mode}"]`);
    if (!body) {
      bad(`the token build has no "${mode}" mode — the site cannot render its ${slTheme} theme from tokens`);
      continue;
    }
    out.push(`/* Figma mode "${mode}" → Starlight's ${slTheme} theme */`);
    out.push(`:root[data-theme='${slTheme}'] {${body}\n}`);
    out.push('');
  }

  for (const mode of modes) {
    const body = blockBody(`[data-theme="${mode}"]`);
    if (!body) continue;
    out.push(`[data-sunim-mode='${mode}'] {${body}\n}`);
    out.push('');
  }

  return out.join('\n');
}

/* ── Run ─────────────────────────────────────────────────────────────────── */

console.log('\n\x1b[1mGenerating the reference site\x1b[0m');

mkdirSync(COMPONENTS_OUT, { recursive: true });
mkdirSync(CORE_OUT, { recursive: true });
mkdirSync(GET_STARTED_OUT, { recursive: true });

/* Clear the generated directory first. A component removed from the surface must
 * lose its page — leaving stale files behind is how a site keeps documenting
 * something that no longer exists. */
for (const f of readdirSync(COMPONENTS_OUT)) {
  if (f.endsWith('.md') || f.endsWith('.mdx')) unlinkSync(join(COMPONENTS_OUT, f));
}

/*
 * The registry decides what may be documented.
 *
 * A page for a component that has not shipped is worse than no page: it reads
 * exactly like a page for one that has, and the reader has no way to tell. The
 * registry is the only place a component's real status lives, so it is the
 * registry that gates this — not the presence of a file, not a green build.
 */
const registry = readRegistryStatus();
if (!registry) {
  console.log(`\n  \x1b[31m✗\x1b[0m ${REGISTRY_STATUS} is missing or unreadable.`);
  console.log('      Nothing can be published: there is no record of which components have shipped.');
  console.log('      Run the doc-generator agent — it has the Airtable connection and writes this file.');
  console.log('      A build script deliberately does not, so that a build never needs a credential.\n');
  process.exit(1);
}
note(`registry read ${registry.readAt} by ${registry.readBy ?? 'unknown'}`);

const published = [];
/*
 * Two kinds of block, because only one of them is overridable.
 *
 * An intent that fails gate 6 can be published with its gaps named — sometimes
 * you have to see the page to understand the gap. Whether a component has
 * *shipped* is not that kind of question, and `--force` must never be able to
 * answer it: a page for something that has not shipped is exactly what this gate
 * exists to prevent, and an override would make the gate advisory.
 */
let blockedByIntent = 0;
let blockedByRegistry = 0;
let skipped = 0;

for (const name of listComponents()) {
  const c = readComponent(name);

  if (!c.onSurface) {
    note(`${name} — not exported from src/index.ts, so it is not part of the release. No page.`);
    skipped++;
    continue;
  }

  /* ── The registry gate ─────────────────────────────────────────────────── */
  const entry = registryEntryFor(name, registry);

  if (!entry) {
    bad(`${name} — no row in ${REGISTRY_STATUS}. A component the registry has never heard of `
      + 'has not shipped, whatever is in the folder. No page.');
    blockedByRegistry++;
    continue;
  }

  if (entry.key !== name) {
    note(`${name} — the registry calls this row "${entry.key}". Matched on the name with spacing `
      + 'ignored, but two systems disagreeing about a name is a gate-4 finding for 📦 Release.');
  }

  if (entry.development !== 'Completed') {
    bad(`${name} — the registry reads "${entry.development || 'blank'}", not "Completed". No page.`);
    console.log('      A page for a component that has not shipped reads exactly like a page for one');
    console.log('      that has, and a reader cannot tell them apart. This is the whole gate.');
    console.log('      `--force` does not reach this: it is for an incomplete intent, never for an');
    console.log('      incomplete component.');
    blockedByRegistry++;
    continue;
  }

  const stale = staleFor(c, registry);
  if (stale) {
    bad(`${name} — the registry was read ${registry.readAt}, but ${c.paths.dir} changed after that:`);
    console.log(`      ${stale.date}  ${stale.sha}  ${stale.subject}`);
    console.log('      The recorded status predates the change, so it cannot vouch for what is there');
    console.log('      now. Re-read the registry — the doc-generator agent does it in one step.');
    blockedByRegistry++;
    continue;
  }

  const findings = validateIntent(c, tokens).filter((f) => f.severity !== 'warn');
  if (findings.length && !force) {
    bad(`${name} — intent fails gate 6, so no page is published:`);
    for (const f of findings) console.log(`      ${f.message}`);
    blockedByIntent++;
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
  writeFileSync(join(CORE_OUT, 'tokens.md'), tokensPage(published));
  writeFileSync(join(DOCS, 'index.mdx'), homePage(published));
  ok('overview + tokens + home pages');
}

if (existsSync(TOKENS_SRC)) {
  mkdirSync(STYLES_OUT, { recursive: true });
  writeFileSync(join(STYLES_OUT, 'tokens.generated.css'), tokenStylesheet());
  ok(`token stylesheet — ${modes.length} Figma modes re-scoped for the site`);
} else {
  bad(`${TOKENS_SRC} is missing — run \`npm run build:tokens\`. The site cannot be styled from tokens it does not have`);
  blockedByRegistry++;
}

if (existsSync('CHANGELOG.md')) {
  writeFileSync(join(GET_STARTED_OUT, 'changelog.md'), changelogPage());
  const rel = latestRelease();
  ok(rel ? `changelog page — latest is ${rel.version}, ${rel.date}` : 'changelog page — no release in it yet');
} else {
  bad('CHANGELOG.md is missing — the site cannot say what changed, and the home page cannot say '
    + 'what the current release is');
  blockedByRegistry++;
}

if (existsSync('VERSIONING.md')) {
  writeFileSync(join(GET_STARTED_OUT, 'versioning.md'), versioningPage());
  ok('versioning page, from VERSIONING.md');
} else {
  bad('VERSIONING.md is missing — the site cannot say what its version numbers promise');
  blockedByRegistry++;
}

/*
 * The embeds are the one thing a build cannot verify. A cross-origin frame is
 * refused by the browser at view time, not at build time, so this is the only
 * place the mismatch can be pointed out before somebody finds four blank frames
 * on a live page.
 */
try {
  const siteOrigin = new URL(site.siteUrl).origin;
  const sbOrigin = new URL(site.storybookUrl).origin;
  if (siteOrigin !== sbOrigin) {
    note(`the site (${siteOrigin}) and Storybook (${sbOrigin}) are different origins.`);
    note('  Storybook sends `frame-ancestors \'self\'`, so the embedded stories will be blank in');
    note('  production until that header names the site\'s origin. See docs help/embedding.');
    note('  Local development is unaffected — the dev server sends no CSP.');
  }
} catch {
  note('siteUrl or storybookUrl in docs/reference.config.json is not a URL — embeds will not resolve');
}

const blocked = blockedByIntent + blockedByRegistry;
/*
 * `--force` can forgive an incomplete intent. It can never forgive a component
 * that has not shipped — so a registry block fails the run whatever flags were
 * passed, and PARTIAL exists for the one case that is a deliberate choice.
 */
const failing = blockedByRegistry > 0 || (blockedByIntent > 0 && !force);

console.log(
  `\n${failing ? '\x1b[31mBLOCKED\x1b[0m' : blocked ? '\x1b[33mPARTIAL\x1b[0m' : '\x1b[32mDONE\x1b[0m'}  `
  + `${published.length} published · ${skipped} not on the surface · `
  + `${blockedByRegistry} not shipped · ${blockedByIntent} intent incomplete\n`,
);
if (failing) {
  console.log('  Nothing is published for a component the registry does not read as `Completed`, or');
  console.log('  whose intent would fail the release gate. Ship it, fix the intent');
  console.log('  (`.claude/skills/intent/SKILL.md`), or re-read the registry — whichever the failure');
  console.log('  above names. `--force` publishes with the gaps named and is not a release.\n');
}
process.exit(failing ? 1 : 0);
