import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/*
 * Every var(--token) a component reaches for must exist in the generated
 * token file.
 *
 * This is the mechanical form of the rule CLAUDE.md states in prose: never
 * invent a token. It has already caught three invented names in this repo —
 * --color-line-subtle, --font-ui-sm and --font-body-sm — each of which looked
 * entirely plausible and none of which existed.
 *
 * No DOM and no new dependencies: it reads the CSS files and compares names.
 */

const TOKENS = 'build/tokens/css/tokens.css';

/** Custom properties a component is allowed to declare for itself. */
const LOCAL_PREFIXES = ['--sunim-', '--tk-'];

function cssFiles(dir: string, out: string[] = []): string[] {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) cssFiles(p, out);
    else if (p.endsWith('.css')) out.push(p);
  }
  return out;
}

/** CSS comments mention token names in prose; they are not references. */
function stripComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

function declaredIn(css: string): Set<string> {
  return new Set([...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]));
}

function referencedIn(css: string): string[] {
  return [...css.matchAll(/var\(\s*(--[a-z0-9-]+)/gi)].map((m) => m[1]);
}

describe('token binding', () => {
  it('has a generated token file — run `npm run build:tokens` first', () => {
    expect(existsSync(TOKENS), `${TOKENS} is missing`).toBe(true);
  });

  const generated = existsSync(TOKENS) ? declaredIn(readFileSync(TOKENS, 'utf8')) : new Set<string>();
  const files = cssFiles('src');

  it('finds component stylesheets to check', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  for (const file of files) {
    it(`${file} references only tokens that exist`, () => {
      const css = stripComments(readFileSync(file, 'utf8'));
      const local = declaredIn(css);
      const missing = referencedIn(css).filter(
        (name) =>
          !generated.has(name) &&
          !local.has(name) &&
          !LOCAL_PREFIXES.some((p) => name.startsWith(p))
      );
      expect([...new Set(missing)], `invented or renamed tokens in ${file}`).toEqual([]);
    });
  }
});
