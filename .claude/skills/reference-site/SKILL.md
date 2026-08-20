---
name: reference-site
description: Generate and publish the Astro Starlight reference site from the meta contract — component pages, tokens, versioning. Use after an intent changes, never to hand-write a page.
---

# The reference site

## When to use this
Use this after an intent file changes, after a component's props or tokens
change, and before a release. Not to write a page — no page here is written.

## What it is, and what it is not

Two surfaces, answering different questions:

| | Storybook | The reference site |
|---|---|---|
| Answers | *What does it look like in every state?* | *Should I be using this at all?* |
| Contains | Every variant, size and state, live | Intent, props, tokens, limits, promises |
| Written by | 🔨 Engineer, alongside the component | Nobody. It is generated |

The site **links** into Storybook and never embeds it. The deployed CSP sets
`frame-ancestors 'self'`, so a cross-origin frame is blocked — and widening a
real protection to save a click is not a trade worth making. If you find yourself
about to relax that header, stop.

## Where it lives
`docs/`, as its own npm package with its own `node_modules`.

That separation is deliberate. Astro brings roughly 370 packages and its own Vite
major; the design system ships four components and a token build. One dependency
tree would put every one of those packages one install away from the thing being
documented, and pin two Vite majors against each other. It also means nothing in
`docs/` can reach `src/index.ts` — the site cannot accidentally become part of
the surface it documents.

```
npm run docs:install     # once, or after docs/package.json changes
npm run docs:generate    # content from the contract
npm run docs:dev         # generate, then serve on :4321
npm run docs:build       # tokens, generate, then build to docs/dist
```

## The loop this closes

An intent file is written once. Two things then read it, through one reader —
`scripts/lib/contract.mjs`:

- **🧭 Reviewer's gate 6** fails a release if the intent is missing, thin,
  placeholdered, or names a token the component does not use.
- **This site** turns the same file into the *When to use it* section.

And the generator **refuses to publish a page for a component whose intent would
fail that gate.** That refusal is the point of the whole arrangement. Without it
the two halves drift apart quietly, and the failure is a published page
confidently describing a component that was never allowed to ship.

`--force` publishes anyway, naming each gap. It exists for the case where you
need to see the page to understand the gap. It is not for making a deadline, and
a `--force` build is not a release.

## What is generated, and from what

| Page | Built from |
|---|---|
| `components/<name>.mdx` | the intent, the props interface with its doc comments, the required tokens resolved through the build, the stories, the unbound-value block |
| `components/overview.md` | every published component's `use_when` and `status` |
| `start/tokens.md` | the union of every component's `required_tokens`, resolved, with who depends on each |
| `start/versioning.md` | `VERSIONING.md`, verbatim |

Only `index.mdx` and `start/what-this-is.md` are hand-written. Everything else is
gitignored for the same reason `build/tokens/` is: **it is generated, so editing
it by hand lasts until the next build**, and the source it disagreed with is
still wrong.

The generated directory is cleared before each run. A component removed from the
public surface loses its page, which is the behaviour you want — a stale page is
how a site keeps documenting something that no longer exists.

## Steps

1. `npm run build:tokens` — the token values on every page come from the build,
   and a stale build publishes stale values.
2. `npm run docs:generate`. Read the output. Anything blocked is an intent to fix,
   not a flag to add.
3. `npm run docs:build`, then **open it and look at it**. A build that succeeds
   and serves a page with an empty props table is a build that failed.
4. Check the deep links. `reference.config.json` holds `storybookUrl`, and a wrong
   value there produces a site full of dead links rather than a build error — the
   generator cannot tell the difference, so you have to.
5. `node scripts/security-check.mjs --dir docs/dist` before it ships. It is a
   second public artefact and gets the same gate as the first.

## Self-check
- [ ] `npm run docs:generate` exits 0 with nothing blocked
- [ ] Every component on `src/index.ts` has a page, and nothing else does
- [ ] A props table, a token table with resolved values, and an accessibility
      section on every page — none of them empty
- [ ] The Storybook links open the right component
- [ ] `node scripts/security-check.mjs --dir docs/dist` reads `CLEAR`
- [ ] No hand-edited file under `docs/src/content/docs/components/`

## Never
- Never hand-write or hand-edit a component page. If the page is wrong, the
  source is wrong — fix the intent, the prop comment, or the token.
- Never use `--force` to publish a component whose intent has not been fixed, and
  never call a `--force` build a release.
- Never widen the CSP so the site can embed Storybook.
- Never let `docs/` depend on `src/`. The site documents the surface; it is not
  part of it.
- Never publish a page for a component that is not exported from `src/index.ts`.
  It is not in the release, so documenting it invites use of something nobody
  promised.
- Never edit `VERSIONING.md` from here. The site copies it; it does not own it.
