---
name: intent
description: The format of a component's intent file — what it is for, what it is not for, where it goes, which tokens it needs, and what it guarantees to assistive technology. Use when writing or updating <Name>.intent.json.
---

# The intent file

## When to use this
Use this when a component has been built and needs its intent written, or when
something about the component changed and the intent no longer describes it.

## What an intent is
Props document **how** to call a component. Nothing in them says **when** you
should, or when you should reach for a different one — which is the question a
consumer actually has in front of them.

That gap is not academic. It is how a Button ends up used as a link on three
pages before anyone notices, and how the fourth person to need a status label
builds a second Chip because they could not tell that the first one was it.

## Where it lives
`src/components/<Name>/<Name>.intent.json`, beside the component it describes.

JSON rather than prose or TypeScript, for one reason: `scripts/release-review.mjs`
reads it in Node with no compiler, and its gate 6 is only worth having if it can
actually read every field. `src/intent.ts` carries the type, and the stories file
imports the same file the gate reads — so the docs page and the gate can never
disagree about what the intent says.

## The fields

| Field | What goes in it |
|---|---|
| `component` | The name. Identical to the folder, the exported symbol, and the registry row |
| `since` | The version whose surface first included it, as it will read in `package.json` |
| `status` | `experimental` · `settling` · `stable` — how much is expected to survive |
| `use_when` | The job it exists to do. One sentence, concrete |
| `dont_use_when` | The cases that look like its job and are not, **each with what to use instead** |
| `placement` | The containers it belongs inside |
| `required_tokens` | The semantic tokens it cannot render without, in dot notation |
| `a11y` | What it guarantees to a keyboard and a screen reader |

## How to write each one

**`use_when`** — name the job, not the shape. "A user-initiated action that
resolves on the page it is on" is a job. "A clickable pill" is a description of
what it looks like, and tells a consumer nothing they could not see.

**`dont_use_when`** — this is the field that earns the file, and the one that is
usually written badly. Two rules:

- Every case names the alternative. Telling someone they are wrong without
  telling them what to reach for sends them back to building their own.
- Write the misuse the component *invites*, not the one you can imagine. A Button
  invites being used as a link because it looks like the thing you click to go
  somewhere. That is the case worth writing down.

**`placement`** — the containers, not the pixels. Padding is the component's
business.

**`required_tokens`** — dot notation, matching the token names in `CLAUDE.md`:
`color.accent.ink`, `spacing.space.2`, `radius.radius.pill`. The gate resolves
each one to its custom property (`color.accent.ink-deep` → `--color-accent-ink-deep`)
and checks two things: that the token build defines it, and that the component
actually references it.

**Literal names only. No placeholders.** `color.bg.{intent}` reads well and
checks nothing — a brace cannot be resolved, so the gate fails it on sight. If
the token varies per variant, list every variant's token. It is longer and it is
true.

**`a11y`** — state commitments a test could fail, not adjectives. "Accessible" is
not a commitment. These are:

- what element it renders, and whether that puts it in the tab order
- what focus looks like and which rule draws it
- what is announced, and what is deliberately hidden
- target size, in numbers, per size variant
- what it does under `prefers-reduced-motion`

And **write down what it does not guarantee.** Button's Md size is 36px tall,
which clears WCAG 2.5.8 at AA and misses 2.5.5 at AAA — that sentence is worth
more than the whole rest of the field, because it is the one a consumer needs
before they put it on a phone.

## Self-check
- [ ] `component` matches the folder, the export, and the registry row
- [ ] `dont_use_when` names an alternative for every case in it
- [ ] `required_tokens` are literal, exist in the build, and appear in the component
- [ ] `a11y` states at least one thing the component does **not** guarantee
- [ ] No `TBD`, no `TODO`, no field left short enough to mean nothing
- [ ] `npm run release-review -- <Name>` passes gate 6
- [ ] The docs page renders it — `npm run storybook`, open the component, read it as a stranger

## Never
- Never write an intent for a component you cannot open and use. An intent
  written from the source is a description of the code, which the code already is.
- Never describe the component you wish existed. If `dont_use_when` says it must
  not be used for navigation and nothing stops that, the gap is the finding.
- Never invent a token to fill `required_tokens`. A token that does not exist is
  a design gap — report it and stop.
- Never edit the component to make the intent true. That is 🔨 Engineer's work,
  and it goes through the registry like everything else.
