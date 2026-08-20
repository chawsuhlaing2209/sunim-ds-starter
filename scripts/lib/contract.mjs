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
import { execSync } from 'node:child_process';

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
  const m = /(https:\/\/www\.figma\.com\/design\/([A-Za-z0-9]+)\/([^\s?)`'"]+)[^\s)`'"]*node-id=([\d-]+))/i.exec(source ?? '');
  if (!m) return null;
  const [, url, fileKey, slug, rawNode] = m;
  return {
    url,
    fileKey,
    slug,
    /* Figma writes node ids two ways: `19:231` in the API and `19-231` in a URL.
     * Both are kept because both are needed — the colon to talk about the node,
     * the hyphen to link to it. */
    node: rawNode.replace('-', ':'),
    urlNode: rawNode.replace(':', '-'),
    /*
     * The embed endpoint. It renders the node itself rather than the whole file,
     * which is the difference between a useful frame and a viewport somebody has
     * to go hunting in.
     *
     * It only renders for a viewer who can see the file. A file that is not
     * shared to anyone-with-the-link shows a sign-in wall instead, and there is
     * no way for a build to tell those apart — so the page carries a fallback
     * link, and whoever ships the site checks the frame with a logged-out
     * browser.
     */
    embed: `https://embed.figma.com/design/${fileKey}/${slug}?node-id=${rawNode.replace(':', '-')}&embed-host=sunim-reference`,
  };
}

/**
 * The shared `args` on a story file's meta — real values a human chose.
 *
 * A usage example has to contain something for `label`, and anything this
 * generator invented would be filler that reads like documentation and means
 * nothing. The stories already carry the copy somebody picked when they built
 * the component, so the example is written from that rather than from a
 * template.
 *
 * Only flat literal values are read. A story arg that is a JSX element or a
 * function is deliberately skipped — it belongs in a story, not in a two-line
 * example, and half-rendering it would produce code that does not compile.
 */
export function parseMetaArgs(stories) {
  const block = /\n  args:\s*{([\s\S]*?)\n  },/.exec(stories ?? '');
  if (!block) return {};
  const out = {};
  for (const [, k, v] of block[1].matchAll(/^\s{4}(\w+):\s*('[^']*'|"[^"]*"|true|false|-?\d+(?:\.\d+)?),?\s*$/gm)) {
    out[k] = v.replace(/^'|'$/g, '');
  }
  return out;
}

/**
 * Splits stories into the variant matrix and the examples.
 *
 * A matrix story's name is nothing but variant values joined together —
 * `PrimaryMdDefault` is Primary + Md + Default. Everything else was written on
 * purpose to show something the matrix cannot: `WithCustomIcon`, `LongLabel`,
 * `AllTones`, `Playground`.
 *
 * The distinction matters because the two belong on different tabs. The matrix
 * is design evidence — proof every variant exists. The examples are what a
 * consumer actually wants to see, and burying six of them under thirty
 * mechanical permutations is how a reference site stops being read.
 */
export function classifyStories(storyIds, unions, componentName = '') {
  const members = unions.flatMap((u) => u.members).map((m) => m.toLowerCase());
  if (!members.length) return { matrix: [], examples: storyIds };

  /*
   * The axis words as well as the values. A one-axis component names its matrix
   * stories `Size14`, `Size16` — the axis is in the name because the value alone
   * would not read as one. Without the axis word in the vocabulary those look
   * like hand-written examples, and the tab that is meant to prove every variant
   * exists shows nothing.
   */
  const axes = unions
    .map((u) => u.typeName.replace(new RegExp(`^${componentName}`), '').toLowerCase())
    .filter(Boolean);
  const vocab = [...new Set([...members, ...axes])].sort((a, b) => b.length - a.length);

  const isMatrix = (exportName) => {
    let rest = exportName.toLowerCase();
    let usedMember = false;
    let progress = true;
    while (rest.length && progress) {
      progress = false;
      for (const word of vocab) {
        if (rest.startsWith(word)) {
          if (members.includes(word)) usedMember = true;
          rest = rest.slice(word.length);
          progress = true;
          break;
        }
      }
    }
    return rest.length === 0 && usedMember;
  };

  return {
    matrix: storyIds.filter((s) => isMatrix(s.exportName)),
    examples: storyIds.filter((s) => !isMatrix(s.exportName)),
  };
}

/**
 * A component's change history, from git.
 *
 * Derived rather than maintained, for the reason everything else here is: a
 * hand-written changelog is a second record of what happened, and the second
 * record is the one that goes stale. This one cannot — it is the commits that
 * touched the component's own directory.
 *
 * The cost is that a commit message *is* the changelog entry. That is a fair
 * trade and arguably the point: a message nobody would want on a public page is
 * a message that was not worth writing.
 *
 * Returns `[]` outside a git repository rather than throwing, so a tarball
 * checkout still builds.
 */
export function readChangelog(dir, limit = 25) {
  try {
    const raw = execSync(
      `git log --no-merges --date=short --format=%h%x1f%ad%x1f%aI%x1f%s -n ${limit} -- ${JSON.stringify(dir)}`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
    );
    return raw
      .split('\n')
      .filter(Boolean)
      .map((line) => {
        const [sha, date, iso, subject] = line.split('\u001f');
        /* `date` is for reading, `iso` is for comparing. The staleness check on
         * the registry manifest needs a real instant, not a day. */
        return { sha, date, iso, subject };
      });
  } catch {
    return [];
  }
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

    /*
     * And the other direction, which this check missed until a review found it.
     *
     * Declared-but-unused was caught; used-but-undeclared was not, so an intent
     * could name twelve tokens while the component rendered from sixteen and
     * pass cleanly. The four it omitted were the padding on every variant —
     * exactly the kind of load-bearing token the field exists to list.
     *
     * A warning rather than a failure: `required_tokens` means "cannot render
     * without", which is a judgement about which of the tokens it touches are
     * load-bearing. The gate can surface the gap; it cannot make that call.
     */
    const declared = new Set(required.filter((t) => !/[{}]/.test(t)).map(cssVar));
    const referenced = new Set(
      [...`${css ?? ''}`.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)]
        .map((m) => m[1])
        .filter((v) => !v.startsWith('--sunim-') && tokens.has(v)),
    );
    const undeclared = [...referenced].filter((v) => !declared.has(v));
    if (undeclared.length) {
      out.push({
        key: 'tokens-undeclared',
        severity: 'warn',
        message: `${name} renders from ${referenced.size} semantic tokens but declares ${declared.size}. `
          + `Not listed: ${undeclared.join(', ')}. If any of those is load-bearing, the intent under-states `
          + 'what breaks when the palette moves.',
      });
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

/* ── The registry manifest ───────────────────────────────────────────────── */

export const REGISTRY_STATUS = 'docs/registry-status.json';

/**
 * What the registry said, the last time an agent with access read it.
 *
 * A build script cannot reach Airtable, and giving it a token so it could would
 * put a credential in every CI run to answer a question that changes twice a
 * week. So 📝 Doc Generator reads the registry — it has the connection — and
 * writes what it saw here, with the instant it read it.
 *
 * That makes this file evidence rather than configuration, and evidence goes
 * stale. `staleFor` is what catches it: if a component's own directory has a
 * commit newer than `readAt`, the status recorded here predates the change and
 * may no longer be true. A component that was `Completed` when this was written
 * can be `To be fixed` by the time you read it, and the whole point of the gate
 * is that the site must not document that component.
 *
 * It carries `development` and `verdict` per component: what the board's status
 * formula reads, and whether 📦 Release has cleared it. The release run needs
 * both — the first decides what is a candidate, the second decides which
 * candidates nobody has gated.
 *
 * It records names and statuses only. No base, table, or record IDs — this file
 * is tracked, and the repository is public.
 */
export function readRegistryStatus() {
  if (!existsSync(REGISTRY_STATUS)) return null;
  try {
    return JSON.parse(readFileSync(REGISTRY_STATUS, 'utf8'));
  } catch {
    return null;
  }
}

/**
 * The registry entry for a component, matched forgivingly on the name.
 *
 * The registry writes `Icon Slot` where the folder writes `IconSlot`. Both are
 * the same component and neither is going to change today, so the lookup ignores
 * spacing — and the generator says out loud when it had to, because a name that
 * disagrees with itself in two systems is a gate-4 finding, not a detail to
 * absorb quietly.
 */
export function registryEntryFor(name, manifest) {
  if (!manifest?.components) return null;
  const flat = (s) => s.replace(/\s+/g, '').toLowerCase();
  const key = Object.keys(manifest.components).find((k) => flat(k) === flat(name));
  return key ? { key, ...manifest.components[key] } : null;
}

/**
 * Whether the registry reading predates the component's own latest commit.
 *
 * Returns the commit that makes it stale, or null. Scoped to the component's
 * directory, so a change to a script or a document does not invalidate every
 * status in the file — only a change to the component whose status is claimed.
 */
export function staleFor(component, manifest) {
  if (!manifest?.readAt) return null;
  const [latest] = readChangelog(component.paths.dir, 1);
  if (!latest?.iso) return null;
  return new Date(latest.iso) > new Date(manifest.readAt) ? latest : null;
}
