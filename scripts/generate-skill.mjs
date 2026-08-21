#!/usr/bin/env node
/**
 * Generates the knowledge skill that ships inside the published package.
 *
 * A consumer installs the package and points their coding agent at `skill/`.
 * From then on the agent knows which component answers a given piece of
 * interface, which one does not and what to reach for instead, the exact
 * capitalisation of every prop value, and the four or five rules that are the
 * difference between using this system and quietly reimplementing it.
 *
 * It is generated from the same intent contract the release gate reads — the
 * fourth reader of one file, not a fifth copy of the same prose. The reasoning
 * is the same as the reference site's, one step sharper: a documentation page
 * that describes a component wrongly is read by a person who can notice. A skill
 * that describes one wrongly is read by an agent that will write the import.
 *
 * So the same two refusals apply, and the registry one is not overridable:
 *
 *   - an intent that fails gate 6 is not described to an agent
 *   - a component the registry does not read as `Completed` is not described to
 *     an agent, whatever flags were passed
 *
 * Usage:
 *   node scripts/generate-skill.mjs            # all published components
 *   node scripts/generate-skill.mjs --force    # emit anyway, marking each gap
 *
 * Exit 0 = skill written. Exit 1 = at least one component failed its gate.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* Run from the repo root whatever directory npm invoked us from — every path in
 * the contract is relative to it. */
process.chdir(join(dirname(fileURLToPath(import.meta.url)), '..'));

import {
  listComponents, readComponent, readTokens, readModes, readPackage,
  validateIntent, resolveToken, isColour, parseDefaults, cssVar,
  REGISTRY_STATUS, readRegistryStatus, registryEntryFor, staleFor,
} from './lib/contract.mjs';

/*
 * The skill is generated to the package root rather than into `dist/`, and the
 * reason is the path a consumer has to type:
 *
 *   node_modules/@scope/name/skill        rather than
 *   node_modules/@scope/name/dist/skill
 *
 * One of those gets copied into `.claude/skills/` without anybody looking it up
 * twice. `dist/` is the build; this is a document that ships beside it.
 */
const OUT = 'skill';
const COMPONENTS_OUT = join(OUT, 'components');
const REFERENCE_OUT = join(OUT, 'reference');

const force = process.argv.slice(2).includes('--force');
const pkg = readPackage();
const tokens = readTokens();
const modes = readModes();

const ok = (m) => console.log(`  \x1b[32m✓\x1b[0m ${m}`);
const bad = (m) => console.log(`  \x1b[31m✗\x1b[0m ${m}`);
const note = (m) => console.log(`  \x1b[33m·\x1b[0m ${m}`);

/* ── Helpers ─────────────────────────────────────────────────────────────── */

/** One-line safe for a markdown table cell. */
const cell = (s) => String(s ?? '').replace(/\s*\n\s*/g, ' ').replace(/\|/g, '\\|').trim();

/** The first sentence, for the places one line has to carry the whole idea. */
const firstSentence = (s) => {
  const t = cell(s);
  const m = /^(.+?[.!?])(\s|$)/.exec(t);
  return m ? m[1] : t;
};

/** `'Primary' | 'Secondary'` from a parsed union, in the source's own casing. */
const unionValues = (u) => u.members.map((m) => `\`'${m}'\``).join(' · ');

/**
 * The union backing a prop, if the prop's type names one.
 *
 * Matching on the type text rather than on a naming convention: a prop typed
 * `ButtonVariant` finds the `ButtonVariant` union, and a prop typed
 * `ReactNode` finds nothing, which is the correct answer.
 */
const unionFor = (prop, unions) => unions.find((u) => u.typeName === prop.type.trim());

/**
 * A literal to stand in for a prop in a worked example.
 *
 * Derived from the prop's own type rather than chosen, so an example cannot
 * drift from the interface it illustrates. A prop whose type this cannot fill
 * honestly — `ReactNode`, a function, anything structural — returns null and is
 * left out of the example entirely, which is more useful than a plausible
 * placeholder an agent would copy verbatim.
 */
function exampleValue(prop, unions, defaults = {}) {
  const u = unionFor(prop, unions);
  /*
   * The component's own default, not the union's first member.
   *
   * Those are not the same value and the difference has already been ruled on
   * here once: `EyebrowTone` lists `Agentic` first and the component defaults to
   * `Sky`, deliberately, because an eyebrow with no tone set should be the
   * ordinary one rather than the AI-moment one. An example naming the first
   * member would have quietly contradicted that ruling in the one place an agent
   * copies from.
   */
  if (u) return `"${defaults[prop.name] ?? u.members[0]}"`;
  const t = prop.type.trim();
  if (t === 'string') return '"…"';
  if (t === 'boolean') return null;              /* rendered as a bare attribute */
  if (t === 'number') return '{0}';
  return null;
}

/**
 * Two calls: the smallest one that renders, and one with every axis named.
 *
 * Both are assembled from the parsed props, so neither can describe a prop the
 * component does not have or miss one it does.
 */
function examples(c, defaults = {}) {
  const props = c.props ?? [];
  const attr = (prop) => {
    if (prop.type.trim() === 'boolean') return prop.name;
    const v = exampleValue(prop, c.unions, defaults);
    return v === null ? null : `${prop.name}=${v}`;
  };

  const required = props.filter((x) => !x.optional).map(attr).filter(Boolean);
  const axes = props.filter((x) => unionFor(x, c.unions)).map(attr).filter(Boolean);
  const minimal = `<${c.name}${required.length ? ' ' + required.join(' ') : ''} />`;
  const full = `<${c.name}${[...required, ...axes].length ? ' ' + [...required, ...axes].join(' ') : ''} />`;
  return { minimal, full, same: minimal === full };
}

/* ── One component's page ────────────────────────────────────────────────── */

function componentPage(c) {
  const i = c.intent;
  const defaults = parseDefaults(c.tsx, c.name);
  const out = [];
  const p = (...l) => out.push(...l);

  p(`# ${c.name}`);
  p('');
  p(`\`${i.status}\` · on the public surface since \`${i.since}\``);
  p('');

  p('## Use it when');
  p('');
  p(i.use_when);
  p('');

  p('## Do not use it when');
  p('');
  p(i.dont_use_when);
  p('');

  if (i.placement) {
    p('## Where it goes');
    p('');
    p(i.placement);
    p('');
  }

  /* ── Props ───────────────────────────────────────────────────────────── */
  p('## Props');
  p('');
  if (c.props?.length) {
    p('| Prop | Type | Default | Required |');
    p('|---|---|---|---|');
    for (const prop of c.props) {
      const u = unionFor(prop, c.unions);
      const type = u ? u.members.map((m) => `\`'${m}'\``).join(' \\| ') : `\`${cell(prop.type)}\``;
      const def = defaults[prop.name] !== undefined ? `\`${defaults[prop.name]}\`` : '—';
      p(`| \`${prop.name}\` | ${type} | ${def} | ${prop.optional ? 'no' : '**yes**'} |`);
    }
    p('');
    for (const prop of c.props) {
      if (!prop.doc) continue;
      p(`### \`${prop.name}\``);
      p('');
      p(prop.doc);
      p('');
    }
  } else {
    p('This component takes no props of its own.');
    p('');
  }

  /* ── Worked calls ────────────────────────────────────────────────────── */
  const ex = examples(c, defaults);
  p('## Calling it');
  p('');
  p('```tsx');
  p(`import { ${c.name} } from '${pkg.name}';`);
  p('');
  p('// the smallest call that renders');
  p(ex.minimal);
  if (!ex.same) {
    p('');
    p('// every variant axis named');
    p(ex.full);
  }
  p('```');
  p('');
  p('Values are case-sensitive and are capitalised as the design file names them. '
    + 'A lowercase value is a type error in TypeScript and an unstyled box in '
    + 'JavaScript.');
  p('');

  /* Everything else the props interface extends. Worth stating, because it is
   * how a caller reaches attributes that are not in the table above — and, on
   * more than one component here, how a caller reaches attributes the component
   * does not support the consequences of. */
  const ext = /export interface \w+Props\s+extends\s+([^{]+)\{/.exec(c.tsx ?? '');
  if (ext) {
    p(`It also accepts everything in \`${cell(ext[1].trim())}\`, spread onto the root element.`);
    p('');
  }

  /* ── Accessibility ───────────────────────────────────────────────────── */
  p('## Accessibility');
  p('');
  p(i.a11y);
  p('');

  /* ── Composition ─────────────────────────────────────────────────────── */
  if (c.composes?.length) {
    p(`**Renders** ${c.composes.join(', ')} internally. Do not draw a second copy of `
      + 'that vector — a change to it should reach here without an edit.');
    p('');
  }

  /* ── Unbound values ──────────────────────────────────────────────────── */
  if (c.unbound?.length) {
    p('## Values Figma never bound');
    p('');
    p('These are custom properties this component declares because the design file '
      + 'has no token for them. They are **open design gaps, not extension points** — '
      + 'setting one means choosing a number nobody designed.');
    p('');
    for (const u of c.unbound) p(`- \`${u.name ?? u}\``);
    p('');
  }

  /* ── Tokens ──────────────────────────────────────────────────────────── */
  p('## Tokens it cannot render without');
  p('');
  p('If one of these moves, this component changes. It references the semantic '
    + 'name and never a value.');
  p('');
  for (const t of i.required_tokens) p(`- \`${t}\``);
  p('');

  return out.join('\n');
}

/* ── reference/setup.md ──────────────────────────────────────────────────── */

function setupPage(components) {
  const names = components.map((c) => c.name);
  return `# Setup

Everything an agent has to get right before the first component renders.

## Install

\`\`\`bash
npm install ${pkg.name}
\`\`\`

React is a **peer dependency** at \`${pkg.peerDependencies?.react ?? '>=18.0.0'}\` and is never bundled.

## The stylesheet, and the order inside it

\`\`\`js
import '${pkg.name}/styles.css';
\`\`\`

Once, in the entry module, **before the application's own CSS**. That one file
carries three things in this sequence: the typefaces, the token layer, then the
component rules.

The order is not cosmetic and getting it wrong fails silently. Components resolve
nothing but \`var(--token)\` and hold no values of their own, so component rules
that land before the token layer resolve to nothing — colourless, un-sized boxes
and **no error at all**. If you are debugging a component that renders as an
unstyled box, check this first and check it before anything else.

\`${pkg.name}/tokens.css\` ships the token layer and the typefaces alone, for
styling markup that is not one of these components.

## Fonts

Already inside the package, as \`.woff2\`, at every weight the tokens name. Do not
add a Google Fonts link, a CDN link, or an \`@fontsource\` install. A stylesheet
link to another origin fails a \`font-src 'self'\` policy **silently**: every label
falls back to the browser default and every width measured afterwards is wrong for
a reason that has nothing to do with the component.

## Modes

\`\`\`html
<html data-theme="day">
\`\`\`

${modes.length} modes: ${modes.map((m) => `\`${m}\``).join(', ')}. Set on any ancestor;
the nearest one wins, so a panel can sit in a different mode from the page. Set
none and the tokens fall back to their root declarations.

**A mode moves colour and nothing else.** Spacing, radius, type and the effects are
declared once and are identical in all ${modes.length} — so the focus ring is the
same blue at night as at noon. Do not design a dark screen assuming otherwise.

Nothing reads \`prefers-color-scheme\`. Mapping the operating system preference
onto a mode is the application's decision:

\`\`\`js
document.documentElement.dataset.theme =
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'night' : 'day';
\`\`\`

Decide it on the server if the framework allows. Deciding it after hydration means
the first paint is in the wrong mode and the swap is visible.

## Imports

\`\`\`ts
import { ${names.join(', ')} } from '${pkg.name}';
\`\`\`

That, plus the exported types, is the **entire** public surface. Anything reachable
by deep-importing a path inside the package is scaffolding and can move in a patch
release without that counting as a break. Never deep-import.

Types ship with the package. There is no \`@types/\` to install.

**It is ESM only.** \`require()\` throws \`ERR_PACKAGE_PATH_NOT_EXPORTED\`.

## Server rendering

All ${components.length} components render to static markup with no DOM present.
No component touches \`window\`, \`document\`, \`localStorage\` or \`matchMedia\`.

The package ships **no \`"use client"\` directive**, and \`Button\` calls \`useId\`.
In a React Server Component boundary that is a client-only hook, so re-export the
components through a module that carries the directive and import from there:

\`\`\`ts
'use client';
export { ${names.join(', ')} } from '${pkg.name}';
\`\`\`
`;
}

/* ── reference/tokens.md ─────────────────────────────────────────────────── */

function tokensPage(components) {
  const used = new Map();
  for (const c of components) {
    for (const t of c.intent.required_tokens) {
      if (!used.has(t)) used.set(t, []);
      used.get(t).push(c.name);
    }
  }

  const out = [];
  const p = (...l) => out.push(...l);

  p('# Tokens');
  p('');
  p('Use these when styling markup that sits **beside** a Sunim component — a card '
    + 'around a Button, a table cell holding a Chip — so the surrounding UI moves with '
    + 'the palette instead of drifting away from it.');
  p('');
  p('```css');
  p('/* the shape of every one of them */');
  p('color: var(--color-accent-ink);');
  p('padding: var(--spacing-space-4);');
  p('```');
  p('');
  p('**Never write a hex, an rgb, a px or a font stack next to one of these '
    + 'components.** A raw value stops following the palette the moment it moves, and '
    + 'nothing tells you.');
  p('');
  p('**Never invent a token name.** A name that is not in this list resolves to '
    + 'nothing and renders nothing, with no error. If the value you need has no token, '
    + 'that is a design gap to report — not a name to guess.');
  p('');
  p(`These ${used.size} are the load-bearing ones: the tokens a released component has `
    + 'declared it cannot render without.');
  p('');
  p('| Token | CSS custom property | Value | Used by |');
  p('|---|---|---|---|');
  for (const [dotted, users] of [...used.entries()].sort()) {
    const name = cssVar(dotted);
    const { resolved } = resolveToken(name, tokens);
    p(`| \`${dotted}\` | \`var(${name})\` | \`${cell(resolved ?? '—')}\` | ${users.join(', ')} |`);
  }
  p('');
  p(`Values shown are the \`${modes[0]}\` mode. The colour ones are redeclared in each `
    + `of the ${modes.length}; the rest are declared once.`);
  p('');
  p('The full export carries considerably more than this — every primitive, and '
    + 'semantic names no component happens to need yet. These are the ones with a '
    + 'component standing on them.');
  p('');
  return out.join('\n');
}

/*
 * Components an agent reaches for by reflex and this package does not have.
 *
 * Naming them is worth more than the general rule, because a general rule does
 * not stop an agent writing `<Card>` — it has written that import in a hundred
 * other codebases and nothing here has contradicted it yet.
 *
 * The list is asserted against the published set below, so the day one of these
 * ships, the build fails here rather than the skill going on telling agents it
 * does not exist.
 */
const NAMED_ABSENT = [
  'Card', 'Input', 'Modal', 'Table', 'Select', 'Tooltip', 'Alert', 'Badge',
  'Avatar', 'Tabs',
];

/* ── SKILL.md ────────────────────────────────────────────────────────────── */

function skillFile(components) {
  const names = components.map((c) => c.name);
  const out = [];
  const p = (...l) => out.push(...l);

  /* Frontmatter. `description` is the only thing an agent reads before deciding
   * whether to load the rest, so it names the package, the job, and the trigger
   * rather than describing the design system in the abstract. */
  p('---');
  p('name: sunim-design-system');
  p(`description: Build React UI with the Sunim Design System (${pkg.name}) — which `
    + 'component answers a given piece of interface, which one does not and what to '
    + 'reach for instead, the exact prop values, and the install, theming and token '
    + 'rules. Use whenever writing, reviewing or refactoring UI in a project that has '
    + 'this package installed.');
  p('---');
  p('');
  p(`# ${pkg.name.split('/').pop().replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())}`);
  p('');
  p(`Version \`${pkg.version}\` · ${components.length} components on the public surface.`);
  p('');

  /* ── The three facts ─────────────────────────────────────────────────── */
  p('## Read this before writing any JSX');
  p('');
  p(`**1 · The public surface is exactly these ${components.length} components.**`);
  p('');
  p(`\`${names.join('\`, \`')}\``);
  p('');
  p(`There is ${NAMED_ABSENT.map((n) => `no ${n}`).join(', ')}. Not "not yet" — `
    + '**not in this package**, and an import of one will not resolve. See *When there '
    + 'is no component for it* below, which is the section that matters most.');
  p('');
  p('**2 · Prop values are capitalised exactly as the design file names them.**');
  p('');
  p('```tsx');
  p('<Button variant="Primary" size="Md" />   // correct');
  p('<Button variant="primary" size="md" />   // wrong');
  p('```');
  p('');
  p('This is not a style preference. The values are string unions, so TypeScript '
    + 'rejects the lowercase form — and in plain JavaScript it produces a class name '
    + 'that matches no rule, which renders an unstyled box and reports nothing. Copy '
    + 'the casing from the tables, every time.');
  p('');
  p('**3 · Every visual value is a token.**');
  p('');
  p('Never write a hex, an rgb, a px or a font stack in or beside one of these '
    + 'components. Never invent a token name — one that does not exist resolves to '
    + 'nothing and renders nothing, silently. `reference/tokens.md` is the list.');
  p('');

  /* ── Choosing ────────────────────────────────────────────────────────── */
  p('## Choosing a component');
  p('');
  p('| Use | When | Never for |');
  p('|---|---|---|');
  for (const c of components) {
    p(`| [\`${c.name}\`](components/${c.name.toLowerCase()}.md) | ${cell(c.intent.use_when)} `
      + `| ${firstSentence(c.intent.dont_use_when)} |`);
  }
  p('');
  p('The full *do not use it when* for each one names the alternative for every case '
    + 'in it. Read the component\'s own page before reaching for it — the one-line '
    + 'summary above is for choosing, not for building.');
  p('');

  /* ── The variant axes, at a glance ───────────────────────────────────── */
  p('### Every value, at a glance');
  p('');
  p('| Component | Axis | Values |');
  p('|---|---|---|');
  for (const c of components) {
    const props = c.props ?? [];
    for (const prop of props) {
      const u = unionFor(prop, c.unions);
      if (!u) continue;
      p(`| ${c.name} | \`${prop.name}\` | ${unionValues(u)} |`);
    }
  }
  p('');

  /* ── The section that matters most ───────────────────────────────────── */
  p('## When there is no component for it');
  p('');
  p('This is the common case, and handling it well is most of what this skill is for.');
  p('');
  p('**Say so, and build the surrounding UI with tokens.** A screen is mostly not '
    + 'design-system components — it is layout, headings, cards, forms and tables, held '
    + 'together by the same palette. Reach for `reference/tokens.md`, use the semantic '
    + 'names, and the result moves with the system even though none of it is a Sunim '
    + 'component.');
  p('');
  p('Three things not to do instead, in the order they are tempting:');
  p('');
  p('- **Do not copy a component\'s CSS or class names into your own.** A copy stops '
    + 'following the tokens the moment the palette moves, and nothing tells you. It '
    + 'also renders `.sunim-*` class names on markup this system does not control, '
    + 'which makes the copy indistinguishable from the real thing to everybody who '
    + 'reads it next.');
  p('- **Do not press a component into a job its own page rules out.** Every '
    + '`dont_use_when` here names an alternative. Following it is faster than the '
    + 'workaround, and the workaround is what somebody has to unpick later.');
  p('- **Do not invent a token to fill a gap.** Report the gap. A value nobody chose, '
    + 'in a file that is regenerated on the next export, is worse than a blocked task.');
  p('');
  p('When a component that ought to exist does not, **say that in your answer.** A '
    + 'component several people have each rebuilt privately is the clearest evidence a '
    + 'design system is missing one, and the maintainers cannot see it happening.');
  p('');

  /* ── Hard rules ──────────────────────────────────────────────────────── */
  p('## Rules that do not bend');
  p('');
  p('| Rule | Why |');
  p('|---|---|');
  p('| Import the stylesheet once, before the application\'s own CSS | Component rules before the token layer resolve to nothing, silently |');
  p('| Import the component; never copy its styles | A copy stops following the palette and nothing reports it |');
  p('| No raw hex, rgb, px or font stacks | The token is what survives a palette change |');
  p('| No invented token names | An unknown custom property renders nothing, with no error |');
  p('| No deep imports into the package | Only the named exports are public; everything else can move in a patch |');
  p('| Custom properties with `unbound` in the name are gaps, not knobs | They mark values the design file never bound |');
  p('');

  /* ── State ───────────────────────────────────────────────────────────── */
  const withState = components.filter((c) => (c.props ?? []).some((x) => x.name === 'state'));
  if (withState.length) {
    p('## `state` is not how you drive interaction');
    p('');
    p(`${withState.map((c) => `\`${c.name}\``).join(', ')} takes a \`state\` prop, and it `
      + 'is easy to misread. `Default` is correct for nearly every use: it leaves hover '
      + 'and focus to the browser, so a real pointer and a real keyboard drive them. '
      + '`Hover` and `Focus` **pin that appearance on** and exist so a story can show a '
      + 'state that cannot be screenshotted otherwise.');
    p('');
    p('Do not wire `state` to an event handler. A component that renders `Hover` while '
      + 'the pointer is over it is a reimplementation of what CSS already does, one '
      + 'that breaks for keyboard users.');
    p('');
    p('`Disabled` and `Loading` are different — those are behavioural and are the '
      + 'correct way to express them.');
    p('');
  }

  /* ── Limits ──────────────────────────────────────────────────────────── */
  p('## What this system does not promise');
  p('');
  p('State these when they are relevant to what you are building. Do not paper over '
    + 'them, and do not try to fix them at the call site.');
  p('');
  p('- **Colour contrast is out of scope for this release, repo-wide.** Several '
    + 'tone-on-surface pairs fall below WCAG AA in several modes. It is measured and '
    + 'ruled rather than overlooked, and each component states its own case. If the '
    + 'screen you are building has an accessibility requirement, check the pair you are '
    + 'actually shipping, in the mode you are shipping it in, and say what you find.');
  p('- **Everything else in accessibility is live**, and each component names at least '
    + 'one thing it does not guarantee. Read its Accessibility section rather than '
    + 'assuming.');
  const experimental = components.filter((c) => c.intent.status === 'experimental');
  if (experimental.length) {
    p(`- **${experimental.map((c) => `\`${c.name}\``).join(', ')} `
      + `${experimental.length === 1 ? 'is' : 'are'} \`experimental\`** — the least `
      + 'settled part of the surface. Expect it to change.');
  }
  const [maj, min] = pkg.version.split('.').map(Number);
  if (maj === 0) {
    p(`- **\`${pkg.version}\` is below \`1.0.0\`, so a minor bump is allowed to break `
      + 'anything.** That is the semver contract rather than a warning. Pin the version '
      + 'exactly if a break would cost real time.');
  }
  p('');

  /* ── Files ───────────────────────────────────────────────────────────── */
  p('## Files');
  p('');
  p('| | |');
  p('|---|---|');
  p('| [`reference/setup.md`](reference/setup.md) | Install, the stylesheet order, fonts, modes, SSR, the client boundary |');
  p('| [`reference/tokens.md`](reference/tokens.md) | Every token a released component stands on, with its value |');
  for (const c of components) {
    p(`| [\`components/${c.name.toLowerCase()}.md\`](components/${c.name.toLowerCase()}.md) `
      + `| ${cell(firstSentence(c.intent.use_when))} |`);
  }
  p('');
  p('---');
  p('');
  p(`<sub>Generated from the intent contract of ${pkg.name}@${pkg.version} — the same `
    + 'files its release gate reads. Do not edit: an edit lasts until the next build, '
    + 'and the component it disagreed with is still right.</sub>');
  p('');

  return out.join('\n');
}

/* ── Run ─────────────────────────────────────────────────────────────────── */

console.log('\n\x1b[1mGenerating the knowledge skill\x1b[0m');

/* Cleared first, for the same reason the docs directory is: a component removed
 * from the surface must lose its page, and a stale one is how a skill keeps
 * recommending something that no longer exists. */
rmSync(OUT, { recursive: true, force: true });
mkdirSync(COMPONENTS_OUT, { recursive: true });
mkdirSync(REFERENCE_OUT, { recursive: true });

const registry = readRegistryStatus();
if (!registry) {
  console.log(`\n  \x1b[31m✗\x1b[0m ${REGISTRY_STATUS} is missing or unreadable.`);
  console.log('      Nothing can be described: there is no record of which components have shipped.');
  console.log('      Run the doc-generator agent — it has the Airtable connection and writes this file.\n');
  process.exit(1);
}
note(`registry read ${registry.readAt} by ${registry.readBy ?? 'unknown'}`);

const published = [];
let blockedByIntent = 0;
let blockedByRegistry = 0;
let skipped = 0;

for (const name of listComponents()) {
  const c = readComponent(name);

  if (!c.onSurface) {
    note(`${name} — not exported from src/index.ts. A consumer cannot import it, so the skill `
      + 'does not know about it.');
    skipped++;
    continue;
  }

  const entry = registryEntryFor(name, registry);
  if (!entry) {
    bad(`${name} — no row in ${REGISTRY_STATUS}. Not described.`);
    blockedByRegistry++;
    continue;
  }
  if (entry.development !== 'Completed') {
    bad(`${name} — the registry reads "${entry.development || 'blank'}", not "Completed". Not described.`);
    console.log('      An agent told about an unshipped component will write the import.');
    console.log('      `--force` does not reach this: it is for an incomplete intent, never for an');
    console.log('      incomplete component.');
    blockedByRegistry++;
    continue;
  }
  const stale = staleFor(c, registry);
  if (stale) {
    bad(`${name} — the registry was read ${registry.readAt}, but ${c.paths.dir} changed after that:`);
    console.log(`      ${stale.date}  ${stale.sha}  ${stale.subject}`);
    blockedByRegistry++;
    continue;
  }

  const findings = validateIntent(c, tokens).filter((f) => f.severity !== 'warn');
  if (findings.length && !force) {
    bad(`${name} — intent fails gate 6, so it is not described:`);
    for (const f of findings) console.log(`      ${f.message}`);
    blockedByIntent++;
    continue;
  }
  if (findings.length) note(`${name} — ${findings.length} gate-6 finding(s), described anyway under --force`);

  writeFileSync(join(COMPONENTS_OUT, `${name.toLowerCase()}.md`), componentPage(c));
  published.push(c);
  ok(`${name} — ${c.props?.length ?? 0} props · ${c.intent.required_tokens.length} tokens`);
}

if (!published.length) {
  bad('no component cleared both gates, so there is nothing to describe.');
  console.log('      A skill naming no components is worse than no skill: it reads like a system');
  console.log('      that has none, rather than like a build that failed.\n');
  process.exit(1);
}

writeFileSync(join(OUT, 'SKILL.md'), skillFile(published));
writeFileSync(join(REFERENCE_OUT, 'setup.md'), setupPage(published));
writeFileSync(join(REFERENCE_OUT, 'tokens.md'), tokensPage(published));
ok('SKILL.md + reference/setup.md + reference/tokens.md');

/*
 * The one check a generator can make about its own output.
 *
 * Every component named in SKILL.md has to have a page, and every page has to be
 * named. A skill that links to a file it did not write sends an agent to a dead
 * path, and a page nothing links to is a component the agent will never be told
 * about — both are silent, and both are exactly the failure this whole
 * arrangement exists to prevent.
 */
const wronglyAbsent = NAMED_ABSENT.filter((n) => published.some((c) => c.name === n));
if (wronglyAbsent.length) {
  for (const n of wronglyAbsent) {
    bad(`SKILL.md tells agents there is no ${n}, and ${n} is on the public surface.`);
  }
  console.log('      Remove it from NAMED_ABSENT in scripts/generate-skill.mjs. A skill that');
  console.log('      denies a shipped component sends every agent to build its own.\n');
  process.exit(1);
}

const skillText = readFileSync(join(OUT, 'SKILL.md'), 'utf8');
const linked = new Set([...skillText.matchAll(/components\/([a-z0-9]+)\.md/g)].map((m) => m[1]));
const written = new Set(published.map((c) => c.name.toLowerCase()));
const dangling = [...linked].filter((l) => !written.has(l));
const orphaned = [...written].filter((w) => !linked.has(w));
if (dangling.length || orphaned.length) {
  for (const d of dangling) bad(`SKILL.md links components/${d}.md, which was not written`);
  for (const o of orphaned) bad(`components/${o}.md was written but SKILL.md never links it`);
  process.exit(1);
}
ok(`${written.size} component pages, all linked and all present`);

const failing = blockedByRegistry > 0 || (blockedByIntent > 0 && !force);
console.log(
  `\n${failing ? '\x1b[31mBLOCKED\x1b[0m' : (blockedByIntent + blockedByRegistry) ? '\x1b[33mPARTIAL\x1b[0m' : '\x1b[32mDONE\x1b[0m'}  `
  + `${published.length} described · ${skipped} not on the surface · `
  + `${blockedByRegistry} not shipped · ${blockedByIntent} intent incomplete\n`,
);
process.exit(failing ? 1 : 0);
