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

The site **embeds and links into** Storybook, and re-renders nothing. The frames
are Storybook itself, so there is no second rendering to keep in step.

Those frames are subject to `frame-ancestors 'self'`. When the site and Storybook
are on different origins, the fix is to **name this site's origin in the
directive** — an allowlist of one origin we control. Not `*`, and not removing
the directive: that is what stops an arbitrary site framing ours and dressing it
up as their own. If both are deployed to one origin, nothing needs changing at
all.

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
npm run docs:dev         # generate against local Storybook, then serve on :4321
npm run docs:build       # tokens, generate, then build to docs/dist
```

## The first gate: the registry, not the folder

**A page is published only for a component whose `Development` reads `Completed`.**
Nothing else qualifies — not a finished-looking folder, not a green build, not a
component you deployed to staging an hour ago.

The reason is that a page for a component that has not shipped reads *exactly*
like a page for one that has. There is no visual difference, so a reader cannot
tell, and the first they learn of it is an import that does not resolve or a
component that changes under them next week.

A build script cannot reach Airtable, and giving it a token so it could would put
a credential in every CI run to answer a question that changes twice a week. So
the reading is your job:

1. Read `Components` — `Development` and `Synchronization %` for every row.
2. Write `docs/registry-status.json`: names and statuses only, **no base, table
   or record IDs** — that file is tracked and this repo is public.
3. Run the generator. It refuses anything that is not `Completed`.

That file is evidence, so it goes stale like any other. The generator compares
`readAt` against the last commit to each component's own directory: if the
component changed after you read the registry, the recorded status predates the
change and cannot vouch for it, and that component is blocked until you re-read.

**`--force` does not reach this gate.** It forgives an incomplete *intent*,
because sometimes you need to see the page to understand the gap. Whether a
component has shipped is not that kind of question, and an override would make
the gate advisory.

## The five tabs

Every component page is one set of tabs, and each answers a different person's
question:

| Tab | Answers | Built from |
|---|---|---|
| **Usage** | Should I use this at all? | the intent — use, misuse, placement, a11y, composition, what the version promises |
| **Examples** | What does it look like in practice? | a usage example from the stories' own args, then every story written on purpose rather than to fill a matrix row, each embedded live |
| **Code** | How do I call it? | the import, the props table with each prop's doc comment, the types, the tokens, and Storybook's own props table embedded |
| **Design** | What was it built from? | the Figma node embedded, the variant matrix, all seven modes, and the values Figma never bound |
| **Changelog** | What has changed? | `git log` scoped to the component's directory |

The Examples/Design split is not cosmetic. The variant matrix is *design
evidence* — proof every variant exists — and burying six real examples under
thirty mechanical permutations is how a reference site stops being read.

## The embeds

Stories are embedded twice, in day and night, and CSS shows the one matching the
page's theme. A day-mode component sitting in a dark page reads as a rendering
bug rather than as a frame, which is the wrong impression on the page whose job
is to show the component looking right. The hidden frame is lazy and costs
nothing.

Two things about embeds no build can check for you:

- **Storybook frames are cross-origin unless both artefacts share a host.**
  `frame-ancestors 'self'` blocks them at view time, not build time. The
  generator warns once when the two configured origins differ.
- **Figma frames render only for someone who can see the file.** An unshared
  file returns a redirect to sign-in, and the URL is valid either way. Open a
  component page **logged out** and look at the Design tab; there is no other
  way to know.

Both failures degrade to a link rather than to nothing, which is why every frame
carries one.

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

1. **Read the registry and write `docs/registry-status.json`.** Nothing publishes
   without it, and a stale one blocks the components it can no longer vouch for.
2. `npm run build:tokens` — the token values on every page come from the build,
   and a stale build publishes stale values.
3. `npm run docs:generate`. Read the output. Anything blocked is a component to
   ship or an intent to fix, not a flag to add.
4. `npm run docs:build`, then **open it and look at it**. A build that succeeds
   and serves a page with an empty props table is a build that failed.
5. Check the deep links and the frames. `reference.config.json` holds
   `storybookUrl`, and a wrong value produces a site full of dead links rather
   than a build error. Open one page logged out to see the Figma frames as a
   stranger does.
6. `node scripts/security-check.mjs --dir docs/dist` before it ships. It is a
   second public artefact and gets the same gate as the first.

## Self-check
- [ ] `docs/registry-status.json` was read today, and carries no base, table or record IDs
- [ ] `npm run docs:generate` exits 0 with nothing blocked
- [ ] Every component that is **both** on `src/index.ts` **and** `Completed` has a
      page, and nothing else does
- [ ] The tabs are all populated — no empty props table, no missing changelog
- [ ] One page checked logged out, for the Figma frames
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
- Never answer a blocked frame with `frame-ancestors *` or by deleting the
  directive. Name this site's origin, or put both artefacts on one origin.
- Never remove a frame's fallback link. It is what makes a blocked frame cost a
  click instead of the content.
- Never let `docs/` depend on `src/`. The site documents the surface; it is not
  part of it.
- Never publish a page for a component that is not exported from `src/index.ts`.
  It is not in the release, so documenting it invites use of something nobody
  promised.
- Never publish a page for a component whose `Development` is anything but
  `Completed`. An unshipped component's page is indistinguishable from a shipped
  one's, which is the entire reason for the gate.
- Never hand-edit `docs/registry-status.json` to get a build through. It is a
  record of what the registry said; editing it is writing down something that
  did not happen.
- Never put a base, table, or record ID in it. It is tracked, and this repo is
  public.
- Never edit `VERSIONING.md` from here. The site copies it; it does not own it.
