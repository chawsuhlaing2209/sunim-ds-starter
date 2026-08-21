---
title: Request a feature
description: How to ask for a component, a variant or a token — and what evidence turns a request into something the crew can act on.
sidebar:
  order: 4
---

**[Open an issue →](https://github.com/chawsuhlaing2209/sunim-ds-starter/issues/new)**

Four components do not cover a product. A gap is a gap to raise rather than
something to fill in locally — a component copied into an application stops
following the tokens the moment the palette moves, and nothing tells you.

## The one thing worth attaching

**The screen you were building when you needed it.**

A request describing a component is a guess about the solution. A request
describing the screen is the problem, and the problem is what the design work
starts from. "We need a Tag component" and "here is a row of removable filters the
user applies to a table, and here is what I built instead" are the same request,
and only the second one can be designed against.

If you already built something locally to get past it: **attach that.** Nobody is
going to be annoyed. A component several people have each rebuilt privately is the
clearest evidence a design system is missing one, and the local versions show what
it actually has to do.

## What to write

```markdown
**What I was building**
A filter bar above a table. Up to eight active filters, each removable.

**What I reached for**
Chip — but it is non-interactive by design, ships no focus appearance,
and does not truncate. Its own page says not to make it interactive.

**What I built instead**
[link to the code, or a screenshot]

**How often this comes up**
Three screens so far in this product.

**What it would have to do**
Keyboard-removable, visible focus, truncate at a max width,
and follow the tone tokens Chip already uses.
```

The section people skip is the third one. It is the most useful.

## Kinds of request, and where each one goes

| You are asking for | Who decides | What happens |
|---|---|---|
| **A new component** | A human designs it. No agent does | Figma node → engineer → QA → deploy → docs → release review |
| **A variant or state on an existing component** | A human, in Figma | The prop follows the node, exactly. Prop names mirror Figma property names by rule |
| **A token, or a value change** | A human, in the Figma variables | Re-exported to `tokens/tokens.json`, rebuilt. Never edited downstream |
| **A mode** | A human, in Figma | All seven modes come from the variables, and a token missing from one is a design gap |
| **An API change to something already public** | A human | This is a release decision. Below `1.0.0` a rename is a minor bump — see [Versioning](/get-started/versioning/) |
| **A doc page or an example** | Depends on the page | Some are generated and some are not — [Contributing](/help/contributing/) says which |

The pattern is not an accident: **every one of them starts with a human.** Design
is the only human step in this pipeline, and everything downstream of it is an
agent with one job. A request lands in the one place the system has no automation
for on purpose.

## Things already known to be missing

Raising one of these again is still useful — it adds evidence — but you will not be
telling anyone something new:

- **An icon set.** `IconSlot` ships a placeholder arrow, which is why it is the one
  component marked `experimental`, and both `Button` and `Chip` render it on their
  default path.
- **Something that looks like a Button and navigates like a link.** `Button`
  renders a native `<button>` with no `as` prop and no `href`.
- **A `Chip` that truncates.** A long label grows the pill past its container.
- **Focus and shadow values per mode.** `effect.*` is declared once and identical
  in all seven — the focus ring is the same blue at night as at noon.

The [Roadmap](/get-started/roadmap/) carries these and the rest, with what each one
is currently blocked on.

## What will get declined

Two, stated so a decline is never a surprise:

- **A prop that renames a Figma property.** Prop names match the node exactly, so
  the design change and the code change stay one conversation. Three values
  deliberately diverge and every one of them was ruled by a human and written
  down — that is the mechanism for it, not a precedent to cite.
- **A dependency to solve something the stack already solves.** This repository is
  the component library; a UI library added to it is the thing being documented,
  twice.
