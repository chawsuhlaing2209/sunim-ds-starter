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
- The PM audits the registry and reports. It writes nothing but a report.
- A human approves. No agent approves its own work, ever.

Agents do not hand work to each other in conversation. They hand it over through the
registry: one agent writes evidence, a formula derives a status, and the next agent picks
up the rows carrying its status. An agent that writes into a column it does not own has
broken the handoff for everyone downstream.



## Common failures to avoid

- Inventing a token that does not exist. Report the gap instead and stop.
- Copying a component's styles instead of importing the component.
- Raw hex, px, or font values inside a component file.
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

