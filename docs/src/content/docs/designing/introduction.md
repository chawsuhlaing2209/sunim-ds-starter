---
title: Designing with Sunim
description: How to get the Sunim library and its variables into a Figma file, which modes you are designing against, and the three places the code deliberately says something else.
sidebar:
  label: Introduction
  order: 1
---

Everything in this system starts in Figma. The components are built from nodes in
one file, the tokens are exported from that file's variables, and **the only human
in the pipeline is the one doing the design** — every step after it is an agent
with one job. So the Figma file is not a reference copy of the system. It is the
system.

## The file

**[2. Sunim · Web · Component · V1.0 · Beta](https://www.figma.com/design/mFnN1Sr8MAmOdmx0ABXPsb/2.-Sunim-.-Web-.-Component-.-V1.0-.-Beta)**

It holds two things the rest of this site depends on:

| | What it is | Where it ends up |
|---|---|---|
| **The component set** | One node per component, with its variant properties | Each component's *Design* tab, and the props it ships |
| **The variables** | Primitives, semantic aliases, and 7 modes | `tokens/tokens.json` → `build/tokens/` → `dist/tokens.css` |

:::caution[Check your access before you rely on the embeds]
Every component page on this site embeds the Figma node beside the code. A Figma
embed renders for whoever can already open the file — if it is not shared to
*anyone with the link*, the frame shows a sign-in wall instead, and nothing in the
build can tell the two apart because the URL is valid either way.

If the Design tabs are asking you to sign in, that is a sharing setting on the
file, not a fault on this site. [Embedding](/help/embedding/) has the detail.
:::

## The seven modes

The variables define seven modes, and every semantic token is redeclared in all
seven:

`day` · `open` · `morning` · `sunrise` · `sunset` · `overcast` · `night`

Design in whichever one the screen is actually for, and check the others before
calling it done. A component binds a token *name*, never a value, so a tone that
reads correctly in `day` and disappears in `night` is a token problem you can only
see by switching modes — the component will render both faithfully.

**A token that exists in one mode and not another is a design gap.** Report it.
Filling it in downstream produces a value nobody chose, in a file that is
regenerated on the next export.

## Naming is a contract, not a preference

Prop names and values mirror the Figma property names exactly. If the node says
`Size`, the prop is `size`; if a variant is `Ghost`, the value is `'Ghost'`. That
rule exists so a design change and a code change stay one conversation rather
than two.

Which is why the three places code diverges are worth knowing before you find
them:

| Figma says | Code ships | Why |
|---|---|---|
| `ChipTone` value `Figma` | `'Quiet'` | A public type naming the design tool told a consumer neither what the tone means nor what it looks like |
| `Eyebrow`'s first variant is `Agentic` | defaults to `'Sky'` | An eyebrow with no tone set should be the ordinary one, not the AI-moment one |
| `IconSlot` exposes only `Size` | no `label` prop | `aria-label` already did the job; a second name for it collided with `label` on every other component |

All three were ruled by a human and are recorded in `decisions.md` with the
reasoning. They are not drift, and re-reporting them is the thing that file exists
to stop. **Any *other* divergence is a finding** — one is a decision, two is a
broken pipeline.

## Exporting tokens

The token pipeline reads a committed file, never a live Figma connection:

1. Export the variables with the **Design Tokens** plugin.
2. Replace `tokens/tokens.json` in the repository.
3. Run `npm run build:tokens`.

Step 3 rewrites `build/tokens/`, which is generated and **never edited by hand**.
A value that is wrong is wrong in Figma; fixing it anywhere downstream lasts
exactly until the next export.

## What design owns, and what it does not

A human designs, exports the tokens, and marks the design done. No agent does any
of those. Everything after — building, testing, shipping, documenting, preparing a
release — is an agent with a single job and a column in the registry it is allowed
to write.

The one thing worth being deliberate about: **marking a design done starts the
pipeline.** An engineer picks up the row, builds against the node as it stands,
and QA tests the build against that same node. A node changed after it is marked
done produces a component that is correct against a design nobody is looking at
any more.

## Known limits of the current release

- **Colour contrast is out of scope for `0.1.0`, repo-wide.** Several tone-on-surface
  pairs fall below WCAG AA in several modes. It is measured and ruled, not
  overlooked — and each component's page states its own case rather than hiding
  it. Every *other* accessibility question is still live.
- **`--color-accent-ink` lags Figma.** Code resolves `#1a78bd`; the live variable
  reads `#166fb2`. One known-stale value is a recorded decision; a second one
  would be a broken export.
- **`Eyebrow`'s mark renders narrower than its design**, because the bound typeface
  carries no glyph for it. The fix is upstream in the type or the export, not in
  the component.

---

Next: [Start coding](/developing/introduction/) if you are also implementing, or
[Components](/core/components/overview/) for what each one is actually for.
