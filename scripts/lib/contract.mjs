/**
 * The meta contract — one reader for everything downstream of a component.
 *
 * Two things consume a component's metadata: the release gate, which decides
 * whether its name can go into a public version, and the reference site, which
 * publishes what it is for. They must agree. If they each parse the repo their
 * own way, the day they disagree is the day the site publishes an intent the
 * gate would have failed — and nothing anywhere reports that, because both
 * halves think they are right.
 *
 * So they read from here. `validateIntent` is the single definition of what a
 * complete intent is: the gate reports its findings, and the generator refuses
 * to publish a page for a component that has any. Written once, checked once,
 * published once.
 *
 * Plain Node, no dependencies, no TypeScript compiler. The parsing is regex over
 * a house style that `CLAUDE.md` enforces — one component per folder, one
 * `<Name>Props` interface, one doc comment per prop. It is not a TypeScript
 * parser and does not pretend to be: anything it cannot read, it says it cannot
 * read rather than guessing.
 */

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

export const COMPONENTS_DIR = 'src/components';
export const TOKENS_CSS = 'build/tokens/css/tokens.css';
export const SURFACE = 'src/index.ts';

export const INTENT_KEYS = [
  'component', 'since', 'status',
  'use_when', 'dont_use_when', 'placement', 'required_tokens', 'a11y',
];
export const PROSE_KEYS = ['use_when', 'dont_use_when', 'placement', 'a11y'];
export const STATUSES = ['experimental', 'settling', 'stable'];

const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : null);

export const stripBlockComments = (s) => (s ?? '').replace(/\/\*[\s\S]*?\*\//g, '');
export const stripLineComments = (s) => (s ?? '').replace(/^\s*\/\/.*$/gm, '');

/** `color.accent.ink-deep` → `--color-accent-ink-deep`. */
export const cssVar = (dotted) => `--${String(dotted).replace(/\./g, '-')}`;

export const semver = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)/.exec(v ?? '');
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
};
export const cmpSemver = (a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2];

/* ── The repo-wide reads ─────────────────────────────────────────────────── */

/** Every `--custom-property` the token build defines, with its default value. */
export function readTokens() {
  const css = read(TOKENS_CSS);
  const map = new Map();
  if (!css) return map;
  /*
   * First declaration wins. The generated file opens with `:root`, the default
   * mode, and every `[data-theme="..."]` block after it redeclares the same
   * names — so taking the first is taking the default rather than whichever
   * mode happens to be last in the file.
   */
  for (const [, name, value] of css.matchAll(/^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);/gim)) {
    if (!map.has(name)) map.set(name, value.trim());
  }
  return map;
}

/** Every theme mode the token build defines, the default first. */
export function readModes() {
  const css = read(TOKENS_CSS) ?? '';
  return ['day', ...new Set([...css.matchAll(/\[data-theme="([a-z]+)"\]/g)].map((m) => m[1]))]
    .filter((v, i, a) => a.indexOf(v) === i);
}

export const readSurface = () => read(SURFACE);

export const readPackage = () => JSON.parse(readFileSync('package.json', 'utf8'));

export function listComponents() {
  if (!existsSync(COMPONENTS_DIR)) return [];
  return readdirSync(COMPONENTS_DIR)
    .filter((d) => existsSync(join(COMPONENTS_DIR, d, `${d}.tsx`)))
    .sort();
}

/* ── One component ───────────────────────────────────────────────────────── */

/**
 * Everything known about one component, read once.
 *
 * `exists: false` means there is no implementation file — the caller decides
 * whether that is a failure (the gate) or a skip (the generator).
 */
export function readComponent(name) {
  const dir = join(COMPONENTS_DIR, name);
  const paths = {
    dir,
    tsx: join(dir, `${name}.tsx`),
    css: join(dir, `${name}.css`),
    stories: join(dir, `${name}.stories.tsx`),
    intent: join(dir, `${name}.intent.json`),
  };

  const tsx = read(paths.tsx);
  if (!tsx) return { name, paths, exists: false };

  const css = read(paths.css);
  const stories = read(paths.stories);

  let intent = null;
  let intentError = null;
  if (existsSync(paths.intent)) {
    try {
      intent = JSON.parse(readFileSync(paths.intent, 'utf8'));
    } catch (e) {
      intentError = e.message;
    }
  }

  const surface = readSurface() ?? '';
  const exportBlocks = (surface.match(/export\s*{[^}]*}/g) ?? []).join(' ');

  return {
    name,
    paths,
    exists: true,
    tsx,
    css,
    stories,
    intent,
    intentError,
    hasIntentFile: existsSync(paths.intent),

    props: parseProps(tsx, name),
    unions: parseUnions(tsx),
    figma: parseFigma(stories ?? tsx),
    composes: parseComposes(tsx),
    unbound: parseUnbound(css),
    storyIds: parseStoryIds(stories, name),

    onSurface: new RegExp(`\\b${name}\\b`).test(exportBlocks),
    propsExported: new RegExp(`\\b${name}Props\\b`).test(surface),
    hasSymbol: new RegExp(`export function ${name}\\b`).test(tsx),
    hasClassPrefix: Boolean(css && css.includes(`sunim-${name}`)),
  };
}

/**
 * The props of `<Name>Props`, each with the doc comment above it.
 *
 * The doc comment is not decoration here. `CLAUDE.md` makes a component's props
 * its documented API, so a prop with no comment is a gate failure — and the same
 * text becomes the prop table on the reference site, which is the whole reason
 * for reading it rather than just counting.
 */
export function parseProps(tsx, name) {
  const block = new RegExp(`export interface ${name}Props[^{]*{([\\s\\S]*?)\\n}`).exec(tsx);
  if (!block) return null;

  const lines = block[1].split('\n');
  const props = [];

  lines.forEach((line, i) => {
    const m = /^ {2}(\w+)(\??):\s*(.+?);\s*$/.exec(line);
    if (!m) return;

    /* Walk back over the doc comment immediately above, if there is one. */
    let doc = null;
    let j = i - 1;
    while (j >= 0 && lines[j].trim() === '') j--;
    if (j >= 0 && lines[j].trim().endsWith('*/')) {
      const end = j;
      while (j >= 0 && !/\/\*/.test(lines[j])) j--;
      doc = lines
        .slice(j, end + 1)
        .join('\n')
        .replace(/^\s*\/\*+/, '')
        .replace(/\*+\/\s*$/, '')
        .split('\n')
        .map((l) => l.replace(/^\s*\*ρ?\s?/, '').replace(/^\s*\*\s?/, '').trimEnd())
        .join('\n')
        .trim();
      /* `/* ... *​/` with no leading `*` is an implementation note, not a doc
       * comment — TSDoc needs the double star, and so does Storybook. */
      if (!/^\/\*\*/.test(lines[j]?.trim() ?? '')) doc = null;
    }

    props.push({ name: m[1], optional: m[2] === '?', type: m[3].trim(), doc });
  });

  return props;
}

/** The exported string unions — the variant axes. */
export function parseUnions(tsx) {
  return [...tsx.matchAll(/export type (\w+) =([^;]+);/g)]
    .map(([, typeName, body]) => ({
      typeName,
      members: [...body.matchAll(/'([^']+)'/g)].map((m) => m[1]),
    }))
    .filter((u) => u.members.length);
}

/** The Figma node the component was built from — URL and node id. */
export function parseFigma(source) {
  const m = /(https:\/\/www\.figma\.com\/design\/[^\s)`'"]+node-id=([\d-]+))/i.exec(source ?? '');
  return m ? { url: m[1], node: m[2].replace('-', ':') } : null;
}

/** Sibling components imported — the same thing the registry calls `Composes`. */
export function parseComposes(tsx) {
  return [...(tsx ?? '').matchAll(/from\s+'\.\.\/(\w+)\/\1'/g)].map((m) => m[1]);
}

/** Values Figma never bound, held in the component's quarantine block. */
export function parseUnbound(css) {
  return [...stripBlockComments(css).matchAll(/(--sunim-[A-Za-z]+-unbound-[a-z0-9-]+)\s*:\s*([^;]+);/gi)]
    .map((m) => ({ name: m[1], value: m[2].trim() }));
}

/**
 * The Storybook story ids, derived the way Storybook derives them.
 *
 * Used to deep-link the reference site into the workshop. Storybook's own
 * slugification is what this reproduces — lowercase, non-alphanumerics to
 * hyphens — so a story that renames itself breaks the link visibly rather than
 * silently pointing at nothing.
 */
export function parseStoryIds(stories, name) {
  if (!stories) return [];
  const title = /title:\s*'([^']+)'/.exec(stories)?.[1] ?? `Components/${name}`;
  const kind = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return [...stories.matchAll(/^export const (\w+):\s*Story/gm)].map((m) => ({
    exportName: m[1],
    id: `${kind}--${m[1].replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`,
  }));
}

/* ── The one definition of a complete intent ─────────────────────────────── */

/**
 * Every way an intent can be incomplete, in one list.
 *
 * The gate prints these as failures. The generator refuses to publish a page
 * that produces any. Neither one re-decides what "complete" means, which is the
 * point — a rule added here tightens both at once, and a rule that only
 * tightened one of them would let the site publish what the gate rejects.
 *
 * Returns `[]` when the intent is releasable.
 */
export function validateIntent(component, tokens = readTokens()) {
  const out = [];
  const { name, intent, intentError, hasIntentFile, css, tsx, paths } = component;

  if (!hasIntentFile) {
    return [{ key: 'file', message: `${paths.intent} does not exist — nothing says what this component is for` }];
  }
  if (intentError) {
    return [{ key: 'file', message: `${paths.intent} is not valid JSON — ${intentError}` }];
  }

  const missing = INTENT_KEYS.filter((k) => intent[k] === undefined);
  if (missing.length) out.push({ key: 'missing', message: `intent is missing: ${missing.join(', ')}` });

  /* Only the prose fields. `component`, `since` and `status` are short by
   * design, and a length floor on them would fail every valid intent. */
  const thin = PROSE_KEYS.filter((k) => typeof intent[k] === 'string' && intent[k].trim().length < 24);
  if (thin.length) out.push({ key: 'thin', message: `intent field(s) too short to mean anything: ${thin.join(', ')}` });

  for (const k of INTENT_KEYS) {
    if (typeof intent[k] === 'string' && /\bTBD\b|\bTODO\b|\bn\/a\b/i.test(intent[k])) {
      out.push({ key: 'placeholder', message: `intent.${k} is a placeholder, not an intent` });
    }
  }

  /*
   * Every consumer of this text renders markdown — the Storybook docs page, the
   * reference site, a report. An unbacketed `<button>` is parsed as an HTML tag
   * and disappears, and the sentence still reads plausibly without it, which is
   * exactly why nobody notices.
   */
  for (const k of PROSE_KEYS) {
    if (typeof intent[k] !== 'string') continue;
    const outsideCode = intent[k].replace(/`[^`]*`/g, '');
    const swallowed = outsideCode.match(/<\/?[a-zA-Z][^>]*>/g);
    if (swallowed) {
      out.push({
        key: 'markdown',
        message: `intent.${k} contains ${swallowed.join(', ')} outside backticks — markdown will swallow it. Wrap it in backticks`,
      });
    }
    if (/\|/.test(outsideCode)) {
      out.push({ key: 'markdown', message: `intent.${k} contains a pipe outside backticks, which breaks a markdown table` });
    }
  }

  if (intent.component && intent.component !== name) {
    out.push({ key: 'name', message: `intent names "${intent.component}" but lives in ${name}/ — one of them is wrong` });
  }

  if (!STATUSES.includes(intent.status)) {
    out.push({ key: 'status', message: `intent.status is "${intent.status}", expected one of ${STATUSES.join(', ')}` });
  }

  const required = Array.isArray(intent.required_tokens) ? intent.required_tokens : [];
  if (!required.length) {
    out.push({ key: 'tokens', message: 'intent.required_tokens is empty — every component in this system renders from tokens' });
  } else {
    const body = `${css ?? ''}\n${tsx ?? ''}`;
    for (const dotted of required) {
      if (/[{}]/.test(dotted)) {
        out.push({ key: 'tokens', message: `required_tokens contains a placeholder — "${dotted}". A brace cannot be resolved, so it checks nothing` });
        continue;
      }
      const v = cssVar(dotted);
      if (tokens.size && !tokens.has(v)) {
        out.push({ key: 'tokens', message: `required token ${dotted} resolves to ${v}, which the token build does not define` });
      } else if (!body.includes(v)) {
        out.push({ key: 'tokens', message: `required token ${dotted} (${v}) is declared but never referenced by ${name}` });
      }
    }
  }

  return out;
}

/**
 * Defaults from a component's destructured signature — `variant = 'Primary'`.
 *
 * The default is half of what a prop means, and it is written in exactly one
 * place. Reading it here rather than restating it in the intent is the same rule
 * the whole contract runs on: a value copied is a value that will drift.
 */
export function parseDefaults(tsx, name) {
  const m = new RegExp(`export function ${name}\\(\\{([\\s\\S]*?)\\}:`).exec(tsx ?? '');
  if (!m) return {};
  const out = {};
  for (const [, k, v] of m[1].matchAll(/(\w+)\s*=\s*('[^']*'|"[^"]*"|true|false|-?\d+(?:\.\d+)?)/g)) {
    out[k] = v.replace(/^'|'$/g, '');
  }
  return out;
}

/**
 * Follows a token through the `var(--…)` chain to the literal underneath it.
 *
 * Semantic tokens point at primitives — `--color-accent-ink` is
 * `var(--primitives-sky-600)` — so the name alone shows a consumer nothing. This
 * resolves to what actually renders.
 *
 * **In the default mode only.** The export redeclares the same names under seven
 * `[data-theme]` blocks, and `readTokens` keeps the first, so what comes back is
 * the day value. Any page that prints one has to say so; a swatch that silently
 * showed one of seven modes would look authoritative and be a coin flip.
 *
 * Returns `{ value, resolved, chain }` — `resolved` is null if the chain runs
 * off the end of the export, which is a broken token rather than a missing one.
 */
export function resolveToken(name, tokens = readTokens()) {
  const chain = [];
  let current = name;
  for (let i = 0; i < 10; i++) {
    if (!tokens.has(current) || chain.includes(current)) break;
    chain.push(current);
    const value = tokens.get(current);
    const ref = /^var\(\s*(--[a-z0-9-]+)/i.exec(value);
    if (!ref) return { value: tokens.get(name), resolved: value, chain };
    current = ref[1];
  }
  return { value: tokens.get(name) ?? null, resolved: null, chain };
}

/** Whether a resolved token value is something a swatch can show. */
export const isColour = (v) => typeof v === 'string' && /^(#[0-9a-f]{3,8}|rgba?\(|hsla?\()/i.test(v.trim());
