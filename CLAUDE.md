# CLAUDE.md — how we work in this repo

This file holds the culture: how components are built here, what is allowed, and
what to avoid. It does not hold stack facts.

**Before changing tooling, dependencies, tests, package scripts, or deployment
configuration, read** `./tools.md` **and follow it as the source of truth.**

## The system

- Tokens are the only source of visual values. Every colour, space, radius, and
font value in a component references a token.
- Semantic tokens point at primitives. Components use semantic tokens only.
A component referencing a raw hex is wrong; it should reference
`--color-action-primary`.
- Never edit anything in `build/tokens/` by hand. It is generated. Fix it in Figma,
re-export `tokens/tokens.json`, and rebuild.
- Modes come from Figma. A token that exists in one mode and not another is a
design gap; report it rather than filling it in.



## Naming

- Components: PascalCase, one folder per component in `src/components/`.
- Prop names match the Figma property names exactly. If Figma says `size`,
the prop is `size`.
- Token names use category, then property, then role:
`color.action.primary`, `spacing.md`, `radius.sm`.



## Components

- Every component covers every interaction state the product uses:
default, hover, pressed, focus, disabled, loading, error, as applicable.
- Every variant and every state has a story.
- A component's props are its documented API. Undocumented behaviour is a bug.



## Roles

Design is human. Everything downstream of it is an agent, one job each. The full pipeline
is in `.claude/skills/registry/SKILL.md`; what follows is the boundary each one lives
inside.

- A human designs, exports the tokens, and marks the design done. No agent does.
- The engineer builds and fixes. It never verifies its own work.
- QA tests and reports. It never repairs.
- DevOps ships what QA passed. It never changes what was tested on the way.
- The doc generator writes what a component is for, and generates the reference
site from it. It never changes a component to make its documentation true, and it
never hand-writes a generated page.
- The release agent decides whether a shipped component can be lived with in
public, and prepares the package a human then decides to publish. It repairs
nothing, holds no publish credential, and never bumps a version.
- DevOps performs what the release agent prepared, and only when a human says so.
- The PM audits the registry and reports. It writes nothing but a report.
- A human approves. No agent approves its own work, ever.

Agents do not hand work to each other in conversation. They hand it over through the
registry: one agent writes evidence, a formula derives a status, and the next agent picks
up the rows carrying its status. An agent that writes into a column it does not own has
broken the handoff for everyone downstream.



## Rulings

Some findings have already been ruled on by a human. They are in `decisions.md`,
with what each one means for an agent that hits it.

Check that file before reporting a finding as new. A ruling recorded there is not
a defect to fix and not an argument to have again — and a finding that is *not*
there has not been ruled on, whatever anyone remembers.

## Intent

- Props say **how** to call a component. They never say **when** you should, or
when you should reach for a different one — which is the question a consumer
actually has.
- Every component carries `src/components/<Name>/<Name>.intent.json`: what it is
for, what it is not for, where it goes, the tokens it needs, and what it
guarantees to a keyboard and a screen reader. The format is in
`.claude/skills/intent/SKILL.md`.
- That file is the only copy, and three surfaces read it: the component's own
Storybook docs page, the `Documentation/Component Intent` gallery, and the
reference site in `docs/`. Write the JSON and all three update. Prose written
twice is prose that disagrees.
- The intent is checked and published through **one reader**,
`scripts/lib/contract.mjs`. 📦 Release's gate 6 fails a release over it, and the
site generator **refuses to publish a page for a component that would fail that
gate**. Written once, checked once, published once — and a page can never
describe something the gate rejected.
- `dont_use_when` names the alternative for every case in it. Telling somebody
they are wrong without telling them what to reach for sends them back to
building their own.
- `a11y` states at least one thing the component does **not** guarantee, measured
rather than asserted. "Accessible" is not a commitment; "Md is 36px, which
clears 2.5.8 at AA and misses 2.5.5 at AAA" is.

## Documentation

- **Storybook is where components render. `docs/` is where they are explained.**
Every variant and state, live, in the first; intent, props, tokens, limits and
promises in the second. Neither repeats the other.
- **A component is documented only once it is `Completed` in the registry.** A page
for something that has not shipped reads exactly like a page for something that
has, so a reader cannot tell — and the first they learn of it is an import that
does not resolve. `docs/registry-status.json` carries the reading that decides
this, and no flag overrides it.
- No component page in `docs/` is written by hand. They come out of
`scripts/generate-docs.mjs`, from the intent, the props interface, the token
build and the stories. Editing one is the same mistake as editing
`build/tokens/` — it lasts until the next build.
- The reference site is its own npm package, and nothing in it may depend on
`src/`. It documents the surface; it is not part of it.
- The site embeds and links into Storybook and re-renders nothing. The frames
are Storybook itself, so there is no second rendering to keep in step.
- A blocked frame is answered by naming an origin in `frame-ancestors`, never by
`*` and never by deleting the directive. Every frame carries a fallback link, so
the worst case is a click.

## The public surface

- A component is public when it is exported from `src/index.ts`, and not before.
Everything else in `src/` is scaffolding, whatever a consumer can reach by deep
import.
- Adding an export is a release decision. `VERSIONING.md` says what a version
number promises and what it deliberately does not.
- **No agent bumps the version or tags a release.** That number is a promise to
people outside this repo, and promises are made by whoever will be held to them.
- Preparing a release and performing one are different jobs held by different
agents. Everything 📦 Release does is reversible — a branch, a draft, a proposal.
Everything a publish does is not: an npm version cannot be unpublished after 72
hours. The line between them is where a human goes.

## Common failures to avoid

- Inventing a token that does not exist. Report the gap instead and stop.
- Copying a component's styles instead of importing the component.
- Raw hex, px, or font values inside a component file.
- A placeholder in a document a gate reads — `color.bg.{intent}` reads well and
checks nothing.
- Editing a component so that its intent becomes true. The gap is the finding.
- Adding a dependency to solve a problem the existing stack already solves.



## Typography

- Fonts are **self-hosted**, never loaded from a CDN. They come from `@fontsource`
packages and ship as `.woff2` inside the bundle.
- The deployed CSP sets `font-src 'self' data:` and `style-src 'self' 'unsafe-inline'`.
A Google Fonts link fails both — the stylesheet and the font file are each on another
origin — and it fails *silently*: every label falls back to the browser default and
every width you measure afterwards is wrong for a reason that has nothing to do with
the component.
- Adding a weight means adding the import. `.storybook/preview.ts` imports one file per
weight the tokens actually use, each commented with the token that needs it. Before
adding another, check what the tokens ask for:

```
grep -- --font- build/tokens/css/tokens.css
```

- Adding a family means installing its `@fontsource` package too. A family imported but
not installed takes Storybook down at boot rather than degrading — it has already
happened here.
- Confirm a font loaded by measuring it, not by asking. `document.fonts.check()` returns
true for a font that merely resolved to a fallback. Measure a string on a canvas in the
declared family and again in a deliberately bogus one: identical widths mean the real
face never arrived.

