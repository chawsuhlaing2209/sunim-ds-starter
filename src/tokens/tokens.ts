/**
 * Reads the design tokens out of the live stylesheet.
 *
 * Deliberately not a hardcoded list. `build/tokens/css/tokens.css` is generated
 * from the Figma export, so any list written by hand here starts drifting the
 * next time somebody rebuilds. Reading the CSSOM means the gallery is always
 * showing what actually shipped.
 */

export const MODES = [
  'day',
  'open',
  'morning',
  'sunrise',
  'sunset',
  'overcast',
  'night',
] as const;

export type Mode = (typeof MODES)[number];

export interface Token {
  /** The custom property, e.g. `--color-accent-ink`. */
  name: string;
  /** The declared value, e.g. `var(--primitives-sky-600)` or `16px`. */
  value: string;
  /** The token it points at, when the value is a single `var()` reference. */
  refersTo: string | null;
}

const VAR_ONLY = /^var\(\s*(--[a-z0-9-]+)\s*\)$/;

function collect(selectorMatches: (selector: string) => boolean): Token[] {
  const out = new Map<string, Token>();

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // A cross-origin sheet. None of ours are, so skipping is correct.
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!selectorMatches(rule.selectorText)) continue;
      for (const prop of Array.from(rule.style)) {
        if (!prop.startsWith('--')) continue;
        const value = rule.style.getPropertyValue(prop).trim();
        out.set(prop, {
          name: prop,
          value,
          refersTo: VAR_ONLY.exec(value)?.[1] ?? null,
        });
      }
    }
  }
  return [...out.values()].sort((a, b) => a.name.localeCompare(b.name));
}

/** Every token defined on `:root` — mode-independent. */
export function rootTokens(): Token[] {
  return collect((s) => s === ':root');
}

/** The tokens a given mode redefines. Only colours vary by mode. */
export function modeTokens(mode: Mode): Token[] {
  return collect((s) => s === `[data-theme="${mode}"]`);
}

/** Tokens in a family, e.g. `--color-`. */
export function family(tokens: Token[], prefix: string): Token[] {
  return tokens.filter((t) => t.name.startsWith(prefix));
}

/**
 * What a token actually resolves to right now, in the mode currently applied.
 * Reads through an element so `[data-theme]` on an ancestor is honoured.
 */
export function resolve(el: Element, name: string): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}
