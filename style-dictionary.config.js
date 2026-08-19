/**
 * Style Dictionary — turns tokens/tokens.json into the CSS and JS your components use.
 *
 * You should not need to edit this. It is tuned for the export produced by the Figma
 * community plugin "Design Tokens" (org.lukasoppermann.figmaDesignTokens), which is what
 * /productive-crew:setup assumes. Change it only if you export from something else.
 *
 * Source:  tokens/tokens.json — exported from Figma, committed to the repo.
 * Output:  build/tokens/<platform>/… — components consume these, never a raw value.
 *
 * NEVER hand-edit the source or the built output. Fix it in Figma, re-export, re-run.
 *
 * ── WHY THIS FILE ISN'T THE STOCK CONFIG ──────────────────────────────────────
 * Four things about that export break a default Style Dictionary setup. Each is handled
 * below, and each would otherwise be a confusing failure rather than an obvious one.
 *
 * 1 · MODES BECOME PART OF THE NAME.
 *     A variable with 7 modes exports as 7 tokens whose paths differ by one segment:
 *         color.day.surface.page      mode "Day"
 *         color.night.surface.page    mode "Night"
 *     Built naively that ships --color-day-surface-page and --color-night-surface-page as
 *     separate variables, which breaks the contract: semantic names must be identical across
 *     themes, only their values change. `name/kebab-themeless` drops the mode segment, and
 *     `css/themed-variables` emits one selector per mode instead.
 *
 *     Style Dictionary WARNS about "token collisions" when it builds this, and that warning is
 *     expected: 7 modes collapsing onto one name is the intent. The check to trust is
 *     scripts/token-check.js, which verifies every theme block declares the same variables.
 *
 *     The mode is read from the token's own metadata, not guessed from its position — the
 *     export records it at extensions["org.lukasoppermann.figmaDesignTokens"].mode, and it is
 *     present ONLY on multi-mode collections. Single-mode collections and plain styles have
 *     no mode, so they land in :root untouched.
 *
 * 2 · SHADOWS AND TEXT STYLES USE NON-STANDARD TYPES.
 *     They come through as `custom-shadow` and `custom-fontStyle`, not the DTCG `shadow` and
 *     `typography`. Style Dictionary's built-in shorthand formats filter on the standard names,
 *     never fire, and the raw object stringifies to `[object Object]`. The two transforms below
 *     read the same fields the built-ins would. They invent nothing: if a composite is missing a
 *     field its shorthand requires, the transform returns undefined and that token is left
 *     visibly broken rather than quietly guessed at.
 *
 * 3 · MULTI-STOP SHADOWS ARRIVE AS NUMBERED CHILDREN.
 *     A two-stop shadow exports as children "0" and "1" beside a sibling "description". The
 *     `merge-shadow-stops` preprocessor folds those into one token whose value is an ordered
 *     array, emitted as a single comma-separated box-shadow — not --shadow-float-0 / -1.
 *
 * 4 · DIMENSIONS ARE UNITLESS NUMBERS.
 *     `{ "type": "dimension", "value": 14 }` means 14px. The stock css and js groups apply
 *     `size/rem`, which would turn 4 into "4rem" — 64px. `size/px` is substituted in both.
 */
import { createPropertyFormatter } from 'style-dictionary/utils';

/** The metadata namespace the Figma "Design Tokens" plugin writes into every token. */
const NS = 'org.lukasoppermann.figmaDesignTokens';

/**
 * Which mode is the default — the one that also lands in :root, so the product renders
 * correctly with no data-theme attribute set. Leave null to use whichever mode appears
 * first in the export.
 */
const DEFAULT_THEME = 'Day';

/** Matches lodash kebabCase for these inputs: splits camelCase, collapses everything else. */
const kebab = (parts) =>
  parts
    .filter(Boolean)
    .join(' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

/** The token's Figma mode, or null when its collection has only one. */
const themeOf = (token) => (token.original?.extensions ?? token.extensions ?? {})[NS]?.mode ?? null;

/** CSS length: 0 stays unitless, everything else gets px. */
const len = (n) => (n === 0 ? '0' : `${n}px`);

/** Quote a font family only when it needs it. */
const family = (f) => (/^[A-Za-z][A-Za-z0-9-]*$/.test(f) ? f : JSON.stringify(f));

/**
 * One box-shadow layer. Returns undefined if a required field is absent, so the caller can
 * leave the token broken rather than emit a half-guessed shadow.
 */
const shadowLayer = (v) => {
  if (!v || typeof v !== 'object') return undefined;
  for (const f of ['offsetX', 'offsetY', 'radius', 'color']) {
    if (v[f] === undefined || v[f] === null) return undefined;
  }
  const parts = [len(v.offsetX), len(v.offsetY), len(v.radius)];
  if (v.spread !== undefined && v.spread !== null) parts.push(len(v.spread));
  parts.push(v.color);
  if (v.shadowType === 'innerShadow') parts.unshift('inset');
  return parts.join(' ');
};

export default {
  hooks: {
    preprocessors: {
      'merge-shadow-stops': (dictionary) => {
        const walk = (node) => {
          for (const [key, child] of Object.entries(node)) {
            if (!child || typeof child !== 'object' || 'value' in child) continue;
            const stops = Object.keys(child).filter((k) => /^\d+$/.test(k));
            const allShadows =
              stops.length > 0 && stops.every((s) => child[s]?.type === 'custom-shadow');
            if (allShadows) {
              node[key] = {
                type: 'custom-shadow',
                description: child.description,
                extensions: child.extensions,
                value: stops.sort((a, b) => Number(a) - Number(b)).map((s) => child[s].value),
              };
            } else {
              walk(child);
            }
          }
        };
        walk(dictionary);
        return dictionary;
      },
    },
    transforms: {
      'name/kebab-themeless': {
        type: 'name',
        transform: (token, config) => {
          const mode = themeOf(token);
          const path = [...token.path];
          if (mode) {
            // Drop the one path segment that is the mode — usually index 1, but found by
            // value so a differently-shaped collection still works.
            const i = path.findIndex((p) => kebab([p]) === kebab([mode]));
            if (i !== -1) path.splice(i, 1);
          }
          return kebab([config.prefix, ...path]);
        },
      },
      'value/custom-shadow-css': {
        type: 'value',
        filter: (token) => token.type === 'custom-shadow',
        transform: (token) => {
          const stops = Array.isArray(token.value) ? token.value : [token.value];
          const layers = stops.map(shadowLayer);
          if (layers.some((l) => l === undefined)) return undefined; // leave visibly broken
          return layers.join(', ');
        },
      },
      'value/custom-fontStyle-css': {
        type: 'value',
        filter: (token) => token.type === 'custom-fontStyle',
        transform: (token) => {
          const v = token.value;
          if (!v || v.fontSize == null || v.fontFamily == null) return undefined;
          const parts = [];
          // font-style and font-stretch are omitted when `normal` — the shorthand resets
          // omitted components to their initial value, which is normal, so this is lossless.
          if (v.fontStyle && v.fontStyle !== 'normal') parts.push(v.fontStyle);
          if (v.fontWeight != null) parts.push(String(v.fontWeight));
          if (v.fontStretch && v.fontStretch !== 'normal') parts.push(v.fontStretch);
          parts.push(v.lineHeight != null ? `${v.fontSize}px/${v.lineHeight}px` : `${v.fontSize}px`);
          parts.push(family(v.fontFamily));
          return parts.join(' ');
        },
      },
    },
    formats: {
      'css/themed-variables': ({ dictionary, options }) => {
        const fmt = createPropertyFormatter({
          outputReferences: options.outputReferences ?? false,
          dictionary,
          format: 'css',
        });
        const base = [];
        const byTheme = new Map();
        for (const token of dictionary.allTokens) {
          const theme = themeOf(token);
          if (!theme) base.push(token);
          else byTheme.set(theme, [...(byTheme.get(theme) ?? []), token]);
        }
        const block = (selector, tokens) =>
          `${selector} {\n${tokens.map((t) => fmt(t)).join('\n')}\n}\n`;

        const themes = [...byTheme.keys()];
        if (!themes.length) return block(':root', base);

        const fallback = DEFAULT_THEME ?? themes[0];
        if (!themes.includes(fallback)) {
          throw new Error(
            `DEFAULT_THEME "${fallback}" is not in the export; modes found: ${themes.join(', ')}`
          );
        }
        const rest = themes.filter((t) => t !== fallback);
        return [
          // :root carries everything unthemed plus the default mode, so the product works
          // with no data-theme set at all.
          block(':root', [...base, ...byTheme.get(fallback)]),
          // …and every mode gets its own block, the default included, so you can switch
          // back to it explicitly instead of having to remove the attribute.
          ...[fallback, ...rest].map((t) => block(`[data-theme="${kebab([t])}"]`, byTheme.get(t))),
        ].join('\n');
      },
    },
  },
  preprocessors: ['merge-shadow-stops'],
  source: ['tokens/tokens.json'],
  platforms: {
    css: {
      transforms: [
        'attribute/cti',
        'name/kebab-themeless',
        'time/seconds',
        'html/icon',
        'size/px',
        'color/css',
        'asset/url',
        'fontFamily/css',
        'cubicBezier/css',
        'strokeStyle/css/shorthand',
        'border/css/shorthand',
        'typography/css/shorthand',
        'transition/css/shorthand',
        'shadow/css/shorthand',
        'value/custom-shadow-css',
        'value/custom-fontStyle-css',
      ],
      buildPath: 'build/tokens/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/themed-variables',
          options: { outputReferences: true, showFileHeader: false },
        },
      ],
    },
    js: {
      // The theme is deliberately NOT stripped here: JS has no cascade, so every mode stays a
      // distinct export (ColorDaySurfacePage / ColorNightSurfacePage).
      transforms: [
        'attribute/cti',
        'name/pascal',
        'size/px',
        'color/hex',
        'value/custom-shadow-css',
        'value/custom-fontStyle-css',
      ],
      buildPath: 'build/tokens/js/',
      files: [
        { destination: 'tokens.js', format: 'javascript/es6' },
        { destination: 'tokens.d.ts', format: 'typescript/es6-declarations' },
      ],
    },
  },
};
